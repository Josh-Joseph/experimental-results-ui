
//
// A histogram based on the couchdb view


define( [ 
  "dojo/_base/declare",
  "erf-ui-common/TransformingStoreSeries",
  "erf-ui-common/CouchdbStore",
  "dijit/layout/ContentPane",
  "dojox/charting/Chart",
  "dojox/charting/plot2d/Bars",
  "dojox/charting/plot2d/Lines",
  "dojox/charting/plot2d/Columns",
  "dojox/charting/axis2d/Default",
  "dojox/charting/action2d/MouseZoomAndPan",
  "dojox/charting/widget/Legend",
  "dojox/charting/themes/Claro" ],

function( declare,
	  TransformingSeries,
	  CouchdbStore,
	  ContentPane,
	  Chart,
	  BarsPlot,
	  LinesPlot,
	  ColumnsPlot,
	  DefaultAxes,
	  MouseZoomAndPan,
	  Legend,
	  theme ) {


  return declare( [ContentPane], {


    //
    // Must suppli at leaast:
    //    min: number
    //    max: number
    //    database: url
    //    view: url
    //    query: object
    //    series_title: string
    constructor: function( options ) {
      declare.safeMixin( this, options );
      
      this.store = new Observable( new CouchdbStore({
	database: this.database,
	view: this.view
      }));
    },

    min: undefined,
    
    max: undefined,
    
    num_bins: 100,
    
    chart: undefined,
    
    store: undefined,
    
    compute_histogram: function( objects ) {

      // compute bins from the view and add them as a serier to chart
      var hist_data = [];
      var bins = [];
      var step =  ( this.max - this.min ) / this.num_bins;
      for( var i = this.min; i <= this.max; i += step ) {
	
	bins.push( { min: i,
		     max: i + step,
		     count: 0} );
      }
      
      // bin the data from the view
      var self = this;
      for( var i = 0; i < objects.length; ++i ) {
	var row = objects[i];
	var item = row.value;
	//console.log( "  stream item: " + dojo.toJson( item ) );
	for( var i = 0; i < bins.length; ++i ) {
	  var bin = bins[i];
	  if( item >= bin.min && item < bin.max ) {
	    bin.count += 1;
	    return;
	  }
	}
      };
	
      // convert form bins to histogram data (x,y)
      for( var i = 0; i < bins.length; ++i ) {
	hist_data.push( { x: self.min + i * step,
			  y: bins[i].count } );
      }
      
      return hist_data;
      
    },
    
    postCreate: function() {
      this.inherited( arguments );
      
      // create the bar chart widget
      this.chart = new Chart( this.domNode );
      this.chart.setTheme( theme );
      this.chart.addPlot( "default", {
	type: LinesPlot,
	markers: true,
	gap: 5
      });
      this.chart.addAxis( "x", { min: this.min, max: this.max } );
      this.chart.addAxis( "y", {vertical: true} );

      // create the zoom and pan
      new MouseZoomAndPan( this.chart, "default", { axis: "x" } );
	
      // add teh data
      self.chart.addSeries( self.series_title, 
			    new TransformingSeries( this.store,
						    this.query,
						    this.compute_histogram,
						    {} ) );
      
      // render hte chart
      self.chart.render();
    },

  });


});
