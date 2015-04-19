/**
 * The AVID Assistant is Copyright 2015 Ad Astra Games. The AVID and related iconography are Copyright 2004 Ad Astra Games and are used with permission.
 */

/**
 * On refresh, some browsers preserve the state of the global AVID variable.
 * Force a reload by deleting any existing AVID variable.
 */
if (FISH) {
  delete FISH;
}

var FISH = {};

/**
 * Convenience names for the axes.  This differs from the AVID versions in that there are only numbers here.
 */
FISH.AMBER = "00";
FISH.BLUE = "30";
FISH.GREEN = "60";
FISH.PURPLE = "90";

FISH.NORTH_POLE = "u90.pol";
FISH.SOUTH_POLE = "d90.pol";

FISH.nominalAxes = [];
FISH.nominalAxes[AVID.NOSE] = "u00.000";
FISH.nominalAxes[AVID.TAIL] = "u00.180";
FISH.nominalAxes[AVID.TOP] = "u90.pol";
FISH.nominalAxes[AVID.BOTTOM] = "d90.pol";
FISH.nominalAxes[AVID.LEFT] = "u00.270";
FISH.nominalAxes[AVID.RIGHT] = "u00.090";

/**
 * The fishbowl can show the bearing from the usual end-of-turn orientation, by way of AVID.current,
 * or from the mid-move orientation, by way of AVID.midpoint.  The usual view is from the endpoint.
 */
FISH.MIDPOINT_VIEW = "MIDPOINT_VIEW";
FISH.ENDPOINT_VIEW = "ENDPOINT_VIEW";
FISH.view = FISH.ENDPOINT_VIEW;

/**
 * There will be zero or more target window IDs.  These point to positions in the ship's coordinate system.
 */
FISH.targetWindows = [];

/**
 * These lists of neighbors describe concentric rings of connectedness from the origin.  To answer a question "how far is
 * the target from the origin?" the program asks "is the target one of the 1-distance neighbors", then progresses to the
 * 2-distance and 3-distance neighbors.  If more than 3 windows away then the target is actually closer to some window
 * opposite the AVID, meaning this particular target shouldn't be used.
 *
 * There are 14 distinct origin windows, which can be transformed into any needed origin window.  The calculation here
 * differs from that of great circles (6 distinct) because:
 * * Green band spine windows are considered.
 * * Upper hemisphere and lower hemisphere cases are listed here.  The great circle transforms a lower hemisphere origin
 *   into an opposite-pole upper hemisphere origin.  That logic isn't appropriate here.
 *
 * These neighbor lists make a fair attempt to obey the "two diagonals" rule.
 *
 * The AVID window IDs use a "u" prefix for "upper hemisphere", or "up", and a "d" prefix for "lower hemisphere", or "down".
 *
 * There is no importance to window ID sequences, such as clockwise or counterclockwise, for this list.
 * The windows are arranged to improve programmer auditing of the lists vs. a written-down AVID.
 *
 * These lists have been briefly checked to prove that no "two diagonals" violation is occurring.
 */
FISH.ne1 = [];
FISH.ne2 = [];
FISH.ne3 = [];

FISH.ne1[FISH.NORTH_POLE] = ["u60.000", "u60.030", "u60.060", "u60.090", "u60.120", "u60.150", "u60.180", "u60.210", "u60.240", "u60.270", "u60.300", "u60.330"];
FISH.ne2[FISH.NORTH_POLE] = ["u30.000", "u30.030", "u30.060", "u30.090", "u30.120", "u30.150", "u30.180", "u30.210", "u30.240", "u30.270", "u30.300", "u30.330"];
FISH.ne3[FISH.NORTH_POLE] = ["u00.000", "u00.030", "u00.060", "u00.090", "u00.120", "u00.150", "u00.180", "u00.210", "u00.240", "u00.270", "u00.300", "u00.330"];

FISH.ne1["u60.000"] = ["u90.pol", "u60.300", "u60.330", "u60.030", "u60.060", "u30.330", "u30.000", "u30.030"];
FISH.ne2["u60.000"] = ["u60.090", "u60.120", "u60.150", "u60.180", "u60.210", "u60.240", "u60.270", "u30.270", "u30.300", "u30.060", "u30.090", "u00.300", "u00.330", "u00.000", "u00.030", "u00.060"];
FISH.ne3["u60.000"] = ["u30.120", "u30.150", "u30.180", "u30.210", "u30.240", "u00.090", "u00.270", "d30.300", "d30.330", "d30.000", "d30.030", "d30.060"];

// u30.120 and u30.300 are arbitrarily put into range 2.
FISH.ne1["u60.030"] = ["u90.pol", "u60.330", "u60.000", "u60.060", "u60.090", "u30.000", "u30.030", "u30.060"];
FISH.ne2["u60.030"] = ["u60.120", "u60.150", "u60.180", "u60.210", "u60.240", "u60.270", "u60.300", "u30.300", "u30.330", "u30.090", "u30.120", "u00.330", "u00.000", "u00.030", "u00.060", "u00.090"];
FISH.ne3["u60.030"] = ["u30.150", "u30.180", "u30.210", "u30.240", "u30.270", "u00.120", "u00.300", "d30.330", "d30.000", "d30.030", "d30.060", "d30.090"];

FISH.ne1["u30.000"] = ["u60.330", "u60.000", "u60.030", "u30.330", "u30.030", "u00.330", "u00.000", "u00.030"];
FISH.ne2["u30.000"] = ["u90.pol", "u60.270", "u60.300", "u60.060", "u60.090", "u30.300", "u30.060", "u00.300", "u00.060", "d30.300", "d30.330", "d30.000", "d30.030", "d30.060"];
FISH.ne3["u30.000"] = ["u60.120", "u60.150", "u60.180", "u60.210", "u60.240", "u30.090", "u30.270", "u00.090", "u00.270", "d30.090", "d30.270", "d60.300", "d60.330", "d60.000", "d60.030", "d60.060"];

FISH.ne1["u30.030"] = ["u60.000", "u60.030", "u60.060", "u30.000", "u30.060", "u00.000", "u00.030", "u00.060"];
FISH.ne2["u30.030"] = ["u90.pol", "u60.300", "u60.330", "u60.090", "u60.120", "u30.330", "u30.090", "u00.330", "u00.090", "d30.330", "d30.000", "d30.030", "d30.060", "d30.090"];
FISH.ne3["u30.030"] = ["u60.150", "u60.180", "u60.210", "u60.240", "u60.270", "u30.300", "u30.120", "u00.300", "u00.120", "d30.300", "d30.120", "d60.330", "d60.000", "d60.030", "d60.060", "d60.090"];

FISH.ne1["u00.000"] = ["u30.330", "u30.000", "u30.030", "u00.330", "u00.030", "d30.330", "d30.000", "d30.030"];
FISH.ne2["u00.000"] = ["u60.300", "u60.330", "u60.000", "u60.030", "u60.060", "u30.300", "u30.060", "u00.300", "u00.060", "d30.300", "d30.060", "d60.300", "d60.330", "d60.000", "d60.030", "d60.060"];
FISH.ne3["u00.000"] = ["u90.pol", "u60.270", "u60.090", "u30.270", "u30.090", "u00.270", "u00.090", "d30.270", "d30.090", "d60.270", "d60.090", "d90.pol"];

FISH.ne1["u00.030"] = ["u30.000", "u30.030", "u30.060", "u00.000", "u00.060", "d30.000", "d30.030", "d30.060"];
FISH.ne2["u00.030"] = ["u60.330", "u60.000", "u60.030", "u60.060", "u60.090", "u30.330", "u30.090", "u00.330", "u00.090", "d30.330", "d30.090", "d60.330", "d60.000", "d60.030", "d60.060", "d60.090"];
FISH.ne3["u00.030"] = ["u90.pol", "u60.120", "u60.300", "u30.120", "u30.300", "u00.120", "u00.300", "d30.120", "d30.300", "d60.120", "d60.300", "d90.pol"];

FISH.ne1["d30.000"] = ["d60.330", "d60.000", "d60.030", "d30.330", "d30.030", "u00.330", "u00.000", "u00.030"];
FISH.ne2["d30.000"] = ["d90.pol", "d60.270", "d60.300", "d60.060", "d60.090", "d30.300", "d30.060", "u00.300", "u00.060", "u30.300", "u30.330", "u30.000", "u30.030", "u30.060"];
FISH.ne3["d30.000"] = ["d60.120", "d60.150", "d60.180", "d60.210", "d60.240", "d30.090", "d30.270", "u00.090", "u00.270", "u30.090", "u30.270", "u60.300", "u60.330", "u60.000", "u60.030", "u60.060"];

FISH.ne1["d30.030"] = ["d60.000", "d60.030", "d60.060", "d30.000", "d30.060", "u00.000", "u00.030", "u00.060"];
FISH.ne2["d30.030"] = ["d90.pol", "d60.300", "d60.330", "d60.090", "d60.120", "d30.330", "d30.090", "u00.330", "u00.090", "u30.330", "u30.000", "u30.030", "u30.060", "u30.090"];
FISH.ne3["d30.030"] = ["d60.150", "d60.180", "d60.210", "d60.240", "d60.270", "d30.300", "d30.120", "u00.300", "u00.120", "u30.300", "u30.120", "u60.330", "u60.000", "u60.030", "u60.060", "u60.090"];

FISH.ne1["d60.000"] = ["d90.pol", "d60.300", "d60.330", "d60.030", "d60.060", "d30.330", "d30.000", "d30.030"];
FISH.ne2["d60.000"] = ["d60.090", "d60.120", "d60.150", "d60.180", "d60.210", "d60.240", "d60.270", "d30.270", "d30.300", "d30.060", "d30.090", "u00.300", "u00.330", "u00.000", "u00.030", "u00.060"];
FISH.ne3["d60.000"] = ["d30.120", "d30.150", "d30.180", "d30.210", "d30.240", "u00.090", "u00.270", "u30.300", "u30.330", "u30.000", "u30.030", "u30.060"];

FISH.ne1["d60.030"] = ["d90.pol", "d60.330", "d60.000", "d60.060", "d60.090", "d30.000", "d30.030", "d30.060"];
FISH.ne2["d60.030"] = ["d60.120", "d60.150", "d60.180", "d60.210", "d60.240", "d60.270", "d60.300", "d30.300", "d30.330", "d30.090", "d30.120", "u00.330", "u00.000", "u00.030", "u00.060", "u00.090"];
FISH.ne3["d60.030"] = ["d30.150", "d30.180", "d30.210", "d30.240", "d30.270", "u00.120", "u00.300", "u30.330", "u30.000", "u30.030", "u30.060", "u30.090"];

FISH.ne1[FISH.SOUTH_POLE] = ["d60.000", "d60.030", "d60.060", "d60.090", "d60.120", "d60.150", "d60.180", "d60.210", "d60.240", "d60.270", "d60.300", "d60.330"];
FISH.ne2[FISH.SOUTH_POLE] = ["d30.000", "d30.030", "d30.060", "d30.090", "d30.120", "d30.150", "d30.180", "d30.210", "d30.240", "d30.270", "d30.300", "d30.330"];
FISH.ne3[FISH.SOUTH_POLE] = ["u00.000", "u00.030", "u00.060", "u00.090", "u00.120", "u00.150", "u00.180", "u00.210", "u00.240", "u00.270", "u00.300", "u00.330"];

/**
 * The fishbowl will show a translation from the axes it is fed.  It doesn't automatically look to AVID.current.
 */
FISH.setCurrent = function (axes) {
  FISH.current = axes;
};

/**
 * Calculate the fishbowl window from the AVID target bearing, then display it.
 */
FISH.showBearing = function () {
  FISH.clearAllWindows();

  if (BEAR.isTargetBearingBlank())
    return;

  FISH.current = (FISH.view === FISH.MIDPOINT_VIEW) ? AVID.midpoint : AVID.current;
  FISH.targetWindows = FISH.calculateBearings(BEAR.targetBearing);

  if (FISH.targetWindows.length === 0)
    FISH.showStatusMessage("Can't find unique window");
  else
    FISH.fillTargetWindow(FISH.targetWindows, BEAR.targetBearing.range);

}

/**
 * Translate an AVID target bearing into one, or more, based on ship attitude.
 *
 * The ship, generally pivoted and rolled about the universal AVID, has its own coordinate system.
 * A target seen in a particular AVID window will generally appear in some other ship window.
 *
 * The general idea is to measure a distance from the AVID target window to each of a triangle of ship marker axes.
 * Then on a new, translated AVID, representing the ship and the fishbowl, use the distances from the same-named
 * marker axes to find the same position on the translated AVID.
 *
 * Possible results are:
 * * No matching windows.
 * * A single window solution.
 * * A triad of windows.  The solution is in the middle of an axis triangle, but AVID window approximation yields
 *   a result that is actually on a spine or three-window point.  Any of the windows might be valid, attacker's choice.
 * * A pair of windows.  This is a degenerate version of a triad, where one of the legs is long enough that the result
 *   lies along the great circle between the other two axes.  Both windows might be valid, attacker's choice.
 *
 * Returns an array of window IDs.  The window IDs have the hemisphere value ("u" or "d") baked-in.
 */
FISH.calculateBearings = function (targetBearing) {

  /*
   * Is the target bearing in an AVID window coinciding with a "current" marker axis?
   * If so then no hard work is needed.
   */
  var windowId = FISH.pointsAtCurrentAxis(targetBearing);

  if (windowId !== null) {
    return FISH.calculateBearingsForZero(windowId);
  }

  /*
   * Calculate the distance to the target from each "current" axis.
   * * Distances of 0 were handled earlier.
   * * Distances of 1 thru 3 are useful results.
   * * Distances larger than 3 are reported as AVID.TOO_LONG.
   *
   * Any distance longer than 3 can be calculated shorter from the axis on the other end of its pole.
   * For example, distance 6 from the nose is actually on the tail axis.  For this cause, report this
   * as a really long distance.
   */
  var targetWindowId = targetBearing.windowId;
  var noseDist = FISH.calculateDistanceToTargetFromCurrentWindow(AVID.NOSE, targetBearing);
  var aftDist = FISH.calculateDistanceToTargetFromCurrentWindow(AVID.TAIL, targetBearing);
  var topDist = FISH.calculateDistanceToTargetFromCurrentWindow(AVID.TOP, targetBearing);
  var bottomDist = FISH.calculateDistanceToTargetFromCurrentWindow(AVID.BOTTOM, targetBearing);
  var leftDist = FISH.calculateDistanceToTargetFromCurrentWindow(AVID.LEFT, targetBearing);
  var rightDist = FISH.calculateDistanceToTargetFromCurrentWindow(AVID.RIGHT, targetBearing);

  /*
   * Get the minimum distance for each of the axes, along with the name of the axis that generated it.
   * Then let calculateBearingsForDistances() sort out the details.
   */
  var na = (noseDist <= aftDist) ? {axisName: AVID.NOSE, dist: noseDist} : {axisName: AVID.TAIL, dist: aftDist};
  var tb = (topDist <= bottomDist) ? {axisName: AVID.TOP, dist: topDist} : {axisName: AVID.BOTTOM, dist: bottomDist};
  var lr = (leftDist <= rightDist) ? {axisName: AVID.LEFT, dist: leftDist} : {axisName: AVID.RIGHT, dist: rightDist};

  var calcBearings = FISH.calculateBearingsForDistances(na, tb, lr);

  if (calcBearings.length === 0) {

    /*
     * Failed to find a fishbowl equivalent.  Most common cause is measuring from an axis on a green spine.
     * If there is a failure, reduce the spine distance by one and try again.  If the distance is already
     * at "1" then the bearing will rest on that axis.
     *
     * Suppose the Top/Bottom is the one on a green spine?  Does Ken's rule about honoring the distance
     * apply here?  I say no, that I can adjust the distance.
     * * First, there is no solution without adjusting the distance from the marker on the green spine.
     * * Second, the distance from the green spine is negotiable.
     */

    var adjust = null;

    if (tb.axisName === AVID.TOP && AVID.isWindowGreen(FISH.current[AVID.TOP].windowId)) {

      if (tb.dist === 1) {
        targetBearing = {
          windowId         : FISH.current[AVID.TOP].windowId,
          isUpperHemisphere: FISH.current[AVID.TOP].isUpperHemisphere,
          range            : targetBearing.range
        };
        adjust = "zero";
      } else {
        tb.dist -= 1;
        adjust = "again";
      }

    } else if (tb.axisName === AVID.BOTTOM && AVID.isWindowGreen(FISH.current[AVID.BOTTOM].windowId)) {

      if (tb.dist === 1) {
        targetBearing = {
          windowId         : FISH.current[AVID.BOTTOM].windowId,
          isUpperHemisphere: FISH.current[AVID.BOTTOM].isUpperHemisphere,
          range            : targetBearing.range
        };
        adjust = "zero";
      } else {
        tb.dist -= 1;
        adjust = "again";
      }

    } else if (lr.axisName === AVID.LEFT && AVID.isWindowGreen(FISH.current[AVID.LEFT].windowId)) {

      if (lr.dist === 1) {
        targetBearing = {
          windowId         : FISH.current[AVID.LEFT].windowId,
          isUpperHemisphere: FISH.current[AVID.LEFT].isUpperHemisphere,
          range            : targetBearing.range
        };
        adjust = "zero";
      } else {
        lr.dist -= 1;
        adjust = "again";
      }

    } else if (lr.axisName === AVID.RIGHT && AVID.isWindowGreen(FISH.current[AVID.RIGHT].windowId)) {

      if (lr.dist === 1) {
        targetBearing = {
          windowId         : FISH.current[AVID.RIGHT].windowId,
          isUpperHemisphere: FISH.current[AVID.RIGHT].isUpperHemisphere,
          range            : targetBearing.range
        };
        adjust = "zero";
      } else {
        lr.dist -= 1;
        adjust = "again";
      }

    }

    if (adjust === "zero") {
      windowId = FISH.pointsAtCurrentAxis(targetBearing);

      if (windowId !== null) {
        calcBearings = FISH.calculateBearingsForZero(windowId);
      }


    } else {
      calcBearings = FISH.calculateBearingsForDistances(na, tb, lr);
    }

  }

  return calcBearings;
};

/**
 * Delegate the calculation work to more specific functions.
 *
 * Returns an array, perhaps filled with window IDs.
 */
FISH.calculateBearingsForDistances = function (na, tb, lr) {

  /*
   * I know how to handle these cases:
   * * Bearing is right on the ship axis (distance of 0).  This is a 1-window solution.
   * * Bearing is one away from a ship axis.  This results in a 1-window solution.
   * * Bearing is two away from all ship axes.  This ends up with a 3-window solution.
   * * Bearing is two away from two axes and three away from another.  This ends up with a 2-window solution.
   */
  if (na.dist === 1 || tb.dist === 1 || lr.dist === 1)
    return FISH.calculateBearingsFor1Plus(na, tb, lr);

  if (na.dist === 2 && tb.dist === 2 && lr.dist === 2)
    return FISH.calculateBearingsFor222(na, tb, lr);

  if ((na.dist === 2 && tb.dist === 2 && lr.dist === 3)
    || (na.dist === 2 && tb.dist === 3 && lr.dist === 2)
    || (na.dist === 3 && tb.dist === 2 && lr.dist === 2))
    return FISH.calculateBearingsFor223(na, tb, lr);

  // Don't know how to handle any other combos.
  return [];
};

/**
 * The fishbowl window is exactly the window passed in.
 *
 * Returns an array with one element in it.
 */
FISH.calculateBearingsForZero = function (windowId) {

  // Find the axis name being pointed at, then use the windowId from the nominalAxes[] list.
  var solutionsZero = [];
  solutionsZero.push(FISH.nominalAxes[FISH.getNameOfCurrentAxis(windowId)]);

  return solutionsZero;
};

/**
 * The window is next to one of these axes.  The other two axes contribute.
 *
 * Each axis parameter has format { axisName, dist }
 *
 * Returns an array, with either zero or one element in it.
 */
FISH.calculateBearingsFor1Plus = function (firstAxis, secondAxis, thirdAxis) {

  /*
   * Prior calculations showed the target to be triangulated by three axes,
   * given by the parameters.  Each parameter remembers which named axis
   * is being used and the distance from the axis marker to the target.
   *
   * From this information get a list of windows the target must belong to,
   * concentric rings about the named axis.
   */
  var firstNeBase = (firstAxis.dist === 1) ? FISH.ne1 : (firstAxis.dist === 2) ? FISH.ne2 : FISH.ne3;
  var secondNeBase = (secondAxis.dist === 1) ? FISH.ne1 : (secondAxis.dist === 2) ? FISH.ne2 : FISH.ne3;
  var thirdNeBase = (thirdAxis.dist === 1) ? FISH.ne1 : (thirdAxis.dist === 2) ? FISH.ne2 : FISH.ne3;

  var firstNe = FISH.transformNeighborList(firstNeBase, FISH.nominalAxes[firstAxis.axisName]);
  var secondNe = FISH.transformNeighborList(secondNeBase, FISH.nominalAxes[secondAxis.axisName]);
  var thirdNe = FISH.transformNeighborList(thirdNeBase, FISH.nominalAxes[thirdAxis.axisName]);

  /*
   * The target is found whenever the three lists of windows all contain the same window ID.
   * Since each list has a window only once, only one return value is possible.
   */
  var firstLen = firstNe.length;
  var secondLen = secondNe.length;
  var thirdLen = thirdNe.length;

  var firstWindowId;
  var latitude;
  var degrees;
  var cwDegrees;
  var ccwDegrees;
  var cwWindowId;
  var ccwWindowId;
  var isCw;
  var isCcw;
  var solutionsCB1 = [];

  for (var firstIdx = 0; firstIdx < firstLen; firstIdx++) {
    firstWindowId = firstNe[firstIdx];

    for (var secondIdx = 0; secondIdx < secondLen; secondIdx++) {

      if (firstWindowId === secondNe[secondIdx]) {

        for (var thirdIdx = 0; thirdIdx < thirdLen; thirdIdx++) {

          if (firstWindowId === thirdNe[thirdIdx]) {

            /*
             * If the solution is on a spine, calculate its neighbors instead of the spine solution.
             * Keep the neighbors that are also solutions.  However, if neither neighbor is a solution
             * then keep both that *aren't* solutions.  If nothing matches, then must do *something*.
             */
            if (AVID.isAxisGreenSpine(firstWindowId)) {
              latitude = AVID.getLatitudeFromWindowId(firstWindowId);
              degrees = AVID.getDegreesFromWindowId(firstWindowId);

              cwDegrees = (degrees === 0) ? 330 : (degrees - 30);
              cwWindowId = latitude + "." + AVID.getDegreesStringForWindowId(cwDegrees);
              isCw = false;

              if (FISH.isWindowIdInLists(firstNe, secondNe, thirdNe, cwWindowId)) {
                isCw = true;
                solutionsCB1.push(cwWindowId);
              }

              ccwDegrees = (degrees === 330) ? 0 : (degrees + 30);
              ccwWindowId = latitude + "." + AVID.getDegreesStringForWindowId(ccwDegrees);
              isCcw = false;

              if (FISH.isWindowIdInLists(firstNe, secondNe, thirdNe, ccwWindowId)) {
                isCcw = true;
                solutionsCB1.push(ccwWindowId);
              }

              if (!isCw && !isCcw) {
                solutionsCB1.push(cwWindowId);
                solutionsCB1.push(ccwWindowId);
              }

            } else {
              solutionsCB1.push(firstWindowId);
            }

            // Because only one solution is possible, no harm quitting right now.
            break;
          }

        }

      }

    }

  }

  return solutionsCB1;
};

/**
 * Test if testWindowId is found in all of the neighbor lists.
 *
 * Returns true if all lists contain testWindowId.
 */
FISH.isWindowIdInLists = function (firstNe, secondNe, thirdNe, testWindowId) {
  var firstLen = firstNe.length;
  var secondLen = secondNe.length;
  var thirdLen = thirdNe.length;

  var foundFirst = false;
  var foundSecond = false;
  var foundThird = false;

  for (var firstIdx = 0; firstIdx < firstLen; firstIdx++) {

    if (testWindowId === firstNe[firstIdx]) {
      foundFirst = true;
      break;
    }

  }

  if (!foundFirst)
    return false;

  for (var secondIdx = 0; secondIdx < secondLen; secondIdx++) {

    if (testWindowId === secondNe[secondIdx]) {
      foundSecond = true;
      break;
    }

  }

  if (!foundSecond)
    return false;

  for (var thirdIdx = 0; thirdIdx < thirdLen; thirdIdx++) {

    if (testWindowId === thirdNe[thirdIdx]) {
      foundThird = true;
      break;
    }

  }

  return foundThird;
};

/**
 * The window will be hard to place exactly, as it actually lies closest to window boundaries.
 * There will be multiple possibilities presented, and the attacking player can choose any of them.
 *
 * There is a subvariant where one of the axes is on a green spine.  In that event the solution
 * is cooked so that there is only one window in the solution.
 *
 * Returns an array with either one or three elements,
 */
FISH.calculateBearingsFor222 = function (na, tb, lr) {

  /*
   * Don't implement the subvariant at this time.  To implement it, must detect if a window comes
   * from a green spine.  If so, the distance from that window can be shorted and this reduces to
   * a "bearing is 1-window away" case.
   *
   * The target lies roughly at the center of a triad of windows.  However, Ken insists that the
   * distance from the pole (the "tb" is not negotiable.  Only the "na" and "lr" can be played with.
   */
  var solutionsCB2a = FISH.calculateBearingsFor1Plus({axisName: na.axisName, dist: 1}, {
    axisName: tb.axisName,
    dist    : 2
  }, {axisName: lr.axisName, dist: 2});
  var solutionsCB2b = FISH.calculateBearingsFor1Plus({axisName: na.axisName, dist: 2}, {
    axisName: tb.axisName,
    dist    : 2
  }, {axisName: lr.axisName, dist: 1});

  return solutionsCB2a.concat(solutionsCB2b);
};

/**
 * The window lies on a the boundary line of a spherical triangle.  This is like the 2,2,2
 * solution, except that one axis pushes the result farther away from one of the usual
 * solution windows.
 *
 * Returns an array with two elements.
 */
FISH.calculateBearingsFor223 = function (na, tb, lr) {

  /*
   * The windows lie on the line between the two "2-distance" axes.
   * Identify the third axis generically.
   */
  var twoAAxis;
  var twoBAxis;
  var threeAxis;

  if (na.dist === 3) {
    threeAxis = na;
    twoAAxis = tb;
    twoBAxis = lr;
  } else if (tb.dist === 3) {
    threeAxis = tb;
    twoAAxis = na;
    twoBAxis = lr;
  } else {
    threeAxis = lr;
    twoAAxis = na;
    twoBAxis = tb;
  }

  /*
   * Only two windows exist, midway between the two "2-distance" axes.
   * The distance from the third axis pushes the window candidates to the need place.
   *
   * Ken says that if one of the "2-distance" axes is that for Top/Bottom, do not alter its distance.
   */
  var solutionsCB3a = [];
  var solutionsCB3b = [];

  if (twoAAxis !== tb) {
    solutionsCB3a = FISH.calculateBearingsFor1Plus({axisName: twoAAxis.axisName, dist: 1}, {
      axisName: twoBAxis.axisName,
      dist    : 2
    }, {axisName: threeAxis.axisName, dist: 3});
  }

  if (twoBAxis !== tb) {
    solutionsCB3b = FISH.calculateBearingsFor1Plus({axisName: twoAAxis.axisName, dist: 2}, {
      axisName: twoBAxis.axisName,
      dist    : 1
    }, {axisName: threeAxis.axisName, dist: 3});
  }

  return solutionsCB3a.concat(solutionsCB3b);
};

/**
 * Determine how far the target is from the named "current" axis.
 *
 * The "axisName" is one of the usual NOSE, TAIL, etc.
 *
 * The "targetBearing" is an object with attributes "windowId", "isUpperHemisphere" and "range".
 *
 * Return a distance from 0 to 3.  If the target is more than 3 away then it can be
 * more easily found by the complementary axis of axisName.  In that case return TOO_BIG.
 */
FISH.calculateDistanceToTargetFromCurrentWindow = function (axisName, targetBearing) {

  /*
   *
   * The sources for the (1, 2, 3) neighbors need to be translated to the "current" axis being
   * evaluated, after which the distances can be calculated.
   */
  var targetWindowId = FISH.convertAvidBearingToFishWindowId(targetBearing);
  var currentFishWindowId = FISH.convertAvidBearingToFishWindowId(FISH.current[axisName]);
  var ne1 = FISH.transformNeighborList(FISH.ne1, currentFishWindowId);

  if (ne1) {
    var ne1Len = ne1.length;

    for (var idx = 0; idx < ne1Len; idx++) {

      if (ne1[idx] === targetWindowId)
        return 1;

    }

  }

  var ne2 = FISH.transformNeighborList(FISH.ne2, currentFishWindowId);

  if (ne2) {
    var ne2Len = ne2.length;

    for (var idx = 0; idx < ne2Len; idx++) {

      if (ne2[idx] === targetWindowId)
        return 2;

    }

  }

  var ne3 = FISH.transformNeighborList(FISH.ne3, currentFishWindowId);

  if (ne3) {
    var ne3Len = ne3.length;

    for (var idx = 0; idx < ne3Len; idx++) {

      if (ne3[idx] === targetWindowId)
        return 3;

    }

  }

  return AVID.TOO_BIG;
};

/**
 * Turn an AVID bearing into a FISH window ID.
 * An AVID bearing has attributes "windowId" and "isUpperHemisphere.
 * The window ID starts with "a".
 *
 * A FISH window ID has the hemisphere indicated by a "u" or "d" prefix.
 */
FISH.convertAvidBearingToFishWindowId = function (bearing) {

  /*
   * A recent wrinkle has the nose bearing in the amber ring having (isUpperHemisphere = false).
   * This indicates that the nose is wandering the lower hemisphere and that a trip to the bumper
   * ring is needed to change it.  However, the fishbowl logic believes that all amber ring locations
   * should get the "u" prefix.  Carefully look for being in the amber ring.
   */
  return (AVID.isWindowAmber(bearing.windowId) || bearing.isUpperHemisphere ? "u" : "d") + bearing.windowId.substring(1);
};

/**
 * From the supplied parameters create a neighboring window list that relates to the supplied window ID.
 *
 * "neighborList" is a list of windows that surrounds the intended window.  There are three lists,
 * for being a neighbor 1, 2 or 3 windows away.
 *
 * "windowId" is where the list is needed for.  It is in FISH format, meaning its prefix tells the hemisphere.
 *
 * Returns a list of windows that surround the supplied window ID.
 */
FISH.transformNeighborList = function (neighborList, windowId) {

  /*
   * The general idea has three steps:
   * 1. Take windowId and normalize it by reducing its degree value to either 0 or 30.  Remember the reduction amount.
   * 2. Use that normalized windowId as a key value for neighborList and clone that sublist.
   * 3. Add the reduction amount to the degree value of each window in the cloned sublist.
   *
   * If the window is a pole (the degree portion is "pol") then no need to rotate.
   * Get the list straight-up.
   */
  if (windowId === FISH.NORTH_POLE || windowId === FISH.SOUTH_POLE)
    return FISH.cloneNeighborList(neighborList[windowId]);

  var nDegrees = AVID.getDegreesFromWindowId(windowId);
  var adjustDegrees = Math.round(Math.floor(nDegrees / 60) * 60);
  nDegrees -= adjustDegrees;

  var nWindowId = AVID.getLatitudeFromWindowId(windowId) + "." + AVID.getDegreesStringForWindowId(nDegrees);
  var nList = FISH.cloneNeighborList(neighborList[nWindowId]);

  // The list is selected and cloned.  Rotate its windows back to match the requesting axis.
  var nLen = nList.length;

  if (adjustDegrees !== 0) {

    for (var idx = 0; idx < nLen; idx++) {
      nList[idx] = AVID.transformWindowId(nList[idx], adjustDegrees);
    }

  }

  return nList;
};

/**
 * Clear out all of the fishbowl windows, to remove any current target markings.
 */
FISH.clearAllWindows = function () {
  var latitudesLen = AVID.latitudes.length;
  var degreesLen = AVID.degrees.length;
  var lat;
  var deg;
  var ele;

  for (var idxLat = 0; idxLat < latitudesLen; idxLat++) {
    lat = AVID.latitudes[idxLat];

    for (var idxDeg = 0; idxDeg < degreesLen; idxDeg++) {
      deg = AVID.degrees[idxDeg];

      // The green band doesn't have spine windows to clear.
      if (!(lat === FISH.GREEN && parseInt(deg, 10) % 60 === 30)) {
        document.getElementById("u" + lat + "." + deg).style.fillOpacity = AVID.OPACITY_CLEAR;

        // There is only "u00" for the amber ring.
        if (lat !== FISH.AMBER)
          document.getElementById("d" + lat + "." + deg).style.fillOpacity = AVID.OPACITY_CLEAR;

      }

    }

  }

  document.getElementById("u90.pol").style.fillOpacity = AVID.OPACITY_CLEAR;
  document.getElementById("d90.pol").style.fillOpacity = AVID.OPACITY_CLEAR;
};

/**
 * Fill the target window.
 * Remember that fishbowl window IDs have "u" and "d" prefixes to designate which hemisphere they are in.
 * A separate "isUpperHemisphere isn't required.
 */
FISH.fillTargetWindow = function (targetWindows, range) {
  var winLen = targetWindows.length;

  for (var idx = 0; idx < winLen; idx++) {
    document.getElementById(targetWindows[idx]).style.fillOpacity = AVID.OPACITY_BUMPER;
  }

  FISH.showStatusMessage("Target Range: " + range);
};

/**
 * Does windowId point at one of the "current" ship position axes?
 *
 * On success, returns the fishbowl window of the match.  On failure returns null.
 */
FISH.pointsAtCurrentAxis = function (targetBearing) {

  if (FISH.pointsAtAxis(FISH.current[AVID.NOSE], targetBearing)
    || FISH.pointsAtAxis(FISH.current[AVID.TAIL], targetBearing)
    || FISH.pointsAtAxis(FISH.current[AVID.TOP], targetBearing)
    || FISH.pointsAtAxis(FISH.current[AVID.BOTTOM], targetBearing)
    || FISH.pointsAtAxis(FISH.current[AVID.LEFT], targetBearing)
    || FISH.pointsAtAxis(FISH.current[AVID.RIGHT], targetBearing))
    return FISH.convertAvidBearingToFishWindowId(targetBearing);

  return null;
};

/**
 * Does "targetBearing" point directly at "axis"?
 */
FISH.pointsAtAxis = function (axis, targetBearing) {

  // Split the logic into matching the window then messing with the hemisphere.
  if (axis.windowId !== targetBearing.windowId)
    return false;

  /*
   * The windows match, but could mismatch the hemisphere.
   * For this "windowId" there is only one window in the amber ring and two elsewhere.
   */
  return AVID.isWindowAmber(axis.windowId) || axis.isUpperHemisphere === targetBearing.isUpperHemisphere;
};

/**
 * Copy the list of window IDs so that we don't mess with the original list.
 */
FISH.cloneNeighborList = function (neighborList) {

  // The "neighborList" is an associative array, and "neighborList.length" doesn't work on those.
  var newList = [];

  for (var key in neighborList) {
    newList.push(neighborList[key]);
  }

  return newList;
};

/**
 * Get the "current" axis name that windowId points at.
 *
 * "windowId" is a fishbowl-version, with a "u" or "d" prefix.
 *
 * Returns the axis name corresponding to what was found.  If not pointing at an axis, returns null.
 */
FISH.getNameOfCurrentAxis = function (windowId) {
  return FISH.getNameOfAxis(FISH.current, windowId, true);
};

/**
 * Get the axis name that windowId points at.
 *
 * "axes" refers to a list of AVID-style bearings, each with format { windowId, isUpperHemisphere }.
 *
 * "windowId" is a fishbowl-version, with a "u" or "d" prefix.
 *
 * Returns the axis name corresponding to what was found.  If not pointing at an axis, returns null.
 */
FISH.getNameOfAxis = function (axes, windowId) {

  if (FISH.convertAvidBearingToFishWindowId(axes[AVID.NOSE]) === windowId)
    return AVID.NOSE;

  if (FISH.convertAvidBearingToFishWindowId(axes[AVID.TAIL]) === windowId)
    return AVID.TAIL;

  if (FISH.convertAvidBearingToFishWindowId(axes[AVID.TOP]) === windowId)
    return AVID.TOP;

  if (FISH.convertAvidBearingToFishWindowId(axes[AVID.BOTTOM]) === windowId)
    return AVID.BOTTOM;

  if (FISH.convertAvidBearingToFishWindowId(axes[AVID.LEFT]) === windowId)
    return AVID.LEFT;

  if (FISH.convertAvidBearingToFishWindowId(axes[AVID.RIGHT]) === windowId)
    return AVID.RIGHT;

  return null;
};

FISH.showStatusMessage = function (msg) {
  document.getElementById("divFishbowlStatus").innerHTML = msg;
};

FISH.clearStatusMessage = function (msg) {
  FISH.showStatusMessage("");
};

/**
 * Make the fishbowl show the bearing in midpoint terms.
 */
FISH.midpointView = function () {
  FISH.view = FISH.MIDPOINT_VIEW;
  FISH.setViewButtons();
  FISH.showBearing();
};

/**
 * Make the fishbowl show the bearing in endpoint terms.
 */
FISH.endpointView = function () {
  FISH.view = FISH.ENDPOINT_VIEW;
  FISH.setViewButtons();
  FISH.showBearing();
};

/**
 * Set the fishbowl view to its usual beginning-of-turn value.
 */
FISH.resetView = function () {
  FISH.view = FISH.ENDPOINT_VIEW;
  FISH.setViewButtons();
};

/**
 * Toggle the button and label displays.
 */
FISH.setViewButtons = function () {

  if (AVID.shootBearingsModel === AVID.SHOOT_BEARINGS_MID_END) {

    if (FISH.view === FISH.MIDPOINT_VIEW) {
      AVID.hideElement(document.getElementById("btnMidpointView"));
      AVID.showElement(document.getElementById("lblMidpointView"));

      AVID.showElement(document.getElementById("btnEndpointView"));
      AVID.hideElement(document.getElementById("lblEndpointView"));
    } else {
      AVID.showElement(document.getElementById("btnMidpointView"));
      AVID.hideElement(document.getElementById("lblMidpointView"));

      AVID.hideElement(document.getElementById("btnEndpointView"));
      AVID.showElement(document.getElementById("lblEndpointView"));
    }

  } else {
    AVID.hideElement(document.getElementById("btnMidpointView"));
    AVID.hideElement(document.getElementById("lblMidpointView"));

    AVID.hideElement(document.getElementById("btnEndpointView"));
    AVID.hideElement(document.getElementById("lblEndpointView"));
  }

};
