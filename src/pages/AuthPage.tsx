import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Lock, User, ArrowRight, Eye, EyeOff, Store, Phone
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '@/store/app-store';

// ─── Test User Data ───────────────────────────────────────────────────────
const TEST_USER = {
  email: 'doraemonsnacks@gmail.com',
  password: '0000000',
  name: 'Doraemon Snacks',
  phone: '9876543210',
  gender: null,
};

// ─── Dynamic Image Panel ───────────────────────────────────────────────
const ImagePanel = ({ mode }: { mode: 'login' | 'signup' }) => (
  <div className="hidden lg:flex flex-col relative bg-muted overflow-hidden min-h-screen h-full w-full">
    <AnimatePresence mode="popLayout">
      <motion.img
        key={mode}
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1.15 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        src={
          mode === 'login'
            ? "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=90&w=1920" // Friends collaborating and building a business together
            : "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=90&w=1920" // Arts and painting at home
        }
        alt="Local neighbourhood shop"
        className="absolute inset-0 w-full h-full object-cover"
      />
    </AnimatePresence>
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

    {/* Bottom tagline */}
    <div className="relative z-10 mt-auto p-12 text-white">
      <div className="mb-2">
        <img src="/aplg.png" alt="Aaspass" className="h-16 w-auto object-contain" />
      </div>
      <h2 className="text-3xl font-bold leading-tight drop-shadow-md">
        {mode === 'login' ? (
          <>Welcome back to<br />your local market.</>
        ) : (
          <>Your neighbourhood,<br />in your pocket.</>
        )}
      </h2>
      <p className="text-white/90 text-sm mt-3 max-w-sm leading-relaxed drop-shadow">
        Join the community to discover amazing local sellers, home-chefs, and services just down the street.
      </p>
    </div>
  </div>
);

// ─── Form panel ────────────────────────────────────────────────────────────
type Mode = 'login' | 'signup';

const formVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -40 : 40,
    opacity: 0,
  }),
};

const AuthPage = () => {
  const navigate = useNavigate();
  const { setUser } = useAppStore();
  const location = useLocation();
  const [mode, setMode] = useState<Mode>((location.state as any)?.mode || 'login');
  const [direction, setDirection] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [loading, setLoading] = useState(false);

  // Validation functions
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!validateEmail(email)) {
      newErrors.email = 'Invalid email address';
    }

    if (mode === 'signup') {
      // Name validation
      if (!validateName(name)) {
        newErrors.name = 'Name should only contain letters and spaces';
      }

      // Phone validation
      if (!validatePhone(phone)) {
        newErrors.phone = 'Phone number must be 10 digits';
      }

      // Password match validation
      if (password !== confirmPassword) {
        newErrors.password = "Passwords don't match!";
      }

      if (password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1200));

    if (mode === 'login') {
      // Check against test user
      if (email === TEST_USER.email && password === TEST_USER.password) {
        setUser({
          email: TEST_USER.email,
          name: TEST_USER.name,
          phone: TEST_USER.phone,
          gender: null,
        });
        setLoading(false);
        navigate('/profile');
      } else {
        setLoading(false);
        setErrors({ email: 'Invalid email or password' });
      }
    } else {
      // Signup - in test mode, create user with provided info
      setUser({
        email: email,
        name: name,
        phone: phone,
        gender: null,
      });
      setLoading(false);
      navigate('/profile');
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${mode === 'login' ? 'lg:flex-row' : 'lg:flex-row-reverse'} overflow-hidden`}>
      {/* Image Panel */}
      <motion.div 
        layout 
        transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }} 
        className="w-full lg:w-1/2 flex-shrink-0"
      >
        <ImagePanel mode={mode} />
      </motion.div>

      {/* Form Panel */}
      <motion.div 
        layout 
        transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }} 
        className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-8 bg-background min-h-screen relative z-10 overflow-y-auto"
      >
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-6 mt-4">
          <img src="/aplg.png" alt="Aaspass" className="h-10 w-auto object-contain" />
        </div>

        <div className="w-full max-w-md my-auto">
          {/* Tab switcher */}
          <div className="flex gap-1 p-1 bg-muted rounded-xl mb-8">
            {(['login', 'signup'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  mode === m
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Animated form swap */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.form
              key={mode}
              custom={direction}
              variants={formVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
            >
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-foreground">
                  {mode === 'login' ? 'Welcome back 👋' : 'Create account 🎉'}
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground mt-1 mb-3">
                  {mode === 'login'
                    ? 'Sign in to discover local sellers near you.'
                    : 'Join Aaspass and explore your neighbourhood.'}
                </p>
              </div>

              {/* Name field (signup only) */}
              {mode === 'signup' && (
                <div>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Full name"
                      value={name}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                        setName(value);
                        if (errors.name) setErrors({ ...errors, name: '' });
                      }}
                      required
                      className="w-full pl-10 pr-4 py-2.5 md:py-3 rounded-xl bg-muted text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
              )}

              {/* Phone field (signup only) */}
              {mode === 'signup' && (
                <div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="tel"
                      placeholder="Phone number (10 digits)"
                      value={phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setPhone(value);
                        if (errors.phone) setErrors({ ...errors, phone: '' });
                      }}
                      maxLength={10}
                      required
                      className="w-full pl-10 pr-4 py-2.5 md:py-3 rounded-xl bg-muted text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
              )}

              {/* Email */}
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    required
                    className="w-full pl-10 pr-4 py-2.5 md:py-3 rounded-xl bg-muted text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-10 py-2.5 md:py-3 rounded-xl bg-muted text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Confirm Password (signup only) */}
              {mode === 'signup' && (
                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.password) setErrors({ ...errors, password: '' });
                      }}
                      required
                      minLength={6}
                      className="w-full pl-10 pr-10 py-2.5 md:py-3 rounded-xl bg-muted text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>
              )}

              {/* Forgot password */}
              {mode === 'login' && (
                <div className="text-right -mt-1">
                  <button 
                    type="button" 
                    onClick={() => navigate('/forgot-password')}
                    className="text-[13px] text-primary hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Submit */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-60 transition-opacity mt-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                  </>
                )}
              </motion.button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-2 text-muted-foreground pb-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs font-medium uppercase tracking-wider">or sign in with</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Google Button */}
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => {
                    setUser({
                      email: 'googleuser@gmail.com',
                      name: 'Google User',
                      phone: null,
                      gender: null,
                    });
                    setLoading(false);
                    navigate('/profile');
                  }, 800);
                }}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-border bg-background hover:bg-muted text-foreground text-sm font-semibold transition-colors mb-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>


              {/* Switch mode link */}
              <p className="text-sm text-center text-muted-foreground">
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
      </motion.div>
    </div>
  );
};

export default AuthPage;
