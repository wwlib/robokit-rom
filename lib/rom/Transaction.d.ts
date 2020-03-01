/// <reference types="node" />
import { EventEmitter } from 'events';
export declare type TransactionMessageData = {
    client?: string;
    id: number;
    type: string;
    data: any;
    sendTime: number;
};
export default class Transaction extends EventEmitter {
    id: string;
    robotSerialName: string;
    status: string;
    type: string;
    data: any;
    sendTime: number;
    receiptTime: number;
    commandReceivedTime: number;
    commandCompletedTime: number;
    receiptPayload: any;
    constructor(id: string, type: string, data: any, robotSerialName: string);
    getMessageDataToSend(): TransactionMessageData;
    getMessageDataToLog(): any;
    onReceipt(payload: any): void;
    destroy(): void;
}
