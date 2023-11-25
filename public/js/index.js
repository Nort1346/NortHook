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

// Tooltips support
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
let tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl,
  {
    trigger: "hover",
    delay: { show: 100, hide: 100 }
  }));

/**
 * @type boolean
 */
export let isAllWebhooksGood = false;

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

const addWebhookButton = document.getElementById("addWebhook");
addWebhookButton.addEventListener("click", addWebhook);

/**
 * Default WebHook Values
 */
export const defaultWebhookInfo = {
  name: 'Nort',
  avatar: 'https://cdn.discordapp.com/avatars/794288711164493864/5aa45cc104dc6af311c76b5ee58f49bb.jpg?size=1024'
};

/**
 * General WebhookInfo
 */
export let generalWebHookInfo = {
  name: null,
  avatar: null
};

/**
 * Options buttons
 */
const clearAllButton = document.getElementById("clearAllMessages");
clearAllButton.addEventListener("click", clearAllMessages);

const saveNameInput = document.getElementById("saveNameInput");
const saveDataButton = document.getElementById("saveDataButton");
const saves = document.getElementById("saves");
await loadAllSaves();
saveNameInput.addEventListener("input", checkSaveButtonName);
saveDataButton.addEventListener("click", saveData);

/**
 * Send Button
 */
export const sendButton = document.getElementById("sendButton");
sendButton.addEventListener("click", async () => await send());

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

async function send() {
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
}
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
      isAllWebhooksGood = false;

      if (webhook.id == 0) {
        generalWebHookInfo.name = null;
        generalWebHookInfo.avatar = null;
      }

      break;
    }
  }

  if (webhooksUrl[0].verify) {
    generalWebHookInfo.name = webhooksUrl[0].webHookInfo.name;
    generalWebHookInfo.avatar = webhooksUrl[0].webHookInfo.avatar;
  } else {
    generalWebHookInfo.name = null;
    generalWebHookInfo.avatar = null;
  }

  if (invalid) {
    sendButton.disabled = false;
    isAllWebhooksGood = true;
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

  webhook.removeButton.addEventListener("click", () => webhook.removeWebhook());

  webhooksUrl.push(webhook);
  refreshTooltips();
  verifyWebhookUrls();
}

function getAllDataJSON(name) {
  const data = {
    version: 1.0,
    save: {
      name: name,
      messages: null,
      targets: null
    }
  };

  data.save.messages = [].concat(...messages.map(messages => messages.getMessageToData()));
  data.save.targets = [].concat(...webhooksUrl.map(webhook => { return { url: webhook.input.value } }));
  return data;
}

async function loadAllDataJSON(key) {
  const data = JSON.parse(localStorage.getItem(key));
  if (data === "") return;

  clearAllWebhooks();
  for (const [i, target] of data.save.targets.entries()) {
    if (i !== 0) {
      await addWebhook();
    }

    webhooksUrl[i].input.value = target.url;
    checkWebhookUrl(i);
  }
  verifyWebhookUrls();

  clearAllMessages();
  for (const [i, message] of data.save.messages.entries()) {
    if (i !== 0) {
      await createMessage();
    }

    messages[i].setMessageFromData(message);
  }
}

async function saveData() {
  if (saveNameInput.value === "") return;

  const save = getAllDataJSON(saveNameInput.value);
  localStorage.setItem(`${saveNameInput.value}`, JSON.stringify(save));
  saveNameInput.value = "";
  checkSaveButtonName();

  if (saves.querySelector(`#saveElement_${save.save.name}`) !== null) return;

  const response = await fetch('../html/saveElement.html');
  const templateHTML = await response.text();

  const div = generateSaveElement(save.save.name, templateHTML);

  checkEmptySaves();
  saves.appendChild(div);
  refreshTooltips();
}

async function removeSaveData(key) {
  saves.querySelector(`[id="saveElement_${key}"]`).remove();
  localStorage.removeItem(key);
  checkEmptySaves();
  refreshTooltips();
}

async function exportSaveData(key) {
  const data = JSON.stringify(JSON.parse(localStorage.getItem(key)), null, 4);
  if (data == null) return;

  let blob = new Blob([data], { type: "application/json" });
  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = key;
  link.click();
  //link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

  // Zwolnij zasoby po utworzeniu linku
  window.URL.revokeObjectURL(link.href);
}

function checkEmptySaves() {
  if (localStorage.length == 0) {
    const div = document.createElement('div');
    div.classList.add("noSavesElement");
    div.innerHTML = "You've yet to create any backups. Provide a name below and click the Save button to initiate one.";
    saves.appendChild(div);
    return false;
  } else {
    const div = saves.querySelector(".noSavesElement");
    if (div) {
      div.remove();
    }
    return true;
  }
}

async function loadAllSaves() {
  const allKeys = Object.keys(localStorage);
  const allSaves = allKeys.map(key => JSON.parse(localStorage.getItem(key)));

  if (checkEmptySaves()) {
    saves.innerHTML = "";
    const response = await fetch('../html/saveElement.html');
    const templateHTML = await response.text();
    for (const save of allSaves) {
      saves.appendChild(generateSaveElement(save.save.name, templateHTML));
    }
    refreshTooltips();
  }
}

export function removeWebhook(uniqueId) {
  document.getElementById(`webhookUrl_${uniqueId}`).remove();
  const indexToRemove = webhooksUrl.findIndex(web => web.id == uniqueId);
  if (indexToRemove !== -1) {
    webhooksUrl.splice(indexToRemove, 1);
  }
  refreshTooltips();
}

function generateSaveElement(name, templateHTML) {
  const div = document.createElement('div');
  div.id = `saveElement_${name}`;
  div.innerHTML = templateHTML;
  div.querySelector(".saveName").innerText = name;
  div.querySelector(".saveLoadButton").addEventListener("click", () => loadAllDataJSON(name));
  div.querySelector(".removeSaveButton").addEventListener("click", () => removeSaveData(name));
  div.querySelector(".exportSaveButton").addEventListener("click", () => exportSaveData(name));
  div.classList.add("saveElement", "container", "border-bottom", "py-2");
  return div;
}

function checkSaveButtonName() {
  if (localStorage.getItem(saveNameInput.value)) {
    saveDataButton.innerText = "Override";
  } else {
    saveDataButton.innerText = "Save";
  }
}

function clearAllWebhooks() {
  webhooksUrl.forEach((ele, i) => {
    if (i !== 0)
      document.getElementById(`webhookUrl_${ele.id}`).remove();
    else
      ele.input.value = "";
  });
  webhooksUrl.splice(1);
  refreshTooltips();
  verifyWebhookUrls();
}

function clearAllMessages() {
  messages.forEach((mess, index) => {
    if (index != 0) mess.removeMessage();
    else {
      mess.clearMessage();
      mess.toggleRemoveMessageButtonDisplay(false);
    }
  });
  messages.slice(1);
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