//連連看

var connectorSuccess = false;



//連連看
//連連看滑鼠點擊事件
function ConnectorDown() {

    if (connectorSuccess) return;

    event.preventDefault();

    Quiz.Down.X = event.type == 'touchstart' ? event.targetTouches[0].pageX : (event.clientX ? event.clientX : event.originalEvent.clientX);

    if ($('#canvas')[0] != undefined) {
        $('#canvas').remove();
    }

    //每條線都各為一個canvas，因此每次畫線都要新增一個新的canvas
    Quiz.Canvas = document.createElement('canvas');

    //在新的canvas上建立新的事件畫連連看的線
    //由於原本document的move事件會影響到畫線的事件，導致無法正確畫線
    //因此判斷為連連看時，將document的move事件先移除掉
    Quiz.Canvas.addEventListener( "mousemove", function() { ConnectorMove(event, obj) }, false ); //滑鼠移動事件
    Quiz.Canvas.addEventListener( "mouseup", function() { ConnectorUp(false) }, false ); //滑鼠放開事件
    // Quiz.Canvas.addEventListener( "mouseout", function() { ConnectorUp(false) }, false ); //滑鼠離開事件
    // Quiz.Canvas.addEventListener( "touchmove", function() { ConnectorMove(event, obj) }, false ); //手指移動事件
    // Quiz.Canvas.addEventListener( "touchend", function() { ConnectorUp(false) }, false );     //手指放開事件

    Quiz.Canvas.id = 'canvas';
    // $('body').append(Quiz.Canvas);
    $('#HamastarWrapper').append(Quiz.Canvas);
    Quiz.Canvas.width = $('#CanvasLeft').width();
    Quiz.Canvas.height = $('#CanvasLeft').height();
    getPage();
    getPagePosition(Quiz.Page);
    var Left = getNewLeft(MainObj.CanvasL);

    $('#canvas').css({
        'position': 'absolute',
        'left': MainObj.CanvasL,
        'top': MainObj.CanvasT,
        'z-index': 99
    });

    var obj = HamaList[Quiz.Page].Objects;
    for (var i = 0; i < obj.length; i++) {
        if (obj[i].Identifier == this.id) {
            obj = obj[i];
            break;
        }
    }

    //紀錄一開始點擊的位置
    Quiz.Objs.From = obj;

    Quiz.Drag = true;
}



//連連看滑鼠移動事件
function ConnectorMove(event, obj) {

    // event.preventDefault();

    // Quiz.Mouse.X = event.clientX - $('#Canvas' + getPage()).offset().left;
    // Quiz.Mouse.Y = event.clientY - $('#Canvas' + getPage()).offset().top;

    Quiz.Mouse.X = event.type == 'touchmove' ? event.targetTouches[0].pageX : (event.clientX ? event.clientX : event.originalEvent.clientX);
    Quiz.Mouse.Y = event.type == 'touchmove' ? event.targetTouches[0].pageY : (event.clientY ? event.clientY : event.originalEvent.clientY);

    Quiz.Mouse.X -= $('#Canvas' + getPage()).offset().left;
    Quiz.Mouse.Y -= $('#Canvas' + getPage()).offset().top;

    //Quiz.Drag為true時，代表正在拖拉
    if (Quiz.Drag) {
        Connector(obj);
    }

}

//連連看拉線
function Connector(obj) {

    Quiz.Canvas = document.getElementById('canvas');
    Quiz.Cxt = Quiz.Canvas.getContext("2d");

    var objFrom = getObjCenter(obj);

    Quiz.Cxt.clearRect(0, 0, Quiz.Canvas.width, Quiz.Canvas.height);

    //連連看在滑鼠拖拉時，依照滑鼠位置畫線
    borderstyle('canvas', obj.BorderStyle, 'red', obj.PixelSize);
    Quiz.Cxt.moveTo(objFrom.X, objFrom.Y);
    Quiz.Cxt.lineTo(Quiz.Mouse.X, Quiz.Mouse.Y);
    Quiz.Cxt.stroke();



}

//連連看滑鼠放開事件
//從滑鼠放開時判斷答案是否正確
function ConnectorUp(sync) {

    $(Quiz.Canvas).css({
        'pointer-events': 'none'
    })

    //同步接收時，一樣是跑這個function來連線判斷對錯
    //sync=true時表示為接收端執行動作，不需要用MouseUp來判斷滑鼠放開位置了
    if (!sync) {
        event.preventDefault();

        // var MouseUpX = event.clientX - $($('#Canvas' + getPage())).offset().left;
        // var MouseUpY = event.clientY - $($('#Canvas' + getPage())).offset().top;

        var MouseUpX = event.type == 'touchmove' ? event.changedTouches[0].pageX : (event.clientX ? event.clientX : event.originalEvent.clientX);
        var MouseUpY = event.type == 'touchmove' ? event.changedTouches[0].pageY : (event.clientY ? event.clientY : event.originalEvent.clientY);

        MouseUpX = MouseUpX - $('#Canvas' + getPage()).offset().left;
        MouseUpY = MouseUpY - $('#Canvas' + getPage()).offset().top;

        getObjTo(MouseUpX, MouseUpY);
    }

    var Scale = MainObj.Scale;
    var obj = HamaList[Quiz.Page].Objects;
    var connectorCount = ConnectorCount();

    //取得正確答案
    var Answer = getAnswer();
    var correct = false;

    if (Quiz.Objs.To != null && Quiz.Objs.To != Quiz.Objs.From) {

        if (!Quiz.IsExam) {

            if (Exam.QuizAction) {
                //紀錄每次點擊
                Exam.Choose++;
            }

            //紀錄已畫過線的次數
            Quiz.ConnectorNow++;

            for (var ans = 0; ans < Answer.length; ans++) {

                if (Answer[ans].To == Quiz.Objs.To.Identifier) {

                    if (Quiz.ConnectorNow == Answer[ans].Connector.ConnectOrderIndex || Answer[ans].Connector.ConnectOrderIndex == '0') {

                        if (Exam.QuizAction) {
                            var sameObj = false;
                            $(Quiz.Choose).each(function() {

                                var case1 = this.fromID == Quiz.Objs.From.Identifier && this.toID == Quiz.Objs.To.Identifier;
                                var case2 = this.fromID == Quiz.Objs.To.Identifier && this.toID == Quiz.Objs.From.Identifier;

                                if (case1 || case2) {
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

                        RecordConnector(Answer[ans]);

                        //如果連接器已有畫過，則砍掉原本的連接器，重建一個新的
                        if ($('#Connector' + Answer[ans].Connector.Identifier)[0] != undefined) {
                            $('#Connector' + Answer[ans].Connector.Identifier).remove();
                            Quiz.ConnectorNow--;
                        }

                        ConnectorSetting(Answer[ans].Connector.Identifier);

                        //全答對一秒後跳下一頁
                        if (Quiz.ConnectorNow == connectorCount) {
                            Quiz.isFinish = true;
                            ResetSelect();

                            if (HamaList[Quiz.Page].CorrectMode == 'NoMsg') {
                                setTimeout(function() {
                                    $('.canvasConnector').remove();
                                    goPageSet();
                                    Quiz.ConnectorNow = 0;
                                }, 1000);
                            } else {
                                showResponses('CorrectMsg', true);
                                connectorSuccess = true;
                            }

                            ResponsesAudio(MainObj.NowPage, true);

                        } else if (HamaList[MainObj.NowPage].IsCorrectAllToFeedback == '0') {
                            showResponses('CorrectMsg');
                            //connectorSuccess = true;
                            ResponsesAudio(MainObj.NowPage, true);
                        }
                        correct = true;
                    }

                    break;

                }
            }

            if (!correct) {
                Quiz.ConnectorNow--;
                $('#canvas').remove();
                Quiz.ErrorNum++;
                ConnectorError();
                showResponses('ErrorMsg');
                ResponsesAudio(MainObj.NowPage, false);
            }
        } else { //連連看測驗模式

            var connected = false;

            for(var x = 0; x < Quiz.Choose.length; x++) {

                if (Quiz.Choose[x] != undefined) {

                    var case1 = Quiz.Choose[x].fromID == Quiz.Objs.From.Identifier && Quiz.Choose[x].toID == Quiz.Objs.To.Identifier;
                    var case2 = Quiz.Choose[x].fromID == Quiz.Objs.To.Identifier && Quiz.Choose[x].toID == Quiz.Objs.From.Identifier;

                    if (Quiz.Choose[x].Page == MainObj.NowPage) {
                        if (case1 || case2) {
                            var connectorID = Quiz.Choose[x].ID;
                            delete Quiz.Choose[x];
                            connected = true;
                        }
                    }
                }
            }

            if (connected) {
                $('#Connector' + connectorID).remove();
                $('#canvas').remove();
                return;
            }

            var ID = $('.canvasConnector').length;
            var answer = 'N';

            //判斷答案(obj.ExamAnswer)
            //'Y'答案正確
            //'N'答案錯誤
            $(Answer).each(function() {
                if (this.To == Quiz.Objs.To.Identifier) {
                    
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

            ConnectorSetting(ID);

            var list = {
                Type: 'Connector',
                ID: ID,
                Page: MainObj.NowPage,
                fromID: Quiz.Objs.From.Identifier,
                toID: Quiz.Objs.To.Identifier,
                Answer: answer,
                RecordTime: getRecordTime()
            }

            Quiz.Choose.push(list);

        }

    } else {
        $('#canvas').remove();
    }

    Quiz.Objs.From = null;
    Quiz.Objs.To = null;
    Quiz.Drag = false;
}

//連連看視窗resize時重畫線的canvas，要將已連線過的部分一併畫上
function ResizeConnector(str) {
    getPage();
    if (Quiz.Page >= 0 && Quiz.Page < HamaList.length) {
        var obj = HamaList[Quiz.Page].Objects;

        if ($('.canvasConnector')[0] != undefined && str == undefined) {
            for (var i = 0; i < obj.length; i++) {
                var type = obj[i].FormatterType;

                if (type == 'Connector' && obj[i].Selected == true) {
                    Quiz.Objs = getResizeLine(obj, i);
                    var id = obj[i].Identifier;
                    ConnectorSetting(id);
                }

            }
        }
    }
}

//連連看取得線的位置
function getResizeLine(obj, num) {
    for (var x = 0; x < obj.length; x++) {
        if (obj[x].Identifier == obj[num].From) {
            var From = obj[x];
        }
        if (obj[x].Identifier == obj[num].To) {
            var To = obj[x];
        }
    }
    return { From: From, To: To };
}

//連連看的每條線都各為一個canvas，以便後來能夠有消除線的功能
function ConnectorSetting(id) {

    Quiz.Canvas.id = 'Connector' + id;
    $('#Connector' + id).attr('class','canvasConnector');

    var objFrom = getObjCenter(Quiz.Objs.From);
    var objTo = getObjCenter(Quiz.Objs.To);

    var Left = GetLineAttributes(objFrom.X, objTo.X, 1)[0];
    var Top = GetLineAttributes(objFrom.Y, objTo.Y, 1)[0];
    var Width = GetLineAttributes(objFrom.X, objTo.X, 1)[1];
    var Height = GetLineAttributes(objFrom.Y, objTo.Y, 1)[1];

    Quiz.Canvas.width = Width + 6;
    Quiz.Canvas.height = Height + 6;
    $('#Connector' + id).css({
        'position': 'absolute',
        'left': Left + MainObj.CanvasL - 3,
        'top': Top + MainObj.CanvasT - 3,
    })

    Quiz.Cxt.clearRect(0, 0, Quiz.Canvas.width, Quiz.Canvas.height);
    borderstyle('Connector' + id, 'Solid', 'red', 3);
    drawLine(objFrom, objTo, Width, Height);
    // $('#WebBox').append(Quiz.Canvas);
}

//連連看判斷答案正確後畫線
function drawLine(point1, point2, width, height) {

    var DownUp = (point1.X < point2.X && point1.Y > point2.Y) || (point1.X > point2.X && point1.Y < point2.Y);

    if (DownUp) {
        Quiz.Cxt.moveTo(3, height + 3);
        Quiz.Cxt.lineTo(width, 3);
    } else {
        Quiz.Cxt.moveTo(3, 3);
        Quiz.Cxt.lineTo(width, height);
    }

    Quiz.Cxt.stroke();

}

//連連看取得正確框中心點
function getObjCenter(obj) {

    var scale = MainObj.Scale;

    var objW = obj.Width / 2;
    var objH = obj.Height / 2;
    var objL = Number(obj.Left);
    var objT = Number(obj.Top);

    var X = scale * (objW + objL);
    var Y = scale * (objH + objT);

    return { X: X, Y: Y };

}

//連連看取得正確答案
function getAnswer() {
    var obj = HamaList[Quiz.Page].Objects;
    var Answer = [];
    var List;

    for (var i = 0; i < obj.length; i ++) {
        if (obj[i].FormatterType == 'Connector') {
            //雙向連連看
            if (obj[i].Interactivedirec == 'Bilateral') {
                if (Quiz.Objs.From.Identifier == obj[i].From) {
                    List = { From: obj[i].From, To: obj[i].To, Connector: obj[i] };
                    Answer.push(List);
                } else if (Quiz.Objs.From.Identifier == obj[i].To) {
                    List = { From: obj[i].To, To: obj[i].From, Connector: obj[i] };
                    Answer.push(List);
                }
            //單向
            } else {
                if (Quiz.Objs.From.Identifier == obj[i].From) {
                    List = { From: obj[i].From, To: obj[i].To, Connector: obj[i] };
                    Answer.push(List);
                }
            }
        }
    }
    return Answer;
}

//連連看計算連接器總數
function ConnectorCount() {
    var obj = HamaList[Quiz.Page].Objects;
    var Count = 0;
    for (var x = 0; x < obj.length; x++) {
        if (obj[x].FormatterType == 'Connector') {
            Count++;
        }
    }
    return Count;
}

//連連看取得滑鼠放開的位置
function getObjTo(x, y) {
    var obj = HamaList[Quiz.Page].Objects;
    for (var i = 0; i < obj.length; i++) {
        var PointX = getPoint(obj[i].Left, obj[i].Width);
        var PointY = getPoint(obj[i].Top, obj[i].Height);
        if (x > PointX[0] && x < PointX[1] && y > PointY[0] && y < PointY[1]) {
            if (obj[i].FormatterType == 'CorrectBox' && obj[i].InteractiveType == 'InteractiveConnector') {
                //滑鼠最後放開的位置，若在正確框內，則紀錄起來
                Quiz.Objs.To = obj[i];
            }
        }
    }
}

function getPoint(position, volume) {
    var Scale = MainObj.Scale;
    var x1 = Scale * position;
    var x2 = Scale * (Number(volume) + Number(position));
    return [x1, x2];
}

//連連看取得答案的中心點
function getErrorPoint(pointID) {
    var obj = HamaList[Quiz.Page].Objects;
    for (var x = 0; x < obj.length; x++) {
        if (pointID == obj[x].Identifier) {
            var point = getObjCenter(obj[x]);
        }
    }
    point.X = point.X + MainObj.CanvasL;
    point.Y = point.Y + MainObj.CanvasT;
    return point;
}

//連連看紀錄是否已正確連線
function RecordConnector(answer) {
    var obj = HamaList[Quiz.Page].Objects;
    for (var x = 0; x < obj.length; x++) {
        if (obj[x].FormatterType == 'Connector' && obj[x].Identifier == answer.Connector.Identifier) {
            obj[x].Selected = true;
        }
    }
}

//連連看錯誤次數等於錯誤率(ErrorCount)時，提示答案
//一般連連看、圖片連連看
function ConnectorError() {
    $('#ErrorCanvas').remove();
    var ErrorCount = Number(HamaList[Quiz.Page].ErrorCount);
    var obj = HamaList[Quiz.Page].Objects;
    var scale = MainObj.Scale;
    if (Quiz.ErrorNum >= ErrorCount) {
        ErrorCanvas();
        for (var i = 0; i < obj.length; i++) {
            if (obj[i].FormatterType == 'Connector' && obj[i].Selected == false) {

                var Canvas = document.getElementById('ErrorCanvas');
                var Cxt = Canvas.getContext('2d');
                
                var PointFrom = getErrorPoint(obj[i].From);
                var PointTo = getErrorPoint(obj[i].To);

                //連連看提示答案為綠色線
                borderstyle('ErrorCanvas', 'Solid', '#00FF00', 3);
                Cxt.moveTo(PointFrom.X, PointFrom.Y);
                Cxt.lineTo(PointTo.X, PointTo.Y);
                Cxt.stroke();

                if (obj[i].ConnectOrderIndex != '0') {
                    var Msg = obj[i].ConnectOrderIndex;
                    var Padding = 20;
                    Cxt.font = Padding + 'px Arial';
                    Cxt.fillStyle = "#00FF00";
                    Cxt.fillText(Msg, PointTo.X, PointTo.Y - 3);
                }
            }
        }
        Quiz.ErrorNum = 0;
    }
}
