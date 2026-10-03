import React, { useState, useEffect } from 'react';
import {
  Layers,
  Download,
  Trash2,
  Eye,
  ShieldCheck,
  CheckCircle2,
  FileArchive,
  ExternalLink,
  Search,
  Filter,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { buildPipelineService } from '../../services/build/buildPipelineService';
import { BuildArtifact } from '../../types';

export const ArtifactsCenter: React.FC = () => {
  const { currentProject, addToast } = useApp();
  const [artifacts, setArtifacts] = useState<BuildArtifact[]>(
    buildPipelineService.getArtifacts(currentProject.id)
  );
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'Web' | 'Android' | 'PC' | 'Other'>('ALL');
  const [inspectArtifact, setInspectArtifact] = useState<BuildArtifact | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    setArtifacts(buildPipelineService.getArtifacts(currentProject.id));
  }, [currentProject.id]);

  const filtered = artifacts.filter((a) => {
    if (selectedCategory === 'ALL') return true;
    return a.platform === selectedCategory;
  });

  const handleDelete = (id: string) => {
    buildPipelineService.deleteArtifact(id);
    setArtifacts(buildPipelineService.getArtifacts(currentProject.id));
    setDeleteConfirmId(null);
    addToast('Artifact Deleted', 'Storage freed and audit log recorded.', 'info');
  };

  const handleDownload = (artifact: BuildArtifact) => {
    addToast('Artifact Download', `Initiating download of ${artifact.filename || artifact.name}...`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-[#0c101a] border border-[#1f2a3e] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>BUILD ARTIFACTS REGISTRY</span>
          </div>
          <h2 className="text-xl font-black text-white font-mono tracking-tight mt-0.5">
            Artifact Storage & Distribution
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Signed game packages, Web exports, Android APKs, and checksum verification with credential-safe isolation.
          </p>
        </div>

        {/* Security badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
          <ShieldCheck className="w-4 h-4" />
          <span>Private Storage • SHA-256 Verified</span>
        </div>
      </div>

      {/* Category Tabs (Section 40) */}
      <div className="flex items-center gap-2 border-b border-[#1c2638] pb-3">
        {(['ALL', 'Web', 'Android', 'PC'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-[#111726] text-slate-400 hover:text-white hover:bg-[#1a2338]'
            }`}
          >
            {cat === 'ALL' ? 'All Artifacts' : `${cat} Packages`}
          </button>
        ))}
      </div>

      {/* Artifacts Table */}
      <div className="rounded-2xl bg-[#0a0e18] border border-[#1c2638] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#0e1424] text-slate-400 border-b border-[#1c2638]">
              <tr>
                <th className="py-3 px-4">Artifact Name</th>
                <th className="py-3 px-4">Platform</th>
                <th className="py-3 px-4">Build</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Checksum (SHA-256)</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c2638]/50 text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No artifacts found for this platform filter.
                  </td>
                </tr>
              ) : (
                filtered.map((art) => (
                  <tr key={art.id} className="hover:bg-[#111728]/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <FileArchive className="w-4 h-4 text-indigo-400 shrink-0" />
                        <div>
                          <div className="font-bold text-white">{art.name}</div>
                          <div className="text-[10px] text-slate-500">{art.filename || art.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 text-[11px] font-semibold border border-indigo-500/30">
                        {art.platform}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      Build #{art.buildId.replace('build-', '')}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-200">
                      {art.sizeFormatted}
                    </td>
                    <td className="py-3 px-4 text-[10px] text-slate-400 font-mono truncate max-w-[140px]" title={art.checksum || 'N/A'}>
                      {art.checksum ? `${art.checksum.substring(0, 16)}...` : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-400">
                      {new Date(art.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setInspectArtifact(art)}
                          className="p-1.5 rounded-lg bg-[#141b2c] hover:bg-[#1e273d] text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Inspect Metadata & Integrity"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDownload(art)}
                          className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
                          title="Download Artifact Package"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(art.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-colors cursor-pointer"
                          title="Delete Artifact"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Modal */}
      {inspectArtifact && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d121f] border border-[#232f48] rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#232f48]">
              <div className="flex items-center gap-2 text-white font-mono font-bold text-sm">
                <FileArchive className="w-4 h-4 text-indigo-400" />
                <span>Artifact Inspection</span>
              </div>
              <button
                onClick={() => setInspectArtifact(null)}
                className="text-slate-400 hover:text-white text-xs font-mono cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono text-slate-300">
              <div><strong className="text-slate-400">Name:</strong> {inspectArtifact.name}</div>
              <div><strong className="text-slate-400">Filename:</strong> {inspectArtifact.filename || inspectArtifact.name}</div>
              <div><strong className="text-slate-400">Platform:</strong> {inspectArtifact.platform}</div>
              <div><strong className="text-slate-400">Size:</strong> {inspectArtifact.sizeFormatted} ({inspectArtifact.sizeBytes} bytes)</div>
              <div><strong className="text-slate-400">Full SHA-256 Checksum:</strong></div>
              <div className="p-2 rounded bg-black/60 text-[10px] text-emerald-400 break-all select-all font-mono">
                {inspectArtifact.checksum || 'N/A'}
              </div>
              <div><strong className="text-slate-400">Storage URI:</strong> {inspectArtifact.storagePath || inspectArtifact.location}</div>
            </div>

            <div className="pt-3 border-t border-[#232f48] flex justify-end">
              <button
                onClick={() => setInspectArtifact(null)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d121f] border border-rose-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h4 className="text-sm font-bold text-white font-mono">
              Confirm Artifact Deletion
            </h4>
            <p className="text-xs text-slate-300 font-mono">
              Are you sure you want to delete this build artifact package? This will free storage and cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 rounded-lg bg-[#141b2c] text-slate-300 hover:text-white text-xs font-mono cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
