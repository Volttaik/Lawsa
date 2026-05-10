export { default as SovereignBadge } from "./SovereignBadge";

import type { ComponentType } from "react";
import type { BadgeProps } from "./_shared";

export const BADGE_REGISTRY: Record<string, ComponentType<BadgeProps>> = {
  badge_sovereign: require("./SovereignBadge").default,
};
