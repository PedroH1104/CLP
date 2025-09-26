import { formatDistance } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatDistanceToNowInPortuguese = (date: Date | string) => {    
    const distance = formatDistance(new Date(date), new Date(), { locale: ptBR });

    return distance
        .replace(/cerca de /, '') // Remove "cerca de"
        .replace(/(\d+) segundos?/, (_, n) => `${n} segundo${n === "1" ? "" : "s"}`)
        .replace(/(\d+) minutos?/, (_, n) => `${n} minuto${n === "1" ? "" : "s"}`)
        .replace(/(\d+) horas?/, (_, n) => `${n} hora${n === "1" ? "" : "s"}`)
        .replace(/(\d+) dias?/, (_, n) => `${n} dia${n === "1" ? "" : "s"}`)
        .replace(/(\d+) meses?/, (_, n) => `${n} mês${n === "1" ? "" : "es"}`) // "mês" no singular
        .replace(/(\d+) anos?/, (_, n) => `${n} ano${n === "1" ? "" : "s"}`);
};