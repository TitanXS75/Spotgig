import type { Project, ProjectRequirements, ProjectDifficulty, LocationPreference, CompensationType } from '@/lib/db-types';
import type { Profile } from '@/lib/api/profiles';

export type CopilotRole = 'project_owner' | 'developer' | 'admin';

export type CopilotContextType =
  | 'general'
  | 'post_project'
  | 'edit_project'
  | 'project_detail'
  | 'developer_profile'
  | 'workspace'
  | 'discovery'
  | 'request_modal';

export type CopilotIntent =
  | 'GENERATE_PROJECT'
  | 'IMPROVE_PROJECT'
  | 'ASK_ABOUT_PROJECT'
  | 'EXPLAIN_PROJECT'
  | 'EVALUATE_FIT'
  | 'SUGGEST_OWNER_QUESTIONS'
  | 'IMPROVE_PROPOSAL'
  | 'IMPROVE_PROFILE'
  | 'FIND_PROJECTS'
  | 'SUMMARIZE_REQUIREMENTS'
  | 'GENERATE_TASKS'
  | 'GENERAL_ASSIST';

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  intent?: CopilotIntent;
  metadata?: Record<string, unknown>;
  structuredData?:
    | { type: 'project_draft'; data: GeneratedProjectDraft }
    | { type: 'project_improvement'; data: ProjectImprovementFeedback }
    | { type: 'developer_explanation'; data: DeveloperExplanation }
    | { type: 'developer_fit'; data: DeveloperFitAssessment }
    | { type: 'clarification_questions'; data: DeveloperClarificationSuggestions }
    | { type: 'proposal_draft'; data: ProposalDraft }
    | { type: 'profile_improvement'; data: ProfileImprovementSuggestions }
    | { type: 'workspace_tasks'; data: WorkspaceTaskSuggestion }
    | { type: 'discovery_results'; data: DiscoverySearchSuggestion };
}

export interface CopilotContext {
  type: CopilotContextType;
  userRole: CopilotRole;
  userProfile?: Profile | null;
  project?: Partial<Project> | null;
  requirements?: Partial<ProjectRequirements> | null;
  isOwner?: boolean;
  hasPrivateAccess?: boolean;
  matchScore?: number;
  trustScore?: number;
  initialPrompt?: string;
  currentDraft?: Partial<GeneratedProjectDraft>;
  metadata?: Record<string, unknown>;
}

// ── Structured Output Models ───────────────────────────────

export interface GeneratedProjectDraft {
  title: string;
  short_summary: string;
  industry: string;
  project_type: string;
  difficulty: ProjectDifficulty;
  duration: string;
  team_size: number;
  location_type: LocationPreference;
  compensation_type: CompensationType;
  compensation_amount?: string;
  required_skills: string[];
  technologies: string[];
  public_features: string[];
  public_description: string;
  private_requirements: {
    objective: string;
    user_roles: string[];
    functional_requirements: string[];
    workflows: string[];
    deliverables: string[];
    acceptance_criteria: string[];
    constraints?: string[];
  };
  clarifying_questions?: string[];
  sensitive_warnings?: string[];
}

export interface ProjectImprovementFeedback {
  qualityScore: number;
  strengths: string[];
  missingItems: string[];
  ambiguousItems: string[];
  publicPrivateAdvisories: string[];
  suggestions: string[];
}

export interface DeveloperExplanation {
  simpleExplanation: string;
  businessGoal: string;
  whatYouWillBuild: string[];
  expectedResponsibilities: string[];
  requiredSkills: string[];
  technologies: string[];
  difficulty: string;
  expectedCommitment: string;
  potentialChallenges: string[];
  portfolioValue: string;
}

export interface DeveloperFitAssessment {
  recommendation: 'Good Fit' | 'Possible Fit' | 'Weak Fit';
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  why: string[];
  learningGaps: string[];
  difficultyAssessment: string;
  guidance: string;
}

export interface DeveloperClarificationSuggestions {
  questions: Array<{
    category: string;
    question: string;
    reason: string;
  }>;
}

export interface ProposalDraft {
  proposalText: string;
  highlightedProfileSkills: string[];
  relevantPortfolioSignals: string[];
  advisoryNotes: string[];
}

export interface ProfileImprovementSuggestions {
  headlineSuggestions: string[];
  bioImprovements: string;
  skillGroupingRecommendations: string[];
  missingVerifiedSignals: string[];
  readinessChecklist: string[];
}

export interface WorkspaceTaskSuggestion {
  phases: Array<{
    phaseName: string;
    tasks: Array<{
      title: string;
      description: string;
      status: 'todo' | 'in_progress' | 'completed';
    }>;
  }>;
}

export interface DiscoverySearchSuggestion {
  searchQuery: string;
  recommendedDifficulty?: ProjectDifficulty;
  recommendedIndustry?: string;
  recommendedCompensation?: CompensationType;
  rationale: string;
}
