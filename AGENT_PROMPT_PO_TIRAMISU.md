# 🚀 AGENT PROMPT - PO_TIRAMISU 
## Full-Stack E-Commerce Platform Generation

---

## CONTEXTE

Tu vas générer un projet full-stack **production-ready** pour **Po_Tiramisu** - une plateforme de vente de tiramisus artisanaux tunisiens.

**Ton objectif:** Produire un code complet, fonctionnel et déployable en UNE génération.

**Durée estimée:** 45-60 minutes de développement
**Complexité:** Intermédiaire-Avancée  
**Stack:** Next.js 15 + FastAPI + PostgreSQL + Redis + Docker

---

## SECTION 1: SETUP & STRUCTURE

### 1.1 Créer la structure de base

```bash
po-tiramisu/
├── frontend/                    # Next.js 15 app
├── backend/                     # FastAPI app
├── docker-compose.yml
├── .github/workflows/
├── README.md
└── docs/
```

### 1.2 Frontend Setup (Next.js 15)

Crée une nouvelle app Next.js 15 avec:
- TypeScript
- App Router
- TailwindCSS
- ShadCN UI (pour les components réutilisables)

```bash
npx create-next-app@latest frontend --typescript --app
cd frontend
npm install zustand @tanstack/react-query axios zod react-hook-form
npm install -D @types/node
```

**Structure Frontend:**
```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx (accueil)
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   ├── cart/
│   │   │   └── page.tsx
│   │   ├── checkout/
│   │   │   └── page.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── account/
│   │   │   └── page.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── admin/
│   │       ├── layout.tsx
│   │       ├── page.tsx
│   │       ├── products/
│   │       ├── orders/
│   │       ├── deliveries/
│   │       └── analytics/
│   ├── components/
│   │   ├── Layout/
│   │   ├── Products/
│   │   ├── Cart/
│   │   ├── Checkout/
│   │   ├── Orders/
│   │   ├── Admin/
│   │   └── Common/
│   ├── lib/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── store.ts
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useCart.ts
│   │   └── useApi.ts
│   └── types/
│       └── index.ts
├── package.json
├── tsconfig.json
├── next.config.js
└── .env.local.example
```

### 1.3 Backend Setup (FastAPI)

Crée une nouvelle app FastAPI:

```bash
mkdir backend && cd backend
python -m venv venv
source venv/bin/activate

pip install fastapi uvicorn sqlalchemy psycopg2-binary python-dotenv pydantic pyjwt
pip install -r requirements.txt
```

**Structure Backend:**
```
backend/
├── app/
│   ├── main.py (entry point)
│   ├── config.py
│   ├── database.py
│   ├── security.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── product.py
│   │   ├── order.py
│   │   ├── delivery.py
│   │   └── payment.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── product.py
│   │   ├── order.py
│   │   ├── delivery.py
│   │   └── payment.py
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── products.py
│   │   ├── orders.py
│   │   ├── cart.py
│   │   ├── deliveries.py
│   │   ├── payments.py
│   │   ├── reviews.py
│   │   ├── users.py
│   │   └── admin.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── user_service.py
│   │   ├── product_service.py
│   │   ├── order_service.py
│   │   ├── payment_service.py
│   │   └── delivery_service.py
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── pagination.py
│   │   ├── validation.py
│   │   └── errors.py
│   └── crud/
│       ├── __init__.py
│       ├── user.py
│       ├── product.py
│       ├── order.py
│       ├── delivery.py
│       └── payment.py
├── migrations/
│   └── versions/
├── tests/
│   ├── test_auth.py
│   ├── test_products.py
│   └── test_orders.py
├── requirements.txt
├── .env.example
├── alembic.ini
├── Dockerfile
└── main.py
```

---

## SECTION 2: DATABASE & MODELS

### 2.1 Migrations Alembic

```bash
cd backend
alembic init migrations
alembic revision --autogenerate -m "Initial schema"
```

### 2.2 SQLAlchemy Models

**app/models/user.py:**
```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from ..database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(UUID(as_uuid=True), unique=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True)
    phone = Column(String(20))
    full_name = Column(String(255))
    password_hash = Column(String(255))
    avatar_url = Column(String)
    role = Column(SQLEnum('customer', 'admin', 'delivery', name='role_enum'), default='customer')
    is_active = Column(Boolean, default=True)
    email_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime)
    
    # Relationships
    addresses = relationship("Address", back_populates="user", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="user", cascade="all, delete-orphan")
```

**app/models/product.py:**
```python
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from ..database import Base

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(UUID(as_uuid=True), unique=True, default=uuid.uuid4)
    name = Column(String(255), index=True)
    slug = Column(String(255), unique=True, index=True)
    description = Column(Text)
    price_dt = Column(Float)
    cost_dt = Column(Float)
    quantity_available = Column(Integer, default=0)
    quantity_reserved = Column(Integer, default=0)
    image_url = Column(String)
    images = Column(JSON, default=[])
    category = Column(String(100), index=True)
    tags = Column(JSON, default=[])
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    order_items = relationship("OrderItem", back_populates="product")
    reviews = relationship("Review", back_populates="product", cascade="all, delete-orphan")
```

**app/models/order.py:**
```python
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Enum as SQLEnum, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from ..database import Base

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(UUID(as_uuid=True), unique=True, default=uuid.uuid4)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    status = Column(SQLEnum('pending', 'confirmed', 'preparing', 'ready', 'shipped', 'delivered', 'cancelled', name='order_status_enum'), default='pending')
    payment_status = Column(SQLEnum('pending', 'completed', 'failed', name='payment_status_enum'), default='pending')
    subtotal_dt = Column(Float)
    delivery_fee_dt = Column(Float, default=0)
    discount_dt = Column(Float, default=0)
    total_dt = Column(Float)
    delivery_address_id = Column(Integer, ForeignKey("addresses.id"))
    delivery_date = Column(DateTime)
    delivery_notes = Column(String)
    payment_method = Column(SQLEnum('flouci', 'paymee', 'cash', name='payment_method_enum'))
    payment_ref = Column(String(100))
    estimated_delivery = Column(DateTime)
    actual_delivery = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    delivery = relationship("Delivery", back_populates="order", uselist=False)
    payments = relationship("Payment", back_populates="order", cascade="all, delete-orphan")
```

**app/models/delivery.py:**
```python
from sqlalchemy import Column, Integer, Float, DateTime, Enum as SQLEnum, ForeignKey, JSON, String
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from ..database import Base

class Delivery(Base):
    __tablename__ = "deliveries"
    
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(UUID(as_uuid=True), unique=True, default=uuid.uuid4)
    order_id = Column(Integer, ForeignKey("orders.id"), unique=True)
    delivery_person_id = Column(Integer, ForeignKey("users.id"))
    status = Column(SQLEnum('pending', 'assigned', 'in_progress', 'delivered', 'failed', name='delivery_status_enum'), default='pending')
    pickup_time = Column(DateTime)
    delivery_time = Column(DateTime)
    current_latitude = Column(Float)
    current_longitude = Column(Float)
    location_history = Column(JSON, default=[])
    notes = Column(String)
    signature_url = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    order = relationship("Order", back_populates="delivery")
    delivery_person = relationship("User", foreign_keys=[delivery_person_id])
```

---

## SECTION 3: API ENDPOINTS CORE

### 3.1 Authentication Routes (app/routes/auth.py)

```python
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from datetime import timedelta

from ..schemas.user import UserCreate, UserLogin, Token
from ..services.user_service import UserService
from ..security import create_access_token, verify_password
from ..database import get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=dict)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    db_user = await UserService.get_by_email(db, user_data.email)
    if db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    
    user = await UserService.create_user(db, user_data)
    access_token = create_access_token(data={"sub": str(user.uuid)}, expires_delta=timedelta(days=1))
    
    return {
        "id": user.id,
        "uuid": str(user.uuid),
        "email": user.email,
        "full_name": user.full_name,
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/login", response_model=dict)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = await UserService.get_by_email(db, credentials.email)
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": str(user.uuid)}, expires_delta=timedelta(days=1))
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name
        }
    }
```

### 3.2 Products Routes (app/routes/products.py)

```python
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..schemas.product import ProductCreate, ProductResponse
from ..services.product_service import ProductService
from ..database import get_db

router = APIRouter(prefix="/api/products", tags=["products"])

@router.get("", response_model=dict)
async def list_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category: str = None,
    search: str = None,
    db: Session = Depends(get_db)
):
    products = await ProductService.list_products(db, skip, limit, category, search)
    total = await ProductService.count_products(db, category, search)
    
    return {
        "items": products,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.get("/{product_id_or_slug}", response_model=ProductResponse)
async def get_product(product_id_or_slug: str, db: Session = Depends(get_db)):
    product = await ProductService.get_product(db, product_id_or_slug)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("", response_model=ProductResponse)
async def create_product(
    product: ProductCreate,
    current_user: dict = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    return await ProductService.create_product(db, product)
```

### 3.3 Orders Routes (app/routes/orders.py)

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..schemas.order import OrderCreate, OrderResponse
from ..services.order_service import OrderService
from ..security import get_current_user
from ..database import get_db

router = APIRouter(prefix="/api/orders", tags=["orders"])

@router.post("", response_model=OrderResponse)
async def create_order(
    order: OrderCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return await OrderService.create_order(db, current_user["sub"], order)

@router.get("", response_model=dict)
async def list_orders(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 20
):
    orders = await OrderService.list_orders(db, current_user["sub"], skip, limit)
    total = await OrderService.count_orders(db, current_user["sub"])
    
    return {
        "items": orders,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = await OrderService.get_order(db, order_id)
    if not order or order.user_id != int(current_user["sub"]):
        raise HTTPException(status_code=404, detail="Order not found")
    return order
```

---

## SECTION 4: FRONTEND COMPONENTS

### 4.1 Product Card Component

**frontend/src/components/Products/ProductCard.tsx:**
```typescript
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/hooks/useCart';

interface Product {
  id: number;
  slug: string;
  name: string;
  price_dt: number;
  image_url: string;
  rating?: number;
  reviews_count?: number;
}

export default function ProductCard({ product }: { product: Product }) {
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = async () => {
    setIsAdding(true);
    await addToCart(product.id, 1);
    setIsAdding(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      <Link href={`/products/${product.slug}`}>
        <div className="relative h-48 w-full">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-lg font-semibold hover:text-blue-600 truncate">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between mt-2">
          <span className="text-2xl font-bold text-blue-600">
            {product.price_dt} DT
          </span>
          {product.rating && (
            <span className="text-sm text-yellow-500">
              ⭐ {product.rating} ({product.reviews_count})
            </span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isAdding ? 'Ajout...' : 'Ajouter au panier'}
        </button>
      </div>
    </div>
  );
}
```

### 4.2 Cart Context/Store (Zustand)

**frontend/src/lib/store.ts:**
```typescript
import { create } from 'zustand';

interface CartItem {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price_dt: number;
  total_price_dt: number;
}

interface CartStore {
  items: CartItem[];
  subtotal_dt: number;
  delivery_fee_dt: number;
  total_dt: number;
  
  addItem: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  applyPromo: (discount: number) => void;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  subtotal_dt: 0,
  delivery_fee_dt: 0,
  total_dt: 0,

  addItem: (productId: number, quantity: number) =>
    set((state) => ({
      items: [...state.items, { product_id: productId, quantity, unit_price_dt: 0, total_price_dt: 0, product_name: '' }],
    })),

  removeItem: (productId: number) =>
    set((state) => ({
      items: state.items.filter((item) => item.product_id !== productId),
    })),

  updateQuantity: (productId: number, quantity: number) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.product_id === productId ? { ...item, quantity } : item
      ),
    })),

  clearCart: () => set({ items: [], subtotal_dt: 0, delivery_fee_dt: 0, total_dt: 0 }),

  applyPromo: (discount: number) =>
    set((state) => ({
      total_dt: state.subtotal_dt + state.delivery_fee_dt - discount,
    })),
}));
```

### 4.3 Checkout Form

**frontend/src/components/Checkout/CheckoutForm.tsx:**
```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

const checkoutSchema = z.object({
  address_id: z.number(),
  payment_method: z.enum(['flouci', 'paymee', 'cash']),
  delivery_date: z.string(),
  notes: z.string().optional(),
});

export default function CheckoutForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(checkoutSchema),
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await api.post('/orders', data);
      
      if (data.payment_method === 'flouci') {
        window.location.href = response.data.payment_url;
      } else if (data.payment_method === 'paymee') {
        window.location.href = response.data.payment_url;
      } else {
        router.push(`/orders/${response.data.id}`);
      }
    } catch (error) {
      console.error('Erreur de commande:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Form fields */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isLoading ? 'Traitement...' : 'Confirmer & Payer'}
      </button>
    </form>
  );
}
```

---

## SECTION 5: DOCKER & DEPLOYMENT

### 5.1 docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: po_tiramisu
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres123
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://postgres:postgres123@postgres:5432/po_tiramisu
      REDIS_URL: redis://redis:6379
      SECRET_KEY: your-secret-key-min-32-chars-here
      FLOUCI_API_KEY: ${FLOUCI_API_KEY}
      FLOUCI_MERCHANT_ID: ${FLOUCI_MERCHANT_ID}
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./backend:/app
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000
    ports:
      - "3000:3000"
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm run dev

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - backend
      - frontend

volumes:
  postgres_data:
```

### 5.2 Backend Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y gcc postgresql-client

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN alembic upgrade head

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 5.3 Frontend Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

CMD ["npm", "run", "start"]
```

---

## SECTION 6: SEED DATA & TESTING

### 6.1 Seed Database

**backend/app/seeds.py:**
```python
from sqlalchemy.orm import Session
from .models import Product, User
from .security import hash_password
import asyncio

async def seed_db(db: Session):
    # Check if data already exists
    if db.query(Product).first():
        return
    
    products = [
        Product(
            name="Tiramisu Classic",
            slug="tiramisu-classic",
            description="Tiramisu traditionnel avec mascarpone frais et cacao",
            price_dt=45.00,
            cost_dt=18.00,
            quantity_available=50,
            category="tiramisu",
            image_url="https://images.unsplash.com/photo-1571877227200-a0fb08a01a09",
            tags=["classic", "signature"],
            is_active=True
        ),
        Product(
            name="Tiramisu Chocolate",
            slug="tiramisu-chocolate",
            description="Tiramisu riche en chocolat noir belge",
            price_dt=50.00,
            cost_dt=20.00,
            quantity_available=40,
            category="tiramisu",
            image_url="https://images.unsplash.com/photo-1578985545062-69928b1d9587",
            tags=["chocolate", "premium"],
            is_active=True
        ),
    ]
    
    db.add_all(products)
    db.commit()
    
    # Create admin user
    admin = User(
        email="admin@po-tiramisu.tn",
        full_name="Admin Po_Tiramisu",
        phone="+216 99 000 000",
        password_hash=hash_password("admin123"),
        role="admin",
        email_verified=True
    )
    
    db.add(admin)
    db.commit()
```

### 6.2 Basic Tests

**backend/tests/test_products.py:**
```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_products():
    response = client.get("/api/products")
    assert response.status_code == 200
    assert "items" in response.json()

def test_get_product_by_slug():
    response = client.get("/api/products/tiramisu-classic")
    assert response.status_code == 200
    assert response.json()["slug"] == "tiramisu-classic"
```

---

## SECTION 7: ENV CONFIGURATION

### 7.1 Frontend .env.local

```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=Po_Tiramisu
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

### 7.2 Backend .env

```
# Database
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/po_tiramisu
REDIS_URL=redis://localhost:6379

# Security
SECRET_KEY=your-super-secret-key-minimum-32-characters-long
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Flouci Payment
FLOUCI_API_KEY=your_flouci_api_key
FLOUCI_MERCHANT_ID=your_merchant_id
FLOUCI_API_URL=https://api.flouci.com

# Email/SMTP (optional)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Sentry (optional)
SENTRY_DSN=your_sentry_dsn

# Environment
DEBUG=False
ENVIRONMENT=production
```

---

## SECTION 8: DEPLOYMENT CHECKLIST

- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Docker images built
- [ ] All tests passing
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Admin user created
- [ ] Seed data loaded
- [ ] Flouci/Paymee configured
- [ ] Email templates configured
- [ ] Logging configured
- [ ] Monitoring setup (Sentry)
- [ ] CI/CD pipeline configured (.github/workflows)
- [ ] Documentation generated
- [ ] API docs accessible (/docs)

---

## SECTION 9: QUICK START COMMANDS

```bash
# Setup & Run
git clone <repo>
cd po-tiramisu

# Development with Docker
docker-compose up -d

# Frontend
cd frontend && npm run dev

# Backend
cd backend && source venv/bin/activate && python main.py

# Access
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Admin: http://localhost:3000/admin
- Demo Credentials:
  - Email: demo@po-tiramisu.tn
  - Password: demo123
  - Role: admin
```

---

## NOTES IMPORTANTES

1. **Sécurité**: Utilise HTTPS en production, valide tous les inputs, rate-limit les API
2. **Performance**: Utilise Redis pour les caches, indexe les DB, optimise les images
3. **Scalabilité**: Prépare-toi pour horizontale scaling (RabbitMQ pour les queues, microservices)
4. **Monitoring**: Setup Sentry pour error tracking, LogRocket pour session replay
5. **Testing**: 70%+ code coverage, test les flows critiques (paiement, livraison)
6. **Documentation**: Swagger/OpenAPI pour l'API, README complet, deployment guide

---

**Ready to Generate Full Project!** 🚀

Execute ce prompt complet pour obtenir:
✅ Structure complète du projet
✅ Toutes les models & schemas
✅ Endpoints API fonctionnels
✅ Components React complets
✅ Docker setup
✅ Tests de base
✅ Seed data
✅ Documentation
