import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  ShieldCheck,
  GraduationCap,
  Award,
  Leaf,
  Heart,
  BookOpen,
  CheckCircle2,
  Calendar,
  X,
  ArrowRight,
  Music,
} from 'lucide-react';
import { db } from '../firebase';
import { siteId, BRAND_INFO } from '../constants/siteConfig';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { DEFAULT_SERVICES, ServiceItem } from '../constants/defaultData';
import { convertInputDateToDDMMYYYY } from '../utils/dateFormat';
import { handleFirestoreError, OperationType } from '../utils/firebaseErrors';

const ICON_MAP: Record<string, typeof ShieldCheck> = {
  ShieldCheck,
  GraduationCap,
  Award,
  Leaf,
  Heart,
  BookOpen,
};

const TIME_SLOTS = [
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
];

export default function Services() {
  const { settings } = useSiteSettings();
  const [services, setServices] = useState<ServiceItem[]>(DEFAULT_SERVICES);
  const [bookingService, setBookingService] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '10:00 AM',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const q = query(
      collection(db, 'sites', siteId, 'services'),
      orderBy('position', 'asc')
    );
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          setServices(DEFAULT_SERVICES);
        } else {
          const list = snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<ServiceItem, 'id'>),
          }));
          setServices(list);
        }
      },
      (err) => {
        console.error('Services listener error:', err);
        setServices(DEFAULT_SERVICES);
      }
    );
    return () => unsub();
  }, []);

  const openBookingModal = (serviceTitle: string) => {
    setBookingService(serviceTitle);
    setSubmitted(false);
    setSubmitError('');
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingService) return;
    setSubmitting(true);
    setSubmitError('');

    const path = `sites/${siteId}/appointments`;
    try {
      const formattedDate = convertInputDateToDDMMYYYY(formData.date);
      await addDoc(collection(db, 'sites', siteId, 'appointments'), {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        service: bookingService,
        date: formattedDate,
        time: formData.time,
        message: formData.message.trim(),
        status: 'Pending',
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        date: '',
        time: '10:00 AM',
        message: '',
      });
    } catch (err) {
      setSubmitError('Could not save booking. Please verify your details and try again.');
      handleFirestoreError(err, OperationType.CREATE, path);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Helmet>
        <title>Our Services | {settings.siteName || BRAND_INFO.name}</title>
        <meta
          name="description"
          content="Explore instrument advisory, luthier repairs, studio acoustic installations, and music academy training at NDU PAT Investment."
        />
      </Helmet>

      {/* Crystal Clear Product Workshop Header Banner */}
      <section className="relative bg-stone-950 text-white py-28 overflow-hidden">
        <img
          src={settings.servicesBgUrl || '/src/assets/images/hero_services_workshop_1795532851823.jpg'}
          alt="Musical Instrument Services & Sound Workshop"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.src = '/src/assets/images/hero_services_workshop_1795532851823.jpg';
          }}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/55 pointer-events-none" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="inline-flex items-center gap-2 bg-black/30 backdrop-blur-md border border-white/25 text-lime-200 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
            <Music className="w-4 h-4 text-lime-400" />
            Showroom, Workshop & Acoustic Engineering
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight [text-shadow:0_4px_24px_rgba(0,0,0,0.7)]">
            Our Services
          </h1>
          <p className="text-white/95 max-w-2xl mx-auto text-lg font-medium [text-shadow:0_2px_14px_rgba(0,0,0,0.75)]">
            Precision craftsmanship, Public Address installation, instrument consultation, and tailored sound engineering at Alaba Int’l Market.
          </p>
        </div>
      </section>

      {/* Services List */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          {services.map((service, index) => {
            const Icon = ICON_MAP[service.icon] || ShieldCheck;
            const reversed = index % 2 !== 0;

            return (
              <div
                key={service.id}
                className={`flex flex-col lg:flex-row items-center gap-12 ${
                  reversed ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className="w-full lg:w-1/2">
                  <div className="rounded-3xl overflow-hidden shadow-xl border border-stone-100 aspect-[4/3] bg-stone-900">
                    <img
                      src={
                        service.image && !service.image.startsWith('/images/service-')
                          ? service.image
                          : '/src/assets/images/hero_products_showroom_1795532851950.jpg'
                      }
                      alt={service.title}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src =
                          '/src/assets/images/hero_products_showroom_1795532851950.jpg';
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="w-full lg:w-1/2 space-y-5">
                  <div className="w-14 h-14 rounded-2xl bg-lime-100 text-lime-700 flex items-center justify-center">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">
                    {service.title}
                  </h2>
                  <p className="text-stone-600 leading-relaxed">{service.description}</p>

                  {service.features && service.features.length > 0 && (
                    <ul className="space-y-2.5 pt-2">
                      {service.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2.5 text-sm text-stone-700">
                          <CheckCircle2 className="w-5 h-5 text-lime-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={() => openBookingModal(service.title)}
                      className="inline-flex items-center gap-2 bg-lime-600 hover:bg-lime-700 text-white font-bold px-7 py-3.5 rounded-full shadow-md transition-all cursor-pointer"
                    >
                      <Calendar className="w-4 h-4" />
                      Book This Service
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-lime-50 py-20 border-t border-lime-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl font-extrabold text-stone-900">
            Need Immediate Showroom or Sound Advice?
          </h2>
          <p className="text-stone-600 max-w-xl mx-auto">
            Speak directly with our instrument specialists on WhatsApp or visit either of our showrooms for an in-person audition.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={BRAND_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-lime-600 hover:bg-lime-700 text-white font-bold px-8 py-4 rounded-full shadow-md transition-colors"
            >
              WhatsApp Consultation
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              to="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 font-bold px-8 py-4 rounded-full transition-colors"
            >
              View Showroom Locations
            </Link>
          </div>
        </div>
      </section>

      {/* Appointment Booking Modal */}
      {bookingService !== null && (
        <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-100 my-8">
            <div className="bg-stone-900 text-white px-6 py-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Book Appointment</h3>
                <p className="text-xs text-lime-400 font-medium">{bookingService}</p>
              </div>
              <button
                type="button"
                onClick={() => setBookingService(null)}
                className="text-stone-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitted ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h4 className="text-2xl font-bold text-stone-900">Booking Received!</h4>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Thank you! Your request for <strong>{bookingService}</strong> has been logged. Our specialist team will confirm your session shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setBookingService(null)}
                  className="mt-2 bg-lime-600 hover:bg-lime-700 text-white font-bold px-8 py-3 rounded-full cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="p-6 space-y-4">
                {submitError && (
                  <div className="bg-red-50 text-red-700 text-xs px-4 py-3 rounded-xl">
                    {submitError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0803..."
                      className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Preferred Time
                    </label>
                    <select
                      required
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-lime-500"
                    >
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Message (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your instrument, venue size, or repair requirement..."
                    className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-lime-600 hover:bg-lime-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-full transition-colors cursor-pointer"
                >
                  {submitting ? 'Submitting Booking...' : 'Confirm Booking Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
