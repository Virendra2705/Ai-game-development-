import React, { useState } from 'react';
import { FileCode2, ChevronDown, ChevronRight, Plus, Minus } from 'lucide-react';
import { FileChange } from '../../types';

interface DiffViewerProps {
  fileChanges: FileChange[];
  fullDiff?: string;
  defaultExpanded?: boolean;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  fileChanges,
  defaultExpanded = true,
}) => {
  const [expandedFiles, setExpandedFiles] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    fileChanges.forEach((fc) => {
      initial[fc.id] = defaultExpanded;
    });
    return initial;
  });

  const toggleFile = (id: string) => {
    setExpandedFiles((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const next: Record<string, boolean> = {};
    fileChanges.forEach((fc) => (next[fc.id] = true));
    setExpandedFiles(next);
  };

  const collapseAll = () => {
    setExpandedFiles({});
  };

  const getChangeBadge = (type: string) => {
    switch (type) {
      case 'CREATED':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'DELETED':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'MODIFIED':
      default:
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    }
  };

  const renderDiffLines = (diffText: string) => {
    const lines = diffText.split('\n');
    return lines.map((line, idx) => {
      let bg = 'bg-transparent text-slate-300';
      let prefix = '';

      if (line.startsWith('+') && !line.startsWith('+++')) {
        bg = 'bg-emerald-950/40 text-emerald-300 border-l-2 border-emerald-500';
        prefix = '+ ';
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        bg = 'bg-rose-950/40 text-rose-300 border-l-2 border-rose-500';
        prefix = '- ';
      } else if (line.startsWith('@@')) {
        bg = 'bg-indigo-950/30 text-indigo-400 font-bold border-l-2 border-indigo-500';
      }

      return (
        <div
          key={idx}
          className={`flex items-start font-mono text-xs px-3 py-0.5 leading-relaxed overflow-x-auto ${bg}`}
        >
          <span className="w-10 text-[10px] text-slate-400 select-none shrink-0 font-mono">
            {idx + 1}
          </span>
          <span className="whitespace-pre">{line}</span>
        </div>
      );
    });
  };

  return (
    <div className="space-y-3">
      {/* Controls header */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
        <span>{fileChanges.length} file{fileChanges.length === 1 ? '' : 's'} changed</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={expandAll}
            className="px-2 py-1 rounded bg-[#161c2a] hover:bg-[#1f283d] text-slate-300 hover:text-white transition-colors"
          >
            Expand All
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="px-2 py-1 rounded bg-[#161c2a] hover:bg-[#1f283d] text-slate-300 hover:text-white transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* File change cards */}
      <div className="space-y-2.5">
        {fileChanges.map((fc) => {
          const isExpanded = expandedFiles[fc.id] !== false;

          return (
            <div
              key={fc.id}
              className="rounded-xl bg-[#090d15] border border-[#1b2538] overflow-hidden shadow-md"
            >
              {/* File header bar */}
              <button
                type="button"
                onClick={() => toggleFile(fc.id)}
                className="w-full flex items-center justify-between p-3 bg-[#0d1320] hover:bg-[#121929] border-b border-[#182133] text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 truncate">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <FileCode2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="text-xs font-mono font-bold text-white truncate">
                    {fc.path}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border shrink-0 ${getChangeBadge(
                      fc.changeType
                    )}`}
                  >
                    {fc.changeType}
                  </span>
                </div>

                <div className="flex items-center gap-3 font-mono text-xs shrink-0">
                  <span className="flex items-center text-emerald-400">
                    <Plus className="w-3 h-3 mr-0.5" />
                    {fc.linesAdded}
                  </span>
                  <span className="flex items-center text-rose-400">
                    <Minus className="w-3 h-3 mr-0.5" />
                    {fc.linesRemoved}
                  </span>
                </div>
              </button>

              {/* Code diff body */}
              {isExpanded && (
                <div className="py-2 bg-[#060910] border-t border-[#131a29] max-h-96 overflow-y-auto custom-scrollbar">
                  {renderDiffLines(fc.diff)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
