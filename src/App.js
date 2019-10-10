import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import TrackballControls from 'three-trackballcontrols';
import {Expo, TimelineMax} from "gsap/TweenMax";

function App() {
    var perspectiveCamera, orthographicCamera, controls, scene, renderer, stats;
    var params = {
        orthographicCamera: false
    };
    var frustumSize = 400;

    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();

    const objs = [];
    let sauser;
    let earth;
    let Rick;

    const MAP_NAMES = [
        'map',
        'aoMap',
        'emissiveMap',
        'glossinessMap',
        'metalnessMap',
        'normalMap',
        'roughnessMap',
        'specularMap',
      ];

    init();
    animate();



    function init() {
        var aspect = window.innerWidth / window.innerHeight;
        perspectiveCamera = new THREE.PerspectiveCamera( 60, aspect, 1, 1000 );
        perspectiveCamera.position.z = 500;
        orthographicCamera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 1, 1000 );
        orthographicCamera.position.z = 500;
        // world
        scene = new THREE.Scene();
        // scene.background = new THREE.Color( 0xcccccc );
        // scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );
        var geometry = new THREE.CylinderBufferGeometry( 0, 10, 30, 4, 1 );
        var material = new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } );
        for ( var i = 0; i < 20; i ++ ) {
            var mesh = new THREE.Mesh( geometry, material );
            mesh.position.x = ( Math.random() - 0.5 ) * 1000;
            mesh.position.y = ( Math.random() - 0.5 ) * 1000;
            mesh.position.z = ( Math.random() - 0.5 ) * 1000;
            mesh.updateMatrix();
            mesh.matrixAutoUpdate = false;
            scene.add( mesh );
        }
        // lights

        const RickWalkLoader = new FBXLoader();
        RickWalkLoader.load('/drunk_idle/rm.fbx', model => {
            // model is a THREE.Group (THREE.Object3D)                              
            const mixer = new THREE.AnimationMixer(model);
            // animations is a list of THREE.AnimationClip                          
            mixer.clipAction(model.animations[0]).play();
            // model.scale = THREE.Vector3(.1, .1, .1);
            model.scale.set(.01, .01, .01)
            // console.log(model.)

            model.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    // console.log(child.material)
                    // child.material.envMap = envMap;

                    child.material.map = '/drunk_idle/rm_rick.png'
                    child.material.needsUpdate = true;
                }
            })
            
            scene.add(model);

            Rick = model;
            objs.push({model, mixer});
        }, undefined, function ( error ) {

            console.error( error );
        
        });


        // const objs = [];
        const sauserLoader = new GLTFLoader();

        var dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath( '/examples/js/libs/draco' );
        sauserLoader.setDRACOLoader( dracoLoader );

        sauserLoader.load('/sauser/scene.gltf', gltf => {
            // model is a THREE.Group (THREE.Object3D)                              
            const mixer = new THREE.AnimationMixer(gltf.scene);
            for (const anim of gltf.animations) {
                mixer.clipAction(anim).play();
            }
            gltf.scene.scale.set(1, 1, 1);
            gltf.scene.rotation.copy(new THREE.Euler(0, -3 * Math.PI / 4, -3 * Math.PI / 4));
            gltf.scene.position.set(0, 0, 40);
            // var object = gltf.scene;
            sauser = gltf.scene;

            sauser.addEventListener('mousemove', onMouseMove);

            // const root = gltf.scene;        

            // const box = new THREE.Box3().setFromObject(root);
        
            // const boxSize = box.getSize(new THREE.Vector3()).length();
            // const boxCenter = box.getCenter(new THREE.Vector3());
        
            // // set the camera to frame the box
            // frameArea(boxSize * 1, boxSize, boxCenter, perspectiveCamera);
        
            // // update the Trackball controls to handle the new size
            // controls.maxDistance = boxSize * 10;
            // controls.target.copy(boxCenter);
            // controls.update();

            scene.add(gltf.scene);
        },
        	// called when loading has errors
        function ( error ) {

            console.log( error );

        }
        );

        // const objs = [];
        const earthLoader = new GLTFLoader();
        earthLoader.setDRACOLoader( dracoLoader );

        earthLoader.load('/earth/scene.gltf', gltf => {
            // model is a THREE.Group (THREE.Object3D)                              
            const mixer = new THREE.AnimationMixer(gltf.scene);
            for (const anim of gltf.animations) {
                mixer.clipAction(anim).play();
            }
            gltf.scene.scale.set(.01, .01, .01);
            // gltf.scene.rotation.copy(new THREE.Euler(0, -3 * Math.PI / 4, -3 * Math.PI / 4));
            gltf.scene.position.set(0, 0, 0);
            // var object = gltf.scene;
            earth = gltf.scene;

            // sauser.addEventListener('mousemove', onMouseMove);

            // const root = gltf.scene;        

            // const box = new THREE.Box3().setFromObject(root);
        
            // const boxSize = box.getSize(new THREE.Vector3()).length();
            // const boxCenter = box.getCenter(new THREE.Vector3());
        
            // // set the camera to frame the box
            // frameArea(boxSize * 1, boxSize, boxCenter, perspectiveCamera);
        
            // // update the Trackball controls to handle the new size
            // controls.maxDistance = boxSize * 10;
            // controls.target.copy(boxCenter);
            // controls.update();

            scene.add(gltf.scene);
        },
            // called when loading has errors
        function ( error ) {

            console.log( error );

        }
        );

        var light1 = new THREE.DirectionalLight( 0xffffff );
        light1.position.set( 1, 1, 1 );
        scene.add( light1 );
        var light2 = new THREE.DirectionalLight( 0x002288 );
        light2.position.set( - 1, - 1, - 1 );
        scene.add( light2);
        var light3 = new THREE.AmbientLight( 0x222222 );
        scene.add( light3 );
        // renderer
        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( renderer.domElement );
        stats = new Stats();
        document.body.appendChild( stats.dom );
        //
        var gui = new GUI();
        gui.add( params, 'orthographicCamera' ).name( 'use orthographic' ).onChange( function ( value ) {
            controls.dispose();
            createControls( value ? orthographicCamera : perspectiveCamera );
            render();
        } );
        //

        let starGeo = new THREE.Geometry();
        for (let i=0; i<6000; i++) {
            let star = new THREE.Vector3(
            Math.random() * 600 - 300,
            Math.random() * 600 - 300,
            Math.random() * 600 - 300
          );
          starGeo.vertices.push(star);
        }

        let sprite = new THREE.TextureLoader().load( '/star.png' );
        let starMaterial = new THREE.PointsMaterial({
            color: 0xaaaaaa,
            size: 0.7,
            map: sprite
        });

        let stars = new THREE.Points(starGeo,starMaterial);
        scene.add(stars);

        

        window.addEventListener( 'resize', onWindowResize, false );
        createControls( perspectiveCamera );
        render();
    }

    function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
        const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
        const halfFovY = THREE.Math.degToRad(camera.fov * .5);
        const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
        // compute a unit vector that points in the direction the camera is now
        // in the xz plane from the center of the box
        const direction = (new THREE.Vector3())
            .subVectors(camera.position, boxCenter)
            .multiply(new THREE.Vector3(1, 0, 1))
            .normalize();
    
        // move the camera to a position distance units way from the center
        // in whatever direction the camera was from the center already
        camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));
    
        // pick some near and far values for the frustum that
        // will contain the box.
        camera.near = boxSize / 100;
        camera.far = boxSize * 100;
    
        camera.updateProjectionMatrix();
    
        // point the camera to look at the center of the box
        camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
      }

    function createControls( camera ) {
        controls = new TrackballControls( camera, renderer.domElement );
        controls.rotateSpeed = 1.0;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 0.8;
        controls.staticMoving = true;
        controls.dynamicDampingFactor = 0.3;
        controls.keys = [ 65, 83, 68 ];
        controls.addEventListener( 'change', render );
    }

    function onWindowResize() {
        var aspect = window.innerWidth / window.innerHeight;
        perspectiveCamera.aspect = aspect;
        perspectiveCamera.updateProjectionMatrix();
        orthographicCamera.left = - frustumSize * aspect / 2;
        orthographicCamera.right = frustumSize * aspect / 2;
        orthographicCamera.top = frustumSize / 2;
        orthographicCamera.bottom = - frustumSize / 2;
        orthographicCamera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
        controls.handleResize();
        render();
    }

    const clock = new THREE.Clock();
    function animate() {
        var camera = ( params.orthographicCamera ) ? orthographicCamera : perspectiveCamera;
        objs.forEach(({mixer}) => {mixer.update(clock.getDelta())});
        if (earth) {
            earth.rotation.x += .001;
            earth.rotation.y += .001;
        }
        renderer.render(scene, camera);
        requestAnimationFrame( animate );
        controls.update();
        stats.update();
    }

    function render() {
        var camera = ( params.orthographicCamera ) ? orthographicCamera : perspectiveCamera;
        console.log(sauser)

        renderer.render( scene, camera );
    }

    function onMouseMove(event) {
        event.preventDefault();
  
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  
        raycaster.setFromCamera(mouse, perspectiveCamera);
  
        // var intersects = raycaster.intersectObjects(sauser, true);
        if (sauser) {
            this.tl = new TimelineMax();
            this.tl.to(sauser.position, 1, {x: 100, ease: Expo.easeOut})
        }

        // for (var i = 0; i < intersects.length; i++) {
        //     this.tl = new TimelineMax();
        //     this.tl.to(sauser.position, 1, {x: 100, ease: Expo.easeOut})
            // this.tl.to(intersects[i].object.scale, .5, {x: .5, ease: Expo.easeOut})
            // this.tl.to(intersects[i].object.position, .5, {x: 2, ease: Expo.easeOut})
            // this.tl.to(intersects[i].object.rotation, .5, {y: Math.PI*.5, ease: Expo.easeOut}, "=-1.5")
        // }
    }

    return null

}

export default App;