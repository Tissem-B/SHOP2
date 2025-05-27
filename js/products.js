function getUniqueProductsWithCount(products) {
  const map = new Map();

  products.forEach((product) => {
    const key = product.name;

    // Uniquement les produits non vendus
    if (product.sold === false) {
      if (!map.has(key)) {
        // Premier exemplaire, on stocke le produit + quantité
        map.set(key, { ...product, quantity: 1 });
      } else {
        // Déjà présent, on incrémente la quantité
        map.get(key).quantity += 1;
      }
    }
  });

  return Array.from(map.values());
}

function addToCart(productId, quantity = 1) {
  let cart = JSON.parse(localStorage.getItem("smartfarm-cart")) || [];
  const product = window.products.find((p) => p.id === productId);

  if (!product) {
    console.error("Produit non trouvé :", productId);
    return;
  }

  // Vérifie si le produit EXACT existe déjà (même ID, nom ET prix)
  const isExactDuplicate = cart.some(
    (item) =>
      item.id === productId &&
      item.name === product.name &&
      item.price === product.price
  );

  if (!isExactDuplicate) {
    cart.push({
      id: productId,
      name: product.name,
      price: product.price,
      image: "assets/images/esp32.jpg",
      quantity: quantity,
    });
  } else {
    // Optionnel : message si tentative d'ajout d'un doublon exact
    console.log("Ce produit existe déjà dans le panier");
    return;
  }

  localStorage.setItem("smartfarm-cart", JSON.stringify(cart));
  updateCartCount();
  showToast(`${product.name} ajouté au panier`);
}

document.addEventListener("DOMContentLoaded", function () {
  const featuredProductsContainer =
    document.getElementById("featured-products");
  const productsGrid = document.getElementById("products-grid");

  fetch("http://localhost:5000/products/available")
    .then((res) => res.json())
    .then((data) => {
      if (!data.success) {
        throw new Error("Erreur lors de la récupération des produits");
      }

      // Stocker les produits pour les utiliser plus tard
      window.products = data.availableProducts;
      const uniqueProducts = getUniqueProductsWithCount(data.availableProducts);

      if (featuredProductsContainer) {
        const shuffled = [...uniqueProducts].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 4);

        selected.forEach((product) => {
          featuredProductsContainer.appendChild(
            createProductCard(product, product.quantity)
          );
        });
      }

      if (productsGrid) {
        displayProducts(uniqueProducts);
        setupFilters();
      }

      if (document.querySelector(".product-detail-page")) {
        loadProductDetail();
      }

      // Gestion des clics sur les boutons "Ajouter au panier"
      document.querySelectorAll(".btn-add-to-cart").forEach((button) => {
        button.addEventListener("click", function () {
          const productId = this.getAttribute("data-id");
          const quantity = 1;

          // Vérifie si le bouton est en "Rupture"
          if (this.textContent.trim().includes("Rupture")) {
            alert("Ce produit est en rupture de stock.");
            return;
          }

          addToCart(productId, quantity);
        });
      });
    })
    .catch((err) => {
      console.error("Erreur de chargement des produits :", err);
    });
});

// Créer une carte produit (version corrigée)
function createProductCard(product, quantity) {
  const card = document.createElement("div");
  card.className = "product-card";
  card.dataset.id = product.id;
  card.dataset.category = product.category;

  const stockStatus =
    quantity > 0 ? (quantity < 5 ? "low-stock" : "in-stock") : "out-of-stock";
  const stockText =
    quantity > 0
      ? quantity < 5
        ? "Stock faible"
        : "En stock"
      : "Rupture de stock";

  card.innerHTML = `
    <div class="product-badge ${stockStatus}">${stockText}</div>
    <img src="assets/images/esp32.jpg" alt="${
      product.name
    }" class="product-image">
    <div class="product-info">
      <h3 class="product-name">${product.name}</h3>
      <p class="product-description">${product.shortDescription}</p>
      <div class="product-meta">
        <div class="product-price">
          ${
            product.originalPrice
              ? `<span class="original-price">${product.originalPrice.toFixed(
                  2
                )} €</span>`
              : ""
          }
          <span>${product.price.toFixed(2)} €</span>
        </div>
        <div class="product-rating">
          ${4} (${4})
        </div>
      </div>
      <button class="btn btn-add-to-cart" data-id="${product.id}">
        <i class="fas fa-cart-plus"></i>
        ${quantity === 0 ? "Rupture" : "Ajouter"}
      </button>
    </div>
  `;

  return card;
}

// Générer le rating en étoiles
function generateStarRating(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;

  return "★".repeat(fullStars) + (halfStar ? "½" : "") + "☆".repeat(emptyStars);
}

// Afficher les produits avec filtrage
function displayProducts(productsToDisplay) {
  const productsGrid = document.getElementById("products-grid");
  if (!productsGrid) return;

  productsGrid.innerHTML = "";

  if (productsToDisplay.length === 0) {
    productsGrid.innerHTML =
      '<p class="no-products">Aucun produit ne correspond à vos critères.</p>';
    return;
  }

  productsToDisplay.forEach((product) => {
    productsGrid.appendChild(createProductCard(product));
  });

  // Ajouter les écouteurs d'événements pour le panier
  document.querySelectorAll(".btn-add-to-cart").forEach((btn) => {
    btn.addEventListener("click", function () {
      const productId = this.dataset.id;
      addToCart(productId);
    });
  });
}

// Configurer les filtres
function setupFilters() {
  const categoryLinks = document.querySelectorAll(".category-list a");
  const priceRange = document.getElementById("price-range");
  const searchInput = document.getElementById("product-search");
  const sortSelect = document.getElementById("sort-by");

  // Filtrage par catégorie
  categoryLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const category = this.dataset.category;
      filterProducts(category);

      // Mettre à jour l'état actif
      categoryLinks.forEach((l) => l.classList.remove("active"));
      this.classList.add("active");
    });
  });

  // Filtrage par prix
  if (priceRange) {
    const maxPriceDisplay = document.getElementById("max-price");
    priceRange.addEventListener("input", function () {
      maxPriceDisplay.textContent = `${this.value} €`;
      filterProducts();
    });
  }

  // Recherche
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      filterProducts();
    });
  }

  // Tri
  if (sortSelect) {
    sortSelect.addEventListener("change", function () {
      filterProducts();
    });
  }
}

// Filtrer les produits
function filterProducts(category = null) {
  const activeCategory =
    category ||
    document.querySelector(".category-list a.active")?.dataset.category ||
    "all";
  const priceRange = document.getElementById("price-range");
  const maxPrice = priceRange ? parseInt(priceRange.value) : 500;
  const searchInput = document.getElementById("product-search");
  const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
  const sortSelect = document.getElementById("sort-by");
  const sortOption = sortSelect ? sortSelect.value : "default";

  let filteredProducts = [...products];

  // Filtrer par catégorie
  if (activeCategory !== "all") {
    filteredProducts = filteredProducts.filter(
      (p) => p.category === activeCategory
    );
  }

  // Filtrer par prix
  filteredProducts = filteredProducts.filter((p) => p.price <= maxPrice);

  // Filtrer par recherche
  if (searchTerm) {
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm)
    );
  }

  // Trier
  switch (sortOption) {
    case "price-asc":
      filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      filteredProducts.sort((a, b) => b.price - a.price);
      break;
    case "name-asc":
      filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "name-desc":
      filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case "rating":
      filteredProducts.sort((a, b) => b.rating - a.rating);
      break;
  }

  displayProducts(filteredProducts);
}

// Charger les détails du produit
function loadProductDetail() {
  // Dans une vraie application, vous obtiendriez l'ID du produit à partir de l'URL
  // Pour cet exemple, nous prenons le premier produit
  const productId =
    new URLSearchParams(window.location.search).get("id") || products[0].id;
  const product = products.find((p) => p.id === productId);

  if (!product) {
    window.location.href = "products.html";
    return;
  }

  // Mettre à jour les informations du produit
  document.getElementById("product-name").textContent = product.name;
  document.getElementById("product-name-breadcrumb").textContent = product.name;
  document.getElementById("product-category-breadcrumb").textContent =
    getCategoryName(product.category);
  document.getElementById("product-description-text").textContent =
    product.description;
  document.getElementById("full-description").textContent =
    product.fullDescription;
  document.getElementById(
    "current-price"
  ).textContent = `${product.price.toFixed(2)} €`;

  if (product.originalPrice) {
    document.getElementById(
      "original-price"
    ).textContent = `${product.originalPrice.toFixed(2)} €`;
  }

  // Rating
  document.getElementById("product-stars").innerHTML = generateStarRating(
    product.rating
  );
  document.getElementById(
    "review-count"
  ).textContent = `(${product.reviewCount} avis)`;

  // Stock
  const stockElement = document.getElementById("product-stock");
  stockElement.className =
    "product-stock " + (product.stock > 0 ? "in-stock" : "out-of-stock");
  stockElement.textContent =
    product.stock > 0
      ? product.stock < 5
        ? `Seulement ${product.stock} en stock!`
        : "En stock"
      : "Rupture de stock";

  // Images
  const mainImage = document.getElementById("main-product-image");
  mainImage.src = "assets/images/esp32.jpg";
  mainImage.alt = product.name;

  const thumbnailsContainer = document.getElementById("thumbnail-images");
  thumbnailsContainer.innerHTML = "";

  product.images.forEach((img, index) => {
    const thumb = document.createElement("div");
    thumb.className = `thumbnail ${index === 0 ? "active" : ""}`;
    // miniatures toujours la même image statique
    thumb.innerHTML = `<img src='assets/images/esp32.jpg' alt="${product.name}">`;
    thumb.addEventListener("click", function () {
      mainImage.src = img; // changer l'image principale vers l'url dynamique
      document
        .querySelectorAll(".thumbnail")
        .forEach((t) => t.classList.remove("active"));
      this.classList.add("active");
    });
    thumbnailsContainer.appendChild(thumb);
  });

  // Spécifications
  const specsTable = document.getElementById("product-specs-table");
  specsTable.innerHTML = "";

  for (const [key, value] of Object.entries(product.specs)) {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${key}</td>
            <td>${value}</td>
        `;
    specsTable.appendChild(row);
  }

  // Spécifications détaillées (même données pour cet exemple)
  const detailedSpecs = document.getElementById("detailed-specs");
  detailedSpecs.innerHTML = "";

  for (const [key, value] of Object.entries(product.specs)) {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${key}</td>
            <td>${value}</td>
        `;
    detailedSpecs.appendChild(row);
  }

  // Gestion de la quantité
  const decreaseBtn = document.getElementById("decrease-qty");
  const increaseBtn = document.getElementById("increase-qty");
  const qtyInput = document.getElementById("product-qty");

  decreaseBtn.addEventListener("click", function () {
    if (parseInt(qtyInput.value) > 1) {
      qtyInput.value = parseInt(qtyInput.value) - 1;
    }
  });

  increaseBtn.addEventListener("click", function () {
    qtyInput.value = parseInt(qtyInput.value) + 1;
  });

  // Boutons d'achat
  const addToCartBtn = document.getElementById("add-to-cart");
  const buyNowBtn = document.getElementById("buy-now");

  addToCartBtn.addEventListener("click", function () {
    const quantity = parseInt(qtyInput.value);
    addToCart(product.id, quantity);
    showToast("Produit ajouté au panier");
  });

  buyNowBtn.addEventListener("click", function () {
    const quantity = parseInt(qtyInput.value);
    addToCart(product.id, quantity);
    window.location.href = "cart.html";
  });

  // Charger les produits associés
  const relatedProducts = products.filter(
    (p) => p.category === product.category && p.id !== product.id
  );
  const relatedContainer = document.getElementById("related-products");

  if (relatedContainer && relatedProducts.length > 0) {
    relatedProducts.slice(0, 4).forEach((p) => {
      relatedContainer.appendChild(createProductCard(p));
    });
  } else if (relatedContainer) {
    relatedContainer.innerHTML = "<p>Aucun produit associé trouvé.</p>";
  }
}

function getCategoryName(category) {
  const categories = {
    microcontroller: "Microcontrôleurs",
    sensor: "Capteurs",
    kit: "Kits",
    accessory: "Accessoires",
  };
  return categories[category] || "Catégorie";
}

// Ajouter au panier
// Fonction modifiée pour l'ajout au panier
