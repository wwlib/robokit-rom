"use strict";
// https://github.com/dialogflow/dialogflow-nodejs-client-v2
// https://medium.com/@tzahi/how-to-setup-dialogflow-v2-authentication-programmatically-with-node-js-b37fa4815d89
// https://dialogflow.com/docs/reference/v1-v2-mapping
// https://github.com/dialogflow/dialogflow-nodejs-client-v2/issues/64
Object.defineProperty(exports, "__esModule", { value: true });
const NLUController_1 = require("../../rom/NLUController");
const dialogflow = require('dialogflow');
class DialogflowControllerV2 extends NLUController_1.default {
    constructor() {
        super();
        this.projectId = ''; //https://dialogflow.com/docs/agents#settings
        this.sessionId = 'temp-session-id';
        this._config = {};
    }
    set config(config) {
        if (config && config.nluDialogflow_privateKey && config.nluDialogflow_clientEmail) {
            this._config = config;
            let clientConfig = {
                credentials: {
                    private_key: this._config.nluDialogflow_privateKey,
                    client_email: this._config.nluDialogflow_clientEmail
                }
            };
            // console.log(`DialogflowControllerV2: constructor: config:`, config);
            this.sessionClient = new dialogflow.SessionsClient(clientConfig);
            // console.log(this.sessionClient);
        }
        else {
            console.log(`DialogflowControllerV2: set config: error: incomplete config:`, config);
        }
    }
    call(query, languageCode, context, sessionId) {
        // console.log(`DialogflowControllerV2: call: `, query, languageCode, sessionId);
        sessionId = sessionId || this.sessionId;
        this.sessionPath = this.sessionClient.sessionPath(this.projectId, sessionId);
        // Send request and log result
        let request = {
            session: this.sessionPath,
            queryInput: {
                text: {
                    text: query,
                    languageCode: languageCode,
                },
            }
        };
        let contextObject;
        if (context) {
            contextObject = {
                name: `${this.sessionPath}/contexts/${context}`,
                lifespanCount: 5
            };
            request.queryParams = {
                contexts: [
                    contextObject
                ]
            };
        }
        // console.log(`DialogflowControllerV2: call: request: `, contextObject, request);
        return new Promise((resolve, reject) => {
            this.sessionClient
                .detectIntent(request)
                .then((responses) => {
                // console.log('Detected intent');
                const result = responses[0].queryResult;
                // console.log(`  Query: ${result.queryText}`);
                // console.log(`  Response: ${result.fulfillmentText}`);
                // if (result.intent) {
                //   console.log(`  Intent: ${result.intent.displayName}`);
                // } else {
                //   console.log(`  No intent matched.`);
                // }
                resolve(result);
            })
                .catch((err) => {
                // console.error('ERROR:', err);
                reject(err);
            });
        });
    }
    getFieldStringValue(field, defaultValue) {
        let result = defaultValue;
        if (field && field.kind && (field.kind === 'stringValue') && field.stringValue) {
            result = field.stringValue;
        }
        return result;
    }
    getEntitiesWithResponse(response) {
        let entitiesObject = {
            user: 'Someone',
            userOriginal: 'Someone',
            thing: 'that',
            thingOriginal: 'that'
        };
        let fields;
        if (response && response.outputContexts && response.outputContexts[0] && response.outputContexts[0].parameters && response.outputContexts[0].parameters.fields) {
            fields = response.outputContexts[0].parameters.fields;
            if (fields) {
                entitiesObject.user = this.getFieldStringValue(fields['user'], entitiesObject.user);
                entitiesObject.userOriginal = this.getFieldStringValue(fields['user.original'], entitiesObject.userOriginal);
                entitiesObject.thing = this.getFieldStringValue(fields['thing'], entitiesObject.thing);
                entitiesObject.thingOriginal = this.getFieldStringValue(fields['thing.original'], entitiesObject.thingOriginal);
            }
        }
        else if (response && response.parameters && response.parameters.fields) {
            fields = response.parameters.fields;
            entitiesObject.thing = this.getFieldStringValue(fields['thing'], entitiesObject.thing);
            entitiesObject.thingOriginal = this.getFieldStringValue(fields['thing'], entitiesObject.thingOriginal);
        }
        return entitiesObject;
    }
    getIntentAndEntities(query, languageCode, context, sessionId) {
        return new Promise((resolve, reject) => {
            this.call(query, languageCode, context, sessionId)
                .then((response) => {
                let intentAndEntities = {
                    intent: response.intent.displayName,
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
exports.default = DialogflowControllerV2;
//# sourceMappingURL=DialogflowControllerV2.js.map