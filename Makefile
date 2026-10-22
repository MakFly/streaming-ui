# Streaming UI: dev local, vérifications et déploiement en production.
# `make` ou `make help` liste les cibles par section.

SHELL := /bin/sh
.DEFAULT_GOAL := help

# ─── Configuration ───────────────────────────────────────────────────────────

# Premier port essayé en dev, puis les suivants jusqu'à DEV_PORT_MAX.
DEV_PORT     ?= 5173
DEV_PORT_MAX ?= 5199
DEV_HOST     ?= 127.0.0.1
# Secondes d'attente de la première réponse HTTP du serveur de dev.
DEV_WAIT     ?= 30

PROD_URL     := https://streaming-ui.pulseview.app
# Paths produits par `bun run registry:build`.
REGISTRY_PATHS := registry.json registry public/r

STATE    := .make
PID_FILE := $(STATE)/dev.pid
PORT_FILE:= $(STATE)/dev.port
LOG_FILE := $(STATE)/dev.log

C_SECTION := \033[1;33m
C_TARGET  := \033[36m
C_OK      := \033[32m
C_WARN    := \033[33m
C_ERR     := \033[31m
C_RESET   := \033[0m

# Un port est pris s'il a un listener TCP (lsof) OU s'il répond en HTTP (curl
# sort en 0 sur n'importe quelle réponse, en erreur sur « connection refused »).
# Le test HTTP couvre un listener que lsof ne voit pas (autre utilisateur,
# conteneur Docker qui publie le port).
PORT_BUSY = { lsof -nP -iTCP:$$p -sTCP:LISTEN >/dev/null 2>&1 || curl -s -o /dev/null -m 1 http://$(DEV_HOST):$$p/; }

# ─── Help ────────────────────────────────────────────────────────────────────

.PHONY: help
help: ## Liste les cibles, par section
	@awk 'BEGIN { FS = ":.*## " } \
	  /^# ─── / { s = $$0; sub(/^# ─── /, "", s); sub(/ ─.*$$/, "", s); if (s != "Configuration") printf "\n$(C_SECTION)%s$(C_RESET)\n", s; next } \
	  /^[a-zA-Z0-9_-]+:.*## / { printf "  $(C_TARGET)%-14s$(C_RESET) %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@echo

# ─── Install ─────────────────────────────────────────────────────────────────

.PHONY: install
install: ## Installe les dépendances (bun.lock figé)
	@bun install --frozen-lockfile

# ─── Dev server ──────────────────────────────────────────────────────────────

.PHONY: dev
dev: ## Lance Vite en arrière-plan sur le premier port libre à partir de DEV_PORT
	@mkdir -p $(STATE)
	@if [ -f $(PID_FILE) ] && kill -0 "$$(cat $(PID_FILE))" 2>/dev/null; then \
	  printf "$(C_WARN)[make] déjà lancé : http://localhost:%s (pid %s). « make stop » pour couper.$(C_RESET)\n" "$$(cat $(PORT_FILE))" "$$(cat $(PID_FILE))"; \
	  exit 0; \
	fi; \
	[ -d node_modules ] || bun install --frozen-lockfile || exit 1; \
	p=$(DEV_PORT); \
	while $(PORT_BUSY); do \
	  printf "$(C_WARN)[make] port %s occupé, essai du suivant$(C_RESET)\n" "$$p"; \
	  p=$$((p + 1)); \
	  if [ $$p -gt $(DEV_PORT_MAX) ]; then \
	    printf "$(C_ERR)[make] aucun port libre entre $(DEV_PORT) et $(DEV_PORT_MAX)$(C_RESET)\n"; exit 1; \
	  fi; \
	done; \
	nohup bun run dev --host $(DEV_HOST) --port $$p --strictPort > $(LOG_FILE) 2>&1 & \
	echo $$! > $(PID_FILE); echo $$p > $(PORT_FILE); \
	i=0; \
	until curl -s -o /dev/null -m 1 http://$(DEV_HOST):$$p/; do \
	  if ! kill -0 "$$(cat $(PID_FILE))" 2>/dev/null; then \
	    printf "$(C_ERR)[make] le serveur s'est arrêté au démarrage. Fin de $(LOG_FILE) :$(C_RESET)\n"; \
	    tail -n 20 $(LOG_FILE); rm -f $(PID_FILE) $(PORT_FILE); exit 1; \
	  fi; \
	  i=$$((i + 1)); \
	  if [ $$i -ge $(DEV_WAIT) ]; then \
	    printf "$(C_ERR)[make] pas de réponse HTTP après $(DEV_WAIT)s, voir $(LOG_FILE)$(C_RESET)\n"; exit 1; \
	  fi; \
	  sleep 1; \
	done; \
	printf "$(C_OK)[make] dev prêt : http://localhost:%s (pid %s, logs : make logs)$(C_RESET)\n" "$$p" "$$(cat $(PID_FILE))"

.PHONY: stop
stop: ## Coupe le serveur de dev lancé par « make dev »
	@if [ ! -f $(PORT_FILE) ]; then \
	  printf "$(C_WARN)[make] aucun serveur de dev enregistré$(C_RESET)\n"; exit 0; \
	fi; \
	p=$$(cat $(PORT_FILE)); pid=$$(cat $(PID_FILE) 2>/dev/null); \
	[ -n "$$pid" ] && kill "$$pid" 2>/dev/null; \
	pids=$$(lsof -nP -tiTCP:$$p -sTCP:LISTEN 2>/dev/null); \
	[ -n "$$pids" ] && kill $$pids 2>/dev/null; \
	i=0; \
	while $(PORT_BUSY); do \
	  i=$$((i + 1)); \
	  if [ $$i -ge 10 ]; then \
	    printf "$(C_ERR)[make] le port %s répond encore : processus hors de portée (autre utilisateur ou conteneur ?)$(C_RESET)\n" "$$p"; exit 1; \
	  fi; \
	  sleep 1; \
	done; \
	rm -f $(PID_FILE) $(PORT_FILE); \
	printf "$(C_OK)[make] serveur de dev coupé, port %s libre$(C_RESET)\n" "$$p"

.PHONY: status
status: ## Dit si le serveur de dev tourne, et sur quel port
	@if [ -f $(PID_FILE) ] && kill -0 "$$(cat $(PID_FILE))" 2>/dev/null; then \
	  printf "$(C_OK)[make] lancé : http://localhost:%s (pid %s)$(C_RESET)\n" "$$(cat $(PORT_FILE))" "$$(cat $(PID_FILE))"; \
	else \
	  printf "$(C_WARN)[make] arrêté$(C_RESET)\n"; \
	fi

.PHONY: logs
logs: ## Suit les logs du serveur de dev
	@[ -f $(LOG_FILE) ] || { printf "$(C_WARN)[make] pas encore de logs, lance « make dev »$(C_RESET)\n"; exit 0; }; \
	tail -f $(LOG_FILE)

# ─── Check ───────────────────────────────────────────────────────────────────

.PHONY: typecheck
typecheck: ## Typecheck (tsc -b)
	@bun run typecheck

.PHONY: registry-check
registry-check: ## Reconstruit le registry shadcn et échoue s'il a changé
	@before=$$( { git diff HEAD -- $(REGISTRY_PATHS); git ls-files -o --exclude-standard -- $(REGISTRY_PATHS); } | cksum ); \
	out=$$(bun run registry:build 2>&1) || { echo "$$out"; exit 1; }; \
	after=$$( { git diff HEAD -- $(REGISTRY_PATHS); git ls-files -o --exclude-standard -- $(REGISTRY_PATHS); } | cksum ); \
	if [ "$$before" != "$$after" ]; then \
	  printf "$(C_ERR)[make] public/r n'était pas à jour : il vient d'être régénéré, relis et commite-le$(C_RESET)\n"; exit 1; \
	fi; \
	printf "$(C_OK)[make] registry à jour$(C_RESET)\n"

# ─── Deploy ──────────────────────────────────────────────────────────────────

.PHONY: deploy-prod
deploy-prod: ## Vérifie, déploie sur la VM tools (shuttle) puis teste la prod
	@if [ -n "$$(git status --porcelain)" ] && [ "$(ALLOW_DIRTY)" != 1 ]; then \
	  printf "$(C_ERR)[make] arbre git modifié : la prod ne correspondrait à aucun commit. Commite, ou force avec ALLOW_DIRTY=1$(C_RESET)\n"; \
	  exit 1; \
	fi
	@$(MAKE) --no-print-directory typecheck
	@$(MAKE) --no-print-directory registry-check
	@shuttle deploy
	@$(MAKE) --no-print-directory smoke-prod

.PHONY: smoke-prod
smoke-prod: ## Teste la prod : santé, route profonde, registry JSON
	@fail=0; \
	for path in /health / /templates /demo/smoke; do \
	  code=$$(curl -s -o /dev/null -m 15 -w '%{http_code}' $(PROD_URL)$$path); \
	  if [ "$$code" = 200 ]; then printf "$(C_OK)  ok   %-16s %s$(C_RESET)\n" "$$path" "$$code"; \
	  else printf "$(C_ERR)  FAIL %-16s %s$(C_RESET)\n" "$$path" "$$code"; fail=1; fi; \
	done; \
	ct=$$(curl -s -o /dev/null -m 15 -w '%{content_type}' $(PROD_URL)/r/composer.json); \
	case "$$ct" in application/json*) printf "$(C_OK)  ok   %-16s %s$(C_RESET)\n" /r/composer.json "$$ct";; \
	  *) printf "$(C_ERR)  FAIL %-16s %s$(C_RESET)\n" /r/composer.json "$$ct"; fail=1;; esac; \
	if [ $$fail = 0 ]; then printf "$(C_OK)[make] prod OK : $(PROD_URL)$(C_RESET)\n"; \
	else printf "$(C_ERR)[make] smoke test en échec sur $(PROD_URL)$(C_RESET)\n"; exit 1; fi
