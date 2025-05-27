const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Route de test
app.get('/', (req, res) => {
  res.send('Backend SmartFarm Shop opérationnel');
});

// Route de paiement simulé
app.post('/api/payment', (req, res) => {
  const { method } = req.body;
  res.json({
    success: true,
    paymentId: `${method}_${Date.now()}`,
    message: `Paiement ${method} simulé avec succès`
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur backend en cours d'exécution sur http://localhost:${PORT}`);
});