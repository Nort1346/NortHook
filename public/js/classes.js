export class Embed {
    constructor(inputEmbed, visualEmbed, id) {
        this.id = id;
        this.embedId = inputEmbed.querySelector("#embedId");
        this.embedName = inputEmbed.querySelector("#embedName");
        this.removeButton = inputEmbed.querySelector(".embedButtonRemove");
        this.addFieldButton = inputEmbed.querySelector(".addFieldButton");

        this.author = {
            name: inputEmbed.querySelector("#authorName"),
            url: inputEmbed.querySelector("#authorUrl"),
            iconUrl: inputEmbed.querySelector("#authorIconUrl")
        };
        this.title = inputEmbed.querySelector("#title");
        this.description = inputEmbed.querySelector("#description");
        this.color = inputEmbed.querySelector("#color");
        this.url = inputEmbed.querySelector("#url");
        this.fields = [];
        this.timestamp = inputEmbed.querySelector("#timestamp");
        this.image = { url: inputEmbed.querySelector("#imagesUrl") };
        this.thumbnail = { url: inputEmbed.querySelector("#thumbnailUrl") };
        this.footer = {
            text: inputEmbed.querySelector("#footerText"),
            icon_url: inputEmbed.querySelector("#footerIconUrl")
        };
        this.viewObjects = {
            color: visualEmbed.querySelector("#colorVisual"),
            title: visualEmbed.querySelector("#titleVisual"),
            description: visualEmbed.querySelector("#descriptionVisual"),
            url: visualEmbed.querySelector("#urlVisual"),
            timestamp: visualEmbed.querySelector("#timestampVisual"),
            footer: {
                text: visualEmbed.querySelector("#footerTextVisual"),
                iconUrl: visualEmbed.querySelector("#footerIconUrlVisual"),
                url: visualEmbed.querySelector("#footerUrlVisual"),
                allElements: visualEmbed.querySelector("#footer")
            },
            thumbnail: { url: visualEmbed.querySelector("#thumbnailVisual") },
            image: { url: visualEmbed.querySelector("#imageVisual") },
            author: {
                name: visualEmbed.querySelector("#authorNameVisual"),
                iconUrl: visualEmbed.querySelector("#authorIconUrlVisual"),
                url: visualEmbed.querySelector("#authorUrlVisual"),
                allElements: visualEmbed.querySelector("#author"),
            },

        }
        this.addListeners();
        this.refreshEmbedVisual();
    };

    getEmbed() {
        const embedObject = {};

        if (this.author.name.value)
            embedObject.author = { name: this.author.name.value, url: this.author.url.value, icon_url: this.author.iconUrl.value };
        if (this.title.value)
            embedObject.title = this.title.value;
        if (this.description.value)
            embedObject.description = this.description.value;
        if (this.color.value)
            embedObject.color = parseInt(this.color.value.slice(1), 16);
        if (this.url.value)
            embedObject.url = this.url.value;
        if (this.timestamp.value)
            embedObject.timestamp = new Date(this.timestamp.value);
        if (this.image.url.value)
            embedObject.image = { url: this.image.url.value };
        if (this.thumbnail.url.value)
            embedObject.thumbnail = { url: this.thumbnail.url.value };
        if (this.footer.text.value)
            embedObject.footer = { text: this.footer.text.value, icon_url: this.footer.icon_url.value }
        //if (this.fields[0].name.value && this.fields[0].value.value)
        //  embedObject.fields = { name: this.fields[0].name.value, value: this.fields[0].value.value, inline: this.fields[0].inline.value }

        return embedObject;
    }

    async refreshEmbedVisual() {
        /**
         * EMBED NAME
         */
        if (this.title.value) {
            this.embedName.innerText = `- ${this.title.value.substring(0, 25)}`;
        } else {
            this.embedName.innerText = '';
        }

        this.embedId.innerText = `Embed ${this.id + 1}`

        /**
         * COLOR
         */
        this.viewObjects.color.style.backgroundColor = this.color.value;

        /**
         * TITLE
         */
        this.viewObjects.title.innerText = this.title.value;
        if (this.title.value) {
            this.viewObjects.title.classList.remove("d-none");
        } else {
            this.viewObjects.title.classList.add("d-none");
        }

        /**
         * URL
         */
        if (this.url.value) {
            this.viewObjects.url.href = this.url.value;
            this.viewObjects.url.classList.remove("text-decoration-none");
            this.viewObjects.url.onclick = "return false;";
        } else {
            this.viewObjects.url.classList.add("text-decoration-none");
            this.viewObjects.url.onclick = "";
        }

        /**
         * DESCRIPTION
         */
        this.viewObjects.description.innerText = this.description.value;

        /**
         * FOOTER AND TIMESTAMP
         */
        if (!this.timestamp.value && !this.footer.text.value) {
            this.viewObjects.footer.allElements.classList.add("d-none");
        } else {
            this.viewObjects.timestamp.innerText = this.timestamp.value
                ? new Date(this.timestamp.value).toLocaleString() : "";
            this.viewObjects.footer.allElements.classList.remove("d-none");
            this.viewObjects.footer.text.innerText = this.footer.text.value;
            this.viewObjects.footer.iconUrl.src = this.footer.icon_url.value;
            if (await isImageURLValid(this.footer.icon_url.value)) {
                this.viewObjects.footer.iconUrl.classList.remove("d-none");
            }
            else {
                this.viewObjects.footer.iconUrl.classList.add("d-none");
            }
        }

        /**
         * THUMBNAIL
         */
        this.viewObjects.thumbnail.url.src = this.thumbnail.url.value;
        if (await isImageURLValid(this.thumbnail.url.value))
            this.viewObjects.thumbnail.url.classList.remove("d-none");
        else {
            this.viewObjects.thumbnail.url.classList.add("d-none");
        }

        /**
         * IMAGES
         */
        this.viewObjects.image.url.src = this.image.url.value;
        if (await isImageURLValid(this.image.url.value))
            this.viewObjects.image.url.classList.remove("d-none");
        else {
            this.viewObjects.image.url.classList.add("d-none");
        }

        /**
         * AUTHOR
         */
        if (!this.author.name.value) {
            this.viewObjects.author.allElements.classList.add("d-none");
        } else {
            this.viewObjects.author.allElements.classList.remove("d-none");
            this.viewObjects.author.name.innerText = this.author.name.value;
            this.viewObjects.author.iconUrl.src = this.author.iconUrl.value;
            if (await isImageURLValid(this.author.iconUrl.value))
                this.viewObjects.author.iconUrl.classList.remove("d-none");
            else {
                this.viewObjects.author.iconUrl.classList.add("d-none");
            }
        }
    }

    addListeners() {
        this.author.name.addEventListener("input", () => this.refreshEmbedVisual());
        this.author.url.addEventListener("input", () => this.refreshEmbedVisual());
        this.author.iconUrl.addEventListener("input", () => this.refreshEmbedVisual());
        this.title.addEventListener("input", () => this.refreshEmbedVisual());
        this.description.addEventListener("input", () => this.refreshEmbedVisual());
        this.color.addEventListener("input", () => this.refreshEmbedVisual());
        this.url.addEventListener("input", () => this.refreshEmbedVisual());
        this.timestamp.addEventListener("input", () => this.refreshEmbedVisual());
        this.image.url.addEventListener("input", () => this.refreshEmbedVisual());
        this.thumbnail.url.addEventListener("input", () => this.refreshEmbedVisual());
        this.footer.text.addEventListener("input", () => this.refreshEmbedVisual());
        this.footer.icon_url.addEventListener("input", () => this.refreshEmbedVisual());

        this.addFieldButton.addEventListener("click", async () => this.addField());
    }

    async addField() {
        const response = await fetch('../html/field.html');
        const templateHTML = await response.text();

        const fieldInputElement = document.createElement('div');
        fieldInputElement.id = `field_${generateUniqueId()}`;
        fieldInputElement.innerHTML = templateHTML;

        fieldInputElement.querySelector(".fieldButtonParameters")
            .setAttribute("data-bs-target", `#${fieldInputElement.id} .fieldBody`);

        document.querySelector(`#embedInput${this.id} .fieldsContent`).appendChild(fieldInputElement);

        this.fields.push(
            {
                name: fieldInputElement.querySelector(".fieldName"),
                value: fieldInputElement.querySelector(".fieldValue"),
                inline: fieldInputElement.querySelector(".fieldInline"),
                fieldNumber: fieldInputElement.querySelector(".fieldNumber")
            }
        )
        await this.countAllFields();
    }

    async countAllFields() {
        let i = 1;
        for (const field of this.fields) {
            field.fieldNumber.innerText = `Field ${i}`;
            i++;
        }
    }
}

function generateUniqueId() {
    return Math.random().toString(36).substr(2, 9);
}

function isImageURLValid(imageUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve(true);
        };
        img.onerror = () => {
            resolve(false);
        };
        img.src = imageUrl;
    });
}