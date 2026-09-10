import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Check, X, AlertTriangle, Phone, Lock, Users, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SafetyTipsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 pb-24 md:pb-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-4 pb-2">
        <div className="flex justify-start">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-3 hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
        <h1 className="text-subhead text-foreground">Safety Tips</h1>
        <p className="text-sm text-muted-foreground mt-1">Stay safe while using Aaspass</p>
      </motion.div>

      {/* Introduction */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-primary/5 rounded-2xl p-6 mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Your Safety Matters</h2>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Aaspass connects clients and freelancers nearby. While most interactions are genuine, follow these 
          guidelines to protect yourself during every engagement.
        </p>
      </motion.div>

      {/* For Clients */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">For Clients</h2>
        </div>
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3 mb-2">
              <Check className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-foreground">Do's</h3>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✅ Verify freelancer's LinkedIn and portfolio before hiring</li>
              <li>✅ Agree on project scope, timeline, and payment terms in writing</li>
              <li>✅ Use milestone-based payments for larger projects</li>
              <li>✅ Meet in public or conduct video calls before sharing sensitive materials</li>
              <li>✅ Check reviews and ratings from other clients</li>
              <li>✅ Provide a clear brief to avoid scope disputes</li>
            </ul>
          </div>
          <div className="bg-red-50 dark:bg-red-950/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3 mb-2">
              <X className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-foreground">Don'ts</h3>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>❌ Never pay 100% upfront for large or new projects</li>
              <li>❌ Don't share login credentials or sensitive server access without NDAs</li>
              <li>❌ Avoid platforms that take over your domain/hosting without a contract</li>
              <li>❌ Don't ignore red flags: vague communication is a warning sign</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* For Freelancers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-purple-500" />
          <h2 className="text-2xl font-bold text-foreground">For Freelancers</h2>
        </div>
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3 mb-2">
              <Check className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-foreground">Do's</h3>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✅ Always get project requirements in writing (even WhatsApp/email)</li>
              <li>✅ Take an advance payment (30-50%) before starting work</li>
              <li>✅ Use a simple agreement for projects above ₹5,000</li>
              <li>✅ Watermark deliverables until full payment is received</li>
              <li>✅ Keep communication on record (screenshots of agreements)</li>
              <li>✅ Build your profile with real portfolio links for more trust</li>
            </ul>
          </div>
          <div className="bg-red-50 dark:bg-red-950/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3 mb-2">
              <X className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-foreground">Don'ts</h3>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>❌ Never deliver final files before receiving full payment</li>
              <li>❌ Don't work on verbal agreements alone for large projects</li>
              <li>❌ Avoid sharing your personal bank details publicly</li>
              <li>❌ Don't ignore scope creep: charge for additions beyond the agreed scope</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Payment Safety */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-green-500" />
          <h2 className="text-2xl font-bold text-foreground">Payment Safety</h2>
        </div>
        <div className="bg-muted/30 rounded-xl p-6 space-y-3 text-sm text-muted-foreground">
          <p>💳 Prefer UPI, bank transfer, or well-known payment platforms</p>
          <p>📝 Always get a digital receipt or payment confirmation</p>
          <p>🔐 Never share OTPs or card details with anyone</p>
          <p>⚠️ Report suspicious payment requests to <strong>support@aaspass.com</strong></p>
        </div>
      </motion.div>

      {/* Emergency */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-red-50 dark:bg-red-950/20 rounded-2xl p-6 border border-red-200 dark:border-red-800"
      >
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <h2 className="text-xl font-bold text-foreground">Report a Problem</h2>
        </div>
        <p className="text-muted-foreground mb-4">
          Encountered a fake profile, payment fraud, or any unsafe behaviour? Report immediately.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate('/contact')}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white font-semibold rounded-xl text-sm hover:bg-red-700 transition"
          >
            <Phone className="w-4 h-4" /> Report Now
          </button>
          <button
            onClick={() => window.open('mailto:safety@aaspass.com')}
            className="flex items-center gap-2 px-5 py-2.5 bg-muted text-foreground font-semibold rounded-xl text-sm hover:bg-muted/80 transition"
          >
            safety@aaspass.com
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SafetyTipsPage;
