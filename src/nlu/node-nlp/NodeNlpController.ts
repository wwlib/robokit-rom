const path = require('path');
const { NlpManager } = require('node-nlp');

import Logger from '../../Logger';
import NLUController, {
    NLUIntentAndEntities
} from '../../rom/NLUController';

export type NodeNlpIntent = {
    intent: string;
    score: number;
};

export type NodeNlpEntity = {
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
}

export type NodeNlpClassification = {
    intent: string;
    score: number;
}

export type NodeNlpSentiment = {
    score: number;
    numWords: number;
    numHits: number;
    average: number;
    type: string;
    locale: string;
    vote: string;
}

export type NodeNlpResponse = {
    locale: string;
    utterance: string;
    languageGuessed: boolean;
    localeIso2: string;
    language: string;
    classifications: NodeNlpClassification[];
    intent: string;
    score: number;
    domain: string;
    sourceEntities: [],
    entities: NodeNlpEntity[],
    answers: [],
    answer: undefined,
    actions: [],
    sentiment: NodeNlpSentiment,
}

export default class NodeNlpController extends NLUController {

    private _classifier: any;
    private _ready: boolean;
    // private _config: any = {};

    /**
     * @constructor
     */
    constructor(modelPath: string = '') {
        super();
        this._classifier = new NlpManager({ languages: ['en'] });
        this._ready = false;
        this.init(modelPath).then(() => {
            this._ready = true;
        });
    }

    set config(config: any) {
        if (config) {
            // this._config = config;
        } else {
            //
        }
    }

    async init(modelPath: string = '') {
        let inputPath: string = path.resolve(__dirname, '../../../data/model.nlp');
        if (modelPath) {
            inputPath = modelPath;
        }
        Logger.info([`NodeNlpController: init: loading: ${inputPath}`]);
        try {
            this._classifier.load(inputPath);
        } catch (err) {
            Logger.info([`NodeNlpController: init: NOT FOUND: ${inputPath}`]);
            await this.generateModel();
        }
    }

    generateModel(outputPath: string = '') {
        Logger.info([`NodeNlpController: generateModel: outputPath: ${outputPath}`]);
        return new Promise(async (resolve, reject) => {
            this._classifier.addDocument('en', "what time is it", 'launchClock');
            this._classifier.addDocument('en', "what is the time", 'launchClock');
            this._classifier.addDocument('en', "what's the time", 'launchClock');
            this._classifier.addDocument('en', "tell me a joke", 'launchJoke');
            this._classifier.addDocument('en', "tell us a joke", 'launchJoke');
            this._classifier.addDocument('en', "do you know any jokes", 'launchJoke');
            this._classifier.addDocument('en', "let's hear a joke", 'launchJoke');
            this._classifier.addDocument('en', "who are you", 'launchIdent');
            this._classifier.addDocument('en', "what is your name", 'launchIdent');
            this._classifier.addDocument('en', "what's your name", 'launchIdent');
            this._classifier.addDocument('en', "track my face", 'launchFaces');
            this._classifier.addDocument('en', "watch my face", 'launchFaces');
            this._classifier.addDocument('en', "watch me", 'launchFaces');
            this._classifier.addDocument('en', "track my face", 'launchFaces');
            this._classifier.addDocument('en', "give me a status report", 'launchStatus');
            this._classifier.addDocument('en', "what is your status", 'launchStatus');
            this._classifier.addDocument('en', "what's your status", 'launchStatus');
            this._classifier.addDocument('en', "it's andrew", 'launchGreeting');
            this._classifier.addDocument('en', "it's me, martin", 'launchGreeting');

            this._classifier.nlp.addNerRuleOptionTexts('en', 'user', 'Andrew', 'andrew');
            this._classifier.nlp.addNerRuleOptionTexts('en', 'user', 'Martin', 'martin');
            this._classifier.nlp.addNerRuleOptionTexts('en', 'user', 'Jesus', 'jesus');
            this._classifier.nlp.addNerRuleOptionTexts('en', 'user', 'Rick', 'rick');

            await this._classifier.train();
            if (outputPath) {
                this._classifier.save(outputPath);
            }
            resolve(outputPath);
        });
    }

    call(query: string): Promise<NodeNlpResponse> {
        return new Promise<NodeNlpResponse>(async (resolve, reject) => {
            const response: NodeNlpResponse = await this._classifier.process('en', query);
            resolve(response);
        });
    }

    getEntitiesWithResponse(response: NodeNlpResponse): any {
        let entitiesObject: any = {
            user: 'Someone',
            userOriginal: 'Someone',
            thing: 'that',
            thingOriginal: 'that',
            entities: undefined
        };

        if (response && response.entities) {
            entitiesObject.entities = response.entities;
            response.entities.forEach((entity: NodeNlpEntity) => {
                if (entity.entity === 'user') {
                    const user: string = entity.option || entity.utteranceText;
                    entitiesObject.user = user;
                    entitiesObject.userOriginal = entity.utteranceText;
                } else if (entity.entity === 'thing') {
                    const thing: string = entity.option || entity.utteranceText;
                    entitiesObject.thing = thing;
                    entitiesObject.thingOriginal = entity.utteranceText;
                }
            });
        }
        return entitiesObject;
    }

    getIntentAndEntities(query: string, languageCode: string, context: string, sessionId?: string): Promise<NLUIntentAndEntities> {
        return new Promise((resolve, reject) => {
            let intentAndEntities: NLUIntentAndEntities = {
                intent: '',
                entities: undefined
            }
            if (this._ready) {
                this.call(query)
                    .then((response: NodeNlpResponse) => {
                        if (response && response.intent) {
                            intentAndEntities = {
                                intent: response.intent,
                                entities: this.getEntitiesWithResponse(response),
                            }
                        }
                        resolve(intentAndEntities);
                    })
                    .catch((err: any) => {
                        reject(err);
                    });
            } else {
                resolve(intentAndEntities);
            }

        })
    }
}
