<?php

/* 
 * The updtCfrm.php is the server side code for the 
 * AJAX updtCfrm call. It updates the "confirmed" 
 * flag for a player, checks the confirmation status
 * for the draft and then returns the json draft text 
 * in the table row for the draft being processed.
 * 
 * Input consists the "draft_id" for the table row to
 * be updated. And the player_id for the player whose
 * email address is to be confirmed.
 * 
 * Output is a json encoded array. The "return"  
 * value will be either "success" or "fail". If it
 * is "fail" then it will be the only item in the array.
 * If the "return" value is "success", then the rest of the
 * array will be the json string from the updated table row.
 * If this player was the last to confirm, then the returned
 * json string will have a "status" of "Confirmed" but the
 * json string in the database will have a "status" of "Active".
 * 
 * Copyright (c) 2020 Richard E. Price under the The MIT License.
 * A copy of this license can be found in the LICENSE.text file.
 */

require_once('config.php');
$qry0 = "ROLLBACK";
$failrtn = array("return" => "fail");
$failreturn = json_encode($failrtn);

$link = @mysqli_connect(DB_HOST, DB_USER, 
        DB_PASSWORD, DB_DATABASE);
if (mysqli_connect_error()) {
  $logMessage = 'updtCfrm: MySQL Connect Error: ' . mysqli_connect_error();
  error_log($logMessage);
  echo $failreturn;
  exit;
}

//Function to sanitize values received from the form. 
//Prevents SQL injection
function clean($conn, $str) {
  $cstr = @trim($str);
  return mysqli_real_escape_string($conn, $cstr);
}

$draftid = clean($link, $_REQUEST['draft_id']);
$playerid = clean($link, $_REQUEST['player_id']);


// Start transaction.
$qry1 = "START TRANSACTION";
$result1 = mysqli_query($link, $qry1);
if (!$result1) {
  $logMessage = 'updtCfrm: MySQL Start Error: ' . mysqli_error($link);
  error_log($logMessage);
  echo $failreturn;
  exit;
}
//Create SELECT query
$qry2 = "SELECT * FROM draft_table WHERE draft_id ='$draftid' FOR UPDATE";
$result2 = mysqli_query($link, $qry2);
if ($result1) {
  if (mysqli_num_rows($result2) === 0) { // no such draft
    error_log("updtCfrm: SELECT Query failed: No draft found!");
    mysqli_query($link, $qry0); // ROLLBACK
    echo $failreturn;
    exit;
  } 
} else {
  error_log("updtCfrm: SELECT Query failed: general failure");
  mysqli_query($link, $qry0); // ROLLBACK
  echo $failreturn;
  exit;
}

$draftrow = mysqli_fetch_assoc($result2);
$draftjson = $draftrow["draft"];
$draftarray = json_decode($draftjson, true);
$draftarray["return"] = "success";
$draftjson2 = json_encode($draftarray);
if ($draftarray["status"] === "Active"){ // If the confirmation process is over.
  mysqli_query($link, $qry0); // ROLLBACK
  echo $draftjson2; 
  exit;  
}

$draftarray["players"][$playerid-1]["confirmed"] = "Yes";

// Are all players confirmed?
$players = $draftarray["players"];
$allconfirmed = "Yes";
foreach ($players as $value) { // Are all players confirmed?
  if ($value["confirmed"] === "No") {
    $allconfirmed = "No";
  }
}

if ($allconfirmed === "Yes") {
  $draftarray["status"] = "Active";
}
$draftjson = json_encode($draftarray);

//Create UPDATE query
$qry3 = "UPDATE draft_table SET draft='$draftjson' WHERE draft_id='$draftid'";  
$result3 = mysqli_query($link,$qry3);
if (!$result3) {   // Did the query fail
  error_log("updtCfrm: UPDATE Query failed: general failure");
  mysqli_query($link, $qry0); // ROLLBACK
  echo $failreturn;
  exit;
}

$qry4 = "COMMIT";
mysqli_query($link, $qry4); // COMMIT

if ($draftarray["status"] === "Active") {
  $draftarray["status"] = "Confirmed"; // This causes draft to kickoff.
}

$draftjson2 = json_encode($draftarray);
echo $draftjson2;
