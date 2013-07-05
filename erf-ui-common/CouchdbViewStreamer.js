
// 
// This is a module that represents the results for a couchdb view
// functions.  It will stream the results, querying it and paging them in,
// so that it lloks as if there is a singel continous stream by applying
// the .forEach( fn ) to the items.

define([
  "dojo/store/CouchdbStore",
  "dojo/_base/declare",
  "dojo/Deferred"],
       
function( CouchdbStore, 
	  declare,
	  Deferred) {
  

  return declare( null, {

    //
    // Create a new couchdv view streamer. 
    // THe given options are mixed in to this object.
    // Must supply at least:
    //    database_url : string
    //    view : string
    //    query : Object
    constructor : function( options ) {
      declare.safeMixin( this, options );
      
      // create the stoire
      this.store = new CouchdbStore({
	target: this.database,
	view: this.view 
      });
     
    },

    
    //
    // The query to run against the view
    query: undefined,
    
    //
    // The batch size top fetch
    batch_size: 100,

    
    //
    // Iterate over all the elements from the view/query and call
    // given function iwth them in order.
    // This takes care of batching the couchdb requests under the hood
    forEach: function( fn, offset, all_done_def ) {
      
      offset = offset || 0;

      // create a deffered for when all batches have been fetched and 
      // mapped
      all_done_def = all_done_def || new Deferred();
      
      // fetch the next batch from view
      var q = this.query;
      q.limit = this.batch_size;
      q.skip = offset;
      batch = this.store.query( q );
      var self = this;
      batch.then( function( result ) {
	if( result.length > 0 && offset < result.total ) {
	  console.log( "view batch: offset: " + offset + " r.l: " + result.length );
	  batch.forEach( fn );
	  self.forEach( fn, offset + result.length, all_done_def );
	} else {
	  // we are done with all batched, resolve the deffered
	  // console.log( "view-streamer: RESOLVED" );
	  all_done_def.resolve( "" );
	}
      });
      
      // return the promise
      return all_done_def.promise;
    },
    
  });
});
