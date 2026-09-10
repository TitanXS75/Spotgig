/**
 * Mediator Automation Layer: Automated Project-Developer Match Engine
 * Calculates intelligent match percentages and reasoning between developers and projects.
 * Enforces Section 24 of update.txt.
 */

export interface ProjectMatchResult {
  matchScore: number; // 0 to 100
  isStrongMatch: boolean;
  matchingSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  reasons: string[];
  highlights: string[];
  levelCompatibility: boolean;
}

export function calculateProjectMatch(
  arg1: any,
  arg2: any
): ProjectMatchResult {
  if (!arg1 || !arg2) {
    return {
      matchScore: 0,
      isStrongMatch: false,
      matchingSkills: [],
      matchedSkills: [],
      missingSkills: [],
      reasons: [],
      highlights: [],
      levelCompatibility: false,
    };
  }

  // Detect which arg is project and which is developer
  const isArg1Project = 'difficulty' in arg1 || 'public_summary' in arg1 || 'owner_id' in arg1 || ('required_skills' in arg1 && !('experience_level' in arg1));
  const project = isArg1Project ? arg1 : arg2;
  const developer = isArg1Project ? arg2 : arg1;

  const devSkills = [
    ...(developer.skills || []),
    ...(developer.technologies || []),
  ].map((s: string) => s.toLowerCase().trim());

  const projSkills = [
    ...(project.required_skills || []),
    ...(project.technologies || []),
  ].map((s: string) => s.toLowerCase().trim());

  if (projSkills.length === 0 || devSkills.length === 0) {
    return {
      matchScore: 30,
      isStrongMatch: false,
      matchingSkills: [],
      matchedSkills: [],
      missingSkills: project.required_skills || [],
      reasons: ['Add more skills to your profile to receive precise match scores.'],
      highlights: ['Add more skills to your profile to receive precise match scores.'],
      levelCompatibility: false,
    };
  }

  const matchingSkills: string[] = [];
  const missingSkills: string[] = [];
  const reasons: string[] = [];

  // 1. Skill Overlap Calculation (up to 70 points)
  for (const rawSkill of project.required_skills || []) {
    const skillNorm = rawSkill.toLowerCase().trim();
    if (devSkills.some((ds: string) => ds.includes(skillNorm) || skillNorm.includes(ds))) {
      matchingSkills.push(rawSkill);
      reasons.push(`${rawSkill} ✓`);
    } else {
      missingSkills.push(rawSkill);
    }
  }

  const skillMatchRatio = project.required_skills && project.required_skills.length > 0
    ? matchingSkills.length / project.required_skills.length
    : 0.5;

  let score = Math.round(skillMatchRatio * 70);

  // 2. Experience Level Compatibility (up to 30 points)
  const devLevel = developer.experience_level || 'beginner';
  const projLevel = project.difficulty || 'intermediate';

  let levelMatch = false;
  if (devLevel === projLevel) {
    levelMatch = true;
    score += 30;
    reasons.push(`Aligned ${projLevel} difficulty level ✓`);
  } else if (
    (devLevel === 'intermediate' && projLevel === 'beginner') ||
    (devLevel === 'advanced' && (projLevel === 'intermediate' || projLevel === 'beginner'))
  ) {
    levelMatch = true;
    score += 25;
    reasons.push(`Experience level exceeds requirement ✓`);
  } else if (devLevel === 'beginner' && projLevel === 'intermediate') {
    score += 15;
    reasons.push('Great growth opportunity for emerging developers');
  } else {
    score += 10;
  }

  const finalScore = Math.min(99, Math.max(10, score));
  const isStrongMatch = finalScore >= 75;

  return {
    matchScore: finalScore,
    isStrongMatch,
    matchingSkills,
    matchedSkills: matchingSkills,
    missingSkills,
    reasons,
    highlights: reasons,
    levelCompatibility: levelMatch,
  };
}
