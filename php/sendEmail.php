<?php
/*
 * The sendEmail() function uses SMTP to send plain text emails. 
 * Use configMail.php to specify the server and server access
 * information. And also the MAIL_SENDER field for the specification
 * of reply direction. You should use the SMTP server provided by your
 * ISP or your hosting service for these Emails. 
 * 
 * Input consists the following parameters:
 *   login
 *   subject
 *   body
 * 
 * Output is the echo return status of "success" or "fail".
 *
 * Copyright (c) 2015 Richard E. Price under the The MIT License.
 * A copy of this license can be found in the LICENSE.text file.
 * 
 * Modified for D1846 by Rich Price in March 2020.
 */

require_once( 'class.phpmailer.php');
require_once('configMail.php');


function sendEmail($email, $subject, $body) {
  $mailObj = new PHPMailer;

  $mailObj->isSMTP();             // Set mailer to use SMTP.
  $mailObj->Host = MAIL_HOST;     // Specify the SMTP server.
  $mailObj->Port = MAIL_PORT;     // Specify port. Use 587 for STARTTLS.
  $mailObj->SMTPAuth = true;      // Enable SMTP authentication
  if (constant("MAIL_TLS") == 'Yes') { // Is TLS required by the SMTP server?
    $mailObj->SMTPSecure = 'tls';
  }
  $mailObj->Username = MAIL_USER; // SMTP username.
  $mailObj->Password = MAIL_PASS; // SMTP password.
  // All replys will be sent to MAIL_SENDER.
  $mailObj->setFrom(MAIL_SENDER,'DRAFT1846');
  error_log('address: ' . $email);
  $mailObj->addAddress($email);   // Add a recipient

  $mailObj->WordWrap = 70;        // Set word wrap to 70 characters.
  $mailObj->isHTML(true);         // Set email format to HTML.

  $mailObj->Subject = $subject;
  $mailObj->Body = $body;
  $mailObj->Debugoutput = "error_log";
  // error_log( print_r( $mailObj, true ) ); // for debugging only
  if ($mailObj->send()) {
    echo 'success';
  } else {
    error_log('Mailer Error: ' . $mailObj->ErrorInfo);
    echo 'fail';
  }
}
