import mqtt from 'mqtt';
import http from 'http';
import { SMTPServer } from 'smtp-server';

const webhookEndpoint = process.env.webhook || null;

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
        if (process.env.webhook) {
            http.get(process.env.webhook.replace('{name}', cameraName));
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
