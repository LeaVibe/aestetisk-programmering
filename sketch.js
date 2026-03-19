let cpx;
// let CO2_LIMIT = 1000; // ppm

function setup() {
  noCanvas(); // no p5 canvas needed

  cpx = new CPXSerial();

  const btn = document.getElementById("connect-btn");
  const status = document.getElementById("cpx-status");

  cpx.onConnect    = () => { status.textContent = "connected ✓"; btn.textContent = "Disconnect"; };
  cpx.onDisconnect = () => { status.textContent = "not connected"; btn.textContent = "Connect CPX"; };
  cpx.onError      = (e) => { status.textContent = "error: " + e.message; };

  cpx.onSensors = (data) => {
    document.getElementById("val-moisture").value  = data.moisture;
    document.getElementById("val-soil-temp").value = data.soil_temp + " °C";
    document.getElementById("val-light").value     = data.light;
    document.getElementById("val-temp").value      = data.temp + " °C";
    // document.getElementById("val-sound").value     = "—"; // not in firmware
    document.getElementById("val-tvoc").value      = data.tvoc + " ppb";
    document.getElementById("val-eco2").value       = data.eco2 + " ppm";

    // insert example code here!
    
  };

 
   
  

  btn.addEventListener("click", () => {
    if (!cpx.connected) {
      cpx.connect()
        .then(() => { console.log("connect resolved"); })
        .catch((e) => { status.textContent = "error: " + e.message; });
    } else {
      cpx.disconnect()
        .then(() => { console.log("disconnect resolved"); })
        .catch((e) => { status.textContent = "error: " + e.message; });
    }
  });
}

function draw() {
  // nothing to draw
}


// ═══════════════════════════════════════════════════════════════════
// EXAMPLES — paste content of function into the cpx.onSensors above
// ═══════════════════════════════════════════════════════════════════

// ── EXAMPLE 1: Air quality pixels (SGP30) ──────────────────────────
// Maps CO2 level to pixel colour: green = good, red = high CO2
//
// cpx.onSensors = (data) => {
//     let r = Math.round(map(data.eco2, 400, 2000, 0, 255));
//     let g = Math.round(map(data.eco2, 400, 2000, 255, 0));
//     cpx.setPixels(Array(10).fill([r, g, 0]));
// };


// ── EXAMPLE 2: Threshold alert ─────────────────────────────────────
// Pixels flash red when CO2 exceeds limit, off when under
// Change CO2_LIMIT to whatever value makes sense
//
// let CO2_LIMIT = 1000; // ppm, OBS insert in global scope
//
// cpx.onSensors = (data) => {
//     if (data.eco2 > CO2_LIMIT) {
//         cpx.setPixels(Array(10).fill([255, 0, 0]));
//     } else {
//         cpx.pixelsOff();
//     }
// };

// ── EXAMPLE 3: Soil moisture pixels ───────────────────────────────
// Maps moisture to pixel colour: red = dry, blue = wet
//
// cpx.onSensors = (data) => {
//     let r = Math.round(map(data.moisture, 200, 1500, 255, 0));
//     let b = Math.round(map(data.moisture, 200, 1500, 0, 255));
//     cpx.setPixels(Array(10).fill([r, 0, b]));
// };

