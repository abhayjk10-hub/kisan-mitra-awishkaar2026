'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  RotateCcw,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { FarmMachine, Machinery3DHotspot } from '@/lib/machinery-data';

interface Machinery3DViewerProps {
  machine: FarmMachine;
  className?: string;
  autoRotateDefault?: boolean;
}

// 3D Point & Polygon types for perspective projection
type Point3D = [number, number, number];
interface Face3D {
  indices: number[];
  color: string;
  normal?: Point3D;
  centerZ?: number;
}

export default function Machinery3DViewer({
  machine,
  className = '',
  autoRotateDefault = true,
}: Machinery3DViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRotating, setIsRotating] = useState(autoRotateDefault);
  const [zoom, setZoom] = useState(1.0);
  const [rotation, setRotation] = useState({ x: 0.35, y: -0.6 }); // pitch, yaw in radians
  const [activeHotspot, setActiveHotspot] = useState<Machinery3DHotspot | null>(null);
  const [wireframeMode, setWireframeMode] = useState(false);

  // Dragging state
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // Generate 3D procedural mesh based on geometryType
  const getMesh = useCallback((): { vertices: Point3D[]; faces: Face3D[] } => {
    const { primaryColor, accentColor, geometryType } = machine.model3DConfig;
    const v: Point3D[] = [];
    const f: Face3D[] = [];

    // Helper: add box
    const addBox = (
      cx: number,
      cy: number,
      cz: number,
      w: number,
      h: number,
      d: number,
      color: string
    ) => {
      const hw = w / 2;
      const hh = h / 2;
      const hd = d / 2;
      const baseIdx = v.length;

      // 8 vertices of box
      v.push([cx - hw, cy - hh, cz - hd]);
      v.push([cx + hw, cy - hh, cz - hd]);
      v.push([cx + hw, cy + hh, cz - hd]);
      v.push([cx - hw, cy + hh, cz - hd]);
      v.push([cx - hw, cy - hh, cz + hd]);
      v.push([cx + hw, cy - hh, cz + hd]);
      v.push([cx + hw, cy + hh, cz + hd]);
      v.push([cx - hw, cy + hh, cz + hd]);

      // 6 faces: front, back, top, bottom, right, left
      f.push({ indices: [baseIdx + 4, baseIdx + 5, baseIdx + 6, baseIdx + 7], color }); // front
      f.push({ indices: [baseIdx + 1, baseIdx + 0, baseIdx + 3, baseIdx + 2], color }); // back
      f.push({ indices: [baseIdx + 3, baseIdx + 2, baseIdx + 6, baseIdx + 7], color }); // top
      f.push({ indices: [baseIdx + 0, baseIdx + 1, baseIdx + 5, baseIdx + 4], color }); // bottom
      f.push({ indices: [baseIdx + 1, baseIdx + 2, baseIdx + 6, baseIdx + 5], color }); // right
      f.push({ indices: [baseIdx + 0, baseIdx + 4, baseIdx + 7, baseIdx + 3], color }); // left
    };

    // Helper: add wheel cylinder (octagonal)
    const addWheel = (cx: number, cy: number, cz: number, r: number, width: number, color: string) => {
      const segs = 8;
      const baseIdx = v.length;
      const hw = width / 2;

      for (let i = 0; i < segs; i++) {
        const theta = (i / segs) * Math.PI * 2;
        const dy = Math.sin(theta) * r;
        const dz = Math.cos(theta) * r;
        v.push([cx - hw, cy + dy, cz + dz]);
        v.push([cx + hw, cy + dy, cz + dz]);
      }

      for (let i = 0; i < segs; i++) {
        const next = (i + 1) % segs;
        const i0 = baseIdx + i * 2;
        const i1 = baseIdx + i * 2 + 1;
        const n0 = baseIdx + next * 2;
        const n1 = baseIdx + next * 2 + 1;
        f.push({ indices: [i0, i1, n1, n0], color });
      }
    };

    if (geometryType === 'combine_harvester') {
      // Big Harvester Body
      addBox(0, 0.4, 0, 3.4, 1.8, 1.8, primaryColor);
      // Top Grain Bin
      addBox(0.2, 1.4, 0, 1.8, 0.9, 1.6, '#ca8a04');
      // Driver Cabin Glass
      addBox(1.5, 1.1, 0, 1.2, 1.2, 1.4, '#38bdf8');
      // Front Feeder House & Cutter Bar
      addBox(2.2, -0.2, 0, 1.5, 0.6, 2.8, '#e2e8f0');
      // Rotating Reel
      addBox(2.7, 0.2, 0, 0.8, 0.8, 3.2, accentColor);
      // Big Front Drive Wheels
      addWheel(1.2, -0.6, 1.1, 0.7, 0.5, '#1e293b');
      addWheel(1.2, -0.6, -1.1, 0.7, 0.5, '#1e293b');
      // Rear Steering Wheels
      addWheel(-1.2, -0.6, 0.9, 0.5, 0.4, '#1e293b');
      addWheel(-1.2, -0.6, -0.9, 0.5, 0.4, '#1e293b');
      // Unloading Auger Arm
      addBox(-0.2, 1.8, 0.9, 2.2, 0.25, 0.25, '#f8fafc');
    } else if (geometryType === 'seed_drill') {
      // Main Chassis Frame
      addBox(0, 0.1, 0, 2.4, 0.3, 1.6, '#334155');
      // Seed & Fertilizer Dual Hoppers
      addBox(0, 0.7, 0, 2.2, 0.8, 0.6, primaryColor);
      addBox(0, 0.7, 0.6, 2.2, 0.7, 0.5, '#f59e0b');
      // Ground Drive Wheel
      addWheel(1.3, -0.2, 0.4, 0.5, 0.2, '#0f172a');
      addWheel(-1.3, -0.2, 0.4, 0.5, 0.2, '#0f172a');
      // 9 Planting Tynes & Inverted-T Shoes
      for (let x = -1.0; x <= 1.0; x += 0.25) {
        addBox(x, -0.5, 0.2, 0.08, 0.7, 0.08, accentColor);
        addBox(x, -0.85, 0.25, 0.12, 0.15, 0.3, '#0f172a');
      }
      // Tractor 3-Point Linkage
      addBox(0, 0.4, -0.8, 0.4, 0.7, 0.2, primaryColor);
    } else if (geometryType === 'axial_thresher') {
      // Main Thresher Drum Chamber
      addBox(0, 0.3, 0, 2.8, 1.2, 1.3, primaryColor);
      // Feeding Intake Hopper / Conveyor
      addBox(1.2, 0.8, 0, 1.1, 0.6, 0.9, '#cbd5e1');
      // High Velocity Blowers & Chaff Duct
      addBox(-1.4, 0.9, 0, 0.8, 1.4, 0.5, accentColor);
      // Double Sieve Box at bottom
      addBox(0, -0.5, 0, 2.4, 0.4, 1.2, '#64748b');
      // Transport Wheels
      addWheel(0, -0.8, 0.8, 0.4, 0.2, '#0f172a');
      addWheel(0, -0.8, -0.8, 0.4, 0.2, '#0f172a');
      // Tractor PTO Shaft Coupler
      addBox(1.4, -0.2, 0, 0.6, 0.2, 0.2, '#eab308');
    } else if (geometryType === 'rice_huller') {
      // Base Motor Stand & Chassis
      addBox(0, -0.6, 0, 1.4, 0.8, 1.2, '#1e293b');
      // Main Rubber-Roll Hulling Chamber
      addBox(0, 0.2, 0, 1.2, 0.9, 1.0, primaryColor);
      // Top Grain Feed Hopper
      addBox(0, 1.1, 0, 0.9, 0.8, 0.8, '#cbd5e1');
      // Suction Fan & Husk Discharge Pipe
      addBox(-0.7, 0.4, 0, 0.5, 0.9, 0.4, accentColor);
      // Clean Rice / Pulse Outlet
      addBox(0.6, -0.2, 0, 0.4, 0.3, 0.4, '#e2e8f0');
    } else if (geometryType === 'laser_leveller') {
      // Main Heavy Curved Scraper Bucket
      addBox(0, -0.2, 0, 2.2, 0.6, 1.4, primaryColor);
      // Central Steel Mast
      addBox(0, 1.0, 0, 0.15, 1.8, 0.15, '#f8fafc');
      // 360° Rotary Laser Receiver Sensor
      addBox(0, 1.9, 0, 0.35, 0.45, 0.35, '#ef4444');
      // Dual Hydraulic Lift Cylinders
      addBox(0.4, 0.5, -0.4, 0.12, 0.8, 0.12, '#38bdf8');
      addBox(-0.4, 0.5, -0.4, 0.12, 0.8, 0.12, '#38bdf8');
      // Heavy Rear Axle & Gauge Wheels
      addWheel(1.0, -0.5, -0.8, 0.45, 0.3, '#0f172a');
      addWheel(-1.0, -0.5, -0.8, 0.45, 0.3, '#0f172a');
    } else if (geometryType === 'boom_sprayer') {
      // 400L Polyethylene Chemical Tank
      addBox(0, 0.3, 0, 1.3, 1.2, 1.0, primaryColor);
      // Heavy Steel Mounting Frame & 3-Point Hitch
      addBox(0, -0.3, -0.5, 1.4, 0.9, 0.3, '#334155');
      // 12-Metre Extended Folding Spray Boom
      addBox(0, -0.1, 0.8, 4.2, 0.15, 0.15, '#e2e8f0');
      // Left and Right Folding Outrigger Arms
      addBox(-2.0, 0.2, 0.8, 0.15, 0.5, 0.15, accentColor);
      addBox(2.0, 0.2, 0.8, 0.15, 0.5, 0.15, accentColor);
    } else {
      // Default: Tractor + Hydraulic MB Plough
      // Tractor Hood & Engine
      addBox(0.6, 0.3, 0, 1.8, 0.9, 1.1, primaryColor);
      // Tractor Driver Station & ROPS Bar
      addBox(-0.6, 0.8, 0, 0.9, 1.4, 1.2, '#1e293b');
      // Front Wheels
      addWheel(1.2, -0.3, 0.7, 0.4, 0.3, '#0f172a');
      addWheel(1.2, -0.3, -0.7, 0.4, 0.3, '#0f172a');
      // Massive Rear Tread Wheels
      addWheel(-0.6, 0.0, 0.8, 0.75, 0.45, '#0f172a');
      addWheel(-0.6, 0.0, -0.8, 0.75, 0.45, '#0f172a');
      // Rear Hydraulic Reversible Mouldboard Plough
      addBox(-1.6, -0.2, 0, 1.1, 0.3, 0.4, '#f8fafc');
      addBox(-1.9, -0.4, 0.2, 0.4, 0.5, 0.6, accentColor);
      addBox(-1.9, 0.1, -0.2, 0.4, 0.5, 0.6, accentColor);
    }

    return { vertices: v, faces: f };
  }, [machine]);

  // Main 3D Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      // Auto-rotation increment if enabled and not being actively dragged
      if (isRotating && !isDraggingRef.current) {
        setRotation((prev) => ({
          ...prev,
          y: prev.y + 0.012,
        }));
      }

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Gradient Studio Background
      const bgGrad = ctx.createRadialGradient(
        width / 2,
        height / 2 - 30,
        20,
        width / 2,
        height / 2,
        width * 0.7
      );
      bgGrad.addColorStop(0, '#1e293b'); // Dark slate center
      bgGrad.addColorStop(1, '#090d16'); // Midnight dark border
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Ground Reflection Grid
      const cx = width / 2;
      const cy = height / 2 + 60;
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.12)'; // faint emerald grid
      ctx.lineWidth = 1;
      for (let r = -240; r <= 240; r += 40) {
        ctx.beginPath();
        ctx.moveTo(cx + r, cy - 25);
        ctx.lineTo(cx + r * 1.6, cy + 120);
        ctx.stroke();
      }
      for (let y = 0; y <= 120; y += 30) {
        const spread = (y / 120) * 0.6 + 1.0;
        ctx.beginPath();
        ctx.moveTo(cx - 240 * spread, cy + y);
        ctx.lineTo(cx + 240 * spread, cy + y);
        ctx.stroke();
      }

      // 3D Matrix Transformations
      const { vertices, faces } = getMesh();
      const cosX = Math.cos(rotation.x);
      const sinX = Math.sin(rotation.x);
      const cosY = Math.cos(rotation.y);
      const sinY = Math.sin(rotation.y);

      // Project vertices: rotate Y then X, apply scale, perspective divide
      const scale = 80 * zoom;
      const projected = vertices.map(([x, y, z]) => {
        // Rotate around Y
        const x1 = x * cosY - z * sinY;
        const z1 = z * cosY + x * sinY;
        // Rotate around X
        const y2 = y * cosX - z1 * sinX;
        const z2 = z1 * cosX + y * sinX;

        // Perspective divide
        const distance = 8;
        const fov = 4.8;
        const depth = distance + z2;
        const pz = fov / Math.max(0.1, depth);
        const px = cx + x1 * scale * pz;
        const py = cy - y2 * scale * pz;

        return { x: px, y: py, z: z2 };
      });

      // Calculate face centers for Painter's algorithm depth-sorting
      const sortedFaces = faces.map((face) => {
        let sumZ = 0;
        face.indices.forEach((idx) => {
          sumZ += projected[idx]?.z ?? 0;
        });
        const centerZ = sumZ / face.indices.length;
        return { ...face, centerZ };
      });

      // Sort faces back-to-front (lowest Z drawn first)
      sortedFaces.sort((a, b) => (b.centerZ ?? 0) - (a.centerZ ?? 0));

      // Draw each face with shading
      sortedFaces.forEach((face) => {
        if (face.indices.length < 3) return;
        ctx.beginPath();
        const first = projected[face.indices[0]];
        ctx.moveTo(first.x, first.y);
        for (let i = 1; i < face.indices.length; i++) {
          const pt = projected[face.indices[i]];
          ctx.lineTo(pt.x, pt.y);
        }
        ctx.closePath();

        if (wireframeMode) {
          ctx.strokeStyle = face.color;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        } else {
          // Normal lighting calculation based on depth
          ctx.fillStyle = face.color;
          ctx.fill();
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      // Render 3D Interactive Hotspots
      machine.model3DConfig.hotspots.forEach((spot) => {
        // Transform hotspot 3D coordinates
        const x1 = spot.x * cosY - spot.z * sinY;
        const z1 = spot.z * cosY + spot.x * sinY;
        const y2 = spot.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + spot.y * sinX;
        const depth = 8 + z2;
        const pz = 4.8 / Math.max(0.1, depth);
        const sx = cx + x1 * scale * pz;
        const sy = cy - y2 * scale * pz;

        // Glowing pulsing ring
        const isHovered = activeHotspot?.name === spot.name;
        ctx.save();
        ctx.beginPath();
        ctx.arc(sx, sy, isHovered ? 12 : 8, 0, Math.PI * 2);
        ctx.fillStyle = isHovered ? '#10b981' : '#38bdf8';
        ctx.shadowColor = isHovered ? '#10b981' : '#38bdf8';
        ctx.shadowBlur = 15;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(sx, sy, isHovered ? 18 : 12, 0, Math.PI * 2);
        ctx.strokeStyle = isHovered ? 'rgba(16, 185, 129, 0.6)' : 'rgba(56, 189, 248, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label above hotspot
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.fillText(spot.name, sx + 14, sy + 4);
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [rotation, isRotating, zoom, wireframeMode, activeHotspot, machine, getMesh]);

  // Mouse & Touch Drag Handlers for 360° Free Orbit
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    setRotation((prev) => ({
      x: Math.max(-1.2, Math.min(1.2, prev.x + dy * 0.008)),
      y: prev.y + dx * 0.008,
    }));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      lastMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - lastMousePosRef.current.x;
    const dy = e.touches[0].clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

    setRotation((prev) => ({
      x: Math.max(-1.2, Math.min(1.2, prev.x + dy * 0.008)),
      y: prev.y + dx * 0.008,
    }));
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  // Preset Camera Angles
  const setPresetAngle = (preset: 'isometric' | 'front' | 'side' | 'top') => {
    setIsRotating(false);
    if (preset === 'isometric') setRotation({ x: 0.35, y: -0.6 });
    else if (preset === 'front') setRotation({ x: 0.0, y: 0.0 });
    else if (preset === 'side') setRotation({ x: 0.0, y: -Math.PI / 2 });
    else if (preset === 'top') setRotation({ x: Math.PI / 2.2, y: 0.0 });
  };

  return (
    <div className={`relative rounded-3xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-950 ${className}`}>
      {/* 3D Canvas */}
      <canvas
        ref={canvasRef}
        width={720}
        height={420}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="w-full h-auto cursor-grab active:cursor-grabbing block"
      />

      {/* Top Overlay Badge & Drag Hint */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          Interactive 3D Model
        </span>
        <span className="hidden sm:inline-block text-[11px] text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded-full backdrop-blur-md border border-slate-800">
          Drag to rotate 360°
        </span>
      </div>

      {/* Top Right Presets & View Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setPresetAngle('isometric')}
          className="text-[11px] font-bold text-slate-300 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          3D Iso
        </button>
        <button
          type="button"
          onClick={() => setPresetAngle('front')}
          className="text-[11px] font-bold text-slate-300 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          Front
        </button>
        <button
          type="button"
          onClick={() => setPresetAngle('side')}
          className="text-[11px] font-bold text-slate-300 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          Side
        </button>
        <button
          type="button"
          onClick={() => setPresetAngle('top')}
          className="text-[11px] font-bold text-slate-300 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          Top
        </button>
      </div>

      {/* Bottom Floating Toolbar */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
        {/* Play/Pause Auto-spin & Wireframe */}
        <div className="flex items-center gap-2 bg-slate-900/85 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setIsRotating(!isRotating)}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-colors"
            title={isRotating ? 'Pause auto-rotation' : 'Play 360° auto-rotation'}
          >
            {isRotating ? <Pause className="w-3.5 h-3.5 text-emerald-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isRotating ? 'Pause' : 'Auto 360°'}</span>
          </button>
          <button
            type="button"
            onClick={() => setWireframeMode(!wireframeMode)}
            className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-xl transition-colors ${
              wireframeMode ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
            title="Toggle Wireframe Shading"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Wireframe</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setRotation({ x: 0.35, y: -0.6 });
              setZoom(1.0);
            }}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            title="Reset Camera"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5 bg-slate-900/85 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-bold text-slate-300 px-1">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(1.8, z + 0.15))}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive Hotspots Drawer */}
      <div className="p-4 bg-slate-900 border-t border-slate-800 text-xs text-slate-300">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-white font-bold">
            <Info className="w-4 h-4 text-emerald-400" />
            <span>Interactive Machine Sub-Systems & Components:</span>
          </div>
          <span className="text-[11px] text-slate-400">Click any component to inspect</span>
        </div>
        <div className="grid sm:grid-cols-3 gap-2">
          {machine.model3DConfig.hotspots.map((spot) => (
            <button
              type="button"
              key={spot.name}
              onClick={() => setActiveHotspot(activeHotspot?.name === spot.name ? null : spot)}
              className={`text-left p-2.5 rounded-xl border transition-all ${
                activeHotspot?.name === spot.name
                  ? 'border-emerald-500 bg-emerald-950/60 text-white ring-1 ring-emerald-500'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="font-bold text-emerald-400 flex items-center justify-between">
                <span>{spot.name}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                {spot.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
