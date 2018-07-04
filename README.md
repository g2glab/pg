# PG

Plaing Property Graph Format

## Getting Started

Go into the project directory.

    $ cd pg

Install modules by npm.

    $ npm install

Command syntax is as follows.

    $ node pg_to_pgx.js <input_pg_file> <output_path_prefix>
    $ node pg_to_neo.js <input_pg_file> <output_path_prefix>
    $ node pg_to_dot.js <input_pg_file> <output_path_prefix>

**Example:**

Execute an example to create PGX format files from a pg file.

    $ node pg_to_pgx.js examples/datatype/datatype.pg output/datatype
