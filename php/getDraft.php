<?php

/* 
 * The getDraft.php is the server side code for the 
 * AJAX getDraft call. It returns the specified table 
 * row from the draft_table in the draft1846 database.
 * 
 * Input consists the "draftid" for the table row to
 * be returned.
 * 
 * Output is a json encoded array. The "return" value in  
 * the array will be either "success" or "fail". If it
 * is "fail" then it will be the only item in the array.
 * If the "return" value is "success", then the rest of the
 * array will be the json string from the updated table row.
 *  
 * Copyright (c) 2020 Richard E. Price under the The MIT License.
 * A copy of this license can be found in the LICENSE.text file.
 */

require_once('config.php');
$failrtn = array("return" => "fail");
$failreturn = json_encode($failrtn); 

$link = mysqli_connect(DB_HOST, DB_USER, 
        DB_PASSWORD, DB_DATABASE);
if ($link === false) {
  $logMessage = 'getDraft: MySQL Connect Error';
  error_log($logMessage);
  echo $failreturn;
  exit;
}

//Function to sanitize values received from the form. 
//Prevents SQL injection
function clean($conn, $str) {
  $str1 = trim($str);
  return mysqli_real_escape_string($conn, $str1);
}

$draftid = clean($link, $_REQUEST['draftid']);

//Create SELECT query
$qry1 = "SELECT * FROM draft_table WHERE draft_id ='$draftid'";
$result1 = mysqli_query($link, $qry1);
if ($result1) {
  if (mysqli_num_rows($result1) === 0) { // no such draft
    error_log("getDraft: Query failed: No draft found!");
    echo $failreturn;
    exit;
  } 
} else {
  error_log("getDraft: SELECT Query failed: general failure");
  mysqli_query($link, $qry0); // ROLLBACK
  echo $failreturn;
  exit;
}

$draftrow = mysqli_fetch_assoc($result1);
$draftjson = $draftrow['draft'];
$draftarray = json_decode($draftjson, true);
$draftarray["return"] = "success";
$draftjson2 = json_encode($draftarray);
echo $draftjson2; 
