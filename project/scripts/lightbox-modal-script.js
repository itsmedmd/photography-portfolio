// global variables for determining the position of the thumbnail scroll bar
let slideIndex = 1;
let scrollCount = 0;
let rowWidth;

// If the modal is opened, adding 'display: none' to the whole page
// and if the modal is closed, adding 'display: none' to the modal
// because there are UX problems without this on mobile devices
function togglePageContent() {
    const pageContent = document.querySelector(".page-content .container");
    if(pageContent.classList.contains("displayOff"))
        pageContent.classList.remove("displayOff");
    else
        pageContent.classList.add("displayOff");
}

// Open the Modal
function openModal() {
    togglePageContent();
    document.getElementById("myModal").style.display = "block";
    document.getElementsByTagName("html")[0].classList.add("scroll-lock");
}
    
// Close the Modal
function closeModal() {
    togglePageContent();
    document.getElementById("myModal").style.display = "none";
    document.getElementsByTagName("html")[0].classList.remove("scroll-lock");
}

// gets the html element of the thumbnail row
// used just for simplifying code
function getThumbnailRowElement() {
    return document.getElementsByClassName("scrolling-thumbnail-row")[0];
}

// counts how many divs come before the middle of the scroll bar
function countOffsetDivs() {
    rowWidth = parseInt(getComputedStyle(getThumbnailRowElement()).getPropertyValue('width'));
    const thumbnails = document.getElementsByClassName("lightbox-thumbnail");
    let countSideDivs = 0;
    for(let i = 1; i <= thumbnails.length; i++)
        if(100 * i <= rowWidth / 2) countSideDivs++;
        else break;
    return countSideDivs;
}

// Next/previous controls
function plusSlides(n) {
    const divCount = document.getElementsByClassName("lightbox-thumbnail").length;      
    if(n > divCount)
        scrollCount = 0;
    else if(n === - 1) {
        if(scrollCount === 0)
            scrollCount = divCount - countOffsetDivs();
        else
            scrollCount--;
    }
    else 
        scrollCount++;
    showSlides(slideIndex += n);
}

// Thumbnail image controls
function currentSlide(n) {
    scrollCount = n - countOffsetDivs();
    showSlides(slideIndex = n);
}

// centering of the thumbnail row
function scrollThumbnailRow(thumbnails) {
    const row = getThumbnailRowElement();
    const scr = screen.availWidth;
    for(let i = 0; i < thumbnails.length; i++) {
        if(thumbnails[i].classList.contains("active")) {
            if(i < countOffsetDivs()) {
                row.scrollLeft = 0;
                scrollCount = 0;
            }
            // hard coding these screen sizes since the css is exactly like that too
            else if(scr > 310 && scr <= 410 ||
                    scr > 520 && scr <= 680 ||
                    scr > 820 && scr <= 950 ||
                    scr > 1090 && scr <= 1200)
                row.scrollLeft = 100 * scrollCount - row.scrollWidth / thumbnails.length;
            else
                row.scrollLeft = 100 * scrollCount - row.scrollWidth / thumbnails.length / 2;
        }
    }
}

// Main function that shows the slides (modal)
function showSlides(n) {
    let i;
    const slides = document.getElementsByClassName("mySlides");
    const thumbnails = document.getElementsByClassName("lightbox-thumbnail");
    if (n > slides.length) {slideIndex = 1}
    if (n < 1) {slideIndex = slides.length}
    for (i = 0; i < slides.length; i++) {
        slides[i].classList.remove("active");
        thumbnails[i].classList.remove("active");
        slides[i].style.display = "none";
    }
    slides[slideIndex-1].style.display = "flex";
    slides[slideIndex-1].classList.add("active");
    thumbnails[slideIndex-1].classList.add("active");

    // only scroll the thumbnail bar if the screen width is more
    // than 210px, since at this exact and lower screen sizes
    // the thumbnail scroll bar is invisible
    if(screen.availWidth > 210)
        scrollThumbnailRow(thumbnails);
}

// if needed, adds 'justify-content: center' css rule to scrolling-thumbnail-row class element
function adjustThumbnailRowCentering() {
    if(screen.availWidth >= document.getElementsByClassName("lightbox-thumbnail").length * 100 && screen.availWidth <= 1000)
        if(document.getElementsByClassName("scrolling-thumbnail-row")[0].style.justifyContent !== "center")
            document.getElementsByClassName("scrolling-thumbnail-row")[0].style.justifyContent = "center";
    else if(document.getElementsByClassName("scrolling-thumbnail-row")[0].style.justifyContent !== "initial")
            document.getElementsByClassName("scrolling-thumbnail-row")[0].style.justifyContent = "initial";
}

window.addEventListener('load', function() {
    adjustThumbnailRowCentering();
});

// After window resize, if the thumbnail scroll bar width changes, recalculate thumbnail scroll amount
window.addEventListener('resize', function() {
    if(document.getElementById("myModal").style.display = "block" &&
       rowWidth !== parseInt(getComputedStyle(getThumbnailRowElement()).getPropertyValue('width'))) {
        currentSlide(slideIndex);
    }
    adjustThumbnailRowCentering();
});