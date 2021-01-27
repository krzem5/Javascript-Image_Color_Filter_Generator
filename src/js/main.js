var path="./data/v.mov"
var cnv,ctx,imgD
var COLOR_MATCH=[["#ff5854",25],["#e2363b",30]],MAX_GROUP_DIST=50,MIN_GROUP_ITEMS=150
function init(){
	cnv=document.querySelector("canvas")
	ctx=cnv.getContext("2d")
	var video=document.createElement("video")
	document.body.appendChild(video)
	// video.style="width: 0px;height: 0px"
	video.src=path
	video.autoplay=true
	video.muted="muted"
	video.onplaying=function(){
		video.pause()
		var t=video.captureStream().getVideoTracks()[0]
		var imC=new ImageCapture(t)
		imC.grabFrame().then(function(img){
			ctx.canvas.width=img.width
			ctx.canvas.height=img.height
			ctx.drawImage(img,0,0)
			imgD=ctx.getImageData(0,0,cnv.width,cnv.height)
			update()
		})
		document.body.removeChild(video)
	}
}
function update(){
	var c=COLOR_MATCH.slice()
	c.forEach((a,b,c)=>c[b]=[parseInt(a[0].substring(1,3),16),parseInt(a[0].substring(3,5),16),parseInt(a[0].substring(5,7),16),a[1],a[2]||a[1],a[3]||a[1]])
	var groups=[]
	var x=0,y=0
	for (var i=0;i<imgD.data.length;i+=4){
		var s=false
		for (var cl of c){
			if (Math.abs(imgD.data[i]-cl[0])<=cl[3]&&Math.abs(imgD.data[i+1]-cl[1])<=cl[4]&&Math.abs(imgD.data[i+2]-cl[2])<=cl[5]){
				imgD.data[i]=255
				s=true
				break
			}
		}
		if (s==true){
			if (groups.length==0){
				groups.push([[i,x,y]])
			}
			else{
				var s=false
				for (var g of groups){
					for (var e of g){
						if (Math.abs(e[1]-x)+Math.abs(e[2]-y)<=MAX_GROUP_DIST){
							s=true
							break
						}
					}
					if (s==true){
						g.push([i,x,y])
						break
					}
				}
				if (s==false){
					groups.push([[i,x,y]])
				}
			}
		}
		else{
			// imgD.data[i+3]=128
		}
		x++
		if (x==cnv.width){
			x=0
			y++
		}
	}
	var sl=[]
	for (var g of groups){
		if (g.length>MIN_GROUP_ITEMS){
			var min={x:g[0][1],y:g[0][2]},max={x:g[0][1],y:g[0][2]}
			for (var e of g){
				min.x=Math.min(min.x,e[1])
				min.y=Math.min(min.y,e[2])
				max.x=Math.max(max.x,e[1])
				max.y=Math.max(max.y,e[2])
			}
			sl.push({min:min,max:max})
		}
	}
	for (var i=sl.length-1;i>=0;i--){
		var g=sl[i]
		for (var j=sl.length-1;j>=0;j--){
			var og=sl[j]
			if (g==og){continue}
			if (g.min.x<=og.min.x&&g.min.y<=og.min.y&&g.max.x>=og.max.x&&g.max.y>=og.max.y){
				sl.splice(j,1)
			}
		}
	}
	ctx.putImageData(imgD,0,0)
	ctx.lineWidth=5
	ctx.strokeStyle="#00ff00"
	for (var g of sl){
		ctx.strokeRect(g.min.x,g.min.y,g.max.x-g.min.x,g.max.y-g.min.y)
	}
	requestAnimationFrame(update)
}
document.addEventListener("DOMContentLoaded",init,false)