import React, { useState } from 'react';
import {
  GitBranch,
  Github,
  GitCommit,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Link,
  FolderGit2,
  ShieldCheck,
  Unlink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { gitService } from '../../services/gitService';
import { Repository } from '../../types';

export const RepositoryDashboardPanel: React.FC = () => {
  const { currentProject, addToast, setActiveTab } = useApp();
  const [repo, setRepo] = useState<Repository>(() =>
    gitService.getRepositoryForProject(currentProject.id)
  );
  const [isConnecting, setIsConnecting] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [repoUrlInput, setRepoUrlInput] = useState('');

  const handleRefresh = () => {
    const updated = gitService.getRepositoryForProject(currentProject.id);
    setRepo({ ...updated, lastUpdated: 'Just now' });
    addToast('Repository Synced', 'Fetched latest branches and commits.', 'info');
  };

  const handleConnect = () => {
    if (!repoUrlInput.trim()) return;
    setIsConnecting(true);
    setTimeout(() => {
      const connected = gitService.connectRepository(currentProject.id, repoUrlInput.trim());
      setRepo({ ...connected });
      setIsConnecting(false);
      setShowConnectDialog(false);
      setRepoUrlInput('');
      addToast('Repository Connected', `Linked ${connected.owner}/${connected.name}`, 'success');
    }, 500);
  };

  const handleDisconnect = () => {
    const disconnected = gitService.disconnectRepository(currentProject.id);
    setRepo({ ...disconnected });
    addToast('Repository Disconnected', 'Coding agent execution is paused.', 'warning');
  };

  const shortHash = repo.latestCommit?.shortHash || 'a19c4e2';

  return (
    <div
      id="project-repository-dashboard-panel"
      className="p-5 sm:p-6 rounded-2xl bg-[#0c101a] border border-[#1f2a3e] shadow-xl flex flex-col justify-between space-y-4"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-widest text-purple-400 uppercase font-bold">
                VERSION CONTROL & GIT
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white font-mono">
                REPOSITORY
              </h3>
            </div>
          </div>

          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#151c2c] border border-[#232f46] text-[10px] font-mono text-slate-300">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                repo.connected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
              }`}
            />
            <span>{repo.connected ? 'Connected' : 'Not Connected'}</span>
          </span>
        </div>

        {/* Section 37 Spec: Main Key-Value Information Grid */}
        <div className="p-3.5 rounded-xl bg-[#0f1524] border border-[#1d273a] space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
            {/* Connected */}
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Connected:</div>
              <div className="flex items-center gap-1.5 mt-0.5 font-bold text-white">
                <Github className="w-3.5 h-3.5 text-slate-300" />
                <span>{repo.provider || 'GitHub'}</span>
              </div>
            </div>

            {/* Branch */}
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Branch:</div>
              <div className="flex items-center gap-1 mt-0.5 font-bold text-amber-300">
                <GitBranch className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{repo.defaultBranch || 'main'}</span>
              </div>
            </div>

            {/* Latest Commit */}
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Latest Commit:</div>
              <div className="flex items-center gap-1 mt-0.5 font-bold text-emerald-400">
                <GitCommit className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{shortHash}</span>
              </div>
            </div>

            {/* AI Branch */}
            <div>
              <div className="text-[10px] text-slate-400 uppercase">AI Branch:</div>
              <div className="flex items-center gap-1 mt-0.5 font-bold text-indigo-300 truncate">
                <GitBranch className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="truncate">{repo.developmentBranch || 'ai-development'}</span>
              </div>
            </div>
          </div>

          {/* Commit details line */}
          {repo.latestCommit && (
            <div className="flex items-center justify-between pt-2 border-t border-[#182337] text-[11px] font-mono text-slate-300 truncate">
              <span className="text-slate-400 truncate mr-2">
                &ldquo;{repo.latestCommit.message}&rdquo;
              </span>
              <span className="text-[10px] text-slate-400 shrink-0">
                {repo.latestCommit.date}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Buttons (Section 37: Open Repository, Refresh, Repository Settings) */}
      <div className="grid grid-cols-3 gap-2 pt-2">
        <a
          id="repository-open-btn"
          href={repo.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold shadow-lg shadow-purple-600/20 transition-all active:scale-95 text-center truncate"
        >
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Open Repo</span>
        </a>

        <button
          id="repository-refresh-btn"
          type="button"
          onClick={handleRefresh}
          className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-[#141c2c] hover:bg-[#1a253b] text-slate-200 hover:text-white border border-[#223049] text-xs font-mono font-semibold transition-all active:scale-95 text-center"
        >
          <RefreshCw className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span>Refresh</span>
        </button>

        <button
          id="repository-settings-btn"
          type="button"
          onClick={() => setActiveTab('Settings')}
          className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-[#141c2c] hover:bg-[#1a253b] text-slate-200 hover:text-white border border-[#223049] text-xs font-mono font-semibold transition-all active:scale-95 text-center truncate"
        >
          <FolderGit2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate">Repo Settings</span>
        </button>
      </div>

      {/* Connect Modal */}
      {showConnectDialog && (
        <div className="p-4 rounded-xl bg-[#111726] border border-indigo-500/40 space-y-3 animate-fadeIn">
          <span className="text-xs font-mono font-bold text-white block">
            Connect Git Repository URL
          </span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={repoUrlInput}
              onChange={(e) => setRepoUrlInput(e.target.value)}
              placeholder="https://github.com/organization/game-repository"
              className="flex-1 px-3 py-2 rounded-lg bg-[#0a0e17] border border-[#1f2b40] text-xs font-mono text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={handleConnect}
              disabled={!repoUrlInput.trim() || isConnecting}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold transition-colors disabled:opacity-40"
            >
              {isConnecting ? 'Linking...' : 'Connect'}
            </button>
            <button
              type="button"
              onClick={() => setShowConnectDialog(false)}
              className="px-3 py-2 rounded-lg bg-[#192336] text-slate-400 hover:text-white text-xs font-mono"
            >
              Cancel
            </button>
          </div>
          <span className="text-[11px] font-mono text-slate-400 block">
            Note: Access tokens are managed server-side. Local credentials are never stored in the browser.
          </span>
        </div>
      )}
    </div>
  );
};
