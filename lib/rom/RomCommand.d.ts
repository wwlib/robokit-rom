export interface RomCommandData {
    name: string;
    type: string;
    data: any;
    keyCode?: string;
}
export default class RomCommand {
    name: string;
    type: string;
    data: any;
    keyCode: string;
    constructor(name?: string, type?: string, data?: any, keyCode?: string);
    initWithData(data: RomCommandData): void;
    get json(): RomCommandData;
}
