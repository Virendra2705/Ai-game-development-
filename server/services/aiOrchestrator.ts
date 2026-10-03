import { GoogleGenAI } from '@google/genai';
import { GEMINI_CONFIG } from '../config/geminiConfig';

export interface PlanRequestPayload {
  projectId: string;
  projectName: string;
  genre?: string;
  engine?: string;
  platform?: string;
  currentPhase?: string;
  userCommand: string;
  projectMemorySummary?: Array<{ category: string; title: string; content: string }>;
  existingTasks?: Array<{ id: string; title: string; status: string; priority: string }>;
  decisions?: Array<{ title: string; reason: string }>;
  constraints?: string[];
  conversationHistory?: Array<{ role: 'USER' | 'ASSISTANT' | 'SYSTEM'; content: string }>;
}

export interface ValidatedTask {
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dependencies: string[];
  recommendedAgent: string;
}

export interface ValidatedMemoryUpdate {
  category: string;
  title: string;
  content: string;
  rationale?: string;
}

export interface ValidatedDecision {
  title: string;
  reason: string;
}

export interface ValidatedPlanResponse {
  summary: string;
  understanding: string;
  assumptions: string[];
  questions: string[];
  risks: string[];
  recommendedPhase?: string;
  tasks: ValidatedTask[];
  projectMemoryUpdates: ValidatedMemoryUpdate[];
  decisions: ValidatedDecision[];
  nextAction: 'APPROVAL_REQUIRED';
}

const VALID_AGENTS = [
  'Game Architect',
  'Coding Agent',
  'Gameplay Agent',
  'UI/UX Agent',
  'Asset Agent',
  'World Builder',
  'QA Agent',
  'Debug Agent',
  'Optimization Agent',
];

const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export class AIOrchestratorService {
  private aiClient: GoogleGenAI | null = null;

  private getClient(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GEMINI_API_KEY') {
      return null;
    }

    if (!this.aiClient) {
      this.aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }

    return this.aiClient;
  }

  public isConnected(): { connected: boolean; provider: string; model: string; message?: string } {
    const client = this.getClient();
    if (!client) {
      return {
        connected: false,
        provider: GEMINI_CONFIG.providerName,
        model: GEMINI_CONFIG.model,
        message: 'Gemini is not connected. Configure GEMINI_API_KEY in the Settings > Secrets panel.',
      };
    }
    return {
      connected: true,
      provider: GEMINI_CONFIG.providerName,
      model: GEMINI_CONFIG.model,
    };
  }

  public async testConnection(): Promise<{ success: boolean; model: string; latencyMs: number; message: string }> {
    const client = this.getClient();
    if (!client) {
      return {
        success: false,
        model: GEMINI_CONFIG.model,
        latencyMs: 0,
        message: 'Gemini is not connected. GEMINI_API_KEY environment variable is missing or placeholder.',
      };
    }

    const start = Date.now();
    try {
      const response = await client.models.generateContent({
        model: GEMINI_CONFIG.model,
        contents: 'Respond with the single word "READY" if you are active as the Game Architect.',
      });

      const text = response.text || '';
      const latencyMs = Date.now() - start;

      return {
        success: true,
        model: GEMINI_CONFIG.model,
        latencyMs,
        message: `Connection verified in ${latencyMs}ms. Response: ${text.trim()}`,
      };
    } catch (err: any) {
      return {
        success: false,
        model: GEMINI_CONFIG.model,
        latencyMs: Date.now() - start,
        message: err.message || 'Failed to ping Gemini API',
      };
    }
  }

  /**
   * Builds compact, relevant context from project data without blasting entire DB
   */
  private buildCompactContext(payload: PlanRequestPayload): string {
    const queryKeywords = payload.userCommand.toLowerCase().split(/\W+/).filter(Boolean);

    // Filter relevant memories matching user query keywords
    const relevantMemories = (payload.projectMemorySummary || [])
      .filter((m) => {
        const text = `${m.title} ${m.category} ${m.content}`.toLowerCase();
        return queryKeywords.some((k) => k.length > 3 && text.includes(k));
      })
      .slice(0, 6);

    // Filter relevant active tasks
    const relevantTasks = (payload.existingTasks || []).slice(0, 8);

    // Filter relevant decisions
    const relevantDecisions = (payload.decisions || []).slice(0, 4);

    return `
=== TARGET GAME PROJECT ===
Project: ${payload.projectName} (ID: ${payload.projectId})
Genre: ${payload.genre || '3D Open World RPG'}
Engine: ${payload.engine || 'Godot 4.3'}
Platform: ${payload.platform || 'Android / PC'}
Current Development Phase: ${payload.currentPhase || '4. GAMEPLAY'}

=== KNOWN CONSTRAINTS ===
${(payload.constraints && payload.constraints.length > 0) ? payload.constraints.map((c) => `- ${c}`).join('\n') : '- Mobile target (under 120 draw calls per frame)\n- Keep touch screen controls responsive'}

=== RELEVANT PROJECT MEMORY ===
${relevantMemories.length > 0 ? relevantMemories.map((m) => `[${m.category}] ${m.title}: ${m.content.slice(0, 200)}`).join('\n') : '(No conflicting system overrides logged)'}

=== EXISTING TASKS (CONTEXT) ===
${relevantTasks.length > 0 ? relevantTasks.map((t) => `- [${t.status}] ${t.title} (Priority: ${t.priority})`).join('\n') : '(None)'}

=== ARCHITECTURAL DECISIONS ===
${relevantDecisions.length > 0 ? relevantDecisions.map((d) => `- ${d.title}: ${d.reason}`).join('\n') : '(None)'}

=== AVAILABLE SPECIALIZED AGENTS ===
- Game Architect (High-level architecture, system design)
- Coding Agent (GDScript/C# core engine implementation)
- Gameplay Agent (Gameplay loops, stats, player controllers)
- UI/UX Agent (Touchscreen layouts, HUD, menus)
- Asset Agent (Sprites, 3D models, audio, VFX)
- World Builder (Levels, environment, terrain, spawners)
- QA Agent (Test suites, edge-case assertions)
- Debug Agent (Bug investigation, crash fixes)
- Optimization Agent (Performance profiling, draw calls, LODs)
`;
  }

  /**
   * Main Plan Generation Flow
   */
  public async generatePlan(payload: PlanRequestPayload): Promise<ValidatedPlanResponse> {
    const client = this.getClient();

    // If Gemini key is not configured, return a structured fallback response that informs the user cleanly
    if (!client) {
      return this.generateFallbackPlan(payload, 'Gemini is not connected. Configure GEMINI_API_KEY in Settings > Secrets to activate real-time Gemini planning.');
    }

    const context = this.buildCompactContext(payload);
    const userPrompt = `
${context}

=== USER DEVELOPMENT COMMAND ===
"${payload.userCommand}"

Analyze the project context, design a small, focused set of implementation tasks, identify task dependencies, assign each task to the most appropriate agent, and propose memory updates or decisions if applicable.
Return ONLY valid JSON according to the instructed schema.
`;

    try {
      const response = await client.models.generateContent({
        model: GEMINI_CONFIG.model,
        contents: userPrompt,
        config: {
          systemInstruction: GEMINI_CONFIG.systemInstruction,
          temperature: GEMINI_CONFIG.temperature,
          responseMimeType: 'application/json',
        },
      });

      const rawText = response.text;
      if (!rawText) {
        throw new Error('Gemini returned an empty response.');
      }

      // Parse and validate response
      return this.validateAndNormalizePlan(rawText, payload);
    } catch (error: any) {
      console.error('[AI Orchestrator] Gemini error:', error);
      // Return safe recoverable plan so user data is never lost and UI receives actionable guidance
      return this.generateFallbackPlan(payload, `Gemini request failed: ${error.message || 'Unknown network error'}. Your project data has not been changed.`);
    }
  }

  /**
   * Multi-turn chat refinement
   */
  public async chatRefinePlan(payload: {
    projectId: string;
    projectName: string;
    userMessage: string;
    currentPlan?: ValidatedPlanResponse;
    history: Array<{ role: 'USER' | 'ASSISTANT' | 'SYSTEM'; content: string }>;
  }): Promise<{ reply: string; updatedPlan?: ValidatedPlanResponse }> {
    const client = this.getClient();
    if (!client) {
      return {
        reply: 'Gemini is not connected. Please configure GEMINI_API_KEY in the Settings > Secrets panel to chat with the Game Architect.',
      };
    }

    const conversationContext = payload.history
      .slice(-6)
      .map((m) => `${m.role === 'USER' ? 'User' : 'Architect'}: ${m.content}`)
      .join('\n');

    const prompt = `
You are the Game Development Architect for project "${payload.projectName}".
Current Plan in Discussion:
${payload.currentPlan ? JSON.stringify(payload.currentPlan, null, 2) : 'No plan created yet.'}

Recent Conversation:
${conversationContext}

User Follow-up:
"${payload.userMessage}"

If the user is asking to modify, expand, or adjust the plan (e.g. "also make the creature escape on fail" or "add a cooldown"), provide a brief conversational response explaining the architectural change, followed by the complete updated plan as a JSON block wrapped in \`\`\`json ... \`\`\`.
If the user is just asking a question, reply concisely with game architecture advice.
`;

    try {
      const response = await client.models.generateContent({
        model: GEMINI_CONFIG.model,
        contents: prompt,
        config: {
          systemInstruction: GEMINI_CONFIG.systemInstruction,
          temperature: 0.3,
        },
      });

      const text = response.text || '';
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/(\{[\s\S]*"tasks"[\s\S]*\})/);

      let updatedPlan: ValidatedPlanResponse | undefined;
      let replyText = text;

      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          updatedPlan = this.validateAndNormalizePlan(JSON.stringify(parsed), {
            projectId: payload.projectId,
            projectName: payload.projectName,
            userCommand: payload.userMessage,
          });
          replyText = text.replace(jsonMatch[0], '').trim();
          if (!replyText) {
            replyText = `Updated the development plan to include "${payload.userMessage}". Please review the proposed tasks below.`;
          }
        } catch {
          // Keep raw text as reply if JSON extract fails
        }
      }

      return {
        reply: replyText || 'Plan updated. Review the revised tasks in the approval queue.',
        updatedPlan,
      };
    } catch (error: any) {
      return {
        reply: `Gemini encountered an issue: ${error.message || 'Connection error'}. Your project data has not been changed.`,
      };
    }
  }

  /**
   * Validates and normalizes raw JSON response from Gemini
   */
  private validateAndNormalizePlan(rawJson: string, payload: PlanRequestPayload): ValidatedPlanResponse {
    let parsed: any;
    try {
      // Remove any accidental markdown wrapping if present
      const cleaned = rawJson.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (e: any) {
      throw new Error(`Invalid JSON returned by Gemini: ${e.message}`);
    }

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Malformed AI response: Expected root object.');
    }

    const summary = typeof parsed.summary === 'string' ? parsed.summary : `Development plan for "${payload.userCommand}"`;
    const understanding = typeof parsed.understanding === 'string' ? parsed.understanding : summary;
    const assumptions = Array.isArray(parsed.assumptions) ? parsed.assumptions.filter((a: any) => typeof a === 'string') : [];
    const questions = Array.isArray(parsed.questions) ? parsed.questions.filter((q: any) => typeof q === 'string') : [];
    const risks = Array.isArray(parsed.risks) ? parsed.risks.filter((r: any) => typeof r === 'string') : [];
    const recommendedPhase = typeof parsed.recommendedPhase === 'string' ? parsed.recommendedPhase : payload.currentPhase || '4. GAMEPLAY';

    // Validate tasks
    const rawTasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
    const tasks: ValidatedTask[] = rawTasks.map((t: any, index: number) => {
      const title = typeof t.title === 'string' && t.title.trim() ? t.title.trim() : `Task ${index + 1}: ${payload.userCommand.slice(0, 30)}`;
      const description = typeof t.description === 'string' ? t.description : `Implementation of ${title}`;
      
      let priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM';
      if (typeof t.priority === 'string' && VALID_PRIORITIES.includes(t.priority.toUpperCase())) {
        priority = t.priority.toUpperCase() as any;
      }

      const dependencies = Array.isArray(t.dependencies)
        ? t.dependencies.filter((d: any) => typeof d === 'string' && d.trim().length > 0)
        : [];

      let recommendedAgent = 'Game Architect';
      if (typeof t.recommendedAgent === 'string' && VALID_AGENTS.includes(t.recommendedAgent)) {
        recommendedAgent = t.recommendedAgent;
      } else if (typeof t.recommendedAgent === 'string') {
        const found = VALID_AGENTS.find((a) => a.toLowerCase().includes(t.recommendedAgent.toLowerCase()));
        if (found) recommendedAgent = found;
      }

      return {
        title,
        description,
        priority,
        dependencies,
        recommendedAgent,
      };
    });

    if (tasks.length === 0) {
      tasks.push({
        title: `Plan ${payload.userCommand.slice(0, 40)}`,
        description: `Architecture and implementation breakdown for ${payload.userCommand}`,
        priority: 'HIGH',
        dependencies: [],
        recommendedAgent: 'Game Architect',
      });
    }

    // Validate memory updates
    const rawMemory = Array.isArray(parsed.projectMemoryUpdates) ? parsed.projectMemoryUpdates : [];
    const projectMemoryUpdates: ValidatedMemoryUpdate[] = rawMemory.map((m: any) => ({
      category: typeof m.category === 'string' ? m.category : 'GAMEPLAY_SYSTEMS',
      title: typeof m.title === 'string' ? m.title : 'Proposed System Update',
      content: typeof m.content === 'string' ? m.content : '',
      rationale: typeof m.rationale === 'string' ? m.rationale : undefined,
    })).filter((m: ValidatedMemoryUpdate) => m.content.length > 0);

    // Validate decisions
    const rawDecisions = Array.isArray(parsed.decisions) ? parsed.decisions : [];
    const decisions: ValidatedDecision[] = rawDecisions.map((d: any) => ({
      title: typeof d.title === 'string' ? d.title : 'Architectural Decision',
      reason: typeof d.reason === 'string' ? d.reason : 'Ensures modular system isolation.',
    })).filter((d: ValidatedDecision) => d.title.length > 0);

    return {
      summary,
      understanding,
      assumptions,
      questions,
      risks,
      recommendedPhase,
      tasks,
      projectMemoryUpdates,
      decisions,
      nextAction: 'APPROVAL_REQUIRED',
    };
  }

  /**
   * Deterministic fallback plan when key is missing or offline
   */
  private generateFallbackPlan(payload: PlanRequestPayload, note: string): ValidatedPlanResponse {
    const cmd = payload.userCommand.toLowerCase();
    const isCapture = cmd.includes('capture') || cmd.includes('creature') || cmd.includes('rift');

    if (isCapture) {
      return {
        summary: `Structured development plan for creature capture system using Rift Orbs on weakened creatures. [Note: ${note}]`,
        understanding: 'The player requires a capture mechanic that activates when a target creature reaches a weakened health threshold. The system must verify inventory for Rift Orbs, play a throw arc, evaluate probability math, and update persistent creature storage.',
        assumptions: [
          'Creatures have a current_health and max_health property exposed via combat component',
          'Rift Orbs are tracked in the player inventory database item dictionary',
          'Captures can succeed or fail based on health percentage and orb capture tier',
        ],
        questions: [
          'Should failed captures consume the Rift Orb or return a damaged fragment?',
          'What happens when the player party is at maximum creature capacity (6/6)?',
        ],
        risks: [
          'Physics raycasting for projectile trajectory on high-slope terrain could clip geometry',
          'Mobile memory spikes if creature catch VFX spawns unpooled particle instances',
        ],
        recommendedPhase: '4. GAMEPLAY',
        tasks: [
          {
            title: 'Capture state system & target health threshold check',
            description: 'Implement capture-readiness state machine in creature entity base class. Enable target highlight when health <= 35%.',
            priority: 'HIGH',
            dependencies: [],
            recommendedAgent: 'Gameplay Agent',
          },
          {
            title: 'Rift Orb inventory integration & projectile throw arc',
            description: 'Consume Rift Orb from inventory stack upon throw initiation. Calculate parabolic trajectory with terrain collision raycast.',
            priority: 'HIGH',
            dependencies: ['Capture state system & target health threshold check'],
            recommendedAgent: 'Coding Agent',
          },
          {
            title: 'Capture probability calculation & shake sequence',
            description: 'Evaluate probability curve: P = ((MaxHP*3 - CurHP*2) * CatchRate) / (MaxHP*3). Drive 3-stage wobble timer.',
            priority: 'MEDIUM',
            dependencies: ['Rift Orb inventory integration & projectile throw arc'],
            recommendedAgent: 'Gameplay Agent',
          },
          {
            title: 'Capture animation & optical dissolve VFX',
            description: 'Trigger suction particle mesh and crystalline stasis shader when creature enters the Rift Orb radius.',
            priority: 'MEDIUM',
            dependencies: ['Capture probability calculation & shake sequence'],
            recommendedAgent: 'Asset Agent',
          },
          {
            title: 'Creature storage & party roster save integration',
            description: 'Serialize captured creature UUID, IV stats, and level into active player save file or send to sanctuary vault.',
            priority: 'HIGH',
            dependencies: ['Capture probability calculation & shake sequence'],
            recommendedAgent: 'Coding Agent',
          },
          {
            title: 'Capture HUD overlay & mobile touch aiming reticle',
            description: 'Render lock-on indicator, capture chance tier badge, and radial quick-throw touch control for mobile.',
            priority: 'MEDIUM',
            dependencies: ['Capture state system & target health threshold check'],
            recommendedAgent: 'UI/UX Agent',
          },
          {
            title: 'Capture mechanic integration & edge-case test suite',
            description: 'Automated test suite verifying orb consumption, zero-health edge cases, party overflow, and save file durability.',
            priority: 'HIGH',
            dependencies: ['Creature storage & party roster save integration'],
            recommendedAgent: 'QA Agent',
          },
        ],
        projectMemoryUpdates: [
          {
            category: 'GAMEPLAY_SYSTEMS',
            title: 'Creature Capture Mechanics & Rift Orb Interaction',
            content: 'Creatures with <= 35% HP can be targeted with Rift Orbs. Capture rate depends on creature rarity tier, remaining health percentage, and orb potency.',
            rationale: 'Establishes core design rule so all subsequent agent tasks align with the probability formula.',
          },
        ],
        decisions: [
          {
            title: 'Separate capture state controller from battle logic',
            reason: 'Allows capture mechanics and throwing trajectories to evolve independently from turn-based and active combat cycles.',
          },
        ],
        nextAction: 'APPROVAL_REQUIRED',
      };
    }

    // Generic fallback breakdown
    return {
      summary: `Structured development plan for "${payload.userCommand}". [Note: ${note}]`,
      understanding: `The user requested implementation of "${payload.userCommand}". This involves system specification, core implementation, UI feedback, and verification.`,
      assumptions: [
        'Feature will integrate into existing game architecture without breaking current save states.',
        'Target platform constraints (mobile performance budget) must be respected.',
      ],
      questions: [
        'Are there specific visual or audio assets already designated for this mechanic?',
      ],
      risks: [
        'Ensure performance stays within the 120 draw-call mobile budget.',
      ],
      recommendedPhase: payload.currentPhase || '4. GAMEPLAY',
      tasks: [
        {
          title: `Architecture specification for ${payload.userCommand.slice(0, 30)}`,
          description: `Define data structures, API contracts, and event hooks for ${payload.userCommand}`,
          priority: 'HIGH',
          dependencies: [],
          recommendedAgent: 'Game Architect',
        },
        {
          title: `Core logic implementation for ${payload.userCommand.slice(0, 30)}`,
          description: `Implement GDScript/C# engine logic and event handlers for ${payload.userCommand}`,
          priority: 'HIGH',
          dependencies: [`Architecture specification for ${payload.userCommand.slice(0, 30)}`],
          recommendedAgent: 'Coding Agent',
        },
        {
          title: `UI integration & touchscreen feedback for ${payload.userCommand.slice(0, 30)}`,
          description: `Build user interface controls, HUD elements, and responsive touch layout`,
          priority: 'MEDIUM',
          dependencies: [`Core logic implementation for ${payload.userCommand.slice(0, 30)}`],
          recommendedAgent: 'UI/UX Agent',
        },
        {
          title: `QA assertion & regression test suite for ${payload.userCommand.slice(0, 30)}`,
          description: `Verify edge cases, null checks, and performance stability`,
          priority: 'MEDIUM',
          dependencies: [`Core logic implementation for ${payload.userCommand.slice(0, 30)}`],
          recommendedAgent: 'QA Agent',
        },
      ],
      projectMemoryUpdates: [
        {
          category: 'TECHNICAL_ARCHITECTURE',
          title: `System Architecture: ${payload.userCommand.slice(0, 30)}`,
          content: `Implemented as an isolated subsystem communicating via decoupled event signals.`,
          rationale: 'Preserves project modularity and testability.',
        },
      ],
      decisions: [
        {
          title: `Modular decoupling for ${payload.userCommand.slice(0, 30)}`,
          reason: 'Prevents monolithic dependencies across game engine components.',
        },
      ],
      nextAction: 'APPROVAL_REQUIRED',
    };
  }
}

export const aiOrchestratorService = new AIOrchestratorService();
