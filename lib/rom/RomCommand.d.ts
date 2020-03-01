export interface RomCommandData {
    name: string;
    type: string;
    data: any;
}
export default class RomCommand {
    name: string;
    type: string;
    data: any;
    constructor(name?: string, type?: string, data?: any);
    initWithData(data: RomCommandData): void;
    get json(): RomCommandData;
}
