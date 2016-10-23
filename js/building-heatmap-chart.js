// TODO
// default ranges
// C is -10 to 40
// % is 0 to 100

function BuildingHeatmapChart(element) {
  //root element
  this.element = element;

  //data
  this.data = null;
  this.readings = [];

  this.defaultTemperatureDomain      = [-10, 40];
  this.defaultRelativeHumidityDomain = [0, 100];
  this.defaultDewPointDomain         = [-10, 40];
  this.defaultEquilibriumMoistureContentDomain = [15, 20];

  this.selectedReadings = [];
  this.selectedType     = null;
  this.selectedTypeDefaultDomain   = [];
  this.y = null;

  this.selectedDate = null;
  this.daysOffset = 7;
  this.times      = d3.range(24);

  this.startDate  = null;
  this.endDate    = null;

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
  this.dateTimeFormat = d3.time.format('%Y-%m-%d %H:%M:%S');
  this.dateFormat     = d3.time.format('%Y-%m-%d');
  this.niceTimeFormat = d3.time.format('%a %e, %b %_I:%M%p');
  this.hourFormat     = d3.time.format('%H');
  this.dayFormat      = d3.time.format('%e');
  this.niceDayFormat  = d3.time.format('%a');

    //heatmap
  this.colorScale = null;
  this.colorRange = ["#91cf60", "#ffffbf", "#fc8d59"];
  this.dayLabels  = null;
  this.stops      = null;
  this.xScale     = null;
  this.xAxis      = null;
  this.countScale = null;

  //misc
  this.breakPoint = 320;
  this.tooltip    = null;
  this.tooltipKey = null;
  this.tooltipValue = null;
}

BuildingHeatmapChart.prototype.initData = function (data) {
  var self = this;
  this.data = data;

  var formattedReadings = this.data.tagLogs.map(function (tagLog) {
    var reading_date_time = self.dateTimeFormat.parse(tagLog.readingAt);

    return {
      date_time: reading_date_time,
      date: self.dateFormat(reading_date_time),
      day: self.dayFormat(reading_date_time),
      hour: self.hourFormat(reading_date_time),
      temperature: tagLog.temperature,
      relativeHumidity: tagLog.relativeHumidity,
      dewPoint: tagLog.dewPoint,
      equilibriumMoistureContent: tagLog.equilibriumMoistureContent
    };
  });

  this.readings = d3.nest()
    .key(function(d) { return d.date; })
    .entries(formattedReadings);

  var dateRange = d3.extent(this.readings, function(d) { return d.key; });
  this.startDate = dateRange[0];
  this.endDate   = dateRange[1];
  this.selectedDate = dateRange[1];

  this.colorScale = d3.scale.linear().range(this.colorRange);

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

  this.tooltip = this.container.append('div')
  .attr("class", "reading-tooltip");

  this.tooltipKey = this.tooltip.append('div')
  .attr("class", "key");

  this.tooltipValue = this.tooltip.append('div')
  .attr("class", "value");
};

BuildingHeatmapChart.prototype.render = function (event) {
  var self = this;
  //get dimensions based on window size
  var newWidth = $(this.element).width();
  this._updateDimensions(newWidth);

  var difference = this.selectedTypeDefaultDomain[1] - this.selectedTypeDefaultDomain[0];
  var unit = difference / (this.colorRange.length - 1);
  var colorDomain = this.colorRange.map(function(color, index) {
    return self.selectedTypeDefaultDomain[0] + (unit * index);
  });

  this.colorScale.domain(colorDomain).clamp(true);

  var readingValuesExtent = d3.extent(this.selectedReadings, function(d) {return d[self.y]; });
  var readingDomain = d3.extent(this.selectedTypeDefaultDomain.concat(readingValuesExtent));

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
  }

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
    .attr("class", function (d) { return ((d == "Sun" || d == "Sat") ? "dayLabel mono axis" : "dayLabel mono axis axis-workweek"); });

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
      return self._computeCellY(d);
    })
    .attr("class", "hour bordered")
    .attr("width", self.gridSize - 1)
    .attr("height", self.gridSize - 1)
    .style("fill", function(d) { return self.colorScale(d[self.y]); })
    .on("mouseenter", function(){ self._selectCell(this); })
    .on("mouseover", function (d) { self._moveTooltip(this, d); })
    .on("mouseout", function(){ self._deselectCell(this); });

  this.chart.on("mouseout", function () {
        self._hideTooltip();
    })
    .on("mouseenter", function () {
        self._showTooltip();
    });

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
    this.y = "temperature";

  } else if (dataType === CHART_TYPE.RELATIVE_HUMIDITY) {
    this.selectedReadings = this.tagRelativeHumidityReadings;
    this.selectedTypeDefaultDomain = this.defaultRelativeHumidityDomain;
    this.y = "relativeHumidity";

  } else if (dataType === CHART_TYPE.DEW_POINT) {
    this.selectedReadings = this.tagDewPointReadings;
    this.selectedTypeDefaultDomain = this.defaultDewPointDomain;
    this.y = "dewPoint";

  } else if (dataType === CHART_TYPE.EQUILIBRIUM_MOISTURE_CONTENT) {
    this.selectedReadings = this.tagEquilibriumMoistureContentReadings;
    this.selectedTypeDefaultDomain = this.defaultEquilibriumMoistureContentDomain;
    this.y = "equilibriumMoistureContent";

  } else {
    console.log(dataType + " not recognised.");
    return;
  }

  var self = this;
  var keyedSelectedDateReadings = this.readings.filter(function(d){ return self._filterByDate(d); });
  var selectedDateReadings = _.map(keyedSelectedDateReadings, function(reading){
    return reading.values;
  });

  this.days = this._computeDayLabels(keyedSelectedDateReadings);
  this.selectedReadings = _.flatten(selectedDateReadings);
  this.selectedType = dataType;
};

BuildingHeatmapChart.prototype._showTooltip = function () {
  this.tooltip.attr('class', 'reading-tooltip tooltipAnimated tooltipFadeIn');
};

BuildingHeatmapChart.prototype._moveTooltip = function (event, d) {
  this.tooltipKey.html(this.niceTimeFormat(d.date_time));
  this.tooltipValue.html(d[this.y] + this.selectedType.suffix);

  var coords = d3.mouse(this.chart.node());

  //get dimensions of tooltip element
  var dim = this.tooltip.node().getBoundingClientRect();

  //update the position of the tooltip
  var tooltipTop = this._computeCellY(d) + (dim.height / 2),
      tooltipLeft = (d.hour * this.gridSize) + (dim.width / 2);

  //if right edge of tooltip goes beyond chart container, force it to move to the left of the mouse cursor
  if (tooltipLeft + (dim.width / 2) > this.width) {
    tooltipLeft = coords[0] - (dim.width / 2);
  }

  this.tooltip.transition().duration(200).style({
    top: tooltipTop + 'px',
    left: tooltipLeft + 'px'
  });
};

BuildingHeatmapChart.prototype._hideTooltip = function () {
  this.tooltip.transition().duration(500).style('opacity', 0.0).attr('class', 'reading-tooltip');
};

BuildingHeatmapChart.prototype._selectCell = function (cell) {
  d3.select(cell).classed("cell-hover", true);
};

BuildingHeatmapChart.prototype._deselectCell = function (cell) {
  d3.select(cell).classed("cell-hover", false);
};

BuildingHeatmapChart.prototype._computeDayLabels = function(data) {
  var self = this;
  return _.map(data, function(d){
    var date = self.dateFormat.parse(d.key);
    return self.niceDayFormat(date);
  });
};

BuildingHeatmapChart.prototype._filterByDate = function(d){
  var fromDate = this._fromDate();
  var toDate = this.selectedDate;

  var subjectDate = d.key;
  return moment(subjectDate).isBetween(fromDate, toDate, null, '(]');
};

BuildingHeatmapChart.prototype._fromDate = function(){
  return moment(this.selectedDate).subtract(this.daysOffset, 'days');
};

BuildingHeatmapChart.prototype._computeCellY = function(d){
  var initialDay = this._fromDate();
  var subjectDay = moment(d.date);

  var duration = moment.duration(subjectDay.diff(initialDay));
  var multiplier = duration.days() - 1;

  return multiplier * this.gridSize;
};

BuildingHeatmapChart.prototype.canScanForward = function(){
  return moment(this.selectedDate).isBefore(this.endDate);
};

BuildingHeatmapChart.prototype.canScanBackward = function(){
  return moment(this._fromDate()).isAfter(this.startDate);
};

BuildingHeatmapChart.prototype.scanForward = function(){
  if(this.canScanForward()){
    this.selectedDate = moment(this.selectedDate).add(1, 'days').format('Y-MM-DD');
    this.renderData(this.selectedType);
  }
};

BuildingHeatmapChart.prototype.scanBackward = function(){
  if(this.canScanBackward()){
    this.selectedDate = moment(this.selectedDate).subtract(1, 'days').format('Y-MM-DD');
    this.renderData(this.selectedType);
  }
};
