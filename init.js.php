<?php
header('Content-type: text/javascript; charset=utf-8');
if (!isset($_GET['url'])) die('URL must be supplied');
$url = $_GET['url'];
if (!preg_match('!^https?://!i', $url)) {
	$url = 'http://'.$url;
}
if (filter_var($url, FILTER_VALIDATE_URL) === false) {
	die('Invalid URL: '.htmlspecialchars($url));
}
$host = parse_url($url, PHP_URL_HOST);
if (strtolower(substr($host, 0, 4)) === 'www.') $host = substr($host, 4);

////////////////////////////////
// Base URL
////////////////////////////////
$_host = $_SERVER['HTTP_HOST'];
$_path = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/\\');
$base = 'http://'.htmlspecialchars($_host.$_path);
?>

$(function(){
	window.ffurl = "<?php echo $url; ?>"; 
	window.ffhost = "<?php echo $host; ?>";
	window.ffbase = "<?php echo $base; ?>";
	$("a").on("click", function(e) {return false;}); // prevents a elements from being selected..
	var myExampleClickHandler = function (element) { 
		console.log("Clicked element:", element); 
	}
	var myDomOutline = DomOutline({ namespace: "FFSelector", onClick: myExampleClickHandler, filter: false});
	window.ffdomoutline = myDomOutline;
	myDomOutline.start();
});