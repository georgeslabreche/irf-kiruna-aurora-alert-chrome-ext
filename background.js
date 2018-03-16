var pollInterval = 60 * 1000 ; // 1 minute in milliseconds

function pollIRF() {
    const url = 'http://www2.irf.se/maggraphs/rt_iaga_last_hour.txt';

    fetch(url)
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

                // A high KIRKZ value is usually best so we check for this first.
                // We only care if in the past hour and a half we reached at least the 52000 nT values for KIRKZ.
                if(ss.max(kirkZArray) >= 52000){
                    analyzeTrend(kirkZArray);
                }

                // A high KIRKY value is usually secong best so we check for this only after checking for high KIRKZ. 
                // We only care if in the past hour and a half we reached at least the 100 nT values for KIRKY.
                else if(ss.max(kirkYArray) >= 100){
                    analyzeTrend(kirkYArray);
                }
  
            });
        })

    window.setTimeout(pollIRF, pollInterval);
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

    // If linear regression trend for KIRKZ value is that it is increasing,
    // set badge to green indicating chances of aurora sighting.
    if(lrSlope >= 1){
        chrome.browserAction.setBadgeBackgroundColor({color: [50, 205, 50, 255]});
    }else{
        // If it is decrease, badge is grey.
        chrome.browserAction.setBadgeBackgroundColor({color: [211, 211, 211, 255]});
    }

    // Display linear regression slope value as badge text.
    chrome.browserAction.setBadgeText({text: lrSlope.toString().substring(0, 4).replace('.0','')});
}


pollIRF();
