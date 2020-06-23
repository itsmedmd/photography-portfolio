function addSrcToIframes() {
    const iframes = Array.from(document.getElementsByClassName('responsive-iframe'));
    iframes.forEach(function(iframe) {
        // dataset.src is for adding "data-src" attribute
        iframe.dataset.src = "https://www.youtube.com/embed/mZ2zy-wnR0s?controls=1";
    });
};

function addLazyloadScript() {
    const body = document.getElementsByTagName('body')[0];
    const js = document.createElement("script");
    js.src = 'scripts/lazyload.js';
    body.appendChild(js);
}

// at 768px and less the header shows only hamburger bar
// for navigation, where facebook like button embed is,
// which is why loading youtube iframes is prioritised here
if(screen.availWidth <= 768) {
    addSrcToIframes();
    addLazyloadScript();
} else {
    // first loads facebook like button (with the whole page)
    window.onload = function() {
        addSrcToIframes();
        addLazyloadScript();
    };
}