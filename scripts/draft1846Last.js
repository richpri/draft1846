/*
 * The draft1846Last script contains the functions used by the
 * draft1846Last page.
 * 
 * Copyright (c) 2020 Richard E. Price under the The MIT License.
 * A copy of this license can be found in the LICENSE.text file.
 *
 * All draft1846 global variables are contained in one 'master variable'
 * called D1846.  This isolates them from all other global variables.
 * The D1846 master variable is defined in the draft1846Com.js file.
 */

/*
 * The getDraftResult function is the call back function for 
 * the ajax call to getDraft.php. It checks that it is the  
 * current players turn and sets up the first part of the  
 * draft1846Last page.
 *  
 * Output from getDraft.php is a json encoded array.   
 * The "return" value will be either "success" or "fail". If 
 * it is "fail" then it will be the only item in the array.
 * If the "return" value is "success", then the rest of the
 * array will be the json string from the specified table row.
 */
function getDraftResult(result) {
  D1846.draft = jQuery.parseJSON(result);
  D1846.updtCount = D1846.draft.updtCount;
  var result = D1846.draft.return;
  if (result === 'fail') {
    var errmsg = 'draft1846Last: getDraft.php failed.\n';
    errmsg += 'Please contact the DRAFT1846 webmaster.\n';
    errmsg += D1846.adminName + '\n';
    errmsg += D1846.adminEmail;
    alert(errmsg);
    return;
  }
  else if (result !== 'success') {
    // Something is definitly wrong in the code.
    var nerrmsg = 'draft1846Last: Invalid return code from getDraft.php.\n';
    nerrmsg += 'Please contact the DRAFT1846 webmaster.\n';
    nerrmsg += D1846.adminName + '\n';
    nerrmsg += D1846.adminEmail;
    alert(nerrmsg);
    return;
  }
  
  var urlkey = D1846.draft.players[D1846.input.playerid-1].urlKey;
  if (D1846.input.urlkey !== urlkey) {
    $('#did').append('<br><br>The <b>urlkey</b> on this link is invalid.');
    $('#did').append('<br>This should not occur.');
    $('.allforms').hide();
    $('#canform').show();
    return;
  }
  
  if (D1846.draft.hand.length === 1 && D1846.draft.hand[0] !== 'Blank Card') {
    D1846.draft.status = 'Last';
  }
  
  var thisPlayer = D1846.draft.players[D1846.input.playerid-1].name
  var curPlayer = D1846.draft.players[D1846.draft.curPlayer-1].name
  $('#pid').append( thisPlayer).append('.');
  
  switch (D1846.draft.status) {
    case 'Pending':
    case 'Confirmed':
      $('#did').append('<br><br>This draft has not yet started.');
      $('#did').append('<br><br>The current player is ');
      $('#did').append(curPlayer).append('.');
      $('.allforms').hide();
      $('#canform').show();
      return;
      break;
    case 'Active':
      $('#did').append('<br><br>This draft is active.<br>');
      $('#did').append('The draft1846Last page does not handle Active drafts.');
      $('#did').append('<br><br>The current player is ');
      $('#did').append(curPlayer).append('.');
      $('.allforms').hide();
      $('#canform').show();
      return;
      break;
    case 'Done':
      draftDone();
      return;
      break;
  }
  if (D1846.draft.status !== 'Last') {
    var nerrmsg = 'draft1846Last: Invalid draft status code.\n';
    nerrmsg += 'Please contact the DRAFT1846 webmaster.\n';
    nerrmsg += D1846.adminName + '\n';
    nerrmsg += D1846.adminEmail;
    alert(nerrmsg);
    return;
  }

// Set up and display player status table.
  playerDisplay();
  
// Check for wrong player.
  if (D1846.draft.curPlayer !== D1846.input.playerid) {
    var cpname = D1846.draft.players[D1846.draft.curPlayer-1].name;
    $('#did').append('<br><br>It is not your turn in this draft.');
    $('#did').append('<br><br>The current player is ');
    $('#did').append(cpname).append('.');
    $('.allforms').hide();
    $('#canform').show();
    return;
  }

  var privateName;
  var privateCost;
  var privatePays;
  var numcost;
  var cost1;
  for(i=1; i<=10; i++){
    if (D1846.prInfo[i][0] === D1846.draft.hand[0]) {
      privateName = D1846.prInfo[i][0];
      privateCost = D1846.prInfo[i][1];
      privatePays = D1846.prInfo[i][2];
      break;
    }
  }
  switch(privateName) {
    case 'Big 4':
      numcost = 100;
      break;
    case 'Michigan Southern':
      numcost = 140;
      break;
    default:
      cost1 = privateCost.substring(1);
      numcost = parseInt(cost1);
  }
  numcost -= D1846.draft.cpd;

  var draftHTML = '<p id="lastdraft1">';
  draftHTML+= 'There is only one private left.<br><br>It is ';
  draftHTML+= privateName + ' which usually costs ' + privateCost;
  draftHTML+= ' and pays ' + privatePays + '.</p>';
  $("#lastdraft2").remove();
  $("#lastdraft1").remove();
  $('.allforms').hide();
  $('#draftturn').append(draftHTML);
  if(numcost === 0) { // Has cost been reduced to 0?
    var draftHTML1 = '<p id="lastdraft2">But now it is free. ';
    draftHTML1 += 'Press enter to add it to your holdings.</p>';
    $('#draftturn').append(draftHTML1);
    $('#draftturn').show(); 
    $('#zeroform').show();
  } else {
    var draftHTML2 = '<p id="lastdraft2">';
    if(D1846.draft.cpd !== 0) {
      draftHTML2 += 'But now you can have it for the bargan price of ';
      draftHTML2 +=  numcost +'.<br><br>';
    }
    draftHTML2 +=  'You must either buy it or pass.</p>';
    $('#draftturn').append(draftHTML2);
    $('#draftturn').show(); 
    $('#lastform').show();
  }
  D1846.draft.cpd += 10;
  D1846.privateName = privateName;
  D1846.numcost = numcost;
}

/*
 * The processLastSelection function uses the last card   
 * to update the current player's hand.   
 * The draft will then have completed.
 */
function processLastSelection() {
  D1846.draft.hand.length = 0;
  var playerIndex = D1846.input.playerid - 1;
  D1846.draft.players[playerIndex].privates.push(D1846.privateName);
  var cash = D1846.draft.players[playerIndex].cash;
  cash -= D1846.numcost;
  D1846.draft.players[playerIndex].cash = cash; 
  $("#lastdraft2").remove();
  $("#lastdraft1").remove();
  finishDraft();
}

/*
 * The processPass function saves the updated  
 * value of D1846.draft.cpd to the database.   
 * It then causes updateDraftResult to send
 * an email to the next player.
 */
function processPass() {
  var dataString = JSON.stringify(D1846.draft);
  var cString = "draftid=" + D1846.input.draftid;
  cString += "&draft=" + dataString;
  $.post("php/updtDraft.php", cString, updateDraftResult);
};

/*
 * The updateDraftResult function is the call back function for 
 * the ajax calls to updateDraft.php. It checks for collisions.
 * Then I checks if the draft is over. If it is then it calls 
 * draftDone for each player. Else it sends a draft1846Last 
 * email to the next player.
 *  
 * Output from updateDraft is an echo return status of 
 * "success", "collision" or "fail". 
 * 
 */
function updateDraftResult(result) {
  if (result === 'fail') {
    var errmsg = 'draft1846Last: updtDraft.php failed.\n';
    errmsg += 'Please contact the DRAFT1846 webmaster.\n';
    errmsg += D1846.adminName + '\n';
    errmsg += D1846.adminEmail;
    alert(errmsg);
    return;
  }
  if (result === 'collision') { // Back out and perhaps try again
    $('.allforms').hide();
    $('#collform').show();
    return;
  }
  if (result !== 'success') {
    // Something is definitly wrong in the code.
    var nerrmsg = 'draft1846Last: Invalid return code from updtDraft.php.\n';
    nerrmsg += 'Please contact the DRAFT1846 webmaster.\n';
    nerrmsg += D1846.adminName + '\n';
    nerrmsg += D1846.adminEmail;
    alert(nerrmsg);
    return;
  }
  var nextp = D1846.input.playerid +1;
  if (nextp > D1846.draft.numbPlayers){
    nextp = 1;
  }
  var nextString = 'draftid=' + D1846.input.draftid + '&playerid=' + nextp;
  $.post("php/emailLast.php", nextString, nextEmailResult);
}

/* 
 * Function nextEmailsResult is the call back function for the
 * ajax call to emailNext.php. It only needs to check for errors.
 *  
 * Output from emailNext.php 
 * is an echo return status:
 *   "success" - Email sent.
 *   "fail"    - Uexpected error - This email not sent.
 */
function nextEmailResult(response) {
  if (response === 'fail') {
    var errmsg = 'draft1864Last: Sending an email to a player failed.\n';
    errmsg += 'Please contact the DRAFT1846 webmaster.\n';
    errmsg += D1846.adminName + '\n';
    errmsg += D1846.adminEmail;
    alert(errmsg);
  }
  else if (response !== 'success') {
    // Something is definitly wrong in the code.
    var nerrmsg = 'draft1864Last: Invalid return code from emailPlayer.php.\n';
    nerrmsg += 'Please contact the DRAFT1846 webmaster.\n';
    nerrmsg += D1846.adminName + '\n';
    nerrmsg += D1846.adminEmail;
    alert(nerrmsg);
  }

  $('#did').append('<br><br>Your turn in this draft is completed.');
  $('#did').append('<br>An email has been sent to the next player.');
  playerDisplay();
  $('#draftturn').hide();
  $('.allforms').hide();
  $('#doneform').show();
}

/*
 * The finishDraft function updates the draft status to "Done".
 * It then calls updtDraft.php to do the final update to the draft.
 */
function finishDraft()  {
  D1846.draft.status = "Done";
  var dataString = JSON.stringify(D1846.draft);
  var cString = "draftid=" + D1846.input.draftid;
  cString += "&draft=" + dataString;
  $.post("php/updtDraft.php", cString, finishDraftResult);
}

/*
 * The finishDraftResult function is the call back function for 
 * the ajax call by the finishDraft function to updtDraft.php. 
 * It sends a completed email to each player and then
 * it calls the draftDone function.
 */
function finishDraftResult(result)  {
  if (result === 'fail') {
    var errmsg = 'draft1864Last: updtDraft.php failed.\n';
    errmsg += 'Please contact the DRAFT1846 webmaster.\n';
    errmsg += D1846.adminName + '\n';
    errmsg += D1846.adminEmail;
    alert(errmsg);
    return;
  }
  if (result === 'collision') { // Back out and perhaps try again
    $('.allforms').hide();
    var collmsg = D1846.adminName + ' at ' + D1846.adminEmail + '.';
    $('#collp').append(collmsg);
    $('#collform').show();
    return;
  }
  if (result !== 'success') {
    // Something is definitly wrong in the code.
    var nerrmsg = 'draft1864Last: Invalid return code from updtDraft.php.\n';
    nerrmsg += 'Please contact the DRAFT1846 webmaster.\n';
    nerrmsg += D1846.adminName + '\n';
    nerrmsg += D1846.adminEmail;
    alert(nerrmsg);
    return;
  }
  $("#did").append("<br><br>Informing all players that draft is over.");
  var i, pLine, doneString;
  for (i = 1; i <= D1846.draft.numbPlayers; i++) {
    pLine = "<br>Prepairing draft done email for player ";
    pLine += D1846.draft.players[i-1].name; 
    $("#did").append(pLine);
    doneString = 'draftid=' + D1846.input.draftid + '&playerid=' + i;
    $.post("php/emailDone.php", doneString, doneEmailResult);
  }
  draftDone();
}

/*
 * The doneEmailResult function is the call back function for 
 * the ajax call to emailDone.php. It will have to
 * process returns from multiple emails for the same call.
 *  
 * Output from emailDone.php 
 * is an echo return status:
 *   "success" - Email sent.
 *   "fail"    - Uexpected error - This email not sent.
 */
function doneEmailResult(response)  {
  if (response === 'fail') {
    var errmsg = 'draft1864Last: Sending a done email to a player failed.\n';
    errmsg += 'Please contact the DRAFT1846 webmaster.\n';
    errmsg += D1846.adminName + '\n';
    errmsg += D1846.adminEmail;
    alert(errmsg);
  }
  else if (response !== 'success') {
    // Something is definitly wrong in the code.
    var nerrmsg = 'draft1864Last: Invalid return code from emailDone.php.\n';
    nerrmsg += 'Please contact the DRAFT1846 webmaster.\n';
    nerrmsg += D1846.adminName + '\n';
    nerrmsg += D1846.adminEmail;
    alert(nerrmsg);
  }
  $("#did").append("<br>A draft done email has been sent.");
}
