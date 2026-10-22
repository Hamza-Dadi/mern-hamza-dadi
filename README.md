# Application Full Stack MERN — Hamza Dadi

Projet réalisé dans le cadre de l'**Examen Pratique — Application Full Stack MERN**.

---

## 🎯 Objectif du projet

Créer et déployer une application MERN complète, fonctionnelle, versionnée avec Git/GitHub et configurée à l'aide de variables d'environnement. L'application permet la gestion d'éléments (items) stockés dans une base de données MongoDB Atlas avec une interface web dynamique (HTML/CSS/JS natif) et une architecture multi-backend (Vercel et Railway) dotée d'un basculement automatique (failover).

---

## 📋 Prérequis

- **Node.js** (v18 ou supérieur)
- **npm** (v9 ou supérieur)
- **Git**
- Compte **MongoDB Atlas**
- Compte **Vercel**
- Compte **Railway**

---

## 📁 Arborescence du projet

```text
mern-hamza-dadi/
├── backend/
│   ├── models/
│   │   └── Item.js         # Schéma et modèle Mongoose
│   ├── index.js            # Serveur Express, middlewares et routes API
│   ├── package.json        # Dépendances et scripts (start, hamza)
│   ├── .env                # Variables secrètes (exclu du versionnement)
│   └── .env.example        # Modèle de variables d'environnement
├── frontend/
│   ├── index.html          # Structure de l'interface utilisateur
│   ├── style.css           # Feuille de style responsive moderne
│   ├── config.js           # Configuration centralisée des backends
│   └── app.js              # Logique client, basculement automatique et gestion d'erreurs
├── vercel.json             # Configuration de déploiement et routage Vercel
├── cloudflare.json         # Configuration de déploiement Cloudflare
├── .gitignore              # Exclusion des fichiers sensibles et dépendances
└── README.md               # Documentation complète du projet
```

---

## ⚙️ Installation et démarrage local

### 1. Cloner le dépôt

```bash
git clone https://github.com/Hamza-Dadi/mern-hamza-dadi.git
cd mern-hamza-dadi
```

### 2. Configuration des variables d'environnement

Créer un fichier `.env` dans le dossier `backend/` en se basant sur `backend/.env.example` :

```env
MONGODB_URI=mongodb+srv://<utilisateur>:<mot_de_passe>@<cluster>/mern_db?retryWrites=true&w=majority
PORT=3000
```

### 3. Installation des dépendances

```bash
cd backend
npm install
```

### 4. Commandes de lancement

- **Démarrage en production (Node.js)** :
  ```bash
  npm start
  ```

- **Démarrage en développement (script personnalisé avec nodemon)** :
  ```bash
  npm run hamza
  ```

Le serveur sera accessible sur : **http://localhost:3000**

---

## 🔌 Routes API

| Méthode | Route | Description | Réponse |
|---|---|---|---|
| `GET` | `/api/health` | Vérifie l'état de santé du serveur et de MongoDB | `{ status: "ok", message: "...", database: "connected" }` |
| `GET` | `/api/items` | Récupère la liste de tous les éléments en base | `[ { _id, name, description, createdAt }, ... ]` |
| `POST` | `/api/items` | Valide et enregistre un nouvel élément | `{ _id, name, description, createdAt }` (HTTP 201) |

---

## 🌐 Déploiement

- **Frontend Cloudflare** : [https://mern-hamza-dadi.hamzadadi118.workers.dev/](https://mern-hamza-dadi.hamzadadi118.workers.dev/)
- **Frontend Vercel** : [https://mern-hamza-dadi-frontend.vercel.app/](https://mern-hamza-dadi-frontend.vercel.app/)
- **Backend Vercel (API & MongoDB)** : [https://mern-hamza-dadi-backend.vercel.app/api/health](https://mern-hamza-dadi-backend.vercel.app/api/health)
- **Backend Railway** : `https://<votre-domaine-railway>.up.railway.app/api/health`

---

## 🔄 Partie 8 — Bascule automatique entre les deux backends (Failover)

Le frontend implémente la fonction `fetchWithFailover` qui garantit la résilience de l'application :
1. **Délai maximal (Timeout)** : `AbortController` interrompt toute requête dépassant 4000 ms.
2. **Gestion fine des erreurs** : vérification stricte de `response.ok` (les statuts HTTP 4xx et 5xx déclenchent la bascule).
3. **Bascule vers le secours** : en cas d'échec sur le backend principal (Railway), la requête est immédiatement relancée sur le backend de secours (Vercel).

### Scénarios de test :
- **Test A (Railway disponible)** : La requête aboutit directement sur le backend principal Railway. Le badge affiche `Railway (Principal)`.
- **Test B (Railway indisponible ou URL erronée)** : La requête timeout ou échoue, le frontend bascule automatiquement sur Vercel. Le badge passe à `Vercel (Secours)`.
- **Test C (Deux backends indisponibles)** : L'application capture l'erreur et affiche un message clair à l'utilisateur : *"Tous les backends sont inaccessibles"*.
- **Test D (Prévention des doublons lors des requêtes POST)** :
  - **Désactivation immédiate du bouton** : le formulaire est verrouillé (`isSubmitting = true`) dès le premier clic pour interdire les soumissions concurrentes.
  - **En-tête d'idempotence (`X-Idempotency-Key`)** : chaque requête génère un identifiant unique côté client afin d'éviter la création multiple en cas de rejeu réseau.

---

## 🔒 Sécurité et hygiène Git

- Aucun fichier `.env` ou secret n'est présent sur le dépôt GitHub.
- `.gitignore` exclut rigoureusement `node_modules/`, `.env`, `.env.*` tout en autorisant `.env.example`.
