# 🏗️ Architecture — Po_Tiramisu

> Plateforme e-commerce de tiramisus artisanaux tunisiens.
> API REST · Next.js · React Native · PostgreSQL · Docker · GitHub Actions

---

## Table des matières

1. [Vue d'ensemble du système](#1-vue-densemble-du-système)
2. [Stack technique](#2-stack-technique)
3. [Modèle de données](#3-modèle-de-données)
4. [Architecture backend](#4-architecture-backend)
5. [Architecture frontend](#5-architecture-frontend)
6. [Architecture mobile](#6-architecture-mobile)
7. [Flux de données](#7-flux-de-données)
8. [Diagrammes de séquence](#8-diagrammes-de-séquence)
9. [Pipeline CI/CD](#9-pipeline-cicd)
10. [Sécurité](#10-sécurité)
11. [Configuration et environnements](#11-configuration-et-environnements)

---

## 1. Vue d'ensemble du système

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Po_Tiramisu                                     │
│                                                                              │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐                    │
│  │  🌐 Frontend  │   │  📱 Mobile    │   │  🔧 Admin    │                    │
│  │  (Next.js)   │   │  (Expo/RN)   │   │  (Next.js)   │                    │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘                    │
│         │                  │                  │                              │
│         └──────────────────┼──────────────────┘                             │
│                            │                                                 │
│                    ┌───────▼────────┐                                        │
│                    │  🔌 API REST    │                                        │
│                    │  (FastAPI)      │                                        │
│                    └───────┬────────┘                                        │
│                            │                                                 │
│              ┌─────────────┼─────────────┐                                  │
│              │             │             │                                   │
│       ┌──────▼──┐   ┌─────▼────┐  ┌────▼─────┐                            │
│       │ 🗄️ DB   │   │ 💳 Flouci │  │ 📦 Delivery│                           │
│       │ (PgSQL) │   │ / Paymee  │  │  Tracking │                            │
│       └─────────┘   └──────────┘  └──────────┘                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Flux global

```mermaid
flowchart LR
    subgraph Clients
        WEB[🌐 Web\nNext.js :3000]
        MOB[📱 Mobile\nExpo/React Native]
    end

    subgraph API["⚡ API Backend"]
        AUTH[🔐 Auth\nJWT]
        PROD[📦 Products]
        CART[🛒 Cart\nIn-Memory]
        ORD[📋 Orders]
        PAY[💳 Payments\nFlouci/Paymee]
        DEL[🚚 Deliveries]
        REV[⭐ Reviews]
        ADM[🔧 Admin]
    end

    subgraph Data["🗄️ Data Layer"]
        PG[(PostgreSQL)]
        REDIS[(Redis\nProduction)]
    end

    subgraph External["🌍 Services externes"]
        FLOUCI[Flouci API]
        PAYMEE[Paymee API]
    end

    WEB & MOB -->|HTTPS| AUTH
    AUTH --> PG
    PROD --> PG
    CART -->|state.py| CART
    ORD --> PG & CART
    PAY --> FLOUCI & PAYMEE
    DEL --> PG
    ADM --> PG
```

---

## 2. Stack technique

| Couche | Technologie | Version | Rôle |
|--------|------------|---------|------|
| **API** | FastAPI | 0.115+ | API REST async avec OpenAPI auto |
| **ORM** | SQLAlchemy | 2.0+ | Modèles, migrations, sessions |
| **DB** | PostgreSQL | 15+ | Base de données production |
| **DB Test** | SQLite | — | Tests unitaires in-memory |
| **Sécurité** | PyJWT + bcrypt | — | JWT access/refresh, hashing mots de passe |
| **Validation** | Pydantic v2 | — | Schémas de requête/réponse |
| **Frontend** | Next.js 14 | App Router | SSR/SSG, React Server Components |
| **UI** | Tailwind CSS | — | Styling utility-first |
| **Mobile** | Expo SDK 51 | React Native | App iOS/Android |
| **Paiements** | Flouci + Paymee | — | Passerelles paiement tunisiennes |
| **Conteneurs** | Docker | — | Build images backend/frontend |
| **CI/CD** | GitHub Actions | — | Tests, build, deploy, release |
| **Registry** | GitHub Container Registry | — | Images Docker versionnées |

---

## 3. Modèle de données

### Diagramme ER (Mermaid)

```mermaid
erDiagram
    USER ||--o{ ADDRESS : "possède"
    USER ||--o{ ORDER : "passe"
    USER ||--o{ REVIEW : "écrit"
    USER ||--o{ NOTIFICATION : "reçoit"
    USER ||--o{ DELIVERY : "livre"

    ORDER ||--|{ ORDER_ITEM : "contient"
    ORDER ||--o| DELIVERY : "a pour livraison"
    ORDER ||--o{ PAYMENT : "a pour paiement"
    ORDER }o--|| ADDRESS : "livré à"

    PRODUCT ||--o{ ORDER_ITEM : "commandé via"
    PRODUCT ||--o{ REVIEW : "évalué par"

    PROMO_CODE }o--o{ ORDER : "appliqué à"

    %% ── Tables ──

    USER {
        int id PK
        uuid uuid UK
        string email UK
        string phone
        string full_name
        string password_hash
        string avatar_url
        enum role "customer|admin|delivery"
        boolean is_active
        boolean email_verified
        datetime created_at
        datetime updated_at
        datetime last_login
    }

    ADDRESS {
        int id PK
        int user_id FK
        string label
        string street
        string city
        string postal_code
        string governorate
        string country "default: Tunisia"
        float latitude
        float longitude
        boolean is_default
    }

    PRODUCT {
        int id PK
        uuid uuid UK
        string name
        string slug UK
        text description
        float price_dt
        float cost_dt
        int quantity_available
        int quantity_reserved
        text image_url
        json images
        string category
        json tags
        boolean is_active
    }

    ORDER {
        int id PK
        uuid uuid UK
        int user_id FK
        enum status "pending|confirmed|preparing|ready|shipped|delivered|cancelled"
        enum payment_status "pending|completed|failed"
        float subtotal_dt
        float delivery_fee_dt
        float discount_dt
        float total_dt
        int delivery_address_id FK
        text delivery_notes
        enum payment_method "flouci|paymee|cash"
        string payment_ref
        datetime estimated_delivery
        datetime actual_delivery
    }

    ORDER_ITEM {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
        float unit_price_dt
        float total_price_dt
        json product_snapshot
    }

    PAYMENT {
        int id PK
        uuid uuid UK
        int order_id FK
        int user_id FK
        float amount_dt
        string currency "TND"
        enum provider "flouci|paymee"
        string provider_reference
        enum status "pending|completed|failed|refunded"
        json metadata
    }

    DELIVERY {
        int id PK
        uuid uuid UK
        int order_id FK
        int delivery_person_id FK
        enum status "pending|assigned|in_progress|delivered|failed"
        datetime pickup_time
        datetime delivery_time
        float current_latitude
        float current_longitude
        json location_history
        text notes
    }

    REVIEW {
        int id PK
        int user_id FK
        int product_id FK
        int order_id FK
        int rating
        string title
        text comment
        boolean is_verified
        int helpful_count
    }

    PROMO_CODE {
        int id PK
        string code UK
        int discount_percent
        float discount_fixed_dt
        datetime valid_from
        datetime valid_until
        int max_uses
        int uses_count
        float min_order_dt
        json applicable_products
        boolean is_active
    }

    NOTIFICATION {
        int id PK
        int user_id FK
        enum type "order|delivery|promotion|system"
        string title
        text message
        boolean is_read
        text action_url
    }
```

### Relations clés

| Relation | Type | Description |
|----------|------|-------------|
| `User → Address` | 1:N | Un utilisateur a plusieurs adresses |
| `User → Order` | 1:N | Un utilisateur passe plusieurs commandes |
| `Order → OrderItem` | 1:N | Une commande contient plusieurs produits |
| `Order → Payment` | 1:1 | Une commande a un paiement associé |
| `Order → Delivery` | 1:1 | Une commande a une livraison |
| `Product → Review` | 1:N | Un produit reçoit plusieurs avis |
| `User → Delivery` | 1:N | Un livreur livre plusieurs commandes |

---

## 4. Architecture backend

### Structure des fichiers

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # Point d'entrée FastAPI, CORS, middleware
│   ├── config.py             # Settings Pydantic (env vars)
│   ├── database.py           # Engine SQLAlchemy, SessionLocal
│   ├── security.py           # JWT, bcrypt, get_current_user
│   ├── seeds.py              # Données initiales (produits, admin)
│   ├── state.py              # État partagé in-memory (carts)
│   ├── models/               # Modèles SQLAlchemy
│   │   ├── user.py           # User, Address
│   │   ├── product.py        # Product, Review
│   │   ├── order.py          # Order, OrderItem
│   │   ├── payment.py        # Payment, PromoCode, Notification
│   │   └── delivery.py       # Delivery
│   ├── schemas/              # Schémas Pydantic (validation)
│   │   ├── user.py
│   │   ├── product.py
│   │   ├── order.py
│   │   ├── payment.py
│   │   └── notification.py
│   ├── crud/                 # Opérations DB (Create, Read, Update, Delete)
│   │   ├── user.py
│   │   ├── product.py
│   │   ├── order.py
│   │   ├── payment.py
│   │   └── delivery.py
│   └── routes/               # Endpoints API
│       ├── auth.py           # POST /register, /login, /refresh, GET /me
│       ├── products.py       # CRUD produits + reviews
│       ├── cart.py           # Panier (in-memory via state.py)
│       ├── orders.py         # Création, historique, annulation
│       ├── payments.py       # Flouci/Paymee intégration
│       ├── deliveries.py     # Suivi livraison, localisation
│       ├── reviews.py        # Avis globaux
│       ├── users.py          # Profil utilisateur
│       └── admin.py          # Dashboard, gestion commandes/produits/users
├── tests/                    # Tests pytest
├── Dockerfile                # Multi-stage build
├── requirements.txt
└── alembic/                  # Migrations (optionnel)
```

### Tableau des routes API

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `POST` | `/api/auth/register` | — | Inscription |
| `POST` | `/api/auth/login` | — | Connexion → JWT |
| `POST` | `/api/auth/refresh` | — | Rafraîchir access token |
| `GET` | `/api/auth/me` | ✅ | Profil utilisateur courant |
| `POST` | `/api/auth/logout` | ✅ | Déconnexion (stateless) |
| `GET` | `/api/products` | — | Liste produits (pagination, filtres, tri) |
| `GET` | `/api/products/{id_or_slug}` | — | Détail produit |
| `POST` | `/api/products` | 🔒 Admin | Créer produit |
| `PUT` | `/api/products/{id}` | 🔒 Admin | Modifier produit |
| `DELETE` | `/api/products/{id}` | 🔒 Admin | Supprimer produit |
| `GET` | `/api/products/categories` | — | Liste catégories |
| `GET` | `/api/products/{id}/reviews` | — | Avis d'un produit |
| `POST` | `/api/products/{id}/reviews` | ✅ | Poster un avis |
| `GET` | `/api/cart` | ✅ | Voir panier |
| `POST` | `/api/cart/add` | ✅ | Ajouter au panier |
| `PUT` | `/api/cart/update` | ✅ | Modifier quantité |
| `DELETE` | `/api/cart/remove/{product_id}` | ✅ | Retirer du panier |
| `DELETE` | `/api/cart/clear` | ✅ | Vider le panier |
| `POST` | `/api/cart/apply-promo` | ✅ | Appliquer code promo |
| `POST` | `/api/orders` | ✅ | Créer commande depuis panier |
| `GET` | `/api/orders` | ✅ | Historique commandes |
| `GET` | `/api/orders/{id}` | ✅ | Détail commande + livraison |
| `PATCH` | `/api/orders/{id}/cancel` | ✅ | Annuler commande |
| `POST` | `/api/payments/flouci/init` | ✅ | Initialiser paiement Flouci |
| `POST` | `/api/payments/flouci/callback` | — | Webhook Flouci |
| `POST` | `/api/payments/demo-complete/{id}` | ✅ | Simuler paiement (dev) |
| `GET` | `/api/payments/{id}/status` | ✅ | Statut paiement |
| `GET` | `/api/deliveries` | ✅ | Liste livraisons |
| `GET` | `/api/deliveries/{id}/track` | ✅ | Suivi livraison |
| `PATCH` | `/api/deliveries/{id}/assign` | ✅ | Assigner livreur |
| `PATCH` | `/api/deliveries/{id}/status` | ✅ | Mettre à jour statut |
| `POST` | `/api/deliveries/{id}/update-location` | ✅ | Mettre à jour position |
| `GET` | `/api/admin/dashboard` | 🔒 Admin | Statistiques |
| `GET` | `/api/admin/orders` | 🔒 Admin | Toutes les commandes |
| `PATCH` | `/api/admin/orders/{id}/status` | 🔒 Admin | Changer statut commande |
| `GET` | `/api/admin/products` | 🔒 Admin | Tous les produits |
| `POST` | `/api/admin/products` | 🔒 Admin | Créer produit |
| `PUT` | `/api/admin/products/{id}` | 🔒 Admin | Modifier produit |
| `DELETE` | `/api/admin/products/{id}` | 🔒 Admin | Supprimer produit |
| `GET` | `/api/admin/inventory` | 🔒 Admin | Inventaire |
| `POST` | `/api/admin/inventory/adjust` | 🔒 Admin | Ajuster stock |
| `GET` | `/api/admin/users` | 🔒 Admin | Tous les utilisateurs |
| `PATCH` | `/api/admin/users/{id}` | 🔒 Admin | Modifier utilisateur |

---

## 5. Architecture frontend

### Structure des fichiers

```
frontend/
├── src/
│   ├── app/                  # Next.js 14 App Router
│   │   ├── layout.tsx        # Layout racine (HTML, fonts)
│   │   ├── page.tsx          # Homepage (hero, featured products, CTA)
│   │   ├── globals.css       # Styles globaux + Tailwind
│   │   ├── products/
│   │   │   ├── page.tsx      # Catalogue produits
│   │   │   └── [slug]/
│   │   │       └── page.tsx  # Détail produit
│   │   ├── cart/
│   │   │   └── page.tsx      # Panier
│   │   ├── checkout/
│   │   │   └── page.tsx      # Paiement
│   │   ├── orders/
│   │   │   └── page.tsx      # Historique commandes
│   │   ├── account/
│   │   │   └── page.tsx      # Profil utilisateur
│   │   ├── admin/
│   │   │   └── page.tsx      # Dashboard admin
│   │   ├── login/
│   │   │   └── page.tsx      # Connexion
│   │   └── register/
│   │       └── page.tsx      # Inscription
│   ├── components/           # Composants React réutilisables
│   │   ├── Layout/           # Header, Footer, Sidebar
│   │   └── Products/         # ProductGrid, ProductCard
│   ├── lib/
│   │   └── api.ts            # Client API (axios/fetch)
│   └── types/
│       └── index.ts          # Types TypeScript
├── public/                   # Assets statiques (favicon, etc.)
├── next.config.ts            # Config Next.js (standalone)
├── next.config.export.ts     # Config export statique (CI)
├── Dockerfile                # Multi-stage build Docker
├── .eslintrc.json            # Règles ESLint (CI)
├── tailwind.config.ts        # Configuration Tailwind
└── tsconfig.json
```

### Composants clés

| Composant | Rôle |
|-----------|------|
| `Layout` | Shell global : header navigation, footer, sidebar |
| `ProductGrid` | Grille responsive de ProductCards |
| `ProductCard` | Carte produit avec image, prix, avis, bouton ajouter au panier |
| `api.ts` | Client HTTP centralisé avec gestion JWT automatique |

---

## 6. Architecture mobile

```
mobile/
├── app/                      # Expo Router (screens)
│   ├── (tabs)/               # Tab navigation
│   ├── _layout.tsx           # Layout racine
│   └── [id].tsx              # Détail produit
├── assets/                   # Images (splash, icons, adaptive icons)
│   ├── splash.png            # 1284×2778 (iPhone 14 Pro Max)
│   ├── icon.png              # 1024×1024 (app icon)
│   ├── favicon.png           # 48×48
│   ├── adaptive-icon.png     # 512×512 (Android)
│   └── monochrome.png        # 432×432 (Android 13+)
├── scripts/
│   └── generate-assets.js    # Génération d'assets via sharp
├── app.json                  # Configuration Expo
├── babel.config.js
├── Dockerfile                # Build APK via EAS/Docker
└── package.json
```

### Configuration Expo (app.json)

```json
{
  "expo": {
    "name": "Po_Tiramisu",
    "slug": "po-tiramisu",
    "version": "1.0.0",
    "scheme": "po-tiramisu",
    "platforms": ["ios", "android"],
    "splash": { "image": "./assets/splash.png", "resizeMode": "contain", "backgroundColor": "#8B4513" },
    "android": { "adaptiveIcon": { "foregroundImage": "./assets/adaptive-icon.png", "backgroundColor": "#8B4513" } },
    "ios": { "supportsTablet": true, "bundleIdentifier": "com.hitechtn.po-tiramisu" }
  }
}
```

---

## 7. Flux de données

### Flux d'authentification (JWT)

```mermaid
flowchart TD
    A[Client envoie credentials] -->|POST /api/auth/login| B[FastAPI route handler]
    B --> C{Utilisateur existe?}
    C -->|Non| D[401 Unauthorized]
    C -->|Oui| E{Mot de passe valide?}
    E -->|Non| D
    E -->|Oui| F[Générer access_token\n(expires: 24h)]
    F --> G[Générer refresh_token\n(expires: 30j)]
    G --> H[✅ Réponse: tokens + user info]

    I[Client utilise API] -->|Authorization: Bearer {access_token}| J[get_current_user middleware]
    J --> K{Token valide?}
    K -->|Non| L[401 - Token expired/invalid]
    K -->|Oui| M{Utilisateur actif?}
    M -->|Non| N[403 - Account disabled]
    M -->|Oui| O[✅ Request proceed avec user]

    P[Token expire] -->|POST /api/auth/refresh| Q[Décoder refresh_token]
    Q --> R{Type == refresh?}
    R -->|Non| L
    R -->|Oui| S[Générer nouveau access_token]
    S --> T[✅ Nouveau access_token]
```

### Flux du panier (In-Memory via state.py)

```mermaid
flowchart TD
    subgraph state["state.py — Mémoire partagée"]
        CARTS["_user_carts: dict[int, dict]\n{user_id: {items, promo_code, discount}}"]
    end

    A[Ajouter au panier] -->|POST /api/cart/add| B[get_user_cart user_id]
    B --> C{Déjà dans le panier?}
    C -->|Oui| D[Incrémenter quantité]
    C -->|Non| E[Ajouter nouvel item]
    D --> F[Recalculer totaux avec DB]
    E --> F
    F --> G[Retourner CartResponse]

    H[Créer commande] -->|POST /api/orders| I[Lire panier depuis state.py]
    I --> J{Panier vide?}
    J -->|Oui| K[400 - Cart is empty]
    J -->|Non| L[Vérifier stock DB pour chaque item]
    L --> M{Stock suffisant?}
    M -->|Non| N[400 - Insufficient stock]
    M -->|Oui| O[Créer Order + OrderItems dans DB]
    O --> P[Créer Payment record si non-cash]
    P --> Q[clear_user_cart user_id]
    Q --> R[✅ Order créée]
```

### Flux de paiement Flouci

```mermaid
flowchart TD
    A[Client clique Payer] -->|POST /api/payments/flouci/init| B[Créer Payment record\nstatus: pending]
    B --> C[POST Flouci API\namount, customer, order_id]
    C --> D{Réponse Flouci 201?}
    D -->|Oui| E[Retourner payment_url + session_id]
    D -->|Non| F[Fallback: URL démo\n/dev/orders/{id}?payment=demo]

    E --> G[Client redirigé vers\npage Flouci]
    G --> H[Client complete\npaiement sur Flouci]
    H --> I[Flouci envoie webhook\nPOST /api/payments/flouci/callback]
    I --> J{status == success?}
    J -->|Oui| K[complete_payment\nPayment: completed]
    J -->|Non| L[fail_payment\nPayment: failed]
    K --> M[update_order_payment_status\nOrder: confirmed]
    L --> N[update_order_payment_status\nOrder: failed]
```

### Flux de livraison

```mermaid
flowchart TD
    A[Admin met commande\nà "ready"] -->|PATCH /api/admin/orders/{id}/status| B[create_delivery\ndans DB]
    B --> C[Delivery status: pending]

    D[Admin assigne livreur] -->|PATCH /api/deliveries/{id}/assign| E[Delivery status: assigned]
    E --> F[Livreur prend en charge]

    F -->|PATCH /api/deliveries/{id}/status?status=in_progress| G[Delivery status: in_progress]

    G --> H[Livreur met à jour position] -->|POST /api/deliveries/{id}/update-location| I[Stocke lat/lng\n+ history JSON]
    I --> H

    H -->|PATCH /api/deliveries/{id}/status?status=delivered| J[Delivery status: delivered]
    J --> K[Commande status: delivered]

    L[Client suit livraison] -->|GET /api/deliveries/{id}/track| M[Retourne position actuelle\n+ history + livreur info]
```

---

## 8. Diagrammes de séquence

### Séquence : Inscription + Première commande

```mermaid
sequenceDiagram
    autonumber
    actor U as Utilisateur
    participant F as Frontend
    participant A as API FastAPI
    participant DB as PostgreSQL
    participant FL as Flouci

    Note over U,FL: ── Phase 1: Inscription ──

    U->>F: Remplit formulaire inscription
    F->>A: POST /api/auth/register {email, password, name}
    A->>DB: INSERT INTO users
    A-->>F: {access_token, refresh_token, user}
    F->>F: Stocke JWT dans localStorage

    Note over U,FL: ── Phase 2: Navigation ──

    U->>F: Parcourt catalogue produits
    F->>A: GET /api/products?limit=20
    A->>DB: SELECT * FROM products
    A-->>F: {items: [...], total}
    F-->>U: Affiche grille produits

    Note over U,FL: ── Phase 3: Panier ──

    U->>F: Ajoute tiramisu au panier
    F->>A: POST /api/cart/add {product_id, quantity}
    A->>DB: SELECT * FROM products WHERE id = ?
    A->>A: state.py: get_user_cart()
    A-->>F: CartResponse {items, total}

    Note over U,FL: ── Phase 4: Commande ──

    U->>F: Valide panier + choisit adresse
    F->>A: POST /api/orders {address_id, payment_method}
    A->>DB: SELECT product stock
    A->>DB: INSERT INTO orders + order_items
    A->>DB: UPDATE products SET quantity_available -= qty
    A->>A: state.py: clear_user_cart()
    A-->>F: OrderResponse {id, total, timeline}

    Note over U,FL: ── Phase 5: Paiement ──

    F->>A: POST /api/payments/flouci/init {order_id, amount}
    A->>DB: INSERT INTO payments (status: pending)
    A->>FL: POST /v1/payment {amount, customer}
    FL-->>A: {payment_url, session_id}
    A-->>F: PaymentInitResponse {payment_url}
    F->>U: Redirige vers Flouci
    U->>FL: Complete paiement
    FL->>A: POST /api/payments/flouci/callback {status: success}
    A->>DB: UPDATE payments SET status = 'completed'
    A->>DB: UPDATE orders SET status = 'confirmed'
```

### Séquence : Authentification + Rafraîchissement Token

```mermaid
sequenceDiagram
    autonumber
    actor U as Utilisateur
    participant F as Frontend
    participant A as API FastAPI
    participant DB as PostgreSQL

    U->>F: Saisit email + mot de passe
    F->>A: POST /api/auth/login {email, password}
    A->>DB: SELECT * FROM users WHERE email = ?
    A->>A: bcrypt.verify(password, hash)
    A->>A: create_access_token(sub=uuid, role, exp=24h)
    A->>A: create_refresh_token(sub=uuid, role, exp=30j)
    A-->>F: {access_token, refresh_token, user}
    F->>F: localStorage.setItem('token', access_token)
    F->>F: localStorage.setItem('refreshToken', refresh_token)

    Note over U,DB: ... 24 heures plus tard ...

    F->>A: GET /api/products (Authorization: Bearer expired_token)
    A->>A: jwt.decode() → ExpiredSignatureError
    A-->>F: 401 Unauthorized {detail: "Token has expired"}
    F->>A: POST /api/auth/refresh {refresh_token}
    A->>A: jwt.decode(refresh_token) → type == "refresh"
    A->>DB: SELECT * FROM users WHERE uuid = ?
    A->>A: create_access_token(sub=uuid, role)
    A-->>F: {access_token, token_type: "bearer"}
    F->>F: localStorage.setItem('token', new_access_token)
    F->>A: GET /api/products (retry avec nouveau token)
    A-->>F: 200 OK {items: [...]}
```

### Séquence : Suivi de livraison en temps réel

```mermaid
sequenceDiagram
    autonumber
    actor L as Livreur
    actor C as Client
    participant F as Frontend
    participant A as API FastAPI
    participant DB as PostgreSQL

    Note over L,DB: ── Livreur active la livraison ──

    L->>F: Ouvre l'app livreur
    F->>A: PATCH /api/deliveries/{id}/status?status=in_progress
    A->>DB: UPDATE deliveries SET status = 'in_progress'
    A-->>F: {success: true}

    loop Toutes les 30 secondes
        L->>F: GPS coords transmises
        F->>A: POST /api/deliveries/{id}/update-location {lat, lng}
        A->>DB: UPDATE deliveries SET current_lat=?, current_lng=?
        A->>A: Appends à location_history JSON
        A-->>F: {success: true}
    end

    Note over L,DB: ── Client suit en temps réel ──

    loop Polling toutes les 10 secondes
        C->>F: Page suivi livraison
        F->>A: GET /api/deliveries/{id}/track
        A->>DB: SELECT delivery + delivery_person
        A-->>F: {status, current_location, history, estimated_delivery}
        F-->>C: Affiche carte avec position
    end

    Note over L,DB: ── Livreur confirme livraison ──

    L->>F: Marque comme livré
    F->>A: PATCH /api/deliveries/{id}/status?status=delivered
    A->>DB: UPDATE deliveries SET status='delivered', delivery_time=now()
    A->>DB: UPDATE orders SET status='delivered', actual_delivery=now()
    A-->>F: {success: true}
    F-->>C: ✅ Commande livrée !
```

### Séquence : Processus Admin (gestion commande)

```mermaid
sequenceDiagram
    autonumber
    actor ADM as Admin
    participant F as Frontend
    participant A as API FastAPI
    participant DB as PostgreSQL

    ADM->>F: Ouvre dashboard admin
    F->>A: GET /api/admin/dashboard
    A->>DB: SELECT COUNT, SUM, AVG sur orders/products/users
    A-->>F: {total_orders, revenue, pending_orders, ...}
    F-->>ADM: Affiche statistiques

    ADM->>F: Consulte liste commandes
    F->>A: GET /api/admin/orders?status=pending
    A->>DB: SELECT orders + items WHERE status = ?
    A-->>F: {items: [...], total}

    ADM->>F: Change statut commande à "preparing"
    F->>A: PATCH /api/admin/orders/{id}/status {status: "preparing", notes: "En cours"}
    A->>DB: UPDATE orders SET status = 'preparing'
    A->>DB: INSERT INTO notifications {type: order, title: "Commande en préparation"}
    A-->>F: {success: true}

    ADM->>F: Passe commande à "ready"
    F->>A: PATCH /api/admin/orders/{id}/status {status: "ready"}
    A->>DB: UPDATE orders SET status = 'ready'
    A->>DB: INSERT INTO deliveries (order_id, status: 'pending')
    A-->>F: {success: true}

    ADM->>F: Ajuste stock produit
    F->>A: POST /api/admin/inventory/adjust {product_id: 1, adjustment: -5}
    A->>DB: UPDATE products SET quantity_available = quantity_available - 5
    A-->>F: {success: true, quantity_available: 45}
```

---

## 9. Pipeline CI/CD

### Diagramme de flux

```mermaid
flowchart TD
    A[git push / git tag] --> B{Trigger?}

    B -->|push to master| C[TEST]
    B -->|tag v*| C

    C --> D[Backend pytest]
    C --> E[Frontend lint + build]

    D --> F{Tests pass?}
    E --> F
    F -->|Non| G[❌ Pipeline échoue]
    F -->|Oui| H{Push ou Tag?}

    H -->|push master| I[DOCKER-BUILD]
    H -->|tag v*| I & J[MOBILE-BUILD] & K[WEB-EXPORT] & L[RELEASE]

    I --> M[Build backend image]
    I --> N[Build frontend image]
    M --> O[Push to ghcr.io]
    N --> O

    J --> P[Build APK Android]

    K --> Q[Build export statique ZIP]

    L --> R[Create GitHub Release]
    L --> S[Upload artifacts]

    O --> T{Deploy secrets\nconfigured?}
    T -->|Oui| U[DEPLOY via SSH]
    T -->|Non| V[⏭️ Skip deploy]
    U --> W{continue-on-error}
    W --> X[Deploy status]
```

### Jobs

| Job | Trigger | Durée | Artifacts |
|-----|---------|-------|-----------|
| `test` | push, tag | ~2min | — |
| `docker-build` | push, tag | ~3min | `ghcr.io` images |
| `mobile-build` | tag v* | ~5min | `po-tiramisu.apk` |
| `web-export` | tag v* | ~1min | `po-tiramisu-web.zip` |
| `deploy` | push, tag | ~1min | Serveur SSH |
| `release` | tag v* | ~30s | GitHub Release |

---

## 10. Sécurité

### Authentification JWT

```
┌─────────────────────────────────────────────┐
│              JWT Token Flow                  │
├─────────────────────────────────────────────┤
│                                              │
│  Access Token:                               │
│  ├─ Algorithm: HS256                         │
│  ├─ Expires: 24h                             │
│  ├─ Payload: {sub: uuid, role, type: access} │
│  └─ Header: Authorization: Bearer <token>    │
│                                              │
│  Refresh Token:                              │
│  ├─ Algorithm: HS256                         │
│  ├─ Expires: 30 jours                        │
│  ├─ Payload: {sub: uuid, role, type: refresh}│
│  └─ Usage: POST /api/auth/refresh            │
│                                              │
└─────────────────────────────────────────────┘
```

### Rôles et permissions

| Rôle | Permissions |
|------|------------|
| `customer` | CRUD panier, passer commandes, écrire avis, gérer profil |
| `admin` | Tout + dashboard, gestion produits/orders/users/inventory |
| `delivery` | Mettre à jour statut livraison, localisation GPS |

### Middleware de sécurité

| Middleware | Rôle |
|------------|------|
| `get_current_user` | Décode JWT, vérifie existence + is_active |
| `get_current_admin` | Vérifie role == "admin" |
| `get_optional_user` | Auth optionnelle (ne lève pas d'erreur) |
| CORS | Autorise origins: localhost:3000, FRONTEND_URL |
| X-Process-Time | Header temps de traitement sur chaque réponse |

---

## 11. Configuration et environnements

### Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `DATABASE_URL` | URL connexion PostgreSQL | `postgresql://postgres:postgres123@localhost:5432/po_tiramisu` |
| `SECRET_KEY` | Clé secrète JWT (≥32 chars) | *(doit être changé)* |
| `FLOUCI_API_KEY` | Clé API Flouci | `""` |
| `FLOUCI_MERCHANT_ID` | Merchant ID Flouci | `""` |
| `FLOUCI_API_URL` | URL base Flouci | `https://api.flouci.com` |
| `PAYMEE_API_KEY` | Clé API Paymee | `""` |
| `BACKEND_URL` | URL du backend | `http://localhost:8000` |
| `FRONTEND_URL` | URL du frontend | `http://localhost:3000` |
| `ENVIRONMENT` | `development` ou `production` | `development` |

### Secrets GitHub Actions

```bash
gh secret set SECRET_KEY --body "$(openssl rand -hex 32)"
gh secret set POSTGRES_PASSWORD --body "$(openssl rand -hex 16)"
gh secret set FLOUCI_API_KEY --body "your-api-key"
gh secret set FLOUCI_MERCHANT_ID --body "your-merchant-id"
```

### Architecture de déploiement production

```
                        ┌─────────────────────┐
                        │     Nginx :80        │
                        │  (reverse proxy)     │
                        │  SSL/TLS (Let's Encrypt)│
                        └─────┬───────┬───────┘
                              │       │
                ┌─────────────┘       └─────────────┐
                │                                   │
        ┌───────▼─────────┐               ┌─────────▼────────┐
        │ Frontend :3000   │               │ Backend :8000     │
        │ (Next.js SSR)    │               │ (FastAPI + Uvicorn)│
        │ ou static export │               │ gunicorn workers   │
        └─────────────────┘               └─────────┬────────┘
                                                    │
                                            ┌───────▼───────┐
                                            │ PostgreSQL    │
                                            │ :5432         │
                                            └───────────────┘
```

> **Note :** En production, Nginx expose le tout sur le port 80 (HTTPS). Le frontend peut soit tourner en mode SSR (Node.js), soit être servi en statique depuis Nginx après `next build` avec `output: 'export'`.

---

## Glossaire

| Terme | Définition |
|-------|-----------|
| **DT** | Dinar Tunisien (devise) |
| **Slug** | URL-friendly identifier pour les produits (`tiramisu-classique`) |
| **Product Snapshot** | Copie des données produit au moment de la commande (JSON dans `order_items`) |
| **In-Memory Cart** | Panier stocké en RAM via `state.py` (à remplacer par Redis en production) |
| **Flouci** | Passerelle de paiement en ligne tunisienne |
| **Adaptive Icon** | Icône Android avec couche séparée foreground/background |
