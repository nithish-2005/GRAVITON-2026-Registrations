# 🚀 GRAVITON 2026 - National Level College Technical Symposium
> **Department of Computer Science & Engineering & Cyber Security**  
> **Jaya Sakthi Engineering College (AICTE Approved | Anna Univ. Affiliated)**  
> *Thiruninravur, Chennai - 602 024, Tamil Nadu*  
> **Theme:** *IDEAS BEYOND LIMITS*

---

## 📖 1. Project Overview

**GRAVITON 2026** is a premium, futuristic, dark cosmic symposium web platform engineered with vanilla HTML5, CSS3, and JavaScript. It provides a complete end-to-end digital experience for college symposiums:

- **Cinematic Landing Page:** Atmospheric cosmic particle canvas, futuristic hero section with integrated animated warrior artwork, countdown timer, interactive 12+ event cards with category filtering, rules & guidelines modals, and symposium schedule.
- **Dedicated Registration Portal (`/register.html`):** Multi-step registration allowing delegates to select their event across Technical and Non-Technical categories under their pass.
- **Payment Proof Verification Gateway (`/payment.html`):** Secure payment proof upload with instant client-side image compression, transaction/UTR ID submission, and live preview.
- **Real-Time Status Tracker & Digital Pass (`/status.html`):** Live verification tracking with automatic unlocks for official **Digital Delegate Passes** complete with verified QR codes, college affiliations, and print/PDF support.
- **Organizer Admin Dashboard (`/admin.html`):** Secure PIN-protected organizer dashboard to view delegate lists across all event sheets, inspect payment screenshots in a full-view lightbox, verify/reject payments, contact participants directly via WhatsApp, and export full registries to Excel (.csv).
- **Lightweight Serverless Backend (`apps-script.gs`):** Powered by Google Apps Script with Google Sheets as the persistent database. Zero hosting cost, zero complex infrastructure, and 100% static Vercel compatible!

---

## 📁 2. Folder Structure

```
graviton2026/
├── index.html          # Cinematic Main Landing Page (Hero, About, Events, Schedule, Venue, Contacts)
├── register.html       # Delegate Registration Portal with Direct Screenshot Upload
├── register.js         # Registration Form Validation, Image Compression & Submission Logic
├── payment.html        # Payment Proof Verification Page
├── payment.js          # Screenshot Compression, Preview & UTR Submission
├── status.html         # Pass Status Tracker & Digital Delegate Pass
├── status.js           # Live Status Checker & Printable Pass Generator
├── admin.html          # Organizer Management Portal
├── admin.js            # Admin Dashboard, PIN Authentication, Screenshot Proof Viewer & Verification
├── config.js           # Central Configuration (API_URL, Fees, Contacts)
├── apps-script.gs      # Google Apps Script Backend Code for Google Sheets
├── style.css           # Comprehensive Sci-Fi Dark Cosmic Design System
├── README.md           # Full Documentation & Deployment Guide
└── assets/
    └── hero_warrior.png # High-Resolution Sci-Fi Hero Artwork
```

---

## 📊 3. Google Sheet Setup (Step-by-Step)

1. Open your browser and go to [Google Sheets](https://sheets.new).
2. Create a new blank spreadsheet.
3. Rename the spreadsheet to:
   ```
   GRAVITON 2026 Registrations
   ```
4. Rename the default sheet tab at the bottom from `Sheet1` to:
   ```
   Registrations
   ```
5. *(Optional)* You can manually add the headers or let `apps-script.gs` automatically create and style the headers on first run:
   - `Registration ID`
   - `Timestamp`
   - `Full Name`
   - `Email`
   - `Phone`
   - `College`
   - `Department`
   - `Year`
   - `Selected Events`
   - `Amount`
   - `Payment Status`
   - `UTR`
   - `Payment Screenshot`
   - `Verification Time`
   - `Verified By`

---

## ⚡ 4. Google Apps Script Setup

1. In your newly created Google Sheet, click on the top menu:  
   **Extensions** → **Apps Script**.
2. A new tab will open with the Apps Script code editor.
3. Delete any default code inside `Code.gs`.
4. Open the file [`apps-script.gs`](apps-script.gs) in this project, copy its entire contents, and paste it into the Apps Script editor.
5. Click the **Save** icon (floppy disk) or press `Ctrl + S`.
6. *(Optional)* Set a custom Security PIN:
   - Click the gear icon on the left navigation (**Project Settings**).
   - Scroll down to **Script Properties** → Click **Add script property**.
   - Property: `ADMIN_PIN` | Value: `your_secret_pin` (e.g. `JSEC@2027`).
   - If you skip this, the default PIN `JSEC@2027` will be used.

---

## 🌐 5. Deploying Google Apps Script as a Web App

To allow the static website to submit and retrieve registrations:

1. In the top right corner of the Apps Script editor, click **Deploy** → **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in the fields:
   - **Description:** `GRAVITON 2026 API`
   - **Execute as:** `Me (your_email@gmail.com)`
   - **Who has access:** `Anyone`  
     *(⚠️ IMPORTANT: This MUST be set to "Anyone" so participants and the static frontend can submit registrations without requiring Google login!)*
4. Click **Deploy**.
5. When prompted to **Authorize Access**:
   - Choose your Google account.
   - Click **Advanced** (at the bottom left of the warning popup).
   - Click **Go to Untitled project (unsafe)** or **Go to GRAVITON (unsafe)**.
   - Click **Allow**.
6. Google will provide a **Web App URL** that ends in `/exec`:
   ```
   https://script.google.com/macros/s/AKfycbx.../exec
   ```
7. Copy this URL.

---

## ⚙️ 6. How to Configure `config.js`

Open [`config.js`](config.js) in your code editor and update the fields:

```javascript
const CONFIG = {
    // 1. Google Apps Script Web App URL:
    API_URL: "https://script.google.com/macros/s/AKfycb.../exec",

    // 2. Delegate Registration Fee (INR):
    REGISTRATION_FEE: 100,

    // 3. Vercel Blob Storage Token (Payment Screenshots):
    BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_wf4d4Po6W2B0uQP7_BpyYSXFmfczcdDa2D9hvvlgMtiMd3L",

    // 4. Organizer Contact Details:
    CONTACTS: [
        { name: "HARINI", phone: "+91 90032 52177", role: "Student Chair Person" },
        { name: "BALAGURUBARAN", phone: "+91 90436 39975", role: "Student Chair Person" }
    ]
};
```

---

## 💳 7. How Payment Proof & Vercel Blob Storage Works

1. **Direct Vercel Blob Upload:**
   - Delegate attaches their **Payment Screenshot** (JPG, PNG, WebP) in [`register.html`](register.html) or [`payment.html`](payment.html).
   - The browser compresses the image using HTML5 Canvas and uploads it directly to **Vercel Blob** via its REST API with the read/write token.
   - Vercel Blob returns a permanent, high-speed public CDN URL (e.g., `https://wf4d4po6w2b0uqp7.public.blob.vercel-storage.com/payments/...`).
2. **Google Sheet Public Link Storage:**
   - The permanent Vercel Blob URL is submitted with the registration payload.
   - Google Apps Script records this URL into Google Sheets:
     - **`MASTER_REGISTRATIONS`:** Column 18 (`Payment Screenshot`)
     - **Event Sheets (e.g. `TECH_QUIZ`, `CTF`):** Column 17 (`Payment Screenshot`)
   - *Fallback:* If a legacy client or offline base64 image is received, `apps-script.gs` also includes a server-side `uploadToVercelBlob()` fallback using `UrlFetchApp`.
3. **Organizer Approval & Automated Confirmation Email (`admin.html`):**
   - Organizer logs into [`admin.html`](admin.html) using the Security PIN (default: `2026`).
   - Organizer clicks **View Proof** in the registry table to inspect the high-resolution Vercel Blob CDN image.
   - Organizer matches the screenshot and UTR against incoming account receipts and clicks **Mark Verified**.
   - **Automated Confirmation Email:** Marking verified immediately dispatches an official HTML confirmation email via Google Apps Script's native `MailApp.sendEmail()` to the participant's registered email address.
   - **Email Contents:**
     - Master Registration ID (`GRAV-XXXX`) and individual event IDs (`PPT-001`, `QUIZ-001`, etc.).
     - Complete delegate info (Name, College, Department, Year, Team Name & Members).
     - Payment details (`VERIFIED`, ₹100, UTR number).
     - Symposium logistics (Reporting Time: 8:30 AM, Venue: Jaya Sakthi Engineering College, Thiruninravur, Chennai - 602 024, Mandatory physical College ID checklist).
     - Direct CTA button to view and download their live digital delegate pass.
     - Direct WhatsApp contact links for Student Coordinators (Harini: +91 90032 52177, Balagurubaran: +91 90436 39975).
   - **Manual Resend Option:** Organizers can also click **Send / Resend Email** inside the participant detail modal anytime.
4. **Digital Pass Release:**
   - Once verified, the participant checking [`status.html`](status.html) instantly receives their official **Digital Delegate Pass** featuring a holographic seal and scannable QR verification code. Participants can also click **View Uploaded Proof** to open their receipt anytime.

---

## 📧 8. Automated Participant Confirmation Email Feature

When an organizer verifies a participant's registration in `admin.html`, the backend automatically triggers an official event confirmation email:

- **Zero Third-Party Cost:** Uses Google Apps Script's built-in `MailApp.sendEmail()` running under the organizer's authenticated Google account.
- **Responsive Brand Design:** Cosmic dark mode styled with Jaya Sakthi Engineering College credentials, institutional banner, and department branding.
- **Fail-Safe Processing:** If an invalid email is provided or Google's daily email quota is reached, the verification status update in Google Sheets still succeeds without error, and `admin.js` informs the organizer.
- **How to Update Apps Script Deployment:**
  1. Open your Google Sheet → **Extensions** → **Apps Script**.
  2. Paste the updated contents of [`apps-script.gs`](apps-script.gs).
  3. Click **Deploy** → **Manage deployments**.
  4. Click the **Pencil (Edit)** icon next to your active Web App deployment.
  5. Under **Version**, select **New version**.
  6. Click **Deploy**. (The URL stays exactly the same!).

---

## 🚀 9. How to Deploy on Vercel (Zero Build Step)

Since the website is built with pure Vanilla HTML5, CSS3, and JavaScript, **no build process, Node.js, or bundlers are required**:

### Option A: Via GitHub (Recommended)
1. Push this folder to your GitHub repository:
   ```bash
   git add .
   git commit -m "Deploy GRAVITON 2026 Symposium Website"
   git push origin main
   ```
2. Go to [Vercel](https://vercel.com) and log in.
3. Click **Add New...** → **Project**.
4. Select your GitHub repository.
5. In the configuration screen:
   - **Framework Preset:** `Other` (or leave default)
   - **Root Directory:** `./`
   - **Build Command:** *(Leave blank)*
   - **Output Directory:** *(Leave blank)*
6. Click **Deploy**. Your website will be live worldwide in under 30 seconds with a free `.vercel.app` domain and HTTPS!

### Option B: Via Vercel CLI
```bash
npm install -g vercel
vercel
```

---

## 🏆 10. Event Catalog & Rules

All 8 events are faithfully preserved from the department's syllabus:

### Technical Arenas (7 Events)
1. **PPT Presentation:** 10 mins presentation + 10 mins Q&A before expert panel. (Team 1-3)
2. **Tech Quiz:** 3 rounds covering CS, Cyber Security, and AI lore. (Solo / Duo)
3. **AI Prompt Battle:** Craft precise generative prompts to reproduce target media. (Team Duo / 2 Members)
4. **Reverse Coding:** 3-round Python challenge (Scrambled Code → Debug Race → Black Box Challenge). (Team Duo / 2 Members)
5. **CTF (Capture The Flag):** Web Exploitation, Cryptography, Steganography & Forensics flags. (Team 1-2)
6. **Web Creation Without Using AI:** Build pure HTML/CSS/JS responsive webpage without AI tools in 4 hours. (Team Duo / 2 Members)
7. **Data Grid:** Data analysis & logical thinking across 3 rounds (Data Hunt, Data Quiz, Data Dashboard). (Solo / Duo)

### Non-Technical Showcase (1 Event)
8. **E Sports Battle:** Squad tournament battles featuring Free Fire, BGMI, and other mobile games. (Squad 4)

---

## 🔒 11. Security Notes

- **Zero Credential Exposure:** Never put Google Service Account keys, Sheet IDs, or admin passwords in `config.js` or client-side files.
- **Server-Side Validation:** All status mutations (`verifyPayment`, `rejectPayment`, `getRegistrations`) are authenticated inside Google Apps Script using the secret `ADMIN_PIN`.
- **Payment Verification Integrity:** Client-side requests cannot directly mark a pass as `VERIFIED`. Pass generation is only enabled when the record status is confirmed `VERIFIED` by the backend.
- **Sanitized Inputs:** All dynamic user values rendered to the DOM are escaped using `escapeHTML` to prevent Cross-Site Scripting (XSS).

---

## 📞 Support Contacts
- **Harini (Student Chair Person):** [+91 90032 52177](tel:+919003252177) | [WhatsApp](https://wa.me/919003252177)
- **Balagurubaran (Student Chair Person):** [+91 90436 39975](tel:+919043639975) | [WhatsApp](https://wa.me/919043639975)
- **Institution:** Jaya Sakthi Engineering College, Thiruninravur, Chennai - 602 024.
