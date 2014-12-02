angular.module("myapp", [])
    .controller("MyController", function($scope, $http,$q, uSpendSettings) {
        //var inp =['Female','19-25','400-599.99'];
        console.log(uSpendSettings.getUSpendSettings());
        var settingsObj = uSpendSettings.getUSpendSettings();
        $scope.myData = {};
        var spending=[];
        var genderMap={'Male':'M',
            'Female': 'F',
            'Enterprise':'E',
            'Unknown':'U'};
        var ageMap={'<=18':'0',
            '19-25':'1',
            '26-35':'2',
            '36-45':'3',
            '46-55':'4',
            '56-65':'5',
            '>=66':'6',
            'Unknown':'U'};
        var amountMap={'<=99.9':'0','100-249.99': '1','250-399.99':'2',
            '400-599.99':'3','600-799.99':'4','800-999.99': '5',
            '1000-1299.99':'6','1300-1599.99':'7','1600-1999.99': '8',
            '2000-2399.99':'9','2400-2999.99':'10','3000-3999.99':'11',
            '4000-7999.99':'12','8000-14999.99':'13','>=15000': '14'};
        //alert(amountMap['400-599.99']);
        var hashData = settingsObj.gender+'#'+settingsObj.ageGroup;//genderMap[inp[0]]+'#'+ageMap[inp[1]]+'#'+amountMap[inp[2]];
        var mapInitCenter;
        console.info(hashData);
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode( { 'address': settingsObj.zipCode}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                console.log("res"+results[0].geometry.location);
                mapInitCenter = results[0].geometry.location;
                var mapOptions = {
                    zoom: 9,
                    center: new google.maps.LatLng(mapInitCenter.lat(),mapInitCenter.lng()),
                    mapTypeId: google.maps.MapTypeId.NORMAL
                };
                /*19° 21' N / 99° 9' W*/
                /* Initialize map and marker info window*/
                $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);

            }
        });
        /*Map the locations*/
        var infoWindow = new google.maps.InfoWindow();
        /* declare markers array*/
        $scope.markers = [];
        fetchData(settingsObj.zipCode).then(function(spending){
            console.info("in spending loop");
            for(x in spending){
                console.info("in spending loop");
                if(spending[x].spend.data.stats[0].cube[0] != undefined){
                    spending[x].spend.data.stats[0].cube.forEach(function(data,count,total){
                        console.info("data.hash"+data.hash);
                        if(data.hash.indexOf(hashData) > -1){
                            console.info("data.num_payments"+data.num_payments);
                            createMarker(spending[x].code,data.num_payments);

                        }
                    });
                }else{
                    createMarker(spending[x].code,3)
                }
            }

        });

        function fetchData(zipcode) {
            var spending=[];

            var responsePromise = $http({
                url:"http://api.geonames.org/findNearbyPostalCodesJSON?postalcode="+zipcode+"&country=MX&radius=10&username=noela_viv",
                method:'GET'
            });

            return responsePromise.then( function(response) {
                console.info('promise'+response.data.postalCodes);
                var promises=[];
                // $scope.myData.fromServer = response.data.postalCodes;
                //getBBVAData(data.postalCodes);
                angular.forEach(response.data.postalCodes,function(postalCode){

                    var url = 'https://apis.bbvabancomer.com/datathon/zipcodes/'+postalCode.postalCode+'/cards_cube?date_min=20140101&date_max=20140331&group_by=month';
                    var inPromise = $http({
                        url: url,
                        method: 'GET',
                        headers: {
                            'Authorization': 'Basic YXBwLmJidmEudHJlbmRzOjQ1N2JjZWUzNDg1YTI5OTgzODZlMzI0MDdjZjA3MWJhYWMyNmVkMzc=',
                            'Accept':'application/json',
                            'Content-Type':'application/json'
                        },
                        data:''
                    }).then(function (response, code) {
                        //each promise makes sure, that he pushes the data into the chapters
                        console.info("then fun"+code+postalCode);
                        console.info(response.data);
                        spending.push({'code':postalCode.postalCode, 'spend':response.data});
                    }, function(error){
                        console.info(error);
                    });
                    //Push the promise into an array
                    promises.push(inPromise);
                });

                return $q.all(promises).then(function () {

                    return spending;
                });
            });

        }

        var createMarker = function (info,numPay){
            geocoder.geocode( { 'address': info}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    //Got result, center the map and put it out there
                    var marker = new google.maps.Marker({
                        map: $scope.map,
                        position: results[0].geometry.location,
                        title: results[0].formatted_address,
                        icon:  {
                            path: google.maps.SymbolPath.CIRCLE,
                            strokeColor: '#008B45',
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            fillColor: '#008B45',
                            fillOpacity: 0.35,
                            scale:Math.round(numPay/500)

                        }
                    });
                    marker.content = '<div class="infoWindowContent">' + results[0].formatted_address + '<br> # of payments: '+ numPay +'</div>';

                    google.maps.event.addListener(marker, 'click', function(){
                        infoWindow.setContent('<div style="height:80px"><h4>' + marker.title + '</h4>' + marker.content+'</div>');
                        infoWindow.open($scope.map, marker);
                    });

                    $scope.markers.push(marker);
                }


                $scope.openInfoWindow = function(e, selectedMarker){
                    e.preventDefault();
                    google.maps.event.trigger(selectedMarker, 'click');
                }
            });

        }

    });