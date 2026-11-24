import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Phone, Mail } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { BRAND_INFO, DEFAULT_LOGO_IMAGE } from '../constants/siteConfig';

const QUICK_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Products', to: '/products' },
  { label: 'Testimonials', to: '/testimonials' },
  { label: 'Contact', to: '/contact' },
];

const SERVICE_LIST = [
  'Musical Instruments Sales',
  'Public Address (PA) Systems',
  'Speakers, Mixers & Amplifiers',
  'Luthier Repairs & Tuning',
  'Studio & Sanctuary Acoustics',
  'Audio Cables & Connectors',
];

export default function Footer() {
  const { settings } = useSiteSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-stone-800">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={settings.logoUrl || DEFAULT_LOGO_IMAGE}
                alt={BRAND_INFO.name}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_LOGO_IMAGE;
                }}
                className="h-12 w-12 rounded-full object-cover border border-stone-700"
              />
              <div>
                <h3 className="text-white font-bold text-lg leading-tight">
                  {BRAND_INFO.name}
                </h3>
                <p className="text-xs text-lime-400 font-medium">
                  Est. {BRAND_INFO.established}
                </p>
              </div>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed">
              Dealers in all kinds of musical instruments, public Address system and General Goods — serving artists, churches, schools, and studios since 1993.
            </p>
            <a
              href={BRAND_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-lime-400 hover:text-lime-300 transition-colors"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12.031 2c-5.516 0-9.969 4.453-9.969 9.969 0 1.766.469 3.484 1.344 5l-1.406 5.156 5.281-1.375c1.469.797 3.109 1.219 4.75 1.219 5.516 0 9.969-4.453 9.969-9.969s-4.453-9.969-9.969-9.969zm5.813 14.125c-.25.703-1.438 1.344-2 1.438-.516.078-1.188.141-1.922-.094-.453-.141-1.031-.344-1.766-.656-3.094-1.328-5.109-4.469-5.266-4.672-.156-.203-1.266-1.688-1.266-3.219s.797-2.281 1.078-2.594c.281-.313.609-.391.813-.391s.406 0 .578.016c.188.016.438-.078.688.516.25.609.859 2.094.938 2.25.078.156.125.344.016.547-.109.203-.156.328-.313.5-.156.172-.328.391-.469.516-.156.156-.328.328-.141.656.188.328.844 1.391 1.813 2.25 1.25 1.109 2.297 1.453 2.625 1.609.328.156.516.125.703-.094.188-.219.813-.953 1.031-1.281.219-.328.438-.266.734-.156s1.875.891 2.203 1.047c.328.156.547.234.625.375.078.141.078.813-.172 1.516z" />
              </svg>
              WhatsApp Showroom Desk
            </a>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-white font-bold text-base mb-5">Quick Links</h4>
            <ul className="space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-white transition-colors group"
                  >
                    <ArrowRight className="w-4 h-4 text-lime-500 group-hover:translate-x-1 transition-transform" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: What We Deal In */}
          <div>
            <h4 className="text-white font-bold text-base mb-5">What We Offer</h4>
            <ul className="space-y-3 text-sm text-stone-400">
              {SERVICE_LIST.map((service) => (
                <li key={service} className="hover:text-stone-200 transition-colors">
                  <Link to="/products">{service}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div>
            <h4 className="text-white font-bold text-base mb-5">Contact Us</h4>
            <ul className="space-y-4 text-sm text-stone-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-lime-500 shrink-0 mt-0.5" />
                <span>{BRAND_INFO.headOffice}</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-lime-500 shrink-0 mt-0.5" />
                <div className="space-y-1 tabular-nums">
                  <a href={`tel:${BRAND_INFO.phone1}`} className="block hover:text-white transition-colors">
                    {BRAND_INFO.phone1}
                  </a>
                  <a href={`tel:${BRAND_INFO.phone2}`} className="block hover:text-white transition-colors">
                    {BRAND_INFO.phone2}
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-lime-500 shrink-0" />
                <a
                  href={`mailto:${BRAND_INFO.email}`}
                  className="hover:text-white transition-colors break-all"
                >
                  {BRAND_INFO.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>
            © {year} NDU PAT Investment{' '}
            <Link to="/admin" className="hover:text-lime-400 transition-colors">
              Center
            </Link>
            . All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span>Est. {BRAND_INFO.established} | Musical Instruments, PA Systems & General Goods</span>
            <Link to="/sitemap" className="text-stone-400 hover:text-lime-400 transition-colors underline">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
