# vs_billboard_commander

Concept and Original software developed by Michael Pica (c)2016-2017

What it does:
This software is designed to run on a Raspberry Pi Model 3. When setup and connected to a Sega Versus Billboard unit (found in Sega Versus City and New Versus City cabinets as well as Blast City and Megalo 410 cabinets that are equipped with a Versus Billboard unit) it allows the user to control the Versus Billboard unit through a web interface.

The vS Billboard Commander has 2 modes
1. The "Commander" mode where the user can issue send discrete commands to the Versus Billboard unit or Run and loop pre-programmed macros.
2. The "Editor" mode where the user can develop custom macros to be called back later in the Commander mode.


Building a setup from scratch:
This software requires a Raspberry Pi 3 Debian Jessie and Apache web server installed (in order to provide a web interface). It also requires the installation of the pigpio library (in order to control the GPIO header).
The software files can be placed anywhere in appache's HD docs folder (/var/www/html/)

To run you must first start the pigpio service by running "pigpiod", then you must start the billboard commander service by running the py/server.py python script. Ideally these would be automatically started when the Pi boots.

You should then be able to navigate a web browser to the url where you placed the vS Billboard Commander.
