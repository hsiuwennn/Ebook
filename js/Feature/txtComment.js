//註解
var txtComment = {
    Down: {
        X: 0,
        Y: 0
    }, //滑鼠點擊的座標
    Move: {
        X: 0,
        Y: 0
    }, //滑鼠移動的座標
    IsDrag: false,
    IsMove: false,
    IsWindow: true,
    lastPoint: {},
    saveList: [],
    positionList: {},
    penStyle: '#000000',
    arcStyle: '#FF0000',
    lineWidth: 6,
    globalAlpha: 1
}

/** 開始畫註解 */
function startComment(event) {

    txtComment.Down.X = event.type == 'touchstart' ? event.targetTouches[0].pageX : (event.clientX ? event.clientX : event.originalEvent.clientX);
    txtComment.Down.Y = event.type == 'touchstart' ? event.targetTouches[0].pageY : (event.clientY ? event.clientY : event.originalEvent.clientY);

    txtComment.IsDrag = true;

    txtComment.lastPoint = {
        X: txtComment.Down.X,
        Y: txtComment.Down.Y,
        State: null
    };

}

function moveComment(event, canvas) {

    txtComment.Move.X = event.type == 'touchmove' ? event.targetTouches[0].pageX : (event.clientX ? event.clientX : event.originalEvent.clientX);
    txtComment.Move.Y = event.type == 'touchmove' ? event.targetTouches[0].pageY : (event.clientY ? event.clientY : event.originalEvent.clientY);


    if (txtComment.IsDrag) {
        txtComment.lastPoint = getLastPoint(txtComment.Down, txtComment.Move);

        var cxt = canvas.getContext('2d');
        cxt.clearRect(0, 0, canvas.width, canvas.height);
        cxt.beginPath();
        cxt.moveTo(txtComment.Down.X, txtComment.Down.Y);
        cxt.lineTo(txtComment.lastPoint.X, txtComment.lastPoint.Y);
        cxt.stroke();

        txtComment.IsMove = true;
    }
}

function upComment(canvas) {
    if (!txtComment.IsMove) {
        txtComment.IsDrag = false;
        return;
    } else {
        txtComment.IsMove = false;
        txtComment.IsDrag = false;
    }

    var titleWidth = txtMainobj.Textobj.W * ToolBarList.ZoomScale,
        titleHeight = txtMainobj.Textobj.Title.H;
    var objWidth = titleWidth,
        objHeight = txtMainobj.Textobj.H * ToolBarList.ZoomScale;
    var textareaW = titleWidth,
        textareaH = (txtMainobj.Textobj.Text.H * ToolBarList.ZoomScale) + ((titleHeight * ToolBarList.ZoomScale) - titleHeight) - txtMainobj.Textobj.TempH;

    var CanvasW = Math.abs(txtComment.Down.X - txtComment.lastPoint.X),
        CanvasH = Math.abs(txtComment.Down.Y - txtComment.lastPoint.Y);
    var CanvasL = Math.min(txtComment.Down.X, txtComment.lastPoint.X),
        CanvasT = Math.min(txtComment.Down.Y, txtComment.lastPoint.Y);
    var CanvasCW = CanvasW / 2,
        CanvasCH = CanvasH / 2;
    var CanvasCL = Math.floor(CanvasL + CanvasCW) - txtComment.lineWidth,
        CanvasCT = Math.floor(CanvasT + CanvasCH) - txtComment.lineWidth;
    var CommentDW = (txtComment.lastPoint.State? (objWidth / 2) : (objWidth + txtComment.lineWidth * 4)),
        CommentDH = (txtComment.lastPoint.State? txtComment.lineWidth * 4 : (objHeight / 2));
    var CommentCLD = CanvasCL - CommentDW,
        CommentCTD = CanvasCT + CommentDH;

    var ID = newguid();

    var divBox = document.createElement('div');
    divBox.id = ID;
    $(divBox).attr('class', 'commentBox');
    $('#HamastarWrapper').append(divBox);

    var newCanvas = newCommentPen(ID, CanvasW, CanvasH, CanvasL, CanvasT, txtComment.lastPoint.State, true, txtComment.penStyle, txtComment.arcStyle, txtComment.lineWidth, txtComment.globalAlpha);
    $(divBox).append(newCanvas);

    var commentDiv = document.createElement('div');
    commentDiv.id = 'commentDiv' + ID;
    $(divBox).append(commentDiv);
    $(commentDiv)
        .attr({
            'LayerIndex': txtMainobj.LayerIndex += 1,
            'class': 'commentNote',
            'left': (CommentCLD + (ToolBarList.ZoomScale > 1 ? ZoomList.DistX : 0) - (ZoomList.IsAreaZoom ? ZoomList.AreaDistX : 0)) / ToolBarList.ZoomScale,
            'top': (CommentCTD + (ToolBarList.ZoomScale > 1 ? ZoomList.DistY : 0) - (ZoomList.IsAreaZoom ? ZoomList.AreaDistY : 0)) / ToolBarList.ZoomScale,
            'tempwidth': objWidth / ToolBarList.ZoomScale,
            'tempheight': objHeight / ToolBarList.ZoomScale,
        })
        .css({
            'position': 'absolute',
            'width': objWidth,
            'height': objHeight,
            'left': CommentCLD,
            'top': CommentCTD,
            'display': 'flex',
            'flex-direction': 'column',
            'border': '5px solid #fdecac',
            'background-color': '#fdecac',
            'z-index': 99
        })
        .draggable({
            cursor: "move",
            containment: "#HamastarWrapper",
            handle: '.commentTitle',
            cancel: '.commentTitleName'
        })
        .resizable({
            zIndex: 100,
            minHeight: txtMainobj.Textobj.H,
            minWidth: txtMainobj.Textobj.W,
            start: function (e, ui) {
                $(window).off("resize", resizeInit);
            },
            resize: function (e, ui) {
                var tempH = ui.size.height - objHeight
                changeTextEditor('commentDiv' + ID, "resize", textareaW, textareaH + tempH)
            },
            stop: function (event, ui) {
                $(window).resize(resizeInit);
                saveComment();
            }
        })
        .click(function () {
            CommentLast(ID);
        });

    var commentTitle = document.createElement('nav');
    commentTitle.id = 'commentTitle' + ID;
    $(commentDiv).append(commentTitle);
    $(commentTitle)
        .attr({
            'class': 'commentTitle navbar navbar-light'
        })
        .css({
            'background-color': '#fdecac',
            'width': '100%',
            'height': titleHeight,
            'padding': 0
        });

    var commentTitleName = document.createElement('a');
    commentTitleName.innerHTML = txtMainobj.TitleName.Comment;
    $(commentTitle).append(commentTitleName);
    $(commentTitleName)
        .attr({
            'contenteditable': true
        })
        .addClass('navbar-brand commentTitleName')
        .css({
            'font-size': '1.7rem',
            'padding': 0
        });

    var commentTitleBtn = document.createElement('div');
    $(commentTitle).append(commentTitleBtn);
    $(commentTitleBtn).addClass('form-inline')

    var commentText = document.createElement('textarea');
    commentText.id = 'commentText' + ID;
    $(commentDiv).append(commentText);

    textEditor(commentText, textareaW, textareaH, saveComment);

    txtNarrowBtn(commentTitleBtn, ID);
    txtCloseBtn(commentTitleBtn, ID);

    objComBoundary(commentDiv, txtComment.lastPoint.State, CanvasCL, CanvasCT, CommentDW, CommentDH)

    if (ToolBarList.ZoomScale > 1) {
        txtComment.positionList[ID] = {
            position: {
                from: {
                    X: (txtComment.Down.X - ZoomList.Left) / ToolBarList.ZoomScale / MainObj.Scale,
                    Y: (txtComment.Down.Y - ZoomList.Top) / ToolBarList.ZoomScale / MainObj.Scale
                },
                to: {
                    X: (txtComment.lastPoint.X - ZoomList.Left) / ToolBarList.ZoomScale / MainObj.Scale,
                    Y: (txtComment.lastPoint.Y - ZoomList.Top) / ToolBarList.ZoomScale / MainObj.Scale
                }
            },
            CanvasCenter: {
                Left: (CanvasCL - ZoomList.Left) / ToolBarList.ZoomScale / MainObj.Scale,
                Top: (CanvasCT - ZoomList.Top) / ToolBarList.ZoomScale / MainObj.Scale,
            }
        };
    } else {
        txtComment.positionList[ID] = {
            position: {
                from: {
                    X: (txtComment.Down.X - MainObj.CanvasL) / MainObj.Scale,
                    Y: (txtComment.Down.Y - MainObj.CanvasT) / MainObj.Scale
                },
                to: {
                    X: (txtComment.lastPoint.X - MainObj.CanvasL) / MainObj.Scale,
                    Y: (txtComment.lastPoint.Y - MainObj.CanvasT) / MainObj.Scale
                }
            },
            CanvasCenter: {
                Left: (CanvasCL - MainObj.CanvasL) / MainObj.Scale,
                Top: (CanvasCT - MainObj.CanvasT) / MainObj.Scale,
            }
        };
    }

    MainObj.saveList.push({
        id: ID,
        page: MainObj.NowPage,
        type: 'comment',
        value: $(commentText).summernote('code'),
        position: txtComment.positionList[ID].position,
        left: txtComment.positionList[ID].CanvasCenter.Left,
        top: txtComment.positionList[ID].CanvasCenter.Top,
        width: $(commentDiv).outerWidth() / ToolBarList.ZoomScale + 'px',
        height: $(commentDiv).outerHeight() / ToolBarList.ZoomScale + 'px',
        bgcolor: rgbToHex($(commentDiv)[0].style.backgroundColor).toUpperCase().replace('#',''),
        LayerIndex: txtMainobj.LayerIndex,
        isShow: JSON.parse($(newCanvas).attr('iswindow')),
        isEraser: false,
        isGroup: null,
        isEraserSelect: false,
        isEraserSelectPen: false
    });

    recovery();
    if (MainObj.saveList.length > 5) {
        MainObj.saveList.splice(0, 1);
    }

    saveComment();

    $('#canvasPad').remove();
}

function newCommentPen(id, SetWidth, SetHeight, SetLeft, SetTop, SetState, SetWindow, SetPenColor, SetArcColor, SetWidthPen, SetOpacity) {
    var objWidth = txtMainobj.Textobj.W * ToolBarList.ZoomScale,
        objHeight = txtMainobj.Textobj.H * ToolBarList.ZoomScale;

    NewCanvas();
    var newCanvas = $('#canvas')[0];
    newCanvas.id = 'pen' + id;
    newCanvas.width = SetWidth == 0 ? (SetWidthPen * 2) : SetWidth;
    newCanvas.height = SetHeight == 0 ? (SetWidthPen * 2) : SetHeight;
    $(newCanvas).removeClass("canvasObj")
        .css({
            'z-index': 99,
            'position': 'absolute',
            left: SetLeft - (SetState ? 0 : SetWidthPen),
            top: SetTop - (SetState ? SetWidthPen : 0)
        }).attr({
            'class': 'commentPen',
            'tempwidth': SetWidth / ToolBarList.ZoomScale,
            'tempheight': SetHeight / ToolBarList.ZoomScale,
            'left': (SetLeft + (ToolBarList.ZoomScale > 1 ? ZoomList.DistX : 0) - (ZoomList.IsAreaZoom ? ZoomList.AreaDistX : 0) - (SetState ? 0 : SetWidthPen)) / ToolBarList.ZoomScale,
            'top': (SetTop + (ToolBarList.ZoomScale > 1 ? ZoomList.DistY : 0) - (ZoomList.IsAreaZoom ? ZoomList.AreaDistY : 0) - (SetState ? SetWidthPen : 0)) / ToolBarList.ZoomScale,
            'state': SetState,
            'iswindow': SetWindow,
            'pen': true
        }).draggable({
            cursor: "move",
            scroll: false,
            containment: "#HamastarWrapper",
            start: function () {
                $('#commentDiv' + id).hide();
                $(this).attr('iswindow', false);
            },
            drag: function (e, ui) {
                var PenCenter = {
                    Left: $(this).offset().left + (SetWidth / 2) - (SetState ? SetWidthPen : 0),
                    Top: $(this).offset().top + (SetHeight / 2) - (SetState ? 0 : SetWidthPen)
                };

                $('#commentDiv' + id).css({
                    left: PenCenter.Left + (JSON.parse(this.attributes.State.value) ? -(objWidth / 2) : -(objWidth + txtComment.lineWidth * 4)),
                    top: PenCenter.Top + (JSON.parse(this.attributes.State.value) ? txtComment.lineWidth * 4 : -(objHeight / 2))
                });
            },
            stop: function () {
                $('#commentDiv' + id).show();
                $(this).attr('iswindow', true);

                var PenCenter = {
                    Left: $(this).offset().left + (SetWidth / 2) - (SetState ? SetWidthPen : 0),
                    Top: $(this).offset().top + (SetHeight / 2) - (SetState ? 0 : SetWidthPen)
                };

                objComBoundary($('#commentDiv' + id)[0], JSON.parse(this.attributes.State.value), PenCenter.Left, PenCenter.Top, (JSON.parse(this.attributes.State.value) ? (objWidth / 2) : (objWidth + txtComment.lineWidth * 4)), (JSON.parse(this.attributes.State.value) ? txtComment.lineWidth * 4 : (objHeight / 2)));

                if (ToolBarList.ZoomScale > 1) {
                    txtComment.positionList[id].CanvasCenter = {
                        Left: (PenCenter.Left - ZoomList.Left) / ToolBarList.ZoomScale / MainObj.Scale,
                        Top: (PenCenter.Top - ZoomList.Top) / ToolBarList.ZoomScale / MainObj.Scale,
                    };
                } else {
                    txtComment.positionList[id].CanvasCenter = {
                        Left: (PenCenter.Left - MainObj.CanvasL) / MainObj.Scale,
                        Top: (PenCenter.Top - MainObj.CanvasT) / MainObj.Scale,
                    };
                }

                saveComment();
            }
        }).click(function (e) {
            e.preventDefault();
            $('#commentDiv' + id).toggle();
            $(this).attr('iswindow', !JSON.parse($(this).attr('iswindow')))
            CommentLast(id);
            saveComment();
        });

    var newCxt = newCanvas.getContext('2d');
    newCxt.lineWidth = SetWidthPen;
    newCxt.globalAlpha = SetOpacity;

    var CenterX = (newCanvas.width / 2);
    var CenterY = (newCanvas.height / 2);

    newCxt.clearRect(0, 0, newCanvas.width, newCanvas.height);
    newCxt.globalCompositeOperation = 'destination-over';

    newCxt.fillStyle = SetArcColor;
    newCxt.beginPath();
    newCxt.arc(CenterX, CenterY, SetWidthPen, 0, 2 * Math.PI);
    newCxt.fill();

    newCxt.strokeStyle = SetPenColor;
    newCxt.beginPath();
    newCxt.moveTo((SetState ? 0 : SetWidthPen), (SetState ? SetWidthPen : 0));
    newCxt.lineTo(SetWidth == 0 ? SetWidthPen : SetWidth, SetHeight == 0 ? SetWidthPen : SetHeight);
    newCxt.closePath();

    newCxt.stroke();

    return newCanvas;
}

function CommentLast(id) {
    var Commentlast = $('#HamastarWrapper').children().last();
    if (Commentlast[0].id !== id) {
        $('#' + id).insertAfter($(Commentlast));

        changeTextEditor('commentText' + id, "focus");
    }
}

// 用四個象限判斷畫直線或橫線
function getLastPoint(start, end) {
    if (end.X <= start.X && end.Y <= start.Y) {
        // 左上
        if (start.X - end.X > start.Y - end.Y) {
            return {
                X: end.X,
                Y: start.Y,
                State: true
            }
        } else {
            return {
                X: start.X,
                Y: end.Y,
                State: false
            }
        }
    } else if (end.X >= start.X && end.Y <= start.Y) {
        // 右上
        if (end.X - start.X > start.Y - end.Y) {
            return {
                X: end.X,
                Y: start.Y,
                State: true
            }
        } else {
            return {
                X: start.X,
                Y: end.Y,
                State: false
            }
        }
    } else if (end.X >= start.X && end.Y >= start.Y) {
        // 右下
        if (end.X - start.X > end.Y - start.Y) {
            return {
                X: end.X,
                Y: start.Y,
                State: true
            }
        } else {
            return {
                X: start.X,
                Y: end.Y,
                State: false
            }
        }
    } else if (end.X <= start.X && end.Y >= start.Y) {
        // 左下
        if (start.X - end.X > end.Y - start.Y) {
            return {
                X: end.X,
                Y: start.Y,
                State: true
            }
        } else {
            return {
                X: start.X,
                Y: end.Y,
                State: false
            }
        }
    } else {
        return {
            X: start.X,
            Y: start.Y,
            State: null
        }
    }
}

// 儲存註記資訊
function saveComment() {
    for (var i = 0; i < $('.commentBox').length; i++) {
        var obj = $('.commentBox')[i];
        for (var x = 0; x < txtComment.saveList.length; x++) {
            if (obj.id == txtComment.saveList[x].id) {
                txtComment.saveList.splice(x, 1);
            }
        }

        var temp = {
            id: obj.id,
            page: MainObj.NowPage,
            type: 'comment',
            value: $('#commentText' + obj.id).summernote('code'),
            position: txtComment.positionList[obj.id].position,
            left: txtComment.positionList[obj.id].CanvasCenter.Left,
            top: txtComment.positionList[obj.id].CanvasCenter.Top,
            width: $('#commentDiv' + obj.id).outerWidth() / ToolBarList.ZoomScale + 'px',
            height: $('#commentDiv' + obj.id).outerHeight() / ToolBarList.ZoomScale + 'px',
            LayerIndex: $('#commentDiv' + obj.id).attr('LayerIndex'),
            isShow: JSON.parse($('#pen' + obj.id).attr('iswindow')),
            bgcolor: rgbToHex($('#commentDiv' + obj.id)[0].style.backgroundColor).toUpperCase().replace('#','')
        };

        txtComment.saveList.push(temp);
    }
}

// 回復註記
function replyComment(page) {
    $('.commentBox').remove();
    $(txtComment.saveList).each(function () {
        if (this.page == page && this.type == 'comment') {
            reDrawComment(this);
        }
    });
}

function reDrawCommentPen(obj) {
    var left = ZoomList.IsZoom ? ZoomList.DistX : 0;
    var top = ZoomList.IsZoom ? ZoomList.DistY : 0;

    left -= ZoomList.IsAreaZoom ? ZoomList.AreaDistX : 0;
    top -= ZoomList.IsAreaZoom ? ZoomList.AreaDistY : 0;

    var CanvasW = (Number(obj.attributes.tempwidth.value) * ToolBarList.ZoomScale),
        CanvasH = (Number(obj.attributes.tempheight.value) * ToolBarList.ZoomScale);
    var CanvasL = (Number(obj.attributes.left.value) * ToolBarList.ZoomScale - left) + (JSON.parse(obj.attributes.state.value) ? 0 : txtComment.lineWidth * ToolBarList.ZoomScale),
        CanvasT = (Number(obj.attributes.top.value) * ToolBarList.ZoomScale - top) + (JSON.parse(obj.attributes.state.value) ? txtComment.lineWidth * ToolBarList.ZoomScale : 0);

    var ID = obj.id.replace('pen', '');

    var newCanvas = newCommentPen(ID, CanvasW, CanvasH, CanvasL, CanvasT, JSON.parse(obj.attributes.state.value), JSON.parse(obj.attributes.iswindow.value), txtComment.penStyle, txtComment.arcStyle, txtComment.lineWidth * ToolBarList.ZoomScale, txtComment.globalAlpha);

    $(newCanvas).insertBefore(obj);
}

// 重建單個comment
function reDrawComment(obj) {
    var ID = obj.id;
    var comment = obj;

    if (comment.width != undefined) {
        var titleWidth = (Number(comment.width.split('px')[0]));
        titleHeight = txtMainobj.Textobj.Title.H;
    } else {
        var titleWidth = txtMainobj.Textobj.W * ToolBarList.ZoomScale,
            titleHeight = txtMainobj.Textobj.Title.H;
    }

    if (comment.width != undefined) {
        var objWidth = titleWidth,
            objHeight = (Number(comment.height.split('px')[0]));
    } else {
        var objWidth = titleWidth,
            objHeight = txtMainobj.Textobj.H * ToolBarList.ZoomScale;
    }

    var textareaW = titleWidth,
        textareaH = (objHeight - titleHeight) - txtMainobj.Textobj.TempH;

    var fromX = (comment.position.from.X * MainObj.Scale * ToolBarList.ZoomScale) + MainObj.CanvasL,
        fromY = (comment.position.from.Y * MainObj.Scale * ToolBarList.ZoomScale) + MainObj.CanvasT,
        toX = (comment.position.to.X * MainObj.Scale * ToolBarList.ZoomScale) + MainObj.CanvasL,
        toY = (comment.position.to.Y * MainObj.Scale * ToolBarList.ZoomScale) + MainObj.CanvasT;

    var LastPoint = getLastPoint(comment.position.from, comment.position.to)

    var CanvasW = Math.abs(fromX - toX),
        CanvasH = Math.abs(fromY - toY);

    if (comment.left == undefined) {
        var CanvasL = (Math.min(comment.position.from.X, comment.position.to.X) * MainObj.Scale * ToolBarList.ZoomScale) + MainObj.CanvasL
    } else {
        var CanvasL = (comment.left * MainObj.Scale * ToolBarList.ZoomScale) + MainObj.CanvasL - (CanvasW / 2) + txtComment.lineWidth;
    }

    if (comment.top == undefined) {
        var CanvasT = (Math.min(comment.position.from.Y, comment.position.to.Y) * MainObj.Scale * ToolBarList.ZoomScale) + MainObj.CanvasT
    } else {
        var CanvasT = (comment.top * MainObj.Scale * ToolBarList.ZoomScale) + MainObj.CanvasT - (CanvasH / 2) + txtComment.lineWidth;
    }

    var CanvasCW = CanvasW / 2,
        CanvasCH = CanvasH / 2;
    var CanvasCL = (CanvasL + CanvasCW) - txtComment.lineWidth,
        CanvasCT = (CanvasT + CanvasCH) - txtComment.lineWidth;
    var CommentDW = (LastPoint.State ? (objWidth / 2) : (objWidth + txtComment.lineWidth * 4)),
        CommentDH = (LastPoint.State ? txtComment.lineWidth * 4 : (objHeight / 2));
    var CommentCLD = CanvasCL - CommentDW,
        CommentCTD = CanvasCT + CommentDH;

    var divBox = document.createElement('div');
    divBox.id = ID;
    $(divBox).attr('class', 'commentBox');
    $('#HamastarWrapper').append(divBox);

    var newCanvas = newCommentPen(ID, CanvasW, CanvasH, CanvasL, CanvasT, LastPoint.State, (comment.isShow == undefined? false : JSON.parse(comment.isShow)), txtComment.penStyle, txtComment.arcStyle, txtComment.lineWidth, txtComment.globalAlpha);
    $(divBox).append(newCanvas);

    setTimeout(function () {
        var commentDiv = document.createElement('div');
        commentDiv.id = 'commentDiv' + ID;
        $(divBox).append(commentDiv);
        $(commentDiv)
            .attr({
                'class': 'commentNote',
                'LayerIndex': comment.LayerIndex
            })
            .css({
                'position': 'absolute',
                'width': objWidth,
                'height': objHeight,
                'left': CommentCLD,
                'top': CommentCTD,
                'display': (comment.isShow == undefined? 'none' : JSON.parse(comment.isShow) ? 'flex' : 'none'),
                'flex-direction': 'column',
                'border': '5px solid #fdecac',
                'background-color': '#fdecac',
                'z-index': 99
            })
            .draggable({
                cursor: "move",
                containment: "#HamastarWrapper",
                handle: '.commentTitle',
                cancel: '.commentTitleName'
            })
            .resizable({
                zIndex: 100,
                minHeight: txtMainobj.Textobj.H,
                minWidth: txtMainobj.Textobj.W,
                alsoResize: '#cke_text' + ID + '>.cke_inner>.cke_contents',
                start: function () {
                    $(window).off("resize", resizeInit);
                },
                resize: function (e, ui) {
                    var tempH = ui.size.height - objHeight
                    changeTextEditor('commentDiv' + ID, "resize", textareaW, textareaH + tempH)
                },
                stop: function (event, ui) {
                    $(window).resize(resizeInit);
                    saveComment();
                }
            })
            .click(function () {
                CommentLast(ID);
            });

        var commentTitle = document.createElement('nav');
        commentTitle.id = 'commentTitle' + ID;
        $(commentDiv).append(commentTitle);
        $(commentTitle)
            .attr({
                'class': 'commentTitle navbar navbar-light'
            })
            .css({
                'background-color': '#fdecac',
                'width': '100%',
                'height': titleHeight,
                'padding': 0
            });

        var commentTitleName = document.createElement('a');
        commentTitleName.innerHTML = txtMainobj.TitleName.Comment;
        $(commentTitle).append(commentTitleName);
        $(commentTitleName)
            .attr({
                'contenteditable': true
            })
            .addClass('navbar-brand commentTitleName')
            .css({
                'font-size': '1.7rem',
                'padding': 0
            });

        var commentTitleBtn = document.createElement('div');
        $(commentTitle).append(commentTitleBtn);
        $(commentTitleBtn).addClass('form-inline')

        var commentText = document.createElement('textarea');
        commentText.id = 'commentText' + ID;
        $(commentDiv).append(commentText);

        textEditor(commentText, textareaW, textareaH, saveComment, comment.value);

        txtNarrowBtn(commentTitleBtn, ID);
        txtCloseBtn(commentTitleBtn, ID);

        objComBoundary(commentDiv, LastPoint.State, CanvasCL, CanvasCT, CommentDW, CommentDH);
    });

    if (ToolBarList.ZoomScale > 1) {
        txtComment.positionList[ID] = {
            position: {
                from: {
                    X: (fromX - ZoomList.Left) / ToolBarList.ZoomScale / MainObj.Scale,
                    Y: (fromY - ZoomList.Top) / ToolBarList.ZoomScale / MainObj.Scale
                },
                to: {
                    X: (toX - ZoomList.Left) / ToolBarList.ZoomScale / MainObj.Scale,
                    Y: (toY - ZoomList.Top) / ToolBarList.ZoomScale / MainObj.Scale
                }
            },
            CanvasCenter: {
                Left: (CanvasCL - ZoomList.Left) / ToolBarList.ZoomScale / MainObj.Scale,
                Top: (CanvasCT - ZoomList.Top) / ToolBarList.ZoomScale / MainObj.Scale,
            }
        };
    } else {
        txtComment.positionList[ID] = {
            position: {
                from: {
                    X: (fromX - MainObj.CanvasL) / MainObj.Scale,
                    Y: (fromY - MainObj.CanvasT) / MainObj.Scale
                },
                to: {
                    X: (toX - MainObj.CanvasL) / MainObj.Scale,
                    Y: (toY - MainObj.CanvasT) / MainObj.Scale
                }
            },
            CanvasCenter: {
                Left: (CanvasCL - MainObj.CanvasL) / MainObj.Scale,
                Top: (CanvasCT - MainObj.CanvasT) / MainObj.Scale,
            }
        };
    }
}

function txtCommentReset() {
    $('.commentBox').remove();
}