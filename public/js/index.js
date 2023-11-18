import * as bootstrap from 'bootstrap';
import {
  generateUniqueId,
  createMessageInput,
  createMessageVisual
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
 * @type []
 */
let localTimers = [];

/**
 * WebHook URL Input Element
 */
export const webhookUrl = document.getElementById("webhookUrl");

// Events for message parameters
webhookUrl.addEventListener("input", checkWebhookUrl);
webhookUrl.addEventListener("input", messages.forEach((mess) => { mess.checkMessageLink(); }));

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
 * General WebhookInfo
 */
export let WebHookInfo = {
  name: null,
  avatar: null
};

/**
 * Send Button
 */
export const sendButton = document.getElementById("sendButton");
sendButton.disabled = true;

// Events for sendButton
sendButton.addEventListener("click", async () => {

  const loading = document.getElementById("loadingMessage");
  loading.classList.remove("visually-hidden");
  sendButton.disabled = true;
  let messagesSend = 0;

  for (const mess of messages) {
    if (mess.messageType == TypeOfMessage.SEND) {
      const response = await sendMessage(mess.getMessage());
      if (response.success == false) {
        failModalContentSend.innerText = response.errorText;
        failModalSend.show();
        break;
      }
      messagesSend++;
    }
    else {
      const response = await editMessage(mess.getMessage());
      if (response.success == false) {
        failModalContentSend.innerText = response.errorText;
        failModalSend.show();
        break;
      }
      messagesSend++;
    }
  };

  if (messages.length == messagesSend) {
    successModalSend.show();
  }

  loading.classList.add("visually-hidden");
  sendButton.disabled = false;
});

//Webhook Url Invalid Alert
const alertInvalidWebhookUrl = new bootstrap.Collapse("#InvalidWebhookUrlCollapse", { toggle: false });

/*
 * Modals for SEND
 */
const successModalSend = new bootstrap.Modal('#successModalSend', { focus: true });
const failModalSend = new bootstrap.Modal('#failModalSend', { focus: true });
const failModalContentSend = document.getElementById("failEmbedErrorContentSend");

const messageId = generateUniqueId();
messages.push(new Message(await createMessageInput(messageId), await createMessageVisual(messageId), messageId));
displayMessagesRemoveButton();

const addMessageButton = document.getElementById("addMessage");

addMessageButton.addEventListener("click", async () => {
  const messageId = generateUniqueId();
  messages.push(new Message(await createMessageInput(messageId), await createMessageVisual(messageId), messageId));
  refreshAllLocalTimers();
  displayMessagesRemoveButton();
});

refreshAllLocalTimers();

// Message Time Set
setInterval(() => {
  let nowData = new Date();
  localTimers.forEach((ele) =>
    ele.innerText = `${nowData.toLocaleTimeString().slice(0, -3)}`)
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

/**
 * Send message in discord
 * @param {} message 
 * @returns {{success: boolean, errorText: string}}
 */
async function sendMessage(message) {
  const formData = new FormData();

  formData.append("webhookUrl", webhookUrl.value)
  if (message.content.replaceAll(/\s/g, "") != "")
    formData.append("content", message.content);
  if (message.user.username.replaceAll(/\s/g, "") != "")
    formData.append("username", message.user.username);
  if (message.user.avatar_url.replaceAll(/\s/g, "") != "")
    formData.append("avatar_url", message.user.avatar_url);

  if (message.files.length > 10) {
    return {
      success: false,
      errorText: `Error: Max files is 10`
    }
  }

  let embedArray = [];
  for (const embed of message.embeds) {
    embedArray.push(embed.getEmbed());
  }

  formData.append("embeds", JSON.stringify(
    embedArray
  ));

  for (let i = 0; i < message.files.length; i++) {
    formData.append("files", message.files[i]);
  }

  const response = await fetch("/sendMessage", {
    method: "POST",
    body: formData
  });

  const data = await response.json();
  if (data.success == true) {
    return {
      success: true,
      errorText: null
    };
  } else {
    return {
      success: false,
      errorText: `Error: ${data.error}`
    }
  }
}

/**
 * Edit message in discord
 * @param {} message 
 * @returns {{success: boolean, errorText: string}}
 */
async function editMessage(message) {
  const formData = new FormData();

  formData.append("messageLink", `${webhookUrl.value}/messages/${message.messageLink.slice(message.messageLink.lastIndexOf("/") + 1)}`)

  if (message.content.replaceAll(/\s/g, "") != "")
    formData.append("content", message.content);

  if (message.files.length > 10) {
    return {
      success: false,
      errorText: `Error: Max files is 10`
    }
  }

  let embedArray = [];
  for (const embed of message.embeds) {
    embedArray.push(embed.getEmbed());
  }
  formData.append("embeds", JSON.stringify(
    embedArray
  ));

  for (let i = 0; i < message.files.length; i++) {
    formData.append("files", message.files[i]);
  }

  formData.append("attachments", []);

  const response = await fetch("/editMessage", {
    method: "POST",
    body: formData
  });

  const data = await response.json();

  if (data.success == true) {
    return {
      success: true,
      errorText: null
    }
  } else {
    return {
      success: false,
      errorText: `Error: ${data.error}`
    }
  }
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

        WebHookInfo.name = data?.name;
        WebHookInfo.avatar = data?.avatar;

        messages.forEach((mess) => {
          mess.setWebhookInfo();
        });
      });
  } else {
    sendButton.disabled = true;

    WebHookInfo.name = null;
    WebHookInfo.avatar = null;

    messages.forEach((mess) => {
      mess.setWebhookInfo();
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

export function removeMessage(messId) {
  const messageIndex = messages.findIndex(mess => mess.id == messId);
  messages[messageIndex].removeMessage();
  messages.splice(messages.findIndex(mess => mess.id == messId), 1);
  displayMessagesRemoveButton();
}

function displayMessagesRemoveButton() {
  const anyMessagesToRemove = messages.length > 1;
  messages.forEach(mess => mess.toggleRemoveMessageButtonDisplay(anyMessagesToRemove));
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
    if (!input.classList.contains("show") && !view.classList.contains("show")) {
      input.classList.add("show");
    }
  }
}

function refreshAllLocalTimers() {
  localTimers = document.querySelectorAll(".localTime");
  localTimers.forEach((ele) =>
    ele.innerText = `${new Date().toLocaleTimeString().slice(0, -3)}`)
}