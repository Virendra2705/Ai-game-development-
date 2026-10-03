import React, { useState } from 'react';
import {
  Flame,
  CheckCircle2,
  Cpu,
  ShieldCheck,
  FolderInput,
  FileCode,
  Sparkles,
  Loader2,
  X,
  Play,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { assetAgentService } from '../../services/assets/assetAgentService';
import { Asset } from '../../types';

interface EmbervaleTestModalProps {
  projectId: string;
  onClose: () => void;
  onAssetCreated: (asset: Asset) => void;
  onOpenTaskCenter: () => void;
}

export const EmbervaleTestModal: React.FC<EmbervaleTestModalProps> = ({
  projectId,
  onClose,
  onAssetCreated,
  onOpenTaskCenter,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentStepName, setCurrentStepName] = useState('Ready to execute Sparkit package');
  const [progress, setProgress] = useState(0);
  const [details, setDetails] = useState(
    'Press "Run End-to-End Workflow" to execute the full 9-stage production package for Sparkit (Electric Fox).'
  );
  const [generatedAssets, setGeneratedAssets] = useState<Asset[]>([]);
  const [createdTaskId, setCreatedTaskId] = useState<string>('');

  const handleRunTest = async () => {
    setIsRunning(true);
    setIsCompleted(false);
    setProgress(0);

    try {
      const result = await assetAgentService.runEmbervaleSparkitPackage(
        projectId,
        (stepName, stepProgress, stepDetails) => {
          setCurrentStepName(stepName);
          setProgress(stepProgress);
          setDetails(stepDetails);
        }
      );

      setGeneratedAssets([result.conceptAsset, result.modelAsset, result.audioAsset]);
      setCreatedTaskId(result.integrationTaskId);
      onAssetCreated(result.modelAsset);
      onAssetCreated(result.conceptAsset);
      onAssetCreated(result.audioAsset);
      setIsCompleted(true);
    } catch (err: any) {
      setDetails(`Execution failed: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md font-mono text-xs">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-[#0c101a] border border-[#1f2a3e] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#1c2638] bg-[#080c14] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Embervale End-to-End Test (Section 56)
                </h3>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                  SPARKIT ASSET PACKAGE
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Executes complete pipeline: Specs → Plan → 3D Model → Rig → 8 Animations → 3D Validator → Approval → Import → Coding Task
              </p>
            </div>
          </div>

          {!isRunning && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-[#121826] text-slate-400 hover:text-white border border-[#1d273a] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Status Tracker Box */}
          <div className="p-4 rounded-xl bg-[#080c14] border border-[#1a2334] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isRunning ? (
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                ) : isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Play className="w-4 h-4 text-indigo-400" />
                )}
                <span className="font-bold text-white text-sm">{currentStepName}</span>
              </div>
              <span className="font-bold text-amber-400 text-sm">{progress}%</span>
            </div>

            <div className="w-full h-2 rounded-full bg-[#111726] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="text-slate-300 text-[11px] leading-relaxed">{details}</p>
          </div>

          {/* Workflow Sequence Checklist */}
          <div className="space-y-2">
            <div className="text-slate-400 uppercase text-[10px] font-bold">
              Automated Production Stages Executed
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-xl bg-[#080c14] border border-[#1a2334] flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${progress >= 10 ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>1. Read Creature Spec from Project Memory</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#080c14] border border-[#1a2334] flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${progress >= 25 ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>2. Formulate Gemini Multi-Stage Asset Plan</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#080c14] border border-[#1a2334] flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${progress >= 40 ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>3. 2D Concept Orthographic Turnaround</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#080c14] border border-[#1a2334] flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${progress >= 60 ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>4. 3D Model, 2K PBR & Quadruped Rig</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#080c14] border border-[#1a2334] flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${progress >= 75 ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>5. 8 Rigged Animations & Vocal SFX</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#080c14] border border-[#1a2334] flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${progress >= 85 ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>6. 3D Asset Validator (11,800 tris PASS)</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#080c14] border border-[#1a2334] flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${progress >= 92 ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>7. Staged Ingest to assets/creatures/sparkit/</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#080c14] border border-[#1a2334] flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${progress >= 100 ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>8. Coding Agent Integration Task Spawned</span>
              </div>
            </div>
          </div>

          {/* Generated Artifacts on completion */}
          {isCompleted && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 animate-in fade-in">
              <div className="font-bold text-emerald-300 flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Sparkit Package Successfully Staged & Integrated!</span>
              </div>

              <div className="space-y-2">
                {generatedAssets.map((a) => (
                  <div
                    key={a.id}
                    className="p-2.5 rounded-lg bg-[#080c14] border border-[#1a2334] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <img src={a.thumbnailUrl} alt={a.name} className="w-8 h-8 rounded object-cover" />
                      <div>
                        <div className="font-bold text-white">{a.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {a.type} • {a.format || 'glTF 2.0'} • {a.polyCount || a.fileSize}
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      Staged
                    </span>
                  </div>
                ))}
              </div>

              {createdTaskId && (
                <div className="p-3 rounded-xl bg-[#080c14] border border-[#1a2334] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-indigo-400" />
                    <div>
                      <div className="font-bold text-white">Coding Agent Task Created</div>
                      <div className="text-[10px] text-slate-400">
                        Task ID: <code>{createdTaskId}</code>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenTaskCenter();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open Task in Queue</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1c2638] bg-[#080c14] flex items-center justify-between">
          <button
            onClick={onClose}
            disabled={isRunning}
            className="px-4 py-2 rounded-xl bg-[#141c2c] hover:bg-[#1a253a] disabled:opacity-40 text-slate-300 font-bold cursor-pointer"
          >
            {isCompleted ? 'Close' : 'Cancel'}
          </button>

          {!isCompleted ? (
            <button
              onClick={handleRunTest}
              disabled={isRunning}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:opacity-50 text-white font-bold shadow-lg shadow-amber-600/30 cursor-pointer"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Package...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Run End-to-End Workflow</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
