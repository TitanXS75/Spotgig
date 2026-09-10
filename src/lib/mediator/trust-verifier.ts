/**
 * Mediator Automation Layer: Trust & Verification Engine
 * Evaluates profile signals to calculate trust scores and verification badges.
 * Enforces Sections 21, 22, and 23 of update.txt.
 */

export interface TrustEvaluation {
  trustScore: number; // 0 to 100
  level: 'verified' | 'active' | 'building';
  badgeText: string;
  isVerified: boolean;
  verifiedSignals: string[];
  missingChecklist: string[];
}

export function evaluateDeveloperTrust(profile: {
  full_name?: string | null;
  headline?: string | null;
  bio?: string | null;
  education?: string | null;
  github_url?: string | null;
  portfolio_url?: string | null;
  skills?: string[] | null;
  completedProjectsCount?: number;
  averageRating?: number | null;
}): TrustEvaluation {
  let score = 0;
  const verifiedSignals: string[] = [];
  const missingChecklist: string[] = [];

  // 1. Basic Identity & Headline (+20)
  if (profile.full_name && profile.full_name.trim().length >= 3) {
    score += 10;
    verifiedSignals.push('Confirmed Identity Name');
  } else {
    missingChecklist.push('Add your full name');
  }

  if (profile.headline && profile.headline.trim().length >= 5) {
    score += 10;
  } else {
    missingChecklist.push('Add a professional headline');
  }

  // 2. Institutional Education (+20)
  if (profile.education && profile.education.trim().length >= 5) {
    score += 20;
    verifiedSignals.push('Verified College / Education');
  } else {
    missingChecklist.push('Add your college or degree details');
  }

  // 3. GitHub Profile (+25)
  if (profile.github_url && (profile.github_url.includes('github.com') || profile.github_url.trim().length > 3)) {
    score += 25;
    verifiedSignals.push('Linked GitHub Profile');
  } else {
    missingChecklist.push('Link your GitHub profile');
  }

  // 4. Portfolio Website (+15)
  if (profile.portfolio_url && profile.portfolio_url.trim().length > 4) {
    score += 15;
    verifiedSignals.push('Verified Portfolio Site');
  } else {
    missingChecklist.push('Add your personal portfolio link');
  }

  // 5. Technical Skills (+10)
  if (profile.skills && profile.skills.length >= 3) {
    score += 10;
    verifiedSignals.push(`${profile.skills.length} Technical Skills`);
  } else {
    missingChecklist.push('List at least 3 technical skills');
  }

  // Bonus for Completed Projects & High Ratings
  if ((profile.completedProjectsCount || 0) > 0) {
    score = Math.min(100, score + 10);
    verifiedSignals.push(`${profile.completedProjectsCount} Completed Projects`);
  }

  if (profile.averageRating && profile.averageRating >= 4.5) {
    score = Math.min(100, score + 10);
    verifiedSignals.push(`⭐ ${profile.averageRating} High Rating`);
  }

  const finalScore = Math.min(100, score);
  let level: TrustEvaluation['level'] = 'building';
  let badgeText = 'New Developer Profile';

  if (finalScore >= 80) {
    level = 'verified';
    badgeText = 'Verified Student Developer';
  } else if (finalScore >= 50) {
    level = 'active';
    badgeText = 'Active Developer';
  }

  return {
    trustScore: finalScore,
    level,
    badgeText,
    isVerified: level === 'verified',
    verifiedSignals,
    missingChecklist,
  };
}

export function evaluateOwnerTrust(profile: {
  full_name?: string | null;
  organization?: string | null;
  headline?: string | null;
  bio?: string | null;
  projectsPostedCount?: number;
}): TrustEvaluation {
  let score = 0;
  const verifiedSignals: string[] = [];
  const missingChecklist: string[] = [];

  if (profile.full_name && profile.full_name.trim().length >= 3) {
    score += 20;
    verifiedSignals.push('Confirmed Owner Profile');
  }

  if (profile.organization && profile.organization.trim().length >= 3) {
    score += 35;
    verifiedSignals.push('Verified Business / Practice');
  } else {
    missingChecklist.push('Add your organization or firm name');
  }

  if (profile.headline && profile.headline.trim().length >= 5) {
    score += 20;
  }

  if (profile.bio && profile.bio.trim().length >= 20) {
    score += 15;
    verifiedSignals.push('Completed Organization Bio');
  }

  if ((profile.projectsPostedCount || 0) > 0) {
    score += 10;
    verifiedSignals.push('Active Project Listing');
  }

  const finalScore = Math.min(100, score);
  let level: TrustEvaluation['level'] = 'building';
  let badgeText = 'New Project Owner';

  if (finalScore >= 75) {
    level = 'verified';
    badgeText = 'Verified Project Owner';
  } else if (finalScore >= 45) {
    level = 'active';
    badgeText = 'Active Project Owner';
  }

  return {
    trustScore: finalScore,
    level,
    badgeText,
    isVerified: level === 'verified',
    verifiedSignals,
    missingChecklist,
  };
}
