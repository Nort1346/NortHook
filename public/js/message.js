import {
    isImageURLValid,
    generateUniqueId,
    getEmbedInput,
    getEmbedVisual,
    insertAfter,
    formatText,
    getFile
} from './functions.js';

import {
    TypeOfMessage
} from './classes.js';

import {
    DefaultWebhookInfo,
    refreshTooltips,
    webhookUrl,
    isCorrectWebhookURL,
    checkWebhookUrl,
    removeMessage,
    WebHookInfo
} from './index.js';

import { Embed } from './embed.js';

import * as bootstrap from 'bootstrap';

export class Message {
    /**
     * Create a message class
     * @param {HTMLElement} messageInputElement
     * @param {HTMLElement} messageVisualElement
     */
    constructor(messageInputElement, messageVisualElement, uniqeId) {
        this.id = uniqeId;
        this.messageInputElement = messageInputElement;
        this.messageVisualElement = messageVisualElement;

        /*
        * Message Input Elements
        */
        this.content = messageInputElement.querySelector(".content");
        this.username = messageInputElement.querySelector(".username");
        this.avatar_url = messageInputElement.querySelector(".avatar_url");
        this.files = messageInputElement.querySelector(".files");
        this.messageLink = messageInputElement.querySelector(".messageLink");
        /** Message embeds Array
         * @type [Embed]
         */
        this.embeds = [];
        this.messageType = TypeOfMessage.SEND;

        // Message Buttons
        this.loadMessageButton = messageInputElement.querySelector(".loadMessageButton");
        this.clearFilesButton = messageInputElement.querySelector(".clearFiles");
        this.addEmbedButton = messageInputElement.querySelector(".addEmbed");
        this.removeMessageButton = messageInputElement.querySelector(".removeMessage");

        /*
         * Message View Parameters
         */
        this.contentView = messageVisualElement.querySelector(".contentView");
        this.usernameView = messageVisualElement.querySelector(".usernameName");
        this.avatarView = messageVisualElement.querySelector(".avatarIcon");
        this.filesView = messageVisualElement.querySelector(".filesView");

        this.alertInvalidAvatarUrl = new bootstrap.Collapse(`#messageInput_${this.id} .InvalidAvatarUrlCollapse`, { toggle: false });
        this.alertInvalidMessageLink = new bootstrap.Collapse(`#messageInput_${this.id} .InvalidMessageLinkCollapse`, { toggle: false });

        this.content.addEventListener("input", async () => await this.changeView());
        this.username.addEventListener("input", async () => await this.changeView());
        this.avatar_url.addEventListener("input", async () => await this.changeView());

        this.messageLink.addEventListener("input", () => checkWebhookUrl());
        this.messageLink.addEventListener("input", () => this.checkMessageLink());

        this.loadMessageButton.addEventListener("click", () => this.loadMessage());
        this.clearFilesButton.addEventListener("click", async () => this.clearFiles());
        this.addEmbedButton
            .addEventListener("click", async () =>
                this.addEmbed(await getEmbedInput(this.messageInputElement),
                    await getEmbedVisual(this.messageVisualElement)));
        this.removeMessageButton.addEventListener("click", () => {
            removeMessage(this.id);
        });

        this.files.addEventListener("fileInput", async () => this.changeView())
        this.files.addEventListener("change", async () => this.changeView());

        /**
        * WebHookInfo
        */
        this.webhookInfo = { name: null, avatar: null };
        this.setStandardValues();
        this.setWebhookInfo();
    }

    /**
     * @param {{ content: any; author: { username: any; id: any; avatar: any; }; embeds: string | any[]; }} message
     */
    async setMessage(message) {
        //Content
        this.content.value = message.content;
        //Profile
        this.username.value = message.author.username;
        this.avatar_url.value = `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`;
        //Files

        //Embeds
        this.embeds.forEach(ele => ele.removeEmbed());
        this.embeds.splice(0, this.embeds.length);
        for (let i = 0; i < message.embeds.length && i < 10; i++) {
            await this.addEmbed(await getEmbedInput(this.messageInputElement), await getEmbedVisual(this.messageVisualElement));
            await this.embeds[i].setEmbed(message.embeds[i]);
        }

        this.clearFiles();
        this.countEmbedNumbers();
        this.checkAddEmbedButton();
        this.checkArrowsEmbeds();
        this.changeView();
    }

    async changeView() {
        this.contentView.innerHTML = formatText(this.content.value);

        if (this.username.value.replaceAll(/\s/g, "") != "") {
            this.usernameView.innerText = this.username.value;
        } else {
            this.usernameView.innerText = this.webhookInfo.name ?? DefaultWebhookInfo.name;
        }

        if (this.avatar_url.value.replaceAll(/\s/g, "") != "") {
            if (await isImageURLValid(this.avatar_url.value)) {
                this.alertInvalidAvatarUrl.hide();
                this.avatarView.src = this.avatar_url.value;
            } else {
                this.alertInvalidAvatarUrl.show();
                this.avatarView.src = this.webhookInfo.avatar ?? DefaultWebhookInfo.avatar;
            }
        } else {
            this.alertInvalidAvatarUrl.hide();
            this.avatarView.src = this.webhookInfo.avatar ?? DefaultWebhookInfo.avatar;
        }

        this.filesView.innerHTML = "";

        for (const file of this.files.files) {
            if (file.type.startsWith('image/')) {
                const divFile = document.createElement('div');
                divFile.classList.add("w-100");

                const imgEmbed = document.createElement('img');
                imgEmbed.classList.add("rounded");
                imgEmbed.classList.add("my-1");
                imgEmbed.style.width = "auto";
                imgEmbed.style.height = "auto";

                imgEmbed.style.maxWidth = "90%";
                imgEmbed.style.maxHeight = "400px";
                imgEmbed.src = URL.createObjectURL(file);
                imgEmbed.alt = file.name;

                divFile.appendChild(imgEmbed);
                this.filesView.appendChild(divFile);
            }
        }
    }

    setStandardValues() {
        this.content.value = "Hello World, I am Developer";
        this.changeView();
    }

    async addEmbed(inputEmbed, visualEmbed) {
        const uniqeId = generateUniqueId();
        const newEmbed = new Embed(inputEmbed, visualEmbed, uniqeId);
        await newEmbed.setNumber(this.embeds.length);

        this.embeds.push(newEmbed);

        this.checkAddEmbedButton();
        this.checkArrowsEmbeds();
        refreshTooltips();

        newEmbed.upButton.addEventListener("click", () => this.upEmbed(newEmbed.id));
        newEmbed.downButton.addEventListener("click", () => this.downEmbed(newEmbed.id));
        newEmbed.removeButton.addEventListener("click", () => this.removeEmbed(newEmbed.id));
        newEmbed.duplicateButton.addEventListener("click", async () => await this.duplicateEmbed(newEmbed.id));
    }

    upEmbed(id) {
        const indexOfRemoveEmbed = this.embeds.findIndex(ele => ele.id == id);
        if (indexOfRemoveEmbed >= 0) {
            const temp = this.embeds.splice(indexOfRemoveEmbed, 1)[0];
            this.embeds.splice(indexOfRemoveEmbed - 1, 0, temp);

            this.embeds[indexOfRemoveEmbed].inputEmbed
                .insertAdjacentElement("beforebegin", this.embeds[indexOfRemoveEmbed - 1].inputEmbed);

            this.embeds[indexOfRemoveEmbed].visualEmbed
                .insertAdjacentElement("beforebegin", this.embeds[indexOfRemoveEmbed - 1].visualEmbed);

            this.checkArrowsEmbeds();
            this.countEmbedNumbers();
            refreshTooltips();
        }
        refreshTooltips();
    }

    downEmbed(id) {
        const indexOfRemoveEmbed = this.embeds.findIndex(ele => ele.id == id);
        if (indexOfRemoveEmbed >= 0) {
            const temp = this.embeds.splice(indexOfRemoveEmbed, 1)[0];
            this.embeds.splice(indexOfRemoveEmbed + 1, 0, temp);

            this.embeds[indexOfRemoveEmbed].inputEmbed
                .insertAdjacentElement("afterend", this.embeds[indexOfRemoveEmbed + 1].inputEmbed);

            this.embeds[indexOfRemoveEmbed].visualEmbed
                .insertAdjacentElement("afterend", this.embeds[indexOfRemoveEmbed + 1].visualEmbed);

            this.checkArrowsEmbeds();
            this.countEmbedNumbers();
            refreshTooltips();
        }
    }

    removeEmbed(id) {
        const indexOfRemoveEmbed = this.embeds.findIndex(ele => ele.id == id);
        if (indexOfRemoveEmbed >= 0) {
            this.embeds[indexOfRemoveEmbed].removeEmbed();
            this.embeds.splice(indexOfRemoveEmbed, 1);

            this.countEmbedNumbers();
            this.checkAddEmbedButton();
            this.checkArrowsEmbeds();
            refreshTooltips();
        }
    }

    async duplicateEmbed(id) {
        const indexOfRemoveEmbed = this.embeds.findIndex(ele => ele.id == id);

        if (indexOfRemoveEmbed >= 0 && this.embeds.length < 10) {
            const cloneEmbed = new Embed(await getEmbedInput(this.messageInputElement),
                await getEmbedVisual(this.messageVisualElement),
                generateUniqueId());
            await cloneEmbed.setEmbed(this.embeds[indexOfRemoveEmbed].getEmbed());
            await cloneEmbed.refreshEmbedVisual();

            cloneEmbed.upButton.addEventListener("click", () => this.upEmbed(cloneEmbed.id));
            cloneEmbed.downButton.addEventListener("click", () => this.downEmbed(cloneEmbed.id));
            cloneEmbed.removeButton.addEventListener("click", () => this.removeEmbed(cloneEmbed.id));
            cloneEmbed.duplicateButton.addEventListener("click", async () => await this.duplicateEmbed(cloneEmbed.id));

            this.embeds.splice(indexOfRemoveEmbed + 1, 0, cloneEmbed);

            this.countEmbedNumbers();
            this.checkAddEmbedButton();
            this.checkArrowsEmbeds();

            insertAfter(cloneEmbed.inputEmbed, this.embeds[indexOfRemoveEmbed].inputEmbed);
            insertAfter(cloneEmbed.visualEmbed, this.embeds[indexOfRemoveEmbed].visualEmbed);
            refreshTooltips();
        }
    }

    checkArrowsEmbeds() {
        this.embeds.map((emb, index) => {
            emb.upButton.disabled = false;
            emb.upButton.classList.remove("d-none");

            emb.downButton.disabled = false;
            emb.downButton.classList.remove("d-none");

            if (index == 0) {
                emb.upButton.disabled = true;
                emb.upButton.classList.add("d-none");
            }
            if (index == this.embeds.length - 1) {
                emb.downButton.disabled = true;
                emb.downButton.classList.add("d-none");
            }
        });
    }

    checkAddEmbedButton() {
        if (this.embeds.length >= 10) {
            this.addEmbedButton.disabled = true;
        } else {
            this.addEmbedButton.disabled = false;
        }
    }

    countEmbedNumbers() {
        for (let i = 0; i < this.embeds.length; i++) {
            this.embeds[i].setNumber(i);
        }
    }

    loadMessage() {
        const loading = document.getElementById("loadingMessage");
        loading.classList.remove("visually-hidden");
        this.loadMessageButton.disabled = true;

        const formData = new FormData();
        formData.append("messageLink", `${webhookUrl.value}/messages/
        ${this.messageLink.value.slice(this.messageLink.value.lastIndexOf("/") + 1)}`);

        fetch("/getWebhookMessage", {
            method: "POST",
            body: formData
        })
            .then((response) => response.json())
            .then(async (data) => {
                loading.classList.add("visually-hidden");
                this.loadMessageButton.disabled = false;

                if (data.success == true) {
                    await this.setMessage(data.message);
                }
            });
    }

    checkMessageLink() {
        if (this.isCorrectMessageLink(this.messageLink.value) && isCorrectWebhookURL()) {
            const apiURL = `${webhookUrl.value}/messages/
          ${this.messageLink.value.slice(this.messageLink.value.lastIndexOf("/") + 1)}`;

            const formData = new FormData();
            formData.append("messageLink", apiURL);
            fetch("/getWebhookMessage", {
                method: "POST",
                body: formData
            })
                .then((response) => response.json())
                .then((data) => {
                    this.loadMessageButton.disabled = !data.success;

                    if (data.success == true) {
                        this.messageType = TypeOfMessage.EDIT;
                        this.alertInvalidMessageLink.hide()
                    } else {
                        this.messageType = TypeOfMessage.SEND;
                        this.alertInvalidMessageLink.show();
                    }
                });
        } else {
            this.messageType = TypeOfMessage.SEND;
            this.loadMessageButton.disabled = true;
        }
        this.changeView();
    }

    isCorrectMessageLink(link) {
        let res = link
            .replaceAll(/\s/g, "")
            .startsWith("https://discord.com/channels/");

        if (link.replaceAll(/\s/g, "") == "") this.alertInvalidMessageLink.hide();
        else if (res == false) this.alertInvalidMessageLink.show();
        return res == true;
    }

    getMessage() {
        return {
            content: this.content.value,
            user: {
                username: this.username.value,
                avatar_url: this.avatar_url.value
            },
            embeds: this.embeds,
            files: this.files.files,
            messageLink: this.messageLink.value
        }
    }

    removeMessage() {
        this.messageInputElement.remove();
        this.messageVisualElement.remove();

        this.embeds.forEach((embed) => {
            embed.removeEmbed();
        });
    }

    setWebhookInfo() {
        this.webhookInfo.name = WebHookInfo.name;
        this.webhookInfo.avatar = WebHookInfo.avatar;
        this.changeView();
    }

    toggleRemoveMessageButtonDisplay(toggle) {
        if (toggle) {
            this.removeMessageButton.classList.remove("d-none");
        } else {
            this.removeMessageButton.classList.add("d-none");
        }
    }

    clearFiles() {
        this.files.value = null;
        this.changeView();
    }
}