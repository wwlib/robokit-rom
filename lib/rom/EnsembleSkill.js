"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Skill_1 = require("./Skill");
// import Robot from '../model/Robot';
class EnsembleSkill extends Skill_1.default {
    constructor(id, launchIntent) {
        super(undefined, id, launchIntent);
        this.hubMap = new Map();
    }
    addHub(hub) {
        this.hubMap.set(hub.robotSerialName, hub);
    }
    getShuffledArrayOfHubs() {
        return this.shuffleInPlace(Array.from(this.hubMap.values()));
    }
    shuffleInPlace(array) {
        if (array.length <= 1)
            return array;
        for (let i = 0; i < array.length; i++) {
            const randomChoiceIndex = this.getRandomInt(i, array.length - 1);
            [array[i], array[randomChoiceIndex]] = [array[randomChoiceIndex], array[i]];
        }
        return array;
    }
    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
    }
}
exports.default = EnsembleSkill;
//# sourceMappingURL=EnsembleSkill.js.map