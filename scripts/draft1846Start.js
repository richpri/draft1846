/*
 * The draft1846Start script contains the functions used by the
 * draft1846Start page.
 * 
 * Copyright (c) 2019 Richard E. Price under the The MIT License.
 * A copy of this license can be found in the LICENSE.text file.
 *
 * All draft1846 global variables are contained in one 'master variable'
 * called D1846.  This isolates them from all other global variables.
 * The D1846 master variable is defined in the draft1846Com.js file.
 */

/*
 * The SetupDraft function uses the functions below to setup a
 * new draft by creating a new row in the draft_table and then 
 * sending a confirmation email to each player in the draft.
 */
function SetupDraft() {
  D1846.deck = [];
  D1846.nlist = [];
  D1846.alist = [];
  makePinfo();
  if (D1846.errtxt !== "") {
  D1846.deck = [];
  D1846.nlist = [];
  D1846.alist = [];
  return false;
  }
  makeDeck();
  if (D1846.errtxt !== "") {
  D1846.deck = [];
  D1846.nlist = [];
  D1846.alist = [];
  return false;
  }
  makeDraftRow();
  if (D1846.errtxt !== "") {
  D1846.deck = [];
  D1846.nlist = [];
  D1846.alist = [];
  return false;
  }
}

/*
 * The makeDeck function sets up a D1846.deck array with all 
 * private companies present in the array. It then removes 
 * the privates that will not be used in the game. Then it
 * adds the required number of blank cards to the array. 
 * And finally it shuffles the array.
 */
function makeDeck() {
  D1846.errtxt = "";
  D1846.deck = [
    'Big 4', 'Chicago and W. Indiana', 'Mail Contract',
    'Michigan Southern', 'Lake Shore Line',
    'Michigan Central', 'Ohio and Indiana', 'Meat Packing Co.',
    'Steamboat Co.', 'Tunnel Blasting Co.'
  ];
// Purge removed private companies.
  if (D1846.playercount !== 5){
    $('.boxes:checked').each(function(){
      purgeitem(D1846.deck, $(this).val());
    });
  }
// Test deck size 
  if (D1846.playercount === 3 && D1846.deck.length !== 6){
    D1846.errtxt = 'Please check 2 privates from each group.' ;
    $("#emsg").text(D1846.errtxt).show(); 
  }
  if (D1846.playercount === 4 && D1846.deck.length !== 8){
    D1846.errtxt = 'Please check 1 private from each group.';
    $("#emsg").text(D1846.errtxt).show(); 
  }
  if (D1846.playercount === 5 && D1846.deck.length !== 10){
    D1846.errtxt = 'The deck size is wrong.';
    $("#emsg").text(D1846.errtxt).show(); 
  }
  if (D1846.errtxt === "") {
// Add blank cards.
    var i, j;
    for (i = 1; i <= D1846.playercount; i++) {
      j = D1846.deck.push('Blank Card');
    }
// Shuffle deck.
    shuffle(D1846.deck);
// Uncheck boxes.
    $('.boxes:checked').each(function(){
      $(this).attr('checked', false);
    });
    
  }
}

/* 
 * Function shuffle is used to shuffle a javascript array.
 * I found various forms of this function on many web
 * pages. This particular one is a modified version of
 * the function shown on the javascript.info page at
 * https://javascript.info/task/shuffle
 *  
 *  The shuffle function accepts an array as input and shuffles
 *  the array in place.
 */

function shuffle(array) {
  var i, j, t;
  for (i = array.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
    t = array[i]; array[i] = array[j]; array[j] = t;
  }
}

/* 
 * Function purgeitem is used to remove an item from 
 * a javascript array.
 * 
 * The purgeitem function accepts two parameters:
 *   The first is the array that will be modified.
 *   The second is the item that will be removed.
 * 
 * The function modifies the array in place.
 */

function purgeitem(array, item) {
  var index = array.indexOf(item);
  if (index > -1) {
    array.splice(index, 1);
  }
}

/*
 * The makePinfo function sets up the D1846.nlist array 
 * and the D1846.elist array by accessing the player
 * name and email addresse fields from the setup form
 * on the draft1846Start page. It also checks for 
 * duplicate names.
 */
function makePinfo() {
  $("#emsg").text("").show(); 
  var j, k, n, pp;
  $('.fn1').each(function(i){
    n = D1846.playercount - i-1;
    D1846.nlist[n] = $(this).val();
    if (D1846.nlist[n] === "" && i < D1846.playercount) {
      pp = i + 1;
      D1846.errtxt = 'Player ' + pp + ' is missing.';
      $("#emsg").text(D1846.errtxt).show();  
      $(this).focus();  
      return false; 
    }
  });
  for(j=0; j< D1846.nlist.size; j++) { 
    for(k=0; k<j; k++) { // test for duplicate player.
      if (D1846.nlist[j] === D1846.nlist[k]) {
        D1846.errtxt = 'Do not duplicate player names.';
        $("#emsg").text(D1846.errtxt).show(); 
        return false;
      }
    }
  }
    
  if (D1846.errtxt === "") {
    $('.fn2').each(function(i){
      n = D1846.playercount - i-1;
      D1846.alist[n] = $(this).val();
      if (D1846.alist[n] === "" && i < D1846.playercount) {
        pp = i + 1;
        D1846.errtxt = 'Player ' + pp + ' Email is missing.';
        $("#emsg").text(D1846.errtxt).show();  
        $(this).focus();  
        return false; 
      }
    });
  }
}

/* 
 * Function makeDraftRow creates "D1846.draft",
 * and then uses JSON.stringify to convert it 
 * to the JSON component of the new draft_table 
 * row for this usage of the DRAFT1846 utility.
 * It then does an ajax call to makeDraft.php.
 */
function makeDraftRow() {
  var i;
  D1846.draft = {};
  D1846.draft.status = "Pending";
  D1846.draft.numbPlayers = D1846.playercount;
  D1846.draft.curPlayer = 1;
  D1846.draft.deck = [];
  for (i=0;i<D1846.deck.length;i++) {
    D1846.draft.deck[i] = D1846.deck[i]
  }
  D1846.draft.hand = [];
  D1846.draft.players = [];
  for (i=0;i<D1846.playercount;i++) {
    D1846.draft.players[i] = {};
    D1846.draft.players[i].name = D1846.nlist[i];
    D1846.draft.players[i].email = D1846.alist[i];
    D1846.draft.players[i].confirmed = "No";
    D1846.draft.players[i].cash = 400;
    D1846.draft.players[i].privates = [];
  }
  var dataString = JSON.stringify(D1846.draft);
  var postString = 'draft=' + dataString;
//  alert(postString);
  $.post("php/makeDraft.php", postString,  function(response) {
    newDraftOK(response);
  });
}

/* 
 * Function newDraftOK is the success callback function for 
 * the ajax php/makeDraft.php call. It checks for a failure
 * and then reports the new draft ID to the start page.
 * Finally it calls the startupEmails function.
 * 
 * The php/makeDraft.php call returns the numeric draft_id of 
 * the new table row or the intiger 0 if a failure occured.
 */
function newDraftOK(response) {
  if (response === 0) {
    var errmsg = 'The draft_table row creation failed.\n';
    errmsg += 'Please contact the DRAFT1846 webmaster.';
    alert(errmsg);
    window.location = 'index.html';
  }
  var didmsg = "The new draft ID = ";
  didmsg += response + ". Confirmation emails are being sent to players.";
  D1846.draftID = response;
  $("#emsg").text(didmsg).show();
  D1846.mailError = false;
  D1846.firstReply = true;
  var cstring;
  for (i=0; i<D1846.playercount; i++) {
    pl = i+1;
    cString = 'draftid=' + D1846.draftID;
    cString += '&playerid=' + pl;
    $.post("php/emailConfirmation.php", cString, startupEmailsResult);
  }
}

/* 
 * Function startupEmailsResult is the call back function for
 * the ajax calls to emailConfirmation.php. It will have to
 * process returns from multiple emails for the same call.
 * It only needs to check for errors and it only needs to report 
 * the first error. 
 *  
 * Output from emailPlayer.php 
 * is an echo return status:
 *   "success" - Email sent.
 *   "fail"    - Uexpected error - This email not sent.
 */
function startupEmailsResult(response) {
  if (response === 'fail') {
    if (D1846.mailError === false) {
      var errmsg = 'Sending an email to a player failed.\n';
      errmsg += 'Please contact the DRAFT1846 webmaster.';
      alert(errmsg);
      D1846.mailError = true;
    }
  }
  else if (response !== 'success') {
    // Something is definitly wrong in the code.
    var nerrmsg = 'Invalid return code from emailPlayer.php.\n';
    nerrmsg += response + '\nPlease contact the DRAFT1846 webmaster.';
    alert(nerrmsg);
  }
  else {
    if (D1846.firstReply === true){
      D1846.firstReply = false;
      // Clear player fields on form.
      $('.fn1').each(function(i){
        $(this).val("");
      });
      $('.fn2').each(function(i){
        $(this).val("");
      });
      $('#pwbutton').hide;
    }
  }
}

