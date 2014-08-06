build:
	@make install
	@browserify index.js -o build.js

clean:
	@rm -rf node_modules build.js

install:
	@npm install

release:
	@make clean
	@make build

.PHONY: build clean install release