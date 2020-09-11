//客製化列表
var customList = [{
    Name: 'General',
}, {
    Name: 'Sanmin',
}, {
    Name: 'Lungteng',
}, {
    Name: 'Kingan',
}, {
    Name: 'TCUST',
}, {
    name: 'Fubon'
}];

function Customize(AppName) {
    CustomizeSet(AppName);
    var eBookVersion = $('#eBookVersion > span');

    document.title = AppName;
    
    eBookVersion[0].innerHTML = eBookProject
    eBookVersion[1].innerHTML = AppName;
    eBookVersion[2].innerHTML = CustomizeVersion;
}

function CustomizeSet(customizeName) {
    var mainjs = customizeName + "-main.js";

    //多語系
    LoadScript("js/Localization/" + MainObj.language + ".js", "js", function () {
        LocalLib.set(TxtLib);
        UIText();
    });

    //載入客製化相關設定(JS、CSS)
    LoadScript("js/Customize/" + customizeName + "/" + mainjs, "js", function () {
        CustomizeMain(customizeName);
    });
}

//執行的時候載入客製化JS
function LoadScript(url, type, callback) {
    if (type == "js") {
        var script = document.createElement("script")
        script.type = "text/javascript";
        script.async = false;
        
        if (script.readyState) {  //IE
            script.onreadystatechange = function () {
                if (script.readyState == "loaded" ||
                    script.readyState == "complete") {
                    script.onreadystatechange = null;
                    callback();
                }
            };
        } else {  //Others
            script.onload = function () {
                callback();
            };
        }

        script.src = url;
        document.getElementsByTagName("head")[0].appendChild(script);
    } else if (type == "css") {
        var link = document.createElement("link")
        link.type = "text/css";
        link.rel = "stylesheet";

        link.href = url;
        document.getElementsByTagName("head")[0].appendChild(link);
    }
}