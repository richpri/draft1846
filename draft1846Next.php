<?php

/* 
 * The draft1846Next page is called from an email generated by
 * a previous iteration of draft1846Next or by draft1846Cfrm.  
 * This page deals a new hand and updates the database. It then
 * sends an email to the next player for him to take his turn.
 * 
 * This page's URL must contain 2 parameters [both integers]:
 *      draftid
 *      playerid
 * 
 * Copyright (c) 2020 Richard E. Price under the The MIT License.
 * A copy of this license can be found in the LICENSE.text file.
 */

// Insure that the input parameters are integers.
$draftid  = filter_input(INPUT_GET, 'draftid',FILTER_SANITIZE_NUMBER_INT);
$playerid  = filter_input(INPUT_GET, 'playerid',FILTER_SANITIZE_NUMBER_INT);
?>
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>DRAFT1846 - Private Company Draft Tool For 1846 Games</title>
    <link rel="shortcut icon" href="images/favicon.ico" >
    <link rel="stylesheet" href="style/draft1846Com.css" />
    <link rel="stylesheet" href="style/draft1846Next.css" />
    <script type="text/javascript" src="scripts/jquery.js">
    </script> 
    <script type="text/javascript" src="scripts/draft1846Com.js">
    </script>
    <script type="text/javascript" src="scripts/draft1846Config.js">
    </script>
    <script type="text/javascript" src="scripts/draft1846Next.js">
    </script>
    <script>
      $(function() {
        $('.error').hide();
        D1846.errtxt = "";
        D1846.input = [];
        D1846.input.draftid = parseInt(<?php echo "$draftid"; ?>);
        D1846.input.playerid = parseInt(<?php echo "$playerid"; ?>);
        $('#did').append(D1846.input.draftid).append('.');
        var cString = "draftid=" + D1846.input.draftid;
        $.post("php/getDraft.php", cString, getDraftResult);
       
        $("#button1").click(function(){
          processSelection();
          return false;          
        }); // end button1 click
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
        <div style="font-weight: bold; text-align: center;">
          <p id="pid">
            Hello   
          </p>
          <p id="did">
            The draft id for this draft is  
          </p>
        </div>
        <div id="draftrpt">
        </div>
        <div id="draftturn">
        </div>
        <div id="draftform">
          Be sure to select your card before you press enter!<br>
          <form name="form1" action="" >
            <label for="cardsel">Select card by number [1 to 5]: </label>
            <input type="number" name="cardsel" id="cardsel"
                   value="1" min="1" max="5">
            <input type="button" name="pwbutton" class="pwbutton" 
                   id="button1" value="Enter" >
          </form>
        </div>
     </div>  
    </div>  

  </body>
</html>


