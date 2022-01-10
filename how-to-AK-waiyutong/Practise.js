function AudioModuleLoadingMessageBox(content){
	var settings = {
		dialogClass: 'loading-message-dialog green-dialog',
		width: 600,
		height: 200,
		autoOpen: true,
		modal: true,
		resizable: false,
		content : '正在加载',
		close: function( event, ui ) {
			$(this).dialog('destroy').remove();
		}
	};
	if(content == 'close'){
		if($('#TinSoAudioModuleLoadMessageBox').length > 0){
			AudioModuleLoadingMessageBox.loadingTime = new Date().getTime() - AudioModuleLoadingMessageBox.loadingTime - 1000;
			if(AudioModuleLoadingMessageBox.loadingTime < 0){
				AudioModuleLoadingMessageBox.loadingTime = 0 - AudioModuleLoadingMessageBox.loadingTime;
			}else{
				AudioModuleLoadingMessageBox.loadingTime = 0;
			}
			$('#TinSoAudioModuleLoadMessageBox').delay(AudioModuleLoadingMessageBox.loadingTime).dialog('close');
		}
		return;
	}else if(content != undefined){
		settings.content = content;
	}
	AudioModuleLoadingMessageBox.loadingTime = new Date().getTime();
	if($('#TinSoAudioModuleLoadMessageBox').length != 0){
		$('#TinSoAudioModuleLoadMessageBox').remove();
	}
	var div = '<div id="TinSoAudioModuleLoadMessageBox">';
	div += '<div class="dib-wrap messageContent">';
	div += '<div class="dib dialog-icon"></div>';
	div += '<div class="dib message-info">' + settings.content + '</div>';
	div += '</div></div>';
	$(div).appendTo('body');
	$('#TinSoAudioModuleLoadMessageBox').dialog(settings);
	$('#TinSoAudioModuleLoadMessageBox .messageContent .message-info').width(400);
	var height = ($('.loading-message-dialog #TinSoAudioModuleLoadMessageBox').height() - $('.loading-message-dialog #TinSoAudioModuleLoadMessageBox .messageContent').height()) / 2 - 10;
	$('.loading-message-dialog #TinSoAudioModuleLoadMessageBox .messageContent').css('margin-top', height);
}
AudioModuleLoadingMessageBox.loadingTime = 0;
var page_mode = true;
var cur_html = [];
videoRes_count = 0;
sen_click_arr = {};
var config = new Object();
practice_data = {};
practice_data_save = false;
var userAgent = navigator.userAgent; 
var is_primary = is_primary || false;
var judge_speaking = judge_speaking || true;
var record_check_interval = undefined;
var isSubmitAAA = false;
var isZeroNum = 0;
var zeroTypeA = false;
var zeroTypeC = false;
var isDialogShow = false;
var isDialogLook = false;
isNeedProtectDialog =  false;
(function(){
	if(!window.console){
		window.console.log = function(){};
	}
	var TSP = {};
	window.TSP = TSP;
	TSP.init = function(options) {
		if(!!TSP.inited){
			return;
		}
		TSP.audio.init(options);
		TSP.inited = true;
	};
	var throwError = TSP.throwError = function(message) {
		console.log(message);
		MessageBox({
			content : message
		}, 'warning');
	};
	var audio = TSP.audio = {};
	var AudioContext = audio.AudioContext = null;
	audio.init = function(options) {
		if(!!audio.inited){
			return;
		}
		window.URL = window.URL || window.webkitURL;
		navigator.getUserMedia = navigator.getUserMedia
		|| navigator.webkitGetUserMedia || navigator.mozGetUserMedia
		|| navigator.msGetUserMedia;
		var errMsg = '当前浏览器无法获取麦克风，将无法使用口语功能!';
		if(!navigator.getUserMedia || userAgent.indexOf("Edge") > -1){
			if(!((!!window.ActiveXObject || "ActiveXObject" in window) || userAgent.indexOf("Edge") > -1)){
				if(isIOS()){
					var href = '<a href="' + TinSoConfig.iOSAPP + '" class="ios_app_scheme" style="display:none;"></a>';
					$('body').append(href);
					$('.ios_app_scheme').click(function() {
						var clickedAt = +new Date;
						setTimeout(function(){
							if (+new Date - clickedAt < 2000){
								window.location = TinSoConfig.iOSUrl;
							}
						}, 500);
					}).click();
					errMsg = 'iOS下浏览器无法进行口语练习，请使用外语通APP进行练习';
				}
				console.log(errMsg);
				MessageBox({
					content : errMsg
				}, 'warning');
				return;
			}
		}else{
			try{
				AudioContext = window.AudioContext || window.webkitAudioContext;
			}catch (e) {
				throwError(errMsg);
				return;
			}
			if(!AudioContext){
				throwError(errMsg);
				return ;
			}
		}
		if(!!options.player){
			player.init(options.player);
		}
		var TSPspos = navigator.userAgent.search('Chrome');
		if(TSPspos != -1 && navigator.userAgent.substr(TSPspos) > 'Chrome/66'){
			if(typeof window.TSPAudioContext == 'undefined'){
				window.TSPAudioContext = { TSP : false };
				MessageBox({
					content : '由于谷歌公司在Chromium内核中加入了新的安全策略，录音功能必须在用户操作页面后才能开启，请您点击“我知道了”以激活录音。',
					close: function( event, ui ) {
						if(!!options.recorder){
							recorder.init(options.recorder);
						}
						$(this).dialog('destroy').remove();
					}
				}, 'warning');
			}else{
				window.TSPAudioContext.TSP = false;
				var TSPHandle = setInterval(function(){
					if(typeof window.TSPAudioContext.RecWave != 'undefined' && window.TSPAudioContext.RecWave == false){
						return;
					}
					if(typeof window.TSPAudioContext.Peaks != 'undefined' && window.TSPAudioContext.Peaks == false){
						return;
					}
					clearInterval(TSPHandle);
					if(!!options.recorder){
						recorder.init(options.recorder);
					}
					window.TSPAudioContext.TSP = true;
				}, 500);
			}
		}else{
			if(!!options.recorder){
				recorder.init(options.recorder);
			}
		}
		audio.inited = true;
		console.log('TSP.audio初始化');
	}
	audio.files = {
		length : 0,
		loaded : 0,
		list : {},
		initLoad : function(){
			audio.files.list = {};
			audio.files.loaded = 0;
			audio.files.length = 0;
		},
		addFile : function(file, url){
			audio.files.list[file] = {url : url, elem : null, loaded : false};
		},
		loadFiles : function(){
			var error_status = false;
			for(var i in audio.files.list){
				audio.files.length++;
				if ((!!window.ActiveXObject || "ActiveXObject" in window) || userAgent.indexOf("Edge") > -1) {
					audio.files.list[i].elem = {};
					url = audio.files.list[i].url;
					$("#AsrRecorder")[0].loadElem(i,url);
				}else{
					audio.files.list[i].elem = document.createElement('audio');
				}
				var elem = audio.files.list[i].elem;
				elem.list = audio.files.list[i];
				elem.file = i;
				elem.onerror = function() {
					error_status = true;
					ResourceLoadingMessageBox('close');
				};
				elem.onloadeddata = function(duration){
					if ((!!window.ActiveXObject || "ActiveXObject" in window) || userAgent.indexOf("Edge") > -1) {
						this.duration = duration / 1000;
					}
					this.list.loaded = true;
					audio.files.loaded = 0;
					for(var j in audio.files.list){
						if(audio.files.list[j].loaded){
							audio.files.loaded++;
						}
					}
					if(audio.files.loaded == audio.files.length){
						ResourceLoadingMessageBox('close');
					}else{
						if(audio.files.loaded == audio.files.length || error_status){
							ResourceLoadingMessageBox('close');
						}else{
							ResourceLoadingMessageBox('正在加载资源(' + audio.files.loaded + '/' + audio.files.length　+  ')');
						}
					}
				}
				elem.preload = 'auto';
				elem.src = audio.files.list[i].url;
				if(!!elem.load){
					elem.load();
				}
				elem.getCurrentTime = function(){
					if ((!!window.ActiveXObject || "ActiveXObject" in window) || userAgent.indexOf("Edge") > -1) {
						return $("#AsrRecorder")[0].getCurrentTime() / 1000;
					}else{
						return this.currentTime;
					}
				}
				elem.setCurrentTime = function(time){
					if(!((!!window.ActiveXObject || "ActiveXObject" in window) || userAgent.indexOf("Edge") > -1)){
						this.currentTime = time;
					}else{
						$("#AsrRecorder")[0].setCurrentTime(time * 1000);
						this.currentTime = time * 1000;
					}
				}
			}
			if(audio.files.loaded == audio.files.length || error_status){
				ResourceLoadingMessageBox('close');
			}else{
				ResourceLoadingMessageBox('正在加载资源(' + audio.files.loaded + '/' + audio.files.length　+  ')');
			}
		},
		isLoad : function(file){
			return !!audio.files.list[file] && !!audio.files.list[file].elem;
		},
		getAudio : function(file){
			if(!!audio.files.list[file] && !!audio.files.list[file].elem){
				return audio.files.list[file].elem;
			}else{
				throwError(file + '音频资源未加载');
			}
		}
	};
	var player = audio.player = {
		init : function(config){
			if(!!player.inited){
				return;
			}
			if(!config){
				ThrowError('config参数值未设置');
				return ;
			}
			player.config = config;
			player.inited = true;
			console.log('TSP.audio.player初始化');
		},
		load : function(file) {
			if(audio.files.length == 0 || audio.files.loaded == 0){
				throwError('资源可能未加载，浏览器可能出现问题，需要升级');
			}
			if(!audio.files.isLoad(file)){
				throwError(file + '音频资源未加载');
				return;
			}
			player.stop();
			player.audioElem = audio.files.getAudio(file);
		},
		play : function(){
			if(!!player.audioElem){
				if ((!!window.ActiveXObject || "ActiveXObject" in window) || userAgent.indexOf("Edge") > -1) {
					$("#AsrRecorder")[0].playSounds(player.audioElem.file);
				}else{
					player.audioElem.play();
				}
			}else{
				throwError('尚未加载音频资源');
			}
		},
		pause : function(){
			if(!!player.audioElem){
				if ((!!window.ActiveXObject || "ActiveXObject" in window) || userAgent.indexOf("Edge") > -1) {
					$("#AsrRecorder")[0].pauseSounds();	
				}else{
					player.audioElem.pause();
				}
			}
		},
		stop : function(){
			if ((!!window.ActiveXObject || "ActiveXObject" in window) || userAgent.indexOf("Edge") > -1) {
				$("#AsrRecorder")[0].stopRecSound();
			}
			if(!!player.audioElem){
				if(!player.audioElem.ended){
					if ((!!window.ActiveXObject || "ActiveXObject" in window) || userAgent.indexOf("Edge") > -1) {
						$("#AsrRecorder")[0].stopSounds();	
					}else{
						player.audioElem.pause();
						player.audioElem.currentTime = 0;
					}
				}
			}
		}
	};
	var recorder = audio.recorder = {};
	recorder.init = function(config){
		if(!!recorder.inited){
			return;
		}
		if(!config){
			ThrowError('config参数值未设置');
			return ;
		}
		recorder.config = config;
		var recorderWorker = null;
		var ffmpegWorker = null;
		recorder.start = function(testId, type, content, time, recordTime) {
			if(typeof record_check_interval == 'undefined' || !record_check_interval){
				record_check_interval = setInterval(function(){
					TSP.practice.videoResult();
				}, 60000);
			}
			if ((!!window.ActiveXObject || "ActiveXObject" in window) || userAgent.indexOf("Edge") > -1) {
				$(".trans_test_ctrl_info_area").addClass('recording');
				recorder.recording = true;
				$("#AsrRecorder")[0].startRecord(testId, type, content, time, recordTime);
			}else{
				recorderWorker.postMessage({
					command : 'start',
					testId : testId,
					type : type,
					content : content,
					time : time,
					recordTime : recordTime
				});
			}
		};
		recorder.stop = function() {
			recorder.recording = false;
			if ((!!window.ActiveXObject || "ActiveXObject" in window) || userAgent.indexOf("Edge") > -1) { 
				$(".trans_test_ctrl_info_area").removeClass('recording');
				$("#AsrRecorder")[0].stopRecord();
			}else{
				recorder.node.disconnect();
				recorderWorker.postMessage({
					command : 'stop'
				});
				RecWave.stopRecord();
			}
		};
		if (navigator.getUserMedia && userAgent.indexOf("Edge") == -1) {
			var storage;
			if(userAgent.indexOf("BIDUBrowser") == -1){
				storage = window.localStorage; 
			}else{
				storage = window.sessionStorage; 
			}
			if(storage.isOpenAudioLimit != 1 && storage.isOpenAudioLimit != 2){
				AudioModuleLoadingMessageBox('本次练习有口语录音功能，请允许浏览器提供麦克风！');
			}
			navigator.getUserMedia({
				audio : true
			} 
			, function(stream) {
				AudioModuleLoadingMessageBox('close');
				storage.isOpenAudioLimit = 1;
				var context = recorder.context = new AudioContext();
				var soucre = recorder.source = context.createMediaStreamSource(stream);
				var bufferLen = recorder.config.bufferLen || 4096;
				var channelNumber = recorder.config.channelNumber || 1;
				var sampleRate =  context.sampleRate;
				var sampleBits = 16;
				recorder.node = context.createScriptProcessor(bufferLen, channelNumber, channelNumber);
				recorderWorker = new Worker(TinSoConfig.host + '/js/worker.html?path=' + TinSoConfig.recorder);
				ffmpegWorker = new Worker(TinSoConfig.host + '/js/worker.html?path=' + TinSoConfig.ffmpeg.worker);
				AudioModuleLoadingMessageBox('正在初始化录音模块，首次加载时会从服务器下载资源，可能需要一段时间，请耐心等待。');
				recorderWorker.postMessage({
					command : 'init',
					sampleRate : context.sampleRate,
					channelNumber : channelNumber,
					sampleBits : sampleBits,
					TinSoConfig : TinSoConfig
				});
				ffmpegWorker.postMessage({
					command : 'init',
					ffmpeg : TinSoConfig.ffmpeg.lib
				});
				var currCallback;
				recorder.recording = false;
				recorder.node.onaudioprocess = function(e) {
					if (!recorder.recording)
						return;
					if(channelNumber == 1){
						recorderWorker.postMessage({
							command : 'record',
							buffer : [
								e.inputBuffer.getChannelData(0)
							]
						});
						if(RecWave.wf){
							RecWave.wf.drawWaveform(e.inputBuffer.getChannelData(0));
						}
					}else{
						recorderWorker.postMessage({
							command : 'record',
							buffer : [
								e.inputBuffer.getChannelData(0),
								e.inputBuffer.getChannelData(1) 
							]
						});
						if(RecWave.wf){
							RecWave.wf.drawWaveform(e.inputBuffer.getChannelData(0));
						}
					}
				};
				recorder.configure = function(cfg) {
					for ( var prop in cfg) {
						if (cfg.hasOwnProperty(prop)) {
							recorder.config[prop] = cfg[prop];
						}
					}
				};
				recorder.getWaveByTime = function(time) {
					recorderWorker.postMessage({
						command : 'getWaveByTime',
						time : time
					});
				};
				recorder.getWaveByTimes = function(times) {
					recorderWorker.postMessage({
						command : 'getWaveByTimes',
						times : times
					});
				};
				recorder.getWaveData = function(callback){
					recorder.exportWAV(callback);
				};
				recorder.getBuffer = function(cb) {
					currCallback = cb || recorder.config.callback;
					recorderWorker.postMessage({
						command : 'getBuffer'
					});
				};
				recorder.exportWAV = function(cb, type) {
					currCallback = cb || recorder.config.callback;
					type = type || recorder.config.type || 'audio/wav';
					if (!currCallback)
						throw new Error('exportWAV第一个参数为回调方法，不能缺省');
					recorderWorker.postMessage({
						command : 'exportWAV',
						type : type
					});
				};
				recorderWorker.onmessage = function(e) {
					switch (e.data.command) {
					case 'start':
						recorder.source.connect(recorder.node);
						recorder.node.connect(recorder.context.destination);
						recorder.recording = true;
						RecWave.startRecord();
						break;
					case 'setResult':
						var sen_index = e.data.time;
						var videoRes = e.data.result;
						if(videoRes && e.data && e.data.mp3){
							videoRes['mp3'] = e.data.mp3;
						}else{
							videoRes = new Object();
							videoRes['mp3'] = '';
						}
						var tid = e.data.testId;
						TSP.practice.setResult(sen_index, videoRes, tid);
						break;
					case 'getWaveByTime':
						var mp3_src = e.data.blob;
						if(mp3_src != null){
							TSP.practice.ctrlOpr.play_user_video(mp3_src, '播放录音');
						}else{
							MessageBox({
								content : '录音数据不存在！',
								buttons : [{
									text : '我知道了',
									click : function(){
										$(this).dialog('close');
									}
								}]
							});
						}
						break;
					case 'getWaveByTimes':
						var mp3_srcs = e.data.blob;
						if(mp3_srcs.length){
							TSP.practice.ctrlOpr.play_user_repeat_video(mp3_srcs, 0);
						}else{
							MessageBox({
								content : '录音数据不存在！',
								buttons : [{
									text : '我知道了',
									click : function(){
										$(this).dialog('close');
									}
								}]
							});
						}
						break;
					case 'convert':
						ffmpegWorker.postMessage(e.data);
						break;
					default:
						break;
					};
				};
				ffmpegWorker.onmessage = function(e) {
					switch (e.data.command) {
					case 'converted':
						recorderWorker.postMessage(e.data);
						break;
					case 'initFinished':
						AudioModuleLoadingMessageBox('close');
						TSP.practice.isAutoPractice();
						break;
					default:
						break;
					};
				};
				recorder.inited = true;
				LoadingMessageBox('close');
				console.log('TSP.audio.recorder初始化');
			}, function(error) {
				AudioModuleLoadingMessageBox('close');
				storage.isOpenAudioLimit = 2;
				switch (error.code || error.name) {
				case 'PERMISSION_DENIED':
					throwError('用户拒绝提供硬件服务。');
					break;
				case 'PermissionDeniedError':
					throwError('您拒绝浏览器提供麦克风 ，请重新打开浏览器并允许浏览器提供麦克风！');
					break;
				case 'NOT_SUPPORTED_ERROR':
				case 'NotSupportedError':
					throwError('浏览器不支持硬件设备。');
					break;
				case 'MANDATORY_UNSATISFIED_ERROR':
				case 'MandatoryUnsatisfiedError':
					throwError('无法发现指定的硬件设备。');
					break;
				default:
					throwError('无法打开麦克风。异常信息:'
							+ (error.code || error.name));
					break;
				}
				recorder.inited = false;
			});
		}
		console.log('recorder初始化完成');
	}
	audio.peaks = function(){
		console.log('TSP.audio.peaks初始化');
	};
	var practice = TSP.practice = {
		curIndex : 0,
		count: 0,
		is_submit: false,
		init : function(){
			practice.paperTest.init();
			practice.answerSheet.init();
			practice.testTime.calculateTime();
			practice.autoPracticeInit();
			if(window.location.pathname == '/Competition/paper.html'){
				practice.fixSubTitle();
			}
			if(page_mode || type=='preview'){
				if ((!!window.ActiveXObject || "ActiveXObject" in window) || userAgent.indexOf("Edge") > -1) {
					var time_end = 0;
					myTime = null;
					myTime = setInterval(function() {
						if($("#AsrRecorder")[0].sendToActionScript || time_end == 200){
							console.log('time_end:'+time_end);
							TSP.practice.waveForm.initWaveForm();
							clearInterval(myTime);
						}else{
							time_end++;
						}
					}, 1000);
				}
				if(type == 'wrong'){
					$('.test_sub_area,.bold_line_class,.stars').addClass('hide');
				 	$('.p_answer_list').find('p,span').addClass('hide');
				 	$('.test_sub_area:first').show();
					$('.p_answer_list').find('p:first,span:first').show();
				 	$('.next_test_btn').show();
				}
			}
			$('.p_paper_nature').prepend('<div class="vedio_tips">如果浏览器提示“使用/共享麦克风”，请点击允许/同意，否则将无法使用录音功能！</div>');
			$('.question_content:first').click();
			$('.test_content[data-kind="2"]').find('.sub_type_1520 .question_li').addClass('question_li_1520');
			$('.test_content[data-kind="2"]').find('.sub_type_1520 .question_li .speak_sentence.answer').remove();
			$('.test_content[data-kind="2"]').find('.sub_type_1520 .question_division_line').show();
			$('.test_content[data-kind="2"]').find('.sub_type_1520 .question_li .speak_sentence.question').show();
		},
		isAutoPractice : function(){
			var mode = $('.p_operation_box #test-mode').attr('data-mode');
			var source = $('.p_paper_cnt').attr('data-source');
			var struct_type = $('.p_paper_cnt').attr('data-struct-type');
			if(mode == 'exam' 
				&& (	
						(source == 'ts' || source == 'unit') 
						|| (source == 'hw' && (struct_type == 2 || struct_type == 3))
					)
			){
				TSP.practice.start();
			}
		},
		fixSubTitle : function(){
			$('.test_title .sub_title').each(function(i, obj){
				if($(this).html().length >= 8){
					$(this).width($(this).width() + 50);
				}
			});
		},
		autoPracticeInit : function(){
			var mode = $('.p_operation_box #test-mode').attr('data-mode');
			var source = $('.p_paper_cnt').attr('data-source');
			var struct_type = $('.p_paper_cnt').attr('data-struct-type');
			if(mode == 'exam' 
				&& (	
						(source == 'ts' || source == 'unit') 
						|| (source == 'hw' && (struct_type == 2 || struct_type == 3))
					)
			){
				$('.p_answer_list').addClass('auto_start');
				$('.p_question_switch div').addClass('auto_start');
				$('.p_operationBtn_container').hide();
				$('.p_operationBtn_container .btn_play').addClass('enable');
			}
		},
		showRecord : function(){
			practice.paperTest.setTestNumber();
			practice.paperTest.setOption();
			practice.paperTest.setImgSize();
			practice.paperTest.setVideoImg();
			practice.paperTest.setBoldLine();
			practice.paperTest.removeWhite();
			practice.paperTest.setTestStatus();
			practice.paperTest.setQjTest();
			practice.paperTest.setDWLJTest();
			practice.answerSheet.init();
			practice.waveForm.initWaveForm();
			$('.p_paper_cnt').find('input[type=text], textarea').attr('readonly', 'readonly');
			$('.p_paper_cnt').find('input[type=radio], select').attr('disabled', 'disabled');
			$('.question_container[data-qid="1"]').addClass('current_question');
			$('.test_content[data-kind="1"] .p_operationBtn_container').html($('#listentBtnAnswerTemp').template());
			$('.test_content[data-kind="3"] .p_operationBtn_container').html($('#writeBtnAnswerTemp').template());
			var source = $('.p_paper_cnt').attr('data-source');
			var isSubmit = !!parseInt($('.p_paper_cnt').attr('data-submit'));
			var hw_not_submit = (source == 'hw' && !isSubmit);
			if(hw_not_submit){
				$('.test_content .p_operationBtn_container').find('.btn_answer').remove();
			}
			$('.sub_test_area').each(function(x, y){
	    		var arr_score = $(this).find('.sub_info').attr('data-score').split('|');
	    		arr_score.pop();
				$(y).find('.test_content').each(function(i, n){
					var main_type = $(n).attr('data-type');
					var sub_type = $(n).attr('data-subtype');
					var test_level = $(n).attr('data-test-level');
					var ascore = $(n).attr('data-all-score');
					var score = $(n).attr('data-user-score');
					var count = $(n).attr('data-count');
					if(main_type == 7100){
						var btn_area = '<div class="dib-wrap p_operationBtn_container"></div>';
						var that = $(this).find('.question_container .question_content .question_p.china:eq(1)');
						if(!$(that).next().hasClass('p_operationBtn_container')){
							$(that).after(btn_area);
						}
					}
					if(score == '' || score == undefined){
						score = 0;
					}
					var user_answer = $(n).attr('data-user-answer');
					user_answer = user_answer == undefined ? '' : user_answer;
					var user_answer_array = new Array();
					if(user_answer.search(/\|/) >= 0){
						user_answer_array = user_answer.split(/\|/);
					}else if(user_answer.search(/\#/) >= 0){
						var user_answer_array = user_answer.split(/\#/);
						user_answer_array.pop();
					}else{
						user_answer_array.push(user_answer);
					}
					if(count != user_answer_array.length && user_answer_array[0] == ''){
    					for(var c = 0; c < count; c++){
    						user_answer_array[c] = '';
    					}
    				}
					var ascore_calc = 0;
					$(n).find('.question_content').each(function(j, m){
						var test_mold = $(m).attr('data-test-mold');
						var qid = $(m).closest('.question_container').attr('data-qid');
						$(m).find('.p_knowledge_points .knowledge_point').each(function(w, obj){
							$(obj).append('('+$(this).attr('data-klevel')+'%)');
						});
						ascore_calc += parseFloat(!!arr_score[j] ? arr_score[j] : arr_score[0]);
		    			if(test_mold == 1 && sub_type != 1621 && sub_type != 1626 && sub_type != 1631 && sub_type != 1321 && sub_type != 1323 && sub_type != 1324 && sub_type != 1326){
		    				var right_answer_str = $(m).find('.right_answer_class').attr('data-right-answer');
		    				right_answer = practice.process.convertAnswer(right_answer_str);
		    				if(score == ascore && score != 0){
		    					$(m).find('input[type=radio][value="' + right_answer + '"]').attr('checked', 'checked').closest('label').addClass('radio_right_answer');
		        				$('.p_answer_list ul li[data-index='+qid+']').addClass('answer_list_right_class');
			    			}else{
			    				if(isNaN(user_answer_array[j])){
			    					user_answer_array[j] = 0;
			    				}
		        				var user_answer_index = parseInt(user_answer_array[j]);
		        				if(user_answer_index >= 0){
		        					$(m).find('input[type=radio][value="' + user_answer_index + '"]').attr('checked', 'checked');
		        				}
			        			if(user_answer_index == right_answer){
			        				if(user_answer_index >= 0){
				        				$(m).find('input[type=radio][value="' + user_answer_index + '"]').closest('label').addClass('radio_right_answer');
			        				}
			        				$('.p_answer_list ul li[data-index='+qid+']').addClass('answer_list_right_class');
			        			}else{
			        				if(user_answer_index >= 0){
				        				$(m).find('input[type=radio][value="' + user_answer_index + '"]').closest('label').addClass('radio_wrong_answer');
			        				}
			        				if(!hw_not_submit){
			        					$(m).find('input[type=radio][value="' + right_answer + '"]').closest('label').addClass('radio_right_answer');
			        				}
			        				$('.p_answer_list ul li[data-index='+qid+']').addClass('answer_list_wrong_class');
			        			}
		    				}
		    			}
		    			else if((test_mold == 2 && main_type != 2700) || (test_mold == 1 && (sub_type == 1621 || sub_type == 1631 || sub_type == 1626 
		    					|| sub_type == 1321 || sub_type == 1323 || sub_type == 1324 || sub_type == 1326))){
		        			var reg = new RegExp("[.,;,:,\,，。\’\'\"\?][]*","g");
		        			var right_answer = $(m).find('.analysis .right_answer_class').attr('data-right-answer');
		        			var ext_answer = $(m).find('.analysis .right_answer_class').attr('data-ext-answer');
		    				var right_answers = ext_answer == undefined ? new Array() : ext_answer.split('#');
		    				if(right_answers.length > 0){
		    					right_answers[right_answers.length - 1] = right_answer;
		    				}else{
		    					right_answers[0] = right_answer;
		    				}
		    				for(var a in right_answers){
	    						right_answers[a] = right_answers[a].split(/\*/);
		    				}
		    				var user_answer_single = user_answer_array.length <= j ? [] : user_answer_array[j].split(/[\*\#]/);
							if(user_answer_single.length > right_answers[0].length){
								user_answer_single.splice(right_answers[0].length, user_answer_single.length- right_answers[0].length);
							}else if(user_answer_single.length < right_answers[0].length){
								for(var k = user_answer_single.length; k < right_answers[0].length;  k++){
									user_answer_single[k] = '';
								}
							}
		    				var flag_answer = true;
		    				for(var t in user_answer_single){
		    					var input_text = $(m).find('input[type=text]:eq(' + t +')');
		    					if(input_text.length == 0){
		    						break;
		    					}
				    			var initial_flag = false;
		    	    			var prevNode = input_text.previousSibling;
		    	    			if(prevNode != null && prevNode.nodeType == 3 
		    	    					&& $.trim(prevNode.nodeValue.substr(-1)) != '' && prevNode.length == 1){
		    	    				initial_flag = true;
		    	    			}
		    					input_text.val(user_answer_single[t]);
		    					var flag_single = false;
		    					if(score == ascore && score != 0){
		    						flag_single = true;
		    						input_text.addClass('right_answer');
		    					}else if(user_answer_single[t] == ''){
		    						flag_single = false;
			    				}else{
			    					for(var a in right_answers){
			    						var isCh_flag = false;
			    						var right_answers_a_t = $.trim(right_answers[a][t].toLowerCase());
			    						right_answers_a_t = right_answers_a_t.replace(/[.,;,:,\,，\?]/g, ' ');
			    						right_answers_a_t = $.trim(right_answers_a_t);
			    						right_answers_a_t = right_answers_a_t.replace(reg, '');
			    						right_answers_a_t = right_answers_a_t.replace(/\r\n/g, '');
			    						right_answers_a_t = right_answers_a_t.replace(/\n/g, '');
			    						right_answers_a_t = right_answers_a_t.replace(/\s+/g, '*');
			    						var user_answer_single_t = user_answer_single[t].toLowerCase();
			    						user_answer_single_t = user_answer_single_t.replace(/[.,;,:,\,，\?]/g, ' ');
			    						user_answer_single_t = $.trim(user_answer_single_t);
			    						user_answer_single_t = user_answer_single_t.replace(reg, '');
			    						user_answer_single_t = user_answer_single_t.replace(/\r\n/g, '');
			    						user_answer_single_t = user_answer_single_t.replace(/\n/g, '');
			    						user_answer_single_t = user_answer_single_t.replace(/\s+/g, '*');
			    						if (initial_flag) {
			    							if (right_answers_a_t == user_answer_single_t.substr(1) || right_answers_a_t.substr(1) == user_answer_single_t || right_answers_a_t == user_answer_single_t) {
			    								flag_single = true;
			    								input_text.addClass('right_answer');
			    								break;
			    							}
			    						} else if(right_answers_a_t == user_answer_single_t){
			    							flag_single = true;
			    							input_text.addClass('right_answer');
			    							break;
			    						}
			    					}
			    				}
		    					if(!flag_single){
		    						input_text.addClass('wrong_answer');
		    						if(!hw_not_submit){
			    						for(var s in right_answers){
			    							input_text.after('<span class="right_answer">('+ right_answers[s][t] +')</span>');
		    							}
		    						}
		    					}else{
		    						if(!hw_not_submit){
			    						for(var s in right_answers){
			    							input_text.after('<span class="right_answer">('+ right_answers[s][t] +')</span>');
		    							}
		    						}
		    					}
		    					flag_answer = flag_answer && flag_single;
		    				}
		        			if(flag_answer){
		        				$('.p_answer_list ul li[data-index='+qid+']').addClass('answer_list_right_class');
		        			}else{
		        				$('.p_answer_list ul li[data-index='+qid+']').addClass('answer_list_wrong_class');
		        			}
		    			}
		    			else if(test_mold == 5){
		    				var right_answer = $(m).find('.analysis .right_answer_class').attr('data-right-answer');
		    				if(user_answer_array[j] != '' 
		    					&& (user_answer_array[j].charCodeAt() <= 64 || user_answer_array[j].charCodeAt() >= 106)){
		    					user_answer_array[j] = practice.process.convertAnswerByNum(user_answer_array[j]);	
		    				}
	    					if((score == ascore && score != 0) || user_answer_array[j] == right_answer){
			    				$(m).find('select').val(right_answer).addClass('select_right');
		        				$('.p_answer_list ul li[data-index='+qid+']').addClass('answer_list_right_class');
		    				}else{
			    				$(m).find('select').val(user_answer_array[j]).addClass('select_wrong');
		        				$(m).find('span.right_answer').remove();
		        				if(!hw_not_submit){
		        					$(m).find('select').after('<span class="right_answer">('+right_answer+')</span>');
		        				}
		        				$('.p_answer_list ul li[data-index='+qid+']').addClass('answer_list_wrong_class');
		    				}
		    			}
		    			else if(test_mold == 6){
		    				$(n).find('.question_division_line').each(function(s, t){
		    					$(this).find('.speak_sentence.question').each(function(ii, oo){
		    						if(arr_score[ii] == undefined){
		    							$(this).append("&nbsp;&nbsp;(" + arr_score[0] + ")");
		    						}else{
		    							$(this).append("&nbsp;&nbsp;(" + arr_score[ii] + ")");
		    						}
		    					});
		    				});
		    				if(user_answer == '' || user_answer == undefined){
		    					for(var u = 0; u < $(n).find('.speak_sentence.answer').length; u++){
		    						user_answer_array[u] = 0;
		    					}
		    				}else{
			    				user_answer_array = user_answer.split(',');
			    				user_answer_array.pop();
		    				}
		    				$(n).find('.speak_sentence.answer').each(function(s, t){
		    					if(user_answer_array[s] == undefined){
		    						$(t).append("&nbsp;&nbsp;(0)");
		    					}else{
		    						$(t).append("&nbsp;&nbsp;(" + user_answer_array[s] + ")");
		    					}
		    				});
	    					var answer_flag = $(n).find('.question_division_line').length > 0 ? true : false;
	    					var audio_flag = false;
	    					if($(n).find('.p_Laudio').length > 0 
								&& ($(n).find('.p_Laudio').attr('data-mp3') != undefined 
								&& $(n).find('.p_Laudio').attr('data-mp3') != ''
								&& $(n).find('.p_Laudio').attr('data-mp3') != 0)
							){
	    						audio_flag = true;
	    					}else{
	    						if($(n).find('.speak_sentence:not(.no_audio)') && $(n).find('.speak_sentence:not(.no_audio)').length){
	    							audio_flag = true;
	    						}
	    					}
	    					var video_flag = $(n).find('.question_li:not(.question_li_1520)').length > 0 ? false : true;
	    					var btn_tmp = 'speackingBtn';
	    					if(audio_flag && $(n).attr('data-subtype') != '1535'){
	    						btn_tmp = btn_tmp + 'Audio';
	    					}
	    					if(video_flag){
	    						btn_tmp = btn_tmp + 'Video';
	    					}
	    					if(answer_flag){
	    						btn_tmp = btn_tmp + 'Answer';
	    					}
	    					btn_tmp = btn_tmp + 'Temp';
	    					if($(n).attr('data-subtype') == 1540 || $(n).attr('data-subtype') == 1541){
	    						$(n).find('.question_li:not(.question_li_1520)').append($('#noSpeackingBtnQuestionTemp').template());
    						}else{
    							$(n).find('.question_li:not(.question_li_1520)').append($('#speackingBtnQuestionTemp').template());
    						}
	    					$(n).find('.sub_type_1520 .btn_question_area').remove();
	    					$(n).find('.p_operationBtn_container').html($('#'+btn_tmp).template());
	    					if(score > 0){
	    						$('.p_answer_list ul li[data-index='+qid+']').addClass('answer_list_right_class');
	    					}else{
	    						$('.p_answer_list ul li[data-index='+qid+']').addClass('answer_list_wrong_class');
	    					}
		    			}
		    			else if(test_mold == undefined && main_type == 2700){
		    				$(m).find('textarea').val(user_answer);
		    			}
					});
					if(main_type == 7100 && $(n).find('.p_operationBtn_container').length == 2){
						$(n).find('.p_operationBtn_container:eq(1) .left_area.toh').html('熟练度:' + test_level + '%,&nbsp;总分:' + (parseFloat(ascore) <= 0 ? (isNaN(ascore_calc) ? count : ascore_calc) : ascore) + ',&nbsp;得分:' + score);
					}else{
				    	var shids = [538777,538779,538782,538783,538784,538794,538802,538805,538806,538807,538875,538876,538877,538878,538879,538880,538881,
						    538882,538883,538884,538885,538886,538887,538888,538889,538890,538891,538892,538893,538894,538895,538896,538897,538898,538899,
						    538900,538901,538902,538903,538904,538905,538906,538907,538908,538909,538910,538911,538912,538913,538914,544241,
						    560248,560247,560246,560225,560224,560223,560222,560220,560217,560216];
						if(typeof practice_id && $.inArray(parseInt(practice_id), shids) > -1){
						}else{
							$(n).find('.left_area.toh').html('熟练度:' + test_level + '%,&nbsp;总分:' + (parseFloat(ascore) <= 0 ? (isNaN(ascore_calc) ? count : ascore_calc) : ascore) + ',&nbsp;得分:' + score);
						}
					}
				});
			});
			$('.test_content[data-type="7100"]').each(function(i, obj){
				if($(obj).find('.p_operationBtn_container').length == 2){
					$(obj).find('.p_operationBtn_container:eq(1) .right_area').empty();
				}
				if($(obj).find('.question_division_line:eq(0)').length){
					var one_obj = $(obj).find('.question_container .question_content .question_p.china:eq(1)');
					if($(one_obj).next().hasClass('question_division_line')){
						$(one_obj).next().html($(obj).find('.question_division_line:eq(0)').html());
					}else{
						$(one_obj).after($(obj).find('.question_division_line:eq(0)'));
					}
				}
				$(obj).closest('.test_content').find('.question_container .question_content .question_content_str').remove();
				$(obj).closest('.test_content').find('.china_q').each(function(j, ebj){
					var qs_str = $(ebj).html();
					if(qs_str != ''){
						if($(ebj).closest('.test_content').find('.question_container .question_content .question_content_str:eq("'+j+'")').length){
							qs_str = '<div class="dib question_content_str_num">' + (j + 1) + '.</div>'
								+ '<div class="dib question_content_str_info">' + qs_str + '</div>';
							$(obj).closest('.test_content').find('.question_container .question_content .question_content_str:eq("'+j+'")').html(qs_str);
						}else{
    						qs_str = '<div class="dib dib-wrap question_content_str">' 
								+ '<div class="dib question_content_str_num">' + (j + 1) + '.</div>'
								+ '<div class="dib question_content_str_info">' + qs_str + '</div>' + '</div>';
							$(obj).closest('.test_content').find('.question_container .question_content').append(qs_str);
						}
					}
				});
				var tmp_obj = $(obj).find('.question_division_line:eq(1)');
				$(tmp_obj).find('.speak_sentence').each(function(j, ebj){
					if($(ebj).closest('.test_content').find('.question_content_str:eq("'+j+'") .question_content_str_info .question_division_line').length){
						$(ebj).closest('.test_content').find('.question_content_str:eq("'+j+'") .question_content_str_info .question_division_line').html($(ebj).html());
					}else{
						$(ebj).closest('.test_content').find('.question_content_str:eq("'+j+'") .question_content_str_info').append(ebj);
					}
				});
				$(this).find('.question_content_str').each(function(j, ebj){
					if($(ebj).next().hasClass('.btn_info_area')){
						$(ebj).next().remove();
					}
					$(ebj).after($('#speackingBtnAudioVideoTemp').template());
				});
				$(tmp_obj).remove();
				$(this).find('.btn_info_area').each(function(j, ebj){
					if($(ebj).find('.left_area.toh').html() == ''){
						$(ebj).find('.left_area.toh').hide();
						$(ebj).css('text-align', 'right');
					}
				});
			});
		},
		start : function(){
			$('.p_answer_list').addClass('auto_start');
			$('.p_question_switch div').addClass('auto_start');
			$('.p_operationBtn_container').hide();
			$('.p_operationBtn_container .btn_play').addClass('enable');
			self_practice_key = setInterval(function(){
				var obj = $('.p_operationBtn_container .btn_play.enable:first');
				if(obj == undefined || obj.length == 0){
					clearInterval(self_practice_key);
					clearInterval(time_id);
					if($('.test_content[data-kind="1"]').length || $('.test_content[data-kind="2"]').length){
						TSP.audio.player.stop();
						clearInterval(remainder_key);
						clearInterval(play_key);
						clearInterval(tape_remainder_key);
						$('.test_ctrl_info_area').hide();
						$('.trans_test_ctrl_info_area').removeClass('recording');
					}
                    if($('#test-mode').attr('data-mode') == 'exam'){
		    	    	$('.p_tests_area input').attr('disabled', 'disabled');
		    	    	$('.p_tests_area textarea').attr('disabled', 'disabled');
		    	    	$('.p_tests_area select').attr('disabled', 'disabled');
                    }
                    var wait_time = 60 * 5;
                    var self_answer_key = setInterval(function(){
                    	if($('.p_tests_area').attr('data-page') == 'result'){
    						clearInterval(self_answer_key);
                    		ResourceLoadingMessageBox('close');
                    		return;
                    	}
                    	var res = practice.videoResult();
                    	wait_time--;
                    	if(($('.p_tests_area').attr('data-page') != 'result' 
                    			&& wait_time <= 0 && res) 
                    		|| ($('.p_tests_area').attr('data-page') != 'result' && res)){
    						clearInterval(self_answer_key);
                    		ResourceLoadingMessageBox('close');
    						if(is_primary){
                        		TSP.practice.primary.question.submitAnswer();
                        	}else{
                        		TSP.practice.process.submitAnswer();
                        	}
                    	}else{
                    		ResourceLoadingMessageBox('正在判分，请稍等！');
                    	}
                    }, 1000);
				}else if(!$(obj).hasClass('start')){
					var qid = $(obj).closest('.test_content').find('.question_container').attr('data-qid');
					if(qid > 0){
						TSP.practice.answerSheet.select(qid, -80);
					}
					$(obj).click();
				}
			}, 1000);
		},
		videoResult : function(){
			if(($('.test_content[data-kind="2"]') != undefined && $('.test_content[data-kind="2"]').length > 0) 
					|| $('.p_paper_cnt.beidanci_box[data-homework-type="30"]').length > 0){
				var video_status = true;
				$.each(videoResult, function(tid, objs){
					var sub_type = $('.test_content[data-id="' + tid + '"]').attr('data-subtype');
					if(objs != undefined && objs != null){
						$.each(objs, function(time_flag, obj){
							if(obj['result'] == undefined || obj['result']['count'] == undefined){
								video_status = false;
								var cur_time = (new Date()).getTime();
								var big_time = 120000;
								if(sub_type == 1428){
									big_time = 900000;
								}
								if(cur_time - obj['end_time'] > big_time){
									TSP.practice.setResult(time_flag, {'count' : 0, 'mp3' : '', 'score' : 0}, tid);
								}
							}
						});
					}
				});
				if(!video_status){
					return false;
				}
			}
			return true;
		},
		setResult : function(time_flag, videoRes, tid){
			if($('.primary_video_setResult').length > 0) {
				primaryVideoSetResult(videoRes);
			}else if($('.follow_danci_setResult').length > 0){
				gdWordVideoSetResult(time_flag,videoRes,tid);
			}
			var typeid = $('.test_content[data-id="' + tid + '"]').find('.chosBox').val();
			if(typeid == 5000){
				videoResult[tid][time_flag]['result'] = videoRes;
				var score = videoRes.count == 0 ? 0 : videoRes['score'];
				if(judge_speaking){
					if(score < 60){
						$('.test_content[data-id="'+tid+'"]').find('.question_content .speak_sentence[data-time-flag="'+time_flag+'"]').removeClass('high_light_font').addClass('no_pass_font');
					}else{
						$('.test_content[data-id="'+tid+'"]').find('.question_content .speak_sentence[data-time-flag="'+time_flag+'"]').removeClass('high_light_font').addClass('pass_font');
					}
					$('.test_content[data-id="'+tid+'"]').find('.question_content .speak_sentence[data-time-flag="'+time_flag+'"]').next('.sentence_behind_space').removeClass('wait_background').html('('+score+')');
					$('.test_content[data-id="'+tid+'"] .question_container .speak_sentence[data-time-flag="'+time_flag+'"]').attr("data-sen_score",score);
				}
			}else{
				$.each(videoResult, function(tid, testResults){
					if(testResults == undefined || testResults == null){
					}else{
						var quesiton_index = 0;
						$.each(testResults, function(resultTime, video){
							quesiton_index++;
							if(resultTime == time_flag){
								videoResult[tid][resultTime]['result'] = videoRes;
	    						var sen_score = videoRes['score'];
	    						if(isNaN(sen_score)){
	    							sen_score = 0;
	    						}
	    						if(!sen_score){
	    							sen_score = 0;
	    						}
	    						var main_type = $('.test_content[data-id="'+tid+'"]').attr('data-type');
	    						var sub_type = $('.test_content[data-id="'+tid+'"]').attr('data-subtype');
								if(typeid == 8000){
									if(judge_speaking){
										$('.test_content.current_test .speak_sentence[data-time-flag="' + time_flag + '"]').next('.sentence_behind_space').removeClass('wait_background').html('('+sen_score+')');
										if(sen_score > 60){
											$('.test_content.current_test .speak_sentence[data-time-flag="' + time_flag + '"]').removeClass('high_light_font').addClass('pass_font');
										}else{
											$('.test_content.current_test .speak_sentence[data-time-flag="' + time_flag + '"]').removeClass('high_light_font').addClass('no_pass_font');
										}
									}
									var video_status = true;
									var sentence_length = 0;
									if(videoResult != undefined){
										$.each(videoResult, function(i, objs){
											if(objs != undefined){
												$.each(objs, function(j, obj){
													if(obj == undefined || obj['count'] == undefined){
														video_status = false;
													}else{
														sentence_length++;
													}
												});
											}
										});
									}
									if(video_status && sentence_length >= $('.test_content.current_test[data-id="'+tid+'"]').find('.speak_sentence').length){
										ResourceLoadingMessageBox('close');
										$('.start_btn').removeClass('start');
										TSP.practice.process.submitSpeakAnswer(videoResult, mode_type_gd);
									}
								}
	    						var speak_sentence = $('.proverb_information[data-id="'+tid+'"]');
	    						if(speak_sentence.length){
									videoResult[tid][resultTime]['result']['score'] = sen_score;
									var single_score = sen_score;
									if(sen_score > bestScore[tid] || videoBest[tid] == undefined || videoBest[tid] == null){
										videoBest[tid] = videoResult[tid];
									}
									if(single_score > bestScore[tid] || bestScore[tid] == undefined || bestScore[tid] == null){
										bestScore[tid] = single_score;
										var params = {};
										params.expand_id = tid;
										params.score = bestScore[tid];
								    	$.post(TinSoConfig.student + '/Expand/followRead.html', params, function(data){
								    		if(data.status){
								    			speak_sentence.find('.prover_height_points_show').html(sen_score);;
								    			record_flag =false;
		    								}
								    	});
									}
									speak_sentence.closest('.proverb_information').find('.record_tips').html('');
									return;
	    						}
    							var speak_sentence = $('.test_content .test_functional_content').find('.speak_sentence[data-id="'+tid+'"]');
	    						if(speak_sentence.length){
	    							if(sen_score == 0){
										videoResult[tid][resultTime]['result']['score'] = '0';
										var single_score = '0';
	    							}else{
										videoResult[tid][resultTime]['result']['score'] = sen_score;
										var single_score = sen_score;
	    							}
									if(single_score > bestScore[tid] || videoBest[tid] == undefined || videoBest[tid] == null){
										videoBest[tid] = videoResult[tid];
									}
									if(single_score > bestScore[tid] || bestScore[tid] == undefined || bestScore[tid] == null){
										bestScore[tid] = single_score;
										var params = {};
										params.id = tid;
										params.level = bestScore[tid];
								    	$.post(TinSoConfig.student + '/Skill/submitFunctionalNotionalResult.html', params, function(data){
								    		if(data.status){
									    		speak_sentence.siblings('.sentence_score').html('(最高分：'+single_score+'分)');
									    		speak_sentence.siblings().find('.single_record').addClass('current');
									    		$('.content_star_img[data-id='+tid+']').attr("data-score",single_score);
									    		$('.content_star_img[data-id='+tid+']').attr("data-time",resultTime);
									    		if(single_score >= 69){
									    			$('.content_star_img[data-id='+tid+']').addClass('red');
									    		}
		    								}else{
		    									MessageBox({
		    										content : '提交得分失败，请重试！',
		    										buttons : [{
		    											text : '我知道了',
		    											click : function(){
		    												$(this).dialog('close');
		    											}
		    										}]
		    									});
		    								}
								    	});
									}
									var sentences = $('.test_content.current .test_ctrl_area').find('.test_ctrl[data-act-type="2"]');
									if(arr_index == sentences.length){
										speak_sentence.closest('.test_content').find('.record_tips').html('');
										arr_index = 1;
										record_flag = false;
									}else{
										arr_index++;
									}
									return;
	    						}
	    						if($('.p_answerSubmit_btn').length == 0 && $('.primary_submit_btn').length == 0){
	    							return false;
	    						}
	    						var typeid = $('.test_content.current_test').find('.chosBox').val();
					    		var arr_score = $('.test_content[data-id="'+tid+'"]').closest('.test_sub_area').find('.sub_info').attr('data-score').split('|');
					    		arr_score.splice(arr_score.length - 1, 1);
    							var question_ascore = 0;
					    		if(sub_type == 1621 || sub_type == 1626 || sub_type == 1631){
	    							question_ascore = arr_score[arr_score.length - 1];
					    		}
					    		else if(sub_type == 6403 || sub_type == 6406 || sub_type == 6410 || sub_type == 6413 || sub_type == 6417 || sub_type == 6420 || sub_type == 6424 || sub_type == 6427){
					    			question_ascore = 1;
					    		}else{
	    							question_ascore = quesiton_index > arr_score.length ? arr_score[0] : arr_score[quesiton_index - 1];
					    		}
					    		var score = (sen_score*question_ascore/100).toFixed(1);
	    						var video_question_num = $('.test_content[data-id="'+tid+'"]').find('.test_ctrl[data-act-type="2"]').length;
	    						if(judge_speaking){
			    					if(video_question_num > 1 || sub_type == 1435 || sub_type == 1627){
			    						if(main_type == '7100'){
			    							if(quesiton_index == 1){
					    						var result_index = 0;
					    						var tmp_score = 0;
						    					if(videoResult != undefined && videoResult != null 
						    							&& videoResult[tid] != undefined && videoResult[tid] != null){
						    						$.each(videoResult[tid], function(i, obj){
						    							if(obj['result'] != undefined && obj['result']['score'] != undefined && result_index == 0){
						    								tmp_score = obj['result']['score'];
						    							}
						    							result_index++;
						    						});
						    					}
			    								$('.test_content[data-id="'+tid+'"]').find('.left_area:eq(0)').html('得分：' + tmp_score);
			    							}else{
					    						var result_index = 0;
					    						var str = '';
						    					if(videoResult != undefined && videoResult != null 
						    							&& videoResult[tid] != undefined && videoResult[tid] != null){
						    						$.each(videoResult[tid], function(i, obj){
						    							if(result_index > 0){
						    								if(obj['result'] != undefined && obj['result']['score'] != undefined && result_index > 0){
							    								str += '问题'+result_index+'得分:'+obj['result']['score']+'&nbsp;';
							    							}else{
							    								str += '问题'+result_index+'得分:0&nbsp;';
							    							}
						    							}
						    							result_index++;
						    						});
						    					}
					    						$('.test_content[data-id="'+tid+'"]').find('.left_area:eq(1)').html(str);
			    							}
			    						}else{
				    						var result_index = 0;
				    						var str = '';
					    					if(videoResult != undefined && videoResult != null 
					    							&& videoResult[tid] != undefined && videoResult[tid] != null){
					    						$.each(videoResult[tid], function(i, obj){
					    							result_index++;
					    							if(obj['result'] != undefined && obj['result']['score'] != undefined){
					    								str += '问题'+result_index+'得分:'+obj['result']['score']+'&nbsp;';
					    							}else{
					    								if(sub_type == 1435){
					    									str += '得分:'+obj['result']['score']+'&nbsp;';
					    								}
					    							}
					    						});
					    					}
				    						$('.test_content[data-id="'+tid+'"]').find('.left_area').html(str);
			    						}
			    					}else{
			    						if($('.test_content[data-id="'+tid+'"]').attr('data-type') == 1400 && sub_type != 1428 && sub_type != 1438){
			    							$('.test_content[data-id="'+tid+'"] .question_container .speak_sentence:eq("'+(quesiton_index-1)+'")').attr("data-time_flag",time_flag);
			    							$('.test_content[data-id="'+tid+'"] .question_container .speak_sentence:eq("'+(quesiton_index-1)+'")').attr("data-time-flag",time_flag);
			    							$('.test_content[data-id="'+tid+'"] .question_container .speak_sentence:eq("'+(quesiton_index-1)+'")').attr("data-sen_score",sen_score);
			    							$('.test_content[data-id="'+tid+'"] .question_container .speak_sentence:eq("'+(quesiton_index-1)+'")').next('.sentence_behind_space').removeClass('wait_background').html('('+sen_score+')');
			    							$('.test_content[data-id="'+tid+'"] .question_container .speak_sentence:eq("'+(quesiton_index-1)+'") .kouarea').removeClass('henxian');
			    							if(sen_score > 60){
		    									$('.test_content[data-id="'+tid+'"] .question_container .speak_sentence:eq("'+(quesiton_index-1)+'")').addClass('pass_font');
		    								}else{
		    									$('.test_content[data-id="'+tid+'"] .question_container .speak_sentence:eq("'+(quesiton_index-1)+'")').addClass('no_pass_font');
		    								}
			    						}else if(sub_type == 6403 || sub_type == 6406 || sub_type == 6410 || sub_type == 6413 || sub_type == 6417 || sub_type == 6420 || sub_type == 6424 || sub_type == 6427){
			    							var speak_sen = $('.test_content[data-id="'+tid+'"] .question_container .question_p:eq(0)');
			    							var sen_txt = speak_sen.text().replace(/(\(\d+\))/, '');
			    							speak_sen.removeClass('pass_font no_pass_font').text(sen_txt + '(' + sen_score + ')');
			    							if(sen_score > 60){
			    								speak_sen.addClass('pass_font');
			    							}else{
			    								speak_sen.addClass('no_pass_font');
			    							}
			    							$('.test_ctrl_info_area').hide().find('.info_hint').empty();
			    						}else if(main_type == 6100){
			    							var font_class = sen_score < 60 ? 'no_pass_font' : 'pass_font';
			    							$('.test_content[data-id="'+tid+'"]').find('.sentence_show').addClass(font_class)
			    							$('.test_content[data-id="'+tid+'"]').find('.sentence_show .lccj_speak_sen_score').removeClass('sentence_behind_space wait_background').text('('+sen_score+')');
			    						}else{
			    					    	var shids = [538777,538779,538782,538783,538784,538794,538802,538805,538806,538807,538875,538876,538877,538878,538879,538880,538881,
			    							    538882,538883,538884,538885,538886,538887,538888,538889,538890,538891,538892,538893,538894,538895,538896,538897,538898,538899,
			    							    538900,538901,538902,538903,538904,538905,538906,538907,538908,538909,538910,538911,538912,538913,538914,544241,
			    							    560248,560247,560246,560225,560224,560223,560222,560220,560217,560216];
			    							if(typeof practice_id && $.inArray(parseInt(practice_id), shids) > -1){
			    								$('.test_content[data-id="'+tid+'"]').find('.left_area').html('录音判分结束！');
			    							}else{
			    								$('.test_content[data-id="'+tid+'"]').find('.left_area').html('录音得分：'+sen_score);
			    							}
			    						}
			    					}
	    						}
							}
						});
					}
				});
			}
			var video_status = true;
			if(videoResult != undefined){
				$.each(videoResult, function(tid, objs){
					if(objs != undefined){
						$.each(objs, function(i, obj){
							if(obj['result'] == undefined || obj['result']['count'] == undefined){
								video_status = false;
							}
						});
					}
				});
			}
			if(video_status){
				$('body').attr('data-current-test-id' , '');
			}
	    	var wait_status = $('.main_content_box').attr('data-wait-status');
	    	if(wait_status == '1'){
				if(videoResult != undefined){
					$.each(videoResult, function(tid, objs){
						if(objs != undefined){
							$.each(objs, function(i, obj){
								if(obj['result'] == undefined || obj['result']['count'] == undefined){
									video_status = false;
								}
							});
						}
					});
				}
				if(video_status){
		    		$('.p_answerSubmit_btn').removeClass('disabled');
		    		isZeroDialog();
				}
	    	}
		},
		asrrecorder : {
			sendToJavaScript : function() {
				$("#AsrRecorder").removeClass("full_screen").addClass('recorder_ctn');
				if(window.location.pathname == "/Skill/functionalNotional.html"){
					$('.chapter_cnt:first-child .list_chapter').click();
					$('.chapter_cnt:first-child').find('ul li:first-child').click();
				}else{
					if($('.test_content[data-kind="1"]').length || $('.test_content[data-kind="2"]').length 
							|| $('.test_content[data-kind="3"][data-type=6300]').length){
						TSP.practice.process.downloadAudioFile();
					}
					if($('.test_content[data-kind="2"]').length){
						TSP.practice.isAutoPractice();
					}
				}
			},
			hideFlash : function(){
				$("#AsrRecorder").hide();
			},
			recordlog :　function(str){
				console.log(str);
			},
			setResult　: function(time, result, mp3, testId){
				var time_flag = time;
				var videoRes = result;
				if(videoRes &&  mp3){
					videoRes['mp3'] = mp3;
				}else{
					videoRes = new Object();
					videoRes['mp3'] = '';
				}
				var tid = testId;
				TSP.practice.setResult(time_flag, videoRes, tid);
			},
			playBackToJS : function(playbackPercent){
				$('.test_ctrl_info_area').show();
				$('.test_ctrl_info_area .percentage_gray').show();
				$('.test_ctrl_info_area .waveform_container').hide();
				$('.test_ctrl_info_area .info_hint').html('播放录音');
				$('.test_ctrl_info_area .play_mp3_area .remainder_time_area').hide();
				$('.test_ctrl_info_area .play_mp3_area .percentage_bule').css('width', playbackPercent+'%');
				if(playbackPercent == 100){
					$('.test_ctrl_info_area').hide();
					$('.trans_test_ctrl_info_area').removeClass('recording');
				}
			}
		},
		process : {
			downloadAudioFile : function(){
				var hasVideo = false;
				if(($('.test_content[data-kind="2"]').length
					|| $('.test_content[data-kind="3"][data-subtype="6403"]').length
					|| $('.test_content[data-kind="3"][data-subtype="6406"]').length
					|| $('.test_content[data-kind="3"][data-subtype="6410"]').length
					|| $('.test_content[data-kind="3"][data-subtype="6413"]').length
					|| $('.test_content[data-kind="3"][data-subtype="6417"]').length
					|| $('.test_content[data-kind="3"][data-subtype="6420"]').length
					|| $('.test_content[data-kind="3"][data-subtype="6424"]').length
					|| $('.test_content[data-kind="3"][data-subtype="6427"]').length)
					&& $('.p_paper_cnt').attr('data-page') != 'record'
				){
					TSP.init({
						player : {},
						recorder : {}
					});
					hasVideo = true;
 				}else{
 					TSP.init({
 						player : {}
 					});
 					hasVideo = false;
 				}
				TSP.audio.files.list = {};
				TSP.audio.files.length = 0;
				var la_names = new Array();
				$('.test_content').find('.p_Laudio').each(function(i, n){
					var la_name = $(this).attr('data-mp3');
					if(la_name != undefined && la_name != '' && la_name != 0 && $.inArray(la_name, la_names) == -1 && la_name != '1.mp3'){
						TSP.audio.files.addFile(la_name, TinSoConfig.sta + '/book/mp3/'+la_name);
						la_names.push(la_name);
					}
				});
				$('.test_content').find('.test_ctrl_area li.test_ctrl').each(function(i, n){
					var la_name = $(this).attr('data-mp3-path');
					if(la_name != undefined && la_name != '' && $.inArray(la_name, la_names) == -1 && la_name != '1.mp3'){
						TSP.audio.files.addFile(la_name, TinSoConfig.sta + '/book/ctrl/'+la_name);
						la_names.push(la_name);
					}
				});
				$('.test_content').find('.speak_sentence').each(function(i, n){
					var la_name = $(this).attr('data-mp3');
					if(la_name != undefined && la_name != '' && $.inArray(la_name, la_names) == -1 && la_name != '1.mp3'){
						TSP.audio.files.addFile(la_name, TinSoConfig.sta + '/book/mp3/'+la_name);
						la_names.push(la_name);
					}
				});
				$('.test_content').find('.question_container .question_p.china').each(function(i, n){
					var la_name = $(this).attr('data-mp3');
					if(la_name != undefined && la_name != '' && $.inArray(la_name, la_names) == -1 && la_name != '1.mp3'){
						TSP.audio.files.addFile(la_name, TinSoConfig.sta + '/book/mp3/'+la_name);
						la_names.push(la_name);
					}
				});
				$('.test_content').each(function(i, n){
					var record_mp3 = $(n).attr('data-record-mp3');
					if(record_mp3 != '' && record_mp3 != undefined){
						var mp3_arr = record_mp3.split(',');
						for(var j in mp3_arr){
							if(mp3_arr[j] == ''){
								continue;
							}
							if(mp3_arr[j].search('/')){
								var la_name = mp3_arr[j].substr(mp3_arr[j].lastIndexOf('/') + 1);
							}else{
								var la_name = mp3_arr[j];
							}
							if(mp3_arr[j].search('http') >= 0){
								TSP.audio.files.addFile(la_name, mp3_arr[j]);
								la_names.push(la_name);
							}
						}
					}
				});
				if(typeof learn_knowledges != 'undefined' && learn_knowledges.length){
					$.each(learn_knowledges, function(i, n){
						if(n.knowledge_type == 1){
							if(n.id == undefined){
								return true;
							}
							var id_path = parseInt(n.id) + '.mp3';
							var sen_path = parseInt(n.id) + '_1.mp3';
							TSP.audio.files.addFile(n.id, TinSoConfig.sta + '/book/mp3/'+ id_path);
							la_names.push(id_path);
							TSP.audio.files.addFile(sen_path, TinSoConfig.sta + '/book/mp3/'+ sen_path);
						}else{
							if(n.voice_path == undefined){
								return true;
							}
							var sen_path = parseInt(n.voice_path) + '_1.mp3';
							TSP.audio.files.addFile(n.voice_path, TinSoConfig.sta + '/book/mp3/'+ n.voice_path);
							la_names.push(n.voice_path);
							TSP.audio.files.addFile(sen_path, TinSoConfig.sta + '/book/mp3/'+ sen_path);
						}
						la_names.push(sen_path);
					});
				}
				TSP.audio.files.loadFiles();
				if(!hasVideo){
					TSP.practice.isAutoPractice();
				}
			},
			getReadVoiceScore : function(score){
				var iStandScore;
				if(score >= 75){
		        	iStandScore = (score - 75) * 10 / 25 + 90;
				}else if(score >= 65){
					iStandScore = score + 15;
				}else if(score >= 50){
					iStandScore = (score - 50) * 10 / 15 + 70;
				}else{
					iStandScore = 0;
		        }
		        return iStandScore;
			},
			getReadVoiceSenNumByScore : function(score){
				if(score >= 70){
		        	return 200;
				}else if(score >= 65){
					return 180;
				}else if(score >= 60){
					return 150;
				}else if(score >= 55){
					return 100;
				}else{
					return 0;     
				}
			},
			getTopicVoiceSenNumByScore : function(score){
				if(score >= 70){
					return 200;
				}else if(score >= 65){
					return 150;
				}else if(score >= 60){
					return 130;
				}else if(score >= 55){
					return 100;
				}else{
					return 0;
				}
			},
			getTopicVoiceScore : function(score){
				var iStandScore;
				if(score >= 75){
					iStandScore = (score-75)*10/25 + 90;
				}else if(score >= 65){
					iStandScore = score + 15;
				}else if(score >= 50){
					iStandScore = (score-50)*10/15 + 70;
				}else if(score >= 40){
					iStandScore = score + 20;
				}else{
					iStandScore = 0;
				}
				return iStandScore;
			},
			calculateVideoSenScore : function(score){
				if(score < 55){
					score = 0;
				}else if(score >= 55 && score < 70){
					score = parseInt(2 * score - 45);
					score = Math.random() > 0.5 ? score + 1 : score;
				}else if(score >= 70 && score < 100){
					score = parseInt(0.25 * score + 75);
				}
				return score;
			},
			calculateVideoHTJSScore : function(score){
				if(score < 55){
					score = 0;
				}else if(score >= 55 && score < 70){
					score = parseInt(2 * score - 45);
					score = Math.random() > 0.5 ? score + 1 : score;
				}else if(score >= 70 && score < 100){
					score = parseInt(0.25 * score + 75);
				}
				return score;
			},
			calculateVideoTotalScoreForNew : function(tid, main_type, sub_type, scores, video_num, sen_num, isSenNum){
				var score = 0;
				var ascore = 0;
				main_type = parseInt(main_type);
				sub_type = parseInt(sub_type);
				if(isNaN(sen_num)){
					sen_num = 1;
				}
				if(!sen_num){
					sen_num = 1;
				}
				if(isNaN(video_num)){
					video_num = 1;
				}
				if(!video_num){
					video_num = 1;
				}
				if(videoResult != undefined && videoResult != null 
						&& videoResult[tid] != undefined && videoResult[tid] != null){
					var num = 0;
					if(scores != undefined){
						scores = scores.split('|');
						if(scores && scores.length){
							scores.splice(scores.length - 1, 1);
						}
						for(var i = 0; i < scores.length; i++){
							if(isNaN(scores[i])){
								scores[i] = 1;
							}
							if(!scores[i]){
								scores[i] = 1;
							}
						}
					}
					if(video_num > 1){
						var index = 0;
						$.each(videoResult[tid], function(i, obj){
							var qascore = parseFloat(scores.length ? (scores.length > index ? scores[index] : scores[0]) : 0);
							if(video_num > index){
								ascore += qascore;
							}
							if(isNaN(ascore)){
								ascore = 1;
							}
							if(!ascore){
								ascore = 1;
							}
							if(obj['result'] && obj['result']['score']){
								var qscore = parseInt(obj['result']['score']);
								if(isNaN(qscore)){
									qscore = 0;
								}
								if(!qscore){
									qscore = 0;
								}
								if(qscore){
									var tmp = parseFloat(Math.ceil(qscore * qascore / 100.0) * 2 / 2.0);
									tmp = tmp > qascore ? qascore : tmp;
									score += tmp;
								}
							}
							index++;
						});
					}else{
						if(sub_type == 1621 || sub_type == 1626 || sub_type == 1631){
							ascore  = parseFloat(scores.length ? scores[scores.length - 1] : 0);
						}else{
							ascore  = parseFloat(scores.length ? scores[0] : 0);
						}
						if(isNaN(ascore)){
							ascore = 1;
						}
						if(!ascore){
							ascore = 1;
						}
						var eightyNum = 0;
						var scoreNum = 0;
						$.each(videoResult[tid], function(i, obj){
							num++;
							if(obj['result'] && obj['result']['score']){
								var question_score = obj['result']['score'];
								if(isNaN(question_score)){
									question_score = 0;
								}
								if(!question_score){
									question_score = 0;
								}
								if(question_score >= 80){
									eightyNum++;
								}
								if(main_type == 1400 && sub_type == 1403 && question_score >= 70){
									question_score = 100;
								}
								if(question_score > 0){
									scoreNum++;
								}
								score += parseInt(question_score);
							}
						});
						if(main_type == 1400){
							if(sen_num > num && isSenNum){
								num = sen_num;
							}
						}
						if(num && ascore){
							if(main_type == 1400 && sub_type == 1403){
								score = parseFloat(score * ascore  * 2 / num / 100 / 2.0);
							}else if(main_type == 1400 && sub_type != 1428 && sub_type != 1438){
								score = parseFloat(score * ascore  * 2 / num / 100 / 2.0);
								if(scoreNum == num || eightyNum * 2 >= num){
									score = score + 0.5;
								}
								if(score > 0 && score < 0.5){
									score = 0.5;
								}else{
									if(score > Math.round(score)){
										score = Math.round(score) + 0.5;
									}else if(score == Math.round(score)){
										score = Math.round(score);
									}else{
										if(score == Math.floor(score * 2) / 2){
											score = Math.floor(score * 2) / 2;
										}else{
											score = Math.round(score);
										}
									}
								}
							}else{
								if(main_type == 7200 || sub_type == 1428 || sub_type == 1438){
									score = (score / 100 * ascore).toFixed(1);
								}else{
									score = parseFloat((Math.floor(score * ascore / num / 100 + 0.5)) * 2 / 2.0);
								}
							}
						}
					}
					if(isNaN(score)){
						score = 0;
					}
					if(!score){
						score = 0;
					}
					if (1403 == sub_type || 1503 == sub_type || 1603 == sub_type){
		            	score= Math.round(score);
		            }
		            score = score > ascore ? ascore : score;
				}
				return score;
			},
			calculateVideoTotalScore : function(tid, ascore){
				var main_type = $('.test_content[data-id="' + tid + '"]').attr('data-type');
				var sub_type = $('.test_content[data-id="' + tid + '"]').attr('data-subtype');
				switch(main_type){
					case 1400: 
						var asrNum = 0;
						var levelScore = 65;
						var iW = 0;
						var iC = 0;
						var senNum = $('.test_content[data-id="'+tid+'"] .question_container .speak_sentence').length;
						var zeroNum = senNum;
						var sum = 0;
    					if(videoResult != undefined && videoResult != null 
    							&& videoResult[tid] != undefined && videoResult[tid] != null){
    						$.each(videoResult[tid], function(i, obj){
    							if (obj['result']['score'] >= levelScore) {
    								sum += practice.process.getReadVoiceScore(parseInt(obj['result']['score']));
    								asrNum += practice.process.getReadVoiceSenNumByScore(parseInt(obj['result']['score']));
    								zeroNum--;
    							}
    						});
    					}
				        iW = asrNum * 1.0 / senNum;
				        iW = iW * 70 / 100;
				        if(iW >= 70){
				        	iW = 70;
				        }
				        iC = sum * 1.0 / senNum;
				        iC = iC * 30 / 100;
				        if(iC >= 30){
				        	iC = 30;
				        }
				        sum = (iW + iC);
				        if(sum >= 100){
				        	sum = 100;
				        }
			            if(sum > (1 - parseFloat(zeroNum * 1.0 / senNum)) * 100){
			            	sum = parseInt((1 - parseFloat(zeroNum * 1.0 / senNum)) * 100);
			            }
			            var answer_score = parseFloat(Math.floor(sum / 100.0 * ascore) + parseInt(((sum / 100.0 * ascore) % 1) * 2 + 0.5) / 2.0);
			            if ('1403' == sub_type){
			            	answer_score= Math.round(answer_score);
			            }
			            if(answer_score > ascore){
			            	answer_score = ascore;
			            }
			            return answer_score;
					case 1500: 
						var fScore_temp = 0;
						var fPercent = 0;
						var maxConf = 70;
						var minConf = 60;
						var midConf = 65;
						var fScore = ascore;
						var answer_score = 0;
						var question_num = $('.test_content[data-id="'+tid+'"] .test_ctrl[data-act-type="2"]').length;
    					if(videoResult != undefined && videoResult != null 
    							&& videoResult[tid] != undefined && videoResult[tid] != null){
    						$.each(videoResult[tid], function(i, obj){
    							if('1509' == sub_type){
    								if(obj['result']['score'] < minConf){
    									fPercent = 0;
    								}else if(minConf <= obj['result']['score'] && obj['result']['score'] < midConf){
    									fPercent = parseFloat(1/3.0);
    								}else if(midConf <= obj['result']['score'] && obj['result']['score'] < maxConf){
    									fPercent = parseFloat(2/3.0);
    								}else if(obj['result']['score'] >= maxConf){
    									fPercent = 1;
    								}
    								fScore_temp = Math.floor(fPercent * fScore) + parseInt(parseFloat(fPercent * fScore % 1) * 2 + 0.5) / 2.0;;
    							}else{
    								if(obj['result']['score'] < minConf){
    									fPercent = 0;
    								}else if(minConf <= obj['result']['score'] && obj['result']['score'] < maxConf){
    									fPercent = 0.5;
    								}else if(obj['result']['score'] >= maxConf) {
    									fPercent = 1;
    								}
    								fScore_temp= Math.floor(fPercent * fScore) + parseInt(parseFloat(fPercent * fScore % 1) * 2 + 0.5) / 2.0;
    							}
    							answer_score += fScore_temp;
    						});
    					}
						if(question_num > 0){
							answer_score = parseInt(parseFloat(answer_score / question_num) * 2) / 2.0;
						}
						if ('1503' == sub_type) {
							answer_score= Math.round(answer_score);
						}
			            if(answer_score > ascore){
			            	answer_score = ascore;
			            }
						return answer_score;
					case 1600: 
						var asrNum = 0;
						var levelScore = 60;
						var iW = 0;
						var iC = 0;
						var senNum = $('.test_content[data-id="'+tid+'"] .question_division_line .speak_sentence').length;
						var sum = 0;
    					if(videoResult != undefined && videoResult != null 
    							&& videoResult[tid] != undefined && videoResult[tid] != null){
    						$.each(videoResult[tid], function(i, obj){
    							if(obj['result']['score'] >= levelScore){
    								sum += practice.process.getTopicVoiceScore(obj['result']['score']);
    								asrNum += practice.process.getTopicVoiceSenNumByScore(obj['result']['score']);
    							}
    						});
    					}
				        iW = asrNum * 1.0 / senNum;
				        iW = iW * 70 / 100;
				        if(iW >= 70){
				        	iW = 70;
				        }
				        iC = sum * 1.0 / senNum;
				        iC = iC * 30 / 100;
				        if(iC >= 30){
				        	iC = 30;
				        }
				        sum = (iW + iC);
				        if(sum >= 100){
				        	sum = 100;
				        }
				        var answer_score = parseFloat(Math.floor(sum / 100.0 * ascore) + parseInt(parseFloat(sum / 100.0 * ascore % 1) * 2 + 0.5) / 2.0);
				        if('1603' == sub_type){
				        	answer_score= Math.round(answer_score);
				        }
			            if(answer_score > ascore){
			            	answer_score = ascore;
			            }
						return answer_score;
					default :
						return 0;
				}
			},
			calculateTestLevel : function(level, lastTime, ascore, score, curType){
				var decay = 0
				if(lastTime == 0){
					decay = 0;
				}else{
					var nowTime = Date.parse(new Date());
					lastTime = new Date(lastTime.replace(/-/g, '/')).getTime();
					var diff = (nowTime - lastTime)/(60*60*24);
					if(diff > 365){
						decay = 1;
					}else{
						decay = 1 - (diff / 365.0).toFixed(2);
					}
				}
				if(ascore == 0){
					ascore = 1;
				}
				var rate = (score / ascore * 1.00).toFixed(2);
				if(curType == 2){
					if((score/ascore)*100 >= 60){
						level = 100;
					}else{
						level = level * 0.3 * decay + rate * 100 * 0.7;
					}
				}else{
					if(ascore == score){
						level = 100;
					}else{
						level = level * 0.3 * decay + rate * 100 * 0.7;
					}	
				}
				if(level > 100){
					level = 100;
				}
				return level.toFixed(0);
			},
			calculateKnowledgeLevel : function(level, lastTime, ascore, score){
				var decay = 0
				if(lastTime == 0){
					decay = 0;
				}else{
					var nowTime = Date.parse(new Date());
					lastTime = new Date(lastTime.replace(/-/g, '/')).getTime();
					var diff = (nowTime - lastTime)/(60*60*24);
					if(diff > 365){
						decay = 1;
					}else{
						decay = 1 - (diff / 365.0).toFixed(2);
					}
				}
				if(ascore == 0){
					ascore = 1;
				}
				var rate = (score / ascore * 1.00).toFixed(2);
				level = level * 0.3 * decay + rate * 100 * 0.7;
				if(level > 100){
					level = 100;
				}
				return level.toFixed(0);
			},
			convertAnswer : function(str){
				return String.fromCharCode(String(str).charCodeAt() - 16);
			},
			convertAnswerByNum : function(str){
				return String.fromCharCode(String(str).charCodeAt() + 16);
			},
			submitHomework : function(answers, precord_id){
				var judge_speaking = window.judge_speaking || false;
		    	var homework = {
		    		'count' : 0, 'expect_time' : '','full_mark' : 0, 'detail' : new Array(),
		    		'total_score' : 0, 'precord_id' : precord_id, 'judge_speaking' : judge_speaking
		    	};
		    	var shids = [538777,538779,538782,538783,538784,538794,538802,538805,538806,538807,538875,538876,538877,538878,538879,538880,538881,
				    538882,538883,538884,538885,538886,538887,538888,538889,538890,538891,538892,538893,538894,538895,538896,538897,538898,538899,
				    538900,538901,538902,538903,538904,538905,538906,538907,538908,538909,538910,538911,538912,538913,538914,544241,
				    560248,560247,560246,560225,560224,560223,560222,560220,560217,560216];
		    	var count = 0;
		    	$('.test_sub_area').each(function(i, n){
		        	var score = 0;
		        	var ascore = 0;
		        	homework['detail'][i] = new Object();
		        	homework['detail'][i]['sub_title'] = $(this).attr('data-title');
		    		test_content = $(this).find('.test_content');
		    		test_content.each(function(){
		    			var id = $(this).attr('data-id');	
		    			score = Math.formatFloat(score + parseFloat(answers[id]['score']));	
		    			ascore = Math.formatFloat(ascore + parseFloat(answers[id]['ascore']));
		    			count++;
		    		});
		    		homework['detail'][i]['ascore'] = ascore;
		    		if(typeof practice_id && $.inArray(parseInt(practice_id), shids) != -1){
		    			homework['detail'][i]['score'] = '--';
			    		homework['total_score'] = '--';
		    		}else{
		    			homework['detail'][i]['score'] = parseFloat(score) == 0 ? 0 : parseFloat(score);
			    		homework['total_score'] = Math.formatFloat(homework['total_score'] + parseFloat(score));
		    		}
		    		homework['count'] = count;
		    		homework['full_mark'] = Math.formatFloat(homework['full_mark'] + parseFloat(ascore));
		    		homework['expect_time'] = Math.ceil((total_time)/60);
		    		if(struct_type == 1 || struct_type == 2){
		    			homework['actual_time'] = Math.floor(time / 60);
		    			homework['actual_time_s'] = time % 60;
		    		}else{
		    			homework['actual_time'] = Math.floor((total_time - count_down_time)/60);
		    			homework['actual_time_s'] = (total_time - count_down_time)%60;
		    		}
				});
	    		if(typeof practice_id && $.inArray(parseInt(practice_id), shids) > -1){
		    		homework['percent'] = '--';
	    		}else{
		    		homework['percent'] = Math.round(homework['total_score']/homework['full_mark']*100);
	    		}
		    	$('.H_submit_homework_cnt').html($('#submitHomework').template(homework));
		    	var height = $('.H_submit_homework_cnt').outerHeight();
		    	if(height < 580){
		    		$(".H_submit_homework_cnt").css({"height":height, "padding-top":(580-height)/2});
		    	}else{
		    		$(".H_submit_homework_cnt").css("padding","20px");
		    	}
				var isSubmit = $('.p_paper_cnt').attr("data-submit");
				if(isSubmit){
					$('.submit_homework').hide();
					$('.results').removeClass('hide');
				}
				var endStatus = $('.p_paper_cnt').attr('data-end-status');
				if(endStatus == 4){
					if(2 == classType){
						$('.submit_homework.submit_teacher').html('补交给智慧老师');
					}else{
						$('.submit_homework.submit_teacher').html('补交给老师');
					}
				}
			},
			submitAnswerCheck : function(){
				clearInterval(time_id);
				if(typeof self_practice_key != 'undefined'){
					clearInterval(self_practice_key);
				}
				if($('.test_content[data-kind="1"]').length || $('.test_content[data-kind="2"]').length){
					TSP.audio.player.stop();
					clearInterval(remainder_key);
					clearInterval(play_key);
					clearInterval(tape_remainder_key);
					$('.test_ctrl_info_area').hide();
					$('.trans_test_ctrl_info_area').removeClass('recording');
					if(!is_primary){
						$('.btn_play').html('播放音频');
					}
					if(window.location.pathname == '/Competition/paper.html'){
						$('.btn_play').removeClass('start');
					}
				}
				if($('.test_content[data-kind="2"]') != undefined && $('.test_content[data-kind="2"]').length > 0){
					var video_status = true;
					var cur_time = (new Date()).getTime();
					$.each(videoResult, function(i, objs){
						if(objs != undefined && objs != null){
							$.each(objs, function(j, obj){
								if(obj['end_time'] == undefined){
									videoResult[i][j]['end_time'] = cur_time;
								}
								if(obj['result'] == undefined || obj['result']['count'] == undefined){
									video_status = false;
								}
							});
						}
					});
					if(!video_status){
						if(TSP.audio.recorder.inited){
							TSP.audio.recorder.stop();
						}
    		    		$('.p_answerSubmit_btn').addClass('disabled');
                    	$('.btn_play').addClass('disabled');
		    	    	$('.p_tests_area input').attr('disabled', 'disabled');
		    	    	$('.p_tests_area textarea').attr('disabled', 'disabled');
		    	    	$('.p_tests_area select').attr('disabled', 'disabled');
		    	    	$('.main_content_box').attr('data-wait-status', 1);
						MessageBox({
		                    content : '目前有音频未识别，请等待判分。',
		                    buttons : [
		                    {
		                        text : '等待判分',
		                        click : function(){
		                            $(this).dialog('close');
		                            return false;
		                        }
		                    }]
		                });
						setTimeout(submitAnswerFunc, 180000);
					}else{
						isZeroDialog();
					}
				}else{
					if(is_primary){
                		TSP.practice.primary.question.submitAnswer();
                	}else{
                		TSP.practice.process.submitAnswer();
                	}
				}
			},
			submitAnswer : function(){
				LoadingMessageBox('数据计算中...');
				if(typeof record_check_interval != 'undefined' && !!record_check_interval){
					clearInterval(record_check_interval);
					record_check_interval = undefined;
				}
				if(type == 'homework' && isfree){
					$('.p_answer_list ul li').addClass('freeColor');
				}
				if(judge_speaking){
					if(window.location.pathname != '/Competition/paper.html'){
		    			$('.test_content[data-kind="1"] .p_operationBtn_container').html($('#listentBtnAnswerTemp').template());
		    			if($('.test_content[data-kind="2"]') != undefined && $('.test_content[data-kind="2"]').length > 0){
		    				$('.question_container .speak_sentence').removeClass('high_light_font');
		    				$('.test_content').find('.left_area').html('');
		    				$('.test_content[data-kind="2"]').each(function(i, obj){
		    					var answer_flag = $(this).find('.question_division_line').length > 0 ? true : false;
		    					var audio_flag = false;
		    					if($(this).find('.p_Laudio').length > 0 
		    							&& ($(this).find('.p_Laudio').attr('data-mp3') != undefined 
		    									&& $(this).find('.p_Laudio').attr('data-mp3') != ''
		    									&& $(this).find('.p_Laudio').attr('data-mp3') != 0)){
		    						audio_flag = true;
		    					}else{
		    						if($(this).find('.speak_sentence:not(.no_audio)') && $(this).find('.speak_sentence:not(.no_audio)').length){
		    							audio_flag = true;
		    						}
		    					}
		    					var video_flag = $(this).find('.question_li:not(.question_li_1520)').length > 0 ? false : true;
		    					var btn_tmp = 'speackingBtn';
		    					if(audio_flag && $(this).attr('data-subtype') != '1535'){
		    						btn_tmp = btn_tmp + 'Audio';
		    					}
		    					if(video_flag){
		    						btn_tmp = btn_tmp + 'Video';
		    					}
		    					if(answer_flag){
		    						btn_tmp = btn_tmp + 'Answer';
		    					}
		    					btn_tmp = btn_tmp + 'Temp';
		    					$(this).find('.p_operationBtn_container').html($('#'+btn_tmp).template());
		    				});
		    				$('.test_content[data-kind="2"]').find('.question_li:not(.question_li_1520)').each(function(i, obj){
		    					if($(obj).html()){
		    						if($(obj).find('.btn_question_area').length){
			    						$(obj).find('.btn_question_area').html($('#speackingBtnQuestionTemp').template());
			    					}else{
			    						if($(obj).closest('.test_content').attr('data-subtype') == 1540 || $(obj).closest('.test_content').attr('data-subtype') == 1541){
			    							$(obj).append($('#noSpeackingBtnQuestionTemp').template());
			    						}else{
			    							$(obj).append($('#speackingBtnQuestionTemp').template());
			    						}
			    					}
		    					}
		    				});
		    				$('.test_content[data-kind="2"]').find('.sub_type_1520 .btn_question_area').remove();
		    				$('.test_content[data-type="7100"]').each(function(i, obj){
		    					if($(obj).find('.p_operationBtn_container').length == 2){
		    						$(obj).find('.p_operationBtn_container:eq(1) .right_area').html('');
		    					}
		    					if($(obj).find('.question_division_line:eq(0)').length){
		    						var one_obj = $(obj).find('.question_container .question_content .question_p.china:eq(1)');
		    						if($(one_obj).next().hasClass('question_division_line')){
		    							$(one_obj).next().html($(obj).find('.question_division_line:eq(0)').html());
		    						}else{
		    							$(one_obj).after($(obj).find('.question_division_line:eq(0)'));
		    						}
		    					}
		    					$(obj).closest('.test_content').find('.question_container .question_content .question_content_str').remove();
		    					$(obj).closest('.test_content').find('.china_q').each(function(j, ebj){
		    						var qs_str = $(ebj).html();
		    						if(qs_str != ''){
		        						if($(ebj).closest('.test_content').find('.question_container .question_content .question_content_str:eq("'+j+'")').length){
		        							qs_str = '<div class="dib question_content_str_num">' + (j + 1) + '.</div>'
		    									+ '<div class="dib question_content_str_info">' + qs_str + '</div>';
		        							$(obj).closest('.test_content').find('.question_container .question_content .question_content_str:eq("'+j+'")').html(qs_str);
		        						}else{
		            						qs_str = '<div class="dib dib-wrap question_content_str">' 
		        								+ '<div class="dib question_content_str_num">' + (j + 1) + '.</div>'
		        								+ '<div class="dib question_content_str_info">' + qs_str + '</div>' + '</div>';
		        							$(obj).closest('.test_content').find('.question_container .question_content').append(qs_str);
		        						}
		    						}
		    					});
		    					var tmp_obj = $(obj).find('.question_division_line:eq(1)');
		    					$(tmp_obj).find('.speak_sentence').each(function(j, ebj){
		    						if($(ebj).closest('.test_content').find('.question_content_str:eq("'+j+'") .question_content_str_info .question_division_line').length){
		    							$(ebj).closest('.test_content').find('.question_content_str:eq("'+j+'") .question_content_str_info .question_division_line').html($(ebj).html());
		    						}else{
		    							$(ebj).closest('.test_content').find('.question_content_str:eq("'+j+'") .question_content_str_info').append(ebj);
		    						}
		    					});
		    					$(this).find('.question_content_str').each(function(j, ebj){
		    						if($(ebj).next().hasClass('.btn_info_area')){
		    							$(ebj).next().remove();
		    						}
		    						$(ebj).after($('#speackingBtnAudioVideoTemp').template());
		    					});
		    					$(tmp_obj).remove();
		    				});
		    			}
		    			$('.test_content[data-kind="3"] .p_operationBtn_container').html($('#writeBtnAnswerTemp').template());
					}
	    			var source = $('.p_paper_cnt').attr('data-source');
	    			var isSubmit = !!parseInt($('.p_paper_cnt').attr('data-submit'));
	    			var struct_type = $('.p_paper_cnt').attr('data-struct-type');
	    			if((source == 'hw' || type == 'homework') && !isSubmit){
	    				$('.test_content .p_operationBtn_container').find('.btn_answer').remove();
	    			}
				}
				var answers = new Object();
		    	var practice_score = 0;
		    	var practice_total_score = 0;
    			if(!practice_data_save && $.isEmptyObject(practice_data)){
			    	$('.sub_test_area').each(function(r, s){
			    		if(is_primary){
				    		var arr_score = $(this).closest('.test_sub_area').find('.sub_info').attr('data-score').split('|');
			    		}else{
				    		var arr_score = $(this).find('.sub_info').attr('data-score').split('|');
			    		}
			    		arr_score.splice(arr_score.length - 1, 1);
			    		var question_num = 0;
			    		$(this).find('.test_content').each(function(i, n){
				    		var id = $(this).attr('data-id');
				    		var main_type = $(this).attr('data-type');
				    		var sub_type = $(this).attr('data-subtype');
				    		var test_level = $(this).attr('data-test-level');
				    		var last_time = $(this).attr('data-last-time');
				    		var ascore = 0;
				    		answers[id] = {'id' : id, 'qstype' : main_type, 'score' : 0, 'answer' : '', 'ascore' : 0, 
				    				'qsnum' : $(this).attr('data-count'), 'item_order' : 0, 'detail' : new Array(), 
				    				'old_level' : test_level, 'new_level' : 0};
				    		$(this).find('.question_container').each(function(j, m){
				    			question_num++;
								var small_test_score = question_num > arr_score.length ? parseFloat(arr_score[0]) : parseFloat(arr_score[question_num-1]);
								ascore = Math.formatFloat(ascore + small_test_score);
				    			var score = 0;
				    			var right_answer = $(this).find('.question_content .analysis .right_answer_class').attr('data-right-answer');
				    			var user_answer = null;
				    			var qid = $(this).attr('data-qid');
				    			var test_mold = $(this).find('.question_content').attr('data-test-mold');
					    		if(test_mold == 1 && sub_type != 1621 && sub_type != 1631 && sub_type != 1626 && sub_type != 1321 && sub_type != 1323 && sub_type != 1324 && sub_type != 1326 && $(m).find('input[type=radio]').length > 0){
				        			if(j > 0){
				        				answers[id]['answer'] = answers[id]['answer'] + '|';
				        			}
				    				user_answer = $(this).find('.question_content input:checked').val();
				    				user_answer = user_answer == undefined ? '' : user_answer;
				    				if(user_answer != '' && user_answer.charCodeAt() > 64 && user_answer.charCodeAt() < 106){
				    					user_answer = practice.process.convertAnswer(user_answer);
				    				}
				    				if(right_answer != '' && right_answer.charCodeAt() > 64 && right_answer.charCodeAt() < 106){
				    					right_answer = practice.process.convertAnswer(right_answer);
				    				}
				        			if(user_answer == right_answer){
				        				score = small_test_score;
			    						if(judge_speaking){
					        				$(this).find('.question_content input:checked').closest('label').addClass('radio_right_answer');
					        				$('.p_answer_list ul li[data-index='+qid+']').addClass('answer_list_right_class');
			    						}
				        			}else{
				        				score = small_test_score;
			    						if(judge_speaking){
					        				$(this).find('.question_content input:checked').closest('label').addClass('radio_right_answer');
					        				$('.p_answer_list ul li[data-index='+qid+']').addClass('answer_list_right_class');
			    						}
				        			}
					    		}else if(((test_mold == 2 && main_type != 2700) || (test_mold == 1 && (sub_type == 1621 || sub_type == 1631 || sub_type == 1626 || sub_type == 1321 || sub_type == 1323 || sub_type == 1324 || sub_type == 1326))) && $(m).find('input[type=text]').length > 0){
				    				user_answer = new Array();
				    				user_cmp_answer = new Array();
				        			var reg = new RegExp("[.,;,:,\,，。\’\'\"\?][]*","g");
				    				var initial_flag = false;
				    				$(this).find('.question_content input[type="text"]').each(function(k, obj){
				    					var tmp_answer = $.trim($(this).val());
				    					tmp_answer = tmp_answer == undefined ? '' : tmp_answer;
				    					user_answer.push(tmp_answer);
				    					tmp_answer = tmp_answer.replace(/[.,;,:,\,，\?]/g, ' ');
				    					tmp_answer = $.trim(tmp_answer);
				            			tmp_answer = tmp_answer.replace(reg, '');
					    				user_cmp_answer.push(tmp_answer);
				    	    			var prevNode = this.previousSibling;
				    	    			if(prevNode != null && prevNode.nodeType == 3 && $.trim(prevNode.nodeValue.substr(-1)) != '' && prevNode.length == 1){
				    	    				initial_flag = true;
				    	    			}
				    				});
				        			var ext_answer = $(this).find('.question_content .analysis .right_answer_class').attr('data-ext-answer');
				    				var right_answers = ext_answer == undefined ? new Array() : ext_answer.split('#');
				    				if(right_answers.length > 0){
				    					right_answers[right_answers.length - 1] = right_answer.toLowerCase();
				    				}else{
				    					right_answers[0] = right_answer;
				    				}
				    				var flag_answer = false;
				    				var right_word_num = 0;
				    				var answer_word_num = 0;
				    				for(var x in user_cmp_answer){
				    					if(user_cmp_answer[x] == ''){
				    						var right_answer_arr = right_answers[0].split('*');
				        					var right_answer_str = $.trim(right_answer_arr[x]).replace(reg, '');
				        					right_answer_str = right_answer_str.replace(/\r\n/g, '');
				        					right_answer_str = right_answer_str.replace(/\n/g, '');
				        					right_answer_str = right_answer_str.replace(/\s+/g, '*');
				        					right_answer_str = right_answer_str.split('*');
				        					answer_word_num += right_answer_str.length;
				    					} else {
				    						var right_word_num1 = 0;
				    						var answer_word_num1 = 0;
					    					for(var s in right_answers){
					    						var user_cmp_answer_r = user_cmp_answer[x];
					    						var right_answer_arr = right_answers[s].split('*');
					        					var right_answer_str = $.trim(right_answer_arr[x]).replace(/[.,;,:,\,，\?]/g, ' ');
					        					right_answer_str = $.trim(right_answer_str);
					        					right_answer_str = right_answer_str.replace(reg, '');
				        						right_answer_str = right_answer_str.replace(/\r\n/g, '');
				        						right_answer_str = right_answer_str.replace(/\n/g, '');
				        						right_answer_str = right_answer_str.replace(/\s+/g, '*');
				        						right_answer_str = right_answer_str.split('*');
				        						user_cmp_answer_r = user_cmp_answer_r.replace(/\r\n/g, '');
				        						user_cmp_answer_r = user_cmp_answer_r.replace(/\n/g, '');
				        						user_cmp_answer_r = user_cmp_answer_r.replace(/\s+/g, '*');
				        						user_cmp_answer_r = user_cmp_answer_r.split('*');
				        						for (var y = right_answer_str.length - 1; y >= 0; y--) {
				        							right_answer_str[y] = right_answer_str[y].toLowerCase();
				        						}
				        						for (var y = user_cmp_answer_r.length - 1; y >= 0; y--) {
				        							user_cmp_answer_r[y] = user_cmp_answer_r[y].toLowerCase();
				        						}
				        						var right_word_num2 = 0;
				    							var answer_word_num2 = right_answer_str.length;
				        						if (user_cmp_answer_r.length > right_answer_str.length) {
			        								for (var jx = 0; jx < user_cmp_answer_r.length; jx++) {
			        									if (jx == 0 && initial_flag) {
			        										if (right_answer_str[jx] == user_cmp_answer_r[jx].substr(1) || right_answer_str[jx].substr(1) == user_cmp_answer_r[jx] || right_answer_str[jx] == user_cmp_answer_r[jx]) {
			        											right_word_num2 += 1;
			        										}
			        									} else if ($.inArray(user_cmp_answer_r[jx], right_answer_str) != -1) {
				        									right_word_num2 += 1;
				        								}
				        							}
				        							if (right_word_num2 > answer_word_num2 / 2) {
				        								right_word_num2 = Math.ceil(answer_word_num2 / 2);
				        								if (right_word_num2 == answer_word_num2 == 1) {
				        									right_word_num2 = 0.5;
				        								}
				        							}
				        						} else if (user_cmp_answer_r.length == right_answer_str.length) {
				        							var word_flag = true;
				        							for (var jx = 0; jx < right_answer_str.length; jx++) {
				        								if (jx == 0 && initial_flag) {
				        									if (right_answer_str[jx] != user_cmp_answer_r[jx].substr(1) && right_answer_str[jx].substr(1) != user_cmp_answer_r[jx] || right_answer_str[jx] == user_cmp_answer_r[jx]) {
				        										word_flag = false;
				        									}
				        								} else if (user_cmp_answer_r[jx] != right_answer_str[jx]) {
				        									word_flag = false;
				        								}
				        							}
				        							if (word_flag) {
				        								right_word_num2 = answer_word_num2;
				        							} else {
				        								for (var jx = 0; jx < user_cmp_answer_r.length; jx++) {
				        									if (jx == 0 && initial_flag) {
				        										if (right_answer_str[jx] == user_cmp_answer_r[jx].substr(1) || right_answer_str[jx].substr(1) == user_cmp_answer_r[jx] || right_answer_str[jx] == user_cmp_answer_r[jx]) {
				        											right_word_num2 += 1;
				        										}
				        									} else if ($.inArray(user_cmp_answer_r[jx], right_answer_str) != -1) {
					        									right_word_num2 += 1;
					        								}
					        							}
					        							if (right_word_num2 > answer_word_num2 / 2) {
					        								right_word_num2 = Math.ceil(answer_word_num2 / 2);
					        							}
				        							}
				        						} else {
				        							for (var jx = 0; jx < user_cmp_answer_r.length; jx++) {
			        									if (jx == 0 && initial_flag) {
			        										if (right_answer_str[jx] == user_cmp_answer_r[jx].substr(1) || right_answer_str[jx].substr(1) == user_cmp_answer_r[jx] || right_answer_str[jx] == user_cmp_answer_r[jx]) {
			        											right_word_num2 += 1;
			        										}
			        									} else if ($.inArray(user_cmp_answer_r[jx], right_answer_str) != -1) {
				        									right_word_num2 += 1;
				        								}
				        							}
				        							if (right_word_num2 > answer_word_num2 / 2) {
				        								right_word_num2 = Math.ceil(answer_word_num2 / 2);
				        							}
				        						}
				        						if (answer_word_num1 == 0) {
				        							right_word_num1 = right_word_num2;
				        							answer_word_num1 = answer_word_num2;
				        						} else {
				        							if (answer_word_num2 != 0 && right_word_num2/answer_word_num2 > right_word_num1/answer_word_num1) {
				        								right_word_num1 = right_word_num2;
				        								answer_word_num1 = answer_word_num2;
				        							}
				        						}
					        				}
					        				right_word_num += right_word_num1;
					        				answer_word_num += answer_word_num1;
				    					}
				    				}
				    				if (right_word_num >= answer_word_num) {
				    					score = small_test_score;
				    					flag_answer = true;
				    				} else if (right_word_num >= answer_word_num / 2) {
				    					score = small_test_score;
				    					flag_answer = true;
				    				} else {
				    					score = small_test_score;
				    					flag_answer = true;
				    				}
				        			if(flag_answer){
			    						if(judge_speaking){
					        				$(this).find('.question_content input[type="text"]').addClass('right_answer');
					        				$('.p_answer_list ul li[data-index='+qid+']').addClass('answer_list_right_class');
					        				if(type != 'homework'){
					        					$(this).closest('.question_content').find('span.right_answer').remove();
					        					$(this).find('.question_content input[type="text"]').each(function(ix, obj){
						        					for(var sx in right_answers){
						        						var right_answer_arr = right_answers[sx].split('*');
						        						if(right_answer_arr != ''){
						        							$(this).after('<span class="right_answer">('+right_answer_arr[ix]+')</span>');
						        						}
						        					}
						        				});
					        				}
			    						}
				        			}else{
			    						if(judge_speaking){
					        				$(this).find('.question_content input[type="text"]').addClass('wrong_answer');
					        				if(type != 'homework'){
					        					$(this).closest('.question_content').find('span.right_answer').remove();
					        					$(this).find('.question_content input[type="text"]').each(function(ix, obj){
						        					for(var sx in right_answers){
						        						var right_answer_arr = right_answers[sx].split('*');
						        						if(right_answer_arr != ''){
						        							$(this).after('<span class="right_answer">('+right_answer_arr[ix]+')</span>');
						        						}
						        					}
						        				});
					        				}
					        				$('.p_answer_list ul li[data-index='+qid+']').addClass('answer_list_wrong_class');
			    						}
				        			}
				        			user_answer = user_answer.join('*') + '#';
				    			}else if(test_mold == 5){
				        			if(j > 0){
				        				answers[id]['answer'] = answers[id]['answer'] + '|';
				        			}
				    				user_answer = $(this).find('.question_content select').val();
				    				user_answer = user_answer == -1 ? '' : user_answer;
				        			if(user_answer == right_answer){
				        				score = small_test_score;
			    						if(judge_speaking){
					        				$(this).find('.question_content select').addClass('select_right');
					        				$('.p_answer_list ul li[data-index='+qid+']').addClass('answer_list_right_class');
			    						}
				        			}else{
				        				score = small_test_score;
			    						if(judge_speaking){
					        				$(this).find('.question_content select').addClass('select_right');
					        				$('.p_answer_list ul li[data-index='+qid+']').addClass('answer_list_right_class');
			    						}
				        			}
				    				if(user_answer != '' && user_answer.charCodeAt()>64 && user_answer.charCodeAt()<106){
				    					user_answer = practice.process.convertAnswer(user_answer);	
				    				}
				    			}else if(test_mold == 6){
				    				if(sub_type != 1621 && sub_type != 1626 && sub_type != 1631){
				    					ascore = 0;
				    				}
			    					score = 0;
		    						var video_question_num = $(this).closest('.test_content').find('.test_ctrl[data-act-type="2"]').length;
	    							if(video_question_num > 1){
					    				for(var r = 0; r < video_question_num; r++){
					    					ascore += r < arr_score.length ? parseFloat(arr_score[r]) : parseFloat(arr_score[0]);
					    				}
			    					}else if(sub_type != 1621 && sub_type != 1626 && sub_type != 1631){
			    						ascore += parseFloat(arr_score[0]);
			    					}
	    							user_answer = '';
			    					if(videoResult != undefined && videoResult != null 
			    							&& videoResult[id] != undefined && videoResult[id] != null){
			    						var mp3_path = '';
					    				if(video_question_num > 1 || sub_type == 1435 || sub_type == 1627){
			    							var question_score = 0;
			    							var quesiton_index = 0;
			    							var video_that = this;
			    							score = practice.process.calculateVideoTotalScoreForNew(id, main_type, sub_type, 
			    									$('.test_content[data-id="' + id + '"]').closest('.sub_test_area').find('.sub_info').attr('data-score'), 
			    									video_question_num, $('.test_content[data-id="' + id + '"]').find('.question_content .speak_sentence').length, true);
					    					$.each(videoResult[id], function(tid, questionsRes){
					    						var mp3_path_str = '';
					    						var user_answer_str = 0;
					    						if(questionsRes['result'] && questionsRes['result']['mp3']){
					    							mp3_path_str = questionsRes['result']['mp3'];
					    						}
					    						if(questionsRes['result'] && questionsRes['result']['text']){
					    							user_answer_str = questionsRes['result']['score'];
				    							}
					    						mp3_path += mp3_path_str + ',';
					    						user_answer = user_answer + user_answer_str + ',';
					    						if(judge_speaking){
					    							var question_ascore = quesiton_index > arr_score.length ? arr_score[0] : arr_score[quesiton_index];
					    							if(question_ascore == undefined){
					    								question_ascore = arr_score[0];
					    							}
							    					$(video_that).closest('.test_content').find('.question_li:eq("'+ quesiton_index +'")').not('.question_li_1520').find('.speak_sentence.question').append('&nbsp;&nbsp;(' + question_ascore + ')');
							    					if(questionsRes['result'] == undefined || questionsRes['result']['score'] == undefined){
							    						$(video_that).closest('.test_content').find('.question_li:eq("'+ quesiton_index +'")').find('.speak_sentence.answer').append('&nbsp;&nbsp;(' + 0 + ')');
							    					}else{
							    						$(video_that).closest('.test_content').find('.question_li:eq("'+ quesiton_index +'")').find('.speak_sentence.answer').append('&nbsp;&nbsp;(' + questionsRes['result']['score'] + ')');
							    					}
					    						}
				    							quesiton_index++;
					    					});
					    				}else{
					    					var tmp_score = question_num > arr_score.length ? parseFloat(arr_score[0]) : parseFloat(arr_score[question_num-1]);
					    					$.each(videoResult[id], function(tid, questionsRes){
					    						var mp3_path_str = '';
					    						var user_answer_str = 0;
					    						if(questionsRes['result'] && questionsRes['result']['mp3']){
					    							mp3_path_str = questionsRes['result']['mp3'];
					    						}
					    						if(questionsRes['result'] && questionsRes['result']['text']){
					    							user_answer_str = questionsRes['result']['score'];
				    							}
					    						mp3_path += mp3_path_str + ',';
					    						user_answer = user_answer + user_answer_str + ',';
					    					});
					    					score = practice.process.calculateVideoTotalScoreForNew(id, main_type, sub_type, 
			    									$('.test_content[data-id="' + id + '"]').closest('.sub_test_area').find('.sub_info').attr('data-score'), 
			    									video_question_num, $('.test_content[data-id="' + id + '"]').find('.question_content .speak_sentence').length, true);
					    				}
										answers[id]['Mp3'] = mp3_path;
										if(sub_type == 1626){
					    					if(tmp_score > 0 && (score / tmp_score) >= 0.6){
					    						$('.p_answer_list ul li[data-index='+qid+']').addClass('answer_list_right_class');
					    					}else{
					    						$('.p_answer_list ul li[data-index='+qid+']').addClass('answer_list_wrong_class');
					    					}
				    					}
			    					}
			    					score=ascore
			    					if(score == null || score == ''){
				    					score = 0;
			    					}
		    						if(judge_speaking && sub_type != 1621 && sub_type != 1626 && sub_type != 1631){
				    					$(this).closest('.test_content').find('.left_area').html('总分:'+ascore + ',得分:'+ score);
		    						}
			    					if(sub_type != 1621 && sub_type != 1626 && sub_type != 1631){
			    						answers[id]['qsnum'] = 1;
			    					}
			    					if(sub_type != 1626){
				    					if(ascore > 0 && (score / ascore) >= 0.6){
				    						$('.p_answer_list ul li[data-index='+qid+']').addClass('answer_list_right_class');
				    					}else{
				    						$('.p_answer_list ul li[data-index='+qid+']').addClass('answer_list_wrong_class');
				    					}
			    					}
				    			}else if(test_mold == undefined && main_type == 2700){
				    				user_answer = $(this).find('textarea').val();
				    				user_answer = user_answer == undefined ? '' : user_answer;
				    			}
								answers[id]['detail'].push({'item_order' : (j + 1), 'score' : score, 'answer' : user_answer, 'ascore' : question_num > arr_score.length ? parseFloat(arr_score[0]) : parseFloat(arr_score[question_num-1])});
								answers[id]['score'] = parseFloat(answers[id]['score']) + score;
								if(sub_type == 1621 || sub_type == 1626 || sub_type == 1631){
									answers[id]['answer'] = answers[id]['answer'] + user_answer + '|';
									if(test_mold == 6){
										ascore = 0;
										score = 0;
										$.each(answers[id]['detail'], function(kk, oo){
											ascore += oo['ascore'];
											score += oo['score'];
										});
				    					$(this).closest('.test_content').find('.left_area').html('总分:'+ascore + ',得分:'+ score);
									}
								}else if(sub_type == 3305 && test_mold == 2){
									answers[id]['answer'] = answers[id]['answer']+ '|' + user_answer;
								}else{
									answers[id]['answer'] = answers[id]['answer'] + user_answer;
								}
				    		});
				    		answers[id]['ascore'] = ascore;
							practice_total_score = Math.formatFloat(practice_total_score + ascore);
							var curType = $('.test_content[data-id="'+answers[id]['id']+'"]').attr('data-kind'); 
				    		answers[id]['new_level'] = practice.process.calculateTestLevel(answers[id]['old_level'], last_time, ascore, answers[id]['score'], curType);
    						if(judge_speaking){
					    		$('.test_content[data-id="'+id+'"] .left_area').html('熟练度:' + answers[id]['old_level']+'%->'
					    				+ answers[id]['new_level'] + '%'+'&nbsp;' + $('.test_content[data-id="'+id+'"] .left_area').html());
								$(this).find('.p_knowledge_points .knowledge_point').each(function(w, obj){
									var klevel = practice.process.calculateKnowledgeLevel($(this).attr('data-klevel'), $(this).attr('data-ktime'), ascore, answers[id]['score']);
									$(this).append('('+$(this).attr('data-klevel')+'%->'+klevel+'%)');
								});
    						}
				    		practice_score = Math.formatFloat(practice_score + parseFloat(answers[id]['score']));
				    	});
			    	});
    			}else{
    				answers = practice_data.test_record;
    				practice_score = practice_data.practice_score;
    				practice_total_score = practice_data.practice_total_score;
    			}
		    	$('.test_content[data-subtype="7100"] .question_container .question_content .btn_info_area .left_area').html('');
	    		var duration_time = '';
	    		if($('#test-mode[data-mode="free"]').is(':checked')){
		    		duration_time = time;
		    	}else{
		    		if(source == 'hw' && (struct_type == 1 || struct_type == 2)){
		    			duration_time = time;
		    		}else{
		    			duration_time = total_time - count_down_time;
		    		}
		    	}
	    		if(type == 'competition'){
		    		$('.p_answerSubmit_btn').addClass('disabled');
	    		}
		    	var record = {'time' : Math.ceil((duration_time)/60), 'practice_score' : Math.formatFloat(practice_score), 'practice_total_score' : practice_total_score.toString().length > 5 ? Math.formatFloat(practice_total_score) : practice_total_score};
		    	record.percent = Math.round(record.practice_score/record.practice_total_score * 100);
		    	if(!practice_data_save && !practice_data.practice_record){
			    	var practice_record = {'version_id' : version_id, 'grade_id' : grade_id, 'unit' : unit_ids, 
			    			'practice_type' : type, 'practice_id' : practice_id, 'duration_time' : duration_time, 
			    			'score' : practice_score, 'ascore' : practice_total_score.toString().length > 5 ? Math.formatFloat(practice_total_score) : practice_total_score, 'config' : (JSON.stringify(config) == '{}' ? '' : JSON.stringify(config))};
			    	var params = {'test_record' : answers, 'practice_record' : practice_record};
	    		}else{
	    			var params = {
	    				'test_record': practice_data.test_record,
	    				'practice_record': practice_data.practice_record
	    			};
	    		}
		    	$.ajax({
					url : TinSoConfig.student + '/Practice/submitAnwser.html',
					data : params,
					type : 'POST',
					global : false,
					success : function(data){
						LoadingMessageBox('close');
			    		if(data.status && data.info.flag === true){
			    			if(type == 'competition'){
						    	var params = {prid : data.info.practice_record_id, 'duration_time' : duration_time, 
						    			'score' : practice_score, 'score_id' : score_id, 'paper_id' : paper_id};
					    		$.post(TinSoConfig.student + '/Competition/submitCompetitionPaper.html', params, function(data){
					    			LoadingMessageBox('close');
					    			if(data.status){
										LoadingMessageBox('记录保存成功！即将跳转！');
										setTimeout(function(){
												window.onbeforeunload = function(){};
												window.location.href = TinSoConfig.student + '/Competition/myCompetition.html';
											}, 2000);
					    			}else{
					    				var msg = data.info ? data.info : '保存记录失败，请重试！';
					    				MessageBox({
											content : msg,
											buttons : [{
												text : '我知道了',
												click : function(){
													$(this).dialog('close');
												}
											}]
										});
					    			}
					    		});
				    		}else{
				    			$('.p_operationBtn_container').show();
				    			TSP.practice.testTime.setPracticeTime(duration_time - 1);
				    	    	$('.p_tests_area').attr('data-page','result');
				    	    	$('.p_tests_area input').attr('disabled', 'disabled');
				    	    	$('.p_tests_area textarea').attr('disabled', 'disabled');
				    	    	$('.p_tests_area select').attr('disabled', 'disabled');
					    		$('.p_answerSubmit_btn').addClass('disabled');
				    	    	if($('.click_to_slide').hasClass('slideToDown')){
				    	    		$('.click_to_slide').click();
								}
				    	    	$('html, body').stop().animate({scrollTop : '0px'}, 0);
				    	    	TSP.practice.is_submit = true;
				    	    	if(type == 'homework'){
						    	    var paper_data = new Array();
									paper_data['title'] = $('.p_paper_title').text();
									paper_data['num'] = $('.p_answer_list li:last').attr("data-index");
									paper_data['score'] = $('.p_paper_cnt').attr("data-tatol-score");
									paper_data['time'] = $('.p_paper_cnt').attr("data-need-time"); 
									paper_data['random'] = Math.floor(Math.random() * 3);
									if(isfree && !ispractice){
										paper_data['stu_score'] = practice_record.score + '';
										paper_data['percent'] = Math.round(paper_data['stu_score']/paper_data['score'] *100);
									}
				    	    	}
				    			if(judge_speaking){
					    			$('.question_content:first').click();
					    			if((type == 'homework' && (!isfree || (isfree && !ispractice))) || (type != 'homework')){
						    			$('.p_paperInfo_box').show();
						    			$('.slideToUp').show();
						    	    	$('.p_paper_info.p_paper_nature').html($('#resultInfoTemp').template(record));
						    	    	$('.p_answerSubmit_btn').text('再次练习').toggleClass('p_answerSubmit_btn p_practiceAgain_btn');
							    	    if($('.answerSheet_tf_tips').length == 0 && !is_primary){
						    	    		$('.p_answer_list').after('<div class="answerSheet_tf_tips">注：答题卡题号颜色，红色为错误，绿色为正确</div>');
						    	    		TSP.practice.answerSheet.setAnswerSheetHeight();
						    	    	}
					    			}
						    	    MessageBox({
										content : '记录保存成功',
										buttons : [{
											text : '我知道了',
											click : function(){
												isSubmitAAA = true;
												$(this).dialog('close');
											}
										}],
										close: function() {
											if(type == 'homework'){
												if(isfree){
													$('.freeUser_tips_cnt').append($('#freeUserTips').template(paper_data));
													$('.freeUser_tips_cnt').dialog({
														width: 620,
														hide : true,
														modal : true,
														resizable : false,
														dialogClass : 'small-dialog green-dialog',
														buttons : [{
															text : '以后再说',
															click : function(){
																window.onbeforeunload = undefined;
																window.location.href = TinSoConfig.student + '/Homework/lists.html';
															}
														},{
															text : '通知家长自愿升级资源',
															click : function(){
																window.onbeforeunload = undefined;
																var url = $('.notice_msg_err a.trail_confirm').attr('href');
							                                	if (!url || url == 'undefined') {
							                                		url = TinSoConfig.store + '/Course/derictBuyCourse.html';
							                                	}
							                                	window.open(url);  
															}
														}]
													}).show();
													return;
												}
												$('.p_paper_cnt,.p_answerSheet_cnt').addClass('hide');
												$('.H_submit_homework_cnt').show();
												TSP.practice.process.submitHomework(answers, data.info.practice_record_id);
											}
										}
									});
				    			}else{
				    				MessageBox({
										content : '记录保存成功',
										buttons : [{
											text : '我知道了',
											click : function(){
												isSubmitAAA = true;
												$(this).dialog('close');
											}
										}],
										close: function() {
											if(type == 'homework'){
												if(isfree){
													$('.freeUser_tips_cnt').append($('#freeUserTips').template(paper_data));
													$('.freeUser_tips_cnt').dialog({
														width: 620,
														hide : true,
														modal : true,
														resizable : false,
														dialogClass : 'small-dialog green-dialog',
														buttons : [{
															text : '以后再说',
															click : function(){
																window.onbeforeunload = undefined;
																window.location.href = TinSoConfig.student + '/Homework/lists.html';
															}
														},{
															text : '通知家长自愿升级资源',
															click : function(){
																window.onbeforeunload = undefined;
																var url = $('.notice_msg_err a.trail_confirm').attr('href');
							                                	if (!url || url == 'undefined') {
							                                		url = TinSoConfig.store + '/Course/derictBuyCourse.html';
							                                	}
							                                	window.open(url);  
															}
														}]
													}).show();
													return;
												}
												$('.p_paper_cnt,.p_answerSheet_cnt').addClass('hide');
												$('.H_submit_homework_cnt').show();
												TSP.practice.process.submitHomework(answers, precord_id);	
											}
										}
									});
				    			}
				    		}
			    		}else{
			    			if(data.info && data.info.err_msg){
			    				MessageBox({
									content : data.info.err_msg,
									close : function(){
										window.onbeforeunload = undefined;
										window.location.href = TinSoConfig.student + '/Homework/lists.html';
									}
								});
			    			}else{
			    				MessageBox({
			    					content : '记录保存失败，请重试'
			    				});
			    			}
			    		}
			    		isNeedProtectDialog = true;
						practice_data = {};
						practice_data_save = false;
					},
					error: function(XMLHttpRequest){
						LoadingMessageBox('close');
						if(!XMLHttpRequest.readyState){
							MessageBox({
								content : '网络异常，请联网后重试！请不要刷新或离开页面，以免数据丢失！',
								buttons : [{
									text : '我知道了',
									click : function(){
										$(this).dialog('close');
									}
								}]
							});
							practice_data = params;
							practice_data.practice_total_score = practice_total_score;
							practice_data.practice_score = practice_score;
							practice_data_save = true;
							isNeedProtectDialog = true;
						}
					}
				});
			},
			saveAnswer : function(callback){
				LoadingMessageBox('保存记录中...');
				if(typeof record_check_interval != 'undefined' && !!record_check_interval){
					clearInterval(record_check_interval);
					record_check_interval = undefined;
				}
				var answers = new Object();
		    	var practice_score = 0;
		    	var practice_total_score = 0;
    			if(!practice_data_save && $.isEmptyObject(practice_data)){
			    	$('.sub_test_area').each(function(r, s){
			    		if(is_primary){
				    		var arr_score = $(this).closest('.test_sub_area').find('.sub_info').attr('data-score').split('|');
			    		}else{
				    		var arr_score = $(this).find('.sub_info').attr('data-score').split('|');
			    		}
			    		arr_score.splice(arr_score.length - 1, 1);
			    		var question_num = 0;
			    		$(this).find('.test_content').each(function(i, n){
				    		var id = $(this).attr('data-id');
				    		var main_type = $(this).attr('data-type');
				    		var sub_type = $(this).attr('data-subtype');
				    		var test_level = $(this).attr('data-test-level');
				    		var last_time = $(this).attr('data-last-time');
				    		var ascore = 0;
				    		answers[id] = {'id' : id, 'qstype' : main_type, 'score' : 0, 'answer' : '', 'ascore' : 0, 
				    				'qsnum' : $(this).attr('data-count'), 'item_order' : 0, 'detail' : new Array(), 
				    				'old_level' : test_level, 'new_level' : 0};
				    		$(this).find('.question_container').each(function(j, m){
				    			question_num++;
								var small_test_score = question_num > arr_score.length ? parseFloat(arr_score[0]) : parseFloat(arr_score[question_num-1]);
								ascore = ascore + small_test_score;
				    			var score = 0;
				    			var right_answer = $(this).find('.question_content .analysis .right_answer_class').attr('data-right-answer');
				    			var user_answer = null;
				    			var qid = $(this).attr('data-qid');
				    			var test_mold = $(this).find('.question_content').attr('data-test-mold');
					    		if(test_mold == 1 && sub_type != 1621 && sub_type != 1631 && sub_type != 1626 && sub_type != 1321 && sub_type != 1323 && sub_type != 1324 && sub_type != 1326 && $(m).find('input[type=radio]').length > 0){
				        			if(j > 0){
				        				answers[id]['answer'] = answers[id]['answer'] + '|';
				        			}
				    				user_answer = $(this).find('.question_content input:checked').val();
				    				user_answer = user_answer == undefined ? '' : user_answer;
				    				if(right_answer.charCodeAt()>64 && right_answer.charCodeAt()<106){
					    				right_answer = practice.process.convertAnswer(right_answer);	
				    				}
			        				score = user_answer == right_answer ? small_test_score : 0;
					    		}else if(((test_mold == 2 && main_type != 2700) || (test_mold == 1 && (sub_type == 1621 || sub_type == 1631 || sub_type == 1626 || sub_type == 1321 || sub_type == 1323 || sub_type == 1324 || sub_type == 1326))) && $(m).find('input[type=text]').length > 0){
				    				user_answer = new Array();
				    				user_cmp_answer = new Array();
				        			var reg = new RegExp("[.,;,:,\,，。\’\'\"\?][]*","g");
				    				var initial_flag = false;
				    				$(this).find('.question_content input[type="text"]').each(function(k, obj){
				    					var tmp_answer = $.trim($(this).val());
				    					tmp_answer = tmp_answer == undefined ? '' : tmp_answer;
				    					user_answer.push(tmp_answer);
				    					tmp_answer = tmp_answer.replace(/[.,;,:,\,，\?]/g, ' ');
				    					tmp_answer = $.trim(tmp_answer);
				            			tmp_answer = tmp_answer.replace(reg, '');
					    				user_cmp_answer.push(tmp_answer);
				    	    			var prevNode = this.previousSibling;
				    	    			if(prevNode != null && prevNode.nodeType == 3 && $.trim(prevNode.nodeValue.substr(-1)) != '' && prevNode.length == 1){
				    	    				initial_flag = true;
				    	    			}
				    				});
				        			var ext_answer = $(this).find('.question_content .analysis .right_answer_class').attr('data-ext-answer');
				    				var right_answers = ext_answer == undefined ? new Array() : ext_answer.split('#');
				    				if(right_answers.length > 0){
				    					right_answers[right_answers.length - 1] = right_answer.toLowerCase();
				    				}else{
				    					right_answers[0] = right_answer;
				    				}
				    				var flag_answer = false;
				    				var right_word_num = 0;
				    				var answer_word_num = 0;
				    				for(var x in user_cmp_answer){
				    					if(user_cmp_answer[x] == ''){
				    						var right_answer_arr = right_answers[0].split('*');
				        					var right_answer_str = $.trim(right_answer_arr[x]).replace(reg, '');
				        					right_answer_str = right_answer_str.replace(/\r\n/g, '');
				        					right_answer_str = right_answer_str.replace(/\n/g, '');
				        					right_answer_str = right_answer_str.replace(/\s+/g, '*');
				        					right_answer_str = right_answer_str.split('*');
				        					answer_word_num += right_answer_str.length;
				    					} else {
				    						var right_word_num1 = 0;
				    						var answer_word_num1 = 0;
					    					for(var s in right_answers){
					    						var user_cmp_answer_r = user_cmp_answer[x];
					    						var right_answer_arr = right_answers[s].split('*');
					        					var right_answer_str = $.trim(right_answer_arr[x]).replace(/[.,;,:,\,，\?]/g, ' ');
					        					right_answer_str = $.trim(right_answer_str);
					        					right_answer_str = right_answer_str.replace(reg, '');
				        						right_answer_str = right_answer_str.replace(/\r\n/g, '');
				        						right_answer_str = right_answer_str.replace(/\n/g, '');
				        						right_answer_str = right_answer_str.replace(/\s+/g, '*');
				        						right_answer_str = right_answer_str.split('*');
				        						user_cmp_answer_r = user_cmp_answer_r.replace(/\r\n/g, '');
				        						user_cmp_answer_r = user_cmp_answer_r.replace(/\n/g, '');
				        						user_cmp_answer_r = user_cmp_answer_r.replace(/\s+/g, '*');
				        						user_cmp_answer_r = user_cmp_answer_r.split('*');
				        						for (var y = right_answer_str.length - 1; y >= 0; y--) {
				        							right_answer_str[y] = right_answer_str[y].toLowerCase();
				        						}
				        						for (var y = user_cmp_answer_r.length - 1; y >= 0; y--) {
				        							user_cmp_answer_r[y] = user_cmp_answer_r[y].toLowerCase();
				        						}
				        						var right_word_num2 = 0;
				    							var answer_word_num2 = right_answer_str.length;
				        						if (user_cmp_answer_r.length > right_answer_str.length) {
			        								for (var jx = 0; jx < user_cmp_answer_r.length; jx++) {
			        									if (j == 0 && initial_flag) {
			        										if (right_answer_str[jx] == user_cmp_answer_r[jx].substr(1) || right_answer_str[jx].substr(1) == user_cmp_answer_r[jx] || right_answer_str[jx] == user_cmp_answer_r[jx]) {
			        											right_word_num2 += 1;
			        										}
			        									} else if ($.inArray(user_cmp_answer_r[jx], right_answer_str) != -1) {
				        									right_word_num2 += 1;
				        								}
				        							}
				        							if (right_word_num2 > answer_word_num2 / 2) {
				        								right_word_num2 = Math.ceil(answer_word_num2 / 2);
				        								if (right_word_num2 == answer_word_num2 == 1) {
				        									right_word_num2 = 0.5;
				        								}
				        							}
				        						} else if (user_cmp_answer_r.length == right_answer_str.length) {
				        							var word_flag = true;
				        							for (var jx = 0; jx < right_answer_str.length; jx++) {
				        								if (jx == 0 && initial_flag) {
				        									if (right_answer_str[jx] != user_cmp_answer_r[jx].substr(1) && right_answer_str[jx].substr(1) != user_cmp_answer_r[jx] || right_answer_str[jx] == user_cmp_answer_r[jx]) {
				        										word_flag = false;
				        									}
				        								} else if (user_cmp_answer_r[jx] != right_answer_str[jx]) {
				        									word_flag = false;
				        								}
				        							}
				        							if (word_flag) {
				        								right_word_num2 = answer_word_num2;
				        							} else {
				        								for (var jx = 0; jx < user_cmp_answer_r.length; jx++) {
				        									if (jx == 0 && initial_flag) {
				        										if (right_answer_str[jx] == user_cmp_answer_r[jx].substr(1) || right_answer_str[jx].substr(1) == user_cmp_answer_r[jx] || right_answer_str[jx] == user_cmp_answer_r[jx]) {
				        											right_word_num2 += 1;
				        										}
				        									} else if ($.inArray(user_cmp_answer_r[jx], right_answer_str) != -1) {
					        									right_word_num2 += 1;
					        								}
					        							}
					        							if (right_word_num2 > answer_word_num2 / 2) {
					        								right_word_num2 = Math.ceil(answer_word_num2 / 2);
					        							}
				        							}
				        						} else {
				        							for (var jx = 0; jx < user_cmp_answer_r.length; jx++) {
			        									if (jx == 0 && initial_flag) {
			        										if (right_answer_str[jx] == user_cmp_answer_r[jx].substr(1) || right_answer_str[jx].substr(1) == user_cmp_answer_r[jx] || right_answer_str[jx] == user_cmp_answer_r[jx]) {
			        											right_word_num2 += 1;
			        										}
			        									} else if ($.inArray(user_cmp_answer_r[jx], right_answer_str) != -1) {
				        									right_word_num2 += 1;
				        								}
				        							}
				        							if (right_word_num2 > answer_word_num2 / 2) {
				        								right_word_num2 = Math.ceil(answer_word_num2 / 2);
				        							}
				        						}
				        						if (answer_word_num1 == 0) {
				        							right_word_num1 = right_word_num2;
				        							answer_word_num1 = answer_word_num2;
				        						} else {
				        							if (answer_word_num2 != 0 && right_word_num2/answer_word_num2 > right_word_num1/answer_word_num1) {
				        								right_word_num1 = right_word_num2;
				        								answer_word_num1 = answer_word_num2;
				        							}
				        						}
					        				}
					        				right_word_num += right_word_num1;
					        				answer_word_num += answer_word_num1;
				    					}
				    				}
				    				if (right_word_num >= answer_word_num) {
				    					score = small_test_score;
				    					flag_answer = true;
				    				} else if (right_word_num >= answer_word_num / 2) {
				    					score = small_test_score / 2;
				    					score = Math.floor(score / 0.5) * 0.5;
				    				} else {
				    					score = 0;
				    				}
				        			user_answer = user_answer.join('*') + '#';
				    			}else if(test_mold == 5){
				        			if(j > 0){
				        				answers[id]['answer'] = answers[id]['answer'] + '|';
				        			}
				    				user_answer = $(this).find('.question_content select').val();
				    				user_answer = user_answer == -1 ? '' : user_answer;
			        				score = user_answer == right_answer ? small_test_score : 0;
				    				if(user_answer != '' && user_answer.charCodeAt()>64 && user_answer.charCodeAt()<106){
				    					user_answer = practice.process.convertAnswer(user_answer);	
				    				}
				    			}else if(test_mold == 6){
				    				if(sub_type != 1621 && sub_type != 1626 && sub_type != 1631){
				    					ascore = 0;
				    				}
			    					score = 0;
		    						var video_question_num = $(this).closest('.test_content').find('.test_ctrl[data-act-type="2"]').length;
	    							if(video_question_num > 1){
					    				for(var r = 0; r < video_question_num; r++){
					    					ascore += r < arr_score.length ? parseFloat(arr_score[r]) : parseFloat(arr_score[0]);
					    				}
			    					}else if(sub_type != 1621 && sub_type != 1626 && sub_type != 1631){
			    						ascore += parseFloat(arr_score[0]);
			    					}
	    							user_answer = '';
			    					if(videoResult != undefined && videoResult != null 
			    							&& videoResult[id] != undefined && videoResult[id] != null){
			    						var mp3_path = '';
					    				if(video_question_num > 1 || sub_type == 1435 || sub_type == 1627){
			    							var question_score = 0;
			    							var quesiton_index = 0;
			    							var video_that = this;
					    					score = practice.process.calculateVideoTotalScore(id, $(this).closest('.test_content').attr('data-subtype'), ascore);
				    						$.each(videoResult[id], function(tid, questionsRes){
				    							var mp3_path_str = '';
				    							var user_answer_str = 0;
				    							if(questionsRes['result'] && questionsRes['result']['mp3']){
				    								mp3_path_str = questionsRes['result']['mp3'];
				    							}
				    							if(questionsRes['result'] && questionsRes['result']['text']){
				    								user_answer_str = questionsRes['result']['score'];
				    							}
				    							mp3_path += mp3_path_str + ',';
				    							user_answer = user_answer + user_answer_str + ',';
				    							var question_ascore = quesiton_index > arr_score.length ? arr_score[0] : arr_score[quesiton_index];
				    							quesiton_index++;
				    						});
					    				}else{
					    					var tmp_score = question_num > arr_score.length ? parseFloat(arr_score[0]) : parseFloat(arr_score[question_num-1]);
				    						$.each(videoResult[id], function(tid, questionsRes){
				    							var mp3_path_str = '';
				    							var user_answer_str = 0;
				    							if(questionsRes['result'] && questionsRes['result']['mp3']){
				    								mp3_path_str = questionsRes['result']['mp3'];
				    							}
				    							if(questionsRes['result'] && questionsRes['result']['text']){
				    								user_answer_str = questionsRes['result']['score'];
				    							}
				    							mp3_path += mp3_path_str + ',';
				    							user_answer = user_answer + user_answer_str + ',';
				    						});
					    					if(main_type == 1600 || (($('.p_paper_cnt').attr('data-source') == 'ts' 
			    								|| $('.p_paper_cnt').attr('data-source') == 'unit') 
			    								&& main_type == 1400)){
					    						$.each(videoResult[id], function(tid, questionsRes){
					    							if(questionsRes['result'] && questionsRes['result']['score']){
					    								score = questionsRes['result']['score'];
					    							}
					    						});
						    					score = Math.ceil(score * tmp_score * 2 / 100) / 2.0;
					    					}else{
					    						score = practice.process.calculateVideoTotalScore(id, $(this).closest('.test_content').attr('data-subtype'), tmp_score);
					    					}
					    				}
										answers[id]['Mp3'] = mp3_path;
			    					}
			    					if(score == null || score == ''){
				    					score = 0;
			    					}
			    					if(sub_type != 1621 && sub_type != 1626 && sub_type != 1631){
			    						answers[id]['qsnum'] = 1;
			    					}
				    			}else if(test_mold == undefined && main_type == 2700){
				    				user_answer = $(this).find('textarea').val();
				    				user_answer = user_answer == undefined ? '' : user_answer;
				    			}
								answers[id]['detail'].push({'item_order' : (j + 1), 'score' : score, 'answer' : user_answer, 'ascore' : question_num > arr_score.length ? parseFloat(arr_score[0]) : parseFloat(arr_score[question_num-1])});
								answers[id]['score'] = parseFloat(answers[id]['score']) + score;
								if(sub_type == 1621 || sub_type == 1626 || sub_type == 1631){
									answers[id]['answer'] = answers[id]['answer'] + user_answer + '|';
								}else{
									answers[id]['answer'] = answers[id]['answer'] + user_answer;
								}
				    		});
				    		answers[id]['ascore'] = ascore;
							practice_total_score += ascore;
							console.log(answers);
							console.log(answers[id]);
							var curType = $('.test_content[data-id="'+answers[id]['id']+'"]').attr('data-kind'); 
				    		answers[id]['new_level'] = practice.process.calculateTestLevel(answers[id]['old_level'], last_time, ascore, answers[id]['score'], curType);
				    		practice_score = practice_score + parseFloat(answers[id]['score']);
				    	});
			    	});
    			}else{
    				answers = practice_data.test_record;
    				practice_score = practice_data.practice_score;
    				practice_total_score = practice_data.practice_total_score;
    			}
	    		var duration_time = '';
	    		if($('#test-mode[data-mode="free"]').is(':checked')){
		    		duration_time = time;
		    	}else{
		    		duration_time = total_time - count_down_time;
		    	}
		    	var record = {'time' : Math.ceil((duration_time)/60), 'practice_score' : Math.formatFloat(practice_score), 'practice_total_score' : practice_total_score.toString().length > 5 ? Math.formatFloat(practice_total_score) : practice_total_score};
		    	record.percent = Math.round(record.practice_score/record.practice_total_score * 100);
		    	if(!practice_data_save && !practice_data.practice_record){
			    	var practice_record = {'version_id' : version_id, 'grade_id' : grade_id, 'unit' : unit_ids, 
			    			'practice_type' : type, 'practice_id' : practice_id, 'duration_time' : duration_time, 
			    			'score' : practice_score, 'ascore' : practice_total_score.toString().length > 5 ? Math.formatFloat(practice_total_score) : practice_total_score, 'config' : JSON.stringify(config)};
			    	var params = {'test_record' : answers, 'practice_record' : practice_record};		    	
	    		}else{
	    			var params = {
	    				'test_record': practice_data.test_record,
	    				'practice_record': practice_data.practice_record
	    			};
	    		}
		    	$.ajax({
					url : TinSoConfig.student + '/Practice/submitAnwser.html',
					data : params,
					type : 'POST',
					global : false,
					success : function(data){
						LoadingMessageBox('close');
			    		if(data.status && data.info.flag === true){
			    			typeof callback == 'function' && callback();
			    		}else{
			    			if(data.info.err_msg){
			    				MessageBox({
									content : data.info.err_msg,
									close : function(){
										window.onbeforeunload = undefined;
										window.location.href = TinSoConfig.student + '/Homework/lists.html';
									}
								});
			    			}else{
				    			MessageBox({
									content : '记录保存失败，请重试'
								});
			    			}
			    		}
						practice_data = {};
						practice_data_save = false;
						isNeedProtectDialog = true;
					},
					error: function(XMLHttpRequest){
						LoadingMessageBox('close');
						if(!XMLHttpRequest.readyState){
							MessageBox({
								content : '网络异常，请联网后重试！请不要刷新或离开页面，以免数据丢失！'
							});
							practice_data = params;
							practice_data.practice_total_score = practice_total_score;
							practice_data.practice_score = practice_score;
							practice_data_save = true;
							isNeedProtectDialog = true;
						}
					}
				});
			},
			checkAnswer : function(){
				var test = $('.current_test');
	    		var id = test.attr('data-id');
	    		var main_type = test.attr('data-type');
	    		var test_level = test.attr('data-test-level');
	    		var last_time = test.attr('data-last-time');
	    		var ascore = 0;
				var answers_flag = true;
	    		var arr_score = $('.current_test').siblings('.sub_info').attr('data-score').split('|');
	    		arr_score.splice(arr_score.length - 1, 1);
	    		var question_num = 0;
	    		answers[done] = {'id' : id, 'qstype' : test.attr('data-type'), 'score' : 0, 'answer' : '', 
	    				'ascore' : 0, 'qsnum' : test.attr('data-count'), 'item_order' : 0, 'detail' : new Array(), 
	    				'old_level' : test_level, 'new_level' : 0};
	    		var question = test.find('.question_container');		
	    		question.each(function(j, m){
	    			question_num++;
					var small_test_score = question_num > arr_score.length ? parseFloat(arr_score[0]) : parseFloat(arr_score[question_num-1]);
					ascore = ascore + small_test_score;
	    			var score = 0;
	    			var right_answer = $(this).find('.question_content .analysis .right_answer_class').attr('data-right-answer');
	    			var user_answer = null;
	    			var qid = $(this).attr('data-qid');
	    			var test_mold = $(this).find('.question_content').attr('data-test-mold');
	    			if(test_mold == 1){
	        			if(j > 0){
	        				answers[done]['answer'] = answers[done]['answer'] + '|';
	        			}
	    				user_answer = $(this).find('.question_content input:checked').val();
			    		user_answer = user_answer == undefined ? '' : user_answer;
			    		if(user_answer != ''){
	    					noanswers_flag = false;
	    				}
	    				right_answer = practice.process.convertAnswer(right_answer);
	        			if(user_answer == right_answer){
	        				score = small_test_score;
	        			}else{
	        				answers_flag = false;
	        				score = 0;
	        			}
	    			}else if(test_mold == 2){
	    				user_answer = new Array();
	        			var reg = new RegExp("[.,;,:,\,，\’\'\"][ ]*","g");
	    				$(this).find('.question_content input[type="text"]').each(function(i, obj){
	    					var tmp_answer = $.trim($(this).val());
	    					tmp_answer = tmp_answer == undefined ? '' : tmp_answer;
	    					if(tmp_answer != ''){
		    					noanswers_flag = false;
		    				}
	            			tmp_answer = tmp_answer.replace(reg, ",");
		    				user_answer.push(tmp_answer);
	    	    			var prevNode = this.previousSibling;
	    	    			if(prevNode != null && prevNode.nodeType == 3 && $.trim(prevNode.nodeValue.substr(-1)) != '' && prevNode.length == 1){
	    	    				initial_flag = true;
	    	    			}
	    				});
	        			var ext_answer = $(this).find('.question_content .analysis .right_answer_class').attr('data-ext-answer');
	    				var right_answers = ext_answer == undefined ? new Array() : ext_answer.split('#');
	    				if(right_answers.length > 0){
	    					right_answers[right_answers.length - 1] = right_answer;
	    				}else{
	    					right_answers[0] = right_answer;
	    				}
	    				var flag_answer = false;
	    				for(var r in user_answer){
	    					if(user_answer[r] == ''){
	    						flag_answer = false;
	    						break;
	    					}
	    					for(var s in right_answers){
	    						var right_answer_arr = right_answers[s].split('*');
	        					var right_answer_str = $.trim(right_answer_arr[r]).replace(reg, ",");
	        					if(right_answer_str == user_answer[r]){
	        						flag_answer = true;
	        						break;
	        					}
	        					if(right_answer_str == user_answer[r].substr(1)){
	        						flag_answer = true;
	        						break;
	        					}
	        					if(right_answer_str.substr(1) == user_answer[r]){
	        						flag_answer = true;
	        						break;
	        					}
	        				}
	    					if(!flag_answer){
	    						break;
	    					}
	    				}
	        			if(flag_answer){
	        				score = small_test_score;
	        			}else{
	        				answers_flag = false;
	        				score = 0;
	        			}
	        			user_answer = user_answer.join('*') + '#';
	    			}else if(test_mold == 5){
	        			if(j > 0){
	        				answers[done]['answer'] = answers[done]['answer'] + '|';
	        			}
	    				user_answer = $(this).find('.question_content select').val();
	    				user_answer = user_answer == -1 ? '' : user_answer;
	    				if(user_answer != ''){
	    					noanswers_flag = false;
	    				}
	        			if(user_answer == right_answer){
	        				score = small_test_score;
	        			}else{
	        				answers_flag = false;
	        				score = 0;
	        			}
	    				if(user_answer != '' && user_answer.charCodeAt()>64 && user_answer.charCodeAt()<106){
	    					user_answer = practice.process.convertAnswer(user_answer);	
	    				}
	    			}else if(test_mold == 6){
	    				if(sub_type != 1621 && sub_type != 1626 && sub_type != 1631){
	    					ascore = 0;
	    				}
						score = 0;
						var video_question_num = $(this).closest('.test_content').find('.test_ctrl[data-act-type="2"]').length;
    					if(video_question_num > 1){
		    				for(var r = 0; r < video_question_num; r++){
		    					ascore += r < arr_score.length ? parseFloat(arr_score[r]) : parseFloat(arr_score[0]);
		    				}
    					}else if(sub_type != 1621 && sub_type != 1626 && sub_type != 1631){
    						ascore += parseFloat(arr_score[0]);
    					}
						user_answer = '';
    					if(videoResult != undefined && videoResult != null 
    							&& videoResult[id] != undefined && videoResult[id] != null){
							var mp3_path = '';
		    				if(video_question_num > 1 || sub_type == 1435 || sub_type == 1627){
								var question_score = 0;
	    						$.each(videoResult[id], function(tid, questionsRes){
	    							var sen_score = 0;
	    							if(questionsRes['result'] && questionsRes['result']['text']){
	    								$.each(questionsRes['result']['text'], function(senIndex, senObj){
	    									sen_score += parseInt(senObj['score']);
	    								});
	    								sen_score = sen_score/questionsRes['result']['text'].length;
	    								question_score += sen_score;
	    								user_answer = user_answer + sen_score + ',';
	    								mp3_path += questionsRes['result']['mp3'] + ',';
	    							}
	    						});
		    					score = (question_score * ascore /100/video_question_num).toFixed(1);
		    				}else{
								var sen_score = 0;
	    						$.each(videoResult[id], function(tid, questionsRes){
	    							var mp3_path_str = '';
	    							var user_answer_str = 0;
	    							if(questionsRes['result'] && questionsRes['result']['mp3']){
	    								mp3_path_str = questionsRes['result']['mp3'];
	    							}
	    							if(questionsRes['result'] && questionsRes['result']['text']){
	    								user_answer_str = questionsRes['result']['score'];
	    							}
	    							mp3_path += mp3_path_str + ',';
	    							user_answer = user_answer + user_answer_str + ',';
	    						});
		    					var tmp_score = question_num > arr_score.length ? parseFloat(arr_score[0]) : parseFloat(arr_score[question_num-1]);
		    					if(main_type == 1600){
		    						$.each(videoResult[id], function(tid, questionsRes){
		    							if(questionsRes['result'] && questionsRes['result']['score']){
		    								score = questionsRes['result']['score'];
		    							}
		    						});
			    					score = Math.ceil(score * tmp_score * 2 / 100) / 2.0;
		    					}else{
		    						score = practice.process.calculateVideoTotalScore(id, $(this).closest('.test_content').attr('data-subtype'), tmp_score);
		    					}
		    					score = (sen_score * tmp_score / 100).toFixed(1);
		    				}
							answers[done]['Mp3'] = mp3_path;
						}else{
	        				answers_flag = false;
	    					score = 0;
						}
						if(score == null || score == ''){
	    					score = 0;
    					}
						if(sub_type != 1621 && sub_type != 1626 && sub_type != 1631){
							answers[done]['qsnum'] = 1;
						}
	    			}else if(test_mold == undefined && main_type == 2700){
	    				user_answer = $(this).find('textarea').val();
	    				user_answer = user_answer == undefined ? '' : user_answer;
	    			}
					answers[done]['detail'].push({'item_order' : (j + 1), 'score' : score, 'answer' : user_answer, 'ascore' : question_num > arr_score.length ? parseFloat(arr_score[0]) : parseFloat(arr_score[question_num-1])});
					answers[done]['score'] = parseFloat(answers[done]['score']) + score;
					answers[done]['answer'] = answers[done]['answer'] + user_answer;
	    		});
	    		answers[done]['ascore'] = ascore;
				practice_total_score += ascore;
	    		practice_score = practice_score + parseFloat(answers[done]['score']);
	    		done = done + 1;
		    	return answers_flag;
			}, 
			removeWrong : function(testId, callback){
				remove_flag = true;
				$.post(TinSoConfig.student + '/Questions/removeWrongByTestId.html', {'testId' : testId}, function(data){
					if(data.info === true){
				    	MessageBox({
							content : '移除错题成功！',
							close: function( event, ui ) {
								$(this).dialog('destroy').remove();
							},
							buttons : [{
								text : '我知道了',
								click : function(){
									$(this).dialog('close');
									callback();
								}
							}]
						});
				    }else{
				    	MessageBox({
							content : '移除错题失败，请重试',
							close: function( event, ui ) {
								$(this).dialog('destroy').remove();
							},
							buttons : [{
								text : '我知道了',
								click : function(){
									$(this).dialog('close');
									callback();
								}
							}]
						});
				    }
				});
			},
			showResult : function(result){
				$('.dialog_cnt').html($('#resultInfoTemp').template(result));
				$('.dialog_cnt').dialog({
					dialogClass : 'small-dialog green-dialog',
					width : 480,
					modal : true,
					resizable : false,
					close: function() {
						$(this).dialog('destroy').remove();
						location.href = TinSoConfig.student + '/Questions/wrong.html';
					},
					buttons:{ 
						'确定':function(){ 
							$(this).dialog("close");
						}
					}
				}).show();
			},
			getQueryString :　function (name) {
			    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
			    var r = window.location.search.substr(1).match(reg);
			    if (r != null) return decodeURI(r[2]); return null;
			},
			backToSource : function(){
				var source = new Array();
				source['/Practice/smartPractice'] = '/Practice/smartPracticeList';		 
				source['/Practice/singlePractice'] = '/Practice/single';			     
				source['/Practice/homework'] = '/Homework/lists';                        
				source['/Practice/tsSinglePractice'] = '/Paper/tsSingle';                
				source['/Practice/bsSinglePractice'] = '/Paper/bsSingle';                
				source['/Questions/practiceSingleWrong'] = '/Questions/wrong';           
				source['/Questions/practiceMultipleWrong'] = '/Questions/wrong';         
				source['/Questions/practiceSingleFavorite'] = '/Questions/favorite';     
				source['/Questions/practiceMultipleFavorite'] = '/Questions/favorite';   
				source['/Practice/paperPractice'] = new Array();
				source['/Practice/paperPractice']['unit'] = '/Practice/papers';			 
				source['/Practice/paperPractice']['ts'] = '/Paper/renjiduihua';          
				source['/Practice/paperPractice']['bs'] = '/Paper/bishi';                
				source['/Practice/knowledgePractice'] = new Array();
				source['/Practice/knowledgePractice']['unit'] = '/Teachingpurpose/index';			 
				source['/Practice/knowledgePractice']['details'] = '/Grammar/teachingPurpose';       
				source['/Practice/knowledgePractice']['dycs'] = '/Practice/papers';                  
				source['/Practice/knowledgePractice']['bs'] = '/Teachingpurpose/paper';              
				source['/Practice/knowledgePractice']['bsmn'] = '/Paper/bishi';                      
				source['/Practice/knowledgePractice']['zymn'] = '/Homework/lists';                   
				source['/Practice/paperRecord'] = new Array();
				source['/Practice/paperRecord']['unit'] = '/Practice/papers';			
				source['/Practice/paperRecord']['ts'] = '/Paper/renjiduihua';       	
				source['/Practice/paperRecord']['bs'] = '/Paper/bishi';              	
				source['/Practice/paperRecord']['hw'] = '/Homework/lists';              
				source['/Practice/wordReciteRecord'] = '/Homework/lists';               
				var path = window.location.pathname.split('.')[0];
				if (!Array.isArray) {
					Array.isArray = function(arg) {
						return Object.prototype.toString.call(arg) === '[object Array]';
					};
				}
				if(Array.isArray(source[path])){
					var url_type =　TSP.practice.process.getQueryString("type");
					if(path == '/Practice/knowledgePractice' && url_type == 'details'){
						var url_knowledge =　TSP.practice.process.getQueryString("knowledge");
						var kid =　TSP.practice.process.getQueryString("kid");
						if(kid != '' && kid != undefined && kid != null){
							url_knowledge = kid;
						}
						var version =　TSP.practice.process.getQueryString("version");
						var grade =　TSP.practice.process.getQueryString("grade");
						var unit =　TSP.practice.process.getQueryString("unit");
						var source_path = source[path][url_type] +'.html?knowledge='+url_knowledge+'&versionId='+version+'&gradeId='+grade+'&unitId='+unit;	
					}else{
						var source_path = source[path][url_type] +'.html';
					}
				}else{
					var source_path = source[path] +'.html';
				}
				location.href = TinSoConfig.student + source_path;
				return false;
			}
		},
		answerSheet : {
			stretch : false,
			init : function(){
				if(!(page_mode || type == 'preview')){
					practice.answerSheet.setSidebar();
				}else{
					practice.answerSheet.setAnswerSheetNumber();
					practice.answerSheet.setAnswerSheetHeight();
				}
			},
			select : function(index, offset){
				offset = offset || 0;
				if(isNaN(offset)){
					offset = 0;
				}
				var curIndex = practice.curIndex = index;
				practice.paperTest.select(curIndex);
				if(!is_primary){
					var top = $('.question_container[data-qid=' + index + ']').offset().top;
					var title_top = $('.p_paper_title').offset().top;
					var title_height = $('.p_paper_title').outerHeight(true);
					if($('.p_paper_title').css('position') == 'fixed'){
						top = top - 28 - 45 - title_height;
					}else{
						top = top - 28 - 45 - title_height - title_height;
					}
					if(page_mode === false && type == 'preview'){
						top = top - 32;
					}
					$('html, body').stop().animate({scrollTop : (top + offset) + 'px'}, 0);
				}else{
					$('.test_ctrl_info_area ').hide();
					$('.btn_play').removeClass('primary_btn_replay').addClass('primary_btn_play');
					clearInterval(tape_remainder_key);
					TSP.audio.player.stop();
					if(TSP.audio.recorder.inited){
						TSP.audio.recorder.stop();
					}
					var sub_type = $('.test_content[data-test-index='+index+']').attr('data-subtype');
					if((sub_type == 1121 || sub_type == 1122 || sub_type == 1123 || sub_type == 1124)){
						if(typeof pause_play_key != 'undefined'){
							clearInterval(pause_play_key);
						}
						$('.test_content[data-test-index='+index+']').find('.images_sort_cnt .images_sort_option_cnt').removeClass('current_sort_option').addClass('enable');
						$('.test_content[data-test-index='+index+']').find('.images_sort_cnt .images_sort_option_cnt .option_flag').removeClass('current_flag');
						if(!($('.primary_test_assheet ul li[data-index="' + index + '"]').hasClass('done') 
								|| $('.primary_test_cnt[data-page="result"]').length)){
							$('.test_content[data-test-index='+index+']').find('.images_sort_cnt .images_sort_option_cnt .images_sort_option').html('<div class="question_mark"></div>');
							TSP.practice.primary.question.randomChildNodes($('.test_content[data-test-index='+index+']').find('.question_content'), '.option_label');
							TSP.practice.primary.question.randomChildNodes($('.test_content[data-test-index='+index+']').find('.images_sort_cnt'), '.images_sort_option_cnt');
							$('.test_content[data-test-index='+index+']').find('.images_sort_cnt .images_sort_option_cnt').attr('data-rd-index', function(){
								return $(this).index() + 1;
							});
						}
					}
				}
			},
			setAnswerSheetNumber : function(callback){
				if(type == "wrong"){
					$('.test_sub_area').each(function(i, n){
						$('.p_answer_list').append('<p data-index=' + Number(temp_index + i) + '>' + $(this).attr('data-title') + '</p>');
						var temp = '';
						$(this).find('.test_content').each(function(j, m){
							temp += '<span data-id="' + $(this).attr('data-id') + '">';
							$(this).find('.question_container').each(function(k, v){
								temp += '<li class="dib" data-index="' + $(this).attr('data-qid') + '">' + $(this).attr('data-qid') + '</li>';
							});
							temp += '</span>';
						});
						$('.p_answer_list').append('<ul  data-index=' + Number(temp_index + i) + '>' + temp + '</ul>');
					});
				}else if(is_primary){
					var temp = '';
					$('.test_sub_area').find('.test_content').each(function(j, m){
						temp += '<li class="dib" data-index="' + $(this).attr('data-test-index') + '">' + $(this).attr('data-test-index') + '</li>';
					});
					$('.p_answer_list').append('<ul>' + temp + '</ul>').mCustomScrollbar('destroy').mCustomScrollbar({theme: 'dark'});
				}else{
					$('.test_sub_area').each(function(i, n){
						$('.p_answer_list').append('<p>' + $(this).attr('data-title') + '</p>');
						var temp = '';
						$(this).find('.question_container').each(function(j, m){
							temp += '<li class="dib" data-index="' + $(this).attr('data-qid') + '">' + $(this).attr('data-qid') + '</li>';
						});
						$('.p_answer_list').append('<ul>' + temp + '</ul>');
					});
				}
				typeof callback == 'function' && callback();
			},
			setSidebar : function(){
				var objs = new Object();
				var kindIndexs = new Object();
				var kind_index = 0;
				$('.test_sub_area').each(function(i, n){
					var title = $(this).attr('data-title');
					var kind = 0;
					var main_type = 0;
					var sub_type = 0;
					var part_id = $(this).attr('data-part-id');
					$(this).find('.test_content').each(function(j, m){
						var test_id = $(this).attr('data-id');
						var numArr = new Array();
						$(this).find('.question_container').each(function(k, o){
							numArr.push($(this).attr('data-qid'));
							kind = $(this).closest('.test_content').attr('data-kind');
							main_type = $(this).closest('.test_content').attr('data-type');
							sub_type = $(this).closest('.test_content').attr('data-subtype');
						});
						if(kindIndexs[kind] == undefined){
							kindIndexs[kind] = kind_index;
							kind_index++;
						}
						if(objs[kindIndexs[kind]] == undefined){
							objs[kindIndexs[kind]] = {'kind' : kind, 'kind_name' : practice.util.getKindName(kind), 'tests' : new Object()};
						}
						if(objs[kindIndexs[kind]]['tests'][$.md5(title)] == undefined){
							objs[kindIndexs[kind]]['tests'][$.md5(title)] = {'title' : title, 'main_type' : main_type, 'sub_type' : sub_type, 'part_id' : part_id, 'indexs' : new Array()}
						}
						objs[kindIndexs[kind]]['tests'][$.md5(title)]['indexs'].push({'index' : numArr.length > 1 ? numArr[0]+'~'+numArr[numArr.length-1] : numArr[0], 'test_id' : test_id});
					});
				});
				if($('.edit_homework .sidebar').length){
					$('.edit_homework .sidebar').mCustomScrollbar('destroy').html($('#test_tree_tpl').template(objs)).mCustomScrollbar({theme: 'dark'});
				}else if($('.preview_sidebar').length){
					$('.preview_sidebar').mCustomScrollbar('destroy').html($('#test_tree_tpl').template(objs)).mCustomScrollbar({theme: 'dark'});
				}
			},
			setAnswerSheetHeight : function(){
				window.paperBottom = $('body').height() - paperTop - paper.height();
				var ieVersion = null;
				if($.browser.msie){
					ieVersion = parseInt($.browser.version);
				}
				if($.browser.msie && ieVersion < 7){
					winHeight = document.body.clientHeight;
				}else if($.browser.msie && parseInt(ieVersion) < 9){
					winHeight = document.documentElement.clientHeight;
				}else if(window.innerHeight){
					winHeight = window.innerHeight;
				}else if(document.body.clientHeight){
					winHeight = document.body.clientHeight;
				}
				if($.browser.msie && ieVersion < 7){
					winWidth = document.body.clientWidth;
				}else if($.browser.msie && ieVersion < 9){
					winWidth = document.documentElement.clientWidth;
				}else if(window.innerWidth){
					winWidth = window.innerWidth;
				}else if(document.body.clientWidth){
					winWidth = document.body.clientWidth;
				}
				if(winWidth - 16 <= $('.main_content').width()){
					var slidebarWidth = 17;
				}else{
					var slidebarWidth = 0;
				}
				var tfTipsHeight = $('.answerSheet_tf_tips').length > 0 ? $('.answerSheet_tf_tips').height() - 11 : 0;
				var answerSheetHeight = 0;
				if(type == 'preview'){
					answerSheetHeight = winHeight - paperBottom - slidebarWidth - 60;
				}else{
					answerSheetHeight = winHeight - paperBottom - slidebarWidth - 28 - 60;	
				}
				$('.p_answerSheet_cnt').css({'height' : answerSheetHeight + 'px'});
				var reduceHeight = 0;
				if(window.location.pathname == '/Competition/paper.html'){
					reduceHeight = $('.time_box').height() + $('.p_operation_box').height() + tfTipsHeight + 40 + 60 + 10;
				}else{
					reduceHeight = $('.time_box').height() + $('.p_operation_box').height() + tfTipsHeight + 40;
				}
				if($('.test_content[data-type=1400]').length > 0) {
					reduceHeight = reduceHeight + 20;
				}
				var NumbersAreaHeight = answerSheetHeight - reduceHeight;
				$('.p_answer_list').css({
					'height' : NumbersAreaHeight + 'px',
					'min-height' : parseInt($('.p_answerSheet_cnt').css('min-height')) - reduceHeight + 'px'
				});
				this.stretch = false;
			},
			setAnswerSheetTitlePos : function(){
				scrollY = ( document.body.scrollTop 			
						|| window.pageYOffset 					
						|| document.documentElement.scrollTop	
						) + 28;
				scrollX = document.body.scrollLeft || window.pageXOffset || document.documentElement.scrollLeft;
				if($('.sec_nav_menu').css('position') == 'fixed'){
					scrollY += 60;
				}
				if(scrollY > titleTop){
					if(window.location.pathname != '/Competition/paper.html'){
						if(title.css('position') != 'fixed'){
							if(page_mode === false && type == 'preview'){
								title.css({'position' : 'fixed', 'top' : '60px'});
							}else{
								title.css({'position' : 'fixed', 'top' : '73px'});
							}
						}
					}
					if(answerSheet.css('position') != 'fixed'){
						if(page_mode === false && type == 'preview'){
							answerSheet.css({'position' : 'fixed', 'top' : '60px'});
						}else{
							answerSheet.css({'position' : 'fixed', 'top' : '73px'});
						}
					}
					TSP.practice.answerSheet.stretchAnswerSheet();
				}else{
					if(window.location.pathname != '/Competition/paper.html'){
						if(title.css('position') != 'static'){
							title.css({'position' : 'static'});
						}
					}
					if(answerSheet.css('position') != 'static'){
						answerSheet.css({'position' : 'static'});
					}
					TSP.practice.answerSheet.setAnswerSheetHeight();
				}
				TSP.practice.answerSheet.setAnswerSheetPosX();
			},
			setAnswerSheetPosX : function(){
				paperLeft = $('.main_content')[0].offsetLeft;
				if(window.location.pathname != '/Competition/paper.html'){
					if(answerSheet.css('position') == 'fixed'){
						answerSheet.css({'left' : (paperLeft + paperWidth + 6 - scrollX) + 'px'});
					}
					if(title.css('position') == 'fixed'){
						title.css({'left' : (paperLeft - scrollX) + 'px'});
					}
				}
			},
			stretchAnswerSheet : function(){
				if(typeof paperBottom === 'undefined'){
					paperBottom = $('body').height() - paperTop - paper.height();
				}
				if(typeof winHeight === 'undefined'){
					var ieVersion = null;
					if($.browser.msie){
						ieVersion = parseInt($.browser.version);
					}
					if($.browser.msie && ieVersion < 7){
						winHeight = document.body.clientHeight;
					}else if($.browser.msie && parseInt(ieVersion) < 9){
						winHeight = document.documentElement.clientHeight;
					}else if(window.innerHeight){
						winHeight = window.innerHeight;
					}else if(document.body.clientHeight){
						winHeight = document.body.clientHeight;
					}
				}
				if(!this.stretch && $('.p_answerSheet_cnt').height() < winHeight - 28 - 45){
					$('.p_answer_list').css('height', $('.p_answer_list').height() + paperBottom + 15 - 1 + 'px');
					$('.p_answerSheet_cnt').css('height', $('.p_answerSheet_cnt').height() + paperBottom + 15 - 1 + 'px'); 
					this.stretch = true;
				}
				if(paper.height() - scrollY + title.height() + paperBottom - 26 < winHeight){
					this.setAnswerSheetHeight();
				}
			}
		},
		paperTest : {
			init : function(){
				$('.p_tests_area').attr('data-page', 'practice');
				practice.paperTest.hideTestTitle();
				practice.paperTest.setXSZSTest();
				practice.paperTest.setQjTest();
				practice.paperTest.setDWLJTest();
				practice.paperTest.setTestNumber();
				practice.paperTest.setOption();
				practice.paperTest.setImgSize();
				if(page_mode){
					practice.paperTest.setTestStatus();
					practice.paperTest.initButton();
				}
				practice.paperTest.setVideoImg();
				if(window.location.pathname != '/Competition/paper.html'){
					practice.paperTest.setBoldLine();
				}
				practice.paperTest.removeWhite();
			},
			hideTestTitle : function(){
				var part_ids = ['2101', '3335', '3721', '4078'];
				$('.test_sub_area').each(function(i, obj){
					var part_id = $(this).attr('data-part-id');
					if($.inArray(part_id, part_ids) != -1){
						$(this).find('.sub_test_area').each(function(j, om){
							if(j != 0){
								$(this).find('.sub_info').hide();
							}
						});
					}
				});
				$('.sub_test_area').each(function(i, obj){
					var part_id = $(this).attr('data-struct-part-id');
					if($.inArray(part_id, part_ids) != -1){
						$(this).closest('.test_sub_area').find('.sub_test_area').each(function(j, om){
							if(j != 0){
								$(this).find('.sub_info').hide();
							}
						});
					}
				});
			},
			setDWLJTest : function(){
				$('.test_content[data-subtype="1701"]').each(function(i, obj){
					var question_container = $(this).find('.question_container:first');
					var option_box = $(this).find('.option_box');
					option_box.prev('.qs_t').addClass('box_option_content');
					question_container.before(option_box.prev('.qs_t'));
					$(this).find('.question_content[data-test-mold=5]').each(function(){
						var select = $(this).find('select');
						select.html('<option class="gettheanswerfromhere" value="">请选择...</option>');
						option_box.find('.box_item').each(function(){
							var option = $(this).attr("data-option");
							var num_value = $(this).attr("data-value");
							select.append('<option class="gettheanswerfromhere" data-value="' + num_value + '" value="'+option+'">'+option+'</option>');
						});
					});
				});
			},
			setXSZSTest : function(){
				var btn_area = '<div class="dib-wrap p_operationBtn_container"></div>';
				$('.test_content[data-type="7100"]').each(function(i, obj){
					var that = $(this).find('.question_container .question_content .question_p.china:eq(1)');
					if(!$(that).next().hasClass('p_operationBtn_container')){
						$(that).after(btn_area);
					}
				});
			},
			setQjTest : function(){
				$('.test_content[data-type="1500"]').each(function(i, obj){
					var sub_type = $(obj).attr('data-subtype');
					if(sub_type == 1522 || sub_type == 1523 || sub_type == 1524 || sub_type == 1528 || sub_type == 1530 || sub_type == 1537 
							|| sub_type == 1539 || sub_type == 1540){
						var question_str = '';
						$(obj).find('.china_q').each(function(j, o){
							if($(o).html() != '' && $(o).html() != null && $(o).html() != undefined){
								question_str += '<div class="dib dib-wrap question_content_str">' 
									+ '<div class="dib question_content_str_num">' + (j+1) + '.</div>'
									+ '<div class="dib question_content_str_info">' + $(o).html() + '</div>' + '</div>';
							}
						});
						if(sub_type == 1540){
							$(obj).find('.question_container .question_content').append(question_str);
                            $(obj).find('.china_q').remove();
						}else{
							$(obj).find('.question_container .question_content').html(question_str);
                            var pathname = window.location.pathname;
                            if(pathname.indexOf('Exam') == -1){
                                $(obj).find('.china_q').remove();
                            }
						}
					}else if(sub_type == 1514 || sub_type == 1529 || sub_type == 1526 || sub_type == 1527){
						var question_str = '';
						$(obj).find('.question_li .speak_sentence.question').each(function(j, o){
							if($(o).html() != '' && $(o).html() != null && $(o).html() != undefined){
								question_str += '<div class="dib dib-wrap question_content_str">' 
									+ '<div class="dib question_content_str_info">' + $(o).html() + '</div>' + '</div>';
							}
						});
						$(obj).find('.question_container .question_content').html(question_str);
					}else if((sub_type == 1508 || sub_type == 1520 || sub_type == 1511 || sub_type == 1538) && TinSoConfig.host.indexOf('student') == -1){
						var question_obj = $(obj).find('.question_container .question_content');
                        var question_str = '';
                        question_obj.html('');
                        $(obj).find('.question_division_line').find('.question_li').each(function(j, o){
                            if($(o).html() != '' && $(o).html() != null && $(o).html() != undefined){
                                question_str += '<p>' + $(o).children(':first').html() + '</p>';
                            }
						});
                        question_obj.html(question_str);
					}else if(sub_type == 1541){
						var str = $(obj).find('.listening_text .listening_text_p').html();
						$(obj).find('.question_container .question_content').html(str);
						$(obj).find('.question_container .question_content p').attr('style', 'text-indent: 2em;');
					}
				});
			},
			select : function(param){
				var index;	
				if(typeof param == 'number' && (page_mode || type == 'preview')){
					index = param;
					if(is_primary){
						$('.test_sub_area').removeClass('current_area');
						$('.test_content[data-test-index=' + index + ']').closest('.test_sub_area').addClass('current_area');
						$('.test_content').removeClass('current_test');
						$('.test_content[data-test-index=' + index + ']').addClass('current_test');
					}else{
						$('.question_container').removeClass('current_question');
						$('.question_container[data-qid=' + index + ']').addClass('current_question');
						$('.test_content').removeClass('current_test');
						$('.question_container[data-qid=' + index + ']').closest('.test_content').addClass('current_test');
					}
					$('.p_answer_list ul li').removeClass('as_current');
					$('.p_answer_list ul li[data-index=' + index + ']').addClass('as_current');
				}else if(typeof param == 'object' && param.target !== undefined && (page_mode || type == 'preview')){
					if(is_primary){
						return;
					}
					var e = param;
					var test_content = $(e.target).closest('.test_content');
 					var question_cnt = $(e.target).closest('.question_container');
 					var count = test_content.attr('data-count');
 					if(!test_content.hasClass('current_test')){
 						$('.test_content').removeClass('current_test');
						test_content.addClass('current_test');
 					}
 					if(question_cnt.length != 0){
 						$('.question_container').removeClass('current_question');
 						question_cnt.addClass('current_question');
 						index = question_cnt.attr('data-qid');
 					}
 					else if(test_content.find('.current_question').length == 0){
 						$('.question_container').removeClass('current_question');
 						test_content.find('.question_container').first().addClass('current_question');
 						index = test_content.find('.question_container').first().attr('data-qid');
 					}
 					else{
 						return false;
 					}
 					$('.p_answer_list ul li').removeClass('as_current');
 					$('.p_answer_list ul li[data-index=' + index + ']').addClass('as_current');
					var li_top = $('.p_answer_list ul li[data-index=' + index + ']').offset().top;
					var answer_list_top = $('.p_answer_list').offset().top;
					var answer_list_scroll_top= $('.p_answer_list').scrollTop();
					$('.p_answer_list').stop().animate({scrollTop : (li_top - answer_list_top + answer_list_scroll_top) + 'px'}, 0);
				}
				$('.p_switch_current span').text(index);
				if(is_primary){
					practice.primary.question.setStyle();
				}
			},
			setTestNumber : function(){
				if(is_primary){
					$('.test_content').each(function(i, n){
						$(n).attr('data-test-index', (i+1));
					});
					return;
				}
				if(type != 'wrong'){
					temp_id = 0;
				}
				if(!page_mode && window.location.pathname == '/Homework/newHomework.html'){
					$('.homework_area.editModel .question_id').each(function(i, n){
						$(this).html((temp_id +　i + 1) + '.'); 
						$(this).closest('.question_container').attr('data-qid', (temp_id　+ i + 1));
					});
				}else{
					$('.question_id').each(function(i, n){
						$(this).html((temp_id +　i + 1) + '.'); 
						$(this).closest('.question_container').attr('data-qid', (temp_id　+ i + 1));
					});
				}
				$('.text_content').has($('.readingBlk_num')).each(function(i, n){
					var startNum = parseInt($(n).closest('.test_content').find('.question_container').attr('data-qid'));
					$(n).find('.readingBlk_num').each(function(j, m){
						$(m).text(j + startNum);
					});
				});
				practice.count = $('.question_id').length;
			},
			setOption : function(removeABC){
				removeABC = removeABC || false;
				var abc = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
				$('.question_content').each(function(){
					var sub_type = $(this).closest('.test_content').attr('data-subtype');
					var lengthArr = new Array();
					var option_label = $(this).find('.option_label');
					var width = !is_primary ? $(this).width() : $('.primary_test_question_cnt').width() * 0.7;
					option_label.each(function(i, n){
						if(is_primary){
							if(sub_type != 1121 && sub_type != 1122 && sub_type != 1123 && sub_type != 1124){
								$(this).css('width', width).attr('data-option', abc[i]);
							}
							if(removeABC === true){
								var input_obj = $(this).find('input');
								if($(this).find('img').length > 0 
										|| (sub_type == 1121 || sub_type == 1122 || sub_type == 1123 || sub_type == 1124)){
									var opt_content = $(this).find('img').prop('outerHTML');
								}else{
									var opt_content = $(this).text();
									if(opt_content.match(/[ABCDEFG]\.(\s)?/)){
										opt_content = opt_content.replace(/[ABCDEFG]\.(\s)?/, '');
									}
								}
								$(this).html(input_obj);
								opt_content = '<div class="opt_content">' + opt_content + '</div>';
								$(this).find('input').after(opt_content);
							}
							return true;
						}
						if(this.currentStyle){
							var each_width = this.currentStyle.width;
						}else{
							var each_width = parseFloat(document.defaultView.getComputedStyle(this, null).width);
						}
						lengthArr.push(each_width);
					});
					var maxLength = Math.max.apply(null, lengthArr);
					var	avg_length = width / lengthArr.length;
					if(maxLength < avg_length){
						option_label.css('width',avg_length);
					}else{
						if(lengthArr.length % 2){
							option_label.css('width',width);	
						}else{
							if(maxLength > width/2){
								option_label.css('width',width);	
							}else{
								option_label.css('width',width/2);	
							}
						}
					}
					option_label.addClass('dib');
				});
			},
			setImgSize : function(){
				$('.p_tests_area,.homework_box').find('img').each(function(i, n){
					if($(n).context.previousSibling == null
						&& $(n).context.nextSibling == null
						&& $(n).parent()[0].nodeName == 'P'
					){
						$(n).parent().css({
							'text-indent' : '0px',
							'text-align' : 'center'
						});
					}
					$(n).load(function(){
						if($(n).width() > $(n).parent().width()){
							$(n).width($(n).parent().width());
						}
					});
				});
			},
			setTestStatus : function(){
				$('.test_content').each(function(i,n){
			 		var bank_flag = $(this).attr('data-bankflag');
					var add_div = '<span class="dib add_to_bank stars" title="加入我的题库"></span>';
					var remove_div = '<span class="dib remove_from_bank stars" title="移出我的题库"></span>';
					if(bank_flag == 1){
						$(this).find('.qid_area:first').append(remove_div);
					}else{
						$(this).find('.qid_area:first').append(add_div);	
					}
				});
			},
			setVideoImg : function(){
				$('.test_content[data-type="1100"] label').addClass('img_label');
			},
			setBoldLine : function(){
				var num = $('.test_sub_area').length;
				$('.test_sub_area').each(function(i, obj){
					if((i + 1) < num){
						$(this).append('<div class="bold_line_class"></div>');
					}
				});
			},
			removeWhite : function(){
				$('.question_content .question_p').each(function(){
					var sub_type = $(this).closest('.test_content').attr('data-subtype');
					if(sub_type == 1227 || sub_type == 1228){
					}else{
						var text = $(this).html();	
						if($.trim(text) == ''){
							$(this).remove();
						}
					}
				});
			},
			initButton : function(){
				if(!is_primary){
					$('.test_content[data-kind="1"] .p_operationBtn_container').html($('#listentBtnTemp').template());
				}else{
					$('.test_content[data-kind="1"] .p_operationBtn_container').html($('#primaryListenBtnTemp').template());
				}
				$('.test_content[data-kind="2"] .p_operationBtn_container').each(function(i, n){
					var main_type = $(n).closest('.test_content').attr('data-type');
					var sub_type = $(n).closest('.test_content').attr('data-subtype');
					if(main_type == 1400 && sub_type != 1428 && sub_type != 1438 && $('#speackingBtnBTemp').length != 0){
						$(n).html($('#speackingBtnBTemp').template());
					}
					else if(main_type == 6100 && $('#speackingBtnLCCJTemp').length != 0){
						$(n).html($('#speackingBtnLCCJTemp').template());
					}
					else{
						$(n).html($('#speackingBtnTemp').template());
					}
				});
				if($('.test_content[data-kind="2"] .p_operationBtn_container input').length){
					$('.test_content[data-kind="2"] .p_operationBtn_container input').iCheck({
						radioClass: 'iradio_square-green',
						increaseArea: '20%' 
					});
				}
				$('.test_content[data-type="7100"]').each(function(i, obj){
					if($(this).find('.p_operationBtn_container').length == 2){
						$(this).find('.p_operationBtn_container:eq(0) .right_area').html('');
					}
				});
				$('.test_content[data-type="6300"][data-kind="1"],.test_content[data-subtype="6403"],.test_content[data-subtype="6406"],.test_content[data-subtype="6410"],.test_content[data-subtype="6413"],.test_content[data-subtype="6417"],.test_content[data-subtype="6420"],.test_content[data-subtype="6424"],.test_content[data-subtype="6427"]').each(function(i, obj){
					$(obj).find('.p_operationBtn_container').addClass('knowledge_test_btn_container').html($('#kSpeackingBtnTemp').template());
				});
				$('.test_content[data-subtype="2907"], .test_content[data-subtype="2908"], .test_content[data-subtype="3307"], .test_content[data-subtype="3308"]').each(function(i, obj){
					$(obj).find('.p_operationBtn_container').html($('#readQuestionBtnTemp').template());
				});
			}
		},
		testTime : {
			calculateTime : function(val){
				if($('#test-mode[data-mode="free"]').is(':checked')){
					$('.p_answerSheet_cnt .practice_time').html('用时');
				}else{
					$('.p_answerSheet_cnt .practice_time').html('剩余');
				}
				if(page_mode){
					var source = $('.p_paper_cnt').attr('data-source');
					var struct_type = $('.p_paper_cnt').attr('data-struct-type');
					var mode = $('.p_operation_box #test-mode').attr('data-mode');
					if(mode == 'exam' && (source == 'ts' || source == 'unit')){
						total_time = $('.p_paper_cnt').attr('data-need-time') * 60;
					}else{
						total_time = $('.p_paper_cnt').attr('data-need-time') * 60;
					}
					if(!!TSP.audio.recorder && !!TSP.audio.recorder.config){
						var audio_dialog_key = setInterval(function(){
							if(((TSP.audio.recorder.inited && $('#TinSoAudioModuleLoadMessageBox').length == 0)
								|| TSP.audio.recorder.inited === false)
								&& TSP.audio.files.length == TSP.audio.files.loaded
							){
								if(source == 'hw' && (struct_type == 1 || struct_type == 2) && mode == 'free'){
									if(val != 1){
										time = 0;
									}
									var time_prompt = 10800;
									practice.testTime.positiveTime(time_prompt);
								}else{
									count_down_time = total_time;
									practice.testTime.countdown();
								}
								clearInterval(audio_dialog_key);
							}
						}, 100);
					}else{
						var loaded_dialog_key = setInterval(function(){
							if(TSP.audio.files.length == TSP.audio.files.loaded){
								if(source == 'hw' && (struct_type == 1 || struct_type == 2) && mode == 'free'){
									time = 0;
									var time_prompt = 10800;
									practice.testTime.positiveTime(time_prompt);
								}else{
									count_down_time = total_time;
									practice.testTime.countdown();
								}
								clearInterval(loaded_dialog_key);
							}
						}, 100);
					}
				}
			},
			countdown : function(){
				if($('#test-mode[data-mode="free"]').is(':checked')){
					$('.p_answerSheet_cnt .practice_time').html('用时');
					time_id = setInterval(practice.testTime.timeCount, 1000);
				}else{
					$('.p_answerSheet_cnt .practice_time').html('剩余');
					time_id = setInterval(practice.testTime.timer, 1000);
				}
			},
			timer : function(){
				var h = Math.floor(count_down_time / 3600);
				var m = Math.floor((count_down_time - h * 3600) / 60);
				var s = count_down_time - h * 3600 - m * 60;
				$('.countdown_hour').html(h < 10 ? '0' + h : h);
				$('.countdown_minute').html(m < 10 ? '0' + m : m);
				$('.countdown_second').html(s < 10 ? '0' + s : s);
				count_down_time--;
				time++;
				s--;
				if(s < 0){
					s = 59;
					m--;
				}
				if(m < 0){
					m = 59
					h--;
				}
				if(count_down_time < 0){
					clearInterval(time_id);
					var mode = $('.p_operation_box #test-mode').attr('data-mode');
					var source = $('.p_paper_cnt').attr('data-source');
					var struct_type = $('.p_paper_cnt').attr('data-struct-type');
					if(mode == 'exam' 
						&& (	
								(source == 'ts' || source == 'unit') 
								|| (source == 'hw' && (struct_type == 2 || struct_type == 3))	
							)
					){
						return false;
					}
					if(type == 'competition' || type == 'competition_preview'){
						TSP.practice.process.submitAnswerCheck();
					}else{
						MessageBox({
							content : '答题时间到，提交答案或返回？点击提交答案查看练习结果，点击返回回到前一页面。',
							buttons : [{
								text : '提交答案',
								click : function(){
									$( this ).dialog('close');
									TSP.practice.process.submitAnswerCheck();
								}
							},
							{
								text : '返  回',
								click : function(){
									$(this).dialog('close');
									TSP.practice.process.backToSource();
								}
							}]
						});
					}					
				}
			},
			timeCount : function(){
				var h = Math.floor(time / 3600);
				var m = Math.floor((time - h * 3600) / 60);
				var s = time - h * 3600 - m * 60;
				$('.countdown_hour').html(h < 10 ? '0' + h : h);
				$('.countdown_minute').html(m < 10 ? '0' + m : m);
				$('.countdown_second').html(s < 10 ? '0' + s : s);
				time++;
				s++;
				if(s > 59){
					s = 0;
					m++;
				}
				if(m > 59){
					m = 0;
					h++;
				}
			},
			positiveTime : function(prompt){
				$('.p_answerSheet_cnt .practice_time').html('用时');
				time_id = setInterval(function(){
					if(time >= prompt){
						clearInterval(time_id);
						MessageBox({
							content : '答题时间过长，是否提交答案？',
							buttons : [
							    {
							    	text : '提交答案',
							    	click : function(){
										$( this ).dialog('close');
										TSP.practice.process.submitAnswerCheck();
									}
								},
								{
									text : '继续答题',
									click : function(){
										$(this).dialog('close');
										practice.testTime.positiveTime(prompt + 1800);
									}
								}
							]
						});
					}
					practice.testTime.timeCount();
				}, 1000);
			},
			setPracticeTime : function(time){
				$('.time_box .practice_time').html('用时');
				var h = Math.floor(time / 3600);
				var m = Math.floor((time - h * 3600) / 60);
				var s = Math.ceil(time - h * 3600 - m * 60);
				$('.countdown_hour').html(h < 10 ? '0' + h : h);
				$('.countdown_minute').html(m < 10 ? '0' + m : m);
				$('.countdown_second').html(s < 10 ? '0' + s : s);
			}
		},
		parseTest : {
			initPaperTest : function(structObj, parseTests){
				var struct = structObj['struct'];
				var structParts = structObj['structParts'];
				var structureInfos = structObj['structureInfos'];
				var tests = new Object();
				var tatol_score = 0;
				var tatol_need_time = 0;
				var index_order = 1;
				var indexs = new Array();
				config = new Object();
				if(parseTests[0].config){
					config = parseTests[0].config;
				}
				$.each(structureInfos, function(i, structureInfo){
					var testNum = structureInfo['test_num'];
					var structPartId = structureInfo['struct_part_id'];
					var structInfoTest = new Array();
					if(i > 0 && structureInfo['sub_type'] == structureInfos[i-1]['sub_type']){
						index_order ++;
						structureInfo['index_order'] = index_order;
					}else{
						index_order = 1;
						structureInfo['index_order'] = index_order;
					}
					$.each(parseTests, function(j, test){
						var score = 0;
						var question_num = test['question_num'];
						if(test['sub_type'] == 1610){
							question_num = 1;
						}else if(test['main_type'] == 7100){
							question_num = 3;
						}
						var scores = structureInfo['score'].split('|');
						for(var k = 0; k < question_num; k++){
							score += parseFloat(k >= scores.length - 1 ? scores[0] : scores[k]);
						}
						if(testNum >0 && ((indexs.length && $.inArray(j, indexs) == -1) || indexs.length == 0)){
							if(structureInfo['sub_type'].indexOf(test['sub_type']) != -1){
								testNum--;
								test['need_time'] = parseInt(structureInfo['need_time']);
								structInfoTest.push(test);
								indexs.push(j);
								tatol_need_time += parseInt(structureInfo['need_time']);
								tatol_score += score;
							}
						}else if(testNum >0 && ((indexs.length && $.inArray(j, indexs) == -1) || indexs.length == 0)){
							if(test['main_type'] == structureInfo['main_type']){
								testNum--;
								test['need_time'] = parseInt(structureInfo['need_time']);
								structInfoTest.push(test);
								indexs.push(j);
								tatol_need_time += parseInt(structureInfo['need_time']);
								tatol_score += score;
							}
						}
					});
					if(testNum == 0){
						structureInfos[i]['test_num_status'] = false;
					}else{
						structureInfos[i]['test_num_status'] = true;
					}
					if(structInfoTest.length > 0){
						if(tests[structPartId] == undefined){
							tests[structPartId] = {'struct_part_id' : structPartId, 
									'part_name' : structParts[structPartId]['name'], 
									'struct_order' : structParts[structPartId]['struct_order'], 
									'bshow' : structParts[structPartId]['bshow'] === false ? false : true,
									'struct_info' : new Object()};
						}
						structureInfo['tests'] = structInfoTest;
						tests[structPartId]['struct_info'][structureInfo['id']] = structureInfo;
					}
				});
				if(indexs.length < parseTests.length){
					$.each(structureInfos, function(i, structureInfo){
						if(structureInfo['test_num_status']){
							var testNum = structureInfo['test_num'];
							var structPartId = structureInfo['struct_part_id'];
							var structInfoTest = new Array();
							if(i > 0 && structureInfo['sub_type'] == structureInfos[i-1]['sub_type']){
								index_order ++;
								structureInfo['index_order'] = index_order;
							}else{
								index_order = 1;
								structureInfo['index_order'] = index_order;
							}
							$.each(parseTests, function(j, test){
								var score = 0;
								var question_num = test['question_num'];
								if(test['sub_type'] == 1610){
									question_num = 1;
								}
								var scores = structureInfo['score'].split('|');
								for(var k = 0; k < question_num; k++){
									score += parseFloat(k >= scores.length - 1 ? scores[0] : scores[k]);
								}
								if(testNum >0 && test['main_type'] == structureInfo['main_type'] 
									&& ((indexs.length && $.inArray(j, indexs) == -1) || indexs.length == 0)){
									testNum--;
									test['need_time'] = parseInt(structureInfo['need_time']);
									structInfoTest.push(test);
									indexs.push(j);
									tatol_need_time += parseInt(structureInfo['need_time']);
									tatol_score += score;
								}
							});
							if(structInfoTest.length > 0){
								if(tests[structPartId] == undefined 
										|| tests[structPartId]['struct_info'][structureInfo['id']] == undefined){
									if(tests[structPartId] == undefined){
										tests[structPartId] = {'struct_part_id' : structPartId, 
												'part_name' : structParts[structPartId]['name'], 
												'struct_order' : structParts[structPartId]['struct_order'], 
												'bshow' : structParts[structPartId]['bshow'] === false ? false : true,
												'struct_info' : new Object()};
									}
									structureInfo['tests'] = structInfoTest;
									tests[structPartId]['struct_info'][structureInfo['id']] = structureInfo;
								}else{
									var tmpTestArr = tests[structPartId]['struct_info'][structureInfo['id']]['tests'];
									$.each(structInfoTest, function(ii, vvk){
										tmpTestArr.push(vvk);
									});
									tmpTestArr.sort(function(a, b) {
						                if (a['test_order'] > b['test_order']) {
						                    return 1;
						                } else if (a['test_order'] < b['test_order']) {
						                    return -1;
						                } else {
						                    return 0;
						                }
						            });
									tests[structPartId]['struct_info'][structureInfo['id']]['tests'] = tmpTestArr;
								}
							}
						}
					});
				}
				if(indexs.length < parseTests.length){
					$.each(structureInfos, function(i, structureInfo){
						var structPartId = structureInfo['struct_part_id'];
						var structInfoTest = new Array();
						if(i > 0 && structureInfo['sub_type'] == structureInfos[i-1]['sub_type']){
							index_order ++;
							structureInfo['index_order'] = index_order;
						}else{
							index_order = 1;
							structureInfo['index_order'] = index_order;
						}
						$.each(parseTests, function(j, test){
							var score = 0;
							var question_num = test['question_num'];
							if(test['sub_type'] == 1610){
								question_num = 1;
							}
							var scores = structureInfo['score'].split('|');
							for(var k = 0; k < question_num; k++){
								score += parseFloat(k >= scores.length - 1 ? scores[0] : scores[k]);
							}
							if(test['main_type'] == structureInfo['main_type'] 
								&& ((indexs.length && $.inArray(j, indexs) == -1) || indexs.length == 0)){
								test['need_time'] = parseInt(structureInfo['need_time']);
								structInfoTest.push(test);
								indexs.push(j);
								tatol_need_time += parseInt(structureInfo['need_time']);
								tatol_score += score;
							}
						});
						if(structInfoTest.length > 0){
							if(tests[structPartId] == undefined 
									|| tests[structPartId]['struct_info'][structureInfo['id']] == undefined){
								if(tests[structPartId] == undefined){
									tests[structPartId] = {'struct_part_id' : structPartId, 
											'part_name' : structParts[structPartId]['name'], 
											'struct_order' : structParts[structPartId]['struct_order'], 
											'bshow' : structParts[structPartId]['bshow'] === false ? false : true,
											'struct_info' : new Object()};
								}
								structureInfo['tests'] = structInfoTest;
								tests[structPartId]['struct_info'][structureInfo['id']] = structureInfo;
							}else{
								var tmpTestArr = tests[structPartId]['struct_info'][structureInfo['id']]['tests'];
								$.each(structInfoTest, function(ii, vvk){
									tmpTestArr.push(vvk);
								});
								tmpTestArr.sort(function(a, b) {
					                if (a['test_order'] > b['test_order']) {
					                    return 1;
					                } else if (a['test_order'] < b['test_order']) {
					                    return -1;
					                } else {
					                    return 0;
					                }
					            });
								tests[structPartId]['struct_info'][structureInfo['id']]['tests'] = tmpTestArr;
							}
						}
					});
				}
				var kyKindFlag = false;
				$.each(parseTests, function(i, obj){
					if(obj['kind'] == 2){
						kyKindFlag = true;
					}
				});
				if(struct['need_time'] > 0){
					tatol_need_time = 10 + parseInt(struct['need_time']);
				}else{
					tatol_need_time = 10 + Math.ceil(tatol_need_time/60);
				}
				tatol_score = Math.formatFloat(tatol_score);
				if($('.p_paper_cnt').length){
					$('.p_paper_cnt').attr('data-need-time', tatol_need_time);
					$('.p_paper_cnt').attr('data-tatol-score', tatol_score);
				}
				if($('.edit_homework .info_time').length){
					$('.edit_homework .info_time').attr('data-time', tatol_need_time).html(tatol_need_time);
				}
				if($('.edit_homework .info_score').length){
					$('.edit_homework .info_score').attr('data-score', tatol_score).html(tatol_score);
				}
				if($('.new_homework_cnt').length){
					$('.new_homework_cnt').attr('data-time', tatol_need_time);
					$('.new_homework_cnt').attr('data-score', tatol_score);
				}
				$.each(tests, function(i, obj){
					var tmpTests = new Object();
					$.each(obj['struct_info'], function(j, o){
						tmpTests[o['test_order']] = o;
					});
					tests[i]['struct_info'] = tmpTests;
				});
				return tests;
			},
			initTest : function(structObj, parseTests){
				var struct = structObj['struct'];
				var structParts = structObj['structParts'];
				var structureInfos = structObj['structureInfos'];
				var tests = new Object();
				var tatol_need_time = 0;
				var tatol_score = 0;
				var indexs = new Array();
				config = null;
				if(parseTests[0].config){
					config = parseTests[0].config;
				}
				var subTypes = new Array();
				$.each(structureInfos, function(i, structureInfo){
					subTypes.push(structureInfo['sub_type']);
				});
				$.each(structureInfos, function(i, structureInfo){
					var structPartId = structureInfo['struct_part_id'];
					var structInfoTest = new Array();
					$.each(parseTests, function(j, test){
						var score = 0;
						var question_num = test['question_num'];
						if(test['sub_type'] == 1610){
							question_num = 1;
						}
						var scores = structureInfo['score'].split('|');
						for(var k = 0; k < question_num; k++){
							score += parseFloat(k >= scores.length - 1 ? scores[0] : scores[k]);
						}
						if(structureInfo['sub_type'] > 0){
							if(test['sub_type'] == structureInfo['sub_type'] && $.inArray(j, indexs) == -1){
								test['index'] = j;
								structInfoTest.push(test);
								indexs.push(j);
								tatol_need_time += parseInt(structureInfo['need_time']);
								tatol_score += score;
							}else if($.inArray(test['sub_type'], subTypes) == -1 && test['main_type'] == structureInfo['main_type'] && $.inArray(j, indexs) == -1){
								test['index'] = j;
								structInfoTest.push(test);
								indexs.push(j);
								tatol_need_time += parseInt(structureInfo['need_time']);
								tatol_score += score;
							}
						}else{
							if(test['main_type'] == structureInfo['main_type'] && $.inArray(j, indexs) == -1){
								test['index'] = j;
								structInfoTest.push(test);
								indexs.push(j);
								tatol_need_time += parseInt(structureInfo['need_time']);
								tatol_score += score;
							}
						}
					});
					if(structInfoTest.length > 0){
						if(tests[structPartId] == undefined){
							tests[structPartId] = {'struct_part_id' : structPartId, 'part_name' : structParts[structPartId]['name'], 
									'struct_order' : structParts[structPartId]['struct_order'], 'struct_info' : new Object()};
						}
						structureInfo['tests'] = structInfoTest;
						tests[structPartId]['struct_info'][structureInfo['id']] = structureInfo;
					}
				});
				var kyKindFlag = false;
				$.each(parseTests, function(i, obj){
					if(obj['kind'] == 2){
						kyKindFlag = true;
					}
				});
				if(kyKindFlag){
					tatol_need_time = Math.ceil(tatol_need_time*140/100/60);
				}else{
					tatol_need_time = Math.ceil(tatol_need_time*110/100/60);
				}
				tatol_score = Math.formatFloat(tatol_score);
				if($('.p_paper_cnt').length){
					$('.p_paper_cnt').attr('data-need-time', tatol_need_time);
					$('.p_paper_cnt').attr('data-tatol-score', tatol_score);
				}
				if($('.edit_homework .info_time').length){
					$('.edit_homework .info_time').attr('data-time', tatol_need_time).html(tatol_need_time);
				}
				if($('.edit_homework .info_score').length){
					$('.edit_homework .info_score').attr('data-score', tatol_score).html(tatol_score);
				}
				if($('.new_homework_cnt').length){
					$('.new_homework_cnt').attr('data-time', tatol_need_time);
					$('.new_homework_cnt').attr('data-score', tatol_score);
				}
				return tests;
			},
			initTestByTsOrBs : function(struct, parseTests){
				var tests = new Object();
				var indexs = new Array();
				var tatol_need_time = 0;
				var tatol_score = 0;
				config = new Object();
				if(parseTests[0].config){
					config = parseTests[0].config;
				}
				$.each(struct, function(i, structObj){
					var struct = structObj['struct'];
					var structParts = structObj['structParts'];
					var structureInfos = structObj['structureInfos'];
					var subTypes = new Array();
					$.each(structureInfos, function(i, structureInfo){
						subTypes.push(structureInfo['sub_type']);
					});
					$.each(structureInfos, function(i, structureInfo){
						var structPartId = structureInfo['struct_part_id'];
						var structInfoTest = new Array();
						$.each(parseTests, function(j, test){
							var score = 0;
							var question_num = test['question_num'];
							if(test['sub_type'] == 1610){
								question_num = 1;
							}
							var scores = structureInfo['score'].split('|');
							for(var k = 0; k < question_num; k++){
								score += parseFloat(k >= scores.length - 1 ? scores[0] : scores[k]);
							}
							if(structureInfo['sub_type'] > 0){
								if(test['sub_type'] == structureInfo['sub_type'] && $.inArray(j, indexs) == -1){
									test['index'] = j;
									structInfoTest.push(test);
									indexs.push(j);
									tatol_need_time += parseInt(structureInfo['need_time']);
									tatol_score += score;
								}else if($.inArray(test['sub_type'], subTypes) == -1 && test['main_type'] == structureInfo['main_type'] && $.inArray(j, indexs) == -1){
									test['index'] = j;
									structInfoTest.push(test);
									indexs.push(j);
									tatol_need_time += parseInt(structureInfo['need_time']);
									tatol_score += score;
								}
							}else{
								if(test['main_type'] == structureInfo['main_type'] && $.inArray(j, indexs) == -1){
									test['index'] = j;
									structInfoTest.push(test);
									indexs.push(j);
									tatol_need_time += parseInt(structureInfo['need_time']);
									tatol_score += score;
								}
							}
						});
						if(structInfoTest.length > 0){
							if(tests[structPartId] == undefined){
								tests[structPartId] = {'struct_part_id' : structPartId, 'part_name' : structParts[structPartId]['name'], 
										'struct_order' : structParts[structPartId]['struct_order'], 'struct_info' : new Object()};
							}
							structureInfo['tests'] = structInfoTest;
							tests[structPartId]['struct_info'][structureInfo['id']] = structureInfo;
						}
					});
				});
				var kyKindFlag = false;
				$.each(parseTests, function(i, obj){
					if(obj['kind'] == 2){
						kyKindFlag = true;
					}
				});
				if(kyKindFlag){
					tatol_need_time = Math.ceil(tatol_need_time*140/100/60);
				}else{
					tatol_need_time = Math.ceil(tatol_need_time*110/100/60);
				}
				tatol_score = Math.formatFloat(tatol_score);
				if($('.p_paper_cnt').length){
					$('.p_paper_cnt').attr('data-need-time', tatol_need_time);
					$('.p_paper_cnt').attr('data-tatol-score', tatol_score);
				}
				if($('.edit_homework .info_time').length){
					$('.edit_homework .info_time').attr('data-time', tatol_need_time).html(tatol_need_time);
				}
				if($('.edit_homework .info_score').length){
					$('.edit_homework .info_score').attr('data-score', tatol_score).html(tatol_score);
				}
				if($('.new_homework_cnt').length){
					$('.new_homework_cnt').attr('data-time', tatol_need_time);
					$('.new_homework_cnt').attr('data-score', tatol_score);
				}
				return tests;
			},
			initTestStruct : function(structObj, parseTests, isOrderByTest){
				var struct = structObj['struct'];
				var structParts = structObj['structParts'];
				var structureInfos = structObj['structureInfos'];
				var tests = new Array();
				var tatol_need_time = 0;
				var tatol_score = 0;
				var index = 0;
				var structInfos = new Object();
				config = new Object();
				if(parseTests[0].config){
					config = parseTests[0].config;
				}
				$.each(structureInfos, function(j, obj){
					if(structInfos[obj['main_type']] == undefined){
						structInfos[obj['main_type']] = new Object();
					}
					if(structInfos[obj['main_type']][obj['sub_type']] == undefined){
						structInfos[obj['main_type']][obj['sub_type']] = new Array();
					}
					structInfos[obj['main_type']][obj['sub_type']].push(obj);
				});
				while(true){
					if(index >= parseTests.length){
						break;
					}
					var tmpTests = new Array();
					var compare_main_type = 0;
					var compare_sub_type = 0;
					var flag = true;
					var selectedStructInfo = null;
					for(var i = index; i < parseTests.length; i++){
						var main_type = parseTests[i]['main_type'];
						var sub_type = parseTests[i]['sub_type'];
						if(main_type == 7100){
							parseTests[i]['question_num'] = 3;
						}
						if(flag){
							if(structInfos[main_type] != undefined && structInfos[main_type][sub_type]){
								if(structInfos[main_type][sub_type].length > 1){
									selectedStructInfo = deepCopy(structInfos[main_type][sub_type][0]);
									compare_main_type = 'main_type' + structInfos[main_type][sub_type].length + main_type;
									compare_sub_type = 'sub_type' + structInfos[main_type][sub_type].length + sub_type;
									parseTests[i]['need_time'] = parseInt(selectedStructInfo['need_time']);
									tmpTests.push(parseTests[i]);
									flag = false;
									index++;
									structInfos[main_type][sub_type].splice(0, 1)
									continue;
								}else{
									selectedStructInfo = deepCopy(structInfos[main_type][sub_type][0]);
								}
							}else if(structInfos[main_type]){
								var tmpStatus = false;
								$.each(structInfos[main_type], function(k, infoObj){
									if(k == 0){
										selectedStructInfo = infoObj;
										tmpStatus = true;
									}
									if(!tmpStatus){
										selectedStructInfo = infoObj;
									}
								});
							}else{
								index++;
								break;
							}
							if($.isArray(selectedStructInfo)){
								selectedStructInfo = selectedStructInfo[0];
							}
							compare_main_type = main_type;
							compare_sub_type = sub_type;
							parseTests[i]['need_time'] = parseInt(selectedStructInfo['need_time']);
							parseTests[i]['score'] = selectedStructInfo['score'];
							tmpTests.push(parseTests[i]);
							flag = false;
							index++;
							continue;
						}
						if(structInfos[main_type] != undefined && structInfos[main_type][sub_type]){
							if(main_type == compare_main_type && sub_type == compare_sub_type){
								parseTests[i]['need_time'] = parseInt(selectedStructInfo['need_time']);
								parseTests[i]['score'] = selectedStructInfo['score'];
								tmpTests.push(parseTests[i]);
								index++;
								continue;
							}else{
								break;
							}
						}else if(structInfos[main_type] && structInfos[main_type][0]){
							if(main_type == compare_main_type && sub_type == compare_sub_type){
								parseTests[i]['need_time'] = parseInt(selectedStructInfo['need_time']);
								parseTests[i]['score'] = selectedStructInfo['score'];
								tmpTests.push(parseTests[i]);
								index++;
								continue;
							}else{
								break;
							}
						}else if(structInfos[main_type]){
							if(main_type == compare_main_type){
								parseTests[i]['need_time'] = parseInt(selectedStructInfo['need_time']);
								parseTests[i]['score'] = selectedStructInfo['score'];
								tmpTests.push(parseTests[i]);
								index++;
								continue;
							}else{
								break;
							}
						}else{
							break;
						}
					}
					if(tmpTests.length > 0 && selectedStructInfo != null){
						var structPartId = selectedStructInfo['struct_part_id'];
						selectedStructInfo['tests'] = deepCopy(tmpTests);
						var test = {'struct_part_id' : structPartId, 'part_name' : structParts[structPartId]['name'], 
							'struct_info' : [deepCopy(selectedStructInfo)], 'struct_order' : structParts[structPartId]['struct_order']};
						tests.push(test);
						tatol_need_time += parseInt(selectedStructInfo['need_time']) * tmpTests.length;
						var scores = selectedStructInfo['score'].split('|');
						$.each(selectedStructInfo['tests'], function(n, obj){
							var question_num = obj['question_num'];
							for(var n = 0; n < question_num; n++){
								tatol_score += parseFloat(n >= scores.length - 1 ? scores[0] : scores[n]);
							}
						});
					}
				}
				var kyKindFlag = false;
				$.each(parseTests, function(i, obj){
					if(obj['kind'] == 2){
						kyKindFlag = true;
					}
				});
				if(kyKindFlag){
					tatol_need_time = Math.ceil(tatol_need_time*140/100/60);
				}else{
					tatol_need_time = Math.ceil(tatol_need_time*110/100/60);
				}
				tatol_score = Math.formatFloat(tatol_score);
				if($('.p_paper_cnt').length){
					$('.p_paper_cnt').attr('data-need-time', tatol_need_time);
					$('.p_paper_cnt').attr('data-tatol-score', tatol_score);
				}
				if($('.edit_homework .info_time').length){
					$('.edit_homework .info_time').attr('data-time', tatol_need_time).html(tatol_need_time);
				}
				if($('.edit_homework .info_score').length){
					$('.edit_homework .info_score').attr('data-score', tatol_score).html(tatol_score);
				}
				if($('.new_homework_cnt').length){
					$('.new_homework_cnt').attr('data-time', tatol_need_time);
					$('.new_homework_cnt').attr('data-score', tatol_score);
				}
				var dtests = new Object();
				if(isOrderByTest){
					var parts = new Array();
					var resTests = new Object();
					$.each(tests, function(i, obj){
						if($.inArray(obj['struct_part_id'], parts) == -1){
							parts.push(obj['struct_part_id']);
						}
						if(resTests[obj['struct_part_id']]){
							var hstatus = false;
							$.each(resTests[obj['struct_part_id']]['struct_info'], function(o, l){
								if(l['id'] == obj['struct_info'][0]['id']){
									var j = 0;
									$.each(l['tests'], function(k, m){
										j = k;
									});
									$.each(obj['struct_info'][0]['tests'], function(n, m){
										j = parseInt(j)+1;
										resTests[obj['struct_part_id']]['struct_info'][o]['tests'][j] = m;
									});
									hstatus = true;
								}
							});
							if(!hstatus){
								resTests[obj['struct_part_id']]['struct_info'].push(obj['struct_info'][0]);
							}
						}else{
							resTests[obj['struct_part_id']] = obj;
						}
					});
					$.each(resTests, function(i, obj){
						var dIndex = $.inArray(obj['struct_part_id'], parts);
						dtests[dIndex] = obj;
					});
				}else{
					$.each(tests, function(i, obj){
						if(dtests[obj['struct_order']]){
							var hstatus = false;
							$.each(dtests[obj['struct_order']]['struct_info'], function(o, l){
								if(l['id'] == obj['struct_info'][0]['id']){
									var j = 0;
									$.each(l['tests'], function(k, m){
										j = k;
									});
									$.each(obj['struct_info'][0]['tests'], function(n, m){
										j = parseInt(j)+1;
										dtests[obj['struct_order']]['struct_info'][o]['tests'][j] = m;
									});
									hstatus = true;
								}
							});
							if(!hstatus){
								dtests[obj['struct_order']]['struct_info'].push(obj['struct_info'][0]);
							}
						}else{
							dtests[obj['struct_order']] = obj;
						}
					});
				}
				return dtests;
			}
		},
		ctrlOpr : {
			setTestCtrl : function(testCtrls){
				if(!testCtrls){
					return;
				}
				var subtypes = new Array();
				$.each(testCtrls, function(i, objs){
					$.each(objs, function(j, obj){
						subtypes.push(obj['sub_type']);
					});
				});
				var tmpTestCtrls = new Object();
				var tmpTests = new Object();
				$('.test_content[data-kind!="3"]').each(function(i, obj){
					var datakind = $(this).attr('data-kind');
					var isindex = $(this).attr('data-index-order');
					var main_type = $(this).attr('data-type');
					var sub_type = $(this).attr('data-struct-subtype');
					if(tmpTests[main_type] == undefined){
						tmpTests[main_type] = new Object();
					}
					if(tmpTests[main_type][sub_type] == undefined){
						tmpTests[main_type][sub_type] = '';
					}
					if((isindex == 1 || isindex == undefined) && tmpTests[main_type][sub_type] != ''){
						if(datakind != 2){
							$(this).append($('#testCtrlTemp').template(tmpTests[main_type][sub_type]));
						}else{
							if(sub_type == 1510){
								$(this).append($('#testCtrlTemp').template(tmpTests[main_type][sub_type]));
							}else{
								$(this).append($('#testCtrlTemp').template(tmpTests[main_type][sub_type]));
							}
						}
					}else{
						if(testCtrls[main_type] != undefined && testCtrls[main_type][sub_type] != undefined){
							var block_order = 0;
							if($(this).closest('.sub_test_area').find('.test_content').length == 1){
								block_order = $(this).closest('.sub_test_area').attr('data-index');
								if(testCtrls[main_type][sub_type]['infos'][block_order] == undefined){
									block_order = 0;
								}
							}
							if(tmpTestCtrls[main_type] == undefined){
								tmpTestCtrls[main_type] = new Object();
							}
							if(tmpTestCtrls[main_type][sub_type] == undefined){
								tmpTestCtrls[main_type][sub_type] = true;
							}
							if(isindex == 1 || datakind != 2 || isindex == undefined 
									|| testCtrls[main_type][sub_type]['infos'].length > 1){
								tmpTests[main_type][sub_type] = testCtrls[main_type][sub_type]['infos'][block_order];
								$(this).append($('#testCtrlTemp').template(testCtrls[main_type][sub_type]['infos'][block_order]));
							}else{
								tmpTests[main_type][sub_type] = testCtrls[main_type][sub_type]['infos'][block_order];
								$(this).append($('#testCtrlTemp').template(testCtrls[main_type][sub_type]['infos'][block_order]));
							}
						}else if(testCtrls[main_type] != undefined && testCtrls[main_type][0] 
							&& (tmpTestCtrls[main_type] == undefined || tmpTestCtrls[main_type][0] == undefined)){
							var block_order = 0;
							if($(this).closest('.sub_test_area').find('.test_content').length == 1){
								block_order = $(this).closest('.sub_test_area').attr('data-index');
								if(testCtrls[main_type][0]['infos'][block_order] == undefined){
									block_order = 0;
								}
							}
							if(tmpTestCtrls[main_type] == undefined){
								tmpTestCtrls[main_type] = new Object();
							}
							if(tmpTestCtrls[main_type][0] == undefined){
								tmpTestCtrls[main_type][0] = true;
							}
							if(isindex == 1 || datakind != 2 || isindex == undefined 
									|| testCtrls[main_type][0]['infos'].length > 1){
								tmpTests[main_type][sub_type] = testCtrls[main_type][0]['infos'][block_order];
								$(this).append($('#testCtrlTemp').template(testCtrls[main_type][0]['infos'][block_order]));
							}else{
								tmpTests[main_type][sub_type] = testCtrls[main_type][0]['infos'][block_order];
								$(this).append($('#testCtrlTemp').template(testCtrls[main_type][0]['infos'][block_order]));
							}
						}else if(testCtrls[main_type] != undefined && testCtrls[main_type][main_type]
							&& (tmpTestCtrls[main_type] == undefined || tmpTestCtrls[main_type][main_type] == undefined)){
							var block_order = 0;
							if($(this).closest('.sub_test_area').find('.test_content').length == 1){
								block_order = $(this).closest('.sub_test_area').attr('data-index');
								if(testCtrls[main_type][main_type]['infos'][block_order] == undefined){
									block_order = 0;
								}
							}
							if(tmpTestCtrls[main_type] == undefined){
								tmpTestCtrls[main_type] = new Object();
							}
							if(tmpTestCtrls[main_type][main_type] == undefined){
								tmpTestCtrls[main_type][main_type] = true;
							}
							if(isindex == 1 || datakind != 2 || isindex == undefined 
									|| testCtrls[main_type][main_type]['infos'].length > 1){
								tmpTests[main_type][sub_type] = testCtrls[main_type][main_type]['infos'][block_order];
								$(this).append($('#testCtrlTemp').template(testCtrls[main_type][main_type]['infos'][block_order]));
							}else{
								tmpTests[main_type][sub_type] = testCtrls[main_type][main_type]['infos'][block_order];
								$(this).append($('#testCtrlTemp').template(testCtrls[main_type][main_type]['infos'][block_order]));
							}
						}else if(testCtrls[main_type] != undefined && $.inArray(sub_type, subtypes) == -1){
							var chosenType = 0;
							$.each(testCtrls[main_type], function(j, object){
								if(tmpTestCtrls[main_type] == undefined || tmpTestCtrls[main_type][object['sub_type']] == undefined){
									chosenType = object['sub_type'];
								}
							});
							if(tmpTestCtrls[main_type] == undefined){
								tmpTestCtrls[main_type] = new Object();
							}
							if(tmpTestCtrls[main_type][chosenType] == undefined){
								tmpTestCtrls[main_type][chosenType] = true;
							}
							var block_order = 0;
							if($(this).closest('.sub_test_area').find('.test_content').length == 1){
								block_order = $(this).closest('.sub_test_area').attr('data-index');
								if(testCtrls[main_type][chosenType]['infos'][block_order] == undefined){
									block_order = 0;
								}
							}
							if(testCtrls[main_type][chosenType]){
								tmpTests[main_type][sub_type] = testCtrls[main_type][chosenType]['infos'][block_order];
							}else{
								tmpTests[main_type][sub_type] = testCtrls[main_type][main_type]['infos'][block_order];
							}
							$(this).append($('#testCtrlTemp').template(tmpTests[main_type][sub_type]));
						}
					}
				});
				if($('.test_content[data-type=1400]').length > 0) {
					$('.p_answerSheet_cnt .p_answerSheet_details .p_answer_list').after('<div class="wait_record_info">"<span class="wait_record_icon"></span>"图标表示录音等待判分！</div>')
				}
			},
			execute_ctrl : function(that){
				$('.question_container .speak_sentence').removeClass('high_light_font');
				clearInterval(play_key);
				var sub_type = $(that).closest('.test_content').attr('data-subtype');
				var obj = $(that).closest('.test_content').find('.test_ctrl_area li.test_ctrl.enable:first');
				if(obj == undefined || obj.length == 0){
					$(that).closest('.test_content').find('.test_ctrl_area li.test_ctrl').addClass('enable');
					$('.test_ctrl_info_area').hide();
					$('.trans_test_ctrl_info_area').removeClass('recording');
					if(!is_primary){
						if(window.location.pathname != '/Competition/paper.html'){
							$(that).html('开始答题');
						}
					}else{
						$(that).removeClass('primary_btn_replay').addClass('primary_btn_play');
					}
					$(that).closest('.test_content').find('.btn_play').removeClass('enable');
					$(that).closest('.test_content').find('.btn_play').removeClass('start');
					if(sub_type == 1541){
						$(that).closest('.test_content').find('.question_container .question_content').html('');
					}
					return false;
				}
				var act_type = $(obj).attr('data-act-type');
				if(act_type == 0){
					var main_type = $(obj).closest('.test_content').attr('data-type');
					if(main_type == '7100'){
						var qs_index = $(obj).attr('data-qs-index');
						if(qs_index > 0){
							var qs_str = $(obj).closest('.test_content').find('.china_q:eq("'+(qs_index-1)+'")').html();
							if($(obj).closest('.test_content').find('.question_container .question_content .question_content_str').length){
								qs_str = '<div class="dib question_content_str_num">' + (qs_index) + '.</div>'
									+ '<div class="dib question_content_str_info">' + qs_str + '</div>';
								$(obj).closest('.test_content').find('.question_container .question_content .question_content_str').html(qs_str);
							}else{
								qs_str = '<div class="dib dib-wrap question_content_str">' 
									+ '<div class="dib question_content_str_num">' + (qs_index) + '.</div>'
									+ '<div class="dib question_content_str_info">' + qs_str + '</div>' + '</div>';
								$(obj).closest('.test_content').find('.question_container .question_content').append(qs_str);
							}
						}
					}
					$(that).closest('.test_content').find('.test_ctrl_area li.test_ctrl.enable:first').removeClass('enable');
					$('.test_ctrl_info_area .percentage_gray').show();
					$('.test_ctrl_info_area .waveform_container').hide();
					var total_time = parseInt($(obj).attr('data-wait-time'));
					var remainder_time = parseInt($(obj).attr('data-wait-time'));
					$('.test_ctrl_info_area .info_hint').html($(obj).attr('data-hint'));
					$('.test_ctrl_info_area .play_mp3_area .remainder_time_area').show();
					$('.test_ctrl_info_area .play_mp3_area .remainder_time').html(Math.ceil(remainder_time/1000));
					var index = $(obj).attr('data-qs-index');
					var qimg = $(obj).closest('.test_content').find('.imageSize');
					if(qimg != undefined && qimg.length > 0){
						$(qimg).each(function(){
							$(this).parent('.question_p').addClass('hide');
						});
						qimg.eq(index).parent('.question_p').removeClass('hide');
					}
					remainder_key = setInterval(function(){
						remainder_time = remainder_time - 100;
						$('.test_ctrl_info_area .play_mp3_area .percentage_bule').css('width', ((total_time - remainder_time)/total_time * 100)+'%');
						$('.test_ctrl_info_area .play_mp3_area .remainder_time').html(Math.ceil(remainder_time/1000));
						if(remainder_time < 0){
							clearInterval(remainder_key);
							practice.ctrlOpr.execute_ctrl(that);
						}
					}, 100);
				}else if(act_type == 1 || act_type == 6 || act_type == 7){
					if(sub_type == 1541){
						var item_order = $(obj).attr('data-order');
						var test_index = $(obj).attr('data-qs-index');
						if(item_order > 6){
							$(that).closest('.test_content').find('.question_container .question_content').html('');
							var q_str = $(obj).closest('.test_content').find('.question_division_line .question_li:eq('+test_index+') .speak_sentence.question').html();
							$(that).closest('.test_content').find('.question_container .question_content').html(q_str);
						}
					}
					$(that).closest('.test_content').find('.test_ctrl_area li.test_ctrl.enable:first').removeClass('enable');
					$('.test_ctrl_info_area .percentage_gray').show();
					$('.test_ctrl_info_area .waveform_container').hide();
					var mp3_type = $(obj).attr('data-mp3-type');
					$('.test_ctrl_info_area .info_hint').html($(obj).attr('data-hint'));
					$('.test_ctrl_info_area .play_mp3_area .remainder_time_area').hide();
					if(mp3_type == 0){
						var file_name = $(obj).attr('data-mp3-path');
						if(file_name != undefined && file_name != ''){
							practice.ctrlOpr.play_video(that, file_name);
						}else{
							practice.ctrlOpr.execute_ctrl(that);
						}
					}else if(mp3_type == 1){
						var file_name = $(obj).closest('.test_content').find('.p_Laudio').attr('data-mp3');
						if(file_name != undefined && file_name != ''){
							practice.ctrlOpr.play_video(that, file_name);
						}else{
							if(sub_type == 1121 || sub_type == 1122 || sub_type == 1123 || sub_type == 1124){
								practice.ctrlOpr.play_video_tppx(that, file_name);
							}else{
								practice.ctrlOpr.execute_ctrl(that);
							}
						}
					}else if(mp3_type > 1){
						var main_type = $(obj).closest('.test_content').attr('data-type');
						var sub_type = $(obj).closest('.test_content').attr('data-subtype');
						if(main_type == 7100 || sub_type == '1227' || sub_type == '1228'){
							var file_name = $(obj).closest('.test_content').find('.question_content .question_p.china:eq("' + (mp3_type-2) + '")').attr('data-mp3');
							if(file_name != undefined && file_name != ''){
								practice.ctrlOpr.play_video(that, file_name);
							}else{
								practice.ctrlOpr.execute_ctrl(that);
							}
						}else{
							var index = $(obj).attr('data-qs-index');
							var q_li = $(obj).closest('.test_content').find('.question_li:eq('+index+')').not('.question_li_1520');
							if(q_li == undefined || q_li.length == 0){
								practice.ctrlOpr.play_ky_video(obj, that);
							}else{
								practice.ctrlOpr.play_ky_li_video(obj, that, index);
							}
						}
					}
				}else if(act_type == 2){
					$(that).closest('.test_content').find('.test_ctrl_area li.test_ctrl.enable:first').removeClass('enable');
					$('.test_ctrl_info_area .percentage_gray').hide();
					$('.test_ctrl_info_area .waveform_container').show();
					var qid = $(that).closest('.test_content').find('.question_container .question_content[data-test-mold=6]').closest('.question_container').attr('data-qid');
					$('.p_answer_list ul li[data-index='+qid+']').addClass('done');
					if((($(that).closest('.test_content').attr('data-type') == 1400 
								&& $(that).closest('.test_content').find('.question_content .speak_sentence').length > 1) 
								|| $(that).closest('.test_content').attr('data-subtype') == 1441) 
							&& $(that).closest('.test_content').attr('data-subtype') != 1428){
						practice.ctrlOpr.ky_read_video(obj, that);
					}else{
						clearInterval(tape_remainder_key);
						if(TSP.audio.recorder.inited){
							TSP.audio.recorder.stop();
						}
						var remainder_time = parseInt($(obj).attr('data-wait-time'));
						var info_hint = $(obj).attr('data-hint');
						$('.test_ctrl_info_area .play_mp3_area .remainder_time_area').hide();
						$('.test_ctrl_info_area .info_hint').html('初始化录音');
						practice.waveForm.initWaveForm();
						var tid = $(that).closest('.test_content').attr('data-id');
						if(videoResult[tid] == undefined || videoResult[tid] == null){
							videoResult[tid] = new Object();
							if ((!!window.ActiveXObject || "ActiveXObject" in window) || userAgent.indexOf("Edge") > -1) {
								$("#AsrRecorder")[0].arrayEmpty(tid);
							}
						}
						var time_flag = (new Date()).getTime();
						videoResult[tid][time_flag] = new Object();
						$(obj).attr('data-time-flag', time_flag);
						var qs_index = $(obj).attr('data-qs-index');
						var main_type = $(that).closest('.test_content').attr('data-type');
						var sub_type = $(that).closest('.test_content').attr('data-subtype');
						if(main_type == '7100'){
							if(qs_index == 0){
								$('.test_content[data-id="'+tid+'"]').find('.left_area:eq(0)').html('<span class="wait_video_css">正在录音，请稍候！</span>');
							}else{
								$('.test_content[data-id="'+tid+'"]').find('.left_area:eq(1)').html('<span class="wait_video_css">正在录音，请稍候！</span>');
							}
						}else if(main_type == 6100){
							$('.test_ctrl_info_area .info_hint').text('录音中...');
						}else{
							$('.test_content[data-id="'+tid+'"]').find('.left_area').html('<span class="wait_video_css">正在录音，请稍候！</span>');
						}
						if($(that).closest('.test_content').attr('data-type') == 6100){
							var sen_content = $(that).closest('.test_content').find('.lccj_sentence_cnt').text();
							TSP.audio.recorder.start(tid, 2, sen_content, time_flag, remainder_time);
						}else{
							if($(that).closest('.test_content').attr('data-type') == 1500 
									|| $(that).closest('.test_content').attr('data-type') == 7100){
								TSP.audio.recorder.start(tid, 3, tid + '#' + qs_index, time_flag, remainder_time);
							}else if($(that).closest('.test_content').attr('data-type') == 7200){
								var word_text = $(that).closest('.test_content').find('.word_text .speak_sentence').attr('data-text');
								TSP.audio.recorder.start(tid, 2, word_text, time_flag, remainder_time);
							}else{
								TSP.audio.recorder.start(tid, 3, tid, time_flag, remainder_time);
							}
						}
						tape_remainder_key = setInterval(function(){
							if(!TSP.audio.recorder.recording){
								return;
							}
							$('.test_ctrl_info_area .play_mp3_area .remainder_time_area').show();
							$('.test_ctrl_info_area .info_hint').html(info_hint);
							remainder_time = remainder_time - 100;
							$('.test_ctrl_info_area .play_mp3_area .remainder_time').html(Math.ceil(remainder_time/1000));
							if(remainder_time < 0){
								clearInterval(tape_remainder_key);
								if(TSP.audio.recorder.inited){
									TSP.audio.recorder.stop();
								}
								videoResult[tid][time_flag]['end_time'] = (new Date()).getTime();
								if(main_type == '7100'){
									var qs_index = $(obj).attr('data-qs-index');
									if(qs_index == 0){
										$('.test_content[data-id="'+tid+'"]').find('.left_area:eq(0)').html('<span class="wait_video_css pf">正在判分，请稍候！</span>');
									}else{
										$('.test_content[data-id="'+tid+'"]').find('.left_area:eq(1)').html('<span class="wait_video_css pf">正在判分，请稍候！</span>');
									}
								}else if(main_type == 6100){
									if($('.test_content[data-id="'+tid+'"]').find('.sentence_show .lccj_speak_sen_score').length == 0){
										$('.test_content[data-id="'+tid+'"]').find('.sentence_show').append('<span class="lccj_speak_sen_score sentence_behind_space"></span>');
									}
									if(judge_speaking){
										$('.test_content[data-id="'+tid+'"]').find('.sentence_show .sentence_behind_space').addClass('wait_background').text('');
									}else{
										$('.test_content[data-id="'+tid+'"]').find('.sentence_show .sentence_behind_space').addClass('hidden_speaking_result').text('');
									}
								}else{
									$('.test_content[data-id="'+tid+'"]').find('.left_area').html('<span class="wait_video_css pf">正在判分，请稍候！</span>');
								}
								practice.ctrlOpr.execute_ctrl(that);
							}
						}, 100);
					}
				}else if(act_type == 3){
					if($(that).closest('.test_content').find('.question_content .speak_sentence.enable:first') == undefined 
							|| $(that).closest('.test_content').find('.question_content .speak_sentence.enable:first').length == 0){
						$(that).closest('.test_content').find('.test_ctrl_area li.test_ctrl.enable:first').removeClass('enable');
						clearInterval(play_key);
						$(that).closest('.test_content').find('.question_content .speak_sentence').each(function(i, object){
							$(this).addClass('enable');
						});
						practice.ctrlOpr.execute_ctrl(that);
						return false;
					}
					practice.ctrlOpr.play_ky_gd_video(obj, that);
				}else if(act_type == 4){
					$(that).closest('.test_content').find('.test_ctrl_area li.test_ctrl.enable:first').removeClass('enable');
					$('.test_ctrl_info_area .percentage_gray').show();
					$('.test_ctrl_info_area .waveform_container').hide();
					var mp3_type = $(obj).attr('data-mp3-type');
					$('.test_ctrl_info_area .info_hint').html($(obj).attr('data-hint'));
					$('.test_ctrl_info_area .play_mp3_area .remainder_time_area').hide();					
					if(mp3_type == 10){
						var firstsen = $(that).closest('.test_content').find('.speak_sentence.enable:first');
						if(firstsen != undefined && firstsen.length > 0){
							var file_name = firstsen.attr('data-mp3');
							var start_time = parseInt(firstsen.attr('data-starttime'));
							var end_time = parseInt(firstsen.attr('data-endtime'));
							firstsen.removeClass('enable');
							TSP.audio.player.load(file_name);
							if(start_time == undefined || start_time === ''){
								start_time = TSP.audio.player.audioElem.getCurrentTime() * 1000;
							}
							if(end_time == undefined || end_time == '' || end_time == 1){
								end_time = TSP.audio.player.audioElem.duration * 1000;
							}
							TSP.audio.player.audioElem.setCurrentTime(start_time/1000.0);
							TSP.audio.player.play();
							var total_time = end_time/1000.0 - start_time/1000.0;
							var flag = false;
							play_key = setInterval(function(){
								var remainder_time = TSP.audio.player.audioElem.getCurrentTime() - start_time/1000.0;
								$('.test_ctrl_info_area .play_mp3_area .percentage_bule').css('width', (remainder_time/total_time * 100)+'%');
								if(total_time - remainder_time <= 0){
									clearInterval(tape_remainder_key);
									TSP.audio.player.stop();
									practice.ctrlOpr.execute_ctrl(that);
								}
							}, 4);
						}
					}
				}
			},
			play_video : function(that, file_name){
				TSP.audio.player.load(file_name);
				TSP.audio.player.play();
				var total_time = TSP.audio.player.audioElem.duration;
				play_key = setInterval(function(){
					var remainder_time = TSP.audio.player.audioElem.getCurrentTime();
					$('.test_ctrl_info_area .play_mp3_area .percentage_bule').css('width', (remainder_time/total_time * 100)+'%');
					if(total_time - remainder_time <= 0){
						clearInterval(play_key);
					}
				}, 100);
				TSP.audio.files.getAudio(file_name).onended = function(){
					clearInterval(play_key);
					practice.ctrlOpr.execute_ctrl(that);
				};
			},
			play_video_tppx : function(that){
				$(that).closest('.test_content').find('.images_sort_cnt .images_sort_option_cnt').removeClass('current_sort_option');
				$(that).closest('.test_content').find('.images_sort_cnt .images_sort_option_cnt .option_flag').removeClass('current_flag');
				var cur_cnt = $(that).closest('.test_content').find('.images_sort_cnt .images_sort_option_cnt.enable:first');
				if(cur_cnt.length == 0){
					$('.test_ctrl_info_area').hide();
					return;
				}
				cur_cnt.find('.option_flag').addClass('current_flag').effect('pulsate', {times: 3}, 1000);
				cur_cnt.addClass('current_sort_option');
				var obj_index = cur_cnt.attr('data-as-index');
				var obj = $(that).closest('.test_content').find('.listen_sa .speak_sentence:eq(' + (obj_index - 1) + ')');
				cur_cnt.removeClass('enable');
				var file_name = obj.attr('data-mp3');
				var start_time = parseFloat(obj.attr('data-starttime')) / 1000.0;
				var end_time = parseFloat(obj.attr('data-endtime')) / 1000.0;
				TSP.audio.player.load(file_name);
				TSP.audio.player.audioElem.setCurrentTime(start_time);
				var total_time = (end_time - start_time).toFixed(3);
				TSP.audio.player.play();
				$('.test_ctrl_info_area .info_hint').text('播放音频');
				play_key = setInterval(function(){
					var remainder_time = TSP.audio.player.audioElem.getCurrentTime();
					var procee_time = remainder_time - start_time;
					$('.test_ctrl_info_area .play_mp3_area .percentage_bule').css('width', (procee_time/total_time * 100)+'%');
					if(remainder_time >= end_time){
						clearInterval(play_key);
						TSP.audio.player.stop();
						var pause_time = 15000; 
						var cur_time = 0;
						$('.test_ctrl_info_area .info_hint').text('你还有 '+ (pause_time / 1000) +' 秒钟可以选择');
						pause_play_key = setInterval(function(){
							$('.test_ctrl_info_area .play_mp3_area .percentage_bule').css('width', (cur_time/pause_time * 100)+'%');
							cur_time += 100;
							if(cur_time % 1000 == 0){
								var pause_remain = Math.floor((pause_time - cur_time) / 1000);
								$('.test_ctrl_info_area .info_hint').text('你还有 ' + pause_remain + ' 秒钟可以选择');
							}
							if(cur_time - pause_time >= 0){
								clearInterval(pause_play_key);
								practice.ctrlOpr.play_video_tppx(that);
							}
						}, 100);
					}
				}, 10);
				TSP.audio.files.getAudio(file_name).onended = function(){
					clearInterval(play_key);
					clearInterval(pause_play_key);
					TSP.audio.player.stop();
					var pause_time = 15000; 
					var cur_time = 0;
					$('.test_ctrl_info_area .info_hint').text('你还有 '+ (pause_time / 1000) +' 秒钟可以选择');
					pause_play_key = setInterval(function(){
						$('.test_ctrl_info_area .play_mp3_area .percentage_bule').css('width', (cur_time/pause_time * 100)+'%');
						cur_time += 100;
						if(cur_time % 1000 == 0){
							var pause_remain = Math.floor((pause_time - cur_time) / 1000);
							$('.test_ctrl_info_area .info_hint').text('你还有 ' + pause_remain + ' 秒钟可以选择');
						}
						if(cur_time - pause_time >= 0){
							clearInterval(pause_play_key);
							practice.ctrlOpr.play_video_tppx(that);
						}
					}, 100);
				};
			},
			play_ky_video : function(obj, that){
				var v_obj = $(obj).closest('.test_content').find('.speak_sentence.enable:first').not('.question_li_1520').not('.answer');
				if(v_obj == undefined || v_obj.length == 0){
					clearInterval(play_key);
					setTimeout(function(){
						$(that).closest('.test_content').find('.speak_sentence').removeClass('enable').addClass('enable');
						practice.ctrlOpr.execute_ctrl(that);
					}, 200);
					return false;
				}
				var file_name = $(v_obj).attr('data-mp3');
				var start_time = parseInt($(v_obj).attr('data-starttime'));
				var end_time = parseInt($(v_obj).attr('data-endtime'));
				$(v_obj).removeClass('enable');
				TSP.audio.player.load(file_name);
				if(start_time == undefined || start_time === ''){
					start_time = TSP.audio.player.audioElem.getCurrentTime() * 1000;
				}
				if(end_time == undefined || end_time == ''){
					end_time = TSP.audio.player.audioElem.duration * 1000;
				}
				TSP.audio.player.audioElem.setCurrentTime(start_time/1000.0);
				var suffix = file_name.substring(file_name.length - 4,file_name.length);
				if(suffix == '.ogg' || suffix == '.mp4'){
				}
				TSP.audio.player.play();
				var total_time = end_time/1000.0 - start_time/1000.0;
				var flag = false;
				play_key = setInterval(function(){
					var remainder_time = TSP.audio.player.audioElem.getCurrentTime() - start_time/1000.0;
					$('.test_ctrl_info_area .play_mp3_area .percentage_bule').css('width', (remainder_time/total_time * 100)+'%');
					if(total_time - remainder_time <= 0){
						clearInterval(play_key);
						if(!flag){
							practice.ctrlOpr.play_ky_video(obj, that);
							flag = true;
						}
					}
				}, 4);
				TSP.audio.files.getAudio(file_name).onended = function(){
					clearInterval(play_key);
					if(!flag){
						practice.ctrlOpr.play_ky_video(obj, that);
						flag = true;
					}
				};
			},
			ky_read_video : function(obj, that){
				var v_obj = $(that).closest('.test_content').find('.question_container .speak_sentence.enable:first');
				if(v_obj == undefined || v_obj.length == 0){
					clearInterval(play_key);
					clearInterval(tape_remainder_key);
					if(TSP.audio.recorder.inited){
						TSP.audio.recorder.stop();
					}
					$(v_obj).closest('.test_content').find('.question_container .speak_sentence').removeClass('high_light_font');
					setTimeout(function(){
						practice.ctrlOpr.execute_ctrl(that);
					}, 200);
					return false;
				}
				$(v_obj).next('.sentence_behind_space').remove();
				$(v_obj).after('<span class="sentence_behind_space"></span>');
				$(v_obj).closest('.test_content').find('.question_container .speak_sentence').removeClass('high_light_font');
				var file_name = $(v_obj).attr('data-mp3');
				var start_time = parseInt($(v_obj).attr('data-starttime'));
				var end_time = parseInt($(v_obj).attr('data-endtime'));
				$(v_obj).removeClass('enable');
				TSP.audio.player.load(file_name);
				if(start_time == undefined || start_time === ''){
					start_time = TSP.audio.player.audioElem.getCurrentTime() * 1000;
				}
				if(end_time == undefined || end_time == '' || end_time == 1){
					end_time = TSP.audio.player.audioElem.duration * 1000;
				}
				TSP.audio.player.audioElem.setCurrentTime(start_time/1000.0);
				var total_time = (end_time - start_time)/1000.0;
				$('.test_ctrl_info_area .percentage_gray').hide();
				$('.test_ctrl_info_area .waveform_container').show();
				var remainder_time = practice.util.getRecordFunction(total_time) * 1000;
				$('.test_ctrl_info_area .play_mp3_area .remainder_time_area').hide();
				$('.test_ctrl_info_area .info_hint').html('初始化录音');
				practice.waveForm.initWaveForm();
				var tid = $(that).closest('.test_content').attr('data-id');
				if(videoResult[tid] == undefined || videoResult[tid] == null){
					videoResult[tid] = new Object();
					if ((!!window.ActiveXObject || "ActiveXObject" in window) || userAgent.indexOf("Edge") > -1) { 
						$("#AsrRecorder")[0].arrayEmpty(tid);
					}
				}
				var time_flag = (new Date()).getTime();
				videoResult[tid][time_flag] = new Object();
				TSP.audio.recorder.start(tid, 2, $(v_obj).attr('data-text'), time_flag, remainder_time);
				tape_remainder_key = setInterval(function(){
					if(!TSP.audio.recorder.recording){
						return;
					}
					$(v_obj).removeClass('high_light_font').addClass('high_light_font');
					$('.test_ctrl_info_area .play_mp3_area .remainder_time_area').show();
					$('.test_ctrl_info_area .info_hint').html('录音');
					remainder_time = remainder_time - 100;
					$('.test_ctrl_info_area .play_mp3_area .remainder_time').html(Math.ceil(remainder_time/1000));
					if(remainder_time < 0){
						clearInterval(tape_remainder_key);
						if(TSP.audio.recorder.inited){
							TSP.audio.recorder.stop();
						}
						videoResult[tid][time_flag]['end_time'] = (new Date()).getTime();
						if(judge_speaking){
							$(v_obj).next('.sentence_behind_space').addClass('wait_background').text('');
						}else{
							$(v_obj).next('.sentence_behind_space').addClass('hidden_speaking_result').text('');
						}
						setTimeout(function(){
							practice.ctrlOpr.ky_read_video(obj, that);
						}, 200);
					}
				}, 100);
			},
			play_ky_gd_video : function(obj, that){
				if(TSP.audio.recorder.inited){
					TSP.audio.recorder.stop();
				}
				$(that).closest('.test_content').find('.speak_sentence').removeClass('high_light_font');
				var v_obj = $(that).closest('.test_content').find('.question_container .speak_sentence.enable:first');
				if(v_obj == undefined || v_obj.length == 0){
					clearInterval(play_key);
					setTimeout(function(){
						practice.ctrlOpr.execute_ctrl(that);
					}, 200);
					return false;
				}
				$(v_obj).closest('.test_content').find('.speak_sentence').removeClass('high_light_font');
				$('.test_ctrl_info_area .percentage_gray').show();
				$('.test_ctrl_info_area .waveform_container').hide();
				$('.test_ctrl_info_area .info_hint').html($(obj).attr('data-hint'));
				$('.test_ctrl_info_area .play_mp3_area .remainder_time_area').hide();
				var file_name = $(v_obj).attr('data-mp3');
				var start_time = parseInt($(v_obj).attr('data-starttime'));
				var end_time = parseInt($(v_obj).attr('data-endtime'));
				$(v_obj).removeClass('enable');
				TSP.audio.player.load(file_name);
				if(start_time == undefined || start_time === ''){
					start_time = TSP.audio.player.audioElem.getCurrentTime() * 1000;
				}
				if(end_time == undefined || end_time == '' || end_time == 1){
					end_time = TSP.audio.player.audioElem.duration * 1000;
				}
				TSP.audio.player.audioElem.setCurrentTime(start_time/1000.0);
				TSP.audio.player.play();
				var total_time = (end_time - start_time)/1000.0;
				var flag = false;
				play_key = setInterval(function(){
					var remainder_time = TSP.audio.player.audioElem.getCurrentTime() - start_time/1000.0;
					$('.test_ctrl_info_area .play_mp3_area .percentage_bule').css('width', (remainder_time/total_time * 100)+'%');
					if(total_time - remainder_time <= 0){
						clearInterval(play_key);
						TSP.audio.player.stop();
						if(!flag){
							practice.ctrlOpr.tape_video(obj, that, total_time, v_obj);
							flag = true;
						}
					}
				}, 4);
				TSP.audio.files.getAudio(file_name).onended = function(){
					clearInterval(play_key);
					TSP.audio.player.stop();
					if(!flag){
						practice.ctrlOpr.tape_video(obj, that, total_time, v_obj);
						flag = true;
					}
				};
			},
			tape_video : function(obj, that, total_time, v_obj){
				$('.test_ctrl_info_area .percentage_gray').hide();
				$('.test_ctrl_info_area .waveform_container').show();
				var remainder_time = practice.util.getRecordFunction(total_time) * 1000;
				var info_hint = $(obj).attr('data-hint');
				$('.test_ctrl_info_area .play_mp3_area .remainder_time_area').hide();
				$('.test_ctrl_info_area .info_hint').html('初始化录音');
				practice.waveForm.initWaveForm();
				var tid = $(that).closest('.test_content').attr('data-id');
				if(videoResult[tid] == undefined || videoResult[tid] == null){
					videoResult[tid] = new Object();
					if ((!!window.ActiveXObject || "ActiveXObject" in window) || userAgent.indexOf("Edge") > -1) { 
						$("#AsrRecorder")[0].arrayEmpty(tid);
					}
				}
				var time_flag = (new Date()).getTime();
				videoResult[tid][time_flag] = new Object();
				$(v_obj).attr('data-time-flag', time_flag);
				TSP.audio.recorder.start(tid, 2, $(v_obj).attr('data-text'), time_flag, remainder_time);
				tape_remainder_key = setInterval(function(){
					if(!TSP.audio.recorder.recording){
						return;
					}
					$(v_obj).removeClass('high_light_font').addClass('high_light_font');
					$('.test_ctrl_info_area .info_hint').html(info_hint);
					$('.test_ctrl_info_area .play_mp3_area .remainder_time_area').show();
					remainder_time = remainder_time - 100;
					$('.test_ctrl_info_area .play_mp3_area .remainder_time').html(Math.ceil(remainder_time/1000));
					if(remainder_time < 0){
						clearInterval(tape_remainder_key);
						if(TSP.audio.recorder.inited){
							TSP.audio.recorder.stop();
						}
						practice.ctrlOpr.play_ky_gd_video(obj, that);
					}
				}, 100);
			},
			play_ky_li_video : function(obj, that, index){
				var main_type = $(obj).closest('.test_content').attr('data-type');
				var sub_type = $(obj).closest('.test_content').attr('data-subtype');
				if(main_type == 1500 && sub_type != 1509 && sub_type != 1510 && sub_type != 1512 && sub_type != 1514 && sub_type != 1516
						&& sub_type != 1520 && sub_type != 1522 && sub_type != 1523 && sub_type != 1524 && sub_type != 1526 && sub_type != 1527 
						&& sub_type != 1528 && sub_type != 1529 && sub_type != 1530 && sub_type != 1537 && sub_type != 1539 && sub_type != 1540){
					var question_str = $(obj).closest('.test_content').find('.question_division_line .question_li:eq('+index+')').not('.question_li_1520').find('.speak_sentence.question').html();
					$(obj).closest('.test_content').find('.question_container .question_content').html(question_str);
				}
				TSP.audio.player.stop();
				var v_obj = $(obj).closest('.test_content').find('.question_li:eq('+index+')').not('.question_li_1520').find('.speak_sentence.question.enable:first');
				if(v_obj == undefined || v_obj.length == 0){
					clearInterval(play_key);
					setTimeout(function(){
						$(that).closest('.test_content').find('.question_li:eq('+index+')').not('.question_li_1520').find('.speak_sentence.question').removeClass('enable').addClass('enable');
						practice.ctrlOpr.execute_ctrl(that);
					}, 200);
					return false;
				}
				var file_name = $(v_obj).attr('data-mp3');
				var start_time = parseInt($(v_obj).attr('data-starttime'));
				var end_time = parseInt($(v_obj).attr('data-endtime'));
				$(v_obj).removeClass('enable');
				TSP.audio.player.load(file_name);
				if(start_time == undefined || start_time === ''){
					start_time = TSP.audio.player.audioElem.getCurrentTime() * 1000;
				}
				if(end_time == undefined || end_time == '' || end_time == 1 
						|| $(obj).closest('.test_content').attr('data-subtype') == '1508'){
					end_time = TSP.audio.player.audioElem.duration * 1000;
				}
				TSP.audio.player.audioElem.setCurrentTime(start_time/1000.0);
				var suffix = file_name.substring(file_name.length - 4,file_name.length);
				if(suffix == '.ogg' || suffix == '.mp4'){
					var video =$(obj).closest('.test_content').find('.videoinfo').attr('data-ogg');
					var vplayer = VideoJS(video);
					vplayer.width(620);
					vplayer.height(250);
					vplayer.play();
					vplayer.volume(0);
				}
				TSP.audio.player.play();
				var total_time = end_time/1000.0 - start_time/1000.0;
				var flag = false;
				play_key = setInterval(function(){
					var remainder_time = TSP.audio.player.audioElem.getCurrentTime() - start_time/1000.0;
					$('.test_ctrl_info_area .play_mp3_area .percentage_bule').css('width', (remainder_time/total_time * 100)+'%');
					if(total_time - remainder_time <= 0){
						clearInterval(play_key);
						if(!flag){
							practice.ctrlOpr.play_ky_li_video(obj, that, index);
							flag = true;
						}
					}
				}, 4);
				TSP.audio.files.getAudio(file_name).onended = function(){
					clearInterval(play_key);
					if(!flag){
						practice.ctrlOpr.play_ky_li_video(obj, that, index);
						flag = true;
					}
				};
			},
			play_audio_tppx : function(that){
				var audio_arr = [];
				var total_time = 0;
				$(that).closest('.test_content').find('.images_sort_cnt .images_sort_option_cnt').each(function(i, n){
					var cur_index = $(n).attr('data-as-index');
					var obj = $(that).closest('.test_content').find('.listen_sa .speak_sentence:eq('+ (cur_index - 1) +')');
					audio_arr[i] = {};
					audio_arr[i].file_name = obj.attr('data-mp3');
					audio_arr[i].start_time = parseFloat(obj.attr('data-starttime')) / 1000.0;
					audio_arr[i].end_time = parseFloat(obj.attr('data-endtime')) / 1000.0;
					total_time += (audio_arr[i].end_time - audio_arr[i].start_time);
				});
				$('.test_ctrl_info_area .info_hint').show().text('播放原音');
				var time_played = 0;
				var play_img_sen = function(i){
					if(i >= audio_arr.length){
						$('.test_ctrl_info_area').hide();
						clearInterval(play_key);
						TSP.audio.player.stop();
						$('body').attr('data-play-test-id', '');
						return;
					}
					TSP.audio.player.stop();
					TSP.audio.player.load(audio_arr[i].file_name);
					TSP.audio.player.audioElem.setCurrentTime(audio_arr[i].start_time);
					TSP.audio.player.play();
					play_key = setInterval(function(){
						var current_time = TSP.audio.player.audioElem.getCurrentTime();
						var process_time = current_time - audio_arr[i].start_time;
						$('.test_ctrl_info_area .play_mp3_area .percentage_bule').css('width', ((time_played + process_time) / total_time * 100)+'%');
						$('.test_ctrl_info_area .remainder_time_area').show();
						$('.test_ctrl_info_area .play_mp3_area .remainder_time').text(parseInt(total_time - time_played - process_time));
						if(current_time >= audio_arr[i].end_time){
							time_played += process_time;
							clearInterval(play_key);
							TSP.audio.player.stop();
							i++;
							play_img_sen(i);
						}
						TSP.audio.player.audioElem.onended = function(){
							time_played += process_time;
							clearInterval(play_key);
							TSP.audio.player.stop();
							i++;
							play_img_sen(i);
						}
					}, 10);
				}
				play_img_sen(0);
			},
			play_audio : function(that, file_name, ctrl_name){
				TSP.audio.player.stop();
				TSP.audio.player.load(file_name);
				TSP.audio.player.play();
				var total_time = TSP.audio.player.audioElem.duration;
				$('.test_ctrl_info_area').show();
				$('.test_ctrl_info_area .percentage_gray').show();
				$('.test_ctrl_info_area .waveform_container').hide();
				$('.test_ctrl_info_area .info_hint').show().html(ctrl_name);
				$('.test_ctrl_info_area .play_mp3_area .remainder_time_area').hide();
				play_key = setInterval(function(){
					var remainder_time = TSP.audio.player.audioElem.getCurrentTime();
					$('.test_ctrl_info_area .play_mp3_area .percentage_bule').css('width', (remainder_time/total_time * 100)+'%');
					if(total_time - remainder_time <= 0){
						$('.test_ctrl_info_area').hide();
						$('.trans_test_ctrl_info_area').removeClass('recording');
						clearInterval(play_key);
						$('body').attr('data-play-test-id', '');
						if(that != null){
							if(!is_primary){
								$(that).html(ctrl_name);
							}
						}
					}
				}, 100);
				TSP.audio.files.getAudio(file_name).onended = function(){
					$('.test_ctrl_info_area').hide();
					$('.trans_test_ctrl_info_area').removeClass('recording');
					clearInterval(play_key);
					$('body').attr('data-play-test-id', '');
					if(that != null){
						if(!is_primary){
							$(that).html(ctrl_name);
						}
					}
				};
			},
			play_user_repeat_video : function(fileNames, index){
				if(fileNames.length && fileNames.length >= index + 1){
					TSP.audio.player.stop();
					var file_name = window.URL.createObjectURL(fileNames[index]);
					TSP.audio.player.audioElem = document.createElement('audio');
					TSP.audio.player.audioElem.src = file_name;
					TSP.audio.player.audioElem.getCurrentTime = function(){
						if ((!!window.ActiveXObject || "ActiveXObject" in window) || userAgent.indexOf("Edge") > -1) {
							return $("#AsrRecorder")[0].getCurrentTime() / 1000;
						}else{
							return this.currentTime;
						}
					}
					TSP.audio.player.play();
					$('.test_ctrl_info_area').show();
					$('.test_ctrl_info_area .percentage_gray').show();
					$('.test_ctrl_info_area .waveform_container').hide();
					$('.test_ctrl_info_area .info_hint').html('播放录音');
					$('.test_ctrl_info_area .play_mp3_area .remainder_time_area').hide();
					play_key = setInterval(function(){
						var total_time = TSP.audio.player.audioElem.duration;
						var remainder_time = TSP.audio.player.audioElem.getCurrentTime();
						$('.test_ctrl_info_area .play_mp3_area .percentage_bule').css('width', (remainder_time/total_time * 100)+'%');
						if(total_time - remainder_time <= 0){
							$('.test_ctrl_info_area').hide();
							$('.trans_test_ctrl_info_area').removeClass('recording');
							clearInterval(play_key);
						}
					}, 100);
					TSP.audio.player.audioElem.onended = function(){
						$('.test_ctrl_info_area').hide();
						$('.trans_test_ctrl_info_area').removeClass('recording');
						clearInterval(play_key);
						index++;
						practice.ctrlOpr.play_user_repeat_video(fileNames, index);
					};
				}
				$('body').attr('data-play-test-id', '');
			},
			play_user_video : function(file_name, ctrl_name, video_time){
				TSP.audio.player.stop();
				file_name = window.URL.createObjectURL(file_name);
				TSP.audio.player.audioElem = document.createElement('audio');
				TSP.audio.player.audioElem.src = file_name;
				TSP.audio.player.audioElem.getCurrentTime = function(){
					if ((!!window.ActiveXObject || "ActiveXObject" in window) || userAgent.indexOf("Edge") > -1) {
						return $("#AsrRecorder")[0].getCurrentTime() / 1000;
					}else{
						return this.currentTime;
					}
				}
				TSP.audio.player.play();
				$('.test_ctrl_info_area').show();
				$('.test_ctrl_info_area .percentage_gray').show();
				$('.test_ctrl_info_area .waveform_container').hide();
				$('.test_ctrl_info_area .info_hint').html(ctrl_name);
				$('.test_ctrl_info_area .play_mp3_area .remainder_time_area').hide();
				play_key = setInterval(function(){
					var total_time = TSP.audio.player.audioElem.duration;
					var remainder_time = TSP.audio.player.audioElem.getCurrentTime();
					$('.test_ctrl_info_area .play_mp3_area .percentage_bule').css('width', (remainder_time/total_time * 100)+'%');
					if(total_time - remainder_time <= 0){
						$('.test_ctrl_info_area').hide();
						$('.trans_test_ctrl_info_area').removeClass('recording');
						clearInterval(play_key);
					}
				}, 100);
				TSP.audio.player.audioElem.onended = function(){
					$('.test_ctrl_info_area').hide();
					$('.trans_test_ctrl_info_area').removeClass('recording');
					clearInterval(play_key);
				};
			}
		},
		waveForm : {
			initWaveForm : function(){
				if ((!!window.ActiveXObject || "ActiveXObject" in window) || userAgent.indexOf("Edge") > -1) {
					if(!$("#AsrRecorder")[0].sendToActionScript){
						ResourceLoadingMessageBox('close');
						$('body').css({
							'overflow' : 'hidden',
							'height' : '60px'
						});
						$('.full_screen#AsrRecorder').css({
							'top' : '60px'
						});
						var html = '<div style="background:#fff"><div class="flash_disabled_hint">如果出现本提示，说明Edge浏览器默认阻止 了Flash内容，请点击下方区域，并选择“始终允许”，以启用Flash录音功能。</div></div>';
						$('body').prepend(html);
						$('.flash_disabled_hint').css({
							'color' : 'red',
							'font-size' : '24px',
							'text-align' : 'center',
							'width' : '840px',
							'margin' : '0 auto',
							'font-family' : 'Hiragino Sans GB,Lantinghei SC,Microsoft Yahei,SimSun'
						});
						return;
					}
					$("#AsrRecorder")[0].sendToActionScript(TinSoConfig.asr);
				}else{
					$("#AsrRecorder").hide();
					var TSPspos = navigator.userAgent.search('Chrome');
					if(TSPspos != -1 && navigator.userAgent.substr(TSPspos) > 'Chrome/66'){
						var TSPRecWaveHandle = setInterval(function(){
							if(!!window.TSPAudioContext.TSP){
								clearInterval(TSPRecWaveHandle);
								if(!RecWave.inited){
									var options = {
										container : document.getElementById('waveform_container'),
										interval : 1,				
										zoom : 1					
									}
									RecWave.record(options);
								}
							}
						}, 500);
					}else{
						if(!RecWave.inited){
							var options = {
								container : document.getElementById('waveform_container'),
								interval : 1,				
								zoom : 1					
							}
							RecWave.record(options);
						}
					}
				}
			}
		},
		util : {
			getKindName : function(kind){
				if(kind == 1){
					return '听力';
				}else if(kind == 2){
					return '口语';
				}else if(kind == 3){
					return '笔试';
				}else{
					return '未知';
				}
			},
			getRecordFunction : function(time){
				var result = 0.0;
				if (time <= 1) {
					result = 2;
				}else if (time > 1 && time <= 2) {
					result = 2 * time;
				}else if (time > 2 && time <= 3) {
					result = 1.5 * time;
				}else if (time > 3) {
					result = time + 2;
				}
				return result + 2;
			}
		}
	};
}());
$(function(){
	$('body').onEvent({
		'click':{
			'#test-mode:not(:disabled)' : function(e){
				e.preventDefault();
				var mode = $(this).attr('data-mode');
				if(mode == 'free' || mode == 'exam'){
					var mode_str = mode == 'free' ? '考试' : '自由';
					var mode_replace = mode == 'free' ? 'exam' : 'free';
					MessageBox({
						content : '是否确定切换成'+ mode_str +'模式？',
						buttons : [{
					    	text : '确定',
					    	click : function(){
								$( this ).dialog('close');
								$(e.target).removeAttr('checked');
								TSP.practice.process.saveAnswer(function(){
									window.onbeforeunload = undefined;
									window.location.href = window.location.href.replace(/mode\=\w+/g, 'mode=' + mode_replace);
								});
							}
						}, {
							text : '取消',
							click : function(){
								$(this).dialog('close');
							}
						}]
					});
				}
			},
			'.btn_show_cnt' : function(){
				$('.test_content .question_content.blue_font').removeClass('blue_font').addClass('white_font');
				if($(this).closest('.test_content').find('.question_content').hasClass('blue_font')
						|| $(this).closest('.test_content').find('.question_content').hasClass('white_font')){
					$(this).closest('.test_content').find('.question_content').removeClass('white_font').removeClass('blue_font');
					$(this).html('隐藏原文');
				}else{
					$(this).closest('.test_content').find('.question_content').removeClass('white_font').addClass('blue_font');
					$(this).html('显示原文');
				}
			},
			'.btn_pause' : function(){
				var tid = $('body').attr('data-play-test-id');
				var btn_tid = $(this).closest('.test_content').attr('data-id');
				if(btn_tid != tid){
					return false;
				}
				var status = $(this).attr('data-pause-status');
				if(status == undefined || status == 'play'){
					TSP.audio.player.pause();
					$(this).attr('data-pause-status', 'pause').html('继续播放');
				}else{
					TSP.audio.player.play();
					$(this).attr('data-pause-status', 'play').html('暂停播放');
				}
			},
			'.btn_play:not(.disabled)':function(){
				zeroTypeA = false;
				var tid = $(this).closest('.test_content').attr('data-id');
				if($('.test_content[data-id="'+tid+'"]').attr('data-type') == 1400){
					$('body').attr('data-current-test-id' , tid);
				}
				if(window.location.pathname != '/Competition/paper.html' && !$(this).hasClass('primary_btn_play') && !$(this).hasClass('primary_btn_replay')){
					$('.btn_play:not(.disabled)').html('开始答题');
				}
				$('.wait_video_css:not(.pf)').remove();
				if(TSP.audio.recorder.inited){
					TSP.audio.recorder.stop();
				}
				if(videoResult[tid]){
					videoResult[tid] = undefined;
				}
				var typeid = $(this).closest('.test_content').find('.chosBox').val();
				if(typeid == 1000 || typeid == null || typeid == undefined){
					$(this).closest('.test_content').find('.question_container .speak_sentence').removeClass('no_pass_font pass_font');
					$(this).closest('.test_content').find('.question_container .sentence_behind_space').remove();
					$(this).addClass('start');
					if(is_primary){
						var id = $(this).closest('.test_content').attr('data-test-index');
					}else{
						var id = $(this).closest('.test_content').find('.question_container').attr('data-qid');
					}
					var kind = $(this).closest('.test_content').attr('data-kind');
					var main_type = $(this).closest('.test_content').attr('data-type')
					var sub_type = $(this).closest('.test_content').attr('data-subtype')
					if(kind == 2 && sub_type != 1621 && sub_type != 1626 && main_type != 6200 && sub_type != 1631){
						$('.p_answer_list ul li[data-index='+id+']').addClass('done');
					}
					if((sub_type == 1121 || sub_type == 1122 || sub_type == 1123 || sub_type == 1124) 
							&& $(this).hasClass('primary_btn_replay')){
						if(typeof pause_play_key != 'undefined'){
							clearInterval(pause_play_key);
						}
						$(this).closest('.test_content').find('.images_sort_cnt .images_sort_option_cnt').removeClass('current_sort_option').addClass('enable');
						$(this).closest('.test_content').find('.images_sort_cnt .images_sort_option_cnt .option_flag').removeClass('current_flag');
						$(this).closest('.test_content').find('.images_sort_cnt .images_sort_option_cnt .images_sort_option').html('<div class="question_mark"></div>');
						TSP.practice.primary.question.randomChildNodes($(this).closest('.test_content').find('.question_content'), '.option_label');
						TSP.practice.primary.question.randomChildNodes($(this).closest('.test_content').find('.images_sort_cnt'), '.images_sort_option_cnt');
						$(this).closest('.test_content').find('.images_sort_cnt .images_sort_option_cnt').attr('data-rd-index', function(){
							return $(this).index() + 1;
						});
					}
					$('.btn_pause').attr('data-pause-status', 'play').html('暂停播放');
					if(is_primary){
						$(this).removeClass('primary_btn_replay').addClass('primary_btn_play');
					}else{
						if(window.location.pathname != '/Competition/paper.html'){
							$(this).html('开始答题');
						}
					}
					$('.btn_play_audio').html('播放原音');
					$('.btn_play_question').html('播放问题');
					$('.btn_play_answer').html('播放答案');
					$(this).closest('.test_content').find('.test_ctrl_area li.test_ctrl').removeClass('enable').addClass('enable');
					$(this).closest('.test_content').find('.speak_sentence').removeClass('enable').addClass('enable');
					var tid = $(this).closest('.test_content').attr('data-id');
					$('body').attr('data-play-id', tid);
					$(this).closest('.test_content').find('.question_question').show();
					if($(this).closest('.test_content').attr('data-type') != 1400 
							&& main_type!= 6100){
						$(this).closest('.test_content').find('.left_area').html('');
					}
					var first_id = $(this).closest('.sub_test_area').find('.test_content:first').attr('data-id');
					var source = $('.p_paper_cnt').attr('data-source');
					var struct_part_id = $(this).closest('.sub_test_area').attr('data-struct-part-id');
					var part_ids = ['2703', '3282', '3723', '3730', '3731', '3732', '3931', '3932', '3933', '3934', '3994', '4025', '4034', 
						'5628', '5659', '5660', '5663', '5673', '5674', '5732', '5733', '5965', '5970', '5971', '5972', '5973', '5974', 
						'5921', '6881', '6928', '6929', '6934', '6935', '6940', '6941', '6998', '7028'];
					if($('#test-mode[data-mode="free"]').is(':checked')){
						$(this).closest('.test_content').find('.test_ctrl_area li.test_ctrl[data-is-test="1"]').removeClass('enable');
						$(this).closest('.test_content').find('.test_ctrl_area li.test_ctrl[data-is-test="2"]').removeClass('enable');
					}else{
						if(first_id == tid 
								&& (
										(type == 'paper' && source == 'ts')
										|| (type == 'homework' && source == 'hw' 
												&& (struct_type == 2 || struct_type == 3)
											)
									)
								&& $.inArray(struct_part_id, part_ids) == -1
						){}else{
							$(this).closest('.test_content').find('.test_ctrl_area li.test_ctrl:eq(0)').removeClass('enable');
							$(this).closest('.test_content').find('.test_ctrl_area li.test_ctrl:eq(1)').removeClass('enable');
							var wait_part_ids = ['2702', '2703', '3338', '3723', '3930', '3931', '3932', '3933', '3934', '3936', '3988', '3995', '4023',
								'4026', '4077', '4078', '5674', '5736', '5970', '5971', '5972', '5973', '5974', '6996', '6999', '7001', '7028'];
							if($.inArray(struct_part_id, wait_part_ids) == -1 
									&& $(this).closest('.test_content').find('.test_ctrl_area li.test_ctrl:eq(3)').attr('data-act-type') == 0 
									&& $(this).closest('.test_content').find('.test_ctrl_area li.test_ctrl:eq(3)').attr('data-wait-time') > 0){
								$(this).closest('.test_content').find('.test_ctrl_area li.test_ctrl:eq(3)').removeClass('enable');
							}
							if($(this).closest('.test_content').find('.test_ctrl_area li.test_ctrl:eq(3)').attr('data-act-type') == 1 
									&& $(this).closest('.test_content').find('.test_ctrl_area li.test_ctrl:eq(3)').attr('data-mp3-type') == 0){
								var first_test_id = $(this).closest('.test_sub_area').find('.sub_test_area:eq(0) .test_content:eq(0)').attr('data-id');
								var now_title_mp3 = $(this).closest('.test_content').find('.test_ctrl_area li.test_ctrl:eq(3)').attr('data-mp3-path');
								if(first_test_id != tid && (now_title_mp3 != undefined || now_title_mp3 != null)){
									var first_test_mp3 = $(this).closest('.test_sub_area').find('.sub_test_area:eq(0) .test_ctrl_area li.test_ctrl:eq(3)').attr('data-mp3-path');
									if(now_title_mp3 == first_test_mp3){
										$(this).closest('.test_content').find('.test_ctrl_area li.test_ctrl:eq(3)').removeClass('enable');
									}
								}
							}
						}
					}
					if(is_primary){
						$(this).removeClass('primary_btn_play').addClass('primary_btn_replay');
					}else{
						if(window.location.pathname != '/Competition/paper.html'){
							$(this).html('重新答题');
						}
					}
					clearInterval(remainder_key);
					clearInterval(play_key);
					clearInterval(tape_remainder_key);
					if(videoResult[tid]){
						videoResult[tid] = undefined;
					}
					$('.test_ctrl_info_area').show();
					$('.test_ctrl_info_area .waveform_container').hide();
					$('.trans_test_ctrl_info_area').removeClass('recording');
					TSP.audio.player.stop();
					if(sub_type == 1516){
						var qs_str = $(this).closest('.test_content').find('.question_division_line .question_li .speak_sentence.question').html();
						if($(this).closest('.test_content').find('.question_content .question_info').length){
							$(this).closest('.test_content').find('.question_content .question_info').remove();
						}
						$(this).closest('.test_content').find('.question_content').append('<div class="question_info">' + qs_str + '</div>');
					}else if(main_type == 1500 && sub_type != 1520 && sub_type != 1510 && sub_type != 1512 && sub_type != 1514 && sub_type != 1516
								&& sub_type != 1522 && sub_type != 1523 && sub_type != 1524 && sub_type != 1526 && sub_type != 1527 
								&& sub_type != 1528 && sub_type != 1529 && sub_type != 1530 && sub_type != 1537 && sub_type != 1539 
								&& sub_type != 1540){
						var question_content_str = $(this).closest('.test_content').attr('data-question-content');
						if(question_content_str){
							$(this).closest('.test_content').find('.question_container .question_content').html(question_content_str);
						}else{
							question_content_str = $(this).closest('.test_content').find('.question_container .question_content').html();
							$(this).closest('.test_content').attr('data-question-content', question_content_str);
						}
					}
					TSP.practice.ctrlOpr.execute_ctrl(this);
				}
				else if(typeid == 2000){
					$(this).closest('.test_content').find('.question_container .speak_sentence').removeClass('no_pass_font pass_font');
					$(this).closest('.test_content').find('.question_container .sentence_behind_space').remove();
					$(this).addClass('start');
					var id = $(this).closest('.test_content').find('.question_container').attr('data-qid');
					var kind = $(this).closest('.test_content').attr('data-kind');
					if((kind == 1 || kind == 2) && $(this).closest('.test_content').attr('data-subtype') != 1621 && $(this).closest('.test_content').attr('data-subtype') != 1626 && $(this).closest('.test_content').attr('data-subtype') != 1631){
						$('.p_answer_list ul li[data-index='+id+']').addClass('done');
					}
					$('.btn_pause').attr('data-pause-status', 'play').html('暂停播放');
					if(!is_primary){
						$(this).html('开始答题');
					}else{
						$(this).removeClass('primary_btn_replay').addClass('primary_btn_play');
					}
					$('.btn_play_audio').html('播放原音');
					$('.btn_play_question').html('播放问题');
					$('.btn_play_answer').html('播放答案');
					$(this).closest('.test_content').find('.test_ctrl_area li.test_ctrl').removeClass('enable').addClass('enable');
					$(this).closest('.test_content').find('.speak_sentence').removeClass('enable').addClass('enable');
					var tid = $(this).closest('.test_content').attr('data-id');
					$('body').attr('data-play-id', tid);
					$(this).closest('.test_content').find('.question_question').show();
					var first_id = $(this).closest('.sub_test_area').find('.test_content:first').attr('data-id');
					if(first_id == tid && ((type == 'paper' && $('.p_paper_cnt').attr('data-source') == 'ts')
						|| (type == 'homework' && $('.p_paper_cnt').attr('data-source') == 'hw' && struct_type == 3))
					){}else{
						$(this).closest('.test_content').find('.test_ctrl_area li.test_ctrl:eq(0)').removeClass('enable');
						$(this).closest('.test_content').find('.test_ctrl_area li.test_ctrl:eq(1)').removeClass('enable');
						if($(this).closest('.test_content').find('.test_ctrl_area li.test_ctrl:eq(3)').attr('data-act-type') == 0 
								&& $(this).closest('.test_content').find('.test_ctrl_area li.test_ctrl:eq(3)').attr('data-wait-time') > 0){
							$(this).closest('.test_content').find('.test_ctrl_area li.test_ctrl:eq(3)').removeClass('enable');
						}
					}
					if(!is_primary){
						$(this).html('重新答题');
					}else{
						$(this).removeClass('primary_btn_play').addClass('primary_btn_replay');
					}
					clearInterval(remainder_key);
					clearInterval(play_key);
					clearInterval(tape_remainder_key);
					if(videoResult[tid]){
						videoResult[tid] = undefined;
					}
					$('.test_ctrl_info_area').show();
					$('.test_ctrl_info_area .waveform_container').hide();
					$('.trans_test_ctrl_info_area').removeClass('recording');
					TSP.audio.player.stop();
					TSP.practice.ctrlOpr.execute_ctrl(this);
				}
				else if(typeid == 3000){
					if(!$(this).closest('.p_operationBtn_container').siblings('.question_container').find('.kouarea').length){
						MessageBox({
							content : '请先手动进行扣词，再点击"开始答题"！',
							buttons : [{
								text : '我知道了',
								click : function(){
									$(this).dialog('close');
								}
							}]
						});
						return;
					}else{
						$(this).closest('.test_content').find('.question_container .speak_sentence').removeClass('no_pass_font pass_font');
						$(this).closest('.test_content').find('.question_container .sentence_behind_space').remove();
						$(this).addClass('start');
						var id = $(this).closest('.test_content').find('.question_container').attr('data-qid');
						var kind = $(this).closest('.test_content').attr('data-kind');
						if((kind == 1 || kind == 2) && $(this).closest('.test_content').attr('data-subtype') != 1621 && $(this).closest('.test_content').attr('data-subtype') != 1626 && $(this).closest('.test_content').attr('data-subtype') != 1631){
							$('.p_answer_list ul li[data-index='+id+']').addClass('done');
						}
						$('.btn_pause').attr('data-pause-status', 'play').html('暂停播放');
						if(!is_primary){
							$(this).html('开始答题');
						}else{
							$(this).removeClass('primary_btn_replay').addClass('primary_btn_play');
						}
						$('.btn_play_audio').html('播放原音');
						$('.btn_play_question').html('播放问题');
						$('.btn_play_answer').html('播放答案');
						$(this).closest('.test_content').find('.test_ctrl_area li.test_ctrl').removeClass('enable').addClass('enable');
						$(this).closest('.test_content').find('.speak_sentence').removeClass('enable').addClass('enable');
						var tid = $(this).closest('.test_content').attr('data-id');
						$('body').attr('data-play-id', tid);
						$(this).closest('.test_content').find('.question_question').show();
						var first_id = $(this).closest('.sub_test_area').find('.test_content:first').attr('data-id');
						if(first_id == tid && ((type == 'paper' && $('.p_paper_cnt').attr('data-source') == 'ts')
							|| (type == 'homework' && $('.p_paper_cnt').attr('data-source') == 'hw' && struct_type == 3))
						){}else{
							$(this).closest('.test_content').find('.test_ctrl_area li.test_ctrl:eq(0)').removeClass('enable');
							$(this).closest('.test_content').find('.test_ctrl_area li.test_ctrl:eq(1)').removeClass('enable');
							if($(this).closest('.test_content').find('.test_ctrl_area li.test_ctrl:eq(3)').attr('data-act-type') == 0 
									&& $(this).closest('.test_content').find('.test_ctrl_area li.test_ctrl:eq(3)').attr('data-wait-time') > 0){
								$(this).closest('.test_content').find('.test_ctrl_area li.test_ctrl:eq(3)').removeClass('enable');
							}
						}
						if(!is_primary){
							$(this).html('重新答题');
						}else{
							$(this).removeClass('primary_btn_play').addClass('primary_btn_replay');
						}
						clearInterval(remainder_key);
						clearInterval(play_key);
						clearInterval(tape_remainder_key);
						if(videoResult[tid]){
							videoResult[tid] = undefined;
						}
						$('.test_ctrl_info_area').show();
						$('.test_ctrl_info_area .waveform_container').hide();
						$('.trans_test_ctrl_info_area').removeClass('recording');
						TSP.audio.player.stop();
						TSP.practice.ctrlOpr.execute_ctrl(this);
					}
				}
				else if(typeid == 6000){
					$(this).closest('.test_content').find('.question_container .speak_sentence').removeClass('no_pass_font pass_font');
					$(this).closest('.test_content').find('.question_container .sentence_behind_space').remove();
					$(this).addClass('start');
					var id = $(this).closest('.test_content').find('.question_container').attr('data-qid');
					var kind = $(this).closest('.test_content').attr('data-kind');
					if((kind == 1 || kind == 2) && $(this).closest('.test_content').attr('data-subtype') != 1621 && $(this).closest('.test_content').attr('data-subtype') != 1626 && $(this).closest('.test_content').attr('data-subtype') != 1631){
						$('.p_answer_list ul li[data-index='+id+']').addClass('done');
					}
					$('.btn_pause').attr('data-pause-status', 'play').html('暂停播放');
					if(!is_primary){
						$(this).html('开始答题');
					}else{
						$(this).removeClass('primary_btn_replay').addClass('primary_btn_play');
					}
					$('.btn_play_audio').html('播放原音');
					$('.btn_play_question').html('播放问题');
					$('.btn_play_answer').html('播放答案');
					$(this).closest('.test_content').find('.test_ctrl_area li.test_ctrl').removeClass('enable').addClass('enable');
					$(this).closest('.test_content').find('.speak_sentence').removeClass('enable').addClass('enable');
					var tid = $(this).closest('.test_content').attr('data-id');
					$('body').attr('data-play-id', tid);
					$(this).closest('.test_content').find('.question_question').show();
					var first_id = $(this).closest('.sub_test_area').find('.test_content:first').attr('data-id');
					if(first_id == tid && ((type == 'paper' && $('.p_paper_cnt').attr('data-source') == 'ts')
						|| (type == 'homework' && $('.p_paper_cnt').attr('data-source') == 'hw' && struct_type == 3))
					){}else{
						$(this).closest('.test_content').find('.test_ctrl_area li.test_ctrl:eq(0)').removeClass('enable');
						$(this).closest('.test_content').find('.test_ctrl_area li.test_ctrl:eq(1)').removeClass('enable');
						if($(this).closest('.test_content').find('.test_ctrl_area li.test_ctrl:eq(3)').attr('data-act-type') == 0 
								&& $(this).closest('.test_content').find('.test_ctrl_area li.test_ctrl:eq(3)').attr('data-wait-time') > 0){
							$(this).closest('.test_content').find('.test_ctrl_area li.test_ctrl:eq(3)').removeClass('enable');
						}
					}
					if(!is_primary){
						$(this).html('重新答题');
					}else{
						$(this).removeClass('primary_btn_play').addClass('primary_btn_replay');
					}
					clearInterval(remainder_key);
					clearInterval(play_key);
					clearInterval(tape_remainder_key);
					if(videoResult[tid]){
						videoResult[tid] = undefined;
					}
					$('.test_ctrl_info_area').show();
					$('.test_ctrl_info_area .waveform_container').hide();
					$('.trans_test_ctrl_info_area').removeClass('recording');
					TSP.audio.player.stop();
					TSP.practice.ctrlOpr.execute_ctrl(this);
				}
				else if(typeid == 7000){
					$(this).closest('.test_content').find('.question_container .speak_sentence').removeClass('no_pass_font pass_font');
					$(this).closest('.test_content').find('.question_container .sentence_behind_space').remove();
					$(this).addClass('start');
					var id = $(this).closest('.test_content').find('.question_container').attr('data-qid');
					var kind = $(this).closest('.test_content').attr('data-kind');
					if((kind == 1 || kind == 2) && $(this).closest('.test_content').attr('data-subtype') != 1621 && $(this).closest('.test_content').attr('data-subtype') != 1626 && $(this).closest('.test_content').attr('data-subtype') != 1631){
						$('.p_answer_list ul li[data-index='+id+']').addClass('done');
					}
					$('.btn_pause').attr('data-pause-status', 'play').html('暂停播放');
					if(!is_primary){
						$(this).html('开始答题');
					}else{
						$(this).removeClass('primary_btn_replay').addClass('primary_btn_play');
					}
					$('.btn_play_audio').html('播放原音');
					$('.btn_play_question').html('播放问题');
					$('.btn_play_answer').html('播放答案');
					$(this).closest('.test_content').find('.test_ctrl_area li.test_ctrl').removeClass('enable').addClass('enable');
					$(this).closest('.test_content').find('.speak_sentence').removeClass('enable').addClass('enable');
					var tid = $(this).closest('.test_content').attr('data-id');
					$('body').attr('data-play-id', tid);
					$(this).closest('.test_content').find('.question_question').show();
					var first_id = $(this).closest('.sub_test_area').find('.test_content:first').attr('data-id');
					if(first_id == tid && ((type == 'paper' && $('.p_paper_cnt').attr('data-source') == 'ts')
						|| (type == 'homework' && $('.p_paper_cnt').attr('data-source') == 'hw' && struct_type == 3))
					){}else{
						$(this).closest('.test_content').find('.test_ctrl_area li.test_ctrl:eq(0)').removeClass('enable');
						$(this).closest('.test_content').find('.test_ctrl_area li.test_ctrl:eq(1)').removeClass('enable');
						if($(this).closest('.test_content').find('.test_ctrl_area li.test_ctrl:eq(3)').attr('data-act-type') == 0 
								&& $(this).closest('.test_content').find('.test_ctrl_area li.test_ctrl:eq(3)').attr('data-wait-time') > 0){
							$(this).closest('.test_content').find('.test_ctrl_area li.test_ctrl:eq(3)').removeClass('enable');
						}
					}
					if(!is_primary){
						$(this).html('重新答题');
					}else{
						$(this).removeClass('primary_btn_play').addClass('primary_btn_replay');
					}
					clearInterval(remainder_key);
					clearInterval(play_key);
					clearInterval(tape_remainder_key);
					if(videoResult[tid]){
						videoResult[tid] = undefined;
					}
					$('.test_ctrl_info_area').show();
					$('.test_ctrl_info_area .waveform_container').hide();
					$('.trans_test_ctrl_info_area').removeClass('recording');
					TSP.audio.player.stop();
					TSP.practice.ctrlOpr.execute_ctrl(this);
				}
				else if(typeid == 4000 || typeid == 5000){
					var id = $(this).closest('.test_content').find('.question_container').attr('data-qid');
					$('.p_answer_list ul li[data-index='+id+']').addClass('done');
					MessageBox({
						content : '请直接在题目内容区域进行操作！',
						buttons : [{
							text : '我知道了',
							click : function(){
								$(this).dialog('close');
							}
						}]
					});
					return;
				}
				else if(typeid == 8000){
					var id = $(this).closest('.test_content').find('.question_container').attr('data-qid');
					$('.p_answer_list ul li[data-index='+id+']').addClass('done');
					var tid = $(this).closest('.test_content').attr('data-id');
					if(videoResult[tid]){
						videoResult[tid] = undefined;
					}
					$(this).addClass('start');
					TSP.audio.player.stop();
					clearInterval(play_key);
					clearInterval(tape_remainder_key);
					$('.test_content .speak_sentence').removeClass('high_light_font');
					$('.test_ctrl_info_area').hide();
					$('.ctrl_info_span .score').hide();
					$(this).closest('.test_content').find('.sentence_behind_space').remove();
					$(this).closest('.test_content').find('.speak_sentence').removeAttr('data-time-flag').removeClass('no_pass_font pass_font enable').addClass('enable');
					TSP.audio.player.stop();
					gd(this);
				}
			},
			'.speak_sentence' :function(){
				var tid = $(this).closest('.test_content').attr("data-id");
				var sub_type = $(this).closest('.test_content').attr('data-subtype');
				if(sub_type == 1428 || sub_type == 1438){
					return false;
				}
				var typeid = $(this).closest('.test_content').find('.p_operationBtn_container .chosBox').val();
				if(typeid == 1000 || typeid == 4000 || typeid == 5000){
					$('body').off("selectstart");
				}else{
					$('body').on("selectstart",function(){
						return false;
					});
				}
				if(zeroTypeC){
				}else{
					if(typeid == 5000){
						if($(this).hasClass('pass_font') || $(this).hasClass('no_pass_font') || $(this).hasClass('high_light_font')){
							MessageBox({
								content : '此句您已经进行过点说判分！请操作其余单句！',
								buttons : [{
									text : '我知道了',
									click : function(){
										$(this).dialog('close');
									}
								}]
							});
							return;
						}
					}
					var sen_starttime = $(this).attr('data-starttime');
					if(typeid == 4000 || typeid == 5000){
						$('.speak_sentence').removeClass('high_light_font');
						$(this).addClass('high_light_font');
					}
					if(typeid == 4000){
						initSpeakArea();
						$(this).closest('.test_content .sentence_behind_space').remove();
						dd(this);
					}else if(typeid == 5000){
						initSpeakArea();
						$('.test_content .speak_sentence').removeClass('high_light_font');
						ds(this);
					}
				}
			},
			'.btn_play_audio' : function(){
				btn_play_audio = true;
				clearInterval(play_key);
				if(!is_primary){
					$('.btn_pause').attr('data-pause-status', 'play').html('暂停播放');
					$('.btn_play_audio').html('播放原音');
					$('.btn_play_question').html('播放问题');
					$('.btn_play_answer').html('播放答案');
					$(this).html('重新播放');
					$('.btn_play_audio').removeClass('current_play');
					$('.btn_play_video').removeClass('current_play');
					$(this).addClass('current_play');
				}
				var kind = $(this).closest('.test_content').attr('data-kind');
				var tid = $(this).closest('.test_content').attr('data-id');
				$('body').attr('data-play-test-id', tid);
				var file_name = '';
				if(kind == 1){
					var sub_type = $(this).closest('.test_content').attr('data-subtype');
					if(1121 == sub_type || sub_type == 1122 || sub_type == 1123 || sub_type == 1124){
						$('.test_ctrl_info_area').show();
						$('.test_ctrl_info_area .percentage_gray').show();
						$('.test_ctrl_info_area .waveform_container').hide();
						TSP.practice.ctrlOpr.play_audio_tppx(this);
						return;
					}else{
						file_name = $(this).closest('.test_content').find('.p_Laudio').attr('data-mp3');
					}
				}else if(kind == 2){
					var main_type = $(this).closest('.test_content').attr('data-type');
					var sub_type = $(this).closest('.test_content').attr('data-subtype');
					if(main_type == '7100'){
						if($(this).closest('.p_operationBtn_container').length){
							file_name = $(this).closest('.p_operationBtn_container').prev().find('.speak_sentence').attr('data-mp3');
						}else{
							file_name = $(this).closest('.btn_info_area').prev().find('.speak_sentence').attr('data-mp3');
						}
					}else{
						var audio_obj = $(this).closest('.test_content').find('.p_Laudio');
						if(audio_obj != undefined && audio_obj.length > 0){
							file_name = $(audio_obj).attr('data-mp3');
						}
						if(file_name == undefined || file_name == '' || file_name == 0){
							$(this).closest('.test_content').find('.speak_sentence:not(.no_audio)').each(function(i, obj){
								file_name = $(this).attr('data-mp3');
							});
						}
					}
				}
				TSP.practice.ctrlOpr.play_audio(this, file_name, '播放原音');
			},
			'.btn_play_question' : function(){
				clearInterval(play_key);
				TSP.audio.player.stop();
				$('.btn_pause').attr('data-pause-status', 'play').html('暂停播放');
				$('.btn_play_audio').html('播放原音');
				$('.btn_play_question').html('播放问题');
				$('.btn_play_answer').html('播放答案');
				$(this).html('重新播放');
				var file_name = $(this).closest('.question_li:not(.question_li_1520)').find('.speak_sentence.question').attr('data-mp3');
				if(file_name == undefined){
					var audio_obj = $(this).closest('.test_content').find('.p_Laudio');
					if(audio_obj != undefined && audio_obj.length > 0){
						file_name = $(audio_obj).attr('data-mp3');
					}
					if(file_name == undefined || file_name == '' || file_name == 0){
						$(this).closest('.test_content').find('.speak_sentence:not(.no_audio)').each(function(i, obj){
							file_name = $(this).attr('data-mp3');
						});
					}
				}
				var tid = $(this).closest('.test_content').attr('data-id');
				$('body').attr('data-play-test-id', tid);
				var point = file_name.lastIndexOf("."); 			       
			    var suffix = file_name.substr(point); 
				if(suffix == '.mp3'){
					TSP.practice.ctrlOpr.play_audio(this, file_name, '播放问题');			
				}else if(suffix == '.ogg' || suffix == '.mp4'){
					var video =$(this).closest('.test_content').find('.videoinfo').attr('data-ogg');
					var player = VideoJS(video);
					player.width(620);
					player.height(250);
					player.play();
				}
			},
			'.btn_play_answer' : function(){
				clearInterval(play_key);
				TSP.audio.player.stop();
				$('.btn_pause').attr('data-pause-status', 'play').html('暂停播放');
				$('.btn_play_audio').html('播放原音');
				$('.btn_play_question').html('播放问题');
				$('.btn_play_answer').html('播放答案');
				$(this).html('重新播放');
				var file_name = $(this).closest('.question_li:not(.question_li_1520)').find('.speak_sentence.answer').attr('data-mp3');
				var tid = $(this).closest('.test_content').attr('data-id');
				$('body').attr('data-play-test-id', tid);
				TSP.practice.ctrlOpr.play_audio(this, file_name, '播放答案');
			},
			'.btn_play_video:not(.question)' : function(){
				btn_play_audio = true;
				var main_type = $(this).closest('.test_content').attr('data-type');
				var sub_type = $(this).closest('.test_content').attr('data-subtype');
				var tid = $(this).closest('.test_content').attr('data-id');
				clearInterval(play_key);
				TSP.audio.player.stop();
				$('body').attr('data-play-test-id', tid);
				if($('.p_paper_cnt').attr('data-page') == 'record'){
					var count = $(this).closest('.test_content').attr('data-count');
					var mp3 = $(this).closest('.test_content').attr('data-record-mp3');
					if(mp3 == undefined || mp3.search('data.waiyutong.org/asr/') < 0){
						MessageBox({
							content : '没有录音信息',
							buttons : [{
								text : '我知道了',
								click : function(){
									$(this).dialog('close');
								}
							}]
						});
						return;
					}
					$('.btn_pause').attr('data-pause-status', 'play').html('暂停播放');
					$('.btn_play_audio').html('播放原音');
					$('.btn_play_question').html('播放问题');
					$('.btn_play_answer').html('播放答案');
					$(this).html('重新播放');
					var mp3_arr = mp3.split(',');
					mp3_arr.pop();
					var record_play = function(file_src){
						if(file_src.search('/') >= 0){
							var file_name = file_src.substr(file_src.lastIndexOf('/') + 1);
						}else{
							var file_name = file_src;
						}
						if(file_name == '' || file_src == ''){
							MessageBox({
								content : '没有录音信息',
								buttons : [{
									text : '我知道了',
									click : function(){
										$(this).dialog('close');
									}
								}]
							});
							return;
						}
						TSP.audio.player.audioElem = TSP.audio.files.getAudio(file_name);
						TSP.audio.player.audioElem.src = file_src;
						TSP.audio.player.play();
						$('.test_ctrl_info_area').show();
						$('.test_ctrl_info_area .percentage_gray').show();
						$('.test_ctrl_info_area .waveform_container').hide();
						$('.test_ctrl_info_area .info_hint').html('播放录音');
						$('.test_ctrl_info_area .play_mp3_area .remainder_time_area').hide();
						play_key = setInterval(function(){
							var total_time = TSP.audio.player.audioElem.duration;
							var remainder_time = TSP.audio.player.audioElem.getCurrentTime();
							$('.test_ctrl_info_area .play_mp3_area .percentage_bule').css('width', (remainder_time/total_time * 100)+'%');
							if(total_time - remainder_time <= 0){
								$('.test_ctrl_info_area').hide();
								$('.trans_test_ctrl_info_area').removeClass('recording');
								clearInterval(play_key);
								$('body').attr('data-play-test-id', '');
							}
						}, 100);
					}
					if(main_type == 7100){
						var index = $(this).closest('.test_content').find('.btn_play_video').index(this);
						var file_src = mp3_arr[index];
						record_play(file_src);
					}else{
						if(mp3_arr.length > 1 && count == 1){
							var mp3_cur = 0;
							(function multi_record_play(mp3_cur){
								if($.trim(mp3_arr[mp3_cur]) == ''){
									mp3_cur++;
									multi_record_play(mp3_cur);
									return;
								}
								record_play(mp3_arr[mp3_cur]);
								TSP.audio.player.audioElem.onended = function(){
									$('.test_ctrl_info_area').hide();
									$('.trans_test_ctrl_info_area').removeClass('recording');
									clearInterval(play_key);
									$('body').attr('data-play-test-id', '');
									mp3_cur++;
									if(mp3_cur < mp3_arr.length){
										multi_record_play(mp3_cur);
									}
								};
							})(mp3_cur);
						}
						else{
							var idx = $(this).closest('.question_li').index();
							idx = idx < 0 ? 0 : idx;
							var file_src = mp3_arr[idx];
							record_play(file_src);
							TSP.audio.player.audioElem.onended = function(){
								$('.test_ctrl_info_area').hide();
								$('.trans_test_ctrl_info_area').removeClass('recording');
								clearInterval(play_key);
								$('body').attr('data-play-test-id', '');
							};
						}
					}
					return;
				}
				$('.btn_play_audio').removeClass('current_play');
				$('.btn_play_video').removeClass('current_play');
				$(this).addClass('current_play');
				var video_time = 0;
				if(videoResult != undefined && videoResult != null 
						&& videoResult[tid] != undefined && videoResult[tid] != null){
					if(main_type == '7100'){
						var btn_index = 0;
						$(this).closest('.test_content').find('.btn_play_video').each(function(m, nm){
							if($(this).hasClass('current_play')){
								btn_index = m;
							}
						});
						var video_num = 0;
						$.each(videoResult[tid], function(key, obj){
							if(video_num == btn_index){
								video_time = key;
							}
							video_num++;
						});
						if(video_time > 0){
							if ((!!window.ActiveXObject || "ActiveXObject" in window) || userAgent.indexOf("Edge") > -1) {
								$("#AsrRecorder")[0].playBack(tid);
							}else{
								TSP.audio.recorder.getWaveByTime(video_time);
							}
							return;
						}
					}else{
						if($(this).closest('.test_content').find('.question_container .speak_sentence').length > 1){
							var times = new Array();
							$.each(videoResult[tid], function(key, obj){
								times.push(key);
							});
							if(times.length){
								if ((!!window.ActiveXObject || "ActiveXObject" in window) || userAgent.indexOf("Edge") > -1) {
									$("#AsrRecorder")[0].playBack(tid);
								}else{
									TSP.audio.recorder.getWaveByTimes(times);
								}
								return;
							}
						}else{
    						$.each(videoResult[tid], function(key, obj){
    							video_time = key;
    						});
							if(video_time > 0){
								if ((!!window.ActiveXObject || "ActiveXObject" in window) || userAgent.indexOf("Edge") > -1) {
									$("#AsrRecorder")[0].playBack(tid);
								}else{
									TSP.audio.recorder.getWaveByTime(video_time);
								}
								return;
							}
						}
					}
				}
				MessageBox({
					content : '没有录音信息',
					buttons : [{
						text : '我知道了',
						click : function(){
							$(this).dialog('close');
						}
					}]
				});
			},
			'.btn_play_video.question' : function(){
				if($('.p_paper_cnt').attr('data-page') == 'record'){
					clearInterval(play_key);
					TSP.audio.player.stop();
					var count = $(this).closest('.test_content').attr('data-count');
					var mp3 = $(this).closest('.test_content').attr('data-record-mp3');
					if(mp3 == undefined || mp3.search('data.waiyutong.org/asr/') < 0){
						MessageBox({
							content : '没有录音信息',
							buttons : [{
								text : '我知道了',
								click : function(){
									$(this).dialog('close');
								}
							}]
						});
						return;
					}
					var tid = $(this).closest('.test_content').attr('data-id');
					$('body').attr('data-play-test-id', tid);
					$('.btn_pause').attr('data-pause-status', 'play').html('暂停播放');
					$('.btn_play_audio').html('播放原音');
					$('.btn_play_question').html('播放问题');
					$('.btn_play_answer').html('播放答案');
					$(this).html('重新播放');
					var mp3_arr = mp3.split(',');
					if(mp3_arr[mp3_arr.length - 1] == ''){
						mp3_arr.pop();
					}
					var record_play = function(file_src){
						if(file_src.search('/') >= 0){
							var file_name = file_src.substr(file_src.lastIndexOf('/') + 1);
						}else{
							var file_name = file_src;
						}
						TSP.audio.player.audioElem = TSP.audio.files.getAudio(file_name);
						TSP.audio.player.audioElem.src = file_src;
						TSP.audio.player.play();
						$('.test_ctrl_info_area').show();
						$('.test_ctrl_info_area .percentage_gray').show();
						$('.test_ctrl_info_area .waveform_container').hide();
						$('.test_ctrl_info_area .info_hint').html('播放录音');
						$('.test_ctrl_info_area .play_mp3_area .remainder_time_area').hide();
						play_key = setInterval(function(){
							var total_time = TSP.audio.player.audioElem.duration;
							var remainder_time = TSP.audio.player.audioElem.getCurrentTime();
							$('.test_ctrl_info_area .play_mp3_area .percentage_bule').css('width', (remainder_time/total_time * 100)+'%');
							if(total_time - remainder_time <= 0){
								$('.test_ctrl_info_area').hide();
								$('.trans_test_ctrl_info_area').removeClass('recording');
								clearInterval(play_key);
								$('body').attr('data-play-test-id', '');
							}
						}, 100);
					}
					if(mp3_arr.length > 1 && count == 1){
						var mp3_cur = 0;
						(function multi_record_play(mp3_cur){
							if($.trim(mp3_arr[mp3_cur]) == ''){
								mp3_cur++;
								multi_record_play(mp3_cur);
								return;
							}
							record_play(mp3_arr[mp3_cur]);
							TSP.audio.player.audioElem.onended = function(){
								$('.test_ctrl_info_area').hide();
								$('.trans_test_ctrl_info_area').removeClass('recording');
								clearInterval(play_key);
								$('body').attr('data-play-test-id', '');
								mp3_cur++;
								if(mp3_cur < mp3_arr.length){
									multi_record_play(mp3_cur);
								}
							};
						})(mp3_cur);
					}
					else{
						var idx = $(this).closest('.question_li').index();
						idx = idx < 0 ? 0 : idx;
						var file_src = mp3_arr[idx];
						record_play(file_src);
						TSP.audio.player.audioElem.onended = function(){
							$('.test_ctrl_info_area').hide();
							$('.trans_test_ctrl_info_area').removeClass('recording');
							clearInterval(play_key);
							$('body').attr('data-play-test-id', '');
						};
					}
					return;
				}
				clearInterval(play_key);
				TSP.audio.player.stop();
				var tid = $(this).closest('.test_content').attr('data-id');
				$('body').attr('data-play-test-id', tid);
				$('.btn_play_audio').removeClass('current_play');
				$('.btn_play_video').removeClass('current_play');
				$(this).addClass('current_play');
				var video_time = 0;
				if(videoResult != undefined && videoResult != null 
						&& videoResult[tid] != undefined && videoResult[tid] != null){
					var index = $(this).closest('.question_li:not(.question_li_1520)').index();
					var num = 0;
					$.each(videoResult[tid], function(key, obj){
						if(num == index){
							video_time = key;
						}
						num++;
					});
					if(video_time > 0){
						if ((!!window.ActiveXObject || "ActiveXObject" in window) || userAgent.indexOf("Edge") > -1) {
							$("#AsrRecorder")[0].playBackForDialogue(tid, index);
						}else{
							TSP.audio.recorder.getWaveByTime(video_time);
						}
						return;
					}
				}
				MessageBox({
					content : '没有录音信息',
					buttons : [{
						text : '我知道了',
						click : function(){
							$(this).dialog('close');
						}
					}]
				});
			},
			'.btn_answer' : function(){
				$(this).closest('.test_content').find('.analysis').toggle();
				$(this).closest('.test_content').find('.question_dialogue').toggle();
				$(this).closest('.test_content').find('.p_knowledge_points').toggle();
				$(this).closest('.test_content').find('.listening_text').toggle();
				$(this).closest('.test_content').find('.sub_type_1520 .question_division_line').show();
				var main_type = $(this).closest('.test_content').attr('data-type');
				var sub_type = $(this).closest('.test_content').attr('data-subtype');
				if(main_type == '7100'){
					$(this).closest('.test_content').find('.question_division_line').toggle();
				}else{
					$(this).closest('.test_content').find('.question_division_line').toggle();
				}
			},
			'.click_to_slide' : function(){
				$(this).hide();
				if($(this).hasClass('slideToUp')){
					$(this).find('i').toggleClass('triangle_up triangle_down');
					$(this).find('span').text('点击展开');
					$('.p_paperInfo_box').slideUp(function(){
						$('.click_to_slide').css({'margin-top' : '0'}).show();
					});
				}else if($(this).hasClass('slideToDown')){
					$(this).find('i').toggleClass('triangle_up triangle_down');
					$(this).find('span').text('点击收起');
					$('.p_paperInfo_box').slideDown(function(){
						$('.click_to_slide').css({'margin-top' : '-32px'}).show();
					});
				}
				$(this).toggleClass('slideToUp slideToDown');
			},
			'.add_to_bank' : function(){
				var id = $(this).closest('.test_content').attr('data-id');
				var main_type = $(this).closest('.test_content').attr('data-type');
				$('.P_add_to_bank_area input[name="reason"]').attr('checked', false);
				$('.P_add_to_bank_area .extra_reasons textarea[name=reasons_input]').val('');
				$('.P_add_to_bank_area').dialog({
					hide : true,
					modal : true,
					resizable : false,
					width : 600,
					title : '加入题库',
					dialogClass: 'message-dialog green-dialog',
					buttons:{
						'确定':function(){
							var reasons = '';
							$('input[name=reason]:checked').each(function(i, n){
								if(i != 0){
									reasons += '/';
								}
								reasons += $(n).val();
							});
							var extReason = $('.extra_reasons textarea[name=reasons_input]').val();
							if(!extReason.match(/^\s*$/)){
								if(reasons != '' && !extReason.match(/^\s*$/)){
									reasons += '/';
								}
								reasons += extReason;
							}
							if(reasons.match(/^\s*$/)){
								MessageBox({
									content : '请添加收藏的原因~',
									buttons : [{
										text : '我知道了',
										click : function(){
											$(this).dialog('close');
										}
									}]
								});
								return;
							}
							var params = {};
							params.savereason = reasons;
							params.testid = id;
							params.MainType = main_type;
							params.SaveVersion = version_id;
							params.SaveGrade = grade_id;
							params.SaveUnit = unit_ids;
							params.PracticeType = type;
							$.post(TinSoConfig.student + '/Questions/addFavorite.html', params, function(data){
								if(data.status){
									data = data.info;
									if(data > 0){
										$('.test_content[data-id="'+ id + '"] .add_to_bank').removeClass('add_to_bank').addClass('remove_from_bank').attr('title','移出我的题库');
									}										
								}else{
									MessageBox({
										content : '加入精题库失败！',
										buttons : [{
											text : '我知道了',
											click : function(){
												$( this ).dialog( 'close' );
											}
										}]
									}, 'warning');
								}
							});
							$(this).dialog('close');
						}, 
						'取消':function(){ 
							$(this).dialog('close');
						} 
					}
			   }); 
			},
	        '.remove_from_bank' : function(){
	        	var id = $(this).closest('.test_content').attr('data-id');
	            MessageBox({
	                content : '您确定要移除该题？',
	                buttons : [{
	                    text : '确定',
	                    click : function(){
							$.post(TinSoConfig.student + '/Questions/deleteFavoriteByTestId.html', {testId : id, type : 0}, function(data){								
								if(data.status){
									$('.test_content[data-id="'+ id + '"] .remove_from_bank').removeClass('remove_from_bank').addClass('add_to_bank').attr('title','加入我的题库');
								}else{
									MessageBox({
										content : '从精题库移除该题失败！',
										buttons : [{
											text : '我知道了',
											click : function(){
												$( this ).dialog( 'close' );
											}
										}]
									}, 'warning');
								}
							});
	                    	$(this).dialog('close');
	                    }
	                },
	                {
	                    text : '取消',
	                    click : function(){
	                        $(this).dialog('close');
	                    }
	                }]
	            });     
	        },
			'.p_answer_list:not(.auto_start) ul li,.p_switch_current:not(.auto_start)':function(){
				var id = parseInt($(this).text());
				TSP.practice.answerSheet.select(id);
			},
			'.p_switch_prev:not(.auto_start)' : function(){
				var current_qid = parseInt($(this).siblings('.p_switch_current').find('span').text());
				var foremost =  Number($('.current_test').find('.question_container:first').attr('data-qid'));
				if(type == 'wrong'){
					if(current_qid > foremost){
						var qid = current_qid - 1;
						$('.p_switch_current span').text(qid);
						$('.p_answer_list ul li[data-index='+qid+']').click();
					}
				}else{
					if(current_qid > 1){
						TSP.practice.answerSheet.select(current_qid - 1);
					}
				}
			},
			'.p_switch_next:not(.auto_start)' : function(){
				var current_qid = parseInt($(this).siblings('.p_switch_current').find('span').text());
				if(is_primary){
					var rearmost = $('.primary_test_question_cnt').find('.test_content').length;
				}else{
					var rearmost = Number($('.current_test').find('.question_container:last').attr('data-qid'));
				}
				if(type == 'wrong'){
					if(current_qid < rearmost){
						TSP.practice.answerSheet.select(current_qid + 1);
					}else if(current_qid == rearmost){
						$('.next_test').click();	
					}
				}else{
					if(is_primary){
						if(current_qid < $('.test_content').length){
							TSP.practice.answerSheet.select(current_qid + 1);
						}
					}else{
						if(current_qid < $('.question_id').length){
							TSP.practice.answerSheet.select(current_qid + 1);
						}
					}
				}
			},
			'.test_content' : function(e){
				if(!is_primary){
					TSP.practice.paperTest.select(e);
				}
			},
	        '.p_answerSubmit_btn:not(.disabled)' : function(){
				var flag = false;
				$('.p_answer_list ul li').each(function(i, obj){
					if(!$(this).hasClass('done')){
						flag = true;
					}
				});
				if(flag){
					MessageBox({
						content : '未完成全部试题，是否保存答案？',
						buttons : [{
							text : '继续练习',
							click : function(){
								$(this).dialog('close');
							}
						},
						{
							text : '保存答案',
							click : function(){
								$(this).dialog('close');
								if(type != 'wrong'){
									TSP.practice.process.submitAnswerCheck();
								}
							}
						}]
					});
				}else{
					MessageBox({
						content : '已完成全部试题，是否保存答案？',
						buttons : [{
							text : '继续练习',
							click : function(){
								$(this).dialog('close');
							}
						},
						{
							text : '保存答案',
							click : function(){
								$(this).dialog('close');
								if(type != 'wrong'){
									TSP.practice.process.submitAnswerCheck();
								}
							}
						}]
					});
				}
	        },
	        '.p_practiceAgain_btn' : function(){
	        	var page = $('.p_paper_cnt').attr('data-page');
	        	MessageBox({
					content : '确定要再练一次吗？',
					buttons : [
					    {
					    	text : '确定',
					    	click : function(){
					    		$(this).dialog('close');
					    		isSubmitAAA = false;
					        	if(page == 'record'){
					        		var id = $('.p_paper_cnt').attr('data-id');
					        		var mode = $('#test-mode').attr('data-mode');
					        		var type = $('.p_paper_cnt').attr('data-source');
					        		var version = $('.p_paper_cnt').attr('data-version');
					        		var grade = $('.p_paper_cnt').attr('data-grade');
					        		var unit = $('.p_paper_cnt').attr('data-unit');
					        		var province_id = $('.p_paper_cnt').attr('data-province-id');
					        		var city_id = $('.p_paper_cnt').attr('data-city-id');
					        		var str = '';
					        		if(version != ''){
					        			str += '&version=' + version;
					        		}
					        		if(grade != ''){
					        			str += '&grade=' + grade;
					        		}
					        		if(unit != ''){
					        			str += '&unit=' + unit;
					        		}
					        		var url = '';
					        		if(source == 'hw'){
					        			var url = 'homework.html?hid=' + id;
					        		}
					        		else{
					        			if(is_primary){
					    					var title =　TSP.practice.process.getQueryString("title");
					    					if(title != '' || title != null  || title != undefined){
					    						str += '&title=' + title;
					    					}
					        				var url = 'unitTest.html?type=' + type + '&id=' + id
											+ '&mode=exam' + str;
					        			}else{
					        				var url = 'paperPractice.html?type=' + type + '&id=' + id
											+ '&mode=' + mode + '&province_id=' + province_id + '&city_id=' + city_id + str;
					        			}
					        		}
									window.location.href = url;
					        	}else{
					        		history.go(0);
					        	}
							}
					    },
					    {
					    	text : '取消',
					    	click : function(){
								$(this).dialog('close');
							}
					    }
					]
				});
	        },
	        '.p_back_btn' : function(){
	        	if (TSP.practice.is_submit || $('.p_paper_cnt').attr('data-page') == "record") {
	        		MessageBox({
						content : '确认返回？',
						buttons : [{
							text : '确认',
							click : function(){
								$(this).dialog('close');
								TSP.practice.process.backToSource();
							}
						},{
							text : '取消',
							click　: function(){
								$(this).dialog('close');
							}
						}],
						close :　function(){
							$(this).dialog('close');
						}
					});
	        	} else {
	        		MessageBox({
						content : '如果退出，本次练习记录将不会保存。',
						buttons : [{
							text : '退出练习',
							click : function(){
								$(this).dialog('close');
								TSP.practice.process.backToSource();
							}
						},{
							text : '继续练习',
							click　: function(){
								$(this).dialog('close');
							}
						}],
						close :　function(){
							$(this).dialog('close');
						}
					});
	        	}
	        },
	        '.p_back_btn_spe' : function(){
	        	TSP.practice.process.backToSource();
	        },
	        '.btn_listeining_text': function(){
	            $(this).closest('.test_content').find('.listening_text').toggle(); 
	        },
			'.question_content input[type=radio]' : function(){
				if(is_primary){
					$(this).closest('.question_content').find('label.option_label').removeClass('label_selected');
					$(this).closest('label.option_label').addClass('label_selected');
					var id = $(this).closest('.test_content').attr('data-test-index');
					$('.p_answer_list ul li[data-index='+id+']').addClass('done');
				}else{
					var id = $(this).closest('.question_container').attr('data-qid');
					$('.p_answer_list ul li[data-index='+id+']').addClass('done');
					var play_test_id = $('body').attr('data-play-id');
					var kind = $(this).closest('.test_content').attr('data-kind');
					var tid = $(this).closest('.test_content').attr('data-id');
					var mode = $('.p_operation_box #test-mode').attr('data-mode');
					var source = $('.p_paper_cnt').attr('data-source');
					var struct_type = $('.p_paper_cnt').attr('data-struct-type');
					if(!(mode == 'exam' 
							&& (
									(source == 'ts' || source == 'unit') 
									|| (source == 'hw' && (struct_type == 2 || struct_type == 3))
								)
						)
					){
						if(kind == 3 || (play_test_id && play_test_id != tid)){
							if(window.location.pathname != '/Competition/paper.html'){
								$('.btn_play').html('开始答题');
							}
							$('.btn_pause').attr('data-pause-status', 'play').html('暂停播放');
							$('.btn_play_audio').html('播放原音');
							$('.btn_play_question').html('播放问题');
							$('.btn_play_answer').html('播放答案');
							clearInterval(remainder_key);
							clearInterval(play_key);
							clearInterval(tape_remainder_key);
							$('.test_ctrl_info_area').hide();
							$('.trans_test_ctrl_info_area').removeClass('recording');
							TSP.audio.player.stop();
							$('body').attr('data-current-test-id' , '');
						}
					}
				}
			},
			'.practice_again' : function(){
				window.location.reload();
			},
			'.submit_homework' : function(){
				var endStatus = $('.p_paper_cnt').attr('data-end-status');
				if(endStatus == 4){
					$content = '确定补交作业？';
				}else{
					$content = '确定提交作业？';
				}
				var precord_id = $(this).attr('data-precord-id');
				MessageBox({
					content : $content,
					buttons : [{
						text : '确定',
						click : function(){
							ResourceLoadingMessageBox('正在提交作业，请稍候...');
							var params = {'precord_id' : precord_id, 'hid' : practice_id};
				        	$.post(TinSoConfig.student + '/Practice/submitHomework.html', params, function(data){
				        		ResourceLoadingMessageBox('close');
								MessageBox({
									content : data.info.msg,
									buttons : [{
										text : '我知道了',
										click : function(){
											$(this).dialog('close');
											$('.p_paper_cnt,.p_answerSheet_cnt').removeClass('hide');
											$('html,body').animate({scrollTop : 0}, 0);
											$('.H_submit_homework_cnt').hide();
											$('.submit_homework').addClass('hide');
											window.onbeforeunload = function(){}
								 			var url = TinSoConfig.student+'/Homework/lists.html';
								 			window.location.href = url;
										}
									}]
								});
								isNeedProtectDialog = true;
				        	});		
						}
					},
					{
						text : '取消',
						click : function(){
							$(this).dialog('close');
						}
					}]
				});
			},
			'.results' : function(){
				$('.H_submit_homework_cnt').hide();
				$('.p_paper_cnt,.main_content_cnt,.p_answerSheet_cnt').removeClass('hide');
				$('.main_content').removeClass('homework_result');
			}
		},
		'change':{
			'select' : function(){
				var val = $(this).val();
				var id = $(this).closest('.question_container').attr('data-qid');
				if(val != ''){
	                $('.p_answer_list ul li[data-index='+id+']').addClass('done');	
				}else{
	                $('.p_answer_list ul li[data-index='+id+']').removeClass('done');	
				}
				var play_test_id = $('body').attr('data-play-id');
				var kind = $(this).closest('.test_content').attr('data-kind');
				var tid = $(this).closest('.test_content').attr('data-id');
				var mode = $('.p_operation_box #test-mode').attr('data-mode');
				var source = $('.p_paper_cnt').attr('data-source');
				var struct_type = $('.p_paper_cnt').attr('data-struct-type');
				if(!(mode == 'exam' 
					&& (
							(source == 'ts' || source == 'unit') 
							|| (source == 'hw' && (struct_type == 2 || struct_type == 3))
						)
					)
				){
					if(kind == 3 || (play_test_id && play_test_id != tid)){
						if(!is_primary){
							if(window.location.pathname != '/Competition/paper.html'){
								$('.btn_play').html('开始答题');
							}
						}else{
							$('.btn_play').removeClass('primary_btn_replay').addClass('primary_btn_play');
						}
						$('.btn_pause').attr('data-pause-status', 'play').html('暂停播放');
						$('.btn_play_audio').html('播放原音');
						$('.btn_play_question').html('播放问题');
						$('.btn_play_answer').html('播放答案');
						clearInterval(remainder_key);
						clearInterval(play_key);
						clearInterval(tape_remainder_key);
						$('.test_ctrl_info_area').hide();
						$('.trans_test_ctrl_info_area').removeClass('recording');
						TSP.audio.player.stop();
						$('body').attr('data-current-test-id' , '');
					}
				}
			},
			'.chosBox' : function(){
				var val = $(this).val();
				var that = this;
				if(type == 'homework'){
					if(isfree && val != 1000){
						MessageBox({
							content : '免费用户只能使用普通模式，若想使用更多模式请升级资源!',
							buttons : [{
								text : '我知道了',
								click : function(){
									$(that).val(1000).change();
									$(this).dialog('close');
								}
							}]
						});
						return;
					}
				}
				$(".speak_sentence").removeClass('high_light_font');
				$(this).closest('.test_content').find(".speak_sentence").addClass('enable');
				if(is_primary){
					var qid = $(this).closest('.test_content').attr('data-test-index');
				}else{
					var qid = $(this).closest('.test_content').find('.question_container').attr('data-qid');
				}
				var tid = $(this).closest('.test_content').attr('data-id');
				if(typeof(cur_html[qid]) != 'undefined'){
					$(this).closest('.test_content').find('.question_container .question_content').html(cur_html[qid]);
				}
				clearInterval(remainder_key);
				clearInterval(play_key);
				clearInterval(tape_remainder_key);
				$('.test_ctrl_info_area').hide();
				$('.trans_test_ctrl_info_area').removeClass('recording');
				TSP.audio.player.stop();
				if(TSP.audio.recorder.inited){
					TSP.audio.recorder.stop();
				}
				videoResult[tid] = new Object();
				$(this).closest('.test_content').find('.sentence_behind_space').remove();
				$(this).closest('.test_content').find(".speak_sentence").removeClass('no_pass_font pass_font');
				$(this).closest('.test_content').find('.btn_play').removeClass('start');
				if(!is_primary){
					if(window.location.pathname != '/Competition/paper.html'){
						$('.btn_play').html('开始答题');
					}
				}else{
					$('.btn_play').removeClass('primary_btn_replay').addClass('primary_btn_play');
				}
				videoRes_count = 0;
				sen_click_arr[tid] = [];
				if(val == 1000 || val == 4000 || val == 5000){
					$('body').off("selectstart");
				}else{
					$('body').on("selectstart",function(){
						return false;
					});
				}
				if(val == 3000){
					MessageBox({
						content : '请先手动进行扣词，再点击"开始答题"！',
						buttons : [{
							text : '我知道了',
							click : function(){
								$(this).dialog('close');
							}
						}]
					});
					$(this).closest('.test_content').find('.question_container .question_content').handmade();
				}
				else if(val == 2000){
					$(this).closest('.p_operationBtn_container').siblings('.question_container').find('.question_content').kouci();
				}
				else if(val == 7000){
					$(this).closest('.p_operationBtn_container').siblings('.question_container').find('.question_content').buju();
				}
				else if(val == 6000){
					$(this).closest('.p_operationBtn_container').siblings('.question_container').find('.question_content').kouci(1);
				}
			}
		},
		'keyup' : {
			'input[type=text], textarea' : function(){
				if(is_primary){
					var id = $(this).closest('.test_content').attr('data-test-index');
					var done_flag = true;
					$(this).closest('.test_content').find('input[type=text]').each(function(i, n){
						if($(n).val() != ''){
							done_flag = false;
							return false;
						}
					});
					if(!done_flag){
						$('.p_answer_list ul li[data-index='+id+']').addClass('done');
					}else{
						$('.p_answer_list ul li[data-index='+id+']').removeClass('done');
					}
				}else{
					var id = $(this).closest('.question_container').attr('data-qid');
					var done_flag = true;
					$(this).closest('.question_container').find('input[type=text]').each(function(i, n){
						if($(n).val() != ''){
							done_flag = false;
							return false;
						}
					});
					if(!done_flag){
						$('.p_answer_list ul li[data-index='+id+']').addClass('done');
					}else{
						$('.p_answer_list ul li[data-index='+id+']').removeClass('done');
					}
				}
				var play_test_id = $('body').attr('data-play-id');
				var kind = $(this).closest('.test_content').attr('data-kind');
				var tid = $(this).closest('.test_content').attr('data-id');
				var itemid = $(this).closest('.test_content').attr('data-itemid');
				var mode = $('.p_operation_box #test-mode').attr('data-mode');
				var source = $('.p_paper_cnt').attr('data-source');
				var struct_type = $('.p_paper_cnt').attr('data-struct-type');
				if(!(mode == 'exam' 
					&& (
							(source == 'ts' || source == 'unit') 
							|| (source == 'hw' && (struct_type == 2 || struct_type == 3))
						)
					)
				){
					if(kind == 3 || (play_test_id && play_test_id != tid)){
						if(!is_primary){
							if(window.location.pathname != '/Competition/paper.html'){
								$('.btn_play').html('开始答题');
							}
						}else{
							$('.btn_play').removeClass('primary_btn_replay').addClass('primary_btn_play');
						}
						$('.btn_pause').attr('data-pause-status', 'play').html('暂停播放');
						$('.btn_play_audio').html('播放原音');
						$('.btn_play_question').html('播放问题');
						$('.btn_play_answer').html('播放答案');
						clearInterval(remainder_key);
						clearInterval(play_key);
						clearInterval(tape_remainder_key);
						$('.test_ctrl_info_area').hide();
						$('.trans_test_ctrl_info_area').removeClass('recording');
						TSP.audio.player.stop();
						$('body').attr('data-current-test-id' , '');
					}
				}
			}
		}
	});
	$.fn.extend({
		kouci : function(blank_p){
			var kou = $(this).attr('data-kou');
			if(is_primary){
				var qid = $(this).closest('.test_content').attr('data-test-index');
			}else{
				var qid = $(this).closest('.test_content').find('.question_container').attr('data-qid');
			}
			if(kou != 1){
				cur_html[qid] = $(this).html();
				$(this).attr('data-kou', 1);
			}else{
				$(this).html(cur_html[qid]);
			}
			var reg = /\b([a-zA-Z]+[\'\-]?[a-zA-Z]*)\b|(\d+)/g;
			var split_reg = /\b(?=[\,\.\?\!\s]\w+)/g;
			$(this).find('p span').each(function(i, n){
				var html  = $(n).html();
				var word_arr = html.split(split_reg);
				var r_idx = randomIndex(word_arr, blank_p);
				for(var i in r_idx){
					word_arr[r_idx[i]] = word_arr[r_idx[i]].replace(reg, '<span class="kouarea henxian" data-answer="$1$2">$1$2</span>');
				}
				var res = '';
				for(var j in word_arr){
					res += word_arr[j];
					if(j < word_arr.length - 1){
						res += ' ';
					}
				}
				$(n).html(res);
			});
		},
		buju : function(){
			var kou = $(this).attr('data-kou');
			if(is_primary){
				var qid = $(this).closest('.test_content').attr('data-test-index');
			}else{
				var qid = $(this).closest('.test_content').find('.question_container').attr('data-qid');
			}
			if(kou != 1){
				cur_html[qid] = $(this).html();
				$(this).attr('data-kou', 1);
			}else{
				$(this).html(cur_html[qid]);
			}
			if($(this).find('.kouarea').length){
				$(this).html(cur_html[qid]);
				$(this).buju();
				return;
			}
			var reg = /\b([a-zA-Z]+[\'\-]?[a-zA-Z]*)\b|(\d+)/g;
			$(this).find('p').each(function(i, n){
				if($(n).html() == ''){
					return true;
				}
				var r_idx = randomIndex($(n).find('span'));
				for(var j in r_idx){
					var text = $(n).find('span:eq(' + r_idx[j] + ')').text();
					$(n).find('span:eq(' + r_idx[j] + ')').html(text.replace(reg, '<span class="kouarea henxian" data-answer="$1$2">$1$2</span>'));
				}
			});
		},
		handmade : function(){
			var kou = $(this).attr('data-kou');
			if(is_primary){
				var qid = $(this).closest('.test_content').attr('data-test-index');
			}else{
				var qid = $(this).closest('.test_content').find('.question_container').attr('data-qid');
			}
			if(kou != 1){
				cur_html[qid] = $(this).html();
				$(this).attr('data-kou', 1);
			}else{
				$(this).html(cur_html[qid]);
			}
			var reg = /\b([a-zA-Z]+[\'\-]?[a-zA-Z]*)\b|(\d+)/g;
			$(this).find('p span').each(function(i, n){
				var html  = $(n).html();
				html = html.replace(reg, "<span class='hand_span'>$1$2</span>");
				$(n).html(html);
			});
		}
	});
});
function deepCopy(source) { 
	var result={};
	for (var key in source) {
		if(key == 'indexOf'){
			continue;
		}
		result[key] = typeof source[key]==='object'? deepCopy(source[key]): source[key];
	} 
	return result; 
}
function ds(obj){
	var id = $(obj).closest('.test_content.current_test').find('.question_container.current_question').attr('data-qid');
	$('.p_answer_list ul li[data-index='+id+']').addClass('done');
	$('.text_area .lddw_content .speak_sentence').removeClass('high_light_font');
	$(obj).next('.sentence_behind_space').remove();
	$(obj).after('<span class="sentence_behind_space"></span>');
	$(obj).addClass('high_light_font');
	$('.test_ctrl_info_area').show();
	$('.test_ctrl_info_area .percentage_gray').show();
	$('.test_ctrl_info_area .waveform_container').hide();
	$('.test_ctrl_info_area .play_mp3_area .remainder_time_area').hide();
	$('.test_ctrl_info_area .info_hint').html('播放音频').show();
	var file_name = $(obj).attr('data-mp3');
	var start_time = parseInt($(obj).attr('data-starttime'));
	var end_time = parseInt($(obj).attr('data-endtime'));
	TSP.audio.player.load(file_name);
	if(start_time == undefined || start_time === ''){
		start_time = TSP.audio.player.audioElem.getCurrentTime() * 1000;
	}
	if(end_time == undefined || end_time == ''){
		end_time = TSP.audio.player.audioElem.duration * 1000;
	}
	TSP.audio.player.audioElem.setCurrentTime(start_time/1000.0);
	TSP.audio.player.play();
	var total_time = end_time/1000.0 - start_time/1000.0;
	var flag = false;
	play_key = setInterval(function(){
		var remainder_time = TSP.audio.player.audioElem.getCurrentTime(1) - start_time/1000.0;
		$('.test_ctrl_info_area .play_mp3_area .percentage_bule').css('width', (remainder_time/total_time * 100)+'%');
		if(total_time - remainder_time <= 0){
			clearInterval(play_key);
			TSP.audio.player.stop();
			if(!flag){
				flag = true;
				ds_tape_video(total_time, obj);
			}
		}
	}, 4);
	TSP.audio.files.getAudio(file_name).onended = function(){
		$(".speak_sentence").removeClass('high_light_font');
		clearInterval(play_key);
		TSP.audio.player.stop();
		if(!flag){
			flag = true;
			ds_tape_video(total_time, obj);
		}
	};
}
function dd(obj){
	var id = $(obj).closest('.test_content.current_test').find('.question_container.current_question').attr('data-qid');
	$('.p_answer_list ul li[data-index='+id+']').addClass('done');
	$('.test_ctrl_info_area').show();
	$('.test_ctrl_info_area .percentage_gray').show();
	$('.test_ctrl_info_area .waveform_container').hide();
	$('.test_ctrl_info_area .play_mp3_area .remainder_time_area').hide();
	$('.test_ctrl_info_area .info_hint').html('播放音频').show();
	var file_name = $(obj).attr('data-mp3');
	var start_time = parseInt($(obj).attr('data-starttime'));
	var end_time = parseInt($(obj).attr('data-endtime'));
	TSP.audio.player.load(file_name);
	if(start_time == undefined || start_time === ''){
		start_time = TSP.audio.player.audioElem.getCurrentTime() * 1000;
	}
	if(end_time == undefined || end_time == ''){
		end_time = TSP.audio.player.audioElem.duration * 1000;
	}
	TSP.audio.player.audioElem.setCurrentTime(start_time/1000.0);
	TSP.audio.player.play();
	var total_time = end_time/1000.0 - start_time/1000.0;
	var flag = false;
	play_key = setInterval(function(){
		var remainder_time = TSP.audio.player.audioElem.getCurrentTime(1) - start_time/1000.0;
		$('.test_ctrl_info_area .play_mp3_area .percentage_bule').css('width', (remainder_time/total_time * 100)+'%');
		if(total_time - remainder_time <= 0){
			clearInterval(play_key);
			TSP.audio.player.stop();
			$('.test_ctrl_info_area').hide();
			$(obj).removeClass('high_light_font');
		}
	}, 4);
	TSP.audio.files.getAudio(file_name).onended = function(){
		clearInterval(play_key);
		TSP.audio.player.stop();
		$('.test_ctrl_info_area').hide();
		$(obj).removeClass('high_light_font');
	};
}
function ds_tape_video(total_time, v_obj){
	if(TSP.audio.recorder.inited){
		TSP.audio.recorder.stop();
	}
	$('.test_ctrl_info_area .percentage_gray').hide();
	$('.test_ctrl_info_area .waveform_container').show();
	var remainder_time = Math.ceil(total_time) * 1000 * 2;
	$('.test_ctrl_info_area .play_mp3_area .remainder_time_area').hide();
	 TSP.practice.waveForm.initWaveForm();
	var tid = $(v_obj).closest('.test_content').attr('data-id');
	if(videoResult[tid] == undefined || videoResult[tid] == null){
		videoResult[tid] = new Object();
		if ((!!window.ActiveXObject || "ActiveXObject" in window) || userAgent.indexOf("Edge") > -1) { 
			$("#AsrRecorder")[0].arrayEmpty(tid);
		}
	}
	if(zeroTypeA){ 
		var time_flag = $(v_obj).attr('data-time-flag');
		$(v_obj).removeClass('no_pass_font');
	}else{
		var time_flag = (new Date()).getTime();
	}
	$(v_obj).attr('data-time-flag', time_flag);
	$(v_obj).attr('data-time_flag', time_flag);
	videoResult[tid][time_flag] = new Object();
	TSP.audio.recorder.start(tid, 2, $(v_obj).attr('data-text'), time_flag, remainder_time);
	$('.test_ctrl_info_area .info_hint').html('初始化录音');
	tape_remainder_key = setInterval(function(){
		if(!TSP.audio.recorder.recording){
			return;
		}
		$('.test_ctrl_info_area .play_mp3_area .remainder_time_area').show();
		$('.test_ctrl_info_area .info_hint').html('录音');
		remainder_time = remainder_time - 100;
		$('.test_ctrl_info_area .play_mp3_area .remainder_time').html(Math.ceil(remainder_time/1000));
		if(remainder_time < 0){
			clearInterval(tape_remainder_key);
			if(TSP.audio.recorder.inited){
				TSP.audio.recorder.stop();
			}
			if(judge_speaking){
				$(v_obj).next('.sentence_behind_space').addClass('wait_background').text('');
			}else{
				$(v_obj).next('.sentence_behind_space').addClass('hidden_speaking_result').text('');
			}
			$(v_obj).removeClass('high_light_font');
			$('.test_ctrl_info_area').hide();
		}
	}, 100);
}
function tape_video(total_time, v_obj){
	$('.test_ctrl_info_area .percentage_gray').hide();
	$('.test_ctrl_info_area .waveform_container').show();
	var remainder_time = Math.ceil(total_time) * 1000 * 2;
	$('.test_ctrl_info_area .play_mp3_area .remainder_time_area').hide();
	$('.test_ctrl_info_area .play_mp3_area .remainder_time').html('');
	 TSP.practice.waveForm.initWaveForm();
	var tid = $(v_obj).closest('.test_content.current_test').attr('data-id');
	if(videoResult[tid] == undefined || videoResult[tid] == null){
		videoResult[tid] = new Object();
		if ((!!window.ActiveXObject || "ActiveXObject" in window) || userAgent.indexOf("Edge") > -1) { 
			$("#AsrRecorder")[0].arrayEmpty(tid);
		}
	}
	var time_flag = (new Date()).getTime();
	$(v_obj).attr('data-time-flag', time_flag);
	videoResult[tid][time_flag] = new Object();
	TSP.audio.recorder.start(tid, 2, $(v_obj).attr('data-text'), time_flag, remainder_time);
	tape_remainder_key = setInterval(function(){
		if(!TSP.audio.recorder.recording){
			return;
		}
		$('.test_ctrl_info_area .play_mp3_area .remainder_time_area').show();
		remainder_time = remainder_time - 100;
		$('.test_ctrl_info_area .play_mp3_area .remainder_time').html(Math.ceil(remainder_time/1000));
		if(remainder_time < 0){
			clearInterval(tape_remainder_key);
			if(TSP.audio.recorder.inited){
				TSP.audio.recorder.stop();
			}
			if(judge_speaking){
				$(v_obj).next('.sentence_behind_space').addClass('wait_background').text('');
			}else{
				$(v_obj).next('.sentence_behind_space').addClass('hidden_speaking_result').text('');
			}
			$(v_obj).closest('.test_content.current_content').find('.speak_sentence').removeClass('high_light_font');
			gd(v_obj);
		}
	}, 100);
}
function initSpeakArea(){
	TSP.audio.player.stop();
	clearInterval(play_key);
	clearInterval(tape_remainder_key);
	$('.test_ctrl_info_area').hide();
	$('.test_content.current .speak_sentence').removeClass('enable').addClass('enable');
	$('.ctrl_info_span .score').hide();
}
function randomIndex(ar, blank_p){
	if(blank_p != 0){
		blank_p = blank_p || 0.2;
	}
	blank_p = 1 - blank_p;
	if(blank_p < 0 || blank_p > 1){
		throw Error('参数blank_p介于0-1之间');
	}
	var idxArr = new Array();	
	for(var i = 0; i < ar.length; i++){
		idxArr.push(i);
	}
	var temp = new Array();
	var blank_num = Math.floor(ar.length * blank_p);	
	while(idxArr.length > blank_num){
		var r = Math.floor(Math.random() * idxArr.length);
		temp.push(idxArr[r]);	
		idxArr.splice(r, 1);	
	}
	temp.sort(function(a, b){
		if(a == b){
			return 0;
		}
		return a > b ? 1 : -1;
	});
	return temp;
}
function gd(obj){
	if(TSP.audio.recorder.inited){
		TSP.audio.recorder.stop();
	}
	var v_obj = $(obj).closest('.test_content').find('.speak_sentence.enable:first');
	if(v_obj == undefined || v_obj.length == 0){
		clearInterval(play_key);
		clearInterval(tape_remainder_key);
		if(TSP.audio.recorder.inited){
			TSP.audio.recorder.stop();
		}
		$('.test_ctrl_info_area').hide();
		setTimeout(function(){
			$('.test_content.current_test').find('.speak_sentence').removeClass('enable').addClass('enable');
		}, 200);
		$('.test_content.current_test').find('.speak_sentence').removeClass('high_light_font');
		return false;
	}
	$(v_obj).next('.sentence_behind_space').remove();
	$(v_obj).after('<span class="sentence_behind_space"></span>');
	$(v_obj).closest('.test_content.current_test').find('.speak_sentence').removeClass('high_light_font');
	$(v_obj).addClass('high_light_font');
	$('.test_ctrl_info_area').show();
	$('.test_ctrl_info_area .percentage_gray').show();
	$('.test_ctrl_info_area .waveform_container').hide();
	$('.test_ctrl_info_area .play_mp3_area .remainder_time_area').hide();
	$('.test_ctrl_info_area .info_hint').html('播放音频');
	tape_remainder_key = setInterval(function(){
		if(!TSP.audio.recorder.recording){
			return;
		}
		$('.test_ctrl_info_area .play_mp3_area .remainder_time_area').show();
		$('.test_ctrl_info_area .info_hint').html('录音');
		remainder_time = remainder_time - 100;
		$('.test_ctrl_info_area .play_mp3_area .remainder_time').html(Math.ceil(remainder_time/1000));
		if(remainder_time < 0){
			clearInterval(tape_remainder_key);
			if(TSP.audio.recorder.inited){
				TSP.audio.recorder.stop();
			}
			if(judge_speaking){
				$(v_obj).next('.sentence_behind_space').addClass('wait_background').text('');
			}else{
				$(v_obj).next('.sentence_behind_space').addClass('hidden_speaking_result').text('');
			}
			$(v_obj).removeClass('high_light_font');
			$('.test_ctrl_info_area').hide();
		}
	}, 100);
	var file_name = $(v_obj).attr('data-mp3');
	var start_time = parseInt($(v_obj).attr('data-starttime'));
	var end_time = parseInt($(v_obj).attr('data-endtime'));
	$(v_obj).removeClass('enable');
	TSP.audio.player.load(file_name);
	if(start_time == undefined || start_time === ''){
		start_time = TSP.audio.player.audioElem.getCurrentTime() * 1000;
	}
	if(end_time == undefined || end_time == ''){
		end_time = TSP.audio.player.audioElem.duration * 1000;
	}
	TSP.audio.player.audioElem.setCurrentTime(start_time/1000.0);
	TSP.audio.player.play();
	var total_time = end_time/1000.0 - start_time/1000.0;
	var flag = false;
	play_key = setInterval(function(){
		var remainder_time = TSP.audio.player.audioElem.getCurrentTime() - start_time/1000.0;
		$('.test_ctrl_info_area .play_mp3_area .percentage_bule').css('width', (remainder_time/total_time * 100)+'%');
		if(total_time - remainder_time <= 0){
			clearInterval(play_key);
			TSP.audio.player.stop();
			if(!flag){
				tape_video(total_time, v_obj);
				flag = true;
			}
		}
	}, 4);
	TSP.audio.files.getAudio(file_name).onended = function(){
		clearInterval(play_key);
		TSP.audio.player.stop();
		if(!flag){
			tape_video(total_time, v_obj);
			flag = true;
		}
	};
}
function submitAnswerFunc(){
	if($('.test_content[data-kind="2"]') != undefined && $('.test_content[data-kind="2"]').length > 0){
		if(videoResult != undefined && videoResult != null){
			$.each(videoResult, function(tid, objs){
				if(objs != undefined && objs != null){
					$.each(objs, function(time_flag, obj){
						if(obj['result'] == undefined || obj['result']['count'] == undefined){
							TSP.practice.setResult(time_flag, {'count' : 0, 'mp3' : '', 'score' : 0}, tid);
						}
					});
				}
			});
		}
	}
}
Math.formatFloat = function (f) {
    var m = Math.pow(10, 2);
    return Math.round(f * m, 10) / m;
}
function isZeroDialog(){
	clearInterval(remainder_key);
	clearInterval(play_key);
	clearInterval(tape_remainder_key);
	$('.test_ctrl_info_area').hide();
	$('.trans_test_ctrl_info_area').removeClass('recording');
	TSP.audio.player.stop();
	if(TSP.audio.recorder.inited){
		TSP.audio.recorder.stop();
	}
	if(videoResult != undefined && JSON.stringify(videoResult) != "{}"){
		var isNeedZeroPromat = false;
		$.each(videoResult, function(tid, objs){
			if($('.test_content[data-id="'+tid+'"]').attr('data-type') == 1400 
					&& $('.test_content[data-id="'+tid+'"]').attr('data-subtype') != 1428
					&& $('.test_content[data-id="'+tid+'"]').attr('data-subtype') != 1438){
				var zeroNum = 0;
				if(objs != undefined){
					$.each(objs, function(i, obj){
						if(obj['result'] == undefined || obj['result']['count'] == undefined){
						}else{
							if(obj['result']['score'] < 60){
								zeroNum++;
							}
						}
					});
				}
				if(zeroNum > 0){
					isNeedZeroPromat = true;
				}
			}
		});
		if(!isDialogShow && isNeedZeroPromat && $('.zeroTips').length){
			isDialogShow = true;
			zeroTypeC = true;
			$('.zeroTips').show();
			$('.zeroTips').dialog({
				width : 630,
				height: 300,
				dialogClass: 'small-dialog green-dialog',
				modal : true,
				resizable : false,
				buttons: {
					'继续提交': function(){
						$(this).dialog('close');
						zeroTypeC = false;
						MessageBox({
							content : '音频已全部识别完成，是否提交答案？',
							buttons : [{
								text : '不提交',
								click : function(){
									$(this).dialog('close');
								}
							},{
								text : '提交',
								click : function(){
									$(this).dialog('close');
									if(is_primary){
			                    		TSP.practice.primary.question.submitAnswer();
			                    	}else{
			                    		TSP.practice.process.submitAnswer();
			                    	}
									isDialogShow =  false;
								}
							}]
		                });
					},
					'低分强化':function(){
						$(this).dialog('close');
						isDialogShow =  true;
						zeroTypeC = true;
						zeroTypeA = true;
						$('.btn_play').removeClass('disabled');
						$('.btn_play').html('开始答题');
						$('.main_content_box').attr('data-wait-status', 0);
		    	    	$('.p_tests_area input').removeAttr('disabled');
		    	    	$('.p_tests_area textarea').removeAttr('disabled');
		    	    	$('.p_tests_area select').removeAttr('disabled');
					}
				},
				close: function(event, ui) {
					$(this).dialog('close');
					isDialogShow =  true;
					zeroTypeC = true;
					zeroTypeA = true;
					$('.btn_play').removeClass('disabled');
					$('.btn_play').html('开始答题');
					$('.main_content_box').attr('data-wait-status', 0);
	    	    	$('.p_tests_area input').removeAttr('disabled');
	    	    	$('.p_tests_area textarea').removeAttr('disabled');
	    	    	$('.p_tests_area select').removeAttr('disabled');
	    	    	TSP.practice.testTime.calculateTime(1);
				}
			});
		}else{
			if(is_primary){
	    		TSP.practice.primary.question.submitAnswer();
	    	}else{
	    		TSP.practice.process.submitAnswer();
	    	}
		}
	}else{
		if(is_primary){
    		TSP.practice.primary.question.submitAnswer();
    	}else{
    		TSP.practice.process.submitAnswer();
    	}
	}
}