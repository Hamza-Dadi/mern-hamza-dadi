require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dns = require('dns');

// Fix DNS pour résoudre les SRV MongoDB Atlas sur Windows
dns.setServers(['8.8.8.8', '1.1.1.1']);

const app = express();
const PORT = process.env.PORT || 3000;

// Modèle Mongoose
const Item = require('./models/Item');

// Middlewares
app.use(cors());
app.use(express.json());

// Connexion à MongoDB Atlas
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Atlas connecté avec succès');
    } catch (error) {
        console.error('Erreur de connexion MongoDB:', error.message);
        process.exit(1);
    }
};

connectDB();

// GET /api/health : renvoie un JSON confirmant que le serveur répond
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Le serveur répond correctement',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// GET /api/items : renvoie une liste JSON des éléments lus en base
app.get('/api/items', async (req, res) => {
    try {
        const items = await Item.find().sort({ createdAt: -1 });
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ error: error.message || 'Erreur lors de la lecture des éléments' });
    }
});

// POST /api/items : valide les champs reçus et crée un élément en base
app.post('/api/items', async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name || name.trim() === '') {
            return res.status(400).json({ error: 'Le champ name est obligatoire' });
        }
        const newItem = new Item({
            name: name.trim(),
            description: description ? description.trim() : ''
        });
        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (error) {
        res.status(400).json({ error: error.message || 'Erreur lors de la création de l\'élément' });
    }
});

// Démarrage du serveur
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Serveur démarré sur http://localhost:${PORT}`);
    });
}

module.exports = app;
