import {
  PreviewSession,
  PreviewProviderType,
  RuntimeLogEntry,
  RuntimeError,
  PreviewScreenshot,
  BuildJob,
} from '../../types';

class PreviewService {
  private sessions: Map<string, PreviewSession> = new Map();
  private errors: Map<string, RuntimeError> = new Map();
  private activeSessionId: string | null = null;
  private listeners: Set<(session: PreviewSession | null) => void> = new Set();
  private runtimeLogListeners: Set<(entry: RuntimeLogEntry) => void> = new Set();

  constructor() {
    this.initSeedSession();
  }

  private initSeedSession() {
    const seed: PreviewSession = {
      id: 'prev-seed-141',
      projectId: 'proj-1',
      buildId: 'build-141',
      platform: 'Web',
      status: 'STOPPED',
      provider: 'InternalWebPreview',
      previewUrl: 'about:blank',
      startedAt: new Date(Date.now() - 3600000).toISOString(),
      stoppedAt: new Date(Date.now() - 3600000 + 180000).toISOString(),
      runtimeDurationSeconds: 180,
      runtimeLogs: [
        { id: 'rl-1', timestamp: '10:01:05', level: 'INFO', category: 'Engine', message: 'Godot 4.3 WebAssembly engine initialized' },
        { id: 'rl-2', timestamp: '10:01:07', level: 'INFO', category: 'Scene', message: 'Loaded res://scenes/world/RiftOverworld.tscn' },
        { id: 'rl-3', timestamp: '10:01:12', level: 'INFO', category: 'Gameplay', message: 'Player spawned at Vector3(0, 1.2, 0)' },
      ],
      errorCount: 0,
      warningCount: 0,
      fps: 60,
      frameTimeMs: 16.6,
      memoryMB: 124,
      screenshots: [],
    };
    this.sessions.set(seed.id, seed);
  }

  getActiveSession(): PreviewSession | null {
    if (!this.activeSessionId) return null;
    return this.sessions.get(this.activeSessionId) || null;
  }

  getSessionById(id: string): PreviewSession | undefined {
    return this.sessions.get(id);
  }

  getAllSessions(projectId?: string): PreviewSession[] {
    const list = Array.from(this.sessions.values());
    if (projectId) {
      return list.filter((s) => s.projectId === projectId).sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
    }
    return list.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }

  // --- Start Preview Session ---
  async startPreview(
    projectId: string,
    build: BuildJob,
    providerType: PreviewProviderType = 'InternalWebPreview'
  ): Promise<PreviewSession> {
    // If native build and not web
    const isNative = build.profile.platform === 'Android' || build.profile.platform === 'PC';
    const effectiveProvider: PreviewProviderType = isNative ? 'NativeDownloadOnly' : providerType;

    const session: PreviewSession = {
      id: `prev-${Date.now()}`,
      projectId,
      buildId: build.id,
      artifactId: build.artifactId,
      platform: build.profile.platform,
      status: 'STARTING',
      provider: effectiveProvider,
      previewUrl: effectiveProvider === 'InternalWebPreview' ? `https://preview.local/embervale/${build.id}` : undefined,
      startedAt: new Date().toISOString(),
      runtimeDurationSeconds: 0,
      runtimeLogs: [],
      errorCount: 0,
      warningCount: 0,
      fps: 59,
      frameTimeMs: 16.9,
      memoryMB: 142,
      screenshots: [],
    };

    this.sessions.set(session.id, session);
    this.activeSessionId = session.id;
    this.notify();

    // Bootstrap logs
    this.addLog(session.id, 'INFO', 'Harness', `Bootstrapping preview environment for [${build.profile.platform}] via ${effectiveProvider}`);

    if (effectiveProvider === 'NativeDownloadOnly') {
      this.addLog(session.id, 'WARNING', 'Platform', 'Native preview environment unavailable. APK or desktop binary must be tested on physical hardware or local emulator.');
      session.status = 'ERROR';
      this.notify();
      return session;
    }

    // Simulate startup sequence
    setTimeout(() => {
      session.status = 'RUNNING';
      this.addLog(session.id, 'INFO', 'Engine', 'Godot 4.3 WebAssembly runtime ready (WebGL2 Context: 60 FPS)');
      this.addLog(session.id, 'INFO', 'Database', 'Loaded CreatureDatabase with 42 entries. Pokedex index initialized.');
      this.addLog(session.id, 'INFO', 'Systems', 'CaptureManager autoload attached to /root/CaptureManager.');
      this.addLog(session.id, 'INFO', 'Scene', 'Spawning Arena scene. Wild entity Luminafox (Lvl 5, HP: 48/50) active.');
      this.notify();
    }, 600);

    return session;
  }

  stopPreview(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    session.status = 'STOPPED';
    session.stoppedAt = new Date().toISOString();
    this.addLog(sessionId, 'INFO', 'Harness', 'Preview session halted by operator.');
    if (this.activeSessionId === sessionId) {
      this.activeSessionId = null;
    }
    this.notify();
  }

  restartPreview(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    session.status = 'STARTING';
    session.runtimeDurationSeconds = 0;
    this.addLog(sessionId, 'INFO', 'Harness', 'Restarting game preview sandbox...');
    this.notify();

    setTimeout(() => {
      session.status = 'RUNNING';
      this.addLog(sessionId, 'INFO', 'Engine', 'Game reload completed successfully.');
      this.notify();
    }, 500);
  }

  // --- Runtime Logs ---
  addLog(
    sessionId: string,
    level: 'INFO' | 'WARNING' | 'ERROR',
    category: string,
    message: string,
    file?: string,
    line?: number
  ): RuntimeLogEntry {
    const session = this.sessions.get(sessionId);
    const entry: RuntimeLogEntry = {
      id: `rl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
      level,
      category,
      message,
      file,
      line,
    };

    if (session) {
      session.runtimeLogs.push(entry);
      if (level === 'ERROR') session.errorCount++;
      if (level === 'WARNING') session.warningCount++;
      this.notify();
    }

    if (level === 'ERROR' && session) {
      this.registerRuntimeError(session.projectId, sessionId, session.buildId, message, file, line);
    }

    this.runtimeLogListeners.forEach((l) => l(entry));
    return entry;
  }

  // --- Screenshots ---
  captureScreenshot(sessionId: string, dataUrl: string, label: string = 'In-game Capture'): PreviewScreenshot {
    const session = this.sessions.get(sessionId);
    const shot: PreviewScreenshot = {
      id: `shot-${Date.now()}`,
      previewId: sessionId,
      timestamp: new Date().toLocaleTimeString(),
      resolution: '1280x720',
      dataUrl,
      label,
    };

    if (session) {
      session.screenshots.push(shot);
      this.addLog(sessionId, 'INFO', 'QA', `Screenshot captured: ${label}`);
      this.notify();
    }
    return shot;
  }

  // --- Runtime Errors ---
  private registerRuntimeError(
    projectId: string,
    previewId: string,
    buildId: string,
    message: string,
    file: string = 'CreatureDatabase.gd',
    line: number = 142
  ): RuntimeError {
    const key = `${message}-${file}-${line}`;
    let existing = this.errors.get(key);

    if (existing) {
      existing.occurrences++;
      existing.lastSeen = new Date().toLocaleTimeString();
      return existing;
    }

    const err: RuntimeError = {
      id: `err-${Date.now()}`,
      projectId,
      previewId,
      buildId,
      severity: 'HIGH',
      message,
      stackTrace: `at ${file}:${line} in register_capture_event()\n  at CreatureCapture.gd:38 in handle_capture_hit()\n  at CaptureManager.gd:42 in attempt_capture()`,
      file,
      line,
      timestamp: new Date().toLocaleTimeString(),
      occurrences: 1,
      firstSeen: new Date().toLocaleTimeString(),
      lastSeen: new Date().toLocaleTimeString(),
    };

    this.errors.set(key, err);
    return err;
  }

  getRuntimeErrors(projectId?: string): RuntimeError[] {
    const list = Array.from(this.errors.values());
    if (projectId) {
      return list.filter((e) => e.projectId === projectId);
    }
    return list;
  }

  // --- Subscriptions ---
  subscribe(listener: (session: PreviewSession | null) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  subscribeLogs(listener: (entry: RuntimeLogEntry) => void): () => void {
    this.runtimeLogListeners.add(listener);
    return () => this.runtimeLogListeners.delete(listener);
  }

  private notify() {
    const current = this.getActiveSession();
    this.listeners.forEach((l) => l(current));
  }
}

export const previewService = new PreviewService();
