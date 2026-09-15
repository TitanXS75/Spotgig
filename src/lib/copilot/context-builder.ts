import type { Project, ProjectRequirements } from '@/lib/db-types';
import type { Profile } from '@/lib/api/profiles';
import type { CopilotContext, CopilotContextType, CopilotRole } from './types';
import { sanitizeContextForPermission } from './permission-resolver';
import { calculateProjectMatch } from '@/lib/mediator/project-matcher';
import { evaluateDeveloperTrust, evaluateOwnerTrust } from '@/lib/mediator/trust-verifier';

interface BuildContextOptions {
  type: CopilotContextType;
  userRole?: CopilotRole;
  userProfile?: Profile | null;
  project?: Partial<Project> | null;
  requirements?: Partial<ProjectRequirements> | null;
  hasPrivateAccess?: boolean;
  initialPrompt?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Builds a sanitized, permission-aware CopilotContext payload.
 */
export function buildCopilotContext(options: BuildContextOptions): CopilotContext {
  const userRole: CopilotRole = options.userRole || 
    (options.userProfile?.role === 'project_owner' ? 'project_owner' : 'developer');

  // Compute mediator trust score
  let trustScore = 70;
  if (options.userProfile) {
    if (userRole === 'developer') {
      trustScore = evaluateDeveloperTrust(options.userProfile).trustScore;
    } else {
      trustScore = evaluateOwnerTrust(options.userProfile).trustScore;
    }
  }

  // Compute mediator project match score if developer and project are present
  let matchScore: number | undefined;
  if (options.project && options.userProfile && userRole === 'developer') {
    const match = calculateProjectMatch(options.project, options.userProfile);
    matchScore = match.matchScore;
  }

  const rawContext: CopilotContext = {
    type: options.type,
    userRole,
    userProfile: options.userProfile,
    project: options.project,
    requirements: options.requirements,
    hasPrivateAccess: options.hasPrivateAccess,
    trustScore,
    matchScore,
    initialPrompt: options.initialPrompt,
    metadata: options.metadata,
  };

  // Enforce strict public vs private permission boundary
  return sanitizeContextForPermission(rawContext);
}
