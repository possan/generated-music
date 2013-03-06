(function(exports) {

	var FX = {};

	FX.delay = function(cursor, value) {
		return {
			history: cursor.history,
			value: value / 2.0
		};
	};

	FX.compress = function(cursor, value) {
		return {
			history: cursor.history,
			value: value / 2.0
		};
	};

	FX.noise = function(cursor) {
		return {
			history: {},
			value: Math.random() * 2.0 - 1.0
		};
	};

	FX.mix = function(channels, cursor, value) {
		return {
			vaule: 0
		};
	};

	FX.sampleAndHold = function(generator, interval, cursor) {
		var newhistory = {};
		newhistory.counter = (cursor && cursor.history && cursor.history.counter) || 0;
		newhistory.lastvalue = (cursor && cursor.history && cursor.history.lastvalue) || 0.0;
		if ((newhistory.counter % interval) == 0) {
			var childcursor = {
				sample: cursor.sample,
				samplerate: cursor.samplerate,
				channel: cursor.channel,
				history: (cursor && cursor.history && cursor.history.childhistory) || {}
			}
			var g = generator(childcursor);
			newhistory.childhistory = g.history;
			newhistory.lastvalue = g.value;
		}
		newhistory.counter ++;
		return {
			value: newhistory.lastvalue,
			history: newhistory,
			stopped: cursor.sample >= cursor.samplerate
		}
	};

	FX.stopAfter = function(samples, generator, cursor) {
		var newhistory = {};
		newhistory.counter = (cursor && cursor.history && cursor.history.counter || 0) + 1
		var childcursor = {
			sample: cursor.sample,
			samplerate: cursor.samplerate,
			channel: cursor.channel,
			history: (cursor && cursor.history && cursor.history.childhistory) || {}
		};
		var ret = generator(childcursor);
		newhistory.childhistory = ret.history;
		return {
			value: ret.value,
			history: newhistory,
			stopped: newhistory.counter >= cursor.samplerate
		}
	};

	FX.keepHistory = function(generator, cursor) {
		var newhistory = {};
		var childcursor = {
			sample: cursor.sample,
			samplerate: cursor.samplerate,
			channel: cursor.channel,
			history: (cursor && cursor.history && cursor.history.childhistory) || {}
		};
		var ret = generator(childcursor);
		newhistory.childhistory = ret.history;
		return {
			value: ret.value,
			history: newhistory,
			stopped: ret.stopped
		}
	}

	exports.FX = FX;

})(exports);
