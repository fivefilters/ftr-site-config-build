<?php
mb_internal_encoding('UTF-8');

////////////////////////////////
// Content security headers
////////////////////////////////
//header("Content-Security-Policy: script-src 'self'; connect-src 'none'; font-src 'none'; style-src 'self'");
header("Content-Security-Policy: script-src 'self'; connect-src 'none';");
header('X-Robots-Tag: noindex, nofollow');

//////////////////////////////
// URL
//////////////////////////////
if (!isset($_GET['url'])) die('URL must be supplied');
$url = $_GET['url'];
if (!preg_match('!^https?://!i', $url)) {
	$url = 'http://'.$url;
}
if (filter_var($url, FILTER_VALIDATE_URL) === false) {
	die('Invalid URL: '.htmlspecialchars($url));
}

//TODO: cleanup URL


////////////////////////////////
// Base URL
////////////////////////////////
$_host = $_SERVER['HTTP_HOST'];
$_path = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/\\');
$base = 'http://'.htmlspecialchars($_host.$_path);

//TODO: use HubmleHTTPAgent

require_once 'lib/simplepie/autoloader.php';
require_once 'lib/humble-http-agent/HumbleHttpAgent.php';
require_once 'lib/humble-http-agent/CookieJar.php';
$html = '';
$_req_options = null;
$http = new HumbleHttpAgent($_req_options);
//$http->debug = true;	
if (($response = $http->get($url, true)) && ($response['status_code'] < 300)) {
	$html = $response['body'];
	//$html = convert_to_utf8($html, $response['headers']);
	//$html = mb_convert_encoding($html, 'HTML-ENTITIES', "UTF-8");
} else {
	die('Failed to fetch URL');
}
if (trim($html) == '') die('Empty response :(');

// use Tidy?
if (isset($_GET['tidy']) && $_GET['tidy'] === '1') {
	if (!function_exists('tidy_parse_string')) die('Tidy requested but not available on server.');
	$tidy_config = array(
				 'clean' => true,
				 'output-xhtml' => true,
				 'logical-emphasis' => true,
				 'show-body-only' => false,
				 'new-blocklevel-tags' => 'article, aside, footer, header, hgroup, menu, nav, section, details, datagrid',
				 'new-inline-tags' => 'mark, time, meter, progress, data',
				 'wrap' => 0,
				 'drop-empty-paras' => true,
				 'drop-proprietary-attributes' => false,
				 'enclose-text' => true,
				 'enclose-block-text' => true,
				 'merge-divs' => true,
				 'merge-spans' => true,
				 'char-encoding' => 'utf8',
				 'hide-comments' => true
				 );
	$tidy = tidy_parse_string($html, $tidy_config, 'UTF8');
	if (tidy_clean_repair($tidy)) {
		$original_html = $html;
		$html = $tidy->value;
	}
}

//TODO: use HTML5 parser?

//TODO: escape $url for insering in JS variable
$js_inject = '
<!--ff-script-->
<script src="'.$base.'/js/jquery-latest.min.js"></script>
<!--script src="'.$base.'/js/toolbox.expose.js"></script-->
<script src="'.$base.'/js/css2xpath.js"></script>
<script src="'.$base.'/js/jquery.dom-outline-1.0.js"></script>
<script src="'.$base.'/init.js.php?url='.urlencode($url).'"></script>
<!--/ff-script-->
';

$html = str_ireplace('</body>', $js_inject.'</body>', $html);

$css_inject = '
<!--ff-css-->
<!--/ff-css-->
';

//$html = str_ireplace('</head>', $css_inject.'</head>', $html);

echo $html;