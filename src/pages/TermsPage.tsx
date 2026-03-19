import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Shield, Users, CreditCard, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 pb-24 md:pb-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-4 pb-2">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-subhead text-foreground">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mt-1">Last updated: March 2026</p>
      </motion.div>

      {/* Introduction */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-primary/5 rounded-2xl p-6 mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Welcome to Aaspass</h2>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          These terms govern your use of Aaspass, a hyperlocal marketplace connecting buyers and sellers. By using our platform, you agree to these terms.
        </p>
      </motion.div>

      {/* Acceptance of Terms */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-foreground mb-4">1. Acceptance of Terms</h2>
        <p className="text-muted-foreground leading-relaxed">
          By accessing or using Aaspass, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our platform.
        </p>
      </motion.div>

      {/* Platform Services */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-foreground mb-4">2. Platform Services</h2>
        <p className="text-muted-foreground mb-4">
          Aaspass provides a platform for:
        </p>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
            <span>Connecting buyers with local sellers and service providers</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
            <span>Displaying seller listings with contact information</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
            <span>Distance-based discovery and search functionality</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
            <span>Subscription-based seller services</span>
          </li>
        </ul>
      </motion.div>

      {/* User Responsibilities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-foreground mb-4">3. User Responsibilities</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-muted/30 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">For All Users</h3>
            </div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Provide accurate information</li>
              <li>• Maintain account security</li>
              <li>• Respect other users</li>
              <li>• Follow applicable laws</li>
            </ul>
          </div>
          <div className="bg-muted/30 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">For Sellers</h3>
            </div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Provide accurate listings</li>
              <li>• Honor commitments</li>
              <li>• Maintain quality standards</li>
              <li>• Respond to inquiries promptly</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Prohibited Activities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-foreground mb-4">4. Prohibited Activities</h2>
        <div className="bg-card rounded-xl p-6 shadow-card">
          <p className="text-muted-foreground mb-4">You may not use Aaspass to:</p>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
              <span>Sell illegal or prohibited items/services</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
              <span>Post false or misleading information</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
              <span>Engage in fraudulent activities</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
              <span>Spam or harass other users</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
              <span>Violate intellectual property rights</span>
            </li>
          </ul>
        </div>
      </motion.div>

      {/* Payment Terms */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-foreground mb-4">5. Payment Terms</h2>
        <div className="bg-primary/5 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Seller Subscriptions</h3>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Monthly: ₹100/month, billed monthly</li>
            <li>• Annual: ₹1,200/year, billed annually (save 20%)</li>
            <li>• Payments processed securely through our partners</li>
            <li>• Subscriptions auto-renew unless cancelled</li>
            <li>• No refunds for partial months</li>
          </ul>
        </div>
      </motion.div>

      {/* Liability and Disclaimers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-foreground mb-4">6. Liability and Disclaimers</h2>
        <div className="space-y-4">
          <div className="bg-muted/30 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-foreground">Platform Limitation</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Aaspass is a platform connecting buyers and sellers. We don't directly facilitate transactions or guarantee seller performance.
            </p>
          </div>
          <div className="bg-muted/30 rounded-xl p-4">
            <h3 className="font-semibold text-foreground mb-2">User Discretion</h3>
            <p className="text-sm text-muted-foreground">
              Users should exercise discretion when interacting with sellers. Verify credentials and conduct due diligence before making purchases.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Intellectual Property */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-foreground mb-4">7. Intellectual Property</h2>
        <p className="text-muted-foreground leading-relaxed">
          All content on Aaspass, including text, graphics, logos, and software, is owned by Aaspass or its licensors and is protected by intellectual property laws.
        </p>
      </motion.div>

      {/* Termination */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-foreground mb-4">8. Account Termination</h2>
        <p className="text-muted-foreground leading-relaxed">
          We may suspend or terminate accounts that violate these terms. Users may also close their accounts at any time through their profile settings.
        </p>
      </motion.div>

      {/* Changes to Terms */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-foreground mb-4">9. Changes to Terms</h2>
        <p className="text-muted-foreground leading-relaxed">
          We may update these terms periodically. Changes will be effective immediately upon posting. Continued use of the platform constitutes acceptance of updated terms.
        </p>
      </motion.div>

      {/* Contact Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="bg-card rounded-xl p-6 shadow-card"
      >
        <h2 className="text-xl font-bold text-foreground mb-3">Questions About These Terms?</h2>
        <p className="text-muted-foreground mb-4">
          If you have questions about these Terms of Service, contact us:
        </p>
        <div className="space-y-2 text-sm">
          <p><strong>Email:</strong> legal@aaspass.com</p>
          <p><strong>Phone:</strong> +91 98765 43210</p>
          <p className="text-xs text-muted-foreground mt-3">
            These terms are governed by the laws of India.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default TermsPage;
