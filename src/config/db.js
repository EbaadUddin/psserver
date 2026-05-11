const { Pool } = require('pg');

const pool = new Pool({
    user: 'appuser',
    host: '127.0.0.1',
    database: 'psserver',
    password: 'Pioneer786$',
    port: 5432,
});

pool.connect()
    .then(client => {
        console.log('DB Connected (PostgreSQL)');
        client.release();
    })
    .catch(err => {
        console.log('DB Connection Error:', err);
    });

module.exports = pool;