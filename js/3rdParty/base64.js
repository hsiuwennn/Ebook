/**
*
*  Base64 encode / decode
*  http://www.webtoolkit.info/
*
**/

 
var Base64 = {
 
        // private property
        PADCHAR : '=',
       _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
 
     // public method for encoding
     encode : function (input) {
               var output = "";
          var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
             var i = 0;
 
         input = Base64._utf8_encode(input);
 
                while (i < input.length) {
 
                      chr1 = input.charCodeAt(i++);
                     chr2 = input.charCodeAt(i++);
                     chr3 = input.charCodeAt(i++);
 
                      enc1 = chr1 >> 2;
                   enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                   enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                  enc4 = chr3 & 63;
 
                      if (isNaN(chr2)) {
                                enc3 = enc4 = 64;
                 } else if (isNaN(chr3)) {
                         enc4 = 64;
                        }
 
                  output = output +
                 this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                   this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
 
             }
 
          return output;
    },
 
 // public method for decoding
     decode : function (s) {
                   s = '' + s;                                                                                         
                                                                                                            
        var getbyte64 = Base64.getbyte64;                                                                   
                                                                                                            
        var pads, i, b10;                                                                                   
                                                                                                            
        var imax = s.length                                                                                 
                                                                                                            
        if (imax === 0) {                                                                                   
                                                                                                            
            return s;                                                                                       
                                                                                                            
        }                                                                                                   
                                                                                                            
                                                                                                            
                                                                                                            
        if (imax % 4 !== 0) {                                                                               
                                                                                                            
            throw Base64.makeDOMException();                                                                
                                                                                                            
        }                                                                                                   
                                                                                                            
                                                                                                            
                                                                                                            
        pads = 0                                                                                            
                                                                                                            
        if (s.charAt(imax - 1) === this.PADCHAR) {                                                        
                                                                                                            
            pads = 1;                                                                                       
                                                                                                            
            if (s.charAt(imax - 2) === this.PADCHAR) {                                                    
                                                                                                            
                pads = 2;                                                                                   
                                                                                                            
            }                                                                                               
                                                                                                            
            // either way, we want to ignore this last block                                                
                                                                                                            
            imax -= 4;                                                                                      
                                                                                                            
        }                                                                                                   
                                                                                                            
                                                                                                            
                                                                                                            
        var x = [];                                                                                         
                                                                                                            
        for (i = 0; i < imax; i += 4) {                                                                     
                                                                                                            
            b10 = (Base64.getbyte64(s,i) << 18) | (Base64.getbyte64(s,i+1) << 12) |                                       
                                                                                                            
                (Base64.getbyte64(s,i+2) << 6) | Base64.getbyte64(s,i+3);                                                 
                                                                                                            
            x.push(String.fromCharCode(b10 >> 16, (b10 >> 8) & 0xff, b10 & 0xff));                          
                                                                                                            
        }                                                                                                   
                                                                                                            
                                                                                                            
                                                                                                            
        switch (pads) {                                                                                     
                                                                                                            
        case 1:                                                                                             
                                                                                                            
            b10 = (Base64.getbyte64(s,i) << 18) | (Base64.getbyte64(s,i+1) << 12) | (Base64.getbyte64(s,i+2) << 6);              
                                                                                                            
            x.push(String.fromCharCode(b10 >> 16, (b10 >> 8) & 0xff));                                      
                                                                                                            
            break;                                                                                          
                                                                                                            
        case 2:                                                                                             
                                                                                                            
            b10 = (Base64.getbyte64(s,i) << 18) | (Base64.getbyte64(s,i+1) << 12);                                        
                                                                                                            
            x.push(String.fromCharCode(b10 >> 16));                                                         
                                                                                                            
            break;                                                                                          
                                                                                                            
        }

        return x.join('');
     
      },
 
 // private method for UTF-8 encoding
      _utf8_encode : function (string) {
                string = string.replace(/\r\n/g,"\n");
            var utftext = "";
 
          for (var n = 0; n < string.length; n++) {
 
                       var c = string.charCodeAt(n);
 
                      if (c < 128) {
                         utftext += String.fromCharCode(c);
                        }
                 else if((c > 127) && (c < 2048)) {
                          utftext += String.fromCharCode((c >> 6) | 192);
                             utftext += String.fromCharCode((c & 63) | 128);
                       }
                 else {
                            utftext += String.fromCharCode((c >> 12) | 224);
                            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                          utftext += String.fromCharCode((c & 63) | 128);
                       }
 
          }
 
          return utftext;
   },
 
 // private method for UTF-8 decoding
      _utf8_decode : function (utftext) {
               var string = "";
          var i = 0;
                var c = c1 = c2 = 0;
 
               while ( i < utftext.length ) {
 
                  c = utftext.charCodeAt(i);
 
                 if (c < 128) {
                         string += String.fromCharCode(c);
                         i++;
                      }
                 else if((c > 191) && (c < 224)) {
                           c2 = utftext.charCodeAt(i+1);
                             string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                         i += 2;
                   }
                 else {
                            c2 = utftext.charCodeAt(i+1);
                             c3 = utftext.charCodeAt(i+2);
                             string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                           i += 3;
                   }
 
          }
 
          return string;
    },

    getbyte64 : function(s,i) {                                                                      
                                                                                                        
        // This is oddly fast, except on Chrome/V8.                                                         
                                                                                                            
        //  Minimal or no improvement in performance by using a                                             
                                                                                                            
        //   object with properties mapping chars to value (eg. 'A': 0)                                     
                                                                                                            
        var idx = this._keyStr.indexOf(s.charAt(i));                                                        
                                                                                                            
        if (idx === -1) {                                                                                   
                                                                                                            
            throw Base64.makeDOMException();                                                                
                                                                                                            
        }                                                                                                   
                                                                                                            
        return idx;                                                                                         
                                                                                                            
    },

    makeDOMException : function() {                                                                  
                                                                                                        
        // sadly in FF,Safari,Chrome you can't make a DOMException                                          
                                                                                                            
        var e, tmp;                                                                                         
                                                                                                            
                                                                                                            
                                                                                                            
        try {                                                                                               
                                                                                                            
            return new DOMException(DOMException.INVALID_CHARACTER_ERR);                                    
                                                                                                            
        } catch (tmp) {                                                                                     
                                                                                                            
            // not available, just passback a duck-typed equiv                                              
                                                                                                            
            // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Error          
                                                                                                            
            // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Error/prototype
                                                                                                            
            var ex = new Error("DOM Exception 5");                                                          
                                                                                                            
                                                                                                            
                                                                                                            
            // ex.number and ex.description is IE-specific.                                                 
                                                                                                            
            ex.code = ex.number = 5;                                                                        
                                                                                                            
            ex.name = ex.description = "INVALID_CHARACTER_ERR";                                             
                                                                                                            
                                                                                                            
                                                                                                            
            // Safari/Chrome output format                                                                  
                                                                                                            
            ex.toString = function() { return 'Error: ' + ex.name + ': ' + ex.message; };                   
                                                                                                            
            return ex;                                                                                      
                                                                                                            
        }                                                                                                   
                                                                                                            
    }
 
}