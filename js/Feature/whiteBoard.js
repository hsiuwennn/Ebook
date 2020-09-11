//白板、文字白板、手寫白板

var BoardMainobj = {
    saveList: [],
    W: 1024,
    H: 768,
    Text: {
        W: 975,
        H: 635,
        minWidth: 680,
        minHeight: 480,
        Enable: false,
        Show: false
    },
    Canvas: {
        W: 975,
        H: 685,
        minWidth: 680,
        minHeight: 480,
        Enable: false,
        Show: false
    },
    CustomizeMain:{
        defaultOpacity: false
    }
}

// 文字白板
function setTextboard() {
    var textBoardInput = document.getElementById("textboard-input");
    
    if(textBoardInput == null || textBoardInput == undefined) {
        return;
    } else {
        BoardMainobj.Text.Enable = true;
    }

    $(textBoardInput).summernote({
        lang: 'zh-TW',
        height: BoardMainobj.Text.H,
        placeholder: 'I wish you a nice day.',
        focus: true,
        tabsize: 2,
        disableResizeEditor: true,
        disableDragAndDrop: true,
        toolbar: [
            ['style', ['style']],
            ['fontstyle', ['bold', 'italic', 'underline', 'clear']],
            ['font', ['strikethrough', 'superscript', 'subscript']],
            ['fontsize', ['fontsize']],
            ['color', ['color']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['height', ['height']]
        ],
        fontSizes: ['12', '18', '24', '36', '48', '72', '96'],
    });

    $('.textboard-block')
        .draggable({
            scroll: false,
            cursor: "move",
            cancel: '.textboard-cont',
        }).resizable({
            minHeight: BoardMainobj.Text.minHeight,
            minWidth: BoardMainobj.Text.minWidth,
            start: function () {
                $(window).off("resize", resizeInit);
            },
            resize: function (e, ui) {
                var tempH = ui.size.height - BoardMainobj.H
                $(textBoardInput).parent().find('div.note-editable').css('height', BoardMainobj.Text.H + tempH);
            },
            stop: function () {
                $(window).resize(resizeInit);
            }
        });
}

function closeTextboard() 
{
    BoardMainobj.Text.Show = false;
    changeAllBtnToFalse();
    $('.textboard-layout').css('display', 'none');
}

// 手寫白板
function setCavnasboard() {
    var boardObj = $('.canvasboard')[0];
    var boardTempObj = $('.canvasboardTemp')[0];

    if(boardObj == undefined || boardTempObj == undefined) {
        return;
    } else {
        BoardMainobj.Canvas.Enable = true;
    }

    boardObj.width = BoardMainobj.Canvas.W;
    boardObj.height = BoardMainobj.Canvas.H;
    boardTempObj.width = boardObj.width;
    boardTempObj.height = boardObj.height;

    $('.canvasboard-block')
        .draggable({
            scroll: false,
            cursor: "move",
            cancel: '.canvasboard'
        }).resizable({
            minHeight: BoardMainobj.Canvas.minHeight,
            minWidth: BoardMainobj.Canvas.minWidth,
            start: function () {
                $(window).off("resize", resizeInit);
            },
            resize: function () {
                boardObj.width = $('.canvasboard-cont').width();
                boardObj.height = $('.canvasboard-cont').height();
                boardTempObj.width = boardObj.width;
                boardTempObj.height = boardObj.height;
            },
            stop: function () {
                $(window).resize(resizeInit);
                replyCavnasboard();
            }
        });
    var pointList = {};
    $('.canvasboard')
        .on('mousedown', function (e) {
            ToolBarList.canvasboardDrag = true;

            ToolBarList.Down.X = e.offsetX ? e.offsetX : e.originalEvent.offsetX;
            ToolBarList.Down.Y = e.offsetY ? e.offsetY : e.originalEvent.offsetY;

            var cxt = this.getContext('2d');
            if (colorPen.BrushType == 'arbitrarily') {
                cxt.strokeStyle = colorPen.Color;
                cxt.lineWidth = colorPen.Width;
                cxt.globalAlpha = BoardMainobj.CustomizeMain.defaultOpacity ? 1 : colorPen.Opacity;
                cxt.lineCap = colorPen.BrushType == 'rect' ? 'butt' : 'round';
                cxt.lineJoin = colorPen.BrushType == 'rect' ? 'miter' : 'round';
            } else if (colorPen.BrushType == 'line') {
                cxt.strokeStyle = colorPen.Color;
                cxt.lineWidth = colorPen.Width;
                cxt.globalAlpha = BoardMainobj.CustomizeMain.defaultOpacity ? 1 : colorPen.Opacity;
                cxt.lineCap = colorPen.BrushType == 'rect' ? 'butt' : 'round';
                cxt.lineJoin = colorPen.BrushType == 'rect' ? 'miter' : 'round';
            } else if (colorPen.BrushType == 'highlighter') {
                cxt.strokeStyle = colorPen.Color;
                cxt.lineWidth = colorPen.Width;
                cxt.globalAlpha = colorPen.Opacity;
                cxt.lineCap = colorPen.BrushType == 'rect' ? 'butt' : 'round';
                cxt.lineJoin = colorPen.BrushType == 'rect' ? 'miter' : 'round';
            } else if (colorPen.BrushType == 'rect') {
                cxt.strokeStyle = colorPen.Color;
                cxt.lineWidth = colorPen.Width;
                cxt.globalAlpha = BoardMainobj.CustomizeMain.defaultOpacity ? 1 : colorPen.Opacity;
                cxt.lineCap = colorPen.BrushType == 'rect' ? 'butt' : 'round';
                cxt.lineJoin = colorPen.BrushType == 'rect' ? 'miter' : 'round';
            } else {
                cxt.strokeStyle = colorPen.Color;
                cxt.lineWidth = colorPen.Width;
                cxt.globalAlpha = BoardMainobj.CustomizeMain.defaultOpacity ? 1 : colorPen.Opacity;
                cxt.lineCap = colorPen.BrushType == 'rect' ? 'butt' : 'round';
                cxt.lineJoin = colorPen.BrushType == 'rect' ? 'miter' : 'round';
            }
            cxt.beginPath();
            cxt.moveTo(e.offsetX, e.offsetY);
            pointList = {
                color: colorPen.Color,
                width: colorPen.Width,
                opacity: colorPen.Opacity,
                brushType: colorPen.BrushType,
                points: [],
                size: []
            };
        }).on('mousemove', function (e) {

            ToolBarList.Move.X = e.offsetX ? e.offsetX : e.originalEvent.offsetX;
            ToolBarList.Move.Y = e.offsetY ? e.offsetY : e.originalEvent.offsetY;

            var TempCanvas = $(".canvasboardTemp")[0];
            var Tempcontext = TempCanvas.getContext('2d');

            if (ToolBarList.canvasboardDrag) {
                if (colorPen.BrushType == 'arbitrarily') {
                    var cxt = this.getContext('2d');
                    cxt.lineTo(ToolBarList.Move.X, ToolBarList.Move.Y);
                    pointList.points.push({
                        x: ToolBarList.Move.X,
                        y: ToolBarList.Move.Y
                    });
                    cxt.stroke();
                } else if (colorPen.BrushType == 'line') {
                    var cxt = this.getContext('2d');
                    cxt.putImageData(Tempcontext.getImageData(0, 0, this.width, this.height), 0, 0);
                    cxt.beginPath();
                    cxt.moveTo(ToolBarList.Down.X, ToolBarList.Down.Y);
                    cxt.lineTo(ToolBarList.Move.X, ToolBarList.Move.Y);
                    cxt.stroke();
                } else if (colorPen.BrushType == 'highlighter') {
                    var cxt = this.getContext('2d');
                    cxt.putImageData(Tempcontext.getImageData(0, 0, this.width, this.height), 0, 0);
                    cxt.beginPath();
                    cxt.moveTo(ToolBarList.Down.X, ToolBarList.Down.Y);
                    cxt.lineTo(ToolBarList.Move.X, ToolBarList.Move.Y);
                    cxt.stroke();
                } else if (colorPen.BrushType == 'rect') {
                    var cxt = this.getContext('2d');
                    cxt.putImageData(Tempcontext.getImageData(0, 0, this.width, this.height), 0, 0);
                    cxt.strokeRect(ToolBarList.Down.X, ToolBarList.Down.Y, ToolBarList.Move.X - ToolBarList.Down.X, ToolBarList.Move.Y - ToolBarList.Down.Y);
                    cxt.stroke();
                } else {
                    var cxt = this.getContext('2d');
                    cxt.putImageData(Tempcontext.getImageData(0, 0, this.width, this.height), 0, 0);
                    var width = ToolBarList.Move.X - ToolBarList.Down.X;
                    var height = ToolBarList.Move.Y - ToolBarList.Down.Y;

                    BezierEllipse(cxt, ToolBarList.Down.X, ToolBarList.Down.Y, width / 2, height / 2);
                }
            }
        }).on('mouseup', function (e) {
            if (!ToolBarList.canvasboardDrag) {
                return;
            }

            if (colorPen.BrushType == 'arbitrarily') {

            } else if (colorPen.BrushType == 'line') {
                pointList.points.push({
                    x: ToolBarList.Down.X,
                    y: ToolBarList.Down.Y
                }, {
                    x: ToolBarList.Move.X,
                    y: ToolBarList.Move.Y
                });
            } else if (colorPen.BrushType == 'highlighter') {
                pointList.points.push({
                    x: ToolBarList.Down.X,
                    y: ToolBarList.Down.Y
                }, {
                    x: ToolBarList.Move.X,
                    y: ToolBarList.Move.Y
                });
            } else {
                pointList.points.push({
                    x: (ToolBarList.Down.X < ToolBarList.Move.X ? ToolBarList.Down.X : ToolBarList.Move.X),
                    y: (ToolBarList.Down.X < ToolBarList.Move.X ? ToolBarList.Down.Y : ToolBarList.Move.Y)
                }, {
                    x: (ToolBarList.Down.X > ToolBarList.Move.X ? ToolBarList.Down.X : ToolBarList.Move.X),
                    y: (ToolBarList.Down.X > ToolBarList.Move.X ? ToolBarList.Down.Y : ToolBarList.Move.Y)
                });

                pointList.size.push({
                    width: Math.abs(ToolBarList.Move.X - ToolBarList.Down.X),
                    height: Math.abs(ToolBarList.Move.Y - ToolBarList.Down.Y)
                });
            }

            var TempCanvas = $(".canvasboardTemp")[0];
            var Tempcontext = TempCanvas.getContext('2d');
            var cxt = this.getContext('2d');
            Tempcontext.putImageData(cxt.getImageData(0, 0, this.width, this.height), 0, 0);

            BoardMainobj.saveList.push(pointList);
            pointList = {};
            ToolBarList.canvasboardDrag = false;
            ToolBarList.canvasboardTemp = $('.canvasboard')[0].toDataURL();
        })
}

function replyCavnasboard() {
    var canvas = $('.canvasboard')[0];
    var cxt = canvas.getContext('2d');
    var TempCanvas = $(".canvasboardTemp")[0];
    var Tempcontext = TempCanvas.getContext('2d');
    cxt.clearRect(0, 0, canvas.width, canvas.height);

    BoardMainobj.saveList.map(function (res) {
        if (res) {
            if (res.brushType == 'arbitrarily') {
                cxt.strokeStyle = res.color;
                cxt.lineWidth = res.width;
                cxt.globalAlpha = BoardMainobj.CustomizeMain.defaultOpacity ? 1 : res.Opacity;
                cxt.lineCap = colorPen.BrushType == 'rect' ? 'butt' : 'round';
                cxt.lineJoin = colorPen.BrushType == 'rect' ? 'miter' : 'round';
                res.points.map(function (p, index) {
                    if (index == 0) {
                        cxt.beginPath();
                        cxt.moveTo(p.x, p.y);
                    } else {
                        cxt.lineTo(p.x, p.y);
                        cxt.stroke();
                    }
                });
            } else if (res.brushType == 'line') {
                cxt.strokeStyle = res.color;
                cxt.lineWidth = res.width;
                cxt.globalAlpha = BoardMainobj.CustomizeMain.defaultOpacity ? 1 : res.Opacity;
                cxt.lineCap = colorPen.BrushType == 'rect' ? 'butt' : 'round';
                cxt.lineJoin = colorPen.BrushType == 'rect' ? 'miter' : 'round';
                cxt.beginPath();
                var x1 = res.points[0].x;
                var y1 = res.points[0].y;
                var x2 = res.points[1].x;
                var y2 = res.points[1].y;
                cxt.moveTo(x1, y1);
                cxt.lineTo(x2, y2);
                cxt.stroke();
            } else if (res.brushType == 'highlighter') {
                cxt.strokeStyle = res.color;
                cxt.lineWidth = res.width;
                cxt.globalAlpha = res.opacity;
                cxt.lineCap = colorPen.BrushType == 'rect' ? 'butt' : 'round';
                cxt.lineJoin = colorPen.BrushType == 'rect' ? 'miter' : 'round';
                cxt.beginPath();
                var x1 = res.points[0].x;
                var y1 = res.points[0].y;
                var x2 = res.points[1].x;
                var y2 = res.points[1].y;
                cxt.moveTo(x1, y1);
                cxt.lineTo(x2, y2);
                cxt.stroke();
            } else if (res.brushType == 'rect') {
                cxt.strokeStyle = res.color;
                cxt.lineWidth = res.width;
                cxt.globalAlpha = BoardMainobj.CustomizeMain.defaultOpacity ? 1 : res.Opacity;
                cxt.lineCap = colorPen.BrushType == 'rect' ? 'butt' : 'round';
                cxt.lineJoin = colorPen.BrushType == 'rect' ? 'miter' : 'round';
                var x1 = res.points[0].x;
                var y1 = res.points[0].y;
                var width = (res.points[1].x - res.points[0].x);
                var height = (res.points[1].y - res.points[0].y);
                cxt.strokeRect(x1, y1, width, height);
                cxt.stroke();
            } else {
                cxt.strokeStyle = res.color;
                cxt.lineWidth = res.width;
                cxt.globalAlpha = BoardMainobj.CustomizeMain.defaultOpacity ? 1 : res.Opacity;
                cxt.lineCap = colorPen.BrushType == 'rect' ? 'butt' : 'round';
                cxt.lineJoin = colorPen.BrushType == 'rect' ? 'miter' : 'round';
                var x1 = (res.points[0].y > res.points[1].y ? res.points[1].x : res.points[0].x);
                var y1 = (res.points[0].y > res.points[1].y ? res.points[1].y : res.points[0].y);
                var width = res.points[1].x - res.points[0].x;
                var height = res.points[1].y - res.points[0].y;
                cxt.save();
                var a = width / 2;
                var b = height / 2;
                var r = (a > b) ? a : b;
                var ratioX = a / r;
                var ratioY = b / r;
                cxt.scale(ratioX, ratioY);
                cxt.beginPath();
                cxt.arc(x1 / ratioX, y1 / ratioY, r, 0, 2 * Math.PI, false);
                cxt.closePath();
                cxt.restore();
                cxt.stroke();
            }
        }
    });

    Tempcontext.putImageData(cxt.getImageData(0, 0, canvas.width, canvas.height), 0, 0);
}

function closeCanvasboard() {
    BoardMainobj.Canvas.Show = false;
    changeAllBtnToFalse();
    $('.canvasboard-layout').css('display', 'none');
}