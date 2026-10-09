import { getUsuarios } from "../services/usuariosService.js";
import { getCuentasPorUsuario, getCuentaPorId } from "../services/cuentasService.js";
import { getMovimientosPorCuenta, crearMovimiento, actualizarMovimiento, eliminarMovimiento } from "../services/movimientosService.js";

const selUsuario = document.getElementById("selUsuario");
const selCuenta = document.getElementById("selCuenta");
const totalIngresos = document.getElementById("totalIngresos");
const totalGastos = document.getElementById("totalGastos");
const saldoActual = document.getElementById("saldoActual");
const frmMovimiento = document.getElementById("frmMovimiento");
const txtIdMovimiento = document.getElementById("txtIdMovimiento");
const selTipo = document.getElementById("selTipo");
const txtCategoria = document.getElementById("txtCategoria");
const txtDescripcion = document.getElementById("txtDescripcion");
const numMonto = document.getElementById("numMonto");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");
const tituloForm = document.getElementById("tituloForm");
const tbMovimientos = document.getElementById("tbMovimientos");
const selFiltroTipo = document.getElementById("selFiltroTipo");
const txtFiltroCategoria = document.getElementById("txtFiltroCategoria");
const alertContainer = document.getElementById("alertContainer");

document.addEventListener("DOMContentLoaded", iniciar);
selUsuario.addEventListener("change", cargarCuentas);
selCuenta.addEventListener("change", cargarCuenta);
frmMovimiento.addEventListener("submit", guardar);
btnCancelar.addEventListener("click", limpiar);
selFiltroTipo.addEventListener("change", cargarMovimientos);
txtFiltroCategoria.addEventListener("change", cargarMovimientos);

function mostrarMensaje(texto, tipo) {
    alertContainer.innerHTML = `
        <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
            ${texto}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>`;
}

async function iniciar() {
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
    selCuenta.innerHTML = '<option value="">Seleccione una cuenta</option>';
    tbMovimientos.innerHTML = "";
    pintarTotales(null);
    if (!selUsuario.value) {
        return;
    }
    try {
        const respuesta = await getCuentasPorUsuario(selUsuario.value);
        if (!respuesta.body.success) {
            mostrarMensaje(respuesta.body.message, "danger");
            return;
        }
        respuesta.body.data.forEach(cuenta => {
            const opcion = document.createElement("option");
            opcion.value = cuenta.id_cuenta;
            opcion.textContent = cuenta.nombre;
            selCuenta.appendChild(opcion);
        });
    } catch (error) {
        mostrarMensaje("No se pudo conectar con el servidor", "danger");
    }
}

async function cargarCuenta() {
    if (!selCuenta.value) {
        return;
    }
    try {
        const respuesta = await getCuentaPorId(selCuenta.value);
        if (!respuesta.body.success) {
            mostrarMensaje(respuesta.body.message, "danger");
            return;
        }
        pintarTotales(respuesta.body.data);
        await cargarMovimientos();
    } catch (error) {
        mostrarMensaje("No se pudo conectar con el servidor", "danger");
    }
}

function pintarTotales(cuenta) {
    totalIngresos.textContent = cuenta ? Number(cuenta.total_ingresos).toFixed(2) : "0.00";
    totalGastos.textContent = cuenta ? Number(cuenta.total_gastos).toFixed(2) : "0.00";
    saldoActual.textContent = cuenta ? Number(cuenta.saldo_actual).toFixed(2) : "0.00";
}

async function cargarMovimientos() {
    tbMovimientos.innerHTML = "";
    if (!selCuenta.value) {
        return;
    }
    try {
        const respuesta = await getMovimientosPorCuenta(selCuenta.value, selFiltroTipo.value, txtFiltroCategoria.value.trim());
        if (!respuesta.body.success) {
            mostrarMensaje(respuesta.body.message, "danger");
            return;
        }
        respuesta.body.data.forEach(pintarFila);
    } catch (error) {
        mostrarMensaje("No se pudo conectar con el servidor", "danger");
    }
}

function pintarFila(movimiento) {
    const fila = document.createElement("tr");
    fila.innerHTML = `
        <td>${movimiento.id_movimiento}</td>
        <td>${movimiento.fecha}</td>
        <td>${movimiento.tipo}</td>
        <td>${movimiento.categoria}</td>
        <td>${movimiento.descripcion === null ? "" : movimiento.descripcion}</td>
        <td>${Number(movimiento.monto).toFixed(2)}</td>
        <td>
            <button type="button" class="btn btn-warning btn-sm" data-accion="editar">Editar</button>
            <button type="button" class="btn btn-danger btn-sm" data-accion="eliminar">Eliminar</button>
        </td>`;
    fila.querySelector('[data-accion="editar"]').addEventListener("click", () => editar(movimiento));
    fila.querySelector('[data-accion="eliminar"]').addEventListener("click", () => borrar(movimiento.id_movimiento));
    tbMovimientos.appendChild(fila);
}

function validar() {
    const errores = [];
    if (!selCuenta.value) {
        errores.push("Seleccione una cuenta");
    }
    if (!selTipo.value) {
        errores.push("Seleccione el tipo de movimiento");
    }
    if (!txtCategoria.value.trim()) {
        errores.push("La categoria es obligatoria");
    }
    if (numMonto.value === "" || Number(numMonto.value) <= 0) {
        errores.push("El monto debe ser mayor que cero");
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
    const movimiento = {
        id_cuenta: Number(selCuenta.value),
        tipo: selTipo.value,
        categoria: txtCategoria.value.trim(),
        descripcion: txtDescripcion.value.trim(),
        monto: Number(numMonto.value)
    };
    try {
        const respuesta = txtIdMovimiento.value
            ? await actualizarMovimiento(txtIdMovimiento.value, movimiento)
            : await crearMovimiento(movimiento);
        mostrarMensaje(respuesta.body.message, respuesta.body.success ? "success" : "danger");
        if (respuesta.body.success) {
            limpiar();
            await cargarCuenta();
        }
    } catch (error) {
        mostrarMensaje("No se pudo conectar con el servidor", "danger");
    }
}

function editar(movimiento) {
    txtIdMovimiento.value = movimiento.id_movimiento;
    selTipo.value = movimiento.tipo;
    txtCategoria.value = movimiento.categoria;
    txtDescripcion.value = movimiento.descripcion === null ? "" : movimiento.descripcion;
    numMonto.value = movimiento.monto;
    tituloForm.textContent = "Editar movimiento";
    btnGuardar.textContent = "Actualizar";
    btnCancelar.classList.remove("d-none");
}

async function borrar(idMovimiento) {
    if (!confirm("Desea eliminar el movimiento?")) {
        return;
    }
    try {
        const respuesta = await eliminarMovimiento(idMovimiento);
        mostrarMensaje(respuesta.body.message, respuesta.body.success ? "success" : "danger");
        if (respuesta.body.success) {
            await cargarCuenta();
        }
    } catch (error) {
        mostrarMensaje("No se pudo conectar con el servidor", "danger");
    }
}

function limpiar() {
    txtIdMovimiento.value = "";
    selTipo.value = "";
    txtCategoria.value = "";
    txtDescripcion.value = "";
    numMonto.value = "";
    tituloForm.textContent = "Registrar movimiento";
    btnGuardar.textContent = "Guardar";
    btnCancelar.classList.add("d-none");
}
