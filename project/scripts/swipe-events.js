
(function (window, document) {
    'use strict';

    // patch CustomEvent to allow constructor creation (IE/Chrome)
    // if (typeof window.CustomEvent !== 'function') {
    //     window.CustomEvent = function (event, params) {
    //         params = params || { bubbles: false, cancelable: false, detail: undefined };
    //         const evt = document.createEvent('CustomEvent');
    //         evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    //         return evt;
    //     };
    //     window.CustomEvent.prototype = window.Event.prototype;
    // }

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    let xDown = null;
    let xDiff = null;
    let timeDown = null;
    let startEl = null;

    function handleTouchEnd(e) {
        // if the user released on a different element, cancel
        if (startEl !== e.target) return;

        const swipeThreshold = 15; // 15px
        const swipeTimeout = 2000; // 2000ms
        const timeDiff = Date.now() - timeDown;
        let eventType = '';

        if (Math.abs(xDiff) > swipeThreshold && timeDiff < swipeTimeout) {
            if (xDiff > 0)  eventType = 'swiped-left';
            else            eventType = 'swiped-right';
        }

        if (eventType !== '') {
            // fire event on the element that started the swipe
            startEl.dispatchEvent(new CustomEvent(eventType, { bubbles: true, cancelable: true }));
        }

        // reset values
        xDown = null;
        timeDown = null;
    }

    function handleTouchStart(e) {
        startEl = e.target;
        timeDown = Date.now();
        xDown = e.touches[0].clientX;
        xDiff = 0;
    }

    function handleTouchMove(e) {
        if (!xDown) return;
        const xUp = e.touches[0].clientX;
        xDiff = xDown - xUp;
    }

}(window, document));

window.addEventListener("load", function() {
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