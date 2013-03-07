var SEQ = require('../lib/sequencing.js').Sequencing;
var FX = require('../lib/effects.js').FX;
var WAV = require('../lib/wavewriter.js').WaveWriter;
var U = require('../lib/utils.js').Utils;
var I = require('../lib/iter.js').Iter;

U.setupExtensions();

function ______noisegenerator(cursor) {
	var newhistory = {};
	var v = -1.0 + Math.random() * 2.0;
	return {
		value: v,
		history: {}
	}
}

var settings = { samplerate: 48000, channels: 2 };

var stopAfterOneSec = FX.stopAfter.curry(settings.samplerate * 1.0);

var noise1 = stopAfterOneSec.curry(FX.sampleAndHold.curry(FX.noise, 1));
var noise2 = stopAfterOneSec.curry(FX.sampleAndHold.curry(FX.noise, 8));
var noise3 = stopAfterOneSec.curry(FX.sampleAndHold.curry(FX.noise, 32));

function delay(delaytime, iterator) {
	var buffer = [];
	for (var i=0; i<buffer; i++) {
		buffer.push(0.0);
	}
	return {
		nextAsync: function(resultcallback) {
			iterator.nextAsync(function(inputvalue) {
				// add one value to stack
				buffer.push(inputvalue);
				// pop one value from stack
				buffer = buffer.splice(1);
				resultcallback(buffer[0]);
			});
		}
	}
}

function feedbackDelay(feedback, delaytime, iterator) {
}

function stereo1async(inputiterator) {
	var leftdelay = U.curry(delay, 3);
	var rightdelay = U.curry(delay, 4);
	return {
		nextAsync: function(resultcallback) {
			resultcallback([input, input]);
		} 	
	}
}

var mc1 = I.count(settings);

var first = I.take(100, mc1);

var output = I.asyncMap(stereo1async, first);
I.dump( I.take(15, output) );

// var grouped = I.group([leftchannel, rightchannel]);

// var joined = I.join(grouped);
// I.dump( I.take(15, joined) );

// dumpIterator( I.take(5, grouped), function() {
// } );




/*

count:
1 2 3 4 5 6

map duplicat 2:
[1 1] [2 2] [3 3] [4 4]

split -> 2 iteratorer
1 2 3 4      1 2 3 4

map leftch   map rightch
a b c d      a b c d

interleave
a a b b c c d d

*/








































// var mc2 = masterClock(settings);
// var mc3 = masterClock(settings);

// WAV.dump('noise1-1.wav', settings, noise1);
// WAV.dump('noise1-10.wav', settings, noise2);
// WAV.dump('noise1-100.wav', settings, noise3);
