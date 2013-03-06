(function(exports) {

	var fs = require('fs');

	var WaveWriter = {};

	WaveWriter.dump = function(filename, settings, generator) {
		console.log('Starting wavewriter', filename, settings);
		var s = 0;
		var bits_per_sample = 32;
		var bytes_per_sample = bits_per_sample / 8;
		var keeprunning = true;
		var channelhistory = [];
		for (var ch=0; ch<settings.channels; ch++) {
			channelhistory.push({});
		}

		var bufs = [];
		do {
			var fbuf = new Buffer(bytes_per_sample * settings.channels);
			for (var ch=0; ch<settings.channels; ch++) {
				var hist = channelhistory[ch];
				var cursor = {
					sample: s,
					channel: ch,
					history: hist,
					samplerate: settings.samplerate
				};
				var ret = generator(cursor);
				// console.log('write sample', ret.value);
				if (ret.history)
					channelhistory[ch] = ret.history;
				if (ret.stopped)
					keeprunning = false;
				if (bits_per_sample == 32)
					fbuf.writeFloatLE(ret.value, ch * bytes_per_sample);
				if (bits_per_sample == 16)
					fbuf.writeInt16LE(Math.round(ret.value * 32767.0), ch * bytes_per_sample);
			}
			bufs.push(fbuf);
			s ++;
		} while (keeprunning);

		var tot = (s*settings.channels);
		// console.log('Done, '+tot+' samples written.');

		var alldata = Buffer.concat(bufs);
		var alldatasize = alldata.length;

		// http://mathmatrix.narod.ru/Wavefmt.html
		var head = new Buffer(46);
		for (var i=0; i<head.length; i++) head.writeUInt8(0, i);

		// 00-16
		head.write('RIFF', 0, 4);
		head.writeUInt32LE(alldatasize + head.length, 4); // Size of file
		head.write('WAVE', 8, 4); // WAV description header
		head.write('fmt ', 12, 4); // Format description header

		// 16-32
		head.writeUInt32LE(18, 16); // Size of WAVE section chunk
		head.writeUInt16LE((bits_per_sample == 32) ? 3 : 1, 20); // WAVE type format (1 = classic, 3 = float)
		head.writeUInt16LE(settings.channels, 22); // Number of channels
		head.writeUInt32LE(settings.samplerate, 24); // Samples per second
		head.writeUInt32LE(settings.samplerate * settings.channels * bytes_per_sample, 28); // Bytes per second

		// 32-48
		head.writeUInt16LE(settings.channels * bytes_per_sample, 32); // Block alignment - Number_of_channels*Bits_per_Sample/8
		head.writeUInt16LE(bits_per_sample, 34); // Bits per sample
		head.write('data', 38, 4);  // Data description header
		head.writeUInt32LE(alldatasize, 42, 4);  // Data description header

		var f = fs.createWriteStream(filename, { flags: 'w' });
		f.write(head);
		f.write(alldata);
		f.end();

		return true;
	};

	exports.WaveWriter = WaveWriter;

})(exports);
