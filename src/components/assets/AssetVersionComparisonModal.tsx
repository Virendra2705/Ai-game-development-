import React, { useState } from 'react';
import { X, GitCompare, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { Asset } from '../../types';

interface AssetVersionComparisonModalProps {
  asset: Asset;
  versionA?: string;
  versionB?: string;
  onClose: () => void;
}

export const AssetVersionComparisonModal: React.FC<AssetVersionComparisonModalProps> = ({
  asset,
  versionA = 'v1.0',
  versionB = asset.version || 'v1.4',
  onClose,
}) => {
  const [vA, setVA] = useState(versionA);
  const [vB, setVB] = useState(versionB);

  // Simulated version comparison metrics (Section 47)
  const versionData: Record<
    string,
    {
      version: string;
      polyCount: number;
      fileSize: string;
      textures: string;
      bones: number;
      lod: boolean;
      status: string;
      notes: string;
      thumb: string;
    }
  > = {
    'v1.0': {
      version: 'v1.0',
      polyCount: 24200,
      fileSize: '12.8 MB',
      textures: '4096x4096 uncompressed',
      bones: 28,
      lod: false,
      status: 'Archived',
      notes: 'Initial unoptimized raw 3D mesh output from prompt diffusion.',
      thumb: 'https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?w=400&auto=format&fit=crop&q=80',
    },
    'v1.1': {
      version: 'v1.1',
      polyCount: 18500,
      fileSize: '9.4 MB',
      textures: '2048x2048 PBR',
      bones: 36,
      lod: false,
      status: 'Archived',
      notes: 'Retopology pass; removed interior non-manifold vertices.',
      thumb: 'https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?w=400&auto=format&fit=crop&q=80',
    },
    'v1.4': {
      version: 'v1.4',
      polyCount: 11800,
      fileSize: '6.4 MB',
      textures: '2048x2048 ORM PBR',
      bones: 42,
      lod: true,
      status: 'Approved & Active',
      notes: 'Mobile Vulkan optimized: quad-dominant topology, 8 animations, 3 LOD levels.',
      thumb: 'https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?w=400&auto=format&fit=crop&q=80',
    },
    [asset.version]: {
      version: asset.version,
      polyCount: asset.polygonCount || 11800,
      fileSize: asset.fileSize || '6.4 MB',
      textures: asset.textureResolution || '2048x2048 PBR',
      bones: 42,
      lod: true,
      status: 'Current Version',
      notes: 'Current production-ready asset in Embervale workspace.',
      thumb: asset.thumbnailUrl || asset.thumbnail || 'https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?w=400&auto=format&fit=crop&q=80',
    },
  };

  const dataA = versionData[vA] || versionData['v1.0'];
  const dataB = versionData[vB] || versionData[asset.version];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md font-mono text-xs">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#0c101a] border border-[#1f2a3e] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#1c2638] bg-[#080c14] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Asset Version Comparison Tool (Section 47)
              </h3>
              <p className="text-[10px] text-slate-400">
                Comparing iterations of {asset.name} side-by-side with geometry and texture diffs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#121826] text-slate-400 hover:text-white border border-[#1d273a] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Comparison Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Version A Card */}
            <div className="p-4 rounded-2xl bg-[#080c14] border border-[#1a2334] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Baseline Version (A)</span>
                <span className="px-2 py-0.5 rounded bg-[#162032] text-indigo-300 font-bold text-[10px]">
                  {dataA.version}
                </span>
              </div>

              <div className="aspect-video rounded-xl bg-black/50 overflow-hidden border border-[#1a2334]">
                <img src={dataA.thumb} alt={dataA.version} className="w-full h-full object-cover" />
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between py-1 border-b border-[#141d2d]">
                  <span className="text-slate-400">Polygon Budget:</span>
                  <span className="font-bold text-white">{dataA.polyCount.toLocaleString()} tris</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#141d2d]">
                  <span className="text-slate-400">File Size:</span>
                  <span className="font-bold text-white">{dataA.fileSize}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#141d2d]">
                  <span className="text-slate-400">Texture Maps:</span>
                  <span className="font-bold text-white">{dataA.textures}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#141d2d]">
                  <span className="text-slate-400">Armature Bones:</span>
                  <span className="font-bold text-white">{dataA.bones} bones</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#141d2d]">
                  <span className="text-slate-400">LOD Levels:</span>
                  <span className="font-bold text-slate-300">{dataA.lod ? 'LOD0-2' : 'None'}</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 italic pt-1">{dataA.notes}</p>
            </div>

            {/* Version B Card */}
            <div className="p-4 rounded-2xl bg-[#080c14] border border-indigo-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-indigo-400 font-bold uppercase text-[10px]">Current Version (B)</span>
                <span className="px-2 py-0.5 rounded bg-indigo-600/30 text-indigo-300 font-bold text-[10px] border border-indigo-500/40">
                  {dataB.version} (Optimized)
                </span>
              </div>

              <div className="aspect-video rounded-xl bg-black/50 overflow-hidden border border-[#1a2334]">
                <img src={dataB.thumb} alt={dataB.version} className="w-full h-full object-cover" />
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between py-1 border-b border-[#141d2d]">
                  <span className="text-slate-400">Polygon Budget:</span>
                  <span className="font-bold text-emerald-400">
                    {dataB.polyCount.toLocaleString()} tris (-51% reduction)
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#141d2d]">
                  <span className="text-slate-400">File Size:</span>
                  <span className="font-bold text-emerald-400">{dataB.fileSize} (-50% storage)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#141d2d]">
                  <span className="text-slate-400">Texture Maps:</span>
                  <span className="font-bold text-white">{dataB.textures}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#141d2d]">
                  <span className="text-slate-400">Armature Bones:</span>
                  <span className="font-bold text-white">{dataB.bones} deformation bones</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#141d2d]">
                  <span className="text-slate-400">LOD Levels:</span>
                  <span className="font-bold text-emerald-400">LOD0, LOD1, LOD2 embedded</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-300 italic pt-1">{dataB.notes}</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#111726] border border-[#1c2638] text-slate-300 flex items-center justify-between">
            <span>
              Delta Summary: <strong>-51% Triangles</strong> • <strong>-50% Memory</strong> • <strong>Mobile Vulkan Compliant</strong>
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer"
            >
              Done Inspecting
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
