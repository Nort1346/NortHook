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
    }
}