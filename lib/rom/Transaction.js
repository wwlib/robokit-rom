"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
class Transaction extends events_1.EventEmitter {
    constructor(id, type, data, robotSerialName) {
        super();
        this.id = id;
        this.robotSerialName = robotSerialName;
        this.type = type;
        this.data = data;
        this.status = 'OK';
        this.sendTime = 0;
        this.receiptTime = 0;
        this.commandReceivedTime = 0;
        this.commandCompletedTime = 0;
    }
    getMessageDataToSend() {
        this.sendTime = new Date().getTime();
        let msg = {
            id: this.id,
            type: this.type,
            data: this.data,
            sendTime: this.sendTime,
        };
        return msg;
    }
    getMessageDataToLog() {
        let msg = {
            id: this.id,
            type: this.type,
            status: this.status,
            sendTime: this.sendTime,
            commandReceivedTime: this.commandReceivedTime,
            commandCompletedTime: this.commandCompletedTime,
            receiptTime: this.receiptTime
        };
        return msg;
    }
    onReceipt(payload) {
        this.receiptTime = new Date().getTime();
        this.receiptPayload = payload;
        this.commandReceivedTime = payload.commandReceivedTime;
        this.commandCompletedTime = payload.commandCompletedTime;
        this.emit('receipt', this);
    }
    destroy() {
        this.removeAllListeners();
        this.data = null;
        this.receiptPayload = null;
    }
}
exports.default = Transaction;
//# sourceMappingURL=Transaction.js.map