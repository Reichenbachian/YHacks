/*
 *3d audio spectrum viauslizer built with three.js
 * revision 0.2.7
 *Mar 20,2014 Wayou
 *Licensed under the MIT license
 * view on github:https://github.com/Wayou/3D_Audio_Spectrum_VIsualizer/
 */

let envizVR;

container = document.createElement('div');
document.body.appendChild(container);

const info = document.createElement('div');
info.style.position = 'absolute';
info.style.top = '10px';
info.style.width = '100%';
info.style.textAlign = 'center';
container.appendChild(info);


envizVR = new EnvizVR(container, document.body);

//Prepare Scene
var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var MWIDTH = .1;
var MTHICKNESS = .02;
var GAP = .05;
var METERNUM = Math.round(10 / (MWIDTH + GAP))
var axes = new THREE.AxisHelper(20); //the axes for debug using
var scene = envizVR.scene;
var render = envizVR.render;
// var render = new THREE.WebGLRenderer({
//  antialias: true
// });
var camera = envizVR.camera;
var plane;
var planeGeometry;
var planeMaterial;
// var spotLight = new THREE.SpotLight(0xffffff);
// var ambientLight = new THREE.AmbientLight(0x5c5c5c);
//the render
// render.setClearColor(0x212121);
// render.setPixelRatio(window.devicePixelRatio);
// render.setSize(WIDTH, HEIGHT);
// render.gammaInput = true;
// render.gammaOutput = true;
// render.vr.enabled = true;
// render.shadowMapEnabled = true;
// scene.add(ambientLight);
// spotLight.position.set(0, 60, 40);
// scene.add(spotLight);
// render.render(scene, camera);
//the plane
planeGeometry = new THREE.PlaneGeometry(500, 500);
planeMaterial = new THREE.MeshPhongMaterial({
    color: 0x222222,
    ambient: 0x555555,
    specular: 0xdddddd,
    shininess: 5,
    reflectivity: 2
});
planeMaterial.side = THREE.DoubleSide;
plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -0.5 * Math.PI;
plane.position.x = 15;
plane.position.y = 0;
plane.position.z = 0;
plane.receiveShadow = true;
scene.add(plane);
//the cube
var cubeGeometry = new THREE.CubeGeometry(MWIDTH, 1, MTHICKNESS);
var cubeMaterial = new THREE.MeshPhongMaterial({
    color: 0x01FF00,
    ambient: 0x01FF00,
    specular: 0x01FF00,
    shininess: 20,
    reflectivity: 5.5
});
var capGeometry = new THREE.CubeGeometry(MWIDTH, 0.5, MTHICKNESS);
var capMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    ambient: 0x01FF00,
    specular: 0x01FF00,
    shininess: 20,
    reflectivity: 5.5
});
//the camera
camera.position.x = 0;
camera.position.y = 1;
camera.position.z = 0;
camera.lookAt(scene.position);


var Visualizer = function(file) {
    this.appName='Music Demo';
    this.audioContext;
    this.source;
    this.status = 0; //flag to indicate the audio is palying or stoed
    this.processing = false; //detect if there's a file is under processing, if so refuse to handle new files
    this.forceStop = false; //the audio is stoped by a new file or normally end
    this.render;
    this.clock;
    this.animationId;
}
Visualizer.prototype = {
    init: function() { //prepare the audio and the scene
        //fix the browser vendor
        window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
        window.cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame;
        window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
        try {
            this.audioContext = new AudioContext();
        } catch (e) {
            this.infoContainer.textContent = 'audio context is not supported :(';
        }
        this._prepareScene();
    },
    _drawVisualizer: function(scene, render, camera, analyser, x_pos, y_pos, z_pos, rotate) {
        var clock = this.clock;
        clock = new THREE.Clock();
        scene = window.scene;
        var container = new THREE.Object3D();
        //add the axes for debug
        scene.add(container);
        // container.add(axes);
        container.position.x = x_pos;
        container.position.y = y_pos;
        container.position.z = z_pos;
        container.rotation.y = rotate;
        for (var i = METERNUM - 1; i >= 0; i--) {
            var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
            cube.position.x = -1 + (MWIDTH + GAP) * i;
            cube.position.y = -1;
            cube.position.z = 0.5;
            cube.castShadow = true;
            cube.name = 'cube' + i;
            container.add(cube);
            var cap = new THREE.Mesh(capGeometry, capMaterial);
            cap.position.x = -1 + (MWIDTH + GAP) * i;
            cap.position.y = 0.5;
            cap.position.z = 0.5;
            cap.castShadow = true;
            cap.name = 'cap' + i;
            container.add(cap);
        };
        
        //spotLight.castShadow = true;
        // container.add(spotLight);
        var directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
        directionalLight.castShadow = true;
        directionalLight.position.set(0, 10, 10);
        scene.add(directionalLight);

        var renderAnimation = function() {
            var delta = clock.getDelta();
            if (analyser) {
                //get spectrum data from the analyser
                var array = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(array);
                //update the height of each meter
                var step = Math.round(array.length / METERNUM); //sample limited data from the total array
                for (var i = 0; i < METERNUM; i++) {
                    var value = array[i * step] / 10;
                    value = value < 1 ? 1 : value; //NOTE: if the scale value is less than 1 there will be warnings in the console! so lets make sure its above 1
                    var meter = container.getObjectByName('cube' + i, true),
                        cap = container.getObjectByName('cap' + i, true);
                    meter.scale.y = value;
                    //meter.scale.set(1, value < 1 ? 1 : value, 1);//another way to scale
                    meter.geometry.computeBoundingBox();
                    height = (meter.geometry.boundingBox.max.y - meter.geometry.boundingBox.min.y) * value;
                    if (height / 2 > cap.position.y-.1) {
                        cap.position.y = (height / 2-0.5)>0?(height / 2-0.5):0.5;
                    } else {
                        cap.position.y = Math.max(cap.position.y-.2, 0);
                    };
                }
            };
        };
        this.render = renderAnimation;
    }
}



window.onload = init;

var list = new Array(); //array containing list of music sources
var visualizers = new Array(); //array containing list of music sources
var playListBuffer = new Array(); //array to put in all decoded audio
var playList = new Array();
var context = new AudioContext();


var positions = [[3, 0],
                 [0, 3],
                 [-3, 0],
                 [0, -3]]
var rotations = [0, 90, 180, 270]
function init(){
    list = ["../../Datasets/lucas_music/Drums/output.mp3",
            "../../Datasets/lucas_music/FX/output.mp3",
            "../../Datasets/lucas_music/Melodic/output.mp3",
            "../../Datasets/lucas_music/Vocals/output.mp3"]; //list of files to play at once
    load(list);
}
var i = 0;
function load(url){
    for (var i=0; i<list.length; i++){ //load in every url
        var request = new XMLHttpRequest();
        request.open('GET', list[i], true);
        request.responseType = 'arraybuffer';

        request.onload = function () { //Async method
                console.log(this.response);

                context.decodeAudioData(this.response, function(buffer) {    //Async method
                    if (!buffer) {
                        alert('error decoding file data: ');
                        return;
                    }

                    playListBuffer.push(buffer);                                //Decode audio and put inside playListBuffer
                    if (list.length==playListBuffer.length){
                        console.log(playListBuffer);                            //When All files have been decoded show an Array in console
                        prepare();
                    }
            audioBufferSouceNode = context.createBufferSource(),
            analyser = context.createAnalyser();
            analyser.fftSize = 32768;
            //connect the source to the analyser
            audioBufferSouceNode.connect(analyser);
            //connect the analyser to the destination(the speaker), or we won't hear the sound
            analyser.connect(context.destination);
            //then assign the buffer to the buffer source node
            audioBufferSouceNode.buffer = buffer;
            //stop the previous sound if any
            if (this.source) {
                if (this.status != 0) {
                    this.forceStop = true;
                    this.source.stop(0);
                };
            }
            this.source = audioBufferSouceNode;
            audioBufferSouceNode.start(0);
            this.status = 1;
            this.processing = false;
            // this.infoContainer.textContent = 'playing ' + this.fileName;
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
            };
            var visualizer = new Visualizer(null);
            // visualizer.loadDefaultAndPlay(visualizer.url);
            console.log(window.i);
            viz_animate = visualizer._drawVisualizer(visualizer.scene, visualizer.render, visualizer.camera, analyser, window.positions[window.i][0], 0, window.positions[window.i][1], window.rotations[window.i]);
            window.i += 1;
            visualizers.push(visualizer)


             },  function(e) { console.log('Error decoding audio file', e)});
        };
        request.onerror = function() {
            alert('BufferLoader: XHR error');
        }

        request.send();
    }

}

function prepare(){
    for (var i=0; i<playListBuffer.length; i++){ 
        var source = context.createBufferSource();              // creates a sound source
        console.log(playListBuffer[i]);
        source.buffer = playListBuffer[i];                      // tell the source which sound to play
        source.connect(context.destination);                    // connect the source to the context's destination (the speakers)
        playList.push(source);
    }
    playAll();
}

function playAll(){
    for (var i=0; i<playList.length; i++){ 
        playList[i].start();
        // playList[i].noteOn(0); 
    }
}

function animate() {
    for (var i=0; i<visualizers.length; i++){ 
        visualizers[i].render();
    }
    requestAnimationFrame( animate );    
}
envizVR.animate();
animate();