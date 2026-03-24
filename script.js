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

/* PRICES */
const prices = {
"Express Clean": {Sedan:3500, SUV:4000, "Pickup/Van/Mini Bus":5500},
"Premium Clean": {Sedan:9500, SUV:10000, "Pickup/Van/Mini Bus":12000},
"Interior Deep Clean": {Sedan:30000, SUV:35000, "Pickup/Van/Mini Bus":40000},
"Platinum VIP Plan": {Sedan:0, SUV:0, "Pickup/Van/Mini Bus":0},
"Gold VIP Plan": {Sedan:0, SUV:0, "Pickup/Van/Mini Bus":0}
};

/* ADDONS */
const addonPrices = {
"Roof Cleaning": 2000,
"Floor Cleaning": 2500,
"Odor Removal": 2000
};

/* SHOW ADDONS */
service.addEventListener("change", () => {
if(service.value === "Express Clean" || service.value === "Premium Clean"){
addonsBox.style.display = "block";
} else {
addonsBox.style.display = "none";
addons.forEach(a => a.checked = false);
}
calculatePrice();
});

/* PRICE */
function calculatePrice(){
let base = prices[service.value]?.[vehicle.value] || 0;

let addonTotal = 0;
addons.forEach(a => {
if(a.checked){
addonTotal += addonPrices[a.value] || 0;
}
});

/* SIMPLE VIP DISCOUNT */
let discount = 0;
if(service.value === "Platinum VIP Plan") discount = 500;
if(service.value === "Gold VIP Plan") discount = 1000;

let total = base + addonTotal - discount;
if(total < 0) total = 0;

priceBox.innerText = "Total Price: $" + total.toLocaleString();
return total;
}

vehicle.addEventListener("change", calculatePrice);
addons.forEach(a => a.addEventListener("change", calculatePrice));

/* TIME SLOTS */
function generateTimes(){
timeSlots.innerHTML = '<option value="">Select Time</option>';
if(!dateInput.value) return;

for(let h=7; h<=17; h++){
for(let m=0; m<60; m+=30){

let displayHour = h % 12 || 12;
let ampm = h >= 12 ? "PM" : "AM";

let time = `${h}:${m===0?"00":m}`;

let option = document.createElement("option");
option.value = time;
option.text = `${displayHour}:${m===0?"00":m} ${ampm}`;

timeSlots.appendChild(option);
}
}
}

dateInput.addEventListener("change", generateTimes);

/* SUBMIT */
form.addEventListener("submit", e => {
e.preventDefault();

let submitBtn = form.querySelector("button");
submitBtn.disabled = true;

let data = Object.fromEntries(new FormData(form));
data.price = calculatePrice();

fetch(scriptURL, {
method:"POST",
mode:"no-cors",
body: JSON.stringify(data)
})
.then(() => {
messageBox.innerText = "Booking received!";
form.reset();
priceBox.innerText = "Total Price: $0";
submitBtn.disabled = false;
});
});
