'use strict';
import * as twgl from 'twgl-base.js';
import { M3 } from './2d-lib.js';
import GUI from 'lil-gui';

const vsCode = `#version 300 es
in vec2 a_posicion;

uniform vec2 u_resolucion;
uniform mat3 u_transformaciones;

void main() {
    vec2 posicion = (u_transformaciones * vec3(a_posicion, 1)).xy;
    vec2 ceroAUno = posicion / u_resolucion;
    vec2 ceroADos = ceroAUno * 2.0;
    vec2 espacioRecorte = ceroADos - 1.0;
    gl_Position = vec4(espacioRecorte * vec2(1, -1), 0, 1);
}
`;

const fsCode = `#version 300 es
precision highp float;

uniform vec4 u_color;

out vec4 colorSalida;

void main() {
    colorSalida = u_color;
}
`;

const objetos = {
    circulo: {
        transformaciones: {
            traslacion: {
                x: 600,
                y: 330,
                z: 0,
            },
            rotacion: {
                x: 0,
                y: 0,
                z: 0,
            },
            escala: {
                x: 1,
                y: 1,
                z: 1,
            }
        },
        color: [.0392, .7294, .7098, 1],
    },
    pivote: {
        transformaciones: {
            traslacion: {
                x: 600,
                y: 330,
                z: 0,
            },
            rotacion: {
                x: 0,
                y: 0,
                z: 0,
            },
            escala: {
                x: 1,
                y: 1,
                z: 1,
            }
        },
        color: [1, 0.8, 0, 1],
    },
    ojoIzquierdo: {
        transformaciones: {
            traslacion: {
                x: -60,
                y: -50,
                z: 0,
            },
            rotacion: {
                x: 0,
                y: 0,
                z: 0
            },
            escala: {
                x: 1,
                y: 1,
                z: 1
            }
        },
        color: [0, 0, 0, 1],
    },
    ojoDerecho: {
        transformaciones: {
            traslacion: {
                x: 60,
                y: -50,
                z: 0,
            },
            rotacion: {
                x: 0,
                y: 0,
                z: 0
            },
            escala: {
                x: 1,
                y: 1,
                z: 1
            }
        },
        color: [0, 0, 0, 1],
    },
    boca: {
        transformaciones: {
            traslacion: {
                x: 0,
                y: 60,
                z: 0,
            },
            rotacion: {
                x: 0,
                y: 0,
                z: 100
            },
            escala: {
                x: 1,
                y: 1,
                z: 1
            }
        },
        color: [0, 0, 0, 1],
    },
};

function main() {
    const lienzo = document.querySelector('canvas');
    const contexto = lienzo.getContext('webgl2');
    twgl.resizeCanvasToDisplaySize(contexto.canvas);
    contexto.viewport(0, 0, contexto.canvas.width, contexto.canvas.height);

    setupInterface(contexto);

    const programInfo = twgl.createProgramInfo(contexto, [vsCode, fsCode]);

    const ladosCirculo = 50;
    const centroXCirculo = 0;
    const centroYCirculo = 0;
    const radioCirculo = 100;

    const arraysCirculo = generateData(ladosCirculo, centroXCirculo, centroYCirculo, radioCirculo);
    const bufferInfoCirculo = twgl.createBufferInfoFromArrays(contexto, arraysCirculo);
    const vaoCirculo = twgl.createVAOFromBufferInfo(contexto, programInfo, bufferInfoCirculo);

    const ladosPivote = 4;
    const centroXPivote = 0;
    const centroYPivote = 0;
    const radioPivote = 10;

    const arraysPivote = generateData(ladosPivote, centroXPivote, centroYPivote, radioPivote);
    const bufferInfoPivote = twgl.createBufferInfoFromArrays(contexto, arraysPivote);
    const vaoPivote = twgl.createVAOFromBufferInfo(contexto, programInfo, bufferInfoPivote);

    const ladosOjo = 20;
    const centroXOjo = 0;
    const centroYOjo = 0;
    const radioOjo = 20;

    const arraysOjoIzquierdo = generateData(ladosOjo, centroXOjo, centroYOjo, radioOjo);
    const bufferInfoOjoIzquierdo = twgl.createBufferInfoFromArrays(contexto, arraysOjoIzquierdo);
    const vaoOjoIzquierdo = twgl.createVAOFromBufferInfo(contexto, programInfo, bufferInfoOjoIzquierdo);

    const arraysOjoDerecho = generateData(ladosOjo, centroXOjo, centroYOjo, radioOjo);
    const bufferInfoOjoDerecho = twgl.createBufferInfoFromArrays(contexto, arraysOjoDerecho);
    const vaoOjoDerecho = twgl.createVAOFromBufferInfo(contexto, programInfo, bufferInfoOjoDerecho);

    const ladosBoca = 3;
    const centroXBoca = 0;
    const centroYBoca = 0;
    const radioBoca = 30;

    const arraysBoca = generateData(ladosBoca, centroXBoca, centroYBoca, radioBoca);
    const bufferInfoBoca = twgl.createBufferInfoFromArrays(contexto, arraysBoca);
    const vaoBoca = twgl.createVAOFromBufferInfo(contexto, programInfo, bufferInfoBoca);

    drawScene(contexto, [
        { vao: vaoCirculo, informacionBuffer: bufferInfoCirculo, claveObjeto: 'circulo' },
        { vao: vaoPivote, informacionBuffer: bufferInfoPivote, claveObjeto: 'pivote' },
        { vao: vaoOjoIzquierdo, informacionBuffer: bufferInfoOjoIzquierdo, claveObjeto: 'ojoIzquierdo' },
        { vao: vaoOjoDerecho, informacionBuffer: bufferInfoOjoDerecho, claveObjeto: 'ojoDerecho' },
        { vao: vaoBoca, informacionBuffer: bufferInfoBoca, claveObjeto: 'boca' },
    ], programInfo);
}

function drawScene(contexto, objetosRender, programInfo) {
    contexto.useProgram(programInfo.program);

    for (const objetoRender of objetosRender) {
        const objeto = objetos[objetoRender.claveObjeto];
        let matrizTransformaciones = M3.identity();

        if (['circulo', 'ojoIzquierdo', 'ojoDerecho', 'boca'].includes(objetoRender.claveObjeto)) {
            const traslacion = [objeto.transformaciones.traslacion.x, objeto.transformaciones.traslacion.y];
            const anguloRadianes = objeto.transformaciones.rotacion.z;
            const escala = [objeto.transformaciones.escala.x, objeto.transformaciones.escala.y];
            const posicionPivote = [objetos.pivote.transformaciones.traslacion.x, objetos.pivote.transformaciones.traslacion.y];

            if (objetoRender.claveObjeto !== 'circulo') {
                const posicionCirculo = [objetos.circulo.transformaciones.traslacion.x, objetos.circulo.transformaciones.traslacion.y];
                const rotacionCirculo = objetos.circulo.transformaciones.rotacion.z;
                const escalaCirculo = [objetos.circulo.transformaciones.escala.x, objetos.circulo.transformaciones.escala.y];

                const matrizEscala = M3.scale(escala);
                const matrizRotacion = M3.rotation(anguloRadianes);
                const matrizTraslacion = M3.translation(traslacion);

                matrizTransformaciones = M3.multiply(matrizEscala, matrizTransformaciones);
                matrizTransformaciones = M3.multiply(matrizRotacion, matrizTransformaciones);
                matrizTransformaciones = M3.multiply(matrizTraslacion, matrizTransformaciones);

                const matrizEscalaPadre = M3.scale(escalaCirculo);
                const matrizRotacionPadre = M3.rotation(rotacionCirculo);
                const matrizTraslacionObjeto = M3.translation([posicionCirculo[0] - posicionPivote[0], posicionCirculo[1] - posicionPivote[1]]);
                const matrizTraslacionRegreso = M3.translation(posicionPivote);

                matrizTransformaciones = M3.multiply(matrizEscalaPadre, matrizTransformaciones);
                matrizTransformaciones = M3.multiply(matrizTraslacionObjeto, matrizTransformaciones);
                matrizTransformaciones = M3.multiply(matrizRotacionPadre, matrizTransformaciones);
                matrizTransformaciones = M3.multiply(matrizTraslacionRegreso, matrizTransformaciones);
            } else {
                const matrizEscala = M3.scale(escala);
                const matrizRotacion = M3.rotation(anguloRadianes);
                const matrizTraslacionObjeto = M3.translation([traslacion[0] - posicionPivote[0], traslacion[1] - posicionPivote[1]]);
                const matrizTraslacionRegreso = M3.translation(posicionPivote);

                matrizTransformaciones = M3.multiply(matrizEscala, matrizTransformaciones);
                matrizTransformaciones = M3.multiply(matrizTraslacionObjeto, matrizTransformaciones);
                matrizTransformaciones = M3.multiply(matrizRotacion, matrizTransformaciones);
                matrizTransformaciones = M3.multiply(matrizTraslacionRegreso, matrizTransformaciones);
            }
        } else {
            const traslacion = [objeto.transformaciones.traslacion.x, objeto.transformaciones.traslacion.y];
            const anguloRadianes = objeto.transformaciones.rotacion.z;
            const escala = [objeto.transformaciones.escala.x, objeto.transformaciones.escala.y];

            const matrizEscala = M3.scale(escala);
            const matrizRotacion = M3.rotation(anguloRadianes);
            const matrizTraslacion = M3.translation(traslacion);

            matrizTransformaciones = M3.multiply(matrizEscala, matrizTransformaciones);
            matrizTransformaciones = M3.multiply(matrizRotacion, matrizTransformaciones);
            matrizTransformaciones = M3.multiply(matrizTraslacion, matrizTransformaciones);
        }

        const uniformes = {
            u_resolucion: [contexto.canvas.width, contexto.canvas.height],
            u_transformaciones: matrizTransformaciones,
            u_color: objeto.color,
        };

        twgl.setUniforms(programInfo, uniformes);
        contexto.bindVertexArray(objetoRender.vao);
        twgl.drawBufferInfo(contexto, objetoRender.informacionBuffer);
    }

    requestAnimationFrame(() => drawScene(contexto, objetosRender, programInfo));
}

function setupInterface(contexto) {
    const interfaz = new GUI();

    const carpetaCaraFeliz = interfaz.addFolder('Cara Feliz');

    const carpetaTraslacionCara = carpetaCaraFeliz.addFolder('Traslacion');
    carpetaTraslacionCara.add(objetos.circulo.transformaciones.traslacion, 'x', 0, contexto.canvas.width);
    carpetaTraslacionCara.add(objetos.circulo.transformaciones.traslacion, 'y', 0, contexto.canvas.height);

    const carpetaRotacionCara = carpetaCaraFeliz.addFolder('Rotacion');
    carpetaRotacionCara.add(objetos.circulo.transformaciones.rotacion, 'z', 0, Math.PI * 2);

    const carpetaEscalaCara = carpetaCaraFeliz.addFolder('Escala');
    carpetaEscalaCara.add(objetos.circulo.transformaciones.escala, 'x', -10, 10);
    carpetaEscalaCara.add(objetos.circulo.transformaciones.escala, 'y', -10, 10);

    carpetaCaraFeliz.addColor(objetos.circulo, 'color');

    const carpetaPivote = interfaz.addFolder('Pivote');

    const carpetaTraslacionPivote = carpetaPivote.addFolder('Traslacion');
    carpetaTraslacionPivote.add(objetos.pivote.transformaciones.traslacion, 'x', 0, contexto.canvas.width);
    carpetaTraslacionPivote.add(objetos.pivote.transformaciones.traslacion, 'y', 0, contexto.canvas.height);

    carpetaPivote.addColor(objetos.pivote, 'color');
}

function generateData(lados, centroX, centroY, radio) {
    const arrays = {
        a_posicion: { numComponents: 2, data: [] },
        a_color: { numComponents: 4, data: [] },
        indices: { numComponents: 3, data: [] }
    };

    arrays.a_posicion.data.push(centroX);
    arrays.a_posicion.data.push(centroY);
    arrays.a_color.data.push(1);
    arrays.a_color.data.push(1);
    arrays.a_color.data.push(1);
    arrays.a_color.data.push(1);

    const pasoAngulo = 2 * Math.PI / lados;

    for (let index = 0; index < lados; index++) {
        const angulo = pasoAngulo * index;

        const coordenadaX = centroX + Math.cos(angulo) * radio;
        const coordenadaY = centroY + Math.sin(angulo) * radio;
        arrays.a_posicion.data.push(coordenadaX);
        arrays.a_posicion.data.push(coordenadaY);

        arrays.a_color.data.push(Math.random());
        arrays.a_color.data.push(Math.random());
        arrays.a_color.data.push(Math.random());
        arrays.a_color.data.push(1);

        arrays.indices.data.push(0);
        arrays.indices.data.push(index + 1);
        arrays.indices.data.push(((index + 2) <= lados) ? (index + 2) : 1);
    }
    return arrays;
}

main();
