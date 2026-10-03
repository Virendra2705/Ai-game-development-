import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Layers,
  FileBox,
  Image as ImageIcon,
  Volume2,
  Video,
  Sliders,
  Check,
  Plus,
} from 'lucide-react';
import { AssetCategoryType } from '../../types/assets';
import { Asset } from '../../types';

interface AssetGenerateModalProps {
  existingAssets: Asset[];
  onClose: () => void;
  onCreatePlan: (request: {
    name: string;
    type: AssetCategoryType;
    description: string;
    style: string;
    target: string;
    requirements: string[];
    references: string[];
    isBatch?: boolean;
    batchCount?: number;
  }) => void;
  initialBatch?: boolean;
}

export const AssetGenerateModal: React.FC<AssetGenerateModalProps> = ({
  existingAssets,
  onClose,
  onCreatePlan,
  initialBatch = false,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<AssetCategoryType>('CREATURE');
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState('Semi-stylized Anime 3D / Cel-shaded PBR (Embervale Standard)');
  const [target, setTarget] = useState('Mobile Vulkan (Godot 4.3 Forward+)');
  const [additionalRequirement, setAdditionalRequirement] = useState('');
  const [requirements, setRequirements] = useState<string[]>([
    'Mobile polygon budget <= 16,000 tris',
    'Embedded PBR Albedo, Normal, Roughness buffers',
  ]);
  const [selectedReferences, setSelectedReferences] = useState<string[]>([]);
  const [isBatch, setIsBatch] = useState(initialBatch);
  const [batchCount, setBatchCount] = useState(10);

  const assetCategories: { id: AssetCategoryType; label: string; icon: any }[] = [
    { id: 'CREATURE', label: 'Creature', icon: FileBox },
    { id: 'CHARACTER', label: 'Character', icon: FileBox },
    { id: '3D_MODEL', label: '3D Model', icon: FileBox },
    { id: 'ENVIRONMENT', label: 'Environment', icon: ImageIcon },
    { id: 'PROP', label: 'Prop', icon: FileBox },
    { id: 'WEAPON', label: 'Weapon', icon: FileBox },
    { id: 'ITEM', label: 'Item', icon: FileBox },
    { id: 'IMAGE', label: '2D Image / Sprite', icon: ImageIcon },
    { id: 'TEXTURE', label: 'PBR Texture', icon: ImageIcon },
    { id: 'ANIMATION', label: 'Animation Clip', icon: FileBox },
    { id: 'VFX', label: 'VFX Particle', icon: Sparkles },
    { id: 'ICON', label: 'Icon Set', icon: ImageIcon },
    { id: 'UI_ASSET', label: 'UI Asset', icon: Sliders },
    { id: 'AUDIO', label: 'Audio / SFX', icon: Volume2 },
    { id: 'MUSIC', label: 'Background Music', icon: Volume2 },
    { id: 'VOICE', label: 'Spoken Voice', icon: Volume2 },
    { id: 'VIDEO', label: 'Video / Cinematic', icon: Video },
  ];

  const handleAddRequirement = () => {
    if (!additionalRequirement.trim()) return;
    setRequirements([...requirements, additionalRequirement.trim()]);
    setAdditionalRequirement('');
  };

  const handleRemoveRequirement = (idx: number) => {
    setRequirements(requirements.filter((_, i) => i !== idx));
  };

  const handleToggleReference = (assetId: string) => {
    if (selectedReferences.includes(assetId)) {
      setSelectedReferences(selectedReferences.filter((id) => id !== assetId));
    } else {
      setSelectedReferences([...selectedReferences, assetId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    onCreatePlan({
      name: name.trim(),
      type,
      description: description.trim(),
      style,
      target,
      requirements,
      references: selectedReferences,
      isBatch,
      batchCount: isBatch ? batchCount : 1,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md font-mono text-xs">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-[#0c101a] border border-[#1f2a3e] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#1c2638] bg-[#080c14] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Generate Asset With Gemini Planning
              </h3>
              <p className="text-[10px] text-slate-400">
                Phase 6 • Formulate multi-stage production plan with automated validation
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Section 34: Batch Generation Toggle */}
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <div>
                <div className="font-bold text-white">Batch Generation Mode (Section 34)</div>
                <div className="text-[10px] text-indigo-300/80">Generate multiple asset concepts or icons in parallel</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isBatch && (
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-300">Count:</span>
                  <select
                    value={batchCount}
                    onChange={(e) => setBatchCount(Number(e.target.value))}
                    className="p-1 rounded bg-[#080c14] border border-indigo-500/40 text-white text-[10px]"
                  >
                    <option value={5}>5 Assets</option>
                    <option value={10}>10 Assets</option>
                    <option value={20}>20 Assets</option>
                  </select>
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsBatch(!isBatch)}
                className={`px-3 py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                  isBatch
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-[#121826] text-slate-400 border-[#1d273a]'
                }`}
              >
                {isBatch ? 'Active' : 'Enable Batch'}
              </button>
            </div>
          </div>

          {/* Section 8: WHAT DO YOU WANT TO CREATE? */}
          <div className="space-y-2">
            <label className="text-slate-300 font-bold uppercase text-[10px] tracking-wider">
              Asset Category (22 Types Supported)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {assetCategories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = type === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setType(cat.id)}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/20 text-white border-indigo-500 shadow-sm shadow-indigo-500/20'
                        : 'bg-[#080c14] text-slate-400 border-[#1a2334] hover:text-white hover:border-[#25334c]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span className="truncate text-xs font-semibold">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name & Prompt */}
          <div className="space-y-3">
            <div>
              <label className="text-slate-300 font-bold uppercase text-[10px]">Asset Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sparkit, Rift Golem, Meadow Battle Music, Inventory Sword Icon"
                required
                className="w-full mt-1 p-2.5 rounded-xl bg-[#080c14] border border-[#1a2334] text-white text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold uppercase text-[10px]">
                Description & Detailed Prompt ("What do you want to create?")
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe visuals, anatomical features, lighting, animations, or acoustic mood..."
                required
                className="w-full h-20 mt-1 p-2.5 rounded-xl bg-[#080c14] border border-[#1a2334] text-white text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Style & Target Presets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-bold uppercase text-[10px]">Art Style Consistency</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full mt-1 p-2 rounded-xl bg-[#080c14] border border-[#1a2334] text-white text-xs focus:outline-none"
              >
                <option value="Semi-stylized Anime 3D / Cel-shaded PBR (Embervale Standard)">
                  Embervale Anime Cel-shaded PBR
                </option>
                <option value="Stylized Hand-painted Fantasy">Stylized Hand-painted Fantasy</option>
                <option value="Vibrant Retro Pixel Art 32x32">Vibrant Retro Pixel Art</option>
                <option value="Dark Fantasy Gritty Realism">Dark Fantasy Gritty Realism</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-bold uppercase text-[10px]">Hardware & Engine Target</label>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full mt-1 p-2 rounded-xl bg-[#080c14] border border-[#1a2334] text-white text-xs focus:outline-none"
              >
                <option value="Mobile Vulkan (Godot 4.3 Forward+)">Mobile Vulkan (Godot 4.3)</option>
                <option value="PC High-Fidelity 60FPS">PC High-Fidelity 60FPS</option>
                <option value="WebAssembly / Lightweight">WebAssembly / Lightweight</option>
              </select>
            </div>
          </div>

          {/* Section 21: Reference Assets */}
          <div className="space-y-2">
            <label className="text-slate-300 font-bold uppercase text-[10px]">
              Reference Assets from Project (Section 21)
            </label>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 rounded-xl bg-[#080c14] border border-[#1a2334]">
              {existingAssets.slice(0, 6).map((refAsset) => {
                const isSelected = selectedReferences.includes(refAsset.id);
                return (
                  <button
                    key={refAsset.id}
                    type="button"
                    onClick={() => handleToggleReference(refAsset.id)}
                    className={`px-2.5 py-1 rounded-lg border text-[10px] flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500'
                        : 'bg-[#111726] text-slate-400 border-[#1d273a] hover:text-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-indigo-400" />}
                    <span>{refAsset.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Additional Requirements list */}
          <div className="space-y-2">
            <label className="text-slate-300 font-bold uppercase text-[10px]">Production Constraints</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={additionalRequirement}
                onChange={(e) => setAdditionalRequirement(e.target.value)}
                placeholder="Add constraint (e.g. Needs Quadruped Armature, LOD0-2)"
                className="flex-1 p-2 rounded-xl bg-[#080c14] border border-[#1a2334] text-white text-xs focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddRequirement}
                className="p-2 rounded-xl bg-[#141c2c] hover:bg-[#1a253a] text-slate-200 border border-[#222f46] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {requirements.map((req, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-[10px] flex items-center gap-1"
                >
                  <span>{req}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRequirement(i)}
                    className="hover:text-white cursor-pointer ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Footer Submit */}
          <div className="p-3 border-t border-[#1a2334] flex items-center justify-between gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#141c2c] hover:bg-[#1a253a] text-slate-300 font-bold cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create Asset Plan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
