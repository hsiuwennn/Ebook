// 文字彈跳視窗
var TextPopup = {
    saveList: [],
    CustomizeMain: {
        defaultMax:  false
    }
};

function setTextPopup(obj) {
    
    var blockW = obj.Width * MainObj.Scale,
        blockH = obj.Height * MainObj.Scale;
    var blockL = obj.Left * MainObj.Scale + MainObj.CanvasL,
        blockT = obj.Top * MainObj.Scale + MainObj.CanvasT;

    var popupBlock = document.createElement('div');
    popupBlock.id = 'popupBlock' + obj.Identifier;
    popupBlock.style.cursor = "pointer";
    $('#HamastarWrapper').append(popupBlock);
    $(popupBlock)
        .attr({
          'class': 'popupBlock',
          'LayerIndex': txtMainobj.LayerIndex += 1
        }).css({
        'position': 'absolute',
        'width': blockW,
        'height': blockH,
        'left': blockL,
        'top': blockT,
        'z-index': 99
    }).click(function (e) {
        e.preventDefault();

        if ($('#' + obj.Identifier)[0]) {
            $('#' + obj.Identifier).show();

            popupToLast(obj.Identifier);
            return;
        }

        var titleWidth = obj.Position.W * MainObj.Scale * ToolBarList.ZoomScale,
            titleHeight = txtMainobj.Textobj.Title.H;
        var objWidth = titleWidth,
            objHeight = obj.Position.H * MainObj.Scale * ToolBarList.ZoomScale;
        var textareaW = titleWidth,
            textareaH = (objHeight - titleHeight) + ((titleHeight * ToolBarList.ZoomScale) - titleHeight) - txtMainobj.Textobj.TempH;

        var divBox = document.createElement('div');
        divBox.id = obj.Identifier;
        $(divBox).attr('class', 'popupBox');
        $('#HamastarWrapper').append(divBox);

        var popupDiv = document.createElement('div');
        popupDiv.id = 'popupDiv' + obj.Identifier;
        $(divBox).append(popupDiv)
        $(popupDiv).click(function () {
            popupToLast(obj.Identifier);
        });

        if (TextPopup.CustomizeMain.defaultMax) {
            $(popupDiv).attr({
                'Identifier': obj.Identifier,
                'class' : 'textPopup'
            }).css({
                    'position': 'fixed',
                    'border': '5px solid ' + (obj.ViewBorderBrush || '#ffff00'),
                    'background-color': (obj.ViewBorderBrush || '#ffff00'),
                    'width': $(window).width(),
                    'height': $(window).height(),
                    'left': 0,
                    'top': 0,
                    'z-index': 1002
            })

            textareaW = $(window).width();
            textareaH = ($(window).height() - titleHeight) - txtMainobj.Textobj.TempH;

            MainObj.isMouseInText = true;
        } else {
            $(popupDiv).attr({
                'Identifier': obj.Identifier,
                'class': 'textPopup',
                'tempwidth': obj.Position.W * MainObj.Scale,
                'tempheight': obj.Position.H * MainObj.Scale,
                'left': obj.Position.X * MainObj.Scale + MainObj.CanvasL,
                'top': obj.Position.Y * MainObj.Scale + MainObj.CanvasT
            }).css({
                    'position': 'fixed',
                    'border': '5px solid ' + (obj.ViewBorderBrush || '#ffff00'),
                    'background-color': (obj.ViewBorderBrush || '#ffff00'),
                    'width': objWidth,
                    'height': objHeight,
                    'left': obj.Position.X * MainObj.Scale * ToolBarList.ZoomScale + MainObj.CanvasL,
                    'top': obj.Position.Y * MainObj.Scale * ToolBarList.ZoomScale + MainObj.CanvasT
            }).draggable({
                scroll: false,
                cursor: "move",
                handle: '.popupTitle',
                cancel: '.popupTitleName',
                start: function (event) {
                    popupToLast(obj.Identifier);
                }
            }).resizable({
                zIndex: 100,
                minHeight: 400,
                minWidth: 400,
                start: function () {
                    $(window).off("resize", resizeInit);
                },
                resize: function (e, ui) {
                    var tempH = ui.size.height - objHeight
                    changeTextEditor('popupDiv' + obj.Identifier, "resize", textareaW, textareaH + tempH)
                },
                stop: function () {
                    $(window).resize(resizeInit);
                }
            });
        }

        var popupTitle = document.createElement('nav');
        popupTitle.id = 'popupTitle' + obj.Identifier;
        $(popupDiv).append(popupTitle);
        $(popupTitle)
            .attr({
                'class': 'popupTitle navbar navbar-light'
            })
            .css({
                'position': 'relative',
                'background-color': (obj.ViewBorderBrush || '#ffff00'),
                'width': '100%',
                'height': titleHeight,
                'padding': 0
            });
        
        var popupTitleName = document.createElement('a');
        popupTitleName.innerHTML = obj.Title;
        $(popupTitle).append(popupTitleName);
        $(popupTitleName)
            .attr({
                'contenteditable': true
            })
            .addClass('navbar-brand popupTitleName')
            .css({
            'font-size': '1.7rem',
            'padding' : 0
        });

        var popupTitleBtn = document.createElement('div');
        $(popupTitle).append(popupTitleBtn);
        $(popupTitleBtn).addClass('form-inline')
        
        var popupText = document.createElement('textarea');
        popupText.id = 'popupText' + obj.Identifier;
        $(popupDiv).append(popupText);

        TextPopup.saveList.map(function (res) {
            if (res.id == obj.Identifier) {
                obj.Content = res.content;
            }
        });

        textEditor(popupText, textareaW, textareaH, SavePopup, obj.Content);

        changeTextEditor('popupText' + obj.Identifier, "disable");

        setEditBtn(popupTitleBtn, obj.Identifier, 'popupText' + obj.Identifier);
        setPopupCloseBtn(popupTitleBtn, obj.Identifier);

        SavePopup();
    });
}

// 文字彈跳視窗關閉按鈕設置
function setPopupCloseBtn(div, id) {
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
        
        SavePopup();
        MainObj.isMouseInText = false;

        $("#" + id).remove();
    })
}

function popupToLast(id) {
    var last = $('#HamastarWrapper').children().last();
    if (last[0].id !== id) {
        $('#' + id).insertAfter($(last));

        changeTextEditor('popupText' + id, "focus");
    }
}


function SavePopup() {
    for (var i = 0; i < $('.popupBox').length; i++) {
        var obj = $('.popupBox')[i];
        for (var x = 0; x < TextPopup.saveList.length; x++) {
            if (obj.id == TextPopup.saveList[x].id) {
                TextPopup.saveList.splice(x, 1);
            }
        }

        list = {
            id: obj.id,
            page: MainObj.NowPage,
            type: 'textPopup',
            content: $('#popupText' + obj.id).summernote('code'),
            oldContent: $('#popupText' + obj.id).summernote('code'),
            LayerIndex: $('#popupBlock' + obj.id).attr('LayerIndex'),
        };
    
        TextPopup.saveList.push(list);
    }
}

//初始化
function txtPopupReset() {
    $('.popupBlock').remove();
}