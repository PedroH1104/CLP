import { format } from "date-fns"
import ptBR from 'date-fns/locale/pt-BR' // Importar localização para português do Brasil
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export default function DatePickerDemo({date, setDate}:any) { 
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[230px] justify-start text-left font-medium py-3",
            !date && "text-muted-foreground font-medium"
          )}
        >
          <CalendarIcon className="mr-2 h-5 w-5 " />
          {date ? format(date, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>} {/* Utilizando a localização ptBR */}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
          className="w-[280px] h-[300px]"
        />
      </PopoverContent>
    </Popover>
  )
}