import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Eye, Database, User, Globe, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPage = () => {
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
        <h1 className="text-subhead text-foreground">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mt-1">How we protect your data</p>
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
          <h2 className="text-xl font-bold text-foreground">Your Privacy Matters</h2>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          At Aaspass, we're committed to protecting your personal information and ensuring your privacy. This policy explains how we collect, use, and safeguard your data when you use our platform.
        </p>
      </motion.div>

      {/* Information We Collect */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-foreground mb-4">Information We Collect</h2>
        <div className="space-y-4">
          <div className="bg-muted/30 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <User className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Personal Information</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Name, email address, phone number, and age when you create an account or make a purchase.
            </p>
          </div>

          <div className="bg-muted/30 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Location Information</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Your approximate location to show nearby sellers and calculate distances. We never share your exact address.
            </p>
          </div>

          <div className="bg-muted/30 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Database className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Usage Data</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              How you interact with our platform, including searches, views, and communications with sellers.
            </p>
          </div>

          <div className="bg-muted/30 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Eye className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Device Information</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Browser type, operating system, and IP address to improve our service and ensure security.
            </p>
          </div>
        </div>
      </motion.div>

      {/* How We Use Your Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-foreground mb-4">How We Use Your Information</h2>
        <ul className="space-y-3 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
            <span>Connect you with local sellers and calculate distances</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
            <span>Process payments and manage seller subscriptions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
            <span>Improve our platform and personalize your experience</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
            <span>Send important updates and support messages</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
            <span>Ensure platform security and prevent fraud</span>
          </li>
        </ul>
      </motion.div>

      {/* Information Sharing */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-foreground mb-4">Information Sharing</h2>
        <div className="bg-card rounded-xl p-6 shadow-card">
          <p className="text-muted-foreground mb-4">
            We believe in transparency and control over your data:
          </p>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
              <span><strong>Public Listings:</strong> Your business name, area, and contact info are visible to buyers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
              <span><strong>Never Sold:</strong> We never sell your personal information to third parties</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
              <span><strong>Legal Compliance:</strong> We may share data when required by law</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
              <span><strong>Service Providers:</strong> Only with trusted partners for essential services</span>
            </li>
          </ul>
        </div>
      </motion.div>

      {/* Your Rights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-foreground mb-4">Your Privacy Rights</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-muted/30 rounded-xl p-4">
            <h3 className="font-semibold text-foreground mb-2">Access</h3>
            <p className="text-sm text-muted-foreground">
              Request a copy of your personal data at any time.
            </p>
          </div>
          <div className="bg-muted/30 rounded-xl p-4">
            <h3 className="font-semibold text-foreground mb-2">Correction</h3>
            <p className="text-sm text-muted-foreground">
              Update or correct inaccurate personal information.
            </p>
          </div>
          <div className="bg-muted/30 rounded-xl p-4">
            <h3 className="font-semibold text-foreground mb-2">Deletion</h3>
            <p className="text-sm text-muted-foreground">
              Request deletion of your account and personal data.
            </p>
          </div>
          <div className="bg-muted/30 rounded-xl p-4">
            <h3 className="font-semibold text-foreground mb-2">Portability</h3>
            <p className="text-sm text-muted-foreground">
              Export your data in a usable format.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Data Security */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-foreground mb-4">Data Security</h2>
        <div className="bg-primary/5 rounded-xl p-6">
          <p className="text-muted-foreground mb-4">
            We implement industry-standard security measures to protect your information:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• SSL encryption for all data transmissions</li>
            <li>• Secure servers with regular security updates</li>
            <li>• Limited access to personal data</li>
            <li>• Regular security audits and testing</li>
            <li>• Secure payment processing partners</li>
          </ul>
        </div>
      </motion.div>

      {/* Contact */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-card rounded-xl p-6 shadow-card"
      >
        <h2 className="text-xl font-bold text-foreground mb-3">Questions About Privacy?</h2>
        <p className="text-muted-foreground mb-4">
          If you have questions about this privacy policy or want to exercise your rights, contact us:
        </p>
        <div className="space-y-2 text-sm">
          <p><strong>Email:</strong> privacy@aaspass.com</p>
          <p><strong>Phone:</strong> +91 98765 43210</p>
          <p className="text-xs text-muted-foreground mt-3">
            We'll respond to privacy inquiries within 7 business days.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyPage;
