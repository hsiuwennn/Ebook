//影片
var videoMainobj = {
    fullscreen: false
}

function NewVideo(obj, scale) {
    if ($('#' + obj.Identifier)[0] == null) {

        var NewVideo = document.createElement('video');
        NewVideo.id = obj.Identifier;
        NewVideo.width = obj.Width * scale;
        NewVideo.height = obj.Height * scale;
        var Left = obj.Left * scale;
        var Top = obj.Top * scale;
        $('#HamastarWrapper').append(NewVideo);

        $(NewVideo)
        .attr('class', 'video')
        .css({
            'position': 'absolute',
            'cursor': 'pointer',
            'left': Left + MainObj.CanvasL,
            'top': Top + MainObj.CanvasT,
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

        } else {
            $('#' + NewVideo.id).click(function(e) {
                e.preventDefault();
                if (this.paused) {
                    this.play();
                } else {
                    this.pause();
                }
            });
        }

        //是否自動撥放
        if (obj.AutoPlay == '1') {
            $('#' + NewVideo.id).attr('autoplay', true);
        }

        //是否結束後淡出
        if (obj.Fadeout == 'true') {
            $('#' + NewVideo.id).on('ended', function() {
                // done playing
                $(this).fadeOut(400, function() {
                    $(this).remove();
                })
            });
        }
    }
}

function videoReset() {
    $('.video').remove();
}

//判斷是否為影片全螢幕
function videoFullscreen() {
    if (document.fullscreenElement && document.fullscreenElement.nodeName == 'VIDEO') {
        videoMainobj.fullscreen = true;
        return true;
    } else if (document.msFullscreenElement && document.msFullscreenElement.nodeName == 'VIDEO') {
        videoMainobj.fullscreen = true;
        return true;
    } else if (document.mozFullScreenElement && document.mozFullScreenElement.nodeName == 'VIDEO') {
        videoMainobj.fullscreen = true;
        return true;
    } else if (document.webkitFullscreenElement && document.webkitFullscreenElement.nodeName == 'VIDEO') {
        videoMainobj.fullscreen = true;
        return true;
    }

    return false;
}