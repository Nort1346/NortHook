import * as bootstrap from 'bootstrap';
import {
  generateUniqueId,
  createMessageInput,
  createMessageVisual,
  createWebhookUrlInput
} from './functions.js'
import {
  TypeOfMessage,
  WebhookUrl
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
 * @type boolean
 */
export let webhooksUrlGood = false;

/**
 * Array of WebHook URL Input Element
 * @type WebhookUrl[]
 */
export const webhooksUrl = [
  new WebhookUrl(
    0,
    document.getElementById("webhookUrl"),
    new bootstrap.Collapse("#InvalidWebhookUrlCollapse", { toggle: false })
  )
];


// Events for webhook
webhooksUrl[0].input.addEventListener("input", () => checkWebhookUrl(0));
webhooksUrl[0].input.addEventListener("focusin", () => {
  webhooksUrl[0].input.type = "text";
});
webhooksUrl[0].input.addEventListener("focusout", () => {
  webhooksUrl[0].input.type = "password";
});

const addWebhookButton = document.getElementById("addWebhook");
addWebhookButton.addEventListener("click", addWebhook);

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
 * Options buttons
 */
const clearAllButton = document.getElementById("clearAllMessages");

clearAllButton.addEventListener("click", () => {
  messages.forEach((mess, index) => {
    if (index != 0) mess.removeMessage();
    else {
      mess.clearMessage();
      mess.toggleRemoveMessageButtonDisplay(false);
    }
  });
  messages.slice(0);
});

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

  for (const webhook of webhooksUrl) {
    let error = false;
    for (const mess of messages) {
      if (mess.messageType == TypeOfMessage.SEND) {
        const response = await sendMessage(webhook.input.value, mess.getMessage());
        if (response.success == false) {
          failModalContentSend.innerText = response.errorText;
          failModalSend.show();
          error = true;
          break;
        }
        messagesSend++;
      }
      else {
        const response = await editMessage(webhook.input.value, mess.getMessage());
        if (response.success == false) {
          failModalContentSend.innerText = response.errorText;
          failModalSend.show();
          error = true;
          break;
        }
        messagesSend++;
      }
    }
    if (error) break;
  };

  if (messages.length == messagesSend / webhooksUrl.length) {
    if (messagesSend > 1) {
      successModalText.innerHTML = "Messages Sent";
    } else {
      successModalText.innerHTML = "Message Sent";
    }
    successModalSend.show();
  }

  loading.classList.add("visually-hidden");
  sendButton.disabled = false;
});


/*
 * Modals for SEND
 */
const successModalSend = new bootstrap.Modal('#successModalSend', { focus: true });
const successModalText = document.getElementById("successModalText");

const failModalSend = new bootstrap.Modal('#failModalSend', { focus: true });
const failModalContentSend = document.getElementById("failEmbedErrorContentSend");

createMessage();
const addMessageButton = document.getElementById("addMessage");
addMessageButton.addEventListener("click", async () => await createMessage());

refreshAllLocalTimers();

// Message Time Set
setInterval(() => {
  let nowData = new Date();
  const minutes = nowData.getMinutes();
  localTimers.forEach((ele) =>
    ele.innerText = `${nowData.getHours()}:${minutes < 10 ? '0' : ''}${minutes}`)
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
async function sendMessage(webhookUrl, message) {
  const formData = new FormData();

  formData.append("webhookUrl", webhookUrl)
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

  formData.append("embeds", JSON.stringify(
    message.embeds
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
      success: data.success,
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
async function editMessage(webhookUrl, message) {
  const formData = new FormData();

  formData.append("messageLink", `${webhookUrl}/messages/${message.messageLink.slice(message.messageLink.lastIndexOf("/") + 1)}`)

  if (message.content.replaceAll(/\s/g, "") != "")
    formData.append("content", message.content);

  if (message.files.length > 10) {
    return {
      success: false,
      errorText: `Error: Max files is 10`
    }
  }

  formData.append("embeds", JSON.stringify(
    message.embeds
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

async function createMessage() {
  const messageId = generateUniqueId();
  messages.push(new Message(await createMessageInput(messageId), await createMessageVisual(messageId), messageId));
  refreshAllLocalTimers();
  displayMessagesRemoveButton();
}

export function checkWebhookUrl(indexOfWebhookUrl) {
  if (isCorrectWebhookURL(indexOfWebhookUrl)) {
    const formData = new FormData();
    formData.append("webhookUrl", webhooksUrl[indexOfWebhookUrl].input.value);
    fetch("/isWebhook", {
      method: "POST",
      body: formData
    })
      .then((response) => response.json())
      .then((data) => {
        data.success == true ?
          webhooksUrl[indexOfWebhookUrl].alert.hide()
          : webhooksUrl[indexOfWebhookUrl].alert.show();
        webhooksUrl[indexOfWebhookUrl].verify = data.success;

        webhooksUrl[indexOfWebhookUrl].webHookInfo.name = data?.name;
        webhooksUrl[indexOfWebhookUrl].webHookInfo.avatar = data?.avatar;
        verifyWebhookUrls();

        messages.forEach((mess) => {
          mess.setWebhookInfo();
          mess.checkMessageLink();
        });
      });
  } else {
    webhooksUrl[indexOfWebhookUrl].webHookInfo.name = null;
    webhooksUrl[indexOfWebhookUrl].webHookInfo.name = null;

    verifyWebhookUrls();

    messages.forEach((mess) => {
      mess.setWebhookInfo();
    });
  }
}

export function isCorrectWebhookURL(indexOfWebhookUrl) {
  let res = webhooksUrl[indexOfWebhookUrl].input.value
    .replaceAll(/\s/g, "")
    .startsWith("https://discord.com/api/webhooks/");

  if (webhooksUrl[indexOfWebhookUrl].input.value.replaceAll(/\s/g, "") == "")
    webhooksUrl[indexOfWebhookUrl].alert.hide();
  else if (res == false) {
    webhooksUrl[indexOfWebhookUrl].alert.show();
  }

  return res;
}

export function isCorrectAllWebhookURL() {
  let res = true;

  for (const webhook of webhooksUrl) {
    if (res === true) {
      res = webhook.input.value
        .replaceAll(/\s/g, "")
        .startsWith("https://discord.com/api/webhooks/");
    }

    if (webhook.input.value.replaceAll(/\s/g, "") == "")
      webhook.alert.hide();
    else if (res == false) {
      webhook.alert.show();
    }
  }

  return res;
}

export function verifyWebhookUrls() {
  let invalid = true;

  for (const webhook of webhooksUrl) {
    if (webhook.verify == false) {
      invalid = false;
      sendButton.disabled = true;
      webhooksUrlGood = false;

      if (webhook.id == 0) {
        WebHookInfo.name = null;
        WebHookInfo.avatar = null;
      }

      break;
    }
  }

  if (webhooksUrl[0].verify) {
    WebHookInfo.name = webhooksUrl[0].webHookInfo.name;
    WebHookInfo.avatar = webhooksUrl[0].webHookInfo.avatar;
  } else {
    WebHookInfo.name = null;
    WebHookInfo.avatar = null;
  }

  if (invalid) {
    sendButton.disabled = false;
    webhooksUrlGood = true;
  }

  return invalid;
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

async function addWebhook() {
  const uniqueId = generateUniqueId();
  const webhookDiv = await createWebhookUrlInput(uniqueId);

  const webhook = new WebhookUrl(
    uniqueId,
    webhookDiv.querySelector(`.webhookUrl`),
    new bootstrap.Collapse(webhookDiv.querySelector('.InvalidWebhookUrlCollapse'), { toggle: false }),
    webhookDiv.querySelector(`.removeButton`)
  );

  webhook.input.addEventListener("input", () => checkWebhookUrl(webhooksUrl.findIndex(ele => ele.id == uniqueId)));
  webhook.input.addEventListener("focusin", () => {
    webhook.input.type = "text";
  });
  webhook.input.addEventListener("focusout", () => {
    webhook.input.type = "password";
  });

  webhook.removeButton.addEventListener("click", () => {
    webhookDiv.remove();
    webhooksUrl.splice(webhooksUrl.findIndex(web => web.id == uniqueId), 1);
    refreshTooltips();
    verifyWebhookUrls();
  });

  webhooksUrl.push(webhook);
  refreshTooltips();
  verifyWebhookUrls();
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
  let nowData = new Date();
  const minutes = nowData.getMinutes();
  localTimers.forEach((ele) =>
    ele.innerText = `${nowData.getHours()}:${minutes < 10 ? '0' : ''}${minutes}`)
}