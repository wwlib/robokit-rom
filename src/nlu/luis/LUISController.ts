import NLUController, {
    NLUIntentAndEntities
} from '../../rom/NLUController';

const request = require('request');
const querystring = require('querystring');

// const config: any = {}; //require('../data/config.json');

export type LUISIntent = {
    intent: string;
    score: number;
};

export type LUISEntity = {
    entity: string;
    type: string;
    startIndex: number;
    endIndex: number;
    resolution: {
        values: string[];
    }
}

export type LUISResponse = {
    query: string;
    topScoringIntent: LUISIntent;
    intents: LUISIntent[];
    entities: LUISEntity[];
}

export default class LUISController extends NLUController {

    public endpoint: string = ''; //config.luis.endpoint;
    public luisAppId: string = ''; //config.luis.appId;
    public subscriptionKey: string = ''; //config.luis.subscriptionKey;

    private _config: any = {};

    /**
     * @constructor
     */
     constructor() {
         super();
     }

     set config(config: any) {
         if (config && config.nluLUISEndpoint && config.nluLUISAppId && config.nluLUISSubscriptionKey) {
             this._config = config;
             this.endpoint = this._config.nluLUISEndpoint;
             this.luisAppId = this._config.nluLUISAppId;
             this.subscriptionKey = this._config.nluLUISSubscriptionKey;
         } else {
             console.log(`LUISController: set config: error: incomplete config:`, config);
         }
     }

    call(query: string): Promise<any> {
        // console.log(`LUISController: ${query}`);
        let endpoint = this.endpoint;
        let luisAppId = this.luisAppId;
        let queryParams = {
            "subscription-key": this.subscriptionKey,
            "timezoneOffset": "0",
            "verbose": true,
            "q": query
        }

        let luisRequest = endpoint + luisAppId + '?' + querystring.stringify(queryParams);

        return new Promise((resolve, reject) => {
            request(luisRequest,
                ((error: string, response: any, body: any) => {
                    if (error) {
                        console.log(`LUISController: call: error:`, response, error);
                        reject(error);
                    } else {
                        console.log(`LUISController: call:`, response, error);
                        let body_obj: any = JSON.parse(body);
                        resolve(body_obj);
                    }
                }));
        });
    }

    getEntitiesWithResponse(response: LUISResponse): any {
        let entitiesObject: any = {
            user: 'Someone',
            userOriginal: 'Someone',
            thing: 'that',
            thingOriginal: 'that'
        };

        response.entities.forEach((entity: LUISEntity) => {
            entitiesObject[`${entity.type}Original`] = entity.entity;
            if (entity.resolution && entity.resolution.values) {
                entitiesObject[`${entity.type}`] = entity.resolution.values[0];
            }
        });

        return entitiesObject;
    }

    getIntentAndEntities(query: string, languageCode: string, context: string, sessionId?: string): Promise<NLUIntentAndEntities> {
        return new Promise((resolve, reject) => {
            this.call(query)
                .then((response: LUISResponse) => {
                    let intentAndEntities: NLUIntentAndEntities = {
                        intent: '',
                        entities: undefined
                    }
                    if (response && response.topScoringIntent) {
                        intentAndEntities = {
                            intent: response.topScoringIntent.intent,
                            entities: this.getEntitiesWithResponse(response)
                        }
                    }
                    resolve(intentAndEntities);
                })
                .catch((err: any) => {
                    reject(err);
                })
        })
    }
}
