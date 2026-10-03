import React, { useState } from 'react';
import {
  FolderGit2,
  Plus,
  Search,
  ExternalLink,
  MoreVertical,
  Layers,
  Sparkles,
  Calendar,
  Cpu,
  Monitor,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Project } from '../../types';

export const ProjectsPage: React.FC = () => {
  const { projects, currentProject, setCurrentProjectId, setCreateProjectModalOpen, setActiveTab, addToast } =
    useApp();

  const [search, setSearch] = useState('');
  const [selectedEngine, setSelectedEngine] = useState('all');

  const filteredProjects = projects.filter((p) => {
    if (selectedEngine !== 'all' && p.engine !== selectedEngine) return false;
    if (search.trim()) {
      const matchName = p.name.toLowerCase().includes(search.toLowerCase());
      const matchGenre = p.genre.toLowerCase().includes(search.toLowerCase());
      if (!matchName && !matchGenre) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-semibold uppercase tracking-wider">
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>PROJECT REPOSITORY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight mt-1">
            Game Projects ({projects.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Manage your AI game titles, engines, target platforms, and autonomous milestones.
          </p>
        </div>

        <button
          onClick={() => setCreateProjectModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-mono font-semibold text-xs shadow-[0_0_15px_rgba(99,102,241,0.25)] transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New Project</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#0d121c] border border-[#1e283c]">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name, genre..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#121927] border border-[#202b40] text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Engine:</span>
          <select
            value={selectedEngine}
            onChange={(e) => setSelectedEngine(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#121927] border border-[#202b40] text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Engines</option>
            <option value="Godot">Godot</option>
            <option value="Unity">Unity</option>
            <option value="Unreal">Unreal</option>
            <option value="Web/HTML5">Web/HTML5</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.map((project) => {
          const isActive = project.id === currentProject.id;
          return (
            <div
              key={project.id}
              className={`rounded-2xl bg-[#0c101a] border transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-xl group ${
                isActive
                  ? 'border-indigo-500/60 shadow-[0_0_20px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/30'
                  : 'border-[#1f2a3e] hover:border-[#2d3d59]'
              }`}
            >
              {/* Thumbnail Container */}
              <div className="relative h-44 overflow-hidden bg-[#101624]">
                <img
                  src={project.thumbnailUrl}
                  alt={project.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c101a] via-[#0c101a]/40 to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-mono font-semibold text-indigo-300">
                    {project.engine}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-mono text-slate-300">
                    {project.platform}
                  </span>
                </div>

                {isActive && (
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-emerald-950/80 backdrop-blur-md border border-emerald-500/40 text-[10px] font-mono font-semibold text-emerald-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>ACTIVE IN HUB</span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-semibold">
                        {project.genre}
                      </span>
                      <h3 className="text-base font-bold text-white font-mono tracking-tight group-hover:text-indigo-300 transition-colors">
                        {project.name}
                      </h3>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToast('Project Options', `Config for ${project.name}`, 'info');
                      }}
                      className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#182133]"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Progress Bar & Meta */}
                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-indigo-300 font-bold">{project.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#182133] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-[#1a2335]">
                    <span>Phase: {project.currentPhase}</span>
                    <span>Updated {project.lastUpdated}</span>
                  </div>
                </div>
              </div>

              {/* Footer Open Button */}
              <div className="p-4 border-t border-[#1a2335] bg-[#090d16]/60 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">
                  Mode: {project.devMode}
                </span>

                <button
                  onClick={() => {
                    setCurrentProjectId(project.id);
                    setActiveTab('Dashboard');
                  }}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow'
                  }`}
                >
                  <span>{isActive ? 'Dashboard' : 'Open Project'}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
