# SSGMCE Alumni Connect — Feature Action Plan

## What's Already Built (Do Not Rebuild)

- Firebase auth: Register, Sign-in, email-link, Google & LinkedIn OAuth
- Admin approval workflow (pending → approved/rejected) with email notifications
- Admin portal: list/approve/reject requests tab UI
- Dashboard: basic profile display + onboarding modal
- Public layout shell: Header, Navbar, HeroSlider, Footer, FeedbackButton
- **Page stubs already exist** for: AlumniCell, ExecutiveTeam, ActivityOrganized, DistinguishedAlumni, AnnualReport, Nomination, WithdrawalForm, Contribution, Newsletter, Donation, EventRegistration, EventGallery, Gallery, ContactPage

---

## Feature 1 — Home Page Complete Build-out

**Branch:** `feature/homepage-sections`

**Description:** The current `HomePage.jsx` only renders a placeholder div. Wire in all sections using already-created components and add missing ones.

**Sections to build:**

```
┌─────────────────────────────────────────────────────┐
│  HEADER (logo + top links)           [Already done] │
│  NAVBAR (navigation menu)            [Already done] │
├─────────────────────────────────────────────────────┤
│  HERO SLIDER (3 images)              [Already done] │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────────────┐   │
│  │  ABOUT ALUMNI   │  │  REGISTRATION COUNT     │   │
│  │  CELL (snippet  │  │  🎓 1,200+ Alumni       │   │
│  │  + "Read More") │  │  Registered  [Animated] │   │
│  └─────────────────┘  └─────────────────────────┘   │
├─────────────────────────────────────────────────────┤
│  NEWLY REGISTERED ALUMNI             [Component ✓]  │
│  [Card] [Card] [Card] [Card] → Horizontal scroll    │
├─────────────────────────────────────────────────────┤
│  LATEST CONTRIBUTIONS                [Component ✓]  │
│  Jobs | Guest Lectures | Activities  (tab toggle)   │
│  [Post Card] [Post Card] [Post Card]                │
├─────────────────────────────────────────────────────┤
│  DISTINGUISHED ALUMNI                               │
│  [Photo] [Name] [Batch] [Achievement]  grid 4-col  │
├─────────────────────────────────────────────────────┤
│  LAST MEET GALLERY                                  │
│  [Masonry grid of 6 photos] + "View Full Gallery"  │
├─────────────────────────────────────────────────────┤
│  FOOTER                              [Already done] │
└─────────────────────────────────────────────────────┘
```

**Backend API needed:**

| Endpoint | Response |
|---|---|
| `GET /api/v1/public/stats` | `{ totalAlumni, recentAlumni[] }` |
| `GET /api/v1/public/contributions?limit=6` | latest posts |
| `GET /api/v1/public/gallery/recent?limit=6` | recent gallery images |

---

## Feature 2 — Registration Enhancement

**Branch:** `feature/register-validation-confirmation`

**Description:** Strengthen the existing Register page with phone number field, terms acceptance, and a clearer confirmation screen. Zod schema and react-hook-form are already in place — only extend them.

```
┌──────────────────────────────────────┐
│  Register as Alumni                  │
│                                      │
│  Full Name     [________________]    │
│  Email         [________________]    │
│  Phone Number  [________________]    │
│  Course        [Dropdown ▼     ]     │
│  Branch        [Dropdown ▼     ]     │
│  Admission Year [____]  Passout [__] │
│                                      │
│  ☐ I agree to Terms & Privacy Policy│
│                                      │
│  ─────── Verify & Submit ─────────   │
│  [Verify via Email Link]             │
│  [Google]          [LinkedIn]        │
│                                      │
│  Already registered? Sign in         │
└──────────────────────────────────────┘

After email-link sent:
┌──────────────────────────────────────┐
│  ✅ Email Sent!                      │
│                                      │
│  Check your inbox at                 │
│  abc@gmail.com                       │
│                                      │
│  Click the link to complete          │
│  registration. Your account goes to  │
│  admin for approval.                 │
│                                      │
│  ⏱ Didn't get it? Resend in 0:58    │
│  [← Use different details]           │
└──────────────────────────────────────┘
```

**Changes required:**
- Add `contactNumber` and `termsAccepted` fields to Zod schema in `Register.jsx`
- Add resend-countdown timer on the confirmation screen
- Add `contactNumber` field to the User model in `server/src/models/User.js` (field already exists — just expose it in the register form)

---

## Feature 3 — Dashboard Features (Alumni Portal)

**Branch:** `feature/dashboard-alumni-features`

**Description:** Expand the post-login dashboard from a profile viewer to a full activity hub with sidebar navigation.

```
DASHBOARD LAYOUT
┌──────────────┬─────────────────────────────────────┐
│  SIDEBAR     │  MAIN CONTENT AREA                  │
│              │                                     │
│  👤 Profile  │  (changes based on sidebar item)   │
│  📅 Events   │                                     │
│  💼 Jobs     │                                     │
│  🎓 Batchmates│                                    │
│  💰 Contribute│                                    │
│  ✈ Travel Plan│                                    │
│  📝 Feedback │                                     │
│  🔔 Notifications│                                 │
└──────────────┴─────────────────────────────────────┘
```

### Dashboard Tab Wireframes

**Event Registration Tab**
```
┌─────────────────────────────────────────────────────┐
│  Upcoming Events                                    │
│  ┌────────────────────────────────────────────────┐ │
│  │  Annual Alumni Meet 2026         Dec 25, 2026  │ │
│  │  SSGMCE Campus, Shegaon                        │ │
│  │  [Register]  Seats: 120 remaining              │ │
│  └────────────────────────────────────────────────┘ │
│  My Registrations                                   │
│  [Event Name]  [Date]  [Status: Confirmed/Pending]  │
└─────────────────────────────────────────────────────┘
```

**Job Post Tab**
```
┌─────────────────────────────────────────────────────┐
│  [+ Post a Job]                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │  Software Engineer @ TCS     Posted by you   │   │
│  │  Nagpur | 3-5 yrs exp | ₹8-12 LPA           │   │
│  │  [Edit]  [Delete]  Status: Pending Approval  │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

**Travel Plan Tab**
```
┌─────────────────────────────────────────────────────┐
│  Share your travel plan for upcoming meet           │
│  Arrival Date  [_________]  Departure [_________]  │
│  Travel Mode   [Dropdown: Train/Bus/Car/Flight ▼]   │
│  From City     [_________]                          │
│  Need Accommodation?  ○ Yes  ● No                  │
│  [Submit Plan]                                      │
│                                                     │
│  Other alumni travelling:                           │
│  [Ravi Sharma — Train, Nagpur, Dec 24]              │
│  [Priya Desai — Car, Pune, Dec 24]                 │
└─────────────────────────────────────────────────────┘
```

**Batchmate Search Tab**
```
┌─────────────────────────────────────────────────────┐
│  Branch [Dropdown ▼]  Batch Year [____]  [Search]  │
│                                                     │
│  [Photo] Ravi Sharma   CSE  2019-23   TCS Pune     │
│  [Photo] Priya Joshi   IT   2019-23   Infosys      │
└─────────────────────────────────────────────────────┘
```

**Feedback Tab**
```
┌─────────────────────────────────────────────────────┐
│  Share Feedback with Alumni Cell                    │
│  Subject   [_________________________________]      │
│  Message   [_________________________________]      │
│            [_________________________________]      │
│  Rating    ★ ★ ★ ★ ☆                              │
│  [Submit Feedback]                                  │
└─────────────────────────────────────────────────────┘
```

**Backend models needed:** `Event`, `EventRegistration`, `JobPost`, `TravelPlan`, `Feedback`

---

## Feature 4 — Admin Panel Enhancement

**Branch:** `feature/admin-panel-extensions`

**Description:** Extend the existing admin portal (currently only handles user approval) with tabs for all management tasks.

```
ADMIN PORTAL — SIDEBAR NAVIGATION
┌──────────────┬─────────────────────────────────────────┐
│  ADMIN MENU  │  CONTENT                                │
│              │                                         │
│  👥 Members  │                                         │
│  ─ Pending   │  (existing approve/reject panel)        │
│  ─ Approved  │                                         │
│  ─ Rejected  │                                         │
│  ─ Dept-wise │                                         │
│              │                                         │
│  📅 Events   │                                         │
│  ─ Current Meet Reg │                                  │
│  ─ Old Meet Reg     │                                  │
│              │                                         │
│  💰 Finances │                                         │
│  ─ Donations │                                         │
│  ─ Contributions    │                                  │
│              │                                         │
│  ✈ Travel    │                                         │
│  ─ Plans            │                                  │
│  ─ Accommodation    │                                  │
│              │                                         │
│  📢 Posts    │                                         │
│  ─ Jobs             │                                  │
│  ─ Activities       │                                  │
│  ─ Guest Lectures   │                                  │
└──────────────┴─────────────────────────────────────────┘
```

**Department-wise Registration**
```
┌───────────────────────────────────────────────────────┐
│  Department-wise Alumni Count                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  CSE   ██████████  245 alumni                   │  │
│  │  IT    ████████    190 alumni                   │  │
│  │  E&TC  ██████      145 alumni                   │  │
│  │  MECH  █████       120 alumni                   │  │
│  │  CIVIL ████        95  alumni                   │  │
│  │  EE    ███         80  alumni                   │  │
│  └─────────────────────────────────────────────────┘  │
│  [Download CSV]                                       │
└───────────────────────────────────────────────────────┘
```

**Donation Confirmation**
```
┌───────────────────────────────────────────────────────┐
│  Pending Donation Confirmations                       │
│  Name: Ravi Sharma  |  Amount: ₹5,000  |  UTR: XXXX │
│  [Mark Confirmed]  [Reject]                           │
└───────────────────────────────────────────────────────┘
```

**Travel & Accommodation**
```
┌───────────────────────────────────────────────────────┐
│  Alumni Travel Plans for Annual Meet 2026             │
│  Total Arriving: 80  |  Need Accommodation: 34        │
│                                                       │
│  Name       From    Mode   Arrival  Accommodation    │
│  R. Sharma  Nagpur  Train  Dec 24   Yes              │
│  P. Joshi   Pune    Car    Dec 24   No               │
│  [Export to Excel]                                    │
└───────────────────────────────────────────────────────┘
```

**Post Approval Queue**
```
┌───────────────────────────────────────────────────────┐
│  Pending Posts for Approval                           │
│  Type: [All ▼]                                        │
│                                                       │
│  [JOB]  Software Eng @ TCS  by Ravi Sharma           │
│         Nagpur | 3-5 yrs | ₹8-12 LPA                │
│         [Approve] [Reject]                            │
│                                                       │
│  [LECTURE]  Machine Learning Workshop                │
│         By: Dr. Priya Joshi | Online | Jan 15        │
│         [Approve] [Reject]                            │
└───────────────────────────────────────────────────────┘
```

**Backend API needed:**

| Endpoint | Purpose |
|---|---|
| `GET /api/v1/admin/stats/department` | Dept-wise counts |
| `GET /api/v1/admin/donations` | List donations |
| `PATCH /api/v1/admin/donations/:id/confirm` | Confirm donation |
| `GET /api/v1/admin/travel-plans` | All travel plans |
| `GET /api/v1/admin/posts` | All pending posts |
| `PATCH /api/v1/admin/posts/:id/approve` | Approve a post |
| `PATCH /api/v1/admin/posts/:id/reject` | Reject a post |
| `GET /api/v1/admin/events/:id/registrations` | Event registration list |

---

## Feature 5 — Public Pages (Fill the Stubs)

**Branch:** `feature/public-pages-content`

**Description:** All page stubs already exist in routing. This feature fills them with real content and layout.

### About › Alumni Cell (`/about/alumni-cell`)
```
┌──────────────────────────────────────────────────────┐
│  [Banner Image]                                      │
│  About SSGMCE Alumni Cell                           │
│  ─────────────────────────────────────────────────  │
│  [Mission paragraph]   [Vision paragraph]           │
│  Objectives: [Bullet list]                          │
│  Cell Members: [Photo grid]                         │
└──────────────────────────────────────────────────────┘
```

### About › Executive Team (`/about/executive-team`)
```
┌──────────────────────────────────────────────────────┐
│  Executive Team  2025-26                            │
│  [Photo] [Name] [Role] [LinkedIn]  ← card grid     │
│  President | Secretary | Treasurer | Members        │
└──────────────────────────────────────────────────────┘
```

### About › Activity Organized (`/about/activity-organized`)
```
┌──────────────────────────────────────────────────────┐
│  Activities Organized                               │
│  [Filter: All | 2024 | 2023 | 2022]                │
│                                                     │
│  ┌────────────────────────────────────────────────┐ │
│  │  [Photo]  Annual Alumni Meet 2024              │ │
│  │           Date: Dec 25, 2024  |  Venue: SSGMCE│ │
│  │           200+ Alumni attended                 │ │
│  └────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

### About › Distinguished Alumni (`/about/distinguished-alumni`)
```
┌──────────────────────────────────────────────────────┐
│  Distinguished Alumni  [Search by batch/name]       │
│  [Photo] [Name]  Batch: 2005  [Achievement Badge]   │
│  [4-column card grid with pagination]               │
└──────────────────────────────────────────────────────┘
```

### About › Alumni Meet Report (`/about/annual-report`)
```
┌──────────────────────────────────────────────────────┐
│  Alumni Meet Reports                                     │
│  ┌───────────────┐  ┌───────────────┐              │
│  │  [PDF Icon]   │  │  [PDF Icon]   │              │
│  │  Report 2024  │  │  Report 2023  │              │
│  │  [Download]   │  │  [Download]   │              │
│  └───────────────┘  └───────────────┘              │
└──────────────────────────────────────────────────────┘
```

### Gallery (`/gallery`)
```
┌──────────────────────────────────────────────────────┐
│  Gallery  [Filter: All | Annual Meet | Events | ...]│
│  [Masonry grid of photos]                           │
│  Click photo → lightbox fullscreen view             │
└──────────────────────────────────────────────────────┘
```

### Contribution (`/contribution`)
```
┌──────────────────────────────────────────────────────┐
│  Contribute to SSGMCE                               │
│  [Lab Equipment] [Scholarship] [Infrastructure]     │
│  ─────────────────────────────────────────────────  │
│  Contribute Form:                                   │
│  Name [___]  Amount ₹[___]  Category [Dropdown]    │
│  UTR/Transaction Ref [___]  Date [___]             │
│  [Upload Screenshot]  [Submit]                      │
└──────────────────────────────────────────────────────┘
```

### Newsletter (`/newsletter`)
```
┌──────────────────────────────────────────────────────┐
│  Newsletter Archive                                  │
│  [Vol 1 - Jan 2025 PDF card] [Vol 2 - Jul 2025]    │
│  [Download PDF]  [View Online]                      │
│                                                     │
│  ── Subscribe for Updates ──                        │
│  [Email _______________] [Subscribe]               │
└──────────────────────────────────────────────────────┘
```

### Event (`/event/registration` and `/event/gallery`)
```
Event Registration:
┌──────────────────────────────────────────────────────┐
│  Upcoming Events                                    │
│  [Event Card] → [Register Button]                  │
│  Past Events  → [View Report]                       │
└──────────────────────────────────────────────────────┘

Event Gallery:
┌──────────────────────────────────────────────────────┐
│  Event Galleries  [Filter by Event ▼]              │
│  [Photo grid with event tags]                       │
└──────────────────────────────────────────────────────┘
```

### Contact (`/contact`)
```
┌──────────────────────────────────────────────────────┐
│  Contact Us          [Map Embed - SSGMCE Shegaon]   │
│                                                     │
│  Name [___________]                                 │
│  Email [___________]                                │
│  Message [_________________________]                │
│  [Send Message]                                     │
│                                                     │
│  📍 SSGMCE, Shegaon, Dist. Buldhana, MH 444203    │
│  📧 alumni@ssgmce.ac.in   📞 07265-252XXX          │
└──────────────────────────────────────────────────────┘
```

---

## Feature 6 — New Backend Models

**Branch:** `feature/backend-new-models`

**Description:** Create all MongoDB models required by Features 3 and 4. This must be done **first** so frontend teams have stable API contracts to code against.

| Model | Key Fields |
|---|---|
| `Event` | title, description, date, venue, type, maxSeats, createdBy |
| `EventRegistration` | eventId, userId, status (confirmed/pending/cancelled), registeredAt |
| `JobPost` | title, company, location, salary, experience, postedBy, status (pending/approved/rejected), expiresAt |
| `Contribution` | userId, name, amount, category, utrRef, receiptUrl, status (pending/confirmed), confirmedBy |
| `TravelPlan` | userId, eventId, arrivalDate, departureDate, travelMode, fromCity, needsAccommodation |
| `Feedback` | userId, subject, message, rating, createdAt |
| `Gallery` | title, imageUrl, category, eventId (optional), uploadedBy, takenAt |
| `NewsletterSubscriber` | email, subscribedAt |

---

## Recommended Build Order (Sprints)

```
Sprint 1 — Foundation
  └─ feature/backend-new-models
       APIs first — unblocks all other parallel work

Sprint 2 — Core Visible Impact
  ├─ feature/homepage-sections
  └─ feature/register-validation-confirmation

Sprint 3 — Logged-in Experience
  └─ feature/dashboard-alumni-features
       Events, Jobs, Batchmates, Travel Plan, Feedback

Sprint 4 — Admin Power
  └─ feature/admin-panel-extensions
       Donations, dept stats, post approvals, travel mgmt

Sprint 5 — Content Polish
  └─ feature/public-pages-content
       Fill all page stubs with real content
```

---

## Branch Quick Reference

| Feature | Branch Name |
|---|---|
| Backend models | `feature/backend-new-models` |
| Home page sections | `feature/homepage-sections` |
| Registration enhancement | `feature/register-validation-confirmation` |
| Dashboard features | `feature/dashboard-alumni-features` |
| Admin panel extensions | `feature/admin-panel-extensions` |
| Public pages content | `feature/public-pages-content` |

> All branches should be cut from `main` and submitted as Pull Requests back to `main`.
