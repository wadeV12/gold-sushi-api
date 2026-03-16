#!/bin/bash

# Server monitoring script
# Usage: ./monitor.sh [check|logs|stats|health]

set -e

COMMAND=${1:-check}
COMPOSE_FILE="docker-compose.prod.yml"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if running in production directory
if [ ! -f "$COMPOSE_FILE" ]; then
    COMPOSE_FILE="docker-compose.yml"
fi

case "$COMMAND" in
    check)
        echo -e "${GREEN}📊 System Status Check${NC}"
        echo ""

        echo -e "${YELLOW}Container Status:${NC}"
        docker-compose -f $COMPOSE_FILE ps
        echo ""

        echo -e "${YELLOW}Disk Usage:${NC}"
        df -h | grep -E '^/dev/|Filesystem'
        echo ""

        echo -e "${YELLOW}Memory Usage:${NC}"
        free -h
        echo ""

        echo -e "${YELLOW}Docker Stats:${NC}"
        docker stats --no-stream
        echo ""

        echo -e "${YELLOW}Health Check:${NC}"
        curl -s http://localhost:4200/api/health | python3 -m json.tool || echo "Health check failed"
        ;;

    logs)
        SERVICE=${2:-app}
        LINES=${3:-100}
        echo -e "${GREEN}📝 Viewing logs for $SERVICE (last $LINES lines)${NC}"
        docker-compose -f $COMPOSE_FILE logs --tail=$LINES -f $SERVICE
        ;;

    stats)
        echo -e "${GREEN}📈 Real-time Container Stats${NC}"
        docker stats
        ;;

    health)
        echo -e "${GREEN}🏥 Health Check${NC}"

        # Check if containers are running
        RUNNING=$(docker-compose -f $COMPOSE_FILE ps -q | wc -l)
        echo -e "Running containers: ${GREEN}$RUNNING${NC}"

        # Check application health
        if curl -sf http://localhost:4200/api/health > /dev/null; then
            echo -e "Application health: ${GREEN}✓ OK${NC}"
            curl -s http://localhost:4200/api/health | python3 -m json.tool
        else
            echo -e "Application health: ${RED}✗ FAILED${NC}"
        fi

        # Check database (if local)
        if docker-compose -f $COMPOSE_FILE ps | grep -q postgres; then
            if docker-compose -f $COMPOSE_FILE exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
                echo -e "Database health: ${GREEN}✓ OK${NC}"
            else
                echo -e "Database health: ${RED}✗ FAILED${NC}"
            fi
        fi

        # Check disk space
        DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
        if [ $DISK_USAGE -gt 80 ]; then
            echo -e "Disk usage: ${RED}$DISK_USAGE% (WARNING)${NC}"
        else
            echo -e "Disk usage: ${GREEN}$DISK_USAGE%${NC}"
        fi

        # Check memory
        MEM_AVAILABLE=$(free | grep Mem | awk '{print int($7/$2 * 100)}')
        if [ $MEM_AVAILABLE -lt 20 ]; then
            echo -e "Memory available: ${RED}$MEM_AVAILABLE% (WARNING)${NC}"
        else
            echo -e "Memory available: ${GREEN}$MEM_AVAILABLE%${NC}"
        fi
        ;;

    backup)
        echo -e "${GREEN}💾 Creating database backup${NC}"
        BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"

        if docker-compose -f $COMPOSE_FILE ps | grep -q postgres; then
            docker-compose -f $COMPOSE_FILE exec -T postgres pg_dump -U postgres goldsushi > $BACKUP_FILE
            echo -e "${GREEN}Backup created: $BACKUP_FILE${NC}"
            echo -e "Size: $(du -h $BACKUP_FILE | cut -f1)"
        else
            echo -e "${YELLOW}No local database found. Skipping backup.${NC}"
        fi
        ;;

    errors)
        LINES=${2:-50}
        echo -e "${RED}🔥 Recent Errors (last $LINES)${NC}"
        docker-compose -f $COMPOSE_FILE logs --tail=1000 | grep -i error | tail -n $LINES
        ;;

    clean)
        echo -e "${YELLOW}🧹 Cleaning up Docker resources${NC}"
        echo "Removing stopped containers..."
        docker container prune -f
        echo "Removing unused images..."
        docker image prune -f
        echo "Removing unused volumes..."
        docker volume prune -f
        echo "Removing unused networks..."
        docker network prune -f
        echo -e "${GREEN}Cleanup complete!${NC}"
        ;;

    *)
        echo "GoldSushi Monitoring Tool"
        echo ""
        echo "Usage: $0 [command] [options]"
        echo ""
        echo "Commands:"
        echo "  check              - Full system status check"
        echo "  logs [service]     - View logs (default: app)"
        echo "  stats              - Real-time container stats"
        echo "  health             - Health check all services"
        echo "  backup             - Create database backup"
        echo "  errors [lines]     - Show recent errors"
        echo "  clean              - Clean up Docker resources"
        echo ""
        echo "Examples:"
        echo "  $0 check                    # Full status check"
        echo "  $0 logs app                 # View app logs"
        echo "  $0 logs nginx 200           # View last 200 nginx logs"
        echo "  $0 errors 100               # Show last 100 errors"
        ;;
esac

