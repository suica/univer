import { ComponentManager } from '@univerjs/base-ui';
import { Inject } from '@wendellhu/redi';

import {
    FORMULA_PLUGIN_NAME,
    FormulaType,
    FunList,
    FunParams,
    SearchFormulaModalData,
    SelectCategoryType,
} from '../Basics';
import { SearchFormulaContent } from '../View/UI/SearchFormulaModal/SearchFormulaContent';
import { SearchItem } from '../View/UI/SearchFormulaModal/SearchItem';

export class SearchFormulaController {
    private _modalData: SearchFormulaModalData[];

    // private _formulaModal!: SearchFormulaModal;

    private _funParams: FunParams;

    private _cellRangeModalData: SearchFormulaModalData;

    constructor(@Inject(ComponentManager) private readonly _componentManager: ComponentManager) {
        this._funParams = {
            funParams: {},
        };
        this._modalData = [
            {
                name: 'SearchFormula',
                show: false,
                group: [
                    {
                        label: 'button.confirm',
                        type: 'primary',
                        onClick: this.showSearchItemModal.bind(this),
                    },
                    {
                        label: 'button.cancel',
                    },
                ],
                onCancel: () => this.showFormulaModal('SearchFormula', false),
                children: {
                    name: FORMULA_PLUGIN_NAME + SearchFormulaContent.name,
                    props: {
                        select: SelectCategoryType,
                        funList: {
                            onClick: this.selectFunParams.bind(this),
                            children: FunList,
                        },
                    },
                },
            },
            {
                name: 'SearchItem',
                label: this._funParams,
                show: false,
                mask: false,
                group: [
                    {
                        label: 'button.confirm',
                        type: 'primary',
                    },
                    {
                        label: 'button.cancel',
                    },
                ],
                onCancel: () => this.showFormulaModal('SearchItem', false),
                children: {
                    name: FORMULA_PLUGIN_NAME + SearchItem.name,
                    props: {
                        funParams: this._funParams,
                        calcLocale: 'formula.formulaMore.calculationResult',
                        range: 'A1:B10',
                    },
                },
            },
        ];

        this._cellRangeModalData = {
            name: 'cellRangeModal',
            titleLocale: 'formula.formulaMore.tipSelectDataRange',
            show: false,
            mask: false,
            group: [
                {
                    locale: 'button.confirm',
                    type: 'primary',
                },
            ],
            onCancel: () => this.showFormulaModal('cellRangeModal', false),
            children: {
                props: {
                    placeholderLocale: '',
                },
            },
        };
        this._initialize();
    }

    selectFunParams(value: FormulaType) {
        this._funParams.funParams = value;
    }

    showFormulaModal(name: string, show: boolean) {
        const index = this._modalData.findIndex((item) => item.name === name);
        if (index > -1) {
            this._modalData[index].show = show;

            // this._formulaModal.setModal(this._modalData);
        }
    }

    showCellRangeModal(show: boolean) {
        this._cellRangeModalData.show = show;
        // const sheetPlugin = this._plugin.getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET);
        // const cellRangeModal = sheetPlugin?.getModalGroupControl().getModal(CellRangeModal.name);
        // cellRangeModal.setModal(this._cellRangeModalData);
        this.showFormulaModal('SearchItem', false);
    }

    showSearchItemModal() {
        this.showFormulaModal('SearchFormula', false);
        this.showFormulaModal('SearchItem', true);
    }

    private _initialize() {
        this._initRegisterComponent();
    }

    private _initRegisterComponent() {
        // this._sheetContainerUIController
        //     .getMainSlotController()
        //     .addSlot(FORMULA_PLUGIN_NAME + SearchFormulaModal.name, {
        //         component: SearchFormulaModal,
        //         props: {
        //             getComponent: (ref: SearchFormulaModal) => {
        //                 this._formulaModal = ref;
        //             },
        //         },
        //     });
        this._componentManager.register(FORMULA_PLUGIN_NAME + SearchItem.name, SearchItem);
        this._componentManager.register(FORMULA_PLUGIN_NAME + SearchFormulaContent.name, SearchFormulaContent);
    }
}
