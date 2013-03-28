window.onload = start;

var stage;
var UI;
var scale = 1;
var score = 0;
var spritesheet;

function setScale () {
	scale = window.innerWidth / Match3.REAL_WIDTH;

	//make sure it's not bigger than the height
	if (scale * Match3.REAL_HEIGHT > window.innerHeight) {
		scale = window.innerHeight / Match3.REAL_HEIGHT;
	}

	var stageStyle = stage.canvas.style;
	stageStyle.transformOrigin = stageStyle.webkitTransformOrigin = stageStyle.mozTransformOrigin = "0 0";
	stageStyle.transform = stageStyle.webkitTransform = stageStyle.mozTransform = "scale("+scale+")";
}

function start () {
	stage = new createjs.Stage("stage");
	stage.addEventListener("stagemousedown", onInputSelect);

	window.addEventListener("resize", setScale, false);

	spritesheet =  new createjs.SpriteSheet({
		images: [ "../../assets/city.png" ],
		frames: { width: 64, height: 64 },
		animations: {
			slum: 0,
			house: 1,
			apartment: 2,
			skyscraper: 3,
			mansion: 4,
			//5
			//6
			pond: 7,
			car: 8,
			crystal: 9,
			//10
			//11
			road_s: 12,
			road_h: 13,
			road_v: 14,
			road_x: 15,
			//16
			//17
			road_e: 18,
			//19
			road_l: 20,
			road_t: 21
		}
	});

	Match3.generateBoard(function (x, y, type) {
		var tile = new createjs.BitmapAnimation(spritesheet);
		tile.gotoAndStop(type);
		tile.x = x * Match3.TILE + 32;
		tile.y = y * Match3.TILE + 32;
		tile.col = x;
		tile.row = y;
		tile.type = type;
		tile.regX = 32;
		tile.regY = 32;
		tile.rotation = 0;

		stage.addChild(tile);

		return tile;
	});

	Match3.generateRoads(function (tile, type, rotation) {
		tile.gotoAndStop("road_" + type);
		
		tile.rotation = rotation;
	});

	//draw the UI bar at the bottom of the screen
	UI = new createjs.Shape();
	UI.graphics.beginFill("#177407").drawRect(
		0, 
		Match3.REAL_HEIGHT - Match3.UI_HEIGHT, 
		Match3.REAL_WIDTH, 
		Match3.UI_HEIGHT
	);

	var labelNext = new createjs.Text("Next item", "18px Arial", "#fff")
	labelNext.x = 10;
	labelNext.y = Match3.REAL_HEIGHT - 35;

	var labelScore = new createjs.Text("Score", "18px Arial", "#fff");
	labelScore.x = 220;
	labelScore.y = Match3.REAL_HEIGHT - 35;

	UI.scoreText = new createjs.Text("0", "18px Georgia", "#fff");
	UI.scoreText.x = 280;
	UI.scoreText.y = Match3.REAL_HEIGHT - 37;

	UI.iconNext = new createjs.BitmapAnimation(spritesheet);
	UI.iconNext.x = 90;
	UI.iconNext.y = Match3.REAL_HEIGHT - 48
	UI.iconNext.scaleX = 0.7;
	UI.iconNext.scaleY = 0.7;
	UI.iconNext.gotoAndStop("slum");

	stage.addChild(UI);
	stage.addChild(labelNext);
	stage.addChild(labelScore);
	stage.addChild(UI.scoreText);
	stage.addChild(UI.iconNext);

	setScale();
}

function onInputSelect (e) {
	var x = Math.floor((e.nativeEvent.clientX / scale) / Match3.TILE);
	var y = Math.floor((e.nativeEvent.clientY / scale) / Match3.TILE);
	console.log(x, y, e.rawX, e.rawY, e)
	Match3.place(x, y);
}

createjs.Ticker.addEventListener("tick", tick);
createjs.Ticker.useRAF = true;
createjs.Ticker.setFPS(60);

function tick () {
	stage.update();
}

function startShake (entity) {
	var oldX = entity.x;
	var oldY = entity.y;

	var onTick = function () {
		entity.x = oldX + Math.round(Math.random() * 10 - 5);
		entity.y = oldY + Math.round(Math.random() * 10 - 5)
	}

	createjs.Ticker.addEventListener("tick", onTick);
	setTimeout(function () {
		createjs.Ticker.removeEventListener("tick", onTick);

		entity.x = oldX;
		entity.y = oldY;
	}, 800);
}

Match3.onGameOver = function () {
	var shape = new createjs.Shape();
	shape.graphics.beginFill("#fff").drawRect(
		50, 
		50, 
		Match3.REAL_WIDTH - 100, 
		Match3.REAL_HEIGHT - 150
	);

	shape.alpha = 0.9;
	stage.addChild(shape);

	var text = new createjs.Text("GAME OVER", "30px Arial", "#000");
	text.x = 100;
	text.y = 90;
	stage.addChild(text);

	var scoreText = new createjs.Text("Score: " + score, "20px Georgia", "#666");
	scoreText.x = 100;
	scoreText.y = 150;
	stage.addChild(scoreText);

	var helpText = new createjs.Text("Tap to play again", "18px Arial", "#aaa");
	helpText.x = 120;
	helpText.y = 240;
	stage.addChild(helpText);

	stage.addEventListener("stagemousedown", function () {
		window.location.reload();
	});
}

Match3.onNextItem = function (item) {
	UI.iconNext.gotoAndStop(item);
};

Match3.onBlocker = function (x, y) {
	var tile = new createjs.BitmapAnimation(spritesheet);
	tile.gotoAndStop("car");
	tile.x = x * Match3.TILE;
	tile.y = y * Match3.TILE;
	tile.col = x;
	tile.row = y;
	tile.type = "car";

	stage.addChild(tile);

	return tile;
}

Match3.onMoveBlocker = function (car, x, y) {
	createjs.Tween.get(car).to({
		x: x * Match3.TILE,
		y: y * Match3.TILE
	}, 800);

	car.row = y;
	car.col = x;
}

Match3.onReplaceTile = function (x, y, tile) {
	var ent = Match3.board[x][y];
	ent.type = tile;
	ent.gotoAndStop(tile);
	ent.rotation = 0;

	var matches = Match3.checkThree(x, y, tile);
	score += Match3.scores[tile];
	UI.scoreText.text = score;

	if (matches.length) {
		console.log(matches);

		//remove each tile
		matches.forEach(function (match) {
			var decreaseScore = Match3.scores[match.one.type] + Match3.scores[match.two.type];
			score -= decreaseScore;
			UI.scoreText.text = score;

			if (tile === "crystal")
				tile = match.one.type;

			match.one.type = match.two.type = "empty";
		});
		
		startShake(ent);
		setTimeout(function () {
			ent.type = Match3.nextTile[tile];
			ent.gotoAndStop(ent.type);

			Match3.onReplaceTile(x, y, ent.type);
		}, 800);
	}

	Match3.generateRoads(function (tile, type, rotation) {
		tile.gotoAndStop("road_" + type);
		
		
		tile.rotation = rotation;
	});
}