import 'bootstrap/dist/css/bootstrap.min.css';

import { useEffect, useRef, useState } from 'react';
import Calendar from './Components/Calendar';

import LoginModal from './Components/Modals/LoginModal';
import RegisterModal from './Components/Modals/RegisterModal';
import MessageModal from './Components/Modals/MessageModal';
import InformationModal from './Components/Modals/InformationModal';
import NavbarComponent from './Components/Navbar';

function App() {
  const [loginModalState, setLoginModalState] = useState(false);

  function showLoginModal() {
    setLoginModalState(true);
  }
  function hideLoginModal() {
    setLoginModalState(false);
  }

  const [registerModalState, setRegisterModalState] = useState(false);

  function showRegisterModal() {
    setRegisterModalState(true);
  }
  function hideRegisterModal() {
    setRegisterModalState(false);
  }

  const [messageModalState, setMessageModalState] = useState(false);
  const [messageModalMessage, setMessageModalMessage] = useState('');

  function showMessageModal(message) {
    setMessageModalMessage(message);
    setMessageModalState(true);
  }

  function hideMessageModal() {
    setMessageModalState(false);
  }

  const [informationModalState, setInformationModalState] = useState(false);
  const [informationModalReservation, setInformationModalReservation] =
    useState({
      start: new Date(),
      end: new Date(),
      title: '',
      uuid: '',
    });

  function showInformationModal(message) {
    setInformationModalReservation(message);
    setInformationModalState(true);
  }

  function hideInformationModal() {
    setInformationModalState(false);
  }

  const [userInformation, setUserInformation] = useState({
    uuid: '',
    username: '',
    first_name: '',
    last_name: '',
  });

  async function fetchUserInformation() {
    const result = await fetch('http://127.0.0.1:5000/user/@me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }).then(result => result.json());

    if (!result.status) return showMessageModal(result.message);

    setUserInformation({
      uuid: result.uuid,
      username: result.username,
      first_name: result.first_name,
      last_name: result.last_name,
    });
  }

  useEffect(() => {
    if (localStorage.getItem('token') === null) return;
    fetchUserInformation();
  }, []);

  function setToken(token) {
    localStorage.setItem('token', token);
    fetchUserInformation();
  }

  return (
    <div>
      <LoginModal
        setToken={setToken}
        loginModalState={loginModalState}
        hideLoginModal={hideLoginModal}
        showRegisterModal={showRegisterModal}
        showMessageModal={showMessageModal}
      />
      <RegisterModal
        setToken={setToken}
        registerModalState={registerModalState}
        hideRegisterModal={hideRegisterModal}
        showLoginModal={showLoginModal}
        showMessageModal={showMessageModal}
      />
      <MessageModal
        messageModalState={messageModalState}
        messageModalMessage={messageModalMessage}
        hideMessageModal={hideMessageModal}
      />
      <InformationModal
        informationModalState={informationModalState}
        informationModalReservation={informationModalReservation}
        showMessageModal={showMessageModal}
        hideInformationModal={hideInformationModal}
        userInformation={userInformation}
      />
      <NavbarComponent
        userInformation={userInformation}
      />
      <Calendar
        token={localStorage.getItem('token')}
        showLoginModal={showLoginModal}
        showMessageModal={showMessageModal}
        showInformationModal={showInformationModal}
      />
    </div>
  );
}

export default App;
