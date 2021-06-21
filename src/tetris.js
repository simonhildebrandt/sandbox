import React, { useState, useEffect, useCallback, useReducer } from 'react';
import styled from 'styled-components';
import produce from "immer";


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

function codeMapping(code, mapping, dfault) {
  for (let [key, value] of mapping) {
    if (key.includes(code)) return value;
  }
  return dfault;
}

const randomItem = items => items[Math.floor(Math.random()*items.length)];

function build(state) {
  const {type, position, rotation} = state;

  if (!type) return [];

  const {colour, layouts} = tiles[type];
  const layout = layouts[rotation];

  return layout.map(t => ([ translate(position, t), {colour} ]));
}

const allBlocks = state => [...state.blocks, ...build(state)];

const SCALE = 10;
const initialState = {
  type: null,
  position: null,
  rotation: 0,
  blocks: [[[0, 0], {colour: colours[2]}]],
  newBlock: true,
  finished: false,
  clearing: null
};

const stateUpdater = produce((draft, action) => {
  console.log({draft, action})
  switch (action.type) {
    case 'new_block':
      draft.newBlock = false;
      draft.type = randomItem(Object.keys(tiles));
      draft.position = [5, 0];
      draft.rotation = 0;
    case 'advance':
      if (draft.position) draft.position = translate(draft.position, [0, 1]);
      break;
    case 'move':
      if (draft.position) draft.position = translate(draft.position, action.offset);
      break;
      case 'rotate':
        if (draft.position) draft.rotation = (draft.rotation + action.rotate + 4) % 4;
      break;
    case 'change_type':
      const types = Object.keys(tiles);
      draft.type = types[(types.indexOf(draft.type) + action.offset + types.length) % types.length];
      break;
    
    default:
      throw new Error("Invalid update type");
  }

  return draft;
});

const getPositions = blocks => blocks.map(b => b[0]);
const has = (list, [x1,y1]) => list.find(([x2, y2]) => (x1 == x2) && (y1 == y2))

function validPositions(blocks) {
  return getPositions(blocks).every(([x, y]) => {
    return (x >= 0) && (x < 10) && (y >= 0) && (y < 20) 
  })
}

function noOverlaps(newBlocks, blocks) {
  return !getPositions(newBlocks).some(newBlock => has(blocks, newBlock));
}

function ValidState(state) {
  const newBlocks = build(state);
  const blocks = getPositions(state.blocks);

  return validPositions(newBlocks) && noOverlaps(newBlocks, blocks);
}

function stateReducer(state, action) {
  const fork = stateUpdater(state, action);
  let newState;
  if (ValidState(fork)) {
    newState = fork;
  } else {
    newState = state;

    if (action.type == 'new_block') {
      newState = produce(newState, draft => {
        draft.finished = true;
      });
    }

    if (action.type == 'advance') {
      newState = produce(newState, draft => {
        const b = allBlocks(newState);
        draft.blocks = b;
        draft.newBlock = true;
      });
    }
  }

  return newState;
};


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
  const [gameState, dispatch] = useReducer(stateReducer, initialState);
  const { type, newBlock, finished, clearing } = gameState;
  console.log({gameState});

  // useEffect(() => {
  //   if (clearing) dispatch({type: 'new_block'})
  // }, [clearing]);

  // useEffect(() => {
  //   if (clearing) dispatch({type: 'new_block'})
  // }, [newBlock]);

  useEffect(() => {
    if (newBlock) dispatch({type: 'new_block'})
  }, [newBlock]);

  const [showControls, setShowControls] = useState(false);
  const [advance, setAdvance] = useState(false);
  useEffect(() => {
    let cancelId;
    if (advance) {
      cancelId = setInterval(() => {
        dispatch({type: 'advance'})
      }, 500);
    } 

    return () => {
      if (cancelId) window.clearInterval(cancelId);
    }
  }, [advance]);

  const display = allBlocks(gameState);

  const handleKeyDown = useCallback(event => {
    if (finished) return;

    const offset = codeMapping(
      event.code, 
      new Map([
        [["KeyW", "ArrowUp"], [0, -1]],
        [["KeyS", "ArrowDown"], [0, 1]],
        [["KeyA", "ArrowLeft"], [-1, 0]],
        [["KeyD", "ArrowRight"], [1, 0]]
      ]),
      [0, 0]
    );
    const rotate = codeMapping(
      event.code, 
      new Map([
        [["KeyQ"], -1],
        [["KeyE"], 1]
      ]),
      0
    );
    dispatch({type: 'move', offset});
    dispatch({type: 'rotate', rotate});
    //setPosition(p => translate(p, offset));
    //setRotation(r => (r + rotate + 4) % 4);
  });

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    // cleanup this component
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  function changeType(offset) {
    dispatch({type: 'change_type', offset});
  }

  function handleButton(code) { handleKeyDown({code}) }

  return <Container>
    <Controls>
      <span>{ finished && "Finished!"}</span> &nbsp;&nbsp;
      <span><input type="checkbox" checked={advance} onChange={e => setAdvance(a => !a)} /> run</span> &nbsp;&nbsp;
      <span><input type="checkbox" checked={showControls} onChange={e => setShowControls(s => !s)} /> show controls</span> &nbsp;&nbsp;
      <span onClick={() => changeType(-1)}>&lt;</span> {type} <span onClick={() => changeType(1)}>&gt;</span>
    </Controls>
    <Display>
      <svg width="100%" height="100%" viewBox="0 0 100 200"> 
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

        { display.map(([coords, block], i) => (
          <Block key={i} coords={coords} block={block} />
        )) }
      </svg>
    </Display>
    { showControls && <Controls>
      <button onClick={() => handleButton("KeyQ")}>🔄</button>
      <button onClick={() => handleButton("ArrowDown")}>⬇️</button>
      <button onClick={() => handleButton("ArrowLeft")}>⬅️</button>
      <button onClick={() => handleButton("ArrowRight")}>➡️</button>
    </Controls> }
  </Container>
}

export default Tetris;
