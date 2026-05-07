# =============================================================================
# Lunerie · operations
# =============================================================================

SHELL := /bin/sh
COMPOSE := docker compose
COMPOSE_PROD := docker compose -f docker-compose.yml -f docker-compose.prod.yml
ENV_FILE := .env

.PHONY: help init secret up up-prod down logs ps build rebuild restart \
        backend-shell db-shell db-dump db-restore migrate seed test \
        smoke health stats scale clean prune

help: ## Show this help
	@awk 'BEGIN{FS=":.*##"; printf "\nLunerie targets:\n"} /^[a-zA-Z_-]+:.*##/ {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

init: ## Copy .env.example to .env if missing and inject a strong JWT secret
	@if [ ! -f $(ENV_FILE) ]; then cp .env.example $(ENV_FILE); fi
	@./scripts/generate-jwt-secret.sh

secret: ## Print a strong 64-char JWT secret to stdout
	@./scripts/generate-jwt-secret.sh --print

up: ## Start the dev stack (background)
	$(COMPOSE) up -d --build

up-prod: ## Start the production stack with hardening + extra exporters
	$(COMPOSE_PROD) up -d --build

down: ## Stop and remove all containers (keeps volumes)
	$(COMPOSE) down

logs: ## Tail logs of all services
	$(COMPOSE) logs -f --tail=200

ps: ## Show running containers
	$(COMPOSE) ps

build: ## Rebuild backend image
	$(COMPOSE) build backend

rebuild: ## Rebuild + restart backend
	$(COMPOSE) up -d --build backend

restart: ## Restart backend service
	$(COMPOSE) restart backend

backend-shell: ## Open a shell inside a backend container
	$(COMPOSE) exec backend sh

db-shell: ## psql shell inside the postgres container
	$(COMPOSE) exec postgres psql -U $${POSTGRES_USER:-lunerie} -d $${POSTGRES_DB:-lunerie}

db-dump: ## Dump postgres to ./backup/lunerie-YYYYmmdd.sql
	@./scripts/db-backup.sh

db-restore: ## Restore the latest dump in ./backup
	@./scripts/db-restore.sh

migrate: ## Force Flyway migrate (run inside the backend image)
	$(COMPOSE) run --rm backend java -cp /app/app.jar:/app/lib/* org.flywaydb.core.Main migrate || true

test: ## Run backend tests with Testcontainers
	cd backend && ./mvnw -B test

smoke: ## Hit /api/health and /actuator/health
	@./scripts/smoke.sh

health: ## Pretty health summary across services
	@./scripts/health.sh

stats: ## Live container resource stats (Ctrl-C to exit)
	docker stats $$($(COMPOSE) ps -q)

scale: ## Scale backend to N replicas: make scale N=3
	$(COMPOSE) up -d --scale backend=$${N:-2}

clean: ## Stop + delete all volumes (DESTRUCTIVE)
	$(COMPOSE) down -v

prune: ## Remove dangling docker images, networks, build cache
	docker system prune -f
