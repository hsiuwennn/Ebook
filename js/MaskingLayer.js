//遮罩貼紙

//遮罩canvas設定
function MaskSetting(obj) {
    var scale = MainObj.Scale;
    var Left = obj.Left * scale + MainObj.CanvasL;
    var Top = obj.Top * scale + MainObj.CanvasT;
    var Width = obj.Width * scale;
    var Height = obj.Height * scale;

    $('#canvas')[0].class = 'canvasObj';
    var canvasMaskingID = obj.Identifier;

    $('#canvas')[0].id = canvasMaskingID;
    $('#' + canvasMaskingID)[0].width = Width;
    $('#' + canvasMaskingID)[0].height = Height;
    $('#' + canvasMaskingID).css({ 'left': Left, 'top': Top });

    var canvas = $('#' + canvasMaskingID)[0];
    var cxt = canvas.getContext('2d');
    

    borderstyle(canvasMaskingID, obj.BorderStyle, obj.BrushColor, obj.PixelSize);
    cxt.strokeRect(obj.PixelSize, obj.PixelSize, Width, Height);
    cxt.fillStyle = obj.BrushColor;
    cxt.fillRect(0, 0, Width, Height);
    invertCanvas(cxt, Width, Height);

    drawButtonImage(obj, cxt, Width, Height);

    //遮罩點擊事件
    $('#' + canvasMaskingID).click(function(e) {
        e.preventDefault();

        fadeOut(this);
    })
}

//遮罩貼紙fadeout
function fadeOut(mask) {
    $(mask).fadeOut(700, function() {
        $(this).remove();
    });
}