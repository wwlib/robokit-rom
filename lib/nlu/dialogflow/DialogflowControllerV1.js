"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NLUController_1 = require("../../rom/NLUController");
const request = require('request');
class DialogflowControllerV1 extends NLUController_1.default {
    /**
     * @constructor
     */
    constructor() {
        super();
        this.apiAuthorization = ''; //`Bearer ${config.dialogflow.clientToken}`;
        this._config = {};
    }
    set config(config) {
        if (config && config.nluDialogflowClientToken) {
            this._config = config;
            this.apiAuthorization = `Bearer ${this._config.nluDialogflowClientToken}`;
        }
        else {
            console.log(`DialogflowControllerV1: set config: error: incomplete config:`, config);
        }
    }
    // let latitude: string = '42.361145';
    // let longitude: string = '-71.057083';
    // let timezone: string = 'America/New_York';
    call(query, languageCode, context, sessionId) {
        // call(query:string, latitude:string, longitude:string, sessionId:string, iana_timezone:string, contexts: string[]): Promise<any> {
        let data = {
            "query": query,
            "lang": "en",
            "sessionId": sessionId,
            "location": {
                "latitude": Number('42.361145'),
                "longitude": Number('-71.057083'),
            },
            "timezone": 'America/New_York'
        };
        if (context) {
            data.contexts = [context];
        }
        // let raw_url = "";
        return new Promise((resolve, reject) => {
            request.post({
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    "Authorization": `${this.apiAuthorization}`
                },
                url: 'https://api.api.ai/v1/query?v=20150910',
                body: JSON.stringify(data)
            }, (error, response, body) => {
                if (error) {
                    //console.log(error);
                    reject(error);
                }
                else {
                    let body_obj = JSON.parse(body);
                    resolve(body_obj);
                }
            });
        });
    }
    getEntitiesWithResponse(response) {
        let entitiesObject = {
            user: 'Someone',
            userOriginal: 'Someone',
            thing: 'that',
            thingOriginal: 'that'
        };
        let result = response.result;
        let parameters;
        if (result && result.contexts && result.contexts[0]) {
            parameters = result.contexts[0].parameters;
            if (parameters) {
                entitiesObject.user = parameters['user'] || entitiesObject.user;
                entitiesObject.userOriginal = parameters['user.original'] || entitiesObject.userOriginal;
                entitiesObject.thing = parameters['thing'] || entitiesObject.thing;
                entitiesObject.thingOriginal = parameters['thing.original'] || entitiesObject.thingOriginal;
            }
        }
        else if (result && result.parameters) {
            entitiesObject.thing = result.parameters['thing'] || entitiesObject.thing;
            entitiesObject.thingOriginal = result.parameters['thing'] || entitiesObject.thingOriginal;
        }
        return entitiesObject;
    }
    getIntentAndEntities(query, languageCode, context, sessionId) {
        return new Promise((resolve, reject) => {
            this.call(query, languageCode, context, sessionId)
                .then((response) => {
                let result = response.result;
                let metadata = result.metadata;
                let intent = metadata.intentName;
                let intentAndEntities = {
                    intent: intent,
                    entities: this.getEntitiesWithResponse(response)
                };
                resolve(intentAndEntities);
            })
                .catch((err) => {
                reject(err);
            });
        });
    }
}
exports.default = DialogflowControllerV1;
//# sourceMappingURL=DialogflowControllerV1.js.map