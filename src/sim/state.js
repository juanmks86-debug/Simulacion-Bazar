/* Estado mutable de la simulación, compartido entre la lógica (logic.js), el dibujo (render.js) y el motor (engine.js). */
export const sim = {
  run: true,        // ¿corriendo o en pausa?
  cust: [],         // clientes y acompañantes en la tienda
  queue: [],        // cola de la caja
  serving: null,    // cliente que está pagando
  S2: null,         // contadores (ventas, ingresos, visitas, unidades por producto...)
  LOG: [],          // registro de eventos
  clock: 0,         // minutos simulados desde las 00:00
  arr: 0,           // temporizador de llegada del próximo cliente
  nameI: 0,         // índice para elegir nombre/ropa
  uid: 0,           // contador de ids de cliente
  emp: null,        // empleado repositor (si está en la tienda)
  empCd: 0,         // espera hasta el próximo empleado
};
