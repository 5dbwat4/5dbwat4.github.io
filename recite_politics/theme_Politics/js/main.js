/*Copyright Zhengjiabao*/
function rand(from,to){
    return Math.round(Math.random()*(to-from-1))+from
}
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
         }
        if (c.indexOf(name)  == 0) {
            return c.substring(name.length, c.length);
         }
    }
    return "";
}
class testmaker {
    constructor(testdescript) {
        this.testdescript = testdescript;
        this.testnum=0;
        this.initpage()
    }
    put_into_page_question(){
        this.quesIndex=rand(0,this.testdescript.data[this.testnum].question.length)
        $("#question").text(this.testdescript.data[this.testnum].question[this.quesIndex])
        $("#quesNum").text(this.testnum+1)
    }
    random_question_num(){
        this.testnum=rand(0,this.testdescript.data.length)
        this.put_into_page_question();
        this.hide_answers()

    }
    next_question_num(){
        if(this.testnum>=this.testdescript.data.length-1){
            this.testnum=0;
        }else{
            this.testnum++;
        }
        this.put_into_page_question()
        this.hide_answers()
    }
    show_answers(){
        this.hide_answers()
        for (let _index=0;_index<this.testdescript.data[this.testnum].answer.length;_index++){
            console.log(document.getElementById("answerholder"));
            document.getElementById("answerholder").insertAdjacentHTML("beforeend",`<span class='shown_ans'> ${this.testdescript.data[this.testnum].answer[_index]}</span><br/>`)
        }
    }
    hide_answers(){
        document.getElementById("answerholder").innerHTML=""
    }
    show_answer_constractor(){
        this.hide_answers()
        for (let _index=0;_index<this.testdescript.data[this.testnum].answer.length;_index++){
            document.getElementById("answerholder").insertAdjacentHTML("beforeend",
            `<span onclick='javascript:page.show_answer_by_cons(this)' class='hidden_ans'> ${this.testdescript.data[this.testnum].answer[_index]}</span><br/>`)
        }
        
    }
    show_answer_by_cons(dom){
        dom.classList.add("shown_ans")
        dom.classList.remove("hidden_ans")
    }
    insert_quesed(){
        if(getCookie(this.testdescript.hash).indexOf(String(this.testnum))<0){
            setCookie(this.testdescript.hash,","+getCookie(this.testdescript.hash)+","+this.testnum+",",365)
        }
    }
    initpage(){
        $("#test_title").text(this.testdescript.title)
        this.put_into_page_question();
        document.getElementById("nesttest_bottom").click=this.next_question_num
        document.getElementById("randomtest_bottom").click=this.random_question_num
        document.getElementById("showanscons_bottom").click=this.show_answer_constractor
        document.getElementById("showans_bottom").click=this.show_answers
        document.getElementById("hideans_bottom").click=this.hide_answers
        document.getElementById("insert_quesed").click=this.insert_quesed
    }
}


var page=new testmaker(testma)