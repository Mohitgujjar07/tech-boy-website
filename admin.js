/**
 * AarambhX Technology — Admin Command Suite Controller v3.0 (admin.js)
 * Manages Auth Gate, Reactive Module Rendering, Real-Time Filtering, CRM,
 * Invoices & Quotations, Testimonials, Catalog, Micro-Analytics, and Settings.
 */

'use strict';

(function () {
  const Store = window.AarambhXStore;
  if (!Store) {
    console.error('[Admin] AarambhXStore engine not found.');
    return;
  }

  // --- APPLICATION STATE ---
  let currentTab = 'overview';
  let inquiryFilter = 'all';
  let inquirySearchQuery = '';
  let invoiceFilter = 'all';
  let activeQuickReplyLead = null;
  let activePrintInvoice = null;
  let activePrintCert = null;

  // --- DOM ELEMENTS ---
  const authOverlay = document.getElementById('authGateOverlay');
  const authForm = document.getElementById('authForm');
  const authPasskeyInput = document.getElementById('authPasskey');
  const authErrorMsg = document.getElementById('authErrorMsg');
  const clockDisplay = document.getElementById('adminClock');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const navItems = document.querySelectorAll('.admin-nav-item');
  const btnSignout = document.getElementById('btnSignout');
  const themeToggleBtn = document.getElementById('adminThemeToggle');
  const mobileSidebarToggle = document.getElementById('btnSidebarToggle');
  const sidebar = document.getElementById('adminSidebar');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');
  const toastContainer = document.getElementById('toastContainer');

  // =========================================================================
  // 1. TOAST NOTIFICATION SYSTEM
  // =========================================================================
  function showToast(message, type = 'info', duration = 3500) {
    if (!toastContainer) {
      alert(message);
      return;
    }
    const toast = document.createElement('div');
    toast.className = `ax-toast ax-toast-${type}`;
    const iconName = type === 'success' ? 'check-circle' : (type === 'error' ? 'alert-triangle' : 'info');
    toast.innerHTML = `
      <i data-lucide="${iconName}" style="width:18px; height:18px; flex-shrink:0;"></i>
      <span style="font-size:0.875rem; font-weight:600;">${escapeHtml(message)}</span>
    `;
    toastContainer.appendChild(toast);
    if (window.lucide) window.lucide.createIcons({ root: toast });

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  window.showToast = showToast;

  // =========================================================================
  // 2. AUTH GATE & SECURITY (Firebase Auth + Strict Dual Whitelisting)
  // =========================================================================
  let firebaseAuth = null;
  const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15-minute inactivity threshold
  let idleTimer = null;

  function initFirebaseAuth() {
    try {
      if (typeof firebase !== 'undefined') {
        const settings = Store.getSettings();
        const fbConfig = (settings && settings.firebaseConfig && settings.firebaseConfig.apiKey) 
          ? settings.firebaseConfig 
          : {
              apiKey: 'AIzaSyBRPmxyMs3qxSGRm1cqzRMXkzE3SyqcPYk',
              authDomain: 'aarambhx-technology-58499.firebaseapp.com',
              projectId: 'aarambhx-technology-58499',
              storageBucket: 'aarambhx-technology-58499.firebasestorage.app',
              messagingSenderId: '520659408907',
              appId: '1:520659408907:web:f597321d3ab36b9e310f0e'
            };

        if (!firebase.apps || !firebase.apps.length) {
          firebase.initializeApp(fbConfig);
        }
        if (firebase.auth) {
          firebaseAuth = firebase.auth();
          
          // Handle redirect sign-in result (if mobile or popup-blocked)
          firebaseAuth.getRedirectResult().then(result => {
            if (result && result.user) {
              handleAuthResult(result.user);
            }
          }).catch(err => {
            console.warn('[Admin] Redirect result warning:', err);
          });

          // Listen for persistent auth state changes
          firebaseAuth.onAuthStateChanged(user => {
            if (user) {
              const email = user.email ? user.email.toLowerCase().trim() : '';
              if (Store.isWhitelistedEmail(email)) {
                Store.setFirebaseAdminSession(user);
                updateAdminProfileChip();
                if (authOverlay) authOverlay.classList.add('hidden');
                startInactivityTimer();
              } else {
                // Unauthorized user signed in via Firebase -> kick immediately
                firebaseAuth.signOut().catch(() => {});
                Store.logout();
                hideAdminProfileChip();
                if (authOverlay) authOverlay.classList.remove('hidden');
                alert(`ACCESS DENIED: ${email || 'This account'} is not an authorized administrator. Access denied.`);
                window.location.href = 'index.html';
              }
            } else if (!Store.isAuthenticated()) {
              if (authOverlay) authOverlay.classList.remove('hidden');
              hideAdminProfileChip();
            }
          });
        }
      }
    } catch (err) {
      console.warn('[Admin] Firebase Auth initialization exception:', err);
    }
  }

  function handleAuthResult(user) {
    if (!user || !user.email) return;
    const email = user.email.toLowerCase().trim();

    if (!Store.isWhitelistedEmail(email)) {
      Store.logAuditEvent('LOGIN_REJECTED_UNAUTHORIZED_EMAIL', {
        email,
        displayName: user.displayName || 'Unknown'
      });
      if (firebaseAuth) {
        firebaseAuth.signOut().catch(() => {});
      }
      Store.logout();
      hideAdminProfileChip();
      alert(`ACCESS DENIED: "${email}" is not authorized to access the AarambhX Command Hub.`);
      window.location.href = 'index.html';
      return;
    }

    // Authorized Admin Sign-in
    Store.setFirebaseAdminSession(user);
    updateAdminProfileChip();
    if (authErrorMsg) authErrorMsg.textContent = '';
    if (authOverlay) authOverlay.classList.add('hidden');
    showToast(`Welcome back, ${user.displayName || 'Admin'}!`, 'success');
    startInactivityTimer();
    renderDashboard();
  }

  function checkAuth() {
    if (!Store.isAuthenticated()) {
      if (authOverlay) authOverlay.classList.remove('hidden');
      hideAdminProfileChip();
      if (authPasskeyInput) authPasskeyInput.focus();
    } else {
      if (authOverlay) authOverlay.classList.add('hidden');
      updateAdminProfileChip();
      startInactivityTimer();
      renderDashboard();
    }
  }

  // Google Sign-In Click Trigger
  const btnGoogleSignIn = document.getElementById('btnGoogleSignIn');
  if (btnGoogleSignIn) {
    btnGoogleSignIn.addEventListener('click', async () => {
      if (authErrorMsg) authErrorMsg.textContent = '';
      if (!firebaseAuth) {
        initFirebaseAuth();
      }
      if (!firebaseAuth) {
        if (authErrorMsg) authErrorMsg.textContent = 'Firebase SDK is offline or loading. Use emergency passkey below.';
        return;
      }

      const provider = new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      try {
        const result = await firebaseAuth.signInWithPopup(provider);
        if (result && result.user) {
          handleAuthResult(result.user);
        }
      } catch (err) {
        console.warn('[Admin] Popup sign-in error:', err);
        if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
          try {
            await firebaseAuth.signInWithRedirect(provider);
          } catch (redirectErr) {
            if (authErrorMsg) authErrorMsg.textContent = 'Sign-in failed: ' + (redirectErr.message || 'Popup blocked');
          }
        } else if (err.code === 'auth/configuration-not-found' || err.code === 'auth/operation-not-allowed') {
          if (authErrorMsg) {
            authErrorMsg.innerHTML = '<div style="background:rgba(37,99,235,0.08); border:1px solid rgba(37,99,235,0.25); border-radius:10px; padding:12px 14px; margin-bottom:12px; color:var(--adm-text); font-size:0.8rem; line-height:1.45; text-align:left;">' +
              '<strong style="color:var(--ax-blue); display:flex; align-items:center; gap:6px; margin-bottom:4px;">' +
              '<i data-lucide="info" style="width:16px;height:16px;"></i> Google Sign-In Setup Pending</strong>' +
              'Google Sign-In has not been toggled on in the Firebase Console yet. Please enter your <strong>Admin Passkey</strong> below to log in directly, or enable Google Provider in Firebase Console.' +
              '</div>';
            if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
          }
          if (authPasskeyInput) {
            authPasskeyInput.focus();
            authPasskeyInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } else {
          if (authErrorMsg) authErrorMsg.textContent = err.message || 'Google authentication failed';
        }
      }
    });
  }

  // Developer Fallback: Passkey Submission
  if (authForm) {
    authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const passkey = authPasskeyInput ? authPasskeyInput.value : '';
      if (Store.login(passkey)) {
        if (authErrorMsg) authErrorMsg.textContent = '';
        if (authPasskeyInput) authPasskeyInput.value = '';
        if (authOverlay) authOverlay.classList.add('hidden');
        updateAdminProfileChip();
        showToast('Authenticated via Master Passkey', 'success');
        startInactivityTimer();
        renderDashboard();
      } else {
        if (authErrorMsg) authErrorMsg.textContent = 'Invalid administrative passkey. Access denied.';
        if (authPasskeyInput) authPasskeyInput.focus();
      }
    });
  }

  // Unified Sign Out Function
  function handleSignOut() {
    if (firebaseAuth) {
      firebaseAuth.signOut().catch(() => {});
    }
    Store.logout();
    hideAdminProfileChip();
    const sessionLock = document.getElementById('sessionLockOverlay');
    if (sessionLock) sessionLock.classList.add('hidden');
    if (authOverlay) authOverlay.classList.remove('hidden');
    showToast('Signed out successfully', 'info');
  }

  if (btnSignout) {
    btnSignout.addEventListener('click', handleSignOut);
  }

  const btnProfileSignOut = document.getElementById('btnProfileSignOut');
  if (btnProfileSignOut) {
    btnProfileSignOut.addEventListener('click', handleSignOut);
  }

  const btnLockSignOut = document.getElementById('btnLockSignOut');
  if (btnLockSignOut) {
    btnLockSignOut.addEventListener('click', handleSignOut);
  }

  // Topbar Profile Chip
  function updateAdminProfileChip() {
    const session = Store.getAuthSession();
    const chip = document.getElementById('adminProfileChip');
    const avatar = document.getElementById('adminProfileAvatar');
    const name = document.getElementById('adminProfileName');
    const email = document.getElementById('adminProfileEmail');

    if (!session || !session.authenticated) {
      if (chip) chip.style.display = 'none';
      return;
    }

    if (chip) chip.style.display = 'inline-flex';
    if (name) name.textContent = session.displayName || session.user || 'Admin';
    if (email) email.textContent = session.email || (session.provider === 'passkey' ? 'Master Passkey' : 'admin@aarambhx.com');
    if (avatar && session.photoURL) {
      avatar.src = session.photoURL;
    } else if (avatar) {
      avatar.src = 'assets/aarambhx-logo.jpg';
    }
  }

  function hideAdminProfileChip() {
    const chip = document.getElementById('adminProfileChip');
    if (chip) chip.style.display = 'none';
  }

  // 15-Minute Inactivity Auto-Lock
  function resetInactivityTimer() {
    if (!Store.isAuthenticated()) return;
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(lockSession, IDLE_TIMEOUT_MS);
  }

  function lockSession() {
    if (!Store.isAuthenticated()) return;
    const sessionLock = document.getElementById('sessionLockOverlay');
    const session = Store.getAuthSession();
    if (sessionLock) {
      const lockUserName = document.getElementById('lockUserName');
      const lockUserEmail = document.getElementById('lockUserEmail');
      const lockUserAvatar = document.getElementById('lockUserAvatar');
      if (session) {
        if (lockUserName) lockUserName.textContent = session.displayName || session.user || 'Administrator';
        if (lockUserEmail) lockUserEmail.textContent = session.email || 'Master Passkey';
        if (lockUserAvatar && session.photoURL) lockUserAvatar.src = session.photoURL;
      }
      sessionLock.classList.remove('hidden');
      Store.logAuditEvent('SESSION_AUTO_LOCKED_INACTIVITY', { idleMinutes: 15 });
    }
  }

  function startInactivityTimer() {
    ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'].forEach(evt => {
      window.addEventListener(evt, resetInactivityTimer, { passive: true });
    });
    resetInactivityTimer();
  }

  const btnUnlockSession = document.getElementById('btnUnlockSession');
  if (btnUnlockSession) {
    btnUnlockSession.addEventListener('click', () => {
      const sessionLock = document.getElementById('sessionLockOverlay');
      if (sessionLock) sessionLock.classList.add('hidden');
      resetInactivityTimer();
      showToast('Session unlocked', 'success');
    });
  }

  // =========================================================================
  // 3. LIVE CLOCK (IST)
  // =========================================================================
  function updateClock() {
    if (!clockDisplay) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour12: true });
    clockDisplay.textContent = timeStr + ' IST';
  }
  setInterval(updateClock, 1000);
  updateClock();

  // =========================================================================
  // 4. TAB NAVIGATION & VIEW ROUTING
  // =========================================================================
  function switchTab(tabId) {
    currentTab = tabId;
    navItems.forEach(item => {
      if (item.getAttribute('data-tab') === tabId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    tabPanes.forEach(pane => {
      if (pane.id === `tab-${tabId}`) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });

    function openSidebar() {
      if (sidebar) sidebar.classList.add('mobile-open');
      if (sidebarBackdrop) sidebarBackdrop.classList.add('active');
    }

    function closeSidebar() {
      if (sidebar) sidebar.classList.remove('mobile-open');
      if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
    }

    closeSidebar();

    // Route view rendering
    switch (tabId) {
      case 'overview':
        renderOverview();
        break;
      case 'inquiries':
        renderInquiries();
        break;
      case 'quotations':
        renderQuotations();
        break;
      case 'catalog':
        renderCatalog();
        break;
      case 'projects':
        renderProjects();
        break;
      case 'workshops':
        renderWorkshops();
        break;
      case 'certificates':
        renderCertificates();
        break;
      case 'testimonials':
        renderTestimonials();
        break;
      case 'reels':
        renderReels();
        break;
      case 'banner':
        renderBannerControl();
        break;
      case 'blog':
        renderBlogCMS();
        break;
      case 'settings':
        renderSettings();
        break;
    }
  }

  window.switchTab = switchTab;

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = item.getAttribute('data-tab');
      if (tabId) {
        window.location.hash = tabId;
        switchTab(tabId);
      }
    });
  });

  if (mobileSidebarToggle && sidebar) {
    mobileSidebarToggle.addEventListener('click', () => {
      if (sidebar.classList.contains('mobile-open')) {
        if (sidebar) sidebar.classList.remove('mobile-open');
        if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
      } else {
        if (sidebar) sidebar.classList.add('mobile-open');
        if (sidebarBackdrop) sidebarBackdrop.classList.add('active');
      }
    });
  }

  if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener('click', () => {
      if (sidebar) sidebar.classList.remove('mobile-open');
      if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
    });
  }

  // Keyboard accessibility: ESC closes open modal or sidebar
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (sidebar) sidebar.classList.remove('mobile-open');
      if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
      document.querySelectorAll('.ax-modal-overlay.open').forEach(modal => {
        modal.classList.remove('open');
      });
    }
  });

  function handleHash() {
    const hash = window.location.hash.replace('#', '');
    const validTabs = ['overview', 'inquiries', 'quotations', 'catalog', 'projects', 'workshops', 'certificates', 'testimonials', 'reels', 'banner', 'blog', 'settings'];
    if (hash && validTabs.includes(hash)) {
      switchTab(hash);
    } else {
      switchTab('overview');
    }
  }

  // =========================================================================
  // 5. MODULE: OVERVIEW & PRIVACY MICRO-ANALYTICS
  // =========================================================================
  function renderOverview() {
    const m = Store.getDashboardMetrics();
    
    // Core KPIs
    const totalLeadsEl = document.getElementById('metricTotalLeads');
    const newLeadsEl = document.getElementById('metricNewLeads');
    const totalProjectsEl = document.getElementById('metricTotalProjects');
    const totalStudentsEl = document.getElementById('metricTotalStudents');
    const badgeCounterEl = document.getElementById('sidebarLeadsBadge');

    if (totalLeadsEl) totalLeadsEl.textContent = m.totalLeads;
    if (newLeadsEl) newLeadsEl.textContent = m.newLeads;
    if (totalProjectsEl) totalProjectsEl.textContent = m.totalProjects;
    if (totalStudentsEl) totalStudentsEl.textContent = m.enrolledStudents;
    if (badgeCounterEl) {
      badgeCounterEl.textContent = m.newLeads > 0 ? m.newLeads : '';
      badgeCounterEl.style.display = m.newLeads > 0 ? 'inline-block' : 'none';
    }

    // New Micro-Analytics KPIs
    const totalBilledEl = document.getElementById('metricTotalBilled');
    const totalInvoicesCountEl = document.getElementById('metricTotalInvoicesCount');
    const visitsEl = document.getElementById('metricVisits');
    const convSubEl = document.getElementById('metricConversionRateSub');
    const waClicksEl = document.getElementById('metricWhatsAppClicks');
    const brochureDownEl = document.getElementById('metricBrochureDownloads');

    if (totalBilledEl) totalBilledEl.textContent = '₹' + m.totalPaidAmount.toLocaleString('en-IN');
    if (totalInvoicesCountEl) totalInvoicesCountEl.textContent = `${m.totalInvoices} Invoices & Quotes`;
    if (visitsEl) visitsEl.textContent = m.visits;
    if (convSubEl) convSubEl.textContent = `${m.conversionRate}% Lead Conversion`;
    if (waClicksEl) waClicksEl.textContent = m.whatsappClicks;
    if (brochureDownEl) brochureDownEl.textContent = m.brochureDownloads;

    // Recent Inquiries Table
    const recentTableBody = document.getElementById('overviewRecentLeadsBody');
    if (recentTableBody) {
      const recent = Store.getInquiries().slice(0, 5);
      if (!recent.length) {
        recentTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--adm-text-subtle); padding: 24px;">No inquiries recorded yet.</td></tr>`;
      } else {
        recentTableBody.innerHTML = recent.map(lead => {
          const statusClass = lead.status === 'New' ? 'badge-new' : (lead.status === 'Contacted' ? 'badge-contacted' : 'badge-closed');
          const waLink = `https://wa.me/91${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${lead.name}, thank you for reaching out to AarambhX Technology regarding ${lead.serviceOrTrack}.`)}`;
          return `
            <tr>
              <td><strong>${escapeHtml(lead.name)}</strong><br><small style="color:var(--adm-text-subtle);">${lead.createdAt.slice(0, 10)}</small></td>
              <td><span class="badge-status ${statusClass}">${lead.status}</span></td>
              <td>${escapeHtml(lead.serviceOrTrack)}</td>
              <td><span style="font-family: monospace;">+91 ${escapeHtml(lead.phone)}</span></td>
              <td>
                <a href="${waLink}" target="_blank" rel="noopener" class="btn-whatsapp-chat">
                  <i data-lucide="message-circle"></i> Chat
                </a>
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    // Service Demand Breakdown Bars
    const serviceDemandBox = document.getElementById('overviewServiceDemand');
    if (serviceDemandBox) {
      const inquiries = Store.getInquiries();
      const serviceCounts = {};
      inquiries.forEach(i => {
        const s = i.serviceOrTrack || 'General Tech';
        serviceCounts[s] = (serviceCounts[s] || 0) + 1;
      });

      const topServices = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
      const totalCount = inquiries.length || 1;

      if (!topServices.length) {
        serviceDemandBox.innerHTML = `<p style="text-align:center; color: var(--adm-text-subtle); padding: 20px;">No service demand data yet.</p>`;
      } else {
        serviceDemandBox.innerHTML = topServices.map(([name, count]) => {
          const pct = Math.round((count / totalCount) * 100);
          return `
            <div style="margin-bottom: 12px;">
              <div style="display:flex; justify-content:space-between; font-size: 0.8rem; margin-bottom: 4px;">
                <strong style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px;">${escapeHtml(name)}</strong>
                <span>${count} leads (${pct}%)</span>
              </div>
              <div style="height: 6px; background: var(--adm-pill-track); border-radius: 9999px; overflow: hidden;">
                <div style="width: ${pct}%; height: 100%; background: linear-gradient(90deg, #2563EB, #10B981); border-radius: 9999px;"></div>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    if (window.lucide) window.lucide.createIcons();
  }

  // =========================================================================
  // 6. MODULE: INQUIRIES & LEADS CRM + WHATSAPP AUTOMATION
  // =========================================================================
  function renderInquiries() {
    const tableBody = document.getElementById('inquiriesTableBody');
    if (!tableBody) return;

    let items = Store.getInquiries(inquiryFilter);

    if (inquirySearchQuery) {
      const q = inquirySearchQuery.toLowerCase();
      items = items.filter(i => 
        (i.name && i.name.toLowerCase().includes(q)) ||
        (i.phone && i.phone.includes(q)) ||
        (i.serviceOrTrack && i.serviceOrTrack.toLowerCase().includes(q)) ||
        (i.details && i.details.toLowerCase().includes(q))
      );
    }

    if (!items.length) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 32px; color: var(--adm-text-subtle);">No matching leads found.</td></tr>`;
      return;
    }

    tableBody.innerHTML = items.map(lead => {
      const statusClass = lead.status === 'New' ? 'badge-new' : (lead.status === 'Contacted' ? 'badge-contacted' : (lead.status === 'In Progress' ? 'badge-progress' : 'badge-closed'));
      const waLink = `https://wa.me/91${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${lead.name}, regarding your requirement: "${lead.serviceOrTrack}" with AarambhX Technology.`)}`;
      
      return `
        <tr>
          <td>
            <strong>${escapeHtml(lead.name)}</strong>
            ${lead.email ? `<br><small style="color:var(--adm-text-subtle);">${escapeHtml(lead.email)}</small>` : ''}
          </td>
          <td><span style="font-size: 0.8rem; color: var(--adm-text-muted);">${lead.createdAt.slice(0, 10)}</span></td>
          <td>
            <select class="ax-status-select" onchange="window.updateLeadStatus('${lead.id}', this.value)">
              <option value="New" ${lead.status === 'New' ? 'selected' : ''}>New</option>
              <option value="Contacted" ${lead.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
              <option value="In Progress" ${lead.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
              <option value="Closed" ${lead.status === 'Closed' ? 'selected' : ''}>Closed</option>
            </select>
          </td>
          <td><span class="item-category-chip">${escapeHtml(lead.type)}</span></td>
          <td><strong>${escapeHtml(lead.serviceOrTrack)}</strong><br><small style="color:var(--adm-text-subtle);">${escapeHtml(lead.details || 'No details')}</small></td>
          <td><span style="font-family: monospace;">+91 ${escapeHtml(lead.phone)}</span></td>
          <td>
            <div style="display:flex; gap: 6px; align-items:center;">
              <button type="button" class="btn-whatsapp-chat" onclick="window.openQuickReply('${lead.id}')" title="1-Click WhatsApp Quick Reply" style="background:#25D366; color:#fff; border-color:#25D366;">
                <i data-lucide="zap"></i> Reply
              </button>
              <a href="${waLink}" target="_blank" rel="noopener" class="ax-btn-secondary" title="Direct Chat" style="padding: 6px 8px;">
                <i data-lucide="message-circle"></i>
              </a>
              <button type="button" class="ax-btn-secondary" onclick="window.deleteLead('${lead.id}')" title="Delete Lead" style="color: var(--ax-rose); padding: 6px 8px;">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  window.updateLeadStatus = function (id, newStatus) {
    Store.updateInquiryStatus(id, newStatus);
    showToast(`Lead status updated to ${newStatus}`, 'success');
    renderOverview();
  };

  window.deleteLead = function (id) {
    if (confirm('Permanently delete this inquiry?')) {
      Store.deleteInquiry(id);
      showToast('Lead deleted from pipeline', 'info');
      renderInquiries();
      renderOverview();
    }
  };

  // WhatsApp Quick Reply Modal Automation
  const modalQuickReply = document.getElementById('modalQuickReply');
  const btnCloseQuickReply = document.getElementById('btnCloseQuickReplyModal');
  const qrRecipientName = document.getElementById('qrRecipientName');
  const qrRecipientPhone = document.getElementById('qrRecipientPhone');
  const qrMessagePreview = document.getElementById('qrMessagePreview');
  const btnLaunchWhatsApp = document.getElementById('btnLaunchWhatsAppChat');
  const qrTemplateBtns = document.querySelectorAll('.qr-template-btn');

  const QUICK_TEMPLATES = {
    intro: (lead) => `Hi ${lead.name}, thank you for contacting AarambhX Technology! We received your request regarding "${lead.serviceOrTrack}". Our technical team is reviewing your requirement and will assist you shortly. Is there any specific deadline or budget you are aiming for?`,
    workshop: (lead) => `Greetings ${lead.name}, this is AarambhX Academy. Regarding your inquiry for the "${lead.serviceOrTrack}" workshop, we provide comprehensive hands-on terminal training and hardware lab rigs for colleges across Karnataka. Would you like us to share the syllabus PDF and available calendar dates?`,
    repair: (lead) => `Hello ${lead.name}, regarding your device diagnostic for "${lead.serviceOrTrack}" at AarambhX Technology: Our intake turnaround is typically 2-4 hours, with genuine components and warranty included. When would you like to drop off the system or schedule a technician?`,
    followup: (lead) => `Hi ${lead.name}, following up from AarambhX Technology regarding your recent inquiry for "${lead.serviceOrTrack}". Please let us know if you have any questions or if you'd like to proceed with the technical milestone.`
  };

  window.openQuickReply = function (leadId) {
    const inquiries = Store.getInquiries();
    activeQuickReplyLead = inquiries.find(i => i.id === leadId);
    if (!activeQuickReplyLead) return;

    if (qrRecipientName) qrRecipientName.textContent = activeQuickReplyLead.name;
    if (qrRecipientPhone) qrRecipientPhone.textContent = '+91 ' + activeQuickReplyLead.phone;
    if (qrMessagePreview) qrMessagePreview.value = QUICK_TEMPLATES.intro(activeQuickReplyLead);

    qrTemplateBtns.forEach(b => b.classList.remove('active'));
    const introBtn = document.querySelector('.qr-template-btn[data-template="intro"]');
    if (introBtn) introBtn.classList.add('active');

    if (modalQuickReply) modalQuickReply.classList.add('open');
  };

  if (btnCloseQuickReply && modalQuickReply) {
    btnCloseQuickReply.addEventListener('click', () => modalQuickReply.classList.remove('open'));
  }

  qrTemplateBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      qrTemplateBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tmpl = btn.getAttribute('data-template');
      if (activeQuickReplyLead && QUICK_TEMPLATES[tmpl] && qrMessagePreview) {
        qrMessagePreview.value = QUICK_TEMPLATES[tmpl](activeQuickReplyLead);
      }
    });
  });

  if (btnLaunchWhatsApp) {
    btnLaunchWhatsApp.addEventListener('click', () => {
      if (!activeQuickReplyLead) return;
      const cleanPhone = activeQuickReplyLead.phone.replace(/\D/g, '');
      const msg = qrMessagePreview ? qrMessagePreview.value : '';
      const url = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');
      Store.updateInquiryStatus(activeQuickReplyLead.id, 'Contacted');
      if (modalQuickReply) modalQuickReply.classList.remove('open');
      showToast('WhatsApp launched & lead marked Contacted', 'success');
      renderInquiries();
      renderOverview();
    });
  }

  // Search & Filter Listeners
  const inquiriesSearchInput = document.getElementById('inquiriesSearch');
  const inquiriesFilterSelect = document.getElementById('inquiriesFilter');
  const btnExportCSV = document.getElementById('btnExportCSV');

  if (inquiriesSearchInput) {
    inquiriesSearchInput.addEventListener('input', (e) => {
      inquirySearchQuery = e.target.value.trim();
      renderInquiries();
    });
  }

  if (inquiriesFilterSelect) {
    inquiriesFilterSelect.addEventListener('change', (e) => {
      inquiryFilter = e.target.value;
      renderInquiries();
    });
  }

  if (btnExportCSV) {
    btnExportCSV.addEventListener('click', () => {
      const csv = Store.exportInquiriesCSV();
      if (!csv) {
        showToast('No inquiries available to export', 'error');
        return;
      }
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aarambhx_leads_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Leads CSV exported successfully', 'success');
    });
  }

  // =========================================================================
  // 7. MODULE: INVOICES & QUOTATIONS GENERATOR
  // =========================================================================
  function renderQuotations() {
    const tableBody = document.getElementById('invoicesTableBody');
    if (!tableBody) return;

    const invoices = Store.getInvoices(invoiceFilter);
    if (!invoices.length) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 32px; color: var(--adm-text-subtle);">No invoices or quotations created yet.</td></tr>`;
      return;
    }

    tableBody.innerHTML = invoices.map(inv => {
      const isPaid = inv.status === 'Paid';
      const isQuote = inv.type === 'Quotation';
      const statusBadge = isPaid ? 'badge-closed' : (isQuote ? 'badge-contacted' : 'badge-new');

      return `
        <tr>
          <td><span style="font-family: monospace; font-weight: 700; color: var(--ax-blue);">${escapeHtml(inv.invoiceNumber)}</span></td>
          <td><span class="item-category-chip">${escapeHtml(inv.type)}</span></td>
          <td><strong>${escapeHtml(inv.clientName)}</strong><br><small style="color:var(--adm-text-subtle);">${escapeHtml(inv.clientPhone)}</small></td>
          <td>${escapeHtml(inv.date)}<br><small style="color:var(--adm-text-subtle);">Due: ${escapeHtml(inv.dueDate)}</small></td>
          <td><strong style="font-size: 1.05rem; color: var(--ax-emerald);">₹${(inv.total || 0).toLocaleString('en-IN')}</strong></td>
          <td><span class="badge-status ${statusBadge}">${escapeHtml(inv.status)}</span></td>
          <td>
            <div style="display:flex; gap: 6px; align-items:center;">
              <button type="button" class="ax-btn-secondary" onclick="window.previewInvoice('${inv.id}')" title="Print / PDF View" style="padding: 6px 10px;">
                <i data-lucide="printer"></i> View &amp; Print
              </button>
              <button type="button" class="ax-btn-secondary" onclick="window.deleteInvoice('${inv.id}')" title="Delete" style="color: var(--ax-rose); padding: 6px 8px;">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  const invoicesFilterSelect = document.getElementById('invoicesFilter');
  if (invoicesFilterSelect) {
    invoicesFilterSelect.addEventListener('change', (e) => {
      invoiceFilter = e.target.value;
      renderQuotations();
    });
  }

  window.deleteInvoice = function (id) {
    if (confirm('Delete this billing document?')) {
      Store.deleteInvoice(id);
      showToast('Invoice deleted', 'info');
      renderQuotations();
      renderOverview();
    }
  };

  // Add Invoice Modal Handlers & Dynamic Line Items
  const modalAddInvoice = document.getElementById('modalAddInvoice');
  const btnOpenInvoiceModal = document.getElementById('btnOpenInvoiceModal');
  const btnCloseInvoiceModal = document.getElementById('btnCloseInvoiceModal');
  const formAddInvoice = document.getElementById('formAddInvoice');
  const invoiceItemsTableBody = document.getElementById('invoiceItemsTableBody');
  const btnAddInvoiceItemRow = document.getElementById('btnAddInvoiceItemRow');
  const invDocType = document.getElementById('invDocType');
  const invDocNumber = document.getElementById('invDocNumber');

  function addInvoiceItemRow(desc = '', qty = 1, rate = 0) {
    if (!invoiceItemsTableBody) return;
    const tr = document.createElement('tr');
    tr.className = 'inv-item-row';
    tr.innerHTML = `
      <td><input type="text" class="inv-item-desc" value="${escapeHtml(desc)}" placeholder="Service / Component Description" required style="width:100%; padding:6px 8px;"></td>
      <td><input type="number" class="inv-item-qty" value="${qty}" min="1" required style="width:100%; padding:6px 8px; text-align:center;"></td>
      <td><input type="number" class="inv-item-rate" value="${rate}" min="0" required style="width:100%; padding:6px 8px; text-align:right;"></td>
      <td><span class="inv-item-amount" style="font-weight:700; display:block; text-align:right;">₹${(qty * rate).toLocaleString('en-IN')}</span></td>
      <td><button type="button" class="ax-btn-secondary btn-del-row" style="padding:4px 6px; color:var(--ax-rose);"><i data-lucide="x"></i></button></td>
    `;
    invoiceItemsTableBody.appendChild(tr);
    if (window.lucide) window.lucide.createIcons({ root: tr });

    tr.querySelector('.btn-del-row').addEventListener('click', () => {
      if (invoiceItemsTableBody.children.length > 1) {
        tr.remove();
        recalcInvoiceTotals();
      } else {
        showToast('Invoice must have at least one line item', 'info');
      }
    });

    const qtyInput = tr.querySelector('.inv-item-qty');
    const rateInput = tr.querySelector('.inv-item-rate');
    const updateRow = () => {
      const q = parseFloat(qtyInput.value) || 0;
      const r = parseFloat(rateInput.value) || 0;
      tr.querySelector('.inv-item-amount').textContent = '₹' + (q * r).toLocaleString('en-IN');
      recalcInvoiceTotals();
    };
    qtyInput.addEventListener('input', updateRow);
    rateInput.addEventListener('input', updateRow);

    recalcInvoiceTotals();
  }

  function recalcInvoiceTotals() {
    if (!invoiceItemsTableBody) return;
    let subtotal = 0;
    const rows = invoiceItemsTableBody.querySelectorAll('.inv-item-row');
    rows.forEach(tr => {
      const q = parseFloat(tr.querySelector('.inv-item-qty').value) || 0;
      const r = parseFloat(tr.querySelector('.inv-item-rate').value) || 0;
      subtotal += (q * r);
    });

    const discountInput = document.getElementById('calcDiscount');
    const taxRateSelect = document.getElementById('calcTaxRate');
    const subtotalEl = document.getElementById('calcSubtotal');
    const grandTotalEl = document.getElementById('calcGrandTotal');

    const discount = parseFloat(discountInput ? discountInput.value : 0) || 0;
    const taxRate = parseFloat(taxRateSelect ? taxRateSelect.value : 0) || 0;
    const taxable = Math.max(0, subtotal - discount);
    const tax = Math.round((taxable * taxRate) / 100);
    const grandTotal = Math.round(taxable + tax);

    if (subtotalEl) subtotalEl.textContent = '₹' + subtotal.toLocaleString('en-IN');
    if (grandTotalEl) grandTotalEl.textContent = '₹' + grandTotal.toLocaleString('en-IN');
  }

  if (btnAddInvoiceItemRow) {
    btnAddInvoiceItemRow.addEventListener('click', () => addInvoiceItemRow('', 1, 1000));
  }

  const discountInput = document.getElementById('calcDiscount');
  const taxRateSelect = document.getElementById('calcTaxRate');
  if (discountInput) discountInput.addEventListener('input', recalcInvoiceTotals);
  if (taxRateSelect) taxRateSelect.addEventListener('change', recalcInvoiceTotals);

  if (invDocType && invDocNumber) {
    invDocType.addEventListener('change', () => {
      invDocNumber.value = Store.generateInvoiceNumber(invDocType.value);
    });
  }

  if (btnOpenInvoiceModal && modalAddInvoice) {
    btnOpenInvoiceModal.addEventListener('click', () => {
      if (invoiceItemsTableBody) invoiceItemsTableBody.innerHTML = '';
      addInvoiceItemRow('Custom System Engineering / Repair Milestone', 1, 5000);
      if (invDocType && invDocNumber) {
        invDocNumber.value = Store.generateInvoiceNumber(invDocType.value);
      }
      const dateInput = document.getElementById('invDate');
      const dueDateInput = document.getElementById('invDueDate');
      if (dateInput) dateInput.value = new Date().toISOString().slice(0, 10);
      if (dueDateInput) dueDateInput.value = new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10);
      modalAddInvoice.classList.add('open');
    });
  }

  if (btnCloseInvoiceModal && modalAddInvoice) {
    btnCloseInvoiceModal.addEventListener('click', () => modalAddInvoice.classList.remove('open'));
  }

  if (formAddInvoice) {
    formAddInvoice.addEventListener('submit', (e) => {
      e.preventDefault();
      const items = [];
      const rows = invoiceItemsTableBody.querySelectorAll('.inv-item-row');
      rows.forEach(tr => {
        const desc = tr.querySelector('.inv-item-desc').value;
        const qty = parseFloat(tr.querySelector('.inv-item-qty').value) || 1;
        const rate = parseFloat(tr.querySelector('.inv-item-rate').value) || 0;
        items.push({ desc, qty, rate, amount: qty * rate });
      });

      const saved = Store.saveInvoice({
        type: document.getElementById('invDocType').value,
        invoiceNumber: document.getElementById('invDocNumber').value,
        clientName: document.getElementById('invClientName').value,
        clientPhone: document.getElementById('invClientPhone').value,
        clientEmail: document.getElementById('invClientEmail').value,
        clientGst: document.getElementById('invClientGst').value,
        clientAddress1: (document.getElementById('invClientAddress1') && document.getElementById('invClientAddress1').value) || '',
        clientAddress2: (document.getElementById('invClientAddress2') && document.getElementById('invClientAddress2').value) || '',
        clientCityState: (document.getElementById('invClientCityState') && document.getElementById('invClientCityState').value) || '',
        placeOfSupply: (document.getElementById('invPlaceOfSupply') && document.getElementById('invPlaceOfSupply').value) || 'Karnataka (KA)',
        paymentTerms: (document.getElementById('invPaymentTerms') && document.getElementById('invPaymentTerms').value) || 'Net 7 Days',
        date: document.getElementById('invDate').value,
        dueDate: document.getElementById('invDueDate').value,
        items,
        discount: document.getElementById('calcDiscount').value,
        taxRate: document.getElementById('calcTaxRate').value,
        notes: document.getElementById('invNotes').value,
        status: document.getElementById('invStatus').value
      });

      formAddInvoice.reset();
      modalAddInvoice.classList.remove('open');
      showToast(`${saved.type} ${saved.invoiceNumber} saved successfully!`, 'success');
      renderQuotations();
      renderOverview();
      window.previewInvoice(saved.id);
    });
  }

  // Printable Invoice Preview Modal
  const modalPrintInvoice = document.getElementById('modalPrintInvoice');
  const btnClosePrintInvoice = document.getElementById('btnClosePrintInvoiceModal');
  const invoicePrintContainer = document.getElementById('invoicePrintContainer');
  const btnPrintInvoiceAction = document.getElementById('btnPrintInvoiceAction');
  const btnDirectPrintAction = document.getElementById('btnDirectPrintAction');
  const btnShareInvoiceWhatsApp = document.getElementById('btnShareInvoiceWhatsApp');

  // Indian Currency Number to Words Converter
  function numberToWordsIndian(num) {
    num = Math.round(Number(num) || 0);
    if (num === 0) return 'Rupees Zero Only';

    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
               'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    function inWords(n) {
      if (n === 0) return '';
      if (n < 20) return a[n] + ' ';
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '') + ' ';
      if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred ' + (n % 100 ? inWords(n % 100) : '');
      if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 ? inWords(n % 1000) : '');
      if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 ? inWords(n % 100000) : '');
      return inWords(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 ? inWords(n % 10000000) : '');
    }

    const words = inWords(num).trim().replace(/\s+/g, ' ');
    return `Rupees ${words} Only`;
  }

  // Invoice Date Formatter (e.g. 2026-09-18 -> 18 Sep 2026)
  function formatInvoiceDate(dateStr) {
    if (!dateStr) return '';
    if (/^\d{1,2}\s+[A-Za-z]{3}\s+\d{4}$/.test(dateStr)) return dateStr;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = d.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  // Currency Formatter with 2 decimal places
  function formatCurrency(amount) {
    const val = parseFloat(amount) || 0;
    return val.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  window.previewInvoice = function (invId) {
    const invoices = Store.getInvoices();
    activePrintInvoice = invoices.find(i => i.id === invId);
    if (!activePrintInvoice || !invoicePrintContainer) return;

    const isPaid = activePrintInvoice.status === 'Paid';
    const settings = Store.getSettings() || {};
    const upiUri = `upi://pay?pa=${encodeURIComponent(settings.upiId || 'mohitgujjar07@okhdfcbank')}&pn=${encodeURIComponent(settings.upiName || 'AarambhX Technology')}&am=${activePrintInvoice.total}&cu=INR`;
    const upiQrSvg = generateSimpleQRCodeSvg(upiUri);

    // Calculate item and tax breakdown
    const subtotal = parseFloat(activePrintInvoice.subtotal) || 0;
    const discount = parseFloat(activePrintInvoice.discount) || 0;
    const taxable = Math.max(0, subtotal - discount);
    const taxRate = parseFloat(activePrintInvoice.taxRate) || (activePrintInvoice.taxAmount > 0 ? 18 : 0);
    const taxAmount = parseFloat(activePrintInvoice.taxAmount) || Math.round((taxable * taxRate) / 100);
    const cgstAmount = taxAmount / 2;
    const sgstAmount = taxAmount / 2;
    const total = parseFloat(activePrintInvoice.total) || Math.round(taxable + taxAmount);

    const invoiceNo = activePrintInvoice.invoiceNumber || 'AT-2026-001';
    const invoiceDate = formatInvoiceDate(activePrintInvoice.date);
    const dueDate = formatInvoiceDate(activePrintInvoice.dueDate);
    const paymentTerms = activePrintInvoice.paymentTerms || 'Net 7 Days';
    const placeOfSupply = activePrintInvoice.placeOfSupply || 'Karnataka (KA)';
    const gstin = settings.gstin || '29ABCDE1234F1Z5';

    // Client Address normalization
    const clientName = activePrintInvoice.clientName || 'Client / Company Name';
    const addr1 = activePrintInvoice.clientAddress1 || (activePrintInvoice.clientAddress ? activePrintInvoice.clientAddress.split(',')[0] : 'Address Line 1');
    const addr2 = activePrintInvoice.clientAddress2 || (activePrintInvoice.clientAddress && activePrintInvoice.clientAddress.split(',')[1] ? activePrintInvoice.clientAddress.split(',')[1].trim() : 'Address Line 2');
    const cityState = activePrintInvoice.clientCityState || 'City, State - PIN';
    const country = activePrintInvoice.clientCountry || 'India';
    const clientGst = activePrintInvoice.clientGst ? `GSTIN: ${escapeHtml(activePrintInvoice.clientGst)}` : 'GSTIN (if applicable)';

    const items = activePrintInvoice.items || [];

    const isQuotation = activePrintInvoice.type === 'Quotation';
    const mainHeading = isQuotation ? 'QUOTATION' : 'INVOICE';
    const thankYouText = isQuotation
      ? `Thank you for considering Aarambhx Technology!<br>We appreciate your interest in our solutions.`
      : `Thank you for choosing Aarambhx Technology!<br>We appreciate your business and support.`;

    const paymentTitle = isQuotation ? 'Advance / Payment' : 'Payment';
    const paymentInstruction = isQuotation
      ? 'Scan the QR code to process advance or token payment'
      : 'Scan the QR code to make the payment';

    const termsListHtml = isQuotation
      ? `
        <li>This quotation is valid for 30 days from the date of issuance.</li>
        <li>Services will be scheduled upon formal approval and receipt of initial advance.</li>
        <li>Any modifications or additions to the scope of work may attract additional charges.</li>
        <li>This is a computer generated quotation and does not require a physical seal.</li>
      `
      : `
        <li>Payment is due within the stipulated due date.</li>
        <li>Services will be delivered as per the agreed scope of work.</li>
        <li>Any changes in scope may attract additional charges.</li>
        <li>This is a computer generated invoice and does not require a physical signature.</li>
      `;

    invoicePrintContainer.innerHTML = `
      <div class="printable-invoice-card" id="printableInvoiceNode">
        <!-- 1. TOP HEADER BANNER (Ultra-HD 3D Gold Facets & AarambhX Emblem) -->
        <div class="inv-top-header-wrap">
          <svg class="inv-header-bg-svg" viewBox="0 0 760 142" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bgDarkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#05070B"/>
                <stop offset="60%" stop-color="#0A0E17"/>
                <stop offset="100%" stop-color="#080C14"/>
              </linearGradient>
              <linearGradient id="goldBeamGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="rgba(180,83,9,0)"/>
                <stop offset="35%" stop-color="rgba(217,119,6,0.35)"/>
                <stop offset="47%" stop-color="rgba(253,230,138,0.95)"/>
                <stop offset="50%" stop-color="#FFFFFF"/>
                <stop offset="53%" stop-color="rgba(253,230,138,0.95)"/>
                <stop offset="65%" stop-color="rgba(217,119,6,0.4)"/>
                <stop offset="100%" stop-color="rgba(146,64,14,0)"/>
              </linearGradient>
              <linearGradient id="facet1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#1E293B"/>
                <stop offset="50%" stop-color="#0F172A"/>
                <stop offset="100%" stop-color="#090D16"/>
              </linearGradient>
              <linearGradient id="facet2" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#263449"/>
                <stop offset="50%" stop-color="#151E2E"/>
                <stop offset="100%" stop-color="#0B0F19"/>
              </linearGradient>
              <linearGradient id="softGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="rgba(217,119,6,0.22)"/>
                <stop offset="100%" stop-color="rgba(217,119,6,0)"/>
              </linearGradient>
            </defs>

            <rect width="760" height="142" fill="url(#bgDarkGrad)"/>

            <!-- Metallic Shards / Facets on Right -->
            <polygon points="480,142 580,0 760,0 760,142" fill="url(#facet1)" opacity="0.85"/>
            <polygon points="540,142 630,0 760,0 760,70" fill="url(#facet2)" opacity="0.6"/>
            <polygon points="610,142 700,0 760,0 760,142" fill="#0A0E17" opacity="0.75"/>
            <line x1="580" y1="0" x2="480" y2="142" stroke="rgba(255,255,255,0.08)" stroke-width="1.5"/>
            <line x1="630" y1="0" x2="540" y2="142" stroke="rgba(245,158,11,0.25)" stroke-width="1"/>
            <line x1="700" y1="0" x2="610" y2="142" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>

            <!-- Soft diffuse amber light spill -->
            <ellipse cx="480" cy="70" rx="140" ry="70" fill="url(#softGlowGrad)"/>

            <!-- Sharp core golden light beam -->
            <polygon points="426,142 442,142 536,0 520,0" fill="url(#goldBeamGrad)" opacity="0.95"/>

            <!-- Bottom gold border line -->
            <line x1="0" y1="141" x2="760" y2="141" stroke="#D97706" stroke-width="2"/>
          </svg>

          <div class="inv-header-content">
            <div class="inv-header-left-group">
              <!-- Logo (3D Metallic Emblem + Crisp Vector Text, Zero duplicate AAA) -->
              <div class="inv-brand-block">
                <img src="assets/invoice-emblem-3d.png" class="inv-emblem-img" alt="AarambhX Emblem" crossorigin="anonymous">
                <div class="inv-brand-text-row">
                  <span>AARAMBH</span><span class="inv-brand-x">X</span>
                </div>
                <div class="inv-brand-sub">TECHNOLOGY</div>
              </div>

              <!-- Vertical Divider -->
              <div class="inv-gold-divider"></div>

              <!-- Credo -->
              <div class="inv-credo-block">
                <div class="inv-credo-words">
                  IDEAS<br>
                  TECHNOLOGY<br>
                  IMPACT
                </div>
                <div class="inv-credo-bar"></div>
                <div class="inv-credo-tagline">
                  BUILDING A<br>
                  BRIGHTER TOMORROW
                </div>
              </div>
            </div>

            <!-- Pillars -->
            <div class="inv-pillars-block">
              <div class="inv-pillars-words">
                INNOVATE<br>
                AUTOMATE<br>
                GROW
              </div>
              <div class="inv-pillars-bar"></div>
            </div>
          </div>
        </div>

        <!-- 2. BODY CONTENT -->
        <div class="inv-body-wrap">
          <!-- Title & Meta Grid -->
          <div class="inv-title-meta-row">
            <div class="inv-title-col">
              <h1 class="inv-main-heading">${mainHeading}</h1>
              <div class="inv-heading-gold-bar"></div>
              <p class="inv-greeting-text">
                ${thankYouText}
              </p>
            </div>

            <div class="inv-meta-col">
              <div class="inv-meta-card">
                <div class="inv-meta-row">
                  <span class="inv-meta-label">${isQuotation ? 'Quotation No.' : 'Invoice No.'}</span>
                  <span class="inv-meta-val">${escapeHtml(invoiceNo)}</span>
                </div>
                <div class="inv-meta-row">
                  <span class="inv-meta-label">${isQuotation ? 'Quotation Date' : 'Invoice Date'}</span>
                  <span class="inv-meta-val">${escapeHtml(invoiceDate)}</span>
                </div>
                <div class="inv-meta-row">
                  <span class="inv-meta-label">${isQuotation ? 'Valid Until' : 'Due Date'}</span>
                  <span class="inv-meta-val">${escapeHtml(dueDate)}</span>
                </div>
                <div class="inv-meta-row">
                  <span class="inv-meta-label">Payment Terms</span>
                  <span class="inv-meta-val">${escapeHtml(paymentTerms)}</span>
                </div>
                <div class="inv-meta-row">
                  <span class="inv-meta-label">Place of Supply</span>
                  <span class="inv-meta-val">${escapeHtml(placeOfSupply)}</span>
                </div>
                <div class="inv-meta-row">
                  <span class="inv-meta-label">GSTIN</span>
                  <span class="inv-meta-val">${escapeHtml(gstin)}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Bill To & From Dual Entities -->
          <div class="inv-parties-row">
            <div class="inv-bill-to-col">
              <div class="inv-section-title">Bill To</div>
              <div class="inv-party-name">${escapeHtml(clientName)}</div>
              <div class="inv-party-address">
                <div>${escapeHtml(addr1)}</div>
                <div>${escapeHtml(addr2)}</div>
                <div>${escapeHtml(cityState)}</div>
                <div>${escapeHtml(country)}</div>
                <div class="inv-gstin-line">${clientGst}</div>
              </div>
            </div>

            <div class="inv-from-col">
              <div class="inv-section-title">From</div>
              <div class="inv-from-dual-grid">
                <div class="inv-from-entity">
                  <div class="inv-party-name">Aarambhx Technology</div>
                  <div class="inv-party-detail">Tumkur, Karnataka - 572101</div>
                  <div class="inv-party-detail">India</div>
                  <div class="inv-party-detail">GSTIN: 29ABCDE1234F1Z5</div>
                  <div class="inv-party-detail">Email: lalithlalu.com@yahoo.com</div>
                  <div class="inv-party-detail">Phone: 7676690081</div>
                </div>
                <div class="inv-from-divider"></div>
                <div class="inv-from-entity">
                  <div class="inv-party-name">Aarambhx Academy</div>
                  <div class="inv-party-detail">Tumkur, Karnataka - 572101</div>
                  <div class="inv-party-detail">India</div>
                  <div class="inv-party-detail">GSTIN: 29ABCDE1234F1Z5</div>
                  <div class="inv-party-detail">Email: lalithlalu.com@yahoo.com</div>
                  <div class="inv-party-detail">Phone: 7676690081</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Line Items Table -->
          <div class="inv-table-wrapper">
            <table class="inv-custom-table">
              <thead>
                <tr>
                  <th style="width: 6%; text-align: center;">#</th>
                  <th style="width: 48%; text-align: left;">Description</th>
                  <th style="width: 8%; text-align: center;">Qty</th>
                  <th style="width: 19%; text-align: right;">Unit Price (₹)</th>
                  <th style="width: 19%; text-align: right;">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${items.map((item, idx) => `
                  <tr class="${idx % 2 === 1 ? 'inv-tr-even' : 'inv-tr-odd'}">
                    <td style="text-align: center;">${idx + 1}</td>
                    <td style="text-align: left; font-weight: 500; color: #111827;">${escapeHtml(item.desc)}</td>
                    <td style="text-align: center;">${item.qty}</td>
                    <td style="text-align: right;">${formatCurrency(item.rate)}</td>
                    <td style="text-align: right; font-weight: 600; color: #111827;">${formatCurrency(item.amount)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Payment Card & Calculations -->
          <div class="inv-calc-row">
            <div class="inv-payment-card">
              <div class="inv-section-title">${paymentTitle}</div>
              <div class="inv-payment-instruction">${paymentInstruction}</div>
              <div class="inv-qr-frame">
                <img src="assets/invoice-qr-code.png" class="inv-qr-img" alt="Scan to Pay QR" crossorigin="anonymous">
              </div>
              <div class="inv-payment-footer-line">
                <span class="inv-dash-gold">—</span> Thank you for your support!
              </div>
            </div>

            <div class="inv-totals-box">
              <div class="inv-totals-table">
                <div class="inv-total-row inv-tr-subtotal">
                  <span>Subtotal</span>
                  <span class="inv-total-num">₹ ${formatCurrency(subtotal)}</span>
                </div>
                ${discount > 0 ? `
                  <div class="inv-total-row inv-tr-discount">
                    <span>Discount</span>
                    <span class="inv-total-num">-₹ ${formatCurrency(discount)}</span>
                  </div>
                ` : ''}
                <div class="inv-total-row inv-tr-cgst">
                  <span>CGST (9%)</span>
                  <span class="inv-total-num">₹ ${formatCurrency(cgstAmount)}</span>
                </div>
                <div class="inv-total-row inv-tr-sgst">
                  <span>SGST (9%)</span>
                  <span class="inv-total-num">₹ ${formatCurrency(sgstAmount)}</span>
                </div>
                <div class="inv-grand-total-banner">
                  <span>Total Amount</span>
                  <span class="inv-grand-total-val">₹ ${formatCurrency(total)}</span>
                </div>
              </div>

              <div class="inv-words-container">
                <div class="inv-words-label">Amount in Words:</div>
                <div class="inv-words-val">${numberToWordsIndian(total)}</div>
              </div>
            </div>
          </div>

          <!-- Terms & Conditions + Authorized Signatory -->
          <div class="inv-bottom-section">
            <div class="inv-terms-col">
              <div class="inv-section-title">Terms &amp; Conditions</div>
              <ol class="inv-terms-list">
                ${termsListHtml}
              </ol>
            </div>

            <div class="inv-sign-col">
              <div class="inv-sign-entity">For Aarambhx Technology</div>
              <div class="inv-signature-box">
                <img src="assets/invoice-signature-real.png" class="inv-signature-img" alt="Lalith H Signature" crossorigin="anonymous">
              </div>
              <div class="inv-sign-rule"></div>
              <div class="inv-sign-label">Authorized Signatory</div>
            </div>
          </div>
        </div>

        <!-- 3. FOOTER STRIP (Precision replica) -->
        <div class="inv-bottom-footer-wrap">
          <div class="inv-footer-flex">
            <div class="inv-footer-info-col">
              <!-- Row 1: Contact items -->
              <div class="inv-footer-contact-row">
                <div class="inv-footer-contact-item">
                  <svg class="inv-footer-icon" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <span>lalithlalu.com@yahoo.com</span>
                </div>
                <span class="inv-footer-sep">|</span>
                <div class="inv-footer-contact-item">
                  <svg class="inv-footer-icon" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  <span>7676690081</span>
                </div>
                <span class="inv-footer-sep">|</span>
                <div class="inv-footer-contact-item">
                  <svg class="inv-footer-icon" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  <span>https://aarambhx-tech.web.app/</span>
                </div>
                <span class="inv-footer-sep">|</span>
                <div class="inv-footer-contact-item">
                  <svg class="inv-footer-icon" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span>Tumkur, Karnataka, India</span>
                </div>
              </div>

              <!-- Row 2: Brand Tagline -->
              <div class="inv-footer-brand-row">
                <div class="inv-footer-gold-bar"></div>
                <div class="inv-footer-brand-text">AARAMBHX TECHNOLOGY &nbsp;|&nbsp; AARAMBHX ACADEMY</div>
              </div>
            </div>

            <!-- Right Gold Wedge -->
            <div class="inv-footer-gold-wedge">
              <div class="inv-wedge-text">
                TECHNOLOGY<br>
                FOR A BRIGHTER<br>
                TOMORROW
              </div>
              <div class="inv-wedge-bar"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    if (modalPrintInvoice) modalPrintInvoice.classList.add('open');
    if (window.lucide) window.lucide.createIcons();
  };

  if (btnClosePrintInvoice && modalPrintInvoice) {
    btnClosePrintInvoice.addEventListener('click', () => modalPrintInvoice.classList.remove('open'));
  }

  // Direct Client-Side PDF Downloader (html2pdf with fallback to window.print)
  function downloadInvoicePDF() {
    const invoiceEl = document.getElementById('printableInvoiceNode');
    if (!invoiceEl) return;

    const docType = (activePrintInvoice && activePrintInvoice.type) || 'Invoice';
    const docNum = (activePrintInvoice && activePrintInvoice.invoiceNumber) || 'Doc';
    const safeFilename = `AarambhX_${docType}_${docNum}.pdf`.replace(/[^a-zA-Z0-9_\-\.]/g, '_');

    showToast(`Generating ${docType} PDF...`, 'info');

    if (typeof html2pdf !== 'undefined') {
      const opt = {
        margin: [0, 0, 0, 0],
        filename: safeFilename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 3, // 300 DPI Ultra-HD
          useCORS: true,
          scrollY: 0,
          letterRendering: true,
          logging: false
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        }
      };

      html2pdf().set(opt).from(invoiceEl).save().then(() => {
        showToast(`${docType} PDF downloaded successfully!`, 'success');
      }).catch(err => {
        console.warn('html2pdf generation error, falling back to window.print():', err);
        window.print();
      });
    } else {
      window.print();
    }
  }

  if (btnPrintInvoiceAction) {
    btnPrintInvoiceAction.addEventListener('click', () => {
      downloadInvoicePDF();
    });
  }

  if (btnDirectPrintAction) {
    btnDirectPrintAction.addEventListener('click', () => {
      window.print();
    });
  }

  if (btnShareInvoiceWhatsApp) {
    btnShareInvoiceWhatsApp.addEventListener('click', () => {
      if (!activePrintInvoice) return;
      const cleanPhone = activePrintInvoice.clientPhone.replace(/\D/g, '');
      const text = `Greetings ${activePrintInvoice.clientName}, your official ${activePrintInvoice.type} (${activePrintInvoice.invoiceNumber}) from AarambhX Technology is ready. Total: ₹${activePrintInvoice.total.toLocaleString('en-IN')}. Pay via UPI: mohitgujjar07@okhdfcbank. Thank you!`;
      window.open(`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
      showToast('WhatsApp launched with invoice summary', 'success');
    });
  }

  // Simple High-Fidelity SVG QR Generator matching the corporate template
  function generateSimpleQRCodeSvg(data) {
    const safeData = escapeHtml(data);
    return `
      <svg width="105" height="105" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="display:block; background:#ffffff;">
        <rect width="100" height="100" fill="#ffffff"/>
        
        <!-- Corner Finder Patterns -->
        <!-- Top-Left -->
        <rect x="4" y="4" width="28" height="28" rx="3" fill="#0E131F"/>
        <rect x="8" y="8" width="20" height="20" rx="2" fill="#ffffff"/>
        <rect x="12" y="12" width="12" height="12" rx="1.5" fill="#0E131F"/>

        <!-- Top-Right -->
        <rect x="68" y="4" width="28" height="28" rx="3" fill="#0E131F"/>
        <rect x="72" y="8" width="20" height="20" rx="2" fill="#ffffff"/>
        <rect x="76" y="12" width="12" height="12" rx="1.5" fill="#0E131F"/>

        <!-- Bottom-Left -->
        <rect x="4" y="68" width="28" height="28" rx="3" fill="#0E131F"/>
        <rect x="8" y="72" width="20" height="20" rx="2" fill="#ffffff"/>
        <rect x="12" y="76" width="12" height="12" rx="1.5" fill="#0E131F"/>

        <!-- High-Density Module Matrix -->
        <rect x="36" y="6" width="4" height="4" fill="#0E131F"/>
        <rect x="44" y="6" width="4" height="4" fill="#0E131F"/>
        <rect x="52" y="6" width="8" height="4" fill="#0E131F"/>
        <rect x="36" y="14" width="8" height="4" fill="#0E131F"/>
        <rect x="48" y="14" width="4" height="4" fill="#0E131F"/>
        <rect x="56" y="14" width="4" height="4" fill="#0E131F"/>

        <!-- Alignment Module -->
        <rect x="68" y="68" width="16" height="16" rx="2" fill="#0E131F"/>
        <rect x="72" y="72" width="8" height="8" rx="1" fill="#ffffff"/>
        <rect x="74" y="74" width="4" height="4" rx="0.5" fill="#0E131F"/>

        <!-- Timing Patterns -->
        <rect x="36" y="24" width="4" height="4" fill="#0E131F"/>
        <rect x="44" y="24" width="4" height="4" fill="#0E131F"/>
        <rect x="52" y="24" width="4" height="4" fill="#0E131F"/>
        <rect x="60" y="24" width="4" height="4" fill="#0E131F"/>
        <rect x="24" y="36" width="4" height="4" fill="#0E131F"/>
        <rect x="24" y="44" width="4" height="4" fill="#0E131F"/>
        <rect x="24" y="52" width="4" height="4" fill="#0E131F"/>
        <rect x="24" y="60" width="4" height="4" fill="#0E131F"/>

        <!-- Mid Matrix -->
        <rect x="6" y="36" width="6" height="4" fill="#0E131F"/>
        <rect x="16" y="36" width="4" height="4" fill="#0E131F"/>
        <rect x="6" y="44" width="4" height="6" fill="#0E131F"/>
        <rect x="14" y="48" width="6" height="4" fill="#0E131F"/>
        <rect x="6" y="56" width="4" height="4" fill="#0E131F"/>
        <rect x="14" y="56" width="6" height="4" fill="#0E131F"/>

        <rect x="74" y="36" width="8" height="4" fill="#0E131F"/>
        <rect x="86" y="36" width="6" height="4" fill="#0E131F"/>
        <rect x="70" y="44" width="4" height="6" fill="#0E131F"/>
        <rect x="78" y="44" width="6" height="4" fill="#0E131F"/>
        <rect x="88" y="48" width="6" height="4" fill="#0E131F"/>
        <rect x="74" y="56" width="4" height="6" fill="#0E131F"/>
        <rect x="84" y="56" width="8" height="4" fill="#0E131F"/>

        <!-- Bottom Data Matrix -->
        <rect x="36" y="74" width="6" height="4" fill="#0E131F"/>
        <rect x="46" y="74" width="4" height="4" fill="#0E131F"/>
        <rect x="54" y="74" width="8" height="4" fill="#0E131F"/>
        <rect x="36" y="82" width="4" height="6" fill="#0E131F"/>
        <rect x="44" y="82" width="8" height="4" fill="#0E131F"/>
        <rect x="56" y="82" width="6" height="4" fill="#0E131F"/>
        <rect x="36" y="90" width="8" height="4" fill="#0E131F"/>
        <rect x="48" y="90" width="4" height="4" fill="#0E131F"/>
        <rect x="56" y="90" width="8" height="4" fill="#0E131F"/>

        <!-- Center Emblem (AarambhX Triangle Brand Logo) -->
        <circle cx="50" cy="50" r="13" fill="#ffffff"/>
        <circle cx="50" cy="50" r="11" fill="#0E131F"/>
        <path d="M50 42L43 54H57L50 42Z" fill="#F59E0B"/>
        <path d="M50 44L45 53H55L50 44Z" fill="#10B981"/>
      </svg>
    `;
  }

  // =========================================================================
  // 8. MODULE: CERTIFICATES & VERIFIABLE QR CODES
  // =========================================================================
  function renderCertificates() {
    const tableBody = document.getElementById('certificatesTableBody');
    if (!tableBody) return;

    const certs = Store.getCertificates();
    if (!certs.length) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 28px; color: var(--adm-text-subtle);">No certificates issued yet.</td></tr>`;
      return;
    }

    tableBody.innerHTML = certs.map(c => {
      const isVerified = c.status === 'Verified';
      return `
        <tr>
          <td><span style="font-family: monospace; font-weight: 700; color: var(--ax-blue);">${escapeHtml(c.id)}</span></td>
          <td><strong>${escapeHtml(c.studentName)}</strong></td>
          <td>${escapeHtml(c.institution)}</td>
          <td>${escapeHtml(c.track)}</td>
          <td>${escapeHtml(c.issueDate)}</td>
          <td>
            <span class="badge-status ${isVerified ? 'badge-closed' : 'badge-new'}">${escapeHtml(c.status)}</span>
          </td>
          <td>
            <button type="button" class="ax-btn-secondary" onclick="window.previewCertificate('${c.id}')" style="padding: 6px 10px;">
              <i data-lucide="printer"></i> Print Certificate
            </button>
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  // Quick Verifier Lookup
  const btnVerifyLookup = document.getElementById('btnVerifyLookup');
  const verifyLookupInput = document.getElementById('verifyLookupInput');
  const verifyResultBox = document.getElementById('verifyResultBox');

  if (btnVerifyLookup && verifyLookupInput && verifyResultBox) {
    btnVerifyLookup.addEventListener('click', () => {
      const queryId = verifyLookupInput.value.trim();
      if (!queryId) return;

      const cert = Store.verifyCertificate(queryId);
      if (cert) {
        verifyResultBox.style.display = 'block';
        verifyResultBox.innerHTML = `
          <div style="padding: 16px; background: rgba(5, 150, 105, 0.1); border: 1px solid var(--ax-emerald); border-radius: 12px; margin-top: 14px;">
            <div style="display: flex; align-items: center; justify-content:space-between; color: var(--ax-emerald); font-weight: 700; margin-bottom: 8px;">
              <span style="display:inline-flex; align-items:center; gap:6px;"><i data-lucide="shield-check"></i> Authentic Certificate Record Found</span>
              <button type="button" class="ax-btn-secondary" onclick="window.previewCertificate('${cert.id}')" style="height:26px; font-size:0.75rem;">Print &rarr;</button>
            </div>
            <p><strong>Student Name:</strong> ${escapeHtml(cert.studentName)}</p>
            <p><strong>Certificate ID:</strong> <span style="font-family: monospace;">${escapeHtml(cert.id)}</span></p>
            <p><strong>Institution:</strong> ${escapeHtml(cert.institution)}</p>
            <p><strong>Track:</strong> ${escapeHtml(cert.track)}</p>
            <p><strong>Issue Date:</strong> ${escapeHtml(cert.issueDate)} (${escapeHtml(cert.grade || 'Passed')})</p>
          </div>
        `;
      } else {
        verifyResultBox.style.display = 'block';
        verifyResultBox.innerHTML = `
          <div style="padding: 16px; background: rgba(225, 29, 72, 0.1); border: 1px solid var(--ax-rose); border-radius: 12px; margin-top: 14px; color: var(--ax-rose);">
            <i data-lucide="alert-triangle"></i> No verified certificate found matching ID: "<strong>${escapeHtml(queryId)}</strong>".
          </div>
        `;
      }
      if (window.lucide) window.lucide.createIcons();
    });
  }

  // Modal Issue Certificate
  const modalCert = document.getElementById('modalIssueCert');
  const btnOpenCertModal = document.getElementById('btnOpenCertModal');
  const btnCloseCertModal = document.getElementById('btnCloseCertModal');
  const formIssueCert = document.getElementById('formIssueCert');

  if (btnOpenCertModal && modalCert) {
    btnOpenCertModal.addEventListener('click', () => {
      const trackCode = (document.getElementById('certTrack') ? document.getElementById('certTrack').value : 'AIML').slice(0, 4);
      const generatedId = Store.generateCertificateId(trackCode);
      const idInput = document.getElementById('certCustomId');
      if (idInput) idInput.value = generatedId;
      modalCert.classList.add('open');
    });
  }
  if (btnCloseCertModal && modalCert) {
    btnCloseCertModal.addEventListener('click', () => modalCert.classList.remove('open'));
  }
  if (formIssueCert) {
    formIssueCert.addEventListener('submit', (e) => {
      e.preventDefault();
      const newCert = Store.issueCertificate({
        id: document.getElementById('certCustomId').value,
        studentName: document.getElementById('certStudentName').value,
        institution: document.getElementById('certInstitution').value,
        track: document.getElementById('certTrack').value,
        issueDate: document.getElementById('certDate').value || new Date().toISOString().slice(0, 10),
        grade: document.getElementById('certGrade').value
      });

      formIssueCert.reset();
      modalCert.classList.remove('open');
      showToast(`Certificate ${newCert.id} issued successfully!`, 'success');
      renderCertificates();
      renderOverview();
      window.previewCertificate(newCert.id);
    });
  }

  // Printable Certificate Preview Modal
  const modalPrintCert = document.getElementById('modalPrintCert');
  const btnClosePrintCert = document.getElementById('btnClosePrintCertModal');
  const certPrintContainer = document.getElementById('certPrintContainer');
  const btnPrintCertBtn = document.getElementById('btnPrintCertBtn');

  window.previewCertificate = function (certId) {
    const certs = Store.getCertificates();
    activePrintCert = certs.find(c => c.id === certId);
    if (!activePrintCert || !certPrintContainer) return;

    const verifyUrl = `${window.location.origin}/verify.html?id=${encodeURIComponent(activePrintCert.id)}`;
    const qrSvg = generateSimpleQRCodeSvg(verifyUrl);

    certPrintContainer.innerHTML = `
      <div class="printable-cert-card" id="printableCertNode">
        <div class="cert-ornate-border">
          <div class="cert-inner-frame">
            
            <div class="cert-brand-top">
              <div style="display:flex; align-items:center; justify-content:center; gap: 10px; margin-bottom: 6px;">
                <img src="assets/aarambhx-logo.jpg" alt="AarambhX Logo" width="44" height="44" style="border-radius:8px;">
                <h2 style="font-family: var(--font-display); font-size: 1.8rem; font-weight:800; margin:0; letter-spacing:-0.02em;">AarambhX <span style="color:#2563EB;">Academy</span></h2>
              </div>
              <p style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.15em; color: var(--adm-text-subtle); margin:0;">
                Center for Industrial Hardware Rigs &amp; AI Systems Acceleration
              </p>
            </div>

            <div class="cert-badge-ribbon">CERTIFICATE OF INDUSTRIAL EXCELLENCE</div>

            <p style="font-size: 0.95rem; color: var(--adm-text-muted); margin-top: 14px; margin-bottom: 4px;">This is to proudly certify that</p>
            <h1 class="cert-student-hero">${escapeHtml(activePrintCert.studentName)}</h1>

            <p style="font-size: 0.925rem; color: var(--adm-text-muted); max-width: 580px; margin: 0 auto 12px; line-height: 1.5;">
              has rigorously completed the advanced hands-on technical workshop track in
            </p>

            <h3 class="cert-track-hero">${escapeHtml(activePrintCert.track)}</h3>

            <p style="font-size: 0.875rem; color: var(--adm-text-muted); margin-top: 8px;">
              Conducted at <strong>${escapeHtml(activePrintCert.institution)}</strong> &bull; Grade: <strong>${escapeHtml(activePrintCert.grade || 'First Class Distinction')}</strong>
            </p>

            <div class="cert-bottom-grid">
              <div style="text-align: left;">
                <div class="cert-qr-wrap">${qrSvg}</div>
                <div style="font-size: 0.65rem; color: var(--adm-text-subtle); margin-top: 4px; font-family: monospace;">
                  Scan with Camera to Verify<br>
                  ID: ${escapeHtml(activePrintCert.id)}
                </div>
              </div>

              <div class="cert-gold-seal-wrap">
                <div class="cert-gold-seal">
                  <span>★ AARAMBHX ★<br>OFFICIAL<br>SEAL</span>
                </div>
              </div>

              <div style="text-align: right;">
                <div class="cert-signature-line">Mohit Gujjar</div>
                <div style="font-size: 0.75rem; font-weight:700; color:#0F172A;">Lead Technology Architect</div>
                <div style="font-size: 0.7rem; color:var(--adm-text-subtle);">AarambhX Technology &bull; Date: ${escapeHtml(activePrintCert.issueDate)}</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    `;

    if (modalPrintCert) modalPrintCert.classList.add('open');
    if (window.lucide) window.lucide.createIcons();
  };

  if (btnClosePrintCert && modalPrintCert) {
    btnClosePrintCert.addEventListener('click', () => modalPrintCert.classList.remove('open'));
  }

  if (btnPrintCertBtn) {
    btnPrintCertBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // =========================================================================
  // 9. MODULE: TESTIMONIALS & REVIEWS
  // =========================================================================
  function renderTestimonials() {
    const grid = document.getElementById('testimonialsCardsGrid');
    if (!grid) return;

    const testimonials = Store.getTestimonials();
    if (!testimonials.length) {
      grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--adm-text-subtle); padding: 40px;">No testimonials added yet.</p>`;
      return;
    }

    grid.innerHTML = testimonials.map(t => {
      const stars = '★'.repeat(t.rating || 5) + '☆'.repeat(Math.max(0, 5 - (t.rating || 5)));
      return `
        <div class="ax-panel" style="padding: 20px; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 8px;">
              <span style="color: #F59E0B; font-size: 1.1rem; letter-spacing: 2px;">${stars}</span>
              <button type="button" class="badge-status ${t.approved ? 'badge-closed' : 'badge-contacted'}" onclick="window.toggleTestimonial('${t.id}')" style="cursor:pointer; border:none;">
                ${t.approved ? 'Approved' : 'Pending'}
              </button>
            </div>
            <p style="font-size: 0.9rem; color: var(--adm-text); font-style: italic; margin-bottom: 14px; line-height: 1.5;">
              "${escapeHtml(t.content)}"
            </p>
          </div>
          <div style="border-top: 1px solid var(--adm-border); padding-top: 10px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong style="font-size: 0.9rem; display:block;">${escapeHtml(t.name)}</strong>
              <small style="color: var(--adm-text-subtle);">${escapeHtml(t.role)} &bull; ${escapeHtml(t.organization)}</small>
            </div>
            <button type="button" class="ax-btn-secondary" onclick="window.deleteTestimonial('${t.id}')" style="color:var(--ax-rose); padding: 4px 6px;">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  window.toggleTestimonial = function (id) {
    const approved = Store.toggleTestimonialApproval(id);
    showToast(`Testimonial marked ${approved ? 'Approved' : 'Pending'}`, 'info');
    renderTestimonials();
  };

  window.deleteTestimonial = function (id) {
    if (confirm('Delete this testimonial?')) {
      Store.deleteTestimonial(id);
      showToast('Testimonial deleted', 'info');
      renderTestimonials();
    }
  };

  const modalAddTestimonial = document.getElementById('modalAddTestimonial');
  const btnOpenTestimonialModal = document.getElementById('btnOpenTestimonialModal');
  const btnCloseTestimonialModal = document.getElementById('btnCloseTestimonialModal');
  const formAddTestimonial = document.getElementById('formAddTestimonial');

  if (btnOpenTestimonialModal && modalAddTestimonial) {
    btnOpenTestimonialModal.addEventListener('click', () => modalAddTestimonial.classList.add('open'));
  }
  if (btnCloseTestimonialModal && modalAddTestimonial) {
    btnCloseTestimonialModal.addEventListener('click', () => modalAddTestimonial.classList.remove('open'));
  }
  if (formAddTestimonial) {
    formAddTestimonial.addEventListener('submit', (e) => {
      e.preventDefault();
      Store.saveTestimonial({
        name: document.getElementById('testiName').value,
        role: document.getElementById('testiRole').value,
        organization: document.getElementById('testiOrg').value,
        rating: document.getElementById('testiRating').value,
        content: document.getElementById('testiContent').value,
        approved: document.getElementById('testiApproved').checked
      });
      formAddTestimonial.reset();
      modalAddTestimonial.classList.remove('open');
      showToast('Testimonial added successfully!', 'success');
      renderTestimonials();
    });
  }

  // =========================================================================
  // 10. MODULE: PRICING & DIAGNOSTICS CATALOG
  // =========================================================================
  function renderCatalog() {
    const grid = document.getElementById('catalogCardsGrid');
    if (!grid) return;

    const catalog = Store.getCatalog();
    if (!catalog.length) {
      grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--adm-text-subtle); padding: 40px;">No catalog services defined.</p>`;
      return;
    }

    grid.innerHTML = catalog.map(item => {
      return `
        <div class="item-card">
          <div class="item-card-body">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 8px;">
              <span class="item-category-chip">${escapeHtml(item.category)}</span>
              <span class="badge-status ${item.active ? 'badge-closed' : 'badge-new'}">${item.active ? 'Active' : 'Archived'}</span>
            </div>
            <h4 class="item-title" style="margin-bottom: 6px;">${escapeHtml(item.title)}</h4>
            <div style="display:flex; align-items:baseline; gap: 6px; margin-bottom: 10px;">
              <span style="font-size: 1.35rem; font-weight: 800; color: #2563EB;">₹${(item.basePrice || 0).toLocaleString('en-IN')}</span>
              <span style="font-size: 0.775rem; color: var(--adm-text-subtle);">starting rate</span>
            </div>
            <p style="font-size: 0.825rem; color: var(--adm-text-muted); margin-bottom: 12px; line-height: 1.5;">${escapeHtml(item.description)}</p>
            <div style="border-top: 1px solid var(--adm-border); padding-top: 10px; display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size: 0.775rem; color: var(--adm-text-subtle);"><i data-lucide="clock" style="width:12px; height:12px; vertical-align:middle;"></i> ${escapeHtml(item.turnaround)}</span>
              <button type="button" class="ax-btn-secondary" onclick="window.deleteCatalogItem('${item.id}')" style="color:var(--ax-rose); padding: 4px 6px;">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  window.deleteCatalogItem = function (id) {
    if (confirm('Delete this catalog item?')) {
      Store.deleteCatalogItem(id);
      showToast('Catalog item removed', 'info');
      renderCatalog();
    }
  };

  const modalAddCatalog = document.getElementById('modalAddCatalog');
  const btnOpenCatalogModal = document.getElementById('btnOpenCatalogModal');
  const btnCloseCatalogModal = document.getElementById('btnCloseCatalogModal');
  const formAddCatalog = document.getElementById('formAddCatalog');

  if (btnOpenCatalogModal && modalAddCatalog) {
    btnOpenCatalogModal.addEventListener('click', () => modalAddCatalog.classList.add('open'));
  }
  if (btnCloseCatalogModal && modalAddCatalog) {
    btnCloseCatalogModal.addEventListener('click', () => modalAddCatalog.classList.remove('open'));
  }
  if (formAddCatalog) {
    formAddCatalog.addEventListener('submit', (e) => {
      e.preventDefault();
      Store.saveCatalogItem({
        title: document.getElementById('catTitle').value,
        category: document.getElementById('catCategory').value,
        basePrice: document.getElementById('catBasePrice').value,
        turnaround: document.getElementById('catTurnaround').value,
        description: document.getElementById('catDescription').value,
        active: document.getElementById('catActive').checked
      });
      formAddCatalog.reset();
      modalAddCatalog.classList.remove('open');
      showToast('Service added to pricing catalog!', 'success');
      renderCatalog();
    });
  }

  // =========================================================================
  // 11. MODULE: SETTINGS, CLOUD SYNC & SNAPSHOT BACKUP
  // =========================================================================
  function renderAuditTrail() {
    const tbody = document.getElementById('auditTrailTableBody');
    if (!tbody) return;
    const logs = Store.getAuditTrail();
    if (!logs.length) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--adm-text-subtle); padding:16px;">No audit events recorded yet.</td></tr>';
      return;
    }
    tbody.innerHTML = logs.map(l => {
      const time = new Date(l.timestamp).toLocaleString('en-IN');
      const detailsStr = typeof l.details === 'object' ? JSON.stringify(l.details) : String(l.details || '');
      const isAlert = l.action.includes('REJECTED') || l.action.includes('FAILED');
      const colorStyle = isAlert ? 'color: var(--ax-rose); font-weight:700;' : 'font-weight:600;';
      return `
        <tr>
          <td style="font-size:0.775rem; color:var(--adm-text-subtle); white-space:nowrap;">${escapeHtml(time)}</td>
          <td style="${colorStyle}">${escapeHtml(l.action)}</td>
          <td style="font-size:0.8rem;">${escapeHtml(l.user || 'System')}</td>
          <td style="font-size:0.775rem; font-family:monospace; color:var(--adm-text-muted); max-width:260px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${escapeHtml(detailsStr)}">${escapeHtml(detailsStr)}</td>
        </tr>
      `;
    }).join('');
  }

  const btnRefreshAuditLog = document.getElementById('btnRefreshAuditLog');
  if (btnRefreshAuditLog) {
    btnRefreshAuditLog.addEventListener('click', () => {
      renderAuditTrail();
      showToast('Audit trail refreshed', 'info');
    });
  }

  function renderSettings() {
    const settings = Store.getSettings();
    const cloudProjInput = document.getElementById('cloudProjectId');
    const cloudKeyInput = document.getElementById('cloudApiKey');
    const cloudStatusLabel = document.getElementById('cloudStatusLabel');

    if (cloudProjInput) cloudProjInput.value = (settings.firebaseConfig && settings.firebaseConfig.projectId) || '';
    if (cloudKeyInput) cloudKeyInput.value = (settings.firebaseConfig && settings.firebaseConfig.apiKey) || '';
    if (cloudStatusLabel) {
      if (settings.firebaseConfig && settings.firebaseConfig.projectId) {
        cloudStatusLabel.textContent = `Connected to Firebase Cloud (${settings.firebaseConfig.projectId})`;
      } else {
        cloudStatusLabel.textContent = 'Operating in Resilient Local Storage Mode (Offline-First)';
      }
    }
    renderAuditTrail();
  }

  // Export Full JSON Backup
  const btnExportBackup = document.getElementById('btnExportBackup');
  if (btnExportBackup) {
    btnExportBackup.addEventListener('click', () => {
      const json = Store.exportAllJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aarambhx_full_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Complete JSON backup downloaded!', 'success');
    });
  }

  // Import JSON Backup
  const inputImportBackup = document.getElementById('inputImportBackup');
  if (inputImportBackup) {
    inputImportBackup.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = Store.importFullBackup(event.target.result);
        if (result.success) {
          showToast('Backup restored successfully!', 'success');
          renderDashboard();
        } else {
          showToast('Failed to restore backup: ' + result.message, 'error');
        }
      };
      reader.readAsText(file);
      inputImportBackup.value = '';
    });
  }

  // Reset Factory
  const btnResetFactory = document.getElementById('btnResetFactory');
  if (btnResetFactory) {
    btnResetFactory.addEventListener('click', () => {
      if (confirm('CAUTION: Reset all databases to default factory seeds? All custom data will be replaced.')) {
        Store.resetToFactoryDefaults();
        showToast('Reset to default factory seeds completed', 'info');
        renderDashboard();
      }
    });
  }

  // Change Passkey
  const formChangePasskey = document.getElementById('formChangePasskey');
  if (formChangePasskey) {
    formChangePasskey.addEventListener('submit', (e) => {
      e.preventDefault();
      const p1 = document.getElementById('newAdminPasskey').value;
      const p2 = document.getElementById('confirmAdminPasskey').value;
      if (p1 !== p2) {
        showToast('Passkeys do not match!', 'error');
        return;
      }
      if (Store.changePasskey(p1)) {
        formChangePasskey.reset();
        showToast('Admin passkey updated successfully!', 'success');
      } else {
        showToast('Passkey must be at least 6 characters', 'error');
      }
    });
  }

  // Save Cloud Config
  const formCloudConfig = document.getElementById('formCloudConfig');
  if (formCloudConfig) {
    formCloudConfig.addEventListener('submit', (e) => {
      e.preventDefault();
      const proj = document.getElementById('cloudProjectId').value.trim();
      const key = document.getElementById('cloudApiKey').value.trim();
      Store.saveSettings({
        firebaseConfig: {
          projectId: proj,
          apiKey: key,
          enabled: !!proj
        }
      });
      showToast('Cloud sync settings saved!', 'success');
      renderSettings();
    });
  }

  // Drag-and-Drop WebP Compressor Handler
  const demoDropzone = document.getElementById('demoDropzone');
  const demoDropzoneInput = document.getElementById('demoDropzoneInput');
  const demoDropzoneResult = document.getElementById('demoDropzoneResult');

  if (demoDropzone && demoDropzoneInput) {
    demoDropzone.addEventListener('click', () => demoDropzoneInput.click());
    demoDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      demoDropzone.style.borderColor = '#2563EB';
      demoDropzone.style.background = 'rgba(37, 99, 235, 0.05)';
    });
    demoDropzone.addEventListener('dragleave', () => {
      demoDropzone.style.borderColor = 'var(--adm-border)';
      demoDropzone.style.background = 'transparent';
    });
    demoDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      demoDropzone.style.borderColor = 'var(--adm-border)';
      demoDropzone.style.background = 'transparent';
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processClientWebp(e.dataTransfer.files[0]);
      }
    });
    demoDropzoneInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        processClientWebp(e.target.files[0]);
      }
    });
  }

  function processClientWebp(file) {
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'error');
      return;
    }
    const origSizeKb = (file.size / 1024).toFixed(1);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const webpDataUrl = canvas.toDataURL('image/webp', 0.85);
        const compressedBytes = Math.round((webpDataUrl.length * 3) / 4);
        const compSizeKb = (compressedBytes / 1024).toFixed(1);
        const savingsPct = Math.max(0, Math.round((1 - compSizeKb / origSizeKb) * 100));

        if (demoDropzoneResult) {
          demoDropzoneResult.style.display = 'block';
          demoDropzoneResult.innerHTML = `
            <div style="display:flex; align-items:center; gap: 14px; padding: 12px; background: var(--adm-pill-track); border-radius: 10px;">
              <img src="${webpDataUrl}" alt="Preview" style="width:54px; height:54px; object-fit:cover; border-radius:6px;">
              <div style="flex:1;">
                <strong style="font-size:0.85rem; color:var(--adm-text);">Optimized to Next-Gen WebP</strong>
                <p style="font-size:0.775rem; color:var(--adm-text-muted); margin-top:2px;">
                  ${origSizeKb} KB &rarr; <span style="color:#10B981; font-weight:700;">${compSizeKb} KB (-${savingsPct}%)</span>
                </p>
              </div>
              <span class="badge-status badge-closed" style="font-size:0.75rem;">Ready</span>
            </div>
          `;
        }
        showToast(`Image converted to WebP (-${savingsPct}% payload savings)`, 'success');
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  }

  // =========================================================================
  // 12. MODULE: PROJECTS & PORTFOLIO
  // =========================================================================
  function renderProjects() {
    const grid = document.getElementById('projectsCardsGrid');
    if (!grid) return;

    const projects = Store.getProjects();
    if (!projects.length) {
      grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--adm-text-subtle); padding: 40px;">No projects added yet.</p>`;
      return;
    }

    grid.innerHTML = projects.map(proj => {
      return `
        <div class="item-card">
          <div class="item-card-img" style="background-image: url('${escapeHtml(proj.image || 'assets/hero.webp')}');">
            ${proj.featured ? `<span class="badge-status badge-new" style="position:absolute; top:10px; right:10px; z-index:2;">Featured</span>` : ''}
          </div>
          <div class="item-card-body">
            <span class="item-category-chip">${escapeHtml(proj.category)}</span>
            <h4 class="item-title">${escapeHtml(proj.title)}</h4>
            <p class="item-desc">${escapeHtml(proj.description)}</p>
            <div class="item-tags">
              ${(proj.tags || []).map(t => `<span class="item-tag">${escapeHtml(t)}</span>`).join('')}
            </div>
            <div class="item-card-actions">
              ${proj.liveUrl ? `<a href="${escapeHtml(proj.liveUrl)}" target="_blank" rel="noopener" class="ax-btn-secondary" style="height:30px; font-size:0.75rem;">Live Demo ↗</a>` : '<span></span>'}
              <button class="ax-btn-secondary" onclick="window.deleteProject('${proj.id}')" style="height:30px; color:var(--ax-rose); padding: 0 8px;">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  window.deleteProject = function (id) {
    if (confirm('Delete this project?')) {
      Store.deleteProject(id);
      showToast('Project deleted', 'info');
      renderProjects();
      renderOverview();
    }
  };

  const modalProject = document.getElementById('modalAddProject');
  const btnOpenProjectModal = document.getElementById('btnOpenProjectModal');
  const btnCloseProjectModal = document.getElementById('btnCloseProjectModal');
  const formAddProject = document.getElementById('formAddProject');

  if (btnOpenProjectModal && modalProject) {
    btnOpenProjectModal.addEventListener('click', () => modalProject.classList.add('open'));
  }
  if (btnCloseProjectModal && modalProject) {
    btnCloseProjectModal.addEventListener('click', () => modalProject.classList.remove('open'));
  }
  if (formAddProject) {
    formAddProject.addEventListener('submit', (e) => {
      e.preventDefault();
      Store.saveProject({
        title: document.getElementById('projTitle').value,
        category: document.getElementById('projCategory').value,
        description: document.getElementById('projDesc').value,
        image: document.getElementById('projImage').value || 'assets/hero.webp',
        tags: document.getElementById('projTags').value,
        liveUrl: document.getElementById('projLiveUrl').value,
        featured: document.getElementById('projFeatured').checked
      });

      formAddProject.reset();
      modalProject.classList.remove('open');
      showToast('Project published to portfolio!', 'success');
      renderProjects();
      renderOverview();
    });
  }

  // =========================================================================
  // 13. MODULE: ACADEMY WORKSHOPS
  // =========================================================================
  function renderWorkshops() {
    const grid = document.getElementById('workshopsCardsGrid');
    if (!grid) return;

    const workshops = Store.getWorkshops();
    if (!workshops.length) {
      grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--adm-text-subtle); padding: 40px;">No scheduled workshops.</p>`;
      return;
    }

    grid.innerHTML = workshops.map(ws => {
      const pct = Math.min(100, Math.round((ws.seatsEnrolled / (ws.seatsTotal || 100)) * 100));
      return `
        <div class="item-card">
          <div class="item-card-body">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 8px;">
              <span class="item-category-chip">${escapeHtml(ws.track)}</span>
              <span class="badge-status badge-contacted">${escapeHtml(ws.status)}</span>
            </div>
            <h4 class="item-title">${escapeHtml(ws.title)}</h4>
            <p style="font-size: 0.85rem; color: var(--adm-text-muted); margin-bottom: 6px;">
              <i data-lucide="map-pin" style="width:14px; height:14px; vertical-align:middle;"></i> ${escapeHtml(ws.institution)}
            </p>
            <p style="font-size: 0.85rem; color: var(--adm-text-muted); margin-bottom: 14px;">
              <i data-lucide="calendar" style="width:14px; height:14px; vertical-align:middle;"></i> ${escapeHtml(ws.date)} &bull; ${escapeHtml(ws.duration)}
            </p>
            <div style="margin-bottom: 12px;">
              <div style="display:flex; justify-content:space-between; font-size: 0.8rem; margin-bottom: 4px;">
                <span>Enrollment</span>
                <strong>${ws.seatsEnrolled} / ${ws.seatsTotal} (${pct}%)</strong>
              </div>
              <div style="height: 6px; background: var(--adm-pill-track); border-radius: 9999px; overflow: hidden;">
                <div style="width: ${pct}%; height: 100%; background: var(--ax-blue);"></div>
              </div>
            </div>
            <div class="item-card-actions">
              <span></span>
              <button class="ax-btn-secondary" onclick="window.deleteWorkshop('${ws.id}')" style="height:30px; color:var(--ax-rose); padding: 0 8px;">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  window.deleteWorkshop = function (id) {
    if (confirm('Delete this workshop?')) {
      Store.deleteWorkshop(id);
      showToast('Workshop deleted', 'info');
      renderWorkshops();
      renderOverview();
    }
  };

  const modalWorkshop = document.getElementById('modalAddWorkshop');
  const btnOpenWorkshopModal = document.getElementById('btnOpenWorkshopModal');
  const btnCloseWorkshopModal = document.getElementById('btnCloseWorkshopModal');
  const formAddWorkshop = document.getElementById('formAddWorkshop');

  if (btnOpenWorkshopModal && modalWorkshop) {
    btnOpenWorkshopModal.addEventListener('click', () => modalWorkshop.classList.add('open'));
  }
  if (btnCloseWorkshopModal && modalWorkshop) {
    btnCloseWorkshopModal.addEventListener('click', () => modalWorkshop.classList.remove('open'));
  }
  if (formAddWorkshop) {
    formAddWorkshop.addEventListener('submit', (e) => {
      e.preventDefault();
      Store.saveWorkshop({
        title: document.getElementById('wsTitle').value,
        track: document.getElementById('wsTrack').value,
        institution: document.getElementById('wsInstitution').value,
        date: document.getElementById('wsDate').value,
        duration: document.getElementById('wsDuration').value,
        seatsTotal: document.getElementById('wsSeatsTotal').value,
        seatsEnrolled: document.getElementById('wsSeatsEnrolled').value,
        status: document.getElementById('wsStatus').value
      });

      formAddWorkshop.reset();
      modalWorkshop.classList.remove('open');
      showToast('Workshop scheduled successfully!', 'success');
      renderWorkshops();
      renderOverview();
    });
  }

  // =========================================================================
  // 14. MODULE: REELS & MEDIA SHOWCASE
  // =========================================================================
  function renderReels() {
    const list = document.getElementById('reelsCardsList');
    if (!list) return;

    const reels = Store.getReels();
    if (!reels.length) {
      list.innerHTML = `<p style="text-align: center; color: var(--adm-text-subtle); padding: 32px;">No reels added yet.</p>`;
      return;
    }

    list.innerHTML = reels.map(r => {
      return `
        <div class="ax-panel" style="margin-bottom: 12px; padding: 16px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <span class="badge-status badge-contacted" style="margin-bottom: 6px;">${escapeHtml(r.category)}</span>
              <h4 style="font-size: 1rem; margin-bottom: 4px;">${escapeHtml(r.title)}</h4>
              <p style="font-size: 0.825rem; color: var(--adm-text-muted);">${escapeHtml(r.caption)}</p>
              ${r.url ? `<a href="${escapeHtml(r.url)}" target="_blank" rel="noopener" style="font-size: 0.775rem; color: var(--ax-blue);">Open Link ↗</a>` : ''}
            </div>
            <button class="ax-btn-secondary" onclick="window.deleteReel('${r.id}')" style="color: var(--ax-rose);">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  window.deleteReel = function (id) {
    if (confirm('Delete this reel entry?')) {
      Store.deleteReel(id);
      showToast('Reel removed', 'info');
      renderReels();
    }
  };

  const formAddReel = document.getElementById('formAddReel');
  if (formAddReel) {
    formAddReel.addEventListener('submit', (e) => {
      e.preventDefault();
      Store.saveReel({
        title: document.getElementById('reelTitle').value,
        category: document.getElementById('reelCategory').value,
        url: document.getElementById('reelUrl').value,
        caption: document.getElementById('reelCaption').value
      });
      formAddReel.reset();
      showToast('Reel added to showcase!', 'success');
      renderReels();
    });
  }

  // =========================================================================
  // 15. MODULE: LIVE ANNOUNCEMENT BANNER
  // =========================================================================
  function renderBannerControl() {
    const banner = Store.getAlertBanner();
    const activeToggle = document.getElementById('bannerActiveToggle');
    const themeSelect = document.getElementById('bannerThemeSelect');
    const pageScopeSelect = document.getElementById('bannerPageScopeSelect');
    const badgeInput = document.getElementById('bannerBadgeInput');
    const badgePulseToggle = document.getElementById('bannerBadgePulseToggle');
    const textInput = document.getElementById('bannerTextInput');
    const countdownToggle = document.getElementById('bannerCountdownToggle');
    const countdownRow = document.getElementById('bannerCountdownRow');
    const countdownDateInput = document.getElementById('bannerCountdownDate');
    const ctaTextInput = document.getElementById('bannerCtaTextInput');
    const ctaLinkInput = document.getElementById('bannerCtaLinkInput');

    if (activeToggle) activeToggle.checked = !!banner.active;
    if (themeSelect) themeSelect.value = banner.theme || banner.tone || 'gold';
    if (pageScopeSelect) pageScopeSelect.value = banner.pageScope || 'all';
    if (badgeInput) badgeInput.value = banner.badgeText || 'LIVE NOW';
    if (badgePulseToggle) badgePulseToggle.checked = banner.badgePulse !== false;
    if (textInput) textInput.value = banner.text || '';
    if (countdownToggle) countdownToggle.checked = !!banner.enableCountdown;
    if (countdownRow) countdownRow.style.display = banner.enableCountdown ? 'grid' : 'none';
    if (countdownDateInput) countdownDateInput.value = banner.countdownDate || '';
    if (ctaTextInput) ctaTextInput.value = banner.ctaText || '';
    if (ctaLinkInput) ctaLinkInput.value = banner.ctaLink || '';

    updateBannerPreview();
  }

  function updateBannerPreview() {
    const previewBox = document.getElementById('bannerPreviewBox');
    if (!previewBox) return;

    const active = document.getElementById('bannerActiveToggle')?.checked;
    const theme = document.getElementById('bannerThemeSelect')?.value || 'gold';
    const badgeText = document.getElementById('bannerBadgeInput')?.value || 'LIVE NOW';
    const badgePulse = document.getElementById('bannerBadgePulseToggle')?.checked;
    const text = document.getElementById('bannerTextInput')?.value || '';
    const enableCountdown = document.getElementById('bannerCountdownToggle')?.checked;
    const ctaText = document.getElementById('bannerCtaTextInput')?.value || '';
    const ctaLink = document.getElementById('bannerCtaLinkInput')?.value || '#';

    if (!active) {
      previewBox.innerHTML = `<div style="padding: 18px; text-align: center; color: var(--adm-text-subtle); background: var(--adm-pill-track); border-radius: 10px; border: 1px dashed var(--adm-card-border); font-size: 0.9rem;">
        <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#94a3b8; margin-right:8px;"></span>
        Announcement Banner is currently <strong>INACTIVE</strong> on public website.
      </div>`;
      return;
    }

    let borderColor = '#D97706';
    let pulseColor = '#F59E0B';
    let ctaBg = 'linear-gradient(135deg, #F59E0B, #D97706)';
    let ctaColor = '#0b0f19';
    let badgeBg = 'rgba(245, 158, 11, 0.15)';
    let badgeBorder = 'rgba(245, 158, 11, 0.4)';
    let badgeColor = '#FBBF24';

    if (theme === 'neon') {
      borderColor = '#06B6D4';
      pulseColor = '#06B6D4';
      ctaBg = 'linear-gradient(135deg, #06B6D4, #10B981)';
      ctaColor = '#061727';
      badgeBg = 'rgba(6, 182, 212, 0.15)';
      badgeBorder = 'rgba(6, 182, 212, 0.4)';
      badgeColor = '#38BDF8';
    } else if (theme === 'crimson') {
      borderColor = '#EF4444';
      pulseColor = '#EF4444';
      ctaBg = 'linear-gradient(135deg, #EF4444, #DC2626)';
      ctaColor = '#ffffff';
      badgeBg = 'rgba(239, 68, 68, 0.15)';
      badgeBorder = 'rgba(239, 68, 68, 0.4)';
      badgeColor = '#FCA5A5';
    }

    let countdownHtml = '';
    if (enableCountdown) {
      countdownHtml = `<div style="display:inline-flex; align-items:center; gap:6px; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.12); padding: 3px 10px; border-radius: 9999px; font-family: monospace; font-size: 0.78rem; color:#f8fafc; letter-spacing:0.04em;">
        <span style="opacity:0.7;">⏱</span> <span>02d : 14h : 35m : 10s</span>
      </div>`;
    }

    previewBox.innerHTML = `
      <div style="background: rgba(8, 12, 22, 0.96); color: #ffffff; padding: 10px 18px; border-radius: 10px; border: 1px solid ${borderColor}; box-shadow: 0 4px 20px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; font-size: 0.84rem;">
        <div style="display:flex; align-items:center; gap: 10px; flex-wrap: wrap;">
          <span style="display:inline-flex; align-items:center; gap:6px; background:${badgeBg}; border:1px solid ${badgeBorder}; color:${badgeColor}; padding: 3px 9px; border-radius: 9999px; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.04em;">
            ${badgePulse ? `<span style="width:7px; height:7px; border-radius:50%; background:${pulseColor}; box-shadow:0 0 8px ${pulseColor};"></span>` : ''}
            ${escapeHtml(badgeText || 'LIVE NOW')}
          </span>
          <span style="font-weight: 500; color: #f1f5f9;">${escapeHtml(text || 'Your announcement message will appear here.')}</span>
          ${countdownHtml}
        </div>
        <div style="display:flex; align-items:center; gap: 10px;">
          ${ctaText ? `<a href="${escapeHtml(ctaLink || '#')}" target="_blank" style="background:${ctaBg}; color:${ctaColor}; padding: 5px 14px; border-radius: 9999px; font-weight:700; text-decoration:none; font-size: 0.76rem; white-space:nowrap; display:inline-flex; align-items:center; gap:4px;">${escapeHtml(ctaText)}</a>` : ''}
          <span style="color: rgba(255,255,255,0.4); font-size: 1.1rem; line-height: 1; cursor: pointer;">&times;</span>
        </div>
      </div>
    `;
  }

  const formBanner = document.getElementById('formBannerControl');
  if (formBanner) {
    ['bannerActiveToggle', 'bannerThemeSelect', 'bannerPageScopeSelect', 'bannerBadgeInput', 'bannerBadgePulseToggle', 'bannerTextInput', 'bannerCountdownToggle', 'bannerCountdownDate', 'bannerCtaTextInput', 'bannerCtaLinkInput'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => {
          if (id === 'bannerCountdownToggle') {
            const row = document.getElementById('bannerCountdownRow');
            if (row) row.style.display = el.checked ? 'grid' : 'none';
          }
          updateBannerPreview();
        });
        el.addEventListener('change', () => {
          if (id === 'bannerCountdownToggle') {
            const row = document.getElementById('bannerCountdownRow');
            if (row) row.style.display = el.checked ? 'grid' : 'none';
          }
          updateBannerPreview();
        });
      }
    });

    formBanner.addEventListener('submit', (e) => {
      e.preventDefault();
      const theme = document.getElementById('bannerThemeSelect')?.value || 'gold';
      Store.saveAlertBanner({
        active: document.getElementById('bannerActiveToggle').checked,
        theme: theme,
        tone: theme,
        pageScope: document.getElementById('bannerPageScopeSelect')?.value || 'all',
        badgeText: document.getElementById('bannerBadgeInput')?.value || 'LIVE NOW',
        badgePulse: document.getElementById('bannerBadgePulseToggle')?.checked,
        text: document.getElementById('bannerTextInput').value,
        enableCountdown: document.getElementById('bannerCountdownToggle')?.checked,
        countdownDate: document.getElementById('bannerCountdownDate')?.value || '',
        ctaText: document.getElementById('bannerCtaTextInput').value,
        ctaLink: document.getElementById('bannerCtaLinkInput').value
      });
      updateBannerPreview();
      showToast('Live announcement banner settings published!', 'success');
    });
  }

  // =========================================================================
  // 15.5 MODULE: BLOG & JOURNAL CMS
  // =========================================================================
  function slugify(text) {
    return (text || '')
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function renderMiniMarkdown(md) {
    if (!md) return '<p style="color:var(--adm-text-subtle); font-style:italic;">No content written yet...</p>';
    let html = escapeHtml(md);

    // Code blocks ```lang\ncode```
    html = html.replace(/```([a-zA-Z0-9_+-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre style="background:#0F172A; color:#38BDF8; padding:12px; border-radius:6px; font-family:monospace; font-size:0.8rem; overflow-x:auto; margin:12px 0; border:1px solid rgba(255,255,255,0.08);"><code>${code}</code></pre>`;
    });

    // Inline code `code`
    html = html.replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.1); padding:2px 6px; border-radius:4px; font-family:monospace; font-size:0.85em; color:#F59E0B;">$1</code>');

    // Headings
    html = html.replace(/^### (.*$)/gim, '<h4 style="font-size:1rem; font-weight:700; color:#F1F5F9; margin:16px 0 8px;">$1</h4>');
    html = html.replace(/^## (.*$)/gim, '<h3 style="font-size:1.15rem; font-weight:700; color:#F59E0B; margin:20px 0 10px;">$1</h3>');
    html = html.replace(/^# (.*$)/gim, '<h2 style="font-size:1.3rem; font-weight:800; color:#FFFFFF; margin:24px 0 12px;">$1</h2>');

    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote style="border-left:3px solid #F59E0B; padding-left:12px; margin:12px 0; color:#94A3B8; font-style:italic; background:rgba(245,158,11,0.05); padding:8px 12px; border-radius:0 6px 6px 0;">$1</blockquote>');

    // Bold & italic
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#FFFFFF; font-weight:700;">$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em style="color:#CBD5E1;">$1</em>');

    // Unordered lists
    html = html.replace(/^\s*-\s+(.*$)/gim, '<li style="margin-left:20px; list-style-type:disc; color:#CBD5E1;">$1</li>');

    // Paragraphs
    const paras = html.split('\n\n').map(p => {
      p = p.trim();
      if (!p) return '';
      if (p.startsWith('<h') || p.startsWith('<pre') || p.startsWith('<blockquote') || p.startsWith('<li')) {
        return p;
      }
      return `<p style="margin-bottom:10px; color:#94A3B8;">${p.replace(/\n/g, '<br>')}</p>`;
    }).filter(Boolean);

    return paras.join('');
  }

  function updateBlogLivePreview() {
    const preview = document.getElementById('blogLivePreviewBox');
    if (!preview) return;

    const title = document.getElementById('blogPostTitle')?.value || 'Untitled Technical Article';
    const category = document.getElementById('blogPostCategory')?.value || 'AI & Generative Tech';
    const author = document.getElementById('blogPostAuthor')?.value || 'AarambhX Engineering Team';
    const readTime = document.getElementById('blogPostReadTime')?.value || '5 min read';
    const summary = document.getElementById('blogPostSummary')?.value || '';
    const content = document.getElementById('blogPostContent')?.value || '';

    preview.innerHTML = `
      <div style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px; margin-bottom: 16px;">
        <span style="display:inline-block; padding: 2px 10px; border-radius: 999px; background: rgba(245,158,11,0.15); color: #F59E0B; font-size: 0.72rem; font-weight: 700; margin-bottom: 8px;">
          ${escapeHtml(category)}
        </span>
        <h3 style="font-size: 1.25rem; font-weight: 800; color: #FFFFFF; line-height: 1.3; margin: 4px 0 8px;">
          ${escapeHtml(title)}
        </h3>
        <div style="display: flex; gap: 12px; font-size: 0.75rem; color: #94A3B8; align-items: center;">
          <span>👤 ${escapeHtml(author)}</span>
          <span>⏱️ ${escapeHtml(readTime)}</span>
        </div>
        ${summary ? `<p style="font-size: 0.85rem; color: #CBD5E1; margin-top: 10px; font-style: italic; border-left: 2px solid #F59E0B; padding-left: 10px;">${escapeHtml(summary)}</p>` : ''}
      </div>
      <div style="font-size: 0.88rem; line-height: 1.6; color: #CBD5E1;">
        ${renderMiniMarkdown(content)}
      </div>
    `;
  }

  function renderBlogCMS() {
    const posts = Store.getBlogPosts();
    const metricTotal = document.getElementById('blogMetricTotal');
    const metricPublished = document.getElementById('blogMetricPublished');
    const metricDrafts = document.getElementById('blogMetricDrafts');
    const metricViews = document.getElementById('blogMetricViews');
    const tbody = document.getElementById('blogPostsTableBody');

    const total = posts.length;
    const published = posts.filter(p => p.status === 'Published').length;
    const drafts = posts.filter(p => p.status === 'Draft').length;
    const totalViews = posts.reduce((sum, p) => sum + (Number(p.views) || 0), 0);

    if (metricTotal) metricTotal.textContent = total;
    if (metricPublished) metricPublished.textContent = published;
    if (metricDrafts) metricDrafts.textContent = drafts;
    if (metricViews) metricViews.textContent = totalViews.toLocaleString('en-IN');

    if (!tbody) return;

    if (!posts.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; color: var(--adm-text-subtle); padding: 36px;">
            No articles found. Click "Write New Article" to draft your first engineering breakdown.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = posts.map(p => {
      const isPublished = p.status === 'Published';
      const dateDisplay = p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Draft';
      return `
        <tr>
          <td>
            <div style="font-weight: 700; color: var(--adm-text-bright); line-height: 1.35; margin-bottom: 4px;">
              ${escapeHtml(p.title)}
              ${p.featured ? '<span class="badge-status" style="background:rgba(245,158,11,0.2); color:#F59E0B; margin-left:6px; font-size:0.68rem;">⭐ Hero</span>' : ''}
            </div>
            <div style="font-size: 0.78rem; color: var(--adm-text-subtle); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
              ${escapeHtml(p.summary || '')}
            </div>
          </td>
          <td>
            <span class="badge-status badge-contacted" style="font-size: 0.72rem; white-space: nowrap;">
              ${escapeHtml(p.category)}
            </span>
          </td>
          <td>
            <div style="font-size: 0.82rem; font-weight: 600; color: var(--adm-text-bright);">${escapeHtml(p.author)}</div>
            <div style="font-size: 0.72rem; color: var(--adm-text-subtle);">${escapeHtml(p.authorRole || 'Contributor')}</div>
          </td>
          <td><span style="font-size: 0.8rem; color: var(--adm-text-subtle);">${escapeHtml(p.readTime || '5 min read')}</span></td>
          <td><span class="badge-count" style="font-size: 0.78rem; padding: 2px 8px; border-radius: 999px; background: rgba(59,130,246,0.15); color: #3B82F6;">👁️ ${p.views || 0}</span></td>
          <td>
            <span class="badge-status ${isPublished ? 'badge-confirmed' : 'badge-pending'}" style="font-size: 0.75rem;">
              ${escapeHtml(p.status)}
            </span>
          </td>
          <td><span style="font-size: 0.78rem; color: var(--adm-text-subtle);">${dateDisplay}</span></td>
          <td style="text-align: right; white-space: nowrap;">
            <a href="blog.html#${encodeURIComponent(p.slug)}" target="_blank" rel="noopener" class="ax-btn-secondary" style="padding: 5px 8px; margin-right: 4px; text-decoration: none; display: inline-flex; align-items: center;" title="View Live Article">
              <i data-lucide="external-link" style="width: 14px; height: 14px;"></i>
            </a>
            <button type="button" class="ax-btn-secondary" onclick="window.openBlogModal('${p.id}')" style="padding: 5px 8px; margin-right: 4px;" title="Edit Article">
              <i data-lucide="edit-3" style="width: 14px; height: 14px;"></i>
            </button>
            <button type="button" class="ax-btn-secondary" onclick="window.deleteBlogPost('${p.id}')" style="padding: 5px 8px; color: var(--ax-rose);" title="Delete Article">
              <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons({ root: tbody });
  }

  function openBlogModal(postId) {
    const modal = document.getElementById('modalBlogEditor');
    const form = document.getElementById('formBlogEditor');
    const titleEl = document.getElementById('modalBlogTitle');
    if (!modal || !form) return;

    if (postId) {
      const post = Store.getBlogPostById(postId);
      if (!post) {
        showToast('Article not found', 'error');
        return;
      }
      if (titleEl) titleEl.textContent = 'Edit Technical Article';
      document.getElementById('blogPostId').value = post.id;
      document.getElementById('blogPostTitle').value = post.title || '';
      document.getElementById('blogPostSlug').value = post.slug || '';
      document.getElementById('blogPostCategory').value = post.category || 'AI & Generative Tech';
      document.getElementById('blogPostAuthor').value = post.author || '';
      document.getElementById('blogPostAuthorRole').value = post.authorRole || '';
      document.getElementById('blogPostReadTime').value = post.readTime || '';
      document.getElementById('blogPostStatus').value = post.status || 'Published';
      document.getElementById('blogPostImage').value = post.image || '';
      document.getElementById('blogPostFeatured').checked = !!post.featured;
      document.getElementById('blogPostSummary').value = post.summary || '';
      document.getElementById('blogPostMetaDesc').value = post.metaDescription || '';
      document.getElementById('blogPostContent').value = post.content || '';
    } else {
      form.reset();
      if (titleEl) titleEl.textContent = 'Write Technical Article';
      document.getElementById('blogPostId').value = '';
      document.getElementById('blogPostAuthor').value = 'Lalith H & AarambhX Engineering Team';
      document.getElementById('blogPostAuthorRole').value = 'Founder & Principal Systems Architect';
      document.getElementById('blogPostReadTime').value = '5 min read';
      document.getElementById('blogPostStatus').value = 'Published';
      document.getElementById('blogPostImage').value = 'assets/hero.webp';
      document.getElementById('blogPostCategory').value = 'AI & Generative Tech';
    }

    updateBlogLivePreview();
    modal.classList.add('open');
    if (window.lucide) window.lucide.createIcons({ root: modal });
  }

  window.openBlogModal = openBlogModal;

  window.deleteBlogPost = function(id) {
    if (confirm('Are you sure you want to delete this technical article? This cannot be undone.')) {
      Store.deleteBlogPost(id);
      showToast('Article deleted successfully', 'info');
      renderBlogCMS();
    }
  };

  function aiGenerateBlogTemplate() {
    const cat = document.getElementById('blogPostCategory')?.value || 'AI & Generative Tech';
    const titleInput = document.getElementById('blogPostTitle');
    const summaryInput = document.getElementById('blogPostSummary');
    const metaDescInput = document.getElementById('blogPostMetaDesc');
    const contentInput = document.getElementById('blogPostContent');

    if (cat.includes('AI')) {
      if (!titleInput.value) titleInput.value = 'Autonomous Multi-Agent Orchestration with Gemini 2.0 Flash';
      if (!summaryInput.value) summaryInput.value = 'Architecting low-latency agentic loops, function routing, and grounding pipelines using Gemini 2.0 Flash.';
      if (!metaDescInput.value) metaDescInput.value = 'A technical blueprint for building production multi-agent systems with tool-calling and real-time streaming.';
      contentInput.value = `## Executive Summary

As enterprise workflows demand more autonomy, single-prompt LLMs give way to multi-agent architectures that decompose complex objectives into specialized subtasks.

### Core Architecture

The system operates across three distinct execution layers:

1. **Supervisor Agent**: Responsible for decomposition, task DAG generation, and error recovery.
2. **Specialist Workers**: Domain-specific subagents equipped with scoped MCP toolsets.
3. **Consensus Evaluator**: Validates output consistency against predefined schemas before final response delivery.

\`\`\`python
# Multi-Agent DAG Dispatcher in Python
import asyncio
from typing import Dict, Any

class AgentPipeline:
    def __init__(self, model_name: str = "gemini-2.0-flash"):
        self.model = model_name
        self.registry = {}

    async def execute_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        print(f"[*] Dispatching task '{task['id']}' to subagent pool...")
        # Execute scoped subagent with grounding tools
        await asyncio.sleep(0.05)
        return {"status": "SUCCESS", "telemetry_ms": 42}
\`\`\`

> **Key Takeaway:** Decoupling evaluation from generation reduces hallucination rates by over 74% in production benchmarks.`;
    } else if (cat.includes('Hardware') || cat.includes('IoT')) {
      if (!titleInput.value) titleInput.value = 'Zero-Power LoRaWAN Telemetry Nodes with ESP32-C3 & FreeRTOS';
      if (!summaryInput.value) summaryInput.value = 'Engineering deep-sleep telemetry firmware delivering 3+ year battery life on solar-buffered LiFePO4 cells.';
      if (!metaDescInput.value) metaDescInput.value = 'Production guide to ultra-low-power ESP32-C3 edge nodes with LoRaWAN telemetry and solar harvesting.';
      contentInput.value = `## Edge Architecture Overview

Deploying edge sensing nodes in remote agricultural or industrial environments requires balancing high RF transmit power against strict microamp power budgets.

### Deep Sleep Power Optimization

By utilizing the ESP32-C3's ULP (Ultra-Low Power) coprocessor and latching power rails:

\`\`\`cpp
// ESP32-C3 Deep Sleep Wakeup Configuration
#include "esp_sleep.h"
#include "driver/rtc_io.h"

#define SENSOR_LATCH_PIN GPIO_NUM_4
#define SLEEP_DURATION_US (15 * 60 * 1000000ULL) // 15 minutes

void enter_power_optimized_sleep() {
    gpio_set_level(SENSOR_LATCH_PIN, 0); // Cut power to peripheral sensor rail
    esp_sleep_enable_timer_wakeup(SLEEP_DURATION_US);
    esp_deep_sleep_start();
}
\`\`\`

> **Hardware Specification:** Quiescent current during deep-sleep drops to **9.8µA** on 3.3V rails.`;
    } else if (cat.includes('Full-Stack')) {
      if (!titleInput.value) titleInput.value = 'Sub-100ms Edge Architecture with Cloudflare Workers & Island Hydration';
      if (!summaryInput.value) summaryInput.value = 'Eliminating client-side rendering bottlenecks with selective island hydration and geo-distributed KV caches.';
      if (!metaDescInput.value) metaDescInput.value = 'Full-stack engineering breakdown: Achieving 99+ Lighthouse performance across distributed edge nodes.';
      contentInput.value = `## Breaking the Hydration Cost Barrier

Traditional Single-Page Applications (SPAs) ship megabytes of JavaScript that block the main UI thread during initial parse and hydration.

### Edge Caching Strategy

By distributing HTML synthesis to 300+ edge points of presence (PoPs):

\`\`\`typescript
// Edge Request Router & Cache Interceptor
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const cache = caches.default;
    const cacheKey = new Request(request.url, request);
    
    let response = await cache.match(cacheKey);
    if (!response) {
      response = await fetchOriginWithIslands(request);
      response.headers.set('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
      ctx.waitUntil(cache.put(cacheKey, response.clone()));
    }
    return response;
  }
};
\`\`\`

> **Metric Win:** TTFB reduced from **380ms** to **28ms** globally.`;
    } else {
      if (!titleInput.value) titleInput.value = 'Enterprise LAN Modernization: 10GbE Backbone Case Study';
      if (!summaryInput.value) summaryInput.value = 'Complete overhaul of an educational campus network delivering 10Gbps inter-building links and 802.1X zero-trust auth.';
      if (!metaDescInput.value) metaDescInput.value = 'Engineering case study: Upgrading multi-building infrastructure to 10GbE fiber with seamless cutover.';
      contentInput.value = `## Project Scope & Challenges

A multi-building campus network operating on legacy Cat5e wiring faced chronic packet loss, congestion during peak lab hours, and unmanaged rogue access points.

### Deployment Matrix

- **Backbone:** OM4 Multi-Mode 10GbE Fiber Ring with LACP link aggregation.
- **Access Layer:** 48-port Managed PoE+ switches with 802.1X dynamic VLAN assignment.
- **Security:** Zero-trust isolation between lab workstations, faculty servers, and guest Wi-Fi.

> **Outcome:** 99.99% measured uptime over 12 months with 0 security breaches recorded.`;
    }

    if (titleInput && (!document.getElementById('blogPostSlug').value || document.getElementById('blogPostSlug').value.length === 0)) {
      document.getElementById('blogPostSlug').value = slugify(titleInput.value);
    }

    updateBlogLivePreview();
    showToast('AI Technical Blueprint Generated!', 'success');
  }

  // Blog Event Listeners Setup
  const btnNewBlogPost = document.getElementById('btnNewBlogPost');
  if (btnNewBlogPost) {
    btnNewBlogPost.addEventListener('click', () => openBlogModal());
  }

  const modalBlogEditor = document.getElementById('modalBlogEditor');
  document.querySelectorAll('[data-close-modal="modalBlogEditor"]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (modalBlogEditor) modalBlogEditor.classList.remove('open');
    });
  });

  const btnAiBlog = document.getElementById('btnAiGenerateBlogTemplate');
  if (btnAiBlog) {
    btnAiBlog.addEventListener('click', aiGenerateBlogTemplate);
  }

  const blogTitleInput = document.getElementById('blogPostTitle');
  const blogSlugInput = document.getElementById('blogPostSlug');
  if (blogTitleInput && blogSlugInput) {
    let lastAutoSlug = '';
    blogTitleInput.addEventListener('input', () => {
      const currentVal = blogSlugInput.value;
      if (!currentVal || currentVal === lastAutoSlug) {
        lastAutoSlug = slugify(blogTitleInput.value);
        blogSlugInput.value = lastAutoSlug;
      }
      updateBlogLivePreview();
    });
  }

  ['blogPostCategory', 'blogPostAuthor', 'blogPostReadTime', 'blogPostSummary', 'blogPostContent'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updateBlogLivePreview);
      el.addEventListener('change', updateBlogLivePreview);
    }
  });

  const formBlogEditor = document.getElementById('formBlogEditor');
  if (formBlogEditor) {
    formBlogEditor.addEventListener('submit', (e) => {
      e.preventDefault();
      const idVal = document.getElementById('blogPostId')?.value;
      const titleVal = document.getElementById('blogPostTitle')?.value.trim();
      const slugVal = document.getElementById('blogPostSlug')?.value.trim() || slugify(titleVal);

      if (!titleVal) {
        showToast('Please provide an article title', 'error');
        return;
      }

      const postData = {
        title: titleVal,
        slug: slugVal,
        category: document.getElementById('blogPostCategory')?.value || 'AI & Generative Tech',
        author: document.getElementById('blogPostAuthor')?.value.trim() || 'AarambhX Engineering Team',
        authorRole: document.getElementById('blogPostAuthorRole')?.value.trim() || 'Principal Architect',
        readTime: document.getElementById('blogPostReadTime')?.value.trim() || '5 min read',
        status: document.getElementById('blogPostStatus')?.value || 'Published',
        image: document.getElementById('blogPostImage')?.value.trim() || 'assets/hero.webp',
        featured: !!document.getElementById('blogPostFeatured')?.checked,
        summary: document.getElementById('blogPostSummary')?.value.trim() || '',
        metaDescription: document.getElementById('blogPostMetaDesc')?.value.trim() || document.getElementById('blogPostSummary')?.value.trim() || '',
        content: document.getElementById('blogPostContent')?.value.trim() || ''
      };

      if (idVal) {
        postData.id = idVal;
      }

      Store.saveBlogPost(postData);
      if (modalBlogEditor) modalBlogEditor.classList.remove('open');
      showToast(idVal ? 'Article successfully updated!' : 'Article successfully published!', 'success');
      renderBlogCMS();
    });
  }

  // =========================================================================
  // 16. THEME SWITCHER
  // =========================================================================
  function initAdminTheme() {
    const saved = localStorage.getItem('tbs_theme') || 'light';
    applyAdminTheme(saved);

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const curr = document.documentElement.getAttribute('data-theme') || 'light';
        const next = curr === 'dark' ? 'light' : 'dark';
        applyAdminTheme(next);
        localStorage.setItem('tbs_theme', next);
      });
    }
  }

  function applyAdminTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }

  // Utilities
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderDashboard() {
    handleHash();
  }

  // Initialize
  window.addEventListener('hashchange', handleHash);
  document.addEventListener('DOMContentLoaded', () => {
    initAdminTheme();
    initFirebaseAuth();
    checkAuth();
  });

})();
