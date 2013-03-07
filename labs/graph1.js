var G = require('../lib/graph.js');

function mixer(ctx) {
	if (ctx.action == G.Context.INIT) {
		console.log('Mixer: init.');
		ctx.node.registerInput('in1', 'audio');
		ctx.node.registerInput('in2', 'audio');
		ctx.node.registerInput('in3', 'audio');
		ctx.node.registerInput('in4', 'audio');
		ctx.node.registerInput('in5', 'audio');
		ctx.node.registerInput('in6', 'audio');
		ctx.node.registerInput('receive1', 'audio', true); // lazy inputs to allow circular refs.
		ctx.node.registerInput('receive2', 'audio', true);
		ctx.node.registerOutput('out', 'audio');
		ctx.node.registerOutput('send1', 'audio');
		ctx.node.registerOutput('send2', 'audio');
	}
	if (ctx.action == G.Context.RENDER) {
		console.log('Mixer: render.', ctx.node.data);
		var samples1 = ctx.graph.getInput(ctx.node.id, 'in1', []);
		var samples2 = ctx.graph.getInput(ctx.node.id, 'in2', []);
		var samples3 = ctx.graph.getInput(ctx.node.id, 'in3', []);
		console.log('samples', samples1, samples2, samples3);
	}
	if (ctx.action == G.Context.FREE) {
		console.log('Mixer: free.');
	}
}

function synth(ctx) {
	if (ctx.action == G.Context.INIT) {
		console.log('Synth: init.');
		ctx.node.registerInput('in', 'events');
		ctx.node.registerOutput('out', 'audio');
	}
	if (ctx.action == G.Context.RENDER) {
		console.log('Synth: render.', ctx.node.data);
		var events = ctx.graph.getInput(ctx.node.id, 'in', []);
		console.log('input events', events);
		ctx.graph.setOutput(ctx.node.id, 'out', [0,1,2,3]);
	}
	if (ctx.action == G.Context.FREE) {
		console.log('Synth: free.');
	}
}

function wavewriter(ctx) {
	if (ctx.action == G.Context.INIT) {
		console.log('WaveWriter: Create file.');
		ctx.node.registerInput('in', 'audio');
	}
	if (ctx.action == G.Context.RENDER) {
		console.log('WaveWriter: Append to file.', ctx.node.data);
		var samples = ctx.graph.getInput(ctx.node.id, 'in', []);
		console.log('input samples', samples);
	}
	if (ctx.action == G.Context.FREE) {
		console.log('WaveWriter: Close file.');
	}
}

function delay(ctx) {
	if (ctx.action == G.Context.INIT) {
		console.log('Delay: Init.');
		ctx.node.registerInput('in', 'audio');
		ctx.node.registerOutput('out', 'audio');
	}
	if (ctx.action == G.Context.RENDER) {
		console.log('Delay: Render.', ctx.node.data);
		var samples = ctx.graph.getInput(ctx.node.id, 'in', []);
		console.log('input samples', samples);
	}
	if (ctx.action == G.Context.FREE) {
		console.log('Delay: Free.');
	}
}

function sequencer(ctx) {
	if (ctx.action == G.Context.INIT) {
		console.log('Sequencer: Init.');
		ctx.node.registerInput('in', 'events');
		ctx.node.registerOutput('out', 'events');
	}
	if (ctx.action == G.Context.RENDER) {
		console.log('Sequencer: Render.', ctx.node.data);
		ctx.graph.setOutput(ctx.node.id, 'out', ['noteon']);
	}
	if (ctx.action == G.Context.FREE) {
		console.log('Sequencer: Free.');
	}
}


function clock(ctx) {
	if (ctx.action == G.Context.INIT) {
		console.log('Clock: Init.');
		ctx.node.registerOutput('out', 'events');
	}
	if (ctx.action == G.Context.RENDER) {
		console.log('Clock: Render.', ctx.node.data);
		ctx.graph.setOutput(ctx.node.id, 'out', [0,1,2,3]);
	}
	if (ctx.action == G.Context.FREE) {
		console.log('Clock: Free.');
	}
}

var graph = new G.Graph();

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
