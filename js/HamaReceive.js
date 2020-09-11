//站台溝通

var ReceiveList = null,
    StudentList = null,
    StudentImage = null,
    StudentNoAnswer = 0,
    StudentAnswerLength = 0,
    DiscussionImage = '',
    GroupList = null,
    RecodingTimer = null,
    isApp = false;

//關書
function CallExToExit() {
    try {
        window.external.rtexit();
    } catch (e) { }
}

//讀取備註檔案
function LoadNoteXML() {
    try {
        window.external.requestLoadNoteXML();
    } catch (e) {
        Html5WirteLog(e);
    }
}

//開書先呼叫站台
function CommandToWPF(commandName, objectBase64String) {
    try {
        window.external.commandFromHtml5(commandName, objectBase64String);
        isApp = true;
    } catch (e) {
        Html5WirteLog(e);
    }
}

//接收封包
function CommandToHtml5(commandName, objectBase64String) {
    try {
        switch (commandName) {
            //開書時站台回傳資訊
            case 'RequestExternalInformationResult':
                var obj = JSON.parse(objectBase64String);
                Html5WirteLog('RequestExternalInformationResult: ' + JSON.stringify(obj));
                //接收到的資訊存到ReceiveList
                ReceiveList = obj;
                $('#ToolBarUl>li').remove();
                getFaceModuleList();
                MainObj.token = ReceiveList.token;
                break;

            case 'WebcamSnapshotResult': //WebCam
            case 'ScreenShotInRegionResult': //螢幕截圖
                //用插入圖片的方式導入書裡
                InsertImg.File = 'data:image/png;base64,' + objectBase64String;
                if (ToolBarList.AddWidgetState == 'IRSinsert') {
                    ToolBarList.AddWidgetState = 'none';
                } else {
                    ToolBarList.AddWidgetState = 'IRSinsert';
                }

                break;
            case 'OpenFileResult': //插入檔案
                var fileName = objectBase64String;
                if (fileName) {
                    NewCanvas();
                    var canvas = $('#canvas')[0];
                    $(canvas).attr('class', 'inputFile');
                    canvas.id = 'inputFile';
                    $(canvas).css({
                        'left': MainObj.CanvasL,
                        'top': MainObj.CanvasT
                    });
                    if (fileName.split('.').pop().toLowerCase() == 'mp4') {
                        // 影片
                        $(canvas).click(function (e) {
                            e.preventDefault();
                            var mouseX = e.offsetX,
                                mouseY = e.offsetY;

                            var videoDiv = document.createElement('div');
                            var id = newguid();
                            videoDiv.id = id;
                            $(videoDiv)
                                .attr('class', 'videoFile')
                                .css({
                                    width: 640,
                                    height: 360,
                                    'position': 'absolute',
                                    'left': mouseX,
                                    'top': mouseY,
                                    'z-index': 99
                                });
                            $('#HamastarWrapper').append(videoDiv);

                            var moveIcon = new Image();
                            moveIcon.src = 'css/Images/Drag.png';
                            $(moveIcon)
                                .addClass('moveIcon')
                                .css({
                                    'position': 'absolute',
                                    'top': 0,
                                    'right': 0,
                                    'z-index': 100,
                                    'cursor': 'move'
                                });
                            $(videoDiv).append(moveIcon);

                            var NewVideo = document.createElement('video');
                            NewVideo.id = 'canvas' + id;
                            NewVideo.width = 640;
                            NewVideo.height = 360;
                            $(videoDiv).append(NewVideo);

                            $(NewVideo)
                                .attr('controls', true)
                                .css({
                                    'position': 'absolute',
                                    'cursor': 'pointer',
                                    'object-fit': 'fill'
                                })
                                .on('play', function () {
                                    var last = $('#HamastarWrapper').children().last();
                                    $(this).closest('.videoFile').insertAfter($(last));
                                })
                                .on('pause', function () {
                                    var last = $('#HamastarWrapper').children().last();
                                    $(this).closest('.videoFile').insertAfter($(last));
                                })
                                .on('fullscreenchange', function () {
                                    if (!videoFullscreen()) {
                                        videoMainobj.fullscreen = false;
                                    }
                                }).on('mozfullscreenchange', function () {
                                    if (!videoFullscreen()) {
                                        videoMainobj.fullscreen = false;
                                    }
                                }).on('webkitfullscreenchange', function () {
                                    if (!videoFullscreen()) {
                                        videoMainobj.fullscreen = false;
                                    }
                                }).on('msfullscreenchange', function () {
                                    if (!videoFullscreen()) {
                                        videoMainobj.fullscreen = false;
                                    }
                                });

                            NewVideo.src = 'Note/' + fileName;

                            $(videoDiv).resizable({
                                alsoResize: '#' + videoDiv.id + '>video',
                                minHeight: 100,
                                minWidth: 100,
                                start: function () {
                                    $(window).off("resize", resizeInit);
                                },
                                stop: function () {
                                    $(window).resize(resizeInit);
                                    var fileTemp = this;
                                    fileObj.saveList = fileObj.saveList.map(function (x) {
                                        if (('canvas' + x.id) == fileTemp.id) {
                                            x.width = $(fileTemp).width() / MainObj.Scale;
                                            x.height = $(fileTemp).height() / MainObj.Scale;
                                        }
                                        return x;
                                    });
                                }
                            });

                            $(videoDiv).draggable({
                                handle: '.moveIcon',
                                scroll: false,
                                stop: function (e) {
                                    var fileTemp = this;
                                    fileObj.saveList = fileObj.saveList.map(function (x) {
                                        if (x.id == fileTemp.id) {
                                            x.left = Math.floor(($(fileTemp).offset().left - MainObj.CanvasL) / MainObj.Scale);
                                            x.top = Math.floor(($(fileTemp).offset().top - MainObj.CanvasT) / MainObj.Scale);
                                        }
                                        return x;
                                    });
                                }
                            });

                            $('#inputFile').remove();

                            fileObj.saveList.push({
                                id: id,
                                page: MainObj.NowPage,
                                type: 'file',
                                fileName: fileName,
                                left: Math.floor(($(videoDiv).offset().left - MainObj.CanvasL) / MainObj.Scale),
                                top: Math.floor(($(videoDiv).offset().top - MainObj.CanvasT) / MainObj.Scale),
                                width: 640 / MainObj.Scale,
                                height: 360 / MainObj.Scale
                            });
                        });
                    } else {
                        // 圖片or其他檔案
                        $(canvas).click(function (e) {
                            e.preventDefault();
                            var mouseX = e.offsetX,
                                mouseY = e.offsetY;
                            NewCanvas();
                            var fileCanvas = $('#canvas')[0];
                            var id = newguid();
                            fileCanvas.id = 'canvas' + id;
                            $(fileCanvas).attr('class', 'fileObj');
                            var fileCxt = fileCanvas.getContext('2d');
                            var img = new Image();
                            $(fileCanvas).css({
                                'left': mouseX,
                                'top': mouseY
                            })
                            img.onload = function () {
                                fileCanvas.width = img.width;
                                fileCanvas.height = img.height;
                                fileCxt.drawImage(img, 0, 0, fileCanvas.width, fileCanvas.height);

                                $(fileCanvas).resizable({
                                    minHeight: 32,
                                    minWidth: 32,
                                    start: function () {
                                        $(window).off("resize", resizeInit);
                                    },
                                    stop: function () {
                                        $(window).resize(resizeInit);
                                        var fileTemp = $(this).children()[0];
                                        fileObj.saveList = fileObj.saveList.map(function (x) {
                                            if (('canvas' + x.id) == fileTemp.id) {
                                                x.width = $(fileTemp).width() / MainObj.Scale;
                                                x.height = $(fileTemp).height() / MainObj.Scale;
                                            }
                                            return x;
                                        });
                                    }
                                });

                                fileCanvas.parentElement.id = id;
                                $(fileCanvas.parentElement).draggable({
                                    scroll: false,
                                    stop: function (e) {
                                        var fileTemp = $(this).children()[0];
                                        fileObj.saveList = fileObj.saveList.map(function (x) {
                                            if (('canvas' + x.id) == fileTemp.id) {
                                                x.left = Math.floor(($(fileTemp).offset().left - MainObj.CanvasL) / MainObj.Scale);
                                                x.top = Math.floor(($(fileTemp).offset().top - MainObj.CanvasT) / MainObj.Scale);
                                            }
                                            return x;
                                        });
                                    }
                                });

                                $(fileCanvas.parentElement).click(function (e) {
                                    e.preventDefault();
                                    var link = document.createElement('a');
                                    link.href = 'Note/' + fileName;
                                    link.target = '_blank';
                                    link.innerHTML = fileName;
                                    link.download = fileName;
                                    link.click();
                                });

                                $('#inputFile').remove();

                                fileObj.saveList.push({
                                    id: id,
                                    page: MainObj.NowPage,
                                    type: 'file',
                                    fileName: fileName,
                                    left: Math.floor(($(fileCanvas).offset().left - MainObj.CanvasL) / MainObj.Scale),
                                    top: Math.floor(($(fileCanvas).offset().top - MainObj.CanvasT) / MainObj.Scale),
                                    width: img.width / MainObj.Scale,
                                    height: img.height / MainObj.Scale
                                });
                            };
                            // 檔案對應圖示
                            switch (fileName.split('.').pop().toLowerCase()) {
                                case 'doc':
                                case 'docx':
                                    img.src = 'css/Images/FileType/DocDocx.png';
                                    break;
                                case 'jpg':
                                case 'png':
                                case 'gif':
                                    img.src = 'Note/' + fileName;
                                    break;
                                case 'ppt':
                                case 'pptx':
                                    img.src = 'css/Images/FileType/PptPptx.png';
                                    break;
                                default:
                                    img.src = 'css/Images/FileType/' + fileName.split('.').pop().toLowerCase() + '.png';
                                    break;
                            }
                        });
                    }
                }
                break;

            case 'LoadNoteXML': // 開書要求註記
            case 'DownloadNoteDataResult': // 下載編修檔
                Html5WirteLog(commandName + ': ' + objectBase64String);
                if (objectBase64String) {
                    noteSwitch(objectBase64String);
                }
                window.external.requestLoadPatchXML();
                break;

            case 'LoadPatchXML': // 開書要求補丁
                Html5WirteLog(commandName + ': ' + objectBase64String);
                if (objectBase64String) {
                    setPatch(objectBase64String);
                }
                break;

            // 班級進度結果回傳
            case 'RequestClassScheduleResult':
                if (objectBase64String) {
                    Html5WirteLog(commandName + ': ' + objectBase64String);
                    $('.class-layout').toggle();
                    $('.class-tr').remove();
                    classProgressList = JSON.parse(objectBase64String);
                    if (typeof (classProgressList) == 'string') {
                        classProgressList = JSON.parse(classProgressList);
                    }
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
                } else {
                    $('.class-layout').toggle();
                    $('.class-tr').remove();
                }
                break;
        }
    } catch (e) {
        Html5WirteLog("call CommandToHtml5 error");
        Html5WirteLog(e);
    }
}

//關閉按鈕狀態
function WTPCloseBtnState(IsClose) {
    try {
        changeAllBtnToFalse();
    } catch (e) {
        Html5WirteLog(e);
    }
}

//寫入Log
function Html5WirteLog(str) {
    try {
        window.external.html5WirteLog(str);
    } catch (e) {

    }
}