const API_URL = "http://localhost:8080/api/cuentas";
const HEADERS = { "Content-Type": "application/json" };

export async function getCuentasPorUsuario(idUsuario) {
    const response = await fetch(`${API_URL}/usuario/${idUsuario}`);
    return { status: response.status, body: await response.json() };
}

export async function getCuentaPorId(idCuenta) {
    const response = await fetch(`${API_URL}/${idCuenta}`);
    return { status: response.status, body: await response.json() };
}

export async function crearCuenta(cuenta) {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify(cuenta)
    });
    return { status: response.status, body: await response.json() };
}

export async function actualizarCuenta(idCuenta, cuenta) {
    const response = await fetch(`${API_URL}/${idCuenta}`, {
        method: "PUT",
        headers: HEADERS,
        body: JSON.stringify(cuenta)
    });
    return { status: response.status, body: await response.json() };
}

export async function eliminarCuenta(idCuenta) {
    const response = await fetch(`${API_URL}/${idCuenta}`, { method: "DELETE" });
    return { status: response.status, body: await response.json() };
}
