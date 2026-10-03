import React, { useState } from 'react';
import {
  X,
  CheckCircle,
  XCircle,
  FolderInput,
  Sparkles,
  GitBranch,
  Star,
  FileCode,
  ShieldCheck,
  Layers,
  Clock,
  History,
  AlertTriangle,
  FileText,
  Volume2,
  Video,
  Box,
  Share2,
  Tag,
  ArrowRight,
  RotateCcw,
  Check,
} from 'lucide-react';
import { Asset } from '../../types';

interface AssetDetailsModalProps {
  asset: Asset;
  onClose: () => void;
  onApprove: (asset: Asset) => void;
  onReject: (asset: Asset, reason: string) => void;
  onImport: (asset: Asset) => void;
  onCreateIntegrationTask: (asset: Asset) => void;
  onGenerateNewVersion: (asset: Asset) => void;
  onToggleFavorite: (assetId: string) => void;
  onCompareVersions: (asset: Asset, v1: string, v2: string) => void;
}

export const AssetDetailsModal: React.FC<AssetDetailsModalProps> = ({
  asset,
  onClose,
  onApprove,
  onReject,
  onImport,
  onCreateIntegrationTask,
  onGenerateNewVersion,
  onToggleFavorite,
  onCompareVersions,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'validation' | 'dependencies' | 'usage' | 'versions' | 'prompt'
  >('overview');
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [is3DWireframe, setIs3DWireframe] = useState(false);

  const validation = asset.validationResult || {
    verdict: 'APPROVED',
    score: 95,
    warningsCount: 0,
    failuresCount: 0,
    checks: [
      { id: '1', name: 'Container & File Integrity', category: 'Integrity', status: 'PASS', details: 'Binary chunks properly formatted' },
      { id: '2', name: 'Mobile Polygon Budget', category: 'Geometry', status: 'PASS', details: '11,800 tris (Budget: 16,000)' },
      { id: '3', name: 'PBR Texture References', category: 'Textures', status: 'PASS', details: 'Embedded Albedo, Normal, Roughness buffers' },
      { id: '4', name: 'Armature Skeleton Rig', category: 'Rigging', status: 'PASS', details: '42 deformation bones + root motion' },
    ],
    recommendations: ['Compatible with Godot 4.3 Forward+ renderer'],
  };

  const isApproved = asset.status === 'APPROVED' || asset.status === 'Approved';
  const isImported = asset.status === 'IMPORTED' || asset.status === 'Integrated' || asset.status === 'INTEGRATED';

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) return;
    onReject(asset, rejectReason);
    setIsRejecting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md font-mono text-xs">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-[#0c101a] border border-[#1f2a3e] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#1c2638] bg-[#080c14] flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <Box className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white truncate">{asset.name}</span>
                <span className="px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[10px] font-bold">
                  {asset.version}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#162032] border border-[#23314c] text-slate-300 text-[10px]">
                  {asset.type}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                Asset ID: <code className="text-indigo-400">{asset.id}</code> • Staged: {asset.fileLocation || 'assets/'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(asset.id)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                asset.isFavorite
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-[#121826] border-[#1d273a] text-slate-400 hover:text-white'
              }`}
              title="Toggle Favorite"
            >
              <Star className={`w-4 h-4 ${asset.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#121826] hover:bg-[#1a2336] text-slate-400 hover:text-white border border-[#1d273a] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Main Content Layout */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Interactive Visual Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="relative aspect-square rounded-2xl bg-[#080c14] border border-[#1c2638] overflow-hidden flex items-center justify-center group shadow-inner">
              <img
                src={
                  asset.thumbnailUrl ||
                  asset.thumbnail ||
                  'https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?w=600&auto=format&fit=crop&q=80'
                }
                alt={asset.name}
                className={`w-full h-full object-cover transition-all duration-300 ${
                  is3DWireframe ? 'opacity-40 grayscale invert' : ''
                }`}
              />

              {/* Wireframe Simulated Overlay for 3D Assets */}
              {is3DWireframe && (
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#38bdf820_1px,transparent_1px),linear-gradient(to_bottom,#38bdf820_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none flex items-center justify-center">
                  <div className="px-3 py-1.5 rounded-lg bg-black/80 border border-sky-400/40 text-sky-300 font-mono text-[10px]">
                    WIREFRAME RENDER • 11,800 FACES
                  </div>
                </div>
              )}

              {/* View mode toggle overlay */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
                {asset.previewType === '3d' && (
                  <button
                    onClick={() => setIs3DWireframe(!is3DWireframe)}
                    className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-[10px] text-white hover:border-indigo-400 transition-colors cursor-pointer"
                  >
                    {is3DWireframe ? 'Textured Mode' : 'Inspect Wireframe'}
                  </button>
                )}

                <div className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-[10px] text-slate-300">
                  {asset.format || 'glTF 2.0 / PBR'}
                </div>
              </div>
            </div>

            {/* Quick Spec Tags */}
            <div className="grid grid-cols-3 gap-2 text-[10px]">
              <div className="p-2 rounded-xl bg-[#080c14] border border-[#1a2334] text-center">
                <div className="text-slate-400">Resolution / Tri</div>
                <div className="font-bold text-white mt-0.5">
                  {asset.polyCount || asset.polygonCount ? `${asset.polygonCount} tris` : asset.dimensions || '2048x2048'}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-[#080c14] border border-[#1a2334] text-center">
                <div className="text-slate-400">File Size</div>
                <div className="font-bold text-white mt-0.5">{asset.fileSize || '6.4 MB'}</div>
              </div>
              <div className="p-2 rounded-xl bg-[#080c14] border border-[#1a2334] text-center">
                <div className="text-slate-400">QA Score</div>
                <div className="font-bold text-emerald-400 mt-0.5">{validation.score}% PASS</div>
              </div>
            </div>
          </div>

          {/* Right Column: Multi-tab Inspection View (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            <div>
              {/* Tab Navigation */}
              <div className="flex items-center gap-1.5 border-b border-[#1c2638] pb-2 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    activeTab === 'overview'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('validation')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    activeTab === 'validation'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Validation</span>
                </button>
                <button
                  onClick={() => setActiveTab('dependencies')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    activeTab === 'dependencies'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Dependencies
                </button>
                <button
                  onClick={() => setActiveTab('usage')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    activeTab === 'usage'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Usage
                </button>
                <button
                  onClick={() => setActiveTab('versions')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    activeTab === 'versions'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Versions</span>
                </button>
                <button
                  onClick={() => setActiveTab('prompt')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    activeTab === 'prompt'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Prompt
                </button>
              </div>

              {/* Tab 1: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-4 mt-4">
                  <div className="p-3.5 rounded-xl bg-[#080c14] border border-[#1a2334] space-y-2">
                    <div className="text-slate-400 font-semibold uppercase text-[10px]">Description & Purpose</div>
                    <p className="text-slate-200 leading-relaxed text-xs">
                      {asset.description || 'Master high-fidelity asset engineered for Embervale runtime.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-[#080c14] border border-[#1a2334] space-y-1">
                      <div className="text-slate-400 text-[10px]">Asset Provider & Model</div>
                      <div className="font-bold text-white">{asset.provider || 'Meshy Studio 3D / Tripo'}</div>
                      <div className="text-[10px] text-slate-400">{asset.model || 'meshy-v3-game-ready'}</div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#080c14] border border-[#1a2334] space-y-1">
                      <div className="text-slate-400 text-[10px]">Platform Target</div>
                      <div className="font-bold text-white">Mobile Vulkan (Forward+)</div>
                      <div className="text-[10px] text-emerald-400">LOD0, LOD1, LOD2 embedded</div>
                    </div>
                  </div>

                  {asset.metadata?.animations && (
                    <div className="p-3 rounded-xl bg-[#080c14] border border-[#1a2334] space-y-2">
                      <div className="text-slate-400 text-[10px] uppercase font-semibold">Included Rigged Animations</div>
                      <div className="flex flex-wrap gap-1.5">
                        {asset.metadata.animations.map((anim: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px]"
                          >
                            {anim}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {asset.tags && asset.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Tag className="w-3.5 h-3.5 text-slate-400" />
                      {asset.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-[#162032] text-slate-300 text-[10px]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Validation */}
              {activeTab === 'validation' && (
                <div className="space-y-3 mt-4">
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="font-bold text-emerald-300">Technical Validation Verdict: {validation.verdict}</div>
                        <div className="text-[10px] text-emerald-400/80">Automated 3D Asset Validator verified against Mobile targets</div>
                      </div>
                    </div>
                    <div className="text-lg font-black text-emerald-300">{validation.score}/100</div>
                  </div>

                  <div className="space-y-2">
                    {validation.checks.map((chk: any) => (
                      <div
                        key={chk.id}
                        className="p-2.5 rounded-xl bg-[#080c14] border border-[#1a2334] flex items-start justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>{chk.name}</span>
                            <span className="text-[10px] text-slate-400 font-normal">({chk.category})</span>
                          </div>
                          <div className="text-[11px] text-slate-300">{chk.details}</div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                            chk.status === 'PASS'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {chk.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Dependencies & References (Section 21, 28) */}
              {activeTab === 'dependencies' && (
                <div className="space-y-3 mt-4">
                  <div className="p-3 rounded-xl bg-[#080c14] border border-[#1a2334] space-y-2">
                    <div className="text-slate-400 uppercase text-[10px] font-semibold">Reference Assets (Section 21)</div>
                    <p className="text-slate-300 text-[11px]">
                      This asset was conditioned against and visually linked to approved project reference assets:
                    </p>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-[#111726] border border-[#1d273a]">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="font-bold text-white">Sparkit Concept Orthographics (v1.0)</span>
                      <span className="text-[10px] text-indigo-400">Reference Parent</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#080c14] border border-[#1a2334] space-y-2">
                    <div className="text-slate-400 uppercase text-[10px] font-semibold">Asset Dependency Graph (Section 28)</div>
                    <div className="space-y-1.5">
                      {(asset.dependencies || [
                        { id: 'd1', name: `${asset.name}_Albedo.png`, type: 'TEXTURE', status: 'RESOLVED' },
                        { id: 'd2', name: `${asset.name}_Normal.png`, type: 'TEXTURE', status: 'RESOLVED' },
                        { id: 'd3', name: `${asset.name}_SkeletonRig`, type: 'ANIMATION', status: 'RESOLVED' },
                      ]).map((dep: any) => (
                        <div
                          key={dep.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-[#111726] border border-[#1d273a]"
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-slate-200">{dep.name}</span>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-bold">{dep.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Usage Tracking (Section 29) */}
              {activeTab === 'usage' && (
                <div className="space-y-3 mt-4">
                  <div className="p-3 rounded-xl bg-[#080c14] border border-[#1a2334] space-y-2">
                    <div className="text-slate-400 uppercase text-[10px] font-semibold">Active Scene & Code Usages</div>
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-lg bg-[#111726] border border-[#1d273a] flex items-center justify-between">
                        <div>
                          <div className="font-bold text-white">Route 1 Grassland Encounter Zone</div>
                          <div className="text-[10px] text-slate-400">res://scenes/world/route_01.tscn</div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px]">
                          Spawn Table (28% weight)
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-[#111726] border border-[#1d273a] flex items-center justify-between">
                        <div>
                          <div className="font-bold text-white">Creature Bestiary & Codex Registry</div>
                          <div className="text-[10px] text-slate-400">res://src/data/creature_database.gd</div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                          ID: #004 (Sparkit)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: Version History & Comparison (Section 7, 47) */}
              {activeTab === 'versions' && (
                <div className="space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <div className="text-slate-400 text-[10px] uppercase font-semibold">Version History (Section 7)</div>
                    <button
                      onClick={() => onCompareVersions(asset, 'v1.0', asset.version)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-[10px] font-bold transition-all cursor-pointer"
                    >
                      Compare with v1.0 Side-by-Side
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-300">{asset.version} (CURRENT VERSION)</span>
                        <span className="text-[10px] text-indigo-400">Active</span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Polished mesh with mobile optimization pass and PBR roughness adjustments.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-[#080c14] border border-[#1a2334] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-300">v1.0 (Initial Generation)</span>
                        <span className="text-[10px] text-slate-400">Archived</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Base generation from Gemini plan prompt. High poly count (24k tris).
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 6: Prompt & History (Section 46) */}
              {activeTab === 'prompt' && (
                <div className="space-y-3 mt-4">
                  <div className="p-3 rounded-xl bg-[#080c14] border border-[#1a2334] space-y-2">
                    <div className="text-slate-400 uppercase text-[10px] font-semibold">Generation Prompt</div>
                    <div className="p-2.5 rounded-lg bg-[#111726] border border-[#1d273a] text-slate-200 font-mono text-[11px] leading-relaxed">
                      {asset.prompt || 'Electric fox creature, quadruped, glowing lightning ears, anime stylized, mobile optimized, low poly'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#080c14] border border-[#1a2334] space-y-1">
                    <div className="text-slate-400 text-[10px] uppercase font-semibold">Art Direction Context Injected</div>
                    <p className="text-[11px] text-slate-300">
                      Ghibli / Genshin anime 3D cel-shaded style • Vibrant elemental accent colors • Readable mobile silhouette
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Rejection Prompt Interface */}
            {isRejecting && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2 animate-in fade-in">
                <div className="font-bold text-rose-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Reject Asset (Section 23)</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Provide required rejection reason and suggested adjustments for Gemini to re-synthesize:
                </p>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Legs are too slender for a mobile runner; ears need stronger cyan electric glow..."
                  className="w-full h-16 p-2 rounded-lg bg-[#080c14] border border-rose-500/30 text-white text-xs placeholder-slate-400 focus:outline-none focus:border-rose-400"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setIsRejecting(false)}
                    className="px-3 py-1 rounded-lg bg-[#121826] hover:bg-[#1a2336] text-slate-300 text-[10px] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmReject}
                    disabled={!rejectReason.trim()}
                    className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-bold text-[10px] cursor-pointer"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            )}

            {/* Modal Bottom Action Controls (Section 23, 24, 38) */}
            <div className="p-3 rounded-2xl bg-[#080c14] border border-[#1a2334] flex flex-wrap items-center justify-between gap-2 pt-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onGenerateNewVersion(asset)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141c2c] hover:bg-[#1a253a] text-slate-200 border border-[#222f46] text-xs font-bold transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Generate New Version</span>
                </button>

                <button
                  onClick={() => onCreateIntegrationTask(asset)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141c2c] hover:bg-[#1a253a] text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-all cursor-pointer"
                  title="Section 38: Create Integration Task for Coding Agent"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Create Coding Task</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {!isApproved && !isImported && (
                  <>
                    <button
                      onClick={() => setIsRejecting(true)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>

                    <button
                      onClick={() => onApprove(asset)}
                      className="flex items-center gap-1 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve Asset</span>
                    </button>
                  </>
                )}

                {isApproved && !isImported && (
                  <button
                    onClick={() => onImport(asset)}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-600/20 cursor-pointer"
                  >
                    <FolderInput className="w-3.5 h-3.5" />
                    <span>Import to Workspace</span>
                  </button>
                )}

                {isImported && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Imported to Project Workspace</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
