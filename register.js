/**
 * GRAVITON 2026 - Registration Portal Logic
 * Jaya Sakthi Engineering College (CSE & Cyber Security Dept.)
 */

document.addEventListener('DOMContentLoaded', () => {
    initRegisterPage();
});

function initRegisterPage() {
    const form = document.getElementById('registration-form');
    const submitBtn = document.getElementById('submit-btn');
    const formError = document.getElementById('form-error');
    const demoBanner = document.getElementById('demo-banner');
    const displayFee = document.getElementById('display-fee');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinks = document.getElementById('nav-links');

    // Mobile nav toggle (fallback if script.js not loaded)
    if (mobileToggle && navLinks && !mobileToggle.dataset.navBound) {
        mobileToggle.dataset.navBound = 'true';
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('mobile-active');
        });
    }

    // Base fee per head from config
    const feePerHead = (typeof CONFIG !== 'undefined' && CONFIG.REGISTRATION_FEE) ? CONFIG.REGISTRATION_FEE : 100;

    // Check if API_URL is set
    const hasAPI = Boolean(typeof CONFIG !== 'undefined' && CONFIG.API_URL && CONFIG.API_URL.trim().length > 10);
    if (!hasAPI && demoBanner) {
        demoBanner.style.display = 'block';
    }

    // Event Team Capabilities Configuration
    const EVENT_TEAM_CONFIG = {
        "PPT Presentation": {
            allowsTeam: true,
            allowsSolo: true,
            minMembers: 2,
            maxMembers: 3,
            ruleNote: 'Team Size: 1 to 3 Members (Solo or Team)',
            defaultType: 'Team'
        },
        "Tech Quiz": {
            allowsTeam: true,
            allowsSolo: true,
            minMembers: 2,
            maxMembers: 2,
            ruleNote: 'Team Size: 1 to 2 Members (Solo or Duo)',
            defaultType: 'Solo'
        },
        "AI Prompt Battle": {
            allowsTeam: true,
            allowsSolo: false,
            minMembers: 2,
            maxMembers: 2,
            ruleNote: 'Team Size: 2 Members (Duo Only)',
            defaultType: 'Team'
        },
        "Reverse Coding": {
            allowsTeam: true,
            allowsSolo: false,
            minMembers: 2,
            maxMembers: 2,
            ruleNote: 'Team Size: 2 Members (Duo Only)',
            defaultType: 'Team'
        },
        "CTF (Capture The Flag)": {
            allowsTeam: true,
            allowsSolo: true,
            minMembers: 2,
            maxMembers: 2,
            ruleNote: 'Team Size: 1 to 2 Members (Solo or Duo)',
            defaultType: 'Team'
        },
        "Website Creation Without Using AI": {
            allowsTeam: true,
            allowsSolo: false,
            minMembers: 2,
            maxMembers: 2,
            ruleNote: 'Team Size: 2 Members (Duo Only)',
            defaultType: 'Team'
        },
        "Data Grid": {
            allowsTeam: true,
            allowsSolo: true,
            minMembers: 2,
            maxMembers: 2,
            ruleNote: 'Team Size: 1 to 2 Members (Solo or Duo)',
            defaultType: 'Team'
        },
        "E Sports": {
            allowsTeam: true,
            allowsSolo: false, // Squad event strictly
            minMembers: 4,
            maxMembers: 4,
            ruleNote: 'Squad Event: 4 Members Required',
            defaultType: 'Team'
        }
    };

    // DOM Elements for Participation & Team
    const participationSection = document.getElementById('participation-section');
    const soloOnlyCard = document.getElementById('solo-only-card');
    const teamChoiceContainer = document.getElementById('team-choice-container');
    const teamDetailsCard = document.getElementById('team-details-card');
    const teamNameInput = document.getElementById('team_name');
    const leaderNameDisplay = document.getElementById('leader-name-display');
    const teamRuleNote = document.getElementById('team-rule-note');
    const teamSizeBadge = document.getElementById('team-size-badge');
    const teamSizeNote = document.getElementById('team-size-note');
    const teamMembersContainer = document.getElementById('team-members-container');
    const addMemberBtn = document.getElementById('add-member-btn');
    const memberLimitMsg = document.getElementById('member-limit-msg');
    const choiceSoloCard = document.getElementById('choice-solo-card');
    const fullnameInput = document.getElementById('fullname');

    let currentEventConfig = null;

    // Live update leader name
    if (fullnameInput && leaderNameDisplay) {
        fullnameInput.addEventListener('input', () => {
            const val = fullnameInput.value.trim();
            leaderNameDisplay.textContent = val ? `${val} (You)` : 'Primary Delegate';
        });
    }
    // Event Code Mapping
    const EVENT_CODE_MAP = {
        "PPT Presentation": "PPT",
        "Tech Quiz": "QUIZ",
        "AI Prompt Battle": "AIP",
        "Reverse Coding": "REV",
        "CTF (Capture The Flag)": "CTF",
        "Website Creation Without Using AI": "WEB",
        "Data Grid": "DATA",
        "E Sports": "ESPORTS"
    };

    function getCheckedEvents() {
        return Array.from(document.querySelectorAll('input[name="selected_events"]:checked')).map(cb => cb.value);
    }

    // Payment Screenshot Handling with Compression & Live Preview
    const screenshotInput = document.getElementById('reg-screenshot');
    const screenshotDropzone = document.getElementById('screenshot-dropzone');
    const previewCard = document.getElementById('screenshot-preview-card');
    const previewImg = document.getElementById('screenshot-preview-img');
    const fileNameEl = document.getElementById('screenshot-file-name');
    const fileSizeEl = document.getElementById('screenshot-file-size');
    const removeBtn = document.getElementById('screenshot-remove-btn');
    const utrInput = document.getElementById('reg-utr');
    let selectedScreenshotFile = null;
    let screenshotBlob = null;
    let screenshotBase64 = '';

    function handleScreenshotFile(file) {
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showError('Please upload a valid image file (JPG, PNG, WebP).');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            showError('Payment screenshot size must be less than 10MB.');
            return;
        }

        selectedScreenshotFile = file;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                // Compress image adaptively for live preview and upload
                const canvas = document.createElement('canvas');
                const maxDim = 1200;
                let w = img.width;
                let h = img.height;
                if (w > maxDim || h > maxDim) {
                    if (w > h) {
                        h = Math.round((h * maxDim) / w);
                        w = maxDim;
                    } else {
                        w = Math.round((w * maxDim) / h);
                        h = maxDim;
                    }
                }
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                screenshotBase64 = canvas.toDataURL('image/jpeg', 0.85);

                canvas.toBlob((blob) => {
                    screenshotBlob = blob;
                }, 'image/jpeg', 0.85);

                // Update Preview UI
                if (previewImg) previewImg.src = screenshotBase64;
                if (fileNameEl) fileNameEl.textContent = file.name;
                if (fileSizeEl) fileSizeEl.textContent = `${Math.round(file.size / 1024)} KB`;
                if (previewCard) previewCard.style.display = 'flex';
                if (screenshotDropzone) screenshotDropzone.style.display = 'none';
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    if (screenshotInput) {
        screenshotInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                handleScreenshotFile(e.target.files[0]);
            }
        });
    }

    if (screenshotDropzone) {
        ['dragenter', 'dragover'].forEach(eventName => {
            screenshotDropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                screenshotDropzone.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            screenshotDropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                screenshotDropzone.classList.remove('dragover');
            });
        });

        screenshotDropzone.addEventListener('drop', (e) => {
            if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleScreenshotFile(e.dataTransfer.files[0]);
            }
        });
    }

    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            screenshotBase64 = '';
            screenshotBlob = null;
            selectedScreenshotFile = null;
            if (screenshotInput) screenshotInput.value = '';
            if (previewCard) previewCard.style.display = 'none';
            if (screenshotDropzone) screenshotDropzone.style.display = 'block';
        });
    }

    // Dynamic Fee Calculation (₹100 per head)
    function getParticipantHeadCount() {
        const checkedEvents = getCheckedEvents();
        if (checkedEvents.length === 0) return 1;

        const selectedEvent = checkedEvents[0];
        const cfg = EVENT_TEAM_CONFIG[selectedEvent];
        const allowsTeam = Boolean(cfg && cfg.allowsTeam);
        const participationTypeRadio = document.querySelector('input[name="participation_type"]:checked');
        const isTeam = Boolean(allowsTeam && participationTypeRadio && participationTypeRadio.value === 'Team');

        if (!isTeam) return 1;

        const teammateRows = teamMembersContainer ? teamMembersContainer.querySelectorAll('.member-row').length : 0;
        return Math.max(1, 1 + teammateRows);
    }

    function updateFeeDisplay() {
        const headCount = getParticipantHeadCount();
        const totalAmount = headCount * feePerHead;
        const displayFeeEl = document.getElementById('display-fee');
        const feeBreakdownEl = document.getElementById('fee-breakdown');
        const submitBtnEl = document.getElementById('submit-btn');

        if (displayFeeEl) {
            displayFeeEl.textContent = `₹${totalAmount}`;
        }

        if (feeBreakdownEl) {
            if (headCount > 1) {
                feeBreakdownEl.innerHTML = `<i class="fa-solid fa-users text-cyan"></i> Team: ₹${feePerHead} per head × <strong>${headCount} Members</strong> = <strong>₹${totalAmount}</strong>`;
            } else {
                feeBreakdownEl.innerHTML = `<i class="fa-solid fa-user text-cyan"></i> Solo: ₹${feePerHead} per head × <strong>1 Delegate</strong> = <strong>₹${totalAmount}</strong>`;
            }
        }

        if (submitBtnEl && !submitBtnEl.disabled) {
            submitBtnEl.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Submit Registration & Payment Proof • ₹${totalAmount}`;
        }

        return totalAmount;
    }

    // Radio cards highlight handler for single-event selection
    function syncCheckboxCards() {
        const eventInputs = document.querySelectorAll('input[name="selected_events"]');
        eventInputs.forEach(cb => {
            const card = cb.closest('.custom-checkbox') || cb.closest('.custom-radio');
            if (card) {
                if (cb.checked) {
                    card.classList.add('is-selected');
                } else {
                    card.classList.remove('is-selected');
                }
            }
        });
    }

    function renderMemberSlot(slotNum, isRequired = false) {
        const row = document.createElement('div');
        row.className = 'member-row';
        row.id = `member-row-${slotNum}`;
        row.innerHTML = `
            <div class="input-with-icon">
                <i class="fa-solid fa-user-tag"></i>
                <input type="text" class="team-member-input" id="member-input-${slotNum}" placeholder="Teammate ${slotNum} Full Name ${isRequired ? '*' : '(Optional)'}" ${isRequired ? 'required' : ''}>
            </div>
            ${!isRequired ? `
                <button type="button" class="member-remove-btn" title="Remove Teammate">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            ` : ''}
        `;
        teamMembersContainer.appendChild(row);

        const removeBtn = row.querySelector('.member-remove-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                row.remove();
                updateMemberAddState();
                updateFeeDisplay();
            });
        }
    }

    function updateMemberAddState() {
        if (!currentEventConfig) return;
        const currentCount = teamMembersContainer.querySelectorAll('.member-row').length;
        const maxTeammates = (currentEventConfig.maxMembers || 2) - 1; // excluding leader

        if (currentCount >= maxTeammates) {
            if (addMemberBtn) addMemberBtn.style.display = 'none';
            if (memberLimitMsg) memberLimitMsg.textContent = `Team capacity reached (${currentEventConfig.maxMembers} members total).`;
        } else {
            if (addMemberBtn) addMemberBtn.style.display = 'inline-flex';
            if (memberLimitMsg) memberLimitMsg.textContent = `Can add ${maxTeammates - currentCount} more teammate(s).`;
        }
    }

    if (addMemberBtn) {
        addMemberBtn.addEventListener('click', () => {
            if (!currentEventConfig) return;
            const currentCount = teamMembersContainer.querySelectorAll('.member-row').length;
            const maxTeammates = (currentEventConfig.maxMembers || 2) - 1;
            if (currentCount < maxTeammates) {
                renderMemberSlot(currentCount + 2, false);
                updateMemberAddState();
                updateFeeDisplay();
            }
        });
    }

    function showTeamDetails(config) {
        if (!config || !teamDetailsCard) return;
        teamDetailsCard.style.display = 'block';

        if (teamMembersContainer) {
            teamMembersContainer.innerHTML = '';
            const requiredTeammates = Math.max(1, (config.minMembers || 2) - 1);
            for (let i = 1; i <= requiredTeammates; i++) {
                renderMemberSlot(i + 1, true);
            }
            updateMemberAddState();
            updateFeeDisplay();
        }
    }

    // Toggle Participation Format Card based on selected event (strictly 1 event at a time)
    function handleEventsSelectionChange() {
        syncCheckboxCards();
        const selected = getCheckedEvents();

        if (selected.length === 0) {
            if (participationSection) participationSection.style.display = 'none';
            currentEventConfig = null;
            updateFeeDisplay();
            return;
        }

        if (participationSection) participationSection.style.display = 'block';

        const selectedEvent = selected[0];
        const cfg = EVENT_TEAM_CONFIG[selectedEvent] || {
            allowsTeam: false,
            allowsSolo: true,
            ruleNote: 'Individual Event (Solo Only)'
        };

        const allowsTeam = Boolean(cfg.allowsTeam);
        const allowsSolo = Boolean(cfg.allowsSolo !== false);
        const minMembers = cfg.minMembers || (allowsTeam ? 2 : 1);
        const maxMembers = cfg.maxMembers || (allowsTeam ? 2 : 1);

        currentEventConfig = {
            eventName: selectedEvent,
            allowsTeam: allowsTeam,
            allowsSolo: allowsSolo,
            minMembers: minMembers,
            maxMembers: maxMembers,
            ruleNote: cfg.ruleNote || (allowsTeam ? 'Team Participation' : 'Individual Event (Solo Only)')
        };

        const soloRadio = document.querySelector('input[name="participation_type"][value="Solo"]');
        const teamRadio = document.querySelector('input[name="participation_type"][value="Team"]');

        if (!allowsTeam) {
            // Strictly Solo only (e.g. AI Prompt Battle, Website Creation)
            if (soloOnlyCard) {
                soloOnlyCard.style.display = 'flex';
                const noteSpan = soloOnlyCard.querySelector('.solo-badge-text span');
                if (noteSpan) noteSpan.textContent = currentEventConfig.ruleNote;
            }
            if (teamChoiceContainer) teamChoiceContainer.style.display = 'none';
            if (teamDetailsCard) teamDetailsCard.style.display = 'none';
            if (soloRadio) soloRadio.checked = true;
        } else if (allowsTeam && !allowsSolo) {
            // Strictly Team only (e.g. Reverse Coding Duo of 2, Web Creation Duo of 2, E-Sports Squad of 4)
            if (soloOnlyCard) soloOnlyCard.style.display = 'none';
            if (teamChoiceContainer) teamChoiceContainer.style.display = 'block';
            if (choiceSoloCard) choiceSoloCard.style.display = 'none';
            if (teamRadio) teamRadio.checked = true;

            if (teamRuleNote) teamRuleNote.textContent = currentEventConfig.ruleNote;
            if (teamSizeBadge) teamSizeBadge.innerHTML = `<i class="fa-solid fa-users"></i> Team (${minMembers === maxMembers ? minMembers : minMembers + '-' + maxMembers} Members)`;
            if (teamSizeNote) teamSizeNote.textContent = `Register with team (${minMembers === maxMembers ? minMembers + ' members required' : minMembers + '-' + maxMembers + ' members'})`;

            showTeamDetails(currentEventConfig);
        } else {
            // Flexible: allows both Solo and Team (e.g. PPT Presentation 1-3, Tech Quiz 1-2, CTF 1-2)
            if (soloOnlyCard) soloOnlyCard.style.display = 'none';
            if (teamChoiceContainer) teamChoiceContainer.style.display = 'block';
            if (choiceSoloCard) choiceSoloCard.style.display = 'flex';

            if (teamRuleNote) teamRuleNote.textContent = currentEventConfig.ruleNote;
            if (teamSizeBadge) teamSizeBadge.innerHTML = `<i class="fa-solid fa-users"></i> Team (Max ${maxMembers})`;
            if (teamSizeNote) teamSizeNote.textContent = `Register with team (${minMembers}-${maxMembers} members)`;

            if (teamRadio && teamRadio.checked) {
                showTeamDetails(currentEventConfig);
            } else if (soloRadio && soloRadio.checked) {
                if (teamDetailsCard) teamDetailsCard.style.display = 'none';
            } else {
                if (cfg.defaultType === 'Team') {
                    if (teamRadio) teamRadio.checked = true;
                    showTeamDetails(currentEventConfig);
                } else {
                    if (soloRadio) soloRadio.checked = true;
                    if (teamDetailsCard) teamDetailsCard.style.display = 'none';
                }
            }
        }
        syncParticipationCards();
        updateFeeDisplay();
    }

    // Participation radio buttons handler
    const participationRadios = document.querySelectorAll('input[name="participation_type"]');
    function syncParticipationCards() {
        participationRadios.forEach(radio => {
            const card = radio.closest('.custom-radio');
            if (card) {
                if (radio.checked) {
                    card.classList.add('is-selected');
                } else {
                    card.classList.remove('is-selected');
                }
            }
        });
    }

    participationRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            syncParticipationCards();
            if (radio.value === 'Team') {
                showTeamDetails(currentEventConfig);
            } else {
                if (teamDetailsCard) teamDetailsCard.style.display = 'none';
            }
            updateFeeDisplay();
        });
    });

    const eventRadios = document.querySelectorAll('input[name="selected_events"]');
    eventRadios.forEach(cb => {
        cb.addEventListener('change', handleEventsSelectionChange);
    });

    // Pre-select event from URL query param if present
    const urlParams = new URLSearchParams(window.location.search);
    const preselectedEvent = urlParams.get('event');
    if (preselectedEvent) {
        const radio = document.querySelector(`input[name="selected_events"][value="${preselectedEvent}"]`);
        if (radio) {
            radio.checked = true;
            handleEventsSelectionChange();
        }
    }

    // Initial fee calculation
    updateFeeDisplay();

    // Form submit
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            formError.style.display = 'none';

            // Gather values
            const fullname = document.getElementById('fullname').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const college = document.getElementById('college').value.trim();
            const dept = document.getElementById('dept').value;
            const year = document.getElementById('year').value;

            // Selected events (strictly 1 event at a time)
            const checkedEvents = getCheckedEvents();

            // Validation
            if (!fullname) {
                showError('Please enter your full name.');
                return;
            }
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showError('Please enter a valid email address.');
                return;
            }
            if (!phone || !/^\d{10}$/.test(phone)) {
                showError('Please enter a valid 10-digit mobile number.');
                return;
            }
            if (!college) {
                showError('Please enter your college or institution name.');
                return;
            }
            if (!dept) {
                showError('Please select your department.');
                return;
            }
            if (!year) {
                showError('Please select your year of study.');
                return;
            }
            if (checkedEvents.length === 0) {
                showError('Please select an event to participate in.');
                return;
            }
            if (checkedEvents.length > 1) {
                showError('Please select only one event at a time.');
                return;
            }

            const selectedEvent = checkedEvents[0];
            const cfg = EVENT_TEAM_CONFIG[selectedEvent];
            const allowsTeam = Boolean(cfg && cfg.allowsTeam);
            const participationTypeRadio = document.querySelector('input[name="participation_type"]:checked');
            const isTeam = Boolean(allowsTeam && participationTypeRadio && participationTypeRadio.value === 'Team');

            let teamName = '';
            let teamMembers = [];

            if (isTeam) {
                teamName = (document.getElementById('team_name') ? document.getElementById('team_name').value.trim() : '');
                if (!teamName) {
                    showError('Please enter your Team Name.');
                    document.getElementById('team_name')?.focus();
                    return;
                }

                // Collect & validate member inputs
                const memberInputs = Array.from(document.querySelectorAll('.team-member-input'));
                for (let i = 0; i < memberInputs.length; i++) {
                    const inp = memberInputs[i];
                    const nameVal = inp.value.trim();
                    if (inp.hasAttribute('required') && !nameVal) {
                        showError(`Please enter the full name for Teammate ${i + 2}.`);
                        inp.focus();
                        return;
                    }
                    if (nameVal) {
                        teamMembers.push(nameVal);
                    }
                }

                if (teamMembers.length === 0) {
                    showError('Please enter at least one teammate full name.');
                    return;
                }
            }

            // Validate Transaction ID & Payment Screenshot
            const utrVal = utrInput ? utrInput.value.trim() : '';
            if (!utrVal || utrVal.length < 4) {
                showError('Please enter your payment Transaction ID / UTR / Reference Number.');
                if (utrInput) {
                    utrInput.focus();
                    utrInput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
                return;
            }

            if (!screenshotBase64) {
                showError('Please upload your payment screenshot/receipt.');
                if (screenshotDropzone) {
                    screenshotDropzone.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
                return;
            }

            // Calculate dynamic total amount (₹100 per head)
            const totalAmount = updateFeeDisplay();

            setLoading(true, 'Uploading payment proof to Vercel Blob CDN...');

            // Upload payment screenshot to Vercel Blob and retrieve permanent public CDN URL
            let finalScreenshotUrl = screenshotBase64;
            try {
                const cleanEvent = (checkedEvents[0] || 'event').replace(/[^a-zA-Z0-9]/g, '_');
                const cleanName = `${fullname}_${cleanEvent}_${Date.now()}.jpg`.replace(/[^a-zA-Z0-9._-]/g, '_');
                const uploadSource = screenshotBlob || selectedScreenshotFile || screenshotBase64;
                const blobUrl = await uploadToVercelBlob(uploadSource, cleanName);
                if (blobUrl) {
                    finalScreenshotUrl = blobUrl;
                }
            } catch (blobErr) {
                console.warn('Vercel Blob upload fallback to base64:', blobErr);
            }

            setLoading(true, 'Recording registration in symposium database...');

            // Submit Payload with Vercel Blob permanent link
            const payload = {
                action: 'register',
                fullname: fullname,
                email: email,
                phone: phone,
                college: college,
                dept: dept,
                year: year,
                events: checkedEvents,
                participationType: isTeam ? 'Team' : 'Solo',
                teamName: isTeam ? teamName : '',
                teamMembers: isTeam ? teamMembers : [],
                amount: totalAmount,
                utr: utrVal,
                screenshot: finalScreenshotUrl,
                paymentScreenshot: finalScreenshotUrl,
                paymentStatus: 'UNDER_VERIFICATION'
            };

            try {
                if (hasAPI) {
                    // Google Apps Script API Call
                    const response = await fetch(CONFIG.API_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                        body: JSON.stringify(payload)
                    });

                    const data = await response.json();

                    if (data && data.success) {
                        const masterId = data.masterRegistrationId || data.regId;

                        // Ensure Google Sheet records the Vercel Blob link even if currently running legacy Apps Script deployment
                        try {
                            await fetch(CONFIG.API_URL, {
                                method: 'POST',
                                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                                body: JSON.stringify({
                                    action: 'submitPayment',
                                    regId: masterId,
                                    utr: utrVal,
                                    screenshot: finalScreenshotUrl
                                })
                            });
                        } catch (syncErr) {
                            console.warn('[Sync] submitPayment auto-link warning:', syncErr);
                        }

                        const savedRecord = {
                            ...data,
                            masterRegistrationId: masterId,
                            regId: masterId,
                            eventRegistrations: data.eventRegistrations || [],
                            events: checkedEvents,
                            fullname: fullname,
                            participationType: isTeam ? 'Team' : 'Solo',
                            teamName: isTeam ? teamName : '',
                            teamMembers: isTeam ? teamMembers : [],
                            amount: totalAmount,
                            utr: utrVal,
                            screenshot: finalScreenshotUrl,
                            paymentStatus: 'UNDER_VERIFICATION'
                        };
                        sessionStorage.setItem('graviton_current_reg', JSON.stringify(savedRecord));

                        // Update local cache too
                        const existing = JSON.parse(localStorage.getItem('graviton_registrations') || '[]');
                        existing.push(savedRecord);
                        localStorage.setItem('graviton_registrations', JSON.stringify(existing));

                        window.location.href = `status.html?regId=${encodeURIComponent(masterId)}&submitted=true`;
                    } else {
                        showError(data.error || 'Registration failed. Please try again.');
                        setLoading(false);
                    }
                } else {
                    // Offline / Local Demo Fallback Mode
                    const mockMasterId = `GRAV-${String(Math.floor(10 + Math.random() * 9980)).padStart(4, '0')}`;
                    const mockEventRegs = checkedEvents.map((ev, idx) => {
                        const code = EVENT_CODE_MAP[ev] || 'EVT';
                        return {
                            event: ev,
                            code: code,
                            eventId: `${code}-${String(idx + 1).padStart(3, '0')}`,
                            status: 'UNDER_VERIFICATION'
                        };
                    });

                    const localRecord = {
                        regId: mockMasterId,
                        masterRegistrationId: mockMasterId,
                        timestamp: new Date().toISOString(),
                        fullname: fullname,
                        email: email,
                        phone: phone,
                        college: college,
                        dept: dept,
                        year: year,
                        events: checkedEvents,
                        eventRegistrations: mockEventRegs,
                        participationType: isTeam ? 'Team' : 'Solo',
                        teamName: isTeam ? teamName : '',
                        teamMembers: isTeam ? teamMembers : [],
                        amount: totalAmount,
                        paymentStatus: 'UNDER_VERIFICATION',
                        utr: utrVal,
                        screenshot: finalScreenshotUrl
                    };

                    const existing = JSON.parse(localStorage.getItem('graviton_registrations') || '[]');
                    existing.push(localRecord);
                    localStorage.setItem('graviton_registrations', JSON.stringify(existing));
                    sessionStorage.setItem('graviton_current_reg', JSON.stringify(localRecord));

                    setTimeout(() => {
                        window.location.href = `status.html?regId=${encodeURIComponent(mockMasterId)}&submitted=true`;
                    }, 500);
                }
            } catch (err) {
                console.error('Registration API Error:', err);
                const mockMasterId = `GRAV-${String(Math.floor(10 + Math.random() * 9980)).padStart(4, '0')}`;
                const mockEventRegs = checkedEvents.map((ev, idx) => {
                    const code = EVENT_CODE_MAP[ev] || 'EVT';
                    return {
                        event: ev,
                        code: code,
                        eventId: `${code}-${String(idx + 1).padStart(3, '0')}`,
                        status: 'UNDER_VERIFICATION'
                    };
                });
                const localRecord = {
                    regId: mockMasterId,
                    masterRegistrationId: mockMasterId,
                    timestamp: new Date().toISOString(),
                    fullname: fullname,
                    email: email,
                    phone: phone,
                    college: college,
                    dept: dept,
                    year: year,
                    events: checkedEvents,
                    eventRegistrations: mockEventRegs,
                    participationType: isTeam ? 'Team' : 'Solo',
                    teamName: isTeam ? teamName : '',
                    teamMembers: isTeam ? teamMembers : [],
                    amount: totalAmount,
                    paymentStatus: 'UNDER_VERIFICATION',
                    utr: utrVal,
                    screenshot: screenshotBase64
                };

                const existing = JSON.parse(localStorage.getItem('graviton_registrations') || '[]');
                existing.push(localRecord);
                localStorage.setItem('graviton_registrations', JSON.stringify(existing));
                sessionStorage.setItem('graviton_current_reg', JSON.stringify(localRecord));

                window.location.href = `status.html?regId=${encodeURIComponent(mockMasterId)}&submitted=true`;
            }
        });
    }

    function showError(msg) {
        if (formError) {
            formError.textContent = msg;
            formError.style.display = 'block';
            formError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            alert(msg);
        }
    }

    function setLoading(isLoading, customText) {
        if (submitBtn) {
            submitBtn.disabled = isLoading;
            const currentTotal = updateFeeDisplay();
            const loadingMsg = customText || 'Submitting Registration & Proof...';
            submitBtn.innerHTML = isLoading
                ? `<i class="fa-solid fa-spinner fa-spin"></i> ${loadingMsg}`
                : `<i class="fa-solid fa-paper-plane"></i> Submit Registration & Payment Proof • ₹${currentTotal}`;
        }
    }
}
