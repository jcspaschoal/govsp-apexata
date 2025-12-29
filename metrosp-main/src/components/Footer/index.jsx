import footerLogo from "../../assets/logo.jpg";

const Footer = () => {
  return (
    <footer className="br-footer p-0 pt-2">
      <div className="container">
        <div className="info d-flex gap-[35%] items-md-end items-center flex-md-row flex-col">
          <div className="justify-self-start align-top bg-slate-50 pt-2 pb-1 px-2 mb-2 rounded">
            <img src={footerLogo} alt="AP EXATA LOGO" width={80} />
          </div>
          <div className="text-down-01 pb-3 tracking-wider justify-self-center">
            Plataforma <span className="font-bold">Metrô SP</span> By{" "}
            <span className="font-bold">AP Exata</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
