//超連結
var hyperLink = {
    saveList: [],
    CustomizeMain: {
        defaultBrowser: false//預設瀏覽器
    }
};

function HyperLinkSet(obj) {

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
        'left': Left,
        'top': Top
    });

    var canvas = $('#' + canvasID)[0];
    var cxt = $('#' + canvasID)[0].getContext('2d');


    drawButtonImage(obj, cxt, Width, Height);

    switch (obj.InteractiveType) {
        //連結跳頁
        case 'Default':
            $('#' + canvasID).click(function (e) {
                e.preventDefault();
                gotoPage(Number(obj.JumpToProcedureSliceIndex));
            })
            break;
        //連結網頁
        case 'PathUrl':
            $('#' + canvasID).click(function (e) {
                e.preventDefault();
                if (hyperLink.CustomizeMain.defaultBrowser && ReceiveList != undefined) {
                    CommandToWPF('OpenHyperlink', JSON.stringify({
                        link: obj.PathUrl
                    }));
                } else {
                    window.open(obj.PathUrl);
                }
            })
            break;
    }
}

//插入超連結
function submitLink() {
    var title = $('.link-title')[0].value;
    var link = $('.link-input')[0].value;
    if (!title || !link) {
        BookAlertShow('請輸入標題及網址');
        return;
    } else {
        var regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
        if (!link.match(regex)) {
            BookAlertShow('輸入網址錯誤');
            return;
        }
    }

    var btn = document.createElement('div');
    $('#HamastarWrapper').append(btn);
    btn.id = newguid();
    $(btn)[0].innerHTML = title;
    $(btn).addClass('link_btn');
    $(btn).draggable({
        scroll: false,
        stop: function (e) {
            var linkBtn = this;
            hyperLink.saveList = hyperLink.saveList.map(function (x) {
                if (x.id == linkBtn.id) {
                    x.left = Math.floor(($(linkBtn).offset().left - MainObj.CanvasL) / MainObj.Scale);
                    x.top = Math.floor(($(linkBtn).offset().top - MainObj.CanvasT) / MainObj.Scale);
                }
                return x;
            });
        }
    });
    $(btn).click(function (e) {
        e.preventDefault();
        if (hyperLink.CustomizeMain.defaultBrowser && ReceiveList != undefined) {
            CommandToWPF('OpenHyperlink', JSON.stringify({
                link: link
            }));
        } else {
            window.open(link);
        }
    })

    hyperLink.saveList.push({
        id: btn.id,
        page: MainObj.NowPage,
        type: 'hyperLink',
        title: title,
        src: link,
        left: Math.floor(($(btn).offset().left - MainObj.CanvasL) / MainObj.Scale),
        top: Math.floor(($(btn).offset().top - MainObj.CanvasT) / MainObj.Scale)
    });

    closeLink();
}

function replyLink() {
    $('.link_btn').remove();
    hyperLink.saveList.map(function (res) {
        if (res.page == MainObj.NowPage) {
            var btn = document.createElement('div');
            $('#HamastarWrapper').append(btn);
            btn.id = res.id;
            $(btn)[0].innerHTML = res.title;
            $(btn).addClass('link_btn');
            $(btn).css({
                left: Math.floor(res.left * MainObj.Scale + MainObj.CanvasL),
                top: Math.floor(res.top * MainObj.Scale + MainObj.CanvasT)
            });
            $(btn).draggable({
                scroll: false,
                stop: function (e) {
                    var linkBtn = this;
                    hyperLink.saveList = hyperLink.saveList.map(function (x) {
                        if (x.id == linkBtn.id) {
                            x.left = Math.floor(($(linkBtn).offset().left - MainObj.CanvasL) / MainObj.Scale);
                            x.top = Math.floor(($(linkBtn).offset().top - MainObj.CanvasT) / MainObj.Scale);
                        }
                        return x;
                    });
                }
            });
            $(btn).click(function (e) {
                e.preventDefault();
                if (hyperLink.CustomizeMain.defaultBrowser && ReceiveList != undefined) {
                    CommandToWPF('OpenHyperlink', JSON.stringify({
                        link: res.src
                    }));
                } else {
                    window.open(res.src);
                }
            })
        }
    });
}

function closeLink() {
    changeAllBtnToFalse();
    $('.inputLink-layout').css('display', 'none');
    $('.link-title')[0].value = '';
    $('.link-input')[0].value = '';
}