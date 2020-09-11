//動畫
var Animate = {
    Sequence: 0, //動畫順序
    Click: false, //點第二下是中斷前一個動畫並開始下一個動畫，用此參數判斷是點第幾下
    NoGallery: false, //判斷是否翻頁
    Multiple: false //多個動畫
}

var animateTypes = ['msoAnimEffectFly', 'msoAnimEffectFade', 'msoAnimEffectRiseUp', 'msoAnimEffectExpand', 'msoAnimEffectZoom', 'msoAnimEffectPinwheel', 'msoAnimEffectSwivel', 'msoAnimEffectFloat' || AnimEffect == 'msoAnimEffectBoomerang' || AnimEffect == 'msoAnimEffectSpinner', 'msoAnimEffectTeeter', 'msoAnimEffectSpin', 'msoAnimEffectGrowShrink', 'msoAnimEffectTransparency', 'msoAnimEffectWipe', 'msoAnimEffectAscend']

//動畫感應區設定
function AnimationGroupSet(obj, page) {

    Animate.Sequence = 0;
    Animate.Click = false;
    Animate.NoGallery = true;

    var list;

    $(HamaList[page].AnimationSet.AnimationSet).each(function () {
        if (this.AnimationGroupPlayerIdentifier == obj.AnimationGroupIdentifier) {
            list = this;
        }
    })

    if (list == undefined) return;

    if (list.Sequence == '-1' || list.AnimationSetTriggerType == 'Group') {
        //Sequence為-1時，表示無順序，則是由動畫感應區控制動畫
        //此時才要將感應區生成canvas，並將click事件綁在感應區上
        NewCanvas(obj);
        var canvas = $('#canvas')[0];
        canvas.id = obj.AnimationGroupIdentifier;
        canvas.width = obj.Width * MainObj.Scale;
        canvas.height = obj.Height * MainObj.Scale;
        var cxt = canvas.getContext('2d');
        drawButtonImage(obj, cxt, canvas.width, canvas.height);
        $(canvas)
            .css({
                'left': obj.Left * MainObj.Scale + MainObj.CanvasL,
                'top': obj.Top * MainObj.Scale + MainObj.CanvasT
            })
            .unbind('click')
            .click(function (e) {
                e.preventDefault();
                AnimateClick(page);
            });

    } else {
        //每次都先把HamaStar的click事件砍掉，才不會重複click事件
        //動畫click事件是綁在HamaStar上
        $('#HamastarWrapper')
            .unbind('click')
            .click(function (e) {
                e.preventDefault();
                AnimateEvent(page);
            })
    }
}

//動畫點擊事件，若Animate.NoGallery為true，則為點擊而不是翻頁
//從GalleryEvent.js的mouseup事件判斷
function AnimateEvent(page) {
    if (Animate.NoGallery) {
        Animate.Click = !Animate.Click;
        AnimateEnd(page);
        AnimateClick(page);
    }
}

//動畫物件建立
function AnimationObjSet(obj, page) {
    if (HamaList[page].AnimationSet) {

        var list = HamaList[page].AnimationSet.AnimationSet;
        if (!list) return;
        if (!list.length) {
            list = [list];
        }

        Animate.Multiple = false;

        for (var i = 0; i < list.length; i++) {
            if (list[i].AnimationList) {
                if (list[i].AnimationList.WhiteboardObjectIdentifier != undefined) {
                    if (obj.Identifier == list[i].AnimationList.WhiteboardObjectIdentifier) {
                        if (list[i].AnimationList.Animation) {
                            AnimateCanvas(page, obj, list[i].AnimationList);
                            if (list[i].AnimationSetTriggerType == 'Auto') {
                                AnimateClick(page, true, i);
                            }
                            break;
                        }
                    }
                } else {
                    for (var j = 0; j < list[i].AnimationList.length; j++) {

                        if (obj.Identifier == list[i].AnimationList[j].WhiteboardObjectIdentifier) {
                            list[i].AnimationList[j].Multiple = Animate.Multiple;
                            if (!Animate.Multiple) {
                                AnimateCanvas(page, obj, list[i].AnimationList[j]);
                                Animate.Multiple = !Animate.Multiple;
                            }

                            if (list[i].AnimationSetTriggerType == 'Auto') {
                                AnimateClick(page, true, i, j);
                            }
                        }
                    }
                }
            }
        }
    }
}

//用canvas建立有動畫的物件
function AnimateCanvas(page, obj, list) {
    if (!list.Animation) return;
    var scale = MainObj.Scale,
        position, newlist;

    switch (list.AnimEffect) {
        case 'msoAnimEffectTransparency':
            newlist = list.Animation;
            break;
        case 'msoAnimEffectFadedZoom':
        case 'msoAnimEffectGrowAndTurn':
            newlist = list.Animation[1];
            break;
        default:
            newlist = list.Animation.length ? list.Animation[0] : list.Animation;
            break;
    }

    position = getVariable(newlist);

    var Duration = list.Animation.length ? list.Animation[0].Duration : list.Animation.Duration;
    if (!list.Animation.length || Number(Duration) > 0) {
        position.width = obj.Width * scale;
        position.height = obj.Height * scale;
        position.left = obj.Left * scale;
        position.top = obj.Top * scale;
    }
    var canvas = $('#' + obj.Identifier)[0];
    canvas.width = position.width;
    canvas.height = position.height;
    $(canvas)
        .addClass('animationObj')
        .css({
            'left': position.left + MainObj.CanvasL,
            'top': position.top + MainObj.CanvasT
        })

    var cxt = canvas.getContext('2d');

    $(MainObj.AllObjslist).each(function () {
        if (this.Identifier == obj.Identifier) {
            cxt.drawImage(this.Image[0], 0, 0, canvas.width, canvas.height);
            switch (list.AnimEffect) {
                case 'msoAnimEffectFade':
                case 'msoAnimEffectAppear':
                case 'msoAnimEffectRiseUp':
                case 'msoAnimEffectTeeter':
                case 'msoAnimEffectGrowShrink':
                    break;
                case 'msoAnimEffectTransparency':
                    $(canvas).css({
                        'opacity': 1
                    })
                    break;
                case 'msoAnimEffectFly':
                case 'msoAnimEffectExpand':
                case 'msoAnimEffectZoom':
                case 'msoAnimEffectPinwheel':
                case 'msoAnimEffectSwivel':
                case 'msoAnimEffectFloat':
                case 'msoAnimEffectBoomerang':
                case 'msoAnimEffectSpinner':
                case 'msoAnimEffectArcUp':
                    $(canvas).css({
                        'display': 'none',
                        'scale': [position.scaleX, position.scaleY],
                        'opacity': position.alpha,
                        'rotate': position.rotate + 'deg'
                    })
                    break;
                case 'msoAnimEffectFadedZoom':
                case 'msoAnimEffectGrowAndTurn':
                    $(canvas).css({
                        'display': 'none'
                    })
                    break;
                default:
                    $(canvas).css({
                        'scale': [1, 1],
                        'opacity': position.alpha
                    })
                    break;
            }

            if (position.alpha == 0 && (list.AnimEffect == 'msoAnimEffectFade' || list.AnimEffect == 'msoAnimEffectAppear' || list.AnimEffect == 'msoAnimEffectRiseUp')) {
                $(canvas).css('display', 'none');
            }
        }
    })
}

//動畫點擊事件
function AnimateClick(page, auto, num, num2) {

    var list = HamaList[page].AnimationSet.AnimationSet,
        canvas, id;

    if (!list.length) {
        list = [list];
    }

    if (!auto) {
        for (var i = 0; i < list.length; i++) {
            if (list[i].Sequence != '-1') {
                if (Number(list[i].Sequence) == Animate.Sequence) {
                    id = list[i].AnimationList.WhiteboardObjectIdentifier;
                    if (!id) {
                        list[i].AnimationList.map(function (res, index) {
                            id = res.WhiteboardObjectIdentifier;
                            canvas = $('#' + id)[0];
                            AnimateType(res, canvas, page);
                            if (index < list[i].AnimationList.length - 1) {
                                Animate.Sequence--;
                            }
                        })
                    } else {
                        canvas = $('#' + id)[0];
                        AnimateType(list[i].AnimationList, canvas, page);
                    }

                    if (list.length == Animate.Sequence || list.length == 1) {
                        $('#' + list[i].AnimationGroupPlayerIdentifier).remove();
                        Animate.Sequence = 0;
                    }
                    break;
                }
            } else {
                if (event.target.id == list[i].AnimationGroupPlayerIdentifier) {
                    var temp = list[i].AnimationList;
                    if (!temp.length) {
                        temp = [temp];
                    }

                    for (var k = 0; k < temp.length; k++) {
                        canvas = $('#' + temp[k].WhiteboardObjectIdentifier)[0];
                        AnimateType(temp[k], canvas, page);
                    }
                }
            }
        }
    } else {
        id = list[num].AnimationList.WhiteboardObjectIdentifier;

        if (!id) {
            id = list[num].AnimationList[num2].WhiteboardObjectIdentifier;
            list = list[num].AnimationList[num2];
        } else {
            list = list[num].AnimationList;
        }

        canvas = $('#' + id)[0];
        AnimateType(list, canvas, page);
    }
}

//結束前一個動畫，原理是將原本的物件canvas砍掉重建一個新的是最後的位置及大小
function AnimateEnd(page) {

    var list = HamaList[page].AnimationSet.AnimationSet,
        scale = MainObj.Scale,
        obj, newlist;

    list.map(function (res) {
        if (Animate.Sequence > 0) {
            if (Number(res.Sequence) == Animate.Sequence - 1) {

                var id = res.AnimationList.WhiteboardObjectIdentifier;

                $('#' + id).remove();

                $(HamaList[page].Objects).each(function () {
                    if (this.Identifier == id) {
                        obj = this;
                    }
                })

                var AnimEffect = res.AnimationList.AnimEffect;

                if (!AnimEffect) return;

                switch (AnimEffect) {
                    case 'msoAnimEffectRiseUp':
                    case 'msoAnimEffectFloat':
                    case 'msoAnimEffectBoomerang':
                        newlist = res.AnimationList.Animation[2];
                        break;
                    case 'msoAnimEffectSwivel':
                        newlist = res.AnimationList.Animation[5];
                        break;
                    case 'msoAnimEffectTransparency':
                        newlist = res.AnimationList.Animation;
                        break;
                    default:
                        newlist = res.AnimationList.Animation[1];
                        break;
                }

                var position = getVariable(newlist);

                NewCanvas(obj);
                var canvas = $('#canvas')[0];
                canvas.id = obj.Identifier;
                canvas.width = position.width;
                canvas.height = position.height;
                $(canvas).css({
                    'left': position.left + MainObj.CanvasL,
                    'top': position.top + MainObj.CanvasT
                })

                var cxt = canvas.getContext('2d');
                cxt.globalAlpha = position.alpha;

                $(MainObj.AllObjslist).each(function () {
                    if (this.Identifier == obj.Identifier) {
                        if (animateTypes.filter(function (res) {
                            if (AnimEffect == res) {
                                return res;
                            }
                        }).length) {
                            cxt.drawImage(this.Image[0], 0, 0, canvas.width, canvas.height);
                            $(canvas).css({
                                'scale': [position.scaleX, position.scaleY],
                                'rotate': position.rotate + 'deg'
                            })
                        } else {
                            var AnimationPaths = res.AnimationList.Animation[1].AnimationPaths;
                            if (AnimationPaths) {
                                var AnimationPath = AnimationPaths.AnimationPath;
                                AnimationPath = AnimationPath[AnimationPath.length - 1];
                                if (!AnimationPath) {
                                    AnimationPath = [AnimationPaths.AnimationPath];
                                    AnimationPath = AnimationPath[AnimationPath.length - 1];
                                }
                                if (AnimationPath) {
                                    position.left = AnimationPath.X * scale + MainObj.CanvasL;
                                    position.top = AnimationPath.Y * scale + MainObj.CanvasT;
                                    cxt.drawImage(this.Image[0], 0, 0, canvas.width, canvas.height);
                                    $(canvas).css({
                                        'left': position.left,
                                        'top': position.top,
                                        'scale': [position.scaleX, position.scaleY],
                                        'rotate': position.rotate + 'deg'
                                    })
                                }
                            }
                        }
                    }
                })
            }
        }
    })
}

//動畫種類
function AnimateType(list, canvas, page) {

    if (!list.Animation) return;

    var newlist;
    newlist = list.AnimEffect == 'msoAnimEffectTransparency' ? list.Animation : (list.Animation[1] || list.Animation);

    if (newlist.length) {
        newlist = newlist[0];
    }

    var position = getVariable(newlist),
        scale = MainObj.Scale;

    switch (list.AnimEffect) {
        case 'msoAnimEffectFly': //飛入、飛出
            setTimeout(function () {
                $(canvas)
                    .css('display', 'block')
                    .transition({
                        'left': Number(position.left) + MainObj.CanvasL + (MainObj.IsTwoPage ? page % 2 == 0 ? $('#CanvasRight')[0].width : 0 : 0),
                        'top': Number(position.top) + MainObj.CanvasT
                    }, position.duration, 'linear');
            }, position.delay ? position.delay : list.Animation[0].Delay * 1000);
            break;
        case 'msoAnimEffectFade': //淡出
            setTimeout(function () {
                position.alpha == '1' ? $(canvas).fadeIn(position.duration) : $(canvas).fadeOut(position.duration);
                $(canvas)
                    .css('display', 'block')
                    .transition({
                        'left': Number(position.left) + MainObj.CanvasL,
                        'top': Number(position.top) + MainObj.CanvasT,
                        'scale': [position.scaleX, position.scaleY],
                        'width': position.width,
                        'height': position.height
                    }, position.duration, 'linear');
            }, position.delay ? position.delay : list.Animation[0].Delay * 1000);
            break;
        case 'msoAnimEffectAppear': //出現
            setTimeout(function () {
                if (position.alpha === 0) {
                    $(canvas)
                        .css('display', 'none')
                } else {
                    $(canvas)
                        .css('display', 'block')
                        .transition({
                            'opacity': position.alpha,
                            'scale': [position.scaleX, position.scaleY]
                        }, position.duration, 'linear');
                }
            }, position.delay ? position.delay : list.Animation[0].Delay * 1000);
            break;
        case 'msoAnimEffectExpand':
        case 'msoAnimEffectZoom':
        case 'msoAnimEffectPinwheel':
        case 'msoAnimEffectGrowShrink': //展開、放大及旋轉、縮放物件中心、縮放投影片中心、紙風車、放大/縮小水平垂直
            setTimeout(function () {
                $(canvas)
                    .css('display', 'block')
                    .transition({
                        'scale': [position.scaleX, position.scaleY],
                        'opacity': position.alpha,
                        'rotate': position.rotate + 'deg',
                    }, position.duration, 'linear');
            }, position.delay ? position.delay : list.Animation[0].Delay * 1000);
            break;
        case 'msoAnimEffectTransparency': // 透明
            setTimeout(function () {
                $(canvas).css({
                    'display': 'block',
                    'opacity': position.alpha
                });
            }, position.delay);
            break;
        default:
            //弧形向上、心形、水滴、新月、圓形、橄欖球、S型、圖案路徑、弧線、轉向
            //Z字形、正弦波、斜、彎曲、漏斗、彈簧、螺旋...
            if (!list.Multiple && !list.Multiple == undefined) {
                $(canvas).css('display', 'block');
            }

            if (!list.Animation.length) {
                list.Animation = [list.Animation];
            }

            list.Animation.map(function (res) {
                position = getVariable(res);
                var AnimationPaths = res.AnimationPaths;

                if (AnimationPaths) {
                    var AnimationPath = AnimationPaths.AnimationPath;
                    if (AnimationPath) {
                        var pathcount = AnimationPath.length;
                        if (!pathcount) {
                            AnimationPath = [AnimationPath];
                            pathcount = AnimationPath.length;
                        }
                        position.duration = position.duration / (pathcount + 1);
                        AnimationPath.map(function (result) {
                            var pathtype = result.Type;
                            var pathX = Number(result.X) * scale + MainObj.CanvasL;
                            var pathY = Number(result.Y) * scale + MainObj.CanvasT;
                            if (pathtype == "Line") { // 直線
                                $(canvas).transition({
                                    "left": pathX,
                                    "top": pathY,
                                    "width": position.width,
                                    "height": position.height,
                                    "rotate": position.rotate + 'deg',
                                    "scale": [position.scaleX, position.scaleY],
                                    "opacity": position.alpha,
                                    'delay': position.delay
                                }, position.duration, 'linear');
                            } else { // 曲線
                                var ControlPoint = result.ControlPoint;
                                CP0_X = Number(ControlPoint[0].X) * scale + MainObj.CanvasL;
                                CP0_Y = Number(ControlPoint[0].Y) * scale + MainObj.CanvasT;
                                CP1_X = Number(ControlPoint[1].X) * scale + MainObj.CanvasL;
                                CP1_Y = Number(ControlPoint[1].Y) * scale + MainObj.CanvasT;
                                var cpduration = position.duration / 3;
                                $(canvas)
                                    .transition({
                                        "left": CP0_X,
                                        "top": CP0_Y,
                                        "width": position.width,
                                        "height": position.height,
                                        "rotate": position.rotate + 'deg',
                                        "scale": [position.scaleX, position.scaleY],
                                        "opacity": position.alpha,
                                        'delay': position.delay
                                    }, cpduration, 'linear')
                                    .transition({
                                        "left": CP1_X,
                                        "top": CP1_Y,
                                        "width": position.width,
                                        "height": position.height,
                                        "rotate": position.rotate + 'deg',
                                        "scale": [position.scaleX, position.scaleY],
                                        "opacity": position.alpha,
                                        'delay': position.delay
                                    }, cpduration, 'linear')
                                    .transition({
                                        "left": pathX,
                                        "top": pathY,
                                        "width": position.width,
                                        "height": position.height,
                                        "rotate": position.rotate + 'deg',
                                        "scale": [position.scaleX, position.scaleY],
                                        "opacity": position.alpha,
                                        'delay': position.delay
                                    }, cpduration, 'linear');
                            }
                        })
                    }
                } else { //上升、基本旋轉水平、基本旋轉垂直、浮動、迴旋鏢、旋式誘餌、陀螺
                    Animation(list, res, canvas);
                    position = getVariable(res);
                    if (position.duration) {
                        setTimeout(function () {
                            $(canvas)
                                .css('display', 'block')
                                .transition({
                                    'width': position.width,
                                    'height': position.height,
                                    'left': Number(position.left) + MainObj.CanvasL,
                                    'top': Number(position.top) + MainObj.CanvasT,
                                    'scale': [position.scaleX, position.scaleY],
                                    'opacity': position.alpha,
                                    'rotate': position.rotate + 'deg',
                                }, position.duration, 'linear');
                        }, position.delay ? position.delay : list.Animation[0].Delay * 1000);
                    }
                }
            })
            break;
    }
    Animate.Sequence++;
}

//基本變動位移的設定
function Animation(list, obj, canvas) {
    var position = getVariable(obj);

    if((position.delay ? position.delay : list.Animation[0].Delay * 1000) == 0) {
        $(canvas)
        .css('display', 'block')
        .transition({
            'width': position.width,
            'height': position.height,
            'left': Number(position.left) + MainObj.CanvasL,
            'top': Number(position.top) + MainObj.CanvasT,
            'scale': [position.scaleX, position.scaleY],
            'opacity': position.alpha,
            'rotate': position.rotate + 'deg',
            'delay': position.delay
        }, position.duration, 'linear');
    } else {
        setTimeout(function () {
            $(canvas)
                .css('display', 'block')
                .transition({
                    'width': position.width,
                    'height': position.height,
                    'left': Number(position.left) + MainObj.CanvasL,
                    'top': Number(position.top) + MainObj.CanvasT,
                    'scale': [position.scaleX, position.scaleY],
                    'opacity': position.alpha,
                    'rotate': position.rotate + 'deg',
                }, position.duration, 'linear');
        }, position.delay ? position.delay : list.Animation[0].Delay * 1000);
    }
}

//取得變數
function getVariable(obj) {
    var scale = MainObj.Scale;
    var list = {
        'width': obj["BoundaryPoint.Size.Width"] * scale,
        'height': obj["BoundaryPoint.Size.Height"] * scale,
        'left': obj["BoundaryPoint.Location.X"] * scale,
        'top': obj["BoundaryPoint.Location.Y"] * scale,
        'scaleX': obj.ScaleX,
        'scaleY': obj.ScaleY,
        'duration': obj.Duration * 1000,
        'delay': obj.Delay * 1000,
        'alpha': Number(obj.Alpha),
        'rotate': obj.Rotate,
    };
    return list;
}