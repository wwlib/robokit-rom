"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NLUController_1 = require("../../rom/NLUController");
const request = require('request');
const querystring = require('querystring');
class LUISController extends NLUController_1.default {
    /**
     * @constructor
     */
    constructor() {
        super();
        this.endpoint = ''; //config.luis.endpoint;
        this.luisAppId = ''; //config.luis.appId;
        this.subscriptionKey = ''; //config.luis.subscriptionKey;
        this._config = {};
    }
    set config(config) {
        if (config && config.nluLUISEndpoint && config.nluLUISAppId && config.nluLUISSubscriptionKey) {
            this._config = config;
            this.endpoint = this._config.nluLUISEndpoint;
            this.luisAppId = this._config.nluLUISAppId;
            this.subscriptionKey = this._config.nluLUISSubscriptionKey;
        }
        else {
            //  console.log(`LUISController: set config: error: incomplete config:`, config);
        }
    }
    call(query) {
        // console.log(`LUISController: ${query}`);
        let endpoint = this.endpoint;
        let luisAppId = this.luisAppId;
        let queryParams = {
            "subscription-key": this.subscriptionKey,
            "timezoneOffset": "0",
            "verbose": true,
            "q": query
        };
        let luisRequest = endpoint + luisAppId + '?' + querystring.stringify(queryParams);
        return new Promise((resolve, reject) => {
            request(luisRequest, ((error, response, body) => {
                if (error) {
                    // console.log(`LUISController: call: error:`, response, error);
                    reject(error);
                }
                else {
                    // console.log(`LUISController: call:`, response, error);
                    let body_obj = JSON.parse(body);
                    resolve(body_obj);
                }
            }));
        });
    }
    getEntitiesWithResponse(response) {
        let entitiesObject = {
            user: 'Someone',
            userOriginal: 'Someone',
            thing: 'that',
            thingOriginal: 'that'
        };
        response.entities.forEach((entity) => {
            entitiesObject[`${entity.type}Original`] = entity.entity;
            if (entity.resolution && entity.resolution.values) {
                entitiesObject[`${entity.type}`] = entity.resolution.values[0];
            }
        });
        return entitiesObject;
    }
    getIntentAndEntities(query, languageCode, context, sessionId) {
        return new Promise((resolve, reject) => {
            this.call(query)
                .then((response) => {
                let intentAndEntities = {
                    intent: '',
                    entities: undefined
                };
                if (response && response.topScoringIntent) {
                    intentAndEntities = {
                        intent: response.topScoringIntent.intent,
                        entities: this.getEntitiesWithResponse(response)
                    };
                }
                resolve(intentAndEntities);
            })
                .catch((err) => {
                reject(err);
            });
        });
    }
}
exports.default = LUISController;
//# sourceMappingURL=LUISController.js.map