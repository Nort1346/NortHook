export class TypeOfMessage {
    static get SEND() { return 'Send'; }
    static get EDIT() { return 'Edit'; }
}

export class WebhookUrl {
    constructor(input, alert, removeButton = null) {
        this.input = input;
        this.alert = alert;
        /**
         * @type {HTMLButtonElement}
         */
        this.removeButton = removeButton;
    }
}