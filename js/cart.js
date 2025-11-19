/**
 * ShopEase E-Commerce - Cart Functionality
 * Handles shopping cart operations
 */

// Cart Class
class ShoppingCart {
  constructor() {
    this.items = this.loadCart();
    this.init();
  }

  /**
   * Initialize Cart
   */
  init() {
    this.updateUI();
    this.attachEventListeners();
  }

  /**
   * Load Cart from Local Storage
   */
  loadCart() {
    const cart = localStorage.getItem("cart");
    return cart ? JSON.parse(cart) : [];
  }

  /**
   * Save Cart to Local Storage
   */
  saveCart() {
    localStorage.setItem("cart", JSON.stringify(this.items));
    this.updateCartBadge();
  }

  /**
   * Add Item to Cart
   */
  addItem(product) {
    const existingItem = this.items.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += product.quantity || 1;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || "default.jpg",
        quantity: product.quantity || 1,
        variant: product.variant || {},
      });
    }

    this.saveCart();
    this.updateUI();
    this.showNotification(`${product.name} added to cart!`, "success");
  }

  /**
   * Remove Item from Cart
   */
  removeItem(productId) {
    this.items = this.items.filter((item) => item.id !== productId);
    this.saveCart();
    this.updateUI();
    this.showNotification("Item removed from cart", "success");
  }

  /**
   * Update Item Quantity
   */
  updateQuantity(productId, quantity) {
    const item = this.items.find((item) => item.id === productId);

    if (item) {
      if (quantity <= 0) {
        this.removeItem(productId);
      } else if (quantity <= 10) {
        item.quantity = quantity;
        this.saveCart();
        this.updateUI();
      } else {
        this.showNotification("Maximum quantity is 10", "error");
      }
    }
  }

  /**
   * Clear Cart
   */
  clearCart() {
    if (confirm("Are you sure you want to clear your cart?")) {
      this.items = [];
      this.saveCart();
      this.updateUI();
      this.showNotification("Cart cleared", "success");
    }
  }

  /**
   * Get Cart Total
   */
  getTotal() {
    return this.items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  }

  /**
   * Get Cart Item Count
   */
  getItemCount() {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }

  /**
   * Calculate Subtotal
   */
  getSubtotal() {
    return this.getTotal();
  }

  /**
   * Calculate Tax (10%)
   */
  getTax() {
    return this.getSubtotal() * 0.1;
  }

  /**
   * Calculate Shipping
   */
  getShipping() {
    const subtotal = this.getSubtotal();
    return subtotal > 50 ? 0 : 15; // Free shipping over $50
  }

  /**
   * Calculate Grand Total
   */
  getGrandTotal() {
    return this.getSubtotal() + this.getTax() + this.getShipping();
  }

  /**
   * Update Cart Badge
   */
  updateCartBadge() {
    const badge = document.querySelector(".cart-badge");
    if (badge) {
      const count = this.getItemCount();
      badge.textContent = count;
      badge.style.display = count > 0 ? "flex" : "none";
    }
  }

  /**
   * Update Cart UI
   */
  updateUI() {
    this.updateCartBadge();

    // Update cart page if we're on it
    const cartContainer = document.getElementById("cartContainer");
    if (cartContainer) {
      this.renderCartItems();
      this.updateCartSummary();
    }
  }

  /**
   * Render Cart Items
   */
  renderCartItems() {
    const cartContainer = document.getElementById("cartContainer");
    if (!cartContainer) return;

    if (this.items.length === 0) {
      cartContainer.innerHTML = `
                <div class="empty-cart">
                    <div class="empty-icon">
                        <i class="fas fa-shopping-cart"></i>
                    </div>
                    <h2>Your cart is empty</h2>
                    <p>Add some products to get started!</p>
                    <a href="products.html" class="btn-shop">
                        <i class="fas fa-shopping-bag me-2"></i>Start Shopping
                    </a>
                </div>
            `;
      return;
    }

    let html = '<div class="cart-table-header">...</div>'; // Add your header

    this.items.forEach((item) => {
      html += `
                <div class="cart-item" data-id="${item.id}">
                    <div class="product-info">
                        <div class="product-image">
                            <i class="fas fa-box"></i>
                        </div>
                        <div class="product-details">
                            <h4>${item.name}</h4>
                            <div class="product-meta">
                                ${
                                  item.variant.color
                                    ? `<span>Color: ${item.variant.color}</span>`
                                    : ""
                                }
                                ${
                                  item.variant.size
                                    ? `<span>Size: ${item.variant.size}</span>`
                                    : ""
                                }
                            </div>
                        </div>
                    </div>
                    <div class="product-price">$${item.price.toFixed(2)}</div>
                    <div class="quantity-controls">
                        <button class="qty-btn" onclick="cart.updateQuantity('${
                          item.id
                        }', ${item.quantity - 1})">-</button>
                        <input type="number" class="qty-input" value="${
                          item.quantity
                        }" readonly>
                        <button class="qty-btn" onclick="cart.updateQuantity('${
                          item.id
                        }', ${item.quantity + 1})">+</button>
                    </div>
                    <div class="item-total">$${(
                      item.price * item.quantity
                    ).toFixed(2)}</div>
                    <button class="remove-btn" onclick="cart.removeItem('${
                      item.id
                    }')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
    });

    cartContainer.innerHTML = html;
  }

  /**
   * Update Cart Summary
   */
  updateCartSummary() {
    const subtotalEl = document.getElementById("subtotal");
    const shippingEl = document.getElementById("shipping");
    const taxEl = document.getElementById("tax");
    const totalEl = document.getElementById("total");
    const itemCountEl = document.getElementById("itemCount");

    if (subtotalEl)
      subtotalEl.textContent = `$${this.getSubtotal().toFixed(2)}`;
    if (taxEl) taxEl.textContent = `$${this.getTax().toFixed(2)}`;

    if (shippingEl) {
      const shipping = this.getShipping();
      shippingEl.textContent =
        shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`;
    }

    if (totalEl) totalEl.textContent = `$${this.getGrandTotal().toFixed(2)}`;
    if (itemCountEl) itemCountEl.textContent = this.getItemCount();
  }

  /**
   * Attach Event Listeners
   */
  attachEventListeners() {
    // Add to cart buttons
    document.querySelectorAll(".btn-add-cart").forEach((button) => {
      button.addEventListener("click", (e) => {
        const productCard = e.target.closest(".product-card");
        if (productCard) {
          const product = this.extractProductData(productCard);
          this.addItem(product);
        }
      });
    });

    // Clear cart button
    const clearBtn = document.querySelector(".btn-clear");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => this.clearCart());
    }
  }

  /**
   * Extract Product Data from Card
   */
  extractProductData(card) {
    return {
      id: card.dataset.id || this.generateId(),
      name: card.querySelector(".product-title")?.textContent || "Product",
      price: parseFloat(
        card.querySelector(".current-price")?.textContent.replace("$", "") ||
          "0"
      ),
      image: card.querySelector(".product-image img")?.src || null,
      quantity: 1,
    };
  }

  /**
   * Generate Unique ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Show Notification
   */
  showNotification(message, type = "success") {
    if (window.shopEase && window.shopEase.showToast) {
      window.shopEase.showToast(message, type);
    } else {
      alert(message);
    }
  }

  /**
   * Apply Coupon Code
   */
  applyCoupon(code) {
    const validCoupons = {
      SAVE10: 0.1,
      SAVE20: 0.2,
      FREESHIP: "freeship",
    };

    const discount = validCoupons[code.toUpperCase()];

    if (discount) {
      if (discount === "freeship") {
        this.shipping = 0;
        this.showNotification("Free shipping applied!", "success");
      } else {
        this.discount = this.getSubtotal() * discount;
        this.showNotification(
          `${discount * 100}% discount applied!`,
          "success"
        );
      }
      this.updateUI();
      return true;
    } else {
      this.showNotification("Invalid coupon code", "error");
      return false;
    }
  }

  /**
   * Proceed to Checkout
   */
  proceedToCheckout() {
    if (this.items.length === 0) {
      this.showNotification("Your cart is empty", "error");
      return;
    }

    // Save cart data for checkout page
    localStorage.setItem(
      "checkoutCart",
      JSON.stringify({
        items: this.items,
        subtotal: this.getSubtotal(),
        tax: this.getTax(),
        shipping: this.getShipping(),
        total: this.getGrandTotal(),
      })
    );

    window.location.href = "checkout.html";
  }

  /**
   * Get Cart Summary for Checkout
   */
  getCheckoutSummary() {
    return {
      items: this.items,
      subtotal: this.getSubtotal(),
      tax: this.getTax(),
      shipping: this.getShipping(),
      discount: this.discount || 0,
      total: this.getGrandTotal(),
    };
  }
}

// Initialize Cart
const cart = new ShoppingCart();

// Make cart available globally
window.cart = cart;

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = ShoppingCart;
}
