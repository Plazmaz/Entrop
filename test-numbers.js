var fs = require("fs")
var secureRandom = require("secure-random")
var testIdx = 0;

if(!process.argv[2]) {
	console.error("Usage: node test-file.js <filename>")
} else {
	checkFile(process.argv[2]);
}

function checkFile(filename) {
	var dataIndex = 0;
	try {
		var data = JSON.parse(fs.readFileSync(filename));
		getAvgChi(function() {
			return dataIndex < data.length ? data[dataIndex++] : undefined
		}, data.length, ++testIdx);
	} catch(ex) {
		console.error("Could not read specified file. Is it valid JSON?");
		throw ex;
	}
}

function getAvgChi(randFunc, dataSize, testIdx, repeat) {
	var avgChi = 0;
	var positives = 0;
	var samples = repeat || 1;
	for(var i = 0; i < samples; i++) {
		var array = genArray(dataSize, randFunc);
		var cS = chiSquared(array);
		avgChi += cS > 0 ? cS : 0;
		if(isRandom(array)) {
			positives++;
		}
	}
	if(avgChi === 0) {
		console.error("Average score is zero? Test results are likely invalid.");
	}
	avgChi /= samples;
	console.log("Average chi squared score: " + avgChi);
	console.log(positives > samples / 2 ? "Values are most likely random." : "Values are unlikely to be random.")
}

function genArray(size, randFunc) {
	var array = [];
	for(var i = 0; i < size; i++) {
		var value = randFunc();
		if(typeof value == 'undefined') {
			return array;
		}
		array.push(Math.round(value));
	}
	return array;
}

function isRandom(array) {
	var chiSquare = chiSquared(array);
	if(chiSquare == -1) {
		return false;
	}
	var high = 0;
	for(var i = 0; i < array.length; i++) {
		if(array[i] > high) {
			high = array[i];
		}
	}
	if(array.length <= 10 * high) {
		console.log("Array is not long enough!!");
		console.log(array.length + " vs " + (10 * high))
		return false;
	}
	return Math.abs(chiSquare - high) <= 2 * Math.sqrt(high);
}

function chiSquared(array) {
	var occurrences = getOccurrences(array);
	var low = 0;
	var high = 0;
	if(array.length == 0) {
		return -1;
	}
	for(var i = 0; i < array.length; i++) {
		if(array[i] < low) {
			low = array[i];
		} else if(array[i] > high) {
			high = array[i];
		}
	}
	var probability = array.length / high;
	var chiValue = 0;
	for(var i = 0; i < Object.keys(occurrences).length; i++) {
		var key = Object.keys(occurrences)[i];
		var value = ((occurrences[key] - probability)*(occurrences[key] - probability));
		chiValue += value;
	}
	return chiValue / probability;
}

function getOccurrences(array) {
	var occurrences = {};
	for(var i = 0; i < array.length; i++) {
		var num = array[i];
		if(!occurrences[num]) {
			occurrences[num] = 0;
		}
		occurrences[num] = occurrences[num] + 1
	}
	return occurrences;
}