# 🍰 Po_Tiramisu — Plateforme E-Commerce

Plateforme e-commerce complète pour la vente de **tiramisus artisanaux tunisiens**.

## 🚀 Stack Technique

| Couche | Technologie |
|--------|------------|
| **Frontend** | Next.js 15 + React 19 + TypeScript + TailwindCSS |
| **Backend** | FastAPI (Python 3.11) + SQLAlchemy |
| **Base de données** | PostgreSQL 15 |
| **Cache** | Redis 7 |
| **Paiement** | Flouci + Paymee |
| **Déploiement** | Docker Compose + Nginx |

---

## 🏗️ Démarrage Rapide

### Prérequis
- Docker & Docker Compose
- Node.js 20+ (pour le dev local)
- Python 3.11+ (pour le dev local)

### Avec Docker (Recommandé)

```bash
# Cloner le projet
git clone <repo-url>
cd po-tiramisu

# Lancer tous les services
docker-compose up -d

# Accès
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
# Admin: http://localhost:3000/admin
```

### En développement local

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python main.py

# Frontend (dans un autre terminal)
cd frontend
npm install
npm run dev
```

---

## 📋 Comptes de Démonstration

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| **Admin** | admin@po-tiramisu.tn | admin123 |
| **Client** | demo@po-tiramisu.tn | demo123 |

---

## 📁 Structure du Projet

```
po-tiramisu/
├── frontend/                    # Next.js 15 App
│   ├── src/
│   │   ├── app/                 # Pages (App Router)
│   │   │   ├── page.tsx         # Accueil
│   │   │   ├── products/        # Catalogue
│   │   │   ├── cart/            # Panier
│   │   │   ├── checkout/        # Paiement
│   │   │   ├── orders/          # Commandes
│   │   │   ├── login/           # Auth
│   │   │   ├── register/        # Inscription
│   │   │   ├── account/         # Profil
│   │   │   └── admin/           # Dashboard admin
│   │   ├── components/          # Composants React
│   │   ├── lib/                 # API client, store, utils
│   │   └── types/               # TypeScript types
│   └── Dockerfile
│
├── backend/                     # FastAPI Application
│   ├── app/
│   │   ├── main.py              # Point d'entrée
│   │   ├── models/              # SQLAlchemy models
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── routes/              # API endpoints
│   │   ├── crud/                # Opérations DB
│   │   ├── security.py          # JWT & auth
│   │   ├── config.py            # Configuration
│   │   ├── database.py          # Connexion DB
│   │   └── seeds.py             # Données initiales
│   ├── Dockerfile
│   └── requirements.txt
│
├── docker-compose.yml
├── nginx.conf
└── README.md
```

---

## 🔌 API Endpoints

### Auth
- `POST /api/auth/register` — Inscription
- `POST /api/auth/login` — Connexion
- `POST /api/auth/refresh` — Rafraîchir le token
- `GET /api/auth/me` — Profil utilisateur

### Produits
- `GET /api/products` — Liste des produits
- `GET /api/products/{slug}` — Détail produit
- `GET /api/products/categories` — Catégories

### Panier
- `GET /api/cart` — Voir le panier
- `POST /api/cart/add` — Ajouter un produit
- `PUT /api/cart/update` — Modifier quantité
- `DELETE /api/cart/remove/{id}` — Supprimer
- `POST /api/cart/apply-promo` — Appliquer code promo

### Commandes
- `POST /api/orders` — Créer une commande
- `GET /api/orders` — Liste des commandes
- `GET /api/orders/{id}` — Détail commande
- `PATCH /api/orders/{id}/cancel` — Annuler

### Paiements
- `POST /api/payments/flouci/init` — Initier paiement Flouci
- `POST /api/payments/demo-complete/{id}` — Simuler paiement (dev)

### Admin
- `GET /api/admin/dashboard` — Statistiques
- `GET /api/admin/orders` — Gestion commandes
- `PATCH /api/admin/orders/{id}/status` — Changer statut
- `GET /api/admin/products` — Gestion produits
- `POST /api/admin/products` — Créer produit
- `PUT /api/admin/products/{id}` — Modifier produit
- `DELETE /api/admin/products/{id}` — Supprimer produit
- `GET /api/admin/inventory` — Inventaire

---

## 💳 Paiement

### Flouci
1. Créer un compte sur [flouci.com](https://flouci.com)
2. Obtenir `FLOUCI_API_KEY` et `FLOUCI_MERCHANT_ID`
3. Configurer dans le `.env`

### Mode démo
En développement, utilisez le bouton "Simuler paiement" pour tester sans passer par Flouci.

---

## 🚢 Déploiement Production

### Variables d'environnement (backend `.env`)
```bash
DATABASE_URL=postgresql://user:pass@host:5432/po_tiramisu
SECRET_KEY=<changer-ceci-en-production>
FLOUCI_API_KEY=<votre_cle>
FLOUCI_MERCHANT_ID=<votre_merchant_id>
ENVIRONMENT=production
```

### Docker
```bash
docker-compose -f docker-compose.yml up -d --build
```

---

## 📊 Fonctionnalités

### Client
- ✅ Catalogue produits avec filtres et recherche
- ✅ Panier avec gestion quantités
- ✅ Codes promo
- ✅ Checkout multi-étapes
- ✅ Paiement Flouci/Paymee
- ✅ Suivi des commandes
- ✅ Gestion du profil et adresses
- ✅ Avis et notes produits

### Admin
- ✅ Dashboard avec KPIs
- ✅ Gestion des commandes (statuts)
- ✅ CRUD produits
- ✅ Gestion de l'inventaire
- ✅ Liste des clients

### Technique
- ✅ Auth JWT sécurisée
- ✅ API REST documentée (Swagger)
- ✅ Responsive design (mobile-first)
- ✅ Docker Compose pour développement
- ✅ CI/CD GitHub Actions
- ✅ Seed data pour démo

---

**Fait avec ❤️ en Tunisie** 🇹🇳
