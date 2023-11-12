import * as bootstrap from 'bootstrap';
import {
  isImageURLValid,
  generateUniqueId,
  getEmbedInput,
  getEmbedVisual,
  insertAfter,
  formatText
} from './functions.js'
import {
  TypeOfMessage
} from './classes.js'
import {
  Message
} from './message.js'

const messages = [];

/**
 * WebHook URL Input Element
 */
export const webhookUrl = document.getElementById("webhookUrl");

// Events for message parameters
webhookUrl.addEventListener("input", checkWebhookUrl);
webhookUrl.addEventListener("input", messages.forEach( (mess) => { mess.checkMessageLink(); }) );

// Webhook foucs options
webhookUrl.addEventListener("focusin", (foc) => {
  webhookUrl.type = "text";
});
webhookUrl.addEventListener("focusout", (foc) => {
  webhookUrl.type = "password";
});

/**
 * Default WebHook Values
 */
 export const DefaultWebhookInfo = {
  name: 'Nort',
  avatar: 'https://cdn.discordapp.com/avatars/794288711164493864/5aa45cc104dc6af311c76b5ee58f49bb.jpg?size=1024'
};

/**
 * Send Button
 */
export const sendButton = document.getElementById("sendButton");
sendButton.disabled = true;

// Events for sendButton
sendButton.addEventListener("click", () => {
  if (messageType == TypeOfMessage.SEND)
    sendMessage();
  else
    editMessage();
});

/*
 Modals for SEND and EDIT
 */
const successModalSend = new bootstrap.Modal('#successModalSend', { focus: true });
const failModalSend = new bootstrap.Modal('#failModalSend', { focus: true });
const failModalContentSend = document.getElementById("failEmbedErrorContentSend");
const successModalEdit = new bootstrap.Modal('#successModalEdit', { focus: true });
const failModalEdit = new bootstrap.Modal('#failModalEdit', { focus: true });
const failModalContentEdit = document.getElementById("failEmbedErrorContentEdit");

messages.push(new Message());

// Message Time Set
const localTime = document.getElementById("localTime");
localTime.innerText = `${(new Date()).toLocaleTimeString().slice(0, -3)}`;
setInterval(() => {
  let nowData = new Date();
  localTime.innerText = `${nowData.toLocaleTimeString().slice(0, -3)}`
}, 1000);

// Check View For WebSite Width
checkSize();
window.addEventListener('resize', checkSize);

// Tooltips support
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
let tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl,
  {
    trigger: "hover",
    delay: { show: 100, hide: 100 }
  }))

// Functions
function sendMessage() {
  const loading = document.getElementById("loadingMessage");
  loading.classList.remove("visually-hidden");
  sendButton.disabled = true;

  const formData = new FormData();

  formData.append("webhookUrl", webhookUrl.value)
  if (content.value.replaceAll(/\s/g, "") != "")
    formData.append("content", content.value);
  if (username.value.replaceAll(/\s/g, "") != "")
    formData.append("username", username.value);
  if (avatar_url.value.replaceAll(/\s/g, "") != "")
    formData.append("avatar_url", avatar_url.value);

  if (files.files.length > 10) {
    failModalContentSend.innerText = `Error: Max files is 10`;
    loading.classList.add("visually-hidden");
    sendButton.disabled = false;
    return failModalSend.show();
  }

  let embedArray = [];
  for (const embed of embeds) {
    embedArray.push(embed.getEmbed());
  }
  formData.append("embeds", JSON.stringify(
    embedArray
  ));

  for (let i = 0; i < files.files.length; i++) {
    formData.append("files", files.files[i]);
  }

  fetch("/sendMessage", {
    method: "POST",
    body: formData
  })
    .then((response) => response.json())
    .then((data) => {
      loading.classList.add("visually-hidden");
      sendButton.disabled = false;

      if (data.success == true) {
        successModalSend.show();
      } else {
        failModalContentSend.innerText = `Error: ${data.error}`;
        failModalSend.show();
      }
    });
}

function editMessage() {
  const loading = document.getElementById("loadingMessage");
  loading.classList.remove("visually-hidden");
  sendButton.disabled = true;

  const formData = new FormData();

  formData.append("messageLink", `${webhookUrl.value}/messages/${messageLink.value.slice(messageLink.value.lastIndexOf("/") + 1)}`)

  if (content.value.replaceAll(/\s/g, "") != "")
    formData.append("content", content.value);

  if (files.files.length > 10) {
    failModalContentSend.innerText = `Error: Max files is 10`;
    loading.classList.add("visually-hidden");
    sendButton.disabled = false;
    return failModalSend.show();
  }

  let embedArray = [];
  for (const embed of embeds) {
    embedArray.push(embed.getEmbed());
  }
  formData.append("embeds", JSON.stringify(
    embedArray
  ));

  for (let i = 0; i < files.files.length; i++) {
    formData.append("files", files.files[i]);
  }

  fetch("/editMessage", {
    method: "POST",
    body: formData
  })
    .then((response) => response.json())
    .then((data) => {
      loading.classList.add("visually-hidden");
      sendButton.disabled = false;

      if (data.success == true) {
        successModalEdit.show();
      } else {
        failModalContentEdit.innerText = `Error: ${data.error}`;
        failModalEdit.show();
      }
    });
}

export function checkWebhookUrl() {
  if (isCorrectWebhookURL(webhookUrl.value)) {
    const formData = new FormData();
    formData.append("webhookUrl", webhookUrl.value);
    fetch("/isWebhook", {
      method: "POST",
      body: formData
    })
      .then((response) => response.json())
      .then((data) => {
        sendButton.disabled = !data.success;
        data.success == true ? alertInvalidWebhookUrl.hide() : alertInvalidWebhookUrl.show();

        WebHookInfo.name = data?.name;
        WebHookInfo.avatar = data?.avatar;
      });
  } else {
    sendButton.disabled = true;
    WebHookInfo.name = null;
    WebHookInfo.avatar = null;
  }
  changeView();
}

export function isCorrectWebhookURL(WebhookUrl) {
  let res = WebhookUrl
    .replaceAll(/\s/g, "")
    .startsWith("https://discord.com/api/webhooks/");

  if (WebhookUrl.replaceAll(/\s/g, "") == "") alertInvalidWebhookUrl.hide();
  else if (res == false) alertInvalidWebhookUrl.show();
  return res == true;
}

export function refreshTooltips() {
  tooltipList.map(tooltipTriggerEl => {
    tooltipTriggerEl.dispose()
  })

  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
  tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl,
    {
      trigger: "hover",
      delay: { show: 100, hide: 100 }
    }))
}

function checkSize() {
  const currentWidth = window.innerWidth;
  const input = document.getElementById('inputs');
  const view = document.getElementById('messageView');
  if (currentWidth >= 768) {
    input.classList.add("show");
    view.classList.add("show");
    input.classList.add("overflow-y-scroll");
    view.classList.add("overflow-y-scroll");
    input.classList.remove("h-auto");
    view.classList.remove("h-auto");
  } else {
    input.classList.remove("overflow-y-scroll");
    view.classList.remove("overflow-y-scroll");
    input.classList.add("h-auto");
    view.classList.add("h-auto");
  }
}