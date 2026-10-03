import { Incident, EnvironmentType } from '../types';
import { rollbackService } from './rollbackService';
import { monitoringService } from './monitoringService';

export class IncidentService {
  private incidents: Map<string, Incident[]> = new Map();

  constructor() {
    this.seedIncidents('proj-embervale');
  }

  private seedIncidents(projectId: string) {
    const inc1: Incident = {
      id: 'inc-101',
      projectId,
      severity: 'HIGH',
      title: 'Crash Rate Spike in Creature Capture Subsystem',
      description:
        'NullReferenceException observed on Android client fleet when trapping Sparkits. 14 crashes logged across 9 users in past 48 hours.',
      affectedRelease: '1.0.0',
      affectedEnvironment: 'PRODUCTION',
      status: 'INVESTIGATING',
      detectedAt: '2026-09-18T03:30:00Z',
      relatedCrashes: ['crash-001'],
      relatedTasks: [],
      timeline: [
        { timestamp: '2026-09-18T03:12:00Z', event: 'First crash event detected by telemetry listener.', actor: 'Crash Reporter' },
        { timestamp: '2026-09-18T03:30:00Z', event: 'Incident INC-101 opened with HIGH severity.', actor: 'Incident Automation' },
        { timestamp: '2026-09-18T03:45:00Z', event: 'AI Crash Analysis completed (Likely cause: despawn race condition).', actor: 'Crash Analysis AI' },
        { timestamp: '2026-09-19T08:00:00Z', event: 'QA replicated issue in Android sandbox test harness.', actor: 'Alex Vance' },
      ],
    };

    this.incidents.set(projectId, [inc1]);
  }

  getIncidents(projectId: string): Incident[] {
    return this.incidents.get(projectId) || [];
  }

  getIncident(projectId: string, id: string): Incident | undefined {
    return this.getIncidents(projectId).find((i) => i.id === id);
  }

  createIncident(data: Omit<Incident, 'id' | 'detectedAt' | 'timeline'>): Incident {
    const newInc: Incident = {
      id: `inc-${Date.now().toString(36)}`,
      detectedAt: new Date().toISOString(),
      timeline: [
        {
          timestamp: new Date().toISOString(),
          event: `Incident created with ${data.severity} severity: ${data.title}`,
          actor: 'System Monitoring',
        },
      ],
      ...data,
    };

    const list = this.getIncidents(data.projectId);
    list.unshift(newInc);
    this.incidents.set(data.projectId, list);

    monitoringService.recordEvent({
      projectId: data.projectId,
      type: 'INCIDENT_CREATED',
      title: `Incident ${newInc.id}: ${newInc.title}`,
      details: newInc.description,
      sourceRef: newInc.id,
      severity: newInc.severity === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
    });

    return newInc;
  }

  updateIncidentStatus(
    projectId: string,
    incidentId: string,
    status: Incident['status'],
    actor: string,
    note?: string
  ): Incident | undefined {
    const inc = this.getIncident(projectId, incidentId);
    if (!inc) return undefined;

    inc.status = status;
    if (status === 'RESOLVED' || status === 'CLOSED') {
      inc.resolvedAt = new Date().toISOString();
    }

    inc.timeline.unshift({
      timestamp: new Date().toISOString(),
      event: `Status changed to ${status}${note ? ` (${note})` : ''}`,
      actor,
    });

    return inc;
  }

  async executeEmergencyRollback(
    projectId: string,
    incidentId: string,
    targetReleaseId: string,
    authorizer: string,
    reason: string
  ): Promise<{ success: boolean; error?: string }> {
    const inc = this.getIncident(projectId, incidentId);
    if (!inc) return { success: false, error: 'Incident not found' };

    const rollbackResult = await rollbackService.executeRollback(
      projectId,
      targetReleaseId,
      `Emergency Rollback triggered by Incident ${incidentId}: ${reason}`,
      authorizer,
      false // requires explicit human approval
    );

    if (!rollbackResult.success) {
      inc.timeline.unshift({
        timestamp: new Date().toISOString(),
        event: `Emergency rollback attempt failed: ${rollbackResult.error}`,
        actor: authorizer,
      });
      return { success: false, error: rollbackResult.error };
    }

    inc.status = 'MITIGATING';
    inc.timeline.unshift({
      timestamp: new Date().toISOString(),
      event: `Emergency rollback executed to Release ${rollbackResult.rollback?.toVersion}. Incident mitigated.`,
      actor: authorizer,
    });

    monitoringService.recordEvent({
      projectId,
      type: 'ROLLBACK',
      title: `Emergency Rollback to v${rollbackResult.rollback?.toVersion}`,
      details: `Mitigated incident ${incidentId}. Authorizer: ${authorizer}`,
      sourceRef: rollbackResult.rollback?.id || incidentId,
      severity: 'WARNING',
    });

    return { success: true };
  }
}

export const incidentService = new IncidentService();
