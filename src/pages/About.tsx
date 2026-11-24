import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import {
  ShieldCheck,
  GraduationCap,
  Award,
  Leaf,
  Heart,
  BookOpen,
  Music,
} from 'lucide-react';
import { db } from '../firebase';
import { siteId, BRAND_INFO, DEFAULT_CEO_IMAGE } from '../constants/siteConfig';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { DEFAULT_TESTIMONIALS, TestimonialItem } from '../constants/defaultData';

const ICON_MAP: Record<string, typeof ShieldCheck> = {
  ShieldCheck,
  GraduationCap,
  Award,
  Leaf,
  Heart,
  BookOpen,
};

export default function About() {
  const { settings } = useSiteSettings();
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(DEFAULT_TESTIMONIALS);

  useEffect(() => {
    const q = query(
      collection(db, 'sites', siteId, 'testimonials'),
      orderBy('position', 'asc')
    );
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<TestimonialItem, 'id'>),
          }));
          setTestimonials(items);
        }
      },
      (err) => {
        console.error('About testimonials listener error:', err);
      }
    );
    return () => unsub();
  }, []);

  return (
    <div>
      <Helmet>
        <title>About Us | {settings.siteName || BRAND_INFO.name}</title>
        <meta
          name="description"
          content={`Learn about ${BRAND_INFO.founderName} and ${BRAND_INFO.name}'s 30+ year commitment to musical instruments and acoustic craftsmanship.`}
        />
      </Helmet>

      {/* Crystal Clear Product Header Banner */}
      <section className="relative bg-stone-950 text-white py-28 overflow-hidden">
        <img
          src={settings.aboutBgUrl || '/src/assets/images/hero_about_showroom_1795532852079.jpg'}
          alt="About NDU PAT Investment Musical Instruments"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.src = '/src/assets/images/hero_about_showroom_1795532852079.jpg';
          }}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/55 pointer-events-none" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="inline-flex items-center gap-2 bg-black/30 backdrop-blur-md border border-white/25 text-lime-200 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
            <Music className="w-4 h-4 text-lime-400" />
            Our Heritage Since {BRAND_INFO.established}
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight [text-shadow:0_4px_24px_rgba(0,0,0,0.7)]">
            About Us
          </h1>
          <p className="text-white/95 max-w-2xl mx-auto text-lg font-medium [text-shadow:0_2px_14px_rgba(0,0,0,0.75)]">
            Dealers in all kinds of musical instruments, public Address system and General Goods — serving artists, sanctuaries, and studios since {BRAND_INFO.established}.
          </p>
        </div>
      </section>

      {/* Main 12-Column Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left 5 Columns */}
            <div className="lg:col-span-5 space-y-8">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border border-stone-100 aspect-[3/4] bg-stone-900">
                <img
                  src={settings.ceoPhotoUrl || DEFAULT_CEO_IMAGE}
                  alt={BRAND_INFO.founderName}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_CEO_IMAGE;
                  }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <h2 className="text-2xl font-extrabold">{BRAND_INFO.founderName}</h2>
                  <p className="text-lime-400 text-sm font-semibold">{BRAND_INFO.founderRole}</p>
                </div>
              </div>

              {/* Quick Facts */}
              <div className="bg-stone-50 rounded-3xl p-8 border border-stone-100 space-y-5">
                <h3 className="text-lg font-bold text-stone-900">Quick Facts</h3>
                <div className="space-y-4">
                  {(settings.aboutFacts || []).map((fact, idx) => {
                    const Icon = ICON_MAP[fact.icon] || ShieldCheck;
                    return (
                      <div key={idx} className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-lime-100 text-lime-700 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-stone-900 text-sm">{fact.title}</h4>
                          <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                            {fact.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right 7 Columns */}
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest text-lime-600">
                  Leadership & Legacy
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
                  Raising the Standard of Musical Craftsmanship
                </h2>
                <p className="text-stone-600 leading-relaxed">
                  Founded in {BRAND_INFO.established} by {BRAND_INFO.founderName} and headquartered at {BRAND_INFO.headOffice}, {BRAND_INFO.name} are trusted dealers in all kinds of musical instruments, public Address system and General Goods.
                </p>
                <p className="text-stone-600 leading-relaxed">
                  Over thirty years later, our Alaba showroom and repair workshop supply Yamaha keyboards, guitars, saxophones, and trumpets alongside JBL, Shure, Ahuja, Sound Praise (SP), Pearl, Tama, Focusrite, and M-Audio pro audio gear for touring bands, churches, schools, and recording studios.
                </p>
              </div>

              <blockquote className="border-l-4 border-lime-500 bg-lime-50/70 rounded-r-2xl p-6 text-stone-800 italic leading-relaxed">
                “Great music begins long before the first note is played—it begins with an instrument built with honesty, tuned with patience, and matched to the hands of its player.”
                <footer className="mt-2 not-italic font-bold text-sm text-lime-700">
                  — {BRAND_INFO.founderName}
                </footer>
              </blockquote>

              {/* Highlights */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xl font-bold text-stone-900">Signature Guides & Expertise</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200">
                    <div className="flex items-center justify-between mb-2">
                      <BookOpen className="w-5 h-5 text-lime-600" />
                    </div>
                    <h4 className="font-bold text-stone-900 text-sm">
                      Instrument Care & Maintenance Handbook
                    </h4>
                    <p className="text-xs text-stone-500 mt-1">
                      Climate-tested maintenance guidance for acoustic & stage gear.
                    </p>
                  </div>

                  <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200">
                    <div className="flex items-center justify-between mb-2">
                      <BookOpen className="w-5 h-5 text-lime-600" />
                    </div>
                    <h4 className="font-bold text-stone-900 text-sm">
                      Stage & Sanctuary Acoustic Engineering
                    </h4>
                    <p className="text-xs text-stone-500 mt-1">
                      Practical live sound geometry for West African halls.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Dark Section: Testimonials */}
      <section className="bg-stone-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-lime-400">
              Partner Voices
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Musical Journeys
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="bg-stone-800/80 rounded-3xl p-8 border border-stone-700/60 flex flex-col justify-between space-y-6"
              >
                <p className="text-stone-300 text-sm leading-relaxed italic">
                  “{item.text}”
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-stone-700/60">
                  <div className="w-10 h-10 rounded-full bg-lime-500/20 text-lime-400 font-bold flex items-center justify-center shrink-0">
                    {item.author?.charAt(0).toUpperCase() || 'M'}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{item.author}</p>
                    <p className="text-xs text-stone-400">{item.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
