const deviceManager = require('./deviceManager');
const deviceService = require('../services/deviceService');
const logService = require('../services/logService');

async function handleMessage(ws, data) {

    const sn = data?.sn;

    // ---------------- HEARTBEAT ----------------
    if (sn) {
        deviceManager.updateHeartbeat(sn);
        ws.sn = sn;
    }

    switch (data.cmd) {

        // ---------------- REGISTER ----------------
        case 'reg': {

            ws.sn = data.sn;

            deviceManager.addDevice(data.sn, ws);

            await deviceService.saveDevice(data);

            // ❌ NO TIME SENT HERE (AS REQUESTED)
            ws.send(JSON.stringify({
                ret: "reg",
                result: true,
                nosenduser: true
            }));

            console.log(`Device registered: ${data.sn}`);

            break;
        }

        // ---------------- LOGS ----------------
        case 'sendlog': {

            await logService.saveLogs(data);

            ws.send(JSON.stringify({
                ret: "sendlog",
                result: true,
                count: data.record?.length || 0,
                logindex: data.logindex || 0,
                // cloudtime: getTime(),
                access: 1
            }));

            break;
        }

        // ---------------- USER UPLOAD ----------------
        case 'senduser': {

            await deviceService.saveUser(data);

            ws.send(JSON.stringify({
                ret: "senduser",
                result: true
            }));

            break;
        }

        // ---------------- SET TIME (ONLY WHEN YOU CALL IT MANUALLY) ----------------
        case 'settime': {

            ws.send(JSON.stringify({
                ret: "settime",
                result: true,
                sn: data.sn,
                cloudtime: data.cloudtime
            }));

            console.log(`Manual time sync sent to ${data.sn}`);

            break;
        }

        // ---------------- DELETE USER ----------------
        case 'deleteuser': {

            console.log(`Delete user response from ${data.sn}:`, data);

            break;
        }

        // ---------------- GET DEVICE USERS ----------------
        case 'getuserlist': {

            const users = data.record || [];

            // save all users (UPSERT)
            await deviceService.saveUserList(data.sn, users);

            console.log(`User batch received from ${data.sn}: ${users.length}`);

            ws.send(JSON.stringify({
                cmd: "getuserlist",
                stn: false
            }));

            break;
        }

        default:
            console.log("Unknown cmd:", data.cmd, data);
    }
}

module.exports = { handleMessage };