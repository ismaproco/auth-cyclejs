import Cycle from '@cycle/xstream-run';
import xs from 'xstream';
import debounce from 'xstream/extra/debounce';
import {div, label, input, h1, hr, ul, li, a, makeDOMDriver} from '@cycle/dom';
import {makeHTTPDriver} from '@cycle/http';


function main(sources) {
  // defining the url observer
  // cycle-dom uses the GET method by default
  const _url = 'http://localhost:3001/api/random-quote'
  const request$ = xs.of({
    url: _url,
    category: 'random-quote'
  });

  // response event which filter by the category
  const response$ = sources.HTTP
    .select('random-quote')
    .flatten();

  //updates the virtual dom with the reponse
  const vdom$ = response$
    .map(res => res.text) // this is the response text body
    .startWith('Loading...')
    .map(text =>
      div('.container', [
        h1(text)
      ])
    );

  return {
    DOM: vdom$,
    HTTP: request$
  };
}

Cycle.run(main, {
  DOM: makeDOMDriver('#main-container'),
  HTTP: makeHTTPDriver()
}); 