document.addEventListener('DOMContentLoaded', () => {

    // --- Mobile Menu Toggle ---
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('active');
        mobileNav.classList.toggle('active');
    });

    // Close mobile menu when a link is clicked
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuBtn.classList.remove('active');
            mobileNav.classList.remove('active');
        });
    });

    // --- Header Scroll Effect ---
    const header = document.getElementById('header');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
            header.style.padding = '5px 0';
        } else {
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            header.style.padding = '0';
        }
    });

    // --- Smooth Scrolling for Anchor Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Adjust scroll position to account for fixed header
                const headerHeight = document.querySelector('.header').offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- Scroll Reveal Animation ---
    const revealElements = document.querySelectorAll('.reveal');

    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function (entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealOnScroll.observe(el);
    });
});

// --- Catalog Series Filter ---
function filterCatalog(series) {
    // Update active tab
    document.querySelectorAll('.catalog-tab').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Show/hide categories
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

// Load cart from localStorage
function getCart() {
    return JSON.parse(localStorage.getItem('estimateCart') || '[]');
}

function saveCart(cart) {
    localStorage.setItem('estimateCart', JSON.stringify(cart));
}

// Add product to estimate cart
function addToEstimate(btn) {
    const catalogItem = btn.closest('.catalog-item');
    const nameEl = catalogItem.querySelector('.catalog-name');
    const name = nameEl ? nameEl.textContent.trim() : '不明な製品';

    // Determine series from parent category
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

// Update the floating cart UI
function updateCartUI() {
    const cart = getCart();
    const countEl = document.getElementById('cart-count');
    const cartItemsEl = document.getElementById('cart-items');

    if (!countEl || !cartItemsEl) return;

    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    countEl.textContent = totalQty;

    // Bump animation
    countEl.classList.add('bump');
    setTimeout(() => countEl.classList.remove('bump'), 300);

    if (cart.length === 0) {
        cartItemsEl.innerHTML = '<p class="cart-empty-msg">製品を追加してください</p>';
    } else {
        cartItemsEl.innerHTML = cart.map((item, idx) => `
            <div class="cart-item-row">
                <span class="cart-item-index">${String(idx + 1).padStart(2, '0')}</span>
                <span class="cart-item-name">${item.name}</span>
                <span class="cart-item-qty">×${item.qty}</span>
            </div>
        `).join('');

        // Auto-expand cart when items are added
        const cartEl = document.getElementById('estimate-cart');
        if (cartEl && cartEl.classList.contains('collapsed')) {
            cartEl.classList.remove('collapsed');
        }
    }
}

// Toggle cart open/close
function toggleCart() {
    const cartEl = document.getElementById('estimate-cart');
    if (!cartEl) return;
    cartEl.classList.toggle('collapsed');
}


// Save cart data before navigating to estimate page
function saveCartAndGo() {
    // Cart is already in localStorage, just navigate
    return true;
}

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
});
