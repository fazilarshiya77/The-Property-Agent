import React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

// ─── CONSTANTS ──────────────────────────────────────────
const SITE_URL = 'https://www.trishnapropertymanagement.in';
const SITE_NAME = 'EHT Trishna Property Management';
const DEFAULT_OG_IMAGE = `${SITE_URL}/logo.jpeg`;
const PHONE = '+91 98861 04532';
const EMAIL = 'trishnaproperties78@gmail.com';
const ADDRESS = '31, GM Palya Main Rd, KG Colony, GM Palya, C V Raman Nagar, Bengaluru, Karnataka 560075';

// ─── TYPES ──────────────────────────────────────────────
interface BreadcrumbItem {
  name: string;
  url: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface PropertySchemaData {
  name: string;
  description: string;
  price: number;
  priceCurrency?: string;
  type: 'rent' | 'sale';
  bedrooms: number;
  bathrooms: number;
  area: number;
  location: string;
  areaName: string;
  images: string[];
  amenities: string[];
  furnished: string;
  availability: string;
  deposit?: string;
  floor?: string;
  facing?: string;
  reviews?: Array<{
    name: string;
    rating: number;
    text: string;
    date: string;
  }>;
}

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  location?: string;
  geoRegion?: string;
  geoPosition?: string;
  // Enhanced props
  canonicalPath?: string;
  breadcrumbs?: BreadcrumbItem[];
  faqData?: FAQItem[];
  propertyData?: PropertySchemaData;
  noIndex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
}

// ─── DEFAULT VALUES ─────────────────────────────────────
const defaultProps: Required<Pick<SEOProps, 'description' | 'keywords' | 'image' | 'type' | 'location' | 'geoRegion' | 'geoPosition'>> = {
  description: 'EHT Trishna Property Management is Bangalore\'s trusted real estate partner offering premium verified rental homes and properties for sale in Murgeshpalya, CV Raman Nagar, GM Palya, Bommasandra, Yelahanka, Whitefield, and Sarjapur Road. 50+ verified listings, 200+ happy families.',
  keywords: 'EHT Trishna Property Management, Trishna Properties, Prishna Properties, Bangalore real estate, properties for rent Bangalore, houses for sale Bangalore, 2BHK Murgeshpalya, 3BHK CV Raman Nagar, apartments GM Palya, Brigade Valencia, Godrej Lakeside, Mahindra Blossom, verified properties Bangalore, premium rentals Bangalore, East Bangalore properties, rental homes near IT parks',
  image: DEFAULT_OG_IMAGE,
  type: 'website',
  location: 'Bangalore, Karnataka, India',
  geoRegion: 'IN-KA',
  geoPosition: '12.9716;77.5946',
};

// ─── SCHEMA GENERATORS ─────────────────────────────────

/** WebSite schema with SearchAction for sitelinks search box */
function generateWebSiteSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    alternateName: ['Trishna Properties', 'Prishna Properties', 'Trishna Properties Bangalore'],
    url: SITE_URL,
    description: defaultProps.description,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/listings?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/** RealEstateAgent + LocalBusiness combined schema */
function generateBusinessSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': ['RealEstateAgent', 'LocalBusiness'],
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: 'Prishna Properties',
    description: 'EHT Trishna Property Management is a premium real estate agency in Bangalore specializing in verified rental homes and properties for sale. We cover Murgeshpalya, CV Raman Nagar, GM Palya, Bommasandra, Yelahanka, Whitefield, Sarjapur Road, Bannerghatta Road, and more.',
    url: SITE_URL,
    logo: DEFAULT_OG_IMAGE,
    image: DEFAULT_OG_IMAGE,
    telephone: PHONE,
    email: EMAIL,
    priceRange: '₹35,000 - ₹3.2 Cr',
    currenciesAccepted: 'INR',
    paymentAccepted: 'Cash, Bank Transfer, UPI',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '31, GM Palya Main Rd, KG Colony, GM Palya',
      addressLocality: 'Bengaluru',
      addressRegion: 'Karnataka',
      postalCode: '560075',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '12.9716',
      longitude: '77.5946',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '19:00',
      },
    ],
    areaServed: [
      { '@type': 'City', name: 'Bangalore', sameAs: 'https://en.wikipedia.org/wiki/Bangalore' },
      { '@type': 'Place', name: 'Murgeshpalya' },
      { '@type': 'Place', name: 'CV Raman Nagar' },
      { '@type': 'Place', name: 'GM Palya' },
      { '@type': 'Place', name: 'Bommasandra' },
      { '@type': 'Place', name: 'Yelahanka' },
      { '@type': 'Place', name: 'Kaggadasapura' },
      { '@type': 'Place', name: 'Sarjapur Road' },
      { '@type': 'Place', name: 'Bannerghatta Road' },
      { '@type': 'Place', name: 'Whitefield' },
      { '@type': 'Place', name: 'Singasandra' },
      { '@type': 'Place', name: 'Devinagar' },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Properties in Bangalore',
      itemListElement: [
        { '@type': 'OfferCatalog', name: 'Properties for Rent' },
        { '@type': 'OfferCatalog', name: 'Properties for Sale' },
      ],
    },
    sameAs: [
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}`,
    ],
    founder: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '200',
      bestRating: '5',
      worstRating: '1',
    },
  };
}

/** BreadcrumbList schema */
function generateBreadcrumbSchema(items: BreadcrumbItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

/** FAQPage schema for AEO */
function generateFAQSchema(faqs: FAQItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/** RealEstateListing schema for property detail pages */
function generatePropertySchema(property: PropertySchemaData): object {
  const isRent = property.type === 'rent';
  
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.name,
    description: property.description,
    url: `${SITE_URL}/listings/${encodeURIComponent(property.name)}`,
    image: property.images.map(img => img.startsWith('http') ? img : `${SITE_URL}${img}`),
    datePosted: new Date().toISOString().split('T')[0],
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: 'INR',
      availability: property.availability === 'Immediate' || property.availability === 'Ready to Move'
        ? 'https://schema.org/InStock'
        : 'https://schema.org/PreOrder',
      priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      ...(isRent ? { priceSpecification: { '@type': 'UnitPriceSpecification', price: property.price, priceCurrency: 'INR', unitText: 'MONTH' } } : {}),
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: property.areaName,
      addressRegion: 'Karnataka',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '12.9716',
      longitude: '77.5946',
    },
    floorSize: {
      '@type': 'QuantitativeValue',
      value: property.area,
      unitCode: 'FTK',
      unitText: 'sqft',
    },
    numberOfRooms: property.bedrooms,
    numberOfBathroomsTotal: property.bathrooms,
    amenityFeature: property.amenities.map(a => ({
      '@type': 'LocationFeatureSpecification',
      name: a,
      value: true,
    })),
  };

  // Add floor info
  if (property.floor) {
    schema.floorLevel = property.floor;
  }

  // Add facing direction
  if (property.facing) {
    schema.additionalProperty = [
      { '@type': 'PropertyValue', name: 'Facing', value: property.facing },
      { '@type': 'PropertyValue', name: 'Furnished', value: property.furnished },
    ];
  }

  // Add aggregate rating from reviews
  if (property.reviews && property.reviews.length > 0) {
    const avgRating = property.reviews.reduce((sum, r) => sum + r.rating, 0) / property.reviews.length;
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: avgRating.toFixed(1),
      reviewCount: property.reviews.length.toString(),
      bestRating: '5',
      worstRating: '1',
    };
    schema.review = property.reviews.slice(0, 3).map(r => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.name },
      reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 },
      reviewBody: r.text,
      datePublished: r.date,
    }));
  }

  return schema;
}

/** ItemList schema for listings page */
function generateItemListSchema(title: string, description: string): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: title,
    description: description,
    url: `${SITE_URL}/listings`,
    numberOfItems: 17,
    itemListOrder: 'https://schema.org/ItemListUnordered',
  };
}

// ─── SEO COMPONENT ──────────────────────────────────────
export const SEO: React.FC<SEOProps> = (props) => {
  const location = useLocation();
  
  const {
    title,
    description = defaultProps.description,
    keywords = defaultProps.keywords,
    image = defaultProps.image,
    type = defaultProps.type,
    geoRegion = defaultProps.geoRegion,
    geoPosition = defaultProps.geoPosition,
    canonicalPath,
    breadcrumbs,
    faqData,
    propertyData,
    noIndex = false,
  } = props;

  // Build the full page title
  const pageTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} — Premium Rental Homes & Properties for Sale in Bangalore`;

  // Build canonical URL
  const canonical = canonicalPath
    ? `${SITE_URL}${canonicalPath}`
    : `${SITE_URL}${location.pathname}`;

  // Build absolute image URL
  const absoluteImage = image?.startsWith('http') ? image : `${SITE_URL}${image}`;

  // Determine if this is the home page
  const isHomePage = location.pathname === '/';

  return (
    <Helmet>
      {/* ─── Primary Meta Tags ─── */}
      <html lang="en" />
      <title>{pageTitle}</title>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* ─── Canonical & Alternate ─── */}
      <link rel="canonical" href={canonical} />
      <link rel="alternate" hrefLang="en-IN" href={canonical} />
      <link rel="alternate" hrefLang="en" href={canonical} />
      <link rel="alternate" hrefLang="x-default" href={canonical} />

      {/* ─── Robots ─── */}
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'} />
      <meta name="googlebot" content={noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'} />
      <meta name="bingbot" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />

      {/* ─── Open Graph / Facebook ─── */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={pageTitle} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />

      {/* ─── Twitter Card ─── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonical} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImage} />
      <meta name="twitter:image:alt" content={pageTitle} />

      {/* ─── Geo Tags (GEO/Local SEO) ─── */}
      <meta name="geo.region" content={geoRegion} />
      <meta name="geo.placename" content={props.location || defaultProps.location} />
      <meta name="geo.position" content={geoPosition} />
      <meta name="ICBM" content={geoPosition?.replace(';', ', ')} />

      {/* ─── Additional Meta Tags ─── */}
      <meta name="author" content={SITE_NAME} />
      <meta name="publisher" content={SITE_NAME} />
      <meta name="copyright" content={`© ${new Date().getFullYear()} ${SITE_NAME}`} />
      <meta name="theme-color" content="#0c1832" />
      <meta name="msapplication-TileColor" content="#0c1832" />
      <meta name="application-name" content={SITE_NAME} />
      <meta name="apple-mobile-web-app-title" content={SITE_NAME} />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

      {/* ─── Verification Placeholders ─── */}
      {/* Uncomment and add your verification codes:
      <meta name="google-site-verification" content="YOUR_GOOGLE_VERIFICATION_CODE" />
      <meta name="msvalidate.01" content="YOUR_BING_VERIFICATION_CODE" />
      */}

      {/* ─── Favicon ─── */}
      <link rel="icon" type="image/jpeg" href="/logo.jpeg" />
      <link rel="apple-touch-icon" href="/logo.jpeg" />

      {/* ─── Structured Data: WebSite (Home page only) ─── */}
      {isHomePage && (
        <script type="application/ld+json">
          {JSON.stringify(generateWebSiteSchema())}
        </script>
      )}

      {/* ─── Structured Data: Business/Organization (always) ─── */}
      <script type="application/ld+json">
        {JSON.stringify(generateBusinessSchema())}
      </script>

      {/* ─── Structured Data: Breadcrumbs ─── */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <script type="application/ld+json">
          {JSON.stringify(generateBreadcrumbSchema(breadcrumbs))}
        </script>
      )}

      {/* ─── Structured Data: FAQ (AEO) ─── */}
      {faqData && faqData.length > 0 && (
        <script type="application/ld+json">
          {JSON.stringify(generateFAQSchema(faqData))}
        </script>
      )}

      {/* ─── Structured Data: Property Listing ─── */}
      {propertyData && (
        <script type="application/ld+json">
          {JSON.stringify(generatePropertySchema(propertyData))}
        </script>
      )}
    </Helmet>
  );
};

// ─── EXPORTS ────────────────────────────────────────────
export { generateItemListSchema, generateBreadcrumbSchema, SITE_URL, SITE_NAME };
export type { BreadcrumbItem, FAQItem, PropertySchemaData };

// Export provider to wrap app
export const SEOProvider = HelmetProvider;
