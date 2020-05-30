// Open the Modal
function openModal() {
    document.getElementById("myModal").style.display = "block";
}
    
// Close the Modal
function closeModal() {
    document.getElementById("myModal").style.display = "none";
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
    //const captionText = document.getElementById("caption");
    if (n > slides.length) {slideIndex = 1}
    if (n < 1) {slideIndex = slides.length}
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    for (i = 0; i < thumbnails.length; i++) {
        thumbnails[i].className = thumbnails[i].className.replace(" active", "");
    }
    slides[slideIndex-1].style.display = "flex";
    thumbnails[slideIndex-1].className += " active";
    //captionText.innerHTML = thumbnails[slideIndex-1].alt;
}

// When the user clicks anywhere outside of the modal, close it
// window.onclick = function(event) {
//     if (event.target.id === "myModal") {
//         e.target.style.display = "none";
//     }
//   }