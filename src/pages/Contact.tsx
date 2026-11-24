import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  MessageCircle,
} from 'lucide-react';
import { db } from '../firebase';
import { siteId, BRAND_INFO } from '../constants/siteConfig';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { formatDateTimeDDMMYYYY } from '../utils/dateFormat';
import { handleFirestoreError, OperationType } from '../utils/firebaseErrors';

export default function Contact() {
  const { settings } = useSiteSettings();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const path = `sites/${siteId}/messages`;
    try {
      await addDoc(collection(db, 'sites', siteId, 'messages'), {
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        status: 'Unread',
        date: formatDateTimeDDMMYYYY(new Date()),
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Helmet>
        <title>Contact Us | {settings.siteName || BRAND_INFO.name}</title>
        <meta
          name="description"
          content={`Contact ${BRAND_INFO.name} for musical instruments, luthier repairs, studio installations, and showroom locations.`}
        />
      </Helmet>

      {/* Crystal Clear Product Header Banner */}
      <section className="relative bg-stone-950 text-white py-28 px-4 text-center overflow-hidden">
        <img
          src="/src/assets/images/hero_guitar_saxophone_1795454632949.jpg"
          alt="Musical Instruments & Pro Audio Consultation"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/55 pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-2 bg-black/30 backdrop-blur-md border border-white/25 text-lime-200 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
            Get In Touch
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight [text-shadow:0_4px_24px_rgba(0,0,0,0.7)]">
            Contact Us
          </h1>
          <p className="text-white/95 text-lg max-w-2xl mx-auto font-medium [text-shadow:0_2px_14px_rgba(0,0,0,0.75)]">
            Visit us at {BRAND_INFO.headOffice} or call our Alaba showroom desk for musical instruments, PA systems, and sound consultations.
          </p>
        </div>
      </section>

      <section className="py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Form + Showroom Locations */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Contact Form */}
            <div className="lg:col-span-7 bg-white rounded-3xl shadow-sm border border-stone-100 p-8 sm:p-10">
              <h2 className="text-2xl font-extrabold text-stone-900 mb-2">
                Send Us a Message
              </h2>
              <p className="text-sm text-stone-500 mb-6">
                Fill out the form below and our instrument desk will respond promptly.
              </p>

              {submitted ? (
                <div className="bg-lime-50 border border-lime-200 rounded-2xl p-8 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-900">Message Sent!</h3>
                  <p className="text-sm text-stone-600">
                    Thank you for reaching out to {BRAND_INFO.name}. Our team will follow up shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="bg-lime-600 hover:bg-lime-700 text-white font-bold text-sm px-6 py-3 rounded-full cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Full name"
                        className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@example.com"
                        className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Instrument inquiry, repair quote, or studio acoustics..."
                      className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Message
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Write your message here..."
                      className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 bg-lime-600 hover:bg-lime-700 disabled:opacity-50 text-white font-bold px-8 py-3.5 rounded-full shadow-md transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>

            {/* Locations & Specialty Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100 space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-lime-100 text-lime-700 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="inline-block text-xs font-bold uppercase tracking-wider text-lime-600">
                  Showroom & Head Office
                </span>
                <h3 className="text-xl font-bold text-stone-900">{BRAND_INFO.name}</h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  {BRAND_INFO.headOffice}
                </p>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100 space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-lime-100 text-lime-700 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span className="inline-block text-xs font-bold uppercase tracking-wider text-lime-600">
                  Our Business Focus
                </span>
                <h3 className="text-xl font-bold text-stone-900">Musical Instruments & Pro PA</h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  {BRAND_INFO.dealersStatement}. Genuine wholesale & retail equipment available nationwide.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm space-y-2">
              <Phone className="w-6 h-6 text-lime-600" />
              <h4 className="font-bold text-stone-900">Phone Lines</h4>
              <p className="text-sm text-stone-600 tabular-nums">{BRAND_INFO.phone1}</p>
              <p className="text-sm text-stone-600 tabular-nums">{BRAND_INFO.phone2}</p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm space-y-2">
              <MessageCircle className="w-6 h-6 text-lime-600" />
              <h4 className="font-bold text-stone-900">WhatsApp Desk</h4>
              <p className="text-sm text-stone-600">Instant catalog & price support</p>
              <a
                href={BRAND_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-sm font-bold text-lime-600 hover:underline"
              >
                Chat now →
              </a>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm space-y-2">
              <Mail className="w-6 h-6 text-lime-600" />
              <h4 className="font-bold text-stone-900">Email</h4>
              <a
                href={`mailto:${BRAND_INFO.email}`}
                className="text-sm text-stone-600 hover:text-lime-600 break-all"
              >
                {BRAND_INFO.email}
              </a>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm space-y-2">
              <Clock className="w-6 h-6 text-lime-600" />
              <h4 className="font-bold text-stone-900">Showroom Hours</h4>
              <p className="text-sm text-stone-600">{BRAND_INFO.hoursWeekday}</p>
              <p className="text-sm text-stone-600">{BRAND_INFO.hoursSaturday}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
