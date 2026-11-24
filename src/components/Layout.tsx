import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { BRAND_INFO } from '../constants/siteConfig';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />

      {/* Floating WhatsApp Consultation FAB */}
      <a
        href={BRAND_INFO.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp Us"
        className="fixed bottom-6 right-6 z-50 bg-lime-500 hover:bg-lime-600 text-white p-4 rounded-full shadow-2xl border-4 border-white hover:scale-110 transition-all duration-200 flex items-center gap-0 hover:gap-2.5 group"
      >
        <svg className="w-6 h-6 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12.031 2c-5.516 0-9.969 4.453-9.969 9.969 0 1.766.469 3.484 1.344 5l-1.406 5.156 5.281-1.375c1.469.797 3.109 1.219 4.75 1.219 5.516 0 9.969-4.453 9.969-9.969s-4.453-9.969-9.969-9.969zm5.813 14.125c-.25.703-1.438 1.344-2 1.438-.516.078-1.188.141-1.922-.094-.453-.141-1.031-.344-1.766-.656-3.094-1.328-5.109-4.469-5.266-4.672-.156-.203-1.266-1.688-1.266-3.219s.797-2.281 1.078-2.594c.281-.313.609-.391.813-.391s.406 0 .578.016c.188.016.438-.078.688.516.25.609.859 2.094.938 2.25.078.156.125.344.016.547-.109.203-.156.328-.313.5-.156.172-.328.391-.469.516-.156.156-.328.328-.141.656.188.328.844 1.391 1.813 2.25 1.25 1.109 2.297 1.453 2.625 1.609.328.156.516.125.703-.094.188-.219.813-.953 1.031-1.281.219-.328.438-.266.734-.156s1.875.891 2.203 1.047c.328.156.547.234.625.375.078.141.078.813-.172 1.516z" />
        </svg>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-200 whitespace-nowrap font-bold text-sm">
          WhatsApp Us
        </span>
      </a>
    </div>
  );
}
