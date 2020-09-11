//縮放
var ZoomList = {
    IsZoom: false, //是否縮放
    DistX: 0, //距離X
    DistY: 0, //距離Y
    ClientX: 0, //滾輪時滑鼠X
    ClientY: 0, //滾輪時滑鼠Y
    Drag: false,
    Down: {
        X: 0,
        Y: 0
    }, //滑鼠點擊的座標
    Move: {
        X: 0,
        Y: 0
    }, //滑鼠移動的座標
    Isdraggable: false,
    Top: 0, //局部放大位移至中心Top
    Left: 0, //局部放大位移至中心Left
    AreaDistX: 0, //局部放大距離中心點X
    AreaDistY: 0, //局部放大距離中心點Y
    IsAreaZoom: false,
    MaxZoom: 3, //最大放大參數
    MinZoom: 1, //最小縮小參數
    dragOffsetLeft: 0,
    dragOffsetTop: 0,
    dragCanvasPosition: {
        down: {
            X: 0,
            Y: 0
        },
        move: {
            X: 0,
            Y: 0
        },
        isdrag: false,
        left: 0,
        top: 0
    },
    CustomizeMain: {
        defaultDraggable: true
    }
}


//放大
function zoomIn() {

    GalleryStopMove();
    $(window).off("resize", resizeInit);

    $('#dragCanvas').remove();

    ZoomAttrPosition();

    ToolBarList.ZoomScale = ToolBarList.ZoomScale + 0.5 <= ZoomList.MaxZoom ? ToolBarList.ZoomScale + 0.5 : ZoomList.MaxZoom;

    var scale = ToolBarList.ZoomScale;

    if (ToolBarList.ZoomScale > 1) {
        ZoomList.IsZoom = true;
    }

    if (ZoomList.CustomizeMain.defaultDraggable) {
        ZoomList.Isdraggable = true;

        var palmBtn = checkBtnStatus('palm');

        palmBtn.afterClick = true;
        $('#' + palmBtn.id).attr('src', 'ToolBar/palmafter.png');
    } else {
        ZoomList.Isdraggable = false
    }

    zoomSetting(scale);

    var zoomInBtn = checkBtnStatus('zoomIn');
    var zoomOutBtn = checkBtnStatus('zoomOut');


    zoomOutBtn.afterClick = false;
    checkBtnChange(zoomOutBtn);

    if (ToolBarList.ZoomScale == 3) {
        zoomInBtn.afterClick = true;
        checkBtnChange(zoomInBtn);
    }
}

//縮小
function zoomOut(zoom100) {

    GalleryStopMove();
    $(window).off("resize", resizeInit);

    //縮放前，先加最原始的left及top至html5上，縮放時物件的位置才不會跑掉
    if (ToolBarList.ZoomScale == 1) {
        if ($('.canvasObj')[0] != undefined) {
            for (var j = 0; j < $('.canvasObj').length; j++) {

                $($('.canvasObj')[j]).attr({
                    'left': $('.canvasObj')[j].offsetLeft,
                    'top': $('.canvasObj')[j].offsetTop,
                    'tempWidth': $($('.canvasObj')[j]).width(),
                    'tempHeight': $($('.canvasObj')[j]).height(),
                })
            }
        }
    }

    ToolBarList.ZoomScale = (ToolBarList.ZoomScale - 0.5 > ZoomList.MinZoom ? ToolBarList.ZoomScale - 0.5 : ZoomList.MinZoom);

    if (zoom100) {
        ToolBarList.ZoomScale = 1;
    }

    if (ToolBarList.ZoomScale == 1) {
        ZoomList.IsZoom = false;
        ZoomList.IsAreaZoom = false;
        ZoomList.dragCanvasPosition.isdrag = false;
    }

    var scale = ToolBarList.ZoomScale;

    if (ZoomList.CustomizeMain.defaultDraggable) {
        ZoomList.Isdraggable = true;

        var palmBtn = checkBtnStatus('palm');

        palmBtn.afterClick = false;
        $('#' + palmBtn.id).attr('src', 'ToolBar/palmbefore.png');
    } else {
        ZoomList.Isdraggable = false
    }

    zoomSetting(scale);

    $('#dragCanvas').remove();

    var zoomInBtn = checkBtnStatus('zoomIn');
    zoomInBtn.afterClick = false;
    checkBtnChange(zoomInBtn);

    if (ToolBarList.ZoomScale == 1) {
        $('#dragCanvas').remove();

        GalleryStartMove();

        //回復resize
        $(window).resize(resizeInit);

        var zoomOutBtn = checkBtnStatus('zoomOut');

        zoomOutBtn.afterClick = true;
        checkBtnChange(zoomOutBtn);
    }

    if (ToolBarList.ZoomScale == 1) {
        DrawPen(MainObj.NowPage);
    }
}

function StartZoom(event, canvas) {
    var rect = canvas.getBoundingClientRect(),
        scaleX = canvas.width / rect.width,
        scaleY = canvas.height / rect.height;

    ZoomList.Down.X = event.type == 'touchstart' ? event.targetTouches[0].pageX : (event.clientX ? event.clientX : event.originalEvent.clientX);
    ZoomList.Down.Y = event.type == 'touchstart' ? event.targetTouches[0].pageY : (event.clientY ? event.clientY : event.originalEvent.clientY);

    ZoomList.Down.X = (ZoomList.Down.X - rect.left) * scaleX;
    ZoomList.Down.Y = (ZoomList.Down.Y - rect.top) * scaleY;

    ZoomList.Drag = true;
}

function MoveZoom(event, canvas) {
    if (ZoomList.Drag) {
        var rect = canvas.getBoundingClientRect(),
            scaleX = canvas.width / rect.width,
            scaleY = canvas.height / rect.height;

        ZoomList.Move.X = event.type == 'touchmove' ? event.targetTouches[0].pageX : (event.clientX ? event.clientX : event.originalEvent.clientX);
        ZoomList.Move.Y = event.type == 'touchmove' ? event.targetTouches[0].pageY : (event.clientY ? event.clientY : event.originalEvent.clientY);

        ZoomList.Move.X = (ZoomList.Move.X - rect.left) * scaleX;
        ZoomList.Move.Y = (ZoomList.Move.Y - rect.top) * scaleY;

        var width = ZoomList.Move.X - ZoomList.Down.X;
        var height = ZoomList.Move.Y - ZoomList.Down.Y;

        var cxt = canvas.getContext('2d');

        // IE不支援copy參數，所以只能清除重畫了
        cxt.clearRect(0, 0, canvas.width, canvas.height);

        cxt.lineWidth = 5; //線寬度
        cxt.setLineDash([15, 20]); //虛線
        cxt.strokeRect(ZoomList.Down.X, ZoomList.Down.Y, width, height);
        cxt.stroke();
    }
}

function UpZoom(event, canvas) {
    var X1 = FindMin(ZoomList.Down.X, ZoomList.Move.X), //左上角的X
        Y1 = FindMin(ZoomList.Down.Y, ZoomList.Move.Y), //左上角的Y
        X2 = FindMax(ZoomList.Down.X, ZoomList.Move.X), //右下角的X
        Y2 = FindMax(ZoomList.Down.Y, ZoomList.Move.Y); //右下角的Y

    var CenterX = (X1 + X2) / 2,
        CenterY = (Y1 + Y2) / 2;

    var distXX = $(window).width() / (X2 - X1);
    var distYY = $(window).height() / (Y2 - Y1);

    var rectSum = [distXX, distYY];

    rectSum.sort(function (a, b) {
        return a - b
    });

    ZoomList.ClientX = (CenterX / ToolBarList.ZoomScale) + (ZoomList.IsZoom ? MainObj.CanvasL : 0);
    ZoomList.ClientY = (CenterY / ToolBarList.ZoomScale) + (ZoomList.IsZoom ? MainObj.CanvasT : 0);

    if (ToolBarList.ZoomScale * rectSum[0] > 15) {
        var cxt = canvas.getContext('2d');
        cxt.clearRect(0, 0, canvas.width, canvas.height);
        ZoomList.Drag = false;
        GalleryStartMove();
        return false;
    }

    GalleryStopMove();
    $(window).off("resize", resizeInit);

    $('#dragCanvas').remove();

    ZoomAttrPosition();

    ToolBarList.ZoomScale *= rectSum[0].toFixed(1);

    if (ZoomList.CustomizeMain.defaultDraggable) {
        ZoomList.Isdraggable = true;

        var palmBtn = checkBtnStatus('palm');

        palmBtn.afterClick = true;
        $('#' + palmBtn.id).attr('src', 'ToolBar/palmafter.png');
    } else {
        ZoomList.Isdraggable = false
    }

    ZoomList.IsZoom = true;
    ZoomList.IsAreaZoom = true;
    zoomSetting(ToolBarList.ZoomScale);

    var cxt = canvas.getContext('2d');
    cxt.clearRect(0, 0, canvas.width, canvas.height);
    ZoomList.Drag = false;

    GalleryStartMove();

    return true;
}

//縮放第一次，物件新增初始位置尺寸屬性
function ZoomAttrPosition() {
    //縮放前，先加最原始的left及top至html5上，縮放時物件的位置才不會跑掉
    if (ToolBarList.ZoomScale == 1) {
        if ($('.canvasObj')[0] != undefined) {
            for (var j = 0; j < $('.canvasObj').length; j++) {

                if ($('.canvasObj')[j].type == 'text') {

                    $($('.canvasObj')[j]).attr({
                        'width': $($('.canvasObj')[j]).css('width').split('px')[0],
                        'height': $($('.canvasObj')[j]).css('height').split('px')[0]
                    })
                }

                $($('.canvasObj')[j]).attr({
                    'tempWidth': $($('.canvasObj')[j]).width(),
                    'tempHeight': $($('.canvasObj')[j]).height(),
                    'left': $('.canvasObj')[j].offsetLeft,
                    'top': $('.canvasObj')[j].offsetTop
                })
            }
        }

        //影片要將初始位置及初始尺寸都記錄下來
        if ($('.video')[0] != undefined) {
            for (var i = 0; i < $('.video').length; i++) {
                $($('.video')[i]).attr({
                    'left': $('.video')[i].offsetLeft,
                    'top': $('.video')[i].offsetTop,
                    'oldwidth': $('.video')[i].width,
                    'oldheight': $('.video')[i].height
                })
            }
        }

        //影片要將初始位置及初始尺寸都記錄下來
        if ($('.videoPosition')[0] != undefined) {
            for (var i = 0; i < $('.videoPosition').length; i++) {
                $($('.videoPosition')[i]).attr({
                    'left': $('.videoPosition')[i].offsetLeft,
                    'top': $('.videoPosition')[i].offsetTop,
                    'oldwidth': $('.videoPosition')[i].width,
                    'oldheight': $('.videoPosition')[i].height
                })
            }
        }

        if ($('.videoClose')[0] != undefined) {
            for (var i = 0; i < $('.videoClose').length; i++) {
                $($('.videoClose')[i]).attr({
                    'tempWidth': $($('.videoClose')[i]).width(),
                    'tempHeight': $($('.videoClose')[i]).height(),
                    'left': $('.videoClose')[i].offsetLeft,
                    'top': $('.videoClose')[i].offsetTop
                })
            }
        }

        //影片關閉按鈕要將初始位置及初始尺寸都記錄下來
        if ($('.iframeObj')[0] != undefined) {
            for (var i = 0; i < $('.iframeObj').length; i++) {
                $($('.iframeObj')[i]).attr({
                    'tempWidth': $($('.iframeObj')[i]).width(),
                    'tempHeight': $($('.iframeObj')[i]).height(),
                    'left': $('.iframeObj')[i].offsetLeft,
                    'top': $('.iframeObj')[i].offsetTop
                })
            }
        }

        if ($('.fileObj')[0] != undefined) {
            for (var i = 0; i < $('.fileObj').length; i++) {
                var temp;
                if (fileObj.saveList.find(function (x) {
                    if (('canvas' + x.id) == $('.fileObj')[i].id) {
                        return x
                    }
                })) {
                    if (fileObj.saveList.find(function (x) {
                        if (('canvas' + x.id) == $('.fileObj')[i].id) {
                            return x
                        }
                    }).IsPatch == 'true') {
                        temp = $('.fileObj')[i];
                    } else {
                        temp = $('.fileObj')[i].parentElement;
                    }
                } else {
                    temp = $('.fileObj')[i].parentElement;
                }
                if (temp.style.display != 'none') {
                    $(temp).attr({
                        'tempWidth': $(temp).width(),
                        'tempHeight': $(temp).height(),
                        'left': temp.offsetLeft,
                        'top': temp.offsetTop
                    })
                }
            }
        }

        if ($('.videoFile')[0] != undefined) {
            for (var i = 0; i < $('.videoFile').length; i++) {
                var temp = $('.videoFile')[i];
                if (temp.style.display != 'none') {
                    $(temp).attr({
                        'tempWidth': $(temp).width(),
                        'tempHeight': $(temp).height(),
                        'left': temp.offsetLeft,
                        'top': temp.offsetTop
                    })
                }
            }
        }

        if ($('.link_btn')[0] != undefined) {
            for (var i = 0; i < $('.link_btn').length; i++) {
                var temp = $('.link_btn')[i];
                if (temp.style.display != 'none') {
                    $(temp).attr({
                        'tempWidth': $(temp).width(),
                        'tempHeight': $(temp).height(),
                        'left': temp.offsetLeft,
                        'top': temp.offsetTop
                    })
                }
            }
        }

        if ($('.commentBox')[0] != undefined) {
            for (var i = 0; i < $('.commentBox').length; i++) {
                var temp = $($('.commentBox')[i]).children();
                for (var x = 0; x < temp.length; x++) {
                    if (temp[x].style.display != 'none') {
                        if ($(temp[x]).attr('pen')) {
                            $(temp[x]).attr({
                                'left': temp[x].offsetLeft,
                                'top': temp[x].offsetTop
                            })
                        } else {
                            $(temp[x]).attr({
                                'tempWidth': $(temp[x]).outerWidth(),
                                'tempHeight': $(temp[x]).outerHeight(),
                                'left': temp[x].offsetLeft,
                                'top': temp[x].offsetTop
                            })
                        }
                    }
                }
            }
        }

        if ($('.NoteBox')[0] != undefined) {
            for (var i = 0; i < $('.NoteBox').length; i++) {
                var temp = $($('.NoteBox')[i]).children();
                for (var x = 0; x < temp.length; x++) {
                    if (temp[x].style.display != 'none') {
                        if (!$(temp[x]).hasClass('narrowDiv')) {
                            $(temp[x]).attr({
                                'tempWidth': $(temp[x]).outerWidth(),
                                'tempHeight': $(temp[x]).outerHeight(),
                                'left': temp[x].offsetLeft,
                                'top': temp[x].offsetTop
                            });
                        } else {
                            var img = $(temp[x]).children()[0];
                            $(img).attr({
                                'tempWidth': $(img).outerWidth(),
                                'tempHeight': $(img).outerHeight(),
                                'left': temp[x].offsetLeft,
                                'top': temp[x].offsetTop
                            })
                        }
                    }
                }
            }
        }

        if ($('.CanvasBox')[0] != undefined) {
            for (var i = 0; i < $('.CanvasBox').length; i++) {
                var temp = $($('.CanvasBox')[i]).children();
                for (var x = 0; x < temp.length; x++) {
                    if (temp[x].style.display != 'none') {
                        if (!$(temp[x]).hasClass('narrowDiv')) {
                            $(temp[x]).attr({
                                'tempWidth': $(temp[x]).outerWidth(),
                                'tempHeight': $(temp[x]).outerHeight(),
                                'left': temp[x].offsetLeft,
                                'top': temp[x].offsetTop
                            });

                            var canvasArea = $(temp[x]).children('.canvasArea');
                            $(canvasArea).attr({
                                'tempWidth': $(canvasArea).outerWidth() + ($(temp[x]).outerWidth() - $(temp[x]).width()),
                                'tempHeight': $(canvasArea).outerHeight() + ($(temp[x]).outerHeight() - $(temp[x]).height()),
                                'left': canvasArea.offsetLeft,
                                'top': canvasArea.offsetTop
                            });
                        } else {
                            var img = $(temp[x]).children()[0];
                            $(img).attr({
                                'tempWidth': $(img).outerWidth(),
                                'tempHeight': $(img).outerHeight(),
                                'left': temp[x].offsetLeft,
                                'top': temp[x].offsetTop
                            })
                        }
                    }
                }
            }
        }

        if ($('.popupBlock')[0] != undefined) {
            for (var i = 0; i < $('.popupBlock').length; i++) {
                $($('.popupBlock')[i]).attr({
                    'tempWidth': $($('.popupBlock')[i]).width(),
                    'tempHeight': $($('.popupBlock')[i]).height(),
                    'left': $('.popupBlock')[i].offsetLeft,
                    'top': $('.popupBlock')[i].offsetTop
                })
            }
        }

        if (!TextPopup.CustomizeMain.defaultMax) {
            if ($('.popupBox')[0] != undefined) {
                for (var i = 0; i < $('.popupBox').length; i++) {
                    var temp = $($('.popupBox')[i]).children();
                    for (var x = 0; x < temp.length; x++) {
                        $(temp[x]).attr({
                            'tempWidth': $(temp[x]).outerWidth(),
                            'tempHeight': $(temp[x]).outerHeight(),
                            'left': temp[x].offsetLeft,
                            'top': temp[x].offsetTop
                        });
                    }
                }
            }
        } 

        if ($('.tap')[0] != undefined) {
            for (var i = 0; i < $('.tap').length; i++) {
                var temp = $('.tap')[i];
                if (temp.style.display != 'none') {
                    $(temp).attr({
                        'tempWidth': $(temp).width(),
                        'tempHeight': $(temp).height(),
                        'left': temp.offsetLeft,
                        'top': temp.offsetTop
                    })
                }
            }
        }
    }
}

//背景canvas的縮放
function zoomSetting(scale) {
    var canvas = $('#CanvasLeft')[0];
    var cxt = canvas.getContext('2d');

    canvas.width = MainObj.NewCanvasWidth * scale;
    canvas.height = MainObj.NewCanvasHeight * scale;

    ZoomList.AreaDistX = ($(window).width() / 2) - ZoomList.ClientX;
    ZoomList.AreaDistY = ($(window).height() / 2) - ZoomList.ClientY;

    ZoomList.DistX = ZoomList.ClientX * scale - ZoomList.ClientX;
    ZoomList.DistY = ZoomList.ClientY * scale - ZoomList.ClientY;

    ZoomList.Left = (MainObj.CanvasL * scale - ZoomList.DistX) + (ZoomList.IsAreaZoom ? ZoomList.AreaDistX : 0);
    ZoomList.Top = (MainObj.CanvasT * scale - ZoomList.DistY) + (ZoomList.IsAreaZoom ? ZoomList.AreaDistY : 0);

    //console.log('距離座標X: ' + ZoomList.DistX + ' Y:' + ZoomList.DistY);

    $(canvas).removeAttr('style');

    $(canvas).css({
        'left': ZoomList.Left,
        'top': ZoomList.Top,
        'position': 'absolute'
    })

    var img = MainObj.AllBackground[MainObj.NowPage].img;
    if (img) {
        cxt.drawImage(img, 0, 0, canvas.width, canvas.height);
        invertCanvas(cxt, canvas.width, canvas.height);
    }

    twoPageZoomSet(scale, ZoomList.Left, ZoomList.Top);
    zoomDragCanvas(scale);
    zoomObjSetting(scale);
    DrawPen(MainObj.NowPage);
    zoomtxtNote(scale);
    zoomtxtComment(scale);
    zoomtxtPopup(scale);
    zoomtxtCanvas(scale);
}

function zoomtxtNote(scale) {
    // 文字便利貼 縮放
    if ($('.NoteBox').length) {
        for (var i = 0; i < $('.NoteBox').length; i++) {
            var temp = $($('.NoteBox')[i]).children();
            for (var x = 0; x < temp.length; x++) {
                var tempLeft = MainObj.IsRight ? $('#CanvasLeft').offset().left : $('#CanvasRight').offset().left;
                if (!$(temp[x]).hasClass('narrowDiv')) {
                    var left = (Number($(temp[x]).attr('left')) - (MainObj.IsTwoPage ? tempLeft : MainObj.CanvasL)) * scale + ((MainObj.IsTwoPage ? tempLeft : MainObj.CanvasL) * scale) - ZoomList.DistX;
                    var top = Number($(temp[x]).attr('top')) * scale - ZoomList.DistY;
                    var width = $(temp[x]).attr('tempWidth') * scale;
                    var height = $(temp[x]).attr('tempHeight') * scale;

                    left += ZoomList.IsAreaZoom ? ZoomList.AreaDistX : 0;
                    top += ZoomList.IsAreaZoom ? ZoomList.AreaDistY : 0;

                    $(temp[x]).css({
                        width: width,
                        height: height,
                        left: left,
                        top: top
                    });

                    changeTextEditor(temp[x].id, 'resize', width, (height - txtMainobj.Textobj.Title.H) - txtMainobj.Textobj.TempH);
                } else {
                    var img = $(temp[x]).children()[0];
                    var left = (Number($(img).attr('left')) - (MainObj.IsTwoPage ? tempLeft : MainObj.CanvasL)) * scale + ((MainObj.IsTwoPage ? tempLeft : MainObj.CanvasL) * scale) - ZoomList.DistX;
                    var top = Number($(img).attr('top')) * scale - ZoomList.DistY;

                    left += ZoomList.IsAreaZoom ? ZoomList.AreaDistX : 0;
                    top += ZoomList.IsAreaZoom ? ZoomList.AreaDistY : 0;

                    $(img).css({
                        width: $(img).attr('tempWidth') * scale,
                        height: $(img).attr('tempHeight') * scale
                    })
                    $(temp[x]).css({
                        left: left,
                        top: top
                    });
                }
            }
        }
    }
}

//文字彈跳視窗
function zoomtxtPopup(scale) {
    if ($('.popupBlock').length) {
        for (var u = 0; u < $('.popupBlock').length; u++) {
            var blocktemp = $('.popupBlock')[u];

            var left = Number($(blocktemp).attr('left')) * scale - ZoomList.DistX;
            var top = Number($(blocktemp).attr('top')) * scale - ZoomList.DistY;
            var width = $(blocktemp).attr('tempWidth') * scale;
            var height = $(blocktemp).attr('tempHeight') * scale;

            left += ZoomList.IsAreaZoom ? ZoomList.AreaDistX : 0;
            top += ZoomList.IsAreaZoom ? ZoomList.AreaDistY : 0;

            $(blocktemp).css({
                width: width,
                height: height,
                left: left,
                top: top
            });
        }
    }

    if (!TextPopup.CustomizeMain.defaultMax) {
        if ($('.popupBox').length) {
            for (var v = 0; v < $('.popupBox').length; v++) {
                var temp = $($('.popupBox')[v]).children();
                for (var w = 0; w < temp.length; w++) {
                    var left = Number($(temp[w]).attr('left')) * scale - ZoomList.DistX;
                    var top = Number($(temp[w]).attr('top')) * scale - ZoomList.DistY;
                    var width = $(temp[w]).attr('tempWidth') * scale;
                    var height = $(temp[w]).attr('tempHeight') * scale;

                    left += ZoomList.IsAreaZoom ? ZoomList.AreaDistX : 0;
                    top += ZoomList.IsAreaZoom ? ZoomList.AreaDistY : 0;

                    $(temp[w]).css({
                        width: width,
                        height: height,
                        left: left,
                        top: top
                    });

                    changeTextEditor(temp[w].id, 'resize', width, (height - txtMainobj.Textobj.Title.H) - txtMainobj.Textobj.TempH);
                }
            }
        }
    }
}

// 注解 縮放
function zoomtxtComment(scale) {
    if ($('.commentBox').length) {
        for (var i = 0; i < $('.commentBox').length; i++) {
            var temp = $($('.commentBox')[i]).children();
            for (var j = 0; j < temp.length; j++) {
                if ($(temp[j]).attr('pen')) {
                    reDrawCommentPen(temp[j]);
                    $(temp[j]).remove();
                } else {
                    var left = Number($(temp[j]).attr('left')) * scale - ZoomList.DistX;
                    var top = Number($(temp[j]).attr('top')) * scale - ZoomList.DistY;
                    var width = $(temp[j]).attr('tempWidth') * scale;
                    var height = $(temp[j]).attr('tempHeight') * scale;

                    left += ZoomList.IsAreaZoom ? ZoomList.AreaDistX : 0;
                    top += ZoomList.IsAreaZoom ? ZoomList.AreaDistY : 0;

                    $(temp[j]).css({
                        width: width,
                        height: height,
                        left: left,
                        top: top
                    });

                    changeTextEditor(temp[j].id, 'resize', width, (height - txtMainobj.Textobj.Title.H) - txtMainobj.Textobj.TempH);
                }
            }
        }
    }
}

// 便利貼 縮放
function zoomtxtCanvas(scale) {
    if ($('.CanvasBox').length) {
        for (var i = 0; i < $('.CanvasBox').length; i++) {
            var temp = $($('.CanvasBox')[i]).children();
            for (var x = 0; x < temp.length; x++) {
                if (!$(temp[x]).hasClass('narrowDiv')) {
                    var left = (Number($(temp[x]).attr('left')) - (MainObj.IsTwoPage ? tempLeft : MainObj.CanvasL)) * scale + ((MainObj.IsTwoPage ? tempLeft : MainObj.CanvasL) * scale) - ZoomList.DistX;
                    var top = Number($(temp[x]).attr('top')) * scale - ZoomList.DistY;

                    left += ZoomList.IsAreaZoom ? ZoomList.AreaDistX : 0;
                    top += ZoomList.IsAreaZoom ? ZoomList.AreaDistY : 0;

                    $(temp[x]).css({
                        width: $(temp[x]).attr('tempWidth') * scale,
                        height: $(temp[x]).attr('tempHeight') * scale,
                        left: left,
                        top: top
                    });

                    var titleScale = Math.abs(txtMainobj.Textobj.Title.H - txtMainobj.Textobj.Title.H * ToolBarList.ZoomScale);
                    var canvasArea = $(temp[x]).children('.canvasArea')[0];
                    var canvasW = ($(canvasArea).attr('tempWidth') * scale);
                    var canvasH = ($(canvasArea).attr('tempheight') * scale) + titleScale;

                    reDrawCanvasPen($(temp[x]), canvasArea, canvasW, canvasH);
                } else {
                    var img = $(temp[x]).children()[0];
                    var left = (Number($(img).attr('left')) - (MainObj.IsTwoPage ? tempLeft : MainObj.CanvasL)) * scale + ((MainObj.IsTwoPage ? tempLeft : MainObj.CanvasL) * scale) - ZoomList.DistX;
                    var top = Number($(img).attr('top')) * scale - ZoomList.DistY;

                    left += ZoomList.IsAreaZoom ? ZoomList.AreaDistX : 0;
                    top += ZoomList.IsAreaZoom ? ZoomList.AreaDistY : 0;

                    $(img).css({
                        width: $(img).attr('tempWidth') * scale,
                        height: $(img).attr('tempHeight') * scale
                    })
                    $(temp[x]).css({
                        left: left,
                        top: top
                    });
                }

            }
        }
    }
}

//物件canvas的縮放
function zoomObjSetting(scale) {
    //物件跟背景是一樣的縮放模式
    if ($('.canvasObj')[0] != undefined) {

        for (var num = 0; num < $('.canvasObj').length; num++) {

            var left = Number($($('.canvasObj')[num]).attr('left')) * scale - ZoomList.DistX;
            var top = Number($($('.canvasObj')[num]).attr('top')) * scale - ZoomList.DistY;

            left += ZoomList.IsAreaZoom ? ZoomList.AreaDistX : 0;
            top += ZoomList.IsAreaZoom ? ZoomList.AreaDistY : 0;

            if ($('.canvasObj')[num] == $('.Text')[0]) {

                $($('.canvasObj')[num]).css({
                    'width': 23 * scale,
                    'height': 23 * scale,
                    'left': left,
                    'top': top
                })
            } else {

                if ($('.canvasObj')[num].type == 'text') {

                    $($('.canvasObj')[num]).css({
                        'width': $($('.canvasObj')[num]).attr('width') * scale,
                        'height': $($('.canvasObj')[num]).attr('height') * scale,
                        'left': left,
                        'top': top
                    })

                } else {

                    var canvas = $('.canvasObj')[num];

                    var Identifier = $(canvas).attr('Identifier');

                    if (!$(canvas).hasClass('canvasIntro')) {

                        if ($(canvas).hasClass('canvasPosition')) {
                            if ($(canvas).hasClass('IsPatch')) {
                                $(canvas).css({
                                    'width': $(canvas).attr('tempWidth') * scale,
                                    'height': $(canvas).attr('tempHeight') * scale,
                                    'left': left,
                                    'top': top
                                })
                            } else {
                                HamaList[MainObj.NowPage].Objects.map(function (res) {
                                    if ($(canvas).hasClass('introImage')) {
                                        if (res.IntroductionObjectList) {
                                            res.IntroductionObjectList.IntroductionObject.map(function (intro) {
                                                if (intro.Identifier == Identifier) {
                                                    if (intro.FormatterType == 'Hamastar.AddIns.Introduction.IntroductionPictureScrollObjectFormatter') {
                                                        $($('.canvasObj')[num]).css({
                                                            'width': $('.canvasObj')[num].width * scale,
                                                            'height': $('.canvasObj')[num].height * scale,
                                                            'left': left,
                                                            'top': top
                                                        });
                                                    } else {
                                                        $($('.canvasObj')[num]).css({
                                                            'left': left,
                                                            'top': top
                                                        });
                                                        canvas.width = $(canvas).attr('tempWidth') * scale;
                                                        canvas.height = $(canvas).attr('tempHeight') * scale;
                                                        var context = canvas.getContext('2d');
                                                        drawAdditionFileImage(intro, context, canvas.width, canvas.height);
                                                    }
                                                }
                                            });
                                        }
                                    }
                                    if (res.Identifier == Identifier) {
                                        $($('.canvasObj')[num]).css({
                                            'left': left,
                                            'top': top
                                        });
                                        canvas.width = $(canvas).attr('tempWidth') * scale;
                                        canvas.height = $(canvas).attr('tempHeight') * scale;

                                        var context = canvas.getContext('2d');
                                        drawAdditionFileImage(res, context, canvas.width, canvas.height);
                                    }
                                });
                            }
                        } else {
                            HamaList[MainObj.NowPage].Objects.map(function (res) {
                                if (res.Identifier == Identifier) {

                                    if (
                                        res.FormatterType == 'RotationImageObject' ||
                                        res.FormatterType == 'SlideshowObject' ||
                                        res.FormatterType == 'HtmlScriptObject' ||
                                        res.FormatterType == 'ErasingPicture' ||
                                        res.FormatterType == 'RectangleObject' ||
                                        res.FormatterType == 'EllipseObject' ||
                                        res.FormatterType == 'LinePoint' ||
                                        res.FormatterType == 'ArrowLinePoint' ||
                                        res.FormatterType == 'BurshPoints' ||
                                        res.FormatterType == 'ScrollObject'
                                    ) {
                                        $($('.canvasObj')[num]).css({
                                            'width': $(canvas).hasClass('tempCanvas') ? $(canvas).attr('tempWidth') * scale : $('.canvasObj')[num].width * scale,
                                            'height': $(canvas).hasClass('tempCanvas') ? $(canvas).attr('tempHeight') * scale : $('.canvasObj')[num].height * scale,
                                            'left': left,
                                            'top': top
                                        });

                                    } else if (res.FormatterType == 'DialogFrame') {
                                        $($('.canvasObj')[num]).css({
                                            'width': $(canvas).hasClass('tempCanvas') ? $(canvas).attr('tempWidth') * scale : $('.canvasObj')[num].width * scale,
                                            'height': $(canvas).hasClass('tempCanvas') ? $(canvas).attr('tempHeight') * scale : $('.canvasObj')[num].height * scale,
                                            'left': left,
                                            'top': top
                                        });
                                        var textArea = $('#text' + $('.canvasObj')[num].id);

                                        var textAreaL = (Number($(textArea).attr('left')) - MainObj.CanvasL) * scale + MainObj.CanvasL;
                                        var textAreaT = (Number($(textArea).attr('top')) - MainObj.CanvasT) * scale + MainObj.CanvasT;
                                        $(textArea).css({
                                            'width': $(textArea).attr('tempWidth') * scale,
                                            'height': $(textArea).attr('tempHeight') * scale,
                                            'left': textAreaL,
                                            'top': textAreaT
                                        });
                                    } else {
                                        $($('.canvasObj')[num]).css({
                                            'left': left,
                                            'top': top
                                        });
                                        canvas.width = $(canvas).attr('tempWidth') * scale;
                                        canvas.height = $(canvas).attr('tempHeight') * scale;

                                        var context = canvas.getContext('2d');
                                        if (res.FormatterType == 'ImageLayer') {
                                            drawIntroImage(res, context, canvas.width, canvas.height);
                                        } else if (res.FormatterType == 'TextObject') {
                                            drawTextImage(res, context, canvas.width, canvas.height);
                                        } else {
                                            if (res.FormatterType == 'MaskingLayer') {
                                                borderstyle(res.Identifier, res.BorderStyle, res.BrushColor, res.PixelSize);
                                                context.strokeRect(res.PixelSize, res.PixelSize, canvas.width, canvas.height);
                                                context.fillStyle = res.BrushColor;
                                                context.fillRect(0, 0, canvas.width, canvas.height);
                                            }
                                            invertCanvas(context, canvas.width, canvas.height);
                                            drawButtonImage(res, context, canvas.width, canvas.height);
                                        }
                                    }
                                }
                            });
                        }
                    } else {
                        var divId = $(canvas)[0].parentElement.id.split('IntroDiv')[1];
                        var context = canvas.getContext('2d');

                        $($(canvas)[0].parentElement).css({
                            left: 0,
                            top: 0
                        })

                        HamaList[MainObj.NowPage].Objects.map(function (res) {
                            if (res.Identifier == divId) {
                                res.IntroductionObjectList.IntroductionObject.map(function (intro) {
                                    if (intro.Identifier == Identifier) {
                                        if (intro.FormatterType == 'Hamastar.AddIns.Introduction.IntroductionPictureScrollObjectFormatter') {
                                            $($('.canvasObj')[num]).css({
                                                'width': $(canvas).attr('tempWidth') * scale,
                                                'height': $(canvas).attr('tempHeight') * scale,
                                                'left': left,
                                                'top': top
                                            });
                                        } else {
                                            $($('.canvasObj')[num]).css({
                                                'left': left,
                                                'top': top
                                            });
                                            canvas.width = $(canvas).attr('tempWidth') * scale;
                                            canvas.height = $(canvas).attr('tempHeight') * scale;
                                            drawIntroImage(intro, context, canvas.width, canvas.height);
                                        }
                                    }
                                });
                            }
                        });
                    }

                }
            }
        }
    }

    if ($('.videoPosition').length) {
        for (var v = 0; v < $('.videoPosition').length; v++) {

            var left = Number($($('.videoPosition')[v]).attr('left')) * scale - ZoomList.DistX;
            var top = Number($($('.videoPosition')[v]).attr('top')) * scale - ZoomList.DistY;

            $($('.videoPosition')[v]).css({
                'left': left,
                'top': top
            })

            var width = Number($($('.videoPosition')[v]).attr('oldwidth')) * scale;
            var height = Number($($('.videoPosition')[v]).attr('oldheight')) * scale;

            $('.videoPosition')[v].width = width;
            $('.videoPosition')[v].height = height;
        }
    }

    if ($('.videoClose').length) {
        for (var v = 0; v < $('.videoClose').length; v++) {

            var left = Number($($('.videoClose')[v]).attr('left')) * scale - ZoomList.DistX;
            var top = Number($($('.videoClose')[v]).attr('top')) * scale - ZoomList.DistY;

            var canvas = $('.videoClose')[v];
            $(canvas).css({
                'left': left,
                'top': top
            });
            canvas.width = $(canvas).attr('tempWidth') * scale;
            canvas.height = $(canvas).attr('tempHeight') * scale;
            var context = canvas.getContext('2d');
            drawVideoCloseImage(context, canvas.width, canvas.height);
        }
    }

    if ($('.iframeObj').length) {
        for (var v = 0; v < $('.iframeObj').length; v++) {

            var left = Number($($('.iframeObj')[v]).attr('left')) * scale - ZoomList.DistX;
            var top = Number($($('.iframeObj')[v]).attr('top')) * scale - ZoomList.DistY;

            var canvas = $('.iframeObj')[v];
            $(canvas).css({
                'left': left,
                'top': top
            });
            canvas.width = $(canvas).attr('tempWidth') * scale;
            canvas.height = $(canvas).attr('tempHeight') * scale;
        }
    }

    //影片縮放
    if ($('.video')[0] != undefined) {
        for (var i = 0; i < $('.video').length; i++) {

            var left = Number($($('.video')[v]).attr('left')) * scale - ZoomList.DistX;
            var top = Number($($('.video')[v]).attr('top')) * scale - ZoomList.DistY;

            $($('.video')[i]).css({
                'left': left,
                'top': top
            })

            var width = Number($($('.video')[i]).attr('oldwidth')) * scale;
            var height = Number($($('.video')[i]).attr('oldheight')) * scale;

            $('.video')[i].width = width;
            $('.video')[i].height = height;
        }
    }

    // 連連看的線縮放
    if ($('.canvasConnector')[0] != undefined) {

        for (var num = 0; num < $('.canvasConnector').length; num++) {

            var left = Number($($('.canvasConnector')[v]).attr('left')) * scale - ZoomList.DistX;
            var top = Number($($('.canvasConnector')[v]).attr('top')) * scale - ZoomList.DistY;

            $($('.canvasConnector')[num]).css({
                'width': $('.canvasConnector')[num].width * scale,
                'height': $('.canvasConnector')[num].height * scale,
                'left': left,
                'top': top
            })
        }
    }

    // 檔案(圖片)
    if ($('.fileObj').length) {
        for (var i = 0; i < $('.fileObj').length; i++) {
            var temp;
            if (fileObj.saveList.find(function (x) {
                if (('canvas' + x.id) == $('.fileObj')[i].id) {
                    return x
                }
            })) {
                if (fileObj.saveList.find(function (x) {
                    if (('canvas' + x.id) == $('.fileObj')[i].id) {
                        return x
                    }
                }).IsPatch == 'true') {
                    temp = $('.fileObj')[i];
                } else {
                    temp = $('.fileObj')[i].parentElement;
                }
            } else {
                temp = $('.fileObj')[i].parentElement;
            }
            var left = Number($(temp).attr('left')) * scale - ZoomList.DistX;
            var top = Number($(temp).attr('top')) * scale - ZoomList.DistY;
            var width = $(temp).attr('tempWidth') * scale;
            var height = $(temp).attr('tempHeight') * scale;
            $(temp).css({
                'width': width,
                'height': height,
                'left': left,
                'top': top
            });
            $($('.fileObj')[i]).css({
                'width': width,
                'height': height
            });
        }
    }

    // 檔案(影片)
    if ($('.videoFile').length) {
        for (var i = 0; i < $('.videoFile').length; i++) {
            var left = Number($($('.videoFile')[i]).attr('left')) * scale - ZoomList.DistX;
            var top = Number($($('.videoFile')[i]).attr('top')) * scale - ZoomList.DistY;
            var width = $($('.videoFile')[i]).attr('tempWidth') * scale;
            var height = $($('.videoFile')[i]).attr('tempHeight') * scale;
            $($('.videoFile')[i]).css({
                // transform: 'scale(' + scale + ', ' + scale + ')',
                'width': width,
                'height': height,
                'left': left,
                'top': top
            });
            $($($('.videoFile')[i]).children()[1]).css({
                'width': width,
                'height': height
            });
        }
    }

    // 超連結
    if ($('.link_btn').length) {
        for (var i = 0; i < $('.link_btn').length; i++) {
            var left = Number($($('.link_btn')[i]).attr('left')) * scale - ZoomList.DistX;
            var top = Number($($('.link_btn')[i]).attr('top')) * scale - ZoomList.DistY;
            var width = $($('.link_btn')[i]).attr('tempWidth') * scale;
            var height = $($('.link_btn')[i]).attr('tempHeight') * scale;
            $($('.link_btn')[i]).css({
                // transform: 'scale(' + scale + ', ' + scale + ')',
                width: width,
                height: height,
                left: left,
                top: top,
                'font-size': (1.5 * scale) + 'em'
            });
        }
    }

    // 補丁(附件)
    if ($('.AdditionalObj').length) {
        for (var i = 0; i < $('.AdditionalObj').length; i++) {
            var left = Number($($('.AdditionalObj')[i]).attr('left')) * scale - ZoomList.DistX;
            var top = Number($($('.AdditionalObj')[i]).attr('top')) * scale - ZoomList.DistY;
            var width = $($('.AdditionalObj')[i]).attr('tempWidth') * scale;
            var height = $($('.AdditionalObj')[i]).attr('tempHeight') * scale;
            $($('.AdditionalObj')[i]).css({
                // transform: 'scale(' + scale + ', ' + scale + ')',
                width: width,
                height: height,
                left: left,
                top: top
            });
        }
    }

    //頁籤
    if ($('.tap').length) {
        for (var i = 0; i < $('.tap').length; i++) {
            var left = Number($($('.tap')[i]).attr('left')) * scale - ZoomList.DistX;
            var top = Number($($('.tap')[i]).attr('top')) * scale - ZoomList.DistY;
            var width = $($('.tap')[i]).attr('tempWidth') * scale;
            var height = $($('.tap')[i]).attr('tempHeight') * scale;
            $($('.tap')[i]).css({
                width: width,
                height: height,
                left: left,
                top: top
            });
        }
    }

    if ($('.moveIcon').length) {
        for (var i = 0; i < $('.moveIcon').length; i++) {
            $($('.moveIcon')[i]).css({
                width: 42 * scale,
                height: 42 * scale
            });
        }

    }
}

function drawIntroImage(obj, cxt, width, height) {
    if (obj.XFileName || obj.BackgroundXFileName) {
        var img = new Image();
        img.onload = function () {
            cxt.globalAlpha = Number(obj.Alpha);
            cxt.globalCompositeOperation = 'copy';
            cxt.drawImage(img, 0, 0, width, height);
            invertCanvas(cxt, width, height);
            if (obj.FormatterType == 'ErasingPicture') {
                cxt.lineCap = "round";
                cxt.lineJoin = "round";
                cxt.lineWidth = 30 * MainObj.Scale;
                cxt.globalCompositeOperation = "destination-out";
            }
        }
        img.src = 'Resource/' + (obj.XFileName || obj.BackgroundXFileName);
    }
}

function drawTextImage(obj, cxt, width, height) {
    if (obj.CharSetImg) {
        cxt.globalCompositeOperation = 'copy';
        var img = new Image();
        img.onload = function () {
            cxt.drawImage(img, 0, 0, width, height);
            invertCanvas(cxt, width, height);
        }
        img.src = 'Resource/' + obj.CharSetImg;
    }
}

// 畫圖影定位的圖片
function drawAdditionFileImage(obj, cxt, width, height) {
    var img = new Image();
    img.onload = function () {
        cxt.globalAlpha = Number(obj.Alpha);
        cxt.globalCompositeOperation = 'copy';
        cxt.drawImage(img, 0, 0, width, height);
        invertCanvas(cxt, width, height);
    }
    img.src = 'Resource/' + obj.PathFileName;
}

// 畫影片的關閉按鈕的圖片
function drawVideoCloseImage(cxt, width, height) {
    var img = new Image();
    img.onload = function () {
        cxt.drawImage(img, 0, 0, width, height);
        invertCanvas(cxt, width, height);
    }
    img.src = 'css/Images/Close.png';
}

//縮放drag
function zoomDragCanvas(scale) {
    //用一個新的canvas覆蓋在版面上面
    //是為了不讓其他功能觸發
    NewCanvas();
    var canvas = $('#canvas')[0];
    canvas.id = 'dragCanvas';
    canvas.width = MainObj.IsTwoPage ? ($('#CanvasRight')[0].width + $('#CanvasLeft')[0].width) : $('#CanvasLeft')[0].width;
    canvas.height = $('#CanvasLeft')[0].height;

    // if (!MainObj.IsRight) {
    //     var left = Number($('#CanvasRight').css('left').split('px')[0]);
    // } else {
    //     var left = Number($('#CanvasLeft').css('left').split('px')[0]);
    // }
    var left = Number($('#CanvasLeft').css('left').split('px')[0]);
    var top = Number($('#CanvasLeft').css('top').split('px')[0]);

    $(canvas)
        .css({
            'left': left,
            'top': top,
            'z-index': 100,
            'cursor': ZoomList.Isdraggable ? 'move' : 'default',
            'display': ZoomList.Isdraggable ? 'block' : 'none'
        })
        .attr('class', 'dragCanvas');

    //將draggable事件綁在蓋在上面的canvas
    //移動的過程中底下的背景及物件也一起移動
    $(canvas).draggable({
        start: function (e, ui) {
            ZoomList.dragCanvasPosition.down.X = Math.abs(ui.position.left);
            ZoomList.dragCanvasPosition.down.Y = Math.abs(ui.position.top);

            //ZoomList.dragOffsetLeft = 0;
            //ZoomList.dragOffsetTop = 0;
        },
        drag: function (e, ui) {
            ZoomList.dragCanvasPosition.move.X = Math.abs(ui.position.left);
            ZoomList.dragCanvasPosition.move.Y = Math.abs(ui.position.top);
            ZoomDragScroll();
        },
        stop: function () {
            ZoomList.dragCanvasPosition.isdrag = true;

            ZoomList.dragCanvasPosition.left = ZoomList.Left - (MainObj.CanvasL * ToolBarList.ZoomScale - ZoomList.DistX) - (ZoomList.IsAreaZoom ? ZoomList.AreaDistX : 0);
            ZoomList.dragCanvasPosition.top = ZoomList.Top - (MainObj.CanvasT * ToolBarList.ZoomScale - ZoomList.DistY) - (ZoomList.IsAreaZoom ? ZoomList.AreaDistY : 0);

            $('#dragCanvas').css({
                'left': ZoomList.dragOffsetLeft,
                'top': ZoomList.dragOffsetTop
            });
        }
    })
}

//拖動平移
//所有物件、背景
function ZoomDragScroll() {

    if (!ZoomList.Isdraggable) return;

    var dragOffsetLeft = $('.dragCanvas')[0].offsetLeft;
    var dragOffsetTop = $('.dragCanvas')[0].offsetTop;

    // if (MainObj.IsTwoPage) {
    //     if ($('.canvasObj')[x] != undefined) {
    //         if ($('.canvasObj')[x].offsetLeft < ($('.dragCanvas')[0].width / 2)) {
    //             var left = dragOffsetLeft - $('#CanvasLeft')[0].offsetLeft;
    //         } else {
    //             var left = dragOffsetLeft - $('#CanvasRight')[0].offsetLeft;
    //         }
    //     }
    // } else {
    //     var left = dragOffsetLeft - $('#CanvasLeft')[0].offsetLeft;
    // }

    if (dragOffsetLeft > 0 || dragOffsetTop > 0 ||
        $(window).width() - dragOffsetLeft > $('.dragCanvas')[0].width || $(window).height() - dragOffsetTop > $('.dragCanvas')[0].height) {
        if (dragOffsetLeft > 0) {
            dragOffsetLeft = 0;
        }
        if (dragOffsetTop > 0) {
            dragOffsetTop = 0;
        }
        if ($(window).width() - dragOffsetLeft > $('.dragCanvas')[0].width) {
            dragOffsetLeft = $(window).width() - $('.dragCanvas')[0].width;
        }
        if ($(window).height() - dragOffsetTop > $('.dragCanvas')[0].height) {
            dragOffsetTop = $(window).height() - $('.dragCanvas')[0].height;
        }
    }

    var left = dragOffsetLeft - $('#CanvasLeft')[0].offsetLeft;
    var top = dragOffsetTop - $('#CanvasLeft')[0].offsetTop;

    ZoomList.dragOffsetLeft = dragOffsetLeft;
    ZoomList.dragOffsetTop = dragOffsetTop;

    // 文字便利貼 平移
    for (var i = 0; i < $('.NoteBox').length; i++) {
        var temp = $($('.NoteBox')[i]).children();
        for (var x = 0; x < temp.length; x++) {
            if (temp[x].style.display != 'none') {
                $(temp[x]).css({
                    left: temp[x].offsetLeft + left,
                    top: temp[x].offsetTop + top
                })
            }
        }
    }

    // 手繪便利貼 平移
    for (var i = 0; i < $('.CanvasBox').length; i++) {
        var temp = $($('.CanvasBox')[i]).children();
        for (var x = 0; x < temp.length; x++) {
            if (temp[x].style.display != 'none') {
                $(temp[x]).css({
                    left: temp[x].offsetLeft + left,
                    top: temp[x].offsetTop + top
                })
            }
        }
    }

    // 注解 平移
    for (var v = 0; v < $('.commentBox').length; v++) {
        var temp = $($('.commentBox')[v]).children();
        for (var w = 0; w < temp.length; w++) {
            if (temp[w].style.display != 'none') {
                $(temp[w]).css({
                    left: temp[w].offsetLeft + left,
                    top: temp[w].offsetTop + top
                })
            }
        };
    }

    //物件平移
    for (var x = 0; x < $('.canvasObj').length; x++) {
        if (MainObj.IsTwoPage) {
            if (Number($($('.canvasObj')[x]).attr('left')) < ($('.dragCanvas')[0].width / 2)) {
                left = dragOffsetLeft - $('#CanvasRight')[0].offsetLeft;
            }
        }
        $($('.canvasObj')[x]).css({
            'left': $('.canvasObj')[x].offsetLeft + left,
            'top': $('.canvasObj')[x].offsetTop + top
        })
    }

    //影片平移
    // for (var i = 0; i < $('.video').length; i++) {
    //     $($('.video')[i]).css({
    //         'left': $('.video')[i].offsetLeft + left,
    //         'top': $('.video')[i].offsetTop + top
    //     })
    // }

    //圖影定位影片平移
    for (var v = 0; v < $('.videoPosition').length; v++) {
        $($('.videoPosition')[v]).css({
            'left': $('.videoPosition')[v].offsetLeft + left,
            'top': $('.videoPosition')[v].offsetTop + top
        })
    }

    //圖影定位影片close按鈕平移
    for (var v = 0; v < $('.videoClose').length; v++) {
        $($('.videoClose')[v]).css({
            'left': $('.videoClose')[v].offsetLeft + left,
            'top': $('.videoClose')[v].offsetTop + top
        })
    }

    // iframe
    for (var v = 0; v < $('.iframeObj').length; v++) {
        $($('.iframeObj')[v]).css({
            'left': $('.iframeObj')[v].offsetLeft + left,
            'top': $('.iframeObj')[v].offsetTop + top
        })
    }

    // 文字彈跳視窗
    if (!TextPopup.CustomizeMain.defaultMax) {
        for (var v = 0; v < $('.textPopup').length; v++) {
            $($('.textPopup')[v]).css({
                'left': $('.textPopup')[v].offsetLeft + left,
                'top': $('.textPopup')[v].offsetTop + top
            })
        }
    }

    //雙頁模式時，縮放後的拖拉是兩個canvas一起移動
    if (!MainObj.IsTwoPage) {
        $('#CanvasLeft').css({
            'left': dragOffsetLeft,
            'top': dragOffsetTop
        })

        ZoomList.Left = dragOffsetLeft;
        ZoomList.Top = dragOffsetTop;
    } else {
        if (!MainObj.IsRight) {

            $('#CanvasRight').css({
                'left': dragOffsetLeft,
                'top': dragOffsetTop
            })

            var canvaswidth = Number($('#CanvasRight').css('width').split('px')[0]);

            $('#CanvasLeft').css({
                'left': dragOffsetLeft + canvaswidth,
                'top': dragOffsetTop
            })

        } else {

            $('#CanvasLeft').css({
                'left': dragOffsetLeft,
                'top': dragOffsetTop
            })

            var canvaswidth = Number($('#CanvasLeft').css('width').split('px')[0]);

            $('#CanvasRight').css({
                'left': dragOffsetLeft + canvaswidth,
                'top': dragOffsetTop
            })
        }
    }

    // 檔案
    fileObj.saveList.forEach(function (res, i) {
        if (res.page == MainObj.NowPage) {

            var temp;
            if (fileObj.saveList.find(function (x) {
                if (x.id == res.id) {
                    return x
                }
            })) {
                if (fileObj.saveList.find(function (x) {
                    if (x.id == res.id) {
                        return x
                    }
                }).IsPatch == 'true') {
                    temp = $('#canvas' + res.id);
                } else {
                    temp = $('#canvas' + res.id)[0].parentElement;
                }
            } else {
                temp = $('#canvas' + res.id)[0].parentElement;
            }
            $(temp).css({
                'left': $(temp)[0].offsetLeft + left,
                'top': $(temp)[0].offsetTop + top
            });
        }
    });

    // 超連結
    hyperLink.saveList.forEach(function (y) {
        if (y.page == MainObj.NowPage) {
            // 不知道為什麼JQ的offset不能用，所以改用js原生寫法
            document.getElementById(y.id).style.left = parseInt(document.getElementById(y.id).style.left) + left + 'px';
            document.getElementById(y.id).style.top = parseInt(document.getElementById(y.id).style.top) + top + 'px';
        }
    });
}

//雙頁模式時的縮放
//雙頁變成兩個canvas，因此要另外從這設定
function twoPageZoomSet(scale, Left, Top) {
    if (MainObj.IsTwoPage) {
        if (MainObj.NowPage > 0) {
            $('#CanvasRight')[0].width = MainObj.NewCanvasWidth * scale;
            $('#CanvasRight')[0].height = MainObj.NewCanvasHeight * scale;
            var canvas = $('#CanvasRight')[0];
            var cxt = $('#CanvasRight')[0].getContext('2d');
            var img = MainObj.AllBackground[MainObj.NowPage - 1].img;
            cxt.drawImage(img, 0, 0, $('#CanvasRight')[0].width, $('#CanvasRight')[0].height);
            invertCanvas(cxt, $('#CanvasRight')[0].width, $('#CanvasRight')[0].height);
            $(canvas).removeAttr('style');
            $(canvas).css({
                'left': 0,
                'top': 0,
                'position': 'absolute'
            })
        }

        if (!MainObj.IsRight) {
            $('#CanvasRight').css({
                'left': Left,
                'top': Top
            });

            $('#CanvasLeft').css({
                'left': Left + Number($('#CanvasRight').css('width').split('px')[0]),
                'top': Top
            })
        } else {
            $('#CanvasLeft').css({
                'left': Left,
                'top': Top
            });

            $('#CanvasRight').css({
                'left': Left + Number($('#CanvasLeft').css('width').split('px')[0]),
                'top': Top
            })
        }
    }
}