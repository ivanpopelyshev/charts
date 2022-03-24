import {IArrayChainData, IData, IDataFetchResult, IDataProvider, IObjectData} from "../ISeriesDataOptions";
import {toNumberOrNaN} from "./utils";

export class ArrayChainDataProvider implements IDataProvider {

    constructor (
        public data: IData
    ) {}

    protected _fetchValueInternal (index: number): IObjectData[0] {
        const chain = this.data as IArrayChainData;
        const entry = chain[index];

        return {
            x: +entry[0],
            y: toNumberOrNaN(entry[1]),
            labelX: entry[0],
            labelY: entry[1],
            index
        };
    }

    fetch(from: number = 0, to?: number): IDataFetchResult<IObjectData>{
        const chain = this.data as IArrayChainData;

        to = to || (chain.length);
        to = Math.min(chain.length, Math.max(from, to));

        const data = [];

        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        for (let i = 0; i < to - from; i ++) {
            data[i] = this._fetchValueInternal(i + from);

            minX = Math.min(data[i].x, minX);
            maxX = Math.max(data[i].x, maxX);
            if (!isNaN(data[i].y)) {
                minY = Math.min(data[i].y, minY);
                maxY = Math.max(data[i].y, maxY);
            }
        }

        return Object.freeze({
            data: data,
            fromX: from,
            toX: to,
            dataBounds: Object.freeze({
                fromX: minX,
                fromY: minY,
                toX: maxX,
                toY: maxY
            })
        });
    }
}

