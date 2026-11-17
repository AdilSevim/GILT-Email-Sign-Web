"use strict";

const form = document.querySelector("#signature-form");
const preview = document.querySelector("#preview");
const status = document.querySelector("#status");
const fields = form.elements;
const signatureLabels = {
  tr: {
    teamName: "Girişimci İnovatif Liderler Takımı",
    university: "Kadir Has Üniversitesi",
    name: "Ad Soyad",
    role: "Kulüpteki görevin",
    roleExample: "Örn. Sponsorluk İlişkileri Ekip Lideri",
    teamExample: "Örn. Sponsorluk İlişkileri",
    title: "GİLT e-posta imzası",
    files: { club: "gilt-kulup-imzasi", member: "gilt-bireysel-imza" },
  },
  en: {
    teamName: "Entrepreneurial and Innovative Leaders Team",
    university: "Kadir Has University",
    name: "Full Name",
    role: "Your role in the club",
    roleExample: "e.g. Sponsorship Team Lead",
    teamExample: "e.g. Sponsorship Relations",
    title: "GİLT email signature",
    files: { club: "gilt-club-signature", member: "gilt-member-signature" },
  },
};
// Recipients and downloaded signatures need the publicly hosted image.
const wordmarkURL = "https://adilsevim.github.io/GILT-Email-Sign-Web/assets/gilt-color-wordmark.png";
const clubEmail = document.querySelector("[data-club-email]").textContent.trim();
const socialLinks = Array.from(document.querySelectorAll("[data-signature-channel]"), (link) =>
  [link.textContent.trim(), link.href]
);

function escapeHTML(value) {
  const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return value.replace(/[&<>"']/g, (character) => entities[character]);
}

function signatureData() {
  const isClub = fields.type.value === "club";
  const language = fields.signatureLanguage.value;
  const labels = signatureLabels[language];
  const name = isClub ? labels.teamName : fields.fullName.value.trim();
  const role = (isClub ? fields.team : fields.role).value.trim();
  const emailField = isClub ? fields.clubEmail : fields.memberEmail;
  const phoneField = isClub ? fields.clubPhone : fields.memberPhone;
  const email = emailField.validity.valid ? emailField.value.trim() : "";

  return {
    isClub,
    language,
    labels,
    name: name || labels.name,
    role: role || (isClub ? "" : labels.role),
    emails: email && email.toLowerCase() !== clubEmail ? [email, clubEmail] : [clubEmail],
    phone: phoneField.validity.valid ? phoneField.value.trim() : "",
  };
}

function renderSignature({ isClub, language, labels, name, role, emails, phone }) {
  const { teamName, university } = labels;
  const linkStyle = "color:#1c5297;text-decoration:underline;";
  const socials = socialLinks.map(([label, href]) =>
    `<a href="${escapeHTML(href)}" style="${linkStyle}font-weight:bold;white-space:nowrap;">${escapeHTML(label)}</a>`
  ).join(' <span aria-hidden="true" style="color:#78869a;">·</span> ');
  const contacts = [
    ...emails.map((email) =>
      `<a href="mailto:${escapeHTML(encodeURIComponent(email).replace(/%40/g, "@"))}" style="${linkStyle}">${escapeHTML(email)}</a>`
    ),
    phone && `<a href="tel:${phone.replace(/[^+0-9]/g, "")}" style="${linkStyle}">${escapeHTML(phone)}</a>`,
  ].filter(Boolean).map((link) => `<div style="word-wrap:break-word;overflow-wrap:anywhere;">${link}</div>`).join("");

  return `<table role="presentation" lang="${language}" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;max-width:440px;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:17px;color:#172a44;">
  <tr>
    <td width="78" valign="middle" style="width:78px;vertical-align:middle;padding:0 12px 0 0;border-right:1px solid #cbd8e7;">
      <img src="${wordmarkURL}" width="66" height="56" alt="GİLT" style="display:block;width:66px;height:56px;border:0;font-size:16px;font-weight:bold;">
    </td>
    <td valign="middle" style="vertical-align:middle;padding:0 0 0 12px;word-wrap:break-word;overflow-wrap:anywhere;">
      <div style="font-size:17px;line-height:21px;font-weight:bold;">${escapeHTML(name)}</div>
      ${role ? `<div style="padding-top:3px;color:#1c5297;font-weight:bold;">${escapeHTML(role)}</div>` : ""}
      <div style="padding-top:4px;color:#53647b;">${isClub ? university : `${teamName}<br>${university}`}</div>
    </td>
  </tr>
  <tr><td colspan="2" height="9" style="height:9px;font-size:0;line-height:9px;">&nbsp;</td></tr>
  <tr>
    <td colspan="2" style="padding-top:8px;border-top:1px solid #cbd8e7;">
      ${contacts}
      <div style="padding-top:4px;line-height:19px;">${socials}</div>
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
  const data = signatureData();
  fields.role.placeholder = data.labels.roleExample;
  fields.team.placeholder = data.labels.teamExample;
  preview.innerHTML = renderSignature(data);
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
    data.name, data.role, data.isClub ? "" : data.labels.teamName, data.labels.university, ...data.emails, data.phone,
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
  const html = `<!doctype html><html lang="${data.language}"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${data.labels.title}</title><body>${renderSignature(data)}</body></html>`;
  const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${data.labels.files[data.isClub ? "club" : "member"]}.html`;
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
fields.signatureLanguage.addEventListener("change", refreshPreview);
document.querySelector("#copy").addEventListener("click", copySignature);
document.querySelector("#download").addEventListener("click", downloadSignature);
refreshPreview();
