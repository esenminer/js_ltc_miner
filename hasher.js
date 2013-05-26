function Hasher() {
  
	var self = this;
	
	this.B = []; // byte
	for(var i=0; i<(128+4); this.B[i++]=0) {}
	
	this.X = []; // integer
	for(var i=0; i<32; this.X[i++]=0) {} 
	
	this.V = []; // integer
	for(var i=0; i<(32 * 1024); this.V[i++]=0) {}
	
	this.hash = function(header, nonce) {
		
		var i = 0;
		var j = 0;
		var k = 0;
		
		for(i=0; i<76; i++) {
		
			self.B[i] = header[i]; //arraycopy(header, 0, B, 0, 76);
		
		}
		
		self.B[76] = nonce >>  0;
		self.B[77] = nonce >>  8;
		self.B[78] = nonce >> 16;
		self.B[79] = nonce >> 24;
		
		var secretKey  = CryptoJS.enc.Hex.parse(self.byteArrayToHexString(self.B.slice(0,80)));
		var hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, secretKey);
		
		self.B[80] = 0;
		self.B[81] = 0;
		self.B[82] = 0;
		
		for (i = 0; i < 4; i++) {
			
        	self.B[83] = (i + 1);

        	hmac.update(CryptoJS.enc.Hex.parse(self.byteArrayToHexString(self.B.slice(0,84))));

        	var H = self.hexStringToByteArray((hmac.finalize()).toString(CryptoJS.enc.Hex));
        	
            for (j = 0; j < 8; j++) {
                self.X[i * 8 + j]  = (H[j * 4 + 0] & 0xff) << 0
                              | (H[j * 4 + 1] & 0xff) << 8
                              | (H[j * 4 + 2] & 0xff) << 16
                              | (H[j * 4 + 3] & 0xff) << 24;
            }

            hmac.reset();
        }
		
		
		for (i = 0; i < 1024; i++) {
			
			for(j = 0; j < 32; j++) {
			
				self.V[(i*32)+j] = self.X[j]; // arraycopy(X, 0, V, i * 32, 32);
			
			}
			
            self.xorSalsa8(0, 16);
            self.xorSalsa8(16, 0);
            
        }
		

		for (i = 0; i < 1024; i++) {
			
        	k = (self.X[16] & 1023) * 32;
            
        	for (j = 0; j < 32; j++) {
        	
                self.X[j] ^= self.V[k + j];
                
            }
        	
            self.xorSalsa8(0, 16);
            self.xorSalsa8(16, 0);
        }
		
		
		for (i = 0; i < 32; i++) {
            self.B[i * 4 + 0] = (self.X[i] >>  0);
            self.B[i * 4 + 1] = (self.X[i] >>  8);
            self.B[i * 4 + 2] = (self.X[i] >> 16);
            self.B[i * 4 + 3] = (self.X[i] >> 24);
        }
        
		self.B[128 + 3] = 1;
		
		hmac.update(CryptoJS.enc.Hex.parse(self.byteArrayToHexString(self.B)));
		return self.hexStringToByteArray((hmac.finalize()).toString(CryptoJS.enc.Hex));

		
	};
	
	this.xorSalsa8 = function(di, xi) {
		var x00 = (self.X[di +  0] ^= self.X[xi +  0]);
		var x01 = (self.X[di +  1] ^= self.X[xi +  1]);
		var x02 = (self.X[di +  2] ^= self.X[xi +  2]);
		var x03 = (self.X[di +  3] ^= self.X[xi +  3]);
		var x04 = (self.X[di +  4] ^= self.X[xi +  4]);
		var x05 = (self.X[di +  5] ^= self.X[xi +  5]);
		var x06 = (self.X[di +  6] ^= self.X[xi +  6]);
        var x07 = (self.X[di +  7] ^= self.X[xi +  7]);
        var x08 = (self.X[di +  8] ^= self.X[xi +  8]);
        var x09 = (self.X[di +  9] ^= self.X[xi +  9]);
        var x10 = (self.X[di + 10] ^= self.X[xi + 10]);
        var x11 = (self.X[di + 11] ^= self.X[xi + 11]);
        var x12 = (self.X[di + 12] ^= self.X[xi + 12]);
        var x13 = (self.X[di + 13] ^= self.X[xi + 13]);
        var x14 = (self.X[di + 14] ^= self.X[xi + 14]);
        var x15 = (self.X[di + 15] ^= self.X[xi + 15]);
        
        for (var i = 0; i < 8; i += 2) {
        	
            x04 ^= self.rotateLeft(x00+x12, 7);  x08 ^= self.rotateLeft(x04+x00, 9);
            x12 ^= self.rotateLeft(x08+x04,13);  x00 ^= self.rotateLeft(x12+x08,18);
            x09 ^= self.rotateLeft(x05+x01, 7);  x13 ^= self.rotateLeft(x09+x05, 9);
            x01 ^= self.rotateLeft(x13+x09,13);  x05 ^= self.rotateLeft(x01+x13,18);
            x14 ^= self.rotateLeft(x10+x06, 7);  x02 ^= self.rotateLeft(x14+x10, 9);
            x06 ^= self.rotateLeft(x02+x14,13);  x10 ^= self.rotateLeft(x06+x02,18);
            x03 ^= self.rotateLeft(x15+x11, 7);  x07 ^= self.rotateLeft(x03+x15, 9);
            x11 ^= self.rotateLeft(x07+x03,13);  x15 ^= self.rotateLeft(x11+x07,18);
            x01 ^= self.rotateLeft(x00+x03, 7);  x02 ^= self.rotateLeft(x01+x00, 9);
            x03 ^= self.rotateLeft(x02+x01,13);  x00 ^= self.rotateLeft(x03+x02,18);
            x06 ^= self.rotateLeft(x05+x04, 7);  x07 ^= self.rotateLeft(x06+x05, 9);
            x04 ^= self.rotateLeft(x07+x06,13);  x05 ^= self.rotateLeft(x04+x07,18);
            x11 ^= self.rotateLeft(x10+x09, 7);  x08 ^= self.rotateLeft(x11+x10, 9);
            x09 ^= self.rotateLeft(x08+x11,13);  x10 ^= self.rotateLeft(x09+x08,18);
            x12 ^= self.rotateLeft(x15+x14, 7);  x13 ^= self.rotateLeft(x12+x15, 9);
            x14 ^= self.rotateLeft(x13+x12,13);  x15 ^= self.rotateLeft(x14+x13,18);
            
        }

        self.X[di +  0] = (self.X[di +  0] + x00) | 0;
        self.X[di +  1] = (self.X[di +  1] + x01) | 0;
        self.X[di +  2] = (self.X[di +  2] + x02) | 0;
        self.X[di +  3] = (self.X[di +  3] + x03) | 0;
        self.X[di +  4] = (self.X[di +  4] + x04) | 0;
        self.X[di +  5] = (self.X[di +  5] + x05) | 0;
        self.X[di +  6] = (self.X[di +  6] + x06) | 0;
        self.X[di +  7] = (self.X[di +  7] + x07) | 0;
        self.X[di +  8] = (self.X[di +  8] + x08) | 0;
        self.X[di +  9] = (self.X[di +  9] + x09) | 0;
        self.X[di + 10] = (self.X[di +  10] + x10) | 0;
        self.X[di + 11] = (self.X[di +  11] + x11) | 0;
        self.X[di + 12] = (self.X[di +  12] + x12) | 0;
        self.X[di + 13] = (self.X[di +  13] + x13) | 0;
        self.X[di + 14] = (self.X[di +  14] + x14) | 0;
        self.X[di + 15] = (self.X[di +  15] + x15) | 0;

    };
	
	this.rotateLeft = function(i, distance) {
        
		return (i << distance) | (i >>> -distance);
        
    };
	
	
	this.byteArrayToHexString = function(b) {
		
		var sb = [];
		
		for (var i = 0; i < b.length; i++) {
			
			sb.push(((b[i] & 0xff) + 0x100).toString(16).substring(1));
			
		}
		
		return sb.join("");
		
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
	
	
};
