
import { supabase } from "./supabase.js";

// =====================================
// CONFIGURACIÓN
// =====================================

const ADMIN_UID = "85d7c471-8133-4dfa-9b61-726504d140ae";

const productsList = document.getElementById("products-list");
const adminMessage = document.getElementById("admin-message");
const logoutButton = document.getElementById("logout-button");

const addProductButton = document.getElementById("add-product");
const productFormContainer = document.getElementById("product-form-container");
const productForm = document.getElementById("product-form");
const cancelFormButton = document.getElementById("cancel-form");

const productName = document.getElementById("product-name");
const productReference = document.getElementById("product-reference");
const productCategory = document.getElementById("product-category");
const productSizes = document.getElementById("product-sizes");
const productStatus = document.getElementById("product-status");
const productDescription = document.getElementById("product-description");
const productImage = document.getElementById("product-image");
const productPosition = document.getElementById("product-position");

const ALBUMES = ["A", "B", "C", "D"];

// =====================================
// VERIFICAR ADMINISTRADOR
// =====================================

async function verificarSesion() {
    const { data: { session }, error } =
        await supabase.auth.getSession();

    if (error || !session) {
        window.location.href = "login.html";
        return false;
    }

    if (session.user.id !== ADMIN_UID) {
        await supabase.auth.signOut();
        window.location.href = "login.html";
        return false;
    }

    return true;
}

// =====================================
// MENSAJES
// =====================================

function mostrarMensaje(mensaje, error = false) {
    adminMessage.textContent = mensaje;
    adminMessage.style.color = error ? "#c62828" : "#16803c";
}

// =====================================
// SUBIR IMAGEN
// =====================================

async function subirImagen(archivo) {
    const extensionesPermitidas = ["jpg", "jpeg", "png", "webp"];
    const extension = archivo.name.split(".").pop().toLowerCase();

    if (!extensionesPermitidas.includes(extension)) {
        throw new Error("Formato permitido: JPG, PNG o WebP.");
    }

    if (archivo.size > 5 * 1024 * 1024) {
        throw new Error("La imagen supera el límite de 5 MB.");
    }

    const nombreArchivo = `${crypto.randomUUID()}.${extension}`;
    const ruta = `productos/${nombreArchivo}`;

    const { error } = await supabase.storage
        .from("productos")
        .upload(ruta, archivo, {
            cacheControl: "3600",
            upsert: false
        });

    if (error) throw error;

    const { data } = supabase.storage
        .from("productos")
        .getPublicUrl(ruta);

    return data.publicUrl;
}

// =====================================
// OBTENER RUTA DE UNA IMAGEN DE STORAGE
// =====================================

function obtenerRutaStorage(url) {
    if (!url || typeof url !== "string") return null;

    const marcador = "/storage/v1/object/public/productos/";

    try {
        const ruta = new URL(url).pathname.split(marcador)[1];

        return ruta ? decodeURIComponent(ruta) : null;
    } catch {
        return null;
    }
}

// =====================================
// ELIMINAR ARCHIVO DE STORAGE
// =====================================

async function eliminarArchivoStorage(url) {
    const ruta = obtenerRutaStorage(url);

    if (!ruta) return;

    const { error } = await supabase.storage
        .from("productos")
        .remove([ruta]);

    if (error) {
        console.warn("No se pudo retirar la imagen anterior:", error.message);
    }
}

// =====================================
// CREAR BOTÓN
// =====================================

function crearBoton(texto, accion, color = "#1b2585") {
    const boton = document.createElement("button");

    boton.type = "button";
    boton.textContent = texto;
    boton.style.cssText = `
        padding: 9px 13px;
        margin: 5px 5px 5px 0;
        border: none;
        border-radius: 7px;
        background: ${color};
        color: white;
        cursor: pointer;
        font-weight: 600;
    `;

    boton.addEventListener("click", accion);

    return boton;
}

// =====================================
// REEMPLAZAR IMAGEN PRINCIPAL
// =====================================

async function reemplazarImagenPrincipal(producto, archivo, boton) {
    let nuevaUrl = null;

    boton.disabled = true;
    boton.textContent = "Subiendo...";

    try {
        nuevaUrl = await subirImagen(archivo);

        const { error } = await supabase
            .from("productos")
            .update({ imagen: nuevaUrl })
            .eq("id", producto.id);

        if (error) throw error;

        await eliminarArchivoStorage(producto.imagen);

        mostrarMensaje(
            `Imagen principal de ${producto.nombre} actualizada correctamente.`
        );

        await cargarProductos();

    } catch (error) {
        if (nuevaUrl) {
            await eliminarArchivoStorage(nuevaUrl);
        }

        console.error(error);
        mostrarMensaje(
            `No se pudo reemplazar la imagen: ${error.message}`,
            true
        );

        boton.disabled = false;
        boton.textContent = "Cambiar principal";
    }
}

// =====================================
// REEMPLAZAR O AGREGAR FOTO DE ÁLBUM
// =====================================

async function reemplazarFotoAlbum(producto, letra, archivo, boton) {
    let nuevaUrl = null;

    boton.disabled = true;
    boton.textContent = "Subiendo...";

    try {
        nuevaUrl = await subirImagen(archivo);

        const albumesActuales = producto.albumes || {};

        const nuevosAlbumes = {
            ...albumesActuales,
            [letra]: nuevaUrl
        };

        const { error } = await supabase
            .from("productos")
            .update({ albumes: nuevosAlbumes })
            .eq("id", producto.id);

        if (error) throw error;

        await eliminarArchivoStorage(albumesActuales[letra]);

        mostrarMensaje(
            `Fotografía ${letra} de ${producto.nombre} actualizada correctamente.`
        );

        await cargarProductos();

    } catch (error) {
        if (nuevaUrl) {
            await eliminarArchivoStorage(nuevaUrl);
        }

        console.error(error);
        mostrarMensaje(
            `No se pudo reemplazar la fotografía ${letra}: ${error.message}`,
            true
        );

        boton.disabled = false;
        boton.textContent = `Cambiar foto ${letra}`;
    }
}

// =====================================
// CREAR CONTROL PARA CAMBIAR FOTOGRAFÍA
// =====================================

function crearControlImagen(producto, tipo, letra = null) {
    const contenedor = document.createElement("div");

    contenedor.style.cssText = `
        display: inline-flex;
        align-items: center;
        flex-wrap: wrap;
        margin: 5px 5px 5px 0;
    `;

    const texto = letra
        ? `Foto ${letra}`
        : "Imagen principal";

    const botonTexto = letra
        ? `Cambiar foto ${letra}`
        : "Cambiar principal";

    const boton = crearBoton(botonTexto, () => {
        input.click();
    });

    const input = document.createElement("input");

    input.type = "file";
    input.accept = "image/jpeg,image/png,image/webp";
    input.hidden = true;

    input.addEventListener("change", async () => {
        const archivo = input.files[0];

        if (!archivo) return;

        const confirmado = confirm(
            `¿Quieres reemplazar ${texto.toLowerCase()} de ${producto.nombre}?`
        );

        if (!confirmado) {
            input.value = "";
            return;
        }

        if (tipo === "principal") {
            await reemplazarImagenPrincipal(producto, archivo, boton);
        } else {
            await reemplazarFotoAlbum(producto, letra, archivo, boton);
        }
    });

    contenedor.append(boton, input);

    return contenedor;
}

// =====================================
// ELIMINAR PRODUCTO
// =====================================

async function eliminarProducto(producto, boton) {
    const confirmado = confirm(
        `¿Seguro que deseas eliminar "${producto.nombre}"?\n\n` +
        "Esta acción no se puede deshacer. Las posiciones del catálogo se reorganizarán."
    );

    if (!confirmado) return;

    boton.disabled = true;
    boton.textContent = "Eliminando...";

    try {
        const { error } = await supabase.rpc(
            "eliminar_producto_y_reordenar",
            {
                p_producto_id: producto.id
            }
        );

        if (error) throw error;

        // Retirar imágenes alojadas en Supabase Storage.
        await eliminarArchivoStorage(producto.imagen);

        const albumes = producto.albumes || {};

        for (const letra of ALBUMES) {
            await eliminarArchivoStorage(albumes[letra]);
        }

        mostrarMensaje(
            `Producto "${producto.nombre}" eliminado y catálogo reorganizado.`
        );

        await cargarProductos();

    } catch (error) {
        console.error(error);

        mostrarMensaje(
            `No se pudo eliminar el producto: ${error.message}`,
            true
        );

        boton.disabled = false;
        boton.textContent = "Eliminar";
    }
}

// =====================================
// CARGAR PRODUCTOS
// =====================================

async function cargarProductos() {
    productsList.textContent = "Cargando productos...";

    const { data, error } = await supabase
        .from("productos")
        .select("*")
        .order("orden_catalogo", { ascending: true });

    if (error) {
        productsList.textContent = "No se pudieron cargar los productos.";
        console.error(error.message);
        return;
    }

    productsList.replaceChildren();

    if (!data || data.length === 0) {
        productsList.textContent = "Todavía no hay productos registrados.";
        return;
    }

    data.forEach((producto) => {
        const card = document.createElement("article");
        card.className = "admin-product-card";

        const nombre = document.createElement("h3");
        nombre.textContent = producto.nombre;

        const referencia = document.createElement("p");
        referencia.textContent = `Referencia: ${producto.referencia}`;

        const categoria = document.createElement("p");
        categoria.textContent =
            `Categoría: ${producto.categoria || "Sin categoría"}`;

        const posicion = document.createElement("p");
        posicion.textContent =
            `Posición: ${producto.orden_catalogo ?? "Sin posición"}`;

        const tallas = document.createElement("p");
        tallas.textContent =
            `Tallas: ${producto.tallas || "No especificadas"}`;

        const estado = document.createElement("p");
        estado.textContent =
            `Estado: ${producto.estado || "normal"}`;

        const cardStatus = document.createElement("p");
        cardStatus.textContent =
            producto.activo ? "Activo" : "Inactivo";

        const controles = document.createElement("div");
        controles.style.cssText = `
            margin-top: 15px;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
        `;

        const tituloImagenes = document.createElement("strong");
        tituloImagenes.textContent = "Fotografías del producto";
        tituloImagenes.style.marginBottom = "6px";

        controles.append(
            tituloImagenes,
            crearControlImagen(producto, "principal")
        );

        const tituloAlbum = document.createElement("strong");
        tituloAlbum.textContent = "Álbum adicional";
        tituloAlbum.style.marginTop = "10px";

        controles.appendChild(tituloAlbum);

        ALBUMES.forEach((letra) => {
            controles.appendChild(
                crearControlImagen(producto, "album", letra)
            );
        });

        const botonEliminar = crearBoton(
            "Eliminar producto",
            () => eliminarProducto(producto, botonEliminar),
            "#b42318"
        );

        botonEliminar.style.marginTop = "15px";

        card.append(
            nombre,
            referencia,
            categoria,
            posicion,
            tallas,
            estado,
            cardStatus,
            controles,
            botonEliminar
        );

        productsList.appendChild(card);
    });
}

// =====================================
// ABRIR Y CERRAR FORMULARIO
// =====================================

addProductButton.addEventListener("click", () => {
    productForm.reset();
    productImage.required = true;
    productFormContainer.hidden = false;

    document.getElementById("form-title").textContent =
        "Registrar nuevo producto";

    productFormContainer.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});

cancelFormButton.addEventListener("click", () => {
    productForm.reset();
    productFormContainer.hidden = true;
    adminMessage.textContent = "";
});

// =====================================
// REGISTRAR PRODUCTO
// =====================================

productForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const archivo = productImage.files[0];

    if (!archivo) {
        mostrarMensaje(
            "Selecciona una fotografía del producto.",
            true
        );
        return;
    }

    const posicion = Number(productPosition.value);

    if (!Number.isInteger(posicion) || posicion < 1) {
        mostrarMensaje(
            "Ingresa una posición válida del catálogo.",
            true
        );
        return;
    }

    const saveButton = document.getElementById("save-product");

    saveButton.disabled = true;
    saveButton.textContent = "Guardando...";
    adminMessage.textContent = "";

    let imagenUrl = null;

    try {
        imagenUrl = await subirImagen(archivo);

        const nuevoProducto = {
            nombre: productName.value.trim(),
            referencia: productReference.value.trim(),
            categoria: productCategory.value,
            tallas: productSizes.value.trim(),
            estado: productStatus.value,
            descripcion: productDescription.value.trim(),
            imagen: imagenUrl,
            albumes: {},
            activo: true
        };

        const { error } = await supabase.rpc(
            "insertar_producto_en_posicion",
            {
                p_producto: nuevoProducto,
                p_posicion: posicion
            }
        );

        if (error) throw error;

        mostrarMensaje("¡Producto registrado correctamente!");

        productForm.reset();
        productFormContainer.hidden = true;

        await cargarProductos();

    } catch (error) {
        if (imagenUrl) {
            await eliminarArchivoStorage(imagenUrl);
        }

        console.error("Error al registrar producto:", error);

        mostrarMensaje(
            `No se pudo registrar el producto: ${error.message}`,
            true
        );

    } finally {
        saveButton.disabled = false;
        saveButton.textContent = "Guardar producto";
    }
});

// =====================================
// CERRAR SESIÓN
// =====================================

logoutButton.addEventListener("click", async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
        mostrarMensaje("No se pudo cerrar la sesión.", true);
        return;
    }

    window.location.href = "login.html";
});

// =====================================
// INICIAR PANEL
// =====================================

async function iniciarPanel() {
    const sesionActiva = await verificarSesion();

    if (!sesionActiva) return;

    await cargarProductos();
}

iniciarPanel();
