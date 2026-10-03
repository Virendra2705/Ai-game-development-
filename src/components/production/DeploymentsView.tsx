import React, { useState, useEffect } from 'react';
import {
  Server,
  CloudUpload,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Shield,
  FileCheck,
  Cpu,
  Layers,
  Terminal,
  Clock,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { environmentService } from '../../services/environmentService';
import { deploymentProviderService } from '../../services/deploymentProviderService';
import { productionBuildService } from '../../services/productionBuildService';
import { deploymentService } from '../../services/deploymentService';
import { releaseManagerService } from '../../services/releaseManagerService';
import { Environment, Deployment, ProductionArtifact, Release } from '../../types';

export const DeploymentsView: React.FC = () => {
  const { currentProject, addToast } = useApp();
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [selectedEnv, setSelectedEnv] = useState<Environment | null>(null);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [artifacts, setArtifacts] = useState<ProductionArtifact[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isBuildingProd, setIsBuildingProd] = useState(false);
  const [buildLogs, setBuildLogs] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, [currentProject.id]);

  const loadData = () => {
    const envs = environmentService.getEnvironments(currentProject.id);
    const deps = deploymentService.getDeployments(currentProject.id);
    const arts = productionBuildService.getArtifacts(currentProject.id);

    setEnvironments(envs);
    if (envs.length > 0 && !selectedEnv) {
      setSelectedEnv(envs.find((e) => e.type === 'PRODUCTION') || envs[0]);
    }
    setDeployments(deps);
    setArtifacts(arts);
  };

  const handleRunProductionBuild = async () => {
    const candidate = releaseManagerService.getLatestCandidate(currentProject.id) || releaseManagerService.getLiveRelease(currentProject.id);
    if (!candidate) {
      addToast(
        'No Release Selected',
        'Create or select a release candidate before running a production build.',
        'error'
      );
      return;
    }

    setIsBuildingProd(true);
    setBuildLogs(['[PROD BUILD ENGINE INITIALIZING...]']);

    const res = await productionBuildService.runProductionBuild({
      projectId: currentProject.id,
      releaseId: candidate.id,
      version: candidate.version,
      commitRef: 'git#9f4d1c2',
      buildConfiguration: 'Production Release (O3 Optimization, Stripped Symbols, AAB Signed)',
      platform: 'Android',
    });

    setBuildLogs(res.logs);
    setIsBuildingProd(false);

    if (res.success) {
      addToast(
        'Production Build Complete',
        `Artifact ${res.artifact?.id} generated with verified checksum.`,
        'success'
      );
      loadData();
    } else {
      addToast(
        'Build Failed',
        res.error || 'Production build could not complete.',
        'error'
      );
    }
  };

  const handleExecuteDeployment = async () => {
    if (!selectedEnv) return;

    const candidate = releaseManagerService.getLatestCandidate(currentProject.id) || releaseManagerService.getLiveRelease(currentProject.id);
    if (!candidate) {
      addToast(
        'No Release Found',
        'No approved release candidate available to deploy.',
        'error'
      );
      return;
    }

    const latestArt = artifacts[0];
    if (!latestArt) {
      addToast(
        'Missing Production Artifact',
        'Run a production build to generate a signed artifact before deploying.',
        'warning'
      );
      return;
    }

    setIsDeploying(true);
    const operator = 'Alex Vance (Lead Producer)';

    const res = await deploymentService.runDeployment(
      currentProject.id,
      candidate,
      selectedEnv,
      latestArt.id,
      operator
    );

    setIsDeploying(false);
    loadData();

    if (res.success) {
      addToast(
        'Deployment Verified & LIVE',
        `Release v${candidate.version} verified and promoted to LIVE on ${selectedEnv.name}.`,
        'success'
      );
    } else {
      addToast(
        'Deployment Halted',
        res.error || 'Deployment failed.',
        'error'
      );
    }
  };

  const providers = deploymentProviderService.getAllProviders();

  return (
    <div className="space-y-6">
      {/* Top Banner: Environment Management */}
      <div className="p-5 rounded-xl bg-[#0b0e17] border border-[#1a2336] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#182030]">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-indigo-400" />
              Environment Fleet & Deployment Providers
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Strict isolation: Development credentials can NEVER access production deployment infrastructure.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunProductionBuild}
              disabled={isBuildingProd}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#162035] hover:bg-[#1d2b47] text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Cpu className="w-3.5 h-3.5" />
              {isBuildingProd ? 'Running Build...' : 'Run Production Build'}
            </button>
            <button
              onClick={handleExecuteDeployment}
              disabled={isDeploying || !selectedEnv}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <CloudUpload className="w-3.5 h-3.5" />
              {isDeploying ? 'Deploying & Verifying...' : `Deploy to ${selectedEnv?.type || 'Production'}`}
            </button>
          </div>
        </div>

        {/* Environment Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {environments.map((env) => {
            const isSelected = selectedEnv?.id === env.id;
            return (
              <button
                key={env.id}
                onClick={() => setSelectedEnv(env)}
                className={`p-3.5 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'bg-indigo-600/15 border-indigo-500/50 shadow-sm'
                    : 'bg-[#0f1422] hover:bg-[#141b2c] border-[#182338]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-xs font-bold uppercase text-slate-300">{env.type}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      env.status === 'ACTIVE'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {env.status}
                  </span>
                </div>
                <div className="font-semibold text-sm text-white truncate">{env.name}</div>
                <div className="text-[11px] text-slate-400 mt-1 truncate">
                  Provider: {env.deploymentProvider}
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-1.5 truncate">
                  Target: {env.deploymentTarget}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Two Columns: Selected Environment Details & Deployment Providers Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selected Environment Inspector */}
        {selectedEnv && (
          <div className="lg:col-span-2 p-5 rounded-xl bg-[#0b0e17] border border-[#1a2336] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#182030]">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Environment Configuration: {selectedEnv.name}
              </h3>
              <span className="text-xs font-mono text-slate-400">Ver: {selectedEnv.configurationVersion}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-[#07090e] border border-[#161f32] space-y-2">
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">Build Configuration</span>
                <p className="text-slate-200 font-mono text-[11px]">{selectedEnv.buildConfiguration}</p>
                <div className="text-slate-400 pt-1">Platform Target: <strong className="text-slate-200">{selectedEnv.platform}</strong></div>
              </div>

              <div className="p-3 rounded-lg bg-[#07090e] border border-[#161f32] space-y-2">
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">Deployment Target & Track</span>
                <p className="text-slate-200 font-mono text-[11px] truncate">{selectedEnv.deploymentTarget}</p>
                <div className="text-slate-400 pt-1">
                  Provider:{' '}
                  <strong className="text-indigo-300 font-mono">{selectedEnv.deploymentProvider}</strong>
                </div>
              </div>
            </div>

            {/* Build logs terminal if active */}
            {buildLogs.length > 0 && (
              <div className="p-3.5 rounded-lg bg-[#07090e] border border-[#151d2a] font-mono text-[11px] text-slate-300 space-y-1">
                <div className="text-slate-500 pb-1 border-b border-[#141b27] flex justify-between">
                  <span>PRODUCTION BUILD TERMINAL OUTPUT</span>
                  <span className="text-emerald-400">ONLINE</span>
                </div>
                <div className="max-h-36 overflow-y-auto custom-scrollbar space-y-1 mt-2">
                  {buildLogs.map((log, idx) => (
                    <div key={idx} className="text-slate-300">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Deployment Providers Availability Status */}
        <div className="p-5 rounded-xl bg-[#0b0e17] border border-[#1a2336] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#182030]">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              Connected Providers
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Real check</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Unconfigured platforms halt deployment with <strong className="text-rose-400">"Deployment provider unavailable"</strong> without faking.
          </p>

          <div className="space-y-2.5">
            {providers.map((p) => (
              <div key={p.providerId} className="p-3 rounded-lg bg-[#0f1422] border border-[#182236] text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">{p.name}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                      p.isConfigured
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {p.isConfigured ? 'AUTHENTICATED' : 'UNCONFIGURED'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Platform: {p.platform}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Production Artifacts Archive */}
      <div className="p-5 rounded-xl bg-[#0b0e17] border border-[#1a2336] space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#182030]">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            Immutable Production Artifacts (Preserved in Cold Storage)
          </h3>
          <span className="text-xs font-mono text-slate-500">{artifacts.length} artifacts</span>
        </div>

        <div className="space-y-2">
          {artifacts.map((art) => (
            <div
              key={art.id}
              className="p-3 rounded-lg bg-[#0f1422] border border-[#182236] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">v{art.version}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    {art.platform}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">{art.fileSize}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Commit: {art.commitRef} • Tests: {art.validationResults.testsPassed} passed
                </div>
              </div>

              <div className="font-mono text-[10px] text-slate-400 truncate max-w-sm" title={art.checksum}>
                {art.checksum}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
