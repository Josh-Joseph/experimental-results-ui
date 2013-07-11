
//
// This function represents a ContentPane which has it;s content
// backed by a couchdb view.
// This really is just a callback function which returns the widget to
// use as thecontent given the view's result.
// It will be called whenever the view changes.

define([
  "dojo/_base/declare",
  "dijit/layout/ContentPane" ],
       
function(declare,
	 ContentPane) {


  return declare( [ContentPane], {


    //
    // Create a new couchdb backed content pane.
    // The given options will be mixed in with this object.
    // You must provide at least the following:
    //    store : the Couchdb store backing this content pane
    //    query: the query into the store to get the content
    //    getContent: function( query_results ) -> Widget
    //                This function takes the result of the query from the
    //                store and returns the widget to use as the content
    //
    // Events:
    //    We emit the following events:
    //      content-changed : when the content has changed
    //      content-stale : when the couchdb signals a change but before the 
    //                      content has changed
    //
    // Note: the store should be Observable in order to get content changes
    constructor: function(options) {
      
      declare.safeMixin( this, options );
      
      var self = this;
      if( this.store.event_source ) {
	this.store.event_source.addEventListener( "message", function( evt ) {
	  self._handle_change_from_event_source(evt);
	});
      } else {
	console.warn( "Store Backed Content Pane given store without event source!" );
      }
    },

    
    //
    // The couchdb store used to back this content pane
    store: undefined,
    
    //
    // The query to run to get the result from the couchdb store
    // in order to build up the contents of this widget
    query: { startkey: null },
    
    //
    // Function which returns the content for this content pane given the
    // results of a query to the couchdb store.
    getContent: undefined,
    
    
    //
    // The event source foir changes of the couchdb store and query
    change_event_source: undefined,
    
    //
    // Customize the widget,
    // Really we just query and set the content once at startup
    postCreate: function() {
      this.inherited( arguments );
      
      this._handle_change_from_event_source( null );
    },
    
    //
    // Set the content to the result of a query.
    // This is the listener to the changes event source.
    _handle_change_from_event_source: function( evt ) {

      // First, emit a content-stale event
      this.emit( "content-stale", {} );
      
      // we just want to reset the content based on the view result
      var self = this;
      this.store.query( this.query ).then( function(result) {
	dojo.when( self.getContent( result ),
		   function( content ) {
		     self.set( "content", content );
		     self.emit( "content-changed", {} );
		   } );
      });
    }

  });

});

  
