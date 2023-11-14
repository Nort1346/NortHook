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

export async function getEmbedInput(uniqeId) {
  const response = await fetch('../html/embedInput.html');
  const templateHTML = await response.text();

  const embedInput = document.createElement('div');
  embedInput.innerHTML = templateHTML;
  embedInput.classList.add("py-1");

  embedInput.querySelector(".embedName").innerHTML = "Embed";

  document.querySelector(".embedsInput").appendChild(embedInput);

  return embedInput;
}

export async function getEmbedVisual(uniqeId) {
  const response = await fetch('../html/embedVisual.html');
  const templateHTML = await response.text();

  const embedVisual = document.createElement('div');
  embedVisual.innerHTML = templateHTML;
  embedVisual.classList.add("py-1");

  document.querySelector(".embedsView").appendChild(embedVisual);

  return embedVisual;
}

export function insertAfter(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

export function formatText(text) {
  // Remove spaces in the start
  text = text.trimStart()

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
    .replace(/^### (.*?$)/gm, '<h6><b>$1</b></h6>')

    // Header 5 ##
    .replace(/^## (.*?$)/gm, '<h5><b>$1</b></h5>')

    // Header 4 #
    .replace(/^# (.*?$)/gm, '<h4><b>$1</b></h4>')

    // Spoiler Text || ||
    .replace(/\|\|(.*?)\|\|/g,
      '<div class="spoilerText">$1</div>')

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = text;

  removeNonUseElements(tempDiv);

  return tempDiv.innerHTML;
}

/**
 * Create message input
 * @param {string} uniqueId Unique Id
 * @returns Message input element
 */
export async function createMessageInput(uniqueId) {
  const response = await fetch('../html/messageInput.html');
  const templateHTML = await response.text();

  const messageInput = document.createElement('div');
  messageInput.innerHTML = templateHTML;
  messageInput.classList.add("mb-3")
  messageInput.id = `messageInput_${uniqueId}`;

  document.getElementById("messagesInput").appendChild(messageInput);

  return messageInput;
}

/**
 * Create message visual
 * @param {string} uniqueId Unique Id
 * @returns Message visual element
 */
export async function createMessageVisual(uniqueId) {
  const response = await fetch('../html/messageVisual.html');
  const templateHTML = await response.text();

  const messageInput = document.createElement('div');
  messageInput.innerHTML = templateHTML;
  messageInput.classList.add("mb-3")
  messageInput.id = `messageVisual_${uniqueId}`;

  document.getElementById("messagesVisual").appendChild(messageInput);

  return messageInput;
}

function removeNonUseElements(element) {
  let childs = element.childNodes;

  for (let i = childs.length - 1; i >= 0; i--) {
    let child = childs[i];

    if (child.nodeType === 1 &&
      (child.tagName !== 'B' && child.tagName !== 'I' && child.tagName !== 'U' && child.tagName !== 'DEL'
        && child.tagName !== 'H6' && child.tagName !== 'H5' && child.tagName !== 'H4')
      && !child.classList.contains('spoilerText')
      && !child.classList.contains('headerMax')) {
      element.removeChild(child);
    } else if (child.nodeType == 1) {
      removeNonUseElements(child);
    }
  }
}