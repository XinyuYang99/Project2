/***********************************************************************************
  Simple
  by Scott Kildall

  Uses the p5.2DAdventure.js class 

  To do:
  ** cleanup p5.2DAdventure.js class + document it
  ** add mouse events, other interactions
  ** finish MazeMapper
  
------------------------------------------------------------------------------------
	To use:
	Add this line to the index.html

  <script src="p5.2DAdventure.js"></script>
***********************************************************************************/

// adventure manager global  
var adventureManager;

// p5.pla7
var playerSprite;
var playerAnimation;

// Clcikables: the manager class
var clickablesManager;    // the manager class
var clickables;           // an array of clickable objects
var bookSprite = [];
var bookCollected = [];
var moneySprite = [];
var moneyCollected = [];
var totalCollected;
var maxCollected = 5;

// indexes into the array (constants)
const bag1Index = 0;
const bag2Index = 1;
const answer1Index = 2;
const answer2Index = 3;

var talkedToPiggy = false;
var helpedPiggy = false;

var strings = [];
var startY = 40;
var lineHeight = 24;

// Allocate Adventure Manager with states table and interaction tables
function preload() {
	clickablesManager = new ClickableManager('data/clickableLayout.csv');
	adventureManager = new AdventureManager('data/adventureStates.csv', 'data/interactionTable.csv', 'data/clickableLayout.csv');

	// load all our potential avatar animations here
	// avatarAnimations[0] = loadAnimation('assets/avatars/movement1.png', 'assets/avatars/movement6.png');
	// avatarAnimations[1] = loadAnimation('assets/avatars/book1.png'，'assets/avatars/book2.png');
 //    avatarAnimations[2] = loadAnimation('assets/avatars/money1.png','assets/avatars/money2.png');
}

// Setup the adventure manager
function setup() {
	createCanvas(1280, 720);

	// setup the clickables = this will allocate the array
	clickables = clickablesManager.setup();

	// this is optional but will manage turning visibility of buttons on/off
	// based on the state name in the clickableLayout
	adventureManager.setClickableManager(clickablesManager);

	// This will load the images, go through state and interation tables, etc
	adventureManager.setup();

  // adventureManager.setChangedStateCallback(changedState);

    textAlign(LEFT);
    textSize(30);

    // create a sprite and add the 3 animations
    playerSprite = createSprite(width/2, height/2, 80, 80);
    playerSprite.addAnimation('regular', 'assets/avatars/movement1.png', 'assets/avatars/movement6.png');

    // make book sprite for maze3
    moneySprite[0] = createSprite(90, 100, 100, 60);
    moneySprite[1] = createSprite(800, 300, 100, 60);
    moneySprite[2] = createSprite(90, 500, 100, 60);
    moneySprite[3] = createSprite(1200, 85, 100, 60);

    //make book sprite for maze4
    moneySprite[4] = createSprite(90, 100, 100, 60);
    moneySprite[5] = createSprite(800, 300, 100, 60);
    moneySprite[6] = createSprite(90, 500, 100, 60);
    moneySprite[7] = createSprite(1200, 85, 100, 60);

    //make money sprite for maze1
    bookSprite[0] = createSprite(200, 100, 100, 100);
    bookSprite[1] = createSprite(800, 300, 100, 100);
    bookSprite[2] = createSprite(200, 500, 100, 100);
    bookSprite[3] = createSprite(1200, 85, 100, 100);

    //make money sprite for maze2
    bookSprite[4] = createSprite(100, 380, 100, 100);
    bookSprite[5] = createSprite(1000, 430, 100, 100);
    bookSprite[6] = createSprite(100, 500, 100, 100);
    bookSprite[7] = createSprite(1200, 150, 100, 100);

    // add animation for each one...
    for( let i = 0; i < bookSprite.length ; i++ ) {
      bookSprite[i].addAnimation('regular', loadAnimation('assets/avatars/book1.png','assets/avatars/book2.png'));
      bookCollected[i] = false;
    }

    for (let i = 0; i < moneySprite.length; i++) {
      moneySprite[i].addAnimation('regular', loadAnimation('assets/avatars/money1.png','assets/avatars/money2.png'));
      moneyCollected[i] = false
    }


    // use this to track movement from toom to room in adventureManager.draw()
    adventureManager.setPlayerSprite(playerSprite);

    // call OUR function to setup additional information about the p5.clickables
    // that are not in the array 
    setupClickables(); 
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

    moneyNumber = countMoneyCollected();
    bookNumber = countBookCollected();
    totalCollected = moneyNumber + bookNumber;
    if (totalCollected >= maxCollected) {
        for( let i = 0; i < bookSprite.length ; i++ ) {
            bookCollected[i] = false;
        }

        for (let i = 0; i < moneySprite.length; i++) {
            moneyCollected[i] = false
        }
    }

    if( adventureManager.getStateName() !== "Splash1" && 
      adventureManager.getStateName() !== "Splash2" &&
      adventureManager.getStateName() !== "Splash3" &&
      adventureManager.getStateName() !== "Splash4" && 
      adventureManager.getStateName() !== "End") {
        textSize(48);
        fill(0,255,52);
        text(moneyNumber, width / 4 - 50, height - 40);
        fill(0);
        text(bookNumber, width / 2 + 100, height - 40);
        if (helpedPiggy === true) {
            fill(255,0,0);
            text("1", width - 150, height - 40);
        }
        else {
            fill(255,0,0);
            text("0", width - 150, height - 40);
        }
    }
}

function countBookCollected() {
        // count the collected masks
        let collectedBook = 0;
    for( let i = 0; i < bookSprite.length; i++ ) {
           if(bookCollected[i] === true ) {
                  collectedBook++;
           }
    }

    return collectedBook;
}

function countMoneyCollected() {
        // count the collected masks
        let collectedMoney = 0;
        for( let i = 0; i < moneySprite.length; i++ ) {
           if(moneyCollected[i] === true ) {
                  collectedMoney++;
           }
    }
    return collectedMoney;
}

// pass to adventure manager, this do the draw / undraw events
function keyPressed() {
	// toggle fullscreen mode
	if( key === 'f') {
		fs = fullscreen();
		fullscreen(!fs);
		return;
	}
	// dispatch key events for adventure manager to move from state to 
	// state or do special actions - this can be disabled for NPC conversations
	// or text entry
	adventureManager.keyPressed(key); 
}

function mouseReleased() {
  adventureManager.mouseReleased();
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
  // All clickables to have same effects
  for( let i = 0; i < clickables.length; i++ ) {
  	clickables[i].color = "#00000000";
  	clickables[i].strokeWeight = 0;
    clickables[i].onPress = clickableButtonPressed;
  }
}

clickableButtonPressed = function() {
	// these clickables are ones that change your state
	// so they route to the adventure manager to do this
	if( this.id === bag1Index || this.id === bag2Index) {
		adventureManager.clickablePressed(this.name);
	} 

  if( !checkPiggyButtons(this.id) ) {
    // route to adventure manager unless you are on weird NPC screne
    adventureManager.clickablePressed(this.name);
  }
}

function checkPiggyButtons(idNum) {
  if( idNum === 2 || idNum === 3 ) {
    if( idNum === 2) {
      adventureManager.changeState("Shop2");
    }

    return true;
  }

  return false;
}

function talkedToPiggy() {
  if( talkedToPiggy === false ) {
    // turn on visibility for buttons
    for( let i = answer1Index; i <= answer2Index; i++ ) {
      clickables[i].visible = true;
    }

    talkedToPiggy = true;
  }
}

class Maze1Room extends PNGRoom {
    draw() {
        super.draw();
        for (let i = 0; i <= 3; i++) {
            drawSprite(bookSprite[i])
            playerSprite.overlap(bookSprite[i], bookCollected[i]=true);
        } 
    }
}

class Maze2Room extends PNGRoom {
    draw() {
        super.draw();
        for (let i = 4; i < bookSprite.length; i++) {
            drawSprite(bookSprite[i])
            playerSprite.overlap(bookSprite[i], bookCollected[i]=true);
        } 
    }
}

class Maze3Room extends PNGRoom {
    draw() {
        super.draw();
        for (let i = 0; i <=3; i++) {
            drawSprite(moneySprite[i])
            playerSprite.overlap(moneySprite[i], moneyCollected[i]=true);
        } 
    }
}

class Maze4Room extends PNGRoom {
    draw() {
        super.draw();
        for (let i = 4; i < moneySprite.length; i++) {
            drawSprite(moneySprite[i])
            playerSprite.overlap(moneySprite[i], moneyCollected[i]=true);
        } 

    }
}
// Instructions screen has a backgrounnd image, loaded from the adventureStates table
// It is sublcassed from PNGRoom, which means all the loading, unloading and drawing of that
// class can be used. We call super() to call the super class's function as needed
class BridgeRoom extends PNGRoom {
  // preload() gets called once upon startup
  preload() {
      // this is our image, we will load when we enter the room
      this.talkBubble = null;
      this.talkedToNPC = false;  // only draw when we run into it
      talkedToPiggy = false;

      // NPC position
      this.drawX = width * 1/4 - 150;
      this.drawY = height * 3/4 - 50;

      // load the animation just one time
      this.piggySprite = createSprite( this.drawX, this.drawY, 100, 100);
      this.piggySprite.addAnimation('regular',  loadAnimation('assets/NPCs/pigmovement1.png', 'assets/NPCs/pigmovement6.png'));
   }

   load() {
      // pass to superclass
      super.load();

      this.talkBubble = loadImage('assets/talkBubble.png');
      
      // turn off buttons
      for( let i = answer1Index; i <= answer2Index; i++ ) {
       clickables[i].visible = false;
      }
    }

    // clears up memory
    unload() {
      super.unload();

      this.talkBubble = null;
      talkedToPiggy = false;
    }

   // pass draw function to superclass, then draw sprites, then check for overlap
  draw() {
    // PNG room draw
    super.draw();

    // draws all the sprites in the group
    //this.weirdNPCSprite.draw();
    drawSprite(this.piggySprite)
    // draws all the sprites in the group - 
    //drawSprites(this.weirdNPCgroup);//.draw();

    // checks for overlap with ANY sprite in the group, if this happens
    // talk() function gets called
    playerSprite.overlap(this.piggySprite, talkedToPiggy);
     
    if( this.talkBubble !== null && talkedToPiggy === true ) {
      image(this.talkBubble, this.drawX + 60, this.drawY - 350);
    }
  }
}

class EndRoom extends PNGRoom {
    draw() {
        super.draw();
        let totalSocre = moneyNumber * 1 + bookNumber * 2;
        if (helpedPiggy = true) {
            totalSocre += 3;
        }
        textSize(50);
        textStyle(BOLD);
        fill(255,0,0);
        text(totalSocre, width/2, height/2 + 10);
    }
}