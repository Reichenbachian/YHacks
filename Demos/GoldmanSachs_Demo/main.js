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

init();
animate();

function init () {
    // standard THREE stuff, straight from examples
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    // renderer.vr.enabled = true;
    document.body.appendChild( renderer.domElement );

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.z = 500;
    // camera.position.y = 100;
    // camera.position.x = 100;
    
    scene = new THREE.Scene();
    
    var light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 0, 0, 1 );
    scene.add( light );

    // create container for our 3D chart

    d3.json("../../Datasets/GoldmanProcessed.json", function(error, d) {
        data = d;
        addData(d);
    });
        

}
function endAll(transition, callback) {
  var n = 0
  transition.each(() => ++n)
    .each('end', () => (!--n && callback.apply(this, arguments)))
}
var timeStep = -1;
function transition() {
    timeStep =  timeStep + 1;
    document.getElementById("bottom").innerHTML = data[0][timeStep][0];
    // timeStep %= 119;
    d3chart.transition()
      .duration(1000)
      .attrTween("position.x", function(d, i) {
        return d3.interpolateNumber(250*d[timeStep][1], 250*d[timeStep+1][1]);
      })
      .attrTween("position.y", function(d, i) {
        return d3.interpolateNumber(250*d[timeStep][2], 250*d[timeStep+1][2]);
      }).call(endAll, transition);
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

var created = 0;
function addData(data) {
    if (created) return;
    created = 1;
    chart3d = new THREE.Object3D();
    chart3d.rotation.x = 0.6;
    scene.add( chart3d );

    var geometry = new THREE.SphereGeometry( 5, 32, 32 );
    
    // use D3 to set up 3D bars
    d3chart = d3.select( chart3d )
        .selectAll()
        .data(data);

    var color = d3.scale.category20();
    d3chart
        .enter().append( function() {
            var material = new THREE.MeshLambertMaterial( {
                 color: 0x4682B4, shading: THREE.FlatShading, vertexColors: THREE.VertexColors } );
            return new THREE.Mesh( geometry, material );
        } )
        .attr("position.x", function(d, i) { return 250*d[0][1]; })
        .attr("position.y", function(d, i) { return 250*d[0][2]; })
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

    // continue with THREE stuff
    window.addEventListener( 'resize', onWindowResize, false );
    animate();
}

function onWindowResize() {
    
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize( window.innerWidth, window.innerHeight );
    
}

function animate() {
    
    requestAnimationFrame( animate );
    
    // chart3d.rotation.y += 0.01;
    
    renderer.render( scene, camera );
}


