(function(exports) {

	var S = {};

	S.expr = function(expr, playstate) {
		return {
			history: history,
			value: 0
		};
	}

	S.randomtrig = function(seq, playstate) {
		return Math.round(Math.random());
	}

	exports.Sequencing = S;

})(exports);
