// the functions associated with preload, create and update.
var actions = { preload: preload, create: create, update: update };
// the Game object used by the phaser.io library
var game = new Phaser.Game(790, 400, Phaser.AUTO, "game", actions);
// Global score variable initialised to 0.
var score = 0;
// Global variable to hold the text displaying the score.
var labelScore;
// Global player variable declared but not initialised.
var player;
// Global pipes variable initialised to the empty array.
var pipes = [];
// the interval (in seconds) at which new pipe columns are spawned
var pipeInterval = 1.75;
var track;
var stars = [];
var background;

//jQuery("#fullName").on("keyup", function(event_details) {
//    console.log($("#fullName").val());
//});

$("#greeting-form").on("submit", function(event_details) {
    var greeting = "Hello ";
    var name = $("#fullName").val();
    var score = $("#score").val();
    var greeting_message = greeting + name + " " + score;
    $("#greeting-form").fadeOut(500);
    $("#greeting").append("<p>" + greeting_message + "</p>");
    $("#greeting").delay(2000);
    $("#greeting").fadeOut(1000);
    //game.state.restart(); Don't use otherwise redirected to "success" page
    //$("#greeting").append("<p>" + greeting_message + "</p>");
    $.post("/score", {
        "fullName": name,
        "score": score
    }, function(){
        refreshScores();
    });
    event_details.preventDefault();
});

// Loads all resources for the game and gives them names.
function preload() {
    // make image file available to game and associate with alias playerImg
    game.load.image("playerImg","../assets/Falcon.gif");
    // make sound file available to game and associate with alias score
    game.load.audio("score", "../assets/point.ogg");
    // make image file available to game and associate with alias pipe
    game.load.image("pipe","../assets/GEmpire.png");
    // make backgrond image file available to game and associate with alias backgroundImg
    game.load.image("backgroundImg", "../assets/Deathstar.gif");
    game.load.audio("soundtrack", "../assets/Starwars.mp3");
    game.load.image("splashDisplayImg", "../assets/Gamestart.gif");
    game.load.image("star","../assets/star.png");
    game.load.image("go","../assets/Gameover.png");
}

function create() {
    game.started = false;

    var splashDisplay = game.add.image(0, 0, "splashDisplayImg");
    splashDisplay.width = 790;
    splashDisplay.height = 400;

    game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onDown.add(start);
}

function start() {

    if (game.started) {
        return;
    }

    game.started = true;

    //background image creation


    background = game.add.image(0, 0, "backgroundImg");
    background.width = 790;
    background.height = 400;
    // set the background colour of the scene(if you have a background image, color won't be seen)
    game.stage.setBackgroundColor("#F3D3A3");
    // add welcome text

    // game.add.text(20, 20, "Flappy Doge",
    //{font: "30px Arial", fill: "#FFFFFF"});
    // add score text
    labelScore = game.add.text(20, 20, "0",
        {font: "30px Arial", fill: "#FFFFFF"});
    // initialise the player and associate it with playerImg
    player = game.add.sprite(80, 200, "playerImg");
    // Start the ARCADE physics engine.
    // ARCADE is the most basic physics engine in Phaser.
    game.physics.startSystem(Phaser.Physics.ARCADE);
    // enable physics for the player sprite
    game.physics.arcade.enable(player);
    // set the player's gravity
    player.body.gravity.y = 400;
    // associate spacebar with jump function
    game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onDown.add(playerJump);
    game.input.keyboard.addKey(Phaser.Keyboard.P).onDown.add(pause);
    game.input.keyboard.addKey(Phaser.Keyboard.U).onDown.add(unPause);
    // time loop for game to update
    game.time.events.loop(pipeInterval * Phaser.Timer.SECOND, generatePipe);
    track = game.sound.play("soundtrack");
    player.anchor.setTo(0.5, 0.5);
}

function pause() {
    game.paused = true;
}

function unPause() {
    game.paused = false;
}

// This function updates the scene. It is called for every new frame.
function update() {


    if (player == undefined) {
        return;
    }

    if(player.body.y < 0 || player.body.y > 400){
        gameOver();
    }
    // Call gameOver function when player overlaps with any pipe


    for(var i=stars.length - 1; i>=0; i--){
        game.physics.arcade.overlap(player,stars[i], function(){
            stars[i].destroy();
            stars.splice(i,1);
            changeScore();
        });
    }

    game.physics.arcade
        .overlap(player,
        pipes,
        gameOver);

    if (game.input.mouse.button == 0) {
        playerJump();
    }

    player.rotation = Math.atan(player.body.velocity.y / 1500);
}

// Adds a pipe part to the pipes array
function addPipeBlock(x, y) {
    // make a new pipe block
    var block = game.add.sprite(x,y,"pipe");
    // insert it in the pipe array
    pipes.push(block);
    // enable physics engine for the block
    game.physics.arcade.enable(block);
    // set the block's horizontal velocity to a negative value
    // (negative x value for velocity means movement will be towards left)
    block.body.velocity.x = -200;
}

function addStar(x, y) {
    // make a new pipe block
    var block = game.add.sprite(x,y,"star");
    block.scale.x = 0.001;
    block.scale.y = 1.5;
    //block.transparent = false;
    // insert it in the pipe array
    stars.push(block);
    // enable physics engine for the block
    game.physics.arcade.enable(block);
    // set the block's horizontal velocity to a negative value
    // (negative x value for velocity means movement will be towards left)
    block.body.velocity.x = -200;
    block.alpha = 1.0;
}

// Generate moving pipe
function generatePipe() {
    // Generate  random integer between 1 and 5. This is the location of the
    // start point of the gap.
    var gapStart = game.rnd.integerInRange(1, 5);
    // Loop 8 times (8 is the height of the canvas).
    for (var count = 0; count < 8; count++) {
        // If the value of count is not equal to the gap start point
        // or end point, add the pipe image.
        if(count != gapStart && count != gapStart+1){
            addPipeBlock(750, count * 50);
        }
    }
    // Increment the score each time a new pipe is generated.
    addStar(750,(gapStart * 50) + 25);
}

function playerJump() {
    // the more negative the value the higher it jumps
    player.body.velocity.y = -200;
}

// Function to change the score
function changeScore() {
    //increments global score variable by 1
    score++;
    // updates the score label
    labelScore.setText(score.toString());
}

function gameOver() {
    // stop the game (update() function no longer called)
    //game.destroy();
    //background.hide();
    var background2 = game.add.image(0, 0, "go");
    background2.width = 790;
    background2.height = 400;

    $("#score").val(score.toString());
    game.paused = true;
    $("#greeting").show();
    track.stop();
    //game.state.restart();
    stars = [];
    //game.input.keyboard.addKey(Phaser.Keyboard.ENTER).onDown.add(function() {
    //    create();
    //});
}

function refreshScores() {
    $("#scoreBoard").empty();
    $.get("/score", function (scores) {
        scores.sort(function (scoreA, scoreB) {
            var difference = scoreB.score - scoreA.score;
            return difference;
        });
        for (var i = 0; i < scores.length && i < 10; i++) {
            $("#scoreBoard").append(
                "<li>" +
                scores[i].name + ": " + scores[i].score +
                "</li>");
        }
        //$("#scoreBoard").append(
        //    "<li>" +
        //    scores[0].name + ": " + scores[0].score +
        //    "</li>");
    });
}
refreshScores();

if(isEmpty(fullName)) {
    response.send("Please make sure you enter your name.");
}

function isEmpty(str) {
    return (!str || 0 === str.length);
}