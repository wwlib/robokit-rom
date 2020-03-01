export declare enum ChatbotStatus {
    INVALID = 0,
    IDLE = 1,
    REQUESTING_NEXT_PROMPT = 2,
    RECEIVED_PROMPT = 3,
    ERROR = 4,
    SUCCEEDED = 5,
    COMPLETED = 6
}
export interface ChatbotResponse {
    prompt: string;
    status: ChatbotStatus;
    data: any;
}
export declare abstract class ChatbotSession {
    debug: boolean;
    status: ChatbotStatus;
    currentPrompt: string;
    abstract init(): Promise<any>;
    abstract getNextResponse(input: string | number): Promise<any>;
}
