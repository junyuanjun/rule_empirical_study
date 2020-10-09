var margin = {top: 60, right: 80, bottom: 20, left: 30},
	// width = 820 - margin.right - margin.left,
	width = 1080 - margin.right - margin.left,
	height = 700 - margin.top - margin.bottom
	space=30, indent = 40;

var widthRange = [5, 60], radiusRange = [4, 20];
var rectHeight = 15, rectWidth = 60, rectXst, sqWidth;
var handleWidth = 1, handleHeight = 20;
var rectMarginTop = 10, rectMarginBottom = 10;

var widthScale, radiusScale;

var svg1 = d3.select("#svg1")
	.attr("width", width + margin.right + margin.left)
	.attr("height", height + margin.top + margin.bottom)
  	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var svg2 = d3.select("#svg2")
	.attr("width", width + margin.right + margin.left)
	.attr("height", height + margin.top + margin.bottom)
  	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var svg3 = d3.select("#svg3")
	.attr("width", width + margin.right + margin.left)
	.attr("height", height + margin.top + margin.bottom)
  	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var i = 0,
	duration = 750,
	root,
	real_min,
	real_max,
	median,
	attrs,
	order,
	target_names;

var textMargin = 5;
var font_family = "sans-serif";

// var folder = "fico_tree_rule";
// var folder = "fico";
// var folder = 'alien_cate';
// var folder = "fico_train";
// var folder = "loan";
var folder = "testing"

let group_margin = [0, 10];
let mid, pos;

function loadData() {
	d3.queue()
		.defer(d3.json, folder + "/test.json")
		.defer(d3.json, folder + "/list.json")
		.await((err, file1, file2) => {
        if (err) {
            console.log(err);
            return;
        }
        attrs = file1["columns"];
        order = file1['order'];
        listData = file2["rule_lists"];
        target_names = file2["target_names"];
        rectXst = [0, rectWidth/3, rectWidth/3*2];
        sqWidth = rectWidth/3;

        radiusScale = d3.scale.pow()
            .exponent(.5)
            .range([0, radiusRange[1]])
            .domain([0, 1]);

        yScale = d3.scale.ordinal()
            .domain(d3.range(listData.length+1))
            .rangeBands([margin.top, height+margin.top]);

        mid = Math.floor(listData.length/2);
        if (folder == 'training') {
            mid = 4;
        }
        pos = [[0, mid], [mid, listData.length]];


        generate_text_list(listData);
        generate_bar_list(listData);

        render_sqaure_bar_legend("#legend2", true, 'list');
        render_symbolic_legend("#legend1");
	});
}

function makeCurlyBrace(x1,y1,x2,y2,w,q) {
    //Calculate unit vector
    var dx = x1-x2;
    var dy = y1-y2;
    var len = Math.sqrt(dx*dx + dy*dy);
    dx = dx / len;
    dy = dy / len;

    //Calculate Control Points of path,
    var qx1 = x1 + q*w*dy;
    var qy1 = y1 - q*w*dx;

    var qx2 = (x1 - .25*len*dx) + (1-q)*w*dy;
    var qy2 = (y1 - .25*len*dy) - (1-q)*w*dx;

    var tx1 = (x1 -  .5*len*dx) + w*dy;
    var ty1 = (y1 -  .5*len*dy) - w*dx;

    var qx3 = x2 + q*w*dy;
    var qy3 = y2 - q*w*dx;

    var qx4 = (x1 - .75*len*dx) + (1-q)*w*dy;
    var qy4 = (y1 - .75*len*dy) - (1-q)*w*dx;


    return ( "M " +  x1 + " " +  y1 +
            " Q " + qx1 + " " + qy1 + " " + qx2 + " " + qy2 + 
            " T " + tx1 + " " + ty1 +
            " M " +  x2 + " " +  y2 +
            " Q " + qx3 + " " + qy3 + " " + qx4 + " " + qy4 + 
            " T " + tx1 + " " + ty1 );
}

function generate_text_list(listData) {
	var y_offset = 0,
		x_offset = 60;
	var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    var rule_offset = 0;
    var font_size;
	var g = svg1.append("g")
		.attr("class", "list")

	font_size = 16;
	font = font_size + "px " + font_family;
	ctx.font = font;

	// show the rule lists
	let longest_rule = 0;
	

	listData.forEach((rules, ix) => {
		if (ix > 0 && rules['label'] !== listData[ix-1]['label']) {
			g.append("line")
				.attr("x1", 0)
		        .attr("x2",longest_rule + 50)
		        .attr("y1", y_offset - group_margin[1])
		        .attr("y2", y_offset - group_margin[1])
		        .style("stroke", "#d3d3d3")
        		.style("stroke-width", 1);
		    y_offset += group_margin[1];
		}

		// numbering
		g.append("text")
			.attr("x", 0)
			.attr("y", y_offset)
		    .style("font-size", font_size)
		    .style("font-weight", "medium")
		    .attr("dy", ".35em")
		    .attr("text-anchor", "start")
		    .style("stroke-width", "1px")
		    .text("R"+(ix+1));

		// rule list
		var rule_str = "";
		g.append("text")
			.attr("x", indent)
			.attr("y", y_offset)
			.attr("fill", "Black")
		    .style("font", font)
		    .attr("dy", ".35em")
		    .attr("text-anchor", "start")
		    .text("IF ");
		x_offset = ctx.measureText("IF ").width + indent;
		let complete_str = ""

		// reorder features
		conditions = rules['rules'];
		if (order !== undefined) {
			conditions.sort((a, b) => {
				return order[a['feature']] - order[b['feature']]
			})
		}

		val_des = ['L', 'M', 'H'];
		// val_des = ['Low', 'Medium', 'High'];
		conditions.forEach((rule, i) => {
			g.append("text")
				.attr("x", x_offset)
				.attr("y", y_offset)
			    .style("font-size", font_size)
			    .style("font-style", 'italic')
			    .attr("dy", ".35em")
			    .attr("text-anchor", "start")
				// .style("font-weight", (rule["feature"]==1 || rule["feature"]==5) && rules['label']==1 ? "bold":"normal")
			 //    .attr("fill", (rule["feature"]==1 || rule["feature"]==5) && rules['label']==1? 'green' : 'black')
			    .text(attrs[rule["feature"]]);

			x_offset += ctx.measureText(attrs[rule["feature"]] + " ").width 
			rule_str += " = ";
			rule['value'].forEach((d, i) => {
				if (i>0) {
					rule_str += " or "
				}
				rule_str+=val_des[d]
			})

			g.append("text")
				.attr("x", x_offset)
				.attr("y", y_offset)
			    .style("font-size", font_size)
			    .attr("dy", ".35em")
			    .attr("text-anchor", "start")
			    .text(rule_str);

			x_offset += ctx.measureText(rule_str).width + ctx.measureText(" ").width;
			if (folder.substring(0,4) == 'fico' && rule['feature']==1) {
				x_offset +=10;
			}
			if (folder.substring(0,5) == 'alien' && rule['feature']==2) {
				x_offset +=12;
			}
			if (i < 1) {
			// if (i < conditions.length - 1) {
				g.append("text")
					.attr("x", x_offset)
					.attr("y", y_offset)
				    .style("font-size", font_size)
				    .style("font-weight", "bold")
				    .attr("dy", ".35em")
				    .attr("text-anchor", "start")
				    .text(" AND ");
				rule_str = "";
				x_offset += ctx.measureText(" AND ").width;
			}
		});

		x_offset += indent*.4;
		if (x_offset > longest_rule) {
			longest_rule = x_offset;
		}
		y_offset += rectHeight+rectMarginBottom+rectMarginTop;
		rule_offset++;
	});

	// prediction
    let bracket_w = 30
    let prediction = svg1.append('g')
        .attr('class', 'prediction')

    pos.forEach((pair, ix) => {
        // render the bracket
        prediction.append("path")
            .attr("class","curlyBrace")
            .attr("transform", 
                `translate(${longest_rule+5}, ${(rectHeight + rectMarginBottom + rectMarginTop)*pair[0]+group_margin[ix]}),scale(-1,1)`)
            .attr("d", function(d) { 
                return makeCurlyBrace(
                    0, 0, 0, (rectHeight + rectMarginBottom + rectMarginTop) * (pair[1]-pair[0]-1),
                    bracket_w, 0.3); 
            });

        // prediction text
        prediction.append('text')
            .attr("x", longest_rule+bracket_w+10)
            .attr("y", (rectHeight + rectMarginBottom + rectMarginTop)*(pair[0]+pair[1]-1)/2 + 5+group_margin[ix])
            .text(target_names[listData[pair[0]]['label']])
            .style("fill", '#484848')
    })
}

function generate_bar_list(listData) {
	var y_offset = 0;
	var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    var rule_offset = 0;
    var font_size;
	var g = svg2.append("g")
		.attr("class", "list")

	// show the rule lists
	font_size = 16;
	font = font_size + "px " + font_family;
	ctx.font = font;

	let longest_rule = 0;

	let sq_text = ["L", "M", "H"]
    let rect_font_size = 12
	listData.forEach((rules, ix) => {
		if (ix > 0 && rules['label'] !== listData[ix-1]['label']) {
			g.append("line")
				.attr("x1", 0)
		        .attr("x2",longest_rule + 50)
		        .attr("y1", y_offset - group_margin[1])
		        .attr("y2", y_offset - group_margin[1])
		        .style("stroke", "#d3d3d3")
        		.style("stroke-width", 1);
		    y_offset += group_margin[1];
		}
		// numbering
		g.append("text")
			.attr("x", 0)
			.attr("y", y_offset)
		    .style("font-size", font_size)
		    .style("font-weight", "medium")
		    .attr("dy", ".35em")
		    .attr("text-anchor", "start")
		    .style("stroke-width", "1px")
		    .text("R"+(ix+1));

		// rule list
		g.append("text")
			.attr("x", indent)
			.attr("y", y_offset)
			.attr("fill", "Black")
		    .style("font", font)
		    .attr("dy", ".35em")
		    .attr("text-anchor", "start")
		    .text("IF ");
		x_offset = ctx.measureText("IF ").width

		// x_offset = 0;

		rules["rules"].forEach((rule, i) => {
			var f_idx = rule["feature"];
			g.append("text")
				.attr("x", indent + x_offset)
				.attr("y", y_offset)
				.attr("fill", "Black")
			    .style("font-size", font_size)
			    .style("font-style", 'italic')
			    .attr("dy", ".35em")
			    .attr("text-anchor", "start")
			    .text(attrs[f_idx]);

			x_offset += ctx.measureText(attrs[f_idx]).width + textMargin;

            to_render = [];
            d3.range(3).forEach(pdc => {
                to_render.push({'value': pdc, 'show': rule['value'].indexOf(pdc)>=0})
            })

            to_render.forEach(d => {
            	g.append('rect')
            		.attr("x", indent+x_offset+rectXst[d['value']])
			        .attr("width", sqWidth)
			        .attr("y",  y_offset-rectHeight/2)
			        .attr("height", rectHeight)
			        .attr("fill", d['show'] ? gradientColor[d['value']]: 'white')
			        .attr("stroke", "black");

			    g.append('text')
			        .attr("x", indent+x_offset+rectXst[d['value']]+sqWidth/2)
			        .attr("y",  y_offset-rectHeight/2+rectMarginTop)
			        .style('alignment-baseline', 'middle')
			        .style("text-anchor", "middle")
			        .text(d['show'] ? sq_text[d['value']] : "")
			        .style('font-size', `${rect_font_size}px`)
			        .attr('fill', '#484848')
			})
			
			x_offset += sqWidth * 3 + ctx.measureText(" ").width * 3;

			if (i < rules["rules"].length - 1) {
				g.append("text")
				.attr("x", indent + x_offset)
				.attr("y", y_offset)
			    .style("font-size", font_size)
				.style("font-weight", "bold")
			    .attr("dy", ".35em")
			    .attr("text-anchor", "start")
			    .text(" AND");
				x_offset += ctx.measureText(" AND ").width;
			}

			if (x_offset > longest_rule) {
				longest_rule = x_offset;
			}
		});
		y_offset += rectHeight + rectMarginTop + rectMarginBottom;
	});

	// prediction
    let bracket_w = 30
    let prediction = svg2.append('g')
        .attr('class', 'prediction')

    pos.forEach((pair, ix) => {
        // render the bracket
        prediction.append("path")
            .attr("class","curlyBrace")
            .attr("transform", 
                `translate(${longest_rule+50}, ${(rectHeight + rectMarginBottom + rectMarginTop)*pair[0]+group_margin[ix]}),scale(-1,1)`)
            .attr("d", function(d) { 
                return makeCurlyBrace(
                    0, 0, 0, (rectHeight + rectMarginBottom + rectMarginTop) * (pair[1]-pair[0]-1),
                    bracket_w, 0.3); 
            });

        // prediction text
        prediction.append('text')
            .attr("x", longest_rule+bracket_w+55)
            .attr("y", (rectHeight + rectMarginBottom + rectMarginTop)*(pair[0]+pair[1]-1)/2 + 5+group_margin[ix])
            .text(target_names[listData[pair[0]]['label']])
            .style("fill", '#484848')
    })

}

function render_prediction (g, x_pos) {
	let x_offset = x_pos;
	g.append("text")
		.attr("x", x_offset)
		.attr("y", y_offset)
	    .style("font-size", font_size)
		.style("font-weight", "bold")
	    .attr("dy", ".35em")
	    .attr("text-anchor", "start")
	    .text(" THEN ");
	x_offset += ctx.measureText(" THEN").width;

	g.append("text")
		.attr("x", x_offset)
		.attr("y", y_offset)
	    .style("font-size", font_size)
	    .attr("dy", ".35em")
	    .attr("text-anchor", "start")
	    .text(" predict ");

	x_offset += ctx.measureText(" prdict  ").width;
	g.append("text")
		.attr("x", x_offset)
		.attr("y", y_offset)
	    .style("font-size", font_size)
	    .attr("dy", ".35em")
	    .attr("text-anchor", "start")
	    // .text(rules['label']==0? 'Healthy' : "Unhealthy")
	    .text(target_names[rules['label']])
	    .style('fill', colors[rules['label']]);
}

function main() {
    loadData();
}

main();