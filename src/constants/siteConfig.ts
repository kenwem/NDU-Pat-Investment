export const siteId = 'siteB';

export const siteAdminEmail = 'kennywemson1@gmail.com';
export const additionalAdminEmails = ['osenialayo@gmail.com'];

export const isAdmin = (email: string | null | undefined): boolean => {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return (
    normalized === siteAdminEmail.toLowerCase() ||
    additionalAdminEmails.some((e) => e.toLowerCase() === normalized)
  );
};

export const DEFAULT_PRODUCT_IMAGE = '/src/assets/images/prod_yamaha_keyboard_1795532845708.jpg';
export const DEFAULT_LOGO_IMAGE = '/images/logo.svg';
export const DEFAULT_HERO_IMAGE = '/src/assets/images/hero_products_showroom_1795532851950.jpg';
export const DEFAULT_CEO_IMAGE = '/src/assets/images/hero_keyboard_player_1795454633193.jpg';

export const PAGE_HERO_IMAGES = {
  about: '/src/assets/images/hero_about_showroom_1795532852079.jpg',
  services: '/src/assets/images/hero_services_workshop_1795532851823.jpg',
  products: '/src/assets/images/hero_products_showroom_1795532851950.jpg',
  testimonials: '/src/assets/images/hero_testimonials_gear_1795532948615.jpg',
  contact: '/src/assets/images/hero_guitar_saxophone_1795454632949.jpg',
};

export const PRODUCT_CATEGORIES = [
  'Musical Instruments',
  'Speakers & Sound Systems',
  'Microphones',
  'Amplifiers',
  'Audio Mixers',
  'Drum Sets',
  'Public Address (PA) Systems',
  'Studio Equipment',
  'Audio Cables & Connectors',
] as const;

export const CATEGORY_META: Record<
  (typeof PRODUCT_CATEGORIES)[number],
  { code: string; summary: string }
> = {
  'Musical Instruments': {
    code: 'A',
    summary: 'Factory-verified Yamaha keyboards, guitars, saxophones, and trumpets.',
  },
  'Speakers & Sound Systems': {
    code: 'B',
    summary: 'Ceiling speakers, active speakers, subwoofers, and horn speakers from SP, JBL, Blackstar & MOG.',
  },
  Microphones: {
    code: 'C',
    summary: 'Wired, wireless, and conference microphones from Shure, MOG, Pro-Hero & Nice.',
  },
  Amplifiers: {
    code: 'D',
    summary: 'Tour-grade Yamaha power amplifiers and rugged Ahuja PA amplifiers.',
  },
  'Audio Mixers': {
    code: 'E',
    summary: 'Standard and powered 4-channel, 8-channel, and 12-channel audio mixers from Yamaha & Sound Praise (SP).',
  },
  'Drum Sets': {
    code: 'F',
    summary: 'Standard 5-piece acoustic drum sets (Pearl, Tama, DB, Yamaha) and parade drum sets.',
  },
  'Public Address (PA) Systems': {
    code: 'G',
    summary: 'World King, Sonoko, Modern Day & Hamarsh PA systems plus Ahuja horn speakers and amplifiers.',
  },
  'Studio Equipment': {
    code: 'H',
    summary: 'Audio interfaces, reference monitors, and studio hardware by M-Audio, Focusrite & Icon Star.',
  },
  'Audio Cables & Connectors': {
    code: 'I',
    summary: 'Speaker cables, microphone cables, Speakon connectors, Jack plugs, and Canon (XLR) connectors.',
  },
};

export const PRODUCT_BRANDS = [
  'Yamaha',
  'Sound Praise (SP)',
  'JBL',
  'Blackstar',
  'MOG',
  'Shure',
  'Pro-Hero',
  'Nice',
  'Ahuja',
  'Pearl',
  'Tama',
  'DB',
  'Standard',
  'World King',
  'Sonoko',
  'Modern Day',
  'Hamarsh',
  'M-Audio',
  'Focusrite',
  'Icon Star',
  'Pro Audio',
] as const;

export const BRAND_INFO = {
  name: 'NDU PAT Investment',
  shortName: 'NDU PAT',
  subName: 'Investment · Musical Instruments',
  tagline: 'Dealers in all kinds of musical instruments, public Address system and General Goods.',
  dealersStatement: 'Dealers in all kinds of musical instruments, public Address system and General Goods',
  established: '1993',
  founderName: 'Chief Patrick Ndu',
  founderRole: 'CEO & Chief Instrument Consultant',
  whatsappNumber: '2348131195306',
  whatsappUrl: 'https://wa.me/2348131195306',
  phone1: '08131195306',
  phone2: '08026459707',
  email: 'kennywemson1@gmail.com',
  headOffice: "BB7C, Alaba Int'l Market, Alaba, Ojo, Lagos",
  hoursWeekday: 'Mon-Fri: 8:30am - 6:00pm',
  hoursSaturday: 'Sat: 9:00am - 5:00pm',
};
