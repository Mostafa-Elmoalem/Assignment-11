import { getApod, getPlanets, getUpcomingLaunches } from "./api.js";
import { renderLaunches, renderPlanetComparison, renderPlanetDetails } from "./render.js";
import { formatDate, isValidDate, todayISO } from "./utils.js";

const $ = (selector) => document.querySelector(selector);
const selectedDate = $("#apod-date-input");
const today = todayISO();
let apodController;
let planets = [];

function setText(selector, text) {
  const element = $(selector);
  if (element) element.textContent = text;
}

function setApodLoading(isLoading) {
  $("#apod-loading")?.classList.toggle("hidden", !isLoading);
  $("#apod-spinner")?.classList.toggle("hidden", !isLoading);
  $("#apod-error")?.classList.add("hidden");
}

function setApodError(message = "Failed to load space picture.") {
  $("#apod-loading")?.classList.remove("hidden");
  $("#apod-spinner")?.classList.add("hidden");
  $("#apod-error")?.classList.remove("hidden");
  const errorText = $("#apod-error p");
  if (errorText) errorText.textContent = message;
}

function renderApod(data) {
  const date = formatDate(data.date, "long");
  const image = $("#apod-image");
  const video = $("#apod-video");
  const viewButton = $("#view-full-resolution-btn");

  image?.classList.toggle("hidden", data.media_type !== "image");
  video?.classList.toggle("hidden", data.media_type !== "video");
  if (data.media_type === "image" && image) {
    video.src = "";
    image.src = data.hdurl || data.url;
  }
  if (data.media_type === "video" && video) {
    image.src = "";
    video.src = data.url;
  }

  setText("#apod-title", data.title || "Untitled");
  setText("#apod-date", `Astronomy Picture of the Day - ${date}`);
  setText("#apod-date-info", date);
  setText("#apod-media-type", data.media_type || "Unknown");
  setText("#apod-explanation", data.explanation || "No description available.");
  const dateDetail = $("#apod-date-detail");
  if (dateDetail) dateDetail.lastChild.textContent = date;
  if (viewButton) {
    viewButton.dataset.source = data.hdurl || data.url || "";
    viewButton.classList.toggle("hidden", !data.url);
  }
  $("#apod-loading")?.classList.add("hidden");
}

async function loadApod(date) {
  if (!isValidDate(date) || date < "1995-06-16" || date > today) {
    setApodError("Choose a date between June 16, 1995 and today.");
    return;
  }

  apodController?.abort();
  apodController = new AbortController();
  $("#apod-image")?.classList.add("hidden");
  $("#apod-video")?.classList.add("hidden");
  $("#view-full-resolution-btn")?.classList.add("hidden");
  setText("#apod-title", "Loading...");
  setText("#apod-explanation", "Loading description...");
  setApodLoading(true);

  try {
    const data = await getApod(date, apodController.signal);
    renderApod(data);
  } catch (error) {
    if (error.name !== "AbortError") setApodError(error.message);
  }
}

function updateDateLabel() {
  const label = selectedDate?.nextElementSibling;
  if (label && selectedDate.value) label.textContent = formatDate(selectedDate.value, "short");
}

function setupNavigation() {
  const sidebar = $("#sidebar");
  const overlay = $("#overlay");
  $("#sidebar-toggle")?.addEventListener("click", (event) => {
    event.stopPropagation();
    sidebar?.classList.toggle("sidebar-open");
    overlay?.classList.toggle("sidebar-overlay");
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest("#sidebar") && !event.target.closest("#sidebar-toggle")) {
      sidebar?.classList.remove("sidebar-open");
      overlay?.classList.remove("sidebar-overlay");
    }
  });
  document.querySelectorAll("nav > a").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      document.querySelectorAll("nav > a").forEach((item) => {
        item.classList.remove("bg-blue-500/10", "text-blue-400");
        item.classList.add("text-slate-300", "hover:bg-slate-800");
      });
      link.classList.add("bg-blue-500/10", "text-blue-400");
      link.classList.remove("text-slate-300", "hover:bg-slate-800");
      document.querySelectorAll("section").forEach((section) => section.classList.add("hidden"));
      $(`#${link.dataset.section}`)?.classList.remove("hidden");
      sidebar?.classList.remove("sidebar-open");
      overlay?.classList.remove("sidebar-overlay");
    });
  });
}

async function loadLaunches() {
  const featured = $("#featured-launch");
  const grid = $("#launches-grid");
  if (!featured || !grid) return;
  featured.textContent = "Loading launches...";
  try {
    const launches = await getUpcomingLaunches();
    renderLaunches(launches, featured, grid);
    setText("#launches-count", `${launches.length} Launches`);
    setText("#launches-count-mobile", launches.length);
  } catch (error) {
    featured.textContent = `Unable to load launches: ${error.message}`;
    grid.textContent = "";
  }
}

async function loadPlanets() {
  const details = $("#planet-details");
  const comparison = $("#planet-comparison-tbody");
  if (!details || !comparison) return;
  details.textContent = "Loading planets...";
  try {
    planets = await getPlanets();
    renderPlanetComparison(planets, comparison);
    const firstPlanet = planets.find((planet) => planet.id === "terre") || planets[0];
    renderPlanetDetails(firstPlanet, details);
    document.querySelectorAll("[data-planet-id]").forEach((card) => {
      card.addEventListener("click", () => {
        const selectedPlanet = planets.find((planet) => planet.id === card.dataset.planetId);
        renderPlanetDetails(selectedPlanet, details);
      });
    });
  } catch (error) {
    details.textContent = `Unable to load planets: ${error.message}`;
    comparison.textContent = "";
  }
}

function setupApod() {
  if (!selectedDate) return;
  selectedDate.value = today;
  selectedDate.max = today;
  updateDateLabel();
  selectedDate.addEventListener("change", updateDateLabel);
  $("#load-date-btn")?.addEventListener("click", () => loadApod(selectedDate.value));
  $("#today-apod-btn")?.addEventListener("click", () => {
    selectedDate.value = today;
    updateDateLabel();
    loadApod(today);
  });
  $("#view-full-resolution-btn")?.addEventListener("click", () => {
    const source = $("#view-full-resolution-btn")?.dataset.source;
    if (source) window.open(source, "_blank", "noopener,noreferrer");
  });
  loadApod(today);
}

setupNavigation();
setupApod();
loadLaunches();
loadPlanets();
