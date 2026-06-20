# 🍰 Po Tiramisu — Plateforme E-Commerce

Plateforme e-commerce complète pour la vente de **tiramisus artisanaux tunisiens** — web responsive + application mobile.

[![CI/CD](https://github.com/HiTechTN/po-tiramisu/actions/workflows/ci.yml/badge.svg)](https://github.com/HiTechTN/po-tiramisu/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/HiTechTN/po-tiramisu/releases/tag/v1.0.0)

---

## 📸 Aperçu

| Page d'accueil | Catalogue | Panier | Mobile App |
|:---:|:---:|:---:|:---:|
| 🏠 Hero + Produits phares | 🔍 Filtres + Recherche | 🛒 Quantités + Promo | 📱 Expo React Native |

---

## 🚀 Stack Technique

| Couche | Technologie | Version |
|--------|------------|---------|
| **Frontend Web** | Next.js + React + TypeScript + TailwindCSS | 15 / 19 |
| **Application Mobile** | React Native + Expo + TypeScript | 0.85 / 56 |
| **Backend API** | FastAPI + SQLAlchemy + Pydantic | 0.115 |
| **Base de données** | PostgreSQL | 15 |
| **Cache** | Redis | 7 |
| **Authentification** | JWT (bcrypt + PyJWT) | — |
| **Paiement** | Flouci + Paymee (Tunisie) | — |
| **Conteneurs** | Docker + Docker Compose | 28+ |
| **CI/CD** | GitHub Actions | — |
| **Proxy** | Nginx | Alpine |

---

## 📁 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                             │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Web (Next.js)│  │ Mobile (Expo)│  │ Admin Dashboard  │  │
│  │  Port: 80*    │  │  Android/iOS │  │ (via web)        │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                 │                    │             │
└─────────┼─────────────────┼────────────────────┼─────────────┘
          │         REST API (JSON)              │
          └─────────────────┼────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────┐
│                    API GATEWAY                              │
│                    Nginx (Port 80)                          │
│              ┌───────────┴───────────┐                      │
│              │ /api/* → Backend:8000 │                      │
│              │ /*     → Frontend:3000│                      │
│              │ *Production: Nginx expose tout sur port 80  │
└──────────────┼───────────────────────┼──────────────────────┘
               │                       │
┌──────────────▼───────────────────────▼──────────────────────┐
│                   BACKEND (FastAPI)                          │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│  │ Auth     │ │ Products │ │ Orders   │ │ Admin         │  │
│  │ JWT/Bcrypt│ │ Catalog  │ │ Cart     │ │ Dashboard     │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│  │ Payments │ │ Reviews  │ │ Delivery │ │ Users/Address │  │
│  │ Flouci   │ │ Ratings  │ │ Tracking │ │ Profile       │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────────┘  │
└───────────────┬────────────────────────────┬────────────────┘
                │ SQL                       │ Cache
┌───────────────▼──────────┐  ┌─────────────▼──────────────┐
│   PostgreSQL 15          │  │   Redis 7                  │
│   (Données persistantes) │  │   (Sessions + Cache)       │
└──────────────────────────┘  └────────────────────────────┘
```

### Structure du projet

```
po-tiramisu/
├── frontend/                         # 🌐 Application Web (Next.js 15)
│   ├── src/
│   │   ├── app/                      # Pages (App Router)
│   │   │   ├── page.tsx              # Accueil
│   │   │   ├── products/             # Catalogue + détail
│   │   │   ├── cart/                 # Panier
│   │   │   ├── checkout/             # Paiement
│   │   │   ├── orders/               # Commandes
│   │   │   ├── login/                # Connexion
│   │   │   ├── register/             # Inscription
│   │   │   ├── account/              # Profil
│   │   │   └── admin/                # Dashboard admin
│   │   ├── components/               # Composants React réutilisables
│   │   ├── lib/                      # API client, store, utils
│   │   └── types/                    # Types TypeScript
│   ├── public/                       # Assets statiques (favicon)
│   ├── .eslintrc.json               # Config ESLint (CI-friendly)
│   ├── next.config.ts               # Config Next.js (standalone)
│   ├── next.config.export.ts        # Config export statique (CI)
│   ├── Dockerfile                    # Build multi-stage
│   └── package.json
│
├── mobile/                           # 📱 Application Mobile (Expo)
│   ├── App.tsx                       # Navigation + auth flow
│   ├── src/
│   │   ├── api.ts                    # Client API (axios + interceptors JWT)
│   │   ├── store.ts                  # Zustand (auth + panier)
│   │   ├── utils.ts                  # Formatage prix, dates, statuts
│   │   └── screens/                  # 8 écrans complets
│   │       ├── HomeScreen.tsx        # Catalogue + filtres catégories
│   │       ├── ProductDetailScreen.tsx # Détail + ajout panier
│   │       ├── CartScreen.tsx        # Panier + code promo
│   │       ├── CheckoutScreen.tsx    # Paiement Flouci / livraison
│   │       ├── OrdersScreen.tsx      # Historique commandes
│   │       ├── ProfileScreen.tsx     # Profil + actions
│   │       ├── LoginScreen.tsx       # Connexion
│   │       └── RegisterScreen.tsx    # Inscription
│   ├── scripts/                      # Génération d'assets (sharp)
│   │   └── generate-assets.js        # Génère tous les icons/splash
│   ├── assets/                       # Icons + splash screen
│   ├── babel.config.js               # Babel + reanimated plugin
│   ├── app.json                      # Config Expo
│   └── package.json
│
├── backend/                          # ⚙️ API Backend (FastAPI)
│   ├── app/
│   │   ├── main.py                   # Point d'entrée + routers
│   │   ├── config.py                 # Pydantic Settings
│   │   ├── database.py               # SQLAlchemy engine
│   │   ├── security.py               # JWT + bcrypt
│   │   ├── state.py                  # État partagé (_user_carts)
│   │   ├── seeds.py                  # Données de démonstration
│   │   ├── models/                   # SQLAlchemy ORM models
│   │   ├── schemas/                  # Pydantic schemas (validation)
│   │   ├── routes/                   # API endpoints (9 routers)
│   │   ├── crud/                     # Opérations base de données
│   │   └── utils/                    # Helpers
│   ├── tests/                        # Tests pytest (26+ tests)
│   │   ├── conftest.py               # Fixtures + SQLite in-memory
│   │   └── test_cart.py              # Tests panier
│   ├── Dockerfile                    # Build multi-stage
│   └── requirements.txt
│
├── .github/workflows/
│   └── ci.yml                        # CI/CD complet (test → build → release)
│
├── docker-compose.yml                # Développement local
├── docker-compose.prod.yml           # Production
├── nginx.conf                        # Reverse proxy
├── Makefile                          # Commandes build/dev/release
└── README.md                         # ← Ce fichier
```

---

## 🏗️ Démarrage Rapide

### Prérequis

- **Docker** & Docker Compose v2+ (recommandé)
- Node.js 20+ (dev local frontend)
- Python 3.11+ (dev local backend)
- PostgreSQL 15+ (si dev local sans Docker)

### Option 1 : Docker (Recommandé) ⭐

```bash
# 1. Cloner le projet
git clone https://github.com/HiTechTN/po-tiramisu.git
cd po-tiramisu

# 2. Lancer tous les services
make dev
# ou directement :
docker compose up --build -d

# 3. Accéder au projet
#    🌐 Frontend:  http://localhost:3000
#    ⚙️  Backend:   http://localhost:8000
#    📖 API Docs:  http://localhost:8000/docs
#    🔧 Admin:     http://localhost:3000/admin
```

### Option 3 : Production

```bash
# Configurer les secrets GitHub Actions (pour CI/CD automatique) :
gh secret set SECRET_KEY --body "votre-cle-secrete"
gh secret set POSTGRES_PASSWORD --body "votre-mot-de-passe-pg"
gh secret set FLOUCI_API_KEY --body "votre-api-key"
gh secret set FLOUCI_MERCHANT_ID --body "votre-merchant-id"

# Déclencher une release :
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
# → Le pipeline CI/CD build les images Docker, APK, et crée la release GitHub

# Ou lancer manuellement :
make prod
# ou :
docker compose -f docker-compose.prod.yml up --build -d

# Accès via Nginx sur http://localhost
```

### Option 2 : Développement Local

```bash
# ── Backend ──────────────────────────────────────
cd backend
python -m venv venv
source venv/bin/activate        # Linux/Mac
# .\venv\Scripts\activate       # Windows
pip install -r requirements.txt
cp .env.example .env            # Configurer les variables
python main.py                  # → http://localhost:8000

# ── Frontend (autre terminal) ────────────────────
cd frontend
npm install
npm run dev                     # → http://localhost:3000

# ── Mobile (autre terminal) ──────────────────────
cd mobile
npm install
npx expo start                  # → Scan QR code
```

---

## 📋 Comptes de Démonstration

| Rôle | Email | Mot de passe | Accès |
|------|-------|-------------|-------|
| **Admin** | `admin@po-tiramisu.tn` | `admin123` | Dashboard, gestion produits/commandes |
| **Client** | `demo@po-tiramisu.tn` | `demo123` | Catalogue, panier, commandes |

---

## 🔌 API REST — Documentation Complète

> 📖 **Swagger UI** disponible sur `http://localhost:8000/docs`
> 📖 **ReDoc** disponible sur `http://localhost:8000/redoc`

### Authentification

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `POST` | `/api/auth/register` | Inscription | — |
| `POST` | `/api/auth/login` | Connexion (JWT) | — |
| `POST` | `/api/auth/refresh` | Rafraîchir le token | Refresh Token |
| `GET` | `/api/auth/me` | Profil utilisateur | Bearer |

**Exemple — Connexion :**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@po-tiramisu.tn", "password": "demo123"}'
```

**Réponse :**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

### Produits

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `GET` | `/api/products` | Liste (filtres, pagination, tri) | — |
| `GET` | `/api/products/{id_or_slug}` | Détail produit | — |
| `GET` | `/api/products/categories` | Liste des catégories | — |
| `GET` | `/api/products/{id}/reviews` | Avis d'un produit | — |
| `POST` | `/api/products/{id}/reviews` | Ajouter un avis | Bearer |

**Paramètres de recherche :**
```
GET /api/products?category=tiramisu&search=chocolate&sort=price_dt&order=asc&limit=20&skip=0
```

### Panier 🛒

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `GET` | `/api/cart` | Voir le panier | Bearer |
| `POST` | `/api/cart/add` | Ajouter un produit | Bearer |
| `PUT` | `/api/cart/update?product_id=X&quantity=Y` | Modifier quantité | Bearer |
| `DELETE` | `/api/cart/remove/{product_id}` | Supprimer un article | Bearer |
| `DELETE` | `/api/cart/clear` | Vider le panier | Bearer |
| `POST` | `/api/cart/apply-promo` | Appliquer code promo | Bearer |

**Ajouter au panier :**
```bash
curl -X POST http://localhost:8000/api/cart/add \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"product_id": 1, "quantity": 2}'
```

### Commandes

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `POST` | `/api/orders` | Créer une commande | Bearer |
| `GET` | `/api/orders` | Liste des commandes | Bearer |
| `GET` | `/api/orders/{id}` | Détail commande | Bearer |
| `PATCH` | `/api/orders/{id}/cancel` | Annuler | Bearer |

### Paiements

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `POST` | `/api/payments/flouci/init` | Initier paiement Flouci | Bearer |
| `POST` | `/api/payments/demo-complete/{id}` | Simuler paiement (dev) | Bearer |
| `GET` | `/api/payments/{order_id}/status` | Statut paiement | Bearer |

### Utilisateurs & Adresses

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `GET` | `/api/users/me` | Mon profil | Bearer |
| `PUT` | `/api/users/me` | Modifier profil | Bearer |
| `GET` | `/api/addresses` | Mes adresses | Bearer |
| `POST` | `/api/addresses` | Ajouter adresse | Bearer |
| `PUT` | `/api/addresses/{id}` | Modifier adresse | Bearer |
| `DELETE` | `/api/addresses/{id}` | Supprimer adresse | Bearer |

### Livraisons

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `GET` | `/api/deliveries/{id}/track` | Suivi livraison | Bearer |

### Admin 🔧

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `GET` | `/api/admin/dashboard` | Statistiques KPI | Admin |
| `GET` | `/api/admin/orders` | Gestion commandes | Admin |
| `PATCH` | `/api/admin/orders/{id}/status` | Changer statut | Admin |
| `GET` | `/api/admin/products` | Gestion produits | Admin |
| `POST` | `/api/admin/products` | Créer produit | Admin |
| `PUT` | `/api/admin/products/{id}` | Modifier produit | Admin |
| `DELETE` | `/api/admin/products/{id}` | Supprimer produit | Admin |
| `GET` | `/api/admin/inventory` | Inventaire | Admin |
| `POST` | `/api/admin/inventory/adjust` | Ajuster stock | Admin |

---

## 📱 Application Mobile

L'application mobile **React Native (Expo)** offre une expérience native sur Android et iOS.

### Fonctionnalités

- 🔐 **Authentification** — Inscription/connexion avec JWT automatique
- 🏠 **Catalogue** — Produits avec filtres par catégorie
- 📦 **Détail produit** — Description, stock, quantité, ajout panier
- 🛒 **Panier** — Gestion quantités, code promo, total
- 💳 **Checkout** — Paiement Flouci ou à la livraison
- 📋 **Commandes** — Historique avec statuts colorés
- 👤 **Profil** — Informations, adresses, déconnexion
- 🔄 **Token refresh** — Gestion automatique du rafraîchissement JWT

### Lancer l'app mobile

```bash
cd mobile
npm install
npx expo start          # Scanner le QR code avec Expo Go
npx expo start --android  # Lancer directement sur Android
npx expo start --ios      # Lancer sur iOS (macOS requis)
```

### Architecture mobile

```
mobile/
├── App.tsx                 # Navigation (Stack + Tabs)
├── src/
│   ├── api.ts              # Client API (axios + interceptors)
│   │                       #   → Auto-refresh JWT
│   │                       #   → Auto-attach Bearer token
│   ├── store.ts            # Zustand (auth + panier)
│   ├── utils.ts            # formatPrice, formatDate, statusColors
│   └── screens/
│       ├── LoginScreen.tsx          # 📧 Email + mot de passe
│       ├── RegisterScreen.tsx       # 📝 Formulaire complet
│       ├── HomeScreen.tsx           # 🏠 Catalogue + filtres
│       ├── ProductDetailScreen.tsx   # 📦 Détail + quantité
│       ├── CartScreen.tsx           # 🛒 Panier + promo
│       ├── CheckoutScreen.tsx       # 💳 Paiement
│       ├── OrdersScreen.tsx         # 📋 Historique
│       └── ProfileScreen.tsx        # 👤 Profil
```

---

## 🛠️ Commandes Makefile

```bash
make help              # Afficher toutes les commandes

# ── Développement ───────────────────────────────
make dev               # Lancer tous les services (Docker)
make dev-down          # Arrêter les services
make dev-logs          # Voir les logs
make dev-backend       # Lancer backend + DB uniquement
make dev-frontend      # Lancer frontend en dev

# ── Builds Docker ───────────────────────────────
make docker-build      # Build toutes les images
make docker-build-backend   # Build image backend
make docker-build-frontend  # Build image frontend
make docker-push       # Push images sur le registry

# ── Production ──────────────────────────────────
make build             # Build complet (backend + frontend)
make prod              # Lancer la stack production
make prod-down         # Arrêter la production
make prod-logs         # Voir logs production

# ── Mobile ──────────────────────────────────────
make mobile-install    # Installer deps Expo
make mobile-start      # Lancer Expo dev server
make mobile-build-android  # Build APK Android

# ── Tests ───────────────────────────────────────
make test              # Lancer tous les tests
make test-backend      # Tests backend (pytest)
make test-frontend     # Lint frontend
make lint              # Lint tout

# ── Release ─────────────────────────────────────
make release           # Build + tag + GitHub release

# ── Utilitaires ─────────────────────────────────
make clean             # Nettoyer les artefacts build
make db-reset          # Reset base de données
```

---

## 🧪 Tests

### Tests Backend (26+ tests)

```bash
cd backend
python -m pytest tests/ -v --tb=short
```

**Couverture des tests :**
- ✅ GET /api/cart — Panier vide, panier avec articles
- ✅ POST /api/cart/add — Ajout normal, quantité par défaut, doublon
- ✅ PUT /api/cart/update — Modification quantité, suppression (qty < 1)
- ✅ DELETE /api/cart/remove — Suppression article, article inexistant
- ✅ DELETE /api/cart/clear — Vider panier
- ✅ POST /api/cart/apply-promo — Code valide, invalide, expiré
- ✅ Auth — Requêtes non authentifiées (401)

**Infrastructure de test :**
- SQLite in-memory avec `StaticPool` pour isolation
- Fixture `autouse` pour nettoyage `_user_carts` entre tests
- Override `get_current_user` pour bypasser JWT en test
- Fixtures pour user, admin, produits, adresses, promos

---

## 💳 Intégration Paiement

### Flouci (Paiement en ligne)

```bash
# 1. Créer un compte sur https://flouci.com
# 2. Configurer les variables d'environnement :
FLOUCI_API_KEY=votre_api_key
FLOUCI_MERCHANT_ID=votre_merchant_id
FLOUCI_API_URL=https://api.flouci.com
```

**Flux :**
1. Client clique "Payer" → Backend crée une session Flouci
2. Redirection vers la page de paiement Flouci
3. Client entre ses coordonnées bancaires
4. Flouci envoie un webhook au backend
5. Backend confirme la commande et notifie le client

### Paymee (Alternatif)

```bash
PAYMEE_API_KEY=votre_api_key
PAYMEE_API_URL=https://api.paymee.com
```

### Mode Démo

En développement, utilisez `POST /api/payments/demo-complete/{order_id}` pour simuler un paiement réussi sans passer par un provider externe.

---

## 🐳 Docker

### Images Docker

| Image | Description | Port |
|-------|-------------|------|
| `po-tiramisu-frontend` | Next.js (standalone) | 3000 |
| `po-tiramisu-backend` | FastAPI (uvicorn) | 8000 |
| `postgres:15-alpine` | Base de données | 5432 |
| `redis:7-alpine` | Cache | 6379 |
| `nginx:alpine` | Reverse proxy | 80 |

### Dockerfile Backend (Multi-stage)

```dockerfile
# Builder stage — installe les dépendances
FROM python:3.11-slim AS builder
COPY requirements.txt .
RUN pip install --prefix=/install -r requirements.txt

# Runtime stage — image minimaliste
FROM python:3.11-slim
COPY --from=builder /install /usr/local
COPY . .
HEALTHCHECK CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/health')"
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
```

### Dockerfile Frontend (Multi-stage)

```dockerfile
# Deps → Builder → Runner (isolation utilisateur)
FROM node:20-alpine AS runner
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/.next/standalone ./
USER nextjs
HEALTHCHECK CMD wget --spider http://localhost:3000/
CMD ["node", "server.js"]
```

---

## 🚀 CI/CD — GitHub Actions

Le pipeline automatique effectue :

```
Push sur master/tag v*
        │
        ▼
┌───────────────┐     ┌──────────────┐
│ 1. TEST       │────▶│ 2. DOCKER    │
│ pytest + lint │     │ build & push │
└───────────────┘     └──────┬───────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
     ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
     │ 3. MOBILE    │ │ 4. WEB       │ │              │
     │ APK build    │ │ static export│ │              │
     └──────┬───────┘ └──────┬───────┘ │              │
            └────────────────┼─────────┘              │
                             ▼                        │
                    ┌──────────────┐                   │
                    │ 5. RELEASE   │◀──────────────────┘
                    │ GitHub Release│
                    │ (APK + ZIP + │
                    │  Python wheel)│
                    └──────────────┘
```

**Étapes du pipeline :**

| Job | Trigger | Description |
|-----|---------|-------------|
| `test` | Tous les pushes | Backend pytest + Frontend lint/build |
| `docker-build` | Push sur master | Build + push images Docker (GHCR) |
| `mobile-build` | Tag `v*` | Build APK Android avec Expo + Gradle |
| `web-export` | Tag `v*` | Export statique pour CDN |
| `deploy` | Tag `v*` | Déploiement SSH (optionnel) |
| `release` | Tag `v*` | Création GitHub Release avec tous les artifacts |

### Artifacts de la Release

Chaque release GitHub contient :
- **APK Android** — `po-tiramisu-android-v{version}.apk`
- **Export Web** — `po-tiramisu-web-v{version}.zip`
- **Python Wheel** — `backend/dist/*.whl`
- **Docker Images** — sur GitHub Container Registry (GHCR)

### Créer une release

```bash
# Le Makefile gère tout automatiquement :
make release

# Ou manuellement :
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
# → Le pipeline CI/CD se déclenche automatiquement
```

### Configuration des Secrets GitHub

```bash
# Secrets requis pour le CI/CD :
gh secret set SECRET_KEY --body "$(openssl rand -hex 32)"
gh secret set POSTGRES_PASSWORD --body "$(openssl rand -base64 24)"
gh secret set FLOUCI_API_KEY --body "votre_api_key"
gh secret set FLOUCI_MERCHANT_ID --body "votre_merchant_id"

# Secrets optionnels (déploiement SSH) :
gh secret set DEPLOY_HOST --body "votre-serveur.com"
gh secret set DEPLOY_USER --body "root"
gh secret set DEPLOY_SSH_KEY --body "$(cat ~/.ssh/id_rsa)"
```

### Générer les Assets Mobiles

```bash
# Installer sharp (requis pour la génération d'images)
cd mobile && npm install --no-save sharp

# Générer tous les assets (splash, icons, favicon)
node scripts/generate-assets.js

# Résultat :
#   assets/splash.png              → 1284x2778 (splash screen)
#   assets/icon.png                → 1024x1024 (app icon)
#   assets/favicon.png             → 48x48 (favicon)
#   assets/android-icon-*.png      → 512x512 (adaptive icons)
```

---

## ⚙️ Variables d'Environnement

### Backend (`backend/.env`)

```bash
# Base de données
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/po_tiramisu
REDIS_URL=redis://localhost:6379

# Sécurité
SECRET_KEY=your-super-secret-key-minimum-32-characters-long
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
REFRESH_TOKEN_EXPIRE_DAYS=30

# Paiement Flouci
FLOUCI_API_KEY=your_flouci_api_key
FLOUCI_MERCHANT_ID=your_merchant_id
FLOUCI_API_URL=https://api.flouci.com

# Paiement Paymee
PAYMEE_API_KEY=your_paymee_api_key
PAYMEE_API_URL=https://api.paymee.com

# Email (optionnel)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Sentry (optionnel)
SENTRY_DSN=

# Environnement
DEBUG=False
ENVIRONMENT=production
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env.local`)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=Po_Tiramisu
```

### Mobile (`mobile/.env`)

```bash
EXPO_PUBLIC_API_URL=http://localhost:8000
```

---

## 📊 Fonctionnalités

### Client 👤

| Fonctionnalité | Statut |
|---------------|--------|
| Catalogue produits avec filtres et recherche | ✅ |
| Détail produit avec avis | ✅ |
| Panier avec gestion quantités | ✅ |
| Codes promo | ✅ |
| Checkout multi-étapes | ✅ |
| Paiement Flouci / Paymee / Livraison | ✅ |
| Suivi des commandes en temps réel | ✅ |
| Gestion du profil et adresses | ✅ |
| Avis et notes produits | ✅ |
| Responsive design (mobile-first) | ✅ |

### Admin 🔧

| Fonctionnalité | Statut |
|---------------|--------|
| Dashboard avec KPIs | ✅ |
| Gestion des commandes (statuts) | ✅ |
| CRUD produits | ✅ |
| Gestion de l'inventaire | ✅ |
| Liste des clients | ✅ |
| Suivi des livraisons | ✅ |

### Technique ⚙️

| Fonctionnalité | Statut |
|---------------|--------|
| Auth JWT sécurisée (bcrypt) | ✅ |
| API REST documentée (Swagger) | ✅ |
| Docker Compose multi-services | ✅ |
| CI/CD GitHub Actions | ✅ |
| Tests automatisés (pytest, 26+ tests) | ✅ |
| Seed data pour démo | ✅ |
| Application mobile (React Native) | ✅ |
| Multi-stage Docker builds | ✅ |
| Healthchecks Docker | ✅ |
| Production docker-compose | ✅ |

---

## 🗺️ Feuille de Route

### Phase 1 — MVP ✅
- [x] Backend API (FastAPI)
- [x] Frontend Web (Next.js)
- [x] Application Mobile (Expo)
- [x] Auth JWT
- [x] Panier + Checkout
- [x] Paiement Flouci/Démo
- [x] Admin Dashboard
- [x] Docker + CI/CD

### Phase 2 — Améliorations
- [ ] Système de notifications (email + SMS)
- [ ] Suivi livraison GPS en temps réel
- [ ] Système de fidélité / points
- [ ] Analytics avancés (Google Analytics)
- [ ] Intégration Instagram API
- [ ] Tests end-to-end (Playwright)

### Phase 3 — Scale
- [ ] Application mobile publiée (App Store / Play Store)
- [ ] Multi-langue (FR/AR/EN)
- [ ] Système de recommandation
- [ ] Marketing automation
- [ ] Support client en direct

---

## 🤝 Contribution

```bash
# 1. Fork le projet
# 2. Créer une branche
git checkout -b feature/ma-feature

# 3. Modifier et tester
make test

# 4. Commit et push
git commit -m "feat: ajouter ma feature"
git push origin feature/ma-feature

# 5. Ouvrir une Pull Request
```

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 📞 Support

- **GitHub Issues** : https://github.com/HiTechTN/po-tiramisu/issues
- **API Docs** : http://localhost:8000/docs (après démarrage)
- **Email** : dev@hitechtn.tn

---

**Fait avec ❤️ en Tunisie** 🇹🇳
