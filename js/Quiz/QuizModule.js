//測驗
//無一頁多測驗

var Quiz = {
    CorrectNow: 0,
    CorrectMax: 0,
    Drag: false,
    Canvas: null,
    Cxt: null,
    Mouse: { X: 0, Y: 0 },
    Down: { X: 0, Y: 0 },
    Objs: { From: null, To: null },
    ConnectorNow: 0,
    InputNow: 0,
    ErrorNum: 0,
    ImgDragNow: 0,
    Page: 0,
    PagePosition: null,

    IsExam: false, //是否為測驗模式
    IsGroup: false, //是否設定群組
    Choose: [],
    StartTime: 0,
    EndTime: 0,
    IsRandomQuiz: false,
    RandomQuizRange: null,
    RandomQuizCount: 0,

    QuizAction: false,
    isFinish: false
}




//測驗模式數值初始化
function QuizInit() {
    Quiz.CorrectNow = 0;
    Quiz.InputNow = 0;
    Quiz.ConnectorNow = 0;
    Quiz.ImgDragNow = 0;
    Quiz.ErrorNum = 0;
    Quiz.isFinish = false;

    $('.canvasConnector').remove();
    $('.Input').remove();
    $('.ErrorCanvas').remove();
}

//測驗canvas設置
function QuizBGSet(num, obj, page) {
    var scale = MainObj.Scale;
    var Left = obj.Left * scale + MainObj.CanvasL;
    var Top = obj.Top * scale + MainObj.CanvasT;
    var Width = obj.Width * scale;
    var Height = obj.Height * scale;

    $('#canvas')[0].class = 'canvasObj';
    var canvasQuizID = obj.Identifier;

    $('#canvas')[0].id = canvasQuizID;
    $('#' + canvasQuizID)[0].width = Width;
    $('#' + canvasQuizID)[0].height = Height;
    $('#' + canvasQuizID).css({ 'left': Left, 'top': Top });

    var canvas = $('#' + canvasQuizID)[0];
    var cxt = $('#' + canvasQuizID)[0].getContext('2d');

    drawButtonImage(obj, cxt, Width, Height);

    QuizModule(num, obj.FormatterType, canvasQuizID, page);

    getPage();
}

//題型判斷
function QuizModule(num, type, canvasID, page) {

    var obj = HamaList[page].Objects;

    switch (HamaList[page].PageType) {
        //一頁多題組
        case 'Hamastar.Project.ExamProcedureSliceFormatter':
            if (obj[num].InteractiveType == 'InteractiveCorrectRect' || type == 'ErrorBox') {
                if (type == 'ImageLayer') return;

                obj[num].ExamAnswer = 'N'; //測驗模式答案
                obj[num].ExamType = 'Touch';
                HamaList[page].ExamType = 'Touch';
                $('#' + canvasID).click(function (event) {
                    event.preventDefault();
                    Quiz.Down.X = (event.clientX ? event.clientX : event.originalEvent.clientX);
                    if (!Quiz.isFinish) {
                        TouchModule(type, this, page);
                    }
                })

                //測驗模式時，翻頁回來點過的答案要顯示
                if (Quiz.IsExam) {
                    $(Quiz.Choose).each(function () {

                        if (this.Type == 'Touch' && this.ID == obj[num].Identifier) {

                            obj[num].ExamAnswer = this.Answer;

                            var canvas = $('#' + this.ID)[0];
                            var cxt = canvas.getContext('2d');
                            // resizeCanvas(canvas, cxt);

                            var img = new Image();
                            img.onload = function () {
                                var CorrectLeft = ((canvas.width / 2) - (img.width / 2));
                                var CorrectTop = ((canvas.height / 2) - (img.height / 2));
                                cxt.drawImage(img, CorrectLeft, CorrectTop);
                            };
                            img.src = 'Resource/AnswerHook.png';

                        }
                    })
                }
            } else if (obj[num].InteractiveType == 'InteractiveConnector') {
                var Drag = false;

                //圖片連連看
                if (type == 'ImageLayer' && obj[num].isPictureDragObject == '1') {

                    var Canvas = document.getElementById(obj[num].Identifier);

                    //紀錄拖拉圖片
                    Quiz.Objs.From = obj[num];

                    //在新的canvas上建立新的事件畫連連看的線
                    Canvas.addEventListener('mousedown', imgDragDown, false); //滑鼠點擊事件
                    Canvas.addEventListener('touchstart', imgDragDown, false); //手指點擊事件

                    if (Quiz.IsExam) {
                        $(Quiz.Choose).each(function () {

                            if (this.Type == 'Connector' && this.Page == MainObj.NowPage) {

                                if (this.fromID == Canvas.id) {
                                    var that = this;
                                    $(HamaList[MainObj.NowPage].Objects).each(function () {
                                        if (that.toID == this.Identifier) {
                                            var toObj = this;
                                            setTimeout(function () {
                                                Quiz.Objs.To = toObj;
                                                ImgDragSetting(Canvas);
                                                $('#' + toObj.Identifier).after(Canvas);
                                                Quiz.Objs.To = null;
                                            }, 300);

                                        }
                                    })
                                }
                            }
                        })
                    }


                } else if (type == 'CorrectBox' || type == 'ErrorBox') {

                    //判斷是否圖片連連看
                    //如果是，則不畫線
                    for (var i = 0; i < obj.length; i++) {
                        if (obj[i].isPictureDragObject == '1') {
                            Drag = true;
                        }
                    }

                    if (Drag == false) {
                        var canvas = document.getElementById(canvasID);
                        canvas.addEventListener("mousedown", ConnectorDown, false); //滑鼠點擊事件
                        canvas.addEventListener('touchstart', ConnectorDown, false); //手指點擊事件

                        canvas.addEventListener("touchmove", function () {
                            ConnectorMove(event, obj[num])
                        }, false); //手指移動事件
                        canvas.addEventListener("touchend", function () {
                            ConnectorUp(false)
                        }, false); //手指放開事件
                    }

                    //測驗模式，翻頁回來連過的線要顯示
                    if (Quiz.IsExam) {
                        $(Quiz.Choose).each(function () {

                            if (this.Type == 'Connector' && this.Page == MainObj.NowPage) {
                                if ($('#Connector' + this.ID)[0] == undefined) {

                                    Quiz.Objs.From = findObj(this.fromID);
                                    Quiz.Objs.To = findObj(this.toID);

                                    if (Quiz.Objs.From.FormatterType == 'ImageLayer') return;

                                    Quiz.Canvas = document.createElement('canvas');
                                    Quiz.Cxt = Quiz.Canvas.getContext('2d');
                                    // resizeCanvas(Quiz.Canvas, Quiz.Cxt);

                                    $('body').append(Quiz.Canvas);

                                    ConnectorSetting(this.ID);

                                    if (this.Answer == 'Y') {
                                        Quiz.Page = MainObj.NowPage;
                                        var Answer = getAnswer();

                                        $(Answer).each(function () {
                                            if (this.To == Quiz.Objs.To.Identifier) {

                                                var that = this;
                                                $(HamaList[MainObj.NowPage].Objects).each(function () {

                                                    if (that.Connector.Identifier == this.Identifier) {
                                                        this.ExamAnswer = 'Y';
                                                    }
                                                })
                                            }
                                        })
                                    }
                                }
                            }
                        })
                    }

                }
            }
            break;
        //點選題
        case 'Hamastar.Project.GeneralProcedureSliceFormatter':

            if (type == 'ImageLayer') return;

            obj[num].ExamAnswer = 'N'; //測驗模式答案
            obj[num].ExamType = 'Touch';
            HamaList[page].ExamType = 'Touch';
            $('#' + canvasID).click(function (event) {
                event.preventDefault();
                Quiz.Down.X = (event.clientX ? event.clientX : event.originalEvent.clientX);
                if (!Quiz.isFinish) {
                    TouchModule(type, this, page);
                }
            })

            //測驗模式時，翻頁回來點過的答案要顯示
            if (Quiz.IsExam) {
                $(Quiz.Choose).each(function () {

                    if (this.Type == 'Touch' && this.ID == obj[num].Identifier) {

                        obj[num].ExamAnswer = this.Answer;

                        var canvas = $('#' + this.ID)[0];
                        var cxt = canvas.getContext('2d');

                        var img = new Image();
                        img.onload = function () {
                            var CorrectLeft = ((canvas.width / 2) - (img.width / 2));
                            var CorrectTop = ((canvas.height / 2) - (img.height / 2));
                            cxt.drawImage(img, CorrectLeft, CorrectTop);
                        };
                        img.src = 'Resource/AnswerHook.png';

                    }
                })
            }

            break;

        //連連看
        case 'Hamastar.Project.MouseDragDropProcedureSliceFormatter':

            var Drag = false;

            //圖片連連看
            if (type == 'ImageLayer' && obj[num].isPictureDragObject == '1') {

                var Canvas = document.getElementById(obj[num].Identifier);

                //紀錄拖拉圖片
                Quiz.Objs.From = obj[num];

                //在新的canvas上建立新的事件畫連連看的線
                Canvas.addEventListener('mousedown', imgDragDown, false); //滑鼠點擊事件
                Canvas.addEventListener('touchstart', imgDragDown, false); //手指點擊事件

                if (Quiz.IsExam) {
                    $(Quiz.Choose).each(function () {

                        if (this.Type == 'Connector' && this.Page == MainObj.NowPage) {

                            if (this.fromID == Canvas.id) {
                                var that = this;
                                $(HamaList[MainObj.NowPage].Objects).each(function () {
                                    if (that.toID == this.Identifier) {
                                        var toObj = this;
                                        setTimeout(function () {
                                            Quiz.Objs.To = toObj;
                                            ImgDragSetting(Canvas);
                                            $('#' + toObj.Identifier).after(Canvas);
                                            Quiz.Objs.To = null;
                                        }, 300);

                                    }
                                })
                            }
                        }
                    })
                }


            } else if (type == 'CorrectBox' || type == 'ErrorBox') {

                //判斷是否圖片連連看
                //如果是，則不畫線
                for (var i = 0; i < obj.length; i++) {
                    if (obj[i].isPictureDragObject == '1' && obj[i].Identifier === canvasID) {
                        Drag = true;
                    }
                }

                if (Drag == false) {
                    var canvas = document.getElementById(canvasID);
                    canvas.addEventListener("mousedown", ConnectorDown, false); //滑鼠點擊事件
                    canvas.addEventListener('touchstart', ConnectorDown, false); //手指點擊事件

                    canvas.addEventListener("touchmove", function () { ConnectorMove(event, obj[num]) }, false); //手指移動事件
                    canvas.addEventListener("touchend", function () { ConnectorUp(false) }, false);     //手指放開事件
                }

                //測驗模式，翻頁回來連過的線要顯示
                if (Quiz.IsExam) {
                    $(Quiz.Choose).each(function () {

                        if (this.Type == 'Connector' && this.Page == MainObj.NowPage) {
                            if ($('#Connector' + this.ID)[0] == undefined) {

                                Quiz.Objs.From = findObj(this.fromID);
                                Quiz.Objs.To = findObj(this.toID);

                                if (Quiz.Objs.From.FormatterType == 'ImageLayer') return;

                                Quiz.Canvas = document.createElement('canvas');
                                Quiz.Cxt = Quiz.Canvas.getContext('2d');

                                $('body').append(Quiz.Canvas);

                                ConnectorSetting(this.ID);

                                if (this.Answer == 'Y') {
                                    Quiz.Page = MainObj.NowPage;
                                    var Answer = getAnswer();

                                    $(Answer).each(function () {
                                        if (this.To == Quiz.Objs.To.Identifier) {

                                            var that = this;
                                            $(HamaList[MainObj.NowPage].Objects).each(function () {

                                                if (that.Connector.Identifier == this.Identifier) {
                                                    this.ExamAnswer = 'Y';
                                                }
                                            })
                                        }
                                    })
                                }
                            }
                        }
                    })
                }

            }
            break;
    }
}

//通用回饋視窗
function showResponses(msgBox, isFinish) {
    var Msg = document.getElementById(msgBox);
    var MsgCxt = Msg.getContext('2d');

    var img = new Image();
    img.onload = function () {

        var scale = MainObj.Scale;
        var Width = img.width * scale;
        var Height = img.height * scale;
        var Left = MainObj.CanvasL + (MainObj.NewCanvasWidth - Width) / 2;
        var Top = MainObj.CanvasT + (MainObj.NewCanvasHeight - Height) / 2;

        Left = getNewLeft(Left);

        Msg.width = Width;
        Msg.height = Height;
        $('#' + msgBox).css({
            'position': 'absolute',
            'left': Left,
            'top': Top
        });

        MsgCxt.clearRect(0, 0, Width, Width);
        // MsgCxt.drawImage(img, 0, 0, Width, Height);

        MsgBySelf(MsgCxt, Width, Height, msgBox, img);

        if ($('#Div' + msgBox).attr('style') != "") {
            $('#Div' + msgBox).toggle();
        }
    };

    if (msgBox == 'ErrorMsg') {
        img.src = 'Resource/errorBackground.jpg';
        // Msg.addEventListener('mousedown', ErrorMsgToggle, false);
        $(Msg).click(function (e) {
            e.preventDefault();
            ErrorMsgToggle();
            $(this).off('click');
        })

    } else {
        img.src = 'Resource/correctBackground.jpg';
        // Msg.addEventListener('mousedown', CorrectMsgToggle, false);
        $(Msg).click(function (e) {
            e.preventDefault();
            CorrectMsgToggle(isFinish);
            $(this).off('click');
        })

    }
}

//ErrorMsg滑鼠事件，開關錯誤回饋視窗
function ErrorMsgToggle() {
    $('#DivErrorMsg').toggle();

    // 錯誤強制翻頁ErrorNextindex比對SliceIdentifier，預設為"00000000-0000-0000-0000-000000000000"
    for (var i = 0; i < HamaList.length; i++) {
        if (HamaList[MainObj.NowPage].ErrorNextindex == HamaList[i].SliceIdentifier) {
            gotoPage(i);
        }
    }
}

//CorrectMsg滑鼠事件，開關正確回饋視窗
function CorrectMsgToggle(isFinish) {
    $('#DivCorrectMsg').toggle();

    //點視窗一秒後跳頁
    if (HamaList[Quiz.Page].IsCorrectAllToFeedback != '0' || isFinish) {
        setTimeout(function () {
            goPageSet();
            connectorSuccess = false;
        }, 1000);
    }
}

//雙頁判斷測驗該翻幾頁
function goPageSet() {
    getPagePosition(Quiz.Page);
    if (MainObj.IsTwoPage) {

        if (HamaList[Quiz.Page].CustomNextIndex == '-1') {
            //判斷為最後一頁時不用跳頁
            if (Quiz.Page + 2 <= HamaList.length) {
                if (!MainObj.IsRight) {
                    if (Quiz.PagePosition == 'Left') {
                        gotoPage(Quiz.Page + 1);
                    } else {
                        gotoPage(Quiz.Page + 2);
                    }
                } else {
                    if (Quiz.PagePosition == 'Right') {
                        gotoPage(Quiz.Page + 1);
                    } else {
                        gotoPage(Quiz.Page + 2);
                    }
                }
            }
        } else {
            Quiz.isFinish = false;
        }

    } else {

        if (HamaList[Quiz.Page].CustomNextIndex == '-1') {
            //判斷為最後一頁時不用跳頁，重畫當頁的canvas
            if (Quiz.Page + 1 < HamaList.length) {
                gotoPage(Quiz.Page + 1);
            }
        } else {
            if(!isNaN(Number(HamaList[Quiz.Page].CustomNextIndex))) {
                gotoPage(HamaList[Quiz.Page].CustomNextIndex);
            }
            
        }
    }
}

//Msg的文字設定
function MsgBySelf(cxt, width, height, msgBox, img) {
    var Padding = 20; // 行距
    var Mode, MsgList, Msg;

    //正確視窗
    if (msgBox == 'ErrorMsg') {
        Mode = HamaList[Quiz.Page].ErrorMode;
        MsgList = HamaList[Quiz.Page].ErrorMessage;
        //錯誤預設文字
        Msg = ['此步驟操作錯誤，', '請重新操作。'];
        //錯誤視窗
    } else {
        Mode = HamaList[Quiz.Page].CorrectMode;
        MsgList = HamaList[Quiz.Page].CorrectMessage;
        //正確預設文字
        Msg = ['此步驟操作正確。'];
        Padding = 0;
    }

    //自訂文字
    if (Mode == 'ErrorMessageBySelf' || Mode == 'BySelf') {
        cxt.drawImage(img, 0, 0, width, height);
        drawMsgStr(cxt, $(MsgList).children(), width, height, Padding);

        //預設
    } else if (Mode == 'Default') {
        cxt.drawImage(img, 0, 0, width, height);
        drawMsgStr(cxt, Msg, width, height, Padding);
    } else if (Mode == 'FileLink') {
        drawMsgImg(msgBox);
    } else {
        cxt.drawImage(img, 0, 0, width, height);
    }
}

//Msg的文字畫上回饋視窗的canvas
function drawMsgStr(cxt, msgList, width, height, padding) {
    for (var i = 0; i < msgList.length; i++) {
        var Msg = msgList[i].innerText;
        if (Msg == undefined) { Msg = msgList[i]; }
        cxt.font = (20 * MainObj.Scale) + 'px Arial';
        cxt.fillStyle = "red";
        cxt.fillText(Msg, width / 2, height / 2 + padding * (i - 1));
    }
}

//Msg的圖片重新畫上回饋視窗的canvas
function drawMsgImg(msgBox) {
    var Msg = document.getElementById(msgBox);
    var MsgCxt = Msg.getContext('2d');
    var img = new Image();
    img.onload = function () {

        var scale = MainObj.Scale;
        var Width = img.width * scale;
        var Height = img.height * scale;

        //圖寬高有大於768的話重新取一個newScale出來，圖才不會過大
        if (Width > 768 || Height > 768) {
            var newScale = 768 / Math.max(Width, Height);
            Width = Width * newScale;
            Height = Height * newScale;
        }

        var Left = MainObj.CanvasL + (MainObj.NewCanvasWidth - Width) / 2;
        var Top = MainObj.CanvasT + (MainObj.NewCanvasHeight - Height) / 2;

        Left = getNewLeft(Left);

        Msg.width = Width;
        Msg.height = Height;
        $('#' + msgBox).css({
            'position': 'absolute',
            'left': Left,
            'top': Top
        });

        MsgCxt.clearRect(0, 0, Width, Height);
        MsgCxt.drawImage(img, 0, 0, Width, Height);
    };

    if (msgBox == 'ErrorMsg') {
        img.src = 'Resource/' + HamaList[Quiz.Page].ErrorLinkPath["Hamastar.Project.Filelink"].Path;
    } else {
        img.src = 'Resource/' + HamaList[Quiz.Page].CorrectLinkPath["Hamastar.Project.Filelink"].Path;
    }
}

//新建一個canvas來畫提示答案(ErrorCanvas)
function ErrorCanvas() {
    var Canvas = document.createElement('canvas');
    Canvas.id = 'ErrorCanvas';
    Canvas.width = $(window).width();
    Canvas.height = $(window).height();
    $('#HamastarWrapper').append(Canvas);
    $('#ErrorCanvas').attr('class', 'ErrorCanvas');
    $('#ErrorCanvas').css({
        'position': 'absolute',
        'pointer-events': 'none',
        'z-index': 99
    });
}

//雙頁模式，判斷現在滑鼠點到的位置是哪一個Canvas，然後判斷現在是第幾頁(Quiz.Page)
function getPage() {
    if (MainObj.IsTwoPage) {
        var Width = $('#CanvasGallery')[0].width / 2;
        if (!MainObj.IsRight) {
            if (Quiz.Down.X > Width) {
                Quiz.Page = MainObj.LeftPage;
                return 'Left';
            } else {
                Quiz.Page = MainObj.RightPage;
                return 'Right';
            }
        } else {
            if (Quiz.Down.X > Width) {
                Quiz.Page = MainObj.RightPage;
                return 'Right';
            } else {
                Quiz.Page = MainObj.LeftPage;
                return 'Left';
            }
        }
    } else {
        Quiz.Page = MainObj.NowPage;
        return 'Left';
    }

}

//雙頁模式，取得現在測驗的位置是在左頁還是右頁，並將canvasL再次設定好，以免錯亂
function getPagePosition(page) {
    if (MainObj.IsTwoPage) {
        if (!MainObj.IsRight) {
            if (page == MainObj.LeftPage) {
                Quiz.PagePosition = 'Right';
                MainObj.CanvasL = $('#CanvasLeft')[0].offsetLeft;
            } else {
                Quiz.PagePosition = 'Left';
                MainObj.CanvasL = $('#CanvasRight')[0].offsetLeft;
            }
        } else {
            if (page == MainObj.LeftPage) {
                Quiz.PagePosition = 'Left';
                MainObj.CanvasL = $('#CanvasLeft')[0].offsetLeft;
            } else {
                Quiz.PagePosition = 'Right';
                MainObj.CanvasL = $('#CanvasRight')[0].offsetLeft;
            }
        }
    }
}

//雙頁模式，判斷現在是左頁或右頁之後，取得新的Left
function getNewLeft(left) {
    var L = left;
    if (MainObj.IsTwoPage) {
        if (!MainObj.IsRight) {
            if (Quiz.PagePosition == 'Right') {
                L = left;
            } else {
                if (left == 0) {
                    L = left + MainObj.NewCanvasWidth;
                }
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

//重置已選的部分(通用)
function ResetSelect() {
    var obj;
    if (!MainObj.IsTwoPage) {
        obj = HamaList[MainObj.NowPage].Objects;
        for (var i = 0; i < obj.length; i++) {
            obj[i].Selected = false;
        }
    } else {
        if (MainObj.RightPage != -1 && MainObj.LeftPage < HamaList.length) {
            obj = [HamaList[MainObj.LeftPage].Objects, HamaList[MainObj.RightPage].Objects];
            for (var page = 0; page < obj.length; page++) {
                for (var num = 0; num < obj[page].length; num++) {
                    obj[page][num].Selected = false;
                }
            }
        } else if (MainObj.LeftPage < HamaList.length) {
            obj = HamaList[MainObj.LeftPage].Objects;
            for (var i = 0; i < obj.length; i++) {
                obj[i].Selected = false;
            }
        } else {
            obj = HamaList[MainObj.RightPage].Objects;
            for (var i = 0; i < obj.length; i++) {
                obj[i].Selected = false;
            }
        }
    }
}

function findObj(obj) {
    var list;
    $(HamaList[MainObj.NowPage].Objects).each(function () {
        if (this.Identifier == obj) {
            list = this;
        }
    })
    return list;
}

//聲音回饋
//answer = ture正確回饋，answer = false錯誤回饋
function ResponsesAudio(page, answer) {
    var audioSrc;

    if (answer) { //正確
        audioSrc = HamaList[page].CorrectMusicFileName;
    } else { //錯誤
        audioSrc = HamaList[page].ErrorMusicFileName;
    }

    if (audioSrc == '') return;

    $('#QuizVoice').remove();
    $('<audio/>', {
        id: 'QuizVoice',
        class: 'VoiceClass',
        src: 'Resource/' + audioSrc
    }).appendTo('#HamastarWrapper');

    $('#QuizVoice')[0].volume = 1;
    $('#QuizVoice')[0].play();

    $("#QuizVoice").on('ended', function () {
        // done playing
        $(this).remove();
        if (HamaList[page].PlayBackgroundMusic == '1') {
            BGMusicPlay();
        }
    });
}