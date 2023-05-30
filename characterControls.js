import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export const W = 'w'
export const A = 'a'
export const S = 's'
export const D = 'd'
export const DIRECTIONS = [W, A, S, D]
export class CharacterControls {
    model
    mixer
    animationsMap = new Map() // Walk, Run, Idle
    orbitControl
    camera
    // state
    toggleRun = true
    currentAction
    
    // temporary data
    walkDirection = new THREE.Vector3()
    rotateAngle = new THREE.Vector3(0, 1, 0)
    rotateQuarternion= new THREE.Quaternion()
    cameraTarget = new THREE.Vector3()
    
    // constants
    fadeDuration = 0.2
    walkVelocity = 2

    //jump
    jump_can = 1;
    velocity_y = 0;
    jumpTop = 0;
    deltam = 0.015;
    walkable = true;

    constructor(model, mixer, animationsMap,
        orbitControl, camera,
        currentAction) {
        this.model = model
        this.mixer = mixer
        this.animationsMap = animationsMap
        this.currentAction = currentAction
        this.animationsMap.forEach((value, key) => {
            if (key == currentAction) {
                value.play()
            }
        })
        this.orbitControl = orbitControl
        this.camera = camera
        

        this.updateCameraTarget(0,0)
    }

    switchRunToggle() {
        this.toggleRun = !this.toggleRun
    }

    update(delta, keysPressed, stepPositionList) {
        this.model.position.clamp(new THREE.Vector3(-20,0,-20), new THREE.Vector3(20,10,20))
        var directionPressed =  DIRECTIONS.some(key => keysPressed[key] == true)
        var spacePressed = keysPressed[" "]
        var play = 'idle';
        if (spacePressed && this.jump_can==1) {
            this.jump_can = 0;
            this.velocity_y = 0.4;
        }
        this.mixer.update(delta)

        if (directionPressed && this.walkable) {
            play = 'walk'
            // calculate towards camera direction
            var angleYCameraDirection = Math.atan2(
                    (this.camera.position.x - this.model.position.x), 
                    (this.camera.position.z - this.model.position.z))
            // diagonal movement angle offset
            var directionOffset = this.directionOffset(keysPressed)

            // rotate model
            this.rotateQuarternion.setFromAxisAngle(this.rotateAngle, angleYCameraDirection + directionOffset)
            this.model.quaternion.rotateTowards(this.rotateQuarternion, 0.2)

            // calculate direction
            this.camera.getWorldDirection(this.walkDirection)
           
            this.walkDirection.y = 0
            this.walkDirection.normalize()
            this.walkDirection.applyAxisAngle(this.rotateAngle, directionOffset)
            // run/walk velocity
            const velocity = this.walkVelocity

            // move model & camera
            const moveX = this.walkDirection.x * velocity * delta
            const moveZ = this.walkDirection.z * velocity * delta
           // console.log("walk")
            const modelPosition = this.model.position.clone()
            var collision = stepPositionList.some(function (step){
                
                var Xcheck = modelPosition.x-moveX >= step.min.x-0.2 && modelPosition.x-moveX <= step.max.x+0.2
                var Zcheck = modelPosition.z-moveZ >= step.min.z-0.2 && modelPosition.z-moveZ <= step.max.z+0.2
                return Xcheck && Zcheck
            });

            if(!collision){
                this.model.position.x -= moveX
                this.model.position.z -= moveZ  
                this.updateCameraTarget(moveX, moveZ)
            }else{
                
            }
        }
        if (directionPressed  && spacePressed) {
            // calculate towards camera direction
            var angleYCameraDirection = Math.atan2(
                    (this.camera.position.x - this.model.position.x), 
                    (this.camera.position.z - this.model.position.z))
            // diagonal movement angle offset
            var directionOffset = this.directionOffset(keysPressed)

            // rotate model
            this.rotateQuarternion.setFromAxisAngle(this.rotateAngle, angleYCameraDirection + directionOffset)
            this.model.quaternion.rotateTowards(this.rotateQuarternion, 0.2)
            
            // calculate direction
            this.camera.getWorldDirection(this.walkDirection)
            this.walkDirection.y = 0
            this.walkDirection.normalize()
            this.walkDirection.applyAxisAngle(this.rotateAngle, directionOffset)

            // run/walk velocity
            const velocity = this.walkVelocity

            // move model & camera
            const moveX = this.walkDirection.x * velocity * delta
            const moveZ = this.walkDirection.z * velocity * delta

            const modelPosition = this.model.position.clone()
            var collision = stepPositionList.some(function (step){
                var Xcheck = modelPosition.x-moveX >= step.min.x-0.2 && modelPosition.x-moveX <= step.max.x+0.2
                var Zcheck = modelPosition.z-moveZ >= step.min.z-0.2 && modelPosition.z-moveZ <= step.max.z+0.2
                return Xcheck && Zcheck
            });
            if(!collision){
                this.model.position.x -= moveX
                this.model.position.z -= moveZ  
                this.updateCameraTarget(moveX, moveZ)
            }else{
                
            }
        }

        if(this.jump_can==0){
            play= "jump"
            this.model.position.y+=this.deltam;
            
            if(this.model.position.y>=this.velocity_y && this.jumpTop ==0){
                this.deltam = -this.deltam
            }
            if(this.model.position.y<=0.0001){
                this.model.position.y=0
                this.jump_can = 1;
                this.velocity_y=0;
                this.jumpTop =0;
                this.deltam = -this.deltam
            }
        }

        if (this.currentAction != play) {
            const toPlay = this.animationsMap.get(play)
            const current = this.animationsMap.get(this.currentAction)
            if(play == "jump"){
                toPlay.timeScale= 2.5
            }
            current.fadeOut(this.fadeDuration)
            toPlay.reset().fadeIn(this.fadeDuration).play();

            this.currentAction = play
        }
    }

    updateCameraTarget(moveX, moveZ) {
        // move camera
        this.camera.position.x -= moveX
        this.camera.position.z -= moveZ

        // update camera target
        this.cameraTarget.x = this.model.position.x
        this.cameraTarget.y = 1
        //this.cameraTarget.y = this.model.position.y + 1
        this.cameraTarget.z = this.model.position.z
        this.orbitControl.target = this.cameraTarget
    }

    directionOffset(keysPressed) {
        var directionOffset = 0 // w

        if (keysPressed[S]) {
            if (keysPressed[D]) {
                directionOffset = Math.PI / 4 // w+a
            } else if (keysPressed[A]) {
                directionOffset = - Math.PI / 4 // w+d
            }
        } else if (keysPressed[W]) {
            if (keysPressed[D]) {
                directionOffset = Math.PI / 4 + Math.PI / 2 // s+a
            } else if (keysPressed[A]) {
                directionOffset = -Math.PI / 4 - Math.PI / 2 // s+d
            } else {
                directionOffset = Math.PI // s
            }
        } else if (keysPressed[D]) {
            directionOffset = Math.PI / 2 // a
        } else if (keysPressed[A]) {
            directionOffset = - Math.PI / 2 // d
        }

        return directionOffset
    }
}