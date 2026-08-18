export interface SubService {
  title: string;
  description: string;
}

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  category: 'legal' | 'maintenance' | 'renovation' | 'relocation';
  categoryLabel: string;
  shortDesc: string;
  fullDesc: string;
  iconName: string;
  badge: string;
  highlightColor: string;
  turnaroundTime: string;
  features: string[];
  subServices: SubService[];
  benefits: string[];
  popularLocations: string[];
  faqs: { question: string; answer: string }[];
}

export const servicesData: ServiceItem[] = [
  {
    id: 'e-stamp',
    slug: 'e-stamp-rental-agreements',
    title: 'E-Stamp & Agreement Services',
    category: 'legal',
    categoryLabel: 'Legal & Documentation',
    shortDesc: 'Official government e-stamp paper procurement, legal rental agreement drafting, affidavit preparation, and same-day doorstep delivery in Bangalore.',
    fullDesc: 'Get legally valid, government-authorized e-stamp papers and custom-drafted rental/lease agreements without visiting sub-registrar offices or queuing up. We handle legal stamping, tenant-owner verification clauses, notary attestation, and same-day doorstep delivery across Bangalore.',
    iconName: 'FileCheck',
    badge: 'Govt Authorized',
    highlightColor: 'from-amber-500/20 to-amber-600/10 text-amber-600 border-amber-200',
    turnaroundTime: 'Same Day / 2-4 Hours',
    features: [
      'Government authorized e-Stamp paper procurement (SHCIL/KAVERI)',
      'Custom residential & commercial rental agreement drafting',
      'Lease agreements, sale agreements & power of attorney',
      'Affidavits, indemnity bonds & declarations',
      'Doorstep delivery with biometric/notary assistance if needed',
      '100% legally compliant under Karnataka Stamp Act'
    ],
    subServices: [
      {
        title: 'Rental & Lease Agreement e-Stamping',
        description: 'Standard 11-month or customized long-term rental agreements on official government e-stamp paper with legal clauses.'
      },
      {
        title: 'Instant e-Stamp Paper Procurement',
        description: 'Official stamp papers of required denominations procured and delivered directly to your doorstep.'
      },
      {
        title: 'Sale & Commercial Agreement Drafting',
        description: 'Comprehensive legal documentation for commercial properties, shop leases, and property sale agreements.'
      },
      {
        title: 'Affidavits & Notary Attestation',
        description: 'Name change affidavits, address proof declarations, birth/marriage gap affidavits with authorized notary attestation.'
      }
    ],
    benefits: [
      'Zero queue hassle — 100% digital & doorstep service',
      'Drafted by verified legal documentation experts',
      'Instant digital copy via email/WhatsApp + physical delivery',
      'Accepted by all major banks, societies & IT companies'
    ],
    popularLocations: ['GM Palya', 'CV Raman Nagar', 'Murgeshpalya', 'Kaggadasapura', 'Whitefield', 'Indiranagar'],
    faqs: [
      {
        question: 'How quickly can I get an e-stamp rental agreement in Bangalore?',
        answer: 'We provide soft copy drafts within 2 hours of receiving tenant and owner details. Physical e-stamped and signed copies are delivered same-day across Bangalore.'
      },
      {
        question: 'Is the e-stamp paper legally valid in court?',
        answer: 'Yes, all our e-stamp papers are procured through authorized Government of Karnataka portals (SHCIL / KAVERI) and are 100% legally recognized and binding.'
      },
      {
        question: 'What documents are required for an e-stamp rental agreement?',
        answer: 'You will need Aadhaar Card / PAN Card of both tenant and landlord, property address details, and agreed rent & deposit terms.'
      }
    ]
  },
  {
    id: 'electrical-works',
    slug: 'electrical-works-repairs',
    title: 'Electrical Works & Repairs',
    category: 'maintenance',
    categoryLabel: 'Repairs & Maintenance',
    shortDesc: 'Certified electricians for complete home wiring, MCB/fuse fixes, light & fan installations, geyser wiring, appliance hookups, and safety inspections.',
    fullDesc: 'From minor socket repairs to full apartment rewiring, our licensed and background-verified electricians ensure safe, prompt, and top-standard electrical services. We use high-grade materials and follow strict safety protocols.',
    iconName: 'Zap',
    badge: 'Certified Electricians',
    highlightColor: 'from-amber-500/20 to-yellow-500/10 text-yellow-600 border-yellow-200',
    turnaroundTime: '60 - 90 Minutes Response',
    features: [
      'Complete home electrical rewiring & concealed cabling',
      'MCB tripping diagnostics & Distribution Board (DB) repair',
      'Ceiling fan, exhaust fan, chandelier & profile LED lighting installation',
      'Geyser, water heater & heavy appliance power socket setup',
      'Inverter & UPS installation with dual-battery wiring',
      'Smart home switches, automation & doorbell installations'
    ],
    subServices: [
      {
        title: 'Lighting & Fan Installation',
        description: 'Ceiling fans, fancy pendant lights, false ceiling LED cob lights, profile lights, and wall sconces installation.'
      },
      {
        title: 'Switchboard & Socket Repairs',
        description: 'Fixing burnt switches, loose sockets, 16A power points for AC/geysers, and modern modular plate replacements.'
      },
      {
        title: 'Geyser & Inverter Electrical Setup',
        description: 'Heavy gauge wiring, dedicated circuit breakers, and safe electrical connections for geysers and home inverters.'
      },
      {
        title: 'Complete Home Rewiring & DB Setup',
        description: 'End-to-end electrical wiring for new homes, renovated flats, and troubleshooting short circuits or power surges.'
      }
    ],
    benefits: [
      'Background-verified & certified electricians',
      'Transparent rate estimate with upfront quote',
      '30-day post-service workmanship warranty',
      'High-grade copper wiring (Polycab, Finolex, Havells)'
    ],
    popularLocations: ['CV Raman Nagar', 'GM Palya', 'Murgeshpalya', 'Bommasandra', 'Yelahanka', 'Sarjapur Road'],
    faqs: [
      {
        question: 'Do your electricians bring their own tools and materials?',
        answer: 'Yes, our technicians arrive equipped with professional diagnostic meters, drill tools, and standard consumables. Replacement parts can be provided by us with brand warranty or supplied by the client.'
      },
      {
        question: 'Is there a warranty on electrical repairs?',
        answer: 'We provide a 30-day service warranty on all labor and installations. Any defect arising from our work will be fixed free of charge.'
      }
    ]
  },
  {
    id: 'plumbing-works',
    slug: 'plumbing-works-repairs',
    title: 'Plumbing & Sanitary Works',
    category: 'maintenance',
    categoryLabel: 'Repairs & Maintenance',
    shortDesc: 'Expert plumbers for leak fixes, tap & shower installation, bathroom sanitary fittings, drain blockage clearance, water motor repairs, and tank cleaning.',
    fullDesc: 'Quick and reliable plumbing services for apartments, independent houses, and commercial spaces. Whether it is an emergency midnight leak, low water pressure, or fitting luxury sanitaryware (Jaquar, Kohler, Hindware), our skilled plumbers get it done cleanly.',
    iconName: 'Droplets',
    badge: 'Quick 60-Min Response',
    highlightColor: 'from-blue-500/20 to-cyan-500/10 text-blue-600 border-blue-200',
    turnaroundTime: '60 Minutes Emergency Response',
    features: [
      'Tap, mixer, health faucet & shower head repairs/replacement',
      'Bathroom sanitaryware installation (Western commodes, basins, vanities)',
      'Water heater / geyser inlet-outlet pipeline connections',
      'Drainage unclogging & sewer line pressure clearing',
      'Overhead water tank & underground sump cleaning',
      'Water pressure booster pump & submersible motor setup'
    ],
    subServices: [
      {
        title: 'Tap, Shower & Leakage Repairs',
        description: 'Fixing dripping taps, internal wall pipe seepages, mixer valves, and flexible hose replacements.'
      },
      {
        title: 'Toilet & Sanitaryware Fitting',
        description: 'Wall-hung commodes, flush tanks, washbasins, counter vanity sinks, and concealed cisterns.'
      },
      {
        title: 'Blockage Clearing & Jetting',
        description: 'Clearing stubborn bathroom drain, kitchen sink, and main drainage blockages using modern spiral & pressure tools.'
      },
      {
        title: 'Water Tank Cleaning & Motor Services',
        description: 'Hygienic 6-stage UV tank cleaning and water pump installation or capacitor replacements.'
      }
    ],
    benefits: [
      'Emergency 60-minute dispatch for active leakages',
      'Zero-mess execution with thorough cleanup',
      'Experience with premium brands (Jaquar, Grohe, Kohler, Hindware)',
      '30-day leakage & workmanship guarantee'
    ],
    popularLocations: ['Murgeshpalya', 'GM Palya', 'CV Raman Nagar', 'Kaggadasapura', 'Singasandra', 'Whitefield'],
    faqs: [
      {
        question: 'How do you handle hidden pipeline leakages inside tiles?',
        answer: 'We utilize pressure testing and acoustic moisture meters to pinpoint leaks accurately, minimizing tile breakage and repair costs.'
      },
      {
        question: 'Do you offer deep cleaning for overhead water tanks?',
        answer: 'Yes, we provide mechanized 6-stage cleaning including sludge removal, high-pressure washing, vacuuming, and UV/antibacterial treatment.'
      }
    ]
  },
  {
    id: 'carpentry-works',
    slug: 'carpentry-works-woodwork',
    title: 'Carpentry & Woodwork Services',
    category: 'maintenance',
    categoryLabel: 'Repairs & Maintenance',
    shortDesc: 'Master carpenters for modular kitchen repairs, custom wardrobes, door lock fixes, furniture assembly/repairs, hydraulic fittings, and woodwork polishing.',
    fullDesc: 'Skilled carpentry solutions for modern homes. From adjusting misaligned cabinet hinges to crafting bespoke wooden storage units, our craftsmen deliver impeccable finish, durability, and smooth functionality.',
    iconName: 'Hammer',
    badge: 'Master Craftsmen',
    highlightColor: 'from-amber-600/20 to-orange-500/10 text-amber-700 border-amber-300',
    turnaroundTime: 'Same Day / Next Day Slot',
    features: [
      'Modular kitchen channel, basket & hydraulic lift repairs',
      'Wardrobe sliding door rollers & soft-close hinge replacement',
      'Main door digital smart lock, Godrej lock & latch fitting',
      'Furniture assembly (IKEA, Pepperfry, Urban Ladder, Amazon)',
      'Custom wooden TV units, bookshelves, shoe racks & partitions',
      'Wood polish, PU coating, melamine finish & scratch restoration'
    ],
    subServices: [
      {
        title: 'Modular Kitchen & Wardrobe Repairs',
        description: 'Tandem box fixes, hinge replacements (Hettich, Ebco, Blum), slider channel repairs, and laminate peeling fixes.'
      },
      {
        title: 'Door, Lock & Mesh Fitting',
        description: 'Lock installations, magnetic door stoppers, mesh door alignments, and wooden door trimming.'
      },
      {
        title: 'Furniture Assembly & Dismantling',
        description: 'Quick assembly for flat-pack beds, study desks, dining tables, and modular sofas.'
      },
      {
        title: 'Custom Woodwork & Polishing',
        description: 'Bespoke plywood cabinets, veneer polishing, teak wood restoration, and PU lacquer finish.'
      }
    ],
    benefits: [
      'Precision measurements and seamless hardware integration',
      'High-grade hardware options (Hettich, Hafele, Ebco, Godrej)',
      'Clean dust-controlled cutting tools for indoor work',
      'Transparent estimates based on material & labor'
    ],
    popularLocations: ['GM Palya', 'CV Raman Nagar', 'Murgeshpalya', 'Sarjapur Road', 'Whitefield', 'Indiranagar'],
    faqs: [
      {
        question: 'Can you assemble furniture bought online from IKEA or Pepperfry?',
        answer: 'Yes, our carpenters are trained in assembling and dismantling furniture from IKEA, Pepperfry, Urban Ladder, Amazon, and others with proper torque tools.'
      },
      {
        question: 'Can you fix sagging or misaligned modular kitchen shutters?',
        answer: 'Yes, we replace worn-out soft-close hinges, realign shutter gaps, and upgrade drawer channels to heavy-duty runners.'
      }
    ]
  },
  {
    id: 'building-works',
    slug: 'building-works-civil-renovation',
    title: 'Building Works, Painting & Renovation',
    category: 'renovation',
    categoryLabel: 'Renovation & Construction',
    shortDesc: 'Comprehensive civil building works, interior & exterior painting, waterproof coating, tile laying, masonry alterations, and complete home renovations.',
    fullDesc: 'Transform your property with Trishna Property Management’s civil and renovation team. We handle turnkey apartment remodelling, painting with Asian Paints & Berger, terrace waterproofing, wall demolition, plastering, false ceilings, and balcony grill fabrication.',
    iconName: 'Building2',
    badge: 'Turnkey Renovation',
    highlightColor: 'from-emerald-500/20 to-teal-500/10 text-emerald-600 border-emerald-200',
    turnaroundTime: 'Scheduled Project Timelines',
    features: [
      'Interior & exterior home painting (Asian Paints Royale, Apex, Tractor Emulsion)',
      'Terrace, bathroom & exterior wall waterproofing with warranty',
      'Vitrified tile laying, Italian marble polishing & bathroom re-tiling',
      'POP / Gypsum false ceiling with integrated LED strip lighting',
      'Civil modifications, wall partition, plastering & core cutting',
      'Balcony safety grill fabrication, MS gates & aluminium sliding windows'
    ],
    subServices: [
      {
        title: 'Full Home Painting & Texturing',
        description: 'Two-coat putty, primer, and premium emulsion paint with mechanized sanding and 100% floor masking protection.'
      },
      {
        title: 'Waterproofing & Dampness Treatment',
        description: 'Dr. Fixit / Fosroc chemical injection and membrane waterproofing for terrace, sunken slabs, and seepage walls.'
      },
      {
        title: 'Tile Laying & Bathroom Remodeling',
        description: 'Anti-skid floor tiles, designer wall tiles, epoxy grouting, and total bathroom modernisation.'
      },
      {
        title: 'Turnkey Apartment & Villa Renovation',
        description: 'Complete civil upgrade including flooring, electrical, plumbing, carpentry, and painting under one project manager.'
      }
    ],
    benefits: [
      'Free on-site inspection and detailed itemized estimate',
      'Dedicated project supervisor for daily progress updates',
      'Genuine branded materials with manufacturer warranty',
      'Strict commitment to project completion deadlines'
    ],
    popularLocations: ['GM Palya', 'CV Raman Nagar', 'Murgeshpalya', 'Bommasandra', 'Yelahanka', 'Whitefield', 'Bannerghatta Road'],
    faqs: [
      {
        question: 'Do you cover furniture and floors during painting work?',
        answer: 'Yes! We use heavy-duty masking plastic sheets and floor protection boards to ensure your furniture, floors, and switch plates remain completely spotless.'
      },
      {
        question: 'Do you offer a warranty on waterproofing services?',
        answer: 'Yes, we provide up to a 5-year written warranty on comprehensive terrace and exterior waterproofing solutions.'
      }
    ]
  },
  {
    id: 'packers-movers',
    slug: 'packers-and-movers-shifting',
    title: 'Packers & Movers Shifting Services',
    category: 'relocation',
    categoryLabel: 'Relocation & Shifting',
    shortDesc: 'Stress-free local Bangalore home shifting and intercity relocation with 3-layer protective packing, trained crew, dedicated trucks, and transit safety.',
    fullDesc: 'Relocate without the headache. Trishna Property Management’s moving specialists provide end-to-end packing, careful handling of fragile items, furniture dismantling, safe transport in covered vehicles, unloading, and furniture reassembly at your new home.',
    iconName: 'Truck',
    badge: 'Safe & Reliable Shifting',
    highlightColor: 'from-purple-500/20 to-indigo-500/10 text-purple-600 border-purple-200',
    turnaroundTime: 'Same-Day Shifting Available',
    features: [
      '3-Layer premium packing (Bubble wrap, corrugated sheets, stretch film)',
      'Careful handling of electronics, TV, fridge, washing machine & glassware',
      'Dismantling & reassembly of beds, wardrobes, and dining tables',
      'Dedicated covered container vehicles for weatherproof transit',
      'Trained, verified, and uniformed moving crew',
      'Transit insurance coverage and live shipment tracking'
    ],
    subServices: [
      {
        title: 'Local House Shifting (Within Bangalore)',
        description: 'Door-to-door shifting across East Bangalore, Whitefield, South Bangalore, North Bangalore with same-day move-in.'
      },
      {
        title: 'Intercity Relocation (All India)',
        description: 'Safe pan-India moving with dedicated container trucks, customs documentation, and scheduled delivery.'
      },
      {
        title: 'Vehicle & Bike Transportation',
        description: 'Safe two-wheeler and four-wheeler transport in specialized carriers with wheel locks and scratch-proof wrapping.'
      },
      {
        title: 'Storage & Warehousing',
        description: 'Secure, CCTV-monitored, moisture-free short and long-term household goods storage in Bangalore.'
      }
    ],
    benefits: [
      'Zero hidden charges — transparent locked-in quotation',
      'Free pre-move survey (online or doorstep)',
      'Careful unpacking and debris removal after setup',
      'Experienced handlers with over 500+ successful Bangalore moves'
    ],
    popularLocations: ['Murgeshpalya', 'CV Raman Nagar', 'GM Palya', 'Whitefield', 'Sarjapur Road', 'Yelahanka', 'Electronic City'],
    faqs: [
      {
        question: 'How is the moving price calculated?',
        answer: 'Pricing depends on the volume of goods (1BHK/2BHK/3BHK), distance between pickup and drop locations, floor levels, lift availability, and packing material requirements.'
      },
      {
        question: 'Will the crew dismantle and reassemble my bed and wardrobe?',
        answer: 'Yes, our team includes carpentry tools and trained handlers who dismantle beds, wardrobes, and tables at the origin and reassemble them at the destination.'
      },
      {
        question: 'Are my goods insured during transit?',
        answer: 'Yes, we offer optional comprehensive transit insurance covering accidental damages for complete peace of mind.'
      }
    ]
  }
];
