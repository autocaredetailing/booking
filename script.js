const scriptURL = "https://script.google.com/macros/s/AKfycbxLOgRPQrvO8ISK_GLiSLmILlWJBcOZsyet9VXKieOOqByJ6AP25fDK9dmEj2osphye/exec";

const form = document.getElementById("bookingForm");

form.addEventListener("submit", e => {

e.preventDefault();

var formData = new FormData(form);

var data = Object.fromEntries(formData.entries());

fetch(scriptURL,{
method:"POST",
body:JSON.stringify(data)
})
.then(res=>res.json())
.then(response=>{

if(response.result=="taken"){

document.getElementById("message").innerText="This time is already booked.";

}

else{

document.getElementById("message").innerText="Booking request received. We will confirm shortly.";

form.reset();

}

})

});
