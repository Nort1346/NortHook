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
export let webhookUrlGood = false;

/**
 * Array of WebHook URL Input Element
 * @type WebhookUrl[]
 */
export const webhooksUrl = [
  new WebhookUrl(
    document.getElementById("webhookUrl"),
    new bootstrap.Collapse("#InvalidWebhookUrlCollapse", { toggle: false })
  )
];


// Events for webhook
webhooksUrl[0].input.addEventListener("input", checkWebhookUrl);
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
    if (messages.length > 1)
      successModalText.innerText = `Messages Sent`;
    else
      successModalText.innerText = `Message Sent`;

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
async function sendMessage(message) {
  const formData = new FormData();

  formData.append("webhookUrl", webhooksUrl.value)
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
async function editMessage(message) {
  const formData = new FormData();

  formData.append("messageLink", `${webhooksUrl.value}/messages/${message.messageLink.slice(message.messageLink.lastIndexOf("/") + 1)}`)

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

export function checkWebhookUrl() {
  if (isCorrectWebhookURL()) {
    const formData = new FormData();
    formData.append("webhookUrl", webhooksUrl[0].input.value);
    fetch("/isWebhook", {
      method: "POST",
      body: formData
    })
      .then((response) => response.json())
      .then((data) => {
        sendButton.disabled = !data.success;
        data.success == true ? alertInvalidWebhookUrl.hide() : alertInvalidWebhookUrl.show();
        webhookUrlGood = data.success;

        WebHookInfo.name = data?.name;
        WebHookInfo.avatar = data?.avatar;

        messages.forEach((mess) => {
          mess.setWebhookInfo();
          mess.checkMessageLink();
        });
      });
  } else {
    sendButton.disabled = true;
    webhookUrlGood = false;

    WebHookInfo.name = null;
    WebHookInfo.avatar = null;

    messages.forEach((mess) => {
      mess.setWebhookInfo();
    });
  }
}

export function isCorrectWebhookURL() {
  let res = true;

  for (const webhook of webhooksUrl) {
    if (res === true) {
      res = webhook.input.value
        .replaceAll(/\s/g, "")
        .startsWith("https://discord.com/api/webhooks/");
    }

    if (webhook.input.value.replaceAll(/\s/g, "") == "") webhook.alert.hide();
    else if (res == false) {
      webhook.alert.show();
    }
  }

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

async function addWebhook() {
  const uniqueId = generateUniqueId();
  const webhookDiv = await createWebhookUrlInput(uniqueId);

  const webhook = new WebhookUrl(
    webhookDiv.querySelector(`.webhookUrl`),
    new bootstrap.Collapse(webhookDiv.querySelector('.InvalidWebhookUrlCollapse'), { toggle: false }),
    webhookDiv.querySelector(`.removeButton`)
  );

  webhook.input.addEventListener("input", checkWebhookUrl);
  webhook.input.addEventListener("focusin", () => {
    webhook.input.type = "text";
  });
  webhook.input.addEventListener("focusout", () => {
    webhook.input.type = "password";
  });

  webhook.removeButton.addEventListener("click", () => {
    webhookDiv.remove();
    webhooksUrl.findIndex(web => web.id == uniqueId);
  });

  webhooksUrl.push(webhook);

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