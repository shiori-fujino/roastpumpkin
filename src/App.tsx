import { HashRouter, Routes, Route } from 'react-router-dom';
import Homepage from './Homepage';
import ModelProfilePage from './ModelProfilePage';
import RatesPage from './RatesPage';
import ContactPage from './ContactPage';
import ScrollToTop from './components/ScrollToTop';
import NewsPage from './NewsPage';
import NewsPostPage from './NewsPostPage';

function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/news/:id" element={<NewsPostPage />} />
        <Route path="/rates" element={<RatesPage />} />
        <Route path="/" element={<Homepage />} />
        <Route path="/models/:name" element={<ModelProfilePage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;