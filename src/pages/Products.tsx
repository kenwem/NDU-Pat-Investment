import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Search, ShoppingBag, Music, RotateCcw } from 'lucide-react';
import { db } from '../firebase';
import {
  siteId,
  BRAND_INFO,
  DEFAULT_PRODUCT_IMAGE,
  PAGE_HERO_IMAGES,
  PRODUCT_CATEGORIES,
  CATEGORY_META,
  PRODUCT_BRANDS,
} from '../constants/siteConfig';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { DEFAULT_PRODUCTS, ProductItem } from '../constants/defaultData';
import { extractNumericPrice } from '../utils/dateFormat';

type CategoryName = (typeof PRODUCT_CATEGORIES)[number];

function inferCategory(product: ProductItem): CategoryName {
  if (
    product.category &&
    (PRODUCT_CATEGORIES as readonly string[]).includes(product.category)
  ) {
    return product.category as CategoryName;
  }
  const text = `${product.name} ${product.shortDescription || ''}`.toLowerCase();
  if (text.includes('cable') || text.includes('speakon') || text.includes('jack plug') || text.includes('xlr')) {
    return 'Audio Cables & Connectors';
  }
  if (text.includes('focusrite') || text.includes('m-audio') || text.includes('icon star') || text.includes('interface')) {
    return 'Studio Equipment';
  }
  if (text.includes('world king') || text.includes('sonoko') || text.includes('modern day') || text.includes('hamarsh') || text.includes('public address')) {
    return 'Public Address (PA) Systems';
  }
  if (text.includes('drum')) {
    return 'Drum Sets';
  }
  if (text.includes('mixer')) {
    return 'Audio Mixers';
  }
  if (text.includes('amplifier')) {
    return 'Amplifiers';
  }
  if (text.includes('microphone') || text.includes('shure') || text.includes('pro-hero') || text.includes('nice')) {
    return 'Microphones';
  }
  if (text.includes('speaker') || text.includes('subwoofer') || text.includes('jbl') || text.includes('blackstar')) {
    return 'Speakers & Sound Systems';
  }
  return 'Musical Instruments';
}

function inferBrand(product: ProductItem): string {
  if (product.brand && product.brand.trim()) return product.brand.trim();
  const haystack = `${product.name} ${product.shortDescription || ''}`.toLowerCase();
  for (const b of PRODUCT_BRANDS) {
    if (haystack.includes(b.toLowerCase())) return b;
  }
  if (haystack.includes('sound praise')) return 'Sound Praise (SP)';
  return 'Yamaha';
}

function sanitizeProductImage(url: string | undefined): string {
  if (!url || url.trim() === '' || url.startsWith('/images/')) {
    return DEFAULT_PRODUCT_IMAGE;
  }
  return url;
}

export default function Products() {
  const { settings } = useSiteSettings();
  const [products, setProducts] = useState<ProductItem[]>(DEFAULT_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'position' | 'name' | 'price-asc' | 'price-desc'>(
    'position'
  );

  useEffect(() => {
    const q = query(
      collection(db, 'sites', siteId, 'products'),
      orderBy('position', 'asc')
    );
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          setProducts(DEFAULT_PRODUCTS);
        } else {
          const items = snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<ProductItem, 'id'>),
          }));
          setProducts(items);
        }
      },
      (err) => {
        console.error('Products listener error:', err);
        setProducts(DEFAULT_PRODUCTS);
      }
    );
    return () => unsub();
  }, []);

  const enrichedProducts = useMemo(() => {
    return products.map((p) => ({
      ...p,
      resolvedCategory: inferCategory(p),
      resolvedBrand: inferBrand(p),
      resolvedSubCategory: p.subCategory || '',
      resolvedImage: sanitizeProductImage(p.imageUrl),
    }));
  }, [products]);

  const availableBrands = useMemo(() => {
    const brandSet = new Set<string>();
    enrichedProducts.forEach((p) => brandSet.add(p.resolvedBrand));
    const ordered: string[] = PRODUCT_BRANDS.filter((b) => brandSet.has(b));
    const extras = Array.from(brandSet).filter(
      (b) => !(PRODUCT_BRANDS as readonly string[]).includes(b)
    );
    return [...ordered, ...extras];
  }, [enrichedProducts]);

  const getProductBaseNumericPrice = (p: ProductItem): number => {
    if (p.variations && p.variations.length > 0) {
      const first = p.variations[0];
      return extractNumericPrice(first.salePrice || first.price);
    }
    return extractNumericPrice(p.salePrice || p.price);
  };

  const filteredAndSorted = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const filtered = enrichedProducts.filter((p) => {
      if (selectedCategory !== 'All' && p.resolvedCategory !== selectedCategory) {
        return false;
      }
      if (selectedBrand !== 'All' && p.resolvedBrand !== selectedBrand) {
        return false;
      }
      if (!term) return true;
      const variationsText = (p.variations || []).map((v) => v.name).join(' ');
      const searchable = `${p.name} ${p.resolvedBrand} ${p.resolvedCategory} ${p.resolvedSubCategory} ${p.shortDescription || ''} ${variationsText}`.toLowerCase();
      return searchable.includes(term);
    });

    const sorted = [...filtered];
    if (sortBy === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'price-asc') {
      sorted.sort((a, b) => getProductBaseNumericPrice(a) - getProductBaseNumericPrice(b));
    } else if (sortBy === 'price-desc') {
      sorted.sort((a, b) => getProductBaseNumericPrice(b) - getProductBaseNumericPrice(a));
    } else {
      sorted.sort((a, b) => (a.position || 0) - (b.position || 0));
    }
    return sorted;
  }, [enrichedProducts, searchTerm, selectedCategory, selectedBrand, sortBy]);

  const groupedSections = useMemo(() => {
    return PRODUCT_CATEGORIES.map((categoryName, idx) => {
      const items = filteredAndSorted.filter((p) => p.resolvedCategory === categoryName);
      return {
        index: idx + 1,
        name: categoryName,
        meta: CATEGORY_META[categoryName],
        items,
      };
    }).filter((section) => section.items.length > 0);
  }, [filteredAndSorted]);

  const hasActiveFilters =
    searchTerm.trim() !== '' || selectedCategory !== 'All' || selectedBrand !== 'All';

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedBrand('All');
    setSortBy('position');
  };

  const buildWhatsAppLink = (product: ProductItem, brand: string) => {
    let text = `Hello ${BRAND_INFO.name}, I would like to inquire/order: ${product.name} (${brand})`;
    if (product.variations && product.variations.length > 0) {
      const varLines = product.variations
        .map((v) => `${v.name} (${v.salePrice || v.price})`)
        .join(', ');
      text += ` — Options: ${varLines}`;
    } else if (product.salePrice || product.price) {
      text += ` (${product.salePrice || product.price})`;
    }
    return `${BRAND_INFO.whatsappUrl}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div>
      <Helmet>
        <title>
          Musical Instruments & Pro Audio Catalog | {settings.siteName || BRAND_INFO.name}
        </title>
        <meta
          name="description"
          content="Dealers in all kinds of musical instruments, public Address system and General Goods at BB7C, Alaba Int'l Market, Lagos. Browse Yamaha, JBL, Shure, Ahuja, Sound Praise, Pearl, Tama, Focusrite & M-Audio."
        />
      </Helmet>

      {/* 1. Crystal Clear Product Showroom Hero */}
      <section className="relative bg-stone-950 text-white py-28 md:py-32 overflow-hidden">
        <img
          src={PAGE_HERO_IMAGES.products}
          alt="NDU PAT Investment Showroom Display"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/60 pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <span className="inline-flex items-center gap-2 bg-black/30 backdrop-blur-md border border-white/25 text-lime-200 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
            <Music className="w-4 h-4 text-lime-400" />
            BB7C, Alaba Int’l Market · Factory-Verified Catalog
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-balance [text-shadow:0_4px_24px_rgba(0,0,0,0.7)]">
            Musical Instruments & Sound Systems
          </h1>
          <p className="text-white/95 max-w-3xl mx-auto text-base sm:text-xl font-medium leading-relaxed [text-shadow:0_2px_14px_rgba(0,0,0,0.75)]">
            {BRAND_INFO.dealersStatement} — featuring Yamaha, JBL, Shure, Ahuja, Sound Praise (SP), Pearl, Tama, Focusrite, M-Audio & complete PA accessories.
          </p>
        </div>
      </section>

      {/* 2. Search, Brand & Category Navigation Controls */}
      <section className="py-14 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Controls Panel */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200/80 space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              {/* Search Bar */}
              <div className="lg:col-span-5 relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search guitars, Yamaha keyboards, JBL, Shure, cables..."
                  className="w-full rounded-full border border-stone-200 pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                />
              </div>

              {/* Brand Filter */}
              <div className="lg:col-span-4 flex items-center gap-2.5">
                <label
                  htmlFor="brand-filter"
                  className="text-xs font-bold text-stone-500 uppercase tracking-wider shrink-0"
                >
                  Brand
                </label>
                <select
                  id="brand-filter"
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full rounded-full border border-stone-200 px-4 py-3 text-sm font-medium bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-lime-500"
                >
                  <option value="All">All Brands ({availableBrands.length})</option>
                  {availableBrands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Selector */}
              <div className="lg:col-span-3 flex items-center gap-2.5">
                <label
                  htmlFor="sort-filter"
                  className="text-xs font-bold text-stone-500 uppercase tracking-wider shrink-0"
                >
                  Sort
                </label>
                <select
                  id="sort-filter"
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target.value as 'position' | 'name' | 'price-asc' | 'price-desc'
                    )
                  }
                  className="w-full rounded-full border border-stone-200 px-4 py-3 text-sm font-medium bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-lime-500"
                >
                  <option value="position">Featured Catalog</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Category Filter Buttons */}
            <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory('All')}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  selectedCategory === 'All'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                All Categories ({enrichedProducts.length})
              </button>

              {PRODUCT_CATEGORIES.map((category) => {
                const count = enrichedProducts.filter(
                  (p) => p.resolvedCategory === category
                ).length;
                if (count === 0) return null;
                const active = selectedCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                      active
                        ? 'bg-lime-600 text-white shadow-sm'
                        : 'bg-stone-100 text-stone-700 hover:bg-lime-50 hover:text-lime-700'
                    }`}
                  >
                    {category} ({count})
                  </button>
                );
              })}
            </div>

            {/* Active Filter Summary */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500">
              <span className="tabular-nums">
                Showing <strong className="text-stone-800">{filteredAndSorted.length}</strong>{' '}
                {filteredAndSorted.length === 1 ? 'product' : 'products'} across{' '}
                <strong className="text-stone-800">{groupedSections.length}</strong>{' '}
                {groupedSections.length === 1 ? 'category' : 'categories'}
              </span>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 text-lime-700 hover:text-lime-800 font-bold cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* 3. Organized Category Sections */}
          {groupedSections.length === 0 ? (
            <div className="bg-white rounded-3xl p-14 text-center border border-stone-200 space-y-4">
              <p className="text-stone-600 font-medium">
                No instruments or sound equipment matched your current filters.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-2 bg-lime-600 hover:bg-lime-700 text-white text-sm font-bold px-6 py-3 rounded-full cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                View All Products
              </button>
            </div>
          ) : (
            <div className="space-y-16">
              {groupedSections.map((section) => (
                <div key={section.name} className="space-y-6">
                  {/* Category Section Header */}
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-4 border-b border-stone-200">
                    <div className="space-y-1">
                      <p className="text-xs font-bold uppercase tracking-widest text-lime-600">
                        Category {section.meta.code}
                      </p>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                        {section.name}
                      </h2>
                      <p className="text-sm text-stone-600 max-w-2xl">
                        {section.meta.summary}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-stone-500 tabular-nums shrink-0">
                      {section.items.length}{' '}
                      {section.items.length === 1 ? 'listing' : 'listings'}
                    </span>
                  </div>

                  {/* 3-Column Product Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                    {section.items.map((product) => (
                      <article
                        key={product.id}
                        className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-stone-200/80 transition-all duration-200 flex flex-col group hover:-translate-y-0.5"
                      >
                        {/* Sharp 4:3 Studio Product Photo */}
                        <div className="aspect-[4/3] bg-stone-100 border-b border-stone-100 overflow-hidden">
                          <img
                            src={product.resolvedImage}
                            alt={`${product.resolvedBrand} ${product.name}`}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        <div className="p-6 flex-1 flex flex-col">
                          {/* Unboxed Quiet Metadata Line (Brand · Sub-type) */}
                          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                            <span className="text-lime-700">{product.resolvedBrand}</span>
                            {product.resolvedSubCategory && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="truncate">{product.resolvedSubCategory}</span>
                              </>
                            )}
                          </div>

                          <h3 className="text-lg font-bold text-stone-900 leading-snug mb-2">
                            {product.name}
                          </h3>

                          <p className="text-sm text-stone-600 leading-relaxed mb-5 flex-1">
                            {product.shortDescription}
                          </p>

                          {/* Variations / Price Display */}
                          <div className="mb-5 pt-4 border-t border-stone-100">
                            {product.variations && product.variations.length > 0 ? (
                              <div className="space-y-1.5">
                                {product.variations.map((v, vIdx) => (
                                  <div
                                    key={vIdx}
                                    className="flex items-center justify-between gap-3 text-xs sm:text-sm tabular-nums"
                                  >
                                    <span className="text-stone-600 font-medium truncate">
                                      {v.name}
                                    </span>
                                    <div className="flex items-center gap-2 shrink-0">
                                      {v.salePrice ? (
                                        <>
                                          <span className="line-through text-stone-400 text-xs">
                                            {v.price}
                                          </span>
                                          <span className="font-bold text-lime-700">
                                            {v.salePrice}
                                          </span>
                                        </>
                                      ) : (
                                        <span className="font-bold text-lime-700">
                                          {v.price}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex items-baseline justify-between gap-3 tabular-nums">
                                <div className="flex items-baseline gap-2.5">
                                  {product.salePrice ? (
                                    <>
                                      <span className="text-xl font-extrabold text-lime-700">
                                        {product.salePrice}
                                      </span>
                                      <span className="text-xs line-through text-stone-400">
                                        {product.price}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-xl font-extrabold text-lime-700">
                                      {product.price}
                                    </span>
                                  )}
                                </div>
                                {typeof product.stock === 'number' && product.stock > 0 && (
                                  <span className="text-xs font-medium text-stone-500">
                                    In Stock
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          <a
                            href={buildWhatsAppLink(product, product.resolvedBrand)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full inline-flex items-center justify-center gap-2 bg-stone-900 hover:bg-lime-600 text-white font-bold text-sm py-3.5 px-6 rounded-full transition-colors whitespace-nowrap"
                          >
                            <ShoppingBag className="w-4 h-4 shrink-0" />
                            Order via WhatsApp
                          </a>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
