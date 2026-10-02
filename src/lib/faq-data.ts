export interface FAQItem {
  id: number;
  category: string;
  question: string;
  answer: string;
}

export const faqs: FAQItem[] = [
  {
    id: 1,
    category: 'client',
    question: 'How do I find freelancers near me?',
    answer: 'Enable location access and Spotgig will automatically show freelancers sorted by distance from you. You can filter by skill category, solo/team, and radius.'
  },
  {
    id: 2,
    category: 'client',
    question: 'How do I post a project?',
    answer: 'Go to your profile and click "Post a Project". Fill in project details, budget range, timeline, and required skills. Your listing goes live instantly.'
  },
  {
    id: 3,
    category: 'client',
    question: 'Can I hire a team of students?',
    answer: 'Yes! Freelancers can list themselves as "Team", meaning they have a group ready to tackle larger projects. Simply filter by "Team" when browsing.'
  },
  {
    id: 4,
    category: 'client',
    question: 'How do I contact a freelancer?',
    answer: 'Each profile shows the freelancer\'s preferred contact method, usually WhatsApp or LinkedIn. Click the contact button to connect directly with no middleman.'
  },
  {
    id: 5,
    category: 'freelancer',
    question: 'How do I register as a freelancer?',
    answer: 'Click "Sign Up" and choose "Freelancer" as your role. Then complete the onboarding wizard to add your skills, tech stack, portfolio links, and location.'
  },
  {
    id: 6,
    category: 'freelancer',
    question: 'Can I work in a team?',
    answer: 'Absolutely. When creating your profile, select "Team" as your operating type. List your team size and the combined skills your group offers.'
  },
  {
    id: 7,
    category: 'freelancer',
    question: 'What kind of projects can I find?',
    answer: 'Web development, app development, UI/UX design, digital marketing, content writing, data analysis, video editing, and much more posted by local businesses.'
  },
  {
    id: 8,
    category: 'freelancer',
    question: 'How do I manage my listings?',
    answer: 'Access your profile to add, edit, or deactivate listings, view views count, and manage incoming inquiries.'
  },
  {
    id: 9,
    category: 'payment',
    question: 'What are the subscription plans?',
    answer: 'Freelancers pay ₹100/month or ₹1,200/year. Clients pay ₹200/month or ₹2,000/year. All new users get a 7-day free trial with no card required.'
  },
  {
    id: 10,
    category: 'payment',
    question: 'Does Spotgig take a commission from projects?',
    answer: 'No! We charge a flat subscription fee only. There is zero commission on any project you complete. All project payments happen directly between you and the client.'
  },
  {
    id: 11,
    category: 'payment',
    question: 'Can I get a refund?',
    answer: 'Refunds are handled on a case-by-case basis. Contact our support within 7 days of payment if you have any issue.'
  },
  {
    id: 12,
    category: 'safety',
    question: 'How does Spotgig verify freelancers?',
    answer: 'We verify identity through phone number and email. Freelancers can also link their LinkedIn and GitHub profiles for additional trust signals.'
  },
  {
    id: 13,
    category: 'safety',
    question: 'What should I do before paying a freelancer?',
    answer: 'Always agree on a scope and timeline in writing (even WhatsApp). For larger projects, use milestone-based payments. Meet in a public place for in-person handoffs.'
  },
  {
    id: 14,
    category: 'safety',
    question: 'Is my personal information safe?',
    answer: 'Yes. Your exact location is never shared publicly, only your area name. Your contact details are only visible to logged-in users.'
  },
  {
    id: 15,
    category: 'technical',
    question: 'The app is not showing my location correctly',
    answer: 'Ensure location services are enabled for your browser. Try refreshing the page. If the issue persists, manually enter your area in the onboarding form.'
  },
  {
    id: 16,
    category: 'technical',
    question: 'Can I use Spotgig on desktop?',
    answer: 'Yes! Spotgig works on all devices. You can also install it as a PWA on your phone for an app-like experience with no app store needed.'
  },
];
