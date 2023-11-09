import * as bootstrap from 'bootstrap';
import {
  isImageURLValid,
  generateUniqueId,
  getEmbedInput,
  getEmbedVisual,
  insertAfter
} from './functions.js'
import { Embed } from './embed.js';

/**
 * WebHook URL Input Element
 */
const webhookUrl = document.getElementById("webhookUrl");

/**
 * Send Button
 */
const sendButton = document.getElementById("sendButton");
sendButton.disabled = true;

/*
 * Message Elements
 */
const content = document.getElementById("content");
const username = document.getElementById("username");
const avatar_url = document.getElementById("avatar_url");
const files = document.getElementById("files");
const messageLink = document.getElementById("messageLink")
const addEmbedButton = document.getElementById("addEmbed");
const embeds = [];

/*
 * Message View Parameters
 */
const contentView = document.getElementById("contentView");
const usernameView = document.getElementById("usernameName");
const avatarView = document.getElementById("avatarIcon");

const alertInvalidWebhookUrl = new bootstrap.Collapse("#InvalidWebhookUrlCollapse", { toggle: false });
const alertInvalidAvatarUrl = new bootstrap.Collapse("#InvalidAvatarUrlCollapse", { toggle: false });

/**
 * WebHookInfo
 */
const WebHookInfo = { name: null, avatar: null };

/**
 * Default WebHook Values
 */
const DefaultWebhookInfo = {
  name: 'Nort',
  avatar: 'https://cdn.discordapp.com/avatars/794288711164493864/5aa45cc104dc6af311c76b5ee58f49bb.jpg?size=1024'
};

/*
 * Modals
 */
const successModal = new bootstrap.Modal('#successModal', { focus: true });
const failModal = new bootstrap.Modal('#failModal', { focus: true });
const failModalContent = document.getElementById("failEmbedErrorContent");

// Set standard Values
setStandardValues();

// Events for 
sendButton.addEventListener("click", sendMessage);

// Events for message parameters
content.addEventListener("input", changeView);
username.addEventListener("input", changeView);
avatar_url.addEventListener("input", changeView);
webhookUrl.addEventListener("input", checkWebhookUrl);
messageLink.addEventListener("input", checkMessageLink);
addEmbedButton.addEventListener("click", async () => addEmbed(await getEmbedInput(), await getEmbedVisual()));

// Message Time Set
const localTime = document.getElementById("localTime");
localTime.innerText = `${(new Date()).toLocaleTimeString().slice(0, -3)}`;

setInterval(() => {
  let nowData = new Date();
  localTime.innerText = `${nowData.toLocaleTimeString().slice(0, -3)}`
}, 1000);

// Check View For WebSite Width
checkSize();
window.addEventListener('resize', checkSize);

// Webhook foucs options
webhookUrl.addEventListener("focusin", (foc) => {
  webhookUrl.type = "text";
});
webhookUrl.addEventListener("focusout", (foc) => {
  webhookUrl.type = "password";
});

// Tooltips support
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
let tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl,
  {
    trigger: "hover",
    delay: { show: 100, hide: 100 }
  }))

// Functions
function sendMessage() {
  const loading = document.getElementById("loadingMessage");
  loading.classList.remove("visually-hidden");
  sendButton.disabled = true;

  const formData = new FormData();

  formData.append("webhookUrl", webhookUrl.value)
  if (content.value.replaceAll(/\s/g, "") != "")
    formData.append("content", content.value);
  if (username.value.replaceAll(/\s/g, "") != "")
    formData.append("username", username.value);
  if (avatar_url.value.replaceAll(/\s/g, "") != "")
    formData.append("avatar_url", avatar_url.value);

  if (files.files.length > 10) {
    failModalContent.innerText = `Error: Max files is 10`;
    loading.classList.add("visually-hidden");
    sendButton.disabled = false;
    return failModal.show();
  }

  if (embeds.length > 0) {
    let embedArray = [];
    for (const embed of embeds) {
      embedArray.push(embed.getEmbed());
    }
    formData.append("embeds", JSON.stringify(
      embedArray
    ));
  }

  for (let i = 0; i < files.files.length; i++) {
    formData.append("files", files.files[i]);
  }

  fetch("/sendMessage", {
    method: "POST",
    body: formData
  })
    .then((response) => response.json())
    .then((data) => {
      loading.classList.add("visually-hidden");
      sendButton.disabled = false;

      if (data.success == true) {
        successModal.show();
      } else {
        failModalContent.innerText = `Error: ${data.error}`;
        failModal.show();
      }
    });
}

function checkWebhookUrl() {
  if (!isValidWebhookURL(webhookUrl.value)) {
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
      });
  } else {
    sendButton.disabled = true;
    WebHookInfo.name = null;
    WebHookInfo.avatar = null;
    alertInvalidWebhookUrl.show()
  }
  changeView();
}

function checkMessageLink() {
  // if (!isValidWebhookURL(webhookUrl.value)) {
  const apiURL = `${webhookUrl.value}/messages/${messageLink.value.slice(messageLink.value.lastIndexOf("/") + 1)}`;
  console.log(apiURL);
  const formData = new FormData();
  formData.append("messageLink", apiURL);
  fetch("/isWebhookMessage", {
    method: "POST",
    body: formData
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data.success)
    });
  /*} else {

  }*/
  changeView();
}

function changeView() {
  contentView.innerText = content.value;

  if (username.value.replaceAll(/\s/g, "") != "") {
    usernameView.innerText = username.value;
  } else {
    usernameView.innerText = WebHookInfo.name ?? DefaultWebhookInfo.name;
  }

  if (avatar_url.value.replaceAll(/\s/g, "") != "") {
    if (isImageURLValid(avatar_url.value)) {
      alertInvalidAvatarUrl.hide();
      avatarView.src = avatar_url.value;
    } else {
      alertInvalidAvatarUrl.show();
      avatarView.src = WebHookInfo.avatar ?? DefaultWebhookInfo.avatar;
    }
  } else {
    alertInvalidAvatarUrl.hide();
    avatarView.src = WebHookInfo.avatar ?? DefaultWebhookInfo.avatar;
  }
}

function setStandardValues() {
  content.value = "Hello World, I am Developer";
  changeView();
}

function isValidWebhookURL(string) {
  var res = string
    .replaceAll(/\s/g, "")
    .startsWith("https://discord.com/api/webhooks/");

  if (string.length <= 0) alertInvalidWebhookUrl.hide();
  return res == false;
}

async function addEmbed(inputEmbed, visualEmbed) {
  const uniqeId = generateUniqueId();
  const newEmbed = new Embed(inputEmbed, visualEmbed, uniqeId);
  await newEmbed.setNumber(embeds.length);

  embeds.push(newEmbed);

  checkAddEmbedButton();
  checkArrowsEmbeds();

  newEmbed.removeButton.addEventListener("click", () => removeEmbed(newEmbed.id));
  newEmbed.duplicateButton.addEventListener("click", () => duplicateEmbed(newEmbed.id));
  newEmbed.upButton.addEventListener("click", () => upEmbed(newEmbed.id));
  newEmbed.downButton.addEventListener("click", () => downEmbed(newEmbed.id));
  refreshTooltips();

  function upEmbed(id) {
    const indexOfRemoveEmbed = embeds.findIndex(ele => ele.id == id);
    if (indexOfRemoveEmbed >= 0) {
      const temp = embeds.splice(indexOfRemoveEmbed, 1)[0];
      embeds.splice(indexOfRemoveEmbed - 1, 0, temp);

      embeds[indexOfRemoveEmbed].inputEmbed
        .insertAdjacentElement("beforebegin", embeds[indexOfRemoveEmbed - 1].inputEmbed);

      embeds[indexOfRemoveEmbed].visualEmbed
        .insertAdjacentElement("beforebegin", embeds[indexOfRemoveEmbed - 1].visualEmbed);

      checkArrowsEmbeds();
      countEmbedNumbers();
      refreshTooltips();
    }
  }

  function downEmbed(id) {
    const indexOfRemoveEmbed = embeds.findIndex(ele => ele.id == id);
    if (indexOfRemoveEmbed >= 0) {
      const temp = embeds.splice(indexOfRemoveEmbed, 1)[0];
      embeds.splice(indexOfRemoveEmbed + 1, 0, temp);

      embeds[indexOfRemoveEmbed].inputEmbed
        .insertAdjacentElement("afterend", embeds[indexOfRemoveEmbed + 1].inputEmbed);

      embeds[indexOfRemoveEmbed].visualEmbed
        .insertAdjacentElement("afterend", embeds[indexOfRemoveEmbed + 1].visualEmbed);

      checkArrowsEmbeds();
      countEmbedNumbers();
      refreshTooltips();
    }
  }

  function removeEmbed(id) {
    const indexOfRemoveEmbed = embeds.findIndex(ele => ele.id == id);
    if (indexOfRemoveEmbed >= 0) {
      embeds[indexOfRemoveEmbed].removeEmbed();
      embeds.splice(indexOfRemoveEmbed, 1);

      countEmbedNumbers();
      checkAddEmbedButton();
      checkArrowsEmbeds();
      refreshTooltips();
    }
  }

  async function duplicateEmbed(id) {
    const indexOfRemoveEmbed = embeds.findIndex(ele => ele.id == id);

    if (indexOfRemoveEmbed >= 0 && embeds.length < 10) {
      const cloneEmbed = new Embed(await getEmbedInput(), await getEmbedVisual(), generateUniqueId());
      await cloneEmbed.setEmbed(embeds[indexOfRemoveEmbed].getEmbed());
      await cloneEmbed.refreshEmbedVisual();

      cloneEmbed.duplicateButton.addEventListener("click", () => duplicateEmbed(cloneEmbed.id));
      cloneEmbed.removeButton.addEventListener("click", () => removeEmbed(cloneEmbed.id));
      cloneEmbed.upButton.addEventListener("click", () => upEmbed(cloneEmbed.id));
      cloneEmbed.downButton.addEventListener("click", () => downEmbed(cloneEmbed.id));

      embeds.splice(indexOfRemoveEmbed + 1, 0, cloneEmbed);

      countEmbedNumbers();
      checkAddEmbedButton();
      checkArrowsEmbeds();

      insertAfter(cloneEmbed.inputEmbed, embeds[indexOfRemoveEmbed].inputEmbed);
      insertAfter(cloneEmbed.visualEmbed, embeds[indexOfRemoveEmbed].visualEmbed);
      refreshTooltips();
    }
  }
}

function checkArrowsEmbeds() {
  embeds.map((emb, index) => {
    emb.upButton.disabled = false;
    emb.upButton.classList.remove("d-none");

    emb.downButton.disabled = false;
    emb.downButton.classList.remove("d-none");

    if (index == 0) {
      emb.upButton.disabled = true;
      emb.upButton.classList.add("d-none");
    }
    if (index == embeds.length - 1) {
      emb.downButton.disabled = true;
      emb.downButton.classList.add("d-none");
    }
  });
}

function checkAddEmbedButton() {
  if (embeds.length >= 10) {
    addEmbedButton.disabled = true;
  } else {
    addEmbedButton.disabled = false;
  }
}

function countEmbedNumbers() {
  for (let i = 0; i < embeds.length; i++) {
    embeds[i].setNumber(i);
  }
}

function refreshTooltips() {
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
  }
}