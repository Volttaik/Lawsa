"use client";
import { useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";

const BADGES = [
  { effectType: "badge_crown",          name: "Golden Crown",     color: "#fbbf24", price: "₦1,000",  group: "Classic" },
  { effectType: "badge_fire",           name: "Inferno",          color: "#f97316", price: "₦1,000",  group: "Classic" },
  { effectType: "badge_lightning",      name: "Storm",            color: "#a78bfa", price: "₦1,000",  group: "Classic" },
  { effectType: "badge_star",           name: "Supernova",        color: "#facc15", price: "₦1,000",  group: "Classic" },
  { effectType: "badge_verified_plus",  name: "Verified+",        color: "#60a5fa", price: "₦1,500",  group: "Classic" },
  { effectType: "badge_crystal",        name: "Crystal",          color: "#38bdf8", price: "₦1,500",  group: "Classic" },
  { effectType: "badge_amethyst",       name: "Amethyst",         color: "#a855f7", price: "₦2,000",  group: "Heraldic" },
  { effectType: "badge_phoenix",        name: "Phoenix",          color: "#f97316", price: "₦2,000",  group: "Heraldic" },
  { effectType: "badge_dragon",         name: "Dragon",           color: "#e879f9", price: "₦2,500",  group: "Heraldic" },
  { effectType: "badge_royal",          name: "Royal",            color: "#8b5cf6", price: "₦2,500",  group: "Heraldic" },
  { effectType: "badge_warrior",        name: "Warrior",          color: "#ef4444", price: "₦2,000",  group: "Heraldic" },
  { effectType: "badge_azure",          name: "Azure",            color: "#38bdf8", price: "₦2,000",  group: "Heraldic" },
  { effectType: "badge_inferno",        name: "Inferno Flame",    color: "#fb923c", price: "₦1,500",  group: "Elemental" },
  { effectType: "badge_frost",          name: "Frost",            color: "#7dd3fc", price: "₦1,500",  group: "Elemental" },
  { effectType: "badge_storm",          name: "Thunderstorm",     color: "#a78bfa", price: "₦2,000",  group: "Elemental" },
  { effectType: "badge_tidal",          name: "Tidal",            color: "#0ea5e9", price: "₦2,000",  group: "Elemental" },
  { effectType: "badge_earth",          name: "Earth",            color: "#22c55e", price: "₦2,000",  group: "Elemental" },
  { effectType: "badge_wind",           name: "Wind",             color: "#34d399", price: "₦1,500",  group: "Elemental" },
  { effectType: "badge_galaxy",         name: "Galaxy",           color: "#818cf8", price: "₦2,500",  group: "Celestial" },
  { effectType: "badge_nova",           name: "Nova",             color: "#f472b6", price: "₦2,500",  group: "Celestial" },
  { effectType: "badge_solar",          name: "Solar",            color: "#fbbf24", price: "₦2,500",  group: "Celestial" },
  { effectType: "badge_lunar",          name: "Lunar",            color: "#e2e8f0", price: "₦2,000",  group: "Celestial" },
  { effectType: "badge_cosmic",         name: "Cosmic",           color: "#818cf8", price: "₦4,000",  group: "Celestial" },
  { effectType: "badge_void",           name: "Void",             color: "#7c3aed", price: "₦3,000",  group: "Dark" },
  { effectType: "badge_shadow",         name: "Shadow",           color: "#94a3b8", price: "₦2,500",  group: "Dark" },
  { effectType: "badge_demon",          name: "Demon",            color: "#dc2626", price: "₦3,000",  group: "Dark" },
  { effectType: "badge_skull",          name: "Skull",            color: "#e2e8f0", price: "₦2,500",  group: "Dark" },
  { effectType: "badge_obsidian",       name: "Obsidian",         color: "#7c3aed", price: "₦3,500",  group: "Dark" },
  { effectType: "badge_angel",          name: "Angel",            color: "#fbbf24", price: "₦2,500",  group: "Divine" },
  { effectType: "badge_divine",         name: "Divine",           color: "#fbbf24", price: "₦3,500",  group: "Divine" },
  { effectType: "badge_tech",           name: "Tech",             color: "#22d3ee", price: "₦2,000",  group: "Premium" },
  { effectType: "badge_neon",           name: "Neon",             color: "#22d3ee", price: "₦2,000",  group: "Premium" },
  { effectType: "badge_matrix",         name: "Matrix",           color: "#22c55e", price: "₦2,000",  group: "Premium" },
  { effectType: "badge_gold",           name: "Gold Elite",       color: "#fbbf24", price: "₦4,000",  group: "Premium" },
  { effectType: "badge_ruby",           name: "Ruby",             color: "#f87171", price: "₦3,500",  group: "Premium" },
  { effectType: "badge_crystal_herald", name: "Crystal Herald",   color: "#67e8f9", price: "₦5,000",  group: "Legendary" },
];

const SVG_MAP: Record<string, (c: string) => string> = {

  badge_crown: (c) => `<svg viewBox="0 0 64 64" width="48" height="48" fill="none" style="overflow:visible">
  <defs>
    <linearGradient id="cg1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fffde7"/><stop offset="20%" stop-color="#ffe082"/><stop offset="50%" stop-color="${c}"/><stop offset="80%" stop-color="#f9a825"/><stop offset="100%" stop-color="#6d4c00"/></linearGradient>
    <linearGradient id="cg2" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#fff9c4"/><stop offset="60%" stop-color="${c}"/><stop offset="100%" stop-color="#e65100"/></linearGradient>
    <filter id="cglw"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="cgds"><feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#b8860b" flood-opacity=".65"/></filter>
  </defs>
  <rect x="9" y="43" width="46" height="10" rx="4" fill="url(#cg1)" filter="url(#cgds)"/>
  <rect x="9" y="43" width="46" height="3" rx="2" fill="white" fill-opacity=".25"/>
  <line x1="15" y1="49" x2="49" y2="49" stroke="#fff9c4" stroke-width=".8" stroke-opacity=".4" stroke-dasharray="3,3.5"/>
  <path d="M9 45 L9 23 L21 33 L32 9 L43 33 L55 23 L55 45 Z" fill="url(#cg1)" filter="url(#cglw)"/>
  <path d="M9 45 L9 23 L21 33 L32 9 L43 33 L55 23 L55 45 Z" fill="none" stroke="#ffd54f" stroke-width="1.2" stroke-opacity=".5"/>
  <path d="M10 44 L10 25 L20 34 L31 11" stroke="white" stroke-width="1" stroke-opacity=".35" fill="none" stroke-linecap="round"/>
  <path d="M21 33 L32 33 L32 9" fill="white" fill-opacity=".08"/>
  <circle cx="32" cy="10" r="5.5" fill="#e53935" filter="url(#cglw)"/>
  <circle cx="32" cy="10" r="5.5" fill="none" stroke="#ffd54f" stroke-width="1.3"/>
  <circle cx="30" cy="8" r="1.8" fill="white" fill-opacity=".75"/>
  <circle cx="34" cy="12" r=".8" fill="white" fill-opacity=".4"/>
  <circle cx="9" cy="23" r="4" fill="#1e88e5" filter="url(#cglw)"/>
  <circle cx="9" cy="23" r="4" fill="none" stroke="#ffd54f" stroke-width="1"/>
  <circle cx="8" cy="21.5" r="1.2" fill="white" fill-opacity=".7"/>
  <circle cx="55" cy="23" r="4" fill="#43a047" filter="url(#cglw)"/>
  <circle cx="55" cy="23" r="4" fill="none" stroke="#ffd54f" stroke-width="1"/>
  <circle cx="54" cy="21.5" r="1.2" fill="white" fill-opacity=".7"/>
  <circle cx="21" cy="34" r="2.5" fill="#fff9c4" stroke="#f9a825" stroke-width=".8"/>
  <circle cx="43" cy="34" r="2.5" fill="#fff9c4" stroke="#f9a825" stroke-width=".8"/>
  <circle cx="32" cy="33" r="2.5" fill="#fff9c4" stroke="#f9a825" stroke-width=".8"/>
</svg>`,

  badge_fire: (c) => `<svg viewBox="0 0 64 64" width="48" height="48" fill="none" style="overflow:visible">
  <defs>
    <radialGradient id="fg1" cx="50%" cy="90%" r="65%"><stop offset="0%" stop-color="#fff9c4"/><stop offset="18%" stop-color="#ffee58"/><stop offset="40%" stop-color="#ffa726"/><stop offset="65%" stop-color="${c}"/><stop offset="100%" stop-color="#b71c1c" stop-opacity=".1"/></radialGradient>
    <radialGradient id="fg2" cx="50%" cy="85%" r="55%"><stop offset="0%" stop-color="white"/><stop offset="30%" stop-color="#fff9c4"/><stop offset="70%" stop-color="#ffa726"/><stop offset="100%" stop-color="${c}" stop-opacity="0"/></radialGradient>
    <filter id="fglw"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="fgbt"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <ellipse cx="32" cy="57" rx="14" ry="4" fill="${c}" fill-opacity=".35" filter="url(#fgbt)"/>
  <path d="M32 4 C29 10 18 18 16 32 C14 44 22 56 32 56 C42 56 50 44 48 32 C46 18 35 10 32 4Z" fill="url(#fg1)" filter="url(#fglw)"/>
  <path d="M32 4 C31 9 26 15 25 23 C24 29 25 33 27 36" stroke="#fff9c4" stroke-width="1.5" stroke-opacity=".3" fill="none" stroke-linecap="round"/>
  <path d="M32 18 C30 22 25 28 25 36 C25 41 28 46 32 47 C36 46 39 41 39 36 C39 28 34 22 32 18Z" fill="url(#fg2)" fill-opacity=".6"/>
  <path d="M32 26 C31 28 29 31 29 35 C29 38 30.5 41 32 41.5 C33.5 41 35 38 35 35 C35 31 33 28 32 26Z" fill="white" fill-opacity=".55"/>
  <circle cx="22" cy="18" r="2" fill="#ffa726" fill-opacity=".7" filter="url(#fglw)"/>
  <circle cx="42" cy="14" r="1.5" fill="#ffee58" fill-opacity=".8" filter="url(#fglw)"/>
  <circle cx="18" cy="30" r="1.2" fill="#ffa726" fill-opacity=".5"/>
  <circle cx="46" cy="26" r="1.5" fill="#ffee58" fill-opacity=".6"/>
  <circle cx="38" cy="10" r="1" fill="white" fill-opacity=".9"/>
</svg>`,

  badge_lightning: (c) => `<svg viewBox="0 0 64 64" width="48" height="48" fill="none" style="overflow:visible">
  <defs>
    <linearGradient id="lg1" x1="20%" y1="0%" x2="80%" y2="100%"><stop offset="0%" stop-color="#f0e6ff"/><stop offset="25%" stop-color="#c4b5fd"/><stop offset="55%" stop-color="${c}"/><stop offset="85%" stop-color="#6d28d9"/><stop offset="100%" stop-color="#2e1065"/></linearGradient>
    <linearGradient id="lg2" x1="20%" y1="0%" x2="80%" y2="100%"><stop offset="0%" stop-color="white"/><stop offset="50%" stop-color="#ddd6fe"/><stop offset="100%" stop-color="${c}"/></linearGradient>
    <filter id="lglw"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="lgbt"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <path d="M36 4 L12 36 H28 L26 60 L52 24 H36 Z" fill="${c}" fill-opacity=".25" filter="url(#lgbt)"/>
  <path d="M36 4 L12 36 H28 L26 60 L52 24 H36 Z" fill="url(#lg1)" filter="url(#lglw)"/>
  <path d="M36 4 L12 36 H28 L26 60 L52 24 H36 Z" fill="none" stroke="#c4b5fd" stroke-width="1" stroke-opacity=".6"/>
  <path d="M34 10 L20 33 H31 L29 52 L46 29 H35 Z" fill="url(#lg2)" fill-opacity=".45"/>
  <path d="M32 16 L28 24" stroke="white" stroke-width="1.2" stroke-opacity=".6" stroke-linecap="round"/>
  <path d="M36 6 L48 20" stroke="#ddd6fe" stroke-width="1" stroke-opacity=".3" stroke-linecap="round"/>
  <path d="M12 36 L6 30" stroke="${c}" stroke-width="1.5" stroke-opacity=".4" stroke-linecap="round"/>
  <path d="M52 24 L58 18" stroke="${c}" stroke-width="1.5" stroke-opacity=".4" stroke-linecap="round"/>
  <path d="M28 46 L24 54" stroke="#a78bfa" stroke-width="1.2" stroke-opacity=".35" stroke-linecap="round"/>
</svg>`,

  badge_star: (c) => `<svg viewBox="0 0 64 64" width="48" height="48" fill="none" style="overflow:visible">
  <defs>
    <linearGradient id="sg1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fffde7"/><stop offset="25%" stop-color="#ffe082"/><stop offset="55%" stop-color="${c}"/><stop offset="85%" stop-color="#f9a825"/><stop offset="100%" stop-color="#6d4c00"/></linearGradient>
    <radialGradient id="sg2" cx="45%" cy="35%" r="55%"><stop offset="0%" stop-color="#fffde7"/><stop offset="50%" stop-color="${c}"/><stop offset="100%" stop-color="#b8860b"/></radialGradient>
    <filter id="sglw"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="sgbt"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <path d="M32 5 L38 22 H57 L42 33 L48 51 L32 40 L16 51 L22 33 L7 22 H26 Z" fill="${c}" fill-opacity=".2" filter="url(#sgbt)"/>
  <path d="M32 5 L38 22 H57 L42 33 L48 51 L32 40 L16 51 L22 33 L7 22 H26 Z" fill="url(#sg1)" filter="url(#sglw)"/>
  <path d="M32 5 L38 22 H57 L42 33 L48 51 L32 40 L16 51 L22 33 L7 22 H26 Z" fill="none" stroke="#fff9c4" stroke-width="1" stroke-opacity=".5"/>
  <path d="M26 22 L32 5 L38 22 L32 29 Z" fill="white" fill-opacity=".2"/>
  <path d="M26 22 L7 22 L22 33 L26 22Z" fill="white" fill-opacity=".1"/>
  <line x1="32" y1="2" x2="32" y2="8" stroke="#fffde7" stroke-width="2" stroke-opacity=".8" stroke-linecap="round"/>
  <line x1="59" y1="20" x2="54" y2="23" stroke="#ffe082" stroke-width="2" stroke-opacity=".7" stroke-linecap="round"/>
  <line x1="5" y1="20" x2="10" y2="23" stroke="#ffe082" stroke-width="2" stroke-opacity=".7" stroke-linecap="round"/>
  <line x1="46" y1="53" x2="43" y2="49" stroke="#ffe082" stroke-width="2" stroke-opacity=".7" stroke-linecap="round"/>
  <line x1="18" y1="53" x2="21" y2="49" stroke="#ffe082" stroke-width="2" stroke-opacity=".7" stroke-linecap="round"/>
  <circle cx="32" cy="30" r="6.5" fill="url(#sg2)"/>
  <circle cx="32" cy="30" r="6.5" fill="none" stroke="#fffde7" stroke-width="1.2" stroke-opacity=".6"/>
  <path d="M29 27 L32 25 L35 27 L36 30 L35 33 L32 35 L29 33 L28 30 Z" fill="white" fill-opacity=".3"/>
  <circle cx="30" cy="28" r="2" fill="white" fill-opacity=".7"/>
</svg>`,

  badge_verified_plus: (c) => `<svg viewBox="0 0 64 64" width="48" height="48" fill="none" style="overflow:visible">
  <defs>
    <linearGradient id="vg1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#dbeafe"/><stop offset="30%" stop-color="#93c5fd"/><stop offset="60%" stop-color="${c}"/><stop offset="85%" stop-color="#2563eb"/><stop offset="100%" stop-color="#1e3a8a"/></linearGradient>
    <linearGradient id="vg2" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="white" stop-opacity=".45"/><stop offset="100%" stop-color="white" stop-opacity="0"/></linearGradient>
    <filter id="vglw"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="vgds"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#1d4ed8" flood-opacity=".6"/></filter>
  </defs>
  <circle cx="29" cy="33" r="23" fill="#1e3a8a" stroke="${c}" stroke-width="1.5" stroke-opacity=".4" filter="url(#vgds)"/>
  <circle cx="29" cy="33" r="23" fill="url(#vg1)" filter="url(#vglw)"/>
  <circle cx="29" cy="33" r="23" fill="url(#vg2)"/>
  <circle cx="29" cy="33" r="23" fill="none" stroke="white" stroke-width="1" stroke-opacity=".25"/>
  <circle cx="29" cy="33" r="19" fill="none" stroke="white" stroke-width=".6" stroke-opacity=".15"/>
  <path d="M19 33 L26 41 L41 23" stroke="white" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M19 33 L26 41 L41 23" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".5"/>
  <circle cx="51" cy="14" r="12" fill="#1e3a8a" stroke="${c}" stroke-width="2"/>
  <circle cx="51" cy="14" r="12" fill="url(#vg1)" fill-opacity=".7"/>
  <circle cx="51" cy="14" r="12" fill="none" stroke="white" stroke-width=".8" stroke-opacity=".3"/>
  <line x1="51" y1="7" x2="51" y2="21" stroke="white" stroke-width="3.5" stroke-linecap="round"/>
  <line x1="44" y1="14" x2="58" y2="14" stroke="white" stroke-width="3.5" stroke-linecap="round"/>
  <circle cx="47" cy="10" r="1.5" fill="white" fill-opacity=".4"/>
</svg>`,

  badge_crystal: (c) => `<svg viewBox="0 0 64 64" width="48" height="48" fill="none" style="overflow:visible">
  <defs>
    <linearGradient id="crg1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#e0f7fa"/><stop offset="25%" stop-color="#b2ebf2"/><stop offset="55%" stop-color="${c}"/><stop offset="80%" stop-color="#0288d1"/><stop offset="100%" stop-color="#01579b"/></linearGradient>
    <linearGradient id="crg2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="white" stop-opacity=".55"/><stop offset="100%" stop-color="white" stop-opacity=".02"/></linearGradient>
    <linearGradient id="crg3" x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="${c}" stop-opacity=".4"/><stop offset="100%" stop-color="#b2ebf2" stop-opacity=".1"/></linearGradient>
    <filter id="crglw"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <polygon points="32,4 57,18 57,46 32,60 7,46 7,18" fill="url(#crg1)" filter="url(#crglw)"/>
  <polygon points="32,4 57,18 57,46 32,60 7,46 7,18" fill="none" stroke="#b2ebf2" stroke-width="1.2" stroke-opacity=".6"/>
  <line x1="32" y1="4" x2="32" y2="60" stroke="white" stroke-width=".7" stroke-opacity=".2"/>
  <line x1="7" y1="18" x2="57" y2="46" stroke="white" stroke-width=".7" stroke-opacity=".2"/>
  <line x1="57" y1="18" x2="7" y2="46" stroke="white" stroke-width=".7" stroke-opacity=".2"/>
  <line x1="32" y1="4" x2="57" y2="46" stroke="white" stroke-width=".5" stroke-opacity=".12"/>
  <line x1="32" y1="4" x2="7" y2="46" stroke="white" stroke-width=".5" stroke-opacity=".12"/>
  <polygon points="32,4 57,18 32,32" fill="url(#crg2)"/>
  <polygon points="7,18 32,32 7,46" fill="url(#crg3)"/>
  <polygon points="32,32 57,46 32,60 7,46" fill="white" fill-opacity=".07"/>
  <circle cx="32" cy="32" r="6" fill="white" fill-opacity=".18"/>
  <circle cx="32" cy="32" r="3.5" fill="white" fill-opacity=".6"/>
  <path d="M28 7 L32 4 L36 7 L32 10 Z" fill="white" fill-opacity=".8"/>
  <circle cx="32" cy="4" r="2.5" fill="white" fill-opacity=".95"/>
  <circle cx="15" cy="20" r="1.5" fill="white" fill-opacity=".5"/>
  <circle cx="52" cy="44" r="1.5" fill="white" fill-opacity=".4"/>
</svg>`,

  badge_amethyst: (c) => `<svg viewBox="0 0 64 64" width="48" height="48" fill="none" style="overflow:visible">
  <defs>
    <linearGradient id="amg1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fef9c3"/><stop offset="30%" stop-color="#fcd34d"/><stop offset="65%" stop-color="#d97706"/><stop offset="100%" stop-color="#78350f"/></linearGradient>
    <linearGradient id="amg2" x1="15%" y1="0%" x2="85%" y2="100%"><stop offset="0%" stop-color="#f3e8ff"/><stop offset="30%" stop-color="#d8b4fe"/><stop offset="60%" stop-color="${c}"/><stop offset="100%" stop-color="#4c1d95"/></linearGradient>
    <filter id="amglw"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <path d="M18 31 C11 26 4 20 3 12 C7 18 11 26 13 31 Z" fill="url(#amg1)" opacity=".9"/>
  <path d="M46 31 C53 26 60 20 61 12 C57 18 53 26 51 31 Z" fill="url(#amg1)" opacity=".9"/>
  <path d="M32 4 L46 11 L51 28 L44 44 L32 52 L20 44 L13 28 L18 11 Z" fill="url(#amg1)" filter="url(#amglw)"/>
  <path d="M32 7 L43 13 L47 28 L42 42 L32 49 L22 42 L17 28 L21 13 Z" fill="#1e0630"/>
  <path d="M26 10 L28 5 L30 9 L32 4 L34 9 L36 5 L38 10" stroke="url(#amg1)" stroke-width="2.5" stroke-linecap="round" fill="none"/>
  <path d="M22 13 L26 10 L21 13 Z" fill="url(#amg1)" fill-opacity=".7"/>
  <path d="M42 13 L38 10 L43 13 Z" fill="url(#amg1)" fill-opacity=".7"/>
  <polygon points="32,14 44,30 32,48 20,30" fill="url(#amg2)" filter="url(#amglw)"/>
  <polygon points="32,14 44,30 32,30" fill="white" fill-opacity=".22"/>
  <polygon points="20,30 32,48 32,30" fill="white" fill-opacity=".07"/>
  <line x1="32" y1="14" x2="32" y2="48" stroke="white" stroke-width=".8" stroke-opacity=".25"/>
  <line x1="20" y1="30" x2="44" y2="30" stroke="white" stroke-width=".8" stroke-opacity=".2"/>
  <circle cx="32" cy="22" r="4.5" fill="white" fill-opacity=".85"/>
  <circle cx="30" cy="20" r="1.5" fill="white"/>
  <circle cx="32" cy="14" r="2.5" fill="#f3e8ff"/>
  <circle cx="32" cy="48" r="2.5" fill="#d8b4fe"/>
  <circle cx="20" cy="30" r="2" fill="#e9d5ff"/>
  <circle cx="44" cy="30" r="2" fill="#e9d5ff"/>
</svg>`,

  badge_phoenix: (c) => `<svg viewBox="0 0 64 64" width="48" height="48" fill="none" style="overflow:visible">
  <defs>
    <linearGradient id="phg1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fef9c3"/><stop offset="25%" stop-color="#fcd34d"/><stop offset="55%" stop-color="#d97706"/><stop offset="100%" stop-color="#78350f"/></linearGradient>
    <linearGradient id="phg2" x1="15%" y1="0%" x2="85%" y2="100%"><stop offset="0%" stop-color="#fed7aa"/><stop offset="40%" stop-color="${c}"/><stop offset="100%" stop-color="#c2410c"/></linearGradient>
    <filter id="phglw"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <path d="M14 30 C9 18 3 10 1 3 C5 12 9 23 12 30 Z" fill="url(#phg1)" opacity=".85"/>
  <path d="M50 30 C55 18 61 10 63 3 C59 12 55 23 52 30 Z" fill="url(#phg1)" opacity=".85"/>
  <path d="M22 8 C17 3 10 1 7 0 C11 3 16 8 19 12 Z" fill="${c}" opacity=".7"/>
  <path d="M42 8 C47 3 54 1 57 0 C53 3 48 8 45 12 Z" fill="${c}" opacity=".7"/>
  <path d="M32 4 L48 11 L53 32 L44 50 L32 56 L20 50 L11 32 L16 11 Z" fill="url(#phg1)" filter="url(#phglw)"/>
  <path d="M32 8 L44 14 L48 32 L41 48 L32 53 L23 48 L16 32 L20 14 Z" fill="#1c0500"/>
  <path d="M20 14 L16 11 L11 32 L16 11 Z" fill="url(#phg1)" fill-opacity=".6"/>
  <path d="M44 14 L48 11 L53 32 L48 11 Z" fill="url(#phg1)" fill-opacity=".6"/>
  <polygon points="32,15 46,32 32,51 18,32" fill="url(#phg2)"/>
  <polygon points="32,15 46,32 32,32" fill="white" fill-opacity=".22"/>
  <line x1="32" y1="15" x2="32" y2="51" stroke="#fef9c3" stroke-width=".8" stroke-opacity=".3"/>
  <line x1="18" y1="32" x2="46" y2="32" stroke="#fef9c3" stroke-width=".8" stroke-opacity=".2"/>
  <circle cx="32" cy="23" r="5" fill="white" fill-opacity=".88"/>
  <circle cx="30" cy="21" r="1.8" fill="white"/>
  <circle cx="32" cy="15" r="2.5" fill="#fed7aa"/>
  <circle cx="46" cy="32" r="2" fill="#fcd34d"/>
  <circle cx="18" cy="32" r="2" fill="#fcd34d"/>
</svg>`,

  badge_dragon: (c) => `<svg viewBox="0 0 64 64" width="48" height="48" fill="none" style="overflow:visible">
  <defs>
    <radialGradient id="drg1" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="#fae8ff"/><stop offset="35%" stop-color="#e879f9"/><stop offset="65%" stop-color="${c}"/><stop offset="100%" stop-color="#3b0764"/></radialGradient>
    <linearGradient id="drg2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fef9c3"/><stop offset="40%" stop-color="#fcd34d"/><stop offset="80%" stop-color="#b45309"/><stop offset="100%" stop-color="#78350f"/></linearGradient>
    <filter id="drglw"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <path d="M17 17 C13 6 7 1 4 1 C7 6 12 12 15 18 Z" fill="url(#drg2)"/>
  <path d="M47 17 C51 6 57 1 60 1 C57 6 52 12 49 18 Z" fill="url(#drg2)"/>
  <path d="M32 5 C42 5 57 15 57 33 C57 46 46 59 32 59 C18 59 7 46 7 33 C7 15 22 5 32 5 Z" fill="url(#drg2)" filter="url(#drglw)"/>
  <path d="M32 5 C42 5 57 15 57 33 C57 46 46 59 32 59 C18 59 7 46 7 33 C7 15 22 5 32 5 Z" fill="none" stroke="#fcd34d" stroke-width="1" stroke-opacity=".5"/>
  <ellipse cx="32" cy="33" rx="21" ry="23" fill="#f8fafc"/>
  <ellipse cx="32" cy="33" rx="21" ry="23" fill="none" stroke="#e5e7eb" stroke-width=".8"/>
  <path d="M11 28 C11 22 13 18 16 16 C13 20 12 25 12 30 Z" fill="#e5e7eb" fill-opacity=".5"/>
  <path d="M53 28 C53 22 51 18 48 16 C51 20 52 25 52 30 Z" fill="#e5e7eb" fill-opacity=".5"/>
  <ellipse cx="23" cy="29" rx="7" ry="5.5" fill="url(#drg1)"/>
  <ellipse cx="41" cy="29" rx="7" ry="5.5" fill="url(#drg1)"/>
  <ellipse cx="23" cy="29" rx="7" ry="5.5" fill="none" stroke="#d946ef" stroke-width=".8" stroke-opacity=".5"/>
  <ellipse cx="41" cy="29" rx="7" ry="5.5" fill="none" stroke="#d946ef" stroke-width=".8" stroke-opacity=".5"/>
  <ellipse cx="23" cy="29" rx="2.5" ry="4" fill="#0f0520"/>
  <ellipse cx="41" cy="29" rx="2.5" ry="4" fill="#0f0520"/>
  <circle cx="22" cy="27" r="1.3" fill="white" fill-opacity=".8"/>
  <circle cx="40" cy="27" r="1.3" fill="white" fill-opacity=".8"/>
  <path d="M23 35 C25 37 28 38 32 38 C36 38 39 37 41 35" stroke="#e5e7eb" stroke-width="1.2" fill="none" stroke-linecap="round"/>
  <path d="M26 40 L28 45 M32 41 L32 46 M38 40 L36 45" stroke="#d1d5db" stroke-width="1" stroke-linecap="round"/>
</svg>`,

  badge_royal: (c) => `<svg viewBox="0 0 64 64" width="48" height="48" fill="none" style="overflow:visible">
  <defs>
    <linearGradient id="rog1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fef9c3"/><stop offset="25%" stop-color="#fcd34d"/><stop offset="55%" stop-color="#d97706"/><stop offset="100%" stop-color="#78350f"/></linearGradient>
    <linearGradient id="rog2" x1="15%" y1="0%" x2="85%" y2="100%"><stop offset="0%" stop-color="#ede9fe"/><stop offset="30%" stop-color="#c4b5fd"/><stop offset="60%" stop-color="${c}"/><stop offset="100%" stop-color="#3b0764"/></linearGradient>
    <filter id="roglw"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <path d="M12 27 C7 19 2 11 0 5 C3 14 7 25 10 31 Z" fill="url(#rog2)" opacity=".8"/>
  <path d="M52 27 C57 19 62 11 64 5 C61 14 57 25 54 31 Z" fill="url(#rog2)" opacity=".8"/>
  <path d="M32 4 L48 11 L53 32 L44 50 L32 56 L20 50 L11 32 L16 11 Z" fill="url(#rog1)" filter="url(#roglw)"/>
  <path d="M32 7 L44 13 L48 32 L41 47 L32 53 L23 47 L16 32 L20 13 Z" fill="#1e0a4e"/>
  <path d="M20 13 L25 5 L29 11 L32 4 L35 11 L39 5 L44 13" stroke="url(#rog1)" stroke-width="2" fill="url(#rog1)" stroke-linejoin="round"/>
  <polygon points="32,17 46,32 42,50 22,50 18,32" fill="url(#rog2)"/>
  <polygon points="32,17 46,32 32,32" fill="white" fill-opacity=".18"/>
  <path d="M32 17 L30 22 L32 27 L34 22 Z" fill="white" fill-opacity=".6"/>
  <path d="M28 28 L32 23 L36 28 L32 33 Z" fill="white" fill-opacity=".35"/>
  <path d="M32 33 L29 38 M32 33 L35 38" stroke="#ede9fe" stroke-width="1.5" stroke-linecap="round"/>
  <circle cx="32" cy="28" r="5" fill="white" fill-opacity=".88"/>
  <circle cx="30" cy="26" r="1.8" fill="white"/>
  <circle cx="32" cy="17" r="2.5" fill="#c4b5fd"/>
  <circle cx="46" cy="32" r="2" fill="#fcd34d"/>
  <circle cx="18" cy="32" r="2" fill="#fcd34d"/>
  <circle cx="42" cy="50" r="2" fill="#a78bfa"/>
  <circle cx="22" cy="50" r="2" fill="#a78bfa"/>
</svg>`,

  badge_warrior: (c) => `<svg viewBox="0 0 64 64" width="48" height="48" fill="none" style="overflow:visible">
  <defs>
    <linearGradient id="wag1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fef9c3"/><stop offset="25%" stop-color="#fcd34d"/><stop offset="55%" stop-color="#d97706"/><stop offset="100%" stop-color="#78350f"/></linearGradient>
    <radialGradient id="wag2" cx="40%" cy="35%" r="65%"><stop offset="0%" stop-color="#fca5a5"/><stop offset="40%" stop-color="${c}"/><stop offset="100%" stop-color="#7f1d1d"/></radialGradient>
    <filter id="waglw"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <path d="M32 2 L50 10 L55 32 L45 53 L32 58 L19 53 L9 32 L14 10 Z" fill="url(#wag1)" filter="url(#waglw)"/>
  <path d="M32 5 L46 12 L50 32 L43 50 L32 55 L21 50 L14 32 L18 12 Z" fill="#f8fafc"/>
  <path d="M32 5 L46 12 L50 32 L43 50 L32 55 L21 50 L14 32 L18 12 Z" fill="none" stroke="#e5e7eb" stroke-width=".8"/>
  <path d="M32 8 L44 14 L47 32 L42 47 L32 52 L22 47 L17 32 L20 14 Z" fill="#1a0000"/>
  <path d="M18 12 L22 2 L27 9 L32 2 L37 9 L42 2 L46 12" fill="url(#wag1)" stroke="url(#wag1)" stroke-width=".8" stroke-linejoin="round"/>
  <line x1="32" y1="15" x2="32" y2="50" stroke="#c4b5fd" stroke-width="4" stroke-linecap="round" opacity=".5"/>
  <path d="M18 18 L46 46" stroke="#c4b5fd" stroke-width="4" stroke-linecap="round" opacity=".4"/>
  <path d="M46 18 L18 46" stroke="#c4b5fd" stroke-width="4" stroke-linecap="round" opacity=".4"/>
  <path d="M20 17 L44 47" stroke="#d1d5db" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>
  <path d="M44 17 L20 47" stroke="#d1d5db" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>
  <line x1="32" y1="14" x2="32" y2="51" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" opacity=".7"/>
  <circle cx="32" cy="32" r="6.5" fill="url(#wag2)"/>
  <circle cx="32" cy="32" r="6.5" fill="none" stroke="#fcd34d" stroke-width="1.2"/>
  <circle cx="30" cy="30" r="2.2" fill="white" fill-opacity=".75"/>
  <circle cx="14" cy="20" r="2.5" fill="url(#wag1)"/>
  <circle cx="50" cy="20" r="2.5" fill="url(#wag1)"/>
  <circle cx="14" cy="44" r="2.5" fill="url(#wag1)"/>
  <circle cx="50" cy="44" r="2.5" fill="url(#wag1)"/>
  <path d="M17 29 L15 35 M49 29 L47 35" stroke="#fcd34d" stroke-width=".8" stroke-linecap="round" opacity=".5"/>
</svg>`,

  badge_azure: (c) => `<svg viewBox="0 0 64 64" width="48" height="48" fill="none" style="overflow:visible">
  <defs>
    <linearGradient id="azg1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fef9c3"/><stop offset="25%" stop-color="#fcd34d"/><stop offset="55%" stop-color="#d97706"/><stop offset="100%" stop-color="#78350f"/></linearGradient>
    <linearGradient id="azg2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#e0f2fe"/><stop offset="30%" stop-color="#7dd3fc"/><stop offset="60%" stop-color="${c}"/><stop offset="100%" stop-color="#0369a1"/></linearGradient>
    <filter id="azglw"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <path d="M12 25 C7 17 2 9 0 3 C3 12 7 23 10 29 Z" fill="url(#azg2)" opacity=".8"/>
  <path d="M52 25 C57 17 62 9 64 3 C61 12 57 23 54 29 Z" fill="url(#azg2)" opacity=".8"/>
  <path d="M32 4 L48 11 L53 32 L44 50 L32 56 L20 50 L11 32 L16 11 Z" fill="url(#azg1)" filter="url(#azglw)"/>
  <path d="M32 7 L44 13 L48 32 L41 47 L32 53 L23 47 L16 32 L20 13 Z" fill="#041c30"/>
  <path d="M20 13 L25 5 L29 11 L32 4 L35 11 L39 5 L44 13" stroke="url(#azg1)" stroke-width="2" fill="url(#azg1)" stroke-linejoin="round"/>
  <polygon points="32,17 46,32 42,50 22,50 18,32" fill="url(#azg2)"/>
  <polygon points="32,17 46,32 32,32" fill="white" fill-opacity=".18"/>
  <path d="M18 36 C21 32 24 38 27 34 C30 30 33 36 36 32 C39 28 43 34 46 30" stroke="#bae6fd" stroke-width="3" fill="none" stroke-linecap="round" opacity=".9"/>
  <path d="M19 43 C22 39 25 45 28 41 C31 37 34 43 37 39 C40 35 43 41 45 37" stroke="#7dd3fc" stroke-width="2" fill="none" stroke-linecap="round" opacity=".6"/>
  <path d="M28 19 L32 14 L36 19 L34 24 H30 Z" fill="#bae6fd" fill-opacity=".8"/>
  <circle cx="32" cy="26" r="4" fill="white" fill-opacity=".9"/>
  <circle cx="30" cy="24" r="1.4" fill="white"/>
  <circle cx="32" cy="17" r="2" fill="#7dd3fc"/>
</svg>`,

  badge_inferno: (c) => `<svg viewBox="0 0 64 64" width="48" height="48" fill="none" style="overflow:visible">
  <defs>
    <radialGradient id="infg1" cx="50%" cy="88%" r="70%"><stop offset="0%" stop-color="#fffde7"/><stop offset="15%" stop-color="#ffee58"/><stop offset="35%" stop-color="#ffa726"/><stop offset="60%" stop-color="${c}"/><stop offset="100%" stop-color="#b71c1c" stop-opacity=".1"/></radialGradient>
    <radialGradient id="infg2" cx="50%" cy="82%" r="55%"><stop offset="0%" stop-color="white"/><stop offset="25%" stop-color="#fff9c4"/><stop offset="55%" stop-color="#ffca28"/><stop offset="100%" stop-color="#ffa726" stop-opacity="0"/></radialGradient>
    <radialGradient id="infg3" cx="50%" cy="78%" r="40%"><stop offset="0%" stop-color="white"/><stop offset="100%" stop-color="#fff9c4" stop-opacity="0"/></radialGradient>
    <filter id="infglw"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="infbt"><feGaussianBlur stdDeviation="5"/></filter>
  </defs>
  <ellipse cx="32" cy="59" rx="16" ry="5" fill="${c}" fill-opacity=".3" filter="url(#infbt)"/>
  <path d="M32 3 C29 9 17 19 15 35 C13 47 22 58 32 58 C42 58 51 47 49 35 C47 19 35 9 32 3Z" fill="url(#infg1)" filter="url(#infglw)"/>
  <path d="M32 3 C31 8 27 14 26 22 C25 28 26 32 28 35" stroke="#fff9c4" stroke-width="1.5" fill="none" stroke-opacity=".3" stroke-linecap="round"/>
  <path d="M32 16 C29 21 24 28 23 36 C23 43 27 49 32 50 C37 49 41 43 41 36 C41 28 35 21 32 16Z" fill="url(#infg2)" fill-opacity=".65"/>
  <path d="M32 26 C30.5 29 28 33 28 37 C28 40.5 30 44 32 44.5 C34 44 36 40.5 36 37 C36 33 33.5 29 32 26Z" fill="url(#infg3)" fill-opacity=".7"/>
  <circle cx="20" cy="17" r="2.2" fill="#ffa726" fill-opacity=".75" filter="url(#infglw)"/>
  <circle cx="44" cy="13" r="1.8" fill="#ffee58" fill-opacity=".8" filter="url(#infglw)"/>
  <circle cx="16" cy="29" r="1.3" fill="#ffa726" fill-opacity=".5"/>
  <circle cx="48" cy="23" r="1.8" fill="#ffee58" fill-opacity=".65"/>
  <circle cx="25" cy="8" r="1" fill="white" fill-opacity=".8"/>
  <circle cx="40" cy="7" r=".8" fill="white" fill-opacity=".7"/>
  <path d="M32 5 L33 9 L32 7 L31 9 Z" fill="white" fill-opacity=".9"/>
</svg>`,

  badge_frost: (c) => `<svg viewBox="0 0 64 64" width="48" height="48" fill="none" style="overflow:visible">
  <defs>
    <linearGradient id="frg1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f0f9ff"/><stop offset="30%" stop-color="#bae6fd"/><stop offset="60%" stop-color="${c}"/><stop offset="100%" stop-color="#0369a1"/></linearGradient>
    <filter id="frglw"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <line x1="32" y1="2" x2="32" y2="62" stroke="url(#frg1)" stroke-width="5.5" stroke-linecap="round" filter="url(#frglw)"/>
  <line x1="2" y1="32" x2="62" y2="32" stroke="url(#frg1)" stroke-width="5.5" stroke-linecap="round" filter="url(#frglw)"/>
  <line x1="8" y1="8" x2="56" y2="56" stroke="url(#frg1)" stroke-width="5.5" stroke-linecap="round" filter="url(#frglw)"/>
  <line x1="56" y1="8" x2="8" y2="56" stroke="url(#frg1)" stroke-width="5.5" stroke-linecap="round" filter="url(#frglw)"/>
  <line x1="32" y1="2" x2="32" y2="62" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-opacity=".5"/>
  <line x1="2" y1="32" x2="62" y2="32" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-opacity=".5"/>
  <line x1="8" y1="8" x2="56" y2="56" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-opacity=".5"/>
  <line x1="56" y1="8" x2="8" y2="56" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-opacity=".5"/>
  <line x1="32" y1="2" x2="26" y2="11" stroke="url(#frg1)" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="32" y1="2" x2="38" y2="11" stroke="url(#frg1)" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="32" y1="62" x2="26" y2="53" stroke="url(#frg1)" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="32" y1="62" x2="38" y2="53" stroke="url(#frg1)" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="2" y1="32" x2="11" y2="26" stroke="url(#frg1)" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="2" y1="32" x2="11" y2="38" stroke="url(#frg1)" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="62" y1="32" x2="53" y2="26" stroke="url(#frg1)" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="62" y1="32" x2="53" y2="38" stroke="url(#frg1)" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="8" y1="8" x2="13" y2="18" stroke="url(#frg1)" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="8" y1="8" x2="18" y2="13" stroke="url(#frg1)" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="56" y1="8" x2="51" y2="18" stroke="url(#frg1)" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="56" y1="8" x2="46" y2="13" stroke="url(#frg1)" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="32" cy="32" r="8" fill="#e0f2fe" stroke="url(#frg1)" stroke-width="2"/>
  <circle cx="32" cy="32" r="8" fill="white" fill-opacity=".3"/>
  <circle cx="32" cy="32" r="3" fill="white" fill-opacity=".95"/>
  <circle cx="32" cy="2" r="3.5" fill="${c}" stroke="white" stroke-width=".8"/>
  <circle cx="32" cy="62" r="3.5" fill="${c}" stroke="white" stroke-width=".8"/>
  <circle cx="2" cy="32" r="3.5" fill="${c}" stroke="white" stroke-width=".8"/>
  <circle cx="62" cy="32" r="3.5" fill="${c}" stroke="white" stroke-width=".8"/>
</svg>`,

  badge_storm: (c) => `<svg viewBox="0 0 64 64" width="48" height="48" fill="none" style="overflow:visible">
  <defs>
    <linearGradient id="stg1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fef9c3"/><stop offset="25%" stop-color="#fcd34d"/><stop offset="55%" stop-color="#d97706"/><stop offset="100%" stop-color="#78350f"/></linearGradient>
    <linearGradient id="stg2" x1="15%" y1="0%" x2="85%" y2="100%"><stop offset="0%" stop-color="#ede9fe"/><stop offset="40%" stop-color="${c}"/><stop offset="100%" stop-color="#4c1d95"/></linearGradient>
    <filter id="stglw"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="stgbt"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <path d="M32 4 L48 11 L53 32 L44 50 L32 56 L20 50 L11 32 L16 11 Z" fill="url(#stg1)" filter="url(#stglw)"/>
  <path d="M32 7 L44 13 L48 32 L41 47 L32 53 L23 47 L16 32 L20 13 Z" fill="#0f0f23"/>
  <path d="M20 13 L25 5 L29 11 L32 4 L35 11 L39 5 L44 13" stroke="url(#stg1)" stroke-width="2" fill="url(#stg1)" stroke-linejoin="round"/>
  <path d="M18 20 C22 16 27 15 32 15 C37 15 42 16 46 20 C48 23 47 27 44 27 H20 C17 27 16 23 18 20 Z" fill="#334155" stroke="#475569" stroke-width=".8"/>
  <path d="M20 20 C22 17 27 16 32 16 C37 16 42 17 44 20" fill="#94a3b8" fill-opacity=".3"/>
  <path d="M37 14 L24 34 H31 L29 48 L46 30 H39 Z" fill="url(#stg2)" filter="url(#stgbt)"/>
  <path d="M36 15 L25 33 H32 L30 46 L45 31 H38 Z" fill="white" fill-opacity=".3"/>
  <line x1="23" y1="30" x2="20" y2="36" stroke="#c4b5fd" stroke-width="1.5" stroke-linecap="round" opacity=".6"/>
  <line x1="26" y1="28" x2="22" y2="38" stroke="#c4b5fd" stroke-width="1.2" stroke-linecap="round" opacity=".4"/>
  <line x1="22" y1="38" x2="19" y2="44" stroke="#a5b4fc" stroke-width="1" stroke-linecap="round" opacity=".4"/>
  <line x1="40" y1="34" x2="38" y2="41" stroke="#c4b5fd" stroke-width="1" stroke-linecap="round" opacity=".5"/>
</svg>`,

  badge_tidal: (c) => `<svg viewBox="0 0 64 64" width="48" height="48" fill="none" style="overflow:visible">
  <defs>
    <linearGradient id="tdg1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fef9c3"/><stop offset="25%" stop-color="#fcd34d"/><stop offset="55%" stop-color="#d97706"/><stop offset="100%" stop-color="#78350f"/></linearGradient>
    <linearGradient id="tdg2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#e0f2fe"/><stop offset="30%" stop-color="#7dd3fc"/><stop offset="60%" stop-color="${c}"/><stop offset="100%" stop-color="#0369a1"/></linearGradient>
    <filter id="tdglw"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <path d="M32 4 L48 11 L53 32 L44 50 L32 56 L20 50 L11 32 L16 11 Z" fill="url(#tdg1)" filter="url(#tdglw)"/>
  <path d="M32 7 L44 13 L48 32 L41 47 L32 53 L23 47 L16 32 L20 13 Z" fill="#041c30"/>
  <path d="M20 13 L25 5 L29 11 L32 4 L35 11 L39 5 L44 13" stroke="url(#tdg1)" stroke-width="2" fill="url(#tdg1)" stroke-linejoin="round"/>
  <rect x="17" y="16" width="30" height="34" rx="3" fill="url(#tdg2)" fill-opacity=".15"/>
  <path d="M17 24 C21 19 25 26 29 21 C33 16 37 23 41 18 C44 14 47 20 47 20 L47 17 C44 13 41 17 38 15 C35 13 32 18 29 15 C26 12 22 17 19 14 L17 16 Z" fill="url(#tdg2)" fill-opacity=".4"/>
  <path d="M17 29 C21 25 25 31 29 27 C33 23 37 29 41 25 C44 21 47 27 47 27" stroke="#7dd3fc" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M17 29 C21 25 25 31 29 27 C33 23 37 29 41 25 C44 21 47 27 47 27" stroke="white" stroke-width="1" fill="none" stroke-linecap="round" stroke-opacity=".5"/>
  <path d="M17 37 C21 33 25 39 29 35 C33 31 37 37 41 33 C44 29 47 35 47 35" stroke="#38bdf8" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <path d="M17 37 C21 33 25 39 29 35 C33 31 37 37 41 33 C44 29 47 35 47 35" stroke="white" stroke-width=".8" fill="none" stroke-linecap="round" stroke-opacity=".4"/>
  <path d="M17 45 C21 41 25 47 29 43 C33 39 37 45 41 41 C44 37 47 43 47 43" stroke="#0ea5e9" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/>
  <circle cx="32" cy="21" r="3.5" fill="white" fill-opacity=".85"/>
</svg>`,

  badge_earth: (c) => `<svg viewBox="0 0 64 64" width="48" height="48" fill="none" style="overflow:visible">
  <defs>
    <linearGradient id="eag1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fef9c3"/><stop offset="25%" stop-color="#fcd34d"/><stop offset="55%" stop-color="#d97706"/><stop offset="100%" stop-color="#78350f"/></linearGradient>
    <linearGradient id="eag2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#dcfce7"/><stop offset="30%" stop-color="#86efac"/><stop offset="60%" stop-color="${c}"/><stop offset="100%" stop-color="#14532d"/></linearGradient>
    <linearGradient id="eag3" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#92400e"/><stop offset="40%" stop-color="#a16207"/><stop offset="100%" stop-color="#ca8a04"/></linearGradient>
    <filter id="eaglw"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <path d="M32 4 L48 11 L53 32 L44 50 L32 56 L20 50 L11 32 L16 11 Z" fill="url(#eag1)" filter="url(#eaglw)"/>
  <path d="M32 7 L44 13 L48 32 L41 47 L32 53 L23 47 L16 32 L20 13 Z" fill="#1a1100"/>
  <path d="M20 13 L25 5 L29 11 L32 4 L35 11 L39 5 L44 13" stroke="url(#eag1)" stroke-width="2" fill="url(#eag1)" stroke-linejoin="round"/>
  <rect x="17" y="32" width="30" height="18" rx="2" fill="url(#eag3)" fill-opacity=".8"/>
  <path d="M17 32 L47 32 L44 47 L20 47 Z" fill="url(#eag3)"/>
  <rect x="17" y="16" width="30" height="18" fill="url(#eag2)" fill-opacity=".9"/>
  <path d="M20 26 L24 20 L28 24 L32 17 L36 24 L40 20 L44 26 L44 30 L20 30 Z" fill="url(#eag2)"/>
  <path d="M24 20 L28 24 L32 17 L36 24 L40 20" stroke="#a7f3d0" stroke-width="1" fill="none" stroke-opacity=".6"/>
  <path d="M32 30 L32 18" stroke="#166534" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M32 24 C29 22 26 24 25 27" stroke="#22c55e" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M32 21 C35 19 38 21 39 24" stroke="#22c55e" stroke-width="2" fill="none" stroke-linecap="round"/>
  <circle cx="32" cy="31" r="3.5" fill="white" fill-opacity=".8"/>
  <circle cx="22" cy="39" r="2" fill="#a16207" fill-opacity=".6"/>
  <circle cx="36" cy="42" r="1.5" fill="#92400e" fill-opacity=".5"/>
</svg>`,

  badge_wind: (c) => `<svg viewBox="0 0 64 64" width="48" height="48" fill="none" style="overflow:visible">
  <defs>
    <linearGradient id="wig1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#d1fae5"/><stop offset="35%" stop-color="#6ee7b7"/><stop offset="65%" stop-color="${c}"/><stop offset="100%" stop-color="#047857"/></linearGradient>
    <filter id="wiglw"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <path d="M8 22 C14 8 32 6 38 14 C44 22 38 30 28 28" stroke="url(#wig1)" stroke-width="7" fill="none" stroke-linecap="round" filter="url(#wiglw)"/>
  <path d="M8 22 C14 8 32 6 38 14 C44 22 38 30 28 28" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-opacity=".4"/>
  <path d="M12 35 C18 21 38 20 44 28 C50 36 44 44 32 42" stroke="url(#wig1)" stroke-width="6" fill="none" stroke-linecap="round" filter="url(#wiglw)"/>
  <path d="M12 35 C18 21 38 20 44 28 C50 36 44 44 32 42" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-opacity=".35"/>
  <path d="M16 48 C22 38 36 37 40 43 C44 49 40 55 32 55" stroke="url(#wig1)" stroke-width="4.5" fill="none" stroke-linecap="round" filter="url(#wiglw)"/>
  <path d="M16 48 C22 38 36 37 40 43 C44 49 40 55 32 55" stroke="white" stroke-width="1.2" fill="none" stroke-linecap="round" stroke-opacity=".3"/>
  <ellipse cx="52" cy="16" rx="3" ry="2" fill="${c}" transform="rotate(-30 52 16)" fill-opacity=".8"/>
  <ellipse cx="57" cy="24" rx="2" ry="1.5" fill="${c}" transform="rotate(-20 57 24)" fill-opacity=".6"/>
  <ellipse cx="10" cy="44" rx="2.5" ry="1.5" fill="${c}" transform="rotate(15 10 44)" fill-opacity=".6"/>
  <circle cx="8" cy="22" r="3.5" fill="${c}" stroke="white" stroke-width=".8"/>
  <circle cx="12" cy="35" r="3" fill="${c}" stroke="white" stroke-width=".8"/>
  <circle cx="16" cy="48" r="2.5" fill="${c}" stroke="white" stroke-width=".8"/>
</svg>`,

  badge_galaxy: (c) => `<svg viewBox="0 0 64 64" width="48" height="48" fill="none" style="overflow:visible">
  <defs>
    <radialGradient id="gag1" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#e0e7ff"/><stop offset="30%" stop-color="#a5b4fc"/><stop offset="60%" stop-color="${c}"/><stop offset="85%" stop-color="#3730a3"/><stop offset="100%" stop-color="#1e1b4b"/></radialGradient>
    <radialGradient id="gag2" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="white"/><stop offset="40%" stop-color="#c7d2fe"/><stop offset="100%" stop-color="${c}" stop-opacity="0"/></radialGradient>
    <filter id="gaglw"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <circle cx="32" cy="32" r="29" fill="#04040f"/>
  <circle cx="32" cy="32" r="29" fill="none" stroke="#3730a3" stroke-width="1.5"/>
  <ellipse cx="32" cy="32" rx="26" ry="10" fill="none" stroke="url(#gag1)" stroke-width="3.5" opacity=".65" filter="url(#gaglw)"/>
  <ellipse cx="32" cy="32" rx="19" ry="7" fill="none" stroke="#c7d2fe" stroke-width="2" opacity=".35"/>
  <ellipse cx="32" cy="32" rx="12" ry="4" fill="none" stroke="#e0e7ff" stroke-width="1.5" opacity=".25"/>
  <circle cx="32" cy="32" r="9" fill="url(#gag1)" filter="url(#gaglw)"/>
  <circle cx="32" cy="32" r="9" fill="url(#gag2)" fill-opacity=".4"/>
  <circle cx="32" cy="32" r="4" fill="white" fill-opacity=".92"/>
  <circle cx="32" cy="32" r="2" fill="white"/>
  <circle cx="12" cy="16" r="1.8" fill="white" fill-opacity=".85"/>
  <circle cx="50" cy="20" r="1.4" fill="white" fill-opacity=".7"/>
  <circle cx="54" cy="40" r="1.6" fill="white" fill-opacity=".75"/>
  <circle cx="16" cy="48" r="1.2" fill="white" fill-opacity=".6"/>
  <circle cx="8" cy="32" r="1" fill="white" fill-opacity=".5"/>
  <circle cx="58" cy="28" r=".9" fill="white" fill-opacity=".6"/>
  <circle cx="20" cy="54" r="1" fill="#a5b4fc" fill-opacity=".7"/>
  <circle cx="44" cy="10" r="1.2" fill="#c7d2fe" fill-opacity=".8"/>
  <circle cx="48" cy="52" r=".8" fill="white" fill-opacity=".5"/>
  <circle cx="10" cy="24" r=".7" fill="white" fill-opacity=".6"/>
  <circle cx="24" cy="8" r="1" fill="white" fill-opacity=".7"/>
</svg>`,

  badge_nova: (c) => `<svg viewBox="0 0 64 64" width="48" height="48" fill="none" style="overflow:visible">
  <defs>
    <radialGradient id="nog1" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="white"/><stop offset="20%" stop-color="#fdf2f8"/><stop offset="45%" stop-color="#fbcfe8"/><stop offset="70%" stop-color="${c}"/><stop offset="100%" stop-color="#831843"/></radialGradient>
    <radialGradient id="nog2" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="white"/><stop offset="100%" stop-color="${c}" stop-opacity="0"/></radialGradient>
    <filter id="noglw"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="nogbt"><feGaussianBlur stdDeviation="5"/></filter>
  </defs>
  <circle cx="32" cy="32" r="28" fill="#100010"/>
  <circle cx="32" cy="32" r="20" fill="${c}" fill-opacity=".12" filter="url(#nogbt)"/>
  <circle cx="32" cy="32" r="25" fill="none" stroke="${c}" stroke-width=".8" stroke-opacity=".2"/>
  <circle cx="32" cy="32" r="20" fill="none" stroke="${c}" stroke-width=".8" stroke-opacity=".3"/>
  <circle cx="32" cy="32" r="14" fill="none" stroke="${c}" stroke-width=".8" stroke-opacity=".4"/>
  <line x1="32" y1="4" x2="32" y2="60" stroke="${c}" stroke-width="1.5" stroke-opacity=".35"/>
  <line x1="4" y1="32" x2="60" y2="32" stroke="${c}" stroke-width="1.5" stroke-opacity=".35"/>
  <line x1="11" y1="11" x2="53" y2="53" stroke="${c}" stroke-width="1.5" stroke-opacity=".3"/>
  <line x1="53" y1="11" x2="11" y2="53" stroke="${c}" stroke-width="1.5" stroke-opacity=".3"/>
  <line x1="32" y1="4" x2="48" y2="16" stroke="#fbcfe8" stroke-width="1" stroke-opacity=".25"/>
  <line x1="32" y1="4" x2="16" y2="16" stroke="#fbcfe8" stroke-width="1" stroke-opacity=".25"/>
  <line x1="32" y1="60" x2="48" y2="48" stroke="#fbcfe8" stroke-width="1" stroke-opacity=".25"/>
  <line x1="32" y1="60" x2="16" y2="48" stroke="#fbcfe8" stroke-width="1" stroke-opacity=".25"/>
  <circle cx="32" cy="32" r="13" fill="url(#nog1)" filter="url(#noglw)"/>
  <circle cx="32" cy="32" r="8" fill="url(#nog2)"/>
  <circle cx="32" cy="32" r="4.5" fill="white" fill-opacity=".97"/>
  <circle cx="30" cy="30" r="1.5" fill="white"/>
</svg>`,

  badge_solar: (c) => `<svg viewBox="0 0 64 64" width="48" height="48" fill="none" style="overflow:visible">
  <defs>
    <radialGradient id="sog1" cx="45%" cy="40%" r="55%"><stop offset="0%" stop-color="#fffde7"/><stop offset="20%" stop-color="#fff9c4"/><stop offset="45%" stop-color="#fbbf24"/><stop offset="70%" stop-color="${c}"/><stop offset="100%" stop-color="#78350f"/></radialGradient>
    <radialGradient id="sog2" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="white"/><stop offset="100%" stop-color="${c}" stop-opacity="0"/></radialGradient>
    <filter id="soglw"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="sogbt"><feGaussianBlur stdDeviation="4"/></filter>
  </defs>
  <circle cx="32" cy="32" r="17" fill="${c}" fill-opacity=".25" filter="url(#sogbt)"/>
  <line x1="32" y1="5" x2="32" y2="13" stroke="#fde68a" stroke-width="4.5" stroke-linecap="round" filter="url(#soglw)"/>
  <line x1="32" y1="51" x2="32" y2="59" stroke="#fde68a" stroke-width="4.5" stroke-linecap="round" filter="url(#soglw)"/>
  <line x1="5" y1="32" x2="13" y2="32" stroke="#fde68a" stroke-width="4.5" stroke-linecap="round" filter="url(#soglw)"/>
  <line x1="51" y1="32" x2="59" y2="32" stroke="#fde68a" stroke-width="4.5" stroke-linecap="round" filter="url(#soglw)"/>
  <line x1="13" y1="13" x2="18.5" y2="18.5" stroke="#fde68a" stroke-width="4.5" stroke-linecap="round" filter="url(#soglw)"/>
  <line x1="51" y1="13" x2="45.5" y2="18.5" stroke="#fde68a" stroke-width="4.5" stroke-linecap="round" filter="url(#soglw)"/>
  <line x1="13" y1="51" x2="18.5" y2="45.5" stroke="#fde68a" stroke-width="4.5" stroke-linecap="round" filter="url(#soglw)"/>
  <line x1="51" y1="51" x2="45.5" y2="45.5" stroke="#fde68a" stroke-width="4.5" stroke-linecap="round" filter="url(#soglw)"/>
  <circle cx="32" cy="32" r="17" fill="url(#sog1)" filter="url(#soglw)"/>
  <circle cx="32" cy="32" r="17" fill="url(#sog2)" fill-opacity=".35"/>
  <circle cx="32" cy="32" r="17" fill="none" stroke="#fef9c3" stroke-width="1.2" stroke-opacity=".4"/>
  <ellipse cx="27" cy="26" rx="5" ry="4" fill="#d97706" fill-opacity=".35"/>
  <path d="M32 16 C25 18 22 25 24 32 C26 20 34 17 40 21" fill="white" fill-opacity=".12"/>
  <circle cx="32" cy="32" r="6" fill="white" fill-opacity=".9"/>
  <circle cx="30" cy="30" r="2" fill="white"/>
</svg>`,

  badge_lunar: (c) => `<svg viewBox="0 0 64 64" width="48" height="48" fill="none" style="overflow:visible">
  <defs>
    <linearGradient id="lug1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f8fafc"/><stop offset="35%" stop-color="#e2e8f0"/><stop offset="70%" stop-color="${c}"/><stop offset="100%" stop-color="#64748b"/></linearGradient>
    <radialGradient id="lug2" cx="35%" cy="30%" r="65%"><stop offset="0%" stop-color="#f1f5f9"/><stop offset="100%" stop-color="#94a3b8"/></radialGradient>
    <filter id="luglw"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <circle cx="32" cy="32" r="28" fill="#050510"/>
  <circle cx="32" cy="32" r="28" fill="none" stroke="#334155" stroke-width="1"/>
  <circle cx="10" cy="18" r="2" fill="white" fill-opacity=".55"/>
  <circle cx="54" cy="12" r="1.5" fill="white" fill-opacity=".5"/>
  <circle cx="58" cy="38" r="1.8" fill="white" fill-opacity=".45"/>
  <circle cx="8" cy="44" r="1.2" fill="white" fill-opacity=".4"/>
  <circle cx="50" cy="54" r="1" fill="white" fill-opacity=".5"/>
  <circle cx="28" cy="6" r="1" fill="white" fill-opacity=".6"/>
  <circle cx="32" cy="32" r="23" fill="url(#lug2)" filter="url(#luglw)"/>
  <circle cx="32" cy="32" r="23" fill="none" stroke="#e2e8f0" stroke-width=".8" stroke-opacity=".5"/>
  <circle cx="42" cy="21" r="22" fill="#050510"/>
  <circle cx="42" cy="21" r="22" fill="none" stroke="#0f172a" stroke-width=".5"/>
  <circle cx="15" cy="22" r="4.5" fill="#374151" fill-opacity=".45"/>
  <circle cx="25" cy="38" r="3" fill="#4b5563" fill-opacity=".4"/>
  <circle cx="18" cy="34" r="2" fill="#374151" fill-opacity=".35"/>
  <circle cx="10" cy="28" r="3.5" fill="#334155" fill-opacity=".5"/>
  <circle cx="22" cy="46" r="2.5" fill="#374151" fill-opacity=".35"/>
</svg>`,

  badge_cosmic: (c) => `<svg viewBox="0 0 64 64" width="48" height="48" fill="none" style="overflow:visible">
  <defs>
    <linearGradient id="cosg1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fef9c3"/><stop offset="25%" stop-color="#fcd34d"/><stop offset="55%" stop-color="#d97706"/><stop offset="100%" stop-color="#78350f"/></linearGradient>
    <linearGradient id="cosg2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fee2e2"/><stop offset="20%" stop-color="#f87171"/><stop offset="40%" stop-color="#facc15"/><stop offset="60%" stop-color="#4ade80"/><stop offset="80%" stop-color="#60a5fa"/><stop offset="100%" stop-color="${c}"/></linearGradient>
    <filter id="cosglw"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <path d="M32 4 L48 11 L53 32 L44 50 L32 56 L20 50 L11 32 L16 11 Z" fill="url(#cosg1)" filter="url(#cosglw)"/>
  <path d="M32 7 L44 13 L48 32 L41 47 L32 53 L23 47 L16 32 L20 13 Z" fill="#030308"/>
  <path d="M20 13 L25 5 L29 11 L32 4 L35 11 L39 5 L44 13" stroke="url(#cosg1)" stroke-width="2" fill="url(#cosg1)" stroke-linejoin="round"/>
  <circle cx="32" cy="32" r="16" fill="none" stroke="url(#cosg2)" stroke-width="3" opacity=".7" filter="url(#cosglw)"/>
  <circle cx="32" cy="32" r="11" fill="none" stroke="url(#cosg2)" stroke-width="2" opacity=".5"/>
  <circle cx="32" cy="32" r="6" fill="none" stroke="url(#cosg2)" stroke-width="1.5" opacity=".6"/>
  <ellipse cx="32" cy="32" rx="16" ry="6" fill="none" stroke="url(#cosg2)" stroke-width="1.5" opacity=".4" transform="rotate(-30 32 32)"/>
  <circle cx="32" cy="32" r="5.5" fill="url(#cosg2)"/>
  <circle cx="32" cy="32" r="2.5" fill="white" fill-opacity=".95"/>
  <circle cx="20" cy="24" r="1.5" fill="#f87171" fill-opacity=".7"/>
  <circle cx="44" cy="24" r="1.5" fill="#4ade80" fill-opacity=".7"/>
  <circle cx="44" cy="40" r="1.5" fill="#60a5fa" fill-opacity=".7"/>
  <circle cx="20" cy="40" r="1.5" fill="#facc15" fill-opacity=".7"/>
</svg>`,

  badge_void: (c) => `<svg viewBox="0 0 64 64" width="48" height="48" fill="none" style="overflow:visible">
  <defs>
    <radialGradient id="vog1" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="black"/><stop offset="35%" stop-color="#0d0020"/><stop offset="60%" stop-color="#1e1040"/><stop offset="80%" stop-color="#3b0764"/><stop offset="100%" stop-color="${c}"/></radialGradient>
    <radialGradient id="vog2" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${c}" stop-opacity=".0"/><stop offset="60%" stop-color="${c}" stop-opacity=".15"/><stop offset="100%" stop-color="${c}" stop-opacity=".5"/></radialGradient>
    <filter id="voglw"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="vogbt"><feGaussianBlur stdDeviation="5"/></filter>
  </defs>
  <circle cx="32" cy="32" r="28" fill="url(#vog1)" filter="url(#voglw)"/>
  <circle cx="32" cy="32" r="28" fill="none" stroke="${c}" stroke-width="1.5" stroke-opacity=".5"/>
  <circle cx="32" cy="32" r="24" fill="none" stroke="#6d28d9" stroke-width="1" stroke-opacity=".3"/>
  <circle cx="32" cy="32" r="18" fill="none" stroke="#7c3aed" stroke-width="1.2" stroke-opacity=".35" filter="url(#voglw)"/>
  <circle cx="32" cy="32" r="12" fill="none" stroke="#8b5cf6" stroke-width="1.5" stroke-opacity=".4"/>
  <circle cx="32" cy="32" r="14" fill="url(#vog2)" filter="url(#vogbt)"/>
  <circle cx="32" cy="32" r="8" fill="black"/>
  <ellipse cx="32" cy="32" rx="4" ry="6.5" fill="${c}" fill-opacity=".7" filter="url(#voglw)"/>
  <circle cx="32" cy="32" r="2.5" fill="white" fill-opacity=".9"/>
  <circle cx="13" cy="15" r="1.8" fill="white" fill-opacity=".55"/>
  <circle cx="51" cy="13" r="1.2" fill="white" fill-opacity=".45"/>
  <circle cx="55" cy="48" r="1.5" fill="white" fill-opacity=".5"/>
  <circle cx="9" cy="47" r="1" fill="white" fill-opacity=".4"/>
  <circle cx="32" cy="5" r=".8" fill="${c}" fill-opacity=".8"/>
  <circle cx="32" cy="59" r=".8" fill="${c}" fill-opacity=".8"/>
  <circle cx="5" cy="32" r=".8" fill="${c}" fill-opacity=".8"/>
  <circle cx="59" cy="32" r=".8" fill="${c}" fill-opacity=".8"/>
</svg>`,

  badge_shadow: (c) => `<svg viewBox="0 0 64 64" width="48" height="48" fill="none" style="overflow:visible">
  <defs>
    <linearGradient id="shg1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#94a3b8"/><stop offset="40%" stop-color="#475569"/><stop offset="80%" stop-color="#1e293b"/><stop offset="100%" stop-color="#020617"/></linearGradient>
    <linearGradient id="shg2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fef9c3"/><stop offset="30%" stop-color="#e2e8f0"/><stop offset="100%" stop-color="#94a3b8"/></linearGradient>
    <filter id="shglw"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <path d="M32 4 L48 11 L53 32 L44 50 L32 56 L20 50 L11 32 L16 11 Z" fill="url(#shg2)" filter="url(#shglw)"/>
  <path d="M32 7 L44 13 L48 32 L41 47 L32 53 L23 47 L16 32 L20 13 Z" fill="url(#shg1)"/>
  <path d="M20 18 C21 10 28 8 32 8 C36 8 43 10 44 18 C46 26 44 35 32 36 C20 35 18 26 20 18 Z" fill="#1f2937"/>
  <path d="M21 18 C22 11 28 9 32 9 C36 9 42 11 43 18" fill="#374151" fill-opacity=".35"/>
  <path d="M20 36 C18 40 17 44 19 48 L32 50 L45 48 C47 44 46 40 44 36" fill="#111827" fill-opacity=".8"/>
  <ellipse cx="24" cy="24" rx="5" ry="4" fill="#374151"/>
  <ellipse cx="40" cy="24" rx="5" ry="4" fill="#374151"/>
  <ellipse cx="24" cy="23" rx="2.5" ry="3.5" fill="#0f172a"/>
  <ellipse cx="40" cy="23" rx="2.5" ry="3.5" fill="#0f172a"/>
  <circle cx="23" cy="21.5" r="2" fill="${c}" fill-opacity=".75" filter="url(#shglw)"/>
  <circle cx="39" cy="21.5" r="2" fill="${c}" fill-opacity=".75" filter="url(#shglw)"/>
  <circle cx="22.5" cy="21" r=".9" fill="white" fill-opacity=".6"/>
  <circle cx="38.5" cy="21" r=".9" fill="white" fill-opacity=".6"/>
  <path d="M11 32 L6 28 M11 36 L5 38 M53 32 L58 28 M53 36 L59 38" stroke="#374155" stroke-width="1.5" stroke-linecap="round" opacity=".5"/>
</svg>`,

  badge_demon: (c) => `<svg viewBox="0 0 64 64" width="48" height="48" fill="none" style="overflow:visible">
  <defs>
    <radialGradient id="deg1" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="#fca5a5"/><stop offset="40%" stop-color="${c}"/><stop offset="100%" stop-color="#450a0a"/></radialGradient>
    <radialGradient id="deg2" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fef08a"/><stop offset="50%" stop-color="#fbbf24"/><stop offset="100%" stop-color="${c}"/></radialGradient>
    <filter id="deglw"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <circle cx="32" cy="32" r="28" fill="#120000" stroke="#7f1d1d" stroke-width="1.5"/>
  <path d="M17 14 C13 4 6 0 3 0 C6 5 11 11 14 18 Z" fill="${c}" filter="url(#deglw)"/>
  <path d="M47 14 C51 4 58 0 61 0 C58 5 53 11 50 18 Z" fill="${c}" filter="url(#deglw)"/>
  <path d="M17 14 L14 18 L18 15 Z" fill="#fca5a5" fill-opacity=".5"/>
  <path d="M47 14 L50 18 L46 15 Z" fill="#fca5a5" fill-opacity=".5"/>
  <path d="M13 26 L21 22 L25 26 L21 30 Z" fill="#1a0000"/>
  <path d="M51 26 L43 22 L39 26 L43 30 Z" fill="#1a0000"/>
  <ellipse cx="22" cy="26" rx="6.5" ry="5" fill="url(#deg1)"/>
  <ellipse cx="42" cy="26" rx="6.5" ry="5" fill="url(#deg1)"/>
  <ellipse cx="22" cy="26" rx="2.8" ry="4.5" fill="#0a0000"/>
  <ellipse cx="42" cy="26" rx="2.8" ry="4.5" fill="#0a0000"/>
  <circle cx="21" cy="24" r="2" fill="url(#deg2)" fill-opacity=".85" filter="url(#deglw)"/>
  <circle cx="41" cy="24" r="2" fill="url(#deg2)" fill-opacity=".85" filter="url(#deglw)"/>
  <circle cx="20.5" cy="23.5" r=".9" fill="white" fill-opacity=".7"/>
  <circle cx="40.5" cy="23.5" r=".9" fill="white" fill-opacity=".7"/>
  <path d="M24 36 C26 38 29 39 32 39 C35 39 38 38 40 36" fill="none" stroke="#fca5a5" stroke-width="1.5" stroke-opacity=".6"/>
  <path d="M25 37 L23 45 M28 39 L26 47 M32 40 L32 48 M36 39 L38 47 M39 37 L41 45" stroke="#dc2626" stroke-width="2" stroke-linecap="round" opacity=".7"/>
  <path d="M25 45 L28 47 M28 47 L32 49 M32 49 L36 47 M36 47 L39 45" stroke="#b91c1c" stroke-width="1.5" fill="none" stroke-linecap="round" opacity=".6"/>
</svg>`,

  badge_skull: (c) => `<svg viewBox="0 0 64 64" width="48" height="48" fill="none" style="overflow:visible">
  <defs>
    <radialGradient id="skg1" cx="40%" cy="30%" r="70%"><stop offset="0%" stop-color="#f8fafc"/><stop offset="40%" stop-color="${c}"/><stop offset="80%" stop-color="#cbd5e1"/><stop offset="100%" stop-color="#64748b"/></radialGradient>
    <linearGradient id="skg2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#e2e8f0"/><stop offset="60%" stop-color="#94a3b8"/><stop offset="100%" stop-color="#475569"/></linearGradient>
    <filter id="skglw"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <path d="M32 4 L48 11 L53 32 L44 50 L32 56 L20 50 L11 32 L16 11 Z" fill="url(#skg2)" filter="url(#skglw)"/>
  <path d="M32 7 L44 13 L48 32 L41 47 L32 53 L23 47 L16 32 L20 13 Z" fill="#0f172a"/>
  <ellipse cx="32" cy="29" rx="15" ry="16" fill="url(#skg1)"/>
  <ellipse cx="32" cy="29" rx="15" ry="16" fill="none" stroke="#94a3b8" stroke-width=".8" stroke-opacity=".5"/>
  <rect x="21" y="38" width="22" height="12" rx="4" fill="url(#skg1)"/>
  <rect x="21" y="38" width="22" height="12" rx="4" fill="none" stroke="#94a3b8" stroke-width=".8" stroke-opacity=".4"/>
  <ellipse cx="24" cy="27" rx="5.5" ry="5" fill="#0f172a"/>
  <ellipse cx="40" cy="27" rx="5.5" ry="5" fill="#0f172a"/>
  <circle cx="23" cy="25.5" r="2.2" fill="#1e293b" fill-opacity=".6"/>
  <circle cx="39" cy="25.5" r="2.2" fill="#1e293b" fill-opacity=".6"/>
  <ellipse cx="32" cy="36" rx="4" ry="3.5" fill="#1e293b"/>
  <line x1="26" y1="39" x2="26" y2="50" stroke="#0f172a" stroke-width="2"/>
  <line x1="30" y1="39" x2="30" y2="51" stroke="#0f172a" stroke-width="2"/>
  <line x1="34" y1="39" x2="34" y2="51" stroke="#0f172a" stroke-width="2"/>
  <line x1="38" y1="39" x2="38" y2="50" stroke="#0f172a" stroke-width="2"/>
  <path d="M22 18 C22 14 26 12 32 12 C38 12 42 14 42 18" fill="none" stroke="#94a3b8" stroke-width=".8" stroke-opacity=".3"/>
  <path d="M28 14 C28 12 30 11 32 11 C34 11 36 12 36 14" fill="white" fill-opacity=".1"/>
  <path d="M38 22 L42 18" stroke="#cbd5e1" stroke-width=".8" stroke-opacity=".5"/>
</svg>`,

  badge_obsidian: (c) => `<svg viewBox="0 0 64 64" width="48" height="48" fill="none" style="overflow:visible">
  <defs>
    <linearGradient id="obg1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#374151"/><stop offset="30%" stop-color="#1f2937"/><stop offset="65%" stop-color="#111827"/><stop offset="100%" stop-color="#030712"/></linearGradient>
    <linearGradient id="obg2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${c}"/><stop offset="50%" stop-color="#6d28d9"/><stop offset="100%" stop-color="#3b0764"/></linearGradient>
    <linearGradient id="obg3" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#f97316"/><stop offset="50%" stop-color="#fbbf24"/><stop offset="100%" stop-color="#dc2626"/></linearGradient>
    <filter id="obglw"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <path d="M32 4 L48 11 L53 32 L44 50 L32 56 L20 50 L11 32 L16 11 Z" fill="url(#obg1)" filter="url(#obglw)"/>
  <path d="M32 4 L48 11 L53 32 L44 50 L32 56 L20 50 L11 32 L16 11 Z" fill="none" stroke="url(#obg2)" stroke-width="2.5"/>
  <path d="M20 13 L25 5 L29 11 L32 4 L35 11 L39 5 L44 13" fill="url(#obg1)" stroke="url(#obg2)" stroke-width="1.5" stroke-linejoin="round"/>
  <polygon points="32,20 50,34 44,52 20,52 14,34" fill="url(#obg1)"/>
  <polygon points="32,20 50,34 44,52 20,52 14,34" fill="none" stroke="#4b5563" stroke-width=".8"/>
  <line x1="32" y1="20" x2="50" y2="34" stroke="#374151" stroke-width=".8"/>
  <line x1="32" y1="20" x2="14" y2="34" stroke="#374151" stroke-width=".8"/>
  <line x1="20" y1="52" x2="50" y2="52" stroke="#374151" stroke-width=".8"/>
  <path d="M24 34 L28 26 L32 34 L36 26 L40 34" stroke="url(#obg3)" stroke-width="1.5" fill="none" stroke-linecap="round" filter="url(#obglw)"/>
  <path d="M20 44 L24 38 L28 44" stroke="url(#obg3)" stroke-width="1.2" fill="none" stroke-linecap="round" filter="url(#obglw)"/>
  <path d="M36 44 L40 38 L44 44" stroke="url(#obg3)" stroke-width="1.2" fill="none" stroke-linecap="round" filter="url(#obglw)"/>
  <path d="M14 34 L32 20 L32 34 Z" fill="white" fill-opacity=".07"/>
  <circle cx="32" cy="34" r="5.5" fill="url(#obg2)"/>
  <circle cx="32" cy="34" r="5.5" fill="none" stroke="${c}" stroke-width="1"/>
  <circle cx="32" cy="34" r="2.5" fill="white" fill-opacity=".88"/>
  <circle cx="31" cy="33" r=".9" fill="white"/>
</svg>`,

  badge_angel: (c) => `<svg viewBox="0 0 64 64" width="48" height="48" fill="none" style="overflow:visible">
  <defs>
    <linearGradient id="ang1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fffde7"/><stop offset="25%" stop-color="#ffe082"/><stop offset="55%" stop-color="${c}"/><stop offset="80%" stop-color="#f9a825"/><stop offset="100%" stop-color="#78350f"/></linearGradient>
    <radialGradient id="ang2" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="white" stop-opacity=".9"/><stop offset="100%" stop-color="white" stop-opacity="0"/></radialGradient>
    <filter id="anglw"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="angbt"><feGaussianBlur stdDeviation="4"/></filter>
  </defs>
  <ellipse cx="32" cy="8" rx="18" ry="6" fill="none" stroke="url(#ang1)" stroke-width="5" filter="url(#anglw)"/>
  <ellipse cx="32" cy="8" rx="18" ry="6" fill="none" stroke="#fffde7" stroke-width="1.5" stroke-opacity=".6"/>
  <circle cx="32" cy="8" r="3" fill="url(#ang1)" filter="url(#anglw)"/>
  <path d="M14 32 C7 26 2 18 1 8 C3 15 5 23 7 30 L12 32 Z" fill="white" fill-opacity=".92"/>
  <path d="M14 32 C7 26 2 18 1 8 C3 15 5 23 7 30 L12 32 Z" fill="none" stroke="#fde68a" stroke-width=".8" stroke-opacity=".5"/>
  <path d="M50 32 C57 26 62 18 63 8 C61 15 59 23 57 30 L52 32 Z" fill="white" fill-opacity=".92"/>
  <path d="M50 32 C57 26 62 18 63 8 C61 15 59 23 57 30 L52 32 Z" fill="none" stroke="#fde68a" stroke-width=".8" stroke-opacity=".5"/>
  <path d="M8 28 L12 24 M6 22 L10 19 M5 16 L8 14" stroke="#fde68a" stroke-width="1" stroke-opacity=".5" stroke-linecap="round"/>
  <path d="M56 28 L52 24 M58 22 L54 19 M59 16 L56 14" stroke="#fde68a" stroke-width="1" stroke-opacity=".5" stroke-linecap="round"/>
  <polygon points="32,18 48,34 44,54 20,54 16,34" fill="url(#ang1)" filter="url(#anglw)"/>
  <polygon points="32,18 48,34 32,34" fill="white" fill-opacity=".22"/>
  <circle cx="32" cy="7" r="10" fill="url(#ang2)" filter="url(#angbt)"/>
  <circle cx="32" cy="29" r="5.5" fill="white" fill-opacity=".92"/>
  <circle cx="30" cy="27" r="2" fill="white"/>
  <circle cx="32" cy="18" r="2.5" fill="#fffde7"/>
  <circle cx="48" cy="34" r="2" fill="#fcd34d"/>
  <circle cx="16" cy="34" r="2" fill="#fcd34d"/>
</svg>`,

  badge_divine: (c) => `<svg viewBox="0 0 64 64" width="48" height="48" fill="none" style="overflow:visible">
  <defs>
    <radialGradient id="dvg1" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fffde7"/><stop offset="25%" stop-color="#ffe082"/><stop offset="55%" stop-color="${c}"/><stop offset="80%" stop-color="#f9a825"/><stop offset="100%" stop-color="#78350f"/></radialGradient>
    <filter id="dvglw"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="dvgbt"><feGaussianBlur stdDeviation="4"/></filter>
  </defs>
  <circle cx="32" cy="32" r="26" fill="${c}" fill-opacity=".08" filter="url(#dvgbt)"/>
  <path d="M32 5 L38 21 H55 L42 31 L48 47 L32 37 L16 47 L22 31 L9 21 H26 Z" fill="url(#dvg1)" filter="url(#dvglw)"/>
  <path d="M32 5 L38 21 H55 L42 31 L48 47 L32 37 L16 47 L22 31 L9 21 H26 Z" fill="none" stroke="#fffde7" stroke-width="1" stroke-opacity=".5"/>
  <line x1="32" y1="2" x2="32" y2="10" stroke="#fffde7" stroke-width="2.5" stroke-linecap="round" filter="url(#dvglw)"/>
  <line x1="32" y1="54" x2="32" y2="62" stroke="#fffde7" stroke-width="2.5" stroke-linecap="round" filter="url(#dvglw)"/>
  <line x1="2" y1="32" x2="10" y2="32" stroke="#fffde7" stroke-width="2.5" stroke-linecap="round" filter="url(#dvglw)"/>
  <line x1="54" y1="32" x2="62" y2="32" stroke="#fffde7" stroke-width="2.5" stroke-linecap="round" filter="url(#dvglw)"/>
  <line x1="7" y1="7" x2="13" y2="13" stroke="#ffe082" stroke-width="2" stroke-linecap="round" filter="url(#dvglw)"/>
  <line x1="57" y1="7" x2="51" y2="13" stroke="#ffe082" stroke-width="2" stroke-linecap="round" filter="url(#dvglw)"/>
  <line x1="7" y1="57" x2="13" y2="51" stroke="#ffe082" stroke-width="2" stroke-linecap="round" filter="url(#dvglw)"/>
  <line x1="57" y1="57" x2="51" y2="51" stroke="#ffe082" stroke-width="2" stroke-linecap="round" filter="url(#dvglw)"/>
  <path d="M26 22 L32 5 L38 22 L32 27 Z" fill="white" fill-opacity=".2"/>
  <rect x="29" y="22" width="6" height="20" rx="2" fill="white" fill-opacity=".65"/>
  <rect x="22" y="27" width="20" height="6" rx="2" fill="white" fill-opacity=".65"/>
  <circle cx="32" cy="30" r="9" fill="white" fill-opacity=".18"/>
  <circle cx="32" cy="30" r="5.5" fill="white" fill-opacity=".9"/>
  <circle cx="30" cy="28" r="2" fill="white"/>
</svg>`,

  badge_tech: (c) => `<svg viewBox="0 0 64 64" width="48" height="48" fill="none" style="overflow:visible">
  <defs>
    <linearGradient id="teg1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fef9c3"/><stop offset="25%" stop-color="#fcd34d"/><stop offset="55%" stop-color="#d97706"/><stop offset="100%" stop-color="#78350f"/></linearGradient>
    <linearGradient id="teg2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#cffafe"/><stop offset="35%" stop-color="#67e8f9"/><stop offset="65%" stop-color="${c}"/><stop offset="100%" stop-color="#0891b2"/></linearGradient>
    <filter id="teglw"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <polygon points="32,2 58,16 58,48 32,62 6,48 6,16" fill="url(#teg1)" filter="url(#teglw)"/>
  <polygon points="32,2 58,16 58,48 32,62 6,48 6,16" fill="none" stroke="#fcd34d" stroke-width="1" stroke-opacity=".5"/>
  <polygon points="32,7 53,19 53,45 32,57 11,45 11,19" fill="#050f1a"/>
  <polygon points="32,7 53,19 53,45 32,57 11,45 11,19" fill="none" stroke="${c}" stroke-width=".8" stroke-opacity=".3"/>
  <rect x="20" y="20" width="24" height="24" rx="3.5" fill="#0a1f2e" stroke="url(#teg2)" stroke-width="1.5"/>
  <rect x="23" y="23" width="18" height="18" rx="2" fill="#0e2a3a"/>
  <circle cx="32" cy="32" r="5.5" fill="url(#teg2)"/>
  <circle cx="32" cy="32" r="5.5" fill="none" stroke="#67e8f9" stroke-width="1"/>
  <circle cx="32" cy="32" r="2.5" fill="white" fill-opacity=".95"/>
  <line x1="20" y1="32" x2="14" y2="32" stroke="url(#teg2)" stroke-width="1.5"/>
  <line x1="44" y1="32" x2="50" y2="32" stroke="url(#teg2)" stroke-width="1.5"/>
  <line x1="32" y1="20" x2="32" y2="14" stroke="url(#teg2)" stroke-width="1.5"/>
  <line x1="32" y1="44" x2="32" y2="50" stroke="url(#teg2)" stroke-width="1.5"/>
  <circle cx="14" cy="32" r="2.5" fill="${c}"/>
  <circle cx="50" cy="32" r="2.5" fill="${c}"/>
  <circle cx="32" cy="14" r="2.5" fill="${c}"/>
  <circle cx="32" cy="50" r="2.5" fill="${c}"/>
  <line x1="20" y1="20" x2="14" y2="14" stroke="url(#teg2)" stroke-width="1" stroke-opacity=".5"/>
  <line x1="44" y1="20" x2="50" y2="14" stroke="url(#teg2)" stroke-width="1" stroke-opacity=".5"/>
  <line x1="20" y1="44" x2="14" y2="50" stroke="url(#teg2)" stroke-width="1" stroke-opacity=".5"/>
  <line x1="44" y1="44" x2="50" y2="50" stroke="url(#teg2)" stroke-width="1" stroke-opacity=".5"/>
  <circle cx="30" cy="30" r="1.2" fill="white" fill-opacity=".5"/>
</svg>`,

  badge_neon: (c) => `<svg viewBox="0 0 64 64" width="48" height="48" fill="none" style="overflow:visible">
  <defs>
    <linearGradient id="neg1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#cffafe"/><stop offset="35%" stop-color="#67e8f9"/><stop offset="65%" stop-color="${c}"/><stop offset="100%" stop-color="#0891b2"/></linearGradient>
    <filter id="neglw"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="negbt"><feGaussianBlur stdDeviation="5"/></filter>
  </defs>
  <rect x="4" y="4" width="56" height="56" rx="14" fill="#010d14"/>
  <rect x="4" y="4" width="56" height="56" rx="14" fill="none" stroke="url(#neg1)" stroke-width="4" filter="url(#neglw)"/>
  <rect x="4" y="4" width="56" height="56" rx="14" fill="none" stroke="white" stroke-width="1" stroke-opacity=".2"/>
  <rect x="8" y="8" width="48" height="48" rx="11" fill="none" stroke="${c}" stroke-width="1" stroke-opacity=".15"/>
  <circle cx="32" cy="32" r="15" fill="#01171f" stroke="url(#neg1)" stroke-width="3" filter="url(#neglw)"/>
  <circle cx="32" cy="32" r="15" fill="none" stroke="white" stroke-width=".8" stroke-opacity=".2"/>
  <circle cx="32" cy="32" r="8" fill="#012030" stroke="url(#neg1)" stroke-width="2"/>
  <circle cx="32" cy="32" r="8" fill="none" stroke="white" stroke-width=".5" stroke-opacity=".2"/>
  <circle cx="32" cy="32" r="14" fill="url(#neg1)" fill-opacity=".08" filter="url(#negbt)"/>
  <circle cx="32" cy="32" r="5.5" fill="url(#neg1)"/>
  <circle cx="32" cy="32" r="5.5" fill="none" stroke="white" stroke-width=".8" stroke-opacity=".4"/>
  <circle cx="32" cy="32" r="2.5" fill="white" fill-opacity=".97"/>
  <circle cx="30" cy="30" r=".9" fill="white"/>
  <circle cx="4" cy="4" rx="3" ry="3" r="3" fill="${c}" fill-opacity=".4"/>
  <circle cx="60" cy="4" r="3" fill="${c}" fill-opacity=".4"/>
  <circle cx="4" cy="60" r="3" fill="${c}" fill-opacity=".4"/>
  <circle cx="60" cy="60" r="3" fill="${c}" fill-opacity=".4"/>
</svg>`,

  badge_matrix: (c) => `<svg viewBox="0 0 64 64" width="48" height="48" fill="none" style="overflow:visible">
  <defs>
    <linearGradient id="mag1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#bbf7d0"/><stop offset="35%" stop-color="#4ade80"/><stop offset="65%" stop-color="${c}"/><stop offset="100%" stop-color="#14532d"/></linearGradient>
    <filter id="maglw"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect x="2" y="2" width="60" height="60" rx="13" fill="#000a00"/>
  <rect x="2" y="2" width="60" height="60" rx="13" fill="none" stroke="url(#mag1)" stroke-width="4" filter="url(#maglw)"/>
  <rect x="2" y="2" width="60" height="60" rx="13" fill="none" stroke="white" stroke-width=".8" stroke-opacity=".15"/>
  <text x="13" y="19" font-size="7" fill="${c}" font-family="monospace" fill-opacity=".9">01</text>
  <text x="28" y="15" font-size="6" fill="#4ade80" font-family="monospace" fill-opacity=".7">1</text>
  <text x="39" y="19" font-size="7" fill="${c}" font-family="monospace" fill-opacity=".8">0</text>
  <text x="49" y="16" font-size="6" fill="#86efac" font-family="monospace" fill-opacity=".6">1</text>
  <text x="10" y="28" font-size="6" fill="#4ade80" font-family="monospace" fill-opacity=".5">1</text>
  <text x="49" y="28" font-size="6" fill="${c}" font-family="monospace" fill-opacity=".6">0</text>
  <text x="10" y="50" font-size="6" fill="#86efac" font-family="monospace" fill-opacity=".5">0</text>
  <text x="46" y="52" font-size="7" fill="${c}" font-family="monospace" fill-opacity=".7">1</text>
  <text x="12" y="58" font-size="6" fill="#4ade80" font-family="monospace" fill-opacity=".45">10</text>
  <path d="M20 18 L16 30 H23 L21 44 L40 28 H33 Z" fill="url(#mag1)" filter="url(#maglw)"/>
  <path d="M20 18 L16 30 H23 L21 44 L40 28 H33 Z" fill="none" stroke="#a7f3d0" stroke-width=".8" stroke-opacity=".5"/>
  <path d="M19 19 L15 30 H22 L20 43 L39 28 H32 Z" fill="white" fill-opacity=".15"/>
  <circle cx="49" cy="13" r="6" fill="${c}" filter="url(#maglw)"/>
  <circle cx="49" cy="13" r="6" fill="none" stroke="#a7f3d0" stroke-width="1"/>
  <circle cx="49" cy="13" r="3" fill="white" fill-opacity=".88"/>
  <circle cx="48" cy="12" r="1" fill="white"/>
</svg>`,

  badge_gold: (c) => `<svg viewBox="0 0 64 64" width="48" height="48" fill="none" style="overflow:visible">
  <defs>
    <linearGradient id="gog1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fffde7"/><stop offset="15%" stop-color="#fff9c4"/><stop offset="35%" stop-color="#ffe082"/><stop offset="55%" stop-color="${c}"/><stop offset="75%" stop-color="#f59e0b"/><stop offset="90%" stop-color="#d97706"/><stop offset="100%" stop-color="#78350f"/></linearGradient>
    <linearGradient id="gog2" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="white" stop-opacity=".4"/><stop offset="100%" stop-color="white" stop-opacity="0"/></linearGradient>
    <filter id="goglw"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <path d="M32 2 L50 10 L55 32 L45 53 L32 58 L19 53 L9 32 L14 10 Z" fill="url(#gog1)" filter="url(#goglw)"/>
  <path d="M32 2 L50 10 L55 32 L45 53 L32 58 L19 53 L9 32 L14 10 Z" fill="none" stroke="#fff9c4" stroke-width="1.2" stroke-opacity=".55"/>
  <path d="M32 2 L50 10 L55 32 L45 53 L32 58 L19 53 L9 32 L14 10 Z" fill="url(#gog2)"/>
  <path d="M32 6 L46 13 L50 32 L43 50 L32 55 L21 50 L14 32 L18 13 Z" fill="#b45309"/>
  <path d="M32 10 L43 16 L47 32 L41 47 L32 52 L23 47 L17 32 L21 16 Z" fill="#7c2d12"/>
  <path d="M18 13 L22 2 L27 10 L32 2 L37 10 L42 2 L46 13" fill="url(#gog1)" stroke="#ffe082" stroke-width=".8" stroke-linejoin="round"/>
  <path d="M21 47 C24 51 28 54 32 55 C36 54 40 51 43 47" fill="url(#gog1)" fill-opacity=".7"/>
  <path d="M20 20 C24 17 28 16 32 16 C36 16 40 17 44 20 L44 36 C41 42 37 46 32 47 C27 46 23 42 20 36 Z" fill="url(#gog1)" fill-opacity=".15"/>
  <path d="M32 16 L30 22 L32 28 L34 22 Z" fill="#fffde7" fill-opacity=".7"/>
  <path d="M22 24 L32 20 L42 24" fill="none" stroke="#ffe082" stroke-width="1" stroke-opacity=".5"/>
  <path d="M20 36 L32 40 L44 36" fill="none" stroke="#ffe082" stroke-width="1" stroke-opacity=".4"/>
  <circle cx="32" cy="30" r="7" fill="url(#gog1)"/>
  <circle cx="32" cy="30" r="7" fill="none" stroke="#fffde7" stroke-width="1.2" stroke-opacity=".6"/>
  <circle cx="32" cy="30" r="4" fill="white" fill-opacity=".9"/>
  <circle cx="30.5" cy="28.5" r="1.5" fill="white"/>
  <circle cx="19" cy="13" r="2.5" fill="url(#gog1)" stroke="#ffe082" stroke-width=".8"/>
  <circle cx="45" cy="13" r="2.5" fill="url(#gog1)" stroke="#ffe082" stroke-width=".8"/>
</svg>`,

  badge_ruby: (c) => `<svg viewBox="0 0 64 64" width="48" height="48" fill="none" style="overflow:visible">
  <defs>
    <radialGradient id="rug1" cx="38%" cy="28%" r="65%"><stop offset="0%" stop-color="#fecaca"/><stop offset="25%" stop-color="#f87171"/><stop offset="55%" stop-color="${c}"/><stop offset="80%" stop-color="#b91c1c"/><stop offset="100%" stop-color="#450a0a"/></radialGradient>
    <linearGradient id="rug2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fef9c3"/><stop offset="25%" stop-color="#ffe082"/><stop offset="55%" stop-color="#d97706"/><stop offset="100%" stop-color="#78350f"/></linearGradient>
    <filter id="ruglw"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <path d="M32 2 L50 10 L55 36 L45 53 L32 58 L19 53 L9 36 L14 10 Z" fill="url(#rug2)" filter="url(#ruglw)"/>
  <path d="M32 2 L50 10 L55 36 L45 53 L32 58 L19 53 L9 36 L14 10 Z" fill="none" stroke="#ffe082" stroke-width="1" stroke-opacity=".5"/>
  <path d="M32 6 L46 13 L50 36 L43 50 L32 55 L21 50 L14 36 L18 13 Z" fill="#2d0000"/>
  <path d="M18 13 L22 2 L27 10 L32 2 L37 10 L42 2 L46 13" fill="url(#rug2)" stroke="#ffe082" stroke-width=".8" stroke-linejoin="round"/>
  <polygon points="32,12 50,32 46,54 18,54 14,32" fill="url(#rug1)" filter="url(#ruglw)"/>
  <polygon points="32,12 50,32 46,54 18,54 14,32" fill="none" stroke="#fca5a5" stroke-width=".8" stroke-opacity=".5"/>
  <line x1="32" y1="12" x2="32" y2="54" stroke="white" stroke-width=".7" stroke-opacity=".18"/>
  <line x1="14" y1="32" x2="50" y2="32" stroke="white" stroke-width=".7" stroke-opacity=".15"/>
  <line x1="32" y1="12" x2="50" y2="32" stroke="white" stroke-width=".5" stroke-opacity=".12"/>
  <line x1="32" y1="12" x2="14" y2="32" stroke="white" stroke-width=".5" stroke-opacity=".12"/>
  <line x1="14" y1="32" x2="18" y2="54" stroke="white" stroke-width=".5" stroke-opacity=".1"/>
  <line x1="50" y1="32" x2="46" y2="54" stroke="white" stroke-width=".5" stroke-opacity=".1"/>
  <polygon points="32,12 50,32 32,32" fill="white" fill-opacity=".22"/>
  <circle cx="26" cy="21" r="5.5" fill="white" fill-opacity=".75"/>
  <circle cx="25" cy="20" r="2.5" fill="white" fill-opacity=".95"/>
  <circle cx="15" cy="16" r="3" fill="url(#rug2)"/>
  <circle cx="49" cy="16" r="3" fill="url(#rug2)"/>
  <circle cx="49" cy="48" r="3" fill="url(#rug2)"/>
  <circle cx="15" cy="48" r="3" fill="url(#rug2)"/>
</svg>`,

  badge_crystal_herald: (c) => `<svg viewBox="0 0 64 64" width="48" height="48" fill="none" style="overflow:visible">
  <defs>
    <linearGradient id="chg1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fef9c3"/><stop offset="20%" stop-color="#ffe082"/><stop offset="45%" stop-color="#d97706"/><stop offset="100%" stop-color="#78350f"/></linearGradient>
    <linearGradient id="chg2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#cffafe"/><stop offset="20%" stop-color="#a5f3fc"/><stop offset="45%" stop-color="${c}"/><stop offset="70%" stop-color="#22d3ee"/><stop offset="100%" stop-color="#0891b2"/></linearGradient>
    <linearGradient id="chg3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fef9c3" stop-opacity=".9"/><stop offset="50%" stop-color="#67e8f9" stop-opacity=".6"/><stop offset="100%" stop-color="${c}" stop-opacity=".2"/></linearGradient>
    <filter id="chglw"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="chgbt"><feGaussianBlur stdDeviation="4"/></filter>
  </defs>
  <path d="M32 4 L48 11 L53 32 L44 50 L32 56 L20 50 L11 32 L16 11 Z" fill="url(#chg1)" filter="url(#chglw)"/>
  <path d="M32 4 L48 11 L53 32 L44 50 L32 56 L20 50 L11 32 L16 11 Z" fill="none" stroke="#ffe082" stroke-width="1.2" stroke-opacity=".6"/>
  <path d="M32 7 L44 13 L48 32 L41 47 L32 53 L23 47 L16 32 L20 13 Z" fill="#010e14"/>
  <path d="M20 13 L25 5 L29 11 L32 4 L35 11 L39 5 L44 13" fill="url(#chg1)" stroke="#ffe082" stroke-width=".8" stroke-linejoin="round"/>
  <polygon points="32,18 48,32 32,46 16,32" fill="url(#chg2)" filter="url(#chglw)"/>
  <polygon points="32,18 48,32 32,32" fill="url(#chg3)"/>
  <polygon points="16,32 32,46 32,32" fill="url(#chg2)" fill-opacity=".3"/>
  <line x1="32" y1="18" x2="32" y2="46" stroke="white" stroke-width="1" stroke-opacity=".3"/>
  <line x1="16" y1="32" x2="48" y2="32" stroke="white" stroke-width="1" stroke-opacity=".25"/>
  <line x1="32" y1="18" x2="16" y2="32" stroke="white" stroke-width=".7" stroke-opacity=".2"/>
  <line x1="32" y1="18" x2="48" y2="32" stroke="white" stroke-width=".7" stroke-opacity=".2"/>
  <line x1="16" y1="32" x2="32" y2="46" stroke="white" stroke-width=".7" stroke-opacity=".15"/>
  <line x1="48" y1="32" x2="32" y2="46" stroke="white" stroke-width=".7" stroke-opacity=".15"/>
  <circle cx="32" cy="18" r="4.5" fill="url(#chg2)" stroke="white" stroke-width="1.2" filter="url(#chglw)"/>
  <circle cx="48" cy="32" r="4.5" fill="url(#chg2)" stroke="white" stroke-width="1.2" filter="url(#chglw)"/>
  <circle cx="32" cy="46" r="4.5" fill="url(#chg2)" stroke="white" stroke-width="1.2" filter="url(#chglw)"/>
  <circle cx="16" cy="32" r="4.5" fill="url(#chg2)" stroke="white" stroke-width="1.2" filter="url(#chglw)"/>
  <circle cx="32" cy="18" r="2.2" fill="white" fill-opacity=".9"/>
  <circle cx="48" cy="32" r="2.2" fill="white" fill-opacity=".9"/>
  <circle cx="32" cy="46" r="2.2" fill="white" fill-opacity=".9"/>
  <circle cx="16" cy="32" r="2.2" fill="white" fill-opacity=".9"/>
  <circle cx="32" cy="32" r="6" fill="url(#chg2)" filter="url(#chgbt)"/>
  <circle cx="32" cy="32" r="5.5" fill="url(#chg2)"/>
  <circle cx="32" cy="32" r="5.5" fill="none" stroke="white" stroke-width="1.2" stroke-opacity=".6"/>
  <circle cx="32" cy="32" r="3" fill="white" fill-opacity=".97"/>
  <circle cx="31" cy="31" r="1.2" fill="white"/>
  <circle cx="11" cy="32" r="2.5" fill="url(#chg1)"/>
  <circle cx="53" cy="32" r="2.5" fill="url(#chg1)"/>
  <circle cx="32" cy="4" r="2.5" fill="url(#chg1)"/>
  <circle cx="32" cy="56" r="2.5" fill="url(#chg1)"/>
</svg>`,

};

const GROUPS = ["All", "Classic", "Heraldic", "Elemental", "Celestial", "Dark", "Divine", "Premium", "Legendary"];

function BadgeCard({ badge, selected, onClick }: { badge: typeof BADGES[0]; selected: boolean; onClick: () => void }) {
  const svgFn = SVG_MAP[badge.effectType];
  const svgHtml = svgFn ? svgFn(badge.color) : `<svg viewBox="0 0 48 48" width="48" height="48"><circle cx="24" cy="24" r="22" fill="${badge.color}" opacity=".6"/></svg>`;

  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl border cursor-pointer transition-all select-none flex flex-col items-center p-4 gap-3 ${
        selected ? "border-white/40 bg-white/10 scale-105 shadow-lg" : "border-white/10 bg-white/4 hover:border-white/20 hover:bg-white/8"
      }`}
      style={selected ? { boxShadow: `0 0 24px ${badge.color}44` } : {}}
    >
      <div className="w-16 h-16 rounded-xl flex items-center justify-center"
        style={{ background: `${badge.color}14`, border: `1px solid ${badge.color}30` }}>
        <div dangerouslySetInnerHTML={{ __html: svgHtml }} />
      </div>
      <div className="text-center">
        <p className="text-white font-bold text-xs leading-snug">{badge.name}</p>
        <p className="text-xs mt-0.5 font-semibold" style={{ color: badge.color }}>{badge.price}</p>
      </div>
      <div className="text-[10px] text-gray-600 bg-white/5 px-2 py-0.5 rounded-full">{badge.group}</div>
    </div>
  );
}

function BadgePreviewApp() {
  const [selected, setSelected] = useState<string | null>("badge_crystal_herald");
  const [group, setGroup] = useState("All");

  const filtered = group === "All" ? BADGES : BADGES.filter(b => b.group === group);
  const sel = BADGES.find(b => b.effectType === selected);
  const selSvg = sel && SVG_MAP[sel.effectType] ? SVG_MAP[sel.effectType](sel.color) : null;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black text-white tracking-tight">LAWSA Badge Collection</h1>
          <p className="text-gray-500 mt-1.5 text-sm">{BADGES.length} unique badges · Equip them on your profile</p>
        </div>

        {sel && selSvg && (
          <div className="mb-8 rounded-3xl border border-white/10 bg-[#0a0a0a] p-6 flex flex-col sm:flex-row items-center gap-6"
            style={{ boxShadow: `0 0 60px ${sel.color}22, inset 0 0 40px ${sel.color}08` }}>
            <div className="w-32 h-32 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${sel.color}18`, border: `1.5px solid ${sel.color}40` }}>
              <div dangerouslySetInnerHTML={{ __html: SVG_MAP[sel.effectType](sel.color).replace('width="48" height="48"', 'width="88" height="88"') }} />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: sel.color }}>{sel.group}</div>
              <h2 className="text-2xl font-black text-white mb-1">{sel.name}</h2>
              <p className="text-gray-400 text-sm mb-3">A unique badge to display on your LAWSA profile. Shows next to your username in posts and chats.</p>
              <div className="flex items-center gap-3 justify-center sm:justify-start flex-wrap">
                <span className="text-2xl font-black text-white">{sel.price}</span>
                <span className="text-xs text-gray-500 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">{sel.effectType}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {GROUPS.map(g => (
            <button key={g} onClick={() => setGroup(g)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                group === g ? "bg-white text-black" : "bg-white/8 text-gray-400 hover:bg-white/12 border border-white/10"
              }`}>
              {g} {g !== "All" ? `(${BADGES.filter(b => b.group === g).length})` : `(${BADGES.length})`}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {filtered.map(b => (
            <BadgeCard
              key={b.effectType}
              badge={b}
              selected={selected === b.effectType}
              onClick={() => setSelected(selected === b.effectType ? null : b.effectType)}
            />
          ))}
        </div>

        <p className="text-center text-gray-700 text-xs mt-8">Tap any badge to preview it · Available in the LAWSA Store</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Switch>
        <Route path="/" component={BadgePreviewApp} />
      </Switch>
    </WouterRouter>
  );
}
