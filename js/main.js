/**
 * ShopEase E-Commerce - Main JavaScript
 * Core functionality and utilities
 */

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
});

/**
 * Initialize Application
 */
function initializeApp() {
  initNavbar();
  initScrollToTop();
  initSmoothScroll();
  initAnimations();
  initSearchBar();
  updateCartBadge();
}

/**
 * Navbar Functions
 */
function initNavbar() {
  const navbar = document.querySelector(".navbar");

  // Sticky navbar on scroll
  window.addEventListener("scroll", function () {
    if (window.scrollY > 100) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  // Mobile menu toggle
  const navbarToggler = document.querySelector(".navbar-toggler");
  const navbarCollapse = document.querySelector(".navbar-collapse");

  if (navbarToggler) {
    navbarToggler.addEventListener("click", function () {
      navbarCollapse.classList.toggle("show");
    });
  }

  // Close mobile menu when clicking outside
  document.addEventListener("click", function (event) {
    if (navbarCollapse && navbarCollapse.classList.contains("show")) {
      if (!event.target.closest(".navbar")) {
        navbarCollapse.classList.remove("show");
      }
    }
  });
}

/**
 * Scroll to Top Button
 */
function initScrollToTop() {
  // Create scroll to top button if it doesn't exist
  if (!document.querySelector(".scroll-top")) {
    const scrollBtn = document.createElement("div");
    scrollBtn.className = "scroll-top";
    scrollBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    document.body.appendChild(scrollBtn);
  }

  const scrollTop = document.querySelector(".scroll-top");

  // Show/hide button based on scroll position
  window.addEventListener("scroll", function () {
    if (window.scrollY > 300) {
      scrollTop.classList.add("visible");
    } else {
      scrollTop.classList.remove("visible");
    }
  });

  // Scroll to top when clicked
  scrollTop.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

/**
 * Smooth Scroll for Anchor Links
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");

      if (href !== "#" && href !== "") {
        e.preventDefault();
        const target = document.querySelector(href);

        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
    });
  });
}

/**
 * Scroll Animations
 */
function initAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -100px 0px",
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-in");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe elements with animation class
  document.querySelectorAll(".animate-on-scroll").forEach((element) => {
    observer.observe(element);
  });
}

/**
 * Search Bar Functionality
 */
function initSearchBar() {
  const searchInput = document.querySelector(".search-bar input");

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase();
      console.log("Searching for:", searchTerm);
      // Add your search logic here
    });
  }
}

/**
 * Update Cart Badge
 */
function updateCartBadge() {
  const cartBadge = document.querySelector(".cart-badge");
  const cart = getCart();

  if (cartBadge) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalItems;

    if (totalItems > 0) {
      cartBadge.style.display = "flex";
    } else {
      cartBadge.style.display = "none";
    }
  }
}

/**
 * Get Cart from Local Storage
 */
function getCart() {
  const cart = localStorage.getItem("cart");
  return cart ? JSON.parse(cart) : [];
}

/**
 * Save Cart to Local Storage
 */
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadge();
}

/**
 * Show Toast Notification
 */
function showToast(message, type = "success") {
  // Remove existing toast
  const existingToast = document.querySelector(".toast-notification");
  if (existingToast) {
    existingToast.remove();
  }

  // Create toast
  const toast = document.createElement("div");
  toast.className = `toast-notification toast-${type}`;
  toast.innerHTML = `
        <i class="fas fa-${
          type === "success" ? "check-circle" : "exclamation-circle"
        }"></i>
        <span>${message}</span>
    `;

  // Add styles
  toast.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === "success" ? "#2ecc71" : "#e74c3c"};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 9999;
        animation: slideInRight 0.3s ease;
    `;

  document.body.appendChild(toast);

  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = "slideOutRight 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Format Currency
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

/**
 * Format Date
 */
function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

/**
 * Validate Email
 */
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validate Phone
 */
function validatePhone(phone) {
  const re = /^[\d\s\+\-\(\)]+$/;
  return re.test(phone);
}

/**
 * Debounce Function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle Function
 */
function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Generate Random ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Local Storage Helper
 */
const storage = {
  get(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error("Error getting from storage:", error);
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("Error setting to storage:", error);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("Error removing from storage:", error);
      return false;
    }
  },

  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error("Error clearing storage:", error);
      return false;
    }
  },
};

/**
 * Check if user is logged in
 */
function isLoggedIn() {
  return storage.get("userData") !== null;
}

/**
 * Get current user
 */
function getCurrentUser() {
  return storage.get("userData");
}

/**
 * Logout user
 */
function logout() {
  storage.remove("userData");
  window.location.href = "login.html";
}

/**
 * Loading Spinner
 */
function showLoading() {
  const loader = document.createElement("div");
  loader.id = "global-loader";
  loader.innerHTML = '<div class="spinner"></div>';
  loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
    `;
  document.body.appendChild(loader);
}

function hideLoading() {
  const loader = document.getElementById("global-loader");
  if (loader) {
    loader.remove();
  }
}

/**
 * Copy to Clipboard
 */
function copyToClipboard(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      showToast("Copied to clipboard!", "success");
    })
    .catch((err) => {
      console.error("Failed to copy:", err);
      showToast("Failed to copy", "error");
    });
}

/**
 * Share Content
 */
async function shareContent(title, text, url) {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      console.log("Content shared successfully");
    } catch (error) {
      console.log("Error sharing:", error);
    }
  } else {
    // Fallback: copy URL to clipboard
    copyToClipboard(url);
  }
}

// Export functions for use in other scripts
window.shopEase = {
  showToast,
  formatCurrency,
  formatDate,
  validateEmail,
  validatePhone,
  getCart,
  saveCart,
  updateCartBadge,
  storage,
  isLoggedIn,
  getCurrentUser,
  logout,
  showLoading,
  hideLoading,
  copyToClipboard,
  shareContent,
  generateId,
};
