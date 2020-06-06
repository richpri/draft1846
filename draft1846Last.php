<?php

/* 
 * The draft1846Last page is called from an email generated by
 * a previous iteration of draft1846Last or by draft1846Next.  
 * This page handles the special case when only one private
 * And no blank cards are left in the deck/hand. If the active
 * player takes the private the draft is over. If not then it
 * sends an email to the next player for him to take his turn.
 * 
 * This page's URL should contain a urlkey parameter. This is
 * a 12 character pseudo random string that begins with the
 * draftid and the playerid. 
 * 
 * For backwards compatibility it can, for now, also contain  
 * these two values as seperate integer parameters:
 *      draftid
 *      playerid
 * 
 * Copyright (c) 2020 Richard E. Price under the The MIT License.
 * A copy of this license can be found in the LICENSE.text file.
 */

$urlkey = filter_input(INPUT_GET, 'urlkey',FILTER_SANITIZE_STRING); 
$draftid  = intval(substr($urlkey,0,4));
$playerid  = intval(substr($urlkey,4,1));

?>
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>DRAFT1846 - Private Company Draft Tool For 1846 Games</title>
    <link rel="shortcut icon" href="images/favicon.ico" >
    <link rel="stylesheet" href="style/draft1846Com.css" />
    <link rel="stylesheet" href="style/draft1846Last.css" />
    <script type="text/javascript" src="scripts/jquery.js">
    </script> 
    <script type="text/javascript" src="scripts/draft1846Com.js">
    </script>
    <script type="text/javascript" src="scripts/draft1846Config.js">
    </script>
    <script type="text/javascript" src="scripts/draft1846Last.js">
    </script>
    <script>
      $(function() {
        D1846.errtxt = "";
        D1846.input = [];
        D1846.input.draftid = parseInt(<?php echo "$draftid"; ?>);
        D1846.input.playerid = parseInt(<?php echo "$playerid"; ?>);
        $('#did').append(D1846.input.draftid).append('.');
        var cString = "draftid=" + D1846.input.draftid;
        $.post("php/getDraft.php", cString, getDraftResult);

        $("#buttonc1").click(function(){
          window.location.assign("draft1846Goodby.html?msgtype=0");
          return false;          
        }); // end buttonc1 click 
        $("#buttonc2").click(function(){
          window.location.assign("draft1846Goodby.html?msgtype=0");
          return false;          
        }); // end buttonc2 click 
        $("#buttonc3").click(function(){
          window.location.assign("draft1846Goodby.html?msgtype=0");
          return false;          
        }); // end buttonc3 click 
        $("#buttonc4").click(function(){
          window.location.assign("draft1846Goodby.html?msgtype=0");
          return false;          
        }); // end buttonc4 click 
        
        
        $("#button1").click(function(){
          processLastSelection();
          return false;          
        }); // end button1 click
        $("#button2").click(function(){
          processPass();
          return false;          
        }); // end button2 click  
        $("#button3").click(function(){
          processLastSelection();
          return false;          
        }); // end button3 click
        $("#button4").click(function(){
          var tryagain = 'draft1846Last.php?draftid=';
          tryagain += D1846.input.draftid + '&playerid=';
          tryagain += D1846.input.playerid;
          window.location.assign(tryagain);
          return false;          
        }); // end button4 click
        $("#button5").click(function(){
          window.location.assign("draft1846Goodby.html?msgtype=0");
          return false;          
        }); // end button5 click 
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
        <div id="toptext">
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
        <div id="lastform" class="allforms">
          <form name="form1" action="" >
            <input type="button" name="button1" class="pwbutton" 
                   id="button1" value="Buy" >
            <input type="button" name="button2" class="pwbutton" 
                   id="button2" value="Pass" >
            <input type="button" name="buttonc1" class="pwbutton" 
                   id="buttonc1" value="Cancel" >
          </form>
        </div>
        <div id="zeroform" class="allforms">
          <form name="form2" action="" >
            <input type="button" name="button3" class="pwbutton" 
                   id="button3" value="Enter" >
            <input type="button" name="buttonc2" class="pwbutton" 
                   id="buttonc2" value="Cancel" >
          </form>
        </div>
        <div id="canform" class="allforms">
          <form name="form3" action="" >
            <input type="button" name="buttonc3" class="pwbutton" 
                   id="buttonc3" value="Exit" >
          </form>
        </div>        
        <div id="collform" class="allforms"><p id="collp">
          Your update collided with another player's update.<br>
          Try again. If you get this message repeatedly then 
          contact the DRAFT1846 webmaster<br><br></p>
          <form name="form4" action="" >
            <input type="button" name="button4" class="pwbutton" 
                   id="button4" value="Retry" >
            <input type="button" name="buttonc4" class="pwbutton" 
                   id="buttonc4" value="Cancel" >
          </form>
        </div>
        <div id="doneform" class="allforms">
          <form name="form5" action="" >
            <input type="button" name="button5" class="pwbutton" 
                   id="button5" value="exit" >
          </form>
        </div>    

      </div>  
    </div>  

  </body>
</html>


