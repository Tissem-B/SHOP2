// Fonction pour charger les articles du panier
document.addEventListener("DOMContentLoaded", () => {
  loadCartItems();
  setupCartEventListeners();
});

// Charger les articles du panier
function loadCartItems() {
  const cart = JSON.parse(localStorage.getItem("smartfarm-cart")) || [];
  const cartItemsContainer = document.getElementById("cart-items");
  const emptyCartMessage = document.getElementById("empty-cart");
  const checkoutBtn = document.getElementById("checkout-btn");

  // Vérifier si nous sommes sur la page panier
  if (!cartItemsContainer) return;

  // Vider le conteneur
  cartItemsContainer.innerHTML = "";

  if (cart.length === 0) {
    // Afficher le message de panier vide
    if (emptyCartMessage) emptyCartMessage.style.display = "flex";
    if (checkoutBtn) checkoutBtn.disabled = true;

    // Mettre à jour les totaux
    document.getElementById("subtotal").textContent = "0.00 €";
    document.getElementById("total").textContent = "0.00 €";
    return;
  }

  // Cacher le message de panier vide et activer le bouton de commande
  if (emptyCartMessage) emptyCartMessage.style.display = "none";
  if (checkoutBtn) checkoutBtn.disabled = false;

  let subtotal = 0;

  // Créer un élément pour chaque article du panier
  cart.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";
    cartItem.dataset.id = item.id;

    cartItem.innerHTML = `
              <div class="item-image">
                  <img src="${item.image}" alt="${item.name}">
              </div>
              <div class="item-details">
                  <h3>${item.name}</h3>
                  <p>${item.description || "Produit SmartFarm"}</p>
              </div>
              <div class="item-quantity">
                  <button class="qty-btn minus"><i class="fas fa-minus"></i></button>
                  <input type="number" value="${
                    item.quantity
                  }" min="1" class="qty-input">
                  <button class="qty-btn plus"><i class="fas fa-plus"></i></button>
              </div>
              <div class="item-price">${itemTotal.toFixed(2)} €</div>
              <button class="remove-item"><i class="fas fa-trash"></i></button>
          `;

    cartItemsContainer.appendChild(cartItem);
  });

  // Mettre à jour les totaux
  document.getElementById("subtotal").textContent = `${subtotal.toFixed(2)} €`;
  document.getElementById("total").textContent = `${subtotal.toFixed(2)} €`;

  // Afficher le contenu du panier dans la console pour débogage
  console.log("Contenu du panier:", cart);
}

// Configurer les écouteurs d'événements pour le panier
function setupCartEventListeners() {
  // Délégation d'événements pour les boutons de quantité
  document.addEventListener("click", (e) => {
    // Bouton moins
    if (e.target.closest(".qty-btn.minus")) {
      const input = e.target
        .closest(".item-quantity")
        .querySelector(".qty-input");
      const newValue = Math.max(1, Number.parseInt(input.value) - 1);
      input.value = newValue;
      updateCartItem(e.target.closest(".cart-item").dataset.id, newValue);
    }

    // Bouton plus
    if (e.target.closest(".qty-btn.plus")) {
      const input = e.target
        .closest(".item-quantity")
        .querySelector(".qty-input");
      const newValue = Number.parseInt(input.value) + 1;
      input.value = newValue;
      updateCartItem(e.target.closest(".cart-item").dataset.id, newValue);
    }

    // Bouton supprimer
    if (e.target.closest(".remove-item")) {
      const itemId = e.target.closest(".cart-item").dataset.id;
      removeCartItem(itemId);
    }
  });

  // Changement manuel de quantité
  document.addEventListener("change", (e) => {
    if (e.target.classList.contains("qty-input")) {
      const newValue = Math.max(1, Number.parseInt(e.target.value));
      e.target.value = newValue;
      updateCartItem(e.target.closest(".cart-item").dataset.id, newValue);
    }
  });

  // Bouton de commande
  const checkoutBtn = document.getElementById("checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      window.location.href = "checkout.html";
    });
  }
}

// Mettre à jour un article du panier
function updateCartItem(productId, quantity) {
  const cart = JSON.parse(localStorage.getItem("smartfarm-cart")) || [];
  const item = cart.find((item) => item.id === productId);

  if (item) {
    item.quantity = quantity;
    localStorage.setItem("smartfarm-cart", JSON.stringify(cart));
    loadCartItems(); // Recharger le panier
    updateCartCount(); // Mettre à jour le compteur dans le header
  }
}

// Supprimer un article du panier
function removeCartItem(productId) {
  const cart = JSON.parse(localStorage.getItem("smartfarm-cart")) || [];
  const updatedCart = cart.filter((item) => item.id !== productId);

  localStorage.setItem("smartfarm-cart", JSON.stringify(updatedCart));
  loadCartItems(); // Recharger le panier
  updateCartCount(); // Mettre à jour le compteur dans le header

  showToast("Article supprimé du panier");
}

// Déclarations des fonctions manquantes (à adapter selon votre projet)
function updateCartCount() {
  // Implémentez la logique pour mettre à jour le compteur du panier
  console.log("Mise à jour du compteur du panier");
}

function showToast(message) {
  // Implémentez la logique pour afficher un toast (message flash)
  console.log("Toast:", message);
}
