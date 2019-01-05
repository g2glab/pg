var childProcess = require('child_process');
var assert = require('assert');
var chai = require('chai');
chai.use(require('chai-fs'));
var assert = chai.assert;
var fs = require('fs');

describe('pg2pgx', function() {
  describe('c360', function() {
    childProcess.execFileSync('pg2pgx', ['./examples/c360/c360.pg', './output/c360']);
    it('generates 3 files: .pgx.nodes .pgx.edges .pgx.json', function() {
      assert.pathExists('./output/c360.pgx.nodes');
      assert.pathExists('./output/c360.pgx.edges');
      assert.pathExists('./output/c360.pgx.json');
    });
    it('generates expected file: .pgx.nodes', function() {
      var result = fs.readFileSync("./output/c360.pgx.nodes");
      var expect = fs.readFileSync("./examples/c360/c360.pgx.nodes");
      assert.deepEqual(result, expect);
    });
    it('generates expected file: .pgx.edges', function() {
      var result = fs.readFileSync("./output/c360.pgx.edges");
      var expect = fs.readFileSync("./examples/c360/c360.pgx.edges");
      assert.deepEqual(result, expect);
    });
    it('generates expected file: .pgx.json', function() {
      var result = fs.readFileSync("./output/c360.pgx.json");
      var expect = fs.readFileSync("./examples/c360/c360.pgx.json");
      assert.deepEqual(result, expect);
    });
  });
  describe('datatype', function() {
    childProcess.execFileSync('pg2pgx', ['./examples/datatype/datatype.pg', './output/datatype']);
    it('generates 3 files: .pgx.nodes .pgx.edges .pgx.json', function() {
      assert.pathExists('./output/datatype.pgx.nodes');
      assert.pathExists('./output/datatype.pgx.edges');
      assert.pathExists('./output/datatype.pgx.json');
    });
    it('generates expected file: .pgx.nodes', function() {
      var result = fs.readFileSync("./output/datatype.pgx.nodes");
      var expect = fs.readFileSync("./examples/datatype/datatype.pgx.nodes");
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

