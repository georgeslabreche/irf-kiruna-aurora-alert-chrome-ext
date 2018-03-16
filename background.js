const K_INDEX_URL = 'http://www2.irf.se/maggraphs/preliminary_real_time_k_index_15_minutes';
const MAG_URL = 'http://www2.irf.se/maggraphs/rt_iaga_last_hour.txt';

const POLL_INTERVALL = 60 * 1000 ; // 1 minute in milliseconds

const K_INDEX_COLOR_GRADIENTS = [
    [23, 9, 149, 255],  // 0
    [32, 38, 132, 255], // 1
    [42, 68, 116, 255], // 2
    [51, 97, 100, 255], // 3
    [61, 127, 84, 255], // 4
    [70, 156, 68, 255], // 5
    [80, 186, 52, 255], // 6
    [89, 215, 36, 255], // 7
    [99, 245, 20, 255]  // 8
    [99, 245, 20, 255]  // 9 // Update
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


                // We can only displa 1 number in the badge.
                // We choose the Z index value indicating measurements above.
                analyzeTrend(kirkZArray);

                // A high KIRKZ value is usually best so we check for this first.
                // We only care if in the past hour and a half we reached at least the 52000 nT values for KIRKZ.
                if(ss.max(kirkZArray) >= 52000){
                    var highZComponentNotification = {
                        type: "basic",
                        title: "Look up above you!",
                        message: "Over 52,000 nT was measured above you about an hour ago.",
                        iconUrl: "icons/icon-128.png"
                    };

                    chrome.notifications.create("success-notification", highZComponentNotification);
                }

                //TODO: How about KIRKX? Need to understand the thresholds more...

                // A high KIRKY value is usually second best so we check for this only after checking for high KIRKZ. 
                // We only care if in the past hour and a half we reached at least the 100 nT values for KIRKY.
                else if(ss.max(kirkYArray) >= 100){
                    var highYComponentNotification = {
                        type: "basic",
                        title: "Look to the East-West!",
                        message: "Over 100 nT was measured about an hour ago.",
                        iconUrl: "icons/icon-128.png"
                    };

                    chrome.notifications.create("success-notification", highYComponentNotification);
                }

  
            });
        });
}

// Analyze trend of magnetogram values and notify if event was likely missed.
function analyzeTrend(kirkArray){
    // Get the slope of the linear regression for the past half hour.
    var timeKirkPairs = new Array();
    var kirkArrayLast1HourAndAHalf = kirkArray.slice(30);

    // Build the x,y pair for the lineary regression function parameter.
    for(var timetick = 0; timetick < kirkArrayLast1HourAndAHalf.length; timetick++){
        timeKirkPairs.push([timetick, kirkArrayLast1HourAndAHalf[timetick]]);
    }

    // Linear regression.
    var lr = ss.linearRegression(timeKirkPairs);
    var lrSlope = lr['m'];

    updateBadge(lrSlope);      
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


pollIRF();
