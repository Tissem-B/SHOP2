// Fichier checkout.js simplifié avec option d'impression du reçu
document.addEventListener("DOMContentLoaded", () => {
  if (!document.querySelector(".checkout-page")) return;

  loadCheckoutItems();
  setupCheckoutSteps();
});

// Charger les articles du panier dans le résumé de commande
function loadCheckoutItems() {
  const cart = JSON.parse(localStorage.getItem("smartfarm-cart")) || [];
  const summaryContainer = document.getElementById("checkout-summary-items");

  if (!summaryContainer) return;

  summaryContainer.innerHTML = "";

  let subtotal = 0;

  cart.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    const itemElement = document.createElement("div");
    itemElement.className = "summary-item";
    itemElement.innerHTML = `
            <div class="summary-item-name">
                <img src="${item.image}" alt="${item.name}">
                <div>
                    <div>${item.name}</div>
                    <div class="summary-item-qty">Quantité: ${
                      item.quantity
                    }</div>
                </div>
            </div>
            <div class="summary-item-price">${itemTotal.toFixed(2)} €</div>
        `;

    summaryContainer.appendChild(itemElement);
  });

  document.getElementById(
    "checkout-subtotal"
  ).textContent = `${subtotal.toFixed(2)} €`;

  // Initialiser avec la livraison standard
  updateShippingCost("standard");
}

// Configurer les étapes du checkout et les boutons de navigation
function setupCheckoutSteps() {
  const steps = document.querySelectorAll(".checkout-steps .step");
  const formSteps = document.querySelectorAll(".checkout-step");

  // Initialiser la première étape
  steps[0].classList.add("active");
  formSteps[0].classList.add("active");

  // Bouton pour passer à l'étape de livraison
  const continueToShippingBtn = document.getElementById("continue-to-shipping");
  if (continueToShippingBtn) {
    continueToShippingBtn.addEventListener("click", () => {
      if (validateStep(1)) {
        goToStep(2);
      }
    });
  }

  // Bouton pour revenir à l'étape d'information
  const backToInfoBtn = document.getElementById("back-to-info");
  if (backToInfoBtn) {
    backToInfoBtn.addEventListener("click", () => {
      goToStep(1);
    });
  }

  // Bouton pour passer à l'étape de paiement
  const continueToPaymentBtn = document.getElementById("continue-to-payment");
  if (continueToPaymentBtn) {
    continueToPaymentBtn.addEventListener("click", () => {
      if (validateStep(2)) {
        goToStep(3);
        const shippingMethod = document.querySelector(
          'input[name="shipping"]:checked'
        ).value;
        updateShippingCost(shippingMethod);
      }
    });
  }

  // Bouton pour revenir à l'étape de livraison
  const backToShippingBtn = document.getElementById("back-to-shipping");
  if (backToShippingBtn) {
    backToShippingBtn.addEventListener("click", () => {
      goToStep(2);
    });
  }

  // Bouton pour revenir au panier
  const backToCartBtn = document.getElementById("back-to-cart");
  if (backToCartBtn) {
    backToCartBtn.addEventListener("click", () => {
      window.location.href = "cart.html";
    });
  }

  // Écouter les changements de méthode de livraison
  document.querySelectorAll('input[name="shipping"]').forEach((radio) => {
    radio.addEventListener("change", function () {
      updateShippingCost(this.value);
    });
  });

  // Configurer le bouton de confirmation de commande
  const confirmOrderBtn = document.getElementById("confirm-order");
  if (confirmOrderBtn) {
    confirmOrderBtn.addEventListener("click", () => {
      completeOrder();
    });
  }

  // Configurer le bouton d'impression du reçu
  const printReceiptBtn = document.getElementById("print-receipt");
  if (printReceiptBtn) {
    printReceiptBtn.addEventListener("click", () => {
      printReceipt();
    });
  }
}

// Fonction pour changer d'étape
function goToStep(stepNumber) {
  // Mettre à jour les étapes visuelles
  document.querySelectorAll(".checkout-steps .step").forEach((step, index) => {
    if (index < stepNumber - 1) {
      step.classList.add("completed");
    } else {
      step.classList.remove("completed");
    }

    if (index === stepNumber - 1) {
      step.classList.add("active");
    } else {
      step.classList.remove("active");
    }
  });

  // Mettre à jour les formulaires
  document.querySelectorAll(".checkout-step").forEach((step, index) => {
    if (index === stepNumber - 1) {
      step.classList.add("active");
    } else {
      step.classList.remove("active");
    }
  });

  // Faire défiler vers le haut
  window.scrollTo(0, 0);
}

// Valider les champs à chaque étape
function validateStep(stepNumber) {
  let isValid = true;

  if (stepNumber === 1) {
    // Valider les informations de contact et d'adresse
    const requiredFields = [
      "email",
      "phone",
      "first-name",
      "last-name",
      "address",
      "postal-code",
      "city",
      "country",
    ];

    requiredFields.forEach((fieldId) => {
      const field = document.getElementById(fieldId);
      if (field && !field.value.trim()) {
        field.style.borderColor = "red";
        isValid = false;
      } else if (field) {
        field.style.borderColor = "";
      }
    });

    // Validation basique de l'email
    const email = document.getElementById("email");
    if (
      email &&
      email.value &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
    ) {
      email.style.borderColor = "red";
      isValid = false;
      showToast("Veuillez entrer une adresse email valide", "error");
    }

    if (!isValid) {
      showToast("Veuillez remplir tous les champs obligatoires", "error");
    }
  }

  return isValid;
}

// Mettre à jour le coût de livraison
function updateShippingCost(shippingMethod) {
  let shippingCost = 0;
  const cart = JSON.parse(localStorage.getItem("smartfarm-cart")) || [];
  if (shippingMethod === "standard") {
    shippingCost = 5.99;
  } else if (shippingMethod === "express") {
    shippingCost = 12.99;
  }

  Date;
  console.log(cart);
  let subtotal = 0;

  cart.forEach((item) => {
    subtotal += item.price * item.quantity;
  });

  const total = subtotal + shippingCost;

  const shippingElement = document.getElementById("checkout-shipping");
  if (shippingElement) {
    shippingElement.textContent = `${shippingCost.toFixed(2)} €`;
  }

  const totalElement = document.getElementById("checkout-total");
  if (totalElement) {
    totalElement.textContent = `${total.toFixed(2)} €`;
  }

  // Mettre à jour le montant affiché pour le paiement
  const paymentAmountElement = document.getElementById("payment-amount");
  if (paymentAmountElement) {
    paymentAmountElement.textContent = total.toFixed(2);
  }
}

// Finaliser la commande
function completeOrder() {
  // Afficher un indicateur de chargement sur le bouton
  const button = document.getElementById("confirm-order");
  const originalButtonText = button.innerHTML;
  button.innerHTML =
    '<i class="fas fa-spinner fa-spin"></i> Traitement en cours...';
  button.disabled = true;

  // Générer un numéro de commande
  const orderNumber = "SF" + Math.floor(100000 + Math.random() * 900000);

  // Récupérer les informations client
  const customerEmail = document.getElementById("email").value;
  const firstName = document.getElementById("first-name").value;
  const lastName = document.getElementById("last-name").value;

  // Récupérer les informations de commande
  const cart = JSON.parse(localStorage.getItem("smartfarm-cart")) || [];
  const shippingMethod = document.querySelector(
    'input[name="shipping"]:checked'
  ).value;
  const shippingCost = shippingMethod === "standard" ? 5.99 : 12.99;

  let subtotal = 0;
  cart.forEach((item) => {
    subtotal += item.price * item.quantity;
  });

  const total = subtotal + shippingCost;

  // Créer l'objet de commande
  const orderDetails = {
    orderNumber: orderNumber,
    customer: {
      email: customerEmail,
      firstName: firstName,
      lastName: lastName,
      phone: document.getElementById("phone").value,
      address: document.getElementById("address").value,
      city: document.getElementById("city").value,
      postalCode: document.getElementById("postal-code").value,
      country: document.getElementById("country").value,
    },
    items: cart,
    shipping: shippingMethod,
    shippingCost: shippingCost,
    subtotal: subtotal,
    total: total,
    payment: {
      method: "cash",
    },
    date: new Date().toISOString(),
  };

  // Stocker les détails de la commande dans le localStorage pour le reçu
  localStorage.setItem("smartfarm-last-order", JSON.stringify(orderDetails));

  // Simuler un délai de traitement
  setTimeout(() => {
    // Afficher la confirmation
    showOrderConfirmation(orderDetails);

    // Vider le panier
    localStorage.removeItem("smartfarm-cart");
    updateCartCount();

    // Restaurer le bouton
    button.innerHTML = originalButtonText;
    button.disabled = false;
  }, 1500);
}

// Afficher la confirmation de commande
function showOrderConfirmation(orderDetails) {
  // Masquer le formulaire et le résumé
  const checkoutForm = document.querySelector(".checkout-form");
  const checkoutSummary = document.querySelector(".checkout-summary");
  const checkoutConfirmation = document.getElementById("checkout-confirmation");

  if (checkoutForm) checkoutForm.style.display = "none";
  if (checkoutSummary) checkoutSummary.style.display = "none";
  if (checkoutConfirmation) checkoutConfirmation.style.display = "block";

  // Mettre à jour les détails de la confirmation
  const orderNumberElement = document.getElementById("order-number");

  const confirmationEmailElement =
    document.getElementById("confirmation-email");
  if (confirmationEmailElement) {
    confirmationEmailElement.textContent = orderDetails.customer.email;
  }

  const cart = JSON.parse(localStorage.getItem("smartfarm-cart")) || [];
  if (cart) {
    console.log("IDs des produits dans votre panier:");
    cart.forEach((item) => {
      activateProduct(item.id);
      console.log(`id: ${item.id}`);
    });

    const idsContainer = document.createElement("div");
    orderNumberElement.innerHTML = "<h3>IDs de vos appareils:</h3><br/>";

    cart.forEach((item) => {
      orderNumberElement.innerHTML += `<p>id: ${item.id}</p>`;
    });

    document.body.appendChild(idsContainer);
  }

  const orderTotalElement = document.getElementById("order-total");
  if (orderTotalElement) {
    orderTotalElement.textContent = `${orderDetails.total.toFixed(2)} €`;
  }

  const paymentMethodElement = document.getElementById("payment-method");
  if (paymentMethodElement) {
    paymentMethodElement.textContent = "Paiement à la livraison";
  }

  // Mettre à jour l'étape dans le processus
  document.querySelectorAll(".checkout-steps .step").forEach((step, index) => {
    if (index < 3) {
      step.classList.add("completed");
    } else {
      step.classList.add("active");
    }
  });

  // Afficher un message de succès
  showToast("Commande confirmée! Vous pouvez imprimer votre reçu.", "success");
}

// Imprimer le reçu
function printReceipt() {
  // Charger les détails de la dernière commande
  const orderDetails = JSON.parse(localStorage.getItem("smartfarm-last-order"));
  if (!orderDetails) {
    showToast(
      "Impossible de générer le reçu. Détails de commande non trouvés.",
      "error"
    );
    return;
  }

  // Formater la date
  const orderDate = new Date(orderDetails.date);
  const formattedDate = orderDate.toLocaleDateString("fr-FR");

  // Créer une nouvelle fenêtre pour l'impression
  const printWindow = window.open("", "_blank");

  // Générer le contenu HTML du reçu
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Reçu de commande #${orderDetails.orderNumber}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .receipt {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #eee;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid #eee;
        }
        .header h1 {
          color: #4CAF50;
          margin-bottom: 5px;
        }
        .info-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .info-box {
          width: 48%;
        }
        .info-box h3 {
          margin-top: 0;
          border-bottom: 1px solid #eee;
          padding-bottom: 5px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th {
          background-color: #f2f2f2;
          text-align: left;
          padding: 10px;
          border-bottom: 1px solid #ddd;
        }
        td {
          padding: 10px;
          border-bottom: 1px solid #eee;
        }
        .text-right {
          text-align: right;
        }
        .text-center {
          text-align: center;
        }
        .totals {
          margin-top: 20px;
          text-align: right;
        }
        .total-row {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 5px;
        }
        .total-label {
          width: 150px;
          text-align: right;
          margin-right: 20px;
        }
        .total-value {
          width: 100px;
          text-align: right;
        }
        .grand-total {
          font-weight: bold;
          font-size: 1.2em;
          border-top: 2px solid #000;
          padding-top: 5px;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          color: #666;
          font-size: 0.9em;
        }
        @media print {
          body {
            padding: 0;
          }
          .receipt {
            border: none;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <h1>SmartFarm Shop</h1>
          <p>Reçu de commande</p>
        </div>
        
        <div class="info-section">
          <div class="info-box">
            <h3>Informations de commande</h3>
            <p><strong>Numéro de commande:</strong> #${
              orderDetails.orderNumber
            }</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Méthode de paiement:</strong> Paiement à la livraison</p>
          </div>
          
          <div class="info-box">
            <h3>Adresse de livraison</h3>
            <p>${orderDetails.customer.firstName} ${
    orderDetails.customer.lastName
  }</p>
            <p>${orderDetails.customer.address}</p>
            <p>${orderDetails.customer.postalCode} ${
    orderDetails.customer.city
  }</p>
            <p>${orderDetails.customer.country}</p>
          </div>
        </div>
        
        <h3>Articles commandés</h3>
        <table>
          <thead>
            <tr>
              <th>Produit</th>
              <th class="text-center">Quantité</th>
              <th class="text-right">Prix unitaire</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${orderDetails.items
              .map(
                (item) => `
              <tr>
                <td>${item.name}</td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-right">${item.price.toFixed(2)} €</td>
                <td class="text-right">${(item.price * item.quantity).toFixed(
                  2
                )} €</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        
        <div class="totals">
          <div class="total-row">
            <div class="total-label">Sous-total:</div>
            <div class="total-value">${orderDetails.subtotal.toFixed(2)} €</div>
          </div>
          <div class="total-row">
            <div class="total-label">Livraison (${
              orderDetails.shipping === "standard" ? "Standard" : "Express"
            }):</div>
            <div class="total-value">${orderDetails.shippingCost.toFixed(
              2
            )} €</div>
          </div>
          <div class="total-row grand-total">
            <div class="total-label">Total:</div>
            <div class="total-value">${orderDetails.total.toFixed(2)} €</div>
          </div>
        </div>
        
        <div class="footer">
          <p>Merci pour votre commande!</p>
          <p>Pour toute question, contactez-nous à contact@smartfarmshop.com</p>
        </div>
        
        <div class="no-print" style="text-align: center; margin-top: 30px;">
          <button onclick="window.print()" style="padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Imprimer
          </button>
          <button onclick="window.close()" style="padding: 10px 20px; background-color: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">
            Fermer
          </button>
        </div>
      </div>
      
      <script>
        // Imprimer automatiquement après chargement
        window.onload = function() {
          // Attendre un peu pour que les styles soient appliqués
          setTimeout(function() {
            window.print();
          }, 500);
        }
      </script>
    </body>
    </html>
  `);

  printWindow.document.close();
}

// Fonction utilitaire pour afficher des messages toast
function showToast(message, type = "success") {
  const toastContainer = document.querySelector(".toast-container");
  if (!toastContainer) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toastContainer.removeChild(toast);
    }, 300);
  }, 3000);
}

// Fonction utilitaire pour mettre à jour le compteur du panier
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("smartfarm-cart")) || [];
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  document.querySelectorAll("#cart-btn").forEach((btn) => {
    if (btn) {
      btn.dataset.count = cartCount;
    }
  });
}
function activateProduct(productId) {
  // URL de votre endpoint backend
  const url = `http://localhost:5000/products/${productId}/sold`;

  // Options de la requête
  const options = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  };

  // Envoi de la requête
  fetch(url, options)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erreur lors de l'activation");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Succès:", data);
      // Ici vous pouvez mettre à jour l'UI ou afficher un message
      alert("Produit activé avec succès !");

      // Optionnel: Recharger les données ou mettre à jour l'affichage
      // refreshProductList();
    })
    .catch((error) => {
      console.error("Erreur:", error);
      alert("Échec de l'activation: " + error.message);
    });
}
