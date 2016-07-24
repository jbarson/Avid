/**
 * The AVID Assistant is Copyright 2014 Ad Astra Games.
 * */

/**
 * On refresh, some browsers preserve the state of the global AVID variable.
 * Force a reload by deleting any existing AVID variable.
 */
if (BEAR) {
  delete BEAR;
}

var BEAR = {};

BEAR.iconBearingTextBBX = 0;
BEAR.iconBearingTextBBWidth = 0;

BEAR.blankBearing = {windowId: null, isUpperHemisphere: true, range: 0};
BEAR.targetBearing = {windowId: null, isUpperHemisphere: true, range: 0};
BEAR.selectBearing = {clickedWindowId: null, windowId: null};
BEAR.directSelects = {distDH: "0", distDV: "0", distSS: "0"};

BEAR.iconBearingName = "iconBearing";
BEAR.iconClearBearingName = "iconClearBearing";

BEAR.clearBearingColorFull = {fill: "#fcd7ca", stroke: "#aa0000"};
BEAR.clearBearingColorDim = {fill: "#fde3db", stroke: "#ff8080"};

BEAR.colorFlashLI = {color: "#ffffff", backgroundColor: "#e80000"};
BEAR.colorOddLI = {color: "#000000", backgroundColor: "#dcf2f8"};
BEAR.colorEvenLI = {color: "#000000", backgroundColor: "#edf9fc"};
BEAR.colorSelectedLI = {color: "#ffffff", backgroundColor: "#3f48cc"};

/**
 * Determine the window ID in which to display the bearing icon.
 * The user entered the direction directly, by clicking on the AVID.
 *
 * If there is no bearing return null.  Otherwise return an AVID-style window ID.
 * The returned ID doesn't indicate vertical up/down.
 */
BEAR.calculateDirectSelectWindowId = function (clickedWindowId, horizDist, vertDist) {

  /*
   * Suppose that nothing has been selected yet.  There is nothing to choose, so return nothing.
   *
   * Suppose that the user has just entered a vertical direction, without choosing a horizontal one.
   * In this event the "clickedWindowId" is meaningless, but also (horizDist === 0).
   *
   * If there is a horizontal component then the user clicked on the exact direction,
   * contained in the degrees portion of the window ID.
   */
  if (horizDist === 0 && vertDist === 0){
    return null
  }

  var prefix = BEAR.calcBand(horizDist, vertDist);

  /*
   * If the clicked-on window is in the purple or green band then it is not intended
   * to select a horizontal direction.  Use the existing one.  If there is no existing
   * one (horizDist = 0) then this, too, is a pole-only entry.
   *
   * Remember, if "clickedWindowId" is meaningless then (horizDist === 0).
   */
  if (prefix === AVID.PURPLE || horizDist === 0)
    return AVID.PURPLE + ".pol";

  if (AVID.isWindowPole(clickedWindowId) || AVID.isWindowGreen(clickedWindowId))
    return prefix + "." + BEAR.targetBearing.windowId.substr(-3);

  return prefix + "." + clickedWindowId.substr(-3);
};

/**
 * Determine the vertical band for the bearing icon.
 * Returns the band useful for building an AVID-style window ID.
 */
BEAR.calcBand = function (horizDist, vertDist) {

  /*
   * Which vertical band?
   * * The split between purple and green is when horiz:vert is 1:4.  If exactly 1:4 favor purple.
   * * The split between green and blue is when horiz:vert is 1:1.  If exactly 1:1 go with blue.
   * * The split between blue and amber is when horiz:vert is 4:1.  If exactly 4:1 favor amber.
   */
  if (vertDist === 0)
    return AVID.AMBER;

  var angle = horizDist / vertDist;

  if (angle <= 0.25)
    return AVID.PURPLE;

  if (angle < 1)
    return AVID.GREEN;

  if (angle < 4)
    return AVID.BLUE;

  return AVID.AMBER;
};

/**
 * From a target bearing (AVID window ID and hemisphere) and the range calculate and display the bearing icon.
 */
BEAR.calcBearing = function (windowId, isUpperHemisphere, range) {
  BEAR.targetBearing = {
    windowId         : windowId,
    isUpperHemisphere: (isUpperHemisphere || (windowId && AVID.isWindowAmber(windowId))),
    range            : range
  };
  BEAR.showBearing(windowId, isUpperHemisphere, range);
};

/**
 * Display the target bearing from BEAR.targetBearing().
 */
BEAR.showTargetBearing = function () {
  BEAR.showBearing(BEAR.targetBearing.windowId, BEAR.targetBearing.isUpperHemisphere, BEAR.targetBearing.range);
};

/**
 * Display the target bearing.
 */
BEAR.showBearing = function (windowId, isUpperHemisphere, range) {

  if (BEAR.isBearingBlank(windowId, range)) {
    BEAR.showNoBearingMessage();

    document.getElementById(BEAR.iconBearingName).style.visibility = "hidden";
    document.getElementById(BEAR.iconBearingName + "Circle").style.visibility = "hidden";
    document.getElementById(BEAR.iconClearBearingName + "Text").style.visibility = "hidden";
    BEAR.clearBearingsButtonColor(BEAR.clearBearingColorDim);

    AVID.undimAxisMarkerIcons();
  } else {
    BEAR.hideNoBearingMessage();

    document.getElementById(BEAR.iconBearingName).style.visibility = "visible";
    document.getElementById(BEAR.iconClearBearingName + "Text").style.visibility = "visible";
    BEAR.clearBearingsButtonColor(BEAR.clearBearingColorFull);

    /*
     * The windows[] list has its (x, y) sized to show 33-pixel icons.  The bearing icon uses a 40-pixel icon.
     * Split the difference (3.5 pixels) to properly center the bearing icon.
     */
    var ele = document.getElementById(BEAR.iconBearingName);
    ele.setAttribute("x", AVID.windows[windowId].x - 3.5);
    ele.setAttribute("y", AVID.windows[windowId].y - 3.5);

    ele = document.getElementById(BEAR.iconBearingName + "Text");
    ele.textContent = ("" + range).trim();

    // Horizontally center the text.  The BBX and BBWidth are known reference values.
    var bbWidth = ele.getBBox().width;
    var bbX = BEAR.iconBearingTextBBX + ((BEAR.iconBearingTextBBWidth - ele.getBBox().width) / 2);
    ele.setAttribute("x", bbX);

    // The "clear bearing" icon mirrors what the bearing icon is showing.
    ele = document.getElementById(BEAR.iconClearBearingName + "Text");
    ele.textContent = ("" + range).trim();
    ele.setAttribute("x", bbX);

    // Show the circle only for "down" directions AND when there is some distance in the vertical.
    document.getElementById(BEAR.iconBearingName + "Circle").style.visibility = ((isUpperHemisphere || AVID.isWindowAmber(windowId)) ? "hidden" : "visible");

    /*
     * If any marker/axes icon shares the window with the bearing icon then dim those.
     * Remember that up to three icons can share the pole (icons for the two axes and the Mid icon).
     */
    AVID.undimAxisMarkerIcons();

    if (AVID.avidFunction === AVID.BEARING)
      BEAR.dimConflictingAxisMarkerIcons(BEAR.targetBearing.windowId);

  }

};

/**
 * Set the colors for the "clear bearings" icon in the AVID.
 */
BEAR.clearBearingsButtonColor = function (color) {
  var ele = document.getElementById("iconClearBearingGp3");
  ele.style.fill = color.fill;
  ele.style.stroke = color.stroke;

  ele = document.getElementById("iconClearBearingGp4");
  ele.style.stroke = color.stroke;

  if (color === BEAR.clearBearingColorFull) {
    AVID.undimIconSegment("iconClearBearingGp5");
  } else if (color === BEAR.clearBearingColorDim) {
    AVID.dimIconSegment("iconClearBearingGp5");
  } else {
    // Unknown territory -- do nothing.
  }

};

BEAR.dimConflictingAxisMarkerIcons = function (windowId) {
  BEAR.dimConflictingAxisMarkerIcon(AVID.NOSE, windowId);
  BEAR.dimConflictingAxisMarkerIcon(AVID.TAIL, windowId);
  BEAR.dimConflictingAxisMarkerIcon(AVID.TOP, windowId);
  BEAR.dimConflictingAxisMarkerIcon(AVID.BOTTOM, windowId);
  BEAR.dimConflictingAxisMarkerIcon(AVID.LEFT, windowId);
  BEAR.dimConflictingAxisMarkerIcon(AVID.RIGHT, windowId);
};

BEAR.dimConflictingAxisMarkerIcon = function (axisName, windowId) {

  if (AVID.current[axisName].windowId === windowId) {
    var iconName = AVID.icons[axisName];
    AVID.dimAxisMarkerIcon(iconName, windowId);
    AVID.dimAxisMarkerIcon(iconName + "Circle", windowId);
  }

};

/**
 * Force the icon bearing to go away.
 */
BEAR.hideBearingIcon = function () {
  document.getElementById(BEAR.iconBearingName + "Circle").style.strokeOpacity = AVID.dimIconOpacity;
  document.getElementById(BEAR.iconBearingName + "Text").style.fillOpacity = AVID.dimIconOpacity;

  AVID.undimAxisMarkerIcons();
};

/**
 * Make the icon bearing appear, but only if there is a bearing to display.
 */
BEAR.showBearingIcon = function () {
  var isFilled = !BEAR.isTargetBearingBlank();

  if (isFilled) {
    document.getElementById(BEAR.iconBearingName).style.visibility = "visible";
    document.getElementById(BEAR.iconBearingName + "Circle").style.visibility = (BEAR.targetBearing.isUpperHemisphere ? "hidden" : "visible");

    AVID.undimAxisMarkerIcons();
    BEAR.dimConflictingAxisMarkerIcons(BEAR.targetBearing.windowId);
  }

  /*
   * This is the only place where the iconBearing gets turn bright.
   * Do this task even if there isn't any current bearing to display.
   */
  document.getElementById(BEAR.iconBearingName + "Circle").style.strokeOpacity = AVID.fullIconOpacity;
  document.getElementById(BEAR.iconBearingName + "Text").style.fillOpacity = AVID.fullIconOpacity;
};

/**
 * The bearing icon must always point "up", no matter how the AVID is rotated.
 */
BEAR.fixBearingRotation = function () {
  var rotation = 360 - AVID.avidACoordinate;
  document.getElementById(BEAR.iconBearingName + "G").setAttribute("transform", "rotate(" + rotation + " 20 20)");
};

/**
 * Reset the select controls for a brand-new bearing.
 * For example, the select controls are restored from two-option mode to all six axes.
 */
BEAR.clearBearings = function () {
  BEAR.targetBearing = BEAR.makeBearingCopy(BEAR.blankBearing);

  BEAR.directSelects.distDH = "0";
  BEAR.directSelects.distDV = "0";

  BEAR.calcBearing(null, true, 0);
  BEAR.selectBearing = {clickedWindowId: null, windowId: null};
};

/**
 * Click handler for the AVID when entering bearings using direct-entry method.
 */
BEAR.bearingClickHandler = function (evt) {

  // Preserve the bearing for the result from the select.
  var windowId = AVID.getAvidWindowId(evt);
  BEAR.selectBearing.clickedWindowId = windowId;
  BEAR.selectBearing.windowId = null;

  // Identify which dropdown to use.
  var isHoriz;
  var targetDiv;
  var ctrlTargetUL;
  var targetClass;
  var valueLI;
  var avidWrapper = document.getElementById("avidWrapper");

  if (AVID.isWindowAmber(windowId) || AVID.isWindowBlue(windowId)) {

    /*
     * Calculate where the bearing scrollbars will go.  Various magic numbers are adjustments
     * to make the DIVs display in pleasing places.  Note that precalculation doesn't work well
     * because the values used here, such as for "avidWrapper" change once the bearing AVID is displayed.
     *
     * Needing to subtract 10 from the horizontal dialog width bothers me.  The number should be exactly
     * right, but in practice the DIV extends past the AVID and makes the browser expand the page width.
     *
     * In the Android Chrome browser there is a scrollbar for DIV "overflow".  If the DIV has an offset then
     * the scrollbar has an offset past the start of the DIV.  That is, the scrollbar starts at double the
     * offset of the DIV itself.  This results in the scrollbar sticking out past the end of the DIV -- unsightly.
     * The current sure cure is to start the scrolling DIV at the edge of the display.
     */
    targetDiv = "divBearingHorizontalEntryDialog";
    var divBearingHorizontalEntryDialog = document.getElementById(targetDiv);
    divBearingHorizontalEntryDialog.style.left = "0px";
    divBearingHorizontalEntryDialog.style.top = (avidWrapper.offsetTop + avidWrapper.offsetHeight - divBearingHorizontalEntryDialog.offsetHeight - 80).toString() + "px";
    divBearingHorizontalEntryDialog.style.width = (avidWrapper.offsetLeft + avidWrapper.offsetWidth - 10).toString() + "px";

    isHoriz = true;
    ctrlTargetUL = document.getElementById("divBearingHorizontalEntryDialogUL");
    targetClass = "hlist";

    valueLI = parseInt(BEAR.directSelects.distDH, 10);
  } else {
    targetDiv = "divBearingVerticalEntryDialog";
    var divBearingVerticalEntryDialog = document.getElementById(targetDiv);
    divBearingVerticalEntryDialog.style.left = (avidWrapper.offsetLeft + 30).toString() + "px";
    divBearingVerticalEntryDialog.style.top = "0px";
    divBearingVerticalEntryDialog.style.height = (avidWrapper.offsetTop + avidWrapper.offsetHeight).toString() + "px";

    isHoriz = false;
    ctrlTargetUL = document.getElementById("divBearingVerticalEntryDialogUL");
    targetClass = "vlist";
    valueLI = parseInt(BEAR.directSelects.distDV, 10);
  }

  /*
   * The modal layer protect against user edits.  The user can only select a bearing distance.
   * The widths and heights of "document.body" change as different panels are displayed.
   * The use of "document.body.offsetHeight" is unreliable.  Better to choose the bottom edge
   * of the "divBearingControls".
   */
  var divBC = document.getElementById("divBearingControls");

  var ele = document.getElementById("divAvidModal");
  ele.style.left = parseInt(document.body.offsetLeft, 10).toString() + "px";
  ele.style.top = parseInt(document.body.offsetTop, 10).toString() + "px";
  ele.style.width = parseInt(document.body.offsetWidth, 10).toString() + "px";
  ele.style.height = (divBC.offsetTop + divBC.offsetHeight).toString() + "px";
  ele.style.visibility = "visible";

  ele = document.getElementById(targetDiv);
  ele.style.visibility = "visible";
  ele.style.display = "inline";

  // Ensure the selected picklist LI is visible within its window.
  BEAR.scrollSelectedLI(targetClass, ctrlTargetUL, isHoriz, valueLI);

  // Redraw the alternating colors of this picklist.
  BEAR.setPicklistLIColors(targetClass, valueLI);
};

/**
 * Scroll the horizontal or vertical picklist so the selected LI is displayed
 * visibly in it, preferrably in the center.
 */
BEAR.scrollSelectedLI = function (targetClass, ctrlTargetUL, isHoriz, valueLI) {

  /*
   * How to put the LIs so that the selected one is as close to the center of the display window as possible?
   *
   * * The total width/height of the UL, from the beginning to the left/top of the LI to display
   *   is (LI width/height + 4px margin) * (count of windows prior to the displayed one).
   *   This is widthToSelectedLI.
   * * The total width/height of the UL is (LI width/height + 4px margin) * (total count of windows)
   *   - 4px margin of last window.  This is widthAllLIs;
   * * The total width of the UL is widthUL.
   * * Half the width of the UL is halfWidthUL.
   *
   * To display the LI in the center, scroll into the list by widthToSelectedLI.  This puts the
   * displayed LI at the left/top of the list.  Now back up by halfWidthUL.  This puts the displayed
   * LI in the middle of the displayed UL.  The formula for scroll amount is:
   * (widthToSelectedLI - halfWidthUL).
   *
   * If the displayed LI is too close to the left/top of the list then the start of the list would
   * have lots of white space.  That is, things display badly when (widthToSelectedLI < halfWidthUL).
   * Choose the max of the two.  The formula for scroll amount becomes:
   * (max(widthToSelectedLI, halfWidthUL) - halfWidthUL).
   *
   * If the displayed LI is too close to the right/bottom of the list then the end of the list has
   * that extra white space.  That is, when widthToSelectedLI > (widthAllLIs - widthUL).  Choose the
   * minimum of these two.
   *
   * The net scrolling formula becomes:
   * (max(min(widthToSelectedLI, (widthAllLIs - widthUL)), halfWidthUL) - halfWidthUL).
   */
  var targetLIs = document.getElementsByClassName(targetClass);
  var lenLIs = targetLIs.length;
  var targetLI;
  var idx;
  var widthLI = -1;

  for (idx = 0; idx < lenLIs; idx++) {
    targetLI = targetLIs[idx];

    if (widthLI < 0) {

      if (isHoriz)
        widthLI = parseInt(targetLI.offsetWidth, 10) + 4;
      else
        widthLI = parseInt(targetLI.offsetHeight, 10) + 4;

    }

    if (targetLI.value === valueLI)
      break;

  }

  var widthToSelectedLI = widthLI * idx;
  var widthAllLIs = widthLI * lenLIs - 4;
  var widthUL;

  if (isHoriz)
    widthUL = ctrlTargetUL.offsetWidth;
  else
    widthUL = ctrlTargetUL.offsetHeight;

  var halfWidthUL = Math.floor(widthUL / 2);

  var scrollAmount = (Math.max(Math.min(widthToSelectedLI, (widthAllLIs - widthUL)), halfWidthUL) - halfWidthUL);

  if (isHoriz)
    ctrlTargetUL.scrollLeft = scrollAmount;
  else
    ctrlTargetUL.scrollTop = scrollAmount;

};

/**
 * The picklist whose elements are identified by "targetClass" will get colored.
 * The previous showing of this picklist probably left one LI in "selected" color
 * and another in "flash" color.  Reset all so that they are only even, odd or selected.
 */
BEAR.setPicklistLIColors = function (targetClass, valueLI) {
  var targetLIs = document.getElementsByClassName(targetClass);
  var lenLIs = targetLIs.length;
  var targetLI;
  var colorLI;

  for (var idx = 0; idx < lenLIs; idx++) {
    targetLI = targetLIs[idx];

    if (targetLI.value === valueLI) {
      colorLI = BEAR.colorSelectedLI;
    } else {
      colorLI = (idx % 2 === 0) ? BEAR.colorEvenLI : BEAR.colorOddLI;
    }

    targetLI.style.color = colorLI.color;
    targetLI.style.backgroundColor = colorLI.backgroundColor;
  }

};

/**
 * Hide both direct-select controls.  Easier than remembering which one is displayed.
 */
BEAR.hideDirectSelectControls = function () {
  var ele = document.getElementById("divBearingHorizontalEntryDialog");
  ele.style.visibility = "hidden";
  ele.style.display = "none";

  ele = document.getElementById("divBearingVerticalEntryDialog");
  ele.style.visibility = "hidden";
  ele.style.display = "none";

  var ele = document.getElementById("divAvidModal");
  ele.style.visibility = "hidden";
};

BEAR.showStatusMessage = function (msg) {
  document.getElementById("divAvidBearingStatus").innerHTML = msg;
};

BEAR.clearStatusMessage = function (msg) {
  BEAR.showStatusMessage("&nbsp;");
};

BEAR.showNoBearingMessage = function () {
  BEAR.showStatusMessage("No bearing solution -- need more range");
};

BEAR.hideNoBearingMessage = function () {
  BEAR.showStatusMessage("&nbsp;");
};

BEAR.enableStatusMessage = function () {
  var ele = document.getElementById("divAvidBearingStatus");
  AVID.showElement(ele);
};

BEAR.disableStatusMessage = function () {
  var ele = document.getElementById("divAvidBearingStatus");
  AVID.hideElement(ele);
};

/**
 * Prepare the AVID to respond to window clicks.
 */
BEAR.enableAvidBearings = function () {
  var avidWindows = document.getElementById("avidWindows");
  avidWindows.addEventListener("click", BEAR.bearingClickHandler, false);

  // If the opacity is clear then the SVG won't accept a click on that area.
  BEAR.setAvidBearingsOpacity(AVID.OPACITY_TINY);
};

/**
 * Have the AVID cease responding to window clicks.
 */
BEAR.disableAvidBearings = function () {
  var avidWindows = document.getElementById("avidWindows");
  avidWindows.removeEventListener("click", BEAR.bearingClickHandler, false);

  BEAR.setAvidBearingsOpacity(AVID.OPACITY_CLEAR);
};

/**
 * Set the opacity in the "AVID bearings" controls.
 *
 * A bearing can be set by clicking on windows of the AVID.
 * This function prepares the windows to receive a click, or not.
 * A window needs a non-zero opacity in order to receive a click.
 */
BEAR.setAvidBearingsOpacity = function (opacity) {
  var strDeg;

  for (var idx = 0; idx <= 330; idx += 30) {
    strDeg = AVID.getDegreesStringForWindowId(idx);
    document.getElementById("b00." + strDeg).style.fillOpacity = opacity;
    document.getElementById("b30." + strDeg).style.fillOpacity = opacity;

    if (idx % 60 === 0)
      document.getElementById("b60." + strDeg).style.fillOpacity = opacity;

  }

  document.getElementById("b90.pol").style.fillOpacity = opacity;
};

/**
 * Are the (windowId, range) combo of BEAR.targetBearing blank?
 */
BEAR.isTargetBearingBlank = function () {
  return BEAR.isBearingBlank(BEAR.targetBearing.windowId, BEAR.targetBearing.range);
};

/**
 * Are the windowId or range blank?  If the combo doesn't currently
 * point at a bearing then parts of it are null or 0.
 */
BEAR.isBearingBlank = function (windowId, range) {
  return (windowId === null || range === 0);
};

/**
 * Clone the passed-in bearing object.
 */
BEAR.makeBearingCopy = function (source) {
  var newObj = {};
  newObj.windowId = null;
  newObj.isUpperHemisphere = true;
  newObj.range = 0;

  return newObj;
};

BEAR.toggleBearingAltitude = function () {

  if (!BEAR.isTargetBearingBlank()) {
    BEAR.targetBearing.isUpperHemisphere = !BEAR.targetBearing.isUpperHemisphere;

    var altitude = BEAR.directSelects.distDV;

    if (altitude !== 0)
      BEAR.directSelects.distDV = (-altitude).toString();

    BEAR.calcBearing(BEAR.targetBearing.windowId, BEAR.targetBearing.isUpperHemisphere, BEAR.targetBearing.range);
  }

};

/**
 * The user has clicked on a LI of the horizontal picklist.
 */
BEAR.clickedHorizontalLI = function (evt) {
  BEAR.directSelects.distDH = evt.target.value.toString();

  // Flash that this was clicked.

  evt.target.style.color = BEAR.colorFlashLI.color;
  evt.target.style.backgroundColor = BEAR.colorFlashLI.backgroundColor;

  setTimeout("BEAR.clickedLI()", 200);
};

/**
 * The user has clicked on a LI of the vertical picklist.
 */
BEAR.clickedVerticalLI = function (evt) {
  BEAR.directSelects.distDV = evt.target.value.toString();

  // Flash that this was clicked.

  evt.target.style.color = BEAR.colorFlashLI.color;
  evt.target.style.backgroundColor = BEAR.colorFlashLI.backgroundColor;

  setTimeout("BEAR.clickedLI()", 200);
};

/**
 * The user has clicked on a picklist LI.
 */
BEAR.clickedLI = function () {

  /*
   * The ID of the clicked-on window was stored in a global prior to the horizontal select being called.
   * The hemisphere is also stored in the global.
   */
  var clickedWindowId = BEAR.selectBearing.clickedWindowId;
  var distH = parseInt(BEAR.directSelects.distDH, 10);
  var rawDistV = parseInt(BEAR.directSelects.distDV, 10);
  var distV = Math.abs(rawDistV);
  var isUpperHemisphere = (rawDistV >= 0);

  /*
   * If the range is zero then calculateDirectSelectWindowId() returns a null window ID.
   * This is OK because calcBearing() knows what to do with a null value.
   */
  var windowId = BEAR.calculateDirectSelectWindowId(clickedWindowId, distH, distV);
  BEAR.selectBearing.windowId = windowId;
  var range = Math.floor(Math.sqrt((distH * distH) + (distV * distV)));
  BEAR.calcBearing(windowId, isUpperHemisphere, range);

  BEAR.hideDirectSelectControls();
};

/**
 * Close the picklist without selecting anything.
 */
BEAR.cancelPicklist = function () {
  BEAR.hideDirectSelectControls();
};
