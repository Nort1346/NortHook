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