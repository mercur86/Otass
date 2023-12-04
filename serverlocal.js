const express = require('express');
const app = express();

app.use(express.static('www'));

app.get('/epsgrau/login', (req, res) => {
  res.sendFile(__dirname + '/www/index.html');
});

app.get('/epsgrau/notificaciones', (req, res) => {
  res.sendFile(__dirname + '/www/index.html');
});

app.listen(3000, () => {
  console.log('La aplicación está siendo ejecutada en http://localhost:3000');
});
