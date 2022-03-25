import {DEG_TO_RAD, Point, Rectangle} from "@pixi/math";
import {LINE_JOIN} from "@pixi/graphics";
import {Container, IDestroyOptions} from "@pixi/display";
import {InteractionEvent} from "@pixi/interaction";

import {Range} from "./Range";
import {Observable} from "./Observable";
import {BaseDrawer} from "../drawers/";
import {CHART_EVENTS} from "./CHART_EVENTS";
import {CHART_TYPE} from "./CHART_TYPE";
import {ArrayChainDataProvider, ArrayLikeDataProvider, ObjectDataProvider, PluggableProvider} from "./providers";

import {DataTransformPlugin} from "./plugins/DataTransformPlugin";
import {IDrawerPlugin} from "../drawers/IDrawerPlugin";
import {AreaDrawer, LineDrawer} from "../drawers/charts";
import {GridDrawer} from "../drawers/grid/GridDrawer";
import {LabelsDrawer} from "../drawers/labels/LabelsDrawer";
import {BaseInput} from "./Input";
import {
    DEFAULT_LABELS_STYLE,
    DEFAULT_LABELS_STYLE_PARENT,
    DEFAULT_STYLE,
    IData,
    IDataProvider,
    ISeriesDataOptions
} from "./ISeriesDataOptions";
import {EventEmitter} from "@pixi/utils";
import {Chart} from "../Chart";
import {Transform} from "./Transform";

function isValidEnum(prop: string, enumType: Record<string, any>): boolean {
    if (!prop) {
        return false;
    }

    return Object.values<string>(enumType).includes(prop);
}

function validate(options: ISeriesDataOptions): ISeriesDataOptions {
    const result = {...options};

    if (!options.data) {
        throw  new Error('[Validate] Chart data must be presented!');
    }

    result.style =  {...DEFAULT_STYLE, ...(options.style) || {}};

    // validate type
    result.type = isValidEnum(options.type, CHART_TYPE) ? options.type : CHART_TYPE.LINE;

    // validate joints
    const joint = result.style.lineJoint;
    result.style.lineJoint = isValidEnum(joint, LINE_JOIN) ? joint : LINE_JOIN.BEVEL;

    if (options.parent) {
        result.style.labels = {
            x: {...DEFAULT_LABELS_STYLE_PARENT.x}, y: {...DEFAULT_LABELS_STYLE_PARENT.y},
            ...((options.style || {}).labels || {})
        };
    } else {
        result.style.labels = {
            x: {...DEFAULT_LABELS_STYLE.x}, y: {...DEFAULT_LABELS_STYLE.y},
            ...((options.style || {}).labels || {})
        };
    }

    return result;
}

/**
 * Root chart class that used for drawing a any kind of charts
 */
export class Series extends EventEmitter {
    protected static plugins: typeof BaseDrawer[] = [];

    /**
     * Plugin register API for attaching DrawerPlugins globally. This plugins will be used for each instance of Chart
     * @param plugin
     */
    public static registerPlugin (plugin: typeof BaseDrawer): boolean {
        if (typeof plugin !== 'function' || !('init' in plugin.prototype)) {
            console.warn('[Chart plugin register] Plugin should have a valid constructor and has init method');
            return false;
        }

        this.plugins.push(plugin);
        return true;
    }

    public readonly node: Container = new Container();

    private readonly _plugins: IDrawerPlugin[] = [];
    private readonly _activePlugins: IDrawerPlugin[] = [];
    private readonly _range: Range = new Range();
    private readonly _localTransform = new Transform();
    private readonly _worldTransform = new Transform();
    public readonly chainBounds = new Range();

    public get transform(): Transform {
        if (this.parent) {
            this._worldTransform.set(this.parent.transform)
            this._worldTransform.mul(this._localTransform);
        } else {
            this._worldTransform.set(this._localTransform);
        }

        return this._worldTransform;
    }

    public  limits: Range = new Range();

    /**
     * Chart name
     */
    public name: string = '';

    /**
     * Input service that attached on current chart
     */
    public input: BaseInput | null;
    /**
     * Current Chart context for bounded Series
     */
    public context: Chart | null;

    public parent: Series | null;

    public dataProvider: PluggableProvider;

    public get range() {
        this._range.set(this.limits);
        this._range.transform(this.transform);

        return this._range;
    }

    private _lastPressedMousePoint: Point;
    private _lastMousePoint: Point;
    private _updateId: number = -1;
    private _drawId: number = -1;

    public get updateId(): number {
        return this._updateId;
    }

    public get drawId(): number {
        return this._drawId;
    }


    /**
     * Instance a Chart with provided data, chart data should be immutable
     * Handle the drawers that will be used for current Chart instances.
     * @param { ISeriesDataOptions } options
     * @param { IDrawerPlugin[] } plugins Drawers object that can be used in current chart
     */
    constructor (
        public readonly options: ISeriesDataOptions,
        plugins: IDrawerPlugin[] = [],
    ) {
        super();

        this.name = options.name;
        this.onRangeChanged = this.onRangeChanged.bind(this);
        this.onWheel = this.onWheel.bind(this);

        this.options = validate(options);

        this.preparePlugins(plugins);
    }

    public bind (context: Chart, parent: Series = null) {
        this.parent = parent;
        this.context = context;
        this.input = context.input;

        this._localTransform.on(Transform.CHANGE, this.onRangeChanged);

        if (this.parent) {
            this.parent.transform.on(Transform.CHANGE, this.onRangeChanged);
        }

        this.node.interactive = true;
        this.node.interactiveChildren = false;

        // TODO
        // Rebound onto input
        this.node.on('pointermove', this.onDrag, this);
        document.addEventListener('wheel', this.onWheel);

        this.init();
    }

    public unbind (context: Chart) {
        this._localTransform.off(Transform.CHANGE, this.onRangeChanged);
        if (this.parent) {
            this.parent.transform.off(Transform.CHANGE, this.onRangeChanged);
        }

        this.node.interactive = false;
        this.node.interactiveChildren = false;

        // TODO
        // Rebound onto input
        this.node.off('pointermove', this.onDrag, this);
        document.removeEventListener('wheel', this.onWheel);

        this.context = null;
        this.input = null;
        this.parent = null;
    }

    protected preparePlugins (externalPlugins: IDrawerPlugin[]) {
        this._plugins.length = 0;

        const pluginName = new Set();

        for (const Ctor of Series.plugins) {
            const instance = new Ctor();

            if (!instance.name || pluginName.has(instance.name)) {
                console.warn('[Chart plugin init] Plugin not has name or already registered with same name:' + instance.name);
                continue;
            }

            pluginName.add(instance.name);
            this._plugins.push(instance);
        }

        for (const external of externalPlugins) {
            if (!external.name || pluginName.has(external.name)) {
                console.warn('[Chart plugin init] External Plugin not has name or already registered with same name:' + external.name);
                continue;
            }

            this._plugins.push(external);
        }
    }

    protected init() {
        this.parse();

        this._activePlugins.length = 0;
        this.node.removeChildren();

        for (const plugin of this._plugins) {
            if (!plugin.init(this)) {
                continue;
            }

            this._activePlugins.push(plugin);

            if (plugin.node) {
                this.node.addChild(plugin.node);
            }
        }

        this.node.sortChildren();
    }

    public update(): boolean {
        if (this._updateId === 0) {
            return false;
        }

        for (const plugin of this._activePlugins) {
            if (plugin.update && plugin.update()) {
                this._drawId ++;
            }
        }

        this._updateId = 0;
        return true;
    }

    public draw(): boolean {
        if (this._drawId === 0) {
            return false;
        }

        for (const plugin of this._activePlugins) {
            plugin.draw && plugin.draw();
        }

        this._drawId = 0;

        return true;
    }

    public reset() {
        for (const plugin of this._activePlugins) {
            plugin.reset && plugin.reset();
        }

        // remove all childs
        this.node.removeChildren();
        this._activePlugins.length = 0;

        this._drawId = this._updateId = -1;
    }

    public destroy(_options?: IDestroyOptions | boolean): void {
        this.node.destroy(_options);

        this.reset();

        for (const plugin of this._plugins) {
            plugin.dispose && plugin.dispose();
        }

        this._plugins.length = 0;

        this.emit(CHART_EVENTS.DESTROY, this);
    }

    private scaleAtPoint (point: Point, sx: number, sy: number) {
        const clamp = this.options.style.clamp;

        this._localTransform.translate(-point.x, -point.y);
        this._localTransform.scale(sx, sy);
        this._localTransform.translate(point.x, point.y);

        if (clamp) {
            this._range.set(this.limits);
            this._range.transform(this._localTransform, this.limits);
            this._range.decomposeFrom(this.limits, this._localTransform);
        }

        this._emitUpdate();
    }

    private transformRange({
        tx = 0, ty = 0, sx = 1, sy = 1
    } = {}) {
        const {
            clamp
        } = this.options.style;

        this._localTransform.translate(tx, ty);
        this._localTransform.scale(sx, sy);

        if (clamp) {
            this._range.set(this.limits);
            this._range.transform(this._localTransform, this.limits);
            this._range.decomposeFrom(this.limits, this._localTransform);
        }

        this._emitUpdate();
    }

    private onWheel(event: WheelEvent): void {
        if (this.parent) {
            return;
        }

        if (!this._lastMousePoint) {
            return;
        }

        const pos = this._lastMousePoint;

        if (
            this.limits.fromX > pos.x ||
            this.limits.toX < pos.x ||
            this.limits.fromY > pos.y ||
            this.limits.toY < pos.y
        ) {
            return;
        }

        const scaleX = event.deltaY > 0 ? 1.1 : 0.9;
        const scaleY = 1;

        this.scaleAtPoint(pos, scaleX, scaleY);
    }

    private onDrag(event: InteractionEvent): void {
        if (this.parent) {
            return;
        }

        const pos = event.data.global;
        this._lastMousePoint = pos.clone();

        if (
            this.limits.fromX > pos.x ||
            this.limits.toX < pos.x ||
            this.limits.fromY > pos.y ||
            this.limits.toY < pos.y
        ) {
            return;
        }

        const original = event.data.originalEvent as MouseEvent;

        if (original.buttons & 0x1) {

            if (this._lastPressedMousePoint) {
                const tx = pos.x - this._lastPressedMousePoint.x;
                const ty = -(pos.y - this._lastPressedMousePoint.y);

                this.transformRange({
                    tx, ty
                });
                this._emitUpdate();
            }

            this._lastPressedMousePoint = event.data.global.clone();
        } else {
            this._lastPressedMousePoint = null;
        }
    }

    private onRangeChanged (_field: string, _old: any, _newValue: any): void {
        this._emitUpdate();
    }

    protected parse() {
        const { data, labels } = this.options;

        let dataProvider: IDataProvider;

        let primitiveData: IData;

        // parse data source
        if ('data' in data) {
            if ('fetch' in data) {
                dataProvider = data;
            } else {
                primitiveData = data.data;
            }
        } else {
            primitiveData = data as IData;
        }

        if (!dataProvider) {
            const firstEntry = primitiveData[0];

            // array like
            if (Array.isArray(firstEntry) && firstEntry.length === 2) {
                dataProvider = new ArrayChainDataProvider(primitiveData);

            } else if (typeof firstEntry === 'object' && ('x' in <any>firstEntry) && ('y' in <any>firstEntry)) {
                // object like

                dataProvider = new ObjectDataProvider(primitiveData);
            } else {

                // is array
                dataProvider = new ArrayLikeDataProvider(primitiveData);
            }
        }

        this.dataProvider = new PluggableProvider(dataProvider, this);

        this._emitUpdate();
    }

    public setViewport (x: number, y: number, width: number, height: number): void {
        this.node.hitArea = new Rectangle(x, y, width, height);

        if (!this.parent) {
            this._range.set(this.limits);
        }

        this.limits.set({
            fromX: x, fromY: y, toX: x + width, toY: y + height
        });

        if (!this.parent) {
            this._range.clampToMin(this.limits);
            this._range.decomposeFrom(this.limits, this._localTransform, 'right');
        }

        this.emit(CHART_EVENTS.RESIZE, this);
        this._emitUpdate();
    }

    public getDrawerPluginByName<T extends IDrawerPlugin> (name: string, activeOnly = false): T | null {
        return (activeOnly ? this._activePlugins : this._plugins).find(e => e.name === name) as T;
    }

    public getDrawerPluginByClass<T extends IDrawerPlugin> (classType: typeof BaseDrawer, activeOnly = false): T | null {
        return (activeOnly ? this._activePlugins : this._plugins).find(e => e.constructor === classType) as T;
    }

    private _emitUpdate(): void {
        this._updateId ++;
        this.emit(CHART_EVENTS.UPDATE, this);
    }
}

// Register Data plugins
PluggableProvider.registerPlugin(DataTransformPlugin);

// register a Chart drawer plugin
Series.registerPlugin(GridDrawer);
Series.registerPlugin(LineDrawer);
Series.registerPlugin(AreaDrawer);
Series.registerPlugin(LabelsDrawer);
