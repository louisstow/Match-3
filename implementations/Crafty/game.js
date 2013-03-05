window.onload = start;

//the board is stored in a 2D array
var board = [];

//tile is 128 pixels and 10 x 10 tiles
var TILE = 64;
var BOARD_WIDTH = 6;
var BOARD_HEIGHT = 6;
var current = "nightly";

function start () {
	//init Crafty with game dimensions
	Crafty.init(
		BOARD_WIDTH * TILE, 
		BOARD_HEIGHT * TILE
	);

	Crafty.background("#ccc");

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

	generateBoard();

	Crafty.addEvent(this, Crafty.stage.elem, "click", function (e) {
		
		var x = Math.floor(e.clientX / TILE);
		var y = Math.floor(e.clientY / TILE);

		place(x, y);
	});
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
			//go back to the original position
			this.x = this.originalX;
			this.y = this.originalY;

			clearInterval(interval);
		}.bind(this), 800);
	},

	shake: function () {
		this.x = this.originalX + Crafty.math.randomNumber(-5, 5);
		this.y = this.originalY + Crafty.math.randomNumber(-5, 5);
	}
})

function generateBoard () {
	for (var x = 0; x < BOARD_WIDTH; ++x) {
		//populate the board array
		if (!board[x]) { board[x] = []; }

		for (var y = 0; y < BOARD_HEIGHT; ++y) {
			var randomValue = Math.random();
			var type = "empty";

			if (randomValue < 0.1) {
				type = "aurora";
			} else if (randomValue < 0.2) {
				type = "nightly";
			}

			//only check for matches if not empty
			if (type !== "empty" && checkThree(x, y, type).length) {
				type = "empty";
			}
			
			board[x][y] = Crafty.e("Tile").create(type, x, y);
		}
	}
}

var nextTile = {
	"nightly": "aurora",
	"aurora": "firefox",
	"firefox": "fxos"
};

function replaceTile (x, y, tile) {
	var ent = board[x][y];
	ent.removeComponent(ent.type).addComponent(tile);
	ent.type = tile;

	var matches = checkThree(x, y, tile);

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
			ent.type = nextTile[tile];
			ent.addComponent(ent.type);

			replaceTile(x, y, ent.type);
		}, 500);
	}
}

function place (x, y) {
	var ent = board[x][y];

	//can only replace empty tiles
	if (ent.type !== "empty") { 
		console.log(ent, ent.type)
		return; 
	}
	replaceTile(x, y, current);

	current = "nightly";
}

//store each possible position
//where a match could exist
var matchPatterns = [
	
	[ [-1, 0], [-1, -1] ], //1. left up
	[ [0, -1], [-1, -1] ], //2. up left
	[ [0, -1], [ 0, -2] ], //3. up up
	[ [0, -1], [ 1, -1] ], //4. up right
	[ [1,  0], [ 1, -1] ], //5. right up
	[ [1,  0], [ 2,  0] ], //6. right right
	[ [1,  0], [ 1,  1] ], //7. right down
	[ [0,  1], [ 1,  1] ], //8. down right
	[ [0,  1], [ 0,  2] ], //9. down down
	[ [0,  1], [-1,  1] ], //10. down left
	[ [-1, 0], [-1,  1] ], //11. left down
	[ [-1, 0], [-2,  0] ], //12. left left

	[ [-1, 0], [ 0, -1] ], //13. left & up
	[ [0, -1], [ 1,  0] ], //14. up & right
	[ [1,  0], [ 0,  1] ], //14. right & down
	[ [0,  1], [-1,  0] ], //15. down & left

	[ [0, -1], [ 0,  1] ], //16. up & down
	[ [-1, 0], [ 1,  0] ]  //17. left & right
];

function getRelative (x, y, pos) {
	var newx = x + pos[0];
	var newy = y + pos[1];

	if (!board[newx] || !board[newx][newy]) {
		return undefined;
	}

	return board[newx][newy];
}

function checkThree (x, y, tile) {
	var result = [];

	matchPatterns.forEach(function (direction) {
		
		var one = getRelative(x, y, direction[0]);
		var two = getRelative(x, y, direction[1]);

		if (one && two && one.type === tile && two.type === tile) {
			result.push({
				direction: direction,
				one: one,
				two: two
			});
		}
	});

	return result;
}