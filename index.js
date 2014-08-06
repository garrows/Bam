//Get or generate roomId
var roomId = window.location.hash;
var creator = false;
if (!roomId) {
    roomId = (Math.random()*0xFFFFFF<<0).toString(36);
    window.location.hash = roomId;
    creator = true;
}


var quickconnect = require('rtc-quickconnect');
var opts = {
  room: roomId,
  iceServers: require('freeice')()
};



angular.module('app', [])
.controller('GameCtrl', ['$scope', function($scope) {
    window.$scope = $scope;
    $scope.connected = false;
    
    var reset = function() {
        $scope.countdown = 5;
        $scope.max = 100;
        $scope.position = 50;
        $scope.state = "wait";
    };
    var increment = 2;
    reset();
    
    
    quickconnect('http://switchboard.rtc.io', opts)
        .createDataChannel('game')
        .on('channel:opened:game', function(id, dc) {
            
            dc.addEventListener('message', function(evt) {
                console.log('peer ' + id + ' says: ' + evt.data);
                
                switch(evt.data) {
                    case 'Bam':
                        $scope.position -= increment;
                        if ($scope.position <= 0) {
                            dc.send('Win');
                            $scope.state = 'loss';
                        }
                        break;
                    case 'Reset':
                        reset();
                        break;
                    case 'Start':
                        $scope.state = 'play';
                        break;
                    case 'Win':
                        $scope.state = 'win';
                        break;
                }
                $scope.$apply();
            });
            
            console.log('channel opened with peer: ' + id);
            $scope.connected = true;
            dc.send('Reset');
            
            
            var counter = setInterval(function() {
                $scope.countdown--;
                if ($scope.countdown <= 0) {
                    $scope.state = 'play';
                    dc.send('Start');
                    clearInterval(counter);
                }
                $scope.$apply();
            }, 1000);

            var makeBam = function () {
                dc.send('Bam');
                $scope.position += increment;
                $scope.$apply();
            };
            window.onkeyup = function(evt) {
                if (evt.keyCode != 32) { return; }
                makeBam();
            }
            document.addEventListener("touchend", makeBam);
            
        })
        .on('channel:closed:chat', function(id) {
            $scope.connected = false;
            reset();
            $scope.$apply();
            console.log('peer ' + id + ' has disconnected, channel closed');
        });
    
}])




