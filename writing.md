# Your favourite HTML5 game engines on Firefox OS

In this article we will be looking at 3 popular HTML5 game (or drawing) frameworks and how to write a simple game for Firefox OS. The game engines we will be using are [CraftyJS](http://craftyjs.com), [EaselJS](http://easeljs.com) and [ImpactJS](http://impactjs.com). 

The game we will be making is a Match-3 game or a [Triple Town](http://spryfox.com/our-games/tripletown/) clone.

Parts of the game will not be covered in this article such as game logic. We will be focusing on what the frameworks provide, how to use them and how to optimise the game for Firefox OS. The logic is contained in a source file called [`common.js`](https://github.com/louisstow/Match-3/blob/master/implementations/common.js). You may peruse the source on [Github](https://github.com/louisstow/Match-3).

## Art

The theme I went for was *Cityscape*. You start with slums and build your way up to skyscrapers. The empty space will be connected roads and the blockers will be car traffic.

![Spritesheet for Metro 3](http://i.imgur.com/SoBRCK4.png)

## CraftyJS

The first thing I usually setup in a game is the spritesheet. With Crafty the method is `Crafty.sprite()`. You specify the size of the tiles and then reference the index of the sprite in the sheet.

~~~javascript
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
~~~

