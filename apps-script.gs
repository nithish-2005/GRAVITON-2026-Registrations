/**
 * ============================================================================
 * GRAVITON 2026 - Google Apps Script Backend (Multi-Event Sheet Architecture)
 * Department of Computer Science & Engineering & Cyber Security
 * Jaya Sakthi Engineering College (AICTE Approved | Anna Univ. Affiliated)
 * ============================================================================
 *
 * SPREADSHEET ARCHITECTURE:
 * 1. MASTER_REGISTRATIONS   - Primary participant & fee tracking
 * 2. PPT_PRESENTATION       - Code: PPT
 * 3. TECH_QUIZ              - Code: QUIZ
 * 4. AI_PROMPT_BATTLE       - Code: AIP
 * 5. REVERSE_CODING         - Code: REV
 * 6. CTF                    - Code: CTF
 * 7. WEB_CREATION           - Code: WEB
 * 8. DATA_GRID              - Code: DATA
 * 9. E_SPORTS               - Code: ESPORTS
 *
 * HOW TO DEPLOY:
 * 1. Open Google Sheets (create new or use existing).
 * 2. Go to "Extensions" > "Apps Script".
 * 3. Replace all code in the editor with this entire file.
 * 4. (Optional) Set custom Admin PIN: Project Settings > Script Properties > Add "ADMIN_PIN" = "JSEC@2027".
 * 5. Click "Deploy" > "New deployment".
 * 6. Select type: "Web app".
 *    - Description: "GRAVITON 2026 Multi-Event API"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (Required so frontend can submit)
 * 7. Authorize permissions and copy the Web App URL (ends in /exec).
 * 8. Paste URL into `config.js` as `API_URL: "https://script.google.com/macros/s/.../exec"`.
 * ============================================================================
 */

// Default Admin Security PIN if not configured in Script Properties
const DEFAULT_ADMIN_PIN = "JSEC@2027";

// ============================================================================
// HTTP EMAIL API CONFIGURATION (NO GOOGLE ACCOUNT PERMISSIONS REQUIRED)
// ============================================================================
// Provider options: "BREVO" (Recommended - 300 free emails/day to ANY inbox)
//                   "RESEND" (3000 free emails/month)
//                   "MAILAPP" (Google Account native fallback)
const EMAIL_CONFIG = {
  // Set provider: "BREVO" or "RESEND" or "MAILAPP"
  PROVIDER: "BREVO",

  // Paste your API Key here:
  // Brevo API Key: starts with "xkeysib-..." (Get free at https://brevo.com -> SMTP & API -> API Keys)
  // Resend API Key: starts with "re_..." (Get free at https://resend.com)
  API_KEY: "",

  // Sender details displayed to delegates
  SENDER_NAME: "GRAVITON 2026 Organizing Committee",
  SENDER_EMAIL: "nithnithish500@gmail.com"
};

// Primary Master Sheet Name
const MASTER_SHEET_NAME = "MASTER_REGISTRATIONS";

// Legacy Sheet Name (kept for backward compatibility, never deleted or overwritten)
const LEGACY_SHEET_NAME = "Registrations";

// Event Registry with Canonical Names, Sheet Names, Prefixes, and Aliases
const EVENT_REGISTRY = {
  "PPT": {
    code: "PPT",
    name: "PPT Presentation",
    sheetName: "PPT_PRESENTATION",
    category: "Technical",
    aliases: ["ppt presentation", "ppt", "paper presentation", "presentation"]
  },
  "QUIZ": {
    code: "QUIZ",
    name: "Tech Quiz",
    sheetName: "TECH_QUIZ",
    category: "Technical",
    aliases: ["tech quiz", "quiz", "technical quiz"]
  },
  "AIP": {
    code: "AIP",
    name: "AI Prompt Battle",
    sheetName: "AI_PROMPT_BATTLE",
    category: "Technical",
    aliases: ["ai prompt battle", "ai prompt", "aip", "prompt battle"]
  },
  "REV": {
    code: "REV",
    name: "Reverse Coding",
    sheetName: "REVERSE_CODING",
    category: "Technical",
    aliases: ["reverse coding", "rev coding", "rev"]
  },
  "CTF": {
    code: "CTF",
    name: "CTF (Capture The Flag)",
    sheetName: "CTF",
    category: "Technical",
    aliases: ["ctf (capture the flag)", "ctf", "capture the flag"]
  },
  "WEB": {
    code: "WEB",
    name: "Web Creation (No AI)",
    sheetName: "WEB_CREATION",
    category: "Technical",
    aliases: ["website creation without using ai", "web creation (no ai)", "web creation", "website creation", "web"]
  },
  "DATA": {
    code: "DATA",
    name: "Data Grid",
    sheetName: "DATA_GRID",
    category: "Technical",
    aliases: ["data grid", "data"]
  },
  "ESPORTS": {
    code: "ESPORTS",
    name: "E Sports Battle",
    sheetName: "E_SPORTS",
    category: "Non-Technical",
    aliases: ["e sports battle", "e sports", "esports", "gaming"]
  }
};

// Master Sheet Headers
const MASTER_HEADERS = [
  "Master Registration ID",
  "Date/Time",
  "Participant Name",
  "Email",
  "Phone",
  "College",
  "Department",
  "Year",
  "Selected Events",
  "Total Amount",
  "UTR",
  "Payment Status",
  "Overall Registration Status",
  "Verification Time",
  "Verified By",
  "Team Name",
  "Team Members",
  "Payment Screenshot"
];

// Event Sheet Headers
const EVENT_HEADERS = [
  "Event Registration ID",
  "Master Registration ID",
  "Timestamp",
  "Participant/Team Name",
  "Email",
  "Phone",
  "College",
  "Department",
  "Year",
  "Team Size",
  "Team Members",
  "Payment UTR",
  "Payment Status",
  "Registration Status",
  "Verified By",
  "Verification Date",
  "Payment Screenshot"
];

// ============================================================================
// VERCEL BLOB STORAGE INTEGRATION (PAYMENT SCREENSHOT PROOF)
// ============================================================================
const BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_wf4d4Po6W2B0uQP7_BpyYSXFmfczcdDa2D9hvvlgMtiMd3L";

/**
 * Uploads payment screenshot to Vercel Blob and returns the permanent public CDN link.
 * If dataOrUrl is already an HTTP / HTTPS link, returns it directly.
 * If dataOrUrl is a base64 string, converts and uploads via Vercel Blob REST API.
 */
function uploadToVercelBlob(dataOrUrl, customFilename) {
  if (!dataOrUrl) return "";
  const str = String(dataOrUrl).trim();
  
  // If already an uploaded URL, return directly
  if (str.startsWith("http://") || str.startsWith("https://")) {
    return str;
  }

  try {
    const scriptProps = PropertiesService.getScriptProperties();
    const token = scriptProps.getProperty("BLOB_READ_WRITE_TOKEN") || BLOB_READ_WRITE_TOKEN;
    const match = token.match(/^vercel_blob_rw_([a-zA-Z0-9]+)_/);
    const storeId = match ? match[1] : "wf4d4Po6W2B0uQP7";

    let cleanBase64 = str;
    let contentType = "image/jpeg";
    if (str.indexOf("base64,") !== -1) {
      const parts = str.split("base64,");
      const mimeMatch = parts[0].match(/data:(.*?);/);
      if (mimeMatch) contentType = mimeMatch[1];
      cleanBase64 = parts[1];
    }

    const decodedBytes = Utilities.base64Decode(cleanBase64);
    const filename = (customFilename || ("proof_" + new Date().getTime() + ".jpg")).replace(/[^a-zA-Z0-9._-]/g, "_");
    const pathname = "payments/" + filename;
    const requestId = storeId + ":" + new Date().getTime() + ":" + Math.floor(Math.random() * 1000000).toString(16);
    const url = "https://vercel.com/api/blob/?pathname=" + encodeURIComponent(pathname);

    const options = {
      method: "put",
      headers: {
        "authorization": "Bearer " + token,
        "x-api-version": "12",
        "x-vercel-blob-access": "public",
        "x-vercel-blob-store-id": storeId,
        "x-api-blob-request-id": requestId,
        "x-api-blob-request-attempt": "0",
        "content-type": contentType
      },
      payload: decodedBytes,
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(url, options);
    const code = response.getResponseCode();
    if (code >= 200 && code < 300) {
      const resJson = JSON.parse(response.getContentText());
      return resJson.url || str.substring(0, 45000);
    } else {
      Logger.log("Vercel Blob upload failed with status " + code + ": " + response.getContentText());
      return str.substring(0, 45000);
    }
  } catch (err) {
    Logger.log("Vercel Blob upload error: " + err.toString());
    return str.substring(0, 45000);
  }
}

/**
 * ONE-TIME AUTHORIZATION HELPER
 * Select this function in the Apps Script top toolbar dropdown and click "Run" (▶).
 * When Google asks "Authorization required", click "Review permissions" -> Advanced -> Allow.
 * This grants Google Apps Script permission to automatically send confirmation emails!
 */
function authorizeEmailPermissions() {
  const quota = MailApp.getRemainingDailyQuota();
  Logger.log("✅ MailApp Authorized! Remaining daily email quota: " + quota);
  return "MailApp authorized successfully! Remaining quota: " + quota;
}

/**
 * TEST HTTP EMAIL API
 * Select this function in the top Apps Script dropdown and click "Run" (▶).
 * It will test your Brevo / Resend HTTP API key and output the result in the Execution Log!
 */
function testHttpEmail() {
  const testRecipient = EMAIL_CONFIG.SENDER_EMAIL || "nithnithish500@gmail.com";
  Logger.log("Testing HTTP Email API (" + EMAIL_CONFIG.PROVIDER + ") to: " + testRecipient);

  const result = sendPaymentConfirmationEmail({
    regId: "GRAV-2026-TEST",
    fullname: "Test Participant",
    email: testRecipient,
    phone: "9344849123",
    college: "Jaya Sakthi Engineering College",
    dept: "CSE",
    year: "II Year",
    events: "Reverse Coding",
    amount: "100",
    utr: "TEST12345678"
  }, [{ eventId: "REV-001", eventName: "Reverse Coding", category: "Technical" }]);

  Logger.log("Test Result: " + JSON.stringify(result));
  return result;
}

/**
 * Handle HTTP GET Requests (Health Check, Status Check, Metadata)
 */
function doGet(e) {
  try {
    const params = e ? e.parameter : {};
    const action = params.action;

    if (!action || action === "ping") {
      return jsonResponse({
        success: true,
        message: "GRAVITON 2026 Multi-Event API is running successfully!",
        sheetsConfigured: Object.keys(EVENT_REGISTRY).length + 1,
        timestamp: new Date().toISOString()
      });
    }

    if (action === "checkStatus") {
      return handleCheckStatus(params.regId);
    }

    if (action === "getEventList") {
      return jsonResponse({
        success: true,
        events: Object.keys(EVENT_REGISTRY).map(code => ({
          code: code,
          name: EVENT_REGISTRY[code].name,
          sheetName: EVENT_REGISTRY[code].sheetName,
          category: EVENT_REGISTRY[code].category
        }))
      });
    }

    return jsonResponse({
      success: false,
      error: "Unknown GET action. Use POST for mutations."
    });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * Handle HTTP POST Requests (Registration, Payment Submission, Admin Actions)
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ success: false, error: "Empty request payload" });
    }

    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return jsonResponse({ success: false, error: "Invalid JSON payload" });
    }

    const action = data.action;

    switch (action) {
      case "register":
        return handleRegister(data);

      case "submitPayment":
        return handleSubmitPayment(data);

      case "checkStatus":
        return handleCheckStatus(data.regId);

      case "getRegistrations":
        return handleGetRegistrations(data);

      case "verifyPayment":
        return handleVerifyPayment(data);

      case "sendConfirmationEmail":
        return handleSendConfirmationEmail(data);

      case "rejectPayment":
        return handleRejectPayment(data);

      case "migrateLegacyData":
        return handleMigrateLegacyData(data);

      default:
        return jsonResponse({
          success: false,
          error: "Unknown action: " + action
        });
    }
  } catch (err) {
    return jsonResponse({
      success: false,
      error: "Server processing error: " + err.toString()
    });
  }
}

// ============================================================================
// SHEET INITIALIZATION & HELPER FUNCTIONS
// ============================================================================

/**
 * Resolves an event title/string to its canonical EVENT_REGISTRY object
 */
function resolveEventEntry(rawEventName) {
  if (!rawEventName) return null;
  const clean = String(rawEventName).trim().toLowerCase();

  // 1. Direct code lookup
  const upperCode = clean.toUpperCase();
  if (EVENT_REGISTRY[upperCode]) {
    return EVENT_REGISTRY[upperCode];
  }

  // 2. Direct name or alias lookup
  for (const code in EVENT_REGISTRY) {
    const entry = EVENT_REGISTRY[code];
    if (entry.name.toLowerCase() === clean) return entry;
    if (entry.sheetName.toLowerCase() === clean) return entry;
    if (entry.aliases.some(alias => clean.includes(alias) || alias.includes(clean))) {
      return entry;
    }
  }

  return null;
}

/**
 * Retrieves or creates MASTER_REGISTRATIONS sheet with styled headers
 */
function getOrCreateMasterSheet(ss) {
  let sheet = ss.getSheetByName(MASTER_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(MASTER_SHEET_NAME, 0);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(MASTER_HEADERS);
    const range = sheet.getRange(1, 1, 1, MASTER_HEADERS.length);
    range.setBackground("#b3001b");
    range.setFontColor("#ffffff");
    range.setFontWeight("bold");
    sheet.setFrozenRows(1);
  }

  return sheet;
}

/**
 * Retrieves or creates a specific Event sheet with styled headers
 */
function getOrCreateEventSheet(ss, sheetName) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(EVENT_HEADERS);
    const range = sheet.getRange(1, 1, 1, EVENT_HEADERS.length);
    range.setBackground("#0e1626");
    range.setFontColor("#00f0ff");
    range.setFontWeight("bold");
    sheet.setFrozenRows(1);
  }

  return sheet;
}

/**
 * Generates sequential Master Registration ID (GRAV-0001, GRAV-0002, ...)
 * Concurrency-safe: scans sheet and updates ScriptProperties atomically within Lock
 */
function getNextMasterId(ss, scriptProps) {
  let propVal = parseInt(scriptProps.getProperty("COUNTER_MASTER") || "0", 10);
  const sheet = getOrCreateMasterSheet(ss);
  let maxInSheet = 0;

  if (sheet.getLastRow() > 1) {
    const ids = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) {
      const val = String(ids[i][0]).trim();
      const match = val.match(/GRAV-(?:2026-)?(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxInSheet) maxInSheet = num;
      }
    }
  }

  const nextVal = Math.max(propVal, maxInSheet) + 1;
  scriptProps.setProperty("COUNTER_MASTER", String(nextVal));
  return "GRAV-" + String(nextVal).padStart(4, "0");
}

/**
 * Generates independent sequential Event Registration ID (QUIZ-001, CTF-001, ...)
 * Concurrency-safe: independent per event
 */
function getNextEventId(ss, eventEntry, scriptProps) {
  const code = eventEntry.code;
  const propKey = "COUNTER_" + code;
  let propVal = parseInt(scriptProps.getProperty(propKey) || "0", 10);

  const sheet = getOrCreateEventSheet(ss, eventEntry.sheetName);
  let maxInSheet = 0;

  if (sheet.getLastRow() > 1) {
    const ids = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) {
      const val = String(ids[i][0]).trim();
      const match = val.match(new RegExp(code + "-(\\d+)", "i"));
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxInSheet) maxInSheet = num;
      }
    }
  }

  const nextVal = Math.max(propVal, maxInSheet) + 1;
  scriptProps.setProperty(propKey, String(nextVal));
  return code + "-" + String(nextVal).padStart(3, "0");
}

// ============================================================================
// CORE BUSINESS LOGIC ACTIONS
// ============================================================================

/**
 * ACTION: register
 * Registers participant across MASTER_REGISTRATIONS and EACH event sheet separately.
 */
function handleRegister(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const scriptProps = PropertiesService.getScriptProperties();
  const lock = LockService.getScriptLock();

  // Try to obtain lock for concurrency safety (wait up to 30 seconds)
  try {
    lock.waitLock(30000);
  } catch (e) {
    return jsonResponse({ success: false, error: "Server busy, please retry in a few seconds." });
  }

  try {
    const fullname = (data.fullname || "").trim();
    const email = (data.email || "").trim().toLowerCase();
    const phone = (data.phone || "").trim();
    const college = (data.college || "").trim();
    const dept = (data.dept || "").trim();
    const year = (data.year || "").trim();
    const rawEvents = data.events;
    const amount = Number(data.amount) || 100;
    const teamName = (data.teamName || "").trim();
    const teamMembersList = Array.isArray(data.teamMembers) 
      ? data.teamMembers.map(m => String(m).trim()).filter(Boolean)
      : (data.teamMembers ? String(data.teamMembers).split(",").map(m => m.trim()).filter(Boolean) : []);
    const teamMembersStr = teamMembersList.join(", ");
    const teamSize = teamName ? (1 + teamMembersList.length) : 1;
    const participantOrTeam = teamName ? (teamName + " (" + fullname + ")") : fullname;

    if (!fullname || !email || !phone || !college || !dept || !year) {
      return jsonResponse({ success: false, error: "All required delegate details must be filled." });
    }

    // Parse events array
    let eventsList = [];
    if (Array.isArray(rawEvents)) {
      eventsList = rawEvents.map(e => String(e).trim()).filter(Boolean);
    } else if (rawEvents) {
      eventsList = String(rawEvents).split(",").map(e => e.trim()).filter(Boolean);
    }

    if (eventsList.length === 0) {
      return jsonResponse({ success: false, error: "Please select at least one event to participate in." });
    }

    // Resolve event registry objects
    const resolvedEvents = [];
    for (let i = 0; i < eventsList.length; i++) {
      const entry = resolveEventEntry(eventsList[i]);
      if (entry) {
        // Prevent duplicate events within same registration
        if (!resolvedEvents.some(re => re.code === entry.code)) {
          resolvedEvents.push(entry);
        }
      }
    }

    if (resolvedEvents.length === 0) {
      return jsonResponse({ success: false, error: "Could not resolve selected events: " + eventsList.join(", ") });
    }

    const timestamp = new Date().toISOString();
    const utr = (data.utr || "").trim();
    const rawProof = (data.screenshot || data.paymentScreenshot || "").trim();
    const hasProof = Boolean(rawProof || utr);
    const paymentStatus = hasProof ? "UNDER_VERIFICATION" : "PENDING";
    const overallRegStatus = hasProof ? "UNDER_VERIFICATION" : "PENDING";
    const verificationTime = "";
    const verifiedBy = "";

    // 1. Generate unique Master Registration ID
    const masterRegId = getNextMasterId(ss, scriptProps);

    // Upload payment screenshot to Vercel Blob and store the permanent link
    const paymentScreenshot = rawProof ? uploadToVercelBlob(rawProof, masterRegId + "_proof.jpg") : "";

    // 2. Generate independent event registration IDs and append to each event sheet
    const generatedEventRegs = [];
    const eventSummaryDisplayList = [];

    for (let i = 0; i < resolvedEvents.length; i++) {
      const eventEntry = resolvedEvents[i];
      const eventRegId = getNextEventId(ss, eventEntry, scriptProps);
      const eventSheet = getOrCreateEventSheet(ss, eventEntry.sheetName);

      // Event Sheet Row format:
      // Event Reg ID, Master Reg ID, Timestamp, Participant/Team Name, Email, Phone, College, Dept, Year, Team Size, Team Members, Payment UTR, Payment Status, Registration Status, Verified By, Verification Date, Payment Screenshot
      const eventRow = [
        eventRegId,
        masterRegId,
        timestamp,
        participantOrTeam,
        email,
        phone,
        college,
        dept,
        year,
        teamSize,
        teamMembersStr,
        utr,
        paymentStatus,
        overallRegStatus,
        verifiedBy,
        verificationTime,
        paymentScreenshot
      ];

      eventSheet.appendRow(eventRow);

      generatedEventRegs.push({
        event: eventEntry.name,
        code: eventEntry.code,
        eventId: eventRegId,
        sheetName: eventEntry.sheetName,
        paymentStatus: paymentStatus
      });

      eventSummaryDisplayList.push(eventEntry.name + " (" + eventRegId + ")");
    }

    // 3. Append to MASTER_REGISTRATIONS
    const masterSheet = getOrCreateMasterSheet(ss);
    const selectedEventsSummary = eventSummaryDisplayList.join(", ");

    const masterRow = [
      masterRegId,
      timestamp,
      fullname,
      email,
      phone,
      college,
      dept,
      year,
      selectedEventsSummary,
      amount,
      utr,
      paymentStatus,
      overallRegStatus,
      verificationTime,
      verifiedBy,
      teamName,
      teamMembersStr,
      paymentScreenshot
    ];

    masterSheet.appendRow(masterRow);

    return jsonResponse({
      success: true,
      masterRegistrationId: masterRegId,
      regId: masterRegId, // for 100% backward compatibility
      eventRegistrations: generatedEventRegs,
      fullname: fullname,
      amount: amount,
      paymentStatus: paymentStatus,
      teamName: teamName,
      teamMembers: teamMembersStr,
      message: hasProof ? "Registration and payment proof recorded successfully! Status: Under Verification." : "Registration recorded successfully! Please submit your payment proof."
    });
  } finally {
    lock.releaseLock();
  }
}

/**
 * ACTION: submitPayment
 * Updates UTR across MASTER_REGISTRATIONS and ALL linked event sheets.
 */
function handleSubmitPayment(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(30000);
  } catch (e) {
    return jsonResponse({ success: false, error: "Server busy, please retry in a few seconds." });
  }

  try {
    const rawRegId = (data.regId || "").trim().toUpperCase();
    const utr = (data.utr || "").trim();
    const screenshot = (data.screenshot || "").trim();

    if (!rawRegId || !utr) {
      return jsonResponse({ success: false, error: "Registration ID and UTR / Transaction ID are required." });
    }

    // Discover the Master Registration ID
    let masterRegId = rawRegId;
    let foundMasterRow = -1;
    let targetMasterSheet = null;

    // 1. Search MASTER_REGISTRATIONS
    const masterSheet = ss.getSheetByName(MASTER_SHEET_NAME);
    if (masterSheet && masterSheet.getLastRow() > 1) {
      const values = masterSheet.getDataRange().getValues();
      for (let i = 1; i < values.length; i++) {
        const rowId = String(values[i][0]).trim().toUpperCase();
        if (rowId === rawRegId) {
          foundMasterRow = i + 1;
          targetMasterSheet = masterSheet;
          break;
        }
      }
    }

    // 2. Check legacy sheet if not found
    if (foundMasterRow === -1) {
      const legacySheet = ss.getSheetByName(LEGACY_SHEET_NAME);
      if (legacySheet && legacySheet.getLastRow() > 1) {
        const values = legacySheet.getDataRange().getValues();
        for (let i = 1; i < values.length; i++) {
          const rowId = String(values[i][0]).trim().toUpperCase();
          if (rowId === rawRegId) {
            foundMasterRow = i + 1;
            targetMasterSheet = legacySheet;
            break;
          }
        }
      }
    }

    // 3. If rawRegId is an Event ID (e.g. QUIZ-001), locate its Master ID from event sheets
    if (foundMasterRow === -1) {
      for (const code in EVENT_REGISTRY) {
        const sName = EVENT_REGISTRY[code].sheetName;
        const eSheet = ss.getSheetByName(sName);
        if (eSheet && eSheet.getLastRow() > 1) {
          const values = eSheet.getDataRange().getValues();
          for (let i = 1; i < values.length; i++) {
            if (String(values[i][0]).trim().toUpperCase() === rawRegId) {
              masterRegId = String(values[i][1]).trim().toUpperCase();
              break;
            }
          }
        }
        if (masterRegId !== rawRegId) break;
      }

      // Re-query master sheet with resolved masterRegId
      if (masterSheet && masterSheet.getLastRow() > 1) {
        const values = masterSheet.getDataRange().getValues();
        for (let i = 1; i < values.length; i++) {
          if (String(values[i][0]).trim().toUpperCase() === masterRegId) {
            foundMasterRow = i + 1;
            targetMasterSheet = masterSheet;
            break;
          }
        }
      }
    }

    if (foundMasterRow === -1 && !targetMasterSheet) {
      return jsonResponse({ success: false, error: "Registration ID not found: " + rawRegId });
    }

    // Upload payment screenshot to Vercel Blob and store permanent link
    const finalScreenshotUrl = screenshot ? uploadToVercelBlob(screenshot, masterRegId + "_payment.jpg") : "";

    // Update MASTER sheet (or legacy sheet)
    if (targetMasterSheet && foundMasterRow !== -1) {
      if (targetMasterSheet.getName() === MASTER_SHEET_NAME) {
        // MASTER_REGISTRATIONS: Col 11 = UTR, Col 12 = Payment Status, Col 13 = Overall Status, Col 18 = Screenshot
        targetMasterSheet.getRange(foundMasterRow, 11).setValue(utr);
        targetMasterSheet.getRange(foundMasterRow, 12).setValue("UNDER_VERIFICATION");
        targetMasterSheet.getRange(foundMasterRow, 13).setValue("UNDER_VERIFICATION");
        if (finalScreenshotUrl) {
          targetMasterSheet.getRange(foundMasterRow, 18).setValue(finalScreenshotUrl);
        }
      } else {
        // Legacy Sheet: Col 11 = Payment Status, Col 12 = UTR, Col 13 = Screenshot
        targetMasterSheet.getRange(foundMasterRow, 11).setValue("UNDER_VERIFICATION");
        targetMasterSheet.getRange(foundMasterRow, 12).setValue(utr);
        if (finalScreenshotUrl) {
          targetMasterSheet.getRange(foundMasterRow, 13).setValue(finalScreenshotUrl);
        }
      }
    }

    // Update linked event sheets where Master ID == masterRegId
    let updatedEventCount = 0;
    for (const code in EVENT_REGISTRY) {
      const sName = EVENT_REGISTRY[code].sheetName;
      const eSheet = ss.getSheetByName(sName);
      if (eSheet && eSheet.getLastRow() > 1) {
        const values = eSheet.getDataRange().getValues();
        for (let i = 1; i < values.length; i++) {
          const rowMasterId = String(values[i][1]).trim().toUpperCase();
          if (rowMasterId === masterRegId) {
            const rowIndex = i + 1;
            // EVENT_HEADERS: Col 12 = Payment UTR, Col 13 = Payment Status, Col 14 = Registration Status, Col 17 = Payment Screenshot
            eSheet.getRange(rowIndex, 12).setValue(utr);
            eSheet.getRange(rowIndex, 13).setValue("UNDER_VERIFICATION");
            eSheet.getRange(rowIndex, 14).setValue("UNDER_VERIFICATION");
            if (finalScreenshotUrl) {
              eSheet.getRange(rowIndex, 17).setValue(finalScreenshotUrl);
            }
            updatedEventCount++;
          }
        }
      }
    }

    return jsonResponse({
      success: true,
      masterRegistrationId: masterRegId,
      regId: masterRegId,
      utr: utr,
      status: "UNDER_VERIFICATION",
      updatedEventCount: updatedEventCount,
      message: "Payment submitted successfully! Status updated to Under Verification."
    });
  } finally {
    lock.releaseLock();
  }
}

/**
 * ACTION: checkStatus
 * Looks up Master Registration and ALL associated Event registrations.
 */
function handleCheckStatus(rawRegId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const searchId = (rawRegId || "").trim().toUpperCase();

  if (!searchId) {
    return jsonResponse({ success: false, error: "Registration ID is required." });
  }

  let masterRecord = null;
  let resolvedMasterId = searchId;

  // 1. Search in MASTER_REGISTRATIONS
  const masterSheet = ss.getSheetByName(MASTER_SHEET_NAME);
  if (masterSheet && masterSheet.getLastRow() > 1) {
    const values = masterSheet.getDataRange().getValues();
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      if (String(row[0]).trim().toUpperCase() === searchId) {
        masterRecord = {
          regId: row[0],
          timestamp: row[1],
          fullname: row[2],
          email: row[3],
          phone: row[4],
          college: row[5],
          dept: row[6],
          year: row[7],
          events: row[8],
          amount: row[9],
          utr: row[10] || "",
          paymentStatus: row[11] || "PENDING",
          registrationStatus: row[12] || "PENDING",
          verificationTime: row[13] || "",
          verifiedBy: row[14] || "",
          teamName: row[15] || "",
          teamMembers: row[16] || "",
          screenshot: row[17] ? String(row[17]) : ""
        };
        break;
      }
    }
  }

  // 2. Check legacy sheet if not found
  if (!masterRecord) {
    const legacySheet = ss.getSheetByName(LEGACY_SHEET_NAME);
    if (legacySheet && legacySheet.getLastRow() > 1) {
      const values = legacySheet.getDataRange().getValues();
      for (let i = 1; i < values.length; i++) {
        const row = values[i];
        if (String(row[0]).trim().toUpperCase() === searchId) {
          masterRecord = {
            regId: row[0],
            timestamp: row[1],
            fullname: row[2],
            email: row[3],
            phone: row[4],
            college: row[5],
            dept: row[6],
            year: row[7],
            events: row[8],
            amount: row[9],
            paymentStatus: row[10] || "PENDING",
            utr: row[11] || "",
            verificationTime: row[13] || "",
            verifiedBy: row[14] || "",
            teamName: "",
            teamMembers: "",
            screenshot: row[12] ? String(row[12]) : ""
          };
          break;
        }
      }
    }
  }

  // 3. If user searched by an Event ID (e.g. QUIZ-001), find its Master ID
  if (!masterRecord) {
    for (const code in EVENT_REGISTRY) {
      const sName = EVENT_REGISTRY[code].sheetName;
      const eSheet = ss.getSheetByName(sName);
      if (eSheet && eSheet.getLastRow() > 1) {
        const values = eSheet.getDataRange().getValues();
        for (let i = 1; i < values.length; i++) {
          if (String(values[i][0]).trim().toUpperCase() === searchId) {
            resolvedMasterId = String(values[i][1]).trim().toUpperCase();
            break;
          }
        }
      }
      if (resolvedMasterId !== searchId) break;
    }

    if (resolvedMasterId !== searchId) {
      return handleCheckStatus(resolvedMasterId);
    }
  }

  if (!masterRecord) {
    return jsonResponse({
      success: false,
      error: "Registration ID not found: " + searchId + ". Please verify your ID or register."
    });
  }

  // 4. Query all event sheets for events linked to this Master ID
  const eventRegistrations = [];
  for (const code in EVENT_REGISTRY) {
    const entry = EVENT_REGISTRY[code];
    const eSheet = ss.getSheetByName(entry.sheetName);
    if (eSheet && eSheet.getLastRow() > 1) {
      const values = eSheet.getDataRange().getValues();
      for (let i = 1; i < values.length; i++) {
        const row = values[i];
        if (String(row[1]).trim().toUpperCase() === masterRecord.regId.toUpperCase()) {
          eventRegistrations.push({
            eventId: row[0],
            event: entry.name,
            code: entry.code,
            sheetName: entry.sheetName,
            timestamp: row[2],
            participantOrTeam: row[3],
            teamSize: row[9],
            teamMembers: row[10],
            utr: row[11],
            paymentStatus: row[12] || masterRecord.paymentStatus,
            registrationStatus: row[13] || "PENDING",
            verifiedBy: row[14],
            verificationDate: row[15],
            screenshot: row[16] ? String(row[16]) : ""
          });
        }
      }
    }
  }

  masterRecord.eventRegistrations = eventRegistrations;

  return jsonResponse({
    success: true,
    masterRegistrationId: masterRecord.regId,
    regId: masterRecord.regId,
    record: masterRecord
  });
}

/**
 * Helper to verify Admin Security PIN
 */
function isValidAdminPin(enteredPin) {
  const scriptProps = PropertiesService.getScriptProperties();
  const configuredPin = scriptProps.getProperty("ADMIN_PIN") || DEFAULT_ADMIN_PIN;
  return String(enteredPin).trim() === String(configuredPin).trim();
}

/**
 * ACTION: getRegistrations
 * Returns registrations with optional event sheet filtering.
 * Filter can be "ALL" (Master Registry) or specific event code/sheet (e.g. "QUIZ", "CTF").
 */
function handleGetRegistrations(data) {
  if (!isValidAdminPin(data.adminPin)) {
    return jsonResponse({ success: false, error: "Unauthorized. Invalid Security PIN." });
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const filter = (data.eventFilter || data.event || "ALL").trim().toUpperCase();

  // If specific event is selected, read directly from that event sheet
  if (filter !== "ALL") {
    let targetEntry = EVENT_REGISTRY[filter] || resolveEventEntry(filter);

    if (targetEntry) {
      const eSheet = ss.getSheetByName(targetEntry.sheetName);
      const records = [];

      if (eSheet && eSheet.getLastRow() > 1) {
        const values = eSheet.getDataRange().getValues();
        for (let i = 1; i < values.length; i++) {
          const row = values[i];
          if (!row[0]) continue;
          records.push({
            eventId: row[0],
            masterRegId: row[1],
            regId: row[0], // for compatibility with table renders
            timestamp: row[2],
            fullname: row[3],
            email: row[4],
            phone: row[5],
            college: row[6],
            dept: row[7],
            year: row[8],
            teamSize: row[9],
            teamMembers: row[10],
            events: targetEntry.name + " (" + row[0] + ")",
            amount: "—",
            utr: row[11] || "",
            paymentStatus: row[12] || "PENDING",
            registrationStatus: row[13] || "PENDING",
            verifiedBy: row[14] || "",
            verificationTime: row[15] || "",
            screenshot: row[16] ? String(row[16]) : "",
            eventCode: targetEntry.code,
            sheetName: targetEntry.sheetName
          });
        }
      }

      return jsonResponse({
        success: true,
        filter: targetEntry.code,
        eventName: targetEntry.name,
        sheetName: targetEntry.sheetName,
        records: records,
        count: records.length
      });
    }
  }

  // ALL EVENTS: Query MASTER_REGISTRATIONS (and legacy sheet if needed)
  const masterRecords = [];
  const masterSheet = ss.getSheetByName(MASTER_SHEET_NAME);

  if (masterSheet && masterSheet.getLastRow() > 1) {
    const values = masterSheet.getDataRange().getValues();
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      if (!row[0]) continue;
      masterRecords.push({
        masterRegId: row[0],
        regId: row[0],
        timestamp: row[1],
        fullname: row[2],
        email: row[3],
        phone: row[4],
        college: row[5],
        dept: row[6],
        year: row[7],
        events: row[8],
        amount: row[9],
        utr: row[10] || "",
        paymentStatus: row[11] || "PENDING",
        registrationStatus: row[12] || "PENDING",
        verificationTime: row[13] || "",
        verifiedBy: row[14] || "",
        teamName: row[15] || "",
        teamMembers: row[16] || "",
        hasScreenshot: Boolean(row[17]),
        screenshot: row[17] ? String(row[17]) : ""
      });
    }
  }

  // Also include legacy registrations if any were not yet migrated
  const legacySheet = ss.getSheetByName(LEGACY_SHEET_NAME);
  if (legacySheet && legacySheet.getLastRow() > 1) {
    const existingMasterIds = new Set(masterRecords.map(r => r.regId.toUpperCase()));
    const values = legacySheet.getDataRange().getValues();
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      if (!row[0]) continue;
      const lId = String(row[0]).trim().toUpperCase();
      if (!existingMasterIds.has(lId)) {
        masterRecords.push({
          masterRegId: row[0],
          regId: row[0],
          timestamp: row[1],
          fullname: row[2],
          email: row[3],
          phone: row[4],
          college: row[5],
          dept: row[6],
          year: row[7],
          events: row[8],
          amount: row[9],
          paymentStatus: row[10] || "PENDING",
          utr: row[11] || "",
          hasScreenshot: Boolean(row[12]),
          screenshot: row[12] ? String(row[12]) : "",
          verificationTime: row[13] || "",
          verifiedBy: row[14] || ""
        });
      }
    }
  }

  return jsonResponse({
    success: true,
    filter: "ALL",
    records: masterRecords,
    count: masterRecords.length
  });
}

/**
 * ACTION: verifyPayment
 * Marks participant payment status as VERIFIED across MASTER_REGISTRATIONS and event sheets.
 */
function handleVerifyPayment(data) {
  if (!isValidAdminPin(data.adminPin)) {
    return jsonResponse({ success: false, error: "Unauthorized. Invalid Security PIN." });
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const searchId = (data.regId || "").trim().toUpperCase();
  const verifiedBy = (data.verifiedBy || "Organizer").trim();
  const now = new Date().toISOString();

  if (!searchId) {
    return jsonResponse({ success: false, error: "Registration ID is required." });
  }

  let masterRegId = searchId;

  // If searchId is an Event ID, discover its Master ID first
  if (!searchId.startsWith("GRAV-")) {
    for (const code in EVENT_REGISTRY) {
      const sName = EVENT_REGISTRY[code].sheetName;
      const eSheet = ss.getSheetByName(sName);
      if (eSheet && eSheet.getLastRow() > 1) {
        const values = eSheet.getDataRange().getValues();
        for (let i = 1; i < values.length; i++) {
          if (String(values[i][0]).trim().toUpperCase() === searchId) {
            masterRegId = String(values[i][1]).trim().toUpperCase();
            break;
          }
        }
      }
      if (masterRegId !== searchId) break;
    }
  }

  // 1. Update in MASTER_REGISTRATIONS & retrieve participant details
  let updatedMaster = false;
  let participant = null;
  const masterSheet = ss.getSheetByName(MASTER_SHEET_NAME);
  if (masterSheet && masterSheet.getLastRow() > 1) {
    const values = masterSheet.getDataRange().getValues();
    for (let i = 1; i < values.length; i++) {
      if (String(values[i][0]).trim().toUpperCase() === masterRegId) {
        const rowIndex = i + 1;
        masterSheet.getRange(rowIndex, 12).setValue("VERIFIED"); // Payment Status
        masterSheet.getRange(rowIndex, 13).setValue("VERIFIED"); // Overall Status
        masterSheet.getRange(rowIndex, 14).setValue(now);        // Verification Time
        masterSheet.getRange(rowIndex, 15).setValue(verifiedBy);  // Verified By
        updatedMaster = true;

        participant = {
          regId: values[i][0],
          timestamp: values[i][1],
          fullname: values[i][2],
          email: values[i][3],
          phone: values[i][4],
          college: values[i][5],
          dept: values[i][6],
          year: values[i][7],
          events: values[i][8],
          amount: values[i][9],
          utr: values[i][10],
          teamName: values[i][15] || "",
          teamMembers: values[i][16] || "",
          screenshot: values[i][17] || ""
        };
        break;
      }
    }
  }

  // Check legacy sheet if not in MASTER
  if (!updatedMaster) {
    const legacySheet = ss.getSheetByName(LEGACY_SHEET_NAME);
    if (legacySheet && legacySheet.getLastRow() > 1) {
      const values = legacySheet.getDataRange().getValues();
      for (let i = 1; i < values.length; i++) {
        if (String(values[i][0]).trim().toUpperCase() === masterRegId) {
          const rowIndex = i + 1;
          legacySheet.getRange(rowIndex, 11).setValue("VERIFIED");
          legacySheet.getRange(rowIndex, 14).setValue(now);
          legacySheet.getRange(rowIndex, 15).setValue(verifiedBy);
          updatedMaster = true;

          participant = {
            regId: values[i][0],
            timestamp: values[i][1],
            fullname: values[i][2],
            email: values[i][3],
            phone: values[i][4],
            college: values[i][5],
            dept: values[i][6],
            year: values[i][7],
            events: values[i][8],
            amount: values[i][9],
            utr: values[i][11] || "",
            teamName: "",
            teamMembers: "",
            screenshot: values[i][12] || ""
          };
          break;
        }
      }
    }
  }

  // 2. Update in ALL Event sheets where Master ID == masterRegId (or Event ID == searchId)
  let updatedEventCount = 0;
  const linkedEvents = [];
  for (const code in EVENT_REGISTRY) {
    const sName = EVENT_REGISTRY[code].sheetName;
    const eSheet = ss.getSheetByName(sName);
    if (eSheet && eSheet.getLastRow() > 1) {
      const values = eSheet.getDataRange().getValues();
      for (let i = 1; i < values.length; i++) {
        const rowEventId = String(values[i][0]).trim().toUpperCase();
        const rowMasterId = String(values[i][1]).trim().toUpperCase();

        if (rowMasterId === masterRegId || rowEventId === searchId) {
          const rowIndex = i + 1;
          eSheet.getRange(rowIndex, 13).setValue("VERIFIED"); // Payment Status
          eSheet.getRange(rowIndex, 14).setValue("VERIFIED"); // Registration Status
          eSheet.getRange(rowIndex, 15).setValue(verifiedBy); // Verified By
          eSheet.getRange(rowIndex, 16).setValue(now);        // Verification Date
          updatedEventCount++;

          linkedEvents.push({
            eventId: values[i][0],
            eventName: EVENT_REGISTRY[code].name,
            code: EVENT_REGISTRY[code].code,
            category: EVENT_REGISTRY[code].category
          });
        }
      }
    }
  }

  // 3. Dispatch automated confirmation email to participant
  let emailSent = false;
  let emailError = null;
  let recipientEmail = participant ? String(participant.email || "").trim() : "";

  if (participant && recipientEmail && recipientEmail.includes("@")) {
    try {
      const emailResult = sendPaymentConfirmationEmail(participant, linkedEvents);
      emailSent = emailResult.success;
      if (!emailResult.success) {
        emailError = emailResult.error;
      }
    } catch (eErr) {
      emailSent = false;
      emailError = eErr.toString();
      Logger.log("Email dispatch failed: " + emailError);
    }
  }

  return jsonResponse({
    success: true,
    masterRegistrationId: masterRegId,
    regId: masterRegId,
    paymentStatus: "VERIFIED",
    updatedEventCount: updatedEventCount,
    verificationTime: now,
    verifiedBy: verifiedBy,
    emailSent: emailSent,
    recipientEmail: recipientEmail,
    emailError: emailError,
    message: emailSent
      ? ("Registration verified & confirmation email sent to " + recipientEmail)
      : ("Registration marked as VERIFIED." + (emailError ? " (Email notice: " + emailError + ")" : ""))
  });
}

/**
 * ACTION: sendConfirmationEmail
 * Manually dispatches or resends the official confirmation email to the participant.
 */
function handleSendConfirmationEmail(data) {
  if (!isValidAdminPin(data.adminPin)) {
    return jsonResponse({ success: false, error: "Unauthorized. Invalid Security PIN." });
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const searchId = (data.regId || "").trim().toUpperCase();

  if (!searchId) {
    return jsonResponse({ success: false, error: "Registration ID is required." });
  }

  let masterRegId = searchId;

  // Resolve Master ID if Event ID was provided
  if (!searchId.startsWith("GRAV-")) {
    for (const code in EVENT_REGISTRY) {
      const sName = EVENT_REGISTRY[code].sheetName;
      const eSheet = ss.getSheetByName(sName);
      if (eSheet && eSheet.getLastRow() > 1) {
        const values = eSheet.getDataRange().getValues();
        for (let i = 1; i < values.length; i++) {
          if (String(values[i][0]).trim().toUpperCase() === searchId) {
            masterRegId = String(values[i][1]).trim().toUpperCase();
            break;
          }
        }
      }
      if (masterRegId !== searchId) break;
    }
  }

  let participant = null;
  const masterSheet = ss.getSheetByName(MASTER_SHEET_NAME);
  if (masterSheet && masterSheet.getLastRow() > 1) {
    const values = masterSheet.getDataRange().getValues();
    for (let i = 1; i < values.length; i++) {
      if (String(values[i][0]).trim().toUpperCase() === masterRegId) {
        participant = {
          regId: values[i][0],
          timestamp: values[i][1],
          fullname: values[i][2],
          email: values[i][3],
          phone: values[i][4],
          college: values[i][5],
          dept: values[i][6],
          year: values[i][7],
          events: values[i][8],
          amount: values[i][9],
          utr: values[i][10],
          paymentStatus: values[i][11] || "VERIFIED",
          teamName: values[i][15] || "",
          teamMembers: values[i][16] || "",
          screenshot: values[i][17] || ""
        };
        break;
      }
    }
  }

  if (!participant) {
    const legacySheet = ss.getSheetByName(LEGACY_SHEET_NAME);
    if (legacySheet && legacySheet.getLastRow() > 1) {
      const values = legacySheet.getDataRange().getValues();
      for (let i = 1; i < values.length; i++) {
        if (String(values[i][0]).trim().toUpperCase() === masterRegId) {
          participant = {
            regId: values[i][0],
            timestamp: values[i][1],
            fullname: values[i][2],
            email: values[i][3],
            phone: values[i][4],
            college: values[i][5],
            dept: values[i][6],
            year: values[i][7],
            events: values[i][8],
            amount: values[i][9],
            paymentStatus: values[i][10] || "VERIFIED",
            utr: values[i][11] || "",
            teamName: "",
            teamMembers: "",
            screenshot: values[i][12] || ""
          };
          break;
        }
      }
    }
  }

  if (!participant) {
    return jsonResponse({ success: false, error: "Participant not found for ID: " + masterRegId });
  }

  const linkedEvents = [];
  for (const code in EVENT_REGISTRY) {
    const sName = EVENT_REGISTRY[code].sheetName;
    const eSheet = ss.getSheetByName(sName);
    if (eSheet && eSheet.getLastRow() > 1) {
      const values = eSheet.getDataRange().getValues();
      for (let i = 1; i < values.length; i++) {
        const rowMasterId = String(values[i][1]).trim().toUpperCase();
        if (rowMasterId === masterRegId) {
          linkedEvents.push({
            eventId: values[i][0],
            eventName: EVENT_REGISTRY[code].name,
            code: EVENT_REGISTRY[code].code,
            category: EVENT_REGISTRY[code].category
          });
        }
      }
    }
  }

  const emailRes = sendPaymentConfirmationEmail(participant, linkedEvents);
  if (emailRes.success) {
    return jsonResponse({
      success: true,
      emailSent: true,
      recipientEmail: participant.email,
      message: "Confirmation email sent successfully to " + participant.email
    });
  } else {
    return jsonResponse({
      success: false,
      emailSent: false,
      recipientEmail: participant.email,
      error: "Failed to send email: " + (emailRes.error || "Unknown error")
    });
  }
}

/**
 * HELPER: sendPaymentConfirmationEmail
 * Generates and sends a high-fidelity confirmation email with delegate pass credentials,
 * symposium logistics, reporting instructions, and coordinator WhatsApp contacts.
 */
function sendPaymentConfirmationEmail(participant, linkedEvents) {
  try {
    const to = String(participant.email || "").trim();
    if (!to || !to.includes("@")) {
      return { success: false, error: "Invalid email address: " + to };
    }

    const masterId = String(participant.regId || "GRAV-2026").trim();
    const name = String(participant.fullname || "Delegate").trim();
    const college = String(participant.college || "Engineering College").trim();
    const dept = String(participant.dept || "Engineering").trim();
    const year = String(participant.year || "Student").trim();
    const phone = String(participant.phone || "—").trim();
    const amount = participant.amount || 100;
    const utr = String(participant.utr || "Verified").trim();
    const teamName = String(participant.teamName || "").trim();
    const teamMembers = String(participant.teamMembers || "").trim();

    // Build event list
    let eventsHtml = "";
    let eventsPlain = "";

    if (linkedEvents && linkedEvents.length > 0) {
      eventsHtml = linkedEvents.map(function(e) {
        return '<div style="background: rgba(0, 240, 255, 0.05); border: 1px solid rgba(0, 240, 255, 0.25); border-radius: 8px; padding: 12px 16px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">' +
          '<div>' +
            '<strong style="color: #ffffff; font-size: 15px; display: block;">' + (e.eventName || e.name) + '</strong>' +
            '<span style="color: #94a3b8; font-size: 12px;">Category: ' + (e.category || "Symposium Event") + '</span>' +
          '</div>' +
          '<span style="background: #00f0ff; color: #060913; font-weight: 700; font-size: 13px; padding: 4px 10px; border-radius: 6px; font-family: monospace;">' + (e.eventId || masterId) + '</span>' +
        '</div>';
      }).join("");

      eventsPlain = linkedEvents.map(function(e) {
        return "- " + (e.eventName || e.name) + " (Pass ID: " + (e.eventId || masterId) + ")";
      }).join("\n");
    } else {
      const rawEvents = String(participant.events || "GRAVITON 2026 Events");
      eventsHtml = '<div style="background: rgba(0, 240, 255, 0.05); border: 1px solid rgba(0, 240, 255, 0.25); border-radius: 8px; padding: 12px 16px;">' +
        '<strong style="color: #ffffff; font-size: 15px;">' + rawEvents + '</strong>' +
      '</div>';
      eventsPlain = "- " + rawEvents;
    }

    let teamHtml = "";
    let teamPlain = "";
    if (teamName) {
      teamHtml = '<div style="background: rgba(255, 51, 75, 0.08); border: 1px solid rgba(255, 51, 75, 0.3); border-radius: 8px; padding: 12px 16px; margin-top: 14px;">' +
        '<div style="color: #ff334b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Team Participation</div>' +
        '<div style="color: #ffffff; font-size: 14px; margin-top: 4px;"><strong>Team Name:</strong> ' + teamName + '</div>' +
        (teamMembers ? '<div style="color: #cbd5e1; font-size: 13px; margin-top: 2px;"><strong>Members:</strong> ' + teamMembers + '</div>' : '') +
      '</div>';
      teamPlain = "\nTeam Name: " + teamName + "\nTeam Members: " + teamMembers + "\n";
    }

    const subject = "🎟️ Payment Verified & Confirmed | GRAVITON 2026 [" + masterId + "]";

    const passUrl = "https://graviton26.vercel.app/status.html?regId=" + encodeURIComponent(masterId);

    const htmlBody = '<!DOCTYPE html>' +
      '<html>' +
      '<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>GRAVITON 2026 Confirmation</title></head>' +
      '<body style="margin: 0; padding: 0; background-color: #060913; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">' +
        '<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #060913; padding: 24px 12px;">' +
          '<tr><td align="center">' +
            '<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; background: #0e1626; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">' +
              '<tr>' +
                '<td style="background: linear-gradient(135deg, #b3001b 0%, #ff334b 60%, #0e1626 100%); padding: 26px 20px; text-align: center;">' +
                  '<div style="color: rgba(255,255,255,0.9); font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 4px;">Jaya Sakthi Engineering College</div>' +
                  '<div style="color: #ffffff; font-size: 11px; opacity: 0.85;">AICTE Approved • Anna University Affiliated</div>' +
                  '<div style="height: 1px; background: rgba(255,255,255,0.25); margin: 12px auto; max-width: 280px;"></div>' +
                  '<h1 style="color: #ffffff; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: 2px;">GRAVITON 2026</h1>' +
                  '<div style="color: #00f0ff; font-size: 13px; font-weight: 600; margin-top: 4px;">Department of Computer Science & Engineering and Cyber Security</div>' +
                '</td>' +
              '</tr>' +
              '<tr>' +
                '<td style="padding: 24px 28px 12px 28px; text-align: center;">' +
                  '<div style="display: inline-block; background: #003318; border: 1px solid #00e676; color: #00e676; padding: 8px 18px; border-radius: 50px; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">' +
                    '✓ Payment & Pass Verified' +
                  '</div>' +
                  '<h2 style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 16px 0 6px 0;">Official Registration Confirmation</h2>' +
                  '<p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0;">' +
                    'Dear <strong style="color: #ffffff;">' + name + '</strong>, congratulations! Your payment for <strong>GRAVITON 2026</strong> has been verified by the organizing committee. Your official delegate credentials are confirmed below.' +
                  '</p>' +
                '</td>' +
              '</tr>' +
              '<tr>' +
                '<td style="padding: 12px 28px;">' +
                  '<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background: rgba(0, 240, 255, 0.04); border: 1px dashed rgba(0, 240, 255, 0.4); border-radius: 12px; padding: 18px; text-align: center;">' +
                    '<tr><td>' +
                      '<div style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Master Delegate Registration ID</div>' +
                      '<div style="color: #00f0ff; font-size: 24px; font-weight: 800; letter-spacing: 2px; font-family: monospace; margin: 6px 0;">' + masterId + '</div>' +
                      '<div style="color: #cbd5e1; font-size: 12px;">Present this ID or your digital pass at the registration desk.</div>' +
                    '</td></tr>' +
                  '</table>' +
                '</td>' +
              '</tr>' +
              '<tr>' +
                '<td style="padding: 12px 28px;">' +
                  '<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background: #121b2d; border: 1px solid #1e293b; border-radius: 12px; padding: 16px;">' +
                    '<tr><td style="padding: 6px 8px; color: #94a3b8; font-size: 13px; width: 40%;">Participant Name:</td><td style="padding: 6px 8px; color: #ffffff; font-size: 13px; font-weight: 600;">' + name + '</td></tr>' +
                    '<tr><td style="padding: 6px 8px; color: #94a3b8; font-size: 13px;">College / Institution:</td><td style="padding: 6px 8px; color: #ffffff; font-size: 13px; font-weight: 600;">' + college + '</td></tr>' +
                    '<tr><td style="padding: 6px 8px; color: #94a3b8; font-size: 13px;">Department & Year:</td><td style="padding: 6px 8px; color: #ffffff; font-size: 13px; font-weight: 600;">' + dept + ' • ' + year + '</td></tr>' +
                    '<tr><td style="padding: 6px 8px; color: #94a3b8; font-size: 13px;">Registered Phone:</td><td style="padding: 6px 8px; color: #ffffff; font-size: 13px; font-weight: 600;">' + phone + '</td></tr>' +
                    '<tr><td style="padding: 6px 8px; color: #94a3b8; font-size: 13px;">Registration Fee:</td><td style="padding: 6px 8px; color: #00e676; font-size: 13px; font-weight: 700;">₹' + amount + ' (PAID & VERIFIED)</td></tr>' +
                    '<tr><td style="padding: 6px 8px; color: #94a3b8; font-size: 13px;">Transaction / UTR:</td><td style="padding: 6px 8px; color: #00f0ff; font-size: 13px; font-family: monospace; font-weight: 600;">' + utr + '</td></tr>' +
                  '</table>' +
                  teamHtml +
                '</td>' +
              '</tr>' +
              '<tr>' +
                '<td style="padding: 16px 28px 8px 28px;">' +
                  '<h3 style="color: #ffffff; font-size: 15px; font-weight: 700; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">Registered Events</h3>' +
                  eventsHtml +
                '</td>' +
              '</tr>' +
              '<tr>' +
                '<td style="padding: 12px 28px;">' +
                  '<div style="background: rgba(255, 255, 255, 0.03); border: 1px solid #1e293b; border-radius: 12px; padding: 18px;">' +
                    '<h4 style="color: #ff334b; font-size: 14px; font-weight: 700; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.5px;">Event Day Guidelines & Logistics</h4>' +
                    '<ul style="margin: 0; padding-left: 20px; color: #cbd5e1; font-size: 13px; line-height: 1.7;">' +
                      '<li><strong>Reporting Time:</strong> 8:30 AM IST (Registration desk opens at 8:00 AM).</li>' +
                      '<li><strong>Venue:</strong> Jaya Sakthi Engineering College, St. Thomas College Road, Thiruninravur, Chennai - 602 024.</li>' +
                      '<li><strong>Mandatory:</strong> Bring your <strong>physical College ID Card</strong> (strict entry requirement).</li>' +
                      '<li><strong>Presentation Delegates:</strong> Bring PPT slides on a pen drive and keep a backup in your email.</li>' +
                      '<li><strong>Included:</strong> Participation certificate and lunch provided to all registered delegates.</li>' +
                    '</ul>' +
                  '</div>' +
                '</td>' +
              '</tr>' +
              '<tr>' +
                '<td style="padding: 16px 28px 24px 28px; text-align: center;">' +
                  '<a href="' + passUrl + '" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #00f0ff, #00a8ff); color: #060913; font-weight: 800; font-size: 14px; text-decoration: none; padding: 14px 32px; border-radius: 8px; letter-spacing: 0.5px;">' +
                    'View Digital Delegate Pass Online →' +
                  '</a>' +
                '</td>' +
              '</tr>' +
              '<tr>' +
                '<td style="padding: 0 28px 24px 28px;">' +
                  '<div style="border-top: 1px solid #2d1319; padding-top: 18px; text-align: center;">' +
                    '<div style="color: #94a3b8; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">Student Coordinator Contacts</div>' +
                    '<div style="font-size: 13px; color: #cbd5e1; line-height: 1.6; margin-bottom: 12px;">' +
                      '<strong>Harini:</strong> <a href="https://wa.me/919003252177" style="color: #ff334b; text-decoration: none;">+91 90032 52177 (WhatsApp)</a> &nbsp;|&nbsp; ' +
                      '<strong>Balagurubaran:</strong> <a href="https://wa.me/919043639975" style="color: #ff334b; text-decoration: none;">+91 90436 39975 (WhatsApp)</a>' +
                    '</div>' +
                    '<div style="margin-top: 10px;">' +
                      '<a href="https://chat.whatsapp.com/CJd1mj9sOKA0jJAY4IbmkO" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #25d366, #128c7e); color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 700; padding: 7px 18px; border-radius: 20px; letter-spacing: 0.5px; margin-right: 8px; margin-bottom: 6px;">' +
                        '💬 Join WhatsApp Community →' +
                      '</a>' +
                      '<a href="https://www.instagram.com/graviton_2026?utm_source=qr&stkn=MXJzZ3B6amVweDE3NA%3D%3D" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045); color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 700; padding: 7px 18px; border-radius: 20px; letter-spacing: 0.5px; margin-bottom: 6px;">' +
                        '📸 Follow @graviton_2026 on Instagram →' +
                      '</a>' +
                    '</div>' +
                  '</div>' +
                '</td>' +
              '</tr>' +
              '<tr>' +
                '<td style="background: #080d17; padding: 18px 24px; text-align: center; border-top: 1px solid #1e293b;">' +
                  '<p style="color: #64748b; font-size: 11px; margin: 0; line-height: 1.5;">' +
                    'GRAVITON 2026 • Department of CSE & Cyber Security • Jaya Sakthi Engineering College<br>' +
                    'This is an automated confirmation sent upon payment verification.' +
                  '</p>' +
                '</td>' +
              '</tr>' +
            '</table>' +
          '</td></tr>' +
        '</table>' +
      '</body></html>';

    const plainTextBody = (
      "GRAVITON 2026 - OFFICIAL REGISTRATION CONFIRMATION\n" +
      "Jaya Sakthi Engineering College (AICTE Approved | Anna Univ. Affiliated)\n" +
      "Department of Computer Science & Engineering and Cyber Security\n\n" +
      "Dear " + name + ",\n\n" +
      "Congratulations! Your payment for GRAVITON 2026 has been verified by the organizing committee. Your official delegate credentials are confirmed.\n\n" +
      "============================================================\n" +
      "DELEGATE CREDENTIALS:\n" +
      "============================================================\n" +
      "Master Registration ID : " + masterId + "\n" +
      "Participant Name       : " + name + "\n" +
      "College / Institution  : " + college + "\n" +
      "Department & Year      : " + dept + " (" + year + ")\n" +
      "Registered Phone       : " + phone + "\n" +
      "Amount Paid            : ₹" + amount + " (PAID & VERIFIED)\n" +
      "Payment UTR / Ref      : " + utr + "\n" +
      teamPlain +
      "\n============================================================\n" +
      "REGISTERED EVENTS:\n" +
      "============================================================\n" +
      eventsPlain + "\n\n" +
      "============================================================\n" +
      "EVENT LOGISTICS & IMPORTANT CHECKLIST:\n" +
      "============================================================\n" +
      "- Reporting Time : 8:30 AM IST (Registration desk opens at 8:00 AM)\n" +
      "- Venue          : Jaya Sakthi Engineering College, St. Thomas College Road, Thiruninravur, Chennai - 602 024\n" +
      "- College ID     : Mandatory physical College ID card required for campus entry.\n" +
      "- Presentation   : Carry your slides on a USB pen drive + keep an email backup.\n" +
      "- Lunch & Kit    : Provided to all registered participants.\n\n" +
      "View Digital Delegate Pass Online:\n" + passUrl + "\n\n" +
      "============================================================\n" +
      "COORDINATOR CONTACTS:\n" +
      "============================================================\n" +
      "- Harini (Student Coordinator)       : +91 90032 52177\n" +
      "- Balagurubaran (Student Coordinator): +91 90436 39975\n" +
      "- Staff Coordinator                  : Dr. S. K. Rajasekaran\n\n" +
      "OFFICIAL COMMUNITY & SOCIAL LINKS:\n" +
      "- Join WhatsApp Community            : https://chat.whatsapp.com/CJd1mj9sOKA0jJAY4IbmkO\n" +
      "- Follow @graviton_2026 on Instagram  : https://www.instagram.com/graviton_2026?utm_source=qr&stkn=MXJzZ3B6amVweDE3NA%3D%3D\n\n" +
      "We look forward to seeing you at GRAVITON 2026!\n" +
      "Code • Create • Compete • Conquer"
    );

    const provider = String(EMAIL_CONFIG.PROVIDER || "BREVO").toUpperCase();
    const apiKey = (EMAIL_CONFIG.API_KEY || "").trim();

    // 1. HTTP EMAIL API: BREVO (Zero Google Account Permissions Required)
    if (provider === "BREVO" && apiKey) {
      Logger.log("Sending email via Brevo HTTP API to: " + to);
      const brevoPayload = {
        sender: {
          name: EMAIL_CONFIG.SENDER_NAME || "GRAVITON 2026 Organizing Committee",
          email: EMAIL_CONFIG.SENDER_EMAIL || "nithnithish500@gmail.com"
        },
        to: [
          { email: to, name: name }
        ],
        subject: subject,
        htmlContent: htmlBody,
        textContent: plainTextBody
      };

      const brevoOptions = {
        method: "post",
        contentType: "application/json",
        headers: {
          "api-key": apiKey,
          "accept": "application/json"
        },
        payload: JSON.stringify(brevoPayload),
        muteHttpExceptions: true
      };

      const brevoRes = UrlFetchApp.fetch("https://api.brevo.com/v3/smtp/email", brevoOptions);
      const brevoCode = brevoRes.getResponseCode();
      const brevoText = brevoRes.getContentText();

      if (brevoCode >= 200 && brevoCode < 300) {
        Logger.log("✅ Confirmation email sent via Brevo HTTP API to: " + to);
        return { success: true, recipient: to, provider: "BREVO" };
      } else {
        Logger.log("Brevo API error (" + brevoCode + "): " + brevoText);
        return { success: false, recipient: to, error: "Brevo HTTP API error (" + brevoCode + "): " + brevoText };
      }
    }

    // 2. HTTP EMAIL API: RESEND (Zero Google Account Permissions Required)
    if (provider === "RESEND" && apiKey) {
      Logger.log("Sending email via Resend HTTP API to: " + to);
      const fromField = EMAIL_CONFIG.SENDER_EMAIL && !EMAIL_CONFIG.SENDER_EMAIL.endsWith("@resend.dev")
        ? ((EMAIL_CONFIG.SENDER_NAME || "GRAVITON 2026") + " <" + EMAIL_CONFIG.SENDER_EMAIL + ">")
        : ("GRAVITON 2026 <onboarding@resend.dev>");

      const resendPayload = {
        from: fromField,
        to: [to],
        subject: subject,
        html: htmlBody,
        text: plainTextBody
      };

      const resendOptions = {
        method: "post",
        contentType: "application/json",
        headers: {
          "Authorization": "Bearer " + apiKey
        },
        payload: JSON.stringify(resendPayload),
        muteHttpExceptions: true
      };

      const resendRes = UrlFetchApp.fetch("https://api.resend.com/emails", resendOptions);
      const resendCode = resendRes.getResponseCode();
      const resendText = resendRes.getContentText();

      if (resendCode >= 200 && resendCode < 300) {
        Logger.log("✅ Confirmation email sent via Resend HTTP API to: " + to);
        return { success: true, recipient: to, provider: "RESEND" };
      } else {
        Logger.log("Resend API error (" + resendCode + "): " + resendText);
        return { success: false, recipient: to, error: "Resend HTTP API error (" + resendCode + "): " + resendText };
      }
    }

    // 3. FALLBACK: Native Google MailApp
    MailApp.sendEmail({
      to: to,
      subject: subject,
      htmlBody: htmlBody,
      body: plainTextBody,
      name: EMAIL_CONFIG.SENDER_NAME || "GRAVITON 2026 Organizing Committee"
    });

    Logger.log("Confirmation email successfully sent via MailApp to: " + to + " for ID: " + masterId);
    return { success: true, recipient: to, provider: "MAILAPP" };
  } catch (err) {
    Logger.log("Error sending confirmation email: " + err.toString());
    return { success: false, error: err.toString() };
  }
}

/**
 * ACTION: rejectPayment
 * Marks participant payment status as REJECTED across MASTER_REGISTRATIONS and event sheets.
 */
function handleRejectPayment(data) {
  if (!isValidAdminPin(data.adminPin)) {
    return jsonResponse({ success: false, error: "Unauthorized. Invalid Security PIN." });
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const searchId = (data.regId || "").trim().toUpperCase();
  const reason = (data.reason || "Invalid / mismatched UTR").trim();
  const now = new Date().toISOString();

  if (!searchId) {
    return jsonResponse({ success: false, error: "Registration ID is required." });
  }

  let masterRegId = searchId;

  // Resolve Master ID if Event ID was provided
  if (!searchId.startsWith("GRAV-")) {
    for (const code in EVENT_REGISTRY) {
      const sName = EVENT_REGISTRY[code].sheetName;
      const eSheet = ss.getSheetByName(sName);
      if (eSheet && eSheet.getLastRow() > 1) {
        const values = eSheet.getDataRange().getValues();
        for (let i = 1; i < values.length; i++) {
          if (String(values[i][0]).trim().toUpperCase() === searchId) {
            masterRegId = String(values[i][1]).trim().toUpperCase();
            break;
          }
        }
      }
      if (masterRegId !== searchId) break;
    }
  }

  // 1. Update in MASTER_REGISTRATIONS
  let updatedMaster = false;
  const masterSheet = ss.getSheetByName(MASTER_SHEET_NAME);
  if (masterSheet && masterSheet.getLastRow() > 1) {
    const values = masterSheet.getDataRange().getValues();
    for (let i = 1; i < values.length; i++) {
      if (String(values[i][0]).trim().toUpperCase() === masterRegId) {
        const rowIndex = i + 1;
        masterSheet.getRange(rowIndex, 12).setValue("REJECTED");
        masterSheet.getRange(rowIndex, 13).setValue("REJECTED");
        masterSheet.getRange(rowIndex, 14).setValue(now);
        masterSheet.getRange(rowIndex, 15).setValue("Reason: " + reason);
        updatedMaster = true;
        break;
      }
    }
  }

  if (!updatedMaster) {
    const legacySheet = ss.getSheetByName(LEGACY_SHEET_NAME);
    if (legacySheet && legacySheet.getLastRow() > 1) {
      const values = legacySheet.getDataRange().getValues();
      for (let i = 1; i < values.length; i++) {
        if (String(values[i][0]).trim().toUpperCase() === masterRegId) {
          const rowIndex = i + 1;
          legacySheet.getRange(rowIndex, 11).setValue("REJECTED");
          legacySheet.getRange(rowIndex, 14).setValue(now);
          legacySheet.getRange(rowIndex, 15).setValue("Reason: " + reason);
          updatedMaster = true;
          break;
        }
      }
    }
  }

  // 2. Update in event sheets
  let updatedEventCount = 0;
  for (const code in EVENT_REGISTRY) {
    const sName = EVENT_REGISTRY[code].sheetName;
    const eSheet = ss.getSheetByName(sName);
    if (eSheet && eSheet.getLastRow() > 1) {
      const values = eSheet.getDataRange().getValues();
      for (let i = 1; i < values.length; i++) {
        const rowEventId = String(values[i][0]).trim().toUpperCase();
        const rowMasterId = String(values[i][1]).trim().toUpperCase();

        if (rowMasterId === masterRegId || rowEventId === searchId) {
          const rowIndex = i + 1;
          eSheet.getRange(rowIndex, 13).setValue("REJECTED");
          eSheet.getRange(rowIndex, 14).setValue("REJECTED");
          eSheet.getRange(rowIndex, 15).setValue("Reason: " + reason);
          eSheet.getRange(rowIndex, 16).setValue(now);
          updatedEventCount++;
        }
      }
    }
  }

  return jsonResponse({
    success: true,
    masterRegistrationId: masterRegId,
    regId: masterRegId,
    paymentStatus: "REJECTED",
    updatedEventCount: updatedEventCount,
    message: "Registration marked as REJECTED."
  });
}

/**
 * ACTION: migrateLegacyData
 * Safely migrates records from the single legacy "Registrations" sheet into
 * MASTER_REGISTRATIONS and the individual event sheets WITHOUT deleting the original data.
 */
function handleMigrateLegacyData(data) {
  if (!isValidAdminPin(data.adminPin)) {
    return jsonResponse({ success: false, error: "Unauthorized. Invalid Security PIN." });
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const legacySheet = ss.getSheetByName(LEGACY_SHEET_NAME);

  if (!legacySheet || legacySheet.getLastRow() <= 1) {
    return jsonResponse({
      success: true,
      message: "No legacy data to migrate. Legacy 'Registrations' sheet is empty or not found."
    });
  }

  const scriptProps = PropertiesService.getScriptProperties();
  const masterSheet = getOrCreateMasterSheet(ss);
  const values = legacySheet.getDataRange().getValues();

  // Find existing IDs in MASTER_REGISTRATIONS to avoid duplicates
  const existingMasterIds = new Set();
  if (masterSheet.getLastRow() > 1) {
    const mIds = masterSheet.getRange(2, 1, masterSheet.getLastRow() - 1, 1).getValues();
    for (let i = 0; i < mIds.length; i++) {
      existingMasterIds.add(String(mIds[i][0]).trim().toUpperCase());
    }
  }

  let migratedCount = 0;

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const legacyId = String(row[0]).trim();
    if (!legacyId || existingMasterIds.has(legacyId.toUpperCase())) continue;

    const timestamp = row[1] || new Date().toISOString();
    const fullname = row[2] || "";
    const email = row[3] || "";
    const phone = row[4] || "";
    const college = row[5] || "";
    const dept = row[6] || "";
    const year = row[7] || "";
    const rawEvents = String(row[8] || "");
    const amount = row[9] || 100;
    const paymentStatus = row[10] || "PENDING";
    const utr = row[11] || "";
    const screenshot = row[12] || "";
    const verificationTime = row[13] || "";
    const verifiedBy = row[14] || "";

    // Parse events and create event rows
    const eventNames = rawEvents.split(",").map(s => s.trim()).filter(Boolean);
    const eventSummaryDisplayList = [];

    for (let j = 0; j < eventNames.length; j++) {
      const entry = resolveEventEntry(eventNames[j]);
      if (entry) {
        const eventRegId = getNextEventId(ss, entry, scriptProps);
        const eventSheet = getOrCreateEventSheet(ss, entry.sheetName);

        const eventRow = [
          eventRegId,
          legacyId,
          timestamp,
          fullname,
          email,
          phone,
          college,
          dept,
          year,
          1,
          "",
          utr,
          paymentStatus,
          paymentStatus,
          verifiedBy,
          verificationTime
        ];

        eventSheet.appendRow(eventRow);
        eventSummaryDisplayList.push(entry.name + " (" + eventRegId + ")");
      }
    }

    const selectedEventsStr = eventSummaryDisplayList.length > 0 
      ? eventSummaryDisplayList.join(", ") 
      : rawEvents;

    // Append to MASTER_REGISTRATIONS
    const masterRow = [
      legacyId,
      timestamp,
      fullname,
      email,
      phone,
      college,
      dept,
      year,
      selectedEventsStr,
      amount,
      utr,
      paymentStatus,
      paymentStatus,
      verificationTime,
      verifiedBy,
      "",
      "",
      screenshot
    ];

    masterSheet.appendRow(masterRow);
    migratedCount++;
  }

  return jsonResponse({
    success: true,
    migratedCount: migratedCount,
    message: "Successfully migrated " + migratedCount + " registrations into MASTER_REGISTRATIONS and Event sheets. Original 'Registrations' sheet was preserved untouched."
  });
}

/**
 * Helper to construct JSON response with CORS headers
 */
function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
