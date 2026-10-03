import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Bug,
  RotateCcw,
  CheckCircle2,
  FileCode,
  Check,
  TrendingUp,
  Sliders,
} from 'lucide-react';
import { ImprovementTask } from '../../types';

interface ImprovementBacklogTabProps {
  tasks: ImprovementTask[];
  onApproveTask: (id: string) => void;
}

export const ImprovementBacklogTab: React.FC<ImprovementBacklogTabProps> = ({
  tasks,
  onApproveTask,
}) => {
  const [filter, setFilter] = useState<string>('ALL');

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'ALL') return true;
    return t.type === filter;
  });

  const getTypeIcon = (type: ImprovementTask['type']) => {
    switch (type) {
      case 'OPTIMIZATION':
        return <Zap className="w-3.5 h-3.5 text-amber-400" />;
      case 'BUG_FIX':
        return <Bug className="w-3.5 h-3.5 text-rose-400" />;
      case 'REFACTOR':
        return <RotateCcw className="w-3.5 h-3.5 text-sky-400" />;
      case 'UX':
        return <Sparkles className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <FileCode className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0d121f] border border-[#1b2438]">
        <div>
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            AI Continuous Improvement Backlog
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Safe evidence-based improvements autonomously discovered from QA traces, profiler logs, and build cycles.
          </p>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#090d16] p-1 rounded-lg border border-[#182236]">
          {['ALL', 'OPTIMIZATION', 'UX', 'REFACTOR', 'BUG_FIX'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                filter === f ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Task Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.map((t) => (
          <div
            key={t.id}
            className="p-4 rounded-xl bg-[#090d16] border border-[#161f33] hover:border-[#22304d] transition-all flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                  {getTypeIcon(t.type)}
                  <span>{t.type}</span>
                </span>
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                  {t.priority} PRIORITY
                </span>
              </div>

              <h4 className="text-xs font-bold text-white font-mono">{t.title}</h4>
              <p className="text-[11px] text-slate-400 line-clamp-3">{t.description}</p>

              {/* Evidence box */}
              <div className="p-2 rounded-lg bg-[#070a12] border border-[#141b2a] text-[10px] text-slate-300 font-mono">
                <span className="text-slate-500 block uppercase">Evidence:</span>
                <span className="text-amber-200/90">{t.evidence}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#141b2a] flex items-center justify-between">
              <div className="text-[10px] font-mono text-slate-500">
                Agent: <span className="text-slate-400">{t.suggestedAgent}</span>
              </div>
              {t.status === 'PROPOSED' ? (
                <button
                  onClick={() => onApproveTask(t.id)}
                  className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-mono font-bold flex items-center gap-1 transition-colors"
                >
                  <Check className="w-3 h-3" />
                  <span>Queue for Run</span>
                </button>
              ) : (
                <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Approved</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
