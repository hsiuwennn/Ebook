var blackBoardRange = 100;

// 數位黑板
function invertCanvas(cxt, width, height) {
    if (isBlackBoard) {
        var imgData = cxt.getImageData(0, 0, width, height);
        var data = imgData.data;

        for (var i = 0, len = data.length; i < len; i += 4) {
            data[i] = getInvertData(data[i]);
            data[i + 1] = getInvertData(data[i + 1]);
            data[i + 2] = getInvertData(data[i + 2]);
        }

        cxt.putImageData(imgData, 0, 0);
    }
}

// 取得數位黑板比例
function getInvertData(data) {
    var notData = 255 - data;
    var tempRange = notData - data;
    var result = data + ((tempRange / 100) * blackBoardRange);
    return result;
}

// 數位黑板range
function createRange() {
    var browser = detect.parse(navigator.userAgent).browser.family;
    var rangeDiv = document.createElement('div');
    $(rangeDiv)
        .addClass('rangeBlock')
        .css({
            'position': 'absolute',
            'bottom': 0,
            'left': 0,
            'z-index': 100,
            'width': '100vw',
            'padding': '10px 0',
            'display': 'flex',
            'justify-content': 'center',
            'align-items': 'center',
            'display': 'none'
        });
    $('body').append(rangeDiv);

    var range = document.createElement('input');
    $(range)
        .css('width', '90%')
        .addClass('custom-range')
        .attr({
            type: 'range',
            min: 0,
            max: 100,
            value: 100
        });

    if (browser == 'IE') {
        $(range).on('mouseup', function (e) {
            var value = e.target.value;
            blackBoardRange = Number(value);
            gotoPage(MainObj.NowPage);
        });
    } else {
        $(range).on('input change', function (e) {
            var value = e.target.value;
            $('#HamastarWrapper').css('-webkit-filter', 'invert(' + value + '%)');
        });
    }

    $(rangeDiv).append(range);
}