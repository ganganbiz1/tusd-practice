.PHONY: help build up down logs restart clean frontend-dev backend-dev minio-dev \
		frontend-install backend-install frontend-build backend-build health status

# Default shell
SHELL := /bin/bash

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m

# Help command
help:
	@echo "$(BLUE)╔═══════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║         TUSD - TUS File Upload Manager                    ║$(NC)"
	@echo "$(BLUE)║                    Makefile Targets                        ║$(NC)"
	@echo "$(BLUE)╚═══════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(GREEN)Docker Compose Targets:$(NC)"
	@echo "  $(YELLOW)make up$(NC)           - Start all services with Docker Compose"
	@echo "  $(YELLOW)make down$(NC)         - Stop all services"
	@echo "  $(YELLOW)make restart$(NC)      - Restart all services"
	@echo "  $(YELLOW)make build$(NC)        - Build Docker images"
	@echo "  $(YELLOW)make logs$(NC)         - Show real-time logs from all services"
	@echo "  $(YELLOW)make status$(NC)       - Show status of all services"
	@echo "  $(YELLOW)make health$(NC)       - Check health of all services"
	@echo ""
	@echo "$(GREEN)Development Targets:$(NC)"
	@echo "  $(YELLOW)make frontend-dev$(NC) - Start frontend development server"
	@echo "  $(YELLOW)make backend-dev$(NC)  - Start backend development server"
	@echo "  $(YELLOW)make minio-dev$(NC)    - Start only Minio service"
	@echo ""
	@echo "$(GREEN)Setup Targets:$(NC)"
	@echo "  $(YELLOW)make frontend-install$(NC) - Install frontend dependencies"
	@echo "  $(YELLOW)make backend-install$(NC)  - Download Go dependencies"
	@echo "  $(YELLOW)make frontend-build$(NC)   - Build frontend for production"
	@echo "  $(YELLOW)make backend-build$(NC)    - Build backend binary"
	@echo ""
	@echo "$(GREEN)Cleanup Targets:$(NC)"
	@echo "  $(YELLOW)make clean$(NC)        - Remove all Docker containers and volumes"
	@echo "  $(YELLOW)make clean-frontend$(NC) - Clean frontend build artifacts"
	@echo "  $(YELLOW)make clean-backend$(NC)  - Clean backend binary"
	@echo ""

# Docker Compose targets
up:
	@echo "$(BLUE)▶ Starting all services with Docker Compose...$(NC)"
	docker-compose up --build

up-d:
	@echo "$(BLUE)▶ Starting all services in background...$(NC)"
	docker-compose up -d --build
	@echo "$(GREEN)✓ Services started$(NC)"
	@sleep 3
	@make status

down:
	@echo "$(BLUE)▶ Stopping all services...$(NC)"
	docker-compose down
	@echo "$(GREEN)✓ Services stopped$(NC)"

restart:
	@echo "$(BLUE)▶ Restarting all services...$(NC)"
	docker-compose restart
	@echo "$(GREEN)✓ Services restarted$(NC)"

build:
	@echo "$(BLUE)▶ Building Docker images...$(NC)"
	docker-compose build

logs:
	@echo "$(BLUE)▶ Showing real-time logs (Ctrl+C to exit)...$(NC)"
	docker-compose logs -f

logs-backend:
	@echo "$(BLUE)▶ Showing backend logs...$(NC)"
	docker-compose logs -f backend

logs-frontend:
	@echo "$(BLUE)▶ Showing frontend logs...$(NC)"
	docker-compose logs -f frontend

logs-minio:
	@echo "$(BLUE)▶ Showing Minio logs...$(NC)"
	docker-compose logs -f minio

status:
	@echo "$(BLUE)▶ Service Status:$(NC)"
	@docker-compose ps

health:
	@echo "$(BLUE)▶ Checking service health...$(NC)"
	@echo ""
	@echo "Frontend (http://localhost:3000):"
	@curl -s -o /dev/null -w "  Status: %{http_code}\n" http://localhost:3000 || echo "  Status: Not responding"
	@echo ""
	@echo "Backend (http://localhost:8080/health):"
	@curl -s -X GET http://localhost:8080/health | jq '.' || echo "  Status: Not responding"
	@echo ""
	@echo "Minio (http://localhost:9000):"
	@curl -s -o /dev/null -w "  Status: %{http_code}\n" http://localhost:9000 || echo "  Status: Not responding"
	@echo ""

# Local development targets
frontend-install:
	@echo "$(BLUE)▶ Installing frontend dependencies...$(NC)"
	cd frontend && npm install
	@echo "$(GREEN)✓ Frontend dependencies installed$(NC)"

frontend-dev: frontend-install
	@echo "$(BLUE)▶ Starting frontend development server...$(NC)"
	@echo "$(YELLOW)Opening browser at http://localhost:3000$(NC)"
	cd frontend && npm run dev

frontend-build:
	@echo "$(BLUE)▶ Building frontend for production...$(NC)"
	cd frontend && npm run build
	@echo "$(GREEN)✓ Frontend build complete$(NC)"

backend-install:
	@echo "$(BLUE)▶ Downloading Go dependencies...$(NC)"
	cd backend && go mod download
	@echo "$(GREEN)✓ Backend dependencies downloaded$(NC)"

backend-dev: backend-install
	@echo "$(BLUE)▶ Starting backend development server...$(NC)"
	@echo "$(YELLOW)Note: Make sure Minio is running with 'make minio-dev'$(NC)"
	@echo "$(YELLOW)Backend will be available at http://localhost:8080$(NC)"
	cd backend && go run main.go

backend-build:
	@echo "$(BLUE)▶ Building backend binary...$(NC)"
	cd backend && CGO_ENABLED=0 GOOS=linux go build -o backend main.go
	@echo "$(GREEN)✓ Backend binary created at backend/backend$(NC)"

minio-dev:
	@echo "$(BLUE)▶ Starting Minio service only...$(NC)"
	@echo "$(YELLOW)Minio Console will be available at http://localhost:9001$(NC)"
	@echo "$(YELLOW)Credentials: minioadmin / minioadmin$(NC)"
	docker-compose up minio

# Cleanup targets
clean:
	@echo "$(BLUE)▶ Cleaning up Docker Compose...$(NC)"
	docker-compose down -v
	@echo "$(BLUE)▶ Removing all containers and volumes...$(NC)"
	@make clean-frontend
	@make clean-backend
	@echo "$(GREEN)✓ Cleanup complete$(NC)"

clean-frontend:
	@echo "$(BLUE)▶ Cleaning frontend artifacts...$(NC)"
	cd frontend && rm -rf node_modules .next out build .env.local
	@echo "$(GREEN)✓ Frontend cleaned$(NC)"

clean-backend:
	@echo "$(BLUE)▶ Cleaning backend artifacts...$(NC)"
	cd backend && rm -f backend
	@echo "$(GREEN)✓ Backend cleaned$(NC)"

# Utility targets
open-frontend:
	@open http://localhost:3000 || xdg-open http://localhost:3000

open-backend:
	@open http://localhost:8080 || xdg-open http://localhost:8080

open-minio:
	@open http://localhost:9001 || xdg-open http://localhost:9001

install-all: frontend-install backend-install
	@echo "$(GREEN)✓ All dependencies installed$(NC)"

# Development setup
dev-setup: install-all
	@echo "$(GREEN)✓ Development environment setup complete$(NC)"
	@echo ""
	@echo "$(BLUE)Next steps:$(NC)"
	@echo "1. Start Docker services: $(YELLOW)make up-d$(NC)"
	@echo "2. Run frontend dev:      $(YELLOW)make frontend-dev$(NC)"
	@echo "3. In another terminal:   $(YELLOW)make backend-dev$(NC)"
	@echo "4. Visit http://localhost:3000"

# Show available targets
list:
	@grep -E '^[a-zA-Z_-]+:.*' $(MAKEFILE_LIST) | grep -v '^\.' | sed 's/:.*//g' | sort
