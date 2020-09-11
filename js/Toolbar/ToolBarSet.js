//工具列
var ToolBarList = {
    AddWidgetState: 'none', //新增物件的狀態
    BeforeState: 'none',
    TapList: [],
    ZoomScale: 1,
    ZoomNumber: [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5],
    ChapterList: [], //頁面的資訊及閱讀狀態
    IsChapter: false, //是否正在章節模式
    IsAssistToolBar: false,
    timer: null,
    isCountdown: false,
    isStop: false,
    selectorNumberList: [],
    selectorGroupList: [],
    isDrag: false,
    canvasboardDrag: false,
    canvasboardTemp: null,
    Down: {
        X: 0,
        Y: 0
    }, //滑鼠點擊的座標
    Move: {
        X: 0,
        Y: 0
    }, //滑鼠移動的座標
    CustomizeMain: {
        defaultAssist: false,
        AssistToolBar: {
            R: false,
            A: false
        }
    }
};

var fileObj = {
    saveList: []
};

var classProgressList = [],
    isNoPatch = false;

//工具列顯示
function ToolBarShow() {
    if (!ToolBarList.IsChapter) {
        if (!JSON.parse($('#ToolBarIcon').attr('show'))) {
            $('#ToolBarIcon').css('left', '10em');
            $('#ToolBarMenu').css('left', '0em');
            $('#ToolBarIcon').attr('show', true);

            if (ToolBarList.CustomizeMain.defaultAssist) {
                if (ToolBarList.CustomizeMain.AssistToolBar.R) {
                    $('#AssistToolBarIcon').css('right', '0em');
                    $('#AssistToolBarMenu').css('right', '-10em');
                    $('#AssistToolBarIcon').attr('show', false);
                }
            }
        } else {
            $('#ToolBarIcon').css('left', '0em');
            $('#ToolBarMenu').css('left', '-10em');
            $('#ToolBarIcon').attr('show', false);
        }
    } else {
        if (!JSON.parse($('#ToolBarIcon').attr('show'))) {
            $('#ToolBarIcon').css('right', '10em');
            $('#ToolBarMenu').css('right', '0em');
            $('#ToolBarIcon').attr('show', true);
        } else {
            $('#ToolBarIcon').css('right', '0em');
            $('#ToolBarMenu').css('right', '-10em');
            $('#ToolBarIcon').attr('show', false);
        }
    }
}

function AssistToolBarShow() {
    if (!JSON.parse($('#AssistToolBarIcon').attr('show'))) {
        $('#AssistToolBarIcon').css('right', '10em');
        $('#AssistToolBarMenu').css('right', '0em');
        $('#AssistToolBarIcon').attr('show', true);

        $('#ToolBarIcon').css('left', '0em');
        $('#ToolBarMenu').css('left', '-10em');
        $('#ToolBarIcon').attr('show', false);
    } else {
        $('#AssistToolBarIcon').css('right', '0em');
        $('#AssistToolBarMenu').css('right', '-10em');
        $('#AssistToolBarIcon').attr('show', false);
    }
}

//判斷書在站台或本機開啟
function getFaceModuleList(mainItem, assistItem) {

    if (mainItem != undefined) {
        var ToolBarItem = mainItem;
    } else {
        var ToolBarItem = mainToolBarItem;
    }

    if (assistItem != undefined) {
        var AssistToolBarItem = assistItem;
    } else {
        var AssistToolBarItem = assistToolBarItem;
    }

    if (ToolBarItem.length > 0) {
        ToolBarSetting(ToolBarItem, "#ToolBarUl");
    }

    if (AssistToolBarItem.length > 0) {
        if (ToolBarList.CustomizeMain.defaultAssist) {
            if (ToolBarList.CustomizeMain.AssistToolBar.R) {
                $('#AssistToolBarIcon').toggleClass('AssistToolBarIcon ToolBarIcon_right ToolBarAnimation');
                $('#AssistToolBarMenu').toggleClass('ToolBarMenu_right AssistToolBarMenu').delay(1000).queue(function () {
                    $(this).addClass('ToolBarAnimation');
                });

                ToolBarSetting(AssistToolBarItem, "#AssistToolBarUl");
            } else if (ToolBarList.CustomizeMain.AssistToolBar.A) {
                AssistToolBarSetting(AssistToolBarItem);
            }
        }
    }

    if (ToolBarItem.length > 0 || AssistToolBarItem.length > 0) {
        tooBarSet();
    }
}

//工具列列表
function ToolBarSetting(custom, uiobj) {

    $(custom).each(function () {
        for (var i = 0; i < tempToolBars[0].btns.length; i++) {
            if (this.id == tempToolBars[0].btns[i].id && this.Enable == true) {

                if (!ReceiveList) {
                    // 本機不用'回書櫃'
                    if (this.id == 'back' || this.id == 'saveas' || this.id == 'open' ||
                        this.id == 'uploadEdit' || this.id == 'downloadEdit') {
                        return;
                    }
                } else {
                    // APP不用'全螢幕'
                    if (this.id == 'fullscreen') {
                        return;
                    }
                }

                var that = tempToolBars[0].btns[i];
                var NewLi = document.createElement('li');
                var NewDiv = document.createElement('div');
                var NewImg = document.createElement('img');
                var NewLabel = document.createElement('label');
                NewImg.id = that.id;
                NewImg.src = that.beforeStyle['background-image'];

                $(NewDiv).click(function (e) {
                    e.preventDefault();
                    that.action();
                });

                $(NewLabel)
                    .text(this.btnText)
                    .attr('data-lang', this.id);
                $(NewDiv).append(NewImg);
                $(NewDiv).append(NewLabel);
                $(NewDiv).addClass('form-inline');
                $(NewLi).append(NewDiv);
                $(uiobj).append(NewLi);

                if (that.id == 'zoomOut') {
                    $(NewImg).attr('src', that.afterStyle['background-image']);
                    that.afterClick = true;
                }
            }
        }
    })

    var toolHeigth = $('#ToolBarIcon').css('height', $(window).height() - 5 + 'px');
    $('#ToolBarSidesImg').draggable({
        containment: '#ToolBarIcon',
        drag: function () {

            var windowHeight = $(window).height();
            var draggableTop = $(this).css('top');
            var toolBarUlHeight = $('#ToolBarMenu > ul').height();

            $('#ToolBarMenu').scrollTop((parseInt(draggableTop) / windowHeight) * toolBarUlHeight);
        }
    });

    //將畫筆及橡皮擦綁在body上，才不會侷限到點擊的地方
    $('body').on('mousedown', function (e) {
        penEventSet(e);
    });
    $('body').on('touchstart', function (e) {
        penEventSet(e);
    });
}

function AssistToolBarSetting(assist) {
    $(assist).each(function () {
        for (var i = 0; i < tempToolBars[0].btns.length; i++) {
            if (this.id == tempToolBars[0].btns[i].id && this.Enable == true) {

                var that = tempToolBars[0].btns[i];
                var NewLi = document.createElement('li');
                var NewImg = document.createElement('img');

                NewImg.id = that.id;
                NewImg.src = that.beforeStyle['background-image'];
                NewImg.height = 45;

                $(NewImg).attr({
                    "title": this.btnText,
                    "data-lang": this.id
                });
                $(NewImg).click(function (e) {
                    e.preventDefault();
                    that.action();
                });
                if (this.Group != undefined) {
                    $(NewImg).addClass(this.Group);
                    if ($('#' + this.Group).length) {
                        $('#' + this.Group).append(NewImg);
                    } else {
                        var bardiv = document.createElement('div');
                        bardiv.id = this.Group;
                        $(bardiv).append(NewImg);
                        $(NewLi).append(bardiv);
                        $('#AssistToolBarUl').append(NewLi);

                        if (this.BarChange) {
                            $(bardiv).addClass("Bargridafter");
                        }
                    }
                } else {
                    $(NewImg).addClass("BarMenuImg");
                    $(NewLi).append(NewImg);
                    $('#AssistToolBarUl').append(NewLi);
                }

                if (this.id == 'recovery' || this.id == 'notrecovery') {
                    recovery(tempToolBars[0].btns[i]);
                }
            }
        }
    });
}

function tooBarSet() {
    var slider = $('#chance_slider'),
        slider2 = $('#chance_sliderop');

    $('.colorStateBar > div').css({
        'height': parseInt($(slider).val()),
        'opacity': parseInt($(slider2).val()) / 10,
        'background-color': colorPen.Color
    });
    $("#TextColor").val(rgbToHex(colorPen.Color).toUpperCase())

    if($('#picker').length) {
        //引用調色盤套件
        $('#picker').farbtastic(changecolorlw);
    }

    if($('#bgpicker').length) {
        //物件背景調色盤
        $('#bgpicker').farbtastic(ChangebgColor);
    }
    
    //畫筆粗細
    slider.change(function () {
        var newValue = parseInt($(this).val());
        $('.colorStateBar > div').css({
            'height': newValue
        });
    });

    //畫筆透明度
    slider2.change(function () {
        var newValue = parseInt($(this).val());
        $('.colorStateBar > div').css({
            'opacity': newValue / 10
        });
    });

    setcolorPicker();
    setsearchText();

    setTextboard();
    setCavnasboard();

    $('.selector_block').draggable();
}

function recovery(btn) {

    if (btn == undefined) {
        for (var i = 0; i < tempToolBars[0].btns.length; i++) {
            if (tempToolBars[0].btns[i].id == 'recovery' || tempToolBars[0].btns[i].id == 'notrecovery') {
                recovery(tempToolBars[0].btns[i]);
            }
        }
    } else {
        var span;
        if ($('.' + btn.id)[0] == undefined) {
            span = '#' + btn.id; //工具列
        }

        if (MainObj.saveList.length && btn.id == 'recovery') {
            $(span).attr('src', btn.beforeStyle['background-image']);
        } else if (MainObj.trashList.length && btn.id == 'notrecovery') {
            $(span).attr('src', btn.beforeStyle['background-image']);
        } else {
            $(span).attr('src', btn.disableStyle['background-image']);
        }
    }
}

function penEventSet(event) {
    if ($(event.target).attr('class') != null) {
        var touchClass = $(event.target).attr('class').split(' ')[0];
        //由於是綁在body上，因此案工具列也會觸發
        //所以要判斷是點擊在翻頁canvas上或物件canvas上才觸發
        if (touchClass == 'canvas' || touchClass == 'canvasObj' || touchClass == 'whiteboard') {
            switch (ToolBarList.AddWidgetState) {

                case 'pen':
                    // StartPen();
                    break;
                case 'eraser':
                    // StartEraser();
                    break;
                case 'txtNote':
                    txtNoteLayer();
                    FindTool(ToolBarList.AddWidgetState);
                    break;
                case 'txtCanvas':
                    txtCanvasLayer();
                    FindTool(ToolBarList.AddWidgetState);
                    break;
            }
        }
    }
}

//取得btn並回到點擊前狀態
function FindTool(toolID) {
    var obj;

    $(tempToolBars[0].btns).each(function () {
        if (this.type == toolID) obj = this;
    })

    obj.afterClick = !obj.afterClick;
    checkBtnChange(obj);

    ToolBarList.AddWidgetState = 'none';
}

//點擊後改變按鈕圖示
function checkBtnChange(btn) {
    var span;
    if ($('.' + btn.id)[0] == undefined) {
        span = '#' + btn.id; //工具列
    }

    if (btn.id == 'recovery' || btn.id == 'notrecovery') {
        recovery(btn);
        return;
    }

    //  暫時處理，因ID衝突需後續處理．
    if (btn.afterClick) {
        $('#ToolBar ' + span).attr('src', ToolBarList.IsAssistToolBar ? (btn.afterBarStyle == undefined ? btn.afterStyle['background-image'] : btn.afterBarStyle['background-image']) : btn.afterStyle['background-image']);
        $('#AssistToolBar ' + span).attr('src', ToolBarList.IsAssistToolBar ? (btn.afterBarStyle == undefined ? btn.afterStyle['background-image'] : btn.afterBarStyle['background-image']) : btn.afterStyle['background-image']);
    } else {
        $('#ToolBar ' + span).attr('src', ToolBarList.IsAssistToolBar ? (btn.beforeBarStyle == undefined ? btn.beforeStyle['background-image'] : btn.beforeBarStyle['background-image']) : btn.beforeStyle['background-image']);
        $('#AssistToolBar ' + span).attr('src', ToolBarList.IsAssistToolBar ? (btn.beforeBarStyle == undefined ? btn.beforeStyle['background-image'] : btn.beforeBarStyle['background-image']) : btn.beforeStyle['background-image']);
    }
}

//工具列左右互換
function toolbarChange() {
    if (ToolBarList.IsChapter) { //右
        $('#ToolBarIcon').removeClass('ToolBarIcon').addClass('ToolBarIcon_right');
        $('#ToolBarMenu').removeClass('ToolBarMenu').addClass('ToolBarMenu_right');

        $('.ToolBarIcon_right').removeAttr('style');
        $('.ToolBarMenu_right').removeAttr('style');

        $('#ToolBarSidesImg')[0].src = "ToolBar/ToolBarLandscapeR.png";

    } else { //左
        $('#ToolBarIcon').removeClass('ToolBarIcon_right').addClass('ToolBarIcon');
        $('#ToolBarMenu').removeClass('ToolBarMenu_right').addClass('ToolBarMenu');

        $('.ToolBarIcon').removeAttr('style');
        $('.ToolBarMenu').removeAttr('style');

        $('#ToolBarSidesImg')[0].src = "ToolBar/ToolBarLandscapeL.png";
    }

    $('#ToolBarIcon').css('height', $(window).height() - 5 + 'px').attr('show', false);
}

function assistToolBarChange() {
    if (ToolBarList.IsAssistToolBar) { //下
        $('#AssistToolBarMenu').removeClass('AssistToolBarMenu').addClass('AssistToolBarMenu-Bottom');
        $('.AssistToolBarMenu').removeAttr('style');
        $('#btnzoombtmBar').addClass("Bargridbefore");
        $('#btnzoomtopBar').addClass("Bargridbefore");
        $('#btnzoombtmBar').removeClass("Bargridafter");
        $('#btnzoomtopBar').removeClass("Bargridafter");
        $('#btnzoombtm').hide();
        $('#btnzoomtop').hide();
        $('#toolBarChange').addClass('toolBarChange');
        $('img.pageIcon_r').css({
            'right': '10px'
        });
    } else {//右
        $('#AssistToolBarMenu').removeClass('AssistToolBarMenu-Bottom').addClass('AssistToolBarMenu');
        $('.AssistToolBarMenu-Bottom').removeAttr('style');
        $('#btnzoombtmBar').addClass("Bargridafter");
        $('#btnzoomtopBar').addClass("Bargridafter");
        $('#btnzoombtmBar').removeClass("Bargridbefore");
        $('#btnzoomtopBar').removeClass("Bargridbefore");
        $('#btnzoombtm').show();
        $('#btnzoomtop').show();
        $('#toolBarChange').removeClass('toolBarChange');
        $('img.pageIcon_r').css({
            'right': '60px'
        });
    }
}

//所有button變回false
function changeAllBtnToFalse(note) {
    GalleryStartMove();

    ToolBarList.AddWidgetState = 'none';
    $('#canvasPad').remove();
    $('#canvasEraser').remove();
    $('#canvasZoomArea').remove();
    clearAllTreasure();

    DragCanvas(false);

    $(tempToolBars[0].btns).each(function () {
        if (this.id == 'zoomIn' || this.id == 'zoomOut') {
            return;
        }
        if (!note) {
            this.afterClick = false;
            checkBtnChange(this);
            ToolBarList.AddWidgetState = 'none';
        } else {
            for (var i = 0; i < note.length; i++) {
                if (this.id == note[i].id) {
                    this.afterClick = false;
                    ToolBarList.AddWidgetState = 'none';
                    $('.' + this.id).attr('src', ToolBarList.IsAssistToolBar ? (this.beforeBarStyle == undefined ? this.beforeStyle['background-image'] : this.beforeBarStyle['background-image']) : this.beforeStyle['background-image']);
                }
            }
        }
    });
}

function DragCanvas(isClick) {
    if (ToolBarList.ZoomScale > 1) {
        if (isClick) {
            $('.dragCanvas').css({
                'display': 'block',
                'cursor': 'move'
            });
            ZoomList.Isdraggable = true;
        } else {
            $('.dragCanvas').css({
                'display': 'none',
                'cursor': 'default'
            });
            ZoomList.Isdraggable = false;
        }
    }
}

//調色盤改變上面顏色條
function changecolorlw(color) {
    $('.colorStateBar > div').css('background-color', color);
    $("#TextColor").val(color.toUpperCase());
}

//調色盤
function penchane(obj, COLOR) {
    var tempPenColor = $(obj)[0].style.backgroundColor;
    $("#TextColor").val(rgbToHex(tempPenColor).toUpperCase());

    penCmdStatus = 0;
    $(".colorStateBar").children("div").css("background-color", tempPenColor);
}

//調色盤 形狀
function changeSharp(type) {
    $('.sharp_btn').css({
        'background-color': '#ffffff'
    })
    $('#' + type).css({
        'background-color': '#ffff00'
    })
    colorPen.selectedType = type;
    colorPen.IsSelectType = true;
}

function Setcolor(obj) {
    if (obj.value.length > 1) {
        if (obj.value.length == 7) {
            $(".colorStateBar").children("div").css("background-color", obj.value);
        }
    } else {
        obj.value = "#";
    }
}

//調色盤：確定
function starDraw() {

    colorPen.Color = $('.colorStateBar >div')[0].style.backgroundColor;
    colorPen.Opacity = parseInt($('#chance_sliderop').val()) / 10;
    colorPen.Width = parseInt($('#chance_slider').val());

    if (colorPen.IsSelectType) {
        colorPen.BrushType = colorPen.selectedType;
        IsSelectType = false;
    }

    if (ToolBarList.BeforeState == 'Highlighter' || ToolBarList.BeforeState == 'PenLine' || ToolBarList.BeforeState == 'PenRect' || ToolBarList.BeforeState == 'PenCircle' || ToolBarList.BeforeState == 'colorPen') {
        var colorPenClick = checkPickerStatus(ToolBarList.BeforeState);
        if (colorPenClick.afterClick == false) {
            $('.colorPicker-layout').toggle();
            $('#' + colorPenClick.id)[0].click();
        }
    } else if (ToolBarList.AddWidgetState == 'ColorsPicker') {
        var colorPicker = checkPickerStatus(ToolBarList.AddWidgetState);
        if (colorPicker.afterClick == true) {
            $('#' + colorPicker.id)[0].click();
        }
    } else {
        $('.colorPicker-layout').toggle();
    }
}

//調色盤：取消
function closePicker() {

    var btn;

    $('#colorPicker').dialog('close');

    if (ToolBarList.AddWidgetState == 'ColorsPicker') {
        btn = tempToolBars[0].btns;
    }

    $(btn).each(function () {
        if (this.id == ToolBarList.AddWidgetState) {
            this.afterClick = !this.afterClick;
            checkBtnChange(this);
            ToolBarList.AddWidgetState = 'none';
        }
    })
}

//取得調色盤btn
function checkPickerStatus(objID) {
    var obj, btn;

    if (ToolBarList.AddWidgetState == 'ColorsPicker') {
        btn = tempToolBars[0].btns;
    }

    $(btn).each(function () {
        if (this.id == objID) {
            obj = this;
        }
    })
    return obj;
}

///RGB轉Hex
function rgbToHex(col) {
    if (col.charAt(0) == 'r') {
        col = col.replace('rgb(', '').replace(')', '').split(',');
        var r = parseInt(col[0], 10).toString(16);
        var g = parseInt(col[1], 10).toString(16);
        var b = parseInt(col[2], 10).toString(16);
        r = r.length == 1 ? '0' + r : r; g = g.length == 1 ? '0' + g : g; b = b.length == 1 ? '0' + b : b;
        var colHex = '#' + r + g + b;
        return colHex;
    }
}

//取得btn
function checkBtnStatus(objID) {
    var obj;
    $(tempToolBars[0].btns).each(function () {
        if (this.id == objID) {
            obj = this;
        }
    })
    return obj;
}

//頁籤
function tapLayer() {

    if ($('#tap')[0] == undefined) {

        NewCanvas();
        var canvasTap = $('#canvas')[0];
        canvasTap.id = 'tap';
        canvasTap.width = 94 * MainObj.Scale;
        canvasTap.height = 44 * MainObj.Scale;

        if (MainObj.IsTwoPage) {
            var left = $('#CanvasGallery')[0].width - (canvasTap.width / ToolBarList.ZoomScale);
        } else {
            var left = $('#CanvasGallery')[0].width - (canvasTap.width / ToolBarList.ZoomScale);
        }

        $(canvasTap).addClass('tap');
        $(canvasTap).css({
            'position': 'absolute',
            'left': left * ToolBarList.ZoomScale + (MainObj.NowPage == 0 ? $('#CanvasGallery').offset().left : MainObj.CanvasL),
            'top': 100 * ToolBarList.ZoomScale + MainObj.CanvasT
        })

        var cxtTap = canvasTap.getContext('2d');

        var imgTap = new Image();
        imgTap.onload = function () {
            cxtTap.drawImage(imgTap, 0, 0, canvasTap.width, canvasTap.height);
        }
        imgTap.src = 'css/Images/Tag.png';

        ToolBarList.TapList[MainObj.NowPage] = true;

    } else {
        $('#tap').remove();
        ToolBarList.TapList[MainObj.NowPage] = false;
    }
}

//全文檢索清單
function searchTextList() {
    if ($('.centent_Text>ul>li').length > 0) {
        $('.centent_Text>ul').empty()
    }

    var temp = '<li class=\"list-group-item list-group-item-action active\" style=\"width:486px\"><div class=\"row\"><div class="col-1" style="text-align: center;"><span>頁數</span></div><div class="col-9" style="text-align: center;"><span>內容</span></div></div></li>';
    var searchTextTop = '';
    var searchTextLeft = '';
    var alltext = [];
    var isRightpage = false;

    for (var i = 0; i < TextlocationList.length; i++) {
        if (TextlocationList[i].content.length > 0) {
            var searchans = [];
            for (var j = 0; j < TextlocationList[i].content.length; j++) {
                if (TextlocationList[i].content[j].keyword == $('#TextKeyword').val()[0]) {
                    var searchData = [TextlocationList[i].content[j].top, TextlocationList[i].content[j].left, TextlocationList[i].content[j].width, TextlocationList[i].content[j].height, (i + 1)];
                    searchans.push(searchData);
                }
            }

            if (searchans.length > 0) {
                for (let m = 0; m < searchans.length; m++) {
                    searchTextTop = '';
                    searchTextLeft = '';
                    for (var l = 0; l < TextlocationList[i].content.length; l++) {
                        if (Number(TextlocationList[i].content[l].top).toFixed(1) == Number(searchans[m][0]).toFixed(1)) {
                            if (TextlocationList[i].content[l].keyword === "") {
                                searchTextTop += " ";
                            } else {
                                searchTextTop += TextlocationList[i].content[l].keyword;
                            }
                        } else if (Number(TextlocationList[i].content[l].left).toFixed(1) == Number(searchans[m][1]).toFixed(1)) {
                            if (TextlocationList[i].content[l].keyword === "") {
                                searchTextLeft += " ";
                            } else {
                                searchTextLeft += TextlocationList[i].content[l].keyword;
                            }
                        } else {
                            if (searchTextTop.indexOf($('#TextKeyword').val()) < 0) {
                                searchTextTop = '';
                            }
                            if (searchTextLeft.indexOf($('#TextKeyword').val()) < 0) {
                                searchTextLeft = '';
                            }
                        }
                    }

                    if (searchTextTop.indexOf($('#TextKeyword').val()) >= 0) {
                        var searchDataTop = [searchans[m][0], searchans[m][1], searchans[m][2], searchans[m][3], searchans[m][4], searchTextTop.trim()];
                        alltext.push(searchDataTop);
                    }

                    if (searchTextLeft.indexOf($('#TextKeyword').val()) >= 0) {
                        var searchDataLeft = [searchans[m][0], searchans[m][1], searchans[m][2], searchans[m][3], searchans[m][4], searchTextLeft.trim()];
                        alltext.push(searchDataLeft);
                    }
                }
            }
        }
    }

    for (var y = 0; y < alltext.length; y++) {
        if (!MainObj.IsTwoPage) {
            temp += "<li class=\"list-group-item list-group-item-action\" style=\"width:488px\" onclick=\"searchTextLocation(" + (alltext[y][4] - 1) + ',' + alltext[y][0] + ',' + alltext[y][1] + ',' + alltext[y][2] + ',' + alltext[y][3] + ");\"><div class=\"row\"><div  class=\"col-1\" style=\"text-align: center;\"><span>" + alltext[y][4] + "</span></div><div class=\"col-9\"><span>" + alltext[y][5] + "</span></div></div></li>";
        } else {
            isRightpage = false;

            if ((alltext[y][4] - 1) % 2 == 0) {
                isRightpage = true;
            }
            temp += "<li class=\"list-group-item list-group-item-action\" style=\"width:488px\" onclick=\"searchTextLocation(" + (alltext[y][4] - 1) + ',' + alltext[y][0] + ',' + alltext[y][1] + ',' + alltext[y][2] + ',' + alltext[y][3] + ',' + isRightpage + ");\"><div class=\"row\"><div  class=\"col-1\" style=\"text-align: center;\"><span>" + alltext[y][4] + "</span></div><div class=\"col-9\"><span>" + alltext[y][5] + "</span></div></div></li>";
        }
    }

    $("#searchText-ul").append(temp);

    if ($('#searchText-ul>li').length < 2) {
        temp = "<li  class=\"list-group-item list-group-item-action\" style=\"width:488px\"><div class=\"row\"><div  class=\"col-11\" style=\"text-align: center;\"><span>查無資料</span></div></div></li>";
        $("#searchText-ul").append(temp);
    }
}

//搜內文的手指圖片設定
function searchTextLocation(page, top, left, width, height, isRightpage) {

    $('.Text').remove();

    gotoPage(page);

    var scalepdfy = 1;
    var scalepdfx = 1;
    var twoscalepdfx = 1;
    //換算縮放比例:母版/pdf原始寬高
    if (TextlocationList.length > 0) {

        var textlocation;

        for (var i = 0; i < TextlocationList.length; i++) {

            if (TextlocationList[i].pdfHeight != 0) {
                textlocation = TextlocationList[i];
                break;
            }
        }

        scalepdfy = MainObj.NewCanvasHeight / parseInt(textlocation.pdfHeight);
        scalepdfx = MainObj.NewCanvasWidth / parseInt(textlocation.pdfWidth);
        // scalepdfy = BookList.eBookHeight / parseInt(TextlocationList[0].pdfHeight);
        twoscalepdfx = (MainObj.NewCanvasWidth * 2) / (parseInt(textlocation.pdfWidth) * 2);
        // console.log('two page : ' + twoscalepdfx);
    }

    var layer = new textImgLayer($('body'));

    layer.setTop((((top) * scalepdfy)) + MainObj.CanvasT - $('.Text').height() - 5);
    layer.setLeft(((left) * scalepdfx) + MainObj.CanvasL - $('.Text').width());

    if (MainObj.IsTwoPage) {
        if (isRightpage == true) {
            layer.setLeft(((left + parseInt(textlocation.pdfWidth)) * twoscalepdfx) + MainObj.CanvasL - $('.Text').width());
        }
    }
}

//搜內文的手指圖片新增
function textImgLayer(parentNode) {
    //Division
    this.Division = document.createElement('img');

    this.Division.super = this;
    this.Division.src = 'css/Images/handfinger.png';
    this.Division.className = 'Text';
    $(this.Division).addClass('canvasObj');
    this.Division.style.position = 'absolute';
    this.Division.style.left = '0px';
    this.Division.style.top = '0px';
    this.Division.style.width = '23px';
    this.Division.style.height = '23px';

    $(this.Division).addClass('canvasObj');

    this.setLeft = function (left) {
        this.Division.style.left = (left + '').replace('px', '') + 'px';
    }

    this.setTop = function (top) {
        this.Division.style.top = (top + '').replace('px', '') + 'px';
    }


    if (parentNode != null) {
        parentNode.append(this.Division);
    }

}

//取得註記
function getNote() {
    var tmp = location.search.replace('?', '').split('&').map(function (x) {
        return x.split('=').map(function (y) {
            return decodeURIComponent(y);
        });
    });
    var domain = tmp.filter(function (x) {
        if (x[0] === 'domain') {
            return x;
        }
    });
    var noteId = tmp.filter(function (x) {
        if (x[0] === 'note') {
            return x;
        }
    });
    if (domain.length && noteId.length) {
        var url = domain[0][1] + '/api/File/ebookNote/' + noteId[0][1] + '.xml';
        $.ajax({
            type: "GET",
            contentType: "text/xml",
            url: url,
            async: false,
            dataType: "xml",
            //成功接收的function
            success: function (xml) {
                noteSwitch(xml);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log("=====Error=====");
            }
        });
    }
}

//關閉註記切換視窗
function closeNote() {
    $('.note_switch_layout').css('display', 'none');
}

//註記切換
function noteSwitch(xml) {
    Html5WirteLog('Note:' + JSON.stringify(xml2jsonAttributeVer(xml)));
    if (window.DOMParser) {

        txtNote.SaveList = [];
        txtCanvas.SaveList = [];
        colorPen.LineList = [];
        txtCanvas.canvasList = [];
        InsertImg.SaveList = [];
        txtComment.saveList = [];
        fileObj.saveList = [];
        hyperLink.saveList = [];
        additionalFile.saveList = [];
        TextPopup.saveList = [];

        $(xml).find('ProcedureSlice').each(function () {

            var page = xml2jsonAttributeVer(this).page;

            if ($(this).find('UserCreateObjectList').length > 0) {
                $(this).find('UserCreateObjectList').each(function () {

                    if ($(this).find('UserCreateObject').length > 0) {
                        $(this).find('UserCreateObject').each(function () {

                            var ebookjson = {};
                            if ($(this).attr('IsPatch') == 'true') return;

                            if ($(this).attr('FormatterType') != undefined) {
                                switch ($(this).attr('FormatterType').split('.').pop()) {
                                    //文字、便利貼
                                    case 'StickyObjectFormatter':

                                        switch ($(this).attr('StickyViewType')) {
                                            //文字
                                            case 'stickyText':
                                                var scale = getscale(this);

                                                ebookjson = {
                                                    page: page,
                                                    id: $(this).attr('Identifier'),
                                                    type: 'txtNote',
                                                    width: parseInt($(this).attr('BoundaryPoint.Bounds.Size.Width')) * scale + 'px',
                                                    height: parseInt($(this).attr('BoundaryPoint.Bounds.Size.Height')) * scale + 'px',
                                                    top: parseInt($(this).attr('BoundaryPoint.Bounds.Location.Y')) * scale + 'px',
                                                    left: parseInt($(this).attr('BoundaryPoint.Bounds.Location.X')) * scale + 'px',
                                                    value: $(this).attr('Contents').replace(/\.\.#/g, '"'),
                                                    StickyViewVisibility: $(this).attr('StickyViewVisibility'),
                                                    bgcolor: $(this).attr('FrameColor')
                                                }

                                                if (txtNote.SaveList.length > 0) {
                                                    for (var x = 0; x < txtNote.SaveList.length; x++) {
                                                        if (txtNote.SaveList[x] != undefined) {
                                                            if (txtNote.SaveList[x].id == ebookjson.id) {
                                                                txtNote.SaveList.splice(x, 1);
                                                            }
                                                        }
                                                    }
                                                }

                                                txtNote.SaveList.push(ebookjson);

                                                break;

                                            //便利貼
                                            case 'stickyDraw':
                                                var scale = getscale(this);

                                                ebookjson = {
                                                    page: page,
                                                    id: $(this).attr('Identifier'),
                                                    type: 'txtCanvas',
                                                    width: parseInt($(this).attr('BoundaryPoint.Bounds.Size.Width')) * scale + 'px',
                                                    height: parseInt($(this).attr('BoundaryPoint.Bounds.Size.Height')) * scale + 'px',
                                                    top: parseInt($(this).attr('BoundaryPoint.Bounds.Location.Y')) * scale + 'px',
                                                    left: parseInt($(this).attr('BoundaryPoint.Bounds.Location.X')) * scale + 'px',
                                                    StickyViewVisibility: $(this).attr('StickyViewVisibility'),
                                                    points: FindCanvasPoint(this)
                                                }

                                                txtCanvas.SaveList.push(ebookjson);
                                                if (ebookjson.points.length > 0) {
                                                    for (var p = 0; p < ebookjson.points.length; p++) {
                                                        txtCanvas.canvasList.push(ebookjson.points[p]);
                                                    }
                                                }
                                                break;
                                        }
                                        break;
                                    //畫筆
                                    case 'BrushObjectFormatter':
                                        var point = $(this).find('Point');

                                        ebookjson = {
                                            id: $(this).attr('Identifier'),
                                            type: 'pen',
                                            object: {
                                                width: FindPenSize(point, this)[0],
                                                height: FindPenSize(point, this)[1],
                                                left: FindPenSize(point, this)[2],
                                                top: FindPenSize(point, this)[3],
                                                penwidth: parseInt($(this).attr('PixelSize')) / 2,
                                                color: intToRGB($(this).attr('ForeColor')),
                                                opacity: intToA($(this).attr('ForeColor'))
                                            },
                                            page: page,
                                            points: FindPenSize(point, this)[4],
                                            BrushType: $(this).attr('BrushType'),
                                            Note: true
                                        }

                                        colorPen.LineList.push(ebookjson);

                                        break;

                                    //註記
                                    case 'MarkObjectFormatter':
                                        ebookjson = {
                                            id: $(this).attr('Identifier'),
                                            page: page,
                                            type: 'mark',
                                            value: $(this).attr('MarkContent')
                                        }
                                        markList.push(ebookjson);
                                        break;

                                    //圖片
                                    case 'InsertImageFormatter':
                                        var scale = getscale(this);

                                        ebookjson = {
                                            id: $(this).attr('Identifier'),
                                            page: page,
                                            type: 'InsertImg',
                                            width: parseInt($(this).attr('BoundaryPoint.Bounds.Size.Width')) * scale,
                                            height: parseInt($(this).attr('BoundaryPoint.Bounds.Size.Height')) * scale,
                                            top: parseInt($(this).attr('BoundaryPoint.Bounds.Location.Y')) * scale,
                                            left: parseInt($(this).attr('BoundaryPoint.Bounds.Location.X')) * scale,
                                            pic: $(this).attr('Picture')
                                        }
                                        InsertImg.SaveList.push(ebookjson);
                                        break;

                                    //註解
                                    case 'AnnotationObjectFormatter':
                                        ebookjson = {
                                            id: $(this).attr('Identifier'),
                                            page: page,
                                            type: 'comment',
                                            value: $(this).attr('Contents').replace(/\.\.#/g, '"'),
                                            position: getCommentPoint(this),
                                            isShow: $(this).attr('IsShow')
                                        };
                                        txtComment.saveList.push(ebookjson);
                                        break;

                                    //圖片
                                    case 'PhotoObjectFormatter':
                                        var scale = getscale(this);

                                        var ext = $(this).attr('XFileName').split('.').pop().toLowerCase();
                                        var isFile = !(ext == 'jpg' || ext == 'png' || ext == 'gif');

                                        ebookjson = {
                                            id: $(this).attr('Identifier'),
                                            page: page,
                                            type: 'file',
                                            fileName: $(this).attr('XFileName'),
                                            file: $(this).attr('File'),
                                            width: isFile ? parseInt($(this).attr('BoundaryPoint.Bounds.Size.Width')) : (parseInt($(this).attr('BoundaryPoint.Bounds.Size.Width')) * scale),
                                            height: isFile ? parseInt($(this).attr('BoundaryPoint.Bounds.Size.Height')) : (parseInt($(this).attr('BoundaryPoint.Bounds.Size.Height')) * scale),
                                            top: parseInt($(this).attr('BoundaryPoint.Bounds.Location.Y')) * scale,
                                            left: parseInt($(this).attr('BoundaryPoint.Bounds.Location.X')) * scale,
                                        };
                                        fileObj.saveList.push(ebookjson);
                                        break;

                                    // 影片
                                    case 'VideoObjectFormatter':
                                        var scale = getscale(this);

                                        ebookjson = {
                                            id: $(this).attr('Identifier'),
                                            page: page,
                                            type: 'file',
                                            fileName: $(this).attr('VideoFileName').split('.')[0] + '.mp4',
                                            file: $(this).attr('File'),
                                            width: parseInt($(this).attr('BoundaryPoint.Bounds.Size.Width')) * scale,
                                            height: parseInt($(this).attr('BoundaryPoint.Bounds.Size.Height')) * scale,
                                            top: parseInt($(this).attr('BoundaryPoint.Bounds.Location.Y')) * scale,
                                            left: parseInt($(this).attr('BoundaryPoint.Bounds.Location.X')) * scale,
                                        };
                                        fileObj.saveList.push(ebookjson);
                                        break;

                                    //超連結
                                    case 'HyperLinkObjectFormatter':
                                        var scale = getscale(this);
                                        ebookjson = {
                                            id: $(this).attr('Identifier'),
                                            page: page,
                                            type: 'hyperLink',
                                            title: $(this).attr('Title'),
                                            src: $(this).attr('PathUrl'),
                                            top: parseInt($(this).attr('BoundaryPoint.Bounds.Location.Y')) * scale,
                                            left: parseInt($(this).attr('BoundaryPoint.Bounds.Location.X')) * scale,
                                        };
                                        hyperLink.saveList.push(ebookjson);
                                        break;

                                    //文字彈跳視窗
                                    case 'TextPopupObjectFormatter':
                                        ebookjson = {
                                            id: $(this).attr('Identifier'),
                                            page: page,
                                            type: 'textPopup',
                                            content: $(this).attr('ContentWithoutCss'),
                                            oldContent: $(this).attr('Content')
                                        };
                                        TextPopup.saveList.push(ebookjson);
                                        break;

                                }
                            }
                        })
                    }
                })
            }
        })
    }

    ReplyImage(MainObj.NowPage);
    ReplyMark(MainObj.NowPage);
    ReplyNote(MainObj.NowPage);
    ReplyCanvas(MainObj.NowPage);
    DrawPen(MainObj.NowPage);
    replyComment(MainObj.NowPage);
    replyFile();
    replyLink();
}

//取得畫筆的尺寸及點
function FindPenSize(points, obj) {

    var scale = getscale(obj);
    var penwidth = $(obj).attr('PixelSize');

    if (points.length > 0) {

        var pointX = [];
        var pointY = [];
        var PointList = [];

        $(points).each(function () {

            var X = Number($(this).attr('X')) * scale;
            var Y = Number($(this).attr('Y')) * scale;

            pointX.push(X);
            pointY.push(Y);

            PointList.push({ 'X': X, 'Y': Y });

        });
    }

    //將線的座標由小至大排序，才能知道canvas的大小
    var ListX = pointX.sort(function (a, b) { return a - b; });
    var minX = ListX[0];
    var maxX = ListX[ListX.length - 1];

    var ListY = pointY.sort(function (a, b) { return a - b; });
    var minY = ListY[0];
    var maxY = ListY[ListY.length - 1];

    var width = maxX - minX + penwidth * 2;
    var height = maxY - minY + penwidth * 2;
    var left = minX - penwidth;
    var top = minY - penwidth;

    return [width, height, left, top, PointList];
}

//取得便利貼畫線的座標
function FindCanvasPoint(obj) {

    var list = $(obj).find('IntegerPath');
    var id = $(obj).attr('Identifier');
    var tmppath = [];

    var scale = getscale(obj);

    for (var i = 0; i < list.length; i++) {
        tmppath[i] = [];
        $(list[i]).find('Point').each(function () {

            var X = parseInt($(this).attr('X')) * scale;
            var Y = parseInt($(this).attr('Y')) * scale;
            var Id = id;

            tmppath[i].push({ X: X, Y: Y, id: Id });
        })
    }

    return tmppath;
}

//取得註解point
function getCommentPoint(obj) {
    var scale = getscale(obj);
    var points = $(obj).find('Point');

    if (points.length > 0) {
        var list = {
            from: {
                X: Number($($(points)[0]).attr('X')) * scale,
                Y: Number($($(points)[0]).attr('Y')) * scale
            },
            to: {
                X: Number($($(points)[1]).attr('X')) * scale,
                Y: Number($($(points)[1]).attr('Y')) * scale
            }
        };
    }
    return list;
}

function getscale(obj) {
    var WindowWidth = BookList.eBookWidth; //視窗寬度
    var WindowHeight = BookList.eBookHeight; //視窗高度
    var NewWidthScale = WindowWidth / $(obj).attr('InitialTargetSize.Width'); //寬度比例
    var NewHeightScale = WindowHeight / $(obj).attr('InitialTargetSize.Height'); //高度比例
    var scale;

    if (NewWidthScale >= NewHeightScale) {
        scale = NewHeightScale;
    } else if (NewWidthScale < NewHeightScale) {
        scale = NewWidthScale;
    }

    return scale;
}

// 關閉所有彈跳視窗
function clearAllTreasure() {
    $('.selector_layout').hide();
    $('.timer_layout').hide();
    $('.page-layout').hide();
    $('.inputLink-layout').hide();
    $('.textboard-layout').hide();
    $('.colorPicker-layout').hide();
    $('.searchText-layout').hide();

    $('#JumptableAll').hide();
    $('#Jumptable').hide();
    $('#Jumptab').hide();
    $('#JumpChapter').hide();
    $('#JumpIcon').hide();
    $('#JumpBar').remove();

    $('.noteMove-layout').hide();
    $('.noteTag').remove();
    $('.noteMove-block').remove();
}

// 輸入頁數
function inputPage() {
    var inputVal = $('.pageNumber')[0].value;
    if (!/^(0|[1-9][0-9]*)$/.test(inputVal)) {
        alert('請輸入正確頁碼!');
        $('.pageNumber')[0].value = MainObj.NowPage + 1;
        return;
    }

    if (inputVal - 1 >= HamaList.length) {
        $('.pageNumber')[0].value = HamaList.length;
        gotoPage(HamaList.length - 1);
        return;
    }

    if (inputVal - 1 < 0) {
        $('.pageNumber')[0].value = 0;
        gotoPage(0);
        return;
    }

    gotoPage(inputVal - 1);
}

function closeInputPage() {
    changeAllBtnToFalse();
    $('.page-layout').css('display', 'none');
}

function closenoteMove() {
    $('.noteMove-layout').hide();
    $('.noteTag').remove();
    $('.noteMove-block').remove();
    changeAllBtnToFalse();
}

// 插入檔案
function handleFiles(files) {
    if (files.length) {
        if (files[0].size > 50000000) {
            alert('檔案大小上限為50MB，請重新上傳');
            return;
        }
        NewCanvas();
        var canvas = $('#canvas')[0];
        $(canvas).attr('class', 'inputFile');
        canvas.id = 'inputFile';
        $(canvas).css({
            'left': MainObj.CanvasL,
            'top': MainObj.CanvasT
        })

        if (files[0].type.indexOf('video/') > -1) {
            // 影片
            $(canvas).click(function (e) {
                e.preventDefault();
                var mouseX = e.offsetX,
                    mouseY = e.offsetY;

                var videoDiv = document.createElement('div');
                var id = newguid();
                videoDiv.id = id;
                $(videoDiv)
                    .attr('class', 'videoFile')
                    .css({
                        width: 640,
                        height: 360,
                        'position': 'absolute',
                        'left': mouseX,
                        'top': mouseY,
                        'z-index': 99
                    });
                $('#HamastarWrapper').append(videoDiv);

                var moveIcon = new Image();
                moveIcon.src = 'css/Images/Drag.png';
                $(moveIcon)
                    .addClass('moveIcon')
                    .css({
                        'position': 'absolute',
                        'top': 0,
                        'right': 0,
                        'z-index': 100,
                        'cursor': 'move'
                    });
                $(videoDiv).append(moveIcon);

                var NewVideo = document.createElement('video');
                NewVideo.id = 'canvas' + id;
                NewVideo.width = 640;
                NewVideo.height = 360;
                $(videoDiv).append(NewVideo);

                $(NewVideo)
                    .attr('controls', true)
                    .css({
                        'position': 'absolute',
                        'cursor': 'pointer',
                        'object-fit': 'fill'
                    })
                    .on('play', function () {
                        var last = $('#HamastarWrapper').children().last();
                        $(this).closest('.videoFile').insertAfter($(last));
                    })
                    .on('pause', function () {
                        var last = $('#HamastarWrapper').children().last();
                        $(this).closest('.videoFile').insertAfter($(last));
                    }).on('fullscreenchange', function () {
                        if (!videoFullscreen()) {
                            videoMainobj.fullscreen = false;
                        }
                    }).on('mozfullscreenchange', function () {
                        if (!videoFullscreen()) {
                            videoMainobj.fullscreen = false;
                        }
                    }).on('webkitfullscreenchange', function () {
                        if (!videoFullscreen()) {
                            videoMainobj.fullscreen = false;
                        }
                    }).on('msfullscreenchange', function () {
                        if (!videoFullscreen()) {
                            videoMainobj.fullscreen = false;
                        }
                    });

                NewVideo.src = window.URL.createObjectURL(files[0]);

                $(videoDiv).resizable({
                    alsoResize: '#' + videoDiv.id + '>video',
                    minHeight: 100,
                    minWidth: 100,
                    start: function () {
                        $(window).off("resize", resizeInit);
                    },
                    stop: function () {
                        $(window).resize(resizeInit);
                        var fileTemp = this;
                        fileObj.saveList = fileObj.saveList.map(function (x) {
                            if (('canvas' + x.id) == fileTemp.id) {
                                x.width = $(fileTemp).width() / MainObj.Scale;
                                x.height = $(fileTemp).height() / MainObj.Scale;
                            }
                            return x;
                        });
                    }
                });

                $(videoDiv).draggable({
                    handle: '.moveIcon',
                    scroll: false,
                    stop: function (e) {
                        var fileTemp = this;
                        fileObj.saveList = fileObj.saveList.map(function (x) {
                            if (x.id == fileTemp.id) {
                                x.left = Math.floor(($(fileTemp).offset().left - MainObj.CanvasL) / MainObj.Scale);
                                x.top = Math.floor(($(fileTemp).offset().top - MainObj.CanvasT) / MainObj.Scale);
                            }
                            return x;
                        });
                    }
                });

                $('#inputFile').remove();

                getBase64(files[0]).then(function (x) {
                    fileObj.saveList.push({
                        id: id,
                        page: MainObj.NowPage,
                        type: 'file',
                        file: x,
                        fileName: files[0].name,
                        left: Math.floor(($(videoDiv).offset().left - MainObj.CanvasL) / MainObj.Scale),
                        top: Math.floor(($(videoDiv).offset().top - MainObj.CanvasT) / MainObj.Scale),
                        width: 640 / MainObj.Scale,
                        height: 360 / MainObj.Scale
                    });
                });
            });
        } else {
            $(canvas).click(function (e) {
                e.preventDefault();
                var mouseX = e.offsetX,
                    mouseY = e.offsetY;
                NewCanvas();
                var fileCanvas = $('#canvas')[0];
                var id = newguid()
                fileCanvas.id = 'canvas' + id;
                $(fileCanvas)
                    .attr('class', 'fileObj')
                    .css({
                        'left': mouseX,
                        'top': mouseY
                    });

                var img = new Image();
                img.onload = function () {
                    fileCanvas.width = img.width;
                    fileCanvas.height = img.height;

                    var fileCxt = fileCanvas.getContext('2d');
                    fileCxt.drawImage(img, 0, 0, fileCanvas.width, fileCanvas.height);

                    $(fileCanvas).resizable({
                        minHeight: 32,
                        minWidth: 32,
                        start: function () {
                            $(window).off("resize", resizeInit);
                        },
                        stop: function () {
                            $(window).resize(resizeInit);
                            var fileTemp = $(this).children()[0];
                            fileObj.saveList = fileObj.saveList.map(function (x) {
                                if (('canvas' + x.id) == fileTemp.id) {
                                    x.width = $(fileTemp).width() / MainObj.Scale;
                                    x.height = $(fileTemp).height() / MainObj.Scale;
                                }
                                return x;
                            });
                        }
                    });
                    fileCanvas.parentElement.id = id;
                    $(fileCanvas.parentElement).draggable({
                        scroll: false,
                        stop: function (e) {
                            var fileTemp = $(this).children()[0];
                            fileObj.saveList = fileObj.saveList.map(function (x) {
                                if (('canvas' + x.id) == fileTemp.id) {
                                    x.left = Math.floor(($(fileTemp).offset().left - MainObj.CanvasL) / MainObj.Scale);
                                    x.top = Math.floor(($(fileTemp).offset().top - MainObj.CanvasT) / MainObj.Scale);
                                }
                                return x;
                            });
                        }
                    });

                    $(fileCanvas.parentElement).click(function (e) {
                        e.preventDefault();
                        if (window.navigator.msSaveOrOpenBlob) {
                            window.navigator.msSaveOrOpenBlob(files[0], files[0].name);
                        } else {
                            var link = document.createElement('a');
                            link.href = window.URL.createObjectURL(files[0]);
                            link.download = files[0].name;
                            link.click();
                        }
                    });

                    $('#inputFile').remove();

                    getBase64(files[0]).then(function (x) {
                        fileObj.saveList.push({
                            id: id,
                            page: MainObj.NowPage,
                            type: 'file',
                            file: x,
                            fileName: files[0].name,
                            left: Math.floor(($(fileCanvas).offset().left - MainObj.CanvasL) / MainObj.Scale),
                            top: Math.floor(($(fileCanvas).offset().top - MainObj.CanvasT) / MainObj.Scale),
                            width: img.width / MainObj.Scale,
                            height: img.height / MainObj.Scale
                        });
                    });
                };

                // 檔案對應圖示
                switch (files[0].name.split('.').pop().toLowerCase()) {
                    case 'doc':
                    case 'docx':
                        img.src = 'css/Images/FileType/DocDocx.png';
                        break;
                    case 'jpg':
                    case 'png':
                    case 'gif':
                        img.src = window.URL.createObjectURL(files[0]);
                        break;
                    case 'ppt':
                    case 'pptx':
                        img.src = 'css/Images/FileType/PptPptx.png';
                        break;
                    default:
                        img.src = 'css/Images/FileType/' + files[0].name.split('.').pop().toLowerCase() + '.png';
                        break;
                }
            });
        }
    }
}

function getBase64(file) {
    return new Promise(function (resolve, reject) {
        const reader = new FileReader();
        reader.onload = function () {
            resolve(reader.result);
        };
        reader.readAsDataURL(file);
        // reader.onerror = error => reject(error);
    });
}

function dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {
        type: mime
    });
}

function replyFile() {
    $('.fileObj').remove();
    $('.videoFile').remove();

    fileObj.saveList.map(function (res) {
        if (res.page == MainObj.NowPage) {
            if (res.fileName.split('.').pop().toLowerCase() == 'mp4') {
                if (res.IsPatch != 'true') {
                    var videoDiv = document.createElement('div');
                    videoDiv.id = res.id;
                    $(videoDiv)
                        .attr('class', 'videoFile')
                        .css({
                            width: res.width * MainObj.Scale,
                            height: res.height * MainObj.Scale,
                            'position': 'absolute',
                            'left': Math.floor((res.left * MainObj.Scale) + MainObj.CanvasL),
                            'top': Math.floor((res.top * MainObj.Scale) + MainObj.CanvasT),
                            'z-index': 99
                        });
                    $('#HamastarWrapper').append(videoDiv);

                    var moveIcon = new Image();
                    moveIcon.src = 'css/Images/Drag.png';
                    $(moveIcon)
                        .addClass('moveIcon')
                        .css({
                            'position': 'absolute',
                            'top': 0,
                            'right': 0,
                            'z-index': 100,
                            'cursor': 'move'
                        });
                    $(videoDiv).append(moveIcon);

                    var NewVideo = document.createElement('video');
                    NewVideo.id = 'canvas' + res.id;
                    NewVideo.width = res.width * MainObj.Scale;
                    NewVideo.height = res.height * MainObj.Scale;
                    NewVideo.src = ReceiveList ? ('Note/' + res.fileName) : res.file;
                    NewVideo.onerror = function () {
                        $(this).parent().remove();
                    };
                    $(videoDiv).append(NewVideo);
                    $(NewVideo)
                        .attr('controls', true)
                        .css({
                            'position': 'absolute',
                            'cursor': 'pointer',
                            'object-fit': 'fill'
                        })
                        .on('play', function () {
                            var last = $('#HamastarWrapper').children().last();
                            $(this).closest('.videoFile').insertAfter($(last));
                        })
                        .on('pause', function () {
                            var last = $('#HamastarWrapper').children().last();
                            $(this).closest('.videoFile').insertAfter($(last));
                        }).on('fullscreenchange', function () {
                            if (!videoFullscreen()) {
                                videoMainobj.fullscreen = false;
                            }
                        }).on('mozfullscreenchange', function () {
                            if (!videoFullscreen()) {
                                videoMainobj.fullscreen = false;
                            }
                        }).on('webkitfullscreenchange', function () {
                            if (!videoFullscreen()) {
                                videoMainobj.fullscreen = false;
                            }
                        }).on('msfullscreenchange', function () {
                            if (!videoFullscreen()) {
                                videoMainobj.fullscreen = false;
                            }
                        });

                    $(videoDiv).resizable({
                        alsoResize: '#' + videoDiv.id + '>video',
                        minHeight: 100,
                        minWidth: 100,
                        start: function () {
                            $(window).off("resize", resizeInit);
                        },
                        stop: function () {
                            $(window).resize(resizeInit);
                            var fileTemp = this;
                            fileObj.saveList = fileObj.saveList.map(function (x) {
                                if (('canvas' + x.id) == fileTemp.id) {
                                    x.width = $(fileTemp).width() / MainObj.Scale;
                                    x.height = $(fileTemp).height() / MainObj.Scale;
                                }
                                return x;
                            });
                        }
                    }).draggable({
                        handle: '.moveIcon',
                        scroll: false,
                        stop: function (e) {
                            var fileTemp = this;
                            fileObj.saveList = fileObj.saveList.map(function (x) {
                                if (x.id == fileTemp.id) {
                                    x.left = Math.floor(($(fileTemp).offset().left - MainObj.CanvasL) / MainObj.Scale);
                                    x.top = Math.floor(($(fileTemp).offset().top - MainObj.CanvasT) / MainObj.Scale);
                                }
                                return x;
                            });
                        }
                    });
                } else {
                    var NewVideo = document.createElement('video');
                    NewVideo.id = 'canvas' + res.id;
                    NewVideo.width = res.width * MainObj.Scale;
                    NewVideo.height = res.height * MainObj.Scale;
                    NewVideo.src = 'Patch/' + res.fileName;
                    NewVideo.onerror = function () {
                        $(this).remove();
                    };

                    var Left = res.left * MainObj.Scale;
                    var Top = res.top * MainObj.Scale;
                    $('body').append(NewVideo);

                    $(NewVideo).attr('class', 'video');
                    $(NewVideo).css({
                        'position': 'absolute',
                        'cursor': 'pointer',
                        'left': Left + MainObj.CanvasL,
                        'top': Top + MainObj.CanvasT,
                        'object-fit': 'fill',
                        'z-index': 99
                    }).on('fullscreenchange', function () {
                        if (!videoFullscreen()) {
                            videoMainobj.fullscreen = false;
                        }
                    }).on('mozfullscreenchange', function () {
                        if (!videoFullscreen()) {
                            videoMainobj.fullscreen = false;
                        }
                    }).on('webkitfullscreenchange', function () {
                        if (!videoFullscreen()) {
                            videoMainobj.fullscreen = false;
                        }
                    }).on('msfullscreenchange', function () {
                        if (!videoFullscreen()) {
                            videoMainobj.fullscreen = false;
                        }
                    });

                    //是否有控制列
                    if (res.SliderBar == 'true') {
                        $('#' + NewVideo.id).attr('controls', true);

                    } else {
                        $('#' + NewVideo.id).click(function (e) {
                            e.preventDefault();
                            if (this.paused) {
                                this.play();
                            } else {
                                this.pause();
                            }
                        });
                    }

                    //是否自動撥放
                    if (res.AutoPlay == '1') {
                        $('#' + NewVideo.id).attr('autoplay', true);
                    }

                    //是否結束後淡出
                    if (res.Fadeout == 'true') {
                        $('#' + NewVideo.id).on('ended', function () {
                            // done playing
                            $(this).fadeOut(400, function () {
                                $(this).remove();
                            })
                        });
                    }
                }
            } else {
                NewCanvas();
                var fileCanvas = $('#canvas')[0];
                fileCanvas.id = 'canvas' + res.id;
                $(fileCanvas).attr('class', 'fileObj');
                var fileCxt = fileCanvas.getContext('2d');
                var img = new Image();
                $(fileCanvas).css({
                    'left': Math.floor((res.left * MainObj.Scale) + MainObj.CanvasL),
                    'top': Math.floor((res.top * MainObj.Scale) + MainObj.CanvasT),
                    'z-index': 99
                })
                if (res.IsPatch == 'true') {
                    $(fileCanvas).css('pointer-events', 'none');
                }
                img.onload = function () {
                    fileCanvas.width = res.width * MainObj.Scale;
                    fileCanvas.height = res.height * MainObj.Scale;
                    fileCxt.drawImage(img, 0, 0, fileCanvas.width, fileCanvas.height);

                    if (res.IsPatch != 'true') {
                        $(fileCanvas).resizable({
                            minHeight: 32,
                            minWidth: 32,
                            start: function () {
                                $(window).off("resize", resizeInit);
                            },
                            stop: function () {
                                $(window).resize(resizeInit);
                                var fileTemp = $(this).children()[0];
                                fileObj.saveList = fileObj.saveList.map(function (x) {
                                    if (('canvas' + x.id) == fileTemp.id) {
                                        x.width = $(fileTemp).width() / MainObj.Scale;
                                        x.height = $(fileTemp).height() / MainObj.Scale;
                                    }
                                    return x;
                                });
                            }
                        });

                        fileCanvas.parentElement.id = res.id;
                        $(fileCanvas.parentElement).draggable({
                            scroll: false,
                            stop: function (e) {
                                var fileTemp = $(this).children()[0];
                                fileObj.saveList = fileObj.saveList.map(function (x) {
                                    if (('canvas' + x.id) == fileTemp.id) {
                                        x.left = Math.floor(($(fileTemp).offset().left - MainObj.CanvasL) / MainObj.Scale);
                                        x.top = Math.floor(($(fileTemp).offset().top - MainObj.CanvasT) / MainObj.Scale);
                                    }
                                    return x;
                                });
                            }
                        });

                        $(fileCanvas.parentElement).click(function (e) {
                            e.preventDefault();
                            if (window.navigator.msSaveOrOpenBlob) {
                                if (ReceiveList) {
                                    var link = document.createElement('a');
                                    link.href = 'Note/' + res.fileName;
                                    link.download = res.fileName;
                                    link.innerHTML = res.fileName;
                                    link.target = '_blank';
                                    link.click();
                                } else {
                                    window.navigator.msSaveOrOpenBlob(res.file, res.fileName);
                                }
                            } else {
                                var link = document.createElement('a');
                                link.href = ReceiveList ? ('Note/' + res.fileName) : window.URL.createObjectURL(dataURLtoFile(res.file, res.fileName));
                                link.download = res.fileName;
                                link.innerHTML = res.fileName;
                                link.target = '_blank';
                                link.click();
                            }
                        });
                    }

                    $('#inputFile').remove();
                };
                // 檔案對應圖示
                switch (res.fileName.split('.').pop().toLowerCase()) {
                    case 'doc':
                    case 'docx':
                        img.src = 'css/Images/FileType/DocDocx.png';
                        break;
                    case 'jpg':
                    case 'png':
                    case 'gif':
                        img.src = ReceiveList ? ((res.IsPatch == 'true' ? 'Patch/' : 'Note/') + res.fileName) : res.file;
                        break;
                    case 'ppt':
                    case 'pptx':
                        img.src = 'css/Images/FileType/PptPptx.png';
                        break;
                    default:
                        img.src = 'css/Images/FileType/' + res.fileName.split('.').pop().toLowerCase() + '.png';
                        break;
                }
            }
        }
    });
}

// 四角放大
function zoomCorner(isLeft, isTop) {
    zoomOut(true);

    GalleryStopMove();
    $(window).off("resize", resizeInit);

    $('#dragCanvas').remove();

    ZoomAttrPosition();

    ToolBarList.ZoomScale = 2;

    ZoomList.Isdraggable = true;
    ZoomList.IsZoom = true;
    ZoomList.ClientX = isLeft ? MainObj.CanvasL * ToolBarList.ZoomScale : (($('#CanvasLeft').width()));
    ZoomList.ClientY = isTop ? MainObj.CanvasT * ToolBarList.ZoomScale : (($('#CanvasLeft').height()));

    zoomSetting(ToolBarList.ZoomScale);

    $('#dragCanvas').show();

    $('#dragCanvas').css({
        left: isLeft ? 0 : ((-$('#dragCanvas').width() / 2) + MainObj.CanvasL * ToolBarList.ZoomScale),
        top: isTop ? 0 : ((-$('#dragCanvas').height() / 2) + MainObj.CanvasT * ToolBarList.ZoomScale),
    });

    ZoomDragScroll();

    $('#dragCanvas').hide();
}

function setcolorPicker() {
    $('.colorPicker-block')
        .draggable({
            cancel: '.colorPicker-cont',
            scroll: false
        });
}

function closeColorPicker() {
    changeAllBtnToFalse();
    $('.colorPicker-layout').hide();
}

function setsearchText() {
    $('.searchText-block')
        .draggable({
            scroll: false
        });
}

function closeSearch() {
    $('.searchText-layout').hide();
    changeAllBtnToFalse();
}

// 新增班級進度
function createClassProgress() {
    classProgressList.push({
        id: newguid(),
        page: MainObj.NowPage,
        time: moment().format('YYYY/MM/DD HH:mm:ss'),
        name: '新增班級'
    });
    $('.class-tr').remove();
    classProgressList.map(function (res, index) {
        $('.class-table').css('display', 'block');
        $('.class-noContent').css('display', 'none');
        var tr = document.createElement('tr');
        $('.class-table').append(tr);
        $(tr).addClass('class-tr');
        $(tr).addClass('class-tr-' + index);
        var timeTd = document.createElement('td');
        $(timeTd).addClass('time');
        $(tr).append(timeTd);
        $(timeTd).text(res.time);
        var classTd = document.createElement('td');
        $(tr).append(classTd);
        var inputName = document.createElement('input');
        $(classTd).append(inputName);
        $(inputName)
            .val(res.name || '新增班級')
            .on('keyup', function (e) {
                classProgressList = classProgressList.map(function (x) {
                    if (res.id === x.id) {
                        x.name = e.target.value;
                    }
                    return x;
                });
                saveClassProgress(classProgressList);
            });
        createButton('儲存', classTd, res, function (item) {
            classProgressList = classProgressList.map(function (x, i) {
                if (item.id === x.id) {
                    item.time = moment().format('YYYY/MM/DD HH:mm:ss');
                    $('.class-tr.class-tr-' + i + '>.time').text(item.time);
                    item.page = MainObj.NowPage;
                }
                return x;
            });
            saveClassProgress(classProgressList);
        });
        createButton('刪除', classTd, res, function (item) {
            classProgressList = classProgressList.filter(function (x) {
                if (item.id !== x.id) {
                    return x;
                }
            });
            $('.class-tr.class-tr-' + index).remove();
            saveClassProgress(classProgressList);
            if (!classProgressList.length) {
                $('.class-table').css('display', 'none');
                $('.class-noContent').css('display', 'block');
            }
        });
        createButton('前往', classTd, res, function (item) {
            gotoPage(item.page);
        });
    });
    saveClassProgress(classProgressList);
}

// 加入班級進度的按鈕
function createButton(name, ele, classItem, callback) {
    var btn = document.createElement('button');
    $(ele).append(btn);
    $(btn)
        .text(name)
        .addClass('selector_btn')
        .click(function () {
            callback(classItem);
        });
}

function closeClassProgress() {
    changeAllBtnToFalse();
    $('.class-layout').css('display', 'none');
}

// 注記移動版面設置
function setNoteMove() {
    for (var i = 0; i < Base64ImageList.length - 1; i++) {
        var div = document.createElement('div');
        div.id = 'noteMove-' + i;
        $(div).addClass('noteMove-block');
        $('.noteMove-conts').append(div);

        var label = document.createElement('label');
        $(div).append(label);
        $(label).text(i + 1);

        var img = document.createElement('img');
        img.src = 'data:image/png;base64,' + Base64ImageList[i].Value;
        $(div).append(img);
    }
}

// 注記移動事件綁定
function noteMoveEvent(index) {
    $('#noteMove-' + index).css('cursor', 'move');
    $('#noteMove-' + index).draggable({
        revert: function (dropped) {
            return !dropped;
        },
        cursorAt: {
            top: -12,
            left: -20
        },
        helper: function (event) {
            return $("<img src=\"css/Images/noteicon.png\">");
        }
    });
    $('.noteMove-block').droppable({
        classes: {
            "ui-droppable-hover": "noteMove-hover"
        },
        drop: function (event, ui) {
            if ($(this).find($('.noteTag')).length) {
                return;
            }

            var that = this;
            confirmShow('是否確定移動注記', "", false, function (res) {
                if (res) {
                    var pageFrom = Number($(ui.draggable)[0].id.split('noteMove-').pop()),
                        pageTo = Number($(that)[0].id.split('noteMove-').pop()),
                        from = ui.draggable,
                        to = $(that);

                    // 文字便利貼
                    txtNote.SaveList.map(function (res) {
                        if (res.page == pageFrom) {
                            res.page = pageTo;
                        }
                    });

                    // 畫筆
                    colorPen.LineList.map(function (res) {
                        if (res.page == pageFrom) {
                            res.page = pageTo;
                        }
                    })

                    // 註解
                    txtComment.saveList.map(function (res) {
                        if (res.page == pageFrom) {
                            res.page = pageTo;
                        }
                    })

                    // 檔案
                    fileObj.saveList.map(function (res) {
                        if (res.page == pageFrom && res.IsPatch != 'true') {
                            res.page = pageTo;
                        }
                    })

                    // 超連結
                    hyperLink.saveList.map(function (res) {
                        if (res.page == pageFrom) {
                            res.page = pageTo;
                        }
                    })

                    $(to).append($(from).find($('.noteTag')));

                    if (Number($(from)[0].id.split('noteMove-').pop()) == MainObj.NowPage) {
                        $('.NoteBox').remove();
                        $('.commentBox').remove();
                        $('.pen').remove();
                        $('.link_btn').remove();

                        for (var i = 0; i < $('.fileObj').length; i++) {
                            $($('.fileObj')[i]).remove();
                        }
                        for (var i = 0; i < $('.videoFile').length; i++) {
                            $($('.videoFile')[i]).remove();
                        }
                        replyFile();
                    }

                    $('.noteTag').remove();
                    $('.noteMove-block').remove();
                    setNoteMove();

                    DrawPen(MainObj.NowPage);

                    for (var i = 0; i < Base64ImageList.length - 1; i++) {
                        var Widget = false;
                        if (txtCanvas.SaveList.length > 0) {
                            for (var x = 0; x < txtCanvas.SaveList.length; x++) {
                                // console.log(txtCanvas.SaveList[i]);
                                if (txtCanvas.SaveList[x] != undefined) {
                                    if (txtCanvas.SaveList[x].page == i) {
                                        Widget = true;
                                    }
                                }
                            }
                        }

                        if (txtNote.SaveList.length > 0) {
                            for (var y = 0; y < txtNote.SaveList.length; y++) {
                                // console.log(txtCanvas.SaveList[i]);
                                if (txtNote.SaveList[y] != undefined) {
                                    if (txtNote.SaveList[y].page == i) {
                                        Widget = true;
                                    }
                                }
                            }
                        }

                        colorPen.LineList.map(function (res) {
                            if (res.page == i) {
                                Widget = true;
                            }
                        });

                        txtComment.saveList.map(function (res) {
                            if (res.page == i) {
                                Widget = true;
                            }
                        });

                        fileObj.saveList.map(function (res) {
                            if (res.page == i && res.IsPatch != 'true') {
                                Widget = true;
                            }
                        });

                        hyperLink.saveList.map(function (res) {
                            if (res.page == i) {
                                Widget = true;
                            }
                        });

                        if (Widget) {
                            var noteImg = new Image();
                            $('#noteMove-' + i).append(noteImg);
                            $(noteImg).addClass('noteTag');
                            noteImg.src = 'css/Images/noteicon.png';
                            $(noteImg).css({
                                'top': '1em',
                                'right': 0,
                                'position': 'absolute'
                            })

                            noteMoveEvent(i);
                        }
                    }
                }
            });
        }
    });
}

// 上傳編修檔
function uploadGoogleDrive() {
    CommandToWPF('UploadNoteData', JSON.stringify({
        name: $('.editor-input')[0].value,
        note: sendXML(true)
    }));
    $('.editor-layout').css('display', 'none');
}

// 操作指引下一頁(光碟)
function operatingTrunPage(number) {
    for (var i = 1; i < 9; i++) {
        $('#operating-img' + i).css('display', 'none');
    }
    if (number < 8) {
        $('#operating-img' + (number + 1)).css('display', 'block');
    } else {
        $('.operating-layout').css('display', 'none');
        changeAllBtnToFalse();
    }
}

// 操作指引下一頁(pc)
function operatingPCTrunPage(number) {
    for (var i = 1; i < 9; i++) {
        $('#operating-pc-img' + i).css('display', 'none');
    }
    if (number < 8) {
        $('#operating-pc-img' + (number + 1)).css('display', 'block');
    } else {
        $('.operating-layout-pc').css('display', 'none');
        changeAllBtnToFalse();
    }
}

// 操作說明圖片的resize
function operatingResize() {
    var oldCanvasWidth = 1024;
    var oldCanvasHeight = 768;

    var WindowWidth = window.innerWidth;
    var WindowHeight = window.innerHeight;

    var NewWidthScale = WindowWidth / oldCanvasWidth; //寬度比例
    var NewHeightScale = WindowHeight / oldCanvasHeight; //高度比例

    if (NewWidthScale >= NewHeightScale) {
        $('.operating-img').css({
            width: oldCanvasWidth * NewHeightScale,
            height: WindowHeight
        })
    } else if (NewWidthScale < NewHeightScale) {
        $('.operating-img').css({
            width: WindowWidth,
            height: oldCanvasHeight * NewWidthScale
        })
    }
}