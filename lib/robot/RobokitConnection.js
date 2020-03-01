"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const WebSocket = require('ws');
const ip = require('ip');
const RobokitClientCertificate_1 = require("./RobokitClientCertificate");
const AsyncToken_1 = require("./AsyncToken");
const AsyncTokenHotword_1 = require("./AsyncTokenHotword");
const TransactionFactory_1 = require("../rom/TransactionFactory");
class RobokitConnection extends events_1.EventEmitter {
    constructor(hostname = '', port = 9696) {
        super();
        this.hostname = hostname || ip.address();
        this.port = port;
        this.connectionString = `wss://${this.hostname}:${this.port}`;
        this.webSocket = undefined;
        this.robotSerialName = `robokit-${this.hostname}:${this.port}`;
        TransactionFactory_1.default.init();
        this.onHotWordToken = new AsyncTokenHotword_1.default();
        this.onListenToken = new AsyncToken_1.default();
        this.requester = {
            expression: {
                say: (prompt) => {
                    const transaction = TransactionFactory_1.default.createTransaction('tts', { prompt: prompt }, this.robotSerialName);
                    return this.sendTransactionMessageData(transaction.getMessageDataToSend());
                },
                blink: () => {
                    const transaction = TransactionFactory_1.default.createTransaction('blink', {}, this.robotSerialName);
                    return this.sendTransactionMessageData(transaction.getMessageDataToSend());
                },
                lookAt: (data) => {
                    const transaction = TransactionFactory_1.default.createTransaction('lookAt', data, this.robotSerialName);
                    return this.sendTransactionMessageData(transaction.getMessageDataToSend());
                },
                ident: (data) => {
                    const transaction = TransactionFactory_1.default.createTransaction('ident', data, this.robotSerialName);
                    return this.sendTransactionMessageData(transaction.getMessageDataToSend());
                }
            },
            listen: {
                start: () => this.onListenToken,
                subscribe: {
                    hotword: () => this.onHotWordToken
                }
            }
        };
    }
    // let listenToken = this._robotConnection.requester.listen.start();
    // listenToken.update.on((listenResultEvent: JIBO.v1.ListenResultEvent | undefined) => {
    connect() {
        return new Promise((resolve, reject) => {
            this.startWebSocket();
            resolve();
        });
    }
    disconnect() {
        if (this.webSocket) {
            try {
                this.webSocket.close();
            }
            catch (e) {
                console.log(e);
            }
            this.webSocket = null;
        }
    }
    startWebSocket() {
        console.log(`startWebSocket: ${this.connectionString}`);
        this.disconnect();
        try {
            //connect to the certified web socket
            let cas = [RobokitClientCertificate_1.cert];
            this.webSocket = new WebSocket(this.connectionString, {
                ca: cas,
                rejectUnauthorized: false,
                checkServerIdentity: ((servername, certificate) => {
                    // same as tls.connect() option:
                    //
                    // The method should return undefined if the servername and
                    // certificate are valid
                    var expected_cert_common_name = 'TBD';
                    console.log(`certificate.subject.CN:`, certificate.subject.CN);
                    if (certificate.subject.CN !== expected_cert_common_name) {
                        throw Error("Certificate CN doesn't match expected CN: " + expected_cert_common_name);
                    }
                    return undefined;
                }),
            });
            // this.clockSync = new ClockSync((sync_id, cb) => {
            //     //console.log(`Rom: clockSync: sync_id: `, sync_id);
            //     let message: any = {
            //         type: 'syncRequest',
            //         requestTime: this.clockSync._now()
            //     };
            //     let messageString: string = JSON.stringify(message);
            //     //console.log(`    sending syncRequest: ${messageString}`);
            //     webSocket.send(messageString);
            //     webSocket.once('message', (message) => {
            //         let json: any;
            //         try {
            //             json = JSON.parse(message);
            //         } catch (e) {
            //             console.log('onMessage: JSON.parse: ', e);
            //             json = null;
            //         }
            //         if (json && json.type == 'sync') {
            //             let roundTripTime: number = json.timestamp - json.requestTime;
            //             //console.log(`    received sync message: ${json.timestamp} rt: ${roundTripTime}`);
            //             cb(null, json.timestamp);
            //         }
            //     });
            // });
            this.webSocket.on('error', (e) => {
                this.emit('error', e);
                console.log(`error:`, e);
            });
            this.webSocket.on('open', () => {
                let payload = {
                    status: `OK`,
                    connectionString: `${this.connectionString}`
                };
                this.sendHandshakeMessage(payload);
                this.emit('connected');
                // this.clockSync.start();
            });
            this.webSocket.on('message', (message, flags) => {
                // flags.binary will be set if a binary data is received.
                // flags.masked will be set if the data was masked.
                // console.log('received message: ',message);
                let json;
                try {
                    json = JSON.parse(message);
                }
                catch (e) {
                    console.log('websocket onMessage: JSON.parse: ', e);
                    json = null;
                }
                if (json) {
                    // console.log('received json message: ', json);
                    // this.emit('message', json);
                    this.onMessage(json);
                }
            });
            this.webSocket.on('close', () => {
                console.log('websocket client closed');
                this.webSocket = undefined;
                this.emit('closed');
            });
        }
        catch (err) {
            this.webSocket = undefined;
            console.log(err);
        }
    }
    sendTransactionMessageData(messageData) {
        console.log(`sendTransactionMessageData:`, messageData);
        const token = new AsyncToken_1.default();
        messageData.client = 'robocommander';
        let message = {
            type: 'transaction',
            command: messageData
        };
        token.complete = new Promise((resolve, reject) => {
            if (this.webSocket) {
                let messageString = JSON.stringify(message);
                this.webSocket.send(messageString);
                // TOTO actually handle async transaction responses to reslove
                setTimeout(() => { console.log(`resolving`); resolve(); }, 1000); // simulate async response for now
                // resolve();
            }
            else {
                reject();
            }
        });
        return token;
    }
    sendHandshakeMessage(payload) {
        console.log(`sendHandshakeMessage:`, payload);
        const token = new AsyncToken_1.default();
        let currentTime = new Date().getTime();
        let handshakeMessage = {
            client: 'robocommander',
            type: 'handshake',
            payload: payload,
            timestamp: currentTime
        };
        token.complete = new Promise((resolve, reject) => {
            if (this.webSocket) {
                let messageString = JSON.stringify(handshakeMessage);
                this.webSocket.send(messageString);
                resolve();
            }
            else {
                reject();
            }
        });
        return token;
    }
    onMessage(message) {
        switch (message.type) {
            case 'handshake':
                // TODO
                break;
            case 'transaction':
                // TODO
                // handle transaction via TransactionFactory
                break;
            case 'rom-event':
                this.onRomEvent(message);
                break;
        }
    }
    onRomEvent(message) {
        console.log(`onRomEvent: message:`, message);
        switch (message.data.event) {
            case 'hotword':
                this.onHotWordToken.emit('hotWordHeard');
                break;
            case 'utterance':
                let result = {
                    Speech: message.data.data
                };
                this.onListenToken.emit('update', result);
                break;
            case 'nlu':
                // TODO use nlu when robokit provides it
                break;
        }
    }
}
exports.default = RobokitConnection;
//# sourceMappingURL=RobokitConnection.js.map