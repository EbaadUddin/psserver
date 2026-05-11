const express = require('express');
const cors = require('cors');
const { startWSServer } = require('./socket/wsServer');
const routes = require('./api/routes');

const app = express();

// IMPORTANT: CORS FIRST
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

app.use('/api', routes);

startWSServer();

app.listen(3000, '0.0.0.0', () => {
    console.log('API running on port 3000');
});