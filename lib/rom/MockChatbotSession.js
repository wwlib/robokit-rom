"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ChatbotSession_1 = require("./ChatbotSession");
class MockChatbotSession extends ChatbotSession_1.ChatbotSession {
    constructor() {
        super();
        this.transactionCount = 0;
        this.inputs = [];
        this.status = ChatbotSession_1.ChatbotStatus.IDLE;
    }
    init() {
        return new Promise((resolve, reject) => {
            let prompt = `OK. Let's pretend we're talking to a chatbot.`;
            resolve(prompt);
        });
    }
    getNextResponse(input) {
        return new Promise((resolve, reject) => {
            this.inputs.push(input);
            this.status = ChatbotSession_1.ChatbotStatus.REQUESTING_NEXT_PROMPT;
            this.currentPrompt = 'How many travelers are in your party?';
            setTimeout(() => {
                this.status = ChatbotSession_1.ChatbotStatus.RECEIVED_PROMPT;
                if (this.transactionCount++ >= 3) {
                    this.status = ChatbotSession_1.ChatbotStatus.SUCCEEDED;
                }
                resolve(this);
            }, 2000);
        });
    }
}
exports.default = MockChatbotSession;
//# sourceMappingURL=MockChatbotSession.js.map