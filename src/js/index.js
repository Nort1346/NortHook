import * as bootstrap from 'bootstrap';;
import {
  generateUniqueId,
  createMessageInput,
  createMessageVisual,
  createWebhookUrlInput,
  checkWebsiteSize,
  refreshAllLocalTimers,
  getSaveElement
} from './functions.js';
import {
  TypeOfMessage,
  WebhookUrl
} from './classes.js';
import {
  Message
} from './message.js';
import {
  generalWebHookInfo,
  messages,
  successModalSend,
  successModalText,
  failModalSend,
  failModalContentSend
} from './variables.js';

/**
 * @type boolean
*/
export let isAllWebhooksGood = false;

const saveNameInput = document.getElementById("saveNameInput");
const saveDataButton = document.getElementById("saveDataButton");
const savesContent = document.getElementById("savesContent");
const searchSavesInput = document.getElementById("searchSavesInput");
const sendButton = document.getElementById("sendButton");

let tooltipList = [];

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

//Listeners
/**
 * Options buttons
 */
document.getElementById("clearAllMessages").addEventListener("click", clearAllMessages);
document.getElementById("addMessage").addEventListener("click", async () => await createMessage());
document.getElementById("addWebhook").addEventListener("click", addWebhook);
sendButton.addEventListener("click", async () => await send());
saveNameInput.addEventListener("input", checkSaveButtonName);
searchSavesInput.addEventListener("input", () => filterSaves(searchSavesInput.value))
saveDataButton.addEventListener("click", () => saveData(saveNameInput.value));
window.addEventListener('resize', checkWebsiteSize);


//Call functions
checkWebsiteSize();
createMessage();
loadAllSaves();
refreshTooltips();

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
  const payload = {};

  payload.content = message.content ?? null;

  if (message.user.username.replaceAll(/\s/g, "") != "")
    payload.username = message.user.username;

  if (message.user.avatar_url.replaceAll(/\s/g, "") != "")
    payload.avatar_url = message.user.avatar_url;

  if (message.files.length > 10) {
    return {
      success: false,
      errorText: `Error: Max files is 10`
    }
  }

  if (message?.embeds != null) {
    payload.embeds = message.embeds;
  }

  for (let i = 0; i < message.files.length; i++) {
    try {
      const blob = new Blob([await message.files[i].arrayBuffer()],
        {
          type: message.files[i].type,
        });

      formData.append(
        `files${i}`,
        blob,
        message.files[i].name
      );

    } catch (error) {
      console.error(`Error in file ${i}:`, error);
    }
  }

  formData.append('payload_json', JSON.stringify(payload));

  const response = await fetch(webhookUrl, {
    method: "POST",
    body: formData
  });

  if (response.ok) {
    return {
      success: true,
      errorText: null
    };
  }
  else {
    return {
      success: false,
      errorText: `Error: Message Invalid`
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
  const payload_json = {};

  const editUrl = `${webhookUrl}/messages/${message.reference.slice(message.reference.lastIndexOf("/") + 1)}`;

  if (message.files.length > 10) {
    return {
      success: false,
      errorText: `Error: Max files is 10`
    }
  }

  payload_json.content = message.content ?? null;
  payload_json.embeds = message.embeds ?? null;
  payload_json.attachments = [];

  for (let i = 0; i < message.files.length; i++) {
    formData.append("files", message.files[i]);
  }

  for (let i = 0; i < message.files.length; i++) {
    try {
      const blob = new Blob([await message.files[i].arrayBuffer()],
        {
          type: message.files[i].type,
        });

      formData.append(
        `files${i}`,
        blob,
        message.files[i].name
      );

    } catch (error) {
      console.error(`Error in file ${i}:`, error);
    }
  }

  formData.append("payload_json", JSON.stringify(payload_json));

  const response = await fetch(editUrl, {
    method: "PATCH",
    body: formData
  });

  if (response.ok) {
    return {
      success: true,
      errorText: null
    }
  } else {
    return {
      success: false,
      errorText: `Error: Invalid Message`
    }
  }
}

async function createMessage() {
  const messageId = generateUniqueId();
  messages.push(new Message(await createMessageInput(messageId), await createMessageVisual(messageId), messageId));
  refreshAllLocalTimers();
  displayMessagesRemoveButton();
}

export async function checkWebhookUrl(indexOfWebhookUrl) {
  if (isCorrectWebhookURL(indexOfWebhookUrl)) {
    try {

      const response = await fetch(webhooksUrl[indexOfWebhookUrl].input.value, {
        method: "GET"
      })

      const statusOk = response.status == 200;

      statusOk ?
        webhooksUrl[indexOfWebhookUrl].alert.hide()
        : webhooksUrl[indexOfWebhookUrl].alert.show();

      webhooksUrl[indexOfWebhookUrl].verify = statusOk;

      if (statusOk) {
        const data = await response.json();

        webhooksUrl[indexOfWebhookUrl].webHookInfo.name = data?.name;
        webhooksUrl[indexOfWebhookUrl].webHookInfo.avatar = data?.avatar !== null ?
          `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.webp?size=512` : "https://cdn.discordapp.com/embed/avatars/0.png";

        verifyWebhookUrls();

        messages.forEach((mess) => {
          mess.refreshWebhookInfo();
          mess.checkReference();
        });

        return;
      }

    } catch (e) {
      return;
    }

    webhooksUrl[indexOfWebhookUrl].webHookInfo.name = null;
    webhooksUrl[indexOfWebhookUrl].webHookInfo.name = null;

    verifyWebhookUrls();

    messages.forEach((mess) => {
      mess.refreshWebhookInfo();
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
  });

  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
  tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl,
    {
      trigger: "hover",
      delay: { show: 100, hide: 100 }
    }));
};

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

  data.save.messages = [].concat(...messages.map(messages => messages.getMessageData()));
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
    await checkWebhookUrl(i);
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

async function saveData(key) {
  if (key === "") return;

  const save = getAllDataJSON(key);
  localStorage.setItem(`${key}`, JSON.stringify(save));

  if (savesContent.querySelector(`[id="saveElement_${key}"]`) !== null) return;
  saveNameInput.value = "";
  checkSaveButtonName();

  const templateHTML = await getSaveElement();

  const div = generateSaveElement(key, templateHTML);

  checkEmptySaves();
  savesContent.appendChild(div);
  refreshTooltips();
}

async function removeSaveData(key) {
  savesContent.querySelector(`[id="saveElement_${key}"]`).remove();
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

  window.URL.revokeObjectURL(link.href);
}

function checkEmptySaves() {
  if (localStorage.length == 0) {
    const div = document.createElement('div');
    div.classList.add("noSavesElement");
    div.innerHTML = "You've yet to create any backups. Provide a name below and click the Save button to initiate one.";
    savesContent.appendChild(div);
    return false;
  } else {
    const div = savesContent.querySelector(".noSavesElement");
    if (div) {
      div.remove();
    }

    if (localStorage.length > 5)
      savesContent.classList.remove("overflow-y-visible");
    else
      savesContent.classList.add("overflow-y-visible");

    return true;
  }
}

async function loadAllSaves() {
  const allKeys = Object.keys(localStorage);
  const allSaves = allKeys.map(key => JSON.parse(localStorage.getItem(key)));

  if (checkEmptySaves()) {
    savesContent.innerHTML = "";
    const templateHTML = await getSaveElement();
    for (const save of allSaves) {
      savesContent.appendChild(generateSaveElement(save.save.name, templateHTML));
    }
    refreshTooltips();
  }
};

export function removeWebhook(uniqueId) {
  document.getElementById(`webhookUrl_${uniqueId}`).remove();
  const indexToRemove = webhooksUrl.findIndex(web => web.id == uniqueId);
  if (indexToRemove !== -1) {
    webhooksUrl.splice(indexToRemove, 1);
  }
  verifyWebhookUrls();
  refreshTooltips();
}

function filterSaves(saveNameFilter) {
  const saveElements = savesContent.querySelectorAll(".saveElement");

  saveElements.forEach((ele) => {
    const eleText = (ele.querySelector(".saveName").innerText).toLowerCase();
    if (eleText.includes(saveNameFilter.toLowerCase())) {
      ele.classList.remove("d-none");
    } else {
      ele.classList.add("d-none");
    }
  })
}

function generateSaveElement(name, templateHTML) {
  const div = document.createElement('li');
  div.id = `saveElement_${name}`;
  div.innerHTML = templateHTML;
  div.querySelector(".saveName").innerText = name;
  div.querySelector(".saveLoadButton").addEventListener("click", () => loadAllDataJSON(name));
  div.querySelector(".removeSaveButton").addEventListener("click", () => removeSaveData(name));
  div.querySelector(".exportSaveButton").addEventListener("click", () => exportSaveData(name));
  div.querySelector(".overrideSaveButton").addEventListener("click", () => saveData(name));
  div.classList.add("saveElement", "list-group-item");
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