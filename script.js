
// get distance bewtween two 2D coords
function get2dDistance(x1, y1, x2, y2) {
    return Math.sqrt((x2-x1)**2 + (y2-y1)**2);
};

//get speed
function getSpeed(distance, time) {
    return distance / time;
};

// get sum of array of numbers
function sumArr(arr) {
    let sum = 0;
    arr.forEach( (num) => {
        sum += num
    });
    return sum
};

// get mean of array of numbers
function getMean(arr) {
    return sumArr(arr) / arr.length
}

///////////////////////////

//class for playing audio controlled by an abitrary level value
class LevelControlAudio {
    constructor(src) { //, loopStart, loopEnd
        this.sound = new Audio(src);    // a new Audio element is created with the src
        this.sound.loop = true;         // set audio to loop
        //this.loopStart = 5;

        this.timeout = 2;
        this.lastStopTime;
    };

    start() {
        if (this.sound.paused) {
            if (!this.lastStopTime) {
                this.lastStopTime = Date.now()      // set last stop time to current time if it hasn't been set yet
            } else if ((Date.now() - this.lastStopTime)/1000 > this.timeout) {
                this.sound.currentTime = 0;         // play audio from begining if it's been longer than `timeout` seconds since it was last playing
            };
            this.sound.play();                      // play audio if it is puased
        };
    };

    stop() {
        this.sound.pause(); 
        this.lastStopTime = Date.now();
    };

    setIntensity(intensity) {   // intensity should be int between 1-100
        this.sound.volume = ((0.75 / 100) * intensity) + 0.25;          // modulate from 25% to 100% volume (0.25 - 1)
        //this.sound.playbackRate = ((0.75 / 100) * intensity) + 0.75;    // creates a scale from 0.75 to 1.5 speed
    };

    // this is the main method for controlling the audio with any sort of level value (between 0 - 100)
    levelControl(level) {
        if (level > 100) {level = 100};             // cap off level value at max of 100
        this.setIntensity(level)                    // set audio intensity based on level
        if (level > 0) {
            this.start();                           // start audio if level is 1 or higher   
        } else {
            this.stop();                            // otherwise stop it
        };
        return level
    };

};

/////////////////////////////////////////////////////////////////////////////////

// new level controllable audio object
var audio = new LevelControlAudio("goat_scream.ogg");

// converts mouse speed into audio control level
function MouseSpeedToLevel(speed) {
    let level = Math.round(100 / 7) * speed     // get initial intensity level (anything above 7px/s is over 100)
    return audio.levelControl(level)            // set audio intensity using mouse speed (and return level)

                // properties fro intensity smoothing
        //this.pastIntensity = [];
        //this.smoothing = 25;
        /*
        let len = this.pastIntensity.push(level);                   // add newest level to array
        if (len > this.smoothing) {this.pastIntensity.shift()};     // set max length to smoothingLevel (remove oldest level)
        let smoothedIntensity = getMean(this.pastIntensity);        // get smoothed intensity value by averaging it with the last few
        */
};

///////////////////////////
// FOR TEST DISPLAY ONLY

// HTML elements
const speedText = document.querySelector(".speed");
const intensityText = document.querySelector(".intensity");
const intensitySlider = document.querySelector(".intensity-slider");

//display mouse speed and intensity
function displayVals(speed, level) {
    speedText.textContent = speed;
    intensityText.textContent = level;
    intensitySlider.value = level;
};

///////////////////////////

// stuff for mouse event listener function
var prevMousePos = {x:0 , y:0};
var prevTime, moveTimer;

// listener for mouse movement
window.addEventListener("mousemove", function(event) {
    //get current time and mouse position
    let time = Date.now();
    if (!prevTime) {prevTime = time};       // set previous time value to current time if it hasn't been set yet
    let mousePos = {x: event.clientX, y: event.clientY};

    // determine mouse distance, then speed
    let speed = getSpeed(get2dDistance(prevMousePos.x, prevMousePos.y, mousePos.x, mousePos.y), time - prevTime)
    let level = MouseSpeedToLevel(speed);   // turn mouse speed into audio control
    displayVals(speed, level);              // display speed and audio control level

    //set previous values to be current ones, to be used on the next call
    prevMousePos.x = mousePos.x;
    prevMousePos.y = mousePos.y;
    prevTime = time;

    clearTimeout(moveTimer);
    // set speed/level to 0 if mouse doesn't move within 50ms
    moveTimer = setTimeout(function() {
        MouseSpeedToLevel(0)
        displayVals(0, 0)
    }, 50);
});
