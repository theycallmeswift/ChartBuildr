(function() {
  $(document).ready(function() {
    var source = $("#source")
      , resize;

    var chart = window.chart = new SwiftChart({
      canvas: "#main-chart"
    });

    $(document).foundation();

    $(window).resize(function() {
      chart.resize();
      chart.redraw({ animation: false, resized: true });
    });

    source.on('input', function(e) { updateDataTableAndDrawChart(e.target, chart); });

    updateDataTableAndDrawChart(source, chart);

    $("#download-chart").submit(function() {
      var canvas = $("#main-chart").get(0)
        , downloadUrl = canvas.toDataURL("image/png");

      $("#chart-data").val(downloadUrl);
      return true;
    });

    $(".chart-types a").on("click", function(e) {
      e.preventDefault();

      chart.type = $(this).data("type");
      chart.redraw();

      $(".chart-types a.selected").removeClass("selected");
      $(this).addClass("selected");
    });
  });

  function createTable(headers, rows) {
    var $dataTable = $(".data-table")
      , $dataTableTemplate = $("#data-table-template")
      , template = _.template($dataTableTemplate.html());

    $dataTable.html(template({ headers: headers,rows: rows }));
  }

  function updateDataTableAndDrawChart(source, chart) {
    var $dataTable = $(".data-table")
      , self = $(source)
      , chartData, headers;

    $.csv.toArrays(self.val().trim(), {}, function(err, csvArray){
      if(err) return console.log(err); // TODO: Update error messages

      if(csvArray.length >= 1) {
        headers = csvArray.shift();
        createTable(headers, csvArray);
        chart.draw(csvArray);
      } else {
        $dataTable.html("<p>Enter some CSV formated data on the left!</p>");
      }
    });
  }
})();
