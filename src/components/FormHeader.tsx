'use client';

import React from 'react';

// TRD §6.2: header_config contract
interface HeaderConfig {
  version?: string;
  layout?: string;
  banner?: {
    type?: string;
    storage_key?: string;
    background?: string;
    alt_text?: string;
    aspect_ratio?: string;
    overlay_enabled?: boolean;
    overlay_opacity?: number;
    overlay_color?: string;
  };
  logo?: {
    storage_key?: string;
    position?: string;
    width_px?: number;
    visible?: boolean;
  };
  headline?: {
    text?: string;
    font_size?: string;
    font_weight?: string;
    color?: string;
    alignment?: string;
  };
  subheadline?: {
    text?: string;
    color?: string;
    alignment?: string;
  };
  theme?: {
    primary_color?: string;
    background_color?: string;
    font_family?: string;
  };
}

interface FormHeaderProps {
  config: HeaderConfig;
  orgName?: string;
}

// TRD §6.6: Rendering di Form Publik
export const FormHeader: React.FC<FormHeaderProps> = ({ config, orgName }) => {
  const headline = config.headline?.text || 'Formulir Registrasi';
  const subheadline = config.subheadline?.text || '';
  const banner = config.banner;
  const theme = config.theme;

  // Determine background style
  const bgStyle: React.CSSProperties = {};
  if (banner?.type === 'image' && banner?.storage_key) {
    bgStyle.backgroundImage = `url(${banner.storage_key})`;
    bgStyle.backgroundSize = 'cover';
    bgStyle.backgroundPosition = 'center';
  } else if (banner?.background) {
    bgStyle.background = banner.background;
  } else {
    // Default gradient
    bgStyle.background = `linear-gradient(135deg, ${theme?.primary_color || '#6366f1'} 0%, #4f46e5 50%, #7c3aed 100%)`;
  }

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl mb-8 shadow-xl"
      style={{
        ...bgStyle,
        minHeight: '200px',
      }}
    >
      {/* Overlay for text readability */}
      {banner?.overlay_enabled && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: banner.overlay_color || '#000000',
            opacity: banner.overlay_opacity || 0.45,
          }}
        />
      )}

      {/* Decorative pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-3 p-8 md:p-12">
        {/* Logo */}
        {config.logo?.visible && config.logo?.storage_key && (
          <img
            src={config.logo.storage_key}
            alt={orgName || 'Logo'}
            className="rounded-xl shadow-lg mb-2"
            style={{ width: config.logo.width_px || 80, height: config.logo.width_px || 80 }}
          />
        )}

        {/* Organization name badge */}
        {orgName && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-white/90 tracking-wide uppercase">{orgName}</span>
          </div>
        )}

        {/* Headline */}
        <h1
          className="font-extrabold text-center drop-shadow-md leading-tight"
          style={{
            color: config.headline?.color || '#FFFFFF',
            fontSize: config.headline?.font_size === '3xl' ? '1.875rem' : config.headline?.font_size === '2xl' ? '1.5rem' : '1.5rem',
            textAlign: (config.headline?.alignment as any) || 'center',
          }}
        >
          {headline}
        </h1>

        {/* Subheadline */}
        {subheadline && (
          <p
            className="text-center max-w-lg"
            style={{
              color: config.subheadline?.color || 'rgba(255,255,255,0.85)',
              textAlign: (config.subheadline?.alignment as any) || 'center',
            }}
          >
            {subheadline}
          </p>
        )}
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/5 to-transparent" />
    </div>
  );
};
