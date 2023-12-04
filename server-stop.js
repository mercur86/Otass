const kill = require('kill-port');

const port = 80; // Puerto en el que se está ejecutando el servidor

kill(port)
  .then(() => {
    console.log(`El servidor en el puerto ${port} ha sido detenido.`);
  })
  .catch((err) => {
    console.error(`Error al detener el servidor en el puerto ${port}: ${err.message}`);
  });
