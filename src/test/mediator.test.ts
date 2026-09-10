import { describe, it, expect } from 'vitest';
import { scanForSensitiveLeaks, redactSensitiveInfo } from '@/lib/mediator/sensitive-info-detector';
import { validateProjectRequirements } from '@/lib/mediator/requirement-validator';
import { evaluateDeveloperTrust, evaluateOwnerTrust } from '@/lib/mediator/trust-verifier';
import { calculateProjectMatch } from '@/lib/mediator/project-matcher';
import type { Project } from '@/lib/db-types';
import type { Profile } from '@/lib/api/profiles';

describe('Mediator Automation Layer', () => {
  describe('Sensitive Information Detector', () => {
    it('detects API keys, database connection strings, and credentials', () => {
      const leakyText = `
        Here is our project overview.
        Use postgresql://admin:secret123@db.supabase.co:5432/main to test.
        The secret key is sk_live_51ABC1234567890XYZ.
      `;
      const result = scanForSensitiveLeaks(leakyText);
      expect(result.hasLeaks).toBe(true);
      expect(result.hasCriticalLeaks).toBe(true);
      expect(result.detectedItems.length).toBeGreaterThanOrEqual(2);
      expect(result.warnings.length).toBeGreaterThanOrEqual(2);
    });

    it('detects emails and phone numbers in public descriptions', () => {
      const contactLeak = 'Reach out at rohit.developer@college.edu or call 9876543210 for details.';
      const result = scanForSensitiveLeaks(contactLeak);
      expect(result.hasLeaks).toBe(true);
      expect(result.detectedItems.some(item => item.type === 'email')).toBe(true);
      expect(result.detectedItems.some(item => item.type === 'phone')).toBe(true);
    });

    it('passes clean software architectural descriptions', () => {
      const cleanText = 'We need a React + TypeScript frontend with Tailwind CSS and TanStack Query state management.';
      const result = scanForSensitiveLeaks(cleanText);
      expect(result.hasLeaks).toBe(false);
      expect(result.detectedItems.length).toBe(0);
    });

    it('redacts detected sensitive patterns properly', () => {
      const raw = 'My key is sk_test_51abcdef12345678 and email is test@domain.com';
      const redacted = redactSensitiveInfo(raw);
      expect(redacted).not.toContain('sk_test_51abcdef12345678');
      expect(redacted).not.toContain('test@domain.com');
      expect(redacted).toContain('[REDACTED_');
    });
  });

  describe('Requirement Validator', () => {
    it('validates authentic software engineering projects', () => {
      const evaluation = validateProjectRequirements({
        title: 'Real-time Hospital Appointment Queue Web App',
        public_summary: 'A web platform for local clinics to manage patient queues with WebSocket alerts and SMS notifications.',
        confidential_specs: 'Backend in Node.js / Express with PostgreSQL. Role based access control for receptionists and doctors.',
        deliverables: '1. Production React frontend\n2. Express REST API\n3. Database schema migrations',
        required_skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
      });

      expect(evaluation.isSoftwareProject).toBe(true);
      expect(evaluation.qualityScore).toBeGreaterThanOrEqual(80);
      expect(evaluation.criticalIssues.length).toBe(0);
    });

    it('flags non-software gig tasks', () => {
      const nonSoftware = validateProjectRequirements({
        title: 'Deliver food packages around campus',
        public_summary: 'Need someone with a motorcycle to deliver lunch packets to hostels every weekday afternoon.',
        confidential_specs: 'Deliveries must happen between 12pm and 2pm.',
        deliverables: 'On-time deliveries',
        required_skills: [],
      });

      expect(nonSoftware.isSoftwareProject).toBe(false);
      expect(nonSoftware.criticalIssues.some(issue => issue.includes('software'))).toBe(true);
    });

    it('suggests tags based on keywords', () => {
      const evaluation = validateProjectRequirements({
        title: 'Mobile app in Flutter with Supabase backend',
        public_summary: 'Building cross-platform iOS and Android mobile app for campus marketplace.',
        confidential_specs: 'Requires authentication and real-time messaging.',
        deliverables: 'Flutter APK bundle',
        required_skills: [],
      });

      expect(evaluation.suggestedTags).toContain('Flutter');
      expect(evaluation.suggestedTags).toContain('Mobile App');
      expect(evaluation.suggestedTags).toContain('Supabase');
    });
  });

  describe('Trust & Verification Engine', () => {
    it('evaluates developer profile trust score accurately', () => {
      const devProfile = {
        full_name: 'Aarav Sharma',
        headline: 'Full-Stack Web Developer & CS Undergrad',
        education: 'B.Tech Computer Science, National Institute of Technology',
        github_url: 'https://github.com/aaravsharma',
        portfolio_url: 'https://aaravsharma.dev',
        skills: ['React', 'TypeScript', 'Next.js', 'PostgreSQL'],
        completedProjectsCount: 2,
        averageRating: 4.8,
      };

      const trust = evaluateDeveloperTrust(devProfile);
      expect(trust.trustScore).toBeGreaterThanOrEqual(80);
      expect(trust.isVerified).toBe(true);
      expect(trust.badgeText).toBe('Verified Student Developer');
      expect(trust.verifiedSignals.length).toBeGreaterThanOrEqual(5);
    });

    it('identifies missing profile details in unverified profiles', () => {
      const incompleteProfile = {
        full_name: 'Anonymous',
        skills: ['JavaScript'],
      };

      const trust = evaluateDeveloperTrust(incompleteProfile);
      expect(trust.isVerified).toBe(false);
      expect(trust.missingChecklist).toContain('Link your GitHub profile');
      expect(trust.missingChecklist).toContain('Add your college or degree details');
    });

    it('evaluates project owner trust score', () => {
      const ownerProfile = {
        full_name: 'Dr. Ramesh Gupta',
        organization: 'Apex Diagnostic Care',
        headline: 'Director of Healthcare Operations',
        bio: 'Managing 3 multispecialty diagnostic centers across the district. Looking for software automation.',
        projectsPostedCount: 2,
      };

      const ownerTrust = evaluateOwnerTrust(ownerProfile);
      expect(ownerTrust.trustScore).toBeGreaterThanOrEqual(75);
      expect(ownerTrust.isVerified).toBe(true);
      expect(ownerTrust.badgeText).toBe('Verified Project Owner');
    });
  });

  describe('Project Matcher', () => {
    const sampleProject: Project = {
      id: 'proj-1',
      owner_id: 'owner-1',
      title: 'E-commerce Inventory Sync',
      slug: 'ecommerce-inventory-sync',
      public_summary: 'Sync store inventory with Shopify and WooCommerce.',
      industry: 'Retail & E-commerce',
      project_type: 'Full-Stack Web App',
      difficulty: 'intermediate',
      duration: '4 weeks',
      team_size: 1,
      location_type: 'remote',
      compensation_type: 'paid',
      compensation_amount: 15000,
      required_skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
      status: 'published',
      views_count: 10,
      requests_count: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    it('calculates high match for developers with overlapping skills and compatible level', () => {
      const devProfile: Profile = {
        id: 'dev-1',
        full_name: 'Priya Patel',
        role: 'developer',
        experience_level: 'intermediate',
        skills: ['React', 'TypeScript', 'Node.js', 'Tailwind CSS'],
        technologies: ['Vite', 'PostgreSQL'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const match = calculateProjectMatch(sampleProject, devProfile);
      expect(match.matchScore).toBeGreaterThanOrEqual(70);
      expect(match.levelCompatibility).toBe(true);
      expect(match.matchedSkills).toContain('React');
      expect(match.matchedSkills).toContain('TypeScript');
      expect(match.matchedSkills).toContain('Node.js');
    });

    it('handles developers with zero matching skills gracefully', () => {
      const devProfile: Profile = {
        id: 'dev-2',
        full_name: 'Karan Singh',
        role: 'developer',
        experience_level: 'beginner',
        skills: ['Python', 'Django', 'Machine Learning'],
        technologies: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const match = calculateProjectMatch(sampleProject, devProfile);
      expect(match.matchScore).toBeLessThan(40);
      expect(match.matchedSkills.length).toBe(0);
    });
  });
});
