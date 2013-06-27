
//
// This module represents a Job Tree widget.
// This is a highgly specialized widget for the 
// experimental results framework UI.
// In particular, this will display hiearchichal information
// about all of the scripts known, including their running status
// and their cluster_id.

define([
  "dojo/_base/declare",
  "dojo/store/CouchdbStore",
  "dojo/store/Observable",
  "dijit/Tree",
  "dijit/tree/ObjectStoreModel" ],
       
function(declare,
	 CouchdbStore, Observable,
	 Tree, ObjectStoreModel,
	 request ) {
  
  return declare( [Tree], {

    //
    // Create a new JobTree Widget.
    // The given options will be mixed into this object.
    //
    // At the very least, we need the following:
    //    jobs_database_url : String
    //
    constructor : function(options){
      
      // mixin the options
      declare.safeMixin( this, options );
      
      var self = this;

      // create the store for the toplevel view
      this.toplevel_view_store = new Observable( new CouchdbStore({
	target: self.jobs_database_url,
	view: "_design/ui/_view/status_count_by_script",
	idProperty: "key"
      }));

      // augment the store to have a getChildren method
      // THIS IS PARTICULAR TO THE JOBS VIEW WE ARE USING!
      this.toplevel_view_store.getChildren = function(object) {

	// debug
	//console.log( "getChildren: " + dojo.toJson( object ) );

	// check for root hack
	if( !object.key ) {
	  //console.log( "runnning level 1" );
	  return self.toplevel_view_store.query( { 
	    startKey: {}, 
	    group: true, 
	    group_level: 1, 
	    reduce: true 
	  });
	}
	
	if( object.key.length == 1 ) {
	  //console.log( "running level 2" );
	  return self.toplevel_view_store.query({ 
	    group: true, 
	    group_level: 2,
	    reduce: true,
	    startkey: dojo.toJson( [ object.key[0] ] ),
	    endkey: dojo.toJson( [ object.key[0], {} ] )
	  });
	} else if( object.key.length == 2 ) {
	  //console.log( "running level 3" );
	  return self.toplevel_view_store.query({ 
	    group: false, 
	    reduce: false, 
	    key: dojo.toJson( object.key ) });
	}
	
	console.log( "fell thoirugh!" );
	return [];
      };

      // create the tree model
      this.model = new ObjectStoreModel({
	store: self.toplevel_view_store,
	query: { group: false, reduce: true },
	getLabel : function( object ) {
	  if( !object.key ) {
	    return "JOBS";
	  }
	  if( object.key.length == 1 ) {
	    return object.key;
	  }
	  if( object.key.length == 2 &&
	      !object.value.job ) {
	    return "cluster: " + object.key[1];
	  }
	  if( object.value.job ) {
	    return object.value.job.job_id;
	  }
	  return "<<undef>>";
	}
      });
      
    },

    
    //
    // The databse url for the jobs database.
    // Thiis should be the base url (not a view)
    // and should end in a /
    jobs_database_url: undefined,

    
    //
    // The store used to view the high-level tree structure
    // This is an actual view of the jobs databse 
    toplevel_view_store: undefined,

    
    
    //
    // This is where we create the widget child elements and customize
    // a doijit.Tree into out new widget.
    // Mostly this will hook up event listeners and such
    postCreate: function() {
      
      this.inherited( arguments );
    }

  });
});
