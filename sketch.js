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
  };

  btn.addEventListener("click", async () => {
    if (!cpx.connected) { await cpx.connect(); }
    else                 { await cpx.disconnect(); }
  });
}

function draw() {
  // nothing to draw
}