/**
 * @author Zhengjiabao <1426484228@qq.com>
 * @file js/test.js
 */

var Infomation={
    "author":"Zhengjiabao <1426484228@qq.com>",
    "file":"js/test.js",
    "version":"1.0.2"
}

class testmaker {
    constructor() {
        this.createTestContent()
        this.testnum=0;
        this.initpage()
        this.mode="Listed"
    }
    check_mobile(){
        if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
            document.getElementsByTagName("html")[0].style.fontSize="3rem"
            document.getElementById("question").style.fontSize="1.25rem"
            document.getElementById("answerholder").style.fontSize="1.25rem"
            document.getElementsByName("icon").forEach((element)=>{
                element.setAttribute("width","70rem")
                element.setAttribute("height","70rem")
            })
        }
    }
    hide_answers(){
        document.getElementById("answerholder").innerHTML="";
    }
    put_into_page_question(){
        this.quesIndex=rand(0,this.TestContent.data[this.testnum].question.length)
        $("#question").text(this.TestContent.data[this.testnum].question[this.quesIndex])
        $("#quesNum").text(this.testnum+1)
        this.reset_unfamiliar_button()
    }
    reset_unfamiliar_button(){
        if(JSON.parse(localStorage.getItem("zitem__Politics__unfamiliar_list"))
        [this.TestContent.data[this.testnum].URL].indexOf(this.TestContent["data"][this.testnum]["index"])!=-1){
            document.getElementById("insert_unfamiliar_list").style.display="none";    
            document.getElementById("remove_unfamiliar_list").style.display="inline-block";    
        }else{
            document.getElementById("remove_unfamiliar_list").style.display="none";
            document.getElementById("insert_unfamiliar_list").style.display="inline-block";    
        }
    }
    random_question_num(){
        this.testnum=rand(0,this.TestContent.data.length)
        this.put_into_page_question();
        this.hide_answers()
    }
    next_question_num(){
        if( this.mode=="Listed"){
            if(this.testnum==this.TestContent.data.length-1){
                this.testnum=0;
            }else{
                this.testnum++;
            }
        }else{
            if(this.random_list_index==this.TestContent.data.length-1){
                this.random_list_index=0;
            }else{
                this.random_list_index++;
            }
            this.testnum=this.random_list[this.random_list_index];
        }
        this.put_into_page_question()
        this.hide_answers()
    }
    prev_question_num(){
        if( this.mode=="Listed"){
            if(this.testnum==0){
                this.testnum=this.TestContent.data.length-1;
            }else{
                this.testnum--;
            }
        }else{
            if(this.random_list_index==0){
                this.random_list_index=this.TestContent.data.length-1;
            }else{
                this.random_list_index--;
            }
            this.testnum=this.random_list[this.random_list_index];
        }
        this.put_into_page_question()
        this.hide_answers()
    }
    show_answers(){
        this.hide_answers()
        for (let _index=0;_index<this.TestContent.data[this.testnum].answer.length;_index++){
             console.log(typeof(this.TestContent.data[this.testnum].answer[_index]))
            if(typeof(this.TestContent.data[this.testnum].answer[_index])=="object"){
            document.getElementById("answerholder").insertAdjacentHTML("beforeend",
            `<span class='shown_ans'> ${this.TestContent.data[this.testnum].answer[_index].join("")}</span><br/>`
        )}else{
            document.getElementById("answerholder").insertAdjacentHTML("beforeend",
            `<span class='shown_ans'> ${this.TestContent.data[this.testnum].answer[_index]}</span><br/>`
        )
        }
        }
    }
    toggle_answers(){
        
        if(this.__answer_is_hidden){
            this.show_answers()
            document.getElementById("image_hideans").style.display="none"
            document.getElementById("image_showans").style.display="block"
        }else{
            this.hide_answers()
            document.getElementById("image_hideans").style.display="block"
            document.getElementById("image_showans").style.display="none"
        }
        this.__answer_is_hidden=!this.__answer_is_hidden
    }

    show_answer_constractor(){
        this.hide_answers()
        for (let _index=0;_index<this.TestContent.data[this.testnum].answer.length;_index++){
            let _tmp=this.TestContent.data[this.testnum].answer[_index]
            console.log(_tmp)
            if(_tmp=="")continue;
            console.log(typeof(_tmp))
            if(typeof(_tmp)=="object"){
                for(let __index=0;__index<_tmp.length;__index++){
                    if(/（|）|,|。|：|“|”|‘|’|；|？|！|\(|\)|\d/.test(_tmp[__index])){
                        document.getElementById("answerholder").insertAdjacentHTML("beforeend",`<span class='shown_ans'>${_tmp[__index]}</span>` )
                    }else{
                        document.getElementById("answerholder").insertAdjacentHTML("beforeend",`<span onclick='javascript:page.show_answer_by_cons(this)' class='hidden_ans'>${_tmp[__index]}</span>` )
                    }
                }
            }else{
                let tmp_string = this.__showconst__create_constring(_tmp);
                document.getElementById("answerholder").insertAdjacentHTML("beforeend",tmp_string+"</span>")

            }
            document.getElementById("answerholder").insertAdjacentHTML("beforeend",`<br/>`)
            
        }
        
    }
    __showconst__create_constring(_tmp) {
        let flag=true;//true:hiddenword
        if (/、|（|）|，|,|。|：|“|”|‘|’|；|？|！|\(|\)|\d/.test(_tmp[0])){
            var tmp_string="<span>" ;
        }else{
            var tmp_string=`<span onclick="javascript:page.show_answer_by_cons(this)" class='hidden_ans'>` ;
        }
        for (let charindex = 0; charindex < _tmp.length; charindex++) {
            if (/、|（|）|，|,|。|：|“|”|‘|’|；|？|！|\(|\)|\d/.test(_tmp[charindex])) {
                if(flag){
                    tmp_string=tmp_string+`</span><span>`
                    flag=!flag
                }
                tmp_string=tmp_string+_tmp[charindex]
            } else {
                if(!flag){
                    tmp_string=tmp_string+`</span><span onclick="javascript:page.show_answer_by_cons(this)" class='hidden_ans'>`
                    flag=!flag
                }
                tmp_string=tmp_string+_tmp[charindex]
            }
            console.log(tmp_string);
            console.log(flag);
            console.log(_tmp[charindex]);
        }
        return tmp_string+"</span>";
    }

    show_answer_by_cons(dom){
        dom.classList.add("shown_ans")
        dom.classList.remove("hidden_ans")
    }
    insert_unfamiliar_list(){
        var i=JSON.parse(localStorage.getItem("zitem__Politics__unfamiliar_list")) || {}
        if(i[this.TestContent.data[this.testnum].URL]==null){
            i[this.TestContent.data[this.testnum].URL]=[]
        }
        i[this.TestContent.data[this.testnum].URL].pushNoRepeat(this.TestContent["data"][this.testnum]["index"]);
        localStorage.setItem("zitem__Politics__unfamiliar_list",
        JSON.stringify(i)
        )
        document.getElementById("insert_unfamiliar_list").style.display="none";    
        document.getElementById("remove_unfamiliar_list").style.display="inline-block";
    }
    remove_unfamiliar_list(){
        var i=JSON.parse(localStorage.getItem("zitem__Politics__unfamiliar_list")) || {}
        if(i[this.TestContent.data[this.testnum].URL]==null){
            i[this.TestContent.data[this.testnum].URL]=[]
        }
        i[this.TestContent.data[this.testnum].URL].splice(i[this.TestContent.data[this.testnum].URL].indexOf(this.TestContent["data"][this.testnum]["index"]),1);
        localStorage.setItem("zitem__Politics__unfamiliar_list",
        JSON.stringify(i)
        )
        document.getElementById("remove_unfamiliar_list").style.display="none";
        document.getElementById("insert_unfamiliar_list").style.display="inline-block";
    }
    Create_a_random_list(){
        this.random_list=[]
        for (var i = 0; i < this.TestContent.data.length; i++) {
            this.random_list[i] = i;
        }
        this.random_list.sort(function() {
            return 0.5 - Math.random();
        });
        this.random_list.sort(function() {
            return 0.5 - Math.random();
        });
        this.random_list_index=rand(0,this.random_list.length)
    }
    toggle_test_mode(){
        if(this.mode=="Listed"){
            document.getElementById("testmode_bottom").innerText="随机"
            this.Create_a_random_list()
            this.mode="Random"
        }else{
            document.getElementById("testmode_bottom").innerText="顺序"
            this.mode="Listed"
        }
        this.next_question_num()
    }
    initpage(){
        this.check_mobile();
        this.put_into_page_question();
        this.__answer_is_hidden=true
        document.getElementById("nesttest_bottom").onclick=()=>{this.next_question_num()}
        document.getElementById("prevtest_bottom").onclick=()=>{this.prev_question_num()}
        document.getElementById("testmode_bottom").onclick=()=>{this.toggle_test_mode()}
        document.getElementById("showanscons_bottom").onclick=()=>{this.show_answer_constractor()}
        document.getElementById("toggleans_bottom").onclick=()=>{this.toggle_answers()}
        document.getElementById("insert_unfamiliar_list").onclick=()=>{this.insert_unfamiliar_list()}
        document.getElementById("remove_unfamiliar_list").onclick=()=>{this.remove_unfamiliar_list()}
    }
    createTestContent(){
        this.TestContent={"data":[]}
        for (const url in test_source) {
            if (test_source.hasOwnProperty(url)) {
                const element = test_source[url];
                console.log(demand_from);
                if(element==true){
                    for (let index = 0; index < demand_from[url]["data"].length; index++) {
                        this.__createTestContent__insertContent(url, index);
                    }
                }else{
                    for (let index = 0; index < element.length; index++) {
                        this.__createTestContent__insertContent(url, element[index]);
                    }
                }
            }
        }
    }

    __createTestContent__insertContent(url, index) {
        const tmp = demand_from[url]["data"][index];
        tmp["URL"] = url;
        tmp["index"] = index;
        tmp["cut"] = demand_from[url]["cut"];
        this.TestContent.data.push(tmp);
    }
}

var page=new testmaker();


/*
zitem__Politics__test_source
{
    "URL":true//全部
         |[0,1,2,3]
}

TestContent
{
    data:[
        {
            "URL":"xxx"
            index:5
            question:".."
            answer:".."
            cut:true/false
        }
    ]
}

zitem__Politics__unfamiliar_list should be like
{
    "URL":[1,1,4,5,1,4]
}
*/



