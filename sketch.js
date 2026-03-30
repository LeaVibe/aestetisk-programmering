let sensorBoard;
let latestData = null;

function setup() {
  createCanvas(600, 400);
  textFont("sans-serif");
  textSize(16);

  sensorBoard = new CPXSerial();

  const btn = document.getElementById("connect-btn");
  const status = document.getElementById("cpx-status");

  sensorBoard.onConnect = function () {
    if (status) status.textContent = "connected ✓";
    if (btn) btn.textContent = "Disconnect";
  };

  sensorBoard.onDisconnect = function () {
    if (status) status.textContent = "not connected";
    if (btn) btn.textContent = "Connect CPX";
  };

  sensorBoard.onError = function (e) {
    if (status) status.textContent = "error: " + e.message;
    console.error(e);
  };

  sensorBoard.onSensors = function (data) {
    latestData = data;

    // Optional HTML output fields
    setField("val-light", data.light);
    setField("val-temp", data.temp + " °C");
    setField("val-moisture", data.moisture);
    setField("val-soil-temp", data.soil_temp + " °C");

    // air quality sensor needs a little time to start up. You will not see values for the first ~30 seconds after connecting, but they should appear after that.
    setField("val-tvoc", data.tvoc + " ppb");
    setField("val-eco2", data.eco2 + " ppm");

    
    
  };

  if (btn) {
    btn.addEventListener("click", function () {
      if (!sensorBoard.connected) {
        sensorBoard.connect().catch(function (e) {
          if (status) status.textContent = "error: " + e.message;
        });
      } else {
        sensorBoard.disconnect().catch(function (e) {
          if (status) status.textContent = "error: " + e.message;
        });
      }
    });
  }
}

function draw() {
  background(240);

  if (!latestData) {
    fill(0);
    text("Waiting for sensor data...", 20, 30);
    return;
  }

  // Read values
  let lightVal = latestData.light;
  let airTemp = latestData.temp;
  let moisture = latestData.moisture;
  let soilTemp = latestData.soil_temp;
  let tvoc = latestData.tvoc;
  let eco2 = latestData.eco2;



  // Map values to visuals
  let bgBrightness = map(lightVal, 0, 255, 30, 255);
  let mainSize = map(moisture, 200, 1500, 40, 220);
  let mainY = map(soilTemp, 0, 35, height - 80, 100);
  let circleColor = map(airTemp, 0, 35, 100, 255);

  // Background responds to light
  background(bgBrightness, bgBrightness, 255);

  // Big circle responds to moisture + soil temp + air temp
  noStroke();
  fill(circleColor, 120, 180, 180);
  circle(width / 2, mainY, mainSize);

  // Smaller side circles respond to same values in simple ways
  fill(100, 180, 255, 140);
  circle(width / 2 - 120, height / 2, mainSize * 0.5);

  fill(120, 255, 180, 140);
  circle(width / 2 + 120, height / 2, map(lightVal, 0, 3000, 20, 120));
 /*
  // Labels
  fill(0);
  text("Temperature: " + airTemp + " °C", 20, 30);
  text("Soil moisture: " + moisture, 20, 55);
  text("Soil Temp: " + soilTemp + " °C", 20, 105);
  text("Light: " + lightVal, 20, 30);
  */
}

function setField(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}