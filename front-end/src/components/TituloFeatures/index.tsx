
import React from 'react';

interface TitutoFeaturesProps {
    src?: string;
    icon?: React.ReactNode;
    text: string;
}

const TituloFeatures: React.FC<TitutoFeaturesProps> = ({ src, icon, text }) => {
    return (
        <div className='flex items-center mb-[35px]'>
            {src ? (
                <img src={src} alt='ícone' className='h-[28px] w-[28px]' />
            ) : (
                icon
            )}
            <h1 className='font-bold text-[32px] text-azulPadrao ml-[8px]'>{text}</h1>
        </div>
    );
};

export default TituloFeatures;