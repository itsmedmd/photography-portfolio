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
    
let slideIndex = 1;
let scrollI = 0;
showSlides(slideIndex);

function countOffset() {
    const row = document.getElementsByClassName("scrolling-thumbnail-row")[0];
    const rowStyle = getComputedStyle(row);
    const rowWidth = parseInt(rowStyle.getPropertyValue('width'));
    const thumbnails = document.getElementsByClassName("lightbox-thumbnail")
    const lengthOfOneDiv = row.scrollWidth / thumbnails.length;
    const divsInViewCount = Math.floor(rowWidth / lengthOfOneDiv);
    const scrollOffset = (rowWidth - divsInViewCount * lengthOfOneDiv) / 2;
    return scrollOffset;
}

function countOffsetDivs() {
    const row = document.getElementsByClassName("scrolling-thumbnail-row")[0];
    const rowStyle = getComputedStyle(row);
    const rowWidth = parseInt(rowStyle.getPropertyValue('width'));
    const lengthOfOneDiv = row.scrollWidth / document.getElementsByClassName("lightbox-thumbnail").length;
    const thumbnails = document.getElementsByClassName("lightbox-thumbnail");
    const scrollOffset = countOffset();
    
    let countSideDivs = 0;
    for(let i = 0; i < thumbnails.length; i++)
        if(lengthOfOneDiv * i + scrollOffset < rowWidth / 2)
            countSideDivs++;
    return countSideDivs;
}

// Next/previous controls
function plusSlides(n) {
    const divCount = document.getElementsByClassName("lightbox-thumbnail").length;      
    if(n > divCount)
        scrollI = 0;
    else if(n === - 1) {
        if(scrollI === 0)
            scrollI = divCount - countOffsetDivs();
        else
            scrollI--;
    }
    else 
        scrollI++;
    showSlides(slideIndex += n);
}

// Thumbnail image controls
function currentSlide(n) {
    scrollI = n - countOffsetDivs();
    showSlides(slideIndex = n);
}

function scrollThumbnailRow(thumbnails) {
    const row = document.getElementsByClassName("scrolling-thumbnail-row")[0];
    const rowStyle = getComputedStyle(row);
    const rowWidth = parseInt(rowStyle.getPropertyValue('width'));
    const lengthOfOneDiv = row.scrollWidth / thumbnails.length;
    const scrollOffset = countOffset();
    const offsetDivs = countOffsetDivs();

    for(let i = 0; i < thumbnails.length; i++) {
        if(thumbnails[i].classList.contains("active")) {
            if(i < offsetDivs) {
                row.scrollLeft = 0;
                scrollI = 0;
            }
            else {
                // Making adjustments of thumbnail scroll row centering with some specific scren sizes
                if( screen.availWidth === 667 ||
                    screen.availWidth === 640 ||
                    screen.availWidth === 600 ||
                    screen.availWidth === 427 ||
                    screen.availWidth === 414 ||
                    screen.availWidth === 412 ||
                    screen.availWidth === 375 ||
                    screen.availWidth === 360 ||
                    scrollOffset * 2 === 99)
                    row.scrollLeft = lengthOfOneDiv * scrollI - scrollOffset;
                else if(screen.availWidth === 320)
                    row.scrollLeft = lengthOfOneDiv * scrollI - scrollOffset - lengthOfOneDiv / 2;
                else
                    row.scrollLeft = lengthOfOneDiv * scrollI - scrollOffset;
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