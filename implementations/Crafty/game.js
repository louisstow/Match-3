//entry point to the game
window.onload = start;

var scale = window.innerWidth / Match3.REAL_WIDTH;
var UI;

//method to scale the stage to fit the screen
//using CSS3 transform
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

//main function
function start () {
	//init Crafty with game dimensions
	Crafty.init(
		Match3.BOARD_WIDTH * Match3.TILE, 
		Match3.BOARD_HEIGHT * Match3.TILE + Match3.UI_HEIGHT
	);

	setScale();

	//preload our assets
	Crafty.load(["../../assets/city.png", "../../assets/bg.png", "../../assets/logo.png"], function () {
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

		//set the background style property of the
		//stage
		Crafty.background("url('../../assets/bg.png')");

		

		//start the main scene once everything
		//has been loaded
		Crafty.scene("main");	
	});

}

/**
* Definition of the main scene where
* the game exists.
*/
Crafty.scene("main", function () {
	//show the logo then fade out
	Crafty.e("2D, DOM, Image, Tween")
		.attr({x: -3, y: 150, z: 200, w: 200})
		.image("../../assets/logo.png")
		.timeout(function () {
			this.tween({
				alpha: 0
			}, 70);	
		}, 1200)
			

	//create a crafty entity and save in the
	//board structure
	Match3.generateBoard(function (x, y, type) {
		return Crafty.e("Tile").create(type, x, y);
	});

	//transform the entity into a road
	Match3.generateRoads(function (tile, type, rotation) {
		tile.makeRoad(type, rotation);
	});

	//add some events for listening to input
	//and resize events
	Crafty.addEvent(this, window, "click", onInputSelect);
	Crafty.addEvent(this, window, "touchend", onInputSelect);
	Crafty.addEvent(this, window, "resize", setScale);

	//when the user touchdown or clicks stage
	function onInputSelect (e) {
		//find the position of the touch
		var pos = (e.type === "touchend") ? e.changedTouches[0] : e;

		//calculate the board position
		var x = Math.floor((pos.clientX / scale) / TILE);
		var y = Math.floor((pos.clientY / scale) / TILE);

		//attempt to place tile at the position
		Match3.place(x, y);
	}

	//create the bottom UI box
	UI = Crafty.e("2D, Canvas, Color, UI").attr({
		x: 0,
		y: Match3.REAL_HEIGHT - Match3.UI_HEIGHT,
		w: Match3.REAL_WIDTH,
		h: Match3.UI_HEIGHT,
	}).color("#177407");
});

/**
* Component for the UI
*/
Crafty.c("UI", {
	//score counter
	_score: 0,

	init: function () {
		//create the widgets in the UI box
		this.scoreEnt = Crafty.e("2D, DOM, Text, Score").attr({
			x: 280,
			y: Match3.REAL_HEIGHT - 50,
			w: 100,
			h: 50,
			z: 100
		}).text(0);

		this.labelNext = Crafty.e("2D, DOM, Text, Label").attr({
			x: 10,
			y: Match3.REAL_HEIGHT - 50,
			w: 100,
			h: 50
		}).text("Next tile");

		this.labelScore = Crafty.e("2D, DOM, Text, Label").attr({
			x: 220,
			y: Match3.REAL_HEIGHT - 50,
			w: 100,
			h: 50
		}).text("Score");

		this.iconNext = Crafty.e("2D, Canvas, slum").attr({
			x: 90,
			y: Match3.REAL_HEIGHT - 48,
			w: 40,
			h: 40
		});
	},

	//helper method to update score counter
	//and display in the UI
	updateScore: function (score) {
		this._score += score;
		this.scoreEnt.text(this._score + "");
	}
});

/**
* Component for each Tile
*/
Crafty.c("Tile", {
	init: function () {
		this.requires("2D, Canvas");
		this.z = 10;
	},

	//constructor function to create
	//a tile
	create: function (type, x, y) {
		this.addComponent(type);
		this.type = this.spriteType = type;
		this.x = x * TILE;
		this.y = y * TILE;
		this.row = y;
		this.col = x;

		return this;
	},

	//resets internal data so can be reused
	clear: function () {
		this.removeComponent(this.spriteType);
		this.rotation = 0;

		return this;
	},

	//helper method to turn the tile
	//into a road tile
	makeRoad: function (type, rotation) {
		this.origin("center");
		this.removeComponent(this.spriteType);
		this.spriteType = "road_" + type;
		this.addComponent(this.spriteType);
		this.rotation = rotation;
	}
});

/**
* Quick component to shake the entities position
* for 800ms
*/
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

//Display the next item in the UI
Match3.onNextItem = function (item) {
	UI.iconNext.addComponent(item).attr({
		w: 40,
		h: 40
	});
}

//Handler for when a blocker is created.
//Returns a new Crafty entity
Match3.onBlocker = function (x, y) {
	return Crafty.e("2D, Canvas, car, Tween").attr({
		x: x * Match3.TILE,
		y: y * Match3.TILE,
		row: y,
		col: x,
		z: 20
	});
}

//Animate the blocker (car) to its new
//position.
Match3.onMoveBlocker = function (car, x, y) {
	car.attr({
		row: y,
		col: x
	}).tween({
		x: x * Match3.TILE,
		y: y * Match3.TILE,
	}, 50);
}

//Handler for game over state. Will display
//a message over the screen.
Match3.onGameOver = function () {
	var box = Crafty.e("2D, DOM, Dialog, HTML, Mouse").attr({
		x: 50,
		y: 50,
		w: Match3.REAL_WIDTH - 120,
		h: Match3.REAL_HEIGHT - 170
	}).replace([
		"<h1>Game Over</h1>",
		"<strong>Your score: </strong>",
		"<em>" + UI._score + "</em>",
		"<p>Tap to replay</p>"
	].join(""));

	//reload the page to replay game
	box._element.onclick = function () {
		window.location.reload();
	};
}

//Handler for when a tile can be replaced.
//Will check for any matches.
Match3.onReplaceTile = function (x, y, tile) {
	//replace empty tile with placed tile
	var ent = Match3.board[x][y];
	ent.clear().addComponent(tile);
	ent.type = tile;

	//check for any matches after placement
	var matches = Match3.checkThree(x, y, tile);

	//update the score to match new placement
	UI.updateScore(Match3.scores[tile]);

	if (matches.length) {
		//remove each tile
		matches.forEach(function (match) {
			//decrease score for the tiles we remove
			var decreaseScore = Match3.scores[match.one.type] + Match3.scores[match.two.type];
			UI.updateScore(-decreaseScore);

			match.one.removeComponent(match.one.type).addComponent("empty");
			match.two.removeComponent(match.two.type).addComponent("empty");
			
			//if the tile was a crystal, replace
			//with the matched tile
			if (tile === "crystal")
				tile = match.one.type;

			match.one.type = match.two.type = "empty";
		});
		
		//add some shaking effects
		ent.addComponent("shakeit");

		//when the shaking is over, transform tile
		setTimeout(function () {
			//turn into the next tile after match
			ent.type = Match3.nextTile[tile];
			ent.addComponent(ent.type);

			//call recursively incase there are more matches
			//after transformation
			Match3.onReplaceTile(x, y, ent.type);
		}, 800);
	}

	//regenerate roads
	Match3.generateRoads(function (tile, type, rotation) {
		tile.makeRoad(type, rotation);
	});
}
