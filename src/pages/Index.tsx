import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, Sparkles, Plus, Search, Filter, ShieldCheck, 
  Lock, ArrowRight, FolderKanban, SlidersHorizontal, X 
} from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import { ProjectCard } from '@/components/ProjectCard';
import ListingCardSkeleton from '@/components/ListingCardSkeleton';
import { fetchProjects } from '@/lib/api/projects';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/store/app-store';
import type { Project, ProjectDifficulty, LocationPreference, CompensationType } from '@/lib/db-types';

const INDUSTRIES = [
  'All',
  'Healthcare & Medicine',
  'Retail & Commerce',
  'Legal & Compliance',
  'Education & EdTech',
  'Finance & Accounting',
  'Real Estate & Construction',
  'Logistics & Supply Chain',
  'Hospitality & Food',
  'Manufacturing & Production',
  'Other Professional Service',
];

const DIFFICULTIES: { id: 'all' | ProjectDifficulty; label: string }[] = [
  { id: 'all', label: 'All Levels' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

const WORK_MODES: { id: 'all' | LocationPreference; label: string }[] = [
  { id: 'all', label: 'All Modes' },
  { id: 'remote', label: 'Remote' },
  { id: 'hybrid', label: 'Hybrid' },
  { id: 'on_site', label: 'On-site' },
];

const COMPENSATION_FILTERS: { id: 'all' | CompensationType; label: string }[] = [
  { id: 'all', label: 'All Rewards' },
  { id: 'paid', label: 'Paid' },
  { id: 'stipend', label: 'Stipend' },
  { id: 'unpaid', label: 'Experience' },
];

const Index = () => {
  const navigate = useNavigate();
  const { 
    user,
    searchQuery, 
    industryFilter, setIndustryFilter,
    difficultyFilter, setDifficultyFilter,
    locationPreferenceFilter, setLocationPreferenceFilter,
    compensationFilter, setCompensationFilter,
    resetFilters
  } = useAppStore();

  const [selectedIndustry, setSelectedIndustry] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | ProjectDifficulty>('all');
  const [selectedWorkMode, setSelectedWorkMode] = useState<'all' | LocationPreference>('all');
  const [selectedComp, setSelectedComp] = useState<'all' | CompensationType>('all');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch live published projects
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects-feed'],
    queryFn: () => fetchProjects({ limit: 100 }),
    staleTime: 30000,
  });

  const filteredProjects = useMemo(() => {
    let items = projects;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.public_summary.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.industry.toLowerCase().includes(q) ||
          p.required_skills.some((s) => s.toLowerCase().includes(q)) ||
          (p.technologies && p.technologies.some((t) => t.toLowerCase().includes(q)))
      );
    }

    // Industry filter
    if (selectedIndustry !== 'All') {
      items = items.filter((p) => p.industry === selectedIndustry);
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      items = items.filter((p) => p.difficulty === selectedDifficulty);
    }

    // Work mode filter
    if (selectedWorkMode !== 'all') {
      items = items.filter((p) => p.location_type === selectedWorkMode);
    }

    // Compensation filter
    if (selectedComp !== 'all') {
      items = items.filter((p) => p.compensation_type === selectedComp);
    }

    return items;
  }, [projects, searchQuery, selectedIndustry, selectedDifficulty, selectedWorkMode, selectedComp]);

  const activeFilterCount = (selectedIndustry !== 'All' ? 1 : 0) +
    (selectedDifficulty !== 'all' ? 1 : 0) +
    (selectedWorkMode !== 'all' ? 1 : 0) +
    (selectedComp !== 'all' ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedIndustry('All');
    setSelectedDifficulty('all');
    setSelectedWorkMode('all');
    setSelectedComp('all');
    resetFilters();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 pb-24 md:pb-12">
      {/* ─── HERO HEADER ─── */}
      <div className="pt-8 pb-6 md:pt-12 md:pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl space-y-3"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            Trusted Real-World Project Marketplace
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            Real Projects. Real Experience.{' '}
            <span className="text-primary">Trusted Connections.</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Professionals post real problems with protected requirements. Students and emerging developers discover opportunities, request access, and build verified credibility.
          </p>
        </motion.div>

        {/* Post Project CTA Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="shrink-0 flex flex-col sm:flex-row gap-2.5"
        >
          <button
            onClick={() => navigate('/post-project')}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-primary text-primary-foreground text-xs sm:text-sm font-bold hover:bg-primary/90 transition shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Post a Project
          </button>
          {user?.role === 'project_owner' && (
            <button
              onClick={() => navigate('/my-projects')}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-border bg-card hover:bg-muted text-xs sm:text-sm font-semibold transition"
            >
              <FolderKanban className="w-4 h-4" />
              My Projects
            </button>
          )}
        </motion.div>
      </div>

      {/* ─── SEARCH & MULTI-FILTER BAR ─── */}
      <div className="space-y-4 mb-8">
        {/* Main Search Row */}
        <div className="flex items-center gap-2.5">
          <div className="flex-1">
            <SearchBar />
          </div>
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className={`md:hidden inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-semibold transition ${
              activeFilterCount > 0 ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-muted-foreground'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {activeFilterCount > 0 && <span>({activeFilterCount})</span>}
          </button>
        </div>

        {/* Desktop Filter Pills */}
        <div className="hidden md:flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Left filters: Industry & Difficulty */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Industry Selector */}
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-xl border border-border bg-card text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              {INDUSTRIES.map(ind => (
                <option key={ind} value={ind}>{ind === 'All' ? 'All Industries' : ind}</option>
              ))}
            </select>

            {/* Difficulty Tabs */}
            <div className="flex items-center p-0.5 rounded-xl bg-muted/60 border border-border/50">
              {DIFFICULTIES.map(diff => (
                <button
                  key={diff.id}
                  onClick={() => setSelectedDifficulty(diff.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    selectedDifficulty === diff.id
                      ? 'bg-card text-foreground font-semibold shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {diff.label}
                </button>
              ))}
            </div>

            {/* Work Mode Tabs */}
            <div className="flex items-center p-0.5 rounded-xl bg-muted/60 border border-border/50">
              {WORK_MODES.map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setSelectedWorkMode(mode.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    selectedWorkMode === mode.id
                      ? 'bg-card text-foreground font-semibold shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Compensation Filter */}
            <div className="flex items-center p-0.5 rounded-xl bg-muted/60 border border-border/50">
              {COMPENSATION_FILTERS.map(comp => (
                <button
                  key={comp.id}
                  onClick={() => setSelectedComp(comp.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    selectedComp === comp.id
                      ? 'bg-card text-foreground font-semibold shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {comp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reset Filters */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}
        </div>

        {/* Mobile Filter Drawer */}
        <AnimatePresence>
          {showMobileFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden p-4 rounded-2xl border border-border bg-card space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Filter Projects</span>
                {activeFilterCount > 0 && (
                  <button onClick={clearAllFilters} className="text-[11px] text-primary hover:underline">
                    Reset All
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground">Industry</label>
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-border bg-background"
                >
                  {INDUSTRIES.map(ind => (
                    <option key={ind} value={ind}>{ind === 'All' ? 'All Industries' : ind}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Difficulty</label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value as any)}
                    className="w-full text-xs p-2 rounded-lg border border-border bg-background"
                  >
                    {DIFFICULTIES.map(d => (
                      <option key={d.id} value={d.id}>{d.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Work Mode</label>
                  <select
                    value={selectedWorkMode}
                    onChange={(e) => setSelectedWorkMode(e.target.value as any)}
                    className="w-full text-xs p-2 rounded-lg border border-border bg-background"
                  >
                    {WORK_MODES.map(m => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── PROJECT GRID ─── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="py-16 text-center max-w-md mx-auto p-8 rounded-3xl border border-dashed border-border bg-muted/20">
          <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-bold text-foreground">No Projects Found</h3>
          <p className="text-xs text-muted-foreground mt-1 mb-5">
            {searchQuery || activeFilterCount > 0
              ? 'Try clearing some of your search terms or filters to see more results.'
              : 'Be the first professional to list a project requirement!'}
          </p>
          {searchQuery || activeFilterCount > 0 ? (
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-xs font-semibold text-foreground transition"
            >
              Clear All Filters
            </button>
          ) : (
            <button
              onClick={() => navigate('/post-project')}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Post a Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Index;
