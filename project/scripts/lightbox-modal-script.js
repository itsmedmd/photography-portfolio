// Open the Modal
function openModal() {
    document.getElementById("myModal").style.display = "block";
    document.getElementsByTagName("html")[0].classList.add("scroll-lock");
}
    
// Close the Modal
function closeModal() {
    document.getElementById("myModal").style.display = "none";
    document.getElementsByTagName("html")[0].classList.remove("scroll-lock");
}
    
let slideIndex = 1;
let scrollI = 0;
showSlides(slideIndex);

// Next/previous controls
function plusSlides(n) {
    const divCount = document.getElementsByClassName("lightbox-thumbnail").length;
    if(n > divCount)
        scrollI = 0;
    else if(n === - 1) {
        if(scrollI === 0)
            scrollI = divCount - 1;
        else
            scrollI--;
    }
    else 
        scrollI++;
    showSlides(slideIndex += n);
}

// Thumbnail image controls
function currentSlide(n) {
    const row = document.getElementsByClassName("scrolling-thumbnail-row")[0];
    const rowStyle = getComputedStyle(row);
    const rowWidth = parseInt(rowStyle.getPropertyValue('width'));
    const lengthOfOneDiv = row.scrollWidth / document.getElementsByClassName("lightbox-thumbnail").length;
    const thumbnails = document.getElementsByClassName("lightbox-thumbnail");
    let countSideDivs = 0;
    for(let i = 0; i < thumbnails.length; i++)
        if(lengthOfOneDiv * i < rowWidth / 2)
            countSideDivs++;
    
    if(scrollI = n - countSideDivs);
    showSlides(slideIndex = n);
}

function scrollThumbnailRow(thumbnails) {
    const row = document.getElementsByClassName("scrolling-thumbnail-row")[0];
    const rowStyle = getComputedStyle(row);
    const rowWidth = parseInt(rowStyle.getPropertyValue('width'));
    const lengthOfOneDiv = row.scrollWidth / thumbnails.length;
    for(let i = 0; i < thumbnails.length; i++) {
        if(thumbnails[i].classList.contains("active")) {
            if(lengthOfOneDiv * i < rowWidth / 2) {
                row.scrollLeft = 0;
                scrollI = 0;
            }
            else {
                row.scrollLeft = lengthOfOneDiv * scrollI;
            }
        }
    }
}

function showSlides(n) {
    let i;
    const slides = document.getElementsByClassName("mySlides");
    const thumbnails = document.getElementsByClassName("lightbox-thumbnail");
    if (n > slides.length) {slideIndex = 1}
    if (n < 1) {slideIndex = slides.length}
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    for (i = 0; i < thumbnails.length; i++) {
        thumbnails[i].classList.remove("active");
    }
    slides[slideIndex-1].style.display = "flex";
    slides[slideIndex-1].classList.add("active");
    thumbnails[slideIndex-1].classList.add("active");
    scrollThumbnailRow(thumbnails);
}