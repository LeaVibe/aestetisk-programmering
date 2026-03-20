// let CO2_LIMIT = 1000; // ppm  //used for example below 
let sensorBoard; // global variable to hold CPXSerial instance

function setup() {
  noCanvas();

  // Create CPXSerial instance and set up event handlers. 
  sensorBoard = new CPXSerial();
  var btn    = document.getElementById("connect-btn");
  var status = document.getElementById("cpx-status");

  sensorBoard.onConnect = function() {
    status.textContent = "connected ✓";
    btn.textContent = "Disconnect";
  };

  sensorBoard.onDisconnect = function() {
    status.textContent = "not connected";
    btn.textContent = "Connect CPX";
  };

  sensorBoard.onError = function(e) {
    status.textContent = "error: " + e.message;
  };

  // Example onSensors handler — replace with your own code!
  sensorBoard.onSensors = function(data) {
    document.getElementById("val-moisture").value  = data.moisture;
    document.getElementById("val-soil-temp").value = data.soil_temp + " °C";
    document.getElementById("val-light").value     = data.light;
    document.getElementById("val-temp").value      = data.temp + " °C";
    document.getElementById("val-tvoc").value      = data.tvoc + " ppb";
    document.getElementById("val-eco2").value      = data.eco2 + " ppm";
    // insert example code here!
  };

  // Set up button to connect/disconnect when clicked
  btn.addEventListener("click", function() {
    if (!sensorBoard.connected) {
      sensorBoard.connect()
        .then(function() {
          console.log("connect resolved");
        })
        .catch(function(e) {
          status.textContent = "error: " + e.message;
        });
    } else {
      sensorBoard.disconnect()
        .then(function() {
          console.log("disconnect resolved");
        })
        .catch(function(e) {
          status.textContent = "error: " + e.message;
        });
    }
  });
}

function draw() {
  // nothing to draw
}

// ═══════════════════════════════════════════════════════════════════
// EXAMPLES — paste content of function into the sensorBoard.onSensors above
// ═══════════════════════════════════════════════════════════════════

// ── EXAMPLE 1: Air quality pixels (SGP30) ──────────────────────────
// Maps CO2 level to pixel colour: green = good, red = high CO2
//
// sensorBoard.onSensors = function(data) {
//     var r = Math.round(map(data.eco2, 400, 2000, 0, 255));
//     var g = Math.round(map(data.eco2, 400, 2000, 255, 0));
//     sensorBoard.setPixels(Array(10).fill([r, g, 0]));
// };

// ── EXAMPLE 2: Threshold alert ─────────────────────────────────────
// Pixels flash red when CO2 exceeds limit, off when under
// Change CO2_LIMIT to whatever value makes sense
//
// var CO2_LIMIT = 1000; // ppm, OBS insert in global scope
//
// sensorBoard.onSensors = function(data) {
//     if (data.eco2 > CO2_LIMIT) {
//         sensorBoard.setPixels(Array(10).fill([255, 0, 0]));
//     } else {
//         sensorBoard.pixelsOff();
//     }
// };

// ── EXAMPLE 3: Soil moisture pixels ───────────────────────────────
// Maps moisture to pixel colour: red = dry, blue = wet
//
// sensorBoard.onSensors = function(data) {
//     var r = Math.round(map(data.moisture, 200, 1500, 255, 0));
//     var b = Math.round(map(data.moisture, 200, 1500, 0, 255));
//     sensorBoard.setPixels(Array(10).fill([r, 0, b]));
// };