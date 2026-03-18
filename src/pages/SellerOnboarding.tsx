import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Store, MapPin, CreditCard, Smartphone, Instagram } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '@/lib/mock-data';

const STEPS = ['Listing Details', 'Contact & Location', 'Review & Pay'];

const SERVICE_TYPES = ['Software', 'Consulting', 'Design', 'Marketing', 'Writing', 'Teaching', 'Photography', 'Editing', 'Fitness Coaching', 'Music Lessons', 'Home Cleaning', 'Maintenance', 'Beauty', 'Healthcare', 'Other'];

const EMOJI_OPTIONS = ['🍱', '🎨', '👗', '📱', '📐', '💄', '🔧', '📷', '🧘', '✨', '🏠', '🎂', '🧵', '🌿', '🍳', '📦', '🎁', '🪴', '🧁', '🖼️', '🧴', '🪡', '🎶', '🛠️'];

const SellerOnboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // Step 1
  const [listingName, setListingName] = useState('');
  const [type, setType] = useState<'product' | 'service'>('product');
  const [category, setCategory] = useState('');
  const [categorySpecification, setCategorySpecification] = useState(''); // For "Other" category
  const [serviceType, setServiceType] = useState(''); // For services
  const [serviceSpecification, setServiceSpecification] = useState(''); // For "Other" service
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [emoji, setEmoji] = useState('🏠');

  // Step 2
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [area, setArea] = useState('');

  const maxDesc = 300;

  const addTag = () => {
    const t = tagInput.trim();
    if (t && tags.length < 5 && !tags.includes(t)) {
      setTags([...tags, t]);
      setTagInput('');
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const step1Valid = listingName && 
    (type === 'product' 
      ? (category && (category !== 'Other' || categorySpecification.trim()))
      : (serviceType && (serviceType !== 'Other' || serviceSpecification.trim()))) && 
    description.length > 0;
  const step2Valid = area && (whatsapp.length === 10 || instagram.length > 0);

  return (
    <div className="max-w-xl mx-auto px-4 md:px-6 pb-24 md:pb-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-4 pb-2">
        <button onClick={() => step > 0 ? setStep(step - 1) : navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-subhead text-foreground">Get Started as a Seller</h1>
        <p className="text-sm text-muted-foreground mt-1">Complete 3 simple steps to go live</p>
      </motion.div>

      {/* Progress bar */}
      <div className="flex gap-2 my-4">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1 flex flex-col items-center gap-1">
            <div className={`h-1.5 w-full rounded-full transition-colors ${i <= step ? 'bg-primary' : 'bg-muted'}`} />
            <span className={`text-[10px] font-medium ${i <= step ? 'text-primary' : 'text-muted-foreground'}`}>{s}</span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1 */}
        {step === 0 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-foreground">Listing Name *</label>
              <input value={listingName} onChange={(e) => setListingName(e.target.value)} placeholder="e.g. Priya's Homemade Snacks" className="mt-1 w-full px-3 py-2.5 rounded-xl bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Type *</label>
              <div className="flex gap-2 mt-1">
                {(['product', 'service'] as const).map((t) => (
                  <button key={t} onClick={() => setType(t)} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${type === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                    {t === 'product' ? '📦 Product' : '🛠️ Service'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">{type === 'service' ? 'Service Type' : 'Category'} *</label>
              {type === 'product' ? (
                <>
                  <select value={category} onChange={(e) => {
                    setCategory(e.target.value);
                    if (e.target.value !== 'Other') setCategorySpecification('');
                  }} className="mt-1 w-full px-4 py-2.5 rounded-xl bg-muted text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none cursor-pointer border border-muted-foreground/10">
                    <option value="">Select a category</option>
                    {CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.emoji} {c.name}</option>)}
                  </select>
                  {category === 'Other' && (
                    <input 
                      type="text" 
                      value={categorySpecification} 
                      onChange={(e) => setCategorySpecification(e.target.value)}
                      placeholder="Specify what you sell (e.g., Handmade Jewelry)"
                      className="mt-2 w-full px-4 py-2.5 rounded-xl bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  )}
                </>
              ) : (
                <>
                  <select value={serviceType} onChange={(e) => {
                    setServiceType(e.target.value);
                    if (e.target.value !== 'Other') setServiceSpecification('');
                  }} className="mt-1 w-full px-4 py-2.5 rounded-xl bg-muted text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none cursor-pointer border border-muted-foreground/10">
                    <option value="">Select a service type</option>
                    {SERVICE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {serviceType === 'Other' && (
                    <input 
                      type="text" 
                      value={serviceSpecification} 
                      onChange={(e) => setServiceSpecification(e.target.value)}
                      placeholder="Specify your service (e.g., Home Renovation)"
                      className="mt-2 w-full px-4 py-2.5 rounded-xl bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  )}
                </>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Description *</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value.slice(0, maxDesc))} placeholder="Describe what you sell or offer..." rows={3} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
              <span className="text-[11px] text-muted-foreground">{maxDesc - description.length} characters remaining</span>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Tags (max 5)</label>
              <div className="flex gap-2 mt-1">
                <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} placeholder="Type & press Enter" className="flex-1 px-3 py-2.5 rounded-xl bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tags.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                      {t}
                      <button onClick={() => setTags(tags.filter((x) => x !== t))} className="text-primary/60 hover:text-primary">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Choose an Emoji</label>
              <div className="grid grid-cols-8 gap-2 mt-2">
                {EMOJI_OPTIONS.map((e) => (
                  <button key={e} onClick={() => setEmoji(e)} className={`text-2xl p-1.5 rounded-lg transition-colors ${emoji === e ? 'bg-primary/20 ring-2 ring-primary' : 'bg-muted hover:bg-muted/80'}`}>
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <motion.button whileTap={{ scale: 0.96 }} disabled={!step1Valid} onClick={() => setStep(1)} className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-2">
              Next
            </motion.button>
          </motion.div>
        )}

        {/* Step 2 */}
        {step === 1 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-1.5"><Smartphone className="w-4 h-4" /> WhatsApp Number</label>
              <div className="flex gap-2 mt-1">
                <span className="px-3 py-2.5 rounded-xl bg-muted text-sm text-muted-foreground">+91</span>
                <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit number" className="flex-1 px-3 py-2.5 rounded-xl bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              {whatsapp.length > 0 && whatsapp.length < 10 && <span className="text-[11px] text-destructive">Enter a valid 10-digit number</span>}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-1.5"><Instagram className="w-4 h-4" /> Instagram Handle</label>
              <div className="flex gap-2 mt-1">
                <span className="px-3 py-2.5 rounded-xl bg-muted text-sm text-muted-foreground">@</span>
                <input value={instagram} onChange={(e) => setInstagram(e.target.value.replace(/\s/g, ''))} placeholder="yourhandle" className="flex-1 px-3 py-2.5 rounded-xl bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <span className="text-[11px] text-muted-foreground">At least one contact method required</span>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Area / Locality *</label>
              <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. Dharampeth, Nagpur" className="mt-1 w-full px-3 py-2.5 rounded-xl bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>

            <div className="bg-muted/50 rounded-xl p-3">
              <p className="text-[11px] text-muted-foreground">📍 Your exact address is never shown publicly. Only your area name and approximate distance are displayed to buyers.</p>
            </div>

            <motion.button whileTap={{ scale: 0.96 }} disabled={!step2Valid} onClick={() => setStep(2)} className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-2">
              Next
            </motion.button>
          </motion.div>
        )}

        {/* Step 3 — Review & Pay */}
        {step === 2 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 mt-4">
            {/* Preview card */}
            <div className="bg-card rounded-2xl shadow-card overflow-hidden">
              <div className="h-28 flex items-center justify-center bg-primary/10">
                <span className="text-5xl">{emoji}</span>
              </div>
              <div className="p-3">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${type === 'product' ? 'bg-accent text-accent-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                  {type === 'product' ? 'Product' : 'Service'}
                </span>
                <h3 className="font-semibold text-foreground text-sm mt-1.5">{listingName}</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">{area}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tags.map((t) => <span key={t} className="text-[10px] px-2 py-0.5 bg-muted rounded-full text-muted-foreground">{t}</span>)}
                  </div>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">{type === 'service' ? 'Service Type' : 'Category'}</span><span className="text-foreground font-medium">{type === 'service' ? (serviceType === 'Other' ? serviceSpecification : serviceType) : (category === 'Other' ? categorySpecification : category)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Contact</span><span className="text-foreground font-medium">{whatsapp ? `+91 ${whatsapp}` : `@${instagram}`}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Location</span><span className="text-foreground font-medium">{area}</span></div>
            </div>

            {/* Pricing */}
            <div className="bg-primary/5 rounded-2xl p-4">
              <h3 className="font-semibold text-foreground">Go Live on Aaspass</h3>
              <div className="flex gap-3 mt-3">
                <div className="flex-1 bg-card rounded-xl p-3 text-center shadow-card">
                  <p className="text-lg font-bold text-foreground">₹100</p>
                  <p className="text-[11px] text-muted-foreground">per month</p>
                </div>
                <div className="flex-1 bg-card rounded-xl p-3 text-center shadow-card ring-2 ring-primary">
                  <p className="text-lg font-bold text-primary">₹1,200</p>
                  <p className="text-[11px] text-muted-foreground">per year</p>
                </div>
              </div>
              <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-primary" /> Public listing on Aaspass</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-primary" /> WhatsApp / Instagram connect</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-primary" /> Distance-based discovery</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-primary" /> Searchable by keyword & category</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-primary" /> Shareable listing URL</li>
              </ul>
            </div>

            <motion.button whileTap={{ scale: 0.96 }} className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2">
              <CreditCard className="w-4 h-4" /> Pay & Go Live
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SellerOnboarding;
