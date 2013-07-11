
// 
// This is a module that represents a List widget backed by a CouchDB
// database and view.
// Internally, we will use a CouchdbStore and will create an eventsource with
// any changes. 
// This means that the list will reflect changes in hte couchdb view, and 
// will load on demand ratehr than all at once.

define([
  "erf-ui-common/CouchdbStore",
  "dgrid/OnDemandList",
  "dgrid/Selection",
  "dgrid/Keyboard",
  "dgrid/extensions/DijitRegistry",
  "dgrid/util/misc",
  "dojo/_base/declare"],
       
function( CouchdbStore, 
	  OnDemandList, DGridSelection, DGridKeyboard,
	  DGridDijitRegistry,
	  DGridUtil,
	  declare) {
  
  
  
  return declare( [OnDemandList,
		   DGridSelection,
		   DGridKeyboard,
		   DGridDijitRegistry], {
		     
    // 
    // Create a new CouchdbListWidget.
    // We will mix in hte options given,
    // but at least the followin should be given:
    //    database_url : string
    //    view : string
    //    query : string OR object   
    constructor: function( options ) {
      declare.safeMixin( this, options );
      
      // setup the couchdb store
      this.store = new CouchdbStore({
	target: this.database_url,
	view: this.view
      });

      // setup the event source
      this.database_event_source = new EventSource( this.database_url + "_changes?since=now&include_docs=true&feed=eventsource" );
      
      // setup the refresh on a new bit of data
      var self = this;
      this.database_event_source.addEventListener( "message", DGridUtil.debounce( function(evt) {
	self.refresh();
      }, this, 2000 ));
    }, 
		     
    
    //
    // The couchdb databse url.
    // This is the base databse url (so NO VIEW on it).
    // You should end this with a /
    database_url: undefined,
    
    //
    // The database view url to use.
    // This will be appended to the databse url.
    // This should NOT end in a sslash or start with a slash.
    // In general, should start with _design/.../_view/...
    view: undefined,
    

    //
    // The event source for changes to the couchdb databse we
    // are listeniong on.
    // The changes are given as "message" events on this source.
    // This is to allow for other javascript events to be triggered
    // off of it and other listeners (besides this) to listen to
    // changes in the database.
    database_event_source: undefined
 
  });
  
  
});
