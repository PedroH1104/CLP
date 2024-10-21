import { useLocation } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { TbWorldHeart } from "react-icons/tb";
import { GoGear } from "react-icons/go";
import { BsBook } from "react-icons/bs";
import { BiHomeAlt } from "react-icons/bi";

interface Botao {
    url: string,
    nome: string,
    icon: JSX.Element, // Adicione uma propriedade para o ícone
    id: number,
}

const botoes: Botao[] = [
    {
        url: "/logado/inicio",
        nome: "INÍCIO",
        icon: <BiHomeAlt className='text-[36px] text-white' />,
        id: 1,
    },
    {
        url: "/logado/meusLivros",
        nome: "MEUS LIVROS",
        icon: <BsBook className='text-[36px] text-white' />,
        id: 2,
    },
    {
        url: "/logado/social",
        nome: "SOCIAL",
        icon: <TbWorldHeart className='text-[36px] text-white' />,
        id: 3,
    },
    {
        url: "/logado/relatorio",
        nome: "RELATÓRIO",
        icon: <GoGear className='text-[36px] text-white' />,
        id: 4,
    }
];

export default function TabNavigator() {

    const location = useLocation();
    const locationAtual = location.pathname;

    return (
        <aside className='w-[110px] bg-laranjaPadrao h-screen fixed mt-[100px] flex flex-col space-y-[70px] items-center pt-[20px]'>
            {botoes.map((botao) => (
                <NavLink key={botao.id} to={botao.url} className={`flex flex-col items-center justify-center text-center ${botao.url === locationAtual ? 'bg-laranjaClaro' : ''}`}>
                    <div className={` w-[110px] flex flex-col items-center justify-center text-center px-[20px] py-[15px] ${botao.url === locationAtual ? ' border-r-[6px] border-azulPadrao' : ''}`}>
                        {botao.icon}
                        <p className="text-white text-[12px] font-bold mt-2">{botao.nome}</p>
                    </div>
                </NavLink>
            ))}
        </aside>
    )
}



