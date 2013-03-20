
var G = require('../lib/graph.js');
var Nodes = require('noderepo.js');

var repo = new G.NodeRepository();
Nodes.registerNodes(repo);

var graph = new G.Graph(repo);

console.log('Create devices.');

graph.addNode(new G.Node('clock', clock, { bpm: 120.0 }));
graph.addNode(new G.Node('seq1', sequencer, { sequencer:[56,54,56] }));
graph.addNode(new G.Node('seq2', sequencer, { sequencer:[16,0,28,28]}));
graph.addNode(new G.Node('delay1', delay, { time: 0.3, feedback: 0.21 }));
graph.addNode(new G.Node('wavewriter', wavewriter, { filename: 'test.wav' }));
graph.addNode(new G.Node('synth1', synth, { waveform: 0 }));
graph.addNode(new G.Node('mixer', mixer));
graph.addNode(new G.Node('delay2', delay, { time: 0.33, feedback: 0.3 } ));
graph.addNode(new G.Node('senddelay3', delay, { time: 0.33, feedback: 0.1 }));
graph.addNode(new G.Node('synth2', synth, { waveform: 1 }));




console.log('Init devices.');

graph.call(new G.Context({action: G.Context.INIT}));

console.log('Connect devices.');

graph.connect('clock', 'out', 'seq1', 'in');
graph.connect('clock', 'out', 'seq2', 'in');

graph.connect('seq1', 'out', 'synth1', 'in');
graph.connect('seq2', 'out', 'synth2', 'in');

graph.connect('synth1', 'out', 'delay1', 'in');
graph.connect('synth2', 'out', 'delay2', 'in');

graph.connect('delay1', 'out', 'mixer', 'in1');
graph.connect('delay2', 'out', 'mixer', 'in2');

graph.connect('senddelay3', 'out', 'mixer', 'receive1');
graph.connect('mixer', 'send1', 'senddelay3', 'in');

graph.connect('mixer', 'out', 'wavewriter', 'in');

console.log('Sort graph.');

graph.sort();

console.log('Render song.');

graph.call(new G.Context({action: G.Context.RENDER}));
graph.call(new G.Context({action: G.Context.RENDER}));
graph.call(new G.Context({action: G.Context.RENDER}));

console.log('Clean up.');

graph.call(new G.Context({action: G.Context.FREE}));

console.log('Done.');
