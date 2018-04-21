app.controller("Home", function ($scope) {
    $scope.acctv = 'org';
    $scope.init = function () {
        if (getCookie("uname", document.cookie) !== undefined) {
            window.location = "/dashboard";
        }
    }
});