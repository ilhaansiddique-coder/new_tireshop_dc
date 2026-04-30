/* global React, DCStub */

function ServicePage({ stubData }) {
  return React.createElement(window.DCStub, stubData);
}

if (typeof window !== 'undefined') {
  window.ServicePage = ServicePage;
}
