"use strict";

const form = document.querySelector("#signature-form");
const preview = document.querySelector("#preview");
const status = document.querySelector("#status");
const fields = form.elements;
const teamName = "Girişimci İnovatif Liderler Takımı";
const university = "Kadir Has Üniversitesi";
const assetBase = "https://adilsevim.github.io/GILT-Email-Sign-Web/assets/";
const socialLinks = [
  ["LinkedIn", "https://tr.linkedin.com/company/khasgilt"],
  ["Instagram", "https://www.instagram.com/khasgilt/"],
  ["TikTok", "https://www.tiktok.com/@khas.gilt"],
];

function escapeHTML(value) {
  const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return value.replace(/[&<>"']/g, (character) => entities[character]);
}

function signatureData() {
  const isClub = fields.type.value === "club";
  const name = isClub ? teamName : fields.fullName.value.trim();
  const role = (isClub ? fields.team : fields.role).value.trim();
  const emailField = isClub ? fields.clubEmail : fields.memberEmail;
  const phoneField = isClub ? fields.clubPhone : fields.memberPhone;

  return {
    isClub,
    logoStyle: fields.logoStyle.value,
    name: name || "Ad Soyad",
    role: role || (isClub ? "" : "Kulüpteki görevin"),
    email: emailField.validity.valid ? emailField.value.trim() : "",
    phone: phoneField.validity.valid ? phoneField.value.trim() : "",
  };
}

function renderSignature({ isClub, logoStyle, name, role, email, phone }) {
  const colors = ["#2167b1", "#18a77b", "#e74a88", "#f49c30"];
  const strip = colors.map((color) =>
    `<td width="12" height="4" bgcolor="${color}" style="width:12px;height:4px;background-color:${color};font-size:0;line-height:4px;mso-line-height-rule:exactly;">&nbsp;</td>`
  ).join('<td width="3" style="width:3px;font-size:0;line-height:4px;mso-line-height-rule:exactly;">&nbsp;</td>');
  const linkStyle = "color:#1c5297;text-decoration:underline;";
  const socials = socialLinks.map(([label, href]) =>
    `<a href="${href}" style="${linkStyle}font-weight:bold;">${label}</a>`
  ).join(' <span style="color:#78869a;">·</span> ');
  const contacts = [
    email && `<a href="mailto:${escapeHTML(encodeURIComponent(email).replace(/%40/g, "@"))}" style="${linkStyle}">${escapeHTML(email)}</a>`,
    phone && `<a href="tel:${phone.replace(/[^+0-9]/g, "")}" style="${linkStyle}">${escapeHTML(phone)}</a>`,
  ].filter(Boolean).map((link) => `<div style="overflow-wrap:anywhere;">${link}</div>`).join("");

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:17px;color:#172a44;">
  <tr>
    <td valign="top" style="vertical-align:top;padding:2px 12px 0 0;border-right:1px solid #cbd8e7;">
      ${logoStyle === "wordmark"
        ? `<img src="${assetBase}gilt-wordmark.png" width="72" height="60" alt="GİLT" style="display:block;width:72px;height:60px;border:0;">`
        : `${logoStyle === "puzzle" ? `<img src="${assetBase}gilt-puzzle.png" width="42" height="42" alt="" style="display:block;width:42px;height:42px;border:0;margin:0 auto 4px;">` : ""}
      <div style="font-size:28px;line-height:31px;font-weight:bold;letter-spacing:-1px;white-space:nowrap;">GİLT</div>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-top:5px;"><tr>${strip}</tr></table>`}
    </td>
    <td valign="top" style="vertical-align:top;padding:0 0 0 12px;overflow-wrap:anywhere;">
      <div style="font-size:17px;line-height:21px;font-weight:bold;">${escapeHTML(name)}</div>
      ${role ? `<div style="padding-top:3px;color:#1c5297;font-weight:bold;">${escapeHTML(role)}</div>` : ""}
      <div style="padding-top:4px;color:#53647b;">${isClub ? university : `${teamName}<br>${university}`}</div>
      ${contacts ? `<div style="padding-top:5px;">${contacts}</div>` : ""}
      <div style="padding-top:7px;line-height:19px;">${socials}</div>
    </td>
  </tr>
</table>`;
}

function refreshPreview() {
  const isClub = fields.type.value === "club";
  for (const [id, hidden] of [
    ["member-fields", isClub], ["contact-fields", isClub], ["club-contact-fields", !isClub],
  ]) {
    const group = document.getElementById(id);
    group.hidden = hidden;
    group.disabled = hidden;
  }

  document.querySelector("#club-fields").hidden = !isClub;
  fields.team.disabled = !isClub;
  preview.innerHTML = renderSignature(signatureData());
  status.textContent = "";
}

function validate() {
  for (const field of [fields.fullName, fields.role]) {
    field.setCustomValidity(field.disabled || field.value.trim() ? "" : "Bu alanı doldur.");
  }
  for (const field of [fields.memberPhone, fields.clubPhone]) {
    const digitCount = field.value.replace(/\D/g, "").length;
    const valid = !field.value || (digitCount >= 7 && digitCount <= 15);
    field.setCustomValidity(field.disabled || valid ? "" : "7–15 rakam içeren bir telefon numarası gir.");
  }
  return form.reportValidity();
}

function selectPreview() {
  const range = document.createRange();
  range.selectNodeContents(preview);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  return selection;
}

async function copySignature() {
  if (!validate()) return;
  const data = signatureData();
  const html = renderSignature(data);
  const plain = [
    data.name, data.role, data.isClub ? "" : teamName, university, data.email, data.phone,
    ...socialLinks.map(([label, url]) => `${label} — ${url}`),
  ].filter(Boolean).join("\n");

  try {
    await navigator.clipboard.write([new ClipboardItem({
      "text/html": new Blob([html], { type: "text/html" }),
      "text/plain": new Blob([plain], { type: "text/plain" }),
    })]);
    status.textContent = "İmza kopyalandı. E-posta ayarlarında biçimlendirmeyi koruyarak yapıştır.";
  } catch {
    const selection = selectPreview();
    if (document.execCommand("copy")) {
      selection.removeAllRanges();
      status.textContent = "İmza kopyalandı. E-posta ayarlarında biçimlendirmeyi koruyarak yapıştır.";
    } else {
      status.textContent = "İmza seçildi. Ctrl+C veya ⌘C ile kopyala. Telefonda seçili alana basılı tutup Kopyala’yı seç.";
    }
  }
}

function downloadSignature() {
  if (!validate()) return;
  const data = signatureData();
  const html = `<!doctype html><html lang="tr"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>GİLT e-posta imzası</title><body>${renderSignature(data)}</body></html>`;
  const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = data.isClub ? "gilt-kulup-imzasi.html" : "gilt-bireysel-imza.html";
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  status.textContent = "HTML dosyası hazır. Tarayıcıda açıp ekranda görünen imzayı kopyalayabilirsin.";
}

form.addEventListener("submit", (event) => event.preventDefault());
form.addEventListener("input", (event) => {
  event.target.setCustomValidity?.("");
  refreshPreview();
});
for (const option of fields.logoStyle) {
  option.addEventListener("input", refreshPreview);
}
document.querySelector("#copy").addEventListener("click", copySignature);
document.querySelector("#download").addEventListener("click", downloadSignature);
refreshPreview();
