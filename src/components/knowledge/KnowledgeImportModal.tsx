import React, { useState } from 'react';
import {
  X,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { knowledgeBaseService } from '../../services/knowledgeBaseService';

interface KnowledgeImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onImportComplete: () => void;
}

export const KnowledgeImportModal: React.FC<KnowledgeImportModalProps> = ({
  isOpen,
  onClose,
  projectId,
  onImportComplete,
}) => {
  const [inputText, setInputText] = useState('');
  const [filename, setFilename] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineStep, setPipelineStep] = useState<number>(0);
  const [result, setResult] = useState<any>(null);

  if (!isOpen) return null;

  const sampleDoc = `# Voltrik Evolution & Stat Ceiling Specification

## Evolution Conditions
Voltrik is the evolved state of Sparkit (#025). Evolution occurs when Sparkit reaches Level 20 and is exposed to a Charged Rift Shard during a storm encounter.

## Combat Capabilities
- **Element**: Electric / Steel
- **Base Attack**: 95
- **Base Speed**: 110
- **Signature Move**: Ion Cannon (Power 120, Accuracy 85%)

## Visual Identity
Voltrik features metallic spikes along its spine and an energized plasma tail.`;

  const handleImport = async () => {
    if (!inputText.trim()) return;
    setIsProcessing(true);
    setPipelineStep(1); // Parse & Classify

    setTimeout(async () => {
      setPipelineStep(2); // Extract & Validate
      setTimeout(async () => {
        setPipelineStep(3); // Conflict Detection & Store
        try {
          const importResult = await knowledgeBaseService.importKnowledge({
            projectId,
            rawText: inputText,
            filename: filename || 'Custom Knowledge Document',
            sourceType: 'USER',
            author: 'Game Architect',
          });
          setResult(importResult);
          setPipelineStep(4); // Done
          onImportComplete();
        } catch (err) {
          console.error(err);
        } finally {
          setIsProcessing(false);
        }
      }, 500);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0c1019] border border-[#1e2638] rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2638] bg-[#111726]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-mono">Knowledge Document Ingestion</h2>
              <p className="text-xs text-slate-400">Multi-stage pipeline with contradiction and conflict detection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#182033] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ingestion Pipeline Stepper */}
        <div className="px-6 py-3 bg-[#0a0e17] border-b border-[#182033] flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className={`flex items-center gap-1.5 ${pipelineStep >= 1 ? 'text-indigo-400 font-bold' : ''}`}>
            <span>1. PARSE & CLASSIFY</span>
          </div>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <div className={`flex items-center gap-1.5 ${pipelineStep >= 2 ? 'text-indigo-400 font-bold' : ''}`}>
            <span>2. VALIDATE</span>
          </div>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <div className={`flex items-center gap-1.5 ${pipelineStep >= 3 ? 'text-indigo-400 font-bold' : ''}`}>
            <span>3. CONFLICT CHECK</span>
          </div>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <div className={`flex items-center gap-1.5 ${pipelineStep >= 4 ? 'text-emerald-400 font-bold' : ''}`}>
            <span>4. STORE CANON</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {result ? (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-white">Ingestion Complete</h4>
                  <p className="text-xs text-emerald-200 mt-0.5">
                    Saved as «{result.document.title}» in category <span className="font-mono uppercase">{result.document.category}</span>.
                  </p>
                </div>
              </div>

              {result.conflictsDetected > 0 && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
                  <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold">Contradiction Detected: </span>
                    Flagged for review because content diverges from existing canon documents.
                  </div>
                </div>
              )}

              {result.warnings.length > 0 && (
                <div className="space-y-1">
                  {result.warnings.map((w: string, i: number) => (
                    <div key={i} className="text-xs text-amber-300 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {w}
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => {
                  setResult(null);
                  setPipelineStep(0);
                  setInputText('');
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg"
              >
                Close & Return to Knowledge Base
              </button>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Document Title / File Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sparkit Evolution Specification.md"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#111726] border border-[#1e2638] text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Content (Markdown / Plain Text / JSON)
                  </label>
                  <button
                    onClick={() => {
                      setInputText(sampleDoc);
                      setFilename('Voltrik Evolution Spec.md');
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 underline"
                  >
                    Insert Sample GDD
                  </button>
                </div>
                <textarea
                  rows={9}
                  placeholder="Paste design specifications, technical documentation, or character bios here..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#111726] border border-[#1e2638] text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono resize-none custom-scrollbar"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#111726]/60 border border-[#1a2336] text-[11px] text-slate-400 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Strict Security:</strong> Any API keys, passwords, or personal credentials inside the text are
                  automatically sanitized and redacted prior to storage.
                </span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!result && (
          <div className="flex items-center justify-between px-6 py-4 bg-[#0a0e17] border-t border-[#182033]">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#182033] hover:bg-[#202b42] text-slate-300 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={isProcessing || !inputText.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30"
            >
              {isProcessing ? 'Processing Pipeline...' : 'Run Ingestion Pipeline'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
