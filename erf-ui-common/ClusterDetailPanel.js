
//
// A widget which displays information about a cluster and
// also allows one to submit jobs scripts to that cluster

define([
  "dojo/_base/declare",
  "dijit/layout/ContentPane",
  "dijit/layout/BorderContainer",
  "erf-ui-common/Config",
  "erf-ui-common/CouchdbListWidget",
  "erf-ui-common/SubmitJobWidget",
  "put-selector/put"],
	
function( declare,
	  ContentPane, 
	  BorderContainer,
	  erfConfig, 
	  CouchdbListWidget,
	  SubmitJobWidget,
	  put) {

  return declare( [BorderContainer], {
    
    // 
    // Create a new Cluster Dtail Panel.
    // THe options age mixed in, and must include at least:
    //    cluster_document: the cluster document fomr couchdb  clusters db
    // 
    // May also include:
    //    job_database_url: the url  for the jobs databse to submit jobs to
    //    headline: a widget to use as a headline element for this panel
    constructor: function( options ) {
      declare.safeMixin( this, options );
      
      // set our title from the cluster hostname
      this.title = this.cluster_document.cluster.hostname;
    },
    
    //
    // The cluster document
    cluster_document: undefined,
    
    //
    // the jobs databse url
    job_database_url: erfConfig.job_database_url,
    
    //
    // headline widget
    headline: undefined,
    
    //
    // Here is where all hte things are created dand hooked up
    postCreate: function() {

      var self = this;

      // set the headline widget (if any )
      if( this.headline ) {
	this.addChild( declare.safeMixin( { region: "top" }, headline ) );
      }
      
      // create a details panel with some widget in it
      var detailPanel = new BorderContainer({
	region: "center"
      });
      
      // Create a couchdb backed list for the jobs for this cluster
      var job_list = new CouchdbListWidget({
	database_url: self.job_database_url,
	view: "_design/ui/_view/by_cluster_id",
	query: "?key=" + dojo.toJson(self.cluster_document.cluster.cluster_id),
	region: "left",
	"class": "jobList",
	splitter: true,
	selectionMode: "single",
	loadingMessage: "---loading---",
	renderRow: function( object, options ) {
	  var script_name = object.value.job.script;
	  if( script_name.lastIndexOf( "/" ) > 0 ) {
	    script_name = script_name.substr( script_name.lastIndexOf( "/" ) + 1 );
	  }
	  return put( "div", object.value.job.status + " :: " + script_name );
	}
      });
      
      // create a new prettyjson node on hte content pane
      var contentPane = new ContentPane({
	content: "...",
	region: "center"
      });
      var pretty_json_node = new PrettyJSON.view.Node({
	el: contentPane.domNode,
	data: null
      });
      
      // Ok, we want to hook up an event listener to this new list
      // which handles clicking on a row to log the 
      // json object clicked on (the job)
      job_list.on( ".dgrid-row:click", function(evt) {
	var row = job_list.row( evt );
	
	// row.data contains the actual couchdb job document from hte store!
	// set the centeral pane content to the job document clicked on
	contentPane.set( "content", null );
	delete pretty_json_node;
	pretty_json_node = new PrettyJSON.view.Node({
	  el: contentPane.domNode,
	  data: row.data.value
	});
      });
      
      // create a pane for hte job list to be in
      var job_list_pane = new ContentPane({
	region: "left",
	"class": "edgePanel",
	splitter: true
      });
      job_list_pane.addChild( job_list );

      // add the content pane (where the pretty json is )
      // to the detail panel
      detailPanel.addChild( contentPane );
      
      // add a job submitter to the detail panel
      var jobSubmitPanel = new SubmitJobWidget({
	region: "bottom",
	job_database_url: self.job_database_url,
	cluster_id: self.cluster_document.cluster_id
      });
      detailPanel.addChild( jobSubmitPanel );
      
      
      // add the job list and detail pane to ourselves
      this.addChild( job_list_pane );
      this.addChild( detailPanel );
      
    },
    
    
  });

});
