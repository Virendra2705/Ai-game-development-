import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Square,
  RotateCcw,
  Maximize2,
  Minimize2,
  Monitor,
  Tablet,
  Smartphone,
  Sparkles,
  Info,
  Layers,
  Settings2,
  Camera,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export type DeviceView = 'Desktop' | 'Tablet' | 'Android';

export const LiveGamePreview: React.FC = () => {
  const { currentProject, addToast } = useApp();
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [device, setDevice] = useState<DeviceView>('Desktop');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showGizmos, setShowGizmos] = useState<boolean>(true);
  const [stats, setStats] = useState({ fps: 60, drawCalls: 142, memory: 420, tris: 38.4 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animated game canvas simulation (interactive realistic Godot viewport)
  useEffect(() => {
    let animationFrameId: number;
    let tick = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      if (!canvas) return;
      const width = canvas.width;
      const height = canvas.height;

      // Clear with dark atmospheric gradient
      const bgGradient = ctx.createRadialGradient(
        width / 2,
        height * 0.45,
        20,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.8
      );
      bgGradient.addColorStop(0, '#192238');
      bgGradient.addColorStop(0.5, '#0d1322');
      bgGradient.addColorStop(1, '#060910');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Draw isometric grid / ground plane
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      const gridSize = 36;
      const horizonY = height * 0.58;

      ctx.beginPath();
      // Horizontal lines with perspective
      for (let i = 0; i < 14; i++) {
        const y = horizonY + Math.pow(i / 13, 1.8) * (height - horizonY);
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      // Radial perspective lines converging to horizon center
      const vanishingX = width / 2;
      for (let x = -width; x <= width * 2; x += 60) {
        ctx.moveTo(vanishingX, horizonY);
        ctx.lineTo(x, height);
      }
      ctx.stroke();

      // Atmospheric distant mountain silhouettes
      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(width * 0.15, horizonY - 45);
      ctx.lineTo(width * 0.35, horizonY - 15);
      ctx.lineTo(width * 0.55, horizonY - 60);
      ctx.lineTo(width * 0.75, horizonY - 20);
      ctx.lineTo(width * 0.9, horizonY - 50);
      ctx.lineTo(width, horizonY);
      ctx.closePath();
      ctx.fill();

      // Animated glowing Ancient Rift Portal in center
      const portalX = width / 2;
      const portalY = horizonY - 30;
      const portalRadius = 40 + Math.sin(tick * 0.05) * 4;

      // Rift outer glow
      const portalGlow = ctx.createRadialGradient(
        portalX,
        portalY,
        5,
        portalX,
        portalY,
        portalRadius * 1.8
      );
      portalGlow.addColorStop(0, 'rgba(129, 140, 248, 0.85)');
      portalGlow.addColorStop(0.4, 'rgba(168, 85, 247, 0.45)');
      portalGlow.addColorStop(0.8, 'rgba(56, 189, 248, 0.15)');
      portalGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = portalGlow;
      ctx.beginPath();
      ctx.arc(portalX, portalY, portalRadius * 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Portal Ring (Godot stylized arch)
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(portalX, portalY, portalRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Animated energy vortex particles inside rift
      if (isPlaying) {
        for (let p = 0; p < 8; p++) {
          const angle = tick * 0.04 + (p * Math.PI) / 4;
          const dist = 15 + ((tick * 1.5 + p * 12) % portalRadius);
          const px = portalX + Math.cos(angle) * dist;
          const py = portalY + Math.sin(angle) * (dist * 0.7);

          ctx.fillStyle = p % 2 === 0 ? '#38bdf8' : '#f472b6';
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Animated Creature: Pyrolupus (Ember Fox) hovering near rift
      const creatureBaseX = width * 0.65;
      const creatureBob = Math.sin(tick * 0.08) * 6;
      const creatureBaseY = horizonY + 35 + creatureBob;

      // Creature shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(creatureBaseX, horizonY + 55, 22, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Creature Body
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(creatureBaseX, creatureBaseY, 14, 0, Math.PI * 2);
      ctx.fill();

      // Creature Flame Tail
      const tailAngle = tick * 0.1;
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.ellipse(
        creatureBaseX + 16,
        creatureBaseY - 6 + Math.sin(tailAngle) * 4,
        10,
        5,
        Math.PI / 4,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Creature Ears
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.moveTo(creatureBaseX - 8, creatureBaseY - 10);
      ctx.lineTo(creatureBaseX - 14, creatureBaseY - 22);
      ctx.lineTo(creatureBaseX - 3, creatureBaseY - 12);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(creatureBaseX + 3, creatureBaseY - 12);
      ctx.lineTo(creatureBaseX + 10, creatureBaseY - 22);
      ctx.lineTo(creatureBaseX + 8, creatureBaseY - 10);
      ctx.fill();

      // Creature Eye
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(creatureBaseX - 5, creatureBaseY - 3, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Animated Player Protagonist silhouette
      const playerX = width * 0.35;
      const playerY = horizonY + 65;

      // Player shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(playerX, playerY + 30, 20, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Player Body
      ctx.fillStyle = '#e0e7ff';
      ctx.beginPath();
      ctx.arc(playerX, playerY - 14, 9, 0, Math.PI * 2); // head
      ctx.fill();

      ctx.fillStyle = '#4f46e5';
      ctx.beginPath();
      ctx.roundRect(playerX - 9, playerY - 4, 18, 28, 4); // torso
      ctx.fill();

      // Player weapon / prism wand glowing
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(playerX + 12, playerY + 16);
      ctx.lineTo(playerX + 22, playerY - 12);
      ctx.stroke();

      // Prism crystal tip
      ctx.fillStyle = '#67e8f9';
      ctx.beginPath();
      ctx.arc(playerX + 22, playerY - 12, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Floating ember particles
      if (isPlaying) {
        for (let i = 0; i < 15; i++) {
          const px = (width * 0.2 + (tick * 1.2 + i * 45)) % (width * 0.7);
          const py = horizonY + 80 - ((tick * 1.5 + i * 28) % 180);
          const alpha = 0.8 * (1 - ((tick * 1.5 + i * 28) % 180) / 180);
          ctx.fillStyle = `rgba(249, 115, 22, ${alpha})`;
          ctx.beginPath();
          ctx.arc(px, py, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Engine Gizmos & 3D axes
      if (showGizmos) {
        const gizmoX = width - 48;
        const gizmoY = 48;

        // X axis (Red)
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(gizmoX, gizmoY);
        ctx.lineTo(gizmoX + 24, gizmoY);
        ctx.stroke();

        // Y axis (Green)
        ctx.strokeStyle = '#22c55e';
        ctx.beginPath();
        ctx.moveTo(gizmoX, gizmoY);
        ctx.lineTo(gizmoX, gizmoY - 24);
        ctx.stroke();

        // Z axis (Blue)
        ctx.strokeStyle = '#3b82f6';
        ctx.beginPath();
        ctx.moveTo(gizmoX, gizmoY);
        ctx.lineTo(gizmoX - 16, gizmoY + 16);
        ctx.stroke();

        ctx.font = '9px monospace';
        ctx.fillStyle = '#ef4444';
        ctx.fillText('X', gizmoX + 26, gizmoY + 3);
        ctx.fillStyle = '#22c55e';
        ctx.fillText('Y', gizmoX - 3, gizmoY - 26);
        ctx.fillStyle = '#3b82f6';
        ctx.fillText('Z', gizmoX - 22, gizmoY + 22);
      }

      if (isPlaying) {
        tick++;
      }
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, showGizmos]);

  // Jitter stats subtly for realism
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setStats({
        fps: 59 + Math.floor(Math.random() * 3),
        drawCalls: 140 + Math.floor(Math.random() * 6),
        memory: 418 + Math.floor(Math.random() * 5),
        tris: 38.4,
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Dimensions based on device selection
  const getContainerStyles = () => {
    switch (device) {
      case 'Tablet':
        return 'max-w-3xl aspect-[4/3]';
      case 'Android':
        return 'max-w-md aspect-[9/16]';
      case 'Desktop':
      default:
        return 'w-full aspect-[16/9] min-h-[340px] max-h-[500px]';
    }
  };

  return (
    <div
      id="live-game-preview-panel"
      className={`rounded-2xl bg-[#0c101a] border border-[#202c42] shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
        isFullscreen ? 'fixed inset-4 z-50 bg-[#090d16]' : 'relative'
      }`}
    >
      {/* Panel Header & Control Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 border-b border-[#1c263a] bg-[#101624] gap-3">
        {/* Title & Engine info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-xs sm:text-sm font-extrabold font-mono tracking-wider text-white">
              LIVE GAME PREVIEW
            </h3>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#182133] border border-[#27344e] text-[11px] font-mono text-slate-300">
            <span className="text-indigo-400 font-semibold">{currentProject.engine} 4.3</span>
            <span>•</span>
            <span className="text-emerald-400">Ready</span>
          </div>
        </div>

        {/* Playback & Viewport Controls */}
        <div className="flex items-center gap-2">
          {/* Device Selector */}
          <div className="flex items-center p-1 rounded-lg bg-[#161f30] border border-[#23304a] text-xs">
            <button
              onClick={() => {
                setDevice('Desktop');
                addToast('Device Mode', 'Switched to Desktop viewport (16:9).', 'info');
              }}
              className={`p-1.5 rounded-md transition-colors ${
                device === 'Desktop' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Desktop View (16:9)"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setDevice('Tablet');
                addToast('Device Mode', 'Switched to Tablet viewport (4:3).', 'info');
              }}
              className={`p-1.5 rounded-md transition-colors ${
                device === 'Tablet' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Tablet View (4:3)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setDevice('Android');
                addToast('Device Mode', 'Switched to Android mobile viewport (9:16).', 'info');
              }}
              className={`p-1.5 rounded-md transition-colors ${
                device === 'Android' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Android View (9:16)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-5 w-[1px] bg-[#23304a]" />

          {/* Play / Stop buttons */}
          <button
            id="preview-play-btn"
            onClick={() => {
              setIsPlaying(!isPlaying);
              addToast(
                isPlaying ? 'Preview Paused' : 'Preview Resumed',
                isPlaying ? 'Game simulation halted.' : 'Rendering scene at 60 FPS.',
                'info'
              );
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
          >
            {isPlaying ? <Square className="w-3.5 h-3.5 fill-amber-300" /> : <Play className="w-3.5 h-3.5 fill-emerald-300" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          {/* Refresh button */}
          <button
            id="preview-refresh-btn"
            onClick={() => {
              addToast('Reloading Scene', 'Reloaded scene nodes and shader pipelines.', 'info');
            }}
            className="p-2 rounded-lg bg-[#161f30] hover:bg-[#1f2a40] text-slate-300 border border-[#23304a] transition-colors"
            title="Reload Scene"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen button */}
          <button
            id="preview-fullscreen-btn"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg bg-[#161f30] hover:bg-[#1f2a40] text-slate-300 border border-[#23304a] transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="relative flex-1 bg-[#06080e] flex items-center justify-center p-4 overflow-hidden select-none">
        <div className={`relative mx-auto rounded-xl overflow-hidden border border-[#223048] shadow-2xl transition-all duration-300 ${getContainerStyles()}`}>
          <canvas
            ref={canvasRef}
            width={880}
            height={495}
            className="w-full h-full object-cover block cursor-crosshair"
          />

          {/* Debug HUD Overlay */}
          <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2 pointer-events-none">
            <div className="px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>FPS: {stats.fps}</span>
            </div>
            <div className="px-2 py-1 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-mono text-slate-300">
              Draw: {stats.drawCalls}
            </div>
            <div className="px-2 py-1 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-mono text-slate-300">
              Mem: {stats.memory}MB
            </div>
            <div className="px-2 py-1 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-mono text-slate-300">
              Tris: {stats.tris}k
            </div>
          </div>

          {/* Engine Scene Watermark */}
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-mono text-slate-300 pointer-events-none flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Scene: /levels/route_01_meadows.tscn</span>
          </div>

          {/* Controls toggle */}
          <button
            onClick={() => setShowGizmos(!showGizmos)}
            className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-black/75 hover:bg-black/90 border border-white/10 text-[10px] font-mono text-slate-300 flex items-center gap-1 transition-colors"
          >
            <Camera className="w-3 h-3 text-indigo-400" />
            <span>{showGizmos ? 'Gizmos ON' : 'Gizmos OFF'}</span>
          </button>
        </div>
      </div>

      {/* Phase 1 Integration Banner (Mandated in prompt requirement 5) */}
      <div className="px-4 py-2.5 border-t border-[#1c263a] bg-[#0c121e] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-indigo-300 font-mono text-[11px]">
          <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>Live game preview will connect in a future phase.</span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
          <span>Target: Forward+ Mobile / Desktop</span>
          <span>•</span>
          <span className="text-slate-300">Godot Engine Viewport Placeholder</span>
        </div>
      </div>
    </div>
  );
};
