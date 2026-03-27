/* ================================================
   VELLA — Product Page JavaScript v1.1
   - Full Shopify variant selection via JSON
   - AJAX Add to Cart with cart drawer refresh
   - Gallery with thumbnail switching
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ========================
     Product Variant Data
     (embedded in page via theme.liquid or product section)
     ======================== */
  const productForm = document.getElementById('product-form');
  if (!productForm) return;

  // Get variants JSON from embedded script tag
  const variantsDataEl = document.getElementById('product-variants-json');
  const variants = variantsDataEl ? JSON.parse(variantsDataEl.textContent) : [];

  // Current selected options map: { "Color": "Beige", "Size": "38" }
  const selectedOptions = {};

  // Init from first available variant
  if (variants.length > 0) {
    const firstVariant = variants.find(v => v.available) || variants[0];
    firstVariant.options.forEach((val, i) => {
      selectedOptions[`option${i + 1}`] = val;
    });
    updateVariantInput(firstVariant.id);
    updatePrice(firstVariant);
    updateAddToCartBtn(firstVariant.available);
  }

  /* ========================
     Gallery Thumbnails
     ======================== */
  const mainImage = document.querySelector('#product-main-image');
  const thumbs = document.querySelectorAll('.product-gallery__thumb');

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('is-active'));
      thumb.classList.add('is-active');
      if (mainImage) {
        const newSrc = thumb.dataset.fullSrc;
        if (newSrc) {
          mainImage.style.opacity = '0';
          setTimeout(() => {
            mainImage.src = newSrc;
            mainImage.style.opacity = '1';
          }, 150);
        }
      }
    });
  });

  /* ========================
     Option Selection (Color / Size / etc.)
     ======================== */
  // Color swatches
  document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      const optionKey = swatch.dataset.optionKey || 'option1';
      const value = swatch.dataset.colorName;

      // Update active state within same option group
      const group = swatch.closest('.color-swatches');
      if (group) {
        group.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('is-active'));
      }
      swatch.classList.add('is-active');

      // Update color label display
      const colorLabel = document.querySelector('.color-label');
      if (colorLabel) colorLabel.textContent = value;

      selectedOptions[optionKey] = value;
      matchVariant();
    });
  });

  // Size options
  document.querySelectorAll('.size-option:not(.is-unavailable)').forEach(opt => {
    opt.addEventListener('click', () => {
      const optionKey = opt.dataset.optionKey || 'option2';
      const parent = opt.closest('.size-options');
      if (parent) {
        parent.querySelectorAll('.size-option').forEach(o => o.classList.remove('is-active'));
      }
      opt.classList.add('is-active');
      selectedOptions[optionKey] = opt.dataset.value || opt.textContent.trim();
      matchVariant();
    });
  });

  /* ========================
     Match Variant from Selected Options
     ======================== */
  function matchVariant() {
    const values = Object.values(selectedOptions);
    const matched = variants.find(v =>
      v.options.every((opt, i) => opt === values[i])
    ) || variants.find(v =>
      v.options.some((opt, i) => opt === values[i])
    );

    if (matched) {
      updateVariantInput(matched.id);
      updatePrice(matched);
      updateAddToCartBtn(matched.available);
      updateGalleryForVariant(matched);
    }
  }

  function updateVariantInput(id) {
    const input = productForm.querySelector('input[name="id"]');
    if (input) input.value = id;
  }

  function updatePrice(variant) {
    const priceEl = document.querySelector('.product-info__price');
    if (!priceEl) return;
    const money = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n / 100);
    let html = '';
    if (variant.compare_at_price && variant.compare_at_price > variant.price) {
      html += `<span class="price--compare">${money(variant.compare_at_price)}</span>`;
      html += `<span class="price price--sale">${money(variant.price)}</span>`;
      const savings = Math.round((variant.compare_at_price - variant.price) * 100 / variant.compare_at_price);
      html += `<span class="product-info__save">You save ${savings}%</span>`;
    } else {
      html += `<span class="price">${money(variant.price)}</span>`;
    }
    priceEl.innerHTML = html;
  }

  function updateAddToCartBtn(available) {
    const btn = document.querySelector('[data-add-to-cart]');
    if (!btn) return;
    if (available) {
      btn.textContent = 'Add to Cart';
      btn.disabled = false;
    } else {
      btn.textContent = 'Sold Out';
      btn.disabled = true;
    }
  }

  function updateGalleryForVariant(variant) {
    if (!variant.featured_image || !mainImage) return;
    const newSrc = variant.featured_image.src;
    if (newSrc && mainImage.src !== newSrc) {
      mainImage.style.opacity = '0';
      setTimeout(() => {
        mainImage.src = newSrc;
        mainImage.style.opacity = '1';
      }, 150);
    }
  }

  /* ========================
     Quantity Selector
     ======================== */
  const qtyInput = productForm.querySelector('input[name="quantity"]');
  const qtyMinus = productForm.querySelector('[data-qty-minus]');
  const qtyPlus  = productForm.querySelector('[data-qty-plus]');

  if (qtyInput && qtyMinus && qtyPlus) {
    qtyMinus.addEventListener('click', () => {
      const current = parseInt(qtyInput.value);
      if (current > 1) qtyInput.value = current - 1;
    });
    qtyPlus.addEventListener('click', () => {
      const current = parseInt(qtyInput.value);
      qtyInput.value = current + 1;
    });
  }

  /* ========================
     AJAX Add to Cart
     ======================== */
  const addToCartBtn = document.querySelector('[data-add-to-cart]');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', async (e) => {
      e.preventDefault();

      const variantId = productForm.querySelector('input[name="id"]')?.value;
      const qty = parseInt(qtyInput?.value || '1');
      if (!variantId) return;

      const originalText = addToCartBtn.textContent;
      addToCartBtn.textContent = 'Adding...';
      addToCartBtn.disabled = true;

      try {
        const response = await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ id: variantId, quantity: qty })
        });

        if (response.ok) {
          addToCartBtn.textContent = '✓ Added!';

          // Refresh cart count & open drawer
          await refreshCart();

          setTimeout(() => {
            addToCartBtn.textContent = originalText;
            addToCartBtn.disabled = false;
          }, 2000);
        } else {
          const error = await response.json();
          addToCartBtn.textContent = error.description || 'Error';
          setTimeout(() => {
            addToCartBtn.textContent = originalText;
            addToCartBtn.disabled = false;
          }, 3000);
        }
      } catch (err) {
        console.error('Add to cart error:', err);
        addToCartBtn.textContent = originalText;
        addToCartBtn.disabled = false;
      }
    });
  }

  /* ========================
     Refresh Cart State
     ======================== */
  async function refreshCart() {
    try {
      const res = await fetch('/cart.js');
      const cart = await res.json();

      // Update count badges
      document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = cart.item_count;
        el.style.display = cart.item_count > 0 ? 'flex' : 'none';
      });

      // Open cart drawer if it exists
      const drawer = document.querySelector('.cart-drawer');
      const overlay = document.querySelector('.cart-drawer__overlay');
      if (drawer) {
        drawer.classList.add('is-open');
        if (overlay) overlay.classList.add('is-open');
        document.body.style.overflow = 'hidden';
      }
    } catch (e) {
      console.error('Cart refresh error', e);
    }
  }

  /* ========================
     Product Tabs
     ======================== */
  document.querySelectorAll('.product-tabs__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      document.querySelectorAll('.product-tabs__btn').forEach(b => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.product-tabs__panel').forEach(p => p.classList.remove('is-active'));
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');
      const panel = document.getElementById(tabId);
      if (panel) panel.classList.add('is-active');
    });
  });

});
