import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import ReservationContextProvider from './Contexts/ReservationContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <ReservationContextProvider>
    <App />
  </ReservationContextProvider>
);
