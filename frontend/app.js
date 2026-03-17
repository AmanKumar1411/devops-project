const DEFAULT_API_BASE_URL = "http://localhost:3000";
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

async function fetchHelloMessage(baseUrl) {
  const start = performance.now();
  const response = await fetch(`${baseUrl}/api/hello`);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  const data = await response.json();
  const durationMs = Math.round(performance.now() - start);
  return {
    message: data.message,
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
  return async function runApiCall(sourceLabel) {
    renderStatus(elements.status, toStatus("ok", "Loading response..."));

    const baseUrl = getApiBaseUrl(elements.apiBaseInput);

    try {
      const result = await fetchHelloMessage(baseUrl);
      renderStatus(elements.status, toStatus("ok", result.message));
      renderLatency(elements.latency, result.durationMs);
      addHistoryItem(
        elements.historyList,
        `${nowLabel()} | ${sourceLabel} | ${baseUrl}/api/hello | ${result.durationMs}ms`
      );
    } catch {
      renderStatus(
        elements.status,
        toStatus("error", `Backend not reachable at ${baseUrl}/api/hello`)
      );
      renderLatency(elements.latency, "-");
      addHistoryItem(
        elements.historyList,
        `${nowLabel()} | ${sourceLabel} | ${baseUrl}/api/hello | Request failed`
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
  };

  const runApiCall = createApiRunner(elements);
  let refreshIntervalId = null;

  elements.button.addEventListener("click", () => {
    runApiCall("manual");
  });

  elements.clearHistoryButton.addEventListener("click", () => {
    elements.historyList.innerHTML = "";
    renderStatus(elements.status, toStatus("ok", "History cleared"));
  });

  elements.autoRefreshToggle.addEventListener("change", (event) => {
    if (event.target.checked) {
      runApiCall("auto");
      refreshIntervalId = setInterval(() => {
        runApiCall("auto");
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
