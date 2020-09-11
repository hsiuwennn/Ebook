//插入圖片

var InsertImg = {
    File: null,
    MouseDown: {'X': 0, 'Y': 0},
    SaveList: [],
    ImageList: []
}



function insertClick() {

    $('#input').remove();

    var input = document.createElement("INPUT");
    $(input).attr({
        'type': 'file',
        'id': 'input'
    })
    $('#HamastarWrapper').append(input);
    $(input).css('display', 'none');

    $(input).change(function () {
        InsertImg.File = new FileReader();
        InsertImg.File.onload = function(event) {
            InsertImg.File = event.target.result;
        }
        InsertImg.File.readAsDataURL($('#input')[0].files[0]);
    });

    $(input).click();
}

function insertImageLayer() {

    InsertImg.MouseDown.X = event.clientX;
    InsertImg.MouseDown.Y = event.clientY;

    NewCanvas();
    var canvas = $('#canvas')[0];
    var ID = newguid();
    canvas.id = ID;

    $(canvas).addClass('InsertImg');

    var cxt = canvas.getContext('2d');
    // 

    InsertImg.ImageList.push({
        id: canvas.id,
        pic: InsertImg.File
    });

    var img = new Image();
    img.onload = function() {

        canvas.width = img.width * MainObj.Scale;
        canvas.height = img.height * MainObj.Scale;
        $(canvas).css({
            'left': InsertImg.MouseDown.X,
            'top': InsertImg.MouseDown.Y
        })

        cxt.drawImage(img, 0, 0, canvas.width, canvas.height);

        //圖片可以resize，每次resize結束後要保存資訊
        $(canvas).resizable({
            minHeight: 30,
            minWidth: 30,
            start: function() {
                $(window).off("resize", resizeInit);
            },
            stop: function() {
                $(window).resize(resizeInit);
                SaveImage();
            }
        });

        //canvas綁了resizable之後，會被包在div裡面
        //因此draggable事件綁在div上
        //每次draggable結束後要保存資訊
        $(canvas.parentElement).draggable({
            stop: function() {
                SaveImage();
            }
        });

        //一插入圖就先保存資訊
        SaveImage();
    };
    img.src = InsertImg.File;

}

//儲存image的資訊於InsertImg.SaveList
function SaveImage() {

    var list = {};
    var note = $('.InsertImg');

    if (InsertImg.SaveList.length > 0) {
        for (var x = 0; x < InsertImg.SaveList.length; x++) {
            if (InsertImg.SaveList[x] != undefined) {
                if (InsertImg.SaveList[x].page == MainObj.NowPage) {
                    delete InsertImg.SaveList[x];
                }
            }
        }
    }

    for (var i = 0; i < note.length; i++) {
        var pic;
        InsertImg.ImageList.map(function(res) {
            if (res.id == note[i].id) {
                pic = res.pic;
            }
        });
        var left = Math.round(($(note[i]).offset().left - MainObj.CanvasL) / MainObj.Scale);
        var top = Math.round(($(note[i]).offset().top - MainObj.CanvasT) / MainObj.Scale);
        list = {
            page: MainObj.NowPage,
            id: note[i].id,
            type: 'InsertImg',
            width: Math.round($(note[i]).width() / MainObj.Scale) + 'px',
            height: Math.round($(note[i]).height() / MainObj.Scale) + 'px',
            top: top + 'px',
            left: left + 'px',
            pic: pic
        };
        
        InsertImg.SaveList.push(list);
    }
}

//回復圖片註記
function ReplyImage(page) {
    $('.InsertImg').remove();
    InsertImg.ImageList = [];
    $(InsertImg.SaveList).each(function() {
        if (this) {
            if (Number(this.page) == Number(page)) {
                NewCanvas();
                var canvas = $('#canvas')[0];
                canvas.id = this.id;
            
                $(canvas).addClass('InsertImg');
            
                var cxt = canvas.getContext('2d');
                // 

                InsertImg.ImageList.push({
                    id: this.id,
                    pic: this.pic
                });
            
                var img = new Image();
                var that = this;
                img.onload = function() {
            
                    canvas.width = Math.round(that.width.split('px')[0] * MainObj.Scale);
                    canvas.height = Math.round(that.height.split('px')[0] * MainObj.Scale);
                    
                    var left = (Number(that.left.split('px')[0]) * MainObj.Scale) + MainObj.CanvasL;
                    var top = (Number(that.top.split('px')[0]) * MainObj.Scale) + MainObj.CanvasT;
                    $(canvas).css({
                        'left': Math.round(left) + 'px',
                        'top': Math.round(top) + 'px'
                    })
            
                    cxt.drawImage(img, 0, 0, canvas.width, canvas.height);
            
                    //圖片可以resize，每次resize結束後要保存資訊
                    $(canvas).resizable({
                        minHeight: 30,
                        minWidth: 30,
                        start: function() {
                            $(window).off("resize", resizeInit);
                        },
                        stop: function() {
                            $(window).resize(resizeInit);
                            SaveImage();
                        }
                    });
            
                    //canvas綁了resizable之後，會被包在div裡面
                    //因此draggable事件綁在div上
                    //每次draggable結束後要保存資訊
                    $(canvas.parentElement).draggable({
                        stop: function() {
                            SaveImage();
                        }
                    });
            
                    //一插入圖就先保存資訊
                    SaveImage();
                };
                img.src = this.pic;
            }
        }
    })
}