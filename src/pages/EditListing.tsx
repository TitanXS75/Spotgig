import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, UploadCloud, Smartphone, Instagram, MapPin, LocateFixed, Globe, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { EyeToggleIcon } from '@/components/ui/animated-state-icons';
import AnimatedDropdown from '@/components/ui/animated-dropdown';
import { CATEGORIES, MOCK_LISTINGS } from '@/lib/mock-data';
import { useAppStore } from '@/store/app-store';
import { reverseGeocode } from '@/lib/api/location';

const SERVICE_TYPES = ['Software', 'Consulting', 'Design', 'Marketing', 'Writing', 'Teaching', 'Photography', 'Editing', 'Fitness Coaching', 'Music Lessons', 'Home Cleaning', 'Maintenance', 'Beauty', 'Healthcare', 'Other'];

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, userListings, updateListing, deleteListing, setUserLocation } = useAppStore();
  
  // Find listing to edit
  const listing = [...userListings, ...MOCK_LISTINGS].find((l) => l.id === id);

  const [listingName, setListingName] = useState(listing?.name || '');
  const [type, setType] = useState<'product' | 'service'>(listing?.type || 'product');
  const [operatingType, setOperatingType] = useState<'shop' | 'home'>(listing?.operating_type || 'shop');
  const [category, setCategory] = useState(listing?.category || '');
  const [categorySpecification, setCategorySpecification] = useState(''); // Only used if matching 'Other' originally
  const [serviceType, setServiceType] = useState(listing?.category || '');
  const [serviceSpecification, setServiceSpecification] = useState('');
  
  const [description, setDescription] = useState(listing?.description || '');
  const [tags, setTags] = useState<string[]>(listing?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [imageUrl, setImageUrl] = useState(listing?.image_url || '');
  const [supportiveImages, setSupportiveImages] = useState<string[]>(listing?.supportive_images || []);

  // Contact / Location
  const [whatsapp, setWhatsapp] = useState(listing?.whatsapp || '');
  const [instagram, setInstagram] = useState(listing?.instagram || '');
  const [website, setWebsite] = useState(listing?.website || '');
  const [otherHandle, setOtherHandle] = useState(listing?.other_handle || '');
  const [area, setArea] = useState(listing?.area || '');
  const [listingLat, setListingLat] = useState<number | null>(listing?.lat || null);
  const [listingLng, setListingLng] = useState<number | null>(listing?.lng || null);

  const [detectingLocation, setDetectingLocation] = useState(false);
  const [showManualCoordinates, setShowManualCoordinates] = useState(false);
  const [manualLat, setManualLat] = useState(listing?.lat?.toString() || '');
  const [manualLng, setManualLng] = useState(listing?.lng?.toString() || '');
  const [hideLocation, setHideLocation] = useState(listing?.hide_location || false);

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  // Initialization rules
  useEffect(() => {
    if (!listing) return;
    
    // Check if category matches our mock array, otherwise it's "Other"
    if (listing.type === 'product') {
      const isKnown = CATEGORIES.find(c => c.name === listing.category);
      if (!isKnown) {
        setCategory('Other');
        setCategorySpecification(listing.category);
      }
    } else {
      const isKnown = SERVICE_TYPES.includes(listing.category);
      if (!isKnown) {
        setServiceType('Other');
        setServiceSpecification(listing.category);
      }
    }
  }, [listing]);

  // Authorization fallback
  if (!user || !listing || (user.email !== listing.user_id)) {
    return (
      <div className="max-w-xl mx-auto px-4 pt-20 text-center">
        <p className="text-muted-foreground">You do not have permission to edit this listing.</p>
        <button onClick={() => navigate(-1)} className="text-primary font-medium mt-4">Go Back</button>
      </div>
    );
  }

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

  const isValid = listingName && 
    (type === 'product' 
      ? (category && (category !== 'Other' || categorySpecification.trim()))
      : (serviceType && (serviceType !== 'Other' || serviceSpecification.trim()))) && 
    description.length > 0 &&
    area && 
    (whatsapp.length === 10 || instagram.length > 0 || otherHandle.trim().length > 0);

  const handleSaveListing = () => {
    const resolvedCategory = type === 'product' ? (category === 'Other' ? categorySpecification : category) : (serviceType === 'Other' ? serviceSpecification : serviceType);
    
    updateListing(listing.id, {
      name: listingName,
      type: type,
      operating_type: operatingType,
      category: resolvedCategory,
      description: description,
      tags: tags,
      whatsapp: whatsapp || null,
      instagram: instagram || null,
      other_handle: otherHandle || null,
      area: area,
      lat: listingLat || 0,
      lng: listingLng || 0,
      image_url: imageUrl || null,
      supportive_images: supportiveImages,
      website: website || null,
      hide_location: hideLocation
    });
    
    setShowSuccessPopup(true);
  };

  const handleDeleteListing = () => {
    if (deleteConfirmation === listingName) {
      deleteListing(listing.id);
      navigate('/profile');
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 md:px-6 pb-24 md:pb-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-4 pb-2">
        <div className="flex justify-start">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-3 hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
        <h1 className="text-subhead text-foreground">Edit Listing</h1>
        <p className="text-sm text-muted-foreground mt-1">Make changes to {listing.name}</p>
      </motion.div>

      <div className="space-y-6 mt-6">
        {/* Basic Details Phase */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">Business Details</h2>
          
          <div>
            <label className="text-sm font-medium text-foreground">Listing Name *</label>
            <input value={listingName} onChange={(e) => setListingName(e.target.value)} placeholder="e.g. Priya's Homemade Snacks" className="mt-1 w-full px-3 py-2.5 rounded-xl bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Type *</label>
              <div className="flex gap-2 mt-1">
                {(['product', 'service'] as const).map((t) => (
                  <button key={t} onClick={() => setType(t)} className={`flex-1 py-1.5 rounded-xl text-sm font-medium transition-colors ${type === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                    {t === 'product' ? '📦 Product' : '🛠️ Service'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Operating *</label>
              <div className="flex gap-2 mt-1">
                {(['shop', 'home'] as const).map((t) => (
                  <button key={t} onClick={() => setOperatingType(t)} className={`flex-1 py-1.5 rounded-xl text-sm font-medium transition-colors ${operatingType === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                    {t === 'shop' ? 'Shop' : 'Home'}
                  </button>
                ))}
              </div>
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
                  <input type="text" value={categorySpecification} onChange={(e) => setCategorySpecification(e.target.value)} placeholder="Specify what you sell" className="mt-2 w-full px-4 py-3 rounded-xl bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
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
                  <input type="text" value={serviceSpecification} onChange={(e) => setServiceSpecification(e.target.value)} placeholder="Specify your service" className="mt-2 w-full px-4 py-3 rounded-xl bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                )}
              </>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Description *</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value.slice(0, maxDesc))} rows={3} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
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
            <label className="text-sm font-medium text-foreground">Change Appearance Image</label>
            <div className="mt-2 w-full">
              {imageUrl ? (
                <div className="flex flex-col gap-3 w-full">
                  <div className="relative w-full h-40 rounded-xl overflow-hidden border border-border">
                    <img src={imageUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center justify-end gap-3 mt-1">
                    <label className="cursor-pointer px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-foreground text-xs font-semibold transition-colors">
                      Replace
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setImageUrl(URL.createObjectURL(file));
                      }} />
                    </label>
                    <button type="button" onClick={(e) => { e.preventDefault(); setImageUrl(''); }} className="px-4 py-2 border border-destructive/30 text-destructive hover:bg-destructive/10 rounded-lg text-xs font-semibold transition-colors">
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors bg-muted/20">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground"><span className="font-semibold text-primary">Click to upload</span> or drag and drop</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setImageUrl(URL.createObjectURL(file));
                  }} />
                </label>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Supportive Images (Max 3)</label>
            <div className="mt-2 grid grid-cols-3 gap-2 w-full">
              {[0, 1, 2].map(idx => {
                const src = supportiveImages[idx];
                return src ? (
                  <div key={idx} className="relative w-full aspect-square rounded-xl overflow-hidden border border-border">
                    <img src={src} alt={`Supportive ${idx}`} className="absolute inset-0 w-full h-full object-cover" />
                    <button type="button" onClick={() => {
                      const newImgs = [...supportiveImages];
                      newImgs.splice(idx, 1);
                      setSupportiveImages(newImgs);
                    }} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label key={idx} className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors bg-muted/20">
                    <div className="flex flex-col items-center justify-center text-center p-1">
                      <UploadCloud className="w-5 h-5 text-muted-foreground mb-1" />
                      <span className="text-[10px] font-semibold text-primary">Add</span>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSupportiveImages([...supportiveImages, URL.createObjectURL(file)]);
                      }
                    }} />
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Contact Phase */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2 mt-4">Contact & Location</h2>
          
          <div>
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5"><Smartphone className="w-4 h-4" /> WhatsApp Number</label>
            <div className="flex gap-2 mt-1">
              <span className="px-3 py-2.5 rounded-xl bg-muted text-sm text-muted-foreground">+91</span>
              <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, '').slice(0, 10))} className="flex-1 px-3 py-2.5 rounded-xl bg-muted text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            {whatsapp.length > 0 && whatsapp.length < 10 && <span className="text-[11px] text-destructive">Enter a valid 10-digit number</span>}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5"><Instagram className="w-4 h-4" /> Instagram Handle</label>
            <div className="flex gap-2 mt-1">
              <span className="px-3 py-2.5 rounded-xl bg-muted text-sm text-muted-foreground">@</span>
              <input value={instagram} onChange={(e) => setInstagram(e.target.value.replace(/\s/g, ''))} className="flex-1 px-3 py-2.5 rounded-xl bg-muted text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5"><Globe className="w-4 h-4" /> Website</label>
            <div className="flex gap-2 mt-1">
              <span className="px-3 py-2.5 rounded-xl bg-muted text-sm text-muted-foreground">https://</span>
              <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="www.yourdomain.com" className="flex-1 px-3 py-2.5 rounded-xl bg-muted text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Other handle (optional)</label>
            <input value={otherHandle} onChange={(e) => setOtherHandle(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-muted text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Area / Locality *</label>
            <input value={area} onChange={(e) => setArea(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-muted text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
            <div className="mt-2 flex items-center justify-between gap-2">
              <button type="button" onClick={detectListingLocation} disabled={detectingLocation} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/70 text-foreground transition-all">
                <LocateFixed className={`w-4 h-4 ${detectingLocation ? 'animate-pulse' : ''}`} />
                {detectingLocation ? 'Detecting…' : 'Detect location'}
              </button>
            </div>
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
        </div>

        <motion.button whileTap={{ scale: 0.96 }} disabled={!isValid} onClick={handleSaveListing} className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-2 mt-8">
          <Check className="w-5 h-5" /> Save Changes
        </motion.button>

        <div className="mt-12 pt-8 border-t border-destructive/20 text-center space-y-4">
          <p className="text-sm font-semibold text-destructive">Danger Zone</p>
          <button onClick={() => setShowDeleteModal(true)} className="px-6 py-2.5 rounded-xl border border-destructive/30 text-destructive text-sm font-semibold hover:bg-destructive/10 transition-colors">
            Delete Business
          </button>
        </div>
      </div>

      {/* Success Popup */}
      <AnimatePresence>
        {showSuccessPopup && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-background rounded-2xl w-full max-w-sm overflow-hidden border border-border">
              <div className="p-8 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-4">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground">Changes Saved!</h3>
                <p className="text-sm text-muted-foreground mb-6">Your business details have been successfully updated.</p>
                <div className="flex gap-3 w-full">
                  <button onClick={() => showSuccessPopup && navigate(-1)} className="flex-1 py-2.5 rounded-xl bg-muted text-foreground text-sm font-semibold hover:bg-muted/80 transition-colors">Go Back</button>
                  <button onClick={() => navigate('/profile')} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold transition-colors">Go to Profile</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-background rounded-2xl w-full max-w-sm overflow-hidden border border-border">
              <div className="p-6">
                <h3 className="text-lg font-bold mb-2 text-foreground">Delete Business</h3>
                <p className="text-sm text-muted-foreground mb-4">This action cannot be undone. To confirm, please type the business name <strong className="text-foreground">{listing.name}</strong></p>
                
                <input 
                  value={deleteConfirmation} 
                  onChange={(e) => setDeleteConfirmation(e.target.value)} 
                  placeholder={listing.name} 
                  className="w-full px-4 py-2.5 rounded-xl bg-muted text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-destructive/30 border border-border" 
                />
                
                <div className="flex gap-3 w-full mt-6">
                  <button onClick={() => { setShowDeleteModal(false); setDeleteConfirmation(''); }} className="flex-1 py-2.5 rounded-xl bg-muted text-foreground text-sm font-semibold hover:bg-muted/80 transition-colors">Cancel</button>
                  <button disabled={deleteConfirmation !== listing.name} onClick={handleDeleteListing} className="flex-1 py-2.5 rounded-xl bg-destructive text-primary-foreground text-sm font-semibold disabled:opacity-40 transition-colors">Delete</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EditListing;
