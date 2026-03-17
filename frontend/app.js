const DEFAULT_API_BASE_URL = "http://localhost:3000";

function getApiBaseUrl() {
  return window.API_BASE_URL || DEFAULT_API_BASE_URL;
}

function toStatus(type, message) {
  return { type, message };
}

async function fetchHelloMessage(baseUrl = getApiBaseUrl()) {
  const response = await fetch(`${baseUrl}/api/hello`);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  const data = await response.json();
  return data.message;
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

function createApiButtonController(buttonElement, statusElement) {
  return async function onClick() {
    renderStatus(statusElement, toStatus("ok", "Loading response..."));
    try {
      const message = await fetchHelloMessage();
      renderStatus(statusElement, toStatus("ok", message));
    } catch {
      renderStatus(statusElement, toStatus("error", "Backend not reachable"));
    }
  };
}

function initializeUi() {
  const button = document.getElementById("call-api-btn");
  const status = document.getElementById("status");
  button.addEventListener("click", createApiButtonController(button, status));
}

document.addEventListener("DOMContentLoaded", initializeUi);
