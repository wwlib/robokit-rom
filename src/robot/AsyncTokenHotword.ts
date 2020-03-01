import AsyncToken from './AsyncToken';

export default class AsyncTokenHotword<T> extends AsyncToken<any> {

    public hotWordHeard: any = {
        on: (callback: any) => {
            this.on('hotWordHeard', callback);
        }
    }

    constructor() {
        super();
    }
}
