import { generateUniqueId, isImageURLValid, formatText } from './functions.js';
import { refreshTooltips } from './index.js';

/**
 * Create Embed
 * @param {HTMLDivElement} inputEmbed Input Element
 * @param {HTMLDivElement} visualEmbed Visual Element
 * @param {Number} id Id of Embed
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
            }
        }

        this.#addListeners();
    };
    /**
     * Get embed element
     * @returns Embed element
     */
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
    /**
     * Set embed values
     * @param {*} embed Embed element
     */
    async setEmbed(embed) {
        this.author.name.value = embed?.author?.name?.substring(0, 256) ?? "";
        this.author.url.value = embed?.author?.url?.substring(0, 2048) ?? "";
        this.author.icon_url.value = embed?.author?.icon_url?.substring(0, 2048) ?? "";

        this.title.value = embed?.title?.substring(0, 256) ?? "";
        this.description.value = embed?.description?.substring(0, 2048) ?? "";
        this.color.value = "#" + embed?.color?.toString(16)?.padStart(6, "0") ?? "";
        this.url.value = embed?.url?.substring(0, 2000) ?? "";

        const date = new Date(embed?.timestamp);
        if (!isNaN(date.getTime()))
            this.timestamp.value = date?.toISOString()?.slice(0, 16) ?? "";

        this.image.url.value = embed?.image?.url?.substring(0, 2048) ?? "";
        this.thumbnail.url.value = embed?.thumbnail?.url?.substring(0, 256) ?? "";

        this.footer.text.value = embed?.footer?.text ?? "";
        this.footer.icon_url.value = embed?.footer?.icon_url ?? "";

        if (embed?.fields != null && embed.fields?.length > 0) {
            await this.setFields(embed?.fields)
        }

        await this.refreshEmbedVisual();
    }
    /**
     * Refresh embed visual
     */
    async refreshEmbedVisual() {
        /**
         * EMBED NAME
         */
        if (this.title.value) {
            this.embedName.innerText = `- ${this.title.value}`;
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
        this.viewObjects.title.innerHTML = formatText(this.title.value);
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
        this.viewObjects.description.innerHTML = formatText(this.description.value);

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
            if (await isImageURLValid(this.footer.icon_url.value)) {
                this.viewObjects.footer.iconUrl.src = this.footer.icon_url.value;
                this.viewObjects.footer.iconUrl.classList.remove("d-none");
            }
            else {
                this.viewObjects.footer.iconUrl.classList.add("d-none");
            }
        }

        /**
         * THUMBNAIL
         */
        if (await isImageURLValid(this.thumbnail.url.value)) {
            this.viewObjects.thumbnail.url.src = this.thumbnail.url.value;
            this.viewObjects.thumbnail.url.classList.remove("d-none");
        } else {
            this.viewObjects.thumbnail.url.classList.add("d-none");
        }

        /**
         * IMAGES
         */
        if (await isImageURLValid(this.image.url.value)) {
            this.viewObjects.image.url.src = this.image.url.value;
            this.viewObjects.image.url.classList.remove("d-none");
        } else {
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
            if (await isImageURLValid(this.author.icon_url.value)) {
                this.viewObjects.author.iconUrl.src = this.author.icon_url.value;
                this.viewObjects.author.iconUrl.classList.remove("d-none");
            } else {
                this.viewObjects.author.iconUrl.classList.add("d-none");
            }
        }

        for (let i = 0; i < this.fields.length; i++) {
            this.fields[i].fieldVisual.name.innerHTML = formatText(this.fields[i].name.value);
            this.fields[i].fieldVisual.value.innerHTML = formatText(this.fields[i].value.value);

            if (this.fields[i].inline.checked)
                this.fields[i].fieldVisual.colElementInline.classList.remove("col-12");
            else
                this.fields[i].fieldVisual.colElementInline.classList.add("col-12");
        }
    }
    
    #addListeners() {
        this.inputEmbed.addEventListener("input", () => this.refreshEmbedVisual());
        this.addFieldButton.addEventListener("click", async () => this.addField());
    }
    /**
     * Get array of field element
     * @returns Array of field element
     */
    getFields() {
        return this.fields.map(field => ({
            name: field.name.value,
            value: field.value.value,
            inline: field.inline.checked
        }));
    }
    /**
     * Add new field in fields array
     * @param {*} values Field Element
     * @returns Id of field
     */
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
            .addEventListener("click", async () => await this.removeField(uniqueFieldId));

        fieldInputElement.querySelector(".fieldButtonDuplicate")
            .addEventListener("click", async () => await this.duplicateField(uniqueFieldId));

        fieldInputElement.querySelector(".fieldButtonUp")
            .addEventListener("click", async () => this.fieldUp(uniqueFieldId));

        fieldInputElement.querySelector(".fieldButtonDown")
            .addEventListener("click", async () => this.fieldDown(uniqueFieldId));

        fieldInputElement.querySelector(".fieldName")
            .addEventListener("input", () => this.countAndTitleAllFields());

        if (values) {
            fieldInputElement.querySelector(".fieldName").value = values.name;
            fieldInputElement.querySelector(".fieldValue").value = values.value;
            fieldInputElement.querySelector(".fieldInline").checked = values.inline;
        }

        //FIELD VISUAL
        const fieldVisualFetch = await fetch('../html/fieldVisual.html');
        const fieldVisualHTML = await fieldVisualFetch.text();

        const fieldVisualElement = document.createElement('div');
        fieldVisualElement.id = `fieldVisual_${uniqueFieldId}`;
        fieldVisualElement.innerHTML = fieldVisualHTML;
        fieldVisualElement.classList.add("col");

        this.fields.push(
            {
                id: uniqueFieldId,
                name: fieldInputElement.querySelector(".fieldName"),
                value: fieldInputElement.querySelector(".fieldValue"),
                inline: fieldInputElement.querySelector(".fieldInline"),
                fieldNumber: fieldInputElement.querySelector(".fieldNumber"),
                fieldRemoveButton: fieldInputElement.querySelector(".fieldButtonRemove"),
                fieldUpButton: fieldInputElement.querySelector(".fieldButtonUp"),
                fieldDownButton: fieldInputElement.querySelector(".fieldButtonDown"),
                fieldTitle: fieldInputElement.querySelector(".fieldTitle"),
                fieldVisual: {
                    id: uniqueFieldId,
                    name: fieldVisualElement.querySelector(".fieldVisualName"),
                    value: fieldVisualElement.querySelector(".fieldVisualValue"),
                    colElementInline: fieldVisualElement
                }
            }
        )

        //SHOW FIELDS
        await this.countAndTitleAllFields();
        await this.checkMaxFields();
        await this.checkArrowsFields();
        document.querySelector(`#embedInput${this.id} .fieldsContent`).appendChild(fieldInputElement);
        document.querySelector(`#embedVisual${this.id} .fieldsContent`).appendChild(fieldVisualElement);

        refreshTooltips();
        return uniqueFieldId;
    }
    /**
     * Remove Field
     * @param {Number} fieldId Id of field
     */
    removeField(fieldId) {
        const fieldIndex = this.fields.findIndex((obj) => obj.id == fieldId)
        this.fields.splice(
            fieldIndex
            , 1
        );

        document.getElementById(`fieldInput_${fieldId}`).remove();
        document.getElementById(`fieldVisual_${fieldId}`).remove();

        this.countAndTitleAllFields();
        this.checkMaxFields();
        refreshTooltips();
    }
    /**
     * Duplicate Field
     * @param {*} firstFieldid 
     */
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

            this.countAndTitleAllFields();
            this.checkMaxFields();
            this.refreshEmbedVisual();
        }
    }
    /**
     * Move field Up
     * @param {Number} fieldId 
     */
    fieldUp(fieldId) {
        const indexOfRemoveEmbed = this.fields.findIndex(ele => ele.id == fieldId);
        if (indexOfRemoveEmbed >= 0) {
            const temp = this.fields.splice(indexOfRemoveEmbed, 1)[0];
            this.fields.splice(indexOfRemoveEmbed - 1, 0, temp);

            document.getElementById(`fieldInput_${fieldId}`)
                .insertAdjacentElement("afterend", document.getElementById(`fieldInput_${this.fields[indexOfRemoveEmbed].id}`));

            document.getElementById(`fieldVisual_${fieldId}`)
                .insertAdjacentElement("afterend", document.getElementById(`fieldVisual_${this.fields[indexOfRemoveEmbed].id}`));

            this.countAndTitleAllFields();
            this.checkArrowsFields();
        }
    }
    /**
     * Move field Down
     * @param {Number} fieldId 
     */
    fieldDown(fieldId) {
        const indexOfRemoveEmbed = this.fields.findIndex(ele => ele.id == fieldId);
        if (indexOfRemoveEmbed >= 0) {
            const temp = this.fields.splice(indexOfRemoveEmbed, 1)[0];
            this.fields.splice(indexOfRemoveEmbed + 1, 0, temp);

            document.getElementById(`fieldInput_${fieldId}`)
                .insertAdjacentElement("beforebegin", document.getElementById(`fieldInput_${this.fields[indexOfRemoveEmbed].id}`));

            document.getElementById(`fieldVisual_${fieldId}`)
                .insertAdjacentElement("beforebegin", document.getElementById(`fieldVisual_${this.fields[indexOfRemoveEmbed].id}`));

            this.countAndTitleAllFields();
            this.checkArrowsFields();
        }
    }
    /**
     * Set fields
     * @param {*} fields  Fields array
     */
    async setFields(fields) {
        this.fields = [];
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
    /**
     * Checking whether the field should have move down and move up options
     */
    async checkArrowsFields() {
        this.fields.map((emb, index) => {
            emb.fieldUpButton.disabled = false;
            emb.fieldUpButton.classList.remove("d-none");

            emb.fieldDownButton.disabled = false;
            emb.fieldDownButton.classList.remove("d-none");

            if (index == 0) {
                emb.fieldUpButton.disabled = true;
                emb.fieldUpButton.classList.add("d-none");
            }
            if (index == this.fields.length - 1) {
                emb.fieldDownButton.disabled = true;
                emb.fieldDownButton.classList.add("d-none");
            }
        });
    }
    /**
     * Count and title all fields and change number in theirs headers
     */
    async countAndTitleAllFields() {
        let i = 1;
        for (const field of this.fields) {
            field.fieldNumber.innerText = `Field ${i} `;
            if (field.name.value.trimStart() !== "") {
                field.fieldTitle.innerText = `- ${field.name.value.trimStart().trimEnd().substring(0, 20)}`;
            } else {
                field.fieldTitle.innerText = "";
            }
            i++;
        }
    }
    /**
     * Check whether the field is at its maximum and block the 'Add Field' button
     */
    async checkMaxFields() {
        if (this.fields.length >= 25) {
            this.addFieldButton.disabled = true;
        } else {
            this.addFieldButton.disabled = false;
        }
    }
    /**
     * Set embed number in the header
     * @param {Number} number Number of embed to display
     */
    async setEmbedNumber(number) {
        this.embedNumber.innerText = `Embed ${number + 1} `
        this.refreshEmbedVisual();
    }
    /**
     * Set embed unique id
     * @param {number} id Unique number of embed
     */
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
    /**
     * Remove embed visual
     */
    removeEmbed() {
        this.inputEmbed.remove();
        this.visualEmbed.remove();
    }

}