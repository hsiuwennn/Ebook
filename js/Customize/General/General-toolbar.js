// 主要工具列
var mainItem = [{
    id: "back",
    btnText: "返回",
    Enable: true
}, {
    id: "fullscreen",
    btnText: "全螢幕",
    Enable: true
}, {
    id: "jump",
    btnText: "跳頁",
    Enable: true
}, {
    id: "tab",
    btnText: "頁籤",
    Enable: true
}, {
    id: "prevPage",
    btnText: "上頁",
    Enable: true
}, {
    id: "nextPage",
    btnText: "下頁",
    Enable: true
}, {
    id: "txtnote",
    btnText: "文字",
    Enable: true
}, {
    id: "txtcanvas",
    btnText: "便利貼",
    Enable: true
}, {
    id: "colorPen",
    btnText: "畫筆",
    Enable: true
}, {
    id: "ColorsPicker",
    btnText: "調色盤",
    Enable: true
}, {
    id: "eraser",
    btnText: "橡皮擦",
    Enable: true
}, {
    id: "zoomIn",
    btnText: "放大",
    Enable: true
}, {
    id: "zoomOut",
    btnText: "縮小",
    Enable: true
}, {
    id: "save",
    btnText: "儲存",
    Enable: true
}, {
    id: "coverPage",
    btnText: "封面",
    Enable: true
}, {
    id: "backCoverPage",
    btnText: "封底",
    Enable: true
}, {
    id: "zoom100",
    btnText: "100%",
    Enable: true
}];

var ItemDetails = [
    {
        //書架
        "id": "back",
        "beforespanTextName": "書架",
        "afterspanTextName": "書架",
        "afterClick": false,
        "beforeStyle": {
            'background-image': 'ToolBar/btnBackbefore.png'
        },
        "afterStyle": {
            'background-image': 'ToolBar/btnBackafter.png'
        },
        action: function () {
            if (
                txtNote.SaveList.length > 0 ||
                txtCanvas.SaveList.length > 0 ||
                colorPen.LineList.length > 0 ||
                markList.length > 0 ||
                InsertImg.SaveList.length > 0 ||
                txtComment.saveList.length > 0 ||
                fileObj.saveList.length > 0 ||
                hyperLink.saveList.length > 0
            ) {
                confirmShow('離開前，是否儲存註記？', "", true, function (res) {
                    if (res) {
                        window.external.saveNoteXML(sendXML(true));
                    }
                    CallExToExit();
                });
            } else {
                CallExToExit();
            }
        }
    }, {
        // 頁籤
        "id": "tab",
        "beforespanTextName": "頁籤",
        "afterspanTextName": "頁籤",
        "afterClick": false,
        "beforeStyle": {
            'background-image': 'ToolBar/btnTabBefore.png'
        },
        "afterStyle": {
            'background-image': 'ToolBar/btnTabAfter.png'
        },
        action: function () {
            if (!this.afterClick) {
                changeAllBtnToFalse();
            }

            this.afterClick = !this.afterClick;
            checkBtnChange(this);

            tapLayer();

        }
    }, {
        //畫筆
        "id": "colorPen",
        "beforespanTextName": "畫筆",
        "afterspanTextName": "畫筆",
        "afterClick": false,
        "type": "pen",
        "beforeStyle": {
            'background-image': 'ToolBar/btnPenBefore.png'
        },
        "afterStyle": {
            'background-image': 'ToolBar/btnPenAfter.png'
        },
        action: function () {
            if (!this.afterClick) {
                changeAllBtnToFalse();
            }

            this.afterClick = !this.afterClick;
            checkBtnChange(this);

            if (ToolBarList.AddWidgetState == 'colorPen') {
                GalleryStartMove();
                ToolBarList.AddWidgetState = 'none';
                $('#canvasPad').remove();
            } else {
                ToolBarList.AddWidgetState = 'colorPen';

                GalleryStopMove();
                NewCanvas();

                var canvasPad = $('#canvas')[0];
                canvasPad.id = 'canvasPad';
                canvasPad.width = $(window).width() * ToolBarList.ZoomScale;
                canvasPad.height = $(window).height() * ToolBarList.ZoomScale;

                $(canvasPad).attr('class', 'canvasPad');

                if(colorPen.CustomizeMain.defaultModel) {
                    stage = new createjs.Stage(canvasPad);

                    stage.addEventListener("stagemousedown", handleMouseDown);
                    stage.addEventListener("stagemouseup", handleMouseUp);

                    stage.update();
                } else {
                    var cxt = canvasPad.getContext('2d');
                    cxt.strokeStyle = colorPen.Color;
                    cxt.lineWidth = colorPen.Width;
                    cxt.globalAlpha = colorPen.Opacity;
                    cxt.lineCap = colorPen.BrushType == 'rect' ? 'butt' : 'round';
                    cxt.lineJoin = colorPen.BrushType == 'rect' ? 'miter' : 'round';
    
                    $(canvasPad).on('mousedown touchstart', function (e) {
                        StartPen(e, canvasPad);
                    });
                    $(canvasPad).on('mousemove touchmove', function (e) {
                        canvasPadMove(e, canvasPad);
                    });
                    $(canvasPad).on('mouseup touchend', function () {
                        canvasPadUp(canvasPad, cxt.lineWidth, cxt.globalAlpha);
                    });

                    Hammer(canvasPad).on('doubletap', function (e) {
                        GalleryStartMove();
                        ToolBarList.AddWidgetState = 'none';
                        $('#canvasPad').remove();
                        changeAllBtnToFalse();
                        colorPen.Drag = false;
                    });
                }
                
                $(canvasPad).on('dblclick', function () {
                    GalleryStartMove();
                    ToolBarList.AddWidgetState = 'none';
                    $('#canvasPad').remove();
                    changeAllBtnToFalse();
                    colorPen.Drag = false;
                });
            }
        }
    }, {
        // 儲存本機
        "id": "save",
        "beforespanTextName": "儲存本機",
        "afterspanTextName": "儲存本機",
        "afterClick": false,
        "type": "save",
        "beforeStyle": {
            'background-image': 'ToolBar/btnSaveBefore.png'
        },
        "afterStyle": {
            'background-image': 'ToolBar/btnSaveAfter.png'
        },
        action: function () {
            var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
            if (indexedDB == undefined) {
                window.external.saveNoteXML(sendXML(true));

                MainObj.trashList = [];
                MainObj.saveList = [];
            } else {
                SaveAll();
                resetUndo();
            }
            BookAlertShow('儲存成功！', "SavFin");
        }
    }
]