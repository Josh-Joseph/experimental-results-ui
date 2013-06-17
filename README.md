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
    
    setup build-couchdb/builb/etc/couchdb/local.ini as described in the README.md [here](https://github.com/josh00/experimental-results-framework-couchdb)

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
        
        git clone git@github.com:josh00/experimental-results-framework-couchdb.git
        
        
