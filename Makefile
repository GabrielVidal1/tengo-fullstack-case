.PHONY: up install mock dev

# Install all project dependencies.
install:
	npm install

# Start the mock backend and the frontend dev server together.
# Both run in the foreground; Ctrl-C stops both.
up:
	@echo "Starting mock backend and frontend..."
	@trap 'kill 0' INT TERM EXIT; \
		npm run mock & \
		npm run dev & \
		wait

# Run only the mock backend.
mock:
	npm run mock

# Run only the frontend dev server.
dev:
	npm run dev
