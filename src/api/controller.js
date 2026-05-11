const deviceManager = require('../socket/deviceManager');

function sendCommand(sn, command) {

    const device = deviceManager.getDevice(sn);

    // IMPORTANT FIX
    if (!device || !device.ws || device.ws.readyState !== 1) {
        return { success: false, message: "Device not connected" };
    }

    try {
        device.ws.send(JSON.stringify(command));
        return { success: true };
    } catch (err) {
        return { success: false, message: err.message };
    }
}

module.exports = { sendCommand };