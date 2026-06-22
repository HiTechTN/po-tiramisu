# 📋 PRD COMPLET - PO_TIRAMISU 
## Plateforme E-Commerce de Vente et Gestion de Tiramisus Artisanaux
---

**Version:** 2.0  
**Date:** Juin 2026  
**Statut:** Ready for Agent Development  
**Tech Stack:** Next.js 15 + FastAPI + PostgreSQL + Redis  
**Deployment:** Docker + Nginx + GitHub Actions  

---

## TABLE DES MATIÈRES
1. [Vue d'Ensemble du Projet](#1-vue-densemble)
2. [Objectifs et KPIs](#2-objectifs-et-kpis)
3. [Analyse du Produit Actuel](#3-analyse-du-produit)
4. [Architecture Technique](#4-architecture-technique)
5. [Base de Données](#5-base-de-données)
6. [API REST Complète](#6-api-rest)
7. [Frontend - Features](#7-frontend-features)
8. [Admin Dashboard](#8-admin-dashboard)
9. [Système de Paiement](#9-système-de-paiement)
10. [Gestion des Commandes et Livraison](#10-gestion-commandes-livraison)
11. [Intégration Instagram API](#11-instagram-api)
12. [Timeline de Déploiement](#12-timeline)

---

## 1. VUE D'ENSEMBLE

### 1.1 Présentation du Projet
**Po_Tiramisu** est une marque tunisienne de **tiramisus artisanaux faits maison**. Actuellement, les ventes se font via Instagram DM/Stories avec gestion manuelle. 

**Objectif:** Créer une plateforme e-commerce moderne qui :
- Centralise les commandes
- Automatise la gestion des livraisons
- Intègre les paiements (Flouci + Paymee)
- Permet la vente en ligne 24/7
- Analyse les données de vente
- Synchronise avec Instagram (publications, stories)

### 1.2 Scope Complet
- ✅ Plateforme web responsive (desktop + mobile)
- ✅ Admin dashboard pour la gestion
- ✅ API REST JSON
- ✅ Base de données relationnelle
- ✅ Système de paiement Tunisien
- ✅ Gestion d'inventaire
- ✅ Système de livraison avec traçabilité
- ✅ Module authentification/JWT
- ✅ Feed Instagram automatisé
- ✅ Notifications en temps réel
- ✅ Système de reviews/ratings
- ✅ Dashboard analytics

### 1.3 Utilisateurs Cibles

**Client Final (B2C):**
- Âge: 18-45 ans
- Localisation: Tunis, GTA, Tunisie
- Technologie: Smartphone + web
- Comportement: Instagram → Achat → Livraison

**Po_Tiramisu Team:**
- Producteur (gestion stock)
- Vendeur (gestion commandes)
- Livreur (traçabilité)
- Admin système

---

## 2. OBJECTIFS ET KPIs

### 2.1 OKRs Trimestriels

| Objectif | KPI | Target T1 |
|----------|-----|-----------|
| Augmenter les ventes | Commandes/mois | 50→150/mois |
| Réduire charge manuelle | Temps traitement | 30min→5min |
| Améliorer satisfaction client | CSAT score | - → 4.5/5 |
| Augmenter conversion | Taux cart→paiement | - → 45% |
| Fidélisation | Clients récurrents | - → 30% |

### 2.2 Métriques Techniques
- **Uptime:** 99.5%
- **Response API:** <200ms
- **Load time web:** <2s
- **Mobile lighthouse:** >85

---

## 3. ANALYSE DU PRODUIT ACTUEL

### 3.1 État Actuel
- 📱 **Canal unique:** Instagram (@po_tiramisu)
- 💬 **Commandes:** Via DM/Comments
- 📝 **Gestion:** Spreadsheet manuelle
- 💳 **Paiement:** Virement + Espèces
- 🚗 **Livraison:** Ad-hoc (pas de traçage)
- 📊 **Analytics:** Aucun suivi

### 3.2 Problèmes Identifiés
1. **Scalabilité:** Impossible de gérer >30 DM/jour
2. **Manque de traçabilité:** Pas de suivi commandes
3. **Paiements non sécurisés:** Pas d'intermédiaire
4. **Stock invisible:** Risque de surcommande
5. **Pas de fidélisation:** Aucun système de points/remise
6. **Support client:** Pas de système ticket
7. **Données:** Aucun insight sur les ventes

### 3.3 Produit: Les Tiramisus

**Variantes identifiées:**
- Tiramisu Classic (4 portions) - 45 DT
- Tiramisu Chocolate (4 portions) - 50 DT
- Tiramisu Fruit (4 portions) - 55 DT
- Tiramisu Mini (1 portion) - 15 DT
- Tiramisu Deluxe Pack (8 portions) - 85 DT

**Caractéristiques:**
- Durée de vie: 5 jours
- Livraison: 24h après commande
- Zones: Grand Tunis + Banlieue
- Frais de livraison: 3-8 DT

---

## 4. ARCHITECTURE TECHNIQUE

### 4.1 Stack Global

```
┌─────────────────────────────────────────────────┐
│                FRONTEND LAYER                    │
│  Next.js 15 (App Router) + React 19 + TypeScript│
│  TailwindCSS + ShadCN UI + Zod                  │
│  TanStack Query (Data Fetching)                 │
│  TanStack Table (Admin Tables)                  │
│  Zustand (State Management)                     │
└─────────────────────────────────────────────────┘
              ↓ REST API (JSON)
┌─────────────────────────────────────────────────┐
│               BACKEND LAYER                      │
│  FastAPI (Python 3.11) + async/await            │
│  Pydantic (Data Validation)                     │
│  SQLAlchemy ORM (Async)                         │
│  JWT + Security                                 │
│  CORS + Rate Limiting                           │
└─────────────────────────────────────────────────┘
              ↓ SQL + Cache
┌─────────────────────────────────────────────────┐
│            DATA LAYER                           │
│  PostgreSQL 15+ (Primary DB)                    │
│  Redis 7+ (Cache + Pub/Sub)                     │
│  S3/MinIO (Images)                              │
└─────────────────────────────────────────────────┘
```

### 4.2 Déploiement

```yaml
┌─ Docker Compose (Dev)
│  ├─ po-tiramisu-frontend (Next.js)
│  ├─ po-tiramisu-backend (FastAPI)
│  ├─ po-tiramisu-db (PostgreSQL)
│  ├─ po-tiramisu-redis (Redis)
│  └─ po-tiramisu-nginx (Reverse Proxy)
│
└─ Production (VPS/Render/Railway)
   ├─ Frontend (Vercel/Netlify)
   ├─ API (Railway/Render)
   ├─ DB (PostgreSQL Managed)
   ├─ Redis (Managed Redis)
   └─ CDN (Cloudflare)
```

### 4.3 Infrastructure Locale (Développement)

```bash
# Dev Stack
- Node.js 20 LTS
- Python 3.11
- PostgreSQL 15
- Redis 7
- Docker Desktop
```

---

## 5. BASE DE DONNÉES

### 5.1 Schéma Complet

```sql
-- ============ UTILISATEURS ============
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  full_name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  
  -- Profil
  role ENUM('customer', 'admin', 'delivery') DEFAULT 'customer',
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  
  -- Meta
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_phone (phone),
  INDEX idx_created (created_at)
);

-- ============ ADRESSES ============
CREATE TABLE addresses (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  
  label VARCHAR(50), -- "Domicile", "Bureau"
  street VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20),
  governorate VARCHAR(100), -- Wilaya
  country VARCHAR(100) DEFAULT 'Tunisia',
  
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, is_default) WHERE is_default = TRUE,
  INDEX idx_user (user_id)
);

-- ============ PRODUITS ============
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  
  -- Pricing
  price_dt DECIMAL(10, 2) NOT NULL,
  cost_dt DECIMAL(10, 2),
  
  -- Inventory
  quantity_available INT DEFAULT 0,
  quantity_reserved INT DEFAULT 0,
  
  -- Media
  image_url TEXT,
  images JSONB DEFAULT '[]', -- Multiple images
  
  -- Meta
  category VARCHAR(100),
  tags JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_slug (slug),
  INDEX idx_category (category),
  INDEX idx_active (is_active)
);

-- ============ COMMANDES ============
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  
  user_id BIGINT NOT NULL REFERENCES users(id),
  
  -- Status
  status ENUM('pending', 'confirmed', 'preparing', 'ready', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  
  -- Pricing
  subtotal_dt DECIMAL(10, 2) NOT NULL,
  delivery_fee_dt DECIMAL(10, 2) DEFAULT 0,
  discount_dt DECIMAL(10, 2) DEFAULT 0,
  total_dt DECIMAL(10, 2) NOT NULL,
  
  -- Delivery
  delivery_address_id BIGINT REFERENCES addresses(id),
  delivery_date TIMESTAMP,
  delivery_notes TEXT,
  
  -- Payment
  payment_method ENUM('flouci', 'paymee', 'cash') DEFAULT 'pending',
  payment_ref VARCHAR(100),
  
  -- Tracking
  estimated_delivery TIMESTAMP,
  actual_delivery TIMESTAMP,
  
  -- Meta
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_created (created_at),
  INDEX idx_payment_status (payment_status)
);

-- ============ DÉTAILS COMMANDE ============
CREATE TABLE order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id),
  
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price_dt DECIMAL(10, 2) NOT NULL,
  total_price_dt DECIMAL(10, 2) NOT NULL,
  
  -- Snapshot du produit au moment de la commande
  product_snapshot JSONB,
  
  INDEX idx_order (order_id),
  INDEX idx_product (product_id)
);

-- ============ LIVRAISONS ============
CREATE TABLE deliveries (
  id BIGSERIAL PRIMARY KEY,
  uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  
  order_id BIGINT UNIQUE NOT NULL REFERENCES orders(id),
  delivery_person_id BIGINT REFERENCES users(id),
  
  status ENUM('pending', 'assigned', 'in_progress', 'delivered', 'failed') DEFAULT 'pending',
  
  -- Tracking
  pickup_time TIMESTAMP,
  delivery_time TIMESTAMP,
  
  -- Localisation
  current_latitude DECIMAL(10, 8),
  current_longitude DECIMAL(11, 8),
  
  location_history JSONB DEFAULT '[]', -- [{lat, lng, timestamp}]
  
  -- Notes
  notes TEXT,
  signature_url TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_order (order_id),
  INDEX idx_status (status),
  INDEX idx_person (delivery_person_id)
);

-- ============ PAIEMENTS ============
CREATE TABLE payments (
  id BIGSERIAL PRIMARY KEY,
  uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  
  order_id BIGINT NOT NULL REFERENCES orders(id),
  user_id BIGINT NOT NULL REFERENCES users(id),
  
  amount_dt DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'TND',
  
  provider ENUM('flouci', 'paymee') NOT NULL,
  provider_reference VARCHAR(255),
  
  status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  
  metadata JSONB, -- Response API complet
  
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  
  INDEX idx_order (order_id),
  INDEX idx_user (user_id),
  INDEX idx_status (status)
);

-- ============ AVIS CLIENTS ============
CREATE TABLE reviews (
  id BIGSERIAL PRIMARY KEY,
  
  user_id BIGINT NOT NULL REFERENCES users(id),
  product_id BIGINT REFERENCES products(id),
  order_id BIGINT REFERENCES orders(id),
  
  rating INT CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  
  is_verified BOOLEAN DEFAULT FALSE,
  helpful_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_product (product_id),
  INDEX idx_user (user_id),
  INDEX idx_rating (rating)
);

-- ============ CODES PROMO ============
CREATE TABLE promo_codes (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  
  discount_percent INT,
  discount_fixed_dt DECIMAL(10, 2),
  
  valid_from TIMESTAMP,
  valid_until TIMESTAMP,
  
  max_uses INT,
  uses_count INT DEFAULT 0,
  
  min_order_dt DECIMAL(10, 2),
  applicable_products JSONB, -- null = tous
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_code (code),
  INDEX idx_active (is_active)
);

-- ============ NOTIFICATIONS ============
CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  
  type ENUM('order', 'delivery', 'promotion', 'system') DEFAULT 'system',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_user_read (user_id, is_read),
  INDEX idx_created (created_at)
);

-- ============ ANALYTICS ============
CREATE TABLE analytics_events (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  
  event_type VARCHAR(100), -- 'page_view', 'add_to_cart', 'checkout', 'search'
  event_data JSONB,
  
  timestamp TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_user (user_id),
  INDEX idx_type (event_type),
  INDEX idx_timestamp (timestamp)
);
```

### 5.2 Indexes Critiques

```sql
-- Performance queries
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at DESC);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_products_active_slug ON products(is_active, slug);
CREATE INDEX idx_reviews_product_rating ON reviews(product_id, rating DESC);
```

---

## 6. API REST COMPLÈTE

### 6.1 Authentification

#### POST `/api/auth/register`
```json
Request:
{
  "email": "client@example.tn",
  "password": "SecurePass123!",
  "full_name": "Ahmed Ben Ali",
  "phone": "+216 99 123 456"
}

Response (201):
{
  "id": 1,
  "uuid": "abc-123",
  "email": "client@example.tn",
  "full_name": "Ahmed Ben Ali",
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "bearer",
  "expires_in": 86400
}
```

#### POST `/api/auth/login`
```json
Request:
{
  "email": "client@example.tn",
  "password": "SecurePass123!"
}

Response (200):
{
  "access_token": "...",
  "refresh_token": "...",
  "user": { ...full user object }
}
```

#### POST `/api/auth/refresh`
```json
Request:
{
  "refresh_token": "eyJhbGc..."
}

Response (200):
{
  "access_token": "...",
  "expires_in": 86400
}
```

#### POST `/api/auth/logout`
```
Response (204): No Content
```

#### GET `/api/auth/me` [Protected]
```json
Response (200):
{
  "id": 1,
  "uuid": "...",
  "email": "...",
  "full_name": "...",
  "phone": "...",
  "role": "customer",
  "is_active": true,
  "created_at": "2026-06-20T10:30:00Z"
}
```

---

### 6.2 Produits

#### GET `/api/products`
```
Query params:
- category: string (optional)
- search: string (optional)
- skip: int (default: 0)
- limit: int (default: 20)
- sort: 'name' | 'price' | 'created' (default: 'name')
- order: 'asc' | 'desc' (default: 'asc')

Response (200):
{
  "items": [
    {
      "id": 1,
      "uuid": "...",
      "name": "Tiramisu Classic",
      "slug": "tiramisu-classic",
      "description": "...",
      "price_dt": 45.00,
      "quantity_available": 10,
      "category": "tiramisu",
      "image_url": "https://...",
      "images": ["https://...", "https://..."],
      "rating": 4.8,
      "reviews_count": 25,
      "is_active": true,
      "created_at": "2026-01-15T00:00:00Z"
    }
  ],
  "total": 5,
  "skip": 0,
  "limit": 20
}
```

#### GET `/api/products/{id}` ou `/{slug}`
```json
Response (200):
{
  "id": 1,
  "uuid": "...",
  "name": "Tiramisu Classic",
  "slug": "tiramisu-classic",
  "description": "Tiramisu traditionnel avec...",
  "price_dt": 45.00,
  "cost_dt": 18.00,
  "quantity_available": 10,
  "category": "tiramisu",
  "image_url": "https://...",
  "images": ["https://...", "https://..."],
  "tags": ["classic", "signature"],
  "is_active": true,
  "reviews": [
    {
      "id": 1,
      "rating": 5,
      "title": "Excellent!",
      "comment": "Vraiment délicieux...",
      "user_name": "Ahmed B.",
      "created_at": "2026-06-19T00:00:00Z"
    }
  ],
  "average_rating": 4.8,
  "total_reviews": 25
}
```

#### POST `/api/products` [Admin Only]
```json
Request:
{
  "name": "Tiramisu Fruit",
  "slug": "tiramisu-fruit",
  "description": "...",
  "price_dt": 55.00,
  "cost_dt": 22.00,
  "quantity_available": 15,
  "category": "tiramisu",
  "image_url": "https://...",
  "images": [],
  "tags": ["fruit", "summer"]
}

Response (201): { ...product object }
```

#### PUT `/api/products/{id}` [Admin Only]
```json
Request: { ...updated fields }
Response (200): { ...product object }
```

#### DELETE `/api/products/{id}` [Admin Only]
```
Response (204): No Content
```

---

### 6.3 Panier & Commandes

#### GET `/api/cart` [Protected]
```json
Response (200):
{
  "id": "cart_123",
  "user_id": 1,
  "items": [
    {
      "product_id": 1,
      "product_name": "Tiramisu Classic",
      "quantity": 2,
      "unit_price_dt": 45.00,
      "total_price_dt": 90.00
    }
  ],
  "subtotal_dt": 90.00,
  "delivery_fee_dt": 0,
  "discount_dt": 0,
  "total_dt": 90.00,
  "promo_code": null
}
```

#### POST `/api/cart/add` [Protected]
```json
Request:
{
  "product_id": 1,
  "quantity": 2
}

Response (200): { ...cart object }
```

#### PUT `/api/cart/update` [Protected]
```json
Request:
{
  "product_id": 1,
  "quantity": 3
}

Response (200): { ...cart object }
```

#### DELETE `/api/cart/remove/{product_id}` [Protected]
```
Response (204): No Content
```

#### DELETE `/api/cart/clear` [Protected]
```
Response (204): No Content
```

#### POST `/api/cart/apply-promo` [Protected]
```json
Request:
{
  "promo_code": "SUMMER2026"
}

Response (200):
{
  "success": true,
  "message": "Code appliqué avec succès",
  "discount_dt": 10.00,
  "new_total_dt": 80.00
}
```

---

### 6.4 Commandes

#### POST `/api/orders` [Protected]
```json
Request:
{
  "address_id": 5,
  "payment_method": "flouci",
  "delivery_date": "2026-06-22T14:00:00Z",
  "notes": "Sonner à l'arrivée"
}

Response (201):
{
  "id": 1,
  "uuid": "order-abc-123",
  "user_id": 1,
  "status": "pending",
  "payment_status": "pending",
  "subtotal_dt": 90.00,
  "delivery_fee_dt": 5.00,
  "total_dt": 95.00,
  "items": [
    {
      "product_id": 1,
      "product_name": "Tiramisu Classic",
      "quantity": 2,
      "unit_price_dt": 45.00,
      "total_price_dt": 90.00
    }
  ],
  "payment_reference": "PAY-123456",
  "payment_url": "https://api.flouci.com/...",
  "created_at": "2026-06-20T10:30:00Z"
}
```

#### GET `/api/orders` [Protected]
```
Query params:
- status: string (optional)
- skip: int (default: 0)
- limit: int (default: 20)

Response (200):
{
  "items": [
    {
      "id": 1,
      "uuid": "order-abc-123",
      "status": "preparing",
      "payment_status": "completed",
      "total_dt": 95.00,
      "estimated_delivery": "2026-06-22T16:00:00Z",
      "created_at": "2026-06-20T10:30:00Z"
    }
  ],
  "total": 12,
  "skip": 0,
  "limit": 20
}
```

#### GET `/api/orders/{order_id}` [Protected]
```json
Response (200):
{
  "id": 1,
  "uuid": "order-abc-123",
  "status": "shipped",
  "payment_status": "completed",
  "subtotal_dt": 90.00,
  "delivery_fee_dt": 5.00,
  "total_dt": 95.00,
  "items": [ ...items ],
  "delivery_address": {
    "street": "Rue X",
    "city": "Tunis",
    "postal_code": "2000",
    "governorate": "Tunis"
  },
  "delivery": {
    "id": 1,
    "uuid": "delivery-xyz",
    "status": "in_progress",
    "estimated_delivery": "2026-06-22T16:00:00Z",
    "current_location": {
      "latitude": 36.806389,
      "longitude": 10.169444,
      "timestamp": "2026-06-22T15:45:00Z"
    }
  },
  "timeline": [
    { "status": "pending", "timestamp": "2026-06-20T10:30:00Z" },
    { "status": "confirmed", "timestamp": "2026-06-20T10:35:00Z" },
    { "status": "preparing", "timestamp": "2026-06-21T09:00:00Z" },
    { "status": "ready", "timestamp": "2026-06-21T14:30:00Z" },
    { "status": "shipped", "timestamp": "2026-06-22T08:00:00Z" }
  ]
}
```

#### PATCH `/api/orders/{order_id}/cancel` [Protected]
```json
Response (200):
{
  "success": true,
  "message": "Commande annulée",
  "refund_amount": 95.00
}
```

---

### 6.5 Paiements

#### POST `/api/payments/flouci/init` [Protected]
```json
Request:
{
  "order_id": 1,
  "amount_dt": 95.00
}

Response (200):
{
  "payment_url": "https://api.flouci.com/pay/abc123",
  "session_id": "session_abc123",
  "expires_at": "2026-06-20T11:30:00Z"
}
```

#### POST `/api/payments/flouci/callback` [Webhook]
```json
Request:
{
  "order_id": 1,
  "session_id": "session_abc123",
  "status": "success",
  "reference": "TXN-202606201030",
  "amount": 95.00
}

Response (200):
{
  "success": true,
  "message": "Paiement confirmé"
}
```

#### GET `/api/payments/{order_id}/status` [Protected]
```json
Response (200):
{
  "order_id": 1,
  "status": "completed",
  "amount": 95.00,
  "reference": "TXN-202606201030",
  "provider": "flouci",
  "completed_at": "2026-06-20T10:45:00Z"
}
```

---

### 6.6 Livraisons

#### GET `/api/deliveries/{delivery_id}/track` [Protected]
```json
Response (200):
{
  "id": 1,
  "uuid": "delivery-xyz",
  "order_id": 1,
  "status": "in_progress",
  "delivery_person_name": "Mohamed K.",
  "delivery_person_phone": "+216 99 123 456",
  "current_location": {
    "latitude": 36.806389,
    "longitude": 10.169444,
    "timestamp": "2026-06-22T15:45:00Z",
    "accuracy": 10
  },
  "estimated_delivery": "2026-06-22T16:30:00Z",
  "location_history": [
    { "latitude": 36.806389, "longitude": 10.169444, "timestamp": "2026-06-22T15:45:00Z" },
    { "latitude": 36.805000, "longitude": 10.168000, "timestamp": "2026-06-22T15:40:00Z" }
  ]
}
```

---

### 6.7 Avis Clients

#### POST `/api/reviews` [Protected]
```json
Request:
{
  "product_id": 1,
  "order_id": 1,
  "rating": 5,
  "title": "Excellent produit!",
  "comment": "Le meilleur tiramisu que j'ai goûté"
}

Response (201):
{
  "id": 1,
  "user_id": 1,
  "product_id": 1,
  "rating": 5,
  "title": "Excellent produit!",
  "comment": "Le meilleur tiramisu que j'ai goûté",
  "user_name": "Ahmed B.",
  "is_verified": true,
  "created_at": "2026-06-20T10:30:00Z"
}
```

#### GET `/api/reviews/product/{product_id}`
```json
Response (200):
{
  "items": [ ...reviews ],
  "average_rating": 4.8,
  "total_reviews": 25,
  "rating_distribution": {
    "5": 20,
    "4": 4,
    "3": 1,
    "2": 0,
    "1": 0
  }
}
```

---

### 6.8 Utilisateur

#### GET `/api/users/me` [Protected]
```json
Response (200):
{ ...complete user object }
```

#### PUT `/api/users/me` [Protected]
```json
Request:
{
  "full_name": "Ahmed Ben Ali",
  "phone": "+216 99 123 456",
  "avatar_url": "https://..."
}

Response (200): { ...updated user }
```

#### GET `/api/addresses` [Protected]
```json
Response (200):
{
  "items": [
    {
      "id": 1,
      "label": "Domicile",
      "street": "Rue X",
      "city": "Tunis",
      "postal_code": "2000",
      "governorate": "Tunis",
      "is_default": true
    }
  ]
}
```

#### POST `/api/addresses` [Protected]
```json
Request:
{
  "label": "Bureau",
  "street": "Rue Y",
  "city": "Ariana",
  "postal_code": "2080",
  "governorate": "Ariana"
}

Response (201): { ...address object }
```

---

### 6.9 Admin Panel

#### GET `/api/admin/dashboard` [Admin Only]
```json
Response (200):
{
  "total_orders": 156,
  "total_revenue_dt": 12450.00,
  "pending_orders": 5,
  "recent_orders": [ ...orders ],
  "top_products": [ ...products ],
  "revenue_by_day": [ ... ],
  "order_status_distribution": { ... }
}
```

#### GET `/api/admin/orders` [Admin Only]
```
Query params:
- status: string
- payment_status: string
- from_date: ISO string
- to_date: ISO string

Response (200): { items, total, skip, limit }
```

#### PATCH `/api/admin/orders/{order_id}/status` [Admin Only]
```json
Request:
{
  "status": "confirmed",
  "notes": "En préparation"
}

Response (200): { ...order object }
```

#### POST `/api/admin/products` [Admin Only]
#### PUT `/api/admin/products/{id}` [Admin Only]
#### DELETE `/api/admin/products/{id}` [Admin Only]
#### GET `/api/admin/inventory` [Admin Only]
#### POST `/api/admin/inventory/adjust` [Admin Only]

---

## 7. FRONTEND FEATURES

### 7.1 Pages Clés

**Pages Publiques:**
- `/` - Accueil avec hero + featured products
- `/products` - Catalogue avec filtres
- `/products/[slug]` - Détail produit
- `/login` - Connexion
- `/register` - Inscription
- `/about` - À propos
- `/contact` - Contact

**Pages Protégées (Connecté):**
- `/account` - Profil utilisateur
- `/addresses` - Gestion adresses
- `/cart` - Panier
- `/checkout` - Processus paiement
- `/orders` - Historique commandes
- `/orders/[id]` - Détail commande + tracking
- `/favorites` - Produits favoris

**Admin:**
- `/admin` - Dashboard
- `/admin/orders` - Gestion commandes
- `/admin/products` - Gestion produits
- `/admin/inventory` - Stock
- `/admin/deliveries` - Livraisons
- `/admin/analytics` - Statistiques
- `/admin/users` - Gestion clients

### 7.2 Components React

```
src/
├── components/
│   ├── Layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Navbar.tsx
│   │   └── Sidebar.tsx
│   │
│   ├── Products/
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── ProductFilters.tsx
│   │   ├── ProductDetail.tsx
│   │   └── ReviewsList.tsx
│   │
│   ├── Cart/
│   │   ├── CartSummary.tsx
│   │   ├── CartItem.tsx
│   │   ├── PromoCodeInput.tsx
│   │   └── EmptyCart.tsx
│   │
│   ├── Checkout/
│   │   ├── OrderSummary.tsx
│   │   ├── AddressSelector.tsx
│   │   ├── PaymentSelector.tsx
│   │   ├── OrderPlaced.tsx
│   │   └── PaymentGateway.tsx
│   │
│   ├── Orders/
│   │   ├── OrderCard.tsx
│   │   ├── OrderTimeline.tsx
│   │   ├── TrackingMap.tsx
│   │   └── DeliveryInfo.tsx
│   │
│   ├── Auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── AuthGuard.tsx
│   │
│   ├── Admin/
│   │   ├── DashboardCards.tsx
│   │   ├── OrdersTable.tsx
│   │   ├── ProductsManager.tsx
│   │   ├── InventoryManager.tsx
│   │   └── AnalyticsChart.tsx
│   │
│   └── Common/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Toast.tsx
│       ├── Spinner.tsx
│       └── EmptyState.tsx
│
├── pages/
├── lib/
│   ├── api.ts (API client)
│   ├── auth.ts (Auth utilities)
│   ├── storage.ts (LocalStorage)
│   └── utils.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useCart.ts
│   ├── useOrders.ts
│   └── useApi.ts
└── styles/
    └── globals.css
```

### 7.3 Páginas Principales

#### Accueil
```
Hero Section
- Image principale
- Tagline: "Tiramisus artisanaux faits avec amour"
- CTA: "Commander Maintenant"

Featured Products
- Grid 4 produits phares
- Chaque card: image, nom, prix, CTA "Ajouter"

Why Choose Us
- Qualité: Ingrédients frais
- Livraison: 24h
- Service: Support 24/7
- Certificats: Hygiène validée

Testimonials
- 5 avis clients
- Ratings 4.8/5

Newsletter Signup
- Email input
- CTA "S'abonner"
```

#### Catalogue
```
Sidebar Filters:
- Categories (checkboxes)
- Price range (slider)
- Ratings (stars)
- Availability (toggle)

Main Area:
- Sort dropdown (Price, Name, New)
- Product Grid (responsive)
- Pagination

Each Card:
- Image
- Name
- Price en gros (45 DT)
- Rating (4.8 ⭐)
- "Ajouter au panier" button
- Wishlist icon
```

#### Panier
```
Cart Items
- Table responsive
- Product image, name, qty, price
- Remove button
- Update quantity input

Summary:
- Subtotal: 90 DT
- Delivery: 5 DT
- Discount: -10 DT
- Total: 85 DT

Promo Code:
- Input field
- "Appliquer" button
- Discount info

Actions:
- "Continuer le shopping" button
- "Passer commande" button (highlighted)
```

#### Checkout
```
Step 1: Delivery Address
- List saved addresses
- "Use this address" / "Change" buttons
- Add new address form (modal)

Step 2: Delivery Date
- Calendar picker
- Time slot selector
- Instructions textarea

Step 3: Payment
- Flouci option
- Paymee option
- Cash option (if enabled)
- Order summary

Final:
- "Confirmer & Payer" button
- "Retour" button
```

#### Tracking en Temps Réel
```
Map Component:
- Leaflet/Mapbox
- Marker position: livreur
- Marker position: client
- Route en ligne

Info Panel:
- Livreur: Nom, Photo, Phone
- Statut: "En route"
- ETA: "16:30"
- Current Location: "Rue X, Tunis"

Timeline:
- Commande reçue ✓
- En préparation ✓
- Prête ✓
- Expédiée ✓
- En cours → (current)
- Livrée (waiting)
```

---

## 8. ADMIN DASHBOARD

### 8.1 Page d'Accueil (Dashboard)

```
4 KPI Cards:
┌──────────────────┐
│ Commandes/Jour   │ 12
│ Revenue/Jour     │ 1,200 DT
│ Clients Actifs   │ 856
│ Panier Moyen     │ 85 DT
└──────────────────┘

2 Charts:
1. Revenue by Day (Derniers 30 jours)
2. Orders by Status (Pie chart)

Tables:
1. Dernières Commandes
2. Top Products par Ventes
3. Clients Récents
```

### 8.2 Gestion Commandes

```
Table Interactive:
- Colonnes: Order ID, Client, Montant, Status, Date
- Tri sur chaque colonne
- Filtres: Status, Payment Status, Date Range
- Bulk actions: Cancel, Mark as shipped

Detail Panel:
- Adresse livraison
- Items détails
- Timeline complète
- Actions: Confirm, Prepare, Mark as ready, Mark as shipped, Cancel
- Notes libre
- Assigner livreur (dropdown)
```

### 8.3 Gestion Produits

```
Table:
- Colonnes: Image, Nom, Prix, Stock, Category, Actions
- Ajout rapide: "Nouveau Produit" button
- Edit modal
- Delete avec confirmation

Modal Produit:
- Nom + Slug
- Description (WYSIWYG)
- Prix (cost + price)
- Category dropdown
- Tags (multi-select)
- Images upload (drag & drop, multiple)
- Stock initial
- Toggle: Active/Inactive
```

### 8.4 Stock (Inventory)

```
Table:
- Produits avec stock
- Quantité dispo
- Quantité réservée
- Seuil alerte
- Actions: Adjust

Adjust Modal:
- Quantité actuelle
- Nouvelle quantité
- Raison (dropdown)
- Notes
```

### 8.5 Livraisons

```
Map View:
- Tous les livreurs actifs
- Toutes les commandes en cours
- Routes

List View:
- Delivery status: Pending, Assigned, In Progress, Delivered, Failed
- Assignation rapide
- View tracking

Livreurs Management:
- Ajouter livreur
- Edit (phone, zone, status)
- Performance (deliveries/jour, rating)
```

### 8.6 Analytics

```
Time Range Selector:
- Last 7 days, 30 days, 90 days, Custom

Charts:
1. Revenue Trend (line chart)
2. Orders Trend (line chart)
3. Top Products (bar chart)
4. Top Customers (bar chart)
5. Payment Methods (pie chart)
6. Order Status Distribution

Metrics:
- Total Orders
- Total Revenue
- Average Order Value
- Customer Count
- Repeat Customers %
- Conversion Rate
```

---

## 9. SYSTÈME DE PAIEMENT

### 9.1 Flouci Integration

```python
# Configuration
FLOUCI_API_BASE = "https://api.flouci.com"
FLOUCI_APP_KEY = "your_app_key"
FLOUCI_MERCHANT_ID = "your_merchant_id"

# Initier un paiement
POST /api/payments/flouci/init
{
  "order_id": 1,
  "amount": 95.00,
  "currency": "TND",
  "customer": {
    "email": "client@example.tn",
    "phone": "+216 99 123 456",
    "name": "Ahmed Ben Ali"
  }
}

Response:
{
  "payment_url": "https://checkout.flouci.com/abc123",
  "session_id": "sess_abc123",
  "expires_at": "2026-06-20T11:30:00Z"
}

# Webhook Callback
POST /api/webhooks/flouci
{
  "order_id": 1,
  "session_id": "sess_abc123",
  "status": "success",
  "reference": "PAY-202606201030",
  "amount": 95.00
}
```

### 9.2 Paymee Integration

```python
# Configuration similaire
PAYMEE_API_BASE = "https://api.paymee.com"
PAYMEE_API_KEY = "your_api_key"

# Initier un paiement
POST /api/payments/paymee/init
{
  "order_id": 1,
  "amount": 95.00,
  ...
}

# Webhook
POST /api/webhooks/paymee
```

### 9.3 Cash on Delivery

```
- À la création de commande
- Status: "pending_payment"
- Notification livreur: "Cash à collecter"
- Après livraison: Mark as "completed"
```

---

## 10. GESTION COMMANDES ET LIVRAISON

### 10.1 Workflow Commande

```
CLIENT SIDE:
1. Browse products
2. Add to cart
3. Proceed to checkout
4. Enter address
5. Select delivery date
6. Select payment method
7. Confirm & pay
8. Payment gateway (Flouci/Paymee)
9. Success page
10. Tracking link

BACKEND EVENTS:
1. Order created (status: pending)
2. Payment initiated
3. Payment completed (status: confirmed)
4. Inventory reserved
5. Notification sent to admin
6. Order marked "preparing" (by admin)
7. Order marked "ready" (by admin)
8. Delivery assigned (by admin)
9. Delivery picked up (livreur scans)
10. GPS tracking live (real-time)
11. Delivered (photo proof)
12. Rating & review (by client)
```

### 10.2 Tracking GPS

```python
# Livreur app updates location every 30 seconds
POST /api/deliveries/{delivery_id}/update-location
{
  "latitude": 36.806389,
  "longitude": 10.169444,
  "accuracy": 10,  # meters
  "timestamp": "2026-06-22T15:45:00Z"
}

# Real-time WebSocket (optional future enhancement)
WS /ws/delivery/{delivery_id}
{
  "type": "location_update",
  "data": {
    "latitude": 36.806389,
    "longitude": 10.169444,
    "timestamp": "2026-06-22T15:45:00Z"
  }
}
```

### 10.3 Notifications

```
SMS via Vonage/Twilio:
- Order confirmed: "Commande #123 confirmée. Total: 95 DT"
- Order ready: "Votre commande est prête!"
- Order shipped: "Votre commande est en livraison"
- Delivery soon: "Livreur arrive dans 10 minutes"
- Delivery complete: "Livraison complète. Avis?"

Email:
- Order receipt
- Payment confirmation
- Shipping notification
- Review reminder (48h après livraison)

In-App Notifications:
- Real-time updates
- Stored in DB
- Push notifications (via OneSignal)
```

---

## 11. INSTAGRAM API INTEGRATION

### 11.1 Feed Automation (Future Phase)

```python
# Connect Instagram Business Account
POST /api/admin/instagram/connect
{
  "instagram_access_token": "...",
  "instagram_business_account_id": "..."
}

# Post product to Instagram
POST /api/admin/instagram/post
{
  "product_id": 1,
  "caption": "Tiramisu Classic 45 DT ✨ Commandez maintenant!",
  "image_url": "https://cdn.po-tiramisu.tn/...",
  "hashtags": ["tiramisu", "tunisia", "handmade"]
}

# Sync Stories
POST /api/admin/instagram/story
{
  "media_url": "https://...",
  "sticker_text": "Commandez ici!",
  "sticker_link": "https://po-tiramisu.tn/checkout"
}
```

---

## 12. TIMELINE DE DÉPLOIEMENT

### Phase 1: MVP (Semaines 1-3)
- [ ] Infrastructure setup (DB, Redis, Docker)
- [ ] Backend API core (Products, Orders, Auth)
- [ ] Frontend (Products, Cart, Checkout)
- [ ] Flouci payment integration
- [ ] Local deployment

### Phase 2: Livraison & Admin (Semaines 4-5)
- [ ] Delivery system + GPS
- [ ] Admin dashboard
- [ ] Inventory management
- [ ] Email notifications
- [ ] QA & testing

### Phase 3: Polish & Deploy (Semaines 6-7)
- [ ] Reviews & ratings
- [ ] Promo codes
- [ ] Analytics
- [ ] Mobile optimization
- [ ] Production deployment (Vercel + Railway/Render)

### Phase 4: Enhancements (Post-MVP)
- [ ] Instagram feed automation
- [ ] SMS notifications
- [ ] Advanced analytics
- [ ] Loyality program
- [ ] Marketing automation

---

## INSTRUCTIONS POUR L'AGENT CODEUR

### Commande Unique pour Générer le Projet Complet

```
Tu as le PRD complet ci-dessus. Génère un projet full-stack production-ready avec:

1. FRONTEND (Next.js 15):
   - Structure complète (pages + components)
   - Authentification JWT
   - État global (cart, auth)
   - Pages: products, cart, checkout, orders, tracking, account, admin
   - Responsive design (TailwindCSS)
   - API client (Axios/Fetch)
   - Forms avec validation (Zod)

2. BACKEND (FastAPI):
   - Tous les endpoints du PRD
   - SQLAlchemy models (complète)
   - JWT authentication
   - Rate limiting & CORS
   - Error handling robuste
   - Logging structured
   - Webhook handlers (Flouci)
   - Seeds data

3. DATABASE:
   - Schéma PostgreSQL complet (migrations Alembic)
   - Indexes optimisés
   - Constraints + triggers

4. DEPLOYMENT:
   - Docker Compose (all services)
   - GitHub Actions CI/CD
   - Environment configs
   - Production checklist

5. DOCUMENTATION:
   - API docs (Swagger)
   - Setup guide
   - Deployment guide
   - Admin manual

Le projet doit être prêt à cloner → docker-compose up → fonctionnel immédiatement.
```

---

## ANNEXES

### A. Variables d'Environnement

**.env.local (Frontend)**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_STRIPE_KEY=pk_test_...
NEXT_PUBLIC_MAPBOX_TOKEN=pk_...
FLOUCI_MERCHANT_ID=...
```

**.env (Backend)**
```
DATABASE_URL=postgresql://user:pass@localhost:5432/po_tiramisu
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key-min-32-chars
FLOUCI_API_KEY=...
FLOUCI_MERCHANT_ID=...
PAYMEE_API_KEY=...
SENTRY_DSN=...
```

### B. Commandes Setup Rapides

```bash
# Backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
python main.py

# Frontend
npm install
npm run dev

# Database
docker run -d --name postgres -e POSTGRES_PASSWORD=pass -p 5432:5432 postgres:15
docker run -d --name redis -p 6379:6379 redis:7
```

### C. Clés Métriques de Succès

| Métrique | Target |
|----------|--------|
| Uptime | 99.5%+ |
| API latency | <200ms |
| Page load | <2s |
| Conversion rate | 35%+ |
| Customer satisfaction | 4.5/5+ |
| Orders/day | 50+ (dans 3 mois) |

---

**Version 2.0 - Juin 2026**  
**Ready for Development**  
**Contact: dev@hitechtn.tn**
