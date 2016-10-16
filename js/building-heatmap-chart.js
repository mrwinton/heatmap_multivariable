// TODO
// default ranges
// C is -10 to 40
// % is 0 to 100

function BuildingHeatmapChart(element) {
  //root element
  this.element = element;

  //data
  this.data = null;
  this.tagTemperatureReadings       = [];
  this.tagRelativeHumidityReadings  = [];
  this.tagDewPointReadings          = [];
  this.tagEquilibriumMoistureContentReadings = [];

  this.defaultTemperatureDomain      = [-10, 40];
  this.defaultRelativeHumidityDomain = [0, 100];
  this.defaultDewPointDomain         = [-10, 40];
  this.defaultEquilibriumMoistureContentDomain = [10, 20];

  this.selectedReadings = [];
  this.selectedType     = null;
  this.selectedTypeDefaultDomain   = [];

  //base graph
  this.container  = null;
  this.svg        = null;
  this.chart      = null;
  this.area       = null;
  this.clip       = null;
  this.margin     = {};
  this.width      = null;
  this.height     = null;
  this.gridSize   = null;

  this.timeLabelArea  = null;
  this.dayLabelArea   = null;

  //time formats
  this.timeFormat     = d3.time.format('%Y-%m-%d %H:%M:%S');
  this.niceTimeFormat = d3.time.format('%a %e, %b %_I:%M%p');
  this.hourFormat     = d3.time.format('%H');
  this.dayFormat      = d3.time.format('%e');

  this.days   = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
  this.times  = d3.range(24);

  //heatmap
  this.colorScale = null;
  this.dayLabels  = null;
  this.stops      = null;
  this.xScale     = null;
  this.xAxis      = null;
  this.countScale = null;

  //misc
  this.breakPoint = 320;

}

BuildingHeatmapChart.prototype.initData = function (data) {
  var self = this;
  this.data = data;

  this.data.tagLogs.forEach(function (tagLog) {
    var reading_date = self.timeFormat.parse(tagLog.readingAt);

    self.tagTemperatureReadings.push(
      {
        date: reading_date,
        day: self.dayFormat(reading_date),
        hour: self.hourFormat(reading_date),
        y: tagLog.temperature
      });

    self.tagRelativeHumidityReadings.push({
        date: reading_date,
        day: self.dayFormat(reading_date),
        hour: self.hourFormat(reading_date),
        y: tagLog.relativeHumidity
      });

    self.tagDewPointReadings.push(
      {
        date: reading_date,
        day: self.dayFormat(reading_date),
        hour: self.hourFormat(reading_date),
        y: tagLog.dewPoint
      });

    self.tagEquilibriumMoistureContentReadings.push(
      {
        date: reading_date,
        day: self.dayFormat(reading_date),
        hour: self.hourFormat(reading_date),
        y: tagLog.equilibriumMoistureContent
      });
  });

  this.colorScale = d3.scale.linear().range(["#FFFFDD", "#3E9583", "#1F2D86"])

  this.xScale     = d3.scale.linear();
  this.countScale = d3.scale.linear();
  this.xAxis      = d3.svg.axis();

  this._selectDataType(CHART_TYPE.EQUILIBRIUM_MOISTURE_CONTENT);
};

BuildingHeatmapChart.prototype.initChart = function () {
  this.container = d3.select(this.element).style('position', 'relative');
  this.svg = this.container.append('svg');
  this.chart = this.svg.append('g');

  this.dayLabelArea = this.chart.append('g')
    .attr('id', 'day-label-area');

  this.timeLabelArea = this.chart.append('g')
    .attr('id', 'day-label-area');

  this.dayLabels = this.dayLabelArea.selectAll(".dayLabel")
  .data(this.days)
  .enter().append("text");

  this.timeLabels = this.timeLabelArea.selectAll(".timeLabel")
  .data(this.times)
  .enter().append("text");

  this.area = this.chart.append('g')
    .attr('clip-path', 'url(#areaClip)');

  this.clip = this.area.append('clipPath')
    .attr('id', 'areaClip')
    .append('rect');

  this.heatMap = this.area.selectAll(".hour")
  .data(this.selectedReadings)
  .enter().append("rect");

  this.gradient = this.chart.append("defs")
  .append("linearGradient")
  .attr("id", "legend-traffic")
  .attr("x1", "0%").attr("y1", "0%")
  .attr("x2", "100%").attr("y2", "0%");

  this.legendWrapper = this.svg.append("g")
  .attr("class", "legendWrapper");

  this.legend = this.legendWrapper.append("rect")
  .attr("class", "legendRect");

  this.legendTitle = this.legendWrapper.append("text")
  .attr("class", "legendTitle");

  this.xAxisElement = this.legendWrapper.append("g")
  .attr("class", "axis")
  .attr("transform", "translate(0," + (10) + ")");
};

BuildingHeatmapChart.prototype.render = function (event) {
  var self = this;
  //get dimensions based on window size
  var newWidth = $(this.element).width();
  this._updateDimensions(newWidth);

  // TODO should incorporate the min and max of the readings
  var readingValuesExtent = d3.extent(this.selectedReadings, function(d) {return d.y; });
  // var colorDomain = [0, maxValue/2, maxValue];
  var readingDomain = d3.extent(this.selectedTypeDefaultDomain.concat(readingValuesExtent));
  this.colorScale.domain(readingDomain);

  this.countScale
    .domain(readingDomain)
    .range([0, newWidth]);

  //Calculate the variables for the temp gradient
  var numStops  = 10;
  countRange    = this.countScale.domain();
  countRange[2] = countRange[1] - countRange[0];
  countPoint    = [];
  for(var i = 0; i < numStops; i++) {
    countPoint.push(i * countRange[2]/(numStops-1) + countRange[0]);
  }//for i

  //update svg elements to new dimensions
  this.svg.attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom);
  this.chart.attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
  this.clip.attr({
    width: this.width + 5,
    height: this.days.length * this.gridSize
  });

  this.dayLabels
    .text(function (d) { return d; })
    .attr("x", 0)
    .attr("y", function (d, i) { return i * self.gridSize; })
    .style("text-anchor", "end")
    .attr("transform", "translate(-6," + self.gridSize / 1.5 + ")")
    .attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });

  this.timeLabels
    .text(function(d) { return d; })
    .attr("x", function(d, i) { return i * self.gridSize; })
    .attr("y", 0)
    .style("text-anchor", "middle")
    .attr("transform", "translate(" + self.gridSize / 2 + ", -6)")
    .attr("class", function(d, i) { return ((i >= 8 && i <= 17) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });

  this.heatMap
    .attr("x", function(d) {
      return (d.hour) * self.gridSize;
    })
    .attr("y", function(d) {
      return (d.day - 1) * self.gridSize;
    })
    .attr("class", "hour bordered")
    .attr("width", self.gridSize)
    .attr("height", self.gridSize)
    .style("stroke", "white")
    .style("stroke-opacity", 0.6)
    .style("fill", function(d) { return self.colorScale(d.y); });

  // TODO remove previous data?
  this.stops = this.gradient.selectAll("stop")
    .data(d3.range(numStops))
    .enter().append("stop");

  this.stops.attr("offset", function(d,i) {
      return self.countScale( countPoint[i] )/newWidth;
    })
    .attr("stop-color", function(d,i) {
      return self.colorScale( countPoint[i] );
    });

  var legendWidth = newWidth*0.8;

  this.legendWrapper
    .attr("transform", "translate(" + (newWidth/2) + "," + (this.gridSize * this.days.length + 50) + ")");

  this.legend
    .attr("x", -legendWidth/2)
    .attr("y", 0)
    .attr("width", legendWidth)
    .attr("height", 10)
    .style("fill", "url(#legend-traffic)");

  this.legendTitle
    .attr("x", 0)
    .attr("y", -10)
    .style("text-anchor", "middle")
    .text(this.selectedType.name);

  this.xScale
    .range([-legendWidth/2, legendWidth/2])
    .domain(readingDomain);

  this.xAxis
    .orient("bottom")
    .ticks(5)
    .scale(this.xScale)
    .tickFormat(function (d) {
        return d + self.selectedType.suffix;
    });

  this.xAxisElement.call(this.xAxis);
};


BuildingHeatmapChart.prototype.renderData = function (dataType) {
  this._selectDataType(dataType);
  this.render(null);
};

BuildingHeatmapChart.prototype._updateDimensions = function (newWidth) {
  this.margin.top     = 20;
  this.margin.right   = newWidth < this.breakPoint ? 0 : 50;
  this.margin.left    = newWidth < this.breakPoint ? 0 : 50;
  this.margin.bottom  = 20;

  this.width    = newWidth - this.margin.left - this.margin.right;
  this.gridSize = Math.floor(this.width / this.times.length);
  this.height   =  this.gridSize * (this.days.length + 2);
};

BuildingHeatmapChart.prototype._selectDataType = function (dataType) {
  if (dataType === CHART_TYPE.TEMPERATURE) {
    this.selectedReadings = this.tagTemperatureReadings;
    this.selectedTypeDefaultDomain = this.defaultTemperatureDomain;

  } else if (dataType === CHART_TYPE.RELATIVE_HUMIDITY) {
    this.selectedReadings = this.tagRelativeHumidityReadings;
    this.selectedTypeDefaultDomain = this.defaultRelativeHumidityDomain;

  } else if (dataType === CHART_TYPE.DEW_POINT) {
    this.selectedReadings = this.tagDewPointReadings;
    this.selectedTypeDefaultDomain = this.defaultDewPointDomain;

  } else if (dataType === CHART_TYPE.EQUILIBRIUM_MOISTURE_CONTENT) {
    this.selectedReadings = this.tagEquilibriumMoistureContentReadings;
    this.selectedTypeDefaultDomain = this.defaultEquilibriumMoistureContentDomain;

  } else {
    console.log(dataType + " not recognised.");
    return;
  }

  this.selectedType = dataType;
};
