//客製化列表
//ChineseName:中文名稱
//EnglishName:英文名稱
//Disc:硬碟(否為光碟或其他儲存設備)
var CustomizeList = {
    ChineseName: '公版',
    EnglishName: 'General',
    Disc: true
}

function CustomizeMain(custName) {
    var stylecss = custName + "-style.css";
    var toolbarcss = custName + "-toolbar.css";
    var functionjs = custName + "-function.js";
    var toolbarjs = custName + "-toolbar.js";

    LoadScript("js/Customize/" + custName + "/css/" + stylecss, "css");
    LoadScript("js/Customize/" + custName + "/css/" + toolbarcss, "css");
    LoadScript("js/Customize/" + custName + "/" + functionjs, "js", function () {
        CustomIndex();
        CustomToolBar();
    });
    LoadScript("js/Customize/" + custName + "/" + toolbarjs, "js", function () {
        if (!CustomizeList.Disc) {
        }

        mainItem.forEach(function (val, intex) {
            val.btnText = locaItem.filter(function (x) {
                return x.id == val.id;
            })[0].btnText;
        })
        
        ItemDetails.forEach(function (val, intex) {
            tempToolBars[0].btns.push(val);
        })

        getFaceModuleList(mainItem);
    });

    opencloseFun();
}

// 上面最愛的開開關關功能
function opencloseFun() {
    //EaselJS畫筆
    colorPen.CustomizeMain.defaultModel = false;
}