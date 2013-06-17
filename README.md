experimental-results-ui
=======================

Quickstart:
-----------

To get the UI running and test it:

    sudo apt-get install help2man make gcc zlib1g-dev libssl-dev rake help2man texinfo flex dctrl-tools libsctp-dev libxslt1-dev libcap2-bin ed

    sudo pip install couchdb gitpython
    
    git clone git://github.com/iriscouch/build-couchdb.git
    
    cd build-couchdb/
    
    rake

Start up (and leave running) couch db

    build/bin/couchdb

Download jetty and dojo

Copy the contents of dojo-release-*-src into jetty-distribution-*/webapps/

    git clone git@github.com:josh00/experimental-results-framework.git

    cd experimental-results-framework/fake-results-generator/

    python generate_fake_results.py --num-trials 200
    
cd into jetty-distribution-* and start the server 

    java -jar start.jar


jetty directory structure:
--------------------------

    jetty-distribution-*/webapps/
        dojo/
        dojox/
        ... (other dojo folders)
        test/
            mymodule.ss
            test.html
