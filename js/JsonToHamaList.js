var HamaList = [];
var Base64ImageList = [];
var BookList = [];


function JsonToHamaList() {

    var indexJsonPage = indexJson["Hamastar.EzSTEP"]["Project"]["ProcedureSliceList"]["ProcedureSlice"];

    //跳頁版面所需的圖片，存在Base64ImageList裡
    Base64ImageList = indexJson["Hamastar.EzSTEP"]["Image"];
    if (Base64ImageList) {
        if (Base64ImageList.length) {
            Base64ImageList.reverse(); //順序反轉
        } else {
            Base64ImageList = [Base64ImageList];
        }
    }

    var bookAttributes = {
        EBookID: indexJson["Hamastar.EzSTEP"]["Project"].Identifier,
        EBookName: indexJson["Hamastar.EzSTEP"]["Project"]["ProjectMetadata"].Name, //書名
        PageTurnMode: indexJson["Hamastar.EzSTEP"]["Project"].PageTurnMode,
        ViewMode: indexJson["Hamastar.EzSTEP"]["Project"].ViewMode, // 觀看模式(單1/雙2)
        eBookHeight: Number(indexJson["Hamastar.EzSTEP"]["Project"]["DefaultMotherboard"]["Bounds.Size.Height"]),
        eBookWidth: Number(indexJson["Hamastar.EzSTEP"]["Project"]["DefaultMotherboard"]["Bounds.Size.Width"]),
        BackgroundMusicFileName: indexJson["Hamastar.EzSTEP"]["Project"].BackgroundMusicFileName, //背景音樂src
        BackgroundMusicVolume: indexJson["Hamastar.EzSTEP"]["Project"].BackgroundMusicVolume, //背景音樂音量
        BookInfoList: indexJson["Hamastar.EzSTEP"]["Project"].BookInfoList, //測驗題組
        WatermarkType: indexJson["Hamastar.EzSTEP"]["Project"].WatermarkType, //浮水印參數
        WatermarkImage: indexJson["Hamastar.EzSTEP"].WatermarkImage, //浮水印圖片
        WatermarkHorizontalAlignment: indexJson["Hamastar.EzSTEP"]["Project"].WatermarkHorizontalAlignment,
        WatermarkVerticalAlignment: indexJson["Hamastar.EzSTEP"]["Project"].WatermarkVerticalAlignment,
        PageTurnFileName: indexJson["Hamastar.EzSTEP"]["Project"].PageTurnFileName, //翻頁音效
        IsPatch: indexJson["Hamastar.EzSTEP"]["Project"].IsPatch //是否有補丁
    }
    BookList = bookAttributes;

    if (indexJsonPage != null && indexJsonPage.length == undefined) {
        var List = [];
        List[0] = indexJsonPage;
        indexJsonPage = List;
    }

    for (var page = 0; page < indexJsonPage.length; page++) {

        var pageAttributes = {
            PageType: indexJsonPage[page].FormatterType,
            PageTitle: titleSet(indexJsonPage[page].Description), //標題
            BackgroundImage: indexJsonPage[page].Motherboard.MotherboardSectionObjectList.MotherboardSectionObject.ImageFileName,
            SliceIdentifier: indexJsonPage[page].SliceIdentifier,
            IsChapter: indexJsonPage[page].IsChapter,
            SwipeToNextSliceEnable: indexJsonPage[page].SwipeToNextSliceEnable,
            SwipeToPrevSliceEnable: indexJsonPage[page].SwipeToPrevSliceEnable,
            CorrectMessage: indexJsonPage[page].CorrectMessageBySelf,
            ErrorMessage: indexJsonPage[page].ErrorMessageBySelf,
            CorrectMode: indexJsonPage[page].CorrectMode,
            ErrorMode: indexJsonPage[page].ErrorMode,
            ErrorLinkPath: indexJsonPage[page].FileLinks,
            CorrectLinkPath: indexJsonPage[page].CorrectFileLinks,
            ErrorCount: indexJson["Hamastar.EzSTEP"]["Project"].ErrorCount,
            BackgroundMusicVolume: indexJsonPage[page].BackgroundMusicVolume,
            AnimationSet: indexJsonPage[page].Motherboard.MotherboardSectionObjectList.MotherboardSectionObject.Whiteboard.AnimationGroup,
            AudioFileName: indexJsonPage[page].Motherboard.MotherboardSectionObjectList.MotherboardSectionObject.AudioFileName, //旁白
            PlayBackgroundMusic: indexJsonPage[page].PlayBackgroundMusic, //是否播放背景音樂
            GroupList: indexJsonPage[page].InteractionObjectGroupList.Group, //測驗題組
            CorrectMusicFileName: indexJsonPage[page].CorrectMusicFileName, //正確訊息音樂參數
            ErrorMusicFileName: indexJsonPage[page].ErrorMusicFileName, //錯誤訊息音樂參數
            IsChapter: indexJsonPage[page].IsChapter, //章節
            IntervalSeconds: indexJsonPage[page].IntervalSeconds, //自動翻頁時間
            CustomNextIndex: indexJsonPage[page].CustomNextProcedureSliceIndex, //測驗正確時翻頁頁數
            ErrorNextindex: indexJsonPage[page].OnErrorNextProcedureSliceindex, //測驗錯誤時翻頁id
            IsCorrectAllToFeedback: indexJsonPage[page].IsCorrectAllToFeedback, //測驗全正確自動回饋
        };

        HamaList[page] = pageAttributes;
        HamaList[page].Objects = [];

        var ObjList = indexJsonPage[page].Motherboard.MotherboardSectionObjectList.MotherboardSectionObject.Whiteboard.WhiteboardObjectList.WhiteboardObject;

        if (ObjList != null && ObjList.length == undefined) {
            var Obj = [];
            Obj[0] = ObjList;
            ObjList = Obj;
        }
        if (ObjList != undefined) {
            for (var obj = 0; obj < ObjList.length; obj++) {

                var objsAttributes = {
                    FormatterType: typeNameSetting(ObjList[obj].FormatterType),
                    Identifier: ObjList[obj].Identifier,
                    XFileName: ObjList[obj].XFileName,
                    zIndex: ObjList[obj].LayerIndex,
                    Width: Number(ObjList[obj]["BoundaryPoint.Bounds.Size.Width"]),
                    Height: Number(ObjList[obj]["BoundaryPoint.Bounds.Size.Height"]),
                    Left: Number(ObjList[obj]["BoundaryPoint.Bounds.Location.X"]),
                    Top: Number(ObjList[obj]["BoundaryPoint.Bounds.Location.Y"]),
                    Alpha: ObjList[obj].Alpha,
                    Rotate: Number(ObjList[obj].Rotate),
                    BackColor: intToRGB(ObjList[obj].BackColor),
                    Brush: intToRGB(ObjList[obj].Brush),
                    BorderColor: intToRGB(ObjList[obj].BorderColor),
                    BorderColorAlpha: intToRGBA(ObjList[obj].BorderColor),
                    ForeColor: intToRGB(ObjList[obj].ForeColor),
                    BorderStyle: ObjList[obj].BorderStyle,
                    BorderAlpha: intToA(ObjList[obj].BorderColor),
                    DashStyle: ObjList[obj].DashStyle,
                    BorderWidth: ObjList[obj].BorderWidth,
                    PixelSize: Number(ObjList[obj].PixelSize),
                    Points: ObjList[obj].Points,
                    BackgroundXFileName: ObjList[obj].BackgroundXFileName, //背景圖

                    AutoPlay: ObjList[obj].AutoPlay, //影片自動撥放
                    Fadeout: ObjList[obj].Fadeout, //影片淡出
                    SliderBar: ObjList[obj].SliderBar, //影片淡出
                    VideoFileName: ObjList[obj].VideoFileName, //影片src

                    BrushColor: intToRGB(ObjList[obj].BrushColor), //遮罩顏色

                    CorrectOrder: ObjList[obj].RectangleOrderIndex, //點選題順序
                    From: ObjList[obj].From,
                    To: ObjList[obj].To,
                    Answer: ObjList[obj].Answer, //填充題答案
                    IsCaseSensitive: ObjList[obj].IsCaseSensitive, //填充題大小寫
                    isPictureDragObject: ObjList[obj].isPictureDragObject, //是否為圖片連連看的圖片
                    ConnectOrderIndex: ObjList[obj].ConnectOrderIndex, //連連看順序
                    Interactivedirec: ObjList[obj].Interactivedirec,

                    HtmlUrl: ObjList[obj].HtmlUrl,
                    URLPath: ObjList[obj].URLPath, //嵌入網頁
                    ScriptType: ObjList[obj].ScriptType, //網頁type
                    PathFileName: ObjList[obj].PathFileName, //另開附件
                    PlayItemsList: ObjList[obj].PlayItemsList, //全文朗讀item
                    PlayingStateShow: ObjList[obj].PlayingStateShow, //全文朗讀色塊

                    Position: {
                        X: ObjList[obj].X,
                        Y: ObjList[obj].Y,
                        W: ObjList[obj].W,
                        H: ObjList[obj].H,
                        R: ObjList[obj].R
                    }, //圖影定位位置及大小
                    AudioPathFileName: ObjList[obj].AudioPathFileName, //圖影定位音效
                    Background: ObjList[obj].Background, //圖影定位bg frame
                    SingleSelect: ObjList[obj].SingleSelect, //圖影定位是否單張顯示

                    InteractiveType: ObjList[obj].InteractiveType, //超連結類型
                    JumpToProcedureSliceIndex: ObjList[obj].JumpToProcedureSliceIndex, //連結跳頁
                    PathUrl: ObjList[obj].PathUrl, //超連結網址

                    ImageList: ObjList[obj].ImageList, //圖片清單(360、動態平移、幻燈片、720)
                    AutoplayInterval: ObjList[obj].AutoplayInterval, //360播放每張圖片的時間間隔，單位是毫秒
                    PinchZoom: ObjList[obj].PinchZoom, //360物件可否放大至全螢幕
                    Autoplay: ObjList[obj].Autoplay, //360物件是否自動撥放

                    Looping: ObjList[obj].Looping, //360、動態平移物件是否循環

                    PlayMode: ObjList[obj].PlayMode, //幻燈片類型
                    Cutscenes: ObjList[obj].Cutscenes, //幻燈片淡出

                    ScrollType: ObjList[obj].ScrollType, //動態平移互動效果
                    MoveDirection: ObjList[obj].MoveDirection, //動態平移方向
                    PinchZoom: ObjList[obj].PinchZoom, //動態平移放大全部
                    TapZoom: ObjList[obj].TapZoom, //動態平移放大單張
                    Orientation: ObjList[obj].Orientation, // "horizontal"橫向，"vertical"直向
                    PlayingInterval: ObjList[obj].PlayingInterval, //動態平移速度，自動播放時每格幾毫秒移動1 pixel
                    Size: Number(ObjList[obj].Size), //平移模式時，此物件的長度是第一張圖長度的幾倍
                    Paging: ObjList[obj].Paging, //是否平移模式
                    RectList: ScrollIntro(ObjList[obj].RectList), //自訂感應區
                    BaseFormatterType: ObjList[obj].BaseFormatterType, //自訂感應區輔助視窗type

                    IntroductionObjectList: ObjList[obj].IntroductionObjectList, //輔助視窗物件
                    DragEnable: ObjList[obj].DragEnable, //輔助視窗是否可移動

                    Selected: false,

                    IsAnimation: ObjList[obj].IsVisiableOfAnimationInitial, //動畫
                    AnimationTemplate: ObjList[obj].AnimationTemplate, //動畫
                    AnimationGroupIdentifier: ObjList[obj].AnimationGroupIdentifier, //動畫感應區

                    //測驗題組
                    GroupData: ObjList[obj].GroupData,
                    CorrectMistake: ObjList[obj].CorrectMistake, //訂正
                    RandomQuizRange: ObjList[obj].RandomQuizRange, //在範圍(RandomQuizRange)內隨機出題數(RandomQuizCount)
                    RandomQuizCount: ObjList[obj].RandomQuizCount,
                    TestTime: ObjList[obj].TestTime, //測驗時間
                    UploadPlatform: ObjList[obj].UploadPlatform, //是否上傳雲端

                    CharSetImg: ObjList[obj].CharSetImg, //文字框圖片位置

                    DialogWidth: Number(ObjList[obj]["BoundaryPoint.Bounds.Size.EditText.Width"]),
                    DialogHeight: Number(ObjList[obj]["BoundaryPoint.Bounds.Size.EditText.Height"]),
                    DialogLeft: Number(ObjList[obj]["BoundaryPoint.Bounds.Location.EditText.X"]),
                    DialogTop: Number(ObjList[obj]["BoundaryPoint.Bounds.Location.EditText.Y"]), //說話框內文字框大小位置
                    FrameRotate: ObjList[obj].FrameRotate, //說話框旋轉
                    Contents: ObjList[obj].Contents, //文字內容
                    ContentsColor: intToRGB(ObjList[obj].ContentsColor), //顏色
                    ContentsSize: ObjList[obj].ContentsSize, //文字大小
                    MarkContent: ObjList[obj].MarkContent, //註記內容

                    //文字彈跳視窗
                    Content: ObjList[obj].Content,
                    ViewBorderBrush: intToRGB(ObjList[obj].ViewBorderBrush),
                    Title: ObjList[obj].Title,

                    //另開附件-子物件
                    ParentID: ObjList[obj].ParentID,

                    //CoverFlow
                    Tilt: ObjList[obj].Tilt,
                    Spacing: ObjList[obj].Spacing,
                    ImageSizeWidth: ObjList[obj]['ImageSize.Width'],
                    ImageSizeHeight: ObjList[obj]['ImageSize.Height'],
                    ElementScaleX: ObjList[obj]['ElementScale.X'],
                    ElementScaleY: ObjList[obj]['ElementScale.Y']
                }

                if (ObjList[obj].SubPanoramaObjectList != undefined) { // 720
                    objsAttributes.SubPanoramaObjectList = {
                        Back: ObjList[obj].SubPanoramaObjectList.Back,
                        Bottom: ObjList[obj].SubPanoramaObjectList.Bottom,
                        Front: ObjList[obj].SubPanoramaObjectList.Front,
                        Left: ObjList[obj].SubPanoramaObjectList.Left,
                        Right: ObjList[obj].SubPanoramaObjectList.Right,
                        Top: ObjList[obj].SubPanoramaObjectList.Top
                    }
                }

                //AR
                if (ObjList[obj].ARObjectList) {
                    objsAttributes.ARDpi = ObjList[obj].ARDpi;
                    objsAttributes.ARImageMarked = ObjList[obj].ARImageMarked;
                    objsAttributes.ARMarkedFileName = ObjList[obj].ARMarkedFileName;
                    objsAttributes.ARMarkedFileNameMapping = ObjList[obj].ARMarkedFileNameMapping;
                    objsAttributes.ARObjectList = ObjList[obj].ARObjectList.WhiteboardObject;
                }

                HamaList[page].Objects[obj] = objsAttributes;

            }
        }
    }
}

function typeNameSetting(typeName) {
    switch (typeName) {
        //曲線
        case 'Hamastar.AddIns.Whiteboard.BrushObjectFormatter':
            return 'BurshPoints';
            break;

        //直線
        case 'Hamastar.AddIns.Whiteboard.LineObjectFormatter':
            return 'LinePoint';
            break;

        //矩形
        case 'Hamastar.AddIns.Whiteboard.RectangleObjectFormatter':
            return 'RectangleObject';
            break;

        //圓
        case 'Hamastar.AddIns.Whiteboard.EllipseObjectFormatter':
            return 'EllipseObject';
            break;

        //箭頭
        case 'Hamastar.AddIns.Whiteboard.ArrowLineObjectFormatter':
            return 'ArrowLinePoint';
            break;

        //圖片
        case 'Hamastar.AddIns.Whiteboard.PictureObjectFormatter':
            return 'ImageLayer';
            break;

        //影片
        case 'Hamastar.AddIns.Whiteboard.VideoObjectFormatter':
            return 'VideoLayer';
            break;

        //正確框
        case 'Hamastar.AddIns.Whiteboard.InteractiveTouchRectangleObjectFormatter':
            return 'CorrectBox';
            break;

        //錯誤框
        case 'Hamastar.AddIns.Whiteboard.LimitedRangeObjectFormatter':
            return 'ErrorBox';
            break;

        //連接器
        case 'Hamastar.AddIns.Whiteboard.ConnectorObjectFormatter':
            return 'Connector';
            break;

        //遮罩貼紙
        case 'Hamastar.AddIns.Whiteboard.MaskingRectangleObjectFormatter':
            return 'MaskingLayer';
            break;

        //塗抹
        case 'Hamastar.AddIns.Whiteboard.ErasingPictureObjectFormatter':
            return 'ErasingPicture';
            break;

        //嵌入網頁
        case 'Hamastar.AddIns.Whiteboard.HtmlScriptObjectFormatter':
            return 'HtmlScriptObject';
            break;

        //另開附件
        case 'Hamastar.AddIns.Whiteboard.AdditionalFileObjectFormatter':
            return 'AdditionalFileObject';
            break;

        //全文朗讀
        case 'Hamastar.AddIns.Whiteboard.SequencePlayObjectFormatter':
            return 'SequencePlayObject';
            break;

        //連結
        case 'Hamastar.AddIns.Whiteboard.HyperLinkObjectFormatter':
            return 'HyperLinkObject';
            break;

        //360
        case 'Hamastar.AddIns.Whiteboard.RotationImageObjectFormatter':
            return 'RotationImageObject';
            break;

        //幻燈片
        case 'Hamastar.AddIns.Whiteboard.SlideshowObjectFormatter':
            return 'SlideshowObject';
            break;

        //動態平移
        case 'Hamastar.AddIns.Whiteboard.PictureScrollObjectFormatter':
            return 'ScrollObject';
            break;

        //輔助視窗
        case 'Hamastar.AddIns.Whiteboard.IntroductionObjectFormatter':
            return 'IntroductionObject';
            break;

        //動畫感應區
        case 'Hamastar.AddIns.Whiteboard.AnimationGroupPlayerObjectFormatter':
            return 'AnimationGroup';
            break;

        //720
        case 'Hamastar.AddIns.Whiteboard.PanoramaObjectFormatter':
            return 'PanoramaObject';
            break;

        //測驗題組
        case 'Hamastar.AddIns.Whiteboard.GroupRectangleObjectFormatter':
            return 'GroupRectangleObject';
            break;

        //送出試卷
        case 'Hamastar.AddIns.Whiteboard.ExamFinishRectangleObjectFormatter':
            return 'ExamFinish';
            break;

        //文字框
        case 'Hamastar.AddIns.Whiteboard.TextObjectFormatter':
            return 'TextObject';
            break;

        //說話框
        case 'Hamastar.AddIns.Whiteboard.DialogFrameObjectFormatter':
            return 'DialogFrame';
            break;

        //gif圖片
        case 'Hamastar.AddIns.Whiteboard.AnimationPictureObjectFormatter':
            return 'AnimationPic';
            break;

        //AR
        case 'Hamastar.AddIns.Whiteboard.ARObjectFormatter':
            return 'ARObject';
            break;

        //註記
        case 'Hamastar.AddIns.Whiteboard.MarkObjectFormatter':
            return 'MarkObject';
            break;

        //文字彈跳視窗
        case 'Hamastar.AddIns.Whiteboard.TextPopupObjectFormatter':
            return 'TextPopup';
            break;

        //另開附件-子物件
        case 'Hamastar.AddIns.Whiteboard.EmptyObjectFormatter':
            return 'EmptyObject';
            break;
    }
}

function ScrollIntro(obj) {
    var ObjList = [];
    if (obj != undefined) {
        if (obj.Rects != undefined) {
            if (obj.Rects.length == undefined) {
                ObjList = [obj.Rects];
            } else {
                for (var i = 0; i < obj.Rects.length; i++) {
                    ObjList[i] = obj.Rects[i];
                }
            }
        } else {
            ObjList = undefined;
        }
    } else {
        ObjList = undefined;
    }
    return ObjList;
}

//ARGB轉換成Hex
function intToRGB(color) {
    if (color == '0') {
        return '';
    } else {
        return '#' + ('000000' + (color & 0xFFFFFF).toString(16)).slice(-6);
    }
}

//取得透明度
function intToA(color) {
    if (color == '0') {
        return 1;
    } else {
        return ((color >> 24) & 255) / 255;
    }
}

function intToRGBA(color) {
    color >>>= 0;
    var b = color & 0xFF,
        g = (color & 0xFF00) >>> 8,
        r = (color & 0xFF0000) >>> 16,
        a = ( (color & 0xFF000000) >>> 24 ) / 255 ;
    return "rgba(" + [r, g, b, a].join(",") + ")";
}

//判斷標題是否為空字串
function titleSet(str) {
    if (str.split('<Run>')[1] != undefined) {
        str = str.split('<Run>')[1].split('</Run>')[0];
    } else {
        str = '';
    }
    return str;
}

function PreloadImg(src) {
    if(src == undefined) {
        return;
    }

    var Img = {
        srcImg: null,
        Loaded: false
    }
    var LoadImg = new Image();
    LoadImg.src = 'Resource/' + src;
    Img.srcImg = LoadImg;

    LoadImg.onload = function () { 
        Img.Loaded = true;
    }

    return Img;
}