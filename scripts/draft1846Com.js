/* 
 * This file contains scripts that are common to 
 * all draft1846 web pages.
 *
 * Copyright (c) 2013 Richard E. Price under the The MIT License.
 * A copy of this license can be found in the LICENSE.text file.
 */

/* All board18 global variables are contained in one
 * 'master variable' called D1846.  This isolates 
 * them from global variables in other packages. 
 */
var D1846 = {};
D1846.noteTimeout = null; // Used by doLogNote().
D1846.welcomename = null; // Used by doLogNote().
D1846.version = "0.0.1";
D1846.deck = [];
D1846.hand = [];

/* 
 * Utility Functions 
 */

/* Function doLogNote displays a lognote for 30 seconds.
 * A new lognote will replace any previous log note 
 * that has not yet timed out. D1846.noteTimeout is a
 * global variable with an initial value of null.
 */
function doLogNote(note) {
  if(D1846.noteTimeout !== null) {
    clearTimeout(D1846.noteTimeout);
  }
  if(D1846.welcomename !== null) {
    var msg = D1846.welcomename + ": " + note;
  } else {
    var msg = note;
  }
  $('#lognote').text(msg);
  D1846.noteTimeout = setTimeout(function() {
    $('#lognote').text("");
    D1846.noteTimeout = null;
  },"20000");
}

/* 
 * Function fillHand() deals the top cards from
 * DD1846.deck to DD1846.hand. 
 * 
 * Deal 2 more cards than the number of players.
 *
 * fillHand() returns FALSE if DD1846.hand is    
 * not empty when the function is called or if
 * D1846.deck is empty when the function is 
 * called.
 */
function fillHand() {
  if (D1846.hand.length !== 0) {
    return false;
  }
  if (D1846.deck.length === 0) {
    return false;
  }
  var aa, i;
  for (i = 0; i < D1846.playercount+2; i++) {
    aa = D1846.deck.shift();
    if (typeof aa === 'undefined') {
      return true;
    }
    D1846.hand.push(aa);
  }
  return true;
}

/* 
 * Function emptyHand() coppies all cards from
 * DD1846.hand to the bottom of DD1846.deck. 
 * It then empties DD1846.hand.
 * 
 * emptyHand() returns FALSE if either all of  
 * the remaining cards in DD1846.deck are
 * blank cards or DD1846.deck is empty.
 */
function emptyHand() {
  if (D1846.deck.length === 0) {
    return false;
  }
  var aa, j;
  var bb = 'No';
  for (i=0; i < D1846.deck.length; i++) {
      if (D1846.deck[i] !== 'Blank Card') {
      bb = 'Yes';
      break;
    }
  }
  if (bb === 'No') {
    return false;
  }
  for (i=0; i < D1846.hand.length; i++) {
    j = D1846.deck.push(D1846.hand[i]);
  }
  D1846.hand.length = 0;
  return true;
}