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

  document.getElementById("embedsInput").appendChild(embedInput);

  return embedInput;
}

export async function getEmbedVisual(uniqeId) {
  const response = await fetch('../html/embedVisual.html');
  const templateHTML = await response.text();

  const embedVisual = document.createElement('div');
  embedVisual.innerHTML = templateHTML;
  embedVisual.classList.add("py-1");

  document.getElementById("embedsView").appendChild(embedVisual);

  return embedVisual;
}

export function insertAfter(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

export function formatText(text) {
  // Bold **
  text = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

  // Italic *
  text = text.replace(/\*(.*?)\*/g, '<i>$1</i>');

  // Bold and Italic ***
  text = text.replace(/\*\*\*(.*?)\*\*\*/g, '<b><i>$1</i></b>');

  // Delete ~~
  text = text.replace(/~~(.*?)~~/g, '<del>$1</del>');

  // Header 6 ###
  text = text.replace(/^### (.*?$)/gm, '<h6><b>$1</b></h6>');

  // Header 5 ##
  text = text.replace(/^## (.*?$)/gm, '<h5><b>$1</b></h5>');

  // Header 4 #
  text = text.replace(/^# (.*?$)/gm, '<h4><b>$1</b></h4>');

  // Under Text _ _
  text = text.replace(/\_(.*?)\_/g, '<u>$1</u>');

  // Spoiler Text || ||
  text = text.replace(/\|\|(.*?)\|\|/g,
    '<div class="spoilerText">$1</div>');

  return text;
}