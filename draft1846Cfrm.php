<?php

/* 
 * The draft1846Cfrm page is called by a link in an email 
 * generated by the draft1846Start page. This page confirms
 * the validity of a player's email address. It then checks
 * checks if all players have passed this validity check.
 * If they have then it kicks off the draft process.
 * 
 * Copyright (c) 2019 Richard E. Price under the The MIT License.
 * A copy of this license can be found in the LICENSE.text file.
 */

// Insure that the input parameters are integers.
$draftid  = filter_input(INPUT_GET, 'draftid',FILTER_SANITIZE_NUMBER_INT);
$player  = filter_input(INPUT_GET, 'playerid',FILTER_SANITIZE_NUMBER_INT);

?>
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>DRAFT1846 - Private Company Draft Tool For 1846 Games</title>
    <link rel="shortcut icon" href="images/favicon.ico" >
    <link rel="stylesheet" href="style/draft1846Com.css" />
    <link rel="stylesheet" href="style/draft1846Cfrm.css" />
    <script type="text/javascript" src="scripts/jquery.js">
    </script> 
    <script type="text/javascript" src="scripts/draft1846Com.js">
    </script> 
    <script type="text/javascript" src="scripts/draft1846Config.js">
    </script>
    <script type="text/javascript" src="scripts/draft1846Cfrm.js">
    </script>
    <script>
      $(function() {
        D1846.draftid = parseInt(<?php echo "$draftid"; ?>);
        D1846.player = parseInt(<?php echo "$player"; ?>);
        $('#did').append(D1846.draftid, ".");
        var cString = "draft_id=" + D1846.draftid + "&player_id=" + D1846.player;
        $.post("php/updtCfrm.php", cString, updateCfrmResult);
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
        <h1>The Private Company Draft Tool For 1846 Games</h1>
      </div>
    </div>
    <div id="restofpage"> 
      <div id="content">
        <p style="font-weight: bold; text-align: center;">
          <span id="did">
            The draft id for this draft is  
          </span>
        </p>
        <p id="cfrm" style="text-align: center;">
          Your Email address has been confirmed.
        </p>
        <p id="confstat" style="text-align: center;">
          The current status of the draft is
        </p>
        <p id="done" style="text-align: center;">
          The draft confirmation process is completed.
        </p>
        <p id="next" style="text-align: center;">
          A next player email has been sent to 
        </p>
      </div>
    </div>
  </body>
</html>
