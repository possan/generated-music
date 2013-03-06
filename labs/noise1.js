var SEQ = require('../lib/sequencing.js').Sequencing;
var FX = require('../lib/effects.js').FX;
var WAV = require('../lib/wavewriter.js').WaveWriter;
var U = require('../lib/utils.js').Utils;

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

WAV.dump('noise1-1.wav', settings, noise1);
WAV.dump('noise1-10.wav', settings, noise2);
WAV.dump('noise1-100.wav', settings, noise3);
