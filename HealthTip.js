
//Part 1 setup

var margin = {top: 300, right: 300, bottom: 300, left: 300};
var radius1 = Math.min(margin.top, margin.right, margin.bottom, margin.left) - 10;

var width = 650 - margin.left - margin.right;
var height = 700 - margin.bottom - margin.top;
var centered;


var hue = d3.scale.category10();

var luminance = d3.scale.sqrt()
    .domain([0, 1e6])
    .clamp(true)
    .range([90, 20]);

var detailVis = d3.select("#statisticBarChart").append("svg").attr({
                   width:600,
                   height:375
                 })

var textVis = d3.select("#textBox").append("svg").attr({
                   width:600,
                   height:375
                 })

var CalorieForm = d3.select("#foodChart").append("table").attr({
                   width:400,
                   height:500
                 })

var canvas = d3.select("#donutChart").append("svg").attr({
         width: width + margin.left + margin.right,
         height: height + margin.top + margin.bottom
         })
     
var svg = canvas.append("g").attr("id", "container").attr({
             transform: "translate(" + margin.left + "," + margin.top + ")"
         });





// Part 2 setup
var diameter = 800,
    radius = diameter / 2,
    innerRadius = radius - 120;

var cluster = d3.layout.cluster()
    .size([360, innerRadius])
    .sort(null)
    .value(function(d) { return d.size; });

var bundle = d3.layout.bundle();

var line = d3.svg.line.radial()
    .interpolate("bundle")
    .tension(.85)
    .radius(function(d) { return d.y; })
    .angle(function(d) { return d.x / 180 * Math.PI; });

var svgPart2 = d3.select("#relationNet").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
    .append("g")
    .attr("transform", "translate(" + radius + "," + radius + ")");

var link = svgPart2.append("g").selectAll(".link"),
    node = svgPart2.append("g").selectAll(".node");



createVisualization()

// Data for Part 1 (Donut/ textbox/ barchart)


function createVisualization(){

d3.json("../data/personalData.json", function(error, data) {

 var defaultRoot = data[0];


 DonutRender(data,defaultRoot);


loadRelationNet();

});

}



function jumpto(x){
    

        d3.selectAll("#donut").remove();
        removeTextID();
        removeText();
        barChartUpdate();
        removeCenterText();

    d3.json("../data/personalData.json", function(error, data) {
      
      var root;
      for (var i=0;i<data.length;i++){
        if (x==data[i].name) root = data[i];
      }



      DonutRender(data,root);
    });
}




// Data for Part 2 (relationNet)

function loadRelationNet() {

d3.json("../data/relationNetDataset.json", function(error, classes) {

  var nodes = cluster.nodes(packageHierarchy(classes)),
      links = packageImports(nodes);

  link = link
      .data(bundle(links))
      .enter().append("path")
      .each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
      .attr("class", "link")
      .attr("d", line);

  node = node
      .data(nodes.filter(function(n) {return !n.children; }))
      .enter().append("text")
      .attr("class", "node")
      .attr("dx", function(d) { return d.x < 180 ? 8 : -8; })
      .attr("dy", ".31em")
      .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")" + (d.x < 180 ? "" : "rotate(180)"); })
      .style("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
      .text(function(d) { 
            if(d.key.length<3){
              if(d.key.charAt(1) != "i")return "";
              else return d.key;
            } 
            else return d.key; 
      })
      .on("mouseover", mouseovered)
      .on("mouseout", mouseouted);


      loadFoodChart(classes);
});

}














//Food Chart
function loadFoodChart(classes) {

d3.csv("../data/projectData.csv", function(error, data){
      data.shift()


      var foodChartData = [];

      for(var i=0;i<classes.length;i++){
        for(var j=0;j<data.length;j++){
          if(classes[i].name == data[j]["Food Item"]){
              var foodChartDataItem = {FoodItem:classes[i].name,Calories:data[j].Calories}
              foodChartData.push(foodChartDataItem);
          }
        }
      }




             caption = CalorieForm.append("caption")
                            .text("Food Calorie Table")
                            .style("font-size",20+"px")
                            .style("font-family","helvetica")
                            .style("text-anchor","middle")
                            .style("font-weight","bold")

             columns = ["Food","Calorie"],
             tbody = CalorieForm.append("tbody"),
             rows = CalorieForm.selectAll("tr")
                               .data(foodChartData).enter().append("tr")
             zebra()
             thead = CalorieForm.append("thead").append("tr").selectAll("th").data(columns).enter().append("th")
                          .text(function(d) { return d;})
                          .style("font-size",12+"px")
                          .style("font-family","helvetica")
                          .style("text-anchor","middle")
                          .style("font-weight","bold")
                          .style("background-color","#c4c4c4")

             cells = rows.selectAll("td").data(function(row) {
                          return d3.range(Object.keys(row).length).map(function(column, i) {
                          return row[Object.keys(row)[i]]; });
                          }).enter().append("td").text(function(d) { return d; })
                            .style("font-size",12+"px")
                            .style("font-family","helvetica");

});
}


























// Donut Chart Visualization



function DonutRender (data,root){



   var partition = d3.layout.partition()
       .sort(function(a, b) { 
         return d3.ascending(parseInt(a.name.charAt(3) + a.name.charAt(4)), parseInt(b.name.charAt(3) + b.name.charAt(4)));   
       })
       .size([2 * Math.PI, radius1]);
   
   var arc = d3.svg.arc()
       .startAngle(function(d) { return d.x; })
       .endAngle(function(d) { return d.x + d.dx - .01 / (d.depth + .5); })
       .innerRadius(function(d) { return radius1 +1/ 10 * d.depth; })
       .outerRadius(function(d) { return radius1 / 3 * (d.depth + 1) - 1; });

      partition
          .value(function(d) {
            return d.cal; })
          .nodes(root)
          .forEach(function(d) {
            d._children = d.children;
            d.key = key(d);
            d.fill = fill(d);
            if(d.depth == 1) {
              d.sum = d._children[0].value-d._children[1].value;
            }
            else d.sum = d.value;          
          });


          partition
              .children(function(d, depth) { return depth < 2 ? d._children : null; })
              .value(function(d) {
                return d.sum; });



  var center = svg.append("circle")
      .attr("r", 30)
      .on("click", zoomOut);

  center.append("title")
      .text("zoom out");
      
  svg.append("text")
         .attr("id", "textCenter")
         .attr("text-anchor", "middle")
         .attr("font-family", "Helvetica Neue")
         .style("font-size", "56px")
         .text(root.name);
         

      svg.append("text")
         .attr("id", "textCenter")
         .attr("x", -160)
         .attr("y", 75)
         .attr("font-family", "Helvetica Neue")
         .style("font-size", "34px")
         .text("30 Day" + " Health Status");

  var path = svg.selectAll("path")
      .data(partition.nodes(root).slice(1))
      .enter().append("path")
      .attr("d", arc)
      .attr("id", "donut")
      .style("fill", function(d) { return d.fill; })
      .each(function(d) { this._current = updateArc(d); })
      .on("click", zoomIn)
      .on("mouseover", mouseover)
      .on("mouseleave", mouseleave);

      defaultTextID(root);
      defaultText(root);
      renderBarDefaultVis(root);


                          function zoomIn(p) {



                            if (p.depth > 1){
                              p = p.parent;
                            } 
                            if (!p.children) return;
                            zoom(p, p);
                            removeCenterText();
                            removeText();
                            barChartUpdate();


                           svg.selectAll("#donut")
                              .on("mouseover", mouseover)
                              .on("mouseleave", mouseleave);

                               if(p.children.length == 2){
                                 insertText(p);
                                 renderBarSecondVis(p);

                                } 
                        	     else {
                                 insertTextFoodDetail(p);
                               }                     	                          
                          }
                

                          function zoomOut(p) {
                            if (!p.parent) return;
                            zoom(p.parent, p);
                            removeCenterText();
                            removeText();
                            barChartUpdate();

                                 svg.selectAll("#donut")
                                    .on("mouseover", mouseover)
                                    .on("mouseleave", mouseleave);

                               if(p.parent.children.length == 2){
                                 insertText(p.parent);
                                 renderBarSecondVis(p.parent);

                                } 
                               else {
                                 defaultText(root);
                                 renderBarDefaultVis(root);
                               } 
                          }
                        
                          function zoom(root, p) {
                            if (document.documentElement.__transition__) return;
                        
                            var enterArc,
                                exitArc,
                                outsideAngle = d3.scale.linear().domain([0, 2 * Math.PI]);
                        
                            function insideArc(d) {
                              return p.key > d.key
                                  ? {depth: d.depth - 1, x: 0, dx: 0} : p.key < d.key
                                  ? {depth: d.depth - 1, x: 2 * Math.PI, dx: 0}
                                  : {depth: 0, x: 0, dx: 2 * Math.PI};
                            }
                        
                            function outsideArc(d) {
                              return {depth: d.depth + 1, x: outsideAngle(d.x), dx: outsideAngle(d.x + d.dx) - outsideAngle(d.x)};
                            }
                            
                            
                            center.datum(root);
                        
                            if (root === p) enterArc = outsideArc, exitArc = insideArc, outsideAngle.range([p.x, p.x + p.dx]);
                        
                            path = path.data(partition.nodes(root).slice(1), function(d) { return d.key; });
                        
                            if (root !== p) enterArc = insideArc, exitArc = outsideArc, outsideAngle.range([p.x, p.x + p.dx]);
                        
                            d3.transition().duration(d3.event.altKey ? 7500 : 750).each(function() {
                              path.exit().transition()
                                  .style("fill-opacity", function(d) { return d.depth === 1 + (root === p) ? 1 : 0; })
                                  .attrTween("d", function(d) { return arcTween.call(this, exitArc(d)); })
                                  .remove();
                        
                              path.enter().append("path")
                                  .style("fill-opacity", function(d) { return d.depth === 2 - (root === p) ? 1 : 0; })
                                  .style("fill", function(d) { return d.fill; })
                                  .attr("id","donut")
                                  .on("click", zoomIn)
                                  .each(function(d) { this._current = enterArc(d); });
                        
                              path.transition()
                                  .style("fill-opacity", 1)
                                  .attrTween("d", function(d) { return arcTween.call(this, updateArc(d)); });
                            });
                          }
                        
                        function key(d) {
                          var k = [], p = d;
                          while (p.depth) k.push(p.name), p = p.parent;
                          return k.reverse().join(".");
                        }
                        
                        function fill(d) {
                          var color = d3.scale.linear()
                            .domain([0, 3000])
                            .range(["white", "black"]);
                        
                        
                        
                        if(d.name == "exercise" ||d.name == undefined) return "#4690ff";
                        else if(d.name == "food") return "#ffb346";
                        else if(d.name == "breakfast") return "#ffba56";
                        else if(d.name == "lunch") return "#ffc36e";
                        else if(d.name == "dinner") return "#ffd394";
                        else if(d.name == "other") return "#ffe3bc";
                        else{ return "#8484a8";
                        
                        }}
                        
                        function arcTween(b) {
                          var i = d3.interpolate(this._current, b);
                          this._current = i(0);
                          return function(t) {
                            return arc(i(t));
                          };
                        }
                        
                        function updateArc(d) {
                          return {depth: d.depth, x: d.x, dx: d.dx};
                        }

}




// Mouse Hover; Center Text Function


function mouseover(d) {

   removeCenterText();

   d3.selectAll("#donut")
      .style("opacity", 0.3);
 
   d3.select(this)
       .style("opacity", 1);


   svg.append("text")
      .attr("id", "textCenter")
      .attr("text-anchor", "middle")
      .attr("font-family", "Helvetica Neue")
      .style("font-size", "56px")
      .style("fill","grey")
      .text(d.parent.name);


  if(d.children && d.children.length == 2){
        svg.append("text")
           .attr("id", "textCenter")
           .attr("x", -160)
           .attr("y", 75)
           .attr("font-family", "Helvetica Neue")
           .style("font-size", "34px")
           .text(d.name + " Health Status");

        barHighlight(d);   
     }

  else if(d.children && d.children.length == 1){
        svg.append("text")
           .attr("id", "textCenter")
           .attr("x", -65)
           .attr("y", 75)
           .attr("font-family", "Helvetica Neue")
           .style("font-size", "34px")
           .text(d.name);
     }

  else if(d.children && d.children.length == 4){
     svg.append("text")
        .attr("id", "textCenter")
        .attr("x", -45)
        .attr("y", 75)
        .attr("font-family", "Helvetica Neue")
        .style("font-size", "34px")
        .text(d.name);
  }
  else if(d.name){
     svg.append("text")
        .attr("id", "textCenter")
        .attr("x", -65)
        .attr("y", 75)
        .attr("font-family", "Helvetica Neue")
        .style("font-size", "34px")
        .text(d.name);
  }
      
}



function mouseleave(d) {

   removeCenterText();
   barHighlightOff();

   d3.selectAll("#donut")
      .style("opacity", 1);

      svg.append("text")
         .attr("id", "textCenter")
         .attr("text-anchor", "middle")
         .attr("font-family", "Helvetica Neue")
         .style("font-size", "56px")
         .text(d.parent.name);

   if(d.children && d.children.length == 2){
        svg.append("text")
           .attr("id", "textCenter")
           .attr("x", -160)
           .attr("y", 75)
           .attr("font-family", "Helvetica Neue")
           .style("font-size", "34px")
           .text("30 Day" + " Health Status");
     }

}

function removeCenterText()
    {
      d3.selectAll("#textCenter").remove();
    }









// Text Box Function


function defaultTextID(d)
    {

      textVis.append("text")
             .attr("id", "textID")
             .attr("x", 60)
             .attr("y", 220)
             .attr("font-family", "Helvetica Neue")
             .attr("text-anchor", "center")
             .style("fill","grey")
             .style("font-size", "34px")
             .html(d.name); 
      


    var img = textVis.append("svg:image")
                      .attr("id", "textID")
			              	.attr("xlink:href", "../data/"+d.name+".jpg")
			              	.attr("width", 150)
			              	.attr("height", 150)
			              	.attr("x", 60)
			              	.attr("y",0);     
                        
    }


function defaultText(d)
    {

      textVis.append("text")
             .attr("id", "text2")
             .attr("x", 60)
             .attr("y", 245)
             .attr("font-family", "Helvetica Neue")
             .attr("text-anchor", "center")
             .style("font-size", "18px")
             .text("Goal Calorie Surplus (avg):" + " " + "400.00" + " cal"); 

             console.log(d.children);
var numDD=0;

for(i=0;i<d.children.length;i++){

  numDD+=d.children[i].sum;
}

console.log(numDD);



var num = numDD/30;    
var avg = num.toFixed(2)

      textVis.append("text")
         .attr("id", "text2")
         .attr("x", 60)
         .attr("y", 270)
         .attr("font-family", "Helvetica Neue")
         .attr("text-anchor", "center")
         .style("font-size", "18px")
         .text("Actual Calorie Surplus (avg):" + " " + avg + " cal");
    }


function insertText(d)
    {

     textVis.append("text")
             .attr("id", "text2")
             .attr("x", 60)
             .attr("y", 245)
             .attr("font-family", "Helvetica Neue")
             .attr("text-anchor", "center")
             .style("font-size", "18px")
             .text("Exercise Goal" + " (" + d.name + ") :" + "350.00" + " cal"); 


     textVis.append("text")
             .attr("id", "text2")
             .attr("x", 60)
             .attr("y", 270)
             .attr("font-family", "Helvetica Neue")
             .attr("text-anchor", "center")
             .style("font-size", "18px")
             .text("Exercise Actual" + " (" + d.name + ") :" + d.children[1].value.toFixed(2) + " cal");         
 

      textVis.append("text")
             .attr("id", "text2")
             .attr("x", 60)
             .attr("y", 295)
             .attr("font-family", "Helvetica Neue")
             .attr("text-anchor", "center")
             .style("font-size", "18px")
             .text("Food Goal" + " (" + d.name + ") :" + "600.00" + " cal"); 


     textVis.append("text")
             .attr("id", "text2")
             .attr("x", 60)
             .attr("y", 320)
             .attr("font-family", "Helvetica Neue")
             .attr("text-anchor", "center")
             .style("font-size", "18px")
             .text("Food Actual" + " (" + d.name + ") :" + d.children[0].value.toFixed(2) + " cal");           
    }


    function insertTextFoodDetail(d)
    {

      if(d.children.length == 1){

      textVis.append("text")
             .attr("id", "text2")
             .attr("x", 60)
             .attr("y", 245)
             .attr("font-family", "Helvetica Neue")
             .attr("text-anchor", "center")
             .style("font-size", "18px")
             .text("Exercise" + ": " + d.children[0].value.toFixed(2) + " cal");
      }

      else {

      textVis.append("text")
             .attr("id", "text2")
             .attr("x", 60)
             .attr("y", 245)
             .attr("font-family", "Helvetica Neue")
             .attr("text-anchor", "center")
             .style("font-size", "18px")
             .text("Breakfast" + ": " + d.children[0].value.toFixed(2) + " cal"); 


     textVis.append("text")
             .attr("id", "text2")
             .attr("x", 60)
             .attr("y", 270)
             .attr("font-family", "Helvetica Neue")
             .attr("text-anchor", "center")
             .style("font-size", "18px")
             .text("Lunch" + ": " + d.children[1].value.toFixed(2) + " cal");         
 

      textVis.append("text")
             .attr("id", "text2")
             .attr("x", 60)
             .attr("y", 295)
             .attr("font-family", "Helvetica Neue")
             .attr("text-anchor", "center")
             .style("font-size", "18px")
             .text("Dinner" + ": " + d.children[2].value.toFixed(2) + " cal");


     textVis.append("text")
             .attr("id", "text2")
             .attr("x", 60)
             .attr("y", 320)
             .attr("font-family", "Helvetica Neue")
             .attr("text-anchor", "center")
             .style("font-size", "18px")
             .text("Other" + ": " + d.children[3].value.toFixed(2) + " cal");

      }
      
    }

   function removeText()
    {
      d3.selectAll("#text2").remove();
    }

    function removeTextID()
    {
      d3.selectAll("#textID").remove();
    }




// Bar Chart Function


function renderBarDefaultVis (selectData) {

var x = d3.scale.ordinal()
    .rangeRoundBands([50, 500], .1);


var y = d3.scale.linear()
    .range([2.5*height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")


var data2 = [];


for(var i=0;i<selectData.children.length;i++){
  data2.push({name:selectData.children[i].name.substr(3,selectData.children[i].name.length-1),value:selectData.children[i].sum});
}


  x.domain(data2.map(function(d) { return d.name; }));
  y.domain([0, 1500]);



detailVis.append("g")
         .attr("id", "barChartVis2")
         .attr("class", "x axis")
         .attr("transform", "translate(0," + 2.5*height + ")")
         .call(xAxis);

detailVis.append("g")
      .attr("id", "barChartVis2")
      .attr("class", "y axis")
      .call(yAxis)
      .attr("transform", "translate("+50+",0)")
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .style("font-size", "16px")
      .text("calorie");

detailVis.selectAll(".bar")
      .data(data2)
      .enter().append("rect")
      .attr("id", "barChartVis2")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.name); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.value); })
      .attr("height", function(d) { return 2.5*height - y(d.value); })
      .style("fill", "#8484a8")
      .on("mouseover", mouseoverSecondary)
      .on("mouseleave", mouseleaveSecondary);

}


    
function mouseoverSecondary (d) {

 d3.selectAll(".bar")
      .style("opacity", 0.3);
 
   d3.select(this)
       .style("opacity", 1);
}



function mouseleaveSecondary (d) {

    d3.selectAll(".bar")
      .style("opacity", 1);
  
}




function barHighlight (d) {

  var selectDay = d.name.substr(3,d.name.length-1);

  if(d == null){
     detailVis.selectAll(".bar")
               .style("opacity", 1);
         }
  else{
     detailVis.selectAll(".bar")
               .style("opacity", function(q) {
                   if(q.name == selectDay) return 1;
                   else return 0.3;
               });
  }
}

function barHighlightOff () {

     detailVis.selectAll(".bar")
               .style("opacity", 1);

}




function renderBarSecondVis (selectData) {



var x = d3.scale.ordinal()
    .rangeRoundBands([50, 400], .1);

var y = d3.scale.linear()
    .range([2*height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")


var data2 = [];

data2.push({name:"ExerciseActual",value:selectData.children[1].value});
data2.push({name:"ExerciseGoal",value:350});
data2.push({name:"FoodActual",value:selectData.children[0].value});
data2.push({name:"FoodGoal",value:600});

var xRange = [];
xRange.push("ExerciseGoal","ExerciseActual", "" ,"FoodGoal", "FoodActual");
  x.domain(xRange);
  y.domain([0, 1500]);



detailVis.append("g")
         .attr("id", "barChartVis2")
         .attr("class", "x axis")
         .attr("transform", "translate(0," + 2*height + ")")
         .call(xAxis);

detailVis.append("g")
      .attr("id", "barChartVis2")
      .attr("class", "y axis")
      .call(yAxis)
      .attr("transform", "translate("+50+",0)")
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .style("font-size", "16px")
      .text("calorie");

detailVis.selectAll(".bar")
      .data(data2)
      .enter().append("rect")
      .attr("id", "barChartVis2")
      .style("fill", function(d) {
      	if(d.name == "ExerciseGoal" || d.name == "ExerciseActual")
      	{
      		return "#4690ff";
      	}
      	else
      	{
      		return "#ffb346";
      	}
      })
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.name); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.value); })
      .attr("height", function(d) { return 2*height - y(d.value); });  
}


function barChartUpdate()
    {
      d3.selectAll("#barChartVis2").remove();
    }

















// Part 2 Visualization Function

function mouseovered(d) {

  if(d.size != 4000) foodDes(d);


 link
      .classed("link--target", false)
      .classed("link--source", false);

  node
      .classed("node--target", false)
      .classed("node--source", false);


  node
      .each(function(n) { n.target = n.source = false; });

  link
      .classed("link--target", function(l) { if (l.target === d) return l.source.source = true; })
      .classed("link--source", function(l) { if (l.source === d) return l.target.target = true; })
      .filter(function(l) { return l.target === d || l.source === d; })
      .each(function() { this.parentNode.appendChild(this); });

  node
      .classed("node--target", function(n) { return n.target; })
      .classed("node--source", function(n) { return n.source; });
}

function mouseouted(d) {

  zebra();

  link
      .classed("link--target", false)
      .classed("link--source", false);

  node
      .classed("node--target", false)
      .classed("node--source", false);
}

//d3.select(self.frameElement).style("height", diameter + "px");

// Lazily construct the package hierarchy from class names.
function packageHierarchy(classes) {
  var map = {};

  function find(name, data) {
    var node = map[name], i;
    if (!node) {
      node = map[name] = data || {name: name, children: []};
      if (name.length) {
        node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
        node.parent.children.push(node);
        node.key = name.substring(i + 1);
      }
    }
    return node;
  }

  classes.forEach(function(d) {
    find(d.name, d);
  });

  return map[""];
}

// Return a list of imports for the given array of nodes.
function packageImports(nodes) {
  var map = {},
      imports = [];

  // Compute a map from name to node.
  nodes.forEach(function(d) {
    map[d.name] = d;
  });

  // For each import, construct a link from the source to target node.
  nodes.forEach(function(d) {
    if (d.imports) d.imports.forEach(function(i) {
      imports.push({source: map[d.name], target: map[i]});
    });
  });

  return imports;
}






// Food Calorie Form Function
 function zebra(){
     CalorieForm.selectAll("tr").style("background-color", function(d, i) {
                       if (i%2==0){return "#efefef";}
                       else{return "#c4c4c4";}
                     })

   }



function foodDes(d){

var foodChartTr = CalorieForm.selectAll("tr")[0];
var index = null;

for(var i=0;i<CalorieForm.selectAll("tr")[0].length-1; i++){

   if(d.name == CalorieForm.selectAll("tr")[0][i].__data__.FoodItem) index = i;

 }
console.log(index);


CalorieForm.selectAll("tr").style("background-color",function(d,j){
                       if(j == index)return "#ffb346";
                       else {
                        if (j%2==0){return "#efefef";}
                        else{return "#c4c4c4";}
                       }
                     });

}