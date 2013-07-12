
//
// This is a widget which allows you to choose from a list of 
// couchdb stores/view and will let you plot them using 
// a set of known transforms
//
// This is more of an exploratory tool to see what the data looks like

define([
  "dojo/_base/declare",
  "dijit/layout/BorderContainer",
  "dijit/layout/ContentPane",
  "dijit/form/Select",
  "dijit/form/Button",
  "dojox/charting/Chart",
  "dojox/charting/plot2d/Bars",
  "dojox/charting/plot2d/Lines",
  "dojox/charting/plot2d/Columns",
  "dojox/charting/axis2d/Default",
  "dojox/charting/action2d/MouseZoomAndPan",
  "dojox/charting/widget/Legend",
  "dojox/charting/themes/Claro",
  "erf-ui-common/TransformingStoreSeries"],
       
 function( declare,
	   BorderContainer,
	   ContentPane,
	   Select,
	   Button,
	   Chart,
	   BarsPlot,
	   LinesPlot,
	   ColumnsPlot,
	   DefaultAxes,
	   MouseZoomAndPan,
	   Legend,
	   theme,
	   TransformingStoreSeries) {
   
   return declare( [BorderContainer], {

     //
     // Create a new ExploratoryPlotPanel.
     // THe options are mixed in.
     // You must supply at least the following:
     //    store_manager : StoreManager instance with the stores to use
     //    transforms : List of { name: "", transform: function } with
     //                 functions to be given to a TransformingStoreSeries
     constructor: function( options ) {
       declare.safeMixin( this, options );
     },

     //
     // The store manager
     store_manager: undefined,
     
     //
     // The set of transform functions and names
     transforms: [ { name: "index X value",
		     transform: function(rows) {
		       var data = [];
		       for( var i = 0; i < rows.length; ++i ) {
			 data.push({
			   x: i,
			   y: rows[i].value
			 });
		       }
		       return data;
		     }
		   },
		   {
		     name: "index X mean",
		     transform: function(rows) {
		       var data = [];
		       for( var i = 0; i < rows.length; ++i ) {
			 data.push({
			   x: i,
			   y: rows[i].value.mean
			 });
		       }
		       return data;
		     }
		   },
		   {
		     name: "index X variance",
		     transform: function(rows) {
		       var data = [];
		       for( var i = 0; i < rows.length; ++i ) {
			 data.push({
			   x: i,
			   y: rows[i].value.variance
			 });
		       }
		       return data;
		     }
		   },
		   {
		     name: "mean X variance",
		     transform: function(rows) {
		       var data = [];
		       for( var i = 0; i < rows.length; ++i ) {
			 data.push({
			   x: rows[i].value.mean,
			   y: rows[i].value.variance
			 });
		       }
		       return data;
		     }
		   },
		 ],
     
     //
     // Here is where we setup hte latout and buttons
     postCreate: function() {
       
       var self = this;
       this.inherited( arguments );
       
       // create a select for the known stores
       var store_select = new Select({
	 maessage: "View",
	 name: "Views",
       });
       
       // create a select for hte transform to use
       var transform_select = new Select({
	 message: "Transform",
	 name: "Transforms",
       });

       // create a select for the gourping option
       var group_select = new Select({
	 message: "GroupLevel",
	 name: "GroupLevel",
	 options: [{value: "no-reduce",
		    label: "no reduce"},
		   {value: false,
		    label: "no group"},
		   {value: 1,
		    label: "group 1"},
		   {value: 2,
		    label: "group 2"}]
       });
       

       // create a button to plot things
       var plot_button = new Button({ label: "plot" });

       // create the panel for the selects
       var selects_panel = new ContentPane({
	 region: "top"
       });
       selects_panel.addChild( store_select );
       selects_panel.addChild( transform_select );
       selects_panel.addChild( group_select );
       selects_panel.addChild( plot_button );
       
       // create the chart and it's panel
       var chart_panel = new ContentPane({
	 region: "center"
       });
       var chart = new Chart( chart_panel.domNode );

       // add the panels to this layout
       self.addChild( selects_panel );
       self.addChild( chart_panel );
       
       // Ok, now populate the transforms select
       for( var i = 0; i < this.transforms.length; ++i ) {
	 var tfunc = this.transforms[i].transform;
	 var tname = this.transforms[i].name;
	 transform_select.addOption({
	   value: tfunc,
	   label: tname 
	 });
       }

       // populate the stores select
       var stores = this.store_manager.get_stores();
       for( var i = 0; i < stores.length; ++i ) {
	 store_select.addOption({
	   value: stores[i],
	   label: stores[i].target + stores[i].view
	 });
       }
       
       // hook up the plot button to create a plot
       plot_button.onClick = function() {
	 var store = store_select.get("value");
	 var transform = transform_select.get("value");
	 var group_level = group_select.get( "value" );

	 // make identity transform if not found
	 if( !transform ) {
	   transform = function(objs) {
	     return objs;
	   }
	 }
	 
	 // createa a new chart
	 chart.destroy();
	 chart = new Chart( chart_panel.domNode );
	 chart.setTheme( theme );
	 chart.addPlot( "default", {
	   type: LinesPlot,
	   markers: true,
	   gap: 5
	 });
	 chart.addAxis( "x" );
	 chart.addAxis( "y", {vertical: true} );
	 
	 // create the zoom and pan
	 new MouseZoomAndPan( chart, "default", { axis: "x" } );
	 
	 // create teh query for the store
	 var query = { 
	   startkey: null,
	   group: group_level ? true : false,
	   group_level: (group_level == "no-reduce" || group_level == false ? 0 : group_level ),
	   reduce: group_level != "no-reduce" ? true : false};
	 
	 
	 // add a transforming series to the chart
	 chart.addSeries( "tseries", new TransformingStoreSeries(
	   store,
	   query,
	   transform
	 ));
	 
	 // render the chart
	 chart.render();

       }
     },

   });

 });
