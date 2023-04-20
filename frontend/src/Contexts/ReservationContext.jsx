// https://stackoverflow.com/questions/74011666/react-context-for-array-passing

import { createContext, useState } from 'react';

export const reservationContext = createContext();

const ReservationContextProvider = ({ children }) => {
  const [reservations, setReservations] = useState([]);

  return (
    <reservationContext.Provider
      value={{
        reservations,
        setReservations,
      }}
    >
      {children}
    </reservationContext.Provider>
  );
};

export default ReservationContextProvider;
