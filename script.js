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

/* PREVENT PAST DATES */

let today = new Date().toISOString().split("T")[0];
dateInput.min = today;


/* PRICE LIST */

const prices = {

"Basic Exterior Services":{Sedan:3000,SUV:3500,"Pickup/Van":4000},
"Basic Interior Services":{Sedan:4000,SUV:4500,"Pickup/Van":5000},
"Express Clean Tier 1":{Sedan:6000,SUV:7000,"Pickup/Van":8000},
"Deep Clean Tier 2":{Sedan:9000,SUV:10000,"Pickup/Van":11000},
"Premium Clean Tier 3":{Sedan:14000,SUV:15000,"Pickup/Van":16000},
"Platinum VIP Plan":{Sedan:20000,SUV:22000,"Pickup/Van":24000},
"Gold VIP Plan":{Sedan:16000,SUV:18000,"Pickup/Van":20000}

};


/* SHOW ADDONS */

service.addEventListener("change", ()=>{

if(
service.value === "Basic Exterior Services" ||
service.value === "Basic Interior Services"
){
addonsBox.style.display="block";
}else{
addonsBox.style.display="none";
addons.forEach(a=>a.checked=false);
}

calculatePrice();

});


/* PRICE CALCULATOR */

function calculatePrice(){

let base = prices[service.value]?.[vehicle.value] || 0;

let addonTotal = 0;

addons.forEach(addon=>{
if(addon.checked){
addonTotal += parseInt(addon.value);
}
});

let total = base + addonTotal;

priceBox.innerText = "Total Price: $" + total.toLocaleString();

return total;

}

vehicle.addEventListener("change",calculatePrice);
addons.forEach(a=>a.addEventListener("change",calculatePrice));


/* BUSINESS HOURS */

function getBusinessHours(date){

const day = new Date(date).getDay();

let start = 7;
let end = 15;

if(day === 6){ end = 17; }
if(day === 0){ end = 13; }

return {start,end};

}


/* GENERATE TIME SLOTS */

function generateTimes(){

timeSlots.innerHTML='<option value="">Select Time</option>';

if(!dateInput.value) return;

const hours = getBusinessHours(dateInput.value);

for(let h = hours.start; h <= hours.end; h++){

for(let m = 0; m < 60; m += 30){

let hour = h;
let minute = m;

let ampm = hour >= 12 ? "PM" : "AM";
let displayHour = hour % 12;
displayHour = displayHour ? displayHour : 12;

let display =
displayHour + ":" + (minute===0?"00":minute) + " " + ampm;

let value =
hour + ":" + (minute===0?"00":minute);

let option = document.createElement("option");

option.value=value;
option.text=display;

timeSlots.appendChild(option);

}

}

}


/* HIDE PAST TIMES */

function hidePastTimes(){

const selectedDate = dateInput.value;
const today = new Date().toISOString().split("T")[0];

if(selectedDate !== today) return;

const now = new Date();

const currentMinutes =
now.getHours()*60 + now.getMinutes();

const options = timeSlots.querySelectorAll("option");

options.forEach(option=>{

if(option.value==="") return;

let parts = option.value.split(":");

let slotMinutes =
parseInt(parts[0])*60 + parseInt(parts[1]);

if(slotMinutes <= currentMinutes){
option.disabled=true;
}

});

}


/* LOAD BOOKED TIMES */

function loadBookedTimes(){

if(!dateInput.value) return;

fetch(scriptURL+"?date="+dateInput.value)

.then(res=>res.json())

.then(booked=>{

const options = timeSlots.querySelectorAll("option");

options.forEach(option=>{

if(booked.includes(option.value)){

option.disabled=true;

let parts = option.value.split(":");
let minutes =
parseInt(parts[0])*60 + parseInt(parts[1]);

let buffer1 = minutes + 30;
let buffer2 = minutes + 60;

options.forEach(o=>{

if(o.value==="") return;

let p = o.value.split(":");
let m = parseInt(p[0])*60 + parseInt(p[1]);

if(m===buffer1 || m===buffer2){
o.disabled=true;
}

});

}

});


let available=false;

options.forEach(o=>{
if(!o.disabled && o.value!==""){
available=true;
}
});

if(!available){

alert("This day is fully booked.");

dateInput.value="";
timeSlots.innerHTML='<option value="">Select Time</option>';

}

hidePastTimes();

});

}


/* DATE CHANGE */

dateInput.addEventListener("change",()=>{

generateTimes();
loadBookedTimes();
hidePastTimes();

});


/* FORM SUBMIT */

form.addEventListener("submit", e=>{

e.preventDefault();

const submitBtn = form.querySelector("button");
submitBtn.disabled = true;

let totalPrice = calculatePrice();

let formData = new FormData(form);
let data = Object.fromEntries(formData.entries());

data.price = totalPrice;

fetch(scriptURL,{
method:"POST",
body:JSON.stringify(data)
})

.then(res=>res.json())

.then(response=>{

if(response.result=="taken"){

messageBox.innerText =
"⚠️ This time slot was just booked. Please select another.";

generateTimes();
loadBookedTimes();

}else{

messageBox.innerText =
"✅ Booking request received. We will confirm shortly.";

form.reset();

priceBox.innerText="Total Price: $0";

generateTimes();
loadBookedTimes();

}

submitBtn.disabled=false;

});

});
