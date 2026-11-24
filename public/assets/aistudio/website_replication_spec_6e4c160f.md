# Website Replication Specification (Exact Blueprint)

> **How to use this document:**  
> Drop this Markdown file into a new **Google AI Studio Build** project (or provide it to a developer/coding agent) and instruct:  
> *"Build this exact website strictly following every specification, route, UI layout, data schema, security rule, and feature in this document."*

---

## 1. Project Overview & Identity

- **Platform Type:** Holistic Health & Naturopathic Wellness Center Web Application + Full Admin CMS Portal
- **Default Brand Name:** `Alayo Health and Wellness Center` (short: `Alayo Health & Wellness`)
- **Tagline:** `We work with Nature to nurture your health.`
- **Established:** `1993` (`Est. 1993 | Over 30 Years of Excellence`)
- **Founder / Chief Consultant:** `Prof. Kayode Oseni` (CEO & Chief Consultant)
- **Primary Contact Details (Configurable Constants):**
  - **WhatsApp / Phone 1:** `+2348034170747` (`08034170747`, link: `https://wa.me/2348034170747`)
  - **Phone 2:** `09125267562`
  - **Primary Admin & Contact Email:** `osenialayo@gmail.com`
  - **Secondary Authorized Admin Email:** `kennywemson1@gmail.com`
  - **Head Office:** `Alayo Villa, Idiori, off Ilesheawo, Kipe. Abeokuta, Ogun State`
  - **Branch Office:** `#1. Tanimowo Shopping Complex, 100, Abeokuta-Ibadan road, Adatan-Carwash, Abeokuta, Ogun State`
  - **Business Hours:** `Mon-Fri: 9am - 5pm`, `Sat: 10am - 2pm`
- **Multi-tenant Site Namespace (`siteId`):** `"siteB"` (stored in `src/constants/siteConfig.ts`; all Firestore collections live under `sites/{siteId}/...`)
- **Currency & Date Standard:**
  - Currency symbol: Nigerian Naira (`₦`)
  - Strict date format across the entire site (public & admin): **`dd/mm/yyyy`** (via `en-GB` locale or explicit `dd/mm/yyyy` formatting)

---

## 2. Tech Stack, Dependencies & Deployment Architecture

### 2.1 Core Stack
- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite` + `@import "tailwindcss";` in `src/index.css`)
- **Routing:** `react-router-dom` v7 (`BrowserRouter`, `Routes`, `Route`, `Navigate`, `Outlet`)
- **SEO & Metadata:** `react-helmet-async` (`HelmetProvider` wrapping `<App />` in `src/main.tsx`)
- **Animations:** `motion/react` (`motion.div`, `motion.nav`, `AnimatePresence`)
- **Icons:** `lucide-react`
- **Markdown Rendering:** `react-markdown` + `remark-gfm`
- **Image Cropping:** `react-easy-crop`
- **Backend / Database / Auth / Storage:** Firebase (`firebase/app`, `firebase/auth`, `firebase/firestore`, `firebase/storage`)
- **Server (SPA Routing + Dev/Prod Hosting):** Express (`express`) + `tsx` running `server.ts` on port `3000`

### 2.2 Required `package.json` Scripts
```json
{
  "type": "module",
  "scripts": {
    "dev": "tsx server.ts",
    "start": "node server.ts",
    "build": "vite build",
    "preview": "vite preview",
    "clean": "rm -rf dist",
    "lint": "tsc --noEmit"
  }
}
```
> **Note:** In production deployments, if `node server.ts` is executed directly on Node without transpiling, ensure Node supports TypeScript stripping or compile `server.ts` / use `tsx server.ts`.

### 2.3 SPA Fallback Server (`server.ts`)
Must prevent 404 errors when users refresh nested routes (e.g., `/products`, `/blog/post-slug`) or open shared links directly from WhatsApp/social apps:
- Listen on port `3000` (`0.0.0.0`).
- **Development (`process.env.NODE_ENV !== 'production'`):** Mount `vite.middlewares` with `appType: 'spa'`.
- **Production:** Serve static assets from `path.join(process.cwd(), 'dist')` via `express.static(distPath)`, and add a catch-all `app.get('*', ...)` fallback that sends `path.join(distPath, 'index.html')` (returning HTTP 500 with log if `index.html` is missing).

### 2.4 `index.html`
- `<title>Alayo Health and Wellness Center</title>`
- Inline SVG leaf favicon (`#84cc16`, `#65a30d`, `#4d7c0f`)

---

## 3. Design System & Visual Language

- **Color Palette:**
  - **Primary Accent:** Lime (`lime-500` `#84cc16`, `lime-600` `#65a30d`, `lime-700`, `lime-100`, `lime-50`)
  - **Neutral / Surface:** Warm Stone (`stone-50` page background, `white` cards, `stone-100` borders/subtle surfaces, `stone-600`/`stone-700` body text, `stone-800`/`stone-900` headings & dark hero/footer/admin sidebar)
  - **Semantic Badges:**
    - Success / Published / Confirmed / Approved / Delivered: `bg-green-100 text-green-700` or `bg-lime-100 text-lime-700`
    - Warning / Pending / Draft / Processing: `bg-yellow-100 text-yellow-700` or `bg-amber-100 text-amber-700`
    - Info / Unread / Shipped: `bg-blue-100 text-blue-700`
    - Danger / Sale / Delete: `text-red-600`, `bg-red-100 text-red-600`
- **Typography & Geometry:**
  - Clean sans-serif (`font-sans`), bold display headings (`font-extrabold` / `font-bold`), tight tracking on headers.
  - Generous card radii: `rounded-2xl`, `rounded-3xl`, `rounded-[2.5rem]`, `rounded-[3rem]`; pill buttons (`rounded-full`) on public CTAs/filters; `rounded-lg` / `rounded-xl` in admin UI.
  - Soft layered shadows (`shadow-sm`, `shadow-xl`, `shadow-2xl`) and subtle borders (`border-stone-100`, `border-stone-200`).
- **Default Media Assets:**
  - **Default Logo:** `https://i.imgur.com/J8eXjYF.jpg`
  - **Default Hero Background:** `https://i.imgur.com/bx3aTpx.jpg`
  - **Default CEO Photo:** `https://i.imgur.com/91WDLQr.jpg`
  - **Default Product Image (`DEFAULT_PRODUCT_IMAGE`):** `https://i.imgur.com/oeUvjJz.jpg` (used automatically on both `/products` and `/admin/products` whenever a product has no custom `imageUrl`)

---

## 4. Global Configuration, Hooks & Utilities

### 4.1 `src/constants/siteConfig.ts`
- `export const siteId = "siteB";`
- `export const siteAdminEmail = "osenialayo@gmail.com";`
- `export const additionalAdminEmails = [];`
- `export const isAdmin = (email: string | null | undefined) => !!email && (email === siteAdminEmail || additionalAdminEmails.includes(email));`
  - *Note:* Also support `kennywemson1@gmail.com` in `firestore.rules` and global idle-timeout check in `App.tsx` (or include it in `additionalAdminEmails`).
- `export const DEFAULT_PRODUCT_IMAGE = "https://i.imgur.com/oeUvjJz.jpg";`

### 4.2 `src/hooks/useSiteSettings.ts`
- Subscribes via `onSnapshot` to `doc(db, 'sites', siteId, 'settings', 'site')`.
- Caches settings in `localStorage` under `site_settings_cache_${siteId}` for instant initial render before Firestore responds.
- Provides `defaultSettings`:
  - `siteName`: `'Alayo Health & Wellness'`
  - `logoUrl`, `heroBgUrl`, `heroTitle`, `heroSubtitle`, `aboutBgUrl`, `aboutFacts` (array of `{ icon, title, desc }`), `servicesBgUrl`, `blogBgUrl`, `ceoPhotoUrl`, `copyrightText`.
- Includes `ensureDirectImgur(url)` helper (converts `https://imgur.com/<id>` to `https://i.imgur.com/<id>.jpg`) and `isDefaultOrEmpty(url)` check to fall back cleanly to `defaultSettings`.

### 4.3 Admin Session & Inactivity Timeout
- **Global Idle Tracker (`App.tsx`):** When an admin is logged in, tracks `mousedown`, `mousemove`, `keypress`, `scroll`, `touchstart`, `click`, `keydown`, and `visibilitychange` across the entire site, updating `localStorage.setItem('admin_last_activity', Date.now().toString())`. Signs out automatically after **30 minutes** (`1800000` ms).
- **Admin Header Countdown (`src/hooks/useIdleTimeout.ts`):** Updates every second and returns `{ minutes, seconds, isExpiringSoon }` (flags `isExpiringSoon` when `< 5 minutes` remaining). On expiry, clears `admin_last_activity`, calls `signOut(auth)`, and redirects to `/admin/login`.

### 4.4 `src/components/ErrorBoundary.tsx` & `src/utils/firebaseErrors.ts`
- React Error Boundary catching runtime errors gracefully.
- `handleFirestoreError(error, operationType, path)` logs structured JSON diagnostic info (`authInfo` + `operationType` + `path`) and throws an `Error` for Firestore permission/operation failures.

### 4.5 `src/components/Pagination.tsx`
- Reusable pagination component (`currentPage`, `totalPages`, `onPageChange`). Returns `null` if `totalPages <= 1`. Renders Previous chevron button, numbered square buttons (active: `bg-lime-600 text-white shadow-md`), and Next chevron button.

### 4.6 `src/components/MarkdownRenderer.tsx`
- Uses `react-markdown` with `remark-gfm` inside a styled Tailwind `prose prose-stone lg:prose-xl max-w-none` container with custom lime links (`prose-a:text-lime-600`), styled tables, rounded images (`prose-img:rounded-3xl prose-img:shadow-lg`), and lime-bordered blockquotes (`prose-blockquote:border-l-4 prose-blockquote:border-lime-500`).

---

## 5. Routing Map (`src/App.tsx`)

### Public Routes (wrapped in `<Layout user={user} />`)
| Path | Component | Purpose |
| :--- | :--- | :--- |
| `/` | `Home` | Landing page |
| `/about` | `About` | Founder bio, quick facts, publications, dark testimonials |
| `/services` | `Services` | Holistic services list + Appointment booking modal |
| `/products` | `Products` | Herbal products catalog + search/sort/pagination + WhatsApp order |
| `/testimonials` | `Testimonials` | Paginated client/student reviews with "Read More" toggle |
| `/research` | `Research` | Published books & research extracts + WhatsApp order |
| `/blog` | `Editorial` | Editorial articles listing + category filter + pagination |
| `/blog/:slug` | `BlogPost` | Single article view + SEO/OG tags + Share buttons + Comments |
| `/editorial` | `Editorial` | Alias of `/blog` |
| `/editorial/:slug` | `BlogPost` | Alias of `/blog/:slug` |
| `/contact` | `Contact` | Contact form, clinic info, Head & Branch office cards |
| `/sitemap` | `Sitemap` | Visual architecture tree of Public & Admin routes |

### Admin Routes
| Path | Component | Purpose |
| :--- | :--- | :--- |
| `/admin/login` | `AdminLogin` | Email/password login + forgot password reset |
| `/admin` (protected, wrapped in `AdminLayout`) | `Dashboard` | 5 live metric cards + live Recent Activity feed with Clear All |
| `/admin/appointments` | `Appointments` | Manage consultation requests |
| `/admin/products` | `AdminProducts` | Manage products & variations |
| `/admin/testimonials` | `AdminTestimonials` | Manage testimonials |
| `/admin/books` | `AdminBooks` | Manage books & research extracts |
| `/admin/blog` | `AdminEditorial` | Full-screen editorial CMS with auto-slugify & SEO tabs |
| `/admin/services` | `AdminServices` | Manage services + "Restore Originals" seed |
| `/admin/comments` | `CommentModeration` | Moderate comments & replies across editorial/products/services |
| `/admin/settings` | `AdminSettings` | Global visual identity, text, quick facts, and images |
| `/admin/messages` | `AdminMessages` | View & manage contact inquiries (linked from `/sitemap`) |
| `/admin/orders` | `Orders` | Manage product orders (linked from `/sitemap`) |

> **Auth Guard on `/admin`:** Unauthenticated users are redirected via `<Navigate to="/admin/login" replace />` while auth state loads with a centered `lime-600` spinner.

---

## 6. Shared Public Shell (`Layout`, `Navbar`, `Footer`)

### 6.1 `Navbar.tsx`
- Sticky translucent top bar: `bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50`, height `h-20`.
- **Left Brand:** Circular logo (`h-12 w-12 rounded-full object-cover`) from `settings.logoUrl` + two-line title: `Alayo Health` (`font-bold text-xl text-stone-800`) and `& Wellness Center` (`text-xs text-lime-600 uppercase tracking-wider`).
- **Desktop Menu (`md:flex`):** 8 links in exact order:
  1. `Home` (`/`)
  2. `About` (`/about`)
  3. `Services` (`/services`)
  4. `Products` (`/products`)
  5. `Testimonials` (`/testimonials`)
  6. `Research` (`/research`)
  7. `Editorial` (`/blog`)
  8. `Contact` (`/contact`)
  - Active link style: `text-lime-600 border-b-2 border-lime-500`.
- **Mobile Menu:** Hamburger/X toggle opening an animated dropdown list.

### 6.2 `Layout.tsx` (Floating WhatsApp Button)
- Renders `<Navbar />`, `<main className="flex-grow"><Outlet /></main>`, `<Footer />`.
- **Floating WhatsApp FAB:** Fixed at `bottom-6 right-6 z-50`:
  - Links directly to `https://wa.me/2348034170747` (`target="_blank" rel="noopener noreferrer"`).
  - Circular lime button (`bg-lime-500 hover:bg-lime-600 text-white p-4 rounded-full shadow-2xl border-4 border-white hover:scale-110`) with WhatsApp SVG icon and hover-expanding label `"WhatsApp Us"`.

### 6.3 `Footer.tsx`
- Dark footer (`bg-stone-900 text-stone-300 pt-16 pb-8`), 4-column responsive grid:
  1. **Brand:** Logo, `Alayo Health & Wellness Center`, mission blurb, WhatsApp icon link.
  2. **Quick Links:** `Home` (`/`), `About Us` (`/about-us` or `/about` — ensure links route accurately to `/about`, `/services`, `/products`, `/blog`, `/contact`), with lime `ArrowRight` icon.
  3. **Our Services:** Static list (`Naturopathic Consultation`, `Herbal Remedies`, `Psychic & Energy Healing`, `Crystal Therapy`, `Chakras Balancing`, `Health Education`).
  4. **Contact Us:** Head Office address (`MapPin`), phones `08034170747` & `09125267562` (`Phone`), email `osenialayo@gmail.com` (`Mail`).
- **Bottom Bar:** Dynamic copyright with subtle link on `"Center"` pointing to `/admin`, plus `Est. 1993 | Natural Medicine Modalities` and `<Link to="/sitemap">Sitemap</Link>`.

---

## 7. Public Pages — Exact Layout & Feature Specs

### 7.1 Home (`/`, `src/pages/Home.tsx`)
1. **Hero Section:**
   - Dark `bg-stone-900` with `settings.heroBgUrl` (`opacity-40`) + `bg-stone-900/60` overlay.
   - Pill badge: `Est. 1993 | Over 30 Years of Excellence` with `Leaf` icon.
   - `<h1>`: `settings.heroTitle` (supports `<br/>` splitting).
   - Subtitle: `settings.heroSubtitle`.
   - **Primary CTA Button:** `"View Our Products"` (`bg-lime-500 hover:bg-lime-600 rounded-full`) linking directly to **`/products`** (specifically NOT "Book Consultation").
   - **Secondary CTA Button:** `"Explore Services"` (glassmorphic `bg-white/10 border-white/30 rounded-full`) linking to `/services`.
2. **Trust Indicators Strip:**
   - `bg-lime-50 py-16 -mt-8 rounded-t-[3rem] relative z-20`, 3-column divided grid:
     - `30+ Years Experience` (`ShieldCheck`)
     - `100% Natural Remedies` (`Leaf`)
     - `Holistic Approach` (`Heart`)
3. **About The Founder Snippet:**
   - 2-column grid (`bg-white py-24`).
   - Left: Tilted `bg-lime-100` backdrop behind `settings.ceoPhotoUrl` (`aspect-[4/5] rounded-3xl`) + floating white card (`5.0 Rating`, 5 yellow stars, `"Trusted by thousands of patients worldwide."`).
   - Right: Eyebrow `"About The Founder"`, heading `"Meet Prof. Kayode Oseni: Your Trusted Guide to Natural Healing"`, bio paragraphs mentioning *Healers Manual (2018)* and *The Spirituality of Healing (2025)*, link `"Read Full Biography"` -> `/about`.
4. **Services Overview (`bg-stone-50 py-24`):**
   - Header: `Our Expertise` / `Comprehensive Holistic Care`.
   - 3-column card grid (`Naturopathic Consultation`, `Herbal Remedies`, `Psychic & Energy Healing`) with image header, gradient overlay, floating lime icon badge, description, and `"Learn more"` link -> `/services`.
5. **Testimonials Preview (`bg-white py-24`):**
   - Header: `Student & Patient Reviews` / `Voices of Healing & Learning`.
   - 3-column card grid (`Dr. Ellen` - Ghana, `Prof. Hippolyte N. MUYINGI` - Kenya, `Dr. Samson Ndidi Ehijinwa` - Port Harcourt, Nigeria) with quote icon, italic text, author & location, and `"View All Testimonials"` link -> `/testimonials`.
6. **Editorial / Educational Community CTA (`bg-lime-600 py-32`):**
   - Subtle SVG leaf pattern background.
   - Pill `"Educational Community"`, title `"Stay Connected with Nature’s Wisdom"`, white pill button `"Explore Editorial Page"` -> `/editorial`.

### 7.2 About (`/about`, `src/pages/About.tsx`)
- **Header Banner:** `settings.aboutBgUrl` at 20% opacity over `bg-stone-900`, title `"About Us"`.
- **Main 12-Column Grid:**
  - **Left (5 cols):** Portrait card (`settings.ceoPhotoUrl`, `aspect-[3/4]`) with bottom gradient overlay (`Prof. Kayode Oseni` / `CEO & Chief Consultant`) + **Quick Facts** card dynamically mapping `settings.aboutFacts` (rendering `ShieldCheck`, `GraduationCap`, `Award`, `Leaf`, `Heart`, or `BookOpen`).
  - **Right (7 cols):** Full biography, *Leadership & Legacy*, lime-accented mission blockquote, clickable *Publications* cards (`Healers Manual` 2018 & `The Spirituality of Healing` 2025) navigating to `/research`.
- **Bottom Dark Section (`bg-stone-900 text-white py-24`):** Loads live `testimonials` from Firestore ordered by `position` `asc` and renders a 3-column `"Healing Journeys"` grid with avatar initial circle.

### 7.3 Services (`/services`, `src/pages/Services.tsx`)
- **Header Banner:** `settings.servicesBgUrl` over `bg-stone-900`, title `"Our Services"`.
- **Services List:**
  - Subscribes to `sites/{siteId}/services` ordered by `position` `asc`. Falls back to `DEFAULT_SERVICES` (4 core services) if Firestore collection is empty.
  - Alternating left/right layout (`index % 2 !== 0 ? 'lg:flex-row-reverse' : ''`), 4:3 image, icon tile, title, description, bulleted `features` list, and `"Book This Service"` pill button.
- **Appointment Booking Modal (`bookingService !== null`):**
  - Form fields (all required except message):
    1. `Full Name` (`name`, text)
    2. `Email Address` (`email`, email)
    3. `Phone Number` (`phone`, tel)
    4. `Preferred Date` (`date`, `<input type="date">`, **must be converted from `YYYY-MM-DD` to `dd/mm/yyyy` before saving to Firestore**)
    5. `Preferred Time` (`time`, `<select>`: `09:00 AM` through `04:00 PM` hourly)
    6. `Message (Optional)` (`message`, textarea)
  - Submits to `sites/{siteId}/appointments` with `service: bookingService`, `status: 'Pending'`, `createdAt: serverTimestamp()`.
  - Shows `"Booking Received!"` confirmation state with green checkmark.
- **Bottom CTA (`bg-lime-50`):** `"WhatsApp Consultation"` external link + `"View Clinic Locations"` -> `/contact`.

### 7.4 Products (`/products`, `src/pages/Products.tsx`)
- **Header Banner:** `bg-stone-900` with herbal background image, title `"Herbal Products"`.
- **Toolbar:**
  - Search input (`Search products...`, matches `name` or `shortDescription`).
  - Sort dropdown: `Default Order` (`position`), `Name (A-Z)`, `Price: Low to High` (`price-asc`), `Price: High to Low` (`price-desc`).
- **Grid & Pagination:** 3-column grid, **`ITEMS_PER_PAGE = 6`**, resets to page 1 on search/sort change.
- **Product Card:**
  - `h-72` image container displaying `product.imageUrl || DEFAULT_PRODUCT_IMAGE` (`object-contain p-2` with hover zoom).
  - Product `name`, 3-line clamped `shortDescription`.
  - **Price Display:**
    - If `variations && variations.length > 0`: lists each variation (`{v.name}: {v.salePrice ? red salePrice + strikethrough price : lime price}`).
    - Else: shows strikethrough `product.price` (if `salePrice` exists) + bold `text-2xl text-lime-600` `product.salePrice || product.price`.
  - **Order Button:** Opens WhatsApp (`https://wa.me/2348034170747?text=...`) pre-filled with product name and all variation prices if present.

### 7.5 Testimonials (`/testimonials`, `src/pages/Testimonials.tsx`)
- Subscribes to `sites/{siteId}/testimonials` ordered by `position` `asc`.
- 3-column grid, **`ITEMS_PER_PAGE = 6`**, uniform card height (`flex flex-col h-full`).
- **Read More Toggle:**
  - Uses `expandedId` state so expanding one card doesn't stretch others unnecessarily by default.
  - Truncates testimonials longer than **280 characters** (`testimonial.text.length > 280`) to 280 chars + `"..."` and renders a `"Read More"` / `"Read Less"` toggle button (`text-lime-600 font-bold text-sm`).
- Bottom `bg-lime-600` CTA linking to WhatsApp.

### 7.6 Research & Publications (`/research`, `src/pages/Research.tsx`)
- Subscribes to `sites/{siteId}/books` ordered by `position` `asc`, filtering `book.status === 'Published'`.
- **`ITEMS_PER_PAGE = 6`**, horizontal split cards (`md:w-2/5` cover with lime price pill top-left; `md:w-3/5` title, author, preface, WhatsApp order button).
- **Expandable Preface:** Clamps at 6 lines (`line-clamp-6`); if `preface.length > 300`, shows `"Read Full Preface"` / `"Read Less"` toggle.
- Bottom `"Contribute to the Archive"` section linking to `/contact`.

### 7.7 Editorial Listing (`/blog` & `/editorial`, `src/pages/Blog.tsx`)
- Subscribes to `sites/{siteId}/editorial` where `status == 'Published'`, sorted client-side by `position`.
- **Category Filter Pills:** `All`, `Naturopathy & Herbal Medicine`, `Chakras & Crystal Therapy`, `Natural Lifestyle`.
- **Category Themes:** Assigns badge color + fallback Unsplash image per category if `post.image` is empty.
- **`ITEMS_PER_PAGE = 6`**, 3-column article cards showing image, category pill, `post.date` (`dd/mm/yyyy`), 2-line title, 3-line excerpt, author, and `"Read Article"` link to `/blog/${post.slug || post.id}`.

### 7.8 Single Article (`/blog/:slug` & `/editorial/:slug`, `src/pages/BlogPost.tsx`)
- **Resolution Logic:**
  1. Queries `sites/{siteId}/editorial` where `slug == slug` (`limit(1)`).
  2. Legacy fallback: Fetches by document ID `doc(db, 'sites', siteId, 'editorial', slug)`. If that document has a `slug`, replaces URL with the slug path (`navigate(newPath, { replace: true })`). If not found, redirects to `/editorial`.
- **SEO & Open Graph (`react-helmet-async` `<Helmet>`):**
  - `<title>{post.metaTitle || `${post.title} | ${settings?.siteName || 'Alayo Health'}`}</title>`
  - `<meta name="description" content={post.metaDescription || post.excerpt} />`
  - `<meta property="og:title" ... />`, `<meta property="og:description" ... />`, `<meta property="og:image" content={post.image} />`, `<meta property="og:type" content="article" />`, `<meta name="twitter:card" content="summary_large_image" />`.
- **Layout:**
  - `h-[70vh] min-h-[500px]` hero cover with gradient overlay, `"Back to Editorial"` link, category pill, large `<h1>`, author initials badge (`KO`), `post.date`, `"Join the conversation"`.
  - Elevated white article card (`-mt-10 rounded-[2.5rem]`): italicized `excerpt` with lime left border + `<MarkdownRenderer content={post.content} />`.
  - **Share Bar:** WhatsApp, Twitter/X, Facebook, LinkedIn, and Copy Link (copies `window.location.href`).
  - **Comments Card:** `<CommentSection collectionName="editorial" docId={post.id} />`.
  - **Dark Bottom CTA:** `"Start Your Healing Journey"` with `"Book Consultation"` (`/services`) and `"Contact Us"` (`/contact`).

### 7.9 Contact (`/contact`, `src/pages/Contact.tsx`)
- **Contact Form:** `name`, `email`, `subject`, `message` -> saves to `sites/{siteId}/messages` with `status: 'Unread'`, `date` formatted in `en-GB` (`dd/mm/yyyy HH:mm`), `createdAt: serverTimestamp()`. Shows `"Message Sent!"` confirmation state.
- **Contact Information Grid:** Phone (`08034170747`, `09125267562`), WhatsApp (`Chat now`), Email (`osenialayo@gmail.com`), Hours (`Mon-Fri: 9am - 5pm`, `Sat: 10am - 2pm`).
- **Clinic Locations Column:** Head Office (Alayo Villa) card + Branch Office (Adatan) card.

### 7.10 Sitemap (`/sitemap`, `src/pages/Sitemap.tsx`)
- Two-column timeline-style architecture cards: **Public Website** (white) and **Admin Portal** (`bg-stone-900`), listing routes with descriptions and direct `<Link>` arrows.

---

## 8. Comment & Moderation System

### 8.1 `src/components/CommentSection.tsx`
- **Props:** `{ collectionName: string; docId: string }`.
- **Authentication Modal:** Triggered by `"Sign in to comment"`. Supports:
  - Email/Password Sign In & Sign Up (with `displayName` on sign-up and show/hide password toggle)
  - Google Sign-In (`GoogleAuthProvider` with `prompt: 'select_account'`)
- **Submission & Approval Rules (CRITICAL):**
  - On submit (comment or reply):
    - `const status = isAdmin(user.email) ? 'approved' : 'pending';`
    - **Admin users:** Comment/reply is immediately `'approved'` and appears directly in the comment thread without moderation.
    - **Non-admin users:** Comment/reply is saved with `status: 'pending'` and triggers a popup (`alert('Your comment is pending approval by the administrator.')` / `'Your reply is pending approval by the administrator.'`).
- **Public Visibility Rule (CRITICAL):**
  - Only comments/replies where `data.status === 'approved' || isAdmin(data.userEmail)` are rendered on the public page! Pending user comments **never** appear in the public comment box until approved by an admin.
- **Features:** Nested replies (`comments/{commentId}/replies`), `"Admin"` badge for admin authors, date formatted strictly as **`dd/mm/yyyy`**, delete button visible on hover for comment owner or admin.

### 8.2 `src/pages/admin/CommentModeration.tsx`
- Scans `['editorial', 'products', 'services']`, fetching all `comments` and `replies` for each document.
- **Filter Tabs:** `pending`, `approved`, `all` (default: `all`).
- **Persistence Rule:** Approving a comment updates `status: 'approved'` in Firestore and updates local item status to `'approved'` — **approved comments MUST remain visible in the Comment Moderation list (under `approved` and `all`) until explicitly deleted**.
- Actions: `"Approve"` button (shown when `status === 'pending'`), `"Delete"` button (with confirmation), `"View Page"` external link, date/time formatted `dd/mm/yyyy HH:mm`, 10 items per page.

---

## 9. Admin Portal (`/admin/*`)

### 9.1 `AdminLogin.tsx` (`/admin/login`)
- Dark stone-900 card header (`Admin Portal` / `Alayo Health & Wellness`).
- Email + Password form with password visibility toggle (`Eye`/`EyeOff`), `"Forgot Password?"` view using `sendPasswordResetEmail`, and helpful network/authorized-domain error messages. Auto-redirects to `/admin` if already authenticated.

### 9.2 `AdminLayout.tsx`
- Full-height flex shell (`h-screen bg-stone-100 flex overflow-hidden`).
- **Sidebar (`w-64 bg-stone-900`):**
  - Title: `Alayo Admin` / `Management Portal`
  - `"Back to Site"` link (`/`)
  - 9 navigation links: `Dashboard`, `Appointments`, `Products`, `Testimonials`, `Books`, `Editorial`, `Services`, `Comments`, `Site Settings`
  - `"Logout"` button at bottom
- **Sticky Top Header:**
  - Current section title
  - Live countdown pill: `"Session expires: MM:SS"` (`bg-stone-50`, green dot) switching to red `"SECURITY TIMEOUT: MM:SS"` when `< 5 minutes` remain.

### 9.3 `Dashboard.tsx` (`/admin`)
- **5 Metric Cards in `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`** (deliberately 3 columns on desktop so cards are wide enough that `"Testimonials"` fits cleanly; *no* "New Orders" or "Unread Messages" cards):
  1. `Pending Appointments` (`Calendar`, `bg-blue-500`) — live count of appointments with `status === 'Pending'`
  2. `Active Products` (`Package`, `bg-indigo-500`)
  3. `Published Books` (`BookOpen`, `bg-emerald-500`)
  4. `Editorial Articles` (`FileText`, `bg-purple-500`)
  5. `Testimonials` (`Star`, `bg-amber-500`)
- **Live `Recent Activity` Feed:**
  - Listens in real time (top 5 each, with fallback listener if index missing) to `appointments` (`Appointment requested by {name}`), `messages` (`New message from {name}`), and `editorial` (`New article published: {title}`).
  - Merges and sorts newest-first (parsing Firestore Timestamps, ISO dates, and `dd/mm/yyyy` dates safely), displaying relative times (`Just now`, `Xm ago`, `Xh ago`, `Xd ago`) up to 8 items.
  - Includes a **`"Clear All"`** button that saves `Date.now()` to `localStorage` (`dashboard_cleared_at`) and immediately hides older activity while allowing newer incoming events to appear.

### 9.4 `Appointments.tsx` (`/admin/appointments`)
- Displays table with columns:
  - **Patient Info:** `name`, `email`, `phone`
  - **Service:** `service`
  - **Schedule:** `date` (`dd/mm/yyyy`) + `time` (lime text)
  - **Status:** `Pending` (yellow), `Confirmed` (green), `Completed` / `Cancelled` (stone)
  - **Action:** `Manage` & `Delete`
- Sort by Date (`Newest First` / `Oldest First`), 10/page pagination, Add/Edit modal with all fields (`name`, `email`, `phone`, `service`, `date` formatted `dd/mm/yyyy`, `time`, `status`, `message`), Delete confirmation modal.

### 9.5 `AdminProducts.tsx` (`/admin/products`)
- **Toolbar:** Search input + Sort by (`Name` [default `'asc'` alphabetical], `Position`, `Price`, `Stock`) + Order (`Ascending` / `Descending`).
- **Table Columns:**
  - `#`: Sequential row number (`(currentPage - 1) * 10 + index + 1`) so admin can see total count/numbering
  - `Pos`: `product.position || 0`
  - `Image`: `product.imageUrl || DEFAULT_PRODUCT_IMAGE`
  - `Product Name`: `name` + truncated `shortDescription`
  - `Price Range`: If `variations.length > 0`, displays `"Variations (N)"` and `"{first.price} - {last.price}"`; otherwise displays `salePrice` + strikethrough `price` or base `price`
  - `Stock`: `product.stock`
  - `Actions`: Edit / Delete
- **Add/Edit Modal:**
  - `position`, `name`, `shortDescription`, `price` (auto-prefixed with `₦`), `salePrice` (optional, auto-prefixed with `₦`), `stock`, **Product Variations** builder (add/remove rows of `name`, `price`, `salePrice`, all auto-prefixed with `₦`), and `<ImageUpload folder="products" aspect={1} />`. Validation ensures either a main price or at least one variation is provided.

### 9.6 `AdminServices.tsx` (`/admin/services`)
- Header has **`"Restore Originals"`** button (`writeBatch` seeding the 4 default Alayo services as `service-seed-1..4`) and `"Add Service"`.
- Table lists `Pos`, `Icon`, `Title`, `Features` count, `Actions`.
- Add/Edit modal includes `title`, `icon` select (`ShieldCheck`, `GraduationCap`, `Award`, `Leaf`, `Heart`, `BookOpen`), `position`, `<ImageUpload folder="services" aspect={16/9} />`, `description`, and dynamic `features[]` bullet editor.

### 9.7 `AdminBooks.tsx` (`/admin/books`)
- Search, Sort by (`Position`, `Title`, `Price`), Order (`Asc`/`Desc`), 10/page pagination.
- Table lists `Pos`, `Cover`, `Title` + preface snippet, `Author`, `Price`, `Status` (`Published`/`Draft`), `Actions`.
- Add/Edit modal with `position`, `title`, `author`, `price` (auto-prefixed `₦`), `status`, `<ImageUpload folder="books" aspect={0.7} />`, manual image URL, `preface`.

### 9.8 `AdminBlog.tsx` (`/admin/blog`)
- Table lists `Pos`, `Title`, `Category`, `Date` (`dd/mm/yyyy`), `Status`, `Actions` + Search, Sort (`Position`, `Date`, `Title`), 10/page pagination.
- **Full-Screen Editor (`isAddModalOpen`):**
  - Top bar with `Back`, title (`New Post`/`Edit Post`), status message banner, status text, `Save` button (with 15s timeout guard).
  - 3 Tabs: `Content`, `SEO` (`metaTitle`, `metaDescription`, `Focus Keywords`), `Preview`.
  - **Auto-Slugify (`slugify`):** Must automatically convert `title` to lowercase, trim, replace spaces with `-`, **strip all special/non-word characters** (e.g., `:`, `'`, `’`, `?`, `!`), collapse multiple `--` into `-`, and trim leading/trailing `-` (both on title change and as fallback on save).
  - Left main pane: `Title`, `Slug (URL)`, `<ImageUpload folder="blog" aspect={16/9} />`, `Or Image URL`, `Display Position`, `Content (HTML/Markdown)` dark monospace textarea.
  - Right sidebar: **Publishing** card (`Status`: Draft/Published, `Publish Date` defaulting to `new Date().toLocaleDateString('en-GB')` i.e. `dd/mm/yyyy`, `Mark as Featured` checkbox) and **Taxonomy** card (`Category` select: `Naturopathy & Herbal Medicine`, `Chakras & Crystal Therapy`, `Natural Lifestyle`).

### 9.9 `AdminTestimonials.tsx` (`/admin/testimonials`)
- Search, 10/page pagination, table (`Pos`, `Author` + `Location`, 2-line `Testimonial Text`, `Actions`), Add/Edit modal.

### 9.10 `AdminSettings.tsx` (`/admin/settings`)
- Edits `sites/{siteId}/settings/site` with dirty-state protection (`isDirtyRef`) and updates `localStorage` cache immediately on save.
- Fields: `Website Name`, `Hero Section Title`, `Hero Section Subtitle`, `Footer Copyright Text`, dynamic **About Page - Quick Facts** editor (`title`, `desc`, `icon` select, Remove, `+ Add Quick Fact`), and 6 `<ImageUpload>` + manual URL pairs (`logoUrl` 1:1, `heroBgUrl` 16:9, `aboutBgUrl` 16:9, `servicesBgUrl` 16:9, `blogBgUrl` 16:9, `ceoPhotoUrl` 1:1).

### 9.11 `AdminMessages.tsx` & `Orders.tsx`
- **`AdminMessages.tsx` (`/admin/messages`):** Lists contact messages sorted by `date`, marks `'Unread'` as `'Read'` when opened in the View modal, supports Delete with confirmation.
- **`Orders.tsx` (`/admin/orders`):** Lists product orders sorted by `orderId`, supports Add/Edit (`#` orderId prefix, `₦` total prefix, `Processing`/`Shipped`/`Delivered` statuses, `dd/mm/yyyy` date) and Delete.

### 9.12 `src/components/admin/ImageUpload.tsx`
- Reusable uploader supporting:
  - File upload -> full-screen `react-easy-crop` modal with Zoom slider (`1x`–`3x`), `Standard Ratio` vs. `Free Crop`, `Skip & Use Original`, `Cancel`, and `Save & Close` (crops via `<canvas>` to JPEG blob and uploads to Firebase Storage `uploads/${userId}/images/${folder}/${fileName}` with live percentage progress).
  - Direct `OR URL` input with automatic Imgur page-to-direct transformation (`imgur.com/<id>` -> `https://i.imgur.com/<id>.jpg`).
  - Preview with hover-remove and delete button.

---

## 10. Firebase Architecture & Security Rules

### 10.1 Firestore Collections (under `sites/{siteId}/`)
1. `settings/site` — `SiteSettings` document
2. `products/{productId}` — `{ name, price, salePrice, stock?, imageUrl, shortDescription, position, variations?: [{ name, price, salePrice? }] }`
3. `services/{serviceId}` — `{ title, description, icon, image, features?: string[], position }`
4. `books/{bookId}` — `{ title, author, price, status ('Draft'|'Published'), coverImage, preface, position }`
5. `editorial/{articleId}` — `{ title, slug, excerpt, content, category, author, date (dd/mm/yyyy), image, status ('Draft'|'Published'), metaTitle, metaDescription, position }`
6. `testimonials/{testimonialId}` — `{ text, author, location, position }`
7. `appointments/{appointmentId}` — `{ name, email, phone, service, date (dd/mm/yyyy), time, message?, status ('Pending'|'Confirmed'|'Completed'|'Cancelled'), createdAt }`
8. `messages/{messageId}` — `{ name, email, subject, message, status ('Unread'|'Read'), date, createdAt }`
9. `orders/{orderId}` — `{ orderId, name, product, total, status ('Processing'|'Shipped'|'Delivered'), date, createdAt? }`
10. `{collection}/{docId}/comments/{commentId}` & `.../replies/{replyId}` — `{ userId, userEmail, userName, userPhoto, text, createdAt, status ('pending'|'approved') }`
11. `users/{userId}` — `{ uid, email, role ('admin'|'client'), displayName }`

### 10.2 `firestore.rules`
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    function isSiteAdmin() {
      return isAuthenticated() && (
        request.auth.token.email.matches("(?i)osenialayo@gmail.com") || 
        request.auth.token.email.matches("(?i)kennywemson1@gmail.com")
      );
    }

    match /sites/{siteId} {
      // Public read for content collections; admin write
      match /{collection}/{docId} {
        allow read: if true;
        allow write: if isSiteAdmin();
      }

      // Private submissions: public create, admin read/update/delete
      match /appointments/{appointmentId} {
        allow read: if isSiteAdmin();
        allow create: if true;
        allow update, delete: if isSiteAdmin();
      }
      match /orders/{orderId} {
        allow read: if isSiteAdmin();
        allow create: if true;
        allow update, delete: if isSiteAdmin();
      }
      match /messages/{messageId} {
        allow read: if isSiteAdmin();
        allow create: if true;
        allow update, delete: if isSiteAdmin();
      }

      // Comments & Replies across any collection
      match /{collection}/{docId}/comments/{commentId} {
        allow read: if resource.data.status == "approved" || isSiteAdmin();
        allow create: if isAuthenticated();
        allow update: if isSiteAdmin();
        allow delete: if isAuthenticated() && (request.auth.uid == resource.data.userId || isSiteAdmin());

        match /replies/{replyId} {
          allow read: if resource.data.status == "approved" || isSiteAdmin();
          allow create: if isAuthenticated();
          allow update: if isSiteAdmin();
          allow delete: if isAuthenticated() && (request.auth.uid == resource.data.userId || isSiteAdmin());
        }
      }
    }

    match /users/{userId} {
      allow read: if isOwner(userId) || isSiteAdmin();
      allow create: if isAuthenticated() && isOwner(userId);
      allow update: if isSiteAdmin() || isOwner(userId);
    }

    match /{path=**} {
      allow read, write: if false;
    }
  }
}
```
