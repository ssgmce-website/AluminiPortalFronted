import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppRoutes } from './routes/AppRoutes';
import { ActiveEventPopup } from './components/ActiveEventPopup';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <ActiveEventPopup />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
