require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Données de démonstration en mémoire (Partie 2)
let items = [
    { id: 1, name: 'Item 1', description: 'Premier élément de démonstration' },
    { id: 2, name: 'Item 2', description: 'Deuxième élément de démonstration' }
];

// GET /api/health : renvoie un JSON confirmant que le serveur répond
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Le serveur répond correctement',
        timestamp: new Date().toISOString()
    });
});

// GET /api/items : renvoie une liste JSON d'éléments de démonstration
app.get('/api/items', (req, res) => {
    try {
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des éléments' });
    }
});

// POST /api/items : valide les champs reçus et crée un élément
app.post('/api/items', (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name || name.trim() === '') {
            return res.status(400).json({ error: 'Le champ name est obligatoire' });
        }
        const newItem = {
            id: items.length ? items[items.length - 1].id + 1 : 1,
            name: name.trim(),
            description: description ? description.trim() : '',
            createdAt: new Date().toISOString()
        };
        items.push(newItem);
        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la création de l\'élément' });
    }
});

// Démarrage du serveur
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Serveur démarré sur http://localhost:${PORT}`);
    });
}

module.exports = app;
