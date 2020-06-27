function addSrcToIframes(videoURLs) {
    const iframes = document.getElementsByClassName('responsive-iframe');
    
    // Changing HTMLCollection to array this way instead of
    // Array.from because internet explorer does not support Array.from
    const temp_array = [], length = iframes.length;
    for (let i = 0; i < length; i++)
        temp_array.push(iframes[i]);

    for (let i = 0; i < length; i++)
        temp_array[i].dataset.src = videoURLs[i];
};

// adding the lazyload script after the iframes have rendered
// because otherwise it doesn't work
function addLazyloadScript(source) {
    const body = document.getElementsByTagName('body')[0];
    const js = document.createElement("script");
    js.src = source;
    body.appendChild(js);
}