.PHONY: install start dev stop logs health lint clean

# Install dependencies
install:
	npm install

# Start production server
start:
	npm start

# Start development server with auto-reload
dev:
	npm run dev

# Stop any running server on port 3000
stop:
	-lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Check server health
health:
	curl -s http://localhost:3000/api/health | jq .

# List available lights
lights:
	curl -s http://localhost:3000/api/lights | jq .

# List smart button sensor IDs (use these to fill buttonOfficeMapping in config.json)
sensors:
	curl -s http://localhost:3000/api/sensors | jq .

# Lint with eslint (install if needed: npm install --save-dev eslint)
lint:
	npx eslint server.js --env node,es2021

# Remove node_modules
clean:
	rm -rf node_modules

# Setup config from example (only if config.json doesn't exist)
config:
	@if [ ! -f config.json ]; then cp config.example.json config.json && echo "Created config.json — edit it with your Hue Bridge settings"; else echo "config.json already exists"; fi
