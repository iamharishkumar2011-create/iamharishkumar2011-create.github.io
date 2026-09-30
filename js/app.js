/**
 * Dr. Harish Kumar — Academic Portfolio & Intellectual Archive
 * Editorial Interaction & Research Filtering
 */

document.addEventListener('DOMContentLoaded', () => {
  initArchiveFilter();
  initSmoothScroll();
  initScrollSpy();
});

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
      visibleCount++;
    } else {
      row.style.display = 'none';
    }
  });

  if (statusEl) {
    statusEl.textContent = `Showing ${visibleCount} publications in archive`;
  }
}

window.toggleBibtex = function(id) {
  const el = document.getElementById(`bibtex-${id}`);
  if (el) {
    el.classList.toggle('active');
  }
};

window.copyBibtex = function(id) {
  const el = document.getElementById(`bibtex-code-${id}`);
  if (el) {
    copyText(el.textContent.trim(), 'BibTeX citation copied');
  }
};

window.copyApa = function(id) {
  const row = document.getElementById(id);
  if (!row) return;
  const authors = row.querySelector('.archive-authors')?.textContent || '';
  const title = row.querySelector('.archive-title')?.textContent || '';
  const venue = row.querySelector('.archive-venue')?.textContent || '';
  const year = row.querySelector('.archive-year')?.textContent || '';
  const text = `${authors} (${year}). ${title.trim()}. ${venue.trim()}.`;
  copyText(text, 'APA citation copied');
};

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
    const scrollY = window.pageYOffset;

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
