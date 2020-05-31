const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const bucketName = "www.deimantasbutenas.lt";

exports.handler = async (event) => {
    const allKeys = await getAllKeys({
        Bucket: bucketName,
        Prefix: 'images/'
    });
    
    let gallerySet = new Set();
    allKeys.forEach(key => {
      let splitUp = key.split("/");
      gallerySet.add(splitUp[1]);
    });
    gallerySet = Array.from(gallerySet);
    
    let bigIMG = sortItems(filterByFolder(allKeys, gallerySet[0], "compressed-big"));
    let smallIMG = sortItems(filterByFolder(allKeys, gallerySet[0], "compressed-small"));
    let thumbnails = sortItems(filterByFolder(allKeys, gallerySet[0], "thumbnails"));

    const htmlContent = createHTMLContent(bigIMG, smallIMG, thumbnails, gallerySet[0]);
    await createHTMLFile("index.html", htmlContent);
    
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

async function getAllKeys(params,  allKeys = []){
  const response = await s3.listObjectsV2(params).promise();
  response.Contents.forEach(obj => allKeys.push(obj.Key));

  if (response.NextContinuationToken) {
    params.ContinuationToken = response.NextContinuationToken;
    await getAllKeys(params, allKeys); // RECURSIVE CALL
  }
  
  return allKeys;
}

async function deleteFile(fileToDeleteName) {
  await s3.deleteObject({
      Bucket: bucketName,
      Key: fileToDeleteName
    }).promise();
}

async function createHTMLFile(fileToCreateName, pageContent) {
await s3.upload({
      Bucket: bucketName,
      Key: fileToCreateName,
      ContentType: 'text/html',
      Body: pageContent
    }).promise();
}

function createHTMLContent(bigIMG, smallIMG, thumbnails, galleryName) {
  let smallIMGRender = [];
  smallIMG.forEach((img, index) => {
    //console.log(img);
    smallIMGRender.push(`<div class="box" onclick="openModal();currentSlide(${index + 1})"><div class="hover-overlay"></div><img src="images/${galleryName}/compressed-small/${img}"/></div>`)
  });
  
  let bigIMGRender = [];
  bigIMG.forEach((img, index) => {
    bigIMGRender.push(`<div class="mySlides"><img class="lazyload" data-src="images/${galleryName}/compressed-big/${img}"></div>`)
  });
  
  let thumbnailsRender = [];
  thumbnails.forEach((img, index) => {
    thumbnailsRender.push(`<div class="column"><img class="lightbox-thumbnail lazyload" data-src="images/${galleryName}/thumbnails/${img}" onclick="currentSlide(${index + 1})"></div>`)
  });
  
  console.log()
  const content = `
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
          <!--
            manifest.json provides metadata used when your web app is installed on a
            user's mobile device or desktop. See https://developers.google.com/web/fundamentals/web-app-manifest/
          -->
          <!--<link rel="manifest" href="%PUBLIC_URL%/manifest.json" />-->
          
      
          <link rel="stylesheet" type="text/css" href="styles/global-style.css" media="screen">
          <link rel="stylesheet" type="text/css" href="styles/photo-gallery-style.css" media="screen">
          <link rel="stylesheet" type="text/css" href="styles/lightbox-slides-style.css" media="screen">
          
          <!--<script src="masonry.pkgd.min.js"></script>-->
      
          <title>Dmd test</title>
        </head>
        <body>
          <script src="scripts/js/lightbox-modal-script.js"></script>
      
          <header>
              <h1>test</h1>
              <nav></nav>
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
              <p>footer</p>
          </footer>
      
          <script src="https://cdn.jsdelivr.net/npm/vanilla-lazyload@16.1.0/dist/lazyload.min.js"></script>
          <script src="scripts/js/lazyload.js"></script>
        </body>
      </html>
  `;
  return content;
}