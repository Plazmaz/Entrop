var ndarray = require("ndarray")
var savePixels = require("save-pixels");
var fs = require("fs")
var secureRandom = require("secure-random")

var size
var crypto = require('crypto')

var array = JSON.parse(fs.readFileSync("array.txt"));
size = Math.floor(Math.sqrt(array.length));
console.log(size);
//Create an image
var pixels = ndarray(new Uint8Array(size*size), [size, size])
var truerandom = [];
/*for(var y = 0; y < size; y++) {
	for(var x = 0; x < size; x++) {
		//var value = crypto.randomBytes(1)[0];
		/*var value = 0;
		for(var i = 0; i < 100; i++) {
			value += Math.random() * 255;
		}
		value /= 100;
		var value = Math.random() * 255;
		//console.log(value);
		pixels.set(x, y, value >= (255/2) ? 255 : 0);
		//var byteVal = crytpo.randomBytes(1);
		array.push(Math.round(value) /*>= (255/2) ? 255 : 0);
		truerandom.push(secureRandom(1)[0]);
	}
}*/
for(var y = 0; y < size; y++) {
	for(var x = 0; x < size; x++) {
		pixels.set(x, y, array[(x*size)+y]);
		console.log(array[(x*size)+y])
	}
}
console.log(isRandom(array, array.length))
console.log(isRandom(truerandom, array.length))
console.log(pixels);
//Save to a file
savePixels(pixels.pick(-1, -1, 0), "png").pipe(fs.createWriteStream("out.png"));

function isRandom(array, totalValues) {
	var chiSquare = chiSquared(array, totalValues);
	var high = 0;
	for(var i = 0; i < array.length; i++) {
		if(array[i] > high) {
			high = array[i];
		}
	}
	console.log("Chi value: " + Math.abs(chiSquare - high));
	return Math.abs(chiSquare - high) <= 2 * Math.sqrt(high);
}

function chiSquared(array, totalValues) {
	var occurrences = getOccurrences(array);
	//console.log(occurrences)
	var low = 0;
	var high = 0;
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
		var tr = truerandom[i];
		if(!occurrences[num]) {
			occurrences[num] = 0;
		}
		occurrences[num] = occurrences[num] + 1
	}
	return occurrences;
}