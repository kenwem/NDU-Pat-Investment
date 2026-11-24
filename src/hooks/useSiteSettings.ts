import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import {
  siteId,
  DEFAULT_LOGO_IMAGE,
  DEFAULT_HERO_IMAGE,
  DEFAULT_CEO_IMAGE,
  PAGE_HERO_IMAGES,
} from '../constants/siteConfig';

export interface AboutFact {
  icon: string;
  title: string;
  desc: string;
}

export interface SiteSettings {
  siteName: string;
  logoUrl: string;
  heroBgUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  aboutBgUrl: string;
  aboutFacts: AboutFact[];
  servicesBgUrl: string;
  blogBgUrl: string;
  ceoPhotoUrl: string;
  copyrightText: string;
}

export const defaultSettings: SiteSettings = {
  siteName: 'NDU PAT Investment',
  logoUrl: DEFAULT_LOGO_IMAGE,
  heroBgUrl: DEFAULT_HERO_IMAGE,
  heroTitle: 'Crafting Sound,<br/>Inspiring Every Stage.',
  heroSubtitle:
    'Dealers in all kinds of musical instruments, public Address system and General Goods — trusted since 1993 at Alaba Int’l Market, Lagos.',
  aboutBgUrl: PAGE_HERO_IMAGES.about,
  aboutFacts: [
    {
      icon: 'ShieldCheck',
      title: '30+ Years Heritage',
      desc: 'Supplying churches, studios, schools, and touring artists since 1993.',
    },
    {
      icon: 'Award',
      title: 'Authorized Brand Dealer',
      desc: 'Yamaha, JBL, Shure, Ahuja, Pearl, Tama, Focusrite, M-Audio & PA systems.',
    },
    {
      icon: 'GraduationCap',
      title: 'Master Technician Workshop',
      desc: 'In-house tuning, calibration, speaker rigging, and instrument repairs.',
    },
    {
      icon: 'Heart',
      title: 'Public Address & General Goods',
      desc: 'Complete PA systems, cables, connectors, and church auditorium outfitting.',
    },
  ],
  servicesBgUrl: PAGE_HERO_IMAGES.services,
  blogBgUrl: PAGE_HERO_IMAGES.products,
  ceoPhotoUrl: DEFAULT_CEO_IMAGE,
  copyrightText: `© ${new Date().getFullYear()} NDU PAT Investment. All rights reserved.`,
};

export function ensureDirectImgur(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  const match = trimmed.match(/^https?:\/\/(?:www\.)?imgur\.com\/([a-zA-Z0-9]+)(?:\?.*)?$/);
  if (match && match[1]) {
    return `https://i.imgur.com/${match[1]}.jpg`;
  }
  return trimmed;
}

export function isDefaultOrEmpty(url: string | undefined): boolean {
  if (!url || url.trim() === '') return true;
  const trimmed = url.trim();
  return (
    trimmed.startsWith('/images/service-') ||
    trimmed === '/images/hero-bg.svg' ||
    trimmed === '/images/founder.svg' ||
    trimmed === '/images/default-instrument.svg'
  );
}

const CACHE_KEY = `site_settings_cache_${siteId}`;

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as Partial<SiteSettings>;
        return {
          ...defaultSettings,
          ...parsed,
          aboutBgUrl: isDefaultOrEmpty(parsed.aboutBgUrl)
            ? defaultSettings.aboutBgUrl
            : parsed.aboutBgUrl!,
          servicesBgUrl: isDefaultOrEmpty(parsed.servicesBgUrl)
            ? defaultSettings.servicesBgUrl
            : parsed.servicesBgUrl!,
          heroBgUrl: isDefaultOrEmpty(parsed.heroBgUrl)
            ? defaultSettings.heroBgUrl
            : parsed.heroBgUrl!,
          ceoPhotoUrl: isDefaultOrEmpty(parsed.ceoPhotoUrl)
            ? defaultSettings.ceoPhotoUrl
            : parsed.ceoPhotoUrl!,
        };
      }
    } catch {
      // ignore localStorage read errors
    }
    return defaultSettings;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(db, 'sites', siteId, 'settings', 'site');
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as Partial<SiteSettings>;
          const merged: SiteSettings = {
            siteName: data.siteName || defaultSettings.siteName,
            logoUrl:
              !data.logoUrl || data.logoUrl.trim() === ''
                ? defaultSettings.logoUrl
                : ensureDirectImgur(data.logoUrl),
            heroBgUrl: isDefaultOrEmpty(data.heroBgUrl)
              ? defaultSettings.heroBgUrl
              : ensureDirectImgur(data.heroBgUrl!),
            heroTitle: data.heroTitle || defaultSettings.heroTitle,
            heroSubtitle: data.heroSubtitle || defaultSettings.heroSubtitle,
            aboutBgUrl: isDefaultOrEmpty(data.aboutBgUrl)
              ? defaultSettings.aboutBgUrl
              : ensureDirectImgur(data.aboutBgUrl!),
            aboutFacts:
              Array.isArray(data.aboutFacts) && data.aboutFacts.length > 0
                ? data.aboutFacts
                : defaultSettings.aboutFacts,
            servicesBgUrl: isDefaultOrEmpty(data.servicesBgUrl)
              ? defaultSettings.servicesBgUrl
              : ensureDirectImgur(data.servicesBgUrl!),
            blogBgUrl: isDefaultOrEmpty(data.blogBgUrl)
              ? defaultSettings.blogBgUrl
              : ensureDirectImgur(data.blogBgUrl!),
            ceoPhotoUrl: isDefaultOrEmpty(data.ceoPhotoUrl)
              ? defaultSettings.ceoPhotoUrl
              : ensureDirectImgur(data.ceoPhotoUrl!),
            copyrightText: data.copyrightText || defaultSettings.copyrightText,
          };
          setSettings(merged);
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(merged));
          } catch {
            // ignore quota errors
          }
        } else {
          setSettings(defaultSettings);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error subscribing to site settings:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { settings, loading };
}
