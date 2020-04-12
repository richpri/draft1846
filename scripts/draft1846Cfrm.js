/*
 * The draft1846Cfrm script contains the functions used by the
 * draft1846Cfrm page.
 * 
 * Copyright (c) 2019 Richard E. Price under the The MIT License.
 * A copy of this license can be found in the LICENSE.text file.
 *
 * All draft1846 global variables are contained in one 'master variable'
 * called D1846.  This isolates them from all other global variables.
 * The D1846 master variable is defined in the draft1846Com.js file.
 */

/*
 * The updateCfrmResult function is the call back function for 
 * the ajax calls to updateCfrm.php. It sets up the rest of the  
 * draft1846Cfrm page and checks the status of the draft.
 *  
 * Output from updateCfrm.php is ajson encoded array.   
 * The "return" value will be either "success" or "fail". If 
 * it is "fail" then it will be the only item in the array.
 * If the "return" value is "success", then the rest of the
 * array will be the json string from the updated table row.
 * If this player was the last to confirm, then the returned
 * json string will have a "status" of "Confirmed" but the
 * json string in the database will have a "status" of "Active".
 */
function updateCfrmResult(result) {
  D1846.draft = jQuery.parseJSON(result);
  var status = D1846.draft.return;
  if (status === 'fail') {
    var errmsg = 'Confirmation update failed.\n';
    errmsg += 'Please contact the DRAFT1846 webmaster.';
    alert(errmsg);
    return;
  }
  else if (status !== 'success') {
    // Something is definitly wrong in the code.
    var nerrmsg = 'Invalid return code from emailPlayer.php.\n';
    nerrmsg += status + '\nPlease contact the DRAFT1846 webmaster.';
    alert(nerrmsg);
    return;
  }
  
  if (D1846.draft.status !== "Active") {
     $('#cfrm').show();
  }

  var cfrmHTML= '<br><table id="cfrmlist" >';
  cfrmHTML+= '<tr><th>Player</th></tr>';
  cfrmHTML+= '<tr><th>Name</th><th>Confirmed?</th></tr>';
  $.each(D1846.draft.players,function(index,listInfo) {
    cfrmHTML+= '<tr> <td class="gameid">';
    cfrmHTML+= listInfo.name + '</td> <td>';
    cfrmHTML+= listInfo.confirmed + '</td> <td></tr>';
  }); // end of each
  cfrmHTML+= '</table>';
  $("#cfrmlist").remove();
  $('#confstat').append(D1846.draft.status);
  $('#confstat').append(cfrmHTML);
  
  if (D1846.draft.status === "Active") {
     $('#done').show();
  }

  if (D1846.draft.status === "Confirmed") {
    var cString = 'draftid=' + D1846.draftid + '&playerid=1';
    $.post("php/emailNext.php", cString, nextEmailResult);
  }
}
  
/* 
 * Function nextEmailsResult is the call back function for the
 * ajax call to emailNext.php. It only needs to check for errors.
 *  
 * Output from emailPlayer.php 
 * is an echo return status:
 *   "success" - Email sent.
 *   "fail"    - Uexpected error - This email not sent.
 */
function nextEmailResult(response) {
  if (response === 'fail') {
    var errmsg = 'Sending an email to a player failed.\n';
    errmsg += 'Please contact the DRAFT1846 webmaster.';
    alert(errmsg);
  }
  else if (response !== 'success') {
    // Something is definitly wrong in the code.
    var nerrmsg = 'Invalid return code from emailPlayer.php.\n';
    nerrmsg += response + '\nPlease contact the DRAFT1846 webmaster.';
    alert(nerrmsg);
  }
  else {
    var player1name = D1846.draft.players[0].name;
    $('#next').append(player1name);
    $('#next').show();
  }
}
  