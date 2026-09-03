// =========================
// 🔥 IMAGE PREVIEW (MULTI SUPPORT)
// =========================
function previewImage(input, targetId) {
  const img = document.getElementById(targetId);
  const file = input.files?.[0];

  if (!file || !img) return;

  if (!file.type.startsWith("image/")) {
    alert("Only image files are allowed");
    input.value = "";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert("Image too large. Max 5MB");
    input.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = (e) => {
    img.src = e.target.result;
    img.style.display = "block";
  };

  reader.readAsDataURL(file);
}

// =========================
// 🔥 COLLECT ALL FORM DATA
// =========================
function collectData() {
  const data = {};

  // Helper for nested fields
  function setNested(obj, path, value) {
    const keys = path.split(".");
    let current = obj;

    while (keys.length > 1) {
      const key = keys.shift();
      if (!current[key]) {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[0]] = value;
  }

  // =====================================
  // NORMAL INPUTS
  // =====================================
  document
    .querySelectorAll("input, textarea, select")
    .forEach((input) => {
      if (input.type === "file") return;
      if (!input.name) return;

      // Dynamic tables handled later
      if (input.closest("tbody[data-table-name]")) return;

      let value;

      if (input.tagName === "SELECT") {
        value = input.options[input.selectedIndex]?.text || "";
      } else if (input.type === "checkbox") {
        value = input.checked;
      } else {
        value = input.value.trim();
      }

      if (input.name.includes(".")) {
        setNested(data, input.name, value);
      } else {
        data[input.name] = value;
      }
    });

  // =====================================
  // DYNAMIC TABLES
  // =====================================
  data.tables = [];

  document.querySelectorAll("tbody[data-table-name]").forEach((tbody) => {
    const rows = [];

    tbody.querySelectorAll("tr").forEach((tr) => {
      const values = [];

      tr.querySelectorAll("td").forEach((td) => {
        // skip delete / action cells
        if (
          td.classList.contains("pdf-hide") ||
          td.querySelector(".delete-btn")
        ) {
          return;
        }

        const input = td.querySelector("input, textarea, select");
        if (!input) return; // e.g. S/N cell

        let value;

        if (input.tagName === "SELECT") {
          value = input.options[input.selectedIndex]?.text || "";
        } else if (input.type === "checkbox") {
          value = input.checked;
        } else {
          value = input.value.trim();
        }

        values.push(value);
      });

      const hasData = values.some((v) =>
        typeof v === "boolean" ? v : String(v).trim() !== ""
      );

      if (hasData) {
        rows.push(values); // array style → row[0], row[1]…
      }
    });

    data.tables.push({
      name: tbody.dataset.tableName,
      rows,
    });
  });

  return data; // ← THIS WAS MISSING
} // ← THIS WAS MISSING

// =========================
// 🔥 LOAD BRANDING
// =========================
async function loadBranding() {
  try {
    const res = await fetch("https://panda-certificate-app-production.up.railway.app/certificates/branding");

    if (!res.ok) {
      throw new Error("Branding fetch failed");
    }

    const data = await res.json();

    setImage("letterhead", data.letterhead);
    setImage("stamp", data.stamp);
    setImage("inspectorSignature", data.signature);
    setImage("stampSignature", data.signature);
    setImage("asnt", data.asnt);
    setImage("leea", data.leea);
    setImage("awrf", data.awrf);
  } catch (err) {
    console.error("Branding load failed:", err);
  }
}

function setImage(id, src) {
  const el = document.getElementById(id);
  if (!el || !src) return;
  el.src = src;
}

loadBranding();

// =========================
// 🔥 ADD ROW (UNIVERSAL)
// =========================
function addRow(target) {
  let tbody = null;

  if (typeof target === "string") {
    tbody = document.querySelector(`tbody[data-add-row="${target}"]`);
  } else if (target instanceof HTMLElement) {
    tbody = target.closest("table")?.querySelector("tbody");
  } else {
    tbody = document.querySelector("tbody[data-add-row]");
  }

  if (!tbody) {
    console.log("tbody not found");
    return;
  }

  const templateRow = tbody.querySelector("tr");
  if (!templateRow) {
    console.log("template row not found");
    return;
  }

  const newRow = templateRow.cloneNode(true);

  newRow.querySelectorAll("input, textarea, select").forEach((el) => {
    if (el.type === "checkbox") {
      el.checked = false;
    } else if (el.tagName === "SELECT") {
      el.selectedIndex = 0;
    } else {
      el.value = "";
    }
  });

  const sn = newRow.querySelector(".sn");
  if (sn) {
    sn.textContent = tbody.querySelectorAll("tr").length + 1;
  }

  tbody.appendChild(newRow);
}

// =========================
// 🔥 DELETE ROW (UNIVERSAL)
// =========================
function deleteRow(btn) {
  const row = btn.closest("tr");
  if (!row) return;

  const tbody = row.closest("tbody");
  if (!tbody) return;

  if (tbody.rows.length <= 1) {
    alert("At least one row is required.");
    return;
  }

  row.remove();

  tbody.querySelectorAll("tr").forEach((tr, index) => {
    const sn = tr.querySelector(".sn");
    if (sn) {
      sn.textContent = index + 1;
    }
  });
}

// =========================
// 🔥 DOWNLOAD PDF
// =========================
async function downloadPDF(event) {
  const btn = event?.currentTarget || event?.target;
  let url = null;

  try {
    document.body.classList.add("pdf-generating");

    if (btn) {
      btn.disabled = true;
      btn.dataset.originalHtml = btn.innerHTML;
      btn.innerHTML = "⏳";
      btn.style.opacity = "0.6";
      btn.style.cursor = "not-allowed";
    }

    // Wait for all images
    const images = [...document.images];
    await Promise.all(
      images.map((img) => {
        if (!img.src || img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      })
    );

    const data = collectData();

    const formData = new FormData();
    formData.append("type", document.body.dataset.certType || "GENERAL");
    formData.append("data", JSON.stringify(data));

    const fileInput = document.querySelector("input[data-field]");
    if (fileInput?.files?.[0]) {
      formData.append("image", fileInput.files[0]);
      formData.append("imageField", fileInput.dataset.field);
    }

    const res = await fetch("https://panda-certificate-app-production.up.railway.app/certificates/pdf", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const blob = await res.blob();
    url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${(
      document.body.dataset.certType || "certificate"
    ).toLowerCase()}.pdf`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    await new Promise((resolve) => setTimeout(resolve, 500));
  } catch (err) {
    console.error("PDF Download Error:", err);
    alert(err?.message || "❌ Failed to download PDF");
  } finally {
    document.body.classList.remove("pdf-generating");

    if (btn) {
      btn.disabled = false;
      btn.innerHTML = btn.dataset.originalHtml || "⬇ Download PDF";
      btn.style.opacity = "";
      btn.style.cursor = "";
    }

    if (url) {
      setTimeout(() => URL.revokeObjectURL(url), 3000);
    }
  }
}

// =====================================
// DATE SYNC (UNIVERSAL)
// =====================================
function initStampDates() {
  document.querySelectorAll("[data-stamp-date]").forEach((input) => {
    const stamp = document.getElementById("stampDate");
    if (!stamp) return;

    const update = () => {
      if (!input.value) {
        stamp.textContent = "";
        return;
      }

      const date = new Date(input.value);
      stamp.textContent = date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      });
    };

    update();
    input.addEventListener("change", update);
    input.addEventListener("input", update);
  });
}

document.addEventListener("DOMContentLoaded", initStampDates);

// =====================================
// 👁 VIEW MODE
// =====================================
document.addEventListener("DOMContentLoaded", () => {
  const isView = document.body.dataset.isView === "true";
  if (!isView) return;

  document.querySelectorAll("input, textarea, select").forEach((field) => {
    if (field.tagName === "SELECT") {
      field.disabled = true;
    } else {
      field.readOnly = true;
    }
  });
});