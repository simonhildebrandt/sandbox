import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

import Navigo from 'navigo';

import styled from 'styled-components';

import Spiral from './spiral';
import Isometric from './isometric';


const Floating = styled.div`
  padding: 1em;
`

const Link = styled.div`
  display: inline-block;
  color: blue;
  cursor: pointer;
`

const Page = styled.div`
  padding: 1em;
  font-size: 20pt;
  font-family: 'Merriweather', serif;`

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`

const router = new Navigo('/', { hash: true });


function Explain() {
  return <Page>
    <p>
      A growing collection of web experiments
      by <a href="http://simonhildebrandt.com">Simon Hildebrandt</a>.
    </p>
  </Page>
}

function App() {
  const [route, setRoute] = useState("default");

  function navigate(route) {
    if (route.startsWith("http")) return window.location = route;
    router.navigate(route);
  }

  useEffect(() => {
    router.on({
      '/': () => {
        setRoute("default");
      },
      '/:key': ({ data: { key } }) => {
        setRoute(key);
      }
    })
      .resolve();
  }, []);

  function view() {
    switch (route) {
      case "spiral":
        return <Spiral />
      case "isometric":
        return <Isometric />
      case "default":
      default:
        return <Explain />
    }
  }

  return <Container>
    <Floating>
      <Link onClick={() => navigate("/")}>Main</Link> | <Link onClick={() => navigate("/spiral")}>
        Spiral</Link> <Link onClick={() => navigate("https://github.com/simonhildebrandt/sandbox/blob/master/src/spiral.js")}>(Code)</Link> | <Link onClick={() => navigate("/isometric")}>Isometric</Link> <Link onClick={() => navigate("https://github.com/simonhildebrandt/sandbox/blob/master/src/isometric.js")}>(Code)</Link>
    </Floating>
    {view()}
  </Container>;
}

ReactDOM.render(<App />, document.getElementById('app'));
