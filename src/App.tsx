import { HashRouter, Routes, Route } from 'react-router-dom';
import Homepage from './Homepage';
import ModelProfilePage from './ModelProfilePage';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/models/:name" element={<ModelProfilePage />} />
        {/* Add more routes later for rates, contact, etc. */}
      </Routes>
    </HashRouter>
  );
}

export default App;