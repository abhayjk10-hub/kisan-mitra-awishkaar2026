/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react';
import { Camera } from 'lucide-react';

interface MachineryIllustrationProps {
  id: string;
  name?: string;
  className?: string;
}

export const MACHINERY_PHOTOS: Record<
  string,
  {
    url: string;
    fallbackUrl: string;
    alt: string;
    label: string;
  }
> = {
  'mac-plough-01': {
    url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1000&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1000&q=80',
    alt: '55 HP Agricultural Tractor with Hydraulic Reversible MB Plough in field',
    label: 'Hydraulic Reversible MB Plough',
  },
  'mac-rotavator-02': {
    url: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1000&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1000&q=80',
    alt: 'Multi-Speed Tractor Rotary Tiller (Rotavator) tilling soil',
    label: 'Rotary Tiller (Rotavator)',
  },
  'mac-drill-03': {
    url: 'https://images.unsplash.com/photo-1527842891421-42eec6e703ea?auto=format&fit=crop&w=1000&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1000&q=80',
    alt: 'Precision Tractor Seed-cum-Fertilizer Drill sowing seeds',
    label: 'Seed-cum-Fertilizer Drill',
  },
  'mac-harvester-04': {
    url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1000&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1527842891421-42eec6e703ea?auto=format&fit=crop&w=1000&q=80',
    alt: 'Multi-Crop Combine Harvester working in grain field',
    label: 'Self-Propelled Combine Harvester',
  },
  'mac-thresher-05': {
    url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1000&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1000&q=80',
    alt: 'Heavy Duty Multi-Crop Tractor PTO Thresher in farm yard',
    label: 'Multi-Crop High-Output Thresher',
  },
  'mac-huller-06': {
    url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=1000&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1000&q=80',
    alt: 'Commercial Mini Rice Huller and Grain Polisher Machinery',
    label: 'Mini Rice Huller & Polisher',
  },
  'mac-laser-07': {
    url: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1000&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1000&q=80',
    alt: 'Precision Laser Land Leveller attached to tractor with receiver mast',
    label: 'Dual-Slope Laser Land Leveller',
  },
  'mac-sprayer-08': {
    url: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=1000&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1000&q=80',
    alt: 'Tractor-Mounted Hydraulic Boom Sprayer with wide folding arms',
    label: 'Hydraulic Boom Sprayer',
  },
};

export default function MachineryIllustration({ id, name, className = '' }: MachineryIllustrationProps) {
  const photo = MACHINERY_PHOTOS[id];
  const [imgSrc, setImgSrc] = useState(photo?.url || '');
  const [hasError, setHasError] = useState(false);

  const renderSvgFallback = () => {
    switch (id) {
      case 'mac-plough-01':
        return <PloughIllustration className={className} name={name} />;
      case 'mac-rotavator-02':
        return <RotavatorIllustration className={className} name={name} />;
      case 'mac-drill-03':
        return <SeedDrillIllustration className={className} name={name} />;
      case 'mac-harvester-04':
        return <CombineHarvesterIllustration className={className} name={name} />;
      case 'mac-thresher-05':
        return <ThresherIllustration className={className} name={name} />;
      case 'mac-huller-06':
        return <HullerIllustration className={className} name={name} />;
      case 'mac-laser-07':
        return <LaserLevellerIllustration className={className} name={name} />;
      case 'mac-sprayer-08':
        return <BoomSprayerIllustration className={className} name={name} />;
      default:
        return <PloughIllustration className={className} name={name} />;
    }
  };

  if (hasError || !photo) {
    return renderSvgFallback();
  }

  return (
    <div className={`relative w-full h-full rounded-2xl overflow-hidden bg-slate-900 group shadow-md border border-slate-200 select-none ${className}`}>
      {/* Real machinery photo */}
      <img
        src={imgSrc}
        alt={photo.alt || name || 'Agricultural Machinery'}
        loading="lazy"
        onError={() => {
          if (imgSrc === photo.url && photo.fallbackUrl) {
            setImgSrc(photo.fallbackUrl);
          } else {
            setHasError(true);
          }
        }}
        className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
      />

      {/* Subtle bottom gradient for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />

      {/* Real Equipment Photo Badge */}
      <div className="absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950/85 text-emerald-300 border border-emerald-400/40 shadow-sm backdrop-blur-md">
        <Camera className="w-3 h-3 text-emerald-400" />
        <span>Real Photo</span>
      </div>

      {/* Machine Label Bar */}
      <div className="absolute bottom-2.5 left-3 right-3 z-10 flex items-center justify-between text-white pointer-events-none">
        <span className="text-xs font-extrabold tracking-wide drop-shadow-md truncate">
          {name || photo.label}
        </span>
        <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-500/30">
          HD
        </span>
      </div>
    </div>
  );
}

/* 1. Hydraulic Reversible MB Plough with Tractor Hitch */
export function PloughIllustration({ className = '', name = 'Reversible MB Plough' }: { className?: string; name?: string }) {
  return (
    <svg
      viewBox="0 0 360 220"
      className={`w-full h-auto select-none ${className}`}
      role="img"
      aria-label={name}
    >
      <defs>
        <linearGradient id="plough-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#f1f5f9" />
        </linearGradient>
        <linearGradient id="tractor-body" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#15803d" />
          <stop offset="100%" stopColor="#166534" />
        </linearGradient>
        <linearGradient id="steel-beam" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#c2410c" />
        </linearGradient>
        <linearGradient id="chrome-share" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="50%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
      </defs>

      {/* Background card canvas */}
      <rect width="360" height="220" rx="16" fill="url(#plough-bg)" />
      
      {/* Ground Furrow Soil Line */}
      <path d="M 0 178 Q 60 176, 120 180 T 240 177 T 360 180 L 360 220 L 0 220 Z" fill="#e2e8f0" opacity="0.6" />
      <path d="M 170 178 Q 210 168, 250 178 Q 290 166, 330 178" stroke="#cbd5e1" strokeWidth="2.5" fill="none" strokeDasharray="4 3" />

      {/* Front Tractor Cab Silhouette (Left) */}
      <g opacity="0.85">
        <path d="M 20 170 L 45 170 L 45 120 L 75 120 L 85 145 L 115 145 L 115 170 Z" fill="url(#tractor-body)" />
        {/* Rear Heavy Tyre */}
        <circle cx="85" cy="165" r="28" fill="#1e293b" />
        <circle cx="85" cy="165" r="24" fill="#334155" />
        <circle cx="85" cy="165" r="14" fill="#64748b" />
        <circle cx="85" cy="165" r="6" fill="#f8fafc" />
        {/* Front Tyre */}
        <circle cx="32" cy="172" r="15" fill="#1e293b" />
        <circle cx="32" cy="172" r="8" fill="#64748b" />
        {/* Exhaust Stack */}
        <rect x="70" y="105" width="4" height="22" rx="1" fill="#475569" />
      </g>

      {/* 3-Point Linkage & Top Link Cylinder */}
      <g>
        <line x1="110" y1="150" x2="148" y2="140" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />
        <line x1="108" y1="162" x2="145" y2="158" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />
        {/* Hydraulic Turnover Cylinder (Blue/Silver) */}
        <rect x="135" y="125" width="28" height="9" rx="3" fill="#0284c7" />
        <rect x="160" y="127" width="16" height="5" rx="1" fill="#cbd5e1" />
        <circle cx="140" cy="129.5" r="2.5" fill="#ffffff" />
      </g>

      {/* Heavy-duty Reversible Beam Frame */}
      <g>
        {/* Main turnover axle center pivot */}
        <circle cx="152" cy="146" r="8" fill="#0f172a" />
        <circle cx="152" cy="146" r="4" fill="#f8fafc" />
        
        {/* Diagonal Steel Beam */}
        <path d="M 152 146 L 310 102 L 316 112 L 158 156 Z" fill="url(#steel-beam)" />
        
        {/* Bottom 1 (Forward Bottom) */}
        {/* Standard Leg */}
        <path d="M 195 135 L 208 175 L 216 173 L 203 133 Z" fill="#334155" />
        {/* Working Lower Mouldboard */}
        <path d="M 190 180 C 195 160, 230 155, 240 178 C 225 186, 205 186, 190 180 Z" fill="url(#chrome-share)" stroke="#334155" strokeWidth="1" />
        {/* Reversible Upper Inverted Mouldboard */}
        <path d="M 200 115 C 205 132, 235 135, 245 118 C 232 110, 212 110, 200 115 Z" fill="url(#chrome-share)" opacity="0.65" stroke="#334155" strokeWidth="1" />

        {/* Bottom 2 (Middle Bottom) */}
        <path d="M 245 120 L 258 175 L 266 173 L 253 118 Z" fill="#334155" />
        <path d="M 240 180 C 245 160, 280 155, 290 178 C 275 186, 255 186, 240 180 Z" fill="url(#chrome-share)" stroke="#334155" strokeWidth="1" />
        <path d="M 250 100 C 255 118, 285 120, 295 105 C 282 96, 262 96, 250 100 Z" fill="url(#chrome-share)" opacity="0.65" stroke="#334155" strokeWidth="1" />

        {/* Bottom 3 (Rear Bottom) */}
        <path d="M 292 107 L 305 174 L 313 172 L 300 105 Z" fill="#334155" />
        <path d="M 288 180 C 293 160, 328 155, 338 178 C 323 186, 303 186, 288 180 Z" fill="url(#chrome-share)" stroke="#334155" strokeWidth="1" />
        <path d="M 298 87 C 303 105, 333 107, 343 92 C 330 83, 310 83, 298 87 Z" fill="url(#chrome-share)" opacity="0.65" stroke="#334155" strokeWidth="1" />

        {/* Rear Furrow Depth Wheel */}
        <circle cx="330" cy="170" r="12" fill="#475569" />
        <circle cx="330" cy="170" r="7" fill="#cbd5e1" />
        <line x1="315" y1="120" x2="330" y2="170" stroke="#0f172a" strokeWidth="3" />
      </g>

      {/* Spec badge overlay */}
      <g transform="translate(14, 16)">
        <rect width="112" height="24" rx="6" fill="#ffffff" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.06))" />
        <text x="8" y="16" fill="#c2410c" fontSize="10" fontWeight="bold" fontFamily="system-ui, sans-serif">
          HYDRAULIC MB PLOUGH
        </text>
      </g>
    </svg>
  );
}

/* 2. Multi-Speed Gear Drive Rotavator (Rotary Tiller with 48 L-Blades) */
export function RotavatorIllustration({ className = '', name = 'Gear Drive Rotavator' }: { className?: string; name?: string }) {
  return (
    <svg
      viewBox="0 0 360 220"
      className={`w-full h-auto select-none ${className}`}
      role="img"
      aria-label={name}
    >
      <defs>
        <linearGradient id="rot-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fef2f2" />
          <stop offset="100%" stopColor="#fff1f2" />
        </linearGradient>
        <linearGradient id="rot-red" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>
        <linearGradient id="gearbox-metal" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
      </defs>

      <rect width="360" height="220" rx="16" fill="url(#rot-bg)" />
      
      {/* Tilled Soil Layer */}
      <path d="M 0 178 Q 40 174, 90 179 T 180 175 T 270 179 T 360 176 L 360 220 L 0 220 Z" fill="#fee2e2" opacity="0.6" />
      <path d="M 40 182 Q 100 172, 160 182 Q 220 174, 320 182" stroke="#fca5a5" strokeWidth="2" fill="none" strokeDasharray="3 3" />

      {/* PTO Drive Shaft (Connecting to Tractor) */}
      <g>
        <line x1="25" y1="105" x2="135" y2="118" stroke="#334155" strokeWidth="12" strokeLinecap="round" />
        <line x1="25" y1="105" x2="135" y2="118" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round" strokeDasharray="8 6" />
        {/* PTO Universal Joint Yellow Safety Shield */}
        <rect x="40" y="99" width="30" height="18" rx="4" fill="#eab308" />
        <rect x="95" y="106" width="28" height="18" rx="4" fill="#eab308" />
      </g>

      {/* Multi-Speed Heavy Cast Iron Gearbox */}
      <g>
        <rect x="130" y="85" width="46" height="58" rx="6" fill="url(#gearbox-metal)" />
        <circle cx="153" cy="114" r="14" fill="#334155" stroke="#64748b" strokeWidth="2" />
        <circle cx="153" cy="114" r="6" fill="#94a3b8" />
        <rect x="145" y="75" width="16" height="12" rx="2" fill="#0f172a" /> {/* Gearbox oil breather */}
        {/* 3-Point Hitch Mast A-frame */}
        <polygon points="120,135 153,60 186,135" fill="none" stroke="#b91c1c" strokeWidth="6" strokeLinejoin="round" />
        <circle cx="153" cy="65" r="5" fill="#f8fafc" stroke="#0f172a" strokeWidth="2" />
      </g>

      {/* Main Structural Pipe & Upper Red Shield Canopy */}
      <g>
        <rect x="80" y="112" width="220" height="12" rx="4" fill="#7f1d1d" />
        {/* Main protective safety hood covering rotor */}
        <path d="M 80 120 C 80 110, 300 110, 300 120 L 310 155 L 70 155 Z" fill="url(#rot-red)" stroke="#991b1b" strokeWidth="1.5" />
        
        {/* Side Gear Drive Housing (Left Side) */}
        <path d="M 70 120 L 88 120 L 92 180 L 68 180 Z" fill="#7f1d1d" stroke="#450a0a" strokeWidth="1.5" />
        <circle cx="80" cy="172" r="10" fill="#1e293b" />
        <circle cx="80" cy="172" r="4" fill="#94a3b8" />

        {/* Trailing Board / Leveling Flap at Rear */}
        <path d="M 305 145 L 328 178 L 298 178 L 285 145 Z" fill="#991b1b" opacity="0.9" />
        <line x1="285" y1="140" x2="315" y2="165" stroke="#475569" strokeWidth="3" />
        <circle cx="315" cy="165" r="3" fill="#cbd5e1" />
      </g>

      {/* Rotary Rotor Shaft with 48 Curved L-Blades (Rotating into Soil) */}
      <g>
        <line x1="90" y1="172" x2="280" y2="172" stroke="#0f172a" strokeWidth="8" strokeLinecap="round" />
        
        {/* Blade Flange Groups */}
        {[110, 135, 160, 185, 210, 235, 260].map((cx, idx) => (
          <g key={idx}>
            <circle cx={cx} cy="172" r="7" fill="#334155" />
            {/* L-Blade pointing down-right */}
            <path d={`M ${cx} 172 Q ${cx + 12} 182, ${cx + 16} 192 L ${cx + 8} 194 Q ${cx + 6} 182, ${cx - 2} 175 Z`} fill="#0f172a" stroke="#475569" strokeWidth="0.5" />
            {/* L-Blade pointing up-left */}
            <path d={`M ${cx} 172 Q ${cx - 12} 162, ${cx - 16} 152 L ${cx - 8} 150 Q ${cx - 6} 162, ${cx + 2} 169 Z`} fill="#1e293b" stroke="#64748b" strokeWidth="0.5" />
          </g>
        ))}

        {/* Depth Adjuster Skid (Right side) */}
        <path d="M 282 145 L 285 184 L 270 184" fill="none" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Badge */}
      <g transform="translate(14, 16)">
        <rect width="128" height="24" rx="6" fill="#ffffff" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.06))" />
        <text x="8" y="16" fill="#b91c1c" fontSize="10" fontWeight="bold" fontFamily="system-ui, sans-serif">
          GEAR DRIVE ROTAVATOR
        </text>
      </g>
    </svg>
  );
}

/* 3. Automatic Multi-Crop Seed-cum-Fertilizer Drill (9 Tynes) */
export function SeedDrillIllustration({ className = '', name = 'Seed-cum-Fertilizer Drill' }: { className?: string; name?: string }) {
  return (
    <svg
      viewBox="0 0 360 220"
      className={`w-full h-auto select-none ${className}`}
      role="img"
      aria-label={name}
    >
      <defs>
        <linearGradient id="drill-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f0fdf4" />
          <stop offset="100%" stopColor="#dcfce7" />
        </linearGradient>
        <linearGradient id="seed-box" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
        <linearGradient id="fert-box" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
      </defs>

      <rect width="360" height="220" rx="16" fill="url(#drill-bg)" />
      
      {/* Sown Furrow Soil Bed */}
      <rect x="0" y="180" width="360" height="40" fill="#bbf7d0" opacity="0.4" />
      
      {/* 3-Point Hitch & Main Tool Bar Frame */}
      <g>
        <line x1="80" y1="120" x2="280" y2="120" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
        {/* A-frame Hitch */}
        <polygon points="140,120 180,60 220,120" fill="none" stroke="#0284c7" strokeWidth="5" strokeLinejoin="round" />
        <circle cx="180" cy="65" r="4" fill="#ffffff" stroke="#0284c7" strokeWidth="2" />
      </g>

      {/* Dual Hoppers: Fertilizer (Back) & Seed (Front) */}
      <g>
        {/* Fertilizer Hopper (Green, rear) */}
        <path d="M 75 75 L 285 75 L 275 110 L 85 110 Z" fill="url(#fert-box)" stroke="#14532d" strokeWidth="1.5" />
        <rect x="73" y="70" width="214" height="6" rx="2" fill="#15803d" />
        <text x="140" y="94" fill="#dcfce7" fontSize="9" fontWeight="bold" fontFamily="system-ui">FERTILIZER</text>

        {/* Seed Hopper (Blue, front) */}
        <path d="M 80 85 L 280 85 L 270 118 L 90 118 Z" fill="url(#seed-box)" stroke="#0c4a6e" strokeWidth="1.5" />
        <rect x="78" y="80" width="204" height="6" rx="2" fill="#0284c7" />
        <text x="155" y="104" fill="#e0f2fe" fontSize="9" fontWeight="bold" fontFamily="system-ui">SEED</text>
      </g>

      {/* Fluted Metering Rollers & Transparent Seed Delivery Tubes */}
      <g>
        {[98, 118, 138, 158, 178, 198, 218, 238, 258].map((x, i) => (
          <g key={i}>
            {/* Metering Cup */}
            <circle cx={x} cy="120" r="4" fill="#e2e8f0" stroke="#475569" strokeWidth="1" />
            {/* Flexible Clear Delivery Tube */}
            <path
              d={`M ${x} 124 C ${x + (i % 2 === 0 ? 3 : -3)} 140, ${x + (i % 2 === 0 ? -2 : 2)} 160, ${x} 175`}
              fill="none"
              stroke="#0284c7"
              strokeWidth="2.5"
              strokeDasharray="4 2"
              opacity="0.85"
            />
            {/* Spring-Loaded Tyne (Steel Shovel) */}
            <line x1={x} y1="122" x2={x} y2="182" stroke="#1e293b" strokeWidth="3" />
            {/* Inverted T Furrow Opener Shoe */}
            <polygon points={`${x - 5},186 ${x + 5},186 ${x},178`} fill="#0f172a" />
            {/* Seed Droplets Falling into Soil */}
            <circle cx={x} cy="190" r="2" fill="#eab308" />
          </g>
        ))}
      </g>

      {/* Ground Drive Wheel (Peg Wheel Driving Metering Shaft via Chain) */}
      <g>
        <circle cx="295" cy="165" r="22" fill="#1e293b" />
        <circle cx="295" cy="165" r="18" fill="#475569" />
        <circle cx="295" cy="165" r="8" fill="#e2e8f0" />
        {/* Drive pegs on circumference */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <line
            key={i}
            x1={295 + Math.cos((angle * Math.PI) / 180) * 18}
            y1={165 + Math.sin((angle * Math.PI) / 180) * 18}
            x2={295 + Math.cos((angle * Math.PI) / 180) * 24}
            y2={165 + Math.sin((angle * Math.PI) / 180) * 24}
            stroke="#0f172a"
            strokeWidth="2.5"
          />
        ))}
        {/* Drive Chain linking Wheel to Seed Box */}
        <line x1="280" y1="118" x2="295" y2="165" stroke="#eab308" strokeWidth="2" strokeDasharray="3 2" />
      </g>

      {/* Badge */}
      <g transform="translate(14, 16)">
        <rect width="138" height="24" rx="6" fill="#ffffff" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.06))" />
        <text x="8" y="16" fill="#0369a1" fontSize="10" fontWeight="bold" fontFamily="system-ui, sans-serif">
          9-TYNE SEED-CUM-DRILL
        </text>
      </g>
    </svg>
  );
}

/* 4. Self-Propelled Multi-Crop Combine Harvester with SMS */
export function CombineHarvesterIllustration({ className = '', name = 'Combine Harvester' }: { className?: string; name?: string }) {
  return (
    <svg
      viewBox="0 0 360 220"
      className={`w-full h-auto select-none ${className}`}
      role="img"
      aria-label={name}
    >
      <defs>
        <linearGradient id="harv-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fefce8" />
          <stop offset="100%" stopColor="#fef08a" />
        </linearGradient>
        <linearGradient id="harv-green" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#15803d" />
          <stop offset="100%" stopColor="#14532d" />
        </linearGradient>
        <linearGradient id="reel-yellow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
      </defs>

      <rect width="360" height="220" rx="16" fill="url(#harv-bg)" />
      
      {/* Ground Straw Line */}
      <line x1="0" y1="184" x2="360" y2="184" stroke="#ca8a04" strokeWidth="2" strokeDasharray="6 3" />

      {/* Harvester Main Body Chassis */}
      <g>
        <path d="M 120 160 L 120 90 L 170 65 L 290 65 L 320 110 L 320 160 L 250 160 L 210 160 Z" fill="url(#harv-green)" stroke="#0f172a" strokeWidth="1.5" />
        
        {/* Grain Tank Top Hatch */}
        <rect x="180" y="52" width="70" height="15" rx="3" fill="#ca8a04" />
        {/* Unloading Auger Arm (Folded back / angled up) */}
        <line x1="210" y1="62" x2="310" y2="35" stroke="#f8fafc" strokeWidth="6" strokeLinecap="round" />
        <circle cx="310" cy="35" r="4" fill="#0f172a" />

        {/* Operator Cabin (Glazed with sun-visor) */}
        <path d="M 115 130 L 125 75 L 168 75 L 168 130 Z" fill="#38bdf8" opacity="0.6" stroke="#0f172a" strokeWidth="1.5" />
        {/* Cabin Roof Overhang */}
        <rect x="110" y="70" width="65" height="7" rx="2" fill="#f8fafc" />
        {/* Driver Silhouette */}
        <circle cx="145" cy="95" r="6" fill="#1e293b" />
        <path d="M 137 115 C 137 105, 153 105, 153 115 Z" fill="#1e293b" />
        <line x1="125" y1="110" x2="135" y2="105" stroke="#f8fafc" strokeWidth="2" /> {/* Steering */}

        {/* Ventilation Louvres */}
        <line x1="260" y1="95" x2="295" y2="95" stroke="#f8fafc" strokeWidth="2" />
        <line x1="260" y1="105" x2="295" y2="105" stroke="#f8fafc" strokeWidth="2" />
        <line x1="260" y1="115" x2="295" y2="115" stroke="#f8fafc" strokeWidth="2" />
      </g>

      {/* Front Feeder House (Inclined conveyor channel) */}
      <g>
        <polygon points="120,135 125,152 70,170 65,152" fill="#334155" stroke="#0f172a" strokeWidth="1.5" />
      </g>

      {/* Front Cutter Bar & Rotating Reel Assembly */}
      <g>
        {/* Serrated Cutter Bar Platform */}
        <path d="M 30 178 L 75 168 L 78 178 L 26 182 Z" fill="#475569" stroke="#0f172a" strokeWidth="1" />
        <line x1="26" y1="182" x2="78" y2="178" stroke="#f8fafc" strokeWidth="2" strokeDasharray="3 2" />

        {/* Big Rotating Golden Reel with Tines */}
        <circle cx="48" cy="148" r="24" fill="none" stroke="url(#reel-yellow)" strokeWidth="3" />
        <circle cx="48" cy="148" r="5" fill="#0f172a" />
        {/* 5 Reel Bats with Fingers */}
        {[0, 72, 144, 216, 288].map((deg, i) => (
          <g key={i}>
            <line
              x1="48"
              y1="148"
              x2={48 + Math.cos((deg * Math.PI) / 180) * 24}
              y2={148 + Math.sin((deg * Math.PI) / 180) * 24}
              stroke="#ca8a04"
              strokeWidth="2"
            />
            <circle
              cx={48 + Math.cos((deg * Math.PI) / 180) * 24}
              cy={148 + Math.sin((deg * Math.PI) / 180) * 24}
              r="3"
              fill="#eab308"
            />
          </g>
        ))}
      </g>

      {/* Massive Front Traction Drive Tyre (Large Deep Lug Tread) */}
      <g>
        <circle cx="160" cy="165" r="32" fill="#0f172a" />
        <circle cx="160" cy="165" r="28" fill="#1e293b" />
        <circle cx="160" cy="165" r="16" fill="#facc15" stroke="#0f172a" strokeWidth="2" />
        <circle cx="160" cy="165" r="7" fill="#334155" />
        {/* Tyre Lugs */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => (
          <line
            key={i}
            x1={160 + Math.cos((deg * Math.PI) / 180) * 20}
            y1={165 + Math.sin((deg * Math.PI) / 180) * 20}
            x2={160 + Math.cos((deg * Math.PI) / 180) * 31}
            y2={165 + Math.sin((deg * Math.PI) / 180) * 31}
            stroke="#475569"
            strokeWidth="2.5"
          />
        ))}
      </g>

      {/* Rear Steering Tyre */}
      <g>
        <circle cx="280" cy="172" r="18" fill="#0f172a" />
        <circle cx="280" cy="172" r="14" fill="#334155" />
        <circle cx="280" cy="172" r="8" fill="#facc15" />
      </g>

      {/* Super SMS (Straw Management System) Attachment at Rear */}
      <g>
        <rect x="312" y="145" width="22" height="25" rx="3" fill="#e11d48" stroke="#881337" strokeWidth="1" />
        <circle cx="323" cy="157" r="6" fill="#4c0519" />
        <path d="M 326 170 L 338 185 M 323 170 L 328 185 M 320 170 L 318 185" stroke="#ca8a04" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* Badge */}
      <g transform="translate(14, 16)">
        <rect width="145" height="24" rx="6" fill="#ffffff" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.06))" />
        <text x="8" y="16" fill="#15803d" fontSize="10" fontWeight="bold" fontFamily="system-ui, sans-serif">
          COMBINE HARVESTER (SMS)
        </text>
      </g>
    </svg>
  );
}

/* 5. Multi-Crop Axial Flow Thresher with Hopper & Cleaning Blowers */
export function ThresherIllustration({ className = '', name = 'Axial Flow Thresher' }: { className?: string; name?: string }) {
  return (
    <svg
      viewBox="0 0 360 220"
      className={`w-full h-auto select-none ${className}`}
      role="img"
      aria-label={name}
    >
      <defs>
        <linearGradient id="thresh-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f0f9ff" />
          <stop offset="100%" stopColor="#e0f2fe" />
        </linearGradient>
        <linearGradient id="thresh-blue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#075985" />
        </linearGradient>
      </defs>

      <rect width="360" height="220" rx="16" fill="url(#thresh-bg)" />

      {/* Foundation / Ground */}
      <line x1="20" y1="184" x2="340" y2="184" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5 3" />

      {/* Main Structural Chassis Frame */}
      <g>
        <rect x="75" y="152" width="210" height="10" rx="2" fill="#1e293b" />
        {/* Tow Bar Tongue at Front */}
        <line x1="75" y1="157" x2="30" y2="168" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
        <circle cx="28" cy="169" r="5" fill="#f8fafc" stroke="#0f172a" strokeWidth="3" />
      </g>

      {/* Drum Cylinder Housing (Axial Flow Thresher Drum) */}
      <g>
        <rect x="110" y="85" width="145" height="68" rx="8" fill="url(#thresh-blue)" stroke="#0c4a6e" strokeWidth="1.5" />
        {/* Inspection Door & Bolted Flange */}
        <rect x="135" y="98" width="60" height="35" rx="4" fill="#0369a1" stroke="#e0f2fe" strokeWidth="1" />
        <circle cx="145" cy="115" r="2" fill="#ffffff" />
        <circle cx="185" cy="115" r="2" fill="#ffffff" />
        {/* Rotor Pulley on Side */}
        <circle cx="240" cy="119" r="16" fill="#334155" stroke="#0f172a" strokeWidth="2" />
        <circle cx="240" cy="119" r="6" fill="#94a3b8" />
        {/* V-Belt Drive linking Pulley to Blower */}
        <path d="M 240 119 L 260 145" stroke="#0f172a" strokeWidth="3" />
      </g>

      {/* Feeding Hopper Tray (Top Angled Chute for crop insertion) */}
      <g>
        <polygon points="80,50 145,50 125,85 85,85" fill="#f59e0b" stroke="#b45309" strokeWidth="1.5" />
        <rect x="78" y="46" width="70" height="6" rx="2" fill="#d97706" />
        <text x="92" y="65" fill="#78350f" fontSize="8" fontWeight="bold" fontFamily="system-ui">FEED HOPPER</text>
      </g>

      {/* Cyclone Blower & Chaff Exhaust Pipe (Left / Rear) */}
      <g>
        {/* Upward Curved Blower Duct */}
        <path d="M 235 85 C 235 55, 275 45, 305 50 L 302 62 C 280 58, 250 65, 248 85 Z" fill="#475569" stroke="#1e293b" strokeWidth="1.5" />
        {/* Chaff flying out */}
        <circle cx="316" cy="48" r="2.5" fill="#ca8a04" />
        <circle cx="324" cy="52" r="2" fill="#ca8a04" />
        <circle cx="330" cy="45" r="1.5" fill="#ca8a04" />
      </g>

      {/* Clean Grain Spout (Bottom Discharge) */}
      <g>
        <path d="M 120 153 L 132 178 L 144 178 L 136 153 Z" fill="#e2e8f0" stroke="#334155" strokeWidth="1" />
        {/* Clean grain stream */}
        <circle cx="136" cy="183" r="2" fill="#eab308" />
        <circle cx="140" cy="187" r="2" fill="#eab308" />
      </g>

      {/* Transport Pneumatic Wheels & Axle */}
      <g>
        <line x1="180" y1="157" x2="180" y2="168" stroke="#0f172a" strokeWidth="8" />
        {/* Wheel Hub */}
        <circle cx="180" cy="170" r="18" fill="#1e293b" />
        <circle cx="180" cy="170" r="13" fill="#64748b" />
        <circle cx="180" cy="170" r="5" fill="#f8fafc" />
      </g>

      {/* Badge */}
      <g transform="translate(14, 16)">
        <rect width="138" height="24" rx="6" fill="#ffffff" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.06))" />
        <text x="8" y="16" fill="#0284c7" fontSize="10" fontWeight="bold" fontFamily="system-ui, sans-serif">
          AXIAL FLOW THRESHER
        </text>
      </g>
    </svg>
  );
}

/* 6. Mobile Rubber-Roll Paddy Huller & Grain De-Husking Mill */
export function HullerIllustration({ className = '', name = 'Paddy Huller Mill' }: { className?: string; name?: string }) {
  return (
    <svg
      viewBox="0 0 360 220"
      className={`w-full h-auto select-none ${className}`}
      role="img"
      aria-label={name}
    >
      <defs>
        <linearGradient id="hull-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#faf5ff" />
          <stop offset="100%" stopColor="#f3e8ff" />
        </linearGradient>
        <linearGradient id="hull-teal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#115e59" />
        </linearGradient>
      </defs>

      <rect width="360" height="220" rx="16" fill="url(#hull-bg)" />
      
      {/* Ground Floor */}
      <line x1="30" y1="186" x2="330" y2="186" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="6 3" />

      {/* Sturdy Industrial Stand Frame */}
      <g>
        <line x1="110" y1="140" x2="95" y2="186" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
        <line x1="240" y1="140" x2="255" y2="186" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
        <line x1="98" y1="170" x2="252" y2="170" stroke="#475569" strokeWidth="4" />
      </g>

      {/* Main Milling Chamber Body */}
      <g>
        <rect x="110" y="80" width="130" height="70" rx="10" fill="url(#hull-teal)" stroke="#042f2e" strokeWidth="1.5" />
        
        {/* Upper Paddy Hopper */}
        <polygon points="135,42 215,42 195,80 155,80" fill="#f8fafc" stroke="#64748b" strokeWidth="1.5" />
        <rect x="132" y="38" width="86" height="6" rx="2" fill="#0f766e" />
        <text x="156" y="58" fill="#0f766e" fontSize="8" fontWeight="bold" fontFamily="system-ui">PADDY</text>

        {/* Transparent Window Revealing Dual Rubber Rollers */}
        <rect x="140" y="92" width="70" height="38" rx="6" fill="#042f2e" stroke="#5eead4" strokeWidth="1" />
        {/* Fast Rubber Roller (Left, Black/Rubber) */}
        <circle cx="163" cy="111" r="12" fill="#1e293b" stroke="#e2e8f0" strokeWidth="1.5" />
        <circle cx="163" cy="111" r="4" fill="#0d9488" />
        {/* Slow Rubber Roller (Right, Black/Rubber) */}
        <circle cx="187" cy="111" r="12" fill="#1e293b" stroke="#e2e8f0" strokeWidth="1.5" />
        <circle cx="187" cy="111" r="4" fill="#0d9488" />
        {/* Grain falling through clearance */}
        <line x1="175" y1="95" x2="175" y2="128" stroke="#fef08a" strokeWidth="2" strokeDasharray="3 2" />
      </g>

      {/* Winnowing Fan / Husk Aspirator Blower (Right) */}
      <g>
        <circle cx="230" cy="100" r="18" fill="#334155" stroke="#0f172a" strokeWidth="2" />
        <path d="M 235 90 C 260 70, 290 85, 305 92 L 298 104 C 285 98, 260 88, 240 102 Z" fill="#64748b" />
        {/* Husk Chaff Exhaust */}
        <text x="280" y="80" fill="#a16207" fontSize="8" fontWeight="bold" fontFamily="system-ui">HUSK</text>
        <circle cx="312" cy="94" r="2" fill="#ca8a04" />
        <circle cx="318" cy="91" r="1.5" fill="#ca8a04" />
      </g>

      {/* Brown Rice Gravity Chute (Bottom Left) */}
      <g>
        <polygon points="148,150 172,150 166,176 142,176" fill="#f8fafc" stroke="#334155" strokeWidth="1" />
        {/* Polished Grain Output Collection Bag */}
        <rect x="135" y="174" width="40" height="15" rx="3" fill="#e2e8f0" stroke="#64748b" strokeWidth="1" />
        <text x="142" y="185" fill="#042f2e" fontSize="7" fontWeight="bold" fontFamily="system-ui">RICE</text>
      </g>

      {/* Electric Drive Motor (Underneath) */}
      <g>
        <rect x="75" y="140" width="30" height="24" rx="4" fill="#1e293b" />
        <circle cx="75" cy="152" r="5" fill="#94a3b8" />
        <line x1="75" y1="152" x2="120" y2="111" stroke="#0f172a" strokeWidth="3" strokeDasharray="4 2" />
      </g>

      {/* Badge */}
      <g transform="translate(14, 16)">
        <rect width="142" height="24" rx="6" fill="#ffffff" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.06))" />
        <text x="8" y="16" fill="#0f766e" fontSize="10" fontWeight="bold" fontFamily="system-ui, sans-serif">
          RUBBER-ROLL PADDY HULLER
        </text>
      </g>
    </svg>
  );
}

/* 7. Precision Laser Land Leveller with Dual Slope Transmitter */
export function LaserLevellerIllustration({ className = '', name = 'Laser Land Leveller' }: { className?: string; name?: string }) {
  return (
    <svg
      viewBox="0 0 360 220"
      className={`w-full h-auto select-none ${className}`}
      role="img"
      aria-label={name}
    >
      <defs>
        <linearGradient id="laser-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fff1f2" />
          <stop offset="100%" stopColor="#ffe4e6" />
        </linearGradient>
        <linearGradient id="bucket-yellow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
      </defs>

      <rect width="360" height="220" rx="16" fill="url(#laser-bg)" />
      
      {/* Precision Leveled Plane Ground */}
      <line x1="0" y1="184" x2="360" y2="184" stroke="#e11d48" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />

      {/* Red Laser Reference Beam (Shooting horizontally from tripod) */}
      <line x1="68" y1="72" x2="238" y2="72" stroke="#e11d48" strokeWidth="2.5" strokeDasharray="8 3" opacity="0.9" />
      <circle cx="68" cy="72" r="5" fill="#f43f5e" />

      {/* Laser Transmitter Station on Aluminum Tripod (Left) */}
      <g>
        {/* Rotating Laser Beacon Unit */}
        <rect x="58" y="62" width="20" height="18" rx="3" fill="#e11d48" stroke="#9f1239" strokeWidth="1.5" />
        <rect x="62" y="56" width="12" height="7" rx="2" fill="#38bdf8" />
        {/* Tripod Legs */}
        <line x1="68" y1="80" x2="45" y2="184" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
        <line x1="68" y1="80" x2="68" y2="184" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
        <line x1="68" y1="80" x2="90" y2="184" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
        <text x="46" y="105" fill="#9f1239" fontSize="7" fontWeight="bold" fontFamily="system-ui">LASER BASE</text>
      </g>

      {/* Scraper Bucket & Receiver Mast (Right) */}
      <g>
        {/* Tow Hitch Bar */}
        <line x1="140" y1="172" x2="190" y2="162" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
        <circle cx="138" cy="172" r="4" fill="#f8fafc" stroke="#0f172a" strokeWidth="2" />

        {/* Heavy Boxed Scraper Bucket (Yellow) */}
        <path d="M 190 140 L 275 140 L 285 180 L 195 180 Z" fill="url(#bucket-yellow)" stroke="#854d0e" strokeWidth="1.5" />
        {/* Hardened Reversible Steel Cutting Edge */}
        <rect x="193" y="178" width="94" height="6" rx="1" fill="#0f172a" />

        {/* Telescopic Mast Extending Up */}
        <line x1="238" y1="140" x2="238" y2="60" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
        <circle cx="238" cy="100" r="4" fill="#cbd5e1" />

        {/* 360° Cylindrical Laser Receiver (Intercepting the Red Beam) */}
        <rect x="231" y="60" width="14" height="25" rx="3" fill="#0284c7" stroke="#0369a1" strokeWidth="1" />
        <rect x="233" y="66" width="10" height="12" fill="#38bdf8" />
        {/* Interception Light */}
        <circle cx="238" cy="72" r="3" fill="#f43f5e" />

        {/* Hydraulic Depth Wheels at Rear */}
        <line x1="280" y1="160" x2="305" y2="174" stroke="#0f172a" strokeWidth="5" />
        <circle cx="305" cy="174" r="12" fill="#1e293b" />
        <circle cx="305" cy="174" r="7" fill="#cbd5e1" />
      </g>

      {/* Badge */}
      <g transform="translate(14, 16)">
        <rect width="148" height="24" rx="6" fill="#ffffff" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.06))" />
        <text x="8" y="16" fill="#e11d48" fontSize="10" fontWeight="bold" fontFamily="system-ui, sans-serif">
          LASER LAND LEVELLER
        </text>
      </g>
    </svg>
  );
}

/* 8. Tractor-Mounted 400L Boom Sprayer (12-Metre Hydraulic Boom) */
export function BoomSprayerIllustration({ className = '', name = 'Boom Sprayer' }: { className?: string; name?: string }) {
  return (
    <svg
      viewBox="0 0 360 220"
      className={`w-full h-auto select-none ${className}`}
      role="img"
      aria-label={name}
    >
      <defs>
        <linearGradient id="spray-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f0fdfa" />
          <stop offset="100%" stopColor="#ccfbf1" />
        </linearGradient>
        <linearGradient id="tank-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#0e7490" />
        </linearGradient>
      </defs>

      <rect width="360" height="220" rx="16" fill="url(#spray-bg)" />
      
      {/* Crop Canopy Ground Line */}
      <path d="M 0 182 Q 45 178, 90 182 T 180 182 T 270 182 T 360 182" stroke="#14b8a6" strokeWidth="2" fill="none" opacity="0.6" />

      {/* 400L Polyethylene Chemical Tank (Center) */}
      <g>
        {/* Steel Cradle Frame */}
        <rect x="145" y="125" width="70" height="45" rx="6" fill="#1e293b" />
        <line x1="150" y1="168" x2="135" y2="182" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
        <line x1="210" y1="168" x2="225" y2="182" stroke="#334155" strokeWidth="5" strokeLinecap="round" />

        {/* Oval Translucent Chemical Tank */}
        <rect x="150" y="80" width="60" height="60" rx="16" fill="url(#tank-cyan)" stroke="#155e75" strokeWidth="1.5" />
        <ellipse cx="180" cy="110" rx="22" ry="20" fill="#22d3ee" opacity="0.3" />
        
        {/* Top Screw Fill Cap */}
        <rect x="168" y="72" width="24" height="9" rx="2" fill="#facc15" stroke="#a16207" strokeWidth="1" />
        {/* Level Indicator Markings */}
        <line x1="202" y1="92" x2="207" y2="92" stroke="#ffffff" strokeWidth="1.5" />
        <line x1="200" y1="102" x2="207" y2="102" stroke="#ffffff" strokeWidth="1.5" />
        <line x1="202" y1="112" x2="207" y2="112" stroke="#ffffff" strokeWidth="1.5" />
        <line x1="200" y1="122" x2="207" y2="122" stroke="#ffffff" strokeWidth="1.5" />

        {/* Pressure Regulator Gauge */}
        <circle cx="160" cy="95" r="5" fill="#f8fafc" stroke="#1e293b" strokeWidth="1.5" />
        <line x1="160" y1="95" x2="162" y2="92" stroke="#e11d48" strokeWidth="1" />
      </g>

      {/* 12-Metre Hydraulic Lattice Spray Boom (Wings extending left & right) */}
      <g>
        {/* Main Boom Horizontal Truss */}
        <line x1="25" y1="140" x2="335" y2="140" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
        <line x1="25" y1="148" x2="335" y2="148" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />

        {/* Lattice Cross Struts */}
        {[35, 65, 95, 125, 235, 265, 295, 325].map((bx, i) => (
          <g key={i}>
            <line x1={bx} y1="140" x2={bx + 15} y2="148" stroke="#475569" strokeWidth="1.5" />
            <line x1={bx + 15} y1="140" x2={bx} y2="148" stroke="#475569" strokeWidth="1.5" />
          </g>
        ))}

        {/* Suspension Support Cables & Springs */}
        <line x1="180" y1="78" x2="65" y2="140" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3 2" />
        <line x1="180" y1="78" x2="295" y2="140" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3 2" />

        {/* High-Pressure Anti-Drift Mist Spray Nozzles with Fan Cones */}
        {[40, 70, 100, 130, 230, 260, 290, 320].map((nx, i) => (
          <g key={i}>
            {/* Nozzle Body */}
            <rect x={nx - 2} y="148" width="4" height="6" fill="#eab308" />
            {/* Fine Mist Cone Spray Pattern */}
            <polygon
              points={`${nx},154 ${nx - 14},184 ${nx + 14},184`}
              fill="#2dd4bf"
              opacity="0.35"
            />
            <line x1={nx} y1="154" x2={nx - 10} y2="182" stroke="#5eead4" strokeWidth="1" strokeDasharray="2 2" opacity="0.7" />
            <line x1={nx} y1="154" x2={nx + 10} y2="182" stroke="#5eead4" strokeWidth="1" strokeDasharray="2 2" opacity="0.7" />
          </g>
        ))}
      </g>

      {/* Badge */}
      <g transform="translate(14, 16)">
        <rect width="144" height="24" rx="6" fill="#ffffff" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.06))" />
        <text x="8" y="16" fill="#0f766e" fontSize="10" fontWeight="bold" fontFamily="system-ui, sans-serif">
          12M BOOM SPRAYER (400L)
        </text>
      </g>
    </svg>
  );
}

