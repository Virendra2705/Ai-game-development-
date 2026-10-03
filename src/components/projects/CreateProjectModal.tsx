import React, { useState } from 'react';
import {
  X,
  Plus,
  FolderGit2,
  Sparkles,
  Layers,
  Cpu,
  Monitor,
  Gamepad2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EngineType, PlatformType, DevMode } from '../../types';

export const CreateProjectModal: React.FC = () => {
  const { createProjectModalOpen, setCreateProjectModalOpen, createProject, setActiveTab } =
    useApp();

  const [name, setName] = useState('');
  const [genre, setGenre] = useState('3D Action RPG');
  const [description, setDescription] = useState('');
  const [platform, setPlatform] = useState<PlatformType>('Cross Platform');
  const [engine, setEngine] = useState<EngineType>('Godot');
  const [resolution, setResolution] = useState('1920x1080 (16:9)');
  const [devMode, setDevMode] = useState<DevMode>('Autonomous Loop');
  const [thumbnailUrl, setThumbnailUrl] = useState(
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80'
  );

  if (!createProjectModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createProject({
      name: name.trim(),
      genre,
      description:
        description.trim() ||
        `Next-generation ${genre} developed with AI agent assistance using ${engine}.`,
      platform,
      engine,
      progress: 0,
      status: 'Development',
      currentPhase: 'Architecture & Prototyping',
      resolution,
      devMode,
      thumbnailUrl,
    });

    setCreateProjectModalOpen(false);
    setName('');
    setDescription('');
    setActiveTab('Dashboard');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
      onClick={() => setCreateProjectModalOpen(false)}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-[#0d121c] border border-[#232f48] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1d273a] bg-[#111726]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono">Create New Game Project</h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Initialize project workspace and spawn agent swarm structure.
              </p>
            </div>
          </div>

          <button
            onClick={() => setCreateProjectModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#182133] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto custom-scrollbar space-y-4 text-xs">
          {/* Project Name */}
          <div className="space-y-1.5">
            <label className="block text-slate-300 font-mono font-semibold">
              Project Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. VALKYRIE: SKY WARDENS"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#080c14] border border-[#1f2a3d] text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono text-sm"
            />
          </div>

          {/* Game Genre & Engine */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-mono font-semibold">Game Genre</label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="e.g. 3D Open World RPG, Roguelike Deckbuilder"
                className="w-full px-3.5 py-2 rounded-xl bg-[#080c14] border border-[#1f2a3d] text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-300 font-mono font-semibold">Target Engine</label>
              <select
                value={engine}
                onChange={(e) => setEngine(e.target.value as EngineType)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#080c14] border border-[#1f2a3d] text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
              >
                <option value="Godot">Godot (Recommended for AI loop)</option>
                <option value="Unity">Unity</option>
                <option value="Unreal">Unreal Engine</option>
                <option value="Web/HTML5">Web/HTML5 (Three.js/Phaser)</option>
                <option value="Custom">Custom Engine</option>
              </select>
            </div>
          </div>

          {/* Target Platform & Resolution */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-mono font-semibold">Target Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as PlatformType)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#080c14] border border-[#1f2a3d] text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
              >
                <option value="Android / PC">Android / PC (Cross Platform)</option>
                <option value="PC">PC (Windows / Linux / macOS)</option>
                <option value="Android">Android Mobile</option>
                <option value="Web">Web Browser (Wasm/WebGL)</option>
                <option value="Cross Platform">Full Cross Platform</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-300 font-mono font-semibold">
                Resolution / Aspect Ratio
              </label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#080c14] border border-[#1f2a3d] text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
              >
                <option value="1920x1080 (16:9)">1920x1080 (16:9 Desktop)</option>
                <option value="2560x1440 (16:9)">2560x1440 (16:9 QHD)</option>
                <option value="1080x2400 (9:20)">1080x2400 (9:20 Mobile Portrait)</option>
                <option value="2048x1536 (4:3)">2048x1536 (4:3 Tablet)</option>
              </select>
            </div>
          </div>

          {/* Development Mode */}
          <div className="space-y-1.5">
            <label className="block text-slate-300 font-mono font-semibold">Development Mode</label>
            <div className="grid grid-cols-2 gap-2 font-mono">
              {[
                { id: 'Autonomous Loop', label: 'Autonomous Loop', desc: 'Continuous agent iteration' },
                { id: 'Human-in-the-Loop', label: 'Human-in-the-Loop', desc: 'Requires task approval' },
                { id: 'Standard', label: 'Standard', desc: 'Manual task assignment' },
                { id: 'Prototype', label: 'Prototype', desc: 'Rapid proof-of-concept' },
              ].map((m) => (
                <div
                  key={m.id}
                  onClick={() => setDevMode(m.id as DevMode)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    devMode === m.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-[#0b0f17] border-[#1d273a] text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold text-xs text-slate-200">{m.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{m.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Game Description */}
          <div className="space-y-1.5">
            <label className="block text-slate-300 font-mono font-semibold">Game Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="High-level vision, core gameplay loop, art style, and target audience..."
              className="w-full px-3.5 py-2 rounded-xl bg-[#080c14] border border-[#1f2a3d] text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none text-xs leading-relaxed"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#1d273a] flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">
              Persisted to local application storage
            </span>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setCreateProjectModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#151c2a] hover:bg-[#1c2538] text-slate-300 font-mono font-medium transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-mono font-semibold shadow-[0_0_15px_rgba(99,102,241,0.25)] transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Project</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
