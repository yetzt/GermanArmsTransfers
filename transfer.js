var data;

var pastTransition = 0,
	pastRotation = 0,
	pastElementID = null;

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

var tooltip = d3.select(".popup")
        .append("div")
        .attr("class", "tipp")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden");

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
	var width = 1000, 
		height = 400;

	var svg = d3.select(".trans")
	    	.append("svg")
	    	.attr("width", width)
	    	.attr("height", height)
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
    	var s = fontsizeMapping(data[i].weaponSum)+"px";
    	
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
	        			console.log("?");
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
	        			.style("opacity", 0.4)
	        			.duration(1000);

	        			//TODO opacity wird nicht verändert, weil ich vorher die gesamte Gruppe aufhelle
	        		d3.select("#"+this.id)
	        			.transition()
	        			.attr("transform", "translate("+(width/2 - x_)+", "+transWord+")")
	        			.style("opacity", 1)
	        			.duration(1000);

	        		if(pastElementID != this.id){
	        			pastElementID = this.id;
	        			pastRotation = document.getElementById(this.id).getAttribute("transform");
	        		}
	        		
	        		

	        	});
        
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
				weaponSum += parseInt(d[i].values[j].weapon_nr);
			}
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

function fontsizeMapping(val){
	var size = 14;
	if( val < 10){
		size = 15;
	}else if (val >= 10 && val < 100){
		size = 16;
	}else if (val >= 100 && val < 200){
		size = 17;
	}else if (val >= 200 && val < 300){
		size = 18;
	}else if (val >= 300 && val < 400){
		size = 19;
	}else if (val >= 400 && val < 550){
		size = 20;
	}else if (val >= 550 && val < 900){
		size = 21;
	}else if (val >= 900 && val < 1000){
		size = 23;
	}else if (val >= 1000 && val < 2000){
		size = 25;
	}else if (val >= 2000 && val < 3000){
		size = 27;
	}else if (val >=3000 && val < 6000){
		size = 28;
	}else{
		size = 30;
	}
	return size;
}