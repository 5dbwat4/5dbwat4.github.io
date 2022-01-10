class unfamiliar {
    constructor() {
        this.check_mobile();
        this.test()
        window.onunload=()=>{this.enpretty_unfamiliar_list();}
        this.chosen_qs=[];
        this.trans_unfamiliar_list_of_localstr()
        document.getElementById("test_chosen").onclick=()=>{this.begin_test_chosen()}
    }

    check_mobile(){
        if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
            document.getElementsByTagName("html")[0].style.fontSize="3rem"
        }
    }

    test(){
        console.log("Unfamiliar -ing");
    }

    enpretty_unfamiliar_list(){
        for (let index = 0; index < this.trans_list.length; index++) {
            const key = this.trans_list[index];
            for (let i = 0; i < this.unfamiliar_list[key].length; i++) {
                if(this.unfamiliar_list[key][i]==-1){
                    this.unfamiliar_list[key].splice(i,1);
                    i--;
                }                
            }
        }
        localStorage.setItem("zitem__Politics__unfamiliar_list",JSON.stringify(this.unfamiliar_list))
    }

    trans_unfamiliar_list_of_localstr(){
        this.unfamiliar_list=JSON.parse(localStorage.getItem("zitem__Politics__unfamiliar_list"))
        this.trans_list=[];
        var index=0;
        for (const key in this.unfamiliar_list) {
            if (this.unfamiliar_list.hasOwnProperty(key)) {
                const element = this.unfamiliar_list[key];
                console.log(`element=${element}`);
                console.log(`key=${key}`);

                this.chosen_qs[index]=[]
                
                this.trans_list[index]=key
                
                document.getElementById("main").insertAdjacentHTML("beforeend",
`
<div>
    <div id="title-${index}"><span id="title_content-${index}" class="title_content"></span>
    <span class="small_button" id="toggle-${index}" onclick="page.toggle_content(${index})">收起</span></div>
    
    <div id="content-${index}" style="display:block;"><hr/></div>
</div>
`
                )
                document.getElementById(`title_content-${index}`).innerHTML=demand_from[key].title
                for (let i = 0; i < element.length; i++) {
                    if(i==-1)continue;
                    console.log(`i=${i}`);
                    document.getElementById(`content-${index}`).insertAdjacentHTML("beforeend",
`
<div id="question-holder-${index}-${i}" class="question_holder">
<p class="sameline" id="question-${index}-${i}"></p>
<p class="small_button" id="toggle-answer-${index}-${i}" onclick="page.toggle_answer(${index},${i})">展开答案</p>
<p class="small_button" id="delete_unfamiliar-${index}-${i}" onclick="page.delete_unfamiliar(${index},${i})">删除此题</p>
<p class="small_button" id="choose_test-${index}-${i}" onclick="page.choose_test(${index},${i},${element[i]})">选中此题</p>
<p id="answer-${index}-${i}" style="display:none;"></p>
</div>
`
                    )
                    console.log(demand_from[key]);
                    
                    document.getElementById(`question-${index}-${i}`).innerHTML=demand_from[key].data[this.unfamiliar_list[key][i]].question[0]
                    demand_from[key].data[this.unfamiliar_list[key][i]].answer.forEach((element,index) => {
                        if(typeof(element)=="object"){demand_from[key].data[this.unfamiliar_list[key][i]].answer[index]=element.join("")}
                        else{demand_from[key].data[this.unfamiliar_list[key][i]].answer[index]=element}
                        }
                        );
                    document.getElementById(`answer-${index}-${i}`).innerHTML=demand_from[key].data[this.unfamiliar_list[key][i]].answer.join("</br>")
                }
                index++;
            }
        }
    }

    choose_test(index,i,ele){
        if(this.chosen_qs[index].indexOf(ele)==-1){
            this.chosen_qs[index].push(ele);
            document.getElementById(`choose_test-${index}-${i}`).innerText="取消选中"
        }else{
            this.chosen_qs[index].splice(this.chosen_qs[index].indexOf(ele),1);
            document.getElementById(`choose_test-${index}-${i}`).innerText="选中此题"
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
            document.getElementById("test_chosen_error").style.display="block";
            return;
        }else{
            localStorage.setItem("zitem__Politics__test_source",JSON.stringify(source))
            window.location.assign("../test/")
        }
        
    }

    delete_unfamiliar(index,i){
        this.unfamiliar_list[this.trans_list[index]][i]=-1;
        localStorage.setItem("zitem__Politics__unfamiliar_list",JSON.stringify(this.unfamiliar_list))
        document.getElementById(`question-holder-${index}-${i}`).style.display="none";
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
    toggle_content(index){
        if(document.getElementById(`content-${index}`).style.display=="none"){
            document.getElementById(`content-${index}`).style.display="block"
            document.getElementById(`toggle-${index}`).innerText="收起"
        }else{
            document.getElementById(`content-${index}`).style.display="none"
            document.getElementById(`toggle-${index}`).innerText="展开"
        }
    }

}

var page=new unfamiliar();