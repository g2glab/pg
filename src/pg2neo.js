#!/usr/bin/env node

const fs = require('fs');
const readline = require('readline');
const pg = require('./pg2.js');
const lineParser = require('./pegjs/pg_line_parser.js');
const temp = require('temp').track();
const cluster = require('cluster');
const { exec } = require("child_process");
const util = require("./util.js");
const sep = '\t';
const lineChunkSize = 1e3;
pg.commander.option('-v, --verbose', 'Show processed line counts in progress').parse(process.argv);
const verbose = pg.commander.verbose;
const useTemp = !pg.commander.without_tmp_file;
const preserveOrder = pg.commander.preserve_order;

if(cluster.isWorker) {
  const nodeTmpFile = temp.openSync('temp').path;
  const edgeTmpFile = temp.openSync('temp').path;
  const nodeTmpStream = fs.createWriteStream(nodeTmpFile);
  const edgeTmpStream = fs.createWriteStream(edgeTmpFile);
  let nodeProps = {}, edgeProps = {};
  let nodeChunk = [], edgeChunk = [];

  function handleLines(filePath, onLine, onClose) {
    const lines = readline.createInterface(fs.createReadStream(filePath));
    lines.on('line', onLine);
    lines.on('close', onClose);
  }

  function flushChunk(typeName, chunk) {
    process.send({ type: typeName, lines: chunk.join(''), count: chunk.length });
    chunk.length = 0; // Clear chunk
  }

  process.on('message', function(msg) {
    if(msg.type == 'dump') {
      nodeProps = msg.nodeProps;
      edgeProps = msg.edgeProps;
      let ended = 0;
      const closeHandler = () => {
        if(++ended >= 2) {
          flushChunk("dumpNodes", nodeChunk);
          flushChunk("dumpEdges", edgeChunk);
          process.send({ type: 'dumpCompleted' });
        }
      };
      
      handleLines(nodeTmpFile, (line) => {
        if(line.length == 0) {
          flushChunk("dumpNodes", nodeChunk);
        } else {
          const node = JSON.parse(line);
          addNode(node[0], node[1], node[2]);
        }
      }, closeHandler);

      handleLines(edgeTmpFile, (line) => {
        if(line.length == 0) {
          flushChunk("dumpEdges", edgeChunk);
        } else {
          const edge = JSON.parse(line);
          addEdge(edge[0], edge[1], edge[3], edge[4]);
        }
      }, closeHandler);
    }
    else if(msg.type == 'dumpWithoutTmp') {
      nodeProps = msg.nodeProps;
      edgeProps = msg.edgeProps;
      const parsed = msg.lines.map((line) => lineParser.parse(line));
      parsed.forEach((elem) => {
        if(elem.node) {
          const node = elem.node;
          addNode(node.id, node.labels, node.properties);
          flushChunk("dumpNodes", nodeChunk);
        }
        else {
          const edge = elem.edge;
          addEdge(edge.from, edge.to, edge.labels, edge.properties);
          flushChunk("dumpEdges", edgeChunk);
        }
      });
    }
    else if(msg.type == 'completedWithoutTmp') {
      flushChunk("dumpNodes", nodeChunk);
      flushChunk("dumpEdges", edgeChunk);
      process.send({ type: 'dumpCompleted' });
    }
    else if(msg.type == 'eof') {
      process.send({type: 'parseCompleted', nodeProps, edgeProps });
    } else if(msg.type == 'lines') {
      const parsed = msg.lines.map((line) => lineParser.parse(line));
      if(useTemp) {
        parsed.forEach((elem) => {
          if(elem.node) {
            nodeTmpStream.write(JSON.stringify(Object.values(elem.node)) + "\n");
            addProps(nodeProps, elem.node.properties);
          }
          else {
            edgeTmpStream.write(JSON.stringify(Object.values(elem.edge)) + "\n");
            addProps(edgeProps, elem.edge.properties);
          }
        });
        nodeTmpStream.write("\n"); // delimiter of chunk
        edgeTmpStream.write("\n"); // delimiter of chunk
      } else {
        parsed.forEach((elem) => {
          if(elem.node) {
            addProps(nodeProps, elem.node.properties);
          }
          else {
            addProps(edgeProps, elem.edge.properties);
          }
        });
      }
      if(verbose)
        process.send({ type: "lineParsed", count: parsed.length });
    } else if(msg.type == "exit") {
      process.exit();
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
    nodeChunk.push(output.join(sep) + "\n");
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
    edgeChunk.push(output.join(sep) + '\n');
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
  if (pg.commander.args.length === 0) {
    console.log("Error: no argument is given!");
    pg.commander.help();
  }
  let numCPUs = parseInt(pg.commander.parallel);
  if(numCPUs <= 0) numCPUs = require('physical-cpu-count');
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }


  let nodeProps = {};
  let edgeProps = {};
  let lineCount = 0, displayedLineCount = 0;

  const pathNodes = prefix + '.neo.nodes';
  const nodeStream = fs.createWriteStream(pathNodes);
  const pathEdges = prefix + '.neo.edges';
  const edgeStream = fs.createWriteStream(pathEdges);
  let flushNode = createOrderPreservedFlush(nodeStream);
  let flushEdge = createOrderPreservedFlush(edgeStream);

  listProps(() => {
    writeHeaderNodes(() => {
      writeHeaderEdges(() => {
        writeNodesAndEdges(() => {
          console.log('"' + pathNodes + '" has been created.');
          console.log('"' + pathEdges + '" has been created.');
        });
      });
    });
  });

  function mergeProps(props, another) {
    const mergedProps = props;
    for (let [name, type] of Object.entries(another)) {
      if(!props[name]) {
        mergedProps[name] = type;
      } else if(props[name] + '[]' == type) {
        mergedProps[name] = type;
      } else if(props[name] != type && props[name] != type + '[]') {
        console.log('WARNING: Neo4j only allows homogeneous lists of datatypes (', props[name], ' and ', type, ')');
      }
    }
    return mergedProps;
  }

  function createOrderPreservedFlush(stream) {
    const dumpObj = {};
    let currentDumpId = 1;
    return (id, newChunk) => {
      if(!dumpObj[id]) dumpObj[id] = [];
      dumpObj[id].push(newChunk);
      while(dumpObj[currentDumpId] && dumpObj[currentDumpId].length > 0) {
        stream.write(dumpObj[currentDumpId].pop());
        if(++currentDumpId > numCPUs) {
          currentDumpId = 1;
        }
      }
    };
  }

  function listProps(callback) {
    let rs = fs.createReadStream(pathPg);
    let rl = readline.createInterface(rs, {});

    let currentId = 1;
    let lines = [];
    rl.on('line', function(line) {
      lines.push(line);
      if(lines.length > lineChunkSize) {        
        cluster.workers[currentId].send({type: 'lines', lines: lines});
        if(++currentId > numCPUs)
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

    for (const id in cluster.workers) {
      cluster.workers[id].on('message', (msg) => {
        if(msg.type == "lineParsed") {
          lineCount += msg.count;
          console.log(`${lineCount} lines parsed..`);
        } else if(msg.type == "parseCompleted") {
          nodeProps = mergeProps(nodeProps, msg.nodeProps);
          edgeProps = mergeProps(edgeProps, msg.edgeProps);
          if(++ended >= numCPUs) {
            callback();
            displayedLineCount = 0;
            lineCount = 0;
          }
        } else if(msg.type == "dumpNodes") {
          showProgress(msg);
          if(preserveOrder) {
            flushNode(id, msg.lines);
          } else {
            nodeStream.write(msg.lines);
          }
        } else if(msg.type == "dumpEdges") {
          showProgress(msg);
          if(preserveOrder) {
            flushEdge(id, msg.lines);
          } else {
            edgeStream.write(msg.lines);
          }
        } else if(msg.type == "dumpCompleted") {
          if(++dumpedCount >= numCPUs) {
            nodeStream.end();
            edgeStream.end();
            for (const id in cluster.workers) {
              cluster.workers[id].send({type: "exit"});
            }            
            console.log('"' + pathNodes + '" has been created.');
            console.log('"' + pathEdges + '" has been created.');
          }
        }
      });
    }
  }

  function showProgress(msg) {
    if(verbose) {
      lineCount += msg.count;
      if(lineCount > displayedLineCount + lineChunkSize) {
        console.log(`${lineCount} lines dumped..`);
        displayedLineCount = lineCount;
      }
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
    let rs = fs.createReadStream(pathPg);
    let rl = readline.createInterface(rs, {});
    
    let currentId = 1;
    let lines = [];
    if(useTemp)
    {
      Object.keys(cluster.workers).forEach( id => {
        cluster.workers[id].send({ type: "dump", nodeProps: nodeProps, edgeProps: edgeProps});
      });
    } else {
      rl.on('line', function(line) {
        lines.push(line);
        if(lines.length > lineChunkSize) {
          cluster.workers[currentId].send({type: 'dumpWithoutTmp', lines, nodeProps, edgeProps});
          currentId += 1;
          if(currentId > numCPUs)
            currentId = 1;
          lines = [];
        }
      });
      rl.on('close', () => {
        cluster.workers[currentId].send({type: 'dumpWithoutTmp', lines, nodeProps, edgeProps});
        for (const id in cluster.workers) {
          cluster.workers[id].send({type: 'completedWithoutTmp'});
        }
      });
    }
  }
}
