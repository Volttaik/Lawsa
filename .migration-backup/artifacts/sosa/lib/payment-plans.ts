export const PLANS = {
  verified_badge: { name: "Verified Badge", amount: 250000, description: "Get a blue verified checkmark on your profile" },
  profile_boost: { name: "Profile Boost (30 days)", amount: 150000, description: "Be featured in suggestions for 30 days" },
  premium_theme: { name: "Premium Theme", amount: 100000, description: "Unlock gold/purple profile border & theme" },
  post_boost: { name: "Post Boost", amount: 50000, description: "Boost a post for maximum visibility" },
};

export type PlanId = keyof typeof PLANS;
