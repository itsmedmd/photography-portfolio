const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const bucketName = "www.deimantasbutenas.lt";

exports.handler = async (event) => {
    // get all keys
    const allKeys = await getAllKeys({
        Bucket: bucketName,
        Prefix: 'images/'
    });
    
    // get all gallery names
    let gallerySet = new Set();
    allKeys.forEach(key => {
      let splitUp = key.split("/");
      gallerySet.add(splitUp[1]);
    });
    gallerySet = Array.from(gallerySet);
    
    // create html file that displays all image galleries
    const allGalleriesPageContent = createAllGalleriesPageContent(allKeys, gallerySet);
    await postHTMLFile("galleries/index.html", allGalleriesPageContent);
    
    // create html files for each image gallery
    for(let i = 0; i < gallerySet.length; i++) {
      const bigIMG = sortItems(filterByFolder(allKeys, gallerySet[i], "compressed-big"));
      const smallIMG = sortItems(filterByFolder(allKeys, gallerySet[i], "compressed-small"));
      const thumbnails = sortItems(filterByFolder(allKeys, gallerySet[i], "thumbnails"));
      const galleryPageContent = createSingleGalleryPageContent(bigIMG, smallIMG, thumbnails, gallerySet[i]);
      await postHTMLFile(`galleries/${i + 1}/index.html`, galleryPageContent);
    };
    
    return {};
};

function sortItems(items, result = []) {
  const numbers = [];
  items.forEach((item, id) => {
    let splitUp = item.split("img");
    splitUp = splitUp[1].split("-");
    numbers.push(splitUp[0]);
  });
  numbers.sort((a, b) => a - b);
  
  numbers.forEach(number => {
    items.forEach(item => {
      const splitUp = item.split("img");
      if(parseInt(splitUp[1]) === parseInt(number))
        result.push(item);
    });
  });
  return result;
}

function filterByFolder(allKeys, galleryName, folderName, result = []) {
  allKeys.forEach(key => {
    let splitUp = key.split("/");
    if(splitUp[1] === galleryName && splitUp[2] === folderName)
      result.push(splitUp[3]);
  });
  return result;
}

function getGalleryIMG(allKeys, galleryName, result = "") {
  allKeys.forEach(key => {
    let splitUp = key.split("/");
    if(splitUp[1] === galleryName) {
      splitUp = splitUp[2].split(".");
      if(splitUp[0] === "gallery-img") {
        splitUp = key.split("images/");
        result = splitUp[1];
      }
    }
  });
  return result;
}

async function getAllKeys(params,  allKeys = []){
  const response = await s3.listObjectsV2(params).promise();
  response.Contents.forEach(obj => allKeys.push(obj.Key));

  if (response.NextContinuationToken) {
    params.ContinuationToken = response.NextContinuationToken;
    await getAllKeys(params, allKeys); // Recursive call
  }
  
  return allKeys;
}

async function deleteFromPath(path) {
  await s3.deleteObject({
      Bucket: bucketName,
      Key: path
    }).promise();
}

async function postHTMLFile(path, pageContent) {
await s3.upload({
      Bucket: bucketName,
      Key: path,
      ContentType: 'text/html',
      Body: pageContent
    }).promise();
}

function createSingleGalleryPageContent(bigIMG, smallIMG, thumbnails, galleryName) {
  const smallIMGRender = [];
  smallIMG.forEach((img, index) => {
    smallIMGRender.push(`<div class="box cursor" onclick="openModal();currentSlide(${index + 1})"><div class="hover-overlay"></div><img class="lazyload" src="../../images/${galleryName}/blurry/${img}" data-src="../../images/${galleryName}/compressed-small/${img}"/></div>`);
  });
  
  const bigIMGRender = [];
  bigIMG.forEach((img, index) => {
    bigIMGRender.push(`
      <div class="mySlides cursor">
        <div onclick="plusSlides(-1)" class="image-overlay-left"></div>
        <div onclick="plusSlides(1)" class="image-overlay-right"></div>
        <img class="lazyload" data-src="../../images/${galleryName}/compressed-big/${img}">
      </div>`)
  });
  
  const thumbnailsRender = [];
  thumbnails.forEach((img, index) => {
    thumbnailsRender.push(`<div class="column"><img class="lightbox-thumbnail lazyload cursor" data-src="../../images/${galleryName}/thumbnails/${img}" onclick="currentSlide(${index + 1})"></div>`)
  });
  
  return `
    <!DOCTYPE html>
    <html lang="lt">
      <head>
        <!-- Global site tag (gtag.js) - Google Analytics -->
    
        <meta charset="utf-8" />
        <link rel="icon" href="favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#000000" />
        <meta name="description" content="test site"/>
        <meta name="title" content="Dmd test">
        <meta name="author" content="name, email@aaa.com">
        <meta name="subject" content="Photography">
        <meta name="url" content="http://www.deimantasbutenas.lt">
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        
        <!--<link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />-->
    
        <link rel="stylesheet" type="text/css" href="../../styles/global-style.css" media="screen">
        <link rel="stylesheet" type="text/css" href="../../styles/photo-gallery-style.css" media="screen">
        <link rel="stylesheet" type="text/css" href="../../styles/lightbox-slides-style.css" media="screen">
        <link href="https://fonts.googleapis.com/css2?family=Inconsolata:wght@400;500;600;700&family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet">
    
        <title>Dmd</title>
      </head>
      <body>
        <div id="fb-root"></div>
        <script async defer crossorigin="anonymous" src="https://connect.facebook.net/en_GB/sdk.js#xfbml=1&version=v7.0"></script>
        <script src="../../scripts/lightbox-modal-script.js"></script>
        
        <header>
          <h1><a href="http://deimantasbutenas.lt/">testas</a></h1>
          <div class="mobile-navigation-bar" onclick="toggleMobileNavigation()">
            <div></div>
            <div></div>
            <div></div>
          </div>
          <nav id="top-navigation">
            <ul class="navigation">
              <li>
                  <a href="http://deimantasbutenas.lt/galleries/">Photo Gallery</a>
                  <span class="nav-dot"></span>
              </li>
              <li>
                  <a href="http://deimantasbutenas.lt/videos/">Video gallery</a>
                  <span class="nav-dot"></span>
              </li>
              <li>
                  <a href="#">Prices</a>
                  <span class="nav-dot"></span>
              </li>
              <li>
                  <a href="#">About</a>
                  <span class="nav-dot"></span>
              </li>
              <li>
                  <a href="#">Contact</a>
              </li>
            </ul>
          </nav>
          <div id="top-social-media-icons" class="social-media-icons">
              <ul>
                  <li>
                    <a href="http://facebook.com/" target="_blank" class="fb-icon">             
                      <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 -150 1000 1000"><path fill="currentColor" d="M570.5 310h144l-17 159h-127v460h-190V469h-95V310h95v-95c0-68 16-119.3 48-154s84.7-52 158-52h126v158h-79c-14.7 0-26.3 1.3-35 4s-15 7-19 13-6.3 12.3-7 19-1.3 16-2 28v79z"></path></svg>
                    </a>
                  </li>
                  <li>
                    <div class="fb-like" data-href="https://www.facebook.com/security" data-width="" data-layout="button_count" data-action="like" data-size="small" data-share="false"></div>
                  </li>
              </ul>
          </div>
        </header>
    
        <main>
            <div class="page-content">
                <!-- Compressed images on page used to open the lightbox -->
                <div class="container">
                    ${smallIMGRender.join("")}
                </div>
        
                <!-- The Modal/Lightbox -->
                <div id="myModal" class="modal">
                    <!-- Control button for closing the modal(slides) -->
                    <button type="button" class="close cursor" onclick="closeModal()">&times;</button>
                
                    <!-- High quality images -->
                    ${bigIMGRender.join("")}
                
                    <!-- Next/previous image controls -->
                    <button type="button" class="prev cursor" onclick="plusSlides(-1)">
                      <svg width="22" height="42" viewBox="0 0 22 42" xmlns="http://www.w3.org/2000/svg"><path d="M2.615 21L21.708 1.907c.39-.39.39-1.023 0-1.413-.394-.393-1.024-.39-1.414 0l-19.8 19.8C.297 20.49.2 20.744.2 21c0 .257.098.51.293.706l19.8 19.8c.39.39 1.024.39 1.414 0 .393-.393.39-1.023 0-1.413L2.616 21z" fill-rule="evenodd"/></svg>
                    </button>
    
                    <button type="button" class="next cursor" onclick="plusSlides(1)">
                      <svg width="22" height="42" viewBox="0 0 22 42" xmlns="http://www.w3.org/2000/svg"><path d="M19.385 21L.292 40.093c-.39.39-.39 1.023 0 1.413.394.393 1.024.39 1.414 0l19.8-19.8c.196-.195.293-.45.293-.705 0-.257-.098-.51-.293-.706L1.707.494C1.316.103.682.103.292.493c-.393.393-.39 1.023 0 1.413L19.384 21z" fill-rule="evenodd"/></svg>
                    </button>
                
                    <!-- Thumbnail images -->
                    <div class="scrolling-thumbnail-row">
                      ${thumbnailsRender.join("")}
                    </div>
                </div>
            </div>
        </main>
    
        <footer>
          <div class="footer-content">
            <span>&#169;</span>
            <p>Deimantas Butėnas</p>
          </div>
        </footer>
    
        <script src="https://cdn.jsdelivr.net/npm/vanilla-lazyload@16.1.0/dist/lazyload.min.js"></script>
        <script src="../../scripts/lazyload.js"></script>
        <script src="../../scripts/toggle-mobile-navigation.js"></script>
      </body>
    </html>
  `;
}

function createAllGalleriesPageContent(allKeys, gallerySet) {
  const toRender = [];
  gallerySet.forEach((galleryName, index) => {
    const galleryIMG = getGalleryIMG(allKeys, gallerySet[index]);
    toRender.push(`
      <div class="box">
        <div class="hover-overlay"></div>
        <h2>${galleryName}</h2>
        <img src="../images/${galleryIMG}"/>
      </div>
    `)
  });
  
  return `
    <!DOCTYPE html>
    <html lang="lt">
      <head>
        <!-- Global site tag (gtag.js) - Google Analytics -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=UA-154076276-2"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
        
          gtag('config', 'UA-154076276-2');
        </script>

    
        <meta charset="utf-8" />
        <link rel="icon" href="../favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#000000" />
        <meta name="description" content="test site"/>
        <meta name="title" content="Dmd test">
        <meta name="author" content="name, email@aaa.com">
        <meta name="subject" content="Photography">
        <meta name="url" content="http://www.deimantasbutenas.lt/galleries/">
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        
        <!--<link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />-->
        <!--
          manifest.json provides metadata used when your web app is installed on a
          user's mobile device or desktop. See https://developers.google.com/web/fundamentals/web-app-manifest/
        -->
        <!--<link rel="manifest" href="%PUBLIC_URL%/manifest.json" />-->
    
        <link rel="stylesheet" type="text/css" href="../styles/global-style.css" media="screen">
        <link rel="stylesheet" type="text/css" href="../styles/photo-gallery-style.css" media="screen">
        <link href="https://fonts.googleapis.com/css2?family=Inconsolata:wght@400;500;600;700&family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet">
        
        <title>Galleries - Dmd</title>
      </head>
      <body>
        <script src="../scripts/lightbox-modal-script.js"></script>
        <div id="fb-root"></div>
        <script async defer crossorigin="anonymous" src="https://connect.facebook.net/en_GB/sdk.js#xfbml=1&version=v7.0"></script>
    
      <header>
        <h1><a href="http://deimantasbutenas.lt/">testas</a></h1>
        <div class="mobile-navigation-bar" onclick="toggleMobileNavigation()">
          <div></div>
          <div></div>
          <div></div>
        </div>
        <nav id="top-navigation">
          <ul class="navigation">
            <li>
                <a href="http://deimantasbutenas.lt/galleries/">Photo Gallery</a>
                <span class="nav-dot"></span>
            </li>
            <li>
                <a href="http://deimantasbutenas.lt/videos/">Video gallery</a>
                <span class="nav-dot"></span>
            </li>
            <li>
                <a href="#">Prices</a>
                <span class="nav-dot"></span>
            </li>
            <li>
                <a href="#">About</a>
                <span class="nav-dot"></span>
            </li>
            <li>
                <a href="#">Contact</a>
            </li>
          </ul>
        </nav>
        <div id="top-social-media-icons" class="social-media-icons">
            <ul>
                <li>
                  <a href="http://facebook.com/" target="_blank" class="fb-icon">             
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 -150 1000 1000"><path fill="currentColor" d="M570.5 310h144l-17 159h-127v460h-190V469h-95V310h95v-95c0-68 16-119.3 48-154s84.7-52 158-52h126v158h-79c-14.7 0-26.3 1.3-35 4s-15 7-19 13-6.3 12.3-7 19-1.3 16-2 28v79z"></path></svg>
                  </a>
                </li>
                <li>
                  <div class="fb-like" data-href="https://www.facebook.com/security" data-width="" data-layout="button_count" data-action="like" data-size="small" data-share="false"></div>
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
            <span>&#169;</span>
            <p>Deimantas Butėnas</p>
          </div>
        </footer>
    
        <script src="../scripts/add-redirect-to-galleries.js"></script>
        <script src="../scripts/toggle-mobile-navigation.js"></script>
      </body>
    </html>
  `;
}