/**
 * The AVID Assistant is Copyright 2014 Exodus Games. The AVID and related iconography are Copyright 2004 Ad Astra Games, an imprint of Final Sword Productions, and are used with permission.
 */

/**
 * On refresh, some browsers preserve the state of the global AVID variable.
 * Force a reload by deleting any existing AVID variable.
 */
//if (AVID) {
//  delete AVID;
//}

var AVID = AVID||{};

/**
 * Convenience names for the axes.
 */
AVID.NOSE = "NOSE";
AVID.TAIL = "TAIL";
AVID.TOP = "TOP";
AVID.BOTTOM = "BOTTOM";
AVID.LEFT = "LEFT";
AVID.RIGHT = "RIGHT";

AVID.MID = "MID";

AVID.MIDNOSE = "MIDNOSE";
AVID.MIDTAIL = "MIDTAIL";
AVID.MIDTOP = "MIDTOP";
AVID.MIDBOTTOM = "MIDBOTTOM";
AVID.MIDLEFT = "MIDLEFT";
AVID.MIDRIGHT = "MIDRIGHT";

/**
 * Convenience names for the latitudes (rings) and degrees.  Too many choices for the green ring, but we'll manage.
 */
AVID.AMBER = "a00";
AVID.BLUE = "a30";
AVID.GREEN = "a60";
AVID.PURPLE = "a90";
AVID.BUMPER = "bum";

/**
 * Build a full set of windows from these two arrays.  The poles get special handling.
 */
AVID.latitudes = ["00", "30", "60"];
AVID.degrees = ["000", "030", "060", "090", "120", "150", "180", "210", "240", "270", "300", "330"];

AVID.POLE = "a90.pol";
AVID.POLE_NORTH = "a90.polup";
AVID.POLE_SOUTH = "a90.poldn";

AVID.OPACITY_CLEAR = "0";
AVID.OPACITY_FULL = "1";
AVID.OPACITY_BUMPER = "0.75";
AVID.OPACITY_TINY = "0.05";

AVID.SHRINK_ICON = "0 0 44 44";
AVID.TOO_BIG = 999999999;

AVID.PIVOT_AS_WRITTEN = "AS_WRITTEN";
AVID.PIVOT_NATURALLY = "NATURALLY";
AVID.pivotAdjustment = AVID.PIVOT_NATURALLY;

/**
 * Does the current sequence of mousedown/mouseup, or touchstart/touchend, already have an axis?
 * This variable is required for mouse movement, and the touch movement honors it.
 */
AVID.haveAxis = false;

/**
 * When the AVID div is loaded, force the AVID to resize to this fraction of the window width.
 */
AVID.avidSizeFactor = 0.95;

/**
 * SVG positions icons to their upper-left corner.  When rotating them, the center of the
 * icon must be specified to the translate() function as an offset.  We are using 33 x 33 icons.
 */
AVID.iconOffset = 16.5;

/**
 * Which direction does A point into?
 */
AVID.avidACoordinate = 0;

/**
 * The per-ship maneuvering limits.  These are user-settable.
 */
AVID.maxPivots = 6;
AVID.maxRolls = 6;

/**
 * If (movementModel === 2) then show a midpoint marker (looks like two pipe symbols (||)) icon for the ship.
 */
AVID.MOVEMENT_MODEL_0 = 0;
AVID.MOVEMENT_MODEL_1 = 1;
AVID.MOVEMENT_MODEL_2 = 2;
AVID.defaultMovementModel = AVID.MOVEMENT_MODEL_1;
AVID.movementModel = AVID.defaultMovementModel;

/**
 * Shoot bearings at what points?
 *
 * * SHOOT_BEARINGS_END_ONLY: Only an endpoint bearing is needed.  No midpoint axes are shown on the AVID.
 *   However, for movement model 2 a midpoint marker is shown based off of the pivots[] list.
 * * SHOOT_BEARINGS_MID_END: The user wants bearings from the endpoint and also off of a midpoint.
 *   The AVID shows the "current" and the "midpoint" sets of axes, no matter what the movement mode.
 *   This is needed by SITS players and when Squadron Strike is used in the optional "half move" mode.
 */
AVID.SHOOT_BEARINGS_END_ONLY = "SHOOT_BEARINGS_END_ONLY";
AVID.SHOOT_BEARINGS_MID_END = "SHOOT_BEARINGS_MID_END";
AVID.shootBearingsModel = AVID.SHOOT_BEARINGS_END_ONLY;

/**
 * Is the user pivoting or rolling?  Or done with the move (don't respond to touches)?  Decides the context of "target".
 */
AVID.PIVOT = "PIVOT";
AVID.ROLL = "ROLL";
AVID.DONE = "DONE";
AVID.avidMovementMode = AVID.PIVOT;

AVID.HELM = "HELM";
AVID.BEARING = "BEARING";
AVID.FISHBOWL = "FISHBOWL";
AVID.avidFunction = AVID.HELM;

/**
 * The AVID might be displayed to adjust things, rather than to perform a game move.
 * In this mode the game turn isn't incremented and there are no limits to the
 * number of pivots or rolls performed.
 */
AVID.isAdjustingShipOrientation = false;

/**
 * Was the last pointer movement to the bumper ring?
 */
AVID.wasBumper = false;
AVID.isBumperAllowed = true;

/**
 * Each pivot or roll stores the new axes object on the list.  Each axes object
 * contains these axis objects, each with attributes (windowId, isUpperHemisphere):
 * * NOSE
 * * TAIL
 * * TOP
 * * BOTTOM
 * * LEFT
 * * RIGHT
 *
 * The optional attribute "wasDiagonal" is applied to an axes object when that move was a diagonal move.
 *
 * "current" shows the intended end of pivoting and rolling.
 *
 * "pivots" is a history "current" values after pivoting.
 *
 * "rolls" is a history of rolling, based on the most recent pivot position.
 * If the user returns to pivoting all rolls are lost.
 *
 * "midpoint" is calculated when drawing the AVID.  Precalculating this would get
 * hairy, especially when changing the rolls.
 *
 * "pivotCrumbs" shows a list of windows the nose axis has been in.
 *
 * "rollCrumbs" shows a list of windows a non-nose, non-tail has been in.
 * If the user returns to pivoting all roll crumbs are lost.
 *
 * When swapping a new ship from the roster, all of these objects must be pointed at the selected ship.
 */
AVID.current;
AVID.pivots = [];
AVID.rolls = [];
AVID.midpoint;
AVID.pivotCrumbs = [];
AVID.rollCrumbs = [];

/**
 * The AVID can have two colors.
 */
AVID.hexagonColorRed = {fill: "#8b0304", stroke: "#ed1c24"};
AVID.hexagonColorBlue = {fill: "#004071", stroke: "#0071bc"};
AVID.hexagonColor = AVID.hexagonColorRed;

/**
 * Filled at startup with the original AVID client width.  Used when rotating the AVID.
 */
AVID.originalClientWidth;

/**
 * Icon base names.
 */
AVID.icons = [];
AVID.icons[AVID.NOSE] = "iconNose";
AVID.icons[AVID.TAIL] = "iconTail";
AVID.icons[AVID.TOP] = "iconTop";
AVID.icons[AVID.BOTTOM] = "iconBottom";
AVID.icons[AVID.LEFT] = "iconLeft";
AVID.icons[AVID.RIGHT] = "iconRight";

AVID.icons[AVID.MID] = "iconMid";

AVID.icons[AVID.MIDNOSE] = "iconMidNose";
AVID.icons[AVID.MIDTAIL] = "iconMidTail";
AVID.icons[AVID.MIDTOP] = "iconMidTop";
AVID.icons[AVID.MIDBOTTOM] = "iconMidBottom";
AVID.icons[AVID.MIDLEFT] = "iconMidLeft";
AVID.icons[AVID.MIDRIGHT] = "iconMidRight";

/**
 * The windows[] list takes care of:
 * * The center of each AVID window, through (x, y).  The poles are special cases because two icons must share the window.
 *   For that the nominal window is "a90.pol" and the actual icon locations are "a90.polup" (upper-hemisphere) and
 *   "a90.poldn" (lower-hemisphere).  Remember to shrink the icon (through viewBox) to make the lower icon fit.
 * * The neighbors of each window.  This is used to decide where the nose can go next.
 *
 * The green band windows with "odd" locations (such as "a60.030") are boundaries between green windows.  They will be
 * used because when a non-nose axis is in the blue ring another axis will be in the green ring, possibly between windows.
 * The "neighbors" values for these windows must be only those green band windows that the spine touches.  For example,
 * don't expect to navigate from the spine to a pole or blue band window.
 *
 * Each window (never the boundary locations) needs to know its neighbors, either with shared boundaries or kitty-corner.
 * The neighbors are used when the pointer is plopped onto the AVID.  The arrays help answer the question "is the pointer
 * adjacent to the nose window?".
 *
 * These windows all assume the user touches the AVID from one hemisphere at a time.  Switching between hemispheres
 * occurs through the bumper ring.  This means that the individual window IDs need not be concerned with "isUpperHemisphere".
 *
 * These windows use an "a" prefix for "AVID use".
 */
AVID.windows = [];
AVID.windows["a00.000"] = {x: "143", y: "26.5", neighbors: ["a00.330", "a00.030", "a30.330", "a30.000", "a30.030"]};
AVID.windows["a00.030"] = {x: "200.5", y: "42", neighbors: ["a00.000", "a00.060", "a30.000", "a30.030", "a30.060"]};
AVID.windows["a00.060"] = {x: "243", y: "84", neighbors: ["a00.030", "a00.090", "a30.030", "a30.060", "a30.090"]};
AVID.windows["a00.090"] = {x: "258.5", y: "142.5", neighbors: ["a00.060", "a00.120", "a30.060", "a30.090", "a30.120"]};
AVID.windows["a00.120"] = {x: "243", y: "201", neighbors: ["a00.090", "a00.150", "a30.090", "a30.120", "a30.150"]};
AVID.windows["a00.150"] = {x: "200.5", y: "242.5", neighbors: ["a00.120", "a00.180", "a30.120", "a30.150", "a30.180"]};
AVID.windows["a00.180"] = {x: "143", y: "258", neighbors: ["a00.150", "a00.210", "a30.150", "a30.180", "a30.210"]};
AVID.windows["a00.210"] = {x: "84.5", y: "242.5", neighbors: ["a00.180", "a00.240", "a30.180", "a30.210", "a30.240"]};
AVID.windows["a00.240"] = {x: "44", y: "201", neighbors: ["a00.210", "a00.270", "a30.210", "a30.240", "a30.270"]};
AVID.windows["a00.270"] = {x: "27.5", y: "142.5", neighbors: ["a00.240", "a00.300", "a30.240", "a30.270", "a30.300"]};
AVID.windows["a00.300"] = {x: "44", y: "84", neighbors: ["a00.270", "a00.330", "a30.270", "a30.300", "a30.330"]};
AVID.windows["a00.330"] = {x: "84.5", y: "42", neighbors: ["a00.300", "a00.000", "a30.300", "a30.330", "a30.000"]};

AVID.windows["a30.000"] = {
  x        : "143",
  y        : "65",
  neighbors: ["a00.330", "a00.000", "a00.030", "a30.330", "a30.030", "a60.000"]
};
AVID.windows["a30.030"] = {
  x        : "181.5",
  y        : "75.5",
  neighbors: ["a00.000", "a00.030", "a00.060", "a30.000", "a30.060", "a60.000", "a60.060"]
};
AVID.windows["a30.060"] = {
  x        : "210",
  y        : "104",
  neighbors: ["a00.030", "a00.060", "a00.090", "a30.030", "a30.090", "a60.060"]
};
AVID.windows["a30.090"] = {
  x        : "220.5",
  y        : "142.5",
  neighbors: ["a00.060", "a00.090", "a00.120", "a30.060", "a30.120", "a60.060", "a60.120"]
};
AVID.windows["a30.120"] = {
  x        : "210",
  y        : "181",
  neighbors: ["a00.090", "a00.120", "a00.150", "a30.090", "a30.150", "a60.120"]
};
AVID.windows["a30.150"] = {
  x        : "181.5",
  y        : "209",
  neighbors: ["a00.120", "a00.150", "a00.180", "a30.120", "a30.180", "a60.120", "a60.180"]
};
AVID.windows["a30.180"] = {
  x        : "143",
  y        : "219.5",
  neighbors: ["a00.150", "a00.180", "a00.210", "a30.150", "a30.210", "a60.180"]
};
AVID.windows["a30.210"] = {
  x        : "104.5",
  y        : "209",
  neighbors: ["a00.180", "a00.210", "a00.240", "a30.180", "a30.240", "a60.180", "a60.240"]
};
AVID.windows["a30.240"] = {
  x        : "76",
  y        : "181",
  neighbors: ["a00.210", "a00.240", "a00.270", "a30.210", "a30.270", "a60.240"]
};
AVID.windows["a30.270"] = {
  x        : "65.5",
  y        : "142.5",
  neighbors: ["a00.240", "a00.270", "a00.300", "a30.240", "a30.300", "a60.240", "a60.300"]
};
AVID.windows["a30.300"] = {
  x        : "76",
  y        : "104",
  neighbors: ["a00.270", "a00.300", "a00.330", "a30.270", "a30.330", "a60.300"]
};
AVID.windows["a30.330"] = {
  x        : "104.5",
  y        : "75.5",
  neighbors: ["a00.300", "a00.330", "a00.000", "a30.300", "a30.000", "a60.300", "a60.000"]
};

AVID.windows["a60.000"] = {
  x        : "143",
  y        : "101",
  neighbors: ["a30.330", "a30.000", "a30.030", "a60.300", "a60.060", "a90.pol"]
};
AVID.windows["a60.030"] = {x: "164", y: "106.5", neighbors: ["a90.pol", "a60.000", "a60.060", "a30.030"]};
AVID.windows["a60.060"] = {
  x        : "179",
  y        : "122",
  neighbors: ["a30.030", "a30.060", "a30.090", "a60.000", "a60.120", "a90.pol"]
};
AVID.windows["a60.090"] = {x: "184.5", y: "142.5", neighbors: ["a90.pol", "a60.060", "a60.120", "a30.090"]};
AVID.windows["a60.120"] = {
  x        : "179",
  y        : "163",
  neighbors: ["a30.090", "a30.120", "a30.150", "a60.060", "a60.180", "a90.pol"]
};
AVID.windows["a60.150"] = {x: "164", y: "178.5", neighbors: ["a90.pol", "a60.120", "a60.180", "a30.150"]};
AVID.windows["a60.180"] = {
  x        : "143",
  y        : "183.5",
  neighbors: ["a30.150", "a30.180", "a30.210", "a60.120", "a60.240", "a90.pol"]
};
AVID.windows["a60.210"] = {x: "122", y: "178.5", neighbors: ["a90.pol", "a60.180", "a60.240", "a30.210"]};
AVID.windows["a60.240"] = {
  x        : "107",
  y        : "163",
  neighbors: ["a30.210", "a30.240", "a30.270", "a60.180", "a60.300", "a90.pol"]
};
AVID.windows["a60.270"] = {x: "101.5", y: "142.5", neighbors: ["a90.pol", "a60.240", "a60.300", "a30.270"]};
AVID.windows["a60.300"] = {
  x        : "107",
  y        : "122",
  neighbors: ["a30.270", "a30.300", "a30.330", "a60.240", "a60.000", "a90.pol"]
};
AVID.windows["a60.330"] = {x: "122", y: "106.5", neighbors: ["a90.pol", "a60.300", "a60.000", "a30.330"]};

AVID.windows["a90.pol"] = {
  x        : "143",
  y        : "142.5",
  neighbors: ["a60.000", "a60.060", "a60.120", "a60.180", "a60.240", "a60.300"]
};
AVID.windows["a90.polup"] = {x: "136", y: "134.5"};
AVID.windows["a90.poldn"] = {x: "157", y: "155.5"};

/**
 * Great circle routes for the AVID.
 * Although the AVID has 50 windows, there are only six distinct great circle routes.
 * All of the windows can be translated or rotated to fit one of these.
 */
AVID.greatCircle = [];
AVID.greatCircle["a90.pol"] = [{windowId: "a00.330", isUpperHemisphere: true}, {
  windowId         : "a00.300",
  isUpperHemisphere: true
}, {windowId: "a00.270", isUpperHemisphere: true}, {windowId: "a00.240", isUpperHemisphere: true}, {
  windowId         : "a00.210",
  isUpperHemisphere: true
}, {windowId: "a00.180", isUpperHemisphere: true}, {windowId: "a00.150", isUpperHemisphere: true}, {
  windowId         : "a00.120",
  isUpperHemisphere: true
}, {windowId: "a00.090", isUpperHemisphere: true}, {windowId: "a00.060", isUpperHemisphere: true}, {
  windowId         : "a00.030",
  isUpperHemisphere: true
}, {windowId: "a00.000", isUpperHemisphere: true}];
AVID.greatCircle["a00.000"] = [{windowId: "a90.pol", isUpperHemisphere: true}, {
  windowId         : "a60.090",
  isUpperHemisphere: true
}, {windowId: "a30.090", isUpperHemisphere: true}, {windowId: "a00.090", isUpperHemisphere: true}, {
  windowId         : "a30.090",
  isUpperHemisphere: false
}, {windowId: "a60.090", isUpperHemisphere: false}, {
  windowId         : "a90.pol",
  isUpperHemisphere: false
}, {windowId: "a60.270", isUpperHemisphere: false}, {
  windowId         : "a30.270",
  isUpperHemisphere: false
}, {windowId: "a00.270", isUpperHemisphere: true}, {windowId: "a30.270", isUpperHemisphere: true}, {
  windowId         : "a60.270",
  isUpperHemisphere: true
}];
AVID.greatCircle["a30.000"] = [{windowId: "a60.180", isUpperHemisphere: true}, {
  windowId         : "a60.120",
  isUpperHemisphere: true
}, {windowId: "a30.090", isUpperHemisphere: true}, {windowId: "a00.090", isUpperHemisphere: true}, {
  windowId         : "a30.090",
  isUpperHemisphere: false
}, {windowId: "a60.060", isUpperHemisphere: false}, {
  windowId         : "a60.000",
  isUpperHemisphere: false
}, {windowId: "a60.300", isUpperHemisphere: false}, {
  windowId         : "a30.270",
  isUpperHemisphere: false
}, {windowId: "a00.270", isUpperHemisphere: true}, {windowId: "a30.270", isUpperHemisphere: true}, {
  windowId         : "a60.240",
  isUpperHemisphere: true
}];
AVID.greatCircle["a60.000"] = [{windowId: "a30.180", isUpperHemisphere: true}, {
  windowId         : "a30.150",
  isUpperHemisphere: true
}, {windowId: "a30.120", isUpperHemisphere: true}, {windowId: "a00.090", isUpperHemisphere: true}, {
  windowId         : "a30.060",
  isUpperHemisphere: false
}, {windowId: "a30.030", isUpperHemisphere: false}, {
  windowId         : "a30.000",
  isUpperHemisphere: false
}, {windowId: "a30.330", isUpperHemisphere: false}, {
  windowId         : "a30.300",
  isUpperHemisphere: false
}, {windowId: "a00.270", isUpperHemisphere: true}, {windowId: "a30.240", isUpperHemisphere: true}, {
  windowId         : "a30.210",
  isUpperHemisphere: true
}];
AVID.greatCircle["a00.030"] = [{windowId: "a90.pol", isUpperHemisphere: true}, {
  windowId         : "a60.120",
  isUpperHemisphere: true
}, {windowId: "a30.120", isUpperHemisphere: true}, {windowId: "a00.120", isUpperHemisphere: true}, {
  windowId         : "a30.120",
  isUpperHemisphere: false
}, {windowId: "a60.120", isUpperHemisphere: false}, {
  windowId         : "a90.pol",
  isUpperHemisphere: false
}, {windowId: "a60.300", isUpperHemisphere: false}, {
  windowId         : "a30.300",
  isUpperHemisphere: false
}, {windowId: "a00.300", isUpperHemisphere: true}, {windowId: "a30.300", isUpperHemisphere: true}, {
  windowId         : "a60.300",
  isUpperHemisphere: true
}];
AVID.greatCircle["a30.030"] = [{windowId: "a60.210", isUpperHemisphere: true}, {
  windowId         : "a60.150",
  isUpperHemisphere: true
}, {windowId: "a30.120", isUpperHemisphere: true}, {windowId: "a00.120", isUpperHemisphere: true}, {
  windowId         : "a30.120",
  isUpperHemisphere: false
}, {windowId: "a60.090", isUpperHemisphere: false}, {
  windowId         : "a60.030",
  isUpperHemisphere: false
}, {windowId: "a60.330", isUpperHemisphere: false}, {
  windowId         : "a30.300",
  isUpperHemisphere: false
}, {windowId: "a00.300", isUpperHemisphere: true}, {windowId: "a30.300", isUpperHemisphere: true}, {
  windowId         : "a60.270",
  isUpperHemisphere: true
}];

/**
 * Prospective moves are shown through a colored circle.
 * * Show an undo through a circle in the undo color.
 * * Show a move to a new position through a circle in the move color.
 */
AVID.moveColor = {fill: "#78f000", fillOpacity: "0.25", stroke: "#78f000", strokeOpacity: "0"};
AVID.undoColor = {fill: "#f96533", fillOpacity: "0.25", stroke: "#f96533", strokeOpacity: "0"};
AVID.currentColor = {fill: "#333333", fillOpacity: "0.10", stroke: "#a9b5c0", strokeOpacity: "0"};

/**
 * Colors for the "undo" button.
 */
AVID.undoColorFull = {fill: "#fcd7ca", stroke: "#aa0000"};
AVID.undoColorDim = {fill: "#fde3db", stroke: "#ff8080"};

/**
 * The opacities are used for showing and hiding bearing that coincide with a bearing icon.
 */
AVID.fullIconOpacity = 1;
AVID.dimIconOpacity = 0.20;

/**
 * Initial, neutral ship orientation.  Clone it at need.
 */
AVID.initialAxes = {};
AVID.initialAxes[AVID.NOSE] = {windowId: "a00.000", isUpperHemisphere: true};
AVID.initialAxes[AVID.TAIL] = {windowId: "a00.180", isUpperHemisphere: true};
AVID.initialAxes[AVID.TOP] = {windowId: "a90.pol", isUpperHemisphere: true};
AVID.initialAxes[AVID.BOTTOM] = {windowId: "a90.pol", isUpperHemisphere: false};
AVID.initialAxes[AVID.LEFT] = {windowId: "a00.270", isUpperHemisphere: true};
AVID.initialAxes[AVID.RIGHT] = {windowId: "a00.090", isUpperHemisphere: true};

/**
 * Handle "click" events going to the AVID element.
 */
AVID.click = function (evt) {

  /*
   * The mouse interface uses haveAxis to tell when the axis can move.
   * Without it the axis follows the mouse even without the mouse button down.
   *
   * A click event might be considered a tiny mousemove event, and manages its own haveAxis context.
   */
  AVID.haveAxis = true;
  AVID.moveShip(evt, true);
  AVID.haveAxis = false;
};

/**
 * Handle "mousedown" events going to the AVID element.
 *
 * When using the AVID with a mouse, need to capture a mousedown for
 * dragging the axis.  Otherwise, any movement of the mouse through
 * the AVID repositions the axis.
 *
 * Pass through other events.
 */
AVID.mouseDown = function (evt) {
  AVID.getAxis(evt);
};

/**
 * Handle a mouse move, really a drag, across the AVID.
 *
 * Other events are suppressed.
 * Note that this isn't a drag event, as no element is being pushed across the landscape.
 */
AVID.mouseMove = function (evt) {

  if (evt.preventDefault)
    evt.preventDefault();

  AVID.moveShip(evt);
};

/**
 * Handle "mouseUp" events going to the AVID element.
 *
 * Pass through other events.
 */
AVID.mouseUp = function (evt) {
  AVID.loseAxis(evt);
};

/**
 * Handle "touchstart" events going to the AVID element.
 *
 * When using the AVID with a touch there is no *need* to capture
 * the touchstart because there is no touch "hover", such as an
 * mousemove without a prior mousedown.  However, since "haveAxis"
 * will be used in this program for the mouse users, it must be
 * managed also from the touch interface.
 *
 * Pass through other events.
 */
AVID.touchStart = function (evt) {

  /*
   * The touches are stored elsewhere in a touch event.  The touches[] version is good enough.
   * A tablet can handle multiple touches, but we care only about one of them.
   */
  AVID.getAxis(evt.touches[0]);
};

/**
 * Handle a finger move across the AVID.
 *
 * Other events are suppressed.
 */
AVID.touchMove = function (evt) {

  // Seems a good thing to do...
  if (evt.preventDefault)
    evt.preventDefault();

  AVID.moveShip(evt.touches[0]);
};

/**
 * Handle "touchend" events going to the AVID element.
 *
 * Pass through other events.
 */
AVID.touchEnd = function (evt) {
  AVID.loseAxis(evt.touches[0]);
};

/**
 * Grab the intended axis, if not already done.
 */
AVID.getAxis = function (evt) {

  if (AVID.haveAxis)
    return;

  // If the mode is "done" then don't respond to cursor movement.
  if (AVID.avidMovementMode === AVID.PIVOT) {

    /*
     * If the event is in the same window as the most-recently recorded
     * axis position then we can grab it.
     */
    if (AVID.getAvidWindowId(evt) === AVID.getCurrentNoseWindowId()) {
      AVID.haveAxis = true;
    }

  } else if (AVID.avidMovementMode === AVID.ROLL) {

    /*
     * If the event is in the same window as an upper-hemisphere non-nose
     * axis position then we can grab it.
     */
    if (AVID.pointsAtCurrentRollAxis(AVID.getAvidWindowId(evt)))
      AVID.haveAxis = true;

  }

};

/**
 * We are done with the axis.
 */
AVID.loseAxis = function (evt) {
  AVID.haveAxis = false;
};

AVID.moveShip = function (evt, wasClick) {

  // Don't respond to touches if not pivoting or rolling.
  if (AVID.avidMovementMode === AVID.PIVOT)
    AVID.pivotShip(evt, wasClick);
  else if (AVID.avidMovementMode === AVID.ROLL)
    AVID.rollShip(evt);

};

/**
 * The mouse or finger was moved.  If possible, move the nose to match.
 * The nose will be moved when a new window is reached.
 *
 * If the nose is moving because of a click, and not because of a drag, "wasClick" exists.
 */
AVID.pivotShip = function (evt, wasClick) {

  /*
   * For the sake of mouse users, the nose must be grabbed before it is moved.
   * This means first touching into a nose window.
   */
  if (!AVID.haveAxis)
    return;

  // Decide if this position represents an undo.
  var windowId = AVID.getAvidWindowId(evt);

  if (AVID.isPivotUndo(windowId)) {
    AVID.undoPivotRedraw();
  } else if (AVID.isWindowBumperRing(windowId)) {

    /*
     * There is the AVID proper (amber, blue, green, pole), and there is the bumper ring.
     * The pointer can enter the bumper ring, which sets AVID.wasBumper.  That is set until
     * the next nose position is reached (a valid event circle) or the appropriate "undo" is
     * done.  Once resolving that destination, perform a task:
     * * Make the "current" nose change hemispheres.
     * * Tell drawAvid() whether to draw the bumper ring.
     * If the user drags the pointer into the bumper ring, out again and then back in again
     * the net effect is that the hemisphere isn't changed.
     */
    if (AVID.canHitBumper(wasClick)) {
      AVID.toggleBumper(wasClick);
      AVID.drawAvid();
    }

  } else if (AVID.isMoveOrCurrentEventCircle(windowId)) {

    /*
     * The nose has moved into an AVID window, either the "current" window that contains
     * the nose, or a pre-qualified one next to it with a "move" event circle.  If the movement
     * was to one with an "undo" event circle then this was handled in the previous block.
     *
     * The event circles test if the nose is allowed to pivot to this window.  For example, the nose
     * can't pivot to the same window multiple times.  If an invalid nose position then don't
     * update the AVID.  The pointer is floating somewhere on the AVID.  Another user
     * move will occur, eventually dragging the pointer nearer to the current nose position.
     */
    var axes = AVID.calculateAxesForPivot(windowId);

    if (!AVID.isDifferentPivotWindow(axes))
      return;

    // The move is a keeper.  Update the pivots[] history and then push the "axes" move into "current".
    AVID.saveValidMove(axes);

    /*
     * Calculating a midpoint is left for just prior to displaying it.  Many functions call
     * drawAvid(), so there is no point to calculating it outside of that function.
     */
    AVID.drawAvid();
  }

  /*
   * The user might get into trouble at any time by clicking on the backwards arrow or forwards arrow on the browser.
   * User instructions only go so far.  Cover for user error by saving each time a change is made.
   * The coupling with BRIDGE is regrettable.
   */
  BRIDGE.saveAVIDIntoRoster();
  BRIDGE.saveToDatabase();
};

/**
 * The mouse or finger was moved.  If possible, move the non-nose axis to match.
 * The non-nose axis will be moved when a new window is reached.
 */
AVID.rollShip = function (evt) {

  /*
   * For the sake of mouse users, the roll axis must be grabbed before it is moved.
   * This means first touching into a roll axis window.
   */
  if (!AVID.haveAxis)
    return;

  // Decide if this position represents an undo.
  var windowId = AVID.getAvidWindowId(evt);

  if (AVID.isRollUndo(windowId)) {
    AVID.undoRollRedraw(windowId);
  } else {

    /*
     * Get an axis set that implements the proposed roll.
     *
     * Then prove that the roll is allowed.
     */
    var axes = AVID.calculateAxesForRoll(windowId);

    if (!AVID.isDifferentRollWindow(axes))
      return;

    // The move is a keeper.  Update the rolls[] history and then push the "axes" move into "current".
    AVID.saveValidMove(axes);

    /*
     * Calculating a midpoint is left for just prior to displaying it.  Many functions call
     * drawAvid(), so there is no point to calculating it outside of that function.
     */
    AVID.drawAvid();
  }

  /*
   * The user might get into trouble at any time by clicking on the backwards arrow or forwards arrow on the browser.
   * User instructions only go so far.  Cover for user error by saving each time a change is made.
   * The coupling with BRIDGE is regrettable.
   */
  BRIDGE.saveAVIDIntoRoster();
  BRIDGE.saveToDatabase();
};

/**
 * Calculate if the touch event hovers over an AVID window.
 *
 * Return a string (ID) value if so, and null if outside of the AVID.
 */
AVID.getAvidWindowId = function (evt) {

  /*
   * Create a tiny rectangle at the event position.
   * The elementFromPoint() function determines which
   * DOM element this corresponds to.
   *
   * Note that "evt" might refer to the base event
   * or to a "touch" derived from it.
   */
  var avidWrapper = document.getElementById("avidWrapper");
  var rect = avidWrapper.createSVGRect();
  rect.x = evt.clientX;
  rect.y = evt.clientY;
  rect.width = rect.height = 1;

  /*
   * By experience, the returned element might not point at an AVID window.
   */
  var ele = document.elementFromPoint(rect.x, rect.y);

  if (ele && ele.id) {

    /*
     * Hovering over an element, but over a useful AVID window?
     * Determine by an ID naming convention.
     */
    var prefix = AVID.getLatitudeFromWindowId(ele.id);

    if (AVID.isLatitudeAmber(prefix) || AVID.isLatitudeBlue(prefix) || AVID.isLatitudeGreen(prefix) || AVID.isLatitudePurple(prefix) || prefix === AVID.BUMPER) {
      return ele.id;
    }

  }

  return null;
};

/**
 * Get the "current" nose position.
 *
 * Remember that in this logic the nose window is pulled from the
 * DOM and processed.  After its intended location is validated
 * it is stored in the "current" location.
 */
AVID.getCurrentNose = function () {
  return AVID.current[AVID.NOSE];
};

/**
 * Where did the nose point the last time "current" was filled?
 */
AVID.getCurrentNoseWindowId = function () {
  return AVID.getCurrentNose().windowId;
};

/**
 * Does windowId point at one of the roll axes of the "current" ship position?
 *
 * Returns the axis name corresponding to what was found.  If not pointing at an axis, returns null.
 */
AVID.pointsAtCurrentRollAxis = function (windowId) {
  return AVID.pointsAtRollAxis(AVID.current, windowId);
};

/**
 * Does windowId point at one of the roll axes of the provided ship position?
 *
 * Returns the axis name corresponding to what was found.  If not pointing at an axis, returns null.
 */
AVID.pointsAtRollAxis = function (axes, windowId) {

  // Assume that "windowId" is always referred to from the upper hemisphere.
  if (axes[AVID.LEFT].windowId === windowId && axes[AVID.LEFT].isUpperHemisphere)
    return AVID.LEFT;

  if (axes[AVID.RIGHT].windowId === windowId && axes[AVID.RIGHT].isUpperHemisphere)
    return AVID.RIGHT;

  if (axes[AVID.TOP].windowId === windowId && axes[AVID.TOP].isUpperHemisphere)
    return AVID.TOP;

  if (axes[AVID.BOTTOM].windowId === windowId && axes[AVID.BOTTOM].isUpperHemisphere)
    return AVID.BOTTOM;

  return null;
};

/**
 * Does windowId point at one of the windows occupied by an axis of the "current" ship position?
 *
 * Returns true if pointing at such an axis.
 */
AVID.pointsAtCurrentAxisWindow = function (windowId) {
  return AVID.pointsAtAxisWindow(AVID.current, windowId);
};

/**
 * Does windowId point at one of the windows occupied by an axis of the "axes" set?
 *
 * Returns true if pointing at such an axis.
 */
AVID.pointsAtAxisWindow = function (axes, windowId) {

  // Don't care which hemisphere.
  return axes[AVID.NOSE].windowId === windowId
    || axes[AVID.TAIL].windowId === windowId
    || axes[AVID.LEFT].windowId === windowId
    || axes[AVID.RIGHT].windowId === windowId
    || axes[AVID.TOP].windowId === windowId
    || axes[AVID.BOTTOM].windowId === windowId;
};

/**
 * Given the declared nose position of "windowId", create a set of axes.
 */
AVID.calculateAxesForPivot = function (windowId) {

  /*
   * There will be two modes of axis calculations:
   * * The "as written" variant uses the "original" axes, the oldest one on the pivots list.  Each successive
   *   nose pivot refers back to this oldest axes object.  This is equivalent to dragging the nose on the AVID
   *   card, then resolving the other axes.
   * * The "natural" variant uses the most recent ("current") axes.  Each time the nose is moved the other axes
   *   might be shifted a little.
   *
   * Which mode to use is determined globally for all ships.
   */
  var originalAxes = AVID.current;

  if (AVID.pivotAdjustment === AVID.PIVOT_AS_WRITTEN && AVID.pivots.length > 0)
    originalAxes = AVID.pivots[0];

  /*
   * The new axes object has its nose in the same hemisphere as the previous object (in "current"),
   * unless the "wasBumper" is currently set.  .
   * The other axes (Right, Top) refer to "originalAxes", the "just prior position" axes, but don't
   * refer to "newCurrent".
   */
  var currentHemisphere = AVID.getCurrentNose().isUpperHemisphere;

  if (AVID.wasBumper)
    currentHemisphere = !currentHemisphere;

  var newCurrent = {};
  newCurrent[AVID.NOSE] = {windowId: windowId, isUpperHemisphere: currentHemisphere};

  /*
   * Between the Top and Right axes, one or both of them will be either in the amber or blue rings.  It is possible for:
   * * Both to be in the amber ring (nose at pole),
   * * Both to be in the blue ring (nose in green).
   * * One each in the amber and blue ring (nose in green).
   *
   * For each of Top and Right:
   * * See if the axis is in amber or green.
   * * If so, determine the distance between the window of the "current" position and where the nose great circle meets it.
   *   There will be only one place.  The quickest way there will be < 180 degrees.
   * * For the Top and Right axes that qualify, choose one needing to move the fewest number of windows to meet the nose great circle.
   * * If both Top and Right require the same move, choose the Right one.
   */
  var latitudeRight = AVID.getLatitudeFromWindowId(originalAxes[AVID.RIGHT].windowId);
  var useRight = AVID.isLatitudeAmber(latitudeRight) || AVID.isLatitudeBlue(latitudeRight);

  var latitudeTop = AVID.getLatitudeFromWindowId(originalAxes[AVID.TOP].windowId);
  var useTop = AVID.isLatitudeAmber(latitudeTop) || AVID.isLatitudeBlue(latitudeTop);

  // For the proposed nose move, get the great circle and step through it.
  var gcWindows = AVID.transformGreatCircle(newCurrent[AVID.NOSE]);
  var targetRight = useRight ? AVID.calculateBandWindowIdForMinMove(gcWindows, originalAxes[AVID.RIGHT]) : {
    windowId: null,
    minMove : AVID.TOO_BIG
  };
  var targetTop = useTop ? AVID.calculateBandWindowIdForMinMove(gcWindows, originalAxes[AVID.TOP]) : {
    windowId: null,
    minMove : AVID.TOO_BIG
  };
  var secondAxis;
  var thirdAxisName;

  if (targetRight.minMove === AVID.TOO_BIG && targetTop.minMove === AVID.TOO_BIG) {

    /*
     * If neither target is filled (when TOO_BIG is encountered the window ID is also bogus) it might be a genuine error,
     * but more likely is the result of moving to a pole when all of left/right/top/bottom are in the blue ring.
     */
    if (AVID.isWindowPole(newCurrent[AVID.NOSE].windowId) && AVID.isLatitudeBlue(latitudeRight) && AVID.isLatitudeBlue(latitudeTop)) {

      /*
       * Because all of the existing axes are in the blue ring, this (nose is pole) great circle didn't find any matches.
       * Make the right axis move to the amber ring and all will work OK.
       */
      newCurrent[AVID.RIGHT] = {
        windowId         : AVID.AMBER + "." + originalAxes[AVID.RIGHT].windowId.substr(-3),
        isUpperHemisphere: true
      };
      secondAxis = newCurrent[AVID.RIGHT];
      thirdAxisName = AVID.TOP;
    } else {

      // Don't know why this occurred.  Fake something to keep the program running.
      newCurrent[AVID.RIGHT] = {windowId: gcWindows[0].windowId, isUpperHemisphere: gcWindows[0].isUpperHemisphere};
      secondAxis = newCurrent[AVID.RIGHT];
      thirdAxisName = AVID.TOP;
    }

  } else if (targetTop.minMove === AVID.TOO_BIG) {

    // The Right target is good, so that is the second axis.
    newCurrent[AVID.RIGHT] = {windowId: targetRight.windowId, isUpperHemisphere: targetRight.isUpperHemisphere};
    secondAxis = newCurrent[AVID.RIGHT];
    thirdAxisName = AVID.TOP;
  } else if (targetRight.minMove === AVID.TOO_BIG) {

    // The Top target is good, so that is the second axis.
    newCurrent[AVID.TOP] = {windowId: targetTop.windowId, isUpperHemisphere: targetTop.isUpperHemisphere};
    secondAxis = newCurrent[AVID.TOP];
    thirdAxisName = AVID.RIGHT;
  } else if (AVID.isLatitudeAmber(latitudeRight) && !AVID.isLatitudeAmber(latitudeTop)) {

    // Right is in amber and Top is in blue, so favor Right.
    newCurrent[AVID.RIGHT] = {windowId: targetRight.windowId, isUpperHemisphere: targetRight.isUpperHemisphere};
    secondAxis = newCurrent[AVID.RIGHT];
    thirdAxisName = AVID.TOP;
  } else if (!AVID.isLatitudeAmber(latitudeRight) && AVID.isLatitudeAmber(latitudeTop)) {

    // Right is in blue and Top is in amber, so favor Top.
    newCurrent[AVID.TOP] = {windowId: targetTop.windowId, isUpperHemisphere: targetTop.isUpperHemisphere};
    secondAxis = newCurrent[AVID.TOP];
    thirdAxisName = AVID.RIGHT;
  } else if (targetRight.minMove < targetTop.minMove) {

    // Both targets are in the same ring, likely blue.  Choose the one that moves the least.
    newCurrent[AVID.RIGHT] = {windowId: targetRight.windowId, isUpperHemisphere: targetRight.isUpperHemisphere};
    secondAxis = newCurrent[AVID.RIGHT];
    thirdAxisName = AVID.TOP;
  } else if (targetRight.minMove > targetTop.minMove) {

    // Both targets are in the same ring, likely blue.  Choose the one that moves the least.
    newCurrent[AVID.TOP] = {windowId: targetTop.windowId, isUpperHemisphere: targetTop.isUpperHemisphere};
    secondAxis = newCurrent[AVID.TOP];
    thirdAxisName = AVID.RIGHT;
  } else {

    // No useful difference between them.  Choose Right, just because.
    newCurrent[AVID.RIGHT] = {windowId: targetRight.windowId, isUpperHemisphere: targetRight.isUpperHemisphere};
    secondAxis = newCurrent[AVID.RIGHT];
    thirdAxisName = AVID.TOP;
  }

  /*
   * Finding the third axis is a task accomplished on the nose great circle.  The search starts from the second axis.
   * * If the second axis is Right (the third axis is Top) then clockwise by three windows.
   * * If the second axis is Top (the third axis is Right) then counterclockwise by three windows.
   * For each great circles list, as the index increases the windows appear representing a counterclockwise tour.
   */
  var goCounterClockwise = thirdAxisName === AVID.RIGHT;
  newCurrent[thirdAxisName] = AVID.calculateThirdAxis(gcWindows, newCurrent[AVID.NOSE].windowId, secondAxis, goCounterClockwise);

  /*
   * The other axes are easy reflections of the already calculated ones.
   */
  newCurrent[AVID.TAIL] = AVID.getOppositeAxis(newCurrent[AVID.NOSE]);
  newCurrent[AVID.LEFT] = AVID.getOppositeAxis(newCurrent[AVID.RIGHT]);
  newCurrent[AVID.BOTTOM] = AVID.getOppositeAxis(newCurrent[AVID.TOP]);

  return newCurrent;
};

/**
 * Given the declared nose position of "windowId", and an assumed "Right" axis
 * in the amber ring, create a set of axes.  Don't refer to the "current" or
 * to any previous ship position at all.
 *
 * This is a modification of calculateAxesForPivot().
 */
AVID.calculateAxesForNewShip = function (bearingWindowId) {

  /*
   * The "windowId" has its windows defined bearing-style, like "u30.000" and "d30.000".
   * This needs to be translated into AVID-style "a30.000" with an "isUpperHemisphere".
   */
  var windowId = "a" + bearingWindowId.substring(1);
  var origDegrees = parseInt(windowId.substring(4), 10);
  var isUpperHemisphere = bearingWindowId.substring(0, 1) === "u";

  /*
   * A pole request comes through as something like "u90.030".  Fix that to end in "pol".
   */
  if (AVID.isWindowPole(windowId))
    windowId = AVID.getLatitudeFromWindowId(windowId) + ".pol";

  var newCurrent = {};
  newCurrent[AVID.NOSE] = {windowId: windowId, isUpperHemisphere: isUpperHemisphere};

  /*
   * The new ship is created with "its wings level", meaning that the Right will be in the amber ring.
   * The window for the Right will be three windows clockwise of the Nose.
   *
   * The user is asked for a direction and an attitude.  Even if the attitude is for "pole", use the
   * given direction, preserved as "origDegrees", in calculating Right.
   */
  var rightDegrees = origDegrees + 90;

  if (rightDegrees >= 360) {
    rightDegrees -= 360;
  }

  var rightWindowId = "a00." + AVID.getDegreesStringForWindowId(rightDegrees);

  /*
   * For the proposed nose move, get the great circle and step through it.
   */
  var gcWindows = AVID.transformGreatCircle(newCurrent[AVID.NOSE]);
  var targetRight = AVID.calculateBandWindowIdForMinMove(gcWindows, {windowId: rightWindowId, isUpperHemisphere: true});
  var secondAxis;
  var thirdAxisName;

  // The Right target is good, so that is the second axis.
  newCurrent[AVID.RIGHT] = {windowId: targetRight.windowId, isUpperHemisphere: targetRight.isUpperHemisphere};
  secondAxis = {windowId: newCurrent[AVID.RIGHT].windowId, isUpperHemisphere: newCurrent[AVID.RIGHT].isUpperHemisphere};
  thirdAxisName = AVID.TOP;

  /*
   * Finding the third axis is a task accomplished on the nose great circle.  The search starts from the second axis.
   * * If the second axis is Right (the third axis is Top) then clockwise by three windows.
   * * If the second axis is Top (the third axis is Right) then counterclockwise by three windows.
   * For each great circles list, as the index increases the windows appear representing a counterclockwise tour.
   */
  var goCounterClockwise = thirdAxisName === AVID.RIGHT;
  newCurrent[thirdAxisName] = AVID.calculateThirdAxis(gcWindows, newCurrent[AVID.NOSE].windowId, secondAxis, goCounterClockwise);

  /*
   * The other axes are easy reflections of the already calculated ones.
   */
  newCurrent[AVID.TAIL] = AVID.getOppositeAxis(newCurrent[AVID.NOSE]);
  newCurrent[AVID.LEFT] = AVID.getOppositeAxis(newCurrent[AVID.RIGHT]);
  newCurrent[AVID.BOTTOM] = AVID.getOppositeAxis(newCurrent[AVID.TOP]);

  return newCurrent;
};

/**
 * Given the "current" axes set, create a new set with the same nose position but rolled.
 */
AVID.calculateAxesForRoll = function (windowId) {

  /*
   * When pivoting the logic knows to look just for the nose axis.  When rolling the user might
   * choose any of two or three available axes, those above the equator on the AVID.
   * The window supplied here might be next to any of these axes.
   */
  var gcWindows = AVID.transformGreatCircle(AVID.getCurrentNose());

  // The new axes will be a rolled version of "current".  May as well clone it.
  var newCurrent = AVID.makeAxesCopy(AVID.current);

  // If "windowId" points at some roll axis of "current" then nothing has changed.  Return the unchanged axes.
  if (AVID.pointsAtCurrentRollAxis(windowId))
    return newCurrent;

  /*
   * If "windowId" points at a neighbor to a "current" roll axis, where the neighbor is on a great circle, then this is a valid roll.
   * If the returned object is null then no match was found.
   */
  var diffObj = AVID.rollAxisNeighborOfCurrent(gcWindows, windowId);

  if (!diffObj)
    return newCurrent;

  var gcLen = gcWindows.length;
  var leftIdx;
  var rightIdx;
  var topIdx;
  var bottomIdx;

  for (var idx = 0; idx < gcLen; idx++) {
    gcWindow = gcWindows[idx];

    if (gcWindow.windowId === newCurrent[AVID.LEFT].windowId && gcWindow.isUpperHemisphere === newCurrent[AVID.LEFT].isUpperHemisphere)
      leftIdx = idx;

    if (gcWindow.windowId === newCurrent[AVID.RIGHT].windowId && gcWindow.isUpperHemisphere === newCurrent[AVID.RIGHT].isUpperHemisphere)
      rightIdx = idx;

    if (gcWindow.windowId === newCurrent[AVID.TOP].windowId && gcWindow.isUpperHemisphere === newCurrent[AVID.TOP].isUpperHemisphere)
      topIdx = idx;

    if (gcWindow.windowId === newCurrent[AVID.BOTTOM].windowId && gcWindow.isUpperHemisphere === newCurrent[AVID.BOTTOM].isUpperHemisphere)
      bottomIdx = idx;

  }

  /*
   * The returned object has an "axisName",which could be useful, and an index difference
   * ("diffIdx") for the great circle window list.  A positive value is counterclockwise.
   */
  newCurrent[AVID.LEFT] = gcWindows[AVID.adjustListIdx(leftIdx, gcLen, diffObj.diffIdx)];
  newCurrent[AVID.RIGHT] = gcWindows[AVID.adjustListIdx(rightIdx, gcLen, diffObj.diffIdx)];
  newCurrent[AVID.TOP] = gcWindows[AVID.adjustListIdx(topIdx, gcLen, diffObj.diffIdx)];
  newCurrent[AVID.BOTTOM] = gcWindows[AVID.adjustListIdx(bottomIdx, gcLen, diffObj.diffIdx)];
  newCurrent.diffIdx = diffObj.diffIdx;

  return newCurrent;
};

/**
 * Create a new axes set after applying a roll of "diffIdx" windows.
 *
 * Roll the top / bottom / left / right axes of the "axes" object.
 * If (diffIdx > 0) then roll counterclockwise.
 */
AVID.calculateAxesForMidpointRoll = function (axes, diffIdx) {

  /*
   * Need the great circle windows of this "axes" object.
   */
  var gcWindows = AVID.transformGreatCircle(axes[AVID.NOSE]);

  // The new axes will be a rolled version of the passed-in "axes" object.  May as well clone it.
  var newMidpoint = AVID.makeAxesCopy(axes);

  // If (diffIdx = 0) then nothing has changed.  Return the unchanged axes.
  if (diffIdx === 0)
    return newMidpoint;

  var gcLen = gcWindows.length;
  var leftIdx;
  var rightIdx;
  var topIdx;
  var bottomIdx;

  for (var idx = 0; idx < gcLen; idx++) {
    gcWindow = gcWindows[idx];

    if (gcWindow.windowId === newMidpoint[AVID.LEFT].windowId && gcWindow.isUpperHemisphere === newMidpoint[AVID.LEFT].isUpperHemisphere)
      leftIdx = idx;

    if (gcWindow.windowId === newMidpoint[AVID.RIGHT].windowId && gcWindow.isUpperHemisphere === newMidpoint[AVID.RIGHT].isUpperHemisphere)
      rightIdx = idx;

    if (gcWindow.windowId === newMidpoint[AVID.TOP].windowId && gcWindow.isUpperHemisphere === newMidpoint[AVID.TOP].isUpperHemisphere)
      topIdx = idx;

    if (gcWindow.windowId === newMidpoint[AVID.BOTTOM].windowId && gcWindow.isUpperHemisphere === newMidpoint[AVID.BOTTOM].isUpperHemisphere)
      bottomIdx = idx;

  }

  /*
   * The returned object has an "axisName",which could be useful, and an index difference
   * ("diffIdx") for the great circle window list.  A positive value is counterclockwise.
   */
  newMidpoint[AVID.LEFT] = gcWindows[AVID.adjustListIdx(leftIdx, gcLen, diffIdx)];
  newMidpoint[AVID.RIGHT] = gcWindows[AVID.adjustListIdx(rightIdx, gcLen, diffIdx)];
  newMidpoint[AVID.TOP] = gcWindows[AVID.adjustListIdx(topIdx, gcLen, diffIdx)];
  newMidpoint[AVID.BOTTOM] = gcWindows[AVID.adjustListIdx(bottomIdx, gcLen, diffIdx)];
  newMidpoint.diffIdx = diffIdx;

  return newMidpoint;
};

/**
 * Is this window ID a neighbor to an existing roll axis of the "current" ship position?
 *
 * If a neighbor, return an object with the closest axis name and the index difference.
 * If not a neighbor return null.
 */
AVID.rollAxisNeighborOfCurrent = function (gcWindows, windowId) {

  /*
   * Assert that "windowId" was provided by selecting from the upper hemisphere of the AVID.
   * Find a great circle window on the upper hemisphere matching this "windowId".
   */
  var gcLen = gcWindows.length;
  var gcWindow;
  var axisIdx = -1;
  var leftIdx = -1;
  var rightIdx = -1;
  var topIdx = -1;
  var bottomIdx = -1;

  for (var idx = 0; idx < gcLen; idx++) {
    gcWindow = gcWindows[idx];

    if (gcWindow.windowId === windowId && gcWindow.isUpperHemisphere)
      axisIdx = idx;

    if (gcWindow.windowId === AVID.current[AVID.LEFT].windowId && gcWindow.isUpperHemisphere && AVID.current[AVID.LEFT].isUpperHemisphere)
      leftIdx = idx;

    if (gcWindow.windowId === AVID.current[AVID.RIGHT].windowId && gcWindow.isUpperHemisphere && AVID.current[AVID.RIGHT].isUpperHemisphere)
      rightIdx = idx;

    if (gcWindow.windowId === AVID.current[AVID.TOP].windowId && gcWindow.isUpperHemisphere && AVID.current[AVID.TOP].isUpperHemisphere)
      topIdx = idx;

    if (gcWindow.windowId === AVID.current[AVID.BOTTOM].windowId && gcWindow.isUpperHemisphere && AVID.current[AVID.BOTTOM].isUpperHemisphere)
      bottomIdx = idx;

  }

  // If the "windowId" is off of a roll index by one position then this is a neighbor.
  var diffIdx = AVID.calculateDiffIdx(axisIdx, leftIdx, gcLen);

  if (diffIdx === -1 || diffIdx === 1)
    return {axisName: AVID.LEFT, diffIdx: diffIdx};

  diffIdx = AVID.calculateDiffIdx(axisIdx, rightIdx, gcLen);

  if (diffIdx === -1 || diffIdx === 1)
    return {axisName: AVID.RIGHT, diffIdx: diffIdx};

  diffIdx = AVID.calculateDiffIdx(axisIdx, topIdx, gcLen);

  if (diffIdx === -1 || diffIdx === 1)
    return {axisName: AVID.TOP, diffIdx: diffIdx};

  diffIdx = AVID.calculateDiffIdx(axisIdx, bottomIdx, gcLen);

  if (diffIdx === -1 || diffIdx === 1)
    return {axisName: AVID.BOTTOM, diffIdx: diffIdx};

  return null;
};

/**
 * Ask how far apart "endIdx" and "startIdx" are.
 *
 * It is possible that either of the indexes are negative (no prior match).
 * In that event return a nonsense value.
 */
AVID.calculateDiffIdx = function (endIdx, startIdx, listLen) {

  if (endIdx < 0 || startIdx < 0)
    return AVID.TOO_BIG;

  var diffIdx = endIdx - startIdx;

  if (diffIdx < -1)
    diffIdx += listLen;
  else if (diffIdx > 1)
    diffIdx -= listLen;

  return diffIdx;
};

/**
 * Change "sourceIdx" by "adjIdx".  If out-of-bounds then adjust.
 *
 * "adjIdx" can be negative, zero or positive.
 */
AVID.adjustListIdx = function (sourceIdx, listLen, adjIdx) {
  var newIdx = sourceIdx + adjIdx;

  // These indexes navigate about a list (array).  When they go out-of-bounds, loop back to the other end of the array.
  if (newIdx < 0)
    newIdx += listLen;
  else if (newIdx >= listLen)
    newIdx -= listLen;

  return newIdx;
};

/**
 * Determine which window ID of the great circle will meet the target's latitude band
 * and be the one that takes the least movement to reach from the target's window.
 *
 * This works with great circles that have multiple possibilities to land on for that latitude.
 *
 * Always returns an object with three attributes.
 * * windowId:  If there is a match, return that ID.  No match?  Return null.
 * * isUpperHemisphere:  Always matches the latitude of the target, meaning it shares this value, too.
 * * minMove:  The number of windows to reach the returned window ID.  If no match then this is a large value.
 */
AVID.calculateBandWindowIdForMinMove = function (gcWindows, target) {
  var targetWindowId = target.windowId;
  var targetLat = AVID.getLatitudeFromWindowId(targetWindowId);
  var targetDegrees = AVID.getDegreesFromWindowId(targetWindowId);

  var gcLen = gcWindows.length;
  var gcWindowId;
  var gcWindowLat;
  var gcWindowIsUpper;
  var deltaDegrees;
  var minMove = AVID.TOO_BIG;
  var minWindowId = null;

  for (var idx = 0; idx < gcLen; idx++) {
    gcWindowId = gcWindows[idx].windowId;
    gcWindowLat = AVID.getLatitudeFromWindowId(gcWindowId);
    gcWindowIsUpper = gcWindows[idx].isUpperHemisphere;

    // The function caller asserts that the latitude was in a usable band.  No need to test again here.
    if (gcWindowLat === targetLat && gcWindowIsUpper === target.isUpperHemisphere) {

      /*
       * Count the degrees between the current great circle position and the target.
       * If the distance is more than a half-circle then the travel should have been in the other direction.
       * Cope by getting the reciprocal quantity of degrees.
       */
      deltaDegrees = Math.abs(AVID.getDegreesFromWindowId(gcWindowId) - targetDegrees);

      if (deltaDegrees > 180)
        deltaDegrees = 360 - deltaDegrees;

      // For the minimum move preserve the window ID that got that minimum move.
      if (deltaDegrees < minMove) {
        minMove = deltaDegrees;
        minWindowId = gcWindowId;
      }

    }

  }

  return {windowId: minWindowId, isUpperHemisphere: target.isUpperHemisphere, minMove: minMove};
};

/**
 * Calculate the "third" axis position on the AVID.
 * The nose axis has been determined, then the right/top axis.  Based on these, the top/right can be found.
 *
 * Returns an axis object.  On failure to find the window ID, fakes it.
 */
AVID.calculateThirdAxis = function (gcWindows, noseWindowId, secondAxis, goCounterClockwise) {

  // All of the great circles have 12 windows.  The other axis is always 3 windows away from the secondAxis.
  return AVID.getGreatCircleWindowOffset(gcWindows, secondAxis, goCounterClockwise, 3);
};

/**
 * Starting at the window ID position in the great circle list, move by cntWindows positions.
 *
 * All of the great circle routes are built so that increasing index values represent
 * a counterclockwise path about the axis.
 *
 * Returns an axis object.  On failure to find the window ID, fakes it.
 */
AVID.getGreatCircleWindowOffset = function (gcWindows, axis, goCounterClockwise, cntWindows) {

  // The starting window ID is given.  Find where on the great circle this is.
  var gcLen = gcWindows.length;
  var idx = 0;

  for (; idx < gcLen; idx++) {

    if (gcWindows[idx].windowId === axis.windowId && gcWindows[idx].isUpperHemisphere === axis.isUpperHemisphere)
      break;

  }

  /*
   * The starting point is found.  Moving in the appropriate direction, calculate the ending point.
   *
   * Note that using modulus won't work.  Suppose that (idx === 4) and (gcLen === 4).
   * * Using modulus (4 % 4 = 4).
   * * Using the while loop results in a final value of 0, which is desired.
   */
  if (idx === gcLen) {
    idx = 0;
  } else if (goCounterClockwise) {
    idx += cntWindows;

    while (idx >= gcLen)
      idx -= gcLen;

  } else {
    idx -= cntWindows;

    while (idx < 0)
      idx += gcLen;

  }

  return gcWindows[idx];
};

/**
 * Get the axis on the other side of the AVID sphere.
 * For example, pass in a Nose and get back a Tail.
 */
AVID.getOppositeAxis = function (axis) {
  var windowId = axis.windowId;
  var isUpperHemisphere = axis.isUpperHemisphere;
  var latitude = AVID.getLatitudeFromWindowId(windowId);

  /*
   * In general, the opposite axis is on the other side of the sphere and in the other hemisphere.
   * For an opposite pole the other window is also a pole, so only the hemisphere changes.
   * For an opposite axis from the amber ring, all windows in that ring are in the upper hemisphere.
   */
  var otherAxisWindowId = AVID.isWindowPole(latitude) ? windowId : AVID.transformWindowId(windowId, 180);
  var otherAxisHemisphere = AVID.isLatitudeAmber(latitude) ? isUpperHemisphere : !isUpperHemisphere;

  return {windowId: otherAxisWindowId, isUpperHemisphere: otherAxisHemisphere};
};

/**
 * Determine a complete axes set that is the midpoint for the "current" axes set.
 *
 * The "current" axes is the result of all pivot and/or roll changes from the start of the game turn.
 * Apply about one-half of the pivot and one-half of the rolls to the manufactured midpoint result.
 */
AVID.calculateMidpointAxes = function () {
  var midpoint = AVID.calculateMidpointAxesPivot();
  var rollsLen = AVID.rolls.length;

  // If no rolls then only the pivots have anything to say.
  if (rollsLen === 0)
    return AVID.makeAxesCopy(midpoint);

  /*
   * The number of windows to roll the midpoint is Math.floor(rollsLen / 2).
   * The direction to move is in AVID.current.diffIdx.  A positive value is counterclockwise.
   *
   * The "diffIdx" attribute exists only once a roll has been done.  If no roll, no attribute.
   * It also means that (rollsLen = 0).
   */
  var qtyMidRoll = Math.floor(rollsLen / 2) * (AVID.current.diffIdx > 0 ? 1 : -1);
  midpoint = AVID.calculateAxesForMidpointRoll(midpoint, qtyMidRoll);

  return AVID.makeAxesCopy(midpoint);
};

/**
 * Determine a complete axes set that is the midpoint for the "current" axes set, accounting only for pivots.
 */
AVID.calculateMidpointAxesPivot = function () {
  var pivotsLen = AVID.pivots.length;

  // If nothing has moved yet then the midpoint coincides with the nose.
  if (pivotsLen === 0)
    return AVID.current;

  /*
   * Truth table:
   * M = midpoint marker, C = current nose

   * [ 0 ] [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ] [ 6 ] [ 7 ] = idx of net pivots
   *   C
   *   M     C
   *         M     C
   *         M           C
   *               M           C
   *               M                 C
   *                     M                 C
   *                     M                      C
   *
   * This shows me that the midpoint should be at floor((# net pivots) / 2).
   */
  return AVID.pivots[Math.floor(pivotsLen / 2)];
};

/**
 * Determine if this pointer position "windowId" represents an attempt to undo a previous move.
 */
AVID.isPivotUndo = function (windowId) {

  // All event circles are previously vetted.  The undo event circle has its undo color.
  var ele = document.getElementById(windowId);

  return ele && AVID.areColorsEqual(ele.style.stroke, AVID.undoColor.stroke);
};

/**
 * Undo only one undo step, no matter what it was.
 */
AVID.undoPivot = function () {

  /*
   * The nose position being replaced is "current".  This works both from clicking a button
   * and for a retrace.  In a retrace, the most recent position is "current" and the pointer
   * is currently at the most recent pivots[] list location.
   *
   * It is possible to pop a list with no elements on it, so test the value before use.
   *
   * DON'T remove any breadcrumb icons from the associated array!  They need not be
   * erased, and we're likely to need them for other ships.
   */
  var axes = AVID.pivots.pop();

  if (axes)
    AVID.current = axes;

  AVID.clearBumper();
};

/**
 * Undo only one undo step, no matter what it was.  Then refresh the AVID display.
 *
 * The undo button needs this.
 */
AVID.undoPivotRedraw = function () {
  AVID.undoPivot();
  AVID.drawAvid();
};

/**
 * Determine if this pointer position "windowId" represents an attempt to undo a previous move.
 */
AVID.isRollUndo = function (windowId) {

  // All event circles are previously vetted.  The undo event circle has its undo color.
  var ele = document.getElementById(windowId);

  return ele && AVID.areColorsEqual(ele.style.stroke, AVID.undoColor.stroke);
};

/**
 * Undo only one undo step, no matter what it was.
 */
AVID.undoRoll = function () {

  /*
   * Go back one roll position, whatever it was.
   *
   * The nose position isn't moving, so no need to play with the bumper ring.
   *
   * It is possible to pop a list with no elements on it, so test the value before use.
   */
  var axes = AVID.rolls.pop();

  if (axes)
    AVID.current = axes;

};

/**
 * Undo only one undo step, no matter what it was.  Then refresh the AVID display.
 *
 * The undo button needs this.
 */
AVID.undoRollRedraw = function () {
  AVID.undoRoll();
  AVID.drawAvid();
};

/**
 * When the user toggles from "roll mode" to "pivot mode" any existing rolls are meaningless.
 * Put the ship back to its "just completed all pivots" position.
 */
AVID.undoAllRolls = function () {

  if (AVID.rolls.length > 0) {
    AVID.current = AVID.rolls[0];
    AVID.rolls = [];
  }

};

/**
 * Does the window ID refer to a bumper ring window?
 */
AVID.isWindowBumperRing = function (windowId) {
  return windowId && windowId.substring(0, 7) === "bumper.";
};

/**
 * Is the pointer allowed to enter the bumper ring and change the bumper ring markings?
 */
AVID.canHitBumper = function (wasClick) {

  // If the pointer didn't come from the amber ring then it is too far to reach the bumper ring.
  if (!AVID.isWindowAmber(AVID.getCurrentNoseWindowId()))
    return false;

  // A click from the amber ring must succeed.  No need to click elsewhere first.
  if (wasClick)
    return true;

  /*
   * When dragging, must drag back to the AVID before the bumper ring works again.
   * In this way a user can drag to the bumper ring, potentially changing hemispheres,
   * drag back to the window just exited from, and then drag back to the bumper ring
   * a second time.  This second trip to the bumper ring cancels the first trip there.
   */
  return AVID.isBumperAllowed;
};

/**
 * Convenience function to reset the bumper ring mechanism.
 */
AVID.clearBumper = function () {
  AVID.wasBumper = false;
  AVID.isBumperAllowed = true;
};

/**
 * Flip the display of the bumper ring, from hidden to shown, shown to hidden, etc.
 * Also set a global showing that this was a bumper move.
 */
AVID.toggleBumper = function (wasClick) {

  /*
   * The bumper ring was hit, so record that.  If this is a second bump without
   * hitting a valid event circle then this actually unsets wasBumper.
   */
  AVID.wasBumper = !AVID.wasBumper;

  /*
   * Set the guard against flickering in the bumper ring.  What to set it to depends
   * on how the bumper ring was reached:
   * * If the bumper ring was dragged into then set this to false.  The user must drag
   *   into the AVID windows again before trying the bumper ring again.
   * * If the bumper ring was reached by a click then set true.  The bumper ring is
   *   usable right away.
   * * Mixed modes (drag to ring, click on ring) are hard to define, so let that alone for now.
   *
   * The net result of the logic is that isBumperAllowed track the wasClick value.
   */
  AVID.isBumperAllowed = wasClick;
};

/**
 * Conditionally show or hide the bumper ring.
 * Remember, the ring is shown briefly, and not as a hemisphere indicator.
 */
AVID.showBumperRing = function () {
  AVID.drawBumperRing(AVID.wasBumper ? AVID.OPACITY_BUMPER : AVID.OPACITY_CLEAR);
};

/**
 * Always hide the bumper ring.
 */
AVID.hideBumperRing = function () {
  AVID.drawBumperRing(AVID.OPACITY_CLEAR);
};

/**
 * Do the work of showing and hiding the bumper ring.
 */
AVID.drawBumperRing = function (opacity) {
  var degreesLen = AVID.degrees.length;

  for (var idx = 0; idx < degreesLen; idx++) {
    document.getElementById("bumper." + AVID.degrees[idx]).style.fillOpacity = opacity;
  }

};

/**
 * Create and return a deep copy of a list of axes objects.
 */
AVID.makeAxesListCopy = function (oldList) {
  var len = oldList.length;
  var newList = new Array(len);

  for (var idx = 0; idx < len; idx++) {
    newList[idx] = AVID.makeAxesCopy(oldList[idx]);
  }

  return newList;
};

/**
 * Create and return a deep copy of an axes object.
 */
AVID.makeAxesCopy = function (oldObj) {
  var newObj = {};
  newObj[AVID.NOSE] = AVID.makeAxisCopy(oldObj[AVID.NOSE]);
  newObj[AVID.TAIL] = AVID.makeAxisCopy(oldObj[AVID.TAIL]);
  newObj[AVID.TOP] = AVID.makeAxisCopy(oldObj[AVID.TOP]);
  newObj[AVID.BOTTOM] = AVID.makeAxisCopy(oldObj[AVID.BOTTOM]);
  newObj[AVID.LEFT] = AVID.makeAxisCopy(oldObj[AVID.LEFT]);
  newObj[AVID.RIGHT] = AVID.makeAxisCopy(oldObj[AVID.RIGHT]);

  if (oldObj.wasDiagonal)
    newObj.wasDiagonal = oldObj.wasDiagonal;

  if (oldObj.diffIdx)
    newObj.diffIdx = oldObj.diffIdx;

  return newObj;
};

/**
 * Create and return a deep copy of a single axis.
 */
AVID.makeAxisCopy = function (oldObj) {
  var newObj = {};
  newObj.windowId = oldObj.windowId;
  newObj.isUpperHemisphere = oldObj.isUpperHemisphere;

  return newObj;
};

/**
 * Does this window ID represent the "current" nose window or one of its neighbors that can be moved to?
 */
AVID.isMoveOrCurrentEventCircle = function (windowId) {

  // All event circles are previously vetted.
  var ele = document.getElementById(windowId);

  if (!ele)
    return false;

  var strokeColor = ele.style.stroke;

  return AVID.areColorsEqual(strokeColor, AVID.moveColor.stroke) || AVID.areColorsEqual(strokeColor, AVID.currentColor.stroke);
};

/**
 * Safely compare two color strings.
 * A recent change in Chrome, or perhaps in Microsoft support libraries,
 * has element colors (such as "ele.style.stroke") being set by this
 * program as "#ff0000" but being returned as "rgb(255, 0, 0)".
 *
 * Ensure that both strings are in the same format before comparing.
 *
 * Returns true if the colors are equal.
 */
AVID.areColorsEqual = function (firstColor, secondColor) {

  // Create a dummy element to assign colors to.
  var eleDummy = document.createElement("div");

  // Set the color to the first color value, and read it back.
  eleDummy.style.color = firstColor;
  var safeFirstColor = eleDummy.style.color;

  // Set the color to the second color value, and read it back.
  eleDummy.style.color = secondColor;
  var safeSecondColor = eleDummy.style.color;

  // Both colors are now adjusted to use the browser's internal format,
  // so we can compare them directly.
  return safeFirstColor === safeSecondColor;
};

/**
 * The program should respond only when a different window has been accessed.
 *
 * "axes" must be the calculated change, not AVID.current.
 */
AVID.isDifferentPivotWindow = function (axes) {
  return axes.NOSE.windowId !== AVID.getCurrentNoseWindowId();
};

/**
 * The program should respond only when a different window has been accessed.
 *
 * "axes" must be the calculated change, not AVID.current.
 */
AVID.isDifferentRollWindow = function (axes) {
  return axes.LEFT.windowId !== AVID.current.LEFT.windowId;
};

/**
 * Does the shift from "axes1" and "axes2" represent a diagonal move?
 *
 * Returns a non-null object with some or all of these attributes:
 * * isDiagonal: Either true or false.
 * * startLatitude: The window ID prefix for "axes1".  In practice, diagonals occur between the amber band and the blue bands.
 * * isRising: If the latitude for "axes2" is higher than that for "axes1" then this returns true.
 * * isClockwise: If the degrees for "axes2" is further clockwise than that for "axes1" then this returns true.
 *
 * If a diagonal then all attributes are returned.  If not a diagonal then only isDiagonal is filled with False.
 */
AVID.whichDiagonal = function (axes1, axes2) {
  var diagonal = {};
  diagonal.isDiagonal = false;

  if (!axes1 || !axes2)
    return diagonal;

  /*
   * The pole window has a degrees value that is non-numeric, and needs special treatment.
   * A diagonal can't happen by way of the pole.
   */
  var axes1NoseWindowId = axes1.NOSE.windowId;
  var axes2NoseWindowId = axes2.NOSE.windowId;

  if (AVID.isWindowPole(axes1NoseWindowId) || AVID.isWindowPole(axes2NoseWindowId))
    return diagonal;

  var axes1NoseUpperHemisphere = axes1.NOSE.isUpperHemisphere;
  var axes1Latitude = AVID.getLatitudeFromWindowId(axes1NoseWindowId);
  var axes1Degrees = AVID.getDegreesFromWindowId(axes1NoseWindowId);

  var axes2NoseUpperHemisphere = axes2.NOSE.isUpperHemisphere;
  var axes2Latitude = AVID.getLatitudeFromWindowId(axes2NoseWindowId);
  var axes2Degrees = AVID.getDegreesFromWindowId(axes2NoseWindowId);

  /*
   * A diagonal occurs when moving between the blue and amber bands, and advancing about the AVID by one window (30 degrees).
   * A discontinuity in window IDs from 330 to 0 gives the odd value.
   */
  if (!(((AVID.isLatitudeAmber(axes1Latitude) && AVID.isLatitudeBlue(axes2Latitude)) || (AVID.isLatitudeBlue(axes1Latitude) && AVID.isLatitudeAmber(axes2Latitude))) && axes1Degrees !== axes2Degrees))
    return diagonal;

  var diffDegrees = Math.abs(axes2Degrees - axes1Degrees);

  if (!(diffDegrees === 30 || diffDegrees === 330))
    return diagonal;

  /*
   * When comparing degree values about the "A" position a jump from 330 to 0 occurs.  Adjust for that discontinuity.
   * The "axes2Degrees" is never compared directly with the AVID, so a value >= 360 is OK.
   */
  diagonal.isDiagonal = true;
  diagonal.startLatitude = axes1Latitude;
  diagonal.isRising = (AVID.isLatitudeBlue(axes1Latitude) && !axes1NoseUpperHemisphere && AVID.isLatitudeAmber(axes2Latitude)) || (AVID.isLatitudeAmber(axes1Latitude) && AVID.isLatitudeBlue(axes2Latitude) && axes2NoseUpperHemisphere);

  // When progressing clockwise the end point has a higher degree value than the start point, excepting the transition from 330 to 0.
  diagonal.isClockwise = (diffDegrees === 30) ? (axes2Degrees > axes1Degrees) : (axes2Degrees < axes1Degrees);

  return diagonal;
};

/**
 * Push the most recent "current" object into the pivots[] list.
 * Then save this "axes" object into the "current" object.
 */
AVID.saveValidMove = function (axes) {
  AVID.pushCurrentToStack();
  AVID.saveToCurrent(axes);
  AVID.clearBumper();
};

/**
 * The "current" axes are saved into the pivots[] or rolls[] list.
 */
AVID.pushCurrentToStack = function () {

  // Store a complete copy on the pivots[] or rolls[] list, lest we change multiple positions through shallow copies.
  var copyCurrent = AVID.makeAxesCopy(AVID.current);

  if (AVID.avidMovementMode === AVID.PIVOT) {
    AVID.pivots.push(copyCurrent);

    /*
     * Build breadcrumb icons at need.
     */
    var lenPivots = AVID.pivots.length;

    if (lenPivots > AVID.pivotCrumbs.length)
      AVID.addPivotCrumb(lenPivots - 1);

  } else if (AVID.avidMovementMode === AVID.ROLL) {
    AVID.rolls.push(copyCurrent);
    var lenRolls = AVID.rolls.length;

    if (lenRolls > AVID.rollCrumbs.length)
      AVID.addRollCrumb(lenRolls - 1);

  }

};

/**
 * The passed-in "axes" object, not yet affiliated with the AVID,
 * is now the "current" axes object for the turn.
 */
AVID.saveToCurrent = function (axes) {

  /*
   * Yes, this diagonal was already calculated.
   * However, there was no place to store the result, and so it must be recalculated.
   */
  var diagonal = AVID.whichDiagonal(AVID.current, axes);
  axes.wasDiagonal = diagonal.isDiagonal;

  AVID.current = axes;
};

/**
 * On the AVID, redraw all the axes of the "current" object.
 */
AVID.drawAvid = function () {

  /*
   * The "Mode 2" movement puts down a midpoint marker (double-lines).
   * The "mark midpoints and endpoints" needs two full sets of axes.
   *
   * The midpoint marker is technically redundant for the "mark midpoints..."
   * display.  However, omitting it means explaining why the midpoint nose
   * marker is your substitute.  This isn't worth the effort...
   */
  if (AVID.needMidMarker() || AVID.needAllMidMarkers())
    AVID.midpoint = AVID.calculateMidpointAxes();

  /*
   * When running in the "Android browser", the pre-Chrome web browser used
   * by Android apps prior to the "KitKat" version, the SVG handling is
   * not what it should be. After repositioning, fragments of previous axis
   * icons remain on the display.  One aspect of coping with this is to hide
   * these icons before repositioning them.
   */
  AVID.hideCurrentAxes();
  AVID.drawCurrentAxes();

  if (AVID.needMidMarker())
    AVID.drawAxis(AVID.midpoint, AVID.NOSE, AVID.MID);
  else
    AVID.hideAxis(AVID.MID);

  if (AVID.needAllMidMarkers())
    AVID.drawMidpointAxes();
  else
    AVID.hideMidpointAxes();

  AVID.showStatusMessage("Pivots: " + AVID.pivots.length + ", Rolls: " + AVID.rolls.length);

  AVID.hideAllEventCircles();
  AVID.hideBreadcrumbs();

  if (AVID.avidFunction === AVID.HELM) {
    AVID.showUndoEventCircles();
    AVID.showMoveEventCircles();
    AVID.showCurrentEventCircles();
    AVID.adjustUndoButton();
    AVID.showBreadcrumbs();
  }

  AVID.showBumperRing();
  BEAR.showTargetBearing();
};

/**
 * Hide each axis of the "current" set of axes.
 */
AVID.hideCurrentAxes = function () {
  AVID.hideAxis(AVID.NOSE);
  AVID.hideAxis(AVID.TAIL);
  AVID.hideAxis(AVID.LEFT);
  AVID.hideAxis(AVID.RIGHT);
  AVID.hideAxis(AVID.TOP);
  AVID.hideAxis(AVID.BOTTOM);
};

/**
 * Show each axis of the "current" set of axes.
 */
AVID.drawCurrentAxes = function () {
  AVID.drawAxis(AVID.current, AVID.NOSE, AVID.NOSE);
  AVID.drawAxis(AVID.current, AVID.TAIL, AVID.TAIL);
  AVID.drawAxis(AVID.current, AVID.LEFT, AVID.LEFT);
  AVID.drawAxis(AVID.current, AVID.RIGHT, AVID.RIGHT);
  AVID.drawAxis(AVID.current, AVID.TOP, AVID.TOP);
  AVID.drawAxis(AVID.current, AVID.BOTTOM, AVID.BOTTOM);
};

/**
 * Show the full set of midpoint axes.
 */
AVID.drawMidpointAxes = function () {
  AVID.drawAxis(AVID.midpoint, AVID.NOSE, AVID.MIDNOSE);
  AVID.drawAxis(AVID.midpoint, AVID.TAIL, AVID.MIDTAIL);
  AVID.drawAxis(AVID.midpoint, AVID.LEFT, AVID.MIDLEFT);
  AVID.drawAxis(AVID.midpoint, AVID.RIGHT, AVID.MIDRIGHT);
  AVID.drawAxis(AVID.midpoint, AVID.TOP, AVID.MIDTOP);
  AVID.drawAxis(AVID.midpoint, AVID.BOTTOM, AVID.MIDBOTTOM);
};

/**
 * Show and hide the icons for a single axis.
 *
 * "axes" is a reference like AVID.current or AVID.midpoint.
 *
 * "axisName" is one of the pre-defined names, such as "NOSE".
 *
 * "iconName" is one of the pre-defined names for an icon, such as "NOSE".
 */
AVID.drawAxis = function (axes, axisName, iconName) {

  /*
   * Get this axis from the "axes" object and extract its latitude.
   * The latitude will tell whether to hide or show the upper-hemisphere
   * and lower-hemisphere ("circled") icons.
   */
  var axis = axes[axisName];
  var axisLatitude = AVID.getLatitudeFromWindowId(axis.windowId);

  /*
   * The lower-hemisphere icon always has a "Circle" suffix.
   * The upper-hemisphere icon has no suffix, except perhaps for the nose icon.
   *
   * The nose not only shows its position but must indicate the constraining hemisphere.
   * If not in the desired hemisphere the user must move the pointer to the bumper ring.
   * This behavior means that a nose axis with (isUpperHemisphere = false) must always
   * show its circle, even when the icon is in the amber ring.
   */
  var isMidpoint = iconName.indexOf("MID") !== -1;
  var iconShowName = AVID.icons[iconName];

  if (axisName === AVID.NOSE) {
    iconShowName += axis.isUpperHemisphere ? "" : "Circle";
  } else {
    iconShowName += AVID.isLatitudeAmber(axisLatitude) || axis.isUpperHemisphere ? "" : "Circle";
  }

  var iconShow = document.getElementById(iconShowName);
  // TODO: JPM: See below for another explanation.
//    iconShow.setAttribute("visibility", "visible");

  if (AVID.isWindowPole(axis.windowId)) {

    /*
     * The only place where two icons occupy the same window is at the pole.
     * The upper-hemisphere icon is positioned to the upper-left at full size.
     * The lower-hemisphere icon is positioned to the lower-right at reduced size (viewBox).
     */
    var window;

    if (iconName === AVID.MID) {

      // The 21 and 4 are ad-hoc amounts to offset the diminutive "MID" icon.
      window = AVID.windows[axis.windowId];
      iconShow.setAttribute("x", parseInt(window.x, 10) + 21);
      iconShow.setAttribute("y", parseInt(window.y, 10) - 4);
      document.getElementById(iconShowName + "G").setAttribute("transform", AVID.getRotateCmd(axes, AVID.NOSE));
    } else if (isMidpoint && axis.isUpperHemisphere) {

      // North pole for a midpoint icon.
      var offsetX;
      var offsetY;

      if (AVID.pointsAtCurrentAxisWindow(axis.windowId)) {
        offsetX = 21
        offsetY = -4;
      } else {
        offsetX = 6.5;
        offsetY = 6.5;
      }

      window = AVID.windows[AVID.POLE_NORTH];
      iconShow.setAttribute("x", parseInt(window.x, 10) + offsetX);
      iconShow.setAttribute("y", parseInt(window.y, 10) + offsetY);

      if (axisName !== AVID.NOSE)
        document.getElementById(iconShowName + "G").setAttribute("transform", AVID.getRotateCmd(axes, AVID.NOSE));

    } else if (axis.isUpperHemisphere) {

      // North pole for an endpoint icon.
      iconShow.removeAttribute("viewBox");
      window = AVID.windows[AVID.POLE_NORTH];
      iconShow.setAttribute("x", window.x);
      iconShow.setAttribute("y", window.y);

      if (axisName !== AVID.NOSE)
        document.getElementById(iconShowName + "G").setAttribute("transform", AVID.getRotateCmd(axes, AVID.NOSE));

    } else if (isMidpoint) {

      // South pole for a midpoint icon.
      var offsetX;
      var offsetY;

      if (AVID.pointsAtCurrentAxisWindow(axis.windowId)) {
        offsetX = -14
        offsetY = 9;
      } else {
        offsetX = 1;
        offsetY = 1;
      }

      window = AVID.windows[AVID.POLE_SOUTH];
      iconShow.setAttribute("x", parseInt(window.x, 10) + offsetX);
      iconShow.setAttribute("y", parseInt(window.y, 10) + offsetY);

      if (axisName !== AVID.NOSE)
        document.getElementById(iconShowName + "G").setAttribute("transform", AVID.getRotateCmd(axes, AVID.NOSE));

    } else {

      // South pole for an endpoint icon.
      iconShow.setAttribute("viewBox", AVID.SHRINK_ICON);
      window = AVID.windows[AVID.POLE_SOUTH];
      iconShow.setAttribute("x", window.x);
      iconShow.setAttribute("y", window.y);

      if (axisName !== AVID.NOSE)
        document.getElementById(iconShowName + "G").setAttribute("transform", AVID.getRotateCmd(axes, AVID.NOSE));

    }

    // Preserve this for use with bearing page.  Use the nominal pole window, not the adjusted ones for north/south.
    iconShow.setAttribute("windowId", AVID.POLE);
  } else {

    if (iconName === AVID.MID) {

      /*
       * The 21 and 4 are ad-hoc amounts to offset the diminutive "MID" icon.
       *
       * The "MID" icon should point to the bumper ring from its window.
       * It works much like the NOSE window does, so that name is used in getRotateCmd().
       */
      iconShow.setAttribute("x", parseInt(AVID.windows[axis.windowId].x, 10) + 21);
      iconShow.setAttribute("y", parseInt(AVID.windows[axis.windowId].y, 10) - 4);
      document.getElementById(iconShowName + "G").setAttribute("transform", AVID.getRotateCmd(axes, AVID.NOSE));
    } else if (isMidpoint) {

      /*
       * This is a non-pole midpoint window.  It needs to be smaller,
       * and keep its built-in "viewBox" attribute.
       *
       * When the midpoint icon is by itself it centers itself in the window.
       * This requires a uniform (both X and Y) offset.
       *
       * When the midpoint icon shares the window with the "current" icon
       * then hover the midpoint icon on a shoulder of the "current" icon.
       *
       * The icon must also point radially from the circle's center.  The transform accomplishes this.
       */
      var offsetX;
      var offsetY;

      if (AVID.pointsAtCurrentAxisWindow(axis.windowId)) {
        offsetX = 16
        offsetY = -2;
      } else {
        offsetX = 6.5;
        offsetY = 6.5;
      }

      iconShow.setAttribute("x", parseInt(AVID.windows[axis.windowId].x, 10) + offsetX);
      iconShow.setAttribute("y", parseInt(AVID.windows[axis.windowId].y, 10) + offsetY);
      document.getElementById(iconShowName + "G").setAttribute("transform", AVID.getRotateCmd(axes, axisName));
    } else {

      /*
       * This is a non-pole endpoint window.  Ensure the icon is displayed
       * full-size through removing the "viewBox" attribute.
       *
       * The icon is shown at the normal centered (x, y) coordinates.
       * It must also point radially from the circle's center.  The transform accomplishes this.
       *
       * NOTE:  For a while, I have had this point relative to the nose.  The getRotateCmd() would get the nose window ID.
       * I've transitioned to having the top star point face the bumper ring and the right point so its right side faces the bumper ring.
       */
      iconShow.removeAttribute("viewBox");
      iconShow.setAttribute("x", AVID.windows[axis.windowId].x);
      iconShow.setAttribute("y", AVID.windows[axis.windowId].y);
      document.getElementById(iconShowName + "G").setAttribute("transform", AVID.getRotateCmd(axes, axisName));
    }

    iconShow.setAttribute("windowId", axis.windowId);
  }

  /*
   * In an effort to cope with a display problem with the original Android browser,
   * in the Android versions prior to KitKat (4.4), I've taken to hiding the icons
   * prior to moving them around.  Redisplay them as late as possible.
   *
   * This display problem occurs only in these circumstances:
   * * Performing the "fix AVID" function.
   * * The Bottom (anchor) icon is in A amber.
   * * Move the nose to some position that makes the Bottom anchor move to F/A amber or A/B amber.
   *
   * When that happens the anchor leaves bits of itself still displayed.
   * Curiously, the screen refresh seems to erase everything at the new Bottom
   * position and lower on the page.
   */
  iconShow.setAttribute("visibility", "visible");

  /*
   * The window for this axis might have changed hemispheres in this move.
   * Always hide the unused icon.
   */
  var iconHideName = AVID.icons[iconName];

  if (axisName === AVID.NOSE) {
    iconHideName += axis.isUpperHemisphere ? "Circle" : "";
  } else {
    iconHideName += AVID.isLatitudeAmber(axisLatitude) || axis.isUpperHemisphere ? "Circle" : "";
  }

  document.getElementById(iconHideName).setAttribute("visibility", "hidden");
};

/**
 * Hide each axis icon for the midpoint icon set.
 */
AVID.hideMidpointAxes = function () {
  AVID.hideAxis(AVID.MIDNOSE);
  AVID.hideAxis(AVID.MIDTAIL);
  AVID.hideAxis(AVID.MIDLEFT);
  AVID.hideAxis(AVID.MIDRIGHT);
  AVID.hideAxis(AVID.MIDTOP);
  AVID.hideAxis(AVID.MIDBOTTOM);
};

/**
 * Hide all midpoint axis icons.
 */
AVID.hideAllMidpointAxes = function () {
  AVID.hideAxis(AVID.MID);
  AVID.hideMidpointAxes();
}

/**
 * Hide a set of axis icons.  Work on both of the upper and lower hemisphere versions.
 *
 * "iconName" is the base name for the icon, such as "iconMid".
 */
AVID.hideAxis = function (iconName) {
  var iconShowName = AVID.icons[iconName];
  document.getElementById(iconShowName).setAttribute("visibility", "hidden");
  document.getElementById(iconShowName + "Circle").setAttribute("visibility", "hidden");
};

/**
 * Calculate the transform command that properly rotates the icon for its window.
 */
AVID.getRotateCmd = function (axes, axisName) {
  var axisDegrees;

  // The logic here is ad-hoc, what appears best on the AVID.
  if (axisName === AVID.NOSE || axisName === AVID.TAIL) {
    axisDegrees = AVID.getDegreesFromWindowId(axes[AVID.NOSE].windowId);
  } else if (axisName === AVID.LEFT || axisName === AVID.RIGHT) {

    var adj = AVID.isWindowPole(axes[AVID.RIGHT].windowId) ? 0 : -90;
    axisDegrees = AVID.getDegreesFromWindowId(axes[AVID.RIGHT].windowId) + adj;

    if (axisDegrees < 0)
      axisDegrees += 360;

  } else if (axisName === AVID.TOP || axisName === AVID.BOTTOM) {
    axisDegrees = AVID.getDegreesFromWindowId(axes[AVID.TOP].windowId);
  }

  return "rotate(" + axisDegrees + " " + AVID.iconOffset + " " + AVID.iconOffset + ")";
};

/**
 * Is this window in the amber ring?
 *
 * Determine by an ID naming convention.
 */
AVID.isWindowAmber = function (windowId) {
  return AVID.isLatitudeAmber(AVID.getLatitudeFromWindowId(windowId));
};

/**
 * Is this window in the blue ring?
 *
 * Determine by an ID naming convention.
 */
AVID.isWindowBlue = function (windowId) {
  return AVID.isLatitudeBlue(AVID.getLatitudeFromWindowId(windowId));
};

/**
 * Is this window in the green ring?
 *
 * Determine by an ID naming convention.
 */
AVID.isWindowGreen = function (windowId) {
  return AVID.isLatitudeGreen(AVID.getLatitudeFromWindowId(windowId));
};

/**
 * Is this window a pole?
 *
 * Determine by an ID naming convention.
 */
AVID.isWindowPole = function (windowId) {
  return AVID.isLatitudePurple(AVID.getLatitudeFromWindowId(windowId));
};

/**
 * Is this latitude in the amber ring?
 *
 * Extract the latitude from the window ID.
 */
AVID.isLatitudeAmber = function (latitude) {

  /*
   * Here and elsewhere:
   * The AVID window and latitude calculators have been used by the fishbowl functions, too.
   * In there the window prefixes are "u" and "d", while for the AVID they are only "a".
   * The substring() calls step around this troublesome prefix.
   */
  return latitude.substring(1, 2) === AVID.AMBER.substring(1, 2);
};

/**
 * Is this latitude in the blue ring?
 *
 * Extract the latitude from the window ID.
 */
AVID.isLatitudeBlue = function (latitude) {
  return latitude.substring(1, 2) === AVID.BLUE.substring(1, 2);
};

/**
 * Is this latitude in the green ring?
 *
 * Extract the latitude from the window ID.
 */
AVID.isLatitudeGreen = function (latitude) {
  return latitude.substring(1, 2) === AVID.GREEN.substring(1, 2);
};

/**
 * Is this latitude in the purple (pole) ring?
 *
 * Extract the latitude from the window ID.
 */
AVID.isLatitudePurple = function (latitude) {
  return latitude.substring(1, 2) === AVID.PURPLE.substring(1, 2);
};

/**
 * Is the requested axis on a green ring spine?
 */
AVID.isAxisGreenSpine = function (windowId) {

  if (!AVID.isWindowGreen(windowId))
    return false;

  return AVID.getDegreesFromWindowId(windowId) % 60 === 30;
};

/**
 * Hide all of the event circles.  Easier than chasing down just those that are displayed.
 */
AVID.hideAllEventCircles = function () {
  AVID.hideAllEventCirclesInBand(AVID.AMBER);
  AVID.hideAllEventCirclesInBand(AVID.BLUE);
  AVID.hideAllEventCirclesInBand(AVID.GREEN);
  document.getElementById("a90.pol").style.visibility = "hidden";
};

AVID.hideAllEventCirclesInBand = function (bandName) {
  var degreesLen = AVID.degrees.length;
  var windowId;

  for (var idx = 0; idx < degreesLen; idx++) {
    document.getElementById(bandName + "." + AVID.degrees[idx]).style.visibility = "hidden";
  }

};

AVID.showUndoEventCircles = function () {

  if (AVID.avidMovementMode === AVID.PIVOT)
    AVID.showPivotUndoEventCircles();
  else if (AVID.avidMovementMode === AVID.ROLL)
    AVID.showRollUndoEventCircles();

};

AVID.showPivotUndoEventCircles = function () {
  var pivotsLen = AVID.pivots.length;

  if (pivotsLen > 0) {
    var ele = document.getElementById(AVID.pivots[pivotsLen - 1].NOSE.windowId);
    ele.style.visibility = "visible";
    ele.style.stroke = AVID.undoColor.stroke;
    ele.style.strokeOpacity = AVID.undoColor.strokeOpacity;
    ele.style.fill = AVID.undoColor.fill;
    ele.style.fillOpacity = AVID.undoColor.fillOpacity;
  }

};

AVID.showRollUndoEventCircles = function () {
  var rollsLen = AVID.rolls.length;

  if (rollsLen > 0) {

    /*
     * A roll may be done from any available upper-hemisphere axes (marker).
     * An undo can be done from a different marker.  This means that each
     * axes could show an undo event circle.
     */
    AVID.showRollUndoEventCircle(AVID.LEFT);
    AVID.showRollUndoEventCircle(AVID.RIGHT);
    AVID.showRollUndoEventCircle(AVID.TOP);
    AVID.showRollUndoEventCircle(AVID.BOTTOM);
  }

};

AVID.showRollUndoEventCircle = function (axisName) {

  /*
   * An undo event circle will be shown if the marker is upper hemisphere.
   * In addition, the "current" marker must also be upper hemisphere.
   */
  var mostRecentRollUndo = AVID.rolls[AVID.rolls.length - 1];
  var mostRecentNamedAxis = mostRecentRollUndo[axisName];
  var currentNamedAxis = AVID.current[axisName];

  if ((mostRecentNamedAxis.isUpperHemisphere || AVID.isWindowAmber(mostRecentNamedAxis.windowId))
    && (currentNamedAxis.isUpperHemisphere || AVID.isWindowAmber(currentNamedAxis.windowId))) {
    var ele = document.getElementById(mostRecentNamedAxis.windowId);
    ele.style.visibility = "visible";
    ele.style.stroke = AVID.undoColor.stroke;
    ele.style.strokeOpacity = AVID.undoColor.strokeOpacity;
    ele.style.fill = AVID.undoColor.fill;
    ele.style.fillOpacity = AVID.undoColor.fillOpacity;
  }

};

AVID.showMoveEventCircles = function () {

  if (AVID.avidMovementMode === AVID.PIVOT)
    AVID.showPivotMoveEventCircles();
  else if (AVID.avidMovementMode === AVID.ROLL)
    AVID.showRollMoveEventCircles();

};

/**
 * Calculate and display the pivot event circles for every valid move and undo.
 */
AVID.showPivotMoveEventCircles = function () {

  // Nothing to do if already pivoted to the limits of the ship.
  var pivotsLen = AVID.pivots.length;

  if (pivotsLen >= AVID.maxPivots && !AVID.isAdjustingShipOrientation)
    return;

  /*
   * Don't show an event circle for an invalid move.  This means:
   * * If the window has been visited before then a pivot can't go there again.
   * * If two diagonals have already been done then no more diagonals.
   * * If one diagonal has been done then the move being marked must be the
   *   second consecutive diagonal, crossing the amber ring, in a great circle route.
   *
   * In the case of non-consecutive diagonals, must ask all of the pivots[] about the diagonal.
   */
  var cntDiagonals = (AVID.current && AVID.current.wasDiagonal) ? 1 : 0;

  for (var idx = 0; idx < pivotsLen; idx++) {

    if (AVID.pivots[idx].wasDiagonal)
      cntDiagonals++;

  }

  // Was the previous move a diagonal?  If there is no history in pivots[] then fake it.
  var diagonalPrev = (pivotsLen === 0) ? {isDiagonal: false} : AVID.whichDiagonal(AVID.pivots[pivotsLen - 1], AVID.current);

  /*
   * The "neighbors" list contains windows adjacent to the selected window.  If the selected window is
   * in the amber band the blue-band neighbor windows might be in either hemisphere.  The program must
   * calculate the hemisphere to work with.
   */
  var currentNoseWindow = AVID.getCurrentNose();
  var neighbors = AVID.windows[currentNoseWindow.windowId].neighbors;
  var neighborsLen = neighbors ? neighbors.length : 0;
  var neighbor;
  var neighborWindowId;

  /*
   * The path the nose is plotted in a turn might include windows on both the upper and lower hemispheres.
   * Note that a non-amber window might have already been visited in one hemisphere and its opposite-hemisphere
   * partner would still be eligible for the nose to visit.
   *
   * When the nose is changing hemispheres the "current" nose must already be in the amber ring.  This is the
   * only way that (wasBumper = TRUE).  Also note that if the bumper ring were hit the "current" nose doesn't
   * yet have its "isUpperHemisphere" reflecting that other hemisphere.  That data change doesn't occur until
   * a destination window event circle is hit.  Until then the "wasBumper" holds the intent to change hemispheres.
   */
  var neighborIsUpperHemisphere = currentNoseWindow.isUpperHemisphere;

  if (AVID.wasBumper)
    neighborIsUpperHemisphere = !neighborIsUpperHemisphere;

  var alreadyVisited;
  var allowDiagonal;
  var diagonalThis;
  var ele;

  for (var nIdx = 0; nIdx < neighborsLen; nIdx++) {
    neighbor = {windowId: neighbors[nIdx], isUpperHemisphere: neighborIsUpperHemisphere};
    neighborWindowId = neighbor.windowId;

    // Has this window already been visited?  This also ensures we don't overwrite the "undo" event circle.
    alreadyVisited = false;

    for (var pIdx = 0; pIdx < pivotsLen; pIdx++) {

      if (neighborWindowId === AVID.pivots[pIdx].NOSE.windowId
        && (neighborIsUpperHemisphere === AVID.pivots[pIdx].NOSE.isUpperHemisphere || AVID.isWindowAmber(neighborWindowId))) {
        alreadyVisited = true;
        break;
      }

    }

    if (alreadyVisited)
      continue;

    /*
     * Don't show an event circle for an invalid diagonal.  This means:
     * * If no diagonal so far, OK.
     * * If one diagonal so far, the "current" axes must have been that diagonal.
     *   Test that these two diagonals form a great circle route crossing the amber ring.
     * * If two diagonals so far then we've seen enough.
     */
    allowDiagonal = (cntDiagonals === 0 || (cntDiagonals === 1 && diagonalPrev.isDiagonal));
    var thisAxes = [];
    thisAxes[AVID.NOSE] = neighbor;
    diagonalThis = AVID.whichDiagonal(AVID.current, thisAxes);

    if (diagonalThis.isDiagonal && !allowDiagonal)
      continue;

    /*
     * Either this is not a diagonal, or it is and diagonals are allowed.
     *
     * If both are diagonals (in which case diagonals are allowed) then they must be in the same direction (great circle).
     */
    if (diagonalPrev.isDiagonal && diagonalThis.isDiagonal) {

      if (!(diagonalPrev.isRising === diagonalThis.isRising && diagonalPrev.isClockwise === diagonalThis.isClockwise))
        continue;

    }

    ele = document.getElementById(neighborWindowId);
    ele.style.visibility = "visible";
    ele.style.stroke = AVID.moveColor.stroke;
    ele.style.strokeOpacity = AVID.moveColor.strokeOpacity;
    ele.style.fill = AVID.moveColor.fill;
    ele.style.fillOpacity = AVID.moveColor.fillOpacity;
  }

};

/**
 * Calculate and display the roll event circles for every valid move and undo.
 */
AVID.showRollMoveEventCircles = function () {

  // Nothing to do if already rolled to the limits of the ship.
  var rollsLen = AVID.rolls.length;

  if (rollsLen >= AVID.maxRolls && !AVID.isAdjustingShipOrientation)
    return;

  /*
   * Determine the direction of "increasing rolls" along the great circle.
   * Figure this by measuring how to go from the most-recent rolls[] position
   * to "current".
   *
   * If there is no rolls[] history then both roll directions represent advancing.
   *
   * When travelling counterclockwise on the great circle the indexes increase.
   */
  var progressDiffIdx = 0;
  var gcWindows = AVID.transformGreatCircle(AVID.getCurrentNose());

  if (rollsLen > 0) {
    var prevLeftWindowId = AVID.rolls[rollsLen - 1].LEFT.windowId;
    var prevLeftIsUpperHemisphere = AVID.rolls[rollsLen - 1].LEFT.isUpperHemisphere;
    var currentLeftWindowId = AVID.current.LEFT.windowId;
    var currentLeftIsUpperHemisphere = AVID.current.LEFT.isUpperHemisphere;

    var gcLen = gcWindows.length;
    var gcWindowId;

    var prevLeftIdx = -1;
    var currentLeftIdx = -1;

    for (var gcIdx = 0; gcIdx < gcLen; gcIdx++) {
      gcWindowId = gcWindows[gcIdx].windowId;
      gcIsUpperHemisphere = gcWindows[gcIdx].isUpperHemisphere;

      if (gcWindowId === prevLeftWindowId && gcIsUpperHemisphere === prevLeftIsUpperHemisphere)
        prevLeftIdx = gcIdx;

      if (gcWindowId === currentLeftWindowId && gcIsUpperHemisphere === currentLeftIsUpperHemisphere)
        currentLeftIdx = gcIdx;

      // Guaranteed to be true *sometime*, as all possible windows are being examined.
      if (prevLeftIdx !== -1 && currentLeftIdx !== -1)
        break;

    }

    /*
     * The indices jump from 11 to 0 when going clockwise, vice-versa CCW.  Adjust for that boundary.
     *
     * This *looks* the same as wrapping for the bounds of a list, but this adjusts instead for an index bump.
     * For example, it translates -11 to +1.
     */
    progressDiffIdx = currentLeftIdx - prevLeftIdx;

    if (progressDiffIdx < -1)
      progressDiffIdx += gcLen;
    else if (progressDiffIdx > 1)
      progressDiffIdx -= gcLen;

  }

  /*
   * Apply the findings to each possible roll axis.  The showRollMarkerEventCircles() function
   * is smart enough to stay on the great circle, mark only the upper hemisphere and decide if
   * one direction or both directions need to be marked.
   *
   * If (progressDiffIdx = 0) then both directions can be marked.
   */
  AVID.showRollMarkerEventCircles(gcWindows, AVID.LEFT, progressDiffIdx);
  AVID.showRollMarkerEventCircles(gcWindows, AVID.RIGHT, progressDiffIdx);
  AVID.showRollMarkerEventCircles(gcWindows, AVID.TOP, progressDiffIdx);
  AVID.showRollMarkerEventCircles(gcWindows, AVID.BOTTOM, progressDiffIdx);
};

/**
 * Mark the event circles for the "current" position, for this named axis.
 */
AVID.showRollMarkerEventCircles = function (gcWindows, axisName, progressDiffIdx) {

  // Get the window ID for the axis name.
  var currentAxisWindowId = AVID.current[axisName].windowId;
  var currentAxisIsUpperHemisphere = AVID.current[axisName].isUpperHemisphere;
  var gcLen = gcWindows.length;
  var gcWindow;
  var axisIdx = -1;

  for (var gcIdx = 0; gcIdx < gcLen; gcIdx++) {
    gcWindow = gcWindows[gcIdx];

    if (gcWindow.windowId === currentAxisWindowId && gcWindow.isUpperHemisphere === currentAxisIsUpperHemisphere) {
      axisIdx = gcIdx;
      break;
    }

  }

  // Don't activate a marker in the lower hemisphere blue, green or pole.
  if (!(gcWindows[axisIdx].isUpperHemisphere || AVID.isWindowAmber(gcWindows[axisIdx].windowId)))
    return;

  /*
   * Rolling further is "progIdx".  Undoing a roll is "undoIdx".
   *
   * If (progressDiffIdx = 0) then there is no undo history and the undo
   * direction is a possible "progress" direction.  It also means that
   * the progress quantity of one must be forced into the calculations.
   */
  var diffIdx = progressDiffIdx === 0 ? 1 : progressDiffIdx;
  var progIdx = AVID.adjustListIdx(axisIdx, gcLen, diffIdx);
  var undoIdx = AVID.adjustListIdx(axisIdx, gcLen, -diffIdx);
  var ele;

  var progWindow = gcWindows[progIdx];

  if (progWindow.isUpperHemisphere || AVID.isWindowAmber(progWindow.windowId)) {
    ele = document.getElementById(progWindow.windowId);
    ele.style.visibility = "visible";
    ele.style.stroke = AVID.moveColor.stroke;
    ele.style.strokeOpacity = AVID.moveColor.strokeOpacity;
    ele.style.fill = AVID.moveColor.fill;
    ele.style.fillOpacity = AVID.moveColor.fillOpacity;
  }

  progWindow = gcWindows[undoIdx];

  if (progressDiffIdx === 0 && (progWindow.isUpperHemisphere || AVID.isWindowAmber(progWindow.windowId))) {
    ele = document.getElementById(progWindow.windowId);
    ele.style.visibility = "visible";
    ele.style.stroke = AVID.moveColor.stroke;
    ele.style.strokeOpacity = AVID.moveColor.strokeOpacity;
    ele.style.fill = AVID.moveColor.fill;
    ele.style.fillOpacity = AVID.moveColor.fillOpacity;
  }

};

AVID.showCurrentEventCircles = function () {

  if (AVID.avidMovementMode === AVID.PIVOT)
    AVID.showPivotCurrentEventCircles();
  else if (AVID.avidMovementMode === AVID.ROLL)
    AVID.showRollCurrentEventCircles();

};

/**
 * Display an event circle for the "current" pointer's nose..
 */
AVID.showPivotCurrentEventCircles = function () {
  var ele = document.getElementById(AVID.getCurrentNoseWindowId());
  ele.style.visibility = "visible";
  ele.style.stroke = AVID.currentColor.stroke;
  ele.style.strokeOpacity = AVID.currentColor.strokeOpacity;
  ele.style.fill = AVID.currentColor.fill;
  ele.style.fillOpacity = AVID.currentColor.fillOpacity;
};

/**
 * Display each eligible roll event circle for the "current" position.
 */
AVID.showRollCurrentEventCircles = function () {
  AVID.showRollCurrentEventCircle(AVID.LEFT);
  AVID.showRollCurrentEventCircle(AVID.RIGHT);
  AVID.showRollCurrentEventCircle(AVID.TOP);
  AVID.showRollCurrentEventCircle(AVID.BOTTOM);
};

AVID.showRollCurrentEventCircle = function (axisName) {
  var currentNamedAxis = AVID.current[axisName];

  if (currentNamedAxis.isUpperHemisphere || AVID.isWindowAmber(currentNamedAxis.windowId)) {
    var ele = document.getElementById(currentNamedAxis.windowId);
    ele.style.visibility = "visible";
    ele.style.stroke = AVID.currentColor.stroke;
    ele.style.strokeOpacity = AVID.currentColor.strokeOpacity;
    ele.style.fill = AVID.currentColor.fill;
    ele.style.fillOpacity = AVID.currentColor.fillOpacity;
  }

};

/**
 * Show selected breadcrumbs.
 */
AVID.showBreadcrumbs = function () {
  AVID.movePivotCrumbs();
  AVID.moveRollCrumbs();
};

/**
 * Hide all of the breadcrumbs.
 */
AVID.hideBreadcrumbs = function () {
  AVID.hidePivotCrumbs();
  AVID.hideRollCrumbs();
};

/**
 * Hide all of the pivot breadcrumbs.
 */
AVID.hidePivotCrumbs = function () {

  /*
   * Need to hide all of the pivotCrumbs[] list, as the pivots[] list might have shrunk.
   */
  var lenCrumbs = AVID.pivotCrumbs.length;
  var crumb;

  for (var idx = 0; idx < lenCrumbs; idx++) {
    crumb = AVID.pivotCrumbs[idx];
    AVID.hideElement(crumb.iconU);
    AVID.hideElement(crumb.iconUBR);
    AVID.hideElement(crumb.iconD);
    AVID.hideElement(crumb.iconDBR);
  }

};

/**
 * Hide all of the roll breadcrumbs.
 */
AVID.hideRollCrumbs = function () {

  /*
   * Need to hide all of the rollCrumbs[] list, as the rolls[] list might have shrunk.
   */
  var lenCrumbs = AVID.rollCrumbs.length;
  var crumb;

  for (var idx = 0; idx < lenCrumbs; idx++) {
    crumb = AVID.rollCrumbs[idx];
    AVID.hideElement(crumb);
  }

};

/**
 * Add a crumb to the pivotCrumbs list.
 *
 * The icon names are *very* tied to the names in this function!
 */
AVID.addPivotCrumb = function (idxCrumb) {
  var parent = document.getElementById("avidIcons");
  var namePrefix = "iconCrumbP";
  var namePrefixU = namePrefix + "U";
  var namePrefixD = namePrefix + "D";

  var iconU = document.getElementById(namePrefixU).cloneNode(true);
  var newId = namePrefixU + idxCrumb;
  iconU.setAttribute("id", newId);
  var iconUG = iconU.getElementsByTagName("g")[0];
  iconUG.setAttribute("id", newId + "G");
  parent.appendChild(iconU);

  var iconUBR = document.getElementById(namePrefixU + "BR").cloneNode(true);
  newId = namePrefixU + "BR" + idxCrumb;
  iconUBR.setAttribute("id", newId);
  var iconUBRG = iconUBR.getElementsByTagName("g")[0];
  iconUBRG.setAttribute("id", newId + "G");
  parent.appendChild(iconUBR);

  var iconD = document.getElementById(namePrefixD).cloneNode(true);
  newId = namePrefixD + idxCrumb;
  iconD.setAttribute("id", newId);
  var iconDG = iconD.getElementsByTagName("g")[0];
  iconDG.setAttribute("id", newId + "G");
  parent.appendChild(iconD);

  var iconDBR = document.getElementById(namePrefixD + "BR").cloneNode(true);
  newId = namePrefixD + "BR" + idxCrumb;
  iconDBR.setAttribute("id", newId);
  var iconDBRG = iconDBR.getElementsByTagName("g")[0];
  iconDBRG.setAttribute("id", newId + "G");
  parent.appendChild(iconDBR);

  AVID.pivotCrumbs[idxCrumb] = {iconU: iconU, iconUBR: iconUBR, iconD: iconD, iconDBR: iconDBR};
};

/**
 * Add a crumb to "rollCrumbs".
 *
 * The icon names are *very* tied to the names in this function!
 */
AVID.addRollCrumb = function (idxCrumb) {
  var parent = document.getElementById("avidIcons");
  var namePrefixU = "iconCrumbRU";

  var iconU = document.getElementById(namePrefixU).cloneNode(true);
  var newId = namePrefixU + idxCrumb;
  iconU.setAttribute("id", newId);
  var iconUG = iconU.getElementsByTagName("g")[0];
  iconUG.setAttribute("id", newId + "G");
  parent.appendChild(iconU);

  AVID.rollCrumbs[idxCrumb] = iconU;
};

/**
 * Show all required pivot crumbs, depending on the list position and its neighbors.
 */
AVID.movePivotCrumbs = function () {

  /*
   * The pivotCrumbs[] list might have extra elements beyond the pivots[] list.
   * This leads to an inaccurate number of crumbs being used.
   */
  var lenPivots = AVID.pivots.length;

  if (lenPivots === 0)
    return;

  var startNose;
  var endNose;
  var crumbDegrees;
  var startIsUpperHemisphere;
  var endIsUpperHemisphere;
  var ele;
  var crumb;
  var iconCrumb;

  for (var idxPivot = 0; idxPivot < lenPivots; idxPivot++) {
    startNose = AVID.pivots[idxPivot][AVID.NOSE];
    endNose = (idxPivot + 1) === lenPivots ? AVID.current[AVID.NOSE] : AVID.pivots[idxPivot + 1][AVID.NOSE];
    crumbDegrees = AVID.calculateAngle(startNose.windowId, endNose.windowId);

    /*
     * Suppose a user has the nose on an amber window and moves the nose to another window
     * by way of the bumper ring. The "current" nose is on that new window and the amber window
     * just vacated gets crumb icon.
     * * The bumper ring was used, and the crumb icon in the amber window gets the bumper ring version.
     * * The hemisphere the nose was while on the amber window is used for the crumb icon.
     *
     * For example, if an upper-hemisphere nose is moved, using a bumper ring, to a lower-hemisphere
     * blue window then the icon in the amber window is for an upper-hemisphere bumper ring.  The
     * first point the lower-hemisphere crumb icon occurs is if the nose is moved to another window.
     */
    startIsUpperHemisphere = startNose.isUpperHemisphere;
    endIsUpperHemisphere = endNose.isUpperHemisphere;

    ele = document.getElementById("svg" + startNose.windowId.substring(1));

    if (ele) {

      // The pivots[] and pivotCrumbs[] lists have equivalent elements for the same index value.
      crumb = AVID.pivotCrumbs[idxPivot];

      if (startIsUpperHemisphere) {
        iconCrumb = (startIsUpperHemisphere === endIsUpperHemisphere) ? crumb.iconU : crumb.iconUBR;
      } else {
        iconCrumb = (startIsUpperHemisphere === endIsUpperHemisphere) ? crumb.iconD : crumb.iconDBR;
      }

      /*
       * The crumb is placed so its center falls at the center of the window.
       * It rotates about its center.  The crumb has dimensions of 20 x 20
       * while the event circle, which is "ele" has 33 x 33.  That leads to
       * an offset of 6.5.
       */
      iconCrumb.setAttribute("x", parseInt(ele.getAttribute("x"), 10) + 6.5);
      iconCrumb.setAttribute("y", parseInt(ele.getAttribute("y"), 10) + 6.5);
      document.getElementById(iconCrumb.getAttribute("id") + "G").setAttribute("transform", "rotate(" + crumbDegrees + " 10 10)");

      AVID.showElement(iconCrumb);
    }

  }

};

/**
 * Show all required roll crumbs, depending on the list position and its neighbors.
 */
AVID.moveRollCrumbs = function () {

  /*
   * The rollCrumbs[] list might have extra elements beyond the rolls[] list.
   * This leads to an inaccurate number of crumbs being used.
   */
  var lenCrumbs = AVID.rolls.length;

  if (lenCrumbs === 0)
    return;

  /*
   * The "current" axes remembers in its "diffIdx" attribute whether the progress through
   * the great circle list goes in ascending (counterclockwise, values > 0) or descending
   * (values < 0) order.
   */
  var loopStep = AVID.current.diffIdx > 0 ? 1 : -1;

  /*
   * Find the great circle index, an amber circle, where the first crumb will be placed.
   * It must be one where the correct travel, clockwise or counterclockwise according to
   * AVID.current, will yield upper-hemisphere windows for placement of crumbs.
   *
   * In the correct direction, walk the circle until the lower hemisphere is encountered.
   * Continuing on, go through the lower hemisphere until the first upper hemisphere
   * window is encountered.  That will be an amber window, as all amber windows are
   * considered upper hemisphere.
   *
   * When the Nose is on a pole the great circle is in the Amber ring and never leaves it.
   * Can't use the point of changing hemispheres.  I'd like to put the initial breadcrumb
   * on the Left icon, but that keeps changing windows, making it hard to understand.
   * Settle for using the B/C (90) degrees or D/E window (270 degrees), depending on
   * "loopStep", to keep the roll breadcrumb in the "upper half" of the AVID circle.
   */
  var currentNose = AVID.getCurrentNose();
  var gcWindows = AVID.transformGreatCircle(currentNose);
  var gcLen = gcWindows.length;
  var gcIdx = 0;

  if (AVID.isWindowPole(currentNose.windowId)) {
    var targetDegrees = (loopStep > 0 && currentNose.isUpperHemisphere || loopStep < 0 && !currentNose.isUpperHemisphere) ? 90 : 270;

    while (AVID.getDegreesFromWindowId(gcWindows[gcIdx].windowId) !== targetDegrees) {
      gcIdx = AVID.adjustListIdx(gcIdx, gcLen, loopStep);
    }

  } else {

    while (gcWindows[gcIdx].isUpperHemisphere) {
      gcIdx = AVID.adjustListIdx(gcIdx, gcLen, loopStep);
    }

    while (!gcWindows[gcIdx].isUpperHemisphere) {
      gcIdx = AVID.adjustListIdx(gcIdx, gcLen, loopStep);
    }

  }

  /*
   * The window pointed at by "gcIdx" is the first window on which to put a marker.
   * Because of the way the roll loop works, pointing "nextWindowId" at that window
   * sets up the loop.
   */
  var thisWindowId;
  var nextWindowId = gcWindows[gcIdx].windowId;

  var crumbDegrees;
  var ele;
  var iconCrumb;

  for (var idxRoll = 0; idxRoll < lenCrumbs; idxRoll++) {

    /*
     * Lay the breadcrumbs along the great circle, the path the roll windows themselves take.
     * In this case, the crumbs aren't tracking a particular axis but rather the
     * notion of marking from one edge of the AVID to the other.
     *
     * Ken assures me that no calculation within his games use a roll quantity greater than six (6).
     * Going higher than that would cause the roll breadcrumbs to track to the lower hemisphere,
     * something we're trying to avoid here.
     */
    thisWindowId = nextWindowId;
    gcIdx = AVID.adjustListIdx(gcIdx, gcLen, loopStep);
    nextWindowId = gcWindows[gcIdx].windowId;
    crumbDegrees = AVID.calculateAngle(thisWindowId, nextWindowId);

    ele = document.getElementById("svg" + thisWindowId.substring(1));

    if (ele) {

      // Unlike pivotCrumbs[], the (solitary) roll icon type is stored directly in the array instance.
      iconCrumb = AVID.rollCrumbs[idxRoll];

      /*
       * The crumb is placed so its center falls at the center of the window.
       * It rotates about its center.  The crumb has dimensions of 20 x 20
       * while the event circle, which is "ele" has 33 x 33.  That leads to
       * an offset of 6.5.
       */
      iconCrumb.setAttribute("x", parseInt(ele.getAttribute("x"), 10) + 6.5);
      iconCrumb.setAttribute("y", parseInt(ele.getAttribute("y"), 10) + 6.5);
      document.getElementById(iconCrumb.getAttribute("id") + "G").setAttribute("transform", "rotate(" + crumbDegrees + " 10 10)");

      AVID.showElement(iconCrumb);
    }

  }

};

/**
 * Set the style of an element to show it.
 */
AVID.showElement = function (ele) {
  ele.style.visibility = "visible";
  ele.style.display = "";
};

/**
 * Set the style of an element to hide it.
 */
AVID.hideElement = function (ele) {
  ele.style.visibility = "hidden";
  ele.style.display = "none";
};

/**
 * Extract from a window ID the portion representing the latitude about the AVID circle.
 *
 * It represents a value on the flattened AVID.  It doesn't promise being in either hemisphere.
 */
AVID.getLatitudeFromWindowId = function (windowId) {
  return windowId.substring(0, 3);
};

/**
 * Extract from a window ID the portion representing the angle about the AVID circle.
 *
 * The returned value is an integer.  If a "pole" window ID is passed in, returns 0 degrees.
 */
AVID.getDegreesFromWindowId = function (windowId) {

  if (AVID.isWindowPole(windowId))
    return 0;

  return parseInt(windowId.substring(4), 10);
};

/**
 * Convenience function to turn an integer degrees into a string with three digits.
 */
AVID.getDegreesStringForWindowId = function (degrees) {
  return ("00" + degrees).substr(-3);
};

/**
 * Create a great circle window list that matches the axis passed in.
 */
AVID.transformGreatCircle = function (axis) {

  /*
   * If the nose is in the lower hemisphere then choose a point on the other end of the sphere.
   * The latitude stays in the same band but the degree amount increases by 180 degrees, wrapped around the 360 boundary.
   *
   * We don't want to give back those degrees at the end of the calculations.  The great circle
   * windows are already correct.
   */
  var gcWindowId = axis.windowId;
  var adjustedWindowId = gcWindowId;
  var adjustDegrees = 0;

  if (!AVID.isWindowPole(gcWindowId)) {
    var gcDegrees = AVID.getDegreesFromWindowId(gcWindowId);

    if (!axis.isUpperHemisphere) {
      gcDegrees += 180;

      if (gcDegrees >= 360)
        gcDegrees -= 360;

    }

    /*
     * All of the mapped great circle routes are for the 0 or 30 degree windows of the AVID.
     * This degree marker must be reduced in 60 degree increments until it is either 0 or 30 degrees.
     *
     * The reduction amount will be reapplied to rotate the great circle back to the desired axis.
     */
    adjustDegrees = Math.round(Math.floor(gcDegrees / 60) * 60);
    gcDegrees -= adjustDegrees;

    adjustedWindowId = AVID.getLatitudeFromWindowId(gcWindowId) + "." + AVID.getDegreesStringForWindowId(gcDegrees);
  }

  var gcWindows = AVID.greatCircle[adjustedWindowId];

  if (!gcWindows)
    return null;

  gcWindows = AVID.cloneGreatCircle(gcWindows);

  // The list is selected and cloned.  Rotate its windows back to match the requesting axis.
  var gcLen = gcWindows.length;

  if (adjustDegrees !== 0) {

    for (var idx = 0; idx < gcLen; idx++) {
      gcWindows[idx].windowId = AVID.transformWindowId(gcWindows[idx].windowId, adjustDegrees);
    }

  }

  /*
   * The great circle window lists have counterclockwise progressions.  But when a translation
   * requires using a window ID from the other side of the sphere (adding 180 degrees and changing
   * the hemisphere), the list of windows ends up being a clockwise progression.  This screws up
   * calculating where the "third" axis lies.  Cope with this changing the direction of windows
   * in the cloned great circle list.
   */
  if (!axis.isUpperHemisphere) {
    var adjWindows = [];

    for (var idx = 0, adjIdx = gcLen - 1; idx < gcLen; idx++, adjIdx--) {
      adjWindows[adjIdx] = gcWindows[idx];
    }

    gcWindows = adjWindows;
  }

  return gcWindows;
};

/**
 * Clone the great circle list.  Don't want to edit the prototype.
 */
AVID.cloneGreatCircle = function (oldList) {
  var newList = [];
  var oldObj;
  var newObj;

  for (var key in oldList) {
    oldObj = oldList[key];
    newObj = {};
    newObj.windowId = oldObj.windowId;
    newObj.isUpperHemisphere = oldObj.isUpperHemisphere;
    newList[key] = newObj;
  }

  return newList;
};

/**
 * Perform math on a window ID to change its "degrees" portion.
 *
 * For example, add 120 degrees to "a30.030" to return "a30.150".
 * Shouldn't ever have to add so much so that the value wraps past the 0/360 mark.
 *
 * There is nothing to change on a pole window.
 *
 * "oldId" is the window ID to change.
 */
AVID.transformWindowId = function (oldId, addDegrees) {

  if (AVID.isWindowPole(oldId))
    return oldId;

  var degrees = AVID.getDegreesFromWindowId(oldId) + addDegrees;

  if (degrees >= 360)
    degrees -= 360;

  return AVID.getLatitudeFromWindowId(oldId) + "." + AVID.getDegreesStringForWindowId(degrees);
};

/**
 * If this movement mode needs a mid-pivot marker then say so.
 */
AVID.needMidMarker = function () {
  return AVID.movementModel === AVID.MOVEMENT_MODEL_2;
}

/**
 * If this movement mode needs a mid-pivot marker then say so.
 */
AVID.needAllMidMarkers = function () {
  return AVID.shootBearingsModel === AVID.SHOOT_BEARINGS_MID_END;
}

/**
 * Raise all visible icons to their default color or opacity.
 * The dimAxisMarkerIcons() function messes with them.
 */
AVID.undimAxisMarkerIcons = function () {
  AVID.undimAxisMarkerIcon(AVID.icons[AVID.NOSE]);
  AVID.undimAxisMarkerIcon(AVID.icons[AVID.NOSE] + "Circle");
  AVID.undimAxisMarkerIcon(AVID.icons[AVID.TAIL]);
  AVID.undimAxisMarkerIcon(AVID.icons[AVID.TAIL] + "Circle");
  AVID.undimAxisMarkerIcon(AVID.icons[AVID.TOP]);
  AVID.undimAxisMarkerIcon(AVID.icons[AVID.TOP] + "Circle");
  AVID.undimAxisMarkerIcon(AVID.icons[AVID.BOTTOM]);
  AVID.undimAxisMarkerIcon(AVID.icons[AVID.BOTTOM] + "Circle");
  AVID.undimAxisMarkerIcon(AVID.icons[AVID.LEFT]);
  AVID.undimAxisMarkerIcon(AVID.icons[AVID.LEFT] + "Circle");
  AVID.undimAxisMarkerIcon(AVID.icons[AVID.RIGHT]);
  AVID.undimAxisMarkerIcon(AVID.icons[AVID.RIGHT] + "Circle");
  AVID.undimAxisMarkerIcon(AVID.icons[AVID.MID]);
  AVID.undimAxisMarkerIcon(AVID.icons[AVID.MID] + "Circle");

  if (AVID.shootBearingsModel === AVID.SHOOT_BEARINGS_MID_END) {
    AVID.undimAxisMarkerIcon(AVID.icons[AVID.MIDNOSE]);
    AVID.undimAxisMarkerIcon(AVID.icons[AVID.MIDNOSE] + "Circle");
    AVID.undimAxisMarkerIcon(AVID.icons[AVID.MIDTAIL]);
    AVID.undimAxisMarkerIcon(AVID.icons[AVID.MIDTAIL] + "Circle");
    AVID.undimAxisMarkerIcon(AVID.icons[AVID.MIDTOP]);
    AVID.undimAxisMarkerIcon(AVID.icons[AVID.MIDTOP] + "Circle");
    AVID.undimAxisMarkerIcon(AVID.icons[AVID.MIDBOTTOM]);
    AVID.undimAxisMarkerIcon(AVID.icons[AVID.MIDBOTTOM] + "Circle");
    AVID.undimAxisMarkerIcon(AVID.icons[AVID.MIDLEFT]);
    AVID.undimAxisMarkerIcon(AVID.icons[AVID.MIDLEFT] + "Circle");
    AVID.undimAxisMarkerIcon(AVID.icons[AVID.MIDRIGHT]);
    AVID.undimAxisMarkerIcon(AVID.icons[AVID.MIDRIGHT] + "Circle");
  }

};

/**
 * Dim all visible icons sharing the identified window.
 */
AVID.dimAxisMarkerIcons = function (windowId) {
  AVID.dimAxisMarkerIcon(AVID.icons[AVID.NOSE], windowId);
  AVID.dimAxisMarkerIcon(AVID.icons[AVID.NOSE] + "Circle", windowId);
  AVID.dimAxisMarkerIcon(AVID.icons[AVID.TAIL], windowId);
  AVID.dimAxisMarkerIcon(AVID.icons[AVID.TAIL] + "Circle", windowId);
  AVID.dimAxisMarkerIcon(AVID.icons[AVID.TOP], windowId);
  AVID.dimAxisMarkerIcon(AVID.icons[AVID.TOP] + "Circle", windowId);
  AVID.dimAxisMarkerIcon(AVID.icons[AVID.BOTTOM], windowId);
  AVID.dimAxisMarkerIcon(AVID.icons[AVID.BOTTOM] + "Circle", windowId);
  AVID.dimAxisMarkerIcon(AVID.icons[AVID.LEFT], windowId);
  AVID.dimAxisMarkerIcon(AVID.icons[AVID.LEFT] + "Circle", windowId);
  AVID.dimAxisMarkerIcon(AVID.icons[AVID.RIGHT], windowId);
  AVID.dimAxisMarkerIcon(AVID.icons[AVID.RIGHT] + "Circle", windowId);
  AVID.dimAxisMarkerIcon(AVID.icons[AVID.MID], windowId);
  AVID.dimAxisMarkerIcon(AVID.icons[AVID.MID] + "Circle", windowId);

  if (AVID.shootBearingsModel === AVID.SHOOT_BEARINGS_MID_END) {
    AVID.dimAxisMarkerIcon(AVID.icons[AVID.MIDNOSE]);
    AVID.dimAxisMarkerIcon(AVID.icons[AVID.MIDNOSE] + "Circle");
    AVID.dimAxisMarkerIcon(AVID.icons[AVID.MIDTAIL]);
    AVID.dimAxisMarkerIcon(AVID.icons[AVID.MIDTAIL] + "Circle");
    AVID.dimAxisMarkerIcon(AVID.icons[AVID.MIDTOP]);
    AVID.dimAxisMarkerIcon(AVID.icons[AVID.MIDTOP] + "Circle");
    AVID.dimAxisMarkerIcon(AVID.icons[AVID.MIDBOTTOM]);
    AVID.dimAxisMarkerIcon(AVID.icons[AVID.MIDBOTTOM] + "Circle");
    AVID.dimAxisMarkerIcon(AVID.icons[AVID.MIDLEFT]);
    AVID.dimAxisMarkerIcon(AVID.icons[AVID.MIDLEFT] + "Circle");
    AVID.dimAxisMarkerIcon(AVID.icons[AVID.MIDRIGHT]);
    AVID.dimAxisMarkerIcon(AVID.icons[AVID.MIDRIGHT] + "Circle");
  }

};

/**
 * Make this icon shine with full brightness.
 */
AVID.undimAxisMarkerIcon = function (iconName) {
  var ele = document.getElementById(iconName);

  if (ele.getAttribute("visibility") === "visible") {
    ele = document.getElementById(iconName + "G");
    ele.style.strokeOpacity = AVID.fullIconOpacity;
    ele.style.fillOpacity = AVID.fullIconOpacity;

    ele = document.getElementById(iconName + "GCircle");

    if (ele) {
      ele.style.strokeOpacity = AVID.fullIconOpacity;
      ele.style.fillOpacity = AVID.fullIconOpacity;
    }

  }

};

/**
 * Make this icon display dimmer.
 */
AVID.dimAxisMarkerIcon = function (iconName, windowId) {
  var ele = document.getElementById(iconName);

  if (ele.getAttribute("visibility") === "visible" && ele.getAttribute("windowId") === windowId) {
    ele = document.getElementById(iconName + "G");
    ele.style.strokeOpacity = AVID.dimIconOpacity;
    ele.style.fillOpacity = AVID.dimIconOpacity;

    ele = document.getElementById(iconName + "GCircle");

    if (ele) {
      ele.style.strokeOpacity = AVID.dimIconOpacity;
      ele.style.fillOpacity = AVID.dimIconOpacity;
    }

  }

};

/**
 * Make this icon shine with full brightness.
 */
AVID.undimIconSegment = function (segmentName) {
  var ele = document.getElementById(segmentName);
  ele.style.strokeOpacity = AVID.fullIconOpacity;
  ele.style.fillOpacity = AVID.fullIconOpacity;
};

/**
 * Make this icon display dimmer.
 */
AVID.dimIconSegment = function (segmentName) {
  var ele = document.getElementById(segmentName);
  ele.style.strokeOpacity = AVID.dimIconOpacity;
  ele.style.fillOpacity = AVID.dimIconOpacity;
};

AVID.iconHelmSelected = function () {
  AVID.helmButtonAdjust(AVID.dimIconSegment);
};

AVID.iconHelmUnselected = function () {
  AVID.helmButtonAdjust(AVID.undimIconSegment);
};

AVID.iconBearingSelected = function () {
  AVID.bearingButtonAdjust(AVID.dimIconSegment);
};

AVID.iconBearingUnselected = function () {
  AVID.bearingButtonAdjust(AVID.undimIconSegment);
};

AVID.iconFishbowlSelected = function () {
  AVID.fishbowlButtonAdjust(AVID.dimIconSegment);
};

AVID.iconFishbowlUnselected = function () {
  AVID.fishbowlButtonAdjust(AVID.undimIconSegment);
};

/**
 * Dim or undim the "helm" icon in the AVID.
 */
AVID.helmButtonAdjust = function (fcnSetOpacity) {
  fcnSetOpacity("iconHelmSelectGp1");
  fcnSetOpacity("iconHelmSelectGp2");
};

/**
 * Dim or undim the "bearing" icon in the AVID.
 */
AVID.bearingButtonAdjust = function (fcnSetOpacity) {
  fcnSetOpacity("iconBearingSelectGp1");
  fcnSetOpacity("iconBearingSelectGp2");
  fcnSetOpacity("iconBearingSelectGp3");
  fcnSetOpacity("iconBearingSelectGp4");
  fcnSetOpacity("iconBearingSelectGp5");
};

/**
 * Dim or undim the "fishbowl" icon in the AVID.
 */
AVID.fishbowlButtonAdjust = function (fcnSetOpacity) {
  fcnSetOpacity("iconFishbowlSelectGp1");
  fcnSetOpacity("iconFishbowlSelectGp2");
  fcnSetOpacity("iconFishbowlSelectGp3");
  fcnSetOpacity("iconFishbowlSelectGp4");
  fcnSetOpacity("iconFishbowlSelectGp5");
  fcnSetOpacity("iconFishbowlSelectGp6");
  fcnSetOpacity("iconFishbowlSelectGp7");

  fcnSetOpacity("iconFishbowlSelectFBGp1");
  fcnSetOpacity("iconFishbowlSelectFBGp2");
  fcnSetOpacity("iconFishbowlSelectFBGp3");
  fcnSetOpacity("iconFishbowlSelectFBGp4");
  fcnSetOpacity("iconFishbowlSelectFBGp5");
  fcnSetOpacity("iconFishbowlSelectFBGp6");
  fcnSetOpacity("iconFishbowlSelectFBGp7");
};

/**
 * Change the facing of the AVID window to that of AVID.avidACoordinate.
 */
AVID.setAvidToRotation = function () {

  /*
   * The (0, 0) of the AVID is to the top-left corner.
   * The rotation must occur at its center.  That is why its width is cut in half.
   *
   * By experiment, for the offset we must use the as-delivered SVG width, prior
   * to the div widening.  This is "originalClientWidth", set on page load.
   */
  var offset = AVID.originalClientWidth / 2;
  document.getElementById("avidWrapperG").setAttribute("transform", "rotate(" + AVID.avidACoordinate + " " + offset + " " + offset + ")");

  document.getElementById("iconAvidLabelAG").setAttribute("transform", "rotate(" + (-AVID.avidACoordinate) + " " + AVID.iconOffset + " " + AVID.iconOffset + ")");
  document.getElementById("iconAvidLabelBG").setAttribute("transform", "rotate(" + (-AVID.avidACoordinate) + " " + AVID.iconOffset + " " + AVID.iconOffset + ")");
  document.getElementById("iconAvidLabelCG").setAttribute("transform", "rotate(" + (-AVID.avidACoordinate) + " " + AVID.iconOffset + " " + AVID.iconOffset + ")");
  document.getElementById("iconAvidLabelDG").setAttribute("transform", "rotate(" + (-AVID.avidACoordinate) + " " + AVID.iconOffset + " " + AVID.iconOffset + ")");
  document.getElementById("iconAvidLabelEG").setAttribute("transform", "rotate(" + (-AVID.avidACoordinate) + " " + AVID.iconOffset + " " + AVID.iconOffset + ")");
  document.getElementById("iconAvidLabelFG").setAttribute("transform", "rotate(" + (-AVID.avidACoordinate) + " " + AVID.iconOffset + " " + AVID.iconOffset + ")");

  document.getElementById("iconAvidLabelABG").setAttribute("transform", "rotate(" + (-AVID.avidACoordinate) + " " + AVID.iconOffset + " " + AVID.iconOffset + ")");
  document.getElementById("iconAvidLabelBCG").setAttribute("transform", "rotate(" + (-AVID.avidACoordinate) + " " + AVID.iconOffset + " " + AVID.iconOffset + ")");
  document.getElementById("iconAvidLabelCDG").setAttribute("transform", "rotate(" + (-AVID.avidACoordinate) + " " + AVID.iconOffset + " " + AVID.iconOffset + ")");
  document.getElementById("iconAvidLabelDEG").setAttribute("transform", "rotate(" + (-AVID.avidACoordinate) + " " + AVID.iconOffset + " " + AVID.iconOffset + ")");
  document.getElementById("iconAvidLabelEFG").setAttribute("transform", "rotate(" + (-AVID.avidACoordinate) + " " + AVID.iconOffset + " " + AVID.iconOffset + ")");
  document.getElementById("iconAvidLabelFAG").setAttribute("transform", "rotate(" + (-AVID.avidACoordinate) + " " + AVID.iconOffset + " " + AVID.iconOffset + ")");

  // When the AVID rotates the bearing icon also rotates.  *This* one should always be upright!
  BEAR.fixBearingRotation();
};

/**
 * Change the facing of the rotate icon to match what was done to the AVID window.
 */
AVID.setRotateIconToRotation = function () {

  /*
   * The rotate icon must be one turn in advance.
   * The "20 11" parameters for the embedded letter of Gp5 is ad-hoc.  It works.
   */
  var iconCoordinate = AVID.addIncrementToRotation(AVID.avidACoordinate);
  document.getElementById("iconRotateG").setAttribute("transform", "rotate(" + iconCoordinate + " 20 20)");
  document.getElementById("iconRotateGp5").setAttribute("transform", "rotate(" + (-iconCoordinate) + " 20 11)");
};

/**
 * Change the facing of the AVID window to that of AVID.avidACoordinate..
 * Each time the function is called, rotate 90 degrees counter-clockwise.
 */
AVID.rotateAvid = function () {
  AVID.avidACoordinate = AVID.addIncrementToRotation(AVID.avidACoordinate);

  AVID.setAvidToRotation();
  AVID.setRotateIconToRotation();
};

/**
 * Handle the duties of calculating one 90-degree rotation counter-clockwise.
 */
AVID.addIncrementToRotation = function (currentRotation) {
  var rotation = currentRotation - 90;

  // This use of 360 brings the coordinate out of negative territory.  We never see a coordinate of "360".
  if (rotation < 0)
    rotation += 360;

  return rotation;
};

/**
 * Do the two "hexagon" color sets have identical values?  Then they represent the same color.
 */
AVID.hexagonColorEqual = function (firstColorSet, secondColorSet) {
  return (firstColorSet.fill === secondColorSet.fill && firstColorSet.stroke === secondColorSet.stroke);
};

/**
 * Show the AVID hexagon in AVID.hexagonColor.
 * Optional "hexagonColor" parameter also sets that global value.
 * This lets the display match the AVID card the player is using.
 */
AVID.showHexagonColor = function (hexagonColor) {

  if (hexagonColor)
    AVID.hexagonColor = hexagonColor;

  var hexagon = document.getElementById("avidColoredHexagon");
  hexagon.setAttribute("stroke", AVID.hexagonColor.stroke);
  hexagon.setAttribute("fill", AVID.hexagonColor.fill);

  for (var idx = 0; idx <= 330; idx += 30) {
    strDeg = AVID.getDegreesStringForWindowId(idx);
    document.getElementById("b00." + strDeg).style.stroke = AVID.hexagonColor.stroke;
    document.getElementById("b30." + strDeg).style.stroke = AVID.hexagonColor.stroke;

    if (idx % 60 === 0)
      document.getElementById("b60." + strDeg).style.stroke = AVID.hexagonColor.stroke;

  }

  document.getElementById("b90.pol").style.stroke = AVID.hexagonColor.stroke;

  document.getElementById("iconAvidLabelAText").style.fill = AVID.hexagonColor.fill;
  document.getElementById("iconAvidLabelBText").style.fill = AVID.hexagonColor.fill;
  document.getElementById("iconAvidLabelCText").style.fill = AVID.hexagonColor.fill;
  document.getElementById("iconAvidLabelDText").style.fill = AVID.hexagonColor.fill;
  document.getElementById("iconAvidLabelEText").style.fill = AVID.hexagonColor.fill;
  document.getElementById("iconAvidLabelFText").style.fill = AVID.hexagonColor.fill;
};

/**
 * Make the "rotate" icon color match that of the AVID hexagon.
 */

AVID.showRotateIconColor = function (hexagonColor) {

  if (hexagonColor)
    AVID.hexagonColor = hexagonColor;

  // Some elements are white background and must remain so.
  document.getElementById("iconRotateGp1").style.fill = AVID.hexagonColor.fill;
  document.getElementById("iconRotateGp1").style.stroke = AVID.hexagonColor.fill;
  document.getElementById("iconRotateGp3").style.stroke = AVID.hexagonColor.fill;
  document.getElementById("iconRotateGp4").style.fill = AVID.hexagonColor.fill;
  document.getElementById("iconRotateGp4").style.stroke = AVID.hexagonColor.fill;
  document.getElementById("iconRotateGp5").style.fill = AVID.hexagonColor.fill;
};

AVID.avidPivoting = function () {
  AVID.avidMovementMode = AVID.PIVOT;
  AVID.drawAvid();
  AVID.setMovementModeButtons(AVID.PIVOT);
};

AVID.avidRolling = function () {
  AVID.avidMovementMode = AVID.ROLL;
  AVID.drawAvid();
  AVID.setMovementModeButtons(AVID.ROLL);
};

AVID.avidDone = function () {
  AVID.avidMovementMode = AVID.DONE;
  AVID.drawAvid();
  AVID.setMovementModeButtons(AVID.DONE);
};

AVID.setMovementModeButtons = function (moveMode) {

  /*
   * Alas!  I had to insert BRIDGE references.
   */
  var shipId = BRIDGE.calculateNextUndoneShip();
  var btnLabel = shipId === null ? "To Fleet Cmd" : ("To Ship # " + shipId);

  if (moveMode === AVID.PIVOT) {
    AVID.hideElement(document.getElementById("btnPivot"));
    AVID.showElement(document.getElementById("lblPivot"));

    AVID.showElement(document.getElementById("btnRoll"));
    AVID.hideElement(document.getElementById("lblRoll"));

    if (!AVID.isAdjustingShipOrientation) {
      AVID.showElement(document.getElementById("btnDone"));
      AVID.hideElement(document.getElementById("lblDone"));
      document.getElementById("btnDone").value = btnLabel;
    }

  } else if (moveMode === AVID.ROLL) {
    AVID.showElement(document.getElementById("btnPivot"));
    AVID.hideElement(document.getElementById("lblPivot"));

    AVID.hideElement(document.getElementById("btnRoll"));
    AVID.showElement(document.getElementById("lblRoll"));

    if (!AVID.isAdjustingShipOrientation) {
      AVID.showElement(document.getElementById("btnDone"));
      AVID.hideElement(document.getElementById("lblDone"));
      document.getElementById("btnDone").value = btnLabel;
    }

  } else if (moveMode === AVID.DONE) {
    AVID.showElement(document.getElementById("btnPivot"));
    AVID.hideElement(document.getElementById("lblPivot"));

    AVID.showElement(document.getElementById("btnRoll"));
    AVID.hideElement(document.getElementById("lblRoll"));

    if (!AVID.isAdjustingShipOrientation) {
      AVID.hideElement(document.getElementById("btnDone"));
      AVID.showElement(document.getElementById("lblDone"));
    }

  }

  if (AVID.isAdjustingShipOrientation) {
    AVID.hideElement(document.getElementById("btnPrevious"));
    AVID.hideElement(document.getElementById("btnNext"));
    AVID.hideElement(document.getElementById("btnDone"));
    AVID.hideElement(document.getElementById("lblDone"));
  } else if (BRIDGE.countShips() === 1) {
    AVID.hideElement(document.getElementById("btnPrevious"));
    AVID.hideElement(document.getElementById("btnNext"));
  } else {
    AVID.showElement(document.getElementById("btnPrevious"));
    AVID.showElement(document.getElementById("btnNext"));
  }

};

AVID.undoMove = function () {

  if (AVID.avidMovementMode === AVID.PIVOT)
    AVID.undoPivotRedraw();
  else if (AVID.avidMovementMode === AVID.ROLL)
    AVID.undoRollRedraw();

};

AVID.showStatusMessage = function (msg) {
  document.getElementById("divAvidHelmStatus").innerHTML = msg;
};

AVID.clearStatusMessage = function (msg) {
  AVID.showStatusMessage("&nbsp;");
};

AVID.enableStatusMessage = function () {
  var ele = document.getElementById("divAvidHelmStatus");
  AVID.showElement(ele);
};

AVID.disableStatusMessage = function () {
  var ele = document.getElementById("divAvidHelmStatus");
  AVID.hideElement(ele);
};

/**
 * Prepare the AVID to respond to the move/undo circles.
 */
AVID.enableAvidPivots = function () {
  var avidEvents = document.getElementById("avidEvents");
  avidEvents.addEventListener("mousedown", AVID.mouseDown, false);
  avidEvents.addEventListener("mouseup", AVID.mouseUp, false);
  avidEvents.addEventListener("mousemove", AVID.mouseMove, false);
  avidEvents.addEventListener("touchstart", AVID.touchStart, false);
  avidEvents.addEventListener("touchend", AVID.touchEnd, false);
  avidEvents.addEventListener("touchmove", AVID.touchMove, false);
  avidEvents.addEventListener("click", AVID.click, false);
};

/**
 * Have the AVID cease responding to the move/undo circles.
 */
AVID.disableAvidPivots = function () {
  var avidEvents = document.getElementById("avidEvents");
  avidEvents.removeEventListener("mousedown", AVID.mouseDown, false);
  avidEvents.removeEventListener("mouseup", AVID.mouseUp, false);
  avidEvents.removeEventListener("mousemove", AVID.mouseMove, false);
  avidEvents.removeEventListener("touchstart", AVID.touchStart, false);
  avidEvents.removeEventListener("touchend", AVID.touchEnd, false);
  avidEvents.removeEventListener("touchmove", AVID.touchMove, false);
  avidEvents.removeEventListener("click", AVID.click, false);
};

/**
 * The colors of the "undo" button should be dimmed when there is nothing to undo.
 */
AVID.adjustUndoButton = function () {

  // Only shown on "helm" AVID display.
  if (AVID.avidFunction !== AVID.HELM)
    return;

  // Change color only for PIVOT or ROLL.
  var undoColor = null;

  if (AVID.avidMovementMode === AVID.PIVOT) {
    undoColor = AVID.pivots.length === 0 ? AVID.undoColorDim : AVID.undoColorFull;
  } else if (AVID.avidMovementMode === AVID.ROLL) {
    undoColor = AVID.rolls.length === 0 ? AVID.undoColorDim : AVID.undoColorFull;
  }

  if (undoColor === null)
    return;

  AVID.undoButtonColor(undoColor);
};

/**
 * Set the colors for the "undo" icon in the AVID.
 */
AVID.undoButtonColor = function (color) {
  var ele = document.getElementById("iconUndoGp2");
  ele.style.fill = color.fill;
  ele.style.stroke = color.stroke;

  // The "fill" attribute *does* need the "stroke" color.
  ele = document.getElementById("iconUndoGp3");
  ele.style.fill = color.stroke;
  ele.style.stroke = color.stroke;

  if (color === AVID.undoColorFull) {
    AVID.undimIconSegment("iconUndoGp4");
  } else if (color === AVID.undoColorDim) {
    AVID.dimIconSegment("iconUndoGp4");
  } else {
    // Unknown territory -- do nothing.
  }

};

/**
 * Determine the angle to feed to a SVG "rotate()" command for
 * a vector proceeding from startWindowId to endWindowId.
 * In these angles a zero-degree points from the center
 * (a pole window "90.pol") to "A" ("00.000").
 *
 * The startWindowId and endWindowId need to be up to one 30-degree
 * span apart and up to one AVID band apart.  More than that and
 * things don't make sense.
 */
AVID.calculateAngle = function (startWindowId, endWindowId) {

  /*
   * When one end of a vector is on a pole ("a00.pol") there isn't any
   * useful degree information.  In addition, all vectors are axial.
   * Substitute the other's degree information.
   */
  var startDegreesStr = AVID.getDegreesFromWindowId(startWindowId);
  var endDegreesStr = AVID.getDegreesFromWindowId(endWindowId);

  if (AVID.isWindowPole(startWindowId)) {
    startDegreesStr = endDegreesStr;
  } else if (AVID.isWindowPole(endWindowId)) {
    endDegreesStr = startDegreesStr;
  }

  var startDegrees = parseInt(startDegreesStr, 10);
  var endDegrees = parseInt(endDegreesStr);
  var deltaDegrees = endDegrees - startDegrees;

  /*
   * Determine if this vector has attributes of:
   * * Does the AVID band change? ("in2Out", "sameBand", "out2In").
   * * Do the AVID degrees change? ("cw", "sameDegrees", "ccw").
   */
  var degreesChange = "sameDegrees";

  if (deltaDegrees === 30 || deltaDegrees === -330) {
    degreesChange = "cw";
  } else if (deltaDegrees === -30 || deltaDegrees === 330) {
    degreesChange = "ccw";
  }
  if (deltaDegrees === 60 || deltaDegrees === -300) {
    degreesChange = "cw";
  } else if (deltaDegrees === -60 || deltaDegrees === 300) {
    degreesChange = "ccw";
  }

  var startBand = AVID.getLatitudeFromWindowId(startWindowId);
  var endBand = AVID.getLatitudeFromWindowId(endWindowId);
  var bandChange = "sameBand";

  if (AVID.isWindowPole(startBand) && AVID.isWindowGreen(endBand)) {
    bandChange = "in2Out";
  } else if (AVID.isWindowGreen(startBand) && AVID.isWindowBlue(endBand)) {
    bandChange = "in2Out";
  } else if (AVID.isWindowBlue(startBand) && AVID.isWindowAmber(endBand)) {
    bandChange = "in2Out";
  } else if (AVID.isWindowAmber(startBand) && AVID.isWindowBlue(endBand)) {
    bandChange = "out2In";
  } else if (AVID.isWindowBlue(startBand) && AVID.isWindowGreen(endBand)) {
    bandChange = "out2In";
  } else if (AVID.isWindowGreen(startBand) && AVID.isWindowPole(endBand)) {
    bandChange = "out2In";
  }

  var outputDegrees = 0;

  if (degreesChange === "sameDegrees" && bandChange === "sameBand") {
    // Impossible condition, leave output at zero.
  } else if (degreesChange === "sameDegrees") {

    /*
     * Handle same degree calculations.
     *
     * The vector runs axially from the pole.
     */
    outputDegrees = startDegrees;

    /*
     * This is the calculation for an "in to out" movement.
     * For "out to in" use the opposite degrees.
     */
    if (bandChange === "out2In")
      outputDegrees = (outputDegrees + 180) % 360;

  } else if (bandChange === "sameBand") {

    /*
     * Handle same band calculations.
     *
     * In the amber and blue bands the interior angle between
     * the axis and the tangent is 75 degrees.
     * In the green band the interior angle is 60 degrees.
     *
     * The angle is measured axially, with an offset amounting
     * to (180 - angle) for a clockwise move and (-180 + angle)
     * for a counterclockwise move.
     *
     * The (180 - angle) has been pre-calculated into the 120 and 105 values.
     * However, that doesn't look right, so I reduce the angles so they point
     * roughly at the middle of the window border.  The 120 becomes 99 and
     * the 105 becomes 94.
     */
    if (AVID.isWindowGreen(startWindowId)) {
      outputDegrees = startDegrees + (degreesChange === "cw" ? 99 : -99);
    } else {
      outputDegrees = startDegrees + (degreesChange === "cw" ? 94 : -94);
    }

    outputDegrees = outputDegrees % 360;
  } else if (AVID.isWindowBlue(startBand) && bandChange === "in2Out") {

    /*
     * Starting in a blue band, going to a different degree in the amber band.
     */
    outputDegrees = startDegrees + (degreesChange === "cw" ? 62 : -62);
    outputDegrees = outputDegrees % 360;
  } else if (AVID.isWindowAmber(startBand) && bandChange === "out2In") {

    /*
     * Starting in the amber band, going to a different degree in the blue band.
     * This is the opposite of the "start in blue, in2Out" case.  Calculate the
     * "in2Out" vector and then flip it 180 degrees.
     */
    outputDegrees = endDegrees + (degreesChange === "cw" ? -78 : 78);
    outputDegrees = (outputDegrees + 180) % 360;
  } else if (AVID.isWindowGreen(startBand) && bandChange === "in2Out") {

    /*
     * Starting in a green band, going to a different degree in the blue band.
     */
    outputDegrees = startDegrees + (degreesChange === "cw" ? 66 : -66);
    outputDegrees = outputDegrees % 360;
  } else if (AVID.isWindowBlue(startBand) && bandChange === "out2In") {

    /*
     * Starting in a blue band, going to a different degree in the green band.
     * This is the opposite of the "start in green, in2Out" case.  Calculate the
     * "in2Out" vector and then flip it 180 degrees.  As elsewhere, the calculated
     * value is actually 56 degrees but adjusted to look better.
     */
    outputDegrees = endDegrees + (degreesChange === "cw" ? -58 : 58);
    outputDegrees = (outputDegrees + 180) % 360;
  }

  return outputDegrees;
};
