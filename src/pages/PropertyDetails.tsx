import { useParams, Link, useNavigate } from 'react-router-dom';
import { usePropertyStore } from '../stores/propertyStore';
import ImageCarousel from '../components/ImageCarousel';
import ContactForm from '../components/ContactForm';
import PropertyCard from '../components/PropertyCard';
import { Bed, Bath, Maximize, MapPin, CheckCircle, ArrowLeft, Mail, Phone, Share2, MessageCircle, MessageSquareText, Building, Layers, Compass, Home, ChevronRight, Video, Play } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { getAmenityIcon } from '../lib/amenityIcons';
import { parseVideoUrl } from '../lib/videoUtils';
import { SEO } from '../components/SEO';
import type { BreadcrumbItem, PropertySchemaData } from '../components/SEO';
import ShareModal from '../components/ShareModal';
import EnquiryModal from '../components/EnquiryModal';

export default function PropertyDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { properties, fetchProperties, getPropertyById, loading } = usePropertyStore();
  
  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])
  
  const property = getPropertyById(id || '');
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  // Scroll reveal refs
  const headerRef = useScrollReveal({ direction: 'up', distance: 30, stagger: 0.1 });
  const specsRef = useScrollReveal({ direction: 'up', stagger: 0.06 });
  const highlightsRef = useScrollReveal({ direction: 'up', stagger: 0.05 });
  const descRef = useScrollReveal({ direction: 'up' });
  const amenitiesRef = useScrollReveal({ direction: 'up', stagger: 0.04 });
  const reviewsRef = useScrollReveal({ direction: 'up', stagger: 0.08 });
  const similarRef = useScrollReveal({ direction: 'up', stagger: 0.12 });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-sm text-neutral-500">Loading property...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🏠</div>
          <h2 className="text-2xl font-bold text-navy-800 mb-3">Property Not Found</h2>
          <Link to="/listings" className="text-brand-500 hover:text-brand-600 font-semibold">
            ← Back to Listings
          </Link>
        </div>
      </div>
    );
  }
  const formatPrice = (price: number, type: string) => {
    if (type === 'rent') return `₹${price.toLocaleString('en-IN')}`;
    if (type === 'lease') {
      if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
      return `₹${(price / 100000).toFixed(1)} L`;
    }
    if (type === 'commercial' && price < 1000000) return `₹${price.toLocaleString('en-IN')}`;
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    return `₹${(price / 100000).toFixed(2)} L`;
  };

  const getBadgeInfo = (type: string) => {
    switch (type) {
      case 'rent': return { label: 'For Rent', className: 'bg-brand-500' };
      case 'sale': return { label: 'For Sale', className: 'bg-gold-400' };
      case 'lease': return { label: 'For Lease', className: 'bg-indigo-600' };
      case 'commercial': return { label: 'Commercial', className: 'bg-emerald-600' };
      case 'plot': return { label: 'Plot for Sale', className: 'bg-amber-600' };
      case 'farmhouse': return { label: 'Farmhouse Plot', className: 'bg-lime-600' };
      case 'land': return { label: 'Land', className: 'bg-orange-600' };
      default: return { label: type, className: 'bg-navy-900' };
    }
  };

  const isLandType = property.type === 'plot' || property.type === 'farmhouse' || property.type === 'land';

  // Calculate average rating
  const averageRating = property.reviews.length > 0 
    ? (property.reviews.reduce((sum, r) => sum + r.rating, 0) / property.reviews.length).toFixed(1)
    : "0";

  const similarProperties = (() => {
    const sameArea = properties.filter(p => p.id !== property.id && p.areaName === property.areaName);
    if (sameArea.length >= 3) return sameArea.slice(0, 3);
    const sameType = properties.filter(p => p.id !== property.id && p.type === property.type && p.areaName !== property.areaName);
    return [...sameArea, ...sameType].slice(0, 3);
  })();

  const specs = [
    ...(isLandType
      ? []
      : [
          { icon: Bed, label: 'Bedrooms', value: property.bedrooms > 0 ? property.bedrooms : 'Commercial' },
          { icon: Bath, label: 'Bathrooms', value: property.bathrooms },
        ]),
    { icon: Maximize, label: 'Area', value: `${property.area} sqft` },
    ...(property.floor ? [{ icon: Layers, label: 'Floor', value: property.floor }] : []),
    ...(isLandType
      ? []
      : [{ icon: Building, label: 'Furnished', value: property.furnished === 'fully' ? 'Fully' : property.furnished === 'semi' ? 'Semi' : 'No' }]),
    ...(property.facing ? [{ icon: Compass, label: 'Facing', value: property.facing }] : []),
  ];

  // ─── SEO Data ─────────────────────────────
  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Home', url: '/' },
    { name: 'Properties', url: '/listings' },
    { name: property.title, url: `/listings/${property.id}` },
  ];

  const propertySchemaData: PropertySchemaData = {
    name: property.title,
    description: property.description,
    price: property.price,
    type: property.type,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    area: property.area,
    location: property.location,
    areaName: property.areaName,
    images: property.images,
    amenities: property.amenities,
    furnished: property.furnished === 'fully' ? 'Fully Furnished' : property.furnished === 'semi' ? 'Semi Furnished' : 'Unfurnished',
    availability: property.availability,
    deposit: property.deposit,
    floor: property.floor,
    facing: property.facing,
    reviews: property.reviews.map(r => ({
      name: r.name,
      rating: r.rating,
      text: r.text,
      date: r.date,
    })),
  };

  const badgeInfo = getBadgeInfo(property.type);

  // Build a rich, unique meta description for this property
  const metaDescription = `${property.title} in ${property.location}. ${badgeInfo.label} at ${formatPrice(property.price, property.type)}${property.type === 'rent' ? '/month' : ''}. ${property.bedrooms > 0 ? `${property.bedrooms} bedrooms, ` : ''}${property.bathrooms} bathrooms, ${property.area} sqft. ${property.furnished === 'fully' ? 'Fully furnished.' : property.furnished === 'semi' ? 'Semi-furnished.' : ''} ${property.availability === 'Immediate' || property.availability === 'Ready to Move' ? 'Ready to move in.' : `Possession: ${property.availability}.`} Contact The Property Agent: +91 90194 88368.`;

  return (
    <div className="min-h-screen bg-neutral-50 pb-24 lg:pb-8">
      <SEO
        title={`${property.title} — ${property.areaName}, Karnataka`}
        description={metaDescription}
        keywords={`${property.title}, ${property.areaName} ${property.type}, ${property.bedrooms > 0 ? `${property.bedrooms}BHK ` : ''}${property.areaName}, ${property.location}, properties ${badgeInfo.label.toLowerCase()} ${property.areaName} Karnataka, ${property.furnished === 'fully' ? 'furnished apartments' : 'apartments'} ${property.areaName}, The Property Agent ${property.areaName}, real estate ${property.areaName} Karnataka`}
        type="product"
        image={property.images[0]}
        canonicalPath={`/listings/${property.id}`}
        location={property.location}
        geoRegion="IN-KA"
        geoPosition="12.9716;77.5946"
        breadcrumbs={breadcrumbs}
        propertyData={propertySchemaData}
      />

      {/* Hero / Details container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex items-center space-x-1 text-sm text-neutral-500" itemScope itemType="https://schema.org/BreadcrumbList">
            <li className="flex items-center" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link to="/" className="hover:text-brand-500 transition-colors flex items-center" itemProp="item">
                <Home className="h-4 w-4 mr-1" aria-hidden="true" />
                <span itemProp="name">Home</span>
              </Link>
              <meta itemProp="position" content="1" />
            </li>
            <ChevronRight className="h-3 w-3 text-neutral-400 mx-1" aria-hidden="true" />
            <li className="flex items-center" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link to="/listings" className="hover:text-brand-500 transition-colors" itemProp="item">
                <span itemProp="name">Properties</span>
              </Link>
              <meta itemProp="position" content="2" />
            </li>
            <ChevronRight className="h-3 w-3 text-neutral-400 mx-1" aria-hidden="true" />
            <li className="flex items-center" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <span className="text-navy-900 font-medium truncate max-w-[200px]" itemProp="name">{property.title}</span>
              <meta itemProp="position" content="3" />
            </li>
          </ol>
        </nav>

        {/* Back + Actions */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-neutral-600 hover:text-navy-900 transition-colors text-sm font-medium"
            aria-label="Go back to previous page"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Back</span>
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsShareOpen(true)}
              className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-brand-500 transition-colors"
              aria-label="Share property"
              title="Share property"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Photo Gallery */}
        <ImageCarousel images={property.images} title={property.title} />

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mt-6 sm:mt-8">
          {/* Main Content */}
          <article className="lg:col-span-2 space-y-4 sm:space-y-6" itemScope itemType="https://schema.org/Residence">
            {/* Header */}
            <div ref={headerRef} className="bg-white rounded-2xl shadow-card p-4 sm:p-6 lg:p-8">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${badgeInfo.className}`}>
                  {badgeInfo.label}
                </span>
                {property.furnished === 'fully' && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">Fully Furnished</span>
                )}
                {(property.availability === 'Immediate' || property.availability === 'Ready to Move') && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">Ready to Move</span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-navy-900 mb-2 tracking-wide" itemProp="name">{property.title}</h1>
              <div className="flex items-center text-neutral-500 mb-4" itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                <MapPin className="h-4 w-4 mr-1.5 text-brand-500" aria-hidden="true" />
                <span className="text-sm" itemProp="addressLocality">{property.location}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-neutral-100">
                <div>
                  <span className="text-2xl sm:text-3xl font-bold text-navy-900" itemProp="price">
                    {formatPrice(property.price, property.type)}
                  </span>
                  {property.type === 'rent' && <span className="text-neutral-500 text-sm ml-1">/month</span>}
                  {property.type === 'lease' && <span className="text-indigo-600 text-sm font-semibold ml-1.5">(Full Lease)</span>}
                  {property.type === 'commercial' && property.price < 1000000 && <span className="text-neutral-500 text-sm ml-1">/month</span>}
                </div>
                {property.deposit && property.deposit !== 'N/A' && (
                  <div className="text-sm text-neutral-500">
                    Deposit: <span className="font-semibold text-navy-800">{property.deposit}</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsEnquiryOpen(true)}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm sm:text-base transition-all active:scale-[0.98] shadow-sm hover:shadow-lg hover:shadow-brand-500/25"
              >
                <MessageSquareText className="h-5 w-5" />
                <span>Enquire Now</span>
              </button>
            </div>

            {/* Key Specs */}
            <div className="bg-white rounded-2xl shadow-card p-4 sm:p-6 lg:p-8">
              <h2 className="text-base sm:text-lg font-display font-bold text-navy-900 mb-4 sm:mb-5 tracking-wide">Property Details</h2>
              <div ref={specsRef} className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {specs.map((spec) => (
                  <div key={spec.label} className="flex items-center space-x-3 p-2.5 sm:p-3 bg-neutral-50 rounded-xl">
                    <spec.icon className="h-5 w-5 text-brand-500 flex-shrink-0" aria-hidden="true" />
                    <div>
                      <div className="text-xs text-neutral-500">{spec.label}</div>
                      <div className="text-sm font-semibold text-navy-900">{spec.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Highlights */}
            {property.highlights.length > 0 && (
              <div className="bg-white rounded-2xl shadow-card p-6 lg:p-8">
                <h2 className="text-lg font-display font-bold text-navy-900 mb-4 tracking-wide">Highlights</h2>
                <div ref={highlightsRef} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {property.highlights.map((h, i) => (
                    <div key={i} className="flex items-start space-x-2.5">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="text-sm text-neutral-700">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video Walkthrough Section */}
            {property.videos && property.videos.length > 0 && (
              <div className="bg-white rounded-2xl shadow-card p-4 sm:p-6 lg:p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                      <Video className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-display font-bold text-navy-900 tracking-wide">
                        Property Video Tour
                      </h2>
                      <p className="text-xs text-neutral-500">Virtual walkthrough & property video</p>
                    </div>
                  </div>
                  {property.videos.length > 1 && (
                    <span className="text-xs font-semibold px-2.5 py-1 bg-neutral-100 text-neutral-700 rounded-full">
                      {activeVideoIndex + 1} of {property.videos.length} Videos
                    </span>
                  )}
                </div>

                {/* Main Video Player */}
                {(() => {
                  const currentVideoUrl = property.videos[activeVideoIndex] || property.videos[0];
                  const parsed = parseVideoUrl(currentVideoUrl);
                  return (
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-md border border-neutral-200/80">
                      {parsed.type === 'youtube' || parsed.type === 'vimeo' ? (
                        <iframe
                          src={parsed.embedUrl}
                          title={`${property.title} - Video Tour`}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
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
                  );
                })()}

                {/* Multiple Videos Selector Strip */}
                {property.videos.length > 1 && (
                  <div className="flex items-center gap-2.5 mt-4 overflow-x-auto pb-1">
                    {property.videos.map((vid, idx) => {
                      const parsed = parseVideoUrl(vid);
                      const isCurrent = idx === activeVideoIndex;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveVideoIndex(idx)}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                            isCurrent
                              ? 'bg-brand-50 border-brand-500 text-brand-700 ring-2 ring-brand-500/20'
                              : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                          }`}
                        >
                          <Play className={`h-3.5 w-3.5 ${isCurrent ? 'text-brand-600' : 'text-neutral-400'}`} />
                          <span>Video {idx + 1}</span>
                          <span className="text-[10px] uppercase font-bold text-neutral-400">({parsed.type})</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div ref={descRef} className="bg-white rounded-2xl shadow-card p-6 lg:p-8">
              <h2 className="text-lg font-display font-bold text-navy-900 mb-4 tracking-wide">About This Property</h2>
              <p className="text-neutral-600 text-sm leading-relaxed" itemProp="description">{property.description}</p>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-2xl shadow-card p-6 lg:p-8">
              <h2 className="text-lg font-display font-bold text-navy-900 mb-5 tracking-wide">Amenities</h2>
              <div ref={amenitiesRef} className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.amenities.map((amenity, index) => {
                  const AmenityIcon = getAmenityIcon(amenity);
                  return (
                    <div key={index} className="flex flex-col items-center justify-center text-sm text-neutral-700 p-3 rounded-xl bg-neutral-50 hover:bg-brand-50/50 transition-colors text-center">
                      <AmenityIcon className="h-5 w-5 text-brand-500 mb-1.5" aria-hidden="true" />
                      <span>{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Location Map */}
            {property.mapQuery && (
              <div className="bg-white rounded-2xl shadow-card p-6 lg:p-8">
                <h2 className="text-lg font-display font-bold text-navy-900 mb-5 tracking-wide">Location</h2>
                <div className="rounded-xl overflow-hidden border border-neutral-100" style={{ height: 300 }}>
                  <iframe
                    title={`Map showing location of ${property.title} in ${property.areaName}, Karnataka`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(property.mapQuery)}&output=embed`}
                    aria-label={`Google Maps view of ${property.title} location`}
                  />
                </div>
              </div>
            )}

            {/* Reviews Section */}
            {property.reviews.length > 0 && (
              <div className="bg-white rounded-2xl shadow-card p-6 lg:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-display font-bold text-navy-900 tracking-wide">Customer Reviews</h2>
                  <div className="flex items-center gap-2">
                    <div className="text-yellow-500 text-lg" aria-hidden="true">★</div>
                    <span className="text-xl font-bold text-navy-900">{averageRating}</span>
                    <span className="text-sm text-neutral-500">({property.reviews.length} reviews)</span>
                  </div>
                </div>
                <div ref={reviewsRef} className="space-y-6">
                  {property.reviews.map((review) => (
                    <div key={review.id} className="border-b border-neutral-100 pb-6 last:border-b-0 last:pb-0">
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-semibold text-navy-900">{review.name}</h3>
                          <span className="text-xs text-neutral-500">{review.date}</span>
                        </div>
                        <div className="flex items-center gap-1 mb-2" aria-label={`Rating: ${review.rating} out of 5 stars`}>
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className={`text-sm ${i < review.rating ? 'text-yellow-500' : 'text-neutral-300'}`} aria-hidden="true">★</div>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-neutral-700 leading-relaxed">{review.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6" aria-label="Contact and inquiry">
            <div className="lg:sticky lg:top-24">
              <ContactForm propertyTitle={property.title} contactEmail={property.contactEmail} propertyId={property.id} />

              <div className="bg-white rounded-2xl shadow-card p-6 mt-6">
                <h3 className="text-lg font-display font-bold text-navy-900 mb-4 tracking-wide">Contact Directly</h3>
                <div className="space-y-4">
                  <a href={`mailto:${property.contactEmail}`}
                    className="flex items-center space-x-3 p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors"
                    aria-label={`Email The Property Agent at ${property.contactEmail}`}
                  >
                    <Mail className="h-5 w-5 text-brand-500" aria-hidden="true" />
                    <div>
                      <div className="text-xs text-neutral-500">Email</div>
                      <div className="text-sm font-medium text-navy-800">{property.contactEmail}</div>
                    </div>
                  </a>
                  <a href="tel:+919019488368"
                    className="flex items-center space-x-3 p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors"
                    aria-label="Call The Property Agent at +91 90194 88368"
                  >
                    <Phone className="h-5 w-5 text-brand-500" aria-hidden="true" />
                    <div>
                      <div className="text-xs text-neutral-500">Phone</div>
                      <div className="text-sm font-medium text-navy-800">+91 90194 88368</div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Similar Properties */}
        {similarProperties.length > 0 && (
          <section className="mt-16 mb-8" aria-label="Similar properties you may like">
            <h2 className="text-2xl font-display font-bold text-navy-900 mb-6">Similar Properties in {property.areaName}</h2>
            <div ref={similarRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {similarProperties.map(p => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        property={property}
      />

      {/* Enquiry Modal */}
      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        property={property}
      />

      {/* Mobile Sticky CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 p-3 flex items-center gap-2 lg:hidden shadow-xl">
        <a
          href="tel:+919019488368"
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-navy-900 text-white font-semibold text-xs sm:text-sm hover:bg-navy-950 transition-all active:scale-[0.98] shadow-sm"
        >
          <Phone className="h-4 w-4 text-brand-400" />
          <span>Call Now</span>
        </a>
        <a
          href={`https://wa.me/919945011138?text=${encodeURIComponent(
            `Hi The Property Agent, I am interested in "${property.title}" in ${property.location}. Please share more details.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-xs sm:text-sm transition-all active:scale-[0.98] shadow-sm"
        >
          <MessageCircle className="h-4 w-4 fill-current" />
          <span>WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
