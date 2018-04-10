app.controller("Dboard", function ($scope) {
    $scope.sys = [];
    $scope.obj = {};
    $scope.init = function () {
        ajax("prosys", "", function (res) {
            var obj = JSON.parse(res);
            if (obj.acctv == "org") {
                delete obj.fname;
                delete obj.lname;
            } else {
                delete obj.orgname;
            }
            var syss = obj.systems.slice();
            delete obj.systems;
            var sysn = [];
            for (i = 0; i < syss.length; i++) {
                sysn.push(syss[i].name);
            }
            $scope.sys = sysn.slice();
            $scope.obj = Object.assign({}, obj);
            $scope.$apply();
        })
    };

    $scope.createsys = function () {
        var liLen = document.getElementById("ol").getElementsByTagName("li").length;
        ajax("createsys?offset="+new Date().getTimezoneOffset()+"&candnum="+liLen,
            $("#sysform").serialize(), function (res) {
            var syss = JSON.parse(res).systems.slice();
            var sysn = [];
            for (i = 0; i < syss.length; i++) {
                sysn.push(syss[i].name);
            }
            $scope.sys = sysn.slice();
            $scope.$apply();
        })
    }
    
    $scope.next = function () {
        $("#info").hide();
        $("#nex").hide();
        $("#cands").show();
        $("#bac").show();
        $("#syssub").show();
    }
    
    $scope.back = function () {
        $("#info").show();
        $("#nex").show();
        $("#cands").hide();
        $("#bac").hide();
        $("#syssub").hide();
    }

    $scope.addv = function () {
        var liLen1 = document.getElementById("ol").getElementsByTagName("li").length + 1;
        $("#ol").append('<li>'+
            '<input type="text" placeholder="Name of Candidate" name="candi'+liLen1+'" id="candi'+liLen1+'" />' +
            '<textarea placeholder="Description" maxlength="300" name="candt'+liLen1+'" id="candt'+liLen1+'"></textarea>' +
            '</li>');
    }
});