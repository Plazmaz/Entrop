var fs = require("fs")
var secureRandom = require("secure-random")
var dataFile = JSON.parse(fs.readFileSync("array-2.txt"));
var dataIndex = 0;
var testIdx = 0;
getAvgChi(function() {return Math.random() * 255}, 62500, ++testIdx, 800);
getAvgChi(function() {return secureRandom(1)[0]}, 12500, ++testIdx);
getAvgChi(function() {
	return dataIndex < dataFile.length ? dataFile[dataIndex++] : undefined
}, dataFile.length, ++testIdx);

function getAvgChi(randFunc, dataSize, testIdx, repeat) {
	var avgChi = 0;
	var positives = 0;
	var samples = repeat || 1;
	for(var i = 0; i < samples; i++) {
		var array = genArray(dataSize, randFunc);
		dataIndex = 0;
		var cS = chiSquared(array);
		avgChi += cS > 0 ? cS : 0;
		if(isRandom(array)) {
			positives++;
			//console.log("Values appear to be random for test " + testIdx + ", subtest " + i + ".");
		}
	}
	console.log(avgChi + "/" + samples)
	if(avgChi === 0) {
		console.log("Average score is zero?");
	}
	avgChi /= samples;
	console.log(avgChi);
	console.log((positives > samples / 2 ? "Values are most likely random for test " : "Values are unlikely to be random for test ") + testIdx)
}

function genArray(size, randFunc) {
	var array = [];
	for(var i = 0; i < size; i++) {
		//var value = crypto.randomBytes(1)[0];
		/*var value = 0;
		for(var i = 0; i < 100; i++) {
			value += Math.random() * 255;
		}
		value /= 100;*/
		var value = randFunc();
		if(typeof value == 'undefined') {
			return array;
		}
		//console.log(value);
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
	//console.log("Chi value: " + Math.abs(chiSquare - high));
	console.log(Math.abs(chiSquare - high) + " vs " + (2 * Math.sqrt(high)))
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
		//console.log(key + ":" + occurrences[key]);
		chiValue += value;
	}
	//console.log(chiValue + "/" + probability)
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