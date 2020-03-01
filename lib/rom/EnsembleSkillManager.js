"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ClockEnsembleSkill_1 = require("./ClockEnsembleSkill");
class EnsembleSkillManager {
    constructor() {
        this.ensembleSkillMap = new Map();
        this.addEnsembleSkill(new ClockEnsembleSkill_1.default('clockEnsemble', 'launchClock'));
    }
    static get Instance() {
        // Do you need arguments? Make it a regular method instead.
        return this._instance || (this._instance = new this());
    }
    addEnsembleSkill(ensembleSkill) {
        this.ensembleSkillMap.set(ensembleSkill.id, ensembleSkill);
    }
    getEnsembleSkillWithId(id) {
        return this.ensembleSkillMap.get(id);
    }
}
exports.default = EnsembleSkillManager;
//# sourceMappingURL=EnsembleSkillManager.js.map