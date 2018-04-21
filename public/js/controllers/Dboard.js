app.controller("Dboard", function ($scope) {
    $scope.systems = [];
    $scope.sys = [];
    $scope.obj = {};
    $scope.sysEData = {};
    $scope.sysECands = {};
    $scope.eNum = -1;
    $scope.delCreEdit = 0;
    $scope.init = function () {
        if (getCookie("uname", document.cookie) == undefined) {
            window.location = "/";
        }
        ajax("prosys", "", function (res) {
            $scope.titles = ["Organization", "First Name",
                          "Last Name", "Email Address", "Username"];
            var obj = JSON.parse(res);
            if (obj.acctv == "org") {
                delete obj.fname;
                delete obj.lname;
                $scope.titles.splice(1, 2);
            } else {
                delete obj.orgname;
                $scope.titles.splice(0, 1);
            }
            $scope.systems = obj.systems.slice();
            delete obj.systems;
            delete obj.acctv;
            /*var newObj = {};
            for (i = 0; i < titles.length; i++) {
                newObj[titles[i]] = obj[Object.keys(obj)[i]];
            }*/
            var sysn = [];
            for (i = 0; i < $scope.systems.length; i++) {
                sysn.push($scope.systems[i].name);
            }
            $scope.sys = sysn.slice();
            $scope.obj = Object.assign({}, obj);
            $scope.$apply();
        })
    };

    $scope.proEdit = function (e) {
        var element = angular.element(e.currentTarget) || angular.element(e.srcElement);
        var text = $(element).parent().siblings("p").html();
        $(element).parent().siblings("p").hide();
        $(element).parent().siblings("input").show();
        $(element).parent().siblings("input").val(text);
        $(element).next().show();
        $(element).hide();
    }

    $scope.pEdit = function (e) {
        var element = angular.element(e.currentTarget) || angular.element(e.srcElement);
        var text = $(element).parent().siblings("input").val();
        var id = $(element).parent().siblings("input").attr("id");
        $(element).parent().siblings("p").show();
        $(element).parent().siblings("input").hide();
        $(element).prev().show();
        $(element).hide();
        var editData = id.toLowerCase() + "=" + text;
        ajax("/editprofile?uname="+$scope.obj.uname, editData,
            function(res) {
            var obj = JSON.parse(res);
            $scope.obj["" + Object.keys(obj)[0]] = obj[""+Object.keys(obj)[0]];
            $scope.$apply();
        });
    }

    $scope.createsys = function () {
        $scope.delCreEdit = 0;
        var liLen = document.getElementById("ol").getElementsByTagName("li").length;
        ajax("createsys?offset="+new Date().getTimezoneOffset()+"&candnum="+liLen,
            formSerialize("#sysform"), function (res) {
            $scope.systems = JSON.parse(res).systems.slice();
            var sysn = [];
            for (i = 0; i < $scope.systems.length; i++) {
                sysn.push($scope.systems[i].name);
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
        $("#ol").append('<li>'+
            '<div class="input-group">'+
            '<input class="form-control" required type="text" placeholder="Name of Candidate" />'+
            '<div class="input-group-btn">'+
            '<button style="display:none" class="btn btn-default cand-btn" type="button"><i class="glyphicon glyphicon-remove"></i></button>'+
            '</div>'+
            '</div>' +
            '<textarea class="form-control" required placeholder="Description" maxlength="300"></textarea>' +
            '</li>');
        $(".cand-btn").show();
    }

    $('#ol').on('click', '.cand-btn', function (e) {
        var element = $(e.target);
        element.parents("li").remove();
        var liLen = document.getElementById("ol").getElementsByTagName("li").length;
        if (liLen < 3) {
            $(".cand-btn").hide();
        }
    })

    $scope.editsys = function () {
        var liLen = document.getElementById("olE").getElementsByTagName("li").length;
        ajax("editsys?candnum="+liLen+"&i="+$scope.eNum,
            editSerialize("#syseform"), function (res) {
            $scope.systems = JSON.parse(res).systems.slice();
            var sysn = [];
            for (i = 0; i < $scope.systems.length; i++) {
                sysn.push($scope.systems[i].name);
            }
            $scope.sys = sysn.slice();
            $scope.$apply();
        })
    }
    
    $scope.next1 = function () {
        $("#infoE").hide();
        $("#nex1").hide();
        $("#candsE").show();
        $("#bac1").show();
        $("#syssub1").show();
    }
    
    $scope.back1 = function () {
        $("#infoE").show();
        $("#nex1").show();
        $("#candsE").hide();
        $("#bac1").hide();
        $("#syssub1").hide();
    }

    $scope.addvE = function () {
        $("#olE").append('<li>'+
            '<div class="input-group">'+
            '<input class="form-control" required type="text" placeholder="Name of Candidate" />'+
            '<div class="input-group-btn">'+
            '<button style="display:none" class="btn cand-btn-e btn-default" type="button"><i class="glyphicon glyphicon-remove"></i></button>'+
            '</div>'+
            '</div>' +
            '<textarea class="form-control" required placeholder="Description" maxlength="300"></textarea>' +
            '</li>');
        $(".cand-btn-e").show();
    }

    $('#olE').on('click', '.cand-btn-e', function (e) {
        var element = $(e.target);
        element.parents("li").remove();
        var liLen = document.getElementById("olE").getElementsByTagName("li").length;
        if (liLen < 3) {
            $(".cand-btn-e").hide();
        }
    })

    $scope.editSystem = function (e) {
        $scope.delCreEdit = 1;
        var element = angular.element(e.currentTarget) || angular.element(e.srcElement);
        var text = $(element).parent().prev().html();
        for (i = 0; i < $scope.systems.length; i++) {
            if ($scope.systems[i].name == text) {
                $scope.eNum = i;
                $scope.sysECands = Object.assign({}, $scope.systems[i].candidates);
                $scope.sysEData = Object.assign({}, $scope.systems[i])
                delete $scope.sysEData.candidates;
                break;
            }
        }
    }

    $scope.delSystem = function (e) {
        var element = angular.element(e.currentTarget) || angular.element(e.srcElement);
        var text = $(element).parent().prev().html();
        if (confirm("Delete " + text + "?")) {
            ajax("delsys?text="+text, "", function (res) {
                $scope.systems = JSON.parse(res).systems.slice();
                var sysn = [];
                for (i = 0; i < $scope.systems.length; i++) {
                    sysn.push($scope.systems[i].name);
                }
                $scope.sys = sysn.slice();
                $scope.$apply();
            })
        }
    }
});

function formSerialize(form) {
    var liLen = document.getElementById("ol").getElementsByTagName("li").length;
    for (i = 0; i < liLen; i++) {
        document.getElementById("ol").getElementsByTagName("li")[i].getElementsByTagName('input')[0].setAttribute('id', 'candi'+(i+1));
        document.getElementById("ol").getElementsByTagName("li")[i].getElementsByTagName('input')[0].setAttribute('name', 'candi'+(i+1));
        document.getElementById("ol").getElementsByTagName("li")[i].getElementsByTagName('textarea')[0].setAttribute('id', 'candt'+(i+1));
        document.getElementById("ol").getElementsByTagName("li")[i].getElementsByTagName('textarea')[0].setAttribute('name', 'candt'+(i+1));
    }
    return $(form).serialize();
}

function editSerialize(form) {
    var liLen = document.getElementById("olE").getElementsByTagName("li").length;
    for (i = 0; i < liLen; i++) {
        document.getElementById("olE").getElementsByTagName("li")[i].getElementsByTagName('input')[0].setAttribute('id', 'candi'+(i+1));
        document.getElementById("olE").getElementsByTagName("li")[i].getElementsByTagName('input')[0].setAttribute('name', 'candi'+(i+1));
        document.getElementById("olE").getElementsByTagName("li")[i].getElementsByTagName('textarea')[0].setAttribute('id', 'candt'+(i+1));
        document.getElementById("olE").getElementsByTagName("li")[i].getElementsByTagName('textarea')[0].setAttribute('name', 'candt'+(i+1));
    }
    return $(form).serialize();
}

var logout = function() {
    document.cookie = "uname=; Max-Age=0";
    window.location = '/';
}