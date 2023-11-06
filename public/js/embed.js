import { generateUniqueId, insertAfter } from './functions.js'

/**
 * Create Embed
 * @param id Id of Embed
 */
export class Embed {

    constructor(inputEmbed, visualEmbed, id) {
        this.inputEmbed = inputEmbed;
        this.visualEmbed = visualEmbed;
        this.setId(id);

        this.embedNumber = inputEmbed.querySelector(".embedId");
        this.embedName = inputEmbed.querySelector(".embedName");
        this.removeButton = inputEmbed.querySelector(".embedButtonRemove");
        this.duplicateButton = inputEmbed.querySelector(".embedButtonDuplicate");
        this.upButton = inputEmbed.querySelector(".embedButtonUp");
        this.downButton = inputEmbed.querySelector(".embedButtonDown")

        this.addFieldButton = inputEmbed.querySelector(".addFieldButton");

        this.author = {
            name: inputEmbed.querySelector(".authorName"),
            url: inputEmbed.querySelector(".authorUrl"),
            icon_url: inputEmbed.querySelector(".authorIconUrl")
        };
        this.title = inputEmbed.querySelector(".title");
        this.description = inputEmbed.querySelector(".description");
        this.color = inputEmbed.querySelector(".color");
        this.url = inputEmbed.querySelector(".url");
        this.fields = [];
        this.timestamp = inputEmbed.querySelector(".timestamp");
        this.image = { url: inputEmbed.querySelector(".imagesUrl") };
        this.thumbnail = { url: inputEmbed.querySelector(".thumbnailUrl") };
        this.footer = {
            text: inputEmbed.querySelector(".footerText"),
            icon_url: inputEmbed.querySelector(".footerIconUrl")
        };
        this.viewObjects = {
            color: this.visualEmbed.querySelector(".colorVisual"),
            title: this.visualEmbed.querySelector(".titleVisual"),
            description: this.visualEmbed.querySelector(".descriptionVisual"),
            url: this.visualEmbed.querySelector(".urlVisual"),
            timestamp: this.visualEmbed.querySelector(".timestampVisual"),
            footer: {
                text: this.visualEmbed.querySelector(".footerTextVisual"),
                iconUrl: this.visualEmbed.querySelector(".footerIconUrlVisual"),
                url: this.visualEmbed.querySelector(".footerUrlVisual"),
                allElements: this.visualEmbed.querySelector(".footer")
            },
            thumbnail: { url: this.visualEmbed.querySelector(".thumbnailVisual") },
            image: { url: this.visualEmbed.querySelector(".imageVisual") },
            author: {
                name: this.visualEmbed.querySelector(".authorNameVisual"),
                iconUrl: this.visualEmbed.querySelector(".authorIconUrlVisual"),
                url: this.visualEmbed.querySelector(".authorUrlVisual"),
                allElements: this.visualEmbed.querySelector(".author"),
            },
            fields: []
        }

        this.addListeners();
    };

    getEmbed() {
        const embedObject = {};

        if (this.author.name.value)
            embedObject.author = { name: this.author.name.value, url: this.author.url.value, icon_url: this.author.icon_url.value };
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
        if (this.fields.length > 0) {
            embedObject.fields = this.getFields();
        }

        return embedObject;
    }

    async setEmbed(embed) {
        this.author.name.value = embed?.author?.name ?? "";
        this.author.url.value = embed?.author?.url ?? "";
        this.author.icon_url.value = embed?.author?.icon_url ?? "";

        this.title.value = embed?.title ?? "";
        this.description.value = embed?.description ?? "";
        this.color.value = "#" + embed?.color.toString(16).padStart(6, "0") ?? "";
        this.url.value = embed?.url ?? "";
        this.timestamp.value = embed?.timestamp ?? "";

        this.image.url.value = embed?.image?.url ?? "";
        this.thumbnail.url.value = embed?.thumbnail?.url ?? "";

        this.footer.text.value = embed?.footer?.text ?? "";
        this.footer.icon_url.value = embed?.footer?.icon_url ?? "";

        if (embed?.fields != null && embed.fields?.length > 0) {
            console.log(embed?.fields);
            await this.setFields(embed?.fields)
        }
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
            this.viewObjects.author.iconUrl.src = this.author.icon_url.value;
            if (await isImageURLValid(this.author.icon_url.value))
                this.viewObjects.author.iconUrl.classList.remove("d-none");
            else {
                this.viewObjects.author.iconUrl.classList.add("d-none");
            }
        }

        for (let i = 0; i < this.fields.length; i++) {
            this.viewObjects.fields[i].name.innerText = this.fields[i].name.value;
            this.viewObjects.fields[i].value.innerText = this.fields[i].value.value;

            if (this.fields[i].inline.checked)
                this.viewObjects.fields[i].colElementInline.classList.remove("col-12");
            else
                this.viewObjects.fields[i].colElementInline.classList.add("col-12");
        }
    }

    addListeners() {
        this.inputEmbed.addEventListener("input", () => this.refreshEmbedVisual());
        this.addFieldButton.addEventListener("click", async () => this.addField());
    }

    getFields() {
        return this.fields.map(field => ({
            name: field.name.value,
            value: field.value.value,
            inline: field.inline.checked
        }));
    }

    async addField(values = null) {
        const uniqueFieldId = generateUniqueId();

        //FIELD INPUT
        const fieldInputFetch = await fetch('../html/fieldInput.html');
        const fieldInputHTML = await fieldInputFetch.text();

        const fieldInputElement = document.createElement('div');
        fieldInputElement.id = `fieldInput_${uniqueFieldId}`;
        fieldInputElement.innerHTML = fieldInputHTML;

        fieldInputElement.querySelector(".fieldButtonParameters")
            .setAttribute("data-bs-target", `#${fieldInputElement.id} .fieldBody`);
        fieldInputElement.querySelector(".fieldInline")
            .setAttribute(`id`, `fieldInline_${uniqueFieldId}`);
        fieldInputElement.querySelector(".fieldInlineLabel")
            .setAttribute(`for`, `fieldInline_${uniqueFieldId}`);

        fieldInputElement.querySelector(".fieldButtonRemove")
            .addEventListener("click", async () => await this.removeField(fieldInputElement, fieldVisualElement));

        fieldInputElement.querySelector(".fieldButtonDuplicate")
            .addEventListener("click", async () => await this.duplicateField(uniqueFieldId));

        if (values) {
            fieldInputElement.querySelector(".fieldName").value = values.name;
            fieldInputElement.querySelector(".fieldValue").value = values.value;
            fieldInputElement.querySelector(".fieldInline").checked = values.inline;
        }

        this.fields.push(
            {
                id: uniqueFieldId,
                name: fieldInputElement.querySelector(".fieldName"),
                value: fieldInputElement.querySelector(".fieldValue"),
                inline: fieldInputElement.querySelector(".fieldInline"),
                fieldNumber: fieldInputElement.querySelector(".fieldNumber"),
                fieldRemoveButton: fieldInputElement.querySelector(".fieldButtonRemove")
            }
        )

        //FIELD VISUAL
        const fieldVisualFetch = await fetch('../html/fieldVisual.html');
        const fieldVisualHTML = await fieldVisualFetch.text();

        const fieldVisualElement = document.createElement('div');
        fieldVisualElement.id = `fieldVisual_${uniqueFieldId}`;
        fieldVisualElement.innerHTML = fieldVisualHTML;
        fieldVisualElement.classList.add("col");

        this.viewObjects.fields.push(
            {
                id: uniqueFieldId,
                name: fieldVisualElement.querySelector(".fieldVisualName"),
                value: fieldVisualElement.querySelector(".fieldVisualValue"),
                colElementInline: fieldVisualElement
            }
        )

        //SHOW FIELDS
        await this.countAllFields();
        await this.checkMaxFields();
        document.querySelector(`#embedInput${this.id} .fieldsContent`).appendChild(fieldInputElement);
        document.querySelector(`#embedVisual${this.id} .fieldsContent`).appendChild(fieldVisualElement);

        return uniqueFieldId;
    }

    removeField(fieldInputElement, fieldVisualElement) {
        this.fields.splice(
            this.fields.findIndex((obj) => obj.name == fieldInputElement.querySelector(".fieldName"))
            , 1
        );
        this.viewObjects.fields.splice(
            this.viewObjects.fields.findIndex((obj) => obj.name == fieldVisualElement.querySelector(".fieldVisualName"))
            , 1
        )
        fieldInputElement.remove();
        fieldVisualElement.remove();

        this.countAllFields();
        this.checkMaxFields();
    }

    async duplicateField(firstFieldid) {
        if (this.fields.length < 25) {
            const indexFirstField = this.fields.findIndex(ele => ele.id == firstFieldid);
            const fieldId = await this.addField(
                {
                    name: this.fields[indexFirstField].name.value,
                    value: this.fields[indexFirstField].value.value,
                    inline: this.fields[indexFirstField].inline.checked
                }
            )

            this.countAllFields();
            this.checkMaxFields();
            this.refreshEmbedVisual();
        }
    }

    async setFields(fields) {
        for (let i = 0; i < fields.length; i++) {
            await this.addField(
                {
                    name: fields[i].name,
                    value: fields[i].value,
                    inline: fields[i].inline
                }
            );
        }
    }

    async countAllFields() {
        let i = 1;
        for (const field of this.fields) {
            field.fieldNumber.innerText = `Field ${i} `;
            i++;
        }
    }

    async checkMaxFields() {
        if (this.fields.length >= 25) {
            this.addFieldButton.disabled = true;
        } else {
            this.addFieldButton.disabled = false;
        }
    }

    async setNumber(number) {
        this.embedNumber.innerText = `Embed ${number + 1} `
        this.refreshEmbedVisual();
    }

    setId(id) {
        this.id = id;
        this.inputEmbed.id = "embedInput" + id;
        this.visualEmbed.id = "embedVisual" + id;

        this.inputEmbed.querySelector(".embedButtonCollapse")
            .setAttribute("data-bs-target", `#${this.inputEmbed.id} .embedCollapse`)

        this.inputEmbed.querySelector(".authorButtonOptions")
            .setAttribute("data-bs-target", `#${this.inputEmbed.id} .authorOptions`)

        this.inputEmbed.querySelector(".bodyButtonOptions")
            .setAttribute("data-bs-target", `#${this.inputEmbed.id} .bodyOptions`)

        this.inputEmbed.querySelector(".fieldsButtonOptions")
            .setAttribute("data-bs-target", `#${this.inputEmbed.id} .fieldsOptions`)

        this.inputEmbed.querySelector(".imagesButtonOptions")
            .setAttribute("data-bs-target", `#${this.inputEmbed.id} .imagesOptions`)

        this.inputEmbed.querySelector(".footerButtonOptions")
            .setAttribute("data-bs-target", `#${this.inputEmbed.id} .footerOptions`)
    }

    removeEmbed() {
        this.inputEmbed.remove();
        this.visualEmbed.remove();
    }
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