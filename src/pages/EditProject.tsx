import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Save, Globe, Lock, Clock, Users, Coins, MapPin, 
  Trash2, X, Plus, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/store/app-store';
import { getProjectWithRequirements, updateProject, deleteProject } from '@/lib/api/projects';
import { scanForSensitiveInfo } from '@/lib/mediator/sensitive-info-detector';
import { useToast } from '@/hooks/use-toast';
import type { 
  ProjectDifficulty, 
  CompensationType, 
  LocationPreference, 
  ProjectStatus 
} from '@/lib/db-types';

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

const EditProject = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAppStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['project-edit', id],
    queryFn: () => getProjectWithRequirements(id as string),
    enabled: !!id && !!user,
  });

  const [title, setTitle] = useState('');
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [projectType, setProjectType] = useState(PROJECT_TYPES[0]);
  const [locationType, setLocationType] = useState<LocationPreference>('remote');
  const [area, setArea] = useState('');
  const [duration, setDuration] = useState(DURATIONS[1]);
  const [teamSize, setTeamSize] = useState(1);
  const [compensationType, setCompensationType] = useState<CompensationType>('paid');
  const [compensationAmount, setCompensationAmount] = useState<string>('');
  const [status, setStatus] = useState<ProjectStatus>('published');

  const [difficulty, setDifficulty] = useState<ProjectDifficulty>('intermediate');
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');

  const [publicSummary, setPublicSummary] = useState('');
  const [detailedRequirements, setDetailedRequirements] = useState('');
  const [featureList, setFeatureList] = useState('');
  const [confidentialNotes, setConfidentialNotes] = useState('');

  // Hydrate fields once data loads
  useEffect(() => {
    if (data?.project) {
      const p = data.project;
      const r = data.requirements;

      // Ensure caller is the owner
      if (user && p.owner_id !== user.id) {
        toast({ title: 'Unauthorized', description: 'You do not have permission to edit this project.', variant: 'destructive' });
        navigate('/my-projects');
        return;
      }

      setTitle(p.title);
      setIndustry(p.industry || INDUSTRIES[0]);
      setProjectType(p.project_type || PROJECT_TYPES[0]);
      setLocationType(p.location_type || 'remote');
      setArea(p.area || '');
      setDuration(p.duration || DURATIONS[1]);
      setTeamSize(p.team_size || 1);
      setCompensationType(p.compensation_type || 'paid');
      setCompensationAmount(p.compensation_amount ? p.compensation_amount.toString() : '');
      setStatus(p.status || 'published');
      setDifficulty(p.difficulty || 'intermediate');
      setRequiredSkills(p.required_skills || []);
      setPublicSummary(p.public_summary || '');

      if (r) {
        setDetailedRequirements(r.detailed_requirements || '');
        setFeatureList(r.feature_list || '');
        setConfidentialNotes(r.confidential_notes || '');
      }
    }
  }, [data, user, navigate, toast]);

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !requiredSkills.includes(trimmed) && requiredSkills.length < 10) {
      setRequiredSkills([...requiredSkills, trimmed]);
    }
  };

  const removeSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter(s => s !== skill));
  };

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!id) return;

      if (status === 'published') {
        const leakCheck = scanForSensitiveInfo(publicSummary);
        if (leakCheck.hasCriticalLeak) {
          throw new Error('Publication blocked by Mediator: Sensitive credentials detected in public summary. Move them to private requirements.');
        }
      }

      return updateProject(
        id,
        {
          title: title.trim(),
          category: projectType,
          industry,
          project_type: projectType,
          public_summary: publicSummary.trim(),
          required_skills: requiredSkills,
          difficulty,
          duration,
          team_size: teamSize,
          compensation_type: compensationType,
          compensation_amount: compensationType === 'paid' && compensationAmount ? parseFloat(compensationAmount) : null,
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-projects'] });
      queryClient.invalidateQueries({ queryKey: ['project-edit', id] });
      toast({ title: 'Project Updated', description: 'Your changes have been saved.' });
      navigate('/my-projects');
    },
    onError: (err: Error) => {
      toast({ title: 'Update failed', description: err.message, variant: 'destructive' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!id) return;
      return deleteProject(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-projects'] });
      toast({ title: 'Project Deleted' });
      navigate('/my-projects');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !publicSummary.trim() || !detailedRequirements.trim()) {
      toast({ title: 'Missing required fields', description: 'Title, public summary, and private requirements are required.', variant: 'destructive' });
      return;
    }
    updateMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground animate-pulse">
        Loading project details...
      </div>
    );
  }

  if (error || !data?.project) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
        <h2 className="text-lg font-bold">Project not found</h2>
        <p className="text-xs text-muted-foreground mt-1 mb-4">
          This project may have been removed or you do not have permission to edit it.
        </p>
        <button
          onClick={() => navigate('/my-projects')}
          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
        >
          Back to My Projects
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-12">
      {/* Top Bar */}
      <div className="border-b border-border/60 bg-muted/20 backdrop-blur-md sticky top-14 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/my-projects')}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Projects
          </button>
          <h1 className="text-sm sm:text-base font-bold">Edit Project</h1>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this project?')) {
                deleteMutation.mutate();
              }
            }}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
            title="Delete Project"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 pt-6 sm:px-6 space-y-6">
        {/* Status Setting */}
        <div className="p-4 rounded-2xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-bold text-foreground">Project Visibility Status</h2>
            <p className="text-[11px] text-muted-foreground">
              Choose whether developers can currently discover this project in the marketplace feed.
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {[
              { id: 'published', label: 'Published' },
              { id: 'draft', label: 'Draft' },
              { id: 'completed', label: 'Completed' },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStatus(s.id as ProjectStatus)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  status === s.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Basic Details */}
        <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
          <h2 className="text-sm font-bold text-foreground border-b border-border/50 pb-2">1. Basic Details</h2>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Project Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Industry / Domain</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {INDUSTRIES.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Project Type</label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {PROJECT_TYPES.map(pt => (
                  <option key={pt} value={pt}>{pt}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Work Mode</label>
              <select
                value={locationType}
                onChange={(e) => setLocationType(e.target.value as LocationPreference)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="remote">Remote (Anywhere)</option>
                <option value="hybrid">Hybrid</option>
                <option value="on_site">On-site</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {DURATIONS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Team Size</label>
              <input
                type="number"
                min={1}
                max={10}
                value={teamSize}
                onChange={(e) => setTeamSize(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Skills & Stack */}
        <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
          <h2 className="text-sm font-bold text-foreground border-b border-border/50 pb-2">2. Skills &amp; Difficulty</h2>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Difficulty Level</label>
            <div className="flex gap-2">
              {(['beginner', 'intermediate', 'advanced'] as ProjectDifficulty[]).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setDifficulty(diff)}
                  className={`flex-1 py-2 rounded-xl border text-xs capitalize transition ${
                    difficulty === diff
                      ? 'border-primary bg-primary/10 text-primary font-semibold'
                      : 'border-border bg-background text-muted-foreground'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">Required Skills</label>
            <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-background border border-border min-h-[42px]">
              {requiredSkills.map(skill => (
                <span key={skill} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    addSkill(customSkill);
                    setCustomSkill('');
                  }
                }}
                placeholder="Type a skill and press Enter..."
                className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => {
                  if (customSkill.trim()) {
                    addSkill(customSkill);
                    setCustomSkill('');
                  }
                }}
                className="px-3 py-2 rounded-xl bg-secondary text-secondary-foreground text-xs font-medium"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Public Summary */}
        <div className="p-5 rounded-2xl border border-border bg-card space-y-3">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              3. Public Summary (Visible to Everyone)
            </h2>
          </div>
          <textarea
            rows={4}
            value={publicSummary}
            onChange={(e) => setPublicSummary(e.target.value)}
            required
            className="w-full p-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed"
          />
        </div>

        {/* Protected Private Requirements */}
        <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-4">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
            <h2 className="text-sm font-bold text-amber-500 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              4. Protected Private Requirements (Only Approved Developers See This)
            </h2>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Detailed Requirements &amp; Business Rules</label>
            <textarea
              rows={5}
              value={detailedRequirements}
              onChange={(e) => setDetailedRequirements(e.target.value)}
              required
              className="w-full p-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Feature Checklist (Optional)</label>
            <textarea
              rows={3}
              value={featureList}
              onChange={(e) => setFeatureList(e.target.value)}
              className="w-full p-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Confidential Notes (Optional)</label>
            <input
              type="text"
              value={confidentialNotes}
              onChange={(e) => setConfidentialNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/my-projects')}
            className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-sm disabled:opacity-50"
          >
            {updateMutation.isPending ? (
              <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProject;
