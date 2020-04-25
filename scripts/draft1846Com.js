/* 
 * This file contains scripts that are common to 
 * all draft1846 web pages.
 *
 * Copyright (c) 2020 Richard E. Price under the The MIT License.
 * A copy of this license can be found in the LICENSE.text file.
 */

/* All board18 global variables are contained in one
 * 'master variable' called D1846.  This isolates 
 * them from global variables in other packages. 
 */
var D1846 = {}; // The master variable.
D1846.deck = [];
D1846.hand = [];
D1846.nlist = [];
D1846.alist = [];
D1846.prInfo = [ // Private information table.
  ['Blank Card', '$0', '$0'],
  ['Big 4', '$40+$60 debt', '$0'],
  ['Chicago and W. Indiana', '$60', '$10'],
  ['Mail Contract', '$80', '$0'],
  ['Michigan Southern', '$60+$80 debt', '$0'],
  ['Lake Shore Line', '$40', '$15'],
  ['Michigan Central', '$40', '$15'],
  ['Ohio and Indiana', '$40', '$15'],
  ['Meat Packing Co.', '$60', '$15'],
  ['Steamboat Co.', '$40', '$10'],
  ['Tunnel Blasting Co.', '$60', '$20']
];

/* Function setPage() adjusts the height and width
 * of rightofpage and the height of lefttofpage.
 */
function setPage()
{
  var winH = $(window).height();
  var winW = $(window).width();
  var winName = location.pathname.
          substring(location.pathname.lastIndexOf("/") + 1);
  $('#restofpage').css('height', winH-90);
  $('#restofpage').css('width', winW);
}

/* Function resize() waits for 200 ms before
 * executing setPage. Multiple window resize  
 * events that occur within this time peroid 
 * will only trigger the setPage function once.
 */  
$(window).resize(function() 
{
  if(this.resizeTO) clearTimeout(this.resizeTO);
  this.resizeTO = setTimeout(function() 
  {
    $(this).trigger('resizeEnd');
  }, 200);
});
$(window).bind('resizeEnd', function() {
  setPage();
});

/* Initial page resizing. */
$(function(){
  setPage();  
});

/* 
 * Utility Functions 
 */

/* 
 * Function fillHand() deals the top cards from
 * DD1846.deck to DD1846.hand. 
 * 
 * Deal 2 more cards than the number of players.
 *
 * fillHand() returns FALSE if D1846.deck is 
 * empty or contains only blank cards when
 * the function is called.
 */
function fillHand() {
// Check if there are no cards left.
  if (D1846.deck.length === 0) {
    return false;
  }
// Check if there are only blank cards left.
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

// fill hand
  var aa;
  for (i = 0; i < D1846.draft.numbPlayers+2; i++) {
    aa = D1846.deck.shift();
    if (typeof aa === 'undefined') {
      break;
    } else {
      D1846.hand.push(aa);
    }
  }
  return true;
}

/* 
 * Function emptyHand() coppies all cards from
 * DD1846.hand to the bottom of DD1846.deck. 
 * It then empties DD1846.hand.
 */
function emptyHand() {

// Is hand already empty?
  if (D1846.hand.length === 0) { // Hand already empty?
    return true;
  }

  var j;
  for (i=0; i < D1846.hand.length; i++) {
    j = D1846.deck.push(D1846.hand[i]);
  }
  D1846.hand.length = 0;
  return true;
}