/**
 * ShopEase E-Commerce - Checkout Functionality
 * Handles checkout process and validation
 */

class CheckoutManager {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 4;
    this.checkoutData = {
      shipping: {},
      delivery: {},
      payment: {},
      cart: {},
    };

    this.init();
  }

  /**
   * Initialize Checkout
   */
  init() {
    this.loadCartData();
    this.attachEventListeners();
    this.updateProgressBar();
  }

  /**
   * Load Cart Data
   */
  loadCartData() {
    const savedCart = localStorage.getItem("checkoutCart");
    if (savedCart) {
      this.checkoutData.cart = JSON.parse(savedCart);
    } else {
      // Redirect to cart if no data
      window.location.href = "cart.html";
    }
  }

  /**
   * Validate Shipping Form
   */
  validateShippingForm() {
    const form = document.getElementById("shippingForm");
    if (!form) return false;

    const requiredFields = form.querySelectorAll("[required]");
    let isValid = true;
    let errors = [];

    requiredFields.forEach((field) => {
      if (!field.value.trim()) {
        isValid = false;
        field.classList.add("is-invalid");
        errors.push(`${field.previousElementSibling.textContent} is required`);
      } else {
        field.classList.remove("is-invalid");
        field.classList.add("is-valid");
      }
    });

    // Email validation
    const emailField = form.querySelector('input[type="email"]');
    if (emailField && emailField.value) {
      if (!this.validateEmail(emailField.value)) {
        isValid = false;
        emailField.classList.add("is-invalid");
        errors.push("Please enter a valid email address");
      }
    }

    // Phone validation
    const phoneField = form.querySelector('input[type="tel"]');
    if (phoneField && phoneField.value) {
      if (!this.validatePhone(phoneField.value)) {
        isValid = false;
        phoneField.classList.add("is-invalid");
        errors.push("Please enter a valid phone number");
      }
    }

    if (!isValid) {
      this.showErrors(errors);
    } else {
      this.saveShippingData(form);
    }

    return isValid;
  }

  /**
   * Save Shipping Data
   */
  saveShippingData(form) {
    const formData = new FormData(form);
    this.checkoutData.shipping = {
      firstName:
        formData.get("firstName") ||
        form.querySelector('[name="firstName"]')?.value,
      lastName:
        formData.get("lastName") ||
        form.querySelector('[name="lastName"]')?.value,
      email:
        formData.get("email") || form.querySelector('[type="email"]')?.value,
      phone: formData.get("phone") || form.querySelector('[type="tel"]')?.value,
      address:
        formData.get("address") ||
        form.querySelector('[name="address"]')?.value,
      apartment: formData.get("apartment") || "",
      city: formData.get("city") || form.querySelector('[name="city"]')?.value,
      state:
        formData.get("state") || form.querySelector('[name="state"]')?.value,
      zipCode:
        formData.get("zipCode") ||
        form.querySelector('[name="zipCode"]')?.value,
      country:
        formData.get("country") ||
        form.querySelector('[name="country"]')?.value,
    };
  }

  /**
   * Validate Email
   */
  validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Validate Phone
   */
  validatePhone(phone) {
    const regex = /^[\d\s\+\-\(\)]{10,}$/;
    return regex.test(phone);
  }

  /**
   * Validate Card Number
   */
  validateCardNumber(cardNumber) {
    // Remove spaces and dashes
    const cleaned = cardNumber.replace(/[\s\-]/g, "");

    // Check if it's 13-19 digits
    if (!/^\d{13,19}$/.test(cleaned)) {
      return false;
    }

    // Luhn algorithm
    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  /**
   * Validate CVV
   */
  validateCVV(cvv) {
    return /^\d{3,4}$/.test(cvv);
  }

  /**
   * Validate Expiry Date
   */
  validateExpiryDate(expiry) {
    const [month, year] = expiry.split("/").map((n) => parseInt(n));

    if (!month || !year || month < 1 || month > 12) {
      return false;
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return false;
    }

    return true;
  }

  /**
   * Validate Payment Form
   */
  validatePaymentForm() {
    const selectedPayment = document.querySelector(".payment-option.selected");
    if (!selectedPayment) {
      this.showError("Please select a payment method");
      return false;
    }

    const paymentType = selectedPayment.querySelector("h5").textContent.trim();
    this.checkoutData.payment.method = paymentType;

    // If credit card is selected, validate card details
    if (paymentType.includes("Credit") || paymentType.includes("Debit")) {
      const cardNumber = selectedPayment.querySelector(
        'input[placeholder*="Card Number"]'
      )?.value;
      const expiry = selectedPayment.querySelector(
        'input[placeholder*="MM/YY"]'
      )?.value;
      const cvv = selectedPayment.querySelector(
        'input[placeholder*="CVV"]'
      )?.value;
      const cardName = selectedPayment.querySelector(
        'input[placeholder*="Cardholder"]'
      )?.value;

      let errors = [];

      if (!cardNumber || !this.validateCardNumber(cardNumber)) {
        errors.push("Invalid card number");
      }

      if (!expiry || !this.validateExpiryDate(expiry)) {
        errors.push("Invalid expiry date");
      }

      if (!cvv || !this.validateCVV(cvv)) {
        errors.push("Invalid CVV");
      }

      if (!cardName || cardName.trim().length < 3) {
        errors.push("Invalid cardholder name");
      }

      if (errors.length > 0) {
        this.showErrors(errors);
        return false;
      }

      this.checkoutData.payment.cardDetails = {
        lastFour: cardNumber.slice(-4),
        cardName: cardName,
        expiryDate: expiry,
      };
    }

    return true;
  }

  /**
   * Next Step
   */
  nextStep() {
    let isValid = false;

    switch (this.currentStep) {
      case 1:
        isValid = this.validateShippingForm();
        break;
      case 2:
        isValid = this.validateDeliveryMethod();
        break;
      case 3:
        isValid = this.validatePaymentForm();
        break;
      default:
        isValid = true;
    }

    if (isValid && this.currentStep < this.totalSteps) {
      this.hideStep(this.currentStep);
      this.currentStep++;
      this.showStep(this.currentStep);
      this.updateProgressBar();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  /**
   * Previous Step
   */
  previousStep() {
    if (this.currentStep > 1) {
      this.hideStep(this.currentStep);
      this.currentStep--;
      this.showStep(this.currentStep);
      this.updateProgressBar();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  /**
   * Show Step
   */
  showStep(step) {
    const stepContent = document.getElementById(`content-step${step}`);
    if (stepContent) {
      stepContent.style.display = "block";
    }

    // Update step indicators
    for (let i = 1; i <= this.totalSteps; i++) {
      const stepEl = document.getElementById(`step${i}`);
      if (stepEl) {
        if (i < step) {
          stepEl.classList.add("completed");
          stepEl.classList.remove("active");
        } else if (i === step) {
          stepEl.classList.add("active");
          stepEl.classList.remove("completed");
        } else {
          stepEl.classList.remove("active", "completed");
        }
      }
    }
  }

  /**
   * Hide Step
   */
  hideStep(step) {
    const stepContent = document.getElementById(`content-step${step}`);
    if (stepContent) {
      stepContent.style.display = "none";
    }
  }

  /**
   * Update Progress Bar
   */
  updateProgressBar() {
    const progressLine = document.getElementById("progressLine");
    if (progressLine) {
      const progress = ((this.currentStep - 1) / (this.totalSteps - 1)) * 100;
      progressLine.style.width = `${progress}%`;
    }
  }

  /**
   * Validate Delivery Method
   */
  validateDeliveryMethod() {
    const selectedShipping = document.querySelector(
      ".shipping-option.selected"
    );
    if (!selectedShipping) {
      this.showError("Please select a delivery method");
      return false;
    }

    const shippingTitle = selectedShipping
      .querySelector("h5")
      .textContent.trim();
    const shippingPrice = selectedShipping
      .querySelector(".shipping-price")
      .textContent.trim();

    this.checkoutData.delivery = {
      method: shippingTitle,
      price:
        shippingPrice === "Free"
          ? 0
          : parseFloat(shippingPrice.replace("$", "")),
    };

    return true;
  }

  /**
   * Place Order
   */
  async placeOrder() {
    if (!this.validatePaymentForm()) {
      return;
    }

    // Show loading
    const placeOrderBtn = document.querySelector(".btn-place-order");
    if (placeOrderBtn) {
      placeOrderBtn.disabled = true;
      placeOrderBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
    }

    // Simulate API call
    setTimeout(() => {
      const orderId = this.generateOrderId();

      // Save order
      this.saveOrder(orderId);

      // Clear cart
      localStorage.removeItem("cart");
      localStorage.removeItem("checkoutCart");

      // Show success message
      this.showOrderSuccess(orderId);

      // Redirect to order confirmation
      setTimeout(() => {
        window.location.href = `orders.html?order=${orderId}`;
      }, 2000);
    }, 2000);
  }

  /**
   * Generate Order ID
   */
  generateOrderId() {
    return "ORD-" + Date.now().toString().slice(-8);
  }

  /**
   * Save Order
   */
  saveOrder(orderId) {
    const order = {
      orderId: orderId,
      date: new Date().toISOString(),
      ...this.checkoutData,
      status: "processing",
      total: this.checkoutData.cart.total,
    };

    // Save to localStorage (in production, this would be sent to a server)
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    orders.unshift(order);
    localStorage.setItem("orders", JSON.stringify(orders));
  }

  /**
   * Show Order Success
   */
  showOrderSuccess(orderId) {
    if (window.shopEase && window.shopEase.showToast) {
      window.shopEase.showToast(
        `Order ${orderId} placed successfully!`,
        "success"
      );
    } else {
      alert(`Order ${orderId} placed successfully!`);
    }
  }

  /**
   * Show Error
   */
  showError(message) {
    if (window.shopEase && window.shopEase.showToast) {
      window.shopEase.showToast(message, "error");
    } else {
      alert(message);
    }
  }

  /**
   * Show Multiple Errors
   */
  showErrors(errors) {
    const message = errors.join("\n");
    this.showError(message);
  }

  /**
   * Attach Event Listeners
   */
  attachEventListeners() {
    // Shipping option selection
    document.querySelectorAll(".shipping-option").forEach((option) => {
      option.addEventListener("click", function () {
        document.querySelectorAll(".shipping-option").forEach((opt) => {
          opt.classList.remove("selected");
        });
        this.classList.add("selected");
      });
    });

    // Payment option selection
    document.querySelectorAll(".payment-option").forEach((option) => {
      option.addEventListener("click", function () {
        document.querySelectorAll(".payment-option").forEach((opt) => {
          opt.classList.remove("selected");
        });
        this.classList.add("selected");
      });
    });

    // Card number formatting
    const cardNumberInput = document.querySelector(
      'input[placeholder*="Card Number"]'
    );
    if (cardNumberInput) {
      cardNumberInput.addEventListener("input", (e) => {
        let value = e.target.value.replace(/\s/g, "");
        let formattedValue = value.match(/.{1,4}/g)?.join(" ") || value;
        e.target.value = formattedValue;
      });
    }

    // Expiry date formatting
    const expiryInput = document.querySelector('input[placeholder*="MM/YY"]');
    if (expiryInput) {
      expiryInput.addEventListener("input", (e) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length >= 2) {
          value = value.slice(0, 2) + "/" + value.slice(2, 4);
        }
        e.target.value = value;
      });
    }
  }
}

// Helper Functions
function selectShipping(element) {
  document.querySelectorAll(".shipping-option").forEach((opt) => {
    opt.classList.remove("selected");
  });
  element.classList.add("selected");
}

function selectPayment(element) {
  document.querySelectorAll(".payment-option").forEach((opt) => {
    opt.classList.remove("selected");
  });
  element.classList.add("selected");
}

// Initialize Checkout Manager
let checkoutManager;
document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector(".checkout-section")) {
    checkoutManager = new CheckoutManager();
    window.checkoutManager = checkoutManager;
  }
});

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = CheckoutManager;
}
