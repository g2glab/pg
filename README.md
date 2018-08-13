# PG

Plain Property Graph Format

## Getting Started

Go into the project directory.

    $ cd pg

Install modules by npm.

    $ npm install
    $ npm link

Command syntax is as follows.

    $ pg2pgx <input_pg_file> <output_path_prefix>
    $ pg2neo <input_pg_file> <output_path_prefix>
    $ pg2dot <input_pg_file> <output_path_prefix>

**Example:**

Execute an example to create PGX format files from a pg file.

    $ pg2pgx examples/datatype/datatype.pg output/datatype
