import { IKeyValue, Nullable } from '@univerjs/core';

import { BaseObject } from './BaseObject';
import { RENDER_CLASS_TYPE } from './Basics/Const';
import { IObjectFullState } from './Basics/Interfaces';
import { transformBoundingCoord } from './Basics/Position';
import { IBoundRect, Vector2 } from './Basics/Vector2';
import { ThinScene } from './ThinScene';

export class SceneViewer extends BaseObject {
    private _subScenes = new Map<string, ThinScene>();

    private _activeSubScene: Nullable<ThinScene>;

    private _allowSelectedClipElement = false;

    constructor(key?: string, props?: IObjectFullState) {
        // WTF: the name of `props`'s interface ends with State?
        super(key);
        this._initialProps(props);
    }

    override get classType() {
        return RENDER_CLASS_TYPE.SCENE_VIEWER;
    }

    override render(mainCtx: CanvasRenderingContext2D, bounds?: IBoundRect) {
        if (!this.visible) {
            this.makeDirty(false);
            return this;
        }

        if (bounds) {
            const { minX, maxX, minY, maxY } = transformBoundingCoord(this, bounds);

            if (this.width + this.strokeWidth < minX || maxX < 0 || this.height + this.strokeWidth < minY || maxY < 0) {
                // console.warn('ignore object', this);
                return this;
            }
        }

        const m = this.transform.getMatrix();
        mainCtx.save();
        mainCtx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);

        this._activeSubScene?.makeDirtyNoParent(true).render(mainCtx);
        mainCtx.restore();
        this.makeDirty(false);
        return this;
    }

    getSubScenes() {
        return this._subScenes;
    }

    getActiveSubScene() {
        return this._activeSubScene;
    }

    getSubScene(sceneKey: string) {
        for (const [key, scene] of this._subScenes) {
            if (key === sceneKey) {
                return scene;
            }
        }
    }

    addSubScene(scene: ThinScene) {
        this._activeSubScene = scene;
        this._subScenes.set(scene.sceneKey, scene);
        this.makeDirty();
    }

    removeSubScene(key: string) {
        const subScene = this._subScenes.get(key);
        this._subScenes.delete(key);
        if (this._activeSubScene === subScene) {
            this._activeSubScene = this._subScenes.values().next().value;
        }
        this.makeDirty();
    }

    activeSubScene(key: Nullable<string>) {
        if (key == null) {
            return;
        }
        const subScene = this._subScenes.get(key);
        if (this._activeSubScene !== subScene) {
            this._activeSubScene = subScene;
            this.makeDirty();
        }
    }

    enableSelectedClipElement() {
        this._allowSelectedClipElement = true;
    }

    disableSelectedClipElement() {
        this._allowSelectedClipElement = false;
    }

    allowSelectedClipElement() {
        return this._allowSelectedClipElement;
    }

    // 判断被选中的唯一对象
    pick(coord: Vector2) {
        if (this._activeSubScene === undefined) {
            return;
        }

        const trans = this.transform.clone().invert();
        const tCoord = trans.applyPoint(coord);

        return this._activeSubScene?.pick(tCoord);
    }

    override dispose() {
        super.dispose();

        this._subScenes.forEach((scene) => {
            scene.dispose();
        });
    }

    private _initialProps(props?: IObjectFullState) {
        if (!props) {
            return;
        }

        const themeKeys = Object.keys(props);
        if (themeKeys.length === 0) {
            return;
        }

        const transformState: IObjectFullState = {};
        let hasTransformState = false;
        themeKeys.forEach((key) => {
            if (props[key as keyof IObjectFullState] === undefined) {
                return true;
            }

            (transformState as IKeyValue)[key] = props[key as keyof IObjectFullState];
            hasTransformState = true;
        });

        if (hasTransformState) {
            this.transformByState(transformState);
        }

        this.makeDirty(true);
    }
}
