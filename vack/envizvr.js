class EnvizVR {
    /**
     *
     * @param container HTMLElement
     * @param body HTMLElement, usually document.body
     */
    constructor(container, body) {
        this.renders = [];
        const scene = this.scene = new THREE.Scene();
        scene.background = new THREE.Color(0x222222);

        const camera = this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 50);


        // var geometry = new THREE.BoxBufferGeometry(0.5, 0.8, 0.5);
        // var material = new THREE.MeshStandardMaterial({
        //     color: 0x444444,
        //     roughness: 1.0,
        //     metalness: 0.0
        // });
        // var table = new THREE.Mesh(geometry, material);
        // table.position.y = 0.35;
        // table.position.z = 0.85;
        // table.castShadow = true;
        // table.receiveShadow = true;
        // // scene.add( table );

        /*
        var table = new THREE.Mesh( geometry, material );
        table.position.y = 0.35;
        table.position.z = -0.85;
        table.castShadow = true;
        table.receiveShadow = true;
        scene.add( table );
        */

        // var geometry = new THREE.PlaneBufferGeometry(4, 4);
        // var material = new THREE.MeshStandardMaterial({
        //     color: 0x222222,
        //     roughness: 1.0,
        //     metalness: 0.0
        // });
        // var floor = new THREE.Mesh(geometry, material);
        // floor.rotation.x = -Math.PI / 2;
        // floor.receiveShadow = true;
        // // scene.add( floor );
        // //
        // // var floor = new THREE.Mesh( geometry, material );
        // // // floor.rotation.x = - Math.PI / 2;
        // // floor.receiveShadow = true;
        // // scene.add( floor );
        // //
        // // var floor = new THREE.Mesh( geometry, material );
        // // floor.rotation.y = - Math.PI / 2;
        // // floor.receiveShadow = true;
        // // scene.add( floor );

        // const plotArea = this._generatePlotArea();
        // scene.add(plotArea);


        scene.add(new THREE.HemisphereLight(0x888877, 0x777788));

        var light = new THREE.DirectionalLight(0xffffff);
        light.position.set(0, 6, 0);
        light.castShadow = true;
        light.shadow.camera.top = 2;
        light.shadow.camera.bottom = -2;
        light.shadow.camera.right = 2;
        light.shadow.camera.left = -2;
        light.shadow.mapSize.set(4096, 4096);
        scene.add(light);

        const renderer = this.renderer = new THREE.WebGLRenderer({antialias: true});

        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.gammaInput = true;
        renderer.gammaOutput = true;
        renderer.shadowMap.enabled = true;
        renderer.vr.enabled = true;
        container.appendChild(renderer.domElement);


        this.controllers = new EnvizControllers(renderer, scene);

        body.appendChild(WEBVR.createButton(renderer));

        this.stats = new Stats();
        this.stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
        body.appendChild( this.stats.dom );

        this._initGeometry();


        window.addEventListener('resize', this.onWindowResize.bind(this), false);
    }

    _initGeometry() {
        var geometry = new THREE.BufferGeometry();

        var positions = new THREE.BufferAttribute(new Float32Array(1000000 * 3), 3);
        positions.dynamic = true;
        geometry.addAttribute('position', positions);

        var normals = new THREE.BufferAttribute(new Float32Array(1000000 * 3), 3);
        normals.dynamic = true;
        geometry.addAttribute('normal', normals);

        var colors = new THREE.BufferAttribute(new Float32Array(1000000 * 3), 3);
        colors.dynamic = true;
        geometry.addAttribute('color', colors);

        geometry.drawRange.count = 0;

        //

        /*
        var path = "textures/cube/SwedishRoyalCastle/";
        var format = '.jpg';
        var urls = [
            path + 'px' + format, path + 'nx' + format,
            path + 'py' + format, path + 'ny' + format,
            path + 'pz' + format, path + 'nz' + format
        ];

        var reflectionCube = new THREE.CubeTextureLoader().load( urls );
        */

        var material = new THREE.MeshStandardMaterial({
            roughness: 0.9,
            metalness: 0.0,
            // envMap: reflectionCube,
            vertexColors: THREE.VertexColors,
            side: THREE.DoubleSide
        });

        const line = this.line = new THREE.Mesh(geometry, material);
        line.frustumCulled = false;
        line.castShadow = true;
        line.receiveShadow = true;
        this.scene.add(line);
    }

    animate() {
        this.renderer.setAnimationLoop(() => this.render());
    }


    render() {
        this.stats.begin();

        var count = this.line.geometry.drawRange.count;

        this.controllers.render(this.line);

        // camera.fov = Math.sin(Date.now() / 500) * 20 + 40;

        this.updateGeometry(count, this.line.geometry.drawRange.count);

        // console.log(this.renders);
        for (const r of this.renders) {
            r.render();
        }

        // for (var i = 0; i < 5; i++) {
        //     var x = d3.select(chart3d).selectAll()[0][i]
        //         .material
        //         .color;
        //     if (x.goingUp) {
        //         if (x.r > 1) x.goingUp = 0;
        //         x.r += .005;
        //     } else {
        //         if (x.r < 0) x.goingUp = 1;
        //         x.r -= .005;
        //     }
        // }
        // d3.select(chart3d).selectAll()
        //     .attr("scale.x", function(d, i) {
        //         console.log(d);
        //         // return d.scale.x += 0.01;
        //         return d;
        //     });
        // requestAnimationFrame( animate );
        // chart3d.rotation.y += 0.01;

        this.renderer.render(this.scene, this.camera);

        this.stats.end();
    }

    onWindowResize() {

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);

    }


    updateGeometry(start, end) {

        if (start === end) return;

        var offset = start * 3;
        var count = (end - start) * 3;

        var geometry = this.line.geometry;
        var attributes = geometry.attributes;

        attributes.position.updateRange.offset = offset;
        attributes.position.updateRange.count = count;
        attributes.position.needsUpdate = true;

        attributes.normal.updateRange.offset = offset;
        attributes.normal.updateRange.count = count;
        attributes.normal.needsUpdate = true;

        attributes.color.updateRange.offset = offset;
        attributes.color.updateRange.count = count;
        attributes.color.needsUpdate = true;

    }


    // /**
    //  *
    //  * @param points [number, number, number][]
    //  */
    // drawScatterSphere(points) {
    //     const plot = this._generatePlotArea();
    //
    //     const ptShape = new THREE.SphereGeometry(0.02);
    //     const ptMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});
    //
    //     for (let [x, y, z] of points) {
    //         if (x == null || y == null || z == null) {
    //             continue;
    //         }
    //
    //         let mesh = new THREE.Mesh(ptShape, ptMaterial);
    //         mesh.position.x = x;
    //         mesh.position.y = y;
    //         mesh.position.z = z;
    //         plot.add(mesh);
    //         // ptShape.vertices.push(new THREE.Vector3(x, y, z));
    //
    //         console.log(mesh);
    //     }
    //
    //     this.scene.add(plot);
    // }
}

EnvizVR.vector1 = new THREE.Vector3();
EnvizVR.vector2 = new THREE.Vector3();
EnvizVR.vector3 = new THREE.Vector3();
EnvizVR.vector4 = new THREE.Vector3();

EnvizVR.up = new THREE.Vector3(0, 1, 0);

function generateText(t, scale, x, y, z) {
    let text = new ThreeText2D.SpriteText2D(t, {
        align: ThreeText2D.textAlign.left,
        font: '24px Arial',
        fillStyle: '#ffffff',
        antialias: true
    });
    text.position.x = x;
    text.position.y = y;
    text.position.z = z;
    text.scale.x = text.scale.y = text.scale.z = 0.001 / 12 * scale;
    return text;
}

class ScatterGraph {
    static _generatePlotArea(xL, yL, zL, labs, scales) {
        const plotArea = new THREE.Group();

        let gridHelperX = new THREE.GridHelper(xL, 10, 0x111111, 0x111111);
        let gridHelperY = new THREE.GridHelper(yL, 10, 0x111111, 0x111111);
        let gridHelperZ = new THREE.GridHelper(zL, 10, 0x111111, 0x111111);
        gridHelperZ.rotation.x = Math.PI / 2;
        gridHelperY.rotation.z = Math.PI / 2;

        plotArea.add(gridHelperX);
        plotArea.add(gridHelperY);
        plotArea.add(gridHelperZ);

        const xAxisMaterial = new THREE.MeshStandardMaterial({color: 0xff0000});
        const yAxisMaterial = new THREE.MeshStandardMaterial({color: 0x00ff00});
        const zAxisMaterial = new THREE.MeshStandardMaterial({color: 0x0000ff});

        // const axisGeom = new THREE.CylinderGeometry(0.01, 0.01, xL, 4, 1, true);

        const xAxis = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, xL, 4, 1, true), xAxisMaterial);
        xAxis.rotation.z = Math.PI / 2;
        const yAxis = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, yL, 4, 1, true), yAxisMaterial);
        const zAxis = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, zL, 4, 1, true), zAxisMaterial);
        zAxis.rotation.x = Math.PI / 2;

        plotArea.add(xAxis);
        plotArea.add(yAxis);
        plotArea.add(zAxis);

        plotArea.add(generateText("" + .5 * scales[0], 12, .5 * xL, 0, 0));
        plotArea.add(generateText("-" + .5 * scales[0], 12, -.5 * xL, 0, 0));

        plotArea.add(generateText("" + .5 * scales[1], 12, 0, -.5 * yL, 0));
        plotArea.add(generateText("-" + .5 * scales[1], 12, 0, -.5 * yL, 0));

        plotArea.add(generateText("" + .5 * scales[2], 12, 0, 0, .5 * zL));
        plotArea.add(generateText("-" + .5 * scales[2], 12, 0, 0, -.5 * zL));

        const axesText = `Red: ${labs[0]}, Green: ${labs[1]}, Blue: ${labs[2]}`;
        plotArea.add(generateText(axesText, 18, 0, 0.6 * yL, 0));

        return plotArea;
    }

    static scale3DDataToMaxAbsVal(data, maxAbs) {
        const scalingFactors = [];
        for (let c = 0; c < 3; c++) {
            let maxDataAbs = 0;
            for (let i = 0; i < data.length; i++) {
                if (Math.abs(data[i][c]) > maxDataAbs) {
                    maxDataAbs = Math.abs(data[i][c]);
                }
            }

            for (let i = 0; i < data.length; i++) {
                data[i][c] *= maxAbs / maxDataAbs;
            }

            scalingFactors[c] = maxDataAbs / maxAbs;
        }

        return scalingFactors;
    }

    /**
     *
     * @param points [number, number, number][]
     **/
    constructor(points, xL, yL, zL, labs, visible) {
        this.xL = xL;
        this.yL = yL;
        this.zL = zL;
        this.visible = visible;

        this.scalingFactors = ScatterGraph.scale3DDataToMaxAbsVal(points, 0.5);
        const plot = ScatterGraph._generatePlotArea(xL, yL, zL, labs, this.scalingFactors);

        const magicBoxMaterial = new THREE.MeshStandardMaterial({color: 0xffffff, transparent: true, opacity: 0.4});
        const magicBoxGeom = new THREE.BoxGeometry(xL, yL, zL);
        const magicBox = new THREE.Mesh(magicBoxGeom, magicBoxMaterial);
        plot.add(magicBox);
        console.log(magicBox);
        this.magicBox = magicBox;

        const ptShape = new THREE.SphereGeometry(0.02);

        this.points = [];
        for (let [x, y, z] of points) {
            if (x == null || y == null || z == null) {
                continue;
            }

            const ptMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});
            let mesh = new THREE.Mesh(ptShape, ptMaterial);
            mesh.position.x = x;
            mesh.position.y = y;
            mesh.position.z = z;
            plot.add(mesh);
            this.points.push(mesh);

            // console.log(mesh);
        }

        // plot.add(plot);
        this.plot = plot;
    }

    isInBox(point) {
        const mbVerts = this.magicBox.geometry.vertices;
        point.x = point[0] / this.scalingFactors[0];
        point.y = point[1] / this.scalingFactors[1];
        point.z = point[2] / this.scalingFactors[2];
        // if (Math.random() < 0.01)
        //     console.log(mbVerts, point);

        let s;
        let b;

        s = Math.min.apply(null, mbVerts.map(v => v.x));
        b = Math.max.apply(null, mbVerts.map(v => v.x));
        if (point.x < s || b < point.x)
            return false;

        s = Math.min.apply(null, mbVerts.map(v => v.y));
        b = Math.max.apply(null, mbVerts.map(v => v.y));
        if (point.y < s || b < point.y)
            return false;

        s = Math.min.apply(null, mbVerts.map(v => v.z));
        b = Math.max.apply(null, mbVerts.map(v => v.z));
        if (point.z < s || b < point.z)
            return false;

        return true;
    }

    getPlot() {
        return this.plot;
    }

    updateHand(handCoords) {
        // console.log("PRESS");
        //Call once for each set of handCoords. HandCoords are presumed to be absolute, but will be modified buy this function
        const local = this.plot.worldToLocal(handCoords);

        const mbVerts = this.magicBox.geometry.vertices;
        const v = mbVerts.sort((a, b) => (a.distanceTo(handCoords) - b.distanceTo(handCoords)))[0];
        if (v.distanceTo(handCoords) < 0.02) {
            // console.log("nearby to a point");
            const vx = v.x;
            const vy = v.y;
            const vz = v.z;
            for (const x of mbVerts) {
                const threshold = 0.001;
                if (Math.abs(vx - x.x) < threshold) {
                    v.x = x.x = handCoords.x;
                }
                if (Math.abs(vy - x.y) < threshold) {
                    v.y = x.y = handCoords.y;
                }
                if (Math.abs(vz - x.z) < threshold) {
                    v.z = x.z = handCoords.z;
                }
            }

            this.magicBox.geometry.verticesNeedUpdate = true;

            // console.log(mbVerts)
        }

        // for (let c = 0; c < 3; c++) {
        //     for (let mm = 0; mm < 2; mm++) {
        //         if (Math.abs(boxCoords[c][mm] - h1[c]) < .05) {//This is mindistance to grab
        //             boxCoords[c][mm] = h1[c];
        //         }
        //     }
        // }
    }

    render() {
        if (!this.left || !this.right) {
            // TODO don't poll for the gamepad
            const [left, right] = navigator.getGamepads(); // TODO: handle more than 2 gamepads
            this.left = left;
            this.right = right;
        }

        if (this.left && this.left.buttons[3].pressed) {
            const vec = new THREE.Vector3();
            envizVR.controllers.getControllerPosition(1, vec);
            this.updateHand(vec);
        }

        if (this.right && this.right.buttons[3].pressed) {
            const vec = new THREE.Vector3();
            envizVR.controllers.getControllerPosition(2, vec);
            this.updateHand(vec);
        }

        this.visible.forEach((v, i) => {
            const pt = this.points[i];
            pt.material.color.r = v ? 0.3 : 1.0;
            pt.material.color.g = v ? 1.0 : 0.3;
            pt.material.color.b = v ? 0.3 : 0.3;
        })
    }
}

class MagicScatterArray {
    /**
     *
     * @param nddata n-dimensional data [number, number, ...][]
     * @param d3slices 3d slices of the data to take [number, number, number][]
     */
    constructor(nddata, d3slices, labs) {
        this.nddata = nddata;
        this.d3slices = d3slices;
        this.visible = Array(this.nddata.length).fill(true);

        const d3datas = d3slices.map(slice => nddata.map(l => [l[slice[0]], l[slice[1]], l[slice[2]]]));
        const d3labs = d3slices.map(slice => {
            return [labs[slice[0]], labs[slice[1]], labs[slice[2]]];
        });

        this.graphs = d3datas.map((data, i) => {
            const ct = new ScatterGraph(data, 1, 1, 1, d3labs[i], this.visible);
            let plot = ct.getPlot();
            plot.position.y = 1;
            // envizVR.scene.add(plot);
            return ct;
        });

        this.renders = [];
        this.group = new THREE.Group();
        this.graphs.forEach((gra, i) => {
            const gr = gra.getPlot();
            this.renders.push(gra);
            gr.position.z = i * 2 - 2;
            this.group.add(gr);
        });
    }

    getPlots() {
        return this.group;
    }

    render() {
        // console.log("magic scat render");
        this.renders.forEach(r => r.render());

        for (let i = 0; i < this.nddata.length; i++) {
            let l = this.nddata[i];
            let vis = true;
            for (let j = 0; j < this.graphs.length; j++) {
                const slice = this.d3slices[j];
                const point = [l[slice[0]], l[slice[1]], l[slice[2]]];
                if (!this.graphs[j].isInBox(point)) {
                    vis = false;
                    break;
                }
            }
            this.visible[i] = vis;
        }

        // console.log(this.visible);
    }
}

class EnvizControllers {
    /**
     *
     * @param renderer
     * @param scene
     */
    constructor(renderer, scene) {
        this.renderer = renderer;
        this.scene = scene;

        // controllers

        function onSelectStart() {

            this.userData.isSelecting = true;

        }

        function onSelectEnd() {

            this.userData.isSelecting = false;

        }

        const controller1 = this.controller1 = this.renderer.vr.getController(0);
        controller1.addEventListener('selectstart', onSelectStart);
        controller1.addEventListener('selectend', onSelectEnd);
        controller1.userData.points = [new THREE.Vector3(), new THREE.Vector3()];
        controller1.userData.matrices = [new THREE.Matrix4(), new THREE.Matrix4()];
        this.scene.add(controller1);

        const controller2 = this.controller2 = this.renderer.vr.getController(1);
        controller2.addEventListener('selectstart', onSelectStart);
        controller2.addEventListener('selectend', onSelectEnd);
        controller2.userData.points = [new THREE.Vector3(), new THREE.Vector3()];
        controller2.userData.matrices = [new THREE.Matrix4(), new THREE.Matrix4()];
        this.scene.add(controller2);

        let loader;

        // left
        loader = new THREE.OBJLoader();
        loader.setPath('/vack/models/oculus_cv1_controller_left/');
        loader.load('oculus_cv1_controller_left.obj', function (object) {

            var loader = new THREE.TextureLoader();
            loader.setPath('/vack/models/oculus_cv1_controller_left/');

            var controller = object.children[0];
            controller.material.map = loader.load('external_controller01_col.png');
            controller.material.specularMap = loader.load('external_controller01_spec.png');
            controller.castShadow = true;
            controller.receiveShadow = true;

            // var pivot = new THREE.Group();
            // var pivot = new THREE.Mesh( new THREE.BoxBufferGeometry( 0.01, 0.01, 0.01 ) );
            var pivot = new THREE.Mesh(new THREE.IcosahedronBufferGeometry(0.01, 2));
            pivot.name = 'pivot';
            // pivot.position.y = -0.016;
            // pivot.position.z = -0.043;
            // pivot.rotation.x = Math.PI / 5.5;
            controller.add(pivot);

            controller1.add(controller.clone());

            // pivot.material = pivot.material.clone();
            // controller2.add(controller.clone());

        });

        // right
        loader = new THREE.OBJLoader();
        loader.setPath('/vack/models/oculus_cv1_controller_right/');
        loader.load('oculus_cv1_controller_right.obj', function (object) {

            var loader = new THREE.TextureLoader();
            loader.setPath('/vack/models/oculus_cv1_controller_right/');

            var controller = object.children[0];
            controller.material.map = loader.load('external_controller01_col.png');
            controller.material.specularMap = loader.load('external_controller01_spec.png');
            controller.castShadow = true;
            controller.receiveShadow = true;

            // var pivot = new THREE.Group();
            // var pivot = new THREE.Mesh( new THREE.BoxBufferGeometry( 0.01, 0.01, 0.01 ) );
            var pivot = new THREE.Mesh(new THREE.IcosahedronBufferGeometry(0.01, 2));
            pivot.name = 'pivot';
            // pivot.position.y = -0.016;
            // pivot.position.z = -0.043;
            // pivot.rotation.x = Math.PI / 5.5;
            controller.add(pivot);

            // controller1.add(controller.clone());

            pivot.material = pivot.material.clone();
            controller2.add(controller.clone());

        });


        // Shapes
        this.shapes = {};
        this.shapes['tube'] = this._getTubeShapes(1.0);
    }

    render(line) {
        this.line = line;

        this.handleController(this.controller1);
        this.handleController(this.controller2);
    }

    handleController(controller) {

        var pivot = controller.getObjectByName('pivot');

        if (pivot) {

            var matrix = pivot.matrixWorld;

            var point1 = controller.userData.points[0];
            var point2 = controller.userData.points[1];

            var matrix1 = controller.userData.matrices[0];
            var matrix2 = controller.userData.matrices[1];

            point1.setFromMatrixPosition(matrix);
            matrix1.lookAt(point2, point1, EnvizVR.up);

            // console.log(controller.userData);
            if (controller.userData.isSelecting === true) {

                this.stroke(controller, point1, point2, matrix1, matrix2);

            }

            point2.copy(point1);
            matrix2.copy(matrix1);

        }

    }

    stroke(controller, point1, point2, matrix1, matrix2) {
        // console.log(controller, point1, point2, matrix1, matrix2);
        let vector1 = EnvizVR.vector1;
        let vector2 = EnvizVR.vector2;
        let vector3 = EnvizVR.vector3;
        let vector4 = EnvizVR.vector4;

        var color = new THREE.Color(0xFFDC00);
        var size = 1;

        var shapes = this._getTubeShapes(size);

        var geometry = this.line.geometry;
        var attributes = geometry.attributes;
        var count = geometry.drawRange.count;

        var positions = attributes.position.array;
        var normals = attributes.normal.array;
        var colors = attributes.color.array;

        for (var j = 0, jl = shapes.length; j < jl; j++) {

            var vertex1 = shapes[j];
            var vertex2 = shapes[(j + 1) % jl];

            // positions

            vector1.copy(vertex1);
            vector1.applyMatrix4(matrix2);
            vector1.add(point2);

            vector2.copy(vertex2);
            vector2.applyMatrix4(matrix2);
            vector2.add(point2);

            vector3.copy(vertex2);
            vector3.applyMatrix4(matrix1);
            vector3.add(point1);

            vector4.copy(vertex1);
            vector4.applyMatrix4(matrix1);
            vector4.add(point1);

            vector1.toArray(positions, (count + 0) * 3);
            vector2.toArray(positions, (count + 1) * 3);
            vector4.toArray(positions, (count + 2) * 3);

            vector2.toArray(positions, (count + 3) * 3);
            vector3.toArray(positions, (count + 4) * 3);
            vector4.toArray(positions, (count + 5) * 3);

            // normals

            vector1.copy(vertex1);
            vector1.applyMatrix4(matrix2);
            vector1.normalize();

            vector2.copy(vertex2);
            vector2.applyMatrix4(matrix2);
            vector2.normalize();

            vector3.copy(vertex2);
            vector3.applyMatrix4(matrix1);
            vector3.normalize();

            vector4.copy(vertex1);
            vector4.applyMatrix4(matrix1);
            vector4.normalize();

            vector1.toArray(normals, (count + 0) * 3);
            vector2.toArray(normals, (count + 1) * 3);
            vector4.toArray(normals, (count + 2) * 3);

            vector2.toArray(normals, (count + 3) * 3);
            vector3.toArray(normals, (count + 4) * 3);
            vector4.toArray(normals, (count + 5) * 3);

            // colors

            color.toArray(colors, (count + 0) * 3);
            color.toArray(colors, (count + 1) * 3);
            color.toArray(colors, (count + 2) * 3);

            color.toArray(colors, (count + 3) * 3);
            color.toArray(colors, (count + 4) * 3);
            color.toArray(colors, (count + 5) * 3);

            count += 6;

        }

        geometry.drawRange.count = count;

    }

    _getTubeShapes(size) {

        var PI2 = Math.PI * 2;

        var sides = 10;
        var array = [];
        var radius = 0.01 * size;

        for (var i = 0; i < sides; i++) {

            var angle = (i / sides) * PI2;
            array.push(new THREE.Vector3(Math.sin(angle) * radius, Math.cos(angle) * radius, 0));

        }

        return array;

    }

    /**
     * Gets controller's coords
     * @param controllerID 1 or 2, corresponding to left and right controolers
     * @param vec fills this Vector3 with the world position
     */
    getControllerPosition(controllerID, vec) {
        const con = controllerID === 1 ? this.controller1 : this.controller2;

        con.getObjectByName('pivot').getWorldPosition(vec);
    }
}


