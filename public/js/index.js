import * as bootstrap from 'bootstrap'

const webhookUrl = document.getElementById("webhookUrl");
const content = document.getElementById("content");
const username = document.getElementById("username");
const avatar_url = document.getElementById("avatar_url");

const sendButton = document.getElementById("sendButton");
sendButton.disabled = true;

/**
 * Message View Parameters
 */
const contentView = document.getElementById("contentView");
const usernameView = document.getElementById("usernameView");
const avatarView = document.getElementById("avatarIcon");

const invalidUrl = document.getElementById("invalidUrl");

setStandardValues();

/**
 * Modals
 */
const successModal = new bootstrap.Modal('#successModal', { focus: true });
const failModal = new bootstrap.Modal('#failModal', { focus: true });
const failModalContent = document.getElementById("failEmbedErrorContent");

content.addEventListener("input", changeView);
username.addEventListener("input", changeView);
avatar_url.addEventListener("input", changeView);

webhookUrl.addEventListener("input", () => {
  if (!isValidURL(webhookUrl.value)) {
    fetch("/isWebhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ webhookUrl: webhookUrl.value }),
    })
      .then((response) => response.json())
      .then((data) => {
        sendButton.disabled = !data.success;
        invalidUrl.style.display = data.success ? "none" : "block";
      });
  }
  changeView();
});

sendButton.addEventListener("click", () => {
  console.log(webhookUrl.value);

  const data = {};

  data.webhookUrl = webhookUrl.value;

  if (content.value.replaceAll(/\s/g, "") != "")
    data.content = content.value;
  if (username.value.replaceAll(/\s/g, "") != "")
    data.username = username.value;
  if (avatar_url.value.replaceAll(/\s/g, "") != "")
    data.avatar_url = avatar_url.value;

  fetch("/sendMessage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data.error)
      if (data.success == true) {
        successModal.show();
      } else {
        failModalContent.innerText = `Error: ${data.error}`;
        failModal.show();
      }

      console.log("odpowiedz serwera ", data);
    });
});

function isValidURL(string) {
  var res = string
    .replaceAll(/\s/g, "")
    .startsWith("https://discord.com/api/webhooks/");
  if (string.length > 0) invalidUrl.style.display = res ? "none" : "block";
  else invalidUrl.style.display = "none";
  return res == false;
}

function changeView() {
  contentView.innerText = content.value;
  usernameView.innerText = username.value;

  if (avatar_url.value.replaceAll(/\s/g, "") != "") {
    checkIfImageExists(avatar_url.value, (is) => {
      if (is) {
        avatarView.src = avatar_url.value;
      } else {
        avatarView.src = "https://cdn.discordapp.com/avatars/794288711164493864/5aa45cc104dc6af311c76b5ee58f49bb.jpg?size=1024";
      }
    });
  }
}

function setStandardValues() {
  content.value = "Hello World, I am Developer";
  username.value = "Nort";
  avatar_url.value = "https://cdn.discordapp.com/avatars/794288711164493864/5aa45cc104dc6af311c76b5ee58f49bb.jpg?size=1024";
  changeView();
}

function checkIfImageExists(url, callback) {
  const img = new Image();
  img.src = url;

  if (img.complete) {
    callback(true);
  } else {
    img.onload = () => {
      callback(true);
    };

    img.onerror = () => {
      callback(false);
    };
  }
}