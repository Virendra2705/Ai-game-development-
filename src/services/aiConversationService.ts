import { AIConversation, AIMessage, AIPlanResponse } from '../types';

class AIConversationService {
  private getStorageKey(projectId: string): string {
    return `ai_conversations_${projectId}`;
  }

  getConversations(projectId: string): AIConversation[] {
    try {
      const raw = localStorage.getItem(this.getStorageKey(projectId));
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  getActiveConversation(projectId: string): AIConversation {
    const convs = this.getConversations(projectId);
    if (convs.length > 0) {
      return convs[0];
    }
    const newConv: AIConversation = {
      conversationId: `conv-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      projectId,
      title: 'Architect Discussion',
      messages: [
        {
          id: `msg-welcome`,
          role: 'SYSTEM',
          content: 'Game Architect is ready. Enter a feature command or discuss mechanics, constraints, and architecture.',
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.saveConversation(newConv);
    return newConv;
  }

  saveConversation(conv: AIConversation): void {
    try {
      const all = this.getConversations(conv.projectId);
      const idx = all.findIndex((c) => c.conversationId === conv.conversationId);
      if (idx >= 0) {
        all[idx] = conv;
      } else {
        all.unshift(conv);
      }
      localStorage.setItem(this.getStorageKey(conv.projectId), JSON.stringify(all));
    } catch (e) {
      console.warn('Could not save conversation', e);
    }
  }

  async sendMessage(params: {
    projectId: string;
    projectName: string;
    conversationId: string;
    userMessage: string;
    currentPlan?: AIPlanResponse;
  }): Promise<{ replyMessage: AIMessage; updatedPlan?: AIPlanResponse }> {
    const all = this.getConversations(params.projectId);
    let conv = all.find((c) => c.conversationId === params.conversationId);
    if (!conv) {
      conv = this.getActiveConversation(params.projectId);
    }

    const userMsg: AIMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'USER',
      content: params.userMessage,
      timestamp: new Date().toISOString(),
    };

    conv.messages.push(userMsg);
    conv.updatedAt = new Date().toISOString();
    this.saveConversation(conv);

    try {
      const historyPayload = conv.messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: params.projectId,
          projectName: params.projectName,
          userMessage: params.userMessage,
          currentPlan: params.currentPlan,
          history: historyPayload,
        }),
      });

      if (!res.ok) {
        throw new Error(`Chat failed with status ${res.status}`);
      }

      const data = await res.json();
      const assistantMsg: AIMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'ASSISTANT',
        content: data.reply || 'Acknowledged.',
        timestamp: new Date().toISOString(),
        plan: data.updatedPlan,
      };

      conv.messages.push(assistantMsg);
      conv.updatedAt = new Date().toISOString();
      this.saveConversation(conv);

      return {
        replyMessage: assistantMsg,
        updatedPlan: data.updatedPlan,
      };
    } catch (err: any) {
      const errorMsg: AIMessage = {
        id: `msg-${Date.now()}-error`,
        role: 'ASSISTANT',
        content: `Gemini could not complete the request: ${err.message || 'Connection failure'}. Your project data has not been changed.`,
        timestamp: new Date().toISOString(),
      };
      conv.messages.push(errorMsg);
      conv.updatedAt = new Date().toISOString();
      this.saveConversation(conv);

      return {
        replyMessage: errorMsg,
      };
    }
  }

  clearHistory(projectId: string): void {
    localStorage.removeItem(this.getStorageKey(projectId));
  }
}

export const aiConversationService = new AIConversationService();
