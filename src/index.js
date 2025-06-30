import mqtt from 'mqtt';
import http from 'http';
import https from 'https';
import { SMTPServer } from 'smtp-server';

const webhookEndpoint = process.env.WEBHOOK || null;

const mqttServer = process.env.MQTT_SERVER || '192.168.1.116';
const mqttClient  = mqtt.connect('mqtt://' + mqttServer);

/************************************************************
 * SMTP Listener
 ***********************************************************/
const server = new SMTPServer({
    authOptional: true,
    // logger: true,
    onConnect(session, callback) {
        console.log('tester', session);
        const cameraName = session.clientHostname.slice(0, -4);
        console.log('event', cameraName);

        // MQTT publish event
        mqttClient.publish('home/camera/' + cameraName, cameraName);

        // HTTP webhook
        if (process.env.WEBHOOK) {
            const url = process.env.WEBHOOK.replace('{name}', cameraName);
            const isHttps = url.startsWith('https://');
            const lib = isHttps ? https : http;
            const req = lib.request(url, { method: 'POST' }, (res) => {
            // Optionally handle response here
            });
            req.on('error', (err) => {
            console.error('Webhook request error:', err);
            });
            req.end();
        }

        return callback();
    },
    onMailFrom(address, session, callback) {
        return callback(); // Accept the address
    },
    onRcptTo(address, session, callback) {
        return callback(); // Accept the address
    },
    onData(stream, session, callback) {
        stream.pipe(process.stdout); // print message to console
        stream.on('end', callback);
    }
});

const port = process.env.PORT || 5000;
server.listen(port);

console.log('SMTP server running on port', port);
