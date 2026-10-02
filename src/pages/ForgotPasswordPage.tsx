import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { resetPasswordForEmail } from '@/lib/api/auth';
import { useToast } from '@/hooks/use-toast';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);

    try {
      await resetPasswordForEmail(email.trim(), `${window.location.origin}/reset-password`);
      setSubmitted(true);
    } catch (err: unknown) {
      const error = err as Error;
      let message = error?.message || 'Failed to send reset link. Please try again.';

      if (
        message.toLowerCase().includes('failed to fetch') ||
        message.toLowerCase().includes('network') ||
        message.toLowerCase().includes('connection')
      ) {
        message = 'Unable to connect to the authentication server. Please check your internet connection or verify your Supabase project status.';
      }

      toast({
        title: 'Reset link failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col relative bg-muted overflow-hidden min-h-full">
        <motion.img
          initial={{ scale: 1 }}
          animate={{ scale: 1.15 }}
          transition={{ duration: 25, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200"
          alt="Students and freelancers collaborating"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 pointer-events-none" />
        <div className="relative z-10 mt-auto p-12 text-white">
          <div className="mb-3">
            <img src="/aplg.png" alt="Spotgig" className="h-12 w-auto object-contain brightness-110 drop-shadow" />
          </div>
          <h2 className="text-3xl font-bold leading-tight drop-shadow-md">
            Don't worry, we've got you covered.
          </h2>
          <p className="text-white/90 text-sm mt-2 max-w-sm leading-relaxed drop-shadow">
            Recover your password to get back to discovering local student talent and freelance projects.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-col items-center justify-center px-6 py-12 bg-background min-h-screen">
        <div className="w-full max-w-sm my-auto pb-10">
          <button
            onClick={() => navigate('/auth')}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </button>

          {!submitted ? (
            <motion.form
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
            >
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Reset password
                </h1>
                <p className="text-sm text-muted-foreground mt-2 mb-4 leading-relaxed">
                  Enter the email address associated with your account and we'll send you a link to reset your password.
                </p>
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-60 transition-opacity mt-4"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    Send reset link
                  </>
                )}
              </motion.button>
            </motion.form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Check your mail</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                We have sent password recovery instructions to <span className="font-semibold text-foreground">{email}</span>. Please click the link inside the email to set your new password.
              </p>
              
              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
                >
                  {loading ? 'Resending...' : 'Resend email'}
                </button>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Use a different email address
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/auth')}
                  className="text-sm font-semibold text-primary hover:underline mt-3"
                >
                  Return to login
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
