(function(exports) {

	var Context = function(opts) {
		this.graph = null;
		this.node = null;
		this.action = Context.UNKNOWN;
		this.samples = 0;
		this.result = null;
		if (opts) {
			if (opts.action) this.action = opts.action;
		}
	};

	Context.UNKNOWN = 0;
	Context.RENDER = 1;
	Context.INIT = 2;
	Context.FREE = 3;
	Context.IDENTIFY = 4;

	exports.Context = Context;



	var Graph = function(nodefactory) {
		this.nodefactory = nodefactory;
		this.clear();
	}

	Graph.prototype.clear = function() {
		this.ids = [];
		this.connections = [];
		this.nodes = {};
		this.order = [];
	}

	Graph.prototype.merge = function(doc) {
		for(var i=0; i<doc.nodes.length; i++) {
			var nod = doc.nodes[i];
			var nod2 = this.nodefactory.create(nod.type);
			this.ids.push(nod.id);
			this.nodes.push(nod2);
		}
		for(var i=0; i<doc.connections.length; i++) {
			var conn = doc.connections[i];
		}
	}

	Graph.prototype.export = function() {
		var obj = {};

		obj.nodes = [];
		for(var i=0; i<this.ids.length; i++) {
			var id = this.ids[i];
			var node = this.nodes[id];
			var	nodedef = {
				id: id,
				type: node.type,
				parameters: {}
			};
			obj.nodes.push(nodedef);
		}

		obj.connections = [];
		for(var i=0; i<this.connections.length; i++) {
			var conn = this.connections[i];
			var conndef = {
				fromnode: conn.fromblock,
				frompin: conn.frompin,
				tonode: conn.toblock,
				topin: conn.topin
			};
			obj.connections.push(conndef);
		}

		return obj;
	}

	Graph.prototype.getNode = function(id) {
		return this.nodes[id];
	}

	Graph.prototype.addNode = function(node) {
		console.log('graph: add node #'+node.id);
		this.nodes[node.id] = node;
		this.ids.push(node.id);
	}

	Graph.prototype.connect = function(fromblock, frompin, toblock, topin) {
		console.log('graph: connect from '+fromblock+':'+frompin+' to '+toblock+':'+topin+' ...');
		// register connection
		this.connections.push({
			fromblock: fromblock,
			frompin: frompin,
			toblock: toblock,
			topin: topin
		});

		var fromblockobj = this.nodes[fromblock];
		if (typeof(fromblockobj) === 'undefined')
			throw 'No such source node';

		var frompinobj = fromblockobj.outputpins[frompin];
		if (typeof(frompinobj) === 'undefined')
			throw 'No such source pin';

		var toblockobj = this.nodes[toblock];
		if (typeof(fromblockobj) === 'undefined')
			throw 'No such target node';

		var topinobj = toblockobj.inputpins[topin];
		if (typeof(topinobj) === 'undefined')
			throw 'No such target pin';

		// connect them
		frompinobj.connected = true;
		topinobj.connected = true;
		topinobj.sourcepin = frompinobj;
		topinobj.sourceblock = fromblockobj;
	}

	Graph.prototype.sort = function() {
		var blockstatus = {};
		var neworder = [];
		console.log('graph.sort: begin...');
		console.log('');

		for (var i=0; i<this.ids.length; i++) {
			var id = this.ids[i];
			blockstatus[id] = 'pending';
		}

		for (var iter=0; iter<this.ids.length*2; iter++) {
			console.log('graph.sort: iteration #'+iter);

			// mark blocks with all inputs satisfied as ok and add it to the rendering order.
			for (var i=0; i<this.ids.length; i++) {
				var id = this.ids[i];

				if (blockstatus[id] != 'pending')
					continue;

				var block = this.nodes[id];
				console.log('graph.sort: block '+id+' is waiting for all inputs to be ready...');
				var inputsready = true;
				for (var p=0; p<block.inputids.length && inputsready; p++) {
					var inputpinid = block.inputids[p];
					var inputpin = block.inputpins[inputpinid];
					if (inputpin.connected && !inputpin.lazy) {
						// console.log('graph.sort: check connected input pin', inputpinid);
						// check this pin
						console.log('graph.sort: check input connected to '+inputpin.sourceblock.id+':'+inputpin.sourcepin.id);
						// if (inputpin.sourcepin.lazy) {
						// console.log('graph.sort: connected pin is lazy, ignore it.');
						// } else
						if (blockstatus[inputpin.sourceblock.id] == 'pending') {
							console.log('graph.sort: connected block is not ready yet, and that means we\'re not ready!');
							inputsready = false;
						}
					}
				}
				console.log('graph.sort: inputsready='+inputsready);
				// this is waiting for inputs to be satisfied.
				if (inputsready) {
					console.log('graph.sort: marking block '+block.id+' as ready.');
					blockstatus[block.id] = 'ready';
					neworder.push(block.id);
				} else {
					console.log('graph.sort: block '+block.id+' is still not ready.');
				}
			}

			console.log('');
		}
		console.log('graph.sort: done. order:', neworder);
		console.log('');
		this.order = neworder;
	}

	Graph.prototype.call = function(context) {
		console.log('graph: call');
		var order = context.action == Context.RENDER ? this.order : this.ids;
		for (var i=0; i<order.length; i++) {
			var id = order[i];
			var block = this.nodes[id];
			var newcontext = new Context();
			// console.log('graph: call block #'+id);
			newcontext.graph = this;
			newcontext.samples = context.samples;
			newcontext.node = block;
			newcontext.action = context.action;
			block.call(newcontext);
		}
		console.log('');
	}

	Graph.prototype.getInput = function(block, inputpin, defaultvalue) {
		var blockobj = this.nodes[block];
		var pinobj = blockobj.inputpins[inputpin];
		if (pinobj.connected && pinobj.sourcepin) {
			return pinobj.sourcepin.value || defaultvalue;
		}
		return defaultvalue;
	}

	Graph.prototype.setOutput = function(block, outputpin, value) {
		var blockobj = this.nodes[block];
		var pinobj = blockobj.outputpins[outputpin];
		pinobj.value = value;
		// pinobj.dirty = true;
	}

	exports.Graph = Graph;


	var Node = function(id, callback, data) {
		this.id = id || '';
		this.parameters = {};
		this.type = '';
		this.inputids = [];
		this.inputpins = [];
		this.outputids = [];
		this.outputpins = {};
		this.data = data || {};
		this.callback = callback || null;
	}

	Node.prototype.registerInput = function(id, type, lazy) {
		console.log('graph.node: register input '+this.id+':'+id);
		this.inputids.push(id);
		this.inputpins[id] = { id: id, type: type, sourcepin: null, sourceblock: null, connected: false, lazy: lazy || false };
	}

	Node.prototype.registerOutput = function(id, type, lazy) {
		console.log('graph.node: register output '+this.id+':'+id);
		this.outputids.push(id);
		this.outputpins[id] = { id: id, type: type, value: null, connected: false, lazy: lazy || false };
	}

	Node.prototype.call = function(context) {
		this.callback(context);
	}

	exports.Node = Node;




	var NodeRepository = function() {
		this.typecallbacks = {};
		this.types = [];
	}

	NodeRepository.prototype.registerNode = function(fn) {
		console.log('register node', fn);
		var ctx = new Context();
		ctx.action = Context.IDENTIFY;
		fn(ctx);
		if (ctx.result != null) {
			console.log('register node id', ctx.result);
			this.typecallbacks[ctx.result] = fn;
			this.types.push(ctx.result);
		}
	}

	NodeRepository.prototype.createNode = function(type) {
		var callback = this.typecallbacks[type];
		if (callback) {
			var node = new Node('', callback, {});
			var setupctx = new Context();
			setupctx.action = Context.INIT;
			setupctx.graph = null;
			setupctx.node = node;
			node.call(setupctx);
			return node;
		}
		return null;
	}

	exports.NodeRepository = NodeRepository;










})(exports);
