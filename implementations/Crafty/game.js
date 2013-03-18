window.onload = start;

var current = "nightly";
var scale = window.innerWidth / Match3.REAL_WIDTH;

function setScale () {
	scale = window.innerWidth / Match3.REAL_WIDTH;

	//make sure it's not bigger than the height
	if (scale * Match3.REAL_HEIGHT > window.innerHeight) {
		scale = window.innerHeight / Match3.REAL_HEIGHT;
	}

	var stageStyle = Crafty.stage.elem.style;
	stageStyle.transformOrigin = stageStyle.webkitTransformOrigin = stageStyle.mozTransformOrigin = "0 0";
	stageStyle.transform = stageStyle.webkitTransform = stageStyle.mozTransform = "scale("+scale+")";
}

function start () {
	//init Crafty with game dimensions
	Crafty.init(
		Match3.BOARD_WIDTH * Match3.TILE, 
		Match3.BOARD_HEIGHT * Match3.TILE + Match3.UI_HEIGHT
	);

	Crafty.background("#ccc");

	setScale();

	//preload our assets
	Crafty.load(["../../assets/spritesheet.png"], function () {
		//define the sprites on the spritesheet
		Crafty.sprite(TILE, "../../assets/spritesheet.png", {
			fxos: [0, 0],
			firefox: [1, 0],
			marketplace: [2, 0],
			bugzilla: [0, 1],
			aurora: [1, 1],
			thunderbird: [2, 1],
			deadbug: [0, 2],
			nightly: [1, 2],
			empty: [2, 2]
		});

		//start the main scene
		Crafty.scene("main");	
	});
}

/**
* Definition of the main scene where
* the game exists.
*/
Crafty.scene("main", function () {
	console.log("Start scene");

	Match3.generateBoard(function (x, y, type) {
		return Crafty.e("Tile").create(type, x, y);
	});

	console.log("ADD EVENTS");
	Crafty.addEvent(this, window, "click", onInputSelect);
	Crafty.addEvent(this, window, "touchend", onInputSelect);
	Crafty.addEvent(this, window, "resize", setScale);

	function onInputSelect (e) {
		
		var pos = (e.type === "touchend") ? e.changedTouches[0] : e;
		console.log(e.type, pos.clientX, pos.clientY);

		var x = Math.floor((pos.clientX / scale) / TILE);
		var y = Math.floor((pos.clientY / scale) / TILE);

		Match3.place(x, y);
	}
});

Crafty.c("Tile", {
	init: function () {
		this.requires("2D, Canvas");
	},

	create: function (type, x, y) {
		this.addComponent(type);
		this.type = type;
		this.x = x * TILE;
		this.y = y * TILE;
		this.row = y;
		this.col = x;

		return this;
	}
});

Crafty.c("shakeit", {
	init: function () {
		this.originalX = this.x;
		this.originalY = this.y;

		//shake the position every 100 ms
		var interval = setInterval(this.shake.bind(this), 30);

		//after 800ms stop shaking
		setTimeout(function () {
			clearInterval(interval);

			//go back to the original position
			this.x = this.originalX;
			this.y = this.originalY;
		}.bind(this), 800);
	},

	shake: function () {
		this.x = this.originalX + Crafty.math.randomNumber(-5, 5);
		this.y = this.originalY + Crafty.math.randomNumber(-5, 5);
	}
});



function replaceTile (x, y, tile) {
	var ent = Match3.board[x][y];
	ent.removeComponent(ent.type).addComponent(tile);
	ent.type = tile;

	var matches = Match3.checkThree(x, y, tile);

	if (matches.length) {
		console.log(matches);

		//remove each tile
		matches.forEach(function (match) {
			//TODO: refactor this one, two business
			match.one.removeComponent(match.one.type).addComponent("empty");
			match.two.removeComponent(match.two.type).addComponent("empty");
			match.one.type = match.two.type = "empty";
		});
		
		ent.addComponent("shakeit");
		setTimeout(function () {
			ent.type = Match3.nextTile[tile];
			ent.addComponent(ent.type);

			replaceTile(x, y, ent.type);
		}, 800);
	}
}
