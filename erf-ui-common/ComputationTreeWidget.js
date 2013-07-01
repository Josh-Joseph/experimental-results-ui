
//
// This module represents a Computation Tree widget.
// This is a highgly specialized widget for the 
// experimental results framework UI.
// In particular, this will display hiearchichal information
// about all of the scripts known, including their running status
// and their cluster_id.

define([
  "dojo/_base/declare",
  "erf-ui-common/CouchdbStore",
  "dojo/store/Observable",
  "dijit/Tree",
  "dijit/tree/ObjectStoreModel" ],
       
function(declare,
	 CouchdbStore, Observable,
	 Tree, ObjectStoreModel,
	 request ) {
  
  return declare( [Tree], {

    //
    // Create a new ComputationTree Widget.
    // The given options will be mixed into this object.
    //
    // At the very least, we need the following:
    //    computation_database_url : String
    //
    constructor : function(options){
      
      // mixin the options
      declare.safeMixin( this, options );
      
      var self = this;

      // create the store for the toplevel view
      this.toplevel_view_store = new Observable( new CouchdbStore({
	target: self.computation_database_url,
	view: "_design/ui/_view/status_count_by_script",
	idProperty: "key"
      }));

      // augment the store to have a getChildren method
      // THIS IS PARTICULAR TO THE COMPUTATION VIEW WE ARE USING!
      this.toplevel_view_store.getChildren = function(object) {

	// check for root hack
	if( !object.key ) {
	  return self.toplevel_view_store.query( { 
	    startKey: {}, 
	    group: true, 
	    group_level: 1, 
	    reduce: true 
	  });
	}
	
	if( object.key.length == 1 ) {
	  return self.toplevel_view_store.query({ 
	    group: true, 
	    group_level: 2,
	    reduce: true,
	    startkey: dojo.toJson( [ object.key[0] ] ),
	    endkey: dojo.toJson( [ object.key[0], {} ] )
	  });
	} else if( object.key.length == 2 && !object.value.job ) {
	  return self.toplevel_view_store.query({ 
	    group: false, 
	    reduce: false, 
	    key: dojo.toJson( object.key ) });
	} else if( object.key.length == 2 && object.value.computation ) {
	  return [];
	}
	
	console.log( "fell thoirugh!" );
	return [];
      };

      // create the tree model
      this.model = new ObjectStoreModel({
	store: self.toplevel_view_store,
	query: { group: false, reduce: true },
	getLabel : self._getLabel,
	mayHaveChildren: function(object) {
	  if( object.key && object.key.length == 2 && object.value.computation ) {
	    return false;
	  }
	  return true;
	},
      });
      
    },

    
    //
    // The databse url for the computation database.
    // Thiis should be the base url (not a view)
    // and should end in a /
    computation_database_url: undefined,

    
    //
    // The store used to view the high-level tree structure
    // This is an actual view of the computation databse 
    toplevel_view_store: undefined,


    //
    // This function will be called when a script node is clicked
    onScriptClick: undefined,

    //
    // This function will be call when a cluster node is clicked
    onClusterClick: undefined,
    
    //
    // This function will be called when a computation node is clicked
    onComputationClick:undefined,


    //
    // Internal onClick handler which propagets to onScriptClick,
    // onClusterClick, or onComputationClick depending on node
    _handleOnClick: function(object) {
      if( !object.key ) {
	return;
      }
      
      if( object.key.length == 1) {
	if( this.onScriptClick ) {
	  this.onScriptClick( object );
	}
	return;
      }

      if( object.key.length == 2 &&
	  !object.value.computation ) {
	if( this.onClusterClick ) {
	  this.onClusterClick( object );
	}
	return;
      }
      
      if( object.value.computation ) {
	if( this.onComputationClick ) {
	  this.onComputationClick( object );
	}
	return;
      }
      
    },
    

    //
    // Internal function that returns the label for a node in the tree
    // THis is where the logic goes that changes from query results to
    // labels in the tree widget
    _getLabel:function( object ) {
      if( !object.key ) {
	return "computations";
      }
      if( object.key.length == 1 ) {
	return object.key;
      }
      if( object.key.length == 2 &&
	  !object.value.computation ) {
	return "cluster: " + object.key[1];
      }
      if( object.value.computation ) {
	return object.value.computation.computation_id;
      }
      return "<<undef>>";
    },
    
    //
    // This is where we create the widget child elements and customize
    // a doijit.Tree into out new widget.
    // Mostly this will hook up event listeners and such
    postCreate: function() {
      
      this.inherited( arguments );

      // setup the onClick handler
      this.onClick = this._handleOnClick;
    }

  });
});
