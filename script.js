/* ==========================================================================
   URBAN CAFE & RESTAURANT - APPLICATION SCRIPT (Vanilla JS)
   ========================================================================== */

const CONFIG = {
    WHATSAPP_NUMBER: "923139755550",
    PHONE_1: "+92 313 9755550",
    PHONE_2: "+92 310 1444111",
    EMAIL: "urbancafe555@gmail.com",
    FACEBOOK_URL: "https://facebook.com/TheUrbanCafeandRestaurant",
    TIKTOK_URL: "https://tiktok.com/@urban.cafe.restaurant",
    HOURS: {
        MON_THU: "12:30 PM - 11:15 PM",
        FRI: "02:30 PM - 11:15 PM",
        SAT_SUN: "12:30 PM - 11:15 PM"
    }
};

let menuData = null;
let cart = [];
let activeCategory = "Popular";

// DOM Elements
const navLinks = document.getElementById("navLinks");
const mobileMenuToggle = document.getElementById("mobileMenuToggle");
const categoryTabs = document.getElementById("categoryTabs");
const menuGridContainer = document.getElementById("menuGridContainer");
const menuSearchInput = document.getElementById("menuSearchInput");
const cartTrigger = document.getElementById("cartTrigger");
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const cartCloseBtn = document.getElementById("cartCloseBtn");
const cartBody = document.getElementById("cartBody");
const cartCount = document.getElementById("cartCount");
const cartTotalItemsCount = document.getElementById("cartTotalItemsCount");
const orderTypeSelect = document.getElementById("orderTypeSelect");
const customerNameInput = document.getElementById("customerNameInput");
const customerAddressInput = document.getElementById("customerAddressInput");
const sendWhatsAppOrderBtn = document.getElementById("sendWhatsAppOrderBtn");
const bookingForm = document.getElementById("bookingForm");
const lightboxModal = document.getElementById("lightboxModal");
const lightboxClose = document.getElementById("lightboxClose");
const lightboxCaption = document.getElementById("lightboxCaption");

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
    initMobileMenu();
    fetchMenuData();
    initCartDrawer();
    initBookingForm();
    initGalleryLightbox();
});

// Mobile Navigation Toggle
function initMobileMenu() {
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener("click", () => {
            navLinks.classList.toggle("active");
        });
        navLinks.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                navLinks.classList.remove("active");
            });
        });
    }
}

// Fetch Menu Data from menu.json with Fallback
async function fetchMenuData() {
    try {
        const response = await fetch("menu.json");
        if (!response.ok) throw new Error("Failed to load menu data");
        menuData = await response.json();
        renderCategoryTabs();
        renderMenuItems();
    } catch (error) {
        console.error("Error loading menu:", error);
        menuGridContainer.innerHTML = `
            <div class="menu-error-fallback" style="grid-column: 1/-1; text-align:center; padding: 40px;">
                <p>Unable to load live menu items. Please contact us directly on WhatsApp to place your order.</p>
                <a href="https://wa.me/${CONFIG.WHATSAPP_NUMBER}" class="btn btn-primary" style="margin-top:15px;" target="_blank" rel="noopener noreferrer">Order via WhatsApp</a>
            </div>
        `;
    }
}

// Render Category Tabs
function renderCategoryTabs() {
    if (!menuData || !categoryTabs) return;
    categoryTabs.innerHTML = "";
    
    menuData.categories.forEach(category => {
        const pill = document.createElement("button");
        pill.className = `category-pill ${category === activeCategory ? "active" : ""}`;
        pill.textContent = category;
        pill.addEventListener("click", () => {
            activeCategory = category;
            document.querySelectorAll(".category-pill").forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
            renderMenuItems();
        });
        categoryTabs.appendChild(pill);
    });
}

// Render Menu Items based on Category & Search
function renderMenuItems() {
    if (!menuData) return;
    const searchTerm = menuSearchInput ? menuSearchInput.value.toLowerCase().trim() : "";
    
    let filteredItems = menuData.items.filter(item => {
        const matchesCategory = (activeCategory === "All" || item.category === activeCategory);
        const matchesSearch = item.name.toLowerCase().includes(searchTerm) || item.description.toLowerCase().includes(searchTerm);
        if (searchTerm !== "") {
            return matchesSearch; // Search across entire menu when typing
        }
        return matchesCategory;
    });

    if (filteredItems.length === 0) {
        menuGridContainer.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color: var(--text-muted); padding: 40px;">No matching menu items found.</p>`;
        return;
    }

    menuGridContainer.innerHTML = "";
    filteredItems.forEach(item => {
        const card = document.createElement("div");
        card.className = "menu-card";
        card.innerHTML = `
            <div>
                <div class="menu-card-header">
                    <h3 class="menu-card-title">${item.name}</h3>
                    ${item.popular ? '<span class="popular-tag">Popular</span>' : ''}
                </div>
                <p class="menu-card-desc">${item.description}</p>
            </div>
            <div class="menu-card-footer">
                <span class="menu-item-price">${item.price}</span>
                <button class="btn btn-primary" onclick="addToCart('${item.id}')">Add to Cart</button>
            </div>
        `;
        menuGridContainer.appendChild(card);
    });

    if (menuSearchInput) {
        menuSearchInput.addEventListener("input", () => {
            renderMenuItems();
        });
    }
}

// Cart Management Functions
function initCartDrawer() {
    if (cartTrigger && cartDrawer && cartOverlay && cartCloseBtn) {
        cartTrigger.addEventListener("click", () => {
            cartDrawer.classList.add("active");
            cartOverlay.classList.add("active");
        });
        cartCloseBtn.addEventListener("click", () => {
            cartDrawer.classList.remove("active");
            cartOverlay.classList.remove("active");
        });
        cartOverlay.addEventListener("click", () => {
            cartDrawer.classList.remove("active");
            cartOverlay.classList.remove("active");
        });
    }

    if (orderTypeSelect && customerAddressInput) {
        orderTypeSelect.addEventListener("change", (e) => {
            if (e.target.value === "Delivery") {
                customerAddressInput.style.display = "block";
                customerAddressInput.required = true;
            } else {
                customerAddressInput.style.display = "none";
                customerAddressInput.required = false;
            }
        });
    }

    if (sendWhatsAppOrderBtn) {
        sendWhatsAppOrderBtn.addEventListener("click", sendWhatsAppOrder);
    }
}

function addToCart(itemId) {
    if (!menuData) return;
    const item = menuData.items.find(i => i.id === itemId);
    if (!item) return;

    const existing = cart.find(i => i.id === itemId);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ ...item, qty: 1 });
    }
    updateCartUI();
    
    // Open cart drawer on add
    cartDrawer.classList.add("active");
    cartOverlay.classList.add("active");
}

function updateQuantity(itemId, change) {
    const itemIndex = cart.findIndex(i => i.id === itemId);
    if (itemIndex > -1) {
        cart[itemIndex].qty += change;
        if (cart[itemIndex].qty <= 0) {
            cart.splice(itemIndex, 1);
        }
    }
    updateCartUI();
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    if (cartCount) cartCount.textContent = totalItems;
    if (cartTotalItemsCount) cartTotalItemsCount.textContent = totalItems;

    if (!cartBody) return;
    if (cart.length === 0) {
        cartBody.innerHTML = `<p class="cart-empty-msg">Your cart is currently empty.</p>`;
        return;
    }

    cartBody.innerHTML = "";
    cart.forEach(item => {
        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
            <div class="cart-item-info">
                <h5>${item.name}</h5>
                <span class="cart-item-price">${item.price} x ${item.qty}</span>
            </div>
            <div class="cart-item-controls">
                <button class="qty-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                <span>${item.qty}</span>
                <button class="qty-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
            </div>
        `;
        cartBody.appendChild(div);
    });
}

function sendWhatsAppOrder() {
    const name = customerNameInput ? customerNameInput.value.trim() : "";
    if (!name) {
        alert("Please enter your name to complete your order.");
        if (customerNameInput) customerNameInput.focus();
        return;
    }
    if (cart.length === 0) {
        alert("Your cart is empty. Please add items before placing an order.");
        return;
    }

    const orderType = orderTypeSelect ? orderTypeSelect.value : "Dine-In";
    const address = customerAddressInput ? customerAddressInput.value.trim() : "";

    let message = `Hello Urban Cafe & Restaurant,%0A%0A*New Order Inquiry*%0A`;
    message += `*Customer Name:* ${encodeURIComponent(name)}%0A`;
    message += `*Order Type:* ${encodeURIComponent(orderType)}%0A`;
    if (orderType === "Delivery" && address) {
        message += `*Delivery Address:* ${encodeURIComponent(address)}%0A`;
    }
    message += `%0A*Items Ordered:*%0A`;
    
    cart.forEach(item => {
        message += `- ${encodeURIComponent(item.name)} (x${item.qty}) - ${encodeURIComponent(item.price)}%0A`;
    });

    message += `%0APlease confirm my order and total. Thank you!`;

    const whatsappUrl = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${message}`;
    window.open(whatsappUrl, "_blank");
}

// Birthday & Event Booking Form
function initBookingForm() {
    if (!bookingForm) return;
    bookingForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("bookName").value.trim();
        const phone = document.getElementById("bookPhone").value.trim();
        const date = document.getElementById("bookDate").value;
        const time = document.getElementById("bookTime").value;
        const guests = document.getElementById("bookGuests").value;
        const occasion = document.getElementById("bookOccasion").value;
        const notes = document.getElementById("bookNotes").value.trim();

        let message = `Hello Urban Cafe & Restaurant,%0A%0A*Table / Event Booking Request*%0A`;
        message += `*Name:* ${encodeURIComponent(name)}%0A`;
        message += `*Phone:* ${encodeURIComponent(phone)}%0A`;
        message += `*Occasion:* ${encodeURIComponent(occasion)}%0A`;
        message += `*Date:* ${encodeURIComponent(date)}%0A`;
        message += `*Time:* ${encodeURIComponent(time)}%0A`;
        message += `*Guests:* ${encodeURIComponent(guests)}%0A`;
        if (notes) {
            message += `*Special Requests:* ${encodeURIComponent(notes)}%0A`;
        }
        message += `%0APlease confirm availability. Thank you!`;

        const whatsappUrl = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${message}`;
        window.open(whatsappUrl, "_blank");
    });
}

// Gallery Lightbox
function initGalleryLightbox() {
    const galleryItems = document.querySelectorAll(".gallery-item");
    if (!lightboxModal || !lightboxClose) return;

    galleryItems.forEach(item => {
        item.addEventListener("click", () => {
            const captionText = item.getAttribute("data-caption") || "Urban Cafe & Restaurant";
            if (lightboxCaption) lightboxCaption.textContent = captionText;
            lightboxModal.classList.add("active");
        });
    });

    lightboxClose.addEventListener("click", () => {
        lightboxModal.classList.remove("active");
    });

    lightboxModal.addEventListener("click", (e) => {
        if (e.target === lightboxModal) {
            lightboxModal.classList.remove("active");
        }
    });
}