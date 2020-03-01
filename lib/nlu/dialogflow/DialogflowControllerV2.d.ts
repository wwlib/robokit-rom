import NLUController, { NLUIntentAndEntities } from '../../rom/NLUController';
export declare type DialogflowQueryInput = {
    text: {
        text: string;
        languageCode: string;
    };
};
export declare type DialogflowRequest = {
    session: any;
    queryInput: DialogflowQueryInput;
    queryParams?: any;
};
export declare type DialogflowOutputContext = {
    name: string;
    lifespanCount: number;
    parameters: {
        fields: any;
    };
};
export declare type DialogflowResponse = {
    fulfillmentMessages: any;
    outputContexts: any;
    queryText: string;
    speechRecognitionConfidence: number;
    action: string;
    parameters: any;
    allRequiredParamsPresent: boolean;
    fulfillmentText: string;
    webhookSource: string;
    webhookPayload: any;
    intent: any;
    intentDetectionConfidence: number;
    diagnosticInfo: any;
    languageCode: string;
};
export default class DialogflowControllerV2 extends NLUController {
    projectId: string;
    sessionId: string;
    sessionClient: any;
    sessionPath: any;
    private _config;
    constructor();
    set config(config: any);
    call(query: string, languageCode: string, context: string, sessionId?: string): Promise<any>;
    getFieldStringValue(field: any, defaultValue: string): string;
    getEntitiesWithResponse(response: DialogflowResponse): any;
    getIntentAndEntities(query: string, languageCode: string, context: string, sessionId?: string): Promise<NLUIntentAndEntities>;
}
