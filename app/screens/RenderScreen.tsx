import React, { useRef, useState } from 'react';
import 'react-native-url-polyfill/auto';
import { Canvas } from '@react-three/fiber/native';
import { View } from 'react-native';
import * as THREE from 'three';

function RotatablePrism({ dimensions, height }: { dimensions: [number, number, number, number], height: number }) {
    const meshRef = useRef<THREE.Group>(null);
    const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);
    const [isDragging, setDragging] = useState(false);
    const [startPosition, setStartPosition] = useState<[number, number] | null>(null);

    // Handles the start of dragging
    const handlePointerDown = (event: any) => {
        setDragging(true);
        setStartPosition([event.nativeEvent.locationX, event.nativeEvent.locationY]);
    };

    // Rotating the prism while dragging
    const handlePointerMove = (event: any) => {
        if (!isDragging || !startPosition) return;

        const deltaX = (event.nativeEvent.locationX - startPosition[0]) * 0.01;
        const deltaY = (event.nativeEvent.locationY - startPosition[1]) * 0.01;

        setRotation([
            rotation[0] + deltaY,  // Rotate around the X-axis
            rotation[1] + deltaX,  // Rotate around the Y-axis
            rotation[2]            // No rotation on the Z-axis
        ]);

        setStartPosition([event.nativeEvent.locationX, event.nativeEvent.locationY]);
    };

    // Stops dragging
    const handlePointerUp = () => {
        setDragging(false);
        setStartPosition(null);
    };

    const [a, b, c, d] = dimensions;

    // **Vertices adjusted to ensure the open top faces upward**
    const vertices = [
        [0, 0, 0],      // 1         // Bottom face vertices (closed)
        [a, 0, 0],      // 2
        [a, b, 0],      // 3
        [0, b, 0],      // 4
        [0, 0, height], // 5   // Top face vertices (open)
        [a, 0, height], // 6
        [a, b, height], // 7
        [0, b, height]  // 8
    ];

    // **Faces adjusted to ensure the top is open and bottom is closed**
    const faces = [
        [0, 1, 2], [0, 2, 3],  // Bottom face (closed)
        [0, 1, 5], [0, 5, 4],  // Side 1
        [1, 2, 6], [1, 6, 5],  // Side 2
        [2, 3, 7], [2, 7, 6],  // Side 3
        [3, 0, 4], [3, 4, 7]   // Side 4
        // **Top face deliberately excluded to keep it open**
    ];

    const geometry = new THREE.BufferGeometry();
    const verticesArray = new Float32Array(vertices.flat());
    const indicesArray = new Uint16Array(faces.flat());
    geometry.setAttribute('position', new THREE.BufferAttribute(verticesArray, 3));
    geometry.setIndex(new THREE.BufferAttribute(indicesArray, 1));
    geometry.computeVertexNormals();

    return (
        <group
            ref={meshRef}
            position={[0, 0, 0]}  // Centered prism
            rotation={rotation}   // **Rotation logic retained from the previous working code**
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
        >
            <mesh geometry={geometry}>
                <meshStandardMaterial attach="material" color="#808080" side={THREE.DoubleSide} />
            </mesh>
        </group>
    );
}

export default function RenderScreen() {
    return (
        <View style={{ flex: 1 }}>
            <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
                <ambientLight intensity={1.5} />
                <spotLight position={[5, 5, 5]} angle={0.3} penumbra={1} decay={0} intensity={2} />
                <pointLight position={[-5, -5, -5]} decay={0} intensity={1} />
                
                {/* Rotatable Prism with open top facing upwards */}
                <RotatablePrism dimensions={[1, 1.5, 1, 1.5]} height={2} />
            </Canvas>
        </View>
    );
}