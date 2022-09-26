import process from 'process';
import { Buffer } from 'buffer';

import I18nManager from './i18n_manager.js';
window.process = process;
window.Buffer = Buffer;

export {
    I18nManager
};
