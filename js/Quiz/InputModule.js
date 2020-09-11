//填充題
function InputSetting(event, input, page) {
    if (!input.value) return;
    Quiz.Page = page;
    getPagePosition(page);
    var obj = HamaList[Quiz.Page].Objects;
    var InputBoxNum = 0;
    //計算輸入框總數
    for (var Num = 0; Num < obj.length; Num++) {
        if (obj[Num].FormatterType == 'CorrectBox') {
            InputBoxNum++;
        }
    }
    var InputValue = input.value;
    var inputAns = false;
    for (var i = 0; i < obj.length; i++) {
        if (('Input' + obj[i].Identifier) == input.id) {
            var Answer = obj[i].Answer.split(';');
            for (var ans = 0; ans < Answer.length; ans++) {
                //IsCaseSensitive為'1'是大小寫要相符
                if (obj[i].IsCaseSensitive == '1') {
                    if (input.value == Answer[ans]) {
                        inputAns = true;
                        break;
                    }
                } else {
                    if ((input.value).toLowerCase() == (Answer[ans]).toLowerCase()) {
                        inputAns = true;
                        break;
                    }
                }
            }
            if (!Quiz.IsExam) {
                if (event.keyCode != 13) return;

                if (Exam.QuizAction) {
                    //紀錄每次點擊
                    Exam.Choose++;
                }

                if (inputAns == true) {

                    if (Exam.QuizAction) {
                        var sameObj = false;
                        $(Quiz.Choose).each(function () {
                            if (obj[i].Identifier == this.ID) {
                                sameObj = true;
                                return;
                            }
                        })

                        obj[i].ExamAnswer = true;

                        if (!sameObj) {
                            //紀錄正確時的資訊
                            Quiz.Choose.push({
                                Type: 'Input',
                                ID: input.id,
                                Page: MainObj.NowPage,
                                Answer: true,
                                Value: input.value,
                                RecordTime: getRecordTime()
                            })
                        }
                    }

                    Quiz.ErrorNum = 0;
                    //輸入正確時將輸入框disabled
                    $('#' + input.id).attr('disabled', 'disabled');
                    Quiz.InputNow++;
                    if (Quiz.InputNow == InputBoxNum) {
                        Quiz.isFinish = true;
                        if (HamaList[Quiz.Page].CorrectMode == 'NoMsg') {
                            setTimeout(function () {
                                $('.Input').remove();
                                Quiz.InputNow = 0;
                                goPageSet();
                            }, 1000);
                        } else {
                            showResponses('CorrectMsg', true);
                        }

                        ResponsesAudio(page, true);
                    } else if (HamaList[MainObj.NowPage].IsCorrectAllToFeedback == '0') {
                        showResponses('CorrectMsg');
                        ResponsesAudio(MainObj.NowPage, true);
                    }
                } else {
                    InputError(input);
                    showResponses('ErrorMsg');
                    ResponsesAudio(page, false);
                }
            } else {

                //Quiz.Choose如果有重複的，刪掉舊的資料
                for (var x = 0; x < Quiz.Choose.length; x++) {
                    if (Quiz.Choose[x] != undefined) {
                        if (Quiz.Choose[x].ID == input.id) {
                            delete Quiz.Choose[x];
                        }
                    }
                }

                $(obj).each(function () {
                    if (this.ExamType == 'Input' && this.Identifier == input.id.split('Input')[1]) {
                        this.ExamAnswer = inputAns;
                        this.ExamValue = input.value;
                    }
                })

                var list = {
                    Type: 'Input',
                    ID: input.id,
                    Page: MainObj.NowPage,
                    Answer: inputAns,
                    Value: input.value,
                    RecordTime: getRecordTime()
                }

                Quiz.Choose.push(list);

            }
        }
    }
}

//填充題輸入框
function NewInput(obj, scale, page) {
    if ($('#Input' + obj.Identifier)[0] == undefined) {
        var Input = document.createElement('input');
        var Width = obj.Width * scale;
        var Height = obj.Height * scale;
        var Left = obj.Left * scale + MainObj.CanvasL;
        var Top = obj.Top * scale + MainObj.CanvasT;
        var id = 'Input' + obj.Identifier;
        Input.id = id;
        Input.type = 'text';
        $('#HamastarWrapper').append(Input);

        $('#' + id).attr({
            'class': 'Input canvasObj',
            'tabindex': -1
        }).css({
            'position': 'absolute',
            'left': Left,
            'top': Top,
            'font-size': Height * 3 / 4 + 'px',
            'padding': 0,
            'line-height': 0
        })
        var previousStyle = $('#' + id).attr('style');
        $('#' + id).attr('style', 'width:' + (Width - 4) + 'px !important;' + 'height:' + (Height - 6) + 'px !important;' + previousStyle + '');

        //輸入框鍵盤點擊事件
        $('#' + id).on('keypress, keyup', function (event) {
            if (event.keyCode == 13) {
                InputSetting(event, this, page);
                $(this)
                    .blur()
                    .css({
                        'background-color': '#CCCCCC'
                    })
                ;
            }
        }).on('mousedown', function (event) {
            $(this)
                .focus()
                .css({
                    'background-color': '#FFFFFF'
                });
        })

        //測驗模式時，翻頁回來點過的答案要顯示
        if (Quiz.IsExam) {
            $(Quiz.Choose).each(function () {

                if (this.Type == 'Input' && this.ID == id) {
                    $('#' + this.ID)[0].value = this.Value;
                }

            })
        }
    }
}

//填充題錯誤次數等於錯誤率(ErrorCount)時，提示答案
function InputError(input) {
    Quiz.ErrorNum++;
    var ErrorCount = Number(HamaList[Quiz.Page].ErrorCount);
    var obj = HamaList[Quiz.Page].Objects;
    if (Quiz.ErrorNum >= ErrorCount) {
        for (var i = 0; i < obj.length; i++) {
            if (('Input' + obj[i].Identifier) == input.id) {
                input.value = obj[i].Answer;
            }
        }
        Quiz.ErrorNum = 0;
    }
}

