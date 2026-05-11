const pool = require('../config/db');

async function saveLogs(data) {
    for (const log of data.record) {

        const query = `
            INSERT INTO DeviceLogs (DeviceSN, EnrollId, LogTime, Mode, InOut)
            VALUES ($1, $2, $3, $4, $5)
        `;

        const values = [
            data.sn,
            log.enrollid,
            log.time,
            log.mode,
            log.inout
        ];

        await pool.query(query, values);
    }
}

module.exports = { saveLogs };