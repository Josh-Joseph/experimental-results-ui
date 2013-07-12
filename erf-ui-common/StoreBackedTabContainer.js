
//
// This module representa a TabContainer whoose tabs are directly backed by
// a Store.
// In particular, this allows for Observable stores in which case the tabs 
// will appear/hide whenever the Store changes.
//
// The module also allows for a callback to happen to generate the
// contents of a tab if it is created, and to delete/hide a tab when
// the store changes

define([
  "dojo/_base/declare",
  "dijit/layout/TabContainer" ],
       
function(declare,
	 TabContainer) {


  return declare( [TabContainer], {

    //
    // Create a new store backed tab contianer.
    // The given options are mixed in.
    // You must include at least the following:
    //    store: a Store instance (Observable or not)
    //    query: String or Object used to pass to store.query( .. )
    //    onNewTab: function called whenever a new element is added to
    //              the store hence a new tab needs to be crated.
    //              the returned object is used as the tab.
    //              This will also be called to generate the initial
    //              set of tabs from the store.
    //
    //  Optionally, you can give:
    //    onUpdateTab: function called whenever an object changes in the Store.
    //                 this is handed the changed object and the tab container.
    //                 The code can do whatever is needed to update the tab.
    //                 By default this does nothing,
    //    onDeleteTab: function called whenever an object is removed from the 
    //                 store.  The object and the tab container are handed to
    //                 this function.  By default, this will simply remove 
    //                 and destroy the tab for the removed object.
    constructor: function( options ) {
      
      declare.safeMixin( this, options );
      
    },
    
    //
    // The store backing this tab container
    store: undefined,

    //
    // The query string or object to get data from the store
    query: undefined,
    
    // 
    // callback called to generate the tab when a new object
    // is inserted into the store
    onNewTab: undefined,
    
    //
    // Helper function which returns the child widget for a particular object
    childForObject: function( object ) {
      var id = this.store.getIdentity( object );
      var children = this.getChildren();
      for( var i = 0; i < children.length; ++i ) {
	var child = children[i];
	if( child.backing_object && this.store.getIdentity(child.backing_object) == id ) {
	  return child;
	}
      }
      return null;
    },

    //
    // Helper functio to actually create and add a new tab for an object,
    // This will internally use the onNewTab callback to get the widget
    // but will also add a 'backing_object' to this widget for our use
    _addNewTab: function( object ) {
      
      var widget = this.onNewTab( object );
      if( widget ) {
	if( widget.backing_object ) {
	  console.error( "Widgetrs returned from onNewTab CANNOT have a backing_object property!" );
	}
	widget.backing_object = object;
	this.addChild( widget );
      }
    },
    
    //
    // callback called when an element of the store changes
    onUpdateTab: function( obj, self ) {
      
      // by default do nothing
      return;
    },
    
    //
    // callback called wheneever an element is removed from the store
    // By default this removes the tab and deletes the widget
    onDeleteTab: function( obj, self ) {
      
      // get the child widget for this object
      var child = this.childForObject( object );
      if( child ) {
	
	// now remove it from the tab container and also deleter it
	this.removeChild( child );
	this.destroyRecursive();
      } else {
      
	// this is strange, since we did not find the tab/child backed by
	// the removed object, send a warning
	console.warn( "Could not find tab backed by object id " + deleted_id + " when object was deleted from store!  self:" + dojo.toJson( self ) + " obj: " + dojo.toJson( obj ) );
      }
      
    },

    //
    // inherited method called afte reveryhting has been created.
    // This is where we create the initial set of tabs from the store.
    // Everything else is based on the events if the store is Observable
    postCreate: function( ) {
      
      this.inherited( arguments );
      
      // Query the store to get the results
      var results = this.store.query( this.query );
      
      // Once we have the results, create a tab for each element
      var self = this;
      results.forEach( function( obj ) {
	console.log( "Cluster  object: " + obj.value.cluster.hostname );
	self._addNewTab( obj );
      });
	
	
      // Hook up the events for changes in the store if it is Observable
      if( results.observe ) {
	results.observe( function( obj, previus_index, new_index ) {
	  
	  // determine if it a delete,add,or change and call the respective
	  // callbacks on this object
	  if( previus_index == -1 ) {
	    self._addNewTab( obj );
	  } else if( new_index == -1 ) {
	    self.onDeleteTab( obj, self );
	  } else {
	    self.onUpdateTab( obj, self );
	  }
	}, true);
      }

    },

  });
});
