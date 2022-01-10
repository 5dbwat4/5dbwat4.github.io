var ppturl = {};
$(document).ready(function () {
	$.get("https://gitee.com/api/v5/repos/unitedlc/network_class_ppt/contents/",
		function (data, status) {
			for (var i = 0; i < data.length; i++) {
				if (data[i]["type"] == "dir") {
					//alert("asdfsdaf");
					s = data[i]["name"];
					$("#grade").append("<option value=\"" + s + "\">" + s + "</option>")
				}
			}
		}
	);
	$("#grade").change(
		function () {
			$("#subjectHolder").attr("style", "display: block;")
			$("#subject").empty();
			$("#subject").append("<option value=\"NULL\">     </option>");
			$("#date").empty();
			$("#date").append("<option value=\"NULL\">     </option>");
			$.get("https://gitee.com/api/v5/repos/unitedlc/network_class_ppt/contents/" + $("#grade").val() + "/",
				function (data, status) {
					for (var i = 0; i < data.length; i++) {
						if (data[i]["type"] == "file") {
							//alert(data[i]["name"]);
							var s = data[i]["name"].split(".")[0];
							$("#subject").append("<option value=\"" + s + "\">" + s + "</option>");

							//gradelist.push(data[i]["name"]);
						}
					}
				}
			);
		}
	);
	$("#subject").change(
		function () {
			if ($("#subject").val() == "NULL") return;
			$("#DateHolder").attr("style", "display: block;")
			$("#date").empty();
			$("#date").append("<option value=\"NULL\">     </option>");
			$.get("https://gitee.com/api/v5/repos/unitedlc/network_class_ppt/contents/" + $("#grade").val() + "/" + $("#subject").val() + ".json",
				function (data, status) {
					var cont = window.atob(data["content"]);
					json = JSON.parse(cont);
					assets = json["ASSETS"];
					//alert(assets);
					for (var i = 0; i < assets.length; i++) {
						var s = assets[i]["date"];
						$("#date").append("<option value=\"" + s + "\">" + s + "</option>");
						ppturl[s] = assets[i]["url"];

					}
				}
			);
		}

	);

	function showppt() {
		$("#ppt").attr("src", ppturl[$("#date").val()][$("#number").val()]);
		$("#chosen").attr("style", "display:none;")
		$("#back").attr("style", "display:block;")
		$("#back_word").hide()
		$("#mainselection").animate({
			left: '0%',
			top: '0%',
			width: '70px',
		}, 500)
		$("#mainselection").attr("style", "background-color: #FFFFFF;")
		let showflag = false;
		$("#back").mouseover(function () {
			if (showflag == false) {
				$("#mainselection").animate({
					width: '570px'
				}, 100, function () {
					$("#back_word").show(0);
					showflag = true;
				})
			}

		})
		$("#back").mouseleave(function () {
			if (showflag == true) {
				$("#back_word").hide(0,
					function () {
						$("#mainselection").animate({
							width: '70px'
						}, 100, function () {
							showflag = false;
						})
					}
				);
			}
		})
		$("#back").click(function () {
			showflag = false;
			showDashboard();
		})
	}

	function showDashboard() {
		$("#chosen").attr("style", "display:block;")
		$("#back").attr("style", "display:none;")
		$("#mainselection").animate({
			width: '70%',
			left: '15%',
			top: '30%'
		}, 500)
		$("#mainselection").attr("style", "background-color: #00FFFF;")
	}
	$("#date").change(
		function () {
			//alert($("#date").val());
			if ($("#date").val() == "NULL") return;
			$("#numberPholder").attr("style", "display: block;")
			$("#number").empty();
			for (var i = 0; i < ppturl[$("#date").val()].length; i++)
				$("#number").append("<option value=\"" + i + "\">" + i + "</option>");
			showppt();
		}
	);
	$("#number").change(
		function () {
			showppt();
		}
	);

});