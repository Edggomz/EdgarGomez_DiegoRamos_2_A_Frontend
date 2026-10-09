const API_URL = "http://localhost:8080/api/usuarios";

export async function getUsuarios() {
    const response = await fetch(API_URL);
    return { status: response.status, body: await response.json() };
}
