import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import React, {useEffect, useState} from 'react';
import {Expo, TimelineMax} from "gsap/TweenMax";

var dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( '/examples/js/libs/draco' );

export const createEarth	= (containerEarth, earth, earthRadius) => {
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
    newEarth.material.opacity = 0;
    earth = newEarth;
    return earth;
}

export const createEarthCloud = (containerEarth, earthCloud, earthRadius) => {
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
    newEarthCloud.material.opacity = 0;
    earthCloud = newEarthCloud;
    return earthCloud
    containerEarth.add(earthCloud)
}

export const loadCromulon = (scene, manager, cromulon, containerEarth) => {
    const cromulonLoader = new STLLoader(manager);
    // cromulonLoader.setDRACOLoader(dracoLoader);
    cromulonLoader.load('/cromulon/model.stl', stl => {
        stl.scene.scale.set(1,1,1);
        stl.scene.position.set(0, 0, 0);
        cromulon = stl.scene;
        cromulon.name = "cromulon"
        containerEarth.add(cromulon)
        return cromulon;
    },
        // called when loading has errors
        function ( error ) {
            console.log( error );
        }
    );
}

export const loadButt = (scene, butt, manager, playing, setPlaying, setVideo, domEvents, containerEarth) => {
    var textureLoader = new THREE.TextureLoader();
    var map = textureLoader.load('./texture_skin.png');
    var material = new THREE.MeshPhongMaterial({map: map});

    
    const buttLoader = new OBJLoader(manager);
    buttLoader.load('/butt.obj', obj => {

        obj.traverse( function ( node ) {

            if ( node.isMesh ) node.material = material;
        
          } );

        obj.scale.set(.5,.5,.5);
        obj.position.set(100, 50, 120);
        butt = obj;
        butt.name = "butt"
        containerEarth.add(butt)

        domEvents.addEventListener(butt, 'click', function(event){
            this.tl = new TimelineMax();
            // this.tl.to(sauser.scale, 3, {x: 1.5, y: 1.5, z: 1.5, ease: Expo.easeOut})

            let originalScale = butt.scale.x;
            // this.tl.to(sauser.scale, .2, {x: .8, y: .8, z: .8, ease: Expo.easeIn})
            this.tl.fromTo(butt.scale, 1, {x: originalScale*1.5, y: originalScale*1.5, z: originalScale*1.5, ease: Expo.easeIn}, {x: originalScale, y: originalScale, z: originalScale, ease: Expo.easeOut})
            // this.tl.to(sauser.scale, .4, {x: originalScale, y: originalScale, z: originalScale, ease: Expo.easeOut})
        
            setTimeout(() => {
                console.log('you clicked on the mesh')
                if (playing) {
                    setPlaying(false)
                }
                else {
                    setPlaying(true);
                }
                setVideo('butt')
            }, 1000)
        }
        , false)
    
        return butt;
    },
        // called when loading has errors
        function ( error ) {
            console.log( error );
        }
    );
}

export const loadRick = (objs, scene, manager, rick, containerEarth) => {
    const RickWalkLoader = new FBXLoader(manager);
    RickWalkLoader.load('/drunk_idle/Floating.fbx', model => {
        // model is a THREE.Group (THREE.Object3D)                              
        const mixer = new THREE.AnimationMixer(model);
        mixer.clipAction(model.animations[0]).play();
        model.scale.set(.01, .01, .01)
        model.position.set(-90, 0, 0)

        model.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.material.map = '/drunk_idle/rm_rick.png'
                child.material.needsUpdate = true;
            }
        })

        rick = model;
        rick.name = "rick"
        objs.push({rick, mixer});
        scene.add(rick)
    }, undefined, function ( error ) {

        console.error( error );
    
    });
}

export const loadMorty = (scene, morty, manager, playing, setPlaying, setVideo, domEvents, containerEarth) => {
    const mortyLoader = new GLTFLoader(manager);
    mortyLoader.setDRACOLoader(dracoLoader);
    mortyLoader.load('/morty/scene.gltf', gltf => {
        const mixer = new THREE.AnimationMixer(gltf.scene);
        for (const anim of gltf.animations) {
            mixer.clipAction(anim).play();
        }
        gltf.scene.scale.set(10,10,10);
        gltf.scene.position.set(-120, 0, 100);
        gltf.scene.castShadow = true;
        gltf.scene.receiveShadow = true;
        morty = gltf.scene;
        morty.name = "morty"
        scene.add(morty)

        domEvents.addEventListener(morty, 'click', function(event){
            this.tl = new TimelineMax();
            // this.tl.to(sauser.scale, 3, {x: 1.5, y: 1.5, z: 1.5, ease: Expo.easeOut})

            let originalScale = morty.scale.x;
            // this.tl.to(sauser.scale, .2, {x: .8, y: .8, z: .8, ease: Expo.easeIn})
            this.tl.fromTo(morty.scale, 1, {x: originalScale*1.5, y: originalScale*1.5, z: originalScale*1.5, ease: Expo.easeIn}, {x: originalScale, y: originalScale, z: originalScale, ease: Expo.easeOut})
            // this.tl.to(sauser.scale, .4, {x: originalScale, y: originalScale, z: originalScale, ease: Expo.easeOut})
        
            setTimeout(() => {
                console.log('you clicked on the mesh')
                if (playing) {
                    setPlaying(false)
                }
                else {
                    setPlaying(true);
                }
                setVideo('morty')
            }, 1000)
        }
        , false)

        return morty;
    },
        // called when loading has errors
        function ( error ) {
            console.log( error );
        }
    );
}

export const loadTinyPlanet = (scene, tinyPlanet, manager, playing, setPlaying, setVideo, domEvents, containerEarth) => {
    const mortyLoader = new GLTFLoader(manager);
    mortyLoader.setDRACOLoader(dracoLoader);
    mortyLoader.load('/tiny_planet/scene.gltf', gltf => {
        const mixer = new THREE.AnimationMixer(gltf.scene);
        for (const anim of gltf.animations) {
            mixer.clipAction(anim).play();
        }
        gltf.scene.scale.set(10,10,10);
        gltf.scene.position.set(-120, 0, 100);
        gltf.scene.castShadow = true;
        gltf.scene.receiveShadow = true;
        tinyPlanet = gltf.scene;
        tinyPlanet.name = "morty"
        scene.add(tinyPlanet)

        domEvents.addEventListener(tinyPlanet, 'click', function(event){
            this.tl = new TimelineMax();
            // this.tl.to(sauser.scale, 3, {x: 1.5, y: 1.5, z: 1.5, ease: Expo.easeOut})

            let originalScale = tinyPlanet.scale.x;
            // this.tl.to(sauser.scale, .2, {x: .8, y: .8, z: .8, ease: Expo.easeIn})
            this.tl.fromTo(tinyPlanet.scale, 1, {x: originalScale*1.5, y: originalScale*1.5, z: originalScale*1.5, ease: Expo.easeIn}, {x: originalScale, y: originalScale, z: originalScale, ease: Expo.easeOut})
            // this.tl.to(sauser.scale, .4, {x: originalScale, y: originalScale, z: originalScale, ease: Expo.easeOut})
        
            setTimeout(() => {
                console.log('you clicked on the mesh')
                if (playing) {
                    setPlaying(false)
                }
                else {
                    setPlaying(true);
                }
                setVideo('tinyPlanet')
            }, 1000)
        }
        , false)

        return tinyPlanet;
    },
        // called when loading has errors
        function ( error ) {
            console.log( error );
        }
    );
}

export const loadPickleRick = (scene, pickleRick, manager, playing, setPlaying, setVideo, domEvents, containerEarth) => {
    const pickleRickLoader = new GLTFLoader(manager);
    pickleRickLoader.setDRACOLoader(dracoLoader);
    pickleRickLoader.load('/pickleRick/scene.gltf', gltf => {
        const mixer = new THREE.AnimationMixer(gltf.scene);
        for (const anim of gltf.animations) {
            mixer.clipAction(anim).play();
        }
        gltf.scene.scale.set(4,4,4);
        gltf.scene.position.set(50, 0, 100);
        gltf.scene.castShadow = true;
        gltf.scene.receiveShadow = true;
        pickleRick = gltf.scene;
        pickleRick.name = "pickleRick"
        scene.add(pickleRick)

        domEvents.addEventListener(pickleRick, 'click', function(event){
            this.tl = new TimelineMax();
            // this.tl.to(sauser.scale, 3, {x: 1.5, y: 1.5, z: 1.5, ease: Expo.easeOut})

            let originalScale = pickleRick.scale.x;
            // this.tl.to(sauser.scale, .2, {x: .8, y: .8, z: .8, ease: Expo.easeIn})
            this.tl.fromTo(pickleRick.scale, 1, {x: originalScale*1.5, y: originalScale*1.5, z: originalScale*1.5, ease: Expo.easeIn}, {x: originalScale, y: originalScale, z: originalScale, ease: Expo.easeOut})
            // this.tl.to(sauser.scale, .4, {x: originalScale, y: originalScale, z: originalScale, ease: Expo.easeOut})
        
            setTimeout(() => {
                console.log('you clicked on the mesh')
                if (playing) {
                    setPlaying(false)
                }
                else {
                    setPlaying(true);
                }
                setVideo('pickleRick')
            }, 1000)
        }
        , false)

        return(pickleRick)
    },
        // called when loading has errors
        function ( error ) {
            console.log( error );
        }
    );
}


export const loadSauser = (containerEarth, sauser, manager, playing, setPlaying, setVideo, domEvents) => {
    const sauserLoader = new GLTFLoader(manager);
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
        gltf.scene.position.set(0,0,100)
        gltf.scene.castShadow = true;
        gltf.scene.receiveShadow = true;
        sauser = gltf.scene;
        containerEarth.add(sauser)        
    
        domEvents.addEventListener(sauser, 'click', function(event){
            this.tl = new TimelineMax();

            let originalScale = sauser.scale.x;
            this.tl.fromTo(sauser.scale, 1, {x: originalScale*1.5, y: originalScale*1.5, z: originalScale*1.5, ease: Expo.easeIn}, {x: originalScale, y: originalScale, z: originalScale, ease: Expo.easeOut})
        
            setTimeout(() => {
                console.log('you clicked on the mesh')
                if (playing) {
                    setPlaying(false)
                }
                else {
                    setPlaying(true);
                }
                setVideo('sauser')
            }, 1000)
        }
        , false)
    
        return sauser;

    },
        // called when loading has errors
        function ( error ) {
            console.log( error );
        }
    );
}

export const loadGun = (scene, gun, manager, playing, setPlaying, setVideo, domEvents, containerEarth) => {
    const gunLoader = new GLTFLoader(manager);
    gunLoader.setDRACOLoader(dracoLoader);
    gunLoader.load('/portal_gun/scene.gltf', gltf => {
        const mixer = new THREE.AnimationMixer(gltf.scene);
        for (const anim of gltf.animations) {
            mixer.clipAction(anim).play();
        }
        gltf.scene.scale.set(.3,.3,.3);
        gltf.scene.position.set(0, 0, 100);
        gltf.scene.castShadow = true;
        gltf.scene.receiveShadow = true;
        gun = gltf.scene;
        gun.name = "gun"
        scene.add(gun)

        domEvents.addEventListener(gun, 'click', function(event){
            this.tl = new TimelineMax();
            // this.tl.to(sauser.scale, 3, {x: 1.5, y: 1.5, z: 1.5, ease: Expo.easeOut})

            let originalScale = gun.scale.x;
            // this.tl.to(sauser.scale, .2, {x: .8, y: .8, z: .8, ease: Expo.easeIn})
            this.tl.fromTo(gun.scale, 1, {x: originalScale*1.5, y: originalScale*1.5, z: originalScale*1.5, ease: Expo.easeIn}, {x: originalScale, y: originalScale, z: originalScale, ease: Expo.easeOut})
            // this.tl.to(sauser.scale, .4, {x: originalScale, y: originalScale, z: originalScale, ease: Expo.easeOut})
        
            setTimeout(() => {
                console.log('you clicked on the mesh')
                if (playing) {
                    setPlaying(false)
                }
                else {
                    setPlaying(true);
                }
                setVideo('gun')
            }, 1000)
        }
        , false)

        return gun;
    },
        // called when loading has errors
        function ( error ) {
            console.log( error );
        }
    );
}


export const loadPlumbus = (scene, plumbus, manager, playing, setPlaying, setVideo, domEvents, containerEarth) => {
    const plumbusLoader = new GLTFLoader(manager);
    plumbusLoader.setDRACOLoader(dracoLoader);
    plumbusLoader.load('/plumbus/scene.gltf', gltf => {
        const mixer = new THREE.AnimationMixer(gltf.scene);
        for (const anim of gltf.animations) {
            mixer.clipAction(anim).play();
        }
        gltf.scene.scale.set(5,5,5);
        gltf.scene.position.set(90, 20, 0);
        gltf.scene.rotation.set(0, 0, Math.PI/2)
        gltf.scene.castShadow = true;
        gltf.scene.receiveShadow = true;
        plumbus = gltf.scene;
        plumbus.userData = { name: "plumbus" }
        plumbus.name = "plumbus"
        scene.add(plumbus)
        // containerEarth.add(plumbus)
        
        domEvents.addEventListener(plumbus, 'click', function(event){
            this.tl = new TimelineMax();

            let originalScale = plumbus.scale.x;

            this.tl.to(plumbus.scale, .15, {x: originalScale*1.5, y: originalScale*1.5, z: originalScale*1.5, ease: Expo.easeIn})
            this.tl.to(plumbus.scale, .4, {x: originalScale, y: originalScale, z: originalScale, ease: Expo.easeOut})
            setTimeout(() => {
                console.log('you clicked on the mesh')
                if (playing) {
                    setPlaying(false)
                }
                else {
                    setPlaying(true);
                }
                setVideo('sauser')
            }, 1000)}
        , false)

        return plumbus

        },
        // called when loading has errors
        function ( error ) {
            console.log( error );
        }
        
    );
}

export const loadDiscoBall = (scene, discoBall, manager, playing, setPlaying, setVideo, domEvents, containerEarth) => {
    const discoLoader = new GLTFLoader(manager);
    discoLoader.setDRACOLoader(dracoLoader);
    discoLoader.load('/disco_ball/scene.gltf', gltf => {
        const mixer = new THREE.AnimationMixer(gltf.scene);
        for (const anim of gltf.animations) {
            mixer.clipAction(anim).play();
        }
        gltf.scene.scale.set(.5,.5,.5);
        gltf.scene.position.set(150, 20, 0);
        gltf.scene.rotation.set(0, 0, 0)
        gltf.scene.castShadow = true;
        gltf.scene.receiveShadow = true;
        discoBall = gltf.scene;
        discoBall.userData = { name: "discoBall" }
        discoBall.name = "discoBall"
        containerEarth.add(discoBall)
        
        domEvents.addEventListener(discoBall, 'click', function(event){
            this.tl = new TimelineMax();

            let originalScale = discoBall.scale.x;

            this.tl.to(discoBall.scale, .15, {x: originalScale*1.5, y: originalScale*1.5, z: originalScale*1.5, ease: Expo.easeIn})
            this.tl.to(discoBall.scale, .4, {x: originalScale, y: originalScale, z: originalScale, ease: Expo.easeOut})
            setTimeout(() => {
                console.log('you clicked on the mesh')
                if (playing) {
                    setPlaying(false)
                }
                else {
                    setPlaying(true);
                }
                setVideo('discoBall')
            }, 1000)}
        , false)

        return discoBall

        },
        // called when loading has errors
        function ( error ) {
            console.log( error );
        }
        
    );
}

export const loadMicrophone = (scene, microphone, manager, playing, setPlaying, setVideo, domEvents, containerEarth) => {
    const microphoneLoader = new GLTFLoader(manager);
    microphoneLoader.setDRACOLoader(dracoLoader);
    microphoneLoader.load('/microphone/scene.gltf', gltf => {
        const mixer = new THREE.AnimationMixer(gltf.scene);
        for (const anim of gltf.animations) {
            mixer.clipAction(anim).play();
        }
        gltf.scene.scale.set(.2,.2,.2);
        gltf.scene.position.set(-90, 20, 0);
        gltf.scene.rotation.set(0, 0, 0)
        gltf.scene.castShadow = true;
        gltf.scene.receiveShadow = true;
        microphone = gltf.scene;
        microphone.userData = { name: "microphone" }
        microphone.name = "microphone"
        containerEarth.add(microphone)
        
        domEvents.addEventListener(microphone, 'click', function(event){
            this.tl = new TimelineMax();
            let originalScale = microphone.scale.x;
            this.tl.to(microphone.scale, .15, {x: originalScale*1.5, y: originalScale*1.5, z: originalScale*1.5, ease: Expo.easeIn})
            this.tl.to(microphone.scale, .4, {x: originalScale, y: originalScale, z: originalScale, ease: Expo.easeOut})
            setTimeout(() => {
                console.log('you clicked on the mesh')
                if (playing) {
                    setPlaying(false)
                }
                else {
                    setPlaying(true);
                }
                setVideo('microphone')
            }, 1000)}
        , false)

        return microphone

        },
        // called when loading has errors
        function ( error ) {
            console.log( error );
        }
        
    );
}

export const loadTV = (scene, TV, manager, playing, setPlaying, setVideo, domEvents, containerEarth) => {
    const TVLoader = new GLTFLoader(manager);
    TVLoader.setDRACOLoader(dracoLoader);
    TVLoader.load('/tv/scene.gltf', gltf => {
        const mixer = new THREE.AnimationMixer(gltf.scene);
        for (const anim of gltf.animations) {
            mixer.clipAction(anim).play();
        }
        gltf.scene.scale.set(10,10,10);
        gltf.scene.position.set(-150, 20, 0);
        gltf.scene.rotation.set(0, 0, 0)
        gltf.scene.castShadow = true;
        gltf.scene.receiveShadow = true;
        TV = gltf.scene;
        TV.userData = { name: "TV" }
        TV.name = "TV"
        containerEarth.add(TV)
        
        domEvents.addEventListener(TV, 'click', function(event){
            this.tl = new TimelineMax();
            let originalScale = TV.scale.x;
            this.tl.to(TV.scale, .15, {x: originalScale*1.5, y: originalScale*1.5, z: originalScale*1.5, ease: Expo.easeIn})
            this.tl.to(TV.scale, .4, {x: originalScale, y: originalScale, z: originalScale, ease: Expo.easeOut})
            setTimeout(() => {
                console.log('you clicked on the mesh')
                if (playing) {
                    setPlaying(false)
                }
                else {
                    setPlaying(true);
                }
                setVideo('TV')
            }, 1000)}
        , false)

        return TV

        },
        // called when loading has errors
        function ( error ) {
            console.log( error );
        }
        
    );
}

export const loadSun = (scene, sun, manager, playing, setPlaying, setVideo, domEvents, containerEarth) => {
    const sunLoader = new GLTFLoader(manager);
    sunLoader.setDRACOLoader(dracoLoader);
    sunLoader.load('/sun/scene.gltf', gltf => {
        const mixer = new THREE.AnimationMixer(gltf.scene);
        for (const anim of gltf.animations) {
            mixer.clipAction(anim).play();
        }
        gltf.scene.scale.set(5,5,5);
        gltf.scene.position.set(150, 50, 0);
        gltf.scene.rotation.set(0, 0, 0)
        gltf.scene.castShadow = true;
        gltf.scene.receiveShadow = true;
        sun = gltf.scene;
        sun.userData = { name: "sun" }
        sun.name = "sun"
        containerEarth.add(sun)
        
        domEvents.addEventListener(sun, 'click', function(event){
            this.tl = new TimelineMax();
            let originalScale = sun.scale.x;
            this.tl.to(sun.scale, .15, {x: originalScale*1.5, y: originalScale*1.5, z: originalScale*1.5, ease: Expo.easeIn})
            this.tl.to(sun.scale, .4, {x: originalScale, y: originalScale, z: originalScale, ease: Expo.easeOut})
            setTimeout(() => {
                console.log('you clicked on the mesh')
                if (playing) {
                    setPlaying(false)
                }
                else {
                    setPlaying(true);
                }
                setVideo('sun')
            }, 1000)}
        , false)

        return sun

        },
        // called when loading has errors
        function ( error ) {
            console.log( error );
        }
        
    );
}

export let placeObjectOnPlanet = (object, lat, lon, radius) => {
    var latRad = lat * (Math.PI / 180);
    var lonRad = -lon * (Math.PI / 180);
    object.position.set(
        Math.cos(latRad) * Math.cos(lonRad) * radius,
        Math.sin(latRad) * radius,
        Math.cos(latRad) * Math.sin(lonRad) * radius
    );
    object.rotation.set(0.0, -lonRad, latRad - Math.PI * 0.5);
} 
