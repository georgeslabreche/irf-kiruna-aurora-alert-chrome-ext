const K_INDEX_URL = 'http://www2.irf.se/maggraphs/preliminary_real_time_k_index_15_minutes';
const MAG_URL = 'http://www2.irf.se/maggraphs/rt_iaga_last_hour.txt';

const POLL_INTERVALL = 9 * 1000 ; // 1.5 minute in milliseconds

const THRESHOLD_X = 10500; // TODO: This is for North. What about South?
const THRESHOLD_Y = 100; // TODO: Is this for East or West? Need to find out.
const THRESHOLD_Z = 52000;

const THRESHOLD_K_INDEX = 5;

const HISTORICAL_DATA_THRESHOLD = 20 // In minutes. To calculate linear regression.

const K_INDEX_COLOR_GRADIENTS = [
    [23, 9, 149, 255],  // 0
    [31, 35, 134, 255], // 1
    [39, 61, 120, 255], // 2
    [48, 87, 106, 255], // 3
    [56, 113, 91, 255], // 4
    [65, 140, 77, 255], // 5
    [73, 166, 63, 255], // 6
    [82, 192, 48, 255], // 7
    [90, 218, 34, 255], // 8
    [99, 245, 20, 255]  // 9
]

function pollIRF() {
    fetchAndProcessMagReadings();
    window.setTimeout(pollIRF, POLL_INTERVALL);
}

function fetchAndProcessMagReadings(){
    fetch(MAG_URL)
        .then(function(response) {
            response.text().then(function (text) {
                // Init arrays that will store magnetogram readings for KIRX, KIRY, KIRZ, and KIRF.
                var kirkXArray = new Array();
                var kirkYArray = new Array();
                var kirkZArray = new Array();
                var kirkFArray = new Array();

                var lines = text.split('\n');

                for(var i = 0; i < lines.length; i++){
                    var line = lines[i];

                    // Only process lines of actuall magnetogram data.
                    regex = /[0-9]{4}-[0-9]{2}-[0-9]{2} .*/;
                    if(line.match(regex)){

                        // From:
                        //  line 
                        //      => "2018-03-15 23:54:00.000 074     10255.56     89.61  51997.56  52999.64"
                        // To:
                        //  line 
                        //      => "2018-03-15 23:54:00.000 074 10255.56 89.61 51997.56 52999.64" 
                        line = line
                            .replace(/     /g, ' ')
                            .replace(/    /g, ' ')
                            .replace(/   /g, ' ')
                            .replace(/  /g, ' ');

                        // Get magnetogram readings for KIRX, KIRY, KIRZ, and KIRF.
                        splitLine = line.split(' ');

                        var kirkX = parseFloat(splitLine[3]);
                        if(kirkX != 99999){
                            kirkXArray.push(kirkX); 
                        }

                        var kirkY = parseFloat(splitLine[4]);
                        if(kirkY != 99999){
                           kirkYArray.push(kirkY); 
                        }

                        var kirkZ = parseFloat(splitLine[5]);
                        if(kirkZ != 99999){
                            kirkZArray.push(kirkZ);
                        }

                        var kirkF = parseFloat(splitLine[6]);
                        if(kirkF != 99999){
                            kirkFArray.push(kirkF);
                        }
                    }
                }

                // TODO: Notify only for the latest magnetogram reading?

                // We can only displa 1 number in the badge.
                // We choose the Z index value indicating measurements above.
                var lrSlope = analyzeTrend(kirkZArray);

                // update badge with slope value from linear regression.
                updateBadge(lrSlope);

                // Notify user whether to look outside or not.
                notify(kirkZArray, kirkYArray, kirkXArray); 
 
            });
        });
}

// Analyze trend of magnetogram values and notify if event was likely missed.
function analyzeTrend(kirkArray){
    // Get the slope of the linear regression for the past x minutes (as defined by HISTORICAL_DATA_THRESHOLD).
    var timeKirkPairs = new Array();
    var kirkArrayXMinutes = kirkArray.slice(HISTORICAL_DATA_THRESHOLD);

    // Build the x,y pair for the lineary regression function parameter.
    for(var timetick = 0; timetick < kirkArrayXMinutes.length; timetick++){
        timeKirkPairs.push([timetick, kirkArrayXMinutes[timetick]]);
    }

    // Linear regression.
    var lr = ss.linearRegression(timeKirkPairs);
    var lrSlope = lr['m'];

    return lrSlope;
}

function updateBadge(lrSlope){
    fetch(K_INDEX_URL)
        .then(function(response) {
            response.text().then(function (text) {
                // Determine badge color based on Kp Index
                chrome.browserAction.setBadgeBackgroundColor({color: K_INDEX_COLOR_GRADIENTS[parseInt(text)]});

                // Display linear regression slope value as badge text.
                chrome.browserAction.setBadgeText({text: lrSlope.toString().substring(0, 4)});
            });
        });  
}

function notify(kirkZArray, kirkYArray, kirkXArray){
    fetch(K_INDEX_URL)
        .then(function(response) {
            response.text().then(function (text) {

                var kIndex = parseInt(text);

                if(kIndex >= THRESHOLD_K_INDEX){
                    // A high KIRKZ value is usually best so we check for this first.
                    // Check if the latest KIRKZ reading is over a certain threshold
                    if(kirkZArray[kirkZArray.length - 1] >= THRESHOLD_Z){
                        var highZComponentNotification = {
                            type: "basic",
                            title: "Look up above you!",
                            message: "Over " + THRESHOLD_Z + " nT was measured.",
                            iconUrl: "icons/icon-128.png"
                        };

                        chrome.notifications.create("", highZComponentNotification);
                    }

                    // A high KIRKY value is second best so we check for this only after checking for high KIRKZ. 
                    else if(kirkYArray[kirkYArray.length - 1] >= THRESHOLD_Y){
                        var highYComponentNotification = {
                            type: "basic",
                            title: "Look to the East-West!",
                            message: "Over " + THRESHOLD_Y + " nT was recently measured.",
                            iconUrl: "icons/icon-128.png"
                        };

                        chrome.notifications.create("", highYComponentNotification);
                    }

                    // A high KIRKX value is second best as well so we check for this only after checking for high KIRKZ and KIRKY. 
                    else if(kirkXArray[kirkXArray.length - 1] >= THRESHOLD_X){
                        var highXComponentNotification = {
                            type: "basic",
                            title: "Look to the North-South!", // Is actually North right now
                            message: "Over " + THRESHOLD_X + " nT was recently measured.",
                            iconUrl: "icons/icon-128.png"
                        };

                        chrome.notifications.create("", highXComponentNotification);
                    }
                }
            });
        });
}


pollIRF();
