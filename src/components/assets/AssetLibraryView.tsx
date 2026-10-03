import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Star,
  Eye,
  CheckCircle,
  XCircle,
  FileBox,
  Volume2,
  Video,
  Image as ImageIcon,
  Sparkles,
  Layers,
  FolderInput,
  Check,
  AlertCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Asset, AssetStatus } from '../../types';

interface AssetLibraryViewProps {
  assets: Asset[];
  onSelectAsset: (asset: Asset) => void;
  onApproveAsset: (asset: Asset) => void;
  onImportAsset: (asset: Asset) => void;
  onToggleFavorite: (assetId: string) => void;
  onOpenGenerateModal: () => void;
  onCompareVersions?: (asset: Asset, v1: string, v2: string) => void;
}

export const AssetLibraryView: React.FC<AssetLibraryViewProps> = ({
  assets,
  onSelectAsset,
  onApproveAsset,
  onImportAsset,
  onToggleFavorite,
  onOpenGenerateModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'updated' | 'name' | 'type' | 'status'>('newest');

  // Section 4 Filters
  const filterTabs = [
    { id: 'ALL', label: 'All Assets' },
    { id: 'CREATURE', label: 'Creatures' },
    { id: 'CHARACTER', label: 'Characters' },
    { id: '3D_MODEL', label: '3D Models' },
    { id: 'IMAGE', label: 'Images' },
    { id: 'TEXTURE', label: 'Textures' },
    { id: 'ANIMATION', label: 'Animations' },
    { id: 'AUDIO', label: 'Audio' },
    { id: 'MUSIC', label: 'Music' },
    { id: 'VFX', label: 'VFX' },
    { id: 'UI_ASSET', label: 'UI' },
    { id: 'VIDEO', label: 'Video' },
    { id: 'FAVORITES', label: 'Favorites' },
    { id: 'ARCHIVED', label: 'Archived' },
  ];

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = asset.name.toLowerCase().includes(q);
        const matchType = String(asset.type).toLowerCase().includes(q);
        const matchUsed = (asset.usedIn || '').toLowerCase().includes(q);
        const matchTags = (asset.tags || []).some((t) => t.toLowerCase().includes(q));
        const matchFormat = (asset.format || '').toLowerCase().includes(q);
        if (!matchName && !matchType && !matchUsed && !matchTags && !matchFormat) {
          return false;
        }
      }

      // Filter Tabs
      if (activeFilter === 'ALL') return !asset.isArchived;
      if (activeFilter === 'FAVORITES') return asset.isFavorite && !asset.isArchived;
      if (activeFilter === 'ARCHIVED') return asset.isArchived;

      const normType = String(asset.type).toUpperCase();
      if (activeFilter === 'CREATURE') return normType.includes('CREATURE');
      if (activeFilter === 'CHARACTER') return normType.includes('CHARACTER') || normType.includes('NPC');
      if (activeFilter === '3D_MODEL') return normType.includes('3D') || normType.includes('MODEL') || asset.previewType === '3d';
      if (activeFilter === 'IMAGE') return normType.includes('IMAGE') || normType.includes('SPRITE');
      if (activeFilter === 'TEXTURE') return normType.includes('TEXTURE') || normType.includes('MATERIAL');
      if (activeFilter === 'ANIMATION') return normType.includes('ANIMATION');
      if (activeFilter === 'AUDIO') return normType.includes('AUDIO') || normType.includes('SOUND');
      if (activeFilter === 'MUSIC') return normType.includes('MUSIC');
      if (activeFilter === 'VFX') return normType.includes('VFX');
      if (activeFilter === 'UI_ASSET') return normType.includes('UI') || normType.includes('ICON');
      if (activeFilter === 'VIDEO') return normType.includes('VIDEO') || normType.includes('CINEMATIC');

      return true;
    });
  }, [assets, searchQuery, activeFilter]);

  const sortedAssets = useMemo(() => {
    return [...filteredAssets].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'type') return String(a.type).localeCompare(String(b.type));
      if (sortBy === 'status') return String(a.status).localeCompare(String(b.status));
      if (sortBy === 'updated') {
        const dateA = new Date(a.updatedAt || a.lastModified || 0).getTime();
        const dateB = new Date(b.updatedAt || b.lastModified || 0).getTime();
        return dateB - dateA;
      }
      // default: newest
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }, [filteredAssets, sortBy]);

  // Status badge styling helper (Section 5)
  const getStatusBadge = (status: AssetStatus) => {
    switch (status) {
      case 'APPROVED':
      case 'Approved':
        return {
          label: 'APPROVED',
          classes: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
          icon: CheckCircle,
        };
      case 'IMPORTED':
      case 'INTEGRATED':
      case 'Integrated':
        return {
          label: 'IMPORTED',
          classes: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
          icon: FolderInput,
        };
      case 'REVIEW_REQUIRED':
      case 'REVIEW':
      case 'Review':
        return {
          label: 'REVIEW REQUIRED',
          classes: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          icon: Clock,
        };
      case 'GENERATING':
      case 'Generating':
      case 'PROCESSING':
        return {
          label: 'GENERATING',
          classes: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
          icon: Sparkles,
        };
      case 'REJECTED':
        return {
          label: 'REJECTED',
          classes: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
          icon: XCircle,
        };
      case 'ARCHIVED':
        return {
          label: 'ARCHIVED',
          classes: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
          icon: Layers,
        };
      default:
        return {
          label: String(status).toUpperCase(),
          classes: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
          icon: FileBox,
        };
    }
  };

  const getPreviewIcon = (asset: Asset) => {
    if (asset.previewType === '3d' || String(asset.type).includes('3D') || String(asset.type).includes('Creature')) {
      return <FileBox className="w-3.5 h-3.5 text-indigo-400" />;
    }
    if (asset.previewType === 'audio' || String(asset.type).includes('Audio') || String(asset.type).includes('Music')) {
      return <Volume2 className="w-3.5 h-3.5 text-amber-400" />;
    }
    if (asset.previewType === 'video' || String(asset.type).includes('Video')) {
      return <Video className="w-3.5 h-3.5 text-rose-400" />;
    }
    return <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />;
  };

  return (
    <div className="space-y-4 font-mono">
      {/* Search & Sort Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[#0c101a] border border-[#1f2a3e]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search assets by name, category, tag, format, or usage..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#080c14] border border-[#1d273a] text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#080c14] border border-[#1d273a] text-xs text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] text-slate-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="newest" className="bg-[#0c101a]">Newest First</option>
              <option value="updated" className="bg-[#0c101a]">Recently Updated</option>
              <option value="name" className="bg-[#0c101a]">Name (A-Z)</option>
              <option value="type" className="bg-[#0c101a]">Asset Type</option>
              <option value="status" className="bg-[#0c101a]">Status</option>
            </select>
          </div>

          <button
            onClick={onOpenGenerateModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Asset</span>
          </button>
        </div>
      </div>

      {/* Section 4: Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1 rounded-xl whitespace-nowrap transition-all font-semibold cursor-pointer border ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-500/25'
                  : 'bg-[#0c101a] text-slate-400 border-[#1c2638] hover:text-white hover:border-[#27354d]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Section 4 & 6: Asset Cards Grid */}
      {sortedAssets.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0c101a] border border-[#1f2a3e] space-y-3">
          <FileBox className="w-10 h-10 text-slate-400 mx-auto" />
          <div className="text-base font-bold text-white">No assets match your search</div>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try adjusting your search filters or generate a new asset using the Gemini Orchestration engine.
          </p>
          <button
            onClick={onOpenGenerateModal}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate First Asset</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedAssets.map((asset) => {
            const badge = getStatusBadge(asset.status);
            const BadgeIcon = badge.icon;
            const isCanApprove = asset.status === 'REVIEW_REQUIRED' || asset.status === 'Review';
            const isCanImport = asset.status === 'APPROVED' || asset.status === 'Approved';

            return (
              <div
                key={asset.id}
                className="group flex flex-col justify-between rounded-2xl bg-[#0c101a] border border-[#1c2638] hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/5 transition-all overflow-hidden"
              >
                {/* Card Header & Preview */}
                <div>
                  <div className="relative aspect-video sm:aspect-square bg-[#080c14] overflow-hidden border-b border-[#1c2638]">
                    <img
                      src={
                        asset.thumbnailUrl ||
                        asset.thumbnail ||
                        'https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?w=400&auto=format&fit=crop&q=80'
                      }
                      alt={asset.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080c14] via-transparent to-black/30 pointer-events-none" />

                    {/* Top badging */}
                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-auto">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-[10px] text-white">
                        {getPreviewIcon(asset)}
                        <span>{asset.type}</span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(asset.id);
                        }}
                        className={`p-1 rounded-lg backdrop-blur-md transition-colors cursor-pointer ${
                          asset.isFavorite
                            ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                            : 'bg-black/60 text-slate-400 hover:text-white border border-white/10'
                        }`}
                        title={asset.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Star className={`w-3.5 h-3.5 ${asset.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                      </button>
                    </div>

                    {/* Version & Polycount pill at bottom of thumbnail */}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-slate-300">
                      <span className="px-1.5 py-0.5 rounded bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 font-bold">
                        {asset.version}
                      </span>
                      {asset.polygonCount ? (
                        <span className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10">
                          {asset.polygonCount.toLocaleString()} tris
                        </span>
                      ) : asset.duration ? (
                        <span className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10">
                          {asset.duration}
                        </span>
                      ) : asset.fileSize ? (
                        <span className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10">
                          {asset.fileSize}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-3 space-y-2">
                    <div>
                      <div className="font-bold text-white text-xs truncate group-hover:text-indigo-300 transition-colors">
                        {asset.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">
                        {asset.usedIn ? (
                          <span className="text-slate-300">Used In: {asset.usedIn}</span>
                        ) : (
                          <span>Format: {asset.format || 'glTF 2.0 / PBR'}</span>
                        )}
                      </div>
                    </div>

                    {/* Status Pill (Section 5) */}
                    <div className="flex items-center justify-between text-[10px]">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border font-bold ${badge.classes}`}
                      >
                        <BadgeIcon className="w-3 h-3" />
                        <span>{badge.label}</span>
                      </span>

                      {asset.validationResult?.score && (
                        <span className="text-[10px] text-slate-400">
                          Score: <span className="text-emerald-400 font-bold">{asset.validationResult.score}%</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-2.5 pt-0 border-t border-[#1a2334] bg-[#0c101a] flex items-center gap-1.5 mt-2">
                  <button
                    onClick={() => onSelectAsset(asset)}
                    className="flex-1 py-1.5 rounded-lg bg-[#141c2c] hover:bg-[#1a253a] text-slate-200 hover:text-white border border-[#222f46] text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3 h-3 text-indigo-400" />
                    <span>Inspect</span>
                  </button>

                  {isCanApprove && (
                    <button
                      onClick={() => onApproveAsset(asset)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                      title="Approve asset"
                    >
                      <Check className="w-3 h-3" />
                      <span>Approve</span>
                    </button>
                  )}

                  {isCanImport && (
                    <button
                      onClick={() => onImportAsset(asset)}
                      className="px-2.5 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/30 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                      title="Import into project workspace"
                    >
                      <FolderInput className="w-3 h-3" />
                      <span>Import</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
