var fs = require('fs');

var G = require('../lib/graph.js');
var noderepo = require('../labs/noderepo.js');
var repo = new G.NodeRepository();
noderepo.registerNodes(repo);

if (process.argv.length < 4) {
	console.log('Syntax: node graph2dot.js input.json output.dot')
	return;
}

var inputfile = process.argv[2];
var outputfile = process.argv[3];

var inputjson = fs.readFileSync(inputfile);
var inputdata = JSON.parse(inputjson);

var outputdata = [];

outputdata.push('digraph g {');
outputdata.push('graph [ rankdir = \"LR\" ];');
outputdata.push('node [ fontsize = \"16\" ];');

inputdata.nodes.forEach(function(node, i) {
	console.log(node);

	var n = repo.createNode(node.type);
	var labels = [];
	console.log(n);
	if (n) {
		labels.push('<fid>#'+node.id+' ('+node.type+')');
		n.inputids.forEach(function(inputpin, j) {
			labels.push('{<i'+inputpin+'> '+inputpin+'}');
		});
		n.outputids.forEach(function(outputpin, j) {
			labels.push('{<o'+outputpin+'> '+outputpin+ '}');
		});
	}
	outputdata.push('"'+node.id+'" [');
	outputdata.push('label = "'+labels.join('|')+'"');
	outputdata.push('shape = "record"');
	outputdata.push('];');

});


inputdata.connections.forEach(function(conn, i) {
	console.log(conn);

	outputdata.push('"'+conn.fromnode+'":o'+conn.frompin+' -> "' + conn.tonode+'":i'+conn.topin+' [ ];');
});

outputdata.push('}');

fs.writeFileSync(outputfile, outputdata.join('\n'));