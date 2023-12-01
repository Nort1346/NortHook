import { Message } from './message.js';
import * as bootstrap from 'bootstrap';

/**
 * Default WebHook Values
 */
export const defaultWebhookInfo = {
    name: 'Nort',
    avatar: 'https://cdn.discordapp.com/avatars/794288711164493864/5aa45cc104dc6af311c76b5ee58f49bb.jpg?size=1024'
};

/**
 * General WebhookInfo
 * @type {{name: string, avatar: string}}
 */
export let generalWebHookInfo = {
    name: null,
    avatar: null
};

/**
 * @type [Message]
 */
export const messages = [];

export const successModalSend = new bootstrap.Modal('#successModalSend', { focus: true });
export const successModalText = document.getElementById("successModalText");

export const failModalSend = new bootstrap.Modal('#failModalSend', { focus: true });
export const failModalContentSend = document.getElementById("failEmbedErrorContentSend");