import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { Configurator } from './components/Configurator';

export const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Configurator />
    </Provider>
  );
};

export default App;
