import xs from 'xstream';
import { div, button, h1 } from '@cycle/dom';

function Quotes( API ) {
  
  function render(text, loggedIn) {
    let quoteButton;
    if(loggedIn){
      quoteButton = button('.btn-get-quote-protected .pure-button','get a protected quote')
    } else {
      quoteButton = button('.btn-get-quote .pure-button','get a quote')
    }

    return div('.quote-container', [
            h1(text),
            quoteButton
          ]);
  }
  
  function intent( sources ) {
    // construct the event for the click 
    const click$ = sources.DOM
      .select('.btn-get-quote').events('click')
      .map(ev => ( API.requestRandom ) );

    const clickProtected$ = sources.DOM
      .select('.btn-get-quote-protected').events('click')
      .map(ev => ( API.requestRandomProtected ) );

    const autoQuote$ = xs.of( API.requestRandom );

    // defining the url observer
    // const request$ = xs.of( $state.userRequest );
    const request$ = xs.merge(click$, clickProtected$, autoQuote$);

    // response event which filter by the category
    const responseRandom$ = sources.HTTP
      .select('random-quote').flatten();

    // response event which filter by the category
    const responseRandomProtected$ = sources.HTTP
      .select('random-quote-protected').flatten();

    const response$ = xs.merge(responseRandom$, responseRandomProtected$);


    return { request$: request$ , response$: response$ };
  }
  
  
  return {
    render,
    intent
  };
}

export default Quotes;