# Prioritized Development Backlog: AI Game Builder Hub

This backlog documents unfinished items, recommended production enhancements, and engineering tasks organized by priority.

---

## Priority Definitions
- **P0 (Critical)**: Blockers preventing core execution or causing system instability.
- **P1 (High)**: Core features required to transition simulated workflows into live external infrastructure.
- **P2 (Medium)**: Important enhancements for developer ergonomics, multi-user safety, and pipeline robustness.
- **P3 (Low)**: Polishing touches, extra game templates, and advanced optimizations.

---

## Backlog Items

### P0 — Critical Blockers & Prerequisite Configurations
*(Note: There are currently zero code-level compile or lint blockers in the repository.)*

#### `TASK-P0-01`: Runtime Gemini API Key Injection & Live Verification
- **Status:** Architecture Ready (Fallback Active).
- **Description:** Provide a valid `GEMINI_API_KEY` via AI Studio Secrets to transition the server's `AIOrchestratorService` from deterministic fallback planning to real-time generative multi-turn game design.
- **Affected Files:** `.env.example`, `server/services/aiOrchestrator.ts`, `server/config/geminiConfig.ts`.
- **Acceptance Criteria:** `POST /api/ai/test` returns `{ success: true, latencyMs: <number> }` and plans are generated dynamically by `gemini-3.8-flash`.
- **Priority:** P0 (if live LLM planning is required by user).

---

### P1 — Core Pipeline Enhancements

#### `TASK-P1-01`: Remote Firestore Database Provisioning
- **Status:** Adapter Pre-Configured (`FirestoreRepository.ts`).
- **Description:** Switch persistence from browser `LocalStorage` to Cloud Firestore. When `FIREBASE_CONFIG` is configured, all projects, tasks, memory entries, and builds persist centrally across developer seats and devices.
- **Affected Files:** `src/adapters/FirestoreRepository.ts`, `src/adapters/index.ts`.
- **Prerequisites:** Firebase setup via AI Studio Firebase tools.
- **Acceptance Criteria:** Entities saved in one browser tab reflect in another after refresh without relying on local browser storage.
- **Priority:** P1.

#### `TASK-P1-02`: Live Git Provider Integration (GitHub OAuth & Push)
- **Status:** Simulated (`src/services/gitService.ts`, `server/routes/gitAndCodingRoutes.ts`).
- **Description:** Replace simulated commit hashes and pull request records with genuine GitHub REST/GraphQL API integration using personal access tokens or OAuth.
- **Affected Files:** `server/routes/gitAndCodingRoutes.ts`, `src/services/gitService.ts`.
- **Implementation Approach:** Implement token exchange and repository webhooks for target repos (e.g., `github.com/<owner>/<repo>`), creating real branch refs (`task/*`) and pull requests.
- **Acceptance Criteria:** Tasks committed in the Coding Workspace create real commits in the user's remote Git repository.
- **Priority:** P1.

#### `TASK-P1-03`: Real Asset Generation Provider Bindings
- **Status:** Simulated Fallbacks Active (`src/services/assets/assetProviders.ts`).
- **Description:** Connect the Image, 3D Mesh, and Audio generation slots to external providers (e.g., Imagen / Gemini for 2D sprites, Meshy/Tripo API for 3D GLTF meshes, AudioCraft/ElevenLabs for SFX/Voice).
- **Affected Files:** `src/services/assets/assetProviders.ts`, `src/services/assets/assetAgentService.ts`.
- **Acceptance Criteria:** Submitting an asset prompt in `AssetGenerateModal` produces an authentic downloadable PNG, GLTF, or WAV file adhering to polygon budgets.
- **Priority:** P1.

---

### P2 — Pipeline Ergonomics & Studio Upgrades

#### `TASK-P2-01`: Headless Godot Export Container Integration
- **Status:** Simulated Exporter (`GodotBuildProvider.ts`).
- **Description:** In `GodotBuildProvider.ts`, optionally integrate a headless Docker/Cloud Build pipeline running `godot --headless --export-release "Web"` to compile genuine WebAssembly `.pck` files from project repositories.
- **Affected Files:** `src/services/build/GodotBuildProvider.ts`, `src/services/build/buildPipelineService.ts`.
- **Priority:** P2.

#### `TASK-P2-02`: Real-Time WebSocket Streaming for Autonomous Loop
- **Status:** Polling / Event-Emitters Active.
- **Description:** Replace React event-listener subscriptions with real-time server-sent events (SSE) or WebSockets (`ws`) between `server.ts` and `AutonomousRunController.tsx` for multi-seat studio collaboration.
- **Affected Files:** `server.ts`, `src/services/autonomousDevelopmentService.ts`.
- **Priority:** P2.

#### `TASK-P2-03`: Exportable Postman / OpenAPI Specification
- **Status:** Unimplemented.
- **Description:** Generate an OpenAPI (Swagger) v3 schema for the `/api/*` endpoints (`/api/ai/*`, `/api/repo-info`, `/api/commit`, `/api/knowledge/*`).
- **Affected Files:** `server.ts`.
- **Priority:** P2.

---

### P3 — Polishing & Extended Templates

#### `TASK-P3-01`: Additional Game Genre Scaffolds
- **Status:** 3 Projects Seeded (RPG, Extraction Survival, Casual Merge).
- **Description:** Add pre-configured canon documentation and memory sets for 2D Platformer, Turn-Based Tactics, and Sci-Fi Colony Simulator genres.
- **Affected Files:** `src/data/mockData.ts`, `src/data/initialMemoryData.ts`.
- **Priority:** P3.

#### `TASK-P3-02`: Telemetry Export to Grafana / Datadog Format
- **Status:** Internal format only (`monitoringService.ts`).
- **Description:** Add Prometheus/OpenTelemetry metric export endpoints for fleet error rates and crash frequencies.
- **Affected Files:** `server/routes/`, `src/services/monitoringService.ts`.
- **Priority:** P3.
