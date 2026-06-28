import React, { useState } from "react";
import { Building2 } from "lucide-react";

interface SchoolLogoProps {
  src?: string | null;
  name: string;
  className?: string;
  sizeClassName?: string;
}

/**
 * Extracts clean, meaningful initials from a school name.
 * It ignores common prefixes like "Lycée", "Collège", "CEG", "Cours", "CEM", etc.
 */
function getInitials(name: string): string {
  if (!name) return "SN";
  
  // Clean up common prefixes in French/Sénégal school naming
  let cleanName = name
    .replace(/^(lycée|collège|ceg|cours|groupe scolaire|ecole|école|institution|cs|cem|e\.e\.p|e\.p)\b/i, "")
    .trim();
  
  if (!cleanName) cleanName = name; // fallback if we removed everything

  const words = cleanName.split(/[\s'-]+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  if (words.length === 1 && words[0].length > 0) {
    return words[0].substring(0, Math.min(words[0].length, 2)).toUpperCase();
  }
  return "SN";
}

/**
 * Generates a stable background gradient based on the school name.
 */
function getGradient(name: string): string {
  const gradients = [
    "from-blue-600 to-indigo-600 text-white",
    "from-indigo-600 to-violet-600 text-white",
    "from-teal-600 to-emerald-600 text-white",
    "from-purple-600 to-pink-600 text-white",
    "from-sky-600 to-blue-700 text-white",
    "from-emerald-600 to-cyan-600 text-white",
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}

export default function SchoolLogo({ 
  src, 
  name, 
  className = "", 
  sizeClassName = "w-14 h-14" 
}: SchoolLogoProps) {
  const [hasError, setHasError] = useState(false);

  // Consider it "no logo" if src is empty, placeholder, or failed to load
  const isInvalidSrc = !src || src.trim() === "" || src.includes("placeholder") || src.includes("broken");

  if (isInvalidSrc || hasError) {
    const initials = getInitials(name);
    const gradient = getGradient(name);

    return (
      <div 
        className={`
          ${sizeClassName} 
          rounded-2xl 
          bg-gradient-to-br ${gradient} 
          flex flex-col items-center justify-center 
          font-black shadow-sm 
          border border-slate-100/10 shrink-0
          select-none
          relative
          overflow-hidden
          group
          ${className}
        `}
      >
        {/* Subtle decorative background icon */}
        <Building2 className="absolute -right-1 -bottom-1 h-3/5 w-3/5 opacity-15 pointer-events-none group-hover:scale-110 transition-transform duration-300" />
        
        {/* Monogram letters */}
        <span className="text-[35%] leading-none relative z-10 font-extrabold uppercase drop-shadow-sm font-sans tracking-wider">
          {initials}
        </span>
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={name} 
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={`
        ${sizeClassName} 
        rounded-2xl 
        object-cover 
        bg-white 
        border border-slate-100 
        p-0.5 
        shadow-sm 
        shrink-0
        ${className}
      `}
    />
  );
}
