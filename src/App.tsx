import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "./Homepage";
import ModelProfilePage from "./ModelProfilePage";
import RatesPage from "./RatesPage";
import ContactPage from "./ContactPage";
import ScrollToTop from "./components/ScrollToTop";
import NewsPage from "./NewsPage";
import NewsPostPage from "./NewsPostPage";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
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
