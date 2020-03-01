import NLUController, { NLUIntentAndEntities } from '../../rom/NLUController';
export declare type DialogflowResponseResultMetadata = {
    intentId: string;
    webhookUsed: boolean;
    webhookForSlotFillingUsed: boolean;
    intentName: string;
};
export declare type DialogflowResponseResultFulfillment = {
    speech: string;
    messages: any;
};
export declare type DialogflowResponseStatus = {
    code: number;
    errorType: string;
    webhookTimedOut: boolean;
};
export declare type DialogflowResponseResult = {
    source: string;
    resolvedQuery: string;
    action: string;
    actionIncomplete: boolean;
    parameters: any;
    contexts: any[];
    metadata: DialogflowResponseResultMetadata;
    fulfillment: DialogflowResponseResultFulfillment;
    score: number;
};
export declare type DialogflowResponse = {
    id: string;
    timestamp: string;
    lang: string;
    result: DialogflowResponseResult;
    status: DialogflowResponseStatus;
    sessionId: number;
};
export default class DialogflowControllerV1 extends NLUController {
    apiAuthorization: string;
    private _config;
    /**
     * @constructor
     */
    constructor();
    set config(config: any);
    call(query: string, languageCode: string, context: string, sessionId?: string): Promise<any>;
    getEntitiesWithResponse(response: any): any | undefined;
    getIntentAndEntities(query: string, languageCode: string, context: string, sessionId?: string): Promise<NLUIntentAndEntities>;
}
