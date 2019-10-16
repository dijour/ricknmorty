import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import TrackballControls from 'three-trackballcontrols';
import {Expo, TimelineMax} from "gsap/TweenMax";
import Tone from 'tone';
import React, {useEffect, useState} from 'react';
import THREEx from './threex.domevents.js';

function App() {
    var perspectiveCamera, orthographicCamera, controls, scene, renderer, stats;
    const objs = [];
    var params = {
        orthographicCamera: false
    };
    var frustumSize = 400;

    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();

    // window.addEventListener( 'mousemove', onMouseMove, true );

    let containerEarthModel = new THREE.Object3D()
    containerEarthModel.rotateZ(-23.4 * Math.PI/180)
    containerEarthModel.position.z	= 0

    // tones
    const [frequency, setFrequency] = useState(100)
    const [osc, setOsc] = useState(new Tone.OmniOscillator(100).toMaster())
    const [positions, setPositions] = useState([])
    const [timestamps, setTimestamps] = useState([])

    // 3D objs
    let sauser;
    let gun;
    let rick;
    // const [sauser, setSauser] = useState();
    let earth;
    let earthCloud;
    let plumbusDirection = 1;
    let plumbus;
    let containerEarth = containerEarthModel;
    // const [gun, setGun] = useState();
    // const [rick, setRick] = useState();
    const [randomShit, setRandomShit] = useState();
    const [earthRadius, setEarthRadius] = useState(50);

    useEffect(() => {
        init();
        animate();
        // render();
        // window.addEventListener("mousemove", e => changeSound(e))
        // osc.start()
    }, [])

    let changeSound = (e) => {
        console.log("change sound 1")
        console.log(e.clientX)
        let newOsc = osc;
        newOsc.frequency.value = e.clientX;
        let posArr = positions;
        posArr.push(e.clientX);
        let timeArr = timestamps;
        timeArr.push(Math.floor(Date.now() / 1000))
        setOsc(newOsc)
        setPositions(posArr)
        setTimestamps(timeArr)
      }

    let placeObjectOnPlanet = (object, lat, lon, radius) => {
        var latRad = lat * (Math.PI / 180);
        var lonRad = -lon * (Math.PI / 180);
        object.position.set(
            Math.cos(latRad) * Math.cos(lonRad) * radius,
            Math.sin(latRad) * radius,
            Math.cos(latRad) * Math.sin(lonRad) * radius
        );
        object.rotation.set(0.0, -lonRad, latRad - Math.PI * 0.5);
    } 


    function init() {
        var aspect = window.innerWidth / window.innerHeight;
        perspectiveCamera = new THREE.PerspectiveCamera( 60, aspect, 1, 1000 );
        perspectiveCamera.position.z = 500;
        orthographicCamera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 1, 1000 );
        orthographicCamera.position.z = 500;
        // world
        scene = new THREE.Scene();
        var geometry = new THREE.CylinderBufferGeometry( 0, 10, 30, 4, 1 );
        var material = new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } );
        // for ( var i = 0; i < 20; i ++ ) {
        //     var mesh = new THREE.Mesh( geometry, material );
        //     mesh.position.x = ( Math.random() - 0.5 ) * 1000;
        //     mesh.position.y = ( Math.random() - 0.5 ) * 1000;
        //     mesh.position.z = ( Math.random() - 0.5 ) * 1000;
        //     mesh.updateMatrix();
        //     mesh.matrixAutoUpdate = false;
        //     scene.add( mesh );
        // }

        const objs = [];

        // renderer
        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( renderer.domElement );
        stats = new Stats();
        document.body.appendChild( stats.dom );

        var domEvents = new THREEx.DomEvents(perspectiveCamera, renderer.domElement)

        //
        var gui = new GUI();
        gui.add( params, 'orthographicCamera' ).name( 'use orthographic' ).onChange( function ( value ) {
            controls.dispose();
            createControls( value ? orthographicCamera : perspectiveCamera );
            render();
        } );

        createControls( perspectiveCamera );

        scene.add(containerEarth)

        let createEarth	= () => {
            var geometry = new THREE.SphereGeometry(earthRadius, 32, 32)
            var material = new THREE.MeshPhongMaterial({
                map         : THREE.ImageUtils.loadTexture('/earth/earthmap1k.jpg'),
                bumpMap	    : THREE.ImageUtils.loadTexture('/earth/earthbump1k.jpg'),
                bumpScale   : 0.05,
                specularMap : THREE.ImageUtils.loadTexture('/earth/earthspec1k.jpg'),
                specular    : new THREE.Color('grey'),
            })
            // var mesh = new THREE.Mesh(geometry, material)
            let newEarth = new THREE.Mesh(geometry, material)
            newEarth.castShadow = true;
            newEarth.receiveShadow = true;
            newEarth.name = "earth"
            earth = newEarth;
            containerEarth.add(earth)
        }

        let createEarthCloud = function(){
            // create destination canvas
            var canvasResult	= document.createElement('canvas')
            canvasResult.width	= 1024
            canvasResult.height	= 512
            var contextResult	= canvasResult.getContext('2d')		
        
            // load earthcloudmap
            var imageMap = new Image();
            imageMap.addEventListener("load", function() {
                
                // create dataMap ImageData for earthcloudmap
                var canvasMap	= document.createElement('canvas')
                canvasMap.width	= imageMap.width
                canvasMap.height= imageMap.height
                var contextMap	= canvasMap.getContext('2d')
                contextMap.drawImage(imageMap, 0, 0)
                var dataMap	= contextMap.getImageData(0, 0, canvasMap.width, canvasMap.height)
        
                // load earthcloudmaptrans
                var imageTrans	= new Image();
                imageTrans.addEventListener("load", function(){
                    // create dataTrans ImageData for earthcloudmaptrans
                    var canvasTrans		= document.createElement('canvas')
                    canvasTrans.width	= imageTrans.width
                    canvasTrans.height	= imageTrans.height
                    var contextTrans	= canvasTrans.getContext('2d')
                    contextTrans.drawImage(imageTrans, 0, 0)
                    var dataTrans		= contextTrans.getImageData(0, 0, canvasTrans.width, canvasTrans.height)
                    // merge dataMap + dataTrans into dataResult
                    var dataResult		= contextMap.createImageData(canvasMap.width, canvasMap.height)
                    for(var y = 0, offset = 0; y < imageMap.height; y++){
                        for(var x = 0; x < imageMap.width; x++, offset += 4){
                            dataResult.data[offset+0]	= dataMap.data[offset+0]
                            dataResult.data[offset+1]	= dataMap.data[offset+1]
                            dataResult.data[offset+2]	= dataMap.data[offset+2]
                            dataResult.data[offset+3]	= 255 - dataTrans.data[offset+0]
                        }
                    }
                    // update texture with result
                    contextResult.putImageData(dataResult,0,0)	
                    material.map.needsUpdate = true;
                })
                imageTrans.src	= 'earth/earthcloudmaptrans.jpg';
            }, false);
            imageMap.src	= 'earth/earthcloudmap.jpg';
        
            var geometry	= new THREE.SphereGeometry(earthRadius, 32, 32)
            var material	= new THREE.MeshPhongMaterial({
                map		: new THREE.Texture(canvasResult),
                side		: THREE.DoubleSide,
                transparent	: true,
                opacity		: 0.8,
            })
            let newEarthCloud = new THREE.Mesh(geometry, material)
            newEarthCloud.receiveShadow	= true
            newEarthCloud.castShadow	= true
            console.log("Setting dat earth cloud sheeit")
            earthCloud = newEarthCloud;
            containerEarth.add(earthCloud)
            // let newContainerEarth = containerEarth.add(newEarthCloud);
            // setContainerEarth(newContainerEarth)
        }
    

        const RickWalkLoader = new FBXLoader();
        RickWalkLoader.load('/drunk_idle/rm.fbx', model => {
            // model is a THREE.Group (THREE.Object3D)                              
            const mixer = new THREE.AnimationMixer(model);
            mixer.clipAction(model.animations[0]).play();
            model.scale.set(.01, .01, .01)

            model.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    child.material.map = '/drunk_idle/rm_rick.png'
                    child.material.needsUpdate = true;
                }
            })

            let rick = model;
            rick.name = "rick"
            scene.add(rick);
            objs.push({rick, mixer});
        }, undefined, function ( error ) {

            console.error( error );
        
        });

        const randomShitLoader = new GLTFLoader();

        var dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath( '/examples/js/libs/draco' );
        randomShitLoader.setDRACOLoader( dracoLoader );

        randomShitLoader.load('/random_shit/scene.gltf', gltf => {
            // model is a THREE.Group (THREE.Object3D)                              
            const mixer = new THREE.AnimationMixer(gltf.scene);
            for (const anim of gltf.animations) {
                mixer.clipAction(anim).play();
            }
            gltf.scene.scale.set(.3,.3,.3);
            // gltf.scene.rotation.set(new THREE.Vector3( 0, 0, 0))
            gltf.scene.position.set(0, 0, 100);
            // var object = gltf.scene;
            setRandomShit(gltf.scene)

            // scene.add(gltf.scene);
        },
        	// called when loading has errors
            function ( error ) {
                console.log( error );
            }
        );

        const sauserLoader = new GLTFLoader();
        sauserLoader.setDRACOLoader( dracoLoader );


        sauserLoader.load('/sauser/scene.gltf', gltf => {
            // model is a THREE.Group (THREE.Object3D)                              
            const mixer = new THREE.AnimationMixer(gltf.scene);
            for (const anim of gltf.animations) {
                mixer.clipAction(anim).play();
            }
            gltf.scene.scale.set(.3,.3,.3);
            // gltf.scene.rotation.set(new THREE.Vector3( 0, 0, 0))
            gltf.scene.rotation.copy(new THREE.Euler(Math.PI, (-Math.PI/2), (Math.PI / 2)));
            gltf.scene.position.set(0, 0, 100);
            gltf.scene.position.set(0,0,1000)
            sauser = gltf.scene;
            scene.add(sauser)

        },
        	// called when loading has errors
            function ( error ) {
                console.log( error );
            }
        );

        const gunLoader = new GLTFLoader();
        gunLoader.setDRACOLoader(dracoLoader);
        gunLoader.load('/portal_gun/scene.gltf', gltf => {
            const mixer = new THREE.AnimationMixer(gltf.scene);
            for (const anim of gltf.animations) {
                mixer.clipAction(anim).play();
            }
            gltf.scene.scale.set(.3,.3,.3);
            gltf.scene.position.set(0, 0, 100);
            gun = gltf.scene;
            gun.name = "gun"
            containerEarth.add(gun)
        },
        	// called when loading has errors
            function ( error ) {
                console.log( error );
            }
        );

        const plumbusLoader = new GLTFLoader();
        plumbusLoader.setDRACOLoader(dracoLoader);
        plumbusLoader.load('/plumbus/scene.gltf', gltf => {
            const mixer = new THREE.AnimationMixer(gltf.scene);
            for (const anim of gltf.animations) {
                mixer.clipAction(anim).play();
            }
            gltf.scene.scale.set(5,5,5);
            gltf.scene.position.set(90, 20, 0);
            gltf.scene.rotation.set(0, 0, Math.PI/2)
            plumbus = gltf.scene;
            plumbus.name = "plumbus"
            scene.add(plumbus)

            domEvents.addEventListener(plumbus, 'click', function(event){
                console.log('you clicked on the mesh')
                this.tl = new TimelineMax();
                this.tl.to(plumbus.scale, .05, {x: 6, y: 7, z: 6, ease: Expo.easeOut})}
            , false)

            domEvents.addEventListener(plumbus, 'touchstart', function(event){
                console.log('you clicked on the mesh')
                this.tl = new TimelineMax();
                this.tl.to(plumbus.scale, .05, {x: 6, y: 7, z: 6, ease: Expo.easeOut})}
            , false)

            domEvents.addEventListener(scene, 'click', function(event){
                console.log('you stopped clicking on the mesh')
                this.tl = new TimelineMax();
                this.tl.to(plumbus.scale, 1, {x: 5, y: 5, z: 5, ease: Expo.easeOut})}
            , false)

            domEvents.addEventListener(scene, 'touchend', function(event){
                console.log('you stopped clicking on the mesh')
                this.tl = new TimelineMax();
                this.tl.to(plumbus.scale, 1, {x: 5, y: 5, z: 5, ease: Expo.easeOut})}
            , false)
            },
        	// called when loading has errors
            function ( error ) {
                console.log( error );
            }
        );

        var light = new THREE.AmbientLight( 0x888888 )
        scene.add( light )

        //Create a new directional light
        var light = new THREE.DirectionalLight( 0xFED62A, 1 )
        light.position.set(20,10,20)
        scene.add( light )
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
            size: .5,
            map: sprite
        });

        let stars = new THREE.Points(starGeo,starMaterial);
        scene.add(stars);

        var axesHelper = new THREE.AxesHelper( 5000 );
        scene.add( axesHelper );

        window.addEventListener( 'resize', onWindowResize, false );

        createEarth();
        createEarthCloud();   

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

    var r = 100;
    var theta = 0;
    var dTheta = 2 * Math.PI / 1000;

    const clock = new THREE.Clock();
    function animate() {
        // console.log(sauser)
        var camera = ( params.orthographicCamera ) ? orthographicCamera : perspectiveCamera;
        objs.forEach(({mixer}) => {mixer.update(clock.getDelta())});
        if (earth) {
            // console.log(scene.children)
            containerEarth.rotation.y += 0.001;
            // earth.rotation.y += 0.001;
            // earthCloud.rotation.y -= 0.0003;
        }

        theta+=dTheta;

        if (sauser) {
            sauser.position.x = r * Math.cos(theta);
            sauser.position.z = r * Math.sin(theta);
            sauser.rotation.y = 5 * Math.sin((theta % 90))
        }

        let pmax = 3;
        let pmin = -3;
        if (plumbus) {
            plumbus.position.y = 5 * Math.sin((theta))
            plumbus.rotation.x = .2 * Math.sin((theta))
            // if (plumbusDirection === 1 && plumbus.position.y >= pmax) {
            //     plumbusDirection = -1;
            //     plumbus.position.y += plumbusDirection
            // } 
            // // else if (plumbusDirection === -1 && plumbus.position.y <= pmin) {
            // //     plumbusDirection = 1;
            // // }
            // if (plumbusDirection === 1 && plumbus.position.y > pmin) {
            //     plumbus.position.y += plumbusDirection
            // }
            // // if (plumbusDirection === -1 && plumbus.position > pmin) {
            // //     plumbus.position.y += plumbusDirection
            // // }



        } 

        if (containerEarth && gun) {
            placeObjectOnPlanet(gun, 100, 100, earthRadius)
        }    

        renderer.render(scene, camera);
        requestAnimationFrame( animate );
        controls.update();
        stats.update();
    }

    function render() {
      
        var camera = ( params.orthographicCamera ) ? orthographicCamera : perspectiveCamera;
        // console.log(sauser)

        renderer.render( scene, camera );
    }

    function onMouseMove(event) {
        event.preventDefault();
  
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        raycaster.setFromCamera(mouse, perspectiveCamera);

        // calculate objects intersecting the picking ray
        if (scene) {
            console.log("meh")
            var intersects = raycaster.intersectObjects( scene.children );
            console.log(intersects)
            for ( var i = 0; i < intersects.length; i++ ) {
                if (intersects[i].name === "plumbus") {
                    console.log("ERF")
                    intersects[ i ].scale.set(100,100,100 );
                }
            }
        }
    }

  
    //     // var intersects = raycaster.intersectObjects(sauser, true);
    //     // if (sauser) {
    //     //     this.tl = new TimelineMax();
    //     //     this.tl.to(sauser.position, 1, {x: 100, ease: Expo.easeOut})
    //     // }

    //     // for (var i = 0; i < intersects.length; i++) {
    //     //     this.tl = new TimelineMax();
    //     //     this.tl.to(sauser.position, 1, {x: 100, ease: Expo.easeOut})
    //         // this.tl.to(intersects[i].object.scale, .5, {x: .5, ease: Expo.easeOut})
    //         // this.tl.to(intersects[i].object.position, .5, {x: 2, ease: Expo.easeOut})
    //         // this.tl.to(intersects[i].object.rotation, .5, {y: Math.PI*.5, ease: Expo.easeOut}, "=-1.5")
    //     // }
    // }

    return null

}

export default App;