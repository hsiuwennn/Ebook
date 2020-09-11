var fullScreen = false,
    isBlackBoard = false;

var tempToolBars = [
    //選單內容設定
    {
        'toolBarId': 'toolBar', //選單id
        'toggle': true,
        'show': true,
        //選單內的按鈕們
        'btns': [{
            // 班級進度
            "id": "classProgress",
            "beforespanTextName": "班級進度",
            "afterspanTextName": "班級進度",
            "afterClick": false,
            "beforeStyle": {
                'background-image': 'ToolBar/classProgressbefore.png'
            },
            "afterStyle": {
                'background-image': 'ToolBar/classProgressafter.png'
            },
            action: function () {
                if (!this.afterClick) {
                    changeAllBtnToFalse();
                }

                this.afterClick = !this.afterClick;
                checkBtnChange(this);

                if (ReceiveList) {
                    CommandToWPF('RequestClassSchedule');
                } else {
                    $('.class-layout').toggle();
                    $('.class-tr').remove();
                    if (!classProgressList.length) {
                        $('.class-table').css('display', 'none');
                        $('.class-noContent').css('display', 'block');
                        return;
                    }
                    $('.class-noContent').css('display', 'none');
                    if (!classProgressList.length) {
                        $('.class-table').css('display', 'none');
                        $('.class-noContent').css('display', 'block');
                        return;
                    }
                    classProgressList.map(function (res, index) {
                        $('.class-table').css('display', 'block');
                        $('.class-noContent').css('display', 'none');
                        var tr = document.createElement('tr');
                        $('.class-table').append(tr);
                        $(tr).addClass('class-tr');
                        $(tr).addClass('class-tr-' + index);
                        var timeTd = document.createElement('td');
                        $(timeTd).addClass('time');
                        $(tr).append(timeTd);
                        $(timeTd).text(res.time);
                        var classTd = document.createElement('td');
                        $(tr).append(classTd);
                        var inputName = document.createElement('input');
                        $(classTd).append(inputName);
                        $(inputName)
                            .val(res.name || '新增班級')
                            .on('keyup', function (e) {
                                classProgressList = classProgressList.map(function (x) {
                                    if (res.id === x.id) {
                                        x.name = e.target.value;
                                    }
                                    return x;
                                });
                                saveClassProgress(classProgressList);
                            });
                        createButton('儲存', classTd, res, function (item) {
                            classProgressList = classProgressList.map(function (x, i) {
                                if (item.id === x.id) {
                                    item.time = moment().format('YYYY/MM/DD HH:mm:ss');
                                    $('.class-tr.class-tr-' + i + '>.time').text(item.time);
                                    item.page = MainObj.NowPage;
                                }
                                return x;
                            });
                            saveClassProgress(classProgressList);
                        });
                        createButton('刪除', classTd, res, function (item) {
                            classProgressList = classProgressList.filter(function (x) {
                                if (item.id !== x.id) {
                                    return x;
                                }
                            });
                            $('.class-tr.class-tr-' + index).remove();
                            saveClassProgress(classProgressList);
                            if (!classProgressList.length) {
                                $('.class-table').css('display', 'none');
                                $('.class-noContent').css('display', 'block');
                            }
                        });
                        createButton('前往', classTd, res, function (item) {
                            gotoPage(item.page);
                        });
                    });
                }
            }
        }, {
            // 頁面總覽
            "id": "jump",
            "beforespanTextName": "頁面總覽",
            "afterspanTextName": "頁面總覽",
            "afterClick": false,
            "beforeStyle": {
                'background-image': 'ToolBar/btnJumpBefore.png'
            },
            "afterStyle": {
                'background-image': 'ToolBar/btnJumpAfter.png'
            },
            action: function () {
                if (!this.afterClick) {
                    changeAllBtnToFalse();
                }

                this.afterClick = !this.afterClick;

                checkBtnChange(this);
                JumpTableShow(this);
                JumpIconShow(this);
                $('.note-layout').css('display', 'none');
            }
        }, {
            // 輸入頁數
            "id": "inputPage",
            "beforespanTextName": "輸入頁數",
            "afterspanTextName": "輸入頁數",
            "afterClick": false,
            "beforeStyle": {
                'background-image': 'ToolBar/btnInputBefore.png'
            },
            "afterStyle": {
                'background-image': 'ToolBar/btnInputAfter.png'
            },
            action: function () {
                if (!this.afterClick) {
                    changeAllBtnToFalse();
                }
                this.afterClick = !this.afterClick;
                checkBtnChange(this);

                $('.note-layout').css('display', 'none');
                $('.page-layout').toggle();
            }
        }, {
            //上頁 
            "id": "prevPage",
            "beforespanTextName": "上頁",
            "afterspanTextName": "上頁",
            "afterClick": false,
            "beforeStyle": {
                'background-image': 'ToolBar/btnPrevPagebefore.png'
            },
            "afterStyle": {
                'background-image': 'ToolBar/btnPrevPageafter.png'
            },
            action: function () {
                if (!this.afterClick) {
                    changeAllBtnToFalse();
                }

                if (!MainObj.IsTwoPage) {
                    gotoPage(MainObj.NowPage - 1, true, false);
                } else {
                    gotoPage(MainObj.NowPage - 2, true, false);
                }

                this.afterClick = !this.afterClick;
                checkBtnChange(this);
                var objprevPage = this;
                setTimeout(function () {
                    objprevPage.afterClick = !objprevPage.afterClick;
                    checkBtnChange(objprevPage);
                }, 200);
            }
        }, {
            //下頁
            "id": "nextPage",
            "beforespanTextName": "下頁",
            "afterspanTextName": "下頁",
            "afterClick": false,
            "beforeStyle": {
                'background-image': 'ToolBar/btnNextPagebefore.png'
            },
            "afterStyle": {
                'background-image': 'ToolBar/btnNextPageafter.png'
            },
            action: function () {
                if (!this.afterClick) {
                    changeAllBtnToFalse();
                }

                if (!MainObj.IsTwoPage) {
                    gotoPage(MainObj.NowPage + 1, true, true);
                } else {
                    gotoPage(MainObj.NowPage + 2, true, true);
                }

                this.afterClick = !this.afterClick;
                checkBtnChange(this);
                var objnextPage = this;
                setTimeout(function () {
                    objnextPage.afterClick = !objnextPage.afterClick;
                    checkBtnChange(objnextPage);
                }, 200);
            }
        }, {
            // 全文檢索
            "id": "textSearch",
            "beforespanTextName": "全文檢索",
            "afterspanTextName": "全文檢索",
            "afterClick": false,
            "type": "textSearch",
            "beforeStyle": {
                'background-image': 'ToolBar/btnSearchBefore.png'
            },
            "afterStyle": {
                'background-image': 'ToolBar/btnSearchAfter.png'
            },
            action: function () {
                if (!this.afterClick) {
                    changeAllBtnToFalse();
                }

                if (TextlocationList == '') {
                    return;
                }

                $('.searchText-layout').toggle();

                this.afterClick = !this.afterClick;
                checkBtnChange(this);
            }
        }, {
            // 操作說明
            "id": "instructions",
            "beforespanTextName": "操作說明",
            "afterspanTextName": "操作說明",
            "afterClick": false,
            "beforeStyle": {
                'background-image': 'ToolBar/instructions_before.png'
            },
            "afterStyle": {
                'background-image': 'ToolBar/instructions_after.png'
            },
            action: function () {
                if (!this.afterClick) {
                    changeAllBtnToFalse();
                }
                this.afterClick = !this.afterClick;
                checkBtnChange(this);

                if (this.afterClick) {
                    if (ReceiveList) {
                        $('.operating-layout-pc').css('display', 'flex');
                        $('#operating-pc-img1').css('display', 'block');
                    } else {
                        $('.operating-layout').css('display', 'flex');
                        $('#operating-img1').css('display', 'block');
                    }
                    operatingResize();
                } else {
                    $('.operating-layout').css('display', 'none');
                    $('.operating-layout-pc').css('display', 'none');
                }
            }
        }, {
            // 文字便利貼
            "id": 'txtnote',
            "beforespanTextName": "文字便利貼",
            "afterspanTextName": "文字便利貼",
            "beforeStyle": {
                'background-image': 'ToolBar/btnNoteBefore.png'
            },
            "afterStyle": {
                'background-image': 'ToolBar/btnNoteAfter.png'
            },
            action: function () {
                if (!this.afterClick) {
                    changeAllBtnToFalse();
                }

                this.afterClick = !this.afterClick;
                checkBtnChange(this);

                if (ToolBarList.AddWidgetState == 'txtNote') {
                    ToolBarList.AddWidgetState = 'none';
                } else {
                    ToolBarList.AddWidgetState = 'txtNote'
                }

            },
            "afterClick": false,
            "type": "txtNote"
        }, {
            // 手寫便利貼 
            "id": "txtcanvas",
            "beforespanTextName": "手寫便利貼",
            "afterspanTextName": "手寫便利貼",
            "beforeStyle": {
                'background-image': 'ToolBar/btnCanvasBefore.png'
            },
            "afterStyle": {
                'background-image': 'ToolBar/btnCanvasAfter.png'
            },
            action: function () {
                if (!this.afterClick) {
                    changeAllBtnToFalse();
                }

                this.afterClick = !this.afterClick;
                checkBtnChange(this);

                if (ToolBarList.AddWidgetState == 'txtCanvas') {
                    ToolBarList.AddWidgetState = 'none';
                } else {
                    ToolBarList.AddWidgetState = 'txtCanvas'
                }
            },
            "afterClick": false,
            "type": "txtCanvas"
        }, {
            // 插入檔案
            "id": "insertFile",
            "beforespanTextName": "插入檔案",
            "afterspanTextName": "插入檔案",
            "afterClick": false,
            "beforeStyle": {
                'background-image': 'ToolBar/filebefore.png'
            },
            "afterStyle": {
                'background-image': 'ToolBar/fileafter.png'
            },
            action: function () {
                if (!this.afterClick) {
                    changeAllBtnToFalse();
                }
                this.afterClick = !this.afterClick;
                checkBtnChange(this);

                if (ReceiveList) {
                    CommandToWPF('OpenFile');
                } else {
                    $('#fileinput').click();
                }
            }
        }, {
            // 插入超連結
            "id": "insertLink",
            "beforespanTextName": "插入超連結",
            "afterspanTextName": "插入超連結",
            "afterClick": false,
            "beforeStyle": {
                'background-image': 'ToolBar/linkbefore.png'
            },
            "afterStyle": {
                'background-image': 'ToolBar/linkafter.png'
            },
            action: function () {
                if (!this.afterClick) {
                    changeAllBtnToFalse();
                }
                this.afterClick = !this.afterClick;
                checkBtnChange(this);

                $('.inputLink-layout').toggle();
            }
        }, {
            //調色盤
            "id": "ColorsPicker",
            "beforespanTextName": "調色盤",
            "afterspanTextName": "調色盤",
            "afterClick": false,
            "type": "colorPicker",
            "beforeStyle": {
                'background-image': 'ToolBar/btnPaletteBefore.png'
            },
            "afterStyle": {
                'background-image': 'ToolBar/btnPaletteAfter.png'
            },
            action: function () {
                ToolBarList.BeforeState = ToolBarList.AddWidgetState;

                if (!this.afterClick) {
                    changeAllBtnToFalse();
                }

                this.afterClick = !this.afterClick;
                checkBtnChange(this);

                if (ToolBarList.AddWidgetState == 'ColorsPicker') {
                    ToolBarList.AddWidgetState = 'none';
                } else {
                    ToolBarList.AddWidgetState = 'ColorsPicker'

                    var last = $('body').children().last();
                    $('.colorPicker-layout').insertAfter($(last));
                }

                $('.colorPicker-layout').toggle();
            }
        }, {
            //橡皮擦
            "id": "eraser",
            "beforespanTextName": "橡皮擦",
            "afterspanTextName": "橡皮擦",
            "afterClick": false,
            "type": "eraser",
            "beforeStyle": {
                'background-image': 'ToolBar/btnEraserBefore.png'
            },
            "afterStyle": {
                'background-image': 'ToolBar/btnEraserAfter.png'
            },
            action: function () {
                if (!this.afterClick) {
                    changeAllBtnToFalse();
                }

                this.afterClick = !this.afterClick;
                checkBtnChange(this);

                if (ToolBarList.AddWidgetState == 'eraser') {
                    GalleryStartMove();
                    ToolBarList.AddWidgetState = 'none';
                    $('#canvasEraser').remove();
                } else {
                    ToolBarList.AddWidgetState = 'eraser';

                    GalleryStopMove();
                    NewCanvas();
                    var canvasEraser = $('#canvas')[0];
                    canvasEraser.id = 'canvasEraser';
                    $(canvasEraser).attr('class', 'canvasEraser');
                    canvasEraser.width = $(window).width() * ToolBarList.ZoomScale;
                    canvasEraser.height = $(window).height() * ToolBarList.ZoomScale;
                    $(canvasEraser).css({
                        'left': ZoomList.IsZoom ? ZoomList.Left : 0,
                        'top': ZoomList.IsZoom ? ZoomList.Top : 0,
                        'z-index': 1000
                    })

                    $(canvasEraser).on('mousedown touchstart', function (e) {
                        StartEraser(e, canvasEraser);
                    });
                    $(canvasEraser).on('mousemove touchmove', function (e) {
                        EraserMove(e, canvasEraser);
                    });
                    $(canvasEraser).on('mouseup touchend', function (e) {
                        EraserUp(e, canvasEraser);
                    });

                    $(canvasEraser).on('dblclick', function (e) {
                        GalleryStartMove();
                        ToolBarList.AddWidgetState = 'none';
                        $('#canvasEraser').remove();
                        changeAllBtnToFalse();
                    });

                    Hammer(canvasEraser).on('doubletap', function (e) {
                        GalleryStartMove();
                        ToolBarList.AddWidgetState = 'none';
                        $('#canvasEraser').remove();
                        changeAllBtnToFalse();
                    });
                }
            }
        }, {
            //註解
            "id": "comment",
            "beforespanTextName": "註解",
            "afterspanTextName": "註解",
            "afterClick": false,
            "beforeStyle": {
                'background-image': 'ToolBar/commentbefore.png'
            },
            "afterStyle": {
                'background-image': 'ToolBar/commentafter.png'
            },
            action: function () {
                if (!this.afterClick) {
                    changeAllBtnToFalse();
                }

                this.afterClick = !this.afterClick;
                checkBtnChange(this);

                if (ToolBarList.AddWidgetState == 'comment') {
                    GalleryStartMove();
                    ToolBarList.AddWidgetState = 'none';
                    $('#canvasPad').remove();
                } else {
                    ToolBarList.AddWidgetState = 'comment';

                    GalleryStopMove();
                    NewCanvas();
                    var canvasPad = $('#canvas')[0];
                    canvasPad.id = 'canvasPad';
                    $(canvasPad).attr('class', 'canvasPad')
                    canvasPad.width = $(window).width() * ToolBarList.ZoomScale;
                    canvasPad.height = $(window).height() * ToolBarList.ZoomScale;
                    var cxt = canvasPad.getContext('2d');
                    cxt.strokeStyle = '#000000';
                    cxt.lineWidth = 6;
                    cxt.globalAlpha = 1;

                    $(canvasPad).on('mousedown', function (e) {
                        startComment(e);
                    });
                    $(canvasPad).on('mousemove', function (e) {
                        moveComment(e, canvasPad);
                    });
                    $(canvasPad).on('mouseup', function () {
                        upComment(canvasPad);
                        changeAllBtnToFalse();
                    });

                    $(canvasPad).on('touchstart', function (e) {
                        startComment(e);
                    });
                    $(canvasPad).on('touchmove', function (e) {
                        moveComment(e, canvasPad);
                    });
                    $(canvasPad).on('touchend', function () {
                        upComment(canvasPad);
                        changeAllBtnToFalse();
                    });
                }

            }
        }, {
            //放大
            "id": "zoomIn",
            "beforespanTextName": "放大",
            "afterspanTextName": "放大",
            "beforeStyle": {
                'background-image': 'ToolBar/btnZoomInBefore.png'
            },
            "afterStyle": {
                'background-image': 'ToolBar/btnZoomInAfter.png'
            },
            "afterClick": false,
            action: function () {
                changeAllBtnToFalse();

                if (ToolBarList.ZoomScale == 3) {
                    this.afterClick = true;
                    // checkBtnChange(this);
                    return;
                }

                zoomIn();
                NewOffset();
            }
        }, {
            //縮小
            "id": "zoomOut",
            "beforespanTextName": "縮小",
            "afterspanTextName": "縮小",
            "beforeStyle": {
                'background-image': 'ToolBar/btnZoomOutBefore.png'
            },
            "afterStyle": {
                'background-image': 'ToolBar/btnZoomOutAfter.png'
            },
            "afterClick": false,
            action: function () {
                changeAllBtnToFalse();

                if (ToolBarList.ZoomScale == 1) {
                    this.afterClick = true;
                    checkBtnChange(this);
                    return;
                }

                zoomOut();
                NewOffset();
            }
        }, {
            // 整頁顯示
            "id": "zoom100",
            "beforespanTextName": "整頁顯示",
            "afterspanTextName": "整頁顯示",
            "afterClick": false,
            "beforeStyle": {
                'background-image': 'ToolBar/btnViewBefore.png'
            },
            "afterStyle": {
                'background-image': 'ToolBar/btnViewAfter.png'
            },
            action: function () {
                changeAllBtnToFalse();

                this.afterClick = !this.afterClick;
                checkBtnChange(this);
                var objzoom100 = this;
                setTimeout(function () {
                    objzoom100.afterClick = !objzoom100.afterClick;
                    checkBtnChange(objzoom100);
                }, 200);

                zoomOut(true);
            }
        }, {
            //點選/拖曳
            "id": "palm",
            "beforespanTextName": "點選/拖曳",
            "afterspanTextName": "點選/拖曳",
            "afterClick": false,
            "beforeStyle": {
                'background-image': 'ToolBar/palmbefore.png'
            },
            "afterStyle": {
                'background-image': 'ToolBar/palmafter.png'
            },
            action: function () {
                if (!this.afterClick) {
                    changeAllBtnToFalse();
                }
                this.afterClick = !this.afterClick;
                checkBtnChange(this);

                DragCanvas(this.afterClick);
            }
        }, {
            //數位黑板
            "id": "blackboard",
            "beforespanTextName": "數位黑板",
            "afterspanTextName": "數位黑板",
            "afterClick": false,
            "beforeStyle": {
                'background-image': 'ToolBar/blackboardbefore.png'
            },
            "afterStyle": {
                'background-image': 'ToolBar/blackboardafter.png'
            },
            action: function () {
                if (!this.afterClick) {
                    changeAllBtnToFalse();
                }

                this.afterClick = !this.afterClick;
                checkBtnChange(this);

                var browser = detect.parse(navigator.userAgent).browser.family;

                if (browser == 'IE') {
                    if (this.afterClick) {
                        isBlackBoard = true;
                        createRange();
                    } else {
                        isBlackBoard = false;
                        $('.rangeBlock').remove();
                        blackBoardRange = 100;
                    }
                    gotoPage(MainObj.NowPage);
                } else {
                    if (this.afterClick) {
                        $('#HamastarWrapper').css('-webkit-filter', 'invert(100%)');
                        createRange();
                    } else {
                        $('#HamastarWrapper').css('-webkit-filter', 'none');
                        $('.rangeBlock').remove();
                    }
                }
            }
        }, {
            //計時器
            "id": "noteTimer",
            "beforespanTextName": "計時器",
            "afterspanTextName": "計時器",
            "afterClick": false,
            "beforeStyle": {
                'background-image': 'ToolBar/noteTimerbefore.png'
            },
            "afterStyle": {
                'background-image': 'ToolBar/noteTimerafter.png'
            },
            action: function () {
                if (!this.afterClick) {
                    changeAllBtnToFalse();
                }

                this.afterClick = !this.afterClick;
                checkBtnChange(this);

                $('.timer_layout').toggle();
                resetTimer();

            }
        }, {
            //選號器
            "id": "selector",
            "beforespanTextName": "選號器",
            "afterspanTextName": "選號器",
            "afterClick": false,
            "beforeStyle": {
                'background-image': 'ToolBar/selectorbefore.png'
            },
            "afterStyle": {
                'background-image': 'ToolBar/selectorafter.png'
            },
            action: function () {
                if (!this.afterClick) {
                    changeAllBtnToFalse();
                }

                this.afterClick = !this.afterClick;
                checkBtnChange(this);

                resetSelector();
                if (this.afterClick) {
                    $('.selector_layout').css('display', 'block');
                } else {
                    $('.selector_layout').css('display', 'none');
                }
            }
        }, {
            // 文字白板
            "id": "textWhiteboard",
            "beforespanTextName": "文字白板",
            "afterspanTextName": "文字白板",
            "afterClick": false,
            "beforeStyle": {
                'background-image': 'ToolBar/textWhiteboardbefore.png'
            },
            "afterStyle": {
                'background-image': 'ToolBar/textWhiteboardafter.png'
            },
            action: function () {
                if (!this.afterClick) {
                    changeAllBtnToFalse();
                }

                this.afterClick = !this.afterClick;
                checkBtnChange(this);

                BoardMainobj.Text.Show = this.afterClick;
                $('.textboard-layout').toggle();
            }
        }, {
            // 手寫白板
            "id": "canvasWhiteboard",
            "beforespanTextName": "手寫白板",
            "afterspanTextName": "手寫白板",
            "afterClick": false,
            "beforeStyle": {
                'background-image': 'ToolBar/canvasWhiteboardbefore.png'
            },
            "afterStyle": {
                'background-image': 'ToolBar/canvasWhiteboardafter.png'
            },
            action: function () {
                if (!this.afterClick) {
                    changeAllBtnToFalse();
                }

                this.afterClick = !this.afterClick;
                checkBtnChange(this);

                BoardMainobj.Canvas.Show = this.afterClick;
                $('.canvasboard-layout').toggle();
            }
        }, {
            //清除全部
            "id": "clearAll",
            "beforespanTextName": "清除全部",
            "afterspanTextName": "清除全部",
            "afterClick": false,
            "type": "colorPicker",
            "beforeStyle": {
                'background-image': 'ToolBar/clearAllbefore.png'
            },
            "afterStyle": {
                'background-image': 'ToolBar/clearAllafter.png'
            },
            action: function () {
                changeAllBtnToFalse();

                confirmShow('是否確定刪除全部物件', "", false, function (res) {
                    if (res) {
                        clearAllNote();
                    }
                })
            }
        }, {
            // 上傳編修檔
            "id": "uploadEdit",
            "beforespanTextName": "上傳編修檔",
            "afterspanTextName": "上傳編修檔",
            "afterClick": false,
            "beforeStyle": {
                'background-image': 'ToolBar/uploadEditbefore.png'
            },
            "afterStyle": {
                'background-image': 'ToolBar/uploadEditafter.png'
            },
            action: function () {
                if (!this.afterClick) {
                    changeAllBtnToFalse();
                }

                this.afterClick = !this.afterClick;
                checkBtnChange(this);

                $('.editor-layout').css('display', 'block');
                $('.editor-input')[0].value = moment().format('YYYY-MM-DD HH:mm:ss') + ' ' + BookList.EBookName;
            }
        }, {
            // 下載編修檔
            "id": "downloadEdit",
            "beforespanTextName": "下載編修檔",
            "afterspanTextName": "下載編修檔",
            "afterClick": false,
            "beforeStyle": {
                'background-image': 'ToolBar/downloadEditbefore.png'
            },
            "afterStyle": {
                'background-image': 'ToolBar/downloadEditafter.png'
            },
            action: function () {
                if (!this.afterClick) {
                    changeAllBtnToFalse();
                }

                this.afterClick = !this.afterClick;
                checkBtnChange(this);

                CommandToWPF('DownloadNoteData');
            }
        }, {
            // 註記移動
            "id": "noteMove",
            "beforespanTextName": "註記移動",
            "afterspanTextName": "註記移動",
            "afterClick": false,
            "beforeStyle": {
                'background-image': 'ToolBar/noteMoveBefore.png'
            },
            "afterStyle": {
                'background-image': 'ToolBar/noteMoveAfter.png'
            },
            action: function () {
                if (!this.afterClick) {
                    changeAllBtnToFalse();
                }

                this.afterClick = !this.afterClick;
                checkBtnChange(this);

                $('.noteMove-layout').toggle();
                if (this.afterClick) {
                    setNoteMove();

                    for (var i = 0; i < Base64ImageList.length - 1; i++) {
                        var Widget = false;
                        if (txtCanvas.SaveList.length > 0) {
                            for (var x = 0; x < txtCanvas.SaveList.length; x++) {
                                // console.log(txtCanvas.SaveList[i]);
                                if (txtCanvas.SaveList[x] != undefined) {
                                    if (txtCanvas.SaveList[x].page == i) {
                                        Widget = true;
                                    }
                                }
                            }
                        }

                        if (txtNote.SaveList.length > 0) {
                            for (var y = 0; y < txtNote.SaveList.length; y++) {
                                // console.log(txtCanvas.SaveList[i]);
                                if (txtNote.SaveList[y] != undefined) {
                                    if (txtNote.SaveList[y].page == i) {
                                        Widget = true;
                                    }
                                }
                            }
                        }

                        colorPen.LineList.map(function (res) {
                            if (res.page == i) {
                                Widget = true;
                            }
                        });

                        txtComment.saveList.map(function (res) {
                            if (res.page == i) {
                                Widget = true;
                            }
                        });

                        fileObj.saveList.map(function (res) {
                            if (res.page == i && res.IsPatch != 'true') {
                                Widget = true;
                            }
                        });

                        hyperLink.saveList.map(function (res) {
                            if (res.page == i) {
                                Widget = true;
                            }
                        });

                        if (Widget) {
                            var noteImg = new Image();
                            $('#noteMove-' + i).append(noteImg);
                            $(noteImg).addClass('noteTag');
                            noteImg.src = 'css/Images/noteicon.png';
                            $(noteImg).css({
                                'top': '1em',
                                'right': 0,
                                'position': 'absolute'
                            })

                            noteMoveEvent(i);
                        }
                    }
                } else {
                    $('.noteTag').remove();
                    $('.noteMove-block').remove();
                }

            }
        }, {
            "id": "open",
            "beforespanTextName": "開啟舊檔",
            "afterspanTextName": "開啟舊檔",
            "afterClick": false,
            "beforeStyle": {
                'background-image': 'ToolBar/Openbefore.png'
            },
            "afterStyle": {
                'background-image': 'ToolBar/Openafter.png'
            },
            action: function () {
                if (!this.afterClick) {
                    changeAllBtnToFalse();
                }

                this.afterClick = !this.afterClick;
                checkBtnChange(this);


                CommandToWPF('OpenNoteData');
            }
        }, {
            "id": "saveas",
            "beforespanTextName": "另存新檔",
            "afterspanTextName": "另存新檔",
            "afterClick": false,
            "beforeStyle": {
                'background-image': 'ToolBar/SaveAsbefore.png'
            },
            "afterStyle": {
                'background-image': 'ToolBar/SaveAsafter.png'
            },
            action: function () {
                if (!this.afterClick) {
                    changeAllBtnToFalse();
                }

                this.afterClick = !this.afterClick;
                checkBtnChange(this);

                CommandToWPF('SaveAsNoteData', JSON.stringify({
                    name: moment().format('YYYY-MM-DD HH:mm:ss') + ' ' + BookList.EBookName,
                    note: sendXML(true)
                }));
            }
        }, {
            //全螢幕
            "id": "fullscreen",
            "beforespanTextName": "全螢幕",
            "afterspanTextName": "全螢幕",
            "afterClick": false,
            "beforeStyle": {
                'background-image': 'ToolBar/btnFullScreenBefore.png'
            },
            "afterStyle": {
                'background-image': 'ToolBar/btnFullScreenAfter.png'
            },
            action: function () {
                if (!this.afterClick) {
                    changeAllBtnToFalse();
                }

                this.afterClick = !this.afterClick;
                checkBtnChange(this);

                var elem = $('body')[0];

                var isFullScreen = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;

                if (!isFullScreen) { // 目前非全螢幕狀態 開啟全螢幕
                    if (elem.requestFullscreen) {
                        elem.requestFullscreen();
                    } else if (elem.msRequestFullscreen) {
                        elem.msRequestFullscreen();
                    } else if (elem.mozRequestFullScreen) {
                        elem.mozRequestFullScreen();
                    } else if (elem.webkitRequestFullscreen) {
                        elem.webkitRequestFullscreen();
                    }
                    fullScreen = true;
                } else { // 目前為全螢幕狀態 關閉全螢幕
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.msExitFullscreen) {
                        document.msExitFullscreen();
                    } else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                    } else if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    }
                    fullScreen = false;
                }
            }
        }, {
            //封面
            "id": "coverPage",
            "beforespanTextName": "封面",
            "afterspanTextName": "封面",
            "afterClick": false,
            "beforeStyle": {
                'background-image': 'ToolBar/btnCoverPage.png'
            },
            "afterStyle": {
                'background-image': 'ToolBar/btnCoverPage.png'
            },
            action: function () {
                changeAllBtnToFalse();
                gotoPage(0);
            }
        }, {
            //封底
            "id": "backCoverPage",
            "beforespanTextName": "封底",
            "afterspanTextName": "封底",
            "afterClick": false,
            "beforeStyle": {
                'background-image': 'ToolBar/btnBackCoverPage.png'
            },
            "afterStyle": {
                'background-image': 'ToolBar/btnBackCoverPage.png'
            },
            action: function () {
                changeAllBtnToFalse();
                gotoPage(HamaList.length - 1);
            }
        }]
    }
];