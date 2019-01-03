let isAnimated = true;
let nodeCount = 20;
let minNodeSize = 1;
let maxNodeSize = 20;
let linkProbability = 0.05;
let defaultRadius = 3;

// Create our data set.
let data = { nodes: [], links: [] };

// Get the canvas width and height. We will need these values later.
let width = +$("#canvas").width();
let height = +$("#canvas").height();

let canvas = d3.select("#canvas");


function clearCanvas() {
    canvas.selectAll("*").remove();
}


function draw() {
    canvas.append("g")
        .classed("links", true)
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(data.links)
        .enter()
        .append("line")
        .attr("stroke-width", d => Math.sqrt(d.weight))
        .attr("x1", d => d.source.x)
        .attr("x2", d => d.target.x)
        .attr("y1", d => d.source.y)
        .attr("y2", d => d.target.y);
    canvas.append("g")
        .classed("nodes", true)
        .selectAll("circle")
        .data(data.nodes)
        .enter()
        .append("circle")
        .attr("fill", d => d.color)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", d => Math.sqrt(d.count) * defaultRadius);
}


function generateData() {
    let startTime = +Date.now();
    data.nodes = [];
    data.links = [];
    for (let i = 0; i < nodeCount; i++) {
        let node = {
            index: i,
            count: Math.floor(randBetween(minNodeSize, maxNodeSize)),
            color: d3.interpolateRainbow(i / nodeCount)
        };
        data.nodes.push(node);
    }
    for (let i = 0; i < nodeCount; i++) {
        for (let j = 0; j < nodeCount; j++) {
            if (i === j) {
                // Don't connect a node to itself.
                continue;
            }
            else {
                let connection = Math.random() < linkProbability;
                if (connection) {
                    let link = {
                        source: i,
                        target: j,
                        weight: Math.floor(randBetween(1, Math.min(data.nodes[i].count, data.nodes[j].count)))
                    }
                    data.links.push(link);
                }
            }
        }
    }
    let endTime = +Date.now();
    log("info", `Generated ${data.nodes.length} nodes and ${data.links.length} links.`);
    log("info", `Time to generate data = ${endTime - startTime} ms.`);
}


function log(type, message) {
    let date = new Date();
    let li = $("<li></li>");
    li.addClass(type).text(`${date.toLocaleTimeString()}: ${message}`);
    $("#logs").prepend(li);
}


function onStartClick() {
    clearCanvas();
    nodeCount = +$("input[name=node-count]").val();
    log("info", `Node count = ${nodeCount} nodes.`);
    generateData();
    setIsAnimated();
    simulate();
}


function randBetween(min, max) {
    return min + (max - min) * Math.random();
}


function setIsAnimated() {
    isAnimated = $("input[name=input-animate]:checked").val() === "Yes";
    log("info", `Graph is animated: ${isAnimated}.`);
}


function simulate() {
    log("info", "Starting simulation.");
    
    let startTime = +Date.now();
    
    let simulation = d3.forceSimulation(data.nodes)
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("charge", d3.forceManyBody())
        .force("link", d3.forceLink(data.links));

    if (isAnimated) {
        // Simulation is animated, so do things the usual way.
        draw();
        simulation.on("tick", () => {
            update();
        });
        simulation.on("end", () => {
            let endTime = +Date.now();
            log("info", `Time to simulate = ${endTime - startTime} ms.`);
        });
    }
    else {
        // Simulation is not animated. Manually run through the ticks.
        simulation.stop();
        while (simulation.alpha() > simulation.alphaMin()) {
            simulation.tick();
        }
        draw();
        let endTime = +Date.now();
        log("info", `Time without simulation = ${endTime - startTime} ms.`)
    }
}


function update() {
    canvas.selectAll("line")
        .attr("x1", d => d.source.x)
        .attr("x2", d => d.target.x)
        .attr("y1", d => d.source.y)
        .attr("y2", d => d.target.y);
    canvas.selectAll("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
}


// Initial Settings
$("input[name=input-animate][value=Yes]").prop("checked", isAnimated);
$("input[name=input-animate][value=No]").prop("checked", !isAnimated);
$("input[name=node-count]").val(nodeCount);
$("input[name=link-probability]").val(linkProbability);
$("#start-button").on("click", onStartClick);