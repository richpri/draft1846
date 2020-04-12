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
 * the ajax calls to getDraft.php. It sets up part of the  
 * draft1846Next page and checks that it is the current 
 * players turn.
 *  
 * Output from getDraft.php is ajson encoded array.   
 * The "return" value will be either "success" or "fail". If 
 * it is "fail" then it will be the only item in the array.
 * If the "return" value is "success", then the rest of the
 * array will be the json string from the specified table row.
 */
function getDraftResult(result) {
  D1846.draft = jQuery.parseJSON(result);
  var status = D1846.draft.return;
  if (status === 'fail') {
    var errmsg = 'getDraft.php failed.\n';
    errmsg += 'Please contact the DRAFT1846 webmaster.';
    alert(errmsg);
    return;
  }
  else if (status !== 'success') {
    // Something is definitly wrong in the code.
    var nerrmsg = 'Invalid return code from getDraft.php.\n';
    nerrmsg += status + '\nPlease contact the DRAFT1846 webmaster.';
    alert(nerrmsg);
    return;
  }
  
  var thisPlayer = D1846.draft.players[D1846.input.playerid].name
  $('#pid').append( thisPlayer).append('.');
  if (D1846.draft.status !== "Active") {
    $('#draftrpt').append('This draft has not yet started.');
    return;
  }

  var curptr, curcash, curcards;
  var rptHTML = '<br><table id="rptlist" >';
  rptHTML+= '<tr><th>Player<br>Name</th><th>Current<br>Player?</th>';
  rptHTML+= '<th>Player\'s<br>Privates</th></tr>';

  $.each(D1846.draft.players,function(index,listInfo) {
    if ((index +1) === D1846.input.playerid) {
      curptr = 'Yes';
      curcards = '';
      $.each(listInfo.privates,function(pindex,pInfo) { 
        curcards += pInfo + '  ';
      }); // end of each
    } else {
      curptr = '';
      curcards = '<i>hidden<i>';
    }
    rptHTML+= '<tr> <td>' + listInfo.name + '</td><td>';
    rptHTML+= curptr + '</td><td>';
    rptHTML+= curcards + '</td></tr>';
  }); // end of each
  rptHTML+= '</table>';
  $("#rptlist").remove();
  $('#draftrpt').append(rptHTML);

  if (D1846.draft.curPlayer !== D1846.input.playerid) {
    $('#draftturn').append('<b>It is not yet your turn in this draft.</b>');
    $('#draftturn').show();
    return;
  }  
}