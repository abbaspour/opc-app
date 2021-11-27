NPM='/usr/local/opt/node@16/bin/npm'

start: node_modules
	$(NPM) start

node_modules: package.json
	$(NPM) install

build: node_modules
	$(NPM) run build

clean:
	rm -rf node_modules package-lock.json

.PHONY: clean build

