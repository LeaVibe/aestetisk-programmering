# code.py - CPX + SGP30 gas sensor
# Rename this file to code.py on CIRCUITPY
# Hardware I2C on SCL/SDA pins
import board
import time
import sys
import supervisor
import busio
import analogio
import neopixel
import digitalio
import adafruit_thermistor
import adafruit_sgp30

# pixels
px = neopixel.NeoPixel(board.NEOPIXEL, 10, brightness=0.2, auto_write=False)
# onboard sensors
light = analogio.AnalogIn(board.LIGHT)
therm = adafruit_thermistor.Thermistor(board.TEMPERATURE, 10000, 10000, 25, 3950)
# check if anything is connected on SDA before attempting I2C
sda_pin = digitalio.DigitalInOut(board.SDA)
sda_pin.direction = digitalio.Direction.INPUT
sda_pin.pull = digitalio.Pull.DOWN
time.sleep(0.05)
sgp_present = sda_pin.value
sda_pin.deinit()
# SGP30 (auto-detect)
sgp = None
if sgp_present:
    try:
        i2c = busio.I2C(board.SCL, board.SDA)
        sgp = adafruit_sgp30.Adafruit_SGP30(i2c)
        sgp.iaq_init()
        print("SGP30 found!")
    except Exception as e:
        print("SGP30 not found:", e)
        sgp = None
else:
    print("Nothing on I2C bus, skipping SGP30 init")
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
        if sgp is not None:
            try:
                eco2, tvoc = sgp.iaq_measure()
            except Exception:
                eco2 = 0; tvoc = 0
        else:
            eco2 = "null"; tvoc = "null"
            
        sys.stdout.write(
            '{"type":"sensors"'
            ',"light":'  + str(light.value >> 8) +
            ',"temp":'   + str(round(therm.temperature, 1)) +
            ',"eco2":'   + str(eco2) +
            ',"tvoc":'   + str(tvoc) + '}\n'
        )