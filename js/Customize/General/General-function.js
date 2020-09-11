//首頁
function CustomIndex() {
    //頁面目錄-書籤
    var JumpTab = $("#btnTab");
    //頁面目錄-章節
    var JumpChapter = $("#btnChapter");

    JumpTab.remove();
    JumpChapter.remove();
}

//工具列
function CustomToolBar() {
    //主工具列
    var ToolBar = $('#ToolBar');
    //主工具列Icon
    var ToolBarIcon = $('#ToolBarIcon');
    //輔助工具列
    var AssistToolBar = $('#AssistToolBar');
    //輔助工具列Icon
    var AssistToolBarIcon = $('#AssistToolBarIcon');
    //預設調色盤
    var DefaultColor = $("#DefaultColor");
    //客製化調色盤
    var CustomColor = $("#CustomColor");

    ToolBar.show();
    DefaultColor.show();
}

function CustomPen() {
    //客製化畫筆
    var Pen = false;
    //畫筆寬度(4 ~ 24)
    var PenWidth = 4
    //畫筆透明度(0 ~ 1)
    var PenOpacity = 1;

    $("#chance_slider").val(PenWidth);
    $("#chance_sliderop").val(PenOpacity * 10);
    colorPen.Width = PenWidth;
    colorPen.Opacity = PenOpacity;
}