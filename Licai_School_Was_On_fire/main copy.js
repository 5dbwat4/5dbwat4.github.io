var ASSETS=[
    {
        name:"Background",
        src:"./picture/Background.png",
        beginPoint:{x:0,y:0},
        Fire:false,
    },
    {
        name:"Teaching_Building",
        src:"./picture/Teaching_Building.png",
        beginPoint:{x:80,y:43},
        Fire:true,
    },
];
var canvasP=document.getElementById('Maintain').getContext("2d");
var image=new Image();
for(let i=0;i<ASSETS.length;i++){
    image.src=ASSETS[i].src;
    canvasP.drawImage(image,ASSETS[i].beginPoint.x,ASSETS[i].beginPoint.y)
}