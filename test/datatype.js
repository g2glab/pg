var childProcess = require('child_process');
var assert = require('assert');
var chai = require('chai');
chai.use(require('chai-fs'));
var assert = chai.assert;
var fs = require('fs');

describe('datatype', function() {
  describe('pgx', function() {
    childProcess.execFileSync('pg2pgx', ['./examples/datatype/datatype.pg', '-o', './output']);
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
  describe('neo', function() {
    childProcess.execFileSync('pg2neo', ['./examples/datatype/datatype.pg', '-o', './output']);
    it('generates 2 files: .neo.nodes .neo.edges', function() {
      assert.pathExists('./output/datatype.neo.nodes');
      assert.pathExists('./output/datatype.neo.edges');
    });
    it('generates expected file: .neo.nodes', function() {
      var result = fs.readFileSync("./output/datatype.neo.nodes");
      var expect = fs.readFileSync("./examples/datatype/datatype.neo.nodes");
      assert.deepEqual(result, expect);
    });
    it('generates expected file: .neo.edges', function() {
      childProcess.execSync('sort ./output/datatype.neo.edges > /tmp/result');
      childProcess.execSync('sort ./examples/datatype/datatype.neo.edges > /tmp/expect');
      var result = fs.readFileSync("/tmp/result");
      var expect = fs.readFileSync("/tmp/expect");
      assert.deepEqual(result, expect);
    });
  });
  describe('aws', function() {
    childProcess.execFileSync('pg2aws', ['./examples/datatype/datatype.pg', '-o', './output']);
    it('generates 2 files: .aws.nodes .aws.edges', function() {
      assert.pathExists('./output/datatype.aws.nodes');
      assert.pathExists('./output/datatype.aws.edges');
    });
    it('generates expected file: .aws.nodes', function() {
      var result = fs.readFileSync("./output/datatype.aws.nodes");
      var expect = fs.readFileSync("./examples/datatype/datatype.aws.nodes");
      assert.deepEqual(result, expect);
    });
    it('generates expected file: .aws.edges', function() {
      childProcess.execSync('sort ./output/datatype.aws.edges > /tmp/result');
      childProcess.execSync('sort ./examples/datatype/datatype.aws.edges > /tmp/expect');
      var result = fs.readFileSync("/tmp/result");
      var expect = fs.readFileSync("/tmp/expect");
      assert.deepEqual(result, expect);
    });
  });
  describe('dot', function() {
    childProcess.execFileSync('pg2dot', ['./examples/datatype/datatype.pg', '-o', './output']);
    it('generates 1 file: .dot', function() {
      assert.pathExists('./output/datatype.dot');
    });
    it('generates expected file: .dot', function() {
      childProcess.execSync('sort ./output/datatype.dot > /tmp/result');
      childProcess.execSync('sort ./examples/datatype/datatype.dot > /tmp/expect');
      var result = fs.readFileSync("/tmp/result");
      var expect = fs.readFileSync("/tmp/expect");
      assert.deepEqual(result, expect);
    });
  });
});

