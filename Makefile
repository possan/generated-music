all: build/graph1.png

clean:
	rm -f build/*

build/graph1.png: build/graph1.dot
	dot -Tpng -o build/graph1.png build/graph1.dot

build/graph1.dot: labs/graph1.json labs/noderepo.js labs/graph2dot.js lib/graph.js
	node labs/graph2dot.js labs/graph1.json build/graph1.dot