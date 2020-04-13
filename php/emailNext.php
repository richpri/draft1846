<?php
/*
 * emailNext.php is the server side code for the 
 * AJAX emailNext call. It creates a next player
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
  $logMessage = 'emailNext: MySQL Connect Error';
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
    error_log("emailNext: getDraft: Query failed: No draft found!");
    echo 'fail';
    exit;
  } else {
    $draftrow = mysqli_fetch_assoc($result1);
    $draftjson = $draftrow["draft"];
    $draftarray = json_decode($draftjson, true);
    $playername = $draftarray["players"][$playerid-1]["name"];
    $address = $draftarray["players"][$playerid-1]["email"];
  }
} else {
  error_log("emailNext: getDraft: Query failed: general failure");
  echo 'fail';
  exit;
}

$subject = '[DRAFT1846] It is your turn in the 1846 draft with ID = ';
$subject .= $draftid;
$body = <<<XEOD
<p>This is a message from the DRAFT1846 server at $server.</p>
<p>Hello $playername:</p>
<pstyle='font-weight:bold'>
It is your turn in the 1846 draft with the Draft ID of $draftid.</p>
<p>This draft is being moderated by the draft1846 draft system.</p>
<p>To take your turn, simply click on the URL below.</p>
<p style='font-weight:bold'>
<a href="https://d1846.board18.org/draft1846Next.php?draftid=$draftid&playerid=$playerid">
d1846.board18.org/draft1846Next.php</a>
</p>
XEOD;

sendEmail($address, $subject, $body);
