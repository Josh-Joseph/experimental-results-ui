
// 
// This module has a bunch of useful cariables relating to the
// erf-ui. In particular, databse urls and locations are
// kept here so that it is easy to switch these rather than having
// them scattered throughout the code


define(["exports","require","module"], 
function( exports, require, module ) {
  
  var DATABASE_URL = "http://localhost:5984/";

  return {
    computation_database_url: DATABASE_URL + "computations/",
    clusters_database_url: DATABASE_URL + "clusters/",
  };
});

