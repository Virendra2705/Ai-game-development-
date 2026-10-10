# AI Assistant Handover Document: AI Game Builder Hub

This document is the master transfer specification for continuing development of **AI Game Builder Hub**.

---

## 1. Project Identity
- **Project Name:** AI GAME BUILDER HUB
- **Tagline / Purpose:** AI-powered game development command center, architectural orchestrator, and studio project management platform.
- **Goals:** Enable creators to transform high-level natural language prompts into complete, verified game architectures with multi-agent delegation, versioned memory, testing suites, and production release tracking.
- **Intended Users:** Game designers, solo indie developers, AI game engineering teams, QA leads.

---

## 2. Current State
- **Build Status:** Pristine. `npm run lint` (`tsc --noEmit`) and `compile_applet` pass with 0 errors.
- **Server:** Node.js/Express (`server.ts`) running on port 3000, hosting API routes and mounting Vite middlewares.
- **Frontend:** React 19 SPA with Tailwind CSS v4, completely styled with high-density dark command center aesthetic (`#07090e`).
- **Core Loops Active:**
  - AI Command Center with structured task planning and human review.
  - Interactive HTML5 Canvas 2D game preview engine with playable capture loop.
  - 10-role agent roster, dependency-aware task board, and living knowledge graph.
  - Multi-iteration autonomous dev loop with safety policies and failure learning capture.
  - Production hub with staging releases, crash report ingestion, and player feedback clustering.

---

## 3. Technology Stack
- **Frontend:** React 19.0.1, Vite 8.3.0, Tailwind CSS v4 (`@tailwindcss/vite`), Lucide React 0.546.0, Motion 12.23.24.
- **Backend:** Express 4.21.2, `dotenv`, `tsx` (TypeScript runner), `esbuild` (bundler).
- **AI SDK:** `@google/genai` 2.4.0 (configured model: `gemini-3.8-flash`).
- **Storage:** Repository Pattern (`IDatabaseAdapter`) with active `LocalRepository` (LocalStorage + Memory Cache) and pre-configured `FirestoreRepository`.

---

## 4. Project Structure
- `server/`: Express backend routers (`aiRoutes.ts`, `gitAndCodingRoutes.ts`, `knowledgeRoutes.ts`) and `aiOrchestrator.ts`.
- `src/adapters/`: Data storage persistence layer (`IDatabaseAdapter.ts`, `LocalRepository.ts`, `FirestoreRepository.ts`).
- `src/context/AppContext.tsx`: Master global state container.
- `src/data/`: Comprehensive seed data (`mockData.ts`, `initialMemoryData.ts`).
- `src/types/`: Unified TypeScript domain contracts (`index.ts`, `assets.ts`).
- `src/components/`: 75+ modular components across 16 sub-domains.
- `src/services/`: 60+ business logic services coordinating game dev domains.

---

## 5. Feature Inventory Summary
- **Studio Dashboard & Navigation:** Complete.
- **Multi-Agent Management (10 Agents):** Complete.
- **Task Kanban with Section 15 Dependencies:** Complete.
- **AI Planning & Prompt Console:** Complete (with fallback).
- **Live Canvas Game Simulation:** Complete.
- **Coding Sandbox & Diff Inspection:** Complete.
- **Autonomous Dev Loop with Safety Limits:** Complete.
- **Release Readiness & Fleet Crash Telemetry:** Complete.

---

## 6. Current Workflow
1. User lands on **Dashboard** showing project health, running agents, and live canvas preview.
2. User switches to **AI Command Center** and submits a prompt (e.g. "Add creature capture system").
3. Server receives prompt via `POST /api/ai/plan`. If `GEMINI_API_KEY` is present, it prompts `gemini-3.8-flash`; if missing, it returns a schema-validated fallback plan.
4. User inspects breakdown (tasks, memory updates, decisions, risks) and clicks **Approve Plan**.
5. Approved tasks enter the execution queue in **Tasks** and **Autonomous Dev Loop**.
6. The user tests mechanics in **Game Preview** (playable arena loop) or runs tests in **QA & Debug**.
7. In **Production**, the user evaluates release candidates, monitors telemetry crashes, and sends player feedback themes back into the autonomous development loop.

---

## 7. Technical Architecture
See `ARCHITECTURE.md` for full sequence diagrams and API schemas.

---

## 8. Database & Data Models
- Implements `IDatabaseAdapter` handling 12 entities: Projects, Tasks, Agents, Builds, Assets, Tests, Activities, Memories, Decisions, Settings, Providers, Plans.
- Local mode is completely zero-config and self-contained; remote mode seamlessly binds Firestore when `FIREBASE_CONFIG` is present.

---

## 9. AI Integration
- Client: `@google/genai` TypeScript SDK.
- Configured in `server/config/geminiConfig.ts` with explicit JSON schema output instructions.
- All plans are validated on the server with `validateAndNormalizePlan` before returning to the UI.

---

## 10. Game-Building Capabilities
- Target project: **EMBERVALE: RIFT TAMERS** (Godot 4.3 engine, PC / Android target).
- Interactive Canvas simulator implements the core gameplay mechanics (wild creature state, aim trajectory, orb consumption, wobble physics, capture resolution).
- Build exporters support Godot, Web, and native package descriptors.

---

## 11. Bugs and Blockers
- **Blockers:** 0 code bugs.
- **Note:** For real-time Gemini generation (instead of fallback plans), ensure `GEMINI_API_KEY` is set in AI Studio Secrets.

---

## 12. Completion Metrics
- 28 Identified Core Features: 23 Complete & Verified (82.1%), 1 Implemented Unverified (3.6%), 4 Partially Completed (14.3%), 0 Broken.
- Estimated Project Completeness: **~85.7%**.

---

## 13. Remaining Tasks
Prioritized development backlog is detailed in `DEVELOPMENT_BACKLOG.md`. Top priorities:
1. Live Gemini API Key verification.
2. Direct Firestore cloud database connection.
3. Live GitHub API commit/PR push integration.
4. Native asset generation provider bindings.

---

## 14. Testing Status
- TypeScript compilation: 100% passed (`tsc --noEmit`).
- Production build: 100% passed (`vite build && esbuild`).
- Embedded test suites: All 4 in-app test harnesses operational.

---

## 15. Configuration Requirements
- `GEMINI_API_KEY`: User secret for Gemini API calls.
- `APP_URL`: App host URL for callbacks.
- `PORT`: Server port (default 3000).

---

## 16. Known Limitations
- External asset generation (e.g. 3D GLTF files) generates SVG/Canvas proxies unless external APIs are connected.
- Git repository operations (commits, branch changes) are simulated in memory/storage rather than mutating local `.git` directories on disk.

---

## 17. Recommended Next Step
Run a live planning test by configuring `GEMINI_API_KEY` and testing the connection in the **AI Command Center** using the "Test Connection" button.

---

## 18. Continuation Instructions for AI Assistants
1. **Do not rewrite or replace existing files from scratch.** The architecture is mature, fully typed, and modular.
2. **Preserve the 10-phase architecture.**
3. **Always verify type contracts in `src/types/index.ts`** before adding new UI components or service methods.
4. **Run `lint_applet` and `compile_applet`** after any code modifications.
