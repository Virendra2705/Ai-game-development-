/**
 * Google Gemini Service Placeholder
 * 
 * Phase 2 will replace mock AI orchestration with real AI agents using Gemini 2.5/Flash/Pro models.
 * Used for Game Architecture, Narrative, Level Logic, and High-Level Design.
 */

export interface GeminiPromptRequest {
  systemPrompt: string;
  userPrompt: string;
  context?: Record<string, unknown>;
}

export const geminiService = {
  isConnected: false,
  modelName: 'gemini-2.5-flash',
  
  async generateDesignDoc(request: GeminiPromptRequest): Promise<{ text: string; simulated: boolean }> {
    return {
      text: `[SIMULATED GEMINI RESPONSE] Architecture breakdown for: "${request.userPrompt}". (Gemini API integration will connect in Phase 2 via server-side API proxy).`,
      simulated: true,
    };
  },

  async checkStatus() {
    return {
      connected: false,
      status: 'Not Connected',
      note: 'Configure in Settings > AI Providers in a future phase',
    };
  },
};
