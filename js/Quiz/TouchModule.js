//點選題

function TouchModule(type, canvas, page, intro) {

    Quiz.Page = page;
    getPagePosition(page);

    if (intro == undefined) {
        var obj = HamaList[page].Objects;
        for (var i = 0; i < obj.length; i++) {
            if (obj[i].Identifier == canvas.id) {
                obj = obj[i];
            }
        }
        Quiz.CorrectMax = CorrectMax(HamaList[page].Objects);
    } else { //輔助視窗的點選題
        var obj = intro;
        for (var i = 0; i < obj.length; i++) {
            if (obj[i].Identifier == canvas.id) {
                obj = obj[i];
            }
        }
        Quiz.CorrectMax = CorrectMax(obj);
    }

    if (!Quiz.IsExam) {

        if (obj.Selected) return;

        if (Exam.QuizAction) {
            //紀錄每次點擊
            Exam.Choose++;
        }

        if (type == 'CorrectBox') {
            $('#ErrorCanvas').remove();
            var img = new Image();
            img.onload = function() {
                //紀錄點選的次數
                Quiz.CorrectNow++;
                if (Quiz.CorrectNow == obj.CorrectOrder || obj.CorrectOrder == '0') { //有順序或無順序

                    if (Exam.QuizAction) {
                        var sameObj = false;
                        $(Quiz.Choose).each(function() {
                            if (obj.Identifier == this.ID) {
                                sameObj = true;
                                return;
                            }
                        })

                        obj.ExamAnswer = 'Y';

                        if (!sameObj) {
                            //紀錄正確時的資訊
                            Quiz.Choose.push({
                                Type: 'Touch',
                                ID: obj.Identifier,
                                Page: page,
                                Answer: 'Y',
                                RecordTime: getRecordTime()
                            })
                        }
                    }

                    Quiz.ErrorNum = 0;
                    //紀錄是否已點選
                    obj.Selected = true;
                    drawAnswerHook(obj, img);
                    //全答對一秒後跳下一頁
                    if (Quiz.CorrectNow == Quiz.CorrectMax) {
                        Quiz.isFinish = true;
                        ResetSelect();
                        if (HamaList[page].CorrectMode == 'NoMsg') {
                            setTimeout(function() {

                                goPageSet();
                                
                                Quiz.CorrectNow = 0;
                            }, 1000);
                        } else {
                            // $('#DivCorrectMsg').toggle();
                            showResponses('CorrectMsg', true);
                        }

                        ResponsesAudio(page, true);

                    } else if (HamaList[MainObj.NowPage].IsCorrectAllToFeedback == '0') {
                        showResponses('CorrectMsg');
                        ResponsesAudio(page, true);
                    }
                } else {
                    Quiz.CorrectNow--;
                    TouchError();
                    // $('#DivErrorMsg').toggle();
                    showResponses('ErrorMsg');
                    ResponsesAudio(page, false);
                }
            };
            img.src = 'Resource/AnswerHook.png';
        } else if (type == 'ErrorBox') {
            TouchError(intro);
            // $('#DivErrorMsg').toggle();
            showResponses('ErrorMsg');
            ResponsesAudio(page, false);
        }
    } else { //點選題測驗模式

        //Quiz.Choose紀錄按過的obj，避免重複紀錄，用touched判斷是否按過了，就消除勾勾跟紀錄
        var touched = false;

        for(var x = 0; x < Quiz.Choose.length; x++) {
            if (Quiz.Choose[x] != undefined) {
                if (Quiz.Choose[x].ID == obj.Identifier) {
                    delete Quiz.Choose[x];
                    touched = true;
                }
            }
        }

        if (touched) {
            $('#' + obj.Identifier).remove();
            reCreateCanvas(obj, page);
            return;
        }

        //點選畫勾勾
        var img = new Image();
        img.onload = function() {

            drawAnswerHook(obj, img);

            //計算CorrectBox的數量，如果為1，表示是單選題，所以要將有打過勾的取消掉
            var correctBoxCount = 0;
            $(HamaList[page].Objects).each(function() {
                if (this.FormatterType == 'CorrectBox') {
                    correctBoxCount++;
                }
            })
            if (correctBoxCount == 1 && Quiz.Choose.length != undefined) {
                for (var i = 0; i < Quiz.Choose.length; i++) {
                    if (Quiz.Choose[i] != undefined) {
                        if (Quiz.Choose[i].Type == 'Touch' && Quiz.Choose[i].Page == page) {
                            $('#' + Quiz.Choose[i].ID).remove();

                            $(HamaList[page].Objects).each(function() {
                                if (Quiz.Choose[i] != undefined) {
                                    if (this.Identifier == Quiz.Choose[i].ID) {
                                        delete Quiz.Choose[i];
                                        reCreateCanvas(this, page);
                                        return;
                                    }
                                }
                            })
                        }
                    }
                }
            }

            //計算目前打勾的數量(點選順序)
            var orderCount = 1;
            $(Quiz.Choose).each(function() {
                if (this.Type == 'Touch' && this.Page == page) {
                    orderCount++;
                }
            })

            //判斷答案(obj.ExamAnswer)
            //'Y'答案正確
            //'N'答案錯誤
            if (type == 'CorrectBox') {
                if (orderCount == obj.CorrectOrder || obj.CorrectOrder == '0') { //有順序或無順序
                    obj.ExamAnswer = 'Y';
                } else {
                    obj.ExamAnswer = 'N';
                }
            } else if (type == 'ErrorBox') {
                obj.ExamAnswer = 'N';
            }

            var list = {
                Type: 'Touch',
                ID: obj.Identifier,
                Page: MainObj.NowPage,
                Answer: obj.ExamAnswer,
                RecordTime: getRecordTime()
            }

            Quiz.Choose.push(list);

        };
        img.src = 'Resource/AnswerHook.png';
    }
}

//點選題視窗resize時重畫canvas，要將已點選過的部分一併畫上
function ResizeTouch() {
    getPage();
    if (Quiz.Page >= 0 && Quiz.Page > HamaList.length) {
        var obj = HamaList[MainObj.NowPage].Objects;
        var scale = MainObj.Scale;

        for (var i = 0; i < obj.length; i++) {
            var type = obj[i].FormatterType;

            if (type == 'CorrectBox' && obj[i].Selected == true) {

                var Left = obj[i].Left * scale;
                var Top = obj[i].Top * scale;
                var Width = obj[i].Width * scale;
                var Height = obj[i].Height * scale;

                var img = new Image();
                img.onload = function() {
                    drawAnswerHook(obj, img);
                }
                img.src = 'Resource/AnswerHook.png';
            }
        }
    }
}

//點選題將勾勾置中畫至正確框
function drawAnswerHook(obj, img) {
    var canvas = $('#' + obj.Identifier)[0];
    var cxt = canvas.getContext("2d");

    var CorrectLeft = ((canvas.width / 2) - (img.width / 2));
    var CorrectTop = ((canvas.height / 2) - (img.height / 2));
    cxt.drawImage(img, CorrectLeft, CorrectTop);
}

//點選題取點選順序最大值
function CorrectMax(obj) {
    var temp, Max = 0;

    if (obj.length == undefined) {
        obj = [obj];
    }

    for (var i = 0; i < obj.length; i++) {
        if (obj[i].FormatterType == 'CorrectBox') {
            temp = obj[i].CorrectOrder;

            if (temp == '0') {
                Max++;
            } else {
                Max = Math.max(Max, temp);
            }
            
        }
    }
    return Max;
}

//點選題錯誤次數等於錯誤率(ErrorCount)時，提示答案
function TouchError(intro) {
    Quiz.ErrorNum++;
    $('#ErrorCanvas').remove();
    var ErrorCount = Number(HamaList[Quiz.Page].ErrorCount);

    if (intro == undefined) {
        var obj = HamaList[Quiz.Page].Objects;
    } else { //輔助視窗的點選題
        var obj = intro;
    }

    var scale = MainObj.Scale;
    if (Quiz.ErrorNum >= ErrorCount) {
        ErrorCanvas();
        for (var i = 0; i < obj.length; i++) {
            if (obj[i].FormatterType == 'CorrectBox' && obj[i].Selected == false && obj[i].CorrectOrder == (Quiz.CorrectNow + 1)) {
                var Canvas = document.getElementById('ErrorCanvas');
                var Cxt = Canvas.getContext('2d');

                getPagePosition(Quiz.Page);
                var Left = obj[i].Left * scale + MainObj.CanvasL;
                var Top = obj[i].Top * scale + MainObj.CanvasT;
                var Width = obj[i].Width * scale;
                var Height = obj[i].Height * scale;

                Left = getNewLeft(Left);

                //點選題提示答案為黃色框框及黃色數字
                borderstyle('ErrorCanvas', 'Solid', 'yellow', 3);
                Cxt.strokeRect(Left, Top, Width, Height);

                var Msg = obj[i].CorrectOrder;
                var Padding = 20 * scale;
                Cxt.font = Padding + 'px Arial';
                Cxt.fillStyle = "yellow";
                Cxt.fillText(Msg, Left + Width - Padding, Top + Padding);

                if (intro != undefined) {
                    $('#' + obj[i].Identifier).before(Canvas)
                }

            }
        }
        Quiz.ErrorNum = 0;
    }
}

function reCreateCanvas(obj, page) {

    NewCanvas(obj);
    for(var num = 0; num < HamaList[page].Objects.length; num++) {
        if (HamaList[page].Objects[num].Identifier == obj.Identifier) {
            QuizBGSet(num, obj, page);
        }
    }

}

