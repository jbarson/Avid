/**
 * The AVID Assistant is Copyright 2015 Ad Astra Games.
 */

/**
 * On refresh, some browsers preserve the state of the global AVID variable.
 * Force a reload by deleting any existing AVID variable.
 */

//if (BRIDGE) {
//  delete BRIDGE;
//}

var BRIDGE = {};

/**
 * Which game turn is this?
 */
BRIDGE.currentTurn = 1;

BRIDGE.AVID = "AVID";
BRIDGE.FISHBOWL = "FISHBOWL";
BRIDGE.ROSTER = "ROSTER";
BRIDGE.view = BRIDGE.AVID;

/**
 * The "currentRosterId" points at the currently selected ship.  It would be used both by the editing and command pages.
 * The "editedShip" object is extracted from the ships[] list (when editing) or created fresh (for adding).  It is a
 * scratch area, used until the object is approved for storage into the ships[] list.
 */
BRIDGE.currentRosterId = null;
BRIDGE.editedShip = null;
BRIDGE.editedShipOriginalId = null;

//JB presentation with logic
BRIDGE.colorSelected = "#dddddd";
BRIDGE.colorNotSelectedEven = "#edf9fc";
BRIDGE.colorNotSelectedOdd = "#dcf2f8";
BRIDGE.colorFixAvidBackground = "#bababa";

/**
 * Default values for the per-ship maneuvering limits.
 */
BRIDGE.maxPivots = 6;
BRIDGE.maxRolls = 6;

/**
 * SEE BOTTOM OF FILE FOR DEFINITION OF panels[].
 */

/**
 * a ship has the following attributes:
 * * id -- a string that uniquely identifies the ship to the program, perhaps to the game board as well.
 * * name -- any name the user desires.
 *
 * * maxPivots -- the maximum number of allowed pivots per turn.
 * * maxRolls -- the maximum number of allowed rolls per turn.
 *
 * * current, from AVID.current -- the current ship position.
 * * pivots, from AVID.pivots -- the undo list for pivots.
 * * rolls, from AVID.rolls -- the undo list for rolls.
 *
 * * avidMovementMode, from AVID.avidMovementMode -- when the avid was at the helm, was it pivoting, rolling or done.
 * * avidFunction, from AVID.avidFunction -- if the avid was at the helm or doing a bearing.
 *
 * * targetBearing, from BEAR.targetBearing -- remembers the most recent target.
 * * movementModel, from AVID.movementModel -- movement mode (0, 1, 2).
 * * avidACoordinate, from AVID.avidACoordinate -- the direction the avid is pointing.
 * * hexagonColor, from AVID.hexagonColor -- the avid background color.
 */
BRIDGE.ships = {};

/**
 * In the AVID, clicking on the ship name/ID field navigates to the fleet command panel -- mostly.
 */
BRIDGE.handleShipIdName = function () {

  /*
   * The user exits from the AVID display through clicking on the ship name field.  What happens
   * next depends on context.
   * * If the user was maneuvering then return to the fleet command panel.
   * * If the user was adjusting a ship ("isAdjustingShipOrientation"), where the user
   *   originated the action from the ship roster panel, then return to that panel.
   *
   * Either way, save the current ship data.
   */
  if (AVID.isAdjustingShipOrientation) {
    BRIDGE.doneAdjustingShip();

    BRIDGE.showPanel("shipRoster");
    return;
  }

  BRIDGE.saveAVIDIntoRoster();
  BRIDGE.saveToDatabase();

  BRIDGE.showPanel("fleetCommand");
};

/**
 * In the AVID, clicking on the ship name/ID field navigates to the fleet command panel -- mostly.
 */
BRIDGE.handleAdjustAVID = function () {

  if (BRIDGE.currentRosterId === null) {
    return;
  }


  if (AVID.pivots.length > 0 || AVID.rolls.length > 0) {

    if (!window.confirm("Fixing THIS SHIP erases all Pivots and Rolls.  Proceed anyway?")) {
      return;
    }

  }

  AVID.disableStatusMessage();
  BEAR.disableStatusMessage();
  BRIDGE.showPanel("adjustAVID");
};

/**
 * Allow navigation only when there is a selected ship.
 */
BRIDGE.showPanelGuarded = function (panelKey) {

  if (BRIDGE.currentRosterId === null){
    return;
  }

  BRIDGE.showPanel(panelKey);
};

/**
 * Display the panel identified by "panelKey", hiding all of the other panels.
 *
 * The "panels" list contains all full-page panels.  Most of these are reached simply by showing a DIV.
 * Others, such as helm, are part of a complex DIV and need a post-function to finish the job.
 *
 * Return true on success and false if the requested panel, or post-function, doesn't exist.
 */
BRIDGE.showPanel = function (panelKey) {

  // If the panel key is misnamed then nothing can be done.
  var showPanel = BRIDGE.panels[panelKey];

  if (!showPanel)
    return false;

  /*
   * The requested panel might be one of many sub-panels.  While working through the panels[] list
   * that parent might be encountered many times.  The "shown" variable tells us that we already showed
   * the parent, and so don't display it again.  However, we don't mind hiding it multiple times.
   */
  var showDivId = showPanel.id;
  var panel;
  var divId;
  var ele;
  var shown = false;

  for (var key in BRIDGE.panels) {
    panel = BRIDGE.panels[key];
    divId = panel.id;
    ele = document.getElementById(divId);

    if (divId === showDivId) {

      if (!shown) {
        shown = true;
        ele.style.visibility = "visible";
        ele.style.display = "";
      }

    } else {
      ele.style.visibility = "hidden";
      ele.style.display = "none";
    }

  }

  /*
   * If the panel has a post-function then run it.
   */
  var postFcn = showPanel.postFcn;

  if (!postFcn)
    return true;

  if (typeof postFcn !== "function")
    return false;

  postFcn();

  return true;
};

BRIDGE.newGameSetup = function () {

  if (BRIDGE.countShips() !== 0) {

    if (!BRIDGE.deleteAllFromRoster())
      return;

  }


  BRIDGE.showElement("btnGameSetupNext");
  BRIDGE.showPanel("gameSetup");
};

/**
 * Initialize the controls in the "game setup" panel.
 */
BRIDGE.gameSetupLoad = function () {
  BRIDGE.setElementValue("currentTurn", BRIDGE.currentTurn);
  BRIDGE.setElementValue("defaultMaxPivots", BRIDGE.maxPivots);
  BRIDGE.setElementValue("defaultMaxRolls", BRIDGE.maxRolls);
  BRIDGE.setElementValue("pivotAdjustment", AVID.pivotAdjustment);
  BRIDGE.setElementValue("defaultMovementModel", AVID.defaultMovementModel);
  BRIDGE.setElementValue("shootBearingsModel", AVID.shootBearingsModel);
};

/**
 * The string "value" must be a number string with a value between minVal and maxVal, inclusive.
 *
 * On failure display what went wrong.
 *
 * Returns true if the number is in bounds.
 */
BRIDGE.testNumber = function (name, value, minVal, maxVal) {

  try {

    if (!value || value.trim().length === 0) {
      window.alert(name + " can't be blank.");
      return false;
    }

    if (isNaN(value)) {
      window.alert(name + " must be a number, so '" + value + "', isn't allowed.");
      return false;
    }

    var parsed = parseInt(value, 10);

    if (!(minVal <= parsed && parsed <= maxVal)) {
      window.alert(name + " must be between " + minVal + " and " + maxVal + ".");
      return false;
    }

    return true;
  } catch (e) {
    window.alert("Using " + value + " for " + name + " gave weird result.  \n\nTry another value.\n\n(Exception: " + e.message + ")");
    return false;
  }

};

/**
 * Save the user changes from the "game setup" panel.
 * No automatic navigation.  Let the user move to another feature.
 */
BRIDGE.gameSetupSave = function () {

  /*
   * It seems the mobile devices don't yet support the INPUT tag "pattern" parameter.  Must validate by hand.
   *
   * Prove the value is short enough, and also prove that the data is a value.
   */
  var ctrlValueCurrentTurn = BRIDGE.getElementValue("currentTurn");
  var retval = BRIDGE.testNumber("Current Turn", ctrlValueCurrentTurn, 0, 999);

  if (!retval)
    return;

  var ctrlValueMaxPivots = BRIDGE.getElementValue("defaultMaxPivots");
  retval = BRIDGE.testNumber("Default maximum pivots per turn", ctrlValueMaxPivots, 0, 99);

  if (!retval)
    return;

  var ctrlValueMaxRolls = BRIDGE.getElementValue("defaultMaxRolls");
  retval = BRIDGE.testNumber("Default maximum rolls per turn", ctrlValueMaxRolls, 0, 99);

  if (!retval)
    return;

  BRIDGE.currentTurn = ctrlValueCurrentTurn;
  document.getElementById("currentTurn").innerHTML = BRIDGE.currentTurn;

  BRIDGE.maxPivots = ctrlValueMaxPivots;
  BRIDGE.maxRolls = ctrlValueMaxRolls;
  var ctrlValue;

  ctrlValue = BRIDGE.getElementValue("pivotAdjustment");

  if (ctrlValue !== null)
    AVID.pivotAdjustment = ctrlValue;

  ctrlValue = BRIDGE.getElementValue("defaultMovementModel");

  if (ctrlValue !== null)
    AVID.defaultMovementModel = ctrlValue;

  ctrlValue = BRIDGE.getElementValue("shootBearingsModel");

  if (ctrlValue !== null)
    AVID.shootBearingsModel = ctrlValue;

  /*
   * In case not yet done.
   */
  BRIDGE.saveAVIDIntoRoster();
  BRIDGE.saveToDatabase();
};

/**
 * When setting up a new game the user has completed the "Game Setup" panel.
 * Clear the game setup values and navigate to the ship design panel.
 */
BRIDGE.gameSetupNext = function () {
  BRIDGE.hideElement("btnGameSetupNext");
  BRIDGE.gameSetupSave();
  BRIDGE.showPanel("shipRoster");
};

/**
 * Set the value for either a "text" INPUT control or a "radio" INPUT control set.
 */
BRIDGE.setElementValue = function (eleName, setValue, isRadio) {

  /*
   * Must point at a control.
   */
  if (!eleName)
    return;

  var eleList = document.getElementsByName(eleName);

  if (eleList.length === 0)
    return;

  // The caller tells us if this is supposed to be a radio control or a text control.
  if (isRadio) {
    var eleListLen = eleList.length;
    var ele;

    /*
     * The ele.value will be a string, but setValue might be numeric or string.
     * Convert setValue to a string to ensure comparison.
     */
    for (var idx = 0; idx < eleListLen; idx++) {
      ele = eleList[idx];
      ele.checked = (ele.value === ("" + setValue));
    }

    return;
  }

  // A text control.
  eleList[0].value = setValue;
};

/**
 * Extract the value from either a "text" INPUT control or a "radio" INPUT control set.
 *
 * Return a value if the control is found, or a null if something went wrong.
 */

BRIDGE.getElementValue = function (eleName, isRadio) {

  /*
   * Must point at a control.
   */
  if (!eleName)
    return null;

  var eleList = document.getElementsByName(eleName);

  if (eleList.length === 0)
    return null;

  // The caller tells us if this is supposed to be a radio control or a text control.
  if (isRadio) {
    var eleListLen = eleList.length;
    var ele;

    for (var idx = 0; idx < eleListLen; idx++) {
      ele = eleList[idx];

      if (ele.checked)
        return ele.value;

    }

    return null;
  }

  // A text control or select control.
  return eleList[0].value;
};

/**
 * The currently highlighted ship in the roster control is remembered for editing.
 */
BRIDGE.rosterSelection = function () {
  var ctrl = event.currentTarget;

  // The LI class name has the ship's ID stored there in "className", not in "class".
  BRIDGE.setCurrentRoster(ctrl.className);

  // Now that the global has it, update the pick list.
  BRIDGE.rosterHighlight();
};

/**
 * Update the roster pick list, always highlighting the current roster ID.
 */
BRIDGE.rosterHighlight = function () {
  var noShipSelected = (BRIDGE.currentRosterId === null);
  document.getElementById("btnShipRosterDeleteShip").disabled = noShipSelected;
  document.getElementById("btnShipRosterEditShip").disabled = noShipSelected;
  document.getElementById("btnShipRosterAdjustShip").disabled = noShipSelected;

  BRIDGE.shipListHighlight("shipRosterList");
};

/**
 * The currently highlighted ship in the roster control is remembered for editing.
 */
BRIDGE.commandSelection = function () {
  var ctrl = event.currentTarget;

  // The LI class name has the ship's ID stored there in "className", not in "class".
  BRIDGE.setCurrentRoster(ctrl.className);

  // Now that the global has it, update the pick list.
  BRIDGE.commandHighlight();
};

/**
 * Update the fleet command pick list, always highlighting the current roster ID.
 */
BRIDGE.commandHighlight = function () {
  BRIDGE.commandButtonsAdjust();
  BRIDGE.shipListHighlight("fleetCommandList");
};

/**
 * The fleet command panel has three buttons (helm, bearing, fishbowl).
 * While they are guarded against bad action by showPanelGuarded() (on a blank
 * current roster ID the function has an early return), they should visually show
 * the story.
 */
BRIDGE.commandButtonsAdjust = function () {
  var fcnSetOpacity = (BRIDGE.currentRosterId === null) ? AVID.dimIconSegment : AVID.undimIconSegment;

  BRIDGE.helmFCButtonAdjust(fcnSetOpacity);
  BRIDGE.bearingFCButtonAdjust(fcnSetOpacity);
  BRIDGE.fishbowlFCButtonAdjust(fcnSetOpacity);
};

/**
 * Dim or undim the "helm" icon in the fleet command panel.
 */
BRIDGE.helmFCButtonAdjust = function (fcnSetOpacity) {
  fcnSetOpacity("iconHelmSelectFCGp1");
  fcnSetOpacity("iconHelmSelectFCGp2");
};

/**
 * Dim or undim the "bearing" icon in the fleet command panel.
 */
BRIDGE.bearingFCButtonAdjust = function (fcnSetOpacity) {
  fcnSetOpacity("iconBearingSelectFCGp1");
  fcnSetOpacity("iconBearingSelectFCGp2");
  fcnSetOpacity("iconBearingSelectFCGp3");
  fcnSetOpacity("iconBearingSelectFCGp4");
  fcnSetOpacity("iconBearingSelectFCGp5");
};

/**
 * Dim or undim the "fishbowl" icon in the fleet command panel.
 */
BRIDGE.fishbowlFCButtonAdjust = function (fcnSetOpacity) {
  fcnSetOpacity("iconFishbowlSelectFCGp1");
  fcnSetOpacity("iconFishbowlSelectFCGp2");
  fcnSetOpacity("iconFishbowlSelectFCGp3");
  fcnSetOpacity("iconFishbowlSelectFCGp4");
  fcnSetOpacity("iconFishbowlSelectFCGp5");
  fcnSetOpacity("iconFishbowlSelectFCGp6");
  fcnSetOpacity("iconFishbowlSelectFCGp7");
};

/**
 * Update a ship pick list.
 */
BRIDGE.shipListHighlight = function (shipListName) {
  var rosterShips = document.getElementById(shipListName).getElementsByTagName("li");
  var rosterLen = rosterShips.length;
  var rosterShip;
  var bgColor;
  var selectedLI = null;

  for (var idx = 0; idx < rosterLen; idx++) {
    rosterShip = rosterShips[idx];

    if (rosterShip.className === BRIDGE.currentRosterId) {
      selectedLI = rosterShip;
      bgColor = BRIDGE.colorSelected;
    } else {
      bgColor = idx % 2 === 0 ? BRIDGE.colorNotSelectedEven : BRIDGE.colorNotSelectedOdd;
    }

    rosterShip.getElementsByClassName("showId")[0].style.backgroundColor = bgColor;
    rosterShip.getElementsByClassName("showName")[0].style.backgroundColor = bgColor;
    rosterShip.getElementsByClassName("showStatus")[0].style.backgroundColor = bgColor;
  }

  // Ensure that the selected ship is visible in the pick list control.
  if (selectedLI !== null)
    selectedLI.scrollIntoView();

};

/**
 * Tweak the display of ships based on the ships[] list.
 */
BRIDGE.shipRosterLoad = function () {
  var rosterShips = document.getElementById("shipRosterList").getElementsByTagName("li");
  var rosterLen = rosterShips.length;

  for (var idx = 0; idx < rosterLen; idx++) {

    //The &nbsp; is needed or the background color doesn't display full-height.
    rosterShips[idx].getElementsByClassName("showStatus")[0].innerHTML = "&nbsp;";
  }

  BRIDGE.rosterHighlight();
};

/**
 * Create a new ship, then edit it.
 */
BRIDGE.addShip = function () {
  BRIDGE.editedShip = BRIDGE.createNewShip();

  BRIDGE.showPanel("editShip");
};

/**
 * Create a new, default ship object.
 */
BRIDGE.createNewShip = function () {
  var newShip = {};
  newShip.id = "";
  newShip.name = "";
  newShip.maxPivots = BRIDGE.maxPivots;
  newShip.maxRolls = BRIDGE.maxRolls;
  newShip.current = AVID.makeAxesCopy(AVID.initialAxes);
  newShip.pivots = [];
  newShip.rolls = [];
  newShip.avidMovementMode = AVID.PIVOT;
  newShip.avidFunction = AVID.HELM;
  newShip.targetBearing = BEAR.makeBearingCopy(BEAR.blankBearing);
  newShip.movementModel = AVID.defaultMovementModel;
  newShip.avidACoordinate = 0;
  newShip.hexagonColor = AVID.hexagonColorBlue;
  newShip.directSelects = {distDH: "0", distDV: "0"};
  newShip.isNew = true;

  return newShip;
};

/**
 * Clone and return an entire ship.
 */
BRIDGE.cloneShip = function (source) {
  var target = BRIDGE.createNewShip();

  /*
   * The simple strings and numbers can be copied without fear of sharing object pointers.
   * These are id, name, avidMovementMode, avidFunction, movementModel, avidACoordinate.
   *
   * Some objects can be copied because they aren't being edited.  These are hexagonColor.
   *
   * Some objects needs to be cloned.  These are current, pivots, rolls, targetBearing, directSelects.
   */
  target.id = source.id;
  target.name = source.name;
  target.maxPivots = source.maxPivots;
  target.maxRolls = source.maxRolls;
  target.current = AVID.makeAxesCopy(source.current);
  target.pivots = AVID.makeAxesListCopy(source.pivots);
  target.rolls = AVID.makeAxesListCopy(source.rolls);
  target.avidMovementMode = source.avidMovementMode;
  target.avidFunction = source.avidFunction;
  target.targetBearing = BEAR.makeBearingCopy(source.targetBearing);
  target.movementModel = source.movementModel;
  target.avidACoordinate = source.avidACoordinate;
  target.hexagonColor = source.hexagonColor;
  target.directSelects = {
    distDH: source.directSelects.distDH,
    distDV: source.directSelects.distDV
  };

  if (source.isNew)
    target.isNew = source.isNew;
  else
    delete target.isNew;

  return target;
};

/**
 * Edit the ship selected in the roster list.
 */
BRIDGE.editShip = function () {
  BRIDGE.saveAVIDIntoRoster();

  BRIDGE.editedShip = BRIDGE.cloneShip(BRIDGE.ships[BRIDGE.currentRosterId]);
  BRIDGE.editedShipOriginalId = BRIDGE.editedShip.id;

  BRIDGE.showPanel("editShip");
};

/**
 * Fill the ship edit page with values from the selected ship.
 */
BRIDGE.editShipLoad = function () {
  var editedShip = BRIDGE.editedShip;
  BRIDGE.setElementValue("shipId", editedShip.id);
  BRIDGE.setElementValue("shipName", editedShip.name);
  BRIDGE.setElementValue("maxPivots", editedShip.maxPivots);
  BRIDGE.setElementValue("maxRolls", editedShip.maxRolls);
  BRIDGE.setElementValue("movementModel", editedShip.movementModel);
  BRIDGE.setElementValue("hexagonColor", (AVID.hexagonColorEqual(editedShip.hexagonColor, AVID.hexagonColorRed) ? "red" : "blue"));

  document.getElementById("divEditShipTitle").innerHTML = (editedShip.id === "" ? "Add Ship" : "Edit Ship");
};

/**
 * Save the user changes from the "edit ship" panel.
 * Then navigate to either the ship roster panel or back to the edit ship panel.
 *
 * "addAnother" exists and is true if the user will directly add another ship.
 */
BRIDGE.editShipSave = function (addAnother) {

  if (addAnother === undefined)
    addAnother = false;

  // Fill the scratch ship object with the altered values.
  var editedShip = BRIDGE.editedShip;
  var ctrlValue = BRIDGE.getElementValue("shipId");
  editedShip.id = (ctrlValue === null) ? "" : ctrlValue.trim();

  ctrlValue = BRIDGE.getElementValue("shipName");
  editedShip.name = (ctrlValue === null) ? "" : ctrlValue.trim();

  ctrlValue = BRIDGE.getElementValue("maxPivots");
  editedShip.maxPivots = (ctrlValue === null) ? "" : ctrlValue.trim();

  ctrlValue = BRIDGE.getElementValue("maxRolls");
  editedShip.maxRolls = (ctrlValue === null) ? "" : ctrlValue.trim();

  ctrlValue = BRIDGE.getElementValue("movementModel");

  if (ctrlValue !== null)
    editedShip.movementModel = parseInt(ctrlValue, 10);

  ctrlValue = BRIDGE.getElementValue("hexagonColor");

  if (ctrlValue !== null)
    editedShip.hexagonColor = (ctrlValue === "red") ? AVID.hexagonColorRed : AVID.hexagonColorBlue;

  var noseWindowId = BRIDGE.getElementValue("initialShipPitch") + "." + BRIDGE.getElementValue("initialShipDirection");

  if (!BRIDGE.validateEditedShip(editedShip, noseWindowId))
    return;

  editedShip.current = AVID.calculateAxesForNewShip(noseWindowId);

  /*
   * Both sets of ships (rosterShips and fleetShips) will have the same entries, and thus the same length.
   */
  var roster = document.getElementById("shipRosterList");
  var rosterShips = roster.getElementsByTagName("li");

  var fleet = document.getElementById("fleetCommandList");
  var fleetShips = fleet.getElementsByTagName("li");

  var rosterLen = rosterShips.length;
  var isNew = editedShip.isNew;
  var rosterShip;

  if (isNew) {

    /*
     * This valid result is new, and must be appended.
     * Create a list item, appending it to the roster list.
     * Ditto for the fleet list.
     */
    roster.appendChild(BRIDGE.createShipRosterLine(editedShip));
    fleet.appendChild(BRIDGE.createFleetCommandLine(editedShip));
  } else {

    /*
     * This valid result replaces the existing ship data.
     * Identify the record in each of the two lists and update their ID and name values.
     */
    for (var idx = 0; idx < rosterLen; idx++) {
      rosterShip = rosterShips[idx];

      if (rosterShip.className === BRIDGE.currentRosterId) {
        rosterShip.className = editedShip.id;
        rosterShip.getElementsByClassName("showId")[0].innerHTML = editedShip.id;
        rosterShip.getElementsByClassName("showName")[0].innerHTML = editedShip.name;
        break;
      }

    }

    for (var idx = 0; idx < rosterLen; idx++) {
      rosterShip = fleetShips[idx];

      if (rosterShip.className === BRIDGE.currentRosterId) {
        rosterShip.className = editedShip.id;
        rosterShip.getElementsByClassName("showId")[0].innerHTML = editedShip.id;
        rosterShip.getElementsByClassName("showName")[0].innerHTML = editedShip.name;
        break;
      }

    }

  }

  /*
   * The screen controls have been updated.  Now update the ships[] entry.
   * Remember that a temporary "isNew" was added.
   *
   * The user can also update the ship ID.  This means the old item of the
   * association list (BRIDGE.ships[] is NOT a simple indexed array) must
   * be de-associated.
   */
  delete editedShip.isNew;

  if (BRIDGE.editedShip.id !== BRIDGE.editedShipOriginalId)
    delete BRIDGE.ships[BRIDGE.editedShipOriginalId];

  BRIDGE.ships[editedShip.id] = editedShip;
  BRIDGE.currentRosterId = editedShip.id;
  BRIDGE.putRosterIntoAVID();

  BRIDGE.saveToDatabase();

  BRIDGE.rosterHighlight();
  BRIDGE.commandHighlight();

  if (addAnother)
    BRIDGE.addShip();
  else
    BRIDGE.showPanel("shipRoster");

};

/**
 * Prove that an edited ship is filled correctly.
 *
 * Return true when the ship is OK, and false otherwise.
 */
BRIDGE.validateEditedShip = function (editedShip, windowId) {

  /*
   * The "shipId" must be non-blank and unique within the ship roster.
   * The "shipName" is allowed to be blank.
   * The other values fill from radio button sets and every value is OK.
   *
   * When the edit page was set up to edit an existing ships[] record the editedShip
   * object was taken from the ships[] entry for currentRosterId.  If editing and the
   * ID still equals that then this is OK.
   *
   * When the edit page was set up to add a new record the editedShip object was given
   * an extra "isNew" attribute.  If the edited ship has an ID equal to currentRosterId
   * then this is an error.
   *
   * Rely on the caller having normalized the variables to non-null, trimmed strings.
   */
  if (editedShip.id.trim() === "") {
    window.alert("The ship ID can't be blank.");
    return false;
  }

  var rosterShips = document.getElementById("shipRosterList").getElementsByTagName("li");
  var rosterLen = rosterShips.length;
  var isNew = editedShip.isNew;
  var rosterShip;

  for (var idx = 0; idx < rosterLen; idx++) {
    rosterShip = rosterShips[idx];

    if (rosterShip.className !== editedShip.id)
      continue;

    /*
     * The edited ship matches the ID of this ship in the roster.  If editing a ship,
     * and the ship being edited is that for currentRosterId, then this loop has
     * stopped at the current ship, the one being edited, and the ID points at
     * itself.  All is OK.
     *
     * We are editing if (!isNew).
     */
    if (editedShip.id === BRIDGE.currentRosterId && !isNew)
      continue;

    window.alert("This ID already used.");
    return false;
  }

  editedShip.name = editedShip.name.trim();

  if (editedShip.name.length > 20) {
    window.alert("The ship name too long (max of 20 letters).");
    return false;
  }

  if (!BRIDGE.testNumber("Maximum pivots per turn", editedShip.maxPivots, 0, 99))
    return false;

  if (!BRIDGE.testNumber("Maximum rolls per turn", editedShip.maxRolls, 0, 99))
    return false;

  if (AVID.isAxisGreenSpine(windowId)) {
    window.alert("Invalid nose position.  When nose points at a hex corner, cannot use Green pitch band.");
    return false;
  }

  return true;
};

/**
 * Create a LI element for this ship.
 */
BRIDGE.createShipRosterLine = function (editedShip) {
  return BRIDGE.createShipLine(editedShip, true);
};

BRIDGE.createFleetCommandLine = function (editedShip) {
  return BRIDGE.createShipLine(editedShip, false);
};

BRIDGE.createShipLine = function (editedShip, isForShipRoster) {
  var eleLi = document.createElement("li");
  eleLi.setAttribute("class", editedShip.id);
  eleLi.onclick = (isForShipRoster ? BRIDGE.rosterSelection : BRIDGE.commandSelection);

  var spanId = document.createElement("span");
  spanId.setAttribute("class", "showId");
  spanId.appendChild(document.createTextNode(editedShip.id));
  eleLi.appendChild(spanId);

  var spanName = document.createElement("span");
  spanName.setAttribute("class", "showName");
  spanName.appendChild(document.createTextNode(editedShip.name));
  eleLi.appendChild(spanName);

  // Eventually, the status will show the doneness.  For now, a blank placeholder.
  var spanStatus = document.createElement("span");
  spanStatus.setAttribute("class", "showStatus");
  spanStatus.appendChild(document.createTextNode(""));
  eleLi.appendChild(spanStatus);

  return eleLi;
};

/**
 * Prepare for a new game by removing all current ships.
 */
BRIDGE.deleteAllFromRoster = function () {

  if (!window.confirm("Remove ALL SHIPS from the game?"))
    return false;

  BRIDGE.deleteAllShips("shipRosterList");
  BRIDGE.deleteAllShips("fleetCommandList");
  BRIDGE.ships = {};

  // These null settings are harmless, because the AVID can't be reached without first setting a non-blank ship.
  BRIDGE.setCurrentRoster(null);
  BRIDGE.currentShip = null;

  BRIDGE.saveToDatabase();
  return true;
};

/**
 * Remove all ships from the roster list.
 */
BRIDGE.deleteAllShips = function (rosterId) {

  // I'm told that starting from the last element is faster than doing this from the front.
  var roster = document.getElementById(rosterId);
  var rosterShips = roster.getElementsByTagName("li");

  for (var idx = rosterShips.length - 1; idx >= 0; idx--) {
    roster.removeChild(rosterShips[idx]);
  }

};

/**
 * Remove the currently-highlighted ship from both the ship roster list
 * and the fleet command list.
 */
BRIDGE.deleteFromRoster = function () {

  if (!window.confirm("Remove THIS SHIP from the game?"))
    return;

  var deletedShipId = BRIDGE.currentRosterId;
  BRIDGE.currentRosterId = null;
  BRIDGE.deleteShip("shipRosterList", deletedShipId);
  BRIDGE.deleteShip("fleetCommandList", deletedShipId);
  delete BRIDGE.ships[deletedShipId];

  // These null settings are harmless, because the AVID can't be reached without first setting a non-blank ship.
  BRIDGE.setCurrentRoster(null);
  BRIDGE.currentShip = null;

  BRIDGE.rosterHighlight();

  BRIDGE.saveToDatabase();
};

/**
 * Remove the currently-highlighted ship from the roster list.
 * When done there is no "current" ship in the ship list.
 */
BRIDGE.deleteShip = function (rosterId, shipId) {

  // Remember "deleteIdx" to highlight some other ship on the roster.
  var roster = document.getElementById(rosterId);
  var rosterShips = roster.getElementsByTagName("li");
  var rosterLen = rosterShips.length;
  var rosterShip;
  var deleteEle = null;

  for (var idx = 0; idx < rosterLen; idx++) {
    rosterShip = rosterShips[idx];

    if (rosterShip.className === shipId) {
      deleteEle = rosterShip;
      break;
    }

  }

  // Delete the "current roster ship".
  roster.removeChild(deleteEle);
};

/**
 * Tweak the display of ships based on the ships[] list.
 */
BRIDGE.fleetCommandLoad = function () {
  var rosterShips = document.getElementById("fleetCommandList").getElementsByTagName("li");
  var rosterLen = rosterShips.length;
  var rosterShip;
  var doneText;
  var moreToDo = false;

  for (var idx = 0; idx < rosterLen; idx++) {
    rosterShip = rosterShips[idx];
    var ship;
    ship = BRIDGE.ships[rosterShip.className];

    //The &nbsp; is needed or the background color doesn't display full-height.
    if (ship.avidMovementMode === AVID.DONE) {
      doneText = "&#x2713;";
    } else {
      doneText = "&nbsp;";
      moreToDo = true;
    }

    rosterShip.getElementsByClassName("showStatus")[0].innerHTML = doneText;
    rosterShip.getElementsByClassName("showName")[0].innerHTML = ship.name + "<br/>" + BRIDGE.generateShipSummary(ship);
  }

  document.getElementById("btnFleetCommandNextTurn").disabled = moreToDo;
  BRIDGE.commandHighlight();
};

/**
 * Create a summary of ship orientation and vector.
 *
 * For the nose direction return values like "A/B:+60 (D/E:+30)".
 * * The first portion refers to the Nose direction.  If on a pole it will omit the letter direction, such as "-90".
 * * The second portion refers to the Top direction.  It is in parentheses.  Again, a pole is honored.
 *
 * Later versions of this function will append to this speed scalar (Mode 1) or speed vector (Mode 2) information.
 *
 * Returns a displayable string.  The caller is responsible for supplying "connector code".
 */
BRIDGE.generateShipSummary = function (ship) {

  /*
   * When the axis points at a pole there is really no direction on the AVID.
   * Handle this by omitting "dir" and the colon.
   */
  var dir = BRIDGE.convertDegreesToSummaryLetter(ship.current[AVID.NOSE]) + ":";
  var lat = BRIDGE.convertLatitudeToSummaryString(ship.current[AVID.NOSE]);
  var noseDirLat = ((lat === "+90" || lat === "-90") ? "" : dir) + lat;

  dir = BRIDGE.convertDegreesToSummaryLetter(ship.current[AVID.TOP]) + ":";
  lat = BRIDGE.convertLatitudeToSummaryString(ship.current[AVID.TOP]);
  var topDirLat = ((lat === "+90" || lat === "-90") ? "" : dir) + lat;

  return noseDirLat + " (" + topDirLat + ")";
};

/**
 * Convert a degree value into a letter direction about the AVID.
 *
 * Change a degree value, such as 150, into the appropriate letter combo (such as "C/D").
 *
 * Returns the conversion.  If an unknown value is passed in then return it as a string.
 */
BRIDGE.convertDegreesToSummaryLetter = function (axis) {
  var dir;
  var degrees = AVID.getDegreesFromWindowId(axis.windowId);

  switch (degrees) {
    case 0:
      dir = "A";
      break;
    case 30:
      dir = "A/B";
      break;
    case 60:
      dir = "B";
      break;
    case 90:
      dir = "B/C";
      break;
    case 120:
      dir = "C";
      break;
    case 150:
      dir = "C/D";
      break;
    case 180:
      dir = "D";
      break;
    case 210:
      dir = "D/E";
      break;
    case 240:
      dir = "E";
      break;
    case 270:
      dir = "E/F";
      break;
    case 300:
      dir = "F";
      break;
    case 330:
      dir = "F/A";
      break;
    default:
      dir = AVID.getDegreesStringForWindowId(degrees);
      break;
  }

  return dir;
};

/**
 * Convert a window latitude into appropriate text.
 *
 * Change a degree value, such as 150, into the appropriate letter combo (such as "C/D").
 *
 * Returns the conversion.  If an unknown value is passed in then return it as a string.
 */
BRIDGE.convertLatitudeToSummaryString = function (axis) {

  /*
   * Although the latitude is merely the latter half of "windowId" use the "isWindowXXX()"
   * functions, avoiding interpreting the digit difference ("030" vs "30") and dealing with poles.
   */
  var lat;
  var windowId = axis.windowId;

  if (AVID.isWindowPole(windowId)) {
    lat = "90";
  } else if (AVID.isWindowGreen(windowId)) {
    lat = "60";
  } else if (AVID.isWindowBlue(windowId)) {
    lat = "30";
  } else if (AVID.isWindowAmber(windowId)) {
    lat = "0";
  } else {
    lat = AVID.getLatitudeFromWindowId(windowId);
  }

  return (axis.isUpperHemisphere ? "+" : "-") + lat;
};

/**
 * Save the ship in the AVID namespace into the ship list.
 * Then put the "current" ship into the AVID namespace.
 */
BRIDGE.setCurrentRoster = function (rosterId) {

  /*
   * Whenever this function is called it sets the "currentRosterId" and also
   * puts that ship into the AVID namespace.  If the (rosterId === null) that
   * means the data from the AVID namespace is also being obsoleted and doesn't
   * need to be saved.
   *
   * As stated elsewhere, it is harmless to have the current roster ship be null
   * because the AVID can't be entered until some (other) ship is selected.
   */
  if (rosterId === null) {
    BRIDGE.currentRosterId = rosterId;
    return;
  }

  BRIDGE.saveAVIDIntoRoster();
  BRIDGE.currentRosterId = rosterId;
  BRIDGE.putRosterIntoAVID();
};

/**
 * The data of the current AVID is stored into the appropriate entry of the ships[] list.
 */
BRIDGE.saveAVIDIntoRoster = function () {

  if (BRIDGE.currentRosterId === null)
    return;

  // Only update the things the user can change from the helm, bearing or fishbowl panels.
  var ship = BRIDGE.ships[BRIDGE.currentRosterId];

  ship.current = AVID.current;
  ship.pivots = AVID.pivots;
  ship.rolls = AVID.rolls;

  ship.wasBumper = AVID.wasBumper;
  ship.isBumperAllowed = AVID.isBumperAllowed;

  ship.maxPivots = AVID.maxPivots;
  ship.maxRolls = AVID.maxRolls;

  ship.avidMovementMode = AVID.avidMovementMode;
  ship.avidFunction = AVID.avidFunction;

  ship.targetBearing = BEAR.targetBearing;
  ship.avidACoordinate = AVID.avidACoordinate;

  ship.directSelects.distDH = BEAR.directSelects.distDH;
  ship.directSelects.distDV = BEAR.directSelects.distDV;
};

/**
 * The data of the selected ships[] entry is stored into the AVID.
 *
 * Remember that the storing is done in the ship roster panel or the
 * fleet command panel.  After doing the storing the AVID data is not
 * consistent with the AVID itself.  However, the only way of
 * displaying the AVID is by way of showHelm(), showBearing() or
 * showFishbowl().  All works out OK in the end.
 */
BRIDGE.putRosterIntoAVID = function () {
  var ship = BRIDGE.ships[BRIDGE.currentRosterId];
  document.getElementById("avidTitleId").innerHTML = ship.id;
  document.getElementById("avidTitleName").innerHTML = ship.name;

  /*
   * The "current" ship orientation is seen when drawing the AVID.
   * The pivots[] and rolls[] lists are used by drawAvid() to display the undo paths.
   */
  AVID.current = ship.current ? ship.current : AVID.makeAxesCopy(AVID.initialAxes);
  AVID.pivots = ship.pivots;
  AVID.rolls = ship.rolls;

  AVID.wasBumper = ship.wasBumper;
  AVID.isBumperAllowed = ship.isBumperAllowed;

  AVID.maxPivots = ship.maxPivots;
  AVID.maxRolls = ship.maxRolls;

  // The avidMovementMode (Pivot/Roll/Done) is used in drawAvid().
  AVID.avidMovementMode = ship.avidMovementMode;
  AVID.setMovementModeButtons(AVID.avidMovementMode);

  // The avidFunction (HELM/ROLL) tells if the
  AVID.avidFunction = ship.avidFunction;

  // The target bearing is by drawAvid(), and has no explicit "show this" function.
  BEAR.targetBearing = ship.targetBearing;
  BEAR.showTargetBearing();

  AVID.movementModel = ship.movementModel;

  // Force the AVID to point in the stored direction.
  AVID.avidACoordinate = ship.avidACoordinate;
  AVID.setAvidToRotation();
  AVID.setRotateIconToRotation();

  // The showHexagonColor() could set the global, but do it explicitly here as a reminder.
  AVID.hexagonColor = ship.hexagonColor;
  AVID.showHexagonColor();
  AVID.showRotateIconColor();

  BEAR.directSelects.distDH = ship.directSelects.distDH;
  BEAR.directSelects.distDV = ship.directSelects.distDV;

  /*
   * The ship doesn't start in mid-drag, with the bumper ring lit.
   * Neither does it start half way through a move.
   */
  AVID.haveAxis = false;
  AVID.wasBumper = false;
  AVID.hideBumperRing();
};

/**
 * Determine which other ships are candidates for the "current" ship to mirror plotting moves.
 * Put this list of ships into the appropriate control.
 *
 * When done the list will have at least one line in it (nothing to do) or many
 * (one line for "do nothing" and the rest of the mirror candidates).
 */
BRIDGE.prepareMirrorShips = function () {

  // Compare from the start of the turn, not a coincidence within the current plotting phase.
  var currentInitialNoseAxis = (AVID.pivots.length > 0) ? AVID.pivots[0][AVID.NOSE] : AVID.getCurrentNose();
  var mirrorShips = [];
  var shipInitialNoseAxis;

  for (var key in BRIDGE.ships) {

    // Don't put the current ship into the mirror list.
    if (BRIDGE.currentRosterId === key)
      continue;

    // Do the two ships have the same initial bearing?  If so, "ship" is a candidate for mirrorShips[].
    var ship = BRIDGE.ships[key];
    shipInitialNoseAxis = (ship.pivots.length > 0) ? ship.pivots[0][AVID.NOSE] : ship.current[AVID.NOSE];

    if (!(shipInitialNoseAxis.windowId === currentInitialNoseAxis.windowId && shipInitialNoseAxis.isUpperHemisphere === currentInitialNoseAxis.isUpperHemisphere))
      continue;

    // Can the current ship pivot and roll as far as "ship" has pivoted and rolled?
    if (ship.pivots.length > AVID.maxPivots || ship.rolls.length > AVID.maxRolls)
      continue;

    mirrorShips.push(ship);
  }

  // Remove all options from the "similarShips" select, then fill with these ships.
  var roster = document.getElementById("distSS");
  var rosterShips = roster.getElementsByTagName("li");

  for (var idx = rosterShips.length - 1; idx >= 0; idx--) {
    roster.removeChild(rosterShips[idx]);
  }

  roster.appendChild(BRIDGE.createMirrorLine({
    id          : "",
    name        : (mirrorShips.length === 0 ? "No ships match" : "Don't match anything"),
    isCancelLine: true
  }, 0));

  for (var idx = 0; idx < mirrorShips.length; idx++) {
    roster.appendChild(BRIDGE.createMirrorLine(mirrorShips[idx], idx + 1));
  }

  // Enable the button only when there are ships to mirror with.
  document.getElementById("btnSimilarShips").disabled = mirrorShips.length === 0;
};

/**
 * Create an LI element for the mirrored ships list.
 */
BRIDGE.createMirrorLine = function (ship, listIdx) {
  var eleLi = document.createElement("li");
  eleLi.setAttribute("value", ship.id);
  eleLi.setAttribute("class", "sslist " + (listIdx % 2 === 0 ? "evenLi" : "oddLi"));

  var spanId = document.createElement("span");
  spanId.setAttribute("class", "showId");
  spanId.appendChild(document.createTextNode(ship.id));
  eleLi.appendChild(spanId);

  var spanName = document.createElement("span");
  spanName.setAttribute("class", "showName");
  spanName.appendChild(document.createTextNode(ship.name));
  eleLi.appendChild(spanName);

  return eleLi;
};

/**
 * Make the "current" ship have the same plot as that of the "similarShips" selection.
 */
BRIDGE.mirrorPlotting = function () {

  if (BEAR.directSelects.distSS === "") {
    BRIDGE.cancelPicklist();
    return;
  }

  var ship = BRIDGE.ships[BEAR.directSelects.distSS];

  AVID.current = AVID.makeAxesCopy(ship.current);
  AVID.pivots = AVID.makeAxesListCopy(ship.pivots);
  AVID.rolls = AVID.makeAxesListCopy(ship.rolls);

  if (AVID.rolls.length === 0)
    AVID.avidPivoting();
  else
    AVID.avidRolling();

  BRIDGE.cancelPicklist();
};

/**
 * Prepare and the dialog that lets the user select from mirror possibilities.
 */
BRIDGE.showMirrorChoices = function () {

  /*
   * The picklist is wrapped in DIVs for which size calculations are hard.
   * Estimate what is needed.
   * * The title can be figured.
   * * Each line can be figured.  There is always at least one line, which is the
   *   "nothing to chooose from" or "choose nothing line".  Choose the minimum of
   *   the actual line count and five lines.  The dialog is sized to show up to
   *   that many lines and then the UL scrolls within the dialog.
   * * The trailing section of dialog is needed to complete the effect.  Guesswork here.
   */
  var targetDiv = "divSimilarShipsEntryDialog";
  var eleSimilarShipsEntryDialog = document.getElementById(targetDiv);
  eleSimilarShipsEntryDialog.style.visibility = "visible";
  eleSimilarShipsEntryDialog.style.display = "inline";

  var eleUL = document.getElementById("distSS");
  var cntShips = eleUL.getElementsByTagName("li").length;

  var hdrHeight = document.getElementById("divSimilarShipsEntryDialogTitle").clientHeight;
  var linesHeight = (document.getElementsByClassName("sslist")[0].clientHeight + 4) * Math.min(5, cntShips);
  var ftrHeight = document.getElementById("divSimilarShipsEntryDialogFooter").clientHeight;
  document.getElementById("divSimilarShipsEntryDialog").style.height = "" + (3 + hdrHeight + linesHeight + ftrHeight) + "px";

  document.getElementById("divSimilarShipsEntryDialogFooterText").innerHTML = (cntShips <= 5 ? "" : "Scroll up/down for all ships");

  /*
   * The picklist itself is coordinated with its wrapper DIV.
   */
  eleUL.style.height = "" + linesHeight + "px";

  /*
   * There are some devices, such as smartphones, with severe form factors.
   * The picklist dialog would extend across the width.  Fix that by
   * forcing the dialog to be narrower.
   */
  var avidWrapper = document.getElementById("avidWrapper");
  var eleDlg = document.getElementById("divSimilarShipsEntryDialog");

  if (eleDlg.clientWidth > avidWrapper.clientWidth) {
    eleDlg.style.width = "" + avidWrapper.clientWidth + "px";
  }

  /*
   * The modal layer protect against user edits.  The user can only select a bearing distance.
   * The widths and heights of "document.body" change as different panels are displayed.
   * The use of "document.body.offsetHeight" is unreliable.  Better to choose the bottom edge
   * of the "divBearingControls".
   */
  var divAvid = document.getElementById("divAvid");

  var ele = document.getElementById("divAvidModal");
  ele.style.left = parseInt(document.body.offsetLeft, 10).toString() + "px";
  ele.style.top = parseInt(document.body.offsetTop, 10).toString() + "px";
  ele.style.width = parseInt(document.body.offsetWidth, 10).toString() + "px";
  ele.style.height = (divAvid.offsetTop + divAvid.offsetHeight).toString() + "px";
  ele.style.visibility = "visible";

  /*
   * Show the encompassing DIV for the dialog.
   */
  var leftEdge = (avidWrapper.offsetLeft + (avidWrapper.offsetWidth - eleSimilarShipsEntryDialog.offsetWidth) / 2).toString() + "px";
  var topEdge = (avidWrapper.offsetTop + (avidWrapper.offsetHeight - eleSimilarShipsEntryDialog.offsetHeight) / 2).toString() + "px";

  eleSimilarShipsEntryDialog.style.left = leftEdge;
  eleSimilarShipsEntryDialog.style.top = topEdge;

  /*
   * The previous use of this picklist left the selected item changed.
   */
  BRIDGE.setPicklistLIColors("sslist");
};

/**
 * The picklist whose elements are identified by "targetClass" will get colored.
 * The previous showing of this picklist probably left one LI in "selected" color
 * and another in "flash" color.  Reset all so that they are only even or odd.
 */
BRIDGE.setPicklistLIColors = function (targetClass) {
  var targetLIs = document.getElementsByClassName(targetClass);
  var lenLIs = targetLIs.length;
  var targetLI;
  var colorLI;

  for (var idx = 0; idx < lenLIs; idx++) {
    targetLI = targetLIs[idx];
    colorLI = (idx % 2 === 0) ? BEAR.colorEvenLI : BEAR.colorOddLI;

    BRIDGE.setLISpanColor(targetLI, "showId", colorLI);
    BRIDGE.setLISpanColor(targetLI, "showName", colorLI);
  }

};

/**
 * Set the color of an LI having a span.
 */
BRIDGE.setLISpanColor = function (targetLI, spanName) {
  var targetSpan = targetLI.getElementsByClassName(spanName)[0];
  targetSpan.style.color = colorLI.color;
  targetSpan.style.backgroundColor = colorLI.backgroundColor;
};

/**
 * Close the picklist without selecting anything.
 */
BRIDGE.cancelPicklist = function () {
  BRIDGE.hideDirectSelectControls();
};

/**
 * Hide the direct-select controls.  Easier than remembering which one is displayed.
 */
BRIDGE.hideDirectSelectControls = function () {
  var ele = document.getElementById("divSimilarShipsEntryDialog");
  ele.style.visibility = "hidden";
  ele.style.display = "none";

  var ele = document.getElementById("divAvidModal");
  ele.style.visibility = "hidden";
};

/**
 * The user has clicked on a LI of the "select ships" picklist.
 */
BRIDGE.clickedSSLI = function (evt) {
  var target = evt.target;

  if (target.tagName === "SPAN")
    target = target.parentElement;

  BEAR.directSelects.distSS = target.getAttribute("value");

  // Flash that this was clicked.

  target.style.color = BEAR.colorFlashLI.color;
  target.style.backgroundColor = BEAR.colorFlashLI.backgroundColor;

  setTimeout("BRIDGE.mirrorPlotting()", 200);
};

BRIDGE.selectedBackgroundColor = function (ctrlColor) {
  var ctrlDir = document.getElementById("initialShipDirection");
  ctrlDir.value = (ctrlColor.value === "red" ? "180" : "0");
  return true;
};

/**
 * After showing the bridge panel, show the helm sub-panel.
 */
BRIDGE.showHelm = function (comingFromAvid) {

  /*
   * New technology has button always active.  Need to judge whether to do anything with the request.
   * * If the helm is requested from some other panel (comingFromAvid = false) then always show it.
   * * If the AVID already shows the helm (avidFunction = HELM) then do nothing.
   */
  if (comingFromAvid && (AVID.avidFunction === AVID.HELM))
    return;

  BRIDGE.view = BRIDGE.AVID;
  AVID.avidFunction = AVID.HELM;

  BRIDGE.showElement("avidTitle");
  BRIDGE.showElement("divAvid");
  BRIDGE.hideElement("divFishbowl");

  BRIDGE.showElement("divHelmControls");
  BRIDGE.hideElement("divBearingControls");
  BEAR.disableAvidBearings();

  // Button is hidden when fixing AVID (through ship roster).
  BRIDGE.showElement("btnDone");

  AVID.drawAvid();
  AVID.enableAvidPivots();

  var ele = document.getElementById("divBridge");
  ele.style.backgroundImage = "";
  ele.style.backgroundColor = "";

  ele = document.getElementById("avidWrapper");
  ele.style.backgroundImage = "";
  ele.style.backgroundColor = "";

  document.getElementById("divSimilarShips").style.visibility = "visible";

  BEAR.disableStatusMessage();
  AVID.enableStatusMessage();

  BRIDGE.hideElement("iconClearBearing");
  BRIDGE.showElement("iconUndo");
  BEAR.hideBearingIcon();
  AVID.setMovementModeButtons(AVID.avidMovementMode);

  BRIDGE.prepareMirrorShips();

  AVID.iconHelmSelected();
  AVID.iconBearingUnselected();
  AVID.iconFishbowlUnselected();
};

/**
 * After showing the bridge panel, show the bearing sub-panel.
 */
BRIDGE.showBearing = function (comingFromAvid) {

  /*
   * New technology has button always active.  Need to judge whether to do anything with the request.
   * * If the bearing is requested from some other panel (comingFromAvid = false) then always show it.
   * * If the AVID already shows the bearing (avidFunction = BEARING) then do nothing.
   * * If the user entered a mode where the bearing isn't allowed (isAdjustingShipOrientation), then do nothing.
   */
  if (comingFromAvid && (AVID.avidFunction === AVID.BEARING || AVID.isAdjustingShipOrientation))
    return;

  BRIDGE.view = BRIDGE.AVID;
  AVID.avidFunction = AVID.BEARING;

  BRIDGE.showElement("avidTitle");
  BRIDGE.showElement("divAvid");
  BRIDGE.hideElement("divFishbowl");

  BRIDGE.hideElement("divHelmControls");
  BRIDGE.showElement("divBearingControls");
  BEAR.enableAvidBearings();

  AVID.drawAvid();
  AVID.disableAvidPivots();

  var ele = document.getElementById("divBridge");
  ele.style.backgroundImage = "";
  ele.style.backgroundColor = "";

  ele = document.getElementById("avidWrapper");
  ele.style.backgroundImage = "";
  ele.style.backgroundColor = "";

  BEAR.enableStatusMessage();
  AVID.disableStatusMessage();

  BRIDGE.hideElement("iconUndo");
  BRIDGE.showElement("iconClearBearing");
  BEAR.showBearingIcon();
  AVID.hideBumperRing();
  AVID.setMovementModeButtons(AVID.avidMovementMode);

  if (BRIDGE.countShips() === 1) {
    AVID.hideElement(document.getElementById("btnBPrevious"));
    AVID.hideElement(document.getElementById("btnBNext"));
  } else {
    AVID.showElement(document.getElementById("btnBPrevious"));
    AVID.showElement(document.getElementById("btnBNext"));
  }

  AVID.iconHelmUnselected();
  AVID.iconBearingSelected();
  AVID.iconFishbowlUnselected();
};

/**
 * After showing the bridge panel, show the fishbowl sub-panel.
 */
BRIDGE.showFishbowl = function (comingFromAvid) {

  /*
   * New technology has button always active.  Need to judge whether to do anything with the request.
   * * If the bearing is requested from some other panel (comingFromAvid = false) then always show it.
   * * If the AVID already shows the bearing (avidFunction = FISHBOWL) then do nothing.
   * * If the user entered a mode where the bearing isn't allowed (isAdjustingShipOrientation), then do nothing.
   */
  if (comingFromAvid && (AVID.avidFunction === AVID.FISHBOWL || AVID.isAdjustingShipOrientation))
    return;

  BRIDGE.view = BRIDGE.FISHBOWL;
  AVID.avidFunction = AVID.FISHBOWL;

  BRIDGE.showElement("avidTitle");
  BRIDGE.hideElement("divAvid");
  BRIDGE.showElement("divFishbowl");

  BRIDGE.hideElement("divHelmControls");
  BRIDGE.hideElement("divBearingControls");

  var ele = document.getElementById("divBridge");
  ele.style.backgroundImage = "";
  ele.style.backgroundColor = "";

  ele = document.getElementById("avidWrapper");
  ele.style.backgroundImage = "";
  ele.style.backgroundColor = "";

  BEAR.hideBearingIcon();
  FISH.setViewButtons();
  FISH.showBearing();

  if (BRIDGE.countShips() === 1) {
    AVID.hideElement(document.getElementById("btnFPrevious"));
    AVID.hideElement(document.getElementById("btnFNext"));
  } else {
    AVID.showElement(document.getElementById("btnFPrevious"));
    AVID.showElement(document.getElementById("btnFNext"));
  }

  AVID.iconHelmUnselected();
  AVID.iconBearingUnselected();
  AVID.iconFishbowlSelected();
};

/**
 * Set the style of an element, identified by its ID, for display.
 */
BRIDGE.showElement = function (id) {
  var ele = document.getElementById(id);
  ele.style.visibility = "visible";
  ele.style.display = "";
};

/**
 * Set the style of an element, identified by its ID, for hiding.
 */
BRIDGE.hideElement = function (id) {
  var ele = document.getElementById(id);
  ele.style.visibility = "hidden";
  ele.style.display = "none";
};

/**
 * Respond to the click on the AVID's "Pivot" button.
 */
BRIDGE.avidPivoting = function () {

  if (AVID.rolls.length > 0) {

    if (!window.confirm("Undo ALL ROLLS of this turn?"))
      return;

  }

  AVID.undoAllRolls();
  AVID.avidPivoting();
  BRIDGE.setCurrentRosterStatus(AVID.PIVOT);
};

/**
 * Respond to the click on the AVID's "Roll" button.
 */
BRIDGE.avidRolling = function () {
  AVID.avidRolling();
  BRIDGE.setCurrentRosterStatus(AVID.ROLL);
};

/**
 * Respond to the click on the AVID's "Previous" button.
 *
 * The user is only shuffling between ships.  Only a subset of avidDone() need be done.
 *
 * The "panel" parameter is an optional destination.  Used to go to the bearing display, for example.
 */
BRIDGE.avidPrevious = function (panel) {
  AVID.drawAvid();

  BRIDGE.saveAVIDIntoRoster();
  BRIDGE.saveToDatabase();

  BRIDGE.goToPreviousShip(typeof panel === "string" && panel.length > 0 ? panel : "helm");
};

/**
 * Respond to the click on the AVID's "Next" button.
 *
 * The user is only shuffling between ships.  Only a subset of avidDone() need be done.
 *
 * The "panel" parameter is an optional destination.  Used to go to the bearing display, for example.
 */
BRIDGE.avidNext = function (panel) {
  AVID.drawAvid();

  BRIDGE.saveAVIDIntoRoster();
  BRIDGE.saveToDatabase();

  BRIDGE.goToNextShip(typeof panel === "string" && panel.length > 0 ? panel : "helm");
};

/**
 * Respond to the click on the AVID's "Previous" button from the bearing panel.
 *
 * The user is only shuffling between ships.  Only a subset of avidDone() need be done.
 */
BRIDGE.avidBPrevious = function () {
  BRIDGE.avidPrevious("bearing");
};

/**
 * Respond to the click on the AVID's "Next" button from the bearing panel.
 *
 * The user is only shuffling between ships.  Only a subset of avidDone() need be done.
 */
BRIDGE.avidBNext = function () {
  BRIDGE.avidNext("bearing");
};

/**
 * Respond to the click on the AVID's "Previous" button from the fishbowl panel.
 *
 * The user is only shuffling between ships.  Only a subset of avidDone() need be done.
 */
BRIDGE.avidFPrevious = function () {
  BRIDGE.avidPrevious("fishbowl");
};

/**
 * Respond to the click on the AVID's "Next" button from the fishbowl panel.
 *
 * The user is only shuffling between ships.  Only a subset of avidDone() need be done.
 */
BRIDGE.avidFNext = function () {
  BRIDGE.avidNext("fishbowl");
};

/**
 * Respond to the click on the AVID's "Done" button.
 */
BRIDGE.avidDone = function () {

  /*
   * If adjusting a ship's orientation the AVID editing has been hijacked.
   * No need to hammer the changes into the ships[] list,
   */
  if (AVID.isAdjustingShipOrientation) {
    BRIDGE.doneAdjustingShip();

    BRIDGE.showPanel("shipRoster");
    return;
  }

  AVID.avidMovementMode = AVID.DONE;
  AVID.drawAvid();
  BRIDGE.setCurrentRosterStatus(AVID.DONE);

  BRIDGE.saveAVIDIntoRoster();
  BRIDGE.saveToDatabase();

  BRIDGE.goToNextUndoneShip();
};

/**
 * Convenience class for the task of completing ship adjustment.
 */
BRIDGE.doneAdjustingShip = function () {
  AVID.isAdjustingShipOrientation = false;
  AVID.pivots = [];
  AVID.rolls = [];

  AVID.avidMovementMode = AVID.PIVOT;
  AVID.setMovementModeButtons(AVID.avidMovementMode);

  AVID.enableStatusMessage();
  BEAR.enableStatusMessage();

  AVID.bearingButtonAdjust(AVID.undimIconSegment);
  AVID.fishbowlButtonAdjust(AVID.undimIconSegment);

  BRIDGE.saveAVIDIntoRoster();
  BRIDGE.saveToDatabase();
};

/**
 * Count and return the entries in BRIDGE.ships;
 *
 * BRIDGE.ships is an associative array and doesn't respond to a "length" request.
 */
BRIDGE.countShips = function () {
  var cntShips = 0;

  for (var key in BRIDGE.ships) {
    cntShips++;
  }

  return cntShips;
};

/**
 * Fetch the keys to an associative array as an ordinary indexed array.
 *
 * Returns the list of keys, converted into an indexable format.
 */
BRIDGE.getAssociativeKeysInArray = function (list) {
  var keys = [];
  var idx = 0;

  for (var key in list) {
    keys[idx++] = key;
  }

  return keys;
};

/**
 * Find and return the key to the previous ship in the BRIDGE.ships[] list.
 *
 * See the header for BRIDGE.calculateAnotherShip() for details.
 */
BRIDGE.calculatePreviousShipKey = function () {
  return BRIDGE.calculateAnotherShipKey(false);
};

/**
 * Find and return the key to the next ship in the BRIDGE.ships[] list.
 *
 * See the header for BRIDGE.calculateAnotherShip() for details.
 */
BRIDGE.calculateNextShipKey = function () {
  return BRIDGE.calculateAnotherShipKey(true);
};

/**
 * Find and return the key to the next (goForward == true) or previous ship in the BRIDGE.ships[] list.
 *
 * The BRIDGE.ships[] list is an associative array and doesn't directly support indexing through itself.
 * The ships are displayed in key sequence ("keys in BRIDGE.ships"), so get those keys into an array
 * and step through *that*.
 *
 * "goForward" is an optional boolean for direction.  True means "forward".
 * If the parameter is missing then assume "forward".
 *
 * Returns the key to the "next" ship in the appropriate direction.  If the ship can't be found
 * then return null.  This occurs when BRIDGE.currentRosterId is null or a bum value.
 */
BRIDGE.calculateAnotherShipKey = function (goForward) {

  // If never initialized then there is nothing to do.
  if (BRIDGE.currentRosterId === null)
    return null;

  if (goForward === undefined)
    goForward = true;

  /*
   * Find the index for BRIDGE.currentRosterId.  Quit on failure to find that ship.
   */
  var keys = BRIDGE.getAssociativeKeysInArray(BRIDGE.ships);
  var lenKeys = keys.length;
  var idx = 0;

  while (idx < lenKeys) {

    if (keys[idx] === BRIDGE.currentRosterId)
      break;

    idx++;
  }

  if (idx === lenKeys)
    return null;

  /*
   * Advance to another ship.  Which one depends on "goForward".
   * Wrap at the limit of the "keys" array.
   */
  if (goForward) {
    idx++;

    if (idx >= lenKeys)
      idx = 0;

  } else {
    idx--;

    if (idx < 0)
      idx = lenKeys - 1;

  }


  return keys[idx];
};

/**
 * Determine the "next" undone ship in the roster.
 * If all ships are done then return null;.
 *
 * The "next" ship has an avidMovementMode that isn't DONE,
 * and which is, if possible, on a higher index than the ship
 * of currentRosterId.
 */
BRIDGE.calculateNextUndoneShip = function () {

  /*
   * Nominally, start at the "current" position and work down through the list.
   * At the bottom, continue at the top.  This is equivalent to two different pointers:
   * * Starting after the "current" position, find the next ship not done.
   * * Once the list bottom is reached, find the first ship not done.
   * This implementation plays with the sequencing.
   */
  var preShip = null;
  var postShip = null;
  var foundCurrent = false;
  var ship;

  for (var key in BRIDGE.ships) {
    ship = BRIDGE.ships[key];

    if (key === BRIDGE.currentRosterId) {
      foundCurrent = true;
    } else if (!foundCurrent && ship.avidMovementMode !== AVID.DONE) {
      preShip = key;
    } else if (foundCurrent && ship.avidMovementMode !== AVID.DONE) {
      postShip = key;
    }

  }

  if (postShip) {
    return postShip;
  }

  if (preShip) {
    return preShip;
  }

  // All ships are done.
  return null;
};

/**
 * Navigate to the "next" undone ship in the roster.
 * If all ships are done then go to the Fleet Command panel.
 *
 * The "next" ship has an avidMovementMode that isn't DONE,
 * and which is, if possible, on a higher index than the ship
 * of currentRosterId.
 */
BRIDGE.goToNextUndoneShip = function () {
  var key = BRIDGE.calculateNextUndoneShip();

  if (key === null) {

    // All ships are done
    BRIDGE.showPanel("fleetCommand");
  } else {

    /*
     * When jumping to this ship, don't disturb its current PIVOT/ROLL setting.
     * The user might have left that ship in mid-movement.
     */
    BRIDGE.setCurrentRoster(key);
    BRIDGE.showPanel("helm");
  }

};

/**
 * Show the "previous ship" from the ship roster in the AVID display.
 *
 * The AVID display shows the "currentRosterId" ship.  Find the "previous" one.
 *
 * The "panel" parameter tells which display to show.
 */
BRIDGE.goToPreviousShip = function (panel) {
  var key = BRIDGE.calculatePreviousShipKey();

  if (key === null) {

    // All ships are done
    BRIDGE.showPanel("fleetCommand");
  } else {

    /*
     * When jumping to this ship, don't disturb its current PIVOT/ROLL setting.
     * The user might have left that ship in mid-movement.
     */
    BRIDGE.setCurrentRoster(key);
    BRIDGE.showPanel(panel);
  }

};

/**
 * Show the "next ship" from the ship roster in the AVID display.
 *
 * The AVID display shows the "currentRosterId" ship.  Find the "next" one.
 *
 * The "panel" parameter tells which display to show.
 */
BRIDGE.goToNextShip = function (panel) {
  var key = BRIDGE.calculateNextShipKey();

  if (key === null) {

    // All ships are done
    BRIDGE.showPanel("fleetCommand");
  } else {

    /*
     * When jumping to this ship, don't disturb its current PIVOT/ROLL setting.
     * The user might have left that ship in mid-movement.
     */
    BRIDGE.setCurrentRoster(key);
    BRIDGE.showPanel(panel);
  }

};

/**
 * Update the ships[] entry for the currently editing ship.
 * Change the Pivot/Roll/Done status to match the current setting.
 * Note that the user can bop between the AVID and the Fleet Command panel at any time.
 */
BRIDGE.setCurrentRosterStatus = function (avidMode) {
  BRIDGE.ships[BRIDGE.currentRosterId].avidMovementMode = avidMode;
};

/**
 * Acknowledge that all of the movement is completed for the current playing turn.
 * Clear all of the ships to status PIVOT.
 */
BRIDGE.movesDone = function () {
  var rosterShips = document.getElementById("fleetCommandList").getElementsByTagName("li");
  var rosterLen = rosterShips.length;
  var rosterShip;

  for (var idx = 0; idx < rosterLen; idx++) {
    rosterShip = rosterShips[idx];
    rosterShip.getElementsByClassName("showStatus")[0].innerHTML = "&nbsp;";

    var ship = BRIDGE.ships[rosterShip.className];
    ship.avidMovementMode = AVID.PIVOT;
    ship.pivots = [];
    ship.rolls = [];

    /*
     * If the user selects a ship through the fleet command list that ship, with its updated
     * "avidMovementMode" is pushed into the AVID.  If the user merely clicks on the "helm" icon
     * to edit the existing ship the existing AVID, with the "Done" button dimmed, is still used.
     * Pushing the ship into the AVID. is needed to resync the data.
     */
    if (rosterShip.className === BRIDGE.currentRosterId)
      BRIDGE.putRosterIntoAVID();

  }

  // Now that everything is pristine, save it.
  BRIDGE.saveToDatabase();
};

/**
 * Advance to the next playing turn.
 * Also clear all of the ships to status PIVOT.
 * Also saves the "beginning of turn" state of the game to local HTML5 storage.
 */
BRIDGE.nextTurn = function () {

  if (!window.confirm("Go to NEXT TURN?")) {
    return;
  }

  /*
   * Upon the new turn the fishbowl has its view reset to a default value.
   */
  BRIDGE.movesDone();
  FISH.resetView();
  BRIDGE.currentTurn++;
  document.getElementById("currentTurn").innerHTML = BRIDGE.currentTurn;

  // Busy work for the ships[] list.
  for (var key in BRIDGE.ships) {
    var ship = BRIDGE.ships[key];
    ship.current.wasDiagonal = false;
  }

  BRIDGE.saveToDatabase();
  AVID.helmButtonAdjust(AVID.undimIconSegment);
  BRIDGE.helmFCButtonAdjust(AVID.undimIconSegment);
  document.getElementById("btnFleetCommandNextTurn").disabled = true;
};

/**
 * Let the user change the pivot and roll for the ship of "current ship roster".
 */
BRIDGE.adjustAVID = function () {

  /*
   * An edited ship is presumed to start the turn wrong, put it into start-of-turn condition.
   *
   * Assigning a blank array to these references doesn't also erase the reference from AVID.pivots
   * or AVID.rolls. The value is still there for assigning to AVID.current.
   *
   * However, I've had inconsistent problems with the native Android browser where AVID.current
   * is displayed, not the earliest one.  Put the AVID.current setting first, then play with the arrays.
   */
  if (AVID.pivots.length > 0)
    AVID.current = AVID.pivots[0];

  var ship = BRIDGE.ships[BRIDGE.currentRosterId];
  ship.pivots = [];
  ship.rolls = [];

  AVID.pivots = [];
  AVID.rolls = [];


  AVID.avidMovementMode = AVID.PIVOT;

  // This feature is an interruption of normal ship operation.  Flag it for when "Done" is clicked.
  AVID.isAdjustingShipOrientation = true;

  // A modified version of showHelm().
  BRIDGE.view = BRIDGE.AVID;
  AVID.avidFunction = AVID.HELM;

  BRIDGE.showElement("avidTitle");
  BRIDGE.showElement("divAvid");
  BRIDGE.hideElement("divFishbowl");

  BRIDGE.showElement("divHelmControls");
  BRIDGE.hideElement("divBearingControls");
  BEAR.disableAvidBearings();

  BRIDGE.hideElement("btnDone");

  /*
   * While in "fix AVID" mode, Ken complains that the "Done" button makes him think
   * he's in "move the ship" mode.  Since disabling buttons indicates that this is
   * the current mode, a reasonable alternative is to hide the button.
   */
  AVID.drawAvid();
  AVID.enableAvidPivots();

  /*
   * I'm having off-and-on cases of not seeing the background image.
   * Use the background color as a firewall.
   */
  var ele = document.getElementById("divBridge");
  ele.style.backgroundColor = BRIDGE.colorFixAvidBackground;

  ele = document.getElementById("avidWrapper");
  ele.style.backgroundColor = BRIDGE.colorFixAvidBackground;

  document.getElementById("divSimilarShips").style.visibility = "hidden";

  BEAR.disableStatusMessage();
  AVID.enableStatusMessage();

  BRIDGE.hideElement("iconClearBearing");
  BRIDGE.showElement("iconUndo");
  BEAR.hideBearingIcon();
  AVID.setMovementModeButtons(AVID.avidMovementMode);

  AVID.iconHelmSelected();
  AVID.iconBearingUnselected();
  AVID.iconFishbowlUnselected();

  AVID.bearingButtonAdjust(AVID.dimIconSegment);
  AVID.fishbowlButtonAdjust(AVID.dimIconSegment);
};

/**
 * Save the current state of the game into HTML5 local storage.
 * The data from the "Game Setup" and the ship roster are saved.
 */
BRIDGE.saveToDatabase = function () {
  var stash = {
    version             : 1,
    currentTurn         : BRIDGE.currentTurn,
    maxPivots           : BRIDGE.maxPivots,
    maxRolls            : BRIDGE.maxRolls,
    pivotAdjustment     : AVID.pivotAdjustment,
    defaultMovementModel: AVID.defaultMovementModel,
    shootBearingsModel  : AVID.shootBearingsModel,
    ships               : BRIDGE.ships
  };

  localStorage.setItem("AVIDAssistantGame", JSON.stringify(stash));
};

/**
 * Get the most recent state of the game from HTML5 local storage.
 * Intended to recover from device poweroff dismissal of the web site.
 * The data from the "Game Setup" and the ship roster are recovered.
 */
BRIDGE.loadFromDatabase = function () {

  // If the game hasn't been played before, or if the stash was deleted, nothing is returned.
  var stash = JSON.parse(localStorage.getItem("AVIDAssistantGame"));

  if (!stash || !stash.version)
    return;

  BRIDGE.currentTurn = stash.currentTurn;
  document.getElementById("currentTurn").innerHTML = BRIDGE.currentTurn;

  BRIDGE.maxPivots = stash.maxPivots;
  BRIDGE.maxRolls = stash.maxRolls;
  AVID.pivotAdjustment = stash.pivotAdjustment;
  AVID.defaultMovementModel = stash.defaultMovementModel;
  AVID.shootBearingsModel = stash.shootBearingsModel;
  BRIDGE.ships = stash.ships;

  var roster = document.getElementById("shipRosterList");
  var fleet = document.getElementById("fleetCommandList");

  for (var key in BRIDGE.ships) {
    var ship = BRIDGE.ships[key];

    roster.appendChild(BRIDGE.createShipRosterLine(ship));
    fleet.appendChild(BRIDGE.createFleetCommandLine(ship));
  }

};

BRIDGE.startupLoadFromDatabase = function () {
  document.getElementById("divLoadStatusMsg").innerHTML = "Loading previous game status, if any.  Please wait...";
  BRIDGE.loadFromDatabase();
  document.getElementById("btnAboutNewGameSetup").disabled = false;
  document.getElementById("btnAboutFleetCommand").disabled = false;
  document.getElementById("divLoadStatusMsg").innerHTML = "";
};

/**
 * On startup there are likely saved ships.  Prepare the required
 * crumb icons for the largest existing pivots[] and rolls[] list.
 */
BRIDGE.prefillCrumbs = function () {
  var ship;
  var lenPivotCrumbs = -1;
  var lenRollCrumbs = -1;

  for (var key in BRIDGE.ships) {
    ship = BRIDGE.ships[key];
    lenPivotCrumbs = Math.max(lenPivotCrumbs, ship.pivots.length);
    lenRollCrumbs = Math.max(lenRollCrumbs, ship.rolls.length);
  }

  for (var idx = 0; idx < lenPivotCrumbs; idx++) {
    AVID.addPivotCrumb(idx);
  }

  for (var idx = 0; idx < lenRollCrumbs; idx++) {
    AVID.addRollCrumb(idx);
  }

};

/**
 * Call through the body's "onload" hook.
 */
window.onload = function () {

  // Supposed to make the URL bar disappear in a mobile browser.
  window.scrollTo(0, 1);

  /*
   * The bearing icon is shown at need.  Since it begins with nonsense data, begin with it hidden.
   *
   * The icon initially displays default centered text.  Once the range text is changed the "x" must
   * be adjusted for the new text width.  This seems to be the only way to center SVG text.
   */
  BEAR.iconBearingTextBBX = document.getElementById("iconBearingText").getBBox().x;
  BEAR.iconBearingTextBBWidth = document.getElementById("iconBearingText").getBBox().width;
  document.getElementById(BEAR.iconBearingName).style.visibility = "hidden";

  /*
   * By default, the ship starts pointing at direction A, L/R level.
   *
   * In the future, perhaps load from an HTML database?
   */
  AVID.current = AVID.makeAxesCopy(AVID.initialAxes);

  /*
   * This resizes the AVID, and all of the SVGs within it.
   * No need to individually resize layers or icons.
   *
   * We want to have a large AVID hexagon, but not confuse the users later with
   * a changing interface size.  A way to accomodate this is to decide beforehand
   * on a "max form factor" value that provides for some expansion.
   *
   * On an iPad the height:width is around 1.2:1.  On a 7-inch tablet the form
   * factor seems to be around 1.6:1.  In practice the AVID is coming out to
   * a 1.35:1 form factor.  Barring other counsel, I'm going to apply 1.4:1.
   *
   * If the web page uses a meta viewport of "initial-scale=1" the pixel sizes
   * reported by the browser will be that of "CSS pixels", which work just fine.
   * The CSS pixels have the window.devicePixelRatio baked-in.
   *
   * The original width is needed as an offset when rotating the entire AVID.
   */
  var minWindowDim = Math.min(window.innerWidth, window.innerHeight);
  var maxWindowDim = Math.max(window.innerWidth, window.innerHeight);
  var minEffectiveDim = Math.min(minWindowDim, (maxWindowDim / 1.4));
  var minDim = minEffectiveDim * AVID.avidSizeFactor;

  var avidWrapper = document.getElementById("avidWrapper");
  AVID.originalClientWidth = avidWrapper.clientWidth;

  var resizeFraction = minDim / AVID.originalClientWidth;

  avidWrapper.setAttribute("height", minDim);
  avidWrapper.setAttribute("width", minDim);

  var avidSelectIcon = document.getElementById("iconHelmSelectFC");
  avidSelectIcon.setAttribute("height", 40 * resizeFraction);
  avidSelectIcon.setAttribute("width", 40 * resizeFraction);

  avidSelectIcon = document.getElementById("iconBearingSelectFC");
  avidSelectIcon.setAttribute("height", 40 * resizeFraction);
  avidSelectIcon.setAttribute("width", 40 * resizeFraction);

  avidSelectIcon = document.getElementById("iconFishbowlSelectFC");
  avidSelectIcon.setAttribute("height", 40 * resizeFraction);
  avidSelectIcon.setAttribute("width", 40 * resizeFraction);

  var avidSelectIcon = document.getElementById("iconHelmSelect");
  avidSelectIcon.setAttribute("height", 40 * resizeFraction);
  avidSelectIcon.setAttribute("width", 40 * resizeFraction);

  avidSelectIcon = document.getElementById("iconBearingSelect");
  avidSelectIcon.setAttribute("height", 40 * resizeFraction);
  avidSelectIcon.setAttribute("width", 40 * resizeFraction);

  // This centers the AVID div.
  document.getElementById("divAll").style.width = "" + minDim + "px";

  var fishBowlCombo = document.getElementById("fishBowlCombo");
  var height = parseInt(fishBowlCombo.getAttribute("height"), 10);
  var width = parseInt(fishBowlCombo.getAttribute("width"), 10);
  fishBowlCombo.setAttribute("height", minDim * height / width);
  fishBowlCombo.setAttribute("width", minDim);

  // This centers the fishbowl div.
  document.getElementById("divFishbowl").style.width = "" + minDim + "px";
  document.getElementById("shipRosterList").style.width = "" + minDim + "px";
  document.getElementById("divShipRosterListButtons").style.width = "" + minDim + "px";
  document.getElementById("fleetCommandList").style.width = "" + minDim + "px";
  document.getElementById("divHelmControls").style.width = "" + minDim + "px";

  BRIDGE.showPanel("about");

  AVID.enableAvidPivots();
  AVID.hideAllMidpointAxes();
  FISH.resetView();

  // The "rotate" icon needs to be initially set.
  AVID.setRotateIconToRotation();

  document.getElementById("iconUndo").addEventListener("click", AVID.undoMove, false);
  document.getElementById("iconClearBearing").addEventListener("click", BEAR.clearBearings, false);
  document.getElementById("iconRotate").addEventListener("click", AVID.rotateAvid, false);

  BRIDGE.hideElement("iconCrumbPU");
  BRIDGE.hideElement("iconCrumbPUBR");
  BRIDGE.hideElement("iconCrumbPD");
  BRIDGE.hideElement("iconCrumbPDBR");
  BRIDGE.hideElement("iconCrumbRU");

  BRIDGE.startupLoadFromDatabase();

  if (BRIDGE.countShips() === 0) {
    BRIDGE.hideElement("btnAboutFleetCommand");
  }

  BRIDGE.hideElement("btnGameSetupNext");

  BRIDGE.prefillCrumbs();
};

/**
 * The panels[] list contains each full-window display we want to go to.
 *
 * This is defined at the BOTTOM of the file because only here are the function references available.
 */
BRIDGE.panels = {};
BRIDGE.panels["about"] = {id: "divAbout"};
BRIDGE.panels["gameSetup"] = {id: "divGameSetup", postFcn: BRIDGE.gameSetupLoad};
BRIDGE.panels["shipRoster"] = {id: "divShipRoster", postFcn: BRIDGE.shipRosterLoad};
BRIDGE.panels["editShip"] = {id: "divEditShip", postFcn: BRIDGE.editShipLoad};
BRIDGE.panels["fleetCommand"] = {id: "divFleetCommand", postFcn: BRIDGE.fleetCommandLoad};
BRIDGE.panels["helm"] = {id: "divBridge", postFcn: BRIDGE.showHelm};
BRIDGE.panels["bearing"] = {id: "divBridge", postFcn: BRIDGE.showBearing};
BRIDGE.panels["fishbowl"] = {id: "divBridge", postFcn: BRIDGE.showFishbowl};
BRIDGE.panels["adjustAVID"] = {id: "divBridge", postFcn: BRIDGE.adjustAVID};
