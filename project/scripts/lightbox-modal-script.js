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
showSlides(slideIndex);

// Next/previous controls
function plusSlides(n) {
    showSlides(slideIndex += n);
}

// Thumbnail image controls
function currentSlide(n) {
    showSlides(slideIndex = n);
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
}

// When the user clicks anywhere outside of the modal, close it
// window.onclick = function(event) {
//     if (event.target.id === "myModal") {
//         e.target.style.display = "none";
//     }
//   }