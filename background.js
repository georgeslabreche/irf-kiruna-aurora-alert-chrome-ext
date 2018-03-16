var pollInterval = 5 * 1000 ; // 5 seconds in milliseconds

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

                var linearRegressionValues = findLineByLeastSquares(kirkZArray);
            });
        })

    window.setTimeout(pollIRF, pollInterval);
}

function findLineByLeastSquares(values_y) {
    var values_y = [51943.89,
    51949.06,
    51948.17,
    51949.28,
    51941.37,
    51924.26,
    51921.37,
    51908.61,
    51903.03,
    51890.91,
    51873.72,
    51861.25,
    51850.58,
    51852.01,
    51849.44,
    51847.57,
    51847.76,
    51844.96,
    51839.04,
    51834.29,
    51827.36,
    51828.07,
    51827.09,
    51827.86,
    51825.01,
    51823.99,
    51821.64,
    51820.17,
    51816.4,
    51814.02,
    51811.46,
    51810.28,
    51812.31,
    51812.37,
    51814.01,
    51814.94,
    51818.28,
    51820.22,
    51822.56,
    51825.05,
    51824.61,
    51826.97,
    51829.15,
    51830.95,
    51833.15,
    51837.74,
    51840.76,
    51842.17,
    51843.78,
    51848.17,
    51850.1,
    51853.82,
    51856.39,
    51853.87,
    51856.08,
    51859.54,
    51860.86,
    51862.34,
    51865.19,
    51869.94,
    51874.04]

    // Create the time tick array.
    values_x = new Array();
    for(var timetick = 0; timetick < values_y.length; timetick++){
        values_x.push(timetick);
    }

    var sum_x = 0;
    var sum_y = 0;
    var sum_xy = 0;
    var sum_xx = 0;
    var count = 0;

    /*
     * We'll use those variables for faster read/write access.
     */
    var x = 0;
    var y = 0;
    var values_length = values_x.length;

    if (values_length != values_y.length) {
        throw new Error('The parameters values_x and values_y need to have same size!');
    }

    /*
     * Nothing to do.
     */
    if (values_length === 0) {
        return [ [], [] ];
    }

    /*
     * Calculate the sum for each of the parts necessary.
     */
    for (var v = 0; v < values_length; v++) {
        x = values_x[v];
        y = values_y[v];
        sum_x += x;
        sum_y += y;
        sum_xx += x*x;
        sum_xy += x*y;
        count++;
    }

    /*
     * Calculate m and b for the formular:
     * y = x * m + b
     */
    var m = (count*sum_xy - sum_x*sum_y) / (count*sum_xx - sum_x*sum_x);
    var b = (sum_y/count) - (m*sum_x)/count;

    /*
     * We will make the x and y result line now
     */
    var result_values_x = [];
    var result_values_y = [];

    for (var v = 0; v < values_length; v++) {
        x = values_x[v];
        y = x * m + b;
        result_values_x.push(x);
        result_values_y.push(y);
    }

    return [result_values_x, result_values_y];
}


pollIRF();
