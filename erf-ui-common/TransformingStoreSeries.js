
//
// A data series for dojox.charting which is backed by a store
// and which applies a transform function to all the data at once
// (rather an element by element) to convert from the store data
// to the chart data.
// Also, this fixes a bug in regular StoreSeries where observalbe stores
// are only updated with their initial values, not any new points.
// Really the StoreSeries observable only workswith MemoryStores :-(.
// This should work with other stores :-)

define(["dojo/_base/array", 
	"dojo/_base/declare", 
	"dojo/_base/Deferred",
	"dgrid/util/misc"], 

function(arr, declare, Deferred, misc){
  
  return declare( null, {
    
    //
    // Creates a new TransfomringStoreSeries.
    // This is a data series backed by a potentially Observable
    // Store instance that allows for a user function to
    // transform the data from the series to the data for
    // the chart.  This transform function is given access to
    // *all* of the data (instead of just one lement at a time) and
    // so can do things like compute a histogram, etc.
    //
    // arguments:
    //    store : a Store
    //    query: any options to give to the store.query
    //    transform : function which takes in an array of objects from the store
    //                and returns an array of data for the chart.
    //                signature [object] -> [object]
    //    options: mixin any other options, including
    //               throttle_delay: milliseconds (default to 1000) 
    //             
    constructor: function(store, query, transform, options){
      declare.safeMixin( this, options );
      this.store = store;
      this.kwArgs = kwArgs;
      this.transform = transform;
      this.data = [];
      this._initialRendering = false;
      this.fetch();
    },
    
    //
    // The delay in millesoncds to throttle updates from the store
    throttle_delay: 1000,
    
    destroy: function(){
      // summary:
      //		Clean up before GC.
      if(this.observeHandle){
	this.observeHandle.remove();
      }
    },
    
    setSeriesObject: function(series){
      // summary:
      //		Sets a dojox.charting.Series object we will be working with.
      // series: dojox/charting/Series
      //		Our interface to the chart.
      this.series = series;
    },
    
    // store fetch loop
    
    fetch: function(){
      // summary:
      //		Fetches data from the store and updates a chart.
      var self = this;
      if(this.observeHandle){
	this.observeHandle.remove();
      }
      var results = this.store.query(this.kwArgs.query, this.kwArgs);
      Deferred.when(results, function(objects){
	self.objects = objects;
	update();
      });
      if(results.observe){
	this.observeHandle = results.observe( misc.util.throttleDelayed(self.fetch, this.throttle_delay), false);
      }
      function update(){
	self.data = self.transform( self.objects );
	self._pushDataChanges();
      }
    },
    
    _pushDataChanges: function(){
      if(this.series){
	this.series.chart.updateSeries(this.series.name, this, this._initialRendering);
	this._initialRendering = false;
	this.series.chart.delayedRender();
      }
    }
    
  });
});
