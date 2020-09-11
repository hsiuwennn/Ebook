// 開始計時
function startTimer() {
    var reg = /^\d{0,2}$/;
    if (!reg.test($('.time_h')[0].value) || !reg.test($('.time_m')[0].value) || !reg.test($('.time_s')[0].value)) {
        alert('請輸入正確時間');
        resetTimer();
        return;
    }
    var s = 0,
        m = 0,
        h = 0;

    if (ToolBarList.isStop) {
        ToolBarList.isStop = false;
        $('.timer_start')[0].innerHTML = '暫停';
        $('.timer_start').css('color', 'red');
        h = Number($('.time_h')[0].value);
        m = Number($('.time_m')[0].value);
        s = Number($('.time_s')[0].value);

        if (!ToolBarList.isCountdown) {
            ToolBarList.timer = setInterval(function () {
                s++;
                var time = new Date();
                time.setHours(h, m, s);
                s = time.getSeconds();
                m = time.getMinutes();
                h = time.getHours();
                $('.time_s')[0].value = s < 10 ? '0' + s : s;
                $('.time_m')[0].value = m < 10 ? '0' + m : m;
                $('.time_h')[0].value = h < 10 ? '0' + h : h;
            }, 1000);
        } else {
            ToolBarList.timer = setInterval(function () {
                s--;
                var time = new Date();
                time.setHours(h, m, s);
                s = time.getSeconds();
                m = time.getMinutes();
                h = time.getHours();
                $('.time_s')[0].value = s < 10 ? '0' + s : s;
                $('.time_m')[0].value = m < 10 ? '0' + m : m;
                $('.time_h')[0].value = h < 10 ? '0' + h : h;
                if (!s && !m && !h) {
                    // alert('Time`s Up!');
                    $('.timer_start')[0].innerHTML = '開始';
                    $('.timer_start').css('color', '#fff');
                    clearInterval(ToolBarList.timer);
                    ToolBarList.timer = null;
                    ToolBarList.isStop = false;
                    ToolBarList.isCountdown = false;
                    $('.time_s')[0].value = '00';
                    $('.time_m')[0].value = '00';
                    $('.time_h')[0].value = '00';
                }

                // 倒數計時mp3
                if ($('#timerAudio')[0]) {
                    $('#timerAudio')[0].play();
                } else if (!h && !m && s == 11) {
                    $('<audio/>', {
                        id: 'timerAudio',
                        class: 'timerAudio',
                        src: 'css/audio/timerAudio.mp3'
                    }).appendTo('#HamastarWrapper');
                    $('#timerAudio')[0].volume = 1;
                    $('#timerAudio')[0].play();

                    $('#timerAudio')
                        .on('ended', function () {
                            $(this).remove();
                        })
                }
            }, 1000);
        }
        return;
    }

    if ($('.timer_start')[0].innerHTML == '開始') {
        ToolBarList.isStop = false;
        $('.timer_start')[0].innerHTML = '暫停';
        $('.timer_start').css('color', 'red');

        h = Number($('.time_h')[0].value);
        m = Number($('.time_m')[0].value);
        s = Number($('.time_s')[0].value);

        if (!h && !m && !s) {
            ToolBarList.isCountdown = false;
            ToolBarList.timer = setInterval(function () {
                s++;
                var time = new Date();
                time.setHours(h, m, s);
                s = time.getSeconds();
                m = time.getMinutes();
                h = time.getHours();
                $('.time_s')[0].value = s < 10 ? '0' + s : s;
                $('.time_m')[0].value = m < 10 ? '0' + m : m;
                $('.time_h')[0].value = h < 10 ? '0' + h : h;
            }, 1000);
        } else {
            ToolBarList.isCountdown = true;
            ToolBarList.timer = setInterval(function () {
                s--;
                var time = new Date();
                time.setHours(h, m, s);
                s = time.getSeconds();
                m = time.getMinutes();
                h = time.getHours();
                $('.time_s')[0].value = s < 10 ? '0' + s : s;
                $('.time_m')[0].value = m < 10 ? '0' + m : m;
                $('.time_h')[0].value = h < 10 ? '0' + h : h;
                if (!s && !m && !h) {
                    // alert('Time`s Up!');
                    $('.timer_start')[0].innerHTML = '開始';
                    $('.timer_start').css('color', '#fff');
                    clearInterval(ToolBarList.timer);
                    ToolBarList.timer = null;
                    ToolBarList.isStop = false;
                    ToolBarList.isCountdown = false;
                    $('.time_s')[0].value = '00';
                    $('.time_m')[0].value = '00';
                    $('.time_h')[0].value = '00';
                }

                // 倒數計時mp3
                if (!h && !m && s == 11) {
                    if ($('#timerAudio')[0]) return;
                    $('<audio/>', {
                        id: 'timerAudio',
                        class: 'timerAudio',
                        src: 'css/audio/timerAudio.mp3'
                    }).appendTo('#HamastarWrapper');
                    $('#timerAudio')[0].volume = 1;
                    $('#timerAudio')[0].play();

                    $('#timerAudio')
                        .on('ended', function () {
                            $(this).remove();
                        })
                }
            }, 1000);
        }
    } else {
        $('.timer_start')[0].innerHTML = '開始';
        $('.timer_start').css('color', '#ffffff');
        clearInterval(ToolBarList.timer);
        ToolBarList.isStop = true;

        var timerAudio = $('#timerAudio')[0];
        if (timerAudio) {
            timerAudio.pause();
        }
    }
}

// 重置計時
function resetTimer() {
    $('.timer_start')[0].innerHTML = '開始';
    $('.timer_start').css('color', '#fff');
    clearInterval(ToolBarList.timer);
    ToolBarList.timer = null;
    ToolBarList.isStop = false;
    ToolBarList.isCountdown = false;
    $('.time_s')[0].value = '00';
    $('.time_m')[0].value = '00';
    $('.time_h')[0].value = '00';
    $('#timerAudio').remove();
}

// 關閉計時器
function closeTimer() {
    changeAllBtnToFalse();
    $('.timer_layout').css('display', 'none');
    resetTimer();
    $('#timerAudio').remove();
}