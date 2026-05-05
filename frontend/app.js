const DEFAULT_API_BASE_URL = "";
const REFRESH_INTERVAL_MS = 10_000;

function nowLabel() {
  return new Date().toLocaleTimeString();
}

function getApiBaseUrl(inputElement) {
  const typedUrl = inputElement.value.trim();
  return typedUrl || window.API_BASE_URL || DEFAULT_API_BASE_URL;
}

function toStatus(type, message) {
  return { type, message };
}

async function requestJson(baseUrl, path, options = {}) {
  const start = performance.now();
  const response = await fetch(`${baseUrl}${path}`, options);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  const data = await response.json();
  const durationMs = Math.round(performance.now() - start);
  return {
    data,
    durationMs,
  };
}

function renderStatus(element, status) {
  element.textContent = status.message;
  element.classList.remove("ok", "error");
  if (status.type === "ok") {
    element.classList.add("ok");
  }
  if (status.type === "error") {
    element.classList.add("error");
  }
}

function renderLatency(element, durationMs) {
  if (typeof durationMs === "number") {
    element.textContent = `${durationMs}ms`;
    return;
  }

  element.textContent = String(durationMs);
}

function renderResponseOutput(element, payload) {
  element.textContent = JSON.stringify(payload, null, 2);
}

function addHistoryItem(historyList, text) {
  const item = document.createElement("li");
  item.textContent = text;
  historyList.prepend(item);
  if (historyList.childElementCount > 8) {
    historyList.removeChild(historyList.lastElementChild);
  }
}

function applyTheme(isContrast) {
  document.body.classList.toggle("theme-contrast", isContrast);
  localStorage.setItem("dashboard-theme-contrast", String(isContrast));
}

function createApiRunner(elements) {
  return async function runApiCall(sourceLabel, path, options = {}) {
    renderStatus(elements.status, toStatus("ok", "Loading response..."));

    const baseUrl = getApiBaseUrl(elements.apiBaseInput);

    try {
      const result = await requestJson(baseUrl, path, options);
      const message =
        typeof result.data.message === "string"
          ? result.data.message
          : `Success for ${path}`;

      renderStatus(elements.status, toStatus("ok", message));
      renderLatency(elements.latency, result.durationMs);
      renderResponseOutput(elements.responseOutput, result.data);
      addHistoryItem(
        elements.historyList,
        `${nowLabel()} | ${sourceLabel} | ${baseUrl}${path} | ${result.durationMs}ms`
      );
    } catch {
      renderStatus(
        elements.status,
        toStatus("error", `Backend not reachable at ${baseUrl}${path}`)
      );
      renderLatency(elements.latency, "-");
      renderResponseOutput(elements.responseOutput, {
        error: `Request failed for ${baseUrl}${path}`,
      });
      addHistoryItem(
        elements.historyList,
        `${nowLabel()} | ${sourceLabel} | ${baseUrl}${path} | Request failed`
      );
    }
  };
}

function initializeUi() {
  const elements = {
    button: document.getElementById("call-api-btn"),
    status: document.getElementById("status"),
    apiBaseInput: document.getElementById("api-base-input"),
    autoRefreshToggle: document.getElementById("auto-refresh-toggle"),
    clearHistoryButton: document.getElementById("clear-history-btn"),
    historyList: document.getElementById("history-list"),
    latency: document.getElementById("latency"),
    themeToggle: document.getElementById("theme-toggle"),
    healthButton: document.getElementById("health-btn"),
    timeButton: document.getElementById("time-btn"),
    productsButton: document.getElementById("products-btn"),
    searchInput: document.getElementById("search-input"),
    searchButton: document.getElementById("search-btn"),
    echoInput: document.getElementById("echo-input"),
    echoButton: document.getElementById("echo-btn"),
    responseOutput: document.getElementById("response-output"),
  };

  const runApiCall = createApiRunner(elements);
  let refreshIntervalId = null;

  elements.button.addEventListener("click", () => {
    runApiCall("manual", "/api/hello");
  });

  elements.healthButton.addEventListener("click", () => {
    runApiCall("health", "/api/health");
  });

  elements.timeButton.addEventListener("click", () => {
    runApiCall("time", "/api/time");
  });

  elements.productsButton.addEventListener("click", () => {
    runApiCall("products", "/api/products");
  });

  elements.searchButton.addEventListener("click", () => {
    const query = encodeURIComponent(elements.searchInput.value.trim());
    runApiCall("search", `/api/products?search=${query}`);
  });

  elements.echoButton.addEventListener("click", () => {
    runApiCall("echo", "/api/echo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: elements.echoInput.value.trim() || "ping" }),
    });
  });

  elements.clearHistoryButton.addEventListener("click", () => {
    elements.historyList.innerHTML = "";
    renderStatus(elements.status, toStatus("ok", "History cleared"));
  });

  elements.autoRefreshToggle.addEventListener("change", (event) => {
    if (event.target.checked) {
      runApiCall("auto", "/api/hello");
      refreshIntervalId = setInterval(() => {
        runApiCall("auto", "/api/hello");
      }, REFRESH_INTERVAL_MS);
      return;
    }

    if (refreshIntervalId) {
      clearInterval(refreshIntervalId);
      refreshIntervalId = null;
    }
  });

  const prefersContrast =
    localStorage.getItem("dashboard-theme-contrast") === "true";
  applyTheme(prefersContrast);

  elements.themeToggle.addEventListener("click", () => {
    const nextValue = !document.body.classList.contains("theme-contrast");
    applyTheme(nextValue);
  });
}

document.addEventListener("DOMContentLoaded", initializeUi);
