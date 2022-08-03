/**
* @desc Ball Clock simulator.
*   
*   Usage: new ballClock.Simulator([SIZE1, SIZE2, ..., SIZEN]);
*
* @author Andrew Lienhard
* @date Jan 26, 2016
*/

/**
* @namespace ballClock
*/
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
* @constructor
*/
ballClock.TrayQueue = function (size, name) {
    this.items = [];
    this.size = size;
    this.name = name;
}

/**
* @desc push() is a wrapper for the underlying function to push an element to the back of the array.
*/
ballClock.TrayQueue.prototype.push = function(ball) {
    if (this.items.length >= this.size) {
        return -1;
    }
    return this.items.push(ball);
}

/**
* @desc next() is a wrapper for the underlying array operation.
* destructive: removes first element from array.
*/
ballClock.TrayQueue.prototype.next = function() {
    return this.items.shift(); // remove first element
}

/**
* @desc last() is a wrapper for the underlying array operation.
* destructive: removes last element from array.
*/
ballClock.TrayQueue.prototype.last = function() {
    return this.items.pop(); // remove last element
}

/**
* @desc print() displays array contents.
*/
ballClock.TrayQueue.prototype.print = function() {
    ballClock.log(this.name +  ":"  + this.items);
};

/**************************************************************************************/
// BottomTrayQueue extends TrayQueue, 
/**************************************************************************************/


/**
* @class Bottom tray queue inherits from TrayQueue.
* @constructor
*/
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
* @desc Verification step for bottom tray. Checks order.
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

/**
* @constructor for Clock
*/
ballClock.Clock = function(size) {
    if (size <= ballClock.Clock.MIN_SIZE || size >= ballClock.Clock.MAX_SIZE)  {
        console.log("Clock out of range " + size);
        return null;
    }
    this.size = size;
    // init trays
    this.bottomTray = new ballClock.BottomTrayQueue(size);
    this.oneMinuteQueue = new ballClock.TrayQueue(4, "One Minute Tray");
    this.fiveMinuteQueue = new ballClock.TrayQueue(11, "Five Minute Tray");
    this.oneHourQueue = new ballClock.TrayQueue(11, "Hour Tray");
};


// Bound values for Clock sizing
ballClock.Clock.MIN_SIZE = 27;
ballClock.Clock.MAX_SIZE = 217;

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
* @desc Prints the state of the trays of the clock.
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
* @desc Runs the simulation for the clock.
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
            return minutes;
        }
        minutes++;
    }
};

/**************************************************************************************/
// Simulator
/**************************************************************************************/

/**
* @desc The Simulator Class.
* Sample usage: new ballClock.Simulator([30, 45]);
* TODO: Add unit test.
*/
ballClock.Simulator = function(queueSizes, maxSteps) {
    // loop over queues
    for (var i=0; i < queueSizes.length; i++) {
        var clock = new ballClock.Clock(queueSizes[i]);
        if (clock) {
            ballClock.log("Running clock of size " + queueSizes[i]);
            clock.runSimulation(maxSteps);
        }
    }
};

// RUN!
new ballClock.Simulator([30, 45]);
