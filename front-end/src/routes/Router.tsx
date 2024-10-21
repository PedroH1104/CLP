import Inicio from "@/features/inicio";
import MeusLivros from "@/features/meusLivros";
import Relatorio from "@/features/relatorio";
import Social from "@/features/social";

export const router = [
  {
    path: "/logado/inicio",
    element: <Inicio/>,
  },
  {
    path: "/logado/meusLivros",
    element: <MeusLivros/>
  },
  {
    path: "/logado/social",
    element: <Social/>
  },
  {
    path: "/logado/relatorio",
    element: <Relatorio/>
  }    
];
