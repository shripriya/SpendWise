angular.module('starter.controllers', [])
    .factory("PredictionAPI", function () {
        var tokenGeneratorUrl = "http://oauthtokengenerator.appspot.com/app/request/generateToken?callback=oAuthCallBack";
        var predictionUrl = "https://www.googleapis.com/prediction/v1.6/projects/584298581388/trainedmodels/model3_catfreq/predict?access_token=";
        var offerCatgPredictionUrl = "https://www.googleapis.com/prediction/v1.6/projects/584298581388/trainedmodels/category_predict_all_20zips_final/predict?access_token=";
        var tokenGeneratorData = {expire_seconds: '60000', oAuthCallback: 'oAuthCallBack'};
        var weekday = new Array(7);
        weekday[1] = "Mon";
        weekday[2] = "Tue";
        weekday[3] = "Wed";
        weekday[4] = "Thur";
        weekday[5] = "Fri";
        weekday[6] = "Sat";
        weekday[7] = "Sun";

        return {
            getTokenGeneratorUrl: function () {
                return tokenGeneratorUrl;
            },
            getPredictionUrl: function (accessToken) {
                return predictionUrl + accessToken;
            },
            getAccessToken: function () {
                if (predictAccessToken === null) {
                    $.ajax({
                        crossDomain: true,
                        type: 'GET',
                        url: this.getTokenGeneratorUrl(),
                        data: tokenGeneratorData,
                        dataType: 'jsonp'
                    });
                } else {
                    return predictAccessToken;
                }
            },
            getOfferCatgPredictionUrl: function (accessToken) {
                return offerCatgPredictionUrl + accessToken;
            },
            getToday: function () {
                var todayDate = new Date();
                console.log('Today is ' + weekday[todayDate.getDay()]);
                return weekday[todayDate.getDay()];
            },
            getThisHour: function () {
                var todayDate = new Date();
                console.log('Hour is ' + todayDate.getHours());
                return todayDate.getHours();
            },
            getPredictionSpendId: function (amountValue) {
                var range = 0;
                if (amountValue <= 99.9) {
                    range = 0;
                }
                else if (amountValue >= 100 && amountValue <= 249.99) {
                    range = 1;
                }
                else if (amountValue >= 250 && amountValue <= 399.99) {
                    range = 2;
                }
                else if (amountValue >= 400 && amountValue <= 599.99) {
                    range = 3;
                }
                else if (amountValue >= 600 && amountValue <= 799.99) {
                    range = 4;
                }
                else if (amountValue >= 800 && amountValue <= 999.99) {
                    range = 5;
                }
                else if (amountValue >= 1000 && amountValue <= 1299.99) {
                    range = 6;
                }
                else if (amountValue >= 1300 && amountValue <= 1599.99) {
                    range = 7;
                }
                else if (amountValue >= 1300 && amountValue <= 1999.99) {
                    range = 8;
                }
                else if (amountValue >= 2000 && amountValue <= 2399.99) {
                    range = 9;
                }
                else if (amountValue >= 2400 && amountValue <= 2399.99) {
                    range = 10;
                }
                else if (amountValue >= 3000 && amountValue <= 3999.99) {
                    range = 11;
                }
                else if (amountValue >= 4000 && amountValue <= 7999.99) {
                    range = 12;
                }
                else if (amountValue >= 8000 && amountValue <= 14999.99) {
                    range = 13;
                }
                else if (amountValue >= 15000) {
                    range = 14;
                }
                else {
                    range = 15;
                }
                return range;
            }

        };
    })
    .factory("BBVADataAPI", function ($http, $ionicLoading) {

        var url = "https://apis.bbvabancomer.com/datathon/zipcodes/11000/age_distribution?date_min=20131101&date_max=20140430&group_by=month&category=all";

        var zipCodesURL = "https://apis.bbvabancomer.com/datathon/info/zipcodes";
        //app.bbva.mygroup
        //3f26b7f69ed89c9b13d39b22c8c3f546cbef743a
        var encodedString = btoa("app.bbva.nt:93403fe2846d47aae8239c907bf6de4dca8c1b21");
        var authKeyValue = "Basic " + encodedString;
        var zipCodesArray = [];
        var merchantCatg = [];

        return {
            getBbvaAuthKey: function () {
                return authKeyValue;
            },
            getZipCodesURL: function () {
                return zipCodesURL;
            },
            getTempUrl: function (zipCode) {
                var tempUrl = "https://apis.bbvabancomer.com/datathon/zipcodes/" + zipCode + "/cards_cube";
                return tempUrl;
            },
            getZipCodesArray: function () {
                return zipCodesArray;
            },
            getCategoryURL: function () {
                var tempUrl = "https://apis.bbvabancomer.com/datathon/info/merchants_categories";
                return tempUrl;
            },
            getAllZipCodes: function () {
                $http.get(this.getZipCodesURL(), {headers: {'Authorization': this.getBbvaAuthKey()}}).
                    success(function (data, status, headers, config) {
                        zipCodesArray = data.data.zip_codes;
                        if ($("#saveDetails").length > 1) {
                            $("#saveDetails")[0].disabled = false;
                        }
                        console.log("Zipcodes loaded");
                        $ionicLoading.hide();
                    }).
                    error(function (data, status, headers, config) {
                        $ionicLoading.hide();
                        if ($("#saveDetails").length > 1) {
                            $("#errorConsole")[0].style.display = "block";
                            $("#errorConsole")[0].innerHTML = "Error in reading the BBVA API feed. Try again later!";
                            $("#saveDetails")[0].disabled = false;
                        }

                    });
            }

        };
    })

    .factory("uSpendSettings", function ($http, BBVADataAPI, $ionicLoading, $timeout, PredictionAPI) {
        console.log("factory init");
        var uSpendSettings = {};
        uSpendSettings.zipCode = "";
        uSpendSettings.shareLocationPref = "no";
        uSpendSettings.age = 25;
        uSpendSettings.ageGroup = "2";
        uSpendSettings.gender = "M";
        uSpendSettings.catg = "3";
        uSpendSettings.subCatg = "4";
        uSpendSettings.spendingTrend = "D";
        uSpendSettings.feed = {};
        uSpendSettings.merchantCatg = [];
        uSpendSettings.merchantsubcatg = [];
        uSpendSettings.fromDate = "20131101";
        uSpendSettings.toDate = "20140430";
        uSpendSettings.chCatg = " ";
        uSpendSettings.chVal = " ";
        uSpendSettings.selectedMerchant;
        uSpendSettings.reviews;
        uSpendSettings.ratings;
        uSpendSettings.merchantMapName;
        uSpendSettings.predictedSpend = "0";
        uSpendSettings.selectedOfferCatgDesc = "";
        uSpendSettings.selectedSpendCatgDesc = "";
        uSpendSettings.selectedSubCatgDesc = "";
        uSpendSettings.predictedCategory = "";


        $http.get(BBVADataAPI.getCategoryURL(), {headers: {'Authorization': BBVADataAPI.getBbvaAuthKey()}}).
            success(function (data, status, headers, config) {
                uSpendSettings.merchantCatg = data.data.categories;
                console.log("fetched categories feed successfully");
                //$timeout($ionicLoading.hide, 500);
            }).
            error(function (data, status, headers, config) {
                $scope.loader = "There's been an error in fetching categories";
                console.error('Error fetching feed:', data);
            });

        PredictionAPI.getAccessToken();
        return {
            getUSpendSettings: function () {
                return uSpendSettings;
            },
            setUSpendSettings: function (settingsObj) {
                uSpendSettings = settingsObj;
            }
        };
    })
    .directive('onlyDigits', function () {
        return {
            require: 'ngModel',
            restrict: 'A',
            link: function (scope, element, attr, ctrl) {
                function inputValue(val) {
                    if (val) {
                        var digits = val.replace(/[^0-9]/g, '');

                        if (digits !== val) {
                            ctrl.$setViewValue(digits);
                            ctrl.$render();
                        }
                        return parseInt(digits, 10);
                    }
                    return undefined;
                }

                ctrl.$parsers.push(inputValue);
            }
        }
    })
    .directive('starRating', function () {
        return {
            restrict: 'A',
            template: '<ul class="rating">' +
            '<li ng-repeat="star in stars" ng-class="star">' +
            '\u2605' +
            '</li>' +
            '</ul>',
            scope: {
                ratingValue: '=',
                max: '='
            },
            link: function (scope, elem, attrs) {
                scope.stars = [];
                for (var i = 0; i < scope.max; i++) {
                    scope.stars.push({
                        filled: i < scope.ratingValue
                    });
                }
            }
        }
    })
    .controller('AppCtrl', function ($scope, $ionicModal, $timeout, $state) {

        $scope.showStep3 = function () {

            $state.go('tab.group2');
        };


    })
    .controller('Group1Ctrl', function ($scope, $http, $location, $state, BBVADataAPI, uSpendSettings, $ionicLoading) {
        var settingsObj = uSpendSettings.getUSpendSettings();
        $scope.person = {};
        $scope.person.zipCode = settingsObj.zipCode;
        $scope.person.shareLocationPref = settingsObj.shareLocationPref;
        $ionicLoading.show({
            content: '<i class="icon ion-loading-d"></i>',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
        BBVADataAPI.getAllZipCodes();
        $("#saveDetails")[0].disabled = false;
        $scope.shareLocation = function () {
            if ($scope.person.shareLocationPref === 'yes') {
                navigator.geolocation.getCurrentPosition(
                    function (position) {
                        var lat = position.coords.latitude;
                        var long = position.coords.longitude;
                        var latlng = new google.maps.LatLng(lat, long);
                        var geocoder = new google.maps.Geocoder();
                        geocoder.geocode({'latLng': latlng}, function (results, status) {
                            if (status == google.maps.GeocoderStatus.OK) {
                                if (results[0]) {
                                    for (var i = 0; i < results[0].address_components.length; i++) {
                                        var postalCode = results[0].address_components[i].types;
                                        if (results[0].address_components[i].types.indexOf("postal_code") !== -1) {
                                            postalCode = results[0].address_components[i].long_name;
                                            console.log(postalCode);
                                            $scope.person.zipCode = postalCode;
                                            $("#zipCode").val(postalCode);
                                            $("#zipCode")[0].disabled = true;
                                        }

                                    }
                                }
                            } else {
                                $scope.person.shareLocationPref = "no";
                                $("#zipCode")[0].disabled = true;
                                $("#locationWarn")[0].style.display = "block";
                            }
                        });
                    },
                    function () {
                        console.log('Error getting location');
                        $scope.person.shareLocationPref = "no";
                        $("#zipCode")[0].disabled = true;
                        $("#locationWarn")[0].style.display = "block";
                    });
            }
            else {
                $("#zipCode").val('');
                $("#zipCode")[0].disabled = false;
            }
        };
        $scope.AddItem = function (stateName) {
            console.log("--> Submitting form");
            var zipCodesArray = BBVADataAPI.getZipCodesArray();
            //zipCodesArray = ["600097"];
            if (zipCodesArray.length > 0) {
                var isZipValid = zipCodesArray.indexOf($scope.person.zipCode);
                console.log(isZipValid);
                if (isZipValid !== -1) {
                    var settingsObj = uSpendSettings.getUSpendSettings();
                    settingsObj.zipCode = $scope.person.zipCode;
                    if ($scope.person.shareLocationPref === 'yes') {
                        settingsObj.shareLocationPref = 'yes';
                    }
                    else {
                        settingsObj.shareLocationPref = 'no';
                    }
                    $("#errorConsole")[0].style.display = "block";
                    $("#errorConsole")[0].innerHTML = "";
                    localStorage.setItem("settingsObj", JSON.stringify(settingsObj));
                    uSpendSettings.setUSpendSettings(settingsObj);
                    console.log(uSpendSettings.getUSpendSettings());
                    $state.go(stateName);
                }
                else {
                    console.log('Invalid Zip code');
                    $("#errorConsole")[0].style.display = "block";
                    $("#errorConsole")[0].style.color = "red";
                    $("#errorConsole")[0].innerHTML = "Invalid Zip code!";
                }
            }
        }
    })

    .controller('Group2Ctrl', function ($scope, $http, $location, $state, BBVADataAPI, uSpendSettings, $timeout, $ionicNavBarDelegate) {
        var settingsObjPersisted = JSON.parse(localStorage.getItem("settingsObj"));
        if (settingsObjPersisted !== null) {
            uSpendSettings.setUSpendSettings(settingsObjPersisted);
        }
        var settingsObj = uSpendSettings.getUSpendSettings();
        $scope.person = {};
        $scope.person.ageGroup = settingsObj.ageGroup;
        $scope.person.age = settingsObj.age;
        $scope.person.gender = settingsObj.gender;
        var loadHomeScreen = function () {
            //function to remove app launch screen and display the app
            $("#homeLoader").css('display', 'none');
            $("#homeContentLoader").css('display', 'block');
            $ionicNavBarDelegate.showBar(true);
            $(".dial").knob();
            $('.dial')
                .val(settingsObj.age)
                .trigger('change');

        }

        if (displayHomeScreen) {
            displayHomeScreen = false;
            $timeout(loadHomeScreen, 3500);

        } else {
            $timeout(loadHomeScreen, 10);
        }

        $scope.AddItem = function () {
            var settingsObj = uSpendSettings.getUSpendSettings();
            var age = $('.dial').val();
            if (age <= 18) {
                settingsObj.ageGroup = 0;
            }
            else if (age > 18 && age < 26) {
                settingsObj.ageGroup = 1;
            }
            else if (age > 25 && age < 36) {
                settingsObj.ageGroup = 2;
            }
            else if (age > 35 && age < 46) {
                settingsObj.ageGroup = 3;
            }
            else if (age > 45 && age < 56) {
                settingsObj.ageGroup = 4;
            }
            else if (age > 55 && age < 66) {
                settingsObj.ageGroup = 5;
            }
            else {
                settingsObj.ageGroup = 6;
            }
            settingsObj.age = $('.dial').val();
            settingsObj.gender = $scope.person.gender;
            uSpendSettings.setUSpendSettings(settingsObj);
            console.log(uSpendSettings.getUSpendSettings());
            $state.go('tab.group1');

        }
    })


    .controller('Group3Ctrl', function ($scope, $http, $location, $state, BBVADataAPI, uSpendSettings) {

        $scope.items = [{
            code: "mx_auto",
            desc: "Car",
            imgName: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAKCAMAAACdQr5nAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QTA3QjE5N0U2RkQwMTFFNEIzQTA5RURFRkE1RjAyNkEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QTA3QjE5N0Y2RkQwMTFFNEIzQTA5RURFRkE1RjAyNkEiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpBMDdCMTk3QzZGRDAxMUU0QjNBMDlFREVGQTVGMDI2QSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpBMDdCMTk3RDZGRDAxMUU0QjNBMDlFREVGQTVGMDI2QSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Ph3JvpwAAADeUExURQCgsxGmuMzs8A+mtwijtXjN1xCmuJbY4AGgs8vs8A2ltwejtQqktmrH0yuwwBWoubHi6Pz+/jy2xQWitFzCznPL1ZTX31fAzbnl6ki7yEe6yOX192nH0vT7/GfG0p7b4lbAzYbS2xyqu3LK1c/t8Smvvyivv0q8yUa6yL3m62zI05DW3l7DzyCsvfP7+8Pp7T23xd3y9Tu2xTq2xJ3a4t/z9XDK1COtvUu8yaHc45XY39Pv8mXG0UO5x6Dc45rZ4ROnuX7P2Te0wz63xej2+I7V3QaitQykt+b2+P///0bE5X8AAABKdFJOU/////////////////////////////////////////////////////////////////////////////////////////////////8AWiu/GwAAAJ1JREFUeNpsz0UOxDAMQFGnmHI7zMzMzOz7X2jSSlOl0ryFFetvHEDEURoUQkxKmISHP4C4b0GBvVTR3/slLmV0yHphQrkXpm0cnK7AyG9/Ctott9CKQarBH3S4kV2QwLHqdrTMVweRBely0l/JGV8qFiUpCSA2uLtL40o4ZyW/m3Sa7PhjWTMeyPko02c7+Nd4LaoYUTXtBuJXgAEAiiYja88++2EAAAAASUVORK5CYII="
        },
            {
                code: "mx_barsandrestaurants",
                desc: "Bars And Restaurants",
                imgName: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAaCAMAAABigZc2AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QkVGOTU0QjE2RkQwMTFFNDg5MUFDRjI2OTcwMjc0MjciIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QkVGOTU0QjI2RkQwMTFFNDg5MUFDRjI2OTcwMjc0MjciPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpCRUY5NTRBRjZGRDAxMUU0ODkxQUNGMjY5NzAyNzQyNyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpCRUY5NTRCMDZGRDAxMUU0ODkxQUNGMjY5NzAyNzQyNyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PrufNrMAAADYUExURQCgs6Xd5N3y9VXAzIjT3HfM1h2rvFbAzdPv8g2lt/H6+4nT3Pb8/E69yuT195LW3/j8/eP191jBzf3+/uH09i6xwRepuvr9/njN10e6yBuqu3vO2GzI08/t8RCmuLjl6hyqu/T7/NDt8d7z9ff8/S2xwFfAzfz+/h6rvFK/y8Lo7ZTX34/V3kS5x0G4xhmpuiGsvb7n7PX7/Ei7yGXG0QuktkW6yKrf5p3a4pva4VS/zAmjto3V3QaitXXM1jW0w4vU3FvCzvn9/T+3xnDK1PP7+5za4f///+/EimoAAABIdFJOU///////////////////////////////////////////////////////////////////////////////////////////////AJzs8mAAAACiSURBVHja1JBVEoNQDEVDKQ51d3d39/buf0eFMo8CXUHPR2ZyJjYheEnEAPI5af3jenf4XfxctFzAzcCwIl2XvMNc4fnusUDIL9qsNaMhwmvWvFdWsDntH8KIs3eUFWKUpmxvLWemu/qERBnOLdEmkSGLyRC+DurKrByqcDukWyTd4HXgiMP/u0a/Q5Ww7nLVw/jzvdTlyZy+CTK2MzN/CzAAL65iz3yvtfkAAAAASUVORK5CYII="
            },
            {
                code: "mx_fashion",
                desc: "Fashion",
                imgName: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAdCAMAAABymtfJAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RERFNEI3RkE3NDkxMTFFNEExNTFFODk5NjAyRUQwOTciIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RERFNEI3RkI3NDkxMTFFNEExNTFFODk5NjAyRUQwOTciPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpEREU0QjdGODc0OTExMUU0QTE1MUU4OTk2MDJFRDA5NyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpEREU0QjdGOTc0OTExMUU0QTE1MUU4OTk2MDJFRDA5NyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pu78iWkAAADkUExURQCgsyqwwAKhtLjl6pHW3nzO2P3+/lvCzjy2xfD5+4PR2sfq7tvy9GvI03jN16nf5QWitN7z9XrN1+34+u/5+k69ypLW32PF0WfG0kC4xtHu8XvO2LDi5xmpup7b4pnZ4VbAzfP7+3HK1ZTX35XY38Pp7YnT3BOnueH09lK/y33P2Buqu77n7HTL1hCmuJva4QShtNnx9Em7ycXp7un3+Pz+/sLo7fn9/c3s8OL09iWuvp/b4lG+ywaitQmjtpza4W3J0w+mt1/Dzx2rvFrCzofS2+b2+M7t8DOzwrzm6yuwwP///8zcLj8AAABMdFJOU////////////////////////////////////////////////////////////////////////////////////////////////////wCejeTMAAAAxklEQVR42mzQ1xqCMAwF4CAi4AL33nvvvfd6//cRa8QGPRenX/+bNoHHOyrrId4AzxLrm0W3rKNUA/rUaLeuEhVhJ2n2AwyInuCdNFEPapnoETVBNILqJVpHdRItoIaJZlAXf/8g8TpqoAq8ivCJi1PZVPmrwbWpq7OpdvjGaarAaWqCOgY+HdQsUcHBtNolCkmmLYqgvDTXtqgxCTyKVoSlocKP2twwm/9gP2681txXOLv7ezib47LJh5RrrObVfGw7TwEGAMfOWsfJ3UBwAAAAAElFTkSuQmCC"
            },
            {
                code: "mx_food",
                desc: "Food",
                imgName: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAANCAMAAABxTNVSAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RjRFMjZEMkU3NDkxMTFFNEI2MDZENEZCMzU1RDU2RTYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RjRFMjZEMkY3NDkxMTFFNEI2MDZENEZCMzU1RDU2RTYiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpGNEUyNkQyQzc0OTExMUU0QjYwNkQ0RkIzNTVENTZFNiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpGNEUyNkQyRDc0OTExMUU0QjYwNkQ0RkIzNTVENTZFNiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pvmp3dIAAAERUExURQCgs+H09g+mt/z+/gShtFrCzguktqHc43/P2f3+/mfG0huqu1vCzuDz9gejtVnBzgykt+v4+Ua6yOP197bk6Qqktuj2+Or3+SOtvfP7+6Pd5Em7yTW0wy+ywfv+/lO/zPr9/svs8GjH0jq2xO34+gmjtkK5x1fAzTa0w4HQ2TGywje0w7/n7FS/zLzm62vI0yivvyStvobS25DW3hyqu6rf5mPF0S6xwbTj6e75+k29ysHo7S2xwM/t8Z/b4uX191K/y7jl6jSzwljBzQOhtAKhtNTv8imvv2TF0WLF0BCmuOb2+BWoudjw8wGgs4fS21G+y1/Dz6jf5ef2+PX7/HHK1ZHW3tzy9dfw813Dz////3T3R3kAAABbdFJOU////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wCc+ri8AAAAvUlEQVR42lzO1XICURRE0Z5hGNwtWIK7hOCSENw16Pn/D+HOhQdCP66qrtp4D+B1FhV0jsoLqr9tEKrnz/+4MggQzD7vUXpCUwlMge1lrJcfaPzrSFxPH1K+4dlHUkuGsSx+Room3mDty/avginU1NmBIDP3ELXo1cbOc6t5QmIb0BNIi3ISLqaLMEDiBjNiSto1IGmKGPgVxU7FlXJ1yF0NTyDRwpArUa8Vv4fRVMGHEh2c6d+MQSSOdBNgAGqkHuW7ush0AAAAAElFTkSuQmCC"
            },
            {
                code: "mx_hyper",
                desc: "Mall",
                imgName: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAZCAMAAAD+KQUWAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MDJGMzRGQ0M3NDkyMTFFNDk3QTlGNTFDMEMzMkExQUUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MDJGMzRGQ0Q3NDkyMTFFNDk3QTlGNTFDMEMzMkExQUUiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDowMkYzNEZDQTc0OTIxMUU0OTdBOUY1MUMwQzMyQTFBRSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDowMkYzNEZDQjc0OTIxMUU0OTdBOUY1MUMwQzMyQTFBRSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PrrarwoAAADbUExURQCgs+75+njN1zOzwt3y9bTj6Q+mtwGgs5bY4JnZ4ZPX37vm69rx9CqwwL/n7AmjtgaitdLu8tvy9OH09iGsvVXAzDCywTy2xRKnuJHW3uDz9sPp7bzm67Hi6Byqu1vCzjW0wzSzwlS/zPD5+2HE0Pn9/UK5x/H6+wqkto7V3QShtNXv8vf8/T+3xrjl6hipun/P2b3m6+P199/z9cjr76Td5Oz4+X3P2Ob2+GDE0BGmuBWouS2xwOf2+Dq2xOL09pDW3pTX3yStvh+svAOhtMfq7nDK1E69yv///xBp0ZAAAABJdFJOU////////////////////////////////////////////////////////////////////////////////////////////////wAMCJ9VAAAA20lEQVR42nzS12LCMAxAUZUWMiEEaNmbDkYHe8+2oP//IpLgGGSH3DfnvDiWAEktmNMPQI8WWKG+j+uhLsW99DlFTGua1kXUHy+dClfPABQxCgAq5hVg5WzuWeiYF99xBnjhPtH/0fPaDTsxThmGkfCcFPc94hxikicTob74Quo/DA7DB7ceUm8zXqak93Hdv/jHCAOd9VfGUFfF9393rnLkHBHms26Qf6oK8zO/Cb+9Cl4nvGqK8ydVBtJ+bG44Zsv7Y/5ep9EP2q/ZM2NlfGf/0k9e26D9PAswAFCngFkIj+W1AAAAAElFTkSuQmCC"
            }];

        var settingsObj = uSpendSettings.getUSpendSettings();
        $scope.person = {};
        $scope.person.catg = settingsObj.catg;

        $scope.AddItem = function (obj) {

            var settingsObj = uSpendSettings.getUSpendSettings();
            settingsObj.catg = obj.code;
            settingsObj.selectedSpendCatgDesc = obj.desc;
            for (var i = 0; i < settingsObj.merchantCatg.length; i++) {
                if (settingsObj.merchantCatg[i].code === settingsObj.catg) {
                    settingsObj.merchantsubcatg = settingsObj.merchantCatg[i].subcategories;
                }
            }
            console.log(settingsObj);
            uSpendSettings.setUSpendSettings(settingsObj);
            $state.go('tab.group4');
        }

    })


    .controller('Group4Ctrl', function ($scope, $http, $location, $state, BBVADataAPI, uSpendSettings) {

        var subCategoryImages = [
            {
                id: "mx_auto",
                base: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAKCAMAAACdQr5nAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QTA3QjE5N0U2RkQwMTFFNEIzQTA5RURFRkE1RjAyNkEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QTA3QjE5N0Y2RkQwMTFFNEIzQTA5RURFRkE1RjAyNkEiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpBMDdCMTk3QzZGRDAxMUU0QjNBMDlFREVGQTVGMDI2QSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpBMDdCMTk3RDZGRDAxMUU0QjNBMDlFREVGQTVGMDI2QSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Ph3JvpwAAADeUExURQCgsxGmuMzs8A+mtwijtXjN1xCmuJbY4AGgs8vs8A2ltwejtQqktmrH0yuwwBWoubHi6Pz+/jy2xQWitFzCznPL1ZTX31fAzbnl6ki7yEe6yOX192nH0vT7/GfG0p7b4lbAzYbS2xyqu3LK1c/t8Smvvyivv0q8yUa6yL3m62zI05DW3l7DzyCsvfP7+8Pp7T23xd3y9Tu2xTq2xJ3a4t/z9XDK1COtvUu8yaHc45XY39Pv8mXG0UO5x6Dc45rZ4ROnuX7P2Te0wz63xej2+I7V3QaitQykt+b2+P///0bE5X8AAABKdFJOU/////////////////////////////////////////////////////////////////////////////////////////////////8AWiu/GwAAAJ1JREFUeNpsz0UOxDAMQFGnmHI7zMzMzOz7X2jSSlOl0ryFFetvHEDEURoUQkxKmISHP4C4b0GBvVTR3/slLmV0yHphQrkXpm0cnK7AyG9/Ctott9CKQarBH3S4kV2QwLHqdrTMVweRBely0l/JGV8qFiUpCSA2uLtL40o4ZyW/m3Sa7PhjWTMeyPko02c7+Nd4LaoYUTXtBuJXgAEAiiYja88++2EAAAAASUVORK5CYII="
            },
            {
                id: "mx_barsandrestaurants",
                base: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAaCAMAAABigZc2AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QkVGOTU0QjE2RkQwMTFFNDg5MUFDRjI2OTcwMjc0MjciIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QkVGOTU0QjI2RkQwMTFFNDg5MUFDRjI2OTcwMjc0MjciPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpCRUY5NTRBRjZGRDAxMUU0ODkxQUNGMjY5NzAyNzQyNyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpCRUY5NTRCMDZGRDAxMUU0ODkxQUNGMjY5NzAyNzQyNyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PrufNrMAAADYUExURQCgs6Xd5N3y9VXAzIjT3HfM1h2rvFbAzdPv8g2lt/H6+4nT3Pb8/E69yuT195LW3/j8/eP191jBzf3+/uH09i6xwRepuvr9/njN10e6yBuqu3vO2GzI08/t8RCmuLjl6hyqu/T7/NDt8d7z9ff8/S2xwFfAzfz+/h6rvFK/y8Lo7ZTX34/V3kS5x0G4xhmpuiGsvb7n7PX7/Ei7yGXG0QuktkW6yKrf5p3a4pva4VS/zAmjto3V3QaitXXM1jW0w4vU3FvCzvn9/T+3xnDK1PP7+5za4f///+/EimoAAABIdFJOU///////////////////////////////////////////////////////////////////////////////////////////////AJzs8mAAAACiSURBVHja1JBVEoNQDEVDKQ51d3d39/buf0eFMo8CXUHPR2ZyJjYheEnEAPI5af3jenf4XfxctFzAzcCwIl2XvMNc4fnusUDIL9qsNaMhwmvWvFdWsDntH8KIs3eUFWKUpmxvLWemu/qERBnOLdEmkSGLyRC+DurKrByqcDukWyTd4HXgiMP/u0a/Q5Ww7nLVw/jzvdTlyZy+CTK2MzN/CzAAL65iz3yvtfkAAAAASUVORK5CYII="
            },
            {
                id: "mx_fashion",
                base: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAdCAMAAABymtfJAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RERFNEI3RkE3NDkxMTFFNEExNTFFODk5NjAyRUQwOTciIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RERFNEI3RkI3NDkxMTFFNEExNTFFODk5NjAyRUQwOTciPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpEREU0QjdGODc0OTExMUU0QTE1MUU4OTk2MDJFRDA5NyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpEREU0QjdGOTc0OTExMUU0QTE1MUU4OTk2MDJFRDA5NyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pu78iWkAAADkUExURQCgsyqwwAKhtLjl6pHW3nzO2P3+/lvCzjy2xfD5+4PR2sfq7tvy9GvI03jN16nf5QWitN7z9XrN1+34+u/5+k69ypLW32PF0WfG0kC4xtHu8XvO2LDi5xmpup7b4pnZ4VbAzfP7+3HK1ZTX35XY38Pp7YnT3BOnueH09lK/y33P2Buqu77n7HTL1hCmuJva4QShtNnx9Em7ycXp7un3+Pz+/sLo7fn9/c3s8OL09iWuvp/b4lG+ywaitQmjtpza4W3J0w+mt1/Dzx2rvFrCzofS2+b2+M7t8DOzwrzm6yuwwP///8zcLj8AAABMdFJOU////////////////////////////////////////////////////////////////////////////////////////////////////wCejeTMAAAAxklEQVR42mzQ1xqCMAwF4CAi4AL33nvvvfd6//cRa8QGPRenX/+bNoHHOyrrId4AzxLrm0W3rKNUA/rUaLeuEhVhJ2n2AwyInuCdNFEPapnoETVBNILqJVpHdRItoIaJZlAXf/8g8TpqoAq8ivCJi1PZVPmrwbWpq7OpdvjGaarAaWqCOgY+HdQsUcHBtNolCkmmLYqgvDTXtqgxCTyKVoSlocKP2twwm/9gP2681txXOLv7ezib47LJh5RrrObVfGw7TwEGAMfOWsfJ3UBwAAAAAElFTkSuQmCC"
            },
            {
                id: "mx_food",
                base: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAANCAMAAABxTNVSAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RjRFMjZEMkU3NDkxMTFFNEI2MDZENEZCMzU1RDU2RTYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RjRFMjZEMkY3NDkxMTFFNEI2MDZENEZCMzU1RDU2RTYiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpGNEUyNkQyQzc0OTExMUU0QjYwNkQ0RkIzNTVENTZFNiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpGNEUyNkQyRDc0OTExMUU0QjYwNkQ0RkIzNTVENTZFNiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pvmp3dIAAAERUExURQCgs+H09g+mt/z+/gShtFrCzguktqHc43/P2f3+/mfG0huqu1vCzuDz9gejtVnBzgykt+v4+Ua6yOP197bk6Qqktuj2+Or3+SOtvfP7+6Pd5Em7yTW0wy+ywfv+/lO/zPr9/svs8GjH0jq2xO34+gmjtkK5x1fAzTa0w4HQ2TGywje0w7/n7FS/zLzm62vI0yivvyStvobS25DW3hyqu6rf5mPF0S6xwbTj6e75+k29ysHo7S2xwM/t8Z/b4uX191K/y7jl6jSzwljBzQOhtAKhtNTv8imvv2TF0WLF0BCmuOb2+BWoudjw8wGgs4fS21G+y1/Dz6jf5ef2+PX7/HHK1ZHW3tzy9dfw813Dz////3T3R3kAAABbdFJOU////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wCc+ri8AAAAvUlEQVR42lzO1XICURRE0Z5hGNwtWIK7hOCSENw16Pn/D+HOhQdCP66qrtp4D+B1FhV0jsoLqr9tEKrnz/+4MggQzD7vUXpCUwlMge1lrJcfaPzrSFxPH1K+4dlHUkuGsSx+Room3mDty/avginU1NmBIDP3ELXo1cbOc6t5QmIb0BNIi3ISLqaLMEDiBjNiSto1IGmKGPgVxU7FlXJ1yF0NTyDRwpArUa8Vv4fRVMGHEh2c6d+MQSSOdBNgAGqkHuW7ush0AAAAAElFTkSuQmCC"
            },
            {
                id: "mx_hyper",
                base: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAZCAMAAAD+KQUWAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MDJGMzRGQ0M3NDkyMTFFNDk3QTlGNTFDMEMzMkExQUUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MDJGMzRGQ0Q3NDkyMTFFNDk3QTlGNTFDMEMzMkExQUUiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDowMkYzNEZDQTc0OTIxMUU0OTdBOUY1MUMwQzMyQTFBRSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDowMkYzNEZDQjc0OTIxMUU0OTdBOUY1MUMwQzMyQTFBRSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PrrarwoAAADbUExURQCgs+75+njN1zOzwt3y9bTj6Q+mtwGgs5bY4JnZ4ZPX37vm69rx9CqwwL/n7AmjtgaitdLu8tvy9OH09iGsvVXAzDCywTy2xRKnuJHW3uDz9sPp7bzm67Hi6Byqu1vCzjW0wzSzwlS/zPD5+2HE0Pn9/UK5x/H6+wqkto7V3QShtNXv8vf8/T+3xrjl6hipun/P2b3m6+P199/z9cjr76Td5Oz4+X3P2Ob2+GDE0BGmuBWouS2xwOf2+Dq2xOL09pDW3pTX3yStvh+svAOhtMfq7nDK1E69yv///xBp0ZAAAABJdFJOU////////////////////////////////////////////////////////////////////////////////////////////////wAMCJ9VAAAA20lEQVR42nzS12LCMAxAUZUWMiEEaNmbDkYHe8+2oP//IpLgGGSH3DfnvDiWAEktmNMPQI8WWKG+j+uhLsW99DlFTGua1kXUHy+dClfPABQxCgAq5hVg5WzuWeiYF99xBnjhPtH/0fPaDTsxThmGkfCcFPc94hxikicTob74Quo/DA7DB7ceUm8zXqak93Hdv/jHCAOd9VfGUFfF9393rnLkHBHms26Qf6oK8zO/Cb+9Cl4nvGqK8ydVBtJ+bG44Zsv7Y/5ep9EP2q/ZM2NlfGf/0k9e26D9PAswAFCngFkIj+W1AAAAAElFTkSuQmCC"
            },
            {id:"mx_car",base:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAbCAMAAAC6CgRnAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NDRBNEZFNkY3NDkyMTFFNDlCM0ZGQjBDMzRCRjY0MTAiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NDRBNEZFNzA3NDkyMTFFNDlCM0ZGQjBDMzRCRjY0MTAiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo0NEE0RkU2RDc0OTIxMUU0OUIzRkZCMEMzNEJGNjQxMCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo0NEE0RkU2RTc0OTIxMUU0OUIzRkZCMEMzNEJGNjQxMCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pm4swQAAAAG5UExURQCgswKhtAyktwOhtPX7/Pb8/MDo7Buqu1bAzSywwPT7/Aqktur3+ff8/ez4+YzU3Qejte/5+rzm60G4xpPX30i7yBmpuhipuv3+/ka6yKvg5tLu8tnx9BSnuQShtPH6+waitbLi6NTv8lXAzMXp7qrf5uDz9gGgs+34+i+ywWbG0ZrZ4Qmjtg2lt5nZ4Zza4fn9/XfM1rnl6hWouRyqu2HE0IHQ2UC4xtrx9Mrr78nr73bM1jKzwqXd5Lvm697z9Ue6yK/h56Pd5E+9y5va4WLF0I3V3VS/zIfS24nT3PD5+wWitCOtvcPp7Z7b4iStvk69yp/b4iqwwB6rvLfk6r3m66Dc49Dt8ZHW3ky8yiGsvcfq7l7Dz/P7+/j8/VfAzTe0wyWuvpTX3xepunvO2L7n7HPL1Rqqu8vs8J3a4nnN1+b2+OP19/L6+3rN11zCzsLo7Um7yQ6lt4bS29vy9GjH0m3J01C+yw+mt6zg5l3Dz2zI0z63xczs8D23xbPj6GrH0/z+/hGmuKfe5e75+ljBzeT193HK1TSzwqTd5FrCzsHo7VnBzh2rvEK5x33P2HXM1hCmuP///8LvTHwAAACTdFJOU///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////AMRl64YAAAGKSURBVHjadJJVc8JQEIVPEhyKtqUCpVQpFUrd3d3d3d3dXe8v7g1JSoHpmcnk7H77sHd3QSSN9xlKT1dmtuS/GYj/nK5WCMpQKQKYzUKTOxf37vzoWeoi9vwshkXcpiJKqC7OjwN7LLFuBmUJxK/YNDADApvnUCUjfyXbBtfPM0ckpgIRIdlnUK5T9gW2kgRLl4sNAgeLJhKqAhxpsAztaiiSRwPlUAGM2l2XlHLnGkyPmDSY1+QyW8M7feUYOvGf1Ij/l2npdztB9O2fSn99gXMp9jWROiOE0crnUn0k1yl0MwQG0/CIvWXRCJnS8HaRh0ScSI3TltEsBfUYhgc3YWJYAnB60UdZEY4WLbKk2kz0SDYZRh3IApQmMdGGQtHpe3FAZ22KROO1kLHjSdzDB6wufn9J8XjT+NYGLPqQyQLOLOz9mcFIB20oh/apo3F1HriaP/cC++P5FWXJD+lpwPel/86KCvmR8INheVObEnCf5kOjdJ8vo0G3S4imwuDd94Yrwn4zPwIMALNI8YEqpnemAAAAAElFTkSuQmCC"},

            {id:"mx_gas",base:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAdCAMAAABymtfJAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NURBMTE4QjI3NDkyMTFFNDgxMUM4QTc1NjYwNjVCN0IiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NURBMTE4QjM3NDkyMTFFNDgxMUM4QTc1NjYwNjVCN0IiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo1REExMThCMDc0OTIxMUU0ODExQzhBNzU2NjA2NUI3QiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo1REExMThCMTc0OTIxMUU0ODExQzhBNzU2NjA2NUI3QiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pq8mC4gAAAE1UExURQCgszy2xbvm6+H09qXd5GbG0YjT3Krf5hKnuGnH0pbY4NLu8gOhtNvy9AShtOL09jOzwgejtc3s8E+9ywaitRepulzCzkG4xu/5+pHW3hyquwijte34+rjl6uDz9hOnuRCmuBWoubfk6sLo7ZfY4HnN1yevvxSnuY/V3ozU3fv+/rrl6iCsvVrCztzy9Ua6yOz4+ff8/U29yki7yOP19xmpulvCzsHo7YbS297z9Q+mt6fe5Qykt17Dzxuqu8vs8FjBzdnx9HDK1J7b4trx9JDW3hipuqjf5YHQ2UO5xzSzwur3+R+svAqktpXY3ze0w4TR2vT7/DGywp3a4tbw81K/y8Xp7ke6yCuwwE69yiWuvvn9/cTp7XbM1kC4xiKtvS+ywXvO2KPd5FC+y5nZ4Uu8yf///2mhtKIAAABndFJOU////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wAUFrp4AAAA/ElEQVR42mzQ1XLDMBRF0ZM0rZ3YYaYyMzMzMzOe//+ESoqb1LL3k2bdmSuNwLmBFlVxg/Wwj7+Stw2dsecNY6hqGOuYZSWdqinOnPk4Xlm5NFM1DTg6IU9Hq6al9K6+TM5fkI1K/XHpKTBcEHrg0sjuEq6E5h28UBoyB+0PobFcsyqvdOHkEJvEv9RrRnvKYa+Sb24FMvcGmc25tP1rshSLc3lE3/CMPSbTul4jxMUpXZuElgJe/WYi4dUIHx79NFz26hZ3EPe5rYpOH53GuaatQtlxo6kldexY020UyRVb0yfz3Qq29er/+5kB+roQbLQm/zza313grwADABJBW++X9KHCAAAAAElFTkSuQmCC"},

            {id:"mx_tow",base:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAkCAMAAAAw96PuAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NzBCRUJGNzM3NDkyMTFFNDg1OENCRUY3RkVGOTA1NjQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NzBCRUJGNzQ3NDkyMTFFNDg1OENCRUY3RkVGOTA1NjQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo3MEJFQkY3MTc0OTIxMUU0ODU4Q0JFRjdGRUY5MDU2NCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo3MEJFQkY3Mjc0OTIxMUU0ODU4Q0JFRjdGRUY5MDU2NCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Prj+/hIAAAGYUExURQCgswGgs0+9ywqktsTp7Zva4RWouUC4xtjw8x6rvJza4ff8/Qijtazg5rLi6C2xwEu8yZ7b4gejtRGmuBmpurDi5/j8/ZnZ4eT191zCzub2+GTF0Ty2xfP7+9nx9Pz+/hOnuQWitFO/zA+mt1vCzuf2+O34+lK/y5rZ4Q6lt/3+/gmjtsvs8FS/zPv+/qDc42LF0O/5+p3a4haoumfG0mbG0QaitS+yweX19yStvky8yvT7/IrT3Or3+aHc4/b8/MXp7u75+pbY4GjH0o3V3en3+HHK1bHi6GnH0lbAzT+3xhipuoLQ2ka6yEm7yR2rvNvy9N7z9XvO2EK5x6rf5nXM1gKhtNzy9VC+yxqqu6nf5U69yjGywrnl6hepuvL6+7jl6qXd5IjT3H7P2TSzwnTL1sLo7XbM1hyquzm1xAShtNTv8h+svMjr71nBzsHo7Qukttfw8xCmuGXG0XrN12rH05/b4qvg5sfq7j63xZLW39Dt8ajf5b/n7OP195HW3tLu8nnN14PR2jCyweL09g2ltxSnuf///5VwiE8AAACIdFJOU////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wAYt9YPAAABdUlEQVR42oTSZVPDUBAF0E3dlbbUgbZQKFRxd3d3d3d3279NUkqaQHi5HzKT3TN5soHErUG2X/CO/waaYurHPWMZQaBKuWU2OkkiKnPmU6UkQcddi2ShtepFxKzFKyIGTUgWrl25iKifDIkI4w6SxR2siogNaoos/DM3WPdMEgugGVZDldmefs3tlJhLfomz4yM10Em1aa7khzpFCjwjfFHUpwM2OfoSXK75CPPEtcTCAsrGlLwFYKrm3Udhclr6QyoSzCTzqICDP31846yD2P95cl7c6+OKTeBkrllKzynUE7nkCAfdyJewptjFFIuog6xQSYHSYDlLrEm6GIZRzj5UL+P0cyK7lNKHaxDniEy6Flmie/WA5K/AjjLunrcFBKJhiEMehAQudVOsmLcLCURZUPlzx6ZCQYHadfYrikZBEUv3MiYoJFaYjqHyW5wKiegAwBi2fou4kED//VMLYjtzqEguEP5hWx6AG0kCGy4CpfglwAA/Hcz74utPlAAAAABJRU5ErkJggg=="},

            {id:"mx_wash",base:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAfCAMAAAAlbpZMAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OEU5OTA1OTc3NDkyMTFFNDhDN0REM0EwOTQ3OEY2QzUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OEU5OTA1OTg3NDkyMTFFNDhDN0REM0EwOTQ3OEY2QzUiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo4RTk5MDU5NTc0OTIxMUU0OEM3REQzQTA5NDc4RjZDNSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo4RTk5MDU5Njc0OTIxMUU0OEM3REQzQTA5NDc4RjZDNSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pta6TckAAAFKUExURQCgs6rf5nfM1hGmuP3+/u75+t3y9QKhtAOhtPz+/qXd5Dy2xeDz9gaitfv+/vH6+/r9/tDt8a/h53HK1XbM1hCmuIrT3JLW3yStvtHu8QShtNbw857b4pPX32DE0E+9ywuktkG4xq3g5wqktrrl6nvO2AejtcDo7I/V3g2lt+f2+JXY3/X7/GTF0bbk6b7n7Kjf5QWitNLu8qvg5ki7yDe0wzCywR6rvBmpugmjtun3+Mbq7iauvqnf5W3J0/P7+8Pp7Tu2xT63xd7z9ZnZ4dnx9A+mtzKzwrHi6Mfq7mHE0Cevv5va4fD5+/f8/afe5aPd5FvCzobS25/b4iWuvrfk6iKtvVfAzTi1xEe6yITR2vb8/Pj8/RSnueX1927J1BOnufn9/S6xwXjN13nN1zSzwojT3Nfw883s8N/z9ez4+ZTX3+b2+P///9Z1fS0AAABudFJOU/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8AoAU8MwAAAShJREFUeNqE0WVzg0AQBuC3LQQChGijjdTd3d3d3V32/38tFNK7g3T6znCwPDMsewdiMQ2uILBHY15JXFWS3RUAD1GfzBbwk5YXSZSBNMrRDUHWq1minj5B93IWTgILJtFFnkiLe2QGDRQpXRNtZrdFmTy4IercIupri/gm9eQ/kTemRmvcrGq87IPPGpOvLJKZgJV3Wc4V8cwkCZ19f0JF5leGcci1rsdtWTqUfpmTFO52XHlCuorLJ5ByZFqFN2NhW95C8KdgyznaR8TXoTOghyArmKOlcV72KNZ4SugFtMuE0KpbasYJYRBQaz1drFq5RwyVs4ymP+QY9JG37nXcpLpdL0rWpOESjvgja7X+23R25xFx4TSLGHL3TcpJggRfu6z1W4ABAJ4Yu611dioFAAAAAElFTkSuQmCC"},

            {id:"mx_mechanics",base:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAWCAMAAAAcqPc3AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QTVFMjZGNzQ3NDkyMTFFNEJCNkVCQjlDMTZEQkM2RDIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QTVFMjZGNzU3NDkyMTFFNEJCNkVCQjlDMTZEQkM2RDIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpBNUUyNkY3Mjc0OTIxMUU0QkI2RUJCOUMxNkRCQzZEMiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpBNUUyNkY3Mzc0OTIxMUU0QkI2RUJCOUMxNkRCQzZEMiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PhQq0zwAAAF6UExURQCgswqktgOhtAaitQWitMDo7CCsvc/t8RWouQejtRSnuSOtvWjH0qnf5bjl6srr7+/5+vD5+83s8BKnuN/z9bfk6haoujy2xdjw80O5x/P7+/z+/vr9/qrf5uDz9kW6yAukts7t8FK/y2nH0g+mt+75+j+3xu34+gmjtq7h5+j2+IvU3Lrl6uL09mvI0wykt9Pv8tHu8VjBzTe0w3/P2XfM1tDt8VfAzSmvvwGgs3rN1x+svHLK1Zva4d7z9er3+Uu8yQijtS6xweP191C+yzCywUq8ya3g5zW0wwKhtDq2xOb2+KXd5A2lt069yrXj6TSzwvL6+/n9/T63xW7J1Mbq7lnBznTL1n7P2W3J04XS2/f8/R6rvF/Dz2fG0tbw88Pp7bHi6BCmuDi1xMXp7tfw88zs8BmpuorT3I3V3fT7/JfY4GzI0yqwwLLi6C+ywabe5PX7/Oz4+Q6ltyStvt3y9YDQ2S2xwE29yqHc4xyquzKzwgShtP///96xcTYAAAB+dFJOU///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////AMw+5nIAAAEwSURBVHjaTNEDl8NAFAXgG7Qpt3a3a9verm3btv3++w5SzDlJ7vsmozOgG8pr9V8O+32KBQStC+9ZvgOgu3nCFFDdnpS8w1g7FhFulhEVuaIYUApENEBDzC2iKETGP/pADUUx9fKQV9d8qH2RqAMqOMyp4Wb2+eYOrWYbsEHOoNsMolFVdPSwp0s6TWoBP9E+zKZ3mk4P2omnxWqyOkAZp9DwaxOwsQdMrx5RzqmV/bhFiajxIs5laryU8Z9lfTMua9ODI4wn5hUFkeU8tzgYjyWu+KIzvqzf6qyOrewqYjenPulJF6/anokO5DaXvNzTlTx/evlAl+z4rSLMisO81cr1G2VHGaEuMjiOn1TmFGucyz2Es8eQ03aeu+F+IHDB538Kd/vzr77XWcLe/wIMAGloij7fyi7NAAAAAElFTkSuQmCC"},

            {id:"mx_bars",base:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAbCAYAAACa9mScAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OTA5MjkyRDM3NjE2MTFFNEE0QURBN0M0ODM2Q0E0OEMiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OTA5MjkyRDQ3NjE2MTFFNEE0QURBN0M0ODM2Q0E0OEMiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo5MDkyOTJEMTc2MTYxMUU0QTRBREE3QzQ4MzZDQTQ4QyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo5MDkyOTJEMjc2MTYxMUU0QTRBREE3QzQ4MzZDQTQ4QyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PkxXSeMAAAFpSURBVHjaYmRYsJkBCkqAOALK/gjE8UD8hIEIwILE1gRiYyj7FxDzE2sIExI7F4m9EoivMhAJkA35hsT+wkACYGKgAhg8hiDHDgeRhutAY/I3EG8B4j/IiouQ2C5ALIfDEFB6WgXEK4BYAdnG2UDciqRQGYjPAbEVFkOmQemtQHwHZkgUEKdgUSwMxPOBmBFN/C+UZkf2ewyUXY0lgakBsR6aGCcaDTZEBhQ4QDwRiP9hcZEiMYaAwCMg/oojILnQ+NJI3kUxBBQT+6HOJwSkkPSgGAJKLw7IgYUH6CGlK3lyU6wJEtuKHEPMgZgbiR9KjiG9QFyGxA8ApW5SDDGGJoFNSGKghJhOiiES0NhbjiauSqp3nkDzGTL4TYohn4H4NhAfQBcnxZAfQOwOxKvRxD+SYshzqGsWo4m/ARnynQgXgMALaKa7jW44KLl3AnEhcq5EAg+geYoBWhwuA+JJQHwWyYINAAEGAKeWPkoGWkwjAAAAAElFTkSuQmCC"},

            {id:"mx_fastfood",base:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAUCAYAAABiS3YzAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MzQxRDFGOEU3NjE3MTFFNEIzNjhGNzc5Mzk0ODYwQUIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MzQxRDFGOEY3NjE3MTFFNEIzNjhGNzc5Mzk0ODYwQUIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDozNDFEMUY4Qzc2MTcxMUU0QjM2OEY3NzkzOTQ4NjBBQiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDozNDFEMUY4RDc2MTcxMUU0QjM2OEY3NzkzOTQ4NjBBQiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PqjymzwAAAIUSURBVHjalNRLSFRxFMfxq40QLloIpQUKibSRIqKELEPToNKoiDAoK0VB0EgX0sYX1EYNTLDIiLIXaAmlBRYubFcpg5ZEr0UR2YNwk1GgWH0P/Ab+XO6MzYEPw517Off+z/+cf4LXe98LiETk4yC2YAX+4jsu4oIXI0K+6wQcQhNmcQVnMK37ORhEJhr0ophJV+IG0lGH4YDnx7Ado1iKE0GJE/WbjTA+Yn2UhJF4pdLsxXUkBSVNwUPcQwV+e4vHa+RhAx4gzZ/0NGa0lHjiAzbiHV5gv5u0FJew4MUftqpa5WjHAFbZRi2JtotxhG3cKdzBt5Bao0N1sbpOxvkS64I2HMNR3LLlX1bBf+KsdteWlPwfCbPVZlbbTRhxW+q9vrYQxXrIku+JksyGpAZPcRfluIaTblKLw/iKTnRrKfai276WWY4hDcgOvMU4Nkc+wk16HKm68UTNnYuXmEAVduI5PmuyrEw3sUw51mK1O6atKvpWjW89DmhJ29Cil1bp+WcabX8UhJw3pCmBFf+cJi1DNRvWyTSHIygLSDaPZvRGkk7p5OlHlv57rP8s8S5x44ez7Dfak7C/poP6ylrVbA0qdfS50zaiLunXdY9aMuw/pSJhyzuvr+3Uzv/Bbu3wVW1kEfZpM6vxK9Yh7c60DUIfutRedj58wSPdX6cWXPTk98cndUCJTjOrcaP6OOoo/xNgAOiKdzMVDAjHAAAAAElFTkSuQmCC"},

            {id:"mx_restaurant",base:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAVCAYAAACkCdXRAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RjAzMUNGMDA3NjE3MTFFNDg3N0M5NzlCNkQ2ODFCOEMiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RjAzMUNGMDE3NjE3MTFFNDg3N0M5NzlCNkQ2ODFCOEMiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpGMDMxQ0VGRTc2MTcxMUU0ODc3Qzk3OUI2RDY4MUI4QyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpGMDMxQ0VGRjc2MTcxMUU0ODc3Qzk3OUI2RDY4MUI4QyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PsPjCzkAAAGFSURBVHjapNRLKERRHMfxe80QKc88FtggG0QesVTsZeWRhaWNnWbBVlFSNtPUbCxJ2ZCFhR0bFl6RWEgW3iymCXl9//VXpzv3ztwxpz7NuXPP+d3zuOfa1tK65VE6MY4u5MDGNhZw6tYhyyNoGvNYRhtq0YhNrGLQrVPQqLdqpzz0oRcfxv041rCjI4whgCsc/oXl69M+cYBuTDmCzHKHSbWvS5GNAZs1i1I5waL1/zKBZgm7oVKD7wzCZHPOZQPeMgyS8oMvCbvVdcqktOM6YPUP71FZ0XdJgl/SCGnAKGYwJiM71uQKbKU5og0UoAdntuMEXKIujbAL1HudgLhO10+Rdu/JjtMjSlw6zrr8J+0ekoU9G2FyrMJaH9LfsK6RlFI8pQorM6bR5Lgv10VaL9f2nmH3+kQ/JWGaQZeRjegO5aIKIZ1aSK/lYL+iA7upwgq1Lscs4tiAiNG22LlmQZfdPMKcj2lW6olJ+mr4XbOE3XSegGr94MV8hMkHscXc0V8BBgCC/FIp7b8hGgAAAABJRU5ErkJggg=="},

            {id:"mx_fashionaccessories",base:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAQCAYAAAAMJL+VAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NTdCOTRBMDM3NjJBMTFFNEIyOTFBN0ZBQUU4NjQ5NDUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NTdCOTRBMDQ3NjJBMTFFNEIyOTFBN0ZBQUU4NjQ5NDUiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo1N0I5NEEwMTc2MkExMUU0QjI5MUE3RkFBRTg2NDk0NSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo1N0I5NEEwMjc2MkExMUU0QjI5MUE3RkFBRTg2NDk0NSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Ph138UMAAAH6SURBVHjapNRNSBVRGMbx8d6rKSiRSSmCLTRE3YRZEqYoLYJWImko0kbSdBFCBEG0CA1CcaOE4EpdiLiwhbUPijK4pmiKiApifkBFfqRGeNH/oefSMJyp0AM/5s7wzpk573nmxji9I45lXMQrHKAC7x37uIohBHENn7wFActNCRjEGlYxjBRL3Xm8xLpqBxD3Pw9oxT6KUKZrzy11XYioxtSewKN/PeAKGlGLXWyhDTeR6KpLxnU8wyZ2UIP7uOCeMMa1B/EYR59u/FPjOHmW/hbjnVYRHQ9xC4X45V3BY/Wy3TPRgW3zGG88kzu6d8PdqpArNXd0jDhHH+be2wjjBSYCilgzqrDsHH8sq01mPwJmBWmY18beQxJOqn0mTStYwEfMqGWZWm0OzuGU9mpbwZjDJFJDils5ltChSVbUvnRkoQEPPG86jU49/Dv2VJ+rt69DgUlRPj/eqk09PsvOxixe67xUyZrxqa9HNy6HtPQp/PhLX+d0bFHmR/VAv2HmmsBYNEWb6qPfOKvjlOvaGf1N2IaZ67P7O/iAaiXKNsyXvIgvYpJS6VMbVCLDv0/Ka6JvZjbmhibYUKYz1M+n+hDHNMlPBSKiQJj0nEaJQpOp72ov2qKvuKSYdmhTg5rApOUu+l1v2a0+N+EJYnXdbPqIIv/NXDgUYACitHws7/7k+AAAAABJRU5ErkJggg=="},

        {id:"mx_fashionwomen",base:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAXCAYAAAD6FjQuAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MkIxRkJGQjg3NjJCMTFFNEE1NDZEQjJFRjI2OTUzNzEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MkIxRkJGQjk3NjJCMTFFNEE1NDZEQjJFRjI2OTUzNzEiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDoyQjFGQkZCNjc2MkIxMUU0QTU0NkRCMkVGMjY5NTM3MSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDoyQjFGQkZCNzc2MkIxMUU0QTU0NkRCMkVGMjY5NTM3MSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pim5gyIAAAGcSURBVHjatNZNKARhHMfxXa3ykqyyXJS3A7VFOSBy4CCOLpK7g4PCgQNxoZykZAup5aKUk4sUBw4bF4m4Sg6ywspbCN+nnqnH0zyzaWb+9al5nmea3zzP7DyzwUB8K+BjjSGBPdEI+RgUxSRe0YrjDJ+CglhEJvKxibBfYX1oVtrlYpZ+hBVjxqa/24+wWRTY9Ee8DmtHr2Hs1MuwXMQcxte8DJtGpWHsDitehTVhwGF8Hs9ehGWJu4Z6rR/E5fGHtbxehE2hWmm/oEfuHqIO5DK6DuvEsNJOoQ0bSl/COnATViKXKqj09eNIO+/EbVgE2yjSZrBuc+6lU5i400KHoFIZFNX6xw3nX9mFtWAVj0jiQe5xeciW4wu4QJ12wV3rm6XVO26thvieNWAJNdqJYYxiRHsuen1h0DB2rTZCcjZVab5NTiXeoTPDWEptiGW8d/GLTCrvk1296WEdGMKhfPP/UxPyGZsqpIc9YQ6NqJDBO/LhOtU+lh3GxTb1+fd5mP9d5cgNth61KJOvhHCOLtykuSExmW+r8SvAAEOjSjfDmjoFAAAAAElFTkSuQmCC"},

        {id:"mx_fashionkids",base:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAWCAYAAADAQbwGAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NDk5NDVEMkQ3NjM0MTFFNDkxNTI5QUY5MjQ2QUVDRjIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NDk5NDVEMkU3NjM0MTFFNDkxNTI5QUY5MjQ2QUVDRjIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo0OTk0NUQyQjc2MzQxMUU0OTE1MjlBRjkyNDZBRUNGMiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo0OTk0NUQyQzc2MzQxMUU0OTE1MjlBRjkyNDZBRUNGMiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PnxV0F0AAAGMSURBVHjarJVNKERRFMdnxiRWioi98rVRJKspOwvlM1vD1kJhRVHS7KZY2ViwsPdRYkOhZCVZsLKwkI+EiDEZ/E6dV7frvmbejH/96r137/3fc8+5975waGUr5FAtTMA67FptDTAOq3BkDwxbhmGYghkohldIwilkoA4moUb7L8MopP0Mkzp7EMkq+uBHXiJGQ38eZqIemLYjLIdLqAzlpy9ohTMvwkQBZqIoLEmAEmEbD8fW8vPVgJjE/slM1BjRyq4ZHz8DGGSM50Pximq5R6AC3uEcZnM0lFTtQRx6Zby31LR+GIRUwGXK5FKHR686nlIF5O7OLLetZ7jK0egm21kuWK4I2/U4eSqBUn1+gW+j7QC2s0V4oknORTJBlXnb2Bs6FsBMVKZbJuQyLIJFn4G3sO/TltA9/MdwGJp9Bi3oiXJJzOZcObyAescAyWmH7tNN6HL0kRxWw1PEuPrn9Uw/GB3voRs+9IjGrb33Bhswpneis8oySQt0wrX+jEwNQRPs6E8qbTb+CjAA0sJXXxOvFBIAAAAASUVORK5CYII="},

        {id:"mx_fashiongeneral",base:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAiCAYAAACJDyPYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RUYwOUI2OTQ3NjM0MTFFNDhGNDE5QTBBMkNGRjkwMDEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RUYwOUI2OTU3NjM0MTFFNDhGNDE5QTBBMkNGRjkwMDEiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpFRjA5QjY5Mjc2MzQxMUU0OEY0MTlBMEEyQ0ZGOTAwMSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpFRjA5QjY5Mzc2MzQxMUU0OEY0MTlBMEEyQ0ZGOTAwMSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PkkxUEoAAAF7SURBVHjazJQ/KEVRGMDvfR6TQU/YxPNvMUiUSZGBkcnwkrK8DBYls03JZHiLeiw8icGg/NlENsUgvcEgAy9/Ul7yyO+r7+p0vXPvHX31e+fcc36dzjvn+47rZPccX3TBNgxD3pyIOX9jEFqgzz9RTi5oW4wi92s7ECS7MAGT+p2Gcb9cD0twA2tQoXPSbsA1LEJDnJ8RmHXs0QFzcCUrH8O3Exwl2Bf5Dk5DZFmw4P3BXIicM09jEz4t4gfsmrJcxJFFPoQX/znb9n1e7lKSFrnZL3dDyiKndP5XXoZKi1wFGU+uNZLHFr3QJHKbJlFYJL2Vo4Qr8mtE+U3k+4hyXuRb74YC4hGeYpqeZyHyhXnOW/AAz0ahFjVnZGzHlLNSNpCABR2Ttk7HMrbqtsY/lSVHGrXf6pfjRr9GS6hHv6e0/mbgy1xZVlxVsaRjUsDTsGJuQ7JuHcbgRMtoHtq1/tL6vCVcHvNLOp1wAKPwbmytWp+BIUmkHwEGAId3SBr4SduIAAAAAElFTkSuQmCC"},

        {id:"mx_uniforms",base:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAcCAYAAAC3f0UFAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NkI1QTUyNzY3NjM1MTFFNEJGRDRCRUVGNTY0Q0Q3QTciIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NkI1QTUyNzc3NjM1MTFFNEJGRDRCRUVGNTY0Q0Q3QTciPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo2QjVBNTI3NDc2MzUxMUU0QkZENEJFRUY1NjRDRDdBNyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo2QjVBNTI3NTc2MzUxMUU0QkZENEJFRUY1NjRDRDdBNyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PiDu6BQAAAFaSURBVHjalJTPK0RRFMffTJOSJGVhp6RkY2OFBXYW2Esif4G9nbJno4iahSxoVpYKSVkYCxaMGUlTyCQlYWYiPqfOq+P2fvROfTr3vPN99557z30v5WX3PGNtsAmjcApzcOcn095/W4QJaIAhWLVJV9ztxF1R4p2oOOMk1+ANhuEC1m0y5Www0mwZ7eq3IA/7Go+74k6zZB361IstwIwVL8Orjs/Un6gvwQq0inhAl7oOERegBWZFPK0Pr9RfwpR5qaR+TI6uX4OiqXnbbLygvldm7tDgPuTEbuFX7o2IG6ECtRDxJ5ShKmW8wFNMP4q+WBrwAxswEiDMq/gmox0bhB5tjtg7NOv4EQ7hWGrO6QtNZracM3tWjjatOz13kmUnrgbdZ9++4m5doiv6nUT8kUTsxdVvxbWQkupxZTzHlbFrOnZgZqwE/QrkM1+CI3iQLwMmYd4X/AkwACUsUI3AXpeeAAAAAElFTkSuQmCC"},

        {id:"mx_foodstore",base:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAVCAYAAACzK0UYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RTE4OUE5NkE3NjM1MTFFNDgyOURDNjIyNkQ5REZEMzkiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RTE4OUE5NkI3NjM1MTFFNDgyOURDNjIyNkQ5REZEMzkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpFMTg5QTk2ODc2MzUxMUU0ODI5REM2MjI2RDlERkQzOSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpFMTg5QTk2OTc2MzUxMUU0ODI5REM2MjI2RDlERkQzOSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PiPq5pIAAAG6SURBVHjavJVLKERRGMfPzBivGCMym8lG3lGs7ISSyDRZTimiWMjYWbASa2WjrGZjRVnIRsmCFJkNUV4bZUEe5bUy8T/63/o63Zmmef3rV+fc75z7P/f7zjnXoSLbSqgHzAGPSl0fYAHsWw/yjAFDoEulr0tp4jSC3yozepcd08SbIRNvIpPGDJm0yo6sSQULvsznB2AarDAeArvgGVSCANhibITz9MZ5Y1194NE0GQOToAMcghMQBBuMt4MdcA+qyRpjnRz3BJq4uHGwJNPl4ScegWZwkWKazkELF1gLiqRJWKQlH3ylaPLKNGmtginLRO+EerrrfiyJ3VZo9GXaC4ALHPOrSvRLB4F17Gu4Gks+TtAq1xPYLgVuMa5KtHVdGtjeAwMuFQz9oDHB4DzoA9egF4wCP6hjSv0cN8udpMf1c/4LFxVmZh7AMFh38O7SRTpN886yu8P0jry1cnlDk272N8GdMUl/WVucmDJqMgPOtIFZMJdoR3gmpDw0sYtJldHk1+5acaksyamyp89cmMRyYeKO92dMRossbDxZ7yy2M7myLjQeooAxWd+6UXH6EynK9/3rT4ABADvoT2PLrwq2AAAAAElFTkSuQmCC"},

        {id:"mx_fishandbutchers",base:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAMCAYAAAB1Lg0yAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MUEyRTIwRUU3NjM5MTFFNDg1NkNDOTk0RDg2Nzk5NTAiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MUEyRTIwRUY3NjM5MTFFNDg1NkNDOTk0RDg2Nzk5NTAiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDoxQTJFMjBFQzc2MzkxMUU0ODU2Q0M5OTREODY3OTk1MCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDoxQTJFMjBFRDc2MzkxMUU0ODU2Q0M5OTREODY3OTk1MCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PuvmejgAAAFKSURBVHjarNRPKARRHMDxmeWwbVJKKRdpb06uqyiilJObqD3JfQ+rTTm5OWgve5JSlFw4UJRSsjkohLPaPShJDSH/1vL91W9qembssPOrT73e682veb/fe7a1vGWFiATicPBlRRCNv6wNYByD6NC5J1ziAqc40fFHFIn7sYBun7UmpJQbrzjGATZxFiZxzDNuxir2A5IGhZSgD7N6ChtI1tjT5ibu0k0TEZRvVMsxj3afdSlbzqa5ehhso8WKPj6xhx1coRPTOJQaX+OuRuKqUZaw0YBh9aPGZa3RecDme8zU8ddyExaRx7PZXDfazUWfjXN4/2fSFW20KWTQiwezq+VxGMKSZ07qUkDrHxNK+UaQxq1nXq7amJTOvMdyJyexhqwez5teNTMcJX/wokdawhHW9Vt+sSsnbId8MuP6eEiXVvBYb7t/CzAAI+FIwdi6j4IAAAAASUVORK5CYII="},

        {id:"mx_sweets",base:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RjkzMDVCMEE3NjM2MTFFNDlDM0NFNzUwN0VERjc1QzMiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RjkzMDVCMEI3NjM2MTFFNDlDM0NFNzUwN0VERjc1QzMiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpGOTMwNUIwODc2MzYxMUU0OUMzQ0U3NTA3RURGNzVDMyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpGOTMwNUIwOTc2MzYxMUU0OUMzQ0U3NTA3RURGNzVDMyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pth/HvAAAAIUSURBVHjapJTJK4VRGMbPxQKXzJkKWUjJpQxdUSLKzEJZKit/hLKwtLFSMiTK4i6kkCnKgkwrGbLhmi4yJEPmy/PW89XxuYT71K/zfeee89zzve97XovqH1UeFAKqQDFIA7EgArjBJXCBFTAPZsGt2cBiMo4BraARBKjf6Q70gTZwYUz6aAvKwCZo/oOpqAvUcm+p2Vg+WY4erv6uVWADi2AM5BvGgWAA+Kn/qQbcgAawQS+rGFeCePV/VQN/8AzaQTKoEOMk5Z2CQR2fjzkmi/GJ8l7NHOs5uiSuU+DVixiLCkEvy/QNzMiJz5lNb9UEfMEcODXKrZvjK+tR1xQTY0hOtAC2+f4O9rXfh/Q6ngSHDEcJSABnYIcXRzL/wussWS+g2TXIBUX0eQTDurGb9SfK45+IaRjnptkbxPiAc4m8HGsgk3NjrOlPV9rB0c5RThSlJVVO96StlzJ1mvY4PPWKdbBnMraASL4/aGuj2U904yfm44uxaAZk85TGpjiOegITOTq5Npst9OY74wX2DhvjrBgOQ7daGERHIIN75nUjHw+dSpTDZq7Y5EVWJlk3PmFViJZ+Mt5h47ZrxsaJ5ZODTKFw0Vhqe/knYzcXSMldsS7LQShLylczlnjec+0an781Fk2AFDDC36X4t9hahQ6QxVY5zrWdZhNPjaeHMU5lcgztav3XzaucDlrAoNnkQ4ABAFw9fFcubPWCAAAAAElFTkSuQmCC"},

        {id:"mx_bakery",base:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAXCAYAAAD+4+QTAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QjU0RDg4QTg3NjM3MTFFNDgyOTBCQzBFMUQ2NEFFNjEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QjU0RDg4QTk3NjM3MTFFNDgyOTBCQzBFMUQ2NEFFNjEiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpCNTREODhBNjc2MzcxMUU0ODI5MEJDMEUxRDY0QUU2MSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpCNTREODhBNzc2MzcxMUU0ODI5MEJDMEUxRDY0QUU2MSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pq3zOZwAAAHQSURBVHjarJZNKERRFMffMGHK14LyESVF+YxIpFgolNlJSqwG5WODjbBjIcVSssBsjJVkYcFSyihWSFZYiCyYmKIY/6Nz6za9d+de/OvXzOvde//vnHvuec9lre9af1AcSANv4MNpkNtwwQbQCmpAJciW7j+BC7AP/OBW3HBpRJIL+oGP/+voE6yBcRBSRZIDJtkg0TCN8fxQ9aDJziQDTIMB4LH+plKwJJvQgmNgAqRb/6dOYdIFFkA+uAYBcAXCHBltchtI/YWJh0zawRY4Az3g0GEwRTcLhg1NgmQyyAaN/OROegYj4J3TqqMImBK1vxLDQNacQRS0vwdkkgleDSa+qE63pHmwKE6xOBO6KgQJMcZQamfkVhHmlOmqW2MMVWG5bHLC5Zmi2b98muNW5Qsq2STg1ZhMD5OnGXE1KBAmokP2akz0GqT1S1QsmQS5LbeArBgTmw1MNsGDMIlwG3HzibcUJ75Y02CPG6wll7Cff/sUE2t/3j9q3YMh0CEfbmFyDk5BBahyWKBOsfglGAVFYJn3w/b1u8EVQbm8s1moJOr6Bmxzqo9V4ckmAa4w+jAoA8mMUAgc8Tt8h5uqlmSTR8673YaHolNgom8BBgCSKlN8qRW12QAAAABJRU5ErkJggg=="},

        {id:"mx_mall",base:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ODk3OTQ5OEE3NjM4MTFFNEFFNTBGQUFERkI1Nzk4MTQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6ODk3OTQ5OEI3NjM4MTFFNEFFNTBGQUFERkI1Nzk4MTQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo4OTc5NDk4ODc2MzgxMUU0QUU1MEZBQURGQjU3OTgxNCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo4OTc5NDk4OTc2MzgxMUU0QUU1MEZBQURGQjU3OTgxNCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PkgXUYUAAAIeSURBVHjarNXNS1RRGMfxMzoFMkVh+IKLMqh0IEGQojZFUKK4iMpFkFAJUdvAhdEf0GKEokUQSM3KhaVEw6CmvUhQoIXVQLuStFVoCZVNjabfI7+h2zBz71xnHvgwd45n7nl7nmPARGO9xphG8y/+YgjXkDQFRhDf0ZTRvg8NOFnoACW4jG2oQDm24ylO4GAxBrDxFXP4hllcV/upYg2QGWP4hdZinEG2sC9/gjYc0wr9xAo+YT7o0imuAR6tc/LLuOo1QPp8Hjvat6AZffihFLeJ8dDRpwrH0eI2wAwS2Is7GFa7Td93uKI+3VrpRcdvL2iAF0GPZcb1wvsYx09s1d9uYRH12IlRFWkAB7CE2yUeAzzQZwgTeI23akvo+7xSfEyJsRGb0W9X6LWCSXxBJd7jHsLo0hl8RrUmcEOz79Bve8xaQzTmlQ1RnNWS51TxpVn62e35jTKM2AN2K7Rs2ZTUwR3V9zOo08zfYD8+OmfvVmjOsHWQwiYdZkjtAccE7er2aPumdB4m3y0yOrwjeRZYOwb8rCC9TXaAabzK0WdJt/BAPndRtnSN6CU2S/4UetllxgcM6vp+rlku5Oi7oHRe8TOAjUtK0UPKGLewtfPM7wC2Bg7jHGpU2QFlVUgX4IjO6aXfLUrHadzV83kVoVGVh7WycD7/0XLFbsdzvT43YIeea3UXmfWu4CZ2aWsiaktp2zq1uv8ybFWAAQAAf3XUWOaCYAAAAABJRU5ErkJggg=="}
        ];
        function getSubCategoryIcon(subCatgCode){
            var imageName = '';
            subCategoryImages.forEach(function(data){
                if(subCatgCode === data.id){
                    imageName = data.base;
                }
            });
            return imageName;
        };
        var settingsObj = uSpendSettings.getUSpendSettings();
        $scope.person = {};
        $scope.person.subcatg = settingsObj.subCatg;
        $scope.merchantsubcatg = settingsObj.merchantsubcatg;

        var merchatsArray = new Array();
        console.log('Fetching subcategory of ' + settingsObj.catg);
        merchatsArray.push({value: settingsObj.catg, desc: "All", imgName:getSubCategoryIcon(settingsObj.catg)});
        settingsObj.merchantsubcatg.forEach(function (data) {
            var merchantObj = {};
            merchantObj.desc = data.description;
            merchantObj.value = data.code;
            var imageName = getSubCategoryIcon(data.code);
            merchantObj.imgName = imageName===''?'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAATCAMAAABBexbDAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RTA0ODY1Mzg2RkQwMTFFNDgyODRFMjExMzQ5NjQwRUYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RTA0ODY1Mzk2RkQwMTFFNDgyODRFMjExMzQ5NjQwRUYiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpFMDQ4NjUzNjZGRDAxMUU0ODI4NEUyMTEzNDk2NDBFRiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpFMDQ4NjUzNzZGRDAxMUU0ODI4NEUyMTEzNDk2NDBFRiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pm/xFr0AAAB7UExURQCgs7Tj6Q+mtx6rvES5x+75+lrCzsPp7WnH0jOzwofS2/T7/Pr9/kG4xoPR2tDt8RSnufD5+7Pj6E29ynvO2Ea6yI/V3kW6yLjl6ji1xAqktuP19zSzwiywwJ7b4gWitMvs8Da0wyGsvTq2xByqu+/5+gOhtN7z9f////ey7kUAAAApdFJOU/////////////////////////////////////////////////////8AUvQghwAAAF1JREFUeNq8yEcOgCAABdFvQQXsvffC/U8oGxNh58ZJZvNQbvarIhSohBb6zj+ILKGUMk6IDwuGCZkr9xzA+Cj7qUk2p7ki0dg2lyKBPB7e8vSvrJrUYJMiC78FGADK+gbhldxADQAAAABJRU5ErkJggg==':imageName;
            merchatsArray.push(merchantObj);
        })
        $scope.items = merchatsArray;

        $scope.AddItem = function (obj) {
            var settingsObj = uSpendSettings.getUSpendSettings();
            settingsObj.subCatg = obj.value;
            settingsObj.selectedSubCatgDesc = obj.desc;
            console.log(settingsObj);
            uSpendSettings.setUSpendSettings(settingsObj);
            $state.go('tab.group6');
        }
    })

    .controller('Group5Ctrl', function ($scope, $http, $location, $state, BBVADataAPI, uSpendSettings) {

        var settingsObj = uSpendSettings.getUSpendSettings();
        $scope.person = {};
        $scope.person.spendingTrend = settingsObj.spendingTrend;


        $scope.AddItem = function () {
            var settingsObj = uSpendSettings.getUSpendSettings();
            settingsObj.spendingTrend = $scope.person.spendingTrend;
            uSpendSettings.setUSpendSettings(settingsObj);
            console.log(uSpendSettings.getUSpendSettings());
            $state.go('tab.group6');

        }
    })

    .controller('Group6Ctrl', function ($scope, $http, $location, $state, BBVADataAPI, uSpendSettings) {

        var settingsObj = uSpendSettings.getUSpendSettings();
        $scope.person = {};
        var startDate = new Date(2013, 10, 01);
        var endDate = new Date(2014, 03, 30);
        var monthsArray = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        $('#fromDate').mobiscroll().date({
            dateOrder: 'MMyy', dateFormat: 'MM/yy', minDate: startDate, maxDate: endDate,
            onClose: function (valueText, btn, inst) {
                var fromDate = "";
                var selectedMonth = valueText.split("/")[0];
                var selectedMonthTwoDigits = monthsArray.indexOf(selectedMonth);
                var selectedYear = valueText.split("/")[1];
                if (selectedMonthTwoDigits < 10) {
                    selectedMonthTwoDigits = "0" + selectedMonthTwoDigits;
                }
                else {
                    selectedMonthTwoDigits = "" + selectedMonthTwoDigits;
                }
                fromDate = fromDate + selectedYear;
                fromDate = fromDate + selectedMonthTwoDigits;
                fromDate = fromDate + "01";

                var settingsObj = uSpendSettings.getUSpendSettings();
                settingsObj.fromDate = fromDate.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
                uSpendSettings.setUSpendSettings(settingsObj);
                console.log(fromDate.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, ''));
            }
        });
        $('#toDate').mobiscroll().date({
            dateOrder: 'MMyy',
            dateFormat: 'MM/yy', minDate: startDate, maxDate: endDate,
            onClose: function (valueText, btn, inst) {
                var toDate = "";
                var selectedMonth = valueText.split("/")[0];
                var selectedMonthTwoDigits = monthsArray.indexOf(selectedMonth);
                var selectedYear = valueText.split("/")[1];
                if (selectedMonthTwoDigits < 10) {
                    selectedMonthTwoDigits = "0" + selectedMonthTwoDigits;
                }
                else {
                    selectedMonthTwoDigits = "" + selectedMonthTwoDigits;
                }
                toDate = toDate + selectedYear;
                toDate = toDate + selectedMonthTwoDigits;
                toDate = toDate + "01";
                var settingsObj = uSpendSettings.getUSpendSettings();
                settingsObj.toDate = toDate.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
                uSpendSettings.setUSpendSettings(settingsObj);
                console.log(toDate.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, ''));
            }
        });


        $scope.AddItem = function () {
            var settingsObj = uSpendSettings.getUSpendSettings();
            uSpendSettings.setUSpendSettings(settingsObj);
            console.log(uSpendSettings.getUSpendSettings());
            resetChart();
            $state.go('tab.spend');
        }
    })

    .controller('Offer1Ctrl', function ($scope, $state, BBVADataAPI, uSpendSettings, PredictionAPI, $ionicLoading, $ionicPopup) {

        $scope.categories = [{
            code: "mx_auto",
            desc: "Car",
            imgName: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAKCAMAAACdQr5nAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QTA3QjE5N0U2RkQwMTFFNEIzQTA5RURFRkE1RjAyNkEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QTA3QjE5N0Y2RkQwMTFFNEIzQTA5RURFRkE1RjAyNkEiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpBMDdCMTk3QzZGRDAxMUU0QjNBMDlFREVGQTVGMDI2QSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpBMDdCMTk3RDZGRDAxMUU0QjNBMDlFREVGQTVGMDI2QSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Ph3JvpwAAADeUExURQCgsxGmuMzs8A+mtwijtXjN1xCmuJbY4AGgs8vs8A2ltwejtQqktmrH0yuwwBWoubHi6Pz+/jy2xQWitFzCznPL1ZTX31fAzbnl6ki7yEe6yOX192nH0vT7/GfG0p7b4lbAzYbS2xyqu3LK1c/t8Smvvyivv0q8yUa6yL3m62zI05DW3l7DzyCsvfP7+8Pp7T23xd3y9Tu2xTq2xJ3a4t/z9XDK1COtvUu8yaHc45XY39Pv8mXG0UO5x6Dc45rZ4ROnuX7P2Te0wz63xej2+I7V3QaitQykt+b2+P///0bE5X8AAABKdFJOU/////////////////////////////////////////////////////////////////////////////////////////////////8AWiu/GwAAAJ1JREFUeNpsz0UOxDAMQFGnmHI7zMzMzOz7X2jSSlOl0ryFFetvHEDEURoUQkxKmISHP4C4b0GBvVTR3/slLmV0yHphQrkXpm0cnK7AyG9/Ctott9CKQarBH3S4kV2QwLHqdrTMVweRBely0l/JGV8qFiUpCSA2uLtL40o4ZyW/m3Sa7PhjWTMeyPko02c7+Nd4LaoYUTXtBuJXgAEAiiYja88++2EAAAAASUVORK5CYII="
        },
            {
                code: "mx_barsandrestaurants",
                desc: "Bars And Restaurants",
                imgName: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAaCAMAAABigZc2AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QkVGOTU0QjE2RkQwMTFFNDg5MUFDRjI2OTcwMjc0MjciIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QkVGOTU0QjI2RkQwMTFFNDg5MUFDRjI2OTcwMjc0MjciPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpCRUY5NTRBRjZGRDAxMUU0ODkxQUNGMjY5NzAyNzQyNyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpCRUY5NTRCMDZGRDAxMUU0ODkxQUNGMjY5NzAyNzQyNyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PrufNrMAAADYUExURQCgs6Xd5N3y9VXAzIjT3HfM1h2rvFbAzdPv8g2lt/H6+4nT3Pb8/E69yuT195LW3/j8/eP191jBzf3+/uH09i6xwRepuvr9/njN10e6yBuqu3vO2GzI08/t8RCmuLjl6hyqu/T7/NDt8d7z9ff8/S2xwFfAzfz+/h6rvFK/y8Lo7ZTX34/V3kS5x0G4xhmpuiGsvb7n7PX7/Ei7yGXG0QuktkW6yKrf5p3a4pva4VS/zAmjto3V3QaitXXM1jW0w4vU3FvCzvn9/T+3xnDK1PP7+5za4f///+/EimoAAABIdFJOU///////////////////////////////////////////////////////////////////////////////////////////////AJzs8mAAAACiSURBVHja1JBVEoNQDEVDKQ51d3d39/buf0eFMo8CXUHPR2ZyJjYheEnEAPI5af3jenf4XfxctFzAzcCwIl2XvMNc4fnusUDIL9qsNaMhwmvWvFdWsDntH8KIs3eUFWKUpmxvLWemu/qERBnOLdEmkSGLyRC+DurKrByqcDukWyTd4HXgiMP/u0a/Q5Ww7nLVw/jzvdTlyZy+CTK2MzN/CzAAL65iz3yvtfkAAAAASUVORK5CYII="
            },
            {
                code: "mx_fashion",
                desc: "Fashion",
                imgName: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAdCAMAAABymtfJAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RERFNEI3RkE3NDkxMTFFNEExNTFFODk5NjAyRUQwOTciIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RERFNEI3RkI3NDkxMTFFNEExNTFFODk5NjAyRUQwOTciPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpEREU0QjdGODc0OTExMUU0QTE1MUU4OTk2MDJFRDA5NyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpEREU0QjdGOTc0OTExMUU0QTE1MUU4OTk2MDJFRDA5NyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pu78iWkAAADkUExURQCgsyqwwAKhtLjl6pHW3nzO2P3+/lvCzjy2xfD5+4PR2sfq7tvy9GvI03jN16nf5QWitN7z9XrN1+34+u/5+k69ypLW32PF0WfG0kC4xtHu8XvO2LDi5xmpup7b4pnZ4VbAzfP7+3HK1ZTX35XY38Pp7YnT3BOnueH09lK/y33P2Buqu77n7HTL1hCmuJva4QShtNnx9Em7ycXp7un3+Pz+/sLo7fn9/c3s8OL09iWuvp/b4lG+ywaitQmjtpza4W3J0w+mt1/Dzx2rvFrCzofS2+b2+M7t8DOzwrzm6yuwwP///8zcLj8AAABMdFJOU////////////////////////////////////////////////////////////////////////////////////////////////////wCejeTMAAAAxklEQVR42mzQ1xqCMAwF4CAi4AL33nvvvfd6//cRa8QGPRenX/+bNoHHOyrrId4AzxLrm0W3rKNUA/rUaLeuEhVhJ2n2AwyInuCdNFEPapnoETVBNILqJVpHdRItoIaJZlAXf/8g8TpqoAq8ivCJi1PZVPmrwbWpq7OpdvjGaarAaWqCOgY+HdQsUcHBtNolCkmmLYqgvDTXtqgxCTyKVoSlocKP2twwm/9gP2681txXOLv7ezib47LJh5RrrObVfGw7TwEGAMfOWsfJ3UBwAAAAAElFTkSuQmCC"
            },
            {
                code: "mx_food",
                desc: "Food",
                imgName: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAANCAMAAABxTNVSAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RjRFMjZEMkU3NDkxMTFFNEI2MDZENEZCMzU1RDU2RTYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RjRFMjZEMkY3NDkxMTFFNEI2MDZENEZCMzU1RDU2RTYiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpGNEUyNkQyQzc0OTExMUU0QjYwNkQ0RkIzNTVENTZFNiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpGNEUyNkQyRDc0OTExMUU0QjYwNkQ0RkIzNTVENTZFNiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pvmp3dIAAAERUExURQCgs+H09g+mt/z+/gShtFrCzguktqHc43/P2f3+/mfG0huqu1vCzuDz9gejtVnBzgykt+v4+Ua6yOP197bk6Qqktuj2+Or3+SOtvfP7+6Pd5Em7yTW0wy+ywfv+/lO/zPr9/svs8GjH0jq2xO34+gmjtkK5x1fAzTa0w4HQ2TGywje0w7/n7FS/zLzm62vI0yivvyStvobS25DW3hyqu6rf5mPF0S6xwbTj6e75+k29ysHo7S2xwM/t8Z/b4uX191K/y7jl6jSzwljBzQOhtAKhtNTv8imvv2TF0WLF0BCmuOb2+BWoudjw8wGgs4fS21G+y1/Dz6jf5ef2+PX7/HHK1ZHW3tzy9dfw813Dz////3T3R3kAAABbdFJOU////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wCc+ri8AAAAvUlEQVR42lzO1XICURRE0Z5hGNwtWIK7hOCSENw16Pn/D+HOhQdCP66qrtp4D+B1FhV0jsoLqr9tEKrnz/+4MggQzD7vUXpCUwlMge1lrJcfaPzrSFxPH1K+4dlHUkuGsSx+Room3mDty/avginU1NmBIDP3ELXo1cbOc6t5QmIb0BNIi3ISLqaLMEDiBjNiSto1IGmKGPgVxU7FlXJ1yF0NTyDRwpArUa8Vv4fRVMGHEh2c6d+MQSSOdBNgAGqkHuW7ush0AAAAAElFTkSuQmCC"
            },
            {
                code: "mx_hyper",
                desc: "Mall",
                imgName: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAZCAMAAAD+KQUWAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MDJGMzRGQ0M3NDkyMTFFNDk3QTlGNTFDMEMzMkExQUUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MDJGMzRGQ0Q3NDkyMTFFNDk3QTlGNTFDMEMzMkExQUUiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDowMkYzNEZDQTc0OTIxMUU0OTdBOUY1MUMwQzMyQTFBRSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDowMkYzNEZDQjc0OTIxMUU0OTdBOUY1MUMwQzMyQTFBRSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PrrarwoAAADbUExURQCgs+75+njN1zOzwt3y9bTj6Q+mtwGgs5bY4JnZ4ZPX37vm69rx9CqwwL/n7AmjtgaitdLu8tvy9OH09iGsvVXAzDCywTy2xRKnuJHW3uDz9sPp7bzm67Hi6Byqu1vCzjW0wzSzwlS/zPD5+2HE0Pn9/UK5x/H6+wqkto7V3QShtNXv8vf8/T+3xrjl6hipun/P2b3m6+P199/z9cjr76Td5Oz4+X3P2Ob2+GDE0BGmuBWouS2xwOf2+Dq2xOL09pDW3pTX3yStvh+svAOhtMfq7nDK1E69yv///xBp0ZAAAABJdFJOU////////////////////////////////////////////////////////////////////////////////////////////////wAMCJ9VAAAA20lEQVR42nzS12LCMAxAUZUWMiEEaNmbDkYHe8+2oP//IpLgGGSH3DfnvDiWAEktmNMPQI8WWKG+j+uhLsW99DlFTGua1kXUHy+dClfPABQxCgAq5hVg5WzuWeiYF99xBnjhPtH/0fPaDTsxThmGkfCcFPc94hxikicTob74Quo/DA7DB7ceUm8zXqak93Hdv/jHCAOd9VfGUFfF9393rnLkHBHms26Qf6oK8zO/Cb+9Cl4nvGqK8ydVBtJ+bG44Zsv7Y/5ep9EP2q/ZM2NlfGf/0k9e26D9PAswAFCngFkIj+W1AAAAAElFTkSuQmCC"
            }];
        var access_token = PredictionAPI.getAccessToken();

        function getCategoryString(categoryCode) {
            var categoryDesc = "";
            $scope.categories.forEach(function (data) {
                if (data.code === categoryCode) {
                    categoryDesc = data.desc;
                }
            });
            return categoryDesc;
        }

        function showConfirm() {
            var settingsObj = uSpendSettings.getUSpendSettings();
            var confirmPopup = $ionicPopup.confirm({
                title: '<div class="label-item-content">Confirm category selection</div>',
                template: '<div class="label-item-content-black">Top rated category with best offers in your location is  <span class="label-item-content"> ' + getCategoryString(settingsObj.predictedCategory.replace(/"/g, '')) + '.</span> Do you want to continue?</div>'
            });
            confirmPopup.then(function (res) {
                if (res) {
                    var inputData = {
                        "input": {
                            "csvInstance": ['' + settingsObj.predictedCategory + '', '\"' + PredictionAPI.getToday() + '\"', (settingsObj.gender === 'F') ? '\"Female\"' : '\"Male\"', '\"' + settingsObj.age + '\"', '' + PredictionAPI.getThisHour() + '', '\"' + settingsObj.zipCode + '\"']
                        }
                    }
                    $ionicLoading.show({
                        content: '<i class="icon ion-loading-d"></i>',
                        animation: 'fade-in',
                        showBackdrop: true,
                        maxWidth: 200,
                        showDelay: 0
                    });
                    settingsObj.chCatg = settingsObj.predictedCategory.replace(/"/g, '');
                    settingsObj.predictedCategory = "";
                    $.ajax({
                        url: PredictionAPI.getPredictionUrl(access_token),
                        data: JSON.stringify(inputData),
                        success: function (resp) {
                            console.log(resp);
                            console.log('Predicted Spend = ' + resp.outputValue);
                            $ionicLoading.hide();
                            settingsObj.predictedSpend = resp.outputValue;
                            uSpendSettings.setUSpendSettings(settingsObj);
                            console.log(uSpendSettings);
                            $ionicLoading.hide();
                            $state.go('tab.offers2');
                        },
                        error: function (resp) {
                            console.log(resp);
                            settingsObj.predictedSpend = '0';
                            uSpendSettings.setUSpendSettings(settingsObj);
                            console.log(uSpendSettings);
                            settingsObj.predictedSpend = 'Error fetching predicted spend';
                            $ionicLoading.hide();
                            $state.go('tab.offers2');
                        },
                        contentType: "application/json",
                        type: 'POST',
                        dataType: "json"
                    });
                } else {
                    console.log('You are not sure');
                }
            });
        };
        $scope.getOffers = function () {
            var settingsObj = uSpendSettings.getUSpendSettings();
            console.log('Predicting offers for you');
            var offersInputData = {
                "input": {
                    "csvInstance": ['\"' + settingsObj.zipCode + '\"', (settingsObj.gender === 'F') ? '\"Female\"' : '\"Male\"', '\"' + settingsObj.age + '\"', '\"' + PredictionAPI.getToday() + '\"', '' + PredictionAPI.getThisHour() + '']
                }
            }
            console.log('in PredictionCtrl' + access_token);
            $ionicLoading.show({
                content: '<i class="icon ion-loading-d"></i>',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });
            function SortByScore(x, y) {
                return y.score - x.score;
            }

            $.ajax({
                url: PredictionAPI.getOfferCatgPredictionUrl(access_token),
                data: JSON.stringify(offersInputData),
                success: function (resp) {
                    console.log(resp.outputMulti);
                    $ionicLoading.hide();
                    var catArray = resp.outputMulti;
                    catArray.sort(SortByScore);
                    console.log(catArray);
                    var topPredictedCategory = catArray[0].label;
                    topPredictedCategory = topPredictedCategory.replace('1', '').replace(' ', '');
                    settingsObj.predictedCategory = topPredictedCategory;
                    uSpendSettings.setUSpendSettings(settingsObj);
                    console.log('topPredictedCategory = ' + topPredictedCategory);
                    showConfirm();
                },
                error: function (resp) {
                    console.log(resp);
                    $ionicLoading.hide();
                    $ionicPopup.alert({template: 'Error occurred while predicting data. Please try again after some time.'});
                },
                contentType: "application/json",
                type: 'POST',
                dataType: "json"
            });
        }
        $scope.AddItem = function (obj) {
            var settingsObj = uSpendSettings.getUSpendSettings();
            settingsObj.chCatg = obj.code;
            settingsObj.selectedOfferCatgDesc = obj.desc;
            console.log(settingsObj);

            var inputData = {
                "input": {
                    "csvInstance": ['\"' + settingsObj.chCatg + '\"', '\"' + PredictionAPI.getToday() + '\"', (settingsObj.gender === 'F') ? '\"Female\"' : '\"Male\"', '\"' + settingsObj.age + '\"', '' + PredictionAPI.getThisHour() + '', '\"' + settingsObj.zipCode + '\"']
                }
            }
            console.log('in PredictionCtrl' + access_token);
            $ionicLoading.show({
                content: '<i class="icon ion-loading-d"></i>',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });

            $.ajax({
                url: PredictionAPI.getPredictionUrl(access_token),
                data: JSON.stringify(inputData),
                success: function (resp) {
                    console.log(resp);
                    console.log('Predicted Spend = ' + resp.outputValue);
                    settingsObj.predictedSpend = resp.outputValue;
                    uSpendSettings.setUSpendSettings(settingsObj);
                    console.log(uSpendSettings);
                    $ionicLoading.hide();
                    $state.go('tab.offers2');
                },
                error: function (resp) {
                    console.log(resp);
                    settingsObj.predictedSpend = '0';
                    uSpendSettings.setUSpendSettings(settingsObj);
                    console.log(uSpendSettings);
                    $ionicLoading.hide();
                    $ionicPopup.alert({template: 'Error occurred while predicting data. Please try again after some time.'});
                    //$state.go('tab.offers2');
                },
                contentType: "application/json",
                type: 'POST',
                dataType: "json"
            });


        }

    })
    .controller('Offer2Ctrl', function ($scope, $state, BBVADataAPI, uSpendSettings, PredictionAPI) {
        console.log("Predicted spend amount ID = " + PredictionAPI.getPredictionSpendId(uSpendSettings.getUSpendSettings().predictedSpend));
        $scope.predictedSpend = [{
            range: uSpendSettings.getUSpendSettings().predictedSpend,
            id: PredictionAPI.getPredictionSpendId(uSpendSettings.getUSpendSettings().predictedSpend)
        }];
        $scope.spendrange = [{range: "0-99", id: "0"}, {range: "100-249", id: "1"},
            {range: "250-399", id: "2"}, {range: "400-599", id: "3"},
            {range: "600-799", id: "4"}, {range: "800-999", id: "5"},
            {range: "1000-1299", id: "6"}, {range: "1300-1599", id: "7"},
            {range: "1600-1999", id: "8"}, {range: "2000-2399", id: "9"},
            {range: "2400-2999", id: "10"}, {range: "3000-3999", id: "11"},
            {range: "4000-7999", id: "12"}, {range: "8000-14999", id: "13"},
            {range: ">=15000", id: "14"}];

        $scope.AddItem = function (obj) {
            var settingsObj = uSpendSettings.getUSpendSettings();
            settingsObj.chVal = obj.id;
            console.log(settingsObj);
            uSpendSettings.setUSpendSettings(settingsObj);
            if (settingsObj.zipCode !== "")
                $state.go('tab.offers4');
            else
                $state.go('tab.offers3');
        }
    })
    .controller('Offer3Ctrl', function ($scope, $state, BBVADataAPI, uSpendSettings) {
        var settingsObj = uSpendSettings.getUSpendSettings();
        $scope.person = {};
        $scope.person.zipCode = settingsObj.zipCode;

        $scope.AddItem = function () {
            var settingsObj = uSpendSettings.getUSpendSettings();
            settingsObj.zipCode = $scope.person.zipCode;
            console.log(settingsObj);
            uSpendSettings.setUSpendSettings(settingsObj);
            if (settingsObj.zipCode !== "") {
                $state.go('tab.offers4');
                $("#errorConsole")[0].innerHTML = "";
            }
            else {
                $("#errorConsole")[0].style.display = "block";
                $("#errorConsole")[0].style.color = "red";
                $("#errorConsole")[0].innerHTML = "Invalid Zip code!";
            }
        }
    })
    .controller('Offer4Ctrl', function ($scope, $http, $state, BBVADataAPI, uSpendSettings, $ionicLoading) {
        var settingsObj = uSpendSettings.getUSpendSettings();
        /*$http.get('/assets/offers_new.json').success(function (data, status, headers, config) {
         $scope.keys = [];
         $scope.jsonData = [];
         $scope.values = [];
         var key, count = 0, temp = 0;
         for (key in data) {
         if (data.hasOwnProperty(key)) {
         $scope.keys[count] = key;
         $scope.values[count] = data[key];
         count++;
         }
         }
         for (a in $scope.keys) {
         var vals = [];
         vals = $scope.keys[a].split(":");
         if (settingsObj.zipCode == vals[0] && settingsObj.chVal == vals[2] && settingsObj.chCatg == vals[1]) {
         $scope.jsonData.push($scope.values[a]);
         $("#errorConsole")[0].innerHTML = "";
         }
         }
         if ($scope.jsonData.length == 0) {
         $("#errorConsole")[0].style.display = "block";
         $("#errorConsole")[0].style.color = "red";
         $("#errorConsole")[0].innerHTML = "Sorry No offers found for your location";
         }
         });*/
        offerScope = $scope;
        offersLoader = $ionicLoading;
        $ionicLoading.show({
            content: '<i class="icon ion-loading-d"></i>',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
        var offersRequestData = {
            zipCode: settingsObj.zipCode,
            category: settingsObj.chCatg,
            amountGroup: settingsObj.chVal,
            offersCallback: 'offersCallback'
        };
        $.ajax({
            crossDomain: true,
            type: 'GET',
            url: 'http://offersengine.appspot.com/app/request/findOffers',
            data: offersRequestData,
            dataType: 'jsonp'
        });
        $scope.AddItem = function (obj) {
            $("#star\\[" + obj.Sno + "\\]")[0].style.color = "#FE5105";
            var settingsObj = uSpendSettings.getUSpendSettings();
            settingsObj.selectedMerchant = obj;
            settingsObj.reviews = [];
            settingsObj.ratings = [];
            uSpendSettings.setUSpendSettings(settingsObj);
            $state.go('tab.merchantDetails');
            $("#errorConsole")[0].innerHTML = "";

        }
    })
    .controller('trendCtrl', function ($scope, $http, uSpendSettings) {
        var settingsObj = uSpendSettings.getUSpendSettings();


    })
    .controller('directionsCtrl', function ($scope, $http, uSpendSettings) {
        var directionsService = new google.maps.DirectionsService();

        var directionsDisplay;
        var settingsObj = uSpendSettings.getUSpendSettings();
        var merchantData = settingsObj.selectedMerchant;


        $scope.showDirections = function (mode) {
            console.info(mode);

            directionsDisplay = new google.maps.DirectionsRenderer();
            var startlat;
            var startlong;
            navigator.geolocation.getCurrentPosition(
                function (position) {
                    startlat = position.coords.latitude;
                    startlong = position.coords.longitude;
                });
            var endCoord = merchantData.Merchant_Latitude + ',' + merchantData.Merchant_Longitude;
            var startCoord = startlat + ',' + startlong;
            console.info(endCoord + startCoord);
            //startCoord='19.5,-99.27';//remove this whlie packaging the app
            console.info(endCoord + startCoord);
            var map = new google.maps.Map(document.getElementById('merchantMap'));
            var trMode;
            if (mode == 1) {
                trMode = google.maps.TravelMode.DRIVING
            } else if (mode == 2) {
                trMode = google.maps.TravelMode.BICYCLING;
            }
            var request = {
                origin: startCoord,
                destination: endCoord,
                travelMode: trMode
            };
            var rendererOptions = {
                map: map
            };
            directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
            directionsService.route(request, function (response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    //var warnings = document.getElementById('warnings_panel');
                    //warnings.innerHTML = '<b>' + response.routes[0].warnings + '</b>';
                    console.info(response);
                    directionsDisplay.setDirections(response);
                    var route = response.routes[0];
                    var summaryPanel = document.getElementById('steps');
                    summaryPanel.innerHTML += '</b><br>';
                    summaryPanel.innerHTML += route.legs[0].start_address + ' TO ';
                    summaryPanel.innerHTML += route.legs[0].end_address + '   ';
                    summaryPanel.innerHTML += route.legs[0].distance.text;

                    /* var steps = route.legs[0].steps;
                     for(i=0 ; i< steps.length;i++){
                     summaryPanel.innerHTML += steps[i].instructions;
                     }*/

                    // showSteps(response);
                }
            });
            //}


        };

    })
    .controller('reviewCtrl', function ($scope, $http, uSpendSettings) {
        var settingsObj = uSpendSettings.getUSpendSettings();
        $scope.reviews = settingsObj.reviews;
        $scope.ratings = settingsObj.ratings;
        $scope.merchName = settingsObj.merchantMapName;


    })
    .controller('merchantDtlCtrl', function ($scope, $http, $window, $ionicTabsDelegate, uSpendSettings) {
        var settingsObj = uSpendSettings.getUSpendSettings();
        var merchantData = settingsObj.selectedMerchant;

        $scope.merchantName = merchantData.Merchant_Name + "," + merchantData.Merchant_Address;
        $scope.offerTitle = merchantData.Offer_Title;
        //$scope.offerDetails = merchantData.Merchant_Name + " Offers Discount of " + merchantData["Benefit/Discount (%)"] + " And you save " + merchantData["You Save (In $)"] + "!!!";
        $scope.offerDetails = "You get " + merchantData["Benefit/Discount (%)"] + " discount on a spend of " + merchantData["Value (In $)"].replace('.00', '') + "Mex$";
        $scope.pictureLink = merchantData.Pic_Link;
        console.log(merchantData.Pic_Link);
        $scope.openOffer = function () {
            console.info(merchantData.Groupon_Link);
            $window.open(merchantData.Groupon_Link);
        }
        $scope.checkIfReviewLoad = function () {
            console.log(settingsObj.reviews);
            if (!( settingsObj.reviews === undefined) && (settingsObj.reviews.length > 0)) {
                $ionicTabsDelegate.select(2);
            }
        }


    })
    .controller('merchantDtlCtrl1', function ($scope, $http, uSpendSettings) {
        /*Tab Code*/
        $scope.tab = 1;

        $scope.selectTab = function (setTab) {
            console.info('set tab')
            $scope.tab = setTab;
        };
        $scope.isSelected = function (checkTab) {
            return $scope.tab == checkTab;
        };


        /* Tab code end*/
        var settingsObj = uSpendSettings.getUSpendSettings();
        var merchantData = settingsObj.selectedMerchant;
        $scope.description = "Loading";
        //$scope.reviews ="Loading";
        // $scope.trends ="Loading";
        $scope.ratings = [];
        console.log(merchantData);
        var mapOptions = {
            zoom: 9,
            center: new google.maps.LatLng(merchantData.Merchant_Latitude, merchantData.Merchant_Longitude),
            mapTypeId: google.maps.MapTypeId.NORMAL
        };
        /*Using map global varaible*/
        map = new google.maps.Map(document.getElementById('merchantMap'), mapOptions);
        var infoWindow = new google.maps.InfoWindow();
        var marker;
        var service = new google.maps.places.PlacesService(map);
        google.maps.event.addListenerOnce(map, 'bounds_changed', performSearch);

        function performSearch() {
            var request = {
                location: new google.maps.LatLng(merchantData.Merchant_Latitude, merchantData.Merchant_Longitude),
                name: merchantData.Merchant_Name,
                //keyword:merchantData.Merchant_Address,
                radius: 50
            };
            service.radarSearch(request, callback);
        }

        function callback(results, status) {
            if (status != google.maps.places.PlacesServiceStatus.OK) {
                console.info(status);
                return;
            }
            var result = results[0];
            console.log(result);
            var request = {
                placeId: result.place_id
            };

            service.getDetails(request, function (place, status) {
                console.log(place);
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    marker = new google.maps.Marker({
                        map: map,
                        // icon:place.icon,
                        position: place.geometry.location
                    });
                    map.setZoom(17);
                    $scope.description = place.name;

                    settingsObj.reviews = place.reviews;
                    settingsObj.ratings = [{current: place.rating, max: 5}];
                    console.log(settingsObj.ratings );
                    settingsObj.merchantMapName = place.name;
                    settingsObj.showDirections = true;
                    if (!( settingsObj.reviews === undefined) && (settingsObj.reviews.length > 0)) {
                        document.getElementById("showReviews").innerHTML = "Please click Review Tab to see reviews for " + merchantData.Merchant_Name + "!!!";
                    }else{
                        document.getElementById("showReviews").innerHTML = "No reviews found for " + merchantData.Merchant_Name + "!!!";
                    }
                    uSpendSettings.setUSpendSettings(settingsObj);
                    google.maps.event.addListener(marker, 'click', function () {
                        alert('here');
                        infoWindow.setContent(place.name);
                        infoWindow.open(map, marker);
                    });
                }
            });


        }

    })
    .controller('SpendCtrl', function ($scope, $http, BBVADataAPI, uSpendSettings, $ionicModal) {

        $ionicModal.fromTemplateUrl('contact-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modal = modal
        })

        $scope.openModal = function () {
            $scope.modal.show()
        }

        $scope.closeModal = function () {
            $scope.modal.hide();
        };

        $scope.$on('$destroy', function () {
            $scope.modal.remove();
        });

        var settingsObj = uSpendSettings.getUSpendSettings();
        console.log($scope);
        console.log($http);
        console.log(BBVADataAPI);
        console.log(uSpendSettings);
        personObj = settingsObj;
        $scope.userGroupData = settingsObj;
        $scope.formattedGender = personObj.gender === 'M' ? 'Male' : 'Female';
        if (typeof personObj !== 'undefined') {
            $scope.loader = "Loading ... Please wait !";
            var filterValues = {};
            filterValues.gender = personObj.gender;
            filterValues.ageValue = personObj.ageGroup;
            $http.get(BBVADataAPI.getTempUrl(personObj.zipCode), {
                headers: {'Authorization': BBVADataAPI.getBbvaAuthKey()},
                params: {
                    date_min: settingsObj.fromDate,
                    date_max: settingsObj.toDate,
                    group_by: 'month',
                    category: settingsObj.subCatg,
                    level: 'subcategory'
                }
            }).
                success(function (data, status, headers, config) {
                    console.log("success");
                    $scope.loader = "";
                    currentZippcode = settingsObj.zipCode;
                    currentCategory = settingsObj.subCatg;
                    filterValues.gender = settingsObj.gender;
                    filterValues.ageValue = settingsObj.ageGroup;
                    minDate = settingsObj.fromDate;
                    maxDate = settingsObj.toDate;
                    var labelsJSON = {};
                    var monthsArray = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                    for (var i = 0; i < data.data.stats.length; i = i + 1) {
                        var year = data.data.stats[i].date.substr(0, 4);
                        var month = data.data.stats[i].date.substr(4, 2);
                        var monthName = monthsArray[parseInt(month)];
                        //data.data.stats[i].date = monthName + " " + year;
                        labelsJSON[data.data.stats[i].date] = monthName + " " + year;
                    }
                    var status = drawChartforuser(data, filterValues, "barchart", "cardscube", labelsJSON);
                    if (!status) {
                        $scope.loader = "No data found! Please modify your group data and try again";
                    }

                }).
                error(function (data, status, headers, config) {
                    console.log(data.result.code);
                    if (data.result.code === 404) {
                        $scope.loader = "No data found! Please modify your group data and try again";
                    } else {
                        $scope.loader = "There's been an error! Please modify your group data and try again";
                    }
                    console.error('Error fetching feed:', data);
                });


            $scope.dummy = {};
        }
        else {
            $scope.loader = "Please save your group preferences first !";
        }

    })
    .controller('ShortsCtrl', function ($scope) {

    })

    .controller('ChooseCtrl', function ($scope) {
    });
var map;
var predictAccessToken = null;
var oAuthCallBack = function (RESP) {
    if (RESP !== undefined) {
        //document.getElementById('responseContent').innerHTML = RESP.access_token;
        console.log('loaded access token' + RESP.access_token);
        //PredictionAPI.access_token = RESP.access_token;
        predictAccessToken = RESP.access_token;
    }
};

var offersCallback = function (RESP) {
    if (RESP !== undefined) {
        console.log(RESP.length);
        offerScope.offersList = RESP;
        console.log(offerScope.offersList);
    }
    offersLoader.hide();
    offerScope = '';
    offersLoader = '';
};
var displayHomeScreen = true;
//var offersList = [];
var offerScope = '';
var offersLoader = '';