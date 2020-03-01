"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Transaction_1 = require("./Transaction");
class TransactionFactory {
    static init() {
        TransactionFactory.transactions = new Map();
    }
    static getNextId() {
        return `${TransactionFactory.lastId++}`;
    }
    static createTransaction(type, data, robotSerialName) {
        let id = TransactionFactory.getNextId();
        let transaction = new Transaction_1.default(id, type, data, robotSerialName);
        TransactionFactory.transactions.set(id, transaction);
        return transaction;
    }
    static receiveTransaction(payload, status) {
        let id = payload.id;
        let transaction = TransactionFactory.transactions.get(id);
        if (transaction) {
            TransactionFactory.transactions.delete(id);
            transaction.status = status;
            transaction.onReceipt(payload);
        }
        return transaction;
    }
    static destroyTransaction(transaction) {
        TransactionFactory.transactions.delete(transaction.id);
        transaction.destroy();
    }
}
exports.default = TransactionFactory;
TransactionFactory.lastId = 0;
//# sourceMappingURL=TransactionFactory.js.map