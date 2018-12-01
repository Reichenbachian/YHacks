

function generatePlotArea() {


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
