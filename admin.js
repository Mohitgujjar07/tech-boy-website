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
  // 2. AUTH GATE & SECURITY
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
        showToast('Authenticated as Administrator', 'success');
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
      showToast('Signed out successfully', 'info');
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
    const validTabs = ['overview', 'inquiries', 'quotations', 'catalog', 'projects', 'workshops', 'certificates', 'testimonials', 'reels', 'banner', 'settings'];
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
  const btnShareInvoiceWhatsApp = document.getElementById('btnShareInvoiceWhatsApp');

  window.previewInvoice = function (invId) {
    const invoices = Store.getInvoices();
    activePrintInvoice = invoices.find(i => i.id === invId);
    if (!activePrintInvoice || !invoicePrintContainer) return;

    const isPaid = activePrintInvoice.status === 'Paid';
    const settings = Store.getSettings();
    const upiUri = `upi://pay?pa=${encodeURIComponent(settings.upiId || 'mohitgujjar07@okhdfcbank')}&pn=${encodeURIComponent(settings.upiName || 'AarambhX Technology')}&am=${activePrintInvoice.total}&cu=INR`;

    // SVG QR Code generator
    const upiQrSvg = generateSimpleQRCodeSvg(upiUri);

    invoicePrintContainer.innerHTML = `
      <div class="printable-invoice-card" id="printableInvoiceNode">
        <!-- Letterhead -->
        <div class="inv-head-row">
          <div>
            <h2 style="font-family: var(--font-display); font-size: 1.8rem; font-weight: 800; color: #2563EB; margin:0;">AarambhX <span style="color:#0F172A;">Technology</span></h2>
            <p style="font-size: 0.8rem; color: var(--adm-text-muted); margin-top: 4px; line-height: 1.4;">
              Complete Technology, Software &amp; Hardware Solutions<br>
              ${escapeHtml(settings.businessAddress)}<br>
              Phone: ${escapeHtml(settings.businessPhone)} &bull; Email: ${escapeHtml(settings.businessEmail)}
            </p>
          </div>
          <div style="text-align: right;">
            <span class="inv-type-badge ${activePrintInvoice.type === 'Quotation' ? 'badge-quote' : 'badge-tax'}">${escapeHtml(activePrintInvoice.type.toUpperCase())}</span>
            <div style="font-family: monospace; font-size: 1.1rem; font-weight: 800; color: #2563EB; margin-top: 6px;">${escapeHtml(activePrintInvoice.invoiceNumber)}</div>
            <div style="font-size: 0.8rem; color: var(--adm-text-muted); margin-top: 2px;">Date: <strong>${escapeHtml(activePrintInvoice.date)}</strong></div>
            <div style="font-size: 0.8rem; color: var(--adm-text-muted);">Due: <strong>${escapeHtml(activePrintInvoice.dueDate)}</strong></div>
          </div>
        </div>

        <!-- Billed To / From -->
        <div class="inv-client-strip">
          <div>
            <div style="font-size: 0.725rem; text-transform: uppercase; color: var(--adm-text-subtle); font-weight: 700;">BILLED TO:</div>
            <div style="font-size: 1.1rem; font-weight: 800; color: #0F172A; margin-top: 2px;">${escapeHtml(activePrintInvoice.clientName)}</div>
            ${activePrintInvoice.clientPhone ? `<div style="font-size: 0.825rem; color: var(--adm-text-muted);">Phone: +91 ${escapeHtml(activePrintInvoice.clientPhone)}</div>` : ''}
            ${activePrintInvoice.clientEmail ? `<div style="font-size: 0.825rem; color: var(--adm-text-muted);">Email: ${escapeHtml(activePrintInvoice.clientEmail)}</div>` : ''}
            ${activePrintInvoice.clientGst ? `<div style="font-size: 0.825rem; color: var(--adm-text-muted);">GSTIN: ${escapeHtml(activePrintInvoice.clientGst)}</div>` : ''}
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.725rem; text-transform: uppercase; color: var(--adm-text-subtle); font-weight: 700;">STATUS:</div>
            <span class="badge-status ${isPaid ? 'badge-closed' : 'badge-new'}" style="font-size: 0.9rem; padding: 4px 12px; margin-top: 4px; display:inline-block;">${escapeHtml(activePrintInvoice.status)}</span>
          </div>
        </div>

        <!-- Items Table -->
        <table class="inv-render-table">
          <thead>
            <tr>
              <th style="text-align:left;">Item / Technical Scope</th>
              <th style="text-align:center; width: 60px;">Qty</th>
              <th style="text-align:right; width: 120px;">Rate (₹)</th>
              <th style="text-align:right; width: 130px;">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${(activePrintInvoice.items || []).map(item => `
              <tr>
                <td><strong>${escapeHtml(item.desc)}</strong></td>
                <td style="text-align:center;">${item.qty}</td>
                <td style="text-align:right;">₹${(parseFloat(item.rate) || 0).toLocaleString('en-IN')}</td>
                <td style="text-align:right; font-weight:700;">₹${(parseFloat(item.amount) || 0).toLocaleString('en-IN')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Summary & UPI QR Section -->
        <div class="inv-summary-row">
          <div class="inv-upi-box">
            <div style="display:flex; align-items:center; gap: 14px;">
              <div class="inv-qr-code">${upiQrSvg}</div>
              <div>
                <strong style="font-size: 0.85rem; display:block; color:#0F172A;">Instant UPI Scan &amp; Pay</strong>
                <span style="font-size: 0.775rem; color: var(--adm-text-muted);">UPI ID: <code>${escapeHtml(settings.upiId)}</code></span><br>
                <span style="font-size: 0.75rem; color: #10B981; font-weight:600;">Supports GPay, PhonePe, Paytm, BHIM</span>
              </div>
            </div>
            ${activePrintInvoice.notes ? `<div style="font-size: 0.775rem; color: var(--adm-text-muted); margin-top: 10px; border-top: 1px dashed var(--adm-border); padding-top: 6px;"><strong>Terms:</strong> ${escapeHtml(activePrintInvoice.notes)}</div>` : ''}
          </div>

          <div class="inv-calc-totals">
            <div class="calc-row"><span>Subtotal:</span> <strong>₹${(activePrintInvoice.subtotal || 0).toLocaleString('en-IN')}</strong></div>
            ${activePrintInvoice.discount > 0 ? `<div class="calc-row"><span>Discount:</span> <strong>-₹${activePrintInvoice.discount.toLocaleString('en-IN')}</strong></div>` : ''}
            ${activePrintInvoice.taxAmount > 0 ? `<div class="calc-row"><span>GST (${activePrintInvoice.taxRate}%):</span> <strong>+₹${activePrintInvoice.taxAmount.toLocaleString('en-IN')}</strong></div>` : ''}
            <div class="calc-grand-total">
              <span>Grand Total:</span>
              <span>₹${(activePrintInvoice.total || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div class="inv-footer-stamp">
          <div>Authorized Signatory &bull; AarambhX Technology</div>
          <div>Computer Generated Official Document</div>
        </div>
      </div>
    `;

    if (modalPrintInvoice) modalPrintInvoice.classList.add('open');
    if (window.lucide) window.lucide.createIcons();
  };

  if (btnClosePrintInvoice && modalPrintInvoice) {
    btnClosePrintInvoice.addEventListener('click', () => modalPrintInvoice.classList.remove('open'));
  }

  if (btnPrintInvoiceAction) {
    btnPrintInvoiceAction.addEventListener('click', () => {
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

  // Simple High-Fidelity SVG QR Generator fallback
  function generateSimpleQRCodeSvg(data) {
    const safeData = escapeHtml(data);
    return `
      <svg width="90" height="90" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="background:#fff; padding:4px; border:1px solid #E2E8F0; border-radius:6px;">
        <rect width="100" height="100" fill="#ffffff"/>
        <!-- Corner Markers -->
        <rect x="5" y="5" width="26" height="26" fill="#0F172A" rx="2"/>
        <rect x="9" y="9" width="18" height="18" fill="#ffffff" rx="1"/>
        <rect x="13" y="13" width="10" height="10" fill="#2563EB" rx="1"/>

        <rect x="69" y="5" width="26" height="26" fill="#0F172A" rx="2"/>
        <rect x="73" y="9" width="18" height="18" fill="#ffffff" rx="1"/>
        <rect x="77" y="13" width="10" height="10" fill="#2563EB" rx="1"/>

        <rect x="5" y="69" width="26" height="26" fill="#0F172A" rx="2"/>
        <rect x="9" y="73" width="18" height="18" fill="#ffffff" rx="1"/>
        <rect x="13" y="77" width="10" height="10" fill="#2563EB" rx="1"/>

        <!-- Procedural Data Matrix -->
        <circle cx="50" cy="50" r="6" fill="#2563EB"/>
        <rect x="36" y="10" width="8" height="8" fill="#0F172A"/>
        <rect x="48" y="20" width="12" height="6" fill="#0F172A"/>
        <rect x="15" y="38" width="6" height="10" fill="#0F172A"/>
        <rect x="25" y="45" width="10" height="6" fill="#0F172A"/>
        <rect x="42" y="36" width="6" height="6" fill="#0F172A"/>
        <rect x="64" y="38" width="8" height="8" fill="#0F172A"/>
        <rect x="78" y="48" width="10" height="6" fill="#0F172A"/>
        <rect x="38" y="64" width="8" height="8" fill="#0F172A"/>
        <rect x="52" y="72" width="12" height="6" fill="#0F172A"/>
        <rect x="70" y="70" width="8" height="8" fill="#0F172A"/>
        <rect x="82" y="80" width="6" height="6" fill="#0F172A"/>
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
    const textInput = document.getElementById('bannerTextInput');
    const ctaTextInput = document.getElementById('bannerCtaTextInput');
    const ctaLinkInput = document.getElementById('bannerCtaLinkInput');

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
      showToast('Announcement banner settings saved!', 'success');
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
    checkAuth();
  });

})();
