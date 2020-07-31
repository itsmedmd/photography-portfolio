// Select the node that will be observed for mutations
const targetNode = document.getElementsByClassName('fb-like')[0];
const parentNode = document.getElementsByClassName('fb-li-element')[0];

// first increment is when 'parsed' is added, second is 'rendered'
let observeCount = 0;

// Callback function to execute when mutations are observed
const callback = function(mutationsList, observer) {
    // Use traditional 'for loops' for IE 11
    let i = 0;
    for(let mutation of mutationsList) {
        if (mutation.attributeName === 'fb-xfbml-state') {
            observeCount++;
            if(observeCount === 2) {
                // disable fb like button background
                parentNode.style.background = 'none';
                // stop observing
                observer.disconnect();
            }
        }
    }
};

// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
observer.observe(targetNode, { attributes: true });