//便利貼
var txtCanvas = {
    Move: { X: 0, Y: 0 }, //mousedown
    Down: { X: 0, Y: 0 }, //mousemove
    Drag: false,
    Line: { X: [], Y: [] },   //存入畫線的所有座標
    canvasList: [],
    SaveList: [],
    selectedCanvasBgId: null
}

function txtCanvasLayer() {
    var titleWidth = txtMainobj.Textobj.W * ToolBarList.ZoomScale,
        titleHeight = txtMainobj.Textobj.Title.H;
    var objWidth = titleWidth,
        objHeight = txtMainobj.Textobj.H * ToolBarList.ZoomScale;
    var CanvasW = titleWidth,
        CanvasH = txtMainobj.Textobj.Text.H * ToolBarList.ZoomScale;

    var titleScale = Math.abs(txtMainobj.Textobj.Title.H - txtMainobj.Textobj.Title.H * ToolBarList.ZoomScale);

    var Left = event.type == 'touchstart' ? event.targetTouches[0].pageX : (event.clientX ? event.clientX : event.originalEvent.clientX),
        Top = event.type == 'touchstart' ? event.targetTouches[0].pageY : (event.clientY ? event.clientY : event.originalEvent.clientY);

    var ID = newguid();

    var divBox = document.createElement('div');
    divBox.id = ID;
    $('#HamastarWrapper').append(divBox);
    $(divBox).attr('class', 'CanvasBox txtCanvas');

    var div = document.createElement('div');
    div.id = 'Div' + ID;
    $(divBox).append(div);
    $(div).attr({
        'LayerIndex': txtMainobj.LayerIndex += 1,
        'left': ToolBarList.ZoomScale > 1 ? ((Left - ZoomList.Left) / ToolBarList.ZoomScale + MainObj.CanvasL) : Left,
        'top': ToolBarList.ZoomScale > 1 ? ((Top - ZoomList.Top) / ToolBarList.ZoomScale + MainObj.CanvasT) : Top,
        'tempwidth': objWidth / ToolBarList.ZoomScale,
        'tempheight': objHeight / ToolBarList.ZoomScale
    }).css({
        'position': 'absolute',
        'width': objWidth,
        'height': objHeight,
        'left': Left,
        'top': Top,
        'display': 'flex',
        'flex-direction': 'column',
        'border': '5px solid #fdecac',
        'background-color': '#fdecac',
        'z-index': 99
    }).draggable({
        handle: '.canvasTitle',
        cancel: '.canvasTitleName',
        containment: "#HamastarWrapper",
        start: function (event) {
            CanvasToLast(ID);
        },
        stop: function (event, ui) {
            FindBoundary(ui, div);

            SaveCanvas();
        }
    }).resizable({
        zIndex: 100,
        minHeight: txtMainobj.Textobj.H,
        minWidth: txtMainobj.Textobj.W,
        start: function () {
            $(window).off("resize", resizeInit);
        },
        resize: function (e, ui) {
            $('#txtCanvasArea' + ID)[0].width = ui.size.width - ($(this).outerWidth() - $(this).width());
            $('#txtCanvasArea' + ID)[0].height = (ui.size.height - titleHeight) - ($(this).outerHeight() - $(this).height());
        },
        stop: function (event, ui) {
            var NewWidth = ui.size.width;
            var NewHeight = ui.size.height - titleHeight;
            reDrawCanvasPen(this, $('#txtCanvasArea' + ID)[0], NewWidth, NewHeight);

            $(window).resize(resizeInit);
            SaveCanvas();
        }
    }).click(function () {
        CanvasToLast(ID);
    });

    var canvasTitle = document.createElement('nav');
    canvasTitle.id = 'txtCanvas' + ID;
    $(div).append(canvasTitle);
    $(canvasTitle)
        .attr({
            'class': 'canvasTitle navbar navbar-light'
        })
        .css({
            'background-color': '#fdecac',
            'width': '100%',
            'height': titleHeight,
            'padding': 0
        });

    var canvasTitleName = document.createElement('a');
    canvasTitleName.innerHTML = txtMainobj.TitleName.Canvas;
    $(canvasTitle).append(canvasTitleName);
    $(canvasTitleName)
        .attr({
            'contenteditable': true
        })
        .data({
            'lang': "canvasTitle"
        })
        .addClass('navbar-brand canvasTitleName')
        .css({
            'font-size': '1.7rem',
            'padding': 0
        });

    var canvasTitleBtn = document.createElement('div');
    $(canvasTitle).append(canvasTitleBtn);
    $(canvasTitleBtn).addClass('form-inline');

    UIText(canvasTitleName);
    txtNarrowBtn(canvasTitleBtn, ID);
    txtCloseBtn(canvasTitleBtn, ID);
    txtNarrowSmall(divBox, ID, txtMainobj.SmallIcon.Canvas);

    txtCanvasArea(div, ID, CanvasW, CanvasH, titleScale);

    MainObj.saveList.push({
        page: MainObj.NowPage,
        id: ID,
        type: 'txtCanvas',
        top: Top + 'px',
        left: Left + 'px',
        points: [],
        StickyViewVisibility: FindStickyViewVisibility(ID),
        bgcolor: rgbToHex($('#Div' + ID)[0].style.backgroundColor).toUpperCase().replace('#',''),
        LayerIndex: txtMainobj.LayerIndex,
        isEraser: false,
        isGroup: null,
        isEraserSelect: false,
        isEraserSelectPen: false
    });

    recovery();

    if (MainObj.saveList.length > 5) {
        MainObj.saveList.splice(0, 1);
    }

    SaveCanvas();
}

//便利貼畫圖區域設置
function txtCanvasArea(div, id, width, height, titleHeight) {
    //畫畫區域
    var outerWidth = $(div).outerWidth() - $(div).width();
    var outerHeight = $(div).outerHeight() - $(div).height();
    var canvasArea = document.createElement('canvas');
    canvasArea.id = 'txtCanvasArea' + id;
    canvasArea.width = width - outerWidth;
    canvasArea.height = (height - outerHeight) + titleHeight;

    $(div).append(canvasArea);
    $(canvasArea)
        .css({
            'top': txtMainobj.Textobj.Title.H,
            'position': 'absolute',
            'background-color': '#fdfdc8',
        })
        .attr({
            'class': 'canvasArea',
            'tempwidth': width / ToolBarList.ZoomScale,
            'tempheight': height / ToolBarList.ZoomScale
        });

    //canvasArea畫畫
    $(canvasArea).on('mousedown', function (e) { txtCanvasDown(e, this) })
    $(canvasArea).on('mousemove', function (e) { txtCanvasMove(e, this) });
    $(canvasArea).on('mouseout', function () { txtCanvasUp(this, id) });
    $(canvasArea).on('mouseup', function () { txtCanvasUp(this, id) });

    $(canvasArea).on('touchstart', function (e) { txtCanvasDown(e, this) })
    $(canvasArea).on('touchmove', function (e) { txtCanvasMove(e, this) });
    $(canvasArea).on('touchend', function () { txtCanvasUp(this, id) });
}

function txtCanvasDown(event, canvas) {
    txtCanvas.Down.X = event.type == 'touchstart' ? event.targetTouches[0].pageX - $(canvas).offset().left : event.offsetX;
    txtCanvas.Down.Y = event.type == 'touchstart' ? event.targetTouches[0].pageY - $(canvas).offset().top : event.offsetY;

    txtCanvas.Drag = true;

    //將畫線的座標都存入txtCanvas.Line裡面
    var list = { X: Number(txtCanvas.Down.X), Y: Number(txtCanvas.Down.Y) };
    txtCanvas.Line.X.push(list.X);
    txtCanvas.Line.Y.push(list.Y);
}

function txtCanvasMove(event, canvas) {
    txtCanvas.Move.X = event.type == 'touchmove' ? event.targetTouches[0].pageX - $(canvas).offset().left : event.offsetX;
    txtCanvas.Move.Y = event.type == 'touchmove' ? event.targetTouches[0].pageY - $(canvas).offset().top : event.offsetY;

    var cxt = canvas.getContext('2d');

    if (txtCanvas.Drag && !MainObj.isPinch) {

        cxt.lineWidth = 5;
        cxt.lineCap = 'round';
        cxt.lineJoin = 'round';

        cxt.moveTo(txtCanvas.Down.X, txtCanvas.Down.Y);
        cxt.lineTo(txtCanvas.Move.X, txtCanvas.Move.Y);
        cxt.stroke();

        //將( txtCanvas.Move.X , txtCanvas.Move.Y )取代起始點
        txtCanvas.Down.X = txtCanvas.Move.X;
        txtCanvas.Down.Y = txtCanvas.Move.Y;

        //將畫線的座標都存入txtCanvas.Line裡面
        var list = { X: Number(txtCanvas.Move.X), Y: Number(txtCanvas.Move.Y) };
        txtCanvas.Line.X.push(list.X);
        txtCanvas.Line.Y.push(list.Y);
    }
}

function txtCanvasUp(canvas, id) {
    if (txtCanvas.Drag) {
        var list = [];

        for (var i = 1; i < txtCanvas.Line.X.length; i++) {
            list.push({ X: txtCanvas.Line.X[i] / MainObj.Scale, Y: txtCanvas.Line.Y[i] / MainObj.Scale, id: canvas.id });
        }
        txtCanvas.canvasList.push(list);

        SaveCanvas();
        
        txtCanvas.Line = { X: [], Y: [] };

        txtCanvas.Drag = false;
    }
}

//儲存note的資訊於txtCanvas.SaveList
function SaveCanvas() {
    
    var list = {};
    var canvasnote = $('.CanvasBox');

    if (txtCanvas.SaveList.length > 0) {
        for (var x = 0; x < txtCanvas.SaveList.length; x++) {
            if (txtCanvas.SaveList[x] != undefined) {
                if (txtCanvas.SaveList[x].page == MainObj.NowPage) {
                    txtCanvas.SaveList.splice(x, 1);
                }
            }
        }
    }

    for (var i = 0; i < canvasnote.length; i++) {
        var tmp;
        if (FindStickyViewVisibility(canvasnote[i].id) == 'true') {
            var tmp = '#Div';
        } else {
            var tmp = '#narrowDiv';
        }

        var left = ($(tmp + canvasnote[i].id).offset().left - MainObj.CanvasL) / MainObj.Scale;
        var top = ($(tmp + canvasnote[i].id).offset().top - MainObj.CanvasT) / MainObj.Scale;

        list = {
            page: MainObj.NowPage,
            id: canvasnote[i].id,
            type: 'txtCanvas',
            width: $('#Div' + canvasnote[i].id).css('width'),
            height: $('#Div' + canvasnote[i].id).css('height'),
            top: top + 'px',
            left: left + 'px',
            points: txtCanvas.canvasList,
            StickyViewVisibility: FindStickyViewVisibility(canvasnote[i].id),
            LayerIndex: $('#Div' + canvasnote[i].id).attr('LayerIndex'),
            bgcolor: rgbToHex($('#Div' + canvasnote[i].id)[0].style.backgroundColor).toUpperCase().replace('#','')
        };

        txtCanvas.SaveList.push(list);
    }
}

//如有文字便利貼註記，從txtCanvas.SaveList取得
function ReplyCanvas(page) {
    $('.CanvasBox').remove();

    $(txtCanvas.SaveList).each(function () {
        if (this != undefined) {
            if (this.page == page) {
                reSetCanvas(this);
            }
        }
    })
}

function reSetCanvas(obj) {
    if ($('#' + obj.id)[0] != undefined) {
        $('#' + obj.id).remove();
    }

    var ID = obj.id;
    var note = obj;

    var titleWidth = (Number(note.width.split('px')[0]));
        titleHeight = txtMainobj.Textobj.Title.H;
    var objWidth = titleWidth,
        objHeight = (Number(note.height.split('px')[0]));
    var CanvasW = titleWidth,
        CanvasH = objHeight;

    var titleScale = Math.abs(txtMainobj.Textobj.Title.H - txtMainobj.Textobj.Title.H * ToolBarList.ZoomScale);

    var Left = (Number(note.left.split('px')[0]) * MainObj.Scale) + MainObj.CanvasL,
        Top = (Number(note.top.split('px')[0]) * MainObj.Scale) + MainObj.CanvasT;

    var divBox = document.createElement('div');
    divBox.id = ID;
    $('#HamastarWrapper').append(divBox);
    $(divBox).attr('class', 'CanvasBox');

    var div = document.createElement('div');
    div.id = 'Div' + ID;
    $(divBox).append(div);
    $(div).attr({
        'LayerIndex': note.LayerIndex,
        'left': ToolBarList.ZoomScale > 1 ? ((Left - ZoomList.Left) / ToolBarList.ZoomScale + MainObj.CanvasL) : Left,
        'top': ToolBarList.ZoomScale > 1 ? ((Top - ZoomList.Top) / ToolBarList.ZoomScale + MainObj.CanvasT) : Top,
        'tempwidth': CanvasW / ToolBarList.ZoomScale,
        'tempheight': CanvasH / ToolBarList.ZoomScale
    }).css({
        'position': 'absolute',
        'width': objWidth,
        'height': objHeight,
        'left': Left,
        'top': Top,
        'display': 'flex',
        'flex-direction': 'column',
        'border': '5px solid #fdecac',
        'background-color': '#fdecac',
        'z-index': 99
    }).draggable({
        handle: '.canvasTitle',
        cancel: '.canvasTitleName',
        containment: "#HamastarWrapper",
        start: function (event) {
            CanvasToLast(ID);
        },
        stop: function (event, ui) {
            FindBoundary(ui, div);
            SaveCanvas();
        }
    }).resizable({
        zIndex: 100,
        minHeight: txtMainobj.Textobj.H,
        minWidth: txtMainobj.Textobj.W,
        start: function () {
            $(window).off("resize", resizeInit);
        },
        resize: function (e, ui) {
            $('#txtCanvasArea' + ID)[0].width = ui.size.width - ($(this).outerWidth() - $(this).width());
            $('#txtCanvasArea' + ID)[0].height = (ui.size.height - titleHeight) - ($(this).outerHeight() - $(this).height());
        },
        stop: function (event, ui) {
            var NewWidth = ui.size.width;
            var NewHeight = ui.size.height - titleHeight;
            reDrawCanvasPen(this, $('#txtCanvasArea' + ID)[0], NewWidth, NewHeight);

            $(window).resize(resizeInit);
            SaveCanvas();
        }
    }).click(function () {
        CanvasToLast(ID);
    });

    var canvasTitle = document.createElement('nav');
    canvasTitle.id = 'txtCanvas' + ID;
    $(div).append(canvasTitle);
    $(canvasTitle)
        .attr({
            'class': 'canvasTitle navbar navbar-light'
        })
        .css({
            'background-color': '#fdecac',
            'width': '100%',
            'height': titleHeight,
            'padding': 0
        });

    var canvasTitleName = document.createElement('a');
    canvasTitleName.innerHTML = txtMainobj.TitleName.Canvas;
    $(canvasTitle).append(canvasTitleName);
    $(canvasTitleName)
        .attr({
            'contenteditable': true
        })
        .data({
            'lang': "canvasTitle"
        })
        .addClass('navbar-brand canvasTitleName')
        .css({
            'font-size': '1.7rem',
            'padding': 0
        });

    var canvasTitleBtn = document.createElement('div');
    $(canvasTitle).append(canvasTitleBtn);
    $(canvasTitleBtn).addClass('form-inline');

    UIText(canvasTitleName);
    txtNarrowBtn(canvasTitleBtn, ID);
    txtCloseBtn(canvasTitleBtn, ID);
    txtNarrowSmall(divBox, ID, txtMainobj.SmallIcon.Canvas);

    txtCanvasArea(div, ID, CanvasW, CanvasH - titleHeight, titleScale);
    reDrawCanvasPen(div, $('#txtCanvasArea' + ID)[0], CanvasW, CanvasH - titleHeight);

    if (note.StickyViewVisibility == 'true') {
        $('#narrowDiv' + note.id).css('display', 'none');
        $('#Div' + note.id).css('display', 'flex');
    } else {
        $('#narrowDiv' + note.id).css({
            'display': 'block',
            'left': $('#Div' + note.id).css('left'),
            'top': $('#Div' + note.id).css('top'),
        });
        $($('#narrowDiv' + note.id)[0]).children().attr({
            'tempWidth': 50 * MainObj.Scale,
            'tempHeight': 50 * MainObj.Scale,
            'left': ToolBarList.ZoomScale > 1 ? (($('#narrowDiv' + note.id)[0].offsetLeft - ZoomList.Left) / ToolBarList.ZoomScale + MainObj.CanvasL) : $('#narrowDiv' + note.id)[0].offsetLeft,
            'top': ToolBarList.ZoomScale > 1 ? (($('#narrowDiv' + note.id)[0].offsetTop - ZoomList.Top) / ToolBarList.ZoomScale + MainObj.CanvasT) : $('#narrowDiv' + note.id)[0].offsetTop
        });
        $('#Div' + note.id).css('display', 'none');
    }

    SaveCanvas();
}

function CanvasToLast(id) {
    var last = $('#HamastarWrapper').children().last();
    if (last[0].id !== id) {
        $('#' + id).insertAfter($(last));
    }
}

function reDrawCanvasPen(divobj ,canvasobj, NewWidth, NewHeight) {
    var outerWidth = $(divobj).outerWidth() - $(divobj).width();
    var outerHeight = $(divobj).outerHeight() - $(divobj).height();
    canvasobj.width = NewWidth - outerWidth;
    canvasobj.height = NewHeight - outerHeight;

    var cxtArea = canvasobj.getContext('2d');
    txtCanvas.SaveList.map(function (res) {
        if (res) {
            for (var i = 0; i < res.points.length; i++) {
                if (res.points[i]) {
                    for (var p = 1; p < res.points[i].length; p++) {
                        if (cxtArea.canvas.id.replace('txtCanvasArea', '') == res.points[i][0].id.replace('txtCanvasArea', '')) {
                            cxtArea.lineWidth = 5;
                            cxtArea.lineCap = 'round';
                            cxtArea.lineJoin = 'round';

                            var x1 = res.points[i][p - 1].X * MainObj.Scale;
                            var y1 = res.points[i][p - 1].Y * MainObj.Scale;
                            var x2 = res.points[i][p].X * MainObj.Scale;
                            var y2 = res.points[i][p].Y * MainObj.Scale;

                            cxtArea.moveTo(x1, y1);
                            cxtArea.lineTo(x2, y2);
                            cxtArea.stroke();
                        }
                    }
                }
            }
        }
    });
}

//初始化
function txtCanvasReset() {
    $('.CanvasBox').remove();
}