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

    $ docker pull g2gml/pg:0.1.0
    $ docker run -v `pwd`:/shared g2gml/pg:0.1.0 pg2pgx /shared/data.pg /shared/data

For development using Docker container:

    $ docker run -it --name pg -v `pwd`:/tmp g2gml/pg:0.1.0 /bin/bash
    $ cd pg

    $ git pull origin master
    $ apt-get update
    $ apt-get install -y vim

    $ docker start pg
    $ docker attach pg

