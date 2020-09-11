//書城核心版本號
var eBookProject = 'eBooks';
var eBookBuildDate = '2020-05-18';
var eBookVersion = 'v2.4.0-Alpha4';

//全域變數
var MainObj = {
    language: 'en-US',
    IsTwoPage: false,
    IsRight: true, //向右或向左翻的參數(true是向右，false是向左)
    NowPage: 0,
    LeftPage: 0,
    RightPage: -1,
    CanvasWidth: 1024,
    CanvasHeight: 768,
    NewCanvasWidth: 0,
    NewCanvasHeight: 0,
    CanvasL: 0,
    CanvasT: 0,
    Scale: 0,
    NextPage: false,
    PrePage: false,
    AllObjslist: [], //存入整本書的物件(除了背景以外)
    AllBackground: [], //存入整本書的背景圖
    ImgCount: 0,
    BGMusic: null,
    TextFontSize: 24, //預設字體大小
    automaticPage: null, // 自動翻頁的timeout存進來，翻頁的時候要clear
    saveList: [],
    trashList: [],
    isSup: true,// 瀏覽器是否支援
    isPinch: false,
    isMouseInText: false
};

var TextlocationList = [];


//書開始前會先跑onload的function
//將xml解析到HamaList
window.onload = OnLoad();

function OnLoad() {
    JsonToHamaList();

    //測驗計分
    if (BookList.BookInfoList != undefined) {

        if (BookList.BookInfoList.ExamInfo.IsExam == '1') {
            Quiz.IsExam = true;
        }

        //隨機頁數
        if (Number(BookList.BookInfoList.ExamInfo.RandomQuizCount) > 0) {
            Quiz.IsRandomQuiz = true;
            getRandomQuiz();
        }
    }

    LoadAllObjs();
    LoadBackgroundImage();
}

//書ready
$(document).ready(function () {
    console.log("%c 版權所有 哈瑪星科技股份有限公司 ", "color: red");
    console.log("%c Copyright (c) Hamastar Technology CO., LTD. All rights reserved.", "color: blue");

    var weblanguage = window.navigator.userLanguage || window.navigator.language;
    if (weblanguage != undefined) {
        MainObj.language = weblanguage;
    }

    var browser = detect.parse(navigator.userAgent).browser;
    if (browser.family == 'IE') {
        var version = parseInt(browser.version);
        if (version < 11) {
            alert('您的瀏覽器(IE' + version + ')無法支援此電子書，請立即更新您的瀏覽器版本');
            MainObj.isSup = false;
            return;
        }
    }

    // 客製化設定(客戶名稱)
    // Url Parameter: Customize=CustomizeName
    Customize(getUrlParameter(window.location.href, "Customize") || CustomizeName);
    // 工程師測試註記
    // noteSwitch(convert_string_to_xml(utf8to16(atob(userCreate))));

    CommandToWPF('RequestExternalInformation');
    BookInit();

    BGMusicSet();

    resize_canvas();
    drawCanvas(MainObj.NowPage);
    setWaterMark();

    GalleryEvent();

    LoadindexedDB(BookList.EBookID);

    $('*').on("click mousedown mousemove mouseup focus blur keydown change touchstart touchmove touchend touchcancel mousewheel", function (e) {
        window.event = e;
    });

    $('#HamastarWrapper')[0].addEventListener("mousemove", function (e) {
        //console.log('滑鼠座標X: ' + e.clientX + ' Y:' + e.clientY);
    }, false);

    //滾輪縮放事件
    $('#HamastarWrapper')[0].addEventListener("mousewheel", function (e) {
        if (MainObj.isMouseInText) return;

        //delta=1 : 放大   delta=-1 : 縮小
        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

        ZoomList.ClientX = (ZoomList.IsZoom ? (e.clientX - ZoomList.Left) / ToolBarList.ZoomScale + MainObj.CanvasL : e.clientX);
        ZoomList.ClientY = (ZoomList.IsZoom ? (e.clientY - ZoomList.Top) / ToolBarList.ZoomScale + MainObj.CanvasT : e.clientY);
        ZoomList.IsAreaZoom = false;

        if (delta == 1 && ToolBarList.ZoomScale < ZoomList.MaxZoom) {
            zoomIn();
        } else if (delta == -1 && ToolBarList.ZoomScale > ZoomList.MinZoom) {
            zoomOut();
        }

    }, false);

    ExamModel();
    NewOffset();
    ChapterListSet();

    $('#HamastarWrapper')[0].addEventListener('touchmove', function (e) {
        var target = e.target;
        if (!target.classList) return;
        e.preventDefault();
    });

    $(document).ajaxStart(function () {
        blockView.open();
    });

    $(document).ajaxStop(function () {
        blockView.close();
    });

    pinchSet('HamastarWrapper');
    palmToggle();
});

document.addEventListener('readystatechange', function (event) {
    if (event.target.readyState === "complete") {
        console.log("Now external resources are loaded too, like css,src etc... ");
        if (MainObj.isSup) {
            $('.loadingText').remove();
            $('.pageIcons_div').toggle();
        }
    }
});

// 掌型切換
function palmToggle() {
    $('#HamastarWrapper').on('mousedown', function (e) {
        //e.preventDefault();
        if (ToolBarList.ZoomScale > 1) {
            if (e.buttons == 4) {
                $('.dragCanvas').toggle();
                if ($('.dragCanvas').css('display') == 'none') {
                    $('#palm').attr('src', 'ToolBar/palmbefore.png');
                    $('.dragCanvas').css({
                        'display': 'none',
                        'cursor': 'default'
                    });
                    ZoomList.Isdraggable = false;
                } else {
                    $('#palm').attr('src', 'ToolBar/palmafter.png');
                    $('.dragCanvas').css({
                        'display': 'block',
                        'cursor': 'move'
                    });
                    ZoomList.Isdraggable = true;
                }
            }
        } else {
            $('#palm').attr('src', 'ToolBar/palmbefore.png');
        }
    })
}

// 多指縮放
function pinchSet(id) {
    var wrapper = document.getElementById(id);
    var hammer = new Hammer(wrapper);
    hammer.get('pinch').set({
        enable: true
    });

    hammer.on('pinchstart', function (e) {
        GalleryStopMove();
        MainObj.isPinch = true;
    });

    hammer.on('pinchout', function (e) {
        zoomIn(e.scale);
        NewOffset();
    });

    hammer.on('pinchin', function (e) {
        if (ToolBarList.ZoomScale == 1) return;
        zoomOut(true);
        NewOffset();
        changeAllBtnToFalse(navigatorToolBar);
    });

    hammer.on('pinchend pinchcancel', function (e) {
        GalleryStartMove();
        MainObj.isPinch = false;
    });
}

//視窗大小變換
$(window).resize(resizeInit);

function resizeInit() {
    videoFullscreen();
    if (!videoMainobj.fullscreen) {
        $('#Narration').remove();
        $('.ErrorCanvas').remove();

        resize_canvas();
        drawCanvas(MainObj.NowPage);
        setWaterMark();
        ResizeTouch();

        AdditionalReset();
        RotationImageReset();
        ScrollReset();

        //頁籤
        if (ToolBarList.TapList[MainObj.NowPage]) {
            tapLayer();
        }

        //當頁的註記回復
        DrawPen(MainObj.NowPage);
        ReplyNote(MainObj.NowPage);
        ReplyCanvas(MainObj.NowPage);
        ReplyImage(MainObj.NowPage);
        replyComment(MainObj.NowPage);
        replyFile();
        replyLink();

        NewOffset();

        operatingResize();
    }
}

//開書時，書的初始化
function BookInit() {
    MainObj.CanvasWidth = BookList.eBookWidth;
    MainObj.CanvasHeight = BookList.eBookHeight;

    //判斷是否為雙頁
    if (BookList.ViewMode == '2') {
        MainObj.IsTwoPage = true;
        $('#CanvasRight').css('display', 'block');
    } else if (BookList.ViewMode == '1') {
        MainObj.IsTwoPage = false;
        $('#CanvasRight').css('display', 'none');
    } else if (MainObj.CanvasHeight > MainObj.CanvasWidth) {
        MainObj.IsTwoPage = true;
        $('#CanvasRight').css('display', 'block');
    } else {
        MainObj.IsTwoPage = false;
        $('#CanvasRight').css('display', 'none');
    }

    //判斷是向左或向右翻
    if (BookList.PageTurnMode == 'left') {
        MainObj.IsRight = false;
    }
}

//嵌入浮水印
function setWaterMark() {

    if (BookList.WatermarkType == 'None') return;

    var watermarkImg = new Image();
    watermarkImg.id = 'WaterMark';
    watermarkImg.src = 'data:image/png;base64,' + BookList.WatermarkImage.Value;

    //先記錄浮水印圖的大小到BookList裡
    if ($('#WaterMark')[0] == undefined) {
        BookList.WaterMarkWidth = watermarkImg.width;
        BookList.WaterMarkHeight = watermarkImg.height;
    }

    $('#WebBox').before(watermarkImg);

    //resize
    var scale = MainObj.Scale;
    watermarkImg.width = BookList.WaterMarkWidth * scale;
    watermarkImg.height = BookList.WaterMarkHeight * scale;


    switch (BookList.WatermarkType) {
        case 'Default': //預設浮水印
            $(watermarkImg).css({
                'position': 'absolute',
                'right': MainObj.CanvasL,
                'top': MainObj.CanvasT,
                'z-index': '1000',
                'pointer-events': 'none'
            })
            break;
        case 'Custom': //自訂浮水印
            $(watermarkImg).css({
                'position': 'absolute',
                'z-index': '1000',
                'pointer-events': 'none'
            })
            //自訂左右位置
            if (BookList.WatermarkHorizontalAlignment == 'Right') {
                $(watermarkImg).css('right', MainObj.CanvasL)
            } else {
                $(watermarkImg).css('left', MainObj.CanvasL)
            }

            //自訂上下位置
            if (BookList.WatermarkVerticalAlignment == 'Top') {
                $(watermarkImg).css('top', MainObj.CanvasT)
            } else {
                $(watermarkImg).css('bottom', MainObj.CanvasT)
            }
            break;
    }
}

//第一次開書先載入整本書的全部物件
function LoadAllObjs() {
    for (var x = 0; x < HamaList.length; x++) {

        //將HamaList的Objects依照zIndex重新排序(由最底層至最上層)
        HamaList[x].Objects.sort(function (a, b) {
            return a.zIndex - b.zIndex;
        });

        for (var y = 0; y < HamaList[x].Objects.length; y++) {
            var obj = {};
            obj.Page = x;
            obj.Identifier = HamaList[x].Objects[y].Identifier;
            obj.Type = HamaList[x].Objects[y].FormatterType;

            if (HamaList[x].Objects[y].FormatterType == 'ImageLayer') {
                var img = new Image();
                img.src = "Resource/" + HamaList[x].Objects[y].XFileName;

                obj.Image = [];
                obj.Image.push(img);
            }
            MainObj.AllObjslist.push(obj);
        }
    }
}

//第一次開書載入整本書的全部背景圖片
function LoadBackgroundImage() {
    // 剛開書時會抓不到背景圖片，導致畫面空白，因此在這先載入畫上第一頁背景
    if (HamaList[0].BackgroundImage != '') {

        var stage = new createjs.Stage("CanvasLeft");
        var Backgroundimg = new Image();
        Backgroundimg.onload = function () {
            var bitmap = new createjs.Bitmap(Backgroundimg);
            bitmap.scaleX = MainObj.NewCanvasWidth / Backgroundimg.width;
            bitmap.scaleY = MainObj.NewCanvasHeight / Backgroundimg.height;
            stage.addChild(bitmap);
            stage.update();
        };
        Backgroundimg.src = "Resource/" + HamaList[0].BackgroundImage;
    }

    for (var i = 0; i < HamaList.length; i++) {
        var BackgroundList = {};
        if (HamaList[i].BackgroundImage != '') {
            var img = new Image();
            img.src = "Resource/" + HamaList[i].BackgroundImage;
            BackgroundList.img = img;
        }
        MainObj.AllBackground.push(BackgroundList);
    }
}

function LoadBackgroundPage(page) {
    var NowPage = page;
    var LastPage = page
    if (page != 0) {
        NowPage -= 1;
    }
    if (page != HamaList.length) {
        LastPage += 2;
    }

    MainObj.AllBackground = [];
    for (var i = NowPage; i < LastPage; i++) {
        var BackgroundList = {};
        if (HamaList[i].BackgroundImage != '') {
            var img = new Image();
            img.src = "Resource/" + HamaList[i].BackgroundImage;
            BackgroundList.src = "Resource/" + HamaList[i].BackgroundImage;
            BackgroundList.img = img;
            BackgroundList.id = HamaList[i].SliceIdentifier;
            BackgroundList.page = i;
        }

        MainObj.AllBackground.push(BackgroundList);
    }
}

function resize_canvas() {
    RotationImageReset();
    SlideShowReset();
    ScrollReset();
    //每次翻頁或跳頁，要將另外新增的canvas砍掉，包括輔助視窗也是
    $('.canvasObj').remove();
    $('.canvasPosition').remove();
    $('.Text').remove();
    $('#WaterMark').remove();
    $('.textPopup').remove();
    //判斷是否為全螢幕模式
    //如果否則砍掉video
    //如果是則不能砍掉video，不然全螢幕會跳掉
    if (fullScreen) {
        $('.video').remove();
        $('.iframeObj').remove();
        $('.videoPosition').remove();
        $('.videoFile').remove();
        $('.IntroDiv').remove();
    }

    var oldCanvasWidth = MainObj.CanvasWidth;
    var oldCanvasHeight = MainObj.CanvasHeight;

    var WindowWidth = window.innerWidth; //視窗寬度
    var WindowHeight = window.innerHeight; //視窗高度

    if (BookList.ViewMode == '2') {
        //雙 -> 單
        if (WindowHeight > WindowWidth && oldCanvasHeight > oldCanvasWidth) {

            $('#CanvasRight').css('display', 'none');
            MainObj.IsTwoPage = false;
            PageSetting(1);

            //單 -> 雙
        } else {
            $('#CanvasRight').css('display', 'block');

            MainObj.IsTwoPage = true;
            if (MainObj.NowPage % 2 > 0) {
                MainObj.NowPage++;
            }

            PageSetting(2);
        }
    } else if (oldCanvasHeight > oldCanvasWidth) {
        //雙 -> 單
        if (WindowHeight > WindowWidth && oldCanvasHeight > oldCanvasWidth) {

            $('#CanvasRight').css('display', 'none');
            MainObj.IsTwoPage = false;
            PageSetting(1);

            //單 -> 雙
        } else {
            $('#CanvasRight').css('display', 'block');

            MainObj.IsTwoPage = true;
            if (MainObj.NowPage % 2 > 0) {
                MainObj.NowPage++;
            }

            PageSetting(2);
        }
    } else {
        PageSetting(1);
    }

    MainObj.CanvasL = $('#CanvasGallery')[0].offsetLeft;
    MainObj.CanvasT = $('#CanvasGallery')[0].offsetTop;

    if ($('#canvasPad')[0]) {
        $('#canvasPad')[0].width = $(window).width();
        $('#canvasPad')[0].height = $(window).height();
    }
    if ($('#canvasEraser')[0]) {
        $('#canvasEraser')[0].width = $(window).width();
        $('#canvasEraser')[0].height = $(window).height();
    }

}

//頁面設定(pageValue == 1為單頁，2為雙頁)
function PageSetting(pageValue) {

    var oldCanvasWidth = MainObj.CanvasWidth * pageValue;
    var oldCanvasHeight = MainObj.CanvasHeight;

    var WindowWidth = window.innerWidth; //視窗寬度
    var WindowHeight = window.innerHeight; //視窗高度

    //章節模式
    if (ToolBarList.IsChapter) {
        WindowWidth -= 216; //扣掉章節menu的width，再扣掉書的左右各8px的間隙
    }

    var NewWidthScale = WindowWidth / oldCanvasWidth; //寬度比例
    var NewHeightScale = WindowHeight / oldCanvasHeight; //高度比例

    var canvasLeft = document.getElementById('CanvasLeft');
    var canvasRight = document.getElementById('CanvasRight');
    var CanvasGallery = document.getElementById('CanvasGallery');

    if (NewWidthScale >= NewHeightScale) {

        canvasRight.width = canvasLeft.width = oldCanvasWidth * NewHeightScale / pageValue;
        canvasRight.height = canvasLeft.height = WindowHeight;

        MainObj.Scale = NewHeightScale;

    } else if (NewWidthScale < NewHeightScale) {

        canvasRight.width = canvasLeft.width = WindowWidth / pageValue;
        canvasRight.height = canvasLeft.height = oldCanvasHeight * NewWidthScale;

        MainObj.Scale = NewWidthScale;
    }

    MainObj.NewCanvasWidth = canvasLeft.width;
    MainObj.NewCanvasHeight = CanvasGallery.height = canvasLeft.height;
    CanvasGallery.width = canvasLeft.width * pageValue;

    //Canvas置中
    var Left = (WindowWidth - CanvasGallery.width) / 2;
    var Top = (WindowHeight - CanvasGallery.height) / 2;

    //章節模式
    if (ToolBarList.IsChapter) {
        Left += 208; //加上章節menu的width，再加上書的8px的間隙
    }

    if (MainObj.IsTwoPage) {
        canvasSetting(Left, Top);
    } else {
        $('#CanvasLeft').css({
            'left': Left + 'px',
            'top': Top + 'px'
        });
        $('#CanvasLeft').attr({
            'left': Left,
            'top': Top
        });
    }

    $('#CanvasGallery').css({
        'left': Left + 'px',
        'top': Top + 'px'
    });

    $('.canvas').css('position', 'absolute');

    //所有物件及背景都放在HamastarWrapper裡
    $('#HamastarWrapper').css({
        'position': 'absolute',
        'width': WindowWidth,
        'height': WindowHeight,
    })

}

//判斷左右翻，將canvas左右對調，用left的值來控制
function canvasSetting(left, top) {
    if (MainObj.IsRight) {
        var PageLeft = [0, $('#CanvasLeft').width()];
    } else {
        var PageLeft = [$('#CanvasLeft').width(), 0];
    }

    $('#CanvasLeft').css({
        'left': left + PageLeft[0] + 'px',
        'top': top + 'px'
    });
    $('#CanvasRight').css({
        'left': left + PageLeft[1] + 'px',
        'top': top + 'px'
    });
}

//跳頁
function gotoPage(page, isTurnPage, isNext) {
    if (page >= HamaList.length || page < 0) {
        if (page >= HamaList.length) {
            BookAlertShow('此頁為最後一頁', "PageFin");
        } else if (page < 0) {
            //BookAlertShow('此頁為第一頁', "PageFirst");
        }
        return;
    }

    if (isTurnPage) { // 翻頁狀態
        if (isNext) { // 下一頁
            if (HamaList[MainObj.NowPage].SwipeToNextSliceEnable == 0) {
                alert('禁止往後翻頁');
                return;
            }
        } else { // 上一頁
            if (HamaList[MainObj.NowPage].SwipeToPrevSliceEnable == 0) {
                alert('禁止往前翻頁');
                return;
            }
        }
    }

    // 判斷是否有補丁
    if (BookList.IsPatch == 'true' && isNoPatch && page >= 3) {
        BookAlertShow('請至光碟匯入教材補充包', "InputCD");
        return;
    }

    $('.dragCanvas').remove();
    zoomOut(true);


    //翻頁關掉旁白
    $('#Narration').remove();
    $('#Voice').remove();

    //每次都先把HamaStar的click事件砍掉，才不會重複click事件
    //沒有動畫的頁面也不會有Click事件
    $('#HamastarWrapper').unbind('click');

    // 超連結按鈕
    $('.link_btn').remove();

    // 檔案
    $('.fileObj').remove();
    $('.videoFile').remove();

    if (MainObj.IsTwoPage) {
        if (page % 2 == 1) {
            page = isNext ? page + 1 : page - 1;
        }
    }

    resize_canvas();
    QuizInit();
    AdditionalReset();
    RotationImageReset();
    SlideShowReset();
    ScrollReset();
    ResetSelect();
    videoReset();
    txtNoteReset();
    txtCanvasReset();
    txtCommentReset();
    txtPopupReset();


    var canvasLeft = document.getElementById('CanvasLeft');
    var contextL = canvasLeft.getContext('2d');
    var canvas = document.getElementById('CanvasRight');
    var context = canvas.getContext('2d');

    context.clearRect(0, 0, canvas.width, canvas.height); //clear canvas
    contextL.clearRect(0, 0, canvas.width, canvas.height);
    Gallery.Cxt.clearRect(0, 0, canvas.width, canvas.height);

    MainObj.NowPage = Number(page); //紀錄現在頁數

    if($('.pageNumber').length) {
        $('.pageNumber')[0].value = MainObj.NowPage + 1;
    }
    
    if (MainObj.IsTwoPage) {
        MainObj.LeftPage = page;
        MainObj.RightPage = page - 1;
    }
    drawCanvas(page);
    setWaterMark();

    //翻頁時若錯誤回饋視窗開著，則關掉
    if ($('#DivErrorMsg').attr('style') == "") {
        $('#DivErrorMsg').toggle();
    }

    //頁籤
    if (ToolBarList.TapList[page]) {
        tapLayer();
    }

    ReplyMark(page);
    ReplyImage(page);

    //當頁的註記回復
    DrawPen(page);
    ReplyNote(page);

    //便利貼resize時會觸發到這裡，會影響到便利貼resize的動作
    //因此在ReplyCanvas(page)裡多一個判斷是否此便利貼存在
    //如果已存在頁面上，則不再重生便利貼
    ReplyCanvas(page);
    replyComment(page);

    replyLink();

    replyFile();

    replyAdditional();

    if (Exam.Finish) {
        showQuizAnswer(page);
    }

    //紀錄已讀的頁面
    if (ToolBarList.ChapterList.length && ToolBarList.ChapterList[page]) {
        ToolBarList.ChapterList[page].readStatus = true;
    }
    ChapterSwitchImg();

    changeAllBtnToFalse(navigatorToolBar);

    $('#canvasPad').remove();

    resetUndo();
}

// reset undo&redo
function resetUndo() {
    MainObj.saveList = [];
    MainObj.trashList = [];

    //初始化還原按鈕
    recovery();
}

function getUrlParameter(location, name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

function newguid() {
    var d = Date.now();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
        d += performance.now();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
};

//RGB轉為ARGB
function getARGBInt(color, opacity) {

    if (/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color)) {
        color = hexToRgb(color);
    }

    color = color.substr(4).split(')')[0].split(',');
    opacity = opacity * 255;

    var a = opacity << 24;
    var r = Number(color[0]) << 16;
    var g = Number(color[1]) << 8;
    var b = Number(color[2]);


    return a + r + g + b;

}

// HEX to RGB
function hexToRgb(hexValue) {
    const rgx = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const hex = hexValue.replace(rgx, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });
    const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    return 'rgb(' + parseInt(rgb[1], 16) + ',' + parseInt(rgb[2], 16) + ',' + parseInt(rgb[3], 16) + ')';
}

//用ARGB取得RGB值([RGB, A])
function CovertIntToRGB(ARGBInt) {
    var argb = [];
    ARGBInt = Number(ARGBInt);
    var a = ARGBInt >> 24 & 255;

    var r = ARGBInt >> 16 & 255;

    var g = ARGBInt >> 8 & 255;

    var b = ARGBInt >> 0 & 255;

    argb.push('rgb(' + r + ',' + g + ',' + b + ')');
    argb.push(Math.round(a / 255, 2));


    return argb;
}

//背景音樂
//如果有則將audio物件存為MainObj.BGMusic，否則MainObj.BGMusic = null
function BGMusicSet() {
    if (BookList.BackgroundMusicFileName != '') {
        $('<audio/>', {
            id: 'BGMusic',
            class: 'BGMusic',
            src: 'Resource/' + BookList.BackgroundMusicFileName,
            loop: true,
            autoplay: true
        }).appendTo('body');

        $('#BGMusic')[0].volume = BookList.BackgroundMusicVolume / 100;
        // $('#BGMusic')[0].play();

        MainObj.BGMusic = $('#BGMusic')[0];
    }
}

//背景音樂播放
function BGMusicPlay() {
    if (MainObj.BGMusic != null) {
        MainObj.BGMusic.play();
    }
}

//背景音樂暫停
function BGMusicPause() {
    if (MainObj.BGMusic != null) {
        MainObj.BGMusic.pause();
    }
}

//翻頁音效
function PageTurnMusic() {
    if (BookList.PageTurnFileName != '') {
        $('#PageTurnMusic').remove();
        $('<audio/>', {
            id: 'PageTurnMusic',
            class: 'PageTurnMusic',
            src: 'Resource/' + BookList.PageTurnFileName
        }).appendTo('#HamastarWrapper');

        $('#PageTurnMusic')[0].volume = 1;
        $('#PageTurnMusic')[0].play();

        $("#PageTurnMusic").on('ended', function () {
            // done playing
            $(this).remove();
        });
    }
}

//書以外的空間建立div，可以擋住超過書的物件
//左右兩側翻頁功能
function NewOffset() {

    $('.divOffset').remove();

    if ($('.dragCanvas')[0] == undefined) { //如有縮放，不開啟此功能

        if (!ToolBarList.IsChapter && !MainObj.IsTwoPage) {
            //左右
            if (MainObj.CanvasL > 0) {
                var divLeft = document.createElement('div');
                $(divLeft).addClass('divOffset');
                $('#HamastarWrapper').append(divLeft);
                $(divLeft).css({
                    'left': '0px',
                    'height': '100%',
                    'width': MainObj.CanvasL
                });

                var divRight = document.createElement('div');
                $(divRight).addClass('divOffset');
                $('#HamastarWrapper').append(divRight);
                $(divRight).css({
                    'right': '0px',
                    'height': '100%',
                    'width': MainObj.CanvasL
                });
            }

            //上下
            if (MainObj.CanvasT > 0) {
                var divTop = document.createElement('div');
                $(divTop).addClass('divOffset');
                $('#HamastarWrapper').append(divTop);
                $(divTop).css({
                    'top': '0px',
                    'width': '100%',
                    'height': MainObj.CanvasT
                })

                var divBottom = document.createElement('div');
                $(divBottom).addClass('divOffset');
                $('#HamastarWrapper').append(divBottom);
                $(divBottom).css({
                    'bottom': '0px',
                    'width': '100%',
                    'height': MainObj.CanvasT
                })
            }
        } else if (ToolBarList.IsChapter) {
            //左右
            if (MainObj.CanvasL > 0) {
                var divLeft = document.createElement('div');
                $(divLeft).addClass('divOffset');
                $('#HamastarWrapper').append(divLeft);
                $(divLeft).css({
                    'left': '200px',
                    'height': '100%',
                    'width': MainObj.CanvasL - 200,
                    'background': '#353535'
                })

                var divRight = document.createElement('div');
                $(divRight).addClass('divOffset');
                $('#HamastarWrapper').append(divRight);
                $(divRight).css({
                    'left': MainObj.CanvasL + $('#CanvasGallery').width(),
                    'height': '100%',
                    'width': MainObj.CanvasL - 200,
                    'background': '#353535'
                })
            }
        }
    }
}

//重新規劃書的大小及位置
function ResetEBook() {
    $(window).resize(resizeInit);
    setWaterMark();
    NewOffset();
}

var blockView = {
    open: function () {
        $('.blockView').css('display', 'flex');
    },
    close: function () {
        $('.blockView').css('display', 'none');
    }
};

// 清除全部註記
function clearAllNote() {
    txtNote.SaveList = [];
    txtCanvas.SaveList = [];
    colorPen.LineList = [];

    txtCanvas.canvasList = [];
    InsertImg.SaveList = [];
    MainObj.saveList = [];

    fileObj.saveList = [];
    hyperLink.saveList = [];

    DrawPen(MainObj.NowPage);
    ReplyNote(MainObj.NowPage);
    ReplyCanvas(MainObj.NowPage);
    replyComment(MainObj.NowPage);
    replyFile();
    replyLink();
}

function pageIconClick(isLeft) {
    if (!MainObj.IsRight) {
        if (isLeft) {
            gotoPage(MainObj.NowPage - 1, true, false);
        } else {
            gotoPage(MainObj.NowPage + 1, true, true);
        }
    } else {
        if (isLeft) {
            gotoPage(MainObj.NowPage + 1, true, true);
        } else {
            gotoPage(MainObj.NowPage - 1, true, false);
        }
    }
}