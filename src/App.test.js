import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

function renderApp() {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
}

it('renders without crashing', () => {
  renderApp();
});

it('renders without crashing with appState with machineHireOn not set', () => {
  localStorage.setItem('appState', '{"configuration":{"id":null,"isDefault":true,"name":"Default","concreteRates":[{"key":0,"limit":10,"rate":20},{"key":1,"limit":20,"rate":18},{"key":2,"limit":40,"rate":15},{"key":3,"limit":60,"rate":10},{"key":4,"limit":120,"rate":8},{"key":5,"limit":null,"rate":5}],"slabThickness125":1,"meshThicknessSL82":2,"pumpOn":25,"pumpDouble":50,"polyMembraneOn":2,"rock":[{"key":0,"limit":100,"rate":10},{"key":1,"limit":null,"rate":5}],"taxRate":10},"width":"10","length":"10","slabThickness":100,"meshThickness":"SL72","pump":"double","pumpForce":null,"polyMembrane":"on","rock":"10","editConfiguration":false}');

  renderApp();
});