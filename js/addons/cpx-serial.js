/**
 * cpx-serial.js
 * Thin Web Serial API wrapper for the Circuit Playground Express.
 */

class CPXSerial {
  constructor() {
    this.port      = null;
    this.reader    = null;
    this.writer    = null;
    this._rxBuf    = "";
    this._running  = false;

    this.onSensors    = null;
    this.onReady      = null;
    this.onConnect    = null;
    this.onDisconnect = null;
    this.onError      = null;
    this.onRaw        = null;

    console.log("[CPX] CPXSerial instance created");
  }

  get connected() {
    return !!(this.port && this.port.readable);
  }

  async connect(options = {}) {
    console.log("[CPX] connect() called");

    if (!("serial" in navigator)) {
      const err = new Error("Web Serial API not supported. Use Chrome or Edge over localhost/https.");
      console.error("[CPX]", err.message);
      throw err;
    }

    console.log("[CPX] Web Serial API available ✓");

    const filters = options.filters || [{ usbVendorId: 0x239a }];
    console.log("[CPX] Requesting port with filters:", filters);

    try {
      this.port = await navigator.serial.requestPort({ filters });
      console.log("[CPX] Port selected:", this.port);
    } catch (err) {
      console.error("[CPX] Port selection failed (user cancelled or no port?):", err.message);
      this._emit("error", err);
      throw err;
    }

    try {
      const baud = options.baudRate || 115200;
      console.log("[CPX] Opening port at", baud, "baud...");
      await this.port.open({ baudRate: baud });
      console.log("[CPX] Port opened ✓");
    } catch (err) {
      console.error("[CPX] Failed to open port:", err.message);
      this._emit("error", err);
      throw err;
    }

    this._running = true;
    this._readLoop();
    this._emit("connect");
    return this;
  }

  async disconnect() {
    console.log("[CPX] disconnect() called");
    this._running = false;
    try {
      if (this.reader) { await this.reader.cancel(); this.reader = null; }
      if (this.writer) { await this.writer.close();  this.writer = null; }
      if (this.port)   { await this.port.close();    this.port   = null; }
      console.log("[CPX] Port closed ✓");
    } catch (err) {
      console.warn("[CPX] Error during disconnect:", err.message);
    }
    this._emit("disconnect");
  }

  setPixels(colours) {
    this._send({ type: "pixels", colors: colours });
  }

  setPixel(index, colour) {
    this._send({ type: "pixel", index, color: colour });
  }

  pixelsOff() {
    this._send({ type: "pixels_off" });
  }

  playTone(freq, duration = 200) {
    this._send({ type: "tone", freq, duration });
  }

  ping() {
    this._send({ type: "ping" });
  }

  async _send(obj) {
    if (!this.port || !this.port.writable) {
      console.warn("[CPX] _send() called but port not writable");
      return;
    }
    try {
      const writer = this.port.writable.getWriter();
      const line   = JSON.stringify(obj) + "\n";
      console.log("[CPX] sending:", line.trim());
      await writer.write(new TextEncoder().encode(line));
      writer.releaseLock();
    } catch (err) {
      console.error("[CPX] _send() error:", err.message);
      this._emit("error", err);
    }
  }

  async _readLoop() {
    console.log("[CPX] _readLoop() started");
    let lineCount = 0;

    const decoder = new TextDecoderStream();
    this.port.readable.pipeTo(decoder.writable);
    const reader = decoder.readable.getReader();
    this.reader  = reader;

    try {
      while (this._running) {
        const { value, done } = await reader.read();
        if (done) {
          console.log("[CPX] reader done");
          break;
        }
        this._rxBuf += value;

        let nl;
        while ((nl = this._rxBuf.indexOf("\n")) !== -1) {
          const line = this._rxBuf.slice(0, nl).trim();
          this._rxBuf = this._rxBuf.slice(nl + 1);
          if (!line) continue;

          lineCount++;
          if (lineCount <= 5) {
            // log the first 5 lines verbosely
            console.log("[CPX] raw line:", line);
          } else if (lineCount % 50 === 0) {
            // then every 50th line so console doesn't flood
            console.log("[CPX] still receiving... line", lineCount);
          }

          this._dispatch(line);
        }
      }
    } catch (err) {
      if (this._running) {
        console.error("[CPX] _readLoop() error:", err.message);
        this._emit("error", err);
      }
    } finally {
      console.log("[CPX] _readLoop() ended. Total lines received:", lineCount);
      reader.releaseLock();
      this._emit("disconnect");
    }
  }

  _dispatch(line) {
    if (!line.startsWith("{")) return; // skip boot noise


    let obj;
    try {
      obj = JSON.parse(line);
    } catch (err) {
      console.warn("[CPX] JSON parse failed:", line, "—", err.message);
      return;
    }

    this._emit("raw", obj);

    switch (obj.type) {
      case "sensors":
        this._emit("sensors", obj);
        break;
      case "ready":
        console.log("[CPX] device ready:", obj);
        this._emit("ready");
        break;
      case "pong":
        console.log("[CPX] pong received");
        break;
      default:
        console.warn("[CPX] unknown message type:", obj.type);
    }
  }

  _emit(event, ...args) {
    const cb = {
      sensors:    this.onSensors,
      ready:      this.onReady,
      connect:    this.onConnect,
      disconnect: this.onDisconnect,
      error:      this.onError,
      raw:        this.onRaw,
    }[event];
    if (typeof cb === "function") {
      cb(...args);
    } else if (event === "error") {
      console.warn("[CPX] unhandled error event (no onError set):", ...args);
    }
  }
}
