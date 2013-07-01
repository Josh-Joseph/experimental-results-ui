experimental-results-ui
=======================

This repo includes all of the html and javascript that is run on the client-side of the UI. This does not include the couchdb views but uses them.

Getting couchdb running:
------------------------

To get the UI running and test it:

    sudo apt-get install help2man make gcc zlib1g-dev libssl-dev rake help2man texinfo flex dctrl-tools libsctp-dev libxslt1-dev libcap2-bin ed

    sudo pip install couchdb gitpython
    
    git clone git://github.com/iriscouch/build-couchdb.git
    
    cd build-couchdb/
    
    rake
    
    setup build-couchdb/builb/etc/couchdb/local.ini as described in the README.md of https://github.com/josh00/experimental-results-framework-couchdb

Start up (and leave running) couch db

    build-couchdb/build/bin/couchdb
    

Generating fake results:
------------------------
    
Put fake results into the database

    git clone git@github.com:josh00/experimental-results-framework.git

    cd experimental-results-framework/fake-results-generator/

    python generate_fake_results.py --num-trials 200
    
To view the fake results, in a browser open http://localhost:5984/_utils/
    
Starting up jetty:
------------------

Download jetty
    
cd into jetty-distribution-* and start the server 

    java -jar start.jar
    
    
Setting up dojo:
----------------

Make a new directory in jetty-distribution-*/webapps/ called NAME

Download dojo

Copy the contents of dojo-release-*-src/ into jetty-distribution-*/webapps/NAME/

The directory structure should look like:

    jetty-distribution-*/webapps/NAME/
        dojo/
        dojox/
        ... (other dojo folders)

Running Javier test UI:
-----------------------

        git clone git@github.com:josh00/experimental-results-ui.git
        
        cp -r experimental-results-ui/dojo_addons/dojo/ jetty-distribution-*/webapps/NAME/
        
        cp -r experimental-results-ui/javier_test/ jetty-distribution-*/webapps/NAME/
        
        cp -r experimental-results-ui/pretty-json/ jetty-distribution-*/webapps/NAME/
        
        git clone git@github.com:josh00/experimental-results-framework-couchdb.git
        
Load the couchdb design documents
        
        python experimental-results-framework-couchdb/load-design-document.py --recursive --autodetect-database-from-directory-structure couchdb-design-documents/
        
Get CPM and get the dgrib component into your webapps (you may need to "sudo su" to install cpm)

        git clone https://github.com/kriszyp/cpm.git
        cd cpm
        sh install
        cd jetty-distribution-*/webapps/NAME/
        cpm install dgrid
        
To view the results, open a browser and go to localhost:8080/NAME/javier_test/programatic_layout.html


Running ERF Dashboartd UI:
-----------------------

        git clone git@github.com:josh00/experimental-results-ui.git
        
        mkdir jetty-distribution-*/webapps/NAME_2/
        
        ln -s experimental-results-ui/erf-ui-common jetty-distribution-*/webapps/NAME_2/erf-ui-common
        
        ln -s experimental-results-ui/erf-ui jetty-distribution-*/webapps/NAME_2/erf-ui
        
        ln -s experimental-results-ui/styles jetty-distribution-*/webapps/NAME_2/styles
        
        ln -s experimental-results-ui/pretty-json jetty-distribution-*/webapps/NAME_2/pretty-json
        
        git clone git@github.com:josh00/experimental-results-framework-couchdb.git
        
Load the couchdb design documents (this wil OVERWRITE any previous design docs since it uses --force !)
        
        python experimental-results-framework-couchdb/load-design-document.py --force --recursive --autodetect-database-from-directory-structure couchdb-design-documents/
        
Get CPM and get the dgrib component into your webapps (you may need to "sudo su" to install cpm)

        git clone https://github.com/kriszyp/cpm.git
        cd cpm
        sh install
        cd jetty-distribution-*/webapps/NAME_2/
        cpm install dgrid
        
To view the results, open a browser and go to localhost:8080/NAME_2/erf-ui/dashboard.html


License:
-------
This module is distrubted under the MIT license.
