//塗抹

var Erasing = {
    Mousemove: { x: 0, y: 0 },
    Mousedown: { x: 0, y: 0 },
    Left: [0, 0],
    Top: 0,
    Drag: false, //滑鼠是否拖拉
    X1: 0,
    Y1: 0,
    Page: 0
};

//塗抹canvas設定
function ErasingPictureSetting(num, obj, page) {

    Erasing.Page = page;
    getPagePosition(page);

    var scale = MainObj.Scale;
    var Left = obj.Left * scale + MainObj.CanvasL;
    var Top = obj.Top * scale + MainObj.CanvasT;
    var Width = obj.Width * scale;
    var Height = obj.Height * scale;

    Erasing.Left = getErasingLeft(obj.Left * scale);
    Erasing.Top = obj.Top * scale;

    $('#canvas')[0].class = 'canvasObj';
    var canvasErasingID = obj.Identifier;

    $('#canvas')[0].id = canvasErasingID;
    $('#' + canvasErasingID)[0].width = Width;
    $('#' + canvasErasingID)[0].height = Height;
    $('#' + canvasErasingID).css({
        'left': Left,
        'top': Top
    });

    var canvas = $('#' + canvasErasingID)[0];
    var cxt = canvas.getContext('2d');
    

    var img = new Image();
    img.onload = function() {
        cxt.drawImage(img, 0, 0, Width, Height);
        invertCanvas(cxt, Width, Height);
        cxt.lineCap = "round";
        cxt.lineJoin = "round";
        cxt.lineWidth = 30 * scale;
        cxt.globalCompositeOperation = "destination-out";
    }
    img.src = 'Resource/' + obj.XFileName;

    canvas.addEventListener( "mousemove", function(event) { ErasingMove(event, obj, this) }, false ); //滑鼠移動事件
    canvas.addEventListener( "mousedown", function(event) { ErasingStart(event, obj, this) }, false ); //滑鼠點擊事件
    canvas.addEventListener( "mouseup", function(event) { ErasingUp(event, this) }, false ); //滑鼠放開事件
    document.addEventListener( "mouseout", function(event) { ErasingUp(event, this) }, false ); //滑鼠離開事件

    canvas.addEventListener( "touchmove", function(event) { ErasingMove(event, obj, this) }, false ); //手指移動事件
    canvas.addEventListener( "touchstart", function(event) { ErasingStart(event, obj, this) }, false ); //手指點擊事件
    canvas.addEventListener( "touchend", function(event) { ErasingUp(event, this) }, false );     //手指放開事件
    document.addEventListener( "touchcancel", function(event) { ErasingUp(event, this) }, false );    //手指離開事件
    
}

function getErasingLeft(left) {
    var L = Erasing.Left;
    if (MainObj.IsTwoPage) {
        if (!MainObj.IsRight) {
            if (Quiz.PagePosition == 'Right') {
                L[1] = left + MainObj.NewCanvasWidth;
            } else {
                L[0] = left + MainObj.CanvasL;
            }
        } else {
            if (Quiz.PagePosition == 'Right') {
                if (left == 0) {
                    L = left + MainObj.NewCanvasWidth;
                }
            } else {
                L = left;
            }
        }
    }
    return L;
}

function ErasingStart(event, obj, canvas) {

    // Erasing.Mousedown.x = event.layerX;
    // Erasing.Mousedown.y = event.layerY;

    Erasing.Mousedown.x = event.type == 'touchstart' ? event.targetTouches[0].pageX - $(canvas).offset().left : (event.layerX ? event.layerX : event.originalEvent.layerX);
    Erasing.Mousedown.y = event.type == 'touchstart' ? event.targetTouches[0].pageY - $(canvas).offset().top : (event.layerY ? event.layerY : event.originalEvent.layerY);

    if (obj.Rotate != '') {
        Erasing.X1 = objRotate(canvas.width / 2, canvas.height / 2, Erasing.Mousedown.x, Erasing.Mousedown.y, obj.Rotate)[0];
        Erasing.Y1 = objRotate(canvas.width / 2, canvas.height / 2, Erasing.Mousedown.x, Erasing.Mousedown.y, obj.Rotate)[1];
    } else {
        Erasing.X1 = Erasing.Mousedown.x;
        Erasing.Y1 = Erasing.Mousedown.y;
    }


    Erasing.Drag = true;
}

function ErasingMove(event, obj, canvas) {

    // Erasing.Mousemove.x = event.layerX;
    // Erasing.Mousemove.y = event.layerY;

    Erasing.Mousemove.x = event.type == 'touchmove' ? event.targetTouches[0].pageX - $(canvas).offset().left : (event.layerX ? event.layerX : event.originalEvent.layerX);
    Erasing.Mousemove.y = event.type == 'touchmove' ? event.targetTouches[0].pageY - $(canvas).offset().top : (event.layerY ? event.layerY : event.originalEvent.layerY);

    var NewX2, NewY2;

    if (obj.Rotate != '') {
        NewX2 = objRotate(canvas.width / 2, canvas.height / 2, Erasing.Mousemove.x, Erasing.Mousemove.y, obj.Rotate)[0],
        NewY2 = objRotate(canvas.width / 2, canvas.height / 2, Erasing.Mousemove.x, Erasing.Mousemove.y, obj.Rotate)[1];
    } else {
        NewX2 = Erasing.Mousemove.x;
        NewY2 = Erasing.Mousemove.y;
    }

    var cxt = canvas.getContext('2d');
    // 

    if (Erasing.Drag) {

        cxt.moveTo(Erasing.X1 / ToolBarList.ZoomScale, Erasing.Y1 / ToolBarList.ZoomScale);
        cxt.lineTo(NewX2 / ToolBarList.ZoomScale, NewY2 / ToolBarList.ZoomScale);
        cxt.stroke();
        //將(x2,y2)取代起始點
        Erasing.X1 = NewX2;
        Erasing.Y1 = NewY2;
    }
}

function ErasingUp(event, canvas) {
    Erasing.Drag = false;
}

//計算旋轉後的新座標
function objRotate(cx, cy, x, y, angle) {
    var radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
        ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    return [nx, ny];
}