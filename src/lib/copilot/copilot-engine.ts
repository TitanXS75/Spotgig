import { supabase } from '@/lib/supabase';
import type {
  CopilotIntent,
  CopilotContext,
  CopilotMessage,
  GeneratedProjectDraft,
  ProjectImprovementFeedback,
  DeveloperExplanation,
  DeveloperFitAssessment,
  DeveloperClarificationSuggestions,
  ProposalDraft,
  ProfileImprovementSuggestions,
  WorkspaceTaskSuggestion,
  DiscoverySearchSuggestion,
} from './types';
import { calculateProjectMatch } from '@/lib/mediator/project-matcher';
import { scanForSensitiveInfo } from '@/lib/mediator/sensitive-info-detector';
import { validateProjectRequirements } from '@/lib/mediator/requirement-validator';
import { buildSystemPromptForIntent } from './prompt-templates';
import { sanitizeContextForPermission } from './permission-resolver';
import type { ProjectDifficulty, LocationPreference } from '@/lib/db-types';

/**
 * Main Copilot Engine dispatcher.
 * 1. Checks security and permission boundaries.
 * 2. Connects directly to live Gemini 3.7 Flash API when VITE_GEMINI_API_KEY is configured.
 * 3. Falls back smoothly to Edge Function and local deterministic intelligent engine.
 */
export async function executeCopilotIntent(
  intent: CopilotIntent,
  userInput: string,
  context: CopilotContext
): Promise<CopilotMessage> {
  const timestamp = new Date().toISOString();
  const messageId = `copilot-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // 1. Check if unapproved developer is asking for private/confidential info
  if (
    context.project &&
    !context.hasPrivateAccess &&
    !context.isOwner &&
    isQueryRequestingPrivateInfo(userInput)
  ) {
    return {
      id: messageId,
      sender: 'assistant',
      intent,
      timestamp,
      content:
        '🔒 **Protected Requirements Notice**\n\n' +
        'I can only provide information that is publicly available for this project. ' +
        'Detailed business processes, internal database structures, and confidential deliverables become available once the project owner approves your access request.',
    };
  }

  // 2. Direct Gemini 3.7 Flash Call (when VITE_GEMINI_API_KEY is present and not running in Vitest test runner)
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const isTestMode = import.meta.env.MODE === 'test';

  if (geminiKey && !isTestMode) {
    try {
      const geminiResult = await callGeminiDirect(intent, userInput, context, geminiKey);
      if (geminiResult?.reply) {
        return {
          id: messageId,
          sender: 'assistant',
          intent,
          timestamp,
          content: geminiResult.reply,
          structuredData: geminiResult.structuredData,
        };
      }
    } catch (err) {
      console.warn('Gemini 3.7 Flash call failed, falling back to local engine:', err);
    }
  }

  // 3. Attempt Edge Function call (if Supabase session and edge function deployed)
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      const { data, error } = await supabase.functions.invoke('copilot', {
        body: { intent, prompt: userInput, context },
      });

      if (!error && data?.reply && !data.fallback) {
        return {
          id: messageId,
          sender: 'assistant',
          intent,
          timestamp,
          content: data.reply,
        };
      }
    }
  } catch {
    // Edge function unavailable; proceed directly to high-fidelity local engine
  }

  // 4. High-fidelity client-side intelligent fallback engine
  return executeLocalCopilotEngine(intent, userInput, context, messageId, timestamp);
}

/**
 * Direct call to Google Gemini 3.7 Flash API
 */
async function callGeminiDirect(
  intent: CopilotIntent,
  userInput: string,
  context: CopilotContext,
  apiKey: string
): Promise<{ reply: string; structuredData?: CopilotMessage['structuredData'] } | null> {
  const sanitized = sanitizeContextForPermission(context);
  const systemPrompt = buildSystemPromptForIntent(intent, sanitized);

  let formattedPrompt = userInput;
  let expectsJson = false;

  if (intent === 'GENERATE_PROJECT') {
    expectsJson = true;
    formattedPrompt = `${userInput}

INSTRUCTION: Respond ONLY with a valid JSON object matching this exact schema (no preamble, no markdown backticks outside):
{
  "title": "Clear project title",
  "short_summary": "1-2 sentence overview of the project",
  "industry": "e.g. Health & Wellness, E-commerce, Food & Dining, Education, Real Estate, Local Business",
  "project_type": "Web Application" | "Mobile App" | "Landing Page" | "Full-Stack System",
  "difficulty": "beginner" | "intermediate" | "advanced",
  "duration": "e.g. 2-3 Weeks",
  "team_size": 1,
  "location_type": "remote" | "hybrid" | "on_site",
  "compensation_type": "paid" | "stipend" | "unpaid",
  "compensation_amount": "5000",
  "required_skills": ["Skill1", "Skill2", "Skill3"],
  "technologies": ["Tech1", "Tech2"],
  "public_features": ["Feature 1", "Feature 2", "Feature 3"],
  "public_description": "Clean, comprehensive public description for candidates",
  "private_requirements": {
    "objective": "Core business problem and objective",
    "user_roles": ["Role 1", "Role 2"],
    "functional_requirements": ["Functional item 1", "Functional item 2", "Functional item 3"],
    "workflows": ["Step 1", "Step 2"],
    "deliverables": ["Deliverable 1", "Deliverable 2", "Deliverable 3"],
    "acceptance_criteria": ["Criteria 1", "Criteria 2"]
  },
  "clarifying_questions": ["Question 1", "Question 2"]
}`;
  } else if (intent === 'IMPROVE_PROPOSAL') {
    const verifiedSkills = sanitized.userProfile?.skills?.join(', ') || 'Web Development';
    formattedPrompt = `Candidate proposal request: "${userInput}".
Developer's verified profile:
- Name: ${sanitized.userProfile?.full_name || 'Candidate'}
- Education: ${sanitized.userProfile?.education || 'Computer Science'}
- Verified Skills: ${verifiedSkills}
- Target Project: ${sanitized.project?.title || 'Target Project'}

ANTI-HALLUCINATION ENFORCEMENT:
Write a concise, professional proposal. You must ONLY mention skills and tools from: [${verifiedSkills}]. Do NOT claim unverified skills or invent past companies.`;
  }

  // Greeting discipline: only greet if user greeted or it's the first turn
  const lowerInput = userInput.trim().toLowerCase();
  const userGreeted =
    lowerInput.startsWith('hi') ||
    lowerInput.startsWith('hello') ||
    lowerInput.startsWith('hey') ||
    lowerInput.startsWith('greetings') ||
    lowerInput.startsWith('good morning') ||
    lowerInput.startsWith('good afternoon') ||
    lowerInput.startsWith('good evening');

  const isFirstTurn = context.metadata?.isFirstTurn === true || (context.metadata?.isFirstTurn === undefined && !context.metadata?.hasPreviousMessages);
  const allowGreeting = userGreeted || isFirstTurn;

  if (!allowGreeting) {
    formattedPrompt += `\n\nCONVERSATIONAL RULE: Do NOT include greetings, pleasantries, or self-introductions (such as "Hello! I am Aaspass Copilot..."). Directly answer the user's inquiry immediately.`;
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key=${apiKey}`;

  // Multi-model resilience cascade: start with verified active models, falling back if 503/429 occurs
  const CANDIDATE_MODELS = [
    'gemini-3.5-flash-lite',
    'gemini-3-flash-preview',
    'gemini-3.7-flash',
    'gemini-3.8-flash',
  ];

  let rawText = '';
  let lastError: Error | null = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(15000),
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `${systemPrompt}\n\nContext Metadata:\n${JSON.stringify({
                    userRole: sanitized.userRole,
                    projectTitle: sanitized.project?.title,
                    projectSummary: sanitized.project?.public_summary,
                    requiredSkills: sanitized.project?.required_skills,
                    matchScore: sanitized.matchScore,
                    hasPrivateAccess: sanitized.hasPrivateAccess,
                    verifiedSkills: sanitized.userProfile?.skills,
                  })}\n\nUser Input:\n${formattedPrompt}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: intent === 'GENERATE_PROJECT' ? 0.2 : 0.5,
            maxOutputTokens: 2048,
          },
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.warn(`[Aaspass Copilot] Model ${model} returned HTTP ${res.status}:`, errText.slice(0, 120));
        continue;
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      if (text) {
        rawText = !allowGreeting ? stripRepetitiveIntro(text) : text;
        break; // Successfully received response from candidate model
      }
    } catch (err: unknown) {
      lastError = err as Error;
      console.warn(`[Aaspass Copilot] Model ${model} attempt failed:`, (err as Error).message);
    }
  }

  if (!rawText) {
    throw lastError || new Error('All Gemini candidate models were unavailable or returned empty output.');
  }

  if (!allowGreeting) {
    rawText = stripRepetitiveIntro(rawText);
  }

  if (expectsJson && intent === 'GENERATE_PROJECT') {
    try {
      const startIdx = rawText.indexOf('{');
      const endIdx = rawText.lastIndexOf('}');
      if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
        throw new Error('No JSON object boundaries found in AI response');
      }

      const jsonStr = rawText.slice(startIdx, endIdx + 1);
      const parsed = JSON.parse(jsonStr);
      const fallbackDraft = generateProjectDraftFromIdea(userInput, context);

      const draft: GeneratedProjectDraft = {
        title: parsed.title || fallbackDraft.title,
        short_summary: parsed.short_summary || fallbackDraft.short_summary,
        industry: parsed.industry || fallbackDraft.industry,
        project_type: parsed.project_type || fallbackDraft.project_type,
        difficulty: (['beginner', 'intermediate', 'advanced'].includes(parsed.difficulty) ? parsed.difficulty : fallbackDraft.difficulty) as any,
        duration: parsed.duration || fallbackDraft.duration,
        team_size: typeof parsed.team_size === 'number' ? parsed.team_size : fallbackDraft.team_size,
        location_type: (parsed.location_type === 'hybrid' ? 'hybrid' : (parsed.location_type === 'on_site' || parsed.location_type === 'on_premise' || parsed.location_type === 'onsite') ? 'on_site' : 'remote') as LocationPreference,
        compensation_type: (parsed.compensation_type === 'stipend' ? 'stipend' : parsed.compensation_type === 'unpaid' ? 'unpaid' : 'paid') as CompensationType,
        compensation_amount: parsed.compensation_amount ? String(parsed.compensation_amount).replace(/[^0-9.]/g, '') || fallbackDraft.compensation_amount : fallbackDraft.compensation_amount,
        required_skills: Array.isArray(parsed.required_skills) && parsed.required_skills.length > 0 ? parsed.required_skills : fallbackDraft.required_skills,
        technologies: Array.isArray(parsed.technologies) && parsed.technologies.length > 0 ? parsed.technologies : fallbackDraft.technologies,
        public_features: Array.isArray(parsed.public_features) && parsed.public_features.length > 0 ? parsed.public_features : fallbackDraft.public_features,
        public_description: parsed.public_description || fallbackDraft.public_description,
        private_requirements: {
          objective: parsed.private_requirements?.objective || fallbackDraft.private_requirements.objective,
          user_roles: Array.isArray(parsed.private_requirements?.user_roles) && parsed.private_requirements.user_roles.length > 0 ? parsed.private_requirements.user_roles : fallbackDraft.private_requirements.user_roles,
          functional_requirements: Array.isArray(parsed.private_requirements?.functional_requirements) && parsed.private_requirements.functional_requirements.length > 0 ? parsed.private_requirements.functional_requirements : fallbackDraft.private_requirements.functional_requirements,
          workflows: Array.isArray(parsed.private_requirements?.workflows) && parsed.private_requirements.workflows.length > 0 ? parsed.private_requirements.workflows : fallbackDraft.private_requirements.workflows,
          deliverables: Array.isArray(parsed.private_requirements?.deliverables) && parsed.private_requirements.deliverables.length > 0 ? parsed.private_requirements.deliverables : fallbackDraft.private_requirements.deliverables,
          acceptance_criteria: Array.isArray(parsed.private_requirements?.acceptance_criteria) && parsed.private_requirements.acceptance_criteria.length > 0 ? parsed.private_requirements.acceptance_criteria : fallbackDraft.private_requirements.acceptance_criteria,
          constraints: parsed.private_requirements?.constraints || [],
        },
        clarifying_questions: Array.isArray(parsed.clarifying_questions) && parsed.clarifying_questions.length > 0 ? parsed.clarifying_questions : fallbackDraft.clarifying_questions,
        sensitive_warnings: fallbackDraft.sensitive_warnings,
      };

      const summary = `✨ **I have analyzed your project idea with Gemini AI and created a structured specification.**\n\n` +
        `**Title:** ${draft.title}\n` +
        `**Summary:** ${draft.short_summary}\n` +
        `**Target Skills:** ${draft.required_skills.join(', ')}\n\n` +
        `I've separated the **Public Discovery** overview from your **Protected Private Requirements**. You can review, edit, or apply these details directly to your project form.`;

      return {
        reply: summary,
        structuredData: {
          type: 'project_draft',
          data: draft,
        },
      };
    } catch (parseErr) {
      console.warn('[Aaspass Copilot] Failed to parse Gemini JSON output, falling back to local schema parser:', parseErr);
    }
  }

  if (intent === 'IMPROVE_PROPOSAL') {
    const fallbackProposal = generateHonestProposal(userInput, context);
    return {
      reply: rawText,
      structuredData: {
        type: 'proposal_draft',
        data: {
          proposalText: rawText,
          highlightedProfileSkills: fallbackProposal.highlightedProfileSkills,
          relevantPortfolioSignals: fallbackProposal.relevantPortfolioSignals,
          advisoryNotes: [
            'Generated live with Gemini 3.7 Flash using your verified profile skills.',
            ...fallbackProposal.advisoryNotes,
          ],
        },
      },
    };
  }

  let structuredData: CopilotMessage['structuredData'] = undefined;
  if (intent === 'EXPLAIN_PROJECT') {
    structuredData = { type: 'developer_explanation', data: explainProjectForDeveloper(context) };
  } else if (intent === 'EVALUATE_FIT') {
    structuredData = { type: 'developer_fit', data: evaluateDeveloperProjectFit(context) };
  } else if (intent === 'IMPROVE_PROJECT') {
    structuredData = { type: 'project_improvement', data: analyzeProjectImprovements(context) };
  } else if (intent === 'SUGGEST_OWNER_QUESTIONS') {
    structuredData = { type: 'clarification_questions', data: generateClarificationQuestions(context) };
  } else if (intent === 'IMPROVE_PROFILE') {
    structuredData = { type: 'profile_improvement', data: generateProfileImprovements(context) };
  } else if (intent === 'GENERATE_TASKS') {
    structuredData = { type: 'workspace_tasks', data: generatePhasedTasks(context) };
  } else if (intent === 'FIND_PROJECTS') {
    structuredData = { type: 'discovery_results', data: parseDiscoveryIntent(userInput) };
  }

  return { reply: rawText, structuredData };
}

/**
 * Helper to detect queries probing for private requirements
 */
function isQueryRequestingPrivateInfo(query: string): boolean {
  const q = query.toLowerCase();
  return (
    q.includes('database structure') ||
    q.includes('database schema') ||
    q.includes('secret') ||
    q.includes('credential') ||
    q.includes('private requirement') ||
    q.includes('confidential') ||
    q.includes('internal workflow') ||
    q.includes('api key')
  );
}

/**
 * Intelligent deterministic Copilot engine running client-side.
 */
function executeLocalCopilotEngine(
  intent: CopilotIntent,
  userInput: string,
  context: CopilotContext,
  id: string,
  timestamp: string
): CopilotMessage {
  switch (intent) {
    case 'GENERATE_PROJECT': {
      const draft = generateProjectDraftFromIdea(userInput, context);
      const textSummary = `✨ **I have analyzed your project idea and created a structured specification.**\n\n` +
        `**Title:** ${draft.title}\n` +
        `**Summary:** ${draft.short_summary}\n` +
        `**Target Skills:** ${draft.required_skills.join(', ')}\n\n` +
        `I've separated the **Public Discovery** overview from your **Protected Private Requirements**. You can review, edit, or apply these details directly to your project form.`;

      return {
        id,
        sender: 'assistant',
        intent,
        timestamp,
        content: textSummary,
        structuredData: { type: 'project_draft', data: draft },
      };
    }

    case 'IMPROVE_PROJECT': {
      const feedback = analyzeProjectImprovements(context);
      const content = `📊 **Mediator & Copilot Project Analysis**\n\n` +
        `**Quality Score:** ${feedback.qualityScore}/100\n\n` +
        (feedback.missingItems.length > 0 
          ? `**Areas to Strengthen:**\n${feedback.missingItems.map(m => `• ${m}`).join('\n')}\n\n` 
          : '✅ Core requirements are well-defined!\n\n') +
        `**Recommendations:**\n${feedback.suggestions.map(s => `• ${s}`).join('\n')}`;

      return {
        id,
        sender: 'assistant',
        intent,
        timestamp,
        content,
        structuredData: { type: 'project_improvement', data: feedback },
      };
    }

    case 'EXPLAIN_PROJECT': {
      const explanation = explainProjectForDeveloper(context);
      const content = `### 💡 ${explanation.simpleExplanation}\n\n` +
        `**🎯 Business Goal:** ${explanation.businessGoal}\n\n` +
        `**🛠 What You Will Build:**\n${explanation.whatYouWillBuild.map(w => `• ${w}`).join('\n')}\n\n` +
        `**📌 Key Skills:** ${explanation.requiredSkills.join(', ')}\n` +
        `**⏳ Estimated Commitment:** ${explanation.expectedCommitment}\n` +
        `**🚀 Portfolio Value:** ${explanation.portfolioValue}`;

      return {
        id,
        sender: 'assistant',
        intent,
        timestamp,
        content,
        structuredData: { type: 'developer_explanation', data: explanation },
      };
    }

    case 'EVALUATE_FIT': {
      const fit = evaluateDeveloperProjectFit(context);
      const content = `### 🎯 Compatibility Assessment: **${fit.recommendation}** (${fit.matchScore}% Match)\n\n` +
        `**Why you're a match:**\n${fit.why.map(w => `• ${w}`).join('\n')}\n\n` +
        (fit.learningGaps.length > 0
          ? `**🌱 Growth / Learning Areas:**\n${fit.learningGaps.map(g => `• ${g}`).join('\n')}\n\n`
          : '') +
        `**Difficulty Check:** ${fit.difficultyAssessment}\n\n` +
        `**Recommendation:** ${fit.guidance}`;

      return {
        id,
        sender: 'assistant',
        intent,
        timestamp,
        content,
        structuredData: { type: 'developer_fit', data: fit },
      };
    }

    case 'SUGGEST_OWNER_QUESTIONS': {
      const suggestions = generateClarificationQuestions(context);
      const content = `### ❓ Recommended Questions for the Project Owner\n\n` +
        `Asking thoughtful questions shows professionalism and helps avoid scope surprises:\n\n` +
        suggestions.questions.map(q => `**[${q.category}]** ${q.question}\n*Why:* ${q.reason}`).join('\n\n');

      return {
        id,
        sender: 'assistant',
        intent,
        timestamp,
        content,
        structuredData: { type: 'clarification_questions', data: suggestions },
      };
    }

    case 'IMPROVE_PROPOSAL': {
      const proposal = generateHonestProposal(userInput, context);
      const content = `### ✨ Tailored Access Proposal\n\n` +
        `I have structured an authentic proposal pitch utilizing **only** the skills and signals verified on your profile:\n\n` +
        `> "${proposal.proposalText}"\n\n` +
        `**Referenced Verified Skills:** ${proposal.highlightedProfileSkills.join(', ') || 'General development stack'}\n\n` +
        `*Tip: You can copy this or apply it directly to your request message.*`;

      return {
        id,
        sender: 'assistant',
        intent,
        timestamp,
        content,
        structuredData: { type: 'proposal_draft', data: proposal },
      };
    }

    case 'IMPROVE_PROFILE': {
      const suggestions = generateProfileImprovements(context);
      const content = `### 🌟 Profile Enhancement Insights\n\n` +
        `**Headline Ideas:**\n${suggestions.headlineSuggestions.map(h => `• "${h}"`).join('\n')}\n\n` +
        `**Summary Advice:**\n${suggestions.bioImprovements}\n\n` +
        (suggestions.missingVerifiedSignals.length > 0
          ? `**Signals to Reach 'Verified' Status:**\n${suggestions.missingVerifiedSignals.map(s => `• ${s}`).join('\n')}\n\n`
          : '🎉 Great job! Your profile has strong verified trust signals.') +
        `**Action Checklist:**\n${suggestions.readinessChecklist.map(c => `• ${c}`).join('\n')}`;

      return {
        id,
        sender: 'assistant',
        intent,
        timestamp,
        content,
        structuredData: { type: 'profile_improvement', data: suggestions },
      };
    }

    case 'GENERATE_TASKS': {
      const tasks = generatePhasedTasks(context);
      const content = `### 📋 Phased Development Task Plan\n\n` +
        `I have structured the authorized requirements into four sequential milestones. You can add these directly to your project workspace task board:\n\n` +
        tasks.phases.map(p => `**${p.phaseName}:**\n${p.tasks.map(t => `• ${t.title} — *${t.description}*`).join('\n')}`).join('\n\n');

      return {
        id,
        sender: 'assistant',
        intent,
        timestamp,
        content,
        structuredData: { type: 'workspace_tasks', data: tasks },
      };
    }

    case 'FIND_PROJECTS': {
      const search = parseDiscoveryIntent(userInput);
      const content = `### 🔍 Discovery Search Recommendations\n\n` +
        `**Search Query:** \`${search.searchQuery}\`\n` +
        (search.recommendedDifficulty ? `**Difficulty Filter:** ${search.recommendedDifficulty}\n` : '') +
        (search.recommendedIndustry ? `**Industry Filter:** ${search.recommendedIndustry}\n` : '') +
        `\n**Search Strategy:** ${search.rationale}`;

      return {
        id,
        sender: 'assistant',
        intent,
        timestamp,
        content,
        structuredData: { type: 'discovery_results', data: search },
      };
    }

    default: {
      const reply = generateGeneralAssistantReply(userInput, context);
      return {
        id,
        sender: 'assistant',
        intent,
        timestamp,
        content: reply,
      };
    }
  }
}

// ─────────────────────────────────────────────────────────────
// Local Heuristic Generators
// ─────────────────────────────────────────────────────────────

function generateProjectDraftFromIdea(input: string, _context: CopilotContext): GeneratedProjectDraft {
  const lower = input.toLowerCase();
  let industry = 'Other Professional Service';
  let projectType = 'Web Application';
  let title = 'Custom Management Platform';
  let skills = ['React', 'Node.js', 'PostgreSQL', 'TypeScript'];
  let difficulty: ProjectDifficulty = 'intermediate';
  let userRoles = ['Customer / Client', 'Admin / Staff'];
  let publicFeatures = ['User authentication', 'Responsive interface', 'Dashboard analytics'];

  if (lower.includes('gym') || lower.includes('fitness') || lower.includes('workout') || lower.includes('trainer')) {
    industry = 'Hospitality & Food';
    projectType = 'Web Application';
    title = 'Gym Member & Trainer Booking Portal';
    skills = ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'];
    difficulty = 'intermediate';
    userRoles = ['Member / Athlete', 'Fitness Trainer', 'Gym Administrator'];
    publicFeatures = [
      'Trainer schedule & booking',
      'Workout & attendance tracking',
      'Class registration & automated reminders',
      'Staff administrative dashboard',
    ];
  } else if (lower.includes('restaurant') || lower.includes('food') || lower.includes('kitchen') || lower.includes('menu') || lower.includes('order')) {
    industry = 'Hospitality & Food';
    projectType = 'Web Application';
    title = 'Digital QR Menu & Kitchen Order System';
    skills = ['React', 'TypeScript', 'Node.js', 'WebSockets', 'PostgreSQL'];
    difficulty = 'intermediate';
    userRoles = ['Dine-in Customer', 'Kitchen Staff', 'Store Manager'];
    publicFeatures = [
      'QR code table menu viewing',
      'Real-time kitchen order queue',
      'Order status notifications',
      'Sales and inventory summary',
    ];
  } else if (lower.includes('coaching') || lower.includes('student') || lower.includes('course') || lower.includes('tutor') || lower.includes('class') || lower.includes('teacher')) {
    industry = 'Education & EdTech';
    projectType = 'Web Application';
    title = 'Student Course Enrollment & Study Portal';
    skills = ['React', 'Node.js', 'PostgreSQL', 'REST APIs'];
    difficulty = 'intermediate';
    userRoles = ['Student', 'Faculty / Teacher', 'Institute Admin'];
    publicFeatures = [
      'Course catalog and batch schedules',
      'Student registration & fee tracking',
      'Study notes & assignment downloads',
      'Class announcement system',
    ];
  } else if (lower.includes('clinic') || lower.includes('patient') || lower.includes('hospital') || lower.includes('doctor') || lower.includes('appointment')) {
    industry = 'Healthcare & Medicine';
    projectType = 'Web Application';
    title = 'Clinic Patient Queue & Appointment System';
    skills = ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Security / Privacy'];
    difficulty = 'intermediate';
    userRoles = ['Patient', 'Receptionist', 'Consulting Doctor'];
    publicFeatures = [
      'Online appointment slot reservation',
      'Live waiting queue tracker',
      'Patient consultation history log',
      'SMS/Email confirmation alerts',
    ];
  } else if (lower.includes('store') || lower.includes('shop') || lower.includes('retail') || lower.includes('ecommerce') || lower.includes('inventory')) {
    industry = 'Retail & Commerce';
    projectType = 'E-Commerce / Store';
    title = 'Retail Inventory & Order Management System';
    skills = ['React', 'Node.js', 'PostgreSQL', 'Tailwind CSS'];
    difficulty = 'intermediate';
    userRoles = ['Shopper', 'Inventory Clerk', 'Store Owner'];
    publicFeatures = [
      'Product catalog with search and filters',
      'Stock level monitoring & low inventory alerts',
      'Customer order processing',
      'Revenue and sales analytics',
    ];
  }

  // Scan input for leaks
  const leakScan = scanForSensitiveInfo(input);

  const shortSummary = `A modern ${projectType.toLowerCase()} designed for ${industry.toLowerCase()} operations, featuring ${publicFeatures.slice(0, 2).join(' and ')}.`;

  const publicDescription = `We are seeking an emerging developer or student team to build a ${title}. ` +
    `The platform requires an intuitive user interface and a robust backend. ` +
    `Key highlights include ${publicFeatures.join(', ')}. ` +
    `Detailed technical workflows, data models, and acceptance criteria are documented in the protected requirements.`;

  const privateRequirements = {
    objective: `Deliver a fully functioning, secure ${title} meeting the operational requirements of the business.`,
    user_roles: userRoles,
    functional_requirements: [
      `User authentication & role-based permissions (${userRoles.join(', ')}).`,
      ...publicFeatures.map(f => `Core implementation of ${f}.`),
      'Exportable reporting and activity auditing.',
    ],
    workflows: [
      `1. Onboarding: ${userRoles[0]} registers and configures their account.`,
      `2. Main Loop: System processes transactions and updates the shared dashboard in real time.`,
      `3. Oversight: Administrator reviews metrics and exports data reports.`,
    ],
    deliverables: [
      '1. Responsive frontend application built with React/TypeScript.',
      '2. Documented backend REST or GraphQL API endpoints.',
      '3. PostgreSQL database schema migration scripts.',
      '4. Setup README with local run instructions.',
    ],
    acceptance_criteria: [
      'All user workflows complete without unhandled runtime exceptions.',
      'Responsive design across desktop and mobile screens.',
      'Protected endpoints require valid session authorization.',
      'Code is cleanly commented and submitted via GitHub repository.',
    ],
  };

  const clarifyingQuestions = [
    'Should customers be able to pay through the platform (e.g. Razorpay/UPI) or offline?',
    'Will you need user authentication via phone OTP or standard email and password?',
    'Should the application be optimized primarily for mobile browsers or desktop management?',
  ];

  return {
    title,
    short_summary: shortSummary,
    industry,
    project_type: projectType,
    difficulty,
    duration: '2–4 Weeks',
    team_size: 1,
    location_type: 'remote' as LocationPreference,
    compensation_type: 'paid',
    compensation_amount: '8000',
    required_skills: skills,
    technologies: skills,
    public_features: publicFeatures,
    public_description: publicDescription,
    private_requirements: privateRequirements,
    clarifying_questions: clarifyingQuestions,
    sensitive_warnings: leakScan.hasLeak ? leakScan.leaks.map(l => l.message) : [],
  };
}

function analyzeProjectImprovements(context: CopilotContext): ProjectImprovementFeedback {
  const p = context.project || {};
  const validation = validateProjectRequirements({
    title: p.title,
    publicSummary: p.public_summary,
    requiredSkills: p.required_skills,
    detailedRequirements: context.requirements?.detailed_requirements,
    industry: p.industry,
  });

  const missingItems: string[] = [];
  const ambiguousItems: string[] = [];
  const advisories: string[] = [];

  if (!p.title || p.title.length < 10) {
    missingItems.push('Project title could be more descriptive.');
  }
  if (!p.public_summary || p.public_summary.length < 50) {
    missingItems.push('Public summary is brief. Elaborate on the business problem.');
  }
  if (!p.required_skills || p.required_skills.length < 3) {
    missingItems.push('Specify at least 3 target technical skills (e.g. React, Node.js).');
  }
  if (!context.requirements?.detailed_requirements) {
    missingItems.push('Add private requirements & deliverables for approved candidates.');
  }

  // Scan public summary for leaks
  if (p.public_summary) {
    const leakCheck = scanForSensitiveInfo(p.public_summary);
    if (leakCheck.hasLeak) {
      advisories.push('Public summary contains potential contact numbers or credentials. Keep them in private specs.');
    }
  }

  return {
    qualityScore: validation.score,
    strengths: validation.strengths,
    missingItems,
    ambiguousItems,
    publicPrivateAdvisories: advisories,
    suggestions: validation.suggestions.length > 0 ? validation.suggestions : [
      'Define clear deliverables (e.g. GitHub repo, live demo).',
      'Mention preferred timeline and communication expectations.',
    ],
  };
}

function explainProjectForDeveloper(context: CopilotContext): DeveloperExplanation {
  const p = context.project || {};
  const skills = p.required_skills || ['Web Development'];
  const industry = p.industry || 'Technology';

  return {
    simpleExplanation: `A real-world ${p.project_type || 'software'} project solving challenges in ${industry}.`,
    businessGoal: p.public_summary || 'Build a functional, user-friendly tool to streamline business operations.',
    whatYouWillBuild: [
      'Interactive frontend interface matching responsive design standards.',
      'API routing & database models to persist application state.',
      'Input validation, error states, and session management.',
    ],
    expectedResponsibilities: [
      'Translate functional specifications into clean, modular code.',
      'Maintain communication with the project owner in the workspace discussion.',
      'Submit source code via GitHub with clear setup documentation.',
    ],
    requiredSkills: skills,
    technologies: p.technologies && p.technologies.length > 0 ? p.technologies : skills,
    difficulty: p.difficulty || 'Intermediate',
    expectedCommitment: `${p.duration || '2–4 weeks'} (~10–15 hours per week)`,
    potentialChallenges: [
      'Translating non-technical business expectations into technical architecture.',
      'Handling edge cases in user inputs and async operations.',
    ],
    portfolioValue: `High — gives you a tangible ${industry} product deployment to showcase on your resume and GitHub.`,
  };
}

function evaluateDeveloperProjectFit(context: CopilotContext): DeveloperFitAssessment {
  const p = context.project || {};
  const dev = context.userProfile || {};
  const matchResult = calculateProjectMatch(p, dev);

  const matchedSkills = matchResult.matchedSkills;
  const missingSkills = matchResult.missingSkills;

  let recommendation: DeveloperFitAssessment['recommendation'] = 'Possible Fit';
  let guidance = 'You have a solid foundation. Be prepared to pick up complementary tools as you build.';

  if (matchResult.matchScore >= 75) {
    recommendation = 'Good Fit';
    guidance = 'Your skillset aligns strongly with this project! Submit a confident, professional proposal.';
  } else if (matchResult.matchScore < 45) {
    recommendation = 'Weak Fit';
    guidance = 'This project calls for several skills outside your current stack. Consider starting with beginner gigs or brushing up on the required tools.';
  }

  return {
    recommendation,
    matchScore: matchResult.matchScore,
    matchingSkills: matchedSkills,
    missingSkills: missingSkills,
    why: matchedSkills.length > 0
      ? matchedSkills.map(s => `You have demonstrated skills in ${s}.`)
      : ['You have foundational programming capabilities.'],
    learningGaps: missingSkills.map(s => `Familiarity with ${s}`),
    difficultyAssessment: `Project is rated '${p.difficulty || 'intermediate'}', matching your current level.`,
    guidance,
  };
}

function generateClarificationQuestions(context: CopilotContext): DeveloperClarificationSuggestions {
  const p = context.project || {};

  return {
    questions: [
      {
        category: 'Scope & Deliverables',
        question: `Are wireframes, design mockups, or brand guidelines already prepared for this project?`,
        reason: 'Helps you understand if you are building the UI from scratch or implementing an existing Figma design.',
      },
      {
        category: 'Deployment & Hosting',
        question: `Where do you plan to deploy the application (e.g. Vercel, Render, Supabase)?`,
        reason: 'Ensures you prepare appropriate environment variables and deployment scripts early.',
      },
      {
        category: 'Timeline & Availability',
        question: `What are your milestone expectations within the ${p.duration || 'project'} timeframe?`,
        reason: 'Aligns working velocity and review check-in frequencies.',
      },
    ],
  };
}

function generateHonestProposal(userNotes: string, context: CopilotContext): ProposalDraft {
  const dev = context.userProfile || {};
  const p = context.project || {};

  // Extract ONLY verified skills from profile - NEVER fabricate
  const profileSkills = (dev.skills || []).filter(Boolean);
  const relevantSkills = profileSkills.slice(0, 4);
  const educationStr = dev.education ? `As a student studying ${dev.education}, ` : '';
  const skillsStr = relevantSkills.length > 0 
    ? `with practical experience in ${relevantSkills.join(', ')}`
    : 'with hands-on web development experience';

  const nameGreeting = dev.full_name ? `I'm ${dev.full_name}. ` : '';
  const proposalText = `Hi! ${nameGreeting}${educationStr}I'm very interested in working on "${p.title || 'your project'}". ` +
    `I have background ${skillsStr} and would love to help deliver a reliable solution. ` +
    `${dev.github_url ? 'You can view my verified projects and coding style on my GitHub. ' : ''}` +
    `I can commit dedicated hours each week and look forward to discussing the specifications with you.`;

  return {
    proposalText,
    highlightedProfileSkills: relevantSkills,
    relevantPortfolioSignals: [
      dev.github_url ? 'Verified GitHub Profile' : '',
      dev.portfolio_url ? 'Live Portfolio Site' : '',
    ].filter(Boolean),
    advisoryNotes: [
      'Never claim tools or cloud services you have not actually used.',
      'Highlight genuine problem-solving curiosity and commitment to deadlines.',
    ],
  };
}

function generateProfileImprovements(context: CopilotContext): ProfileImprovementSuggestions {
  const dev = context.userProfile || {};
  const skills = dev.skills || [];

  const headlineSuggestions = [
    dev.headline || 'Full-Stack Developer | React & TypeScript',
    `Emerging Software Developer | ${skills.slice(0, 3).join(' • ') || 'Web & Cloud'}`,
    `CS Student & Developer | Building Scalable Software`,
  ];

  const missingSignals: string[] = [];
  if (!dev.github_url) missingSignals.push('Link your active GitHub profile (+25 Trust Score)');
  if (!dev.education) missingSignals.push('Add your college or degree details (+20 Trust Score)');
  if (!dev.portfolio_url) missingSignals.push('Add your portfolio website link (+15 Trust Score)');
  if (skills.length < 3) missingSignals.push('List at least 3 core technical skills (+10 Trust Score)');

  return {
    headlineSuggestions,
    bioImprovements: 'Highlight your primary tech stack, academic focus, and the types of problems you love solving. Keep it concise (2–3 sentences).',
    skillGroupingRecommendations: [
      'Group frontend (React, Tailwind), backend (Node, Express), and databases (PostgreSQL, Supabase) for visual clarity.',
    ],
    missingVerifiedSignals: missingSignals,
    readinessChecklist: [
      'Clear profile photo / avatar',
      'Direct link to working repositories',
      'Accurate availability status',
    ],
  };
}

function generatePhasedTasks(context: CopilotContext): WorkspaceTaskSuggestion {
  const p = context.project || {};
  const skills = p.required_skills || [];

  return {
    phases: [
      {
        phaseName: 'Phase 1: Project Setup & Foundation',
        tasks: [
          {
            title: 'Repository & Environment Initialization',
            description: `Initialize Git repository with ${skills[0] || 'frontend'} template, Tailwind CSS, and linter rules.`,
            status: 'todo',
          },
          {
            title: 'Database Schema & Auth Configuration',
            description: 'Set up tables, relationships, and authentication session boundaries.',
            status: 'todo',
          },
        ],
      },
      {
        phaseName: 'Phase 2: Core Workflows & UI Development',
        tasks: [
          {
            title: 'Primary User Interface & Component Library',
            description: 'Implement core responsive screens and forms with loading/error states.',
            status: 'todo',
          },
          {
            title: 'API Integration & State Management',
            description: 'Wire up data fetching, queries, and mutations for core business logic.',
            status: 'todo',
          },
        ],
      },
      {
        phaseName: 'Phase 3: Edge Cases & Polish',
        tasks: [
          {
            title: 'Form Validation & Error Boundary Handling',
            description: 'Ensure friendly toasts and responsive validations on all user actions.',
            status: 'todo',
          },
          {
            title: 'Role-Based Access & Security Verification',
            description: 'Verify permissions and test edge conditions.',
            status: 'todo',
          },
        ],
      },
      {
        phaseName: 'Phase 4: Deployment & Final Sign-Off',
        tasks: [
          {
            title: 'Production Build & Hosting Deployment',
            description: 'Deploy live preview URL and verify environment variables.',
            status: 'todo',
          },
          {
            title: 'Deliverables Submission & README Documentation',
            description: 'Submit GitHub repository URL and demo link for owner sign-off.',
            status: 'todo',
          },
        ],
      },
    ],
  };
}

function parseDiscoveryIntent(input: string): DiscoverySearchSuggestion {
  const lower = input.toLowerCase();
  let query = '';
  let difficulty: ProjectDifficulty | undefined;
  let industry: string | undefined;

  if (lower.includes('beginner') || lower.includes('starter') || lower.includes('easy')) {
    difficulty = 'beginner';
  } else if (lower.includes('advanced') || lower.includes('complex')) {
    difficulty = 'advanced';
  } else if (lower.includes('intermediate')) {
    difficulty = 'intermediate';
  }

  if (lower.includes('health') || lower.includes('clinic')) industry = 'Healthcare & Medicine';
  else if (lower.includes('retail') || lower.includes('store') || lower.includes('ecommerce')) industry = 'Retail & Commerce';
  else if (lower.includes('education') || lower.includes('edtech')) industry = 'Education & EdTech';
  else if (lower.includes('finance')) industry = 'Finance & Accounting';

  // Extract skills mentioned
  const techTerms = ['react', 'node', 'python', 'typescript', 'supabase', 'flutter', 'tailwind', 'mobile'];
  const matched = techTerms.filter(t => lower.includes(t));
  query = matched.join(' ');

  return {
    searchQuery: query,
    recommendedDifficulty: difficulty,
    recommendedIndustry: industry,
    rationale: `Targeting ${difficulty || 'relevant'} projects ${industry ? `in ${industry}` : ''} featuring ${query || 'modern stacks'}.`,
  };
}

/**
 * Strips repetitive greeting introductions like "Hello! I am Aaspass, your AI Copilot."
 * when the user has not greeted or it is not the first turn.
 */
function stripRepetitiveIntro(text: string): string {
  return text
    .replace(/^(?:hello|hi|hey|greetings|welcome)[!.,]?\s*(?:i['\s]m|i am|this is)[^.!\n]+(?:copilot|assistant)[.!]?\s*/i, '')
    .replace(/^(?:i['\s]m|i am|this is)[^.!\n]+(?:copilot|assistant)[.!]?\s*/i, '')
    .replace(/^(?:hello|hi|hey|greetings)[!.,]?\s*(?:there|everyone)?[!.,]?\s*/i, '')
    .trim();
}

function generateGeneralAssistantReply(input: string, context: CopilotContext): string {
  const role = context.userRole === 'project_owner' ? 'Project Owner' : 'Developer';
  const lowerInput = input.trim().toLowerCase();
  const userGreeted =
    lowerInput.startsWith('hi') ||
    lowerInput.startsWith('hello') ||
    lowerInput.startsWith('hey') ||
    lowerInput.startsWith('greetings') ||
    lowerInput.startsWith('good morning') ||
    lowerInput.startsWith('good afternoon') ||
    lowerInput.startsWith('good evening');
  const isFirstTurn = context.metadata?.isFirstTurn === true || context.metadata?.isFirstTurn === undefined;

  const intro = (userGreeted || isFirstTurn)
    ? `Hello! I'm here to assist you as a **${role}** on Aaspass!\n\n`
    : `Here is how I can assist you with this:\n\n`;

  return intro +
    `You can ask me to:\n` +
    `• Transform project ideas into structured requirements\n` +
    `• Evaluate whether a project matches your skills\n` +
    `• Craft authentic access proposals without fluff\n` +
    `• Generate developmental task plans for your workspace\n` +
    `• Search projects using natural language\n\n` +
    `How can I help with your current goal?`;
}
