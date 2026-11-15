/**
 * Abdul Rehman - Portfolio Client Script
 * Handles:
 * - Dynamic Lightbox Modal for LinkedIn Certifications
 * - REST API Contact Form submission (/api/contact)
 * - Live Messages Inbox Viewer (/api/messages)
 * - Clipboard Copying with animated feedback
 * - Smooth UI interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  initContactForm();
  initCertLightbox();
  initCopyHelpers();
  initInboxViewer();
  fetchInboxCount();
});

/* ==========================================================================
   1. Toast Notification Helper
   ========================================================================== */
function showToast(message, duration = 3000) {
  let toast = document.getElementById('globalToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'globalToast';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
    <span>${message}</span>
  `;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

/* ==========================================================================
   2. Clipboard Copy Helpers
   ========================================================================== */
function initCopyHelpers() {
  const copyButtons = document.querySelectorAll('[data-copy]');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const textToCopy = btn.getAttribute('data-copy');
      if (!textToCopy) return;

      try {
        await navigator.clipboard.writeText(textToCopy);
        const originalHtml = btn.innerHTML;
        btn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg> Copied!
        `;
        showToast(`Copied to clipboard: ${textToCopy.substring(0, 24)}...`);
        setTimeout(() => {
          btn.innerHTML = originalHtml;
        }, 2000);
      } catch (err) {
        console.error('Copy failed:', err);
      }
    });
  });
}

/* ==========================================================================
   3. Certificate Lightbox Modal
   ========================================================================== */
const certData = {
  'cert-gnn': {
    title: 'Learning Graph Neural Networks',
    issuer: 'LinkedIn Learning',
    recipient: 'NANDALAPADU ABDUL RAHIMAN',
    date: 'September 29, 2026',
    duration: '2 hours 13 minutes',
    certId: 'f822939f7887c44af2f3821a2444f1582e227d0e4cc332595b326afef66f1d7b',
    src: 'assets/images/cert-gnn.jpg',
    skills: ['Neural Networks', 'Graph Networks', 'Artificial Intelligence (AI)']
  },
  'cert-math': {
    title: 'Programming Foundations: Discrete Mathematics',
    issuer: 'LinkedIn Learning',
    recipient: 'NANDALAPADU ABDUL RAHIMAN',
    date: 'September 29, 2026',
    duration: '3 hours 9 minutes',
    certId: 'effad5aba6eed140fe6ecf1d1c7af7d367df37a44c6c3fc1a6b008d08dbcc53c',
    src: 'assets/images/cert-discrete-math.jpg',
    skills: ['Discrete Mathematics', 'Programming Foundations']
  }
};

function initCertLightbox() {
  const modal = document.getElementById('certModal');
  const modalTitle = document.getElementById('modalCertTitle');
  const modalImg = document.getElementById('modalCertImage');
  const modalCertId = document.getElementById('modalCertId');
  const modalCopyBtn = document.getElementById('modalCopyBtn');
  const closeBtn = document.getElementById('modalCloseBtn');
  const triggers = document.querySelectorAll('[data-cert-target]');

  if (!modal) return;

  function openCert(key) {
    const data = certData[key];
    if (!data) return;

    modalTitle.textContent = data.title;
    modalImg.src = data.src;
    modalImg.alt = data.title;
    modalCertId.textContent = `ID: ${data.certId}`;
    modalCopyBtn.setAttribute('data-copy', data.certId);

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCert() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  triggers.forEach(trig => {
    trig.addEventListener('click', (e) => {
      e.preventDefault();
      const key = trig.getAttribute('data-cert-target');
      openCert(key);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeCert);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeCert();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeCert();
    }
  });
}

/* ==========================================================================
   4. Contact Form Handler (REST API Integration)
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const statusEl = document.getElementById('formStatus');
  const submitBtn = document.getElementById('submitBtn');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const subject = form.subject.value.trim();
    const message = form.message.value.trim();

    if (!name || !email || !message) {
      showFormStatus('error', 'Please fill in all required fields (Name, Email, Message).');
      return;
    }

    // Set loading state
    submitBtn.disabled = true;
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = `
      <svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-linecap="round">
          <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/>
        </circle>
      </svg> Sending message...
    `;

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonSafeStringify({ name, email, subject, message })
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        showFormStatus('success', 'Thank you, Abdul! Your message has been sent successfully.');
        form.reset();
        showToast('Message sent to Abdul Rehman!');
        fetchInboxCount();
      } else {
        showFormStatus('error', resData.error || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      console.error('Contact submit error:', err);
      showFormStatus('error', 'Network error: could not connect to server.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });

  function showFormStatus(type, msg) {
    statusEl.className = `form-status ${type}`;
    statusEl.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        ${type === 'success' 
          ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>'
          : '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'}
      </svg>
      <span>${msg}</span>
    `;
    statusEl.style.display = 'flex';
  }
}

function jsonSafeStringify(obj) {
  return JSON.stringify(obj);
}

/* ==========================================================================
   5. Inquiries / Inbox Modal (Admin Messages Viewer)
   ========================================================================== */
function initInboxViewer() {
  const inboxBtn = document.getElementById('openInboxBtn');
  const inboxModal = document.getElementById('inboxModal');
  const inboxCloseBtn = document.getElementById('inboxCloseBtn');
  const inboxList = document.getElementById('inboxList');

  if (!inboxBtn || !inboxModal) return;

  async function loadMessages() {
    inboxList.innerHTML = '<div style="padding: 2rem; text-align: center; color: #64748b;">Loading inquiries...</div>';
    try {
      const res = await fetch('/api/messages');
      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        renderMessages(data.messages);
        updateInboxBadge(data.messages.length);
      } else {
        inboxList.innerHTML = '<div class="inbox-empty-state">No messages available.</div>';
      }
    } catch (err) {
      inboxList.innerHTML = '<div class="inbox-empty-state">Error loading messages. Ensure backend server is running.</div>';
    }
  }

  function renderMessages(messages) {
    if (messages.length === 0) {
      inboxList.innerHTML = '<div class="inbox-empty-state">No inquiries received yet. Submit the contact form to test!</div>';
      return;
    }

    inboxList.innerHTML = messages.map(msg => {
      const dateStr = msg.timestamp ? new Date(msg.timestamp).toLocaleString() : 'Just now';
      return `
        <div class="inbox-message-card" id="msg-${msg.id}">
          <div class="inbox-msg-header">
            <div>
              <span class="inbox-msg-sender">${escapeHtml(msg.name)}</span>
              <a href="mailto:${escapeHtml(msg.email)}" class="inbox-msg-email">&lt;${escapeHtml(msg.email)}&gt;</a>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="inbox-msg-date">${dateStr}</span>
              <button class="icon-btn delete-msg-btn" data-delete-id="${msg.id}" title="Delete Message">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
          <div class="inbox-msg-subject">Subject: ${escapeHtml(msg.subject || 'General Inquiry')}</div>
          <div class="inbox-msg-body">${escapeHtml(msg.message)}</div>
        </div>
      `;
    }).join('');

    // Attach delete handlers
    document.querySelectorAll('.delete-msg-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-delete-id');
        if (!confirm('Delete this message?')) return;
        try {
          const res = await fetch('/api/messages/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
          });
          const result = await res.json();
          if (result.success) {
            document.getElementById(`msg-${id}`)?.remove();
            showToast('Message deleted');
            fetchInboxCount();
          }
        } catch (e) {
          console.error(e);
        }
      });
    });
  }

  inboxBtn.addEventListener('click', () => {
    inboxModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    loadMessages();
  });

  if (inboxCloseBtn) {
    inboxCloseBtn.addEventListener('click', () => {
      inboxModal.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  inboxModal.addEventListener('click', (e) => {
    if (e.target === inboxModal) {
      inboxModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

async function fetchInboxCount() {
  try {
    const res = await fetch('/api/messages');
    const data = await res.json();
    if (data.success && Array.isArray(data.messages)) {
      updateInboxBadge(data.messages.length);
    }
  } catch (err) {
    // server might be offline or initializing
  }
}

function updateInboxBadge(count) {
  const badge = document.getElementById('inboxBadge');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-block' : 'none';
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, function (m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m];
  });
}
