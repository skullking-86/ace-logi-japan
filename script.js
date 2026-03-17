document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // Intro Animation — Remove overlay after animation completes
    // =========================================================================
    const introEl = document.getElementById('heroIntro');
    if (introEl) {
        // CSS animation is 2.4s; remove from DOM cleanly after completion
        setTimeout(() => {
            introEl.style.opacity = '0';
            introEl.style.pointerEvents = 'none';
            setTimeout(() => { introEl.style.display = 'none'; }, 100);
        }, 2500);
    }

    // =========================================================================
    // Mobile Menu Toggle
    // =========================================================================
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            mobileNav.classList.toggle('active');
        });
    }

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileMenuBtn) mobileMenuBtn.classList.remove('active');
            if (mobileNav) mobileNav.classList.remove('active');
        });
    });

    // =========================================================================
    // Header: transparent on hero, opaque once scrolled past it
    // =========================================================================
    const header = document.getElementById('header');
    const hero = document.getElementById('hero');

    const updateHeader = () => {
        if (!header) return;
        // Become opaque once scrolled 80px (well into the hero)
        if (window.scrollY > 80) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader(); // run on load

    // =========================================================================
    // Smooth Scrolling for Anchor Links
    // =========================================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const headerHeight = header ? header.offsetHeight : 72;
                const offsetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
        });
    });

    // =========================================================================
    // Scroll Reveal — IntersectionObserver
    // =========================================================================
    const revealEls = document.querySelectorAll('.reveal, .reveal-left, .animate-up');

    const revealObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('active');
            obs.unobserve(entry.target);
        });
    }, {
        threshold: 0.06,
        rootMargin: '0px 0px -40px 0px'
    });

    revealEls.forEach(el => revealObserver.observe(el));

    // =========================================================================
    // Parallax — subtle background-position shift on scroll
    // =========================================================================
    const parallaxImgs = document.querySelectorAll('.parallax-img');

    const onParallaxScroll = () => {
        parallaxImgs.forEach(img => {
            const rect = img.getBoundingClientRect();
            if (rect.bottom < 0 || rect.top > window.innerHeight) return;
            const ratio = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
            const offset = (ratio - 0.5) * 36;
            img.style.backgroundPositionY = `calc(50% + ${offset}px)`;
        });
    };

    window.addEventListener('scroll', onParallaxScroll, { passive: true });
    onParallaxScroll();

    // =========================================================================
    // Cart init
    // =========================================================================
    updateCartUI();
});

// =========================================================================
// Catalog Series Filter
// =========================================================================
function filterCatalog(series) {
    document.querySelectorAll('.catalog-tab').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    document.querySelectorAll('.catalog-category').forEach(category => {
        const categorySeries = category.getAttribute('data-series');
        if (series === 'all' || categorySeries === series) {
            category.classList.remove('hidden');
        } else {
            category.classList.add('hidden');
        }
    });
}

// =========================================================================
// Estimate Cart System
// =========================================================================
function getCart() {
    return JSON.parse(localStorage.getItem('estimateCart') || '[]');
}

function saveCart(cart) {
    localStorage.setItem('estimateCart', JSON.stringify(cart));
}

function addToEstimate(btn) {
    const catalogItem = btn.closest('.catalog-item');
    const nameEl = catalogItem.querySelector('.catalog-name');
    const name = nameEl ? nameEl.textContent.trim() : '不明な製品';
    const category = catalogItem.closest('.catalog-category');
    const series = category ? category.getAttribute('data-series') : '';

    let cart = getCart();
    const existingIdx = cart.findIndex(item => item.name === name);

    if (existingIdx > -1) {
        cart[existingIdx].qty += 1;
    } else {
        cart.push({ name, series, qty: 1 });
    }

    saveCart(cart);
    updateCartUI();
    showNotification();
    animateButton(btn);
}

function animateButton(btn) {
    btn.textContent = '✓ 追加しました';
    btn.classList.add('added');
    setTimeout(() => {
        btn.textContent = '＋ 見積りに追加';
        btn.classList.remove('added');
    }, 1800);
}

function showNotification() {
    const notif = document.getElementById('cart-notification');
    if (!notif) return;
    notif.classList.add('show');
    setTimeout(() => notif.classList.remove('show'), 2000);
}

function updateCartUI() {
    const cart = getCart();
    const countEl = document.getElementById('cart-count');
    const cartItemsEl = document.getElementById('cart-items');
    if (!countEl || !cartItemsEl) return;

    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    countEl.textContent = totalQty;
    countEl.classList.add('bump');
    setTimeout(() => countEl.classList.remove('bump'), 300);

    if (cart.length === 0) {
        cartItemsEl.innerHTML = '<p class="cart-empty-msg">製品を追加してください</p>';
    } else {
        cartItemsEl.innerHTML = cart.map((item, idx) => `
            <div class="cart-item-row" style="position: relative;">
                <span class="cart-item-index">${String(idx + 1).padStart(2, '0')}</span>
                <span class="cart-item-name">${item.name}</span>
                <span class="cart-item-qty">×${item.qty}</span>
                <button class="cart-item-remove" onclick="removeFromCart(${idx})" style="position: absolute; right: 0; top: 50%; transform: translateY(-50%); background: none; border: none; font-size: 16px; cursor: pointer; color: #aaa;">×</button>
            </div>
        `).join('');

        const cartEl = document.getElementById('estimate-cart');
        if (cartEl && cartEl.classList.contains('collapsed')) {
            cartEl.classList.remove('collapsed');
        }
    }
}

function removeFromCart(index) {
    let cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    updateCartUI();
}

function toggleCart() {
    const cartEl = document.getElementById('estimate-cart');
    if (!cartEl) return;
    cartEl.classList.toggle('collapsed');
}

function saveCartAndGo() {
    return true;
}

// =========================================================================
// Equipment Selection Modal
// =========================================================================
function openEquipmentModal() {
    const modal = document.getElementById('equipmentModal');
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeEquipmentModal() {
    const modal = document.getElementById('equipmentModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeEquipmentModal();
});
