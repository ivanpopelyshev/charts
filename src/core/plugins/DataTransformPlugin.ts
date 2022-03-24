import type { PluggableProvider } from "../providers";
import type { IDataPlugin } from "./IDataPlugin";
import { IRangeObject } from "../Range";
import {IDataFetchResult, IObjectData} from "../ISeriesDataOptions";
import {Transform} from "../Transform";

export type DataTransformPluginResult = IDataFetchResult<IObjectData> & { trimmedSourceBounds?: IRangeObject, transform?: Transform };

class DataBounds implements IRangeObject {
    fromX = Infinity;
    toX = -Infinity;
    fromY = Infinity;
    toY = -Infinity;

    grown ({x, y} : {x: number, y: number}): void {
        if (x < this.fromX) this.fromX = x;
        if (x > this.toX) this.toX = x;

        if (isNaN(y)) {

        }

        if (y < this.fromY) this.fromY = y;
        if (y > this.toY) this.toY = y;
    }
}
/**
 * Data transform plugin, used for converting a input data space to Chart range values,
 */
export class DataTransformPlugin implements IDataPlugin {
	public readonly name = 'DataTransformPlugin';

	private context: PluggableProvider;

	public readonly reduceXRange = true;


	/**
	 * @implements IDataPlugin
	 * @inheritDoc
     *
	 */
	init(context: PluggableProvider): boolean {
		this.context = context;
		return true;
	}

	/**
	 * @implements IDataPlugin
	 * @inheritDoc
	 */
	processElements(result: DataTransformPluginResult, source: IDataFetchResult<IObjectData>): DataTransformPluginResult {
	    const chart = this.context.chart;
		const {
		    fitYRange
        } = chart.options.style;

		const data = result.data;

		let {
		    fromX: limitLeft,
            toX: limitRight
        } = chart.limits;

		const b = chart.parent
            ? chart.parent.dataProvider.sourceProvider.fetch().dataBounds
            : source.dataBounds;


        const t = chart.range.decomposeFrom(b);
		const output = [];

        const outBounds = new DataBounds();
        const trimmedBounds = new DataBounds();

        for (let i = 0; i < data.length; i ++) {
            const input = data[i];
		    const current = t.apply(input);

            if (this.reduceXRange) {
                if (current.x < limitRight && (i + 1) < data.length) {
                    const next = t.apply(data[i + 1]);

                    if (next.x < limitLeft) {
                        continue;
                    }
                }

                if (current.x > limitRight && i > 0) {
                    const prev = t.apply(data[i - 1]);

                    if (prev.x > limitRight) {
                        break;
                    }
                }
            }

            outBounds.grown(current);
            trimmedBounds.grown(input);

            output.push(
                current
            );
        }

        if (fitYRange) {
            const {
                fromY, height
            } = chart.range;

            // rescale Y auto ranged
            for (const out of output) {
                out.y = (fromY + (out.y - outBounds.fromY) * height / (outBounds.toY - outBounds.fromY));
            }

            outBounds.toY = fromY + (outBounds.toY - outBounds.fromY);
            outBounds.fromY = fromY;
        }

        result.transform = t;
        result.data = output;
        result.dataBounds = outBounds;
		result.trimmedSourceBounds = trimmedBounds;

		return result;
	}
}
