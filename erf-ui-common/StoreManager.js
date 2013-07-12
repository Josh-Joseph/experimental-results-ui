
//
// This module represents a nice way of managing a set of stores which 
// change over time.
// Also, each store can have a set of "tags" associated with them and
// be fetched by tag rather than all at once from this manager.

define( [
  "dojo/_base/declare",
  "dojo/request",
  "dojo/Deferred",
  "dojo/promise/all",
  "erf-ui-common/CouchdbStore"],

function( declare,
	  request,
	  Deferred,
	  all,
	  CouchdbStore) {
  
  return declare( null, {

    constructor: function( options ) {
      declare.safeMixin( this, options );
    },

    //
    // The list of known stores
    _known_stores: [],
    
    //
    // Add a store with a list of tags
    add_store: function( store, tags ) {
      //console.log( "StoreManager: adding store: " + dojo.toJson(store) + " TAGS: " + dojo.toJson( tags ) );
      this._known_stores.push({
	store: store,
	tags: tags
      });
    },

    //
    // Query for a lsit of all stores with matching tags
    // If tags is null (default) returns all known stores
    get_stores: function( tags ) {
	var res = [];
	for( var i = 0; i < this._known_stores.length; ++i ) {
	  var obj = this._known_stores[i];
	  if( !tags ) {
	    res.push( obj.store );
	  } else {
	    var has_tags = true;
	    for( var t = 0; t < tags.length; ++t ) {
	      var tag = tags[t];
	      if( obj.tags.indexOf( tag ) == -1 ) {
		has_tags = false;
		break;
	      }
	    }
	    if( has_tags ) {
	      res.push( obj.store );
	    }
	  }
	}
      return res;      
    },


    //
    // Add all of the views of a particular database and design document
    // This returns a promise object for adding of all views.
    // The optional third argument is mixed in when creating the stores.
    add_all_views: function( database_url,
			     design_document_name,
			     store_options,
			     additional_tags ) {
      
      var self = this;

      //console.log( "StoreManager: add_all_views(" + database_url + design_document_name + ")" );

      // Create a new deffered for the result of this operation
      var def = new Deferred();
      
      // first thing, get the design document from hte database
      var result = request.get( database_url + design_document_name, {
	handleAs: "json" });
      
      // ok, when we get teh result, let us get all of the view functions
      // inside of it and add stores for those views within this manager
      result.then( function( design_doc ) {
	
	// get the views
	var views = design_doc.views;

	// the full view urls
	var view_urls = [];
	
	// iterate over all the keys and add stores for them
	var view_names = Object.keys( views || {} );
	for( var i = 0; i < view_names.length; ++i ) {
	  
	  var view_name = view_names[i];
	  var tags = [ view_name ].concat( additional_tags );
	  var store = new CouchdbStore(
	    declare.safeMixin({
	      target: database_url,
	      view: design_document_name + "/_view/" + view_name
	    }, store_options ) );
	  view_urls.push( database_url + design_document_name + "/_view/" + view_name );
	  
	  self.add_store( store, tags );
	    
	}

	// ok, resolve the reffered with the list of view urls
	def.resolve( view_urls );

      });
      
      return def.promise;
    },


    //
    // Add stores for all of the design documetns and their views for given 
    // database.
    // The store_options are mixed in when creating hte stores.
    // The additional_tags are mixed in when creating hte tags for the stores.
    add_all_design_docs: function( database_url,
				   store_options,
				   additional_tags) {
      
      var self = this;

      //console.log( "StoreManager: add_all_design_docs(" + database_url + ")" );
      
      // create a new deferred for the results
      var def = new Deferred();
      
      // ok, fetch all design documents for this databse
      var result = request.get( database_url + "_all_docs", {
	query: { startkey: dojo.toJson( "_design/" ),
		 endkey: dojo.toJson( "_design0" ),
		 include_docs: false },
	handleAs: "json",
      });
      
      // now, when we get the list of docs, we just call add_all_views
      // on the design doc name
      result.then( function( docs ) {
	
	var all_defs = [];
	
	for( var i = 0; i < docs.rows.length; ++i ) {
	  var doc = docs.rows[i];
	  var d = self.add_all_views( database_url,
				      doc.id,
				      store_options,
				      additional_tags );
	  all_defs.push( d );
	}

	// ok, wait for all view to be added then resolve the defferred
	all( all_defs ).then( function( results ) {
	  // concatenate all results into a single array and 
	  // resolve our own promise with this array
	  var all_views = [];
	  for( var i = 0; i < results.length; ++i ) {
	    all_views = all_views.concat( results[i] );
	  }
	  def.resolve( all_views );
	});
      });
      

      // return the promise for our deffered
      return def.promise;
    },

    
    // 
    // Add all of the databases at a particular url.
    // This will add all of their design document's views
    add_all_databases: function( base_url,
				 store_options,
				 additional_tags ) {
      
      var self = this;
      
      // create a deffered for hte results
      var def = new Deferred();
      
      // wuery for all of the databases at the url
      var result = request.get( base_url + "_all_dbs", {
	handleAs: "json"
      });
      
      // ok, when we get the list jsut call add_all_design_docs
      result.then( function( dbs ) {
	
	var all_defs = []
	for( var i = 0; i < dbs.length; ++i ) {
	  var db = dbs[i];
	  all_defs.push( self.add_all_design_docs( base_url + db + "/",
						   store_options,
						   additional_tags ) );
	}
	
	// wait for all to finishe then resolve with concatenation of all
	// added views
	all( all_defs ).then( function( results ) {
	  var res = [];
	  for( var i = 0; i < results.length; ++i ) {
	    res = res.concat( results[i] );
	  }
	  
	  def.resolve( res );
	});
      });
      
      // return the promise
      return def.promise;
    },

  });

});

