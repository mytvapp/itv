// script.js
var domain = 'http://api.apollogroup.tv/play/?vlc=0&token=gK5oNcjwNfjn:ZmJmNTVjYmVkZWFmYTQ2NGYyM2QxM2I5ZGRlYzllOGUyNzRlNDg1OA==&channel=';
var vod_domain = 'http://vod.itv-channel.com/';

var channels = {75:{ag:1542,tg:185}, 11:{ag:473, tg:3787}, 12: {ag:470, tg:3819}, 13:{ag:471, tg:3821}, 14:{ag:1557, tg:3817}, 20:{ag:478, tg:-1}, 9:{ag:1547, tg:540}, 82:{ag:476, tg:3064}, 79:{ag:474, tg:-1}, 31: {ag:5003, tg:199},
60:{ag:1550, tg:376}, 38:{ag:1551, tg:144}, 37:{ag:1524, tg:198}, 39:{ag:1552, tg:138}, 36:{ag:1503, tg:504}, 77:{ag:1502, tg:212}, 78:{ag:477, tg:3070}, 35:{ag:1560, tg:341}, 8:{ag:1541, tg:1541}, 19:{ag:1526, tg:343}};
var app = angular.module('app', ['ngRoute', 'ngAnimate', 'ngMaterial', 'angucomplete-alt', 'multipleDatePicker', 'ngMobile']);

app.run(function($http, dataShare, $location) {

    //var id = window.localStorage.getItem("id");
    /*
    $http.get(domain)
        .success(function (data) {
            //data = {'link': 'http://pro213.com/live/waisman427/xi1420/8326.m3u8'}
            dataShare.set(data);
            $location.path('home');
        })
        */



    /*
        var id = window.localStorage.getItem("id");
        $http.jsonp(domain + 'login.php?callback=JSON_CALLBACK&id=' + id)
            .success(function (data) {
                dataShare.set(data);
                dataShare.register();

                if (data.ver <= 3.61) {
                    if (data.id == -1) dataShare.changePage(data, 'login');
                    else if (data.settings.message_status==2) dataShare.action('message', 'message');
                    else dataShare.changePage(data);
                } else dataShare.action('versionUpdate', 'login')
            });
    */

});

// configure our routes
app.config(function ($routeProvider) {
    $routeProvider

        .when('/', {
            templateUrl: 'pages/vod.html',
            controller: 'mainController'
        })

        .when('/video', {
            templateUrl: 'pages/video.html',
            controller: 'mainController'
        })

});

app.config(function ($mdThemingProvider) {
    $mdThemingProvider
        .theme('default')
        .primaryPalette('deep-orange') //#ff5722
        .accentPalette('pink')
        .warnPalette('red')
        .backgroundPalette('blue-grey')
});

app.config(function ($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist([
        'self',
        'https://*.googleusercontent.com/**'
    ]);
});



app.factory('dataShare', function ($http, $location, $timeout, $window) {
    var service = {};
    var pagePromise = null;
    service.data = {};

    service.get = function () {
        return this.data;
    };

    service.set = function(key1, val1) {
        this.data[key1] = val1;
    };

    service.getZoomFactor = function() {
        return Math.min(window.innerWidth/19.2, window.innerHeight/10.8);
    };

     service.changeChannel = function(id) {
         id = parseInt(id);
         if (id in channels) {
             $http.get(domain + channels[id].ag)
                 .success(function (data) {
                     service.set('link', data.link);
                 });
             $http.get('http://212.237.62.44/srv/esp.php?id=' + channels[id].tg)
                 .success(function (data) {
                     service.set('esp', data);
                 });
         }
     };

    var _loading = false;
    var wp = null;
    service.setLoading = function (start) {
        if (start) {
            wp = $timeout(function () {
                _loading = true;
            }, 300);
        }
        else {
            $timeout.cancel(wp);
            _loading = false;
        }
    };

    service.getLoading = function () {
        return _loading;
    };

    return service;
});
/*
app.controller('vodController', function ($scope, $rootScope, $http, $window, $timeout, dataShare, $sce) {
    $scope.dataShare = dataShare;
    $scope.zoomFactor = dataShare.getZoomFactor();
    //$scope.results = [];
    var ws = null;
    $scope.elected_id = 0;


    $scope.init = function () {
        $scope.ch_id = '';
        $scope.esp_panel = false;
        dataShare.changeChannel('11');


        $http.jsonp(vod_domain + 'series1.php?callback=JSON_CALLBACK')
            .success(function (data) {
                $scope.results = data;
                $scope.selected_id = data[0].id;
                //$scope.results.push.apply($scope.results, data);
                //page = page+1;
                //if (data.length>0) $scope.loading_busy = false;
            });
    };

    $scope.change = function (id) {
        $scope.selected_id=id;
        $scope.$apply();
    }


    $scope.keydown = function ($event) {
        tav = String.fromCharCode($event.which);
        $scope.tav1=($event.keyCode===40)?'up':$event.which;
        if (tav=='i') {
            $scope.esp_panel = !$scope.esp_panel;
        } else {
            if (($scope.ch_id.length == 0) || (!$scope.ch_id.includes('-'))) {
                $timeout.cancel(ws);
                $scope.ch_id = tav + '-';
            } else {
                $scope.ch_id = $scope.ch_id.substr(0,1) + tav;
                dataShare.changeChannel($scope.ch_id);
                ws = $timeout(function () {
                    $scope.ch_id='';
                }, 5000);

            }
        }
    };


});
*/

app.controller('mainController', function ($scope, $rootScope, $http, $location, $window, $document, $timeout, dataShare, $sce) {
    $scope.dataShare = dataShare;
    $scope.zoomFactor = dataShare.getZoomFactor();
    //$scope.selected_id = 0;
    var page = 0;
    var iid = 0;
    var lock;
    var pos = 0;
    var elem;
    var first_line = true;
    var lock_move = false;
    $scope.video_source;

    $scope.init = function () {
        $scope.video_url = '';
        $scope.show_serie = false;
        $scope.results = [];
        $scope.serie = [];

        $http.jsonp(vod_domain + 'series.php?callback=JSON_CALLBACK')
            .success(function (data) {

                $scope.results.push.apply($scope.results, data);
                $scope.selected_id = data[iid].id;
            });
        elem = document.getElementById('results');
    };

    var change_selection = function () {
        $scope.selected_id=$scope.results[iid].id;
        //$location.hash($scope.selected_id);
        $scope.$apply();

        if (!lock && iid>$scope.results.length-10) {
            page += 1;
            lock = true;
            $http.jsonp(vod_domain + 'series.php?callback=JSON_CALLBACK&p=' + page)
                .success(function (data) {
                    $scope.results.push.apply($scope.results, data);
                    lock = false;
                });
        }
    };

    var load_serie = function () {
        $http.jsonp(vod_domain + 'serie.php?callback=JSON_CALLBACK&id=' + $scope.results[iid].id)
            .success(function (data) {
                $scope.serie = data;
                $scope.seasons = Object.keys(data.episodes);
                $scope.season_id = $scope.seasons[$scope.seasons.length - 1];
                $scope.episodes = Object.keys(data.episodes[$scope.season_id]);
                $scope.show_serie = true;
            });
    };

    var serie_state = function (dirval) {
        if (dirval==13) {
            load_serie();
            return;
        }
        switch (dirval) {
            case 37:
                if (iid < $scope.results.length - 1) iid += 1;
                break;
            case 38:
                if (iid >= 6) {
                    iid -= 6;
                    $window.scrollBy(0, -420);
                    if (pos == 0) first_line = true;
                    else {
                        /*
                        lock_move = true;
                        var new_pos = pos;
                        var elem = document.getElementById('results');
                        var id1 = setInterval(frame, 10);

                        function frame() {
                            if (new_pos == pos + 420) {
                                pos = new_pos;
                                clearInterval(id1);
                                lock_move = false;
                            } else {
                                new_pos += 20;
                                elem.style.top = new_pos + 'px';
                            }
                        }
                        */
                    }
                }
                break;
            case 39:
                if (iid > 0) iid -= 1;
                break;
            case 40:
                if (iid < $scope.results.length - 6) {
                    iid += 6;
                    if (!first_line) {
                        /*
                        lock_move = true;
                        var new_pos = pos;
                        var elem = document.getElementById('results');
                        var id1 = setInterval(frame, 10);

                        function frame() {
                            if (new_pos == pos - 420) {
                                pos = new_pos;
                                clearInterval(id1);
                                lock_move = false;
                            } else {
                                new_pos -= 20;
                                elem.style.top = new_pos + 'px';
                            }
                        }
                        */
                        $window.scrollBy(0, 420, "smooth");
                    }
                    first_line = false;
                }
        }
        change_selection();
    };

    $scope.keydown = function ($event) {
        //$event.preventDefault();
        //$event.stopPropagation();
        if (lock_move) return;
        var code = $event.keyCode;
        if (code==13 || (code>=37 && code<=40)) {
            if (!$scope.show_serie) serie_state(code);
            else {
                if (code==13) $location.path('/');
            }
        }
    };

    $scope.season_select = function (season) {
        $scope.season_id = season;
        $scope.episode_id = -1;
        $scope.episodes = Object.keys($scope.serie.episodes[$scope.season_id]);
    };

    $scope.episode_select = function (episode) {
        $scope.episode_id = episode;
        /*
        $scope.video_ref = 'http://vod.itv-channel.com/video.php?ref=' + $scope.serie.episodes[$scope.season_id][$scope.episode_id];
        $location.path('video');
        */
        $http.jsonp(vod_domain + 'sources.php?callback=JSON_CALLBACK&ref=' + $scope.serie.episodes[$scope.season_id][$scope.episode_id])
            .success(function (data) {
                dataShare.set('video_source', data[0].file);
                $location.path('video');
            });

    };
});