export interface Review {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  date: string;
  text: string;
}

export interface Property {
  id: string;
  title: string;
  location: string;
  areaName: string;
  price: number;
  type: 'rent' | 'sale';
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
  videos?: string[];
  description: string;
  contactEmail: string;
  mapQuery: string;
  reviews: Review[];
}

// Helper to generate image paths from public directory
function imgList(folder: string, count: number, ext: string = 'jpeg'): string[] {
  return Array.from({ length: count }, (_, i) => {
    const num = String(i + 1).padStart(2, '0');
    return `/properties/${folder}/${folder}-${num}.${ext}`;
  });
}

// For folders with mixed jpg/png: pass the extension for each index
function imgListMixed(folder: string, extensions: string[]): string[] {
  return extensions.map((ext, i) => {
    const num = String(i + 1).padStart(2, '0');
    return `/properties/${folder}/${folder}-${num}.${ext}`;
  });
}

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

export const defaultProperties: Property[] = [
  // ─── MURGESHPALYA ─────────────────────────────
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'Luxury 3BHK in Gated Community',
    location: 'Murgeshpalya, Bangalore',
    areaName: 'Murgeshpalya',
    price: 65000,
    type: 'rent',
    bedrooms: 3,
    bathrooms: 2,
    area: 1650,
    furnished: 'fully',
    deposit: '2 Lakhs',
    availability: 'Immediate',
    floor: '5th Floor',
    facing: 'East',
    amenities: ['Gym', 'Swimming Pool', '24/7 Security', 'Covered Parking', 'Power Backup', 'Lift', 'CCTV', "Children's Play Area", 'Clubhouse', 'Intercom'],
    highlights: ['Premium gated community', 'Fully furnished with modern interiors', 'Walking distance to IT parks', 'Immediate occupancy available'],
    images: imgList('murgeshpalya-65k', 8),
    description: 'Stunning fully furnished 3BHK apartment in a premium gated community in Murgeshpalya. Features modern interiors, spacious rooms with ample natural light, and top-tier amenities. Walking distance to major IT parks and well-connected to Old Airport Road and HAL areas.',
    contactEmail: 'trishnaproperties78@gmail.com',
    mapQuery: 'Murgeshpalya, Bangalore',
    reviews: generateReviews(3),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    title: 'Furnished 2BHK in Gated Society',
    location: 'Murgeshpalya, Bangalore',
    areaName: 'Murgeshpalya',
    price: 60000,
    type: 'rent',
    bedrooms: 2,
    bathrooms: 2,
    area: 1350,
    furnished: 'fully',
    deposit: '2 Lakhs',
    availability: 'Immediate',
    floor: '3rd Floor',
    facing: 'North-East',
    amenities: ['Gated Community', 'Power Backup', 'Lift', 'Parking', 'Security', 'Maintenance Included', 'Water Supply'],
    highlights: ['Gated community with 24/7 security', 'Rent includes maintenance charges', 'Fully furnished and move-in ready', 'Excellent cross-ventilation'],
    images: imgList('murgeshpalya-3bhk-60k', 8),
    description: 'Beautiful fully furnished 2BHK in a well-maintained gated community. Rent of ₹60,000 includes maintenance. The apartment features modern furniture, modular kitchen, and is move-in ready. Located in the heart of Murgeshpalya with easy access to all conveniences.',
    contactEmail: 'trishnaproperties78@gmail.com',
    mapQuery: 'Murgeshpalya, Bangalore',
    reviews: generateReviews(4),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    title: 'Spacious 2BHK — Prime Location',
    location: 'Murgeshpalya, Bangalore',
    areaName: 'Murgeshpalya',
    price: 50000,
    type: 'rent',
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    furnished: 'semi',
    deposit: '2 Lakhs',
    availability: 'Immediate',
    floor: '4th Floor',
    facing: 'South',
    amenities: ['Lift', 'Parking', 'Power Backup', 'Water Supply', 'Security', 'Maintenance Included'],
    highlights: ['Maintenance included in rent', 'Semi-furnished with wardrobes', 'Close to metro station', '2 Lakhs refundable deposit'],
    images: imgList('murgeshpalya-50k-1', 8),
    description: 'Well-maintained spacious 2BHK apartment with semi-furnished interiors. The rent of ₹50,000 includes maintenance charges with a deposit of 2 Lakhs. Located in a prime area of Murgeshpalya with excellent connectivity to IT corridors.',
    contactEmail: 'trishnaproperties78@gmail.com',
    mapQuery: 'Murgeshpalya, Bangalore',
    reviews: generateReviews(3),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    title: 'Modern 2BHK — Well Ventilated',
    location: 'Murgeshpalya, Bangalore',
    areaName: 'Murgeshpalya',
    price: 50000,
    type: 'rent',
    bedrooms: 2,
    bathrooms: 2,
    area: 1180,
    furnished: 'semi',
    deposit: '2 Lakhs',
    availability: 'Immediate',
    floor: '6th Floor',
    facing: 'West',
    amenities: ['Lift', 'Covered Parking', 'Power Backup', 'Water Supply', 'Security', 'Intercom', 'Gas Pipeline'],
    highlights: ['High floor with great views', 'Well ventilated and airy', 'Covered car parking', 'Piped gas connection'],
    images: imgList('murgeshpalya-50k-2', 8),
    description: 'Bright and well-ventilated 2BHK on a high floor with excellent views. Features covered parking, piped gas, and round-the-clock security. Ideal for working professionals and small families. Located close to shopping centers and hospitals.',
    contactEmail: 'trishnaproperties78@gmail.com',
    mapQuery: 'Murgeshpalya, Bangalore',
    reviews: generateReviews(5),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    title: 'Cozy 2BHK — Great Value',
    location: 'Murgeshpalya, Bangalore',
    areaName: 'Murgeshpalya',
    price: 50000,
    type: 'rent',
    bedrooms: 2,
    bathrooms: 2,
    area: 1100,
    furnished: 'semi',
    deposit: '2 Lakhs',
    availability: 'Immediate',
    amenities: ['Lift', 'Parking', 'Power Backup', 'Water Supply', 'CCTV', "Children's Play Area"],
    highlights: ['Best value in the locality', 'Well-maintained building', 'Kid-friendly environment', 'Close to schools and parks'],
    images: imgList('murgeshpalya-50k-3', 8),
    description: 'Cozy and well-designed 2BHK apartment at an excellent price point. The building is well-maintained with good security and amenities. Perfect for young families with children. Close to reputed schools, parks, and daily essentials.',
    contactEmail: 'trishnaproperties78@gmail.com',
    mapQuery: 'Murgeshpalya, Bangalore',
    reviews: generateReviews(3),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    title: 'Budget-Friendly 2BHK with Parking',
    location: 'Murgeshpalya, Bangalore',
    areaName: 'Murgeshpalya',
    price: 46000,
    type: 'rent',
    bedrooms: 2,
    bathrooms: 2,
    area: 1050,
    furnished: 'unfurnished',
    deposit: '1.5 Lakhs',
    availability: 'Immediate',
    amenities: ['Lift', 'Car Parking', 'Power Backup', 'CCTV', 'Maintenance Included'],
    highlights: ['Rent includes maintenance', 'Dedicated car parking', 'CCTV surveillance', 'Affordable deposit of 1.5 Lakhs'],
    images: imgList('murgeshpalya-46k', 8),
    description: 'Affordable 2BHK apartment with all essential amenities included. Rent of ₹46,000 covers maintenance with a low deposit of 1.5 Lakhs. Features dedicated car parking, CCTV security, lift access, and reliable power backup.',
    contactEmail: 'trishnaproperties78@gmail.com',
    mapQuery: 'Murgeshpalya, Bangalore',
    reviews: generateReviews(4),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440007',
    title: 'Premium 3BHK — Family Home',
    location: 'Murgeshpalya, Bangalore',
    areaName: 'Murgeshpalya',
    price: 52000,
    type: 'rent',
    bedrooms: 3,
    bathrooms: 2,
    area: 1400,
    furnished: 'semi',
    deposit: '2 Lakhs',
    availability: 'Immediate',
    floor: '2nd Floor',
    amenities: ['Lift', 'Parking', 'Power Backup', 'Water Supply', 'Security', 'Gym', 'Garden'],
    highlights: ['Spacious 3BHK for families', 'Well-maintained society', 'Garden and gym access', 'Prime residential area'],
    images: imgList('murgeshpalya-52k', 8),
    description: 'Spacious and well-planned 3BHK apartment perfect for families. Located in a well-maintained residential society with garden, gym, and round-the-clock security. Close to schools, hospitals, and shopping areas in Murgeshpalya.',
    contactEmail: 'trishnaproperties78@gmail.com',
    mapQuery: 'Murgeshpalya, Bangalore',
    reviews: generateReviews(3),
  },

  // ─── CV RAMAN NAGAR ───────────────────────────
  {
    id: '550e8400-e29b-41d4-a716-446655440008',
    title: 'Elegant 2BHK in CV Raman Nagar',
    location: 'CV Raman Nagar, Bangalore',
    areaName: 'CV Raman Nagar',
    price: 40000,
    type: 'rent',
    bedrooms: 2,
    bathrooms: 2,
    area: 1100,
    furnished: 'semi',
    deposit: '2 Lakhs',
    availability: 'Immediate',
    floor: '3rd Floor',
    facing: 'East',
    amenities: ['Parking', 'Lift', 'Power Backup', 'Water Supply', 'Security', 'CCTV'],
    highlights: ['Peaceful neighborhood', 'Close to DRDO and ISRO', 'Easy metro access', 'Well-connected to Old Airport Road'],
    images: imgList('cv-raman-nagar', 7),
    description: 'A well-maintained 2BHK flat in the peaceful locality of CV Raman Nagar. Ideal for professionals working at DRDO, ISRO, or HAL. Features good ventilation, ample parking, and easy access to metro stations and the Old Airport Road corridor.',
    contactEmail: 'trishnaproperties78@gmail.com',
    mapQuery: 'CV Raman Nagar, Bangalore',
    reviews: generateReviews(4),
  },

  // ─── GM PALYA ─────────────────────────────────
  {
    id: '550e8400-e29b-41d4-a716-446655440009',
    title: 'Charming Home in GM Palya',
    location: 'GM Palya, Bangalore',
    areaName: 'GM Palya',
    price: 35000,
    type: 'rent',
    bedrooms: 2,
    bathrooms: 2,
    area: 1000,
    furnished: 'semi',
    deposit: '1.5 Lakhs',
    availability: 'Immediate',
    amenities: ['Parking', 'Water Supply', 'Power Backup', 'Security'],
    highlights: ['Quiet residential area', 'Affordable pricing', 'Good water supply', 'Close to main road'],
    images: imgList('gm-palya', 7),
    description: 'Charming 2BHK home in the quiet residential pocket of GM Palya. Offers great value with an affordable rent and low deposit. Well-connected to Indiranagar and Old Airport Road. Ideal for small families and working professionals.',
    contactEmail: 'trishnaproperties78@gmail.com',
    mapQuery: 'GM Palya, CV Raman Nagar, Bangalore',
    reviews: generateReviews(3),
  },

  // ─── BRIGADE PROPERTIES (SALE) ────────────────
  {
    id: '550e8400-e29b-41d4-a716-446655440010',
    title: 'Brigade Valencia — Premium Apartments',
    location: 'Bommasandra, Bangalore',
    areaName: 'Bommasandra',
    price: 11000000,
    type: 'sale',
    bedrooms: 3,
    bathrooms: 2,
    area: 1650,
    furnished: 'unfurnished',
    deposit: 'N/A',
    availability: 'Under Construction',
    facing: 'East',
    amenities: ['Swimming Pool', 'Gym', 'Clubhouse', "Children's Play Area", 'Landscaped Garden', 'Power Backup', 'Lift', '24/7 Security', 'Jogging Track', 'Indoor Games'],
    highlights: ['24-acre township with 85% green area', '2, 2.5, 3 & 4 BHK configurations', '1145 to 2490 sqft options', 'Brigade Group — trusted developer'],
    images: imgListMixed('brigade-valencia', ['jpg','jpg','jpg','jpg','jpg','png','png','png','png']),
    description: 'Brigade Valencia is a premium residential project in Bommasandra by Brigade Group. Spread across 24 acres with 85% green area, it offers a wide range of lifestyle amenities curated for recreation, wellness, and community living. Available in 2, 2.5, 3 & 4 BHK configurations from 1145 to 2490 sqft. Starting at ₹1.1 Cr.',
    contactEmail: 'trishnaproperties78@gmail.com',
    mapQuery: 'Brigade Valencia, Bommasandra, Bangalore',
    reviews: generateReviews(5),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440011',
    title: 'Brigade Eternia — Modern Living',
    location: 'Yelahanka New Town, Bangalore',
    areaName: 'Yelahanka',
    price: 10000000,
    type: 'sale',
    bedrooms: 3,
    bathrooms: 2,
    area: 1450,
    furnished: 'unfurnished',
    deposit: 'N/A',
    availability: 'Under Construction',
    amenities: ['Swimming Pool', 'Gym', 'Clubhouse', 'Landscaped Garden', 'Power Backup', 'Lift', '24/7 Security', 'Wellness Center', 'Multipurpose Hall', 'Sports Facilities'],
    highlights: ['Comprehensive lifestyle amenities', '1, 3 & 4 BHK configurations', '700 to 2926 sqft options', 'Well-connected to Yelahanka'],
    images: imgList('brigade-eternia', 14, 'png'),
    description: 'Brigade Eternia is a thoughtfully designed residential project in Yelahanka New Town. It offers a comprehensive range of lifestyle, wellness, and recreational amenities for all age groups. Available in 1, 3 & 4 BHK apartment configurations ranging from 700 to 2926 sqft. Starting at ₹1.0 Cr.',
    contactEmail: 'trishnaproperties78@gmail.com',
    mapQuery: 'Brigade Eternia, Yelahanka New Town, Bangalore',
    reviews: generateReviews(4),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440012',
    title: 'Brigade Insignia — Ultra Luxury',
    location: 'Devinagar, Bangalore',
    areaName: 'Devinagar',
    price: 32000000,
    type: 'sale',
    bedrooms: 4,
    bathrooms: 4,
    area: 3200,
    furnished: 'semi',
    deposit: 'N/A',
    availability: 'Ready to Move',
    amenities: ['Grand Clubhouse', 'Rooftop Leisure', 'Swimming Pool', 'Gym', 'Landscaped Garden', '24/7 Security', 'Concierge', 'Lift', 'Covered Parking', 'Power Backup', 'Sports Court'],
    highlights: ['5.88 acres with 6 towers & 60% green area', '3, 4 & 5 BHK + Penthouse options', '2145 to 4200 sqft configurations', 'Grand clubhouse & rooftop leisure'],
    images: imgList('brigade-insignia', 8, 'jpg'),
    description: 'Brigade Insignia is an ultra-luxury residential development in Maruti Nagar, Devinagar. Spread across 5.88 acres with 6 towers and 60% green area, it features premium lifestyle amenities including a grand clubhouse, rooftop leisure spaces, and world-class recreational facilities. Available in 3, 4, 5 BHK & Penthouse configurations from 2145 to 4200 sqft. Starting at ₹3.2 Cr.',
    contactEmail: 'trishnaproperties78@gmail.com',
    mapQuery: 'Brigade Insignia, Devinagar, Bangalore',
    reviews: generateReviews(5),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440013',
    title: 'Independent House — Kaggadasapura',
    location: 'Kaggadasapura, Bangalore',
    areaName: 'Kaggadasapura',
    price: 14000000,
    type: 'sale',
    bedrooms: 2,
    bathrooms: 2,
    area: 760,
    furnished: 'unfurnished',
    deposit: 'N/A',
    availability: 'Ready to Move',
    amenities: ['Independent House', 'Water Supply', 'Power Backup', 'Parking Space'],
    highlights: ['760 sqft independent house', 'Ready to move in', 'Prime Kaggadasapura location', 'Excellent connectivity to Old Airport Road'],
    images: imgList('kaggadasapura', 2),
    description: 'Independent house for sale in Kaggadasapura, one of East Bangalore\'s well-connected residential areas. This 760 sqft property offers excellent connectivity to Old Airport Road and IT corridors. Ready to move in at ₹1.4 Cr. Ideal for end-users and investors looking for a compact property in a prime location.',
    contactEmail: 'trishnaproperties78@gmail.com',
    mapQuery: 'Kaggadasapura, Bangalore',
    reviews: generateReviews(3),
  },

  // ─── GODREJ PROPERTIES (SALE) ─────────────────
  {
    id: '550e8400-e29b-41d4-a716-446655440014',
    title: 'Godrej Lakeside Orchard — Premium Living',
    location: 'Kodathi, Sarjapur Road, Bangalore',
    areaName: 'Sarjapur Road',
    price: 15000000,
    type: 'sale',
    bedrooms: 3,
    bathrooms: 2,
    area: 1508,
    furnished: 'unfurnished',
    deposit: 'N/A',
    availability: 'Under Construction',
    facing: 'East',
    amenities: ['Grand Clubhouse', 'Swimming Pool', 'Gym', 'Tennis Court', 'Jogging Track', 'Amphitheater', "Children's Play Area", '24/7 Security', 'Power Backup', 'Landscaped Garden', 'Viewing Deck', 'Indoor Games'],
    highlights: ['Grand 48,000 sqft clubhouse', '2, 3, 3.5, 4 & 4.5 BHK configurations', '1,215 to 2,668 sqft options', 'Godrej Properties — trusted developer', 'Near Wipro SEZ & IT parks'],
    images: imgListMixed('godrej-lakeside', ['jpg','jpg','jpg','jpg','jpg','jpg','jpg','png','jpg']),
    description: 'Godrej Lakeside Orchard is a premium residential project in Kodathi, off Sarjapur Road. Featuring a grand 48,000 sqft clubhouse and 50+ luxury amenities, this high-rise development offers studio to 4.5 BHK configurations from 1,215 to 2,668 sqft. Near RGA Tech Park, Wipro SEZ, and major IT hubs. Possession from 2028–2030. Starting at ₹1.5 Cr.',
    contactEmail: 'trishnaproperties78@gmail.com',
    mapQuery: 'Godrej Lakeside Orchard, Kodathi, Sarjapur Road, Bangalore',
    reviews: generateReviews(4),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440015',
    title: 'Godrej Vanantara — Forest-Themed Township',
    location: 'Bannerghatta Road, South Bangalore',
    areaName: 'Bannerghatta Road',
    price: 15700000,
    type: 'sale',
    bedrooms: 2,
    bathrooms: 2,
    area: 1250,
    furnished: 'unfurnished',
    deposit: 'N/A',
    availability: 'Under Construction',
    amenities: ['Grand Clubhouse', 'Swimming Pool', 'Cricket Stadium', 'Forest Trails', 'Gym', 'Jogging Track', "Children's Play Area", 'Pet Park', 'BBQ Zone', '24/7 Security', 'Power Backup', 'Landscaped Garden'],
    highlights: ['36-acre forest-themed township', '93% open & green spaces', '70,000+ sqft grand clubhouse', '2, 3 & 4.5 BHK configurations', 'Godrej Properties — trusted developer'],
    images: imgListMixed('godrej-vanantara', ['jpg','png','jpg','jpg','jpg','jpg','png','png','png','png']),
    description: 'Godrej Vanantara is an ultra-luxury forest-themed township off Bannerghatta Road, South Bangalore. Spread across 36 acres with 93% open spaces, 4,500+ trees, and forest trails, it redefines nature-centric living. Features a 70,000+ sqft clubhouse, cricket stadium, and premium amenities. Available in 2, 3 & 4.5 BHK from 1,250 to 2,900+ sqft. Starting at ₹1.57 Cr. Possession December 2031.',
    contactEmail: 'trishnaproperties78@gmail.com',
    mapQuery: 'Godrej Vanantara, Bannerghatta Road, Bangalore',
    reviews: generateReviews(5),
  },

  // ─── MAHINDRA LIFESPACES (SALE) ───────────────
  {
    id: '550e8400-e29b-41d4-a716-446655440016',
    title: 'Mahindra Blossom — Whitefield Premium',
    location: 'Hope Farm Junction, Whitefield, Bangalore',
    areaName: 'Whitefield',
    price: 20000000,
    type: 'sale',
    bedrooms: 2,
    bathrooms: 2,
    area: 1250,
    furnished: 'unfurnished',
    deposit: 'N/A',
    availability: 'Under Construction',
    amenities: ['Grand Clubhouse', 'Infinity Pool', 'Gym', 'Yoga Deck', 'Sports Courts', 'Jogging Track', 'Landscaped Garden', "Children's Play Area", 'Party Hall', '24/7 Security', 'EV Charging', 'Crèche'],
    highlights: ['97,000 sqft grand clubhouse', '2, 3, 3.5 & 4 BHK configurations', 'IGBC Green Home pre-certified', 'Net Zero Waste community', 'Adjacent to metro station'],
    images: imgListMixed('mahindra-blossom', ['jpg','jpg','jpg','jpg','png','png','png','png','png','png','jpg','jpg','jpg']),
    description: 'Mahindra Blossom is a premium eco-friendly residential project at Hope Farm Junction, Whitefield. Featuring a massive 97,000 sqft clubhouse, infinity pool, and 40+ world-class amenities. IGBC Green Home pre-certified with Net Zero Waste design. Available in 2, 3, 3.5 & 4 BHK from 1,250 to 2,450 sqft. Adjacent to Hopefarm Channasandra Metro Station. Starting at ₹2.0 Cr. Possession October 2030.',
    contactEmail: 'trishnaproperties78@gmail.com',
    mapQuery: 'Mahindra Blossom, Whitefield, Bangalore',
    reviews: generateReviews(4),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440017',
    title: 'Mahindra Zen — Nature-Crafted Homes',
    location: 'Singasandra, off Hosur Road, Bangalore',
    areaName: 'Singasandra',
    price: 18800000,
    type: 'sale',
    bedrooms: 3,
    bathrooms: 2,
    area: 1337,
    furnished: 'unfurnished',
    deposit: 'N/A',
    availability: 'Under Construction',
    amenities: ['Clubhouse', 'Infinity Pool', 'Gym', 'Yoga Deck', 'Cricket Box', 'Jogging Track', 'Landscaped Garden', "Children's Play Area", 'Smart Home', 'EV Charging', '24/7 Security', 'Power Backup'],
    highlights: ['3, 3.5 & 4 BHK configurations', 'IGBC-certified sustainable design', 'Smart home technology', 'Near Electronic City & HSR Layout', 'Upcoming metro connectivity'],
    images: imgList('mahindra-zen', 8, 'jpg'),
    description: 'Mahindra Zen is a premium nature-crafted residential project in Singasandra, off Hosur Road. Featuring IGBC-certified sustainable design, smart home technology, and 30+ luxury amenities including infinity pool and yoga deck. Available in 3, 3.5 & 4 BHK from 1,337 to 2,410 sqft. Near Electronic City, HSR Layout, and upcoming metro stations. Starting at ₹1.88 Cr. Possession December 2028.',
    contactEmail: 'trishnaproperties78@gmail.com',
    mapQuery: 'Mahindra Zen, Singasandra, Hosur Road, Bangalore',
    reviews: generateReviews(5),
  },
];

// Export mutable reference (will be overridden by Zustand store)
export let properties: Property[] = [...defaultProperties];

export const locations = [
  { name: 'Murgeshpalya', count: 7, image: '/properties/murgeshpalya-65k/murgeshpalya-65k-01.jpeg' },
  { name: 'CV Raman Nagar', count: 1, image: '/properties/cv-raman-nagar/cv-raman-nagar-01.jpeg' },
  { name: 'GM Palya', count: 1, image: '/properties/gm-palya/gm-palya-01.jpeg' },
  { name: 'Bommasandra', count: 1, image: '/properties/brigade-valencia/brigade-valencia-01.jpg' },
  { name: 'Yelahanka', count: 1, image: '/properties/brigade-eternia/brigade-eternia-01.png' },
  { name: 'Kaggadasapura', count: 1, image: '/properties/kaggadasapura/kaggadasapura-01.jpeg' },
  { name: 'Sarjapur Road', count: 1, image: '/properties/godrej-lakeside/godrej-lakeside-01.jpg' },
  { name: 'Bannerghatta Road', count: 1, image: '/properties/godrej-vanantara/godrej-vanantara-01.jpg' },
  { name: 'Whitefield', count: 1, image: '/properties/mahindra-blossom/mahindra-blossom-01.jpg' },
  { name: 'Singasandra', count: 1, image: '/properties/mahindra-zen/mahindra-zen-01.jpg' },
];
