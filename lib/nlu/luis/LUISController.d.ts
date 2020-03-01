import NLUController, { NLUIntentAndEntities } from '../../rom/NLUController';
export declare type LUISIntent = {
    intent: string;
    score: number;
};
export declare type LUISEntity = {
    entity: string;
    type: string;
    startIndex: number;
    endIndex: number;
    resolution: {
        values: string[];
    };
};
export declare type LUISResponse = {
    query: string;
    topScoringIntent: LUISIntent;
    intents: LUISIntent[];
    entities: LUISEntity[];
};
export default class LUISController extends NLUController {
    endpoint: string;
    luisAppId: string;
    subscriptionKey: string;
    private _config;
    /**
     * @constructor
     */
    constructor();
    set config(config: any);
    call(query: string): Promise<any>;
    getEntitiesWithResponse(response: LUISResponse): any;
    getIntentAndEntities(query: string, languageCode: string, context: string, sessionId?: string): Promise<NLUIntentAndEntities>;
}
