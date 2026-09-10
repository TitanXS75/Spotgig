import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, Sparkles, Plus, Search, Filter, 
  Lock, ArrowRight, FolderKanban, SlidersHorizontal, X 
} from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import { ProjectCard } from '@/components/ProjectCard';
import ListingCardSkeleton from '@/components/ListingCardSkeleton';
import { fetchProjects } from '@/lib/api/projects';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/store/app-store';
import type { Project, ProjectDifficulty, LocationPreference, CompensationType } from '@/lib/db-types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
    <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 md:px-8 xl:px-12 pb-24 md:pb-12">
      {/* ─── HERO HEADER ─── */}
      <div className="pt-8 pb-6 md:pt-12 md:pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl space-y-3"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            Real Projects. Real Experience.{' '}
            <span className="text-primary">Trusted Connections.</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Professionals post real problems with protected requirements. Students and emerging developers discover opportunities, request access, and build verified credibility.
          </p>
        </motion.div>

        {/* Project Owner Navigation */}
        {user?.role === 'project_owner' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="shrink-0 flex gap-2.5"
          >
            <button
              onClick={() => navigate('/my-projects')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-xs sm:text-sm font-semibold transition"
            >
              <FolderKanban className="w-4 h-4" />
              My Projects
            </button>
          </motion.div>
        )}
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
            <Select value={selectedIndustry} onValueChange={(val) => setSelectedIndustry(val)}>
              <SelectTrigger className="w-[180px] h-8 text-xs rounded-xl border-border bg-card text-foreground font-medium focus:ring-1 focus:ring-primary shadow-2xs">
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border bg-popover text-foreground shadow-lg max-h-64">
                {INDUSTRIES.map((ind) => (
                  <SelectItem key={ind} value={ind} className="text-xs rounded-lg cursor-pointer">
                    {ind === 'All' ? 'All Industries' : ind}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/80 hover:border-border transition-all shadow-2xs active:scale-95"
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
                  <button 
                    onClick={clearAllFilters} 
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/80 transition-all active:scale-95"
                  >
                    <X className="w-3 h-3" /> Reset All
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground">Industry</label>
                <Select value={selectedIndustry} onValueChange={(val) => setSelectedIndustry(val)}>
                  <SelectTrigger className="w-full h-9 text-xs rounded-xl border-border bg-background text-foreground font-medium">
                    <SelectValue placeholder="Select Industry" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border bg-popover text-foreground shadow-lg max-h-56">
                    {INDUSTRIES.map(ind => (
                      <SelectItem key={ind} value={ind} className="text-xs rounded-lg cursor-pointer">
                        {ind === 'All' ? 'All Industries' : ind}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Difficulty</label>
                  <Select value={selectedDifficulty} onValueChange={(val) => setSelectedDifficulty(val as 'all' | ProjectDifficulty)}>
                    <SelectTrigger className="w-full h-9 text-xs rounded-xl border-border bg-background text-foreground font-medium">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border bg-popover text-foreground shadow-lg">
                      {DIFFICULTIES.map(d => (
                        <SelectItem key={d.id} value={d.id} className="text-xs rounded-lg cursor-pointer">
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Work Mode</label>
                  <Select value={selectedWorkMode} onValueChange={(val) => setSelectedWorkMode(val as 'all' | LocationPreference)}>
                    <SelectTrigger className="w-full h-9 text-xs rounded-xl border-border bg-background text-foreground font-medium">
                      <SelectValue placeholder="Work Mode" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border bg-popover text-foreground shadow-lg">
                      {WORK_MODES.map(m => (
                        <SelectItem key={m.id} value={m.id} className="text-xs rounded-lg cursor-pointer">
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── PROJECT GRID ─── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        projects.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-16 px-6 text-center max-w-lg mx-auto rounded-3xl border border-dashed border-border/80 bg-muted/20 flex flex-col items-center justify-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-muted/80 border border-border flex items-center justify-center mb-4 shadow-xs">
              <FolderKanban className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground">No listings or projects yet</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 max-w-sm leading-relaxed">
              There are currently no active projects or listings available. Check back soon or be the first to publish a project!
            </p>
            {user?.role === 'project_owner' && (
              <button
                onClick={() => navigate('/post-project')}
                className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Post a Project
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-16 text-center max-w-md mx-auto p-8 rounded-3xl border border-dashed border-border bg-muted/20 flex flex-col items-center justify-center"
          >
            <div className="w-12 h-12 rounded-xl bg-muted/80 border border-border flex items-center justify-center mb-3">
              <Briefcase className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-base font-bold text-foreground">No matching projects found</h3>
            <p className="text-xs text-muted-foreground mt-1 mb-5">
              Try clearing some of your search terms or filters to see more results.
            </p>
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-xs font-semibold text-foreground transition"
            >
              Clear All Filters
            </button>
          </motion.div>
        )
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Index;
