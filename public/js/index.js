import * as bootstrap from 'bootstrap';
import {
  checkIfImageExists,
  generateUniqueId,
  getEmbedInput,
  getEmbedVisual,
  insertAfter
} from './functions.js'
import { Embed } from './embed.js';

const webhookUrl = document.getElementById("webhookUrl");
const content = document.getElementById("content");
const username = document.getElementById("username");
const avatar_url = document.getElementById("avatar_url");
const files = document.getElementById("files");

const sendButton = document.getElementById("sendButton");
sendButton.disabled = true;

/**
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
webhookUrl.addEventListener("input", checkWebhookUrl);

const localTime = document.getElementById("localTime");

localTime.innerText = `${(new Date()).toLocaleTimeString().slice(0, -3)}`;

setInterval(() => {
  let nowData = new Date();
  localTime.innerText = `${nowData.toLocaleTimeString().slice(0, -3)}`

}, 1000);

webhookUrl.addEventListener("focusin", (foc) => {
  webhookUrl.type = "text";
});

webhookUrl.addEventListener("focusout", (foc) => {
  webhookUrl.type = "password";
});

sendButton.addEventListener("click", () => {
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

  if (allembeds.length > 0) {
    let embedArray = [];
    for (const embed of allembeds) {
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
});

function checkWebhookUrl() {
  if (!isValidURL(webhookUrl.value)) {
    const formData = new FormData();
    formData.append("webhookUrl", webhookUrl.value);
    console.log(formData.values);
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
        changeView();
      });
  } else {
    sendButton.disabled = true;
    WebHookInfo.name = null;
    WebHookInfo.avatar = null;
    alertInvalidWebhookUrl.show()
  }
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
    checkIfImageExists(avatar_url.value, (is) => {
      if (is) {
        alertInvalidAvatarUrl.hide();
        avatarView.src = avatar_url.value;
      } else {
        alertInvalidAvatarUrl.show();
        avatarView.src = WebHookInfo.avatar ?? DefaultWebhookInfo.avatar;
      }
    });
  } else {
    alertInvalidAvatarUrl.hide();
    avatarView.src = WebHookInfo.avatar ?? DefaultWebhookInfo.avatar;
  }
}

function setStandardValues() {
  content.value = "Hello World, I am Developer";
  changeView();
}

function isValidURL(string) {
  var res = string
    .replaceAll(/\s/g, "")
    .startsWith("https://discord.com/api/webhooks/");

  if (string.length <= 0) alertInvalidWebhookUrl.hide();
  return res == false;
}

const allembeds = [];

const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
let tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl,
  {
    trigger: "hover",
    delay: { show: 100, hide: 100 }
  }))

const addEmbedButton = document.getElementById("addEmbed");
addEmbedButton.addEventListener("click", async () => addEmbed(await getEmbedInput(), await getEmbedVisual()));

async function addEmbed(inputEmbed, visualEmbed) {
  const uniqeId = generateUniqueId();
  const newEmbed = new Embed(inputEmbed, visualEmbed, uniqeId);
  await newEmbed.setNumber(allembeds.length);

  allembeds.push(newEmbed);

  checkAddEmbedButton();
  checkArrowsEmbeds();

  newEmbed.removeButton.addEventListener("click", () => removeEmbed(newEmbed.id));
  newEmbed.duplicateButton.addEventListener("click", () => duplicateEmbed(newEmbed.id));
  newEmbed.upButton.addEventListener("click", () => upEmbed(newEmbed.id));
  newEmbed.downButton.addEventListener("click", () => downEmbed(newEmbed.id));
  refreshTooltips();

  function upEmbed(id) {
    const indexOfRemoveEmbed = allembeds.findIndex(ele => ele.id == id);
    if (indexOfRemoveEmbed >= 0) {
      const temp = allembeds.splice(indexOfRemoveEmbed, 1)[0];
      allembeds.splice(indexOfRemoveEmbed - 1, 0, temp);

      allembeds[indexOfRemoveEmbed].inputEmbed
        .insertAdjacentElement("beforebegin", allembeds[indexOfRemoveEmbed - 1].inputEmbed);

      allembeds[indexOfRemoveEmbed].visualEmbed
        .insertAdjacentElement("beforebegin", allembeds[indexOfRemoveEmbed - 1].visualEmbed);

      checkArrowsEmbeds();
      countEmbedNumbers();
      refreshTooltips();
    }
  }

  function downEmbed(id) {
    const indexOfRemoveEmbed = allembeds.findIndex(ele => ele.id == id);
    if (indexOfRemoveEmbed >= 0) {
      const temp = allembeds.splice(indexOfRemoveEmbed, 1)[0];
      allembeds.splice(indexOfRemoveEmbed + 1, 0, temp);

      allembeds[indexOfRemoveEmbed].inputEmbed
        .insertAdjacentElement("afterend", allembeds[indexOfRemoveEmbed + 1].inputEmbed);

      allembeds[indexOfRemoveEmbed].visualEmbed
        .insertAdjacentElement("afterend", allembeds[indexOfRemoveEmbed + 1].visualEmbed);

      checkArrowsEmbeds();
      countEmbedNumbers();
      refreshTooltips();
    }
  }

  function removeEmbed(id) {
    const indexOfRemoveEmbed = allembeds.findIndex(ele => ele.id == id);
    if (indexOfRemoveEmbed >= 0) {
      allembeds[indexOfRemoveEmbed].removeEmbed();
      allembeds.splice(indexOfRemoveEmbed, 1);

      countEmbedNumbers();
      checkAddEmbedButton();
      checkArrowsEmbeds();
      refreshTooltips();
    }
  }

  async function duplicateEmbed(id) {
    const indexOfRemoveEmbed = allembeds.findIndex(ele => ele.id == id);

    if (indexOfRemoveEmbed >= 0 && allembeds.length < 10) {
      const cloneEmbed = new Embed(await getEmbedInput(), await getEmbedVisual(), generateUniqueId());
      await cloneEmbed.setEmbed(allembeds[indexOfRemoveEmbed].getEmbed());
      await cloneEmbed.refreshEmbedVisual();

      cloneEmbed.duplicateButton.addEventListener("click", () => duplicateEmbed(cloneEmbed.id));
      cloneEmbed.removeButton.addEventListener("click", () => removeEmbed(cloneEmbed.id));
      cloneEmbed.upButton.addEventListener("click", () => upEmbed(cloneEmbed.id));
      cloneEmbed.downButton.addEventListener("click", () => downEmbed(cloneEmbed.id));

      allembeds.splice(indexOfRemoveEmbed + 1, 0, cloneEmbed);

      countEmbedNumbers();
      checkAddEmbedButton();
      checkArrowsEmbeds();

      insertAfter(cloneEmbed.inputEmbed, allembeds[indexOfRemoveEmbed].inputEmbed);
      insertAfter(cloneEmbed.visualEmbed, allembeds[indexOfRemoveEmbed].visualEmbed);
      refreshTooltips();
    }
  }
}

function checkArrowsEmbeds() {
  allembeds.map((emb, index) => {
    emb.upButton.disabled = false;
    emb.upButton.classList.remove("d-none");

    emb.downButton.disabled = false;
    emb.downButton.classList.remove("d-none");

    if (index == 0) {
      emb.upButton.disabled = true;
      emb.upButton.classList.add("d-none");
    }
    if (index == allembeds.length - 1) {
      emb.downButton.disabled = true;
      emb.downButton.classList.add("d-none");
    }
  });
}

function checkAddEmbedButton() {
  if (allembeds.length >= 10) {
    addEmbedButton.disabled = true;
  } else {
    addEmbedButton.disabled = false;
  }
}

function countEmbedNumbers() {
  for (let i = 0; i < allembeds.length; i++) {
    allembeds[i].setNumber(i);
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