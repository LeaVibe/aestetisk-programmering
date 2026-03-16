let cpx;

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

  };

  btn.addEventListener("click", async () => {
    if (!cpx.connected) { await cpx.connect(); }
    else                 { await cpx.disconnect(); }
  });
}

function draw() {
  // nothing to draw
}


// skal tjekkes efter 
// ═══════════════════════════════════════════════════════════════════
// EXAMPLES — uncomment one block at a time and paste it into
//            the cpx.onSensors callback above to try it out
// ═══════════════════════════════════════════════════════════════════


// ── EXAMPLE 1: Air quality pixels (SGP30) ──────────────────────────
// Maps CO2 level to pixel colour: green = good, red = high CO2
//
// cpx.onSensors = (data) => {
//     let r = Math.round(map(data.eco2, 400, 2000, 0, 255));
//     let g = Math.round(map(data.eco2, 400, 2000, 255, 0));
//     cpx.setPixels(Array(10).fill([r, g, 0]));
// };


// ── EXAMPLE 2: Soil moisture pixels ───────────────────────────────
// Maps moisture to pixel colour: red = dry, blue = wet
//
// cpx.onSensors = (data) => {
//     let r = Math.round(map(data.moisture, 200, 1500, 255, 0));
//     let b = Math.round(map(data.moisture, 200, 1500, 0, 255));
//     cpx.setPixels(Array(10).fill([r, 0, b]));
// };


// ── EXAMPLE 3: Threshold alert ─────────────────────────────────────
// Pixels flash red when CO2 exceeds limit, off when under
// Change CO2_LIMIT to whatever value makes sense
//
// let CO2_LIMIT = 1000; // ppm
//
// cpx.onSensors = (data) => {
//     if (data.eco2 > CO2_LIMIT) {
//         cpx.setPixels(Array(10).fill([255, 0, 0]));
//     } else {
//         cpx.pixelsOff();
//     }
// };


// ── EXAMPLE 4: Rolling mean ────────────────────────────────────────
// Smooths noisy readings by averaging the last 20 values
// Replace data.eco2 with any sensor value you want to smooth
//
// let readings = [];
//
// cpx.onSensors = (data) => {
//     readings.push(data.eco2);
//     if (readings.length > 20) readings.shift();
//     let mean = readings.reduce((a, b) => a + b, 0) / readings.length;
//     document.getElementById("val-eco2").value = mean.toFixed(1) + " ppm";
// };


// ── EXAMPLE 5: Update display every 10 seconds ────────────────────
// Useful if you want to log slow changes over time
//
// let lastUpdate = 0;
//
// cpx.onSensors = (data) => {
//     if (millis() - lastUpdate > 10000) {
//         lastUpdate = millis();
//         document.getElementById("val-eco2").value = data.eco2 + " ppm";
//     }
// };


// ── EXAMPLE 6: Map sensor value to background colour ──────────────
// Uses p5 draw loop to change background based on CO2
// Uncomment this AND add a createCanvas() call in setup()
//
// let latestEco2 = 400;
//
// cpx.onSensors = (data) => {
//     latestEco2 = data.eco2;
// };
//
// function draw() {
//     let r = map(latestEco2, 400, 2000, 0, 255);
//     let g = map(latestEco2, 400, 2000, 255, 0);
//     background(r, g, 0);
// }