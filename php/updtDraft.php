<?php

/* 
 * The updtDraft.php is the server side code for the 
 * AJAX updtDraft call. It updates the specified table 
 * row in the draft_table in the draft1846 database.
 * 
 * Input consists the "draft_id" and the new value 
 * of "draft" for the table row.
 * 
 * Output is an echo return status of "success" or "fail". 
 * 
 * 
 * Copyright (c) 2020 Richard E. Price under the The MIT License.
 * A copy of this license can be found in the LICENSE.text file.
 */

require_once('config.php');

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

$draftid = clean($link, $_REQUEST['draft_id']);

$draft = json_decode($_REQUEST['draft'], true);

//Create UPDATE query
$qry1 = "UPDATE draft_table SET draft='$draft' WHERE draft_id='$draftid'";  
$result1 = mysqli_query($link,$qry1);
if (!$result1) {   // Did the query fail
  $logMessage = 'MySQL Error 2: ' . mysqli_error($link);
  error_log($logMessage);
  echo "fail"; 
  exit;
}

echo "success";