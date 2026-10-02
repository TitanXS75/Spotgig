import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Phone, MapPin, MessageCircle, Send, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { UniqueAccordion } from '@/components/ui/interactive-accordion';
import { faqs } from '@/lib/faq-data';

const ContactPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    // Reset form
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 pb-24 md:pb-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-4 pb-2">
        <div className="flex justify-start">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-3 hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
        <h1 className="text-subhead text-foreground">Contact Us</h1>
        <p className="text-sm text-muted-foreground mt-1">Get in touch with our team</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 mt-8">
        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Get in Touch</h2>
            <p className="text-muted-foreground mb-6">
              Have questions about using Spotgig? Need help with your account? Want to become a seller? We're here to help!
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Email</h3>
                <p className="text-sm text-muted-foreground">support@spotgig.com</p>
                <p className="text-xs text-muted-foreground mt-1">We respond within 24 hours</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Phone</h3>
                <p className="text-sm text-muted-foreground">+91 98765 43210</p>
                <p className="text-xs text-muted-foreground mt-1">Mon-Sat, 9AM-6PM IST</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Office</h3>
                <p className="text-sm text-muted-foreground">123, Local Market Road</p>
                <p className="text-sm text-muted-foreground">Nagpur, Maharashtra 440001</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">WhatsApp</h3>
                <p className="text-sm text-muted-foreground">+91 98765 43210</p>
                <p className="text-xs text-muted-foreground mt-1">Quick responses available</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <h2 className="text-2xl font-bold text-foreground mb-6">Send us a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="How can we help you?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  placeholder="Tell us more about your question or feedback..."
                />
              </div>

              <motion.button
                type="submit"
                whileTap={{ scale: 0.96 }}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
              >
                <Send className="w-4 h-4" />
                Send Message
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Horizontal Full-Width FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-16 pt-12 border-t border-border"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Frequently Asked Questions</h2>
            <p className="text-muted-foreground mt-2">All {faqs.length} commonly asked questions about using the platform</p>
          </div>
          <div className="hidden md:flex w-12 h-12 bg-primary/10 rounded-full items-center justify-center">
            <HelpCircle className="w-6 h-6 text-primary" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-x-8 gap-y-2">
          <div className="space-y-2">
            <UniqueAccordion 
              items={faqs.slice(0, Math.ceil(faqs.length / 2)).map((item, i) => ({
                id: `faq-${item.id}`,
                number: String(i + 1).padStart(2, '0'),
                title: item.question,
                content: item.answer
              }))}
            />
          </div>
          <div className="space-y-2">
            <UniqueAccordion 
              items={faqs.slice(Math.ceil(faqs.length / 2)).map((item, i) => ({
                id: `faq-${item.id}`,
                number: String(Math.ceil(faqs.length / 2) + i + 1).padStart(2, '0'),
                title: item.question,
                content: item.answer
              }))}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ContactPage;
