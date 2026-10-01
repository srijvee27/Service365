// ==============================================================================
// Service365 - Bespoke Brand Identity & Vector Logos
// Clean, modern, Bangladesh-focused courier and logistics branding
// ==============================================================================

import React from "react";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  variant?: "full" | "icon" | "badge" | "mobile" | "print";
  theme?: "light" | "dark" | "auto";
  showTagline?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Service365Logo({
  variant = "full",
  theme = "auto",
  showTagline = false,
  size = "md",
  className = "",
  ...props
}: LogoProps) {
  const sizeMap = {
    sm: { height: 28, width: variant === "icon" ? 28 : 130 },
    md: { height: 38, width: variant === "icon" ? 38 : 175 },
    lg: { height: 48, width: variant === "icon" ? 48 : 220 },
    xl: { height: 60, width: variant === "icon" ? 60 : 275 },
  };

  const { height, width } = sizeMap[size];

  // If icon-only
  if (variant === "icon") {
    return (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        height={height}
        width={height}
        className={`shrink-0 ${className}`}
        {...props}
      >
        <defs>
          <linearGradient id="s365-blue-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2563EB" />
            <stop offset="1" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="s365-emerald-grad" x1="16" y1="12" x2="40" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#10B981" />
            <stop offset="1" stopColor="#059669" />
          </linearGradient>
        </defs>

        {/* Outer Rounded Container with subtle depth */}
        <rect width="48" height="48" rx="12" fill="url(#s365-blue-grad)" />

        {/* Dynamic Logistics Hexagonal Box / Compass Wing */}
        <path
          d="M24 9L38 17V31L24 39L10 31V17L24 9Z"
          stroke="white"
          strokeWidth="2.5"
          strokeLinejoin="round"
          opacity="0.9"
        />

        {/* Inner Isometric Cube Fold Lines */}
        <path d="M24 9V24L38 31" stroke="white" strokeWidth="2" strokeLinejoin="round" opacity="0.75" />
        <path d="M24 24L10 31" stroke="white" strokeWidth="2" strokeLinejoin="round" opacity="0.75" />

        {/* Swift Motion Arrow / 365 Speed Notch */}
        <path
          d="M18 20L25 24L32 18"
          stroke="url(#s365-emerald-grad)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="25" cy="24" r="2.5" fill="#10B981" />
      </svg>
    );
  }

  // If print monochrome label
  if (variant === "print") {
    return (
      <svg
        viewBox="0 0 200 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        height={height}
        width={width}
        className={className}
        {...props}
      >
        <rect width="42" height="42" rx="8" fill="#000000" />
        <path
          d="M21 8L33 15V29L21 36L9 29V15L21 8Z"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M21 8V21L33 28" stroke="#FFFFFF" strokeWidth="1.8" />
        <path d="M21 21L9 28" stroke="#FFFFFF" strokeWidth="1.8" />
        <text
          x="52"
          y="28"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="24"
          fontWeight="900"
          fill="#000000"
          letterSpacing="-0.5"
        >
          SERVICE<tspan fill="#000000">365</tspan>
        </text>
        <text
          x="53"
          y="40"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="9"
          fontWeight="700"
          fill="#333333"
          letterSpacing="1.2"
        >
          BANGLADESH EXPRESS COURIER
        </text>
      </svg>
    );
  }

  // Full Brand Logo
  return (
    <div className={`inline-flex flex-col ${className}`}>
      <svg
        viewBox="0 0 220 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        height={height}
        width={width}
        {...props}
      >
        <defs>
          <linearGradient id="s365-blue-full" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2563EB" />
            <stop offset="1" stopColor="#1E40AF" />
          </linearGradient>
          <linearGradient id="s365-emerald-full" x1="12" y1="12" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#10B981" />
            <stop offset="1" stopColor="#059669" />
          </linearGradient>
        </defs>

        {/* Icon Mark */}
        <g transform="translate(2, 2)">
          <rect width="44" height="44" rx="10" fill="url(#s365-blue-full)" />
          <path
            d="M22 8L35 15.5V30.5L22 38L9 30.5V15.5L22 8Z"
            stroke="white"
            strokeWidth="2.2"
            strokeLinejoin="round"
            opacity="0.9"
          />
          <path d="M22 8V22L35 28.5" stroke="white" strokeWidth="1.8" opacity="0.75" />
          <path d="M22 22L9 28.5" stroke="white" strokeWidth="1.8" opacity="0.75" />
          <path
            d="M16 18L22 22L28 16"
            stroke="url(#s365-emerald-full)"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="22" cy="22" r="2.2" fill="#10B981" />
        </g>

        {/* Typography */}
        <text
          x="58"
          y="31"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="24"
          fontWeight="800"
          className={theme === "dark" ? "fill-white" : "fill-slate-900"}
          letterSpacing="-0.5"
        >
          SERVICE
          <tspan fill="#2563EB">365</tspan>
        </text>

        {/* Tiny Verified Dot */}
        <circle cx="204" cy="26" r="3" fill="#10B981" />
      </svg>
      {showTagline && (
        <span className="text-[10px] tracking-wider font-semibold text-slate-500 uppercase ml-[58px] -mt-1">
          Delivering Business. Every Day.
        </span>
      )}
    </div>
  );
}

export default Service365Logo;
