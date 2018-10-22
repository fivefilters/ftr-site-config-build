<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <!-- Latest compiled and minified CSS -->
  <link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css">
  <title>Grab page</title>
  <meta name="description" content="Tool to help content extraction.">
  <meta name="author" content="FiveFilters.org">

  <style>
  /* Space out content a bit */
  body {
    padding-top: 20px;
    padding-bottom: 20px;
  }

  /* Everything but the jumbotron gets side spacing for mobile first views */
  .header,
  .marketing,
  .footer {
    padding-right: 15px;
    padding-left: 15px;
  }

  /* Custom page header */
  .header {
    border-bottom: 1px solid #e5e5e5;
  }
  /* Make the masthead heading the same height as the navigation */
  .header h3 {
    padding-bottom: 19px;
    margin-top: 0;
    margin-bottom: 0;
    line-height: 40px;
  }

  /* Custom page footer */
  .footer {
    padding-top: 19px;
    color: #777;
    border-top: 1px solid #e5e5e5;
  }

  /* Customize container */
  @media (min-width: 768px) {
    .container {
      max-width: 900px;
    }
  }
  .container-narrow > hr {
    margin: 30px 0;
  }

  /* Main marketing message and sign up button */
  .jumbotron {
    text-align: center;
    border-bottom: 1px solid #e5e5e5;
  }

  /* Supporting marketing content */
  .marketing {
    margin: 40px 0;
  }
  .marketing p + h4 {
    margin-top: 28px;
  }

  /* Responsive: Portrait tablets and up */
  @media screen and (min-width: 768px) {
    /* Remove the padding we set earlier */
    .header,
    .marketing,
    .footer {
      padding-right: 0;
      padding-left: 0;
    }
    /* Space out the masthead */
    .header {
      margin-bottom: 30px;
    }
    /* Remove the bottom border on the jumbotron for visual effect */
    .jumbotron {
      border-bottom: 0;
    }
  }
  </style>


</head>
<body>

  <div class="container">

    <div class="jumbotron">
      <h1>Site config builder</h1>
      <p class="lead">This is an experimental tool (work in progress) to help build site-specific <a href="https://help.fivefilters.org/full-text-rss/site-patterns.html">extraction rules</a> for <a href="http://fivefilters.org/content-only/">Full-Text RSS</a>.</p>
      <form method="GET" class="form-inline" action="grab.php">
        <div class="input-group">
          <input type="url" required class="form-control" name="url" placeholder="http://..." /> 
          <span class="input-group-btn"><input class="btn btn-primary" type="submit" value="Go" /></span>
        </div>
      </form>
    </div>  

    <div class="row marketing">
      <div class="col-lg-6">
        <h4>Getting started</h4>
        <ol>
          <li>Enter a URL to the article for which you'd like custom extraction rules applied.</li>
          <li>Select a block which appears to contain only the article content (or as close to it as possible).</li>
          <li>Click 'Download Full-Text RSS site config' to download a site config file for the site.</li>
          <li>Place the file inside your Full-Text RSS <tt>site_config/custom/</tt> folder.</li>
        </ol>
      </div>

      <div class="col-lg-6">
        <h4>Examples</h4>
        <ul>
          <li><a href="grab.php?url=<?php echo urlencode('medialens.org/index.php/alerts/alert-archive/2014/766-the-great-white-nope.html'); ?>">Medialens: The Great White 'Nope'</a></li>
          <li><a href="grab.php?url=<?php echo urlencode('chomsky.info/articles/20131105.htm'); ?>">Noam Chomsky: De-Americanizing the World</a></li>   
          <li><a href="grab.php?url=<?php echo urlencode('johnpilger.com/articles/break-the-silence-a-world-war-is-beckoning'); ?>">John Pilger: Break the silence</a></li>   
          <li><a href="grab.php?url=<?php echo urlencode('www.jonathan-cook.net/blog/2014-06-11/how-alain-de-botton-plays-safe-with-the-news/'); ?>">Jonathan Cook: How Alain de Botton plays safe with the news</a></li>
        </ul>
      </div>
    </div>

    <div class="footer">
      <p>&copy; <a href="http://fivefilters.org">FiveFilters.org</a> <?php echo date('Y'); ?></p>
    </div>

  </div> <!-- /container -->

</body>
</html>
