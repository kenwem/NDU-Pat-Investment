import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Quote, ArrowRight, Star } from 'lucide-react';
import { db } from '../firebase';
import { siteId, BRAND_INFO } from '../constants/siteConfig';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { DEFAULT_TESTIMONIALS, TestimonialItem } from '../constants/defaultData';
import Pagination from '../components/Pagination';

const ITEMS_PER_PAGE = 6;

export default function Testimonials() {
  const { settings } = useSiteSettings();
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(DEFAULT_TESTIMONIALS);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'sites', siteId, 'testimonials'),
      orderBy('position', 'asc')
    );
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          setTestimonials(DEFAULT_TESTIMONIALS);
        } else {
          const list = snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<TestimonialItem, 'id'>),
          }));
          setTestimonials(list);
        }
      },
      (err) => {
        console.error('Testimonials listener error:', err);
        setTestimonials(DEFAULT_TESTIMONIALS);
      }
    );
    return () => unsub();
  }, []);

  const totalPages = Math.max(1, Math.ceil(testimonials.length / ITEMS_PER_PAGE));
  const paginated = testimonials.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div>
      <Helmet>
        <title>Testimonials | {settings.siteName || BRAND_INFO.name}</title>
        <meta
          name="description"
          content="Read reviews from musicians, worship directors, studios, and institutions partnered with NDU PAT Investment."
        />
      </Helmet>

      {/* Crystal Clear Stage Gear Header Banner */}
      <section className="relative bg-stone-950 text-white py-28 px-4 text-center overflow-hidden">
        <img
          src="/src/assets/images/hero_testimonials_gear_1795532948615.jpg"
          alt="Concert Stage Speakers, Drums, and Microphones"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/55 pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-2 bg-black/30 backdrop-blur-md border border-white/25 text-lime-200 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
            <Star className="w-4 h-4 fill-current text-lime-400" />
            Verified Musician & Studio Reviews
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight [text-shadow:0_4px_24px_rgba(0,0,0,0.7)]">
            Testimonials
          </h1>
          <p className="text-white/95 text-lg max-w-2xl mx-auto font-medium [text-shadow:0_2px_14px_rgba(0,0,0,0.75)]">
            Hear directly from church sound engineers, conservatory educators, and performing artists across Africa.
          </p>
        </div>
      </section>

      {/* 3-Column Grid */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
            {paginated.map((item) => {
              const isLong = item.text.length > 280;
              const isExpanded = expandedId === item.id;
              const displayedText =
                isLong && !isExpanded ? `${item.text.slice(0, 280)}...` : item.text;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100 flex flex-col h-full justify-between space-y-6"
                >
                  <div className="space-y-4">
                    <Quote className="w-8 h-8 text-lime-500" />
                    <p className="text-stone-700 text-sm leading-relaxed italic">
                      “{displayedText}”
                    </p>
                    {isLong && (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : item.id)
                        }
                        className="text-lime-600 hover:text-lime-700 font-bold text-sm cursor-pointer"
                      >
                        {isExpanded ? 'Read Less' : 'Read More'}
                      </button>
                    )}
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-lime-100 text-lime-700 font-bold flex items-center justify-center shrink-0">
                      {item.author?.charAt(0).toUpperCase() || 'M'}
                    </div>
                    <div>
                      <p className="font-bold text-stone-900 text-sm">{item.author}</p>
                      <p className="text-xs text-stone-500">{item.location}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </section>

      {/* Bottom Lime CTA */}
      <section className="bg-lime-600 text-white py-20 text-center px-4">
        <div className="max-w-3xl mx-auto space-y-5">
          <h2 className="text-3xl font-extrabold">Ready to Upgrade Your Sound?</h2>
          <p className="text-lime-50">
            Chat with our showroom specialists on WhatsApp for instrument availability, bulk quotes, or luthier bookings.
          </p>
          <a
            href={BRAND_INFO.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-lime-700 hover:bg-stone-100 font-bold px-8 py-4 rounded-full shadow-lg transition-colors"
          >
            Message Us on WhatsApp
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </div>
  );
}
