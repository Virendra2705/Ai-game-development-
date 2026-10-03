import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Square,
  RotateCcw,
  Maximize2,
  ExternalLink,
  Camera,
  Terminal,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Info,
  Shield,
  Layers,
  Crosshair,
  Package,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { previewService } from '../../services/preview/previewService';
import { buildPipelineService } from '../../services/build/buildPipelineService';
import { PreviewSession, RuntimeLogEntry, BuildJob } from '../../types';

interface GamePreviewCenterProps {
  onRunQA?: () => void;
}

export const GamePreviewCenter: React.FC<GamePreviewCenterProps> = ({ onRunQA }) => {
  const { currentProject, addToast } = useApp();
  const [session, setSession] = useState<PreviewSession | null>(previewService.getActiveSession());
  const [selectedLogFilter, setSelectedLogFilter] = useState<'ALL' | 'INFO' | 'WARNING' | 'ERROR'>('ALL');
  const [activeOrb, setActiveOrb] = useState<'Tier 1' | 'Tier 2'>('Tier 1');
  const [orbsRemaining, setOrbsRemaining] = useState(4);
  const [creatureHp, setCreatureHp] = useState(48);
  const [maxHp] = useState(50);
  const [captureState, setCaptureState] = useState<'IDLE' | 'THROWN' | 'WOBBLE' | 'CAPTURED' | 'BROKE_FREE'>('IDLE');
  const [wobbleCount, setWobbleCount] = useState(0);
  const [runtimeSeconds, setRuntimeSeconds] = useState(142);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Runtime timer
  useEffect(() => {
    const timer = setInterval(() => {
      if (session?.status === 'RUNNING') {
        setRuntimeSeconds((prev) => prev + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [session?.status]);

  // Subscribe to preview service
  useEffect(() => {
    const unsubscribe = previewService.subscribe((s) => {
      setSession(s);
    });
    return () => unsubscribe();
  }, []);

  // Initialize preview if none active
  useEffect(() => {
    if (!session) {
      const latestBuild = buildPipelineService.getJobs(currentProject.id).find((j) => j.status === 'COMPLETED');
      if (latestBuild) {
        previewService.startPreview(currentProject.id, latestBuild, 'InternalWebPreview');
      }
    }
  }, [session, currentProject.id]);

  // Canvas rendering loop for interactive Embervale preview
  useEffect(() => {
    if (!canvasRef.current || session?.status !== 'RUNNING') return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw Grid Arena Background
      ctx.fillStyle = '#080c16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Ambient Rift grid lines
      ctx.strokeStyle = '#141d30';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Rift Energy Core Glow in Center
      const glowGrad = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        10,
        canvas.width / 2,
        canvas.height / 2,
        160
      );
      glowGrad.addColorStop(0, 'rgba(99, 102, 241, 0.25)');
      glowGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.1)');
      glowGrad.addColorStop(1, 'rgba(10, 15, 29, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 160, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw Player Avatar (Left Center)
      const playerX = 140;
      const playerY = canvas.height / 2;

      // Player Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(playerX, playerY + 22, 22, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Player Body
      ctx.fillStyle = '#4f46e5';
      ctx.beginPath();
      ctx.arc(playerX, playerY, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#818cf8';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Player Hat / Crest
      ctx.fillStyle = '#c084fc';
      ctx.beginPath();
      ctx.arc(playerX, playerY - 4, 8, 0, Math.PI * 2);
      ctx.fill();

      // Player Label
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Rift Tamer (Player)', playerX, playerY + 38);

      // 3. Draw Wild Creature (Right Center) - Luminafox
      let creatureX = canvas.width - 180;
      let creatureY = canvas.height / 2 + Math.sin(tick * 0.05) * 6; // Float idle

      if (captureState === 'WOBBLE') {
        creatureX += Math.sin(tick * 0.4) * 8; // Wobble shake
      }

      if (captureState !== 'CAPTURED') {
        // Creature Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(creatureX, creatureY + 28, 26, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Creature Aura
        const auraGrad = ctx.createRadialGradient(creatureX, creatureY, 5, creatureX, creatureY, 45);
        auraGrad.addColorStop(0, 'rgba(245, 158, 11, 0.4)');
        auraGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(creatureX, creatureY, 45, 0, Math.PI * 2);
        ctx.fill();

        // Creature Body (Golden Fox Shape)
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(creatureX, creatureY, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Ears
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.moveTo(creatureX - 16, creatureY - 14);
        ctx.lineTo(creatureX - 22, creatureY - 32);
        ctx.lineTo(creatureX - 4, creatureY - 20);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(creatureX + 16, creatureY - 14);
        ctx.lineTo(creatureX + 22, creatureY - 32);
        ctx.lineTo(creatureX + 4, creatureY - 20);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(creatureX - 7, creatureY - 4, 3, 0, Math.PI * 2);
        ctx.arc(creatureX + 7, creatureY - 4, 3, 0, Math.PI * 2);
        ctx.fill();

        // Creature HP Bar
        const barWidth = 70;
        const barHeight = 6;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(creatureX - barWidth / 2, creatureY - 36, barWidth, barHeight);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(
          creatureX - barWidth / 2,
          creatureY - 36,
          barWidth * (creatureHp / maxHp),
          barHeight
        );
        ctx.strokeStyle = '#334155';
        ctx.strokeRect(creatureX - barWidth / 2, creatureY - 36, barWidth, barHeight);

        // Creature Tag
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(`Luminafox (Lvl 5) • ${creatureHp}/${maxHp} HP`, creatureX, creatureY - 44);
      } else {
        // Captured Stasis Orb
        ctx.fillStyle = '#6366f1';
        ctx.beginPath();
        ctx.arc(creatureX, creatureY, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('✓ CAPTURED', creatureX, creatureY - 26);
      }

      // 4. Trajectory Aiming Line when Idle
      if (captureState === 'IDLE') {
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(playerX, playerY);
        // Quadratic curve simulating throw arc
        ctx.quadraticCurveTo(
          (playerX + creatureX) / 2,
          playerY - 60,
          creatureX,
          creatureY
        );
        ctx.stroke();
        ctx.setLineDash([]);
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [session?.status, creatureHp, maxHp, captureState]);

  // Throw Orb interaction
  const handleThrowOrb = () => {
    if (captureState !== 'IDLE' || orbsRemaining <= 0 || session?.status !== 'RUNNING') return;

    setOrbsRemaining((prev) => prev - 1);
    setCaptureState('THROWN');

    previewService.addLog(
      session.id,
      'INFO',
      'Gameplay',
      `Player threw Rift Orb (${activeOrb}). Orbs remaining: ${orbsRemaining - 1}`
    );

    // Projectile flight
    setTimeout(() => {
      setCaptureState('WOBBLE');
      setWobbleCount(1);
      previewService.addLog(
        session.id,
        'INFO',
        'CaptureManager',
        'Rift Orb impact registered on Luminafox. Starting capture stasis containment.'
      );

      // Calculate formula (Section 51)
      const potency = activeOrb === 'Tier 2' ? 2.0 : 1.5;
      const hpFactor = (3 * maxHp - 2 * creatureHp) / (3 * maxHp);
      const calculatedRate = (hpFactor * 180 * potency) / 255.0;
      const roll = Math.random();

      // First shake
      setTimeout(() => {
        setWobbleCount(2);
        previewService.addLog(session.id, 'INFO', 'CaptureManager', `Containment pulse #1 [rate=${calculatedRate.toFixed(2)}]`);

        // Second shake
        setTimeout(() => {
          setWobbleCount(3);
          previewService.addLog(session.id, 'INFO', 'CaptureManager', 'Containment pulse #2 holding.');

          // Final resolution
          setTimeout(() => {
            if (roll <= calculatedRate) {
              setCaptureState('CAPTURED');
              previewService.addLog(
                session.id,
                'INFO',
                'CreatureDatabase',
                'Capture resolved: SUCCESS! Specimen recorded to pokedex_records.'
              );
              addToast('Creature Captured!', 'Luminafox was contained in the Rift Orb.', 'success');
            } else {
              setCaptureState('BROKE_FREE');
              previewService.addLog(
                session.id,
                'WARNING',
                'CaptureManager',
                'Capture failed: Luminafox broke free from the Rift Orb!'
              );
              addToast('Breakout!', 'The wild creature escaped the orb.', 'warning');
              setTimeout(() => setCaptureState('IDLE'), 1500);
            }
          }, 600);
        }, 600);
      }, 600);
    }, 600);
  };

  const handleCaptureScreenshot = () => {
    if (!canvasRef.current || !session) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    previewService.captureScreenshot(session.id, dataUrl, `Embervale_Preview_${Date.now()}.png`);
    addToast('Screenshot Captured', 'Frame stored in QA evidence registry.', 'success');
  };

  const handleRestart = () => {
    if (!session) return;
    setCaptureState('IDLE');
    setCreatureHp(48);
    setOrbsRemaining(4);
    previewService.restartPreview(session.id);
    addToast('Preview Restarted', 'Reloading Godot 4.3 Web harness...', 'info');
  };

  const handleStop = () => {
    if (!session) return;
    previewService.stopPreview(session.id);
    addToast('Preview Stopped', 'Game engine harness paused.', 'info');
  };

  const handleStart = () => {
    const latestBuild = buildPipelineService.getJobs(currentProject.id).find((j) => j.status === 'COMPLETED');
    if (latestBuild) {
      previewService.startPreview(currentProject.id, latestBuild, 'InternalWebPreview');
      addToast('Preview Started', 'Bootstrapping preview environment...', 'info');
    }
  };

  const formatRuntime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const filteredLogs = (session?.runtimeLogs || []).filter((l) => {
    if (selectedLogFilter === 'ALL') return true;
    return l.level === selectedLogFilter;
  });

  return (
    <div className="space-y-6">
      {/* Section 16 Header: GAME PREVIEW metadata */}
      <div className="p-4 rounded-2xl bg-[#0c101a] border border-[#1f2a3e] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Play className="w-3.5 h-3.5 fill-indigo-400" />
            <span>GAME PREVIEW CENTER</span>
          </div>
          <h2 className="text-xl font-black text-white font-mono tracking-tight mt-0.5">
            Project: {currentProject.name}
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400 mt-1">
            <span>Build: <strong className="text-white">#142</strong></span>
            <span>•</span>
            <span>Platform: <strong className="text-indigo-300">{session?.platform || 'Web'}</strong></span>
            <span>•</span>
            <span>Runtime: <strong className="text-white">{formatRuntime(runtimeSeconds)}</strong></span>
            <span>•</span>
            <span>Errors: <strong className="text-rose-400">{session?.errorCount || 0}</strong></span>
            <span>•</span>
            <span>Warnings: <strong className="text-amber-400">{session?.warningCount || 0}</strong></span>
          </div>
        </div>

        {/* Action Controls (Section 20) */}
        <div className="flex items-center gap-2 flex-wrap">
          {session?.status === 'RUNNING' ? (
            <>
              <button
                onClick={handleRestart}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#151c2c] hover:bg-[#1e273d] text-slate-300 hover:text-white border border-[#243048] text-xs font-mono font-semibold transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart</span>
              </button>
              <button
                onClick={handleStop}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono font-semibold transition-all cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-rose-300" />
                <span>Stop</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleStart}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold transition-all shadow-md shadow-indigo-600/25 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Start Preview</span>
            </button>
          )}

          <button
            onClick={handleCaptureScreenshot}
            disabled={session?.status !== 'RUNNING'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#151c2c] hover:bg-[#1e273d] text-slate-300 hover:text-white border border-[#243048] text-xs font-mono font-semibold transition-all cursor-pointer disabled:opacity-50"
            title="Capture Screenshot for QA Evidence"
          >
            <Camera className="w-3.5 h-3.5 text-indigo-400" />
            <span>Screenshot</span>
          </button>

          {onRunQA && (
            <button
              onClick={onRunQA}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-mono font-bold transition-all shadow-md shadow-amber-600/20 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Run Automated QA</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Canvas Screen (8 Cols) */}
        <div className="lg:col-span-8 space-y-3">
          <div
            ref={previewContainerRef}
            className="relative rounded-2xl bg-[#06080f] border border-[#1a2335] overflow-hidden shadow-2xl group flex flex-col"
          >
            {/* Top Toolbar overlay */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#090d16]/90 border-b border-[#1a2335] backdrop-blur-sm z-10">
              <div className="flex items-center gap-2.5">
                <span className="flex h-2 w-2 relative">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${session?.status === 'RUNNING' ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${session?.status === 'RUNNING' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                </span>
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  GODOT 4.3 WEB EXPORT HARNESS
                </span>
              </div>

              {/* Performance Stats Overlay (Section 29) */}
              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                <span>FPS: <strong className="text-emerald-400">{session?.fps || 60}</strong></span>
                <span>•</span>
                <span>Frame: <strong className="text-slate-200">{session?.frameTimeMs || 16.6}ms</strong></span>
                <span>•</span>
                <span>Mem: <strong className="text-indigo-300">{session?.memoryMB || 135}MB</strong></span>
              </div>
            </div>

            {/* Canvas or Native Warning Display (Section 18) */}
            {session?.provider === 'NativeDownloadOnly' ? (
              <div className="h-[420px] flex flex-col items-center justify-center p-8 text-center space-y-3 bg-[#0a0e18]">
                <Package className="w-12 h-12 text-indigo-400 opacity-60" />
                <h4 className="text-base font-bold text-white font-mono">
                  Native preview environment unavailable.
                </h4>
                <p className="text-xs text-slate-400 max-w-md font-mono">
                  Android APK artifact was compiled and packaged successfully. To test native input and GPU rendering, install on a physical Android device or local emulator.
                </p>
                <div className="pt-2">
                  <a
                    href="#artifacts"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold transition-all inline-flex items-center gap-2"
                  >
                    <span>Inspect & Download APK Artifact</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="relative h-[420px] w-full flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={420}
                  className="w-full h-full object-contain cursor-crosshair"
                />

                {/* In-Game HUD: Interactive Throw Controls */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between p-3 rounded-xl bg-[#090d18]/90 border border-[#1f2b42] backdrop-blur-md">
                  {/* Left: Orb Tier Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">Select Orb:</span>
                    <button
                      onClick={() => setActiveOrb('Tier 1')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                        activeOrb === 'Tier 1'
                          ? 'bg-indigo-600 text-white border border-indigo-400'
                          : 'bg-[#141b2c] text-slate-300 hover:bg-[#1a2338]'
                      }`}
                    >
                      Rift Orb Tier 1 (x{orbsRemaining})
                    </button>
                    <button
                      onClick={() => setActiveOrb('Tier 2')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                        activeOrb === 'Tier 2'
                          ? 'bg-purple-600 text-white border border-purple-400'
                          : 'bg-[#141b2c] text-slate-300 hover:bg-[#1a2338]'
                      }`}
                    >
                      Hyper Orb Tier 2 (x1)
                    </button>
                  </div>

                  {/* Right: Throw Action Button */}
                  <button
                    onClick={handleThrowOrb}
                    disabled={captureState !== 'IDLE' || orbsRemaining <= 0 || session?.status !== 'RUNNING'}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>
                      {captureState === 'WOBBLE'
                        ? `Catching (${wobbleCount}/3)...`
                        : captureState === 'CAPTURED'
                        ? 'Creature Captured!'
                        : 'Throw Rift Orb [Space / Click]'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Screenshots Tray (Section 27) */}
          {session && session.screenshots.length > 0 && (
            <div className="p-4 rounded-xl bg-[#0c101a] border border-[#1f2a3e] space-y-2">
              <span className="text-xs font-mono text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-2">
                <Camera className="w-3.5 h-3.5 text-indigo-400" />
                <span>QA EVIDENCE SCREENSHOTS ({session.screenshots.length})</span>
              </span>
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {session.screenshots.map((shot) => (
                  <div key={shot.id} className="relative rounded-lg overflow-hidden border border-[#243048] shrink-0 group">
                    <img src={shot.dataUrl} alt={shot.label} className="w-28 h-16 object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-[10px] font-mono text-white">
                      {shot.timestamp}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Live Runtime Logs (4 Cols - Section 21) */}
        <div className="lg:col-span-4">
          <div className="p-4 rounded-2xl bg-[#090d16] border border-[#1a2334] shadow-2xl flex flex-col h-[495px]">
            {/* Header & Filter */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1a2334]">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  RUNTIME LOGS
                </span>
              </div>

              {/* Filters: All, Info, Warnings, Errors */}
              <div className="flex items-center gap-1 text-[11px] font-mono">
                {(['ALL', 'INFO', 'WARNING', 'ERROR'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedLogFilter(filter)}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      selectedLogFilter === filter
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white bg-[#141b2c]'
                    }`}
                  >
                    {filter === 'ALL' ? 'All' : filter === 'WARNING' ? 'Warn' : filter === 'ERROR' ? 'Err' : 'Info'}
                  </button>
                ))}
              </div>
            </div>

            {/* Log Stream */}
            <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-xs p-2 space-y-1.5 select-text mt-1">
              {filteredLogs.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-500">
                  No runtime logs recorded yet.
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-2 rounded leading-relaxed text-[11px] ${
                      log.level === 'ERROR'
                        ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        : log.level === 'WARNING'
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                        : 'bg-[#0f1422] text-slate-300 border border-[#1a2233]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                      <span className="font-bold text-indigo-400">[{log.category}]</span>
                      <span>{log.timestamp}</span>
                    </div>
                    <div>{log.message}</div>
                    {log.file && (
                      <div className="text-[10px] text-slate-400 mt-1">
                        at {log.file}:{log.line}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
