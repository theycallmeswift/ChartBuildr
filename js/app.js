(function() {
  $(document).ready(function() {
    var source = $("#source")
      , resize;

    var chart = window.chart = new SwiftChart({
      canvas: "#main-chart"
    });

    $(document).foundation();
    loadChartColors(chart);
    $('.sortable').sortable({items: ':not(.disabled)'}).bind('sortupdate', function() {
      updateChartColors(chart);
    });

    $('.colors-grid').on('click', 'a.destroy', function(e) {
      e.preventDefault();
      if($(".colors-grid li").length > 1) {
        $(this).parents("li").remove();
        updateChartColors(chart);
      }
    });

    $('.colors-grid').on('click', '.color-adder .button', function(e) {
      var $color = $(".color-adder input").val()
        , $colorTemplate = $("#color-template")
        , template = _.template($colorTemplate.html());

      e.preventDefault();

      if($color.indexOf("#") == -1) {
        $color = "#" + $color;
      }

      if($color.length != 7) return false; // TODO: Display error

      chart.colors.push($color);
      $('.color-adder').before(template({ color: $color, number: $('.colors-grid li').length }));
      $(".color-adder input").val("")

      updateChartColors(chart);
    });

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

    $("#custom-scale").change(function() {
      var $inputs = $("#custom-scale-fields input[type=text]");

      if(this.checked) {
        $inputs.prop('disabled', false);
      } else {
        $inputs.prop('disabled', true);
      }

      updateDataTableAndDrawChart(source, chart);
    });

    $("#hide-scale-labels").change(function() {
      updateDataTableAndDrawChart(source, chart);
    });

    $("#custom-scale-fields input[type=text]").on('input', function() {
      updateDataTableAndDrawChart(source, chart);
    });
  });

  function loadChartColors(chart) {
    var $colorsGrid = $(".colors-grid")
      , $colorTemplate = $("#color-template")
      , template = _.template($colorTemplate.html())
      , color;

    for(var i = 0; i < chart.colors.length; i++) {
      color = (chart.colors[i].indexOf("#") == -1) ? "#" + chart.colors[i] : chart.colors[i];
      $colorsGrid.append(template({ color: color,number: i + 1}));
    }

    $colorsGrid.append($("#color-adder-template").html());
  }

  function updateChartColors(chart) {
    var $colorsGrid = $(".colors-grid li:not(.color-adder)")
      , colors = []
      , $color;

    for(var i = 0; i < $colorsGrid.length; i++) {
      $color = $($colorsGrid[i]);
      $color.find(".order").html("#" + (i + 1));
      colors.push($color.data("color"));
    }

    chart.colors = colors;
    chart.redraw();
  }

  function createTable(headers, rows) {
    var $dataTable = $(".data-table")
      , $dataTableTemplate = $("#data-table-template")
      , template = _.template($dataTableTemplate.html());

    $dataTable.html(template({ headers: headers,rows: rows }));
  }

  function advancedOptions() {
    return {
      scaleOverride: ($("#custom-scale").is(":checked")) ? true : false,
      scaleStartValue: parseInt($("#start-value").val()),
      scaleStepWidth: parseInt($("#step-width").val()),
      scaleSteps: parseInt($("#total-steps").val()),
      scaleShowLabels: ($("#hide-scale-labels").is(":checked")) ? false : true
    }
  }

  function updateDataTableAndDrawChart(source, chart) {
    var $dataTable = $(".data-table")
      , self = $(source)
      , options = advancedOptions()
      , chartData, headers;

    $.csv.toArrays(self.val().trim(), {}, function(err, csvArray){
      if(err) return console.log(err); // TODO: Update error messages

      if(csvArray.length >= 1) {
        headers = csvArray.shift();
        createTable(headers, csvArray);
        chart.draw(csvArray, options);
      } else {
        $dataTable.html("<p>Enter some CSV formated data on the left!</p>");
      }
    });
  }
})();
