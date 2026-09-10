import { motion } from 'framer-motion';
import { ArrowLeft, Users, Target, Heart, Award, GraduationCap, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AboutPage = () => {
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
        <h1 className="text-subhead text-foreground">About Us</h1>
        <p className="text-sm text-muted-foreground mt-1">Our mission to bridge student talent with real-world opportunities</p>
      </motion.div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center py-12"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Bridging the Gap Between Talent & Opportunity
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Aaspass is a hyperlocal freelancing platform that connects business owners and project clients with 
          skilled students and freelancers nearby for real work, real experience, and real pay.
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
          To eliminate the "no experience, no job / no job, no experience" paradox for students. We give 
          students access to real client projects nearby while giving businesses affordable, trustworthy 
          tech talent. Everyone wins.
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
            <GraduationCap className="w-8 h-8 text-purple-500 mb-3" />
            <h4 className="font-semibold text-foreground mb-2">Student-First</h4>
            <p className="text-sm text-muted-foreground">
              We believe students deserve real work opportunities instead of just mock projects. Aaspass turns learning into earning.
            </p>
          </div>
          <div className="bg-muted/30 rounded-xl p-6">
            <Briefcase className="w-8 h-8 text-blue-500 mb-3" />
            <h4 className="font-semibold text-foreground mb-2">Client Trust</h4>
            <p className="text-sm text-muted-foreground">
              Clients know exactly who they're hiring with verified profiles, portfolio links, and local proximity for in-person collaboration.
            </p>
          </div>
          <div className="bg-muted/30 rounded-xl p-6">
            <Heart className="w-8 h-8 text-red-500 mb-3" />
            <h4 className="font-semibold text-foreground mb-2">Hyperlocal Impact</h4>
            <p className="text-sm text-muted-foreground">
              Keeping freelancing local means stronger collaboration, faster turnarounds, and real community-building.
            </p>
          </div>
          <div className="bg-muted/30 rounded-xl p-6">
            <Award className="w-8 h-8 text-green-500 mb-3" />
            <h4 className="font-semibold text-foreground mb-2">Quality & Growth</h4>
            <p className="text-sm text-muted-foreground">
              We measure success by the number of students who build portfolios, get hired, or launch their own ventures through Aaspass.
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
            Aaspass started from a simple observation: talented students struggle to get their first client, 
            while small businesses struggle to find affordable, reliable tech talent. The mismatch was obvious, 
            yet no platform was solving it at a hyperlocal level.
          </p>
          <p>
            We built Aaspass in 2024 with one goal: bridge that gap. Our location-based matching means a 
            business owner in your city can find a B.Tech student three streets away who can build their 
            website for a fair price, and that student gets real money and a real portfolio project.
          </p>
          <p>
            Today, Aaspass supports thousands of freelancers and clients across multiple cities. Students work 
            solo or form teams for bigger projects. Business owners get quality work at fair rates. Communities 
            get stronger, one project at a time.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AboutPage;
