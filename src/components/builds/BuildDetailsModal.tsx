import React from 'react';
import {
  X,
  Hammer,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  Download,
  Copy,
  Share2,
} from 'lucide-react';
import { Build } from '../../types';
import { useApp } from '../../context/AppContext';

export const BuildDetailsModal: React.FC = () => {
  const { activeBuildModal, setActiveBuildModal, currentProject, addToast } = useApp();

  if (!activeBuildModal) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
      onClick={() => setActiveBuildModal(null)}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-[#0c101a] border border-[#202c42] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1c263a] bg-[#101624]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
              <Hammer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-mono">
                  Build #{activeBuildModal.buildNumber} Logs
                </h3>
                <span className="text-xs font-mono text-indigo-300">
                  {activeBuildModal.version}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {activeBuildModal.commit} • {activeBuildModal.date} ({activeBuildModal.duration})
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveBuildModal(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#182133] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Checks snapshot */}
        <div className="p-4 border-b border-[#1c263a] bg-[#0e1320] flex flex-wrap items-center gap-3 text-xs font-mono">
          {(activeBuildModal.checks || []).map((c, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#131a28] border border-[#202a3d]"
            >
              {c.passed ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
              )}
              <span className="text-slate-300">{c.name}</span>
            </div>
          ))}
        </div>

        {/* Terminal logs content */}
        <div className="p-4 overflow-y-auto custom-scrollbar font-mono text-xs text-slate-300 bg-[#070a12] space-y-2 flex-1">
          <div className="text-slate-400 text-[11px] pb-2 border-b border-[#161f30] flex items-center justify-between">
            <span>Compiler Output / STDOUT</span>
            <span className="text-emerald-400">Exit Code: 0</span>
          </div>

          {activeBuildModal.logs.map((log, idx) => (
            <div key={idx} className="leading-relaxed font-mono text-[11px]">
              {log.includes('[ERROR]') || log.includes('[FAIL]') ? (
                <span className="text-rose-400">{log}</span>
              ) : log.includes('[SUCCESS]') ? (
                <span className="text-emerald-400 font-semibold">{log}</span>
              ) : log.includes('[TEST]') ? (
                <span className="text-purple-300">{log}</span>
              ) : (
                <span className="text-slate-300">{log}</span>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1c263a] bg-[#0e1320] flex items-center justify-between text-xs font-mono">
          <button
            onClick={() => {
              addToast('Logs Copied', 'Export logs copied to clipboard.', 'info');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#151c2a] hover:bg-[#1d273c] text-slate-300 border border-[#243048] transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Logs</span>
          </button>

          <button
            onClick={() => setActiveBuildModal(null)}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
