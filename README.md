# aestetisk programmering
Open `index.html` in your web browser and start editing `sketch.js`.


## Running Locally
```bash
python -m http.server 8000

# stop server from terminal 
ctrl + C



```
## Using Circuit playground express with Circuit python 

Firmware should be added for this execise in advance. Remember to use Chrome or Edge when using serial connection.  

If not added to cpx: : 
- download .uf2 file and transfer to CPLAYBOOT drive from https://circuitpython.org/board/circuitplayground_express/
- the drive should now be named CIRCUITPY
- save firmware code from the firmware folder. You must rename the file to code.py 
- add code.py to CIRCUITPY(D:) drive
- remember to import required library, run: 

```bash
pip install circup 

# for each cpx 
circup install adafruit_seesaw adafruit_thermistor adafruit_sgp30

```

## Resources
- [p5.js 2.0](https://beta.p5js.org/)
- [p5.js Reference](https://p5js.org/reference/)