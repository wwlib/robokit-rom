import { ChatbotSession } from './ChatbotSession';
export default class MockChatbotSession extends ChatbotSession {
    transactionCount: number;
    inputs: string[];
    constructor();
    init(): Promise<any>;
    getNextResponse(input: string): Promise<any>;
}
