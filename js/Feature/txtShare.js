//便利貼、手繪便利貼、註解公用函式

var txtMainobj = {
    Textobj: {
        W: 500,
        H: 320,
        Title: {
            H: 40
        },
        Text: {
            H: 280
        },
        Small: {
            H: 50,
            W: 50
        },
        TempH: 68
    },
    SmallIcon: {
        Note: 'TextIcon.png',
        Canvas: 'PasteIcon.png'
    },
    TitleName: {
        Note: '文字便利貼',
        Comment: '註解',
        Canvas: '手寫便利貼'
    },
    LayerIndex: 1000
}

//文字編輯器
function textEditor(textareaobj, textareaW, textareaH, savefunobj, textValue) {
    $(textareaobj).summernote({
        lang: 'zh-TW',
        placeholder: '請輸入內容',
        height: textareaH,
        focus: true,
        tabsize: 2,
        disableResizeEditor: true,
        disableDragAndDrop: true,
        toolbar: [
            ['style', ['bold', 'italic', 'underline']],
            ['forecolor', ['forecolor']],
            ['fontsize', ['fontsize']],
        ],
        fontSizes: ['12', '18', '24', '36', '48', '60', '72', '96'],
        hint: {
            mentions: [getTodayDate()],
            match: /\B@(\w*)$/,
            search: function (keyword, callback) {
                callback($.grep(this.mentions, function (item) {
                    return item.indexOf(keyword) == 0;
                }));
            },
            content: function (item) {
                return '@' + item;
            }
        }
    }).on('summernote.keyup', function (e, val) {
        savefunobj();
    });

    $(textareaobj).summernote("code", textValue);
}

//更改文字編輯器狀態
function changeTextEditor(id, state, textareaW, textareaH) {
    switch (state) {
        case "resize":
            $('#' + id + ' div.note-editable').css('height', textareaH);
            break;
        case "focus":
            $('#' + id).summernote('focus');
            break;
        case "disable":
            $('#' + id).summernote('disable');
            break;
        case "enable":
            $('#' + id).summernote('enable');
            break;
        default:
            break;
    }
}

//取得今天日期
function getTodayDate() {
    var fullDate = new Date();
    var yyyy = fullDate.getFullYear();
    var MM = (fullDate.getMonth() + 1) >= 10 ? (fullDate.getMonth() + 1) : ("0" + (fullDate.getMonth() + 1));
    var dd = fullDate.getDate() < 10 ? ("0" + fullDate.getDate()) : fullDate.getDate();
    var today = yyyy + "年" + MM + "月" + dd + "日";
    return today;
}

//背景顏色按鈕設置
function txtBackgroundBtn(div, id, colorobj) {
    var colorImg = new Image();
    colorImg.id = 'colorImg';
    colorImg.src = 'css/Images/Palette.png';
    colorImg.style.cursor = "pointer";
    colorImg.height = 40;
    colorImg.width = 40;
    $(div).append(colorImg);

    $(colorImg)
        .addClass("mr-sm-2")
        .click(function (e) {
            var color = rgbToHex($(colorobj)[0].style.backgroundColor).toUpperCase();
            e.preventDefault();
            ChangebgColor(color);
            $('.bgColorPicker-layout').attr('objid', id);
            $('.bgColorPicker-layout').toggle();
        });
}

//設定背景顏色
function SetbgColor() {
    var color = rgbToHex($("#bgColorSample")[0].style.borderColor).toUpperCase();
    var id = $('.bgColorPicker-layout').attr('objid');
    $('#noteTitle' + id).css('background-color', color);
    $('#Div' + id).css({
        'border': '5px solid ' + color,
        'background-color': color
    });

    $('.bgColorPicker-layout').toggle();
    $('.bgColorPicker-layout').removeAttr('objid')

    SaveNote();
}

//更換背景調色盤顏色
function ChangebgColor(color) {
    //$("#bgTextColor").val(color.toUpperCase());

    $("#bgColorSample").css({
        'border': '10px solid ' + color.toUpperCase(),
    });
}

//更換背景調色盤顏色按鈕
function ChangebgColorBtn(obj) {
    var tempPenColor = $(obj)[0].style.backgroundColor;
    //$("#bgTextColor").val(rgbToHex(tempPenColor).toUpperCase());

    $("#bgColorSample").css({
        'border': '10px solid ' + rgbToHex(tempPenColor).toUpperCase(),
    });
}

//關閉背景調色盤
function bgColorPickerClose() {
    $('.bgColorPicker-layout').hide();
}

//編輯按鈕設置
function setEditBtn(div, id, objid) {
    var editImg = new Image();
    editImg.id = 'editImg' + id;
    editImg.src = 'css/Images/Pen.png';
    editImg.style.cursor = "pointer";
    editImg.height = 40;
    editImg.width = 40;
    $(div).append(editImg);

    $(editImg)
        .addClass("mr-sm-2")
        .click(function (e) {
            e.preventDefault();
            changeTextEditor(objid, "enable");
            changeTextEditor(objid, "focus");
        })
}

//關閉按鈕設置
function txtCloseBtn(div, id) {
    var closeImg = new Image();
    closeImg.id = 'closeImg' + id;
    closeImg.src = 'css/Images/Close.png';
    closeImg.style.cursor = "pointer";
    closeImg.height = 40;
    closeImg.width = 40;
    $(div).append(closeImg);

    $(closeImg)
        .addClass("my-sm-0")
        .click(function (e) {
            e.preventDefault();
            confirmShow('是否確定刪除物件?', "Delobj", false, function (res) {
                if (res) {
                    $('#' + id).remove();

                    for (var note = 0; note < txtNote.SaveList.length; note++) {
                        if (txtNote.SaveList[note] != undefined) {
                            if (txtNote.SaveList[note].id == id) {
                                txtNote.SaveList.splice(note, 1);
                            }
                        }
                    }

                    for (var comment = 0; comment < txtComment.saveList.length; comment++) {
                        if (txtComment.saveList[comment] != undefined) {
                            if (txtComment.saveList[comment].id == id) {
                                txtComment.saveList.splice(comment, 1);
                            }
                        }
                    }

                    for (var can = 0; can < txtCanvas.SaveList.length; can++) {
                        if (txtCanvas.SaveList[can] != undefined) {
                            if (txtCanvas.SaveList[can].id == id) {
                                txtCanvas.SaveList.splice(can, 1);
                                for (var canList = 0; canList < txtCanvas.canvasList.length; canList++) {
                                    if (txtCanvas.canvasList[canList]) {
                                        if (txtCanvas.canvasList[canList][0].id == 'txtCanvasArea' + id) {
                                            txtCanvas.canvasList.splice(canList, 1);
                                        }
                                    }
                                }
                            }
                        }
                    }

                    SaveNote();
                    SaveCanvas();
                    saveComment();
                }
            })
        });
}

//縮小按鈕設置
function txtNarrowBtn(div, id) {
    var narrowImg = new Image();
    narrowImg.id = "narrowImg" + id;
    narrowImg.src = 'css/Images/Narrow.png';
    narrowImg.style.cursor = "pointer";
    narrowImg.height = 40;
    narrowImg.width = 40;
    $(div).append(narrowImg);

    txtNarrowSetting(narrowImg, id);
}

//便利貼小圖設置
function txtNarrowSmall(div, id, ImgSrc) {
    //note小圖
    $('#narrowDiv' + id).remove();
    var narrowDiv = document.createElement('div');
    narrowDiv.id = 'narrowDiv' + id;
    $(div).append(narrowDiv);
    $(narrowDiv)
        .attr({
            'class': 'narrowDiv'
        }).css({
            'position': 'absolute',
            'width': txtMainobj.Textobj.Small.W * MainObj.Scale * ToolBarList.ZoomScale,
            'height': txtMainobj.Textobj.Small.H * MainObj.Scale * ToolBarList.ZoomScale,
            'z-index': 99,
            'cursor': 'pointer',
            'display': 'none'
        }).draggable({
            containment: "#HamastarWrapper",
            stop: function (event, ui) {
                var left = ui.offset.left;
                var top = ui.offset.top;
                var width = txtMainobj.Textobj.Small.W;
                var height = txtMainobj.Textobj.Small.H;

                var canvasW = $('#CanvasGallery')[0].width + MainObj.CanvasL;
                var canvasH = $('#CanvasGallery')[0].height + MainObj.CanvasT;

                if (left < MainObj.CanvasL) {
                    $(narrowDiv).css('left', MainObj.CanvasL);
                } else if (left + width > canvasW) {
                    $(narrowDiv).css('left', canvasW - width);
                } else if (top < MainObj.CanvasT) {
                    $(narrowDiv).css('top', MainObj.CanvasT);
                } else if (top + height > canvasH) {
                    $(narrowDiv).css('top', canvasH - height);
                }

                $('#Div' + id).css({
                    'left': $(narrowDiv)[0].offsetLeft,
                    'top': $(narrowDiv)[0].offsetTop
                })

                SaveNote();
            }
        });

    var smallImg = new Image();
    smallImg.src = 'css/Images/' + ImgSrc;
    smallImg.width = txtMainobj.Textobj.Small.W * MainObj.Scale * ToolBarList.ZoomScale;
    smallImg.height = txtMainobj.Textobj.Small.H * MainObj.Scale * ToolBarList.ZoomScale;
    $(narrowDiv).append(smallImg);

    txtNarrowSetting(narrowDiv, id);
}

//縮小點擊事件
function txtNarrowSetting(btn, id) {
    $(btn)
        .addClass("mr-sm-2")
        .click(function (e) {
            e.preventDefault();

            if($('#Div' + id).length > 0) {
                if ($('#narrowDiv' + id).css('display') == 'none') {
                    objBoundary($('#narrowDiv' + id), $('#Div' + id), false);
    
                    $($('#narrowDiv' + id)[0]).children().attr({
                        'tempWidth': 50 * MainObj.Scale,
                        'tempHeight': 50 * MainObj.Scale,
                        'left': ($('#narrowDiv' + id)[0].offsetLeft - ZoomList.Left) / ToolBarList.ZoomScale + MainObj.CanvasL,
                        'top': ($('#narrowDiv' + id)[0].offsetTop - ZoomList.Top) / ToolBarList.ZoomScale + MainObj.CanvasT
                    });
    
                    $('#Div' + id).css('display', 'none');
                } else {
                    objBoundary($('#narrowDiv' + id), $('#Div' + id), true);
    
                    $('#narrowDiv' + id).css('display', 'none');

                    noteToLast(id);
                    CanvasToLast(id);
                }

                SaveNote();
                SaveCanvas();
            } else {
                $('#commentDiv' + id).hide();
                $('#pen' + id).attr('iswindow', false);

                saveComment();
            }
        });
}

//由於文字便利貼及便利貼不能拖移超過書，因此要取得邊界位置
//若拖移超過邊界，則移動至最邊邊
function FindBoundary(obj, div) {
    var left = obj.offset.left;
    var top = obj.offset.top;
    var width = Number($(div).css('width').split('px')[0]);
    var height = Number($(div).css('height').split('px')[0]);

    var canvasW = $('#CanvasGallery')[0].width + MainObj.CanvasL;
    var canvasH = $('#CanvasGallery')[0].height + MainObj.CanvasT;

    if (left < MainObj.CanvasL) {
        $(div).css('left', MainObj.CanvasL);
    } else if (left + width > canvasW) {
        $(div).css('left', canvasW - width);
    } else if (top < MainObj.CanvasT) {
        $(div).css('top', MainObj.CanvasT);
    } else if (top + height > canvasH) {
        $(div).css('top', canvasH - height);
    }
}

function CreateBoundary(Left, Top, Width, Height) {
    var Temp = {
        Left: Left,
        Top: Top
    }
    var windowW = $(window).width();
    var windowH = $(window).height();

    if (Left + Width > windowW) {
        Temp.Left = Left - ((Left + Width) - windowW);
    }

    if (Top + Height > windowH) {
        Temp.Top = Top - ((Top + Height) - windowH)
    }

    return Temp;
}

//便利貼不超出螢幕界線
function objBoundary(nardiv, objdiv, State) {
    var narleft = Number(nardiv.css('left').split('px')[0]);
    var nartop = Number(nardiv.css('top').split('px')[0]);
    var narwidth = nardiv.outerWidth();
    var narheight = nardiv.outerHeight();
    var objleft = Number(objdiv.css('left').split('px')[0]);
    var objtop = Number(objdiv.css('top').split('px')[0]);
    var objwidth = objdiv.outerWidth();
    var objheight = objdiv.outerHeight();

    var windowW = $(window).width();
    var windowH = $(window).height();

    if (State) {
        var temp = {
            Left: narleft,
            Top: nartop,
            LoctionL: false,
            LoctionT: false
        }

        if (narleft + objwidth > windowW) {
            temp.Left = narleft + narwidth - objwidth;
            temp.LoctionL = true;
        }

        if (nartop + objheight > windowH) {
            temp.Top = nartop + narheight - objheight;
            temp.LoctionT = true;
        }

        objdiv.css({
            'display': 'flex',
            'left': temp.Left,
            'top': temp.Top,
        }).attr({
            'LoctionL': temp.LoctionL,
            'LoctionT': temp.LoctionT
        });
    } else {
        var nartemp = {
            Left: objleft,
            Top: objtop,
        }

        if (objdiv.attr('LoctionL') == "true") {
            nartemp.Left = objleft + objwidth - narwidth
        }

        if (objdiv.attr('LoctionT') == "true") {
            nartemp.Top = objtop + objheight - narheight
        }

        nardiv.css({
            'display': 'block',
            'left': nartemp.Left,
            'top': nartemp.Top,
        });
    }
}

//註記不超出螢幕界線
function objComBoundary(div, State, CanvasL, CanvasT, CommentW, CommentH) {
    var left = Number($(div).css('left').split('px')[0]);
    var top = Number($(div).css('top').split('px')[0]);
    var width = $(div).outerWidth();
    var height = $(div).outerHeight();

    var windowW = $(window).width();
    var windowH = $(window).height();

    if (State) {
        if (top + height > windowH) {
            $(div).css('top', (CanvasT - CommentH) - height);
        }
    } else {
        if (left < 0) {
            $(div).css('left', (CanvasL + CommentW) - width);
            $(div).css('top', CanvasT - CommentH);
        } else {
            $(div).css('left', CanvasL - CommentW);
            $(div).css('top', CanvasT - CommentH);
        }
    }
}

function FindStickyViewVisibility(id) {
    if ($('#narrowDiv' + id).css('display') == 'none' || $('#narrowDiv' + id).css('display') == undefined) {
        return 'true';
    } else {
        return 'false';
    }
}

function setDraggableAttr(obj) {
    var left = Number($(obj).css('left').split('px')[0]);
    var top = Number($(obj).css('top').split('px')[0]);
    $(obj).attr({
        'left': left,
        'top': top,
    });
}

function setResizableAttr(obj) {
    var width = Number($(obj).css('width').split('px')[0]);
    var height = Number($(obj).css('height').split('px')[0]);
    $(obj).attr({
        'tempwidth': width,
        'tempheight': height,
    });
}