import { getUsuarios } from "../services/usuariosService.js";
import { getCuentasPorUsuario, crearCuenta, actualizarCuenta, eliminarCuenta } from "../services/cuentasService.js";

const selUsuario = document.getElementById("selUsuario");
const frmCuenta = document.getElementById("frmCuenta");
const txtIdCuenta = document.getElementById("txtIdCuenta");
const txtNombre = document.getElementById("txtNombre");
const selTipo = document.getElementById("selTipo");
const numSaldoInicial = document.getElementById("numSaldoInicial");
const selActiva = document.getElementById("selActiva");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");
const tituloForm = document.getElementById("tituloForm");
const tbCuentas = document.getElementById("tbCuentas");
const alertContainer = document.getElementById("alertContainer");

document.addEventListener("DOMContentLoaded", cargarUsuarios);
selUsuario.addEventListener("change", cargarCuentas);
frmCuenta.addEventListener("submit", guardar);
btnCancelar.addEventListener("click", limpiar);

function mostrarMensaje(texto, tipo) {
    alertContainer.innerHTML = `
        <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
            ${texto}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>`;
}

async function cargarUsuarios() {
    try {
        const respuesta = await getUsuarios();
        respuesta.body.data.forEach(usuario => {
            const opcion = document.createElement("option");
            opcion.value = usuario.id_usuario;
            opcion.textContent = usuario.nombre;
            selUsuario.appendChild(opcion);
        });
    } catch (error) {
        mostrarMensaje("No se pudo conectar con el servidor", "danger");
    }
}

async function cargarCuentas() {
    tbCuentas.innerHTML = "";
    if (!selUsuario.value) {
        return;
    }
    try {
        const respuesta = await getCuentasPorUsuario(selUsuario.value);
        if (!respuesta.body.success) {
            mostrarMensaje(respuesta.body.message, "danger");
            return;
        }
        respuesta.body.data.forEach(pintarFila);
    } catch (error) {
        mostrarMensaje("No se pudo conectar con el servidor", "danger");
    }
}

function pintarFila(cuenta) {
    const fila = document.createElement("tr");
    fila.innerHTML = `
        <td>${cuenta.id_cuenta}</td>
        <td>${cuenta.nombre}</td>
        <td>${cuenta.tipo}</td>
        <td>${Number(cuenta.saldo_inicial).toFixed(2)}</td>
        <td>${Number(cuenta.saldo_actual).toFixed(2)}</td>
        <td>${cuenta.activa === "S" ? "Activa" : "Inactiva"}</td>
        <td>
            <button type="button" class="btn btn-warning btn-sm" data-accion="editar">Editar</button>
            <button type="button" class="btn btn-danger btn-sm" data-accion="eliminar">Eliminar</button>
        </td>`;
    fila.querySelector('[data-accion="editar"]').addEventListener("click", () => editar(cuenta));
    fila.querySelector('[data-accion="eliminar"]').addEventListener("click", () => borrar(cuenta.id_cuenta));
    tbCuentas.appendChild(fila);
}

function validar() {
    const errores = [];
    if (!selUsuario.value) {
        errores.push("Seleccione un usuario");
    }
    if (!txtNombre.value.trim()) {
        errores.push("El nombre de la cuenta es obligatorio");
    }
    if (!selTipo.value) {
        errores.push("Seleccione el tipo de cuenta");
    }
    if (numSaldoInicial.value === "") {
        errores.push("El saldo inicial es obligatorio");
    }
    return errores;
}

async function guardar(evento) {
    evento.preventDefault();
    const errores = validar();
    if (errores.length > 0) {
        mostrarMensaje(errores.join(". "), "warning");
        return;
    }
    const cuenta = {
        id_usuario: Number(selUsuario.value),
        nombre: txtNombre.value.trim(),
        tipo: selTipo.value,
        saldo_inicial: Number(numSaldoInicial.value),
        activa: selActiva.value
    };
    try {
        const respuesta = txtIdCuenta.value
            ? await actualizarCuenta(txtIdCuenta.value, cuenta)
            : await crearCuenta(cuenta);
        mostrarMensaje(respuesta.body.message, respuesta.body.success ? "success" : "danger");
        if (respuesta.body.success) {
            limpiar();
            await cargarCuentas();
        }
    } catch (error) {
        mostrarMensaje("No se pudo conectar con el servidor", "danger");
    }
}

function editar(cuenta) {
    txtIdCuenta.value = cuenta.id_cuenta;
    txtNombre.value = cuenta.nombre;
    selTipo.value = cuenta.tipo;
    numSaldoInicial.value = cuenta.saldo_inicial;
    selActiva.value = cuenta.activa;
    tituloForm.textContent = "Editar cuenta";
    btnGuardar.textContent = "Actualizar";
    btnCancelar.classList.remove("d-none");
}

async function borrar(idCuenta) {
    if (!confirm("Desea eliminar la cuenta?")) {
        return;
    }
    try {
        const respuesta = await eliminarCuenta(idCuenta);
        mostrarMensaje(respuesta.body.message, respuesta.body.success ? "success" : "danger");
        if (respuesta.body.success) {
            await cargarCuentas();
        }
    } catch (error) {
        mostrarMensaje("No se pudo conectar con el servidor", "danger");
    }
}

function limpiar() {
    txtIdCuenta.value = "";
    txtNombre.value = "";
    selTipo.value = "";
    numSaldoInicial.value = "";
    selActiva.value = "S";
    tituloForm.textContent = "Registrar cuenta";
    btnGuardar.textContent = "Guardar";
    btnCancelar.classList.add("d-none");
}
