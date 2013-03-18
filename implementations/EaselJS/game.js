window.onload = start;

var stage;
var scale = 1;

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
	stage.addEventListener("mousedown", onInputSelect);

	window.addEventListener("resize", setScale, false);

	var spritesheet =  new createjs.SpriteSheet({
		images: [ "../../assets/spritesheet.png" ],
		frames: { width: 64, height: 64 },
		animations: {
			fxos: 0,
			firefox: 1,
			marketplace: 2,
			bugzilla: 3,
			aurora: 4,
			thunderbird: 5,
			deadbug: 6,
			nightly: 7,
			empty: 8
		}
	});

	Match3.generateBoard(function (x, y, type) {
		var tile = new createjs.BitmapAnimation(spritesheet);
		tile.gotoAndPlay(type);
		tile.x = x * Match3.TILE;
		tile.y = y * Match3.TILE;
		tile.type = type;

		stage.addChild(tile);

		return tile;
	});

	setScale();
}

function onInputSelect (e) {
	var x = Math.floor((e.rawX / 1) / Match3.TILE);
	var y = Math.floor((e.rawY / 1) / Match3.TILE);

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

function replaceTile (x, y, tile) {
	var ent = Match3.board[x][y];
	ent.type = tile;
	ent.gotoAndStop(tile);

	var matches = Match3.checkThree(x, y, tile);

	if (matches.length) {
		console.log(matches);

		//remove each tile
		matches.forEach(function (match) {
			//TODO: refactor this one, two business
			match.one.gotoAndPlay("empty");
			match.two.gotoAndPlay("empty");

			match.one.type = match.two.type = "empty";
		});
		
		startShake(ent);
		setTimeout(function () {
			ent.type = Match3.nextTile[tile];
			ent.gotoAndStop(ent.type);

			replaceTile(x, y, ent.type);
		}, 800);
	}
}