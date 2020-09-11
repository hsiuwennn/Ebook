//文字便利貼
var txtNote = {
    SaveList: [],
    CustomizeMain: {
        defaultTheme: false,
        ShowBackground: false,
        SmallIcon: {
            ShowIcon: false,
            FileName: "TextIcon.png"
        }
    }
}

function txtNoteLayer() {
    
    var titleWidth = txtMainobj.Textobj.W * ToolBarList.ZoomScale,
        titleHeight = txtMainobj.Textobj.Title.H;
    var objWidth = titleWidth,
        objHeight = txtMainobj.Textobj.H * ToolBarList.ZoomScale;
    var textareaW = titleWidth,
        textareaH = (txtMainobj.Textobj.Text.H * ToolBarList.ZoomScale) + ((titleHeight * ToolBarList.ZoomScale) - titleHeight) - txtMainobj.Textobj.TempH;

    var Left = event.type == 'touchstart' ? event.targetTouches[0].pageX : (event.clientX ? event.clientX : event.originalEvent.clientX),
        Top = event.type == 'touchstart' ? event.targetTouches[0].pageY : (event.clientY ? event.clientY : event.originalEvent.clientY);

    var fixLoction = CreateBoundary(Left, Top, objWidth, objHeight);
    Left = fixLoction.Left;
    Top = fixLoction.Top;

    var ID = newguid();

    var divBox = document.createElement('div');
    divBox.id = ID;
    $(divBox).attr('class', 'NoteBox');
    $('#HamastarWrapper').append(divBox);

    var div = document.createElement('div');
    $(divBox).append(div);
    div.id = 'Div' + ID;
    $(div)
        .attr({
            'LayerIndex': txtMainobj.LayerIndex += 1,
            'left': ToolBarList.ZoomScale > 1 ? ((Left - ZoomList.Left) / ToolBarList.ZoomScale + MainObj.CanvasL) : Left,
            'top': ToolBarList.ZoomScale > 1 ? ((Top - ZoomList.Top) / ToolBarList.ZoomScale + MainObj.CanvasT) : Top,
            'tempwidth': objWidth / ToolBarList.ZoomScale,
            'tempheight': objHeight / ToolBarList.ZoomScale,
        }).css({
            'position': 'absolute',
            'width': objWidth,
            'height': objHeight,
            'left': Left,
            'top': Top,
            'display': 'flex',
            'flex-direction': 'column',
            'border': '5px solid #fdecac',
            'background-color': '#fdecac',
            'z-index': 99
        }).draggable({
            cursor: "move",
            containment: "#HamastarWrapper",
            handle: '.noteTitle',
            cancel: '.noteTitleName',
            start: function (event) {
                noteToLast(ID);
            },
            stop: function (event, ui) {
                FindBoundary(ui, div);
                SaveNote();
            }
        }).resizable({
            zIndex: 100,
            minHeight: txtMainobj.Textobj.H,
            minWidth: txtMainobj.Textobj.W,
            start: function () {
                $(window).off("resize", resizeInit);
            },
            resize: function (e, ui) {
                var tempH = ui.size.height - objHeight
                changeTextEditor('Div' + ID, "resize", textareaW, textareaH + tempH)
            },
            stop: function (event, ui) {
                var NewWidth = ui.size.width;
                var NewHeight = ui.size.height;
                $(window).resize(resizeInit);

                SaveNote();
            }
        }).click(function () {
            noteToLast(ID);
        });

    var noteTitle = document.createElement('nav');
    noteTitle.id = 'noteTitle' + ID;
    $(div).append(noteTitle);
    $(noteTitle)
        .attr({
            'class': 'noteTitle navbar navbar-light'
        })
        .css({
            'background-color': '#fdecac',
            'width': '100%',
            'height': titleHeight,
            'padding': 0
        });

    var noteTitleName = document.createElement('a');
    noteTitleName.innerHTML = txtMainobj.TitleName.Note;
    $(noteTitle).append(noteTitleName);
    $(noteTitleName)
        .attr({
            'contenteditable': true
        })
        .data({
            'lang': "noteTitle"
        })
        .addClass('navbar-brand noteTitleName')
        .css({
            'font-size': '1.7rem',
            'padding': 0
        });

    var noteTitleBtn = document.createElement('div');
    $(noteTitle).append(noteTitleBtn);
    $(noteTitleBtn).addClass('form-inline');

    //文字框
    var notetext = document.createElement('textarea');
    notetext.id = 'textArea' + ID;
    $(div).append(notetext);
    $(notetext)
        .attr({
            'class': 'textArea',
            'autofocus': true,
            'tempwidth': textareaW / ToolBarList.ZoomScale,
            'tempheight': textareaH / ToolBarList.ZoomScale
        })
        .css({
            'width': '100%',
            'height': '100%',
            'padding': 0,
            'resize': 'none',
            'overflow-y': 'auto',
            'font-size': MainObj.TextFontSize * ToolBarList.ZoomScale + 'px'
        })
        .on('keyup', function (event) {
            SaveNote();
        })
        .focus();

    if (txtNote.CustomizeMain.defaultTheme) {
        $("#" + notetext.id).off('keyup');
        textEditor(notetext, textareaW, textareaH, SaveNote);

        if (txtNote.CustomizeMain.SmallIcon.ShowIcon) {
            txtNarrowSmall(divBox, ID, txtNote.CustomizeMain.SmallIcon.FileName);
        } else {
            txtNarrowSmall(divBox, ID, txtMainobj.SmallIcon.Note);
        }

        if (txtNote.CustomizeMain.ShowBackground) {
            txtBackgroundBtn(noteTitleBtn, ID, noteTitle);
        }

        txtNarrowBtn(noteTitleBtn, ID);
        txtCloseBtn(noteTitleBtn, ID);
    } else {
        UIText(noteTitleName);
        txtNarrowSmall(divBox, ID, txtMainobj.SmallIcon.Note);

        txtNarrowBtn(noteTitleBtn, ID);
        txtCloseBtn(noteTitleBtn, ID);
    }

    MainObj.saveList.push({
        page: MainObj.NowPage,
        id: ID,
        type: 'txtNote',
        width: $('#Div' + ID).width() + 'px',
        height: $('#Div' + ID).height() + 'px',
        top: (Top - MainObj.CanvasT) / MainObj.Scale + 'px',
        left: (Left - MainObj.CanvasL) / MainObj.Scale + 'px',
        value: null,
        StickyViewVisibility: FindStickyViewVisibility(ID),
        LayerIndex: txtMainobj.LayerIndex,
        bgcolor: rgbToHex($('#Div' + ID)[0].style.backgroundColor).toUpperCase().replace('#',''),
        isEraser: false,
        isGroup: null,
        isEraserSelect: false,
        isEraserSelectPen: false
    });

    recovery();

    if (MainObj.saveList.length > 5) {
        MainObj.saveList.splice(0, 1);
    }

    SaveNote();
}


function noteToLast(id) {
    var last = $('#HamastarWrapper').children().last();
    if (last[0].id !== id) {
        $('#' + id).insertAfter($(last));

        if (txtNote.CustomizeMain.defaultTheme) {
            changeTextEditor('textArea' + id, "focus");
        }
    }
}

//儲存note的資訊於txtNote.SaveList
function SaveNote(NoteId) {

    var list = {};
    if (NoteId == undefined) {
        var note = $('.NoteBox');
    } else {
        var note = $('.NoteBox').filter(function (index) {
            return $(this).attr("id") === NoteId;
        });
    }

    if (txtNote.SaveList.length > 0) {
        for (var x = 0; x < txtNote.SaveList.length; x++) {
            if (txtNote.SaveList[x] != undefined) {
                if (txtNote.SaveList[x].page == MainObj.NowPage) {
                    txtNote.SaveList.splice(x, 1);
                }
            }
        }
    }

    for (var i = 0; i < note.length; i++) {
        var tmp;
        var value;
        if (FindStickyViewVisibility(note[i].id) == 'true') {
            var tmp = '#Div';
        } else {
            var tmp = '#narrowDiv';
        }

        if (ToolBarList.ZoomScale > 1) {
            var left = ($(tmp + note[i].id).offset().left - ZoomList.Left) / ToolBarList.ZoomScale / MainObj.Scale;
            var top = ($(tmp + note[i].id).offset().top - ZoomList.Top) / ToolBarList.ZoomScale / MainObj.Scale;
        } else {
            var left = ($(tmp + note[i].id).offset().left - MainObj.CanvasL) / MainObj.Scale;
            var top = ($(tmp + note[i].id).offset().top - MainObj.CanvasT) / MainObj.Scale;
        }

        if (txtNote.CustomizeMain.defaultTheme) {
            value = $('#textArea' + note[i].id).summernote('code');
        } else {
            value = $('#' + 'textArea' + note[i].id).val();
        }

        list = {
            page: MainObj.NowPage,
            id: note[i].id,
            type: 'txtNote',
            width: $('#Div' + note[i].id).width() / ToolBarList.ZoomScale + 'px',
            height: $('#Div' + note[i].id).height() / ToolBarList.ZoomScale + 'px',
            top: top + 'px',
            left: left + 'px',
            value: value,
            StickyViewVisibility: FindStickyViewVisibility(note[i].id),
            LayerIndex: $('#Div' + note[i].id).attr('LayerIndex'),
            bgcolor: rgbToHex($('#Div' + note[i].id)[0].style.backgroundColor).toUpperCase().replace('#','')
        };

        txtNote.SaveList.push(list);
    }
}

//如有文字便利貼註記，從txtNote.SaveList取得
function ReplyNote(page) {
    $('.NoteBox').remove();
    $(txtNote.SaveList).each(function () {
        if (this != undefined) {
            if (this.page == page) {
                reSetNote(this);
            }
        }
    })
}

function reSetNote(obj) {
    if ($('#' + obj.id)[0] != undefined) {
        $('#' + obj.id).remove();
    }

    var ID = obj.id;
    var note = obj;

    var titleWidth = (Number(note.width.split('px')[0]));
        titleHeight = txtMainobj.Textobj.Title.H;
    var objWidth = titleWidth,
        objHeight = (Number(note.height.split('px')[0]));
    var textareaW = titleWidth,
        textareaH = (objHeight - titleHeight) - txtMainobj.Textobj.TempH;

    var Left = (Number(note.left.split('px')[0]) * MainObj.Scale) + MainObj.CanvasL,
        Top = (Number(note.top.split('px')[0]) * MainObj.Scale) + MainObj.CanvasT;

    var bgcolor = '#' + (note.bgcolor || 'fdecac');
    if(note.bgcolor === undefined) {
        note.bgcolor = bgcolor;
    }

    var divBox = document.createElement('div');
    $('#HamastarWrapper').append(divBox);
    divBox.id = ID;
    $(divBox).attr('class', 'NoteBox');

    var div = document.createElement('div');
    $(divBox).append(div);
    div.id = 'Div' + ID;
    $(div)
        .attr({
            'LayerIndex': note.LayerIndex,
            'left': ToolBarList.ZoomScale > 1 ? ((Left - ZoomList.Left) / ToolBarList.ZoomScale + MainObj.CanvasL) : Left,
            'top': ToolBarList.ZoomScale > 1 ? ((Top - ZoomList.Top) / ToolBarList.ZoomScale + MainObj.CanvasT) : Top,
            'tempwidth': objWidth / ToolBarList.ZoomScale,
            'tempheight': objHeight / ToolBarList.ZoomScale
        })
        .css({
            'position': 'absolute',
            'width': objWidth,
            'height': objHeight,
            'left': Left,
            'top': Top,
            'display': 'flex',
            'flex-direction': 'column',
            'border': '5px solid ' + bgcolor,
            'background-color': bgcolor,
            'z-index': 99,
            'display': 'none'
        }).draggable({
            cursor: "move",
            containment: "#HamastarWrapper",
            handle: '.noteTitle',
            cancel: '.noteTitleName',
            start: function (event) {
                noteToLast(ID);
            },
            stop: function (event, ui) {
                FindBoundary(ui, div);
                SaveNote();
            }
        }).resizable({
            zIndex: 100,
            minHeight: txtMainobj.Textobj.H,
            minWidth: txtMainobj.Textobj.W,
            start: function () {
                $(window).off("resize", resizeInit);
            },
            resize: function (e, ui) {
                var tempH = ui.size.height - objHeight
                changeTextEditor('Div' + ID, "resize", textareaW, textareaH + tempH)
            },
            stop: function (event, ui) {
                var NewWidth = ui.size.width;
                var NewHeight = ui.size.height;
                $(window).resize(resizeInit);

                SaveNote();
            }
        }).click(function () {
            noteToLast(ID);
        });

    var noteTitle = document.createElement('nav');
    noteTitle.id = 'noteTitle' + ID;
    $(div).append(noteTitle);
    $(noteTitle)
        .attr({
            'class': 'noteTitle navbar navbar-light'
        })
        .css({
            'background-color': bgcolor,
            'width': '100%',
            'height': titleHeight,
            'padding': 0
        });

    var noteTitleName = document.createElement('a');
    noteTitleName.innerHTML = txtMainobj.TitleName.Note;
    $(noteTitle).append(noteTitleName);
    $(noteTitleName)
        .attr({
            'contenteditable': true
        })
        .data({
            'lang': "noteTitle"
        })
        .addClass('navbar-brand noteTitleName')
        .css({
            'font-size': '1.7rem',
            'padding': 0
        });

    var noteTitleBtn = document.createElement('div');
    $(noteTitle).append(noteTitleBtn);
    $(noteTitleBtn).addClass('form-inline');

    //文字框
    var noteText = document.createElement('textarea');
    noteText.id = 'textArea' + ID;
    $(div).append(noteText);
    $(noteText)
        .attr({
            'class': 'textArea',
            'autofocus': true,
            'tempwidth': textareaW / ToolBarList.ZoomScale,
            'tempheight': textareaH / ToolBarList.ZoomScale
        })
        .css({
            'width': '100%',
            'height': '100%',
            'padding': 0,
            'resize': 'none',
            'overflow-y': 'auto',
            'font-size': MainObj.TextFontSize * ToolBarList.ZoomScale + 'px'
        })
        .on('keyup', function (event) {
            SaveNote();
        })
        .focus();

    if (txtNote.CustomizeMain.defaultTheme) {
        $("#" + noteText.id).off('keyup');

        setTimeout(function () {
            textEditor(noteText, textareaW, textareaH, SaveNote, note.value);
        });

        if (txtNote.CustomizeMain.SmallIcon.ShowIcon) {
            txtNarrowSmall(divBox, ID, txtNote.CustomizeMain.SmallIcon.FileName);
        } else {
            txtNarrowSmall(divBox, ID, txtMainobj.SmallIcon.Note);
        }

        if (txtNote.CustomizeMain.ShowBackground) {
            txtBackgroundBtn(noteTitleBtn, ID, noteTitle);
        }

        txtNarrowBtn(noteTitleBtn, ID);
        txtCloseBtn(noteTitleBtn, ID);
    } else {
        UIText(noteTitleName);
        txtNarrowSmall(divBox, ID, txtMainobj.SmallIcon.Note);

        txtNarrowBtn(noteTitleBtn, ID);
        txtCloseBtn(noteTitleBtn, ID);

        $('#' + noteText.id).val(note.value)
    }

    if (note.StickyViewVisibility == 'true') {
        $('#narrowDiv' + note.id).css('display', 'none');
        $('#Div' + note.id).css('display', 'flex');
    } else {
        $('#narrowDiv' + note.id).css({
            'display': 'flex',
            'left': $('#Div' + note.id).css('left'),
            'top': $('#Div' + note.id).css('top'),
        });
        $($('#narrowDiv' + note.id)[0]).children().attr({
            'tempWidth': 50 * MainObj.Scale,
            'tempHeight': 50 * MainObj.Scale,
            'left': ToolBarList.ZoomScale > 1 ? (($('#narrowDiv' + note.id)[0].offsetLeft - ZoomList.Left) / ToolBarList.ZoomScale + MainObj.CanvasL) : $('#narrowDiv' + note.id)[0].offsetLeft,
            'top': ToolBarList.ZoomScale > 1 ? (($('#narrowDiv' + note.id)[0].offsetTop - ZoomList.Top) / ToolBarList.ZoomScale + MainObj.CanvasT) : $('#narrowDiv' + note.id)[0].offsetTop
        });
        $('#Div' + note.id).css('display', 'none');
    }
}

//初始化
function txtNoteReset() {
    $('.NoteBox').remove();
}