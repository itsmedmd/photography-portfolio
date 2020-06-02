function toggleMobileNavigation() {
    const nav = document.getElementById("top-navigation");
    const socials = document.getElementById("top-social-media-icons");
    const pageContent = document.getElementsByClassName("page-content")[0];
    if(pageContent.classList.contains("displayOff")) {
        nav.classList.remove("mobile-navigation-visible");
        nav.classList.add("mobile-navigation-hidden");
        socials.classList.remove("mobile-socials-visible");
        socials.classList.add("mobile-socials-hidden");
        pageContent.classList.remove("displayOff");
        document.getElementsByTagName("html")[0].classList.remove("scroll-lock");
    }
    else {
        pageContent.classList.add("displayOff");
        nav.classList.remove("mobile-navigation-hidden");
        nav.classList.add("mobile-navigation-visible");
        socials.classList.remove("mobile-socials-hidden");
        socials.classList.add("mobile-socials-visible");
        document.getElementsByTagName("html")[0].classList.add("scroll-lock");
    }
}