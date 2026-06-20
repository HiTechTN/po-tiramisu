.PHONY: help dev dev-up dev-down build build-backend build-frontend build-mobile \
       release docker-build docker-build-backend docker-build-frontend \
       test test-backend test-frontend lint clean

# ──────────────────────────────────────────────
# Variables
# ──────────────────────────────────────────────
VERSION       ?= $(shell git describe --tags --always 2>/dev/null || echo "1.0.0")
COMMIT        ?= $(shell git rev-parse --short HEAD 2>/dev/null || echo "dev")
DOCKER_IMAGE  ?= po-tiramisu
DOCKER_REGISTRY ?= ghcr.io/hitechn
PLATFORM      ?= linux/amd64

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

# ──────────────────────────────────────────────
# Development
# ──────────────────────────────────────────────
dev: ## Start all services in development mode
	docker compose up --build -d
	@echo "✅ Services started!"
	@echo "   Frontend: http://localhost:3000"
	@echo "   Backend:  http://localhost:8000"
	@echo "   API Docs: http://localhost:8000/docs"

dev-down: ## Stop all development services
	docker compose down

dev-logs: ## Show logs from all services
	docker compose logs -f

dev-backend: ## Start only backend services (postgres, redis, backend)
	docker compose up postgres redis backend --build -d

dev-frontend: ## Start only frontend
	cd frontend && npm run dev

# ──────────────────────────────────────────────
# Docker Builds
# ──────────────────────────────────────────────
docker-build: docker-build-backend docker-build-frontend ## Build all Docker images

docker-build-backend: ## Build backend Docker image
	docker build -t $(DOCKER_REGISTRY)/$(DOCKER_IMAGE)-backend:$(VERSION) \
		-t $(DOCKER_REGISTRY)/$(DOCKER_IMAGE)-backend:latest \
		--build-arg VERSION=$(VERSION) \
		--build-arg COMMIT=$(COMMIT) \
		./backend

docker-build-frontend: ## Build frontend Docker image
	docker build -t $(DOCKER_REGISTRY)/$(DOCKER_IMAGE)-frontend:$(VERSION) \
		-t $(DOCKER_REGISTRY)/$(DOCKER_IMAGE)-frontend:latest \
		--build-arg VERSION=$(VERSION) \
		--build-arg COMMIT=$(COMMIT) \
		--build-arg NEXT_PUBLIC_API_URL=$(NEXT_PUBLIC_API_URL) \
		./frontend

docker-push: ## Push all Docker images to registry
	docker push $(DOCKER_REGISTRY)/$(DOCKER_IMAGE)-backend:$(VERSION)
	docker push $(DOCKER_REGISTRY)/$(DOCKER_IMAGE)-backend:latest
	docker push $(DOCKER_REGISTRY)/$(DOCKER_IMAGE)-frontend:$(VERSION)
	docker push $(DOCKER_REGISTRY)/$(DOCKER_IMAGE)-frontend:latest

# ──────────────────────────────────────────────
# Production
# ──────────────────────────────────────────────
build: build-backend build-frontend ## Build everything for production

build-backend: ## Build backend (Python wheel)
	cd backend && pip install --upgrade pip && pip install build && python -m build

build-frontend: ## Build frontend for production
	cd frontend && npm ci && npm run build

prod: ## Start production stack
	docker compose -f docker-compose.prod.yml up --build -d
	@echo "✅ Production services started!"
	@echo "   App:     http://localhost"
	@echo "   API:     http://localhost/api/"
	@echo "   API Docs: http://localhost/docs"

prod-down: ## Stop production stack
	docker compose -f docker-compose.prod.yml down

prod-logs: ## Show production logs
	docker compose -f docker-compose.prod.yml logs -f

# ──────────────────────────────────────────────
# Mobile
# ──────────────────────────────────────────────
mobile-install: ## Install Expo dependencies
	cd mobile && npm install

mobile-start: ## Start Expo dev server
	cd mobile && npx expo start

mobile-build-android: ## Build Android APK
	cd mobile && npx expo prebuild --platform android && cd android && ./gradlew assembleRelease

mobile-build-ios: ## Build iOS (requires macOS)
	cd mobile && npx expo prebuild --platform ios

# ──────────────────────────────────────────────
# Testing
# ──────────────────────────────────────────────
test: test-backend ## Run all tests

test-backend: ## Run backend tests
	cd backend && pip install -r requirements.txt && python -m pytest tests/ -v --tb=short

test-frontend: ## Run frontend lint
	cd frontend && npm run lint

lint: ## Lint all code
	cd frontend && npm run lint
	cd backend && python -m flake8 app/ --max-line-length=120 || true

# ──────────────────────────────────────────────
# Release
# ──────────────────────────────────────────────
release: ## Create a release (builds Docker + mobile APK + tags)
	@echo "🚀 Building release $(VERSION)..."
	$(MAKE) docker-build
	$(MAKE) build-backend
	$(MAKE) build-frontend
	@echo "📦 Creating GitHub release..."
	git tag -a v$(VERSION) -m "Release v$(VERSION)" || true
	git push origin v$(VERSION) || true
	gh release create v$(VERSION) \
		--title "Release v$(VERSION)" \
		--generate-notes \
		./backend/dist/* \
		./mobile/android/app/build/outputs/apk/release/*.apk
	@echo "✅ Release v$(VERSION) created!"

release-docker: docker-build docker-push ## Build and push Docker images
	@echo "✅ Docker images pushed for v$(VERSION)"

# ──────────────────────────────────────────────
# Utilities
# ──────────────────────────────────────────────
clean: ## Clean build artifacts
	rm -rf frontend/.next frontend/out backend/dist backend/build
	rm -rf mobile/android mobile/ios
	rm -rf __pycache__ backend/__pycache__ backend/app/__pycache__
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true

db-reset: ## Reset database (dev only)
	docker compose down -v
	docker compose up postgres redis -d
	@echo "✅ Database reset!"

db-seed: ## Seed database
	cd backend && python -m app.seeds
