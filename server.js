const express = require('express');
const app = express();
const path = require('path');
const qrRoute = require('./routes/qr');
const pairRoute = require('./routes/pair');

app.use(express.static('public'));
app.use('/qr', qrRoute);
app.use('/pair', pairRoute);

app.get('/', (_, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

