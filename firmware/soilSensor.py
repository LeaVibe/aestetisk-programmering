# code.py - CPX + STEMMA Soil Sensor
# Sends light, onboard temp, soil moisture, soil temp
# Hardware I2C on SCL/SDA pins

import board
import time
import sys
import supervisor
import busio
import analogio
import neopixel
import adafruit_thermistor
import adafruit_seesaw.seesaw

# pixels
px = neopixel.NeoPixel(board.NEOPIXEL, 10, brightness=0.2, auto_write=False)

# sensors
light = analogio.AnalogIn(board.LIGHT)
therm = adafruit_thermistor.Thermistor(board.TEMPERATURE, 10000, 10000, 25, 3950)

# soil sensor
i2c  = busio.I2C(board.SCL, board.SDA)
soil = adafruit_seesaw.seesaw.Seesaw(i2c, addr=0x36)

# boot flash
px.fill((0, 20, 0)); px.show()
time.sleep(0.2)
px.fill((0, 0, 0)); px.show()

buf = ""
t = time.monotonic()

def handle(line):
    if "pixels_off" in line:
        px.fill((0, 0, 0)); px.show()

while True:
    if supervisor.runtime.serial_bytes_available:
        buf += sys.stdin.read(supervisor.runtime.serial_bytes_available)
        while "\n" in buf:
            line, buf = buf.split("\n", 1)
            line = line.strip()
            if line:
                handle(line)

    now = time.monotonic()
    if now - t >= 0.2:
        t = now
        try:
            m  = soil.moisture_read()
            st = round(soil.get_temp(), 1)
        except Exception:
            m = 0; st = 0.0
        sys.stdout.write(
            '{"type":"sensors"'
            ',"light":'     + str(light.value >> 8) +
            ',"temp":'      + str(round(therm.temperature, 1)) +
            ',"moisture":'  + str(m) +
            ',"soil_temp":' + str(st) + '}\n'
        )
