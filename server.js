const express = require('express');
const app = express();

app.use(express.static('www'));

app.get('/tab1', (req, res) => {
  res.sendFile(__dirname + '/www/index.html');
});



app.listen(80, () => {
  console.log('La aplicación está siendo ejecutada en http://localhost:80');
});
