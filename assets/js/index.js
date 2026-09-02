const sidebarToggleBtn = document.querySelector("#sidebar-toggle");
const apodImage = document.querySelector("#apod-image");
const apodVideo = document.querySelector("#apod-video");
const apodTitle = document.querySelector("#apod-title");
const apodDate = document.querySelector("#apod-date");
const apodExplanation = document.querySelector("#apod-explanation");
const selectedDate = document.querySelector("#apod-date-input");
const todayApodBtn = document.querySelector("#today-apod-btn");
const loadDateBtn = document.querySelector("#load-date-btn");
const apodDateDetail = document.querySelector("#apod-date-detail");
const apodDateInfo = document.querySelector("#apod-date-info");
const apodMediaType = document.querySelector("#apod-media-type");
const loader = document.querySelector("#apod-loading");
const loaderSpinner = document.querySelector("#apod-spinner");
const loaderError = document.querySelector("#apod-error");
const viewFullResolutionBtn = document.querySelector(
  "#view-full-resolution-btn",
);
const apiKey = "5kFFKpxHv3WzpbAMFnPbOLLjxAfW9mg8Q6WSabVW";
// launches section
const featuredLaunch = document.querySelector("#featured-launch");
const launchesGrid = document.querySelector("#launches-grid");
// planets section
const planetsList = Array.from(document.querySelectorAll("[data-planet-id]"));
const planetDetails = document.querySelector("#planet-details");
const planetCoparison = document.querySelector("#planet-comparison-tbody");
// sidebar toggle button
sidebarToggleBtn.addEventListener("click", (e) => {
  e.stopPropagation(); // to prevent the click event from bubbling up to the document and closing the sidebar immediately
  document.querySelector("#sidebar").classList.toggle("sidebar-open");
  document.querySelector("#overlay").classList.toggle("sidebar-overlay");
});
// to close the sidebar when the user clicks outside of it
document.addEventListener("click", (e) => {
  if (!e.target.closest("#sidebar")) {
    document.querySelector("#sidebar").classList.remove("sidebar-open");
    document.querySelector("#overlay").classList.remove("sidebar-overlay");
  }
});
// =======================to highlight the active link in the nav bar and show the corresponding section=====================================
const navLinks = Array.from(document.querySelectorAll("nav > a"));
const sections = Array.from(document.querySelectorAll("section"));
for (let i = 0; i < navLinks.length; i++) {
  navLinks[i].addEventListener("click", (e) => {
    navLinks.forEach((link) => {
      link.classList.add("text-slate-300", "hover:bg-slate-800");
      link.classList.remove("bg-blue-500/10", "text-blue-400");
    });
    document.querySelector("#sidebar").classList.remove("sidebar-open");
    document.querySelector("#overlay").classList.remove("sidebar-overlay");
    // using e.currentTarget to refer to the clicked link instead of e.target (which could be a child element)
    e.currentTarget.classList.remove("text-slate-300", "hover:bg-slate-800");
    e.currentTarget.classList.add("bg-blue-500/10", "text-blue-400");
    sections.forEach((section) => section.classList.add("hidden"));
    // value of data-section for each link = id of the corresponding section
    const targetSecID = e.currentTarget.dataset.section;
    document.getElementById(targetSecID)?.classList.remove("hidden");
  });
}

// =================================== Today in Space Section =========================================
// date of today in YYYY-MM-DD format
const today = new Date().toISOString().split("T")[0];
selectedDate.value = today;
getApod(today);
console.log(today); // initialize the visible date label next to the input

// dynamic Formated Function
function formatDate(dateString, monthFormat) {
  const dateObj = new Date(dateString);

  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: monthFormat,
    day: "numeric",
  });
}
// when the user refreshes the page, the label next to the input should show the today date in a short format
if (selectedDate && selectedDate.nextElementSibling) {
  selectedDate.nextElementSibling.textContent = formatDate(
    selectedDate.value,
    "short",
  );
} // when the user picks a new date
selectedDate.addEventListener("change", () => {
  selectedDate.nextElementSibling.textContent = formatDate(
    selectedDate.value,
    "short",
  );
}); // when the user picks a new date, update the label and reload APOD
loadDateBtn.addEventListener("click", () => {
  selectedDate.nextElementSibling.textContent = formatDate(
    selectedDate.value,
    "short",
  );
  getApod(selectedDate.value);
});
async function getApod(date) {
  try {
    // to stop the video from playing when the user loads a new date, reset the src to empty string
    apodVideo.src = "";
    viewFullResolutionBtn.classList.add("hidden");
    apodTitle.textContent = "Loading...";
    apodDate.textContent = "Astronomy Picture of the Day - Loading...";
    apodDateDetail.lastChild.textContent = "Loading...";
    apodDateInfo.textContent = "Loading...";
    apodMediaType.textContent = "Loading...";
    apodExplanation.textContent = "Loading description...";
    loader.classList.remove("hidden");
    loaderSpinner.classList.remove("hidden");
    loaderError.classList.add("hidden");
    apodImage.classList.add("hidden");
    apodVideo.classList.add("hidden");
    const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&date=${date}`;
    let response = await fetch(url);
    let data = await response.json();
    loader.classList.add("hidden");
    if (!response.ok) {
      // API returned an error payload (trigger catch to show error UI)
      throw new Error("error");
    }
    console.log(data);
    viewFullResolutionBtn.classList.remove("hidden");
    // handle image or fallback for other media types
    if (data.media_type === "image") {
      apodImage.classList.remove("hidden");
      apodImage.src = data.url;
      apodVideo.nextElementSibling.classList.remove("hidden");
    } else if (data.media_type === "video") {
      apodVideo.src = data.url;
      apodVideo.classList.remove("hidden");
      apodVideo.nextElementSibling.classList.add("hidden");
    }
    apodTitle.textContent = data.title || "";
    apodDate.textContent = `Astronomy Picture of the Day - ${formatDate(data.date, "long") || ""}`;
    apodDateDetail.lastChild.textContent = formatDate(data.date, "long") || "";
    apodDateInfo.textContent = `${formatDate(data.date, "long") || ""}`;
    // display the media type (image or video) in the UI
    apodMediaType.textContent = data.media_type || "";
    apodExplanation.textContent = data.explanation || "";
  } catch (err) {
    console.log(err);
    // replace loader content with error markup provided by user
    loaderSpinner.classList.add("hidden");
    loaderError.classList.remove("hidden");
    loader.classList.remove("hidden");
    // reset the style
    apodVideo.nextElementSibling.classList.add("hidden");
  }
} // viewFullResolution Button

viewFullResolutionBtn.addEventListener("click", () => {
  //to open the image in a new tab (BOM concept)
  window.open(apodImage.src || apodVideo.src, "_blank");
}); // todayApod Button

todayApodBtn.addEventListener("click", () => {
  selectedDate.value = today;
  selectedDate.nextElementSibling.textContent = formatDate(today, "short"); // edit the data
  getApod(today);
});

//===========================launches section===========================-----
let allLaunches = [];
async function getLaunches() {
  try {
    let response = await fetch(
      `https://lldev.thespacedevs.com/2.3.0/launches/upcoming/?limit=10`,
    );
    let data = await response.json();
    allLaunches = data.results;
    if (!response.ok) {
      throw new Error("error");
    }
    console.log(allLaunches);
    displayLaunches();
  } catch (error) {
    console.log(error);
  }
}
getLaunches();
function displayLaunches() {
  const firstLaunch = allLaunches[0];
  const otherLaunches = allLaunches.slice(1);

  displayFeaturedLaunch(firstLaunch);
  displayOtherLaunches(otherLaunches);
}

function displayFeaturedLaunch(firstLaunch) {
  // the first one
  const rocketName = firstLaunch.rocket?.configuration?.name || "N/A";
  const imageUrl = firstLaunch.image?.image_url;
  // convert date from string to Date object to format it nicely
  const dateObj = new Date(firstLaunch.net);
  // formatting the date and the time
  const launchDate = dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    // the way of writting the day ==> mon, monday
    weekday: "long",
  });
  const launchTime =
    dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      hour12: true,
      minute: "2-digit",
      timeZone: "UTC",
    }) + " UTC";
  const launchLocation = firstLaunch.pad?.location?.name;
  const launchCountry = firstLaunch.pad?.location?.country?.name;
  const launchDescription = firstLaunch.mission?.description;
  featuredLaunch.innerHTML = `
    <div
              class="relative bg-slate-800/30 border border-slate-700 rounded-3xl overflow-hidden group hover:border-blue-500/50 transition-all">
              <div
                class="absolute inset-0 bg-linear-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div class="relative grid grid-cols-1 lg:grid-cols-2 gap-6 p-8">
                <div class="flex flex-col justify-between">
                  <div>

                    <div class="flex items-center gap-3 mb-4">
                      <span
                        class="px-4 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold flex items-center gap-2">
                        <i class="fas fa-star"></i>
                        Featured Launch
                      </span>
                      <span
                        class="px-4 py-1.5 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold">
                        Go
                      </span>
                    </div>
                    <h3 class="text-3xl font-bold mb-3 leading-tight">
                      ${firstLaunch.name}
                    </h3>
                    <div
                      class="flex flex-col xl:flex-row xl:items-center gap-4 mb-6 text-slate-400">
                      <div class="flex items-center gap-2">
                        <i class="fas fa-building"></i>
                        <span>SpaceX</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <i class="fas fa-rocket"></i>
                        <span>${rocketName}</span>
                      </div>
                    </div>
                   
                    <div class="grid xl:grid-cols-2 gap-4 mb-6">
                      <div class="bg-slate-900/50 rounded-xl p-4">
                        <p
                          class="text-xs text-slate-400 mb-1 flex items-center gap-2">
                          <i class="fas fa-calendar"></i>
                          Launch Date
                        </p>
                        <p class="font-semibold">${launchDate}</p>
                      </div>
                      <div class="bg-slate-900/50 rounded-xl p-4">
                        <p
                          class="text-xs text-slate-400 mb-1 flex items-center gap-2">
                          <i class="fas fa-clock"></i>
                          Launch Time
                        </p>
                        <p class="font-semibold">${launchTime}</p>
                      </div>
                      <div class="bg-slate-900/50 rounded-xl p-4">
                        <p
                          class="text-xs text-slate-400 mb-1 flex items-center gap-2">
                          <i class="fas fa-map-marker-alt"></i>
                          Location
                        </p>
                        <p class="font-semibold text-sm">${launchLocation}</p>
                      </div>
                      <div class="bg-slate-900/50 rounded-xl p-4">
                        <p
                          class="text-xs text-slate-400 mb-1 flex items-center gap-2">
                          <i class="fas fa-globe"></i>
                          Country
                        </p>
                        <p class="font-semibold">${launchCountry}</p>
                      </div>
                    </div>
                    <p class="text-slate-300 leading-relaxed mb-6">
                      ${launchDescription}
                    </p>
                  </div>
                  <div class="flex flex-col md:flex-row gap-3">
                    <button
                      class="flex-1 self-start md:self-center px-6 py-3 bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors font-semibold flex items-center justify-center gap-2">
                      <i class="fas fa-info-circle"></i>
                      View Full Details
                    </button>
                    <div class="icons self-end md:self-center">
                      <button
                        class="px-4 py-3 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors">
                        <i class="far fa-heart"></i>
                      </button>
                      <button
                        class="px-4 py-3 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors">
                        <i class="fas fa-bell"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <div class="relative">
                  <div
                    class="relative h-full min-h-[400px] rounded-2xl overflow-hidden bg-slate-900/50">
                    <!-- Placeholder image/icon since we can't load external images reliably without correct URLs -->
                    <div
                      class="flex items-center justify-center h-full min-h-[400px] bg-slate-800">
                      <i class="fas fa-rocket text-9xl text-slate-700/50"></i>
                    </div>
                    <div
                      class="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-transparent">
                      <img src="${imageUrl}" alt="${firstLaunch.name}" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='/assets/images/launch-placeholder.png';">
                      </div>
                  </div>
                </div>
              </div>
            </div>
  `;
}

function displayOtherLaunches(otherLaunches) {
  // the other 9
  let otherLaunchesHTML = "";
  otherLaunches.forEach((launch) => {
    const otherRocketName = launch.rocket?.configuration?.name || "N/A";
    // convert date from string to Date object to format it nicely
    const otherDateObj = new Date(launch.net);
    // formatting the date and the time
    const otherLaunchDate = otherDateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const otherLaunchTime =
      otherDateObj.toLocaleTimeString("en-US", {
        hour: "2-digit",
        hour12: true,
        minute: "2-digit",
        timeZone: "UTC",
      }) + " UTC";
    const otherLaunchLocation = launch.pad?.location?.name;
    const othterImage = launch.image?.image_url;
    // console.log(othterImage);
    // we should use let not const here because we will reassign the value of imageHTML based on the condition
    let imageHTML = "";
    // the The (othterImage) of the Sixth card is undifined (falsy value) so we make this condition to check if the image is available or not and display a placeholder image if not available
    if (othterImage) {
      imageHTML = `<div
                      class="relative h-48 overflow-hidden bg-slate-900/50">
                      <img src="${othterImage}" alt="${launch.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onerror="this.onerror=null; this.src='/assets/images/launch-placeholder.png';">
                      <div class="absolute top-3 right-3">
                         <span
                           class="px-3 py-1 bg-green-500/90 text-white backdrop-blur-sm rounded-full text-xs font-semibold">
                           Go
                         </span>
                      </div>
                    </div>
`;
    } else {
      imageHTML = `
      <div
         class="relative h-48 bg-slate-900/50 flex items-center justify-center">
          <i class="text-5xl text-slate-700" data-fa-i2svg=""><svg class="svg-inline--fa fa-rocket" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="rocket" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" data-fa-i2svg=""><path fill="currentColor" d="M156.6 384.9L125.7 354c-8.5-8.5-11.5-20.8-7.7-32.2c3-8.9 7-20.5 11.8-33.8L24 288c-8.6 0-16.6-4.6-20.9-12.1s-4.2-16.7 .2-24.1l52.5-88.5c13-21.9 36.5-35.3 61.9-35.3l82.3 0c2.4-4 4.8-7.7 7.2-11.3C289.1-4.1 411.1-8.1 483.9 5.3c11.6 2.1 20.6 11.2 22.8 22.8c13.4 72.9 9.3 194.8-111.4 276.7c-3.5 2.4-7.3 4.8-11.3 7.2v82.3c0 25.4-13.4 49-35.3 61.9l-88.5 52.5c-7.4 4.4-16.6 4.5-24.1 .2s-12.1-12.2-12.1-20.9V380.8c-14.1 4.9-26.4 8.9-35.7 11.9c-11.2 3.6-23.4 .5-31.8-7.8zM384 168a40 40 0 1 0 0-80 40 40 0 1 0 0 80z"></path></svg></i>
           <div class="absolute top-3 right-3">
              <span
                class="px-3 py-1 bg-blue-500/90 text-white backdrop-blur-sm rounded-full text-xs font-semibold">
                TBD
              </span>
           </div>
      </div>
      `;
    }

    otherLaunchesHTML += `
    <!-- STATIC LAUNCH CARD -->
            <div
              class="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all group cursor-pointer">
              ${imageHTML}
              <div class="p-5">
                <div class="mb-3">
                  <h4
                    class="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                    ${launch.name}
                  </h4>
                  <p class="text-sm text-slate-400 flex items-center gap-2">
                    <i class="fas fa-building text-xs"></i>
                    SpaceX
                  </p>
                </div>
                <div class="space-y-2 mb-4">
                  <div class="flex items-center gap-2 text-sm">
                    <i class="fas fa-calendar text-slate-500 w-4"></i>
                    <span class="text-slate-300">${otherLaunchDate}</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm">
                    <i class="fas fa-clock text-slate-500 w-4"></i>
                    <span class="text-slate-300">${otherLaunchTime}</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm">
                    <i class="fas fa-rocket text-slate-500 w-4"></i>
                    <span class="text-slate-300">${otherRocketName}</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm">
                    <i class="fas fa-map-marker-alt text-slate-500 w-4"></i>
                    <span class="text-slate-300 line-clamp-1">${otherLaunchLocation}</span>
                  </div>
                </div>
                <div
                  class="flex items-center gap-2 pt-4 border-t border-slate-700">
                  <button
                    class="flex-1 px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors text-sm font-semibold">
                    Details
                  </button>
                  <button
                    class="px-3 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                    <i class="far fa-heart"></i>
                  </button>
                </div>
              </div>
            </div>
    `;
  });

  launchesGrid.innerHTML = otherLaunchesHTML;
}

//===========================planets section===========================-----

let allPlanets = [];
async function getPlanets() {
  try {
    let response = await fetch(
      `https://solar-system-opendata-proxy.vercel.app/api/planets`,
    );
    const data = await response.json();
    allPlanets = data.bodies;
    console.log(allPlanets);
    if (!response.ok) {
      throw new Error("error");
    }
    displayPlanets();
  } catch (x) {
    console.log(x);
  } finally {
    console.log("doooneee");
  }
}
getPlanets();
function displayPlanets() {
  planetsList.forEach((planet) => {
    planet.addEventListener("click", () => {
      const planetId = planet.dataset.planetId;
      // find ===> return the first element that satisfies the condition
      const selectedPlanet = allPlanets.find((planet) => {
        return planet.id === planetId;
      });
      PlanetDetails(selectedPlanet);
    });
  });
  PlanetsComparison();
}

function PlanetDetails(selectedPlanet) {
  const planetImage = selectedPlanet.image;
  const planetName = selectedPlanet.englishName;
  const planetDescription = selectedPlanet.description;
  const planetSemimajorAxis =
    (selectedPlanet.semimajorAxis / 1000000).toFixed(1) + "M km";
  const planetReduis = Math.round(selectedPlanet.meanRadius) + " km";
  const planetMass =
    selectedPlanet.mass.massValue +
    " × 10^" +
    selectedPlanet.mass.massExponent +
    " kg";
  const planetDensity = selectedPlanet.density.toFixed(2) + "g/cm³";
  // ============ new fields ============
  const planetOrbitalPeriod = selectedPlanet.sideralOrbit.toFixed(2) + " days";
  const planetRotation = selectedPlanet.sideralRotation.toFixed(2) + " hours";
  const planetMoons = selectedPlanet.moons?.length || 0;
  const planetGravity = selectedPlanet.gravity + " m/s²";
  const planetDiscoverer =
    selectedPlanet.discoveredBy || "Known since antiquity";
  const planetDiscoveryDate = selectedPlanet.discoveryDate || "Ancient times";
  const planetBodyType = selectedPlanet.bodyType;
  const planetVolume =
    selectedPlanet.vol.volValue +
    " × 10^" +
    selectedPlanet.vol.volExponent +
    " km³";
  const planetAxialTilt = selectedPlanet.axialTilt.toFixed(2) + "°";
  const planetPerihelion =
    (selectedPlanet.perihelion / 1000000).toFixed(1) + "M km";
  const planetAphelion =
    (selectedPlanet.aphelion / 1000000).toFixed(1) + "M km";
  const planetEccentricity = selectedPlanet.eccentricity.toFixed(4);
  const planetInclination = selectedPlanet.inclination || "N/A";
  const planetAvgTemp = selectedPlanet.avgTemp + "°C";
  const planetEscape = (selectedPlanet.escape / 1000).toFixed(2) + " km/s";
  // =====================================
  planetDetails.innerHTML = `
        <div
              class="xl:col-span-2 bg-slate-800/50 border border-slate-700 rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8">
              <div
                class="flex flex-col xl:flex-row xl:items-start space-y-4 xl:space-y-0">
                <div
                  class="relative h-48 w-48 md:h-64 md:w-64 shrink-0 mx-auto xl:mr-6">
                  <img
                    id="planet-detail-image"
                    class="w-full h-full object-contain"
                    src="${planetImage}"
                    alt="earth planet detailed realistic render with clouds and continents" />
                </div>
                <div class="flex-1">
                  <div class="flex items-center justify-between mb-3 md:mb-4">
                    <h3
                      id="planet-detail-name"
                      class="text-2xl md:text-3xl font-space font-bold">
                      ${planetName}
                    </h3>
                    <button
                      class="w-10 h-10 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                      <i class="far fa-heart"></i>
                    </button>
                  </div>
                  <p
                    id="planet-detail-description"
                    class="text-slate-300 mb-4 md:mb-6 leading-relaxed text-sm md:text-base">
                    ${planetDescription}
                  </p>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-2 md:gap-4 mt-4">
                <div class="bg-slate-900/50 rounded-lg p-3 md:p-4">
                  <p
                    class="text-xs text-slate-400 mb-1 flex items-center gap-1">
                    <i class="fas fa-ruler text-xs"></i>
                    <span class="text-xs">Semimajor Axis</span>
                  </p>
                  <p
                    id="planet-distance"
                    class="text-sm md:text-lg font-semibold">
                    ${planetSemimajorAxis}
                  </p>
                </div>
                <div class="bg-slate-900/50 rounded-lg p-4">
                  <p
                    class="text-xs text-slate-400 mb-1 flex items-center gap-1">
                    <i class="fas fa-circle"></i>
                    Mean Radius
                  </p>
                  <p id="planet-radius" class="text-lg font-semibold">
                    ${planetReduis}
                  </p>
                </div>
                <div class="bg-slate-900/50 rounded-lg p-4">
                  <p
                    class="text-xs text-slate-400 mb-1 flex items-center gap-1">
                    <i class="fas fa-weight"></i>
                    Mass
                  </p>
                  <p id="planet-mass" class="text-lg font-semibold">
                   ${planetMass}
                  </p>
                </div>
                <div class="bg-slate-900/50 rounded-lg p-4">
                  <p
                    class="text-xs text-slate-400 mb-1 flex items-center gap-1">
                    <i class="fas fa-compress"></i>
                    Density
                  </p>
                  <p id="planet-density" class="text-lg font-semibold">
                   ${planetDensity}
                  </p>
                </div>
                <div class="bg-slate-900/50 rounded-lg p-4">
                  <p
                    class="text-xs text-slate-400 mb-1 flex items-center gap-1">
                    <i class="fas fa-sync-alt"></i>
                    Orbital Period
                  </p>
                  <p id="planet-orbital-period" class="text-lg font-semibold">
                    ${planetOrbitalPeriod}
                  </p>
                </div>
                <div class="bg-slate-900/50 rounded-lg p-4">
                  <p
                    class="text-xs text-slate-400 mb-1 flex items-center gap-1">
                    <i class="fas fa-redo"></i>
                    Rotation Period
                  </p>
                  <p id="planet-rotation" class="text-lg font-semibold">
                    ${planetRotation}
                  </p>
                </div>
                <div class="bg-slate-900/50 rounded-lg p-4">
                  <p
                    class="text-xs text-slate-400 mb-1 flex items-center gap-1">
                    <i class="fas fa-moon"></i>
                    Moons
                  </p>
                  <p id="planet-moons" class="text-lg font-semibold">${planetMoons}</p>
                </div>
                <div class="bg-slate-900/50 rounded-lg p-4">
                  <p
                    class="text-xs text-slate-400 mb-1 flex items-center gap-1">
                    <i class="fas fa-arrows-alt-v"></i>
                    Gravity
                  </p>
                  <p id="planet-gravity" class="text-lg font-semibold">
                    ${planetGravity}
                  </p>
                </div>
              </div>
            </div>
            <div class="space-y-6">
              <div
                class="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                <h4 class="font-semibold mb-4 flex items-center">
                  <i class="fas fa-user-astronaut text-purple-400 mr-2"></i>
                  Discovery Info
                </h4>
                <div class="space-y-3 text-sm">
                  <div
                    class="flex justify-between items-center py-2 border-b border-slate-700">
                    <span class="text-slate-400">Discovered By</span>
                    <span
                      id="planet-discoverer"
                      class="font-semibold text-right"
                      >${planetDiscoverer}</span
                    >
                  </div>
                  <div
                    class="flex justify-between items-center py-2 border-b border-slate-700">
                    <span class="text-slate-400">Discovery Date</span>
                    <span id="planet-discovery-date" class="font-semibold"
                      >${planetDiscoveryDate}</span
                    >
                  </div>
                  <div
                    class="flex justify-between items-center py-2 border-b border-slate-700">
                    <span class="text-slate-400">Body Type</span>
                    <span id="planet-body-type" class="font-semibold"
                      >${planetBodyType}</span
                    >
                  </div>
                  <div class="flex justify-between items-center py-2">
                    <span class="text-slate-400">Volume</span>
                    <span id="planet-volume" class="font-semibold">${planetVolume}</span>
                  </div>
                </div>
              </div>
              <div
                class="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                <h4 class="font-semibold mb-4 flex items-center">
                  <i class="fas fa-lightbulb text-yellow-400 mr-2"></i>
                  Quick Facts
                </h4>
                <ul id="planet-facts" class="space-y-3 text-sm">
                  <li class="flex items-start">
                    <i class="fas fa-check text-green-400 mt-1 mr-2"></i>
                    <span class="text-slate-300"
                      >Mass: ${planetMass}</span
                    >
                  </li>
                  <li class="flex items-start">
                    <i class="fas fa-check text-green-400 mt-1 mr-2"></i>
                    <span class="text-slate-300"
                      >Surface gravity: ${planetGravity}</span
                    >
                  </li>
                  <li class="flex items-start">
                    <i class="fas fa-check text-green-400 mt-1 mr-2"></i>
                    <span class="text-slate-300"
                      >Density: ${selectedPlanet.density} g/cm³</span
                    >
                  </li>
                  <li class="flex items-start">
                    <i class="fas fa-check text-green-400 mt-1 mr-2"></i>
                    <span class="text-slate-300"
                      >Axial tilt: ${planetAxialTilt}</span
                    >
                  </li>
                </ul>
              </div>
              <div
                class="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                <h4 class="font-semibold mb-4 flex items-center">
                  <i class="fas fa-satellite text-blue-400 mr-2"></i>
                  Orbital Characteristics
                </h4>
                <div class="space-y-3 text-sm">
                  <div
                    class="flex justify-between items-center py-2 border-b border-slate-700">
                    <span class="text-slate-400">Perihelion</span>
                    <span id="planet-perihelion" class="font-semibold"
                      >${planetPerihelion}</span
                    >
                  </div>
                  <div
                    class="flex justify-between items-center py-2 border-b border-slate-700">
                    <span class="text-slate-400">Aphelion</span>
                    <span id="planet-aphelion" class="font-semibold"
                      >${planetAphelion}</span
                    >
                  </div>
                  <div
                    class="flex justify-between items-center py-2 border-b border-slate-700">
                    <span class="text-slate-400">Eccentricity</span>
                    <span id="planet-eccentricity" class="font-semibold"
                      >${planetEccentricity}</span
                    >
                  </div>
                  <div
                    class="flex justify-between items-center py-2 border-b border-slate-700">
                    <span class="text-slate-400">Inclination</span>
                    <span id="planet-inclination" class="font-semibold"
                     >${planetInclination}</span
                    >
                  </div>
                  <div
                    class="flex justify-between items-center py-2 border-b border-slate-700">
                    <span class="text-slate-400">Axial Tilt</span>
                    <span id="planet-axial-tilt" class="font-semibold"
                      >${planetAxialTilt}</span
                    >
                  </div>
                  <div
                    class="flex justify-between items-center py-2 border-b border-slate-700">
                    <span class="text-slate-400">Avg Temperature</span>
                    <span id="planet-temp" class="font-semibold">${planetAvgTemp}</span>
                  </div>
                  <div class="flex justify-between items-center py-2">
                    <span class="text-slate-400">Escape Velocity</span>
                    <span id="planet-escape" class="font-semibold"
                      >${planetEscape}</span
                    >
                  </div>
                </div>
              </div>
              <button
                class="w-full py-3 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors font-semibold">
                <i class="fas fa-book mr-2"></i>Learn More
              </button>
            </div>
  `;
}

function PlanetsComparison() {
  // 1 AU in km, used to convert semimajorAxis into AU
  const AU_IN_KM = 149597870;

  // Earth's actual mass, used as the base to calculate "Mass (Earth = 1)" for every planet
  const earthPlanet = allPlanets.find((planet) => planet.id === "terre");
  const earthMassValue =
    earthPlanet.mass.massValue * Math.pow(10, earthPlanet.mass.massExponent);

  const planetsDisplayInfo = [
    {
      id: "uranus",
      color: "#06b6d4",
      badgeClass: "bg-cyan-500/50 text-cyan-200",
    },
    {
      id: "neptune",
      color: "#2563eb",
      badgeClass: "bg-blue-500/50 text-blue-200",
    },
    {
      id: "jupiter",
      color: "#fb923c",
      badgeClass: "bg-purple-500/50 text-purple-200",
    },
    { id: "mars", color: "#ef4444", badgeClass: "bg-red-500/50 text-red-200" },
    {
      id: "mercure",
      color: "#94a3b8",
      badgeClass: "bg-orange-500/50 text-orange-200",
    },
    {
      id: "saturne",
      color: "#facc15",
      badgeClass: "bg-yellow-500/50 text-yellow-200",
    },
    {
      id: "terre",
      color: "#3b82f6",
      badgeClass: "bg-blue-500/50 text-blue-200",
    },
    {
      id: "venus",
      color: "#f97316",
      badgeClass: "bg-orange-500/50 text-orange-200",
    },
  ];

  let planetComparisonHTML = "";

  planetsDisplayInfo.forEach((info) => {
    const planet = allPlanets.find((p) => p.id === info.id);
    // safety check: if the id doesn't match anything in the API, skip this row instead of crashing
    if (!planet) {
      console.log("planet not found for id:", info.id);
      // to start over from the beginning and doesn't complete the loop
      return;
    }

    const planetDistanceAU = (planet.semimajorAxis / AU_IN_KM).toFixed(2);
    const planetDiameter = Math.round(planet.meanRadius * 2).toLocaleString(
      "en-US",
    );
    const planetMassValue =
      planet.mass.massValue * Math.pow(10, planet.mass.massExponent);
    const planetMassRatio = (planetMassValue / earthMassValue).toFixed(3);
    const planetMoonsCount = planet.moons?.length || 0;
    const planetType = planet.type || "N/A";

    // convert sideralOrbit (days) to a friendly display: days if under a year, years otherwise
    let planetOrbitalPeriod;
    if (planet.sideralOrbit >= 365) {
      planetOrbitalPeriod =
        (planet.sideralOrbit / 365.25).toFixed(1) + " years";
    } else {
      planetOrbitalPeriod = Math.round(planet.sideralOrbit) + " days";
    }

    planetComparisonHTML += `
      <tr class="hover:bg-slate-800/30 transition-colors">
        <td class="px-4 md:px-6 py-3 md:py-4 sticky left-0 bg-slate-800 z-10">
          <div class="flex items-center space-x-2 md:space-x-3">
            <div
              class="w-6 h-6 md:w-8 md:h-8 rounded-full flex-shrink-0"
              style="background-color: ${info.color}"></div>
            <span class="font-semibold text-sm md:text-base whitespace-nowrap"
              >${planet.englishName}</span
            >
          </div>
        </td>
        <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap">
          ${planetDistanceAU}
        </td>
        <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap">
          ${planetDiameter}
        </td>
        <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap">
          ${planetMassRatio}
        </td>
        <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap">
          ${planetOrbitalPeriod}
        </td>
        <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap">
          ${planetMoonsCount}
        </td>
        <td class="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
          <span class="px-2 py-1 rounded text-xs ${info.badgeClass}"
            >${planetType}</span
          >
        </td>
      </tr>
    `;
  });

  planetCoparison.innerHTML = planetComparisonHTML;
}
