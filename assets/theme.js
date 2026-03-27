/* ================================================
   VELLA — Global Theme JavaScript
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ========================
     Scroll Animations (IntersectionObserver)
     ======================== */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        entry.target.style.animationPlayState = 'running';
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.animate-in').forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
  });

  /* ========================
     Sticky Header Scroll Effect
     ======================== */
  const headerWrapper = document.querySelector('.header-wrapper');
  if (headerWrapper) {
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const curr = window.scrollY;
      if (curr > 50) {
        headerWrapper.classList.add('is-scrolled');
      } else {
        headerWrapper.classList.remove('is-scrolled');
      }
      lastScroll = curr;
    }, { passive: true });
  }

  /* ========================
     Announcement Bar Dismiss
     ======================== */
  const announcementBar = document.querySelector('.announcement-bar');
  const announcementClose = document.querySelector('.announcement-bar__close');
  if (announcementBar && announcementClose) {
    if (sessionStorage.getItem('vella-announcement-dismissed')) {
      announcementBar.classList.add('is-hidden');
    }
    announcementClose.addEventListener('click', () => {
      announcementBar.classList.add('is-hidden');
      sessionStorage.setItem('vella-announcement-dismissed', 'true');
    });
  }

  /* ========================
     Mobile Menu
     ======================== */
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileMenuOverlay = document.querySelector('.mobile-menu__overlay');
  const mobileMenuClose = document.querySelector('.mobile-menu__close');

  function openMobileMenu() {
    if (mobileMenu) mobileMenu.classList.add('is-open');
    if (mobileMenuOverlay) mobileMenuOverlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeMobileMenu() {
    if (mobileMenu) mobileMenu.classList.remove('is-open');
    if (mobileMenuOverlay) mobileMenuOverlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  if (hamburger) hamburger.addEventListener('click', openMobileMenu);
  if (mobileMenuClose) mobileMenuClose.addEventListener('click', closeMobileMenu);
  if (mobileMenuOverlay) mobileMenuOverlay.addEventListener('click', closeMobileMenu);

  /* ========================
     Cart Drawer
     ======================== */
  const cartDrawer = document.querySelector('.cart-drawer');
  const cartOverlay = document.querySelector('.cart-drawer__overlay');
  const cartClose = document.querySelector('.cart-drawer__close');
  const cartTriggers = document.querySelectorAll('[data-cart-trigger]');

  function openCart() {
    if (cartDrawer) cartDrawer.classList.add('is-open');
    if (cartOverlay) cartOverlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    if (cartDrawer) cartDrawer.classList.remove('is-open');
    if (cartOverlay) cartOverlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  cartTriggers.forEach(t => t.addEventListener('click', (e) => { e.preventDefault(); openCart(); }));
  if (cartClose) cartClose.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // Expose globally
  window.vellaCart = { open: openCart, close: closeCart };

  /* ========================
     FAQ Accordion
     ======================== */
  document.querySelectorAll('.faq-item__question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('is-open');
      // Close all
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('is-open'));
      // Toggle current
      if (!isOpen) item.classList.add('is-open');
    });
  });

  /* ========================
     Product Tabs
     ======================== */
  document.querySelectorAll('.product-tabs__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      // Buttons
      document.querySelectorAll('.product-tabs__btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      // Panels
      document.querySelectorAll('.product-tabs__panel').forEach(p => p.classList.remove('is-active'));
      const panel = document.getElementById(tabId);
      if (panel) panel.classList.add('is-active');
    });
  });

  /* ========================
     Newsletter Form
     ======================== */
  const nlForm = document.querySelector('.newsletter__form-el');
  if (nlForm) {
    nlForm.addEventListener('submit', (e) => {
      const formWrapper = nlForm.closest('.newsletter__form');
      if (formWrapper) formWrapper.classList.add('is-success');
    });
  }

  /* ========================
     Quantity Selector
     ======================== */
  document.querySelectorAll('.quantity-selector').forEach(selector => {
    const minus = selector.querySelector('[data-qty-minus]');
    const plus = selector.querySelector('[data-qty-plus]');
    const input = selector.querySelector('input');
    if (minus && plus && input) {
      minus.addEventListener('click', () => {
        const val = parseInt(input.value) || 1;
        if (val > 1) input.value = val - 1;
      });
      plus.addEventListener('click', () => {
        const val = parseInt(input.value) || 1;
        if (val < 10) input.value = val + 1;
      });
    }
  });

});
