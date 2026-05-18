-include .env
export

.PHONY: help install dev test deploy setup \
        server-install server-build server-dev server-test server-migrate server-seed server-deploy \
        ai-install ai-dev ai-lint ai-test ai-deploy

help:
	@echo ""
	@echo "EducAI Makefile"
	@echo "==============="
	@echo ""
	@echo "Combined targets:"
	@echo "  install        Install all dependencies (server + ai-server)"
	@echo "  dev            Start both dev servers in parallel (Ctrl+C to stop both)"
	@echo "  test           Run all test suites (server + ai-server)"
	@echo "  deploy         Deploy both services to Render"
	@echo "  setup          Full first-time local setup (install + migrate + seed)"
	@echo ""
	@echo "Express server targets:"
	@echo "  server-install  npm ci in server/"
	@echo "  server-build    Lint + tsc compile in server/"
	@echo "  server-dev      Start Express dev server"
	@echo "  server-test     Run Jest test suite"
	@echo "  server-migrate  Run prisma migrate deploy + prisma generate"
	@echo "  server-seed     Run scholarship and visa seed scripts"
	@echo "  server-deploy   Trigger Render deploy (requires RENDER_SERVER_SERVICE_ID)"
	@echo ""
	@echo "FastAPI server targets:"
	@echo "  ai-install      Create venv if missing, activate, pip install"
	@echo "  ai-dev          Start uvicorn dev server"
	@echo "  ai-lint         Run ruff check ."
	@echo "  ai-test         Run pytest"
	@echo "  ai-deploy       Trigger Render deploy (requires RENDER_AI_SERVICE_ID)"
	@echo ""

install: server-install ai-install

dev:
	@echo "Starting Express and FastAPI dev servers..."
	@trap 'echo "\nStopping servers..."; kill $$SERVER_PID $$AI_PID 2>/dev/null; exit 0' INT; \
	  $(MAKE) server-dev & SERVER_PID=$$!; \
	  $(MAKE) ai-dev    & AI_PID=$$!; \
	  echo "Express PID: $$SERVER_PID  |  FastAPI PID: $$AI_PID"; \
	  wait $$SERVER_PID $$AI_PID

test: server-test ai-test

deploy: server-deploy ai-deploy

setup: install server-migrate server-seed

server-install:
	cd server && npm ci

server-build:
	cd server && npm run lint && npm run build

server-dev:
	cd server && npm run dev

server-test:
	cd server && npm test

server-migrate:
	cd server && npx prisma migrate deploy && npx prisma generate

server-seed:
	cd server && npm run seed:scholarships
	cd server && npm run seed:visa

server-deploy:
	@if [ -z "$(RENDER_SERVER_SERVICE_ID)" ]; then \
	  echo "Error: RENDER_SERVER_SERVICE_ID is not set"; exit 1; \
	fi
	render deploy --service $(RENDER_SERVER_SERVICE_ID)

ai-install:
	@if [ ! -d "ai-server/.venv" ]; then \
	  echo "Creating virtual environment at ai-server/.venv..."; \
	  python3 -m venv ai-server/.venv; \
	fi
	cd ai-server && .venv/bin/pip install --upgrade pip && .venv/bin/pip install -r requirements.txt

ai-dev:
	cd ai-server && .venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload

ai-lint:
	cd ai-server && .venv/bin/ruff check .

ai-test:
	cd ai-server && .venv/bin/pytest --tb=short -q

ai-deploy:
	@if [ -z "$(RENDER_AI_SERVICE_ID)" ]; then \
	  echo "Error: RENDER_AI_SERVICE_ID is not set"; exit 1; \
	fi
	render deploy --service $(RENDER_AI_SERVICE_ID)