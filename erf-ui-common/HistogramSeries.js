
//
// This module represents a histogram of any data series used by
// dojox.charting.  In particular, this means we can get a histogram
// of a StoreSeries from a store ( for example a CouchdbStore )

define(["dojo/_base/declare"], 

function( declare ) {

  return declare( null, {
    
    //
    // Create a new Histogram Series
    // You must given this at least:
    //    objects: An array of data to create histogram from
    //    value: a function which maps a data object into a single number
    //           used to create a histogram counts from data
    //
    // May also give:
    //    num_bins : integer (defaults to 100)
    //    min : number, defautls computed from data (uses 2-pass alg.)
    //    max: number, default compouted from data (uses 2-pass alg.)
    
    constructor: function(options) {
      declare.safeMixin( this. options );

      this._initialRendering = true;
      this.compute_histogram();
    },
    
    //
    // The "data" for this series, a histogram
    // so an array of { x:bin, y: count }
    data: undefined,
    
    //
    // The array of objects for which we are a histogram of
    objects: undefined,
    
    //
    // The number fo bins
    num_bins: 100,
    
    // 
    // The range of the histogram
    min: undefined,
    max: undefined,

    //
    // Have we never rendered before (or never updated the series before)
    _initialRendering: true,
    
    //
    // Interface for a series object,
    // Cleanup antyhing before being garbage collected
    destory: function() {
    },
    
    //
    // Sets the series object for wwhom we are it's data
    // This is an API from the Series.
    setSeriesObject: function( series ) {
      this.series = series;
    },
    
    //
    // Compute a histogram from the given constructed series
    compute_histogram: function() {

      // nothing to do if no objects
      var self = this;
      self.data = [];
      dojo.when( this.objects , function( objects ) {
	if( !self.objects || self.objects.length < 1 )
	  return;
	
	// compute min and max if not given
	if( !self.min || !self.max ) {
	  var need_min = !self.min;
	  var need_max = !self.max;
	  var val = self.value( self.objects[0] );
	  if( need_min ) {
	    self.min = val;
	  }
	  if( need_max ) {
	    self.max = val;
	  }
	  for( var i = 1; i < self.objects.length; ++i ) {
	    val = self.value(self.objects[i]);
	    if( need_min && val < self.min ) {
	      self.min = val;
	    }
	    if( need_max && val > self.max ) {
	      self.max = val;
	    }
	  }
	}
	
	// Ok, now create bins and build up counts
	var bins = [];
	var step =  ( self.max - self.min ) / self.num_bins;
	for( var i = self.min; i <= self.max; i += step ) {
	  
	  bins.push( { min: i,
		       max: i + step,
		       count: 0} );
	}
	
	// bin the data
	for( var i = 0; i < self.objects.length; ++i ) {
	  var item = self.value( self.objects[i] );
	  for( var i = 0; i < bins.length; ++i ) {
	    var bin = bins[i];
	    if( item >= bin.min && item < bin.max ) {
	      bin.count += 1;
	      return;
	    }
	  }
	}
	
	// convert form bins to histogram data (x,y)
	self.data = [];
	for( var i = 0; i < bins.length; ++i ) {
	  self.data.push( { x: self.min + i * step,
			    y: bins[i].count } );
	}
	
	// update our series if we have one
	if( self.series ) {
	  self.series.chart.updateSeries( self.series.name, self, self._initialRendering );
	  self._initialRendering = false;
	}
      });
    },
    
  });

});
