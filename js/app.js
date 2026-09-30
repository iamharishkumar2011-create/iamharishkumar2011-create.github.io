/**
 * Dr. Harish Kumar - Academic Portfolio Website
 * Main Interactive Application Script
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all interactive modules
  initTheme();
  initScrollProgress();
  initStatsObserver();
  initPublicationsExplorer();
  initResearchPipeline();
  initMediaSection();
  initCollaborators();
  initTeachingCourses();
  initTimeline();
  initHonors();
  initContactForm();
  initMobileNav();
  initScrollSpy();
  initBackToTop();
});

/* --------------------------------------------------------------------------
   Theme Controller (Light / Dark Mode)
   -------------------------------------------------------------------------- */
function initTheme() {
  const themeBtn = document.getElementById('theme-toggle-btn');
  const storedTheme = localStorage.getItem('hk_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Default to dark mode for an avant-garde spatial computing feel
  const currentTheme = storedTheme || (prefersDark ? 'dark' : 'dark');
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon(currentTheme);

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const active = document.documentElement.getAttribute('data-theme');
      const nextTheme = active === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('hk_theme', nextTheme);
      updateThemeIcon(nextTheme);
      showToast(`Switched to ${nextTheme} theme`);
    });
  }
}

function updateThemeIcon(theme) {
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (!themeBtn) return;
  if (theme === 'dark') {
    themeBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>`;
    themeBtn.setAttribute('title', 'Switch to light theme');
    themeBtn.setAttribute('aria-label', 'Switch to light theme');
  } else {
    themeBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>`;
    themeBtn.setAttribute('title', 'Switch to dark theme');
    themeBtn.setAttribute('aria-label', 'Switch to dark theme');
  }
}

/* --------------------------------------------------------------------------
   Scroll Progress Indicator
   -------------------------------------------------------------------------- */
function initScrollProgress() {
  const progressBar = document.getElementById('scroll-progress');
  if (!progressBar) return;
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = scrollPercent + '%';
  }, { passive: true });
}

/* --------------------------------------------------------------------------
   Stats Counter Animation
   -------------------------------------------------------------------------- */
function initStatsObserver() {
  const statsElements = document.querySelectorAll('.stat-number');
  if (!statsElements.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateStat(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  statsElements.forEach(el => observer.observe(el));
}

function animateStat(element) {
  const targetVal = parseFloat(element.getAttribute('data-target'));
  const prefix = element.getAttribute('data-prefix') || '';
  const suffix = element.getAttribute('data-suffix') || '';
  const duration = 1400;
  const startTime = performance.now();

  function updateCount(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Smooth ease-out quad
    const ease = 1 - Math.pow(1 - progress, 3);
    const currentNum = Math.floor(ease * targetVal);

    element.textContent = `${prefix}${currentNum}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(updateCount);
    } else {
      element.textContent = `${prefix}${targetVal}${suffix}`;
    }
  }

  requestAnimationFrame(updateCount);
}

/* --------------------------------------------------------------------------
   Publications Explorer (Filter + Search + BibTeX + APA copy)
   -------------------------------------------------------------------------- */
let activePubFilter = 'all';
let searchPubQuery = '';

function initPublicationsExplorer() {
  const container = document.getElementById('publications-list');
  const tabs = document.querySelectorAll('.filter-tab');
  const searchInput = document.getElementById('pub-search-input');
  const clearBtn = document.getElementById('clear-search-btn');

  if (!container || !window.CV_DATA) return;

  // Render initial list
  renderPublications();

  // Tab click listeners
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activePubFilter = tab.getAttribute('data-filter');
      renderPublications();
    });
  });

  // Search input listeners
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchPubQuery = e.target.value.toLowerCase().trim();
      if (clearBtn) {
        clearBtn.style.display = searchPubQuery ? 'block' : 'none';
      }
      renderPublications();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      searchPubQuery = '';
      clearBtn.style.display = 'none';
      renderPublications();
      if (searchInput) searchInput.focus();
    });
  }
}

function renderPublications() {
  const container = document.getElementById('publications-list');
  const countDisplay = document.getElementById('pub-results-count');
  if (!container || !window.CV_DATA) return;

  const allPubs = window.CV_DATA.publications;

  const filtered = allPubs.filter(pub => {
    // Category match
    const categoryMatch = (activePubFilter === 'all') || (pub.category === activePubFilter);
    if (!categoryMatch) return false;

    // Search query match
    if (!searchPubQuery) return true;
    const combinedStr = `${pub.title} ${pub.authors} ${pub.journal} ${pub.details} ${pub.year} ${(pub.tags || []).join(' ')}`.toLowerCase();
    return combinedStr.includes(searchPubQuery);
  });

  if (countDisplay) {
    countDisplay.textContent = `Showing ${filtered.length} of ${allPubs.length} publications`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
        <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">No publications matching "<strong>${escapeHtml(searchPubQuery)}</strong>"</p>
        <p style="font-size: 0.875rem;">Try clearing the search query or selecting a different category filter.</p>
      </div>`;
    return;
  }

  container.innerHTML = filtered.map(pub => {
    // Highlight Harish Kumar
    const highlightedAuthors = pub.authors.replace(/Kumar, H\./g, '<strong>Kumar, H.</strong>');

    let badgeClass = 'abdc-a';
    let cardClass = 'pub-card';
    if (pub.category === 'abdc-astar') {
      badgeClass = 'abdc-astar';
      cardClass += ' highlight-astar';
    } else if (pub.category === 'teaching-case') {
      badgeClass = 'case';
      cardClass += ' highlight-case';
    } else if (pub.category === 'other') {
      badgeClass = 'other';
    }

    const tagsHtml = (pub.tags || []).map(t => `<span class="pill-tag">${escapeHtml(t)}</span>`).join('');

    const doiBtn = pub.doi && pub.doi !== '#' ? `
      <a href="${pub.doi}" target="_blank" rel="noopener noreferrer" class="btn-action">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        ${pub.category === 'teaching-case' ? 'Harvard / Ivey Link' : 'DOI / Article'}
      </a>` : '';

    return `
      <article class="${cardClass}" id="${pub.id}">
        <div class="pub-card-top">
          <div class="pub-badges">
            <span class="tier-badge ${badgeClass}">${pub.badge}</span>
            <span class="pub-year">${pub.year}</span>
          </div>
        </div>

        <h3 class="pub-title">${escapeHtml(pub.title)}</h3>
        <p class="pub-authors">${highlightedAuthors}</p>
        <p class="pub-venue">${escapeHtml(pub.journal)}${pub.details ? ' — ' + escapeHtml(pub.details) : ''}</p>

        <div class="pub-tags">${tagsHtml}</div>

        <div class="pub-actions">
          ${doiBtn}
          <button class="btn-action" onclick="copyApaCitation('${pub.id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            Copy APA
          </button>
          <button class="btn-action" onclick="toggleBibtex('${pub.id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
            BibTeX
          </button>
        </div>

        <div class="bibtex-drawer" id="bibtex-${pub.id}">
          <pre>${escapeHtml(pub.bibtex)}</pre>
          <div style="margin-top: 0.75rem;">
            <button class="btn-action" onclick="copyBibtex('${pub.id}')" style="background: var(--bg-card);">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              Copy BibTeX Code
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// Global publication interaction helpers
window.toggleBibtex = function(id) {
  const drawer = document.getElementById(`bibtex-${id}`);
  if (drawer) {
    drawer.classList.toggle('open');
  }
};

window.copyBibtex = function(id) {
  const pub = window.CV_DATA.publications.find(p => p.id === id);
  if (!pub || !pub.bibtex) return;
  copyToClipboard(pub.bibtex, 'BibTeX citation copied to clipboard!');
};

window.copyApaCitation = function(id) {
  const pub = window.CV_DATA.publications.find(p => p.id === id);
  if (!pub) return;
  const apa = `${pub.authors} (${pub.year}). ${pub.title}. ${pub.journal}${pub.details ? ', ' + pub.details : ''}. ${pub.doi}`;
  copyToClipboard(apa, 'APA citation copied to clipboard!');
};

/* --------------------------------------------------------------------------
   Research Pipeline Module
   -------------------------------------------------------------------------- */
function initResearchPipeline() {
  const ft50Container = document.getElementById('pipeline-ft50-list');
  const reviewContainer = document.getElementById('pipeline-review-list');
  if (!ft50Container || !reviewContainer || !window.CV_DATA) return;

  // FT-50 Works in Progress
  ft50Container.innerHTML = window.CV_DATA.workInProgress.map(item => `
    <div class="pipeline-card">
      <span class="pipeline-target-tag ft50">${item.tier}</span>
      <h4>${escapeHtml(item.title)}</h4>
      <div class="target-journal">Target: ${escapeHtml(item.targetJournal)}</div>
      <div class="collaborators"><strong>Co-authors:</strong> ${escapeHtml(item.collaborators)}</div>
      <div class="focus-note">${escapeHtml(item.focus)}</div>
    </div>
  `).join('');

  // Under-Review Articles
  reviewContainer.innerHTML = window.CV_DATA.underReview.map(item => `
    <div class="pipeline-card">
      <span class="pipeline-target-tag">${item.tier} • ${item.status}</span>
      <h4>${escapeHtml(item.title)}</h4>
      <div class="target-journal">Venue: ${escapeHtml(item.target)}</div>
      <div class="collaborators">${escapeHtml(item.coauthors)}</div>
    </div>
  `).join('');
}

/* --------------------------------------------------------------------------
   Teaching Courses
   -------------------------------------------------------------------------- */
function initTeachingCourses() {
  const container = document.getElementById('courses-grid');
  if (!container || !window.CV_DATA) return;

  container.innerHTML = window.CV_DATA.courses.map(course => `
    <div class="course-card">
      <span class="course-badge">${escapeHtml(course.badge)}</span>
      <h3>${escapeHtml(course.title)}</h3>
      <div class="course-level">${escapeHtml(course.level)}</div>
      <p>${escapeHtml(course.description)}</p>
      <div class="institution">${escapeHtml(course.institution)}</div>
    </div>
  `).join('');
}

/* --------------------------------------------------------------------------
   Media Articles & Press Room
   -------------------------------------------------------------------------- */
function initMediaSection() {
  const container = document.getElementById('media-grid');
  if (!container || !window.CV_DATA) return;

  container.innerHTML = window.CV_DATA.mediaArticles.map(art => `
    <article class="media-card">
      <div class="media-card-header">
        <span class="media-outlet">${escapeHtml(art.outlet)}</span>
        <span class="media-date">${escapeHtml(art.date)}</span>
      </div>
      <h4 class="media-title">"${escapeHtml(art.title)}"</h4>
      <div class="media-footer">
        <span class="media-category">${escapeHtml(art.category)}</span>
        <a href="https://scholar.google.com/citations?user=RQaX1WwAAAAJ" target="_blank" rel="noopener noreferrer" class="btn-action" style="padding: 0.2rem 0.6rem; font-size: 0.75rem;">
          Read Feature →
        </a>
      </div>
    </article>
  `).join('');
}

/* --------------------------------------------------------------------------
   Global Collaborators
   -------------------------------------------------------------------------- */
function initCollaborators() {
  const container = document.getElementById('collab-grid');
  if (!container || !window.CV_DATA) return;

  container.innerHTML = window.CV_DATA.collaborators.map(c => {
    // Generate Initials
    const initials = c.name.replace('Prof. ', '').split(' ').map(n => n[0]).join('').slice(0, 2);

    return `
      <div class="collab-card">
        <div class="collab-avatar">${initials}</div>
        <h4>${escapeHtml(c.name)}</h4>
        <div class="collab-title">${escapeHtml(c.title)}</div>
        <div class="collab-inst">${escapeHtml(c.institution)}</div>
        <div class="collab-joint"><strong>Joint Scholarship:</strong> ${escapeHtml(c.coauthorOn)}</div>
        <div>
          <a href="mailto:${c.email}" class="collab-email">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline; vertical-align:middle; margin-right:4px;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            ${escapeHtml(c.email)}
          </a>
        </div>
      </div>
    `;
  }).join('');
}

/* --------------------------------------------------------------------------
   Academic Timeline (Experience & Ph.D.)
   -------------------------------------------------------------------------- */
function initTimeline() {
  const container = document.getElementById('experience-timeline');
  if (!container || !window.CV_DATA) return;

  const items = [
    ...window.CV_DATA.academicExperience.map(exp => ({
      period: exp.period,
      role: exp.role,
      institution: exp.institution,
      points: exp.points
    })),
    ...window.CV_DATA.education.map(edu => ({
      period: edu.period,
      role: edu.degree,
      institution: edu.institution,
      points: [edu.field, edu.notes].filter(Boolean)
    }))
  ];

  container.innerHTML = items.map(item => `
    <div class="timeline-item">
      <div class="timeline-dot"></div>
      <div class="timeline-content">
        <div class="timeline-period">${escapeHtml(item.period)}</div>
        <h4 class="timeline-role">${escapeHtml(item.role)}</h4>
        <div class="timeline-institution">${escapeHtml(item.institution)}</div>
        <ul class="timeline-list">
          ${item.points.map(pt => `<li>${escapeHtml(pt)}</li>`).join('')}
        </ul>
      </div>
    </div>
  `).join('');
}

/* --------------------------------------------------------------------------
   Honors & Distinctions
   -------------------------------------------------------------------------- */
function initHonors() {
  const container = document.getElementById('honors-grid');
  if (!container || !window.CV_DATA) return;

  container.innerHTML = window.CV_DATA.honors.map(h => `
    <div class="pillar-card" style="padding: 1.5rem;">
      <div style="font-size: 0.75rem; font-weight: 700; color: var(--accent-secondary); margin-bottom: 0.35rem;">
        ${escapeHtml(h.year)}
      </div>
      <h4 style="font-size: 1.05rem; margin-bottom: 0.4rem; color: var(--text-primary);">${escapeHtml(h.title)}</h4>
      <div style="font-size: 0.85rem; font-weight: 600; color: var(--accent-primary); margin-bottom: 0.5rem;">
        ${escapeHtml(h.event)}
      </div>
      <p style="font-size: 0.825rem; margin: 0; color: var(--text-muted);">${escapeHtml(h.desc)}</p>
    </div>
  `).join('');
}

/* --------------------------------------------------------------------------
   Contact Form Handler
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contact-inquiry-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('sender-name')?.value || 'Colleague / Student';
    const email = document.getElementById('sender-email')?.value || '';
    const subject = document.getElementById('sender-subject')?.value || 'Academic Collaboration Inquiry';
    const message = document.getElementById('sender-message')?.value || '';

    const mailtoUri = `mailto:iamharishkumar2011@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent("From: " + name + " (" + email + ")\n\n" + message)}`;
    
    showToast('Opening default email client...');
    window.location.href = mailtoUri;
  });
}

/* --------------------------------------------------------------------------
   Mobile Navigation Drawer
   -------------------------------------------------------------------------- */
function initMobileNav() {
  const toggleBtn = document.getElementById('mobile-nav-toggle');
  const navLinks = document.getElementById('nav-links');

  if (!toggleBtn || !navLinks) return;

  toggleBtn.addEventListener('click', () => {
    navLinks.classList.toggle('mobile-open');
    const isOpen = navLinks.classList.contains('mobile-open');
    toggleBtn.setAttribute('aria-expanded', isOpen);
  });

  // Close when clicking a link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('mobile-open');
    });
  });
}

/* --------------------------------------------------------------------------
   Scroll Spy for Active Nav Links
   -------------------------------------------------------------------------- */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });
}

/* --------------------------------------------------------------------------
   Back to Top
   -------------------------------------------------------------------------- */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* --------------------------------------------------------------------------
   Clipboard & Toast Utility
   -------------------------------------------------------------------------- */
function copyToClipboard(text, successMsg) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMsg);
    }).catch(() => {
      fallbackCopy(text, successMsg);
    });
  } else {
    fallbackCopy(text, successMsg);
  }
}

function fallbackCopy(text, successMsg) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    showToast(successMsg);
  } catch (err) {
    showToast('Failed to copy to clipboard');
  }
  document.body.removeChild(textarea);
}

function showToast(message) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.25s ease';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 250);
  }, 2800);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
