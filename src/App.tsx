import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "./Homepage";
import ModelProfilePage from "./ModelProfilePage";
import RatesPage from "./RatesPage";
import ContactPage from "./ContactPage";
import NewsPage from "./NewsPage";
import NewsPostPage from "./NewsPostPage";

import LanguageToggle from "./components/LanguageToggle";

function App() {
  return (
    <BrowserRouter>

      {/* ✅ ONE global toggle, always visible */}
      <LanguageToggle />

      <Routes>
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/news/:id" element={<NewsPostPage />} />
        <Route path="/rates" element={<RatesPage />} />
        <Route path="/" element={<Homepage />} />
        <Route path="/profile/:slug" element={<ModelProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
