//輔助視窗
//每一個輔助視窗都用div把整個物件包起來

function IntroCanvasSet(obj, inside) {
  var scale = MainObj.Scale;
  var Left = obj.Left * scale + MainObj.CanvasL;
  var Top = obj.Top * scale + MainObj.CanvasT;
  var Width = obj.Width * scale;
  var Height = obj.Height * scale;

  $('#canvas')[0].class = 'canvasObj';
  var canvasID = obj.Identifier;

  $('#canvas')[0].id = canvasID;
  $('#' + canvasID)[0].width = Width;
  $('#' + canvasID)[0].height = Height;
  $('#' + canvasID).css({
    left: Left,
    top: Top
  });

  var canvas = $('#' + canvasID)[0];
  var cxt = $('#' + canvasID)[0].getContext('2d');


  drawButtonImage(obj, cxt, Width, Height);

  $('#' + obj.Identifier).click(function () {
    if ($('#IntroDiv' + obj.Identifier)[0] == undefined) {
      if (!inside) {
        $('.IntroDiv').remove();
        $('.introImage').remove();
      } else {
        $('.inside').remove();
      }

      Introduction(obj, inside);
    } else {
      var closeID = $('.IntroDiv')[0].id;
      if (closeID == 'IntroDiv' + obj.Identifier) {
        $('#IntroDiv' + obj.Identifier).remove();
      }
    }
  });
}

function Introduction(obj, inside) {
  $('#IntroDiv' + obj.Identifier).remove();

  NewCanvas(obj);

  var scale = MainObj.Scale;
  var objList = obj.IntroductionObjectList.IntroductionObject;

  objList = ObjListSet(objList);

  objList.sort(function (a, b) {
    return a.zIndex - b.zIndex;
  });

  var Width = objList[0].Width * scale * ToolBarList.ZoomScale;
  var Height = objList[0].Height * scale * ToolBarList.ZoomScale;
  objList[0].Left = objList[0].Left * ToolBarList.ZoomScale;
  objList[0].Top = objList[0].Top * ToolBarList.ZoomScale;

  objList[0].Width = objList[0].Width * ToolBarList.ZoomScale;
  objList[0].Height = objList[0].Height * ToolBarList.ZoomScale;
  IntroductionCanvasSet(objList[0], inside);

  var canvasID = 'Introduction' + objList[0].Identifier;
  $('#canvas')[0].id = canvasID;
  $('#' + canvasID).addClass('canvasIntro canvasObj');
  var l = objList[0].Left / ToolBarList.ZoomScale;
  var t = objList[0].Top / ToolBarList.ZoomScale;
  $('#' + canvasID).attr({
    'Identifier': objList[0].Identifier,
    'tempWidth': Width / ToolBarList.ZoomScale,
    'tempHeight': Height / ToolBarList.ZoomScale,
    'left': objList[0].ShiftPointX ? (l * scale + objList[0].ShiftPointX * scale + MainObj.CanvasL) : (l * scale + MainObj.CanvasL),
    'top': objList[0].ShiftPointY ? (t * scale + objList[0].ShiftPointY * scale + MainObj.CanvasT) : (t * scale + MainObj.CanvasT)
  });

  NewDiv(obj, canvasID, inside);

  var canvas = $('#' + canvasID)[0];
  var cxt = canvas.getContext('2d');


  //音檔
  if (obj.AudioPathFileName != '') {
    NewAudio(obj, obj.AudioPathFileName, MainObj.NowPage);
  }

  var img = new Image();
  img.onload = function () {
    cxt.drawImage(img, 0, 0, Width, Height);
    invertCanvas(cxt, Width, Height);

    for (var i = 1; i < objList.length; i++) {
      objList[i].Width = objList[i].Width * ToolBarList.ZoomScale;
      objList[i].Height = objList[i].Height * ToolBarList.ZoomScale;
      NewCanvas(objList[i]);
      $('#canvas').attr('class', 'canvasIntro');
      $('#canvas').addClass('canvasObj');
      $('#IntroDiv' + obj.Identifier).append($('#canvas')[0]);

      $('#canvas').attr({
        'tempWidth': objList[i].Width * scale / ToolBarList.ZoomScale,
        'tempHeight': objList[i].Height * scale / ToolBarList.ZoomScale,
        'left': (objList[i].Left + l) * scale + objList[0].ShiftPointX + MainObj.CanvasL,
        'top': (objList[i].Top + t) * scale + objList[0].ShiftPointY + MainObj.CanvasT
      });

      objList[i].Left = (objList[i].Left + objList[0].ShiftPointX) * ToolBarList.ZoomScale + objList[0].Left;
      objList[i].Top = (objList[i].Top + objList[0].ShiftPointY) * ToolBarList.ZoomScale + objList[0].Top;

      switch (objList[i].FormatterType) {
        //動態平移
        case 'ScrollObject':
          ScrollSet(objList[i], MainObj.NowPage);
          break;

        //圖片
        case 'ImageLayer':
          ObjImageSet(objList[i], inside);
          $('#canvas')[0].id = 'Img' + objList[i].Identifier;
          $('#Img' + objList[i].Identifier).css('pointer-events', 'none');
          break;

        //關閉按鈕
        case 'CloseButton':
          ObjImageSet(objList[i], inside);
          $('#canvas')[0].id = 'Btn' + objList[i].Identifier;
          $('#Btn' + objList[i].Identifier).click(function () {
            //彈跳視窗第一層關閉，全部都要關閉
            var closeID = $('.IntroDiv')[0].id.split('IntroDiv')[1];
            if (closeID == obj.Identifier) {
              $('.IntroDiv').remove();
              $('.introImage').remove();
              $('.videoPosition').remove();
              $('.videoClose').remove();
            } else {
              $('#IntroDiv' + obj.Identifier).remove();
            }

            if (obj.AudioPathFileName != '') {
              $('#Voice').remove();
            }
            $('.introVoice').remove();
          });
          break;

        //video
        case 'VideoObject':
          IntroVideo(objList[i], obj.Identifier);
          break;

        //連結
        case 'HyperLinkObject':
          HyperLinkSet(objList[i]);
          break;

        //感應區
        case 'AdditionalFile':
          objList[i].Brush = objList[i].Brush;
          objList[i].Position.X =
            Number(objList[i].Position.X) + l;
          objList[i].Position.Y =
            Number(objList[i].Position.Y) + t;
          AdditionalCanvasSet(objList[i], MainObj.NowPage, true);
          break;

        //360
        case 'RotationImage':
          RotationImageSet(objList[i], MainObj.NowPage);
          break;

        //塗抹
        case 'ErasingPicture':
          ErasingPictureSetting(i, objList[i]);

          break;

        //輔助視窗
        case 'Introduction':
          IntroCanvasSet(objList[i], obj);
          break;

        //點選題
        case 'CorrectBox':
        case 'ErrorBox':
          IntroQuizSet(objList[i], objList);
          break;

        //文字框
        case 'TextObject':
          IntroTextSet(objList[i], obj.Identifier);
          break;

        //另開附件-子物件
        case 'EmptyObject':
          setEmptyObject(objList[i]);
          break;
      }
      $('#canvas').remove();
    }

    var PagePosition;
    var page = Number(objList[0].XFileName.split('_')[0]) - 1;
    if (MainObj.IsTwoPage) {
      if (!MainObj.IsRight) {
        if (page == MainObj.LeftPage) {
          PagePosition = 'Right';
        } else {
          PagePosition = 'Left';
        }
      } else {
        if (page == MainObj.LeftPage) {
          PagePosition = 'Left';
        } else {
          PagePosition = 'Right';
        }
      }
    }
    if (MainObj.IsTwoPage) {
      $('#IntroDiv' + obj.Identifier).css({
        left: PagePosition === 'Left' ? 0 : getNewLeft($('#CanvasLeft').offset().left) - MainObj.CanvasL,
        top: $('#CanvasLeft').offset().top - MainObj.CanvasT
      });
    } else {
      $('#IntroDiv' + obj.Identifier).css({
        left: $('#CanvasLeft').offset().left - MainObj.CanvasL,
        top: $('#CanvasLeft').offset().top - MainObj.CanvasT
      });
    }
  };
  img.src = 'Resource/' + objList[0].XFileName;

  //是否可拖動視窗
  if (obj.DragEnable == '1') {
    canvas.addEventListener('mousedown', function (e) {
      IntroductionDown(e, canvas, inside);
    }, false);
    canvas.addEventListener('touchstart', function (e) {
      IntroductionDown(e, canvas, inside);
    }, false); //手指點擊事件

    $(canvas).css('cursor', 'move');
  }
}

function NewDiv(obj, canvasID, inside) {
  var IntroDiv = document.createElement('div');
  IntroDiv.id = 'IntroDiv' + obj.Identifier;
  $('#HamastarWrapper').append(IntroDiv);
  $('#' + IntroDiv.id).attr('class', 'IntroDiv');
  $('#' + IntroDiv.id).append($('#' + canvasID)[0]);
  if (inside) {
    $('#' + IntroDiv.id).addClass('inside');
  }
  if (ToolBarList.ZoomScale > 1) {
    $('#' + IntroDiv.id).attr('Zoom', true);
  }
  $('#' + IntroDiv.id).css({
    position: 'absolute',
    'z-index': 99
  });
}

function IntroductionCanvasSet(obj, inside) {
  var scale = MainObj.Scale;
  var Left = obj.ShiftPointX ? (obj.Left * scale + obj.ShiftPointX * scale + MainObj.CanvasL) : (obj.Left * scale + MainObj.CanvasL);
  var Top = obj.ShiftPointY ? (obj.Top * scale + obj.ShiftPointY * scale + MainObj.CanvasT) : (obj.Top * scale + MainObj.CanvasT);
  var Width = obj.Width * scale;
  var Height = obj.Height * scale;

  if (inside) {
    Left = $('#IntroDiv' + inside.Identifier).offset().left + Left;
    Top = $('#IntroDiv' + inside.Identifier).offset().top + Top;
  }

  $('#canvas')[0].class = 'canvasObj';
  $('#canvas')[0].width = Width;
  $('#canvas')[0].height = Height;
  $('#canvas').css({
    left: Left,
    top: Top
  });
}

function ObjImageSet(obj, inside) {
  IntroductionCanvasSet(obj, inside);
  var scale = MainObj.Scale;
  var Width = obj.Width * scale;
  var Height = obj.Height * scale;

  var canvas = $('#canvas')[0];
  var cxt = canvas.getContext('2d');


  var ObjImg = new Image();
  ObjImg.onload = function () {
    cxt.drawImage(ObjImg, 0, 0, Width, Height);
    invertCanvas(cxt, Width, Height);
  };
  ObjImg.src = 'Resource/' + obj.XFileName;
}

function IntroVideo(obj, divID) {
  var scale = MainObj.Scale;
  var NewVideo = document.createElement('video');
  NewVideo.id = obj.Identifier;
  NewVideo.width = obj.Width * scale;
  NewVideo.height = obj.Height * scale;
  var Left = obj.Left * scale;
  var Top = obj.Top * scale;
  $('#IntroDiv' + divID).append(NewVideo);

  $(NewVideo).css({
    position: 'absolute',
    left: Left + MainObj.CanvasL,
    top: Top + MainObj.CanvasT,
    'object-fit': 'fill',
    'z-index': 99
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
      });
    });
  }

  $('#' + NewVideo.id).click(function () {
    if (NewVideo.paused) {
      NewVideo.play();
    } else {
      NewVideo.pause();
    }
  });

  $('#' + NewVideo.id).on('play', function () {
    // playing
    if ($('#Narration')[0]) {
      $('#Narration')[0].pause();
    }
  });

  $('#' + NewVideo.id).on('pause ended', function () {
    // pause
    if ($('#Narration')[0]) {
      $('#Narration')[0].play();
    }
  });
}

function ObjListSet(obj) {
  var objList = [];

  if (obj.length == undefined) {
    obj = [obj];
  }

  for (var i = 0; i < obj.length; i++) {
    var objsAttributes = {
      FormatterType: TypeNameSet(obj[i].FormatterType),
      Identifier: obj[i].Identifier,
      XFileName: obj[i].XFileName,
      zIndex: obj[i].LayerIndex,
      Width: Number(obj[i]['BoundaryPoint.Bounds.Size.Width']),
      Height: Number(obj[i]['BoundaryPoint.Bounds.Size.Height']),
      Left: Number(obj[i]['BoundaryPoint.Bounds.Location.X']),
      Top: Number(obj[i]['BoundaryPoint.Bounds.Location.Y']),
      Rotate: Number(obj[i].Rotate),
      BorderColor: intToRGB(obj[i].BorderColor),
      Brush: intToRGB(obj[i].Brush),
      BorderWidth: obj[i].BorderWidth,
      BackgroundXFileName: obj[i].BackgroundXFileName, //背景圖

      //動態平移屬性
      MoveDirection: obj[i].MoveDirection,
      Orientation: obj[i].Orientation,
      Paging: obj[i].Paging,
      PlayingInterval: obj[i].PlayingInterval,
      Size: obj[i].Size,
      Looping: obj[i].Looping,
      ShiftPointX: Number(obj[i]['ShiftPoint.X']),
      ShiftPointY: Number(obj[i]['ShiftPoint.Y']),

      //影片屬性
      AutoPlay: obj[i].AutoPlay, //影片自動撥放
      Fadeout: obj[i].Fadeout, //影片淡出
      SliderBar: obj[i].SliderBar, //影片淡出
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

      //點選題
      CorrectOrder: obj[i].RectangleOrderIndex, //點選題順序
      Selected: false,

      //文字框
      CharSetImg: obj[i].CharSetImg,
      TextFontColor: intToRGB(obj[i].TextFontColor),
      TextFontSize: obj[i].TextFontSize,
      TextString: obj[i].TextString,

      //另開附件-子物件
      ParentID: obj[i].ParentID
    };
    objList[i] = objsAttributes;
  }
  return objList;
}

function TypeNameSet(type) {
  switch (type) {
    //背景
    case 'Hamastar.AddIns.Introduction.IntroductionBackgroundFormatter':
      return 'Background';
      break;

    //動態平移
    case 'Hamastar.AddIns.Introduction.IntroductionPictureScrollObjectFormatter':
      return 'ScrollObject';
      break;

    //圖片
    case 'Hamastar.AddIns.Introduction.IntroductionPictureObjectFormatter':
      return 'ImageLayer';
      break;

    //關閉按鈕
    case 'Hamastar.AddIns.Introduction.IntroductionCloseButtonFormatter':
      return 'CloseButton';
      break;

    //超連結
    case 'Hamastar.AddIns.Introduction.IntroductionHyperLinkObjectFormatter':
      return 'HyperLinkObject';
      break;

    //圖影定位(感應區)
    case 'Hamastar.AddIns.Introduction.IntroductionSetLocationObjectFormatter':
      return 'AdditionalFile';
      break;

    //感應區
    case 'Hamastar.AddIns.Introduction.IntroductionAdditionalFileObjectFormatter':
      return 'AdditionalFile';
      break;

    //360
    case 'Hamastar.AddIns.Introduction.IntroductionRotationImageObjectFormatter':
      return 'RotationImage';
      break;

    //影片
    case 'Hamastar.AddIns.Introduction.IntroductionVideoObjectFormatter':
      return 'VideoObject';
      break;

    //輔助視窗
    case 'Hamastar.AddIns.Introduction.IntroductionIntroductionObjectFormatter':
      return 'Introduction';
      break;

    //塗抹
    case 'Hamastar.AddIns.Introduction.IntroductionErasingPictureObjectFormatter':
      return 'ErasingPicture';
      break;

    //點選題(正確)
    case 'Hamastar.AddIns.Introduction.IntroductionTouchRectangleObjectFormatter':
      return 'CorrectBox';
      break;

    //點選題(錯誤)
    case 'Hamastar.AddIns.Introduction.IntroductionLimitedRangeObjectFormatter':
      return 'ErrorBox';
      break;

    //文字框
    case 'Hamastar.AddIns.Introduction.IntroductionTextObjectFormatter':
      return 'TextObject';
      break;

    //另開附件-子物件
    case 'Hamastar.AddIns.Introduction.IntroductionEmptyObjectFormatter':
      return 'EmptyObject';
      break;
  }
}

//點選題canvas設置
function IntroQuizSet(obj, objlist) {
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
  $('#' + canvasQuizID).css({
    left: Left,
    top: Top
  });

  var canvas = $('#' + canvasQuizID)[0];
  var cxt = $('#' + canvasQuizID)[0].getContext('2d');


  drawButtonImage(obj, cxt, Width, Height);

  $('#' + canvasQuizID).click(function () {
    TouchModule(obj.FormatterType, this, MainObj.NowPage, objlist);
  });
}

//輔助彈跳視窗文字框設置
function IntroTextSet(obj, divId) {
  var text = document.createElement('textarea');
  $('#IntroDiv' + divId).append(text);
  text.id = obj.Identifier;
  $(text).addClass('canvasObj');
  var scale = MainObj.Scale;
  var Left = obj.Left * scale + MainObj.CanvasL;
  var Top = obj.Top * scale + MainObj.CanvasT;
  var Width = obj.Width * scale;
  var Height = obj.Height * scale;
  $(text).css({
    'left': Left,
    'top': Top,
    'width': Width,
    'height': Height,
    'position': 'absolute',
    'resize': 'none',
    'border': '1px solid',
    'outline': 0,
    'font-family': 'microsoft jhenghei ui',
    'font-size': obj.TextFontSize + 'px',
    'color': obj.TextFontColor,
    'overflow-y': 'scroll'
  });
  $(text).attr('readonly', true);
  $(text).val(obj.TextString);
  $(text).on('mousemove', function (e) {
    MainObj.isMouseInText = true;
  })
  $(text).on('mouseout', function (e) {
    MainObj.isMouseInText = false;
  })
}