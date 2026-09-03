export interface SubService {
  title: string;
  description: string;
}

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  category: 'buying' | 'selling' | 'renting';
  categoryLabel: string;
  shortDesc: string;
  fullDesc: string;
  iconName: string;
  badge: string;
  turnaroundTime: string;
  features: string[];
  subServices: SubService[];
}

// The Property Agent doesn't hold fixed inventory — this describes the
// actual service: acting as a direct agent connecting buyers, sellers,
// and tenants with properties across Karnataka as they become available.
export const servicesData: ServiceItem[] = [
  {
    id: 'buying-assistance',
    slug: 'buying-assistance',
    title: 'Help You Buy a Property',
    category: 'buying',
    categoryLabel: 'For Buyers',
    shortDesc: "Looking for a plot, farmhouse, agricultural land, or home anywhere in Karnataka? We actively search for properties that match your budget and requirement, and support you every step through to purchase.",
    fullDesc: "As an independent agent, we don't sit on a fixed inventory — we actively look for plots, farmhouse plots, agricultural land, ready homes, and commercial spaces across Karnataka that match what you're looking for. Once we find a good fit, we arrange site visits, help you evaluate the property, assist with price negotiation, and guide you through documentation and registration right up to the final purchase.",
    iconName: 'Search',
    badge: 'Active Search',
    turnaroundTime: 'Ongoing — as matching properties come up',
    features: [
      'We actively search for properties matching your budget & area',
      'Site visits arranged and accompanied',
      'Price negotiation on your behalf',
      'Guidance on title & document verification',
      'Support through registration and final paperwork',
    ],
    subServices: [
      { title: 'Plots & Farmhouse Plots', description: 'Help finding and buying residential plots or farmhouse plots in your preferred area of Karnataka.' },
      { title: 'Agricultural Land', description: 'Assistance locating and purchasing agricultural land, with guidance on land classification and conversion where relevant.' },
      { title: 'Ready Homes & Apartments', description: 'Support finding homes and apartments for sale that fit your budget and requirements.' },
      { title: 'Commercial Spaces', description: 'Help identifying and acquiring commercial properties and office spaces.' },
    ],
  },
  {
    id: 'selling-assistance',
    slug: 'selling-assistance',
    title: 'Help You Sell or List a Property',
    category: 'selling',
    categoryLabel: 'For Owners',
    shortDesc: "Have a plot, land, or home to sell or rent out? We list it, put it in front of genuine buyers and tenants in our network, and stay involved until the deal closes.",
    fullDesc: "If you have a property to sell — a plot, farmhouse land, agricultural land, home, or commercial space — or want to rent/lease it out, we take it to interested buyers and tenants directly. We advise on fair market pricing based on the local area, list the property, coordinate site visits with interested parties, and stay involved through negotiation and paperwork until the deal is done.",
    iconName: 'Tag',
    badge: 'Direct Buyer Network',
    turnaroundTime: 'Ongoing — until your property is sold or rented',
    features: [
      'Property listed and shared with our buyer/tenant network',
      'Fair pricing guidance based on the local market',
      'Site visits coordinated with interested buyers or tenants',
      'Negotiation support on your behalf',
      'Assistance with agreements and paperwork through to closing',
    ],
    subServices: [
      { title: 'Sell a Plot or Land', description: 'List a residential plot, farmhouse plot, or agricultural land for sale.' },
      { title: 'Sell a Home', description: 'List a ready home or apartment for sale to genuine, verified buyers.' },
      { title: 'Rent or Lease Out a Property', description: 'List your property for rent or long-term lease and find suitable tenants.' },
      { title: 'Sell or Lease Commercial Space', description: 'List commercial property for sale or lease to businesses.' },
    ],
  },
  {
    id: 'rental-lease-assistance',
    slug: 'rental-lease-assistance',
    title: 'Help You Rent or Lease a Home',
    category: 'renting',
    categoryLabel: 'For Tenants',
    shortDesc: "Searching for a rental home or a long-term lease property in Karnataka? We match you with available options, coordinate with owners, and help with the agreement.",
    fullDesc: "Whether you need a rental home for immediate move-in or want to explore long-term lease properties, we help match you with available options as they come up across Karnataka. We coordinate viewings with property owners, help you understand the terms, and assist with the rental or lease agreement — including e-stamp paperwork where needed.",
    iconName: 'Key',
    badge: 'Move-In Ready',
    turnaroundTime: 'Ongoing — as rental/lease properties come up',
    features: [
      'Matched with available rental & lease properties',
      'Viewings coordinated directly with owners',
      'Help understanding rent, deposit & lease terms',
      'Rental/lease agreement & e-stamp paperwork support',
      'Move-in coordination',
    ],
    subServices: [
      { title: 'Rental Homes', description: 'Find a home available for monthly rent in your preferred area.' },
      { title: 'Long-Term Lease Properties', description: 'Explore lease properties, including zero-monthly-rent lease structures.' },
      { title: 'Rental Agreement Support', description: 'Get help drafting and e-stamping your rental or lease agreement.' },
    ],
  },
];
