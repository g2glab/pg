# PG

version 0.1.0

## Pre-requirement

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

    $ docker pull ryotas/pg:0.1.0
    $ docker run -v `pwd`:/tmp ryotas/pg:0.1.0 pg2pgx /tmp/data.pg /tmp/data
