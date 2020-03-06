import EnsembleSkill from './EnsembleSkill';
import ClockEnsembleSkill from './ClockEnsembleSkill';

export default class EnsembleSkillManager {

    public ensembleSkillMap: Map<string, EnsembleSkill>;

    private static _instance: EnsembleSkillManager;

    private constructor(){
        this.ensembleSkillMap = new Map<string, EnsembleSkill>();

        this.addEnsembleSkill(new ClockEnsembleSkill('clockEnsemble', 'launchClock'));
    }

    public static get Instance()
    {
        // Do you need arguments? Make it a regular method instead.
        return this._instance || (this._instance = new this());
    }

    addEnsembleSkill(ensembleSkill: EnsembleSkill): void {
        this.ensembleSkillMap.set(ensembleSkill.id, ensembleSkill);
    }

    getEnsembleSkillWithId(id: string): EnsembleSkill | undefined {
        return this.ensembleSkillMap.get(id);
    }

    getEnsembleSkills(): EnsembleSkill[] {
        const skills: EnsembleSkill[] = Array.from( this.ensembleSkillMap.values());
        return skills;
    }

    status(): any {
        const skills: EnsembleSkill[] = Array.from( this.ensembleSkillMap.values());
        const data: any[] = [];
        skills.forEach((skill: EnsembleSkill) => {
            data.push(skill.status());
        });
        return data;
    }
}
