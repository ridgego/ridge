import { ViewDecorator } from '@gw/fc-view-manager';

export default class I18nDecorator extends ViewDecorator {
    constructor(i18nManager) {
        super();
        this.i18nManager = i18nManager;
    }

    initPropEvents(fcViewInstance) {
        this.checkI18nProps(fcViewInstance);
    }

    /**
     * view实例mount后触发事件
     * @param {*} fcViewInstance
     */
    mounted(fcViewInstance) {
        this.checkI18nProps(fcViewInstance);
    }

    updateProps(fcViewInstance) {
        this.checkI18nProps(fcViewInstance);
    }

    checkI18nProps(fcViewInstance) {
        if (fcViewInstance.componentDefinition && fcViewInstance.componentDefinition.props) {
            const i18nProps = fcViewInstance.componentDefinition.props.filter(p => (p.i18n === true && p.value));

            for (const prop of i18nProps) {
                if (fcViewInstance.instancePropConfig[prop.name] === prop.value) {
                    fcViewInstance.instancePropConfig[prop.name] = this.i18nManager.getText(prop.value) || prop.value;
                }
            }
        }
    }
}
