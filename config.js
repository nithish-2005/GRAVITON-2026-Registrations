/**
 * GRAVITON 2026 - Central Configuration File
 * Jaya Sakthi Engineering College - Dept. of CSE & Cyber Security
 *
 * NOTE: For security, never put private Google Sheet credentials or
 * admin passwords in this frontend file. All verification logic is handled
 * securely in Google Apps Script (apps-script.gs).
 */

const CONFIG = {
    // =========================================================================
    // 1. GOOGLE APPS SCRIPT WEB APP API URL
    // =========================================================================
    // Deploy your apps-script.gs as a Web App (Access: Anyone) and paste the URL here.
    API_URL: "https://script.google.com/macros/s/AKfycbwwCL-_pI18v78OBmeYLFQH7QPqOVz1wh2EIVU81aZ7kb4ECi16cSCgZvldZO7D4nLa5w/exec",

    // =========================================================================
    // 2. UPI & REGISTRATION FEE CONFIGURATION
    // =========================================================================
    REGISTRATION_FEE: 100, // Registration fee in Indian Rupees (INR) per head
    UPI_ID: "graviton2026@nyes",
    UPI_NAME: "Mrs Kalavathi Munusamy",
    UPI_PHONE: "7305318920",
    UPI_QR_IMAGE: "assets/upi_qr.jpg",
    PAYMENT_INSTRUCTIONS: "Pay ₹100 per head using the QR Code, UPI ID (graviton2026@nyes), or Phone Number (7305318920). Attach your payment screenshot and enter the 12-digit UTR/Transaction ID for verification.",

    // =========================================================================
    // 3. VERCEL BLOB STORAGE (PAYMENT SCREENSHOT PROOF)
    // =========================================================================
    BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_wf4d4Po6W2B0uQP7_BpyYSXFmfczcdDa2D9hvvlgMtiMd3L",

    // =========================================================================
    // 4. SYMPOSIUM METADATA
    // =========================================================================
    SYMPOSIUM_NAME: "GRAVITON 2026",
    SYMPOSIUM_TAGLINE: "IDEAS BEYOND LIMITS",
    COLLEGE_NAME: "Jaya Sakthi Engineering College",
    COLLEGE_ACCREDITATION: "AICTE Approved | Anna Univ. Affiliated",
    CAMPUS_LOCATION: "Thiruninravur, Chennai - 602 024, Tamil Nadu",
    DEPARTMENT: "Department of Computer Science & Engineering & Cyber Security",
    SYMPOSIUM_DATE: "2026-10-09T09:00:00+05:30", // 09/10/2026 9:00 AM IST
    SYMPOSIUM_DATE_DISPLAY: "09/10/2026 09:00 AM",

    // =========================================================================
    // 5. STUDENT CHAIR PERSONS CONTACTS
    // =========================================================================
    CONTACTS: [
        {
            name: "HARINI",
            role: "Student Chair Person",
            phone: "+91 90032 52177",
            tel: "+919003252177",
            whatsapp: "919043639975"
        },
        {
            name: "BALAGURUBARAN",
            role: "Student Chair Person",
            phone: "+91 90436 39975",
            tel: "+919043639975",
            whatsapp: "919043639975"
        },
        {
            name: "MRS. KALAVATHI MUNUSAMY",
            role: "Payment Coordinator / UPI Help",
            phone: "+91 73053 18920",
            tel: "+917305318920",
            whatsapp: "917305318920"
        }
    ],

    // =========================================================================
    // 6. OFFICIAL SOCIAL MEDIA & COMMUNITY
    // =========================================================================
    INSTAGRAM_URL: "https://www.instagram.com/graviton_2026?utm_source=qr&stkn=MXJzZ3B6amVweDE3NA%3D%3D",
    INSTAGRAM_HANDLE: "@graviton_2026",
    WHATSAPP_COMMUNITY_URL: "https://chat.whatsapp.com/CJd1mj9sOKA0jJAY4IbmkO"
};

// Freeze configuration to prevent accidental modification at runtime
if (typeof Object.freeze === 'function') {
    Object.freeze(CONFIG);
}

/**
 * Uploads an image (File, Blob, or base64 Data URL) directly to Vercel Blob storage.
 * Returns the permanent, public Vercel CDN URL.
 */
async function uploadToVercelBlob(dataOrFile, customFilename) {
    if (!dataOrFile) return "";
    
    // If it's already an HTTP / HTTPS URL, return as-is
    if (typeof dataOrFile === 'string' && (dataOrFile.startsWith('http://') || dataOrFile.startsWith('https://'))) {
        return dataOrFile;
    }

    const token = (typeof CONFIG !== 'undefined' && CONFIG.BLOB_READ_WRITE_TOKEN) 
        ? CONFIG.BLOB_READ_WRITE_TOKEN 
        : "vercel_blob_rw_wf4d4Po6W2B0uQP7_BpyYSXFmfczcdDa2D9hvvlgMtiMd3L";

    const match = token.match(/^vercel_blob_rw_([a-zA-Z0-9]+)_/);
    const storeId = match ? match[1] : "wf4d4Po6W2B0uQP7";

    let bodyData = dataOrFile;
    let contentType = (dataOrFile && dataOrFile.type) ? dataOrFile.type : "image/jpeg";

    // Handle base64 Data URL strings
    if (typeof dataOrFile === 'string') {
        let cleanBase64 = dataOrFile;
        if (dataOrFile.indexOf('base64,') !== -1) {
            const parts = dataOrFile.split('base64,');
            const mimeMatch = parts[0].match(/data:(.*?);/);
            if (mimeMatch) contentType = mimeMatch[1];
            cleanBase64 = parts[1];
        }
        const byteCharacters = atob(cleanBase64);
        const byteNumbers = new Uint8Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        bodyData = new Blob([byteNumbers], { type: contentType });
    }

    const filename = (customFilename || (`proof_${Date.now()}.jpg`)).replace(/[^a-zA-Z0-9._-]/g, '_');
    const pathname = `payments/${filename}`;
    const requestId = `${storeId}:${Date.now()}:${Math.random().toString(16).slice(2)}`;
    const apiUrl = `https://vercel.com/api/blob/?pathname=${encodeURIComponent(pathname)}`;

    console.log('[Vercel Blob] Initiating direct CDN upload:', pathname, 'Size:', bodyData.size || 'unknown');

    const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
            'authorization': `Bearer ${token}`,
            'x-api-version': '12',
            'x-vercel-blob-access': 'public',
            'x-vercel-blob-store-id': storeId,
            'x-api-blob-request-id': requestId,
            'x-api-blob-request-attempt': '0',
            'x-content-type': contentType,
            'content-type': contentType
        },
        body: bodyData
    });

    if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const msg = errJson.error?.message || `HTTP ${response.status}`;
        console.error('[Vercel Blob] Upload failed:', msg);
        throw new Error(`Vercel Blob upload failed: ${msg}`);
    }

    const result = await response.json();
    console.log('[Vercel Blob] Successfully uploaded to public CDN:', result.url);
    return result.url;
}
