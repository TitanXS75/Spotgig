/**
 * Mediator Automation Layer: Project Requirement Validation
 * Evaluates project quality, technical relevance, scope completeness, and feasibility.
 * Enforces Sections 20.1 & 20.2 of update.txt.
 */

export interface RequirementValidationResult {
  score: number; // 0 to 100
  qualityScore: number;
  status: 'approved' | 'suggestions' | 'needs_review';
  isFeasible: boolean;
  isSoftwareProject: boolean;
  strengths: string[];
  issues: string[];
  criticalIssues: string[];
  suggestions: string[];
  suggestedTags: string[];
}

const TECH_KEYWORDS = [
  'app', 'application', 'web', 'mobile', 'website', 'software', 'api', 
  'database', 'frontend', 'backend', 'fullstack', 'react', 'python', 
  'node', 'typescript', 'javascript', 'sql', 'postgres', 'ai', 'ml', 
  'automation', 'dashboard', 'cloud', 'system', 'platform', 'tool', 
  'portal', 'crm', 'ui', 'ux', 'flutter', 'integration', 'data', 'apk', 'rest'
];

const NON_SOFTWARE_KEYWORDS = [
  'food deliver', 'delivery boy', 'driving', 'motorcycle', 'courier', 
  'moving furniture', 'cleaning', 'gardening', 'physical labour', 'cook', 'waiter'
];

const CATEGORY_TAG_MAP: Record<string, string[]> = {
  healthcare: ['HIPAA / Privacy', 'Patient Portal', 'Clinic Scheduling', 'Telemedicine'],
  retail: ['Inventory Tracking', 'POS System', 'E-commerce', 'Order Management'],
  legal: ['Document Management', 'Client Intake', 'Case Tracking', 'Contract Automation'],
  edtech: ['LMS', 'Quiz Engine', 'Student Portal', 'Video Streaming'],
  finance: ['Budgeting', 'Invoice Generator', 'Payment Gateway', 'Accounting'],
};

export function validateProjectRequirements(project: {
  title?: string;
  category?: string;
  industry?: string;
  projectType?: string;
  project_type?: string;
  publicSummary?: string;
  public_summary?: string;
  requiredSkills?: string[];
  required_skills?: string[];
  detailedRequirements?: string;
  confidential_specs?: string;
  deliverables?: string;
}): RequirementValidationResult {
  let score = 100;
  const strengths: string[] = [];
  const issues: string[] = [];
  const criticalIssues: string[] = [];
  const suggestions: string[] = [];
  const suggestedTags: string[] = [];

  const title = project.title || '';
  const publicSummary = project.publicSummary || project.public_summary || '';
  const requiredSkills = project.requiredSkills || project.required_skills || [];
  const detailedRequirements = project.detailedRequirements || project.confidential_specs || project.deliverables || '';
  const industry = project.industry || '';
  const projectType = project.projectType || project.project_type || project.category || '';

  const combinedText = `${title} ${publicSummary} ${projectType} ${industry} ${detailedRequirements} ${requiredSkills.join(' ')}`.toLowerCase();

  // Non-software gig check
  const hasNonSoftwareKeyword = NON_SOFTWARE_KEYWORDS.some(k => combinedText.includes(k));
  const hasTechKeyword = TECH_KEYWORDS.some(k => combinedText.includes(k)) || requiredSkills.length > 0;
  const isSoftwareProject = hasTechKeyword && !hasNonSoftwareKeyword;

  // 1. Technical Relevance Check
  if (isSoftwareProject) {
    strengths.push('Technically relevant software project');
  } else {
    score -= 40;
    const msg = 'The listing does not appear to be a verified software or tech development project.';
    issues.push(msg);
    criticalIssues.push(msg);
    suggestions.push('Specify whether you need a website, web application, mobile app, or automation tool.');
  }

  // 2. Title Quality Check
  if (title.trim().length < 8) {
    score -= 15;
    issues.push('Project title is too brief.');
    suggestions.push('Provide a clear, specific title (e.g. "Inventory Management System for Retail Clinic").');
  } else {
    strengths.push('Concise and descriptive project title');
  }

  // 3. Public Summary Completeness
  if (publicSummary.trim().length < 40) {
    score -= 20;
    issues.push('Public summary is very short.');
    suggestions.push('Explain the business problem and desired outcome so developers understand the context.');
  } else {
    strengths.push('Informative public summary for developer discovery');
  }

  // 4. Required Skills Checklist
  if (!requiredSkills || requiredSkills.length === 0) {
    score -= 15;
    issues.push('No required technical skills specified.');
    suggestions.push('Add 2–4 key skills (e.g., React, TypeScript, Node.js, Python) to attract qualified candidates.');
  } else {
    strengths.push(`${requiredSkills.length} required skills defined`);
  }

  // 5. Private Requirements Check (if provided)
  if (detailedRequirements) {
    if (detailedRequirements.trim().length < 30) {
      score -= 10;
      issues.push('Private specifications are very minimal.');
      suggestions.push('Detail key workflows and deliverables to save time during developer onboarding.');
    } else {
      strengths.push('Detailed private requirements ready for approved developers');
    }
  }

  // 6. Tag Suggestions
  const industryKey = industry.toLowerCase();
  if (CATEGORY_TAG_MAP[industryKey]) {
    suggestedTags.push(...CATEGORY_TAG_MAP[industryKey]);
  }
  if (combinedText.includes('flutter')) suggestedTags.push('Flutter');
  if (combinedText.includes('mobile')) suggestedTags.push('Mobile App');
  if (combinedText.includes('supabase')) suggestedTags.push('Supabase');
  if (combinedText.includes('react')) suggestedTags.push('React');

  const finalScore = Math.max(10, Math.min(100, score));
  let status: RequirementValidationResult['status'] = 'approved';
  if (finalScore < 50 || !isSoftwareProject) {
    status = 'needs_review';
  } else if (finalScore < 80) {
    status = 'suggestions';
  }

  return {
    score: finalScore,
    qualityScore: finalScore,
    status,
    isFeasible: finalScore >= 50 && isSoftwareProject,
    isSoftwareProject,
    strengths,
    issues,
    criticalIssues,
    suggestions,
    suggestedTags: Array.from(new Set(suggestedTags)),
  };
}
