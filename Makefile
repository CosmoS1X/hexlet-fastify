install:
	npm install

start:
	node bin/index.js

dev:
	nodemon bin/index.js

lint:
	npx eslint .
