$(document).ready(function() {
  var source = $("#source");

  $(document).foundation();

  $(window).resize(function() { updateDataTableAndDrawChart(source) });
  source.on('input', function(e) { updateDataTableAndDrawChart(e.target); });

  resizeMainChart();
  updateDataTableAndDrawChart(source);

  $("#download-chart").click(function(e) {
    var canvas = $("#main-chart").get(0)
      , downloadUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");

    e.preventDefault();

    document.location.href = downloadUrl;
  });
});

function createTable(headers, rows) {
  var $dataTable = $(".data-table")
    , $dataTableTemplate = $("#data-table-template")
    , template = _.template($dataTableTemplate.html());

  $dataTable.html(template({ headers: headers,rows: rows }));
}

function csvToChartData(labels, csv) {
  var output = { labels: [], datasets: [] };

  for(var h = 0; h < labels.length - 1; h++) {
    output.datasets.push(getEmptyDataset(h));
  }

  _.each(csv, function(row) {
    output.labels.push(row.shift());
    // TODO: If any row has a different length, this will break
    for(var i = 0; i < row.length; i++) {
      var dataset = output.datasets[i]
      if(dataset) dataset.data.push(parseInt(row[i]));
    };
  });

  return output;
}

function drawChart(data) {
  var $mainChart = $("#main-chart")
    , ctx = $mainChart.get(0).getContext("2d")
    , options = {}
    , chart;

  chart = new Chart(ctx).Bar(data, options);
}

function getEmptyDataset(index) {
  var colors = ["0B486B", "3B8183", "ED303C", "FF9C5B", "FAD089",  "40223E", "403B33", "DCDCDC"]
    , actualIndex = index % colors.length
    , rgb = hexToRGB(colors[actualIndex]);

  return {
    fillColor : "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ", 0.5)",
    strokeColor : "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ",1)",
    pointColor : "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ", 1)",
    pointStrokeColor : "#fff",
    data : []
  }
}

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

function resizeMainChart() {
  var $mainChart = $("#main-chart")
    , maxWidth, maxHeight;

  maxWidth = $mainChart.parent().width();
  maxHeight = Math.round(maxWidth * (3/11), 0);

  console.log("Resizing to " + maxWidth + "x" + maxHeight);
  $mainChart.attr("width", maxWidth);
  $mainChart.attr("height", maxHeight);
}

function updateDataTableAndDrawChart(target) {
  var $dataTable = $(".data-table")
    , self = $(target)
    , chartData, headers;

  $.csv.toArrays(self.val().trim(), {}, function(err, csvArray){
    if(err) {
      console.log(err);
      // TODO: Update error messages
    }

    if(csvArray.length >= 1) {
      headers = csvArray.shift();
      createTable(headers, csvArray);
      drawChart(csvToChartData(headers, csvArray));
    } else {
      $dataTable.html("<p>Enter some CSV formated data on the left!</p>");
    }
  });
}

