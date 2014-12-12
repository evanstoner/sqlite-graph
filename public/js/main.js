var svg;

var width;
var height;
var series = [];
var graph;
var xAxis;
var yAxis;
var palette = new Rickshaw.Color.Palette();

$(function() {
  width = $(window).width();
  height = $(window).height() - 200;

  $('#database').change(databaseChanged);
  $('#table').change(tableChanged);
  $('#addSeries').click(addSeries);

  $.getJSON('api/', function(data) {
    populateSelect('#database', data.databases);
  });
});

function render(name, ctx) {
  var source = $('#' + name + '-template').html();
  var template = Handlebars.compile(source);
  $('#' + name).html(template(ctx));
}

function populateSelect(selector, options, valueField, displayField) {
  displayField = displayField || valueField;
  $(selector).empty();
  $.each(options, function(index, option) {
    $(selector).append('<option value="' +
        (valueField ? option[valueField] : option) +
        '">' + (displayField ? option[displayField] : option) +
        '</option>');
  });
  $(selector).change();
}

function databaseChanged() {
  $.getJSON('api/' + $('#database').val(), function(data) {
    populateSelect('#table', data.tables, 'name');
  });
}

function tableChanged() {
  $.getJSON('api/' + $('#database').val() + '/' + $('#table').val(), function(data) {
    populateSelect('#fieldX', data.fields, 'name');
    populateSelect('#fieldY', data.fields, 'name');
  });
}

function addSeries(e) {
  e.preventDefault(); // this button is within a form
  var db = $('#database').val();
  var table = $('#table').val();
  var x = $('#fieldX').val();
  var y= $('#fieldY').val();
  $.getJSON('api/' + db + '/' + table + '/records?x=' + x + '&y=' + y, function(data) {
    // add this new series to our collection
    series.push({
      name: table + '.' + y,
      color: palette.color(),
      data: data.records
    });

    // render('series', {series: series});

    if (!graph) {
      graph = new Rickshaw.Graph({
        element: document.querySelector('#graph'),
        renderer: 'line',
        width: width,
        series: series,
        height: height
      });

      xAxis = new Rickshaw.Graph.Axis.X({
        graph: graph
      });

      yAxis = new Rickshaw.Graph.Axis.Y({
        graph: graph
      });

      var hoverDetail = new Rickshaw.Graph.HoverDetail({
        graph: graph,
        xFormatter: function(x) {
          return x;
        }
      });

      graph.render();
    } else {
      graph.update();
    }

    // legends are not dynamic yet: https://github.com/shutterstock/rickshaw/pull/266
    $('#legend').empty();
    var legend = new Rickshaw.Graph.Legend({
      graph: graph,
      element: document.querySelector('#legend')
    });
  });
}
