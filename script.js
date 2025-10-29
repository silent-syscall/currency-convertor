const apiUrl = "https://open.er-api.com/v6/latest/";
const fromInput = document.querySelector(".from .search-input");
const toInput = document.querySelector(".to .search-input");
const fromDropdown = document.querySelector(".from .dropdown");
const toDropdown = document.querySelector(".to .dropdown");
const amountInput = document.querySelector(".amount input");
const resultText = document.querySelector(".result");
const convertBtn = document.getElementById("convert");
const swapBtn = document.getElementById("swap");
const favBtn = document.getElementById("favBtn");
const favList = document.getElementById("favList");

let fromCurrency = "USD";
let toCurrency = "INR";

/* 🏗️ Build Dropdown List */
function buildDropdown(dropdown, input, isFrom) {
  dropdown.innerHTML = "";
  for (let [code, info] of Object.entries(country_list)) {
    const li = document.createElement("li");
    li.innerHTML = `
      <img src="https://flagsapi.com/${info.code}/flat/24.png">
      <span><b>${code}</b> — ${info.country} (${info.name})</span>
    `;
    li.addEventListener("click", () => {
      input.value = code;
      dropdown.style.display = "none";
      if (isFrom) fromCurrency = code;
      else toCurrency = code;
    });
    dropdown.appendChild(li);
  }
}

/* 🧩 Initialize both dropdowns */
buildDropdown(fromDropdown, fromInput, true);
buildDropdown(toDropdown, toInput, false);

/* 🔍 Setup search behavior */
function setupSearch(input, dropdown, isFrom) {
  input.addEventListener("focus", () => {
    dropdown.style.display = "block";
  });

  input.addEventListener("input", () => {
    const val = input.value.toLowerCase();
    dropdown.style.display = "block";
    const lis = dropdown.querySelectorAll("li");
    lis.forEach(li => {
      li.style.display = li.innerText.toLowerCase().includes(val)
        ? "flex"
        : "none";
    });
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target) && e.target !== input)
      dropdown.style.display = "none";
  });
}

setupSearch(fromInput, fromDropdown, true);
setupSearch(toInput, toDropdown, false);

/* 🔁 Swap Button */
swapBtn.addEventListener("click", () => {
  [fromCurrency, toCurrency] = [toCurrency, fromCurrency];
  fromInput.value = fromCurrency;
  toInput.value = toCurrency;
  getExchangeRate();
});

/* 💱 Fetch Exchange Rate */
async function getExchangeRate() {
  const amountVal = parseFloat(amountInput.value) || 1;
  resultText.innerText = "Fetching latest rate...";
  try {
    const response = await fetch(`${apiUrl}${fromCurrency}`);
    const data = await response.json();
    if (data.result !== "success") throw new Error("API error");
    const rate = data.rates[toCurrency];
    const total = (amountVal * rate).toFixed(2);
    resultText.innerHTML = `
      💱 ${amountVal} ${fromCurrency} = <b>${total} ${toCurrency}</b><br>
      <small>(1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency})</small>
    `;
  } catch (err) {
    console.error("Error fetching rate:", err);
    resultText.innerText = "⚠️ Failed to fetch rate.";
  }
}

/* 🎯 Convert Button */
convertBtn.addEventListener("click", (e) => {
  e.preventDefault();
  getExchangeRate();
});

/* 🚀 Initialize */
window.addEventListener("load", () => {
  fromInput.value = fromCurrency;
  toInput.value = toCurrency;
  loadFavorites();
  getExchangeRate();
});

/* ⭐ Favorites System */
function saveFavorite() {
  const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
  const pair = `${fromCurrency}-${toCurrency}`;
  if (!favs.includes(pair)) favs.push(pair);
  localStorage.setItem("favorites", JSON.stringify(favs));
  loadFavorites();
}

function removeFavorite(pair) {
  const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
  const updated = favs.filter(f => f !== pair);
  localStorage.setItem("favorites", JSON.stringify(updated));
  loadFavorites();
}

function loadFavorites() {
  const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
  favList.innerHTML = "";
  favs.forEach(pair => {
    const [from, to] = pair.split("-");
    const li = document.createElement("li");
    li.innerHTML = `
      ${from} → ${to}
      <div>
        <button onclick="applyFavorite('${from}','${to}')">Use</button>
        <button onclick="removeFavorite('${pair}')">✖</button>
      </div>`;
    favList.appendChild(li);
  });
}

function applyFavorite(from, to) {
  fromCurrency = from;
  toCurrency = to;
  fromInput.value = from;
  toInput.value = to;
  getExchangeRate();
}

favBtn.addEventListener("click", saveFavorite);
