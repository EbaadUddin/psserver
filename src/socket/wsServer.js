// const WebSocket = require('ws');
// const { handleMessage } = require('./messageHandler');
// const deviceManager = require('./deviceManager');

// function startWSServer() {

//     const wss = new WebSocket.Server({ port: 12345 });

//     wss.on('connection', (ws) => {

//         ws.on('message', (msg) => {
//             try {
//                 const data = JSON.parse(msg.toString());

//                 if (!data || !data.cmd) {
//                     console.log("Invalid message:", data);
//                     return;
//                 }

//                 // attach SN early if available
//                 if (data.sn) {
//                     ws.sn = data.sn;
//                 }

//                 handleMessage(ws, data);

//             } catch (err) {
//                 console.log('Invalid JSON:', err.message);
//             }
//         });

//         ws.on('close', () => {
//             if (ws.sn) {
//                 deviceManager.removeDevice(ws.sn);
//             }
//         });

//         ws.on('error', (err) => {
//             console.log("WS error:", err.message);
//         });
//     });


//     setInterval(() => {

//         const now = Date.now();

//         const devices = deviceManager.getAllDevices?.() || [];

//         for (const [sn, device] of devices) {

//             if (now - device.lastSeen > 60000) {
//                 device.isAlive = false;
//             }
//         }

//     }, 30000);

//     console.log("WebSocket Server running on port 12345");
// }

// module.exports = { startWSServer };




const WebSocket = require('ws');
const { handleMessage } = require('./messageHandler');
const deviceManager = require('./deviceManager');

// Store active connections safely
const activeSockets = new Map();

function startWSServer() {

    const wss = new WebSocket.Server({
        port: 7789,
        perMessageDeflate: false // IMPORTANT: reduces memory usage
    });

    console.log("WebSocket Server running on port 7789");

    // ----------------------------
    // CONNECTION HANDLER
    // ----------------------------
    wss.on('connection', (ws) => {

        ws.isAlive = true;
        ws.lastSeen = Date.now();

        // ----------------------------
        // MESSAGE HANDLER
        // ----------------------------
        ws.on('message', (msg) => {
            try {
                const data = JSON.parse(msg.toString());

                if (!data || !data.cmd) {
                    console.log("Invalid message:", data);
                    return;
                }

                // Register device early
                if (data.sn) {
                    ws.sn = data.sn;
                    ws.lastSeen = Date.now();

                    activeSockets.set(data.sn, ws);
                }

                handleMessage(ws, data);

            } catch (err) {
                console.log('Invalid JSON:', err.message);
            }
        });

        // ----------------------------
        // PONG = device alive
        // ----------------------------
        ws.on('pong', () => {
            ws.isAlive = true;
            ws.lastSeen = Date.now();
        });

        // ----------------------------
        // CLOSE HANDLER (IMPORTANT CLEANUP)
        // ----------------------------
        ws.on('close', () => {
            if (ws.sn) {
                activeSockets.delete(ws.sn);
                deviceManager.removeDevice(ws.sn);
            }
        });

        // ----------------------------
        // ERROR HANDLER
        // ----------------------------
        ws.on('error', (err) => {
            console.log("WS error:", err.message);
        });
    });

    // ----------------------------
    // HEARTBEAT SYSTEM (CRITICAL)
    // ----------------------------
    setInterval(() => {

        const now = Date.now();

        for (const [sn, ws] of activeSockets) {

            // If no response → kill connection
            if (!ws.isAlive || (now - ws.lastSeen > 60000)) {
                console.log(`Disconnecting inactive device: ${sn}`);

                ws.terminate(); // force cleanup
                activeSockets.delete(sn);
                deviceManager.removeDevice(sn);

                continue;
            }

            // mark for next check
            ws.isAlive = false;
            ws.ping();
        }

    }, 30000);

    // ----------------------------
    // MEMORY MONITOR (OPTIONAL BUT IMPORTANT)
    // ----------------------------
    setInterval(() => {
        const mem = process.memoryUsage();
        console.log(
            `Memory MB: ${(mem.heapUsed / 1024 / 1024).toFixed(2)}`
        );
    }, 60000);
}

module.exports = { startWSServer };