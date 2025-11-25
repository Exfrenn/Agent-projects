import { V3 } from './3d-lib.js';

function crearObj(sides = 8, height = 6.0, base = 1.0, top = 0.8) {
    if (sides < 3 || sides > 36) sides = 8;
    if (height <= 0) height = 6.0;
    if (base <= 0) base = 1.0;
    if (top <= 0) top = 0.8;

    const vertex = [];
    const faces = [];
    const faceNormals = [];

    vertex.push({ x: 0, y: 0, z: 0 });
    vertex.push({ x: 0, y: height, z: 0 });

    for (let i = 0; i < sides; i++) {
        const angle = (2 * Math.PI * i) / sides;

        const xBase = base * Math.cos(angle);
        const zBase = base * Math.sin(angle);
        vertex.push({ x: xBase, y: 0, z: zBase });
        const xTop = top * Math.cos(angle);
        const zTop = top * Math.sin(angle);
        vertex.push({ x: xTop, y: height, z: zTop });
    }

    for (let i = 0; i < sides; i++) {
        const baseIdx1 = 3 + i * 2;
        const topIdx1 = 4 + i * 2;
        const baseIdx2 = 3 + ((i + 1) % sides) * 2;
        const topIdx2 = 4 + ((i + 1) % sides) * 2;

        faces.push([baseIdx1, baseIdx2, 1]);
        faceNormals.push(calculateFaceNormal(vertex, baseIdx1 - 1, baseIdx2 - 1, 0));

        faces.push([topIdx1, 2, topIdx2]);
        faceNormals.push(calculateFaceNormal(vertex, topIdx1 - 1, 1, topIdx2 - 1));

        faces.push([baseIdx1, topIdx1, baseIdx2]);
        faceNormals.push(calculateFaceNormal(vertex, baseIdx1 - 1, topIdx1 - 1, baseIdx2 - 1));

        faces.push([topIdx1, baseIdx2, topIdx2]);
        faceNormals.push(calculateFaceNormal(vertex, topIdx1 - 1, baseIdx2 - 1, topIdx2 - 1));
    }

    let objContent = `# OBJ file building_${sides}_${height}_${base}_${top}.obj\n`;
    objContent += `# ${vertex.length} vertex\n`;

    for (const v of vertex) {
        objContent += `v ${v.x.toFixed(4)} ${v.y.toFixed(4)} ${v.z.toFixed(4)} \n`;
    }

    objContent += `# ${faceNormals.length} normals\n`;
    for (const n of faceNormals) {
        objContent += `vn ${n.x.toFixed(4)} ${n.y.toFixed(4)} ${n.z.toFixed(4)} \n`;
    }
    objContent += `# ${faces.length} faces\n`;
    for (let i = 0; i < faces.length; i++) {
        const face = faces[i];
        const normalIdx = i + 1;
        objContent += `f ${face[0]}//${normalIdx} ${face[1]}//${normalIdx} ${face[2]}//${normalIdx}\n`;
    }

    return objContent;
}


function calculateFaceNormal(vertex, idx0, idx1, idx2) {
    const v0 = vertex[idx0];
    const v1 = vertex[idx1];
    const v2 = vertex[idx2];

    const vec0 = V3.create(v0.x, v0.y, v0.z);
    const vec1 = V3.create(v1.x, v1.y, v1.z);
    const vec2 = V3.create(v2.x, v2.y, v2.z);

    const edge1 = V3.subtract(vec1, vec0);
    const edge2 = V3.subtract(vec2, vec0);

    const faceNormal = V3.cross(edge1, edge2);
    const normalized = V3.normalize(faceNormal);

    return {
        x: normalized[0],
        y: normalized[1],
        z: normalized[2]
    };
}


function main() {
    const args = process.argv.slice(2);
    const sides = args[0] ? parseInt(args[0]) : 8;
    const height = args[1] ? parseFloat(args[1]) : 6.0;
    const base = args[2] ? parseFloat(args[2]) : 1.0;
    const top = args[3] ? parseFloat(args[3]) : 0.8;

    if (sides < 3 || sides > 36) {
        console.error("Error: El número de lados debe estar entre 3 y 36");
        process.exit(1);
    }

    if (height <= 0 || base <= 0 || top <= 0) {
        console.error("Error: La altura y los radios deben ser positivos");
        process.exit(1);
    }

    const objContent = crearObj(sides, height, base, top);
    console.log(objContent);
}

if (typeof process !== "undefined" && process.argv) {
    main();
}

export { crearObj };