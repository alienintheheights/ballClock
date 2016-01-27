/**

Problem Statement:

CLOCK

Tempus et mobilius
Time and motion

Tempus est mensura motus rerum mobilium.
Time is the measure of movement.
-- Auctoritates Aristotelis

...and movement has long been used to measure time. For example, the ball clock is a simple device which keeps track of the passing minutes by moving ball-bearings. Each minute, a rotating arm removes a ball bearing from the queue at the bottom, raises it to the top of the clock and deposits it on a track leading to indicators displaying minutes, five-minutes and hours. These indicators display the time between 1:00 and 12:59, but without 'a.m.' or 'p.m.' indicators. Thus 2 balls in the minute indicator, 6 balls in the five-minute indicator and 5 balls in the hour indicator displays the time 5:32.

Unfortunately, most commercially available ball clocks do not incorporate a date indication, although this would be simple to do with the addition of further carry and indicator tracks. However, all is not lost! As the balls migrate through the mechanism of the clock, they change their relative ordering in a predictable way. Careful study of these orderings will therefore yield the time elapsed since the clock had some specific ordering. The length of time which can be measured is limited because the orderings of the balls eventually begin to repeat. Your program must compute the time before repetition, which varies according to the total number of balls present.

Operation of the Ball Clock

Every minute, the least recently used ball is removed from the queue of balls at the bottom of the clock, elevated, then deposited on the minute indicator track, which is able to hold four balls. When a fifth ball rolls on to the minute indicator track, its weight causes the track to tilt. The four balls already on the track run back down to join the queue of balls waiting at the bottom in reverse order of their original addition to the minutes track. The fifth ball, which caused the tilt, rolls on down to the five-minute indicator track. This track holds eleven balls. The twelfth ball carried over from the minutes causes the five-minute track to tilt, returning the eleven balls to the queue, again in reverse order of their addition. The twelfth ball rolls down to the hour indicator. The hour indicator also holds eleven balls, but has one extra fixed ball which is always present so that counting the balls in the hour indicator will yield an hour in the range one to twelve. The twelfth ball carried over from the five-minute indicator causes the hour indicator to tilt, returning the eleven free balls to the queue, in reverse order, before the twelfth ball itself also returns to the queue.

Input

The input defines a succession of ball clocks. Each clock operates as described above. The clocks differ only in the number of balls present in the queue at one o'clock when all the clocks start. This number is given for each clock, one per line and does not include the fixed ball on the hours indicator. Valid numbers are in the range 27 to 127. A zero signifies the end of input.

Output

For each clock described in the input, your program should report the number of balls given in the input and the number of days (24-hour periods) which elapse before the clock returns to its initial ordering.

Sample Input

30
45
0

Output for the Sample Input

30 balls cycle after 15 days.
45 balls cycle after 378 days.
**/

/*
*   Balls in queue simulator for the Clock Ball challenge:
*   
*   Usage: new ballClock.Simulator([SIZE1, SIZE2]);
*
* @author Andrew Lienhard
* @date Jan 26, 2016
**/

/**
* @namespace ballClock
**/
var ballClock = ballClock || {};

/** Set to true to enable console.log messages **/
ballClock.DEBUG = true;

/**
* Simple console debug mode logger.
*/
ballClock.log = function(msg) {
    if (ballClock.DEBUG) {
        console.log(msg);
    }
}

/**************************************************************************************/
// TrayQueue: has an array, a name, and a max size.
/**************************************************************************************/

/**
* @class Tray Queue Class.
**/
ballClock.TrayQueue = function (size, name) {
    this.items = [];
    this.size = size;
    this.name = name;
}

/**
* Push function to items to the end of queue.
**/
ballClock.TrayQueue.prototype.push = function(ball) {
    if (this.items.length >= this.size) {
        return -1;
    }
    return this.items.push(ball);
}

ballClock.TrayQueue.prototype.next = function() {
    return this.items.shift(); // remove first element
}

ballClock.TrayQueue.prototype.last = function() {
    return this.items.pop(); // remove last element
}

ballClock.TrayQueue.prototype.print = function() {
    ballClock.log(this.name +  ":"  + this.items);
};

/**************************************************************************************/
// BottomTrayQueue extends TrayQueue, 
/**************************************************************************************/


/**
* @class Bottom tray queue inherits from TrayQueue.
**/
ballClock.BottomTrayQueue = function(size) {
    ballClock.TrayQueue.call(this, size, "Bottom Tray");
    // Initialize bottom queue
    // [0]=1, [1]=2 ,..., [n-1]=n
    for (var i=1; i<=size; i++) {
        this.push(i);
    }
}
ballClock.BottomTrayQueue.prototype = Object.create(ballClock.TrayQueue.prototype); 
ballClock.BottomTrayQueue.prototype.constructor = ballClock.BottomTrayQueue;

/**
* Verification step for bottom tray. Checks order.
*/
ballClock.BottomTrayQueue.prototype.checkOrder = function() {
    for (var i=0; i<this.size; i++) {
        if (this.items[i] != i + 1) { // [0]=1, [1]=2, etc.
            return false; // bail: it's out of order.
        }
    }
    return true;
};

/**************************************************************************************/
// Clock, has TrayQueues
/**************************************************************************************/

/**
* @class Clock
*/

// Bound values for Clock sizing
ballClock.Clock.MIN_SIZE = 27;
ballClock.Clock.MAX_SIZE = 217;

ballClock.Clock = function(size) {
    //console.log("Initializing a ball clock of size " + size);
    if (size <= ballClock.Clock.MIN_SIZE || size >= ballClock.Clock.MAX_SIZE)  {
        console.log("Clock out of range " + size);
        return;
    }
    this.size = size;
    // init trays
    this.bottomTray = new ballClock.BottomTrayQueue(size);
    this.oneMinuteQueue = new ballClock.TrayQueue(4, "One Minute Tray");
    this.fiveMinuteQueue = new ballClock.TrayQueue(11, "Five Minute Tray");
    this.oneHourQueue = new ballClock.TrayQueue(11, "Hour Tray");
};


/**
* Take given queue and dump it into the ball queue in reverse order.
* @param tray, the current TrayQueue
*/
ballClock.Clock.prototype.drop = function(tray) {
    // work from n-1 to 0 to dump in reverse order
     for (var i=0; i<tray.size; i++) {
        this.bottomTray.push(tray.last());
    }
    
};

/**
* Prints the state of the trays of the clock.
*/
ballClock.Clock.prototype.print = function() {
    ballClock.log("-----");
    this.oneMinuteQueue.print();
    this.fiveMinuteQueue.print();
    this.oneHourQueue.print();
    this.bottomTray.print();
    ballClock.log("------");
};

/** Static MAX_STEPS value. **/
ballClock.Clock.MAX_STEPS = 600000;

/**
* Runs the simulation for the clock.
* Main logic for clock runs.
*/
ballClock.Clock.prototype.runSimulation = function() {
    
    var isComplete = false;
    var minutes = 1; // track minutes.
    while(!isComplete && minutes < ballClock.Clock.MAX_STEPS) {

        var nextBall = this.bottomTray.next();
        // add a minute ball, if full, dump tray and place new ball on five minute tray instead
        if (this.oneMinuteQueue.push(nextBall) === -1) {
            this.drop(this.oneMinuteQueue);
            // add a five minute ball, if full, dump tray and place new ball on hour tray instead
            if (this.fiveMinuteQueue.push(nextBall) === -1) {
                this.drop(this.fiveMinuteQueue);
                // add an hour  ball, if full, dump tray and start over
                if (this.oneHourQueue.push(nextBall) === -1) {
                    this.drop(this.oneHourQueue);
                    this.bottomTray.push(nextBall); // reset
                }
            }
        }
        // validate current iteration
        isComplete = this.bottomTray.checkOrder();
        if (isComplete) {
            var days = minutes/(24*60);
            // display tray if in DEBUG mode
            this.bottomTray.print(); 
            // write output
            console.log(this.size + " balls cycle after " + days + " days.");
        }
        minutes++;
    }
};

/**************************************************************************************/
// Simulator
/**************************************************************************************/

/**
* The Simulator Class.
* Usage: new ballClock.Simulator([30], 21700);
*/
ballClock.Simulator = function(queueSizes, maxSteps) {

    for (var i=0; i < queueSizes.length; i++) {
        var clock = new ballClock.Clock(queueSizes[i]);
        ballClock.log("Running clock of size " + queueSizes[i]);
        clock.runSimulation(maxSteps);
    }
};

// RUN!
new ballClock.Simulator([30, 45]);
