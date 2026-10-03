import { PlayerFeedback, FeedbackCluster } from '../types';
import { taskService } from './taskService';

export class FeedbackService {
  private feedbackItems: Map<string, PlayerFeedback[]> = new Map();

  constructor() {
    this.seedFeedback('proj-embervale');
  }

  private seedFeedback(projectId: string) {
    const items: PlayerFeedback[] = [
      {
        id: 'fb-01',
        projectId,
        source: 'In-game feedback',
        version: '1.0.0',
        platform: 'Android',
        message: 'Capturing Sparkit is way too hard! The kinetic net takes 2.5 seconds to deploy and it runs away immediately.',
        category: 'Difficulty',
        sentiment: 'Negative', // AI classification
        status: 'NEW',
        relatedFeature: 'Sparkit Capture',
        createdAt: '2026-09-17T11:20:00Z',
      },
      {
        id: 'fb-02',
        projectId,
        source: 'Community reviews',
        version: '1.0.0',
        platform: 'Android',
        message: 'The creature graphics and sound design in the Whispering Woods are stunning, but touch controls feel sluggish on my Galaxy S22.',
        category: 'Controls',
        sentiment: 'Neutral',
        status: 'PROCESSED',
        relatedFeature: 'Touch Joystick',
        createdAt: '2026-09-18T14:40:00Z',
      },
      {
        id: 'fb-03',
        projectId,
        source: 'Support message',
        version: '1.0.0',
        platform: 'Android',
        message: 'Game crashed directly to home screen when throwing the electric cage at a level 8 Sparkit in the Rift Gate area.',
        category: 'Bugs',
        sentiment: 'Negative',
        status: 'CONVERTED_TO_ISSUE',
        relatedFeature: 'Kinetic Net',
        relatedBug: 'crash-001',
        createdAt: '2026-09-18T16:05:00Z',
      },
      {
        id: 'fb-04',
        projectId,
        source: 'Alpha Discord',
        version: '1.0.0',
        platform: 'PC',
        message: 'Love the tactical combat! Could you please add an auto-sort button for the elemental crystal inventory?',
        category: 'Features',
        sentiment: 'Positive',
        status: 'NEW',
        relatedFeature: 'Inventory System',
        createdAt: '2026-09-19T09:15:00Z',
      },
      {
        id: 'fb-05',
        projectId,
        source: 'In-game feedback',
        version: '1.0.0',
        platform: 'Android',
        message: 'Battery drains really fast after 20 minutes of play. Phone gets quite warm around the camera bump.',
        category: 'Performance',
        sentiment: 'Negative',
        status: 'NEW',
        relatedFeature: 'Vulkan Shaders',
        createdAt: '2026-09-19T18:22:00Z',
      },
      {
        id: 'fb-06',
        projectId,
        source: 'In-game feedback',
        version: '1.0.0',
        platform: 'PC',
        message: 'The creature sound effects when Ignisaur roars are incredible! Feels very tactile and punchy.',
        category: 'Audio',
        sentiment: 'Positive',
        status: 'PROCESSED',
        relatedFeature: 'Creature Audio Bus',
        createdAt: '2026-09-20T04:10:00Z',
      },
    ];

    this.feedbackItems.set(projectId, items);
  }

  getFeedback(projectId: string): PlayerFeedback[] {
    return this.feedbackItems.get(projectId) || [];
  }

  addFeedback(feedbackData: Omit<PlayerFeedback, 'id' | 'createdAt' | 'status'>): PlayerFeedback {
    const item: PlayerFeedback = {
      id: `fb-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      status: 'NEW',
      ...feedbackData,
    };

    const list = this.getFeedback(feedbackData.projectId);
    list.unshift(item);
    this.feedbackItems.set(feedbackData.projectId, list);
    return item;
  }

  getThematicClusters(projectId: string): FeedbackCluster[] {
    const list = this.getFeedback(projectId);
    const categoryMap = new Map<string, PlayerFeedback[]>();

    list.forEach((item) => {
      const existing = categoryMap.get(item.category) || [];
      existing.push(item);
      categoryMap.set(item.category, existing);
    });

    const clusters: FeedbackCluster[] = [];

    categoryMap.forEach((items, category) => {
      let positive = 0;
      let neutral = 0;
      let negative = 0;

      items.forEach((it) => {
        if (it.sentiment === 'Positive') positive++;
        else if (it.sentiment === 'Negative') negative++;
        else neutral++;
      });

      let suggestedAction = 'Monitor telemetry and collect further reports.';
      if (category === 'Difficulty') {
        suggestedAction = 'Tune Sparkit capture wind-up from 2.5s down to 1.6s and expand snare radius.';
      } else if (category === 'Controls') {
        suggestedAction = 'Implement virtual joystick deadzone smoothing in touch input adapter.';
      } else if (category === 'Performance') {
        suggestedAction = 'Throttle background shadow cascade resolution on mobile battery saver mode.';
      } else if (category === 'Features') {
        suggestedAction = 'Queue inventory sorting algorithm task into development backlog.';
      }

      clusters.push({
        id: `cluster-${category.toLowerCase()}`,
        theme: `${category} Experience & Feedback`,
        category,
        count: items.length,
        sentimentDistribution: { positive, neutral, negative },
        sampleQuotes: items.slice(0, 3).map((it) => `"${it.message}" (${it.source}, v${it.version})`),
        suggestedAction,
      });
    });

    // Sort by negative sentiment count first
    return clusters.sort((a, b) => b.sentimentDistribution.negative - a.sentimentDistribution.negative);
  }

  async createTaskFromFeedback(projectId: string, feedbackId: string): Promise<{ taskId: string } | undefined> {
    const list = this.getFeedback(projectId);
    const item = list.find((f) => f.id === feedbackId);
    if (!item) return undefined;

    const task = await taskService.createTask({
      projectId,
      title: `[Player Feedback] ${item.category}: ${item.message.substring(0, 50)}...`,
      description: `Player Feedback Investigation:\nSource: ${item.source} (${item.platform}, v${item.version})\nMessage: "${item.message}"\nCategory: ${item.category}\nAI Sentiment: ${item.sentiment}`,
      category: item.category === 'Bugs' ? 'Bugfix' : item.category === 'Performance' ? 'Optimization' : 'Gameplay',
      priority: item.sentiment === 'Negative' ? 'HIGH' : 'MEDIUM',
      tags: ['feedback-pipeline', item.category.toLowerCase()],
    });

    item.status = 'CONVERTED_TO_ISSUE';
    return { taskId: task.id };
  }
}

export const feedbackService = new FeedbackService();
