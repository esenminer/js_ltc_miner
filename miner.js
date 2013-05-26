function Miner() {
  
	var self = this;
	
	this.Notification = {
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
	
	
	this.lastWorkTime = 0;
	this.lastWorkHashes = 0;
	
	
	// Setup new worker
	worker = new Worker('worker.js');
	
	worker.onmessage = function(e) {
		
		var notification = e.data.notification;
		var workerHashes = e.data.workerHashes;
		var logMessage = e.data.logMessage;
		var hashRate = e.data.hashRate;
		
		if(hashRate!=null) {
	
			document.getElementById('hashRate').value = hashRate;
			
		}
		
		if(workerHashes!=null) {
			
			document.getElementById('workerHashes').value = workerHashes;
			
		}
		
		var message = '';

		if(notification!=null) {
			
			switch(notification) {
			
				case self.Notification.SYSTEM_ERROR: message = 'System error.'; break;
				case self.Notification.PERMISSION_ERROR: message = 'Permission error.'; break;
				case self.Notification.CONNECTION_ERROR: message = 'Connection error, retrying in ' + retryPause/1000 + ' seconds.'; break;
				case self.Notification.AUTHENTICATION_ERROR: message = 'Invalid worker username or password.'; break;
				case self.Notification.COMMUNICATION_ERROR: message = 'Communication error.'; break;
				case self.Notification.LONG_POLLING_FAILED: message = 'Long polling failed.'; break;
				case self.Notification.LONG_POLLING_ENABLED: message = 'Long polling activated.'; break;
				case self.Notification.NEW_BLOCK_DETECTED: message = 'LONGPOLL detected new block.'; break;
				case self.Notification.NEW_WORK: 
	
						if (self.lastWorkTime > 0) {
							
							var hashes = workerHashes - self.lastWorkHashes;
							var speed = hashes / Math.max(1, (new Date()).getTime() - self.lastWorkTime);
							message = hashes + " hashes, " + speed.toFixed(2) + " khash/s";
							
						} else {
							
							message = 'Started new work.';
							
						}
						
						self.lastWorkTime = (new Date()).getTime();
						self.lastWorkHashes = workerHashes;
	
						break;
				
				case self.Notification.POW_TRUE: message = 'PROOF OF WORK RESULT: true (yay!!!)'; break;
				case self.Notification.POW_FALSE: message = 'PROOF OF WORK RESULT: false (booooo)'; break;
				case self.Notification.TERMINATED: message = 'Terminated.'; break;
				case self.Notification.STARTED: message = 'Worker started.'; break;
			
	
			}
		
		}
		
		if(message!=null
				&& message!='') {
		
			self.logger(message);
		
		}
		
		if(logMessage!=null && logMessage!='') {
			
			self.logger(logMessage);
			
		}

    };
	
	// Start Worker
	this.startWorker = function() { 
		worker.postMessage({'cmd': 'start'});
	};
	

	// Stop Worker
	this.stopWorker = function() { 
		worker.terminate();
	};
	
	
    this.logger = function(str) {
		
    	var logElement = document.getElementById('log');
    	logElement.innerHTML =logElement.innerHTML + "<br/>" + str;
		
	};
	

}
