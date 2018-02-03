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

app.factory('dataShare', function ($http, $location, $timeout) {
    var service = {};
    service.data = {};

    service.get = function () {
        return this.data;
    };

    service.set = function(key1, val1) {
        this.data[key1] = val1;
    };

    service.getZoomFactor = function() {
        return window.innerWidth/19.2;
        //return Math.min(window.innerWidth/19.2, window.innerHeight/10.8);
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

app.controller('mainController', function ($scope, $rootScope, $http, $location, $window, $document, $timeout, dataShare) {
    $scope.dataShare = dataShare;
    $scope.zoomFactor = dataShare.getZoomFactor();
    //$scope.selected_id = 0;
    var page = 0;
    var iid = 0;
    var lock;
    var pos = 0;
    var first_line = true;

    $scope.init = function () {
        $scope.video_url = '';
        $scope.show_serie = false;
        $scope.choose_season = false;
        $scope.play_video = false;
        $scope.results = [];
        $scope.serie = [];

        $scope.width = window.innerWidth;
        $scope.height = window.innerHeight;
        $http.jsonp(vod_domain + 'series.php?callback=JSON_CALLBACK')
            .success(function (data) {

                $scope.results.push.apply($scope.results, data);
                $scope.selected_id = data[iid].id;
            });

        document.addEventListener('backbutton', function () {
            event.preventDefault();
            deviceButton(27);
        }, false);


    };

    var change_selection = function () {
        $scope.selected_id=$scope.results[iid].id;
        $scope.$apply();

        if (!lock && iid>$scope.results.length-12) {
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
                $scope.season_id = $scope.seasons.length-1;
                load_episodes();
                $scope.choose_season = false;
                $scope.show_serie = true;
                $scope.play_episode = false;
            });
    };

    var choose_serie = function (dirval) {
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
                    $window.scrollBy(0, -4*$scope.zoomFactor);
                    if (pos == 0) first_line = true;
                }
                break;
            case 39:
                if (iid > 0) iid -= 1;
                break;
            case 40:
                if (iid < $scope.results.length - 6) {
                    iid += 6;
                    if (!first_line) $window.scrollBy(0, 4*$scope.zoomFactor);
                    first_line = false;
                }
        }
        change_selection();
    };

    var choose_episode = function (dirval) {
        switch (dirval) {
            case 13:
                if ($scope.choose_season) $scope.choose_season = false;
                else play_episode();
                break;
            case 27:
                $scope.show_serie = false;
                break;
            case 37:
                if ($scope.choose_season && $scope.season_id < $scope.seasons.length - 1) {
                    $scope.season_id++;
                    load_episodes();
                }
                else if (!$scope.choose_season && $scope.episode_id < $scope.episodes.length - 1) $scope.episode_id++;
                break;
            case 38:
                $scope.choose_season = true;
                break;
            case 39:
                if ($scope.choose_season && $scope.season_id > 0) {
                    $scope.season_id--;
                    load_episodes();
                }
                else if (!$scope.choose_season && $scope.episode_id > 0) $scope.episode_id--;
                break;
            case 40:
                $scope.choose_season = false;
                break;
        }
    };

    var video_mode = function (dirval) {
        var vid = document.getElementById("backgroundvid");
        switch (dirval) {
            case 13:
                (vid.paused) ? vid.play() : vid.pause();
                break;
            case 27:
                $scope.play_episode = false;
                $location.path('/');
                break;
            case 37:
                vid.currentTime = vid.currentTime - 30;
                break;
            case 38:
                vid.currentTime = vid.currentTime + 600;
                break;
            case 39:
                vid.currentTime = vid.currentTime + 30;
                break;
            case 40:
                vid.currentTime = vid.currentTime - 600;
                break;
        }
    };

    $scope.keydown = function ($event) {
        //$event.stopPropagation();
        $event.preventDefault();
        var code = $event.keyCode;
        $scope.code2 = code;
        if (code==13 || code==27 || (code>=37 && code<=40)) keypressed(code);
    };

    var deviceButton = function (code) {
        //$event.stopPropagation();
        $scope.code2 = code;
        keypressed(code);
        $scope.$apply();
    };

    var keypressed = function (code) {
        if (!$scope.show_serie) choose_serie(code);
        else if (!$scope.play_episode) choose_episode(code);
        else video_mode(code);
    };

    var load_episodes = function () {
        $scope.episodes = Object.keys($scope.serie.episodes[$scope.seasons[$scope.season_id]]);
        $scope.episode_id = $scope.episodes.length-1;
    };

    var play_episode = function () {
        $scope.play_episode = true;
        $http.jsonp(vod_domain + 'sources.php?callback=JSON_CALLBACK&ref=' + $scope.serie.episodes[$scope.seasons[$scope.season_id]][$scope.episodes[$scope.episode_id]])
            .success(function (data) {
                dataShare.set('video_source', data[0].file);
                $location.path('video');
            });

    };
});