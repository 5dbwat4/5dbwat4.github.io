/**
 * @author Zhengjiabao <1426484228@qq.com>
 * @file js/util.js
 */
/**
 * 随机数
 * @param {Number} from Begin of list
 * @param {Number} to End of list
 * @returns {Number} A random number from %from to %to
 */
function rand(from, to) {
    return Math.round(Math.random() * (to - from - 1)) + from
}

function DOMshow(id) {
    document.getElementById(id).style.display = "inline-block";
}

function DOMhide(id) {
    document.getElementById(id).style.display = "none";
}

Array.prototype.pushNoRepeat = function () {
    for (var i = 0; i < arguments.length; i++) {
        var ele = arguments[i];
        if (this.indexOf(ele) == -1) {
            this.push(ele);
        }
    }
};

if (location.host == "localhost:40235") {
    if (localStorage.getItem("zitem__Politics__demand") == null) {
        localStorage.setItem("zitem__Politics__demand", JSON.stringify({
            // "/data/define.json": false,
            "/data/9Bu1_1.json": false,
            "/data/9Au2.json":false
        }))
    }

    if (localStorage.getItem("zitem__Politics__test_source") == null) {
        localStorage.setItem("zitem__Politics__test_source", JSON.stringify({
            // "/data/define.json": true,
            "/data/9Bu1_1.json":true,
            "/data/9Au2.json":true
        }))
    }

    if (localStorage.getItem("zitem__Politics__unfamiliar_list") == null || localStorage.getItem("zitem__Politics__unfamiliar_list") == "null") {
        localStorage.setItem("zitem__Politics__unfamiliar_list", JSON.stringify({
            // "/data/define.json": [],
            "/data/9Bu1_1.json":[],
            "/data/9Au2.json":[]
        }))
    }
} else {
    if (localStorage.getItem("zitem__Politics__demand") == null) {
        localStorage.setItem("zitem__Politics__demand", JSON.stringify({
            // "https://z-jb.gitee.io/recite_politics/data/define.json": false,
            "https://z-jb.gitee.io/recite_politics/data/9Bu1_1.json":false,
            "https://z-jb.gitee.io/recite_politics/data/9Au2.json":false
        }))
    }

    if (localStorage.getItem("zitem__Politics__test_source") == null) {
        localStorage.setItem("zitem__Politics__test_source", JSON.stringify({
            // "https://z-jb.gitee.io/recite_politics/data/define.json": true,
            "https://z-jb.gitee.io/recite_politics/data/9Bu1_1.json":true,
            "https://z-jb.gitee.io/recite_politics/data/9Au2.json":true
        }))
    }

    if (localStorage.getItem("zitem__Politics__unfamiliar_list") == null || localStorage.getItem("zitem__Politics__unfamiliar_list") == "null") {
        localStorage.setItem("zitem__Politics__unfamiliar_list", JSON.stringify({
            // "https://z-jb.gitee.io/recite_politics/data/define.json": [],
            "https://z-jb.gitee.io/recite_politics/data/9Bu1_1.json":[],
            "https://z-jb.gitee.io/recite_politics/data/9Au2.json":[]
        }))
    }
}



var demand_from = JSON.parse(localStorage.getItem("zitem__Politics__demand"))
var test_source = JSON.parse(localStorage.getItem("zitem__Politics__test_source"))

$.ajaxSettings.async = false;
for (const key in demand_from) {
    if (demand_from.hasOwnProperty(key)) {
        if (demand_from[key] == false) {
            $.getJSON(key, (data) => {
                demand_from[key] = data;
            })
        }
    }
}
localStorage.setItem("zitem__Politics__demand", JSON.stringify(demand_from))
