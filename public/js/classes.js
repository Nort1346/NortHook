import { removeWebhook, checkWebhookUrl, webhooksUrl } from './index.js';

export class TypeOfMessage {
    static get SEND() { return 'Send'; }
    static get EDIT() { return 'Edit'; }
}

export class WebhookUrl {
    constructor(id, input, alert, removeButton = null) {
        this.id = id;
        this.input = input;
        this.alert = alert;
        /**
         * @type {HTMLButtonElement}
         */
        this.removeButton = removeButton;
        this.verify = false;
        this.webHookInfo =
        {
            name: null,
            avatar: null
        };

        this.#confingInput();
    };

    #confingInput() {
        this.input.addEventListener("focusin", () => {
            this.input.type = "text";
        });
        this.input.addEventListener("focusout", () => {
            this.input.type = "password";
        });
        this.input.addEventListener("input", () => checkWebhookUrl(webhooksUrl.findIndex(ele => ele.id == this.id)));
    }

    removeWebhook() {
        removeWebhook(this.id);
    }
}