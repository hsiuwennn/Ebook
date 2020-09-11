//動態平移
Scroll = {
	Interval: {},
	Drag: false,
	Move: false,
	StageMove: false,
	MouseDown: {
		X: 0,
		Y: 0
	},
	MouseMove: {
		X: 0,
		Y: 0
	},
	Paging: null,
	MoveNow: {
		X: 0,
		Y: 0
	},
	Page: 0
};

function ScrollSet(obj, page) {
	var Left = obj.Left * MainObj.Scale + MainObj.CanvasL;
	var Top = obj.Top * MainObj.Scale + MainObj.CanvasT;
	var Width = obj.Width * MainObj.Scale;
	var Height = obj.Height * MainObj.Scale;

	var canvas = $('#canvas')[0];
	canvas.id = obj.Identifier;
	canvas.width = Width;
	canvas.height = Height;
	$(canvas).attr({
		'class': 'canvasObj'
	}).css({
		'left': Left,
		'top': Top
	});

	var cxt = canvas.getContext('2d');
	var stage = new createjs.Stage(canvas);
	createjs.Touch.enable(stage);
	stage.enableMouseOver(10);
	stage.mouseMoveOutside = true;

	var img = new Image();
	img.onload = function () {
		obj.move = 0;

		var Scrollbitmap = new createjs.Bitmap(img);
		stage.addChild(Scrollbitmap);
		Scrollbitmap.name = obj.Identifier;
		
		if (obj.Looping == 'true') {

			if (obj.Orientation == 'horizontal') {
				obj.Scale = Height / img.height;
				Width = img.width * obj.Scale;
			} else {
				obj.Scale = Width / img.width;
				Height = img.height * obj.Scale;
			}

			obj.ImgW = img.width * obj.Scale;
			obj.ImgH = img.height * obj.Scale;

			Scrollbitmap.scaleX = Width / img.width;
			Scrollbitmap.scaleY = Height / img.height;

			Scroll.Interval[obj.Identifier] = {
				ID: setInterval(function () {
					obj.move = ScrollLoop(stage, obj, img, Width, Height);
				}, Number(obj.PlayingInterval))
			}

			$(canvas).on('mousedown', function (e) {
				LoopingDown(e, obj)
			});
			$(canvas).on('mousemove', function (e) {
				LoopingMove(e, stage, obj, img, canvas, Width, Height)
			});
			$(canvas).on('mouseup', function (e) {
				LoopingUp(e, stage, obj, img, Width, Height)
			});
			$(canvas).on('mouseout', function (e) {
				LoopingUp(e, stage, obj, img, Width, Height)
			});

			$(canvas).on("touchstart", function (e) {
				LoopingDown(e, obj)
			}); //手指點擊事件
			$(canvas).on("touchmove", function (e) {
				LoopingMove(e, stage, obj, img, canvas, Width, Height)
			}); //手指移動事件
			$(canvas).on("touchend", function (e) {
				LoopingUp(e, stage, obj, img, Width, Height)
			}); //手指放開事件
			$(canvas).on("touchcancel", function (e) {
				LoopingUp(e, stage, obj, img, Width, Height)
			}); //手指離開事件
		} else {
			if (obj.Paging == 'false') {
				if (obj.Orientation == 'horizontal') {
					obj.Scale = Height / img.height;
					Width = img.width * obj.Scale;
					if (obj.MoveDirection == 'right') {
						obj.move = canvas.width - Width;
					}

					Scrollbitmap.scaleX = Width / img.width;
					Scrollbitmap.scaleY = Height / img.height;
					Scrollbitmap.x = obj.move;
					Scrollbitmap.y = 0;
				} else {
					obj.Scale = Width / img.width;
					Height = img.height * obj.Scale;
					if (obj.MoveDirection == 'down') {
						obj.move = canvas.height - Height;
					}

					Scrollbitmap.scaleX = Width / img.width;
					Scrollbitmap.scaleY = Height / img.height;
					Scrollbitmap.x = 0;
					Scrollbitmap.y = obj.move;
				}
			} else if (obj.Paging == 'true') {
				if (obj.Orientation == 'horizontal') {
					Width = Width * obj.Size;
					obj.Scale = Width / img.width;
					if (obj.MoveDirection == 'right') {
						obj.move = canvas.width - Width;
					}

					Scrollbitmap.scaleX = Width / img.width;
					Scrollbitmap.scaleY = Height / img.height;
					Scrollbitmap.x = obj.move;
					Scrollbitmap.y = 0;
				} else {
					Height = Height * obj.Size;
					obj.Scale = Height / img.height;
					if (obj.MoveDirection == 'down') {
						obj.move = canvas.height - Height;
					}

					Scrollbitmap.scaleX = Width / img.width;
					Scrollbitmap.scaleY = Height / img.height;
					Scrollbitmap.x = 0;
					Scrollbitmap.y = obj.move;
				}

				obj.ScrollPage = 0;
			}

			$(canvas).on('mousedown', function (e) {
				ManualDown(e)
			});
			$(canvas).on('mousemove', function (e) {
				ManualMove(e, stage, obj, img, canvas, Width, Height)
			});
			$(canvas).on('mouseup', function (e) {
				ManualUp(e, stage, obj, img, canvas, Width, Height)
			});
			$(canvas).on('mouseout', function (e) {
				ManualUp(e, stage, obj, img, canvas, Width, Height)
			});

			$(canvas).on('touchstart', function (e) {
				ManualDown(e)
			});
			$(canvas).on('touchmove', function (e) {
				ManualMove(e, stage, obj, img, canvas, Width, Height)
			});
			$(canvas).on('touchend', function (e) {
				ManualUp(e, stage, obj, img, canvas, Width, Height)
			});
			$(canvas).on('touchcancel', function (e) {
				ManualUp(e, stage, obj, img, canvas, Width, Height)
			});
		}

		stage.update();
		invertCanvas(cxt, Width, Height);

		for (let h = 0; h < obj.ImageList.Images.length; h++) {
			if(obj.ImageList.Images[h].AdditionalFileObjectID != undefined){
				HamaList[page].Objects.map(function (res) {
					if (res.Identifier == obj.ImageList.Images[h].AdditionalFileObjectID) {
						if (obj.Orientation == 'horizontal') {
							var areaLeft = 0 + ((Width / Number(obj.Size)) * h);
							var areaTop = 0;
							var areaWidth = Width / Number(obj.Size);
							var areaHeight = Height;
						} else {
							var areaLeft = 0;
							var areaTop = 0 + ((Height / Number(obj.Size)) * h);;
							var areaWidth = Width;
							var areaHeight = Height/ Number(obj.Size);
						}

						var hit = new createjs.Shape();
						var area = new createjs.Shape();  
						hit.graphics.beginFill("#000").rect(areaLeft, areaTop, areaWidth, areaHeight);
						area.name = "hitArea" + obj.ImageList.Images[h].AdditionalFileObjectID
						area.cursor = "pointer";
						area.graphics.setStrokeStyle(2).rect(areaLeft, areaTop, areaWidth, areaHeight);
						area.hitArea = hit;
						area.on("pressmove", function () {
							Scroll.StageMove = true;
						});

						area.on("pressup", function (evt, data) {
							if(!Scroll.StageMove) {
								switch (data.Res.FormatterType) {
									case 'HyperLinkObject':
										HyperLinkSet(data.Res);
										break;
									case 'IntroductionObject':
										Introduction(data.Res);
										break;
									case 'AdditionalFileObject':
										AdditionalFileSet(data.Res, page, false, undefined, true);
										break;
								}
							} else {
								Scroll.StageMove = false;
							}
						}, null, false, {Res :res});

	
						stage.addChild(area);
						stage.update();
					}
				})
			}
		}

		if (obj.RectList != undefined) {
			for (var i = 0; i < obj.RectList.length; i++) {
				var IntroObj = FindIntroObj(obj.RectList[i]);
				$("#" + IntroObj.Identifier).remove();

				IntroObj.Width = obj.RectList[i].W * obj.Scale;
				IntroObj.Height = obj.RectList[i].H * obj.Scale;
				IntroObj.Left = Number(obj.RectList[i].X) * obj.Scale;
				IntroObj.Top = Number(obj.RectList[i].Y) * obj.Scale;

				obj.RectList[i].Width = IntroObj.Width;
				obj.RectList[i].Height = IntroObj.Height;
				obj.RectList[i].Left = IntroObj.Left;
				obj.RectList[i].Top = IntroObj.Top;

				if(IntroObj.BackgroundXFileName) {
					var imgRect = new Image();
					imgRect.src = 'Resource/' + IntroObj.BackgroundXFileName;
					obj.RectList[i].Img = imgRect;

					imgRect.onload = (function (introObj) {
						return function() {
							var bitmap = new createjs.Bitmap(imgRect);
							var hit = new createjs.Shape();
							hit.name = "hitArea" + introObj.Identifier
							hit.graphics.beginFill("#000").rect(0, 0, bitmap.image.width, bitmap.image.height);
							
							stage.addChild(bitmap);
							bitmap.x = introObj.Left;
							bitmap.y = introObj.Top;
							bitmap.scaleX  = introObj.Width / bitmap.image.width;
							bitmap.scaleY  = introObj.Height / bitmap.image.height;
							bitmap.name = "bmp" + introObj.Identifier;
							bitmap.cursor = "pointer";
							bitmap.hitArea = hit;
		
							bitmap.on("mousedown", function (evt) {
								switch (introObj.FormatterType) {
									case 'HyperLinkObject':
										HyperLinkSet(introObj);
										break;
									case 'IntroductionObject':
										Introduction(introObj);
										break;
									case 'AdditionalFileObject':
										AdditionalFileSet(introObj, page, false, undefined, true);
										break;
								}
							});
		
							stage.update();
						}
					}(IntroObj));
				} else {
					if (obj.Orientation == 'horizontal') {
						var areaLeft = IntroObj.Left + obj.move;
						var areaTop = IntroObj.Top;
					} else {
						var areaLeft = IntroObj.Left;
						var areaTop = IntroObj.Top + obj.move;
					}
					
					obj.RectList[i].Img = false;
					var hit = new createjs.Shape();
					var area = new createjs.Shape();  
					hit.graphics.beginFill("#000").rect(areaLeft, areaTop, IntroObj.Width, IntroObj.Height);
					area.name = "hitArea" + IntroObj.Identifier;
					area.cursor = "pointer";
					area.graphics.setStrokeStyle(2).rect(areaLeft, areaTop, IntroObj.Width, IntroObj.Height);
					area.hitArea = hit;
					area.on("mousedown", function (evt, data) {
						switch (data.introObj.FormatterType) {
							case 'HyperLinkObject':
								HyperLinkSet(data.introObj);
								break;
							case 'IntroductionObject':
								Introduction(data.introObj);
								break;
							case 'AdditionalFileObject':
								AdditionalFileSet(data.introObj, page, false, undefined, true);
								break;
						}
					}, null, false, {introObj: IntroObj});

					stage.addChild(area);
					stage.update();
				}
			}
		}
	}

	img.src = 'Resource/' + obj.XFileName;
}

//自動平移
function ScrollLoop(stage, obj, img, width, height) {
	var Left = obj.move;
	var Top = obj.move;

	var canvas = $('#' + obj.Identifier)[0];
	if (canvas != undefined) {
		var cxt = canvas.getContext('2d');
		if (obj.Orientation == 'horizontal') {
			switch (obj.MoveDirection) {
				//往左
				case 'left':
					Left--;
					break;
				//往右
				case 'right':
					Left++;
					break;
			}
			Drawhorizontal(stage, obj, cxt, img, Left, width, height);
			return Left;
		} else {
			switch (obj.MoveDirection) {
				//往上
				case 'up':
					Top--;
					break;
				//往下
				case 'down':
					Top++;
					break;
			}
			Drawvertical(stage, obj, cxt, img, Top, width, height);
			return Top;
		}
	}
}

//畫橫向平移
function Drawhorizontal(stage, obj, cxt, img, move, width, height) {
	if (obj.Looping == "true") {
		if (move == -Math.floor(obj.ImgW) || move == Math.floor(obj.ImgW)) {
			clearInterval(Scroll.Interval[obj.Identifier].ID);
			$(cxt.canvas).remove();

			NewCanvas(obj);
			ScrollSet(obj, MainObj.NowPage);
			return;
		}
	}
	stage.removeChild(stage.getChildByName(obj.Identifier));

	var bitmap = new createjs.Bitmap(img);
	bitmap.name = obj.Identifier;
	bitmap.x = move;
	bitmap.y = 0;
	bitmap.scaleX = width / bitmap.image.width;
	bitmap.scaleY = height / bitmap.image.height;
	stage.addChild(bitmap);

	bitmap = bitmap.clone();
	stage.removeChild(stage.getChildByName("temp" + obj.Identifier));
	bitmap.name = "temp" + obj.Identifier;
	if (move < -width || move > width) {
		move = 0;
	}
	if (move < 0) {
		bitmap.x = width + move;
		bitmap.y = 0;
	} else if (-move < 0) {
		bitmap.x = -width + move;
		bitmap.y = 0;
	}
	stage.addChild(bitmap);

	addIntroImg(obj, stage, move, width, height, true);
	stage.update();

	invertCanvas(cxt, width, height);
}

//畫直向平移
function Drawvertical(stage, obj, cxt, img, move, width, height) {

	if (obj.Looping == "true") {
		if (move == -Math.floor(obj.ImgH) || move == Math.floor(obj.ImgH)) {
			clearInterval(Scroll.Interval[obj.Identifier].ID);
			$(cxt.canvas).remove();

			NewCanvas(obj);
			ScrollSet(obj, MainObj.NowPage);
			return;
		}
	}

	stage.removeChild(stage.getChildByName(obj.Identifier));

	var bitmap = new createjs.Bitmap(img);
	bitmap.name = obj.Identifier;
	bitmap.x = 0;
	bitmap.y = move;
	bitmap.scaleX = width / bitmap.image.width;
	bitmap.scaleY = height / bitmap.image.height;
	stage.addChild(bitmap);

	bitmap = bitmap.clone();
	stage.removeChild(stage.getChildByName("temp" + obj.Identifier));
	bitmap.name = "temp" + obj.Identifier;
	if (move < -height || move > height) {
		move = 0;
	}
	if (move < 0) {
		bitmap.x = 0;
		bitmap.y = height + move;
	} else if (-move < 0) {
		bitmap.x = 0;
		bitmap.y = -height + move;
	}
	stage.addChild(bitmap);

	addIntroImg(obj, stage, move, width, height, false);
	stage.update();

	invertCanvas(cxt, width, height);
}

//自訂感應區
function addIntroImg(obj, stage, move, width, height, state) {
	for (let h = 0; h < obj.ImageList.Images.length; h++) {
		if(obj.ImageList.Images[h].AdditionalFileObjectID != undefined){
			HamaList[MainObj.NowPage].Objects.map(function (res) {
				if (res.Identifier == obj.ImageList.Images[h].AdditionalFileObjectID) {
					stage.removeChild(stage.getChildByName("hitArea" + obj.ImageList.Images[h].AdditionalFileObjectID));
					AdditionalReset(obj.ImageList.Images[h].AdditionalFileObjectID);

					if (state) {
						var areaLeft = move + ((width / Number(obj.Size)) * h);
						var areaTop = 0;
						var areaWidth = width / Number(obj.Size);
						var areaHeight = height;
					} else {
						var areaLeft = 0;
						var areaTop = move + ((height / Number(obj.Size)) * h);;
						var areaWidth = width;
						var areaHeight = height/ Number(obj.Size);
					}

					var hit = new createjs.Shape();
					var area = new createjs.Shape();  
					hit.graphics.beginFill("#000").rect(areaLeft, areaTop, areaWidth, areaHeight);
					area.name = "hitArea" + obj.ImageList.Images[h].AdditionalFileObjectID
					area.cursor = "pointer";
					area.graphics.setStrokeStyle(2).rect(areaLeft, areaTop, areaWidth, areaHeight);
					area.hitArea = hit;
					area.on("pressmove", function () {
						Scroll.StageMove = true;
					});
					
					area.on("pressup", function (evt, data) {
						if(!Scroll.StageMove) {
							switch (data.Res.FormatterType) {
								case 'HyperLinkObject':
									HyperLinkSet(data.Res);
									break;
								case 'IntroductionObject':
									Introduction(data.Res);
									break;
								case 'AdditionalFileObject':
									AdditionalFileSet(data.Res, MainObj.NowPage, false, undefined, true);
									break;
							}
						} else {
							Scroll.StageMove = false;
						}
					}, null, false, {Res :res});


					stage.addChild(area);
					stage.update();
				}
			})
		}
	}

	if (obj.RectList != undefined) {

		for (var i = 0; i < obj.RectList.length; i++) {
			stage.removeChild(stage.getChildByName("bmp" + obj.RectList[i].RectID));
			stage.removeChild(stage.getChildByName("hitArea" + obj.RectList[i].RectID));

			var IntroObj = FindIntroObj(obj.RectList[i]);
			
			if(IntroObj.BackgroundXFileName) {
				var bitmap = new createjs.Bitmap(obj.RectList[i].Img);
				var hit = new createjs.Shape();
				hit.name = "hitArea" + obj.RectList[i].RectID;
				hit.graphics.beginFill("#000").rect(0, 0, bitmap.image.width, bitmap.image.height);
	
				stage.addChild(bitmap);
	
				if (state) {
					bitmap.x = obj.RectList[i].Left + move;
					bitmap.y = obj.RectList[i].Top;
				} else {
					bitmap.x = obj.RectList[i].Left;
					bitmap.y = obj.RectList[i].Top  + move;
				}
	
				bitmap.scaleX  = obj.RectList[i].Width / bitmap.image.width;
				bitmap.scaleY  = obj.RectList[i].Height / bitmap.image.height;
				bitmap.name = "bmp" + obj.RectList[i].RectID;
				bitmap.cursor = "pointer";
				bitmap.hitArea = hit;
				bitmap.on("mousedown", function (evt, data) {
					switch (data.introObj.FormatterType) {
						case 'HyperLinkObject':
							HyperLinkSet(data.introObj);
							break;
						case 'IntroductionObject':
							Introduction(data.introObj);
							break;
						case 'AdditionalFileObject':
							AdditionalFileSet(data.introObj, MainObj.NowPage, false, undefined, true);
							break;
					}
				}, null, false, {introObj: IntroObj});
				
	
				bitmap = bitmap.clone();
				stage.removeChild(stage.getChildByName("temp" + obj.RectList[i].RectID));
				bitmap.name = "temp" + obj.RectList[i].RectID;
				bitmap.on("mousedown", function (evt, data) {
					switch (data.introObj.FormatterType) {
						case 'HyperLinkObject':
							HyperLinkSet(data.introObj);
							break;
						case 'IntroductionObject':
							Introduction(data.introObj);
							break;
						case 'AdditionalFileObject':
							AdditionalFileSet(data.introObj, MainObj.NowPage, false, undefined, true);
							break;
					}
				}, null, false, {introObj: IntroObj});
	
				if (state) {
					if (move < -width || move > width) {
						move = 0;
					}
					if (move < 0) {
						bitmap.x = obj.RectList[i].Left + width + move;
						bitmap.y = obj.RectList[i].Top;
					} else if (-move < 0) {
						bitmap.x = obj.RectList[i].Left - width + move;
						bitmap.y = obj.RectList[i].Top;
					}
				} else {
					if (move < -height || move > height) {
						move = 0;
					}
					if (move < 0) {
						bitmap.x = obj.RectList[i].Left;
						bitmap.y = obj.RectList[i].Top + height + move;
					} else if (-move < 0) {
						bitmap.x = obj.RectList[i].Left;
						bitmap.y = obj.RectList[i].Top -height + move;
					}
				}
	
				stage.addChild(bitmap);
			} else {
				var ShapeL;
				var ShapeT;
				if (state) {
					ShapeL = obj.RectList[i].Left + move;
					ShapeT = obj.RectList[i].Top;
				} else {
					ShapeL = obj.RectList[i].Left;
					ShapeT = obj.RectList[i].Top  + move;
				}

				var area = new createjs.Shape(); 
				var hit = new createjs.Shape();
				hit.graphics.beginFill("#000").rect(ShapeL, ShapeT, obj.RectList[i].Width, obj.RectList[i].Height); 
				area.name = "hitArea" + IntroObj.Identifier;
				area.cursor = "pointer"; 
				area.graphics.setStrokeStyle(2).rect(ShapeL, ShapeT, obj.RectList[i].Width, obj.RectList[i].Height);
				area.hitArea = hit;
				area.on("mousedown", function (evt, data) {
					switch (data.introObj.FormatterType) {
						case 'HyperLinkObject':
							HyperLinkSet(data.introObj);
							break;
						case 'IntroductionObject':
							Introduction(data.introObj);
							break;
						case 'AdditionalFileObject':
							AdditionalFileSet(data.introObj, MainObj.NowPage, false, undefined, true);
							break;
					}
				}, null, false, {introObj: IntroObj});

				stage.addChild(area);

				area = area.clone();
				hit = hit.clone();
				stage.removeChild(stage.getChildByName("hitAreatemp" + obj.RectList[i].RectID));
				area.name = "hitAreatemp" + obj.RectList[i].RectID;
				area.on("mousedown", function (evt, data) {
					switch (data.introObj.FormatterType) {
						case 'HyperLinkObject':
							HyperLinkSet(data.introObj);
							break;
						case 'IntroductionObject':
							Introduction(data.introObj);
							break;
						case 'AdditionalFileObject':
							AdditionalFileSet(data.introObj, MainObj.NowPage, false, undefined, true);
							break;
					}
				}, null, false, {introObj: IntroObj});
	
				if (state) {
					if (move < -width || move > width) {
						move = 0;
					}
					if (move < 0) {
						ShapeL = obj.RectList[i].Left + width + move;
						ShapeT = obj.RectList[i].Top;
					} else if (-move < 0) {
						ShapeL = obj.RectList[i].Left - width + move;
						ShapeT = obj.RectList[i].Top;
					}
				} else {
					if (move < -height || move > height) {
						move = 0;
					}
					if (move < 0) {
						ShapeL = obj.RectList[i].Left;
						ShapeT = obj.RectList[i].Top + height + move;
					} else if (-move < 0) {
						ShapeL = obj.RectList[i].Left;
						ShapeT = obj.RectList[i].Top -height + move;
					}
				}

				area.graphics.setStrokeStyle(2).rect(ShapeL, ShapeT, obj.RectList[i].Width, obj.RectList[i].Height);
				hit.graphics.beginFill("#000").rect(ShapeL, ShapeT, obj.RectList[i].Width, obj.RectList[i].Height); 
				area.hitArea = hit;

				stage.addChild(area);
			}
		}
	}
}

function LoopingDown(event, obj) {
	var isPhone = event.type == 'touchstart' || event.type == 'touchmove' || event.type == 'touchend' || event.type == 'touchcancel';

	if (isPhone) {
		if (event.targetTouches.length) {
			Scroll.MouseDown.X = event.targetTouches[0].pageX;
			Scroll.MouseDown.Y = event.targetTouches[0].pageY;
		}
	} else {
		Scroll.MouseDown.X = event.layerX ? event.layerX : event.originalEvent.layerX;
		Scroll.MouseDown.Y = event.layerY ? event.layerY : event.originalEvent.layerY;
	}
	
	clearInterval(Scroll.Interval[obj.Identifier].ID);
	Scroll.Drag = true;
}

function LoopingMove(event, stage, obj, img, canvas, width, height) {
	if (Scroll.Drag) {
		var isPhone = event.type == 'touchstart' || event.type == 'touchmove' || event.type == 'touchend' || event.type == 'touchcancel';
		
		if (isPhone) {
			if (event.targetTouches.length) {
				Scroll.MouseMove.X = event.targetTouches[0].pageX;
				Scroll.MouseMove.Y = event.targetTouches[0].pageY;
			}
		} else {
			Scroll.MouseMove.X = event.layerX ? event.layerX : event.originalEvent.layerX;
			Scroll.MouseMove.Y = event.layerY ? event.layerY : event.originalEvent.layerY;
		}

		//速度比照滑鼠速度
		Scroll.MoveNow.X = Math.abs(Scroll.MouseMove.X - Scroll.MouseDown.X);
		Scroll.MoveNow.Y = Math.abs(Scroll.MouseMove.Y - Scroll.MouseDown.Y);
		if (Scroll.MoveNow.X > 50) Scroll.MoveNow.X = 50;
		if (Scroll.MoveNow.Y > 50) Scroll.MoveNow.Y = 50;

		var cxt = canvas.getContext('2d');

		if (obj.Orientation == 'horizontal') {
			if (Scroll.MouseMove.X > Scroll.MouseDown.X) {
				obj.move = obj.move + Scroll.MoveNow.X;
				if (obj.move > width) obj.move = 0;
			} else if (Scroll.MouseMove.X < Scroll.MouseDown.X) {
				obj.move = obj.move - Scroll.MoveNow.X;
				if (obj.move < -width) obj.move = 0;
			}

			Drawhorizontal(stage, obj, cxt, img, obj.move, width, height);
			Scroll.MouseDown.X = Scroll.MouseMove.X;

		} else if (obj.Orientation == 'vertical') {
			if (Scroll.MouseMove.Y > Scroll.MouseDown.Y) {
				obj.move = obj.move + Scroll.MoveNow.Y;
				if (obj.move > height) obj.move = 0;
			} else if (Scroll.MouseMove.Y < Scroll.MouseDown.Y) {
				obj.move = obj.move - Scroll.MoveNow.Y;
				if (obj.move < -height) obj.move = 0;
			}

			Drawvertical(stage, obj, cxt, img, obj.move, width, height);
			Scroll.MouseDown.Y = Scroll.MouseMove.Y;
		}
	}
}

function LoopingUp(event, stage, obj, img, width, height) {
	clearInterval(Scroll.Interval[obj.Identifier].ID);
	Scroll.Interval[obj.Identifier] = {
		ID: setInterval(function () {
			obj.move = ScrollLoop(stage, obj, img, width, height);
		}, Number(obj.PlayingInterval))
	}

	Scroll.Drag = false;
}

function ManualDown(event) {
	var isPhone = event.type == 'touchstart' || event.type == 'touchmove' || event.type == 'touchend' || event.type == 'touchcancel';

	if (isPhone) {
		if (event.targetTouches.length) {
			Scroll.MouseDown.X = event.targetTouches[0].pageX;
			Scroll.MouseDown.Y = event.targetTouches[0].pageY;
		}
	} else {
		Scroll.MouseDown.X = event.layerX ? event.layerX : event.originalEvent.layerX;
		Scroll.MouseDown.Y = event.layerY ? event.layerY : event.originalEvent.layerY;
	}
	Scroll.Drag = true;
}

function ManualMove(event, stage, obj, img, canvas, width, height) {
	if (Scroll.Drag) {
		var isPhone = event.type == 'touchstart' || event.type == 'touchmove' || event.type == 'touchend' || event.type == 'touchcancel';
		
		if (isPhone) {
			if (event.targetTouches.length) {
				Scroll.MouseMove.X = event.targetTouches[0].pageX;
				Scroll.MouseMove.Y = event.targetTouches[0].pageY;
			}
		} else {
			Scroll.MouseMove.X = event.layerX ? event.layerX : event.originalEvent.layerX;
			Scroll.MouseMove.Y = event.layerY ? event.layerY : event.originalEvent.layerY;
		}

		//速度比照滑鼠速度
		Scroll.MoveNow.X = Math.abs(Scroll.MouseMove.X - Scroll.MouseDown.X);
		Scroll.MoveNow.Y = Math.abs(Scroll.MouseMove.Y - Scroll.MouseDown.Y);
		if (Scroll.MoveNow.X > 50) Scroll.MoveNow.X = 50;
		if (Scroll.MoveNow.Y > 50) Scroll.MoveNow.Y = 50;


		var cxt = canvas.getContext('2d');

		if (obj.Orientation == 'horizontal') {
			if (Scroll.MouseMove.X > Scroll.MouseDown.X) {
				obj.move = obj.move + Scroll.MoveNow.X;
				if (obj.move > 0) {
					obj.move = obj.move - Scroll.MoveNow.X;
				} 
				Scroll.Paging = 'L';
			} else if (Scroll.MouseMove.X < Scroll.MouseDown.X) {
				obj.move = obj.move - Scroll.MoveNow.X;
				if (obj.move < $(canvas).width() - width) {
					obj.move = obj.move + Scroll.MoveNow.X;
				} 
				Scroll.Paging = 'R';
			}

			Drawhorizontal(stage, obj, cxt, img, obj.move, width, height);
			Scroll.MouseDown.X = Scroll.MouseMove.X;

		} else if (obj.Orientation == 'vertical') {
			if (Scroll.MouseMove.Y > Scroll.MouseDown.Y) {
				obj.move = obj.move + Scroll.MoveNow.Y;
				if (obj.move > 0) {
					obj.move = obj.move - Scroll.MoveNow.Y;
				}
				Scroll.Paging = 'T';
			} else if (Scroll.MouseMove.Y < Scroll.MouseDown.Y) {
				obj.move = obj.move - Scroll.MoveNow.Y;
				if (obj.move < $(canvas).height() - height) {
					obj.move = obj.move + Scroll.MoveNow.Y;
				} 
				Scroll.Paging = 'D';
			}
			Drawvertical(stage, obj, cxt, img, obj.move, width, height);
			Scroll.MouseDown.Y = Scroll.MouseMove.Y;
		}

		Scroll.Move = true;
	}
}

function ManualUp(event, stage, obj, img, canvas, width, height) {
	if(!Scroll.Move) {
		Scroll.Drag = false;
		return;
	} else {
		Scroll.Move = false;
		Scroll.Drag = false;
	}

	if (obj.Paging == 'true') {
		var cxt = canvas.getContext('2d');
		//平移模式，判斷是往哪個方向移動
		switch (Scroll.Paging) {
			case 'L':
				obj.ScrollPage--;
				if (obj.ScrollPage < 0) {
					obj.ScrollPage = obj.Size;
				}
				obj.move = -(canvas.width * obj.ScrollPage);
				Drawhorizontal(stage, obj, cxt, img, obj.move, width, height);
				break;

			case 'R':
				obj.ScrollPage++;
				if (obj.ScrollPage >= obj.Size) {
					obj.ScrollPage = 0;
				}
				obj.move = -(canvas.width * obj.ScrollPage);
				Drawhorizontal(stage, obj, cxt, img, obj.move, width, height);
				break;

			case 'T':
				obj.ScrollPage--;
				if (obj.ScrollPage < 0) obj.ScrollPage = obj.Size;
				obj.move = -(canvas.height * obj.ScrollPage);
				Drawvertical(stage, obj, cxt, img, obj.move, width, height);
				break;

			case 'D':
				obj.ScrollPage++;
				if (obj.ScrollPage >= obj.Size) obj.ScrollPage = 0;
				obj.move = -(canvas.height * obj.ScrollPage);
				Drawvertical(stage, obj, cxt, img, obj.move, width, height);
				break;
		}
	}
}

//取得自訂感應區物件
function FindIntroObj(obj) {
	var HamaObj = HamaList[MainObj.NowPage].Objects;
	for (var i = 0; i < HamaObj.length; i++) {

		if (HamaObj[i].Identifier == obj.RectID) {
			return HamaObj[i];
		}
	}
}

function ScrollReset() {
	$.each(Scroll.Interval, function (index, value) {
		clearInterval(value.ID);
	});
}