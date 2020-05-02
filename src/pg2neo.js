#!/usr/bin/env node

String.prototype.quoteIfNeeded = function() {
  if(this.includes('"') || this.includes('\t')) {
    return `"${this.replace('"', '""')}"`;
  }
  return this;
}

var fs = require('fs');
var readline = require('readline');
var pg = require('./pg2.js');
var lineParser = require('./pegjs/pg_line_parser.js');
var tempfile = require('tempfile');
const cluster = require('cluster');
const { exec } = require("child_process");
const sep = '\t';

if(cluster.isWorker) {
  const nodeDstFile = tempfile(), nodeTmpFile = tempfile();
  const edgeDstFile = tempfile(), edgeTmpFile = tempfile();
  const nodeTmpStream = fs.createWriteStream(nodeTmpFile);
  const edgeTmpStream = fs.createWriteStream(edgeTmpFile);
  const nodeDstStream = fs.createWriteStream(nodeDstFile);
  const edgeDstStream = fs.createWriteStream(edgeDstFile);
  let nodeProps = {}, edgeProps = {};

  process.on('message', function(msg) {
    if(msg.type == 'dump') {
      nodeProps = msg.nodeProps;
      edgeProps = msg.edgeProps;
      const nodeLines = readline.createInterface(fs.createReadStream(nodeTmpFile));
      let ended = 0;
      nodeLines.on('line', (line) => {
        const node = JSON.parse(line);
        addNode(node.id, node.labels, node.properties);
      });
      const closeHandler =  () => {
        if(++ended >= 2) {
          process.send({ type: 'dumpCompleted', nodeFile: nodeDstFile, edgeFile: edgeDstFile });
          process.exit();
        }
      };
      nodeLines.on('close', closeHandler);
      const edgeLines = readline.createInterface(fs.createReadStream(edgeTmpFile));
      edgeLines.on('line', (line) => {
        const edge = JSON.parse(line);
        addEdge(edge.from, edge.to, edge.labels, edge.properties);
      });
      edgeLines.on('close', closeHandler);
    }
    else if(msg.type == 'eof') {
      process.send({type: 'parseCompleted', nodeProps, edgeProps });
    } else if(msg.type == 'lines') {
      const parsed = msg.lines.map((line) => lineParser.parse(line));
      parsed.forEach((elem) => {
        if(elem.node) {
          nodeTmpStream.write(JSON.stringify(elem.node) + "\n");
          addProps(nodeProps, elem.node.properties);
        }
        else {
          edgeTmpStream.write(JSON.stringify(elem.edge) + "\n");
          addProps(edgeProps, elem.edge.properties);
        }
      });
    }
  });

  function addNode(id, labels, props) {
    let output = [ id, labels.join(';') ];
    let lineProps = new Map();
    for (let [key, values] of Object.entries(props)) {
      lineProps.set(key, values.map(value => value.rmdq()).join(';').quoteIfNeeded());
    }
    Object.keys(nodeProps).forEach((key, i) => {
      output[i + 2] = (lineProps.has(key)) ? lineProps.get(key) : '';
    });
    nodeDstStream.write(output.join(sep) + '\n');
  }

  function addEdge(id1, id2, labels, props) {
    let output = [ id1, id2, labels[0] ];
    let lineProps = new Map();
    for (let [key, values] of Object.entries(props)) {
      lineProps.set(key, values.map(value => value.rmdq()).join(';').quoteIfNeeded());
    }
    Object.keys(edgeProps).forEach((key, i) => {
      output[i + 3] = (lineProps.has(key)) ? lineProps.get(key) : '';
    });
    edgeDstStream.write(output.join(sep) + '\n');
  }

  function addProps(allProps, props) {
    for (let [key, values] of Object.entries(props)) {
      if (values.length === 1) {
        for (let value of values) {
          if (!allProps[key]) {
            allProps[key] = value.type();
          }
        }
      } else {
        let type = null;
        for (let value of values) {
          if ((type === null) || (type === value.type())) {
            type = value.type();
          } else {
            console.log('WARNING: Neo4j only allows homogeneous lists of datatypes (', type, ' and ', value.type());
          }
        }
        if ((! allProps[key]) || (allProps[key] === type)) {
          allProps[key] = type + '[]';
        }
      }
    }
  }


} else {
  const numCPUs = require('os').cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  pg.commander;
  if (pg.commander.args.length === 0) {
    console.error("Error: no argument is given!");
    pg.commander.help();
  }

  let nodeProps = {};
  let edgeProps = {};

  const pathNodes = prefix + '.neo.nodes';
  const nodeStream = fs.createWriteStream(pathNodes);
  const pathEdges = prefix + '.neo.edges';
  const edgeStream = fs.createWriteStream(pathEdges);

  listProps(() => {
    console.log("listed");
    writeHeaderNodes(() => {
      console.log("wrote header nodes");
      writeHeaderEdges(() => {
        console.log("wrote header edges");
        writeNodesAndEdges(() => {
          console.log('"' + pathNodes + '" has been created.');
          console.log('"' + pathEdges + '" has been created.');
        });
      });
    });
  });

  function listProps(callback) {
    let rs = fs.createReadStream(pathPg);
    let rl = readline.createInterface(rs, {});

    let currentId = 1;
    let lines = [];
    rl.on('line', function(line) {
      lines.push(line);
      if(lines.length > 1e3) {
        cluster.workers[currentId].send({type: 'lines', lines: lines});
        currentId += 1;
        if(currentId > numCPUs)
          currentId = 1;
        lines = [];
      }
    });
    rl.on('close', () => {
      cluster.workers[currentId].send({type: 'lines', lines: lines});
      for (const id in cluster.workers) {
        cluster.workers[id].send({type: "eof"});
      }
    });

    let ended = 0;
    let dumpedCount = 0;
    let nodeFiles = [];
    let edgeFiles = [];

    for (const id in cluster.workers) {
      cluster.workers[id].on('message', (msg) => {
        if(msg.type == "parseCompleted") {
          nodeProps = Object.assign(nodeProps, msg.nodeProps);
          edgeProps = Object.assign(edgeProps, msg.edgeProps);
          if(++ended >= numCPUs) {
            callback();
          }
        } else if(msg.type == "dumpCompleted") {
          nodeFiles[id] = msg.nodeFile;
          edgeFiles[id] = msg.edgeFile;
          if(++dumpedCount >= numCPUs) {
            nodeStream.end();
            edgeStream.end();
            let command = `cat ${nodeFiles.join(' ')} >> ${pathNodes}`;
            exec(command);
            command = `cat ${edgeFiles.join(' ')} >> ${pathEdges}`;
            exec(command);
            console.log('"' + pathNodes + '" has been created.');
            console.log('"' + pathEdges + '" has been created.');
          }
        }
      });
    }
  }

  function writeHeaderNodes(callback) {
    let output = ['id:ID', ':LABEL'];
    Object.keys(nodeProps).forEach((key, i) => {
      output[i + 2] = key + ':' + nodeProps[key];
    });
    nodeStream.write(output.join(sep) + '\n', (err) => {});
    callback();
  }

  function writeHeaderEdges(callback) {
    let output = [':START_ID', ':END_ID', ':TYPE'];
    Object.keys(edgeProps).forEach((key, i) => {
      output[i + 3] = key + ':' + edgeProps[key];
    });
    edgeStream.write(output.join(sep) + '\n');
    callback();
  }

  function writeNodesAndEdges(callback) {
    Object.keys(cluster.workers).forEach( id => {
      cluster.workers[id].send({ type: "dump", nodeProps: nodeProps, edgeProps: edgeProps});
    });
  }
}
