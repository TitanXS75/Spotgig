import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const SellerCTA = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="bg-primary/5 rounded-2xl p-5 mt-6"
  >
    <h3 className="font-semibold text-foreground text-lg leading-tight">
      Are you a local seller?
    </h3>
    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
      List your business for just ₹100/month and reach customers near you. Save with ₹1,200/year plan!
    </p>
    <motion.button
      whileTap={{ scale: 0.96 }}
      className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg"
    >
      Register Now
      <ArrowRight className="w-4 h-4" />
    </motion.button>
  </motion.div>
);

export default SellerCTA;
