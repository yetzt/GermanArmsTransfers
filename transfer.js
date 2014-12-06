var data;

var pastTransition = 0,
	pastRotation = 0,
	pastElementID = null;

var minWeapons = Number.MAX_VALUE,
	maxWeapons = Number.MIN_VALUE;

var minTrans = Number.MAX_VALUE,
	maxTrans = Number.MIN_VALUE;

var radiusSize = d3.scale.pow().exponent(0.2);

var fSize = d3.scale.pow().exponent(0.2);

var tooltip = d3.select(".popup")
        .append("div")
        .attr("class", "tipp")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden");

/* data structure:
		"supplier" : 			Country
		"sup_type" : 			Licenser (L) or Recipient (R)
		"weapon_nr" :  			Number of ordered Weapons
		"weapon_designation" : 
		"weapon_description" : 
		"order_year" : 			Year of order
		"deliver_year" : 		Year of delivery or licence
		"nr_delivered" : 		Number of delivered / licensed weapons
		"comments" : 			Comment about the transfer
*/
queue()
    .defer(d3.json, "deutschland.json")
    .await(read);

function read(error, german){
	data = d3.nest()
                .key(function(d){return d.supplier;})
                .entries(german);

    // orderByCountry(data);
    sumWeapons(data);
    orderByWeapons(data);
    
    radiusSize.domain([minWeapons, maxWeapons])
    			.range([5, 50]);

    fSize.domain([minTrans, maxTrans])
    			.range([15, 30]);

    orderByCountry(data);
	showLinear();
    // showDiamond();

}

function showDiamond(){

	var width = 800, 
		height = 950;

	var svg = d3.select(".trans")
	    	.append("svg")
	    	.attr("width", width)
	    	.attr("height", height);

	svg.append("text")
		.text("Germany")
		.attr("id", "germ")
		.attr("x", (width/2))
		.attr("y", (height/2))
		.style("text-anchor", "middle")
		.style("font-size", "30px");

	var y_ = 10
		offset = 10,
		n = data.length;

	var u = n * 30,
		rad = u / ( Math.PI);
	console.log("Umfang: "+u+ " Durchmesser: "+rad);

    for(var i = 0; i < n; i++){
    	var x_, font_;
    	if( i == 0 || i == (n-1)){
    		x_ = width/2;
    		y_ += 10;
    		font_ = "middle";
    	}else{
    		if( y_ < height/2){
    			if( i % 2 == 0){
		    		offset += 10;
		    		x_ = (width/2) + offset;
		    		font_ = "begin";
		    	}else{
		    		x_ = (width/2) - offset;
		    		y_ += 20;
		    		font_ = "end";
		    	}
    		}else{
    			if( i % 2 == 0){
		    		offset -= 10;
		    		x_ = (width/2) + offset;
		    		font_ = "begin";
		    	}else{
		    		x_ = (width/2) - offset;
		    		y_ += 20;
		    		font_ = "end";
		    	}
    		}
    		
    	}
    	var s = fontsizeMapping(data[i].weaponSum)+"px";
    	var act = svg.append("text")
    		.datum(data[i])
    		.attr("x", x_)
    		.attr("y", y_)
    		.text(data[i].country)
    		.style("text-anchor", font_)
    		.style("font-size", s)
    		.on("mouseover", function(d){
    			return tooltip.style("visibility", "visible")
                        .text(d.weaponSum);
    		})
    		.on("mousemove", function(){
                return tooltip.style("top", (d3.event.pageY-10)+"px")
                            .style("left",(d3.event.pageX+10)+"px");
            })
            .on("mouseout", function(d){
                return tooltip.style("visibility", "hidden");
        });

    }
}

function showLinear(){
	var width = 1050, 
		height = 400;

	var svg = d3.select(".trans")
	    	.append("svg")
	    	.attr("width", width)
	    	.attr("height", height)
	    	.attr("class", "im")
	    	.append("g")
	    		.attr("id", "group");

	svg.append("text")
		.text("Germany")
		.attr("id", "germ")
		.attr("x", (width/2))
		.attr("y", (height / 2 - 10))
		.style("text-anchor", "middle")
		.style("font-size", "30px")
		.on("click", function(d){
			var trans_ = pastTransition - pastTransition;
			d3.select("#group")
	        			.transition()
	        			.attr("transform", "translate(0, "+trans_+")")
	        			.style("opacity", 1)
	        			.duration(1000);

	        d3.selectAll("text")
	        			.style("opacity", 1);

	        d3.selectAll(".dot").remove();

	        if(pastElementID != null){
	        	d3.select("#"+pastElementID)
		        	.transition()
		        	.attr("transform", pastRotation)
		        	.duration(1000);

		        	pastElementID = null;
	       	}
		});

	svg.append("path")
		.attr("d", "M 0 "+(height / 2 - 37)+" L "+width+" "+(height / 2 - 37))
		.attr("stroke", "black")
		.attr("stroke-width", 1);

	svg.append("path")
		.attr("d", "M 0 "+(height / 2 )+" L "+width+" "+(height / 2 ))
		.attr("stroke", "black")
		.attr("stroke-width", 1);

	var x_ = -10;
	var newline = -10;

	for(var i = 0; i < data.length; i++){
    	var s = fSize(data[i].weaponSum)+"px";
    	
    	svg.append("text")
    		.datum(data[i])
    		.attr("id", "c_"+i)
    		.attr("x", x_)
    		.attr("y", (height / 2 - 40))
    		.attr("transform", "rotate(-90, 0, "+(height / 2 - 40)+")")
    		.text(data[i].country)
    		.style("text-anchor", "begin")
    		.style("font-size", s);

        var text_x = document.getElementById("c_"+i).getBoundingClientRect().width;

        newline += text_x + 0.5;

        var h_ = 0,
        	r_ = 0;

        if(newline < (width-50)){
        	x_ += text_x + 0.5;
        	h_ = height / 2 - 40;
        	r_ = -45;
        }else{
			x_ -= text_x + 0.5;
			h_ = height / 2 + 15;
			r_ = 45;
        }
        
        d3.select("#c_"+i).remove();
	        svg.append("text")
	    		.datum(data[i])
	    		.attr("id", "c_"+i)
	    		.attr("x", x_)
	    		.attr("y", h_)
	    		.attr("transform", "rotate("+r_+", "+x_+", "+h_+")")
	    		.text(data[i].country)
	    		.style("text-anchor", "begin")
	    		.style("font-size", s)
	    		.on("mouseover", function(d){
	    			var s_ = document.getElementById(this.id).style.fontSize;
	    			var t_ = s_.substr(0, s_.length-2);
	    			var size = (parseInt(t_) + 4);

	    			d3.select("#"+this.id)
	    				.style("fill", "blue")
	    				.style("font-size", size+"px");

	    			// return tooltip.style("visibility", "visible")
	       //                  .text(d.weaponSum);
	    		})
	    		.on("mousemove", function(){
	                // return tooltip.style("top", (d3.event.pageY-10)+"px")
	                //             .style("left",(d3.event.pageX+10)+"px");
	            })
	            .on("mouseout", function(d){
	            	var s_ = document.getElementById(this.id).style.fontSize;
	    			var t_ = s_.substr(0, s_.length-2);
	    			var size = (parseInt(t_) - 4);

	            	d3.select("#"+this.id)
	    				.style("fill", "black")
	    				.style("font-size", size+"px");

	                // return tooltip.style("visibility", "hidden");
	        	})
	        	.on("click", function(d){
	        		var y_ = document.getElementById(this.id).getAttribute("y");
	        		var x_ = document.getElementById(this.id).getAttribute("x");
	        		var trans_;
	        		var transWord;

	        		if( (pastElementID != null) && (pastElementID != this.id)){
	        			d3.select("#"+pastElementID)
		        			.transition()
		        			.attr("transform", pastRotation)
		        			.duration(1000);		        		
	        		}

	        		if(y_ < (height/2)){
	        			trans_ = 150;
	        			transWord = -100;
	        			pastTransition = 150;
	        		}else{
						trans_ = -150;
						transWord = 190;
						pastTransition = -190;
	        		}

	        		d3.select("#group")
	        			.transition()
	        			.attr("transform", "translate(0, "+trans_+")")
	        			.duration(1000);

	        		d3.selectAll("text")
	        			.style("opacity", 0.4);

	        		d3.select("#"+this.id)
	        			.transition()
	        			.attr("transform", "translate("+(width/2 - x_)+", "+transWord+")")
	        			.style("opacity", 1)
	        			.duration(1000);

	        		drawTransfers(d, trans_, height);

	        		if(pastElementID != this.id){
	        			pastElementID = this.id;
	        			pastRotation = document.getElementById(this.id).getAttribute("transform");
	        		}
	        	});
        
	}
}

function drawTransfers(data, transition, height){
	var d = data.transfers
	var y_;

	if(transition < 0){
		y_ = height - 100;
	}else{
		y_ = height - height + 100;
	}

	d3.selectAll(".dot").remove();

	for(var i = 0; i < d.length; i++){
		d3.select(".im")
			.append("circle")
			.attr("class", "dot")
			.attr("cx", (i*50)+50)
			.attr("cy", y_)
			.attr("r", radiusSize(d[i].weapon_nr))
			.style("fill", circleColor(d[i].sup_type));
	}
}

function sumWeapons(d){
	var dat = [];

	for(var i = 0; i < d.length; i++){
		var weaponSum = 0;
		for(var j = 0; j < d[i].values.length; j++){
			if(d[i].values.length == 1 && d[i].values[j].weapon_nr == "x"){
				weaponSum = "x";
			}else if(d[i].values[j].weapon_nr != "x"){
				var w = parseInt(d[i].values[j].weapon_nr);
				weaponSum += w;
				if(w < minWeapons){
					minWeapons = w;
				}
				if(w > maxWeapons){
					maxWeapons = w;
				}
			}
		}

		if(weaponSum < minTrans){
			minTrans = weaponSum;
		}
		if(weaponSum > maxTrans){
			maxTrans = weaponSum;
		}

		var o = {
			country: d[i].key,
			weaponSum: weaponSum,
			transfers : d[i].values
		}
		dat.push(o)
	}

	data = dat;
}

function orderByCountry(d){
	d.sort(function(a, b){
		if (a.country > b.country) {
			return 1;
  		}
		if (a.country < b.country) {
		    return -1;
		}
		// a must be equal to b
		return 0;
	});

	data = d;
}

function orderByWeapons(d){
	d.sort(function(a, b){
		if (a.weaponSum < b.weaponSum) {
			return 1;
  		}
		if (a.weaponSum > b.weaponSum) {
		    return -1;
		}
		// a must be equal to b
		return 0;
	});

	data = d;
}

function circleColor(val){
	if(val == "R"){
		return "#ff6666";
	}else{
		return "#99cccc";
	}
}