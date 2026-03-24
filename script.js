const scriptURL = "https://script.google.com/macros/s/AKfycbxLOgRPQrvO8ISK_GLiSLmILlWJBcOZsyet9VXKieOOqByJ6AP25fDK9dmEj2osphye/exec";

const form = document.getElementById("bookingForm");
const service = document.getElementById("service");
const vehicle = document.getElementById("vehicle");
const addonsBox = document.getElementById("addons");
const addons = document.querySelectorAll(".addon");
const priceBox = document.getElementById("priceBox");
const timeSlots = document.getElementById("timeSlots");
const dateInput = document.querySelector("input[name='date']");
const messageBox = document.getElementById("message");

dateInput.min = new Date().toISOString().split("T")[0];

/* =========================
   SERVICE DURATIONS (minutes)
========================= */
const durations = {
"Express Clean": 90,
"Premium Clean": 150,
"Interior Deep Clean": 180
};

const BUFFER = 30;

/* =========================
   ADD-ONS
========================= */
const addonPrices = {
"Roof Cleaning": 2000,
"Floor Cleaning": 2500,
"Odor Removal": 2000
};

/* =========================
   SHOW ADDONS ONLY FOR EXPRESS & PREMIUM
========================= */
service.addEventListener("change", () => {
if(service.value === "Express Clean" || service.value === "Premium Clean"){
addonsBox.style.display = "block";
} else {
addonsBox.style.display = "none";
addons.forEach(a => a.checked = false);
}
refreshSlots();
calculatePrice();
});

/* =========================
   PRICE
========================= */
function calculatePrice(){
let total = 0;

addons.forEach(a => {
if(a.checked){
total += addonPrices[a.value] || 0;
}
});

priceBox.innerText = "Add-ons Total: $" + total.toLocaleString();
return total;
}

/* =========================
   BUSINESS HOURS
========================= */
function getHours(date){
const day = new Date(date).getDay();

// Sunday
if(day === 0){
return {start:7, end:13};
}

// Mon-Sat
return {start:7, end:16};
}

/* =========================
   FETCH BOOKED SLOTS (SERVER)
========================= */
async function fetchBooked(date){
try{
const res = await fetch(`${scriptURL}?date=${date}`);
return await res.json();
}catch(e){
console.error(e);
return [];
}
}

/* =========================
   SLOT GENERATION (WITH SERVER BLOCKING)
========================= */
async function refreshSlots(){

timeSlots.innerHTML = `<option value="">Select Time</option>`;

if(!dateInput.value || !service.value) return;

const booked = await fetchBooked(dateInput.value);
const serviceTime = durations[service.value] || 0;

const {start, end} = getHours(dateInput.value);

for(let h = start; h <= end; h++){
for(let m = 0; m < 60; m += 30){

let startMin = h * 60 + m;
let endMin = startMin + serviceTime + BUFFER;

/* SERVER-SIDE BOOKING CONFLICT CHECK */
let conflict = booked.some(b => {

let [bh, bm] = b.split(":").map(Number);
let bStart = bh * 60 + bm;

/* assume server already includes buffer logic */
let bEnd = bStart + 180 + BUFFER;

return !(endMin <= bStart || startMin >= bEnd);
});

if(conflict) continue;

let displayHour = h % 12 || 12;
let ampm = h >= 12 ? "PM" : "AM";

let value = `${h}:${m===0?"00":m}`;
let text = `${displayHour}:${m===0?"00":m} ${ampm}`;

let option = document.createElement("option");
option.value = value;
option.text = text;

timeSlots.appendChild(option);
}
}
}

/* =========================
   EVENTS
========================= */
dateInput.addEventListener("change", refreshSlots);
service.addEventListener("change", refreshSlots);

/* =========================
   FORM SUBMIT (SERVER FINAL CHECK)
========================= */
form.addEventListener("submit", async (e) => {
e.preventDefault();

const btn = form.querySelector("button");
btn.disabled = true;

let data = Object.fromEntries(new FormData(form).entries());
data.price = calculatePrice();

try{

const res = await fetch(scriptURL, {
method: "POST",
body: JSON.stringify(data),
headers: {
"Content-Type": "text/plain"
}
});

const result = await res.json();

/* REAL-TIME SLOT LOCKING RESPONSE */
if(result.status === "taken"){
messageBox.innerText = "⚠️ Slot just got booked. Please choose another.";
await refreshSlots();
btn.disabled = false;
return;
}

messageBox.innerText = "✅ Booking confirmed!";
form.reset();
addonsBox.style.display = "none";
timeSlots.innerHTML = `<option value="">Select Time</option>`;
priceBox.innerText = "Add-ons Total: $0";

}catch(err){
console.error(err);
messageBox.innerText = "❌ Error submitting booking.";
}

btn.disabled = false;
});
