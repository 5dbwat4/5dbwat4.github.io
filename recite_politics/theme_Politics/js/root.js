/**
 * @author Zhengjiabao <1426484228@qq.com>
 * @file js/root.js
 */

class RootMain{
    constructor() {
        this.check_mobile();
        this.trans_list=[]
        this.insert_con_list()
        document.getElementById("insert_submit").onclick=()=>{this.submitinsert();}
        this.chosen_qs=[]
        this.show_test_chosen=false
        document.getElementById("test_chosen").onclick=()=>{this.begin_test_chosen()}
        document.getElementById("reset").onclick=()=>{this.reset_data()}
    }
    reset_data(){
        localStorage.clear();
        window.location.reload()
    }
    check_mobile(){
        if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
            document.getElementsByTagName("html")[0].style.fontSize="3rem"
        }
    }
    submitinsert(){
        let rad=JSON.parse(localStorage.getItem("zitem__Politics__demand"))
        document.getElementById("InsertSubmit_error").innerText=""
        if(rad[document.getElementById("insert_url").value]!=undefined){
            document.getElementById("InsertSubmit_error").innerText="此网址已存在"
            return
        }
        rad[document.getElementById("insert_url").value]=false
        console.log(rad);
        localStorage.setItem("zitem__Politics__demand",JSON.stringify(rad))
        this.globle_index++;
        document.getElementById(`con_list`).insertAdjacentHTML("beforeend",
        `
        <div id="title-holder-${this.globle_index}" class="question_holder">
       <p class="small_button_root" id="title-${this.globle_index}" onclick="page.test(${this.globle_index})"></p>
        <p class="small_button" id="download-${this.globle_index}" onclick="page.download(${this.globle_index})">下载</p>
       </div>
       `)
       document.getElementById(`title-${this.globle_index}`).innerText=document.getElementById("insert_url").value
       this.trans_list[this.globle_index]=document.getElementById("insert_url").value
    }
    download(index){
        $.getJSON(this.trans_list[index],(data)=>{demand_from[this.trans_list[index]]=data;}).fail(()=>{alert(`Failed when downloading "${this.trans_list[index]}".Aborting`)})
        localStorage.setItem("zitem__Politics__demand",JSON.stringify(demand_from))
        document.getElementById(`title-holder-${this.globle_index}`).innerHTML=
 `
 <div id="title-holder-${this.globle_index}" class="question_holder">
<p class="small_button_root" id="title-${this.globle_index}" onclick="page.test(${this.globle_index})"></p>
 <p class="small_button" id="delete_unfamiliar-${this.globle_index}" onclick="page.renew(${this.globle_index})">更新</p>
 <p class="small_button" id="show_detail-${this.globle_index}" onclick="page.see_detail(${this.globle_index})">查看内容</p>
<div id="content-holder-${this.globle_index}" style="display:none;"><hr/></div>
</div>
`
        document.getElementById(`title-${this.globle_index}`).innerText=demand_from[this.trans_list[index]].title

    }
    
    select_all(index,number){
        this.chosen_qs[index]=this.chosen_qs[index] || []
        for (let i = 0; i < number; i++) {
            if(this.chosen_qs[index].indexOf(i)==-1){this.choose_test(index,i)}
        }
        
    }
    insert_con_list(){
        this.globle_index=0;
        for (const key in demand_from) {
            if (demand_from.hasOwnProperty(key)) {
                 try{
                let element = demand_from[key];
                this.trans_list[this.globle_index]=key;
                document.getElementById(`con_list`).insertAdjacentHTML("beforeend",
 `
 <div id="title-holder-${this.globle_index}" class="question_holder">
<p class="small_button_root" id="title-${this.globle_index}" onclick="page.test(${this.globle_index})"></p>
<p class="small_button" id="select_all-${this.globle_index}" onclick="page.select_all(${this.globle_index},${element.data.length})">全选</p>
 <p class="small_button" id="delete_unfamiliar-${this.globle_index}" onclick="page.renew(${this.globle_index})">更新</p>
 <p class="small_button" id="show_detail-${this.globle_index}" onclick="page.see_detail(${this.globle_index})">查看内容</p>
<div id="content-holder-${this.globle_index}" style="display:none;"><hr/></div>
</div>
`
                )
                document.getElementById(`title-${this.globle_index}`).innerText=element.title
                
                element=element.data
                console.log(element);
                
                for (let i = 0; i < element.length; i++) {
                    document.getElementById(`content-holder-${this.globle_index}`).insertAdjacentHTML("beforeend",
`
<div id="question-holder-${this.globle_index}-${i}" class="question_holder">
<p class="sameline" id="question-${this.globle_index}-${i}"></p>
<p class="small_button" id="toggle-answer-${this.globle_index}-${i}" onclick="page.toggle_answer(${this.globle_index},${i})">展开答案</p>
<p class="small_button" id="choose_test-${this.globle_index}-${i}" onclick="page.choose_test(${this.globle_index},${i})">选中此题</p>
<p id="answer-${this.globle_index}-${i}" style="display:none;"></p>
</div>
`
                    )
                    document.getElementById(`question-${this.globle_index}-${i}`).innerHTML=element[i].question[0]
                    element[i].answer.forEach((element_,index) => {
                        if(typeof(element_)=="object"){element[i].answer[index]=element_.join("")}
                        else{element[i].answer[index]=element_}});
                    document.getElementById(`answer-${this.globle_index}-${i}`).innerHTML=element[i].answer.join("</br>")
                }

                this.globle_index++;
             }catch(e){}
            }
            
        }
        if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
            for (let index = 0; index < document.getElementsByClassName("question_holder").length; index++) {
                const element = document.getElementsByClassName("question_holder")[index];
                element.style.margin="50px 0px"
            }
        }
    }
    see_detail(index){
        if(document.getElementById(`content-holder-${index}`).style.display=="none"){
            document.getElementById(`content-holder-${index}`).style.display="block"
            document.getElementById(`show_detail-${index}`).innerText="隐藏内容"
        }else{
            document.getElementById(`content-holder-${index}`).style.display="none"
            document.getElementById(`show_detail-${index}`).innerText="查看内容"
        }
    }
    test(index){
        let source={};
        source[this.trans_list[index]]=true;
        localStorage.setItem("zitem__Politics__test_source",JSON.stringify(source))
        window.location.assign("./test/")
    }
    renew(index){
                    $.getJSON(this.trans_list[index],(data)=>{
                        demand_from[this.trans_list[index]]=data;
                    })
        localStorage.setItem("zitem__Politics__demand",JSON.stringify(demand_from))
    }
    choose_test(index,i){
        this.chosen_qs[index]=this.chosen_qs[index] || []
        if(this.chosen_qs[index].indexOf(i)==-1){
            this.chosen_qs[index].push(i);
            document.getElementById(`choose_test-${index}-${i}`).innerText="取消选中"
        }else{
            this.chosen_qs[index].splice(this.chosen_qs[index].indexOf(i),1);
            document.getElementById(`choose_test-${index}-${i}`).innerText="选中此题"
        }
        if(document.getElementById("test_chosen").style.display=="none"){
            document.getElementById("test_chosen").style.display="inline-block"
        }
    }

    begin_test_chosen(){
        if(document.getElementById("test_chosen_error").style.display=="block"){
            document.getElementById("test_chosen_error").style.display="none";
        }
        let source={};
        let ii=0;
        for (let index = 0; index < this.chosen_qs.length; index++) {
            const list = this.chosen_qs[index];
            source[this.trans_list[index]]=[];
            for (let i = 0; i < list.length; i++) {
                source[this.trans_list[index]].push(list[i]);
                ii++;
            }
        }
        if(ii==0){
            document.getElementById("test_chosen_error").style.display="inline-block";
            return;
        }else{
            localStorage.setItem("zitem__Politics__test_source",JSON.stringify(source))
            window.location.assign("./test/")
        }
        
    }
    toggle_answer(index,i){
        if(document.getElementById(`answer-${index}-${i}`).style.display=="none"){
            document.getElementById(`answer-${index}-${i}`).style.display="block"
            document.getElementById(`toggle-answer-${index}-${i}`).innerText="收起答案"
        }else{
            document.getElementById(`answer-${index}-${i}`).style.display="none"
            document.getElementById(`toggle-answer-${index}-${i}`).innerText="展开答案"
        }
    }
}
const page = new RootMain();
