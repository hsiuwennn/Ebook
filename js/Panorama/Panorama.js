//720

var Panorama = {
    RotationMove: false
};


function PanoramaSet(obj) {

    var div = document.createElement('div');
    div.id = obj.Identifier;
    $(div).addClass('canvasObj');
    $('#HamastarWrapper').append(div);
    $(div).css({
        'position': 'absolute',
        'overflow': 'hidden',
        'cursor': 'move'
    })

    // 上、右、下、左、後、前
    var face = ['Top', 'Right', 'Bottom', 'Left', 'Back', 'Front'];
    var ImageList = [];
    $(face).each(function () {

        var that = this;

        $(obj.ImageList.Images).each(function () {
            if (that == this.Position) {
                var list = {
                    position: this.Position,
                    src: 'Resource/' + this.XFileName
                }

                ImageList.push(list);
            }
        })
    })

    var AttachList = attachCreate(attachSet(obj.SubPanoramaObjectList));

    var width = obj.Width * MainObj.Scale;
    var height = obj.Height * MainObj.Scale;
    var left = obj.Left * MainObj.Scale + MainObj.CanvasL;
    var top = obj.Top * MainObj.Scale + MainObj.CanvasT;

    //jRoom.js(720套件)
    $(function () {
        $(div).jRoom({
            wallWidth: width,
            wallHeight: height,
            wallLeft: left,
            wallTop: top,
            cube: { //背景
                back: ImageList[4].src,
                front: ImageList[5].src,
                left: ImageList[3].src,
                right: ImageList[1].src,
                top: ImageList[0].src,
                bottom: ImageList[2].src
            },
            attach: { //物件
                front: AttachList[0],
                back: AttachList[1],
                left: AttachList[2],
                right: AttachList[3],
                top: AttachList[4],
                bottom: AttachList[5]
            },
            perspectiveRate: 1.24 //視角
        });
    });

    //cardboard按鈕
    $(div).append(
        '<img id="openButton" src="ToolBar/Cardboard-icon.png">'
    );

    $('#openButton')[0].addEventListener('mouseup', function () {
        cardboardInit(obj);
    }, false);
    $('#openButton')[0].addEventListener('touchstart', function () {
        cardboardInit(obj);
    }, false);

}

//720擴充功能物件設置
function attachSet(obj) {

    var list = {
        front: '',
        back: '',
        left: '',
        right: '',
        top: '',
        bottom: ''
    };

    var Front = obj.Front.WhiteboardObject,
        Back = obj.Back.WhiteboardObject,
        Left = obj.Left.WhiteboardObject,
        Right = obj.Right.WhiteboardObject,
        Top = obj.Top.WhiteboardObject,
        Bottom = obj.Bottom.WhiteboardObject;

    var NewObj = [
        Front, Back, Left, Right, Top, Bottom
    ];

    for (var i = 0; i < NewObj.length; i++) {

        if (NewObj[i] != undefined) {

            switch (i) {

                case 0:
                    list.front = SubPanoramaObjectSet(NewObj[i]);
                    break;

                case 1:
                    list.back = SubPanoramaObjectSet(NewObj[i]);
                    break;

                case 2:
                    list.left = SubPanoramaObjectSet(NewObj[i]);
                    break;

                case 3:
                    list.right = SubPanoramaObjectSet(NewObj[i]);
                    break;

                case 4:
                    list.top = SubPanoramaObjectSet(NewObj[i]);
                    break;

                case 5:
                    list.bottom = SubPanoramaObjectSet(NewObj[i]);
                    break;

            }
        }
    }

    return list;
}

//720擴充功能屬性設置
function SubPanoramaObjectSet(obj) {
    var objList = [];

    if (obj.length == undefined) {
        obj = [obj];
    }

    for (var i = 0; i < obj.length; i++) {
        var objsAttributes = {
            FormatterType: typeNameSetting(obj[i].FormatterType),
            Identifier: obj[i].Identifier,
            XFileName: obj[i].XFileName,
            zIndex: obj[i].LayerIndex,
            Width: Number(obj[i]["BoundaryPoint.Bounds.Size.Width"]),
            Height: Number(obj[i]["BoundaryPoint.Bounds.Size.Height"]),
            Left: Number(obj[i]["BoundaryPoint.Bounds.Location.X"]),
            Top: Number(obj[i]["BoundaryPoint.Bounds.Location.Y"]),
            Rotate: Number(obj[i].Rotate),
            BorderColor: intToRGB(obj[i].BorderColor),
            BorderWidth: obj[i].BorderWidth,
            BackgroundXFileName: obj[i].BackgroundXFileName, //背景圖

            //動態平移屬性
            MoveDirection: obj[i].MoveDirection,
            Orientation: obj[i].Orientation,
            Paging: obj[i].Paging,
            PlayingInterval: obj[i].PlayingInterval,
            Size: obj[i].Size,
            Looping: obj[i].Looping,

            //影片屬性
            AutoPlay: obj[i].AutoPlay, //影片自動撥放
            Fadeout: obj[i].Fadeout, //影片淡出
            SliderBar: obj[i].SliderBar, //影片控制列
            VideoFileName: obj[i].VideoFileName, //影片src

            //超連結屬性
            InteractiveType: obj[i].InteractiveType, //超連結類型
            JumpToProcedureSliceIndex: obj[i].JumpToProcedureSliceIndex, //連結跳頁
            PathUrl: obj[i].PathUrl, //超連結網址

            //感應區屬性
            PathFileName: obj[i].PathFileName, //另開附件
            PlayingStateShow: obj[i].PlayingStateShow,

            //圖影定位屬性
            Position: {
                X: obj[i].X,
                Y: obj[i].Y,
                W: obj[i].W,
                H: obj[i].H
            }, //圖影定位位置及大小
            AudioPathFileName: obj[i].AudioPathFileName, //圖影定位音效
            Background: obj[i].Background, //圖影定位bg frame
            SingleSelect: obj[i].SingleSelect, //圖影定位是否單張顯示

            //360屬性
            ImageList: obj[i].ImageList, //圖片清單(360、動態平移、幻燈片)
            AutoplayInterval: obj[i].AutoplayInterval, //360播放每張圖片的時間間隔，單位是毫秒
            PinchZoom: obj[i].PinchZoom, //360物件可否放大至全螢幕
            Autoplay: obj[i].Autoplay, //360物件是否自動撥放
            Looping: obj[i].Looping, //360物件是否循環

            //輔助視窗屬性
            IntroductionObjectList: obj[i].IntroductionObjectList, //輔助視窗物件
            DragEnable: obj[i].DragEnable,

            //幻燈片
            PlayMode: obj[i].PlayMode, //幻燈片類型
            Cutscenes: obj[i].Cutscenes //幻燈片淡出

        }
        objList[i] = objsAttributes;
    }
    return objList;
}

function attachCreate(list) {

    var scale = MainObj.Scale;
    var objList = [list.front, list.back, list.left, list.right, list.top, list.bottom];

    //front, back, left, right, top, bottom
    var attachList = [
        [],
        [],
        [],
        [],
        [],
        [],
    ];

    for (var i = 0; i < objList.length; i++) {

        var that = objList[i];

        if (that != '') {
            $(that).each(function () {

                var obj = this;

                switch (obj.FormatterType) {

                    //影片
                    case 'VideoLayer':
                        PanoramaVideoSet(obj, scale);
                        break;

                    //圖片
                    case 'ImageLayer':
                        NewCanvas();

                        var canvas = $('#canvas')[0];
                        var cxt = canvas.getContext('2d');

                        canvas.id = obj.Identifier;
                        canvas.width = obj.Width * scale;
                        canvas.height = obj.Height * scale;


                        $(canvas).css({
                            'left': obj.Left * scale,
                            'top': obj.Top * scale
                        })

                        var img = new Image();
                        img.onload = function () {
                            cxt.drawImage(img, 0, 0, canvas.width, canvas.height);
                        }
                        img.src = 'Resource/' + obj.XFileName;

                        break;

                    //另開附件
                    case 'AdditionalFileObject':
                        NewCanvas();
                        PanoramaAdditionalSet(obj, MainObj.NowPage);
                        break;

                    //輔助視窗
                    case 'IntroductionObject':
                        NewCanvas();
                        PanoramaIntroSet(obj);
                        break;

                    //360
                    case 'RotationImageObject':
                        NewCanvas();
                        PanoramaRotationImageSet(obj, MainObj.NowPage);
                        break;

                    //幻燈片
                    case 'SlideshowObject':
                        NewCanvas();
                        PanoramaSlideShowSet(obj);
                        break;

                }

                attachList[i].push(obj.Identifier);

            })
        }
    }

    return attachList;

}

//720擴充功能(影片)
function PanoramaVideoSet(obj, scale) {
    var NewVideo = document.createElement('video');
    NewVideo.id = obj.Identifier;
    NewVideo.width = obj.Width * scale;
    NewVideo.height = obj.Height * scale;
    var Left = obj.Left * scale;
    var Top = obj.Top * scale;
    $('#HamastarWrapper').append(NewVideo);

    $(NewVideo)
        .attr('class', 'video')
        .css({
            'position': 'absolute',
            'cursor': 'pointer',
            'left': Left,
            'top': Top
        }).on('fullscreenchange', function() {
            if(!videoFullscreen()) {
                videoMainobj.fullscreen = false;
            }
        }).on('mozfullscreenchange', function() {
            if(!videoFullscreen()) {
                videoMainobj.fullscreen = false;
            }
        }).on('webkitfullscreenchange', function() {
            if(!videoFullscreen()) {
                videoMainobj.fullscreen = false;
            }
        }).on('msfullscreenchange', function() {
            if(!videoFullscreen()) {
                videoMainobj.fullscreen = false;
            }
        });

    NewVideo.src = 'Resource/' + obj.VideoFileName;

    //是否有控制列
    if (obj.SliderBar == 'true') {
        $('#' + NewVideo.id).attr('controls', true);

    } else {
        $('#' + NewVideo.id).click(function () {
            if (this.paused) {
                this.play();
            } else {
                this.pause();
            }
        });
    }

    //是否自動撥放
    if (obj.AutoPlay == '1') {
        $('#' + NewVideo.id).attr('autoplay', true);
    }

    //是否結束後淡出
    if (obj.Fadeout == 'true') {
        $('#' + NewVideo.id).on('ended', function () {
            // done playing
            $(this).fadeOut(400, function () {
                $(this).remove();
            })
        });
    }
}

//720擴充功能canvas設置
function PanoramaAttachCanvasSet(obj) {
    var scale = MainObj.Scale;

    var canvas = $('#canvas')[0];
    var cxt = canvas.getContext('2d');

    canvas.id = obj.Identifier;
    canvas.width = obj.Width * scale;
    canvas.height = obj.Height * scale;



    $(canvas).css({
        'left': obj.Left * scale,
        'top': obj.Top * scale
    })
}

//720擴充功能(輔助視窗)
function PanoramaIntroSet(obj) {

    var scale = MainObj.Scale;
    var Width = obj.Width * scale;
    var Height = obj.Height * scale;

    PanoramaAttachCanvasSet(obj);

    var canvas = $('#' + obj.Identifier)[0];
    var cxt = $('#' + obj.Identifier)[0].getContext('2d');



    drawButtonImage(obj, cxt, Width, Height);

    $('#' + obj.Identifier).click(function () {
        if ($('#IntroDiv' + obj.Identifier)[0] == undefined) {
            Introduction(obj);
        }
    })
}

//720擴充功能(另開附件)
function PanoramaAdditionalSet(obj, page) {

    var scale = MainObj.Scale;
    var Width = obj.Width * scale;
    var Height = obj.Height * scale;

    PanoramaAttachCanvasSet(obj);

    var canvas = $('#' + obj.Identifier)[0];
    var cxt = $('#' + obj.Identifier)[0].getContext('2d');

    drawButtonImage(obj, cxt, Width, Height);

    AdditionalFileSet(obj, page, true);

}

//720擴充功能(圖片定位)
function PanoramaImagePosition(obj, page) {
    if ($('#Locaton' + obj.Identifier)[0] == undefined) {

        AdditionalReset();

        NewCanvas(obj);

        var scale = MainObj.Scale;
        var Left = obj.Position.X * scale;
        var Top = obj.Position.Y * scale;
        var Width = obj.Position.W * scale;
        var Height = obj.Position.H * scale;

        var canvas = $('#canvas')[0];
        canvas.id = 'Locaton' + obj.Identifier;
        canvas.width = Width;
        canvas.height = Height;
        $('#' + canvas.id).attr('class', 'canvasPosition');
        $('#' + canvas.id).css({
            'left': Left,
            'top': Top,
            'z-index': 100
        });

        $('#' + obj.Identifier).parent().append(canvas);

        var cxt = canvas.getContext('2d');
        var img = new Image();
        img.onload = function () {
            cxt.drawImage(img, 0, 0, Width, Height);

            //background frame
            if (obj.Background == 'true') {
                DrawFrame(canvas, obj, Width, Height);
            }

            //音檔
            if (obj.AudioPathFileName != "") {
                NewAudio(obj, obj.AudioPathFileName, page);
            }

            $('#' + canvas.id).click(function () {
                AdditionalReset(canvas.id);

                if (HamaList[page].PlayBackgroundMusic == '1') {
                    BGMusicPlay();
                }

            });
        }
        img.src = 'Resource/' + obj.PathFileName;
    } else {
        $('#Locaton' + obj.Identifier).remove();

        if (HamaList[page].PlayBackgroundMusic == '1') {
            BGMusicPlay();
        }
    }
}

//720擴充功能(360)
function PanoramaRotationImageSet(obj, page) {

    Rotation.SrcNum[page] = 0;

    var scale = MainObj.Scale;
    var Width = obj.Width * scale;
    var Height = obj.Height * scale;

    PanoramaAttachCanvasSet(obj);

    var canvas = $('#' + obj.Identifier)[0];
    var cxt = canvas.getContext('2d');

    var img = new Image();
    img.onload = function () {
        cxt.drawImage(img, 0, 0, Width, Height);
        cxt.globalCompositeOperation = 'copy'; //移除舊圖，只保留新圖，不使用clear的方式，因為畫圖的過程會閃
    }
    img.src = 'Resource/' + obj.ImageList.Images[Rotation.SrcNum[page]].XFileName;

    if (obj.Autoplay == '1') {
        Rotation.Interval[page] = setInterval(function () {
            Rotation.SrcNum[page]++;
            addRotationImg(obj, img, page);
            // console.log(page);
        }, Number(obj.AutoplayInterval));
    }

    //滑鼠點擊事件
    canvas.addEventListener("mousedown", function () {
        Panorama.RotationMove = true; //用Panorama.RotationMove來判斷是否在旋轉360物件，如果是的話720就不旋轉
        RotationDown(obj, img, page);
    }, false);
    if (obj.PinchZoom == '1') {
        canvas.addEventListener("dblclick", function () {
            RotationdbClick(obj, img);
        }, false); //滑鼠雙擊事件
    }
}

//720擴充功能(幻燈片)
function PanoramaSlideShowSet(obj) {
    obj.SrcNum = 0;

    var scale = MainObj.Scale;
    var Width = obj.Width * scale;
    var Height = obj.Height * scale;

    PanoramaAttachCanvasSet(obj);

    var canvas = $('#' + obj.Identifier)[0];
    var cxt = canvas.getContext('2d');

    var img = new Image();
    img.onload = function () {
        cxt.drawImage(img, 0, 0, Width, Height);
        cxt.globalCompositeOperation = 'copy'; //移除舊圖，只保留新圖，不使用clear的方式，因為畫圖的過程會閃
    }
    img.src = 'Resource/' + obj.ImageList.Images[obj.SrcNum].XFileName;

    //幻燈片種類，Auto是自動換，Swipe是滑鼠滑動
    if (obj.PlayMode == 'Auto') {
        SlideShow.Interval.push({
            id: obj.Identifier,
            time: null
        });
        $(SlideShow.Interval).each(function () {
            if (this.id == obj.Identifier) {
                clearInterval(this.time);
                this.time = setInterval(function () {
                    SlideFadeOut(obj, img);
                }, Number(obj.AutoplayInterval));
            }
        })
    } else if (obj.PlayMode == 'Swipe') {
        canvas.addEventListener("mousedown", function () {
            SwipeShowDown(obj, img);
        }, false); //滑鼠點擊事件
    } else if (obj.PlayMode == 'Tap') {
        $(canvas).click(function () {
            SlideFadeOut(obj, img);
        })
    }

}