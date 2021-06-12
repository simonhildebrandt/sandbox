import React, { useState, useEffect } from 'react';
import styled from 'styled-components';


const Container = styled.div`
  display: flex;
  flex: 0 1 auto;
  overflow: hidden;
  flex-direction: column;
`
const Controls = styled.div`
  font-family: sans-serif;
  text-align: center;
  cursor: pointer;
`
const Display = styled.div`
  flex: 0 1 auto;
  overflow: hidden;
`

const colours = ["#ac92eb", "#4fc1e8", "#a0d568", "#ffce54", "#ed5564"];

const tiles = {
  square: {
    colour: colours[0],
    layouts: [ 
      [[0, 0], [1, 0], [1, 1], [0, 1]],
      [[0, 0], [0, 1], [-1, 1], [-1, 0]],
      [[0, 0], [-1, 0], [-1, -1], [0, -1]],
      [[0, 0], [0, -1], [1, -1], [1, 0]]
    ]
  },
  line: {
    colour: colours[1],
    layouts: [ 
      [[0, -1], [0, 0], [0, 1], [0, 2]],
      [[-1, 0], [0, 0], [1, 0], [2, 0]],
      [[1, -1], [1, 0], [1, 1], [1, 2]],
      [[-1, 1], [0, 1], [1, 1], [2, 1]],
    ]
  },
  right: {
    colour: colours[2],
    layouts: [ 
      [[-1, -1], [-1, 0], [0, 0], [1, 0]],
      [[1, -1], [0, -1], [0, 0], [0, 1]],
      [[1, 1], [1, 0], [0, 0], [-1, 0]],
      [[-1, 1], [0, 1], [0, 0], [0, -1]],
    ]
  },
  left: {
    colour: colours[3],
    layouts: [ 
      [[1, -1], [-1, 0], [0, 0], [1, 0]],
      [[1, 1], [0, -1], [0, 0], [0, 1]],
      [[-1, 1], [1, 0], [0, 0], [-1, 0]],
      [[-1, -1], [0, 1], [0, 0], [0, -1]],
    ]
  },
  tee: {
    colour: colours[4],
    layouts: [ 
      [[-1, 0], [0, 0], [1, 0], [0, -1]],
      [[0, -1], [0, 0], [0, 1], [1, 0]],
      [[1, 0], [0, 0], [-1, 0], [0, 1]],
      [[0, -1], [0, 0], [0, 1], [-1, 0]],
    ]
  },
}


const translate = ([x1, y1], [x2, y2]) => [x1 + x2, y1 + y2];

const randomItem = items => items[Math.floor(Math.random()*items.length)];

function build(active) {
  const {type, position, rotation} = active;
  const {colour, layouts} = tiles[type];
  const layout = layouts[rotation];

  return layout.map(t => ([
    translate(position, t),
    {colour}
  ]));
}




const blocks = new Map();

const SCALE = 10;

function transform([x, y]) {
  return `translate(${x * SCALE}, ${y * SCALE})`
}

function Block({coords, block}) {
  const {colour} = block;
  return <g transform={transform(coords)}>
    <rect fill={colour} width="10" height="10"></rect>
    <rect x="2" y="2" opacity="0.5" fill="#ffffff" width="6" height="6"></rect>
  </g>
}

function Tetris() {
  const [blocks, setBlocks] = useState(() =>new Map([[[0, 0], {colour: colours[2]}]]));
  const [type, setType] = useState((randomItem(Object.keys(tiles))));
  const [position, setPosition] = useState([2,2]);
  const [rotation, setRotation] = useState(0);
  
  const active = {type, position, rotation};

  const display = new Map([...blocks, ...build(active)]);

  function mutate(e) {
    e.preventDefault();
    setRotation(r => (r + 1) % 4);
  }

  function changeType(offset) {
    const types = Object.keys(tiles);
    setType(t => types[(types.indexOf(t) + offset + types.length) % types.length]);
  }

  return <Container>
    <Controls>
      <span onClick={() => changeType(-1)}>&lt;</span> {type} <span onClick={() => changeType(1)}>&gt;</span>
    </Controls>
    <Display>
      <svg width="100%" height="100%" viewBox="0 0 100 200" onClick={mutate}> 
      <defs>
          <pattern
            id="Pattern" x={0} y={0} width={10} height={10}
            patternUnits="userSpaceOnUse"
            shapeRendering="geometricPrecision"
          >
            <rect fill="#eeeeee" x="2" y="2" width="6" height="6" />
          </pattern>
        </defs>
        <rect fill="url(#Pattern)" width="100%" height="100%" />

        { Array.from(display).map(([coords, block], i) => (
          <Block key={i} coords={coords} block={block} />
        )) }
      </svg>
    </Display>
  </Container>
}

export default Tetris;