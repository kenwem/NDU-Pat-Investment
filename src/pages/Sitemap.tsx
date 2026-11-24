import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Globe, Lock } from 'lucide-react';
import { BRAND_INFO } from '../constants/siteConfig';

const PUBLIC_ROUTES = [
  { path: '/', title: 'Home', desc: 'Landing showcase, trust highlights, founder snippet, and services preview.' },
  { path: '/about', title: 'About Us', desc: 'Founder biography, quick facts, and musical journeys.' },
  { path: '/services', title: 'Services', desc: 'Instrument advisory, luthier repair bench, acoustic installs, and booking modal.' },
  { path: '/products', title: 'Products', desc: 'Searchable, sortable musical instrument & pro audio catalog.' },
  { path: '/testimonials', title: 'Testimonials', desc: 'Verified musician, church, and conservatory reviews.' },
  { path: '/contact', title: 'Contact', desc: 'Direct inquiry form, showroom hours, and office addresses.' },
];

const ADMIN_ROUTES = [
  { path: '/admin/login', title: 'Admin Login', desc: 'Sign-in gateway with Google and email/password authentication.' },
  { path: '/admin', title: 'Dashboard', desc: 'Live KPI cards and real-time recent activity feed.' },
  { path: '/admin/appointments', title: 'Appointments', desc: 'Manage service bookings and consultation schedules.' },
  { path: '/admin/products', title: 'Products CMS', desc: 'Manage instruments, pricing, variations, and stock.' },
  { path: '/admin/testimonials', title: 'Testimonials CMS', desc: 'Curate musician and partner reviews.' },
  { path: '/admin/services', title: 'Services CMS', desc: 'Manage offerings and restore original defaults.' },
  { path: '/admin/comments', title: 'Comment Moderation', desc: 'Approve or delete comments and nested replies.' },
  { path: '/admin/settings', title: 'Site Settings', desc: 'Configure branding, hero copy, quick facts, and images.' },
  { path: '/admin/messages', title: 'Messages', desc: 'Read and manage visitor contact form inquiries.' },
  { path: '/admin/orders', title: 'Orders', desc: 'Track and update customer instrument orders.' },
];

export default function Sitemap() {
  return (
    <div className="py-20 bg-stone-50">
      <Helmet>
        <title>Sitemap | {BRAND_INFO.name}</title>
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-lime-600">
            Site Architecture
          </span>
          <h1 className="text-4xl font-extrabold text-stone-900">Sitemap</h1>
          <p className="text-stone-600 max-w-xl mx-auto">
            Complete route map across the {BRAND_INFO.name} storefront and administration portal.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Public Website Card */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
              <div className="w-10 h-10 rounded-xl bg-lime-100 text-lime-700 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-stone-900">Public Website</h2>
                <p className="text-xs text-stone-500">Customer-facing pages & catalog</p>
              </div>
            </div>

            <div className="space-y-4">
              {PUBLIC_ROUTES.map((route) => (
                <Link
                  key={route.path}
                  to={route.path}
                  className="group flex items-center justify-between gap-4 p-4 rounded-2xl border border-stone-100 hover:border-lime-300 hover:bg-lime-50/50 transition-all"
                >
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm group-hover:text-lime-700">
                      {route.title}{' '}
                      <span className="text-xs font-mono text-stone-400 font-normal">
                        {route.path}
                      </span>
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">{route.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-lime-600 group-hover:translate-x-1 transition-all shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          {/* Admin Portal Card */}
          <div className="bg-stone-900 text-white rounded-3xl p-8 shadow-xl space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-stone-800">
              <div className="w-10 h-10 rounded-xl bg-lime-500/20 text-lime-400 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Admin Portal</h2>
                <p className="text-xs text-stone-400">Protected CMS & operations routes</p>
              </div>
            </div>

            <div className="space-y-3">
              {ADMIN_ROUTES.map((route) => (
                <Link
                  key={route.path}
                  to={route.path}
                  className="group flex items-center justify-between gap-4 p-3.5 rounded-2xl border border-stone-800 hover:border-lime-500/50 hover:bg-stone-800/80 transition-all"
                >
                  <div>
                    <h3 className="font-bold text-white text-sm group-hover:text-lime-400">
                      {route.title}{' '}
                      <span className="text-xs font-mono text-stone-500 font-normal">
                        {route.path}
                      </span>
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">{route.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-500 group-hover:text-lime-400 group-hover:translate-x-1 transition-all shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
