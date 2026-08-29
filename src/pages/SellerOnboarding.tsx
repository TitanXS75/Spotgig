import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Store, MapPin, CreditCard, Smartphone, Instagram, LocateFixed, UploadCloud, Globe, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnimatedDropdown from '@/components/ui/animated-dropdown';
import { CATEGORIES } from '@/lib/mock-data';
import { useAppStore } from '@/store/app-store';
import { reverseGeocode } from '@/lib/api/location';
import { EyeToggleIcon } from '@/components/ui/animated-state-icons';
import { generateUniqueSlug } from '@/lib/utils';
import { createListing, getMyListings } from '@/lib/api/listings';
import { useMultiImageUpload } from '@/hooks/use-cloudinary-upload';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
const STEPS = ['Profile Details', 'Contact & Location', 'Review & Go Live'];

const SERVICE_TYPES = ['Web Development', 'App Development', 'UI/UX Design', 'AI / ML', 'Digital Marketing', 'Content Writing', 'Data Analysis', 'Video Editing', 'Graphic Design', 'Cybersecurity', 'QA / Testing', 'IT Support', 'Tutoring / Mentoring', 'Other'];

const EMOJI_OPTIONS = ['🍱', '🎨', '👗', '📱', '📐', '💄', '🔧', '📷', '🧘', '✨', '🏠', '🎂', '🧵', '🌿', '🍳', '📦', '🎁', '🪴', '🧁', '🖼️', '🧴', '🪡', '🎶', '🛠️'];

const SellerOnboarding = () => {
  const navigate = useNavigate();
  const { user, setUserLocation } = useAppStore();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  
  const { data: userListings = [] } = useQuery({
    queryKey: ['listings', 'me'],
    queryFn: getMyListings,
    enabled: !!user,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1
  const [listingName, setListingName] = useState('');
  const [type, setType] = useState<'project' | 'freelancer'>('freelancer');
  const [operatingType, setOperatingType] = useState<'solo' | 'team'>('solo');
  const [category, setCategory] = useState('');
  const [categorySpecification, setCategorySpecification] = useState(''); // For "Other" category
  const [serviceType, setServiceType] = useState(''); // For services
  const [serviceSpecification, setServiceSpecification] = useState(''); // For "Other" service
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [emoji, setEmoji] = useState('🏠');

  const { slots, uploading, errors: uploadErrors, uploadSlot, clearSlot } = useMultiImageUpload();

  // Step 2
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [website, setWebsite] = useState('');
  const [otherHandle, setOtherHandle] = useState('');
  const [area, setArea] = useState('');
  const [listingLat, setListingLat] = useState<number | null>(null);
  const [listingLng, setListingLng] = useState<number | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [showManualCoordinates, setShowManualCoordinates] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [hideLocation, setHideLocation] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | null>(null);
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [usedFreeTrial, setUsedFreeTrial] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

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
    (type === 'project' 
      ? (category && (category !== 'Other' || categorySpecification.trim()))
      : (serviceType && (serviceType !== 'Other' || serviceSpecification.trim()))) && 
    description.length > 0;
  const step2Valid = area && (whatsapp.length === 10 || linkedin.length > 0 || instagram.length > 0 || otherHandle.trim().length > 0);

  const detectListingLocation = async () => {
    if (!navigator.geolocation) return;
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setListingLat(lat);
        setListingLng(lng);
        setManualLat(lat.toString());
        setManualLng(lng.toString());

        // Also store as user's location so distances work across the app.
        setUserLocation(lat, lng);

        if (!area.trim()) {
          const approxArea = await reverseGeocode(lat, lng);
          if (approxArea) setArea(approxArea);
        }
        setDetectingLocation(false);
      },
      () => {
        setDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30_000 }
    );
  };

  const handleManualCoordinateSave = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      setListingLat(lat);
      setListingLng(lng);
      setUserLocation(lat, lng);
      setShowManualCoordinates(false);
    }
  };

  const handleStartFreeTrial = async () => {
    setIsSubmitting(true);
    try {
      // Calculate free trial expiry date (20 days from now)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 20);

      // Generate unique slug
      const existingSlugs = userListings.map(l => l.slug || '');
      const slug = generateUniqueSlug(listingName, existingSlugs);

      const supportiveUrls = [slots.gallery_0, slots.gallery_1, slots.gallery_2].filter(Boolean) as string[];

      // Register business with free trial
      await createListing({
        slug: slug,
        name: listingName,
        seller_name: user?.name || 'Freelancer',
        type: type,
        operating_type: operatingType,
        category: type === 'project' ? (category === 'Other' ? categorySpecification : category) : (serviceType === 'Other' ? serviceSpecification : serviceType),
        description: description,
        tags: tags,
        whatsapp: whatsapp || null,
        instagram: instagram || null,
        linkedin: linkedin || null,
        other_handle: otherHandle || null,
        area: area,
        lat: listingLat || 0,
        lng: listingLng || 0,
        hide_location: hideLocation,
        emoji: emoji,
        image_url: slots.logo || null,
        supportive_images: supportiveUrls.length > 0 ? supportiveUrls : null,
        website: website || null,
        price: null,
        price_unit: null,
        status: 'live',
        plan: 'free_trial',
        plan_expires_at: expiryDate.toISOString(),
      });
      
      setUsedFreeTrial(true);
      toast({ title: 'Success!', description: 'Your profile is now live on Aaspass.' });
      navigate('/profile');
    } catch (err: unknown) {
      const error = err as Error;
      toast({ title: 'Error', description: error.message || 'Failed to create listing.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayAndGoLive = async () => {
    setIsSubmitting(true);
    try {
      // Calculate subscription expiry date based on selected plan from the exact moment of payment
      const expiryDate = new Date();
      const daysToAdd = selectedPlan === 'yearly' ? 365 : 30;
      expiryDate.setDate(expiryDate.getDate() + daysToAdd);

      // Generate unique slug
      const existingSlugs = userListings.map(l => l.slug || '');
      const slug = generateUniqueSlug(listingName, existingSlugs);

      const supportiveUrls = [slots.gallery_0, slots.gallery_1, slots.gallery_2].filter(Boolean) as string[];

      // Register business initially as pending
      const createdListing = await createListing({
        slug: slug,
        name: listingName,
        seller_name: user?.name || 'Freelancer',
        type: type,
        operating_type: operatingType,
        category: type === 'product' ? (category === 'Other' ? categorySpecification : category) : (serviceType === 'Other' ? serviceSpecification : serviceType),
        description: description,
        tags: tags,
        whatsapp: whatsapp || null,
        instagram: instagram || null,
        other_handle: otherHandle || null,
        area: area,
        lat: listingLat || 0,
        lng: listingLng || 0,
        hide_location: hideLocation,
        emoji: emoji,
        image_url: slots.logo || null,
        supportive_images: supportiveUrls.length > 0 ? supportiveUrls : null,
        website: website || null,
        price: null,
        price_unit: null,
        status: 'pending', // Pending real payment
        plan: selectedPlan as 'monthly' | 'yearly',
        plan_expires_at: expiryDate.toISOString(),
      });
      
      const { data, error: funcError } = await supabase.functions.invoke('create-razorpay-order', {
        body: { amount: selectedPlan === 'yearly' ? 1200 : 100 }
      });
      if (funcError) throw funcError;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || '', // Needs to be generated and set in .env
        amount: data.amount,
        currency: data.currency,
        name: "Aaspass",
        description: "Listing Subscription",
        order_id: data.id,
        handler: async function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
          setIsSubmitting(true);
          const { error: verifyError } = await supabase.functions.invoke('verify-razorpay-payment', {
            body: { 
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              listing_id: createdListing.id
            }
          });
          
          setIsSubmitting(false);
          
          if (verifyError) {
             toast({ title: 'Payment check failed', description: 'Please contact support.', variant: 'destructive' });
          } else {
             toast({ title: 'Success!', description: 'Your listing is now live on Aaspass.' });
             navigate('/profile');
          }
        },
        prefill: {
          name: user?.name || "Freelancer",
          email: user?.email || "",
          contact: whatsapp || ""
        },
        theme: {
          color: "#0F52BA"
        }
      };

      const razorpayWindow = window as unknown as {
        Razorpay: new (opts: unknown) => {
          on: (event: string, cb: (res: { error: { description: string } }) => void) => void;
          open: () => void;
        };
      };
      const rzp1 = new razorpayWindow.Razorpay(options);
      rzp1.on('payment.failed', function (response: { error: { description: string } }) {
         toast({ title: 'Payment Failed', description: response.error.description, variant: 'destructive' });
         setIsSubmitting(false);
      });
      rzp1.open();

    } catch (err: unknown) {
      const error = err as Error;
      toast({ title: 'Error', description: error.message || 'Failed to initialize payment.', variant: 'destructive' });
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-xl mx-auto px-4 md:px-6 pb-24 md:pb-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-4 pb-2">
        <div className="flex justify-start">
          <button onClick={() => step > 0 ? setStep(step - 1) : navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-3 hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
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
              <label className="text-sm font-medium text-foreground">Operating Type *</label>
              <div className="flex gap-2 mt-1">
                {(['shop', 'home'] as const).map((t) => (
                  <button key={t} onClick={() => setOperatingType(t)} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${operatingType === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                    {t === 'shop' ? '🏪 Shop' : '🏠 Home'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">{type === 'service' ? 'Service Type' : 'Category'} *</label>
              {type === 'product' ? (
                <>
                  <AnimatedDropdown
                    items={CATEGORIES.map((c) => ({
                      id: c.name,
                      name: `${c.emoji} ${c.name}`,
                    }))}
                    selectedId={category}
                    text="Select a category"
                    onSelect={(item) => {
                      setCategory(item.id || '');
                      setCategorySpecification('');
                    }}
                    className="w-full mt-1"
                  />
                  {category === 'Other' && (
                    <input 
                      type="text" 
                      value={categorySpecification} 
                      onChange={(e) => setCategorySpecification(e.target.value)}
                      placeholder="Specify what you sell (e.g., Handmade Jewelry)"
                      className="mt-2 w-full px-4 py-3 rounded-xl bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  )}
                </>
              ) : (
                <>
                  <AnimatedDropdown
                    items={SERVICE_TYPES.map((s) => ({
                      id: s,
                      name: s,
                    }))}
                    selectedId={serviceType}
                    text="Select a service type"
                    onSelect={(item) => {
                      setServiceType(item.id || '');
                      setServiceSpecification('');
                    }}
                    className="w-full mt-1"
                  />
                  {serviceType === 'Other' && (
                    <input 
                      type="text" 
                      value={serviceSpecification} 
                      onChange={(e) => setServiceSpecification(e.target.value)}
                      placeholder="Specify your service (e.g., Home Renovation)"
                      className="mt-2 w-full px-4 py-3 rounded-xl bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
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
              <label className="text-sm font-medium text-foreground">Add Logo</label>
              <div className="mt-2 w-full">
                {slots.logo ? (
                  <div className="flex flex-col gap-3 w-full">
                    <div className="relative w-full h-40 rounded-xl overflow-hidden border border-border">
                      <img src={slots.logo} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                    </div>
                    <div className="flex items-center justify-end gap-3 mt-1">
                      <button type="button" onClick={() => clearSlot('logo')} className="px-4 py-2 border border-destructive/30 text-destructive hover:bg-destructive/10 rounded-lg text-xs font-semibold transition-colors">
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors bg-muted/20 relative">
                    {uploading.logo ? (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-2" />
                        <p className="text-sm text-muted-foreground">Uploading...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground"><span className="font-semibold text-primary">Click to upload</span> or drag and drop</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Upload your logo, product image etc.</p>
                      </div>
                    )}
                    <input type="file" className="hidden" accept="image/*" disabled={uploading.logo} onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadSlot(file, 'logo');
                    }} />
                  </label>
                )}
                {uploadErrors.logo && <p className="text-xs text-destructive mt-1">{uploadErrors.logo}</p>}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Supportive Images (Max 3)</label>
              <div className="mt-2 grid grid-cols-3 gap-2 w-full">
                {[0, 1, 2].map(idx => {
                  const slotName = `gallery_${idx}` as const;
                  const src = slots[slotName];
                  const isUploading = uploading[slotName];
                  
                  return src ? (
                    <div key={idx} className="relative w-full aspect-square rounded-xl overflow-hidden border border-border">
                      <img src={src} alt="Supportive" className="absolute inset-0 w-full h-full object-cover" />
                      <button type="button" onClick={() => clearSlot(slotName)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label key={idx} className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors bg-muted/20 relative">
                      {isUploading ? (
                        <div className="flex flex-col items-center justify-center text-center p-1">
                          <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-1" />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center p-1">
                          <UploadCloud className="w-5 h-5 text-muted-foreground mb-1" />
                          <span className="text-[10px] font-semibold text-primary">Add</span>
                        </div>
                      )}
                      <input type="file" className="hidden" accept="image/*" disabled={isUploading} onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadSlot(file, slotName);
                      }} />
                    </label>
                  );
                })}
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
              <label className="text-sm font-medium text-foreground flex items-center gap-1.5"><Globe className="w-4 h-4 text-blue-600" /> LinkedIn Profile</label>
              <div className="flex gap-2 mt-1">
                <span className="px-3 py-2.5 rounded-xl bg-muted text-sm text-muted-foreground whitespace-nowrap">linkedin.com/in/</span>
                <input value={linkedin} onChange={(e) => setLinkedin(e.target.value.replace(/\s/g, ''))} placeholder="yourprofile" className="flex-1 px-3 py-2.5 rounded-xl bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <span className="text-[11px] text-muted-foreground">Recommended for freelancers — builds client trust</span>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-1.5"><Globe className="w-4 h-4" /> Website</label>
              <div className="flex gap-2 mt-1">
                <span className="px-3 py-2.5 rounded-xl bg-muted text-sm text-muted-foreground">https://</span>
                <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="www.yourdomain.com" className="flex-1 px-3 py-2.5 rounded-xl bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Other handle (optional)</label>
              <input
                value={otherHandle}
                onChange={(e) => setOtherHandle(e.target.value)}
                placeholder="e.g. Facebook: mypage, Website: example.com"
                className="mt-1 w-full px-3 py-2.5 rounded-xl bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <span className="text-[11px] text-muted-foreground">Any other link clients/freelancers can use to reach you (e.g. GitHub, Behance, Portfolio).</span>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Area / Locality *</label>
              <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. Dharampeth, Nagpur" className="mt-1 w-full px-3 py-2.5 rounded-xl bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <div className="mt-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={detectListingLocation}
                  disabled={detectingLocation}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/70 text-foreground disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  <LocateFixed className={`w-4 h-4 ${detectingLocation ? 'animate-pulse' : ''}`} />
                  {detectingLocation ? 'Detecting…' : 'Detect location'}
                </button>
                <span className="text-[11px] text-muted-foreground tabular-nums">
                  {listingLat !== null && listingLng !== null ? `Saved: ${listingLat.toFixed(4)}, ${listingLng.toFixed(4)}` : 'No coordinates saved yet'}
                </span>
              </div>

              {/* Manual Coordinates Section */}
              {!showManualCoordinates && listingLat !== null && (
                <button
                  type="button"
                  onClick={() => setShowManualCoordinates(true)}
                  className="mt-2 text-xs text-primary hover:underline"
                >
                  Edit coordinates manually
                </button>
              )}

              {showManualCoordinates && (
                <div className="mt-3 p-3 bg-muted/50 rounded-xl space-y-2">
                  <p className="text-xs font-semibold text-foreground">Enter Coordinates Manually</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-muted-foreground">Latitude</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={manualLat}
                        onChange={(e) => setManualLat(e.target.value)}
                        placeholder="e.g. 21.1458"
                        className="w-full mt-1 px-2 py-1.5 rounded-lg bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-muted-foreground">Longitude</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={manualLng}
                        onChange={(e) => setManualLng(e.target.value)}
                        placeholder="e.g. 79.0882"
                        className="w-full mt-1 px-2 py-1.5 rounded-lg bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={handleManualCoordinateSave}
                      className="flex-1 px-2 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold"
                    >
                      Save
                    </motion.button>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setShowManualCoordinates(false)}
                      className="flex-1 px-2 py-1.5 rounded-lg bg-muted text-foreground text-xs font-semibold"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </div>
              )}

              {!showManualCoordinates && listingLat === null && (
                <button
                  type="button"
                  onClick={() => setShowManualCoordinates(true)}
                  className="mt-2 text-xs text-primary hover:underline"
                >
                  Enter coordinates manually
                </button>
              )}
            </div>

            <div className="bg-muted/50 rounded-xl p-3">
              <p className="text-[11px] text-muted-foreground">📍 Your exact address is never shown publicly. Only your area name and approximate distance are displayed to buyers.</p>
            </div>

            <div>
              <div 
                onClick={() => setHideLocation(!hideLocation)}
                className="flex items-center gap-3 p-3 bg-muted/30 border border-border/50 rounded-xl cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <EyeToggleIcon size={24} active={hideLocation} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Hide from public map</p>
                  <p className="text-[11px] text-muted-foreground">Buyers will still see your area name but not your exact map pin.</p>
                </div>
              </div>
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
              <div className="h-28 flex items-center justify-center bg-primary/10 overflow-hidden relative">
                {slots.logo ? <img src={slots.logo} className="absolute inset-0 w-full h-full object-cover" alt="Banner" /> : <span className="text-5xl">{emoji}</span>}
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
              <div className="flex justify-between"><span className="text-muted-foreground">Operating Type</span><span className="text-foreground font-medium">{operatingType === 'shop' ? '🏪 I have a shop' : '🏠 I operate from home'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{type === 'service' ? 'Service Type' : 'Category'}</span><span className="text-foreground font-medium">{type === 'service' ? (serviceType === 'Other' ? serviceSpecification : serviceType) : (category === 'Other' ? categorySpecification : category)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Contact</span><span className="text-foreground font-medium flex items-center gap-2">{whatsapp ? `+91 ${whatsapp}` : instagram ? `@${instagram}` : website ? website : '-'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Location</span><span className="text-foreground font-medium">{area}</span></div>
            </div>

            {/* Pricing */}
            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl p-5 border border-primary/20">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-foreground text-lg">Go Live on Aaspass</h3>
                <span className="text-xs font-semibold text-primary bg-primary/20 px-3 py-1 rounded-full">20-Day Free Trial</span>
              </div>
              <p className="text-xs text-muted-foreground mb-4">Your free trial will automatically expire after 20 days. Pay to list or renew anytime to keep your listing active.</p>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Monthly Plan */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedPlan('monthly')}
                  className={`relative rounded-xl p-4 transition-all duration-200 border-2 overflow-hidden group ${
                    selectedPlan === 'monthly'
                      ? 'border-primary bg-primary/10 shadow-lg shadow-primary/30'
                      : 'border-border hover:border-primary/50 bg-card'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    {selectedPlan === 'monthly' && (
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                      >
                        <Check className="w-3.5 h-3.5 text-primary-foreground" />
                      </motion.div>
                    )}
                    <p className="text-2xl font-bold text-foreground">₹100</p>
                    <p className="text-xs text-muted-foreground mt-1">per month</p>
                  </div>
                </motion.button>

                {/* Yearly Plan */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedPlan('yearly')}
                  className={`relative rounded-xl p-4 transition-all duration-200 border-2 overflow-hidden group ${
                    selectedPlan === 'yearly'
                      ? 'border-primary bg-primary/10 shadow-lg shadow-primary/30'
                      : 'border-border hover:border-primary/50 bg-card'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative">
                    {selectedPlan === 'yearly' && (
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                      >
                        <Check className="w-3.5 h-3.5 text-primary-foreground" />
                      </motion.div>
                    )}
                    <p className="text-2xl font-bold text-foreground">₹1,200</p>
                    <p className="text-xs text-muted-foreground mt-1">per year</p>
                  </div>
                </motion.button>
              </div>

              <div className="space-y-2 mb-5">
                <p className="text-xs font-semibold text-foreground mb-3">What's Included:</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-primary flex-shrink-0" /> <span className="text-xs text-muted-foreground">Public listing on Aaspass</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-primary flex-shrink-0" /> <span className="text-xs text-muted-foreground">WhatsApp / Instagram connect</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-primary flex-shrink-0" /> <span className="text-xs text-muted-foreground">Distance-based discovery</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-primary flex-shrink-0" /> <span className="text-xs text-muted-foreground">Searchable by keyword & category</span></div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-primary flex-shrink-0" /> <span className="text-xs text-muted-foreground">Shareable listing URL</span></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {!usedFreeTrial ? (
                  <motion.button 
                    whileTap={{ scale: 0.96 }} 
                    disabled={isSubmitting}
                    onClick={handleStartFreeTrial}
                    className="col-span-1 py-3 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50"
                  >
                  {isSubmitting ? <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : 'Start Free Trial'}
                  </motion.button>
                ) : null}
                
                <motion.button 
                  whileTap={{ scale: 0.96 }} 
                  disabled={!selectedPlan || isSubmitting}
                  onClick={handlePayAndGoLive}
                  className={`col-span-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-primary/30 ${
                    usedFreeTrial ? '' : 'opacity-50'
                  }`}
                >
                  {isSubmitting ? <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : <><CreditCard className="w-4 h-4" /> Pay</>}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SellerOnboarding;
