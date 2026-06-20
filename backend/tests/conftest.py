import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db
from app.models.user import User, Address
from app.models.product import Product, Review
from app.models.order import Order, OrderItem
from app.models.delivery import Delivery
from app.models.payment import Payment, PromoCode, Notification
from app.security import hash_password, create_access_token


TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


# Override get_current_user to return a test user (avoids UUID type mismatch with SQLite)
from app.security import get_current_user as _real_get_current_user
from app.models.user import User as UserModel

_test_user_ref = None


async def override_get_current_user():
    if _test_user_ref is None:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return _test_user_ref


app.dependency_overrides[_real_get_current_user] = override_get_current_user


@pytest.fixture(autouse=True)
def _clear_cart_state():
    """Clear the in-memory cart store and user ref between tests."""
    global _test_user_ref
    _test_user_ref = None
    from app.routes.cart import _user_carts
    _user_carts.clear()
    yield
    _test_user_ref = None
    _user_carts.clear()


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    return TestClient(app)


@pytest.fixture(scope="function")
def test_user(db_session):
    global _test_user_ref
    user = User(
        email="test@example.com",
        full_name="Test User",
        phone="+216 99 000 000",
        password_hash=hash_password("testpass123"),
        role="customer",
        is_active=True,
        email_verified=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    _test_user_ref = user
    return user


@pytest.fixture(scope="function")
def test_admin(db_session):
    user = User(
        email="admin@example.com",
        full_name="Test Admin",
        phone="+216 99 000 001",
        password_hash=hash_password("adminpass123"),
        role="admin",
        is_active=True,
        email_verified=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture(scope="function")
def test_product(db_session):
    product = Product(
        name="Tiramisu Classic",
        slug="tiramisu-classic",
        description="Delicious tiramisu",
        price_dt=45.00,
        cost_dt=18.00,
        quantity_available=50,
        category="tiramisu",
        image_url="https://example.com/tiramisu.jpg",
        tags=["classic", "signature"],
        is_active=True,
    )
    db_session.add(product)
    db_session.commit()
    db_session.refresh(product)
    return product


@pytest.fixture(scope="function")
def test_product_2(db_session):
    product = Product(
        name="Tiramisu Chocolate",
        slug="tiramisu-chocolate",
        description="Chocolate tiramisu",
        price_dt=50.00,
        cost_dt=20.00,
        quantity_available=30,
        category="tiramisu",
        image_url="https://example.com/chocolate.jpg",
        tags=["chocolate"],
        is_active=True,
    )
    db_session.add(product)
    db_session.commit()
    db_session.refresh(product)
    return product


@pytest.fixture(scope="function")
def inactive_product(db_session):
    product = Product(
        name="Inactive Product",
        slug="inactive-product",
        description="This is inactive",
        price_dt=25.00,
        quantity_available=10,
        category="tiramisu",
        is_active=False,
    )
    db_session.add(product)
    db_session.commit()
    db_session.refresh(product)
    return product


@pytest.fixture(scope="function")
def test_address(db_session, test_user):
    address = Address(
        user_id=test_user.id,
        label="Domicile",
        street="Rue Mohamed Ali",
        city="Tunis",
        postal_code="2000",
        governorate="Tunis",
        country="Tunisia",
        is_default=True,
    )
    db_session.add(address)
    db_session.commit()
    db_session.refresh(address)
    return address


@pytest.fixture(scope="function")
def valid_promo(db_session):
    from datetime import datetime, timedelta, timezone
    now = datetime.now(timezone.utc)
    promo = PromoCode(
        code="TESTPROMO",
        discount_percent=10,
        valid_from=now - timedelta(days=1),
        valid_until=now + timedelta(days=30),
        max_uses=100,
        uses_count=0,
        min_order_dt=20,
        is_active=True,
    )
    db_session.add(promo)
    db_session.commit()
    db_session.refresh(promo)
    return promo


@pytest.fixture(scope="function")
def expired_promo(db_session):
    from datetime import datetime, timedelta, timezone
    now = datetime.now(timezone.utc)
    promo = PromoCode(
        code="EXPIRED",
        discount_percent=15,
        valid_from=now - timedelta(days=60),
        valid_until=now - timedelta(days=30),
        max_uses=100,
        uses_count=0,
        is_active=True,
    )
    db_session.add(promo)
    db_session.commit()
    db_session.refresh(promo)
    return promo



