const scriptURL = "https://script.google.com/macros/s/AKfycbxLOgRPQrvO8ISK_GLiSLmILlWJBcOZsyet9VXKieOOqByJ6AP25fDK9dmEj2osphye/exec";

const form = document.getElementById("bookingForm");

form.addEventListener("submit", e => {

e.preventDefault();

let formData = new FormData(form);
let data = Object.fromEntries(formData.entries());

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

}

})

.catch(error => {

document.getElementById("message").innerText =
"Error submitting booking.";

});

});
