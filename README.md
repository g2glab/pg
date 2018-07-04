# PG

Plain Property Graph Format

## Getting Started

Go into the project directory.

    $ cd pg

Install modules by npm.

    $ npm install
    $ npm link

Command syntax is as follows.

    $ pg_to_pgx <input_pg_file> <output_path_prefix>
    $ pg_to_neo <input_pg_file> <output_path_prefix>
    $ pg_to_dot <input_pg_file> <output_path_prefix>

**Example:**

Execute an example to create PGX format files from a pg file.

    $ pg_to_pgx examples/datatype/datatype.pg output/datatype
