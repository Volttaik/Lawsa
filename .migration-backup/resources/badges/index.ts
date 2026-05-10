export { default as AmethystBadge   } from "./AmethystBadge";
export { default as PhoenixBadge    } from "./PhoenixBadge";
export { default as DragonBadge     } from "./DragonBadge";
export { default as RoyalBadge      } from "./RoyalBadge";
export { default as WarriorBadge    } from "./WarriorBadge";
export { default as AzureBadge      } from "./AzureBadge";
export { default as InfernoBadge    } from "./InfernoBadge";
export { default as FrostBadge      } from "./FrostBadge";
export { default as StormBadge      } from "./StormBadge";
export { default as TidalBadge      } from "./TidalBadge";
export { default as EarthBadge      } from "./EarthBadge";
export { default as GalaxyBadge     } from "./GalaxyBadge";
export { default as NovaBadge       } from "./NovaBadge";
export { default as SolarBadge      } from "./SolarBadge";
export { default as LunarBadge      } from "./LunarBadge";
export { default as VoidBadge       } from "./VoidBadge";
export { default as ShadowBadge     } from "./ShadowBadge";
export { default as AngelBadge      } from "./AngelBadge";
export { default as DivineBadge     } from "./DivineBadge";
export { default as TechBadge       } from "./TechBadge";
export { default as NeonBadge       } from "./NeonBadge";
export { default as GoldBadge       } from "./GoldBadge";
export { default as RubyBadge       } from "./RubyBadge";
export { default as ObsidianBadge   } from "./ObsidianBadge";
export { default as DemonBadge      } from "./DemonBadge";
export { default as SkullBadge      } from "./SkullBadge";
export { default as WindBadge       } from "./WindBadge";
export { default as MatrixBadge     } from "./MatrixBadge";
export { default as CosmicBadge     } from "./CosmicBadge";
export { default as CrystalHeraldBadge } from "./CrystalHeraldBadge";

import type { ComponentType } from "react";
import type { BadgeProps } from "./_shared";

/* ── Registry: effectType → large preview component ── */
export const BADGE_REGISTRY: Record<string, ComponentType<BadgeProps>> = {
  badge_amethyst:       require("./AmethystBadge").default,
  badge_phoenix:        require("./PhoenixBadge").default,
  badge_dragon:         require("./DragonBadge").default,
  badge_royal:          require("./RoyalBadge").default,
  badge_warrior:        require("./WarriorBadge").default,
  badge_azure:          require("./AzureBadge").default,
  badge_inferno:        require("./InfernoBadge").default,
  badge_frost:          require("./FrostBadge").default,
  badge_storm:          require("./StormBadge").default,
  badge_tidal:          require("./TidalBadge").default,
  badge_earth:          require("./EarthBadge").default,
  badge_galaxy:         require("./GalaxyBadge").default,
  badge_nova:           require("./NovaBadge").default,
  badge_solar:          require("./SolarBadge").default,
  badge_lunar:          require("./LunarBadge").default,
  badge_void:           require("./VoidBadge").default,
  badge_shadow:         require("./ShadowBadge").default,
  badge_angel:          require("./AngelBadge").default,
  badge_divine:         require("./DivineBadge").default,
  badge_tech:           require("./TechBadge").default,
  badge_neon:           require("./NeonBadge").default,
  badge_gold:           require("./GoldBadge").default,
  badge_ruby:           require("./RubyBadge").default,
  badge_obsidian:       require("./ObsidianBadge").default,
  badge_demon:          require("./DemonBadge").default,
  badge_skull:          require("./SkullBadge").default,
  badge_wind:           require("./WindBadge").default,
  badge_matrix:         require("./MatrixBadge").default,
  badge_cosmic:         require("./CosmicBadge").default,
  badge_crystal_herald: require("./CrystalHeraldBadge").default,
};
