#!/bin/bash
pg_to_pgx examples/datatype/datatype.pg output/datatype
pg_to_neo examples/datatype/datatype.pg output/datatype
pg_to_dot examples/datatype/datatype.pg output/datatype
