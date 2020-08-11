/*
 * The draft1846Next script contains the functions used by the
 * draft1846Next page.
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
 * the ajax calls to getDraft.php. It checks that it is the  
 * current players turn and sets up the first part of the  
 * draft1846Next page.
 *  
 * Output from getDraft.php is ajson encoded array.   
 * The "return" value will be either "success" or "fail". If 
 * it is "fail" then it will be the only item in the array.
 * If the "return" value is "success", then the rest of the
 * array will be the json string from the specified table row.
 */
function getDraftResult(result) {
  D1846.draft = JSON.parse(result);
  D1846.updtCount = D1846.draft.updtCount;
  var result = D1846.draft.return;
  if (result === 'fail') {
    var errmsg = 'draft1846Next: getDraft.php failed.\n';
    errmsg += 'Please contact the DRAFT1846 webmaster.\n';
    errmsg += D1846.adminName + '\n';
    errmsg += D1846.adminEmail;
    alert(errmsg);
    return;
  }
  else if (result !== 'success') {
    // Something is definitly wrong in the code.
    var nerrmsg = 'Invalid return code from getDraft.php.\n';
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
  
  var thisPlayer = D1846.draft.players[D1846.input.playerid-1].name
  var curPlayer = D1846.draft.players[D1846.draft.curPlayer-1].name
  $('#pid').append( thisPlayer).append('.');
  
  if (D1846.draft.hand.length === 1 && D1846.draft.hand[0] !== 'Blank Card') {
    $('#did').append('<br><br>This draft is in "Last" status.<br>');
    $('#did').append('The draft1846Next page only handles Active drafts.');
    $('#did').append('<br><br>The current player is ');
    $('#did').append(curPlayer).append('.');
    $('.allforms').hide();
    $('#canform').show();
    return;
  }
  
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
    case 'Done':
      draftDone();
      return;
      break;
  }

// Set up and display player status table.
  playerDisplay();

  if (D1846.draft.curPlayer !== D1846.input.playerid) {
    var cpname = D1846.draft.players[D1846.draft.curPlayer-1].name;
    $('#did').append('<br><br>It is not your turn in this draft.');
    $('#did').append('<br><br>The current player is ');
    $('#did').append(cpname).append('.');
    $('.allforms').hide();
    $('#canform').show();
    return;
  }

// Deal the new hand 
  D1846.deck = D1846.draft.deck;
  D1846.hand = D1846.draft.hand;
  emptyHand();
  if (fillHand() === false) { // draft is over.
    // update table record with D1846.draft.status = "Done"
    finishDraft();
    return false;
  } 
  
  // Setup actual draft display.
  var prsel;
  var privateName;
  var privateCost;
  var privatePays;
  var draftHTML = '<br><table id="drftlist" >';
  draftHTML+= '<tr style="background-color: #ddffdd">';
  draftHTML+= '<th>Select</th><th>Private<br>Name</th>';
  draftHTML+= '<th>Private<br>Costs</th>';
  draftHTML+= '<th>Private<br>Pays</th></tr>';
  $.each(D1846.hand,function(index,listInfo) {
    prsel = 1 + index;
    for(i=0; i<=10; i++){
      if (D1846.prInfo[i][0] === listInfo) {
        privateName = D1846.prInfo[i][0];
        privateCost = D1846.prInfo[i][1];
        privatePays = D1846.prInfo[i][2];
        break;
      }
    }
    draftHTML+= '<tr><td>' + prsel + '</td>';
    draftHTML+= '<td>' + listInfo + '</td><td>';
    draftHTML+= privateCost + '</td><td>';
    draftHTML+= privatePays + '</td></tr>';
  }); // end of each
  draftHTML+= '</table>';
  $("#drftlist").remove();
  $('.allforms').hide();
  $('#draftturn').append(draftHTML);
  $('#draftturn').show();
  $('#draftform').show();
}

/*
 * The processSelection function uses the entered cardsel   
 * value to update the current player's hand. It then checks  
 * if the draft has completed.
 */
function processSelection() {
  var cardsel = $("#cardsel").val(); //card that was selected.
  D1846.hand = D1846.draft.hand.slice();
  var handIdx = cardsel - 1;
  // check for selection of nonexistant card
  if (D1846.hand.length <= handIdx) {
    $('#did').append('<br><br>there are only ');
    $('#did').append(D1846.hand.length);
    $('#did').append(' cards left in your hand.');
    $('.allforms').hide();
    $('#againform').show();
    return;
  }
  var selectArray = D1846.hand.splice(handIdx,1);
  var selected = selectArray[0];
  var cost;
  for(i=0; i<11; i++){
    if (D1846.prInfo[i][0] === selected) {
      cost = D1846.prInfo[i][1];
      break;
    }
  }  
  var cost1 = cost.split("+");
  var cost2 = cost1[0].substring(1);
  var numCost = parseInt(cost2, 10);
  if(selected === 'Big 4') {numCost = 100;}
  if(selected === 'Michigan Southern') {numCost = 140;}
  
  D1846.draft.hand =D1846.hand.slice();
  var playerIndex = D1846.input.playerid - 1;
  D1846.draft.players[playerIndex].privates.push(selected);
  var cash = D1846.draft.players[playerIndex].cash;
  cash -= numCost;
  D1846.draft.players[playerIndex].cash = cash;
  
  var dataString = JSON.stringify(D1846.draft);
  var cString = "draftid=" + D1846.input.draftid;
  cString += "&draft=" + dataString;
  $.post("php/updtDraft.php", cString, updateDraftResult);
};

/*
 * The updateDraftResult function is the call back function for 
 * the ajax calls to updateDraft.php. It checks for collisions.
 * Then it checks if the draft is over. If it is then it calls 
 * draftDone for each player. Else it sends a draft1846Next 
 * email to the next player.
 *  
 * Output from updateDraft is an echo return status of 
 * "success", "collision" or "fail". 
 * 
 */
function updateDraftResult(result) {
  if (result === 'fail') {
    var errmsg = 'draft1846Next: updtDraft.php failed.\n';
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
    var nerrmsg = 'draft1846Next: Invalid return code from updtDraft.php.\n';
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
/*
 * Check for one private and no blank cards left.
 * In this case control will be transfered to the emailLast.php page
 */
  if (D1846.draft.hand.length === 1 && D1846.draft.hand[0] !== 'Blank Card') {
    $.post("php/emailLast.php", nextString, nextEmailResult);
  } else {
    $.post("php/emailNext.php", nextString, nextEmailResult); 
  }
}

/* 
 * Function nextEmailsResult is the call back function for both
 * the ajax call to emailNext.php and the ajax call to 
 * emailLast.php. It only needs to check for errors.
 *  
 * Output from emailNext.php 
 * is an echo return status:
 *   "success" - Email sent.
 *   "fail"    - Uexpected error - This email not sent.
 */
function nextEmailResult(response) {
  if (response === 'fail') {
    var errmsg = 'draft1846Next: Sending an email to a player failed.\n';
    errmsg += 'Please contact the DRAFT1846 webmaster.\n';
    errmsg += D1846.adminName + '\n';
    errmsg += D1846.adminEmail;
    alert(errmsg);
    window.location.assign("draft1846Goodby.html?msgtype=0");
  }
  else if (response !== 'success') {
    // Something is definitly wrong in the code.
    var nerrmsg = 'draft1846Next: Invalid return code from emailPlayer.php.\n';
    nerrmsg += 'Please contact the DRAFT1846 webmaster.\n';
    nerrmsg += D1846.adminName + '\n';
    nerrmsg += D1846.adminEmail;
    alert(nerrmsg);
    window.location.assign("draft1846Goodby.html?msgtype=0");
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
    var errmsg = 'draft1846Next: updtDraft.php failed.\n';
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
    var nerrmsg = 'draft1846Next: Invalid return code from updtDraft.php.\n';
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
  if (D1846.mailError === false) {
    var errmsg = 'draft1846Next: Sending a done email to a player failed.\n';
    errmsg += 'Please contact the DRAFT1846 webmaster.\n';
    errmsg += D1846.adminName + '\n';
    errmsg += D1846.adminEmail;
    alert(errmsg);
    D1846.mailError = true;
  }
  else if (response !== 'success') {
    // Something is definitly wrong in the code.
    var nerrmsg = 'draft1846Next: Invalid return code from emailDone.php.\n';
    nerrmsg += 'Please contact the DRAFT1846 webmaster.\n';
    nerrmsg += D1846.adminName + '\n';
    nerrmsg += D1846.adminEmail;
    alert(nerrmsg);
  }
  $("#did").append("<br>A draft done email has been sent.");
}

