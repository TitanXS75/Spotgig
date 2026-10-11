import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Edit2, LogOut, Github, Globe, Linkedin, GraduationCap, 
  Clock, Code2, Wrench, Building, Briefcase, Plus, X, Check, 
  ExternalLink, Inbox, FolderKanban, ShieldCheck, Sparkles, ChevronRight,
  Star, Award, Share2, CheckCircle2, Layers, ArrowUpRight, BookOpen, Flame, CheckCheck
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { supabase } from '@/lib/supabase';
import { getMyProfile, getPublicProfile, updateMyProfile, getUserStats, type Profile, type ProfileUpdate } from '@/lib/api/profiles';
import { getUserProjectReviews } from '@/lib/api/project-reviews';
import { getMyProjectRequests } from '@/lib/api/requests';
import { evaluateDeveloperTrust, evaluateOwnerTrust } from '@/lib/mediator/trust-verifier';
import { useToast } from '@/hooks/use-toast';
import type { ProjectDifficulty, ProjectRole } from '@/lib/db-types';

const POPULAR_SKILLS = [
  'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Next.js', 
  'Tailwind CSS', 'PostgreSQL', 'MongoDB', 'Supabase', 'Express', 'FastAPI', 
  'React Native', 'Flutter', 'HTML/CSS', 'GraphQL', 'Docker', 'AWS', 'Vue.js',
  'Firebase', 'Prisma', 'Git', 'C++', 'Java', 'Figma'
];

const ProfilePage = () => {
  const { id: paramUserId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { user, logout, setUser, isAuthLoading, authInitialized } = useAppStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isOwnProfile = !paramUserId || paramUserId === user?.id;
  const targetUserId = isOwnProfile ? user?.id : paramUserId;

  // Safeguard: Check if Supabase has an active session that hasn't synced to store yet
  useEffect(() => {
    if (!user && isOwnProfile) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const authUser = session.user;
          let role: ProjectRole = (authUser.user_metadata?.role as ProjectRole) || 'developer';
          let name = authUser.user_metadata?.full_name || '';

          supabase
            .from('profiles')
            .select('role, full_name')
            .eq('id', authUser.id)
            .maybeSingle()
            .then(({ data }) => {
              if (data?.role) role = data.role as ProjectRole;
              if (data?.full_name) name = data.full_name;

              setUser({
                id: authUser.id,
                email: authUser.email || '',
                name: name,
                phone: authUser.phone || null,
                gender: null,
                role: role,
              });
            });
        }
      });
    }
  }, [user, isOwnProfile, setUser]);

  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'projects'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editTab, setEditTab] = useState<'basic' | 'skills' | 'social'>('basic');
  const [skillInput, setSkillInput] = useState('');
  const [techInput, setTechInput] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    }
    logout();
    queryClient.clear();
    toast({
      title: 'Logged Out',
      description: 'You have been successfully signed out.',
    });
    navigate('/auth', { replace: true });
  };

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

  // Fetch developer requests for own profile
  const { data: developerRequests = [] } = useQuery({
    queryKey: ['my-developer-requests', targetUserId],
    queryFn: () => getMyProjectRequests(),
    enabled: isOwnProfile && profile?.role !== 'project_owner',
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
        description: 'Your changes have been saved successfully.',
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

  const handleCopyProfileLink = () => {
    const url = `${window.location.origin}/profile/${profile?.id || user?.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast({
      title: 'Profile Link Copied!',
      description: 'Public link copied to your clipboard.',
    });
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const difficultyBadgeColors: Record<string, { bg: string, text: string, border: string }> = {
    beginner: { bg: 'bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-500/20' },
    intermediate: { bg: 'bg-blue-500/10', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-500/20' },
    advanced: { bg: 'bg-purple-500/10', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-500/20' },
  };

  // If auth is still initializing/loading, show loading account state instead of Sign In barrier
  if (!authInitialized || (isOwnProfile && !user && isAuthLoading)) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading your account...</p>
      </div>
    );
  }

  if (!user && isOwnProfile) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-xl mx-auto text-center p-8 rounded-3xl bg-card border border-border shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
            <User className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Sign in to view your profile</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Build a verified student developer profile to apply for real-world projects, unlock requirements, and build verified client reputation.
          </p>
          <div className="flex justify-center gap-3 mt-6">
            <button
              onClick={() => navigate('/auth')}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition shadow-sm"
            >
              Sign In / Register
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-64 rounded-3xl bg-card border border-border animate-pulse mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 h-96 rounded-3xl bg-card border border-border animate-pulse" />
          <div className="lg:col-span-8 h-96 rounded-3xl bg-card border border-border animate-pulse" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="max-w-md mx-auto p-8 rounded-3xl bg-card border border-border shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3 text-muted-foreground">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Profile Not Found</h2>
          <p className="text-sm text-muted-foreground mt-1">This user profile does not exist or has been removed.</p>
          <button
            onClick={() => navigate('/home')}
            className="mt-5 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition"
          >
            Explore Projects
          </button>
        </div>
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

  const currentDiffBadge = difficultyBadgeColors[profile.experience_level || 'beginner'] || difficultyBadgeColors.beginner;

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-16">
      {/* Full-width container with responsive breathing room */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6">
        
        {/* ========================================================================= */}
        {/* TOP BLOCK HERO BANNER (Cool, Simple, Modern Design)                     */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden rounded-3xl bg-card border border-border/80 shadow-sm">
          {/* Refined clean modern ambient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/[0.03] via-primary/[0.04] to-transparent dark:from-white/[0.02] dark:via-primary/[0.05] pointer-events-none" />
          
          {/* Subtle accent bar at top */}
          <div className="h-1.5 w-full bg-gradient-to-r from-primary via-indigo-500 to-sky-400" />

          <div className="relative p-6 sm:p-8 md:p-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              
              {/* Profile Main Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 min-w-0">
                
                {/* Avatar with Status Indicator */}
                <div className="relative shrink-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl bg-muted/60 border-2 border-border shadow-md flex items-center justify-center text-3xl font-bold text-primary overflow-hidden ring-4 ring-primary/5">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.full_name || 'User'} className="w-full h-full object-cover" />
                    ) : (
                      profile.full_name ? (
                        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">
                          {profile.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                        </span>
                      ) : (
                        <User className="w-10 h-10 text-muted-foreground" />
                      )
                    )}
                  </div>

                  {/* Active availability indicator dot */}
                  <span 
                    className="absolute -bottom-1 -right-1 flex h-4 w-4 rounded-full ring-2 ring-card bg-emerald-500"
                    title={profile.availability || 'Available'}
                  >
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  </span>
                </div>

                {/* Identity & Details */}
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                      {profile.full_name || 'Student Developer'}
                    </h1>

                    {/* Role & Verification Badge */}
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                      <span>{isOwner ? 'Project Owner' : 'Student Developer'}</span>
                    </div>

                    {trustEvaluation?.level === 'verified' && (
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Verified</span>
                      </div>
                    )}
                  </div>

                  {/* Headline */}
                  {isOwner ? (
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      {profile.organization && (
                        <span className="flex items-center gap-1.5 text-foreground font-semibold">
                          <Building className="w-4 h-4 text-primary" /> {profile.organization}
                        </span>
                      )}
                      {profile.headline && <span>• {profile.headline}</span>}
                    </div>
                  ) : (
                    <p className="text-sm sm:text-base font-medium text-muted-foreground leading-snug max-w-2xl">
                      {profile.headline || 'Student developer building real-world web and mobile applications.'}
                    </p>
                  )}

                  {/* Tags row: Education, Experience Level, Availability */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    {!isOwner && profile.education && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-muted text-foreground font-medium border border-border/80">
                        <GraduationCap className="w-3.5 h-3.5 text-primary" />
                        <span>{profile.education}</span>
                      </span>
                    )}

                    {!isOwner && profile.experience_level && (
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg font-semibold border ${currentDiffBadge.bg} ${currentDiffBadge.text} ${currentDiffBadge.border}`}>
                        <Flame className="w-3.5 h-3.5" />
                        <span className="capitalize">{profile.experience_level} Level</span>
                      </span>
                    )}

                    {profile.availability && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-muted text-foreground/90 font-medium border border-border/80">
                        <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{profile.availability}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
                {isOwnProfile ? (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs sm:text-sm font-semibold hover:bg-primary/90 transition shadow-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>

                    <button
                      onClick={handleCopyProfileLink}
                      className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition"
                      title="Share public profile link"
                    >
                      {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={handleLogout}
                      title="Log out"
                      className="p-2.5 rounded-xl border border-border bg-card hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 text-muted-foreground transition"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleCopyProfileLink}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs sm:text-sm font-semibold border border-border transition"
                    >
                      {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                      <span>Share Profile</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Social & Web Links Footer Bar in Header */}
            {(profile.github_url || profile.portfolio_url || profile.linkedin_url) && (
              <div className="flex flex-wrap items-center gap-3 mt-6 pt-5 border-t border-border/60">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-1">
                  Connect:
                </span>

                {profile.github_url && (
                  <a
                    href={profile.github_url.startsWith('http') ? profile.github_url : `https://${profile.github_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold transition border border-border group"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                    <ArrowUpRight className="w-3 h-3 opacity-50 group-hover:opacity-100 transition" />
                  </a>
                )}

                {profile.portfolio_url && (
                  <a
                    href={profile.portfolio_url.startsWith('http') ? profile.portfolio_url : `https://${profile.portfolio_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold transition border border-border group"
                  >
                    <Globe className="w-3.5 h-3.5 text-blue-500" />
                    <span>Portfolio</span>
                    <ArrowUpRight className="w-3 h-3 opacity-50 group-hover:opacity-100 transition" />
                  </a>
                )}

                {profile.linkedin_url && (
                  <a
                    href={profile.linkedin_url.startsWith('http') ? profile.linkedin_url : `https://${profile.linkedin_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold transition border border-border group"
                  >
                    <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                    <span>LinkedIn</span>
                    <ArrowUpRight className="w-3 h-3 opacity-50 group-hover:opacity-100 transition" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* KPI METRICS STRIP (Full Width Grid)                                      */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* Trust Score */}
          <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>Trust Verification</span>
              <ShieldCheck className="w-4 h-4 text-primary" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-foreground">
                {trustEvaluation?.trustScore || 0}%
              </span>
              {trustEvaluation?.isVerified && (
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  Verified
                </span>
              )}
            </div>
            <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden mt-3">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${trustEvaluation?.trustScore || 0}%` }}
              />
            </div>
          </div>

          {/* Projects / Workspaces Unlocked */}
          <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>{isOwner ? 'Projects Posted' : 'Projects Unlocked'}</span>
              <FolderKanban className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-foreground">
                {stats?.acceptedRequestsCount || (isOwner ? stats?.projectsCount : 0) || 0}
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">Workspaces</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-3 truncate">
              {isOwner ? `${stats?.projectsCount || 0} Total Listings` : 'Approved collaborations'}
            </p>
          </div>

          {/* Verified Rating */}
          <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>Client Rating</span>
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-foreground">
                {averageRating ? `${averageRating}` : '5.0'}
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">
                / 5.0 ({userReviews.length} {userReviews.length === 1 ? 'review' : 'reviews'})
              </span>
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-3 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Verified Sign-offs
            </p>
          </div>

          {/* Applications / Active Pipeline */}
          <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>{isOwner ? 'Pending Review' : 'Active Requests'}</span>
              <Inbox className="w-4 h-4 text-sky-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-foreground">
                {stats?.pendingRequestsCount || 0}
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">In review</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-3 truncate">
              {stats?.projectsCount || 0} total applications
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MAIN 12-COLUMN DASHBOARD GRID                                            */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ─────────────────────────────────────────────────────────────────────── */}
          {/* LEFT COLUMN: Sidebar (4 cols on lg)                                     */}
          {/* ─────────────────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Mediator Trust Card */}
            {trustEvaluation && (
              <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                      Trust & Verification
                    </h2>
                  </div>
                  {trustEvaluation.badgeText && (
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      trustEvaluation.level === 'verified'
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-primary/10 text-primary border border-primary/20'
                    }`}>
                      {trustEvaluation.badgeText}
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  Verified signals give project owners confidence when reviewing applications and awarding real-world tasks.
                </p>

                {/* Verified Signals Checklist */}
                {trustEvaluation.verifiedSignals.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-border/60">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Verified Credentials
                    </div>
                    <div className="space-y-1.5">
                      {trustEvaluation.verifiedSignals.map((signal, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-foreground font-medium">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>{signal}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action to boost score if own profile */}
                {isOwnProfile && trustEvaluation.missingChecklist.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-2">
                    <div className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      <span>Boost Your Trust Score</span>
                    </div>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      {trustEvaluation.missingChecklist.slice(0, 2).map((item, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1 pt-1"
                    >
                      <Edit2 className="w-3 h-3" /> Complete Profile
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Education & Academic Credentials */}
            {!isOwner && (
              <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                    Education & Degree
                  </h2>
                </div>
                <div className="p-4 rounded-2xl bg-muted/30 border border-border/60">
                  <p className="text-sm font-semibold text-foreground">
                    {profile.education || 'Self-Taught / University details not specified'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Student Developer Program
                  </p>
                </div>
              </div>
            )}

            {/* Quick Actions Hub */}
            {isOwnProfile && (
              <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-sm space-y-3">
                <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" /> Quick Actions
                </h3>
                <div className="space-y-2 pt-1">
                  {isOwner ? (
                    <>
                      <button
                        onClick={() => navigate('/post-project')}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-sm"
                      >
                        <span>Post New Project</span>
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate('/my-projects')}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted text-foreground text-xs font-medium border border-border transition"
                      >
                        <span>Manage My Projects</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => navigate('/requests')}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted text-foreground text-xs font-medium border border-border transition"
                      >
                        <span>Review Developer Requests</span>
                        <Inbox className="w-4 h-4 text-primary" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => navigate('/home')}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-sm"
                      >
                        <span>Discover Real Projects</span>
                        <Briefcase className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate('/my-requests')}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted text-foreground text-xs font-medium border border-border transition"
                      >
                        <span>Track My Applications</span>
                        <Inbox className="w-4 h-4 text-primary" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ─────────────────────────────────────────────────────────────────────── */}
          {/* RIGHT COLUMN: Interactive Tabs & Content Hub (8 cols on lg)              */}
          {/* ─────────────────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Tab Navigation Pill Bar */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-muted/50 border border-border/80 w-full overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 ${
                  activeTab === 'overview'
                    ? 'bg-card text-foreground shadow-sm border border-border/60'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Code2 className="w-4 h-4 text-primary" />
                <span>Overview & Stack</span>
              </button>

              <button
                onClick={() => setActiveTab('reviews')}
                className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 ${
                  activeTab === 'reviews'
                    ? 'bg-card text-foreground shadow-sm border border-border/60'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Award className="w-4 h-4 text-primary" />
                <span>Verified Reviews ({userReviews.length})</span>
              </button>

              {isOwnProfile && !isOwner && (
                <button
                  onClick={() => setActiveTab('projects')}
                  className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 ${
                    activeTab === 'projects'
                      ? 'bg-card text-foreground shadow-sm border border-border/60'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-primary" />
                  <span>My Applications ({developerRequests.length})</span>
                </button>
              )}
            </div>

            {/* TAB 1: OVERVIEW & STACK */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                
                {/* About / Bio Card */}
                <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" /> About & Bio
                    </h2>
                    {isOwnProfile && (
                      <button
                        onClick={() => {
                          setEditTab('basic');
                          setIsEditing(true);
                        }}
                        className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" /> Edit Bio
                      </button>
                    )}
                  </div>
                  
                  <div className="text-sm sm:text-base text-foreground/90 leading-relaxed whitespace-pre-line">
                    {profile.bio || (
                      <div className="py-4 text-center text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border text-xs">
                        No bio added yet. Click &quot;Edit Profile&quot; to describe your background, interests, and what you build.
                      </div>
                    )}
                  </div>
                </div>

                {/* Technical Skills Matrix */}
                {!isOwner && (
                  <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-sm space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                          <Code2 className="w-4 h-4 text-primary" /> Technical Skills & Frameworks
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Verified competencies used to match with relevant project requirements.
                        </p>
                      </div>

                      {isOwnProfile && (
                        <button
                          onClick={() => {
                            setEditTab('skills');
                            setIsEditing(true);
                          }}
                          className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Manage Skills
                        </button>
                      )}
                    </div>

                    {profile.skills && profile.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2.5">
                        {profile.skills.map((skill, idx) => (
                          <div
                            key={idx}
                            className="px-3.5 py-2 rounded-xl bg-primary/10 hover:bg-primary/15 text-primary text-xs sm:text-sm font-semibold border border-primary/20 transition flex items-center gap-1.5 shadow-sm"
                          >
                            <span>{skill}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center text-xs text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border">
                        No technical skills listed yet. Add skills to increase your project match rate!
                      </div>
                    )}
                  </div>
                )}

                {/* Tools & Platforms */}
                {!isOwner && profile.technologies && profile.technologies.length > 0 && (
                  <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-primary" /> Tools, Databases & Platforms
                      </h2>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      {profile.technologies.map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-3.5 py-1.5 rounded-xl bg-muted text-foreground text-xs sm:text-sm font-medium border border-border"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: VERIFIED REVIEWS & RECOMMENDATIONS */}
            {activeTab === 'reviews' && (
              <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
                  <div>
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-primary" />
                      <h2 className="text-base font-bold text-foreground">
                        Verified Project Reviews & Reputation
                      </h2>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Official ratings and sign-offs from clients and project owners upon task completion.
                    </p>
                  </div>

                  {averageRating && (
                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold self-start sm:self-auto">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>{averageRating} / 5.0</span>
                      <span className="text-muted-foreground font-normal">({userReviews.length} total)</span>
                    </div>
                  )}
                </div>

                {userReviews.length === 0 ? (
                  <div className="py-12 text-center text-xs text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border space-y-2">
                    <Award className="w-8 h-8 text-muted-foreground/50 mx-auto" />
                    <p className="font-semibold text-foreground">No Verified Reviews Yet</p>
                    <p className="max-w-sm mx-auto">
                      When you complete a project milestone, the project owner signs off with an official review and rating.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {userReviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-5 rounded-2xl bg-muted/30 border border-border/70 space-y-3 hover:border-border transition"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                              {rev.reviewer?.full_name?.charAt(0) || 'R'}
                            </div>
                            <div>
                              <div className="text-xs sm:text-sm font-bold text-foreground">
                                {rev.reviewer?.organization || rev.reviewer?.full_name || 'Project Reviewer'}
                              </div>
                              <div className="text-[11px] text-muted-foreground">
                                {new Date(rev.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-0.5 text-amber-400">
                            {[...Array(rev.rating)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-amber-400" />
                            ))}
                          </div>
                        </div>

                        {rev.project && (
                          <div className="text-xs text-primary font-semibold flex items-center gap-1.5">
                            <FolderKanban className="w-3.5 h-3.5" />
                            <span>Project: {rev.project.title}</span>
                          </div>
                        )}

                        <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed italic bg-card/60 p-3.5 rounded-xl border border-border/40">
                          &quot;{rev.comment}&quot;
                        </p>

                        {(rev.technical_rating || rev.communication_rating || rev.reliability_rating) && (
                          <div className="flex flex-wrap gap-3 pt-1 text-[11px] text-muted-foreground">
                            {rev.technical_rating && (
                              <span className="px-2.5 py-0.5 rounded-lg bg-card border border-border">
                                Technical Skill: <strong>{rev.technical_rating}/5</strong>
                              </span>
                            )}
                            {rev.communication_rating && (
                              <span className="px-2.5 py-0.5 rounded-lg bg-card border border-border">
                                Communication: <strong>{rev.communication_rating}/5</strong>
                              </span>
                            )}
                            {rev.reliability_rating && (
                              <span className="px-2.5 py-0.5 rounded-lg bg-card border border-border">
                                Reliability: <strong>{rev.reliability_rating}/5</strong>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: MY APPLICATIONS / REQUESTS (For own profile) */}
            {activeTab === 'projects' && isOwnProfile && !isOwner && (
              <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-border/60">
                  <div>
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-primary" />
                      <span>Project Applications & Workspaces</span>
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Your submitted proposals and unlocked projects.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/home')}
                    className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Browse More</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {developerRequests.length === 0 ? (
                  <div className="py-12 text-center text-xs text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border space-y-3">
                    <Inbox className="w-8 h-8 text-muted-foreground/50 mx-auto" />
                    <p className="font-semibold text-foreground">No Active Applications</p>
                    <p className="max-w-sm mx-auto">
                      Explore available software projects and apply to gain hands-on engineering experience.
                    </p>
                    <button
                      onClick={() => navigate('/home')}
                      className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-sm"
                    >
                      Find Projects
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {developerRequests.map((req) => (
                      <div
                        key={req.id}
                        className="p-4 rounded-2xl bg-muted/30 border border-border/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-border transition"
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-foreground truncate">
                              {req.projects?.title || 'Project'}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                              req.status === 'accepted'
                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                                : req.status === 'rejected'
                                ? 'bg-destructive/10 text-destructive border border-destructive/20'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            }`}>
                              {req.status}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            Applied: {new Date(req.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          {req.status === 'accepted' && req.project_id && (
                            <button
                              onClick={() => navigate(`/project/${req.project_id}/workspace`)}
                              className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition flex items-center gap-1.5 shadow-sm"
                            >
                              <span>Open Workspace</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/project/${req.project_id}`)}
                            className="px-3 py-1.5 rounded-xl bg-card border border-border text-foreground text-xs font-semibold hover:bg-muted transition"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* ========================================================================= */}
        {/* EDIT PROFILE MODAL OVERHAUL (Clean, Simple, Tabbed)                       */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {isEditing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 10 }}
                className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
              >
                {/* Modal Header */}
                <div className="p-6 pb-4 border-b border-border flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Edit Student Profile</h2>
                    <p className="text-xs text-muted-foreground">Keep your credentials up-to-date for project owner verification.</p>
                  </div>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Sub-tab Switcher inside Modal */}
                <div className="px-6 pt-3 flex items-center gap-2 border-b border-border/60">
                  <button
                    type="button"
                    onClick={() => setEditTab('basic')}
                    className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition ${
                      editTab === 'basic'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    1. Basic Info & Bio
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditTab('skills')}
                    className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition ${
                      editTab === 'skills'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    2. Technical Stack
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditTab('social')}
                    className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition ${
                      editTab === 'social'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    3. Links & Social
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto space-y-4 text-sm flex-1">
                  
                  {/* TAB 1: BASIC INFO & BIO */}
                  {editTab === 'basic' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={editForm.full_name || ''}
                          onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                          className="w-full mt-1.5 px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                          placeholder="e.g. John Doe"
                        />
                      </div>

                      {isOwner ? (
                        <div>
                          <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                            Organization / Business Name
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Acme Health Clinic, Apex Technologies"
                            value={editForm.organization || ''}
                            onChange={(e) => setEditForm({ ...editForm, organization: e.target.value })}
                            className="w-full mt-1.5 px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                            College / University & Degree
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. B.Tech Computer Science, IIT Delhi (2026)"
                            value={editForm.education || ''}
                            onChange={(e) => setEditForm({ ...editForm, education: e.target.value })}
                            className="w-full mt-1.5 px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                          />
                        </div>
                      )}

                      <div>
                        <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                          Headline / Tagline
                        </label>
                        <input
                          type="text"
                          placeholder={isOwner ? "e.g. Managing Director & Tech Founder" : "e.g. Full-Stack Developer | React, Node.js & Supabase"}
                          value={editForm.headline || ''}
                          onChange={(e) => setEditForm({ ...editForm, headline: e.target.value })}
                          className="w-full mt-1.5 px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                        />
                      </div>

                      {!isOwner && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                              Experience Level
                            </label>
                            <select
                              value={editForm.experience_level || 'beginner'}
                              onChange={(e) => setEditForm({ ...editForm, experience_level: e.target.value as ProjectDifficulty })}
                              className="w-full mt-1.5 px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                            >
                              <option value="beginner">Beginner / Student</option>
                              <option value="intermediate">Intermediate Developer</option>
                              <option value="advanced">Advanced Developer</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                              Availability
                            </label>
                            <select
                              value={editForm.availability || 'Available for projects'}
                              onChange={(e) => setEditForm({ ...editForm, availability: e.target.value })}
                              className="w-full mt-1.5 px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                            >
                              <option value="Available for projects">Available for projects</option>
                              <option value="Part-time (10-20 hrs/wk)">Part-time (10-20 hrs/wk)</option>
                              <option value="Weekends only">Weekends only</option>
                              <option value="Currently busy">Currently busy</option>
                            </select>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                          About & Bio
                        </label>
                        <textarea
                          rows={4}
                          placeholder="Share your coding journey, tech interests, and past projects..."
                          value={editForm.bio || ''}
                          onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                          className="w-full mt-1.5 px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 2: TECHNICAL STACK & TOOLS */}
                  {editTab === 'skills' && (
                    <div className="space-y-5">
                      {/* Technical Skills */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                          Primary Technical Skills
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add skill (e.g. React, TypeScript, FastAPI)"
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddSkill(skillInput);
                              }
                            }}
                            className="flex-1 px-3.5 py-2 bg-background border border-border rounded-xl text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddSkill(skillInput)}
                            className="px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:bg-primary/90 transition"
                          >
                            Add
                          </button>
                        </div>

                        {/* Quick Add Suggestions */}
                        <div className="pt-2">
                          <span className="text-[11px] font-semibold text-muted-foreground mr-1.5">Quick add:</span>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {POPULAR_SKILLS.slice(0, 10).map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => handleAddSkill(s)}
                                className="px-2.5 py-1 rounded-lg bg-muted hover:bg-muted/80 text-[11px] text-muted-foreground hover:text-foreground transition border border-border/50"
                              >
                                + {s}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Active Selected Skills */}
                        <div className="flex flex-wrap gap-2 pt-3">
                          {(editForm.skills || []).map((s) => (
                            <span
                              key={s}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-semibold border border-primary/20"
                            >
                              <span>{s}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveSkill(s)}
                                className="hover:text-destructive transition"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Tools & Platforms */}
                      <div className="space-y-2 pt-3 border-t border-border/60">
                        <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                          Tools & Platforms
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add tool (e.g. Docker, Vercel, Supabase)"
                            value={techInput}
                            onChange={(e) => setTechInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddTech(techInput);
                              }
                            }}
                            className="flex-1 px-3.5 py-2 bg-background border border-border rounded-xl text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddTech(techInput)}
                            className="px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:bg-primary/90 transition"
                          >
                            Add
                          </button>
                        </div>

                        {/* Active Selected Tools */}
                        <div className="flex flex-wrap gap-2 pt-2">
                          {(editForm.technologies || []).map((t) => (
                            <span
                              key={t}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted text-foreground text-xs font-medium border border-border"
                            >
                              <span>{t}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveTech(t)}
                                className="hover:text-destructive transition"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: SOCIAL & PORTFOLIO LINKS */}
                  {editTab === 'social' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1">
                          <Github className="w-4 h-4 text-foreground" />
                          <span>GitHub URL</span>
                        </label>
                        <input
                          type="text"
                          placeholder="https://github.com/username"
                          value={editForm.github_url || ''}
                          onChange={(e) => setEditForm({ ...editForm, github_url: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1">
                          <Globe className="w-4 h-4 text-blue-500" />
                          <span>Portfolio Website</span>
                        </label>
                        <input
                          type="text"
                          placeholder="https://yourportfolio.dev"
                          value={editForm.portfolio_url || ''}
                          onChange={(e) => setEditForm({ ...editForm, portfolio_url: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1">
                          <Linkedin className="w-4 h-4 text-blue-600" />
                          <span>LinkedIn Profile</span>
                        </label>
                        <input
                          type="text"
                          placeholder="https://linkedin.com/in/username"
                          value={editForm.linkedin_url || ''}
                          onChange={(e) => setEditForm({ ...editForm, linkedin_url: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                      </div>
                    </div>
                  )}

                </div>

                {/* Modal Footer */}
                <div className="p-4 sm:p-6 border-t border-border flex items-center justify-between bg-muted/20">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-xs font-semibold hover:bg-muted transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={updateMutation.isPending}
                    onClick={handleSave}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs sm:text-sm font-semibold hover:bg-primary/90 transition shadow-sm disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>{updateMutation.isPending ? 'Saving...' : 'Save Profile'}</span>
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
