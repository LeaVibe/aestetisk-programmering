# code.py - CPX + STEMMA Soil Sensor
# Rename this file to code.py on CIRCUITPY
# Hardware I2C on SCL/SDA pins
# Libraries needed: adafruit_seesaw, adafruit_thermistor

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

# onboard sensors
light = analogio.AnalogIn(board.LIGHT)
therm = adafruit_thermistor.Thermistor(board.TEMPERATURE, 10000, 10000, 25, 3950)

# soil sensor
soil = None
try:
    i2c  = busio.I2C(board.SCL, board.SDA)
    soil = adafruit_seesaw.seesaw.Seesaw(i2c, addr=0x36)
except Exception as e:
    print("Soil sensor not found:", e)

    
# boot flash
px.fill((0, 20, 0)); px.show()
time.sleep(0.2)
px.fill((0, 0, 0)); px.show()

t = time.monotonic()

def handle(line):
    if "pixels_off" in line:
        px.fill((0, 0, 0)); px.show()
    elif "pixels" in line:
        try:
            start = line.index("[[")
            chunk = line[start+1:]
            i = 0
            while i < 10:
                s = chunk.index("[")
                e = chunk.index("]")
                rgb = chunk[s+1:e].split(",")
                px[i] = (int(rgb[0]), int(rgb[1]), int(rgb[2]))
                chunk = chunk[e+1:]
                i += 1
            px.show()
        except Exception:
            pass

while True:
    if supervisor.runtime.serial_bytes_available:
        line = sys.stdin.readline().strip()
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
