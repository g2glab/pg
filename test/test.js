var childProcess = require('child_process');
var assert = require('assert');
var chai = require('chai');
chai.use(require('chai-fs'));
var assert = chai.assert;
var fs = require('fs');

describe('pg2pgx', function() {
  describe('datatype', function() {
    childProcess.execFileSync('pg2pgx', ['./examples/datatype/datatype.pg', './output/datatype']);
    it('generates 3 files: .pgx.nodes .pgx.edges .pgx.json', function() {
      assert.pathExists('./output/datatype.pgx.nodes');
      assert.pathExists('./output/datatype.pgx.edges');
      assert.pathExists('./output/datatype.pgx.json');
    });
    it('generates expected file: .pgx.nodes', function() {
      childProcess.execSync('sort ./output/datatype.pgx.nodes > ./output/datatype.pgx.nodes.sorted');
      childProcess.execSync('sort ./examples/datatype/datatype.pgx.nodes > ./examples/datatype/datatype.pgx.nodes.sorted');
      var result = fs.readFileSync("./output/datatype.pgx.nodes.sorted");
      var expect = fs.readFileSync("./examples/datatype/datatype.pgx.nodes.sorted");
      assert.deepEqual(result, expect);
    });
    it('generates expected file: .pgx.edges', function() {
      childProcess.execSync('sort ./output/datatype.pgx.edges > ./output/datatype.pgx.edges.sorted');
      childProcess.execSync('sort ./examples/datatype/datatype.pgx.edges > ./examples/datatype/datatype.pgx.edges.sorted');
      var result = fs.readFileSync("./output/datatype.pgx.edges");
      var expect = fs.readFileSync("./examples/datatype/datatype.pgx.edges");
      assert.deepEqual(result, expect);
    });
    it('generates expected file: .pgx.json', function() {
      var result = fs.readFileSync("./output/datatype.pgx.json");
      var expect = fs.readFileSync("./examples/datatype/datatype.pgx.json");
      assert.deepEqual(result, expect);
    });
  });
});

describe('pg2neo', function() {
  describe('datatype', function() {
    childProcess.execFileSync('pg2neo', ['./examples/datatype/datatype.pg', './output/datatype']);
    it('generates 2 files: .neo.nodes .neo.edges', function() {
      assert.pathExists('./output/datatype.neo.nodes');
      assert.pathExists('./output/datatype.neo.edges');
    });
  });
});

describe('pg2aws', function() {
  describe('datatype', function() {
    childProcess.execFileSync('pg2aws', ['./examples/datatype/datatype.pg', './output/datatype']);
    it('generates 2 files: .aws.nodes .aws.edges', function() {
      assert.pathExists('./output/datatype.aws.nodes');
      assert.pathExists('./output/datatype.aws.edges');
    });
  });
});

describe('pg2dot', function() {
  describe('datatype', function() {
    childProcess.execFileSync('pg2dot', ['./examples/datatype/datatype.pg', './output/datatype']);
    it('generates 1 file: .dot', function() {
      assert.pathExists('./output/datatype.dot');
    });
  });
});
