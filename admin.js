/**
 * AarambhX Technology — Admin Command Suite Controller (admin.js)
 * Manages Auth Gate, Reactive Module Rendering, Real-Time Filtering, and CRM.
 */

'use strict';

(function () {
  const Store = window.AarambhXStore;
  if (!Store) {
    console.error('[Admin] AarambhXStore engine not found.');
    return;
  }

  // --- STATE ---
  let currentTab = 'overview';
  let inquiryFilter = 'all';
  let inquirySearchQuery = '';

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

  // =========================================================================
  // 1. AUTH GATE & SECURITY
  // =========================================================================
  function checkAuth() {
    if (!Store.isAuthenticated()) {
      authOverlay.classList.remove('hidden');
      if (authPasskeyInput) authPasskeyInput.focus();
    } else {
      authOverlay.classList.add('hidden');
      renderDashboard();
    }
  }

  if (authForm) {
    authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const passkey = authPasskeyInput.value;
      if (Store.login(passkey)) {
        authErrorMsg.textContent = '';
        authPasskeyInput.value = '';
        authOverlay.classList.add('hidden');
        renderDashboard();
      } else {
        authErrorMsg.textContent = 'Invalid passkey. Try: aarambhx2026';
        authPasskeyInput.focus();
      }
    });
  }

  if (btnSignout) {
    btnSignout.addEventListener('click', () => {
      Store.logout();
      authOverlay.classList.remove('hidden');
    });
  }

  // =========================================================================
  // 2. LIVE CLOCK (IST)
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
  // 3. TAB NAVIGATION
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

    if (sidebar) sidebar.classList.remove('mobile-open');

    // Render corresponding view
    switch (tabId) {
      case 'overview':
        renderOverview();
        break;
      case 'inquiries':
        renderInquiries();
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
      case 'reels':
        renderReels();
        break;
      case 'banner':
        renderBannerControl();
        break;
    }
  }

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

  // Mobile drawer toggle
  if (mobileSidebarToggle && sidebar) {
    mobileSidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
  }

  // Handle URL hash on load
  function handleHash() {
    const hash = window.location.hash.replace('#', '');
    if (hash && ['overview', 'inquiries', 'projects', 'workshops', 'certificates', 'reels', 'banner'].includes(hash)) {
      switchTab(hash);
    } else {
      switchTab('overview');
    }
  }

  // =========================================================================
  // 4. MODULE: OVERVIEW & BENTO METRICS
  // =========================================================================
  function renderOverview() {
    const m = Store.getDashboardMetrics();
    
    // Update metric cards
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

    // Render 5 recent leads in overview table
    const recentTableBody = document.getElementById('overviewRecentLeadsBody');
    if (!recentTableBody) return;

    const recent = Store.getInquiries().slice(0, 5);
    if (!recent.length) {
      recentTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--adm-text-subtle); padding: 24px;">No inquiries recorded yet.</td></tr>`;
      return;
    }

    recentTableBody.innerHTML = recent.map(lead => {
      const statusClass = lead.status === 'New' ? 'badge-new' : (lead.status === 'Contacted' ? 'badge-contacted' : 'badge-closed');
      const waLink = `https://wa.me/91${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${lead.name}, thank you for reaching out to Aarambhx Technology regarding ${lead.serviceOrTrack}.`)}`;
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

    if (window.lucide) window.lucide.createIcons();
  }

  // =========================================================================
  // 5. MODULE: INQUIRIES & LEADS CRM
  // =========================================================================
  function renderInquiries() {
    const tableBody = document.getElementById('inquiriesTableBody');
    const filterSelect = document.getElementById('inquiriesFilter');
    const searchInput = document.getElementById('inquiriesSearch');
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
            ${lead.email ? `<br><small style="color:var(--adm-text-muted);">${escapeHtml(lead.email)}</small>` : ''}
          </td>
          <td>
            <span style="font-family: monospace; font-weight: 600;">+91 ${escapeHtml(lead.phone)}</span><br>
            <a href="${waLink}" target="_blank" rel="noopener" class="btn-whatsapp-chat" style="margin-top: 4px;">
              <i data-lucide="message-circle"></i> WhatsApp
            </a>
          </td>
          <td>
            <span style="font-weight: 600;">${escapeHtml(lead.serviceOrTrack)}</span>
            <br><small style="color: var(--adm-text-subtle);">${escapeHtml(lead.type)}</small>
          </td>
          <td style="max-width: 240px; font-size: 0.8rem; color: var(--adm-text-muted);">
            ${escapeHtml(lead.details)}
          </td>
          <td>
            <select class="ax-filter-select" onchange="window.updateLeadStatus('${lead.id}', this.value)" style="height: 32px; padding: 0 8px; font-size: 0.775rem;">
              <option value="New" ${lead.status === 'New' ? 'selected' : ''}>New</option>
              <option value="Contacted" ${lead.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
              <option value="In Progress" ${lead.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
              <option value="Closed" ${lead.status === 'Closed' ? 'selected' : ''}>Closed</option>
            </select>
          </td>
          <td><small style="color: var(--adm-text-subtle);">${lead.createdAt ? lead.createdAt.slice(0, 10) : ''}</small></td>
          <td>
            <button class="ax-btn-secondary" onclick="window.deleteLead('${lead.id}')" title="Delete Inquiry" style="height: 32px; padding: 0 8px; color: var(--ax-rose);">
              <i data-lucide="trash-2"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  // Global hooks for inline event handlers
  window.updateLeadStatus = function (id, status) {
    Store.updateInquiryStatus(id, status);
    renderInquiries();
    renderOverview();
  };

  window.deleteLead = function (id) {
    if (confirm('Are you sure you want to delete this lead?')) {
      Store.deleteInquiry(id);
      renderInquiries();
      renderOverview();
    }
  };

  // Inquiry Filter & Search listeners
  const inqFilter = document.getElementById('inquiriesFilter');
  if (inqFilter) {
    inqFilter.addEventListener('change', (e) => {
      inquiryFilter = e.target.value;
      renderInquiries();
    });
  }

  const inqSearch = document.getElementById('inquiriesSearch');
  if (inqSearch) {
    inqSearch.addEventListener('input', (e) => {
      inquirySearchQuery = e.target.value.trim();
      renderInquiries();
    });
  }

  // Export CSV
  const btnExportCSV = document.getElementById('btnExportCSV');
  if (btnExportCSV) {
    btnExportCSV.addEventListener('click', () => {
      const csv = Store.exportInquiriesCSV();
      if (!csv) {
        alert('No inquiries to export.');
        return;
      }
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aarambhx_leads_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // =========================================================================
  // 6. MODULE: PROJECTS & PORTFOLIO
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
          <div class="item-thumb-wrap">
            <img src="${escapeHtml(proj.image || 'assets/hero.webp')}" alt="${escapeHtml(proj.title)}" class="item-thumb-img" onerror="this.src='assets/hero.webp'">
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
      renderProjects();
      renderOverview();
    }
  };

  // Add Project Modal Handlers
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
      const title = document.getElementById('projTitle').value;
      const category = document.getElementById('projCategory').value;
      const description = document.getElementById('projDesc').value;
      const image = document.getElementById('projImage').value || 'assets/hero.webp';
      const tags = document.getElementById('projTags').value;
      const liveUrl = document.getElementById('projLiveUrl').value;
      const featured = document.getElementById('projFeatured').checked;

      Store.saveProject({
        title,
        category,
        description,
        image,
        tags,
        liveUrl,
        featured
      });

      formAddProject.reset();
      modalProject.classList.remove('open');
      renderProjects();
      renderOverview();
    });
  }

  // =========================================================================
  // 7. MODULE: ACADEMY WORKSHOPS
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
            
            <div style="margin-bottom: 16px;">
              <div style="display:flex; justify-content:space-between; font-size: 0.775rem; margin-bottom: 4px;">
                <span>Enrollment: <strong>${ws.seatsEnrolled} / ${ws.seatsTotal}</strong></span>
                <span><strong>${pct}%</strong></span>
              </div>
              <div style="width:100%; height: 6px; background: var(--adm-pill-track); border-radius: 4px; overflow: hidden;">
                <div style="width: ${pct}%; height: 100%; background: var(--ax-blue); border-radius: 4px;"></div>
              </div>
            </div>

            <div class="item-card-actions">
              <button class="ax-btn-secondary" onclick="window.deleteWorkshop('${ws.id}')" style="margin-left: auto; height:30px; color:var(--ax-rose);">
                <i data-lucide="trash-2"></i> Delete
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  window.deleteWorkshop = function (id) {
    if (confirm('Delete this workshop entry?')) {
      Store.deleteWorkshop(id);
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
      renderWorkshops();
      renderOverview();
    });
  }

  // =========================================================================
  // 8. MODULE: CERTIFICATE VERIFIER & ISSUER
  // =========================================================================
  function renderCertificates() {
    const tableBody = document.getElementById('certificatesTableBody');
    if (!tableBody) return;

    const certs = Store.getCertificates();
    if (!certs.length) {
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 28px; color: var(--adm-text-subtle);">No certificates issued yet.</td></tr>`;
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
        </tr>
      `;
    }).join('');
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
            <div style="display: flex; align-items: center; gap: 8px; color: var(--ax-emerald); font-weight: 700; margin-bottom: 8px;">
              <i data-lucide="shield-check"></i> Authentic Certificate Record Found
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
      Store.issueCertificate({
        id: document.getElementById('certCustomId').value,
        studentName: document.getElementById('certStudentName').value,
        institution: document.getElementById('certInstitution').value,
        track: document.getElementById('certTrack').value,
        issueDate: document.getElementById('certDate').value || new Date().toISOString().slice(0, 10),
        grade: document.getElementById('certGrade').value
      });

      formIssueCert.reset();
      modalCert.classList.remove('open');
      renderCertificates();
      renderOverview();
    });
  }

  // =========================================================================
  // 9. MODULE: REELS & MEDIA SHOWCASE
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
      renderReels();
    });
  }

  // =========================================================================
  // 10. MODULE: LIVE ANNOUNCEMENT BANNER
  // =========================================================================
  function renderBannerControl() {
    const banner = Store.getAlertBanner();
    const activeToggle = document.getElementById('bannerActiveToggle');
    const textInput = document.getElementById('bannerTextInput');
    const ctaTextInput = document.getElementById('bannerCtaTextInput');
    const ctaLinkInput = document.getElementById('bannerCtaLinkInput');
    const previewBox = document.getElementById('bannerPreviewBox');

    if (activeToggle) activeToggle.checked = !!banner.active;
    if (textInput) textInput.value = banner.text || '';
    if (ctaTextInput) ctaTextInput.value = banner.ctaText || '';
    if (ctaLinkInput) ctaLinkInput.value = banner.ctaLink || '';

    updateBannerPreview();
  }

  function updateBannerPreview() {
    const previewBox = document.getElementById('bannerPreviewBox');
    if (!previewBox) return;

    const banner = Store.getAlertBanner();
    if (!banner.active) {
      previewBox.innerHTML = `<div style="padding: 14px; text-align: center; color: var(--adm-text-subtle); background: var(--adm-pill-track); border-radius: 8px;">Banner is currently INACTIVE on public website.</div>`;
    } else {
      previewBox.innerHTML = `
        <div style="background: linear-gradient(135deg, #1e3a8a, #2563eb); color: #ffffff; padding: 12px 18px; border-radius: 8px; display: flex; align-items: center; justify-content: space-between; gap: 12px; font-size: 0.85rem;">
          <span>${escapeHtml(banner.text || 'Announcement Message')}</span>
          ${banner.ctaText ? `<a href="${escapeHtml(banner.ctaLink || '#')}" target="_blank" style="background:#ffffff; color:#1d4ed8; padding: 4px 12px; border-radius: 9999px; font-weight:700; text-decoration:none; font-size: 0.775rem; white-space:nowrap;">${escapeHtml(banner.ctaText)}</a>` : ''}
        </div>
      `;
    }
  }

  const formBanner = document.getElementById('formBannerControl');
  if (formBanner) {
    formBanner.addEventListener('submit', (e) => {
      e.preventDefault();
      Store.saveAlertBanner({
        active: document.getElementById('bannerActiveToggle').checked,
        text: document.getElementById('bannerTextInput').value,
        ctaText: document.getElementById('bannerCtaTextInput').value,
        ctaLink: document.getElementById('bannerCtaLinkInput').value
      });
      updateBannerPreview();
      alert('Announcement banner settings saved successfully!');
    });
  }

  // =========================================================================
  // 11. THEME SWITCHER
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
    checkAuth();
  });

})();
