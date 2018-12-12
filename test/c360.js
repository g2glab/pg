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
      childProcess.execSync('sort ./output/c360.pgx.nodes > ./output/c360.pgx.nodes.sorted');
      childProcess.execSync('sort ./examples/c360/c360.pgx.nodes > ./examples/c360/c360.pgx.nodes.sorted');
      var result = fs.readFileSync("./output/c360.pgx.nodes.sorted");
      var expect = fs.readFileSync("./examples/c360/c360.pgx.nodes.sorted");
      assert.deepEqual(result, expect);
    });
    it('generates expected file: .pgx.edges', function() {
      childProcess.execSync('sort ./output/c360.pgx.edges > ./output/c360.pgx.edges.sorted');
      childProcess.execSync('sort ./examples/c360/c360.pgx.edges > ./examples/c360/c360.pgx.edges.sorted');
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
});

describe('pg2neo', function() {
  describe('c360', function() {
    childProcess.execFileSync('pg2neo', ['./examples/c360/c360.pg', './output/c360']);
    it('generates 2 files: .neo.nodes .neo.edges', function() {
      assert.pathExists('./output/c360.neo.nodes');
      assert.pathExists('./output/c360.neo.edges');
    });
  });
});

describe('pg2aws', function() {
  describe('c360', function() {
    childProcess.execFileSync('pg2aws', ['./examples/c360/c360.pg', './output/c360']);
    it('generates 2 files: .aws.nodes .aws.edges', function() {
      assert.pathExists('./output/c360.aws.nodes');
      assert.pathExists('./output/c360.aws.edges');
    });
  });
});

describe('pg2dot', function() {
  describe('c360', function() {
    childProcess.execFileSync('pg2dot', ['./examples/c360/c360.pg', './output/c360']);
    it('generates 1 file: .dot', function() {
      assert.pathExists('./output/c360.dot');
    });
  });
});
