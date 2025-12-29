import Footer from "../Footer";
import NavBar from "../NavBar";
import { useLocation } from "react-router-dom";
import SearchNavBar from "../SearchNavBar";

const index = ({ children }) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const location = useLocation();

  return (
    <>
      {location.pathname == "/" || location.pathname == "/forgot-pass" ? (
        <>
          <main>{children}</main>
        </>
      ) : (
        <>
          <NavBar />
          <main>{children}</main>
          <Footer />
        </>
      )}
    </>
  );
};

export default index;
