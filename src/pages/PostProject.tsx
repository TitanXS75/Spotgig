import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ArrowRight, Check, ShieldCheck, Lock, Globe, 
  Briefcase, Code2, FileText, CheckCircle2, Sparkles, Building2, 
  Clock, Users, Coins, MapPin, AlertCircle, Plus, X 
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { createProject, getMyProjects } from '@/lib/api/projects';
import { generateUniqueSlug } from '@/lib/utils';
import { scanForSensitiveInfo } from '@/lib/mediator/sensitive-info-detector';
import { validateProjectRequirements } from '@/lib/mediator/requirement-validator';
import { useToast } from '@/hooks/use-toast';
import type { 
  ProjectDifficulty, 
  CompensationType, 
  LocationPreference 
} from '@/lib/db-types';
import { ProjectIdeaModal } from '@/components/copilot/ProjectIdeaModal';
import { useCopilotStore } from '@/store/copilot-store';
import type { GeneratedProjectDraft } from '@/lib/copilot/types';

const STEPS = [
  { id: 1, title: 'About Project', desc: 'Category & Logistics' },
  { id: 2, title: 'Skills & Tech', desc: 'Tech stack & Difficulty' },
  { id: 3, title: 'Requirements', desc: 'Public vs Private' },
  { id: 4, title: 'Review & Publish', desc: 'Preview & Launch' },
];

const INDUSTRIES = [
  'Healthcare & Medicine',
  'Retail & Commerce',
  'Legal & Compliance',
  'Education & EdTech',
  'Finance & Accounting',
  'Real Estate & Construction',
  'Logistics & Supply Chain',
  'Hospitality & Food',
  'Manufacturing & Production',
  'Non-Profit & NGO',
  'Other Professional Service',
];

const PROJECT_TYPES = [
  'Web Application',
  'Mobile App (iOS/Android)',
  'AI / Machine Learning',
  'Automation / Scripting',
  'Data Analytics & Dashboard',
  'UI/UX Design & Prototyping',
  'E-Commerce Storefront',
  'Cloud / DevOps Setup',
  'Other Software Requirement',
];

const POPULAR_SKILLS = [
  'React', 'TypeScript', 'Node.js', 'Python', 'Next.js', 
  'PostgreSQL', 'Tailwind CSS', 'Flutter', 'React Native', 
  'FastAPI', 'UI/UX Design', 'MongoDB', 'Docker', 'Firebase'
];

const DURATIONS = [
  '1–2 Weeks',
  '2–4 Weeks',
  '1–2 Months',
  '2–3 Months',
  '3+ Months',
  'Ongoing Collaboration',
];

const PostProject = () => {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const { toast } = useToast();
  const { openCopilot } = useCopilotStore();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [showIdeaModal, setShowIdeaModal] = useState(false);

  // Step 1: About Your Project
  const [title, setTitle] = useState('');

  const handleApplyDraft = (draft: GeneratedProjectDraft) => {
    if (draft.title) setTitle(draft.title);
    if (draft.industry && INDUSTRIES.includes(draft.industry)) setIndustry(draft.industry);
    if (draft.project_type && PROJECT_TYPES.includes(draft.project_type)) setProjectType(draft.project_type);
    if (draft.difficulty) setDifficulty(draft.difficulty);
    if (draft.duration && DURATIONS.includes(draft.duration)) setDuration(draft.duration);
    if (draft.team_size) setTeamSize(draft.team_size);
    if (draft.location_type) {
      const loc = String(draft.location_type).toLowerCase();
      if (loc === 'hybrid') setLocationType('hybrid');
      else if (loc === 'on_site' || loc === 'on_premise' || loc === 'onsite' || loc === 'in_person') setLocationType('on_site');
      else setLocationType('remote');
    }
    if (draft.compensation_type) {
      const comp = String(draft.compensation_type).toLowerCase();
      if (comp === 'stipend') setCompensationType('stipend');
      else if (comp === 'unpaid') setCompensationType('unpaid');
      else setCompensationType('paid');
    }
    if (draft.compensation_amount) {
      const cleanNum = String(draft.compensation_amount).replace(/[^0-9.]/g, '');
      if (cleanNum && !isNaN(parseFloat(cleanNum))) {
        setCompensationAmount(cleanNum);
      }
    }
    if (draft.required_skills?.length) setRequiredSkills(draft.required_skills);
    if (draft.technologies?.length) setTechnologiesInput(draft.technologies.join(', '));
    if (draft.public_description || draft.short_summary) {
      setPublicSummary(draft.public_description || draft.short_summary);
    }
    if (draft.private_requirements?.deliverables?.length) {
      setDetailedRequirements(draft.private_requirements.deliverables.join('\n'));
    }
    if (draft.private_requirements?.functional_requirements?.length) {
      setFeatureList(draft.private_requirements.functional_requirements.join('\n'));
    }
    setStep(1);
  };
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [projectType, setProjectType] = useState(PROJECT_TYPES[0]);
  const [locationType, setLocationType] = useState<LocationPreference>('remote');
  const [area, setArea] = useState('');
  const [duration, setDuration] = useState(DURATIONS[1]);
  const [teamSize, setTeamSize] = useState(1);
  const [compensationType, setCompensationType] = useState<CompensationType>('paid');
  const [compensationAmount, setCompensationAmount] = useState<string>('5000');

  // Step 2: Skills Needed
  const [difficulty, setDifficulty] = useState<ProjectDifficulty>('intermediate');
  const [requiredSkills, setRequiredSkills] = useState<string[]>(['React', 'TypeScript']);
  const [customSkill, setCustomSkill] = useState('');
  const [technologiesInput, setTechnologiesInput] = useState('');

  // Step 3: Requirements (Public vs Private)
  const [publicSummary, setPublicSummary] = useState('');
  const [detailedRequirements, setDetailedRequirements] = useState('');
  const [featureList, setFeatureList] = useState('');
  const [confidentialNotes, setConfidentialNotes] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in or create an account to post a project.',
      });
      navigate('/auth');
    }
  }, [user, navigate, toast]);

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !requiredSkills.includes(trimmed) && requiredSkills.length < 10) {
      setRequiredSkills([...requiredSkills, trimmed]);
    }
  };

  const removeSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter(s => s !== skill));
  };

  const handleCustomSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill(customSkill);
      setCustomSkill('');
    }
  };

  // Step validations
  const isStep1Valid = title.trim().length >= 5 && industry && projectType && duration;
  const isStep2Valid = requiredSkills.length >= 1;
  const isStep3Valid = publicSummary.trim().length >= 20 && detailedRequirements.trim().length >= 20;

  const handleNext = () => {
    if (step === 1 && !isStep1Valid) {
      toast({ title: 'Please complete all fields', description: 'Title must be at least 5 characters.', variant: 'destructive' });
      return;
    }
    if (step === 2 && !isStep2Valid) {
      toast({ title: 'Add at least one skill', description: 'Select or type at least 1 required skill.', variant: 'destructive' });
      return;
    }
    if (step === 3 && !isStep3Valid) {
      toast({ title: 'Add summary and requirements', description: 'Please provide both public summary and private requirements.', variant: 'destructive' });
      return;
    }
    setStep(s => Math.min(s + 1, 4));
  };

  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const handleSave = async (status: 'published' | 'draft') => {
    if (!user) return;

    if (status === 'published') {
      const leakCheck = scanForSensitiveInfo(publicSummary);
      if (leakCheck.hasCriticalLeak) {
        toast({
          title: 'Publishing Blocked by Mediator',
          description: 'Critical credentials, tokens, or database URLs were detected in your public summary. Move them to private requirements to publish.',
          variant: 'destructive',
        });
        return;
      }
    }

    setSubmitting(true);
    try {
      // 1. Fetch existing user projects to generate unique slug
      const myProjects = await getMyProjects().catch(() => []);
      const existingSlugs = myProjects.map(p => p.slug);
      const slug = generateUniqueSlug(title, existingSlugs);

      // Parse technologies array
      const technologies = technologiesInput
        ? technologiesInput.split(',').map(t => t.trim()).filter(Boolean)
        : requiredSkills;

      // Parse numeric compensation amount cleanly
      let cleanAmount: number | null = null;
      if (compensationType === 'paid' && compensationAmount) {
        const parsed = parseFloat(String(compensationAmount).replace(/[^0-9.]/g, ''));
        if (!isNaN(parsed) && parsed > 0) {
          cleanAmount = parsed;
        }
      }

      const project = await createProject(
        {
          title: title.trim(),
          slug,
          category: projectType,
          industry,
          project_type: projectType,
          public_summary: publicSummary.trim(),
          required_skills: requiredSkills,
          technologies,
          difficulty,
          duration,
          team_size: teamSize,
          compensation_type: compensationType,
          compensation_amount: cleanAmount,
          location_type: locationType,
          area: locationType !== 'remote' ? area.trim() : null,
          status,
        },
        {
          detailed_requirements: detailedRequirements.trim(),
          feature_list: featureList.trim() || null,
          confidential_notes: confidentialNotes.trim() || null,
        }
      );

      toast({
        title: status === 'published' ? 'Project Published!' : 'Draft Saved!',
        description: status === 'published' 
          ? 'Your project is now discoverable. Detailed requirements are securely protected.' 
          : 'You can find and publish your draft from My Projects.',
      });

      navigate('/my-projects');
    } catch (err: unknown) {
      const error = err as Error;
      toast({
        title: 'Failed to create project',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-12">
      {/* Top Header */}
      <div className="border-b border-border/60 bg-muted/20 backdrop-blur-md sticky top-14 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <div className="text-center">
            <h1 className="text-base sm:text-lg font-bold">Post a New Project</h1>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              Public Discovery · Private Requirements · Controlled Access
            </p>
          </div>
          <div className="w-16" /> {/* spacer */}
        </div>

        {/* Step Progress Indicator */}
        <div className="max-w-3xl mx-auto px-4 pb-3 sm:px-6">
          <div className="grid grid-cols-4 gap-2">
            {STEPS.map((s) => (
              <div 
                key={s.id} 
                className="flex flex-col gap-1 cursor-pointer"
                onClick={() => {
                  if (s.id < step) setStep(s.id);
                }}
              >
                <div className={`h-1.5 rounded-full transition-colors ${
                  step >= s.id ? 'bg-primary' : 'bg-muted'
                }`} />
                <span className={`text-[10px] font-medium truncate ${
                  step === s.id ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {s.id}. {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="max-w-3xl mx-auto px-4 pt-6 sm:px-6">
        <AnimatePresence mode="wait">
          {/* ─── STEP 1: ABOUT YOUR PROJECT ─── */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">1. About Your Project</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Provide high-level context so students and emerging developers can understand the nature of your project.
                </p>
              </div>

              {/* Start with an Idea Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-card border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-foreground uppercase tracking-wide">
                      Start with an Idea — Powered by Copilot
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                    Don't worry about technical terms. Tell Spotgig what you want to build in your own words, and we'll generate structured public & private specifications for you.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIdeaModal(true)}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-sm shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>✨ Tell Spotgig</span>
                </button>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Project Title *</span>
                  <span className="text-[11px] text-muted-foreground">e.g. Patient Booking Portal, Inventory Dashboard</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Patient Appointment & Record Management System"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Industry & Project Type Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground">Industry / Domain *</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {INDUSTRIES.map(ind => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground">Project Type *</label>
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {PROJECT_TYPES.map(pt => (
                      <option key={pt} value={pt}>{pt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Work Mode & Location */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-foreground">Work Mode</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'remote', label: 'Remote', desc: 'Anywhere in India' },
                    { id: 'hybrid', label: 'Hybrid', desc: 'Remote + Meetups' },
                    { id: 'on_site', label: 'On-site', desc: 'At your workplace' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setLocationType(mode.id as LocationPreference)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        locationType === mode.id
                          ? 'border-primary bg-primary/10 ring-1 ring-primary'
                          : 'border-border bg-card hover:bg-muted/50'
                      }`}
                    >
                      <p className="text-xs font-bold leading-tight">{mode.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{mode.desc}</p>
                    </button>
                  ))}
                </div>

                {locationType !== 'remote' && (
                  <div className="pt-2">
                    <input
                      type="text"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="Enter city / town / neighborhood (e.g. Pune, Kothrud)"
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                )}
              </div>

              {/* Duration & Team Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground">Expected Duration</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {DURATIONS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground">Team Size</label>
                  <div className="flex items-center gap-2">
                    {[
                      { size: 1, label: 'Solo (1 Dev)' },
                      { size: 2, label: 'Duo (2 Devs)' },
                      { size: 4, label: 'Squad (3-4)' },
                    ].map((t) => (
                      <button
                        key={t.size}
                        type="button"
                        onClick={() => setTeamSize(t.size)}
                        className={`flex-1 py-2 rounded-xl border text-xs font-medium transition ${
                          teamSize === t.size
                            ? 'border-primary bg-primary/10 text-primary font-semibold'
                            : 'border-border bg-card text-muted-foreground hover:bg-muted/40'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Compensation */}
              <div className="space-y-3 p-4 rounded-2xl bg-muted/30 border border-border">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-500" />
                  Compensation / Rewards
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'paid', label: 'Paid Project' },
                    { id: 'stipend', label: 'Monthly Stipend' },
                    { id: 'unpaid', label: 'Verified Experience' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCompensationType(c.id as CompensationType)}
                      className={`py-2 px-3 rounded-lg border text-xs text-center transition ${
                        compensationType === c.id
                          ? 'border-primary bg-primary text-primary-foreground font-semibold shadow-sm'
                          : 'border-border bg-card text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                {compensationType !== 'unpaid' && (
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-sm font-semibold text-muted-foreground">₹</span>
                    <input
                      type="number"
                      value={compensationAmount}
                      onChange={(e) => setCompensationAmount(e.target.value)}
                      placeholder="e.g. 10000"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {compensationType === 'paid' ? 'Total Project Budget' : 'Per Month'}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ─── STEP 2: SKILLS & TECHNOLOGIES ─── */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">2. Skills & Technologies Needed</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Specify the skill level and technologies suitable for completing this project.
                </p>
              </div>

              {/* Difficulty Level */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-foreground">Difficulty Level</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { 
                      id: 'beginner', 
                      title: 'Beginner / Learner', 
                      desc: 'Great for freshers and students building their 1st or 2nd project.' 
                    },
                    { 
                      id: 'intermediate', 
                      title: 'Intermediate', 
                      desc: 'Requires prior framework experience (e.g. React/Python API).' 
                    },
                    { 
                      id: 'advanced', 
                      title: 'Advanced / Complex', 
                      desc: 'Requires architectural maturity, complex data models, or high scale.' 
                    },
                  ].map((diff) => (
                    <button
                      key={diff.id}
                      type="button"
                      onClick={() => setDifficulty(diff.id as ProjectDifficulty)}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        difficulty === diff.id
                          ? 'border-primary bg-primary/10 ring-1 ring-primary'
                          : 'border-border bg-card hover:bg-muted/40'
                      }`}
                    >
                      <p className="text-xs font-bold">{diff.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{diff.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Required Skills */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Required Skills &amp; Stack *</span>
                  <span className="text-[11px] text-muted-foreground">{requiredSkills.length}/10 selected</span>
                </label>

                {/* Selected pills */}
                <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-muted/30 border border-border min-h-[46px]">
                  {requiredSkills.map(skill => (
                    <span 
                      key={skill}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/15 text-primary text-xs font-medium"
                    >
                      {skill}
                      <button 
                        type="button" 
                        onClick={() => removeSkill(skill)}
                        className="hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {requiredSkills.length === 0 && (
                    <span className="text-xs text-muted-foreground italic">Click suggestions below or type your own...</span>
                  )}
                </div>

                {/* Custom skill input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    onKeyDown={handleCustomSkillKeyDown}
                    placeholder="Type a custom skill and press Enter..."
                    className="flex-1 px-3.5 py-2 rounded-xl border border-border bg-card text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customSkill.trim()) {
                        addSkill(customSkill);
                        setCustomSkill('');
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80"
                  >
                    Add
                  </button>
                </div>

                {/* Popular suggestions */}
                <div className="pt-2">
                  <p className="text-[11px] text-muted-foreground mb-1.5 font-medium">Quick Suggestions:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_SKILLS.map(skill => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => addSkill(skill)}
                        disabled={requiredSkills.includes(skill)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                          requiredSkills.includes(skill)
                            ? 'opacity-40 border-transparent bg-muted cursor-not-allowed'
                            : 'border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        + {skill}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Specific tech notes (Optional) */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-foreground">
                  Specific Technologies / Libraries (Optional)
                </label>
                <input
                  type="text"
                  value={technologiesInput}
                  onChange={(e) => setTechnologiesInput(e.target.value)}
                  placeholder="e.g. Supabase, Leaflet, Razorpay, Tailwind CSS"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </motion.div>
          )}

          {/* ─── STEP 3: REQUIREMENTS (PUBLIC VS PRIVATE) ─── */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">3. Project Requirements</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Here is where the magic happens: separate what everyone can see from what stays strictly confidential until you approve a developer.
                </p>
              </div>

              {/* 🌐 Public Summary */}
              <div className="p-4 rounded-2xl border border-border bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    Public Summary * (Visible to Everyone)
                  </label>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">
                    Public Discovery
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Describe the high-level objective and value of the project. Do NOT include proprietary business logic, private credentials, or internal processes here.
                </p>
                <textarea
                  rows={4}
                  value={publicSummary}
                  onChange={(e) => setPublicSummary(e.target.value)}
                  placeholder="e.g. We run a dental clinic and need a clean appointment scheduling tool where patients can pick available slots, receive SMS reminders, and doctors can view their daily schedule on a calendar..."
                  className="w-full p-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed"
                />
              </div>

              {/* 🔒 Protected Private Requirements */}
              <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-500 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Protected Detailed Requirements * (Encrypted / Approved Access Only)
                  </label>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-amber-500/15 text-amber-500">
                    🔒 Locked Behind Request
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  These details will be strictly hidden on the platform. Only developers whose access requests you personally approve will be granted permission by our database security policies to view this section.
                </p>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-foreground">Detailed Business Requirements &amp; Logic *</span>
                  <textarea
                    rows={5}
                    value={detailedRequirements}
                    onChange={(e) => setDetailedRequirements(e.target.value)}
                    placeholder="e.g. Detailed user roles: Admin, Receptionist, Doctor. Patient records must support past treatments, prescription history, and PDF invoice generation. Appointments must be locked 2 hours before the slot..."
                    className="w-full p-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 leading-relaxed"
                  />
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-foreground">Feature Checklist (Optional)</span>
                  <textarea
                    rows={3}
                    value={featureList}
                    onChange={(e) => setFeatureList(e.target.value)}
                    placeholder="• Patient Login via OTP&#10;• Weekly / Monthly Calendar View&#10;• Prescription Generation & PDF download&#10;• WhatsApp confirmation webhook"
                    className="w-full p-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 leading-relaxed"
                  />
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-foreground">Confidential Notes / Guidelines (Optional)</span>
                  <input
                    type="text"
                    value={confidentialNotes}
                    onChange={(e) => setConfidentialNotes(e.target.value)}
                    placeholder="e.g. Non-disclosure agreement required before source code delivery; HIPAA privacy standards."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── STEP 4: REVIEW & PUBLISH ─── */}
          {step === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">4. Review &amp; Launch</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Review your public project card and verify your protected requirements before publishing.
                </p>
              </div>

              {/* Preview Card */}
              <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary uppercase tracking-wide">
                    {industry}
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground">
                    {projectType}
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 capitalize">
                    {difficulty}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-foreground leading-snug">{title || 'Untitled Project'}</h3>

                <p className="text-xs text-foreground/90 leading-relaxed">
                  {publicSummary || 'No summary provided.'}
                </p>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {requiredSkills.map(skill => (
                    <span key={skill} className="text-[11px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Logistics bar */}
                <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between text-xs text-muted-foreground gap-2">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-primary" /> {duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-purple-500" /> {teamSize === 1 ? 'Solo' : `${teamSize} Devs`}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-green-500" /> {locationType === 'remote' ? 'Remote' : (area || 'Local')}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">
                      {compensationType === 'paid' ? `₹${compensationAmount}` : compensationType === 'stipend' ? `₹${compensationAmount}/mo` : 'Experience'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mediator Automation Layer: Leak Guard & Quality Analysis */}
              {(() => {
                const leakCheck = scanForSensitiveInfo(publicSummary);
                const qualityCheck = validateProjectRequirements({
                  title,
                  category: projectType,
                  industry,
                  projectType,
                  publicSummary,
                  requiredSkills,
                  detailedRequirements,
                });

                return (
                  <div className="space-y-3">
                    {/* Sensitive Info Leak Guard */}
                    {leakCheck.hasCriticalLeak ? (
                      <div className="p-4 rounded-2xl border border-destructive/40 bg-destructive/10 text-destructive space-y-2">
                        <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wide">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>Mediator Privacy Warning: Sensitive Data Detected in Public Summary</span>
                        </div>
                        <p className="text-xs leading-relaxed text-foreground/90">
                          {leakCheck.recommendation}
                        </p>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {leakCheck.leaks.map((l, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-destructive/20 text-[10px] font-mono">
                              {l.snippet} ({l.type})
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : leakCheck.hasLeak ? (
                      <div className="p-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300 space-y-1 text-xs">
                        <div className="flex items-center gap-2 font-bold uppercase tracking-wide">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>Mediator Privacy Advisory</span>
                        </div>
                        <p className="leading-relaxed">
                          {leakCheck.recommendation}
                        </p>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <ShieldCheck className="w-4 h-4" />
                          <span>Mediator Leak Guard: Passed (Public Summary Safe)</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">0 credentials leaked</span>
                      </div>
                    )}

                    {/* Quality Score & Guidance */}
                    <div className="p-4 rounded-2xl border border-border bg-card shadow-sm space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                          <Sparkles className="w-4 h-4 text-primary" />
                          <span>Mediator Project Quality Score</span>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          qualityCheck.score >= 80 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}>
                          {qualityCheck.score} / 100 ({qualityCheck.status.replace('_', ' ')})
                        </span>
                      </div>

                      {qualityCheck.suggestions.length > 0 && (
                        <div className="text-[11px] text-muted-foreground pt-1 space-y-1">
                          <p className="font-semibold text-foreground/80">Mediator Recommendations:</p>
                          <ul className="list-disc pl-4 space-y-0.5">
                            {qualityCheck.suggestions.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            openCopilot(
                              {
                                type: 'post_project',
                                userRole: 'project_owner',
                                project: {
                                  title,
                                  industry,
                                  project_type: projectType,
                                  difficulty,
                                  required_skills: requiredSkills,
                                  public_summary: publicSummary,
                                },
                                requirements: {
                                  detailed_requirements: detailedRequirements,
                                },
                              },
                              'Analyze my current project draft and point out missing requirements or improvements.',
                              true
                            );
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>✨ Improve with Copilot</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Protected Requirements Notice */}
              <div className="p-4 rounded-2xl border border-amber-500/40 bg-amber-500/5 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-foreground">
                    Protected Requirements Configured
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Your detailed requirements ({detailedRequirements.length} characters) and feature list will be shielded by database Row Level Security. Only approved applicants will receive decryption access.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Actions Bar */}
        <div className="mt-8 pt-4 border-t border-border flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {step === 4 ? (
              <>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSave('draft')}
                  className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition disabled:opacity-50"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSave('published')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-sm disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Publish Project
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-sm"
              >
                Continue
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <ProjectIdeaModal
        isOpen={showIdeaModal}
        onClose={() => setShowIdeaModal(false)}
        onApplyDraft={handleApplyDraft}
        userRole="project_owner"
      />
    </div>
  );
};

export default PostProject;
