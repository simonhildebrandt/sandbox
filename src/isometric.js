import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import useSize from '@react-hook/size'

const Container = styled.div`
  position: relative;
  width: 100%;
  flex-grow: 1;
  flex-shrink: 1;
  overflow: hidden;
`

const Svg = styled.svg`
  background-color: #222222
`

const scale = 64;
const sine60 = 0.866;
const rowHeight = scale * sine60;

function position2RDS(x, y) {
  const row = Math.floor(y / rowHeight);
  const dexter = Math.floor((x + (y / sine60) / 2) / scale);
  const sinister = Math.floor((x - (y / sine60) / 2) / scale);

  return { row, sinister, dexter };
}

function Isometric() {
  const containerRef = useRef(null);
  const [displayWidth, displayHeight] = useSize(containerRef);

  const [rds, setRDS] = useState({ row: 0, dexter: 0, sinister: 0 });

  const offset = scale / 10;

  const rows = Math.floor(displayHeight / rowHeight);

  function mouseMove(e) {
    const { nativeEvent: { offsetX, offsetY } } = e;

    const row = Math.floor(offsetY / rowHeight);
    const dexter = Math.floor((offsetX + (offsetY / sine60) / 2) / scale);
    const sinister = Math.floor((offsetX - (offsetY / sine60) / 2) / scale);
    setRDS(position2RDS(offsetX, offsetY));
  }

  return <Container ref={containerRef} onMouseMove={mouseMove}>
    <Svg width={displayWidth} height={displayHeight}>
      <defs>
        <pattern
          stroke="#555555"
          id="Pattern" x={0} y={0} width={scale} height={2 * scale * sine60}
          patternUnits="userSpaceOnUse"
          shapeRendering="geometricPrecision"
        >
          <g>
            <line x1={offset} y1={0} x2={scale - offset} y2={0} strokeWidth={1} />
            <line x1={0} y1={sine60 * scale} x2={scale / 2 - offset} y2={sine60 * scale} strokeWidth={1} />
            <line x1={scale / 2 + offset} y1={sine60 * scale} x2={scale} y2={sine60 * scale} strokeWidth={1} />
          </g>
          <g transform="rotate(60)">
            <line x1={offset} y1={0} x2={scale - offset} y2={0} strokeWidth={1} />
            <line x1={scale + offset} y1={0} x2={2 * scale - offset} y2={0} strokeWidth={1} />
          </g>
          <g transform={`rotate(-60, ${scale} 0)`}>
            <line x1={offset} y1={0} x2={scale - offset} y2={0} strokeWidth={1} />
            <line x1={-scale + offset} y1={0} x2={-offset} y2={0} strokeWidth={1} />
          </g>
        </pattern>
      </defs>

      <rect fill="url(#Pattern)" width={displayWidth} height={displayHeight} />

      <line x1={0} y1={(rds.row + 0.5) * scale * sine60} x2={displayWidth} y2={(rds.row + 0.5) * scale * sine60} stroke="#ff000044" strokeWidth={scale * sine60} />
      <line x1={(rds.dexter + 0.5) * scale} y1={0} x2={(rds.dexter - (rows / 2) + 0.5) * scale} y2={rows * scale * sine60} stroke="#00ff0044" strokeWidth={scale * sine60} />
      <line x1={(rds.sinister + 0.5) * scale} y1={0} x2={(rds.sinister + (rows / 2) + 0.5) * scale} y2={rows * scale * sine60} stroke="#0000ff44" strokeWidth={scale * sine60} />
    </Svg>
  </Container>
}

export default Isometric;
