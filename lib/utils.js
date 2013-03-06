(function(exports) {

	var U = {};

	U.curry = function() {
		var args = Array.prototype.slice.call(arguments);
		var scope = this, fn = args[0], fixedargs = args.slice(1, args.length);
		return function() {
			return fn.apply(scope, fixedargs.concat(Array.prototype.slice.call(arguments)));
		};
	};

	U.setupExtensions = function() {
		Function.prototype.curry = function() {
			var fn = this, args = Array.prototype.slice.call(arguments);
			return function() {
				return fn.apply(this, args.concat(Array.prototype.slice.call(arguments)));
			};
		};
	};

	exports.Utils = U;

})(exports);
