# PG Format and Converters

version 0.1.0

## Requirements

* Git
* Node

## Install

    $ git clone -b v0.1.0 https://github.com/g2gml/pg.git
    $ cd pg
    $ npm install
    $ npm link

## Run

    $ pg2pgx <input_pg_file> <output_path_prefix>
    $ pg2neo <input_pg_file> <output_path_prefix>
    $ pg2aws <input_pg_file> <output_path_prefix>
    $ pg2dot <input_pg_file> <output_path_prefix>

Example:

    $ pg2pgx examples/datatype/datatype.pg output/datatype
    "output/datatype.pgx.nodes" has been created.
    "output/datatype.pgx.edges" has been created.
    "output/datatype.pgx.json" has been created.
    
    $ ls output/datatype.*
    datatype.pgx.edges	datatype.pgx.json	datatype.pgx.nodes

## Docker

For running a command one time:

Prepare data

    $ vi data.pg
    p1 :person name:John
    p2 :person name:Mary
    p1 p2 :follows since:2013

Run pg2pgx command for example

    $ docker pull g2gml/pg:0.1.0
    $ alias pg2pgx='docker run --rm -v $PWD:/shared g2gml/pg:0.1.0 pg2pgx'
    $ pg2pgx data.pg data

For development:

Run bash on the container

    $ docker run -it --name pg -v $PWD:/shared g2gml/pg:0.1.0 /bin/bash
    $ cd pg

Pull the latest master and install vim etc.

    $ git branch -b master
    $ git pull origin master
    $ apt-get update
    $ apt-get install -y vim

If you need to re-use the same container

    $ docker start pg
    $ docker attach pg

