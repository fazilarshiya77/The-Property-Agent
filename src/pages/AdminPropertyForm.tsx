import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, X, Save, Image, Upload, Star, Video, Play } from 'lucide-react';
import { usePropertyStore, isAdminAuthenticated } from '../stores/propertyStore';
import type { Property, Review } from '../data/properties';
import { supabase } from '../lib/supabase';
import { parseVideoUrl } from '../lib/videoUtils';

const FURNISHED_OPTIONS = ['fully', 'semi', 'unfurnished'] as const;
const TYPE_OPTIONS = ['rent', 'sale', 'lease', 'commercial'] as const;

const emptyForm: Omit<Property, 'id'> = {
  title: '', location: '', areaName: '', price: 0, type: 'rent',
  bedrooms: 2, bathrooms: 2, area: 0, furnished: 'semi', deposit: '',
  availability: 'Immediate', amenities: [], highlights: [], images: [],
  videos: [],
  description: '', contactEmail: 'trishnaproperties78@gmail.com', mapQuery: '',
  reviews: [],
};

export default function AdminPropertyForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { properties, addProperty, updateProperty } = usePropertyStore();

  const [form, setForm] = useState<Omit<Property, 'id'>>(emptyForm);
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
    if (!isAdminAuthenticated()) { navigate('/admin'); return; }
    if (isEdit && id) {
      const p = properties.find(p => p.id === id);
      if (p) {
        const { id: _id, ...rest } = p;
        setForm({
          ...rest,
          videos: rest.videos || []
        });
      } else navigate('/admin/dashboard');
    }
  }, [id, isEdit, navigate, properties]);

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const addToList = (key: 'amenities' | 'highlights' | 'images' | 'videos', value: string) => {
    if (!value.trim()) return;
    setForm(prev => ({ ...prev, [key]: [...(prev[key] || []), value.trim()] }));
  };

  const removeFromList = (key: 'amenities' | 'highlights' | 'images' | 'videos', index: number) => {
    setForm(prev => ({ ...prev, [key]: (prev[key] || []).filter((_, i) => i !== index) }));
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

    // Generate previews immediately for better UX
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
      console.log('Uploading images to Supabase Storage...')
      console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)

      for (const file of files) {
        console.log('Uploading file:', file.name)
        
        const fileExt = file.name.split('.').pop()
        const fileName = `${crypto.randomUUID()}.${fileExt}`
        const filePath = `images/${fileName}` // Add a prefix to organize images better

        // Upload to Supabase Storage
        const { error: uploadError, data } = await supabase.storage
          .from('properties')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) {
          console.error('Upload error details:', uploadError)
          throw new Error(`Upload failed for ${file.name}: ${uploadError.message}`)
        }

        console.log('Upload successful:', data)

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('properties')
          .getPublicUrl(filePath)

        newImageUrls.push(urlData.publicUrl)
      }

      // Clear previews and add actual images
      setPendingImagePreviews([])
      setForm(prev => ({
        ...prev,
        images: [...prev.images, ...newImageUrls]
      }))
      
      console.log('Successfully uploaded images:', newImageUrls)
    } catch (err) {
      console.error('Error uploading images:', err)
      alert('Ran into an issue, please try again later.')
      // Clear previews on error
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
      console.log('Uploading videos to Supabase Storage...')
      for (const file of files) {
        console.log('Uploading video:', file.name, file.size)
        const fileExt = file.name.split('.').pop() || 'mp4'
        const fileName = `${crypto.randomUUID()}.${fileExt}`
        const filePath = `videos/${fileName}`

        const { error: uploadError, data } = await supabase.storage
          .from('properties')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) {
          console.error('Video upload error:', uploadError)
          throw new Error(`Video upload failed: ${uploadError.message}`)
        }

        const { data: urlData } = supabase.storage
          .from('properties')
          .getPublicUrl(filePath)

        newVideoUrls.push(urlData.publicUrl)
      }

      setForm(prev => ({
        ...prev,
        videos: [...(prev.videos || []), ...newVideoUrls]
      }))
      console.log('Successfully uploaded videos:', newVideoUrls)
    } catch (err) {
      console.error('Error uploading video:', err)
      alert('Failed to upload video to Supabase. You can also paste a YouTube or Vimeo URL.')
    } finally {
      setVideoUploading(false)
      setPendingVideoCount(0)
      e.target.value = ''
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.location || !form.price) return;

    try {
      if (isEdit && id) {
        await updateProperty(id, form);
      } else {
        await addProperty(form);
      }
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Error submitting property:', err)
      alert('Ran into an issue, please try again later.')
    }
  };

  if (!isAdminAuthenticated()) return null;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin/dashboard')} className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-display font-bold text-navy-900 tracking-wide">
              {isEdit ? 'Edit Property' : 'Add New Property'}
            </h1>
          </div>
          <button onClick={handleSubmit}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-brand-500/25">
            <Save className="h-4 w-4" />
            <span>{isEdit ? 'Update' : 'Create'}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Basic Info */}
        <section className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
          <h2 className="text-sm font-semibold text-navy-900 uppercase tracking-wider mb-4">Basic Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-neutral-500 mb-1">Title *</label>
              <input value={form.title} onChange={e => update('title', e.target.value)} required
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Location *</label>
              <input value={form.location} onChange={e => update('location', e.target.value)} required
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Area Name</label>
              <input value={form.areaName} onChange={e => update('areaName', e.target.value)}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Map Query</label>
              <input value={form.mapQuery} onChange={e => update('mapQuery', e.target.value)} placeholder="e.g. Whitefield, Bangalore"
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Description</label>
              <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={3}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none" />
            </div>
          </div>
        </section>

        {/* Pricing & Specs */}
        <section className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
          <h2 className="text-sm font-semibold text-navy-900 uppercase tracking-wider mb-4">Pricing & Specs</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Price (₹) *</label>
              <input type="number" value={form.price || ''} onChange={e => update('price', Number(e.target.value))} required
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Type</label>
              <select value={form.type} onChange={e => update('type', e.target.value as typeof form.type)}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500">
                {TYPE_OPTIONS.map(t => (
                  <option key={t} value={t}>
                    {t === 'rent' ? 'For Rent' : t === 'sale' ? 'For Sale' : t === 'lease' ? 'For Lease' : 'Commercial Property'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Bedrooms</label>
              <input type="number" value={form.bedrooms} onChange={e => update('bedrooms', Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Bathrooms</label>
              <input type="number" value={form.bathrooms} onChange={e => update('bathrooms', Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Area (sqft)</label>
              <input type="number" value={form.area || ''} onChange={e => update('area', Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Furnished</label>
              <select value={form.furnished} onChange={e => update('furnished', e.target.value as typeof form.furnished)}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500">
                {FURNISHED_OPTIONS.map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Deposit</label>
              <input value={form.deposit} onChange={e => update('deposit', e.target.value)} placeholder="e.g. 2 Lakhs"
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Availability</label>
              <input value={form.availability} onChange={e => update('availability', e.target.value)}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
            </div>
          </div>
        </section>

        {/* Images */}
        <section className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
          <h2 className="text-sm font-semibold text-navy-900 uppercase tracking-wider mb-4">Images</h2>
          
          {/* Upload Button */}
          <div className="mb-4">
            <label className="flex items-center justify-center gap-2 px-4 py-3 bg-brand-50 border-2 border-dashed border-brand-200 rounded-xl text-brand-600 cursor-pointer hover:bg-brand-100 transition-colors">
              <Upload className="h-5 w-5" />
              <span className="font-semibold text-sm">
                {uploading ? 'Uploading...' : 'Upload Images'}
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex gap-2 mb-3">
            <input value={imageInput} onChange={e => setImageInput(e.target.value)} placeholder="Or paste image URL (e.g. /properties/folder/image.jpg)"
              className="flex-1 px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
            <button type="button" onClick={() => { addToList('images', imageInput); setImageInput(''); }}
              className="px-4 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 transition-colors">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {pendingImagePreviews.map((preview, i) => (
              <div key={`preview-${i}`} className="relative w-32 h-32 rounded-xl overflow-hidden bg-neutral-100 border border-brand-200 shadow-sm">
                <img 
                  src={preview} 
                  alt={`Uploading ${i + 1}`} 
                  className="w-full h-full object-cover opacity-75" 
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-brand-500"></div>
                </div>
              </div>
            ))}
            {form.images.map((img, i) => (
              <div key={i} className="relative group w-32 h-32 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 shadow-sm">
                <img 
                  src={img} 
                  alt={`Property image ${i + 1}`} 
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-300" 
                  onError={(e) => { 
                    // Hide the broken image and show the fallback
                    (e.target as HTMLImageElement).style.display = 'none';
                    // Find and show the fallback div
                    const parent = (e.target as HTMLImageElement).parentElement;
                    const fallback = parent?.querySelector('.image-fallback');
                    if (fallback) {
                      (fallback as HTMLElement).style.display = 'flex';
                    }
                  }}
                />
                <div className="image-fallback absolute inset-0 flex items-center justify-center bg-neutral-100 hidden">
                  <Image className="h-8 w-8 text-neutral-300" />
                </div>
                <button 
                  type="button" 
                  onClick={() => removeFromList('images', i)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110 shadow-md"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Videos Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-navy-900 uppercase tracking-wider">Property Videos & Walkthroughs</h2>
              <p className="text-xs text-neutral-500 mt-0.5">Upload property video files (.mp4, .webm, .mov) directly to Supabase storage or paste YouTube/Vimeo links</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-brand-50 text-brand-700 rounded-full">
              {(form.videos || []).length} {(form.videos || []).length === 1 ? 'Video' : 'Videos'}
            </span>
          </div>
          
          {/* Upload Button */}
          <div className="mb-4">
            <label className="flex items-center justify-center gap-2 px-4 py-3 bg-brand-50 border-2 border-dashed border-brand-200 rounded-xl text-brand-600 cursor-pointer hover:bg-brand-100 transition-colors">
              <Video className="h-5 w-5" />
              <span className="font-semibold text-sm">
                {videoUploading ? `Uploading ${pendingVideoCount} video(s) to Supabase...` : 'Upload Video Files (.mp4, .webm, .mov)'}
              </span>
              <input
                type="file"
                accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*"
                multiple
                onChange={handleVideoUpload}
                disabled={videoUploading}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex gap-2 mb-4">
            <input
              value={videoInput}
              onChange={e => setVideoInput(e.target.value)}
              placeholder="Or paste YouTube, Vimeo, or Video URL (e.g. https://youtu.be/...)"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addToList('videos', videoInput);
                  setVideoInput('');
                }
              }}
              className="flex-1 px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
            <button
              type="button"
              onClick={() => { addToList('videos', videoInput); setVideoInput(''); }}
              className="px-4 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 transition-colors flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Add</span>
            </button>
          </div>

          {/* Videos Grid */}
          {(form.videos || []).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(form.videos || []).map((videoUrl, i) => {
                const parsed = parseVideoUrl(videoUrl);
                return (
                  <div key={i} className="relative bg-neutral-900 rounded-xl overflow-hidden border border-neutral-200 shadow-sm group">
                    <div className="aspect-video w-full bg-black flex items-center justify-center">
                      {parsed.type === 'youtube' || parsed.type === 'vimeo' ? (
                        <iframe
                          src={parsed.embedUrl}
                          title={`Property Video ${i + 1}`}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          src={parsed.embedUrl}
                          controls
                          className="w-full h-full object-contain"
                          preload="metadata"
                        />
                      )}
                    </div>
                    
                    <div className="p-3 bg-white flex items-center justify-between border-t border-neutral-100">
                      <div className="flex items-center space-x-2 truncate">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-brand-50 text-brand-700">
                          {parsed.type}
                        </span>
                        <span className="text-xs text-neutral-600 truncate max-w-[200px]">
                          {videoUrl}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromList('videos', i)}
                        className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                        title="Remove Video"
                      >
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
              <p className="text-xs text-neutral-500">No videos added yet. Upload a video walkthrough or paste a YouTube/Vimeo link.</p>
            </div>
          )}
        </section>

        {/* Amenities & Highlights */}
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
                <input value={highlightInput} onChange={e => setHighlightInput(e.target.value)} placeholder="e.g. Near metro station"
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

        {/* Reviews */}
        <section className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
          <h2 className="text-sm font-semibold text-navy-900 uppercase tracking-wider mb-4">Reviews</h2>
          
          {/* Add New Review Form */}
          <div className="mb-6 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
            <h3 className="text-xs font-semibold text-neutral-700 uppercase tracking-wide mb-3">Add New Review</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Reviewer Name</label>
                <input value={newReviewName} onChange={e => setNewReviewName(e.target.value)} placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Rating</label>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(star => (
                    <button key={star} type="button" onClick={() => setNewReviewRating(star)}
                      className="p-1.5 rounded-lg transition-all">
                      <Star className={`h-5 w-5 ${star <= newReviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-xs font-medium text-neutral-500 mb-1">Review Text</label>
              <textarea value={newReviewText} onChange={e => setNewReviewText(e.target.value)} placeholder="Write a review..." rows={3}
                className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none" />
            </div>
            <button type="button" onClick={addReview}
              className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-semibold hover:bg-brand-600 transition-colors">
              <Plus className="h-4 w-4" />
              Add Review
            </button>
          </div>

          {/* Existing Reviews */}
          {form.reviews.length > 0 ? (
            <div className="space-y-4">
              {form.reviews.map((review, i) => (
                <div key={review.id} className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-navy-900">{review.name}</h4>
                      <div className="flex items-center gap-1 mb-1">
                        {[1,2,3,4,5].map(star => (
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
      </form>
    </div>
  );
}
