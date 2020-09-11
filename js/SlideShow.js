//幻燈片

var SlideShow = {
    Interval: [],
    SrcNum: 0, //計數ImageList中的圖片項目
    Drag: false,
    Mouse1: {
        X: 0,
        Y: 0
    },
    Mouse2: {
        X: 0,
        Y: 0
    }
};


function SlideShowSet(obj) {
    obj.SrcNum = 0;
    obj.times = 0;

    var scale = MainObj.Scale;
    var Left = obj.Left * scale + MainObj.CanvasL;
    var Top = obj.Top * scale + MainObj.CanvasT;
    var Width = obj.Width * scale;
    var Height = obj.Height * scale;

    $('#canvas')[0].class = 'canvasObj';
    var canvasSlideShow = obj.Identifier;

    $('#canvas')[0].id = canvasSlideShow;
    $('#' + canvasSlideShow)[0].width = Width;
    $('#' + canvasSlideShow)[0].height = Height;
    $('#' + canvasSlideShow).css({
        'left': Left,
        'top': Top
    });

    var canvas = $('#' + canvasSlideShow)[0];
    var cxt = canvas.getContext('2d');


    var img = new Image();
    img.onload = function () {
        cxt.drawImage(img, 0, 0, Width, Height);
        invertCanvas(cxt, Width, Height);
        cxt.globalCompositeOperation = 'copy'; //移除舊圖，只保留新圖，不使用clear的方式，因為畫圖的過程會閃
    }
    img.src = 'Resource/' + obj.ImageList.Images[obj.SrcNum].XFileName;

    obj.PlayMode.split(';').forEach(function (val, index) {
        //幻燈片種類，Auto是自動換，Swipe是滑鼠滑動
        if (val == 'Auto') {
            $(canvas).css('pointer-events', 'none');

            SlideShow.Interval.push({
                id: obj.Identifier,
                time: null
            });
            $(SlideShow.Interval).each(function () {
                if (this.id == obj.Identifier) {
                    clearInterval(this.time);
                    this.time = setInterval(function () {
                        SlideFadeOut(obj, img);
                    }, Number(obj.AutoplayInterval));
                }
            });
        } else if (val == 'Swipe') {
            canvas.addEventListener("mousedown", function () {
                SwipeShowDown(obj, img);
            }, false); //滑鼠點擊事件
            canvas.addEventListener("touchstart", function () {
                SwipeShowDown(obj, img);
            }, false); //手指點擊事件
        } else if (val == 'Tap') {
            $(canvas).css('pointer-events', 'auto')
                .click(function () {
                    SlideFadeOut(obj, img);
                });
        }
    });
}

function SlideFadeOut(obj, img) {
    if (obj.Cutscenes == 'Fadeout') {
        //幻燈片淡出模式的原理是
        //將當下的圖片淡出，背後顯示下一張圖，並不會有空白的狀況
        //作法是先新增一個canvas放在此幻燈片下面並畫上下一張圖片
        //原本的canvas淡出後remove掉，然後將新的canvas.id改成原本的
        //最後由於已經是一個新的canvas，因此重新綁上事件(如有設定淡出或點擊模式)
        NewCanvas(obj);
        var scale = MainObj.Scale;
        var Left = obj.Left * scale + MainObj.CanvasL;
        var Top = obj.Top * scale + MainObj.CanvasT;
        var Width = obj.Width * scale * ToolBarList.ZoomScale;
        var Height = obj.Height * scale * ToolBarList.ZoomScale;

        $('#canvas')[0].class = 'canvasObj';
        $('#canvas')[0].id = 'Back' + obj.Identifier;
        $('#Back' + obj.Identifier)[0].width = Width;
        $('#Back' + obj.Identifier)[0].height = Height;

        if (ToolBarList.ZoomScale > 1) {
            var dragOffsetLeft = $('#CanvasLeft')[0].offsetLeft - MainObj.CanvasL;
            var dragOffsetTop = $('#CanvasLeft')[0].offsetTop - MainObj.CanvasT;
            Left = dragOffsetLeft + (obj.Left * scale * ToolBarList.ZoomScale + MainObj.CanvasL);
            Top = dragOffsetTop + (obj.Top * scale * ToolBarList.ZoomScale + MainObj.CanvasT);
        }

        $('#Back' + obj.Identifier).css({
            'left': Left,
            'top': Top
        });

        var canvas = $('#Back' + obj.Identifier)[0];
        $('#' + obj.Identifier).before(canvas);

        obj.SrcNum++;
        addSlideShow(obj, img, canvas);
        $(canvas).attr({
            'tempWidth': $('#' + obj.Identifier).attr('tempWidth'),
            'tempHeight': $('#' + obj.Identifier).attr('tempHeight'),
            'left': $('#' + obj.Identifier).attr('left'),
            'top': $('#' + obj.Identifier).attr('top'),
            'identifier': obj.Identifier
        }).addClass('tempCanvas');
        $('#' + obj.Identifier).fadeOut('slow', function () {
            $(this).remove();
        });
        canvas.id = obj.Identifier;

        if (obj.PlayMode == 'Swipe') {
            canvas.addEventListener("mousedown", function () {
                SwipeShowDown(obj, img);
            }, false); //滑鼠點擊事件
            canvas.addEventListener("touchstart", function () {
                SwipeShowDown(obj, img);
            }, false); //手指點擊事件
        } else if (obj.PlayMode == 'Tap') {
            $(canvas).click(function () {
                SlideFadeOut(obj, img);
            })
        } else if (obj.PlayMode == 'Auto') {
            $(canvas).css('pointer-events', 'none');
        }

    } else {
        obj.SrcNum++;
        addSlideShow(obj, img);
    }
}

//改變canvas的圖片
function addSlideShow(obj, img, backCanvas) {
    // console.log(obj);
    if ($('#' + obj.Identifier)[0] != undefined) {
        var canvas = document.getElementById(obj.Identifier);
        var cxt = canvas.getContext('2d');
        var scale = MainObj.Scale;
        var Width = obj.Width * scale * ToolBarList.ZoomScale;
        var Height = obj.Height * scale * ToolBarList.ZoomScale;
        if (obj.SrcNum >= obj.ImageList.Images.length) {
            obj.times++;
            obj.SrcNum = 0;
            if (obj.times && obj.Looping == 'false') {
                SlideShow.Interval = SlideShow.Interval.map(function (res) {
                    if (res.id == obj.Identifier) {
                        clearInterval(res.time);
                    }
                    return res;
                });
                return;
            }
        } else if (obj.SrcNum < 0) {
            obj.SrcNum = obj.ImageList.Images.length - 1;
        }

        if (backCanvas != null) {
            cxt = backCanvas.getContext('2d');
        }
 
        img.onload = function () {
            if (!backCanvas) {
                cxt.clearRect(0, 0, $(canvas).attr('tempWidth') || Width, $(canvas).attr('tempHeight') || Height);
                cxt.drawImage(img, 0, 0, $(canvas).attr('tempWidth') || Width, $(canvas).attr('tempHeight') || Height);
                invertCanvas(cxt, $(canvas).attr('tempWidth') || Width, $(canvas).attr('tempHeight') || Height);
            } else {
                cxt.clearRect(0, 0, Width, Height);
                cxt.drawImage(img, 0, 0, Width, Height);
                invertCanvas(cxt, Width, Height);
            }
        }
        img.src = 'Resource/' + obj.ImageList.Images[obj.SrcNum].XFileName;
    }
}

function SwipeShowDown(obj, img) {
    SlideShow.Drag = true;
    GalleryStopMove();

    x = event.type == 'touchstart' ? event.targetTouches[0].pageX : (event.clientX ? event.clientX : event.originalEvent.clientX);
    y = event.type == 'touchstart' ? event.targetTouches[0].pageY : (event.clientY ? event.clientY : event.originalEvent.clientY);

    SlideShow.Mouse1.X = x - $('#CanvasGallery').offset().left;
    SlideShow.Mouse1.Y = y - $('#CanvasGallery').offset().top;

    document.addEventListener("mousemove", function () {
        SwipeShowMove(obj, img);
    }, false); //滑鼠移動事件
    document.addEventListener("mouseup", function () {
        SwipeShowUp(obj);
    }, false); //滑鼠放開事件

    document.addEventListener("touchmove", function () {
        SwipeShowMove(obj, img);
    }, false); //手指移動事件
    document.addEventListener("touchend", function () {
        SwipeShowMove(obj, img);
    }, false); //手指離開事件
}

function SwipeShowMove(obj, img) {
    if (SlideShow.Drag) {

        x = event.type == 'touchmove' ? event.targetTouches[0].pageX : (event.clientX ? event.clientX : event.originalEvent.clientX);
        y = event.type == 'touchmove' ? event.targetTouches[0].pageY : (event.clientY ? event.clientY : event.originalEvent.clientY);

        SlideShow.Mouse2.X = x - $('#CanvasGallery').offset().left;
        SlideShow.Mouse2.Y = y - $('#CanvasGallery').offset().top;

        //滑鼠點擊的起始點與移動滑鼠後的點的距離
        var moveX = SlideShow.Mouse2.X - SlideShow.Mouse1.X;

        //moveX若大於1，則判斷滑鼠為向右移動，圖片往右邊轉
        //反之，若小於-1，則往左邊轉
        if (moveX < -100) {
            SlideFadeOut(obj, img);

            //將移動後的點取代點擊的起始點
            SlideShow.Mouse1.X = SlideShow.Mouse2.X;
        }

    }
}

function SwipeShowUp(obj) {
    SlideShow.Drag = false;
    GalleryStartMove();
}

//幻燈片初始化
function SlideShowReset() {
    for (var i = 0; i < SlideShow.Interval.length; i++) {
        clearInterval(SlideShow.Interval[i].time);
        delete SlideShow.Interval[i];
    }
    SlideShow.Interval = [];
    document.removeEventListener("mousemove", function () {
        SwipeShowMove(obj, img);
    }, false); //滑鼠移動事件
    document.removeEventListener("mouseup", function () {
        SwipeShowUp(obj);
    }, false); //滑鼠放開事件

    document.removeEventListener("touchmove", function () {
        SwipeShowMove(obj, img);
    }, false); //手指移動事件
    document.removeEventListener("touchend", function () {
        SwipeShowUp(obj);
    }, false); //手指放開事件
}