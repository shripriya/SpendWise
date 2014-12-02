// set filter criteria from My Group Selections
var timeline = "month";
var currentMonthSelection = 0;
var currentYearSelection = 2014;
var minDate = 20140101;
var maxDate = 20140601;
var filterValues = {};
var currentZippcode = "";
var currentCategory = "";
var currentLevel = "subcategory";
var nextGroupBy = "week";
var textOrDate = false;
//filterValues.gender = "M";
//filterValues.ageValue = "2";

function resetChart() {
    timeline = "month";
    nextGroupBy = "week";
    textOrDate = false;
}

// Authentication Value for BBVA
encodedString = btoa("app.bbva.bbva_sencha:56f2fa95dc3884be48dde823399cafdb88d37740");
authKeyValue = "Basic " + encodedString;


function createOptionsForChart(chartType, drawContainer) {
    // create options object
    var options = {
        chart: {
            renderTo: '',
            defaultSeriesType: '',
            zoomType: '',
            panning: false
        },
        title: {
            text: '',
            style: {
                fontSize: '12px',
                fontFamily: 'Verdana, sans-serif',
                fontWeight: 'bold'
            }
        },
        xAxis: {
            categories: [],
            title: {
                text: '',
                style: {
                    fontSize: '10px',
                    fontFamily: 'Verdana, sans-serif',
                    fontWeight: 'bold'
                }
            },
            labels: {
                rotation: 0,
                style: {
                    fontSize: '8px',
                    fontFamily: 'Verdana, sans-serif',
                    fontWeight: 'bold'
                }
            }
        },
        yAxis: {
            title: {
                text: '',
                style: {
                    fontSize: '10px',
                    fontFamily: 'Verdana, sans-serif',
                    fontWeight: 'bold'
                }
            },
            labels: {
                rotation: 0,
                style: {
                    fontSize: '8px',
                    fontFamily: 'Verdana, sans-serif',
                    fontWeight: 'bold'
                }
            }
        },
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        series: [],
        plotOptions: {
            series: {
                cursor: 'pointer',
                point: {
                    events: {
                        click: function (e) {
                            //console.log(this);
                        }
                    }
                },
                marker: {
                    lineWidth: 1
                }
            }
        }
    }
    // set options based on type of API Call
    if (chartType == "paymentscube") {
        options.chart.defaultSeriesType = "area";
        options.chart.zoomType = "x";
        options.chart.panning = true;
        options.title.text = "Spending Habits";
        options.xAxis.title.text = "Transaction Amount Category";
        options.yAxis.floor = 0;
        options.xAxis.tickmarkPlacement = "on";
        options.xAxis.labels.rotation = -45;
        options.yAxis.title.text = "# of Payments";
        options.plotOptions.series.point.events.click = function (e) {
            doClickEventOnChart(this, e);
        };
        options.tooltip.pointFormat = '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
        '<td style="padding:0"><b>{point.y:.1f} Payments</b></td></tr>';
    } else if (chartType == "cardscube") {
        options.chart.defaultSeriesType = "column";
        options.title.text = "Spending Habits";
        options.xAxis.title.text = "Dates";
        options.yAxis.title.text = "Average Spend (Mexican $)";
        if (timeline == "week") {
            options.xAxis.labels.rotation = -45
        }
        ;
        options.plotOptions.series.point.events.click = function (e) {
            doClickEventOnChart(this, e);
        };
        options.tooltip.pointFormat = '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
        '<td style="padding:0"><b>$ {point.y:.1f}</b></td></tr>';
    }
    options.chart.renderTo = drawContainer;

    // return options to drawChartforuser function
    return options;
}

function doClickEventOnChart(click, event) {
    if (timeline == "month") {
        console.log(timeline);
        var currentdate = click.category;
        var year = parseInt(currentdate.slice(0, 4));
        currentYearSelection = year;
        var month = parseInt(currentdate.slice(4, 6));
        currentMonthSelection = month - 1;
        var formatedMonthEnd = new Date(year, month, 0);
        var formatedMonthStart = new Date(year, month - 1, 1);
        var formatedYear = formatedMonthStart.getFullYear();
        var formatedMonth = ((formatedMonthStart.getMonth() + 1) < 10) ? "0" + (formatedMonthStart.getMonth() + 1) : (formatedMonthStart.getMonth() + 1);
        var formatedDay = (formatedMonthStart.getDate() < 10 ) ? "0" + formatedMonthStart.getDate() : formatedMonthStart.getDate();
        var startDate = parseInt(formatedYear + "" + formatedMonth + "" + formatedDay);
        var formatedYear = formatedMonthEnd.getFullYear();
        var formatedMonth = ((formatedMonthEnd.getMonth() + 1) < 10) ? "0" + (formatedMonthEnd.getMonth() + 1) : (formatedMonthEnd.getMonth() + 1);
        var formatedDay = (formatedMonthEnd.getDate() < 10 ) ? "0" + formatedMonthEnd.getDate() : formatedMonthEnd.getDate();
        var endDate = parseInt(formatedYear + "" + formatedMonth + "" + formatedDay);
        //Ajax call to get data for bar chart using cards cube API
        $.ajax({
            url: "https://apis.bbvabancomer.com/datathon/zipcodes/" + currentZippcode + "/cards_cube",
            headers: {'Authorization': authKeyValue},
            contentType: 'application/json; charset=utf-8',
            data: {
                date_min: startDate,
                date_max: endDate,
                group_by: nextGroupBy,
                category: currentCategory,
                level: currentLevel
            }
        }).done(function (data) {
            if (data.result.code == "200" || result.code == "201") {
                textOrDate = true;
                drawChartforuser(data, filterValues, "barchart", "cardscube");
                timeline = "week";
                nextGroupBy = "day";
            } else {
                alert("could not find any related data");
            }
        }).fail(function () {
            alert("Unexpected Error try again later");
        });
    } else if (timeline == "week") {
        console.log(timeline);
        var currentdate = click.category;
        var year = parseInt(currentdate.slice(0, 4));
        var weekIncrement = 1;
        var week = {};
        for (i = 0; i < click.series.xData.length; i++) {
            var weeksObj = {};
            var MonthStartDate = new Date(currentYearSelection, currentMonthSelection, weekIncrement);
            var day = MonthStartDate.getDay();
            var firstDay = new Date(MonthStartDate.getTime() - 60 * 60 * 24 * day * 1000);
            var lastday = new Date(firstDay.getTime() + 60 * 60 * 24 * 6 * 1000);
            var formatedYear = firstDay.getFullYear();
            var formatedMonth = ((firstDay.getMonth() + 1) < 10) ? "0" + (firstDay.getMonth() + 1) : (firstDay.getMonth() + 1);
            var formatedDay = (firstDay.getDate() < 10 ) ? "0" + firstDay.getDate() : firstDay.getDate();
            var startDate = parseInt(formatedYear + "" + formatedMonth + "" + formatedDay);
            var formatedYear = lastday.getFullYear();
            var formatedMonth = ((lastday.getMonth() + 1) < 10) ? "0" + (lastday.getMonth() + 1) : (lastday.getMonth() + 1);
            var formatedDay = (lastday.getDate() < 10 ) ? "0" + lastday.getDate() : lastday.getDate();
            var endDate = parseInt(formatedYear + "" + formatedMonth + "" + formatedDay);
            weeksObj.start = startDate;
            weeksObj.end = endDate;
            weekIncrement = weekIncrement + 6;
            if (i == click.index) {
                week = weeksObj;
                break;
            }
        }
        //Ajax call to get data for bar chart using cards cube API
        $.ajax({
            url: "https://apis.bbvabancomer.com/datathon/zipcodes/" + currentZippcode + "/cards_cube",
            headers: {'Authorization': authKeyValue},
            contentType: 'application/json; charset=utf-8',
            data: {
                date_min: week.start,
                date_max: week.end,
                group_by: nextGroupBy,
                category: currentCategory,
                level: currentLevel
            }
        }).done(function (data) {
            if (data.result.code == "200" || result.code == "201") {
                textOrDate = false;
                drawChartforuser(data, filterValues, "barchart", "cardscube");
                timeline = "day";
                nextGroupBy = "month";
            } else {
                alert("could not find any related data");
            }
        }).fail(function () {
            alert("Unexpected Error try again later");
        });
    } else if (timeline == "day") {
        console.log(timeline);
        var curDate = parseInt(click.category);
        //Ajax call to get data for line chart using payments cube API
        $.ajax({
            url: "https://apis.bbvabancomer.com/datathon/zipcodes/" + currentZippcode + "/payments_cube",
            headers: {'Authorization': authKeyValue},
            contentType: 'application/json; charset=utf-8',
            data: {date_min: curDate, date_max: curDate, group_by: nextGroupBy, category: currentCategory}
        }).done(function (data) {
            drawChartforuser(data, filterValues, "barchart", "paymentscube");
            timeline = "date";
            nextGroupBy = "month";
        }).fail(function () {
            alert("Unexpected Error try again later");
        });
    } else if (timeline == "date") {
    } else {
        alert("unexpected input");
    }
}

function doLogicforChart(chartType, dataObj, filterCriteria) {
    // create a  object to return both catagories and data to drawChartforuser function
    var returnData = {};
    if (chartType == "paymentscube") {
        dataObjVerify = dataObj;
        var graphdata = new Array();
        var values = new Array();
        var categories = new Array();
        dataObj.metadata.hash_description.ranges[2].values.forEach(function (data) {
            console.log(data);
            categories.push(data.description.replace('.99',''));
        });
        dataObj.data.stats.forEach(function (data, count, total) {
            var valuesObj = new Array();
            data.cube.forEach(function (data) {
                if (data.hash.indexOf(filterCriteria) > -1) {
                    var catagory = data.hash.split("#");
                    valuesObj.push({category: catagory[2], nfp: data.num_payments});
                }
            });
            for (i = 0; i < categories.length; i++) {
                var objectsArray = valuesObj.filter(function (el) {
                    return el.category == i
                });
                if (objectsArray.length > 0) {
                    objectsArray.forEach(function (data) {
                        values.push(data.nfp);
                    });
                } else {
                    values.push(0);
                }
            }
        });
        graphdata.push({name: 'Your Group', data: values, color: "#8BD58F"});
        returnData.graphdata = graphdata;
        returnData.categories = categories;
    } else if (chartType == "cardscube") {
        var values = new Array();
        var categories = new Array();
        var totalAmtAll = new Array();
        var totalAmtYou = new Array();
        var graphData = new Array();
        dataObj.data.stats.forEach(function (data, count, total) {
            if (textOrDate) {
                categories.push("Week " + (count + 1));
            } else {
                console.log(data);
                if (data.cube.length === 0) {
                    console.log('No data found');
                } else {
                    categories.push(data.date);
                }
            }
            var avgYou = 0.0;
            var avgAll = 0.0;
            var count = 0;
            var allGrpPaymentsTotal = 0.0;
            var allGrpAvgPaymentsTotal = 0.0;
            if (data.cube.length === 0) {
                console.log('skipping processing as there is no cube data');
            } else {
                data.cube.forEach(function (data) {

                    if (data.hash.indexOf(filterCriteria) > -1) {
                        avgYou = parseFloat(data.avg);
                    }
                    allGrpPaymentsTotal = allGrpPaymentsTotal + parseFloat(data.num_payments);
                    allGrpAvgPaymentsTotal = allGrpAvgPaymentsTotal + (parseFloat(data.avg) * parseFloat(data.num_payments));
                    avgAll = avgAll + parseFloat(data.avg);
                    count = count + 1;

                });
                totalAmtAll.push(allGrpAvgPaymentsTotal / allGrpPaymentsTotal);
                totalAmtYou.push(avgYou);
            }

        });
        graphData.push({name: 'Your Group', data: totalAmtYou, color: "#8BD58F"});
        graphData.push({name: 'All Groups', data: totalAmtAll, color: "#6DADEC"});
        returnData.graphdata = graphData;
        returnData.categories = categories;
    }
    //return both catagories and data to drawChartforuser function
    return returnData;
}

function drawChartforuser(data, filterVal, drawContainer, chartType, labelsJSON) {
    // Empty chart div to clear any existing chart
    $("#" + drawContainer).empty();
    //get the gender and age criteria from filterVal
    var userGender = filterVal.gender;
    var userAgeValue = filterVal.ageValue;

    filterValues = filterVal;

    //create filter Criteria
    var filterCriteria = userGender + "#" + userAgeValue;
    console.log(filterCriteria);
    //get both options and criteria from
    var options = createOptionsForChart(chartType, drawContainer);
    var graphData = doLogicforChart(chartType, data, filterCriteria);
    //set both options and criteria to chart options
    options.series = graphData.graphdata;
    options.xAxis.categories = graphData.categories;
    console.log(graphData.categories);
    console.log(graphData.categories.length);
    if (graphData.categories.length === 0) {
        return false;
    } else {

        // create and render chart


        if (typeof labelsJSON !== 'undefined') {
            options.xAxis.labels.formatter = function () {
                return labelsJSON[this.value];
            }
            chart = new Highcharts.Chart(options);
        }
        else {
            chart = new Highcharts.Chart(options);
        }
        return true;
    }


}