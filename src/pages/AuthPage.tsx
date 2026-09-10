import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Lock, User, Eye, EyeOff, Phone, Briefcase, GraduationCap, ArrowLeft
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { signIn, signUp } from '@/lib/api/auth';
import { useToast } from '@/hooks/use-toast';

// ─── Dynamic Image Panel ───────────────────────────────────────────────
const ImagePanel = ({ mode }: { mode: 'login' | 'signup' }) => (
  <div className="hidden lg:flex flex-col relative bg-muted overflow-hidden h-full w-full">
    <AnimatePresence mode="popLayout">
      <motion.img
        key={mode}
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1.12 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        src={
          mode === 'login'
            ? "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=90&w=1920"
            : "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=90&w=1920"
        }
        alt="Student freelancers and clients collaborating"
        className="absolute inset-0 w-full h-full object-cover"
      />
    </AnimatePresence>
    <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/35 to-black/10 pointer-events-none" />

    {/* Top Left tagline */}
    <div className="relative z-10 p-8 xl:p-10 text-white mr-auto flex flex-col items-start text-left">
      <div className="mb-3">
        <img src="/aplg.png" alt="Aaspass" className="h-12 w-auto object-contain brightness-110 drop-shadow" />
      </div>
      <h2 className="text-2xl xl:text-3xl font-bold leading-tight drop-shadow-md">
        {mode === 'login' ? (
          <>Welcome back <br />let's build something local.</>
        ) : (
          <>Connecting student talent<br />with local opportunities.</>
        )}
      </h2>
      <p className="text-white/90 text-xs xl:text-sm mt-2 max-w-sm leading-relaxed drop-shadow">
        {mode === 'login'
          ? 'Sign in to discover nearby freelancers, post projects, or manage your gigs with zero commission.'
          : 'Join as a client to hire affordable student talent, or as a freelancer to earn real experience and money.'}
      </p>
    </div>
  </div>
);

// ─── Form panel ────────────────────────────────────────────────────────────
type Mode = 'login' | 'signup';
type Role = 'project_owner' | 'developer';

const formVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 30 : -30,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -30 : 30,
    opacity: 0,
  }),
};

const AuthPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const [mode, setMode] = useState<Mode>((location.state as { mode?: Mode } | null)?.mode || 'login');
  const [direction, setDirection] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('developer');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateName = (name: string): boolean => {
    const nameRegex = /^[a-zA-Z\s]*$/;
    return nameRegex.test(name) && name.trim().length > 0;
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  };

  const switchMode = (next: Mode) => {
    setDirection(next === 'signup' ? 1 : -1);
    setMode(next);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!validateEmail(email)) {
      newErrors.email = 'Invalid email address';
    }

    if (mode === 'signup') {
      if (!validateName(name)) {
        newErrors.name = 'Name should only contain letters and spaces';
      }
      if (!validatePhone(phone)) {
        newErrors.phone = 'Phone number must be 10 digits';
      }
      if (password !== confirmPassword) {
        newErrors.password = "Passwords don't match!";
      }
      if (password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);

    try {
      if (mode === 'login') {
        await signIn(email, password);
        toast({ title: 'Welcome back!' });
        navigate('/profile');
      } else {
        await signUp(email, password, name, role);
        toast({
          title: 'Account created!',
          description: `Welcome to Aaspass as a ${role === 'project_owner' ? 'Project Owner' : 'Student / Developer'}.`,
        });
        navigate('/profile');
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrors({ email: error.message || 'Authentication failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/profile`
        }
      });
      if (error) throw error;
    } catch (err: unknown) {
      const error = err as Error;
      setErrors({ email: error.message || 'Google login failed' });
      setLoading(false);
    }
  };

  return (
    <div className="h-screen max-h-screen w-full flex flex-col lg:flex-row overflow-hidden bg-background">
      {/* Form Panel */}
      <div className="w-full lg:w-1/2 h-full flex flex-col justify-center px-5 sm:px-8 xl:px-12 py-4 lg:py-6 overflow-hidden z-10">
        <div className="w-full max-w-sm sm:max-w-md mx-auto my-auto flex flex-col justify-center">

          {/* Header row with Back button */}
          <div className="flex items-center mb-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
          </div>

          {/* Tab switcher with animated sliding pill */}
          <div className="flex gap-1 p-1 bg-muted rounded-xl mb-3 relative">
            {(['login', 'signup'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`relative z-10 flex-1 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors duration-150 ${mode === m
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {mode === m && (
                  <motion.div
                    layoutId="auth-tab-indicator"
                    className="absolute inset-0 bg-background rounded-lg shadow-sm -z-10"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Title & Subtitle */}
          <div className="mb-2">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              {mode === 'login' ? 'Welcome back 👋' : 'Join Aaspass 🚀'}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {mode === 'login'
                ? 'Sign in to access projects and nearby talent.'
                : 'Connect with local clients and student freelancers.'}
            </p>
          </div>

          {/* Animated Form */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.form
              key={mode}
              custom={direction}
              variants={formVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              onSubmit={handleSubmit}
              className="flex flex-col gap-2"
            >
              {/* Role selector (signup only) */}
              {mode === 'signup' && (
                <div className="grid grid-cols-2 gap-2 mb-0.5">
                  <button
                    type="button"
                    onClick={() => setRole('developer')}
                    className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-left ${
                      role === 'developer'
                        ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                        : 'border-border bg-muted/50 text-muted-foreground hover:border-primary/40'
                      }`}
                  >
                    <GraduationCap className="w-4 h-4 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold leading-tight">Student / Dev</p>
                      <p className="text-[10px] text-muted-foreground leading-tight truncate">Gain Real Experience</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('project_owner')}
                    className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-left ${
                      role === 'project_owner'
                        ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                        : 'border-border bg-muted/50 text-muted-foreground hover:border-primary/40'
                      }`}
                  >
                    <Briefcase className="w-4 h-4 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold leading-tight">Project Owner</p>
                      <p className="text-[10px] text-muted-foreground leading-tight truncate">Post Requirements</p>
                    </div>
                  </button>
                </div>
              )}

              {/* In Signup: Name + Phone row */}
              {mode === 'signup' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                          setName(value);
                          if (errors.name) setErrors({ ...errors, name: '' });
                        }}
                        required
                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-muted text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 transition border border-transparent focus:border-primary/30"
                      />
                    </div>
                    {errors.name && <p className="text-destructive text-[10px] mt-0.5">{errors.name}</p>}
                  </div>
                  <div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <input
                        type="tel"
                        placeholder="Phone (10 digits)"
                        value={phone}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setPhone(value);
                          if (errors.phone) setErrors({ ...errors, phone: '' });
                        }}
                        maxLength={10}
                        required
                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-muted text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 transition border border-transparent focus:border-primary/30"
                      />
                    </div>
                    {errors.phone && <p className="text-destructive text-[10px] mt-0.5">{errors.phone}</p>}
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    required
                    className="w-full pl-9 pr-3 py-2 sm:py-2.5 rounded-lg bg-muted text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 transition border border-transparent focus:border-primary/30"
                  />
                </div>
                {errors.email && <p className="text-destructive text-[10px] mt-0.5">{errors.email}</p>}
              </div>

              {/* In Signup: Password + Confirm Password row */}
              {mode === 'signup' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full pl-9 pr-8 py-2 rounded-lg bg-muted text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 transition border border-transparent focus:border-primary/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (errors.password) setErrors({ ...errors, password: '' });
                        }}
                        required
                        minLength={6}
                        className="w-full pl-9 pr-8 py-2 rounded-lg bg-muted text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 transition border border-transparent focus:border-primary/30"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-destructive text-[10px] mt-0.5">{errors.password}</p>}
                  </div>
                </div>
              ) : (
                /* In Login: Single password row with forgot password */
                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full pl-9 pr-8 py-2 sm:py-2.5 rounded-lg bg-muted text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 transition border border-transparent focus:border-primary/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="text-right mt-1">
                    <button
                      type="button"
                      onClick={() => navigate('/forgot-password')}
                      className="text-[11px] sm:text-xs text-primary hover:underline font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>
              )}

              {/* Submit */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs sm:text-sm font-semibold disabled:opacity-60 transition-opacity mt-1 shadow-sm hover:bg-primary/90"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>{mode === 'login' ? 'Sign In' : `Create Account as ${role === 'project_owner' ? 'Project Owner' : 'Student / Developer'}`}</>
                )}
              </motion.button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-0.5 text-muted-foreground">
                <div className="flex-1 h-px bg-border/60" />
                <span className="text-[10px] uppercase font-medium tracking-wider">or</span>
                <div className="flex-1 h-px bg-border/60" />
              </div>

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-border bg-background hover:bg-muted/70 text-foreground text-xs sm:text-sm font-medium transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>

              {/* Switch mode link */}
              <p className="text-xs text-center text-muted-foreground mt-0.5">
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                  className="text-primary font-semibold hover:underline"
                >
                  {mode === 'login' ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </motion.form>
          </AnimatePresence>
        </div>
      </div>

      {/* Image Panel */}
      <div className="w-full lg:w-1/2 h-full flex-shrink-0 hidden lg:block overflow-hidden">
        <ImagePanel mode={mode} />
      </div>
    </div>
  );
};

export default AuthPage;
