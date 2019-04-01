var childProcess = require('child_process');
var assert = require('assert');
var chai = require('chai');
chai.use(require('chai-fs'));
var assert = chai.assert;
var fs = require('fs');

describe('direction', function() {
  describe('pgx', function() {
    childProcess.execFileSync('pg2pgx', ['./examples/direction/direction.pg', '-o', './output']);
    it('generates 3 files: .pgx.nodes .pgx.edges .pgx.json', function() {
      assert.pathExists('./output/direction.pgx.nodes');
      assert.pathExists('./output/direction.pgx.edges');
      assert.pathExists('./output/direction.pgx.json');
    });
    it('generates expected file: .pgx.nodes', function() {
      var result = fs.readFileSync("./output/direction.pgx.nodes");
      var expect = fs.readFileSync("./examples/direction/direction.pgx.nodes");
      assert.deepEqual(result, expect);
    });
    it('generates expected file: .pgx.edges', function() {
      var result = fs.readFileSync("./output/direction.pgx.edges");
      var expect = fs.readFileSync("./examples/direction/direction.pgx.edges");
      assert.deepEqual(result, expect);
    });
    it('generates expected file: .pgx.json', function() {
      var result = fs.readFileSync("./output/direction.pgx.json");
      var expect = fs.readFileSync("./examples/direction/direction.pgx.json");
      assert.deepEqual(result, expect);
    });
  });
  describe('neo', function() {
    childProcess.execFileSync('pg2neo', ['./examples/direction/direction.pg', '-o', './output']);
    it('generates 2 files: .neo.nodes .neo.edges', function() {
      assert.pathExists('./output/direction.neo.nodes');
      assert.pathExists('./output/direction.neo.edges');
    });
    it('generates expected file: .neo.nodes', function() {
      var result = fs.readFileSync("./output/direction.neo.nodes");
      var expect = fs.readFileSync("./examples/direction/direction.neo.nodes");
      assert.deepEqual(result, expect);
    });
    it('generates expected file: .neo.edges', function() {
      childProcess.execSync('sort ./output/direction.neo.edges > /tmp/result');
      childProcess.execSync('sort ./examples/direction/direction.neo.edges > /tmp/expect');
      var result = fs.readFileSync("/tmp/result");
      var expect = fs.readFileSync("/tmp/expect");
      assert.deepEqual(result, expect);
    });
  });
  describe('aws', function() {
    childProcess.execFileSync('pg2aws', ['./examples/direction/direction.pg', '-o', './output']);
    it('generates 2 files: .aws.nodes .aws.edges', function() {
      assert.pathExists('./output/direction.aws.nodes');
      assert.pathExists('./output/direction.aws.edges');
    });
    it('generates expected file: .aws.nodes', function() {
      var result = fs.readFileSync("./output/direction.aws.nodes");
      var expect = fs.readFileSync("./examples/direction/direction.aws.nodes");
      assert.deepEqual(result, expect);
    });
    it('generates expected file: .aws.edges', function() {
      childProcess.execSync('sort ./output/direction.aws.edges > /tmp/result');
      childProcess.execSync('sort ./examples/direction/direction.aws.edges > /tmp/expect');
      var result = fs.readFileSync("/tmp/result");
      var expect = fs.readFileSync("/tmp/expect");
      assert.deepEqual(result, expect);
    });
  });
  describe('dot', function() {
    childProcess.execFileSync('pg2dot', ['./examples/direction/direction.pg', '-o', './output']);
    it('generates 1 file: .dot', function() {
      assert.pathExists('./output/direction.dot');
    });
    it('generates expected file: .dot', function() {
      childProcess.execSync('sort ./output/direction.dot > /tmp/result');
      childProcess.execSync('sort ./examples/direction/direction.dot > /tmp/expect');
      var result = fs.readFileSync("/tmp/result");
      var expect = fs.readFileSync("/tmp/expect");
      assert.deepEqual(result, expect);
    });
  });
});

