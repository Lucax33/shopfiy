/* ================================================
   VELLA — Product Page JavaScript
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ========================
     Product Gallery
     ======================== */
  const mainImage = document.querySelector('.product-gallery__main img');
  const thumbs = document.querySelectorAll('.product-gallery__thumb');

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('is-active'));
      thumb.classList.add('is-active');
      const newSrc = thumb.dataset.fullSrc;
      if (mainImage && newSrc) {
        mainImage.src = newSrc;
        mainImage.srcset = thumb.dataset.srcset || '';
      }
    });
  });

  /* ========================
     Color Swatches
     ======================== */
  const colorSwatches = document.querySelectorAll('.color-swatch');
  const colorLabel = document.querySelector('.color-label');

  colorSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      colorSwatches.forEach(s => s.classList.remove('is-active'));
      swatch.classList.add('is-active');
      if (colorLabel) colorLabel.textContent = swatch.dataset.colorName || '';
      // Update variant selector if using Shopify's variant system
      const variantId = swatch.dataset.variantId;
      if (variantId) {
        const variantInput = document.querySelector('input[name="id"]');
        if (variantInput) variantInput.value = variantId;
      }
    });
  });

  /* ========================
     Size Selector
     ======================== */
  const sizeOptions = document.querySelectorAll('.size-option:not(.is-unavailable)');
  sizeOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      sizeOptions.forEach(o => o.classList.remove('is-active'));
      opt.classList.add('is-active');
    });
  });

  /* ========================
     Add to Cart
     ======================== */
  const addToCartBtn = document.querySelector('[data-add-to-cart]');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const form = addToCartBtn.closest('form');
      if (!form) return;

      const originalText = addToCartBtn.textContent;
      addToCartBtn.textContent = 'ADDING...';
      addToCartBtn.disabled = true;

      try {
        const formData = new FormData(form);
        const response = await fetch('/cart/add.js', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          addToCartBtn.textContent = '✓ ADDED!';
          // Update cart count
          const cartRes = await fetch('/cart.js');
          const cart = await cartRes.json();
          document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = cart.item_count;
            el.style.display = cart.item_count > 0 ? 'flex' : 'none';
          });
          // Open cart drawer
          if (window.vellaCart) window.vellaCart.open();
          setTimeout(() => {
            addToCartBtn.textContent = originalText;
            addToCartBtn.disabled = false;
          }, 2000);
        } else {
          addToCartBtn.textContent = 'ERROR';
          setTimeout(() => {
            addToCartBtn.textContent = originalText;
            addToCartBtn.disabled = false;
          }, 2000);
        }
      } catch (err) {
        addToCartBtn.textContent = originalText;
        addToCartBtn.disabled = false;
      }
    });
  }

});
