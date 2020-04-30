<?php

/* 
 * finishDraft.php is the server side code for the 
 * AJAX finishDraft call. It updates the specified table 
 * row in the draft_table in the draft1846 database
 * buy setting the status to "Done".
 * 
 * Input consists the "draftid" for the table row. 
 * 
 * Output is an echo return status of 
 * "success" or "fail". 
 * 
 * Copyright (c) 2020 Richard E. Price under the The MIT License.
 * A copy of this license can be found in the LICENSE.text file.
 */

require_once('config.php');
$qry0 = "ROLLBACK";

$link = mysqli_connect(DB_HOST, DB_USER, 
        DB_PASSWORD, DB_DATABASE);
if ($link === false) {
  $logMessage = 'finishDraft: MySQL Connect Error';
  error_log($logMessage); 
  echo "fail";
  exit;
}

//Function to sanitize values received from the form. 
//Prevents SQL injection
function clean($conn, $str1) {
  $str = trim($str1);
  return mysqli_real_escape_string($conn, $str);
}

$draftid = clean($link, $_REQUEST['draftid']);

// Start transaction.
$qry1 = "START TRANSACTION";
$result1 = mysqli_query($link, $qry1);
if (!$result1) {
  $logMessage = 'finishDraft: MySQL Start Error: ' . mysqli_error($link);
  error_log($logMessage);
  echo "fail";
  exit;
}
//Create SELECT query
$qry2 = "SELECT * FROM draft_table WHERE draft_id ='$draftid' FOR UPDATE";
$result2 = mysqli_query($link, $qry2);
if ($result2) {
  if (mysqli_num_rows($result2) === 0) { // no such draft
    error_log("finishDraft: SELECT Query failed: No draft found!");
    mysqli_query($link, $qry0); // ROLLBACK
    echo "fail";
    exit;
  } 
} else {
  error_log("finishDraft: SELECT Query failed: general failure");
  mysqli_query($link, $qry0); // ROLLBACK
  echo "fail";
  exit;
}

$draftrow = mysqli_fetch_assoc($result2);
$draftjson1 = $draftrow["draft"];
$draftarray = json_decode($draftjson1, true);

$draftarray[status] = "Done";
$draftjson3 = json_encode($draftarray);

//Create UPDATE query
$qry3 = "UPDATE draft_table SET draft='$draftjson3' WHERE draft_id='$draftid'";  
$result3 = mysqli_query($link,$qry3);
if (!$result3) {   // Did the query fail
  $logMessage = 'finishDraft: UPDATE Query failed:' . mysqli_error($link);
  error_log($logMessage);

  echo "fail"; 
  exit;
}

$qry4 = "COMMIT";
mysqli_query($link, $qry4); // COMMIT

echo "success";