//跳頁列表設定
function JumpTableShow(btn) {

    var Top = $(window).height() - 200;

    if (btn.afterClick) {

        btnBookSetting();
        $('#btnBook').attr({
            'src': "css/Images/bookpageafter.png"
        });

        $('#Jumptable').css({
            'display': 'block',
            'top': Top
        });

        $('#Jumptab').css({
            'top': Top
        });

    } else {
        $('#JumptableAll').css('display', 'none');
        $('#Jumptable').css('display', 'none');
        $('#Jumptab').css('display', 'none');
        $('#JumpChapter').css('display', 'none');
        $('#JumpBar').remove();

        ToolBarList.IsChapter = false;

        toolbarChange();
        ResetEBook();
    }
}

//btnAll版面設定
function btnAllSetting() {
    $('#JumptableAll').css({
        'display': 'block',
        'height': '100vh'
    });
    $('#Jumptable').css('display', 'none');
    $('#JumpChapter').css('display', 'none');
    $('#Jumptab').css('display', 'none');
    $('.pptType').remove();
    $('#JumpBar').remove();

    //清除章節模式設定的style
    $('.JumpIcon').removeAttr('style');
    $('.JumpIcon > li').removeAttr('style');

    $('body').css('background', '#fbf3f3');

    var NewUl = document.createElement('ul');
    $(NewUl).attr('class', 'pptType');
    $('#JumptableAll').append(NewUl);

    for (var i = 0; i < Base64ImageList.length - 1; i++) {
        var NewLi = document.createElement('li');
        NewLi.id = 'noteDiv' + i;
        $(NewLi).addClass('noteDiv');
        $(NewUl).append(NewLi);

        JumpTableSetting(i, NewLi, false);
    }
}

//btnBook版面設定
function btnBookSetting() {
    $('#JumpChapter').css('display', 'none');
    $('#JumptableAll').css('display', 'none');
    $('#Jumptab').css('display', 'none');
    $('#Jumptable').css('display', 'block');
    $('#JumpBar').remove();
    $('.pptType').remove();

    //清除章節模式設定的style
    $('.JumpIcon').removeAttr('style');
    $('.JumpIcon > li').removeAttr('style');

    $('body').css('background', '#fbf3f3');

    var Jumpbar = document.createElement('table');
    Jumpbar.id = 'JumpBar';
    $(Jumpbar).css('position', 'absolute');
    $('#Jumptable').append(Jumpbar);

    var Newtbody = document.createElement('tbody');
    $(Jumpbar).append(Newtbody);
    var Newtr = document.createElement('tr');
    $(Newtbody).append(Newtr);

    for (var i = 0; i < Base64ImageList.length - 1; i++) {

        var Newtd = document.createElement('td');
        $(Newtr).append(Newtd);
        $(Newtd).css({
            'width': '150px',
            'color': 'white',
            'padding': '0px 15px 0px 15px'
        })

        JumpTableSetting(i, Newtd, false);
    }
}

function btnTabSetting() {
    $('#JumpChapter').css('display', 'none');
    $('#JumptableAll').css('display', 'none');
    $('#Jumptable').css('display', 'none');
    $('#Jumptab').css('display', 'block');
    $('#JumpBar').remove();
    $('.pptType').remove();

    //清除章節模式設定的style
    $('.JumpIcon').removeAttr('style');
    $('.JumpIcon > li').removeAttr('style');

    $('body').css('background', '#fbf3f3');

    var Jumpbar = document.createElement('table');
    Jumpbar.id = 'JumpBar';
    $(Jumpbar).css('position', 'absolute');
    $('#Jumptab').append(Jumpbar);

    var Newtbody = document.createElement('tbody');
    $(Jumpbar).append(Newtbody);
    var Newtr = document.createElement('tr');
    $(Newtbody).append(Newtr);

    for (var i = 0; i < Base64ImageList.length - 1; i++) {

        var Newtd = document.createElement('td');
        $(Newtr).append(Newtd);
        $(Newtd).css({
            'width': '150px',
            'color': 'white',
            'padding': '0px 15px 0px 15px'
        })

        JumpTableSetting(i, Newtd, true);
    }
}

//章節模式版面設置
function btnChapterSetting() {
    $('#JumpChapter').css('display', 'block');
    $('#JumptableAll').css('display', 'none');
    $('#Jumptable').css('display', 'none');
    $('#Jumptab').css('display', 'none');

    $('.ChapterLi').remove();

    $('.JumpIcon').css({
        'top': '1%',
        'left': '0px',
        'position': 'absolute',
        'width': '200px',
        'height': '30px'
    })

    $('.JumpIcon > li').css({
        'position': 'absolute'
    })

    $('body').css('background', '#353535');

    var iconCount = $('.JumpIcon > li').length;
    var padding = (200 - (30 * iconCount)) / (iconCount + 1);

    //設置左右icon間距
    for (var i = 0; i < iconCount; i++) {
        var left = (padding * (i + 1)) + (30 * i);
        var icon = $('.JumpIcon > li')[i];
        $(icon).css({
            'left': left
        })
    }

    $(ToolBarList.ChapterList).each(function () {

        var that = this;

        var li = document.createElement('li');
        var img = document.createElement('img');
        var label = document.createElement('label');

        $(li).click(function (e) {
            e.preventDefault();
            gotoPage(that.page);
        });

        $(li).addClass('ChapterLi');

        img.src = 'css/Images/unread.png';
        img.width = 16;
        img.height = 16;
        $(li).append(img);

        //title超過五個字以上都變點點點
        // if (that.title.length > 8) {
        //     var title = ''
        //     for (var a = 0; a < 8; a++) {
        //         title += that.title[a];
        //     }
        //     that.title = title + '...';
        // }

        $(label).text(that.title);

        $(li).append(label);
        $('#Chapter_ul').append(li);

        if (that.isChapter == '0') { //縮排
            $(img).css('margin-left', '25px');
        }

    })

    toolbarChange();
    ChapterSwitchImg();
}

//章節模式閱讀紀錄清單設定
function ChapterListSet() {
    if (ToolBarList.ChapterList == '') {
        for (var page = 0; page < HamaList.length; page++) {
            var list = {
                title: HamaList[page].PageTitle,
                page: page,
                isChapter: HamaList[page].IsChapter,
                readStatus: false
            }

            if (MainObj.NowPage == page) {
                list.readStatus = true;
            }

            ToolBarList.ChapterList.push(list);
        }
    }
}

//閱讀紀錄圖片變換
function ChapterSwitchImg() {

    $(ToolBarList.ChapterList).each(function () {

        var li = $('.ChapterLi')[this.page];
        if (li == undefined) return;

        if (this.page == MainObj.NowPage) { //目前頁面

            li.children[0].src = 'css/Images/reading.png';
            this.readStatus = true;

        } else if (this.readStatus) { //已讀

            li.children[0].src = 'css/Images/read.png';

        }

    })
}

//版面圖片設定
function JumpTableSetting(num, table, istab) {

    var Widget = false;

    var NewDiv = document.createElement('div');
    $(table).append(NewDiv);
    $(NewDiv).css({
        'width': '182px',
        'height': '150px',
        'position': 'relative',
    })

    var NewSpan = document.createElement('span');
    $(NewDiv).append(NewSpan);
    $(NewSpan).css('display', 'block');
    $(NewSpan).text(num + 1);

    var Img = new Image();
    $(NewDiv).append(Img);
    Img.id = newguid();
    Img.setAttribute('page', num);
    Img.src = 'data:image/png;base64,' + Base64ImageList[num].Value;
    $(Img).css({
        'float': 'left',
        'position': 'absolute',
        'cursor' : "pointer"
    })

    //跳頁視窗顯示頁籤
    if (ToolBarList.TapList[num]) {
        var tapImg = new Image();
        $(NewDiv).append(tapImg);
        tapImg.src = 'css/Images/TagIcon.png';
        $(tapImg).css({
            'padding-top': '10px',
            'position': 'absolute',
            'right': '0px',
        })
    } else {
        if (istab) {
            $(NewDiv).remove();
        }
    }

    if (txtCanvas.SaveList.length > 0) {
        for (var i = 0; i < txtCanvas.SaveList.length; i++) {
            if (txtCanvas.SaveList[i] != undefined) {
                if (txtCanvas.SaveList[i].page == num) {
                    Widget = true;
                }
            }
        }
    }

    if (txtNote.SaveList.length > 0) {
        for (var i = 0; i < txtNote.SaveList.length; i++) {
            if (txtNote.SaveList[i] != undefined) {
                if (txtNote.SaveList[i].page == num) {
                    Widget = true;
                }
            }
        }
    }

    if (Widget) {
        var noteImg = new Image();
        $(NewDiv).append(noteImg);
        noteImg.src = 'css/Images/noteicon.png';
        $(noteImg).css({
            'width': '40px',
            'height': '35px',
            'float': 'left',
            'position': 'absolute',
            'padding-left': '110px'
        })
    }

    $(Img).click(function (e) {
        e.preventDefault();
        JumpPage(Number(this.getAttribute('page')));
    });
}

//點擊跳頁列表的圖片後跳頁
function JumpPage(page) {
    gotoPage(page);
    $('#Jumptable').css('display', 'none');
    $('#JumptableAll').css('display', 'none');
    $('.JumpIcon').css('display', 'none');
    $('#JumpBar').remove();
    $('.pptType').remove();

    $(tempToolBars[0].btns).each(function () {
        if (this.id == 'jump') {
            this.afterClick = !this.afterClick;
            checkBtnChange(this);
        }
    })
}

//JumpIcon顯示
function JumpIconShow(btn) {
    if (btn.afterClick) {

        if (MainObj.IsTwoPage) {
            $('#btnChapter').css('display', 'none');
        }

        $('.JumpIcon').css('display', 'block');

    } else {
        $('.JumpIcon').css('display', 'none');
    }
}

//Icon功能判別
function JumpChange(list) {
    switch (list.id) {
        case 'btnAll':
            ToolBarList.IsChapter = false;
            btnAllSetting();
            break;
        case 'btnBook':
            ToolBarList.IsChapter = false;
            btnBookSetting();
            break;
        case 'btnTab':
            ToolBarList.IsChapter = false;
            btnTabSetting();
            break;
        case 'btnChapter':
            ToolBarList.IsChapter = true;
            btnChapterSetting();
            toolbarChange();
            break;
    }

    if (MainObj.IsTwoPage) {
        $('#btnChapter').css('display', 'none');
    }

    ResetEBook();
}