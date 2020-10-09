var margin = {top: 60, right: 80, bottom: 20, left: 80},
    width = 750 - margin.right - margin.left,
    height,
    // height = 300 - margin.top - margin.bottom
    indent = 40;
var canvas = document.getElementById("canvas");

var folder = 'training';
// var folder = "testing"

if (folder == "training") {
    height = 800 - margin.top - margin.bottom
}else {
    height = 800 - margin.top - margin.bottom
    width = 1200 - margin.right - margin.left
}


var radiusRange = [4, 20];
var handleWidth = 0.5, 
    handleHeight, 
    handleLedge = 3;
var rectMarginTop = 10, rectMarginBottom = 10,
    rectXst, sqWidth,
    rectMarginH = 30;
// var rectHeight, rectWidth;
var rectHeight = 15, rectWidth = 60;

var widthScale, radiusScale, xScale, yScale, colorScale;
var colorBarHeight = 5;
var barHeight = (rectHeight - rectMarginTop - rectMarginBottom) / 2;
let group_margin = [0, 10];
let mid, pos;


var svg1 = d3.select("#svg1")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var svg6 = d3.select("#svg6")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var i = 0,
    duration = 750,
    root,
    real_min,
    real_max,
    attrs,
    order,
    median,
    target_names;

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
        width = (attrs.length+1) * (rectWidth+rectMarginH*2);
        height = (1+listData.length) * (rectHeight+rectMarginTop+rectMarginBottom);
        

        // scale for placing cells
        xScale = d3.scale.ordinal()
            .domain(d3.range(attrs.length+1))
            .rangeBands([0, width]);

        yScale = d3.scale.ordinal()
            .domain(d3.range(listData.length+1))
            .rangeBands([margin.top, height+margin.top]);

        // scale for rendering size circles
        radiusScale = d3.scale.pow()
            .exponent(.5)
            .range([0, radiusRange[1]])
            .domain([0, 1]);

        // scale for filling rule ranges
        // rectHeight = yScale.rangeBand() - rectMarginTop - rectMarginBottom;
        // rectWidth = xScale.rangeBand() - rectMarginH * 2;
        // rectXst = [0, rectWidth/3, rectWidth/3*2];
        // sqWidth = rectWidth/3;

        handleHeight = rectHeight + handleLedge * 2;
        widthScale = [];
        colorScale = [];

        mid = Math.floor(listData.length/2);
        if (folder == 'training') {
            mid = 4;
        }
        pos = [[0, mid], [mid, listData.length]];

        generate_bar_with_horizontal_line(listData);
        generate_text(listData);
        render_sqaure_bar_legend("#legend1", true, 'table');
        render_symbolic_legend("#legend2");
    });
}

function generate_text(listData) {
    render_feature_names_and_grid(svg6, 6);
    d3.select('#svg6').attr("width", width+margin.left+margin.right);
    svg6.attr("width", width+margin.left+margin.right);

    var ctx = canvas.getContext("2d");
    font_size = 14;
    font = font_size + "px " + font_family;
    ctx.font = font;

    var row = svg6.selectAll(".row")
        .data(listData)
        .enter().append("g")
        .attr("class", "row")
        .attr("transform", function(d, i) { 
            let ix = +(i >= mid);
            return `translate(${0}, ${yScale(i) + group_margin[ix] + rectMarginTop + 2} )`; 
        });

    var barHeight = (rectHeight - rectMarginTop - rectMarginBottom) / 2;

    // render the rule ranges
    let val_des = ['L', 'M', 'H'];
    row.selectAll(".rule-fill")
        .data(function(d) { 
            var obj = d["rules"];
            to_render = [];
            obj.forEach((rule) => {
                let feat = rule['feature'];
                let to_show = "";
                rule['value'].forEach((v,i) => {
                    if (i>0) 
                        to_show += ' or '
                    to_show += val_des[v];
                })
                to_render.push({'feature': feat, 'to_show': to_show})
            })

            return to_render; 
        })
        .enter().append("text")
        .attr('font-size', font_size)
        .attr("x", function(d) { 
            if (order !== undefined) {
                return xScale(order[d['feature']])+(rectWidth+rectMarginH*2-ctx.measureText(d.to_show).width)/2;
            }
            return xScale(d['feature'])+(rectWidth+rectMarginH*2-ctx.measureText(d.to_show).width)/2;
        })
        .attr("y",  font_size)
        .text(d => d['to_show'])
        // .attr("fill", d => d['show'] ? "#484848": 'white')
        .style("text-anchor", "start")
        .attr("fill", "black");

    // prediction
    let bracket_w = 30
    let prediction = svg6.append('g')
        .attr('class', 'prediction')

    pos.forEach((pair, ix) => {
        // render the bracket
        prediction.append("path")
            .attr("class","curlyBrace")
            .attr("transform", 
                `translate(${xScale(xScale.domain().length-1)+5}, ${yScale(pair[0])+group_margin[ix]}),scale(-1,1)`)
            .attr("d", function(d) { 
                return makeCurlyBrace(
                    0, 0, 0, yScale(pair[1])-yScale(pair[0]),
                    bracket_w, 0.3); 
            });

        // prediction text
        prediction.append('text')
            .attr("x", xScale(xScale.domain().length-1)+bracket_w+10)
            .attr("y", (yScale(pair[0])+yScale(pair[1]))/2 + 5 +group_margin[ix])
            // .text(target_names[ix])
            .text(target_names[listData[pair[0]]['label']])
            .attr("fill", "#484848")

    })
}

//returns path string d for <path d="This string">
//a curly brace between x1,y1 and x2,y2, w pixels wide 
//and q factor, .5 is normal, higher q = more expressive bracket 
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


function render_feature_names_and_grid(svg, id) {
    var column = svg.selectAll(".column").data(attrs)
        .enter().append("g")
        .attr("class", "column")
        .attr("transform", function(d, i) { 
            if (order !== undefined) {
                return "translate(" + xScale(order[i]) + ")rotate(345)"; 
            } 
            return "translate(" + xScale(i) + ")rotate(345)"; 
        });

    column.append("text")
        .attr("x", 6)
        .attr("y", yScale.rangeBand() / 1.5 + 20)
        .attr("dy", ".32em")
        .attr("text-anchor", "start")
        .text(function(d, i) { return d; });

    // grid
    pos.forEach((pair, ix) => {
        svg.selectAll(`.grid-row-${ix}`)
            .data(d3.range(pair[0], pair[1]+1))
            .enter().append("g")
            .classed("grid-row", true)
            .classed(`grid-row-${ix}`, true)
            .attr("transform", (d, i) => { 
                return "translate(0," + (yScale(pair[0]+i) + group_margin[ix]) + ")"; 
            })
            .append("line")
            .attr("x1", 0)
            .attr("x2", width-xScale.rangeBand())
            .style("stroke", gridColor);

        svg.selectAll(`.rule-num-${ix}`)
            .data(d3.range(pair[0], pair[1]))
            .enter().append("g")
            .classed("rule-num", true)
            .classed(`rule-num-${ix}`, true)
            .attr("transform", (d, i) => { 
                return "translate(-10," + (yScale(pair[0]+i) + group_margin[ix]+yScale.rangeBand()/2+rectMarginTop) + ")"; 
            })
            .append("text")
            .attr("x", 0)
            .text((d, i) => "R"+(pair[0]+i+1))
            .style("text-anchor", "end")
            .style("stroke", "black")
            .style("font-size", "16px")
            .style("stroke-width", "0.5px");

        svg.selectAll(`.grid-col-${ix}`)
            .data(xScale.domain())
            .enter().append("g")
            .classed("grid-col", true)
            .classed(`grid-col-${ix}`, true)
            .attr("transform", (d, i) => { 
                return "translate(" + xScale(i)+","+ group_margin[ix]+ ")"; 
            })
            .append("line")
            .attr("y1", yScale(pair[0]))
            .attr("y2", yScale(pair[1]))
            .style("stroke", gridColor);
    })

    // highlight the group divider
    svg.append('g')
        .attr('class', 'divider')
        .attr("transform", `translate(0, ${yScale(mid) + group_margin[1]/2})`)
        .append('line')
        .attr("x1", -45)
        .attr("x2", width-xScale.rangeBand()+10)
        .style("stroke", 'darkgrey');
}

function render_size_circle(svg, listData) {
    // var circles = svg.selectAll(".label_circle")
    //     .data(listData)
    //     .enter()
    //     .append("circle")
    //     .attr("class", "label_circle")
    //     .attr("cx", xScale(xScale.domain().length-1) + xScale.rangeBand()/2)
    //     .attr("cy", (d, i) => {
    //         return yScale(i) + yScale.rangeBand()/2
    //     })
    //     // .attr("r", d => radiusScale(d["coverage"]))
    //     .attr("r", 10)
    //     .attr("fill", d => colors[d["label"]])
    //     .attr("stroke", "none")

    svg.selectAll(".label_circle")
        .data(listData)
        .enter()
        .append("text")
        .attr("class", "label_circle")
        // .attr("fill", d => colors[d["label"]])
        .attr("x", xScale(xScale.domain().length-1)+10)
        .attr("y", (d, i) => {
            return yScale(i) + yScale.rangeBand()/2+rectMarginTop
        })
        .text(d => target_names[d['label']])
}

function render_reference_line(svg) {
    var lines = svg.append("g")
        .attr("class", "reference");

    lines.selectAll(".line")
        .data(rule_used_values)
        .enter()
        .append("line")
        .attr("class", "line")
        .attr("x1", (d) => xScale(d["feature"]) + widthScale[d["feature"]](d["value"]) + rectMarginH)
        .attr("x2", (d) => xScale(d["feature"]) + widthScale[d["feature"]](d["value"]) + rectMarginH)
        .attr("y1", margin.top)
        .attr("y2", height-yScale.rangeBand())
        .style("stroke", "grey")
        .style("stroke-width", 1)
        .style("stroke-dasharray", 3);
}

function generate_bar_with_horizontal_line(listData) {
    render_feature_names_and_grid(svg1, 6);
    svg1.attr("width", `${width+margin.left+margin.right}px`);

    var row = svg1.selectAll(".row")
        .data(listData)
        .enter().append("g")
        .attr("class", "row")
        .attr("transform", function(d, i) { 
            let ix = +(i >= mid);
            return `translate(${rectMarginH}, ${yScale(i)+group_margin[ix]} )`; 
        });

    // render the horizontal line in the middle
    var barHeight = (rectHeight - rectMarginTop - rectMarginBottom) / 2;
    // row.selectAll(".middle")
    //     .data(function(d) { return d["rules"]; })
    //     .enter().append("line")
    //     .attr("class", "middle")
    //     .attr("x1", function(d) { return xScale(d["feature"]) + rectMarginH; })
    //     .attr("x2", function(d) { return xScale(d["feature"]) + rectMarginH + rectWidth; })
    //     .attr("y1", barHeight + rectMarginTop)
    //     .attr("y2", barHeight + rectMarginTop)
    //     .style("stroke", "grey")
    //     .style("stroke-width", 1);

    // render the rule ranges
    let sq_text = ['L', 'M', 'H'];
    let gradientColor = [d3.lab("#91bfdb"),d3.lab("#ffffbf"),d3.lab("#fc8d59")]
    let squares = row.selectAll(".rule-fill")
        .data(function(d) { 
            var obj = d["rules"];
            to_render = [];
            obj.forEach((rule) => {
                let feat = rule['feature'];
                d3.range(3).forEach(pdc => {
                    to_render.push({'feature': feat, 'value': pdc, 'show': rule['value'].indexOf(pdc)>=0})
                })
            })
            return to_render; 
        })
        .enter()

    squares.append("rect")
        .attr("x", function(d) { 
            if (order !== undefined) {
                return xScale(order[d["feature"]])+rectXst[d['value']]
            }
            return xScale(d["feature"])+rectXst[d['value']]
        })
        .attr("width", function(d) {
            return sqWidth;
        })
        .attr("y",  rectMarginTop)
        .attr("height", rectHeight)
        // .attr("fill", d => d['show'] ? "#484848": 'white')
        .attr("fill", d => d['show'] ? gradientColor[d['value']]: 'white')
        .attr("stroke", "black");

    let rect_font_size = 12
    squares.append('text')
        .attr("x", function(d) { 
            if (order !== undefined) {
                return xScale(order[d["feature"]])+rectXst[d['value']]+sqWidth/2;
            }
            return xScale(d["feature"])+rectXst[d['value']]+sqWidth/2;
        })
        .attr("y",  rectMarginTop+rectHeight/2+1)
        .style('alignment-baseline', 'middle')
        .style("text-anchor", "middle")
        .text((d) => {
            return d['show'] ? sq_text[d['value']] : ""
        })
        .style('font-size', `${rect_font_size}px`)
        .attr('fill', '#484848')

    // prediction
    let bracket_w = 20
    let prediction = svg1.append('g')
        .attr('class', 'prediction')

    pos.forEach((pair, ix) => {
        // render the bracket
        prediction.append("path")
            .attr("class","curlyBrace")
            .attr("transform", 
                `translate(${xScale(xScale.domain().length-1)+5}, ${yScale(pair[0])+group_margin[ix]}),scale(-1,1)`)
            .attr("d", function(d) { 
                return makeCurlyBrace(
                    0, 0, 0, yScale(pair[1])-yScale(pair[0]),
                    bracket_w, 0.3); 
            });

        // prediction text
        prediction.append('text')
            .attr("x", xScale(xScale.domain().length-1)+bracket_w+10)
            .attr("y", (yScale(pair[0])+yScale(pair[1]))/2 + 5 +group_margin[ix])
            .text(target_names[listData[pair[0]]['label']])
            // .text(target_names[ix])
            .style("fill", "#484848")
    })
    
}

function main() {
    loadData();
}

main();