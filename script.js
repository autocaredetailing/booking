const scriptURL = "https://script.google.com/macros/s/AKfycbxLOgRPQrvO8ISK_GLiSLmILlWJBcOZsyet9VXKieOOqByJ6AP25fDK9dmEj2osphye/exec";

const form = document.getElementById("bookingForm");
const service = document.getElementById("service");
const vehicle = document.getElementById("vehicle");
const addonsBox = document.getElementById("addons");
const addons = document.querySelectorAll(".addon");
const priceBox = document.getElementById("priceBox");
const timeSlots = document.getElementById("timeSlots");
const dateInput = document.getElementById("dateInput");
const messageBox = document.getElementById("message");

dateInput.min = new Date().toISOString().split("T")[0];

/* ========================
   SERVICE DURATIONS (MINUTES)
======================== */
const durations = {
"Express Clean": 90,
"Premium Clean": 150,
"Interior Deep Clean": 180
};

/* BUFFER TIME */
const BUFFER = 30;

/* ========================
   WORKING HOURS
======================== */
function getHours(date){
const day = new Date(date).getDay();

if(day === 0){
return {start:7, end:13}; // Sunday
}

return {start:7, end:16}; // Mon–Sat
}

/* ========================
   ADDONS ONLY FOR EXPRESS & PREMIUM
======================== */
service.addEventListener("change", ()=>{
if(service.value === "Express Clean" || service.value === "Premium Clean"){
addonsBox.style.display = "block";
}else{
addonsBox.style.display = "none";
addons.forEach(a => a.checked = false);
}
generateTimes();
calculatePrice();
});

/* ========================
   PRICE LOGIC (simple placeholder)
======================== */
function calculatePrice(){
priceBox.innerText = "Total Price Calculating...";
}

/* ========================
   LOAD BOOKINGS (REAL BLOCKING)
======================== */
async function loadBookings(){
if(!dateInput.value) return [];

const res = await fetch(scriptURL + "?date=" + dateInput.value);
return await res.json();
}

/* ========================
   GENERATE TIMES WITH BLOCKING LOGIC
======================== */
async function generateTimes(){

timeSlots.innerHTML = `<option value="">Select Time</option>`;

if(!dateInput.value || !service.value) return;

const bookings = await loadBookings();
const {start,end} = getHours(dateInput.value);

const serviceDuration = durations[service.value] || 0;

for(let h = start; h <= end; h++){
for(let m = 0; m < 60; m += 30){

let startMinutes = h*60 + m;
let endMinutes = startMinutes + serviceDuration + BUFFER;

/* CHECK OVERLAP */
let conflict = bookings.some(b => {
let [bh,bm] = b.split(":").map(Number);
let bookedStart = bh*60 + bm;
let bookedEnd = bookedStart + 90 + BUFFER; // assume avg blocking

return !(endMinutes <= bookedStart || startMinutes >= bookedEnd);
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

/* ========================
   EVENTS
======================== */
dateInput.addEventListener("change", generateTimes);
service.addEventListener("change", generateTimes);

/* ========================
   SUBMIT
======================== */
form.addEventListener("submit", async e=>{
e.preventDefault();

let data = Object.fromEntries(new FormData(form));

const submitBtn = form.querySelector("button");
submitBtn.disabled = true;

await fetch(scriptURL,{
method:"POST",
mode:"no-cors",
body: JSON.stringify(data)
});

messageBox.innerText = "Booking received!";
form.reset();
timeSlots.innerHTML = `<option value="">Select Time</option>`;
addonsBox.style.display = "none";

submitBtn.disabled = false;
});
