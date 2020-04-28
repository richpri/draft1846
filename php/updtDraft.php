<?php

/* 
 * The updtDraft.php is the server side code for the 
 * AJAX updtDraft call. It updates the specified table 
 * row in the draft_table in the draft1846 database.
 * 
 * Input consists the "draftid" and the new value 
 * of "draft" for the table row.
 * 
 * Output is an echo return status of 
 * "success", "collision" or "fail". 
 * 
 * Copyright (c) 2020 Richard E. Price under the The MIT License.
 * A copy of this license can be found in the LICENSE.text file.
 */

require_once('config.php');
$qry0 = "ROLLBACK";

$link = @mysqli_connect(DB_HOST, DB_USER, 
        DB_PASSWORD, DB_DATABASE);
if ($link === false) {
  $logMessage = 'updtDraft: MySQL Connect Error';
  error_log($logMessage);
  echo "fail";
  exit;
}

//Function to sanitize values received from the form. 
//Prevents SQL injection
function clean($conn, $str) {
  $str = @trim($str);
  return mysqli_real_escape_string($conn, $str);
}

$draftid = clean($link, $_REQUEST['draftid']);
$draftinput = json_decode($_REQUEST['draft'], true);

// Start transaction.
$qry1 = "START TRANSACTION";
$result1 = mysqli_query($link, $qry1);
if (!$result1) {
  $logMessage = 'updtDraft: MySQL Start Error: ' . mysqli_error($link);
  error_log($logMessage);
  echo "fail";
  exit;
}
//Create SELECT query
$qry2 = "SELECT * FROM draft_table WHERE draft_id ='$draftid' FOR UPDATE";
$result2 = mysqli_query($link, $qry2);
if ($result2) {
  if (mysqli_num_rows($result2) === 0) { // no such draft
    error_log("updtDraft: SELECT Query failed: No draft found!");
    mysqli_query($link, $qry0); // ROLLBACK
    echo "fail";
    exit;
  } 
} else {
  error_log("updtDraft: SELECT Query failed: general failure");
  mysqli_query($link, $qry0); // ROLLBACK
  echo "fail";
  exit;
}

$draftrow = mysqli_fetch_assoc($result2);
$draftjson1 = $draftrow["draft"];
$draftarray = json_decode($draftjson1, true);

if ($draftarray["updtCount"] !== $draftinput["updtCount"]){
  error_log("updtDraft: Mismatched updtCount");
  mysqli_query($link, $qry0); // ROLLBACK
  echo "collision";
  exit;
}

$draftinput["updtCount"] += 1; // Increment update counter
$draftinput["curPlayer"] += 1; // Increment current player
if ($draftinput["curPlayer"] > $draftinput["numbPlayers"]) {
  $draftinput["curPlayer"] = 1; // Handle curPayer wrap
}

$draftjson3 = json_encode($draftinput);

//Create UPDATE query
$qry3 = "UPDATE draft_table SET draft='$draftjson3' WHERE draft_id='$draftid'";  
$result3 = mysqli_query($link,$qry3);
if (!$result3) {   // Did the query fail
  $logMessage = 'updtDraft: UPDATE Query failed:' . mysqli_error($link);
  error_log($logMessage);
  echo "fail"; 
  exit;
}

$qry4 = "COMMIT";
mysqli_query($link, $qry4); // COMMIT

echo "success";