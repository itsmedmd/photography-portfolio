/*
// tested and it's not really necessary, works on chrome without this.
// Not sure if it works in IE but in IE swipe events are not realistically needed.
// patch CustomEvent to allow constructor creation (IE/Chrome)
if (typeof window.CustomEvent !== 'function') {
    window.CustomEvent = function (event, params) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        const evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    };
    window.CustomEvent.prototype = window.Event.prototype;
}
*/

// variables for determining and executing swipes
let xDown = null;
let xDiff = null;
let timeDown = null;
let startEl = null;
let startTouchesLength = 0;

// touchstart event handler function
function handleTouchStart(e) {
    startTouchesLength = e.touches.length;
    startEl = e.target;
    timeDown = Date.now();
    xDown = e.touches[0].clientX;
    xDiff = 0;
}

// touchmove event handler function
function handleTouchMove(e) {
    if (!xDown) return;
    const xUp = e.touches[0].clientX;
    xDiff = xDown - xUp;
}

// touchend event handler function
function handleTouchEnd(e) {
    // if the user released on a different element, cancel
    if (startEl !== e.target) return;

    const swipeThreshold = 20; // 20px needed to swipe
    const swipeTimeout = 1000; // doesn't fire event if held down for longer than 1000ms
    const timeDiff = Date.now() - timeDown;
    let eventType = '';
    
    if (Math.abs(xDiff) > swipeThreshold && timeDiff < swipeTimeout) {
        if (xDiff > 0)  eventType = 'swiped-left';
        else            eventType = 'swiped-right';
    }

    if (eventType !== '' && startTouchesLength === 1) {
        // fire event on the element that started the swipe
        startEl.dispatchEvent(new CustomEvent(eventType, { bubbles: true, cancelable: true }));
    }

    // reset values
    xDown = null;
    timeDown = null;
}

document.addEventListener('touchstart', handleTouchStart);
document.addEventListener('touchmove', handleTouchMove);
document.addEventListener('touchend', handleTouchEnd);

window.addEventListener('load', function() {
    const elements = document.getElementsByClassName("modal-image-wrapper");

    // Changing HTMLCollection to array this way instead of
    // Array.from because internet explorer does not support Array.from
    const temp_array = [], length = elements.length;
    for (let i = 0; i < length; i++)
        temp_array.push(elements[i]);

    temp_array.forEach(function(element) {
        element.addEventListener('swiped-right', function(){ plusSlides(-1); });
        element.addEventListener('swiped-left', function(){ plusSlides(1); });
    });
});