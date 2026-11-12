/**
 * Dr. Harish Kumar — Academic Portfolio & Intellectual Archive
 * Editorial Interaction, Archival Filtering & World-Class Animation Engine
 */

// Inject essential editorial animation keyframes and transition defaults
function injectAnimationStyles() {
  if (document.getElementById('editorial-animations-css')) return;
  const style = document.createElement('style');
  style.id = 'editorial-animations-css';
  style.textContent = `
    /* Body load transition */
    body {
      opacity: 0.96;
      transition: opacity 0.35s ease;
    }
    body.loaded {
      opacity: 1;
    }

    /* Masthead elevation on scroll */
    .masthead {
      transition: box-shadow 0.28s cubic-bezier(0.2, 0.8, 0.2, 1), background-color 0.28s ease, border-color 0.28s ease;
    }
    .masthead.scrolled {
      box-shadow: 0 4px 24px rgba(24, 23, 22, 0.06);
      border-bottom-color: var(--rule-strong, #CDC6B8);
    }

    /* Word split typography reveal */
    .word-reveal-wrapper {
      overflow: hidden;
      display: inline-block;
      vertical-align: bottom;
    }
    .word-reveal {
      display: inline-block;
      transform: translateY(112%);
      opacity: 0;
      transition: transform 0.65s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.65s ease;
      will-change: transform, opacity;
    }
    .word-reveal.animate {
      transform: translateY(0);
      opacity: 1;
    }

    /* General scroll reveals */
    .reveal {
      opacity: 0;
      transform: translateY(22px);
      transition: opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1), transform 0.75s cubic-bezier(0.16, 1, 0.3, 1);
      will-change: opacity, transform;
    }
    .reveal.active {
      opacity: 1;
      transform: translateY(0);
    }

    /* Section label animated underline rule */
    .section-label {
      position: relative;
      display: inline-block;
    }
    .section-label::after {
      content: '';
      display: block;
      width: 0%;
      height: 1px;
      background-color: var(--accent-editorial, #8C2E24);
      margin-top: 5px;
      transition: width 0.7s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .section-label.animate::after {
      width: 100%;
    }

    /* Staggered Archive Row Entrance */
    .archive-row {
      opacity: 0;
      transform: translateY(12px);
      transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .archive-row.active {
      opacity: 1;
      transform: translateY(0);
    }

    /* Editorial Show More / Show Less Button */
    .editorial-toggle-btn {
      font-family: var(--font-mono, 'JetBrains Mono', Menlo, monospace);
      font-size: 0.75rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      background: transparent;
      border: 1px solid var(--rule-strong, #CDC6B8);
      color: var(--text-primary, #181716);
      padding: 0.65rem 1.6rem;
      cursor: pointer;
      border-radius: 1px;
      transition: all 0.22s cubic-bezier(0.2, 0.8, 0.2, 1);
    }
    .editorial-toggle-btn:hover {
      background-color: var(--text-primary, #181716);
      color: var(--bg-primary, #FAF7F2);
    }
  `;
  document.head.appendChild(style);
}

// --------------------------------------------------------------------------
// Core Archive State & Filtering (Existing functionality preserved)
// --------------------------------------------------------------------------
let currentArchiveFilter = 'all';
let currentSearchQuery = '';

function initArchiveFilter() {
  const tabs = document.querySelectorAll('.archive-tab');
  const searchInput = document.getElementById('archive-search');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentArchiveFilter = tab.getAttribute('data-filter');
      filterArchive();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value.toLowerCase().trim();
      filterArchive();
    });
  }
}

function filterArchive() {
  const rows = document.querySelectorAll('.archive-row');
  const statusEl = document.getElementById('archive-status');
  let visibleCount = 0;

  rows.forEach(row => {
    const category = row.getAttribute('data-category');
    const textContent = row.textContent.toLowerCase();

    const matchesCategory = (currentArchiveFilter === 'all') || (category === currentArchiveFilter);
    const matchesSearch = !currentSearchQuery || textContent.includes(currentSearchQuery);

    if (matchesCategory && matchesSearch) {
      row.style.display = 'grid';
      row.classList.add('active'); // Ensure matching filtered rows are visible
      visibleCount++;
    } else {
      row.style.display = 'none';
    }
  });

  if (statusEl) {
    statusEl.textContent = `Showing ${visibleCount} publications in archive`;
  }
}

// --------------------------------------------------------------------------
// Citation Modals & Clipboard Utilities (Existing functionality preserved)
// --------------------------------------------------------------------------
function toggleBibtex(id) {
  const el = document.getElementById(`bibtex-${id}`);
  if (el) {
    el.classList.toggle('active');
  }
}

function copyBibtex(id) {
  const el = document.getElementById(`bibtex-code-${id}`);
  if (el) {
    copyText(el.textContent.trim(), 'BibTeX citation copied');
  }
}

function copyApa(id) {
  const row = document.getElementById(id);
  if (!row) return;
  const authors = row.querySelector('.archive-authors')?.textContent || '';
  const title = row.querySelector('.archive-title')?.textContent || '';
  const venue = row.querySelector('.archive-venue')?.textContent || '';
  const year = row.querySelector('.archive-year')?.textContent || '';
  const text = `${authors} (${year}). ${title.trim()}. ${venue.trim()}.`;
  copyText(text, 'APA citation copied');
}

function copyText(str, msg) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(str).then(() => showToast(msg));
  } else {
    const t = document.createElement('textarea');
    t.value = str;
    document.body.appendChild(t);
    t.select();
    document.execCommand('copy');
    document.body.removeChild(t);
    showToast(msg);
  }
}

function showToast(msg) {
  const existing = document.querySelector('.editorial-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'editorial-toast';
  toast.textContent = msg;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.25s ease';
    setTimeout(() => toast.remove(), 250);
  }, 2200);
}

// --------------------------------------------------------------------------
// Navigation & Smooth Scroll (Existing functionality preserved)
// --------------------------------------------------------------------------
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '#hero') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      const height = sec.offsetHeight;
      if (scrollY >= top && scrollY < top + height) {
        current = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });
}

// ==========================================================================
// NEW EDITORIAL ANIMATION FEATURES
// ==========================================================================

/**
 * 1. IntersectionObserver-based scroll reveals
 * Observes all .reveal elements. When entering viewport (threshold: 0.15),
 * adds .active class to trigger CSS transitions and unobserves.
 */
function initScrollReveals() {
  const revealElements = document.querySelectorAll('.reveal');
  if (!revealElements.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealElements.forEach(el => observer.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('active'));
  }
}

/**
 * 2. Hero text split animation
 * Wraps each word of .hero-statement in .word-reveal-wrapper and .word-reveal.
 * After a 300ms delay, adds .animate class with staggered 50ms intervals.
 */
function initHeroTextSplit() {
  const heroEl = document.querySelector('.hero-statement');
  if (!heroEl) return;

  const rawText = heroEl.textContent.trim();
  if (!rawText) return;

  const words = rawText.split(/\s+/);
  heroEl.innerHTML = words.map(word =>
    `<span class="word-reveal-wrapper" style="overflow:hidden;display:inline-block"><span class="word-reveal">${word}</span></span>`
  ).join(' ');

  setTimeout(() => {
    const wordSpans = heroEl.querySelectorAll('.word-reveal');
    wordSpans.forEach((span, index) => {
      setTimeout(() => {
        span.classList.add('animate');
      }, index * 50);
    });
  }, 300);
}

/**
 * 3. Hero meta lead animation
 * Fades in the .hero-meta-lead after 200ms.
 */
function initHeroMetaLead() {
  const metaLead = document.querySelector('.hero-meta-lead');
  if (!metaLead) return;

  metaLead.style.opacity = '0';
  metaLead.style.transform = 'translateY(5px)';
  metaLead.style.transition = 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';

  setTimeout(() => {
    metaLead.style.opacity = '1';
    metaLead.style.transform = 'translateY(0)';
    metaLead.classList.add('animate');
  }, 200);
}

/**
 * 4. Portrait parallax on scroll
 * Slightly translates .portrait-img (transform: translateY(scrollFactor * 0.08px))
 * using requestAnimationFrame for optimal 60fps/120fps performance.
 */
function initPortraitParallax() {
  const portraitImg = document.querySelector('.portrait-img');
  if (!portraitImg) return;

  portraitImg.style.willChange = 'transform';
  let ticking = false;

  function updateParallax() {
    const scrollFactor = window.pageYOffset || document.documentElement.scrollTop || 0;
    portraitImg.style.transform = `translateY(${scrollFactor * 0.08}px)`;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });

  updateParallax();
}

/**
 * 5. Counter animation for stat numbers
 * When .stat-number enters view, animates from 0 to data-target
 * over 1.5 seconds using easeOutExpo.
 */
function easeOutExpo(x) {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

function animateStatCounter(el) {
  const rawTarget = el.getAttribute('data-target') || el.textContent.trim();
  const match = rawTarget.match(/[\d,.]+/);
  if (!match) return;

  const numStr = match[0].replace(/,/g, '');
  const targetVal = parseFloat(numStr);
  if (isNaN(targetVal)) return;

  const hasDecimals = numStr.includes('.');
  const decimals = hasDecimals ? numStr.split('.')[1].length : 0;
  const prefix = rawTarget.slice(0, rawTarget.indexOf(match[0]));
  const suffix = rawTarget.slice(rawTarget.indexOf(match[0]) + match[0].length);

  const duration = 1500; // 1.5 seconds
  let startTime = null;

  function frame(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOutExpo(progress);
    const current = eased * targetVal;

    const displayNum = decimals > 0 ? current.toFixed(decimals) : Math.round(current).toLocaleString();
    el.textContent = `${prefix}${displayNum}${suffix}`;

    if (progress < 1) {
      window.requestAnimationFrame(frame);
    } else {
      el.textContent = `${prefix}${decimals > 0 ? targetVal.toFixed(decimals) : targetVal.toLocaleString()}${suffix}`;
    }
  }

  window.requestAnimationFrame(frame);
}

function initStatCounters() {
  const statElements = document.querySelectorAll('.stat-number');
  if (!statElements.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateStatCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    statElements.forEach(el => observer.observe(el));
  } else {
    statElements.forEach(el => animateStatCounter(el));
  }
}

/**
 * 6. Smooth nav bar elevation
 * Adds/removes .scrolled class on .masthead when scroll > 50px.
 */
function initMastheadScroll() {
  const masthead = document.querySelector('.masthead');
  if (!masthead) return;

  function handleScroll() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    if (scrollY > 50) {
      masthead.classList.add('scrolled');
    } else {
      masthead.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/**
 * 7. Media section 'Show more' toggle
 * Only shows the first 6 .media-row elements. Adds a 'Show all' button.
 * When clicked, reveals all rows and changes text to 'Show less'.
 */
function initMediaToggle() {
  const mediaRows = document.querySelectorAll('.media-row');
  if (mediaRows.length <= 6) return;

  // Initially hide elements from index 6 onwards
  mediaRows.forEach((row, index) => {
    if (index >= 6) {
      row.style.display = 'none';
    }
  });

  if (document.getElementById('media-toggle-btn')) return;

  const container = document.querySelector('.media-list-editorial') || mediaRows[0].parentElement;
  if (!container) return;

  const toggleWrapper = document.createElement('div');
  toggleWrapper.className = 'media-toggle-wrap';
  toggleWrapper.style.textAlign = 'center';
  toggleWrapper.style.marginTop = '2.5rem';

  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'media-toggle-btn';
  toggleBtn.className = 'editorial-toggle-btn';
  toggleBtn.type = 'button';
  toggleBtn.textContent = 'Show all';

  let isExpanded = false;
  toggleBtn.addEventListener('click', () => {
    isExpanded = !isExpanded;
    mediaRows.forEach((row, index) => {
      if (index >= 6) {
        row.style.display = isExpanded ? 'grid' : 'none';
      }
    });
    toggleBtn.textContent = isExpanded ? 'Show less' : 'Show all';
  });

  toggleWrapper.appendChild(toggleBtn);
  if (container.nextSibling) {
    container.parentNode.insertBefore(toggleWrapper, container.nextSibling);
  } else {
    container.parentNode.appendChild(toggleWrapper);
  }
}

/**
 * 8. Magnetic hover on research entries
 * Adds subtle mousemove-based tilt effect on .research-entry (max 1-2deg rotation)
 * that follows mouse position and cleans up on mouseleave.
 */
function initMagneticResearchEntries() {
  const entries = document.querySelectorAll('.research-entry');
  if (!entries.length) return;

  entries.forEach(entry => {
    entry.addEventListener('mouseenter', () => {
      entry.style.transition = 'transform 0.12s ease-out';
      entry.style.willChange = 'transform';
    });

    entry.addEventListener('mousemove', (e) => {
      const rect = entry.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Max 1.5deg rotation
      const rotateX = ((y - centerY) / centerY) * -1.5;
      const rotateY = ((x - centerX) / centerX) * 1.5;

      entry.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
    });

    entry.addEventListener('mouseleave', () => {
      entry.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
      entry.style.transform = '';
      setTimeout(() => {
        entry.style.transition = '';
        entry.style.willChange = '';
      }, 400);
    });
  });
}

/**
 * 9. Page load animation
 * Adds .loaded class to body after 100ms.
 */
function initPageLoadAnimation() {
  setTimeout(() => {
    document.body.classList.add('loaded');
  }, 100);
}

/**
 * 10. Section label animation
 * When .section-label scrolls into view, adds .animate class
 * for the CSS border-width animation.
 */
function initSectionLabelAnimation() {
  const labels = document.querySelectorAll('.section-label');
  if (!labels.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    labels.forEach(label => observer.observe(label));
  } else {
    labels.forEach(label => label.classList.add('animate'));
  }
}

/**
 * 11. Staggered archive rows
 * When archive section enters viewport, stagger-adds .active class
 * to each .archive-row with 60ms delays.
 */
function initStaggeredArchive() {
  const archiveSec = document.getElementById('archive') || document.querySelector('.archive-results-status');
  const rows = document.querySelectorAll('.archive-row');
  if (!archiveSec || !rows.length) return;

  let triggered = false;

  function runStagger() {
    if (triggered) return;
    triggered = true;

    const visibleRows = Array.from(rows).filter(r => r.style.display !== 'none');
    visibleRows.forEach((row, idx) => {
      setTimeout(() => {
        row.classList.add('active');
      }, idx * 60);
    });
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          runStagger();
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05 });

    observer.observe(archiveSec);
  } else {
    runStagger();
  }
}

// --------------------------------------------------------------------------
// Global Window Bindings (Ensures inline onclick handlers function smoothly)
// --------------------------------------------------------------------------
window.toggleBibtex = toggleBibtex;
window.copyBibtex = copyBibtex;
window.copyApa = copyApa;
window.copyText = copyText;
window.showToast = showToast;
window.filterArchive = filterArchive;
window.initArchiveFilter = initArchiveFilter;
window.initSmoothScroll = initSmoothScroll;
window.initScrollSpy = initScrollSpy;
window.initScrollReveals = initScrollReveals;
window.initHeroTextSplit = initHeroTextSplit;
window.initHeroMetaLead = initHeroMetaLead;
window.initPortraitParallax = initPortraitParallax;
window.initStatCounters = initStatCounters;
window.initMastheadScroll = initMastheadScroll;
window.initMediaToggle = initMediaToggle;
window.initMagneticResearchEntries = initMagneticResearchEntries;
window.initPageLoadAnimation = initPageLoadAnimation;
window.initSectionLabelAnimation = initSectionLabelAnimation;
window.initStaggeredArchive = initStaggeredArchive;

// --------------------------------------------------------------------------
// Orchestrated Initialization
// --------------------------------------------------------------------------
function initializeEditorialEngine() {
  injectAnimationStyles();
  initPageLoadAnimation();

  // Core portfolio mechanisms
  initArchiveFilter();
  initSmoothScroll();
  initScrollSpy();

  // Micro-interactions and animations
  initScrollReveals();
  initHeroTextSplit();
  initHeroMetaLead();
  initPortraitParallax();
  initStatCounters();
  initMastheadScroll();
  initMediaToggle();
  initMagneticResearchEntries();
  initSectionLabelAnimation();
  initStaggeredArchive();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeEditorialEngine);
} else {
  initializeEditorialEngine();
}
