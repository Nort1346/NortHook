export class Embed {
    constructor(inputEmbed) {
        this.author = {
            name: inputEmbed.querySelector("#authorName"),
            url: inputEmbed.querySelector("#authorUrl"),
            iconUrl: inputEmbed.querySelector("#authorIconUrl")
        };
        this.title = inputEmbed.querySelector("#title");
        this.description = inputEmbed.querySelector("#description");
        this.color = inputEmbed.querySelector("#description");
        this.url = inputEmbed.querySelector("#url");
        this.fields = [
            {
                name: inputEmbed.querySelector("#nameField"),
                value: inputEmbed.querySelector("#valueField"),
                inline: inputEmbed.querySelector("#inlineField")
            }
        ];
        this.timestamp = inputEmbed.querySelector("#timestamp");
        this.image = { url: inputEmbed.querySelector("#imagesUrl") };
        this.thumbnail = { url: inputEmbed.querySelector("#thumbnailUrl") };
        this.footer = {
            text: inputEmbed.querySelector("#footerText"),
            icon_url: inputEmbed.querySelector("#footerIconUrl")
        };

        this.viewObjects
    };

    getEmbed() {
        const embedObject = {};

        if (this.author.name)
            embedObject.author = { name: this.author.name.value, url: this.author.url.value, iconUrl: this.author.iconUrl.value };
        if (this.title.value)
            embedObject.title = this.title.value;
        if (this.description.value)
            embedObject.description = this.description.value;
        if (this.color.value)
            embedObject.color = this.color.value;
        if (this.url.value)
            embedObject.url = this.url.value;
        if (this.timestamp.value)
            embedObject.timestamp = this.timestamp.value;
        if (this.image.url.value)
            embedObject.image = { url: this.image.url.value };
        if (this.thumbnail.url.value)
            embedObject.thumbnail = { url: this.thumbnail.url.value };
        if (this.footer.text.value)
            embedObject.footer = { text: this.footer.text.value, iconUrl: this.footer.icon_url.value }
        if (this.fields[0].name.value && this.fields[0].value.value)
            embedObject.fields = { name: this.fields[0].name.value, value: this.fields[0].value.value, inline: this.fields[0].inline.value }

        return embedObject;
    }
}