# 📐 GUIDE D'ARCHITECTURE - PO_TIRAMISU

---

## 1. ARCHITECTURE GLOBAL

### 1.1 Vue d'Ensemble (High Level)

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER (Browser)                       │
│  Next.js 15 App + React 19 + TypeScript + TailwindCSS          │
│  - SPA with Server-Side Rendering (SSR)                         │
│  - State Management (Zustand)                                   │
│  - Data Fetching (TanStack Query)                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓ REST JSON
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY LAYER                             │
│  Nginx Reverse Proxy                                            │
│  - Load balancing                                               │
│  - SSL/TLS termination                                          │
│  - Rate limiting                                                │
│  - CORS handling                                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTP/1.1
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND API LAYER                              │
│  FastAPI Application (Python 3.11)                              │
│  - Async/Await endpoints                                        │
│  - JWT Authentication                                           │
│  - Request validation (Pydantic)                                │
│  - Business logic (Services)                                    │
│  - Error handling & logging                                     │
└─────────────────────────────────────────────────────────────────┘
                  ↓ SQL              ↓ Cache    ↓ Webhooks
        ┌─────────────────┐  ┌──────────────┐  ┌──────────────┐
        │   PostgreSQL    │  │    Redis     │  │ Flouci/Paymee│
        │   (Primary DB)  │  │   (Cache)    │  │  (Payments)  │
        └─────────────────┘  └──────────────┘  └──────────────┘
        
        ┌──────────────────┐  ┌──────────────┐
        │ S3 / MinIO       │  │ Twilio/Email │
        │ (File Storage)   │  │ (Messaging)  │
        └──────────────────┘  └──────────────┘
```

---

## 2. FLUX DE DONNÉES CLÉS

### 2.1 Flux Utilisateur (Authentication)

```
┌──────────────────────────────────────────────────────────────┐
│ CLIENT                                                         │
├──────────────────────────────────────────────────────────────┤
│ 1. User clicks Register                                       │
│ 2. Fill form (email, password, name)                          │
│ 3. Submit to /api/auth/register                              │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ BACKEND - Auth Route                                           │
├──────────────────────────────────────────────────────────────┤
│ 1. Validate input (Zod schema)                               │
│ 2. Check email not exists                                     │
│ 3. Hash password (bcrypt)                                     │
│ 4. Create user in DB                                          │
│ 5. Generate JWT token (HS256)                                │
│ 6. Return token + user data                                   │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ CLIENT                                                         │
├──────────────────────────────────────────────────────────────┤
│ 1. Save token to localStorage                                 │
│ 2. Store user in state (Zustand)                              │
│ 3. Redirect to dashboard                                      │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 Flux Commande (Order Creation)

```
┌─────────────────────────────────────────────────────────┐
│ CLIENT: Cart → Checkout                                 │
├─────────────────────────────────────────────────────────┤
│ {                                                        │
│   "items": [                                             │
│     {"product_id": 1, "quantity": 2},                   │
│     {"product_id": 3, "quantity": 1}                    │
│   ],                                                     │
│   "address_id": 5,                                       │
│   "payment_method": "flouci",                           │
│   "delivery_date": "2026-06-22T14:00:00Z"              │
│ }                                                        │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ BACKEND: Order Service                                  │
├─────────────────────────────────────────────────────────┤
│ 1. Validate JWT token                                   │
│ 2. Get user from token                                  │
│ 3. Validate items (product exists, price)              │
│ 4. Calculate subtotal                                   │
│ 5. Calculate delivery fee (zone-based)                 │
│ 6. Apply promo if applicable                           │
│ 7. Reserve inventory (subtract from quantity_available) │
│ 8. Create order in DB (status: pending)                │
│ 9. Create order items                                   │
│ 10. Generate payment session (Flouci)                  │
│ 11. Cache order in Redis (10 min TTL)                  │
│ 12. Send email notification to user                    │
│ 13. Return order + payment URL                         │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ CLIENT: Redirect to Flouci Checkout                     │
├─────────────────────────────────────────────────────────┘
│ User enters payment details on Flouci                   │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ FLOUCI: Payment Processing                              │
├─────────────────────────────────────────────────────────┤
│ 1. Validate card                                         │
│ 2. Process payment                                       │
│ 3. Send webhook to POST /api/webhooks/flouci          │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ BACKEND: Webhook Handler                                │
├─────────────────────────────────────────────────────────┤
│ 1. Validate webhook signature                           │
│ 2. Get order from DB                                    │
│ 3. Update order status (confirmed)                      │
│ 4. Update payment status (completed)                    │
│ 5. Send SMS to admin                                    │
│ 6. Send email confirmation to user                      │
│ 7. Create delivery task                                 │
│ 8. Publish event (order:confirmed) → Redis Pub/Sub     │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ WEBSOCKET: Real-time Update (Optional)                  │
├─────────────────────────────────────────────────────────┤
│ Client receives order:confirmed event                   │
│ Update order status in real-time                        │
└─────────────────────────────────────────────────────────┘
```

### 2.3 Flux Livraison (Delivery Tracking)

```
┌──────────────────────────────────────────────────────────┐
│ ADMIN                                                     │
├──────────────────────────────────────────────────────────┤
│ 1. View pending deliveries                               │
│ 2. Assign to delivery person                             │
│ 3. PATCH /api/deliveries/{id}/assign                    │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ DELIVERY PERSON APP (Mobile)                              │
├──────────────────────────────────────────────────────────┤
│ 1. Receive notification (new delivery)                   │
│ 2. Start delivery (scan order QR)                        │
│ 3. GPS location enabled                                  │
│ 4. Every 30 seconds: POST location update               │
│    {                                                      │
│      "latitude": 36.806389,                              │
│      "longitude": 10.169444,                             │
│      "accuracy": 10,                                     │
│      "timestamp": "2026-06-22T15:45:00Z"                │
│    }                                                      │
│ 5. On arrival: Mark delivered + photo proof            │
│ 6. Send signature/receipt to customer                    │
└──────────────────────────────────────────────────────────┘
                    ↓ (Every 10 sec)
┌──────────────────────────────────────────────────────────┐
│ BACKEND: Location Service                                 │
├──────────────────────────────────────────────────────────┤
│ 1. Receive location update                              │
│ 2. Validate accuracy (> 100m = reject)                  │
│ 3. Store in delivery.location_history (JSON)            │
│ 4. Update delivery.current_latitude/longitude           │
│ 5. Calculate distance to destination                     │
│ 6. Estimate arrival time (ETA)                          │
│ 7. Publish to Redis Pub/Sub (delivery:location_update)  │
│ 8. Cache in Redis (real-time query)                     │
└──────────────────────────────────────────────────────────┘
                    ↓ (Real-time WebSocket)
┌──────────────────────────────────────────────────────────┐
│ CLIENT: Tracking Map                                      │
├──────────────────────────────────────────────────────────┤
│ 1. Subscribe to WS: /ws/delivery/{delivery_id}          │
│ 2. Receive location updates in real-time                │
│ 3. Update marker on Leaflet/Mapbox                      │
│ 4. Show ETA countdown                                    │
│ 5. Show delivery person info (name, phone)              │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ DELIVERY PERSON: Mark Delivered                           │
├──────────────────────────────────────────────────────────┤
│ 1. PATCH /api/deliveries/{id}/complete                  │
│ 2. With photo proof (POST multipart/form-data)          │
│ 3. Upload to S3/MinIO                                    │
│ 4. Send SMS to customer: "Livré!"                        │
│ 5. Notification in app                                   │
│ 6. Show rating prompt                                    │
└──────────────────────────────────────────────────────────┘
```

### 2.4 Flux Admin (Analytics & Management)

```
┌──────────────────────────────────────────────────────────┐
│ ADMIN DASHBOARD                                           │
├──────────────────────────────────────────────────────────┤
│ 1. GET /api/admin/dashboard                             │
│ 2. Backend aggregates:                                   │
│    - Last 24h revenue (SUM from orders)                 │
│    - Pending orders count                               │
│    - Top products (GROUP BY product_id)                 │
│    - Order status distribution                          │
│ 3. All queries hit Redis cache first (5min TTL)        │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ BACKEND: Analytics Service                                │
├──────────────────────────────────────────────────────────┤
│ 1. Check Redis for cached data                           │
│ 2. If cache miss:                                        │
│    a. Query PostgreSQL (SUM, COUNT, GROUP BY)           │
│    b. Process data                                       │
│    c. Store in Redis                                    │
│ 3. Return JSON response                                  │
└──────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────┐
│ FRONTEND: Chart Rendering                                │
├──────────────────────────────────────────────────────────┤
│ 1. Use Recharts library                                  │
│ 2. Plot revenue by day (30 days)                        │
│ 3. Plot orders by status (pie)                          │
│ 4. Top 5 products (bar chart)                           │
│ 5. Auto-refresh every 5 minutes (polling)               │
└──────────────────────────────────────────────────────────┘
```

---

## 3. SCHEMAS & DATA STRUCTURES

### 3.1 Request/Response Examples

#### Product Response
```json
{
  "id": 1,
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Tiramisu Classic",
  "slug": "tiramisu-classic",
  "description": "Tiramisu traditionnel avec mascarpone frais et cacao",
  "price_dt": 45.00,
  "quantity_available": 50,
  "category": "tiramisu",
  "image_url": "https://cdn.po-tiramisu.tn/products/tiramisu-classic.jpg",
  "images": [
    "https://cdn.po-tiramisu.tn/products/tiramisu-classic-1.jpg",
    "https://cdn.po-tiramisu.tn/products/tiramisu-classic-2.jpg"
  ],
  "tags": ["classic", "signature"],
  "average_rating": 4.8,
  "reviews_count": 25,
  "is_active": true,
  "created_at": "2026-01-15T00:00:00Z",
  "updated_at": "2026-06-15T00:00:00Z"
}
```

#### Order with Timeline
```json
{
  "id": 1,
  "uuid": "order-550e8400-e29b-41d4-a716-446655440000",
  "user_id": 123,
  "status": "shipped",
  "payment_status": "completed",
  "subtotal_dt": 90.00,
  "delivery_fee_dt": 5.00,
  "discount_dt": 0,
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
  "delivery_address": {
    "street": "Rue Mohamed Ali",
    "city": "Tunis",
    "postal_code": "2000",
    "governorate": "Tunis",
    "country": "Tunisia",
    "latitude": 36.8065,
    "longitude": 10.1686
  },
  "timeline": [
    {
      "status": "pending",
      "timestamp": "2026-06-20T10:30:00Z",
      "message": "Commande reçue"
    },
    {
      "status": "confirmed",
      "timestamp": "2026-06-20T10:35:00Z",
      "message": "Paiement confirmé"
    },
    {
      "status": "preparing",
      "timestamp": "2026-06-21T09:00:00Z",
      "message": "En préparation"
    },
    {
      "status": "ready",
      "timestamp": "2026-06-21T14:30:00Z",
      "message": "Prête pour la livraison"
    },
    {
      "status": "shipped",
      "timestamp": "2026-06-22T08:00:00Z",
      "message": "Expédiée"
    }
  ],
  "delivery": {
    "id": 1,
    "uuid": "delivery-550e8400",
    "status": "in_progress",
    "delivery_person": {
      "id": 456,
      "name": "Mohamed K.",
      "phone": "+216 99 123 456",
      "avatar_url": "https://..."
    },
    "current_location": {
      "latitude": 36.806389,
      "longitude": 10.169444,
      "timestamp": "2026-06-22T15:45:00Z",
      "accuracy": 10
    },
    "estimated_delivery": "2026-06-22T16:30:00Z",
    "location_history": [
      {
        "latitude": 36.806389,
        "longitude": 10.169444,
        "timestamp": "2026-06-22T15:45:00Z"
      }
    ]
  },
  "created_at": "2026-06-20T10:30:00Z",
  "updated_at": "2026-06-22T15:45:00Z"
}
```

---

## 4. CACHING STRATEGY

### 4.1 Redis Keys

```
# Products
products:all                    # Set of all product IDs
product:{id}                    # Serialized product object (1 hour TTL)
products:category:{category}    # List of product IDs in category (1 hour TTL)
products:search:{query}         # Search results cache (30 min TTL)

# User Sessions
session:{user_uuid}             # User session data (24 hours TTL)
user:{user_id}:cart             # Shopping cart (10 hours TTL)

# Orders
order:{order_id}                # Order details (24 hours TTL)
orders:user:{user_id}           # User's orders list (1 hour TTL)

# Real-time Data
delivery:{delivery_id}:location # Current delivery location (30 sec TTL)
online_users:count              # Active users count (5 min TTL)

# Rate Limiting
rate_limit:{user_id}:{endpoint} # Request counter (1 min TTL)

# Analytics
analytics:daily:{date}          # Daily stats (30 days retention)
analytics:revenue:today         # Today's revenue sum (5 min TTL)
```

### 4.2 Cache Invalidation

```python
# When product is updated
cache.invalidate(f"product:{product_id}")
cache.invalidate(f"products:category:{product.category}")
cache.invalidate("products:all")

# When order is placed
cache.invalidate(f"user:{user_id}:cart")
cache.invalidate(f"orders:user:{user_id}")

# When delivery location updates
cache.set(f"delivery:{delivery_id}:location", location_data, ttl=30)
```

---

## 5. SEQUENCE DIAGRAMS

### 5.1 Payment Flow Diagram

```
Client              Browser         Backend         Flouci
  |                   |               |              |
  |-- Click Pay ----->|               |              |
  |                   |-- POST /orders|              |
  |                   |           |               |
  |                   |           |-- Create Order --|
  |                   |           |                  |
  |                   |           |-- Init Payment --|
  |                   |           |<-- payment_url -|
  |                   |<-- Redirect|              |
  |                   |               |              |
  |<-- Redirect to Flouci checkout ---|              |
  |                   |               |              |
  |-- Enter Card Details ------------|-- Process ---|
  |                   |               |<-- Success -|
  |                   |               |              |
  |                   |               |<-- Webhook -|
  |                   |               |              |
  |                   |               |-- Update Order
  |                   |               |-- Send Email
  |                   |               |
  |                   |<-- Redirect Success --------|
  |                   |               |              |
  |<-- Order Confirmed|               |              |
  |                   |               |              |
```

---

## 6. ERROR HANDLING & STATUS CODES

### 6.1 HTTP Status Codes

```
200 OK                     - Success
201 Created                - Resource created
204 No Content             - Success, no response body
400 Bad Request            - Invalid input
401 Unauthorized           - Missing/invalid token
403 Forbidden              - User not authorized
404 Not Found              - Resource not found
409 Conflict               - Resource conflict (duplicate)
422 Unprocessable Entity   - Validation error
429 Too Many Requests      - Rate limit exceeded
500 Internal Server Error  - Server error
503 Service Unavailable    - Database/cache down
```

### 6.2 Error Response Format

```json
{
  "detail": "Product not found",
  "error_code": "PRODUCT_NOT_FOUND",
  "status_code": 404,
  "timestamp": "2026-06-20T10:30:00Z",
  "request_id": "req-550e8400-e29b-41d4"
}
```

---

## 7. SECURITY ARCHITECTURE

### 7.1 Authentication Flow

```
┌─────────────────────────────────────────┐
│ Client                                  │
├─────────────────────────────────────────┤
│ 1. POST /auth/login                     │
│ 2. Send email + password               │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│ Backend Security                        │
├─────────────────────────────────────────┤
│ 1. Hash password (bcrypt)               │
│ 2. Compare with DB hash                │
│ 3. Generate JWT token                  │
│    - Header: {"alg": "HS256"}          │
│    - Payload: {"sub": user_id, "exp"}  │
│    - Signature: HMAC-SHA256            │
│ 4. Return token + refresh token        │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│ Client                                  │
├─────────────────────────────────────────┤
│ 1. Store in localStorage                │
│ 2. Add to Authorization header:        │
│    "Authorization: Bearer {token}"     │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│ Each Request                            │
├─────────────────────────────────────────┤
│ 1. Backend receives token               │
│ 2. Verify signature (SECRET_KEY)       │
│ 3. Check expiration                    │
│ 4. Extract user_id from payload        │
│ 5. Verify user exists & is_active      │
│ 6. Grant access or deny                │
└─────────────────────────────────────────┘
```

### 7.2 Security Practices

```
✓ HTTPS/TLS enabled (all endpoints)
✓ Passwords hashed with bcrypt (cost=12)
✓ JWT with 24 hour expiration
✓ Refresh token rotation
✓ CORS restricted to domain
✓ Rate limiting (100 req/minute per IP)
✓ SQL injection prevention (SQLAlchemy ORM)
✓ XSS prevention (JSON responses, CSP headers)
✓ CSRF protection (SameSite cookies)
✓ Input validation (Pydantic schemas)
✓ Admin routes require admin role
✓ User can only access their own data
✓ Sensitive data encrypted in transit
✓ Environment variables for secrets
✓ No hardcoded credentials
✓ Webhook signature verification
✓ API keys stored hashed in DB
```

---

## 8. PERFORMANCE OPTIMIZATION

### 8.1 Database Query Optimization

```sql
-- BAD: N+1 query problem
SELECT * FROM orders WHERE user_id = 1;
-- For each order:
SELECT * FROM order_items WHERE order_id = ?;

-- GOOD: Join and eager load
SELECT o.*, oi.*, p.* 
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN products p ON oi.product_id = p.id
WHERE o.user_id = 1;

-- INDEX optimization
CREATE INDEX idx_orders_user_created ON orders(user_id, created_at DESC);
CREATE INDEX idx_order_items_order ON order_items(order_id);
```

### 8.2 Frontend Performance

```
✓ Code splitting (Next.js dynamic imports)
✓ Image optimization (Next.js Image component)
✓ Lazy loading (Intersection Observer)
✓ Virtual scrolling (for long lists)
✓ API response caching (TanStack Query)
✓ State normalization (prevent unnecessary re-renders)
✓ Memoization (React.memo, useMemo)
✓ Bundle size monitoring (Bundle Analyzer)
✓ CDN for static assets
✓ Gzip compression
✓ Service Workers for offline capability
```

---

## 9. DEPLOYMENT ARCHITECTURE

### 9.1 Production Deployment

```
        ┌─────────────────────────────────────┐
        │      Cloudflare CDN                 │
        │   (DDoS protection, Cache)          │
        └────────────┬────────────────────────┘
                     │
        ┌────────────▼────────────────────────┐
        │   Load Balancer / Nginx             │
        │   (SSL termination, routing)        │
        └────────────┬────────────────────────┘
         ┌──────────┴──────────┐
         │                     │
    ┌────▼────┐          ┌────▼────┐
    │ Frontend │          │ Backend  │
    │(Vercel) │          │(Railway) │
    ├─────────┤          ├──────────┤
    │ Next.js │          │ FastAPI  │
    │ App     │          │ Instance │
    │ Server  │          │ 1        │
    └────┬────┘          └────┬─────┘
         │                    │
         └────────┬───────────┘
                  │
        ┌─────────▼──────────────┐
        │  PostgreSQL Managed    │
        │  (AWS RDS / Supabase)  │
        │  - Automated backups   │
        │  - Replication         │
        │  - Failover            │
        └─────────┬──────────────┘
                  │
        ┌─────────▼──────────────┐
        │  Redis Managed         │
        │  (AWS ElastiCache)     │
        │  - Cluster mode        │
        │  - Persistence         │
        └────────────────────────┘
```

### 9.2 CI/CD Pipeline

```
Code Push to main branch
         ↓
GitHub Actions Triggered
         ↓
1. Run Tests
   - Backend tests (pytest)
   - Frontend tests (Jest)
   - Integration tests
         ↓
2. Build Images
   - Docker build backend
   - Docker push to registry
   - Next.js build frontend
         ↓
3. Deploy to Staging
   - Backend deploy to staging
   - Frontend deploy to vercel
   - Run smoke tests
         ↓
4. Manual Approval
   - Team review
   - Check staging
         ↓
5. Deploy to Production
   - Gradual rollout (canary)
   - Health checks
   - Monitoring alerts
         ↓
6. Post-Deploy
   - Database migrations
   - Cache warmup
   - Smoke tests
   - Notification to team
```

---

## 10. MONITORING & LOGGING

### 10.1 Metrics to Monitor

```
Performance:
- API latency (p50, p95, p99)
- Page load time
- Database query time
- Cache hit rate

Business:
- Orders per hour
- Revenue per day
- Conversion rate
- Customer satisfaction

System:
- CPU usage
- Memory usage
- Disk space
- Network bandwidth

Errors:
- 4xx errors count
- 5xx errors count
- Error rate by endpoint
- Error rate by user
```

### 10.2 Logging Strategy

```
Level    Usage
------   ----
DEBUG    Development only
INFO     Business events (order placed, payment confirmed)
WARNING  Recoverable errors (failed payment retry)
ERROR    Application errors (database connection failed)
CRITICAL Critical system errors (complete service down)

Format:
{
  "timestamp": "2026-06-20T10:30:00Z",
  "level": "ERROR",
  "service": "order-service",
  "message": "Failed to create order",
  "user_id": 123,
  "order_id": 456,
  "error": "Inventory insufficient",
  "request_id": "req-550e8400",
  "stack_trace": "..."
}

Platforms:
- Development: stdout
- Staging/Production: ELK Stack (Elasticsearch, Logstash, Kibana)
- Error Tracking: Sentry
- APM: DataDog / New Relic
```

---

## CONCLUSION

Cette architecture est:
✅ **Scalable** - Horizontal scaling pour API & Frontend
✅ **Maintainable** - Code séparé en layers (routes, services, models)
✅ **Testable** - Chaque service peut être testé indépendamment
✅ **Secure** - JWT, HTTPS, input validation, rate limiting
✅ **Observable** - Logs, metrics, traces pour troubleshooting
✅ **Performant** - Caching, indexes, async operations

La plateforme peut gérer 1000+ commandes/jour avec cette architecture.
