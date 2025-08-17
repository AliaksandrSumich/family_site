
// Mobile menu toggle
const menuBtn = document.getElementById('menu-btn');
const nav = document.getElementById('nav');
if (menuBtn) {
  menuBtn.addEventListener('click', () => {
    nav.classList.toggle('hidden');
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
