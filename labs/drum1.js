var SEQ = require('../lib/sequencing.js').Sequencing;
var FX = require('../lib/effects.js').FX;
var WAV = require('../lib/wavewriter.js').WaveWriter;

function generator(playstate) {
	console.log('writing sample #'+playstate.sample+' (channel '+playstate.channel+')');
	return playstate.sample < 44100;
}

wav.dump('drum1.wav', generator);