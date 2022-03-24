import {IArrayChainData, IData, IDataFetchResult, IDataProvider, ILabelData, IObjectData} from "../ISeriesDataOptions";
import {toNumberOrNaN} from "./utils";

export class ArrayLikeDataProvider implements IDataProvider {
    constructor(
        public data: IData,
        public readonly label = false,
        public step = 10) {}

    fetch (from: number = 0, to: number = this.data.length - 1): IDataFetchResult<IObjectData> {
        const arrayLike = this.data as Array<any>;

        to = to || (arrayLike.length - 1);
        to = Math.min(arrayLike.length - 1, Math.max(from, to));

        if (this.label) {
            return {
                data: arrayLike.slice(from, to) as IObjectData,
                fromX: from,
                toX: to,
                dataBounds: {
                    // @todo Compute bounds for label data
                    fromX: 0, toX: 0, fromY: 0, toY: 0,
                }
            };
        }

        let minY = Infinity;
        let maxY = -Infinity;

        const data = arrayLike.slice(from, to)
                .map((e: number, i) => {
                    e = toNumberOrNaN(e);
                    if (!isNaN(e)) {
                        minY = Math.min(e, minY);
                        maxY = Math.max(e, maxY);
                    }

                    const x = (i + from) * this.step;
                    const y = e;
                    return {
                        x,
                        y,
                        labelX: x,
                        labelY: y,
                        index: i + from
                    };
                });

        return Object.freeze({
            data: data as IObjectData,
            fromX: from,
            toX: to,
            dataBounds: Object.freeze({
                fromX: data[0].x,
                toX: data[data.length - 1].x,
                fromY: minY,
                toY: maxY
            })
        });
    }
}
