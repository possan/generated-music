(function(exports) {

	var Iter = {};

	var U = require('./utils.js').Utils;

	Iter.validValue = function(value) {
		return (typeof(value) !== 'undefined' && value != null);
	}

	Iter.count = function(settings) {
		var counter = 0;
		return {
			nextAsync: function(fn) {
				fn(counter);
				counter ++;
			}
		}
	}

	Iter.generate = function(fn, settings) {
		var counter = 0;
		return {
			nextAsync: function(resultcallback) {
				var value = fn();
				resultcallback(value);
				counter ++;
			}
		}
	}

	Iter.hold = function(every, input) {
		var counter = 0;
		var lastvalue = undefined;
		return {
			nextAsync: function(resultcallback) {
				input.nextAsync(function(value) {
					if (counter % every == 0) {
						lastvalue = value;
					}
					resultcallback(lastvalue);
					counter ++;
				});
			}
		}
	}

	Iter.take = function(N, input) {
		var counter = 0;
		return {
			nextAsync: function(fn) {
				if (counter >= N) {
					fn(undefined);
					return;
				}
				input.nextAsync(
					function(value) {
						fn(value);
					}
				);
				counter ++;
			}
		}
	}

	Iter.random = function() {
		return {
			nextAsync: function(fn) {
				fn(-1.0 + Math.random() * 2.0);
			}
		}
	}

	Iter.split = function(N, input) {
		return {
			nextAsync: function(resultcallback) {
				input.nextAsync(
					function(value) {
						if (!Iter.validValue(value))
							return;
						var ret = [];
						for (var i=0; i<N; i++)
							ret.push(value);
						resultcallback(ret);
					}
				);
			}
		}
	}

	/*
	Iter.splitsync = function(N, input) {
		var currentposition = 0;
		var _intiter = function(index) {
			return {
				nextAsync: function(resultcallback) {
				}
			}
		}
		var ret = [];
		for (var i=0; i<N; i++) {
			ret.push(_intiter.apply(this, i));
		}
		return ret;
	}
	*/

	Iter.join = function(iters) {
		var lastvalue = [];
		return {
			nextAsync: function(resultcallback) {

				if (lastvalue.length > 0) {
					resultcallback(lastvalue[0]);
					lastvalue = lastvalue.splice(1);
				}
				else {
					iters.nextAsync(
						function(value) {
							if (!Iter.validValue(value)) {
 								resultcallback(undefined);
								return;
							}
							lastvalue = value;
							if (lastvalue.length > 0) {
								resultcallback(lastvalue[0]);
								lastvalue = lastvalue.splice(1);
							}
						}
					);
				}
			}
		}
	}

	Iter.flatten = function(iters) {
	}

	Iter.map = function(fn, iter) {
		return {
			nextAsync: function(resultcallback) {
				input.nextAsync(
					function(value) {
						var value2 = fn(value);
						resultcallback(value2);
					}
				);
			}
		}
	}

	Iter.asyncMap = function(fn, iter) {
		return {
			nextAsync: function(resultcallback) {
				iter.nextAsync(
					function(value) {
						var ret = fn(value);
						ret.nextAsync(function(result) {
							// value = fn(value);
							resultcallback(result);
						});
					}
				);
			}
		}
	}

	Iter.dump = function(input, then) {
		var tmp = 0;

		function takeone() {
			input.nextAsync(function(value) {
				console.log('got', value);
				if (typeof(value) !== 'undefined' && value != null) {
					U.defer(takeone);
				} else if (then) {
					then();
				}
			});
		}

		takeone();
	}

	exports.Iter = Iter;

})(exports);
