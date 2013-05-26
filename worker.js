importScripts('./work.js');
importScripts('./hasher.js');
importScripts('./lib/core-min.js');
importScripts('./lib/enc-base64-min.js');
importScripts('./lib/hmac-sha256.js');
importScripts('./lib/json2.js');

var WORK_TIMEOUT = 60 * 1000; // ms

var Notification = {
  SYSTEM_ERROR : 0,
	PERMISSION_ERROR : 1,
	CONNECTION_ERROR : 2,
	AUTHENTICATION_ERROR : 3,
	COMMUNICATION_ERROR : 4,
	LONG_POLLING_FAILED : 5,
	LONG_POLLING_ENABLED : 6,
	NEW_BLOCK_DETECTED : 7,
	NEW_WORK : 8,
	POW_TRUE : 9,
	POW_FALSE : 10,
	TERMINATED : 11,
	STARTED: 12
};

var scanTime = 5000; // ms
var retryPause = 30000; // ms
var throttleFactor = 0;

var curWork = null;
var hashes = 0;
var lastHashes = 0;
var running = false;

var nonce = 0;


var hashRateUpdater = null;

self.onmessage = function(e) {
	
	 var cmd = e.data.cmd;
	 
	 
	 if(cmd=='start') {
		 
		 run();
		 
	 }
	 
	 if(cmd=='stop') {

		 stop();
		 
	 }
	  
};

// Never called because CPU usage jumps to 100% and the
// worker doesn't seem to receive stop message
function stop() {
	
	running = false;
	self.postMessage({'notification': Notification.TERMINATED});
	self.postMessage({'logMessage': 'Hashes: '+hashes});
	clearInterval(hashRateUpdater);
	self.terminate();
}

function run() {
	
	running = true;
	
	self.postMessage({'notification': Notification.STARTED});
	
	doWork();

}

function doWork() {
	
	var hasher = new Hasher();
	
	var lastTime = (new Date()).getTime();
	
	/*
	 * Method to update the hash rate but doesn't seem
	 * to work because the actual hashing never yields
	 * long enough for this.
	 * 
	 *
	setInterval(function() {
		
		var hashRate = ((lastHashes - hashes)/1024).toFixed(2);
		self.postMessage({'logMessage': hashRate});
		
		lastHashes = hashes;
	
	}, 1000);
	*/

	while(running) {
		
		if(curWork == null || curWork.getAge() >= WORK_TIMEOUT ) {
			
			// Get New Work
			curWork = new Work();
			curWork.getWork();
			
			nonce = 0;
			
			self.postMessage({'notification': Notification.NEW_WORK});
			
		} else {
			
			if(curWork.meetsTarget(nonce, hasher, hashes)) {
				
				//submit work
				var submitResult = curWork.submit();
				
				if(submitResult==true) {
					
					self.postMessage({'notification': POW_TRUE});
					
				} else {
					
					self.postMessage({'notification': POW_FALSE});
					
				}
				
				self.postMessage({'workerHashes': hashes});
				
				curWork = null;
				
			}
			
			nonce++;
			hashes++;
			
			if(hashes%200==0) {
				
				var secTime = (((new Date()).getTime())-lastTime)/1000;
				
				var hashRate = ((hashes - lastHashes)/secTime).toFixed(0);
				self.postMessage({'hashRate': hashRate,
							      'workerHashes': hashes});
				lastHashes = hashes;
				lastTime = (new Date()).getTime();
				
			}
			
			
		}
		
		
			
			
			
		



	}
	
}

