<!doctype html>

<html lang="en">
<head>
  <meta charset="utf-8">
  <style>
    body {
      background-color: #222;
      color: #ddd;
      font-size: 1em;
      text-align: center;
      font-family: sans-serif;
    }
    a, a:link, a:visited, a:hover, a:active {
      color: #fff;
    }
    .toast-message {
      font-size: 12px;
      font-weight: bold;
    }
  </style>
<link href="css/toastr.min.css" rel="stylesheet" />
<script src="js/jquery-latest.min.js"></script>
<script src="js/toastr.min.js"></script>
<script>
$(function() {
  $('#disable-css').on('click', function() {
    $('link[rel~="stylesheet"]', window.parent.document).prop('disabled', true);
    window.parent.ffdomoutline.element = window.parent.ffdomoutline.selected;
    window.parent.ffdomoutline.updateOutlinePosition('click');
    $('#disable-css').hide(); $('#enable-css').show();
    return false;
  });
  $('#enable-css').on('click', function() {
    console.log(window.parent.ffdomoutline.element);
    $('link[rel~="stylesheet"]', window.parent.document).prop('disabled', false);
    window.parent.ffdomoutline.element = window.parent.ffdomoutline.selected;
    window.parent.ffdomoutline.updateOutlinePosition('click');
    $('#enable-css').hide(); $('#disable-css').show();
    return false;
  });
});
</script>
</head>
<body>
  <div id='infobox'>
    <form style='padding-top: 5px; padding-bottom: 10px;' onsubmit="return false;">
    <span style="padding-left:8px;">CSS&nbsp;&nbsp;</span><input type='text' id="path_css" name='css' placeholder='' readonly style='width: 500px; padding: 4px;' /><br />
    <span>XPath&nbsp;&nbsp;</span><input type='text' id="path_xpath" name='url' placeholder='' readonly style='width: 500px; padding: 4px;' />
    </form>
    <!--<strong>XPath</strong>: <span id='path_xpath'></span><br />-->
    <strong><a id='ftr-download' href='#'>Download Full-Text RSS site config</a></strong> 
    &bullet; <a href="" id="disable-css">Disable CSS</a><a href="" id="enable-css" style="display: none">Enable CSS</a>
    &bullet; <a href="index.php" target="_parent">Home</a> 
  </div>
</body>
</html>