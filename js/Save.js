//儲存
var saveData = [],
    id = -1;

function SaveAll() {
    saveData = [];

    var temp = [];
    colorPen.LineList.map(function (x) {
        if (!MainObj.trashList.find(function (y) {
            if (y.id == x.id) {
                return y
            }
        })) {
            temp.push(x);
        }
    });
    colorPen.LineList = temp;

    MainObj.trashList = [];
    MainObj.saveList = [];

    PushtoSaveData(colorPen.LineList); //畫筆
    PushtoSaveData(txtCanvas.SaveList); //便利貼
    PushtoSaveData(txtNote.SaveList); //文字便利貼
    PushtoSaveData(txtComment.saveList); //註解
    PushtoSaveData(fileObj.saveList); //檔案
    PushtoSaveData(hyperLink.saveList); //超連結
    PushtoSaveData(TextPopup.saveList); //文字彈跳視窗

    if (ToolBarList.TapList.length > 0) {
        for (var t = 0; t < ToolBarList.TapList.length; t++) {
            if (ToolBarList.TapList[t]) {
                var tapList = {
                    type: 'tap',
                    page: t
                }
                saveData.push(tapList);
            }
        }
    }


    deleteItem();
    bookContent = {
        "Content": saveData
    };
    saveItem(BookList.EBookID, bookContent['Content']);
}

//儲存所有物件至saveData
function PushtoSaveData(list) {
    if (list.length > 0) {
        for (var i = 0; i < list.length; i++) {
            if (list[i] != undefined) {
                saveData.push(list[i]);
            }
        }
    }
}

function deleteItem() {
    var transaction = db.transaction("ebook", "readwrite");
    var objectStore = transaction.objectStore("ebook");
    // var request = objectStore.clear(id);

    // request.onsuccess = function (evt) {
    //     // alert("id:" + id + "刪除成功"); 
    //     // console.log('DELETE:' + id);
    //     reCreateDB();
    // };

    // request.onerror = function (evt) {
    //     console.log("IndexedDB error: " + evt.target.errorCode);
    //     reCreateDB();
    // };
}

function deleteClassProgress() {
    var transaction = dbClass.transaction("class", "readwrite");
    var objectStore = transaction.objectStore("class");
    var request = objectStore.clear(id);

    request.onsuccess = function (evt) {
        reCreateClassDB();
    };

    request.onerror = function (evt) {
        console.log("IndexedDB error: " + evt.target.errorCode);
        reCreateClassDB();
    };
}

function saveItem(guid, content) {
    var transaction = db.transaction("ebook", "readwrite");
    var objectStore = transaction.objectStore("ebook");

    var BookID = guid;
    //var Content = {a: guid + '1', b: guid + '2', c: guid + '3'};
    var Content = content;

    var index = objectStore.index("BookID"),
        objectStoreTitleRequest = index.get(guid);

    objectStoreTitleRequest.onsuccess = function () {

        var data = objectStoreTitleRequest.result;
        if (data) {
            data.Content = Content;
            var request = objectStore.put(data);
        } else {
            var request = objectStore.add({
                "BookID": BookID,
                "Content": Content
            });
        }

        request.onsuccess = function (evt) {
            // alert('資料儲存成功！');
        };
        request.onerror = function (evt) {
            BookAlertShow("IndexedDB error: " + evt.target.errorCode, "");

        };
    };
}

// 儲存班級進度至DB
function saveClassProgress(classList) {
    var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;

    if (ReceiveList) {
        CommandToWPF('SaveClassSchedule', JSON.stringify(classList));
        return;
    }

    deleteClassProgress();
    var transaction = dbClass.transaction("class", "readwrite");
    var objectStore = transaction.objectStore("class");

    var request = objectStore.add({
        "BookID": BookList.EBookID,
        "Content": classList
    });

    request.onsuccess = function (evt) {
        // alert('資料儲存成功！');
    };
    request.onerror = function (evt) {
        BookAlertShow("IndexedDB error: " + evt.target.errorCode, "");

    };
}

function LoadindexedDB(guid) {

    if (typeof (db) == 'undefined') {
        reCreateDB();
    }
    if (typeof (dbClass) == 'undefined') {
        reCreateClassDB();
    }

    setTimeout(function () {
        var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;

        if (indexedDB != undefined) {
            var transaction = db.transaction("ebook", "readwrite"),
                objectStore = transaction.objectStore("ebook"),
                index = objectStore.index("BookID"),
                request = index.get(guid);
            request.onsuccess = function (evt) {
                var cursor = evt.target.result;
                if (cursor) {
                    loadSaveObj(cursor.Content);
                } else {
                    //查詢結束  
                    loadSaveObj('');
                }
            };
            request.onerror = function (evt) {
                console.log("IndexedDB error: " + evt.target.errorCode);
            };

            var transactionClass = dbClass.transaction("class", "readwrite"),
                objectStoreClass = transactionClass.objectStore("class"),
                indexClass = objectStoreClass.index("BookID"),
                requestClass = indexClass.get(guid);
            requestClass.onsuccess = function (evt) {
                var cursor = evt.target.result;
                if (cursor) {
                    classProgressList = cursor.Content;
                } else {
                    //查詢結束  
                }
            };
            requestClass.onerror = function (evt) {
                console.log("IndexedDB error: " + evt.target.errorCode);
            };
        } else {
            LoadNoteXML();
        }
    }, 1000);
}

function reCreateClassDB() {
    //indexDB
    var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;

    if (indexedDB == undefined) {
        return;
    }

    var request = indexedDB.open("class", 1); //db name
    request.onsuccess = function (evt) {
        // 將db暫存起來供以後操作
        dbClass = request.result;
    };

    request.onerror = function (evt) {
        console.log("IndexedDB error: " + evt.target.errorCode);
    };


    request.onupgradeneeded = function (evt) {
        var objectStore = evt.currentTarget.result.createObjectStore("class", {
            keyPath: "id",
            autoIncrement: true
        }); //table name

        objectStore.createIndex("BookID", "BookID", {
            unique: true
        });
        objectStore.createIndex("Content", "Content", {
            unique: false
        });

    };
}

function reCreateDB() {
    //indexDB
    var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;

    if (indexedDB == undefined) {
        return;
    }

    var request = indexedDB.open("ebook", 1); //db name
    request.onsuccess = function (evt) {
        // 將db暫存起來供以後操作
        db = request.result;

    };

    request.onerror = function (evt) {
        console.log("IndexedDB error: " + evt.target.errorCode);
    };


    request.onupgradeneeded = function (evt) {
        var objectStore = evt.currentTarget.result.createObjectStore("ebook", {
            keyPath: "id",
            autoIncrement: true
        }); //table name

        objectStore.createIndex("BookID", "BookID", {
            unique: true
        });
        objectStore.createIndex("Content", "Content", {
            unique: false
        });

    };
}

//讀取存在indexdb的資料，並insert至各自的List裡，並先生出第一頁的物件
function loadSaveObj(json) {

    if (json != '') {

        txtCanvas.canvasList = [];
        for (var i = 0; i < json.length; i++) {

            switch (json[i].type) {

                case 'pen':
                    colorPen.LineList.push(json[i]);
                    break;
                case 'txtCanvas':
                    txtCanvas.SaveList.push(json[i]);
                    if (json[i].points.length > 0) {
                        for (var p = 0; p < json[i].points.length; p++) {
                            txtCanvas.canvasList.push(json[i].points[p]);
                        }
                    }
                    break;
                case 'txtNote':
                    txtNote.SaveList.push(json[i]);
                    break;
                case 'tap':
                    ToolBarList.TapList[json[i].page] = true;
                    break;
                case 'comment':
                    txtComment.saveList.push(json[i]);
                    break;
                case 'file':
                    fileObj.saveList.push(json[i]);
                    break;
                case 'hyperLink':
                    hyperLink.saveList.push(json[i]);
                    break;
                case 'textPopup':
                    TextPopup.saveList.push(json[i]);
                    break;
            }
        }

        DrawPen(0);
        ReplyCanvas(0);
        ReplyNote(0);
        if (ToolBarList.TapList[0]) {
            tapLayer();
        }
        replyComment(0);
        replyFile();
        replyLink();

    }

}

//all = true表示整本書的註記，false表示當頁註記
function sendXML(all) {

    var jsonObjTitle = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';

    var x2js = new X2JS();

    var jsonObj = {
        Note: {
            // SourceDataList: {},
            UserData: {
                LoginID: Exam.LoginID,
                PassWord: Exam.PassWord,
                NonCodedPassword: null
            },
            Book: {
                Device: null,
                Identifier: BookList.EBookID,
                FileName: Exam.FileName,
                Date: new Date()
            },
            ProcedureSliceList: {}
        }
    };

    var UserCreateObject;

    if (!all) {
        jsonObj.Note.ProcedureSliceList.ProcedureSlice = {
            '_page': MainObj.NowPage,
            UserCreateObjectList: {}
        }

        UserCreateObjectList = jsonObj.Note.ProcedureSliceList.ProcedureSlice.UserCreateObjectList;

        UserCreateObject = datatoXML(UserCreateObjectList, MainObj.NowPage);
    } else {

        jsonObj.Note.ProcedureSliceList = {
            ProcedureSlice: []
        }

        for (var i = 0; i < HamaList.length; i++) {

            var arr = {
                '_page': i,
                UserCreateObjectList: {}
            }

            jsonObj.Note.ProcedureSliceList.ProcedureSlice.push(arr);

            UserCreateObjectList = jsonObj.Note.ProcedureSliceList.ProcedureSlice[i].UserCreateObjectList;

            UserCreateObject = datatoXML(UserCreateObjectList, i);
        }
    }

    var xmlAsStr = jsonObjTitle + x2js.json2xml_str(jsonObj).replace(/'/g, '"');

    return xmlAsStr;
}

//註記資料轉XML
function datatoXML(list, page) {
    if (
        txtNote.SaveList.length > 0 ||
        txtCanvas.SaveList.length > 0 ||
        colorPen.LineList.length > 0 ||
        markList.length > 0 ||
        InsertImg.SaveList.length > 0 ||
        txtComment.saveList.length > 0 ||
        fileObj.saveList.length > 0 ||
        hyperLink.saveList.length > 0 ||
        TextPopup.saveList.length > 0
    ) {
        list.UserCreateObject = [];
        list = list.UserCreateObject;

        //文字
        for (var n = 0; n < txtNote.SaveList.length; n++) {
            var obj = txtNote.SaveList[n];
            if (obj != undefined) {
                if (obj.page == page) {
                    var arr = {
                        '_FormatterType': "Hamastar.AddIns.Whiteboard.StickyObjectFormatter",
                        '_InitialTargetSize.Height': MainObj.CanvasHeight,
                        '_InitialTargetSize.Width': MainObj.CanvasWidth,
                        '_BoundaryPoint.Bounds.Location.Y': obj.top.split('px')[0],
                        '_BoundaryPoint.Bounds.Location.X': obj.left.split('px')[0],
                        '_BoundaryPoint.Bounds.Size.Height': obj.height.split('px')[0],
                        '_BoundaryPoint.Bounds.Size.Width': obj.width.split('px')[0],
                        '_StickyViewVisibility': obj.StickyViewVisibility,
                        '_StickyViewType': "stickyText",
                        '_LayerIndex': n,
                        '_Identifier': obj.id,
                        '_Contents': obj.value,
                        '_FrameColor': obj.bgcolor.replace('#', '')
                    }

                    list.push(arr);
                }
            }
        }

        //便利貼
        for (var a = 0; a < txtCanvas.SaveList.length; a++) {
            var obj = txtCanvas.SaveList[a];
            if (obj != undefined) {
                if (obj.page == page) {

                    var arr = {
                        '_FormatterType': "Hamastar.AddIns.Whiteboard.StickyObjectFormatter",
                        '_InitialTargetSize.Height': MainObj.CanvasHeight,
                        '_InitialTargetSize.Width': MainObj.CanvasWidth,
                        '_BoundaryPoint.Bounds.Location.Y': obj.top.split('px')[0],
                        '_BoundaryPoint.Bounds.Location.X': obj.left.split('px')[0],
                        '_BoundaryPoint.Bounds.Size.Height': obj.height.split('px')[0],
                        '_BoundaryPoint.Bounds.Size.Width': obj.width.split('px')[0],
                        '_StickyViewVisibility': obj.StickyViewVisibility,
                        '_StickyViewType': "stickyDraw",
                        '_LayerIndex': a,
                        '_Identifier': obj.id,
                        'StickyDraw.IntegerPathList': {
                            'IntegerPath': []
                        }
                    }

                    for (var p = 0; p < obj.points.length; p++) {
                        if (obj.points[p]) {
                            arr['StickyDraw.IntegerPathList']['IntegerPath'].push({
                                'Point': creatAllPoints(obj.points[p])
                            });
                        }
                    }

                    list.push(arr);
                }
            }
        }

        //畫筆
        var temp = [];
        colorPen.LineList.map(function (x) {
            if (!MainObj.trashList.find(function (y) {
                if (y.id == x.id) {
                    return y
                }
            })) {
                temp.push(x);
            }
        });
        colorPen.LineList = temp;
        for (var i = 0; i < colorPen.LineList.length; i++) {

            if (colorPen.LineList[i] != undefined) {
                var obj = colorPen.LineList[i].object;

                if (colorPen.LineList[i].page == page) {

                    var arr = {
                        '_FormatterType': "Hamastar.AddIns.Whiteboard.BrushObjectFormatter",
                        '_InitialTargetSize.Height': MainObj.CanvasHeight,
                        '_InitialTargetSize.Width': MainObj.CanvasWidth,
                        '_BoundaryPoint.Bounds.Location.Y': "0",
                        '_BoundaryPoint.Bounds.Location.X': "0",
                        '_BoundaryPoint.Bounds.Size.Height': MainObj.CanvasHeight,
                        '_BoundaryPoint.Bounds.Size.Width': MainObj.CanvasWidth,
                        '_ForeColor': getARGBInt(obj.color, obj.opacity),
                        '_PixelSize': obj.penwidth,
                        '_Opacity': obj.opacity,
                        '_LayerIndex': i,
                        '_Identifier': colorPen.LineList[i].id,
                        '_BrushType': colorPen.LineList[i].BrushType,
                        'Points': {
                            'Point': creatAllPoints(colorPen.LineList[i].points)
                        }
                    }

                    list.push(arr);
                }
            }
        }

        //註記
        for (var m = 0; m < markList.length; m++) {
            if (markList[m]) {
                var mark = markList[m];
                if (mark.page == page) {
                    var arr = {
                        '_FormatterType': "Hamastar.AddIns.Whiteboard.MarkObjectFormatter",
                        '_Identifier': mark.id,
                        '_MarkContent': mark.value,
                        '_InitialTargetSize.Height': MainObj.CanvasHeight,
                        '_InitialTargetSize.Width': MainObj.CanvasWidth
                    }
                    list.push(arr);
                }
            }
        }

        //圖片
        for (var r = 0; r < InsertImg.SaveList.length; r++) {
            if (InsertImg.SaveList[r]) {
                var img = InsertImg.SaveList[r];
                if (Number(img.page) == Number(page)) {
                    var arr = {
                        '_FormatterType': "Hamastar.AddIns.Whiteboard.InsertImageFormatter",
                        '_Identifier': img.id,
                        '_BoundaryPoint.Bounds.Location.Y': img.top.split('px')[0],
                        '_BoundaryPoint.Bounds.Location.X': img.left.split('px')[0],
                        '_BoundaryPoint.Bounds.Size.Height': img.height.split('px')[0],
                        '_BoundaryPoint.Bounds.Size.Width': img.width.split('px')[0],
                        '_Picture': img.pic
                    }
                    list.push(arr);
                }
            }
        }

        //註解
        txtComment.saveList.map(function (res) {
            if (res.page == page) {
                var arr = {
                    '_FormatterType': "Hamastar.AddIns.Whiteboard.AnnotationObjectFormatter",
                    '_Identifier': res.id,
                    '_Contents': res.value,
                    '_InitialTargetSize.Height': MainObj.CanvasHeight,
                    '_InitialTargetSize.Width': MainObj.CanvasWidth,
                    '_IsShow': res.isShow,
                    'Points': {
                        'Point': []
                    }
                }

                var fromX = res.position.from.X.toFixed(3),
                    fromY = res.position.from.Y.toFixed(3),
                    toX = res.position.to.X.toFixed(3),
                    toY = res.position.to.Y.toFixed(3);

                if (fromY == toY) { // 橫
                    arr['_BoundaryPoint.Bounds.Location.X'] = fromX;
                    arr['_BoundaryPoint.Bounds.Location.Y'] = fromY;
                    arr['_BoundaryPoint.Bounds.Size.Width'] = toX - fromX;
                    arr['_BoundaryPoint.Bounds.Size.Height'] = 10;
                } else { // 直
                    arr['_BoundaryPoint.Bounds.Location.X'] = fromX;
                    arr['_BoundaryPoint.Bounds.Location.Y'] = fromY;
                    arr['_BoundaryPoint.Bounds.Size.Width'] = 10;
                    arr['_BoundaryPoint.Bounds.Size.Height'] = toY - fromY;
                }

                var p = [];
                p.push({
                    '_X': res.position.from.X.toFixed(3),
                    '_Y': res.position.from.Y.toFixed(3)
                });
                p.push({
                    '_X': res.position.to.X.toFixed(3),
                    '_Y': res.position.to.Y.toFixed(3)
                });
                arr.Points.Point = p;

                list.push(arr);
            }
        });

        //檔案
        for (var z = 0; z < fileObj.saveList.length; z++) {
            var obj = fileObj.saveList[z];
            if (obj != undefined) {
                if (obj.IsPatch == 'true') return;
                if (Number(obj.page) == Number(page)) {
                    var arr = obj.fileName.split('.').pop().toLowerCase() == 'mp4' ? {
                        '_FormatterType': "Hamastar.AddIns.Whiteboard.VideoObjectFormatter",
                        '_Identifier': obj.id,
                        '_BoundaryPoint.Bounds.Location.Y': obj.top,
                        '_BoundaryPoint.Bounds.Location.X': obj.left,
                        '_BoundaryPoint.Bounds.Size.Height': obj.height,
                        '_BoundaryPoint.Bounds.Size.Width': obj.width,
                        '_VideoFileName': obj.fileName,
                        '_Fadeout': false,
                        '_SliderBar': true,
                        '_AutoPlay': false,
                        '_PowerCamMode': 0,
                        '_LayerIndex': z,
                        '_InitialTargetSize.Height': MainObj.CanvasHeight,
                        '_InitialTargetSize.Width': MainObj.CanvasWidth
                    } : {
                            '_FormatterType': "Hamastar.AddIns.Whiteboard.PhotoObjectFormatter",
                            '_Identifier': obj.id,
                            '_BoundaryPoint.Bounds.Location.Y': obj.top,
                            '_BoundaryPoint.Bounds.Location.X': obj.left,
                            '_BoundaryPoint.Bounds.Size.Height': obj.height,
                            '_BoundaryPoint.Bounds.Size.Width': obj.width,
                            '_XFileName': obj.fileName,
                            '_Visibility': true,
                            '_LayerIndex': z,
                            '_InitialTargetSize.Height': MainObj.CanvasHeight,
                            '_InitialTargetSize.Width': MainObj.CanvasWidth
                        };
                    if (obj.file) {
                        arr['_File'] = obj.file;
                    }
                    list.push(arr);
                }
            }
        }

        //超連結
        hyperLink.saveList.map(function (res) {
            if (res) {
                if (Number(res.page) == Number(page)) {
                    var arr = {
                        '_FormatterType': "Hamastar.AddIns.Whiteboard.HyperLinkObjectFormatter",
                        '_Identifier': res.id,
                        '_BoundaryPoint.Bounds.Location.Y': res.top,
                        '_BoundaryPoint.Bounds.Location.X': res.left,
                        '_Title': res.title,
                        '_PathUrl': res.src,
                        '_InitialTargetSize.Height': MainObj.CanvasHeight,
                        '_InitialTargetSize.Width': MainObj.CanvasWidth
                    };
                    list.push(arr);
                }
            }
        });

        //文字彈跳視窗
        TextPopup.saveList.map(function (res) {
            if (res) {
                if (Number(res.page) == Number(page)) {
                    var arr = {
                        '_FormatterType': "Hamastar.AddIns.Whiteboard.TextPopupObjectFormatter",
                        '_Identifier': res.id,
                        '_BoundaryPoint.Bounds.Location.Y': res.top,
                        '_BoundaryPoint.Bounds.Location.X': res.left,
                        '_InitialTargetSize.Height': MainObj.CanvasHeight,
                        '_InitialTargetSize.Width': MainObj.CanvasWidth,
                        '_ContentWithoutCss': res.content,
                        '_Content': res.oldContent,
                    };
                    list.push(arr);
                }
            }
        });
    }

    return list;
}

//畫筆point組成array
function creatAllPoints(points) {
    var P = [];
    if (points != undefined) {
        for (var i = 0; i < points.length; i++) {

            var arr = {
                '_X': points[i].X.toFixed(3),
                '_Y': points[i].Y.toFixed(3)
            }

            P.push(arr);
        }
    }

    return P;
}