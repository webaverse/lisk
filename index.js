import * as THREE from 'three';
// import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
// import easing from './easing.js';
import metaversefile from 'metaversefile';
// import {getCaretAtPoint} from 'troika-three-text';
const {useApp, useFrame, usePhysics, useScene, useCleanup} = metaversefile;

const baseUrl = import.meta.url.replace(/(\/)[^\/\\]*$/, '$1');

const localVector = new THREE.Vector3();
const localVector2 = new THREE.Vector3();
const localQuaternion = new THREE.Quaternion();
const localEuler = new THREE.Euler();
const localEuler2 = new THREE.Euler();
const localMatrix = new THREE.Matrix4();

// const forward = new THREE.Vector3(0, 0, -1);
// const y180Quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
// const hitSpeed = 6;

export default e => {
  const app = useApp();
  // const {renderer, scene, camera} = useInternals();
  const physics = usePhysics();
  // const {CapsuleGeometry} = useGeometries();
  // const {WebaverseShaderMaterial} = useMaterials();
  // const Text = useTextInternal();
  const scene = useScene();

  /* const mesh = new THREE.Mesh(
    new THREE.BoxBufferGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({color: 0x00ff00})
  );
  mesh.position.copy(app.position);
  mesh.quaternion.copy(app.quaternion);
  mesh.updateMatrixWorld();
  scene.add(mesh); */

  let lisk = null;
  let mixer = null;
  let actions = {};
  const speed = 0.03;
  const angularSpeed = 0.02;
  (async () => {
    lisk = await metaversefile.createAppAsync({
      start_url: `${baseUrl}lisk_animation_v3_texta.glb`,
    });
    lisk.frustumCulled = false;
    app.add(lisk);
    // window.lisk = lisk;
    
    mixer = new THREE.AnimationMixer(lisk);
    for (const clip of lisk.glb.animations) {
      const action = mixer.clipAction(clip);
      actions[clip.name] = action;
    }
    // console.log('got actions', actions);
  })();

  // this function returns a float representing the player look direction of the given vector, as a rotation around the y axis.
  // the value 0 means forward, left is negative, and right is positive.
  /* const directionToFacingAngle = (() => {
    const localQuaternion = new THREE.Quaternion();
    const localEuler = new THREE.Euler();
    return direction => {
      localQuaternion.setFromUnitVectors(forward, direction);
      localEuler.setFromQuaternion(localQuaternion, 'YXZ');
      return localEuler.y;
    };
  })(); */

  // this function moves the y-axis angle of the quaternion towards the given direction, by the given amount of radians.
  // the rotation should not overshoot the direction; if it does, it will be clamped to the direction.
  /* const _angleQuaternionTowards = (quaternion, ry, radians) => {
    localEuler.setFromQuaternion(quaternion, 'YXZ');
    localEuler2.set(0, ry, 0, 'YXZ');

    localEuler.y += Math.PI*2;
    localEuler2.y += Math.PI*2;

    if (localEuler.y < localEuler2.y) {
      localEuler.y += radians;
      if (localEuler.y > localEuler2.y) {
        localEuler.y = localEuler2.y;
      }
    } else if (localEuler.y > localEuler2.y) {
      localEuler.y -= radians;
      if (localEuler.y < localEuler2.y) {
        localEuler.y = localEuler2.y;
      }
    }

    // console.log('update', localEuler.y, directionToFacingAngle(direction), direction.toArray().join(','));

    quaternion.setFromEuler(localEuler);
  }; */

  let animationSpec = null;
  const _idle = timestamp => {
    animationSpec = {
      name: 'idle',
      startTime: timestamp,
      duration: 1000 + Math.random() * 3 * 1000,
    };
  };
  const _walk = timestamp => {
    animationSpec = {
      name: 'walk',
      startTime: timestamp,
      duration: 3000 + Math.random() * 3 * 1000,
    };
  };
  const _takeOff = timestamp => {
    animationSpec = {
      name: 'take_off',
      startTime: timestamp,
      duration: 3000 + Math.random() * 3 * 1000,
    };
  };
  const _land = timestamp => {
    animationSpec = {
      name: 'land',
      startTime: timestamp,
      duration: 3000 + Math.random() * 3 * 1000,
    };
  };
  const _glide = timestamp => {
    animationSpec = {
      name: 'glide',
      startTime: timestamp,
      duration: 3000 + Math.random() * 3 * 1000,
    };
  };
  const nextIdleFns = [
    // _idle,
    _walk,
    _takeOff,
  ];
  const _idleNext = timestamp => {
    const r = Math.random();
    const nextIdleIndex = Math.floor(r * nextIdleFns.length);
    const nextIdle = nextIdleFns[nextIdleIndex];
    nextIdle(timestamp);
  };
  const nextWalkFns = [
    _takeOff,
  ];
  const _walkNext = timestamp => {
    const r = Math.random();
    const nextWalkIndex = Math.floor(r * nextWalkFns.length);
    const nextWalk = nextWalkFns[nextWalkIndex];
    nextWalk(timestamp);
  };
  const _updateAnimationSpec = timestamp => {
    if (animationSpec) {
      const f = animationSpec ? ((animationSpec.startTime - timestamp) / animationSpec.duration) : 1;
      if (f < 1) { // continuation of animation
        // nothing
      } else {
        // animationSpec = null;

        {
          const action = actions[animationSpec.name];
          if (!action.paused) {
            action.stop();
          }
        }

        switch (animationSpec.type) {
          case 'idle': {
            _idleNext(timestamp);
            break;
          }
          case 'walk': {
            _walkNext(timestamp);
            break;
          }
          default: {
            _walkNext(timestamp);
            // console.log('unknown animation type', animationSpec.type);
            break;
          }
        }

        {
          const action = actions[animationSpec.name];
          action.play();
        }
      }
    } else {
      _idle(timestamp);
    }
  };
  const _updateAnimation = (timestamp, timeDiff) => {
    // const timeDiff = animationSpec;
    // const action = actions[animationSpec.name];
    const timeDiffS = timeDiff / 1000;
    mixer.update(timeDiffS);
    // console.log('get action', action);
  };
  const hitAction = (hitDirection, hitVelocity) => {
    /* // console.log('hit');
    const enableGravity = true;
    physics.setVelocity(physicsObject, hitVelocity, enableGravity);
    let groundedFrames = 0;
    const maxGroundedFrames = 10;
    return {
      // name: 'targetQuaternion',
      update(timestamp) {
        // getAppByPhysicsId(physicsObject).position.add(physicsObject.velocity.clone().multiplyScalar(hitSpeed));

        // console.log('got app', physicsObject.position.toArray().join(','), physicsObject.collided, physicsObject.grounded);
        const hitQuaternion = localQuaternion.setFromRotationMatrix(
          localMatrix.lookAt(
            localVector.set(0, 0, 0),
            hitDirection,
            localVector2.set(0, 1, 0)
          )
        ).premultiply(y180Quaternion);
        app.position.copy(physicsObject.position);
        app.quaternion.slerp(
          hitQuaternion,
          0.5
        );
        app.updateMatrixWorld();

        groundedFrames += +physicsObject.grounded;

        if (groundedFrames < maxGroundedFrames) {
          return true;
        } else {
          return false;
        }
      },
    }; */
  };

  useFrame(({timestamp, timeDiff}) => {
    // console.log('start 1');
    if (lisk) {
      _updateAnimationSpec(timestamp);
      _updateAnimation(timestamp, timeDiff);
    }

    // console.log('start 2');

    for (const physicsObject of physicsIds) {
      physicsObject.position.copy(app.position);
      physicsObject.quaternion.copy(app.quaternion);
      physicsObject.updateMatrixWorld();
      physics.setTransform(physicsObject);
    }
    // console.log('start 3');
  });

  /* let activateCb = null;
  let frameCb = null;
  useActivate(() => {
    activateCb && activateCb();
  }); */

  app.addEventListener('hit', e => {
    console.log('lisk hit', e);
  });

  const physicsIds = [];

  window.liskApp = app;
  window.liskPhysicsIds = physicsIds;

  const physicsMaterial = [0.5, 0.5, 1];
  const materialAddress = physics.createMaterial(physicsMaterial);
  const physicsObject = physics.addCapsuleGeometry(app.position, app.quaternion, 3, 0, materialAddress);
  physicsObject.detached = true;
  physicsIds.push(physicsObject);
  
  // app.getPhysicsObjects = () => lisk ? lisk.getPhysicsObjects() : [];

  useCleanup(() => {
    for (const physicsId of physicsIds) {
      physics.removeGeometry(physicsId);
    }
    physics.destroyMaterial(materialAddress);
  });

  return app;
};