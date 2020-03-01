import Transaction from './Transaction';
export default class TransactionFactory {
    static transactions: Map<string, Transaction>;
    static lastId: number;
    static init(): void;
    static getNextId(): string;
    static createTransaction(type: string, data: any, robotSerialName: string): Transaction;
    static receiveTransaction(payload: any, status: string): Transaction | undefined;
    static destroyTransaction(transaction: Transaction): void;
}
