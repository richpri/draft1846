<?php

/* 
 * The makeDraft.php is the server side code for the 
 * AJAX makeDraft call. It creates a new table row 
 * for the draft_table in the draft1846 database.
 * 
 * Input consists the "draft" json string to be stored.
 * 
 * Output is the draft_id of the new table row
 * or "0" if a failure occured. 
 * 
 * Copyright (c) 2020 Richard E. Price under the The MIT License.
 * A copy of this license can be found in the LICENSE.text file.
 */

require_once('config.php');

$link = mysqli_connect(DB_HOST, DB_USER, 
        DB_PASSWORD, DB_DATABASE);
if ($link === false) {
  $logMessage = 'makeDraft: MySQL Connect Error';
  error_log($logMessage);
  echo "fail";
  exit;
}

$draft = $_REQUEST['draft'];
//Create INSERT query
$qry1 = "INSERT INTO draft_table SET draft='$draft'";  
$result1 = mysqli_query($link,$qry1);
if (!$result1) {   // Did the query fail
  $logMessage = 'MySQL Error 2: ' . mysqli_error($link);
  error_log($logMessage);
  echo 0; 
  exit;
}

$draftid = mysqli_insert_id($link);
echo $draftid;

