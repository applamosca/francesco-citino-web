import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const GalleryPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/#galleria", { replace: true });
  }, [navigate]);

  return null;
};

export default GalleryPage;
