<?php
/*
 * emailDone.php is the server side code for the 
 * AJAX emailDone call. It creates a draft done
 * email for a specific player. It then calls 
 * sendEmail.php and exits. This leaves it to 
 * sendEmail to return the final 'success' status. 
 * 
 * Input consists the following parameters:
 *   draftid
 *   playerid
 * Both parameters are intigers.
 * 
 * Copyright (c) 2020 Richard E. Price under the The MIT License.
 * A copy of this license can be found in the LICENSE.text file.
 */
require_once('sendEmail.php');
require_once('config.php');

$link = mysqli_connect(DB_HOST, DB_USER, 
        DB_PASSWORD, DB_DATABASE);
if ($link === false) {
  $logMessage = 'emailDone: MySQL Connect Error';
  error_log($logMessage);
  echo "fail";
  exit;
}

//Function to sanitize values received from the form. 
//Prevents SQL injection
function clean($conn, $str) {
  $str1 = trim($str);
  return mysqli_real_escape_string($conn, $str1);
}

$draftid = clean($link, $_REQUEST['draftid']);
$playerid = clean($link, $_REQUEST['playerid']);
$server = $_SERVER['SERVER_NAME'];

//Create SELECT query
$qry1 = "SELECT * FROM draft_table WHERE draft_id ='$draftid'";
$result1 = mysqli_query($link, $qry1);
if ($result1) {
  if (mysqli_num_rows($result1) === 0) { // no such draft
    error_log("emailDone: get Query failed: No draft found!");
    echo 'fail';
    exit;
  } else {
    $draftrow = mysqli_fetch_assoc($result1);
    $draftjson = $draftrow["draft"];
    $draftarray = json_decode($draftjson, true);
    $playername = $draftarray["players"][$playerid-1]["name"];
    $address = $draftarray["players"][$playerid-1]["email"];
    $urlkey = $draftarray["players"][$playerid-1]["urlKey"];
    $cash = $draftarray["players"][$playerid-1]["cash"];
    $privates = ""; 
    foreach ($draftarray["players"][$playerid-1]["privates"] as $prival) {
      $privates .= $prival;
      $privates .= "<br>";
    }
  }
} else {
  error_log("emailDone: get Query failed: general failure");
  echo 'fail';
  exit;
}

$linkaddr = SERVER_NAME;
$subject = '[DRAFT1846] The draft with draft ID of ';
$subject .= $draftid;
$subject .= ' is completed';
$body = <<<XEOD
<p>This is a message from the DRAFT1846 server at $server.</p>
<p>Hello $playername:</p>
<pstyle='font-weight:bold'>
The draft with the Draft ID of $draftid is completed.</p>
<p>You ended the draft with $cash dollars and the following privates:</p>
<p>$privates</p>
<p>To see the Final Player Status, simply click on the URL below.</p>
<p style='font-weight:bold'>
<a href="$linkaddr/draft1846Next.php?urlkey=$urlkey">
$linkaddr/draft1846Next.php?urlkey=$urlkey</a>
</p> 
<p>Thank you for using DRAFT1846.</p>
XEOD;

sendEmail($address, $subject, $body);

