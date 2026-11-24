import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'motion/react';
import {
  Music,
  ShieldCheck,
  Heart,
  Star,
  ArrowRight,
  Wrench,
  Sliders,
  Quote,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { BRAND_INFO, DEFAULT_HERO_IMAGE, DEFAULT_CEO_IMAGE } from '../constants/siteConfig';

const HERO_SLIDES = [
  {
    id: 'keyboard',
    label: 'Keyboard Performance',
    caption: 'Stage Arrangers & Concert Keyboards',
    src: '/src/assets/images/hero_keyboard_player_1795454633193.jpg',
    alt: 'Musician performing live on a concert stage keyboard',
  },
  {
    id: 'drumset',
    label: 'Acoustic Drumset',
    caption: 'Pro Maple Kits & Hand-Hammered Cymbals',
    src: '/src/assets/images/hero_drumset_stage_1795454633099.jpg',
    alt: 'Acoustic 5-piece maple drumset and bronze cymbals on stage',
  },
  {
    id: 'guitar-sax',
    label: 'Guitar & Saxophone',
    caption: 'Fine Tonewood Guitars & Brass Horns',
    src: '/src/assets/images/hero_guitar_saxophone_1795454632949.jpg',
    alt: 'Sunburst acoustic dreadnought guitar beside a brass alto saxophone',
  },
];

const HOME_SERVICES = [
  {
    title: 'Instrument Sales & Advisory',
    description:
      'Dealers in all kinds of musical instruments, public Address system and General Goods — Yamaha keyboards, guitars, brass horns, drum kits & more.',
    image: '/src/assets/images/prod_yamaha_keyboard_1795532845708.jpg',
    icon: Music,
  },
  {
    title: 'Luthier Repairs & Tuning',
    description:
      'Precision fret dressing, acoustic bridge repair, keybed servicing, and brass calibration in our workshop.',
    image: '/src/assets/images/hero_services_workshop_1795532851823.jpg',
    icon: Wrench,
  },
  {
    title: 'Studio & Stage Acoustics',
    description:
      'End-to-end digital mixer setup, church sanctuary speaker installation, PA systems, and broadcast sound tuning.',
    image: '/src/assets/images/prod_audio_mixer_1795532848925.jpg',
    icon: Sliders,
  },
];

const HOME_TESTIMONIALS = [
  {
    author: 'Mrs. Grace Mensah',
    location: 'Accra, Ghana',
    text: 'We entrusted NDU PAT Investment with restoring four school upright pianos and supplying our brass ensemble. Their craftsmanship and patience when training our music directors made all the difference.',
  },
  {
    author: 'Prof. Hippolyte N. Muyingi',
    location: 'Nairobi, Kenya',
    text: 'As a conservatory guitar instructor, finding instruments that arrive properly intonated is rare. Chief Patrick’s workshop inspects every fret, nut, and truss rod before handing over a guitar.',
  },
  {
    author: 'Dr. Samson Ndidi Ehijinwa',
    location: 'Port Harcourt, Nigeria',
    text: 'Our studio ordered custom acoustic treatment panels, studio monitors, and an alto saxophone. Not only were prices transparent, the technical advisory saved us from costly mismatch mistakes.',
  },
];

export default function Home() {
  const { settings } = useSiteSettings();
  const [activeSlide, setActiveSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  const titleLines = (settings.heroTitle || 'Crafting Sound,<br/>Inspiring Every Stage.').split(
    /<br\s*\/?>/i
  );

  const goToSlide = useCallback(
    (index: number) => {
      setDirection(index > activeSlide ? 1 : -1);
      setActiveSlide((index + HERO_SLIDES.length) % HERO_SLIDES.length);
    },
    [activeSlide]
  );

  const nextSlide = useCallback(() => {
    setDirection(1);
    setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setActiveSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = window.setInterval(() => {
      nextSlide();
    }, 5000);
    return () => window.clearInterval(timer);
  }, [isPaused, nextSlide]);

  const currentSlide = HERO_SLIDES[activeSlide];

  return (
    <div>
      <Helmet>
        <title>{settings.siteName || BRAND_INFO.name} | Musical Instruments & Pro Audio</title>
        <meta
          name="description"
          content={settings.heroSubtitle || BRAND_INFO.tagline}
        />
      </Helmet>

      {/* 1. Clear & Transparent 3-Instrument Scrolling Hero Section */}
      <section
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative min-h-[560px] md:min-h-[640px] flex items-center bg-stone-950 text-white pt-24 pb-28 md:pt-28 md:pb-32 overflow-hidden"
      >
        {/* Scrolling Musical Instrument Photography Layer (Full Clarity) */}
        <div className="absolute inset-0 overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.img
              key={currentSlide.id}
              custom={direction}
              src={currentSlide.src}
              alt={currentSlide.alt}
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_HERO_IMAGE;
              }}
              initial={{ x: direction > 0 ? '100%' : '-100%', opacity: 0.55 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction > 0 ? '-100%' : '100%', opacity: 0.55 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </AnimatePresence>

          {/* Transparent light gradient scrim for text legibility while keeping instruments vivid */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/15 to-black/50 pointer-events-none" />
        </div>

        {/* Side Carousel Arrows */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous musical instrument slide"
          className="hidden sm:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white items-center justify-center transition-all cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next musical instrument slide"
          className="hidden sm:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white items-center justify-center transition-all cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Transparent Centered Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="space-y-6 sm:space-y-7"
          >
            <span className="inline-flex items-center gap-2 bg-black/25 backdrop-blur-md border border-white/30 text-lime-200 text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full shadow-sm">
              <Music className="w-4 h-4 text-lime-400" />
              Est. {BRAND_INFO.established} | {currentSlide.caption}
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.08] text-balance [text-shadow:0_4px_24px_rgba(0,0,0,0.65)]">
              {titleLines.map((line, i) => (
                <span key={i}>
                  {line}
                  {i < titleLines.length - 1 && <br />}
                </span>
              ))}
            </h1>

            <p className="text-base sm:text-xl text-white/95 max-w-2xl mx-auto leading-relaxed font-medium [text-shadow:0_2px_14px_rgba(0,0,0,0.75)]">
              {settings.heroSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-1">
              <Link
                to="/products"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-lime-500 hover:bg-lime-600 text-white font-bold px-8 py-4 rounded-full shadow-xl transition-all hover:-translate-y-0.5"
              >
                View Our Products
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/services"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/40 text-white font-bold px-8 py-4 rounded-full shadow-lg transition-all"
              >
                Explore Services
              </Link>
            </div>

            {/* 3-Instrument Scroll Selector */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
              {HERO_SLIDES.map((slide, idx) => {
                const isActive = idx === activeSlide;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => goToSlide(idx)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs sm:text-sm font-semibold backdrop-blur-md border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-lime-500/90 border-lime-300 text-white shadow-lg scale-[1.02]'
                        : 'bg-black/25 hover:bg-black/40 border-white/25 text-white/85'
                    }`}
                  >
                    <span className="font-mono text-[11px] opacity-80">0{idx + 1}</span>
                    <span>{slide.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Trust Indicators Strip */}
      <section className="bg-lime-50 py-16 -mt-8 rounded-t-[3rem] relative z-20 border-b border-lime-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-lime-200 text-center">
            <div className="py-4 md:py-0 px-6 flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-lime-100 text-lime-700 flex items-center justify-center mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-stone-900 text-lg">30+ Years Experience</h3>
              <p className="text-sm text-stone-600 mt-1">
                Three decades equipping studios, sanctuaries, and solo artists.
              </p>
            </div>

            <div className="py-4 md:py-0 px-6 flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-lime-100 text-lime-700 flex items-center justify-center mb-3">
                <Music className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-stone-900 text-lg">100% Authentic Gear</h3>
              <p className="text-sm text-stone-600 mt-1">
                Factory-inspected acoustic, brass, percussion, and pro audio lines.
              </p>
            </div>

            <div className="py-4 md:py-0 px-6 flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-lime-100 text-lime-700 flex items-center justify-center mb-3">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-stone-900 text-lg">Dedicated Luthier Support</h3>
              <p className="text-sm text-stone-600 mt-1">
                In-house setup, tuning, and ongoing acoustic consultation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. About The Founder Snippet */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div className="relative max-w-md mx-auto lg:mx-0 w-full">
              <div className="absolute -inset-4 bg-lime-100 rounded-3xl -rotate-3" />
              <img
                src={settings.ceoPhotoUrl || DEFAULT_CEO_IMAGE}
                alt={BRAND_INFO.founderName}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_CEO_IMAGE;
                }}
                className="relative w-full aspect-[4/5] object-cover rounded-3xl shadow-xl border border-stone-100"
              />
              <div className="relative sm:absolute sm:-bottom-6 sm:-right-6 mt-4 sm:mt-0 bg-white rounded-2xl shadow-xl border border-stone-100 p-4 max-w-xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-extrabold text-stone-900 text-lg tabular-nums">5.0</span>
                  <span className="text-xs font-bold text-stone-500 uppercase">Rating</span>
                  <div className="flex items-center gap-0.5 ml-auto text-amber-400">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-stone-600">
                  Trusted by thousands of musicians and churches worldwide.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-lime-600">
                About The Founder
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
                Meet {BRAND_INFO.founderName}: Your Trusted Guide to Fine Instruments
              </h2>
              <p className="text-stone-600 leading-relaxed">
                Since founding {BRAND_INFO.name} in {BRAND_INFO.established}, {BRAND_INFO.founderName} has dedicated more than three decades to connecting African musicians, worship ministries, and recording engineers with reliable, concert-ready musical instruments.
              </p>
              <p className="text-stone-600 leading-relaxed">
                A seasoned acoustic specialist and author of{' '}
                <em>The Complete Instrument Care & Maintenance Handbook</em> and{' '}
                <em>Stage & Sanctuary Acoustic Engineering in West Africa</em>, his mission ensures every buyer receives honest counsel and workshop-verified sound quality.
              </p>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-lime-600 hover:text-lime-700 font-bold text-sm group"
              >
                Read Full Biography
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Services Overview */}
      <section className="bg-stone-50 py-24 border-y border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-lime-600">
              Our Expertise
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              Comprehensive Musical Care
            </h2>
            <p className="text-stone-600">
              From showroom selection to stage acoustics and long-term maintenance, every instrument is backed by hands-on mastery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOME_SERVICES.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-stone-100 transition-all duration-200 flex flex-col"
                >
                  <div className="relative h-52 bg-stone-900 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent" />
                    <div className="absolute bottom-4 left-5 w-11 h-11 rounded-2xl bg-lime-500 text-white flex items-center justify-center shadow-lg">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-stone-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-stone-600 leading-relaxed flex-1 mb-5">
                      {item.description}
                    </p>
                    <Link
                      to="/services"
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-lime-600 hover:text-lime-700"
                    >
                      Learn more
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Testimonials Preview */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-lime-600">
                Musician & Partner Reviews
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
                Voices of Sound & Craft
              </h2>
            </div>
            <Link
              to="/testimonials"
              className="inline-flex items-center gap-2 text-sm font-bold text-lime-600 hover:text-lime-700"
            >
              View All Testimonials
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOME_TESTIMONIALS.map((t) => (
              <div
                key={t.author}
                className="bg-stone-50 rounded-3xl p-8 border border-stone-100 flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <Quote className="w-8 h-8 text-lime-500" />
                  <p className="text-stone-700 italic leading-relaxed text-sm">
                    “{t.text}”
                  </p>
                </div>
                <div className="pt-4 border-t border-stone-200">
                  <p className="font-bold text-stone-900 text-sm">{t.author}</p>
                  <p className="text-xs text-stone-500">{t.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Showroom & Consultation CTA */}
      <section className="relative bg-lime-600 text-white py-28 overflow-hidden">
        <svg
          className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <pattern id="sound-wave-pattern" width="120" height="120" patternUnits="userSpaceOnUse">
              <path
                d="M0 60 Q30 20 60 60 T120 60"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#sound-wave-pattern)" />
        </svg>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
            <Music className="w-4 h-4" />
            Showroom & Acoustic Desk
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-balance">
            Equip Your Stage with Timeless Craftsmanship
          </h2>
          <p className="text-lime-50 text-lg max-w-2xl mx-auto">
            Browse our factory-verified guitars, keyboards, brass horns, drum kits, and pro audio gear or speak directly with our acoustic specialists.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-white text-lime-700 hover:bg-stone-100 font-bold px-8 py-4 rounded-full shadow-xl transition-all"
            >
              Browse Instrument Catalog
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-lime-700/60 hover:bg-lime-700 border border-white/30 text-white font-bold px-8 py-4 rounded-full transition-all"
            >
              Visit Our Showroom
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
