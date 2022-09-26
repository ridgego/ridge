import debug from 'debug';
import ky from 'ky';
import Gettext from 'node-gettext';
import _ from 'lodash';
import { mo } from 'gettext-parser';

const log = debug('runtime:i18n'),
    LC_MESSAGES = 'LC_MESSAGES',
    getCurrentLocale = async(appName) => {
        const response = await ky.get(`/api/locale/current/get?app=${appName}`).json();

        return response.data;
    },
    getI18NResource = async(url) => {
        try {
            const response = await ky.get(url);

            return response.arrayBuffer();
        } catch (e) {
            return [];
        }
    };

class I18nManager {
    constructor(apolloApp, appName) {
        this.apolloApp = apolloApp;
        this.appName = appName;
        this.apolloApp.gettext = this.getText.bind(this);

        this.apolloApp.viewManager.loader.confirmI18n = this.loadPackageI18nResource.bind(this);
        this.apolloApp.viewManager.getI18nText = this.getText.bind(this);
        this.gt = new Gettext();
    }

    /**
     * 初始化当前的locale
     */
    async initCurrentLocale() {
        const data = await (getCurrentLocale(this.appName));

        this.apolloApp.locales = data.locales;
        this.apolloApp.viewManager.appVariableObject.locales = data.locales;
        if (data.enabled && this.apolloApp.fpQuery.test == null) {
            this.apolloApp.localesEnabled = data.enabled;
            this.apolloApp.locale = data.locale;
            this.apolloApp.viewManager.appVariableObject.currentLocale = this.apolloApp.locale;
            window.top.currentLocale = this.apolloApp.locale;
            window.top.i18nManager = this;
            try {
                await this.loadMoResource(`/locale/${this.apolloApp.locale}/${LC_MESSAGES}/${this.apolloApp.locale}.mo`, this.apolloApp.locale, 'apollo');
            } catch (e) {
                log('平台多语言包加载失败');
            }
        }
    }

    async loadPackageI18nResource(packageObject) {
        if (this.apolloApp.locale) {
            // 需要加载组件包的国际化资源
            const moUrl = this.apolloApp.viewManager.loader.getServePath() + '/npm_packages/' + packageObject.name + '/locale/' + this.apolloApp.locale + '/' + LC_MESSAGES + '/' + this.apolloApp.locale + '.mo';

            try {
                await this.loadMoResource(moUrl, this.apolloApp.locale, packageObject.name);
            } catch (e) {
                log('组件包的多语言资源未加载', moUrl, this.apolloApp.locale, packageObject.name);
            }
            this.gt.setLocale(this.apolloApp.locale);
        }
    }

    async loadMoResource(url, locale, domain) {
        if (this.gt.catalogs[locale] && this.gt.catalogs[locale][domain]) {
            return;
        }
        const parsedTranslations = mo.parse(Buffer.from(await getI18NResource(url)));

        this.gt.addTranslations(locale, domain, parsedTranslations);
    }

    getText(text, context) {
        if (text === '') {
            return text;
        }
        let output = text;

        if (this.apolloApp.locale) {
            if (this.gt.catalogs[this.apolloApp.locale]) {
                const domains = Object.keys(this.gt.catalogs[this.apolloApp.locale]);

                for (const domain of domains) {
                    this.gt.setTextDomain(domain);// 切换资源域
                    if (this.gt.gettext(text) !== text) {
                        output = this.gt.gettext(text);
                        break;
                    }
                }
            }
        }
        if (context) {
            _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

            const compiled = _.template(output);

            output = compiled(context);
        }
        log('gettext', text, '->', output);
        return output;
    }

    /**
     * 获取并解析对应的多语言资源
     * @param {*} locale 语种
     * @param {*} domain 资源域
     */
    async initResource(locale, domain) {
        const parsedTranslations = mo.parse(Buffer.from(await getI18NResource(this.app)));

        this.gt.addTranslations(locale, domain, parsedTranslations);
        this.gt.setLocale(locale); // 切换语种
        this.gt.setTextDomain(domain);// 切换资源域
    }

    getMessage(text) {
        return this.gt.gettext(text) || text;
    }
}

export default I18nManager;
