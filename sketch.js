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

// indexes into the array (constants)
const bag1Index = 0;
const bag2Index = 1;
const answer1Index = 2;
const answer2Index = 3;

var talkedToPiggy = false;

var strings = [];
var startY = 40;
var lineHeight = 24;

// Allocate Adventure Manager with states table and interaction tables
function preload() {
	clickablesManager = new ClickableManager('data/clickableLayout.csv');
	adventureManager = new AdventureManager('data/adventureStates.csv', 'data/interactionTable.csv', 'data/clickableLayout.csv');

	// load all our potential avatar animations here
	avatarAnimations[0] = loadAnimation('assets/avatars/childm1.png', 'assets/avatars/childm7.png');
	avatarAnimations[1] = loadAnimation('assets/avatars/teanm1.png', 'assets/avatars/teanm5.png');
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

    textAlign(LEFT);
    textSize(30);

    // create a sprite and add the 3 animations
    playerSprite = createSprite(width/2, height/2, 80, 80);
    playerSprite.addAnimation('regular', 'assets/avatars/movement1.png', 'assets/avatars/movement2.png');

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

	if( adventureManager.getStateName() === "Splash1" || adventureManager.getStateName() === "Splash2" || adventureManager.getStateName() === "Splash3") {
		loadArray();
	}
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



// array appears in the first room as an instructure
function loadArray() {
  strings[0] = "This beautiful place called Wisps is where I came from. I lived there for centuries.";
  strings[1] = "";
  strings[2] = "We have no hierarchy, no wealth, only our own power.";
  strings[3] = "";
  strings[4] = "One day... I walked into a cave and then... I came to another world.";
  strings[7] = "";
  strings[8] = "";
  strings[9] = "What's that thing in the bottom right corner?";
  strings[10] = "";
  strings[11] = "Try to click it, and use the ARROW keys to navigate your avatar around.";

  fill(255);
  for( let i = 0 ; i < strings.length; i++ ) {
    text( strings[i], width	/ 10, startY + (i * lineHeight) );
  }
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

	// Other non-state changing ones would go here.
function talkToWeirdy() {
  if( talkedToWeirdNPC === false ) {
    print( "turning them on");

    // turn on visibility for buttons
    for( let i = answer1Index; i <= answer6Index; i++ ) {
      clickables[i].visible = true;
    }

    talkedToWeirdNPC = true;
    print("talked to weidy");
  }
}
}

//-------------- SUBCLASSES / YOUR DRAW CODE CAN GO HERE ---------------//

// Instructions screen has a backgrounnd image, loaded from the adventureStates table
// It is sublcassed from PNGRoom, which means all the loading, unloading and drawing of that
// class can be used. We call super() to call the super class's function as needed
class InstructionsScreen extends PNGRoom {
  // Constructor gets calle with the new keyword, when upon constructor for the adventure manager in preload()
  constructor() {
    super();    // call super-class constructor to initialize variables in PNGRoom

    this.textBoxWidth = (width/6)*4;
    this.textBoxHeight = (height/6)*4; 

    // hard-coded, but this could be loaded from a file if we wanted to be more elegant
    this.instructionsText = "I am now alone, I have to keeping alive here.";
  }

  // call the PNGRoom superclass's draw function to draw the background image
  // and draw our instructions on top of this
    draw() {
      // tint down background image so text is more readable
      tint(128);
      
      // this calls PNGRoom.draw()
      super.draw();
      
      // text draw settings
      fill(255);
      textAlign(CENTER);
      textSize(30);

      // Draw text in a box
      text(this.instructionsText, width/6, height/6, this.textBoxWidth, this.textBoxHeight );
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
      this.drawX = width * 3/4;
      this.drawY = height * 3/4;

      // load the animation just one time
      this.weirdNPCSprite = createSprite( this.drawX, this.drawY, 100, 100);
      this.weirdNPCSprite.addAnimation('regular',  loadAnimation('assets/NPCs/pigmovement1.png', 'assets/NPCs/pigmovement2.png'));
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
      print("unloading AHA room");
    }

   // pass draw function to superclass, then draw sprites, then check for overlap
  draw() {
    // PNG room draw
    super.draw();

    // draws all the sprites in the group
    //this.weirdNPCSprite.draw();
    drawSprite(this.weirdNPCSprite)
    // draws all the sprites in the group - 
    //drawSprites(this.weirdNPCgroup);//.draw();

    // checks for overlap with ANY sprite in the group, if this happens
    // talk() function gets called
    playerSprite.overlap(this.weirdNPCSprite, talkToWeirdy );

     
    if( this.talkBubble !== null && talkedToPiggy === true ) {
      image(this.talkBubble, this.drawX + 60, this.drawY - 350);
    }
  }
}