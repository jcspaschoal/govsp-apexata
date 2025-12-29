import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <>
      <main className="relative isolate min-h-full">
        <div className="mx-auto max-w-7xl px-6 py-32 text-center sm:py-40 lg:px-8">
          <p className="text-base font-semibold leading-8 text-white">404</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Página não encontrada
          </h1>
          <p className="mt-4 text-base text-white/70 sm:mt-6">
            Desculpe, nós não encontramos a página desejada.
          </p>
          <div className="mt-10 flex justify-center">
            <Link
              to={-1}
              className="text-sm font-semibold leading-7 text-white"
            >
              <span aria-hidden="true">&larr;</span> Voltar para onde eu estava
            </Link>
          </div>
        </div>
      </main>
    </>
  );
};

export default NotFound;
