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

/**
 * @type [Message]
 */
const messages = [];

/**
 * WebHook URL Input Element
 */
export const webhookUrl = document.getElementById("webhookUrl");

// Events for message parameters
webhookUrl.addEventListener("input", checkWebhookUrl);
webhookUrl.addEventListener("input", messages.forEach( (mess) => { mess.checkMessageLink(); }) );

// Webhook foucs options
webhookUrl.addEventListener("focusin", () => {
  webhookUrl.type = "text";
});
webhookUrl.addEventListener("focusout", () => {
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
  messages.forEach((mess) => {
    if (mess.messageType == TypeOfMessage.SEND)
      sendMessage(mess.getMessage());
    else
      editMessage(mess.getMessage());
  })
});

//Webhook Url Invalid Alert
const alertInvalidWebhookUrl = new bootstrap.Collapse("#InvalidWebhookUrlCollapse", { toggle: false });

/*
 * Modals for SEND and EDIT
 */
const successModalSend = new bootstrap.Modal('#successModalSend', { focus: true });
const failModalSend = new bootstrap.Modal('#failModalSend', { focus: true });
const failModalContentSend = document.getElementById("failEmbedErrorContentSend");
const successModalEdit = new bootstrap.Modal('#successModalEdit', { focus: true });
const failModalEdit = new bootstrap.Modal('#failModalEdit', { focus: true });
const failModalContentEdit = document.getElementById("failEmbedErrorContentEdit");

const messageInput = document.getElementById("messagesInput");
const messageVisual = document.getElementById("messagesVisual");
messages.push(new Message(messageInput, messageVisual));

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
function sendMessage(message) {
  const loading = document.getElementById("loadingMessage");
  loading.classList.remove("visually-hidden");
  sendButton.disabled = true;

  const formData = new FormData();

  formData.append("webhookUrl", webhookUrl.value)
  if (content.value.replaceAll(/\s/g, "") != "")
    formData.append("content", message.content);
  if (username.value.replaceAll(/\s/g, "") != "")
    formData.append("username", message.user.username);
  if (avatar_url.value.replaceAll(/\s/g, "") != "")
    formData.append("avatar_url", message.user.avatar_url);

  if (message.files.length > 10) {
    failModalContentSend.innerText = `Error: Max files is 10`;
    loading.classList.add("visually-hidden");
    sendButton.disabled = false;
    return failModalSend.show();
  }

  let embedArray = [];
  for (const embed of message.embeds) {
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

function editMessage(message) {
  const loading = document.getElementById("loadingMessage");
  loading.classList.remove("visually-hidden");
  sendButton.disabled = true;

  const formData = new FormData();

  formData.append("messageLink", `${webhookUrl.value}/messages/${message.messageLink.slice(message.messageLink.lastIndexOf("/") + 1)}`)

  if (content.value.replaceAll(/\s/g, "") != "")
    formData.append("content", message.content);

  if (message.files.length > 10) {
    failModalContentSend.innerText = `Error: Max files is 10`;
    loading.classList.add("visually-hidden");
    sendButton.disabled = false;
    return failModalSend.show();
  }

  let embedArray = [];
  for (const embed of message.embeds) {
    embedArray.push(embed.getEmbed());
  }
  formData.append("embeds", JSON.stringify(
    embedArray
  ));

  for (let i = 0; i < message.files.length; i++) {
    formData.append("files", messages.files[i]);
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
  if (isCorrectWebhookURL()) {
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

        messages.forEach((mess) => {
          mess.webhookInfo.name = data?.name;
          mess.webhookInfo.avatar = data?.avatar;
        });
      });
  } else {
    sendButton.disabled = true;
    messages.forEach((mess) => {
      mess.webhookInfo.name = null;
      mess.webhookInfo.avatar = null;
      mess.changeView();
    });
  }
}

export function isCorrectWebhookURL() {
  let res = webhookUrl.value
    .replaceAll(/\s/g, "")
    .startsWith("https://discord.com/api/webhooks/");

  if (webhookUrl.value.replaceAll(/\s/g, "") == "") alertInvalidWebhookUrl.hide();
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