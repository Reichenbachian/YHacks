// LIB INITIALIZATION
var container;

let envizVR;

container = document.createElement('div');
document.body.appendChild(container);

const info = document.createElement('div');
info.style.position = 'absolute';
info.style.top = '10px';
info.style.width = '100%';
info.style.textAlign = 'center';
info.innerHTML = 'enviz vr demo';
container.appendChild(info);


envizVR = new EnvizVR(container, document.body);

// envizVR.animate();

// OVERWRITE THREE
// these are, as before, to make D3's .append() and .selectAll() work
THREE.Object3D.prototype.appendChild = function (c) { this.add(c); return c; };
THREE.Object3D.prototype.querySelectorAll = function () { return []; };

// this one is to use D3's .attr() on THREE's objects
THREE.Object3D.prototype.setAttribute = function (name, value) {
    var chain = name.split('.');
    var object = this;
    for (var i = 0; i < chain.length - 1; i++) {
        object = object[chain[i]];
    }
    object[chain[chain.length - 1]] = value;
}
THREE.Object3D.prototype.getAttribute = function (name, value) {
    var chain = name.split('.');
    var object = this;
    for (var i = 0; i < chain.length - 1; i++) {
        object = object[chain[i]];
    }
    return object;
}


var camera, scene, renderer, chart3d, d3chart, data;
scene = envizVR.scene;
renderer = envizVR.renderer;
camera = envizVR.camera;


// var geometry = new THREE.BoxGeometry( 1, 1, 1 );
// var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
// var cube = new THREE.Mesh( geometry, material );
// scene.add( cube );

// create container for our 3D chart

var timeStep = -1;
function transition() {
    timeStep =  timeStep + 1;
    document.getElementById("bottom").innerHTML = data[0][timeStep][0];
    timeStep %= 119;
    d3chart.transition()
      .ease("easeCircle")
      .duration(800)
      .attrTween("position.x", function(d, i) {
        return d3.interpolateNumber(2.5*d[timeStep][1], 2.5*d[timeStep+1][1]);
      })
      .attrTween("position.y", function(d, i) {
        return d3.interpolateNumber(2.5*d[timeStep][2], 2.5*d[timeStep+1][2]);
      }).call(endAll, transition);
}

var created = 0;
function addData(data) {
    if (created) return;
    created = 1;
    chart3d = new THREE.Object3D();
    chart3d.position.z = -2.2;
    chart3d.position.x = -1.4;
    envizVR.scene.add( chart3d );

    var geometry = new THREE.SphereGeometry( 0.03, 6, 6 );
    
    // use D3 to set up 3D bars
    d3chart = d3.select( chart3d )
        .selectAll()
        .data(data);

    var color = d3.scale.category20();
    d3chart
        .enter().append( function() {
            var material = new THREE.MeshLambertMaterial( {
                 color: 0x4682B4, shading: THREE.FlatShading, vertexColors: THREE.VertexColors } );
            var tmp = new THREE.Mesh( geometry, material );
            scene.add(tmp)
            return tmp;
        } )
        .attr("position.x", function(d, i) { return 2.5*d[0][1]; })
        .attr("position.y", function(d, i) { return 2.5*d[0][2]; })
        .attr("material.color.r", function(d, i) {
                                        return hexToRgb(color(i/120)).r/256;
                                    })
        .attr("material.color.g", function(d, i) {
                                        return hexToRgb(color(i/120)).g/256;
                                    })
        .attr("material.color.b", function(d, i) {
                                        return hexToRgb(color(i/120)).b/256;
                                    })

    transition()
}


// UTILITIES
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function endAll(transition, callback) {
  var n = 0
  transition.each(() => ++n)
    .each('end', () => (!--n && callback.apply(this, arguments)))
}

d3.json("../../Datasets/GoldmanProcessed.json", function(error, d) {
    data = d;
    addData(d);
});

function animate() {
    
    requestAnimationFrame( animate );    
    renderer.render( scene, camera );
}


animate();

slicesGraphs(slices([[]], [[]])).forEach((gra, i) => {
    const gr = gra.getPlot();
    envizVR.renders.push(gra);
    gr.position.z = i * 2 - 2;
    envizVR.scene.add(gr);
});