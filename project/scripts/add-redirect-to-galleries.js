Array.from(document.getElementsByClassName("box")).forEach((element, id) => {
    element.addEventListener("click", () => {
        location.href = `http://deimantasbutenas.lt/galleries/${id + 1}/`;
    });
});