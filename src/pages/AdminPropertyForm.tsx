import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Plus, X, Save, Eye, Upload, Star, Video, MapPin, Info,
  CheckCircle2, Loader2,
} from 'lucide-react';
import { usePropertyStore } from '../stores/propertyStore';
import { useAdminGuard } from '../stores/authStore';
import type { Property, Review, PropertyType, PropertyCategory, PropertyStatus, PriceType, SourceType, LegalVerificationStatus } from '../data/properties';
import {
  PROPERTY_TYPE_LABELS, PROPERTY_CATEGORY_LABELS, PROPERTY_STATUS_LABELS, PRICE_TYPE_LABELS,
  SOURCE_TYPE_LABELS, LEGAL_VERIFICATION_LABELS, DEFAULT_CATEGORY_FOR_TYPE, PROPERTY_STATUS_TONE,
} from '../data/properties';
import { ATTRIBUTE_SCHEMA } from '../data/propertyAttributeSchema';
import { KARNATAKA_DISTRICTS, getTaluks } from '../data/karnatakaLocations';
import { supabase } from '../lib/supabase';
import { parseVideoUrl } from '../lib/videoUtils';

const FURNISHED_OPTIONS = ['fully', 'semi', 'unfurnished'] as const;
const TYPE_OPTIONS: PropertyType[] = ['plot', 'farmhouse', 'land', 'rent', 'lease', 'sale', 'commercial'];
const LAND_TYPES: PropertyType[] = ['plot', 'farmhouse', 'land'];
const CATEGORY_OPTIONS: PropertyCategory[] = ['residential', 'agricultural', 'commercial', 'hospitality', 'investment'];
const STATUS_OPTIONS: PropertyStatus[] = ['draft', 'available', 'published', 'reserved', 'sold', 'rented', 'inactive'];
const PRICE_TYPE_OPTIONS: PriceType[] = ['total', 'per_sqft', 'per_acre', 'per_guntha', 'per_cent'];
const SOURCE_TYPE_OPTIONS: SourceType[] = ['direct_owner', 'broker', 'referral', 'developer', 'network', 'other'];
const VERIFICATION_OPTIONS: LegalVerificationStatus[] = ['verified', 'pending', 'not_verified'];

const AMENITY_PRESETS = [
  'Power Backup', '24x7 Security', 'Gated Community', 'Car Parking', "Children's Play Area",
  'Clubhouse', 'Swimming Pool', 'Gymnasium', 'Lift', 'CCTV Surveillance', 'Water Supply',
  'Borewell', 'Garden / Landscaping', 'Rain Water Harvesting', 'Compound Wall', 'Street Lighting',
];

const STATUS_TONE_CLASS: Record<string, string> = {
  neutral: 'bg-neutral-100 text-neutral-700',
  info: 'bg-blue-50 text-blue-700',
  success: 'bg-emerald-50 text-emerald-700',
  gold: 'bg-brand-50 text-brand-700',
  critical: 'bg-red-50 text-red-700',
};

const emptyForm: Omit<Property, 'id' | 'propertyCode'> = {
  title: '', location: '', areaName: '', price: 0, type: 'rent', category: 'residential', status: 'draft',
  bedrooms: 2, bathrooms: 2, area: 0, furnished: 'semi', deposit: '',
  availability: 'Immediate', amenities: [], highlights: [], images: [], imageCaptions: [], coverImageIndex: 0,
  videos: [],
  description: '', shortDescription: '', contactEmail: 'trishnaproperties78@gmail.com', mapQuery: '',
  reviews: [], attributes: {}, negotiable: false, priceType: 'total', isFeatured: false, isUrgent: false,
  district: '', taluk: '', cityTown: '', landmark: '', pincode: '', locationVisibility: 'exact',
  legal: {}, source: {},
};

function formatINR(n: number): string {
  if (!n) return '';
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <div className="min-w-0">
        <p className="text-sm text-neutral-700 font-medium">{label}</p>
        {hint && <p className="text-[11px] text-neutral-400">{hint}</p>}
      </div>
      <button type="button" onClick={() => onChange(!checked)} aria-pressed={checked}
        className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${checked ? 'bg-brand-500' : 'bg-neutral-200'}`}>
        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-[18px]' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-[11px] text-red-500 mt-1">{message}</p>;
}

export default function AdminPropertyForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const ready = useAdminGuard();
  const { properties, fetchProperties, addProperty, updateProperty } = usePropertyStore();

  const [form, setForm] = useState<Omit<Property, 'id' | 'propertyCode'>>(emptyForm);
  const [propertyCode, setPropertyCode] = useState<string>('Generated on save');
  const [amenityInput, setAmenityInput] = useState('');
  const [highlightInput, setHighlightInput] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [pendingImagePreviews, setPendingImagePreviews] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<'title' | 'district' | 'price', string>>>({});
  const [savingMode, setSavingMode] = useState<'draft' | 'publish' | null>(null);

  // Video state
  const [videoInput, setVideoInput] = useState('');
  const [videoUploading, setVideoUploading] = useState(false);
  const [pendingVideoCount, setPendingVideoCount] = useState(0);

  // New review form state
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ready) fetchProperties();
  }, [ready, fetchProperties]);

  useEffect(() => {
    if (!ready) return;
    if (isEdit && id) {
      const p = properties.find(p => p.id === id);
      if (p) {
        const { id: _id, propertyCode: pc, ...rest } = p;
        setForm({
          ...rest,
          videos: rest.videos || [],
          attributes: rest.attributes || {},
          legal: rest.legal || {},
          source: rest.source || {},
        });
        setPropertyCode(pc);
      } else if (properties.length > 0) navigate('/admin/properties');
    }
  }, [id, isEdit, ready, navigate, properties]);

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const updateAttr = (key: string, value: string | number | boolean) => {
    setForm(prev => ({ ...prev, attributes: { ...(prev.attributes || {}), [key]: value } }));
  };

  const updateLegal = (key: string, value: any) => {
    setForm(prev => ({ ...prev, legal: { ...(prev.legal || {}), [key]: value } }));
  };

  const updateSource = (key: string, value: any) => {
    setForm(prev => ({ ...prev, source: { ...(prev.source || {}), [key]: value } }));
  };

  const handleTypeChange = (type: PropertyType) => {
    setForm(prev => ({ ...prev, type, category: DEFAULT_CATEGORY_FOR_TYPE[type], attributes: {} }));
  };

  const attrFields = useMemo(() => ATTRIBUTE_SCHEMA[form.type] || [], [form.type]);
  const taluks = useMemo(() => getTaluks(form.district || ''), [form.district]);

  const addToList = (key: 'amenities' | 'highlights' | 'images' | 'videos', value: string) => {
    if (!value.trim()) return;
    setForm(prev => ({ ...prev, [key]: [...(prev[key] || []), value.trim()] }));
  };

  const toggleAmenity = (value: string) => {
    setForm(prev => {
      const has = prev.amenities.includes(value);
      return { ...prev, amenities: has ? prev.amenities.filter(a => a !== value) : [...prev.amenities, value] };
    });
  };

  const removeFromList = (key: 'amenities' | 'highlights' | 'images' | 'videos', index: number) => {
    setForm(prev => ({ ...prev, [key]: (prev[key] || []).filter((_, i) => i !== index) }));
  };

  const moveImage = (index: number, dir: -1 | 1) => {
    setForm(prev => {
      const images = [...prev.images];
      const captions = [...(prev.imageCaptions || [])];
      const target = index + dir;
      if (target < 0 || target >= images.length) return prev;
      [images[index], images[target]] = [images[target], images[index]];
      [captions[index], captions[target]] = [captions[target], captions[index]];
      let cover = prev.coverImageIndex ?? 0;
      if (cover === index) cover = target; else if (cover === target) cover = index;
      return { ...prev, images, imageCaptions: captions, coverImageIndex: cover };
    });
  };

  const setCoverImage = (index: number) => update('coverImageIndex', index);

  const setImageCaption = (index: number, caption: string) => {
    setForm(prev => {
      const captions = [...(prev.imageCaptions || [])];
      captions[index] = caption;
      return { ...prev, imageCaptions: captions };
    });
  };

  const removeImage = (index: number) => {
    setForm(prev => {
      const images = prev.images.filter((_, i) => i !== index);
      const captions = (prev.imageCaptions || []).filter((_, i) => i !== index);
      let cover = prev.coverImageIndex ?? 0;
      if (cover >= images.length) cover = Math.max(0, images.length - 1);
      return { ...prev, images, imageCaptions: captions, coverImageIndex: cover };
    });
  };

  const addReview = () => {
    if (!newReviewName.trim() || !newReviewText.trim()) return;
    const newReview: Review = {
      id: `review-${Date.now()}`,
      name: newReviewName.trim(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(newReviewName.trim())}`,
      rating: newReviewRating,
      date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
      text: newReviewText.trim(),
    };
    setForm(prev => ({ ...prev, reviews: [...prev.reviews, newReview] }));
    setNewReviewName('');
    setNewReviewRating(5);
    setNewReviewText('');
  };

  const removeReview = (index: number) => {
    setForm(prev => ({ ...prev, reviews: prev.reviews.filter((_, i) => i !== index) }));
  };

  // Shared upload core — used by both the file picker input and drag-and-drop.
  const uploadImages = async (files: File[]) => {
    if (files.length === 0) return;
    const previews: string[] = [];
    for (const file of files) {
      if (file.type.startsWith('image/')) previews.push(URL.createObjectURL(file));
    }
    setPendingImagePreviews(prev => [...prev, ...previews]);
    setUploading(true);
    const newImageUrls: string[] = [];

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('properties')
          .upload(filePath, file, { cacheControl: '3600', upsert: false });

        if (uploadError) throw new Error(uploadError.message);

        const { data: urlData } = supabase.storage.from('properties').getPublicUrl(filePath);
        newImageUrls.push(urlData.publicUrl);
      }

      setPendingImagePreviews([]);
      setForm(prev => ({ ...prev, images: [...prev.images, ...newImageUrls] }));
    } catch (err) {
      console.error('Error uploading images:', err);
      alert('Image storage isn\'t connected yet. Paste an image URL below instead, or connect Supabase Storage to enable direct upload.');
      setPendingImagePreviews([]);
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await uploadImages(files);
    e.target.value = '';
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files || []).filter(f => f.type.startsWith('image/'));
    await uploadImages(files);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setPendingVideoCount(files.length)
    setVideoUploading(true)
    const newVideoUrls: string[] = []

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop() || 'mp4'
        const fileName = `${crypto.randomUUID()}.${fileExt}`
        const filePath = `videos/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('properties')
          .upload(filePath, file, { cacheControl: '3600', upsert: false })

        if (uploadError) {
          throw new Error(uploadError.message)
        }

        const { data: urlData } = supabase.storage.from('properties').getPublicUrl(filePath)
        newVideoUrls.push(urlData.publicUrl)
      }

      setForm(prev => ({ ...prev, videos: [...(prev.videos || []), ...newVideoUrls] }))
    } catch (err) {
      console.error('Error uploading video:', err)
      alert('Video storage isn\'t connected yet. Paste a YouTube/Vimeo/video URL below instead.')
    } finally {
      setVideoUploading(false)
      setPendingVideoCount(0)
      e.target.value = ''
    }
  };

  // Only Title blocks a draft save (the DB requires it). Publishing additionally
  // requires District and a real Price, since those drive the public listing.
  const validate = (forPublish: boolean) => {
    const errs: typeof errors = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (forPublish) {
      if (!form.district) errs.district = 'District is required to publish';
      if (!form.price || form.price <= 0) errs.price = 'Price is required to publish';
    }
    return errs;
  };

  const missingRequired = useMemo(() => {
    const labels: string[] = [];
    if (!form.title.trim()) labels.push('Title');
    if (!form.district) labels.push('District');
    if (!form.price || form.price <= 0) labels.push('Price');
    return labels;
  }, [form.title, form.district, form.price]);

  const handleSubmit = async (publishNow: boolean) => {
    const errs = validate(publishNow);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    setErrors({});

    // Auto-compose the display location/area strings from the structured picker
    // when left blank, so cards & filters keep working without extra typing.
    const areaName = form.areaName || form.cityTown || form.taluk || form.district;
    const location = form.location || [form.cityTown || form.taluk, form.district].filter(Boolean).join(', ');
    const mapQuery = form.mapQuery || [form.landmark, form.cityTown || form.taluk, form.district, 'Karnataka'].filter(Boolean).join(', ');
    const payload = {
      ...form,
      areaName,
      location,
      mapQuery,
      status: publishNow ? ('published' as PropertyStatus) : form.status,
    };

    setSavingMode(publishNow ? 'publish' : 'draft');
    try {
      if (isEdit && id) {
        await updateProperty(id, payload);
      } else {
        await addProperty(payload);
      }
      navigate('/admin/properties');
    } catch (err) {
      console.error('Error submitting property:', err)
      alert('Ran into an issue, please try again later.')
    } finally {
      setSavingMode(null);
    }
  };

  const handlePreview = () => {
    if (!id) return;
    window.open(`/listings/${id}`, '_blank', 'noopener');
  };

  if (!ready) return null;

  const inputCls = "w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500";
  const errorInputCls = "w-full px-4 py-2.5 bg-red-50/50 border border-red-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500";
  const labelCls = "block text-xs font-medium text-neutral-500 mb-1";
  const sectionHeadingCls = "text-sm font-semibold text-navy-900 mb-4";
  const subHeadingCls = "text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 pt-4 mt-4 border-t border-neutral-100";

  return (
    <div className="min-h-screen bg-neutral-50 pb-24">
      {/* Header */}
      <div ref={topRef} className="bg-white border-b border-neutral-100 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          <button onClick={() => navigate('/admin/properties')} className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500 flex-shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-display font-bold text-navy-900 tracking-wide truncate">
              {isEdit ? 'Edit Property' : 'Add New Property'}
            </h1>
            <p className="text-[11px] text-neutral-400 font-mono">{propertyCode}</p>
          </div>
          <span className={`hidden sm:inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold flex-shrink-0 ${STATUS_TONE_CLASS[PROPERTY_STATUS_TONE[form.status]]}`}>
            {PROPERTY_STATUS_LABELS[form.status]}
          </span>
        </div>
      </div>

      {/* One simple, continuous form — no tabs to click through */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Basic Details */}
        <section className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
          <h2 className={sectionHeadingCls}>Basic Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelCls}>Property Title *</label>
              <input value={form.title} onChange={e => { update('title', e.target.value); if (errors.title) setErrors(p => ({ ...p, title: undefined })); }}
                placeholder="e.g. 2.5 Acre Farmhouse Plot, Sakleshpur" className={errors.title ? errorInputCls : inputCls} />
              <FieldError message={errors.title} />
            </div>
            <div>
              <label className={labelCls}>Property Type *</label>
              <select value={form.type} onChange={e => handleTypeChange(e.target.value as PropertyType)} className={inputCls}>
                {TYPE_OPTIONS.map(t => <option key={t} value={t}>{PROPERTY_TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Category</label>
              <select value={form.category} onChange={e => update('category', e.target.value as PropertyCategory)} className={inputCls}>
                {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{PROPERTY_CATEGORY_LABELS[c]}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Listing Status</label>
              <select value={form.status} onChange={e => update('status', e.target.value as PropertyStatus)} className={inputCls}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{PROPERTY_STATUS_LABELS[s]}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Asking Price (₹) *</label>
              <input type="number" value={form.price || ''} onChange={e => { update('price', Number(e.target.value)); if (errors.price) setErrors(p => ({ ...p, price: undefined })); }}
                className={errors.price ? errorInputCls : inputCls} />
              {form.price > 0 && !errors.price && <p className="text-[11px] text-brand-600 font-semibold mt-1">{formatINR(form.price)}</p>}
              <FieldError message={errors.price} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <Toggle checked={!!form.isFeatured} onChange={v => update('isFeatured', v)} label="Featured Property" hint="Highlighted across the site" />
            <Toggle checked={!!form.isUrgent} onChange={v => update('isUrgent', v)} label="Urgent / Premium Listing" hint="Marked for priority visibility" />
          </div>

          <h3 className={subHeadingCls}>Price & Financials</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Price Type</label>
              <select value={form.priceType} onChange={e => update('priceType', e.target.value as PriceType)} className={inputCls}>
                {PRICE_TYPE_OPTIONS.map(p => <option key={p} value={p}>{PRICE_TYPE_LABELS[p]}</option>)}
              </select>
            </div>
            <div className="flex items-center">
              <Toggle checked={!!form.negotiable} onChange={v => update('negotiable', v)} label="Negotiable" />
            </div>
            <div>
              <label className={labelCls}>Booking / Advance Amount (₹)</label>
              <input type="number" value={form.advanceAmount || ''} onChange={e => update('advanceAmount', Number(e.target.value))} className={inputCls} />
            </div>
          </div>
          <div className="mt-4 p-3.5 bg-neutral-50 rounded-xl border border-neutral-100">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-3">
              <Info className="h-3.5 w-3.5" /> Admin only — never shown on the public website
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Minimum Expected Price (₹)</label>
                <input type="number" value={form.minExpectedPrice || ''} onChange={e => update('minExpectedPrice', Number(e.target.value))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Commission Type</label>
                <select value={form.commissionType || ''} onChange={e => update('commissionType', e.target.value as 'flat' | 'percentage')} className={inputCls}>
                  <option value="">Not set</option>
                  <option value="flat">Flat Amount</option>
                  <option value="percentage">Percentage</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Commission Value</label>
                <input type="number" value={form.commissionValue || ''} onChange={e => update('commissionValue', Number(e.target.value))} className={inputCls} />
              </div>
            </div>
          </div>
        </section>

        {/* Location */}
        <section className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
          <h2 className={`${sectionHeadingCls} flex items-center gap-2`}><MapPin className="h-4 w-4 text-brand-500" /> Location — Karnataka</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>District *</label>
              <select value={form.district} onChange={e => { update('district', e.target.value); if (errors.district) setErrors(p => ({ ...p, district: undefined })); }}
                className={errors.district ? errorInputCls : inputCls}>
                <option value="">Select district</option>
                {KARNATAKA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <FieldError message={errors.district} />
            </div>
            <div>
              <label className={labelCls}>Taluk</label>
              <select value={form.taluk} onChange={e => update('taluk', e.target.value)} disabled={!form.district}
                className={`${inputCls} disabled:opacity-50 disabled:cursor-not-allowed`}>
                <option value="">Select taluk</option>
                {taluks.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>City / Town / Village</label>
              <input value={form.cityTown} onChange={e => update('cityTown', e.target.value)} placeholder="e.g. Hanbal"
                className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Locality / Area</label>
              <input value={form.areaName} onChange={e => update('areaName', e.target.value)} placeholder="e.g. Near NH-75"
                className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Landmark</label>
              <input value={form.landmark} onChange={e => update('landmark', e.target.value)} placeholder="e.g. 2 km from bus stand"
                className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Pincode</label>
              <input value={form.pincode} onChange={e => update('pincode', e.target.value)} maxLength={6} placeholder="6-digit PIN"
                className={inputCls} />
            </div>
          </div>

          <h3 className={subHeadingCls}>Map &amp; Coordinates</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Latitude</label>
              <input value={form.latitude || ''} onChange={e => update('latitude', e.target.value)} placeholder="e.g. 12.9141"
                className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Longitude</label>
              <input value={form.longitude || ''} onChange={e => update('longitude', e.target.value)} placeholder="e.g. 75.7852"
                className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Location Visibility</label>
              <select value={form.locationVisibility} onChange={e => update('locationVisibility', e.target.value as 'exact' | 'approximate')}
                className={inputCls}>
                <option value="exact">Show Exact Location</option>
                <option value="approximate">Show Approximate Area</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <label className={labelCls}>Google Maps Query <span className="text-neutral-400 normal-case">(auto-filled if left blank)</span></label>
              <input value={form.mapQuery} onChange={e => update('mapQuery', e.target.value)} placeholder="e.g. Sakleshpur, Hassan, Karnataka"
                className={inputCls} />
            </div>
            <div className="md:col-span-3">
              <label className={labelCls}>Full Location <span className="text-neutral-400 normal-case">(shown on cards — auto-filled if left blank)</span></label>
              <input value={form.location} onChange={e => update('location', e.target.value)} placeholder="e.g. Sakleshpur, Hassan"
                className={inputCls} />
            </div>
          </div>
        </section>

        {/* Property Details */}
        <section className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
          <h2 className={sectionHeadingCls}>Property Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className={labelCls}>
                Bedrooms {LAND_TYPES.includes(form.type) && <span className="text-neutral-400 normal-case">(0 for plots/land)</span>}
              </label>
              <input type="number" value={form.bedrooms} onChange={e => update('bedrooms', Number(e.target.value))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>
                Bathrooms {LAND_TYPES.includes(form.type) && <span className="text-neutral-400 normal-case">(0 for plots/land)</span>}
              </label>
              <input type="number" value={form.bathrooms} onChange={e => update('bathrooms', Number(e.target.value))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Total Area (sq ft)</label>
              <input type="number" value={form.area || ''} onChange={e => update('area', Number(e.target.value))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Furnished</label>
              <select value={form.furnished} onChange={e => update('furnished', e.target.value as typeof form.furnished)} className={inputCls}>
                {FURNISHED_OPTIONS.map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Floor</label>
              <input value={form.floor || ''} onChange={e => update('floor', e.target.value)} placeholder="e.g. 3rd Floor" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Facing</label>
              <input value={form.facing || ''} onChange={e => update('facing', e.target.value)} placeholder="e.g. East" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Availability</label>
              <input value={form.availability} onChange={e => update('availability', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Deposit</label>
              <input value={form.deposit} onChange={e => update('deposit', e.target.value)} placeholder="e.g. 2 Lakhs" className={inputCls} />
            </div>
          </div>

          {attrFields.length > 0 && (
            <>
              <h3 className={subHeadingCls}>{PROPERTY_TYPE_LABELS[form.type]} — Additional Fields</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {attrFields.map(f => {
                  const val = form.attributes?.[f.key];
                  if (f.input === 'boolean') {
                    return (
                      <div key={f.key} className="flex items-center">
                        <Toggle checked={!!val} onChange={v => updateAttr(f.key, v)} label={f.label} />
                      </div>
                    );
                  }
                  if (f.input === 'select') {
                    return (
                      <div key={f.key}>
                        <label className={labelCls}>{f.label}</label>
                        <select value={(val as string) || ''} onChange={e => updateAttr(f.key, e.target.value)} className={inputCls}>
                          <option value="">Select</option>
                          {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                    );
                  }
                  return (
                    <div key={f.key}>
                      <label className={labelCls}>{f.label} {f.unit && <span className="text-neutral-400 normal-case">({f.unit})</span>}</label>
                      <input
                        type={f.input === 'number' ? 'number' : 'text'}
                        value={(val as string | number) ?? ''}
                        onChange={e => updateAttr(f.key, f.input === 'number' ? Number(e.target.value) : e.target.value)}
                        placeholder={f.placeholder}
                        className={inputCls}
                      />
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {/* Amenities & Highlights */}
        <section className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
          <h2 className={sectionHeadingCls}>Amenities</h2>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {AMENITY_PRESETS.map(a => {
              const selected = form.amenities.includes(a);
              return (
                <button key={a} type="button" onClick={() => toggleAmenity(a)}
                  className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                    selected ? 'bg-brand-500 border-brand-500 text-white' : 'bg-white border-neutral-200 text-neutral-600 hover:border-brand-300'
                  }`}>
                  {a}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2 mb-3">
            <input value={amenityInput} onChange={e => setAmenityInput(e.target.value)} placeholder="Add a custom amenity..."
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addToList('amenities', amenityInput); setAmenityInput(''); } }}
              className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
            <button type="button" onClick={() => { addToList('amenities', amenityInput); setAmenityInput(''); }}
              className="px-3 py-2 bg-brand-50 text-brand-500 rounded-lg text-sm font-semibold hover:bg-brand-100 transition-colors">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {form.amenities.filter(a => !AMENITY_PRESETS.includes(a)).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.amenities.map((a, i) => !AMENITY_PRESETS.includes(a) && (
                <span key={i} className="flex items-center gap-1 px-2.5 py-1 bg-neutral-100 text-neutral-700 text-xs font-medium rounded-full">
                  {a}
                  <button type="button" onClick={() => removeFromList('amenities', i)}><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
          )}

          <h3 className={subHeadingCls}>Highlights</h3>
          <div className="flex gap-2 mb-3">
            <input value={highlightInput} onChange={e => setHighlightInput(e.target.value)} placeholder="e.g. Near NH-75"
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addToList('highlights', highlightInput); setHighlightInput(''); } }}
              className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
            <button type="button" onClick={() => { addToList('highlights', highlightInput); setHighlightInput(''); }}
              className="px-3 py-2 bg-brand-50 text-brand-500 rounded-lg text-sm font-semibold hover:bg-brand-100 transition-colors">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {form.highlights.map((h, i) => (
              <span key={i} className="flex items-center gap-1 px-2.5 py-1 bg-neutral-100 text-neutral-700 text-xs font-medium rounded-full">
                {h}
                <button type="button" onClick={() => removeFromList('highlights', i)}><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        </section>

        {/* Media */}
        <section className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
          <h2 className={sectionHeadingCls}>Images</h2>

          <div
            onDragOver={e => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-2 px-4 py-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors mb-4 ${
              dragActive ? 'bg-brand-100 border-brand-400' : 'bg-brand-50 border-brand-200 hover:bg-brand-100'
            }`}>
            <Upload className="h-6 w-6 text-brand-500" />
            <span className="font-semibold text-sm text-brand-700">
              {uploading ? 'Uploading...' : 'Drag & drop images here, or click to browse'}
            </span>
            <span className="text-[11px] text-neutral-400">You can select multiple files at once</span>
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={uploading} className="hidden" />
          </div>

          <div className="flex gap-2 mb-4">
            <input value={imageInput} onChange={e => setImageInput(e.target.value)} placeholder="...or paste an image URL"
              className="flex-1 px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
            <button type="button" onClick={() => { addToList('images', imageInput); setImageInput(''); }}
              className="px-4 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 transition-colors">
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pendingImagePreviews.map((preview, i) => (
              <div key={`preview-${i}`} className="relative h-32 rounded-xl overflow-hidden bg-neutral-100 border border-brand-200 shadow-sm">
                <img src={preview} alt={`Uploading ${i + 1}`} className="w-full h-full object-cover opacity-75" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
              </div>
            ))}
            {form.images.map((img, i) => (
              <div key={i} className="relative group rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 shadow-sm">
                <div className="h-32 relative">
                  <img src={img} alt={`Property image ${i + 1}`} className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  {(form.coverImageIndex ?? 0) === i && (
                    <span className="absolute top-1.5 left-1.5 text-[9px] font-bold uppercase px-1.5 py-0.5 bg-brand-500 text-white rounded">Cover</span>
                  )}
                  <button type="button" onClick={() => removeImage(i)}
                    className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="p-2 space-y-1.5">
                  <input value={form.imageCaptions?.[i] || ''} onChange={e => setImageCaption(i, e.target.value)}
                    placeholder="Caption (optional)" className="w-full px-2 py-1 text-[11px] bg-white border border-neutral-200 rounded-md outline-none" />
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0}
                      className="flex-1 text-[10px] px-1.5 py-1 bg-neutral-100 rounded disabled:opacity-30 hover:bg-neutral-200">← Move</button>
                    <button type="button" onClick={() => setCoverImage(i)}
                      className="flex-1 text-[10px] px-1.5 py-1 bg-neutral-100 rounded hover:bg-neutral-200">Set Cover</button>
                    <button type="button" onClick={() => moveImage(i, 1)} disabled={i === form.images.length - 1}
                      className="flex-1 text-[10px] px-1.5 py-1 bg-neutral-100 rounded disabled:opacity-30 hover:bg-neutral-200">Move →</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {form.images.length === 0 && pendingImagePreviews.length === 0 && (
            <p className="text-xs text-neutral-400 text-center py-4">No images added yet.</p>
          )}

          <h3 className={subHeadingCls}>Videos &amp; Walkthroughs</h3>
          <label className="flex items-center justify-center gap-2 px-4 py-3 bg-brand-50 border-2 border-dashed border-brand-200 rounded-xl text-brand-600 cursor-pointer hover:bg-brand-100 transition-colors mb-4">
            <Video className="h-5 w-5" />
            <span className="font-semibold text-sm">
              {videoUploading ? `Uploading ${pendingVideoCount} video(s)...` : 'Upload Video Files'}
            </span>
            <input type="file" accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*" multiple
              onChange={handleVideoUpload} disabled={videoUploading} className="hidden" />
          </label>

          <div className="flex gap-2 mb-4">
            <input value={videoInput} onChange={e => setVideoInput(e.target.value)} placeholder="Paste YouTube, Vimeo, or video URL"
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addToList('videos', videoInput); setVideoInput(''); } }}
              className="flex-1 px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
            <button type="button" onClick={() => { addToList('videos', videoInput); setVideoInput(''); }}
              className="px-4 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 transition-colors flex items-center gap-1.5">
              <Plus className="h-4 w-4" /><span>Add</span>
            </button>
          </div>

          {(form.videos || []).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(form.videos || []).map((videoUrl, i) => {
                const parsed = parseVideoUrl(videoUrl);
                return (
                  <div key={i} className="relative bg-neutral-900 rounded-xl overflow-hidden border border-neutral-200 shadow-sm group">
                    <div className="aspect-video w-full bg-black flex items-center justify-center">
                      {parsed.type === 'youtube' || parsed.type === 'vimeo' ? (
                        <iframe src={parsed.embedUrl} title={`Property Video ${i + 1}`} className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                      ) : (
                        <video src={parsed.embedUrl} controls className="w-full h-full object-contain" preload="metadata" />
                      )}
                    </div>
                    <div className="p-3 bg-white flex items-center justify-between border-t border-neutral-100">
                      <div className="flex items-center space-x-2 truncate">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-brand-50 text-brand-700">{parsed.type}</span>
                        <span className="text-xs text-neutral-600 truncate max-w-[200px]">{videoUrl}</span>
                      </div>
                      <button type="button" onClick={() => removeFromList('videos', i)}
                        className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors" title="Remove Video">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-neutral-400 text-center py-4">No videos added yet.</p>
          )}
        </section>

        {/* Description */}
        <section className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 space-y-4">
          <h2 className={`${sectionHeadingCls} !mb-0`}>Description</h2>
          <div>
            <label className={labelCls}>Short Description <span className="text-neutral-400 normal-case">(cards &amp; previews, 1–2 lines)</span></label>
            <textarea value={form.shortDescription} onChange={e => update('shortDescription', e.target.value)} rows={2} className={`${inputCls} resize-none`} />
          </div>
          <div>
            <label className={labelCls}>Detailed Description</label>
            <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={5} className={`${inputCls} resize-none`} />
          </div>
          <div>
            <label className={labelCls}>Contact Email</label>
            <input value={form.contactEmail} onChange={e => update('contactEmail', e.target.value)} className={inputCls} />
          </div>

          <h3 className={`${subHeadingCls} !mt-0`}>SEO</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>SEO Title</label>
              <input value={form.seoTitle || ''} onChange={e => update('seoTitle', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>URL Slug</label>
              <input value={form.slug || ''} onChange={e => update('slug', e.target.value)} placeholder="auto-generated if blank" className={inputCls} />
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>SEO Description</label>
              <textarea value={form.seoDescription || ''} onChange={e => update('seoDescription', e.target.value)} rows={2} className={`${inputCls} resize-none`} />
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>Meta Keywords</label>
              <input value={form.metaKeywords || ''} onChange={e => update('metaKeywords', e.target.value)} placeholder="comma, separated, keywords" className={inputCls} />
            </div>
          </div>
        </section>

        {/* Legal & Documents + Owner & Source (admin only) */}
        <section className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-4">
            <Info className="h-3.5 w-3.5" /> Admin only — never shown on the public website · all fields optional
          </div>
          <h2 className={sectionHeadingCls}>Legal &amp; Documentation</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className={labelCls}>Ownership Type</label>
              <input value={form.legal?.ownershipType || ''} onChange={e => updateLegal('ownershipType', e.target.value)}
                placeholder="Individual, Joint, Company..." className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Verification Status</label>
              <select value={form.legal?.verificationStatus || ''} onChange={e => updateLegal('verificationStatus', e.target.value)} className={inputCls}>
                <option value="">Not set</option>
                {VERIFICATION_OPTIONS.map(v => <option key={v} value={v}>{LEGAL_VERIFICATION_LABELS[v]}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Survey Number</label>
              <input value={form.legal?.surveyNumber || ''} onChange={e => updateLegal('surveyNumber', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Hissa Number</label>
              <input value={form.legal?.hissaNumber || ''} onChange={e => updateLegal('hissaNumber', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Land Classification</label>
              <input value={form.legal?.landClassification || ''} onChange={e => updateLegal('landClassification', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>DC Conversion Status</label>
              <input value={form.legal?.dcConversionStatus || ''} onChange={e => updateLegal('dcConversionStatus', e.target.value)} className={inputCls} />
            </div>
            <div className="md:col-span-3">
              <label className={labelCls}>Layout / Local Authority Approval</label>
              <input value={form.legal?.layoutApproval || ''} onChange={e => updateLegal('layoutApproval', e.target.value)}
                placeholder="e.g. BMRDA approved, BBMP khata A" className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 mb-4 p-3.5 bg-neutral-50 rounded-xl border border-neutral-100">
            {(['titleDeed', 'saleDeed', 'rtc', 'mutation', 'khata', 'ec'] as const).map(doc => (
              <Toggle key={doc} checked={!!form.legal?.[doc]} onChange={v => updateLegal(doc, v)} label={doc.toUpperCase()} />
            ))}
          </div>
          <div>
            <label className={labelCls}>Legal Notes</label>
            <textarea value={form.legal?.notes || ''} onChange={e => updateLegal('notes', e.target.value)} rows={2} className={`${inputCls} resize-none`} />
          </div>

          <h3 className={subHeadingCls}>Owner / Source Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className={labelCls}>Owner Name</label>
              <input value={form.source?.ownerName || ''} onChange={e => updateSource('ownerName', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Owner Phone</label>
              <input value={form.source?.ownerPhone || ''} onChange={e => updateSource('ownerPhone', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Owner WhatsApp</label>
              <input value={form.source?.ownerWhatsApp || ''} onChange={e => updateSource('ownerWhatsApp', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Owner Email</label>
              <input value={form.source?.ownerEmail || ''} onChange={e => updateSource('ownerEmail', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Source Type</label>
              <select value={form.source?.sourceType || ''} onChange={e => updateSource('sourceType', e.target.value)} className={inputCls}>
                <option value="">Select</option>
                {SOURCE_TYPE_OPTIONS.map(s => <option key={s} value={s}>{SOURCE_TYPE_LABELS[s]}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Source Contact</label>
              <input value={form.source?.sourceContact || ''} onChange={e => updateSource('sourceContact', e.target.value)}
                placeholder="If sourced via broker/referral" className={inputCls} />
            </div>
          </div>
          <div className="mb-4">
            <label className={labelCls}>Commission Agreement</label>
            <input value={form.source?.commissionAgreement || ''} onChange={e => updateSource('commissionAgreement', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Source Notes</label>
            <textarea value={form.source?.notes || ''} onChange={e => updateSource('notes', e.target.value)} rows={2} className={`${inputCls} resize-none`} />
          </div>
        </section>

        {/* Reviews (optional) */}
        <section className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
          <h2 className={sectionHeadingCls}>Reviews <span className="text-neutral-400 font-normal normal-case">(optional)</span></h2>
          <div className="mb-6 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
            <h3 className="text-xs font-semibold text-neutral-700 uppercase tracking-wide mb-3">Add New Review</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className={labelCls}>Reviewer Name</label>
                <input value={newReviewName} onChange={e => setNewReviewName(e.target.value)} placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
              </div>
              <div>
                <label className={labelCls}>Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} type="button" onClick={() => setNewReviewRating(star)} className="p-1.5 rounded-lg transition-all">
                      <Star className={`h-5 w-5 ${star <= newReviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mb-3">
              <label className={labelCls}>Review Text</label>
              <textarea value={newReviewText} onChange={e => setNewReviewText(e.target.value)} placeholder="Write a review..." rows={3}
                className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none" />
            </div>
            <button type="button" onClick={addReview}
              className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-semibold hover:bg-brand-600 transition-colors">
              <Plus className="h-4 w-4" /> Add Review
            </button>
          </div>

          {form.reviews.length > 0 ? (
            <div className="space-y-4">
              {form.reviews.map((review, i) => (
                <div key={review.id} className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-navy-900">{review.name}</h4>
                      <div className="flex items-center gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} className={`h-3.5 w-3.5 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-300'}`} />
                        ))}
                        <span className="text-xs text-neutral-500 ml-1">{review.date}</span>
                      </div>
                      <p className="text-sm text-neutral-700 leading-relaxed">{review.text}</p>
                    </div>
                    <button type="button" onClick={() => removeReview(i)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500 text-center py-6">No reviews yet. Add your first review above!</p>
          )}
        </section>
      </div>

      {/* Sticky bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0 hidden sm:block">
            {missingRequired.length > 0 ? (
              <p className="text-xs text-neutral-500">
                <span className="font-semibold text-amber-600">{missingRequired.join(', ')}</span> required to publish. Draft saving is always available.
              </p>
            ) : (
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> All required fields complete — ready to publish.
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-auto flex-shrink-0">
            <button type="button" onClick={() => handleSubmit(false)} disabled={savingMode !== null}
              className="flex items-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 disabled:opacity-60 text-navy-900 font-semibold px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all">
              {savingMode === 'draft' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span className="hidden sm:inline">Save Draft</span>
            </button>
            <button type="button" onClick={handlePreview} disabled={!id}
              title={id ? 'Open the live/preview page in a new tab' : 'Save as a draft first to preview'}
              className="flex items-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed text-navy-900 font-semibold px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Preview</span>
            </button>
            <button type="button" onClick={() => handleSubmit(true)} disabled={savingMode !== null}
              className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-semibold px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-all hover:shadow-lg hover:shadow-brand-500/25">
              {savingMode === 'publish' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              <span>{isEdit ? 'Save & Publish' : 'Publish Property'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
