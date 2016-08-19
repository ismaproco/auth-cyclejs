/* required modules */

import Cycle from '@cycle/xstream-run';
import xs from 'xstream';
import debounce from 'xstream/extra/debounce';
import {div, label, input, h1, hr, ul, li, a, makeDOMDriver} from '@cycle/dom';
import {makeHTTPDriver} from '@cycle/http';


function main(sources) {
  // defining the url observer
  // cycle-dom uses the GET method by default
  const _url = 'http://localhost:3001/api/random-quote'

  //create observable for the request using the static url
  const request$ = xs.of({
    url: _url,
    category: 'random-quote'
  });

  // response event which filter by the category defined in the request
  const response$ = sources.HTTP
    .select('random-quote')
    .flatten();

  // updates the virtual dom when the response listener is executed
  const vdom$ = response$
    .map(res => res.text) // this is the response text body
    .startWith('Loading...') // default value
    .map(text =>
      div('.container', [
        h1(text)
      ]) // return the virtual dom
    );

  // return the virtual dom and the request to be processed by the Cycle.run
  return {
    DOM: vdom$,
    HTTP: request$
  };
}

// application runner
Cycle.run(main, {
  DOM: makeDOMDriver('#main-container'),
  HTTP: makeHTTPDriver()
});