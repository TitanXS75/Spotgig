import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Edit2, LogOut, Github, Globe, Linkedin, GraduationCap, 
  Clock, Code2, Wrench, Building, Briefcase, Plus, X, Check, 
  ExternalLink, Inbox, FolderKanban, ShieldCheck, Sparkles, ChevronRight,
  Star, Award
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { getMyProfile, getPublicProfile, updateMyProfile, getUserStats, type Profile, type ProfileUpdate } from '@/lib/api/profiles';
import { getUserProjectReviews } from '@/lib/api/project-reviews';
import { evaluateDeveloperTrust, evaluateOwnerTrust } from '@/lib/mediator/trust-verifier';
import { useToast } from '@/hooks/use-toast';
import type { ProjectDifficulty } from '@/lib/db-types';

const POPULAR_SKILLS = [
  'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Next.js', 
  'Tailwind CSS', 'PostgreSQL', 'MongoDB', 'Supabase', 'Express', 'FastAPI', 
  'React Native', 'Flutter', 'HTML/CSS', 'GraphQL', 'Docker', 'AWS'
];

const ProfilePage = () => {
  const { id: paramUserId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { user, logout, setUser } = useAppStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isOwnProfile = !paramUserId || paramUserId === user?.id;
  const targetUserId = isOwnProfile ? user?.id : paramUserId;

  const [isEditing, setIsEditing] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [techInput, setTechInput] = useState('');

  // Fetch target profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', targetUserId],
    queryFn: async () => {
      if (isOwnProfile) {
        return getMyProfile();
      } else if (paramUserId) {
        return getPublicProfile(paramUserId);
      }
      return null;
    },
    enabled: !!targetUserId,
  });

  // Fetch target user stats
  const { data: stats } = useQuery({
    queryKey: ['profile-stats', targetUserId, profile?.role],
    queryFn: () => getUserStats(targetUserId!, profile?.role),
    enabled: !!targetUserId && !!profile,
  });

  // Fetch verified project reviews
  const { data: userReviews = [] } = useQuery({
    queryKey: ['user-project-reviews', targetUserId],
    queryFn: () => (targetUserId ? getUserProjectReviews(targetUserId) : []),
    enabled: !!targetUserId,
  });

  const averageRating = userReviews.length > 0
    ? (userReviews.reduce((acc, r) => acc + r.rating, 0) / userReviews.length).toFixed(1)
    : null;

  // Edit form state
  const [editForm, setEditForm] = useState<ProfileUpdate>({});

  useEffect(() => {
    if (profile && isOwnProfile) {
      setEditForm({
        full_name: profile.full_name || '',
        headline: profile.headline || '',
        bio: profile.bio || '',
        skills: profile.skills || [],
        technologies: profile.technologies || [],
        experience_level: profile.experience_level || 'beginner',
        github_url: profile.github_url || '',
        portfolio_url: profile.portfolio_url || '',
        linkedin_url: profile.linkedin_url || '',
        education: profile.education || '',
        availability: profile.availability || 'Available for projects',
        organization: profile.organization || '',
      });
    }
  }, [profile, isOwnProfile]);

  // Profile update mutation
  const updateMutation = useMutation({
    mutationFn: (updates: ProfileUpdate) => updateMyProfile(updates),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      setIsEditing(false);
      toast({
        title: 'Profile Updated',
        description: 'Your professional profile has been saved successfully.',
      });

      // Synchronize basic info in zustand store
      if (user) {
        setUser({
          ...user,
          name: updated.full_name || user.name,
        });
      }
    },
    onError: (err: Error) => {
      toast({
        title: 'Update failed',
        description: err.message,
        variant: 'destructive',
      });
    }
  });

  const handleSave = () => {
    updateMutation.mutate(editForm);
  };

  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    const current = editForm.skills || [];
    if (!current.includes(trimmed)) {
      setEditForm({ ...editForm, skills: [...current, trimmed] });
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const current = editForm.skills || [];
    setEditForm({ ...editForm, skills: current.filter(s => s !== skillToRemove) });
  };

  const handleAddTech = (tech: string) => {
    const trimmed = tech.trim();
    if (!trimmed) return;
    const current = editForm.technologies || [];
    if (!current.includes(trimmed)) {
      setEditForm({ ...editForm, technologies: [...current, trimmed] });
    }
    setTechInput('');
  };

  const handleRemoveTech = (techToRemove: string) => {
    const current = editForm.technologies || [];
    setEditForm({ ...editForm, technologies: current.filter(t => t !== techToRemove) });
  };

  const difficultyBadgeColors: Record<string, string> = {
    beginner: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    intermediate: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    advanced: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  };

  if (!user && isOwnProfile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
          <User className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Sign in to view your profile</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          Create a developer profile to apply for real-world projects, or log in as a project owner to list software requirements.
        </p>
        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={() => navigate('/auth')}
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition shadow-sm"
          >
            Sign In / Register
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-muted-foreground animate-pulse">
        Loading profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold">Profile not found</h2>
        <p className="text-sm text-muted-foreground mt-2">This user profile does not exist or has been removed.</p>
        <button
          onClick={() => navigate('/home')}
          className="mt-4 px-4 py-2 rounded-xl bg-muted text-sm font-medium hover:bg-muted/80 transition"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  const isOwner = profile.role === 'project_owner';

  const trustEvaluation = profile ? (
    isOwner 
      ? evaluateOwnerTrust({
          full_name: profile.full_name,
          organization: profile.organization,
          headline: profile.headline,
          bio: profile.bio,
          projectsPostedCount: stats?.projectsCount,
        })
      : evaluateDeveloperTrust({
          full_name: profile.full_name,
          headline: profile.headline,
          bio: profile.bio,
          education: profile.education,
          github_url: profile.github_url,
          portfolio_url: profile.portfolio_url,
          skills: profile.skills,
          completedProjectsCount: stats?.acceptedRequestsCount,
          averageRating: averageRating ? parseFloat(averageRating) : null,
        })
  ) : null;

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-12">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        {/* Top Header Card */}
        <div className="relative overflow-hidden rounded-3xl bg-card border border-border shadow-sm p-6 sm:p-8 mb-6">
          {/* Subtle gradient banner backdrop */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Avatar */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-primary/10 border-2 border-background shadow-md flex items-center justify-center text-3xl font-bold text-primary shrink-0 overflow-hidden ring-4 ring-primary/5">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.full_name || 'User'} className="w-full h-full object-cover" />
                ) : (
                  profile.full_name ? profile.full_name.charAt(0).toUpperCase() : <User className="w-10 h-10" />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground truncate">
                    {profile.full_name || 'Anonymous User'}
                  </h1>

                  {/* Role Badge */}
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {isOwner ? 'Project Owner / Professional' : 'Student / Emerging Developer'}
                  </span>
                </div>

                {/* Headline or Organization */}
                {isOwner ? (
                  <div className="mt-1 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    {profile.organization && (
                      <span className="flex items-center gap-1 text-foreground font-semibold">
                        <Building className="w-3.5 h-3.5 text-primary" /> {profile.organization}
                      </span>
                    )}
                    {profile.headline && <span>• {profile.headline}</span>}
                  </div>
                ) : (
                  <p className="mt-1 text-sm font-medium text-foreground/80">
                    {profile.headline || 'Emerging Developer seeking real-world software projects'}
                  </p>
                )}

                {/* Badges row for Developer */}
                {!isOwner && (
                  <div className="flex flex-wrap items-center gap-2.5 mt-3 text-xs">
                    {profile.experience_level && (
                      <span className={`px-2.5 py-0.5 rounded-full font-semibold border ${difficultyBadgeColors[profile.experience_level] || 'bg-muted'}`}>
                        {profile.experience_level.charAt(0).toUpperCase() + profile.experience_level.slice(1)} Developer
                      </span>
                    )}
                    {profile.availability && (
                      <span className="flex items-center gap-1 bg-muted px-2.5 py-0.5 rounded-full font-medium text-foreground/80">
                        <Clock className="w-3 h-3 text-primary" />
                        {profile.availability}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons (if own profile) */}
            {isOwnProfile && (
              <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs sm:text-sm font-semibold hover:bg-primary/90 transition shadow-sm"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
                <button
                  onClick={logout}
                  title="Log out"
                  className="p-2 rounded-xl border border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* External Links Bar */}
          {(profile.github_url || profile.portfolio_url || profile.linkedin_url) && (
            <div className="flex flex-wrap items-center gap-2.5 mt-6 pt-5 border-t border-border/50">
              {profile.github_url && (
                <a
                  href={profile.github_url.startsWith('http') ? profile.github_url : `https://${profile.github_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold transition border border-border"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                  <ExternalLink className="w-3 h-3 opacity-60 ml-0.5" />
                </a>
              )}
              {profile.portfolio_url && (
                <a
                  href={profile.portfolio_url.startsWith('http') ? profile.portfolio_url : `https://${profile.portfolio_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold transition border border-border"
                >
                  <Globe className="w-4 h-4 text-blue-500" />
                  Portfolio
                  <ExternalLink className="w-3 h-3 opacity-60 ml-0.5" />
                </a>
              )}
              {profile.linkedin_url && (
                <a
                  href={profile.linkedin_url.startsWith('http') ? profile.linkedin_url : `https://${profile.linkedin_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold transition border border-border"
                >
                  <Linkedin className="w-4 h-4 text-blue-600" />
                  LinkedIn
                  <ExternalLink className="w-3 h-3 opacity-60 ml-0.5" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Stats Metrics Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
            {isOwner ? (
              <>
                <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
                  <div className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                    <FolderKanban className="w-3.5 h-3.5 text-primary" /> Projects Posted
                  </div>
                  <div className="text-2xl font-bold mt-1 text-foreground">{stats.projectsCount}</div>
                </div>
                <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
                  <div className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                    <Inbox className="w-3.5 h-3.5 text-yellow-500" /> Pending Requests
                  </div>
                  <div className="text-2xl font-bold mt-1 text-foreground">{stats.pendingRequestsCount}</div>
                </div>
                <div className="p-4 rounded-2xl bg-card border border-border shadow-sm col-span-2 sm:col-span-1">
                  <div className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-green-500" /> Active Collaborators
                  </div>
                  <div className="text-2xl font-bold mt-1 text-foreground">{stats.acceptedRequestsCount}</div>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
                  <div className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-primary" /> Requests Sent
                  </div>
                  <div className="text-2xl font-bold mt-1 text-foreground">{stats.projectsCount}</div>
                </div>
                <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
                  <div className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-yellow-500" /> Pending Review
                  </div>
                  <div className="text-2xl font-bold mt-1 text-foreground">{stats.pendingRequestsCount}</div>
                </div>
                <div className="p-4 rounded-2xl bg-card border border-border shadow-sm col-span-2 sm:col-span-1">
                  <div className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Projects Unlocked
                  </div>
                  <div className="text-2xl font-bold mt-1 text-foreground">{stats.acceptedRequestsCount}</div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Bio & Skills */}
          <div className="md:col-span-2 space-y-6">
            {/* Bio */}
            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">About & Background</h2>
              <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                {profile.bio || (isOwner 
                  ? 'No organization overview provided yet. Click "Edit Profile" to add details about your practice or business.' 
                  : 'No personal bio added yet. Add a short summary highlighting your coding interests and experience.')}
              </p>
            </div>

            {/* Developer Skills & Tech Stack */}
            {!isOwner && (
              <>
                <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-primary" /> Technical Skills
                    </h2>
                    {isOwnProfile && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-xs text-primary hover:underline font-semibold"
                      >
                        + Add Skills
                      </button>
                    )}
                  </div>

                  {profile.skills && profile.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-semibold border border-primary/20"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No technical skills listed yet.</p>
                  )}
                </div>

                {profile.technologies && profile.technologies.length > 0 && (
                  <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Wrench className="w-4 h-4 text-primary" /> Tools & Platforms
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {profile.technologies.map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 rounded-xl bg-muted text-foreground/90 text-xs font-medium border border-border"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Verified Project Reviews & Reputation */}
            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Verified Reviews & Reputation
                  </h2>
                </div>
                {averageRating && (
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{averageRating} / 5</span>
                    <span className="text-muted-foreground font-normal">({userReviews.length})</span>
                  </div>
                )}
              </div>

              {userReviews.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                  No verified project reviews yet. Completed projects with official sign-off will appear here.
                </div>
              ) : (
                <div className="space-y-3">
                  {userReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground">
                            {rev.reviewer?.organization || rev.reviewer?.full_name || 'Project Reviewer'}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(rev.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                          ))}
                        </div>
                      </div>

                      {rev.project && (
                        <div className="text-[11px] text-primary font-medium">
                          Project: {rev.project.title}
                        </div>
                      )}

                      <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-line">
                        "{rev.comment}"
                      </p>

                      {(rev.technical_rating || rev.communication_rating || rev.reliability_rating) && (
                        <div className="flex flex-wrap gap-2.5 pt-1 text-[10px] text-muted-foreground">
                          {rev.technical_rating && <span>Technical: {rev.technical_rating}/5</span>}
                          {rev.communication_rating && <span>Communication: {rev.communication_rating}/5</span>}
                          {rev.reliability_rating && <span>Reliability: {rev.reliability_rating}/5</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Education & Quick Links */}
          <div className="space-y-6">
            {/* Mediator Trust & Verification Card */}
            {trustEvaluation && (
              <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-primary" /> Mediator Verification
                  </h2>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    trustEvaluation.level === 'verified'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-primary/10 text-primary border border-primary/20'
                  }`}>
                    {trustEvaluation.badgeText}
                  </span>
                </div>

                {/* Score Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">Trust Score</span>
                    <span className="font-bold text-primary">{trustEvaluation.trustScore}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${trustEvaluation.trustScore}%` }}
                    />
                  </div>
                </div>

                {/* Verified Signals */}
                {trustEvaluation.verifiedSignals.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[11px] font-semibold text-muted-foreground">Verified Signals:</div>
                    <ul className="text-xs space-y-1 text-foreground/80">
                      {trustEvaluation.verifiedSignals.map((signal, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{signal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Missing Checklist for Own Profile */}
                {isOwnProfile && trustEvaluation.missingChecklist.length > 0 && (
                  <div className="pt-2 border-t border-border/50 space-y-2">
                    <div className="text-[11px] font-semibold text-muted-foreground">Boost Your Trust Score:</div>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      {trustEvaluation.missingChecklist.slice(0, 3).map((item, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-muted-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1 pt-1"
                    >
                      <Edit2 className="w-3 h-3" /> Update Profile to Verify
                    </button>
                  </div>
                )}
              </div>
            )}

            {!isOwner && (
              <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-primary" /> Education
                </h2>
                <p className="text-sm text-foreground/90 font-medium">
                  {profile.education || 'Self-taught / University not specified'}
                </p>
              </div>
            )}

            {/* Quick Actions Card */}
            {isOwnProfile && (
              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/15 space-y-3">
                <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-primary" /> Quick Navigation
                </h3>

                <div className="space-y-2 pt-1">
                  {isOwner ? (
                    <>
                      <button
                        onClick={() => navigate('/post-project')}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-sm"
                      >
                        <span>Post a Project Requirement</span>
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => navigate('/my-projects')}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-card hover:bg-muted text-foreground text-xs font-medium border border-border transition"
                      >
                        <span>Manage My Projects</span>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => navigate('/requests')}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-card hover:bg-muted text-foreground text-xs font-medium border border-border transition"
                      >
                        <span>Review Developer Requests</span>
                        <Inbox className="w-3.5 h-3.5 text-primary" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => navigate('/home')}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-sm"
                      >
                        <span>Discover Real Projects</span>
                        <Briefcase className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => navigate('/my-requests')}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-card hover:bg-muted text-foreground text-xs font-medium border border-border transition"
                      >
                        <span>Track My Requests</span>
                        <Inbox className="w-3.5 h-3.5 text-primary" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Edit Profile Modal */}
        <AnimatePresence>
          {isEditing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl p-6 sm:p-8"
              >
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <h2 className="text-xl font-bold">Edit Profile</h2>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="py-5 space-y-4 text-sm">
                  {/* Full Name */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Full Name</label>
                    <input
                      type="text"
                      value={editForm.full_name || ''}
                      onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  {/* Organization (Owner) or Education (Developer) */}
                  {isOwner ? (
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Organization / Firm / Practice</label>
                      <input
                        type="text"
                        placeholder="e.g. Apex Healthcare Clinic, Sharma & Associates"
                        value={editForm.organization || ''}
                        onChange={(e) => setEditForm({ ...editForm, organization: e.target.value })}
                        className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Education / College</label>
                      <input
                        type="text"
                        placeholder="e.g. B.Tech Computer Science, Delhi Technological University (2026)"
                        value={editForm.education || ''}
                        onChange={(e) => setEditForm({ ...editForm, education: e.target.value })}
                        className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                  )}

                  {/* Headline */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Headline</label>
                    <input
                      type="text"
                      placeholder={isOwner ? "e.g. Managing Partner & Healthcare Consultant" : "e.g. Full-Stack Developer | React, Node.js & Supabase"}
                      value={editForm.headline || ''}
                      onChange={(e) => setEditForm({ ...editForm, headline: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  {/* Developer: Experience Level & Availability */}
                  {!isOwner && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Experience Level</label>
                        <select
                          value={editForm.experience_level || 'beginner'}
                          onChange={(e) => setEditForm({ ...editForm, experience_level: e.target.value as ProjectDifficulty })}
                          className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        >
                          <option value="beginner">Beginner / Student</option>
                          <option value="intermediate">Intermediate Developer</option>
                          <option value="advanced">Advanced / Experienced</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Availability Status</label>
                        <select
                          value={editForm.availability || 'Available for projects'}
                          onChange={(e) => setEditForm({ ...editForm, availability: e.target.value })}
                          className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        >
                          <option value="Available for projects">Available for projects</option>
                          <option value="Part-time (10-20 hrs/wk)">Part-time (10-20 hrs/wk)</option>
                          <option value="Weekends only">Weekends only</option>
                          <option value="Currently busy">Currently busy</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Bio */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Bio / Background</label>
                    <textarea
                      rows={3}
                      placeholder="Write a brief overview of your background, interests, and what you build..."
                      value={editForm.bio || ''}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  {/* Developer: Skills Tag Manager */}
                  {!isOwner && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Technical Skills</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add skill (e.g. React, Python, PostgreSQL)"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddSkill(skillInput);
                            }
                          }}
                          className="flex-1 px-3 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddSkill(skillInput)}
                          className="px-3.5 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:bg-primary/90"
                        >
                          Add
                        </button>
                      </div>

                      {/* Quick add popular skills */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-[11px] text-muted-foreground mr-1 self-center">Suggestions:</span>
                        {POPULAR_SKILLS.slice(0, 8).map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => handleAddSkill(s)}
                            className="px-2 py-0.5 rounded-lg bg-muted hover:bg-muted/80 text-[11px] text-muted-foreground hover:text-foreground transition"
                          >
                            +{s}
                          </button>
                        ))}
                      </div>

                      {/* Active Skills Pills */}
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {(editForm.skills || []).map((s) => (
                          <span
                            key={s}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium border border-primary/20"
                          >
                            {s}
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(s)}
                              className="hover:text-destructive"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Links */}
                  <div className="space-y-3 pt-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Links & Profiles</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1 mb-1">
                          <Github className="w-3.5 h-3.5" /> GitHub URL
                        </span>
                        <input
                          type="text"
                          placeholder="github.com/username"
                          value={editForm.github_url || ''}
                          onChange={(e) => setEditForm({ ...editForm, github_url: e.target.value })}
                          className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1 mb-1">
                          <Globe className="w-3.5 h-3.5" /> Portfolio URL
                        </span>
                        <input
                          type="text"
                          placeholder="portfolio.dev"
                          value={editForm.portfolio_url || ''}
                          onChange={(e) => setEditForm({ ...editForm, portfolio_url: e.target.value })}
                          className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1 mb-1">
                          <Linkedin className="w-3.5 h-3.5" /> LinkedIn URL
                        </span>
                        <input
                          type="text"
                          placeholder="linkedin.com/in/username"
                          value={editForm.linkedin_url || ''}
                          onChange={(e) => setEditForm({ ...editForm, linkedin_url: e.target.value })}
                          className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-xl bg-muted text-foreground text-xs font-medium hover:bg-muted/80 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={updateMutation.isPending}
                    onClick={handleSave}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-sm disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    {updateMutation.isPending ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProfilePage;
