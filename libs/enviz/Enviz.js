// Setup THREE to be treated as a DOM object
THREE.Object3D.prototype.appendChild = function (c) { this.add(c); return c; };
THREE.Object3D.prototype.querySelectorAll = function () {return this.children; };
THREE.Object3D.prototype.insertBefore = function (newNode, referenceNode) {
    t = newNode;
    if (referenceNode == null) {
        console.log(newNode, referenceNode);
        this.add(newNode);
    } else {
        console.log(newNode, referenceNode);
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }
};
// this one is to use D3's .attr() on THREE's objects
THREE.Object3D.prototype.setAttribute = function (name, value) {
    var chain = name.split('.');
    var object = this;
    for (var i = 0; i < chain.length - 1; i++) {
        object = object[chain[i]];
    }
    object[chain[chain.length - 1]] = value;
}

function generatePlotArea() {
    const xAxisMaterial = new THREE.MeshStandardMaterial({color: 0xff0000});
    const yAxisMaterial = new THREE.MeshStandardMaterial({color: 0x00ff00});
    const zAxisMaterial = new THREE.MeshStandardMaterial({color: 0x0000ff});

    const axisGeom = new THREE.CylinderGeometry(0.01, 0.01, 4, 4, 1, true);

    const xAxis = new THREE.Mesh(axisGeom, xAxisMaterial);
    xAxis.rotation.z = Math.PI / 2;
    const yAxis = new THREE.Mesh(axisGeom, yAxisMaterial);
    const zAxis = new THREE.Mesh(axisGeom, zAxisMaterial);
    zAxis.rotation.x = Math.PI / 2;

    const group = new THREE.Group();
    group.add(xAxis);
    group.add(yAxis);
    group.add(zAxis);

    return group;
}


class Enviz {


    constructor() {
        // Define global vars
        this.renderer;
        this.scene;
        // player object: only manipulate this position & orientation, don't modify camera directly
        this.player;
        this.head;

        this.camera;

        this.clock = new THREE.Clock();

        this.initialPos = { x: 0, y: 0, z: 30 };

        this.vrHMD;
        this.vrPlayerController;
        this.options = {
            scale: 1, // eye separation (IPD) scale
            posScale: 10 // positional tracking scale
        };

        this.initializeVR();

    }

    initializeVR() {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( this.renderer.domElement );
        this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
        this.camera.position.z = 400;

        this.scene = new THREE.Scene();

        var light = new THREE.DirectionalLight( 0xffffff );
        light.position.set( 0, 0, 1 );
        this.scene.add( light );
        var geometry = new THREE.CubeGeometry( 20, 20, 20 );


        // create container for our 3D chart
        // let chart3d = this.chart3d = new THREE.Object3D();
        // chart3d.rotation.x = 0.6;
        // this.scene.add( chart3d );

        window.addEventListener( 'resize', this.onWindowResize, false );

    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }



    loadData(file, func) {
        d3.json(file, func);
    }

    scatterPlot(columnX, columnY, columnZ, legend=true) {

    }

    init() {
        // TODO: Stub
    }

    load( error ) {
        if ( error ) {
            console.log( error );
        }

        // this.init();
        this.animate();
    }

    animate( t ){
        // TODO

        requestAnimationFrame( this.animate );

        var dt = this.clock.getDelta();

        this.update( dt );
        this.render( dt );
    }

    update() {
        // updates player head position and orientation based on HMD
        this.vrPlayerController.update( dt );
    }

    render( dt ) {
        this.vrPlayerController.render( scene );
    }
}

// var enviz = new Enviz();
