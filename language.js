"use strict";

const languageControls = document.querySelector(".site-language");
const languageButtons = [...languageControls.querySelectorAll("button")];
const localizedAttributes = ["alt", "aria-label", "content", "href", "placeholder", "src", "title"];
const translationSelector = ["data-en", "data-en-html", ...localizedAttributes.map((attribute) => `data-en-${attribute}`)]
  .map((attribute) => `[${attribute}]`).join(", ");
const localizedElements = [...document.querySelectorAll(translationSelector)];
const translations = localizedElements.flatMap((element) =>
  [...element.attributes].filter(({ name }) => name === "data-en" || name.startsWith("data-en-")).map(({ name, value }) => {
    if (name === "data-en" || name === "data-en-html") {
      const property = name === "data-en-html" ? "innerHTML" : "textContent";
      return { tr: element[property], en: value, write: (text) => { element[property] = text; } };
    }
    const attribute = name.slice("data-en-".length);
    return { tr: element.getAttribute(attribute), en: value, write: (text) => element.setAttribute(attribute, text) };
  })
);
const localizedLinks = [...document.querySelectorAll("[data-localized-link]")].map((link) => [link, link.href]);

function applyLanguage(language) {
  document.documentElement.lang = language;
  for (const translation of translations) translation.write(translation[language]);
  for (const [link, original] of localizedLinks) {
    const url = new URL(original);
    if (language === "en") url.searchParams.set("lang", "en");
    link.href = url;
  }
  for (const button of languageButtons) {
    button.setAttribute("aria-pressed", String(button.value === language));
  }
}

applyLanguage(new URL(location.href).searchParams.get("lang") === "en" ? "en" : "tr");
languageControls.hidden = false;
for (const button of languageButtons) {
  button.addEventListener("click", () => {
    if (document.documentElement.lang === button.value) return;
    const url = new URL(location.href);
    if (button.value === "en") url.searchParams.set("lang", "en");
    else url.searchParams.delete("lang");
    history.replaceState(null, "", url);
    applyLanguage(button.value);
    document.dispatchEvent(new Event("sitelanguagechange"));
  });
}
