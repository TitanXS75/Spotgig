import { motion } from 'framer-motion';
import { ArrowLeft, Users, Target, Heart, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 pb-24 md:pb-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-4 pb-2">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-subhead text-foreground">About Us</h1>
        <p className="text-sm text-muted-foreground mt-1">Our mission to connect local communities</p>
      </motion.div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center py-12"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Empowering Local Communities
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Aaspass is more than just a marketplace – we're building stronger, more connected neighborhoods by bringing local sellers and buyers together.
        </p>
      </motion.div>

      {/* Mission */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-primary/5 rounded-2xl p-8 mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-bold text-foreground">Our Mission</h3>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          To create a sustainable ecosystem where local businesses thrive, customers find authentic products and services, and communities grow stronger through meaningful connections.
        </p>
      </motion.div>

      {/* Values */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <h3 className="text-2xl font-bold text-foreground mb-6">Our Values</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-muted/30 rounded-xl p-6">
            <Heart className="w-8 h-8 text-red-500 mb-3" />
            <h4 className="font-semibold text-foreground mb-2">Support Local</h4>
            <p className="text-sm text-muted-foreground">
              We believe in the power of local businesses to create vibrant, sustainable communities.
            </p>
          </div>
          <div className="bg-muted/30 rounded-xl p-6">
            <Users className="w-8 h-8 text-blue-500 mb-3" />
            <h4 className="font-semibold text-foreground mb-2">Community First</h4>
            <p className="text-sm text-muted-foreground">
              Every decision we make is centered around building stronger neighborhood connections.
            </p>
          </div>
          <div className="bg-muted/30 rounded-xl p-6">
            <Award className="w-8 h-8 text-green-500 mb-3" />
            <h4 className="font-semibold text-foreground mb-2">Quality & Trust</h4>
            <p className="text-sm text-muted-foreground">
              We verify sellers and maintain high standards to ensure safe, reliable transactions.
            </p>
          </div>
          <div className="bg-muted/30 rounded-xl p-6">
            <Target className="w-8 h-8 text-purple-500 mb-3" />
            <h4 className="font-semibold text-foreground mb-2">Accessibility</h4>
            <p className="text-sm text-muted-foreground">
              Making local commerce accessible to everyone, everywhere in the community.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Story */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <h3 className="text-2xl font-bold text-foreground mb-4">Our Story</h3>
        <div className="space-y-4 text-muted-foreground">
          <p>
            Aaspass began with a simple observation: while digital marketplaces were connecting people globally, they were often disconnecting local communities. We noticed talented home cooks, skilled artisans, and dedicated service providers struggling to reach customers just a few streets away.
          </p>
          <p>
            Founded in 2024, we started with a mission to bridge this gap. Our platform was designed specifically for hyperlocal discovery – helping you find the best homemade food, skilled services, and unique products within walking distance of your home.
          </p>
          <p>
            Today, we're proud to serve thousands of sellers and buyers across multiple cities, fostering real connections and supporting local economies. Every transaction on Aaspass represents more than just a purchase – it's a step toward stronger, more resilient communities.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AboutPage;
