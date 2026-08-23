(() => {
  if (window.__KINORATES_EXPORT_BRANDING__) return;
  window.__KINORATES_EXPORT_BRANDING__ = true;

  const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <rect x="1" y="1" width="118" height="118" rx="29" fill="#FFFFFF" stroke="#E6E6EB" stroke-width="2"/>
    <g fill="#111111">
      <path d="M30 42h20v50H30z"/>
      <path d="M30 34h17l9-12H39c-5 0-9 4-9 9v3Z"/>
      <path d="M54 30l14-17h22L75 31Z"/>
      <path d="M79 27l11-14h14L93 28Z"/>
      <path d="M52 57l28-31h22L68 66Z"/>
      <path d="M62 69l11-12 29 35H80Z"/>
    </g>
  </svg>`;

  const EXCEL_SRC = "https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js";
  const EXCEL_INTEGRITY = "sha384-Pqp51FUN2/qzfxZxBCtF0stpc9ONI6MYZpVqmo8m20SoaQCzf+arZvACkLkirlPz";

  let logoPngPromise = null;
  let excelRuntimePromise = null;
  const brandedPdfDefinitions = new WeakSet();

  function logoPngDataUrl() {
    if (logoPngPromise) return logoPngPromise;
    logoPngPromise = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = 240;
          canvas.height = 240;
          const ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/png"));
        } catch (error) { reject(error); }
      };
      img.onerror = reject;
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(LOGO_SVG)}`;
    });
    return logoPngPromise;
  }

  function ensureExcelRuntime() {
    if (window.ExcelJS?.Workbook) return Promise.resolve(window.ExcelJS);
    if (excelRuntimePromise) return excelRuntimePromise;

    excelRuntimePromise = new Promise((resolve, reject) => {
      const existing = [...document.scripts].find((script) => script.src === EXCEL_SRC);
      if (existing) {
        existing.addEventListener("load", () => window.ExcelJS?.Workbook ? resolve(window.ExcelJS) : reject(new Error("ExcelJS unavailable")), { once: true });
        existing.addEventListener("error", () => reject(new Error("Не удалось загрузить ExcelJS")), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = EXCEL_SRC;
      script.crossOrigin = "anonymous";
      script.integrity = EXCEL_INTEGRITY;
      script.onload = () => window.ExcelJS?.Workbook ? resolve(window.ExcelJS) : reject(new Error("ExcelJS unavailable"));
      script.onerror = () => reject(new Error("Не удалось загрузить ExcelJS"));
      document.head.appendChild(script);
    });

    return excelRuntimePromise;
  }

  async function brandWorkbook(workbook) {
    if (!workbook || workbook.__kinoratesBrandApplied) return;
    workbook.__kinoratesBrandApplied = true;
    const sheet = workbook.getWorksheet?.("Рабочая смета") || workbook.worksheets?.[0];
    if (!sheet || typeof workbook.addImage !== "function" || typeof sheet.addImage !== "function") return;

    try {
      const png = await logoPngDataUrl();
      const imageId = workbook.addImage({ base64: png, extension: "png" });
      sheet.addImage(imageId, {
        tl: { col: 0.08, row: 0.12 },
        ext: { width: 32, height: 32 },
        editAs: "oneCell",
      });

      const title = sheet.getCell?.("A1");
      if (title && typeof title.value === "string" && !/^\s{6}/.test(title.value)) title.value = `       ${title.value}`;
      const firstRow = sheet.getRow?.(1);
      if (firstRow) firstRow.height = Math.max(Number(firstRow.height) || 0, 30);
    } catch (error) {
      console.warn("KinoRates: не удалось добавить логотип в Excel", error);
    }
  }

  function patchWorkbookInstance(workbook) {
    if (!workbook || workbook.__kinoratesWriteWrapped || typeof workbook.xlsx?.writeBuffer !== "function") return workbook;
    workbook.__kinoratesWriteWrapped = true;
    const originalWriteBuffer = workbook.xlsx.writeBuffer.bind(workbook.xlsx);
    workbook.xlsx.writeBuffer = async (...args) => {
      await brandWorkbook(workbook);
      return originalWriteBuffer(...args);
    };
    return workbook;
  }

  function patchExcelRuntime() {
    const Workbook = window.ExcelJS?.Workbook;
    if (!Workbook?.prototype || Workbook.prototype.__kinoratesBrandPatched) return;
    Workbook.prototype.__kinoratesBrandPatched = true;

    const originalAddWorksheet = Workbook.prototype.addWorksheet;
    if (typeof originalAddWorksheet === "function") {
      Workbook.prototype.addWorksheet = function patchedAddWorksheet(...args) {
        const sheet = originalAddWorksheet.apply(this, args);
        patchWorkbookInstance(this);
        return sheet;
      };
    }
  }

  function brandPdfDefinition(docDefinition) {
    if (!docDefinition || typeof docDefinition !== "object" || brandedPdfDefinitions.has(docDefinition)) return;
    brandedPdfDefinitions.add(docDefinition);

    const content = Array.isArray(docDefinition.content)
      ? docDefinition.content
      : docDefinition.content
        ? [docDefinition.content]
        : [];

    const titleNode = content.find((node) => node && typeof node === "object" && typeof node.text === "string" && /^KinoRates\s*[·—-]/i.test(node.text));
    if (titleNode) titleNode.text = titleNode.text.replace(/^KinoRates\s*[·—-]\s*/i, "");

    content.unshift({
      columns: [
        { svg: LOGO_SVG, width: 24 },
        {
          stack: [
            { text: "KinoRates", bold: true, fontSize: 11, color: "#202124" },
            { text: "kinorates.ru", fontSize: 7, color: "#77777F", margin: [0, 1, 0, 0] },
          ],
          margin: [8, 2, 0, 0],
        },
      ],
      columnGap: 0,
      margin: [0, 0, 0, 10],
    });

    docDefinition.content = content;
  }

  function patchPdfRuntime() {
    const pdfMake = window.pdfMake;
    if (!pdfMake?.createPdf || pdfMake.createPdf.__kinoratesBrandWrapped) return;
    const originalCreatePdf = pdfMake.createPdf.bind(pdfMake);
    const wrapped = function brandedCreatePdf(docDefinition, ...args) {
      try { brandPdfDefinition(docDefinition); }
      catch (error) { console.warn("KinoRates: не удалось добавить логотип в PDF", error); }
      return originalCreatePdf(docDefinition, ...args);
    };
    wrapped.__kinoratesBrandWrapped = true;
    pdfMake.createPdf = wrapped;
  }

  const originalExcelExport = window.exportBudgetExcel;
  const originalPdfExport = window.exportBudgetPdf;

  async function brandedExcelExport(...args) {
    if (typeof originalExcelExport !== "function") return;
    try {
      await ensureExcelRuntime();
      patchExcelRuntime();
    } catch (error) {
      console.warn("KinoRates: Excel branding prep failed", error);
    }
    return originalExcelExport.apply(this, args);
  }

  async function brandedPdfExport(...args) {
    if (typeof originalPdfExport !== "function") return;
    patchPdfRuntime();
    return originalPdfExport.apply(this, args);
  }

  if (typeof originalExcelExport === "function") window.exportBudgetExcel = brandedExcelExport;
  if (typeof originalPdfExport === "function") window.exportBudgetPdf = brandedPdfExport;

  patchPdfRuntime();

  document.addEventListener("click", (event) => {
    const excelButton = event.target.closest?.("[data-export-excel]");
    if (!excelButton || typeof originalExcelExport !== "function") return;
    event.preventDefault();
    event.stopImmediatePropagation();
    brandedExcelExport.call(excelButton).catch((error) => console.error("KinoRates: Excel export failed", error));
  }, true);

  function bindPdfButton() {
    const pdf = document.querySelector("[data-export-pdf]");
    if (pdf && typeof originalPdfExport === "function") pdf.onclick = brandedPdfExport;
  }

  const observer = new MutationObserver(() => requestAnimationFrame(bindPdfButton));
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener("hashchange", () => requestAnimationFrame(bindPdfButton));
  bindPdfButton();
})();
