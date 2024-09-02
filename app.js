const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');

require('dotenv').config();

const PORT = process.env.PORT || 4400;

app.use(express.json());

// Middleware setup
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// === Routes: ===
// ===============

app.use(require('./routes/sampling-certificates/gsaSamplingCertificate-routes.js'));
app.use(require('./routes/images/upload-images-route.js'));
app.use(require('./routes/assay-certificates/gsaCertificate-routes.js'));
app.use(require('./routes/invoices/invoice-routes.js'));

// === Server: ===
// ===============

app.listen(PORT, () => {
    console.log(`listening on port: ${PORT}`)
});
