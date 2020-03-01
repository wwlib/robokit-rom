/// <reference types="node" />
import { EventEmitter } from "events";
import AsyncToken from './AsyncToken';
import AsyncTokenHotword from './AsyncTokenHotword';
import { TransactionMessageData } from '../rom/Transaction';
export declare type HandshakeMessagePayload = {
    status: string;
    connectionString: string;
};
export declare type HandshakeMessage = {
    client: string;
    type: string;
    payload: HandshakeMessagePayload;
    timestamp: number;
};
export default class RobokitConnection extends EventEmitter {
    hostname: string;
    port: number;
    connectionString: string;
    webSocket: any;
    robotSerialName: string;
    onHotWordToken: AsyncTokenHotword<any>;
    onListenToken: AsyncToken<any>;
    requester: any;
    constructor(hostname?: string, port?: number);
    connect(): Promise<any>;
    disconnect(): void;
    startWebSocket(): void;
    sendTransactionMessageData(messageData: TransactionMessageData): AsyncToken<any>;
    sendHandshakeMessage(payload: HandshakeMessagePayload): AsyncToken<any>;
    onMessage(message: any): void;
    onRomEvent(message: any): void;
}
