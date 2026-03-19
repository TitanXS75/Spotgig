import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Check, X, AlertTriangle, Phone, MapPin, Users, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SafetyTipsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 pb-24 md:pb-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-4 pb-2">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
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
          While Aaspass connects you with local sellers, your safety is paramount. Follow these guidelines to ensure secure and positive experiences.
        </p>
      </motion.div>

      {/* For Buyers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-foreground mb-4">For Buyers</h2>
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3 mb-2">
              <Check className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-foreground">Do's</h3>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Meet in public places for first transactions</li>
              <li>• Verify the product/service before payment</li>
              <li>• Bring a friend for high-value purchases</li>
              <li>• Keep records of conversations and payments</li>
              <li>• Trust your instincts - if something feels off, it probably is</li>
            </ul>
          </div>

          <div className="bg-red-50 dark:bg-red-950/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3 mb-2">
              <X className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-foreground">Don'ts</h3>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Don't share sensitive financial information</li>
              <li>• Don't pay in advance without verification</li>
              <li>• Don't meet in isolated locations</li>
              <li>• Don't feel pressured to buy immediately</li>
              <li>• Don't ignore red flags or warning signs</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* For Sellers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-foreground mb-4">For Sellers</h2>
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3 mb-2">
              <Check className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-foreground">Best Practices</h3>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Be honest about your products and services</li>
              <li>• Use clear, recent photos and descriptions</li>
              <li>• Respond promptly to customer inquiries</li>
              <li>• Set fair and transparent prices</li>
              <li>• Choose safe meeting locations for transactions</li>
            </ul>
          </div>

          <div className="bg-red-50 dark:bg-red-950/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3 mb-2">
              <X className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-foreground">Avoid These</h3>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Don't misrepresent your products or services</li>
              <li>• Don't use stock photos instead of actual product images</li>
              <li>• Don't pressure customers into quick decisions</li>
              <li>• Don't share excessive personal information</li>
              <li>• Don't meet customers at your home address</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Red Flags */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-foreground mb-4">Red Flags to Watch For</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold text-foreground">Warning Signs</h3>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Prices that seem too good to be true</li>
              <li>• Requests for payment in unusual methods</li>
              <li>• Poor communication or evasive answers</li>
              <li>• Pressure to act immediately</li>
              <li>• Refusal to meet in public places</li>
            </ul>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-3 mb-2">
              <Lock className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold text-foreground">Security Concerns</h3>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Requests for excessive personal data</li>
              <li>• Suspicious payment links or forms</li>
              <li>• Unprofessional communication</li>
              <li>• Inconsistent information provided</li>
              <li>• Refusal to provide basic verification</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Meeting Safety */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-foreground mb-4">Meeting Safety</h2>
        <div className="bg-card rounded-xl p-6 shadow-card">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Choose Public Places</h3>
              <p className="text-sm text-muted-foreground">
                Coffee shops, shopping centers, or other busy public areas
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Bring Someone</h3>
              <p className="text-sm text-muted-foreground">
                Especially for high-value items or first meetings
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Stay Connected</h3>
              <p className="text-sm text-muted-foreground">
                Keep your phone charged and share meeting details with someone
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* What to Do If Something Goes Wrong */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-foreground mb-4">What to Do If Something Goes Wrong</h2>
        <div className="bg-destructive/5 rounded-xl p-6 border border-destructive/20">
          <h3 className="font-semibold text-foreground mb-4">Immediate Steps:</h3>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li>1. <strong>Stop communication</strong> if you feel unsafe or suspicious</li>
            <li>2. <strong>Document everything</strong> - screenshots, messages, transaction details</li>
            <li>3. <strong>Report the user</strong> to Aaspass immediately</li>
            <li>4. <strong>Contact local authorities</strong> if you've been scammed or feel threatened</li>
            <li>5. <strong>Notify your bank</strong> if financial information was compromised</li>
          </ol>
        </div>
      </motion.div>

      {/* Report Issues */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-card rounded-xl p-6 shadow-card"
      >
        <h3 className="text-xl font-bold text-foreground mb-3">Report Safety Concerns</h3>
        <p className="text-muted-foreground mb-4">
          If you encounter suspicious activity or feel unsafe, report it immediately:
        </p>
        <div className="space-y-2 text-sm">
          <p><strong>Email:</strong> safety@aaspass.com</p>
          <p><strong>Emergency:</strong> Contact local authorities immediately</p>
          <p className="text-xs text-muted-foreground mt-3">
            We take safety reports seriously and will respond within 24 hours.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SafetyTipsPage;
