const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const bucketName = "www.deimantasbutenas.lt";

exports.handler = async (event) => {
    const lines = [];
    const source = await getMyObject();
    const allLines = source.Body.toString().split('\n');
    allLines.forEach(line => lines.push(line));
    await postHTMLFile("videos/index.html", createVideosPageContent(lines));
    
    return {};
};

async function getMyObject() {
  return new Promise(function(resolve, reject) {
      s3.getObject(
          { Bucket: bucketName, Key: 'videos/source.txt' },
          function (error, data) {
              if(error) reject(error);
              else      resolve(data);
          }
    )})
}

async function postHTMLFile(path, pageContent) {
  await s3.upload({
        Bucket: bucketName,
        Key: path,
        ContentType: 'text/html',
        Body: pageContent
      }).promise();
}

function createVideosPageContent(lines) {
  const toRender = [];
  const videoURLs = [];
  lines.forEach((line, index) => {
    const splitUp = line.split(';');
    const videoTitle = splitUp[0].trim();
    const videoURL = splitUp[1].trim().replace('watch?v=', 'embed/') + '?controls=1&rel=0';
    videoURLs.push(`"${videoURL}"`);
    toRender.push(`
      <div class="box">
          <div class="box-title">
              <p>${videoTitle}</p>
          </div>
          <div class="iframe-container">
              <iframe class="responsive-iframe lazyload" allowfullscreen src="about:blank"></iframe>
          </div>
      </div>
    `);
  });
  
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <!-- Global site tag (gtag.js) - Google Analytics -->
    
        <meta charset="utf-8" />
        <link rel="icon" href="../favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#000000" />
        <meta name="description" content="Videos page"/>
        <meta name="title" content="Videos - DMD">
        <meta name="author" content="Deimantas Butėnas, email@aaa.com">
        <meta name="subject" content="Video gallery">
        <meta name="url" content="https://www.deimantasbutenas.lt/videos/">
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        
        <!--<link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />-->
        <!--
          manifest.json provides metadata used when your web app is installed on a
          user's mobile device or desktop. See https://developers.google.com/web/fundamentals/web-app-manifest/
        -->
        <!--<link rel="manifest" href="%PUBLIC_URL%/manifest.json" />-->
    
        <link rel="stylesheet" type="text/css" href="../styles/video-gallery-style.css" media="screen">
        <link rel="stylesheet" type="text/css" href="../styles/global-style.css" media="screen">
        <link href="https://fonts.googleapis.com/css2?family=Inconsolata:wght@400;500;600;700&family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet">
        
        <title>Videos - DMD</title>
      </head>
      <body>
        <div id="fb-root"></div>
        <script async defer crossorigin="anonymous" src="https://connect.facebook.net/en_GB/sdk.js#xfbml=1&version=v7.0"></script>
        
        <header>
            <a href="https://deimantasbutenas.lt/" class="page-logo">
                <img src="../logo.png" alt="Page logo" title="Go to home page" class="page-logo">
            </a>
            <div class="mobile-navigation-bar noSelect" onclick="toggleMobileNavigation()">
                <div></div>
                <div></div>
                <div></div>
            </div>
            <nav id="top-navigation">
                <ul class="navigation">
                  <li>
                      <a href="https://deimantasbutenas.lt/galleries/" title="Go to galleries page">Photo Gallery</a>
                      <span class="nav-dot"></span>
                  </li>
                  <li>
                      <a href="https://deimantasbutenas.lt/videos/" title="Go to videos page">Video gallery</a>
                      <span class="nav-dot"></span>
                  </li>
                  <li>
                      <a href="https://deimantasbutenas.lt/about/" title="Go to about page">About</a>
                      <span class="nav-dot"></span>
                  </li>
                  <li>
                      <a href="https://deimantasbutenas.lt/contact/" title="Go to contact page">Contact</a>
                  </li>
                </ul>
            </nav>
            <div id="top-social-media-icons" class="social-media-icons">
              <ul>
                  <li>
                    <a href="https://facebook.com/" target="_blank" class="fb-icon">             
                      <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 -150 1000 1000"><path fill="currentColor" d="M570.5 310h144l-17 159h-127v460h-190V469h-95V310h95v-95c0-68 16-119.3 48-154s84.7-52 158-52h126v158h-79c-14.7 0-26.3 1.3-35 4s-15 7-19 13-6.3 12.3-7 19-1.3 16-2 28v79z"></path></svg>
                    </a>
                  </li>
                  <li class="fb-li-element" style="background: url(../fb-like-button.png);">
                    <div class="fb-like" data-href="https://developers.facebook.com/docs/plugins/" data-width="" data-layout="button_count" data-action="like" data-size="small" data-share="false"></div>
                  </li>
              </ul>
            </div>
        </header>
    
        <main>
            <div class="page-content">
                <div class="container">
                    ${toRender.join("")}
               </div>
            </div>
        </main>
    
        <footer>
            <div class="footer-content">
              <p>&#169;</p>
              <p>Deimantas Butėnas</p>
            </div>
        </footer>
    
        <script src="../scripts/observe-fb-like-button.js"></script>
        <script src="../scripts/toggle-mobile-navigation.js"></script>
        <script src="../scripts/lazyload-16-1-0.min.js"></script>
        <script src="../scripts/add-iframe-src.js"></script>
        <script>
            if(screen.availWidth <= 768) {
                addSrcToIframes([${videoURLs}]);
                addLazyloadScript('../scripts/lazyload.js');
            } else {
                // loads facebook like button before videos
                window.onload = function() {
                    addSrcToIframes([${videoURLs}]);
                    addLazyloadScript('../scripts/lazyload.js');
                };
            }
        </script>
      </body>
    </html>
  `;
}