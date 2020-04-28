<?php

/* 
 * The draft1846Start page is called by the index.html page. 
 * This page sets up a new 1846 private company draft. It then
 * sends an email to each player to kick off the draft process.
 * 
 * Copyright (c) 2019 Richard E. Price under the The MIT License.
 * A copy of this license can be found in the LICENSE.text file.
 */

// Insure that the players value is an intiger from 3 to 5.
$myplayer1  = filter_input(INPUT_GET, 'players',FILTER_SANITIZE_NUMBER_INT);
$myplayer2 = max($myplayer1, 3);
$myplayers = min($myplayer2, 5);

?>
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>DRAFT1846 - Private Company Draft Tool For 1846 Games</title>
    <link rel="shortcut icon" href="images/favicon.ico">
    <link rel="stylesheet" href="style/draft1846Com.css">
    <link rel="stylesheet" href="style/draft1846Start.css">
    <script type="text/javascript" src="scripts/jquery.js">
    </script> 
    <script type="text/javascript" src="scripts/draft1846Com.js">
    </script>
    <script type="text/javascript" src="scripts/draft1846Config.js">
    </script>
    <script type="text/javascript" src="scripts/draft1846Start.js">
    </script>
    <script>
      $(function() {
        $('.error').hide();
        D1846.dbDone = false;
        D1846.playercount = parseInt(<?php echo "$myplayers"; ?>);
        $('#showcount').append(D1846.playercount, ".");
        if (D1846.playercount === 3) {
          $('.play04').hide();
          $('.play05').hide();
          var tt = 'Check the two private companies to be ';
          tt += 'removed from each group below.';
          $('#privatecount').text(tt);
        }
        if (D1846.playercount === 4) {
          $('.play05').hide();
        }
        if (D1846.playercount === 5) {
          $('#privatecount').hide();
          $('#privates1').hide();
          $('#privates2').hide();
        }
        $("#button1").click(function(){
          D1846.errtxt = "";
          SetupDraft();
          return false;          
        }); // end button1 click
        $("#button2").click(function(){
          if (D1846.dbDone === true) {
            window.location.assign("draft1846Goodby.html?msgtype=1");
          } else {
            window.location.assign("index.html");
          }
          return false;          
        }); // end button2 click   

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
      <p style="font-size: 130%; padding: 5px; padding-left: 25px;">
        <b>Start new 1846 private company draft</b></p>
      <p id="showcount" style="padding-left: 25px;">
        The number of players is </p>
      <div id="content" style="max-width:9.0in;"> 
        <p class="error" id="emsg">error message</p>
        <form name="setupform" id="setupform" action="">
          <fieldset>
            <p><b>Enter players in normal [not reversed] player order.</b></p>
            <p>
              <label for="play1" class="label2">Player 1:</label>
              <input type="text" name="play1" 
                     id="player1" class="fn1">
              <label class="error" for="play1" id="p1_error">
                This field is required.</label>
              <label for="email1" class="label2">Player 1 Email:</label>
              <input type="text" name="email1" 
                     id="player1" class="fn2">
              <label class="error" for="email1" id="e1_error">
                This field is required.</label>
            </p>
            <p>
              <label for="play2" class="label2">Player 2:</label>
              <input type="text" name="play2" 
                     id="play2" class="fn1">
              <label class="error" for="play2" id="p2_error">
                This field is required.</label>
              <label for="email2" class="label2">Player 2 Email:</label>
              <input type="text" name="email2" 
                     id="email2" class="fn2">
              <label class="error" for="email2" id="e2_error">
                This field is required.</label>
            </p>
            <p>
              <label for="play3" class="label2">Player 3:</label>
              <input type="text" name="play3" 
                     id="play3" class="fn1">
              <label class="error" for="play3" id="p3_error">
                This field is required.</label>
              <label for="email3" class="label2">Player 3 Email:</label>
              <input type="text" name="email3" 
                     id="email3" class="fn2">
              <label class="error" for="email3" id="e3_error">
                This field is required.</label>
            </p>
            <p class="play04">
              <label for="play4" class="label2">Player 4:</label>
              <input type="text" name="play4" 
                     id="play4" class="fn1">
              <label class="error" for="play4" id="p4_error">
                This field is required.</label>
              <label for="email4" class="label2">Player 4 Email:</label>
              <input type="text" name="email4" 
                     id="email4" class="fn2">
              <label class="error" for="email4" id="e4_error">
                This field is required.</label>
            </p>
            <p class="play05">
              <label for="play5" class="label2">Player 5:</label>
              <input type="text" name="play5" 
                     id="play5" class="fn1">
              <label class="error" for="play5" id="p5_error">
                This field is required.</label>
              <label for="email5" class="label2">Player 5 Email:</label>
              <input type="text" name="email5" 
                     id="email5" class="fn2">
              <label class="error" for="email5" id="e5_error">
                This field is required.</label>
            </p>
          </fieldset>
          <p id="privatecount"> 
            Check the private company to be removed from each group below.
          </p>
          <fieldset id="privates1">
            <legend>Private Company Group 1</legend>
            <label class="container">Lake Shore Line
              <input type="checkbox" class="boxes" value="Lake Shore Line">
              <span class="checkmark"></span>
            </label>
            <label class="container">Michigan Central
              <input type="checkbox" class="boxes" value="Michigan Central">
              <span class="checkmark"></span>
            </label>
            <label class="container">Ohio and Indiana
              <input type="checkbox" class="boxes" value="Ohio and Indiana">
              <span class="checkmark"></span>
            </label>
          </fieldset>
          <br>
          <fieldset id="privates2">
            <legend>Private Company Group 2</legend>
            <label class="container">Meat Packing Co.
              <input type="checkbox" class="boxes" value="Meat Packing Co.">
              <span class="checkmark"></span>
            </label>
            <label class="container">Steamboat Co.
              <input type="checkbox" class="boxes" value="Steamboat Co.">
              <span class="checkmark"></span>
            </label>
            <label class="container">Tunnel Blasting Co.
              <input type="checkbox" class="boxes" value="Tunnel Blasting Co.">
              <span class="checkmark"></span>
            </label>
          </fieldset>
          <br>
          <fieldset>
            <input type="submit" name="pwbutton" class="pwbutton" 
                 id="button1" value="Process Form" >
            <input type="button" name="canbutton" class="pwbutton"  
                 id="button2" value="Exit" >
          </fieldset>
        </form>
      </div>  
    </div>  

  </body>
</html>

