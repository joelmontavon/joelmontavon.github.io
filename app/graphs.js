var graphs = angular.module('graphs', []);
services.factory("graphs", ["d3",
	function (d3) {
		return function (data, from, thru) {
			var width = 1075,
				height = 150,
				cellSize = 18; // cell size 

			var percent = d3.format(".1%"),
				format = d3.time.format("%Y-%m-%d");

			var color = d3.scale.ordinal()
				.domain([1, 0])
				.range(['green', 'red']);
			
			d3.select("#calendar").selectAll("svg").remove();
			var svg = d3.select("#calendar").selectAll("svg")
				.data(d3.range(from.getFullYear(), thru.getFullYear() + 1))
			  .enter().append("svg")
				.attr("width", width)
				.attr("height", height)
				.attr("class", "RdYlGn")
			  .append("g")
				.attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");

			svg.append("text")
				.attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
				.style("text-anchor", "middle")
				.text(function(d) { return d; });
			
			var rect = svg.selectAll(".day")
				.data(function(d) {return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
			  .enter().append("rect")
				.attr("class", "day")
				.attr("width", cellSize)
				.attr("height", cellSize)
				.attr("x", function(d) { return d3.time.weekOfYear(d) * cellSize; })
				.attr("y", function(d) { return d.getDay() * cellSize; })
				.datum(format);

			rect.append("title")
				.text(function(d) { return d; });

			svg.selectAll(".month")
				.data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
			  .enter().append("path")
				.attr("class", "month")
				.attr("d", monthPath);

		  rect.filter(function(d) { return d in data; })
		    .attr("class", function(d) { return "day " + (data[d] === 1 ? 'green' : (data[d] === 0 ? 'red' : 'white')); })
			.select("title")
			  .text(function(d) { return d; });

			function monthPath(t0) {
			  var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
				  d0 = t0.getDay(), w0 = d3.time.weekOfYear(t0),
				  d1 = t1.getDay(), w1 = d3.time.weekOfYear(t1);
			  return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
				  + "H" + w0 * cellSize + "V" + 7 * cellSize
				  + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
				  + "H" + (w1 + 1) * cellSize + "V" + 0
				  + "H" + (w0 + 1) * cellSize + "Z";
			}
		};
	}
]);