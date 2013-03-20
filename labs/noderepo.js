(function(exports) {

	var G = require('../lib/graph.js');

	function mixer(ctx) {
		if (ctx.action == G.Context.IDENTIFY) {
			ctx.result = 'Mixer';
		}
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
			console.log('Mixer: render.', ctx.node.id, ctx.node.data);
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
		if (ctx.action == G.Context.IDENTIFY) {
			ctx.result = 'Oscillator';
		}
		if (ctx.action == G.Context.INIT) {
			console.log('Synth: init.');
			ctx.node.registerInput('gate', 'events');
			ctx.node.registerInput('note', 'events');
			ctx.node.registerInput('volume', 'events');
			ctx.node.registerOutput('out', 'audio');
		}
		if (ctx.action == G.Context.RENDER) {
			console.log('Synth: render.', ctx.node.id, ctx.node.data);
			var events = ctx.graph.getInput(ctx.node.id, 'in', []);
			console.log('input events', events);
			ctx.graph.setOutput(ctx.node.id, 'out', [0,1,2,3]);
		}
		if (ctx.action == G.Context.FREE) {
			console.log('Synth: free.');
		}
	}

	function wavewriter(ctx) {
		if (ctx.action == G.Context.IDENTIFY) {
			ctx.result = 'WaveWriter';
		}
		if (ctx.action == G.Context.INIT) {
			console.log('WaveWriter: Create file.');
			ctx.node.registerInput('in', 'audio');
		}
		if (ctx.action == G.Context.RENDER) {
			console.log('WaveWriter: Append to file.', ctx.node.id, ctx.node.data);
			var samples = ctx.graph.getInput(ctx.node.id, 'in', []);
			console.log('input samples', samples);
		}
		if (ctx.action == G.Context.FREE) {
			console.log('WaveWriter: Close file.');
		}
	}

	function delay(ctx) {
		if (ctx.action == G.Context.IDENTIFY) {
			ctx.result = 'Delay';
		}
		if (ctx.action == G.Context.INIT) {
			console.log('Delay: Init.');
			ctx.node.registerInput('in', 'audio');
			ctx.node.registerOutput('out', 'audio');
		}
		if (ctx.action == G.Context.RENDER) {
			console.log('Delay: Render.', ctx.node.id, ctx.node.data);
			var samples = ctx.graph.getInput(ctx.node.id, 'in', []);
			console.log('input samples', samples);
		}
		if (ctx.action == G.Context.FREE) {
			console.log('Delay: Free.');
		}
	}

	function sequencer(ctx) {
		if (ctx.action == G.Context.IDENTIFY) {
			ctx.result = 'StepSequencer';
		}
		if (ctx.action == G.Context.INIT) {
			console.log('Sequencer: Init.');
			ctx.node.registerInput('in', 'events');
			ctx.node.registerOutput('out', 'events');
		}
		if (ctx.action == G.Context.RENDER) {
			console.log('Sequencer: Render.', ctx.node.id, ctx.node.data);
			ctx.graph.setOutput(ctx.node.id, 'out', ['noteon']);
		}
		if (ctx.action == G.Context.FREE) {
			console.log('Sequencer: Free.');
		}
	}


	function clock(ctx) {
		if (ctx.action == G.Context.IDENTIFY) {
			ctx.result = 'Clock';
		}
		if (ctx.action == G.Context.INIT) {
			console.log('Clock: Init.');
			ctx.node.registerOutput('out', 'events');
		}
		if (ctx.action == G.Context.RENDER) {
			console.log('Clock: Render.', ctx.node.id, ctx.node.data);
			ctx.graph.setOutput(ctx.node.id, 'out', [0,1,2,3]);
		}
		if (ctx.action == G.Context.FREE) {
			console.log('Clock: Free.');
		}
	}


	function filter(ctx) {
		if (ctx.action == G.Context.IDENTIFY) {
			ctx.result = 'Filter';
		}
		if (ctx.action == G.Context.INIT) {
			console.log('Clock: Init.');
			ctx.node.registerInput('in', 'audio');
			ctx.node.registerInput('cutoff', 'value');
			ctx.node.registerInput('resonance', 'value');
			ctx.node.registerOutput('out', 'audio');
		}
		if (ctx.action == G.Context.RENDER) {
			console.log('Clock: Render.', ctx.node.id, ctx.node.data);
			ctx.graph.setOutput(ctx.node.id, 'out', [0,1,2,3]);
		}
		if (ctx.action == G.Context.FREE) {
			console.log('Clock: Free.');
		}
	}

	function envelope(ctx) {
		if (ctx.action == G.Context.IDENTIFY) {
			ctx.result = 'Envelope';
		}
		if (ctx.action == G.Context.INIT) {
			console.log('Clock: Init.');
			ctx.node.registerInput('gate', 'events');
			ctx.node.registerOutput('out', 'events');
		}
		if (ctx.action == G.Context.RENDER) {
			console.log('Clock: Render.', ctx.node.id, ctx.node.data);
			ctx.graph.setOutput(ctx.node.id, 'out', [0,1,2,3]);
		}
		if (ctx.action == G.Context.FREE) {
			console.log('Clock: Free.');
		}
	}

	exports.registerNodes = function(noderepo) {
		noderepo.registerNode(mixer);
		noderepo.registerNode(synth);
		noderepo.registerNode(wavewriter);
		noderepo.registerNode(delay);
		noderepo.registerNode(sequencer);
		noderepo.registerNode(clock);
		noderepo.registerNode(envelope);
		noderepo.registerNode(filter);
	}

})(exports);