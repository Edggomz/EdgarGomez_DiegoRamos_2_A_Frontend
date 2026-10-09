const API_URL = "http://localhost:8080/api/movimientos";
const HEADERS = { "Content-Type": "application/json" };

export async function getMovimientosPorCuenta(idCuenta, tipo, categoria) {
    const parametros = new URLSearchParams();
    if (tipo) {
        parametros.append("tipo", tipo);
    }
    if (categoria) {
        parametros.append("categoria", categoria);
    }
    const response = await fetch(`${API_URL}/cuenta/${idCuenta}?${parametros.toString()}`);
    return { status: response.status, body: await response.json() };
}

export async function crearMovimiento(movimiento) {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify(movimiento)
    });
    return { status: response.status, body: await response.json() };
}

export async function actualizarMovimiento(idMovimiento, movimiento) {
    const response = await fetch(`${API_URL}/${idMovimiento}`, {
        method: "PUT",
        headers: HEADERS,
        body: JSON.stringify(movimiento)
    });
    return { status: response.status, body: await response.json() };
}

export async function eliminarMovimiento(idMovimiento) {
    const response = await fetch(`${API_URL}/${idMovimiento}`, { method: "DELETE" });
    return { status: response.status, body: await response.json() };
}
