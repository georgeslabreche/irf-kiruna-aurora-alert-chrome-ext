# Kiruna Aurora Alert Chrome Extension 

## What is this?
This Chrome extension notifies users when IRF Kiruna's magnetogram readings indicate that nice auroras have recently appeared.

## How does it work?
It calculates the linear regression of the magnetogram readings taken during in the past 30 minutes. The resulting slope value is indicated in the extension's icon badge.

## How do I interpret the slope value?
If the slope value is positive then the magnetogram readings have been trending upwards in the last 30 minutes. The badge background color corresponds to the K index. Furthemore, a notification is given when readings pass the threshold of 52000 nT for the Z component, 100 nT for the Y component, and 10500 for the Y component. These are pretty large thresholds as this Chrome Extension is designed to notify the user of significant aurora events that recently occured rather than minor ones. The threshold values were chosen based on empirical observations.

## What are X, Y, Z components?
A magnetic field consists of three components, namely X, Y, and Z. These components describe a point in a three-dimensional space where the X-axis is in the geographic north-south direction, the Y-axis in the geographical west-eastern direction and the Z-axis in up -then direction perpendicular to the X and Y axis If you assume the origin of this coordinate system, the vector describes from the origin to a point (X, Y, Z) the direction as well as the strength on the magnetic field ([source](http://www2.irf.se/maggraphs/mag3d/)).

## Where does the data come from?
IRF Kiruna's magnetogram data is polled every minute from here:
http://www2.irf.se/maggraphs/rt_iaga_last_hour.txt

K index for the pats 15 minutes is available here:
http://www2.irf.se/maggraphs/preliminary_real_time_k_index_15_minutes

Follow the geomagnetic development in real time:
http://www2.irf.se/Observatory/?link[Magnetometers]=Data

Check out this experimental 3D magnetogram:
http://www2.irf.se/maggraphs/mag3d/

More data in IRF's website:
http://www2.irf.se/Data/?chosen=data

