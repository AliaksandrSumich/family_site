
// Mobile menu toggle with accessible state and dropdown layout
const menuBtn = document.getElementById('menu-btn');
const nav = document.getElementById('nav');
const MOBILE_BREAKPOINT = 767;

function isMobile() { return window.innerWidth <= MOBILE_BREAKPOINT; }
function openMobileMenu() {
  if (!nav) return;
  nav.classList.remove('hidden');
  nav.classList.add('open');
  if (menuBtn) menuBtn.setAttribute('aria-expanded', 'true');
}
function closeMobileMenu() {
  if (!nav) return;
  nav.classList.add('hidden');
  nav.classList.remove('open');
  if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
}

if (menuBtn && nav) {
  menuBtn.addEventListener('click', () => {
    const expanded = menuBtn.getAttribute('aria-expanded') === 'true';
    if (expanded) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  // Close menu when a nav link is clicked (on mobile)
  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      if (isMobile()) closeMobileMenu();
    });
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isMobile()) closeMobileMenu();
  });

  // Cleanup on resize (remove dropdown state on desktop)
  window.addEventListener('resize', () => {
    if (!isMobile()) {
      nav.classList.remove('open');
      if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

// Smooth scroll for internal nav links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({behavior: 'smooth'});
      history.pushState(null, '', a.getAttribute('href'));
    }
  });
});

// Simple CTA tracking
function track(eventName) {
  try { 
    const payload = {event: eventName, ts: Date.now()};
    console.log('track', payload);
  } catch(_) {}
}
window.track = track;

// Replace placeholder BOT_LINK quickly (optional)
window.addEventListener('DOMContentLoaded', () => {
  const fromEnv = localStorage.getItem('BOT_LINK_OVERRIDE');
  if (fromEnv) {
    document.querySelectorAll('a[data-cta=bot]').forEach(a => a.href = fromEnv);
  }
});

// Collapse listening tests by default on mobile; keep open on desktop
function updateListeningDetailsState() {
  const det = document.getElementById('details-listening');
  if (!det) return;
  if (isMobile()) {
    det.removeAttribute('open'); // collapsed by default on mobile
  } else {
    det.setAttribute('open', ''); // open on desktop
  }
}

window.addEventListener('DOMContentLoaded', updateListeningDetailsState);
window.addEventListener('resize', updateListeningDetailsState);
