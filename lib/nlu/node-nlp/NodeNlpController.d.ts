import NLUController, { NLUIntentAndEntities } from '../../rom/NLUController';
export declare type NodeNlpIntent = {
    intent: string;
    score: number;
};
export declare type NodeNlpEntity = {
    start: number;
    end: number;
    len: number;
    accuracy: number;
    entity: string;
    type: string;
    option: string;
    sourceText: string;
    utteranceText: string;
    resolution: any;
};
export declare type NodeNlpClassification = {
    intent: string;
    score: number;
};
export declare type NodeNlpSentiment = {
    score: number;
    numWords: number;
    numHits: number;
    average: number;
    type: string;
    locale: string;
    vote: string;
};
export declare type NodeNlpResponse = {
    locale: string;
    utterance: string;
    languageGuessed: boolean;
    localeIso2: string;
    language: string;
    classifications: NodeNlpClassification[];
    intent: string;
    score: number;
    domain: string;
    sourceEntities: [];
    entities: NodeNlpEntity[];
    answers: [];
    answer: undefined;
    actions: [];
    sentiment: NodeNlpSentiment;
};
export default class NodeNlpController extends NLUController {
    private _classifier;
    private _ready;
    /**
     * @constructor
     */
    constructor(modelPath?: string);
    set config(config: any);
    init(modelPath?: string): Promise<void>;
    generateModel(outputPath?: string): Promise<unknown>;
    call(query: string): Promise<NodeNlpResponse>;
    getEntitiesWithResponse(response: NodeNlpResponse): any;
    getIntentAndEntities(query: string, languageCode: string, context: string, sessionId?: string): Promise<NLUIntentAndEntities>;
}
