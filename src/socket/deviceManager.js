const devices = new Map();

function addDevice(sn, ws) {

    const existing = devices.get(sn);

    if (existing?.ws) {
        try { existing.ws.terminate(); } catch (e) {}
    }

    devices.set(sn, {
        ws,
        lastSeen: Date.now(),
        isAlive: true,   // 🔥 ADD THIS
        sn
    });

    console.log("Device connected:", sn);
}

function updateHeartbeat(sn) {
    const device = devices.get(sn);

    if (device) {
        device.lastSeen = Date.now();
        device.isAlive = true;
    }
}

function markOffline(sn) {
    const device = devices.get(sn);

    if (device) {
        device.isAlive = false;
    }
}

function removeDevice(sn) {
    const device = devices.get(sn);

    if (device?.ws) {
        try { device.ws.terminate(); } catch (e) {}
    }

    devices.delete(sn);
    console.log("Device removed:", sn);
}

function getDevice(sn) {
    return devices.get(sn);
}

module.exports = {
    addDevice,
    updateHeartbeat,
    removeDevice,
    getDevice,
    markOffline
};