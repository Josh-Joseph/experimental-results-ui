
define([
  "dojo/_base/xhr", 
  "dojo/_base/lang", 
  "dojo/json", 
  "dojo/_base/declare", 
  "dojo/store/util/QueryResults",
  "dojo/store/Observable",
  "dojo/io-query"
], 
     
function(xhr, lang, JSON, declare, QueryResults, Observable, ioQuery ){
  
  // No base class, but for purposes of documentation, the base class 
  // is dojo/store/api/Store
  var base = null;
  /*===== base = Store; =====*/
  
  return declare(base, {
    // summary:
    //		This is a basic store for RESTful communicating with a 
    //           server through JSON
    //		formatted data. It implements dojo/store/api/Store.
    
    constructor: function(options){
      // summary:
      //		This is a basic store for RESTful communicating with a 
      //         server through JSON
      //		formatted data.
      // options: dojo/store/CouchdbStore
      //		This provides any configuration information that will 
      //         be mixed into the store
      this.headers = {};
      declare.safeMixin(this, options);

      // create a new Observable from this and store it
      declare.safeMixin( this, new Observable( this ) );

      // ok, we want to create an event source for the given view
      if( this.enable_event_source ) {
	var changes_view = this.view.substring( this.view.indexOf( "_design" ) + 7 + 1 );
	var temp = changes_view.substring( 0, changes_view.indexOf( "/") );
	changes_view = temp + "/" + changes_view.substring( changes_view.indexOf( "_view" ) + 5 + 1 );
	//console.log( "changes_view: " + changes_view );
	this.event_source = 
      	  new EventSource( this.target 
      			   + "_changes?" 
      			   + ioQuery.objectToQuery({ feed: "eventsource",
      						     since: "now",
      						     include_docs: true,
      						     filter: "_view",
      						     view: changes_view }));      
	console.log( "event_source: " + this.event_source.url );
	
	// attach a method to event source which calls the notify() on this
	// whenever something changes
	var self = this;
	this.event_source.addEventListener( "message", function( raw ) {
      	  self._change_notify( raw, self );
	});
      }
    },
    
    // headers: Object
    //		Additional headers to pass in all requests to the 
    //           server. These can be overridden
    //		by passing additional headers to calls to the store.
    headers: {},
    
    // target: String
    //           This is the url for the couchdb databse, without a view!
    //		The target base URL to use for all requests to the 
    //           server. This string will be
    //		prepended to the id to generate the URL (relative or 
    //           absolute) for requests
    //		sent to the server
    target: "",
    
    // view: String
    //           This is the url fragment for the view of the
    //           couchdb databse to use when calling the query method
    view: "",
    
    // idProperty: String
    //		Indicates the property to use as the identity 
    //           property. The values of this
    //		property should be unique.
    idProperty: "id",


    //
    // enable_event_source: Boolean
    // If true, this store will create and enable an event_source for
    // changes from couchdb.
    // This seems to cause performance issues, so that is why it is false
    // by default
    enable_event_source: false,
    
    //
    // The event source for changes for hte specified view.
    event_source: undefined,
    

    get: function(id, options){
      // summary:
      //		Retrieves an object by its identity. This will trigger 
      //         a GET request to the server using
      //		the url `this.target + id`.
      // id: Number
      //		The identity to use to lookup the object
      // options: Object?
      //		HTTP headers. For consistency with other methods, if 
      //         a `headers` key exists on this object, it will be
      //		used to provide HTTP headers instead.
      // returns: Object
      //		The object in the store that matches the given id.
      console.log( "CouchdbStore::get(" + id + ") called!" ); 
      options = options || {};
      var headers = lang.mixin({ Accept: this.accepts }, 
			       this.headers, 
			       options.headers || options);
      var res = xhr("GET", {
	url: this.target + id,
	handleAs: "json",
	headers: headers
      });
      if( res.rows.length > 0 ) {
	return res.rows[0];
      } else {
	return null;
      }
    },

    // accepts: String
    //		Defines the Accept header to use on HTTP requests
    accepts: "application/javascript, application/json",

    getIdentity: function(object){
      // summary:
      //		Returns an object's identity
      // object: Object
      //		The object to get the identity from
      // returns: Number
      return object[this.idProperty];
    },

    put: function(object, options){
      // summary:
      //		Stores an object. This will trigger a PUT request 
      //         to the server
      //		if the object has an id, otherwise it will trigger 
      //         a POST request.
      // object: Object
      //		The object to store.
      // options: __PutDirectives?
      //		Additional metadata for storing the data.  
      //         Includes an "id"
      //		property if a specific id is to be used.
      // returns: dojo/_base/Deferred
      options = options || {};
      var id = ("id" in options) ? options.id : this.getIdentity(object);
      var hasId = typeof id != "undefined";
      return xhr(hasId ? "PUT" : "POST", {
	url: hasId ? this.target + id : this.target,
	postData: JSON.stringify(object),
	handleAs: "json",
	headers: lang.mixin({
	  "Content-Type": "application/json",
	  Accept: this.accepts
	}, this.headers, options.headers)
      });
    },

    add: function(object, options){
      // summary:
      //		Adds an object. This will trigger a PUT request to 
      //         the server
      //		if the object has an id, otherwise it will trigger 
      //         a POST request.
      // object: Object
      //		The object to store.
      // options: __PutDirectives?
      //		Additional metadata for storing the data.  
      //         Includes an "id"
      //		property if a specific id is to be used.
      options = options || {};
      options.overwrite = false;
      return this.put(object, options);
    },

    remove: function(id, options){
      // TODO: implement this
      //       right now this is UNTESTED at ALL

      // summary:
      //		Deletes an object by its identity. This will 
      //         trigger a DELETE request to the server.
      // id: Number
      //		The identity to use to delete the object
      // options: __HeaderOptions?
      //		HTTP headers.
      
      // first, get the latest revision of document, then delete it
      return 
      this.get( id, options ).then(function(result) {
	options = options || {};
	return xhr("DELETE", {
	  url: this.target + id + "?rev=" + result._rev,
	  headers: lang.mixin({}, this.headers, options.headers)
	});
      });
    },

    query: function(query, options){
      // summary:
      //		Queries the store for objects. This will trigger a 
      //         GET request to the server, with the
      //		query added as a query string.
      // query: Object
      //		The query to use for retrieving objects from the store.
      // options: __QueryOptions?
      //		The optional arguments to apply to the resultset.
      // returns: dojo/store/api/Store.QueryResults
      //		The results of the query, extended with 
      //         iterative methods.
      options = options || {};

      //console.log( "QUERY: " + dojo.toJson( query ) + " | " + dojo.toJson( options ) );

      var headers = lang.mixin({ Accept: this.accepts }, 
			       this.headers, 
			       options.headers);
      var full_url = this.target + this.view
      var hasQuestionMark = full_url.indexOf("?") > -1;
      if( hasQuestionMark == false && typeof query == "string") {
	hasQuestionMark = query.indexOf("?") > -1;
      }
      
      if(options.start >= 0 || options.count >= 0){
	if( options.start >= 0 ) {
	  query += (hasQuestionMark ? "&" : "?") 
	    + "skip=" + encodeURIComponent(options.start);
	  hasQuestionMark = true;
	}
	if( options.count >= 0 ){
	  query += (hasQuestionMark ? "&" : "?") 
	    + "limit=" + encodeURIComponent(options.count);
	  hasQuestionMark = true;
	}
      }
      if(query && typeof query == "object"){
	//console.log( "obj->query: " + JSON.stringify(query) );
	query = xhr.objectToQuery(query);
	//console.log( "  -->" + query );
	query = query ? (hasQuestionMark ? "&" : "?") + query: "";
	hasQuestionMark = true;
      }
      if(options && options.sort){
	var sortParam = this.sortParam;
	query += (query || hasQuestionMark ? "&" : "?") 
	  + (sortParam ? sortParam + '=' : "sort(");
	for(var i = 0; i<options.sort.length; i++){
	  var sort = options.sort[i];
	  query += (i > 0 ? "," : "") 
	    + (sort.descending ? this.descendingPrefix : this.ascendingPrefix) + encodeURIComponent(sort.attribute);
	}
	if(!sortParam){
	  query += ")";
	}
      }

      // Ok, perform the actual couchdb view lookup
      // and hook up deffereds for the totla rows
      // for for actually retuning the rows data rather than the
      // raw JSON from couchdb
      var results = xhr("GET", {
	url: this.target + this.view + (query || ""),
	handleAs: "json",
	headers: headers
      });

      var self = this;
      var query_results = QueryResults(results.then(function(res){
	var d = res.rows;
	if( res.total_rows ) {
	  d.total = res.total_rows;
	} else {
	  d.total = d.length;
	}
	//console.log( "RESULT: " + JSON.stringify( d ) );
	//console.log( "couchdb::query (" + self.target + self.view + (query || "") + ") retuning results (total=" + d.total + ")" );
	if( d.total < 10 ) {
	  //console.log( "couchdb::query res= " + JSON.stringify( res ) );
	  //console.log( "couchdb::query url= " + this.target + this.view + (query || "") );
	}
	return d;
      }));
      
      // CouchdbStore returns observable query results, so 
      // attach a new observe(....) function to the query resutls
      // which actually uses the changes feed from couchdb view
      
      // return the result
      return query_results;
    },
    
    //
    //
    _change_notify: function( change_string, self_store ) {
      
      var change = JSON.parse( change_string.data );
      //console.log( "[" + this.event_source.url + "] _change_notify: " + JSON.stringify( row ) );
      //console.log( "_change_notify: " + JSON.stringify( change ) );
      
      var rev = change.changes[0].rev;
      var deleted = change.deleted;
      var obj = change.doc;
      if( deleted ) {
	//console.log( "  -- notify( null, " + change.id + ") " );
	self_store.notify( null, change.id );
      } else if( rev.substring( 0, rev.indexOf( "-" ) ) == "1" ) {
	//console.log( "  -- notify( obj, null ) " );
	self_store.notify( obj, null );
      } else {
	//console.log( "  -- notify( obj, " + change.id + " )" );
	self_store.notify( obj, change.id );
      }
    }
  });

});
