import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Check,
  Split,
  FileText,
  ShieldAlert,
} from 'lucide-react';
import { KnowledgeConflict } from '../../types';
import { knowledgeConflictService } from '../../services/knowledgeConflictService';

interface ConflictResolverModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflict: KnowledgeConflict | null;
  onResolved: () => void;
}

export const ConflictResolverModal: React.FC<ConflictResolverModalProps> = ({
  isOpen,
  onClose,
  conflict,
  onResolved,
}) => {
  const [selectedResolution, setSelectedResolution] = useState<'SOURCE_A' | 'SOURCE_B' | 'CUSTOM'>('SOURCE_A');
  const [customExplanation, setCustomExplanation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !conflict) return null;

  const sourceA = conflict.sourceA || conflict.knowledgeA || {
    title: 'Source A',
    statement: 'Statement A',
    type: 'DOCUMENT',
  };
  const sourceB = conflict.sourceB || conflict.knowledgeB || {
    title: 'Source B',
    statement: 'Statement B',
    type: 'DOCUMENT',
  };

  const handleResolve = async () => {
    setIsSubmitting(true);
    try {
      const chosenText =
        selectedResolution === 'SOURCE_A'
          ? sourceA.statement
          : selectedResolution === 'SOURCE_B'
          ? sourceB.statement
          : customExplanation || 'Custom compromised resolution';

      await knowledgeConflictService.resolveConflict(
        conflict.id,
        conflict.projectId,
        chosenText,
        'Game Architect'
      );
      onResolved();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0c1019] border border-[#1e2638] rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2638] bg-[#111726]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-mono">Resolve Knowledge Conflict</h2>
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-rose-500/20 text-rose-300 uppercase border border-rose-500/30">
                  {conflict.severity} SEVERITY
                </span>
              </div>
              <p className="text-xs text-slate-400">{conflict.reason}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#182033] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: Side-by-side comparison */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Source A */}
            <div
              onClick={() => setSelectedResolution('SOURCE_A')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedResolution === 'SOURCE_A'
                  ? 'bg-indigo-950/30 border-indigo-500 ring-2 ring-indigo-500/20'
                  : 'bg-[#101626] border-[#1e273d] hover:border-[#2b3754]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-[11px] font-bold text-slate-300 font-mono flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  {sourceA.title || 'Source A'}
                </div>
                {selectedResolution === 'SOURCE_A' && (
                  <Check className="w-4 h-4 text-indigo-400" />
                )}
              </div>
              <p className="text-xs text-white font-mono bg-[#090d16] p-3 rounded-lg border border-[#161f33] leading-relaxed">
                «{sourceA.statement}»
              </p>
              <div className="text-[10px] text-slate-400 mt-2 font-mono">
                Source Type: {sourceA.type || 'DOCUMENT'}
              </div>
            </div>

            {/* Source B */}
            <div
              onClick={() => setSelectedResolution('SOURCE_B')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedResolution === 'SOURCE_B'
                  ? 'bg-indigo-950/30 border-indigo-500 ring-2 ring-indigo-500/20'
                  : 'bg-[#101626] border-[#1e273d] hover:border-[#2b3754]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-[11px] font-bold text-slate-300 font-mono flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  {sourceB.title || 'Source B'}
                </div>
                {selectedResolution === 'SOURCE_B' && (
                  <Check className="w-4 h-4 text-indigo-400" />
                )}
              </div>
              <p className="text-xs text-white font-mono bg-[#090d16] p-3 rounded-lg border border-[#161f33] leading-relaxed">
                «{sourceB.statement}»
              </p>
              <div className="text-[10px] text-slate-400 mt-2 font-mono">
                Source Type: {sourceB.type || 'DOCUMENT'}
              </div>
            </div>
          </div>

          {/* Custom option */}
          <div
            onClick={() => setSelectedResolution('CUSTOM')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              selectedResolution === 'CUSTOM'
                ? 'bg-indigo-950/30 border-indigo-500 ring-2 ring-indigo-500/20'
                : 'bg-[#101626] border-[#1e273d] hover:border-[#2b3754]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold text-slate-200">
                Custom Compromise / New Canon Decision
              </div>
              {selectedResolution === 'CUSTOM' && (
                <Check className="w-4 h-4 text-indigo-400" />
              )}
            </div>
            <textarea
              rows={3}
              placeholder="State authoritative rule to supersede both sources..."
              value={customExplanation}
              onChange={(e) => {
                setCustomExplanation(e.target.value);
                setSelectedResolution('CUSTOM');
              }}
              className="w-full px-3 py-2 rounded-lg bg-[#090d16] border border-[#161f33] text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0a0e17] border-t border-[#182033]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#182033] hover:bg-[#202b42] text-slate-300 text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleResolve}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30"
          >
            {isSubmitting ? 'Resolving Conflict...' : 'Confirm Resolution as Canon'}
          </button>
        </div>
      </div>
    </div>
  );
};
