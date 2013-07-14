experimental-results-ui
=======================

The purpose of this codebase is to:

1. Start/monitor distributed jobs from the experimental results framework through a UI
2. Graphical/interactive views the results from the jobs


Required Packages:
-----------------

* Jetty 9 from http://download.eclipse.org/jetty/stable-9/dist/
* openjdk-7 (apt-get install openjdk-7-jdk openjdk-7-jre)
* dojo 1.9.0:  http://download.dojotoolkit.org/release-1.9.0/dojo-release-1.9.0-src.tar.gz


Webapps and Jetty:
-----------------

Jetty, by default, will take anything inside of the webapps folder and use it as a static content page.
This folder is scanned by jetty as it runs for hot-plug contents.
So we just create a folder inside of webapps and copy in all of the dojo sources as well as make a subfolder for our own UI sources and we are set.
The webapp/<folder>will be at url localhost:8080/<folder>.


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
