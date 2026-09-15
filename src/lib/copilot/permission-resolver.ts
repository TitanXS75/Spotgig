import type { Project, ProjectRequirements } from '@/lib/db-types';
import type { CopilotContext } from './types';

/**
 * Enforces the core product principle: "Public Discovery, Private Requirements".
 * Evaluates whether the user is authorized to receive private requirements,
 * deliverables, confidential notes, or internal schemas.
 */
export function resolveCopilotAccess(
  userId: string | undefined | null,
  project: Partial<Project> | null | undefined,
  hasExplicitAccess: boolean = false
): {
  isOwner: boolean;
  hasPrivateAccess: boolean;
  canAccessWorkspace: boolean;
} {
  if (!project || !userId) {
    return {
      isOwner: false,
      hasPrivateAccess: false,
      canAccessWorkspace: false,
    };
  }

  const isOwner = Boolean(project.owner_id && project.owner_id === userId);
  const hasPrivateAccess = isOwner || hasExplicitAccess;

  return {
    isOwner,
    hasPrivateAccess,
    canAccessWorkspace: hasPrivateAccess,
  };
}

/**
 * Sanitizes project & requirements context so unapproved developers NEVER receive
 * private specifications, credentials, or internal schemas in prompts or assistant context.
 */
export function sanitizeContextForPermission(context: CopilotContext): CopilotContext {
  const isOwner = Boolean(
    context.userProfile?.id &&
    context.project?.owner_id &&
    context.userProfile.id === context.project.owner_id
  );

  const hasPrivateAccess = Boolean(context.hasPrivateAccess || isOwner);

  // If user does not have private access, strictly scrub all private fields
  if (!hasPrivateAccess) {
    const safeProject: Partial<Project> = { ...context.project };
    delete (safeProject as Record<string, unknown>).confidential_specs;
    delete (safeProject as Record<string, unknown>).confidential_notes;
    delete (safeProject as Record<string, unknown>).detailed_requirements;
    delete (safeProject as Record<string, unknown>).credentials;

    return {
      ...context,
      isOwner: false,
      hasPrivateAccess: false,
      project: safeProject,
      requirements: null, // Scrub private requirements table data
    };
  }

  return {
    ...context,
    isOwner,
    hasPrivateAccess: true,
  };
}
