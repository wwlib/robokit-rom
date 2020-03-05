export interface RomCommandData {
    name: string;
    type: string;
    data: any;
    keyCode?: string;
}

// { "name": "Anim: Celebrate_01", "type": "animation", "data": { "file": "Celebrate_01.keys"} }

export default class RomCommand {

    public name: string = '';
    public type: string = '';
    public data: any;
    public keyCode: string = '';

    constructor(name?: string, type?: string, data?: any, keyCode?: string) {
        this.initWithData({
            name: name || '',
            type: type || '',
            data: data,
            keyCode: keyCode || ''
        })
    }

    initWithData(data: RomCommandData): void {
        this.name = data.name;
        this.type = data.type;
        this.data = data.data;
        this.keyCode = data.keyCode || '';
    }

    get json(): RomCommandData {
        let json: RomCommandData = {
            name: this.name,
            type: this.type,
            data: this.data,
            keyCode: this.keyCode,
        };
        return json;
    }
}
