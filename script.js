const scriptURL = "https://script.google.com/macros/s/AKfycbxLOgRPQrvO8ISK_GLiSLmILlWJBcOZsyet9VXKieOOqByJ6AP25fDK9dmEj2osphye/exec";

const form = document.getElementById("bookingForm");
const service = document.getElementById("service");
const vehicle = document.getElementById("vehicle");
const addons = document.querySelectorAll(".addon");
const addonsBox = document.getElementById("addons");
const priceBox = document.getElementById("priceBox");
const timeSlots = document.getElementById("timeSlots");


/* PRICE STRUCTURE */

const servicePrices = {

"Basic Exterior":{
"Sedan":3000,
"SUV":3500,
"Pickup":4000
},

"Basic Interior":{
"Sedan":4000,
"SUV":4500,
"Pickup":5000
},

"Tier1":{
"Sedan":6000,
"SUV":7000,
"Pickup":8000
},

"Tier2":{
"Sedan":9000,
"SUV":10000,
"Pickup":11000
},

"Tier3":{
"Sedan":14000,
"SUV":15000,
"Pickup":16000
},

"Platinum":{
"Sedan":20000,
"SUV":22000,
"Pickup":24000
},

"Gold":{
"Sedan":16000,
"SUV":18000,
"Pickup":20000
}

};


/* AUTO PRICE CALCULATION */

function calculatePrice(){

let selectedService = service.value;
let selectedVehicle = vehicle.value;

let basePrice = servicePrices[selectedService][selectedVehicle];

let addonTotal = 0;

addons.forEach(addon=>{
if(addon.checked){
addonTotal += parseInt(addon.value);
}
});

let total = basePrice + addonTotal;

priceBox.innerHTML = "Total Price: $" + total.toLocaleString();

return total;

}


/* SHOW ADDONS ONLY FOR BASIC SERVICES */

service.addEventListener("change",()=>{

if(service.value === "Basic Exterior" || service.value === "Basic Interior"){

addonsBox.style.display="block";

}else{

addonsBox.style.display="none";

addons.forEach(a=>a.checked=false);

}

calculatePrice();

});


vehicle.addEventListener("change",calculatePrice);

addons.forEach(a=>{
a.addEventListener("change",calculatePrice);
});


/* GENERATE TIME SLOTS */

function generateTimes(){

timeSlots.innerHTML = "";

for(let i=7;i<=17;i++){

let option = document.createElement("option");

let time = i + ":00";

option.value = time;
option.text = time;

timeSlots.appendChild(option);

}

}

generateTimes();


/* FORM SUBMISSION */

form.addEventListener("submit", e => {

e.preventDefault();

let totalPrice = calculatePrice();

let formData = new FormData(form);
let data = Object.fromEntries(formData.entries());

data.price = totalPrice;


/* BUSINESS HOURS VALIDATION */

const day = new Date(data.date).getDay();
const hour = parseInt(data.time.split(":")[0]);

if(day==0 && (hour<7 || hour>13)){
alert("Sunday hours are 7AM - 1PM");
return;
}

if(day==6 && (hour<7 || hour>17)){
alert("Saturday hours are 7AM - 5PM");
return;
}

if(day>=1 && day<=5 && (hour<7 || hour>15)){
alert("Weekday hours are 7AM - 3PM");
return;
}


/* SEND BOOKING */

fetch(scriptURL,{
method:"POST",
body:JSON.stringify(data)
})
.then(res=>res.json())
.then(response=>{

if(response.result=="taken"){

document.getElementById("message").innerText =
"This time slot is already booked.";

}

else{

document.getElementById("message").innerText =
"Booking request received. We will confirm shortly.";

form.reset();

priceBox.innerHTML = "Total Price: $0";

}

})

.catch(error => {

document.getElementById("message").innerText =
"Error submitting booking.";

});

});
