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
    DraftDone();
    return;
  }
  
  if (D1846.draft.curPlayer !== D1846.input.playerid) {
    $('#draftrpt').append('It is not your turn in this draft.');
    return;
  }
  
  if (D1846.draft.status !== "Active") {
    $('#draftrpt').append('This draft has not yet started.');
    return;
  }

  var curptr, curcash, curcards;
  var rptHTML = '<br><table id="rptlist" >';
  rptHTML+= '<tr style="background-color: #ddffdd"><th>Player<br>Name</th>';
  rptHTML+= '<th>Current<br>Player?</th><th>Player\'s<br>Cash</th>';
  rptHTML+= '<th>Player\'s<br>Privates</th></tr>';
  
// Set up and display player status table.
  $.each(D1846.draft.players,function(index,listInfo) {
    if ((index +1) === D1846.input.playerid) {
      curptr = 'Yes';
      curcash = listInfo.cash;
      curcards = '';
      $.each(listInfo.privates,function(pindex,pInfo) { 
        curcards += pInfo + '  ';
      }); // end of each
    } else {
      curptr = '';
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

// Deal the new hand 
  D1846.deck = D1846.draft.deck;
  D1846.hand = D1846.draft.hand;
  emptyHand();
  if (fillHand() === false) { // draft is over.
    // update table record with D1846.draft.status = "Done"
    draftDone();
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
  D1846.hand =D1846.draft.hand.slice();
  var handIdx = cardsel - 1;
  var selectArray = D1846.hand.splice(handIdx,1);
  var selected = selectArray[0];
  var cost;
  for(i=0; i<10; i++){
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
  var cString = "draft_id=" + D1846.draftid;
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
  if (result === 'collision') {
    handleCollision();
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
  
  var dbgmsg = 'Just finished DB update.\n';
  dbgmsg += JSON.stringify(D1846.draft);
  alert(dbgmsg);
  
}


function handleCollision() {alert('Collision.');}


function draftDone() {alert('Draft Done.');}
