//畫Canvas
var markList = [];
var zIndex = 100;

function drawCanvas(page, str) {

    if ($('.Input')[0] != undefined) {
        $('.Input').remove();
    }

    if (str != null) {
        var canvasID = 'CanvasGallery';
        if (MainObj.IsTwoPage) {
            page = page + 1;
        }
    } else {
        var canvasID = 'CanvasLeft';
    }

    var canvas = document.getElementById(canvasID);
    var cxt = canvas.getContext("2d");

    if (MainObj.AllBackground[page] != undefined) {
        var img = MainObj.AllBackground[page].img;
    } else {
        var img = null;
    }

    if (page < HamaList.length && page >= 0) {

        if (img != null) {
            //畫背景
            cxt.drawImage(img, 0, 0, MainObj.NewCanvasWidth, MainObj.NewCanvasHeight);
            invertCanvas(cxt, MainObj.NewCanvasWidth, MainObj.NewCanvasHeight);
        }

        //畫物件
        DrawObjs(page, cxt, canvasID, str);

    }

    if (MainObj.IsTwoPage) {
        drawTwoPage(page, img, str);
    }

    //畫翻頁特效
    DrawGallery(str, img);

    ResizeConnector(str);

}

//雙頁模式時，同時畫第二個canvas
function drawTwoPage(page, img, str) {

    if (str != null) {
        var canvasID = 'CanvasGallery';
    } else {
        var canvasID = 'CanvasRight';
    }

    var canvas = document.getElementById(canvasID);
    var cxtLeft = canvas.getContext('2d');

    //剛開書時，
    //若是向右翻則右邊為空白，因此右邊的頁數設為-1，右邊才能夠呈現空白
    //若是向左翻則左邊為空白，因此左邊的頁數設為-1，左邊才能夠呈現空白
    var page = page - 1;

    if (page < HamaList.length && page >= 0) {
        img = MainObj.AllBackground[page].img;
        cxtLeft.drawImage(img, 0, 0, MainObj.NewCanvasWidth, MainObj.NewCanvasHeight);
        invertCanvas(cxtLeft, MainObj.NewCanvasWidth, MainObj.NewCanvasHeight);
        DrawObjs(page, cxtLeft, canvasID);
    }
}

//Canvas畫其他物件
//物件的屬性都先乘上scale，來改變在canvas的位置及大小
function DrawObjs(page, cxt, canvasID, str) {

    //將HamaList的Objects依照zIndex重新排序(由最底層至最上層)
    HamaList[page].Objects.sort(function (a, b) {
        return a.zIndex - b.zIndex;
    });

    MainObj.CanvasL = $('#' + canvasID)[0].offsetLeft;
    MainObj.CanvasT = $('#' + canvasID)[0].offsetTop;

    if (HamaList[page].PageType == 'Hamastar.Project.ExamProcedureSliceFormatter') {
        for (var x = 0; x < HamaList[page].Objects.length; x++) {

            var quizObj = HamaList[page].Objects[x];

            if (quizObj.FormatterType == 'CorrectBox') {
                if (quizObj.InteractiveType == 'InteractiveCorrectRect' || quizObj.InteractiveType == 'InteractiveInput') {
                    Quiz.AllCorrect++;
                }
            } else if (quizObj.FormatterType == 'Connector') {
                Quiz.AllCorrect++;
            }
        }
    }

    //判斷當頁是否要撥放背景音樂
    if (HamaList[page].PlayBackgroundMusic == '1') {
        BGMusicPlay();
    } else {
        BGMusicPause();
    }

    //旁白
    if (str == null && HamaList[page].AudioFileName != '') {
        if (!$('#Narration')[0]) {
            $('<audio/>', {
                id: 'Narration',
                class: 'Narration',
                src: 'Resource/' + HamaList[page].AudioFileName
            }).appendTo('#HamastarWrapper');

            $('#Narration')[0].volume = 1;
            $('#Narration')[0].play();

            $("#Narration").on('ended', function () {
                $(this).remove();

                AutomaticPage();
            });
        }
    } else {
        AutomaticPage();
    }

    var firstCxt = [];
    var img = [];
    var firstW = [];
    var firstH = [];

    for (var i = 0; i < HamaList[page].Objects.length; i++) {
        var scale = MainObj.Scale;
        var obj = HamaList[page].Objects[i];
        switch (obj.FormatterType) {

            //畫筆
            case 'BurshPoints':

                var Points = obj.Points.Point;

                if (str == null) {

                    NewCanvas(obj);

                    var CanvasAfterVideo = document.getElementById('canvas');
                    cxt = CanvasAfterVideo.getContext('2d');
                    $(CanvasAfterVideo).css({
                        'pointer-events': 'none'
                    });

                    var Left = GetLineAttributes(Points[0].X, Points[1].X, scale)[0];
                    var Top = GetLineAttributes(Points[0].Y, Points[1].Y, scale)[0];
                    var Width = GetLineAttributes(Points[0].X, Points[1].X, scale)[1];
                    var Height = GetLineAttributes(Points[0].Y, Points[1].Y, scale)[1];

                    canvasObjSet(i, $('#CanvasLeft').width(), $('#CanvasLeft').height(), 0, 0, obj.PixelSize);

                    borderstyle(CanvasAfterVideo.id, obj.DashStyle, obj.ForeColor, obj.PixelSize);

                    for (var p = 0; p < obj.Points.Point.length - 1; p++) {
                        cxt.moveTo(Points[p].X * scale, Points[p].Y * scale);
                        cxt.lineTo(Points[p + 1].X * scale, Points[p + 1].Y * scale);
                        cxt.stroke();
                    }

                    invertCanvas(cxt, $('#CanvasLeft').width(), $('#CanvasLeft').height());

                }

                break;

                //箭頭
            case 'ArrowLinePoint':

                var Points = obj.Points.Point;

                if (str == null) {

                    NewCanvas(obj);

                    var CanvasAfterVideo = document.getElementById('canvas');
                    cxt = CanvasAfterVideo.getContext('2d');

                    var Left = GetLineAttributes(Points[0].X, Points[1].X, scale)[0];
                    var Top = GetLineAttributes(Points[0].Y, Points[1].Y, scale)[0];
                    var Width = GetLineAttributes(Points[0].X, Points[1].X, scale)[1];
                    var Height = GetLineAttributes(Points[0].Y, Points[1].Y, scale)[1];
                    var PixelSize = obj.PixelSize * scale;

                    canvasObjSet(i, Width + 20, Height + 20, Left - 10, Top - 10, obj.PixelSize);
                    $(CanvasAfterVideo).css({
                        'pointer-events': 'none'
                    });

                    borderstyle(CanvasAfterVideo.id, obj.DashStyle, obj.ForeColor, obj.PixelSize);

                    cxt.moveTo((Points[0].X - obj.Left) * scale + 10, (Points[0].Y - obj.Top) * scale + 10);
                    cxt.lineTo((Points[1].X - obj.Left) * scale + 10, (Points[1].Y - obj.Top) * scale + 10);

                    cxt.stroke();

                    var movex1 = (Points[1].X - obj.Left) * scale + 10,
                        movey1 = (Points[1].Y - obj.Top) * scale + 10;

                    var dx = movex1 - ((Points[0].X - obj.Left) * scale + 10);
                    var dy = movey1 - ((Points[0].Y - obj.Top) * scale + 10);

                    // normalize
                    var length = Math.sqrt(dx * dx + dy * dy);
                    var unitDx = dx / length;
                    var unitDy = dy / length;
                    // increase this to get a larger arrow head
                    var arrowHeadSize = 5 * MainObj.Scale;

                    var arrowPoint1 = new Point(
                        (movex1 - unitDx * arrowHeadSize - unitDy * arrowHeadSize),
                        (movey1 - unitDy * arrowHeadSize + unitDx * arrowHeadSize));
                    var arrowPoint2 = new Point(
                        (movex1 - unitDx * arrowHeadSize + unitDy * arrowHeadSize),
                        (movey1 - unitDy * arrowHeadSize - unitDx * arrowHeadSize));

                    strokeArrowHead(cxt, movex1, movey1, arrowPoint1, arrowPoint2, obj.ForeColor);

                    invertCanvas(cxt, $('#CanvasLeft').width(), $('#CanvasLeft').height());
                }
                break;

                //直線
            case 'LinePoint':

                var Points = obj.Points.Point;

                if (str == null) {

                    NewCanvas(obj);

                    var CanvasAfterVideo = document.getElementById('canvas');
                    cxt = CanvasAfterVideo.getContext('2d');
                    $(CanvasAfterVideo).css({
                        'pointer-events': 'none'
                    });

                    var Left = (obj.Left - obj.PixelSize / 2) * scale;
                    var Top = (obj.Top - obj.PixelSize / 2) * scale;
                    var Width = obj.Width * scale;
                    var Height = obj.Height * scale;
                    var PixelSize = obj.PixelSize * scale;

                    if (Points[0].X || Points[1].X || Points[0].Y || Points[1].Y) {
                        // 問編輯器算法
                        if (Points[0].X == Points[1].X) {
                            // 直線

                            canvasObjSet(i, Width, Height, Left, Top, 0);

                            borderstyle(CanvasAfterVideo.id, obj.DashStyle, obj.ForeColor, PixelSize);

                            var x1 = (Points[0].X - obj.Left) * scale,
                                x2 = (Points[1].X - obj.Left) * scale,
                                y1 = (Points[0].Y - obj.Top) * scale,
                                y2 = (Points[1].Y - obj.Top) * scale;
                            var vect = {
                                X: x2 - x1,
                                Y: y2 - y1
                            };

                            cxt.moveTo(Width / 2, 0);
                            cxt.lineTo(Width / 2, Height);
                        } else if (Points[0].Y == Points[1].Y) {
                            // 橫線

                            canvasObjSet(i, Width, Height, Left, Top, 0);

                            borderstyle(CanvasAfterVideo.id, obj.DashStyle, obj.ForeColor, PixelSize);

                            var x1 = (Points[0].X - obj.Left) * scale,
                                x2 = (Points[1].X - obj.Left) * scale,
                                y1 = (Points[0].Y - obj.Top) * scale,
                                y2 = (Points[1].Y - obj.Top) * scale;
                            var vect = {
                                X: x2 - x1,
                                Y: y2 - y1
                            };

                            cxt.moveTo(0, Height / 2);
                            cxt.lineTo(Width, Height / 2);
                        } else {
                            // 斜線

                            canvasObjSet(i, Width, Height, Left, Top, PixelSize);

                            borderstyle(CanvasAfterVideo.id, obj.DashStyle, obj.ForeColor, PixelSize);

                            if (Points[0].Y < Points[1].Y) {
                                var x1 = (Points[0].X - obj.Left + PixelSize / 2) * scale,
                                    x2 = (Points[1].X - obj.Left - PixelSize / 2) * scale,
                                    y1 = (Points[0].Y - obj.Top + PixelSize / 2) * scale,
                                    y2 = (Points[1].Y - obj.Top - PixelSize / 2) * scale;
                            } else {
                                var x1 = (Points[0].X - obj.Left - PixelSize / 2) * scale,
                                    x2 = (Points[1].X - obj.Left + PixelSize / 2) * scale,
                                    y1 = (Points[0].Y - obj.Top - PixelSize / 2) * scale,
                                    y2 = (Points[1].Y - obj.Top + PixelSize / 2) * scale;
                            }

                            cxt.moveTo(x1, y1);
                            cxt.lineTo(x2, y2);
                        }
                        cxt.stroke();

                        invertCanvas(cxt, $('#CanvasLeft').width(), $('#CanvasLeft').height());
                    } else {
                        $(CanvasAfterVideo).remove();
                    }


                }

                break;

                //矩形
            case 'RectangleObject':

                var Left = obj.Left * scale;
                var Top = obj.Top * scale;
                var Width = obj.Width * scale;
                var Height = obj.Height * scale;
                var PixelSize = obj.PixelSize * 2;

                if (str == null) {

                    NewCanvas(obj);

                    var CanvasAfterVideo = document.getElementById('canvas');
                    cxt = CanvasAfterVideo.getContext('2d');
                    $(CanvasAfterVideo).css({
                        'pointer-events': 'none'
                    });

                    canvasObjSet(i, Width, Height, Left, Top, PixelSize);

                    borderstyle(CanvasAfterVideo.id, obj.DashStyle, obj.BorderColor, obj.PixelSize);
                    cxt.strokeRect(obj.PixelSize, obj.PixelSize, Width, Height);
                    cxt.fillStyle = obj.Brush;
                    if (obj.Brush != '') {
                        cxt.fillRect(0, 0, Width, Height); //填滿
                    }

                    invertCanvas(cxt, Width + obj.PixelSize * 2, Height + obj.PixelSize * 2);

                }

                break;

                //圓
            case 'EllipseObject':

                var Left = obj.Left * scale;
                var Top = obj.Top * scale;
                var Width = obj.Width * scale;
                var Height = obj.Height * scale;
                var PixelSize = obj.PixelSize * 2;

                if (str == null) {

                    NewCanvas(obj);

                    var CanvasAfterVideo = document.getElementById('canvas');
                    cxt = CanvasAfterVideo.getContext('2d');
                    $(CanvasAfterVideo).css({
                        'pointer-events': 'none'
                    });

                    canvasObjSet(i, Width, Height, Left, Top, PixelSize);

                    borderstyle(CanvasAfterVideo.id, obj.DashStyle, obj.BorderColor, obj.PixelSize);
                    centerx = obj.PixelSize + Width / 2;
                    centery = obj.PixelSize + Height / 2;

                    BezierEllipse(cxt, centerx, centery, Width / 2, Height / 2);

                }
                cxt.fillStyle = obj.Brush;
                if (obj.Brush != '') {
                    cxt.fill();
                }

                invertCanvas(cxt, Width + obj.PixelSize * 2, Height + obj.PixelSize * 2);

                break;

                //圖片
            case 'ImageLayer':

                var W = Math.round(obj.Width * scale);
                var H = Math.round(obj.Height * scale);
                var L = Math.round(obj.Left * scale);
                var T = Math.round(obj.Top * scale);

                var objList = MainObj.AllObjslist;


                //用MainObj.ImgCount來計數已經畫過的圖片，如已經畫過就不會再掃描到了
                for (var x = MainObj.ImgCount; x < objList.length; x++) {
                    if (objList[x].Page == page && objList[x].Type == 'ImageLayer') {

                        if (str == null) {

                            NewCanvas(obj);

                            var CanvasAfterVideo = document.getElementById('canvas');
                            cxt = CanvasAfterVideo.getContext('2d');

                            canvasObjSet(x, W, H, L, T, 0, page);

                            //圖片透明度
                            cxt.globalAlpha = Number(obj.Alpha);

                            firstCxt[x] = cxt;
                            firstW[x] = W;
                            firstH[x] = H;

                            img[x] = new Image();
                            img[x].onload = function () {
                                for (var r = 0; r < img.length; r++) {
                                    if (img[r] != undefined) {
                                        try {
                                            firstCxt[r].clearRect(0, 0, firstW[r], firstH[r]);
                                            firstCxt[r].drawImage(img[r], 0, 0, firstW[r], firstH[r]);
                                            invertCanvas(firstCxt[r], firstW[r], firstH[r]);
                                        } catch (e) {}
                                    }
                                }
                            }
                            img[x].src = "Resource/" + obj.XFileName;

                            QuizModule(i, obj.FormatterType, null, page);
                            AnimationObjSet(obj, page);

                            if (obj.isPictureDragObject == '0') {
                                $('#' + obj.Identifier).css('pointer-events', 'none');
                            }

                        }
                        MainObj.ImgCount = x + 1;
                        break;
                    }
                }
                break;

                //影片
            case 'VideoLayer':
                if (str == null) {
                    NewVideo(obj, scale);
                }
                break;

                //正確框
            case 'CorrectBox':
                if (str == null && HamaList[page].PageType == 'Hamastar.Project.InteractiveProcedureSliceFormatter') {
                    NewInput(obj, scale, page); //填充題輸入框

                    if (obj.ExamAnswer == undefined) {
                        obj.ExamAnswer = false;
                        obj.ExamType = 'Input';
                        HamaList[page].ExamType = 'Input';
                    }

                } else if (str == null) {
                    NewCanvas(obj);
                    QuizBGSet(i, obj, page);
                }
                break;

                //錯誤框
            case 'ErrorBox':
                if (str == null) {
                    NewCanvas(obj);
                    QuizBGSet(i, obj, page);
                }
                break;

                //連接線，加上測驗模式需要的參數
            case 'Connector':
                if (str == null) {
                    if (obj.ExamAnswer == undefined) {
                        obj.ExamAnswer = 'N';
                        obj.ExamType = 'Connector';
                        HamaList[page].ExamType = 'Connector';
                    }
                }
                break;

                //遮罩貼紙
            case 'MaskingLayer':
                if (str == null) {
                    NewCanvas(obj);
                    MaskSetting(obj);
                }
                break;

                //塗抹
            case 'ErasingPicture':
                if (str == null) {
                    NewCanvas(obj);
                    ErasingPictureSetting(i, obj, page);
                }
                break;

                //嵌入網頁
            case 'HtmlScriptObject':
                if (str == null) {
                    Newiframe(obj, obj.ScriptType);
                }
                break;

                //360
            case 'RotationImageObject':
                if (str == null) {
                    NewCanvas(obj);
                    RotationImageSet(obj, page);
                }
                break;

                //幻燈片
            case 'SlideshowObject':
                if (str == null) {
                    NewCanvas(obj);
                    SlideShowSet(obj);
                }
                break;

                //動態平移
            case 'ScrollObject':
                if (str == null) {
                    NewCanvas(obj);
                    ScrollSet(obj, page);
                }
                break;

                // 連結
            case 'HyperLinkObject':
                if (str == null && obj.BaseFormatterType != 'Hamastar.AddIns.Whiteboard.TriggerRectObjectFormatter') {
                    NewCanvas(obj);
                    HyperLinkSet(obj);
                }
                break;

                // 感應區
            case 'AdditionalFileObject':
                if (str == null && obj.BaseFormatterType != 'Hamastar.AddIns.Whiteboard.TriggerRectObjectFormatter') {
                    NewCanvas(obj);
                    AdditionalCanvasSet(obj, page);
                }
                break;

                // 全文朗讀
            case 'SequencePlayObject':
                if (str == null) {
                    NewCanvas(obj);
                    SequencePlayCanvas(obj, page);
                }
                break;

                // 輔助視窗
            case 'IntroductionObject':
                if (str == null && obj.BaseFormatterType != 'Hamastar.AddIns.Whiteboard.TriggerRectObjectFormatter') {
                    NewCanvas(obj);
                    IntroCanvasSet(obj);
                }
                break;

                // 動畫感應區
            case 'AnimationGroup':
                if (str == null) {
                    // NewCanvas(obj);
                    AnimationGroupSet(obj, page);
                }
                break;

                // 720
            case 'PanoramaObject':
                if (str == null) {

                    //720在IE無法正常運作，因此在IE時720不建立物件，並跳alert
                    var msie = window.navigator.userAgent.toLowerCase().indexOf("msie");
                    var trident = window.navigator.userAgent.toLowerCase().indexOf("trident");

                    if (msie != -1 || trident != -1) {
                        alert('此瀏覽器不支援720度VR');
                    } else {
                        PanoramaSet(obj);
                    }

                }
                break;

                // 測驗題組(送出試卷按鈕)
            case 'ExamFinish':
                if (str == null) {
                    NewCanvas(obj);
                    ExamCanvasSet(obj);
                }
                break;

                // 文字框
            case 'TextObject':
                if (str == null) {
                    NewCanvas(obj);
                    TextSet(obj);
                }
                break;

                //說話框
            case 'DialogFrame':
                if (str == null) {
                    NewCanvas(obj);
                    DialogFrameSet(obj);
                }
                break;

                //gif圖片
            case 'AnimationPic':
                if (str == null) {
                    NewImg(obj);
                }
                break;

                //註記
            case 'MarkObject':
                if (str == null) {
                    SetMarkObject(obj);
                }
                break;

                //文字彈跳視窗
            case 'TextPopup':
                if (str == null) {
                    setTextPopup(obj);
                }
                break;

                //另開附件-子物件
            case 'EmptyObject':
                if (str == null) {
                    NewCanvas(obj);
                    setEmptyObject(obj);
                }
                break;


        }
    }
    MainObj.ImgCount = 0;
}

//取得物件的位置範圍
function Point(x, y) {
    this.x = x;
    this.y = y;
}

//取得直線的canvas之Left、Top、Width、Height
function GetLineAttributes(x1, x2, scale) {

    x1 = Number(x1);
    x2 = Number(x2);

    if (x2 > x1) {
        var value1 = scale * x1;
        var value2 = scale * (x2 - x1);
    } else {
        var value1 = scale * x2;
        var value2 = scale * (x1 - x2);
    }
    return [value1, value2];
}

//翻頁特效
function DrawGallery(str, img) {
    if (Gallery.Drag) {
        $('.canvasObj').remove();
        $('.video').remove();
        $('.iframeObj').remove();
        $('.Text').remove();
        $('.fileObj').remove();
        $('.videoFile').remove();
        $('.commentBox').remove();
        $('.canvasConnector').remove();

        var mouseX = Gallery.Mouse.x;
        var halfWidth = MainObj.NewCanvasWidth;
        var Height = MainObj.NewCanvasHeight;

        Gallery.Cxt.clearRect(0, 0, Gallery.Canvas.width, Height);

        switch (str) {
            case 'Right': //往右滑
                var X = DrawGallerySetting(str, img, 1, -1, mouseX, 0, halfWidth, Height, false);
                DrawShadow(mouseX, X, 0, 0.9, 1);
                // 滑鼠滑動超過頁面中間去掉陰影
                if (Gallery.Mouse.x < halfWidth) {
                    Gallery.Cxt.fillRect(mouseX, 0, X - mouseX, Height);
                }
                break;

            case 'Left': //往左滑
                var l = mouseX - halfWidth;
                var X = DrawGallerySetting(str, img, -1, 1, l, 0, halfWidth, Height, true);
                DrawShadow(X, mouseX, 1, 0.1, 0);
                // 滑鼠滑動超過頁面中間去掉陰影
                if (Gallery.Mouse.x > halfWidth) {
                    Gallery.Cxt.fillRect(X, 0, mouseX, Height);
                }
                break;
        }

        borderstyle('CanvasGallery', "Solid", "rgba(0, 0, 0, 255)", 0.5);
        if (MainObj.IsTwoPage) {
            Gallery.Cxt.moveTo(halfWidth, 0);
            Gallery.Cxt.lineTo(halfWidth, Height);
            Gallery.Cxt.stroke();
        }
        Gallery.Cxt.moveTo(mouseX, 0);
        Gallery.Cxt.lineTo(mouseX, Height);
        Gallery.Cxt.globalAlpha = 1;
        Gallery.Cxt.stroke();

    }
}

//單雙頁翻頁模式設定
//(左右滑，圖片，頁數+-，頁數+-，Left，Top，Width，Height)
function DrawGallerySetting(str, img, right, left, l, t, w, h, isLeft) {
    var canvasDownPageLeft = document.getElementById('CanvasLeft');
    var X = MainObj.NewCanvasWidth;
    if (MainObj.IsTwoPage) {
        isRightSetting(str, img);
    } else {
        drawSingleGallery(right, left, img, isLeft);
        Gallery.Cxt.drawImage(canvasDownPageLeft, l, t, w, h);
        if (str == 'Right') {
            X = Gallery.Canvas.width;
        } else {
            X = 0;
        }
    }
    return X;
}

//雙頁模式，翻頁的左右頁面顯示
//(往左右翻，圖片)
function isRightSetting(turnPageStr, img) {

    var canvasDownPageRight = document.getElementById('CanvasRight');
    var cxtRight = canvasDownPageRight.getContext('2d');

    if (turnPageStr == 'Right') {
        var isRight = MainObj.IsRight;
        var str = 'Left';
    } else {
        var isRight = !MainObj.IsRight;
        var str = 'Right';
    }

    if (isRight) {
        drawTwoGallery(MainObj.LeftPage + 2, 0, 1, img, str);
    } else {
        cxtRight.clearRect(0, 0, canvasDownPageRight.width, canvasDownPageRight.height);
        drawTwoGallery(MainObj.RightPage - 2, -1, -2, img, str);
    }
}

//單頁模式，畫下一頁特效
//(頁數+-，頁數+-，圖片)
function drawSingleGallery(right, left, img, isLeft) {
    if (MainObj.IsRight) {
        drawBuffer(MainObj.NowPage + right, img, 'Left', isLeft);
    } else {
        drawBuffer(MainObj.NowPage + left, img, 'Left', isLeft);
    }
}

//雙頁模式，翻轉頁顯示
//(上下頁，頁數+-，頁數+-，圖片，左右滑)
function drawTwoGallery(page, left, right, img, str) {
    var halfWidth = MainObj.NewCanvasWidth;

    if (str == 'Left') {
        var Shadow = ['ShadowLeft', 'ShadowRight'];
        var MouseMove = Gallery.Mouse.x < halfWidth;
    } else {
        var Shadow = ['ShadowRight', 'ShadowLeft'];
        var MouseMove = Gallery.Mouse.x > halfWidth;
    }

    drawBuffer(page, img, str);
    if (MouseMove) {
        drawBuffer(MainObj.NowPage + left, img, Shadow[0]);
    } else {
        drawBuffer(MainObj.NowPage + right, img, Shadow[1]);
    }

}

//翻頁陰影
function DrawShadow(x1, x2, white, black, gray) {

    var shadow = Gallery.Cxt.createLinearGradient(x1, 0, x2, 0);
    Gallery.Cxt.globalAlpha = 0.2;
    shadow.addColorStop(white, "white");
    shadow.addColorStop(black, "black");
    shadow.addColorStop(gray, "DimGray");
    Gallery.Cxt.fillStyle = shadow;

}

//利用緩衝區Buffer來畫出上下頁
function drawBuffer(page, img, str, isLeft) {

    var Width = MainObj.NewCanvasWidth;
    var Height = MainObj.NewCanvasHeight;
    var mouseX = Gallery.Mouse.x;

    var canvasBuffer = document.getElementById('Buffer');
    canvasBuffer.width = Width;
    canvasBuffer.height = Height;
    var contextBuffer = canvasBuffer.getContext('2d');

    if (page < HamaList.length && page >= 0) {

        if (MainObj.AllBackground[page] != undefined) {
            img = MainObj.AllBackground[page].img;
            if (!img) return;

            contextBuffer.drawImage(img, 0, 0, MainObj.NewCanvasWidth, Height);
            invertCanvas(contextBuffer, MainObj.NewCanvasWidth, Height);
            DrawObjs(page, contextBuffer, 'Buffer', 'Buffer');

            switch (str) {
                case 'Right':
                    Gallery.Cxt.drawImage(canvasBuffer, Width, 0, Width, Height);
                    break;
                case 'Left':
                    if (MainObj.IsTwoPage) {
                        Gallery.Cxt.drawImage(canvasBuffer, 0, 0, Width, Height);
                    } else {
                        Gallery.Cxt.drawImage(canvasBuffer, (isLeft ? mouseX : mouseX - Width), 0, Width, Height);
                    }
                    break;
                case 'ShadowRight':
                    Gallery.Cxt.drawImage(canvasBuffer, Width, 0, mouseX - Width, Height);
                    break;
                case 'ShadowLeft':
                    Gallery.Cxt.drawImage(canvasBuffer, mouseX, 0, Width - mouseX, Height);
                    break;
            }
        }
    }
}

//border樣式
function borderstyle(canvasID, style, color, width) {
    var c = $('#' + canvasID)[0];
    var cxt = c.getContext("2d");

    switch (style) {
        case 'Dot':
            cxt.setLineDash([5, 10]);
            break;
        case 'Dash':
            cxt.setLineDash([15, 20]);
            break;
        case 'DashDot':
            cxt.setLineDash([5, 5]);
            break;
        case 'DashDotDot':
            cxt.setLineDash([15, 3, 5, 3, 5, 3]);
            break;
        case 'Solid':
            cxt.setLineDash([1, 0]);
            break;
    }
    cxt.strokeStyle = color;
    cxt.lineWidth = width;

    cxt.beginPath();
}

//畫箭頭
function strokeArrowHead(ctx, x, y, arrowPoint1, arrowPoint2, color) {
    ctx.setLineDash([1, 0]);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(((arrowPoint1.x)), ((arrowPoint1.y)));
    ctx.lineTo(((arrowPoint2.x)), ((arrowPoint2.y)));
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.restore();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();
}

//貝茲曲線
function BezierEllipse(context, x, y, a, b) {

    //關鍵是2個控制點的設置
    // 0.5和0.6是2個關鍵係數
    var ox = 0.5 * a,
        oy = 0.6 * b;

    context.save();
    context.translate(x + a, y + b);
    context.beginPath();
    //從橢圓縱軸下端開始逆時針方向繪製
    context.moveTo(0, b);
    context.bezierCurveTo(ox, b, a, oy, a, 0);
    context.bezierCurveTo(a, -oy, ox, -b, 0, -b);
    context.bezierCurveTo(-ox, -b, -a, -oy, -a, 0);
    context.bezierCurveTo(-a, oy, -ox, b, 0, b);
    context.closePath();
    context.stroke();
    context.restore();

};

//新增canvas於body
function NewCanvas(obj) {
    var CanvasObj = document.createElement('canvas');
    CanvasObj.id = 'canvas';
    CanvasObj.width = $('#CanvasLeft').width();
    CanvasObj.height = $('#CanvasLeft').height();
    $('#HamastarWrapper').append(CanvasObj);
    $(CanvasObj)
        .addClass('canvasObj')
        .css({
            'position': 'absolute',
            'cursor': 'pointer'
        });
    if (obj) {
        $(CanvasObj)
            .attr('Identifier', obj.Identifier)
            .css('transform', 'rotate(' + (obj.Position.R != undefined ? obj.Position.R : obj.Rotate) + 'deg)');
    }
}

//canvasObj的屬性設定
function canvasObjSet(num, width, height, left, top, pixelSize, page) {
    var CanvasAfterVideo = document.getElementById('canvas');

    CanvasAfterVideo.width = width + pixelSize;
    CanvasAfterVideo.height = height + pixelSize;
    CanvasAfterVideo.id = MainObj.AllObjslist[num].Identifier + page;
    $('#' + CanvasAfterVideo.id).css({
        'left': left + MainObj.CanvasL,
        'top': top + MainObj.CanvasT
    })
    CanvasAfterVideo.id = MainObj.AllObjslist[num].Identifier;
}

//新增嵌入網頁iframe (Youtube、GoogleMap)
function Newiframe(obj, type) {
    if (!$('#' + type + obj.Identifier)[0]) {
        var scale = MainObj.Scale,
            frame = document.createElement('iframe');
        frame.id = type + obj.Identifier;
        frame.width = obj.Width * scale;
        frame.height = obj.Height * scale;
        $('#HamastarWrapper').append(frame);
        var URL = obj.URLPath != '' ? obj.URLPath : obj.HtmlUrl;
        $(frame)
            .addClass('iframeObj')
            .attr('Identifier', obj.Identifier)
            .css({
                'position': 'absolute',
                'left': obj.Left * scale + MainObj.CanvasL,
                'top': obj.Top * scale + MainObj.CanvasT,
                'z-index': 99
            })
            .attr({
                'Identifier': obj.Identifier,
                'frameborder': '0',
                'allowfullscreen': true,
                'src': URL
            });
    }
}

function drawButtonImage(obj, cxt, width, height) {
    if (obj.BackgroundXFileName != '') {
        var img = new Image();
        img.onload = function () {
            cxt.globalAlpha = Number(obj.Alpha);
            cxt.globalCompositeOperation = 'copy';
            cxt.drawImage(img, 0, 0, width, height);
            invertCanvas(cxt, width, height);
        }
        img.src = (obj.IsPatch == 'true' ? 'Patch/' : 'Resource/') + obj.BackgroundXFileName;
    }
}

//畫文字到canvas上自動換行
function canvasTextAutoLine(str, canvas, initX, initY, lineHeight) {
    var cxt = canvas.getContext("2d");
    var lineWidth = 0;
    var canvasWidth = canvas.width;
    var lastSubStrIndex = 0;
    for (var i = 0; i < str.length; i++) {
        lineWidth += cxt.measureText(str[i]).width;
        if (lineWidth > canvasWidth - initX * 3) { //減去initX,防止邊界出現問題
            cxt.fillText(str.substring(lastSubStrIndex, i), initX, initY);
            initY += lineHeight;
            lineWidth = 0;
            lastSubStrIndex = i;
        }
        if (i == str.length - 1) {
            cxt.fillText(str.substring(lastSubStrIndex, i + 1), initX, initY);
        }
    }
}

//文字框設置
function TextSet(obj) {

    var canvas = $('#canvas')[0];
    var cxt = canvas.getContext('2d');

    var scale = MainObj.Scale;
    var Left = obj.Left * scale + MainObj.CanvasL;
    var Top = obj.Top * scale + MainObj.CanvasT;
    var Width = obj.Width * scale;
    var Height = obj.Height * scale;

    canvas.id = obj.Identifier;

    canvas.width = Width;
    canvas.height = Height;
    $('#' + obj.Identifier).css({
        'left': Left,
        'top': Top,
        'pointer-events': 'none'
    });

    var img = new Image();
    img.onload = function () {
        cxt.drawImage(img, 0, 0, Width, Height);
        invertCanvas(cxt, Width, Height);
    }
    img.src = 'Resource/' + obj.CharSetImg;

}

//說話框設置
function DialogFrameSet(obj) {

    var canvas = $('#canvas')[0];
    var cxt = canvas.getContext('2d');

    var scale = MainObj.Scale;
    var Left = obj.Left * scale + MainObj.CanvasL;
    var Top = obj.Top * scale + MainObj.CanvasT;
    var Width = obj.Width * scale;
    var Height = obj.Height * scale;

    canvas.id = obj.Identifier;

    canvas.width = Width;
    canvas.height = Height;
    $('#' + obj.Identifier).css({
        'left': Left,
        'top': Top,
        'pointer-events': 'none',
        'transform': 'rotate(' + obj.FrameRotate + 'deg)'
    });

    var img = new Image();
    img.onload = function () {
        cxt.drawImage(img, 0, 0, Width, Height);
        invertCanvas(cxt, Width, Height);

        var textarea = document.createElement('textarea');
        $('#HamastarWrapper').append(textarea);

        textarea.id = 'text' + obj.Identifier;
        $(textarea).addClass('canvasObj');

        $(textarea).css({
            'background-color': 'transparent',
            'resize': 'none',
            'border': '0px',
            'position': 'absolute',
            'width': obj.DialogWidth * scale,
            'height': obj.DialogHeight * scale,
            'left': obj.DialogLeft * scale + Left,
            'top': obj.DialogTop * scale + Top,
            'font-size': obj.ContentsSize + 'px',
            'color': obj.ContentsColor,
            'font-family': 'Arial'
        })

        $(textarea).attr('readonly', true); //只讀
        $(textarea).attr('wrap', 'hard'); //換行

        $(textarea)[0].value = obj.Contents;

    }
    img.src = 'Resource/' + obj.XFileName;

}

// gif圖片設置
function NewImg(obj) {

    var Img = new Image();
    Img.src = 'Resource/' + obj.XFileName;

    Img.id = obj.Identifier;
    Img.width = obj.Width * MainObj.Scale;
    Img.height = obj.Height * MainObj.Scale;
    $('#HamastarWrapper').append(Img);
    $(Img).attr('class', 'canvasObj');
    $(Img).css({
        'left': obj.Left * MainObj.Scale + MainObj.CanvasL,
        'top': obj.Top * MainObj.Scale + MainObj.CanvasT,
        'position': 'absolute',
        'pointer-events': 'none'
    });
    if (obj != undefined) {
        $(Img).css({
            'transform': 'rotate(' + obj.Rotate + 'deg)'
        });
    }

}

// 設置自動翻頁
function AutomaticPage() {
    // 翻頁會一直設定，要清掉
    if (MainObj.automaticPage) {
        clearTimeout(MainObj.automaticPage);
    }

    if (HamaList[MainObj.NowPage]) {
        MainObj.automaticPage = setTimeout(function () {
            // 循環
            if (MainObj.NowPage == HamaList.length - 1) {
                gotoPage(0);
            } else {
                gotoPage(MainObj.NowPage + 1);
            }
        }, HamaList[MainObj.NowPage].IntervalSeconds * 1000);
    }
    // console.log('AutoTurnPageTime: ' + HamaList[MainObj.NowPage].IntervalSeconds);
}

// 註記物件設置
function SetMarkObject(obj) {
    var scale = MainObj.Scale;
    var mark = document.createElement("textarea");
    mark.id = obj.Identifier;
    mark.width = obj.Width * scale;
    mark.height = obj.height * scale;
    mark.value = obj.MarkContent;
    $(mark).attr('class', 'canvasObj');
    $(mark).addClass('noFocus');
    $(mark).addClass('markObj');
    $('#HamastarWrapper').append(mark);
    $(mark).css({
        'position': 'absolute',
        'width': obj.Width * scale,
        'height': obj.Height * scale,
        'left': obj.Left * scale + MainObj.CanvasL,
        'top': obj.Top * scale + MainObj.CanvasT,
        'border': 'unset',
        'background-color': 'transparent',
        'resize': 'none'
    })
    $(mark).on('keyup', function () {
        SaveMark();
    });
    if (obj != undefined) {
        $(mark).css({
            'transform': 'rotate(' + obj.Rotate + 'deg)'
        });
    }

    if (markList.length) {
        for (var i = 0; i < markList.length; i++) {
            if (markList[x]) {
                if (markList[i].id == obj.Identifier) {
                    mark.value = obj.MarkContent;
                }
            }
        }
    }
}

//變更註記內容
function ReplyMark(page) {
    if (markList.length) {
        for (var i = 0; i < markList.length; i++) {
            if (markList[i]) {
                if (Number(markList[i].page) == Number(page)) {
                    for (var a = 0; a < $('.markObj').length; a++) {
                        if (markList[i].id == $('.markObj')[a].id) {
                            $('.markObj')[a].value = markList[i].value;
                        }
                    }
                }
            }
        }
    }
}

// 註記內容儲存
function SaveMark() {
    if (markList.length) {
        for (var x = 0; x < markList.length; x++) {
            if (markList[x]) {
                if (Number(markList[x].page) == Number(MainObj.NowPage)) {
                    delete markList[x];
                }
            }
        }
    }

    for (var i = 0; i < $('.markObj').length; i++) {
        var mark = $('.markObj')[i];
        markList.push({
            page: MainObj.NowPage,
            id: mark.id,
            type: 'mark',
            value: mark.value
        })
    }
}