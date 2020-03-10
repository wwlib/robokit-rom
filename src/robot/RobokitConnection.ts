import {EventEmitter} from "events";
const WebSocket = require('ws');
const ip = require('ip');
import { cert } from './RobokitClientCertificate';
import AsyncToken from './AsyncToken';
import AsyncTokenHotword from './AsyncTokenHotword';
import Transaction, { TransactionMessageData } from '../rom/Transaction';
import TransactionFactory from '../rom/TransactionFactory';

// export interface Expression {
//     say(prompt: string): AsyncToken<any>;
//     blink(): AsyncToken<any>;
//     ident(): AsyncToken<any>;
// }

// export interface Requester {
//     expression: Expression;
// }

export type HandshakeMessagePayload = {
    status: string;
    connectionString: string;
}

export type HandshakeMessage = {
    client: string;
    type: string;
    payload: HandshakeMessagePayload;
    timestamp: number
}

export default class RobokitConnection extends EventEmitter {

    public hostname: string;
    public port: number;
    public connectionString: string;
    public webSocket: any;
    public robotSerialName: string;

    public onHotWordToken: AsyncTokenHotword<any>;
    public onListenToken: AsyncToken<any>;

    public requester: any; //Requester;

    constructor(hostname: string = '', port: number = 9696) {
        super();
        this.hostname = hostname || ip.address();
        this.port = port;
        this.connectionString = `wss://${this.hostname}:${this.port}`;
        this.webSocket = undefined;
        this.robotSerialName = `robokit-${this.hostname}:${this.port}`;
        TransactionFactory.init();

        this.onHotWordToken = new AsyncTokenHotword<any>();
        this.onListenToken = new AsyncToken<any>();

        this.requester = {
            expression: {
                say: (prompt: string): AsyncToken<any> => {
                    const transaction: Transaction = TransactionFactory.createTransaction('tts', {prompt: prompt}, this.robotSerialName);
                    return this.sendTransactionMessageData(transaction.getMessageDataToSend());
                },
                blink: (): AsyncToken<any> => {
                    const transaction: Transaction = TransactionFactory.createTransaction('blink', {}, this.robotSerialName);
                    return this.sendTransactionMessageData(transaction.getMessageDataToSend());
                },
                lookAt: (data: any): AsyncToken<any> => {
                    const transaction: Transaction = TransactionFactory.createTransaction('lookAt', data, this.robotSerialName);
                    return this.sendTransactionMessageData(transaction.getMessageDataToSend());
                },
                ident: (data: any): AsyncToken<any> => {
                    const transaction: Transaction = TransactionFactory.createTransaction('ident', data, this.robotSerialName);
                    return this.sendTransactionMessageData(transaction.getMessageDataToSend());
                }
            },
            listen: {
                start: () => this.onListenToken,
                subscribe: {
                    hotword: () => this.onHotWordToken
                }
            }
        }
    }

    // let listenToken = this._robotConnection.requester.listen.start();
    // listenToken.update.on((listenResultEvent: JIBO.v1.ListenResultEvent | undefined) => {

    connect(): Promise<any> {
        return new Promise<any>((resolve: any, reject: any) => {
            this.startWebSocket();
            resolve();
        });
    }

    disconnect(): void {
        if (this.webSocket) {
            try {
                this.webSocket.close();
            } catch (e) {
                // console.log(e);
            }
            this.webSocket = null;
        }
    }

    startWebSocket() {
        // console.log(`startWebSocket: ${this.connectionString}`);
        this.disconnect();
        try {

            //connect to the certified web socket
            let cas = [cert];

            this.webSocket = new WebSocket(this.connectionString, {
                ca: cas,
                rejectUnauthorized: false, // if using a real certificate set this to true
                checkServerIdentity: ((servername: any, certificate: any) => {
                    // same as tls.connect() option:
                    //
                    // The method should return undefined if the servername and
                    // certificate are valid
                    var expected_cert_common_name = 'TBD';
                    // console.log(`certificate.subject.CN:`, certificate.subject.CN);

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

            this.webSocket.on('error', (e: any) => {
                this.emit('error', e);
                // console.log(`error:`, e);
            });

            this.webSocket.on('open', () => {
                let payload: HandshakeMessagePayload = {
                    status: `OK`,
                    connectionString: `${this.connectionString}`
                }
                this.sendHandshakeMessage(payload);
                this.emit('connected');
                // this.clockSync.start();
            });

            this.webSocket.on('message', (message: string, flags: any) => {
                // flags.binary will be set if a binary data is received.
                // flags.masked will be set if the data was masked.
                // console.log('received message: ',message);
                let json;
                try {
                    json = JSON.parse(message);
                } catch (e) {
                    // console.log('websocket onMessage: JSON.parse: ', e);
                    json = null;
                }
                if (json) {
                    // console.log('received json message: ', json);
                    // this.emit('message', json);
                    this.onMessage(json);
                }
            });

            this.webSocket.on('close', () => {
                // console.log('websocket client closed')
                this.webSocket = undefined;
                this.emit('closed');
            });

        } catch (err) {
            this.webSocket = undefined;
            // console.log(err);
        }
    }

    sendTransactionMessageData(messageData: TransactionMessageData): AsyncToken<any> {
        // console.log(`sendTransactionMessageData:`, messageData);
        const token: AsyncToken<any> = new AsyncToken<any>();
        messageData.client = 'robocommander';
        let message: any = {
            type: 'transaction', 
            command: messageData
        };
        token.complete = new Promise<any>((resolve: any, reject: any) => {
            if (this.webSocket) {
                let messageString: string = JSON.stringify(message);
                this.webSocket.send(messageString);
                // TODO actually handle async transaction responses to reslove
                setTimeout(() => {console.log(`resolving`); resolve()}, 1000); // simulate async response for now
                // resolve();
            } else {
                reject();
            }
        })
        return token;
    }
    
    sendHandshakeMessage(payload: HandshakeMessagePayload): AsyncToken<any> {
        // console.log(`sendHandshakeMessage:`, payload);
        const token: AsyncToken<any> = new AsyncToken<any>();
        let currentTime: number = new Date().getTime();
        let handshakeMessage: HandshakeMessage = {
            client: 'robocommander',
            type: 'handshake',
            payload: payload,
            timestamp: currentTime
        };
        token.complete = new Promise<any>((resolve: any, reject: any) => {
            if (this.webSocket) {
                let messageString: string = JSON.stringify(handshakeMessage);
                this.webSocket.send(messageString);
                resolve();
            } else {
                reject();
            }
        })
        return token;
    }

    onMessage(message: any): void {
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

    onRomEvent(message: any) {
        // console.log(`onRomEvent: message:`, message);
        switch (message.data.event) {
            case 'hotword':
                this.onHotWordToken.emit('hotWordHeard');
                break;
            case 'utterance':
                let result = {
                    Speech: message.data.data
                }
                this.onListenToken.emit('update', result);
                break;
            case 'nlu':
                // TODO use nlu when robokit provides it
                break;
        }
    }
}