function SwiftChart(options) {
  this.canvas = $(options.canvas);
  this.drawingOptions = {}
  this.data = {};
  this.type = options.type || "Bar";
  this.colors = options.colors || ["97BBCD", "DCDCDC", "3B8183", "ED303C", "FF9C5B", "FAD089",  "C584CC", "DFB190", "D4728B" ];

  // Initialize Context
  this.ctx = this.canvas.get(0).getContext("2d");

  // Resize
  this.resize();

  // Initialize Chart.js Chart
  this.chart = new Chart(this.ctx);
}

SwiftChart.prototype.redraw = function(options) {
  var options = _.defaults(options || {}, this.drawingOptions);
  this._draw(this.data, options);
};

SwiftChart.prototype._regenerateChart = function() {
  var context = this.ctx;

  delete this.chart;
  this.resize();
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);

  this.chart = new Chart(this.ctx);
};

SwiftChart.prototype.draw = function(data, options) {
  this.data = data || {};
  this.drawingOptions = options || {};

  this._draw(this.data, this.drawingOptions);
};

SwiftChart.prototype._draw = function(data, options) {
  var chartData = this.transform(this.type, data);
  this._regenerateChart();
  this.chart[this.type](chartData, options);
};

SwiftChart.prototype.resize = function() {
  var maxWidth, maxHeight;

  maxWidth = this.canvas.parent().width();
  maxHeight = Math.round(maxWidth * (11/38), 0);

  this.canvas.attr("width", maxWidth);
  this.canvas.css("width", maxWidth + "px");
  this.canvas.attr("height", maxHeight);
  this.canvas.css("height", maxHeight + "px");
};

SwiftChart.prototype.transform = function(type, data) {
  if(_.contains(["Line", "Bar", "Radar"], type)) {
    return this._complexTransform(data);
  } else {
    return this._simpleTransform(data);
  }
};

SwiftChart.prototype._simpleTransform = function(data) {
  var output = []
    , actualIndex, label, value;

  for(var i = 0; i < data.length; i++) {
    actualIndex = i % this.colors.length;
    if(data[i].length > 1) {
      label = data[i][0];
      value = parseInt(data[i][1]);
    } else {
      label = undefined;
      value = parseInt(data[i][0]);
    }

    output.push({
      label: label,
      value: value,
      color: this.colors[actualIndex]
    });
  }

  return output;
};

SwiftChart.prototype._complexTransform = function(data) {
  var output = { labels: [], datasets: [] };

  for(var h = 0; h < data[0].length - 1; h++) {
    // TODO: If any row has a different length, this will break
    output.datasets.push(this._getEmptyDataset(h));
  }

  _.each(data, function(row) {
    output.labels.push(row[0]);
    for(var i = 1; i < row.length; i++) {
      var dataset = output.datasets[i - 1]
      if(dataset) dataset.data.push(parseInt(row[i]));
    };
  });

  return output;
};

SwiftChart.prototype._getEmptyDataset = function(index) {
  var actualIndex = index % this.colors.length
    , rgb = hexToRGB(this.colors[actualIndex]);

  return {
    fillColor : "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ", 0.5)",
    strokeColor : "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ",1)",
    pointColor : "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ", 1)",
    pointStrokeColor : "#fff",
    data : []
  }
};

/* Util Functions */

function hexToRGB(hex) {
  if (hex.charAt(0)=="#") {
    hex = hex.substring(1,7)
  }

  return [
    parseInt(hex.substring(0, 2), 16),
    parseInt(hex.substring(2, 4), 16),
    parseInt(hex.substring(4, 6), 16)
  ]
}

