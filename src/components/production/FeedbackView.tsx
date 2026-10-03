import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  Layers,
  ArrowRight,
  Filter,
  Plus,
  Send,
  HelpCircle,
  TrendingUp,
  Tag,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { feedbackService } from '../../services/feedbackService';
import { taskService } from '../../services/taskService';
import { autonomousDevelopmentService } from '../../services/autonomousDevelopmentService';
import { PlayerFeedback, ThematicCluster } from '../../types';

export const FeedbackView: React.FC = () => {
  const { currentProject, addToast } = useApp();
  const [feedbackList, setFeedbackList] = useState<PlayerFeedback[]>([]);
  const [clusters, setClusters] = useState<ThematicCluster[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  useEffect(() => {
    loadData();
  }, [currentProject.id]);

  const loadData = () => {
    const fb = feedbackService.getFeedback(currentProject.id);
    const cl = feedbackService.getThematicClusters(currentProject.id);
    setFeedbackList(fb);
    setClusters(cl);
  };

  const handleSendClusterToPhase9 = (cluster: ThematicCluster) => {
    const task = taskService.createTask({
      projectId: currentProject.id,
      title: `[Player Feedback] ${cluster.theme}`,
      description: `Player Feedback Theme (${cluster.category}): ${cluster.theme}\n\nEvidence (${cluster.count} reports):\n${cluster.quotes.map((q) => `• "${q}"`).join('\n')}\n\nAffected Systems: ${cluster.affectedSystems.join(', ')}`,
      category: cluster.category === 'Bugs' ? 'Bugfix' : cluster.category === 'Performance' ? 'Optimization' : 'Feature',
      priority: cluster.count >= 10 ? 'P1 - High' : 'P2 - Normal',
      tags: ['player-feedback', 'phase-9-loop', cluster.category.toLowerCase()],
    });

    autonomousDevelopmentService.addImprovementTask(currentProject.id, {
      type: cluster.category === 'Bugs' ? 'BUG_FIX' : cluster.category === 'Performance' ? 'OPTIMIZATION' : 'UX',
      title: cluster.theme,
      description: `Theme identified across ${cluster.count} feedback tickets.`,
      evidence: cluster.quotes.join('; '),
      priority: 'HIGH',
      suggestedAgent: 'agent-design-01',
    });

    addToast(
      'Dispatched to Phase 9 Loop',
      `Improvement task #${task.id} queued for Autonomous Dev Loop.`,
      'success'
    );
  };

  const filteredFeedback =
    selectedCategory === 'ALL'
      ? feedbackList
      : feedbackList.filter((f) => f.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-[#0b0e17] border border-[#1a2336] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#182030]">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-sky-400" />
              Player Feedback & AI Thematic Clustering
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Transforms player community voice into concrete actionable engineering tasks.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-[#07090e] px-3 py-1.5 rounded-lg border border-[#141b2b]">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>AI sentiment classification may not reflect nuanced sarcasm or dialect.</span>
          </div>
        </div>

        {/* Thematic Clusters */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Active Thematic Feedback Clusters
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {clusters.map((cluster) => (
              <div
                key={cluster.id}
                className="p-4 rounded-xl bg-[#0f1422] border border-[#1b253b] space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 uppercase">
                      {cluster.category}
                    </span>
                    <span className="text-xs font-bold font-mono text-slate-300">
                      {cluster.count} players
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-white mt-2 leading-snug">{cluster.theme}</h4>

                  <div className="mt-2 space-y-1">
                    {cluster.quotes.slice(0, 2).map((quote, idx) => (
                      <p key={idx} className="text-[11px] text-slate-400 italic">
                        "{quote}"
                      </p>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#182133] flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">
                    Sentiment: {cluster.sentiment}
                  </span>
                  <button
                    onClick={() => handleSendClusterToPhase9(cluster)}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
                  >
                    Send to Phase 9 <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filterable Raw Feedback Feed */}
      <div className="p-5 rounded-xl bg-[#0b0e17] border border-[#1a2336] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#182030]">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            Raw Ingested Player Feed
          </h3>

          <div className="flex flex-wrap gap-1.5 text-xs">
            {['ALL', 'Gameplay', 'Difficulty', 'Controls', 'Performance', 'UI', 'Bugs'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white font-medium'
                    : 'bg-[#121927] text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5">
          {filteredFeedback.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-lg bg-[#0f1422] border border-[#182236] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-200">{item.message}</span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-3">
                  <span>Category: <strong className="text-slate-400">{item.category}</strong></span>
                  <span>Source: <strong className="text-slate-400">{item.source}</strong></span>
                  <span>Target: <strong className="text-slate-400">v{item.version}</strong></span>
                </div>
              </div>

              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono self-start sm:self-auto ${
                  item.sentiment === 'Positive'
                    ? 'bg-emerald-500/15 text-emerald-300'
                    : item.sentiment === 'Negative'
                    ? 'bg-rose-500/15 text-rose-300'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {item.sentiment}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
