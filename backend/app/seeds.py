from sqlalchemy.orm import Session
from .models import Product, User, PromoCode
from .security import hash_password


def seed_database(db: Session):
    """Seed the database with initial data if empty."""

    # Check if data already exists
    if db.query(Product).first():
        return

    # ---- Products ----
    products = [
        Product(
            name="Tiramisu Classic",
            slug="tiramisu-classic",
            description="Tiramisu traditionnel avec mascarpone frais importé d'Italie, café espresso tunisien et cacaoamer. Chaque bouchée est une explosion de saveurs authentiques.",
            price_dt=45.00,
            cost_dt=18.00,
            quantity_available=50,
            category="tiramisu",
            image_url="https://images.unsplash.com/photo-1571877227200-a0fb08a01a09?w=800",
            images=[
                "https://images.unsplash.com/photo-1571877227200-a0fb08a01a09?w=800",
                "https://images.unsplash.com/photo-1571877227200-a0fb08a01a09?w=400",
            ],
            tags=["classic", "signature", "bestseller"],
            is_active=True,
        ),
        Product(
            name="Tiramisu Chocolate",
            slug="tiramisu-chocolate",
            description="Tiramisu riche au chocolat noir belge 70%, avec une crème onctueuse et une touche de framboise fraîche.",
            price_dt=50.00,
            cost_dt=20.00,
            quantity_available=40,
            category="tiramisu",
            image_url="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800",
            images=[
                "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800",
            ],
            tags=["chocolate", "premium"],
            is_active=True,
        ),
        Product(
            name="Tiramisu Fruit",
            slug="tiramisu-fruit",
            description="Tiramisu fruité de saison avec fraises, mangues et passion, sur un lit de biscuits imbibés de thé Earl Grey.",
            price_dt=55.00,
            cost_dt=22.00,
            quantity_available=30,
            category="tiramisu",
            image_url="https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800",
            images=[
                "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800",
            ],
            tags=["fruit", "summer", "fresh"],
            is_active=True,
        ),
        Product(
            name="Tiramisu Mini",
            slug="tiramisu-mini",
            description="La version individuelle du tiramisu classique. Parfaite pour une dégustation solo ou pour offrir.",
            price_dt=15.00,
            cost_dt=6.00,
            quantity_available=100,
            category="tiramisu",
            image_url="https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?w=800",
            images=[
                "https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?w=800",
            ],
            tags=["mini", "single", "gift"],
            is_active=True,
        ),
        Product(
            name="Tiramisu Deluxe Pack",
            slug="tiramisu-deluxe-pack",
            description="Le coffret premium avec 8 portions de tiramisu dans 4 saveurs différentes. Idéal pour les fêtes et événements.",
            price_dt=85.00,
            cost_dt=35.00,
            quantity_available=20,
            category="coffret",
            image_url="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800",
            images=[
                "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800",
            ],
            tags=["deluxe", "pack", "gift", "premium"],
            is_active=True,
        ),
        Product(
            name="Tiramisu Pistache",
            slug="tiramisu-pistache",
            description="Tiramisu à la pistache de Bronte, avec une crème verdâtre parfumée et éclats de pistaches grillées.",
            price_dt=52.00,
            cost_dt=21.00,
            quantity_available=25,
            category="tiramisu",
            image_url="https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800",
            images=[
                "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800",
            ],
            tags=["pistachio", "premium", "new"],
            is_active=True,
        ),
    ]

    db.add_all(products)

    # ---- Admin User ----
    admin = User(
        email="admin@po-tiramisu.tn",
        full_name="Admin Po_Tiramisu",
        phone="+216 99 000 000",
        password_hash=hash_password("admin123"),
        role="admin",
        email_verified=True,
        is_active=True,
    )
    db.add(admin)

    # ---- Demo Customer ----
    demo_customer = User(
        email="demo@po-tiramisu.tn",
        full_name="Client Démo",
        phone="+216 98 111 222",
        password_hash=hash_password("demo123"),
        role="customer",
        email_verified=True,
        is_active=True,
    )
    db.add(demo_customer)

    # ---- Promo Codes ----
    from datetime import datetime, timedelta, timezone

    now = datetime.now(timezone.utc)
    promos = [
        PromoCode(
            code="BIENVENUE10",
            discount_percent=10,
            valid_from=now,
            valid_until=now + timedelta(days=90),
            max_uses=100,
            min_order_dt=30,
            is_active=True,
        ),
        PromoCode(
            code="WELCOME",
            discount_fixed_dt=5,
            valid_from=now,
            valid_until=now + timedelta(days=60),
            max_uses=200,
            min_order_dt=25,
            is_active=True,
        ),
        PromoCode(
            code="SUMMER2026",
            discount_percent=15,
            valid_from=now,
            valid_until=now + timedelta(days=90),
            max_uses=50,
            min_order_dt=50,
            is_active=True,
        ),
    ]
    db.add_all(promos)

    db.commit()
    print("Database seeded successfully!")
