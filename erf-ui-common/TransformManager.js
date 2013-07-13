
//
// This module represents a nice way of managing a set of named transforms
// that change over time.
// Each transform also has a set of tags associated with them.

define( [
  "dojo/_base/declare",
  "dojo/request"],

function( declare,
	  request) {
  
  return declare( null, {

    constructor: function( options ) {
      declare.safeMixin( this, options );
    },

    //
    // The list of known transforms ( {name: "", transform: "", tags: [..]} )
    _known_transforms: [],
    
    //
    // Add a transform with a list of tags and name
    add_transform: function( transform, name, tags ) {
      this._known_transforms.push({
	name: name,
	transform: transform,
	tags: tags
      });
    },
    
    //
    // Query for a list of all transforms with matching tags
    // If tags is null (default) returns all known transforms
    get_transforms: function( tags ) {
      if( !tags ) {
	return this._known_transforms;
      }
      var res = [];
      for( var i = 0; i < this._known_transforms.length; ++i ) {
	var obj = this._known_transforms[i];
	var has_tags = true;
	for( var t = 0; t < tags.length; ++t ) {
	  var tag = tags[t];
	  if( obj.tags.indexOf( tag ) == -1 ) {
	    has_tags = false;
	    break;
	  }
	}
	if( has_tags ) {
	  res.push( obj );
	}
      }
      return res;      
    },


    
  });

});

