import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, X, Save, Image, Upload, Star, Video, MapPin, Info } from 'lucide-react';
import { usePropertyStore } from '../stores/propertyStore';
import { useAdminGuard } from '../stores/authStore';
import type { Property, Review, PropertyType, PropertyCategory, PropertyStatus, PriceType, SourceType, LegalVerificationStatus } from '../data/properties';
import {
  PROPERTY_TYPE_LABELS, PROPERTY_CATEGORY_LABELS, PROPERTY_STATUS_LABELS, PRICE_TYPE_LABELS,
  SOURCE_TYPE_LABELS, LEGAL_VERIFICATION_LABELS, DEFAULT_CATEGORY_FOR_TYPE,
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

const TABS = [
  { id: 'basic', label: 'Basic & Location' },
  { id: 'details', label: 'Property Details' },
  { id: 'price', label: 'Price' },
  { id: 'media', label: 'Media' },
  { id: 'amenities', label: 'Amenities' },
  { id: 'description', label: 'Description & SEO' },
  { id: 'legal', label: 'Legal & Source' },
  { id: 'reviews', label: 'Reviews' },
] as const;
type TabId = typeof TABS[number]['id'];

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

export default function AdminPropertyForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const ready = useAdminGuard();
  const { properties, fetchProperties, addProperty, updateProperty } = usePropertyStore();

  const [activeTab, setActiveTab] = useState<TabId>('basic');
  const [form, setForm] = useState<Omit<Property, 'id' | 'propertyCode'>>(emptyForm);
  const [propertyCode, setPropertyCode] = useState<string>('Generated on save');
  const [amenityInput, setAmenityInput] = useState('');
  const [highlightInput, setHighlightInput] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [pendingImagePreviews, setPendingImagePreviews] = useState<string[]>([]);

  // Video state
  const [videoInput, setVideoInput] = useState('');
  const [videoUploading, setVideoUploading] = useState(false);
  const [pendingVideoCount, setPendingVideoCount] = useState(0);

  // New review form state
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const previews: string[] = []
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        previews.push(URL.createObjectURL(file))
      }
    }
    setPendingImagePreviews(prev => [...prev, ...previews])
    setUploading(true)
    const newImageUrls: string[] = []

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${crypto.randomUUID()}.${fileExt}`
        const filePath = `images/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('properties')
          .upload(filePath, file, { cacheControl: '3600', upsert: false })

        if (uploadError) {
          throw new Error(uploadError.message)
        }

        const { data: urlData } = supabase.storage.from('properties').getPublicUrl(filePath)
        newImageUrls.push(urlData.publicUrl)
      }

      setPendingImagePreviews([])
      setForm(prev => ({ ...prev, images: [...prev.images, ...newImageUrls] }))
    } catch (err) {
      console.error('Error uploading images:', err)
      alert('Image storage isn\'t connected yet. Paste an image URL below instead, or connect Supabase Storage to enable direct upload.')
      setPendingImagePreviews([])
    } finally {
      setUploading(false)
      e.target.value = ''
    }
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

  const handleSubmit = async (e: React.FormEvent, publishNow = false) => {
    e.preventDefault();
    if (!form.title || !form.district || !form.price) {
      setActiveTab('basic');
      alert('Title, District, and Price are required.');
      return;
    }

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
    }
  };

  if (!ready) return null;

  const inputCls = "w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500";
  const labelCls = "block text-xs font-medium text-neutral-500 mb-1";

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => navigate('/admin/properties')} className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500 flex-shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg font-display font-bold text-navy-900 tracking-wide truncate">
                {isEdit ? 'Edit Property' : 'Add New Property'}
              </h1>
              <p className="text-[11px] text-neutral-400 font-mono">{propertyCode}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={(e) => handleSubmit(e as any, false)}
              className="flex items-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 text-navy-900 font-semibold px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all">
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">Save Draft</span>
            </button>
            <button onClick={(e) => handleSubmit(e as any, true)}
              className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-all hover:shadow-lg hover:shadow-brand-500/25">
              <span>{isEdit ? 'Save & Publish' : 'Publish'}</span>
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 pb-3">
            {TABS.map(tab => (
              <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id ? 'bg-navy-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ── BASIC & LOCATION ── */}
        {activeTab === 'basic' && (
          <>
            <section className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
              <h2 className="text-sm font-semibold text-navy-900 uppercase tracking-wider mb-4">Basic Info</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={labelCls}>Title *</label>
                  <input value={form.title} onChange={e => update('title', e.target.value)} required
                    placeholder="e.g. 2.5 Acre Farmhouse Plot, Sakleshpur" className={inputCls} />
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
                  <label className={labelCls}>Status</label>
                  <select value={form.status} onChange={e => update('status', e.target.value as PropertyStatus)} className={inputCls}>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{PROPERTY_STATUS_LABELS[s]}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
                    <input type="checkbox" checked={!!form.isFeatured} onChange={e => update('isFeatured', e.target.checked)}
                      className="h-4 w-4 rounded accent-brand-500" />
                    Featured Property
                  </label>
                  <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
                    <input type="checkbox" checked={!!form.isUrgent} onChange={e => update('isUrgent', e.target.checked)}
                      className="h-4 w-4 rounded accent-brand-500" />
                    Urgent / Premium Listing
                  </label>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
              <h2 className="text-sm font-semibold text-navy-900 uppercase tracking-wider mb-1 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand-500" /> Location — Karnataka
              </h2>
              <p className="text-xs text-neutral-400 mb-4">District and Taluk drive location search & filtering across the site.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>District *</label>
                  <select value={form.district} onChange={e => update('district', e.target.value)} required
                    className={inputCls}>
                    <option value="">Select district</option>
                    {KARNATAKA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
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
          </>
        )}

        {/* ── PROPERTY DETAILS ── */}
        {activeTab === 'details' && (
          <>
            <section className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
              <h2 className="text-sm font-semibold text-navy-900 uppercase tracking-wider mb-4">Core Specs</h2>
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
                  <label className={labelCls}>Area (sqft)</label>
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
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
              <h2 className="text-sm font-semibold text-navy-900 uppercase tracking-wider mb-1">
                {PROPERTY_TYPE_LABELS[form.type]} — Type-Specific Details
              </h2>
              <p className="text-xs text-neutral-400 mb-4">Only fields relevant to this property type are shown.</p>
              {attrFields.length === 0 ? (
                <p className="text-sm text-neutral-400">No additional fields for this type.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {attrFields.map(f => {
                    const val = form.attributes?.[f.key];
                    if (f.input === 'boolean') {
                      return (
                        <label key={f.key} className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer pt-6">
                          <input type="checkbox" checked={!!val} onChange={e => updateAttr(f.key, e.target.checked)}
                            className="h-4 w-4 rounded accent-brand-500" />
                          {f.label}
                        </label>
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
              )}
            </section>
          </>
        )}

        {/* ── PRICE ── */}
        {activeTab === 'price' && (
          <section className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
            <h2 className="text-sm font-semibold text-navy-900 uppercase tracking-wider mb-4">Price &amp; Financials</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Asking Price (₹) *</label>
                <input type="number" value={form.price || ''} onChange={e => update('price', Number(e.target.value))} required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Price Type</label>
                <select value={form.priceType} onChange={e => update('priceType', e.target.value as PriceType)} className={inputCls}>
                  {PRICE_TYPE_OPTIONS.map(p => <option key={p} value={p}>{PRICE_TYPE_LABELS[p]}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer pt-6">
                <input type="checkbox" checked={!!form.negotiable} onChange={e => update('negotiable', e.target.checked)}
                  className="h-4 w-4 rounded accent-brand-500" />
                Negotiable
              </label>
              <div>
                <label className={labelCls}>Booking / Advance Amount (₹)</label>
                <input type="number" value={form.advanceAmount || ''} onChange={e => update('advanceAmount', Number(e.target.value))} className={inputCls} />
              </div>
              <div className="md:col-span-2" />
              <div className="md:col-span-3 pt-4 mt-2 border-t border-neutral-100">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-red-500 uppercase tracking-wider mb-3">
                  <Info className="h-3.5 w-3.5" /> Admin Only — never shown on the public website
                </div>
              </div>
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
          </section>
        )}

        {/* ── MEDIA ── */}
        {activeTab === 'media' && (
          <>
            <section className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
              <h2 className="text-sm font-semibold text-navy-900 uppercase tracking-wider mb-4">Images</h2>
              <div className="mb-4">
                <label className="flex items-center justify-center gap-2 px-4 py-3 bg-brand-50 border-2 border-dashed border-brand-200 rounded-xl text-brand-600 cursor-pointer hover:bg-brand-100 transition-colors">
                  <Upload className="h-5 w-5" />
                  <span className="font-semibold text-sm">{uploading ? 'Uploading...' : 'Upload Images'}</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={uploading} className="hidden" />
                </label>
                <p className="text-[11px] text-neutral-400 mt-1.5">Requires connected storage (Supabase) — until then, paste an image URL below.</p>
              </div>

              <div className="flex gap-2 mb-3">
                <input value={imageInput} onChange={e => setImageInput(e.target.value)} placeholder="Paste image URL"
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
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-brand-500"></div>
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
                <div className="text-center py-6 border border-dashed border-neutral-200 rounded-xl bg-neutral-50/50">
                  <Image className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
                  <p className="text-xs text-neutral-500">No images added yet.</p>
                </div>
              )}
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-navy-900 uppercase tracking-wider">Videos &amp; Walkthroughs</h2>
                <span className="text-xs font-semibold px-2.5 py-1 bg-brand-50 text-brand-700 rounded-full">
                  {(form.videos || []).length} {(form.videos || []).length === 1 ? 'Video' : 'Videos'}
                </span>
              </div>

              <div className="mb-4">
                <label className="flex items-center justify-center gap-2 px-4 py-3 bg-brand-50 border-2 border-dashed border-brand-200 rounded-xl text-brand-600 cursor-pointer hover:bg-brand-100 transition-colors">
                  <Video className="h-5 w-5" />
                  <span className="font-semibold text-sm">
                    {videoUploading ? `Uploading ${pendingVideoCount} video(s)...` : 'Upload Video Files'}
                  </span>
                  <input type="file" accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*" multiple
                    onChange={handleVideoUpload} disabled={videoUploading} className="hidden" />
                </label>
              </div>

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
                <div className="text-center py-6 border border-dashed border-neutral-200 rounded-xl bg-neutral-50/50">
                  <Video className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
                  <p className="text-xs text-neutral-500">No videos added yet.</p>
                </div>
              )}
            </section>
          </>
        )}

        {/* ── AMENITIES & HIGHLIGHTS ── */}
        {activeTab === 'amenities' && (
          <section className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-sm font-semibold text-navy-900 uppercase tracking-wider mb-3">Amenities</h2>
                <div className="flex gap-2 mb-3">
                  <input value={amenityInput} onChange={e => setAmenityInput(e.target.value)} placeholder="e.g. Swimming Pool"
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addToList('amenities', amenityInput); setAmenityInput(''); } }}
                    className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                  <button type="button" onClick={() => { addToList('amenities', amenityInput); setAmenityInput(''); }}
                    className="px-3 py-2 bg-brand-50 text-brand-500 rounded-lg text-sm font-semibold hover:bg-brand-100 transition-colors">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {form.amenities.map((a, i) => (
                    <span key={i} className="flex items-center gap-1 px-2.5 py-1 bg-neutral-100 text-neutral-700 text-xs font-medium rounded-full">
                      {a}
                      <button type="button" onClick={() => removeFromList('amenities', i)}><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-navy-900 uppercase tracking-wider mb-3">Highlights</h2>
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
              </div>
            </div>
          </section>
        )}

        {/* ── DESCRIPTION & SEO ── */}
        {activeTab === 'description' && (
          <section className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-navy-900 uppercase tracking-wider mb-1">Description</h2>
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
            <div className="pt-4 mt-2 border-t border-neutral-100">
              <h3 className="text-sm font-semibold text-navy-900 uppercase tracking-wider mb-3">SEO</h3>
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
            </div>
          </section>
        )}

        {/* ── LEGAL & SOURCE (ADMIN ONLY) ── */}
        {activeTab === 'legal' && (
          <>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-red-500 uppercase tracking-wider">
              <Info className="h-3.5 w-3.5" /> Admin Only — this entire tab is never shown on the public website
            </div>
            <section className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
              <h2 className="text-sm font-semibold text-navy-900 uppercase tracking-wider mb-4">Legal &amp; Documentation</h2>
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
              <div className="flex flex-wrap gap-4 mb-4 p-3.5 bg-neutral-50 rounded-xl border border-neutral-100">
                {(['titleDeed', 'saleDeed', 'rtc', 'mutation', 'khata', 'ec'] as const).map(doc => (
                  <label key={doc} className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
                    <input type="checkbox" checked={!!form.legal?.[doc]} onChange={e => updateLegal(doc, e.target.checked)}
                      className="h-4 w-4 rounded accent-brand-500" />
                    {doc.toUpperCase()}
                  </label>
                ))}
              </div>
              <div>
                <label className={labelCls}>Legal Notes</label>
                <textarea value={form.legal?.notes || ''} onChange={e => updateLegal('notes', e.target.value)} rows={2} className={`${inputCls} resize-none`} />
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
              <h2 className="text-sm font-semibold text-navy-900 uppercase tracking-wider mb-4">Owner / Source Information</h2>
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
          </>
        )}

        {/* ── REVIEWS ── */}
        {activeTab === 'reviews' && (
          <section className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
            <h2 className="text-sm font-semibold text-navy-900 uppercase tracking-wider mb-4">Reviews</h2>
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
        )}
      </form>
    </div>
  );
}
