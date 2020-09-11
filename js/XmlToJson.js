function convert_string_to_xml(strXML)
{
	if (window.ActiveXObject) {
		xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
		xmlDoc.async="false";
		xmlDoc.loadXML(strXML);
		return xmlDoc;
	} else {
		parser=new DOMParser();
		xmlDoc=parser.parseFromString(strXML.replace('/r/n',''),"text/xml");
		return xmlDoc;
	}
}

function xml2jsonElementVer(xml) {
    try {
        var obj = {};
        if (xml.childNodes.length > 0) {
            for (var i = 0; i < xml.childNodes.length; i++) {
                var item = xml.childNodes.item(i);
                var nodeName = item.nodeName;

                if (typeof (obj[nodeName]) == "undefined") {
                    obj[nodeName] = xml2jsonElementVer(item);
                } else {
                    if (typeof (obj[nodeName].push) == "undefined") {
                        var old = obj[nodeName];

                        obj[nodeName] = [];
                        obj[nodeName].push(old);
                    }
                    obj[nodeName].push(xml2jsonElementVer(item));
                }
            }
        } else {
            obj = xml.textContent;
        }
        return obj;
    } catch (e) {
        console.log(e.message);
    }
}

function xml2jsonAttributeVer(xml) {
    try {
        var obj = {};

        if (xml.attributes != undefined) {
            if (xml.attributes.length > 0) {
                for (var idx = 0; idx < xml.attributes.length; idx++) {
                    var item = xml.attributes[idx];
                    var nodeName = item.name;

                    if (typeof (obj[nodeName]) == "undefined") {
                        obj[nodeName] = xml2jsonAttributeVer(item);
                    } else {
                        if (typeof (obj[nodeName].push) == "undefined") {
                            var old = obj[nodeName];

                            obj[nodeName] = [];
                            obj[nodeName].push(old);
                        }
                        obj[nodeName].push(xml2jsonAttributeVer(item));
                    }
                }
            }
        } else if (xml.value != undefined) {
            obj = xml.value;
        } else {
            //obj = xml;
        }

        if (xml.childNodes != undefined && xml.childNodes.length > 0) {
            for (var i = 0; i < xml.childNodes.length; i++) {
                var item = xml.childNodes.item(i);
                var nodeName = item.nodeName;

                if (typeof (obj[nodeName]) == "undefined") {
                    obj[nodeName] = xml2jsonAttributeVer(item);
                } else {
                    if (typeof (obj[nodeName].push) == "undefined") {
                        var old = obj[nodeName];

                        obj[nodeName] = [];
                        obj[nodeName].push(old);
                    }
                    obj[nodeName].push(xml2jsonAttributeVer(item));
                }
            }
        }

        return obj;
    } catch (e) {
        console.log(e.message);
    }
}

//中文需轉成UTF16才不會是亂碼
function utf8to16(str) {
    var out, i, len, c;
    var char2, char3;

    out = "";
    len = str.length;
    i = 0;
    while(i < len) {
        c = str.charCodeAt(i++);
        switch (c >> 4) { 
            case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
                // 0xxxxxxx
                out += str.charAt(i-1);
                break;
            case 12: case 13:
                // 110x xxxx   10xx xxxx
                char2 = str.charCodeAt(i++);
                out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                break;
            case 14:
                // 1110 xxxx  10xx xxxx  10xx xxxx
                char2 = str.charCodeAt(i++);
                char3 = str.charCodeAt(i++);
                out += String.fromCharCode(((c & 0x0F) << 12) |
                    ((char2 & 0x3F) << 6) |
                    ((char3 & 0x3F) << 0));
                break;
        }
    }

    return out;
}

var indexJson = xml2jsonAttributeVer(convert_string_to_xml(utf8to16(atob(indexXmlStr))));