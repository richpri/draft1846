<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

?>
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>DRAFT1846 - Email test tool</title>
    <link rel="shortcut icon" href="images/favicon.ico" >
    <link rel="stylesheet" href="style/draft1846Com.css" />
    <link rel="stylesheet" href="style/draft1846Index.css" />
    <script type="text/javascript" src="scripts/jquery.js">
    </script> 
    <script type="text/javascript" src="scripts/draft1846Com.js">
    </script>
    <script>
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
    var okmsg = 'Email sent OK.';
    alert(okmsg);
  }
}
    </script>
    <script>
      var mybody = "<p>Hello rich1:</p><p>A new BOARD18 game for 1846 has been created and you are a player in this game. The private company draft for this 1846 game is starting now. This draft is being moderated by the draft1846 draft system. This system is mostly driven by emails.</p><p style='font-weight:bold'>The Draft ID for this draft is 26.</p><p>This email has been sent to you so that you can confirm your email address. To do this paste the URL below into the address field your browser and press enter.</p><p style='font-weight:bold'>https://draft1846Conf.php?id=26;player=rich1</p>"
              
      $(function() {
        $("#printbutton").click(function(){
          var cString = 'draftid=6&playerid=1';
          $.post("php/emailNext.php", cString, nextEmailResult);
          return false;          
        }); // end button click
      });
    </script>
  </head>
  <body>
    <div id="topofpage">
      <div id="logo">
        <img src="images/logo.png" alt="Logo"/> 
      </div>
      <div id="heading">
        <h1>DRAFT1846</h1>
        <h1>Email test tool</h1>
      </div>
    </div>
    <div id="restofpage"> 
      <p style="font-size: 130%; padding: 5px; padding-left: 25px;">
        <b>Send TEST EMAIL</b></p>
      <input type="button" name="printbutton" class="pwbutton"  
         id="printbutton" value="Do test print" >  
      <p><br></p>
    </div>
  </body>
</html>