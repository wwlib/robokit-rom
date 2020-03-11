"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require('path');
const { NlpManager } = require('node-nlp');
const Logger_1 = require("../../Logger");
const NLUController_1 = require("../../rom/NLUController");
class NodeNlpController extends NLUController_1.default {
    // private _config: any = {};
    /**
     * @constructor
     */
    constructor(modelPath = '') {
        super();
        this._classifier = new NlpManager({ languages: ['en'] });
        this._ready = false;
        this.init(modelPath).then(() => {
            this._ready = true;
        });
    }
    set config(config) {
        if (config) {
            // this._config = config;
        }
        else {
            //
        }
    }
    init(modelPath = '') {
        return __awaiter(this, void 0, void 0, function* () {
            let inputPath = path.resolve(__dirname, '../../../data/model.nlp');
            if (modelPath) {
                inputPath = modelPath;
            }
            Logger_1.default.info([`NodeNlpController: init: loading: ${inputPath}`]);
            try {
                this._classifier.load(inputPath);
            }
            catch (err) {
                Logger_1.default.info([`NodeNlpController: init: NOT FOUND: ${inputPath}`]);
                yield this.generateModel();
            }
        });
    }
    generateModel(outputPath = '') {
        Logger_1.default.info([`NodeNlpController: generateModel: outputPath: ${outputPath}`]);
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
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
            yield this._classifier.train();
            if (outputPath) {
                this._classifier.save(outputPath);
            }
            resolve(outputPath);
        }));
    }
    call(query) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const response = yield this._classifier.process('en', query);
            resolve(response);
        }));
    }
    getEntitiesWithResponse(response) {
        let entitiesObject = {
            user: 'Someone',
            userOriginal: 'Someone',
            thing: 'that',
            thingOriginal: 'that',
            entities: undefined
        };
        if (response && response.entities) {
            entitiesObject.entities = response.entities;
            response.entities.forEach((entity) => {
                if (entity.entity === 'user') {
                    const user = entity.option || entity.utteranceText;
                    entitiesObject.user = user;
                    entitiesObject.userOriginal = entity.utteranceText;
                }
                else if (entity.entity === 'thing') {
                    const thing = entity.option || entity.utteranceText;
                    entitiesObject.thing = thing;
                    entitiesObject.thingOriginal = entity.utteranceText;
                }
            });
        }
        return entitiesObject;
    }
    getIntentAndEntities(query, languageCode, context, sessionId) {
        return new Promise((resolve, reject) => {
            let intentAndEntities = {
                intent: '',
                entities: undefined
            };
            if (this._ready) {
                this.call(query)
                    .then((response) => {
                    if (response && response.intent) {
                        intentAndEntities = {
                            intent: response.intent,
                            entities: this.getEntitiesWithResponse(response),
                        };
                    }
                    resolve(intentAndEntities);
                })
                    .catch((err) => {
                    reject(err);
                });
            }
            else {
                resolve(intentAndEntities);
            }
        });
    }
}
exports.default = NodeNlpController;
//# sourceMappingURL=NodeNlpController.js.map