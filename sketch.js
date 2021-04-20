/***********************************************************************************
  Resource Distribution
  by Xinyu Yang


This is the files using p5.play.js and p5.2DAdventure.js libraries to create a 
social justice game which try to solved the issue about resource distribution. 
This is the adventure game which the character try to live in this world and 
figure out how to equally distribute the resources. The player will use the 
arrow keys to navigate the character and use mouse and clickable buttons to talk 
with NPC. The goal of the player is try to gain more points, which they need to 
figure out how to do that. The idea of the character is to distribute the wealth 
and knowledge equally to all the people.

------------------------------------------------------------------------------------

***********************************************************************************/

// adventure manager global  
var adventureManager;

// global variables to control the visibility of books
var x0 = false;
var x1 = false;
var x2 = false;
var x3 = false;
var x4 = false;
var x5 = false;
var x6 = false;
var x7 = false;

// global variables to control the visibility of money
var y0 = false;
var y1 = false;
var y2 = false;
var y3 = false;
var y4 = false;
var y5 = false;
var y6 = false;
var y7 = false;

// p5.play
var playerSprite;
var playerAnimation;

// Clcikables: the manager class
var clickablesManager;    // the manager class
var clickables;           // an array of clickable objects
var bookSprite = [];
var bookCollected = [];
var moneySprite = [];
var moneyCollected = [];
var bookNumber = 0;
var moneyNumber = 0;
var totalCollected;
var newBookNumber;
var newMoneyNumber;
var finalbookNumer = true;
var finalmoneyNumber = true;
var talkedToPiggy = false;
var helpedPiggy = false;
var maxCollected = 5;

// indexes into the array (constants)
const bag1Index = 0;
const bag2Index = 1;
const answer1Index = 2;
const answer2Index = 3;

// Allocate Adventure Manager with states table and interaction tables
function preload() {
	clickablesManager = new ClickableManager('data/clickableLayout.csv');
	adventureManager = new AdventureManager('data/adventureStates.csv', 'data/interactionTable.csv', 'data/clickableLayout.csv');
}

// Setup the adventure manager
function setup() {
	createCanvas(1280, 720);

	// setup the clickables = this will allocate the array
	clickables = clickablesManager.setup();

	// based on the state name in the clickableLayout
	adventureManager.setClickableManager(clickablesManager);

	// This will load the images, go through state and interation tables, etc
	adventureManager.setup();

    // create the player sprite and add the animation
    playerSprite = createSprite(width/2, height/2, 80, 80);
    playerSprite.addAnimation('regular', 'assets/avatars/movement1.png', 'assets/avatars/movement6.png');

    // use this to track movement from toom to room in adventureManager.draw()
    adventureManager.setPlayerSprite(playerSprite);
    adventureManager.setChangedStateCallback(changedState);

    // call OUR function to setup additional information about the p5.clickables
    // that are not in the array 
    setupClickables(); 

    // to use later if helped piggy
    let bookRandom = int(random(20,50));
    let moneyRandom = int(random(20,50));

    newBookNumber = bookNumber + bookRandom;
    newMoneyNumber = moneyNumber + moneyRandom;
}

// Adventure manager handles it all!
function draw() {
	// draws background rooms and handles movement from one to another
	adventureManager.draw();

	// draw the p5.clickables, in front of the mazes but behind the sprites 
	clickablesManager.draw();

	// responds to keydowns
	moveSprite();

    // this is a function of p5.js, not of this sketch
	drawSprite(playerSprite);

    // if not helped Piggy, only 5 maximum items to collect
    if (helpedPiggy === false) {
        moneyNumber = countMoney();
        bookNumber = countBook();

        // If exceeds 5, back to 0
        if (totalCollected > 5) {
            finalbookNumer = false;
            finalmoneyNumber = false;
        }

        totalCollected = moneyNumber + bookNumber;
    }
    // if helped Piggy, add random number. The total will be the total wealth/2
    else {
        moneyNumber = newMoneyNumber;
        bookNumber = newBookNumber;
    }

    // show how many items you have
    if(adventureManager.getStateName() !== "Splash1" && 
      adventureManager.getStateName() !== "Splash2" &&
      adventureManager.getStateName() !== "Splash3" &&
      adventureManager.getStateName() !== "Splash4" &&
      adventureManager.getStateName() !== "End1" && 
      adventureManager.getStateName() !== "End2") {

        // show money numbers in green
        textSize(48);
        fill(0,255,52);
        text(moneyNumber, width / 4 - 50, height - 40);

        // show book numbers in black
        fill(0);
        text(bookNumber, width / 2 + 100, height - 40);

        if (helpedPiggy === true) {
            //show in red
            fill(255,0,0);
            text("1", width - 150, height - 40);
        }
        else {
            fill(255,0,0);
            text("0", width - 150, height - 40);
        }
    }
}

// pass to adventure manager
function keyPressed() {
	// toggle fullscreen mode
	if( key === 'f') {
		fs = fullscreen();
		fullscreen(!fs);
		return;
	}

	// dispatch key events for adventure manager to move from state to 
	adventureManager.keyPressed(key); 
}

function mouseReleased() {
    adventureManager.mouseReleased();
}

//-------------- CALLBACK FUNCTION FOR WHEN STATE HAS CHANGED -------//
function changedState(currentStateStr, newStateStr) {
    print("changed state" + "current state = " + currentStateStr + " new state = " + newStateStr);

}

//-------------- YOUR SPRITE MOVEMENT CODE HERE  ---------------//
function moveSprite() {
    if(keyIsDown(RIGHT_ARROW))
        playerSprite.velocity.x = 10;
    else if(keyIsDown(LEFT_ARROW))
        playerSprite.velocity.x = -10;
    else
        playerSprite.velocity.x = 0;

    if(keyIsDown(DOWN_ARROW))
        playerSprite.velocity.y = 10;
    else if(keyIsDown(UP_ARROW))
        playerSprite.velocity.y = -10;
    else
        playerSprite.velocity.y = 0;
}

//-------------- CLICKABLE CODE  ---------------//
function setupClickables() {
    // Hide bag buttons
    for( let i = bag1Index; i <= bag2Index; i++ ) {
        clickables[i].color = "#00000000";
        clickables[i].strokeWeight = 0;
        clickables[i].onPress = clickableButtonPressed;
    }

    // show Answee buttons
    for( let i = answer1Index; i <= answer2Index; i++ ) {
        clickables[i].onHover = clickableButtonHover;
        clickables[i].onOutside = clickableButtonOnOutside;
        clickables[i].onPress = clickableButtonPressed;
    }
}

// tint when mouse is over
clickableButtonHover = function () {
    this.color = "#AA33AA";
    this.noTint = false;
    this.tint = "#FF0000";
}

// color a light gray if off
clickableButtonOnOutside = function () {
    // backto our gray color
    this.color = "#AAAAAA";
}

clickableButtonPressed = function() {
	// these clickables are ones that change your state
	// so they route to the adventure manager to do this
	if( this.id === bag1Index || this.id === bag2Index) {
		adventureManager.clickablePressed(this.name);
	} 

    if( !checkPiggyButtons(this.id) ) {
        // route to adventure manager unless you are on Bridge1 state
        adventureManager.clickablePressed(this.name);
    }
}

function talkToPiggy() {
  if(talkedToPiggy === false) {
    // turn on visibility for buttons
    for(let i = answer1Index; i <= answer2Index; i++ ) {
      clickables[i].visible = true;
    }
    // show the talk2
    talkedToPiggy = true;
  }
}

function checkPiggyButtons(idNum) {
    if( idNum === 2 || idNum === 3 ) {
        // You chose to helped Piggy
        if( idNum === 2) {
            helpedPiggy = true;
            // Piggy will thank you
            adventureManager.changeState("Bridge2");
            for(let i = answer1Index; i <= answer2Index; i++ ) {
                clickables[i].visible = false;
            }   
            return true;
        }

        else {
            //nothihng happened
            for(let i = answer1Index; i <= answer2Index; i++ ) {
                clickables[i].visible = false;
            }  
        }
    }
    return false;
}

function countBook() {
    let count = 0;
    for (let i = 0; i < bookCollected.length; i++) {
        if (bookCollected[i] === true) {
            if (finalbookNumer === true) {
                count++;
            }
        }
    }
    return count;
}

function countMoney() {
    let count = 0;
    for (let i = 0; i < moneyCollected.length; i++) {
        if (moneyCollected[i] === true) {
            if (finalmoneyNumber === true) {
                count++;
            }
        }
    }
    return count;
}

// create book sprites and collect
class Maze1Room extends PNGRoom {
  // preload() gets called once upon startup
  // We load ONE animation and create 20 NPCs
  preload() {
     // load the animation just one time
    this.bookAnimation = loadAnimation('assets/avatars/book1.png', 'assets/avatars/book2.png');
    
    // change this number for more or less
    this.numbook = 4;

    // is an array of sprites, note we keep this array because
    // later I will add movement to all of them
    this.bookSprites = [];

    //create 4 book sprite
    this.bookSprites[0] = createSprite(200, 100, 100, 100);
    this.bookSprites[1] = createSprite(800, 300, 100, 100);
    this.bookSprites[2] = createSprite(200, 500, 100, 100);
    this.bookSprites[3] = createSprite(1200, 85, 100, 100);

    this.bookSprites[0].addAnimation('regular', this.bookAnimation);
    this.bookSprites[1].addAnimation('regular', this.bookAnimation);
    this.bookSprites[2].addAnimation('regular', this.bookAnimation);
    this.bookSprites[3].addAnimation('regular', this.bookAnimation);

    // check their status, if they are overlap or not
    x0 = false;
    x1 = false;
    x2 = false;
    x3 = false;
  }

  // pass draw function to superclass, then draw sprites, then check for overlap
  draw() {

    // PNG room draw
    super.draw();
    if (x0 === true)  this.bookSprites[0].remove();
    if (x1 === true)  this.bookSprites[1].remove(); 
    if (x2 === true)  this.bookSprites[2].remove();
    if (x3 === true)  this.bookSprites[3].remove(); 

    drawSprite(this.bookSprites[0]);
    drawSprite(this.bookSprites[1]);
    drawSprite(this.bookSprites[2]);
    drawSprite(this.bookSprites[3]);

    playerSprite.overlap(this.bookSprites[0], this.bookCollect0);
    playerSprite.overlap(this.bookSprites[1], this.bookCollect1);
    playerSprite.overlap(this.bookSprites[2], this.bookCollect2);
    playerSprite.overlap(this.bookSprites[3], this.bookCollect3);
  }

  bookCollect0() {
    // It is collected and count it
    x0 = true;
    bookCollected[0] = true;
  }
   bookCollect1() {
    x1 = true;
    bookCollected[1] = true;
  }
   bookCollect2() {
    x2 = true;
    bookCollected[2] = true;
  }
   bookCollect3() {
    x3 = true;
    bookCollected[3] = true;
  }
}

// same as Maze1Eoom, change the position of book Sprites
class Maze2Room extends PNGRoom {
  preload() {
    this.bookAnimation = loadAnimation('assets/avatars/book1.png', 'assets/avatars/book2.png');
    
    this.numbook = 4;

    this.bookSprites = [];

    this.bookSprites[0] = createSprite(100, 380, 100, 100);
    this.bookSprites[1] = createSprite(1000, 430, 100, 100);
    this.bookSprites[2] = createSprite(100, 500, 100, 100);
    this.bookSprites[3] = createSprite(1200, 150, 100, 100);

    this.bookSprites[0].addAnimation('regular', this.bookAnimation);
    this.bookSprites[1].addAnimation('regular', this.bookAnimation);
    this.bookSprites[2].addAnimation('regular', this.bookAnimation);
    this.bookSprites[3].addAnimation('regular', this.bookAnimation);

    x4 = false;
    x5 = false;
    x6 = false;
    x7 = false;
  }

  draw() {
    super.draw();
    if (x4 === true)  this.bookSprites[0].remove();
    if (x5 === true)  this.bookSprites[1].remove(); 
    if (x6 === true)  this.bookSprites[2].remove();
    if (x7 === true)  this.bookSprites[3].remove(); 

    drawSprite(this.bookSprites[0]);
    drawSprite(this.bookSprites[1]);
    drawSprite(this.bookSprites[2]);
    drawSprite(this.bookSprites[3]);

    playerSprite.overlap(this.bookSprites[0], this.bookCollect0);
    playerSprite.overlap(this.bookSprites[1], this.bookCollect1);
    playerSprite.overlap(this.bookSprites[2], this.bookCollect2);
    playerSprite.overlap(this.bookSprites[3], this.bookCollect3);
  }

  bookCollect0() {
    x4 = true;
    bookCollected[4] = true;
  }
   bookCollect1() {
    x5 = true;
    bookCollected[5] = true;
  }
   bookCollect2() {
    x6 = true;
    bookCollected[6] = true;
  }
   bookCollect3() {
    x7 = true;
    bookCollected[7] = true;
  }
}

// Same as Maze1Room, change the sprite to money and change the position
class Maze3Room extends PNGRoom {
  preload() {

    this.bookAnimation = loadAnimation('assets/avatars/money1.png', 'assets/avatars/money2.png');
    
    this.numbook = 4;

    this.bookSprites = [];

    this.bookSprites[0] = createSprite(90, 100, 100, 60);
    this.bookSprites[1] = createSprite(800, 300, 100, 60);
    this.bookSprites[2] = createSprite(90, 500, 100, 60);
    this.bookSprites[3] = createSprite(1200, 85, 100, 60);

    this.bookSprites[0].addAnimation('regular', this.bookAnimation);
    this.bookSprites[1].addAnimation('regular', this.bookAnimation);
    this.bookSprites[2].addAnimation('regular', this.bookAnimation);
    this.bookSprites[3].addAnimation('regular', this.bookAnimation);

    y0 = false;
    y1 = false;
    y2 = false;
    y3 = false;
  }

  draw() {

    super.draw();
    if (y0 === true)  this.bookSprites[0].remove();
    if (y1 === true)  this.bookSprites[1].remove(); 
    if (y2 === true)  this.bookSprites[2].remove();
    if (y3 === true)  this.bookSprites[3].remove(); 

    drawSprite(this.bookSprites[0]);
    drawSprite(this.bookSprites[1]);
    drawSprite(this.bookSprites[2]);
    drawSprite(this.bookSprites[3]);

    playerSprite.overlap(this.bookSprites[0], this.bookCollect0);
    playerSprite.overlap(this.bookSprites[1], this.bookCollect1);
    playerSprite.overlap(this.bookSprites[2], this.bookCollect2);
    playerSprite.overlap(this.bookSprites[3], this.bookCollect3);
  }

  bookCollect0() {
    y0 = true;
    moneyCollected[0] = true;
  }
   bookCollect1() {
    y1 = true;
    moneyCollected[1] = true;
  }
   bookCollect2() {
    y2 = true;
    moneyCollected[2] = true;
  }
   bookCollect3() {
    y3 = true;
    moneyCollected[3] = true;
  }
}

// Same as Maze3Room, change the position of money Sprites
class Maze4Room extends PNGRoom {

  preload() {

    this.bookAnimation = loadAnimation('assets/avatars/money1.png', 'assets/avatars/money2.png');
    
    this.numbook = 4;

    this.bookSprites = [];

    this.bookSprites[0] = createSprite(90, 100, 100, 60);
    this.bookSprites[1] = createSprite(800, 300, 100, 60);
    this.bookSprites[2] = createSprite(90, 500, 100, 60);
    this.bookSprites[3] = createSprite(1200, 85, 100, 60);

    this.bookSprites[0].addAnimation('regular', this.bookAnimation);
    this.bookSprites[1].addAnimation('regular', this.bookAnimation);
    this.bookSprites[2].addAnimation('regular', this.bookAnimation);
    this.bookSprites[3].addAnimation('regular', this.bookAnimation);

    y4 = false;
    y5 = false;
    y6 = false;
    y7 = false;
  }

  draw() {

    super.draw();
    if (y4 === true)  this.bookSprites[0].remove();
    if (y5 === true)  this.bookSprites[1].remove(); 
    if (y6 === true)  this.bookSprites[2].remove();
    if (y7 === true)  this.bookSprites[3].remove(); 

    drawSprite(this.bookSprites[0]);
    drawSprite(this.bookSprites[1]);
    drawSprite(this.bookSprites[2]);
    drawSprite(this.bookSprites[3]);

    playerSprite.overlap(this.bookSprites[0], this.bookCollect0);
    playerSprite.overlap(this.bookSprites[1], this.bookCollect1);
    playerSprite.overlap(this.bookSprites[2], this.bookCollect2);
    playerSprite.overlap(this.bookSprites[3], this.bookCollect3);
  }

  bookCollect0() {
    y4 = true;
    moneyCollected[4] = true;
  }
   bookCollect1() {
    y5 = true;
    moneyCollected[5] = true;
  }
   bookCollect2() {
    y6 = true;
    moneyCollected[5] = true;
  }
   bookCollect3() {
    y7 = true;
    moneyCollected[6] = true;
  }
}

// subclass for Bridge Room
class Bridge1Room extends PNGRoom {
  // preload() gets called once upon startup
  preload() {
      // this is our image, we will load when we enter the room
      this.talk2 = null;
      this.talkedToNPC = false;  // only draw when we run into it
      talkedToPiggy = false;

      // NPC position
      this.drawX = width * 1/4 - 150;
      this.drawY = height * 3/4 - 50;

      // load the animation just one time
      this.piggySprite = createSprite(this.drawX, this.drawY, 80, 80);
      this.piggySprite.addAnimation('regular', loadAnimation('assets/NPCs/pigmovement1.png', 'assets/NPCs/pigmovement6.png'));
   }

   load() {
      // pass to superclass
      super.load();

      this.talk2 = loadImage('assets/talk2.png');
      
      // turn off buttons
      for( let i = answer1Index; i <= answer2Index; i++ ) {
       clickables[i].visible = false;
      }
    }

   // pass draw function to superclass, then draw sprites, then check for overlap
  draw() {
    // PNG room draw
    super.draw();

    drawSprite(this.piggySprite)

    // talk() function gets called
    playerSprite.overlap(this.piggySprite, talkToPiggy);
     
    if( this.talk2 !== null && talkedToPiggy === true ) {
      image(this.talk2, this.drawX + 40, this.drawY - 190);
    }
  }
}

// keep piggy shown in Bridge2 states
class Bridge2Room extends PNGRoom {

  preload() {
      this.talk2 = null;
      this.talkedToNPC = false; 
      talkedToPiggy = false;

      this.drawX = width * 1/4 - 150;
      this.drawY = height * 3/4 - 50;

      this.piggySprite = createSprite(this.drawX, this.drawY, 80, 80);
      this.piggySprite.addAnimation('regular', loadAnimation('assets/NPCs/pigmovement1.png', 'assets/NPCs/pigmovement6.png'));
   }

  draw() {

    super.draw();

    drawSprite(this.piggySprite);

    }
}

// subclass for Shop1, which never pay attention to you
class Shop1Room extends PNGRoom {
  // preload() gets called once upon startup
  preload() {
     // load the animation just one time
    this.bookAnimation = loadImage('assets/avatars/house1.png');
    
    this.houseSprite = createSprite(width *3/4 + 103, height / 2 + 5, 432, 439);

    this.houseSprite.addImage(this.bookAnimation);
  }

  draw() {
    super.draw();

    drawSprite(this.houseSprite);
    playerSprite.overlap(this.houseSprite, this.housecollision);
  }

  housecollision() {
    textSize(40);
    fill(255,0,0);
    text("You are so poor, this place is not for you! Go Away!", 100, 200);
  }
}

// Same as Shop2 Room, without text. 
class Shop2Room extends PNGRoom {
  // preload() gets called once upon startup
  preload() {
     // load the animation just one time
    this.bookAnimation = loadImage('assets/avatars/house1.png');
    
    this.houseSprite = createSprite(width *3/4 + 103, height / 2 + 5, 432, 439);

    this.houseSprite.addImage(this.bookAnimation);
  }

  draw() {
    super.draw();

    drawSprite(this.houseSprite);
  }

}



class EndRoom extends PNGRoom {
    draw() {
        super.draw();
        let totalSocre = moneyNumber * 1 + bookNumber * 2;
        if (helpedPiggy === true) {
            totalSocre += 3;
        }
        textSize(50);
        textStyle(BOLD);
        fill(255,0,0);
        text(totalSocre, width/2, height/2 + 10);
    }
}