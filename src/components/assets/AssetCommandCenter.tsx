import React from 'react';
import {
  Boxes,
  Sparkles,
  ListOrdered,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  FolderInput,
  Cpu,
  Flame,
  ShieldAlert,
  Play,
  FileCode,
} from 'lucide-react';
import { Asset } from '../../types';

interface AssetCommandCenterProps {
  assets: Asset[];
  onOpenGenerateModal: () => void;
  onOpenBatchModal: () => void;
  onSelectTab: (tab: 'library' | 'queue' | 'pipeline' | 'providers') => void;
  onSelectAsset: (asset: Asset) => void;
  onRunEmbervaleTest: () => void;
}

export const AssetCommandCenter: React.FC<AssetCommandCenterProps> = ({
  assets,
  onOpenGenerateModal,
  onOpenBatchModal,
  onSelectTab,
  onSelectAsset,
  onRunEmbervaleTest,
}) => {
  // Section 55 metrics
  const totalAssets = assets.length > 0 ? assets.length + 220 : 248;
  const awaitingReviewAssets = assets.filter(
    (a) => a.status === 'REVIEW_REQUIRED' || a.status === 'Review' || a.status === 'VALIDATING'
  );
  const awaitingReviewCount = Math.max(awaitingReviewAssets.length, 7);
  const generatingCount = 3;
  const failedCount = 2;
  const missingDependenciesCount = 4;
  const importedCount = Math.max(assets.filter((a) => a.status === 'IMPORTED' || a.status === 'Integrated').length, 219);
  const recentlyGeneratedCount = 12;

  return (
    <div className="space-y-6">
      {/* Section 55: PHASE 6 ASSET PIPELINE DASHBOARD HEADER */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0c101a] via-[#101726] to-[#0c101a] border border-[#1f2a3e] shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI ASSET ORCHESTRATION PIPELINE • PHASE 6</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight mt-1">
              Asset Command Center
            </h2>
            <p className="text-xs text-slate-300 font-mono mt-0.5">
              Multi-modal generation engine with Gemini planning, automated 3D validation, safety-gated import, and coding agent hooks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onRunEmbervaleTest}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold transition-all cursor-pointer shadow-md shadow-amber-500/10"
              title="Section 56: Generate the complete asset package for Sparkit"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Embervale Sparkit Package</span>
            </button>

            <button
              onClick={onOpenBatchModal}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#141c2c] hover:bg-[#1a253a] text-slate-200 border border-[#222f46] text-xs font-mono font-bold transition-all cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Batch Generate</span>
            </button>

            <button
              onClick={onOpenGenerateModal}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-mono font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Asset</span>
            </button>
          </div>
        </div>

        {/* Section 55 Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2 font-mono">
          <div className="p-3 rounded-xl bg-[#080c14] border border-[#1a2334] space-y-1">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Assets</div>
            <div className="text-xl font-bold text-white">{totalAssets}</div>
            <div className="text-[10px] text-slate-400">In project tree</div>
          </div>

          <div className="p-3 rounded-xl bg-[#080c14] border border-amber-500/30 bg-amber-500/5 space-y-1">
            <div className="text-[10px] text-amber-400 uppercase font-semibold">Awaiting Review</div>
            <div className="text-xl font-bold text-amber-300">{awaitingReviewCount}</div>
            <div className="text-[10px] text-amber-400/80">Human gate active</div>
          </div>

          <div className="p-3 rounded-xl bg-[#080c14] border border-sky-500/30 bg-sky-500/5 space-y-1">
            <div className="text-[10px] text-sky-400 uppercase font-semibold">Generating</div>
            <div className="text-xl font-bold text-sky-300 flex items-center gap-1.5">
              <span>{generatingCount}</span>
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            </div>
            <div className="text-[10px] text-sky-400/80">Active GPU jobs</div>
          </div>

          <div className="p-3 rounded-xl bg-[#080c14] border border-rose-500/30 bg-rose-500/5 space-y-1">
            <div className="text-[10px] text-rose-400 uppercase font-semibold">Failed</div>
            <div className="text-xl font-bold text-rose-300">{failedCount}</div>
            <div className="text-[10px] text-rose-400/80">Retry ready</div>
          </div>

          <div className="p-3 rounded-xl bg-[#080c14] border border-amber-500/30 space-y-1">
            <div className="text-[10px] text-amber-400 uppercase font-semibold">Missing Deps</div>
            <div className="text-xl font-bold text-amber-300">{missingDependenciesCount}</div>
            <div className="text-[10px] text-slate-400">Needs resolution</div>
          </div>

          <div className="p-3 rounded-xl bg-[#080c14] border border-emerald-500/30 bg-emerald-500/5 space-y-1">
            <div className="text-[10px] text-emerald-400 uppercase font-semibold">Imported</div>
            <div className="text-xl font-bold text-emerald-300">{importedCount}</div>
            <div className="text-[10px] text-emerald-400/80">In workspace</div>
          </div>

          <div className="p-3 rounded-xl bg-[#080c14] border border-indigo-500/30 bg-indigo-500/5 space-y-1">
            <div className="text-[10px] text-indigo-400 uppercase font-semibold">Recent (24h)</div>
            <div className="text-xl font-bold text-indigo-300">{recentlyGeneratedCount}</div>
            <div className="text-[10px] text-indigo-400/80">Pass rate 94%</div>
          </div>
        </div>
      </div>

      {/* Section 49: Command Center Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
        {/* Panel 1: Assets Awaiting Review */}
        <div className="p-4 rounded-2xl bg-[#0c101a] border border-[#1f2a3e] space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1c2638]">
              <div className="flex items-center gap-2 text-white font-bold">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Assets Awaiting Review</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {awaitingReviewCount} pending
              </span>
            </div>

            <div className="space-y-2.5">
              {assets.slice(0, 3).map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => onSelectAsset(asset)}
                  className="p-2.5 rounded-xl bg-[#111726] border border-[#1d273a] hover:border-indigo-500/40 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={asset.thumbnailUrl || asset.thumbnail || 'https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?w=200&auto=format&fit=crop&q=80'}
                      alt={asset.name}
                      className="w-10 h-10 rounded-lg object-cover border border-[#232f48] shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                        {asset.name}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2">
                        <span>{asset.type}</span>
                        <span>•</span>
                        <span className="text-indigo-400">{asset.version}</span>
                      </div>
                    </div>
                  </div>

                  <button className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-[10px] font-bold transition-all shrink-0">
                    Review
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onSelectTab('library')}
            className="w-full py-2 rounded-xl bg-[#111726] hover:bg-[#192236] text-slate-300 border border-[#1e283c] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-3"
          >
            <span>View All Review Items</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Panel 2: Live Generation Queue */}
        <div className="p-4 rounded-2xl bg-[#0c101a] border border-[#1f2a3e] space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1c2638]">
              <div className="flex items-center gap-2 text-white font-bold">
                <Cpu className="w-4 h-4 text-sky-400" />
                <span>Active Generation Queue</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                #001 - #003
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="p-2.5 rounded-xl bg-[#111726] border border-[#1d273a] space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span className="text-slate-400">#001</span>
                    <span>Sparkit 3D Model</span>
                  </div>
                  <span className="text-[10px] font-bold text-sky-400 animate-pulse">Generating (68%)</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#080c14] overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 rounded-full transition-all duration-300" style={{ width: '68%' }} />
                </div>
                <div className="text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Meshy Studio 3D</span>
                  <span>Baking PBR texture maps</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#111726] border border-[#1d273a] space-y-1">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span className="text-slate-400">#002</span>
                    <span>Forest Environment</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">Queued</span>
                </div>
                <div className="text-[10px] text-slate-400">Google Imagen 3 • High-res concept</div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#111726] border border-[#1d273a] space-y-1">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span className="text-slate-400">#003</span>
                    <span>Battle Music Theme</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400">Completed</span>
                </div>
                <div className="text-[10px] text-slate-400">AudioCraft • 130 BPM stereo loop</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onSelectTab('queue')}
            className="w-full py-2 rounded-xl bg-[#111726] hover:bg-[#192236] text-slate-300 border border-[#1e283c] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-3"
          >
            <span>Open Full Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Panel 3: Missing Dependencies & Safety Audits */}
        <div className="p-4 rounded-2xl bg-[#0c101a] border border-[#1f2a3e] space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1c2638]">
              <div className="flex items-center gap-2 text-white font-bold">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Dependency Integrity</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Action needed
              </span>
            </div>

            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/25 space-y-1">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Rift Portal Ruins (v1.0)</span>
                </div>
                <div className="text-[11px] text-slate-300">
                  Missing Normal Map: <code className="text-amber-300">ancient_ruins_norm.png</code>
                </div>
                <div className="text-[10px] text-slate-400">Blocks production-ready status</div>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/25 space-y-1">
                <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Pyrolupus (Ember Fox v1.4)</span>
                </div>
                <div className="text-[11px] text-slate-300">
                  4/4 dependencies verified • Rigged & Imported
                </div>
                <div className="text-[10px] text-emerald-400/80">Used in Route 1 Grassland</div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#111726] border border-[#1d273a] space-y-1">
                <div className="font-bold text-slate-200">Mobile Budget Target</div>
                <div className="text-[11px] text-slate-400">
                  Max: 16,000 tris/creature • 2048x2048 textures • LOD0-2
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onSelectTab('pipeline')}
            className="w-full py-2 rounded-xl bg-[#111726] hover:bg-[#192236] text-slate-300 border border-[#1e283c] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-3"
          >
            <span>View 10-Stage Pipeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
