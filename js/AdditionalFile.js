//另開附件、全文朗讀

var isSequence = false;

var additionalFile = {
    saveList: []
};

function AdditionalCanvasSet(obj, page, isIntro) {
    // getPagePosition(page);
    var scale = MainObj.Scale;
    var Left = obj.Left * scale + MainObj.CanvasL;
    var Top = obj.Top * scale + MainObj.CanvasT;
    var Width = obj.Width * scale;
    var Height = obj.Height * scale;

    // Left = getNewLeft(Left);

    $('#canvas')[0].class = 'canvasObj';
    $('#canvas')[0].width = Width;
    $('#canvas')[0].height = Height;
    $('#canvas').css({
        'left': Left,
        'top': Top
    });

    var canvas = $('#canvas')[0];
    var cxt = canvas.getContext('2d');

    var canvasID = obj.Identifier;
    canvas.id = canvasID;

    drawButtonImage(obj, cxt, Width, Height);

    AdditionalFileSet(obj, page, false, isIntro);

}

function SequencePlayCanvas(obj, page) {
    var scale = MainObj.Scale;
    var Left = obj.Left * scale + MainObj.CanvasL;
    var Top = obj.Top * scale + MainObj.CanvasT;
    var Width = obj.Width * scale;
    var Height = obj.Height * scale;

    $('#canvas')[0].class = 'canvasObj';
    $('#canvas')[0].width = Width;
    $('#canvas')[0].height = Height;
    $('#canvas').css({
        'left': Left,
        'top': Top
    });

    var canvas = $('#canvas')[0];
    var cxt = canvas.getContext('2d');

    var canvasID = 'Seq' + obj.Identifier + page;
    canvas.id = canvasID;

    drawButtonImage(obj, cxt, Width, Height);

    $('#' + canvasID).click(function (e) {
        e.preventDefault();
        NewSequenceAudio(obj.PlayItemsList.PlayItem, page, obj);
    })
}

//另開附件判斷
function AdditionalFileSet(obj, page, panorama, isIntro, Show) {
    var type;
    if (obj.PathFileName) {
        type = obj.PathFileName.split('.')[1].toLowerCase();
    } else {
        return;
    }

    switch (type) {
        //插入音檔
        case 'mp3':
        case 'm4a':
            if(Show) {
                if (isSequence) {
                    $('#Voice').remove();
                    isSequence = false;
                }

                // 點擊當下的要暫停(色塊取消)，再點才撥放(色塊打開)
                if ($('.' + obj.Identifier)[0]) {
                    if ($('.' + obj.Identifier)[0].paused) {
                        SequenceBrush(obj);
                        $('.' + obj.Identifier)[0].play();
                    } else {
                        BrushReset(page, isIntro);
                        $('.' + obj.Identifier)[0].pause();
                    }
                    return;
                }

                NewAudio(obj, obj.PathFileName, page, isIntro);
            } else { 
                $('#' + obj.Identifier).click(function (e) {
                    e.preventDefault();
                    if (isSequence) {
                        $('#Voice').remove();
                        isSequence = false;
                    }
    
                    // 點擊當下的要暫停(色塊取消)，再點才撥放(色塊打開)
                    if ($('.' + obj.Identifier)[0]) {
                        if ($('.' + obj.Identifier)[0].paused) {
                            SequenceBrush(obj);
                            $('.' + obj.Identifier)[0].play();
                        } else {
                            BrushReset(page, isIntro);
                            $('.' + obj.Identifier)[0].pause();
                        }
                        return;
                    }
    
                    NewAudio(obj, obj.PathFileName, page, isIntro);
                })
            }
            break;

            //另開檔案
        case 'pdf':
        case 'ppt':
        case 'pptx':
        case 'doc':
        case 'docx':
            if(Show) {
                window.open((obj.IsPatch == 'true' ? 'Patch/' : 'Resource/') + obj.PathFileName);
            } else { 
                $('#' + obj.Identifier).click(function (e) {
                    e.preventDefault();
                    window.open((obj.IsPatch == 'true' ? 'Patch/' : 'Resource/') + obj.PathFileName);
                })
            }
            break;

            //圖片定位
        case 'png':
        case 'jpg':
            if(Show) {
                NewImagePosition(obj, page, isIntro);
            } else {
                $('#' + obj.Identifier).click(function (e) {
                    e.preventDefault();
                    if (!panorama) {
                        NewImagePosition(obj, page, isIntro);
                    } else {
                        PanoramaImagePosition(obj, page);
                    }
                })
            }
            break;

            //影片定位
        case 'mp4':
            if(Show) {
                NewVideoPosition(obj, page);
            } else {
                $('#' + obj.Identifier).click(function (e) {
                    e.preventDefault();
                    NewVideoPosition(obj, isIntro);
                })
            }
            break;
    }

}

//插入音檔
function NewAudio(obj, audioSrc, page, isIntro) {
    if ($('#Voice')[0] != undefined) {
        $('#Voice').remove();
    }

    $('<audio/>', {
        id: 'Voice',
        class: obj.Identifier,
        src: (obj.IsPatch == 'true' ? 'Patch/' : 'Resource/') + audioSrc
    }).appendTo('#HamastarWrapper');

    BrushReset(page, isIntro);
    SequenceBrush(obj);
    $('#Voice')[0].volume = 1;
    $('#Voice')[0].play();

    if (isIntro) {
        $("#Voice").addClass('introVoice');
    }

    $('#Narration').remove()

    $("#Voice").on('ended', function () {
        BrushReset(page, isIntro);
        // done playing
        $(this).remove();
        if (HamaList[page].PlayBackgroundMusic == '1') {
            BGMusicPlay();
        }
        // if ($('#Narration')[0]) {
        //     $('#Narration')[0].play();
        // }
    });

    // BGMusicPause();
}

//全文朗讀
function NewSequenceAudio(obj, page, sequence) {
    if (isSequence == sequence) {
        if($('#Voice').length > 0) {
            if ($('#Voice')[0].paused) {
                var voiceObj;
                HamaList[page].Objects.filter(function (res) {
                    if (res.Identifier == $('#Voice')[0].className) {
                        voiceObj = res;
                    }
                });
                SequenceBrush(voiceObj);
                $('#Voice')[0].play();
            } else {
                BrushReset(page);
                $('#Voice')[0].pause();
            }
        }
        return;
    }
    isSequence = sequence;

    var HamaObj = HamaList[page].Objects;
    var SequenceSrc = [];
    var AudioNum = 0;

    //將全文朗讀src的順序存在SequenceSrc裡面
    if (obj.length == undefined) obj = [obj];
    for (var i = 0; i < obj.length; i++) {
        for (var x = 0; x < HamaObj.length; x++) {
            if (obj[i].Identifier == HamaObj[x].Identifier) {
                SequenceSrc[i] = {};
                SequenceSrc[i].PathFileName = HamaObj[x].PathFileName;
                SequenceSrc[i].Identifier = HamaObj[x].Identifier;
                SequenceSrc[i].PlayingStateShow = HamaObj[x].PlayingStateShow;
                if (HamaObj[x].PlayingStateShow == '1') {
                    SequenceSrc[i].Brush = HamaObj[x].Brush;
                }
            }
        }
    }

    if ($('#Voice')[0] != undefined) {
        $('#Voice').remove();
    }

    $('<audio/>', {
        id: 'Voice',
        class: SequenceSrc[AudioNum].Identifier,
        src: (obj.IsPatch == 'true' ? 'Patch/' : 'Resource/') + SequenceSrc[AudioNum].PathFileName
    }).appendTo('#HamastarWrapper');

    BrushReset(page);
    SequenceBrush(SequenceSrc[AudioNum]);
    $('#Voice')[0].volume = 1;
    $('#Voice')[0].play();

    $("#Voice").on('ended', function () {
        BrushReset(page);
        AudioNum++;
        if (AudioNum < SequenceSrc.length) {
            SequenceBrush(SequenceSrc[AudioNum]);
            $('#Voice').attr('class', SequenceSrc[AudioNum].Identifier);
            $('#Voice')[0].src = (obj.IsPatch == 'true' ? 'Patch/' : 'Resource/') + SequenceSrc[AudioNum].PathFileName;
            $('#Voice')[0].volume = 1;
            $('#Voice')[0].play();
        } else {
            $(this).remove();
            isSequence = false;
        }
    });
}

//全文朗讀色塊
function SequenceBrush(list) {
    if (list.PlayingStateShow == '1') {
        var canvas = $('#' + list.Identifier)[0];
        var cxt = canvas.getContext('2d');
        cxt.globalAlpha = 0.2;
        cxt.fillStyle = list.Brush;
        if (list.Brush != '#ffffff') {
            cxt.fillRect(0, 0, canvas.width, canvas.height); //填滿
        }

        HamaList[MainObj.NowPage].Objects.map(function (obj) {
            if (obj.ParentID == list.Identifier) {
                var canvasTemp = $('#' + obj.Identifier)[0];
                var cxtTemp = canvasTemp.getContext('2d');
                cxtTemp.globalAlpha = 0.2;
                cxtTemp.fillStyle = obj.Brush;
                if (obj.Brush != '#ffffff') {
                    cxtTemp.fillRect(0, 0, canvasTemp.width, canvasTemp.height); //填滿
                }
            } else if (obj.FormatterType == 'IntroductionObject') {
                obj.IntroductionObjectList.IntroductionObject.map(function (res) {
                    if (res.ParentID == list.Identifier) {
                        var canvasTemp = $('#' + res.Identifier)[0];
                        var cxtTemp = canvasTemp.getContext('2d');
                        cxtTemp.globalAlpha = 0.2;
                        cxtTemp.fillStyle = intToRGB(res.Brush);
                        if (res.Brush != '#ffffff') {
                            cxtTemp.fillRect(0, 0, canvasTemp.width, canvasTemp.height); //填滿
                        }
                    }
                });
            } else if (obj.FormatterType == 'AdditionalFileObject') {
                if (obj.Identifier == list.Identifier){
                    var canvasTemp = $('#' + obj.Identifier)[0];
                    var cxtTemp = canvasTemp.getContext('2d');
                    cxtTemp.globalAlpha = 0.2;
                    cxtTemp.fillStyle = obj.Brush;
                    if (obj.Brush != '#ffffff') {
                        cxtTemp.fillRect(0, 0, canvasTemp.width, canvasTemp.height); //填滿
                    }

                    $(canvas).css({
                        'border-style': obj.BorderStyle,
                        'border-color': obj.BorderColorAlpha,
                        'border-width': obj.BorderWidth,
                    });
                }
            }
        })

    }
}

//全文朗讀其他色塊變回透明
function BrushReset(page, isIntro) {
    var obj = HamaList[page].Objects;
    var canvas, cxt;
    for (var i = 0; i < obj.length; i++) {
        if (obj[i].PlayingStateShow == '1') {
            canvas = $('#' + obj[i].Identifier)[0];
            cxt = canvas.getContext('2d');
            cxt.clearRect(0, 0, canvas.width, canvas.height);
            drawButtonImage(obj[i], cxt, canvas.width, canvas.height);

            HamaList[MainObj.NowPage].Objects.map(function (res) {
                if (res.ParentID == obj[i].Identifier) {
                    var canvasTemp = $('#' + res.Identifier)[0];
                    var cxtTemp = canvasTemp.getContext('2d');
                    cxtTemp.clearRect(0, 0, canvasTemp.width, canvasTemp.height);
                } else if(res.FormatterType == 'AdditionalFileObject') {
                    $(canvas).css({
                        'border-style': '',
                        'border-color': '',
                        'border-width': ''
                    });
                }
            });
        }
    }

    obj.map(function (res) {
        if (res.FormatterType == 'IntroductionObject') {
            res.IntroductionObjectList.IntroductionObject.map(function (intro) {
                if ($('#' + intro.Identifier)[0]) {
                    canvas = $('#' + intro.Identifier)[0];
                    cxt = canvas.getContext('2d');
                    cxt.clearRect(0, 0, canvas.width, canvas.height);
                    drawButtonImage(intro, cxt, canvas.width, canvas.height);
                }
            });
        } 
    });
}

//圖片定位
function NewImagePosition(obj, page, isIntro) {
    if ($('#Locaton' + obj.Identifier)[0] == undefined) {

        AdditionalReset();
        getPagePosition(page);

        NewCanvas(obj);

        var canvas = $('#canvas')[0];
        canvas.id = 'Locaton' + obj.Identifier;

        if (obj.IsPatch == 'true') {
            $(canvas).addClass('IsPatch');
        }

        var dragOffsetLeft = 0,
            dragOffsetTop = 0;
        if (ZoomList.dragCanvasPosition.isdrag) {
            dragOffsetLeft = ZoomList.dragCanvasPosition.left;
            dragOffsetTop = ZoomList.dragCanvasPosition.top;
        }

        var scale = MainObj.Scale;
        var Left = (obj.Position.X * scale * ToolBarList.ZoomScale) + (ToolBarList.ZoomScale > 1 ? MainObj.CanvasL * ToolBarList.ZoomScale - ZoomList.DistX : MainObj.CanvasL);
        var Top = (obj.Position.Y * scale * ToolBarList.ZoomScale) + (ToolBarList.ZoomScale > 1 ? MainObj.CanvasT * ToolBarList.ZoomScale - ZoomList.DistY : MainObj.CanvasT);
        var Width = obj.Position.W * scale * ToolBarList.ZoomScale;
        var Height = obj.Position.H * scale * ToolBarList.ZoomScale;
    
        Left += ZoomList.IsAreaZoom? ZoomList.AreaDistX : 0;
        Top +=  ZoomList.IsAreaZoom? ZoomList.AreaDistY : 0;

        Left = getNewLeft(Left);

        var img = new Image();
        img.onload = function () {

            //另開圖片附件，開在正中間
            if (obj.Position.X == undefined) {
                Width = img.width * MainObj.Scale;
                Height = img.height * MainObj.Scale;
                Left = ($('#HamastarWrapper').width() - Width) / 2;
                Top = ($('#HamastarWrapper').height() - Height) / 2;
            }
            canvas.width = Width;
            canvas.height = Height;
            $('#' + canvas.id).addClass('canvasPosition');
            $('#' + canvas.id).attr('parent', obj.Identifier);

            $('#' + canvas.id).css({
                'left': Left + dragOffsetLeft,
                'top': Top + dragOffsetTop,
            });
            if (isIntro) {
                $(canvas).css('z-index', 1000).addClass('introImage').addClass('inside');

                var moveLeft = $($('#' + obj.Identifier)[0].parentNode).offset().left,
                    moveTop = $($('#' + obj.Identifier)[0].parentNode).offset().top ;

                if($($('#' + obj.Identifier)[0].parentNode).attr("Zoom")) {
                    moveLeft -=(ZoomList.Left - MainObj.CanvasL) ;
                    moveTop -= (ZoomList.Top - MainObj.CanvasT);
                } 

                $('#' + canvas.id).css({
                    'left':Left + moveLeft + (dragOffsetLeft ? (dragOffsetLeft) : 0),
                    'top':Top +  moveTop + (dragOffsetTop ? (dragOffsetTop) : 0)
                });
            }

            if (ToolBarList.ZoomScale > 1) {
                $(canvas).attr({
                    tempwidth: obj.Position.W * scale,
                    tempheight: obj.Position.H * scale,
                    left: obj.Position.X * scale + MainObj.CanvasL,
                    top: obj.Position.Y * scale + MainObj.CanvasT
                });
            }

            var cxt = canvas.getContext('2d');

            cxt.drawImage(img, 0, 0, Width, Height);
            invertCanvas(cxt, Width, Height);

            //background frame
            if (obj.Background == 'true') {
                DrawFrame(canvas, obj, Width, Height);
            }

            //音檔
            if (obj.AudioPathFileName) {
                NewAudio(obj, obj.AudioPathFileName, page);
            }

            $('#' + canvas.id).click(function (e) {
                e.preventDefault();
                AdditionalReset(canvas.id);

                if (obj.AudioPathFileName != "") {
                    $('#Voice').remove();
                }

                if(HamaList[page].PlayBackgroundMusic == '1') {
                    BGMusicPlay();
                }
            });
        }
        img.src = (obj.IsPatch == 'true' ? 'Patch/' : 'Resource/') + obj.PathFileName;
    } else {
        $('#Locaton' + obj.Identifier).remove();

        if(HamaList[page].PlayBackgroundMusic == '1') {
            BGMusicPlay();
        }
    }
}

//影片定位
function NewVideoPosition(obj, isIntro) {
    if ($('#Video' + obj.Identifier)[0] == undefined) {
        AdditionalReset();
        var scale = MainObj.Scale;
        var Left = MainObj.CanvasL;
        var Top = MainObj.CanvasT;
        var Width = $('#CanvasGallery').width();
        var Height = $('#CanvasGallery').height();
        var ID;

        if (obj.Position.X || obj.Position.Y || obj.Position.H || obj.Position.W) {
            Left = obj.Position.X * scale + MainObj.CanvasL;
            Top = obj.Position.Y * scale + MainObj.CanvasT;
            Width = obj.Position.W * scale;
            Height = obj.Position.H * scale;
        }

        var Video = document.createElement('video');
        Video.id = 'Video' + obj.Identifier;
        Video.width = Width;
        Video.height = Height;
        $('body').append(Video);

        $(Video)
            .addClass('videoPosition')
            .attr('Identifier', obj.Identifier)
            .attr('controls', true)
            .css({
                'position': 'absolute',
                'left': Left,
                'top': Top,
                'object-fit': 'fill',
                'z-index': 99
            })
            .on('fullscreenchange', function() {
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

        if (isIntro) {
            $(Video).css('z-index', 1000);
        }

        //background frame
        //如果有frame要新建一個canvas重疊在影片上面，因此會擋到影片
        //所以要將影片click事件綁在canvas上，不然會點不到影片
        if (obj.Background == 'true') {
            var canvas = document.createElement('canvas');
            canvas.id = 'frame' + Video.id;
            canvas.width = Width;
            canvas.height = Height;
            $('body').append(canvas);
            $('#' + canvas.id).attr('class', 'videoPosition');
            $('#' + canvas.id).css({
                'position': 'absolute',
                'left': Left,
                'top': Top
            })
            DrawFrame(canvas, obj, Width, Height);

            ID = canvas.id;
        } else {
            ID = Video.id;
        }

        Video.src = (obj.IsPatch == 'true' ? 'Patch/' : 'Resource/') + obj.PathFileName;
        Video.play();
        $('#' + ID).click(function (e) {
            e.preventDefault();
            if (Video.paused) {
                Video.play();
            } else {
                Video.pause();
            }
        });

        //是否結束後淡出
        if (obj.Fadeout == '1') {
            $('#' + Video.id).on('ended', function () {
                // done playing
                $(this).fadeOut(400, function () {
                    $('.videoPosition').remove();
                    $('.videoClose').remove();
                })
            });
        }

        NewCanvas();
        var closeBtn = $('#canvas')[0],
            closeBtnCxt = closeBtn.getContext('2d');

        closeBtn.id = 'videoClose';
        closeBtn.width = 30 * MainObj.Scale;
        closeBtn.height = 30 * MainObj.Scale;
        $('body').append(closeBtn);
        $(closeBtn)
            .attr('Identifier', obj.Identifier)
            .attr('class', 'videoClose')
            .css({
                'left': Width + Left - closeBtn.width,
                'top': Top,
                'z-index': 1000
            })
            .click(function () {
                $(this).remove();
                $('#Video' + $(this).attr('Identifier')).remove();
            });
        var closeImage = new Image();
        closeImage.onload = function () {
            closeBtnCxt.drawImage(this, 0, 0, closeBtn.width, closeBtn.height);
        };
        closeImage.src = 'css/Images/Close.png';
    }
}

//畫background frame(黑框)
function DrawFrame(canvas, obj, width, height) {
    var cxt = canvas.getContext('2d');
    var PixelSize = obj.PixelSize * 2;
    width = width - PixelSize;
    height = height - PixelSize;

    borderstyle(canvas.id, obj.BorderStyle, '#000000', obj.PixelSize);
    cxt.strokeRect(obj.PixelSize, obj.PixelSize, width, height);
}

//圖影定位物件初始化
function AdditionalReset(canvasID) {

    //如果為多張並存，則不用remove掉
    //只需remove掉自己
    getPage();
    if (Quiz.Page >= 0 && Quiz.Page < HamaList.length) {
        var obj = HamaList[Quiz.Page].Objects;
        for (var i = 0; i < obj.length; i++) {
            if (obj[i].SingleSelect == '1') {
                $('#Locaton' + obj[i].Identifier).remove();
                if (obj[i].AudioPathFileName != "") {
                    // $('#Voice').remove();
                }
            }
        }
        $('#' + canvasID).remove();

        if (fullScreen) {
            $('.videoPosition').remove();
            $('.videoClose').remove();
        } else {
            videoFullscreen();
            if (!videoMainobj.fullscreen) {
                $('.videoPosition').remove();
                $('.videoClose').remove();
            }
        }
    }
}

//另開附件-子物件設置
function setEmptyObject(obj) {
    var scale = MainObj.Scale;
    var Left = obj.Left * scale + MainObj.CanvasL;
    var Top = obj.Top * scale + MainObj.CanvasT;
    var Width = obj.Width * scale;
    var Height = obj.Height * scale;

    $('#canvas')[0].class = 'canvasObj';
    $('#canvas')[0].width = Width;
    $('#canvas')[0].height = Height;
    $('#canvas').css({
        'left': Left,
        'top': Top
    });

    var canvas = $('#canvas')[0];
    var cxt = canvas.getContext('2d');

    canvas.id = obj.Identifier;

    drawButtonImage(obj, cxt, Width, Height);

    $(canvas).click(function (e) {
        e.preventDefault();
        $('#' + obj.ParentID).click();
    })
}

function replyAdditional() {
    additionalFile.saveList.map(function (obj) {
        if (obj.page == MainObj.NowPage) {
            NewCanvas(obj);
            AdditionalCanvasSet(obj, obj.page);
            $('#' + obj.Identifier).addClass('AdditionalObj');
        }
    });
}