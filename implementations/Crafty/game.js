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

	setScale();

	//preload our assets
	Crafty.load(["../../assets/city.png", "../../assets/bg.png"], function () {
		//define the sprites on the spritesheet
		Crafty.sprite(TILE, "../../assets/city.png", {
			slum: [0,0],
			house: [1,0],
			apartment: [2,0],
			skyscraper: [3,0],
			mansion: [4,0],
			pond: [1,1],
			car: [2,1],
			crystal: [3,1],

			road_s: [0,2],
			road_h: [1,2],
			road_v: [2,2],
			road_x: [3,2],
			road_e: [0,3],
			road_l: [2,3],
			road_t: [3,3],

			empty: [0,2]
		});

		Crafty.background("url('../../assets/bg.png')");
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

	Match3.generateRoads(function (tile, type, rotation) {
		
		tile.makeRoad(type, rotation);
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
		this.type = this.spriteType = type;
		this.x = x * TILE;
		this.y = y * TILE;
		this.row = y;
		this.col = x;

		return this;
	},

	clear: function () {
		this.removeComponent(this.spriteType);
		this.rotation = 0;

		return this;
	},

	makeRoad: function (type, rotation) {
		this.origin("center");
		this.removeComponent(this.spriteType);
		this.spriteType = "road_" + type;
		this.addComponent(this.spriteType);
		this.rotation = rotation;
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
	ent.clear().addComponent(tile);
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

	//regenerate road_s
	Match3.generateRoads(function (tile, type, rotation) {
		tile.makeRoad(type, rotation);
	});
}
