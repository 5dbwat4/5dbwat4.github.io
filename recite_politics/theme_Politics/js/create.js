class create{
    constructor(){
        this.initpage();
        this.Content={}
    }
    initpage(){
        DOMshow("step1")
        DOMhide("step2")
    }
    title_off(){
        DOMshow("step2")
        DOMhide("step1")
        this.Content.title=document.getElementById("title").value;
        this.Content.data=[]
        this.index=0;
        document.getElementById("outputdata").value=JSON.stringify(this.Content)
    }
    test_off(){
        this.Content.data[this.index]={"question":[document.getElementById("question").value],"answer":document.getElementById("answer").value.split("\n")}
        document.getElementById("outputdata").value=JSON.stringify(this.Content)
        this.index++;
        document.getElementById("question").value=""
        document.getElementById("answer").value=""
    }
}

var page=new create()