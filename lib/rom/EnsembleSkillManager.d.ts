import EnsembleSkill from './EnsembleSkill';
export default class EnsembleSkillManager {
    ensembleSkillMap: Map<string, EnsembleSkill>;
    private static _instance;
    private constructor();
    static get Instance(): EnsembleSkillManager;
    addEnsembleSkill(ensembleSkill: EnsembleSkill): void;
    getEnsembleSkillWithId(id: string): EnsembleSkill | undefined;
    getEnsembleSkills(): EnsembleSkill[];
    status(): any;
}
