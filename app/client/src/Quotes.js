import xs from 'xstream';
import { div, button, h1 } from '@cycle/dom';

function Quotes( ) {
  // rendering methods
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
  

  // build the request and response actions based on the sources
  function intent( sources ) {
    // construct the event for the click 
    const click$ = sources.DOM
      .select('.btn-get-quote').events('click')
      .map(ev => ( sources.Auth.API.requestRandom ) );

    const clickProtected$ = sources.DOM
      .select('.btn-get-quote-protected').events('click')
      .map(ev => ( sources.Auth.API.requestRandomProtected ) );

    // stream to self execute the random request when the page load
    const autoQuote$ = xs.of( sources.Auth.API.requestRandom );

    // merge the request streams
    const request$ = xs.merge(click$, clickProtected$, autoQuote$);

    // response event which filter by the category
    const responseRandom$ = sources.HTTP
      .select('random-quote').flatten();

    // response event which filter by the category
    const responseRandomProtected$ = sources.HTTP
      .select('random-quote-protected').flatten();

    const response$ = xs.merge(responseRandom$, responseRandomProtected$);

    return { request$ , response$ };
  }
  
  
  return {
    render,
    intent
  };
}

export default Quotes;