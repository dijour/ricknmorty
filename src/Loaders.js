import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
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
    containerEarth.add(earth)
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
    containerEarth.add(earthCloud)
}

export const loadRick = (objs, scene, manager, rick) => {
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
        scene.add(rick);
        objs.push({rick, mixer});
    }, undefined, function ( error ) {

        console.error( error );
    
    });
}

export const loadMorty = (scene, manager, morty) => {
    const mortyLoader = new GLTFLoader(manager);
    mortyLoader.setDRACOLoader(dracoLoader);
    mortyLoader.load('/morty/scene.gltf', gltf => {
        const mixer = new THREE.AnimationMixer(gltf.scene);
        for (const anim of gltf.animations) {
            mixer.clipAction(anim).play();
        }
        gltf.scene.scale.set(10,10,10);
        gltf.scene.position.set(-120, 0, 100);
        morty = gltf.scene;
        morty.name = "morty"
        scene.add(morty)
    },
        // called when loading has errors
        function ( error ) {
            console.log( error );
        }
    );
}

export const loadPickleRick = (scene, pickleRick, manager, domEvents) => {
    const pickleRickLoader = new GLTFLoader(manager);
    pickleRickLoader.setDRACOLoader(dracoLoader);
    pickleRickLoader.load('/pickleRick/scene.gltf', gltf => {
        const mixer = new THREE.AnimationMixer(gltf.scene);
        for (const anim of gltf.animations) {
            mixer.clipAction(anim).play();
        }
        gltf.scene.scale.set(1,1,1);
        gltf.scene.position.set(50, 0, 100);
        pickleRick = gltf.scene;
        pickleRick.name = "pickleRick"
        scene.add(pickleRick)
    },
        // called when loading has errors
        function ( error ) {
            console.log( error );
        }
    );
}


export const loadSauser = (scene, sauser, manager, playing, setPlaying, setVideo, domEvents) => {
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
        gltf.scene.position.set(0,0,1000)
        sauser = gltf.scene;
        scene.add(sauser)
    
        domEvents.addEventListener(sauser, 'click', function(event){
            console.log('you clicked on the mesh')
            if (playing) {
                setPlaying(false)
            }
            else {
                setPlaying(true);
            }
            setVideo('sauser')
            this.tl = new TimelineMax();
            this.tl.to(sauser.scale, 3, {x: 1.5, y: 1.5, z: 1.5, ease: Expo.easeOut})}
        , false)
    
        domEvents.addEventListener(sauser, 'touchstart', function(event){
            setPlaying(!playing);
            setVideo('sauser')
            console.log('you clicked on the mesh')
            this.tl = new TimelineMax();
            this.tl.to(sauser.scale, 3, {x: 1.5, y: 1.5, z: 1.5, ease: Expo.easeOut})}
        , false)
    
    },
        // called when loading has errors
        function ( error ) {
            console.log( error );
        }
    );
}

export const loadGun = (containerEarth, gun, manager) => {
    const gunLoader = new GLTFLoader(manager);
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
}


export const loadPlumbus = (scene, plumbus, manager, playing, setPlaying, setVideo, domEvents) => {
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
        plumbus = gltf.scene;
        plumbus.userData = { name: "plumbus" }
        plumbus.name = "plumbus"
        // console.log(plumbus)
        scene.add(plumbus)
    
        domEvents.addEventListener(plumbus, 'click', function(event){
            console.log('you clicked on the mesh')
            setPlaying(!playing);
            setVideo('plumbus')
            this.tl = new TimelineMax();
            this.tl.to(plumbus.scale, .2, {x: 6, y: 7, z: 6, ease: Expo.easeIn})
            this.tl.to(plumbus.scale, .4, {x: 5, y: 5, z: 5, ease: Expo.easeOut})}
        , false)
    
        domEvents.addEventListener(plumbus, 'touchstart', function(event){
            setPlaying(!playing);
            setVideo('plumbus')
            console.log('you clicked on the mesh')
            this.tl = new TimelineMax();
            this.tl.to(plumbus.scale, .2, {x: 6, y: 7, z: 6, ease: Expo.easeIn})
            this.tl.to(plumbus.scale, .4, {x: 5, y: 5, z: 5, ease: Expo.easeOut})}
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
}
