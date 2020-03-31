SBOLCavas is a web application for creation and editing of genetic constructs using the SBOL data and visual standard. SBOLCanvas allows a user to create a genetic design from start to finish, with the option to incorporate existing SBOL data from a SynBioHub repository. 

DOCKER:

-SBOLCanvas is a dockerized application and can be found at the repository samuelfbridge/sbolcanvas_1.0. It is configured so that upon a merge into the master branch 'final' a new image will be built on Docker Hub. A running instance of the application can be found at http://canvas.synbioks.org/canvas/

To build & run the docker image locally:
(from the top level directory of this repository)
     -$docker build -t sbolcanvas/sbolcanvas .
     -$docker run -p 8080:8080 sbolcanvas/sbolcanvas:latest

To run the latest version on the dockerhub repository locally:
     -$docker run --rm -p 8080:8080 samuelfbridge/sbolcanvas_1.0
