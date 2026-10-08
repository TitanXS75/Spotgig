import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderKanban, Lock, Unlock, CheckCircle2, Circle, Clock,
  Send, Plus, Trash2, Github, Globe, ExternalLink, Award,
  MessageSquare, CheckSquare, FileText, ChevronLeft, ShieldCheck,
  User, Sparkles, Check, AlertCircle, Pencil, X, RotateCcw,
  ThumbsUp, ThumbsDown, Loader2, ChevronDown, ChevronUp
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { fetchProjectById, fetchProjectRequirements } from '@/lib/api/projects';
import { checkProjectAccess } from '@/lib/api/requests';
import {
  getProjectTasks, createProjectTask, updateProjectTask, toggleProjectTask, deleteProjectTask,
  updateTaskStatus, type TaskStatus,
  getProjectMessages, sendProjectMessage, subscribeToProjectMessages,
  submitProjectDeliverable, getProjectDeliverables, updateDeliverableStatus,
} from '@/lib/api/collaboration';
import type { ProjectMessageWithSender, ProjectDeliverableWithDeveloper } from '@/lib/api/collaboration';
import { completeProjectAndSignOff, getProjectReviews } from '@/lib/api/project-reviews';
import ProjectReviewModal from '@/components/ProjectReviewModal';
import { useCopilotStore } from '@/store/copilot-store';
import { useToast } from '@/hooks/use-toast';

type WorkspaceTab = 'tasks' | 'discussion' | 'deliverables' | 'specs';

const ProjectWorkspacePage = () => {
  const { id: idOrSlug } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthLoading, authInitialized } = useAppStore();
  const { openCopilot } = useCopilotStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<WorkspaceTab>('tasks');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>('todo');
  const [taskFilter, setTaskFilter] = useState<'all' | 'todo' | 'in_progress' | 'completed'>('all');
  const [taskInputError, setTaskInputError] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [deliverableTitle, setDeliverableTitle] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [realtimeMessages, setRealtimeMessages] = useState<ProjectMessageWithSender[]>([]);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [reviewingDeliverable, setReviewingDeliverable] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const newTaskInputRef = useRef<HTMLInputElement>(null);

  // ── Data Fetching ─────────────────────────────────────────

  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: ['project', idOrSlug],
    queryFn: () => fetchProjectById(idOrSlug!),
    enabled: !!idOrSlug,
  });

  const projectId = project?.id;

  const { data: hasAccess, isLoading: isAccessLoading } = useQuery({
    queryKey: ['project-access', projectId, user?.id],
    queryFn: () => (projectId ? checkProjectAccess(projectId) : false),
    enabled: !!projectId && !!user,
  });

  const isOwner = user?.id === project?.owner_id;
  const isAuthorized = isOwner || !!hasAccess;

  const { data: requirements } = useQuery({
    queryKey: ['project-requirements', projectId],
    queryFn: () => (projectId ? fetchProjectRequirements(projectId) : null),
    enabled: !!projectId && isAuthorized,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['project-tasks', projectId],
    queryFn: () => (projectId ? getProjectTasks(projectId) : []),
    enabled: !!projectId && isAuthorized,
  });

  const { data: initialMessages = [] } = useQuery({
    queryKey: ['project-messages', projectId],
    queryFn: () => (projectId ? getProjectMessages(projectId) : []),
    enabled: !!projectId && isAuthorized,
  });

  const { data: deliverables = [] } = useQuery({
    queryKey: ['project-deliverables', projectId],
    queryFn: () => (projectId ? getProjectDeliverables(projectId) : []),
    enabled: !!projectId && isAuthorized,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['project-reviews', projectId],
    queryFn: () => (projectId ? getProjectReviews(projectId) : []),
    enabled: !!projectId,
  });

  // ── Realtime Messages ─────────────────────────────────────

  // Merge initial + realtime messages, deduplicated
  const allMessages: ProjectMessageWithSender[] = (() => {
    const seenIds = new Set(initialMessages.map(m => m.id));
    const extra = realtimeMessages.filter(m => !seenIds.has(m.id));
    return [...initialMessages, ...extra];
  })();

  useEffect(() => {
    if (!projectId || !isAuthorized) return;
    setRealtimeMessages([]);

    const unsubscribe = subscribeToProjectMessages(projectId, (msg) => {
      setRealtimeMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setRealtimeConnected(true);
    });

    setRealtimeConnected(true);

    return () => {
      unsubscribe();
    };
  }, [projectId, isAuthorized]);

  // Auto-scroll chat
  useEffect(() => {
    if (activeTab === 'discussion') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [allMessages, activeTab]);

  // Focus edit input
  useEffect(() => {
    if (editingTaskId) editInputRef.current?.focus();
  }, [editingTaskId]);

  // ── Mutations ─────────────────────────────────────────────

  const addTaskMutation = useMutation({
    mutationFn: ({ title, status }: { title: string; status: TaskStatus }) =>
      createProjectTask(projectId!, title, undefined, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-tasks', projectId] });
      setNewTaskTitle('');
      setNewTaskStatus('todo');
    },
    onError: (err: Error) => toast({ title: 'Could not add task', description: err.message, variant: 'destructive' }),
  });

  const editTaskMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => updateProjectTask(id, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-tasks', projectId] });
      setEditingTaskId(null);
      setEditingTaskTitle('');
    },
    onError: (err: Error) => toast({ title: 'Could not update task', description: err.message, variant: 'destructive' }),
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      updateTaskStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project-tasks', projectId] }),
    onError: (err: Error) => toast({ title: 'Could not update task status', description: err.message, variant: 'destructive' }),
  });

  const toggleTaskMutation = useMutation({
    mutationFn: ({ id, isCompleted }: { id: string; isCompleted: boolean }) =>
      toggleProjectTask(id, isCompleted),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project-tasks', projectId] }),
    onError: (err: Error) => toast({ title: 'Could not update task', description: err.message, variant: 'destructive' }),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => deleteProjectTask(taskId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project-tasks', projectId] }),
  });

  const sendMessageMutation = useMutation({
    mutationFn: (text: string) => sendProjectMessage(projectId!, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-messages', projectId] });
      setChatMessage('');
      chatInputRef.current?.focus();
    },
    onError: (err: Error) => toast({ title: 'Message failed', description: err.message, variant: 'destructive' }),
  });

  const submitDeliverableMutation = useMutation({
    mutationFn: () => submitProjectDeliverable(projectId!, {
      title: deliverableTitle.trim() || 'Deliverable Submission',
      github_repo_url: githubUrl,
      live_demo_url: demoUrl,
      notes: deliveryNotes,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-deliverables', projectId] });
      setDeliverableTitle('');
      setGithubUrl('');
      setDemoUrl('');
      setDeliveryNotes('');
      toast({ title: 'Work Submitted! 🚀', description: 'The project owner has been notified to review your submission.' });
    },
    onError: (err: Error) => toast({ title: 'Submission failed', description: err.message, variant: 'destructive' }),
  });

  const reviewDeliverableMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: 'accepted' | 'revision_requested'; notes?: string }) =>
      updateDeliverableStatus(id, status, notes),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['project-deliverables', projectId] });
      setReviewingDeliverable(null);
      setReviewNotes('');
      toast({
        title: vars.status === 'accepted' ? 'Deliverable Accepted ✅' : 'Revision Requested 🔄',
        description: vars.status === 'accepted'
          ? 'Great work! The developer has been notified.'
          : 'The developer will be notified to make revisions.',
      });
    },
    onError: (err: Error) => toast({ title: 'Review failed', description: err.message, variant: 'destructive' }),
  });

  const completeProjectMutation = useMutation({
    mutationFn: () => completeProjectAndSignOff(projectId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', idOrSlug] });
      toast({ title: 'Project Marked Completed! 🏆', description: 'You can now exchange verified reviews.' });
      setShowReviewModal(true);
    },
    onError: (err: Error) => toast({ title: 'Could not complete project', description: err.message, variant: 'destructive' }),
  });

  // ── Helpers ───────────────────────────────────────────────

  const startEditTask = (id: string, title: string) => {
    setEditingTaskId(id);
    setEditingTaskTitle(title);
  };

  const cancelEditTask = () => {
    setEditingTaskId(null);
    setEditingTaskTitle('');
  };

  const saveEditTask = () => {
    if (editingTaskTitle.trim() && editingTaskId) {
      editTaskMutation.mutate({ id: editingTaskId, title: editingTaskTitle });
    }
  };

  // ── Loading / Auth Guards ─────────────────────────────────

  if (isProjectLoading || isAccessLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-3" />
        <p className="text-sm text-muted-foreground animate-pulse">Opening secure project workspace...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold">Project not found</h2>
        <button onClick={() => navigate('/home')} className="mt-4 px-4 py-2 bg-muted rounded-xl text-sm">
          Back to Projects
        </button>
      </div>
    );
  }

  if (!authInitialized || (isAuthLoading && !user)) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading workspace...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-xl font-bold">Sign in required</h1>
        <button onClick={() => navigate('/auth')} className="mt-4 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
          Sign In
        </button>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Private Project Workspace</h1>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          Access to this workspace is restricted to the project owner and approved collaborators.
        </p>
        <button
          onClick={() => navigate(`/project/${project.slug || project.id}`)}
          className="mt-6 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition shadow-sm"
        >
          View Public Project & Request Access
        </button>
      </div>
    );
  }

  // ── Derived State & Weighted Progress ──────────────────

  const getEffectiveStatus = (task: (typeof tasks)[number]): TaskStatus => {
    if (task.status === 'in_progress') return 'in_progress';
    if (task.status === 'completed' || task.is_completed) return 'completed';
    return 'todo';
  };

  const completedTasksCount = tasks.filter(t => getEffectiveStatus(t) === 'completed').length;
  const inProgressTasksCount = tasks.filter(t => getEffectiveStatus(t) === 'in_progress').length;
  const todoTasksCount = tasks.filter(t => getEffectiveStatus(t) === 'todo').length;

  // Weighted progress calculation:
  // Completed = 1.0 (100%), In Progress / Half Done = 0.5 (50%), To Do = 0.0 (0%)
  const taskScore = (completedTasksCount * 1.0) + (inProgressTasksCount * 0.5);
  const taskProgressPercent = tasks.length > 0 ? Math.round((taskScore / tasks.length) * 100) : 0;
  const isCompleted = project.status === 'completed';

  const filteredTasks = tasks.filter(t => {
    if (taskFilter === 'all') return true;
    return getEffectiveStatus(t) === taskFilter;
  });

  const revieweeId = isOwner
    ? (deliverables[0]?.developer_id || project.owner_id)
    : project.owner_id;
  const revieweeName = isOwner ? 'Developer' : 'Project Owner';
  const reviewerRole = isOwner ? 'project_owner' : 'developer';

  const difficultyColors: Record<string, string> = {
    beginner: 'text-emerald-600 dark:text-emerald-400',
    intermediate: 'text-blue-600 dark:text-blue-400',
    advanced: 'text-purple-600 dark:text-purple-400',
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-12">
      <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border/60">
          <div className="space-y-1">
            <button
              onClick={() => navigate(`/project/${project.slug || project.id}`)}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-medium transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Back to Project Overview
            </button>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {project.title}
              </h1>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <Unlock className="w-3 h-3" /> Private Workspace
              </span>
              {isCompleted && (
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Completed
                </span>
              )}
              {isOwner && (
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  Owner
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => {
                openCopilot({
                  type: 'workspace',
                  project,
                  requirements,
                  userRole: isOwner ? 'project_owner' : 'developer',
                  hasPrivateAccess: true,
                });
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold transition shadow-sm"
              title="Open Workspace Copilot"
            >
              <Sparkles className="w-4 h-4" />
              <span>✨ Ask Copilot</span>
            </button>
            {isOwner && !isCompleted && (
              <button
                onClick={() => completeProjectMutation.mutate()}
                disabled={completeProjectMutation.isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-sm disabled:opacity-50"
              >
                {completeProjectMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                Mark Completed & Sign Off
              </button>
            )}
            {isCompleted && (
              <button
                onClick={() => setShowReviewModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition shadow-sm"
              >
                <Award className="w-4 h-4" />
                Write Project Review
              </button>
            )}
          </div>
        </div>

        {/* ── Progress Summary Bar ── */}
        <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-foreground flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-primary" />
              Project Completion Progress
            </span>
            <div className="flex items-center gap-2">
              <span className={`font-bold text-base sm:text-lg ${taskProgressPercent === 100 ? 'text-emerald-500' : 'text-primary'}`}>
                {taskProgressPercent}%
              </span>
            </div>
          </div>

          <div className="w-full h-3 bg-muted rounded-full overflow-hidden p-0.5 border border-border/40">
            <motion.div
              className={`h-full rounded-full transition-all duration-500 ${
                taskProgressPercent === 100
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : taskProgressPercent > 0
                  ? 'bg-gradient-to-r from-primary to-amber-400'
                  : 'bg-primary'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${taskProgressPercent}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground pt-0.5">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {completedTasksCount} Completed
              </span>
              <span className="inline-flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                <Clock className="w-3.5 h-3.5" />
                {inProgressTasksCount} Half Done (50%)
              </span>
              <span className="inline-flex items-center gap-1 font-medium text-muted-foreground">
                <Circle className="w-3.5 h-3.5" />
                {todoTasksCount} To Do
              </span>
            </div>
            <span className="font-medium">
              {tasks.length > 0 
                ? `${taskScore % 1 === 0 ? taskScore : taskScore.toFixed(1)} of ${tasks.length} milestone points`
                : 'Add tasks below to start tracking progress'}
            </span>
          </div>
        </div>

        {/* ── Tab Bar ── */}
        <div className="flex items-center gap-2 mt-6 pb-2 border-b border-border/40 overflow-x-auto">
          {[
            { id: 'tasks', label: 'Tasks & Milestones', icon: CheckSquare, count: `${completedTasksCount}/${tasks.length}` },
            { id: 'discussion', label: 'Discussion', icon: MessageSquare, count: allMessages.length },
            { id: 'deliverables', label: 'Deliverables', icon: Globe, count: deliverables.length },
            { id: 'specs', label: 'Protected Specs', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as WorkspaceTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition ${
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ════════════════════════════════════════════════════
            Tab 1: Tasks & Milestones
        ════════════════════════════════════════════════════ */}
        {activeTab === 'tasks' && (
          <div className="mt-6 space-y-5">
            {/* Generate Tasks with Copilot button */}
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-primary" /> Tasks & Milestones
              </span>
              <button
                type="button"
                onClick={() => {
                  openCopilot({
                    type: 'workspace',
                    project,
                    requirements,
                    userRole: isOwner ? 'project_owner' : 'developer',
                    hasPrivateAccess: true,
                  }, 'Break down the project requirements into development tasks.', true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-semibold transition shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>✨ Generate Tasks with Copilot</span>
              </button>
            </div>

            {/* Add Task — visible to both owner and developer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newTaskTitle.trim()) {
                  setTaskInputError(true);
                  newTaskInputRef.current?.focus();
                  setTimeout(() => setTaskInputError(false), 600);
                  return;
                }
                addTaskMutation.mutate({ title: newTaskTitle, status: newTaskStatus });
              }}
              className="flex flex-col sm:flex-row gap-2"
            >
              <input
                ref={newTaskInputRef}
                type="text"
                placeholder={isOwner
                  ? 'Type a task title and click Add Task or press Enter...'
                  : 'Type a task title to track your progress...'
                }
                value={newTaskTitle}
                onChange={(e) => { setNewTaskTitle(e.target.value); setTaskInputError(false); }}
                className={`flex-1 px-4 py-2.5 bg-card border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm placeholder:text-muted-foreground/60 transition ${
                  taskInputError ? 'border-destructive ring-2 ring-destructive/30 animate-pulse' : 'border-border'
                }`}
              />
              <div className="flex items-center gap-2">
                <select
                  value={newTaskStatus}
                  onChange={(e) => setNewTaskStatus(e.target.value as TaskStatus)}
                  className="px-3 py-2.5 bg-card border border-border rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                  title="Initial status"
                >
                  <option value="todo">⚪ To Do (0%)</option>
                  <option value="in_progress">⏳ Half Done (50%)</option>
                  <option value="completed">✅ Completed (100%)</option>
                </select>
                <button
                  type="submit"
                  disabled={addTaskMutation.isPending}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground text-xs sm:text-sm font-semibold rounded-xl hover:bg-primary/90 active:scale-95 transition shadow-sm disabled:opacity-70 whitespace-nowrap"
                >
                  {addTaskMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Add Task
                </button>
              </div>
            </form>

            {/* Filter chips */}
            {tasks.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {([
                  { id: 'all' as const, label: 'All Tasks', count: tasks.length },
                  { id: 'in_progress' as const, label: '⏳ Half Done (50%)', count: inProgressTasksCount },
                  { id: 'completed' as const, label: '✅ Done (100%)', count: completedTasksCount },
                  { id: 'todo' as const, label: '⚪ To Do (0%)', count: todoTasksCount },
                ]).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setTaskFilter(f.id)}
                    className={`px-3 py-1.5 rounded-xl font-medium transition whitespace-nowrap flex items-center gap-1.5 ${
                      taskFilter === f.id
                        ? 'bg-foreground text-background font-bold shadow-xs'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <span>{f.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      taskFilter === f.id ? 'bg-background/20 text-background' : 'bg-primary/10 text-primary'
                    }`}>
                      {f.count}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Task List */}
            <div className="space-y-2.5">
              <AnimatePresence initial={false}>
                {filteredTasks.length === 0 ? (
                  <div className="py-14 text-center border border-dashed border-border rounded-2xl space-y-2">
                    <CheckSquare className="w-8 h-8 mx-auto text-muted-foreground/40" />
                    <p className="text-xs font-semibold text-muted-foreground">
                      {tasks.length === 0 ? 'No tasks yet' : 'No tasks matching this filter'}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {tasks.length === 0
                        ? 'Add milestones above to track your collaboration progress'
                        : 'Switch filter or add new tasks above'}
                    </p>
                  </div>
                ) : (
                  filteredTasks.map((task) => {
                    const currentStatus = getEffectiveStatus(task);
                    const nextStatus: TaskStatus =
                      currentStatus === 'todo' ? 'in_progress' : currentStatus === 'in_progress' ? 'completed' : 'todo';

                    return (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl border transition ${
                          currentStatus === 'completed'
                            ? 'bg-muted/15 border-border/40 text-muted-foreground border-l-4 border-l-emerald-500'
                            : currentStatus === 'in_progress'
                            ? 'bg-amber-500/[0.04] border-amber-500/30 text-foreground border-l-4 border-l-amber-500 shadow-xs'
                            : 'bg-card border-border text-foreground shadow-xs hover:border-primary/30'
                        }`}
                      >
                        {/* Left: Cycle Status Icon + Title */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <button
                            type="button"
                            onClick={() => updateTaskStatusMutation.mutate({ id: task.id, status: nextStatus })}
                            disabled={updateTaskStatusMutation.isPending}
                            className="shrink-0 transition hover:scale-110 active:scale-95"
                            title={`Status: ${
                              currentStatus === 'completed' ? 'Completed (100%)' : currentStatus === 'in_progress' ? 'Half Done / In Progress (50%)' : 'To Do (0%)'
                            }. Click to cycle!`}
                          >
                            {currentStatus === 'completed' ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                            ) : currentStatus === 'in_progress' ? (
                              <Clock className="w-5 h-5 text-amber-500 fill-amber-500/20" />
                            ) : (
                              <Circle className="w-5 h-5 text-muted-foreground hover:text-amber-500 transition" />
                            )}
                          </button>

                          {/* Task title / inline edit */}
                          <div className="flex-1 min-w-0">
                            {editingTaskId === task.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  ref={editInputRef}
                                  type="text"
                                  value={editingTaskTitle}
                                  onChange={(e) => setEditingTaskTitle(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveEditTask();
                                    if (e.key === 'Escape') cancelEditTask();
                                  }}
                                  className="flex-1 px-3 py-1.5 bg-background border border-primary/40 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                                />
                                <button
                                  type="button"
                                  onClick={saveEditTask}
                                  disabled={editTaskMutation.isPending || !editingTaskTitle.trim()}
                                  className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50"
                                >
                                  {editTaskMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEditTask}
                                  className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 transition text-muted-foreground"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-xs sm:text-sm font-medium truncate block ${
                                  currentStatus === 'completed' ? 'line-through text-muted-foreground' : ''
                                }`}>
                                  {task.title}
                                </span>
                                {currentStatus === 'in_progress' && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                                    <Clock className="w-2.5 h-2.5" /> Half Done (50%)
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right: Quick Status Buttons + Actions */}
                        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                          {/* 3-Way Status Selector */}
                          <div className="inline-flex items-center bg-muted/60 p-0.5 rounded-xl border border-border/50 text-[11px] font-semibold">
                            <button
                              type="button"
                              onClick={() => updateTaskStatusMutation.mutate({ id: task.id, status: 'todo' })}
                              disabled={updateTaskStatusMutation.isPending}
                              className={`px-2.5 py-1 rounded-lg transition ${
                                currentStatus === 'todo'
                                  ? 'bg-background text-foreground shadow-xs font-bold'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                              title="Mark as To Do (0%)"
                            >
                              To Do
                            </button>
                            <button
                              type="button"
                              onClick={() => updateTaskStatusMutation.mutate({ id: task.id, status: 'in_progress' })}
                              disabled={updateTaskStatusMutation.isPending}
                              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
                                currentStatus === 'in_progress'
                                  ? 'bg-amber-500 text-white shadow-xs font-bold'
                                  : 'text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400'
                              }`}
                              title="Mark as Half Done / In Progress (50%)"
                            >
                              <Clock className="w-3 h-3" />
                              <span>Half Done (50%)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => updateTaskStatusMutation.mutate({ id: task.id, status: 'completed' })}
                              disabled={updateTaskStatusMutation.isPending}
                              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
                                currentStatus === 'completed'
                                  ? 'bg-emerald-500 text-white shadow-xs font-bold'
                                  : 'text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400'
                              }`}
                              title="Mark as Completed (100%)"
                            >
                              <Check className="w-3 h-3" />
                              <span>Done</span>
                            </button>
                          </div>

                          {/* Action buttons */}
                          {editingTaskId !== task.id && (
                            <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition shrink-0">
                              <button
                                type="button"
                                onClick={() => startEditTask(task.id, task.title)}
                                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition"
                                title="Edit task"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              {(isOwner || task.created_by === user?.id) && (
                                <button
                                  type="button"
                                  onClick={() => deleteTaskMutation.mutate(task.id)}
                                  disabled={deleteTaskMutation.isPending}
                                  className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition"
                                  title="Delete task"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════
            Tab 2: Discussion / Real-Time Chat
        ════════════════════════════════════════════════════ */}
        {activeTab === 'discussion' && (
          <div className="mt-6 flex flex-col h-[600px] bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-border/60 bg-muted/20 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <MessageSquare className="w-4 h-4 text-primary" />
                <span>Project Discussion</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  realtimeConnected
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-muted text-muted-foreground border border-border'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${realtimeConnected ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'}`} />
                  {realtimeConnected ? 'Live' : 'Connecting...'}
                </span>
                <span className="text-[11px] text-muted-foreground hidden sm:block">🔒 Private to this workspace</span>
              </div>
            </div>

            {/* Messages feed */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {allMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <MessageSquare className="w-10 h-10 opacity-20 mb-3" />
                  <p className="text-sm font-semibold text-foreground">No messages yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Start the conversation with your collaborator!</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {allMessages.map((msg) => {
                    const isMe = msg.sender_id === user?.id;
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-2.5 max-w-[80%] ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                      >
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0 overflow-hidden">
                          {msg.profiles?.avatar_url ? (
                            <img src={msg.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            msg.profiles?.full_name ? msg.profiles.full_name.charAt(0).toUpperCase() : <User className="w-4 h-4" />
                          )}
                        </div>

                        {/* Bubble */}
                        <div className={`space-y-1 flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span className="font-semibold text-foreground/80">{msg.profiles?.full_name || 'Collaborator'}</span>
                            <span>•</span>
                            <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line max-w-[320px] ${
                            isMe
                              ? 'bg-primary text-primary-foreground rounded-tr-sm'
                              : 'bg-muted/70 text-foreground rounded-tl-sm border border-border/50'
                          }`}>
                            {msg.message}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (chatMessage.trim()) sendMessageMutation.mutate(chatMessage);
              }}
              className="p-3 border-t border-border/60 bg-muted/10 flex gap-2 shrink-0"
            >
              <input
                ref={chatInputRef}
                type="text"
                placeholder="Type a message..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (chatMessage.trim()) sendMessageMutation.mutate(chatMessage);
                  }
                }}
                className="flex-1 px-4 py-2.5 bg-background border border-border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/60"
              />
              <button
                type="submit"
                disabled={sendMessageMutation.isPending || !chatMessage.trim()}
                className="p-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition disabled:opacity-50"
              >
                {sendMessageMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>
        )}

        {/* ════════════════════════════════════════════════════
            Tab 3: Work Deliverables
        ════════════════════════════════════════════════════ */}
        {activeTab === 'deliverables' && (
          <div className="mt-6 space-y-6">
            {/* Submission Form — only for approved developers (not owner) */}
            {!isOwner && (
              <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-base text-foreground">Submit Your Work</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Provide your source code repository, deployment URL, and a summary of what you've completed.
                </p>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1 mb-1">
                    Deliverable Title (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Final Source Code & Live Prototype, Sprint 1 MVP"
                    value={deliverableTitle}
                    onChange={(e) => setDeliverableTitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1 mb-1">
                      <Github className="w-3.5 h-3.5" /> GitHub Repository URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://github.com/username/repo"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1 mb-1">
                      <Globe className="w-3.5 h-3.5" /> Live Demo / Deployment URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://my-app.vercel.app"
                      value={demoUrl}
                      onChange={(e) => setDemoUrl(e.target.value)}
                      className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">
                    Delivery Notes & Summary <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe what's been completed, how to test/run the code, key highlights, and anything the owner should know..."
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                  />
                </div>

                <button
                  type="button"
                  disabled={submitDeliverableMutation.isPending || !deliveryNotes.trim()}
                  onClick={() => submitDeliverableMutation.mutate()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-xs sm:text-sm font-semibold rounded-xl hover:bg-primary/90 transition shadow-sm disabled:opacity-50"
                >
                  {submitDeliverableMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit Work to Owner
                </button>
              </div>
            )}

            {/* Deliverables list */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" />
                Submitted Deliverables ({deliverables.length})
              </h3>

              {deliverables.length === 0 ? (
                <div className="py-14 text-center border border-dashed border-border rounded-2xl space-y-2">
                  <Globe className="w-8 h-8 mx-auto text-muted-foreground/40" />
                  <p className="text-xs font-semibold text-muted-foreground">No deliverables yet</p>
                  {isOwner
                    ? <p className="text-[11px] text-muted-foreground">Once the developer submits their work, it will appear here.</p>
                    : <p className="text-[11px] text-muted-foreground">Use the form above to submit your completed work.</p>
                  }
                </div>
              ) : (
                <div className="space-y-4">
                  {(deliverables as ProjectDeliverableWithDeveloper[]).map((item) => {
                    const effectiveGithubUrl = item.github_repo_url || item.github_url;
                    const effectiveDemoUrl = item.live_demo_url || item.demo_url;
                    const effectiveDate = item.submitted_at || item.created_at;
                    const isReviewing = reviewingDeliverable === item.id;

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-4"
                      >
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/50">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0 overflow-hidden">
                              {item.profiles?.avatar_url ? (
                                <img src={item.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                item.profiles?.full_name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-foreground">
                                {item.profiles?.full_name || 'Developer'}
                              </span>
                              <span className="text-[10px] text-muted-foreground ml-2">
                                {new Date(effectiveDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          </div>

                          <span className={`self-start sm:self-auto text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize border ${
                            item.status === 'accepted'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : item.status === 'revision_requested'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                              : 'bg-primary/10 text-primary border-primary/20'
                          }`}>
                            {item.status === 'revision_requested' ? '🔄 Revision Requested' : item.status === 'accepted' ? '✅ Accepted' : '⏳ Under Review'}
                          </span>
                        </div>

                        {/* Title */}
                        {item.title && (
                          <h4 className="font-semibold text-sm text-foreground">{item.title}</h4>
                        )}

                        {/* Notes */}
                        {item.notes && (
                          <p className="text-xs sm:text-sm text-foreground/90 whitespace-pre-line leading-relaxed bg-muted/20 p-3.5 rounded-xl border border-border/50">
                            {item.notes}
                          </p>
                        )}

                        {/* Reviewer notes */}
                        {(item.reviewer_notes || item.feedback) && (
                          <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1">
                            <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">Owner Feedback:</p>
                            <p className="text-xs text-foreground/80 leading-relaxed">{item.reviewer_notes || item.feedback}</p>
                          </div>
                        )}

                        {/* Links */}
                        <div className="flex flex-wrap items-center gap-3">
                          {effectiveGithubUrl && (
                            <a
                              href={effectiveGithubUrl.startsWith('http') ? effectiveGithubUrl : `https://${effectiveGithubUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold border border-border transition"
                            >
                              <Github className="w-3.5 h-3.5" />
                              View Repository
                              <ExternalLink className="w-3 h-3 opacity-60" />
                            </a>
                          )}
                          {effectiveDemoUrl && (
                            <a
                              href={effectiveDemoUrl.startsWith('http') ? effectiveDemoUrl : `https://${effectiveDemoUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold border border-border transition"
                            >
                              <Globe className="w-3.5 h-3.5 text-blue-500" />
                              Live Demo
                              <ExternalLink className="w-3 h-3 opacity-60" />
                            </a>
                          )}
                        </div>

                        {/* Owner review actions */}
                        {isOwner && item.status !== 'accepted' && (
                          <div className="pt-1 border-t border-border/50">
                            {isReviewing ? (
                              <div className="space-y-3">
                                <textarea
                                  rows={2}
                                  placeholder="Add feedback or revision notes (optional)..."
                                  value={reviewNotes}
                                  onChange={(e) => setReviewNotes(e.target.value)}
                                  className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                                />
                                <div className="flex items-center gap-2 flex-wrap">
                                  <button
                                    type="button"
                                    disabled={reviewDeliverableMutation.isPending}
                                    onClick={() => reviewDeliverableMutation.mutate({ id: item.id, status: 'accepted', notes: reviewNotes })}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition disabled:opacity-50"
                                  >
                                    {reviewDeliverableMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ThumbsUp className="w-3.5 h-3.5" />}
                                    Accept Work
                                  </button>
                                  <button
                                    type="button"
                                    disabled={reviewDeliverableMutation.isPending}
                                    onClick={() => reviewDeliverableMutation.mutate({ id: item.id, status: 'revision_requested', notes: reviewNotes })}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition disabled:opacity-50"
                                  >
                                    {reviewDeliverableMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                                    Request Revision
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => { setReviewingDeliverable(null); setReviewNotes(''); }}
                                    className="px-4 py-2 rounded-xl bg-muted text-muted-foreground text-xs font-medium hover:bg-muted/80 transition"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setReviewingDeliverable(item.id)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Review This Submission
                              </button>
                            )}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════
            Tab 4: Protected Specs & Requirements
        ════════════════════════════════════════════════════ */}
        {activeTab === 'specs' && (
          <div className="mt-6 space-y-5">
            {!requirements ? (
              <div className="py-14 text-center border border-dashed border-border rounded-2xl space-y-2">
                <FileText className="w-8 h-8 mx-auto text-muted-foreground/40" />
                <p className="text-xs font-semibold text-muted-foreground">No specifications recorded</p>
                {isOwner && (
                  <p className="text-[11px] text-muted-foreground">
                    <button onClick={() => navigate(`/project/${project.slug || project.id}/edit`)} className="text-primary underline">Edit your project</button> to add confidential specifications.
                  </p>
                )}
              </div>
            ) : (
              <>
                <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-primary">Confidential</div>
                      <h2 className="text-base font-bold text-foreground">Detailed Business Specifications</h2>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/40 border border-border/50 text-xs sm:text-sm leading-relaxed whitespace-pre-line text-foreground/90 min-h-[80px]">
                    {requirements.detailed_requirements || 'No detailed specifications recorded.'}
                  </div>
                </div>

                {requirements.feature_list && (
                  <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-3">
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-primary" />
                      Feature Checklist & Expectations
                    </h3>
                    <div className="p-4 rounded-xl bg-muted/40 border border-border/50 text-xs sm:text-sm leading-relaxed whitespace-pre-line text-foreground/90">
                      {requirements.feature_list}
                    </div>
                  </div>
                )}

                {requirements.deliverables && (
                  <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-3">
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                      <Globe className="w-4 h-4 text-primary" />
                      Expected Deliverables
                    </h3>
                    <div className="p-4 rounded-xl bg-muted/40 border border-border/50 text-xs sm:text-sm leading-relaxed whitespace-pre-line text-foreground/90">
                      {requirements.deliverables}
                    </div>
                  </div>
                )}

                {requirements.confidential_notes && (
                  <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 shadow-sm space-y-2">
                    <h3 className="font-bold text-sm text-amber-700 dark:text-amber-300 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Confidential Owner Notes
                    </h3>
                    <p className="text-xs sm:text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                      {requirements.confidential_notes}
                    </p>
                  </div>
                )}

                {requirements.credentials && (
                  <div className="p-6 rounded-2xl bg-destructive/5 border border-destructive/20 shadow-sm space-y-2">
                    <h3 className="font-bold text-sm text-destructive flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Access Credentials
                    </h3>
                    <p className="text-xs text-muted-foreground">Handle with care. Do not share outside this workspace.</p>
                    <div className="p-4 rounded-xl bg-background border border-border text-xs sm:text-sm text-foreground/90 whitespace-pre-line font-mono leading-relaxed">
                      {requirements.credentials}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Project Review Modal ── */}
      <ProjectReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        projectId={projectId!}
        projectTitle={project.title}
        revieweeId={revieweeId}
        revieweeName={revieweeName}
        reviewerRole={reviewerRole}
        onReviewSubmitted={() => queryClient.invalidateQueries({ queryKey: ['project-reviews', projectId] })}
      />
    </div>
  );
};

export default ProjectWorkspacePage;
