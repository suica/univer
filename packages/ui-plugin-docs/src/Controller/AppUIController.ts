import { LocaleService, LocaleType } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { IDocUIPluginConfig } from '../Basics';
import { DocContainerUIController } from './DocContainerUIController';

export class AppUIController {
    private _docContainerController: DocContainerUIController;

    constructor(
        _config: IDocUIPluginConfig,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        this._docContainerController = this._injector.createInstance(DocContainerUIController, _config);
    }

    /**
     * Change language
     * @param {String} locale new language
     *
     * e: {target: HTMLSelectElement } reference from  https://stackoverflow.com/a/48443771
     *
     */
    changeLocale = (locale: string) => {
        this._localeService.getLocale().change(locale as LocaleType);
    };

    getDocContainerController() {
        return this._docContainerController;
    }
}
