import { Release, ReleaseChangelogItem } from '../types';
import { taskService } from './taskService';
import { qaAgentService } from './qa/qaAgentService';

export interface GeneratedReleaseNotes {
  version: string;
  releaseTitle: string;
  markdown: string;
  changelog: ReleaseChangelogItem[];
}

export class ReleaseNotesService {
  async generateDraftNotes(projectId: string, version: string, releaseCandidate?: Release): Promise<GeneratedReleaseNotes> {
    const tasks = await taskService.getTasks(projectId);
    const issues = qaAgentService.getIssues(projectId);

    const completedTasks = tasks.filter((t) => t.status === 'COMPLETED' || t.status === 'Completed');
    const resolvedIssues = issues.filter((i) => i.status === 'RESOLVED');

    const changelog: ReleaseChangelogItem[] = [];

    // Map features and tasks
    completedTasks.slice(0, 4).forEach((t) => {
      changelog.push({
        id: `cl-${t.id}`,
        type: t.category === 'Feature' ? 'FEATURE' : t.category === 'Optimization' ? 'PERFORMANCE' : 'IMPROVEMENT',
        title: t.title,
        description: t.description,
        taskId: t.id,
      });
    });

    // Map bugfixes
    resolvedIssues.slice(0, 3).forEach((i) => {
      changelog.push({
        id: `cl-${i.id}`,
        type: 'BUG_FIX',
        title: i.title,
        description: i.description,
        issueId: i.id,
      });
    });

    // Known issues
    const openIssues = issues.filter((i) => i.status === 'OPEN' && i.severity !== 'CRITICAL');
    openIssues.slice(0, 2).forEach((oi) => {
      changelog.push({
        id: `cl-known-${oi.id}`,
        type: 'KNOWN_ISSUE',
        title: oi.title,
        issueId: oi.id,
      });
    });

    // Group items for markdown
    const features = changelog.filter((c) => c.type === 'FEATURE');
    const improvements = changelog.filter((c) => c.type === 'IMPROVEMENT');
    const bugfixes = changelog.filter((c) => c.type === 'BUG_FIX');
    const performance = changelog.filter((c) => c.type === 'PERFORMANCE');
    const known = changelog.filter((c) => c.type === 'KNOWN_ISSUE');

    const lines: string[] = [
      `# Release Notes — v${version}`,
      `*Generated on ${new Date().toLocaleDateString()} for Embervale: Rift Tamers*`,
      '',
    ];

    if (features.length > 0) {
      lines.push('### ✨ New Features');
      features.forEach((f) => lines.push(`- **${f.title}**`));
      lines.push('');
    }

    if (improvements.length > 0) {
      lines.push('### 🚀 Improvements');
      improvements.forEach((f) => lines.push(`- ${f.title}`));
      lines.push('');
    }

    if (bugfixes.length > 0) {
      lines.push('### 🐛 Bug Fixes');
      bugfixes.forEach((f) => lines.push(`- ${f.title}`));
      lines.push('');
    }

    if (performance.length > 0) {
      lines.push('### ⚡ Performance & Engine');
      performance.forEach((f) => lines.push(`- ${f.title}`));
      lines.push('');
    }

    if (known.length > 0) {
      lines.push('### ⚠️ Known Issues');
      known.forEach((f) => lines.push(`- ${f.title} *(Tracking in QA)*`));
      lines.push('');
    }

    return {
      version,
      releaseTitle: `Embervale: Rift Tamers v${version}`,
      markdown: lines.join('\n'),
      changelog,
    };
  }
}

export const releaseNotesService = new ReleaseNotesService();
