from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from .limiter import limiter
import logging
import time

try:
    import sentry_sdk
    from sentry_sdk.integrations.fastapi import FastApiIntegration
except ImportError:
    sentry_sdk = None

from .config import get_settings
from .database import engine, Base, SessionLocal
from .seeds import seed_database
from .redis_client import close_redis_client

settings = get_settings()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Po_Tiramisu API",
    description="API REST pour la plateforme e-commerce Po_Tiramisu - Tiramisus artisanaux tunisiens",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(round(process_time, 4))
    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "error_code": "INTERNAL_ERROR"},
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Po_Tiramisu API...")
    # Initialize Sentry if DSN is configured
    if sentry_sdk and settings.SENTRY_DSN:
        sentry_sdk.init(
            dsn=settings.SENTRY_DSN,
            integrations=[FastApiIntegration()],
            traces_sample_rate=0.1,
            environment=settings.ENVIRONMENT,
        )
        logger.info("Sentry error tracking initialized.")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    logger.info("Database initialized and seeded.")
    yield
    await close_redis_client()
    logger.info("Shutting down Po_Tiramisu API...")


@app.get("/")
async def root():
    return {
        "name": "Po_Tiramisu API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "description": "Plateforme e-commerce de tiramisus artisanaux tunisiens",
    }


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "po-tiramisu-api"}


# Register all routers
from .routes import auth, products, cart, orders, payments, deliveries, reviews, users, admin

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(cart.router)
app.include_router(orders.router)
app.include_router(payments.router)
app.include_router(deliveries.router)
app.include_router(reviews.router)
app.include_router(users.router)
app.include_router(admin.router)
