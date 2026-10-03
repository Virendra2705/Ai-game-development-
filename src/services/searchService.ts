import { getDatabaseAdapter } from '../adapters';
import { Project, Task, Agent, Asset, Build, TestCase } from '../types';

export interface GroupedSearchResults {
  query: string;
  totalMatches: number;
  projects: Project[];
  tasks: Task[];
  agents: Agent[];
  assets: Asset[];
  builds: Build[];
  tests: TestCase[];
}

export class SearchService {
  private adapter = getDatabaseAdapter();

  async searchAll(query: string, currentProjectId?: string): Promise<GroupedSearchResults> {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) {
      return {
        query: '',
        totalMatches: 0,
        projects: [],
        tasks: [],
        agents: [],
        assets: [],
        builds: [],
        tests: [],
      };
    }

    const [projects, tasks, agents, assets, builds, tests] = await Promise.all([
      this.adapter.getProjects(),
      this.adapter.getTasks(),
      this.adapter.getAgents(),
      this.adapter.getAssets(),
      this.adapter.getBuilds(),
      this.adapter.getTests(),
    ]);

    const matchedProjects = projects.filter(
      (p) =>
        p.name.toLowerCase().includes(cleanQuery) ||
        p.description.toLowerCase().includes(cleanQuery) ||
        p.genre.toLowerCase().includes(cleanQuery) ||
        p.engine.toLowerCase().includes(cleanQuery)
    );

    const matchedTasks = tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(cleanQuery) ||
        t.description.toLowerCase().includes(cleanQuery) ||
        t.tags?.some((tag) => tag.toLowerCase().includes(cleanQuery))
    );

    const matchedAgents = agents.filter(
      (a) =>
        a.name.toLowerCase().includes(cleanQuery) ||
        a.role.toLowerCase().includes(cleanQuery) ||
        a.description.toLowerCase().includes(cleanQuery) ||
        a.capabilities?.some((c) => c.toLowerCase().includes(cleanQuery))
    );

    const matchedAssets = assets.filter(
      (as) =>
        as.name.toLowerCase().includes(cleanQuery) ||
        as.type.toLowerCase().includes(cleanQuery) ||
        as.description?.toLowerCase().includes(cleanQuery)
    );

    const matchedBuilds = builds.filter(
      (b) =>
        b.version.toLowerCase().includes(cleanQuery) ||
        b.commit.toLowerCase().includes(cleanQuery) ||
        (b.commitMsg && b.commitMsg.toLowerCase().includes(cleanQuery)) ||
        b.branch?.toLowerCase().includes(cleanQuery)
    );

    const matchedTests = tests.filter(
      (ts) =>
        ts.name.toLowerCase().includes(cleanQuery) ||
        ts.description?.toLowerCase().includes(cleanQuery) ||
        ts.category.toLowerCase().includes(cleanQuery)
    );

    const totalMatches =
      matchedProjects.length +
      matchedTasks.length +
      matchedAgents.length +
      matchedAssets.length +
      matchedBuilds.length +
      matchedTests.length;

    return {
      query,
      totalMatches,
      projects: matchedProjects,
      tasks: matchedTasks,
      agents: matchedAgents,
      assets: matchedAssets,
      builds: matchedBuilds,
      tests: matchedTests,
    };
  }
}

export const searchService = new SearchService();
