
//Work Object
function Work() {
  
	var self = this;
	
	this.DEFAULT_TIMEOUT = 10000; // ms

	this.responseTime;
	
	this.data; // little-endian
	this.target; // little-endian
	this.header; // big-endian
	
	this.getWork = function() {
		
		var request = {};
		request.method = 'getwork';
		request.params = [];
		request.id = 0;

		//var data = JSON.parse(self.sAjax('proxy.php', JSON.stringify(request)));
		
		var data = {"error": null, "id": 0, "result": {"hash1": "00000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000010000", "data": "00000002a3bae29a6fccebe9c403bc6a10d5405bb5287ddec98579bdbe0de13bbc6cdfd9cb18d9fc7b6b9697875069e87570c1137c7bc4bff5a0df9c07c0c2666eab0233519212f51b6dcb6a00000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000080020000", "target": "00000000ffff0000000000000000000000000000000000000000000000000000", "midstate": "2b62d0e5dd00cc7d267dc7cc77527e4ad652c4fdc2378d209907f988065c0435"}};
		
		self.responseTime = (new Date()).getTime();
		self.data = self.hexStringToByteArray(data.result.data);
		self.target = self.hexStringToByteArray(data.result.target);
		self.header = self.headerByData(self.data);
		
		postMessage({'logMessage': 'Data: '+data.result.data});
		postMessage({'logMessage': 'Target: '+data.result.target});
		//postMessage({'logMessage': 'Header: '+self.byteArrayToHexString(self.header)});
		
	};
	
	this.submit = function(nonce) {
		
		var d = self.data.slice(0);
		d[79] = nonce >>  0;
		d[78] = nonce >>  8;
		d[77] = nonce >> 16;
		d[76] = nonce >> 24;
		
		var sData = self.byteArrayToHexString(d);
		
		var request = {};
		request.method = 'getwork';
		request.params = '["'+sData+'"]';
		request.id = 1;

		var data = JSON.parse(self.sAjax('proxy.php', JSON.stringify(request)));
		
		return data.result;


	};
	
	this.meetsTarget = function(nonce, hasher, hashes) {

		var hash = hasher.hash(self.header, nonce);

		if(hashes%200==0) {
			
			postMessage({'logMessage': 'Latest hash (#'+hashes+'): '+self.byteArrayToHexString(hash)});
			
		}
		
		for (var i = hash.length - 1; i >= 0; i--) {
			
			if ((hash[i] & 0xff) > (self.target[i] & 0xff)) {
				
				return false;
				
			}
			
			if ((hash[i] & 0xff) < (self.target[i] & 0xff)) {
				
				return true;
				
			}
			
		}
		
		return true;
		
	};
	
	this.headerByData = function(data) {
		
		var h = [];
		for(var i=0; i<80; h[i++]=0) {} 
		
		for (var i = 0; i < 80; i += 4) {
			h[i]     = data[i + 3];
			h[i + 1] = data[i + 2];
			h[i + 2] = data[i + 1];
			h[i + 3] = data[i];
		}
		
		return h;
		
	};
	
	this.hexStringToByteArray = function(s) {
		
	    var len = s.length;
	    var data = [];
	    for(var i=0; i<(len/2); data[i++]=0) {} 
	    
	    for (var i = 0; i < len; i += 2) {
	    	
	        data[i / 2] = (parseInt(s.charAt(i), 16) << 4)
	                             + parseInt(s.charAt(i+1), 16);
	        
	    }
	    
	    return data;
	    
	};
	
	this.byteArrayToHexString = function(b) {
		
		var sb = [];
		
		for (var i = 0; i < b.length; i++) {
			
			sb.push(((b[i] & 0xff) + 0x100).toString(16).substring(1));
			
		}
		
		return sb.join("");
		
	};
	
	this.getAge = function() {
		
		return (new Date()).getTime() - self.responseTime;
		
	};
	
	this.sAjax = function(url, data) {
		
		try {
			
			ajax = new XMLHttpRequest();
			
		} catch(err) {
			
			ajax = new ActiveXObject("Microsoft.XMLHTTP");
			
		}
		
		if (ajax) {
			
			ajax.open("POST", url, false);
			ajax.setRequestHeader("Content-type", "application/json");
			ajax.send(data);
			return ajax.responseText;
			
		} else {
			
			return false;
			
		} 
		
	};
	
}
