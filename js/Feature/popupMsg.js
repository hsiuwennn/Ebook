var messageObj = {
    back: {
        Msg: "離開前，是否儲存註記？",
        True: "是",
        False: "否",
        Cancel: "取消"
    },
    delete: {
        True: "確定",
        False: "取消"
    },
    CustomizeMain: {
        defaultConfirm:  false
    }
}

//alert視窗
function BookAlertShow(str, lang, time) {
    if (time == undefined) {
        time = 3000;
    }

    $("#BookAlert").stop(true, true).fadeIn();
    $("#BookAlert > label")[0].innerHTML = str;
    $("#BookAlert > label").data('lang', lang);
    UIText($("#BookAlert > label"));
    //置中
    $('#BookAlert').css('margin-left', -($('#BookAlert')[0].clientWidth / 2));
    $("#BookAlert").stop(true, true).fadeOut(time);
}

// confirm視窗
function confirmShow(str, lang, back, callback) {
    $('.confirm_text')[0].innerHTML = str;
    $('.confirm_text').data({
        'lang': lang
    });

    UIText($('.confirm_text'));

    if (back) {
        if (messageObj.CustomizeMain.defaultConfirm) {
            var backobj = {
                save: false,
                close: false
            }

            $('.confirm_text')[0].innerHTML = messageObj.back.Msg;

            var yesBtn = document.createElement('button');
            $(yesBtn)[0].innerHTML = messageObj.back.True;
            $(yesBtn).addClass('confirm_btn');
            $('.confirm_btns').append(yesBtn);
            $(yesBtn).click(function (e) {
                e.preventDefault();
                backobj = { save: true, close: true };
                callback(confirmState(backobj));
            });

            var noBtn = document.createElement('button');
            $(noBtn)[0].innerHTML = messageObj.back.False;
            $(noBtn).addClass('confirm_btn');
            $(noBtn).addClass('cancel');
            $('.confirm_btns').append(noBtn);
            $(noBtn).click(function (e) {
                e.preventDefault();
                backobj = { save: false, close: true };
                callback(confirmState(backobj));
            });

            var cancelBtn = document.createElement('button');
            $(cancelBtn)[0].innerHTML = messageObj.back.Cancel;
            $(cancelBtn).addClass('confirm_btn');
            $(cancelBtn).addClass('cancel');
            $('.confirm_btns').append(cancelBtn);
            $(cancelBtn).click(function (e) {
                e.preventDefault();
                backobj = { save: false, close: false };
                callback(confirmState(backobj));
            });
        } else {
            var yesBtn = document.createElement('button');
            $(yesBtn)[0].innerHTML = messageObj.back.True;
            $('.confirm_btns').append(yesBtn);
            $(yesBtn).attr({
                'class': "confirm_btn"
            }).data({
                'lang': 'Yes'
            }).click(function (e) {
                e.preventDefault();
                callback(confirmState(true));
            })

            var noBtn = document.createElement('button');
            $(noBtn)[0].innerHTML = messageObj.back.False;
            $('.confirm_btns').append(noBtn);
            $(noBtn).attr({
                'class': "confirm_btn cancel"
            }).data({
                'lang': 'No'
            }).click(function (e) {
                e.preventDefault();
                callback(confirmState(false));
            })

            UIText($('.confirm_btn'));
        }
    } else {
        var yesBtn = document.createElement('button');
        $(yesBtn)[0].innerHTML = messageObj.delete.True;
        $('.confirm_btns').append(yesBtn);
        $(yesBtn).attr({
            'class': "confirm_btn"
        }).data({
            'lang': 'Confirm'
        }).click(function (e) {
            e.preventDefault();
            callback(confirmState(true));
        });

        var noBtn = document.createElement('button');
        $(noBtn)[0].innerHTML = messageObj.delete.False;
        $('.confirm_btns').append(noBtn);
        $(noBtn).attr({
            'class': "confirm_btn cancel"
        }).data({
            'lang': 'Cancel'
        }).click(function (e) {
            e.preventDefault();
            callback(confirmState(false));
        });

        UIText($('.confirm_btn'));
    }


    $('.confirm').css('display', 'flex');
}

function confirmState(value) {
    $('.confirm').css('display', 'none');
    $('.confirm_btn').remove();
    return value;
}

//blockUi遮罩(傳值進去可顯示)
function blockUi(string) {
    $.blockUI({
        message: '<div class="load-3"><p>' + string + '</p><div class="ballLine"></div><div class="ballLine"></div><div class="ballLine"></div></div>',
        css: {
            border: 'none',
            padding: '15px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .5,
            color: '#fff'
        }
    });
};

//取消遮罩
function unblockUi() {
    $.unblockUI({
        onUnblock: function () { }
    });
};
