build:
	tsc -p ./

run:
	node --nolazy --max-old-space-size=2048 ./dist/index.js

clean:
	rm -rf dist