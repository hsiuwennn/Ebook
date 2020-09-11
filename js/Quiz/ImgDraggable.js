//圖片連連看
var imgConnect = {
    Dragid: null,
    Drag: false
};

//圖片連連看
function imgDraggable(canvas) {

    getPagePosition(Quiz.Page);

    var W = canvas.width;
    var H = canvas.height;
    var L = Quiz.Mouse.X - W / 2 + MainObj.CanvasL;
    var T = Quiz.Mouse.Y - H / 2 + MainObj.CanvasT;

    L = getNewLeft(L);

    $('#' + canvas.id).css({
        'left': L,
        'top': T
    })
}

//圖片連連看滑鼠點擊事件
function imgDragDown(event) {
    event.preventDefault();

    Quiz.Down.X = event.type == 'touchstart' ? event.targetTouches[0].pageX : (event.clientX ? event.clientX : event.originalEvent.clientX);

    getPage();

    var obj = HamaList[Quiz.Page].Objects;
    for (var i = 0; i < obj.length; i++) {
        if (obj[i].Identifier == this.id) {
            obj = obj[i];
            break;
        }
    }

    $('body').append(this);

    this.addEventListener('mousemove', imgDragMove, false);
    this.addEventListener('mouseup', imgDragUp, false);
    this.addEventListener('mouseout', imgDragMove, false);

    this.addEventListener("touchmove", imgDragMove, false ); //手指移動事件
    this.addEventListener("touchend", imgDragUp, false );     //手指放開事件
    this.addEventListener( "touchcancel", imgDragMove, false );    //手指離開事件

    Quiz.Objs.From = obj;

    imgConnect.Dragid = this.id;
    imgConnect.Drag = true;
}

//圖片連連看滑鼠移動事件
function imgDragMove(event) {
    event.preventDefault();

    Quiz.Mouse.X = event.type == 'touchmove' ? event.targetTouches[0].pageX : (event.clientX ? event.clientX : event.originalEvent.clientX);
    Quiz.Mouse.Y = event.type == 'touchmove' ? event.targetTouches[0].pageY : (event.clientY ? event.clientY : event.originalEvent.clientY);

    Quiz.Mouse.X = Quiz.Mouse.X - $('#Canvas' + getPage()).offset().left;
    Quiz.Mouse.Y = Quiz.Mouse.Y - $('#Canvas' + getPage()).offset().top;

    if (imgConnect.Drag && imgConnect.Dragid == this.id) {
        imgDraggable(this);
    }
}

//圖片連連看滑鼠放開事件
function imgDragUp(event) {

    var that = this;

    var MouseUpX = event.type == 'touchend' ? event.changedTouches[0].pageX : (event.clientX ? event.clientX : event.originalEvent.clientX);
    var MouseUpY = event.type == 'touchend' ? event.changedTouches[0].pageY : (event.clientY ? event.clientY : event.originalEvent.clientY);

    MouseUpX = MouseUpX - $('#Canvas' + getPage()).offset().left;
    MouseUpY = MouseUpY - $('#Canvas' + getPage()).offset().top;

    imgGetObjTo(MouseUpX, MouseUpY);

    var ImgDragCount = ConnectorCount();

    var Answer = getAnswer();

    if (Quiz.Objs.To != null && Quiz.Objs.To != Quiz.Objs.From) {

        if (!Quiz.IsExam) {

            if (Exam.QuizAction) {
                //紀錄每次點擊
                Exam.Choose++;
            }

            if (Answer[0].To == Quiz.Objs.To.Identifier) {

                if (Exam.QuizAction) {
                    var sameObj = false;
                    $(Quiz.Choose).each(function() {
                        if (this.fromID == Quiz.Objs.From.Identifier && this.toID == Quiz.Objs.To.Identifier) {
                            sameObj = true;
                            return;
                        }
                    })

                    $(Answer).each(function() {
                        if (this.To == Quiz.Objs.To.Identifier) {
                            var that = this;
                            $(HamaList[MainObj.NowPage].Objects).each(function() {
                                if (this.FormatterType == 'Connector') {
                                    if (that.Connector.Identifier == this.Identifier) {
                                        this.ExamAnswer = 'Y';
                                    }
                                }
                            })
                        }
                    })

                    if (!sameObj) {
                        //紀錄正確時的資訊
                        Quiz.Choose.push({
                            Type: 'Connector',
                            Page: MainObj.NowPage,
                            fromID: Quiz.Objs.From.Identifier,
                            toID: Quiz.Objs.To.Identifier,
                            Answer: 'Y',
                            RecordTime: getRecordTime()
                        })
                    }
                }

                Quiz.ErrorNum = 0;
                $('#ErrorCanvas').remove();

                //紀錄已畫過線的次數
                Quiz.ImgDragNow++;

                RecordConnector(Answer[0]);
                ImgDragSetting(that, MouseUpX, MouseUpY);

                //全答對一秒後跳下一頁
                if (Quiz.ImgDragNow == ImgDragCount) {
                    Quiz.isFinish = true;
                    ResetSelect();
                    if (HamaList[Quiz.Page].CorrectMode == 'NoMsg') {
                        setTimeout(function() {
                            goPageSet();
                            Quiz.ImgDragNow = 0;
                        }, 1000);
                    } else {
                        // $('#DivCorrectMsg').toggle();
                        showResponses('CorrectMsg', true);
                    }
                    ResponsesAudio(MainObj.NowPage, true);
                } else if (HamaList[MainObj.NowPage].IsCorrectAllToFeedback == '0') {
                    showResponses('CorrectMsg');
                    ResponsesAudio(MainObj.NowPage, true);
                }

            } else {
                Quiz.ErrorNum++;
                ConnectorError();
                ResetImg(that);
                
                if(HamaList[Quiz.Page].ErrorMode !== "NoErrorMsg") {
                    showResponses('ErrorMsg');
                }
                
                ResponsesAudio(MainObj.NowPage, false);
            }
        } else {

            ImgDragSetting(that, MouseUpX, MouseUpY);

            deleteChoosed(that);

            var answer = 'N';

            //判斷答案(obj.ExamAnswer)
            //'Y'答案正確
            //'N'答案錯誤
            $(Answer).each(function() {
                if (this.From == Quiz.Objs.From.Identifier && this.To == Quiz.Objs.To.Identifier) {
                    
                    var that = this;
                    $(HamaList[MainObj.NowPage].Objects).each(function() {

                        if (this.FormatterType == 'Connector') {
                            if (that.Connector.Identifier == this.Identifier) {
                                this.ExamAnswer = 'Y';
                                answer = 'Y';
                            }
                        }

                    })
                }
            })

            var list = {
                Type: 'Connector',
                // ID: ID,
                Page: MainObj.NowPage,
                fromID: Quiz.Objs.From.Identifier,
                toID: Quiz.Objs.To.Identifier,
                Answer: answer,
                RecordTime: getRecordTime()
            }

            Quiz.Choose.push(list);

        }

    } else {
        ConnectorError();
        ResetImg(that);

        if (Quiz.IsExam) {
            deleteChoosed(that);
        }

    }

    Quiz.Objs.To = null;
    imgConnect.Dragid = null;
    imgConnect.Drag = false;

    that.removeEventListener('mousemove', imgDragMove, false);
    that.removeEventListener('mouseup', imgDragUp, false);
    that.removeEventListener('mouseout', imgDragMove, false);

    that.removeEventListener('touchmove', imgDragMove, false);
    that.removeEventListener('touchend', imgDragUp, false);
    that.removeEventListener('touchcancel', imgDragMove, false);
}

//圖片連連看圖片拖拉放開後的位置
//若正確，則將圖片放置於感應區的正中間
function ImgDragSetting(canvas, X, Y) {

    var scale = MainObj.Scale;

    var Point = getErrorPoint(Quiz.Objs.To.Identifier);

    var W = canvas.width;
    var H = canvas.height;

    var imgArea = W * H;
    var boxArea = $('#' + Quiz.Objs.To.Identifier).width() * $('#' + Quiz.Objs.To.Identifier).height();
    var L;
    var T;
    if (imgArea > boxArea) {
        W = $('#' + Quiz.Objs.To.Identifier).width();
        H = $('#' + Quiz.Objs.To.Identifier).height();
        L = Point.X - W / 2;
        T = Point.Y - H / 2;
        $(canvas).css({
            'width': W,
            'height': H
        })
    } else {
        L = X + MainObj.CanvasL - W / 2;
        T = Y + MainObj.CanvasT - H / 2;
    }

    $('#' + canvas.id).css({
        'left': L,
        'top': T
    })
}

//圖片連連看，將圖片回復至原本位置
function ResetImg(canvas) {
    var obj = HamaList[Quiz.Page].Objects;
    var scale = MainObj.Scale;
    var W = canvas.width;
    var H = canvas.height;
    for (var x = 0; x < obj.length; x++) {
        if (canvas.id == obj[x].Identifier) {
            var L = obj[x].Left * scale + MainObj.CanvasL;
            L = getNewLeft(L);
            var T = obj[x].Top * scale + MainObj.CanvasT;
        }
    }
    $('#' + canvas.id).css({
        'left': L,
        'top': T
    })
}

function deleteChoosed(obj) {

    for (var x = 0; x < Quiz.Choose.length; x++) {

        if (Quiz.Choose[x] != undefined) {

            if (Quiz.Choose[x].Page == MainObj.NowPage) {
                if (obj.id == Quiz.Choose[x].fromID) {
                    delete Quiz.Choose[x];
                }
            }
        }
    }

}

//連連看取得滑鼠放開的位置
function imgGetObjTo(x, y) {
    var obj = HamaList[Quiz.Page].Objects;
    for (var i = 0; i < obj.length; i++) {
        var PointX = getPoint(obj[i].Left, obj[i].Width);
        var PointY = getPoint(obj[i].Top, obj[i].Height);
        if (x > PointX[0] && x < PointX[1] && y > PointY[0] && y < PointY[1]) {
            if (obj[i].FormatterType == 'CorrectBox') {
                //滑鼠最後放開的位置，若在正確框內，則紀錄起來
                Quiz.Objs.To = obj[i];
            }
        }
    }
}

