//
// This module represent a Store interface which internally is a set of
// other Store instances.  For example, a query again this object 
// really queries and returns the full set agaist all internal stores.
// Simlarly for get.
// 
// add and put have a "default" store attached to them (given in construction)
// oherwise the store is treated as "read only".
//
// Similarly, any events on the inner stores proipagate to this store for
// Observable.  This store is "techinically" always Observable, but if
// no single inner store is observable no events will ever propagate,
// otherwise any observable inner stores will propagate upwards.

define([
  "dojo/_base/declare",
  "dojo/promise/all",
  "dojo/store/Observable"],

function( declare, 
	  all,
	  Observable) {

  return declare( null, {

    //
    // Create a new Composite Store.
    // The options are mixed in to this object.
    // You must give at least the following:
    //    read_from : Array of Store instances.
    //                These stores are treated as a single query/get source
    //                by this Store.  All get and query requests are passed
    //                to all of these stores and the concatenated results
    //                returned from this store.
    //    write_to : A Store instance.
    //               add and put request are fowarded to this store.
    //               If not given, then this Store is read-only.
    //               This store need not be in the read_from array.
    constructor : function( options ) {
      declare.safeMixin( this, options );
      
      // attach add and put methods if requested
      if( this.write_to ) {
	this.attach_write_methods();
      }

      // make this observable
      this.observable_self = new Observable( this );
      
    },

    //
    // The inner stores to read from
    read_from : undefined,
    
    //
    // The store to write to
    write_to: undefined,

    //
    // add a read_from store to those managed by this composite store.
    add_read_from_store: function( store ) {
      this.read_from.push( store );
    },
    
    //
    // Sets the write_to store.
    // This can get tricky, so it's best you give this in the constructor 
    // unless you really can't.
    // Even then, we are re-initializing a bunch of things including the
    // Observable interface so things may not work as cleanly as
    // you would like.
    _set_write_to: function( store ) {
      var had_methods = this.write_to;
      this.write_to = store;
      if( !had_methods ) {
	this.attach_write_methods();
	this.observable_self = new Observable( this ); // <-- Not clean!!!
      }
    },
    
    //
    // The Store::get method
    // This calles get() on all read stores and returns the first get that
    // returns non-null.
    // We must ensure this is *not* a promise, so sync any calls
    get: function( id ) {
      for( var i = 0; i < this.read_from.length; ++i ) {
	var res = this.read_from[i].get( id );
	if( res ) {
	  return res;
	}
      }
      return null;
    },

    //
    // getIdentity returns the identity of an object.
    // This is tricky, so here goes:
    //    we assume that only the first such store which returns a 
    //    non-null identity is the right identity.
    //
    // So this returns the identity returned by the first of the read_from
    // stores, or null if no store returns non-null identity.
    //
    // Note: null therefore cannot be an identity unless it is an identity
    //       for *all* the read_from stores.
    getIdentity: function( object ) {
      for( var i = 0; i < this.read_from.length; ++i ) {
	var id = this.read_from[i].getIdentity( object );
	if( id ) {
	  return id;
	}
      }
      return null;
    },

    //
    // The potential put method (not named put(...) unless
    // attach_write_methods() is called ).
    // Will foward to the write-to store.
    _internal_put: function( object, options ) {
      return this.write_to.put( object, options );
    },
    
    
    //
    // The potential add method (not named add(...) unless
    // attach_write_methods() is called ).
    // Will foward to the write-to store.
    _internal_add: function( object, options ) {
      return this.write_to.add( object, options );
    },

    //
    // The potential remove method (not named remove(...) unless
    // attach_write_methods() is called ).
    // Will foward to the write-to store.
    _internal_remove: function( object, options ) {
      return this.write_to.remove( object, options );
    },

    //
    // Attach the add and out methods to this object
    attach_write_methods: function() {
      this.put = this._internal_put;
      this.add = this._internal_add;
      this.remove = this._internal_remove;
    },
    
    //
    // Query the store.
    // This returns a promize whose results will be the concatenation
    // of all of the query into the read_from stores.
    query: function( query, options ) {
      
      // Ok, create an array of the promises from the read_from stores
      var promises = [];
      for( var i = 0; i < this.read_from.length; ++i ) {
	var res = this.read_from[i].query( query, options );
	promises.push( res );
	
	// also, hook up the observe method to notify this store
	if( res.observe ) {
	  res.observe( this._inner_store_observe, true );
	}
      }

      // return a promize which waits for all of the 
      // promises to be complete and then concatenates their results
      return all( promises ).then( function( results ) {
	var res = [];
	for( var i = 0; i < results.length; ++i ) {
	  res = res.concat( results[i] );
	}
	return res;
      });
      
    },

    
    //
    // Function called whenever an inner observable store fires and event.
    // This translates to na event for this tore.
    //
    // Note: this is slighty broken right now since the indices are not
    //       computed relative to *this* store but to the originating store.
    //       If this is a problem, it can be fixed by storing the results
    //       length of the query for each inner store and offseting.
    _inner_store_observe: function( obj, previous_index, new_index ) {
      this.notify( obj, new_index );
    },
    
  });

});
