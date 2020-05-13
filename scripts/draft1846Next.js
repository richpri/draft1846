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
    var errmsg = 'getDraft.php failed.\n';
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
  
  var thisPlayer = D1846.draft.players[D1846.input.playerid-1].name
  $('#pid').append( thisPlayer).append('.');
  
  if (D1846.draft.status === "Done") { // This draft is over.
    draftDone();
    return;
  }
  
  if (D1846.draft.status !== "Active") {
    $('#draftrpt').append('This draft has not yet started.');
    $('.allforms').hide();
    $('#canform').show();
    return;
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
  // Check here for only one card not yet selected.
  if (D1846.hand.length === 1) {
    doOneLeft();
    return;
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
  $('#cardsel').attr('max',D1846.hand.length);
  $('#draftform').show();
}

/*
 * The doOneLeft function handles the special case of only one  
 * private company left. It offers it to each successive player  
 * at a cumaltive $10 discount. When discounted price is $0 the
 * current player must take the private company. The price 
 * reduction is tracked by the D1846.draft.cpd variable.
 */
function doOneLeft() {
  var i;
  for(i=1; i<=10; i++){
    if (D1846.prInfo[i][0] === D1846.hand[0]) {
      break;
    }
  }
  var privateName = D1846.prinfo[i][0];
  var privateCost = D1846.prInfo[i][1];
  var privatePays = D1846.prInfo[i][2];
  var numcost = parsint(privateCost) - D1846.draft.cpd;
  if(privateName === 'Big 4') {
    numcost = 100 - D1846.draft.cpd;
  }  
  if(privateName === 'Michigan Southern') {
    numcost = 140 - D1846.draft.cpd;
  }
  D1846.draft.cpd += 10;
  var draftHTML = '<p id="lastdraft">There is only one privatr left.<br><br>';
  draftHTML+= 'It is ' + privateName + ' which costs an adjusted ' + numcost;
  draftHTML+= ' and pays ' + privatePays + '.<br><br>';
  draftHTML+= 'You must either buy it or pass.</p>';
  $("#lastdraft").remove();
  $('.allforms').hide();
  $('#draftturn').append(draftHTML);
  $('#draftturn').show();
  $('#lastform').show();
}

/*
 * The processLastSelection function uses the last card   
 * to update the current player's hand.   
 * The draft will then have completed.
 */
function processLastSelection() {
  var cardsel = 1; //the last card was selected.
  var handIdx = 0;
  var selectArray = D1846.draft.hand.splice(handIdx,1);
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
  var numCost = parseInt(cost2) - D1846.draft.cpd;
  if(selected === 'Big 4') {
    numCost = 100 - D1846.draft.cpd;
  }  
  if(selected === 'Michigan Southern') {
    numCost = 140 - D1846.draft.cpd;
  }
  
  var playerIndex = D1846.input.playerid - 1;
  D1846.draft.players[playerIndex].privates.push(selected);
  var cash = D1846.draft.players[playerIndex].cash;
  cash -= numCost;
  D1846.draft.players[playerIndex].cash = cash; 
  finishDraft();
};

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
  var numCost = parseInt(cost2);
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
 * draftDone for each player. Else it sends a draft1846Next 
 * email to the next player.
 *  
 * Output from updateDraft is an echo return status of 
 * "success", "collision" or "fail". 
 * 
 */
function updateDraftResult(result) {
  if (result === 'fail') {
    var errmsg = 'updtDraft.php failed.\n';
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
    var nerrmsg = 'Invalid return code from updtDraft.php.\n';
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
  $.post("php/emailNext.php", nextString, nextEmailResult);
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
    var errmsg = 'Sending an email to a player failed.\n';
    errmsg += 'Please contact the DRAFT1846 webmaster.\n';
    errmsg += D1846.adminName + '\n';
    errmsg += D1846.adminEmail;
    alert(errmsg);
    window.location.assign("draft1846Goodby.html?msgtype=0");
  }
  else if (response !== 'success') {
    // Something is definitly wrong in the code.
    var nerrmsg = 'Invalid return code from emailPlayer.php.\n';
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
  $.post("php/finishDraft.php", cString, finishDraftResult);
}

/*
 * The finishDraftResult function is the call back function for 
 * the ajax call by the finishDraft function to finishDraft.php. 
 * It sends a completed email to each player and then
 * it calls the draftDone function.
 */
function finishDraftResult(result)  {
  if (result === 'fail') {
    var errmsg = 'finishDraft.php failed.\n';
    errmsg += 'Please contact the DRAFT1846 webmaster.\n';
    errmsg += D1846.adminName + '\n';
    errmsg += D1846.adminEmail;
    alert(errmsg);
    return;
  }
  if (result !== 'success') {
    // Something is definitly wrong in the code.
    var nerrmsg = 'Invalid return code from finishDraft.php.\n';
    nerrmsg += 'Please contact the DRAFT1846 webmaster.\n';
    nerrmsg += D1846.adminName + '\n';
    nerrmsg += D1846.adminEmail;
    alert(nerrmsg);
    return;
  }
  D1846.mailError = false;
  var i;
  for (i = 1; i <= D1846.draft.numbPlayers; i++) {
    var doneString = 'draftid=' + D1846.input.draftid + '&playerid=' + i;
    $.post("php/emailDone.php", doneString, doneEmailResult);
  }
  draftDone();
}

/*
 * The doneEmailResult function is the call back function for 
 * the ajax call to emailDone.php. It will have to
 * process returns from multiple emails for the same call.
 * It only needs to check for errors and it only needs to report 
 * the first error. 
 *  
 * Output from emailDone.php 
 * is an echo return status:
 *   "success" - Email sent.
 *   "fail"    - Uexpected error - This email not sent.
 */
function doneEmailResult(response)  {
  if (response === 'fail') {
    if (D1846.mailError === false) {
      var errmsg = 'Sending a done email to a player failed.\n';
      errmsg += 'Please contact the DRAFT1846 webmaster.\n';
      errmsg += D1846.adminName + '\n';
      errmsg += D1846.adminEmail;
      alert(errmsg);
      D1846.mailError = true;
    }
  }
  else if (response !== 'success') {
    // Something is definitly wrong in the code.
    var nerrmsg = 'Invalid return code from emailDone.php.\n';
    nerrmsg += 'Please contact the DRAFT1846 webmaster.\n';
    nerrmsg += D1846.adminName + '\n';
    nerrmsg += D1846.adminEmail;
    alert(nerrmsg);
  }
}

/*
 * The draftDone function deletes any previously displayed player 
 * status table. It then appends the final player status table
 * to the draftrpt div. The final player status table shows all
 * status for all players. Finally, The draftDone function appends
 * a completed message to the 'did' paragraph.
 */
function draftDone() {
  var curcash, curcards;
  var rptHTML = '<br><table id="rptlist" >';
  rptHTML+= '<caption><b>The Final Player Status</b></caption>';
  rptHTML+= '<tr style="background-color: #ddffdd"><th>Player<br>Name</th>';
  rptHTML+= '<th>Player\'s<br>Cash</th>';
  rptHTML+= '<th>Player\'s<br>Privates</th></tr>';
  $.each(D1846.draft.players,function(index,listInfo) {
    curcash = listInfo.cash;
    curcards = '';
    $.each(listInfo.privates,function(pindex,pInfo) { 
      curcards += pInfo + ' <br>';
    }); // end of each
    curcards = curcards.slice(0, curcards.length - 4);
    rptHTML+= '<tr> <td>' + listInfo.name + '</td><td>';
    rptHTML+= curcash + '</td><td>';
    rptHTML+= curcards + '</td></tr>';
  }); // end of each
  rptHTML+= '</table>';
  $("#rptlist").remove();
  $('#draftrpt').append(rptHTML);
  $('#did').append('<br><br>This draft is completed.');
  $('.allforms').hide();
  $('#doneform').show();
}

/*
 * The playerDisplay function appends the player status table
 * to the draftrpt div. It first deletes any previous table.
 */
function playerDisplay() {
  var curptr, curcash, curcards;
  var rptHTML = '<br><table id="rptlist" >';
  rptHTML+= '<tr style="background-color: #ddffdd"><th>Player<br>Name</th>';
  rptHTML+= '<th>Current<br>Player?</th><th>Player\'s<br>Cash</th>';
  rptHTML+= '<th>Player\'s<br>Privates</th></tr>';
  
  $.each(D1846.draft.players,function(index,listInfo) {
    if ((index +1) === D1846.input.playerid) {
      curptr = 'Yes';
      curcash = listInfo.cash;
      curcards = '';
      $.each(listInfo.privates,function(pindex,pInfo) { 
        curcards += pInfo + ' <br>';
      }); // end of each
      curcards = curcards.slice(0, curcards.length - 4);
    } else {
      curptr = 'No';
      curcash = '<i>hidden<i>';
      curcards = '<i>hidden<i>';
    }
    rptHTML+= '<tr> <td>' + listInfo.name + '</td><td>';
    rptHTML+= curptr + '</td><td>';
    rptHTML+= curcash + '</td><td>';
    rptHTML+= curcards + '</td></tr>';
  }); // end of each
  rptHTML+= '</table>';
  $("#rptlist").remove();
  $('#draftrpt').append(rptHTML);
}
