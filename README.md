# Kiruna Aurora Alert Chrome Extension 

## What is this?
This Chrome extension notifies users when IRF Kiruna's magnetogram readings indicate that nice auroras have likely appeared in the past hour and half.

## How is this useful? It just tells if I missed great auroras 1.5 hours ago!
It may serve as an indicator that more good auroras are currently happening or will eventually happen. Admittedly, this tool would be much more useful if more recent magnetogram data was available. 

## How does it work?
It calculates the linear regression of the magnetogram readings taken during a 30 minute period from 1.5 hours ago to 1 hour ago. The resulting slope value is indicated in the extension's icon badge.

## How do I interpret the slope value?
If the slope value is positive, and the badge backround color is green, then the magnetogram readings were trending upwards passed a certain treshold (52000 nT for the Z component and 100 nT for the Y component). These are pretty large thresholds as this Chrome Extension is designed to notify the user of significant aurora events rather than minor ones.

## What are Z and Y components?
A magnetic field consists of three components, namely X, Y, and Z. These components describe a point in a three-dimensional space where the X-axis is in the geographic north-south direction, the Y-axis in the geographical west-eastern direction and the Z-axis in up -then direction perpendicular to the X and Y axis If you assume the origin of this coordinate system, the vector describes from the origin to a point (X, Y, Z) the direction as well as the strength on the magnetic field ([source](http://www2.irf.se/maggraphs/mag3d/)).

## Where does the data come from?

IRF Kiruna's magnetogram data is polled every minute from here:
http://www2.irf.se/maggraphs/rt_iaga_last_hour.txt

Follow the geomagnetic development in real time:
http://www2.irf.se/Observatory/?link[Magnetometers]=Data

Check out this experimental 3D magnetogram:
http://www2.irf.se/maggraphs/mag3d/

More data in IRF's website:
http://www2.irf.se/Data/?chosen=data

