const express = require("express");
const cors = require("cors");
const admin = require("./firebase");
const db = admin.database();
const PORT = process.env.PORT || 5000;

const app = express();

// Configuration CORS
app.use(cors());
app.use(express.json());

// Route existante
app.post("/message", (req, res) => {
  const { nom, type } = req.body;
  console.log("✅ Données reçues :", nom, type);
  res.json({ message: "Reçu", nom, type });
});

// Route pour les produits vendus
app.get("/products/sold/count", (req, res) => {
  db.ref("products")
    .once("value")
    .then((snapshot) => {
      const products = snapshot.val() || {};
      let soldCount = 0;

      Object.keys(products).forEach((key) => {
        if (products[key].sold === true) soldCount++;
      });

      res.json({
        success: true,
        soldCount,
      });
    })
    .catch((error) => {
      console.error("Erreur:", error);
      res.status(500).json({
        success: false,
        error: "Erreur serveur",
      });
    });
});

app.get("/products/available/ids", (req, res) => {
  db.ref("products")
    .once("value")
    .then((snapshot) => {
      const products = snapshot.val() || {};

      const availableProductIds = Object.entries(products)
        .filter(([id, product]) => product.sold === false)
        .map(([id]) => id); // On ne retourne que les IDs

      res.json({
        success: true,
        availableProductIds,
        count: availableProductIds.length,
      });
    })
    .catch((error) => {
      console.error("Erreur:", error);
      res.status(500).json({
        success: false,
        error: "Erreur serveur",
      });
    });
});

// Nouvelle route pour le revenu
app.get("/products/revenue", (req, res) => {
  db.ref("products")
    .once("value")
    .then((snapshot) => {
      const products = snapshot.val() || {};
      let totalRevenue = 0;
      let soldCount = 0;

      Object.keys(products).forEach((key) => {
        if (products[key].sold === true && products[key].price) {
          totalRevenue += parseFloat(products[key].price) || 0;
          soldCount++;
        }
      });

      res.json({
        success: true,
        totalRevenue,
        estimatedOrders: soldCount * 4500,
      });
    })
    .catch((error) => {
      console.error("Erreur:", error);
      res.status(500).json({
        success: false,
        error: "Erreur serveur",
      });
    });
});

// Route pour activer un produit
app.put("/products/:id/sold", (req, res) => {
  const productId = req.params.id;

  db.ref(`products/${productId}`)
    .update({ sold: true })
    .then(() => {
      res.json({
        success: true,
        message: "Produit activé avec succès",
      });
    })
    .catch((error) => {
      console.error("Erreur lors de l'activation:", error);
      res.status(500).json({
        success: false,
        error: "Échec de l'activation du produit",
      });
    });
});

// Route pour les produits disponibles
app.get("/products/available", (req, res) => {
  db.ref("products")
    .once("value")
    .then((snapshot) => {
      const products = snapshot.val() || {};

      const availableProducts = Object.entries(products)
        .filter(([id, product]) => product.sold === false)
        .map(([id, product]) => ({ id, ...product }));

      res.json({
        success: true,
        availableProducts,
      });
    })
    .catch((error) => {
      console.error("Erreur:", error);
      res.status(500).json({
        success: false,
        error: "Erreur serveur",
      });
    });
});

// Route pour créer un produit
app.post("/products", (req, res) => {
  const { name, price } = req.body;

  if (!name || !price) {
    return res.status(400).json({
      success: false,
      message: "Le nom et le prix sont requis",
    });
  }

  const newProductRef = db.ref("products").push();
  const newProduct = {
    name,
    price: parseFloat(price),
    sold: false, // Par défaut, le produit n'est pas encore vendu
    createdAt: Date.now(),
  };

  newProductRef
    .set(newProduct)
    .then(() => {
      res.status(201).json({
        success: true,
        message: "Produit créé avec succès",
        id: newProductRef.key,
        product: newProduct,
      });
    })
    .catch((error) => {
      console.error("Erreur lors de la création du produit:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la création du produit",
      });
    });
});


// Route racine avec documentation
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API SmartFarm Shop",
    endpoints: {
      products_sold: "/products/sold/count",
      revenue: "/products/revenue",
      activate_product: {
        path: "/products/:id/activate",
        method: "PUT",
        description: "Active un produit en mettant activated à true",
      },
      available_products: "/products/available",
      send_message: {
        path: "/message",
        method: "POST",
        example_body: { nom: "string", type: "string" },
      },
    },
  });
});

// Gestion des erreurs
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route non trouvée" });
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur en écoute sur http://localhost:${PORT}`);
});
