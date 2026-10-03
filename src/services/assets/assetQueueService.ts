import { AssetGenerationJob, GenerationJobStatus } from '../../types/assets';

export class AssetQueueService {
  private jobs: Map<string, AssetGenerationJob> = new Map();
  private listeners: Set<(jobs: AssetGenerationJob[]) => void> = new Set();

  constructor() {
    // Seed initial generation queue items (Section 13)
    const initialJobs: AssetGenerationJob[] = [
      {
        jobId: 'job-001',
        assetId: 'asset-sparkit-gen',
        projectId: 'proj-embervale',
        provider: 'Meshy Studio 3D',
        model: 'meshy-v3-game-ready',
        status: 'GENERATING',
        progress: 68,
        prompt: 'Electric fox creature, quadruped, glowing lightning ears, anime stylized, low poly',
        references: ['asset-1', 'ArtDirection-Embervale'],
        startedAt: new Date(Date.now() - 45000).toISOString(),
        outputIds: [],
        costCredits: 8,
      },
      {
        jobId: 'job-002',
        assetId: 'asset-forest-env',
        projectId: 'proj-embervale',
        provider: 'Google Imagen 3',
        model: 'imagen-3.0-generate-002',
        status: 'QUEUED',
        progress: 0,
        prompt: 'Ancient mossy rift gateway ruins with floating rune monoliths, stylized daylight',
        references: ['asset-3'],
        startedAt: new Date(Date.now() - 10000).toISOString(),
        outputIds: [],
        costCredits: 2,
      },
      {
        jobId: 'job-003',
        assetId: 'asset-battle-music',
        projectId: 'proj-embervale',
        provider: 'AudioCraft / MusicLM',
        model: 'audiocraft-stereo-v2',
        status: 'COMPLETED',
        progress: 100,
        prompt: 'Dynamic battle theme with orchestral strings, taiko drums, and energetic 130 BPM tempo',
        references: [],
        startedAt: new Date(Date.now() - 120000).toISOString(),
        completedAt: new Date(Date.now() - 20000).toISOString(),
        outputIds: ['asset-audio-battle-01'],
        costCredits: 3,
      },
      {
        jobId: 'job-004',
        assetId: 'asset-vfx-lightning',
        projectId: 'proj-embervale',
        provider: 'Google Imagen 3',
        model: 'imagen-3.0-generate-002',
        status: 'FAILED',
        progress: 42,
        prompt: 'Elemental lightning sparks particle spritesheet',
        references: [],
        startedAt: new Date(Date.now() - 240000).toISOString(),
        completedAt: new Date(Date.now() - 200000).toISOString(),
        error: 'Provider timeout: GPU queue exceeded peak rate limit. Retry available.',
        outputIds: [],
        costCredits: 0,
      },
    ];

    initialJobs.forEach((j) => this.jobs.set(j.jobId, j));
  }

  getJobs(projectId?: string): AssetGenerationJob[] {
    const all = Array.from(this.jobs.values());
    if (projectId) return all.filter((j) => j.projectId === projectId);
    return all;
  }

  getJobById(jobId: string): AssetGenerationJob | undefined {
    return this.jobs.get(jobId);
  }

  createJob(jobData: Omit<AssetGenerationJob, 'jobId' | 'startedAt' | 'progress' | 'status'>): AssetGenerationJob {
    const newJob: AssetGenerationJob = {
      ...jobData,
      jobId: `job-${Date.now().toString().slice(-4)}`,
      startedAt: new Date().toISOString(),
      progress: 0,
      status: 'QUEUED',
      outputIds: [],
    };
    this.jobs.set(newJob.jobId, newJob);
    this.notify();
    return newJob;
  }

  updateJob(jobId: string, updates: Partial<AssetGenerationJob>) {
    const existing = this.jobs.get(jobId);
    if (!existing) return;
    const updated = { ...existing, ...updates };
    this.jobs.set(jobId, updated);
    this.notify();
  }

  cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) return false;
    job.status = 'CANCELLED';
    job.progress = 0;
    this.notify();
    return true;
  }

  retryJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) return false;
    job.status = 'QUEUED';
    job.progress = 0;
    job.error = undefined;
    job.startedAt = new Date().toISOString();
    this.notify();
    return true;
  }

  pauseJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) return false;
    if (job.status === 'GENERATING') {
      job.status = 'QUEUED';
      this.notify();
      return true;
    }
    return false;
  }

  subscribe(listener: (jobs: AssetGenerationJob[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const all = Array.from(this.jobs.values());
    this.listeners.forEach((fn) => fn(all));
  }
}

export const assetQueueService = new AssetQueueService();
