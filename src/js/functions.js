export function checkIfImageExists(url, callback) {
  try {
    const img = new Image();

    img.onload = (e) => {
      return callback(true);
    };

    img.onerror = (e) => {
      return callback(false);
    };

    img.src = url;
  } catch (err) {
    return callback(false);
  }
}

/**
 * Check if image exists
 * @param {string} imageUrl URL of image or gif
 * @returns {Promise<boolean>} Is image exists
 */
export async function isImageURLValid(imageUrl) {
  return new Promise((resolve) => {
    if (!imageUrl.startsWith("https://") && !imageUrl.startsWith("http://")) return resolve(false);

    const img = new Image();
    img.onload = () => {
      resolve(true);
    };
    img.onerror = () => {
      resolve(false);
    };

    try {
      img.src = imageUrl;
    } catch (error) {
      resolve(false);
    }
  });
}

export function generateUniqueId() {
  return Math.random().toString(36).substr(2, 9);
}

export function insertAfter(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

export function formatText(text) {
  // Remove spaces in the start
  text = text.trimStart().trimEnd()

    // Bold and Italic ***
    .replace(/\*\*\*(.*?)\*\*\*/g, '<b><i>$1</i></b>')

    // Bold **
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')

    // Italic *
    .replace(/\*(.*?)\*/g, '<i>$1</i>')

    // Under Text _ _
    .replace(/\_\_(.*?)\_\_/g, '<u>$1</u>')

    // Italic _
    .replace(/\_(.*?)\_/g, '<i>$1</i>')

    // Delete ~~
    .replace(/~~(.*?)~~/g, '<del>$1</del>')

    // Header 6 ###
    .replace(/^### (.*?$)/gm, '<h6><b>$1</b></h6>').replace(/<\/h6>\n/g, '</h6>')

    // Header 5 ##
    .replace(/^## (.*?$)/gm, '<h5><b>$1</b></h5>').replace(/<\/h5>\n/g, '</h5>')

    // Header 4 #
    .replace(/^# (.*?$)/gm, '<h4><b>$1</b></h4>').replace(/<\/h4>\n/g, '</h4>')

    // Quote Block >>>
    .replace(/^>>> (.*?(\n|$)(?:(?!\n{99,}).*?(\n|$))*)/gm, '<blockquote class="quote">$1</blockquote>')

    // Quote >
    .replace(/^> (.*?$)/gm, '<blockquote class="quote">$1</blockquote>').replace(/<\/blockquote>\n/g, '</blockquote>')

    // Spoiler Text || ||
    .replace(/\|\|(.*?)\|\|/g,
      '<div class="spoilerText">$1</div>')

    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = text;

  removeNonUseElements(tempDiv);

  return tempDiv.innerHTML;
}

async function getEmbedInput() {
  const cachedHTML = sessionStorage.getItem('embedInput');

  if (cachedHTML) {
    return cachedHTML;
  } else {
    const response = await fetch('../html/embedInput.html');
    const html = await response.text();

    sessionStorage.setItem('embedInput', html);

    return html;
  }
}

async function getEmbedVisual() {
  const cachedHTML = sessionStorage.getItem('embedVisual');

  if (cachedHTML) {
    return cachedHTML;
  } else {
    const response = await fetch('../html/embedVisual.html');
    const html = await response.text();

    sessionStorage.setItem('embedVisual', html);

    return html;
  }
}

async function getMessageInput() {
  const cachedHTML = sessionStorage.getItem('messageInput');

  if (cachedHTML) {
    return cachedHTML;
  } else {
    const response = await fetch('../html/messageInput.html');
    const html = await response.text();

    sessionStorage.setItem('messageInput', html);

    return html;
  }
}

async function getMessageVisual() {
  const cachedHTML = sessionStorage.getItem('messageVisual');

  if (cachedHTML) {
    return cachedHTML;
  } else {
    const response = await fetch('../html/messageVisual.html');
    const html = await response.text();

    sessionStorage.setItem('messageVisual', html);

    return html;
  }
}

async function getWebhookUrlInput() {
  const cachedHTML = sessionStorage.getItem('webhookUrlInput');

  if (cachedHTML) {
    return cachedHTML;
  } else {
    const response = await fetch('../html/webhookUrlInput.html');
    const html = await response.text();

    sessionStorage.setItem('webhookUrlInput', html);

    return html;
  }
}

export async function getSaveElement() {
  const cachedHTML = sessionStorage.getItem('saveElement');

  if (cachedHTML) {
    return cachedHTML;
  } else {
    const response = await fetch('../html/saveElement.html');
    const html = await response.text();

    sessionStorage.setItem('saveElement', html);

    return html;
  }
}

export async function getFileVisual() {
  const cachedHTML = sessionStorage.getItem('fileVisual');

  if (cachedHTML) {
    return cachedHTML;
  } else {
    const response = await fetch('../html/fileVisual.html');
    const html = await response.text();

    sessionStorage.setItem('fileVisual', html);

    return html;
  }
}

export async function getFieldInput() {
  const cachedHTML = sessionStorage.getItem('fieldInput');

  if (cachedHTML) {
    return cachedHTML;
  } else {
    const response = await fetch('../html/fieldInput.html');
    const html = await response.text();

    sessionStorage.setItem('fieldInput', html);

    return html;
  }
}

export async function getFieldVisual() {
  const cachedHTML = sessionStorage.getItem('fieldVisual');

  if (cachedHTML) {
    return cachedHTML;
  } else {
    const response = await fetch('../html/fieldVisual.html');
    const html = await response.text();

    sessionStorage.setItem('fieldVisual', html);

    return html;
  }
}

export async function createEmbedInput(parentInputElement) {
  const templateHTML = await getEmbedInput();

  const embedInput = document.createElement('div');
  embedInput.innerHTML = templateHTML;
  embedInput.classList.add("py-1");

  parentInputElement.querySelector(".embedsInput").appendChild(embedInput);

  return embedInput;
}

export async function createEmbedVisual(parentVisualElement) {
  const templateHTML = await getEmbedVisual();

  const embedVisual = document.createElement('div');
  embedVisual.innerHTML = templateHTML;
  embedVisual.classList.add("py-1");

  parentVisualElement.querySelector(".embedsView").appendChild(embedVisual);

  return embedVisual;
}

/**
 * Create message input
 * @param {string} uniqueId Unique Id
 * @returns Message input element
 */
export async function createMessageInput(uniqueId) {
  const templateHTML = await getMessageInput();

  const messageInput = document.createElement('div');
  messageInput.innerHTML = templateHTML;
  messageInput.classList.add("mb-3");
  messageInput.id = `messageInput_${uniqueId}`;
  const profileContentCollapse =
    messageInput.querySelector(".profileContentButton");

  profileContentCollapse.setAttribute(
    "data-bs-target",
    `#messageInput_${uniqueId} .profileContentCollapse`
  );

  document.getElementById("messagesInput").appendChild(messageInput);

  return messageInput;
}

/**
 * Create message visual
 * @param {string} uniqueId Unique Id
 * @returns Message visual element
 */
export async function createMessageVisual(uniqueId) {
  const templateHTML = await getMessageVisual();

  const messageInput = document.createElement('div');
  messageInput.innerHTML = templateHTML;
  messageInput.classList.add("mb-3")
  messageInput.id = `messageVisual_${uniqueId}`;

  document.getElementById("messagesVisual").appendChild(messageInput);

  return messageInput;
}

export async function createWebhookUrlInput(uniqueId) {
  const templateHTML = await getWebhookUrlInput();

  const webhookUrlInput = document.createElement('div');
  webhookUrlInput.innerHTML = templateHTML;
  webhookUrlInput.classList.add("mb-2");
  webhookUrlInput.id = `webhookUrl_${uniqueId}`;

  document.getElementById("webhookUrls").appendChild(webhookUrlInput);

  return webhookUrlInput;
}

export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function removeNonUseElements(element) {
  let childs = element.childNodes;

  for (let i = childs.length - 1; i >= 0; i--) {
    let child = childs[i];

    if (child.nodeType === 1 &&
      (child.tagName !== 'B' && child.tagName !== 'I' && child.tagName !== 'U' && child.tagName !== 'DEL'
        && child.tagName !== 'H6' && child.tagName !== 'H5' && child.tagName !== 'H4' && child.tagName !== 'BR' && child.tagName !== 'BLOCKQUOTE'
        && child.tagName !== 'A')
      && !child.classList.contains('spoilerText')
      && !child.classList.contains('headerMax')) {
      element.removeChild(child);
    } else if (child.nodeType == 1) {
      removeNonUseElements(child);
    }
  }
}

export function checkWebsiteSize() {
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

let timeMessages = [];

refreshAllLocalTimers();
setInterval(refreshTimeMessage, 1000);

function refreshTimeMessage() {
  let nowData = new Date();
  const minutes = nowData.getMinutes();
  timeMessages.forEach((ele) =>
    ele.innerText = `${nowData.getHours()}:${minutes < 10 ? '0' : ''}${minutes}`)
}

export function refreshAllLocalTimers() {
  timeMessages = document.querySelectorAll(".localTime");
  refreshTimeMessage();
}