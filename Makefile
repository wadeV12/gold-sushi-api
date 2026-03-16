.PHONY: help build build-local up down restart logs ps clean test deploy

# Colors for output
GREEN  := \033[0;32m
YELLOW := \033[1;33m
NC     := \033[0m # No Color

help: ## Show this help message
	@echo '${GREEN}GoldSushi - Docker Commands${NC}'
	@echo ''
	@echo 'Usage:'
	@echo '  ${YELLOW}make${NC} ${GREEN}<target>${NC}'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  ${YELLOW}%-15s${NC} %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build Docker image
	@echo "${GREEN}Building Docker image...${NC}"
	docker build -t goldsushi:latest .

build-local: ## Build and test locally
	@echo "${GREEN}Building and testing locally...${NC}"
	./build-local.sh

up: ## Start all services
	@echo "${GREEN}Starting all services...${NC}"
	docker-compose up -d
	@echo "${GREEN}Services started! App at http://localhost:4200${NC}"

up-prod: ## Start production services
	@echo "${GREEN}Starting production services...${NC}"
	docker-compose -f docker-compose.prod.yml up -d
	@echo "${GREEN}Production services started!${NC}"

down: ## Stop all services
	@echo "${YELLOW}Stopping all services...${NC}"
	docker-compose down

down-prod: ## Stop production services
	@echo "${YELLOW}Stopping production services...${NC}"
	docker-compose -f docker-compose.prod.yml down

restart: ## Restart all services
	@echo "${YELLOW}Restarting services...${NC}"
	docker-compose restart

logs: ## Show logs (follow mode)
	docker-compose logs -f

logs-app: ## Show app logs only
	docker-compose logs -f app

logs-prod: ## Show production logs
	docker-compose -f docker-compose.prod.yml logs -f

ps: ## Show running containers
	docker-compose ps

ps-prod: ## Show production containers
	docker-compose -f docker-compose.prod.yml ps

clean: ## Remove all containers, volumes, and images
	@echo "${YELLOW}Cleaning up Docker resources...${NC}"
	docker-compose down -v
	docker system prune -f
	@echo "${GREEN}Cleanup complete!${NC}"

clean-all: ## Deep clean including images
	@echo "${YELLOW}Deep cleaning Docker resources...${NC}"
	docker-compose down -v
	docker system prune -a -f
	@echo "${GREEN}Deep cleanup complete!${NC}"

test: ## Run tests in container
	@echo "${GREEN}Running tests...${NC}"
	docker-compose run --rm app npm run test

test-e2e: ## Run e2e tests
	@echo "${GREEN}Running e2e tests...${NC}"
	docker-compose run --rm app npm run test:e2e

shell: ## Open shell in app container
	docker-compose exec app sh

db-shell: ## Open PostgreSQL shell
	docker-compose exec postgres psql -U postgres -d goldsushi

db-backup: ## Backup database
	@echo "${GREEN}Backing up database...${NC}"
	docker-compose exec -T postgres pg_dump -U postgres goldsushi > backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "${GREEN}Backup created!${NC}"

deploy: ## Deploy to production
	@echo "${GREEN}Deploying to production...${NC}"
	./deploy.sh production

deploy-staging: ## Deploy to staging
	@echo "${GREEN}Deploying to staging...${NC}"
	./deploy.sh staging

health: ## Check health of services
	@echo "${GREEN}Checking service health...${NC}"
	@curl -f http://localhost:4200/api || echo "${YELLOW}Service not responding${NC}"

push: ## Push image to registry
	@echo "${GREEN}Pushing image to registry...${NC}"
	docker tag goldsushi:latest ${DOCKER_REGISTRY}/goldsushi:latest
	docker push ${DOCKER_REGISTRY}/goldsushi:latest

pull: ## Pull image from registry
	@echo "${GREEN}Pulling image from registry...${NC}"
	docker-compose -f docker-compose.prod.yml pull

stats: ## Show container resource usage
	docker stats

update: pull down-prod up-prod ## Update production deployment
	@echo "${GREEN}Production updated successfully!${NC}"

