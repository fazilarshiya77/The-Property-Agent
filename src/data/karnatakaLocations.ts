// Karnataka administrative hierarchy: District → Taluk.
// Source: Government of Karnataka district/taluk structure (31 districts, ~230 taluks).
// City/Town/Village and Locality are left as free text in the admin form since an
// exhaustive village-level dataset isn't practical to hardcode — the district/taluk
// level is what powers location-based filtering and search.

export const KARNATAKA_DISTRICTS = [
  'Bagalkote',
  'Ballari',
  'Belagavi',
  'Bengaluru Urban',
  'Bengaluru Rural',
  'Bidar',
  'Chamarajanagara',
  'Chikkaballapura',
  'Chikkamagaluru',
  'Chitradurga',
  'Dakshina Kannada',
  'Davanagere',
  'Dharwad',
  'Gadag',
  'Hassan',
  'Haveri',
  'Kalaburagi',
  'Kodagu',
  'Kolar',
  'Koppala',
  'Mandya',
  'Mysuru',
  'Raichuru',
  'Ramanagara',
  'Shivamogga',
  'Tumakuru',
  'Udupi',
  'Uttara Kannada',
  'Vijayapura',
  'Vijayanagara',
  'Yadagiri',
] as const;

export type KarnatakaDistrict = typeof KARNATAKA_DISTRICTS[number];

export const TALUKS_BY_DISTRICT: Record<KarnatakaDistrict, string[]> = {
  'Bagalkote': ['Bagalkote', 'Jamkhandi', 'Mudhola', 'Badami', 'Bilagi', 'Hunagunda', 'Ilkal', 'Rabkavi Banhatti', 'Guledgudda'],
  'Ballari': ['Ballari', 'Kurugodu', 'Kampli', 'Sanduru', 'Siraguppa'],
  'Belagavi': ['Belagavi', 'Athani', 'Bailhongal', 'Chikkodi', 'Gokak', 'Khanapura', 'Mudalgi', 'Nippani', 'Rayabaga', 'Savadatti', 'Ramadurga', 'Kagawada', 'Hukkeri', 'Kitturu', 'Yargatti'],
  'Bengaluru Urban': ['Bengaluru', 'Kengeri', 'Krishnarajapura', 'Anekal', 'Yelahanka'],
  'Bengaluru Rural': ['Nelamangala', 'Doddaballapura', 'Devanahalli', 'Hosakote'],
  'Bidar': ['Aurad', 'Basavakalyana', 'Bhalki', 'Bidar', 'Chitgoppa', 'Hulsuru', 'Humnabad', 'Kamalanagara'],
  'Chamarajanagara': ['Chamarajanagara', 'Gundlupete', 'Kollegala', 'Yelanduru', 'Hanuru'],
  'Chikkaballapura': ['Chikkaballapura', 'Bagepalli', 'Chintamani', 'Gauribidanuru', 'Gudibanda', 'Sidlaghatta', 'Cheluru', 'Manchenahalli'],
  'Chikkamagaluru': ['Chikkamagaluru', 'Kaduru', 'Koppa', 'Mudigere', 'Narasimharajapura', 'Sringeri', 'Tarikere', 'Ajjampura', 'Kalasa'],
  'Chitradurga': ['Chitradurga', 'Challakere', 'Hiriyur', 'Holalkere', 'Hosadurga', 'Molakalmuru'],
  'Dakshina Kannada': ['Mangaluru', 'Ullal', 'Mulki', 'Moodbidri', 'Bantwala', 'Belathangadi', 'Putturu', 'Sulya', 'Kadaba'],
  'Davanagere': ['Davanagere', 'Harihara', 'Channagiri', 'Honnali', 'Nyamathi', 'Jagaluru'],
  'Dharwad': ['Kalghatgi', 'Dharwad', 'Hubballi (Rural)', 'Hubballi (Urban)', 'Kundagolu', 'Navalgunda', 'Alnavara', 'Annigeri'],
  'Gadag': ['Gadag', 'Naragunda', 'Mundaragi', 'Rona', 'Gajendragada', 'Lakshmeshwara', 'Shirahatti'],
  'Hassan': ['Hassan', 'Arasikere', 'Channarayapattana', 'Holenarsipura', 'Sakleshpura', 'Aluru', 'Arakalagudu', 'Beluru'],
  'Haveri': ['Ranibennur', 'Byadgi', 'Hangala', 'Haveri', 'Savanuru', 'Hirekeruru', 'Shiggavi', 'Rattihalli'],
  'Kalaburagi': ['Kalaburagi', 'Afzalpura', 'Alanda', 'Chincholi', 'Chitapura', 'Jevargi', 'Sedam', 'Kamalapura', 'Shahabad', 'Kalgi', 'Yedrami'],
  'Kodagu': ['Madikeri', 'Somawarapete', 'Virajapete', 'Ponnammapete', 'Kushalnagara'],
  'Kolar': ['Kolar', 'Bangarapete', 'Maluru', 'Mulabagilu', 'Srinivasapura', 'Kolar Gold Fields'],
  'Koppala': ['Koppala', 'Gangavathi', 'Kushtagi', 'Yelaburga', 'Kanakagiri', 'Karatagi', 'Kukanuru'],
  'Mandya': ['Mandya', 'Madduru', 'Malavalli', 'Srirangapattana', 'Krishnarajapete', 'Nagamangala', 'Pandavapura'],
  'Mysuru': ['Mysuru', 'Hunasuru', 'Krishnarajanagara', 'Nanjanagodu', 'Heggadadevanakote', 'Piriyapattana', 'Tirumakudalu Narasipura', 'Saraguru', 'Saligrama'],
  'Raichuru': ['Raichuru', 'Sindhanuru', 'Manvi', 'Devadurga', 'Lingasaguru', 'Mudgal', 'Maski', 'Sirawara'],
  'Ramanagara': ['Ramanagara', 'Magadi', 'Kanakapura', 'Channapattana', 'Harohalli'],
  'Shivamogga': ['Shivamogga', 'Sagara', 'Bhadravathi', 'Hosanagara', 'Shikaripura', 'Soraba', 'Tirthahalli'],
  'Tumakuru': ['Tumakuru', 'Chikkanayakanahalli', 'Kunigal', 'Madhugiri', 'Sira', 'Tipturu', 'Gubbi', 'Koratagere', 'Pavagada', 'Turuvekere'],
  'Udupi': ['Udupi', 'Kapu', 'Bynduru', 'Karkala', 'Kundapura', 'Hebri', 'Brahmavara'],
  'Uttara Kannada': ['Karwara', 'Sirsi', 'Joida', 'Dandeli', 'Bhatkal', 'Kumta', 'Ankola', 'Haliyal', 'Honnavara', 'Mundagodu', 'Siddapura', 'Yellapura'],
  'Vijayapura': ['Vijayapura', 'Indi', 'Basavana Bagewadi', 'Sindgi', 'Muddebihala', 'Talikote', 'Devara Hipparagi', 'Chadchana', 'Tikote', 'Babaleshwara', 'Kolhara', 'Nidagundi', 'Alamela'],
  'Vijayanagara': ['Hosapete', 'Hagaribommanahalli', 'Harapanahalli', 'Hoovina Hadagali', 'Kudligi', 'Kotturu'],
  'Yadagiri': ['Yadagiri', 'Shahapura', 'Surapura', 'Gurmitkala', 'Vadagera', 'Hunsagi'],
};

export function getTaluks(district: string): string[] {
  return TALUKS_BY_DISTRICT[district as KarnatakaDistrict] || [];
}
