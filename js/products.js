/**
 * ShopEase E-Commerce - Products Functionality
 * Handles product filtering, sorting, and display
 */

class ProductManager {
  constructor() {
    this.products = [];
    this.filteredProducts = [];
    this.currentFilters = {
      category: [],
      priceRange: { min: 0, max: 5000 },
      brand: [],
      rating: 0,
      color: [],
      inStock: false,
    };
    this.currentSort = "featured";
    this.currentPage = 1;
    this.productsPerPage = 12;

    this.init();
  }

  /**
   * Initialize Product Manager
   */
  init() {
    this.loadProducts();
    this.attachEventListeners();
    this.updateUI();
  }

  /**
   * Load Products (Demo Data)
   */
  loadProducts() {
    // In production, this would fetch from an API
    this.products = this.generateDemoProducts();
    this.filteredProducts = [...this.products];
  }

  /**
   * Generate Demo Products
   */
  generateDemoProducts() {
    const categories = ["Electronics", "Fashion", "Home", "Sports", "Books"];
    const brands = ["Apple", "Samsung", "Sony", "Nike", "Adidas"];
    const colors = ["Black", "White", "Blue", "Red", "Green"];

    return Array.from({ length: 50 }, (_, i) => ({
      id: `prod-${i + 1}`,
      name: `Product ${i + 1}`,
      category: categories[Math.floor(Math.random() * categories.length)],
      brand: brands[Math.floor(Math.random() * brands.length)],
      price: Math.floor(Math.random() * 900) + 100,
      oldPrice: Math.floor(Math.random() * 1200) + 200,
      rating: Math.floor(Math.random() * 5) + 1,
      reviews: Math.floor(Math.random() * 200) + 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      inStock: Math.random() > 0.2,
      image: "default.jpg",
      featured: Math.random() > 0.7,
    }));
  }

  /**
   * Filter Products
   */
  filterProducts() {
    this.filteredProducts = this.products.filter((product) => {
      // Category filter
      if (this.currentFilters.category.length > 0) {
        if (!this.currentFilters.category.includes(product.category)) {
          return false;
        }
      }

      // Price range filter
      if (
        product.price < this.currentFilters.priceRange.min ||
        product.price > this.currentFilters.priceRange.max
      ) {
        return false;
      }

      // Brand filter
      if (this.currentFilters.brand.length > 0) {
        if (!this.currentFilters.brand.includes(product.brand)) {
          return false;
        }
      }

      // Rating filter
      if (product.rating < this.currentFilters.rating) {
        return false;
      }

      // Color filter
      if (this.currentFilters.color.length > 0) {
        if (!this.currentFilters.color.includes(product.color)) {
          return false;
        }
      }

      // Stock filter
      if (this.currentFilters.inStock && !product.inStock) {
        return false;
      }

      return true;
    });

    this.sortProducts();
    this.updateUI();
  }

  /**
   * Sort Products
   */
  sortProducts() {
    switch (this.currentSort) {
      case "price-low":
        this.filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        this.filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        this.filteredProducts.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        this.filteredProducts.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case "featured":
      default:
        this.filteredProducts.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
        });
        break;
    }
  }

  /**
   * Search Products
   */
  searchProducts(query) {
    const searchTerm = query.toLowerCase();

    this.filteredProducts = this.products.filter((product) => {
      return (
        product.name.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm) ||
        product.brand.toLowerCase().includes(searchTerm)
      );
    });

    this.updateUI();
  }

  /**
   * Update Category Filter
   */
  updateCategoryFilter(category, checked) {
    if (checked) {
      this.currentFilters.category.push(category);
    } else {
      this.currentFilters.category = this.currentFilters.category.filter(
        (c) => c !== category
      );
    }
    this.filterProducts();
  }

  /**
   * Update Price Range Filter
   */
  updatePriceRange(min, max) {
    this.currentFilters.priceRange = { min, max };
    this.filterProducts();
  }

  /**
   * Update Brand Filter
   */
  updateBrandFilter(brand, checked) {
    if (checked) {
      this.currentFilters.brand.push(brand);
    } else {
      this.currentFilters.brand = this.currentFilters.brand.filter(
        (b) => b !== brand
      );
    }
    this.filterProducts();
  }

  /**
   * Update Rating Filter
   */
  updateRatingFilter(rating) {
    this.currentFilters.rating = rating;
    this.filterProducts();
  }

  /**
   * Update Color Filter
   */
  updateColorFilter(color, checked) {
    if (checked) {
      this.currentFilters.color.push(color);
    } else {
      this.currentFilters.color = this.currentFilters.color.filter(
        (c) => c !== color
      );
    }
    this.filterProducts();
  }

  /**
   * Clear All Filters
   */
  clearFilters() {
    this.currentFilters = {
      category: [],
      priceRange: { min: 0, max: 5000 },
      brand: [],
      rating: 0,
      color: [],
      inStock: false,
    };

    // Reset UI elements
    document
      .querySelectorAll('input[type="checkbox"]')
      .forEach((cb) => (cb.checked = false));
    document
      .querySelectorAll('input[type="radio"]')
      .forEach((rb) => (rb.checked = false));

    const priceInputs = document.querySelectorAll(".price-input input");
    if (priceInputs[0]) priceInputs[0].value = 0;
    if (priceInputs[1]) priceInputs[1].value = 5000;

    this.filterProducts();
  }

  /**
   * Update Sort
   */
  updateSort(sortType) {
    this.currentSort = sortType;
    this.sortProducts();
    this.updateUI();
  }

  /**
   * Get Paginated Products
   */
  getPaginatedProducts() {
    const start = (this.currentPage - 1) * this.productsPerPage;
    const end = start + this.productsPerPage;
    return this.filteredProducts.slice(start, end);
  }

  /**
   * Get Total Pages
   */
  getTotalPages() {
    return Math.ceil(this.filteredProducts.length / this.productsPerPage);
  }

  /**
   * Change Page
   */
  changePage(page) {
    this.currentPage = page;
    this.updateUI();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /**
   * Update UI
   */
  updateUI() {
    this.renderProducts();
    this.renderPagination();
    this.updateResultsCount();
  }

  /**
   * Render Products
   */
  renderProducts() {
    const productsGrid = document.getElementById("productsGrid");
    if (!productsGrid) return;

    const products = this.getPaginatedProducts();

    if (products.length === 0) {
      productsGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <i class="fas fa-search" style="font-size: 4rem; color: #ddd; margin-bottom: 20px;"></i>
                    <h3>No products found</h3>
                    <p>Try adjusting your filters</p>
                    <button onclick="productManager.clearFilters()" class="btn btn-primary">Clear Filters</button>
                </div>
            `;
      return;
    }

    productsGrid.innerHTML = products
      .map(
        (product) => `
            <div class="product-card" data-id="${product.id}">
                ${
                  product.featured
                    ? '<span class="product-badge">Featured</span>'
                    : ""
                }
                <button class="wishlist-btn" onclick="toggleWishlist('${
                  product.id
                }')">
                    <i class="far fa-heart"></i>
                </button>
                <div class="product-image">
                    <i class="fas fa-box"></i>
                    <div class="product-overlay">
                        <button class="overlay-btn" onclick="quickView('${
                          product.id
                        }')">
                            <i class="fas fa-eye me-2"></i>Quick View
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <div class="product-category">${product.category}</div>
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-rating">
                        ${this.renderStars(product.rating)}
                        <span>(${product.reviews})</span>
                    </div>
                    <div class="product-price">
                        <span class="current-price">$${product.price}</span>
                        ${
                          product.oldPrice
                            ? `<span class="old-price">$${product.oldPrice}</span>`
                            : ""
                        }
                    </div>
                    <div class="stock-status ${
                      product.inStock ? "in-stock" : "out-stock"
                    }">
                        <i class="fas fa-${
                          product.inStock ? "check" : "times"
                        }-circle"></i>
                        ${product.inStock ? "In Stock" : "Out of Stock"}
                    </div>
                    <button class="btn-add-cart" ${
                      !product.inStock ? "disabled" : ""
                    } 
                            onclick="cart.addItem({id: '${
                              product.id
                            }', name: '${product.name}', price: ${
          product.price
        }, quantity: 1})">
                        <i class="fas fa-shopping-cart me-2"></i>Add to Cart
                    </button>
                </div>
            </div>
        `
      )
      .join("");
  }

  /**
   * Render Star Rating
   */
  renderStars(rating) {
    let stars = "";
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars += '<i class="fas fa-star"></i>';
      } else if (i - 0.5 === rating) {
        stars += '<i class="fas fa-star-half-alt"></i>';
      } else {
        stars += '<i class="far fa-star"></i>';
      }
    }
    return stars;
  }

  /**
   * Render Pagination
   */
  renderPagination() {
    const paginationContainer = document.getElementById("pagination");
    if (!paginationContainer) return;

    const totalPages = this.getTotalPages();
    if (totalPages <= 1) {
      paginationContainer.innerHTML = "";
      return;
    }

    let html = '<ul class="pagination">';

    // Previous button
    html += `
            <li>
                <button ${this.currentPage === 1 ? "disabled" : ""} 
                        onclick="productManager.changePage(${
                          this.currentPage - 1
                        })">
                    <i class="fas fa-chevron-left"></i>
                </button>
            </li>
        `;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= this.currentPage - 1 && i <= this.currentPage + 1)
      ) {
        html += `
                    <li>
                        <button class="${
                          i === this.currentPage ? "active" : ""
                        }" 
                                onclick="productManager.changePage(${i})">
                            ${i}
                        </button>
                    </li>
                `;
      } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
        html += "<li><button disabled>...</button></li>";
      }
    }

    // Next button
    html += `
            <li>
                <button ${this.currentPage === totalPages ? "disabled" : ""} 
                        onclick="productManager.changePage(${
                          this.currentPage + 1
                        })">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </li>
        `;

    html += "</ul>";
    paginationContainer.innerHTML = html;
  }

  /**
   * Update Results Count
   */
  updateResultsCount() {
    const countElement = document.querySelector(".results-count");
    if (countElement) {
      const start = (this.currentPage - 1) * this.productsPerPage + 1;
      const end = Math.min(
        this.currentPage * this.productsPerPage,
        this.filteredProducts.length
      );
      const total = this.filteredProducts.length;

      countElement.innerHTML = `Showing <strong>${start}-${end}</strong> of <strong>${total}</strong> results`;
    }
  }

  /**
   * Attach Event Listeners
   */
  attachEventListeners() {
    // Sort dropdown
    const sortSelect = document.getElementById("sortSelect");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        this.updateSort(e.target.value);
      });
    }

    // Search input
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchProducts(e.target.value);
      });
    }

    // Price range
    const priceRange = document.getElementById("priceRange");
    if (priceRange) {
      priceRange.addEventListener("input", (e) => {
        const max = parseInt(e.target.value);
        this.updatePriceRange(0, max);

        const priceInputs = document.querySelectorAll(".price-input input");
        if (priceInputs[1]) priceInputs[1].value = max;
      });
    }

    // Category checkboxes
    document
      .querySelectorAll('input[type="checkbox"][id^="cat"]')
      .forEach((checkbox) => {
        checkbox.addEventListener("change", (e) => {
          const category = e.target.labels[0].textContent.trim();
          this.updateCategoryFilter(category, e.target.checked);
        });
      });

    // Brand checkboxes
    document
      .querySelectorAll('input[type="checkbox"][id^="brand"]')
      .forEach((checkbox) => {
        checkbox.addEventListener("change", (e) => {
          const brand = e.target.labels[0].textContent.trim();
          this.updateBrandFilter(brand, e.target.checked);
        });
      });

    // Rating radio buttons
    document
      .querySelectorAll('input[type="radio"][name="rating"]')
      .forEach((radio) => {
        radio.addEventListener("change", (e) => {
          const rating = parseInt(e.target.id.replace("rating", ""));
          this.updateRatingFilter(rating);
        });
      });
  }
}

// Quick View Function
function quickView(productId) {
  alert(
    `Quick view for product: ${productId}\nIn production, this would open a modal with product details.`
  );
}

// Toggle Wishlist Function
function toggleWishlist(productId) {
  const btn = event.target.closest(".wishlist-btn");
  const icon = btn.querySelector("i");

  if (icon.classList.contains("far")) {
    icon.classList.remove("far");
    icon.classList.add("fas");
    btn.classList.add("active");

    if (window.shopEase && window.shopEase.showToast) {
      window.shopEase.showToast("Added to wishlist!", "success");
    }
  } else {
    icon.classList.remove("fas");
    icon.classList.add("far");
    btn.classList.remove("active");

    if (window.shopEase && window.shopEase.showToast) {
      window.shopEase.showToast("Removed from wishlist", "success");
    }
  }
}

// Initialize Product Manager
let productManager;
document.addEventListener("DOMContentLoaded", () => {
  productManager = new ProductManager();
  window.productManager = productManager;
});

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = ProductManager;
}
