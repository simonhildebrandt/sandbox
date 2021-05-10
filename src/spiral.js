import React, { useEffect, useRef, useState, useCallback } from 'react';

import styled from 'styled-components';

import { LoremIpsum } from "lorem-ipsum";


const Container = styled.div`
  position: relative;
  width: 100%;
  flex-grow: 1;
  flex-shrink: 1;
  overflow: hidden;
`

const BlockContainer = styled.div`
  position: absolute;
  width: 0;
  height: 0;
`

const BlockView = styled.div`
  font-size: 10pt;
  width: 200px;
  padding: 10px 0;
  transform: translate(-50%, -50%);
`

const Hint = styled.div`
  color: blue;
  position: absolute;
  left: 20px;
  bottom: 20px;
`

const lorem = new LoremIpsum({
  sentencesPerParagraph: { max: 6, min: 4 },
  wordsPerSentence: { max: 8, min: 4 }
});
const ipsum = [...new Array(100)].map(() => lorem.generateParagraphs(1));


const Block = ({ content, transform, reportSize }) => {
  const domRef = useRef(null);

  useEffect(() => {
    if (domRef.current) {
      reportSize(domRef.current.getBoundingClientRect());
    }
  }, []);

  return <BlockContainer style={{ transform }}>
    <BlockView ref={domRef}>{content}</BlockView>
  </BlockContainer>
}

const Spiral = () => {
  const [sizes, setSizes] = useState(new Array(ipsum.length));
  const [offset, setOffset] = useState(0);
  const [shape, setShape] = useState(null);

  const containerRef = useRef(null);

  const calculateSize = useCallback(() => {
    const { width, height } = containerRef.current.getBoundingClientRect()
    setShape({
      centreX: width / 2,
      centreY: height / 2,
      radius: (Math.min(width, height) / 2) - 100
    });
  });

  useEffect(() => {
    document.addEventListener('wheel', e => {
      setOffset(v => v - e.deltaY);
    });

    window.addEventListener('resize', calculateSize);

    calculateSize();
  }, []);

  function trackSizes(i, size) {
    sizes[i] = size;
    setSizes([...sizes]);
  }

  function calculateTop(i) {
    // Super inefficient - should precalculate and store
    if (i == 0) return offset;

    const box = sizes[i];
    const boxAbove = sizes[i - 1];
    if (!box || !boxAbove) return 0;

    return (box.height / 2) + (boxAbove.height / 2) + calculateTop(i - 1);
  }

  function buildTransform(i) {
    const { centreX, centreY, radius } = shape;

    const up = calculateTop(i);

    let left, top;
    let angle = 0;
    let scale = 1;

    if (up > 0) {
      // sliding
      left = centreX + radius;
      top = centreY + up;
    } else {
      // turning
      // https://mathworld.wolfram.com/LogarithmicSpiral.html
      angle = up / - 300;
      const r = Math.exp(up / (radius * 8)) * radius;
      scale = Math.exp(up / (radius * 8));
      left = centreX + (Math.cos(angle) * r);
      top = centreY - (Math.sin(angle) * r);
    }
    return `translate(${left}px, ${top}px) rotate(-${angle}rad) scale(${scale})`;
  }

  return <Container ref={containerRef}>
    <Hint>(Scroll the text up)</Hint>
    {shape && ipsum.map((p, i) => <Block
      key={i}
      transform={buildTransform(i)}
      content={p}
      reportSize={size => trackSizes(i, size)}
    />)}
  </Container>;
};

export default Spiral;
