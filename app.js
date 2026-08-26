document.addEventListener("DOMContentLoaded", () => {

    const slides = document.querySelectorAll(".hero-slide");
    const prevButton = document.querySelector(".hero-prev");
    const nextButton = document.querySelector(".hero-next");

    let currentSlide = 0;

    // Comprobar que encontramos el carrusel
    console.log("KROKICOL - Slides encontrados:", slides.length);

    if (!slides.length) {
        console.error("KROKICOL - No se encontraron los slides");
        return;
    }

    function showSlide(index) {

        const total = slides.length;

        const prevIndex = (index - 1 + total) % total;
        const nextIndex = (index + 1) % total;

        slides.forEach((slide) => {
            slide.classList.remove("active", "prev", "next");
        });

        slides[index].classList.add("active");
        slides[prevIndex].classList.add("prev");
        slides[nextIndex].classList.add("next");
    }

    function nextSlide() {

        currentSlide++;

        if (currentSlide >= slides.length) {
            currentSlide = 0;
        }

        showSlide(currentSlide);
    }

    function prevSlide() {

        currentSlide--;

        if (currentSlide < 0) {
            currentSlide = slides.length - 1;
        }

        showSlide(currentSlide);
    }

    if (nextButton) {
        nextButton.addEventListener("click", nextSlide);
    }

    if (prevButton) {
        prevButton.addEventListener("click", prevSlide);
    }

    // Mostrar primera imagen
    showSlide(currentSlide);

    // Cambio automático
    setInterval(nextSlide, 3000);

});


// ===============================
// SERVICE WORKER - PWA
// ===============================

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service-worker.js")
            .then(() => {
                console.log("KROKICOL: Service Worker registrado correctamente.");
            })
            .catch((error) => {
                console.error("KROKICOL: Error al registrar el Service Worker:", error);
            });
    });
}