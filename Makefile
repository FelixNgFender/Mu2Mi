DOCKER_COMPOSE = docker compose

.PHONY: build build-no-cache up watch stop kill down clean

build:
	$(DOCKER_COMPOSE) build

build-no-cache:
	$(DOCKER_COMPOSE) build --no-cache

up:
	$(DOCKER_COMPOSE) up -d

watch:
	$(DOCKER_COMPOSE) watch

stop:
	$(DOCKER_COMPOSE) stop

kill:
	$(DOCKER_COMPOSE) kill

down:
	$(DOCKER_COMPOSE) down

clean:
	$(DOCKER_COMPOSE) down -v --remove-orphans