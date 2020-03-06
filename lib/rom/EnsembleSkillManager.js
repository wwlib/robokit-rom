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
    getEnsembleSkills() {
        const skills = Array.from(this.ensembleSkillMap.values());
        return skills;
    }
    status() {
        const skills = Array.from(this.ensembleSkillMap.values());
        const data = [];
        skills.forEach((skill) => {
            data.push(skill.status());
        });
        return data;
    }
}
exports.default = EnsembleSkillManager;
//# sourceMappingURL=EnsembleSkillManager.js.map