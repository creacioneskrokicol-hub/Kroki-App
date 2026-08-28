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

// ===============================
// VISOR DE IMÁGENES DEL CARRUSEL
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    const imageModal = document.getElementById("image-modal");
    const imageModalImg = document.getElementById("image-modal-img");
    const imageModalClose = document.getElementById("image-modal-close");

    const imageModalPrev = document.getElementById("image-modal-prev");
    const imageModalNext = document.getElementById("image-modal-next");

    const heroImages = document.querySelectorAll(
        "#inicio-carrusel .hero-slide img"
    );

    console.log("KROKICOL - Imágenes del visor:", heroImages.length);

    if (
        !imageModal ||
        !imageModalImg ||
        !imageModalClose ||
        !imageModalPrev ||
        !imageModalNext
    ) {
        console.error("KROKICOL - No se encontró algún elemento del visor");
        return;
    }

    let currentImage = 0;


    // ===============================
    // ABRIR IMAGEN
    // ===============================

    heroImages.forEach((img, index) => {

        img.addEventListener("click", () => {

            currentImage = index;

            imageModalImg.src = img.src;
            imageModalImg.alt = img.alt;

            imageModal.classList.add("active");

        });

    });


    // ===============================
    // MOSTRAR IMAGEN
    // ===============================

    function showModalImage(index) {

        if (index < 0) {
            index = heroImages.length - 1;
        }

        if (index >= heroImages.length) {
            index = 0;
        }

        currentImage = index;

        imageModalImg.src = heroImages[currentImage].src;
        imageModalImg.alt = heroImages[currentImage].alt;

    }


    // ===============================
    // SIGUIENTE
    // ===============================

    imageModalNext.addEventListener("click", (event) => {

        event.stopPropagation();

        showModalImage(currentImage + 1);

    });


    // ===============================
    // ANTERIOR
    // ===============================

    imageModalPrev.addEventListener("click", (event) => {

        event.stopPropagation();

        showModalImage(currentImage - 1);

    });


    // ===============================
    // CERRAR
    // ===============================

    function closeImageModal() {

        imageModal.classList.remove("active");

        imageModalImg.src = "";

    }


    // Botón X
    imageModalClose.addEventListener("click", (event) => {

        event.stopPropagation();

        closeImageModal();

    });


    // Clic fuera de la imagen
    imageModal.addEventListener("click", (event) => {

        if (event.target === imageModal) {

            closeImageModal();

        }

    });


    // ===============================
    // ESC
    // ===============================

    document.addEventListener("keydown", (event) => {

        if (!imageModal.classList.contains("active")) {
            return;
        }

        if (event.key === "Escape") {

            closeImageModal();

        }

        // Flecha derecha del teclado
        if (event.key === "ArrowRight") {

            showModalImage(currentImage + 1);

        }

        // Flecha izquierda del teclado
        if (event.key === "ArrowLeft") {

            showModalImage(currentImage - 1);

        }

    });

});