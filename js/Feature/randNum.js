// 開始選號
function startRandomNumber() {
    var min = Number($('.selector_min')[0].value);
    var max = Number($('.selector_max')[0].value);
    if (min && max) {
        var reg = /^[0-9]*$/;
        if (!reg.test(min) || !reg.test(max)) {
            alert('請輸入正確數字!');
            return;
        }
        if (min >= max) {
            alert('請輸入正確區間!');
            return;
        }
        var temp = [];
        var groupTemp = [];
        if (!$('.selector_group').val()) {
            var count = $('.selector_count').val();
            if (max - ToolBarList.selectorNumberList.length == 0) {
                $('.selector_answer')[0].innerHTML = '已全部選取!';
                return;
            } else if (max - ToolBarList.selectorNumberList.length < count) {
                count = max - ToolBarList.selectorNumberList.length;
            }
            for (var i = 0; i < count; i++) {
                var number = getRandom(min, max, temp);
                temp.push(number);
                ToolBarList.selectorNumberList.push(number);
            }
            $('.selector_answer')[0].innerHTML = temp.sort(function (a, b) {
                return a - b;
            }).join('、');
        } else {
            var allCount = max - min + 1;
            if ($('.selector_group').val() > allCount) {
                alert('分組數大於區間，請重新選擇');
                return;
            }
            var groupCount = $('.selector_group').val();
            var data = [];
            for (var x = min; x <= max; x++) {
                data.push(random(min, max, data));
            }

            var groups = [];
            var eachGroupCount = Math.ceil(data.length / groupCount);
            for (var i = 0; i < groupCount; i++) {
                groups.push([]);
            }
            for (var index = 0; index < data.length; index++) {
                groups[Math.floor(index / eachGroupCount)].push(data[index]);
            }

            $('.selector_answer')[0].innerHTML = groups.map(function (x) {
                return x.sort(function (a, b) {
                    return a - b;
                }).join(',');
            }).join('<br>');

        }
    }
}

function random(min, max, arr) {
    var temp = Math.floor(Math.random() * (max - min + 1)) + min;
    if (arr.includes(temp)) {
        temp = random(min, max, arr);
    }
    return temp;
}

//選號器，產生min到max之間的亂數 (不能重複)
function getRandom(min, max, oldList) {
    var temp = Math.floor(Math.random() * (max - min + 1)) + min;
    var isSame = oldList.filter(function (x) {
        if (x == temp) {
            return x;
        }
    });
    if (isSame.length) {
        temp = getRandom(min, max, oldList);
    }
    isSame = ToolBarList.selectorNumberList.filter(function (x) {
        if (x == temp) {
            return x;
        }
    });
    if (isSame.length) {
        temp = getRandom(min, max, oldList);
    }
    return temp;
};

// 關閉選號器
function closeSelector() {
    changeAllBtnToFalse();
    $('.selector_layout').css('display', 'none');
    resetSelector();
}

// 重置選號器
function resetSelector() {
    ToolBarList.selectorNumberList = [];
    $('.selector_min')[0].value = '1';
    $('.selector_max')[0].value = '50';
    $('.selector_answer')[0].innerHTML = '';
    $('.selector_group').val(0);
    $('.selector_count').children().each(function () {
        if ($(this).text() == 1) {
            this.selected = true;
        }
    });
}