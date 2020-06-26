function addSrcToIframes() {
    const iframes = document.getElementsByClassName('responsive-iframe');

    // Changing HTMLCollection to array this way instead of
    // Array.from because internet explorer does not support Array.from
    const temp_array = [], length = iframes.length;
    for (var i = 0; i < length; i++)
        temp_array.push(iframes[i]);

    temp_array.forEach(function(iframe) {
        iframe.dataset.src = "https://www.youtube.com/embed/mZ2zy-wnR0s?controls=1&rel=0";
    });
};

// adding the lazyload script after the iframes have rendered
// because otherwise it doesn't work
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