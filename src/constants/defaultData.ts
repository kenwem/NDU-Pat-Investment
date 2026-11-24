export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  image: string;
  features: string[];
  position: number;
}

export interface ProductVariation {
  name: string;
  price: string;
  salePrice?: string;
}

export interface ProductItem {
  id: string;
  name: string;
  category?: string;
  brand?: string;
  subCategory?: string;
  price: string;
  salePrice?: string;
  stock?: number;
  imageUrl: string;
  shortDescription: string;
  position: number;
  variations?: ProductVariation[];
}

export interface BookItem {
  id: string;
  title: string;
  author: string;
  price: string;
  status: 'Draft' | 'Published';
  coverImage: string;
  preface: string;
  position: number;
}

export interface TestimonialItem {
  id: string;
  text: string;
  author: string;
  location: string;
  position: number;
}

export interface EditorialItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  date: string;
  image: string;
  status: 'Draft' | 'Published';
  featured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  focusKeywords?: string;
  position: number;
}

const IMG = {
  keyboard: '/src/assets/images/prod_yamaha_keyboard_1795532845708.jpg',
  guitar: '/src/assets/images/prod_yamaha_guitar_1795532846928.jpg',
  brass: '/src/assets/images/prod_yamaha_brass_1795532847577.jpg',
  speakers: '/src/assets/images/prod_speakers_pro_1795532846737.jpg',
  mics: '/src/assets/images/prod_microphones_1795532847121.jpg',
  amps: '/src/assets/images/prod_amplifiers_1795532848342.jpg',
  mixer: '/src/assets/images/prod_audio_mixer_1795532848925.jpg',
  drums: '/src/assets/images/prod_drumset_kits_1795532850539.jpg',
  pa: '/src/assets/images/prod_pa_horn_system_1795532849761.jpg',
  studio: '/src/assets/images/prod_studio_gear_1795532850538.jpg',
  cables: '/src/assets/images/prod_cables_connectors_1795532850538.jpg',
  showroom: '/src/assets/images/hero_products_showroom_1795532851950.jpg',
  workshop: '/src/assets/images/hero_services_workshop_1795532851823.jpg',
  stage: '/src/assets/images/hero_testimonials_gear_1795532948615.jpg',
};

export const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: 'service-seed-1',
    title: 'Instrument Sales & Sound Advisory',
    description:
      'Dealers in all kinds of musical instruments, Public Address systems, and General Goods — supplying soloists, churches, schools, and touring bands with authentic Yamaha, JBL, Shure, Pearl, and Ahuja equipment.',
    icon: 'ShieldCheck',
    image: IMG.showroom,
    features: [
      'Factory-verified Yamaha keyboards, guitars, saxophones, and trumpets',
      'Side-by-side showroom auditioning at BB7C, Alaba Int’l Market',
      'Institutional bulk procurement for schools, bands, and churches',
    ],
    position: 1,
  },
  {
    id: 'service-seed-2',
    title: 'Luthier Repairs & Precision Tuning',
    description:
      'Dedicated master repair bench handling guitar setups, fret leveling, acoustic bridge restoration, brass valve servicing, and keyboard keybed calibration.',
    icon: 'Award',
    image: IMG.workshop,
    features: [
      'Neck relief, intonation, and action setup for acoustic & electric guitars',
      'Digital keyboard key sensor servicing and contact cleaning',
      'Drum bearing-edge re-heading and brass pad & valve alignment',
    ],
    position: 2,
  },
  {
    id: 'service-seed-3',
    title: 'Public Address & Sanctuary Acoustics',
    description:
      'End-to-end Public Address installation, amplifier matching, multi-channel mixer routing, horn speaker mounting, and line-array calibration for West African venues.',
    icon: 'Heart',
    image: IMG.mixer,
    features: [
      'Powered & standard audio mixer routing (4, 8 & 12-channel systems)',
      'Ahuja, World King & Sonoko PA horn and active speaker setups',
      'Post-installation crew training and ongoing maintenance support',
    ],
    position: 3,
  },
  {
    id: 'service-seed-4',
    title: 'Studio Outfitting & Live Sound Support',
    description:
      'Complete home and commercial recording studio setup featuring Focusrite, M-Audio, and Icon Star interfaces paired with balanced cabling and stage microphones.',
    icon: 'GraduationCap',
    image: IMG.studio,
    features: [
      'Focusrite & M-Audio interface, studio monitor, and mic pairing',
      'Custom-terminated XLR, Speakon, and TRS audio cable looms',
      'Live stage microphone and wireless UHF frequency coordination',
    ],
    position: 4,
  },
];

export const DEFAULT_PRODUCTS: ProductItem[] = [
  // A. Musical Instruments
  {
    id: 'prod-yamaha-keyboard',
    name: 'Yamaha Arranger & Stage Keyboards (PSR Series)',
    category: 'Musical Instruments',
    brand: 'Yamaha',
    subCategory: 'Keyboards',
    price: '₦1,350,000',
    salePrice: '₦1,280,000',
    stock: 10,
    imageUrl: IMG.keyboard,
    shortDescription:
      'Authentic 61-key Yamaha arranger workstation keyboards with expressive Afrobeat & orchestral voices, joystick control, and crisp stereo output for stage and church.',
    position: 1,
    variations: [
      { name: 'Yamaha PSR-E473 (61-Key)', price: '₦520,000' },
      { name: 'Yamaha PSR-SX700 Workstation', price: '₦1,350,000', salePrice: '₦1,280,000' },
    ],
  },
  {
    id: 'prod-yamaha-guitar',
    name: 'Yamaha Acoustic & Acoustic-Electric Guitars',
    category: 'Musical Instruments',
    brand: 'Yamaha',
    subCategory: 'Guitars',
    price: '₦265,000',
    salePrice: '₦245,000',
    stock: 18,
    imageUrl: IMG.guitar,
    shortDescription:
      'Solid spruce and tonewood Yamaha dreadnought & classical guitars calibrated in our Alaba showroom for smooth string action and warm projection.',
    position: 2,
    variations: [
      { name: 'Yamaha F310 Acoustic', price: '₦245,000' },
      { name: 'Yamaha FX310A Acoustic-Electric', price: '₦360,000' },
    ],
  },
  {
    id: 'prod-yamaha-saxophone',
    name: 'Yamaha Gold Lacquer Saxophones (Alto & Tenor)',
    category: 'Musical Instruments',
    brand: 'Yamaha',
    subCategory: 'Saxophones',
    price: '₦1,480,000',
    stock: 6,
    imageUrl: IMG.brass,
    shortDescription:
      'Original Yamaha YAS-280 / YTS series brass saxophones featuring balanced keywork, responsive high F# key, hard case, mouthpiece, and neck strap.',
    position: 3,
  },
  {
    id: 'prod-yamaha-trumpet',
    name: 'Yamaha Standard & Concert Bb Trumpets',
    category: 'Musical Instruments',
    brand: 'Yamaha',
    subCategory: 'Trumpets',
    price: '₦690,000',
    stock: 8,
    imageUrl: IMG.brass,
    shortDescription:
      'Precision monel-alloy valve Yamaha Bb trumpet delivering bright ensemble tone, accurate intonation, and durable gold-lacquer brass body.',
    position: 4,
  },

  // B. Speakers & Sound Systems
  {
    id: 'prod-speaker-jbl',
    name: 'JBL Active Speakers & Powered Subwoofers',
    category: 'Speakers & Sound Systems',
    brand: 'JBL',
    subCategory: 'Active Speakers & Subwoofers',
    price: '₦1,150,000',
    stock: 9,
    imageUrl: IMG.speakers,
    shortDescription:
      'High-headroom JBL EON & PRX Series active loudspeakers and 18-inch subwoofers engineered for crystal vocals and deep sub-bass in auditoriums and outdoor events.',
    position: 5,
    variations: [
      { name: '15" Active Full-Range Speaker', price: '₦1,150,000' },
      { name: '18" Active Subwoofer Cabinet', price: '₦1,650,000' },
    ],
  },
  {
    id: 'prod-speaker-sound-praise',
    name: 'Sound Praise (SP) Active, Subwoofer & Ceiling Speakers',
    category: 'Speakers & Sound Systems',
    brand: 'Sound Praise (SP)',
    subCategory: 'Active Speakers, Subwoofers & Ceiling Speakers',
    price: '₦480,000',
    stock: 14,
    imageUrl: IMG.speakers,
    shortDescription:
      'Trusted Sound Praise (SP) pro loudspeakers across active PA cabinets, deep subwoofers, and recessed ceiling speaker models built for continuous church and hall duty.',
    position: 6,
    variations: [
      { name: 'Ceiling Speaker (Pair)', price: '₦145,000' },
      { name: '15" Active Loudspeaker', price: '₦480,000' },
      { name: '18" Subwoofer', price: '₦720,000' },
    ],
  },
  {
    id: 'prod-speaker-blackstar',
    name: 'Blackstar Stage Speakers & Guitar Cabinets',
    category: 'Speakers & Sound Systems',
    brand: 'Blackstar',
    subCategory: 'Active Speakers & Cabinets',
    price: '₦590,000',
    stock: 7,
    imageUrl: IMG.speakers,
    shortDescription:
      'Punchy Blackstar stage monitors, instrument speaker cabinets, and powered reinforcement units crafted for tight midrange clarity.',
    position: 7,
  },
  {
    id: 'prod-speaker-mog',
    name: 'MOG Ceiling Speakers & Outdoor Horn Speakers',
    category: 'Speakers & Sound Systems',
    brand: 'MOG',
    subCategory: 'Ceiling & Horn Speakers',
    price: '₦125,000',
    stock: 20,
    imageUrl: IMG.pa,
    shortDescription:
      'Crisp MOG recessed ceiling speakers for offices, sanctuaries, and halls plus weatherproof outdoor horn speakers with clean speech intelligibility.',
    position: 8,
    variations: [
      { name: 'MOG Ceiling Speaker', price: '₦125,000' },
      { name: 'MOG Outdoor Horn Speaker', price: '₦155,000' },
    ],
  },

  // C. Microphones
  {
    id: 'prod-mic-shure-wired',
    name: 'Shure Wired Vocal & Instrument Microphones',
    category: 'Microphones',
    brand: 'Shure',
    subCategory: 'Wired Microphones',
    price: '₦145,000',
    stock: 25,
    imageUrl: IMG.mics,
    shortDescription:
      'Industry-standard Shure cardioid dynamic wired microphones with pneumatic shock mount and steel mesh grille for feedback-free vocals and snare/amp miking.',
    position: 9,
  },
  {
    id: 'prod-mic-shure-wireless',
    name: 'Shure Wireless Handheld Microphone Systems',
    category: 'Microphones',
    brand: 'Shure',
    subCategory: 'Wireless Microphones',
    price: '₦420,000',
    salePrice: '₦395,000',
    stock: 12,
    imageUrl: IMG.mics,
    shortDescription:
      'Long-range UHF dual and single-channel Shure wireless microphone kits featuring interference-free diversity reception for pastors, MCs, and live vocalists.',
    position: 10,
  },
  {
    id: 'prod-mic-shure-conference',
    name: 'Shure Gooseneck Conference Microphone',
    category: 'Microphones',
    brand: 'Shure',
    subCategory: 'Conference Microphones',
    price: '₦210,000',
    stock: 10,
    imageUrl: IMG.mics,
    shortDescription:
      'High-sensitivity condenser gooseneck podium and boardroom conference microphone delivering crisp speech capture with heavy-duty mute base.',
    position: 11,
  },
  {
    id: 'prod-mic-mog-conference',
    name: 'MOG Desktop & Podium Conference Microphone',
    category: 'Microphones',
    brand: 'MOG',
    subCategory: 'Conference Microphones',
    price: '₦165,000',
    stock: 14,
    imageUrl: IMG.mics,
    shortDescription:
      'Flexible dual-capsule MOG conference microphone engineered for altars, council chambers, and lecture halls with clean RFI shielding.',
    position: 12,
  },
  {
    id: 'prod-mic-prohero-conference',
    name: 'Pro-Hero Wireless & Wired Conference Mic Systems',
    category: 'Microphones',
    brand: 'Pro-Hero',
    subCategory: 'Conference Microphones',
    price: '₦240,000',
    stock: 9,
    imageUrl: IMG.mics,
    shortDescription:
      'Multi-unit Pro-Hero conference microphone set offering independent channel volume, low handling noise, and extended transmission stability.',
    position: 13,
  },
  {
    id: 'prod-mic-nice-conference',
    name: 'Nice Conference & Lectern Microphone',
    category: 'Microphones',
    brand: 'Nice',
    subCategory: 'Conference Microphones',
    price: '₦130,000',
    stock: 16,
    imageUrl: IMG.mics,
    shortDescription:
      'Reliable Nice gooseneck conference microphone with illuminated status ring and wide voice-clarity response for meetings and houses of worship.',
    position: 14,
  },

  // D. Amplifiers
  {
    id: 'prod-amp-yamaha',
    name: 'Yamaha Professional Rackmount Power Amplifiers',
    category: 'Amplifiers',
    brand: 'Yamaha',
    subCategory: 'Power Amplifiers',
    price: '₦890,000',
    stock: 8,
    imageUrl: IMG.amps,
    shortDescription:
      'High-efficiency Yamaha dual-channel power amplifiers with clean dynamic headroom, thermal protection, and Speakon/binding-post outputs for full-range and sub stacks.',
    position: 15,
  },
  {
    id: 'prod-amp-ahuja',
    name: 'Ahuja PA & 100V Line Power Amplifiers',
    category: 'Amplifiers',
    brand: 'Ahuja',
    subCategory: 'PA Amplifiers',
    price: '₦320,000',
    salePrice: '₦295,000',
    stock: 15,
    imageUrl: IMG.amps,
    shortDescription:
      'Genuine heavy-duty Ahuja PA amplifiers built to power horn speakers, column arrays, and auditorium systems continuously with stable thermal management.',
    position: 16,
  },

  // E. Audio Mixers
  {
    id: 'prod-mixer-yamaha-standard',
    name: 'Yamaha Standard Audio Mixers (4 / 8 / 12-Channel)',
    category: 'Audio Mixers',
    brand: 'Yamaha',
    subCategory: 'Standard Audio Mixers',
    price: '₦295,000',
    stock: 12,
    imageUrl: IMG.mixer,
    shortDescription:
      'Studio-quiet Yamaha MG-series standard mixing consoles equipped with D-PRE mic preamps, 1-knob compressors, and onboard SPX digital effects.',
    position: 17,
    variations: [
      { name: '4-Channel Standard Mixer', price: '₦215,000' },
      { name: '8-Channel Standard Mixer', price: '₦295,000' },
      { name: '12-Channel Standard Mixer', price: '₦435,000' },
    ],
  },
  {
    id: 'prod-mixer-yamaha-powered',
    name: 'Yamaha Powered Audio Mixers (4 / 8 / 12-Channel)',
    category: 'Audio Mixers',
    brand: 'Yamaha',
    subCategory: 'Powered Mixers',
    price: '₦560,000',
    stock: 8,
    imageUrl: IMG.mixer,
    shortDescription:
      'All-in-one Yamaha EMX powered mixers combining built-in high-wattage amplifiers, feedback suppression, and dual FX processors for churches and live bands.',
    position: 18,
    variations: [
      { name: '4-Channel Powered Mixer', price: '₦440,000' },
      { name: '8-Channel Powered Mixer', price: '₦560,000' },
      { name: '12-Channel Powered Mixer', price: '₦780,000' },
    ],
  },
  {
    id: 'prod-mixer-sp-powered',
    name: 'Sound Praise (SP) Powered Mixers (4 / 8 / 12-Channel)',
    category: 'Audio Mixers',
    brand: 'Sound Praise (SP)',
    subCategory: 'Powered Mixers',
    price: '₦340,000',
    stock: 11,
    imageUrl: IMG.mixer,
    shortDescription:
      'High-output Sound Praise (SP) powered mixers with USB MP3 playback, Bluetooth streaming, 7-band graphic EQ, and clean power amplification.',
    position: 19,
    variations: [
      { name: '4-Channel SP Powered Mixer', price: '₦255,000' },
      { name: '8-Channel SP Powered Mixer', price: '₦340,000' },
      { name: '12-Channel SP Powered Mixer', price: '₦490,000' },
    ],
  },

  // F. Drum Sets
  {
    id: 'prod-drum-pearl',
    name: 'Pearl Standard 5-Piece Acoustic Drum Set',
    category: 'Drum Sets',
    brand: 'Pearl',
    subCategory: 'Standard Drum Sets',
    price: '₦1,120,000',
    stock: 5,
    imageUrl: IMG.drums,
    shortDescription:
      'Pearl Roadshow / Export 5-piece hardwood drum kit complete with snare, double-braced stands, bass pedal, hi-hat stand, and cymbal pack.',
    position: 20,
  },
  {
    id: 'prod-drum-tama',
    name: 'Tama Standard Stage Acoustic Drum Set',
    category: 'Drum Sets',
    brand: 'Tama',
    subCategory: 'Standard Drum Sets',
    price: '₦1,180,000',
    stock: 4,
    imageUrl: IMG.drums,
    shortDescription:
      'Tama Stagestar / Imperialstar full acoustic shell pack engineered for deep kick punch, crisp snare snap, and tour-ready chrome hardware.',
    position: 21,
  },
  {
    id: 'prod-drum-db',
    name: 'DB Standard Complete Percussion Drum Set',
    category: 'Drum Sets',
    brand: 'DB',
    subCategory: 'Standard Drum Sets',
    price: '₦640,000',
    salePrice: '₦595,000',
    stock: 7,
    imageUrl: IMG.drums,
    shortDescription:
      'Dependable DB 5-piece acoustic drum kit with throne, cymbals, sticks, and heavy-duty hardware ideal for churches, schools, and rehearsal rooms.',
    position: 22,
  },
  {
    id: 'prod-drum-yamaha',
    name: 'Yamaha Standard & Parade Drum Sets',
    category: 'Drum Sets',
    brand: 'Yamaha',
    subCategory: 'Standard & Parade Drum Sets',
    price: '₦1,250,000',
    stock: 6,
    imageUrl: IMG.drums,
    shortDescription:
      'Authentic Yamaha Rydeen / Stage Custom 5-piece acoustic kits and high-tension Yamaha marching parade drum sets built for projection and durability.',
    position: 23,
    variations: [
      { name: 'Yamaha Standard 5-Piece Kit', price: '₦1,250,000' },
      { name: 'Yamaha Parade Drum Set', price: '₦540,000' },
    ],
  },
  {
    id: 'prod-drum-parade-standard',
    name: 'Standard Marching Parade Drum Set',
    category: 'Drum Sets',
    brand: 'Standard',
    subCategory: 'Parade Drum Sets',
    price: '₦310,000',
    stock: 10,
    imageUrl: IMG.drums,
    shortDescription:
      'Lightweight parade marching snare, tenor trio, and bass drum assembly with padded shoulder carriers and beaters for school bands and brigades.',
    position: 24,
  },

  // G. Public Address (PA) Systems
  {
    id: 'prod-pa-world-king',
    name: 'World King Public Address (PA) Systems',
    category: 'Public Address (PA) Systems',
    brand: 'World King',
    subCategory: 'PA Systems',
    price: '₦280,000',
    stock: 12,
    imageUrl: IMG.pa,
    shortDescription:
      'Powerful World King portable & hall Public Address systems with wireless mics, rechargeable backup battery, Bluetooth, and wide-dispersion horn projection.',
    position: 25,
  },
  {
    id: 'prod-pa-sonoko',
    name: 'Sonoko Public Address Sound Systems',
    category: 'Public Address (PA) Systems',
    brand: 'Sonoko',
    subCategory: 'PA Systems',
    price: '₦245,000',
    stock: 14,
    imageUrl: IMG.pa,
    shortDescription:
      'Clear voice-focused Sonoko PA systems designed for evangelism, classrooms, community announcements, and mobile events.',
    position: 26,
  },
  {
    id: 'prod-pa-modern-day',
    name: 'Modern Day Portable PA Sound Systems',
    category: 'Public Address (PA) Systems',
    brand: 'Modern Day',
    subCategory: 'PA Systems',
    price: '₦265,000',
    stock: 10,
    imageUrl: IMG.pa,
    shortDescription:
      'Rugged Modern Day Public Address rigs with dual wireless handheld microphones, USB/SD media inputs, and high-efficiency amplifier stage.',
    position: 27,
  },
  {
    id: 'prod-pa-hamarsh',
    name: 'Hamarsh Pro Public Address Systems',
    category: 'Public Address (PA) Systems',
    brand: 'Hamarsh',
    subCategory: 'PA Systems',
    price: '₦315,000',
    stock: 9,
    imageUrl: IMG.pa,
    shortDescription:
      'High-wattage Hamarsh PA amplifiers and portable public address speakers built for clear long-throw outdoor coverage.',
    position: 28,
  },
  {
    id: 'prod-pa-ahuja-horns',
    name: 'Ahuja Horn Speakers & PA Amplifier Systems',
    category: 'Public Address (PA) Systems',
    brand: 'Ahuja',
    subCategory: 'Horn Speakers & Amplifiers',
    price: '₦185,000',
    stock: 18,
    imageUrl: IMG.pa,
    shortDescription:
      'Genuine Ahuja weatherproof PA horn speakers, compression drivers, and matched Ahuja PA amplifiers for long-distance public address coverage.',
    position: 29,
    variations: [
      { name: 'Ahuja Horn Speaker + Driver', price: '₦95,000' },
      { name: 'Ahuja Amplifier + Dual Horn Kit', price: '₦460,000' },
    ],
  },

  // H. Studio Equipment
  {
    id: 'prod-studio-maudio',
    name: 'M-Audio Studio Monitors, Interfaces & MIDI Controllers',
    category: 'Studio Equipment',
    brand: 'M-Audio',
    subCategory: 'Recording & Monitoring',
    price: '₦395,000',
    stock: 10,
    imageUrl: IMG.studio,
    shortDescription:
      'Precision M-Audio M-Track audio interfaces, BX-series active studio reference monitors, and velocity-sensitive Oxygen MIDI keyboard controllers.',
    position: 30,
  },
  {
    id: 'prod-studio-focusrite',
    name: 'Focusrite Scarlett USB Audio Interfaces & Studio Packs',
    category: 'Studio Equipment',
    brand: 'Focusrite',
    subCategory: 'Audio Interfaces',
    price: '₦365,000',
    salePrice: '₦340,000',
    stock: 12,
    imageUrl: IMG.studio,
    shortDescription:
      'Ultra-clean Focusrite Scarlett Solo / 2i2 USB-C recording interfaces with Air-enabled mic preamps, headphone amp, and optional condenser mic studio bundles.',
    position: 31,
  },
  {
    id: 'prod-studio-icon-star',
    name: 'Icon Star Studio Recording Hardware & Bundles',
    category: 'Studio Equipment',
    brand: 'Icon Star',
    subCategory: 'Studio Gear',
    price: '₦235,000',
    stock: 14,
    imageUrl: IMG.studio,
    shortDescription:
      'Dependable Icon Star podcast & vocal recording interfaces, shock-mounted condenser microphones, and desktop acoustic studio packs.',
    position: 32,
  },

  // I. Audio Cables & Connectors
  {
    id: 'prod-cables-pro',
    name: 'Heavy-Duty Speaker Cables & Microphone Cables',
    category: 'Audio Cables & Connectors',
    brand: 'Pro Audio',
    subCategory: 'Cables',
    price: '₦28,000',
    stock: 45,
    imageUrl: IMG.cables,
    shortDescription:
      'Low-noise braided OFC copper microphone cables and thick-gauge pure copper speaker cables in full coils or custom stage lengths.',
    position: 33,
    variations: [
      { name: 'Microphone Cable (10m XLR)', price: '₦28,000' },
      { name: 'Heavy-Duty Speaker Cable (15m)', price: '₦45,000' },
    ],
  },
  {
    id: 'prod-connectors-pro',
    name: 'Speakon Connectors, Jack Plugs & Canon (XLR) Connectors',
    category: 'Audio Cables & Connectors',
    brand: 'Pro Audio',
    subCategory: 'Connectors & Plugs',
    price: '₦6,500',
    stock: 120,
    imageUrl: IMG.cables,
    shortDescription:
      'Pro locking Speakon loudspeaker plugs, gold-tipped 1/4-inch mono/stereo Jack plugs, and heavy-metal 3-pin Canon (XLR) male/female connectors.',
    position: 34,
    variations: [
      { name: 'Speakon Connector (4-Pole Lock)', price: '₦6,500' },
      { name: '1/4" Metal Jack Plug (Pack of 4)', price: '₦14,000' },
      { name: 'Canon XLR Connectors (Pair)', price: '₦11,000' },
    ],
  },
];

export const DEFAULT_BOOKS: BookItem[] = [];

export const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'test-seed-1',
    text: 'NDU PAT Investment outfitted our entire 2,500-seat auditorium with JBL active speakers, a 12-channel Yamaha mixer, and stage keyboards. Three years later, the clarity during live broadcasts remains unmatched.',
    author: 'Pastor Samuel Adeyemi',
    location: 'Lagos, Nigeria',
    position: 1,
  },
  {
    id: 'test-seed-2',
    text: 'As a conservatory guitar instructor, finding instruments that arrive properly intonated is rare. Chief Patrick’s team at Alaba inspects every Yamaha guitar fret and truss rod before handing it over.',
    author: 'Prof. Hippolyte N. Muyingi',
    location: 'Nairobi, Kenya',
    position: 2,
  },
  {
    id: 'test-seed-3',
    text: 'Our studio ordered Focusrite interfaces, M-Audio monitors, Shure microphones, and a Yamaha saxophone. Not only were prices fair, their sound setup advice saved us from costly mismatch mistakes.',
    author: 'Dr. Samson Ndidi Ehijinwa',
    location: 'Port Harcourt, Nigeria',
    position: 3,
  },
  {
    id: 'test-seed-4',
    text: 'We entrusted NDU PAT Investment with supplying Pearl and Yamaha parade drum sets plus Ahuja horn speakers for our school grounds. Durable gear and reliable delivery every time.',
    author: 'Mrs. Grace Mensah',
    location: 'Accra, Ghana',
    position: 4,
  },
];

export const DEFAULT_EDITORIAL: EditorialItem[] = [];
