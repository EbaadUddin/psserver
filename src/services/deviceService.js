// src/services/deviceService.js
const pool = require('../config/db');


// =========================
// SAVE / UPDATE DEVICE
// =========================
async function saveDevice(data) {
    await pool.query(
        `
        INSERT INTO Devices (SN, LastSeen, IsOnline)
        VALUES ($1, NOW(), true)
        ON CONFLICT (SN)
        DO UPDATE SET
            LastSeen = NOW(),
            IsOnline = true
        `,
        [data.sn]
    );
}


// =========================
// INSERT SINGLE USER
// =========================
async function saveUser(data) {
    await pool.query(
        `
        INSERT INTO DeviceUsers (DeviceSN, EnrollId, BackupNum, Admin)
        VALUES ($1, $2, $3, $4)
        `,
        [
            data.sn,
            data.enrollid,
            data.backupnum,
            data.admin || 0
        ]
    );
}


// =========================
// BULK UPSERT USERS
// =========================
async function saveUserList(sn, users) {
    for (const user of users) {
        await pool.query(
            `
            INSERT INTO DeviceUsers (DeviceSN, EnrollId, BackupNum, Admin)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (DeviceSN, EnrollId, BackupNum)
            DO UPDATE SET
                Admin = EXCLUDED.Admin
            `,
            [
                sn,
                user.enrollid,
                user.backupnum,
                user.admin || 0
            ]
        );
    }
}


// =========================
// EXPORT
// =========================
module.exports = {
    saveDevice,
    saveUser,
    saveUserList
};