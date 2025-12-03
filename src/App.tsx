import './App.css';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import SignInSide from './login/SignInSide.tsx';
import MainPage from './app/pages/MainPage.tsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<SignInSide />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
