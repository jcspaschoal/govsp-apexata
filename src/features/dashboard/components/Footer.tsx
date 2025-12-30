import React from 'react';
import { useTenant } from '@/context/useTenant';

const Footer: React.FC = () => {
  const { tenant } = useTenant();

  return (
    <footer className="w-full bg-white border-t border-gray-200 mt-auto">

      <div className="bg-black py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
          <a
            href="https://www.saopaulo.sp.gov.br/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Ir para o site do Governo de São Paulo (abre em nova aba)"
          >
            <img
              src={tenant.assets.footerLogo || "https://www.saopaulo.sp.gov.br/barra-govsp/img/logo-rodape-governo-do-estado-sp.png"}
              alt="Site do Governo de São Paulo"
              className="h-10 w-auto"
            />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
