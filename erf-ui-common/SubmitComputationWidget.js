
// 
// This module reresents a widget to submit comoputations to a particular 
// cluster.
// The widget simply requires teh cluster id and the couchdb computation databse
// to submit computations to.

define([
  "dojo/_base/declare",
  "dijit/layout/ContentPane",
  "dijit/form/TextBox",
  "dijit/form/Button",
  "dijit/form/NumberTextBox",
  "dojo/dom-style",
  "dojo/dom-construct",
  "dojo/request"],
       
function(declare,
	 ContentPane, TextBox, Button, NumberTextBox,
	 domStyle, domConstruct,
	 request ) {
  
  return declare( [ContentPane], {
    
    
    //
    // Create a new submit computations woidget.
    // This is internally a content pane (so a dijit widget)
    // with tied couchdb computations database url
    //
    // The options given will be mixed in with this object.
    // You must provide at least the following:
    //    computation_database_url : String
    //    cluster_id : String
    constructor: function(options) {

      // mixin options
      declare.safeMixin( this, options );

    },


    //
    // The url for hte computations databse to submit computations to
    // This should be the base databse url (not a view)
    // and should end with a /
    computation_database_url : undefined,
    
    //
    // The id for the cluster to submit computations to.
    // This should be the uniqu string id
    cluster_id : undefined,


    //
    // A callback function to be called whenever we submit a 
    // computation.
    // This is here to allow for the user to add their own callback whenever
    // a computation is called.
    //
    // The callback is given the response from couchdb when trying to
    // submit a new document to the computation databse.
    //
    // callback type: xhr.response -> void
    on_submit_computation_request_response: undefined,
    
    //
    // Creates the widget childern and add them to this content pane.
    // This is called by _WidgetBase in dijit, and so we 
    // just add our logic here to customize this content pane
    // to out needs.
    postCreate: function() {

      // call inherited postCreate
      this.inherited(arguments);
      
      // create two text boxes for script path and number of computations to submit
      var num_submits_box = new NumberTextBox({
	value: 1,
	required: true
      });
      domStyle.set( num_submits_box.domNode, "width", "4em" );
      var script_box = new TextBox({
	placeholder: "path-to-script",
	label: "script:"
      });
      
      // create and add a submit button
      var self = this;
      this.addChild( new Button({
	label: "new computation",
	onClick: function() {
	  console.log( "request " + num_submits_box.value + " scripts of " + script_box.value + " on " + self.cluster_id );
	  for( var i = 0; i < num_submits_box.value; ++i ) {
	    var req = 
	      request.post( self.computation_database_url,{
		data: dojo.toJson(
		  { computation:
		    { status: "request:new",
		      script: script_box.value,
		      cluster_id: self.cluster_id }}),
		headers: { "Content-Type" : "application/json" },
		handleAs: "json"
	      });
	    
	    // If the user has wanted to rrun a callback on the request
	    // response. attached it to the deffered
	    if( self.on_submit_computation_request_response ) {
	      req.then( self.on_submit_computation_request_response );
	    }
	  }
	}
      }));
      this.addChild( script_box );
      domConstruct.create( "text", { innerHTML: "X" }, this.containerNode );
      this.addChild( num_submits_box );

    }

  });

});

    
