export interface Review {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  date: string;
  text: string;
}

export type PropertyType = 'rent' | 'sale' | 'lease' | 'commercial' | 'plot' | 'farmhouse' | 'land';

// Human-readable labels for each property category, used across cards, filters, and the admin form
export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  rent: 'For Rent',
  sale: 'For Sale',
  lease: 'For Lease',
  commercial: 'Commercial',
  plot: 'Plot for Sale',
  farmhouse: 'Farmhouse Plot',
  land: 'Land / Agricultural',
};

// Broader grouping used for admin organization/filtering — auto-suggested from
// `type` but editable, independent of the listing-facing PropertyType above.
export type PropertyCategory = 'residential' | 'agricultural' | 'commercial' | 'hospitality' | 'investment';

export const PROPERTY_CATEGORY_LABELS: Record<PropertyCategory, string> = {
  residential: 'Residential',
  agricultural: 'Agricultural',
  commercial: 'Commercial',
  hospitality: 'Hospitality / Resort',
  investment: 'Investment',
};

export const DEFAULT_CATEGORY_FOR_TYPE: Record<PropertyType, PropertyCategory> = {
  rent: 'residential',
  sale: 'residential',
  lease: 'residential',
  commercial: 'commercial',
  plot: 'residential',
  farmhouse: 'agricultural',
  land: 'agricultural',
};

// Publishing workflow status — only `published` properties are shown on the
// public website; every other status is admin-only.
export type PropertyStatus = 'draft' | 'available' | 'published' | 'reserved' | 'sold' | 'rented' | 'inactive';

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  draft: 'Draft',
  available: 'Available',
  published: 'Published',
  reserved: 'Reserved',
  sold: 'Sold',
  rented: 'Rented',
  inactive: 'Inactive',
};

// Badge tone per status — reused by the admin table and any public "Sold"/"Reserved" ribbon
export const PROPERTY_STATUS_TONE: Record<PropertyStatus, 'neutral' | 'info' | 'success' | 'gold' | 'critical'> = {
  draft: 'neutral',
  available: 'info',
  published: 'success',
  reserved: 'gold',
  sold: 'critical',
  rented: 'critical',
  inactive: 'neutral',
};

export type PriceType = 'total' | 'per_sqft' | 'per_acre' | 'per_guntha' | 'per_cent';

export const PRICE_TYPE_LABELS: Record<PriceType, string> = {
  total: 'Total Price',
  per_sqft: 'Per Sq Ft',
  per_acre: 'Per Acre',
  per_guntha: 'Per Guntha',
  per_cent: 'Per Cent',
};

export type LegalVerificationStatus = 'verified' | 'pending' | 'not_verified';

export const LEGAL_VERIFICATION_LABELS: Record<LegalVerificationStatus, string> = {
  verified: 'Verified',
  pending: 'Verification Pending',
  not_verified: 'Not Verified',
};

export type SourceType = 'direct_owner' | 'broker' | 'referral' | 'developer' | 'network' | 'other';

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  direct_owner: 'Direct Owner',
  broker: 'Broker',
  referral: 'Referral',
  developer: 'Developer',
  network: 'Network',
  other: 'Other',
};

// Admin-only legal & documentation info — never sent to the public website.
export interface PropertyLegalInfo {
  ownershipType?: string;
  verificationStatus?: LegalVerificationStatus;
  titleDeed?: boolean;
  saleDeed?: boolean;
  rtc?: boolean;
  mutation?: boolean;
  khata?: boolean;
  ec?: boolean;
  surveyNumber?: string;
  hissaNumber?: string;
  landClassification?: string;
  dcConversionStatus?: string;
  layoutApproval?: string;
  notes?: string;
}

// Admin-only owner / source info — where the property actually came from.
export interface PropertySourceInfo {
  ownerName?: string;
  ownerPhone?: string;
  ownerWhatsApp?: string;
  ownerEmail?: string;
  sourceType?: SourceType;
  sourceContact?: string;
  commissionAgreement?: string;
  notes?: string;
}

export interface Property {
  id: string;
  propertyCode: string; // auto-generated display ID, e.g. PA-KA-00214
  createdAt?: string; // ISO timestamp, set automatically on creation
  updatedAt?: string; // ISO timestamp, set automatically on every update
  title: string;
  location: string;
  areaName: string;
  price: number;
  type: PropertyType;
  category: PropertyCategory;
  status: PropertyStatus;
  bedrooms: number;
  bathrooms: number;
  area: number;
  furnished: 'fully' | 'semi' | 'unfurnished';
  deposit: string;
  availability: string;
  floor?: string;
  facing?: string;
  amenities: string[];
  highlights: string[];
  images: string[];
  imageCaptions?: string[];
  coverImageIndex?: number;
  videos?: string[];
  description: string;
  shortDescription?: string;
  contactEmail: string;
  mapQuery: string;
  reviews: Review[];

  // Type-specific fields, keyed by src/data/propertyAttributeSchema.ts
  attributes?: Record<string, string | number | boolean>;

  // Karnataka location hierarchy — `areaName` (below, existing field) doubles
  // as the locality/area name shown throughout the site.
  district?: string;
  taluk?: string;
  cityTown?: string;
  landmark?: string;
  pincode?: string;
  latitude?: string;
  longitude?: string;
  locationVisibility?: 'exact' | 'approximate';

  // Price & financials
  priceType?: PriceType;
  negotiable?: boolean;
  minExpectedPrice?: number;
  advanceAmount?: number;
  commissionType?: 'flat' | 'percentage';
  commissionValue?: number;

  // Publishing / featured
  isFeatured?: boolean;
  isUrgent?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  slug?: string;
  metaKeywords?: string;

  // Admin-only sections
  legal?: PropertyLegalInfo;
  source?: PropertySourceInfo;
}

// Generates the next display-facing property code from the current count.
// Cosmetic only — `id` (crypto.randomUUID) remains the real routing key.
export function generatePropertyCode(existingCount: number): string {
  return `PA-KA-${String(existingCount + 1).padStart(5, '0')}`;
}

// Images have been removed from this project for now — every property's
// `images` array is empty until the new site's media is wired back up.

// Helper to generate reviews with Indian names
function generateReviews(count: number): Review[] {
  const names = [
    "Rahul Sharma", "Priya Patel", "Amit Kumar", "Ananya Singh", "Vikram Mehta",
    "Neha Gupta", "Suresh Nair", "Divya Iyer", "Rajesh Desai", "Pooja Hegde",
    "Arjun Reddy", "Sneha Joshi", "Manoj Tiwari", "Riya Malhotra", "Karthik Raj",
    "Anjali Menon", "Rohit Saxena", "Meera Kapoor", "Nikhil Verma", "Aditi Sharma"
  ];
  
  const texts = [
    "Absolutely love this place! The location is perfect and the amenities are top-notch.",
    "Great experience living here! Very spacious and well-maintained property.",
    "The management team is super responsive and helpful. Highly recommend!",
    "Perfect family home with all the necessary facilities close by.",
    "Best decision we made! The property is exactly as shown in the pictures.",
    "Very peaceful and safe neighborhood. Love the community feel.",
    "Modern amenities and beautiful interiors. Worth every penny!",
    "Excellent connectivity to major IT parks and shopping centers.",
    "The property is well-lit and ventilated. Perfect for working professionals.",
    "Kids love the play area and we love the green spaces around!"
  ];

  const avatars = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Amit",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Neha",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Suresh",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Divya",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Pooja"
  ];

  return Array.from({ length: count }, (_, i) => {
    const name = names[i % names.length];
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 180)); // Random date in last 6 months
    return {
      id: `review-${i}`,
      name,
      avatar: avatars[i % avatars.length],
      rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
      date: date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
      text: texts[i % texts.length]
    };
  });
}

// Property listings have been removed for now — populate this as the new
// site's real listings come in (or add them via the Admin dashboard).
export const defaultProperties: Property[] = [];

// Export mutable reference (will be overridden by Zustand store)
export let properties: Property[] = [...defaultProperties];
