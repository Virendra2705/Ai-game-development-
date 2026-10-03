import {
  ProductionHealthStatus,
  ProductionTimelineEvent,
  EnvironmentType,
} from '../types';

export class MonitoringService {
  private timelineEvents: Map<string, ProductionTimelineEvent[]> = new Map();
  private monitoringEnabled: Map<string, boolean> = new Map();

  constructor() {
    this.monitoringEnabled.set('proj-embervale', true);
    this.monitoringEnabled.set('proj-survival', false);
    this.monitoringEnabled.set('proj-merge', false);

    this.seedTimeline('proj-embervale');
  }

  private seedTimeline(projectId: string) {
    const events: ProductionTimelineEvent[] = [
      {
        id: 'evt-1',
        projectId,
        timestamp: '2026-09-10T10:00:00Z',
        type: 'RELEASE_CREATED',
        title: 'Release Candidate v1.0.0 Created',
        details: 'Initial build artifact packaged with Godot 4.3 Android & PC targets.',
        sourceRef: 'rel-embervale-v100',
        severity: 'INFO',
      },
      {
        id: 'evt-2',
        projectId,
        timestamp: '2026-09-10T13:30:00Z',
        type: 'APPROVAL_GRANTED',
        title: 'Human Release Approval Granted',
        details: 'Signed off by Alex Vance (Lead Game Producer) after 42 integration tests passed.',
        sourceRef: 'appr-rel-embervale-v100',
        severity: 'SUCCESS',
      },
      {
        id: 'evt-3',
        projectId,
        timestamp: '2026-09-10T14:30:00Z',
        type: 'PRODUCTION_BUILD_COMPLETED',
        title: 'Production Artifact Generated',
        details: 'Checksum sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 verified.',
        sourceRef: 'art-embervale-v100',
        severity: 'SUCCESS',
      },
      {
        id: 'evt-4',
        projectId,
        timestamp: '2026-09-10T14:45:00Z',
        type: 'DEPLOYMENT_VERIFIED',
        title: 'Production Fleet Deployed & Verified',
        details: 'Smoke tests verified character spawn, physics ticks, and save game sync.',
        sourceRef: 'dep-embervale-100',
        severity: 'SUCCESS',
      },
      {
        id: 'evt-5',
        projectId,
        timestamp: '2026-09-18T03:12:00Z',
        type: 'CRASH_DETECTED',
        title: 'NullReferenceException in KineticNet.cs',
        details: 'Captured during creature capture state transition in low-memory condition.',
        sourceRef: 'crash-001',
        severity: 'WARNING',
      },
      {
        id: 'evt-6',
        projectId,
        timestamp: '2026-09-18T03:30:00Z',
        type: 'INCIDENT_CREATED',
        title: 'Incident INC-101 Logged (Medium Severity)',
        details: 'Investigation assigned: Sparkit net trapping null check on despawned entity.',
        sourceRef: 'inc-101',
        severity: 'WARNING',
      },
    ];

    this.timelineEvents.set(projectId, events);
  }

  isMonitoringConfigured(projectId: string): boolean {
    return this.monitoringEnabled.get(projectId) ?? false;
  }

  setMonitoringConfigured(projectId: string, enabled: boolean) {
    this.monitoringEnabled.set(projectId, enabled);
  }

  getHealthStatus(projectId: string): ProductionHealthStatus {
    const isConfigured = this.isMonitoringConfigured(projectId);
    if (!isConfigured) {
      return {
        overall: 'UNKNOWN',
        availability: 0,
        errorRate: 0,
        activeIncidents: 0,
        openCrashes: 0,
        recentFeedbackCount: 0,
        monitoringConfigured: false,
        lastCheckedAt: new Date().toISOString(),
      };
    }

    return {
      overall: 'HEALTHY',
      availability: 99.94,
      errorRate: 0.06,
      activeIncidents: 1,
      openCrashes: 1,
      recentFeedbackCount: 8,
      monitoringConfigured: true,
      lastCheckedAt: new Date().toISOString(),
    };
  }

  getTimeline(projectId: string): ProductionTimelineEvent[] {
    return this.timelineEvents.get(projectId) || [];
  }

  recordEvent(event: Omit<ProductionTimelineEvent, 'id' | 'timestamp'>): ProductionTimelineEvent {
    const newEvent: ProductionTimelineEvent = {
      id: `evt-${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      ...event,
    };

    const list = this.getTimeline(event.projectId);
    list.unshift(newEvent);
    this.timelineEvents.set(event.projectId, list);
    return newEvent;
  }
}

export const monitoringService = new MonitoringService();
