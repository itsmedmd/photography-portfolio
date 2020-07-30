const AWS = require('aws-sdk');
const sharp = require('sharp');
const s3 = new AWS.S3();
const bucketName = "www.deimantasbutenas.lt";

exports.handler = async (event) => {
    
    // get all keys
    let allKeys = await getAllKeys({
      Bucket: bucketName,
      Prefix: 'images/'
    });
    
    // get all gallery names
    let galleryNames = new Set();
    allKeys.forEach(key => {
      const splitUp = key.split("/");
      if(!splitUp[1].includes(".txt"))
        galleryNames.add(splitUp[1]);
    });
    galleryNames = [...galleryNames];
    galleryNames.sort((a, b) => a > b ? 1: -1);
    
    // compressing images here
    
    // delete and create files for each gallery
    const toDelete = [];
    const toUpload = [];
    
    for(const galleryName of galleryNames) {
      // create sets for finding differences
      const originalImages = new Set();
      const otherImages = new Set();
      
      allKeys.forEach(key => {
        const splitUp = key.split("/");
        
        if(splitUp[1] === galleryName && splitUp[2] === "original-images")
          originalImages.add(splitUp[3]);
          
        else if(splitUp[1] === galleryName && splitUp[2] === "thumbnails")
          otherImages.add(splitUp[3]);
      });
      
      // finds new deleted and uploaded files
      const newDeleted = [...new Set([...otherImages].filter(x => !originalImages.has(x)))];
      const newUploaded = [...new Set([...originalImages].filter(x => !otherImages.has(x)))];
      
      // creates an array of keys to delete
      newDeleted.forEach(item => {
        toDelete.push(
          {'Key': `images/${galleryName}/thumbnails/${item}`},
          {'Key': `images/${galleryName}/blurry/${item}`},
          {'Key': `images/${galleryName}/compressed-small/${item}`},
          {'Key': `images/${galleryName}/compressed-big/${item}`}
        );
      });
      
      // creates an array of keys to create/upload
      for(const item of newUploaded) {
        if(item !== '')
          toUpload.push(
            {
              Bucket: bucketName,
              Key: `images/${galleryName}/thumbnails/${item}`,
              Body: await resizeAndCompress(`images/${galleryName}/original-images/${item}`, 'thumbnails', 100, 70, 'fill'),
              ContentType: 'image'
            },
            {
              Bucket: bucketName,
              Key: `images/${galleryName}/blurry/${item}`,
              Body: await resizeAndCompress(`images/${galleryName}/original-images/${item}`, 'blurry', 400, 0, 'inside'),
              ContentType: 'image'
            },
            {
              Bucket: bucketName,
              Key: `images/${galleryName}/compressed-small/${item}`,
              Body: await resizeAndCompress(`images/${galleryName}/original-images/${item}`, 'compressed-small', 400, 0, 'inside'),
              ContentType: 'image'
            },
            {
              Bucket: bucketName,
              Key: `images/${galleryName}/compressed-big/${item}`,
              Body: await resizeAndCompress(`images/${galleryName}/original-images/${item}`, 'compressed-big', 1000, 0, 'inside'),
              ContentType: 'image'
            }
          );
      };
      
      // gallery-image upload (does it every time)
      await resizeCompressUploadGalleryImg("images/" + getGalleryIMG(allKeys, galleryName));
    }
    
    // deletes objects (files)
    if(toDelete.length !== 0)
      await deleteObjects(toDelete);
      
    // uploads objects (files)
    for(const object of toUpload) {
      await s3.putObject(object).promise();
    }
    
    // create html file that displays all image galleries
    const allGalleriesPageContent = createAllGalleriesPageContent(allKeys, galleryNames);
    await postHTMLFile("galleries/index.html", allGalleriesPageContent);
    
    // get all keys after new images are uploaded
    allKeys = await getAllKeys({
      Bucket: bucketName,
      Prefix: 'images/'
    });
    
    // create html files for each image gallery
    for(let i = 0; i < galleryNames.length; i++) {
      const bigIMG = sortItems(filterByFolder(allKeys, galleryNames[i], "compressed-big"));
      const smallIMG = sortItems(filterByFolder(allKeys, galleryNames[i], "compressed-small"));
      const thumbnails = sortItems(filterByFolder(allKeys, galleryNames[i], "thumbnails"));
      const galleryPageContent = createSingleGalleryPageContent(bigIMG, smallIMG, thumbnails, galleryNames[i]);
      await postHTMLFile(`galleries/${i + 1}/index.html`, galleryPageContent);
    };
    
    return {};
};

// sorts gallery images to display them in order in HTML
function sortItems(items, result = []) {
  const numbers = [];
  items.forEach((item, id) => {
    let splitUp = item.split("img");
    splitUp = splitUp[1].split("-");
    numbers.push(splitUp[0]);
  });
  
  numbers.sort((a, b) => parseInt(a) - parseInt(b));
  numbers.forEach(number => result.push(`img${number}`));
  
  // use this if you want to have any image name, for example: 'myImage5.jpg',
  // otherwise it must start with 'img', for example: 'img5.jpg'.
  // numbers.forEach(number =>
  //  items.forEach(item => {
  //    const splitUp = item.split("img");
  //    if(parseInt(splitUp[1]) === parseInt(number))
  //      result.push(item);
  //  });
  // }
    
  return result;
}

// filters key names just from the specified folder name
function filterByFolder(allKeys, galleryName, folderName, result = []) {
  allKeys.forEach(key => {
    let splitUp = key.split("/");
    if(splitUp[1] === galleryName && splitUp[2] === folderName)
      result.push(splitUp[3]);
  });
  return result;
}

// gets gallery-img path from an S3 bucket
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

// gets all keys from an S3 bucket
async function getAllKeys(params,  allKeys = []){
  const response = await s3.listObjectsV2(params).promise();
  response.Contents.forEach(obj => allKeys.push(obj.Key));

  if (response.NextContinuationToken) {
    params.ContinuationToken = response.NextContinuationToken;
    await getAllKeys(params, allKeys); // Recursive call
  }
  
  return allKeys;
}

// uploads a HTML file to an S3 bucket
async function postHTMLFile(path, pageContent) {
    await s3.upload({
        Bucket: bucketName,
        Key: path,
        ContentType: 'text/html',
        Body: pageContent
    }).promise();
}

// function for resizing image with specified width and fill option
async function resizeImgWidthOnly(image, width, fit) {
  return await sharp(image)
              .resize({
                width: width,
                fit: fit
              })
              .toBuffer();
}

// function for resizing image with specified width, height and fill option
async function resizeImg(image, width, height, fit) {
  return await sharp(image)
              .resize({
                width: width,
                height: height,
                fit: fit
              })
              .toBuffer();
}

// used specifically to create low quality images for gallery pages
async function resizeImgCustomQualityWidthOnly(image, width, fit) {
  return await sharp(image)
            .resize({
              width: width,
              fit: fit
            })
            .webp({ quality: 1 })
            .toBuffer();
}

// resize, compress and upload function specifically for gallery image
async function resizeCompressUploadGalleryImg(key) {
  const splitUp = key.split("/");
  const extension = splitUp[splitUp.length - 1].split(".");
  
  // get image from s3 bucket
  const image = await s3.getObject({
    Bucket: bucketName,
    Key: key
  }).promise();

  // resize image
  const buffer = await resizeImg(image.Body, 600, 400, 'fill');
  
  // upload image to s3 bucket
  await s3.putObject({
    Bucket: bucketName,
    Key: `images/${splitUp[1]}/gallery-img-resized.${extension[1]}`,
    Body: buffer,
    ContentType: "image"
  }).promise();
}

// resize and compress function for any image
async function resizeAndCompress(key, folder, width, height, fit) {
  // get the image from an s3 bucket
  const image = await s3.getObject({
    Bucket: bucketName,
    Key: key
  }).promise();

  // resize and compress the image
  if(height === 0) {
    if(folder === 'blurry') return await resizeImgCustomQualityWidthOnly(image.Body, width, fit);
    else return await resizeImgWidthOnly(image.Body, width, fit);
  }
  else {
    return await resizeImg(image.Body, width, height, fit);
  }
}

// deletes objects from an s3 bucket
async function deleteObjects(Objects) {
  await s3.deleteObjects({
    Bucket: bucketName, 
    Delete: {Objects}
  }).promise();
}

// creates HTML markup for a single gallery page
function createSingleGalleryPageContent(bigIMG, smallIMG, thumbnails, galleryName) {
  const smallIMGRender = [];
  smallIMG.forEach((img, index) => {
    smallIMGRender.push(`
      <div class="box cursor" onclick="openModal();currentSlide(${index + 1})">
        <div class="hover-overlay"></div>
        <img class="lazyload" src="../../images/${galleryName}/blurry/${img}" data-src="../../images/${galleryName}/compressed-small/${img}" alt=""/>
      </div>
    `);
  });
  
  const bigIMGRender = [];
  bigIMG.forEach((img, index) => {
    bigIMGRender.push(`
      <div class="mySlides cursor noSelect">
        <div onclick="plusSlides(-1)" class="image-overlay-left"></div>
        <div onclick="plusSlides(1)" class="image-overlay-right"></div>
        <div class="modal-image-wrapper">
          <img class="lazyload" data-src="../../images/${galleryName}/compressed-big/${img}" alt="">
        </div>
      </div>`);
  });
  
  const thumbnailsRender = [];
  thumbnails.forEach((img, index) => {
    thumbnailsRender.push(`
      <div class="column">
        <img class="lightbox-thumbnail lazyload cursor" data-src="../../images/${galleryName}/thumbnails/${img}" onclick="currentSlide(${index + 1})" alt="">
      </div>
    `);
  });
  
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <!-- Global site tag (gtag.js) - Google Analytics -->
    
        <meta charset="utf-8" />
        <link rel="icon" href="../../favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#000000" />
        <meta name="description" content="test site"/>
        <meta name="title" content="Dmd test">
        <meta name="author" content="name, email@aaa.com">
        <meta name="subject" content="Photography">
        <meta name="url" content="https://www.deimantasbutenas.lt/galleries/">
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
        <a href="https://deimantasbutenas.lt/">
            <img src="../../logo.png" alt="Page logo" title="Go to home page" class="page-logo">
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
                  <a href="https://deimantasbutenas.lt/prices/" title="Go to prices page">Prices</a>
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
                  <li class="fb-li-element" style="background: url(../../fb-like-button.png);">
                    <div class="fb-like" data-href="https://developers.facebook.com/docs/plugins/" data-width="" data-layout="button_count" data-action="like" data-size="small" data-share="false"></div>
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
                    <button type="button" class="prev cursor noSelect" onclick="plusSlides(-1)">
                      <svg width="22" height="42" viewBox="0 0 22 42" xmlns="https://www.w3.org/2000/svg"><path d="M2.615 21L21.708 1.907c.39-.39.39-1.023 0-1.413-.394-.393-1.024-.39-1.414 0l-19.8 19.8C.297 20.49.2 20.744.2 21c0 .257.098.51.293.706l19.8 19.8c.39.39 1.024.39 1.414 0 .393-.393.39-1.023 0-1.413L2.616 21z" fill-rule="evenodd"></path></svg>
                    </button>
    
                    <button type="button" class="next cursor noSelect" onclick="plusSlides(1)">
                      <svg width="22" height="42" viewBox="0 0 22 42" xmlns="https://www.w3.org/2000/svg"><path d="M19.385 21L.292 40.093c-.39.39-.39 1.023 0 1.413.394.393 1.024.39 1.414 0l19.8-19.8c.196-.195.293-.45.293-.705 0-.257-.098-.51-.293-.706L1.707.494C1.316.103.682.103.292.493c-.393.393-.39 1.023 0 1.413L19.384 21z" fill-rule="evenodd"></path></svg>
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
        <script src="../../scripts/swipe-events.js"></script>
      </body>
    </html>
  `;
}

// creates HTML markup for all-galleries page
function createAllGalleriesPageContent(allKeys, gallerySet) {
  const toRender = [];
  gallerySet.forEach((galleryName, index) => {
    const galleryIMG = getGalleryIMG(allKeys, gallerySet[index]);
    const splitUpGalleryName = galleryName.split("---");
    toRender.push(`
      <div class="box box-border cursor noSelect">
        <a href="https://deimantasbutenas.lt/galleries/${index + 1}">
          <div class="box-title">
            <p>${splitUpGalleryName[1]}</p>
          </div>
          <div class="gallery-img-container">
            <div class="hover-overlay"></div>
            <img src="../images/${galleryIMG.replace("gallery-img", "gallery-img-resized")}" alt="${index + 1} gallery image"/>
          </div>
        </a>
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
        <meta name="description" content="test site"/>
        <meta name="title" content="Dmd test">
        <meta name="author" content="name, email@aaa.com">
        <meta name="subject" content="Photography">
        <meta name="url" content="https://www.deimantasbutenas.lt/galleries/">
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        
        <!--<link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />-->
        <!--
          manifest.json provides metadata used when your web app is installed on a
          user's mobile device or desktop. See https://developers.google.com/web/fundamentals/web-app-manifest/
        -->
        <!--<link rel="manifest" href="%PUBLIC_URL%/manifest.json" />-->
    
        <link rel="stylesheet" type="text/css" href="../styles/global-style.css" media="screen">
        <link rel="stylesheet" type="text/css" href="../styles/photo-gallery-style.css" media="screen">
        <link rel="stylesheet" type="text/css" href="../styles/all-galleries-style.css" media="screen">
        <link href="https://fonts.googleapis.com/css2?family=Inconsolata:wght@400;500;600;700&family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet">
        
        <title>Galleries - Dmd</title>
      </head>
      <body>
        <div id="fb-root"></div>
        <script async defer crossorigin="anonymous" src="https://connect.facebook.net/en_GB/sdk.js#xfbml=1&version=v7.0"></script>
    
      <header>
        <a href="https://deimantasbutenas.lt/">
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
                  <a href="https://deimantasbutenas.lt/prices/" title="Go to prices page">Prices</a>
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
                    <svg xmlns="https://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 -150 1000 1000"><path fill="currentColor" d="M570.5 310h144l-17 159h-127v460h-190V469h-95V310h95v-95c0-68 16-119.3 48-154s84.7-52 158-52h126v158h-79c-14.7 0-26.3 1.3-35 4s-15 7-19 13-6.3 12.3-7 19-1.3 16-2 28v79z"></path></svg>
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
            <span>&#169;</span>
            <p>Deimantas Butėnas</p>
          </div>
        </footer>
    
        <script src="../scripts/toggle-mobile-navigation.js"></script>
      </body>
    </html>
  `;
}