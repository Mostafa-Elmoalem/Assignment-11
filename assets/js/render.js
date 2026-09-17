import { escapeHTML, formatLaunchDate, numberOrNA, safeURL } from "./utils.js";

const value = (item, fallback = "N/A") => escapeHTML(item ?? fallback);
const number = (item, digits = 2) => escapeHTML(numberOrNA(item, digits));

function imageMarkup(url, alt, className = "w-full h-full object-cover") {
  const imageURL = safeURL(url);
  if (!imageURL) {
    return `<div class="h-full min-h-48 bg-slate-900/50 flex items-center justify-center"><i class="fas fa-rocket text-5xl text-slate-700"></i></div>`;
  }

  return `<img src="${escapeHTML(imageURL)}" alt="${value(alt)}" class="${className}" loading="lazy" referrerpolicy="no-referrer" onerror="this.classList.add('hidden'); this.nextElementSibling.classList.remove('hidden')"><div class="hidden h-full min-h-48 bg-slate-900/50 flex items-center justify-center"><i class="fas fa-rocket text-5xl text-slate-700"></i></div>`;
}

function launchProvider(launch) {
  return launch.launch_service_provider?.name || "Unknown provider";
}

function launchStatus(launch) {
  return launch.status?.name || launch.status?.abbrev || "Unknown status";
}

export function renderLaunches(launches, featuredElement, gridElement) {
  if (!launches.length) {
    featuredElement.textContent = "No upcoming launches found.";
    gridElement.textContent = "";
    return;
  }

  const [featured, ...others] = launches;
  const featuredTime = formatLaunchDate(featured.net);
  const featuredImage = featured.image?.image_url;

  featuredElement.innerHTML = `
    <article class="relative bg-slate-800/30 border border-slate-700 rounded-3xl overflow-hidden">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 p-8">
        <div class="flex flex-col justify-between gap-6">
          <div>
            <div class="flex flex-wrap items-center gap-3 mb-4">
              <span class="px-4 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold">Featured Launch</span>
              <span class="px-4 py-1.5 bg-slate-700 text-slate-200 rounded-full text-sm font-semibold">${value(launchStatus(featured))}</span>
            </div>
            <h3 class="text-3xl font-bold mb-3 leading-tight">${value(featured.name)}</h3>
            <div class="flex flex-col xl:flex-row gap-4 mb-6 text-slate-400">
              <span><i class="fas fa-building mr-2"></i>${value(launchProvider(featured))}</span>
              <span><i class="fas fa-rocket mr-2"></i>${value(featured.rocket?.configuration?.name)}</span>
            </div>
            <div class="grid xl:grid-cols-2 gap-4 mb-6">
              <div class="bg-slate-900/50 rounded-xl p-4"><p class="text-xs text-slate-400 mb-1">Launch Date</p><p class="font-semibold">${value(featuredTime.date)}</p></div>
              <div class="bg-slate-900/50 rounded-xl p-4"><p class="text-xs text-slate-400 mb-1">Launch Time</p><p class="font-semibold">${value(featuredTime.time)}</p></div>
              <div class="bg-slate-900/50 rounded-xl p-4"><p class="text-xs text-slate-400 mb-1">Location</p><p class="font-semibold text-sm">${value(featured.pad?.location?.name)}</p></div>
              <div class="bg-slate-900/50 rounded-xl p-4"><p class="text-xs text-slate-400 mb-1">Country</p><p class="font-semibold">${value(featured.pad?.location?.country?.name)}</p></div>
            </div>
            <p class="text-slate-300 leading-relaxed">${value(featured.mission?.description, "No mission description available.")}</p>
          </div>
        </div>
        <div class="relative h-96 rounded-2xl overflow-hidden bg-slate-900/50">${imageMarkup(featuredImage, featured.name)}</div>
      </div>
    </article>`;

  gridElement.innerHTML = others.map((launch) => {
    const time = formatLaunchDate(launch.net);
    return `<article class="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden group">
      <div class="relative h-48 overflow-hidden bg-slate-900/50">${imageMarkup(launch.image?.image_url, launch.name)}<span class="absolute top-3 right-3 px-3 py-1 bg-slate-700/90 text-white rounded-full text-xs font-semibold">${value(launchStatus(launch))}</span></div>
      <div class="p-5">
        <h4 class="font-bold text-lg mb-2 line-clamp-2">${value(launch.name)}</h4>
        <p class="text-sm text-slate-400 mb-3"><i class="fas fa-building mr-2"></i>${value(launchProvider(launch))}</p>
        <div class="space-y-2 text-sm text-slate-300">
          <p><i class="fas fa-calendar text-slate-500 w-4 mr-2"></i>${value(time.date)}</p>
          <p><i class="fas fa-clock text-slate-500 w-4 mr-2"></i>${value(time.time)}</p>
          <p><i class="fas fa-rocket text-slate-500 w-4 mr-2"></i>${value(launch.rocket?.configuration?.name)}</p>
          <p class="line-clamp-1"><i class="fas fa-map-marker-alt text-slate-500 w-4 mr-2"></i>${value(launch.pad?.location?.name)}</p>
        </div>
      </div>
    </article>`;
  }).join("");
}

export function renderPlanetDetails(planet, container) {
  if (!planet) {
    container.textContent = "Planet details are unavailable.";
    return;
  }

  const mass = planet.mass ? `${value(planet.mass.massValue)} x 10^${value(planet.mass.massExponent)} kg` : "N/A";
  const gravity = planet.gravity == null ? "N/A" : `${value(planet.gravity)} m/s2`;
  const details = [
    ["Semimajor Axis", `${number(planet.semimajorAxis / 1000000, 1)}M km`],
    ["Mean Radius", `${number(planet.meanRadius, 0)} km`],
    ["Mass", mass],
    ["Density", `${number(planet.density)} g/cm3`],
    ["Orbital Period", `${number(planet.sideralOrbit)} days`],
    ["Rotation Period", `${number(planet.sideralRotation)} hours`],
    ["Moons", planet.moons?.length ?? 0],
    ["Gravity", gravity],
  ];

  const cards = details.map(([label, item]) => `<div class="bg-slate-900/50 rounded-lg p-4"><p class="text-xs text-slate-400 mb-1">${label}</p><p class="text-sm md:text-lg font-semibold">${value(item)}</p></div>`).join("");
  const orbital = [
    ["Perihelion", `${number(planet.perihelion / 1000000, 1)}M km`],
    ["Aphelion", `${number(planet.aphelion / 1000000, 1)}M km`],
    ["Eccentricity", number(planet.eccentricity, 4)],
    ["Inclination", planet.inclination ?? "N/A"],
    ["Axial Tilt", `${number(planet.axialTilt)}°`],
    ["Avg Temperature", `${value(planet.avgTemp)}°C`],
    ["Escape Velocity", `${number(planet.escape / 1000)} km/s`],
  ].map(([label, item]) => `<div class="flex justify-between items-center py-2 border-b border-slate-700"><span class="text-slate-400">${label}</span><span class="font-semibold">${value(item)}</span></div>`).join("");

  container.innerHTML = `<div class="xl:col-span-2 bg-slate-800/50 border border-slate-700 rounded-xl p-4 md:p-8">
    <div class="flex flex-col xl:flex-row gap-6"><div class="relative h-48 w-48 shrink-0 mx-auto xl:mx-0">${imageMarkup(planet.image, planet.englishName, "w-full h-full object-contain")}</div>
    <div><h3 class="text-2xl md:text-3xl font-space font-bold mb-4">${value(planet.englishName)}</h3><p class="text-slate-300 leading-relaxed">${value(planet.description)}</p></div></div>
    <div class="grid grid-cols-2 gap-2 md:gap-4 mt-6">${cards}</div></div>
    <div class="space-y-6"><div class="bg-slate-800/50 border border-slate-700 rounded-2xl p-6"><h4 class="font-semibold mb-4">Discovery Info</h4><div class="space-y-3 text-sm"><p class="flex justify-between gap-4"><span class="text-slate-400">Discovered By</span><strong>${value(planet.discoveredBy, "Known since antiquity")}</strong></p><p class="flex justify-between gap-4"><span class="text-slate-400">Discovery Date</span><strong>${value(planet.discoveryDate, "Ancient times")}</strong></p><p class="flex justify-between gap-4"><span class="text-slate-400">Body Type</span><strong>${value(planet.bodyType)}</strong></p><p class="flex justify-between gap-4"><span class="text-slate-400">Volume</span><strong>${planet.vol ? `${value(planet.vol.volValue)} x 10^${value(planet.vol.volExponent)} km3` : "N/A"}</strong></p></div></div>
    <div class="bg-slate-800/50 border border-slate-700 rounded-2xl p-6"><h4 class="font-semibold mb-4">Orbital Characteristics</h4><div class="space-y-2 text-sm">${orbital}</div></div></div>`;
}

export function renderPlanetComparison(planets, table) {
  const earth = planets.find((planet) => planet.id === "terre");
  const earthMass = earth?.mass ? earth.mass.massValue * 10 ** earth.mass.massExponent : 0;
  const colors = { uranus: "#06b6d4", neptune: "#2563eb", jupiter: "#fb923c", mars: "#ef4444", mercure: "#94a3b8", saturne: "#facc15", terre: "#3b82f6", venus: "#f97316" };

  table.innerHTML = planets.filter((planet) => colors[planet.id]).map((planet) => {
    const mass = planet.mass ? planet.mass.massValue * 10 ** planet.mass.massExponent : 0;
    const ratio = earthMass && mass ? (mass / earthMass).toFixed(3) : "N/A";
    const period = typeof planet.sideralOrbit === "number" ? planet.sideralOrbit >= 365 ? `${(planet.sideralOrbit / 365.25).toFixed(1)} years` : `${Math.round(planet.sideralOrbit)} days` : "N/A";
    return `<tr class="hover:bg-slate-800/30"><td class="px-4 md:px-6 py-3 md:py-4 sticky left-0 bg-slate-800 z-10"><div class="flex items-center space-x-3"><span class="w-6 h-6 rounded-full" style="background-color:${colors[planet.id]}"></span><strong>${value(planet.englishName)}</strong></div></td><td class="px-4 py-3">${number(planet.semimajorAxis / 149597870)}</td><td class="px-4 py-3">${typeof planet.meanRadius === "number" ? value(Math.round(planet.meanRadius * 2).toLocaleString("en-US")) : "N/A"}</td><td class="px-4 py-3">${value(ratio)}</td><td class="px-4 py-3">${value(period)}</td><td class="px-4 py-3">${value(planet.moons?.length ?? 0)}</td><td class="px-4 py-3">${value(planet.type || planet.bodyType)}</td></tr>`;
  }).join("");
}
