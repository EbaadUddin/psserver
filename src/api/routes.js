const express = require('express');
const router = express.Router();
const { sendCommand } = require('./controller');
const { getDeviceTime } = require('../utils/time');
const deviceManager = require('../socket/deviceManager');

// ---------------- ENABLE USER ----------------
router.post('/enable-user', (req, res) => {
    const { sn, enrollid } = req.body;

    const result = sendCommand(sn, {
        cmd: "enableuser",
        enrollid,
        enflag: 1
    });

    res.json(result);
});

// ---------------- DISABLE USER ----------------
router.post('/disable-user', (req, res) => {
    const { sn, enrollid } = req.body;

    const result = sendCommand(sn, {
        cmd: "enableuser",
        enrollid,
        enflag: 0
    });

    res.json(result);
});

// ---------------- SET USER INFO ----------------
router.post('/set-user', (req, res) => {
    const { sn, enrollid, name, backupnum, record, admin } = req.body;

    const result = sendCommand(sn, {
        cmd: "setuserinfo",
        enrollid,
        name,
        backupnum,
        record,
        admin: admin || 0
    });

    res.json(result);
});

// ---------------- SET TIME ----------------
router.post('/set-time', (req, res) => {
    const { sn } = req.body;

    const cloudtime = getDeviceTime();

    const result = sendCommand(sn, {
        cmd: "settime",
        cloudtime
    });

    res.json({
        ...result,
        cloudtime
    });
});

// ---------------- DELETE USER ----------------
router.post('/delete-user', (req, res) => {
    const { sn, enrollid, backupnum } = req.body;

    if (!sn || enrollid === undefined) {
        return res.json({
            success: false,
            message: "sn and enrollid required"
        });
    }

    const result = sendCommand(sn, {
        cmd: "deleteuser",
        enrollid,
        backupnum: backupnum ?? 13 // default = delete all user data
    });

    res.json(result);
});

// ---------------- GET DEVICE USERS ----------------
router.post('/sync-users', (req, res) => {

    const { sn } = req.body;

    const result = sendCommand(sn, {
        cmd: "getuserlist",
        stn: true
    });

    res.json(result);
});

// ---------------- REBOOT DEVICE ----------------
router.post('/reboot-device', (req, res) => {

    const { sn } = req.body;

    if (!sn) {
        return res.json({
            success: false,
            message: "sn is required"
        });
    }

    const result = sendCommand(sn, {
        cmd: "reboot"
    });

    res.json({
        ...result,
        message: result.success 
            ? "Reboot command sent (device will disconnect)" 
            : result.message
    });
});

module.exports = router;