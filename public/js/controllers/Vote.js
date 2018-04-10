app.controller("Vote", function ($scope) {
    $scope.obj = {};
    $scope.init = function () {
        var path = (window.location.pathname + '/').slice(6);
        var user = path.slice(0, path.indexOf('/'));
        path = path.slice(path.indexOf('/')+1);
        var system = path.slice(0, path.indexOf('/'));

        ajax('/votex/'+user+'/'+system, "", function (res) {
            var obj = JSON.parse(res);
            $scope.sysname = obj.name;
            $scope.obj = obj.candidates;
            $scope.$apply()
        })
    }

    function radioVal() {
        var val;
        var radios = document.forms["votef"].elements["vote"];
        
        // loop through list of radio buttons
        for (var i=0, len=radios.length; i<len; i++) {
            if ( radios[i].checked ) { // radio checked?
                val = radios[i].value; // if so, hold its value in val
                break; // and break out of for loop
            }
        }
        return val; // return value of checked radio or undefined if none checked
    }

    $scope.vote = function () {
        ajax('voting', radioVal(), function (res) {
            window.location = '/';
        })
    }
});