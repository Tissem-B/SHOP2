document.addEventListener("DOMContentLoaded", () => {
    loadCartItems()
    setupEventListeners()
  })
  
  // Assuming these functions/variables are defined elsewhere, likely in a separate script file.
  // For the code to run without errors, we need to either import them or define them here.
  // Since we don't have the actual implementations, we'll add placeholder declarations.
  const products = [] // Placeholder: Replace with actual product data or import
  function updateCartCount() {} // Placeholder: Replace with actual implementation or import
  function showToast(message) {
    console.log(message)
  } // Placeholder: Replace with actual implementation or import
  function addToCart(productId) {} // Placeholder: Replace with actual implementation or import
  
  function loadCartItems() {
    const cart = JSON.parse(localStorage.getItem("smartfarm-cart")) || []
    const cartItemsContainer = document.getElementById("cart-items")
    const emptyCartMessage = document.getElementById("empty-cart")
    const checkoutBtn = document.getElementById("checkout-btn")
  
    if (!cartItemsContainer) return
  
    // Vider le conteneur
    cartItemsContainer.innerHTML = ""
  
    if (cart.length === 0) {
      // Afficher le message de panier vide
      if (emptyCartMessage) emptyCartMessage.style.display = "flex"
      if (checkoutBtn) checkoutBtn.disabled = true
  
      // Mettre à jour les totaux
      document.getElementById("subtotal").textContent = "0.00 €"
      document.getElementById("total").textContent = "0.00 €"
      return
    }
  
    // Cacher le message de panier vide et activer le bouton de commande
    if (emptyCartMessage) emptyCartMessage.style.display = "none"
    if (checkoutBtn) checkoutBtn.disabled = false
  
    let subtotal = 0
  
    // Créer un élément pour chaque article du panier
    cart.forEach((item) => {
      const product = products.find((p) => p.id === item.id)
      if (!product) return
  
      const itemTotal = product.price * item.quantity
      subtotal += itemTotal
  
      const cartItem = document.createElement("div")
      cartItem.className = "cart-item"
      cartItem.dataset.id = item.id
  
      cartItem.innerHTML = `
              <div class="item-image">
                  <img src="${product.image}" alt="${product.name}">
              </div>
              <div class="item-details">
                  <h3>${product.name}</h3>
                  <p>${product.shortDescription || product.description}</p>
              </div>
              <div class="item-quantity">
                  <button class="qty-btn minus"><i class="fas fa-minus"></i></button>
                  <input type="number" value="${item.quantity}" min="1" class="qty-input">
                  <button class="qty-btn plus"><i class="fas fa-plus"></i></button>
              </div>
              <div class="item-price">${itemTotal.toFixed(2)} €</div>
              <button class="remove-item"><i class="fas fa-trash"></i></button>
          `
  
      cartItemsContainer.appendChild(cartItem)
    })
  
    // Mettre à jour les totaux
    document.getElementById("subtotal").textContent = `${subtotal.toFixed(2)} €`
    document.getElementById("total").textContent = `${subtotal.toFixed(2)} €`
  
    // Charger les produits recommandés
    loadRecommendedProducts()
  }
  
  function setupEventListeners() {
    // Délégation d'événements pour les boutons de quantité
    document.addEventListener("click", (e) => {
      // Bouton moins
      if (e.target.closest(".qty-btn.minus")) {
        const input = e.target.closest(".item-quantity").querySelector(".qty-input")
        const newValue = Math.max(1, Number.parseInt(input.value) - 1)
        input.value = newValue
        updateCartItem(e.target.closest(".cart-item").dataset.id, newValue)
      }
  
      // Bouton plus
      if (e.target.closest(".qty-btn.plus")) {
        const input = e.target.closest(".item-quantity").querySelector(".qty-input")
        const newValue = Number.parseInt(input.value) + 1
        input.value = newValue
        updateCartItem(e.target.closest(".cart-item").dataset.id, newValue)
      }
  
      // Bouton supprimer
      if (e.target.closest(".remove-item")) {
        const itemId = e.target.closest(".cart-item").dataset.id
        removeCartItem(itemId)
      }
    })
  
    // Changement manuel de quantité
    document.addEventListener("change", (e) => {
      if (e.target.classList.contains("qty-input")) {
        const newValue = Math.max(1, Number.parseInt(e.target.value))
        e.target.value = newValue
        updateCartItem(e.target.closest(".cart-item").dataset.id, newValue)
      }
    })
  
    // Bouton de commande
    const checkoutBtn = document.getElementById("checkout-btn")
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", () => {
        window.location.href = "checkout.html"
      })
    }
  }
  
  function updateCartItem(productId, quantity) {
    const cart = JSON.parse(localStorage.getItem("smartfarm-cart")) || []
    const item = cart.find((item) => item.id === productId)
  
    if (item) {
      item.quantity = quantity
      localStorage.setItem("smartfarm-cart", JSON.stringify(cart))
      loadCartItems() // Recharger le panier
      updateCartCount() // Mettre à jour le compteur dans le header
    }
  }
  
  function removeCartItem(productId) {
    const cart = JSON.parse(localStorage.getItem("smartfarm-cart")) || []
    const updatedCart = cart.filter((item) => item.id !== productId)
  
    localStorage.setItem("smartfarm-cart", JSON.stringify(updatedCart))
    loadCartItems() // Recharger le panier
    updateCartCount() // Mettre à jour le compteur dans le header
  
    showToast("Article supprimé du panier")
  }
  
  function loadRecommendedProducts() {
    const container = document.getElementById("recommended-products")
    if (!container) return
  
    // Sélectionner 4 produits aléatoires
    const shuffled = [...products].sort(() => 0.5 - Math.random())
    const selected = shuffled.slice(0, 4)
  
    container.innerHTML = ""
  
    selected.forEach((product) => {
      const card = document.createElement("div")
      card.className = "product-card"
  
      card.innerHTML = `
              <img src="${product.image}" alt="${product.name}" class="product-image">
              <div class="product-info">
                  <h3 class="product-name">${product.name}</h3>
                  <p class="product-price">${product.price.toFixed(2)} €</p>
                  <button class="btn btn-sm btn-add-to-cart" data-id="${product.id}">
                      <i class="fas fa-cart-plus"></i> Ajouter
                  </button>
              </div>
          `
  
      container.appendChild(card)
    })
  
    // Ajouter les écouteurs d'événements pour les boutons d'ajout au panier
    document.querySelectorAll("#recommended-products .btn-add-to-cart").forEach((btn) => {
      btn.addEventListener("click", function () {
        const productId = this.dataset.id
        addToCart(productId)
        showToast("Produit ajouté au panier")
      })
    })
  }
  